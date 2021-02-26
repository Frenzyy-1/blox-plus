import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store/index";
import "./assets/tailwind.scss";
import "./assets/style.scss";

Vue.config.productionTip = false;

function applyTheme() {
  if (!localStorage.getItem("theme")) {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    }
  } else {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }
}

async function main() {
  // await bloxyClient.login();
  // pre-fetch so we can get essential cookies
  // await bloxyClient.getUser(bloxyClient.user ? bloxyClient.user.id : 1);

  applyTheme();

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
}

main();
