<template>
  <router-link :to="'#'">
    <div
      class="h-64 hover:h-64 w-40 bg-dark-tertiary p-1 rounded-lg overflow-hidden hover:shadow-lg game-card transition-shadow duration-500"
    >
      <div class=" w-38 h-38 overflow-hidden rounded-lg relative">
        <div class="absolute overflow-hidden">
          <div class="w-38 h-38 shimmer-primary" />
        </div>
      </div>

      <div class="font-bold overflow-hidden text-lg h-14 text-center">
        <div class="mt-1 shimmer-primary w-full rounded-md h-6">&nbsp;</div>
        <div class="-mt-1 shimmer-primary w-full rounded-md h-6">&nbsp;</div>
      </div>
      <div class="h-8 text-base flex pt-3 mt-1">
        <div class="inline-block w-full shimmer-primary rounded-md">
          &nbsp;
        </div>
      </div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ThumbsUpIcon, UserIcon } from "vue-feather-icons";

@Component({
  components: { ThumbsUpIcon, UserIcon }
})
export default class ShimmerGameCard extends Vue {}
</script>

<style scoped lang="scss">
.game-card {
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1);
  &:hover {
    box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.1);
  }
}
</style>
