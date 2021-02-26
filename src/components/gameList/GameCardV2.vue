<template>
  <div>
    <router-link
      :to="`/game/${game.placeId}`"
      @contextmenu.native.prevent="$refs.menu.open"
    >
      <div
        class="w-48 h-64 overflow-hidden rounded-md relative card-parent border-2 bg-light-500 border-light-600 dark:bg-dark-800 dark:border-dark-600"
      >
        <div
          class="absolute w-full h-full bg-no-repeat bg-cover bg-center card-bg transition-transform duration-500"
          :style="`background-image: url('${thumbnail}')`"
          alt=""
        ></div>
        <div class="absolute w-full h-full card-bg-gradient">&nbsp;</div>
        <div
          class="blur-2 w-full h-full py-4 px-2 text-center font-bold text-xl text-light-400"
        >
          <div class="w-full whitespace-pre-wrap">
            {{
              game.name
                .replace(
                  /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                  ""
                )
                .replace(/([\{\[\(][^\}\]\))]+[\}\]\)])/gi, "")
                .trim()
            }}
          </div>
        </div>
      </div>
    </router-link>
    <VueContext ref="menu" :close-on-click="false" :lazy="true">
      <button class="context-success" @click.prevent="play">
        Play Game
      </button>
      <button @click.prevent="addToPins">Pin Game</button>
      <button @click.prevent="addToFavorites">Favorite Game</button>
      <button @click.prevent="hide">Hide Game</button>
      <hr />
      <button class="context-danger">
        Block Game
      </button>
    </VueContext>
  </div>
</template>

<script lang="ts">
import { GameListGame } from "@/ts/interfaces";
import { Component, Vue } from "vue-property-decorator";
import { ThumbsUpIcon, UserIcon } from "vue-feather-icons";
import VueContext from "vue-context";
import abbreviate from "@/util/abbreviate";
import { Game } from "@/store/modules/games/types";

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
  components: { ThumbsUpIcon, UserIcon, VueContext }
})
export default class GameCardV2 extends Vue {
  play() {
    true;
    alert("no");
  }
  addToPins() {
    true;
  }
  addToFavorites() {
    true;
  }
  hide() {
    true;
  }

  get voteRating() {
    const game = this.$props.game as GameListGame;
    const calc =
      (game.totalUpVotes / (game.totalUpVotes + game.totalDownVotes)) * 100;
    return isNaN(calc) ? "--" : Math.floor(calc);
  }
  get playerCount() {
    return abbreviate((this.$props.game as GameListGame).playerCount, 1);
  }
  get thumbnail() {
    if (
      this.game &&
      this.game.thumbnails &&
      Array.isArray(this.game.thumbnails) &&
      this.game.thumbnails.length > 0
    )
      return this.game.thumbnails[0].imageUrl;
    return "";
  }

  game!: Game;
  isSponsored = false;
}
</script>

<style scoped>
.card-parent:hover .card-bg,
.card-parent:focus .card-bg {
  transform: scale(1.2);
}
.card-bg-gradient {
  background: rgb(0, 0, 0);
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}
</style>
