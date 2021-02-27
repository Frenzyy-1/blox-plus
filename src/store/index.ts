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

const VueXStore = new Vuex.Store<RootState>(store);

export default VueXStore;
