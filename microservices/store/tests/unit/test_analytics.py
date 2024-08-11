from datetime import datetime
from freezegun import freeze_time
import os
import pytest
import sys

sys.path.append("..")

from src import analytics

VALID_EVENT = {"name": "test", "properties": {"a": 1.3, "b": "2", "c": None, "d": True}}
VALID_ATTRIBUTES = {"b": "2", "d": "True"}
VALID_METRICS = {"a": 1.3}


@pytest.mark.parametrize(
    "event",
    [
        {},
        {"key": "value"},
        {"name": None},
        {"name": "test"},
        {"name": "test", "properties": 3},
    ],
)
def test_invalid_event_object(event):
    assert analytics.validate_event_object(event)[0] == False


def test_valid_event_object():
    assert analytics.validate_event_object(VALID_EVENT)[0] == True


@pytest.mark.parametrize(
    "properties,expected_attributes,expected_metrics",
    [
        ({}, {}, {}),
        ({"a": 1, "b": 8.5}, {}, {"a": 1, "b": 8.5}),
        ({"a": False, "b": "bee"}, {"a": "False", "b": "bee"}, {}),
        (
            VALID_EVENT["properties"],
            VALID_ATTRIBUTES,
            VALID_METRICS,
        ),
    ],
)
def test_event_properties(properties, expected_attributes, expected_metrics):
    actual_attributes, actual_metrics = analytics.categorize_event_properties(
        properties
    )
    assert actual_attributes == expected_attributes
    assert actual_metrics == expected_metrics


def test_publish_event(pinpoint_client, pinpoint_app):
    timestamp = datetime.now().isoformat()

    with freeze_time(timestamp):
        analytics.publish_event(VALID_EVENT, pinpoint_client)
        pinpoint_client.put_events.assert_called_once_with(
            ApplicationId=os.environ["PinpointAppId"],
            EventsRequest={
                "BatchItem": {
                    "anonymous": {
                        "Endpoint": {},
                        "Events": {
                            f"event-{timestamp}": {
                                "Attributes": VALID_ATTRIBUTES,
                                "EventType": VALID_EVENT["name"],
                                "Metrics": VALID_METRICS,
                                "Timestamp": timestamp,
                            }
                        },
                    }
                }
            },
        )
