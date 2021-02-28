<template>
  <div>
    <router-link
      class="group relative"
      :to="`/users/${friend.id}`"
      @contextmenu.native.prevent="$refs.menu.open"
    >
      <div
        class="mx-auto max-w-full p-2 -mt-2 rounded-lg group-hover:bg-light-500 dark:group-hover:bg-dark-600 transition-colors duration-200"
      >
        <img
          class="h-16 w-16 rounded-full group-hover:shadow-none mx-auto bg-light-500 dark:bg-dark-600"
          :class="{
            'opacity-50': !friend.isOnline,
            'border-2 border-light-600 dark:border-dark-600':
              flags.render_avatar_borders,
            'shadow-md': !flags.render_avatar_borders
          }"
          :src="friend.thumbnail"
          alt=""
        />
        <p
          class="text-center truncate text font-semibold max-w-full"
          :class="{ 'opacity-50': !friend.isOnline }"
        >
          {{ (flags.display_names && friend.displayName) || friend.name }}
        </p>
        <p
          class="text-center truncate font-semibold text-sm text-text-tertiary opacity-75"
          v-show="showStatus"
        >
          <span
            v-if="friend.presence.userPresenceType == 3"
            class="text-orange-600 dark:text-orange-400"
            >Studio</span
          >
          <span
            v-if="friend.presence.userPresenceType == 2"
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
      <div v-if="friend.displayName !== friend.name && flags.display_names">
        <p class="font-bold">{{ friend.displayName }}</p>
        <p class="opacity-50">@{{ friend.name }}</p>
      </div>
      <p v-else class="font-bold">{{ friend.name }}</p>
      <div v-if="friend.presence.userPresenceType === 2">
        <hr />
        <button
          v-if="friend.presence.userPresenceType == 2"
          class="context-success"
          @click.prevent="join"
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
import { Component, Prop, Vue } from "vue-property-decorator";
import { followPlayerIntoGame } from "@/util/roblox/playerProtocolHandler";

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
export default class FriendCard extends Vue {
  @Prop({ required: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  friend!: any;

  join() {
    followPlayerIntoGame({ userId: this.friend.id });
  }

  get flags() {
    return this.$store.state["flags"];
  }
}
</script>

<style scoped></style>
