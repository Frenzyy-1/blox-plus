<template>
  <div class="pt-8" v-if="game">
    <div class="mt-4 flex flex-wrap -mx-2">
      <div class="w-full lg:w-2/3 pb-2 px-2">
        <div class="bg-dark-tertiary">
          <div
            class="bg-no-repeat bg-cover bg-center"
            :style="`background-image: url('${backgroundMedia}')`"
          >
            <div class="backdrop p-8 stroke relative">
              <div
                class="absolute z--1 top-0 right-0 bottom-0 left-0 bg-dark-tertiary opacity-50"
              >
                &nbsp;
              </div>
              <div class="z-10">
                <div class="text-center mb-8">
                  <h1 class="text-3xl font-bold">{{ game.name }}</h1>
                  <p>
                    <i class="opacity-50">by </i>
                    <a class="font-medium" href="#">{{ game.builder }}</a>
                  </p>
                </div>
                <div class="mb-8 max-w-md mx-auto">
                  <button
                    @click.prevent="play"
                    class="px-4 py-2 w-full max-w-md rounded bg-green-500"
                  >
                    Play
                  </button>
                </div>
                <div class="w-full" v-if="true == false">
                  <div
                    v-for="(dataContainer, index) in descriptionData"
                    :key="`dc-${index}`"
                    class="mb-0.5"
                  >
                    <div
                      v-for="(data, dataIndex) in dataContainer"
                      :key="`dc-${index}-${dataIndex}`"
                      class="inline-block  align-top"
                    >
                      <br
                        v-if="
                          data.type === 'text' &&
                            dataIndex === 0 &&
                            data.data.trim() === ''
                        "
                      />
                      <span
                        v-else-if="data.type === 'text'"
                        class="whitespace-pre-wrap"
                        >{{ data.data }}</span
                      >
                      <router-link
                        :to="`/group/${data.data.id}`"
                        v-else-if="data.type === 'group'"
                        class="inline-block px-2 rounded-lg font-semibold text-purple-500"
                        ><briefcase-icon
                          size="1.25x"
                          class="inline mb-0.5 -mt-0.5 mr-1"
                        />Group Name</router-link
                      >
                      <router-link
                        :to="`/game/${data.data.id}`"
                        v-else-if="data.type === 'game'"
                        class="inline-block px-2 rounded-lg font-semibold text-green-500"
                        ><play-icon
                          size="1.25x"
                          class="inline mb-0.5 -mt-0.5 mr-1"
                        />Game Name</router-link
                      >
                      <router-link
                        :to="`/user/${data.data.id}`"
                        v-else-if="data.type === 'user'"
                        class="inline-block px-2 py-1 rounded-lg font-medium bg-orange-600 text-light-50"
                        >Username</router-link
                      >
                    </div>
                  </div>
                </div>
                <div class="w-full">
                  <text-component-renderer :textData="descriptionData" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-1/3 px-2 pb-2">
        <div class="lg:grid lg:space-y-4 lg:-mt-4">
          <div class="bg-dark-tertiary p-4 hidden text-center">
            <button
              @click.prevent="play"
              class="px-4 py-2 w-full rounded bg-green-500"
            >
              Play
            </button>
          </div>
          <div class="bg-dark-tertiary p-4">
            <div class="p-4">
              <h1 class="text-3xl font-bold text-center">Store</h1>
            </div>
            <p class="text-center">
              <i
                >Looks like this game is not selling anything at this moment.</i
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { BriefcaseIcon, PlayIcon } from "vue-feather-icons";
import gameLauncher from "@/util/gameLauncher";
import { turnToTextComponents } from "@/util/textComponents";
import { Game } from "@/store/modules/games/types";
import TextComponentRenderer from "@/components/global/TextComponent/TextComponentRenderer.vue";

interface MediaData {
  assetTypeId: number;
  assetType: "Image" | "YouTubeVideo";
  imageId?: string;
  videoHash?: string;
  videoTitle?: string;
  approved: boolean;
}

interface ThumbnailData {
  targetId: number;
  state: string;
  imageUrl: string;
}

@Component<GamePage>({
  components: {
    BriefcaseIcon,
    PlayIcon,
    TextComponentRenderer
  },
  watch: { $route: "_mounted" }
})
export default class GamePage extends Vue {
  mounted() {
    this._mounted();
  }

  _mounted() {
    this.$store.dispatch("games/fetchGame", this.$route.params.id);
  }

  async play(): Promise<void> {
    gameLauncher(this.game.placeId);
  }

  get game(): Game {
    return this.$store.getters["games/game"](this.$route.params.id);
  }

  get backgroundMedia() {
    return this.game &&
      this.game.thumbnails &&
      Array.isArray(this.game.thumbnails) &&
      this.game.thumbnails.length > 0
      ? this.game.thumbnails[0].imageUrl
      : "";
  }

  get descriptionData() {
    return turnToTextComponents(this.game.description);
  }
}
</script>

<style lang="scss" scoped>
.backdrop {
  backdrop-filter: blur(10px);
}
.z--1 {
  z-index: -1;
}
</style>
