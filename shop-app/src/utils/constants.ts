export abstract class Constants {
  static readonly BASE_URL = "https://dovshfcety3as.cloudfront.net";

  static Cognito = class {
    static readonly REGION = "us-east-1";
    static readonly BASE_URL = `https://my-shop.auth.${this.REGION}.amazoncognito.com`;
    static readonly CLIENT_ID = "7mqvhnrmc8kkg4ha572stgv14k";
    static readonly SCOPES = "email openid phone";
  };

  static SessionStorage = class {
    static readonly STATE = "state";
    static readonly CODE_VERIFIER = "codeVerifier";
    static readonly NONCE = "nonce";
  };

  static LocalStorage = class {
    static readonly REFRESH_TOKEN = "refreshToken";
  };
}
