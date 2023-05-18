# SAM (Serverless Application Model)

Install the [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html). To test locally, make sure [Docker](https://docs.docker.com/get-docker/) is installed and running. Then run the following commands:

1. Build the serverless code: `sam build`
2. _(Optional)_ Validate the SAM template: `sam validate`
3. _(Optional)_ Invoke the Lambda function locally: `sam local invoke`
4. _(Optional)_ Start API Gateway locally: `sam local start-api`. Then call `GET http://127.0.0.1:3000/`. Once done, press CTRL-C to stop the server.
5. _(Optional)_ Test the code using pytest.
   1. _(Optional)_ Go to the `tests` directory and create a virtual environment: `python3 -m venv venv`. Then source into that virtual environment: `source venv/bin/activate`.
   2. Install all dependencies: `pip3 install -r requirements.txt`
   3. Run the unit and integration tests: `pytest`
   4. Deactivate the virtual environment: `deactivate`
6. Deploy the serverless code using CloudFormation: `sam deploy --guided`

To delete all resources, run `sam delete`
