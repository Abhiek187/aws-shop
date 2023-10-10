import boto3
import json
from moto import mock_dynamodb
import os
import pytest


@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"


@pytest.fixture
def dynamodb_client(aws_credentials):
    with mock_dynamodb():
        yield boto3.client("dynamodb")


@pytest.fixture
def table_name():
    return "test-table"


@pytest.fixture
def dynamodb_table(dynamodb_client, table_name):
    # Create a mock DynamoDB table with items
    dynamodb_client.create_table(
        TableName=table_name,
        KeySchema=[{"AttributeName": "Id", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "Id", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",  # don't specify RCUs or WCUs
    )
    item = {"Id": {"S": "1234567890"}, "Name": {"S": "EC2"}}
    dynamodb_client.put_item(
        TableName=table_name,
        Item=item,
    )
    return item


@pytest.fixture()
def apigw_event(request):
    # Mock API Gateway event
    current_dir = os.path.dirname(__file__)
    event_path = os.path.join(current_dir, "..", "..", "events", request.param)

    with open(event_path, "r") as event_file:
        return json.load(event_file)
