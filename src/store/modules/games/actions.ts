import { ActionTree } from "vuex";
import { Game, GamesState } from "./types";
import { RootState } from "../../types";
import bloxyClient from "@/util/bloxyClient";
import { GetGameSorts, MultiGetPlaces } from "bloxy/dist/client/apis/GamesAPI";

const lastFetch: {
  fetchGame: Record<string, Date>;
  fetchHomeSorts?: Date;
} = {
  fetchGame: {}
};

export const actions: ActionTree<GamesState, RootState> = {
  async fetchGame({ commit }, gameId: number): Promise<void> {
    console.log("fetchGame -> " + gameId);
    if (
      lastFetch.fetchGame[gameId] &&
      new Date().getUTCMinutes() - 10 <
        lastFetch.fetchGame[gameId].getUTCMinutes()
    )
      return;
    console.log("fetchGame(" + gameId + ")");
    lastFetch.fetchGame[gameId] = new Date();
    let response: MultiGetPlaces | undefined;
    try {
      response = await bloxyClient.apis.gamesAPI.getMultiPlaces({
        placeIds: [gameId]
      });
    } catch (err) {
      console.log(err);
    }
    if (!response) return;
    commit("gameFetched", response[0]);
  },
  async fetchGames(
    { commit },
    payload: { placeId: number; [key: string]: unknown }[]
  ): Promise<Game[]> {
    let response: MultiGetPlaces | undefined;
    try {
      response = await bloxyClient.apis.gamesAPI.getMultiPlaces({
        placeIds: payload.map(_payload => _payload.placeId)
      });
      console.log(response);
    } catch (err) {
      console.error(err);
    }

    let tResponse;
    try {
      tResponse = await bloxyClient.apis.thumbnailsAPI.getUniversesThumbnailIds(
        {
          universeIds: response ? response.map(game => game.universeId) : [],
          format: "png",
          size: "768x432"
        }
      );
    } catch (err) {
      console.error(err);
    }

    if (response) response.forEach(game => ((game as Game).thumbnails = []));

    if (response && tResponse) {
      tResponse.data.forEach(universeThumbnails => {
        ((response as Game[]).find(
          game => game.universeId === universeThumbnails.universeId
        ) as Game).thumbnails = universeThumbnails.thumbnails;
      });
    }

    if (response) commit("gamesFetched", response);
    return response ? (response as Game[]) : [];
  },
  async fetchHomeSorts({ commit, dispatch }): Promise<void> {
    if (
      lastFetch.fetchHomeSorts &&
      new Date().getUTCMinutes() - 10 < lastFetch.fetchHomeSorts.getUTCMinutes()
    )
      return;
    lastFetch.fetchHomeSorts = new Date();
    let response: GetGameSorts | undefined;
    try {
      response = await bloxyClient.apis.gamesAPI.getGameSorts({
        gameSortsContext: "HomeSorts"
      });
    } catch (err) {
      console.log(err);
    }
    if (!response) return;
    if (response.sorts.find(v => v.name === "MyLibrary")) {
      /**
       * * User is in the A/B testing for the new home sorts
       * * I am unsure if this gets implemented or not
       * ! Sort name is MyLibrary
       * TODO: add A/B handling here
       */
    }
    const myRecentRaw = await bloxyClient.apis.gamesAPI.listGames({
      sortToken: response.sorts.find(v => v.name === "MyRecent")?.token,
      pageContextPageId: (response.pageContext.pageId as unknown) as number
    });
    const myFavoriteRaw = await bloxyClient.apis.gamesAPI.listGames({
      sortToken: response.sorts.find(v => v.name === "MyFavorite")?.token,
      pageContextPageId: (response.pageContext.pageId as unknown) as number
    });
    const friendActivityRaw = await bloxyClient.apis.gamesAPI.listGames({
      sortToken: response.sorts.find(v => v.name === "FriendActivity")?.token,
      pageContextPageId: (response.pageContext.pageId as unknown) as number
    });
    const myRecent = await dispatch("fetchGames", myRecentRaw.games);
    const myFavorite = await dispatch("fetchGames", myFavoriteRaw.games);
    const friendActivity = await dispatch(
      "fetchGames",
      friendActivityRaw.games
    );
    commit("homeSortsFetched", {
      myRecent: myRecent,
      myFavorite: myFavorite,
      friendActivity: friendActivity
    });
  }
};
