import bloxyClient from "@/util/bloxyClient";
import constants from "./constants";
import { shell } from "electron";

interface LaunchParameters {
  protocolName?: string;
  gameInfo?: string;
  launchTime?: number;
  launchMode?: string;
  otherParams?: OtherParameters;
  placeId?: number;
  userId?: number;
  isPlayTogetherGame?: boolean;
}

type OtherParameters = { [key: string]: string | number | boolean };

class LaunchProtocolCreator {
  public protocolName?: string;
  public urlSeparator?: string;
  public urlProtocolVersion?: number;
  public urlComponents: string[];
  public gameInfo?: string;
  public otherParams?: OtherParameters;
  public launchTime?: number;
  public launchMode?: string;

  constructor() {
    this.urlComponents = [];
    this.otherParams = {};
  }

  public setProtocolName(protocolName?: string): this {
    this.protocolName = protocolName;
    return this;
  }

  public setUrlSeparator(urlSeparator: string): this {
    this.urlSeparator = urlSeparator;
    return this;
  }

  public setUrlProtocolVersion(urlProtocolVersion: number): this {
    this.urlProtocolVersion = urlProtocolVersion;
    return this;
  }

  public setGameInfo(gameInfo?: string): this {
    this.gameInfo = gameInfo;
    return this;
  }

  public setOtherParams(otherParams?: OtherParameters): this {
    this.otherParams = otherParams;
    return this;
  }

  public addOtherParam(key: string, value: string): this {
    if (this.otherParams) this.otherParams[key] = value;
    return this;
  }

  public setLaunchTime(launchTime: number): this {
    this.launchTime = launchTime;
    return this;
  }

  public setLaunchMode(launchMode?: string): this {
    this.launchMode = launchMode;
    return this;
  }

  public build(): string {
    this.urlComponents = [];
    if (!this.protocolName || !this.urlSeparator)
      throw new Error("Missing core values");
    let launchParameter = `${this.protocolName}:`;
    this.urlComponents.push("1");
    this.urlComponents.push(`launchmode:${this.launchMode}`);
    if (this.gameInfo)
      this.urlComponents.push(`gameinfo:${encodeURIComponent(this.gameInfo)}`);
    if (this.launchTime)
      this.urlComponents.push(`launchtime:${this.launchTime}`);

    if (this.otherParams) {
      for (const key in this.otherParams) {
        const value = this.otherParams[key];
        this.urlComponents.push(`${key}:${encodeURIComponent(value)}`);
      }
    }

    launchParameter += this.urlComponents.join(this.urlSeparator);

    return launchParameter;
  }
}

/*
roblox-player:1+
launchmode:play+
gameinfo:${authTicket}+
launchtime:${new Date().getUTCMilliseconds()}+
placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26browserTrackerId%3D${trackerId}%26placeId%3D${placeId}%26isPlayTogetherGame%3Dfalse+
browsertrackerid:${trackerId}+
robloxLocale:en_us+
gameLocale:en_us+
channel:
*/

const isStudioMode = (launchMode: string) =>
  launchMode === constants.LAUNCH_MODES.EDIT ||
  launchMode === constants.LAUNCH_MODES.PLUGIN ||
  launchMode === constants.LAUNCH_MODES.ASSET;

function getAuthTicket() {
  return bloxyClient.apis.authAPI.getAuthTicket();
}

function createLaunchProtocolUrl(launchParameters: LaunchParameters) {
  const launchProtocolCreator = new LaunchProtocolCreator();
  launchProtocolCreator.urlSeparator = constants.PROTOCOL.URL.SEPARATOR;
  launchProtocolCreator
    .setProtocolName(launchParameters.protocolName)
    .setOtherParams(launchParameters.otherParams)
    .setLaunchMode(launchParameters.launchMode);
  if (launchParameters.launchTime)
    launchProtocolCreator.launchTime = launchParameters.launchTime;
  if (launchParameters.gameInfo)
    launchProtocolCreator.setGameInfo(launchParameters.gameInfo);

  return launchProtocolCreator.build();
}

function launchFlow(protocolUrl: string) {
  console.log(protocolUrl);
  return shell.openExternal(protocolUrl);
}

export async function startGame(defaultLaunchParameters: LaunchParameters) {
  const launchParameters = { ...defaultLaunchParameters };
  launchParameters.launchTime = new Date().getTime();
  launchParameters.gameInfo = (await getAuthTicket()).authTicket;

  launchParameters.otherParams = launchParameters.otherParams || {};
  launchParameters.otherParams.robloxLocale = "en_us";
  launchParameters.otherParams.gameLocale = "en_us";
  launchParameters.otherParams.channel =
    (launchParameters.protocolName === constants.PROTOCOL.NAMES.STUDIO &&
      constants.PROTOCOL.CHANNELS.STUDIO) ||
    constants.PROTOCOL.CHANNELS.PLAYER;

  launchFlow(createLaunchProtocolUrl(launchParameters));
}

function placeLauncherUrl(
  requestType: string,
  otherParams: OtherParameters | LaunchParameters
) {
  const absoluteUrl = `https://assetgame.roblox.com/Game/PlaceLauncher.ashx?`;
  const launchArguments = {
    request: requestType,
    ...otherParams
  };
  return `${absoluteUrl}${Object.entries(launchArguments)
    .map(([value, key]) => `${value}=${key}`)
    .join("&")}`;
}

function studioLauncherUrl(
  placeId: number,
  universeId: number,
  allowUpload = false
) {
  const absoluteUrl = `https://assetgame.roblox.com/Game/Edit.ashx?`;
  const launchArguments = {
    placeId,
    upload: allowUpload ? placeId : "",
    universeId
  };
  return `${absoluteUrl}${Object.entries(launchArguments)
    .map(([value, key]) => `${value}=${key}`)
    .join("&")}`;
}

export function openStudio() {
  return startGame({
    protocolName: constants.PROTOCOL.NAMES.STUDIO,
    launchMode: constants.LAUNCH_MODES.EDIT,
    otherParams: {}
  });
}

export function openPluginInStudio(pluginId: number) {
  return startGame({
    protocolName: constants.PROTOCOL.NAMES.STUDIO,
    launchMode: constants.LAUNCH_MODES.PLUGIN,
    otherParams: {
      pluginid: pluginId
    }
  });
}

export function editGameInStudio(
  placeId: number,
  universeId: number,
  allowUpload: boolean
) {
  return startGame({
    protocolName: constants.PROTOCOL.NAMES.STUDIO,
    launchMode: constants.LAUNCH_MODES.EDIT,
    otherParams: {
      script: studioLauncherUrl(placeId, universeId, allowUpload)
    },
    placeId
  });
}

export function joinMultiplayerGame(launchParameters: LaunchParameters) {
  return startGame({
    protocolName: constants.PROTOCOL.NAMES.CLIENT,
    launchMode: constants.LAUNCH_MODES.PLAY,
    otherParams: {
      placelauncherurl: placeLauncherUrl("RequestGame", launchParameters)
    },
    placeId: launchParameters.placeId,
    isPlayTogetherGame: launchParameters.isPlayTogetherGame === true
  });
}

export function followPlayerIntoGame(launchParameter: LaunchParameters) {
  return startGame({
    protocolName: constants.PROTOCOL.NAMES.CLIENT,
    launchMode: constants.LAUNCH_MODES.PLAY,
    otherParams: {
      placelauncherurl: placeLauncherUrl("RequestFollowUser", launchParameter)
    }
  });
}
