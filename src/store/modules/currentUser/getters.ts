import { GetterTree } from "vuex";
import { CurrentUserState, Friend, User } from "./types";
import { RootState } from "../../types";

export const getters: GetterTree<CurrentUserState, RootState> = {
  user(state): User | undefined {
    return state.user;
  },
  friends(state): Friend[] | undefined {
    return state.friends;
  }
};
