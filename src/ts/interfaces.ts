export interface AuthenticationData {
  id: number;
  name: string;
  displayName: string;
  thumbnail?: string;
}

export interface EconomyData {
  robux: number;
}

export interface CountData {
  friends?: number;
  messages?: number;
  trades?: number;
}

export interface CountEndpointResponse {
  count: number;
}

export interface FriendObject {
  created: Date;
  description: string;
  displayName: string;
  id: number;
  isBanned: boolean;
  isDeleted: boolean;
  isOnline: boolean;
  name: string;
  thumbnail?: string;
  presence?: PresenceData;
}

export enum UserPresenceType {
  OFFLINE = 0,
  ONLINE = 1,
  STUDIO = 2,
  PLAYING = 3
}

export interface PresenceData {
  gameId: number;
  lastLocation: string;
  lastOnline: Date;
  placeId: number;
  rootPlaceId: number;
  universeId: number;
  userId: number;
  userPresenceType: UserPresenceType;
}

export interface PresenceDataResponse {
  userPresences: PresenceData[];
}

export interface GameSortsResponse {
  gameFilters: {
    name: string;
    token: string;
    tokenExpiryInSeconds: number;
  }[];
  genreFilters: {
    name: string;
    token: string;
    tokenExpiryInSeconds: number;
  }[];
  pageContext: {
    pageId: string;
    isSeeAllPage: boolean;
  };
  sorts: {
    contextCountryRegionId: null;
    contextUniverseId: null;
    displayName: string;
    gameSetTargetId: null;
    genreOptionsAvailable: boolean;
    isDefaultSort: boolean;
    name: string;
    numberOfGames: number;
    numberOfRows: number;
    timeOptionsAvailable: boolean;
    token: string;
    tokenExpiryInSeconds: number;
  }[];
  timeFilters: {
    name: string;
    token: string;
    tokenExpiryInSeconds: number;
  }[];
}

export interface GameListGame {
  analyticsIdentifier: string | null;
  creatorId: number;
  creatorName: string;
  creatorType: "User" | "Group";
  imageToken: string;
  isSponsored: boolean;
  name: string;
  nativeAdData: unknown | null;
  placeId: number;
  playerCount: number;
  price: number | null;
  totalDownVotes: number;
  totalUpVotes: number;
  universeId: number;
  gameIcon?: string;
  id?: number;
}

export interface GameListResponse {
  algorithm: "GameSearchUsingSimilarQueryService";
  algorithmQueryType: "Bucketboost";
  correctedKeyword: string | null;
  cutOffIndex?: unknown;
  emphasis: boolean;
  featuredSearchUniverseId: number | null;
  filteredKeyword: string | null;
  games: GameListGame[];
  hasMoreRows: boolean;
  nextPageExclusiveStartId: number | null;
  relatedGames: [];
  suggestedKeyword: string | null;
  suggestionAlgorithm: "GameSuggestions_V2";
}

export interface HomeSorts {
  MyLibrary: GameListResponse;
  MyRecent?: GameListResponse;
  Favorites?: GameListResponse;
  PersonalRecommendation: GameListResponse;
  FriendActivity: GameListResponse;
}
