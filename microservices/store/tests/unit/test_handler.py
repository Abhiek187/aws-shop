import json
import os
import pytest
import sys

sys.path.append("..")

from src import app


@pytest.fixture()
def apigw_event(request):
    # Mock API Gateway event
    current_dir = os.path.dirname(__file__)
    event_path = os.path.join(current_dir, "..", "..", "events", request.param)

    with open(event_path, "r") as event_file:
        return json.load(event_file)


def test_get_all_aws_services(dynamodb_table, table_name):
    # Given a DynamoDB table
    # When a GET / request is called
    items = app.get_all_aws_services(table_name)
    # Then the entire table is returned
    assert len(items) > 0
    assert items[0] == dynamodb_table


@pytest.mark.parametrize("apigw_event", ["dev.json", "prod.json"], indirect=True)
def test_lambda_handler(apigw_event):
    lambda_response = app.handler(apigw_event, "")
    body = json.loads(lambda_response["body"])

    assert lambda_response["statusCode"] == 200
    assert lambda_response["headers"] == {
        "Content-Type": "application/json",
    }
    assert type(body) is list and len(body) > 0
