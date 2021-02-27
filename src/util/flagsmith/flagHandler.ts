import flagsmith, { IFlags, IRetrieveInfo } from "flagsmith";
import VueX from "@/store/index";

class Flagsmith {
  constructor() {
    this.init();
  }

  private async init() {
    await flagsmith.init({
      environmentID: process.env.VUE_APP_FLAGSMITH_ENVIRONMENT_ID || "",
      cacheFlags: true,
      onChange: this.flagChange.bind(this),
      preventFetch: true
    });
    await flagsmith.getFlags();
  }

  private async flagChange(flags: IFlags, params: IRetrieveInfo) {
    VueX.commit("flagsChanged", flags);
  }
}

const flagsmithClass = new Flagsmith();

export default flagsmithClass;
