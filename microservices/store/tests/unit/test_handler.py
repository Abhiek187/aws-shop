import json
import pytest
import sys

sys.path.append("..")

from src import app


# Tests related to the main handler function
@pytest.mark.parametrize(
    "apigw_event", ["dev.json", "prod.json", "query-params.json"], indirect=True
)
def test_lambda_handler(apigw_event, dynamodb_table):
    # Given an API Gateway event
    # When the Lambda function is called with GET /
    lambda_response = app.handler(apigw_event, "")
    body = json.loads(lambda_response["body"])

    # Then a 200 response is returned with the DynamoDB table in the body
    assert lambda_response["statusCode"] == 200
    assert lambda_response["headers"] == {
        "Content-Type": "application/json",
    }
    assert type(body) is list and len(body) > 0


@pytest.mark.parametrize("apigw_event", ["health.json"], indirect=True)
def test_health_check(apigw_event):
    # Given an API Gateway event
    # When the Lambda function is called with GET /health
    lambda_response = app.handler(apigw_event, "")

    # Then a 200 response is returned with an empty body
    assert lambda_response["statusCode"] == 200
    assert lambda_response["headers"] == {
        "Content-Type": "application/json",
    }
    # The body isn't an empty string, but a string containing the empty string
    assert not lambda_response["body"]
