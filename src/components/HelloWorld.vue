<template>
  <div id="container">
  </div>
  <div id="form-platform" style="overflow: hidden;display: flex;align-items: center">
    <div style="width: 100%">
      <div style="text-align: center;font-size: 1.5rem;color: grey;">OPEN FIT TOOLS</div>
      <v-divider style="margin-top: 5%"></v-divider>
      <v-btn variant="text" style="color: grey" rounded="0" @click="passwordLoginButtonClickHandler">
        密码登录
      </v-btn>
      <v-btn variant="text" style="color: grey" rounded="0" @click="messageLoginButtonClickHandler">
        短信登录
      </v-btn>
      <v-divider></v-divider>
      <div style="height: 100%" v-show="loginDisplay">
        <div style="margin-top: 5%;height: 50%">
          <v-text-field label="用户名" variant="outlined" id="username-input"></v-text-field>
          <v-text-field label="密码" variant="outlined" id="password-input"></v-text-field>
          <v-btn variant="text" style="color: grey;float: right" @click="registerButtonClickHandler">注册</v-btn>
          <v-btn variant="outlined" id="login-button">
            登录
          </v-btn>
        </div>
      </div>
      <div style="height: 100%" v-show="registerDisplay">
        <div style="margin-top: 5%;height: 50%">
          <v-text-field label="用户名" variant="outlined" id="username-input"></v-text-field>
          <v-text-field label="密码" variant="outlined" id="password-input"></v-text-field>
          <v-text-field label="确认密码" variant="outlined" id="password-check"></v-text-field>
          <div style="width: 100%;display: flex">
            <v-text-field label="邮箱" variant="outlined" id="password-check" style="width: 68%"></v-text-field>
            <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%">
              发送验证码
            </v-btn>
          </div>
          <v-text-field label="验证码" variant="outlined" id="password-check"></v-text-field>
          <v-btn variant="text" style="color: grey;float: right" @click="returnLoginButtonClickHandler">返回登录</v-btn>
          <v-btn variant="outlined" id="login-button">
            注册
          </v-btn>
        </div>
      </div>
      <div style="height: 100%" v-show="messageDisplay">
        <div style="margin-top: 5%;height: 50%">
          <v-alert text="未注册手机验证后自动登录" variant="text" style="color: grey;height: 0"></v-alert>

          <div style="width: 100%;display: flex">
            <v-text-field label="手机号" variant="outlined" id="password-check" style="width: 68%"></v-text-field>
            <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%">
              发送验证码
            </v-btn>
          </div>
          <v-text-field label="验证码" variant="outlined" id="password-check"></v-text-field>
          <v-btn variant="outlined" id="login-button">
            登录/注册
          </v-btn>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import {onMounted, onUnmounted, ref} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

let map = null;
let loginDisplay = ref(true);
let registerDisplay = ref(false);
let messageDisplay = ref(false);
onMounted(() => {
  window._AMapSecurityConfig = {
    securityJsCode: "c27ca67686a87d9e69ddf86ac03be353",
  };
  AMapLoader.load({
    key: "ada844b393d9be19a34cc6c4cfba1cbc\t", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  })
    .then((AMap) => {
      map = new AMap.Map("container", {
        // 设置地图容器id
        zoom: 12, // 初始化地图级别
        mapStyle: "amap://styles/whitesmoke", //设置地图的显示样式
        showLabel: false //不显示地图文字标记,
      });
      map.panBy(-300,0);
    })
    .catch((e) => {
      console.log(e);
    });
});

onUnmounted(() => {
  map?.destroy();
});

function registerButtonClickHandler(){
  loginDisplay.value = false;
  registerDisplay.value = true;
}
function returnLoginButtonClickHandler(){
  loginDisplay.value = true;
  registerDisplay.value = false;
}
function passwordLoginButtonClickHandler(){
  loginDisplay.value=true;
  registerDisplay.value = false;
  messageDisplay.value=false;
}
function messageLoginButtonClickHandler(){
  loginDisplay.value=false;
  registerDisplay.value = false;
  messageDisplay.value=true;
}
</script>
<style  scoped>
#container{
  padding:0px;
  margin: 0px;
  width: 100%;
  height: 100%;
  position: absolute;
}

#form-platform{
  position: absolute;
  left:65%;
  top:3%;
  height: 94%;
  width: 30%;

  padding: 3rem;
  border-radius: 3rem;

  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

#login-button{
  margin-left: 10%;
  margin-top: 5%;
  width: 80%;
  height: 3.5rem;
  border-radius: 1rem;
  color: grey;
}

::v-deep .amap-logo {
  display: none;
  opacity: 0 !important;
}

::v-deep .amap-copyright {
  opacity: 0;
}
</style>
