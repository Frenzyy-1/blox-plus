<template>
  <router-link :to="'/'"> </router-link>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component<TextComponentUser>({})
export default class TextComponentUser extends Vue {
  @Prop()
  user: unknown;
}
</script>
