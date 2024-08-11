import boto3
from datetime import datetime
import json
import logging
import os

pinpoint = boto3.client("pinpoint")

# Enable detailed logging
LOG = logging.getLogger()
LOG.setLevel(logging.INFO)


def print_context(context):
    # All properties listed in: https://docs.aws.amazon.com/lambda/latest/dg/python-context.html
    LOG.info(f"{context.get_remaining_time_in_millis()=}")
    LOG.info(f"{context.function_name=}")
    LOG.info(f"{context.function_version=}")
    LOG.info(f"{context.invoked_function_arn=}")
    LOG.info(f"{context.memory_limit_in_mb=}")
    LOG.info(f"{context.aws_request_id=}")
    LOG.info(f"{context.log_group_name=}")
    LOG.info(f"{context.log_stream_name=}")
    LOG.info(f"{context.identity.cognito_identity_id=}")
    LOG.info(f"{context.identity.cognito_identity_pool_id=}")
    LOG.info(f"{context.client_context=}")


def handler(event, context):
    # Event types: https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html
    LOG.info(f"{event=}")
    # print_context(context)

    body = ""
    status_code = 200
    headers = {
        "Content-Type": "application/json",
    }

    try:
        route_key = event["routeKey"]
        request_body_str = event["body"]
        request_body = json.loads(request_body_str)

        if route_key == "POST /event":
            is_valid_event, error_message = validate_event_object(request_body)

            if is_valid_event:
                status_code, body = publish_event(request_body)
            else:
                raise Exception(f"Invalid request body: {error_message}")
        else:
            raise Exception(f'Unsupported route: "{route_key}"')
    except Exception as e:
        # Catch-all for errors
        status_code = 400
        body = str(e)
    finally:
        # Don't stringify empty bodies (but do so for empty arrays)
        if body != "":
            body = json.dumps(body)

    response = {"statusCode": status_code, "headers": headers, "body": body}
    LOG.info(f"{response=}")
    return response


def publish_event(event):
    app_id = os.environ.get("PinpointAppId", "")
    timestamp = datetime.now().isoformat()
    # anonymous = generic endpoint ID that encompases all users
    endpoint_id = "anonymous"
    event_id = f"event-{timestamp}"
    attributes, metrics = categorize_event_properties(event["properties"])

    events_request = {"BatchItem": {}}
    events_request["BatchItem"][endpoint_id] = {"Endpoint": {}, "Events": {}}
    events_request["BatchItem"][endpoint_id]["Events"][event_id] = {
        "Attributes": attributes,
        "EventType": event["name"],
        "Metrics": metrics,
        "Timestamp": timestamp,
    }

    response = pinpoint.put_events(
        ApplicationId=app_id,
        EventsRequest=events_request,
    )
    LOG.info(f"Pinpoint response: {response}")

    events_response = response["EventsResponse"]["Results"][endpoint_id][
        "EventsItemResponse"
    ][event_id]
    # Status code will either be 202 (success) or 400 (failure)
    return events_response["StatusCode"], events_response["Message"]


def validate_event_object(event):
    # Check that the request body is formatted correctly
    if "name" not in event:
        return False, 'Missing "name" key'
    elif not isinstance(event["name"], str):
        return False, '"name" must be a string'
    elif "properties" not in event:
        return False, 'Missing "properties" key'
    elif not isinstance(event["properties"], dict):
        return False, '"properties" must be an object'

    return True, None


def categorize_event_properties(properties):
    # If the event value is a string or boolean, add it to attributes
    # If the event value is a number, add it to metrics
    # Matches Amplify's iOS/Android logic: https://stackoverflow.com/a/68231896
    attributes = {}
    metrics = {}

    for key, value in properties.items():
        # Check bool first since it's also an instance of int
        if isinstance(value, (str, bool)):
            attributes[key] = str(value)
        elif isinstance(value, (int, float)):
            metrics[key] = value
        # Ignore all other types

    return attributes, metrics
