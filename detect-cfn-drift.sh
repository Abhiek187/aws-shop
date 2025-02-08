# Check if the stack exists before proceeding
if ! aws cloudformation describe-stacks --stack-name $STACK_NAME &> /dev/null ; then
    echo "Stack $STACK_NAME doesn't exist, skipping..." && exit 0
fi

# Start stack drift detection
DRIFT_ID=$(aws cloudformation detect-stack-drift --stack-name $STACK_NAME | jq -r ".StackDriftDetectionId")

while : ; do
    # Wait until the drift check is complete
    DRIFT_OUTPUT=$(aws cloudformation describe-stack-drift-detection-status --stack-drift-detection-id $DRIFT_ID)
    DRIFT_STATUS=$(echo "$DRIFT_OUTPUT" | jq -r ".StackDriftStatus")
    DETECT_STATUS=$(echo "$DRIFT_OUTPUT" | jq -r ".DetectionStatus")

    echo "$DETECT_STATUS"
    [ $DETECT_STATUS == "DETECTION_IN_PROGRESS" ] || break
    sleep 1
done

if [ $DETECT_STATUS == "DETECTION_FAILED" ]; then
    echo "$DRIFT_OUTPUT"
    echo "Failed to detect drift. See details above." && exit 1
elif [ $DRIFT_STATUS == "DRIFTED" ]; then
    # There's a bug with CloudFront tags causing drift detection to always fail:
    # https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/901
    DRIFT_RESOURCES=$(aws cloudformation describe-stack-resource-drifts --stack-name AWS-Shop-Frontend-Stack --stack-resource-drift-status-filters DELETED MODIFIED)
    IS_DRIFT_BUG=$(echo "$DRIFT_RESOURCES" | jq -r '(.StackResourceDrifts | length == 1) and
        (.StackResourceDrifts[0].ResourceType == "AWS::CloudFront::Distribution") and
        (.StackResourceDrifts[0].PropertyDifferences | length == 1) and
        (.StackResourceDrifts[0].PropertyDifferences[0].PropertyPath == "/Tags")')
    
    if [ $IS_DRIFT_BUG == "true" ]; then
        echo "No drift detected. False positive found during drift detection."
    else
        echo "$DRIFT_RESOURCES"
        echo "The CloudFormation stack has drifted. See details above." && exit 1
    fi
else
    echo "No drift detected."
fi
