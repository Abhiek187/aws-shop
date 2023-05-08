import json
import boto3

dynamodb = boto3.resource("dynamodb")
table_name = "AWS-Services"
table = dynamodb.Table(table_name)


def handler(event, context):
    print(f"{event=}")
    print(f"{context=}")

    body = ""
    status_code = 200
    headers = {
        "Content-Type": "application/json",
    }

    try:
        route_key = event["routeKey"]
        path_parameters = event["pathParameters"]

        # if route_key == "DELETE /items/{id}":
        #     table.delete_item(Key={"id": path_parameters["id"]})
        #     body = f"Deleted item {path_parameters['id']}"
        # elif route_key == "GET /items/{id}":
        #     response = table.get_item(Key={"id": path_parameters["id"]})
        #     body = response["Item"]
        # elif route_key == "GET /items":
        #     response = table.scan()
        #     body = response["Items"]
        # elif route_key == "PUT /items":
        #     request_json = json.loads(event["body"])
        #     table.put_item(
        #         Item={
        #             "id": request_json["id"],
        #             "price": request_json["price"],
        #             "name": request_json["name"],
        #         }
        #     )
        #     body = f"Put item {request_json['id']}"
        if route_key == "GET /":
            response = table.scan()
            print(f"{response=}")
            body = response["Items"]
        else:
            raise Exception(f'Unsupported route: "{route_key}"')
    except Exception as e:
        status_code = 400
        body = str(e)
    finally:
        body = json.dumps(body)

    return {"statusCode": status_code, "headers": headers, "body": body}
