# IAM Old

![Architecture Diagram](architecture-diagram.png)

## About

IAM Old is a service that checks the age of all the access keys for all IAM users daily. If the access key is 90 days old, an email is sent to remind the user to rotate their key.

**Note:** This service doesn't automatically rotate access keys since the secret is only displayed once and must be saved on the user's machine. Run [rotate-access-key.sh](../../rotate-access-key.sh) to accomplish both tasks.

## Directions

Run `sam build` to build the app and `sam deploy` to deploy the app using CloudFormation. When first creating the SNS topic, you will need to confirm your email subscription.
