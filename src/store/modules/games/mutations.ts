import { MutationTree } from "vuex";
import Vue from "vue";
import { Game, GamesState } from "./types";

export const mutations: MutationTree<GamesState> = {
  gameFetched(state, payload: Game): void {
    Vue.set(state.games, payload.placeId, payload);
  },
  gamesFetched(state, payload: Game[]): void {
    payload.forEach(game => Vue.set(state.games, game.placeId, game));
  },
  homeSortsFetched(
    state,
    payload: { myRecent: Game[]; myFavorite: Game[]; friendActivity: Game[] }
  ) {
    state.sorts.homeSorts.myRecent = payload.myRecent;
    state.sorts.homeSorts.myFavorite = payload.myFavorite;
    state.sorts.homeSorts.friendActivity = payload.friendActivity;
  }
};
