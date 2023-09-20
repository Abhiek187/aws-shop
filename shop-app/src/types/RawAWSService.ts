import {
  NativeAttributeValue,
  NativeScalarAttributeValue,
} from "@aws-sdk/util-dynamodb";

//Record<string, Record<string, string | boolean>>
type RawAWSService = {
  Id: NativeAttributeValue;
  Name: NativeAttributeValue;
  Description: NativeAttributeValue;
  Price: NativeAttributeValue;
  Unit: NativeAttributeValue;
  Category: NativeAttributeValue;
  FreeTier?: NativeAttributeValue;
};

export default RawAWSService;
