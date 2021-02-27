<template>
  <div class="center fullscreen text-center">
    <div class="form">
      <div v-if="mode === 'cookie'">
        <h1 class="title">Cookie Login</h1>
        <p>This app requires you to log in with your Roblox account.</p>
        <p class="notice">
          Your cookie is stored on your device and is only sent to *.roblox.com
          domains
        </p>
        <div class="group">
          <input
            type="password"
            v-model="cookie"
            placeholder="Cookie"
            class="input"
          />
          <button @click.prevent="submit" class="login">Log In</button>
        </div>
      </div>
      <div v-else-if="mode === 'code'">
        <h1 class="title">Quick Login</h1>
        <p>This app requires you to log in with your Roblox account.</p>
        <p class="notice">
          Your cookie is stored on your device and is only sent to *.roblox.com
          domains
        </p>
        <div v-if="quickLoginState === 0">
          <p>Looks like the authorization flow did not start.</p>
        </div>
        <div v-else-if="quickLoginState === 3">
          <p>Please wait while you get logged in.</p>
        </div>
        <div v-else-if="quickLoginState === -1">
          <p>The authorization grant got declined.</p>
        </div>
        <div v-else>
          <p class="code title">{{ quickLoginCode }}</p>
          <div v-if="quickLoginState === 1">
            <p>
              Please enter this code at the tab that opened in your browser.
            </p>
          </div>
          <div v-if="quickLoginState === 2">
            <p>You are logging in with: {{ quickLoginAccountName }}</p>
          </div>
          <timer
            :deadline="quickLoginExpiration"
            v-if="quickLoginExpiration && quickLoginState !== 3"
          />
        </div>
      </div>
      <div v-else>
        <p>Please wait, fetching flags..</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Timer from "@/components/global/Timer.vue";
import flagsmith from "flagsmith-nodejs";
import QuickLoginClass, {
  AuthTokenStatus,
  QuickLoginStateChange
} from "@/util/roblox/quickLogin";
import { shell } from "electron";
import { quickCodeLogin } from "@/util/roblox/authorization";

const QuickLogin = new QuickLoginClass();

@Component<Login>({
  components: { Timer },
  mounted() {
    QuickLogin.on("stateChange", this.quickLoginStateChange);
    QuickLogin.on("authorized", this.quickLoginAuthorized);
    this.performFlagsmith();
  },
  beforeDestroy() {
    QuickLogin.stopFlow();
    QuickLogin.removeListener("stateChanged", this.quickLoginStateChange);
    QuickLogin.removeListener("authorized", this.quickLoginAuthorized);
  }
})
export default class Login extends Vue {
  mode = "";
  cookie = "";

  quickLoginEnabled = false;
  quickLoginState = 0;
  quickLoginCode = "";
  quickLoginExpiration = "";
  quickLoginAccountName = "";
  quickLoginAccountProfilePicture = "";

  submit() {
    this.$emit("login", this.cookie);
  }

  private async performFlagsmith() {
    const value = (await flagsmith
      .hasFeature("quick_login_enabled")
      .catch(err => console.error(err))) as boolean;
    if (value !== undefined && value === true) {
      this.quickLoginEnabled = value;
      this.mode = "code";
      this.quickLoginStart();
    } else {
      this.mode = "cookie";
    }
  }

  private async quickLoginStart() {
    const { code, expirationTime } = await QuickLogin.startFlow();
    this.quickLoginState = 1;
    this.quickLoginCode = code;
    this.quickLoginExpiration = expirationTime;
    shell.openExternal("https://www.roblox.com/crossdevicelogin/ConfirmCode");
  }

  private async quickLoginStateChange(stateChange: QuickLoginStateChange) {
    this.quickLoginCode = stateChange.code;
    this.quickLoginExpiration = stateChange.expiration.toISOString();
    this.quickLoginState = QuickLogin.convertStatusToNumber(stateChange.status);
    this.quickLoginAccountName = stateChange.accountName ?? "";
    this.quickLoginAccountProfilePicture = stateChange.accountPictureUrl ?? "";
  }

  private async quickLoginAuthorized(quickLoginAuthData: {
    code: string;
    privateKey: string;
    status: AuthTokenStatus;
  }) {
    // TODO Check how to bypass "you need to complete the anti bot test" thingy
    const { code, privateKey, status } = quickLoginAuthData;
    this.quickLoginState = QuickLogin.convertStatusToNumber(status);
    quickCodeLogin(code, privateKey);
  }
}
</script>

<style scoped lang="scss">
.center {
  @apply flex;
  @apply place-items-center;
  &.fullscreen {
    @apply w-screen;
    @apply h-screen;
  }
}

.dark {
  .form {
    @apply bg-dark-500;

    .input,
    .login {
      @apply bg-dark-400;
      @apply border-dark-300;
    }
  }
}

.form {
  @apply shadow-md;
  @apply p-4;
  @apply mx-auto;
  @apply rounded-lg;

  @apply bg-light-300;

  .title {
    @apply text-lg;
    @apply font-bold;
  }

  .notice {
    @apply text-sm;
    @apply opacity-50;
  }

  .group {
    @apply mt-2;
  }

  .input {
    @apply px-4;
    @apply py-2;
    @apply border-2;
    @apply border-light-400;
    @apply bg-light-200;
    @apply rounded-l-lg;

    &:focus {
      @apply outline-none;
      @apply border-green-400;
    }
  }

  .login {
    @apply px-4;
    @apply py-2;
    @apply border-2;
    @apply border-l-0;
    @apply border-light-400;
    @apply bg-light-200;
    @apply rounded-r-lg;

    &:focus {
      @apply outline-none;
    }
  }
}
</style>
