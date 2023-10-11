# SAM (Serverless Application Model)

Install the [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html). To test locally, make sure [Docker](https://docs.docker.com/get-docker/) is installed and running. Then run the following commands:

1. Build the serverless code: `sam build --use-container`
2. _(Optional)_ Validate the SAM template: `sam validate`
3. _(Optional)_ Generate a sample event: `sam local generate-event RESOURCE COMMAND`
4. _(Optional)_ Invoke the Lambda function locally: `sam local invoke -e EVENT_PATH`. You can combine it with `generate-event` like so: `sam local generate-event RESOURCE COMMAND | sam local invoke -e -`.
5. _(Optional)_ Start API Gateway locally: `sam local start-api`. Then call `GET http://localhost:3000/`. Once done, press CTRL-C to stop the server.
6. _(Optional)_ Run a local Lambda server: `sam local start-lambda`. Then invoke the function using the server as the endpoint: `aws lambda invoke --cli-binary-format raw-in-base64-out --function-name FUNCTION --payload EVENT_FILE_PATH /dev/stdout --endpoint-url http://localhost:3001`. Once done, press CTRL-C to stop the server.
7. _(Optional)_ Test the code using pytest.
   1. Create a virtual environment: `python3 -m venv venv`. Then source into that virtual environment: `source venv/bin/activate`.
   2. Install all dependencies: `pip3 install -r requirements.txt`
   3. Run the unit and integration tests: `python3 -m pytest`
   4. Deactivate the virtual environment: `deactivate`
8. Deploy the serverless code using CloudFormation: `sam deploy --guided`
   - When first creating the stack, run `sam deploy --parameter-overrides ParameterKey=Email,ParameterValue=YOUR_EMAIL_ADDRESS`, replacing YOUR_EMAIL_ADDRESS with your email address. You need to confirm your email subscription to get added to the SNS topic.

To delete all resources, run `sam delete`

# Microservices

## Store

`aws-services.json` is the source of truth for items stored in the DynamoDB table. Whenever that file gets updated, run `python3 populate-dynamodb-table.py` to ensure the DynamoDB table is in sync. This requires having read and write access to the DynamoDB table. boto3 and other dependencies can be installed by running `pip3 install -r requirements.txt`.
