import { Module } from "vuex";
import { getters } from "./getters";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { CurrentUserState, User } from "./types";
import { RootState } from "../../types";

export const state: CurrentUserState = {
  dataFetched: false,
  user: undefined,
  friends: undefined
};

const namespaced = true;

export const currentUser: Module<CurrentUserState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations
};
