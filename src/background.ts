"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain as ipc,
  session
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import axios from "axios";
const isDevelopment = process.env.NODE_ENV !== "production";

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
  key: string;
}

const apiHistory: APIHistoryEntry[] = [];
const getAPIHistory = () => apiHistory;

async function axiosRequest(
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

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function retrieveRobloxCookie(event: Electron.IpcMainInvokeEvent) {
  return undefined;
}

ipc.on("axiosRequest", axiosRequest);
ipc.handle("getApiHistory", getAPIHistory);
ipc.handle("retrieveRobloxCookie", retrieveRobloxCookie);

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
