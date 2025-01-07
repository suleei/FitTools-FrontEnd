<script setup lang="ts">
import {onUnmounted, ref} from "vue";
import * as activityRequest from "@/networks/activityRequest";
import AMapLoader from "@amap/amap-jsapi-loader";

const {map} = defineProps(['map']);

const items = ref([])
let marks = [];

onUnmounted(()=>{
  clearMarks();
})

async function api () {
  return new Promise(resolve => {
    activityRequest.getActivities().then((activities) => {
      resolve(activities.data.data);
    })
  })
}
async function load () {
  const res = await api()
  items.value.push(...res)
}

function displayGeoInfo(activity: any) {
  clearMarks();
  AMapLoader.load({
    key: "8a728012124faeb45f08ce08205a9358\t", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Polyline", "AMap.LngLat", "AMap.Marker"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  })
    .then((AMap) => {
      let startPoint = new AMap.LngLat(activity.sourceLng,activity.sourceLat);
      let endPoint = new AMap.LngLat(activity.targetLng,activity.targetLat);
      let Line = new AMap.Polyline({
        path: [startPoint, endPoint],
        strokeWeight: 2, //线条宽度
        strokeColor: "#33CCFF", //线条颜色
      })
      let startMarker = new AMap.Marker();
      let endMarker = new AMap.Marker();
      startMarker.setPosition([activity.sourceLng,activity.sourceLat]);
      startMarker.setMap(map);
      endMarker.setPosition([activity.targetLng,activity.targetLat]);
      endMarker.setMap(map);
      map.add(Line);
      Line.show();
      marks.push(startMarker);
      marks.push(endMarker);
      marks.push(Line);
      map.setFitView(marks,false, [150,50,1000,50]);//地图自适应
    }).catch((err) => {
    console.log(err);
  })
}

function clearMarks(){
  for (var i = 0, l = marks.length; i < l; i++) {
    marks[i].setMap(null);
  }
  marks = [];
}

function thumbsUp(activityId: number) {
  activityRequest.thumbsUp(activityId).then(() => {

  }).catch((err) => {
    console.log(err);
  })
}
</script>

<template>
  <div>
    <div id="listPad" style="display:flex;flex-direction:column;align-items:center;">
      <v-infinite-scroll :items="items" :onLoad="load" style="width:95%;caret-color: transparent;">
        <template v-for="activity in items" :key="activity">
          <div style="border: 1px grey solid;padding: 0.5rem;margin-top: 0.5rem;margin-bottom: 0.5rem;border-radius: 0.8rem;">
            <div style="display: flex;flex-direction: row;align-items: center;cursor: pointer;" @click="displayGeoInfo(activity)">
              <div style="width:10%;text-align:center;">
                <v-avatar :image="activity.avatar" style="border: 1px grey solid;"></v-avatar>
                <div style="color: grey;">{{activity.source}}</div>
              </div>
              <div style="width:60%;display: flex;flex-direction: row;font-size: 1.2rem;color: grey;">
                <div style="width: 45%;text-align:right;">
                  <div>{{activity.source}}</div>
                  <div>{{activity.sourceAddress}}</div>
                </div>
                <div style="width: 10%;text-align:center;">
                  <div>-></div>
                  <div>-></div>
                </div>
                <div style="width: 45%;text-align:left;">
                  <div>{{activity.target}}</div>
                  <div>{{activity.targetAddress}}</div>
                </div>
              </div>
              <div style="width:30%;text-align:right;font-size: 1.2rem;color: grey;">
                <div>{{activity.distance}}公里</div>
                <div>{{activity.startTime}}</div>
              </div>
            </div>
            <div>
              <v-btn icon="mdi-thumb-up-outline" variant="text" @click="thumbsUp(activity.id)"></v-btn>
            </div>
          </div>
        </template>
      </v-infinite-scroll>
    </div>
  </div>

</template>

<style scoped>
#listPad{
  position: absolute;
  left: 1%;
  top: 7%;
  border-radius: 1rem;
  border: 1px solid gray;
  width: 39.2%;
  height: 92%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

</style>
