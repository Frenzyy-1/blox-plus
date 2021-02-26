<template>
  <div
    class="fixed left-0 top-0 right-0 h-16 transition duration-200 z-20 flex"
    :class="{ 'bg-light-100 dark:bg-dark-600 shadow-lg': scrollPosition !== 0 }"
  >
    <div class="flex-grow px-4 flex place-items-center">
      <button
        class="mr-8 relative grid items-center focus:outline-none"
        @click="() => this.$store.commit('toggleMenu')"
      >
        <MenuIcon size="2x" class="inline" />
        <NotificationIcon
          class="bg-light-100"
          v-if="counts && (counts.friends || 0) + (counts.trades || 0) > 0"
          >{{ (counts.friends || 0) + (counts.trades || 0) }}</NotificationIcon
        >
      </button>
    </div>
    <div class="flex p-4 place-items-center space-x-4">
      <img
        :src="authenticatedUser.thumbnail"
        class="w-10 h-10 rounded-full border-2 bg-light-600 border-light-700 dark:bg-dark-300 dark:border-dark-400 transition duration-200"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import {
  MenuIcon,
  SettingsIcon,
  SearchIcon,
  MessageSquareIcon
} from "vue-feather-icons";
import NotificationIcon from "@/components/global/NotificationIcon.vue";
import { CountData, EconomyData } from "@/ts/interfaces";
import { User } from "@/store/modules/currentUser/types";

@Component({
  components: {
    MenuIcon,
    SettingsIcon,
    SearchIcon,
    MessageSquareIcon,
    NotificationIcon
  }
})
export default class NavBarV2 extends Vue {
  scrollPosition = 0;

  updateScroll() {
    this.scrollPosition = window.scrollY;
  }

  mounted() {
    window.addEventListener("scroll", this.updateScroll);
    this.scrollPosition = window.scrollY;
  }

  beforeDestroy() {
    window.removeEventListener("scroll", this.updateScroll);
  }

  get authenticatedUser(): User {
    return this.$store.getters["currentUser/user"];
  }

  get economyData(): EconomyData {
    return this.$store.state.economyData;
  }
  get counts(): CountData {
    return this.$store.state.counts;
  }
}
</script>

<style scoped></style>
