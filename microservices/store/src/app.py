import boto3
import json
import logging

dynamodb = boto3.client("dynamodb")
table_name = "AWS-Services"

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
        query_parameters = event.get("queryStringParameters")

        if route_key == "GET /":
            body = get_aws_services(query_parameters)
        elif route_key == "GET /health":
            body = ""
        else:
            raise Exception(f'Unsupported route: "{route_key}"')
    except Exception as e:
        # Catch-all for errors
        status_code = 400
        body = str(e)
    finally:
        # Don't stringify empty bodies
        if body:
            body = json.dumps(body)

    response = {"statusCode": status_code, "headers": headers, "body": body}
    LOG.info(f"{response=}")
    return response


def scan_table(table_name):
    # Don't return the lowercase columns to the frontend. They're only for querying.
    # Name and Unit are reserved words
    projection = "Id, #name, Description, Price, #unit, Category, FreeTier"
    attribute_names = {"#name": "Name", "#unit": "Unit"}

    response = dynamodb.scan(
        TableName=table_name,
        ProjectionExpression=projection,
        ExpressionAttributeNames=attribute_names,
    )
    return response["Items"]


def get_aws_services(query_parameters, table_name=table_name):
    if not query_parameters:
        return scan_table(table_name)

    query = query_parameters.get("query")
    category = query_parameters.get("category")
    min_price = query_parameters.get("min-price")
    max_price = query_parameters.get("max-price")
    free_tier = query_parameters.get("free-tier")

    # If min-price or max-price is passed, check to make sure they're numeric
    if min_price is not None and not is_number(min_price):
        raise Exception(f'min-price "{min_price}" is not numeric')
    if max_price is not None and not is_number(max_price):
        raise Exception(f'max-price "{max_price}" is not numeric')

    # ProjectionExpression = columns, KeyConditionExpression = rows, FilterExpression = less rows
    # Expression functions: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
    # PartiQL syntax: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.select.html
    table = f'"{table_name}"'  # table name must be surrounded in double quotes
    conditions = []

    if query is not None:
        # Case insensitive searching
        # Values must be in single quotes
        conditions.append(
            f"(contains(\"NameLower\", '{query.lower()}') OR contains(\"DescriptionLower\", '{query.lower()}'))"
        )
    if category is not None:
        conditions.append(f"Category = '{category}'")
    if min_price is not None:
        conditions.append(f"Price >= {min_price}")
    if max_price is not None:
        conditions.append(f"Price <= {max_price}")
    if free_tier is not None:
        conditions.append(
            "FreeTier IS NOT MISSING AND attribute_type(\"FreeTier\", 'N')"
        )

    if not conditions:
        raise Exception(f"Invalid query parameters passed")

    if query == free_tier == None and None not in {category, min_price, max_price}:
        # Utilize the index created to perform a query instead of a scan
        table += '."PriceIndex"'

    condition_expression = " AND ".join(conditions)
    projection = "Id, Name, Description, Price, Unit, Category, FreeTier"
    partiql_statement = f"SELECT {projection} FROM {table} WHERE {condition_expression}"
    LOG.info(f"{partiql_statement=}")
    response = dynamodb.execute_statement(Statement=partiql_statement)
    return response["Items"]


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False
