import boto3
from datetime import datetime, timedelta, timezone
from freezegun import freeze_time
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
def iam_client(aws_credentials):
    with mock_aws():
        yield boto3.client("iam")


@pytest.fixture
def sns_client(aws_credentials):
    with mock_aws():
        yield boto3.client("sns")


@pytest.fixture
def user_name():
    return "test-user"


@pytest.fixture
def new_user(iam_client, user_name):
    # Create a mock IAM user
    iam_client.create_user(UserName=user_name)
    iam_client.create_access_key(UserName=user_name)


@pytest.fixture
def old_user(iam_client, user_name):
    today = datetime.now(timezone.utc)

    with freeze_time(today - timedelta(days=90)):
        # Create a mock IAM user whose access key is 90 days old
        iam_client.create_user(UserName=user_name)
        iam_client.create_access_key(UserName=user_name)


@pytest.fixture
def access_key_metadata(iam_client, user_name):
    return iam_client.list_access_keys(UserName=user_name)["AccessKeyMetadata"]


@pytest.fixture
def sns_topic_name():
    return "test-topic"


@pytest.fixture
def sns_topic(sns_client, sns_topic_name):
    # Create a mock SNS topic
    response = sns_client.create_topic(Name=sns_topic_name)
    os.environ["TopicArn"] = response["TopicArn"]
    sns_client.publish = MagicMock()
