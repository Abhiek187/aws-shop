#!/bin/bash
# Rotate the AWS access keys every 90 days, based on:
# https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_RotateAccessKey
USERNAME=Abhiek187

# Get the current access key ID (-r removes "" from strings)
OLD_ACCESS_KEY_ID=$(aws iam list-access-keys --user-name $USERNAME | jq -r ".AccessKeyMetadata[0].AccessKeyId")

# Generate new credentials and save them to ~/.aws/credentials
echo "Generating new credentials..."
read NEW_ACCESS_KEY_ID NEW_SECRET_ACCESS_KEY < <(echo $(aws iam create-access-key --user-name $USERNAME | jq -r ".AccessKey.AccessKeyId, .AccessKey.SecretAccessKey"))
aws configure set aws_access_key_id $NEW_ACCESS_KEY_ID
aws configure set aws_secret_access_key $NEW_SECRET_ACCESS_KEY
echo "Saving new credentials to ~/.aws/credentials..."
sleep 10 # wait for the file to be saved to start using new credentials

# Delete the old credentials
echo "Deleting old credentials..."
aws iam update-access-key --user-name $USERNAME --access-key-id $OLD_ACCESS_KEY_ID --status Inactive
aws iam delete-access-key --user-name $USERNAME --access-key-id $OLD_ACCESS_KEY_ID
echo "Your access keys have been rotated successfully!"
