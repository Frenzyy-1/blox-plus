import { MutationTree } from "vuex";
import Vue from "vue";
import { CurrentUserState, Friend, User } from "./types";

export const mutations: MutationTree<CurrentUserState> = {
  currentUserFetched(state, payload: { currentUser: User }): void {
    state.user = payload.currentUser;
    state.dataFetched = true;
  },
  friendsFetched(state, payload: { friends: Friend[] }): void {
    Vue.set(state, "friends", [...payload.friends]);
    // state.friends = payload.friends;
  }
};
