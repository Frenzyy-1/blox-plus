import Vuex, { StoreOptions } from "vuex";
import Vue from "vue";
import { RootState } from "./types";
import { games } from "./modules/games/index";
import { currentUser } from "./modules/currentUser/index";

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  modules: {
    games,
    currentUser
  }
};

export default new Vuex.Store<RootState>(store);
