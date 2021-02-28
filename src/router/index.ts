import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home/Index.vue";

Vue.use(VueRouter);

const APIHistory = () =>
  import(/* webpackChunkName: "apiHistory" */ "../APIHistory.vue");
const Main = () => import(/* webpackChunkName: "mainApp" */ "../Main.vue");

const UserProfile = () =>
  import(/* webpackChunkName: "userProfile" */ "../views/Profile.vue");
const GamePage = () =>
  import(/* webpackChunkName: "gamePage" */ "../views/GamePage.vue");

const routes: Array<RouteConfig> = [
  {
    path: "/api-history",
    name: "ApiHistory",
    component: APIHistory
  },
  {
    path: "",
    component: Main,
    children: [
      {
        path: "",
        name: "Home",
        component: Home
      },
      {
        path: "users/:id",
        name: "UserProfile",
        component: UserProfile
      },
      {
        path: "game/:id",
        name: "GamePage",
        component: GamePage
      }
    ]
  }
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? "hash" : "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
