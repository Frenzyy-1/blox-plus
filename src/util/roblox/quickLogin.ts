import EventEmitter from "events";
import bloxyClient from "@/util/bloxyClient";

interface RESTResponseDataType<T> {
  body: T;
  status: string;
  statusCode: number;
  headers: Record<string, string>;
}

export type AuthTokenStatus =
  | "Created"
  | "UserLinked"
  | "Cancelled"
  | "Validated";

interface AuthTokenCreateResponse {
  code: string;
  status: AuthTokenStatus;
  privateKey: string;
  expirationTime: string;
}

interface AuthTokenStatusResponse {
  status: AuthTokenStatus;
  accountName?: string;
  accountPictureUrl?: string;
  expirationTime: string;
}

export interface QuickLoginStateChange {
  flowActive: boolean;
  code: string;
  status: AuthTokenStatus;
  expiration: Date;
  accountName?: string;
  accountPictureUrl?: string;
}

class QuickLogin extends EventEmitter {
  private flowActive: boolean;
  private code: string;
  private privateKey: string;
  public status: AuthTokenStatus | undefined;
  private expiration: Date;

  public accountName: string | undefined;
  public accountPictureUrl: string | undefined;

  private intervalId: NodeJS.Timeout | undefined;

  constructor() {
    super();

    this.flowActive = false;
    this.code = "";
    this.privateKey = "";
    this.status = undefined;
    this.expiration = new Date();

    this.intervalId = undefined;
  }

  public async startFlow() {
    this.flowActive = true;

    this.intervalId = setInterval(this.checkStatus.bind(this), 5000);

    return await this.getCode();
  }

  private async getCode() {
    const request: RESTResponseDataType<AuthTokenCreateResponse> = await bloxyClient.rest.request(
      {
        method: "POST",
        url: "https://apis.roblox.com/auth-token-service/v1/login/create",
        headers: {
          ["Origin"]: "https://www.roblox.com",
          ["Referer"]: "https://www.roblox.com/"
        }
      }
    );
    const { code, status, privateKey, expirationTime } = request.body;
    this.code = code;
    this.status = status;
    this.privateKey = privateKey;
    this.expiration = new Date(expirationTime + "Z");

    return { code, status, expirationTime: this.expiration.toISOString() };
  }

  public async stopFlow() {
    this.flowActive = false;
    this.code = "";
    this.privateKey = "";
    this.status = undefined;
    this.accountName = undefined;
    this.accountPictureUrl = undefined;
    this.expiration = new Date();

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = undefined;
  }

  private async checkStatus() {
    const request: RESTResponseDataType<AuthTokenStatusResponse> = await bloxyClient.rest.request(
      {
        method: "POST",
        url: "https://apis.roblox.com/auth-token-service/v1/login/status",
        headers: {
          ["Origin"]: "https://www.roblox.com",
          ["Referer"]: "https://www.roblox.com/"
        },
        body: {
          code: this.code,
          privateKey: this.privateKey
        }
      }
    );

    if (request.statusCode === 200) {
      if (
        request.body.status !== this.status &&
        request.body.status !== "Validated"
      ) {
        this.status = request.body.status;
        this.accountName = request.body.accountName;
        this.accountPictureUrl = request.body.accountPictureUrl;
        this.emit("stateChange", {
          code: this.code,
          expiration: this.expiration,
          flowActive: this.flowActive,
          status: this.status,
          accountName: this.accountName,
          accountPictureUrl: this.accountPictureUrl
        } as QuickLoginStateChange);
      }
      if (request.body.status === "Validated") {
        this.emit("authorized", {
          code: this.code,
          privateKey: this.privateKey,
          status: this.status
        });
        this.stopFlow();
      }
    } else {
      await this.getCode();
      this.emit("stateChange", {
        code: this.code,
        expiration: this.expiration,
        flowActive: this.flowActive,
        status: this.status,
        accountName: this.accountName,
        accountPictureUrl: this.accountPictureUrl
      } as QuickLoginStateChange);
    }
  }

  convertStatusToNumber(status: AuthTokenStatus) {
    switch (status) {
      case "Created":
        return 1;
      case "UserLinked":
        return 2;
      case "Validated":
        return 3;
      case "Cancelled":
        return -1;
      default:
        return 0;
    }
  }
}

export default QuickLogin;
