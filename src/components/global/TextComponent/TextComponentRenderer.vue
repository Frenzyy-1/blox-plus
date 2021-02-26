<template>
  <div>
    <p
      v-for="(dataContainer, index) in textData"
      :key="`dc-${index}`"
      class="mb-0.5"
    >
      <span
        v-for="(textComponent, dataIndex) in dataContainer"
        :key="`dc-${index}-${dataIndex}`"
      >
        <br
          v-if="
            textComponent.type === 'text' &&
              dataIndex === 0 &&
              textComponent.data.trim() === ''
          "
        />
        <span
          v-else-if="textComponent.type === 'text'"
          class="whitespace-pre-wrap"
          >{{ textComponent.data }}</span
        >
        <text-component-game
          v-else-if="textComponent.type === 'game'"
          :textComponent="textComponent"
        />
        <text-component-group
          v-else-if="textComponent.type === 'group'"
          :textComponent="textComponent.data.id"
        />
      </span>
    </p>
  </div>
</template>

<script lang="ts">
import { DataContainer } from "@/util/textComponents";
import { Vue, Component, Prop } from "vue-property-decorator";
import TextComponentGame from "./TextComponentGame.vue";
import TextComponentGroup from "./TextComponentGroup.vue";
import TextComponentUser from "./TextComponentUser.vue";

@Component<TextComponentRenderer>({
  components: { TextComponentGame, TextComponentGroup, TextComponentUser }
})
export default class TextComponentRenderer extends Vue {
  @Prop({ required: true })
  textData!: DataContainer[];

  get data() {
    return this.textData;
  }
}
</script>

<style></style>
