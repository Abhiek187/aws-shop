import boto3
from datetime import datetime, timezone
import os

# It's more efficient to only initilize boto3 clients during cold starts
iam = boto3.client("iam")
sns = boto3.client("sns")
TOPIC_ARN = os.environ.get("TopicArn", "")


def handler(event, context):
    users = iam.list_users()["Users"]
    reminders = check_all_access_keys(users)
    send_reminders(reminders)


def check_all_access_keys(users):
    # AWS timestamps are in ISO 8601 format with time zones
    today = datetime.now(timezone.utc)
    MAX_DAYS = 90
    reminders = []

    for user in users:
        username = user["UserName"]

        for access_key in iam.list_access_keys(UserName=username)["AccessKeyMetadata"]:
            if access_key["Status"] != "Active":
                continue

            access_key_id = access_key["AccessKeyId"]
            creation_date = access_key["CreateDate"]
            # boto3 automatically converts date strings into datetime format
            delta = (today - creation_date).days

            if delta == MAX_DAYS:
                reminders.append(
                    {
                        "username": username,
                        "access_key_id": access_key_id,
                        "creation_date": creation_date,
                        "delta": delta,
                    }
                )

    return reminders


def send_reminders(reminders):
    for reminder in reminders:
        sns.publish(
            TopicArn=TOPIC_ARN,
            Subject=f"Hey {reminder['username']}, your AWS access key is {reminder['delta']} days old.",
            Message=f"It's that time of year again! The access key ID in question is {reminder['access_key_id']} and was created on {reminder['creation_date']:%A %B %d, %Y}.",
        )
