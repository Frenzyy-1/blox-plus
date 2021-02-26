<template>
  <router-link :to="`/game/${game.placeId}`">
    <div
      class="h-64 hover:h-64 w-40 bg-dark-tertiary p-1 rounded-lg overflow-hidden hover:shadow-lg game-card transition-shadow duration-500"
    >
      <div class="bg-dark-primary w-38 h-38 overflow-hidden relative">
        <div class="absolute overflow-hidden rounded-lg">
          <img :src="game.gameIcon" class="w-38 h-38" />
        </div>

        <div class="rounded-br-lg shadow-lg overflow-hidden absolute">
          <p class="px-2 bg-dark-tertiary shadow-lg" v-if="isSponsored">
            Sponsored
          </p>
        </div>
      </div>

      <p class="font-bold overflow-hidden text-lg h-14 text-center">
        {{ game.name }}
      </p>
      <div class="h-8 text-base opacity-50 flex px-1 pt-3">
        <div class="inline-block w-1/2">
          <div class="flex place-items-center grid-flow-col-dense float-left">
            <ThumbsUpIcon class="inline-block mr-1" />
            {{ voteRating }}%
          </div>
        </div>
        <div class="inline-block w-1/2">
          <div
            class="flex place-items-center text-right grid-flow-col-dense float-right"
          >
            {{ playerCount }}
            <UserIcon class="inline-block ml-1" />
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { GameListGame } from "@/ts/interfaces";
import { Component, Vue } from "vue-property-decorator";
import { ThumbsUpIcon, UserIcon } from "vue-feather-icons";
import abbreviate from "@/util/abbreviate";

@Component({
  props: {
    game: {
      type: Object,
      required: true
    },
    isSponsored: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: { ThumbsUpIcon, UserIcon }
})
export default class GameCard extends Vue {
  get voteRating() {
    const game = this.$props.game as GameListGame;
    const calc =
      (game.totalUpVotes / (game.totalUpVotes + game.totalDownVotes)) * 100;
    return isNaN(calc) ? "--" : Math.floor(calc);
  }
  get playerCount() {
    return abbreviate((this.$props.game as GameListGame).playerCount, 1);
  }

  game!: GameListGame;
  isSponsored = false;
}
</script>

<style scoped lang="scss">
.game-card {
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1);
  &:hover {
    box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.1);
  }
}
</style>
