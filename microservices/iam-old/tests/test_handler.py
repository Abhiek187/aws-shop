from datetime import datetime, timedelta, timezone
from freezegun import freeze_time
import json
import os
import pytest
import sys
from unittest import mock

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
    return response["TopicArn"]


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


# @pytest.fixture()
# def scheduler_event(request):
#     # Mock EventBridge Scheduler event
#     current_dir = os.path.dirname(__file__)
#     event_path = os.path.join(current_dir, "..", "events", request.param)

#     with open(event_path, "r") as event_file:
#         return json.load(event_file)


# @mock.patch("conftest.sns_client.publish")
# def test_new_access_key(publish_mock, iam_client, sns_client, sns_topic):
#     # Given an access key that was recently created
#     # When the Lambda function is called
#     # Then the SNS topic shouldn't be published
#     app.check_all_access_keys(iam_client, sns_client, sns_topic)
#     publish_mock.assert_not_called()


# @pytest.mark.parametrize("apigw_event", ["dev.json", "prod.json"], indirect=True)
# def test_lambda_handler(scheduler_event):
#     lambda_response = app.handler(scheduler_event, "")
#     body = json.loads(lambda_response["body"])

#     assert lambda_response["statusCode"] == 200
#     assert lambda_response["headers"] == {
#         "Content-Type": "application/json",
#     }
#     assert type(body) is list and len(body) > 0
