# AWS Shop

![AWS CodeBuild](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiL2NLTUo2Y2M4Y2VCZDNUdWFMTGUyN25BTzRMby8vbTJKQ0hidUVBTlZFSXpObE9OMnlxMFAyMVViamc5Z2NvWGdLZy9UZlAxdCtvY2svbGdUT1plSU1vPSIsIml2UGFyYW1ldGVyU3BlYyI6IlNEdldyWkllMnBJWEl5c2UiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=main)
[![CloudFormation CI/CD](https://github.com/Abhiek187/aws-shop/actions/workflows/cfn.yml/badge.svg)](https://github.com/Abhiek187/aws-shop/actions/workflows/cfn.yml)
[![CodeQL](https://github.com/Abhiek187/aws-shop/actions/workflows/codeql.yml/badge.svg)](https://github.com/Abhiek187/aws-shop/actions/workflows/codeql.yml)
[![Dependency Review](https://github.com/Abhiek187/aws-shop/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/Abhiek187/aws-shop/actions/workflows/dependency-review.yml)
[![Node.js CI/CD](https://github.com/Abhiek187/aws-shop/actions/workflows/node.js.yml/badge.svg)](https://github.com/Abhiek187/aws-shop/actions/workflows/node.js.yml)
[![Python CI/CD](https://github.com/Abhiek187/aws-shop/actions/workflows/python-app.yml/badge.svg)](https://github.com/Abhiek187/aws-shop/actions/workflows/python-app.yml)

A basic shopping app that utilizes various AWS services

## Architecture Diagram

(_Tentative_)

![AWS Shop architecture diagram](arch-diagram.jpg)

**Front End**

- CodeBuild is used to test the React app, build it, and deploy to S3.
- The S3 bucket will hold the optimized production build for the React app. Since CloudFront will host the website, we don't need to enable static website hosting on the bucket. And I made sure to secure the bucket from public access. A bucket policy was created to only make the website accessible by a secure CloudFront distribution.
- CloudFront hosts the website across multiple edge locations across North America, Europe, and Israel (to save on costs). It uses Origin Access Control (OAC) to securely connect to S3 as its origin.

## Directions

1. Build the infrastructure using CloudFormation.
2. Use CodeBuild to test the app, build it, and upload the build to S3.

## Using the CLI

Download the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). Then run `aws configure` and pass in your access key ID, secret access key, default region, and default ouput format. (Run `aws sts get-caller-identity` to verify you're signed in as the right user.)

### CloudFormation Commands

Create stack:

```bash
aws cloudformation create-stack --stack-name NAME --template-body FILE_PATH --parameters ParameterKey=KEY,ParameterValue=VALUE --capabilities CAPABILITY_NAMED_IAM
```

List stacks:

```bash
aws cloudformation list-stacks
aws cloudformation describe-stacks # more detailed than list-stacks
```

Update stack:

```bash
aws cloudformation update-stack --stack-name NAME --template-body FILE_PATH --parameters ParameterKey=KEY,UsePreviousValue=true
```

Delete stack:

```bash
aws cloudformation delete-stack --stack-name NAME
```

Detect stack drift:

```bash
aws cloudformation detect-stack-drift --stack-name NAME
```

Describe stack drift:

```bash
aws cloudformation describe-stack-resource-drifts --stack-name NAME --stack-resource-drift-status-filters DELETED MODIFIED
```

Describe stack drift status:

```bash
aws cloudformation describe-stack-drift-detection-status --stack-drift-detection-id DRIFT_ID
```

Create change set:

```bash
aws cloudformation create-change-set --stack-name NAME --change-set-name CHANGE_SET --template-body FILE_PATH --capabilities CAPABILITY_NAMED_IAM
```

List change sets:

```bash
aws cloudformation list-change-sets --stack-name my-stack
```

Describe change set:

```bash
aws cloudformation describe-change-set --stack-name NAME --change-set-name CHANGE_SET
```

Execute change set:

```bash
aws cloudformation execute-change-set --stack-name NAME --change-set-name CHANGE_SET
```

Delete change set:

```bash
aws cloudformation delete-change-set --stack-name NAME --change-set-name CHANGE_SET
```

#### cfn-guard

To run a security check of a CloudFormation template, follow [these steps](https://docs.aws.amazon.com/cfn-guard/latest/ug/setting-up-linux.html) to install `cfn-guard`. Then run:

```bash
cfn-guard validate --show-summary [pass|fail] --output-format [single-line-summary|json|yaml] --data FILE --rules cfn-guard-rules/
```

### CodeBuild Commands

Start build:

```bash
aws codebuild start-build --project-name NAME
```

List projects:

```bash
aws codebuild list-projects
```

List builds:

```bash
aws codebuild list-builds
aws codebuild list-builds-for-project --project-name NAME
```

Stop build:

```bash
aws codebuild stop-build --id BUILD_ID
```

### DynamoDB Commands

List tables:

```bash
aws dynamodb list-tables
```

Describe table:

```bash
aws dynamodb describe-table --table-name TABLE_NAME
```

Query table:

```bash
aws dynamodb query --table-name AWS-Services --projection-expression "Name,Price" --key-condition-expression "Category = :free" --expression-attribute-values file://expression-attributes.json --return-consumed-capacity TOTAL
```

Update table:

```bash
aws dynamodb batch-write-item --request-items file://aws-services.json --return-consumed-capacity INDEXES --return-item-collection-metrics SIZE
```

## Rotating Access Keys

Rotate your access keys every 60 days by running the following shell script ([jq](https://stedolan.github.io/jq/) is required):

```bash
chmod u+x rotate-access-key.sh
./rotate-access-key.sh
```
