import { GetterTree } from "vuex";
import { Game, GamesState } from "./types";
import { RootState } from "../../types";

export const getters: GetterTree<GamesState, RootState> = {
  game: state => (gameId: number): Game => {
    return state.games[gameId];
  },
  homeSorts: state => state.sorts.homeSorts,
  myRecentSort: state => state.sorts.homeSorts.myRecent,
  myFavoriteSort: state => state.sorts.homeSorts.myFavorite,
  friendActivitySort: state => state.sorts.homeSorts.friendActivity
};
