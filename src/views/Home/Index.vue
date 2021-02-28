<template>
  <div>
    <div class="background">
      <div class="image" />
      <div class="gradient blur-8" />
    </div>
    <!-- Spacing -->
    <div class="h-2" />
    <!-- Current User -->
    <div class="authenticated-user">
      <img class="avatar" :src="(user && user.thumbnail) || ''" />
      <p class="name">
        {{
          (user && ((flags.display_names && user.displayName) || user.name)) ||
            ""
        }}
      </p>
      <p class="sub-name" v-if="flags.display_names">
        @{{ (user && user.name) || "" }}
      </p>
    </div>
    <!-- Spacing -->
    <div class="h-24" />
    <!-- Home Content -->
    <div class="content">
      <horizontal-scroll-with-title
        url="/friends"
        classList="pt-4 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 2xl:grid-cols-11 gap-y-4"
      >
        <template v-slot:title>
          <span>Friends</span>
        </template>
        <friend-card
          v-for="friend in friendsToDisplay"
          :key="friend.id"
          :friend="friend"
        />
      </horizontal-scroll-with-title>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HorizontalScrollWithTitle from "@/components/global/HorizontalScrollWithTitle.vue";
import FriendCard from "@/components/home_legacy/FriendCard.vue";
import { orderBy } from "lodash";
import ms from "ms";

let refreshInterval: NodeJS.Timeout;

@Component<Home>({
  components: { HorizontalScrollWithTitle, FriendCard }
})
export default class Home extends Vue {
  /* Data */
  windowWidth = 0;

  /* Methods */
  onWindowResize() {
    this.windowWidth = window.innerWidth;
  }

  /* Vue Methods */
  mounted() {
    this.$store.dispatch("currentUser/fetchFriends");
    this.$store.dispatch("games/fetchHomeSorts");
    refreshInterval = setInterval(
      () => this.$store.dispatch("currentUser/fetchFriends"),
      ms("1m")
    );
    this.onWindowResize();
    window.addEventListener("resize", this.onWindowResize);
  }
  beforeDestroy() {
    if (refreshInterval) clearInterval(refreshInterval);
    window.removeEventListener("resize", this.onWindowResize);
  }
  /* Computed */
  get user() {
    return this.$store.getters["currentUser/user"];
  }

  get friends(): unknown[] {
    const friends = this.$store.getters["currentUser/friends"] || [];
    if (friends) return orderBy(friends, "presence.userPresenceType", "desc");
    return friends;
  }

  get friendsToDisplay() {
    return this.friends.slice(0, this.totalFriendsToDisplay);
  }

  get totalFriendsToDisplay() {
    return (
      (this.windowWidth >= 1536 && 11) ||
      (this.windowWidth >= 1280 && 9) ||
      (this.windowWidth >= 1024 && 6) ||
      (this.windowWidth >= 768 && 5) ||
      4
    );
  }

  get flags() {
    return this.$store.state["flags"];
  }
}
</script>

<style scoped lang="scss">
/* Home.scss */
.dark .background .image {
  background-image: url("https://cdn.discordapp.com/attachments/754759881436692570/815187795369918464/AvatarEditor.png");
}
.background {
  z-index: -1;
  @apply absolute;
  @apply top-0;
  @apply right-0;
  @apply left-0;
  @apply h-96;
  & .gradient {
    @apply absolute;
    @apply w-full;
    @apply h-full;
    @apply bg-gradient-to-b;
    @apply from-transparent;
    @apply to-light-400;
    @apply dark:to-dark-700;
  }
  & .image {
    @apply absolute;
    @apply w-full;
    @apply h-full;
    @apply bg-cover;
    @apply bg-no-repeat;
    @apply bg-center;
    background-image: url("https://cdn.discordapp.com/attachments/754759881436692570/800161722085802054/AvatarEditor_LightTheme.png");
  }
}

.authenticated-user {
  @apply text-center;
  .avatar {
    @apply bg-light-500;
    @apply dark:bg-dark-600;
    @apply border-0;
    @apply w-40;
    @apply h-40;
    @apply mx-auto;
    @apply rounded-full;
    @apply shadow-md;
    @apply select-none;
    @apply mb-2;
  }
  .name {
    @apply text-3xl;
    @apply font-semibold;
  }
  .sub-name {
    @apply font-medium;
    @apply text-base;
    @apply opacity-50;
  }
}

.content {
  @apply container;
  @apply mx-auto;
}
</style>
