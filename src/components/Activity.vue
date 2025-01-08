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

async function api (startTime: any, id: any) {
  return new Promise(resolve => {
    activityRequest.getActivities(startTime,id).then((activities) => {
      resolve(activities.data.data);
    })
  })
}
async function load ({ done }) {
  let id = null;
  let startTime = null;
  if(items.value.length!=0){
    id = items.value[items.value.length-1].id;
    startTime = items.value[items.value.length-1].startTime;
  }
  const res = await api(startTime,id)
  items.value.push(...res)
  done('ok')
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
      map.setFitView(marks,false, [150,50,800,50]);//地图自适应
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

function thumbsUp(activity: any) {
  let activityId = activity.id;
  activityRequest.thumbsUp(activityId).then(() => {
    if(activity.thumbsed){
      activity.thumbsed = false;
      activity.thumbsCount -=1;
    }else {
      activity.thumbsed = true;
      activity.thumbsCount +=1;
    }
  }).catch((err) => {
    console.log(err);
  })
}

function sendComment(activity: any) {
  let date = new Date();
  let date_value = date.getFullYear().toString().padStart(4, '0') + '-' + (date.getMonth()+1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
  let time_value = date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
  let date_time = date_value+" "+time_value
  activityRequest.sendComment(activity.id, activity.comment, date_time, activity.reply).then((res) => {
    activity.comments.push(res.data.data);
    activity.comment = "";
    activity.commentsCount ++;
  }).catch((err) => {
    activity.warn = err.response.data.message
    setTimeout(()=>{
      activity.warn = null;
    },1000)
  })
}

function openComment(activity: any) {
  activity.comment_enable=activity.comment_enable!==true?true:false
  if(activity.comment_enable){
    activityRequest.getComments(activity.id).then((res) => {
      activity.comments = res.data.data;
    }).catch((err) => {
      activity.warn = err.response.data.message
      setTimeout(()=>{
        activity.warn = null;
      },1000)
    })
  }
}

function deleteComment(activity:any, commentId: any){
  activityRequest.deleteComment(commentId).then((res) => {
    activity.comments = activity.comments.filter((comment) => comment.id !== commentId);
    activity.commentsCount --;
  }).catch((err) => {
    activity.warn = err.response.data.message
    setTimeout(()=>{
      activity.warn = null;
    },1000);
  })
}

function replyComment(activity:any, commenterCallSign: string){
  activity.reply = commenterCallSign;
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
            <div style="display: flex;align-items: center;">
              <div style="display: flex; flex-direction: row;align-items: center">
                <v-btn icon="mdi-thumb-up-outline" variant="text" @click="thumbsUp(activity)" v-show="!activity.thumbsed"></v-btn>
                <v-btn icon="mdi-thumb-up" variant="text" @click="thumbsUp(activity)" v-show="activity.thumbsed"></v-btn>
                <div style="color: grey;font-size: 1.4rem">{{activity.thumbsCount}}</div>
              </div>
              <div style="display: flex; flex-direction: row;align-items: center">
                <v-btn icon="mdi-comment-outline" variant="text" @click="openComment(activity)"></v-btn>
                <div style="color: grey;font-size: 1.4rem">{{activity.commentsCount}}</div>
              </div>
            </div>
            <div v-show="activity.comment_enable" style="width: 90%;margin: auto">
              <div style="height: 25.5rem;overflow: scroll">
                <div v-for="comment in activity.comments" style="color: grey;">
                  <div>
                    <div style="display: flex;align-items: center;">
                      <div style="width:6%;">
                        <v-avatar :image="comment.commenterAvatar" style="border: 1px grey solid;height: 2rem;width: 2rem"></v-avatar>
                      </div>
                      <div style="width:20%;font-size:1.2rem;margin-left: 2%">
                        {{comment.commenterCallSign}}
                      </div>
                      <div style="width: 40%;font-size:1.2rem;">
                        {{comment.time}}
                      </div>
                      <div style="width:38%;cursor: pointer" @click="replyComment(activity,comment.commenterCallSign)">
                        回复
                      </div>
                      <div style="width: 4%;">
                        <v-icon icon="mdi-close" v-show="comment.deletable" @click="deleteComment(activity,comment.id)"></v-icon>
                      </div>
                    </div>
                    <div style="margin-left: 7%;font-size:1.2rem;">
                      <v-text v-show="comment.replyCallSign">回复 @{{comment.replyCallSign}}:</v-text>
                      {{comment.comment}}
                    </div>
                  </div>
                </div>
              </div>
              <v-text-field
                label="评论"
                variant="outlined"
                density="compact"
                hide-details
                maxlength="100" counter
                v-model="activity.comment"
                append-inner-icon="mdi-send-outline"
                @click:append-inner="sendComment(activity)">
                <template v-slot:prepend-inner>
                  <v-chip
                    v-if="activity.reply"
                    class="ma-2"
                    closable
                    @click:close="activity.reply = null"
                  >回复 @{{activity.reply}}:</v-chip>
                </template>
              </v-text-field>
              <div style="color: darkred">
                {{activity.warn}}
              </div>
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
