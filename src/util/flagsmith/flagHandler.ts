import flagsmith, { IFlags, IRetrieveInfo } from "flagsmith";
import NodeCache from "node-cache";
import VueX from "@/store/index";

class Flagsmith {
  private flags: NodeCache;

  constructor() {
    this.flags = new NodeCache();

    flagsmith.init({
      environmentID: process.env.VUE_APP_FLAGSMITH_ENVIRONMENT_ID || "",
      cacheFlags: true,
      onChange: this.flagChange
    });
  }

  private async fetchFlags() {
    const flagsmithFlags = await flagsmith.getFlags();
    VueX.commit("flagsChanged", flagsmithFlags);
  }

  private async flagChange(oldFlags: IFlags, params: IRetrieveInfo) {
    this.fetchFlags();
  }
}

const flagsmithClass = new Flagsmith();

export default flagsmithClass;
