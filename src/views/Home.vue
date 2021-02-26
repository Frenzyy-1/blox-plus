<template>
  <div>
    <div class="text-3xl text-center grid items-center grid-cols-1 font-bold">
      <img
        :src="authenticatedUser.thumbnail"
        alt=""
        class="h-32 w-32 rounded-full mx-auto border-2 bg-light-500 border-light-600 dark:bg-dark-500 dark:border-dark-600 transition duration-200"
        :class="{ 'shimmer-primary': !authenticatedUser.thumbnail }"
      />
      <p>{{ authenticatedUser.displayname }}</p>
      <p class="text-base font-normal opacity-50">
        @{{ authenticatedUser.name }}
      </p>
    </div>
    <!-- Friends -->
    <div>
      <div
        class="text-xl border-b-2 pt-8 w-full flex-grow flex items-center font-semibold pb-2 border-light-700 dark:border-dark-400"
      >
        <div class="flex-grow items-center flex">
          <span
            ><span class="font-bold">Friends</span> ({{ friends.length }})</span
          >
        </div>
        <router-link class="text-sm" to="/friends/list">
          See all <ChevronRightIcon class="inline-block" />
        </router-link>
      </div>
      <div
        class="pt-4 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 2xl:grid-cols-11 gap-y-4"
      >
        <FriendCard
          v-for="(friend, index) in friends"
          :key="friend.id"
          v-show="index < totalFriendsToDisplay"
          :friend="friend"
        />
      </div>
    </div>
    <!-- My Library -->
    <HomeGameList
      title="My Library"
      viewMore="/games/sort/myLibrary"
      :sortData="myLibrary"
      :maxGames="12"
    />
    <!-- Recommended -->
    <HomeGameList
      title="My Favorites"
      viewMore="/games/sort/favorites"
      :sortData="favoriteGames"
      :maxGames="12"
    />
    <!-- Friends Playing -->
    <HomeGameList
      title="Friends Playing"
      viewMore="/games/sort/friends"
      :sortData="friendGames"
      :maxGames="12"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { GameListResponse } from "@/ts/interfaces";
import { orderBy } from "lodash";
import FriendCard from "@/components/home/FriendCard.vue";
import GameCard from "@/components/gameList/GameCard.vue";
import HomeGameList from "@/components/gameList/HomeGameList.vue";
import { ChevronRightIcon } from "vue-feather-icons";
import { Friend, User } from "@/store/modules/currentUser/types";
import ms from "ms";

let refreshInterval: NodeJS.Timeout;

@Component({
  components: { FriendCard, ChevronRightIcon, GameCard, HomeGameList }
})
export default class Home extends Vue {
  windowWidth = 0;

  onWindowResize() {
    this.windowWidth = window.innerWidth;
  }

  mounted() {
    this.$store.dispatch("currentUser/fetchFriends");
    this.$store.dispatch("games/fetchHomeSorts");
    refreshInterval = setInterval(() => {
      console.log(new Date().toISOString());
      this.$store.dispatch("currentUser/fetchFriends");
    }, ms("1m"));
    this.onWindowResize();
    window.addEventListener("resize", this.onWindowResize);
  }
  beforeDestroy() {
    if (refreshInterval) clearInterval(refreshInterval);
    window.removeEventListener("resize", this.onWindowResize);
  }

  get totalFriendsToDisplay() {
    if (this.windowWidth >= 1536) return 11;
    else if (this.windowWidth >= 1280) return 9;
    else if (this.windowWidth >= 1024) return 6;
    else if (this.windowWidth >= 768) return 5;
    else return 4;
  }

  get authenticatedUser(): User {
    return this.$store.getters["currentUser/user"];
  }
  get friends(): Friend[] {
    if (this.$store.getters["currentUser/friends"])
      return orderBy(
        this.$store.getters["currentUser/friends"],
        "presence.userPresenceType",
        "desc"
      );
    return [];
  }
  get myLibrary(): GameListResponse {
    return this.$store.getters["games/myRecentSort"] ?? [];
  }
  get favoriteGames(): GameListResponse {
    return this.$store.getters["games/myFavoriteSort"] ?? [];
  }
  get friendGames(): GameListResponse {
    return this.$store.getters["games/friendActivitySort"] ?? [];
  }
}
</script>
