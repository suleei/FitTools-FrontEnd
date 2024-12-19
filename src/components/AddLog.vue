<script setup lang="ts">

import {onMounted, onUnmounted, ref} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import * as events from "node:events";

const {map,districtFind} = defineProps(['map','districtFind']);
onMounted(() => {
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
})

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
      map.setFitView(polygons, false, [70,0,600,0]);//地图自适应
    }
  }).catch((e) => {
    console.log(e);
  });
}

var polygons = [];
//行政区划查询
let provinceSelect = ref([]);
let citySelect = ref([]);
let districtSelect = ref([]);
let areaSelect = ref([]);

let province = ref(null);
let city = ref(null);
let district = ref(null);
let area = ref(null);

function getData(data) {
  console.log(data)
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
  polygons = [];
  districtFind.setExtensions('all');
  districtFind.search(code, function (status, result) {
    if (status === 'complete') {
      getData(result.districtList[0]);
    }
  });
}
function searchA() {
  console.log(areaSelect.value);
  for (var i = 0, l = areaSelect.value.length; i < l; i++) {
    if(areaSelect.value[i].name === area.value) {
      map.setCenter(areaSelect.value[i].center);
      break;
    }
  }
}
</script>

<template>
  <div>
    <div id="table" style="text-align: center;">
      <v-select
        label="省/直辖市/自治区"
        :items="provinceSelect"
        item-title="name"
        item-value="adcode"
        variant="outlined"
        v-model="province"
        @update:model-value="searchP"
      >
      </v-select>
      <v-select
        label="市"
        :items="citySelect"
        item-title="name"
        item-value="adcode"
        variant="outlined"
        v-model="city"
        @update:model-value="searchC"
      ></v-select>
      <v-select
        label="区/县"
        :items="districtSelect"
        item-title="name"
        item-value="adcode"
        variant="outlined"
        v-model="district"
        @update:model-value="searchD"
      ></v-select>
      <v-select
        label="乡/镇"
        :items="areaSelect"
        item-title="name"
        item-value="name"
        variant="outlined"
        v-model="area"
        @update:model-value="searchA"
      ></v-select>
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
  width: 29.4%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

</style>
