import boto3
import logging

# The standard number of days to keep CloudWatch Logs
RETENTION_IN_DAYS = 365

logs = boto3.client("logs")

LOG = logging.getLogger()
LOG.setLevel(logging.INFO)


def handler(event, context):
    LOG.info(f"{event=}")
    check_log_retention()


def check_log_retention(logs=logs):
    log_groups = logs.describe_log_groups()

    for group in log_groups["logGroups"]:
        group_name = group["logGroupName"]
        group_size = group["storedBytes"]
        # Log groups with no retention won't have the retentionInDays key
        old_retention = group["retentionInDays"] if "retentionInDays" in group else "∞"
        output = f"Log group: {group_name} | Size: {group_size} | Retention: {old_retention} days"

        if old_retention != RETENTION_IN_DAYS:
            logs.put_retention_policy(
                logGroupName=group_name, retentionInDays=RETENTION_IN_DAYS
            )
            output += f" --> {RETENTION_IN_DAYS} days"

        LOG.info(output)
