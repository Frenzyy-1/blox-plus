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
  },
  state: {
    flags: {}
  },
  mutations: {
    flagsChanged(state, payload) {
      if (!payload) return;
      Object.entries(payload).forEach(([key, _data]) => {
        const data = _data as {
          id: number;
          enabled?: boolean;
          value?: unknown;
        };
        if (data.enabled !== undefined && data.enabled !== null) {
          Vue.set(state.flags, key, data.enabled);
        } else if (data.value !== undefined && data.value !== null) {
          Vue.set(state.flags, key, data.value);
        }
      });
    }
  }
};

const VueXStore = new Vuex.Store<RootState>(store);

export default VueXStore;
