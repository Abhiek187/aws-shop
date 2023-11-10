export abstract class Constants {
  static readonly BASE_URL = "https://dovshfcety3as.cloudfront.net";

  static Cognito = class {
    static readonly REGION = "us-east-1";
    static readonly USER_POOL_ID = `${this.REGION}_9VUkicRKi`;
    static readonly BASE_URL = `https://my-shop.auth.${this.REGION}.amazoncognito.com`;
    static readonly IDP_BASE_URL = `https://cognito-idp.${this.REGION}.amazonaws.com/${this.USER_POOL_ID}`;
    static readonly CLIENT_ID = "7mqvhnrmc8kkg4ha572stgv14k";
    static readonly SCOPES = "email openid phone";
  };

  static LocalStorage = class {
    static readonly REFRESH_TOKEN = "refreshToken";
  };
}
