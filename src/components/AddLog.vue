<script setup lang="ts">

import {onMounted, onUnmounted, ref} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import * as userRequests from "@/networks/userRequests";
import * as deviceRequests from "@/networks/deviceRequest";
import * as communicationLogRequest from "@/networks/communicationLogRequest";
const {map,districtFind,marker,autoComplete,weather, geocoder} = defineProps(['map','districtFind', 'marker', 'autoComplete', 'weather', 'geocoder']);

var polygons = [];
//行政区划查询
let provinceSelect = ref([]);
let citySelect = ref([]);
let districtSelect = ref([]);
let areaSelect = ref([]);
let location = ref("")
let detailLocation = ref({
  district: null,
  address: null,
  name: null,
  location: [null,null]
})
let hintList = ref(null)
let WarnInfo = ref("")
let province = ref(null);
let city = ref(null);
let district = ref(null);
let area = ref(null);
let locationModificationEnabled = ref(false);
let line = ref(
  {
    end_lng:null,
    end_lat:null
  }
)
let form = ref({
  start_date : null,
  start_time : null,
  end_date : null,
  end_time : null,
  frequency: null,
  mode: null,
  source_call_sign: null,
  source_device_name:null,
  source_antenna: null,
  target_call_sign: null,
  target_device_name:null,
  target_antenna: null,
  source_power: null,
  target_power: null,
  source_district: null,
  source_address: null,
  source_location: null,
  source_longitude: null,
  source_latitude: null,
  source_address_des: null,
  weather: null,
  source_signal_report:null,
  target_signal_report:null,
  comments: null,
  target_province: '',
  target_city: '',
  target_district: '',
  target_area: '',
  target_lng: null,
  target_lat: null,
})
onMounted(() => {
  getUserInfo()
  districtFind.search('中国', function (status, result) {
    if (status == 'complete') {
      getData(result.districtList[0]);
    }
  });
});

onUnmounted(()=>{
  for (var i = 0, l = polygons.length; i < l; i++) {
    polygons[i].setMap(null);
  }
  polygons = [];
  marker.setMap(null);
})

function getUserInfo(){
  userRequests.getUserInfo().then(res=>{
    form.value.source_call_sign = res.data.data.call_sign;
  }).catch(error=>{
    console.log(error);
  })
  deviceRequests.getDefaultDevice().then(res=>{
    form.value.source_device_name = res.data.data.name;
    form.value.source_antenna = res.data.data.antenna;
    form.value.source_power = res.data.data.power;
  }).catch(err=>{
    console.log(err);
  })
  userRequests.getAddress().then(res=>{
    form.value.source_district = res.data.data.district;
    form.value.source_address =res.data.data.address;
    form.value.source_location = res.data.data.name;
    form.value.source_longitude = res.data.data.longitude;
    form.value.source_latitude = res.data.data.latitude;
    form.value.source_address_des = form.value.source_district + form.value.source_address + form.value.source_location;
    weatherReload();
  })
}

function getPolygon(bounds){
  AMapLoader.load({
    key: "8a728012124faeb45f08ce08205a9358\t", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Polygon"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  }).then((AMap) => {
    if (bounds) {
      for (var i = 0, l = bounds.length; i < l; i++) {
        let polygon = new AMap.Polygon({
          map: map,
          strokeWeight: 1,
          strokeColor: '#0091ea',
          fillColor: '#80d8ff',
          fillOpacity: 0.2,
          path: bounds[i],
        })
        polygons.push(polygon);
      }
      map.setFitView(polygons, false, [70,0,960,0]);//地图自适应
    }
  }).catch((e) => {
    console.log(e);
  });
}

function getData(data) {
  line.value.end_lng = data.center.lng;
  line.value.end_lat = data.center.lat;
  form.value.target_lng = data.center.lng;
  form.value.target_lat = data.center.lat;
  let subList = data.districtList;
  let level = data.level;
  if (subList) {
    if (level === 'country') {
      provinceSelect.value = subList;
    } else if (level === 'province') {
      citySelect.value = subList;
      city.value = null;
      districtSelect.value = [];
      district.value = null;
      areaSelect.value = [];
      area.value = null;
    } else if (level === 'city') {
      districtSelect.value = subList;
      district.value = null;
      areaSelect.value = [];
      area.value = null;
    } else if( level === 'district') {
      areaSelect.value = subList;
      area.value = null;
    }
  }
  if(level !== 'country') {
    var bounds = data.boundaries;
    getPolygon(bounds);
  }
}
function searchP(){
  districtFind.setLevel("province");
  search(province.value);
}
function searchC(){
  districtFind.setLevel("city");
  search(city.value)
}
function searchD(){
  districtFind.setLevel("district");
  search(district.value)
}

function search(code) {
  //清除地图上所有覆盖物
  for (var i = 0, l = polygons.length; i < l; i++) {
    polygons[i].setMap(null);
  }
  marker.setMap(null);
  polygons = [];
  districtFind.setExtensions('all');
  districtFind.search(code, function (status, result) {
    if (status === 'complete') {
      if(result.districtList[0].level === 'province') {
        form.value.target_province = result.districtList[0].name;
        form.value.target_city = '';
        form.value.target_district = '';
        form.value.target_area = '';
      }else if(result.districtList[0].level === 'city') {
        form.value.target_city = result.districtList[0].name;
        form.value.target_district = '';
        form.value.target_area = '';
      }else if(result.districtList[0].level === 'district') {
        form.value.target_district = result.districtList[0].name;
        form.value.target_area = '';
      }else if(result.districtList[0].level === 'area') {
        form.value.target_area = result.districtList[0].name;
      }
      getData(result.districtList[0]);
    }
  });
}
function searchA() {
  for (var i = 0, l = areaSelect.value.length; i < l; i++) {
    if(areaSelect.value[i].name === area.value) {
      marker.setPosition(areaSelect.value[i].center);
      marker.setMap(map);
      map.setFitView(marker, false, [50,0,1000,0]);
      line.value.end_lng = areaSelect.value[i].center.lng;
      line.value.end_lat = areaSelect.value[i].center.lat;
      break;
    }
  }
}

function startTimeUpdateHandler(){
  let date = new Date();
  form.value.start_date = date.getFullYear().toString().padStart(4, '0') + '-' + date.getMonth().toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
  form.value.start_time = date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
}

function endTimeUpdateHandler(){
  let date = new Date();
  form.value.end_date = date.getFullYear().toString().padStart(2, '0') + '-' + date.getMonth().toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
  form.value.end_time = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
}

function inputLocationChangeHandler(){
  autoComplete.search(location.value, (status, result) => {
    hintList.value = result.tips
  })
}

function itemSelectHandler(hint: any) {
  detailLocation.value.name = hint.name;
  detailLocation.value.district = hint.district;
  detailLocation.value.address = hint.address;
  detailLocation.value.location = [hint.location.lng, hint.location.lat];
  hintList.value = null;
  marker.setPosition(detailLocation.value.location);
  marker.setMap(map);
  map.setFitView(marker, false, [510,0,1100,0]);//地图自适应
}

function updateAddressHandler(){
  marker.setMap(null)
  form.value.source_district = detailLocation.value.district;
  form.value.source_address = detailLocation.value.address;
  form.value.source_location = detailLocation.value.name;
  form.value.source_longitude = detailLocation.value.location[0];
  form.value.source_latitude = detailLocation.value.location[1];
  form.value.source_address_des = form.value.source_district + form.value.source_address + form.value.source_location;
  weatherReload();
  locationModificationEnabled.value = false
}

function weatherReload(){
  geocoder.getAddress([form.value.source_longitude, form.value.source_latitude], (status, result) => {
    weather.getLive(result.regeocode.addressComponent.adcode, (s, re) => {
      form.value.weather = "天气："+ re.weather +" 温度："+re.temperature+"℃ 湿度："+re.humidity + "% 风向：" + re.windDirection + " 风力："+ re.windPower
    })
  })
}

function logStoreHandler(){
  if(form.value.start_date===null){
    WarnInfo.value = "必须指定开始时间"
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    return;
  }
  if(form.value.end_date===null){
    WarnInfo.value = "必须指定结束时间"
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    return;
  }
  communicationLogRequest.addCommunicationLog(form.value).then(res=>{
    WarnInfo.value = "保存成功！"
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
    AMapLoader.load({
      key: "8a728012124faeb45f08ce08205a9358\t", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ["AMap.Polyline", "AMap.LngLat"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
    })
      .then((AMap) => {
        let startPoint = new AMap.LngLat(form.value.source_longitude,form.value.source_latitude);
        let endPoint = new AMap.LngLat(line.value.end_lng, line.value.end_lat);
        let Line = new AMap.Polyline({
          path: [startPoint, endPoint],
          strokeWeight: 2, //线条宽度
          strokeColor: "#33CCFF", //线条颜色
        })
        marker.setPosition([form.value.source_longitude, form.value.source_latitude]);
        map.add(Line);
        Line.show();
        marker.setMap(map);
        polygons.push(marker);
        polygons.push(Line);
        map.setFitView(polygons,false, [100,50,1000,50]);//地图自适应
      }).catch((err) => {
      console.log(err);
    })
  }).catch(err=>{
    WarnInfo.value = err.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function clearHandler(){
    form.value.start_date=null
    form.value.start_time = null
    form.value.end_date = null
    form.value.end_time =null
    form.value.target_call_sign=null
    form.value.target_device_name=null
    form.value.target_antenna=null
    form.value.target_power=null
    form.value.target_signal_report=null
    form.value.comments=null
    form.value.target_province=''
    form.value.target_city=''
    form.value.target_district=''
    form.value.target_area=''
    form.value.target_lng=null
    form.value.target_lat=null
    province.value = null;
    city.value = null;
    district.value = null;
    area.value = null;
  for (var i = 0, l = polygons.length; i < l; i++) {
    polygons[i].setMap(null);
  }
  polygons = [];
  marker.setMap(null);
}
</script>

<template>
  <div>
    <div id="table">
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;margin-top: 2rem">
        <v-text-field  label="己方呼号" variant="outlined" prepend-inner-icon="mdi-alphabetical-variant" v-model="form.source_call_sign" counter maxlength="10" disabled></v-text-field>
        <v-text-field   style="margin-left: 2%" label="己方设备(RIG)" variant="outlined" prepend-inner-icon="mdi-cellphone-basic" v-model="form.source_device_name" counter maxlength="50"></v-text-field>
        <v-text-field   style="margin-left: 2%" label="己方天线(ANT)" variant="outlined" prepend-inner-icon="mdi-antenna" v-model="form.source_antenna" counter maxlength="50"></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field   label="己方功率(PWR)" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="form.source_power" counter maxlength="10"></v-text-field>
        <v-text-field   style="margin-left: 2%" label="频率(MHz)" variant="outlined" prepend-inner-icon="mdi-sine-wave" v-model="form.frequency" counter maxlength="10"></v-text-field>
        <v-text-field  style="margin-left: 2%" label="模式(MODE)" variant="outlined" prepend-inner-icon="mdi-menu" v-model="form.mode" counter maxlength="10"></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field   label="己方地址" variant="outlined" prepend-inner-icon="mdi-map-marker" disabled v-model="form.source_address_des" counter maxlength="100"></v-text-field>
        <v-btn variant="outlined" style="width: 2%;height: 3.5rem;color: grey;margin-left: 2%" @click="locationModificationEnabled=!locationModificationEnabled">修改</v-btn>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field   label="天气" variant="outlined" prepend-inner-icon="mdi-weather-cloudy" v-model="form.weather" counter maxlength="100"></v-text-field>
      </div>
      <v-divider style="margin: 1rem 1rem"></v-divider>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;margin-top: 2rem">
        <v-text-field  label="开始日期(UTC+8)" variant="outlined" prepend-inner-icon="mdi-calendar-range" v-model="form.start_date" counter maxlength="10"></v-text-field>
        <v-text-field  style="margin-left: 2%" label="开始时间(UTC+8)" variant="outlined" prepend-inner-icon="mdi-clock-time-eight-outline" v-model="form.start_time" counter maxlength="8"></v-text-field>
        <v-btn variant="outlined" style="width: 2%;height: 3.5rem;color: grey;margin-left: 2%" @click="startTimeUpdateHandler">获取时间</v-btn>
        <v-text-field  style="margin-left: 2%" label="结束日期(UTC+8)" variant="outlined" prepend-inner-icon="mdi-calendar-range" v-model="form.end_date" counter maxlength="10"></v-text-field>
        <v-text-field  style="margin-left: 2%" label="结束时间(UTC+8)" variant="outlined" prepend-inner-icon="mdi-clock-time-eight-outline" v-model="form.end_time" counter maxlength="8"></v-text-field>
        <v-btn variant="outlined" style="width: 2%;height: 3.5rem;color: grey;margin-left: 2%" @click="endTimeUpdateHandler">获取时间</v-btn>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field  label="对方呼号" variant="outlined" prepend-inner-icon="mdi-alphabetical-variant" v-model="form.target_call_sign" counter maxlength="10"></v-text-field>
        <v-text-field   style="margin-left: 2%" label="对方设备(RIG)" variant="outlined" prepend-inner-icon="mdi-cellphone-basic" v-model="form.target_device_name" counter maxlength="50"></v-text-field>
        <v-text-field   style="margin-left: 2%" label="对方天线(ANT)" variant="outlined" prepend-inner-icon="mdi-antenna" v-model="form.target_antenna" counter maxlength="50"></v-text-field>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field   label="对方功率(PWR)" variant="outlined" prepend-inner-icon="mdi-signal-cellular-2" v-model="form.target_power" counter maxlength="10"></v-text-field>
        <v-text-field   style="margin-left: 2%" label="己方信号报告(RST)" variant="outlined" prepend-inner-icon="mdi-chart-line" v-model="form.source_signal_report" counter maxlength="3"></v-text-field>
        <v-text-field  style="margin-left: 2%" label="对方信号报告(RST)" variant="outlined" prepend-inner-icon="mdi-chart-line" v-model="form.target_signal_report" counter maxlength="3"></v-text-field>
      </div>
      <div style="width: 90%;margin:auto;display: flex;justify-content: center;">
        <div style="width: 23%">
          <v-select  label="省/直辖市/自治区" :items="provinceSelect" item-title="name" item-value="adcode" variant="outlined" v-model="province" @update:model-value="searchP" ></v-select>
        </div>
        <div style="width: 23%;margin-left: 2.6%">
        <v-select label="市" :items="citySelect" item-title="name" item-value="adcode" variant="outlined" v-model="city" @update:model-value="searchC"></v-select>
        </div>
        <div style="width: 23%;margin-left: 2.6%">
          <v-select  label="区/县" :items="districtSelect" item-title="name" item-value="adcode" variant="outlined" v-model="district" @update:model-value="searchD"></v-select>
        </div>
        <div style="width: 23%;;margin-left: 2.6%">
          <v-select  label="乡/镇" :items="areaSelect" item-title="name" item-value="name" variant="outlined" v-model="area" @update:model-value="searchA"></v-select>
        </div>
      </div>
      <div style="width: 90%;display: flex;justify-content: center;margin: auto;">
        <v-text-field   label="备注" variant="outlined" prepend-inner-icon="mdi-account-outline" v-model="form.comments" counter maxlength="200"></v-text-field>
      </div>
      <div style="width: 90%;margin:auto;display: flex;justify-content: center;">
        <v-btn variant="outlined" style="width: 50%;height: 3.5rem;color: grey;margin-left: 25%" @click="logStoreHandler">保存日志</v-btn>
        <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 5%" @click="clearHandler">下一条</v-btn>
      </div>
      <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
    </div>

    <div id="locationModification" v-show="locationModificationEnabled">
      <div style="width: 90%;display: flex;margin:auto;margin-top:2rem;">
        <v-text-field
          label="通联地址"
          variant="outlined"
          style="width: 68%;"
          prepend-inner-icon="mdi-alphabetical-variant"
          v-model="location"
        ></v-text-field>
        <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%" @click="inputLocationChangeHandler">搜索地址</v-btn>
      </div>
      <div v-show="detailLocation.district" style="margin:auto;width:90%;">
        <div><text style="color: gray">政区</text></div>
        <div><text style="color: gray;font-size: 2rem">{{detailLocation.district}}</text></div>
      </div>
      <div v-show="detailLocation.address" style="margin:auto;width:90%;">
        <div><text style="color: gray">地址</text></div>
        <div><text style="color: gray;font-size: 2rem">{{detailLocation.address}}</text></div>
      </div>
      <div v-show="detailLocation.name" style="margin:auto;width:90%;">
        <div><text style="color: gray">地点</text></div>
        <div><text style="color: gray;font-size: 2rem">{{detailLocation.name}}</text></div>
      </div>
      <div style="margin:auto;width:90%;text-align:center;" v-show="detailLocation.address">
        <v-btn variant="outlined" style="width: 50%;height: 3.5rem;color: grey;margin: 1rem 1rem" @click="updateAddressHandler">修改地址</v-btn>
      </div>
      <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
    </div>
    <div class="Pad" style="width:auto;left: 80.4%;top: 6%" v-show="locationModificationEnabled && hintList">
      <v-list style="  background: rgba(255, 255, 255, .1); -webkit-backdrop-filter: blur(10px);backdrop-filter: blur(10px);">
        <v-list-item
          v-for="(hint,index) in hintList"
          :key="index"
          :title="hint.name"
          :subtitle="hint.district"
          class="hand-cursor"
          @click="itemSelectHandler(hint)"
          id = "selectedItem"
        >
        </v-list-item>
      </v-list>
    </div>
  </div>

</template>

<style scoped>
#table{
  position: absolute;
  left: 1%;
  top: 7%;
  border-radius: 1rem;
  border: 1px solid gray;
  height: 92%;
  width: 49%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.hand-cursor{
  cursor: pointer;
}

#locationModification{
  left: 50%;
  top: 6%;
  position: absolute;
  margin: 1rem;
  border-radius: 1rem;
  border: 1px solid gray;
  width: 29.4%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.Pad{
  position: absolute;
  margin: 1rem;
  border-radius: 1rem;
  border: 1px solid gray;
  width: 29.4%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

</style>
