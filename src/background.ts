"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain as ipc,
  session,
  BrowserView
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import axios, { AxiosResponse } from "axios";
import Store from "electron-store";
import { UnresolvedLoginCaptcha } from "./electronUtil/ElectronCaptcha";
const isDevelopment = process.env.NODE_ENV !== "production";

const store = new Store();

// Set axios defaults
// axios.defaults.headers["cookie"] = `.ROBLOSECURITY=${ROBLOSECURITY};`;
axios.defaults.withCredentials = true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

const filter = {
  urls: ["*://*.roblox.com/*"]
};

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 650,
    minHeight: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env
        .ELECTRON_NODE_INTEGRATION as unknown) as boolean
    },
    frame: true // TODO Add custom title bar
  });
  // ? win.removeMenu() causes a few bugs, so disable it only in production
  if (!((process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean))
    win.removeMenu();
  win.setTitle("Blox+");

  win.on("page-title-updated", e => e.preventDefault());

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  {
    const localStorageJson = store.get("localStorage") as string;
    if (localStorageJson) {
      const localStorage = JSON.parse(localStorageJson) as {
        [key: string]: unknown;
      };
      Object.entries(localStorage).forEach((key, value) => {
        const append = (typeof value === "string" && '"') || "";
        if (win)
          win.webContents.executeJavaScript(
            `window.localStorage.setItem("${key}", ${append}${value}${append})`
          );
      });
    }
  }

  win.on("close", () => {
    if (win)
      win.webContents
        .executeJavaScript("JSON.stringify({...window.localStorage})", true)
        .then(localStorageJson => {
          store.set("localStorage", localStorageJson);
        });
    return true;
  });

  win.on("closed", () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
  session.defaultSession.webRequest.onBeforeSendHeaders(
    filter,
    (details, callback) => {
      console.log("Outgoing request to a roblox url");
      details.requestHeaders["Origin"] = "https://www.roblox.com";
      details.referrer = "https://www.roblox.com/";
      callback({ requestHeaders: details.requestHeaders });
    }
  );
});

interface APIHistoryEntry {
  status: number;
  method: string;
  url: string;
  key?: string;
}

const apiHistory: APIHistoryEntry[] = [];
const getAPIHistory = () => apiHistory;

async function axiosRequestLegacy(
  event: Electron.IpcMainEvent,
  randomId: string,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any
) {
  data.data = data.body;
  axios(data)
    .then(response => {
      apiHistory.push({
        status: response.status,
        method: data.method,
        url: data.url,
        key: randomId
      });
      event.sender.send("axiosResult", randomId, {
        statusCode: response.status,
        body: response.data,
        headers: response.headers
      });
    })
    .catch(error => {
      if (error.response) {
        apiHistory.push({
          status: error.response.status,
          method: data.method,
          url: data.url,
          key: randomId
        });
        console.log("error by server");
        console.log(`[AXIOS/${error.response.status}] ${error.message}`);
        console.log(error.response.data);
        event.sender.send("axiosResult", randomId, {
          statusCode: error.response.status,
          body: error.response.data,
          headers: error.response.headers,
          isError: true
        });
      }
    });
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
async function axiosRequest(event: Electron.IpcMainInvokeEvent, data: any) {
  data.data = data.body;
  const response: AxiosResponse<any> = await axios(data).catch(
    error => error.response
  );
  if (!response) return {};
  apiHistory.push({
    status: response.status,
    method: data.method,
    url: data.url
  });
  return {
    statusCode: response.status,
    body: response.data,
    headers: response.headers
  };
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function retrieveRobloxCookie(event: Electron.IpcMainInvokeEvent) {
  return {
    cookie: store.get("roblox.cookie"),
    usePassword: store.get("roblox.usesPassword") || false
  };
}

function saveRobloxCookie(
  event: Electron.IpcMainInvokeEvent,
  cookie: string | { cookie: string },
  usesPassword = false
) {
  if (typeof cookie !== "string") cookie = cookie.cookie;
  store.set("roblox.cookie", cookie);
  store.set("roblox.usesPassword", usesPassword);
  return true;
}

ipc.on("axiosRequest", axiosRequestLegacy);
ipc.handle("axios", axiosRequest);
ipc.handle("getApiHistory", getAPIHistory);
ipc.handle("saveRobloxCookie", saveRobloxCookie);
ipc.handle("retrieveRobloxCookie", retrieveRobloxCookie);

ipc.handle(
  "retrieveLoginCaptchaToken",
  (_event, data: { fieldData: string }) => {
    return new Promise(async (resolve, reject) => {
      // Thanks @jmkd3v or helping me on this one
      const captcha_req = await axios({
        url: `https://roblox-api.arkoselabs.com/fc/gt2/public_key/476068BF-9607-4799-B53D-966BE98E2B81`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        data: `public_key=476068BF-9607-4799-B53D-966BE98E2B81&data[blob]=${data.fieldData}`
      });
      const unresolvedLoginCaptcha = new UnresolvedLoginCaptcha(
        captcha_req.data,
        "476068BF-9607-4799-B53D-966BE98E2B81"
      );
      const view = new BrowserView({
        webPreferences: {
          devTools: true
        }
      });
      if (win) {
        win.setBrowserView(view);
        view.setBounds({ x: 0, y: 0, width: 300, height: 300 });
        view.webContents.loadURL(unresolvedLoginCaptcha.url);
      } else {
        reject("The BrowserWindow does not exist");
      }
    });
  }
);

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
