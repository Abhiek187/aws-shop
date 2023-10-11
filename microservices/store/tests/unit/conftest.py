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
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"


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

    items = [
        {
            "Id": {
                "S": "0",
            },
            "Name": {
                "S": "Lambda",
            },
            "NameLower": {"S": "lambda"},
            "Description": {
                "S": "Run code in under 15 minutes",
            },
            "DescriptionLower": {"S": "run code in under 15 minutes"},
            "Price": {
                "N": "2E-7",
            },
            "Unit": {
                "S": "invocation",
            },
            "Category": {
                "S": "free",
            },
            "FreeTier": {
                "N": "1E+6",
            },
        },
        {
            "Id": {
                "S": "1",
            },
            "Name": {
                "S": "Auto Scaling",
            },
            "NameLower": {"S": "auto scaling"},
            "Description": {
                "S": "Automatically scale the number of EC2 instances with demand",
            },
            "DescriptionLower": {
                "S": "automatically scale the number of ec2 instances with demand"
            },
            "Price": {
                "N": "0",
            },
            "Unit": {
                "S": "group",
            },
            "Category": {
                "S": "free",
            },
            "FreeTier": {
                "NULL": True,
            },
        },
        {
            "Id": {
                "S": "2",
            },
            "Name": {
                "S": "EC2",
            },
            "NameLower": {"S": "ec2"},
            "Description": {
                "S": "Servers in the cloud",
            },
            "DescriptionLower": {"S": "servers in the cloud"},
            "Price": {
                "N": "7.2",
            },
            "Unit": {
                "S": "instance",
            },
            "Category": {
                "S": "trial",
            },
        },
        {
            "Id": {
                "S": "3",
            },
            "Name": {
                "S": "Config",
            },
            "NameLower": {"S": "config"},
            "Description": {
                "S": "Audit the configuration of AWS resources",
            },
            "DescriptionLower": {
                "S": "audit the configuration of aws resources",
            },
            "Price": {
                "N": "0.003",
            },
            "Unit": {
                "S": "configuration item",
            },
            "Category": {
                "S": "paid",
            },
        },
    ]

    for item in items:
        dynamodb_client.put_item(TableName=table_name, Item=item)

    return items


@pytest.fixture()
def apigw_event(request):
    # Mock API Gateway event
    current_dir = os.path.dirname(__file__)
    event_path = os.path.join(current_dir, "..", "..", "events", request.param)

    with open(event_path, "r") as event_file:
        return json.load(event_file)
