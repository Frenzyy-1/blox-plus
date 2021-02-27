import { EnumUserPresence } from "bloxy/dist/interfaces/GeneralInterfaces";

export interface CurrentUserState {
  dataFetched: boolean;
  user?: User;
  friends?: Friend[];
}

export interface User {
  name: string;
  displayname: string;
  id: number;
  membership: unknown;
  thumbnail: string;
}

export interface Friend {
  isOnline: boolean;
  isDeleted: boolean;
  description: string;
  created: string;
  isBanned: boolean;
  id: number;
  name: string;
  thumbnail: string;
  presence: PresenceData;
}

export enum UserPresenceType {
  OFFLINE = 0,
  ONLINE = 1,
  STUDIO = 2,
  PLAYING = 3
}

export interface PresenceData {
  gameId: string;
  lastLocation: string;
  lastOnline: string;
  placeId: number;
  rootPlaceId: number;
  universeId: number;
  userId: number;
  userPresenceType: EnumUserPresence;
}
