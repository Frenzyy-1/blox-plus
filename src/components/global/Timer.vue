<template>
  <span v-if="currentTime">
    <span v-if="days > 0">{{ days }}</span>
    <span v-if="hours > 0 || days > 0">
      <span v-if="days > 0">:{{ hours | formatTime }}</span>
      <span v-else>{{ hours }}</span>
    </span>
    <span v-if="minutes > 0 || hours > 0">
      <span v-if="hours > 0">:{{ minutes | formatTime }}</span>
      <span v-else>{{ minutes }}</span>
    </span>
    <span v-if="seconds > 0 || minutes > 0">
      <span v-if="minutes > 0">:{{ seconds | formatTime }}</span>
      <span v-else>{{ seconds }}</span>
    </span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component<Timer>({
  filters: {
    formatTime(value: number) {
      if (value < 10) return `0${value}`;
      return value;
    }
  },
  watch: {
    deadline: "countdown"
  },
  mounted() {
    setTimeout(this.countdown, 1000);
  }
})
export default class Timer extends Vue {
  @Prop({ required: true })
  deadline!: string;
  @Prop({ default: 1000 })
  speed!: number;

  currentTime: number =
    new Date(this.deadline).getTime() - new Date().getTime();

  get seconds() {
    return Math.floor((this.currentTime / 1000) % 60);
  }
  get minutes() {
    return Math.floor((this.currentTime / 1000 / 60) % 60);
  }
  get hours() {
    return Math.floor((this.currentTime / (1000 * 60 * 60)) % 60);
  }
  get days() {
    return Math.floor(this.currentTime / (1000 * 60 * 60 * 24));
  }

  countdown() {
    const end = new Date(this.deadline),
      current = new Date();
    this.currentTime = end.getTime() - current.getTime();
    if (this.currentTime > 0) setTimeout(this.countdown, this.speed);
  }
}
</script>

<style scoped></style>
