<template>
  <div class="grid grid-flow-row w-screen">
    <div
      v-for="entry in history"
      :key="entry.key"
      class="border-b border-dark-primary py-1 flex w-screen"
    >
      <div
        :class="
          `flex px-2 border-r w-12 border-dark-primary font-bold status status-${`${entry.status} flex-shrink-0`.substr(
            0,
            1
          )}XX`
        "
        style="min-width: 3rem;"
      >
        {{ entry.status }}
      </div>
      <div
        :class="
          `px-2 method method-${entry.method} w-16 inline-block border-r border-dark-primary font-bold flex-shrink-0`
        "
      >
        {{ entry.method }}
      </div>
      <div class="px-2 inline-block truncate flex-grow">
        {{ entry.url }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const { ipcRenderer } = window.require("electron");
import { Component, Vue } from "vue-property-decorator";

interface APIHistoryEntry {
  status: number;
  method: string;
  url: string;
  key: string;
}

@Component({
  data: () => {
    return {
      history: []
    };
  }
})
export default class APIHistory extends Vue {
  history: APIHistoryEntry[] = [];

  mounted() {
    setInterval(async () => {
      this.history = (await ipcRenderer.invoke(
        "getApiHistory"
      )) as APIHistoryEntry[];
    }, 1000);
  }
}
</script>

<style scoped>
.method {
  text-transform: uppercase;
}
.method-GET {
  color: #7d69cb;
}
.method-POST {
  color: #59a210;
}
.method-PUT {
  color: #d07502;
}
.method-PATCH {
  color: #ae9602;
}
.method-DELETE {
  color: #d04444;
}
.method-OPTIONS,
.method-HEAD {
  color: #1c90b4;
}

.status {
  /* empty */
  text-transform: initial;
}

.status-1XX {
  color: darkcyan;
}
.status-2XX {
  color: forestgreen;
}
.status-3XX {
  color: coral;
}
.status-4XX {
  color: firebrick;
}
.status-5XX {
  color: crimson;
}
</style>
