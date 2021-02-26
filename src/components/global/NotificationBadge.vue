<template>
  <div
    class="leading-none text-sm px-2 py-1 font-bold text-text-primary bg-dark-secondary rounded-lg mx-2"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class extends Vue {}
</script>

<style scoped></style>
