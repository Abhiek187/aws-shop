from datetime import datetime, timedelta, timezone
from freezegun import freeze_time
import json
import os
import pytest
import sys
from unittest.mock import MagicMock

sys.path.append("..")

from src import app

# LIST_USERS_RESPONSE = {
#     "Users": [
#         {
#             "Path": "/",
#             "UserName": "test-user",
#             "UserId": "AIDA...",
#             "Arn": "arn:aws:iam::123456789012:user/test-user",
#             "CreateDate": "2023-04-19T01:33:23+00:00",
#             "PasswordLastUsed": "2023-07-26T23:59:41+00:00",
#         }
#     ]
# }

# LIST_ACCESS_KEYS_RESPONSE = {
#     "AccessKeyMetadata": [
#         {
#             "UserName": "test-user",
#             "AccessKeyId": "AKIA...",
#             "Status": "Active",
#             "CreateDate": "2023-07-22T00:23:27+00:00",
#         }
#     ]
# }

# SNS_TOPIC_ARN = "arn:aws:sns:us-west-2:123456789012:my-topic"
# SNS_PUBLISH_RESPONSE = {"MessageId": "123a45b6-7890-12c3-45d6-333322221111"}


@pytest.fixture()
def user_name():
    return "test-user"


@pytest.fixture()
def new_user(iam_client, user_name):
    # Create a mock IAM user
    iam_client.create_user(UserName=user_name)
    iam_client.create_access_key(UserName=user_name)


@pytest.fixture()
def old_user(iam_client, user_name):
    today = datetime.now(timezone.utc)

    with freeze_time(today - timedelta(days=90)):
        # Create a mock IAM user whose access key is 90 days old
        iam_client.create_user(UserName=user_name)
        iam_client.create_access_key(UserName=user_name)


@pytest.fixture()
def access_key_metadata(iam_client, user_name):
    return iam_client.list_access_keys(UserName=user_name)["AccessKeyMetadata"]


@pytest.fixture()
def sns_topic_name():
    return "test-topic"


@pytest.fixture()
def sns_topic(sns_client, sns_topic_name):
    # Create a mock SNS topic
    response = sns_client.create_topic(Name=sns_topic_name)
    os.environ["TopicArn"] = response["TopicArn"]
    sns_client.publish = MagicMock()


def test_no_reminders_with_new_keys(iam_client, new_user):
    # Given an access key that was recently created
    users = iam_client.list_users()["Users"]
    assert len(users) > 0

    # When checking all the access keys
    reminders = app.check_all_access_keys(users)

    # Then the reminders list should be empty
    assert len(reminders) == 0


def test_reminders_with_90_day_keys(iam_client, old_user, access_key_metadata):
    # Given an access key that was created 90 days ago
    users = iam_client.list_users()["Users"]
    assert len(users) > 0
    assert len(access_key_metadata) > 0
    assert access_key_metadata[0]["Status"] == "Active"

    # When checking all the access keys
    reminders = app.check_all_access_keys(users)

    # Then the reminders list should contain the user's information
    assert len(reminders) > 0
    assert reminders[0]["username"] == users[0]["UserName"]
    assert reminders[0]["access_key_id"] == access_key_metadata[0]["AccessKeyId"]
    assert reminders[0]["creation_date"] == access_key_metadata[0]["CreateDate"]
    assert reminders[0]["delta"] == 90


def test_send_no_reminders(sns_client, sns_topic):
    # Given an empty reminders list
    reminders = []

    # When calling send_reminders
    app.send_reminders(reminders, sns_client)

    # Then no SNS message is published
    sns_client.publish.assert_not_called()


def test_send_reminders(sns_client, sns_topic):
    # Given a non-empty reminders list
    day_delta = 90
    reminders = [
        {
            "username": "test-user",
            "access_key_id": "AKIARZPUZDIKC4BOVXFX",
            "creation_date": datetime.now(timezone.utc) - timedelta(days=day_delta),
            "delta": day_delta,
        }
    ]
    reminder = reminders[0]

    # When send_reminders is called
    app.send_reminders(reminders, sns_client)

    # Then an SNS message is published
    sns_client.publish.assert_called_once_with(
        TopicArn=os.environ["TopicArn"],
        Subject=f"Hey {reminder['username']}, your AWS access key is {reminder['delta']} days old.",
        Message=f"It's that time of year again! The access key ID in question is {reminder['access_key_id']} and was created on {reminder['creation_date']:%A %B %d, %Y}.",
    )


def test_lambda_handler_with_new_user(iam_client, new_user, sns_client, sns_topic):
    # Given a user with a newly created access key
    # When the Lambda function is called
    app.handler({}, {})

    # Then no SNS message is published
    sns_client.publish.assert_not_called()
