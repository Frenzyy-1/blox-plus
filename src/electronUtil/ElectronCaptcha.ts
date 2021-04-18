// Credits to @jmkd3v
// Converted to TypeScript from https://github.com/rbx-libdev/ro.py/blob/main/ro_py/captcha.py

interface UnresolvedLoginCaptchaData {
  token: string;
  challenge_url: string;
  challenge_url_cdn: string;
  noscript: string;
}

export class UnresolvedLoginCaptcha {
  readonly pkey: string;
  readonly token: string;
  readonly url: string;
  readonly challenge_url: string;
  readonly challenge_url_cdn: string;
  readonly noscript: string;

  constructor(data: UnresolvedLoginCaptchaData, pkey: string) {
    this.pkey = pkey;
    this.token = data.token;
    this.url =
      `https://roblox-api.arkoselabs.com/fc/api/nojs` +
      `?pkey=${pkey}` +
      `&session=${this.token.split("|")[0]}` +
      `&lang=en`;
    this.challenge_url = data.challenge_url;
    this.challenge_url_cdn = data.challenge_url_cdn;
    this.noscript = data.noscript;
  }
}

export class UnsolvedCaptcha {
  readonly pkey: string;
  readonly url: string;

  constructor(pkey: string) {
    this.pkey = pkey;
    this.url =
      `https://roblox-api.arkoselabs.com/fc/api/nojs` +
      `?pkey=${pkey}` +
      `&lang=en`;
  }
}
