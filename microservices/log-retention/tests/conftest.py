import boto3
from moto import mock_aws
import os
import pytest
from unittest.mock import MagicMock


@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"


@pytest.fixture
def logs_client(aws_credentials):
    with mock_aws():
        yield boto3.client("logs")


@pytest.fixture
def log_groups(logs_client):
    # Create mock log groups with different retention policies
    groups = [
        {"name": "/group/compliant", "retention": 365},
        {"name": "/group/non-compliant-1", "retention": 7},
        {"name": "/group/non-compliant-2", "retention": None},
    ]

    for group in groups:
        logs_client.create_log_group(logGroupName=group["name"])
        if group["retention"] is not None:
            logs_client.put_retention_policy(
                logGroupName=group["name"], retentionInDays=group["retention"]
            )

    logs_client.put_retention_policy = MagicMock()
