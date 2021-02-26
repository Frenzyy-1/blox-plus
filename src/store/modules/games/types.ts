import { PlaceOptions } from "bloxy/dist/structures";

export interface GamesState {
  games: Record<number, Game>;
  sorts: {
    homeSorts: {
      myRecent?: Game[];
      personalRecommendation?: Game[];
      friendActivity?: Game[];
      myFavorite?: Game[];
    };
  };
}

export interface UniverseThumbnails {
  targetId: number;
  state: string;
  imageUrl: string;
}

export interface Game extends PlaceOptions {
  thumbnails: UniverseThumbnails[];
}
