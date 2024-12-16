<script setup lang="ts">
import {onMounted, ref} from "vue";
import * as userRequests from "@/networks/userRequests";

let modificationField = ref("")
let uploadAvatar = ref()
let avatarURL = ref("")
let WarnInfo = ref("")
let userAvatar = ref("")
let modifiedUserName = ref("")
let username = ref("")

const emit = defineEmits(['infoUpdate'])

onMounted(() => {
  userInfoReload()
});

function userInfoReload(){
  emit('infoUpdate')
  userRequests.getUserInfo().then((res) => {
    userAvatar.value = res.data.data.avatar;
    username.value = res.data.data.username;
  }).catch((err) => {
    console.log(err)
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
    console.log(error)
    WarnInfo.value = error.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}
</script>

<template>
  <div>
    <div id="menuBar" style="text-align: center">
      <v-avatar :image="userAvatar" style="margin-top: 1rem; width: 10rem;height: 10rem;" @click="modificationField=modificationField==='avatar'?'':'avatar'" class="hand-cursor"></v-avatar>
      <div style="font-size: 3rem;color: grey" @click="modificationField=modificationField==='username'?'':'username'" class="hand-cursor">
        {{username}}
      </div>
    </div>
    <div v-show="modificationField==='avatar'" id = "avatarUpload" style="display: flex;flex-direction: column">
      <v-file-input label="上传文件" accept="image/*" variant="outlined" style="width: 90%;margin-left: auto;margin-right: auto;margin-top: 1.5rem" v-model="uploadAvatar" @update:model-value="avatarLoadedHandler"></v-file-input>
      <v-avatar v-if=avatarURL :image=avatarURL style="width: 18rem;height: 18rem;margin: auto"></v-avatar>
      <v-btn v-show=avatarURL variant="plain" style="width: 50%; margin:auto;border: gray 1px solid;border-radius: 0.5rem;height: 3rem;margin-top: 1rem;margin-bottom: 1rem" @click="avatarUploadHandler">上传头像</v-btn>
      <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
    </div>
    <div v-show="modificationField==='username'" id = "usernameModification" style="display: flex;flex-direction: column">
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
  position: absolute;
  left: 20.6%;
  top: 7%;
  margin: 1rem;
  border-radius: 1rem;
  border: 1px solid gray;
  width: 29.4%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

#usernameModification{
  position: absolute;
  left: 20.6%;
  top: 21.5%;
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

</style>
