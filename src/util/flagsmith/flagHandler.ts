import flagsmith, { IFlags, IRetrieveInfo } from "flagsmith";
import VueX from "@/store/index";

class Flagsmith {
  private flags: IFlags;

  constructor() {
    this.flags = {};

    this.init();
  }

  private async init() {
    await flagsmith.init({
      environmentID: process.env.VUE_APP_FLAGSMITH_ENVIRONMENT_ID || "",
      cacheFlags: false,
      onChange: this.flagChange.bind(this),
      /* eslint-disable @typescript-eslint/camelcase */
      defaultFlags: {
        display_names: {
          enabled: true
        },
        edit_display_name: {
          enabled: false
        },
        quick_login_enabled: {
          enabled: false
        },
        quick_login_external_window: {
          enabled: false
        }
      }
      /* eslint-enable @typescript-eslint/camelcase */
    });
    flagsmith.startListening(60000);
  }

  private async compare(newFlags: IFlags) {
    if (!newFlags) return false;
    let changed = false;
    for (const flagKey in newFlags) {
      if (
        !this.flags[flagKey] ||
        (this.flags[flagKey].enabled !== null &&
          this.flags[flagKey].enabled !== newFlags[flagKey].enabled) ||
        (this.flags[flagKey].value !== null &&
          this.flags[flagKey].value !== newFlags[flagKey].value)
      ) {
        changed = true;
        break;
      }
    }
    return changed;
  }

  private async flagChange(flags: IFlags, params: IRetrieveInfo) {
    if (await this.compare(flags)) {
      this.flags = flags;
      console.log(this.flags);
      VueX.commit("flagsChanged", flags);
    }
  }
}

const flagsmithClass = new Flagsmith();

export default flagsmithClass;
