import boto3
import pytest
import requests

"""
Make sure env variable AWS_SAM_STACK_NAME exists with the name of the stack we are going to test. 
"""


class TestApiGateway:
    @pytest.fixture
    def api_gateway_url(self):
        """Get the API Gateway URL from Cloudformation Stack outputs"""
        # stack_name = os.environ.get("AWS_SAM_STACK_NAME")
        stack_name = "AWS-Shop-Store-Service"

        if stack_name is None:
            raise ValueError(
                "Please set the AWS_SAM_STACK_NAME environment variable to the name of your stack"
            )

        client = boto3.client("cloudformation")

        try:
            response = client.describe_stacks(StackName=stack_name)
        except Exception as e:
            raise Exception(
                f"Cannot find stack {stack_name} \n"
                f'Please make sure a stack with the name "{stack_name}" exists'
            ) from e

        print(f"{response=}")
        stacks = response["Stacks"]
        stack_outputs = stacks[0]["Outputs"]
        output_key = "HttpApiUrl"
        api_outputs = [
            output for output in stack_outputs if output["OutputKey"] == output_key
        ]

        if not api_outputs:
            raise KeyError(f"{output_key} not found in stack {stack_name}")

        return api_outputs[0]["OutputValue"]  # Extract url from stack outputs

    def test_api_gateway(self, api_gateway_url):
        """Call the API Gateway endpoint and check the response"""
        response = requests.get(api_gateway_url)
        json = response.json()

        assert response.status_code == 200
        assert type(json) is list and len(json) > 0
