<template>
  <div
    v-if="isBanned && !banContinued"
    class="h-screen w-screen absolute top-0 right-0 bottom-0 left-0 place-items-center grid text-center"
  >
    <div>
      <h1 class="text-3xl font-bold">Account Suspended</h1>
      <p>
        Your access to third-party services provided by SCC has been revoked by
        one of the moderators.
      </p>
      <p class="font-medium">
        This does not mean your Roblox account is banned.
      </p>
      <br />
      <div class="border border-dark-tertiary p-4">
        <p><span class="font-bold">Reason: </span>Illegal Activities</p>
        <p>This suspension is <span class="font-bold">permanent</span>.</p>
      </div>
      <br />
      <p>
        For further support, please email
        <a class="text-green-500">support@simplydata.dev</a>.
      </p>
      <br />
      <button
        class="px-2 py-1 bg-green-500 rounded text-white"
        @click.prevent="() => (banContinued = true)"
      >
        Continue
      </button>
    </div>
  </div>
  <div v-else-if="!authenticatedUser">
    <div class="grid place-items-center h-screen">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Please wait</h1>
        <p>The app is currently starting, this might take a few seconds.</p>
        <div class="grid place-items-center mt-4">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <Menu />
    <NavBar />
    <div
      class="fixed top-0 right-0 bottom-0 left-0 z-50 pointer-events-none hidden"
    >
      <div
        class="w-52 h-96 rounded-lg bg-light-400 border-2 border-light-600 fixed pointer-events-auto"
        style="top: 500px; left: 245px;"
      >
        &nbsp;
      </div>
    </div>

    <div class="pt-16">
      <div class="px-16 mx-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavBar from "./components/global/NavBarV2.vue";
import Menu from "./components/overlays/Menu.vue";
import LoadingSpinner from "@/components/global/Loading.vue";
import { AuthenticationData } from "./ts/interfaces";

let updateDataInterval: NodeJS.Timeout;

@Component({
  components: { NavBar, Menu, LoadingSpinner },
  /*mounted() {
    this.$store.currentUser;
    updateDataInterval = setInterval(() => {
      console.log("Fetching newest data..");
      this.$store.dispatch("fetchAdditionalData");
      if (this.$router.currentRoute.name === "Home")
        this.$store.dispatch("fetchHomeSorts");
    }, 1000 * 60 * 5);
  },*/
  beforeDestroy() {
    if (updateDataInterval) clearInterval(updateDataInterval);
  },
  data: () => {
    return { banContinued: false };
  }
})
export default class BloxPlus extends Vue {
  mounted() {
    this.$store.dispatch("currentUser/fetchCurrentUser");
  }
  get authenticatedUser(): AuthenticationData {
    return (
      this.$store.state.currentUser.dataFetched &&
      this.$store.state.currentUser.user
    );
  }
  get isBanned(): boolean {
    return false;
  }

  banContinued = false;
}
</script>

<style scoped></style>
