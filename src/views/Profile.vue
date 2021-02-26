<template>
  <div>
    <div class="md:flex md:flex-row">
      <div
        class="relative shadow-lg flex-shrink-0 flex-grow-0 user-card mb-8 md:mb-0 mx-auto w-full max-h-96 rounded-lg p-4 overflow-hidden bg-cover bg-no-repeat bg-center md:h-screen md:max-h-screen md:mx-0 md:w-80 max-w-96 bg-light-500"
        style="background-image: url('https://cdn.discordapp.com/attachments/754759881436692570/800161722085802054/AvatarEditor_LightTheme.png')"
      >
        <p class="font-bold text-lg">{{ user ? displayName : "" }}</p>
        <p
          class="font-medium text-sm"
          :class="[`presence-${(presence && presence.userPresenceType) || 0}`]"
        >
          {{
            (presence.userPresenceType === 0 && "Offline") ||
              (presence.userPresenceType === 1 && "Online") ||
              (presence.userPresenceType === 2 && "Playing") ||
              (presence.userPresenceType === 3 && "Studio") ||
              ""
          }}
        </p>
        <div
          class="absolute flex place-items-center top-0 right-0 bottom-0 left-0 pointer-events-none"
        >
          <!-- <div
            class="h-3/5 w-2/3 mx-auto bg-no-repeat bg-cover bg-center card-bg"
            :style="`background-image: url('${avatarSrc}');`"
          >
            &nbsp;
          </div> -->
          <div class="h-3/5 w-full mx-auto" ref="avatarRender" />
        </div>
      </div>
      <div class="flex-grow overflow-hidden flex flex-col ml-4">
        <div>
          <!-- About Me -->
          <p
            class="uppercase opacity-75 font-semibold text-lg tracking-wide mb-2"
          >
            About Me
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Est
            quibusdam quia iusto reiciendis. Ipsam possimus, laudantium
            recusandae dolorum aperiam cupiditate eligendi facere doloribus
            rerum dignissimos. Consequuntur eius exercitationem est natus!
          </p>
          <hr class="border-light-700 dark:border-dark-400 my-2" />
        </div>
        <div>
          <!-- Friends -->
          <p
            class="uppercase opacity-75 font-semibold text-lg tracking-wide mb-2"
          >
            Friends
          </p>
          <!-- TODO Make a grid with user friends -->
          <hr class="border-light-700 dark:border-dark-400 my-2" />
        </div>
        <div>
          <!-- Games -->
          <p
            class="uppercase opacity-75 font-semibold text-lg tracking-wide mb-2"
          >
            Games
          </p>
          <!-- TODO Make a grid with user games -->
          <hr class="border-light-700 dark:border-dark-400 my-2" />
        </div>
        <div>
          <!-- Groups -->
          <p
            class="uppercase opacity-75 font-semibold text-lg tracking-wide mb-2"
          >
            Groups
          </p>
          <!-- TODO Make a grid with user groups -->
          <div
            class="flex-grow w-full overflow-x-scroll grid grid-flow-col space-x-4 overflow-hidden p-4 pt-0"
          >
            <group-card
              v-if="primaryGroup && primaryGroup.group"
              :data="primaryGroup"
              :large="true"
            />
            <group-card
              v-for="data in groups"
              :key="data.group.id"
              :data="data"
            />
          </div>
          <hr class="border-light-700 dark:border-dark-400 my-2" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import LoadingSpinner from "@/components/global/Loading.vue";
import GroupCard from "@/components/group/GroupCard.vue";
import bloxyClient from "@/util/bloxyClient";
import { User } from "bloxy/dist/structures";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getHashUrl } from "@/util/robloxUtil";
import axios from "axios";
import { Mesh } from "three";

interface Presence {
  userPresenceType: number;
  lastLocation: string;
  placeId: number;
  rootPlaceId: number;
  gameId: string;
  universeId: number;
  userId: number;
  lastOnline: string;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface AvatarData3D {
  camera: {
    position: Vector3;
    direction: Vector3;
    fov: number;
  };
  aabb: {
    min: Vector3;
    max: Vector3;
  };
  mtl: string;
  obj: string;
  textures: string[];
}

@Component<UserProfile>({
  components: { LoadingSpinner, GroupCard },
  watch: {
    $route: function() {
      this.fetch();
    }
  },
  created() {
    this.fetch();
  },
  beforeDestroy() {
    if (this.animationFrameId !== 0)
      window.cancelAnimationFrame(this.animationFrameId);
    this.beforeDestroyVoids.forEach(func => func());
  }
})
export default class UserProfile extends Vue {
  user: User = {} as User;
  displayName = "";
  groups: unknown = [];
  primaryGroup: unknown = {};
  presence: Presence = {} as Presence;
  avatarSrc = "";

  animationFrameId = 0;
  beforeDestroyVoids: (() => void)[] = [];

  async fetchUser() {
    const user = await bloxyClient.getUser(this.$route.params.id);
    this.user = user;
    const rawUserData = await bloxyClient.apis.usersAPI.getUserById({
      userId: parseInt(this.$route.params.id)
    });
    this.displayName = rawUserData.displayName;
  }

  async fetchGroups() {
    const groupsUnfiltered = await this.user.getGroups();
    const primaryGroup = await this.user.getPrimaryGroup();

    let groups;

    if (
      primaryGroup &&
      primaryGroup.group &&
      primaryGroup.group.id &&
      primaryGroup.role
    ) {
      groups = groupsUnfiltered.data.filter(
        group => group.group.id !== primaryGroup.group?.id
      );
      this.primaryGroup = primaryGroup;
    } else {
      groups = groupsUnfiltered.data;
    }

    this.groups = groups;
  }

  async fetchPresence() {
    this.presence = await this.user.getPresence();

    const avatarSrc = await this.user.getFullBodyAvatarImage({
      size: "720x720",
      format: "png"
    });
    this.avatarSrc = avatarSrc.imageUrl;
  }

  async fetchAvatar() {
    const element = this.$refs.avatarRender as Element;
    let rect = element.getBoundingClientRect();

    const dataUrl: {
      targetId: number;
      state: string;
      imageUrl: string;
    } = await bloxyClient.apis.thumbnailsAPI
      .request({
        requiresAuth: false,
        request: {
          path: "v1/users/avatar-3d",
          qs: { userId: this.$route.params.id }
        },
        json: true
      })
      .then(response => response.body);

    const threeDimensionDataResponse = await axios.get<AvatarData3D>(
      dataUrl.imageUrl
    );
    const avatarData = threeDimensionDataResponse.data;

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(
      avatarData.camera.fov,
      rect.width / rect.height,
      0.1,
      1000
    );

    const ambientLight = new THREE.AmbientLight(0xcfcfcfcf);
    scene.add(ambientLight);

    const camPos = avatarData.camera.position;
    const camRot = avatarData.camera.direction;

    const aabbMin = avatarData.aabb.min;
    const aabbMax = avatarData.aabb.max;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.target = new THREE.Vector3(
      (aabbMin.x + aabbMax.x) / 2,
      (aabbMin.y + aabbMax.y) / 2,
      (aabbMin.z + aabbMax.z) / 2
    );

    camera.position.set(camPos.x, (aabbMin.y + aabbMax.y) / 2, camPos.z - 2);
    camera.rotation.set(camRot.x, camRot.y, camRot.z);
    controls.update();

    renderer.setSize(rect.width, rect.height);
    element.appendChild(renderer.domElement);

    {
      const loadingManager = new THREE.LoadingManager();

      loadingManager.setURLModifier(url => {
        const match = url.match(/(?:https:\/\/t[0-9].rbxcdn.com\/)([^\s]+)/i);
        if (match && match[1]) return getHashUrl(match[1]);
        return url;
      });

      const textureLoadingManager = new THREE.LoadingManager();
      textureLoadingManager.setURLModifier(url => {
        const match = url.match(/(?:https:\/\/t[0-9].rbxcdn.com\/)([^\s]+)/i);
        if (match && match[1]) return getHashUrl(match[1]);
        return url;
      });

      loadingManager.addHandler(
        /(?:https:\/\/t[0-9].rbxcdn.com\/)[^\s]+/i,
        new THREE.TextureLoader(textureLoadingManager)
      );

      const loader = new MTLLoader(loadingManager);
      loader.load(getHashUrl(avatarData.mtl), materials => {
        materials.preload();
        new OBJLoader()
          .setMaterials(materials)
          .load(getHashUrl(avatarData.obj), (object: THREE.Object3D) => {
            object.traverse(child => {
              if (child instanceof Mesh) {
                delete child.material.alphaMap;
              }
            });
            scene.add(object);
          });
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    function onWindowResize() {
      rect = element.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();

      renderer.setSize(rect.width, rect.height);
    }

    window.addEventListener("resize", onWindowResize, false);
    this.beforeDestroyVoids.push(() => {
      window.removeEventListener("resize", onWindowResize);
    });

    function render() {
      _this.animationFrameId = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    }

    this.animationFrameId = requestAnimationFrame(render);
    render();
  }

  async fetch() {
    await this.fetchUser();
    this.fetchGroups();
    this.fetchPresence();
    this.fetchAvatar();
  }
}
</script>

<style scoped>
.max-w-96 {
  max-width: 24rem;
}

@screen md {
  .user-card {
    max-height: 35rem;
  }
}

.user-card {
  max-width: 24rem;
  height: calc(100vh - 8rem);
}
.user-card-gradient {
  background: linear-gradient(
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.5) 100%
  );
}

.card-parent:hover .card-bg,
.card-parent:focus .card-bg {
  transform: scale(1.1);
}

.presence-1 {
  @apply text-blue-600;
}
</style>
