from __future__ import annotations  # support list and dict types in Python < 3.9
import boto3
from botocore.exceptions import ClientError
import json
from math import ceil, isclose
from typing import Any, Dict
from uuid import uuid4

# Constants
TABLE_NAME = "AWS-Services"
JSON_FILE_NAME = "aws-services.json"
TRANSACT_WRITE_LIMIT = 100
# Reserved words in DynamoDB that can't be used in update expressions:
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
RESERVED_WORDS = ["Name", "Unit"]

# Type aliases
LocalService = Dict[str, Any]
RemoteService = Dict[str, Dict[str, Any]]
Transaction = Dict[str, Dict[str, Any]]
AttributeNames = Dict[str, str]
AttributeValues = Dict[str, Dict[str, Any]]


def get_json_file() -> list[LocalService]:
    """Parse the AWS services from the JSON file"""
    with open(JSON_FILE_NAME, "r") as aws_services_file:
        return json.load(aws_services_file)


def get_all_services(client) -> list[RemoteService] | None:
    """
    Get all the AWS services currently in the DynamoDB table.

    Returns None if the API call fails.
    """
    try:
        scan_response = client.scan(
            TableName=TABLE_NAME,
            ReturnConsumedCapacity="INDEXES",
        )
        num_items = scan_response["ScannedCount"]
        read_capacity_units = scan_response["ConsumedCapacity"]["CapacityUnits"]
        print(
            f"Successfully scanned {num_items} items and used {read_capacity_units} read capacity units (RCU)"
        )
        return scan_response["Items"]
    except ClientError as error:
        print(f"scan client error: {error}")
        return None


def add_services(
    local_services: list[LocalService], services_to_create: set[str]
) -> list[Transaction]:
    """Add all AWS services present in the JSON file, but not in DynamoDB"""
    # Transform the JSON file to a supported format for the transact-write-items API
    put_requests: list[Transaction] = []
    filtered_services = [
        service for service in local_services if service["Name"] in services_to_create
    ]

    # Add a random UUID to each item as the partition key
    for service in filtered_services:
        service["Id"] = str(uuid4())
        service_with_types: RemoteService = {}

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

    print(f"Adding the following services: {services_to_create}")
    return put_requests


def is_equal(
    local_service: LocalService, remote_service: RemoteService
) -> tuple[bool, list[str], list[str]]:
    """
    Compare all the properties in each service to see if they're the same.

    Returns a bool indicating whether the services are equivalent, a list of keys to be updated in
    DynamoDB, and a list of keys to remove from DynamoDB.
    """
    keys_to_update: list[str] = []

    # All keys that are only defined locally or differ should be updated
    for key, value in local_service.items():
        # Avoid referencing nonexistent keys
        if key not in remote_service:
            keys_to_update.append(key)
        elif value is None and remote_service[key] != {"NULL": True}:
            keys_to_update.append(key)
        elif type(value) is str and remote_service[key] != {"S": value}:
            keys_to_update.append(key)
        # Exponents are rendered differently as strings in DynamoDB vs. Python
        # 3e16: DynamoDB = '1000...000', Python = '3e+16' (for all e >= 16)
        # 3e3: DynamoDB = '1000', Python = '3000.0' (for all -4 <= e <= 15)
        # 3e-6: DynamoDB = '0.000003', Python = '3e-6' (for all e <= -5)
        # Instead of comparing strings, compare the numbers as floats
        elif isinstance(value, (int, float)) and not (
            "N" in remote_service[key]
            and isclose(value, float(remote_service[key]["N"]))
        ):
            keys_to_update.append(key)

    # All keys that are only defined in DynamoDB should be deleted (except the ID field)
    keys_to_delete = [
        key for key in remote_service if key not in local_service and key != "Id"
    ]
    is_eq = not (keys_to_update or keys_to_delete)
    return is_eq, keys_to_update, keys_to_delete


def create_update_expression(
    local_service: LocalService, keys_to_update: list[str], keys_to_delete: list[str]
) -> tuple[str, AttributeNames, AttributeValues]:
    """
    Create an update expression based on the number of keys that differ.

    Returns an update expression with SET and/or REMOVE statements, a dictionary of attribute names
    (that start with #), and a dictionary of attribute values (that start with :) present in the
    update expression.
    """
    # Update expression syntax:
    # https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
    set_expression = "SET " if keys_to_update else ""
    remove_expression = "REMOVE " if keys_to_delete else ""
    expression_names: AttributeNames = {}
    expression_values: AttributeValues = {}

    # Add all values to create/update to the table
    for i, key in enumerate(keys_to_update):
        attribute_name = key

        # If the key is reserved, use an attribute name to reference the key
        if key in RESERVED_WORDS:
            attribute_name = f"#{key.lower()}"
            expression_names[attribute_name] = key

        attribute_value = f":{key.lower()}"
        set_expression += f"{attribute_name} = {attribute_value}"

        if local_service[key] is None:
            expression_values[attribute_value] = {"NULL": True}
        elif type(local_service[key]) is str:
            expression_values[attribute_value] = {"S": local_service[key]}
        else:
            expression_values[attribute_value] = {"N": str(local_service[key])}

        if i < len(keys_to_update) - 1:
            set_expression += ", "

    # Add all values to delete from the table
    for i, key in enumerate(keys_to_delete):
        if key in RESERVED_WORDS:
            attribute_name = f"#{key.lower()}"
            remove_expression += attribute_name
            expression_names[attribute_name] = key
        else:
            remove_expression += key

        if i < len(keys_to_delete) - 1:
            remove_expression += ", "

    if set_expression and remove_expression:
        # Add a space between the SET and REMOVE expressions if they're both non-empty
        update_expression = f"{set_expression} {remove_expression}"
    else:
        update_expression = set_expression + remove_expression

    return update_expression, expression_names, expression_values


def update_services(
    local_services: list[LocalService],
    remote_services: list[RemoteService],
    common_services: set[str],
) -> list[Transaction]:
    """Update all AWS services changed in the JSON file"""
    update_requests: list[Transaction] = []
    filtered_services = []
    update_expressions: dict[str, tuple[str, AttributeNames, AttributeValues]] = {}

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
        is_eq, keys_to_update, keys_to_delete = is_equal(local_service, remote_service)

        if not is_eq:
            # The ID only appears in DynamoDB
            filtered_services.append({**local_service, "Id": remote_service["Id"]})
            update_expressions[local_service["Name"]] = create_update_expression(
                local_service, keys_to_update, keys_to_delete
            )

    for service in filtered_services:
        # The primary key is a composite key containing the service's ID and name
        primary_key = {"Id": service["Id"], "Name": {"S": service["Name"]}}
        update_expression, expression_name, expression_value = update_expressions[
            service["Name"]
        ]
        update_request = {
            "Update": {
                "Key": primary_key,
                "UpdateExpression": update_expression,
                "TableName": TABLE_NAME,
                "ReturnValuesOnConditionCheckFailure": "ALL_OLD",
            }
        }

        # ExpressionAttributeValues and ExpressionAttributeNames must not be empty
        if expression_value:
            update_request["Update"]["ExpressionAttributeValues"] = expression_value
        if expression_name:
            update_request["Update"]["ExpressionAttributeNames"] = expression_name

        update_requests.append(update_request)

    updated_services = [service["Name"] for service in filtered_services]
    print(f"Updating the following services: {updated_services}")
    return update_requests


def remove_services(
    remote_services: list[RemoteService], services_to_delete: set[str]
) -> list[Transaction]:
    """Remove all AWS services present in DynamoDB, but no longer present in the JSON file"""
    delete_requests: list[Transaction] = []
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

    print(f"Deleting the following services: {services_to_delete}")
    return delete_requests


def perform_transaction(
    client,
    put_items: list[Transaction],
    update_items: list[Transaction],
    delete_items: list[Transaction],
):
    """Run all create, update, and delete actions in one API call"""
    transact_items = put_items + update_items + delete_items
    # Split request items into chunks to satisfy transact-write-items's constraint
    num_chunks = ceil(len(transact_items) / TRANSACT_WRITE_LIMIT)
    print(f"Splitting transact-write-items into {num_chunks} chunk(s)")

    for chunk_i in range(num_chunks):
        transact_items_chunk = transact_items[
            (chunk_i * TRANSACT_WRITE_LIMIT) : ((chunk_i + 1) * TRANSACT_WRITE_LIMIT)
        ]

        try:
            transact_write_response = client.transact_write_items(
                TransactItems=transact_items_chunk,
                ReturnConsumedCapacity="INDEXES",
                ReturnItemCollectionMetrics="SIZE",
            )
            write_capacity_units = transact_write_response["ConsumedCapacity"][0][
                "WriteCapacityUnits"
            ]
            print(
                f"Success! Transaction chunk #{chunk_i + 1} consumed {write_capacity_units} write capacity units (WCU) across the table and all GSIs (Global Secondary Indexes)"
            )
        except ClientError as error:
            print(f"transact-write-items client error: {error}")


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

    # Perform a single transact-write-items request for CUD operations
    perform_transaction(dynamodb_client, put_items, update_items, delete_items)


if __name__ == "__main__":
    main()
