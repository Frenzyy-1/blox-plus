<template>
  <router-link
    :to="`/game/${gameId}`"
    class="inline-block px-1 rounded-lg font-semibold text-green-500"
  >
    <play-icon size="1.25x" class="inline mb-px -mt-px mr-1" />
    <span v-if="game">{{ game.name }}</span>
    <span v-else>Unknown Game</span>
  </router-link>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { PlayIcon } from "vue-feather-icons";
import { CustomData } from "@/util/textComponents";

@Component<TextComponentGame>({
  components: { PlayIcon }
})
export default class TextComponentGame extends Vue {
  @Prop({ required: true })
  textComponent!: CustomData;

  mounted() {
    this.$store.dispatch("games/fetchGame", this.textComponent?.data.id);
  }

  get gameId() {
    return this.$props.textComponent.data.id;
  }

  get game() {
    return this.$store.getters["games/game"](this.textComponent.data.id);
  }
}
</script>
