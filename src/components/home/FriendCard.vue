<template>
  <div>
    <router-link
      :to="`/users/${friend.id}`"
      @contextmenu.native.prevent="$refs.menu.open"
    >
      <div class="mx-auto max-w-full">
        <img
          class="h-16 w-16 rounded-full mx-auto border-2 bg-light-500 border-light-600 dark:bg-dark-500 dark:border-dark-600 transition duration-200"
          :class="{ 'opacity-50': !friend.isOnline }"
          :src="friend.thumbnail"
          alt=""
        />
        <p
          class="text-center truncate text font-semibold max-w-full"
          :class="{ 'opacity-50': !friend.isOnline }"
        >
          {{ friend.displayName }}
        </p>
        <p
          class="text-center truncate font-semibold text-sm text-text-tertiary opacity-75"
          v-show="showStatus"
        >
          <span
            v-if="friend.presence.userPresenceType == 2"
            class="text-orange-600 dark:text-orange-400"
            >Studio</span
          >
          <span
            v-if="friend.presence.userPresenceType == 3"
            class="text-green-700 dark:text-green-500"
            >Playing</span
          >
          <span
            v-if="friend.presence.userPresenceType == 1"
            class="text-blue-600 dark:text-blue-400"
            >Online</span
          >
        </p>
      </div>
    </router-link>
    <VueContext ref="menu" :close-on-click="false" :lazy="true">
      <div v-if="friend.displayName !== friend.name">
        <p class="font-bold">{{ friend.displayName }}</p>
        <p class="opacity-50">@{{ friend.name }}</p>
      </div>
      <p v-else class="font-bold">{{ friend.displayName }}</p>
      <div v-if="friend.presence.userPresenceType === 3">
        <hr />
        <button
          v-if="friend.presence.userPresenceType == 3"
          class="context-success"
        >
          Join Game
        </button>
      </div>

      <button v-if="friend.presence.userPresenceType !== 0 && true === false">
        Invite to PlayTogether
      </button>
      <hr />
      <button class="context-danger">
        Report
      </button>
    </VueContext>
  </div>
</template>

<script lang="ts">
import VueContext from "vue-context";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: { VueContext },
  props: {
    friend: {
      required: true,
      type: Object
    },
    showStatus: {
      required: false,
      type: Boolean,
      default: true
    }
  }
})
export default class FriendCard extends Vue {}
</script>

<style scoped></style>
