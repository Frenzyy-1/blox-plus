import bloxyClient from "@/util/bloxyClient";
import { ipcRenderer } from "electron";

export interface AuthenticationState {
  complete: boolean;
}

export async function quickCodeLogin(code: string, privateKey: string) {
  const response = await bloxyClient.rest
    .request({
      method: "POST",
      url: "https://auth.roblox.com/v2/login",
      body: {
        ctype: "AuthToken",
        cvalue: code,
        password: privateKey
      }
    })
    .catch(error => console.warn(error));

  console.log(response);

  return response;
}
