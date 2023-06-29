type AWSService = {
  Id: string;
  Name: string;
  Description: string;
  Price: number;
  Unit: string;
  Category: string;
  FreeTier?: number | null;
};

export default AWSService;
