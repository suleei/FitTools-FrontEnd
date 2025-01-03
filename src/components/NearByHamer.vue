<script setup lang="ts">
import * as NearByHamRequest from "@/networks/nearByHamRequest";
import * as chatRequest from "@/networks/chatRequest";
import {onMounted, onUnmounted, ref} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

defineExpose({
  insertMessage
});

const {map,socket, online_status} = defineProps(['map','socket','online_status']);

let activeStatus = ref(false);
let WarnInfo = ref("")
let MessageWarnInfo = ref("")
let distance = ref(5);
let hamInfo = ref({
  call_sign: null,
  distance: null
})
let timeArray = ref([])
let GuestTimeArray = ref([])
let chat = ref(false)
let pre_target_call_sign = ref("");
let target_call_sign = ref("")
let target_show = ref("")

let markers = [];

let inputMessage = ref("");

let messages = ref([
])

onMounted(()=>{
  timeArray.value = new Array(7*24).fill(false);
  loadActiveStatus();
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
    if(activeStatus.value){
      getActiveTime();
    }
  }).catch(err=>{
    WarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function getActiveTime(){
  NearByHamRequest.getActiveTime().then(res => {
    for(let i = 0; i < 7; i++) {
      let num=res.data.data[i];
      for (let j = 0; j <= 23; j++) {
        if(num%2 == 1){
          timeArray.value[i*24+j] = true;
        }
        num = num / 2;
      }
    }
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
    timeArray.value = new Array(7*24).fill(false);
  }).catch(err=>{
    WarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function getNearbyHamHandler(){
  NearByHamRequest.getNearByHam(distance.value).then(res=>{
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
          target_call_sign.value = group[i].call_sign;
          GuestTimeArray.value = new Array(7*24).fill(false);
          for(let ii = 0; ii < 7; ii++) {
            let num=group[i].active_time[ii];
            for (let j = 0; j <= 23; j++) {
              if(num%2 == 1){
                GuestTimeArray.value[ii*24+j] = true;
              }
              num = num / 2;
            }
          }
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
      map.setFitView(markers, false, [100,50,600,600]);//地图自适应
    }).catch((err) => {
    console.log(err);
  })
}

function timeSegmentClick(i:number, j:number){
  timeArray.value[(i-1)*24+(j-1)] = !timeArray.value[(i-1)*24+(j-1)]
}

function updateActiveTimeHandler(){
  let times = new Array(7).fill(0);
  for(let i = 0; i < 7; i++) {
    let num=0;
    for (let j = 23; j >= 0; j--) {
      num = num * 2;
      if(timeArray.value[i*24+j]) num+=1;
    }
    times[i] = num;
  }
  NearByHamRequest.updateActiveTime(times).then(res => {
    loadActiveStatus();
  }).catch(err=>{
    loadActiveStatus();
    WarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function openChatWindowHandler(){
  if(chat.value === false || chat.value === true && pre_target_call_sign.value !== target_call_sign.value){
    chat.value = true;
    target_show.value = target_call_sign.value;
    socket.send(JSON.stringify({
      active_target: target_call_sign.value
    }))
    pre_target_call_sign.value = target_call_sign.value;
    chatRequest.getCachedMessages(target_call_sign.value).then(res=>{
      messages.value = res.data.data;
      setTimeout(()=>{
        const element = document.getElementById("chat_window");
        element.scrollTop = element.scrollHeight;
      },5);
    }).catch(err=>{
      WarnInfo.value = err.response.data.message;
      setTimeout(()=>{
        WarnInfo.value = ""
      },1000)
    })
  }else{
    chat.value = false;
    socket.send(JSON.stringify({
      active_target: "CLOSE_CHAT"
    }))
  }
}

function messageSendingHandler(){
  let date = new Date();
  let now_date = date.getFullYear().toString().padStart(4, '0') + '-' + (date.getMonth()+1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
  let now_time = date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
  messages.value.push({
    message:inputMessage.value,
    time: now_date+' '+now_time,
    owner : true
  });
  chatRequest.sendMessage(now_date+' '+now_time, target_call_sign.value, inputMessage.value).then(res=>{
    const element = document.getElementById("chat_window");
    element.scrollTop = element.scrollHeight;
  }).catch(err=>{
    MessageWarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      MessageWarnInfo.value = ""
    },1000)
  })
}

function insertMessage(message:any){
  message = JSON.parse(message);
  messages.value.push({
    message:message.message,
    time: message.time,
    owner : false
  });
  setTimeout(()=>{
    const element = document.getElementById("chat_window");
    element.scrollTop = element.scrollHeight;
  },500)
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
      <v-btn v-show="activeStatus" variant="outlined" style="width: 100%;height: 2rem; border-radius: 0.5rem;color: grey;margin-top: 0.5rem" @click="updateActiveTimeHandler">修改活跃时间</v-btn>
      <v-btn v-show="activeStatus" variant="outlined" style="width: 100%;height: 2rem; border-radius: 0.5rem;color: grey;margin-top: 0.5rem" @click="inactiveHandler">关闭</v-btn>
    </div>
    <div v-show="activeStatus" style="width: 90%;margin: auto;display: flex;flex-direction: row;justify-content: center;margin-top: 2rem">
      <v-text-field  style="width: 70%" density="compact" label="距离(公里)" variant="outlined" prepend-inner-icon="mdi-social-distance-2-meters" v-model="distance"></v-text-field>
      <v-btn variant="outlined" style="width: 25%;margin-left:5%;border-radius: 0.5rem;color: grey; height: 2.5rem" @click="getNearbyHamHandler">搜索</v-btn>
    </div>
    <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
  </div>
  <div class="Pad" style="left: 1%;top: 45%;width: 29.4%;" v-show="hamInfo.call_sign">
    <div style="width: 90%;margin:auto;margin-top:1.5rem">
      <v-text-field density="compact"  label="呼号" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="hamInfo.call_sign" readonly></v-text-field>
      <v-text-field density="compact"  label="距离(公里)" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="hamInfo.distance" readonly></v-text-field>
    </div>
    <div style="display: flex;flex-direction: column;width: 90%;margin: auto;">
      <div style="display: flex;flex-direction: row;justify-content: space-between;margin-top: 1rem;margin-bottom: 1rem;">
        <div style="width: 2rem"></div>
        <div v-for="i in 25" style="width: 3rem;height: 0.5rem;font-size: 0.8rem;text-align: right" >{{i-1}}</div>
      </div>
      <div v-for="i in 7" style="display: flex;flex-direction: row;align-items: center; height: 1rem">
        <div style="margin-right: 1rem">{{i}}</div>
        <div v-for="j in 24" style="border: 1px solid grey;width: 3rem;height: 0.5rem"  >
          <div style="height: 100%;width: 100%;background: grey;opacity: 30%" v-show="GuestTimeArray[(i-1)*24+(j-1)]"></div>
        </div>
      </div>
    </div>
    <div style="width: 90%;margin: auto;text-align: center;">
      <v-btn variant="outlined" style="width: 50%;height: 2rem; border-radius: 0.5rem;color: grey;margin-top: 0.5rem;margin-bottom: 1rem;" @click="openChatWindowHandler">沟通</v-btn>
    </div>
  </div>
  <div class="Pad" style="left: 69.6%;top: 7%;width: 29.4%;height: 92%" v-if="chat">
    <div style="width: 90%;height: 5%;font-size: 2rem;color: grey;margin: auto;display: flex;flex-direction: raw;justify-content: center;align-items: center;">
      <div>{{target_show}}</div>
      <v-avatar color="green" style="height: 1.5rem;width: 1.5rem;margin-left: 1rem" v-show="online_status"></v-avatar>
      <v-avatar color="grey" style="height: 1.5rem;width: 1.5rem;margin-left: 1rem" v-show="!online_status"></v-avatar>
    </div>
    <div style="height: 85%;overflow: scroll;overflow-x:hidden;" id="chat_window">
      <div v-for="message in messages" style="width: 96%;margin: auto;" >
        <div style="font-size: 1.1rem;background-color: rgba(125, 125, 125, 0.2);border-radius: 0.5rem;margin: 0.5rem;width: 80%">
          <div style="color: grey;margin-left: 1%">{{message.message}}</div>
          <div style="color: grey;font-size: 0.8rem;text-align: right">
            {{message.time}}
          </div>
        </div>
        <div style="font-size: 1.1rem;background-color: rgba(125, 125, 125, 0.2);border-radius: 0.5rem;margin: 0.5rem;width: 80%;margin-left: 20%">
          <div style="color: white;margin-left: 1%">{{message.message}}</div>
          <div style="color: grey;font-size: 0.8rem;text-align: right">
            {{message.time}}
          </div>
        </div>
      </div>
    </div>
    <div style="height: 8%;width: 96%;margin: auto;display: flex;flex-direction: row;margin-top: 2%">
      <v-text-field  variant="outlined" maxlength="100" counter style="width: 85%" v-model="inputMessage"></v-text-field>
        <v-btn variant="outlined" style="width: 3rem;height:3rem;color: grey;margin-left: 2%;margin-top:1%;" icon="mdi-send" @click="messageSendingHandler">
        </v-btn>
    </div>
    <div style="text-align: center;color: darkred;">{{MessageWarnInfo}}</div>
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

#chat_window {
  overflow: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
#chat_window::-webkit-scrollbar {
  display: none;
}

</style>
