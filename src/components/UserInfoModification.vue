<script setup lang="ts">
import {onMounted, ref} from "vue";
import * as userRequests from "@/networks/userRequests";
import * as captchaRequest from "@/networks/captchaRequest";
const {geocoder, lnglat, autoComplete, map, marker} = defineProps(['geocoder','lnglat', 'autoComplete', 'map', 'marker']);
let modificationField = ref("")
let uploadAvatar = ref()
let avatarURL = ref("")
let WarnInfo = ref("")
let WarnInfoN = ref("")
let userAvatar = ref("")
let modifiedUserName = ref("")
let username = ref("")
let captchaBtnEnable = ref(true)
let captchaBtnEnableN = ref(true)
let captchaLineShow = ref(false)
let email = ref("")
let location = ref("")
let detailLocation = ref({
  district: null,
  address: null,
  name: null,
  location: [null,null]
})
let address = ref({
  district: null,
  address: null,
  name: null,
  location: [null,null]
})
let timer = null
let hintList = ref(null)
let captchaImg = ref({
  data: "",
  hashCode: ""
})
let captchaObj = ref({
  usercode: "",
  emailcode: "",
  buttonInfo: "发送验证码",
  jwt: ""
})

let captchaLineShowN = ref(true)
let captchaImgN = ref({
  data: "",
  hashCode: ""
})
let captchaObjN = ref({
  email: "",
  usercode: "",
  emailcode: "",
  buttonInfo: "发送验证码",
})

const emit = defineEmits(['infoUpdate'])

onMounted(() => {
  userInfoReload()
  captchaImgLoad()
});

function captchaImgLoad(){
  captchaRequest.getCaptcha().then((res)=>{
    captchaImg.value.data = res.data.data.base64Img;
    captchaImg.value.hashCode = res.data.data.hashCode;
  }).catch((err)=>{
    console.log(err)
  })
}

function captchaImgLoadN(){
  captchaRequest.getCaptcha().then((res)=>{
    captchaImgN.value.data = res.data.data.base64Img;
    captchaImgN.value.hashCode = res.data.data.hashCode;
  }).catch((err)=>{
    console.log(err)
  })
}

function userInfoReload(){
  emit('infoUpdate')
  userRequests.getUserInfo().then((res) => {
    userAvatar.value = res.data.data.avatar;
    username.value = res.data.data.username;
    email.value = res.data.data.email;
  }).catch((err) => {
    console.log(err)
  })
  userRequests.getAddress().then((res) => {
    address.value = res.data.data;
  })
}

function avatarLoadedHandler(event: Event) {
  const file = uploadAvatar.value
  if(file === null){
    avatarURL.value = ""
  }else{
    if(file && file.type.startsWith("image/")){
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        if(event.target != null){
          avatarURL.value = event.target.result;
        }
      }
      reader.readAsDataURL(file);
    }else{
      WarnInfo.value = "上传文件格式必须为图片"
      setTimeout(()=>{
        WarnInfo.value = ""
      },1000)
    }
  }
}

function avatarUploadHandler(){
  userRequests.uploadAvatar(uploadAvatar.value).then(response => {
    userInfoReload()
  }).catch(error => {
    WarnInfo.value = error.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function usernameModificationHandler(){
  userRequests.updateUsername(modifiedUserName.value).then(response => {
    sessionStorage.setItem("jwt",response.data.data);
    userInfoReload()
  }).catch(error => {
    WarnInfo.value = error.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function emailCaptchaSendingHandler(){
  userRequests.sendEmailCaptcha(captchaImg.value.hashCode,captchaObj.value.usercode).then((response) => {
    captchaBtnEnable.value = false
    let counter = 6;
    captchaObj.value.buttonInfo = counter + 's';
    let countDowner = setInterval(()=>{
      counter--;
      captchaObj.value.buttonInfo = counter + 's';
      if(counter===0) {
        captchaObj.value.buttonInfo= "发送验证码";
        captchaBtnEnable.value = true;
        clearInterval(countDowner)
      }
    },1000)
    captchaLineShow.value = true
  }).catch(error => {
    WarnInfo.value = error.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function emailCaptchaSendingHandlerN(){
  userRequests.sendEmailCaptchaNew(captchaObjN.value.email,captchaImgN.value.hashCode,captchaObjN.value.usercode).then((response) => {
    captchaBtnEnableN.value = false
    let counter = 6;
    captchaObjN.value.buttonInfo = counter + 's';
    let countDowner = setInterval(()=>{
      counter--;
      captchaObjN.value.buttonInfo = counter + 's';
      if(counter===0) {
        captchaObjN.value.buttonInfo= "发送验证码";
        captchaBtnEnableN.value = true;
        clearInterval(countDowner)
      }
    },1000)
    captchaLineShowN.value = true
  }).catch(error => {
    WarnInfoN.value = error.response.data.message;
    setTimeout(()=>{
      WarnInfoN.value = ""
    },1000)
  })
}

function emailVerifyHandler(){
  userRequests.verifyEmail(captchaObj.value.emailcode).then((response) => {
    captchaObj.value.jwt = response.data.data;
    captchaImgLoadN();
  }).catch(error => {
    WarnInfo.value = error.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function emailModificationHandler(){
  userRequests.modifyEmail(captchaObj.value.jwt, captchaObjN.value.email,captchaObjN.value.emailcode).then((response) => {
    userInfoReload();
  }).catch(error => {
    WarnInfoN.value = error.response.data.message;
    setTimeout(()=>{
      WarnInfoN.value = ""
    },1000)
  })
}

function inputLocationChangeHandler(){
  autoComplete.search(location.value, (status, result) => {
    hintList.value = result.tips
    console.log(hintList.value)
  })
  /*let hint = {
    "id": "B0JRH7NL6S",
    "name": "国家网络安全人才与创新基地网络安全学院(东2门)",
    "district": "湖北省武汉市东西湖区",
    "adcode": "420112",
    "location": [
      114.138579,
      30.672819
    ],
    "address": "临空港大道与径河路交叉口西160米",
    "typecode": "991400",
    "city": []
  }
  itemSelectHandler(hint)*/
}

function itemSelectHandler(hint: any) {
  detailLocation.value.name = hint.name;
  detailLocation.value.district = hint.district;
  detailLocation.value.address = hint.address;
  detailLocation.value.location = [hint.location.lng, hint.location.lat];
  hintList.value = null;
  marker.setPosition(detailLocation.value.location);
  marker.setMap(map);
  map.setZoom(15);
  map.panTo([detailLocation.value.location[0]-0.02,detailLocation.value.location[1]]);
}

function updateAddressHandler(){
  userRequests.updateAddress(detailLocation.value).then((response) => {
    userInfoReload()
    setTimeout(()=>{
      marker.setMap(null)
    },10000)
  }).catch((error) => {
    WarnInfo.value = error.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

/*function getLocation(){
  geocoder.getAddress(lnglat,function(status, result) {
    console.log(status, result);
    if (status === 'complete'&&result.regeocode) {
      var address = result.regeocode.formattedAddress;
      console.log(address);
    }else{
      console.error('根据经纬度查询地址失败')
    }
  })
  autoComplete.search("124", (status, result) => {
    console.log(status, result);
  })
}*/
</script>

<template>
  <div>
    <div id="menuBar" style="text-align: center">
      <v-avatar :image="userAvatar" style="margin-top: 1rem; width: 10rem;height: 10rem;" @click="modificationField=modificationField==='avatar'?'':'avatar'" class="hand-cursor"></v-avatar>
      <div style="font-size: 3rem;color: grey" @click="modificationField=modificationField==='username'?'':'username'" class="hand-cursor">
        {{username}}
      </div>
      <div style="margin-top: 1rem;" @click="modificationField=modificationField==='email'?'':'email'" class="hand-cursor">
        <div style="font-size: 1rem;color: grey">邮箱</div>
        <div style="font-size: 2rem;color: grey">{{email}}</div>
      </div>
      <div style="margin-top: 1rem;" @click="modificationField=modificationField==='address'?'':'address'" class="hand-cursor">
<!--        <div style="font-size: 1rem;color: grey">通联地址</div>-->
        <div >
          <div >
            <div><text style="color: gray">政区</text></div>
            <div><text style="color: gray;font-size: 2rem">{{address.district}}</text></div>
          </div>
          <div >
            <div><text style="color: gray">地址</text></div>
            <div><text style="color: gray;font-size: 2rem">{{address.address}}</text></div>
          </div>
          <div>
            <div><text style="color: gray">地点</text></div>
            <div><text style="color: gray;font-size: 2rem">{{address.name}}</text></div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="modificationField==='avatar'" id = "avatarUpload" class="Pad" style="display: flex;flex-direction: column">
      <v-file-input label="上传文件" accept="image/*" variant="outlined" style="width: 90%;margin-left: auto;margin-right: auto;margin-top: 1.5rem" v-model="uploadAvatar" @update:model-value="avatarLoadedHandler"></v-file-input>
      <v-avatar v-if=avatarURL :image=avatarURL style="width: 18rem;height: 18rem;margin: auto"></v-avatar>
      <v-btn v-show=avatarURL variant="plain" style="width: 50%; margin:auto;border: gray 1px solid;border-radius: 0.5rem;height: 3rem;margin-top: 1rem;margin-bottom: 1rem" @click="avatarUploadHandler">上传头像</v-btn>
      <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
    </div>
    <div v-show="modificationField==='username'" id = "usernameModification" class="Pad" style="display: flex;flex-direction: column">
      <v-text-field
        style="width: 80%; margin: auto; margin-top: 2rem"
        label="用户名"
        variant="outlined"
        prepend-inner-icon="mdi-account-outline"
        v-model="modifiedUserName"
        counter maxlength="20"/>
      <v-btn  v-show="modifiedUserName" variant="plain" style="width: 50%; margin:auto;border: gray 1px solid;border-radius: 0.5rem;height: 3rem;margin-top: 1rem;margin-bottom: 1rem" @click="usernameModificationHandler">更改用户名</v-btn>
      <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
    </div>
    <div v-show="modificationField==='email'" id = "emailModification"  class="Pad" style="display: flex;flex-direction: column">
      <div style="margin: auto;margin-top: 1rem;margin-bottom: 1rem;text-align: center;">
        <div style="font-size: 1rem;color: grey">当前邮箱</div>
        <div style="font-size: 2rem;color: grey">{{email}}</div>
      </div>
      <div style="width: 90%;display: flex;margin:auto;">
        <v-img
          style="margin-top: 0.5%;margin-right: 2%"
          width="120"
          height="50"
          @click=captchaImgLoad
          :src="`data:image/png;base64,${captchaImg.data}`"/>
        <v-text-field
          label=""
          variant="outlined"
          id="captchaObj"
          style="width: 68%;"
          prepend-inner-icon="mdi-alphabetical-variant"
          v-model="captchaObj.usercode"
        >
        </v-text-field>
        <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%" @click="emailCaptchaSendingHandler" :disabled="!captchaBtnEnable">
          {{captchaObj.buttonInfo}}
        </v-btn>
      </div>
      <div style="width: 90%;display: flex;margin:auto;" v-show="captchaLineShow">
        <v-text-field
          label="邮箱验证码"
          variant="outlined"
          id="captchaObj"
          style="width: 68%;"
          prepend-inner-icon="mdi-alphabetical-variant"
          v-model="captchaObj.emailcode"
        ></v-text-field>
        <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%" @click="emailVerifyHandler">验证邮箱</v-btn>
      </div>
      <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
    </div>
    <div id="newEmail" class="Pad" v-show="modificationField==='email'&& captchaObj.jwt">
      <div style="margin: auto;margin-top: 1rem;display: flex;flex-direction: column;align-items: center;">
        <div style="font-size: 1rem;color: grey">新邮箱</div>
        <v-text-field
          label=""
          variant="outlined"
          id="captchaObj"
          style="width: 90%;margin-top: 1rem;"
          prepend-inner-icon="mdi-alphabetical-variant"
          v-model="captchaObjN.email"
          counter maxlength="30"
        ></v-text-field>
      </div>
      <div style="width: 90%;display: flex;margin:auto;">
        <v-img
          style="margin-right: 2%"
          width="120"
          height="50"
          @click=captchaImgLoadN
          :src="`data:image/png;base64,${captchaImgN.data}`"/>
        <v-text-field
          label=""
          variant="outlined"
          id="captchaObj"
          style="width: 68%;"
          prepend-inner-icon="mdi-alphabetical-variant"
          v-model="captchaObjN.usercode"
        ></v-text-field>
        <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%" @click="emailCaptchaSendingHandlerN" :disabled="!captchaBtnEnableN">
          {{captchaObjN.buttonInfo}}
        </v-btn>
      </div>
      <div style="width: 90%;display: flex;margin:auto;" v-show="captchaLineShowN">
        <v-text-field
          label="邮箱验证码"
          variant="outlined"
          id="captchaObj"
          style="width: 68%;"
          prepend-inner-icon="mdi-alphabetical-variant"
          v-model="captchaObjN.emailcode"
        ></v-text-field>
        <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%" @click="emailModificationHandler">修改邮箱</v-btn>
      </div>
      <div style="text-align: center;color: darkred;">{{WarnInfoN}}</div>
    </div>
    <div id="address" class="Pad" v-show="modificationField==='address'">
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
    <div class="Pad" style="width:auto;left: 50.6%;top: 41.5%" v-show="modificationField==='address' && hintList">
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
#menuBar{
  position: absolute;
  left: 1%;
  top: 7%;
  border-radius: 1rem;
  border: 1px solid gray;
  height: 92%;
  width: 19.6%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

#avatarUpload{
  left: 20.6%;
  top: 7%;
}

#usernameModification{
  left: 20.6%;
  top: 21.5%;
}

#emailModification{
  left: 20.6%;
  top: 31.5%;
}

#newEmail{
  left: 50.6%;
  top: 31.5%;
}

#address{
  left: 20.6%;
  top: 41.5%
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

.hand-cursor{
  cursor: pointer;
}

#selectedItem:hover{
  background: rgba(0, 0, 0, 0.1);
}

</style>
