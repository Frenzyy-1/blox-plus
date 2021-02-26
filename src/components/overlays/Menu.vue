<template>
  <div>
    <transition
      enter-active-class="transition duration-300"
      enter-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-300"
      leave-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        class="w-screen h-screen z-40 fixed top-0 left-0 backdrop"
        @click="() => this.$store.commit('toggleMenu', false)"
        v-if="isOpen"
      />
    </transition>
    <transition
      enter-active-class="transition duration-300"
      enter-class="close-transform"
      enter-to-class="open-transform"
      leave-active-class="transition duration-300"
      leave-class="open-transform"
      leave-to-class="close-transform"
    >
      <div class="fixed top-0 left-0 z-50" v-if="isOpen">
        <div class="w-full h-screen block bg-dark-primary shadow-md">
          <!-- Top -->
          <div class="flex-grow flex items-center lg:w-auto px-8 py-4">
            <div class="flex-grow text-2xl items-center py-6 flex">
              <button
                class="mr-8 relative grid items-center focus:outline-none"
                @click="() => this.$store.commit('toggleMenu', false)"
              >
                <MenuIcon size="1.5x" class="inline" />
                <NotificationIcon
                  class="bg-dark-secondary"
                  v-if="counts.friends + counts.trades > 0"
                  >{{ counts.friends + counts.trades }}</NotificationIcon
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
          </div>
          <!-- Menu Entries -->
          <div class="grid grid-cols-1 w-full">
            <router-link
              class="w-full px-4 py-2 text-text-primary text-lg font-medium hover:bg-dark-tertiary flex items-center"
              to="/games/front"
              ><ListIcon class="inline mr-2" /> Games</router-link
            >
            <router-link
              class="w-full px-4 py-2 text-text-primary text-lg font-medium hover:bg-dark-tertiary flex items-center"
              to="/profile/me"
              ><UserIcon class="inline mr-2" /> My Profile</router-link
            >
            <router-link
              class="w-full px-4 py-2 text-text-primary text-lg font-medium hover:bg-dark-tertiary flex items-center"
              to="/friends/list"
              ><UsersIcon class="inline mr-2" />Friends
              <notification-badge v-if="counts.friends > 0" class="mr-2">{{
                counts.friends
              }}</notification-badge></router-link
            >
            <router-link
              class="w-full px-4 py-2 text-text-primary text-lg font-medium hover:bg-dark-tertiary flex items-center"
              to="/trades/incoming"
              ><RepeatIcon class="inline mr-2" />Trades
              <notification-badge v-if="counts.trades > 0" class="mr-2">{{
                counts.trades
              }}</notification-badge></router-link
            >
            <router-link
              class="w-full px-4 py-2 text-text-primary text-lg font-medium hover:bg-dark-tertiary flex items-center"
              to="/groups/"
              ><BriefcaseIcon class="inline mr-2" />Groups</router-link
            >
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NotificationIcon from "@/components/global/NotificationIcon.vue";
import NotificationBadge from "@/components/global/NotificationBadge.vue";
import {
  MenuIcon,
  UserIcon,
  UsersIcon,
  ListIcon,
  BriefcaseIcon,
  RepeatIcon
} from "vue-feather-icons";
import { CountData } from "@/ts/interfaces";

@Component({
  components: {
    MenuIcon,
    NotificationIcon,
    UserIcon,
    UsersIcon,
    ListIcon,
    NotificationBadge,
    BriefcaseIcon,
    RepeatIcon
  }
})
export default class extends Vue {
  get isOpen() {
    return this.$store.state.menuOpen;
  }
  get counts(): CountData {
    return this.$store.state.counts;
  }
}
</script>

<style scoped>
.close-transform {
  transform: translateX(-100%);
}
.open-transform {
  transform: none;
}
.backdrop {
  background: rgba(0, 0, 0, 0.5);
}
</style>
