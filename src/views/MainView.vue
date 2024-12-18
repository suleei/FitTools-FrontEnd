<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import {useRouter} from "vue-router";
import UserInfoModification from "@/components/UserInfoModification.vue";
import * as userRequests from "@/networks/userRequests";

let map:any = null;

const login = ref(false);
const username = ref("");
const infoPadDisplay = ref(false);
const displayItem = ref("")
let userAvatar = ref("")
let geocoder = null
let autoComplete = null
let lnglat = ref(["",""])
let marker = null

const router = useRouter();

onMounted(() => {
  userInfoReload()
  if(sessionStorage.getItem("jwt")){
    login.value = true;
  }
  window._AMapSecurityConfig = {
    securityJsCode: "eef4c8683731d938839a4d1a9eebfbdc",
  };
  AMapLoader.load({
    key: "8a728012124faeb45f08ce08205a9358\t", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Geocoder", "AMap.AutoComplete", "AMap.Marker"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  })
    .then((AMap) => {
      map = new AMap.Map("container", {
        // 设置地图容器id
        zoom: 12, // 初始化地图级别
        mapStyle: "amap://styles/whitesmoke", //设置地图的显示样式
        showLabel: false //不显示地图文字标记,
      });
      map.on("click", (event) => {
        lnglat.value = [event.lnglat.lng, event.lnglat.lat]
      });
      geocoder = new AMap.Geocoder();
      autoComplete = new AMap.AutoComplete();
      marker = new AMap.Marker();
    })
    .catch((e) => {
      console.log(e);
    });
});

onUnmounted(() => {
  map?.destroy();
});

function userInfoReload(){
  userRequests.getUserInfo().then((res) => {
    userAvatar.value = res.data.data.avatar;
    username.value = res.data.data.username;
  }).catch((err) => {
    console.log(err)
  })
}

function loginRedirectHandler(){
  router.push({path:'/login'})
}

function logoutHandler(){
  sessionStorage.removeItem("jwt");
  sessionStorage.removeItem("username");
  router.push({path:'/login'});
}
</script>

<template>
  <div id="container">
  </div>
  <div id="menu" style="overflow: hidden;display: flex;align-items: center">
    <div class="menuItem">
      <v-btn variant="plain" style="width: 100%;height: 100%;color: gray" @click="displayItem='AddCommunicationLog'">
        新建日志
      </v-btn>
    </div>
    <div class="menuItem" >
    </div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" >
    </div>
  </div>
  <div id="userInfoMenu" style="text-align: center;height: 15%;" >
    <div style="display: flex;align-items: center;justify-content: left;height: 33.3%" @mouseover="infoPadDisplay= true" @mouseout="infoPadDisplay= false">
      <v-btn variant="plain" style="width: 100%;height: 100%;color: gray" v-show=!login @click="loginRedirectHandler">
        登录
      </v-btn>
      <v-btn variant="plain" v-show=login style="width: 100%;height: 100%;color: gray;display: flex;align-items: center;justify-content: left">
        <v-avatar :image=userAvatar style="margin-left: 1rem"></v-avatar>
        <text style="margin-left: 1rem"> {{username}} </text>
      </v-btn>
    </div>
    <div style="height: 66.6%" id="infoPad" v-show="infoPadDisplay" @mouseover="infoPadDisplay= true" @mouseout="infoPadDisplay= false">
      <v-btn variant="plain" class="infoItem" style="width: 100%;height: 50%;border-radius: 1rem;" @click="displayItem='InfoModification'">
        修改个人信息
      </v-btn>
      <v-btn variant="plain" class="infoItem" style="width: 100%;height: 50%;border-radius: 1rem;color: darkred" @click="logoutHandler">
        退出账号
      </v-btn>
    </div>
  </div>
  <div>
    <UserInfoModification v-show="displayItem==='InfoModification'" @infoUpdate="userInfoReload" :geocoder="geocoder" :lnglat="lnglat" :autoComplete="autoComplete" :marker = "marker" :map="map"></UserInfoModification>
  </div>
</template>

<style scoped>
#container{
  padding:0px;
  margin: 0px;
  width: 100%;
  height: 100%;
  position: absolute;
}
::v-deep .amap-logo {
  display: none;
  opacity: 0 !important;
}
::v-deep .amap-copyright {
  opacity: 0;
}

#menu{
  position: absolute;
  top:1%;
  height: 5%;
  left:1%;
  width: 98%;
  border: 1px solid gray;
  border-radius: 1rem;

  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.menuItem{
  border: 1px solid gray;
  height: 100%;
  width: 10%;
}

#userInfoMenu{
  position: absolute;
  top:1%;
  left:89.2%;
  width: 9.8%;
  border-radius: 1rem;
  z-index: 100;
}

#infoPad{
  height: 50%;
  width: 100%;
  border-radius: 1rem;
  border: 1px solid gray;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

</style>
