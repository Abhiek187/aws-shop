import pytest
import sys

sys.path.append("..")

from src import app


def filter_item(item):
    # Only return the columns projected in each DynamoDB query
    return {
        key: value
        for key, value in item.items()
        if key not in ["NameLower", "DescriptionLower"]
    }


# Tests related to helper methods within the Lambda function
def test_scan_table(dynamodb_table, table_name):
    # Given a DynamoDB table
    # When scanned
    items = app.scan_table(table_name)
    # Then the entire table except for the lowercase keys is returned
    assert len(items) > 0
    projected_items = [filter_item(item) for item in dynamodb_table]
    assert items == projected_items


def test_query_all_services(dynamodb_table, table_name):
    # Given a DynamoDB table
    # When a GET / request is called
    items = app.get_aws_services(None, table_name)
    # Then the entire table is returned
    assert len(items) > 0
    assert items == app.scan_table(table_name)


@pytest.mark.skip(reason="Complex WHERE clauses not supported yet")
def test_query_services_with_all_params(dynamodb_table, table_name):
    # Given a DynamoDB table and query parameters
    query_params = {
        "query": "code",
        "category": "free",
        "min-price": "0",
        "max-price": "1",
        "free-tier": "",
    }

    # When a GET / request is called with those query parameters
    items = app.get_aws_services(query_params, table_name)

    # Then the table is filtered by that query
    assert len(items) == 1
    assert items[0] == next(
        filter_item(item) for item in dynamodb_table if item["Name"]["S"] == "Lambda"
    )


@pytest.mark.parametrize(
    "num_str", ["0", "-0", "1", "3.14", "-2e-3", "6.8e1", "infinity", "nan"]
)
def test_valid_numbers(num_str):
    # Given a string that is a number
    # When is_number() is called
    is_num = app.is_number(num_str)
    # Then it should return true
    assert is_num


@pytest.mark.parametrize("num_str", ["0e", "", " ", "number1", "2+2"])
def test_invalid_numbers(num_str):
    # Given a string that's not a number
    # When is_number() is called
    is_num = app.is_number(num_str)
    # Then it should return false
    assert not is_num
