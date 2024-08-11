import pytest
import sys

sys.path.append("..")

from src import analytics


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
    event = {"name": "test", "properties": {"a": 1.3, "b": "2", "c": None, "d": True}}
    assert analytics.validate_event_object(event)[0] == True


@pytest.mark.parametrize(
    "properties,expected_attributes,expected_metrics",
    [
        ({}, {}, {}),
        ({"a": 1, "b": 8.5}, {}, {"a": 1, "b": 8.5}),
        ({"a": False, "b": "bee"}, {"a": "False", "b": "bee"}, {}),
        (
            {"a": 1.3, "b": "2", "c": None, "d": True},
            {"b": "2", "d": "True"},
            {"a": 1.3},
        ),
    ],
)
def test_event_properties(properties, expected_attributes, expected_metrics):
    actual_attributes, actual_metrics = analytics.categorize_event_properties(
        properties
    )
    assert actual_attributes == expected_attributes
    assert actual_metrics == expected_metrics
