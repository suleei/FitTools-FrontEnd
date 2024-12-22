<script setup lang="ts">
import {onMounted, ref} from "vue";
import * as deviceRequests from "@/networks/deviceRequest";

let deviceAddEnable = ref(false)
let deviceInfo = ref({
  name: "",
  power: "",
  antenna: ""
})
let deviceList = ref([])

let defaultDeviceId = ref(null);

let WarnInfo = ref("")

onMounted(()=>{
  devicesListReload()
})

function devicesListReload(){
  deviceRequests.getDevices().then(res => {
    console.log(res)
    deviceList.value = res.data.data.devices;
    defaultDeviceId.value = res.data.data.defaultDevice
  }).catch(error => {
    WarnInfo.value = error.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function addDevice(){
  deviceRequests.addDevice(deviceInfo.value.name, deviceInfo.value.power, deviceInfo.value.antenna).then(response => {
      deviceAddEnable.value = false
      devicesListReload();
    }
  ).catch(error => {
    WarnInfo.value = error.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function deleteDeviceHandler(id: String){
  deviceRequests.deleteDevices(id).then(response => {
    devicesListReload()
  }).catch(error => {
    WarnInfo.value = error.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function setDefaultDeviceHandler(id: String){
  deviceRequests.setDefaultDevice(id).then(response => {
    devicesListReload()
  }).catch(error => {
    WarnInfo.value = error.response.data.message
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}
</script>

<template>
  <div>
    <div id="listPad" style="display:flex;flex-direction:column;align-items:center;">

      <div style="margin: 1rem 0;width:100%;display: flex;flex-direction: column;align-items: center;">
        <div style="width: 90%;color: gray;display: flex;flex-direction: row;margin: 0.2rem 0" >
          <div style="width: 37%"><text style="word-wrap: break-word;">名称</text></div>
          <div style="width: 16%;margin: 0 2%"><text>功率（w）</text></div>
          <div style="width: 37%"><text style="word-wrap: break-word;">天线</text></div>
        </div>
        <div v-for="device in deviceList" :key="device.id" style="width: 90%;color: gray;display: flex;flex-direction: row;margin: 0.2rem 0" id="selectedItem">
          <div style="width: 37%"><text style="word-wrap: break-word;">{{device.name}}</text></div>
          <div style="width: 16%;margin: 0 2%"><text>{{device.power}}</text></div>
          <div style="width: 37%"><text style="word-wrap: break-word;">{{device.antenna}}</text></div>
          <v-icon :color="device.id === defaultDeviceId?'green':'gray'" icon="mdi-check" class="selectItem" @click="setDefaultDeviceHandler(device.id)"></v-icon>
          <v-icon icon="mdi-delete-outline" class="deleteIcon" @click="deleteDeviceHandler(device.id)"></v-icon>
        </div>
      </div>
      <v-btn prepend-icon="mdi-plus" variant="outlined" class="infoItem" style="width: 50%;height: 3rem; border-radius: 1rem;color: grey;margin: 1% 0" @click="deviceAddEnable=!deviceAddEnable">
        添加设备
      </v-btn>
      <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
    </div>
    <div id="addPad" v-show="deviceAddEnable">
      <div style="display:flex;flex-direction:column;align-items:center;">
        <v-text-field label="设备" prepend-inner-icon="mdi-cellphone-basic" variant="outlined" v-model="deviceInfo.name"
                      style="margin-top: 2%;width: 90%" counter maxlength="50">
        </v-text-field>
        <v-text-field label="功率(w)" prepend-inner-icon="mdi-signal-cellular-2" variant="outlined" v-model="deviceInfo.power"
                      style="margin-top: 2%;width: 90%" counter maxlength="50">
        </v-text-field>
        <v-text-field label="天线" prepend-inner-icon="mdi-antenna" variant="outlined" v-model="deviceInfo.antenna"
                      style="margin-top: 2%;width: 90%" counter maxlength="50">
        </v-text-field>
        <v-btn prepend-icon="mdi-plus" variant="outlined" class="infoItem" style="width: 50%;height: 3rem; border-radius: 1rem;color: grey;margin: 1% 0" @click="addDevice">
          添加
        </v-btn>
        <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
      </div>
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
  width: 29.4%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

#addPad{
  position: absolute;
  left:30.4%;
  top: 7%;
  border-radius: 1rem;
  border: 1px solid gray;
  width: 29.4%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

#selectedItem:hover{
  background: rgba(0, 0, 0, 0.1);
}

.deleteIcon:hover{
  color: darkred;
}

.selectItem:hover{
  color: green;
}

</style>
