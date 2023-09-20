//Record<string, Record<string, string | boolean>>
type RawAWSService = {
  Id: Record<string, string>;
  Name: Record<string, string>;
  Description: Record<string, string>;
  Price: Record<string, string>;
  Unit: Record<string, string>;
  Category: Record<string, string>;
  FreeTier?: Record<string, string | boolean>;
};

export default RawAWSService;
