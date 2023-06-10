# So here me out:
# We can create a regular JSON file with the items we want to include.
# Then using boto3, we can apply a UUID to each item and split the items into chunks of 25 to make
# batch-write-item happy. (And apply other formatting required for that command.)
# This would normally be done by a DBA, but we'll use the admin account for now.
import boto3
from botocore.exceptions import ClientError
import json
from uuid import uuid4


def main():
    # Read all the AWS services
    with open("aws-services.json", "r") as aws_services_file:
        aws_services = json.load(aws_services_file)

    # Transform the JSON file to a supported format for the batch-write-item API
    TABLE_NAME = "AWS-Services"
    request_items = {TABLE_NAME: []}

    # Add a random UUID to each item as the partition key
    for service in aws_services:
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

        request_items[TABLE_NAME].append({"PutRequest": {"Item": service_with_types}})

    # Write items to a DynamoDB table
    dynamodb_client = boto3.client("dynamodb")

    # Split request items into chunks of 25 to satisfy batch-write-item's constraint
    try:
        batch_write_response = dynamodb_client.batch_write_item(
            RequestItems=request_items,
            ReturnConsumedCapacity="INDEXES",
            ReturnItemCollectionMetrics="SIZE",
        )
        print(f"Success!\n{batch_write_response}")
    except ClientError as error:
        print(f"Client error: {error}")


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
