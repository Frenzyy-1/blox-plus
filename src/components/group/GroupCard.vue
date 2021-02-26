<template>
  <div class="group-card" :class="{ large: large }">
    <div class="bg-content">
      <div class="image" :style="`background-image: url('${bgSrc}');`" />
    </div>
    <div class="content">
      <div class="flex">
        <div class="group-info">
          <p class="group-name">{{ data.group.name }}</p>
          <p class="group-role">
            Ranked as <span>{{ data.role.name }}</span>
          </p>
        </div>
        <div class="member-count" v-if="large">
          <p class="title">Members</p>
          <p class="amount">{{ memberCount }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { GroupOptions } from "bloxy/dist/structures";
import bloxyClient from "@/util/bloxyClient";
import numbro from "numbro";

@Component<LargeGroupCard>({
  mounted() {
    this.fetch();
  }
})
export default class LargeGroupCard extends Vue {
  @Prop({ default: false })
  large!: boolean;
  @Prop()
  data!: {
    group: GroupOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    role: any;
  };
  bgSrc = "";

  async fetch() {
    const icons = await bloxyClient.apis.thumbnailsAPI.getGroupsIcons({
      groupIds: [this.data.group.id],
      format: "png",
      size: "420x420"
    });
    if (icons) {
      const icon = icons.data.find(
        icon => icon.targetId === this.data.group.id
      );
      if (icon) this.bgSrc = icon.imageUrl;
    }
  }

  get memberCount() {
    return numbro(this.data.group.memberCount)
      .format({
        spaceSeparated: false,
        average: true
      })
      .toUpperCase();
  }
}
</script>
