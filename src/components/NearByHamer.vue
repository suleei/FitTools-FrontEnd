<script setup lang="ts">
import * as NearByHamRequest from "@/networks/NearByHamRequest";
import {onMounted, onUnmounted, ref} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

const {map} = defineProps(['map']);

let activeStatus = ref(false);
let WarnInfo = ref("")
let distance = ref(5);
let hamInfo = ref({
  call_sign: null,
  distance: null
})
let timeArray = ref([])

let markers = [];

onMounted(()=>{
  loadActiveStatus();
  timeArray.value = new Array(7*24).fill(false);
})

onUnmounted(()=>{
  markersDestroy();
})

function markersDestroy(){
  for (var i = 0, l = markers.length; i < l; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

function loadActiveStatus() {
  NearByHamRequest.getActiveStatus().then(res => {
    activeStatus.value = res.data.data;
  }).catch(err=>{
    WarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function activeHandler(){
  let times = new Array(7).fill(0);
  for(let i = 0; i < 7; i++) {
    let num=0;
    for (let j = 23; j >= 0; j--) {
      num = num * 2;
      if(timeArray.value[i*24+j]) num+=1;
    }
    times[i] = num;
  }
  NearByHamRequest.setStatusActive(times).then(res => {
    loadActiveStatus();
  }).catch(err=>{
    WarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function inactiveHandler(){
  NearByHamRequest.setStatusInactive().then(res => {
    loadActiveStatus();
    markersDestroy();
    hamInfo.value.call_sign = null;
  }).catch(err=>{
    WarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function getNearbyHamHandler(){
  NearByHamRequest.getNearByHam(distance.value).then(res=>{
    console.log(res)
    showHams(res.data.data);
  }).catch(err=>{
    WarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function showHams(group: any){
  markersDestroy();
  AMapLoader.load({
    key: "8a728012124faeb45f08ce08205a9358\t", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.LngLat", "AMap.Circle", "AMap.Icon"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  })
    .then((AMap) => {
      for(let i = 1; i < group.length; i++){
         let newMarker = new AMap.Marker({
           position:[group[i].lng, group[i].lat],
         })
        newMarker.on("click", ()=>{
          hamInfo.value.call_sign = group[i].call_sign;
          hamInfo.value.distance = group[i].distance;
        })
        newMarker.setMap(map);
        markers.push(newMarker);
      }
      var circle = new AMap.Circle({
        center: [group[0].lng, group[0].lat], //圆心
        radius: distance.value * 1000, //半径
        borderWeight: 3, //描边的宽度
        strokeOpacity: 0, //轮廓线透明度
        fillOpacity: 0.1, //圆形填充透明度
        strokeDasharray: [10, 10],
        fillColor: "#1791fc", //圆形填充颜色
        zIndex: 50, //圆形的叠加顺序
      });
      map.add(circle);
      markers.push(circle);
      map.setFitView(markers, false, [100,50,50,50]);//地图自适应
    }).catch((err) => {
    console.log(err);
  })
}

function timeSegmentClick(i:number, j:number){
  console.log(i,j);
  timeArray.value[(i-1)*24+(j-1)] = !timeArray.value[(i-1)*24+(j-1)]
}
</script>

<template>
  <div class="Pad" style="left: 1%;top: 7%;width: 29.4%;">
    <div style="width: 90%;margin: auto;margin-top: 0.5rem;margin-bottom: 0.5rem;border-radius: 0.5rem;text-align:center;">
      <div v-show="!activeStatus" style="color: grey">激活后您的位置会被公开</div>
      <div style="display: flex;flex-direction: column;">
        <div style="display: flex;flex-direction: row;justify-content: space-between;margin-top: 1rem;margin-bottom: 1rem;">
          <div style="width: 2rem"></div>
          <div v-for="i in 25" style="width: 3rem;height: 0.5rem;font-size: 0.8rem;text-align: right" >{{i-1}}</div>
        </div>
        <div v-for="i in 7" style="display: flex;flex-direction: row;align-items: center; height: 1rem">
          <div style="margin-right: 1rem">{{i}}</div>
          <div v-for="j in 24" style="border: 1px solid grey;width: 3rem;height: 0.5rem" @click="timeSegmentClick(i,j)" >
            <div style="height: 100%;width: 100%;background: greenyellow" v-show="timeArray[(i-1)*24+(j-1)]"></div>
          </div>
        </div>
      </div>
      <v-btn v-show="!activeStatus" variant="outlined" style="width: 100%;height: 2rem; border-radius: 0.5rem;color: grey;" @click="activeHandler">设置活跃时间并激活</v-btn>
      <v-btn v-show="activeStatus" variant="outlined" style="width: 100%;height: 2rem; border-radius: 0.5rem;color: grey;" @click="inactiveHandler">关闭</v-btn>
    </div>
    <div v-show="activeStatus" style="width: 90%;margin: auto;display: flex;flex-direction: row;justify-content: center;margin-top: 2rem">
      <v-text-field  style="width: 70%" density="compact" label="距离(公里)" variant="outlined" prepend-inner-icon="mdi-social-distance-2-meters" v-model="distance"></v-text-field>
      <v-btn variant="outlined" style="width: 25%;margin-left:5%;border-radius: 0.5rem;color: grey; height: 2.5rem" @click="getNearbyHamHandler">搜索</v-btn>
    </div>
    <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
  </div>
  <div class="Pad" style="left: 1%;top: 25%;width: 19.6%;" v-show="hamInfo.call_sign">
    <div style="width: 90%;margin:auto;margin-top:1.5rem">
      <v-text-field density="compact"  label="呼号" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="hamInfo.call_sign" readonly></v-text-field>
      <v-text-field density="compact"  label="距离(公里)" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="hamInfo.distance" readonly></v-text-field>
    </div>
  </div>
</template>

<style scoped>
.Pad{
  position: absolute;
  border-radius: 1rem;
  border: 1px solid gray;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
</style>
