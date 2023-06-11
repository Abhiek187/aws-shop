# So here me out:
# We can create a regular JSON file with the items we want to include.
# Then using boto3, we can apply a UUID to each item and split the items into chunks of 25 to make
# batch-write-item happy. (And apply other formatting required for that command.)
# This would normally be done by a DBA, but we'll use the admin account for now.
import boto3
from botocore.exceptions import ClientError
import json
from math import ceil
from uuid import uuid4

TABLE_NAME = "AWS-Services"
JSON_FILE_NAME = "aws-services.json"
BATCH_WRITE_LIMIT = 25


def get_json_file():
    """Parse the AWS services from the JSON file"""
    with open(JSON_FILE_NAME, "r") as aws_services_file:
        return json.load(aws_services_file)


def get_all_services(client):
    """Get all the AWS services currently in the DynamoDB table"""
    scan_response = client.scan(
        TableName=TABLE_NAME,
        ReturnConsumedCapacity="INDEXES",
    )
    print(f"{scan_response=}")
    return scan_response["Items"]


def add_services(client, local_services, services_to_create):
    """Add all AWS services present in the JSON file, but not in DynamoDB"""
    # Transform the JSON file to a supported format for the batch-write-item API
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

        put_requests.append({"PutRequest": {"Item": service_with_types}})

    # Write items to a DynamoDB table
    # Split request items into chunks to satisfy batch-write-item's constraint
    num_chunks = ceil(len(put_requests) / BATCH_WRITE_LIMIT)
    print(f"Splitting batch-write-item into {num_chunks} chunk(s)")

    for chunk_i in range(num_chunks):
        put_request_chunk = put_requests[
            (chunk_i * BATCH_WRITE_LIMIT) : ((chunk_i + 1) * BATCH_WRITE_LIMIT)
        ]
        request_items = {TABLE_NAME: put_request_chunk}

        try:
            batch_write_response = client.batch_write_item(
                RequestItems=request_items,
                ReturnConsumedCapacity="INDEXES",
                ReturnItemCollectionMetrics="SIZE",
            )
            print(f"Success!\n{batch_write_response}")
        except ClientError as error:
            print(f"Client error: {error}")


def update_services(client):
    """Update all AWS services changed in the JSON file"""
    pass


def remove_services(client, remote_services):
    """Remove all AWS services present in DynamoDB, but no longer present in the JSON file"""
    pass


def main():
    # Get all the AWS services present in the JSON file and DynamoDB
    local_services = get_json_file()
    dynamodb_client = boto3.client("dynamodb")
    remote_services = get_all_services(dynamodb_client)

    # Create two sets of service names and compare which are only present locally/remotely
    local_services_set = {service["Name"] for service in local_services}
    remote_services_set = {service["Name"]["S"] for service in remote_services}
    services_to_create = local_services_set - remote_services_set
    services_to_delete = remote_services_set - local_services_set

    # Perform all the create, update, and delete operations
    add_services(dynamodb_client, local_services, services_to_create)
    update_services(dynamodb_client)
    remove_services(dynamodb_client, services_to_delete)


if __name__ == "__main__":
    main()
# That is the create part. But we also need to handle upserts and deletions.
# So we could query the database to see if the service exists.
# If it does, check if there's a difference between your local JSON and what's stored in the database
# (minus the UUID).
# If it doesn't, insert the item into the database like earlier.
# Good, creation and upserts are taken care of, but what about deletions?
# I'm sort of handling this like Git for databases.
# Maybe get all the items in the database and keep track of which items you queried.
# Every item already present will be queried, so items that were never queried must have been deleted.
# So remove those items at the end. Maybe with a prompt?
