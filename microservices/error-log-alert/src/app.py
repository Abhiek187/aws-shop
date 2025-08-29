# Source: https://aws.amazon.com/blogs/mt/get-notified-specific-lambda-function-error-patterns-using-cloudwatch/
import base64
import boto3
from botocore.exceptions import ClientError
from datetime import datetime
import gzip
import json
import logging
import os

sns = boto3.client("sns")

LOG = logging.getLogger()
LOG.setLevel(logging.INFO)

TOPIC_ARN = os.environ.get("TopicArn", "")
REGION = os.environ.get("AWS_REGION", "us-east-1")


def handler(event, context):
    LOG.info(f"{event=}")
    log_data = get_log_data(event)
    LOG.info(f"{log_data=}")
    send_alert(log_data)


def get_log_data(event):
    """
    CLI equivalent:
    echo "BASE64_STR" | base64 --decode | gzip -d
    """
    base_64_logs = event["awslogs"]["data"]
    compressed_log_bytes = base64.b64decode(base_64_logs)
    log_bytes = gzip.decompress(compressed_log_bytes)
    return json.loads(log_bytes)


def send_alert(log_data):
    """
    Sample log data:
    {
        "messageType": "DATA_MESSAGE",
        "owner": "123456789123",
        "logGroup": "testLogGroup",
        "logStream": "testLogStream",
        "subscriptionFilters": ["testFilter"],
        "logEvents": [
            {
                "id": "eventId1",
                "timestamp": 1440442987000,
                "message": "[ERROR] First test message",
            },
            {
                "id": "eventId2",
                "timestamp": 1440442987001,
                "message": "[ERROR] Second test message",
            },
        ],
    }
    """
    log_events = log_data["logEvents"]
    log_group = log_data["logGroup"]
    log_stream = log_data["logStream"]
    subscription_filters = log_data["subscriptionFilters"]

    subject = f"Lambda Error Alert - {log_group}"
    message = f"""
A CloudWatch subscription filter was triggered. Below are the logs from the Lambda function.

Log group: {log_group}
Log stream: {log_stream}
Subscription Filters: {", ".join(subscription_filters)}
Log URL: https://console.aws.amazon.com/cloudwatch/home?region={REGION}#logEventViewer:group={log_group};stream={log_stream}
Log events:
"""

    for log_event in log_events:
        log_id = log_event["id"]
        log_timestamp = log_event["timestamp"]  # in milliseconds
        log_message = log_event["message"]

        # https://docs.python.org/3/library/datetime.html#format-codes
        formatted_timestamp = datetime.fromtimestamp(log_timestamp / 1e3).strftime(
            "%A %B %d, %Y @ %I:%M:%S %p"
        )
        message += f"- ID: {log_id}, Timestamp: {formatted_timestamp}, Message: {log_message}\n"

    LOG.info("Subject: %s", subject)
    LOG.info("Message: %s", message)

    try:
        sns.publish(
            TargetArn=TOPIC_ARN,
            Subject=subject,
            Message=message,
        )
    except ClientError as error:
        LOG.error(f"Failed to send alert: {error}")
