<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import {useRouter} from "vue-router";
import UserInfoModification from "@/components/UserInfoModification.vue";
import * as userRequests from "@/networks/userRequests";
import * as logConfirmRequest from "@/networks/logConfirmRequest";
import AddLog from "@/components/AddLog.vue";
import LogManagement from "@/components/LogManagement.vue";
import NearByHamer from "@/components/NearByHamer.vue";
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
let district = null
let weather = null;
let stompClient = null;
let clogs = null;
let socket = null;
let confirm_log = ref("0");
const router = useRouter();

onMounted(() => {
  logConfirmRequest.getConfirmLog().then(response => {
    confirm_log.value = response.data.data;
  }).catch(error => {
    console.log(error)
  })
  userRequests.getUserInfo().then((res) => {
    userAvatar.value = res.data.data.avatar;
    username.value = res.data.data.username;
    let callSign = res.data.data.call_sign;
    let socketUrl = "ws://localhost:8080/ws/log_confirm_notify/"+callSign;
    socket = new WebSocket(socketUrl);
    /*socket.onopen = () => {
      console.log("Connection opened");
    }*/
    socket.onmessage = (res) => {
      confirm_log.value = res.data;
    }
  }).catch((err) => {
    console.log(err)
  })
  if(sessionStorage.getItem("jwt")){
    login.value = true;
  }
  window._AMapSecurityConfig = {
    securityJsCode: "eef4c8683731d938839a4d1a9eebfbdc",
  };
  AMapLoader.load({
    key: "8a728012124faeb45f08ce08205a9358\t", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Geocoder", "AMap.AutoComplete", "AMap.Marker","AMap.DistrictSearch", "AMap.Weather"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
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
      weather = new AMap.Weather();
      var opts = {
        subdistrict: 1,   //返回下一级行政区
        showbiz: false  //最后一级返回街道信息
      };
      district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
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

function confirmLogHandler(){
  displayItem.value=displayItem.value==='GuestLogManagement'?'':'GuestLogManagement';
  logConfirmRequest.deleteConfirmLog().then(response => {
    confirm_log.value = "0";
  })
}
</script>

<template>
  <div id="container">
  </div>
  <div id="menu" style="overflow: hidden;display: flex;align-items: center">
    <div class="menuItem">
      <v-btn variant="plain" style="width: 100%;height: 100%;color: gray" @click="displayItem=displayItem==='AddCommunicationLog'?'':'AddCommunicationLog'">
        新建日志
      </v-btn>
    </div>
    <div class="menuItem" >
      <v-btn variant="plain" style="width: 100%;height: 100%;color: gray" @click="displayItem=displayItem==='LogManagement'?'':'LogManagement'">
        管理日志
      </v-btn>
    </div>
    <div class="menuItem" >
      <v-btn variant="plain" style="width: 100%;height: 100%;color: gray" @click="confirmLogHandler">
        待确认日志
        <v-avatar color="red" size="x-small" v-show="confirm_log!=='0'">{{confirm_log}}</v-avatar>
      </v-btn>
    </div>
    <div class="menuItem" >
      <v-btn variant="plain" style="width: 100%;height: 100%;color: gray" @click="displayItem=displayItem==='NearByHammer'?'':'NearByHammer'">
        附近的HAM
      </v-btn>
    </div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" ></div>
    <div class="menuItem" >
      <v-btn variant="plain" style="width: 100%;height: 100%;color: gray" @click="displayItem=displayItem==='DeviceManagement'?'':'DeviceManagement'">
        管理设备
      </v-btn>
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
      <v-btn variant="plain" class="infoItem" style="width: 100%;height: 50%;border-radius: 1rem;" @click="displayItem=displayItem==='InfoModification'?'':'InfoModification'">
        修改个人信息
      </v-btn>
      <v-btn variant="plain" class="infoItem" style="width: 100%;height: 50%;border-radius: 1rem;color: darkred" @click="logoutHandler">
        退出账号
      </v-btn>
    </div>
  </div>
  <div>
    <UserInfoModification v-if="displayItem==='InfoModification'" @infoUpdate="userInfoReload" :geocoder="geocoder" :lnglat="lnglat" :autoComplete="autoComplete" :marker = "marker" :map="map"></UserInfoModification>
  </div>
  <div>
    <AddLog v-if="displayItem==='AddCommunicationLog'" :map="map" :districtFind="district" :geocoder="geocoder" :marker = "marker" :weather="weather" :autoComplete="autoComplete"> </AddLog>
  </div>
  <div>
    <DeviceManagement v-if="displayItem==='DeviceManagement'"></DeviceManagement>
  </div>
  <div>
    <LogManagement v-if="displayItem==='LogManagement'" :map="map" :marker = "marker"></LogManagement>
  </div>
  <div>
    <GuestLogManagement v-if="displayItem==='GuestLogManagement'" :map="map" :marker = "marker"></GuestLogManagement>
  </div>

  <div>
    <NearByHamer v-if="displayItem==='NearByHammer'" :map="map" ></NearByHamer>
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
