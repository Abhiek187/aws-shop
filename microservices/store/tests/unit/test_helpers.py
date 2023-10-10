import pytest
import sys

sys.path.append("..")

from src import app


# Tests related to helper methods within the Lambda function
def test_get_all_aws_services(dynamodb_table, table_name):
    # Given a DynamoDB table
    # When a GET / request is called
    items = app.get_aws_services(table_name)
    # Then the entire table is returned
    assert len(items) > 0
    assert items[0] == dynamodb_table


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
