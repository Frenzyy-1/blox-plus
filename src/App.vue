<template>
  <router-view v-if="doRender && !showLogin" />
  <login v-else-if="showLogin" @login="cookieInputEvent" />
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
    this.appStarted();
  }
})
export default class App extends Vue {
  doRender = false;
  showLogin = false;
  showMasterPasswordPrompt = false;

  private async loginFailed(error?: string) {
    console.warn("login error", error);
    this.showLogin = true;
  }

  private async attemptLogin() {
    this.showLogin = false;
    let authSuccess = true;
    await bloxyClient.login().catch(error => {
      this.loginFailed(error);
      authSuccess = false;
    });
    await bloxyClient
      .getUser(bloxyClient.user ? bloxyClient.user.id : 1)
      .catch(error => {
        this.loginFailed(error);
        authSuccess = false;
      });
    if (authSuccess) this.doRender = true;
  }

  private async setCookie(data: {
    cookie: string;
    usesPassword?: boolean;
    password?: string;
    updateIpc?: boolean;
  }) {
    const { cookie, usesPassword, updateIpc } = data;
    if (updateIpc) {
      const status = await ipcRenderer.invoke("saveRobloxCookie", {
        cookie,
        usesPassword
      });
      if (!status) {
        console.warn("Could not set cookie via ipcRenderer");
      }
    }
    bloxyClient.options.credentials = {
      ...bloxyClient.options.credentials,
      cookie: cookie
    };
    this.attemptLogin();
  }

  private async appStarted() {
    const ipcStoredCookie = (await ipcRenderer.invoke(
      "retrieveRobloxCookie"
    )) as { cookie: string | undefined; usesPassword: boolean } | undefined;
    if (ipcStoredCookie && ipcStoredCookie.cookie) {
      if (ipcStoredCookie.usesPassword) {
        this.showMasterPasswordPrompt = true;
      } else {
        this.setCookie({ cookie: ipcStoredCookie.cookie });
      }
    } else {
      this.showLogin = true;
    }
  }

  private async cookieInputEvent(cookie: string) {
    this.setCookie({ cookie, updateIpc: true });
  }
}
</script>
