import {
  AuthenticationData,
  CountData,
  CountEndpointResponse,
  EconomyData,
  FriendObject,
  GameListGame,
  GameListResponse,
  GameSortsResponse,
  HomeSorts,
  PresenceDataResponse
} from "@/ts/interfaces";
import { AxiosRequestConfig } from "axios";
import Vue from "vue";
import Vuex from "vuex";
const { ipcRenderer } = window.require("electron");

const pendingDataFetches: { [key: string]: (reply: any) => void } = {};
const pendingPromises: { [key: string]: (reply: any) => void } = {};

function fetchData<T>(
  method: "get" | "post",
  url: string,
  data: unknown,
  callback: (reply: T) => void
) {
  const randomId =
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15);
  pendingDataFetches[randomId] = callback;
  ipcRenderer.send(method, url, data, {}, randomId);
}

function fetchDataAsync<T>(
  method: "get" | "post",
  url: string,
  data: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return new Promise((resolve, reject) => {
    const randomId =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15);
    pendingPromises[randomId] = (reply: any) => resolve(reply);
    ipcRenderer.send(method, url, data, config, randomId);
  });
}

ipcRenderer.on("fetchResult", (event, randomId, data: unknown) => {
  if (pendingDataFetches[randomId]) {
    const callback = pendingDataFetches[randomId];
    delete pendingDataFetches[randomId];
    callback(data);
  }
  if (pendingPromises[randomId]) {
    const callback = pendingPromises[randomId];
    delete pendingPromises[randomId];
    callback(data);
  }
});

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authenticatedUser: (null as unknown) as AuthenticationData,
    economyData: (null as unknown) as EconomyData,
    friends: [] as FriendObject[],
    counts: { friends: 0, messages: 0, trades: 0 } as CountData,
    homeSorts: {} as HomeSorts,

    menuOpen: false,
    searchOpen: false
  },
  mutations: {
    setAuthenticationData(state, newAuthenticationData: AuthenticationData) {
      state.authenticatedUser = newAuthenticationData;
    },
    setAuthenticationThumbnail(state, newThumbnailUrl: string) {
      state.authenticatedUser.thumbnail = newThumbnailUrl;
    },
    setEconomyData(state, newEconomyData: EconomyData) {
      state.economyData = newEconomyData;
    },
    setFriendData(state, newFriendData: FriendObject[]) {
      state.friends = newFriendData;
    },
    setCountData(state, newCountData: CountData) {
      state.counts = newCountData;
    },
    patchCountData(state, newCountData: CountData) {
      if (!state.counts) state.counts = { friends: 0, messages: 0, trades: 0 };
      if (newCountData.friends) state.counts.friends = newCountData.friends;
      if (newCountData.messages) state.counts.messages = newCountData.messages;
      if (newCountData.trades) state.counts.trades = newCountData.trades;
    },
    toggleMenu(state, newState?: boolean) {
      state.menuOpen = newState !== undefined ? newState : !state.menuOpen;
    },
    toggleSearch(state, newState?: boolean) {
      state.searchOpen = newState !== undefined ? newState : !state.searchOpen;
    },
    setHomeSorts(state, sorts: HomeSorts) {
      state.homeSorts = sorts;
    }
  },
  actions: {
    fetchAuth(context) {
      fetchData(
        "get",
        "https://users.roblox.com/v1/users/authenticated",
        null,
        (reply: AuthenticationData) => {
          console.log(reply);
          context.commit("setAuthenticationData", reply);
          context.dispatch("fetchAdditionalData");
          context.dispatch("fetchHomeSorts");
        }
      );
    },
    fetchAdditionalData(context) {
      context.dispatch("fetchEconomy");
      context.dispatch("fetchCounts");
      context.dispatch("fetchFriends");
    },
    fetchEconomy(context) {
      fetchData(
        "get",
        `https://economy.roblox.com/v1/users/${context.state.authenticatedUser.id}/currency`,
        null,
        (reply: EconomyData) => {
          context.commit("setEconomyData", reply);
        }
      );
    },
    fetchCounts(context) {
      fetchData(
        "get",
        "https://friends.roblox.com/v1/user/friend-requests/count",
        null,
        (reply: CountEndpointResponse) => {
          context.commit("patchCountData", {
            friends: reply.count
          } as CountData);
        }
      );
      fetchData(
        "get",
        "https://privatemessages.roblox.com/v1/messages/unread/count",
        null,
        (reply: CountEndpointResponse) => {
          context.commit("patchCountData", {
            messages: reply.count
          } as CountData);
        }
      );
      fetchData(
        "get",
        "https://trades.roblox.com/v1/trades/inbound/count",
        null,
        (reply: CountEndpointResponse) => {
          context.commit("patchCountData", {
            trades: reply.count
          } as CountData);
        }
      );
    },
    fetchFriends(context) {
      console.log("fetchFriends()");
      const data: { [key: number]: FriendObject } = {};
      fetchData(
        "get",
        `https://friends.roblox.com/v1/users/${this.state.authenticatedUser.id}/friends`,
        null,
        (reply: any) => {
          reply.data.forEach((element: FriendObject) => {
            data[element.id] = element;
          });
          fetchData(
            "get",
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?size=150x150&format=png&userIds=${reply.data
              .map((val: FriendObject) => val.id)
              .join("&userIds=")}&userIds=${this.state.authenticatedUser.id}`,
            null,
            (thumbnails: any) => {
              thumbnails.data.forEach(
                (thumbnailData: {
                  targetId: number;
                  state: "Completed";
                  imageUrl: "string";
                }) => {
                  if (
                    thumbnailData.targetId === this.state.authenticatedUser.id
                  )
                    context.commit(
                      "setAuthenticationThumbnail",
                      thumbnailData.imageUrl
                    );
                  else
                    data[thumbnailData.targetId].thumbnail =
                      thumbnailData.imageUrl;
                }
              );
              fetchData(
                "post",
                "https://presence.roblox.com/v1/presence/users",
                {
                  userIds: Object.values(data).map(value => value.id)
                },
                (userPresencesResponse: PresenceDataResponse) => {
                  const presenceData = userPresencesResponse.userPresences;
                  presenceData.forEach(value => {
                    if (value.userPresenceType == 3) value.userPresenceType = 2;
                    else if (value.userPresenceType == 2)
                      value.userPresenceType = 3;
                    data[value.userId].presence = value;
                  });
                  const sortedReply = Object.values(
                    data
                  ).sort((val1: FriendObject, val2: FriendObject) =>
                    val1.isOnline == false ? 1 : val2.isOnline == false ? -1 : 0
                  );

                  console.log(sortedReply);

                  context.commit("setFriendData", sortedReply);
                }
              );
            }
          );
        }
      );
    },
    async fetchHomeSorts({ commit }) {
      const sortsData = await fetchDataAsync<GameSortsResponse>(
        "get",
        "https://games.roblox.com/v1/games/sorts?model.gameSortsContext=HomeSorts",
        null
      );
      console.log(sortsData);
      function getSortToken(
        scope: "gameFilters" | "genreFilters" | "sorts" | "timeFilters",
        name: string
      ): string | undefined {
        return sortsData[scope].find(sortData => sortData.name === name)?.token;
      }
      function getListUrl(token: string): string {
        console.log(token);
        return `https://games.roblox.com/v1/games/list?sortToken=${token}&startRows=0&maxRows=12&hasMoreRows=true&sortPosition=0&pageContext.pageId=${sortsData.pageContext.pageId}`;
      }
      const myLibrarySort = await fetchDataAsync<GameListResponse>(
        "get",
        getListUrl(getSortToken("sorts", "MyLibrary") as string),
        null
      );
      console.log(myLibrarySort);
      {
        const sortIcons = await fetchDataAsync<{ data: [] }>(
          "get",
          `https://thumbnails.roblox.com/v1/games/icons?universeIds=${myLibrarySort.games
            .map(game => game.universeId)
            .join(",")}&returnPolicy=PlaceHolder&size=150x150&format=jpeg`,
          null
        );
        sortIcons.data.forEach(
          (iconData: {
            targetId: number;
            state: "Completed" | "Pending";
            imageUrl: string;
          }) => {
            if (
              myLibrarySort.games.find(
                game => game.universeId === iconData.targetId
              ) !== undefined
            ) {
              (myLibrarySort.games.find(
                game => game.universeId === iconData.targetId
              ) as GameListGame).gameIcon = iconData.imageUrl;
            }
          }
        );
      }
      const recommendationSort = await fetchDataAsync<GameListResponse>(
        "get",
        getListUrl(getSortToken("sorts", "PersonalRecommendation") as string),
        null
      );
      {
        const sortIcons = await fetchDataAsync<{ data: [] }>(
          "get",
          `https://thumbnails.roblox.com/v1/games/icons?universeIds=${recommendationSort.games
            .map(game => game.universeId)
            .join(",")}&returnPolicy=PlaceHolder&size=150x150&format=jpeg`,
          null
        );
        sortIcons.data.forEach(
          (iconData: {
            targetId: number;
            state: "Completed" | "Pending";
            imageUrl: string;
          }) => {
            if (
              recommendationSort.games.find(
                game => game.universeId === iconData.targetId
              ) !== undefined
            ) {
              (recommendationSort.games.find(
                game => game.universeId === iconData.targetId
              ) as GameListGame).gameIcon = iconData.imageUrl;
            }
          }
        );
      }
      const friendSort = await fetchDataAsync<GameListResponse>(
        "get",
        getListUrl(getSortToken("sorts", "FriendActivity") as string),
        null
      );
      {
        const sortIcons = await fetchDataAsync<{ data: [] }>(
          "get",
          `https://thumbnails.roblox.com/v1/games/icons?universeIds=${friendSort.games
            .map(game => game.universeId)
            .join(",")}&returnPolicy=PlaceHolder&size=150x150&format=jpeg`,
          null
        );
        sortIcons.data.forEach(
          (iconData: {
            targetId: number;
            state: "Completed" | "Pending";
            imageUrl: string;
          }) => {
            if (
              friendSort.games.find(
                game => game.universeId === iconData.targetId
              ) !== undefined
            ) {
              (friendSort.games.find(
                game => game.universeId === iconData.targetId
              ) as GameListGame).gameIcon = iconData.imageUrl;
            }
          }
        );
      }
      commit("setHomeSorts", {
        MyLibrary: myLibrarySort,
        PersonalRecommendation: recommendationSort,
        FriendActivity: friendSort
      } as HomeSorts);
    }
  },
  modules: {},
  getters: {
    myLibrary: state => state.homeSorts?.MyLibrary,
    myRecentGames: state => {
      return state.homeSorts?.MyRecent;
    },
    myFavoriteGames: state => state.homeSorts?.Favorites,
    myRecommendedGames: state => state.homeSorts?.PersonalRecommendation,
    myFriendsGames: state => state.homeSorts?.FriendActivity
  }
});
