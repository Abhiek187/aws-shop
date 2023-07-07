# Start stack drift detection
DRIFT_ID=$(aws cloudformation detect-stack-drift --stack-name $STACK_NAME | jq -r ".StackDriftDetectionId" )

while : ; do
    # Wait until the drift check is complete
    read DRIFT_STATUS DETECT_STATUS < <(echo $(aws cloudformation describe-stack-drift-detection-status --stack-drift-detection-id $DRIFT_ID | jq -r ".StackDriftStatus, .DetectionStatus"))
    echo "$DETECT_STATUS"
    [ $DETECT_STATUS == "DETECTION_IN_PROGRESS" ] || break
    sleep 1
done

if [ $DETECT_STATUS == "DETECTION_FAILED" ]; then
    aws cloudformation describe-stack-drift-detection-status --stack-drift-detection-id $DRIFT_ID --debug
    echo "Failed to detect drift. See details above." && exit 1
elif [ $DRIFT_STATUS == "DRIFTED" ]; then
    aws cloudformation describe-stack-resource-drifts --stack-name $STACK_NAME --stack-resource-drift-status-filters DELETED MODIFIED --no-cli-pager
    echo "The CloudFormation stack has drifted. See details above." && exit 1
else
    echo "No drift detected."
fi
