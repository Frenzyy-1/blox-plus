<template>
  <span
    class="absolute px-2 py-1 rounded-lg select-none text-sm font-bold leading-none"
    :class="classes"
  >
    <slot />
  </span>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  props: {
    showBorder: {
      type: Boolean,
      default: true,
      required: false
    },
    alignment: {
      type: String,
      default: "right"
    }
  }
})
export default class NotificationIcon extends Vue {
  get iconClass() {
    return `notification-icon-${this.$props.alignment}`;
  }
  get classes() {
    const classData: { [key: string]: boolean } = {
      "border-2 border-dark-primary": this.$props.showBorder
    };
    classData[this.iconClass] = true;
    return classData;
  }
}
</script>

<style scoped>
.notification-icon-right {
  top: -10px;
  right: -10px;
}
.notification-icon-left {
  top: -10px;
  left: -10px;
}
</style>
