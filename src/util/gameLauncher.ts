import bloxyClient from "./bloxyClient";
import { shell } from "electron";

const launcher = (
  authTicket: string,
  placeId: string | number,
  trackerId: string
) =>
  `roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${new Date().getUTCMilliseconds()}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26browserTrackerId%3D${trackerId}%26placeId%3D${placeId}%26isPlayTogetherGame%3Dfalse+browsertrackerid:${trackerId}+robloxLocale:en_us+gameLocale:en_us+channel:`;

export default async function launchGame(
  placeId: number | string | null
): Promise<void> {
  const ticket = await bloxyClient.apis.authAPI.getAuthTicket();
  const launcherLink = launcher(
    ticket.authTicket,
    placeId as number,
    `${Math.floor(Math.random() * 10000000000) + 50000000000}`
  );
  console.log(launcherLink);
  shell.openExternal(launcherLink);
}
