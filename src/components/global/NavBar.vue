<template>
  <nav
    class="bg-dark-primary w-full px-8 py-4 text-text-secondary shadow-lg fixed top-0 navbar z-20"
  >
    <div class="w-full flex-grow flex items-center lg:w-auto">
      <div class="flex-grow text-2xl items-center flex">
        <button
          class="mr-8 relative grid items-center focus:outline-none"
          @click="() => this.$store.commit('toggleMenu')"
        >
          <MenuIcon size="1.5x" class="inline" />
          <NotificationIcon
            class="bg-dark-secondary"
            v-if="counts && (counts.friends || 0) + (counts.trades || 0) > 0"
            >{{
              (counts.friends || 0) + (counts.trades || 0)
            }}</NotificationIcon
          >
        </button>
        <router-link to="/" class="grid items-center">
          <img
            src="https://images.rbxcdn.com/1359485336f67d6e7be76b5e8ff4b72c-roblox_logo_11212016.svg"
            alt="Roblox Logo"
            class="inline-block h-8"
          />
        </router-link>
      </div>
      <div class="text-2xl items-center flex">
        <div
          class="text-2xl mr-8 p-4 bg-dark-tertiary rounded-lg flex items-center"
        >
          <img src="../../assets/robux.svg" class="inline-block h-12 w-12" />
          <span class="text-2xl ml-2" v-if="economyData">{{
            economyData.robux
          }}</span>
        </div>
        <router-link
          class="inline-block mr-8 leading-3 relative"
          to="/messages/inbox"
        >
          <MessageSquareIcon size="1.5x" class="inline" />
          <NotificationIcon
            class="bg-dark-secondary"
            v-if="counts && counts.messages && counts.messages > 0"
            >{{ counts.messages }}</NotificationIcon
          >
        </router-link>
        <router-link class="inline-block mr-8 leading-3 relative" to="/search">
          <SearchIcon size="1.5x" class="inline" />
        </router-link>
        <router-link class="inline-block leading-3 relative" to="/settings">
          <SettingsIcon size="1.5x" class="inline" />
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  MenuIcon,
  SettingsIcon,
  SearchIcon,
  MessageSquareIcon
} from "vue-feather-icons";
import { CountData, EconomyData } from "@/ts/interfaces";
import NotificationIcon from "@/components/global/NotificationIcon.vue";

@Component({
  components: {
    MenuIcon,
    SettingsIcon,
    SearchIcon,
    MessageSquareIcon,
    NotificationIcon
  }
})
export default class NavBar extends Vue {
  get economyData(): EconomyData {
    return this.$store.state.economyData;
  }
  get counts(): CountData {
    return this.$store.state.counts;
  }
}
</script>
