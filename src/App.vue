<template>
  <router-view v-if="doRender" />
  <login v-else-if="showLogin" @login="doLogin" />
  <div v-else>
    <div class="grid place-items-center h-screen">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Please wait</h1>
        <p>The app is currently starting, this might take a few seconds.</p>
        <div class="grid place-items-center mt-4">
          <loading-spinner />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bloxyClient from "@/util/bloxyClient";
import Component from "vue-class-component";
import Login from "@/views/Login.vue";
import LoadingSpinner from "@/components/global/Loading.vue";
import { ipcRenderer } from "electron";

@Component<App>({
  components: { Login, LoadingSpinner },
  mounted() {
    this.doLogin();
  }
})
export default class App extends Vue {
  doRender = false;
  showLogin = false;

  private async testCookie() {
    if (bloxyClient.user?.name && bloxyClient.user.id) return true;
    return false;
  }

  private async login() {
    await bloxyClient.login();
    await bloxyClient.getUser(bloxyClient.user ? bloxyClient.user.id : 1);
  }

  private async doLogin(cookie?: string) {
    if (cookie) {
      bloxyClient.options.credentials = {
        ...bloxyClient.options.credentials,
        cookie
      };
    }
    if (bloxyClient.options.credentials?.cookie) {
      await this.login();
      if (this.testCookie()) this.doRender = true;
      else {
        // TODO inform user that we could not log in
      }
    } else {
      // render login
      console.log("no cookie");
      const ipcStoredCookie = (await ipcRenderer.invoke(
        "retrieveRobloxCookie"
      )) as string | undefined;
      if (ipcStoredCookie) {
        bloxyClient.options.credentials = {
          ...bloxyClient.options.credentials,
          cookie: ipcStoredCookie
        };
      } else {
        this.showLogin = true;
      }
    }
  }
}
</script>
