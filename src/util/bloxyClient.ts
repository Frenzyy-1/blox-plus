import { Client } from "bloxy";
import got from "got";
import axios from "axios";
import { RESTResponseDataType } from "bloxy/dist/interfaces/RESTInterfaces";

interface AxiosResponse {
  statusCode: any;
  body: any;
  headers: any;
}

const { ipcRenderer } = window.require("electron");

const pendingPromises: { [key: string]: (reply: any) => void } = {};

// TODO Rewrite it to use ipcRenderer.invoke()

function fetchDataAsync<T>(data: any): Promise<T> {
  return new Promise((resolve, reject) => {
    const randomId =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);
    pendingPromises[randomId] = (reply: any) => resolve(reply);
    ipcRenderer.send("axiosRequest", randomId, data);
  });
}

ipcRenderer.on("axiosResult", (event, randomId, data: unknown) => {
  if (pendingPromises[randomId]) {
    const callback = pendingPromises[randomId];
    delete pendingPromises[randomId];
    callback(data);
  }
});

const headers: { [key: string]: string } = {
  cookie: ""
};

function updateHeaders(res: AxiosResponse) {
  const setCookies = res.headers["set-cookie"] as string[];
  if (setCookies)
    setCookies.forEach(newCookie => {
      headers.cookie += `${newCookie}; `;
    });
  if (res.headers["x-csrf-token"])
    headers["x-csrf-token"] = res.headers["x-csrf-token"];
}

const bloxyClient = new Client({
  rest: {
    requester: async requestOptions => {
      if (!requestOptions.headers) requestOptions.headers = {};
      requestOptions.headers["Cookie"] += `; ${headers.cookie}`;
      const res = await fetchDataAsync<AxiosResponse>(requestOptions);
      updateHeaders(res);
      return res as RESTResponseDataType;
    }
  }
});

export default bloxyClient;
