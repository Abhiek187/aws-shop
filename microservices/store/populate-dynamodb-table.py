import boto3
from botocore.exceptions import ClientError
import json
from math import ceil
from uuid import uuid4

TABLE_NAME = "AWS-Services"
JSON_FILE_NAME = "aws-services.json"
TRANSACT_WRITE_LIMIT = 100


def get_json_file():
    """Parse the AWS services from the JSON file"""
    with open(JSON_FILE_NAME, "r") as aws_services_file:
        return json.load(aws_services_file)


def get_all_services(client):
    """Get all the AWS services currently in the DynamoDB table"""
    try:
        scan_response = client.scan(
            TableName=TABLE_NAME,
            ReturnConsumedCapacity="INDEXES",
        )
        print(f"{scan_response=}")
        return scan_response["Items"]
    except ClientError as error:
        print(f"Client error: {error}")
        return None


def add_services(local_services, services_to_create):
    """Add all AWS services present in the JSON file, but not in DynamoDB"""
    # Transform the JSON file to a supported format for the transact-write-item API
    put_requests = []
    filtered_services = [
        service for service in local_services if service["Name"] in services_to_create
    ]

    # Add a random UUID to each item as the partition key
    for service in filtered_services:
        service["Id"] = str(uuid4())
        service_with_types = {}

        for key, value in service.items():
            # Set the type of each service property, according to:
            # https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValue.html
            if value is None:
                service_with_types[key] = {"NULL": True}
            elif type(value) is str:
                service_with_types[key] = {"S": value}
            else:
                service_with_types[key] = {"N": str(value)}

        put_requests.append(
            {
                "Put": {
                    "Item": service_with_types,
                    "TableName": TABLE_NAME,
                    "ReturnValuesOnConditionCheckFailure": "ALL_OLD",
                }
            }
        )

    print(f"Adding the following services: {put_requests}")
    return put_requests


def is_equal(local_service, remote_service):
    """Compare all the properties in each service to see if they're the same"""
    res = True
    diff = []

    for key, value in local_service.items():
        # Avoid referencing nonexistent keys
        if key not in remote_service:
            res = False
            diff.append(key)
        elif value is None and remote_service[key] != {"NULL": True}:
            res = False
            diff.append(key)
        elif type(value) is str and remote_service[key] != {"S": value}:
            res = False
            diff.append(key)
        elif remote_service[key] != {"N": str(value)}:
            res = False
            diff.append(key)

    return res, diff


def create_update_expression(local_service, diff):
    """Create an update expression based on the number of keys that differ"""
    # Update expression syntax:
    # https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
    update_expression = "SET "
    expression_values = {}

    for i, key in enumerate(diff):
        attribute = f":newval{i}"
        update_expression += f"{key} = {attribute}"

        if local_service[key] is None:
            expression_values[attribute] = {"NULL": True}
        elif type(local_service[key]) is str:
            expression_values[attribute] = {"S": local_service[key]}
        else:
            expression_values[attribute] = {"N": str(local_service[key])}

        if i < len(diff) - 1:
            update_expression += ", "

    return update_expression, expression_values


def update_services(local_services, remote_services, common_services):
    """Update all AWS services changed in the JSON file"""
    update_requests = []
    filtered_services = []
    update_expressions = {}

    for common_service in common_services:
        local_service = next(
            service for service in local_services if service["Name"] == common_service
        )
        remote_service = next(
            service
            for service in remote_services
            if service["Name"]["S"] == common_service
        )

        # Gather all the differences between the JSON file and DynamoDB table into an update expression
        is_eq, diff = is_equal(local_service, remote_service)

        if not is_eq:
            # The ID only appears in DynamoDB
            filtered_services.append({**local_service, "Id": remote_service["Id"]})
            update_expressions[local_service["Name"]] = create_update_expression(
                local_service, diff
            )

    for service in filtered_services:
        # The primary key is a composite key containing the service's ID and name
        primary_key = {"Id": service["Id"], "Name": {"S": service["Name"]}}
        update_expression, expression_value = update_expressions[service["Name"]]
        update_requests.append(
            {
                "Update": {
                    "Key": primary_key,
                    "UpdateExpression": update_expression,
                    "ExpressionAttributeValues": expression_value,
                    "TableName": TABLE_NAME,
                    "ReturnValuesOnConditionCheckFailure": "ALL_OLD",
                }
            }
        )

    print(f"Updating the following services: {update_requests}")
    return update_requests


def remove_services(remote_services, services_to_delete):
    """Remove all AWS services present in DynamoDB, but no longer present in the JSON file"""
    delete_requests = []
    filtered_services = [
        service
        for service in remote_services
        if service["Name"]["S"] in services_to_delete
    ]

    for service in filtered_services:
        primary_key = {"Id": service["Id"], "Name": service["Name"]}
        delete_requests.append(
            {
                "Delete": {
                    "Key": primary_key,
                    "TableName": TABLE_NAME,
                    "ReturnValuesOnConditionCheckFailure": "ALL_OLD",
                }
            }
        )

    print(f"Deleting the following services: {delete_requests}")
    return delete_requests


def perform_transaction(client, put_items, update_items, delete_items):
    """Run all create, update, and delete actions in one API call"""
    transact_items = put_items + update_items + delete_items
    # Split request items into chunks to satisfy transact-write-item's constraint
    num_chunks = ceil(len(transact_items) / TRANSACT_WRITE_LIMIT)
    print(f"Splitting transact-write-item into {num_chunks} chunk(s)")

    for chunk_i in range(num_chunks):
        transact_items_chunk = transact_items[
            (chunk_i * TRANSACT_WRITE_LIMIT) : ((chunk_i + 1) * TRANSACT_WRITE_LIMIT)
        ]

        try:
            print(f"{transact_items_chunk=}")
            transact_write_response = client.transact_write_items(
                TransactItems=transact_items_chunk,
                ReturnConsumedCapacity="INDEXES",
                ReturnItemCollectionMetrics="SIZE",
            )
            print(f"Success!\n{transact_write_response}")
        except ClientError as error:
            print(f"Client error: {error}")


def main():
    # Get all the AWS services present in the JSON file and DynamoDB
    local_services = get_json_file()
    dynamodb_client = boto3.client("dynamodb")
    remote_services = get_all_services(dynamodb_client)

    # Exit early if the scan fails
    if remote_services is None:
        return

    # Create two sets of service names and compare which are only present locally/remotely
    local_services_set = {service["Name"] for service in local_services}
    remote_services_set = {service["Name"]["S"] for service in remote_services}
    services_to_create = local_services_set - remote_services_set
    services_to_delete = remote_services_set - local_services_set
    common_services = local_services_set & remote_services_set

    # Gather all the create, update, and delete operations
    put_items = add_services(local_services, services_to_create)
    update_items = update_services(local_services, remote_services, common_services)
    delete_items = remove_services(remote_services, services_to_delete)

    # Perform a single transact-write-item request for CUD operations
    perform_transaction(dynamodb_client, put_items, update_items, delete_items)


if __name__ == "__main__":
    main()
