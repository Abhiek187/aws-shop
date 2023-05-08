import json
import os
import pytest
import sys

sys.path.append("..")

from src import app


@pytest.fixture()
def apigw_event():
    # Mock API Gateway event
    current_dir = os.path.dirname(__file__)
    event_path = os.path.join(current_dir, "..", "..", "events", "event.json")

    with open(event_path, "r") as event_file:
        return json.load(event_file)


def test_lambda_handler(apigw_event):
    ret = app.handler(apigw_event, "")
    data = json.loads(ret["body"])

    assert ret["statusCode"] == 200
    assert "message" in ret["body"]
    assert data["message"] == "hello world"
