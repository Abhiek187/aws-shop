import boto3
from datetime import datetime, timezone
import os


def handler(event, context):
    iam = boto3.client("iam")
    users = iam.list_users()["Users"]
    # AWS timestamps are in ISO 8601 format with time zones
    today = datetime.now(timezone.utc)

    for user in users:
        username = user["UserName"]

        for access_key in iam.list_access_keys(UserName=username)["AccessKeyMetadata"]:
            if access_key["Status"] != "Active":
                continue

            access_key_id = access_key["AccessKeyId"]
            creation_date = access_key["CreateDate"]
            # boto3 automatically converts date strings into datetime format
            delta = (today - creation_date).days
            MAX_DAYS = 90

            if delta == MAX_DAYS:
                # Send an email to remind the user to update their access key
                sns = boto3.client("sns")
                sns.publish(
                    TopicArn=os.environ["TopicArn"],
                    Subject=f"Hey {username}, your AWS access key is {delta} days old.",
                    Message=f"It's that time of year again! The access key ID in question is {access_key_id} and was created on {creation_date:%A %B %d, %Y}.",
                )
