import { AxiosRequestConfig } from "axios";

const { ipcRenderer } = window.require("electron");

const pendingPromises: { [key: string]: (reply: any) => void } = {};

export default function fetchDataAsync<T>(
  method: "get" | "post" | "fullPost",
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return new Promise((resolve, reject) => {
    const randomId =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);
    pendingPromises[randomId] = (reply: any) => resolve(reply);
    ipcRenderer.send(method, url, data, config, randomId);
  });
}

ipcRenderer.on("fetchResult", (event, randomId, data: unknown) => {
  if (pendingPromises[randomId]) {
    const callback = pendingPromises[randomId];
    delete pendingPromises[randomId];
    callback(data);
  }
});
