<template>
  <div>
    <div
      class="text-xl border-b-2 pt-8 w-full flex-grow flex items-center font-semibold pb-2 border-light-700 dark:border-dark-400"
    >
      <div class="flex-grow flex items-center font-bold">
        {{ title }}
      </div>
      <router-link class="text-sm" :to="viewMore" v-if="viewMore">
        See all <ChevronRightIcon class="inline-block" />
      </router-link>
    </div>
    <div class="flex w-full">
      <div
        class="py-2 flex overflow-x-auto place-items-start align-top gap-x-4 grid-flow-col-dense"
        v-if="sortData && sortData.length > 0"
      >
        <game-card-v-2
          v-for="(game, index) in sortData"
          :key="game.id"
          :class="{
            'px-2': index !== 0 && index !== 11,
            'pr-2': index === 0,
            'pl-2': index === 11
          }"
          v-show="index < maxGames"
          :game="game"
        />
      </div>
      <div
        v-else
        class="py-2 flex overflow-x-auto place-items-start align-top gap-x-4 grid-flow-col-dense"
      >
        <game-card-v-2 class="px-2" v-if="fakeGame" :game="fakeGame" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ChevronRightIcon } from "vue-feather-icons";
import GameCard from "@/components/gameList/GameCard.vue";
import GameCardV2 from "@/components/gameList/GameCardV2.vue";
import ShimmerGameCard from "@/components/gameList/ShimmerGameCard.vue";
import { Game } from "@/store/modules/games/types";

@Component({
  components: { ChevronRightIcon, GameCard, ShimmerGameCard, GameCardV2 }
})
export default class HomeGameList extends Vue {
  @Prop({ type: String, default: "No Title", required: true })
  title!: string;
  @Prop({ type: String, default: undefined, required: false })
  viewMore!: string;
  @Prop({ type: Array, default: [], required: true })
  sortData!: Game[];
  @Prop({ type: Number, default: 12, required: false })
  maxGames!: number;

  mounted() {
    this.$store.dispatch("games/fetchGame", 738339342);
  }

  get fakeGame() {
    return this.$store.getters["games/game"](738339342);
  }
}
</script>

<style scoped></style>
