<template>
  <router-link
    :to="`/group/${textComponent}`"
    class="inline-block px-1 rounded-lg font-semibold text-purple-500"
  >
    <briefcase-icon size="1.25x" class="inline mb-px -mt-px mr-1" />
    <span v-if="name">{{ name }}</span>
    <span v-else>Unknown Group</span>
  </router-link>
</template>

<script lang="ts">
import bloxyClient from "@/util/bloxyClient";
import { BriefcaseIcon } from "vue-feather-icons";
import { Vue, Component, Prop } from "vue-property-decorator";

@Component<TextComponentGroup>({
  components: { BriefcaseIcon }
})
export default class TextComponentGroup extends Vue {
  groupName = "Unknown Group";

  @Prop()
  textComponent!: number;

  mounted() {
    this.fetchGroup();
  }

  async fetchGroup() {
    const group = await bloxyClient.getGroup(this.textComponent);
    this.groupName = group.name;
  }

  get name() {
    return this.groupName;
  }
}
</script>
