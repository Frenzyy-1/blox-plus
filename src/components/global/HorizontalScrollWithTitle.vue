<template>
  <div>
    <div class="header-container styling">
      <div class="title">
        <slot name="title" />
      </div>
      <router-link class="link" to="url || ''" v-if="url">
        See all <chevron-right-icon class="inline-block" />
      </router-link>
    </div>
    <div class="container" :class="classList">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ChevronRightIcon } from "vue-feather-icons";

@Component<HorizontalScrollWithTitle>({
  components: { ChevronRightIcon }
})
export default class HorizontalScrollWithTitle extends Vue {
  @Prop()
  url!: string;
  @Prop({
    default:
      "py-2 flex overflow-x-auto place-items-start align-top gap-x-4 grid-flow-col-dense"
  })
  classList!: string;
}
</script>

<style scoped lang="scss">
.header-container {
  &.styling {
    @apply text-xl;
    @apply border-b-2;
    @apply pt-8;
    @apply w-full;
    @apply flex;
    @apply flex-grow;
    @apply items-center;
    @apply font-semibold;
    @apply pb-2;
    @apply pl-2;
    @apply border-light-600;
    @apply dark:border-dark-400;
  }
  & .title {
    @apply flex-grow;
    @apply items-center;
    @apply flex;
  }
  & .link {
    @apply text-sm;
    @apply flex;
    @apply items-center;
    @apply opacity-75;
  }
}
.container {
  @apply pt-4;
  @apply overflow-x-auto;
}
</style>
