import { ActionTree } from "vuex";
import { CurrentUserState, Friend, User } from "./types";
import { RootState } from "../../types";
import bloxyClient from "@/util/bloxyClient";
import { chunk } from "lodash";

const lastFetch: {
  fetchCurrentUser?: Date;
  getFriends?: Date;
} = {};

export const actions: ActionTree<CurrentUserState, RootState> = {
  async fetchCurrentUser({ commit }): Promise<void> {
    if (
      lastFetch.fetchCurrentUser &&
      new Date().getUTCMinutes() - 2 <
        lastFetch.fetchCurrentUser.getUTCMinutes()
    )
      return;
    if (!bloxyClient.user)
      throw new Error("The current user is not authenticated.");
    lastFetch.fetchCurrentUser = new Date();
    const patchedData: User = {
      name: bloxyClient.user.name as string,
      displayname: bloxyClient.user.name as string,
      id: bloxyClient.user.id,
      membership: bloxyClient.user.membership
    } as User;
    const thumbnails = (
      await bloxyClient.apis.thumbnailsAPI.getUsersAvatarHeadShotImages({
        userIds: [bloxyClient.user.id],
        isCircular: false,
        size: "150x150",
        format: "png"
      })
    ).data;
    patchedData.thumbnail = thumbnails[0].imageUrl ?? "";
    commit("currentUserFetched", {
      currentUser: patchedData
    });
  },
  async fetchFriends({ commit }): Promise<void> {
    if (
      lastFetch.getFriends &&
      new Date().getUTCMinutes() - 2 < lastFetch.getFriends.getUTCMinutes()
    )
      return;
    const patchedFriends: Record<number, Friend> = {};
    if (!bloxyClient.user)
      throw new Error("The current user is not authenticated.");
    lastFetch.getFriends = new Date();
    const friends = (
      await bloxyClient.apis.friendsAPI.getUserFriends({
        userId: bloxyClient.user.id
      })
    ).data;
    friends.forEach(friend => {
      patchedFriends[friend.id] = friend as Friend;
    });

    const userIds = Object.values(patchedFriends).map(v => v.id);
    const partitionedUserIds = chunk(userIds, 25);
    for (const partitionedUserIdChunk of partitionedUserIds) {
      const thumbnails = (
        await bloxyClient.apis.thumbnailsAPI.getUsersAvatarHeadShotImages({
          userIds: partitionedUserIdChunk,
          isCircular: false,
          size: "150x150",
          format: "png"
        })
      ).data;
      thumbnails.forEach(thumbnail => {
        if (patchedFriends[thumbnail.targetId])
          patchedFriends[thumbnail.targetId].thumbnail = thumbnail.imageUrl;
      });
    }

    for (const partitionedUserIdChunk of partitionedUserIds) {
      const presences = (
        await bloxyClient.apis.presenceAPI.getUsersPresences({
          userIds: partitionedUserIdChunk
        })
      ).userPresences;
      presences.forEach(presence => {
        patchedFriends[presence.userId].presence = presence;
      });
    }

    const sortedPatchedFriends = Object.values(
      patchedFriends
    ).sort((val1, val2) =>
      val1.isOnline == false ? 1 : val2.isOnline == false ? -1 : 0
    );
    commit("friendsFetched", {
      friends: sortedPatchedFriends
    });
  }
};
