#!/bin/bash
# Rotate the AWS access keys every 90 days, based on:
# https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_RotateAccessKey
USERNAME=Abhiek187

aws iam create-access-key --user-name $USERNAME
aws iam update-access-key --user-name $USERNAME --access-key-id <access_key_id> --status Inactive
aws iam delete-access-key --user-name $USERNAME --access-key-id <access_key_id>
