<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import * as communicationLogRequest from "@/networks/communicationLogRequest";
import AMapLoader from "@amap/amap-jsapi-loader";

const {map,marker} = defineProps(['map','marker']);
let end_marker = null;
let pageLogList = ref(null);
let pageNum = 1;
let WarnInfo = ref("")
let detailShow = ref(false);
let currId = null;
let detailInfo = ref(null)
let markerGrp = []


onMounted(()=>{
  loadPageLogs();
  AMapLoader.load({
    key: "8a728012124faeb45f08ce08205a9358\t", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Geocoder", "AMap.AutoComplete", "AMap.Marker","AMap.DistrictSearch", "AMap.Weather"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  })
    .then((AMap) => {
      end_marker = new AMap.Marker();
    })
    .catch((e) => {
      console.log(e);
    });
})

onUnmounted(()=>{
  markerDestroyHandler()
})

function loadPageLogs() {
  communicationLogRequest.getGuestCommunicationLogs(pageNum).then(res => {
    pageLogList.value = res.data.data;
    console.log(pageLogList);
  })
}

function nextPageLoadHandler(){
  if(pageLogList.value.length < 20){
    WarnInfo.value = "当前页已是最后一页"
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    return;
  }
  pageNum++;
  loadPageLogs();
}

function previousPageLoadHandler(){
  if(pageNum === 1){
    WarnInfo.value = "当前页已是第一页"
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    return;
  }
  pageNum--;
  loadPageLogs();
}

function deleteLogHandler(id:number){
  communicationLogRequest.deleteCommunicationLog(id).then(res=>{
    loadPageLogs();
  }).catch(err=>{
    WarnInfo.value = err.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    return;
  })
}

function detailShowHandler(id:number){
  if(id === currId){
    detailShow.value = true;
    return;
  }
  currId = id;
  communicationLogRequest.getGuestCommunicationLogDetail(id).then(res=>{
    detailInfo.value = res.data.data;
    detailInfo.value.source_address_des = detailInfo.value.source_district + detailInfo.value.source_address
    let seconds = detailInfo.value.duration/1000
    let hour = Math.floor(seconds / 3600)
    let minute = Math.floor((seconds-hour*3600) / 60)
    let second = seconds%60
    detailInfo.value.duration = hour.toString().padStart(2, '0')+':'+minute.toString().padStart(2, '0')+':'+second.toString().padStart(2, '0');
    detailInfo.value.distance = Math.round(detailInfo.value.distance/1000);
    detailShow.value = true;
    AMapLoader.load({
      key: "8a728012124faeb45f08ce08205a9358\t", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ["AMap.Polyline", "AMap.LngLat"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
    })
      .then((AMap) => {
        let startPoint = new AMap.LngLat(detailInfo.value.source_lng,detailInfo.value.source_lat);
        let endPoint = new AMap.LngLat(detailInfo.value.target_lng,detailInfo.value.target_lat);
        let Line = new AMap.Polyline({
          path: [startPoint, endPoint],
          strokeWeight: 2, //线条宽度
          strokeColor: "#33CCFF", //线条颜色
        })
        marker.setPosition([detailInfo.value.source_lng,detailInfo.value.source_lat]);
        end_marker.setPosition([detailInfo.value.target_lng,detailInfo.value.target_lat]);
        map.add(Line);
        Line.show();
        marker.setMap(map);
        end_marker.setMap(map);
        markerGrp.push(end_marker);
        markerGrp.push(marker);
        markerGrp.push(Line);
        map.setFitView(markerGrp,false, [100,50,1000,50]);//地图自适应
      }).catch((err) => {
      console.log(err);
    })
  }).catch(err=>{
    WarnInfo.value = err.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    return;
  })
}

function markerDestroyHandler(){
  for (var i = 0, l = markerGrp.length; i < l; i++) {
    markerGrp[i].setMap(null);
  }
  markerGrp = [];
}

function detailCloseHandler(){
  detailShow.value=false
  markerDestroyHandler()
}

function acceptLogHandler(logId:number){
  communicationLogRequest.acceptLog(logId).then(res=>{
    loadPageLogs();
  }).catch(err=>{
    WarnInfo.value = err.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    return;
  })
}

function rejectLogHandler(logId:number){
  communicationLogRequest.rejectLog(logId).then(res=>{
    loadPageLogs();
  }).catch(err=>{
    WarnInfo.value = err.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    return;
  })
}
</script>

<template>
  <div>
    <div class="Pad" style="left: 1%;top: 7%;width: 49%;" v-if="!detailShow">
      <div style="width: 95%;color: gray;display: flex;flex-direction: row;justify-content: flex-start;margin:auto;margin-top:1rem" >
        <div style="width: 18%"><text style="word-wrap: break-word;">时间</text></div>
        <div style="width: 12%"><text style="word-wrap: break-word;">呼号</text></div>
        <div style="width: 50%"><text style="word-wrap: break-word;">位置</text></div>
        <div style="width: 10%"><text style="word-wrap: break-word;">距离(公里)</text></div>
        <div style="width: 5%"><text style="word-wrap: break-word;">同意</text></div>
        <div style="width: 5%"><text style="word-wrap: break-word;">拒绝</text></div>
      </div>
      <div class="selectedItem" v-for="log in pageLogList" :key="log.id" style="width: 95%;color: gray;display: flex;flex-direction: row;justify-content: flex-start;margin:auto;height: 2rem" id="selectedItem" >
          <div style="width: 18%" @click="detailShowHandler(log.id)"><text style="word-wrap: break-word;">{{log.start_time}}</text></div>
          <div style="width: 12%" @click="detailShowHandler(log.id)"><text style="word-wrap: break-word;">{{log.target_call_sign}}</text></div>
          <div style="width: 50%" @click="detailShowHandler(log.id)"><text style="word-wrap: break-word;">{{log.target_address}}</text></div>
          <div style="width: 10%" @click="detailShowHandler(log.id)"><text style="word-wrap: break-word;">{{Math.round(log.distance/1000)}}</text></div>
        <div style="width: 5%">
          <v-icon icon="mdi-check" class="acceptIcon" @click="acceptLogHandler(log.id)"></v-icon>
        </div>
        <div style="width: 5%">
          <v-icon icon="mdi-close" class="deleteIcon" @click="rejectLogHandler(log.id)"></v-icon>
        </div>
      </div>
      <div style="width: 50%;margin: auto;margin-bottom: 0.5rem">
        <v-btn  prepend-icon="mdi-minus" variant="outlined" class="infoItem" style="width: 45%;height: 2rem; border-radius: 0.5rem;color: grey;" @click="previousPageLoadHandler">
          上一页
        </v-btn>
        <v-btn prepend-icon="mdi-plus" variant="outlined" class="infoItem" style="width: 45%;height: 2rem; border-radius: 0.5rem;color: grey;margin-left: 10%;" @click="nextPageLoadHandler">
          下一页
        </v-btn>
      </div>
      <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
    </div>

    <div class="Pad" style="left: 1%;top: 7%;width: 49%;" v-if="detailShow">
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;margin-top: 2rem">
        <v-text-field  density="compact" style="height: 1rem" label="己方呼号" variant="outlined" prepend-inner-icon="mdi-alphabetical-variant" v-model="detailInfo.target_call_sign" readonly></v-text-field>
        <v-text-field   density="compact" style="margin-left: 2%" label="己方设备(RIG)" variant="outlined" prepend-inner-icon="mdi-cellphone-basic" v-model="detailInfo.target_device" readonly></v-text-field>
        <v-text-field   density="compact" style="margin-left: 2%" label="己方天线(ANT)" variant="outlined" prepend-inner-icon="mdi-antenna" v-model="detailInfo.target_antenna" readonly></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field  density="compact" label="己方功率(PWR)" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="detailInfo.target_power" readonly></v-text-field>
        <v-text-field density="compact"  style="margin-left: 2%" label="频率(MHz)" variant="outlined" prepend-inner-icon="mdi-sine-wave" v-model="detailInfo.frequency" readonly></v-text-field>
        <v-text-field density="compact" style="margin-left: 2%" label="模式(MODE)" variant="outlined" prepend-inner-icon="mdi-menu" v-model="detailInfo.mode" readonly></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field density="compact"  label="己方地址" variant="outlined" prepend-inner-icon="mdi-map-marker" v-model="detailInfo.target_address" readonly></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field density="compact"  label="天气" variant="outlined" prepend-inner-icon="mdi-weather-cloudy" v-model="detailInfo.weather" readonly></v-text-field>
      </div>
      <v-divider style="margin: 1rem 1rem"></v-divider>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;margin-top: 2rem">
        <v-text-field density="compact" style="width: 20%"label="开始时间(UTC+8)" variant="outlined" prepend-inner-icon="mdi-clock-time-eight-outline" v-model="detailInfo.start_time" readonly></v-text-field>
        <v-text-field density="compact" style="width: 20%;margin-left: 2%" label="结束时间(UTC+8)" variant="outlined" prepend-inner-icon="mdi-clock-time-eight-outline" v-model="detailInfo.end_time" readonly></v-text-field>
        <v-text-field density="compact" style="margin-left: 2%" label="持续时间" variant="outlined" prepend-inner-icon="mdi-timelapse" v-model="detailInfo.duration" readonly></v-text-field>
        <v-text-field density="compact" style="margin-left: 2%" label="通联距离" variant="outlined" prepend-inner-icon="mdi-map-marker-distance" v-model="detailInfo.distance" readonly></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field density="compact" label="对方呼号" variant="outlined" prepend-inner-icon="mdi-alphabetical-variant" v-model="detailInfo.source_call_sign" readonly></v-text-field>
        <v-text-field density="compact"  style="margin-left: 2%" label="对方设备(RIG)" variant="outlined" prepend-inner-icon="mdi-cellphone-basic" v-model="detailInfo.source_device" readonly></v-text-field>
        <v-text-field density="compact"  style="margin-left: 2%" label="对方天线(ANT)" variant="outlined" prepend-inner-icon="mdi-antenna" v-model="detailInfo.source_antenna" readonly></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field density="compact"  label="对方功率(PWR)" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="detailInfo.source_power" readonly></v-text-field>
        <v-text-field density="compact"  style="margin-left: 2%" label="己方信号报告(RST)" variant="outlined" prepend-inner-icon="mdi-chart-line" v-model="detailInfo.target_rst" readonly></v-text-field>
        <v-text-field density="compact" style="margin-left: 2%" label="对方信号报告(RST)" variant="outlined" prepend-inner-icon="mdi-chart-line" v-model="detailInfo.source_rst" readonly></v-text-field>
      </div>
      <div style="width: 90%;margin:auto;display: flex;justify-content: center;">
        <v-text-field  density="compact" label="对方地址" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="detailInfo.source_address_des" readonly></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field  density="compact" label="备注" variant="outlined" prepend-inner-icon="mdi-account-outline" v-model="detailInfo.comments" readonly></v-text-field>
      </div>
      <div style="width: 50%;margin: auto;margin-bottom: 0.5rem">
        <v-btn prepend-icon="mdi-arrow-left" variant="outlined" class="infoItem" style="width: 100%;height: 2rem; border-radius: 0.5rem;color: grey;" @click="detailCloseHandler">
          返回
        </v-btn>
      </div>
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

.deleteIcon:hover{
  color: darkred;
}

.acceptIcon:hover{
  color: green;
}

.selectedItem:hover{
  background: rgba(0, 0, 0, 0.1);
}
</style>
