<template>
  <div class="center fullscreen text-center">
    <div class="form">
      <h1 class="title">Please log in</h1>
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component<Login>({})
export default class Login extends Vue {
  cookie = "";

  submit() {
    this.$emit("login", this.cookie);
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
