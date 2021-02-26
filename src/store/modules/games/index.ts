import { Module } from "vuex";
import { getters } from "./getters";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { GamesState } from "./types";
import { RootState } from "../../types";

export const state: GamesState = {
  games: {},
  sorts: {
    homeSorts: {
      myRecent: undefined,
      myFavorite: undefined,
      friendActivity: undefined
    }
  }
};

const namespaced = true;

export const games: Module<GamesState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations
};
