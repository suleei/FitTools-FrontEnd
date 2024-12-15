<template>
  <div id="container">
  </div>
  <div id="form-platform" style="overflow: hidden;display: flex;align-items: center">
    <div style="width: 100%">
      <div style="text-align: center;font-size: 1.5rem;color: grey;">OPEN FIT TOOLS</div>
<!--      <v-divider style="margin-top: 5%"></v-divider>
      <v-btn variant="text" style="color: grey" rounded="0" @click="passwordLoginButtonClickHandler">
        密码登录
      </v-btn>
      <v-btn variant="text" style="color: grey" rounded="0" @click="messageLoginButtonClickHandler">
        短信登录
      </v-btn>
      <v-btn variant="text" style="color: grey" rounded="0" @click="thirdPartyLoginButtonClickHandler">
        第三方登录
      </v-btn>
      <v-divider></v-divider>-->
<!--      <div style="height: 100%" v-if="displayStatus.thirdParty">
        <div style="margin-top: 5%;height: 50%;">
          <div style="display: flex;justify-content: space-between;width: 50%;margin: 10% auto">
            <v-btn icon="mdi-qqchat" variant="outlined" style="color: grey" size="x-large"></v-btn>
            <v-btn icon="mdi-wechat" variant="outlined" style="color: grey" size="x-large"></v-btn>
            <v-btn icon="mdi-sina-weibo" variant="outlined" style="color: grey" size="x-large"></v-btn>
          </div>
          <div style="display: flex;justify-content: space-between;width: 50%;margin: 0 auto">
            <v-btn icon="mdi-github" variant="outlined" style="color: grey" size="x-large"></v-btn>
            <v-btn icon="mdi-apple" variant="outlined" style="color: grey" size="x-large"></v-btn>
            <v-btn icon="mdi-android" variant="outlined" style="color: grey" size="x-large"></v-btn>
          </div>
        </div>
      </div>-->
      <div style="height: 100%" v-if="displayStatus.login">
        <div style="margin-top: 5%;height: 50%">
          <v-form v-model="status.formSubmitEnable">
            <v-text-field
              label="用户名"
              variant="outlined"
              prepend-inner-icon="mdi-account-outline"
              v-model="formFields.username"
              :rules="[rules.required, rules.username_size_limit]"
              counter maxlength="20">
            </v-text-field>
            <v-text-field
              :append-inner-icon="status.password_visible ? 'mdi-eye-off' : 'mdi-eye'"
              :prepend-inner-icon="status.passwordReady ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
              :type="status.password_visible ? 'text' : 'password'"
              label = "密码"
              variant="outlined"
              @click:append-inner="status.password_visible = !status.password_visible"
              v-model="formFields.password"
              :rules="[rules.required,rules.password]"
              style="margin-top: 2%;">
            </v-text-field>
          </v-form>
          <v-btn variant="text" style="color: grey;float: right" @click="retrieveButtonClickHandler">忘记密码</v-btn>
          <v-btn variant="text" style="color: grey;float: right" @click="registerButtonClickHandler">注册</v-btn>
          <v-btn variant="outlined" id="login-button" :disabled="!status.formSubmitEnable" @click="loginHandler">登录</v-btn>
        </div>
      </div>

      <div style="height: 100%" v-if="displayStatus.register">
        <div style="margin-top: 5%;height: 50%">
          <v-form v-model="status.registerEnable">
            <v-text-field
              label="用户名"
              variant="outlined"
              prepend-inner-icon="mdi-account-outline"
              v-model="formFields.username"
              :rules="[rules.required, rules.username_size_limit]"
              counter maxlength="20">
            </v-text-field>
            <v-text-field
              :append-inner-icon="status.password_visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="status.password_visible ? 'text' : 'password'"
              label = "密码"
              :prepend-inner-icon="status.passwordReady ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
              variant="outlined"
              @click:append-inner="status.password_visible = !status.password_visible"
              v-model="formFields.password"
              :rules="[rules.required,rules.password]"
              style="margin-top: 2%;">
            </v-text-field>
            <v-text-field
              :append-inner-icon="status.password_check_visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="status.password_check_visible ? 'text' : 'password'"
              label = "确认密码"
              :prepend-inner-icon="status.passwordCheckReady ? 'mdi-lock-check-outline' : 'mdi-lock-remove-outline'"
              prepend-inner-icon="mdi-lock-check-outline"
              variant="outlined"
              @click:append-inner="status.password_check_visible = !status.password_check_visible"
              v-model="formFields.passwordCheck"
              :rules="[rules.required,rules.passwordCheck]"
              style="margin-top: 2%;">
            </v-text-field>
            <div  style="width: 100%;display: flex;margin-top: 2%;">
                <v-text-field
                  label="邮箱"
                  variant="outlined"
                  id="password-check"
                  style="width: 68%;"
                  prepend-inner-icon="mdi-email-outline"
                  v-model="formFields.eMail"
                  :rules="[rules.required, rules.email]">
                </v-text-field>
            </div>
            <div  style="width: 100%;display: flex;margin-top: 2%;">
              <v-img
                style="margin-top: 0.5%;margin-right: 2%"
                width="120"
                height="50"
                @click=captchaReloadHandler
                :src="`data:image/png;base64,${status.captchaImg}`"/>
              <v-text-field
                label=""
                variant="outlined"
                id="captchaCode"
                style="width: 68%;"
                prepend-inner-icon="mdi-alphabetical-variant"
                v-model="formFields.captchaCode"
                :rules="[rules.required, rules.captcha]">
              </v-text-field>
              <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%" :disabled="!(status.captchaEnable && status.identifyingCodeSendingEnabled && !status.identifyingCodeSendingCooldown)" @click="identifyingCodeSendingButtonClickHandler">
                {{status.identifyingCodeSendingButtonText}}
              </v-btn>
            </div>
            <v-text-field
              label="验证码"
              prepend-inner-icon="mdi-message-processing-outline"
              variant="outlined"
              v-model="formFields.identifyingCode"
              :rules="[rules.required,rules.identifyingCode]"
              style="margin-top: 2%">
            </v-text-field>
            <v-btn variant="text" style="color: grey;float: right" @click="returnLoginButtonClickHandler">返回登录</v-btn>
            <v-btn variant="outlined" id="login-button" :disabled="!status.registerEnable" @click="registerHandler">注册</v-btn>
          </v-form>
        </div>
      </div>

      <div style="height: 100%" v-if="displayStatus.retrieve">
        <div style="margin-top: 5%;height: 50%">
          <v-form v-model="status.formSubmitEnable">
            <v-text-field
              label="用户名"
              variant="outlined"
              prepend-inner-icon="mdi-account-outline"
              v-model="formFields.username"
              :rules="[rules.required, rules.username_size_limit]"
              counter maxlength="20">
            </v-text-field>
            <div  style="width: 100%;display: flex;margin-top: 2%;">
              <v-text-field
                label="邮箱"
                variant="outlined"
                id="password-check"
                style="width: 68%;"
                prepend-inner-icon="mdi-email-outline"
                v-model="formFields.eMail"
                :rules="[rules.required, rules.email]">
              </v-text-field>
            </div>
            <div  style="width: 100%;display: flex;margin-top: 2%;">
              <v-img
                style="margin-top: 0.5%;margin-right: 2%"
                width="120"
                height="50"
                @click=captchaReloadHandler
                :src="`data:image/png;base64,${status.captchaImg}`"/>
              <v-text-field
                label=""
                variant="outlined"
                id="captchaCode"
                style="width: 68%;"
                prepend-inner-icon="mdi-alphabetical-variant"
                v-model="formFields.captchaCode"
                :rules="[rules.required, rules.captcha]">
              </v-text-field>
              <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%"  @click="retrieveIdentifyingCodeSendingButtonClickHandler">
                {{status.retrieveIdentifyingCodeSendingButtonText}}
              </v-btn>
            </div>
            <v-text-field
              label="验证码"
              prepend-inner-icon="mdi-message-processing-outline"
              variant="outlined"
              v-model="formFields.identifyingCode"
              :rules="[rules.required,rules.identifyingCode]"
              style="margin-top: 2%">
            </v-text-field>
            <v-text-field
              :append-inner-icon="status.password_visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="status.password_visible ? 'text' : 'password'"
              label = "新密码"
              :prepend-inner-icon="status.passwordReady ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
              variant="outlined"
              @click:append-inner="status.password_visible = !status.password_visible"
              v-model="formFields.password"
              :rules="[rules.required,rules.password]"
              style="margin-top: 2%;">
            </v-text-field>
            <v-text-field
              :append-inner-icon="status.password_check_visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="status.password_check_visible ? 'text' : 'password'"
              label = "确认密码"
              :prepend-inner-icon="status.passwordCheckReady ? 'mdi-lock-check-outline' : 'mdi-lock-remove-outline'"
              prepend-inner-icon="mdi-lock-check-outline"
              variant="outlined"
              @click:append-inner="status.password_check_visible = !status.password_check_visible"
              v-model="formFields.passwordCheck"
              :rules="[rules.required,rules.passwordCheck]"
              style="margin-top: 2%;">
            </v-text-field>
            <v-btn variant="text" style="color: grey;float: right" @click="returnLoginButtonClickHandler">返回登录</v-btn>
            <v-btn variant="outlined" id="login-button" :disabled="!status.formSubmitEnable" @click="userRetrieve">账户找回</v-btn>
          </v-form>
        </div>
      </div>

<!--      <div style="height: 100%" v-if="displayStatus.message">
        <div style="margin-top: 5%;height: 50%">
          <v-form v-model="status.formSubmitEnable">
            <div style="width: 100%;display: flex">
              <v-text-field
                label="手机号"
                variant="outlined"
                prepend-inner-icon="mdi-phone-outline"
                id="password-check"
                placeholder="未注册手机验证后自动登录"
                v-model="formFields.phoneNumber"
                :rules="[rules.required,rules.phoneNumber]"
                style="width: 68%">
              </v-text-field>
              <v-btn variant="outlined" style="width: 20%;height: 3.5rem;color: grey;margin-left: 2%" :disabled="!(status.identifyingCodeSendingEnabled && !status.identifyingCodeSendingCooldown)" @click="identifyingCodeSendingButtonClickHandler">
                {{status.identifyingCodeSendingButtonText}}
              </v-btn>
            </div>
            <v-text-field
              label="验证码"
              prepend-inner-icon="mdi-message-processing-outline"
              variant="outlined"
              v-model="formFields.identifyingCode"
              :rules="[rules.required,rules.identifyingCode]"
              style="margin-top: 2%">
            </v-text-field>
            <v-btn variant="outlined" id="login-button" :disabled="!status.formSubmitEnable">
              登录/注册
            </v-btn>
          </v-form>
        </div>
      </div>-->
      <div>
        <v-snackbar
          v-model="status.snackbarShow"
          :timeout="status.snackbarTimeout"
          variant="outlined"
          locaton = "end bottom"
          :color="status.snackbarColor"
        >
          {{ status.snackbarText }}

          <template v-slot:actions>
            <v-btn
              color="gray"
              variant="text"
              @click="status.snackbarShow = false"
            >
              关闭
            </v-btn>
          </template>
        </v-snackbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import {computed, onMounted, onUnmounted, reactive, ref} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import * as loginRequest from "@/networks/loginRequest";
import {useRouter} from "vue-router";

let map = null;
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


const displayStatus = reactive({
  login: true,
  register: false,
  message: false,
  retrieve: false,
  thirdParty: false
})

const initialFormFields ={
  username: "",
  password: "",
  passwordCheck: "",
  eMail: "",
  phoneNumber: "",
  identifyingCode: "",
  captchaCode: ""
}

const initialStatus = {
  snackbarColor:"red",
  formSubmitEnable:false,
  registerEnable:false,
  email: '',
  username: '',
  captchaImg: '',
  password_visible: false,
  password_check_visible: false,
  identifyingCodeSendingEnabled: false,
  identifyingCodeSendingCooldown: false,
  identifyingCodeSendingButtonText: "发送验证码",
  retrieveIdentifyingCodeSendingEnabled: false,
  retrieveIdentifyingCodeSendingCooldown: false,
  retrieveIdentifyingCodeSendingButtonText: "发送验证码",
  passwordReady:false,
  passwordCheckReady:false,
  captchaEnable:false,
  snackbarShow: false,
  snackbarText: '',
  snackbarTimeout: 2000,
}

let formFields = reactive({
  ...initialFormFields
})

let status = reactive({
  ...initialStatus
})

let router = useRouter()

let rules={
  required: value => !!value || '必填字段',
  username_size_limit: value => value.length <= 20 || '最大20个字符',
  email: value => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if(displayStatus.register){
      if(pattern.test(value)===true) status.identifyingCodeSendingEnabled=true
      else status.identifyingCodeSendingEnabled=false
    }
    return pattern.test(value) || '错误的邮箱格式'
  },
  captcha: value => {
    if(typeof value == 'string' && value.length > 0){
      status.captchaEnable = true
    }else status.captchaEnable = false
    return typeof value == 'string' && value.length > 0 || '答案不能为空'
  },
  identifyingCode: value=>{
    const pattern = /\d{6}/
    return pattern.test(value) || '错误的验证码格式'
  },
  password: value=>{
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!%*?&])[A-Za-z\d@!%*?&]{8,}$/
    if(pattern.test(value)) status.passwordReady=true;
    else status.passwordReady=false;
    return pattern.test(value) || '大小写字母、数字和特殊字符各至少出现一次且长度大于8'
  },
  passwordCheck: value=>{
    if(formFields.password===formFields.passwordCheck) status.passwordCheckReady=true;
    else status.passwordCheckReady=false;
    return (formFields.password===formFields.passwordCheck) || '两次输入的密码不一致'
  },
  phoneNumber: value=>{
    const pattern = /1[3-9]\d{9}/
    if(displayStatus.message){
      if(pattern.test(value)===true) status.identifyingCodeSendingEnabled=true
      else status.identifyingCodeSendingEnabled=false
    }
    return pattern.test(value) || '错误的电话号码格式'
  },
}

function statusReset(){
  formFields = reactive({
    ...initialFormFields
  })
  status = reactive({
    ...initialStatus
  })
}
function registerButtonClickHandler(){
  getCaptchaImg();
  statusReset();
  displayStatus.login = false;
  displayStatus.register = true;
}

function retrieveButtonClickHandler(){
  getCaptchaImg();
  statusReset();
  displayStatus.retrieve = true;
  displayStatus.login = false;
}
function returnLoginButtonClickHandler(){
  statusReset();
  displayStatus.login = true;
  displayStatus.register = false;
  displayStatus.retrieve = false;
}
function passwordLoginButtonClickHandler(){
  statusReset();
  displayStatus.login = true;
  displayStatus.register = false;
  displayStatus.message = false;
  displayStatus.retrieve = false;
  displayStatus.thirdParty=false;
}
function messageLoginButtonClickHandler(){
  statusReset();
  displayStatus.login = false;
  displayStatus.register = false;
  displayStatus.retrieve = false;
  displayStatus.message = true;
  displayStatus.thirdParty=false;
}
function thirdPartyLoginButtonClickHandler(){
  statusReset();
  displayStatus.login = false;
  displayStatus.register = false;
  displayStatus.retrieve = false;
  displayStatus.message = false;
  displayStatus.thirdParty=true;
}
function identifyingCodeSendingButtonClickHandler(){
  loginRequest.sendEmailCaptcha(formFields.eMail, status.captchaHashCode, formFields.captchaCode).then(res=>{
    status.identifyingCodeSendingCooldown=true;
    let counter = 6;
    status.identifyingCodeSendingButtonText = counter + 's';
    let countDowner = setInterval(()=>{
      counter--;
      status.identifyingCodeSendingButtonText = counter + 's';
      if(counter===0) {
        status.identifyingCodeSendingButtonText= "发送验证码"
        status.identifyingCodeSendingCooldown=false;
        clearInterval(countDowner)
      }
    },1000)
  }).catch(err=>{
    status.snackbarColor = "red";
    status.snackbarText= err.response.data.message;
    status.snackbarShow = true;
  })
}

function retrieveIdentifyingCodeSendingButtonClickHandler(){
  loginRequest.sendRetrieveEmailCaptcha(formFields.username, formFields.eMail, status.captchaHashCode, formFields.captchaCode).then(res=>{
    status.retrieveIdentifyingCodeSendingCooldown=true;
    let counter = 6;
    status.retrieveIdentifyingCodeSendingButtonText = counter + 's';
    let countDowner = setInterval(()=>{
      counter--;
      status.retrieveIdentifyingCodeSendingButtonText = counter + 's';
      if(counter===0) {
        status.retrieveIdentifyingCodeSendingButtonText= "发送验证码"
        status.retrieveIdentifyingCodeSendingCooldown=false;
        clearInterval(countDowner)
      }
    },1000)
  }).catch(err=>{
    status.snackbarColor = "red";
    status.snackbarText= err.response.data.message;
    status.snackbarShow = true;
  })
}

function userRetrieve(){
  loginRequest.retrieve(formFields.username, formFields.password, formFields.eMail, formFields.identifyingCode).then(res=>{
    returnLoginButtonClickHandler()
    status.snackbarColor = "grey";
    status.snackbarText= "账号找回成功，请登录";
    status.snackbarShow = true;
  }).catch(err=>{
    status.snackbarColor = "red";
    status.snackbarText= err.response.data.message;
    status.snackbarShow = true;
  })
}
function captchaReloadHandler(){
  getCaptchaImg();
}
function getCaptchaImg() {
  loginRequest.getCaptcha().then(result=>{
      status.captchaImg = result.data.data.base64Img;
      status.captchaHashCode = result.data.data.hashCode;
      console.log();
    }
  )
}

function registerHandler(){
  loginRequest.register(formFields.username, formFields.password, formFields.eMail, formFields.identifyingCode).then(res=>{
    returnLoginButtonClickHandler()
    status.snackbarColor = "grey";
    status.snackbarText= "注册成功，请登录";
    status.snackbarShow = true;
  }).catch(err=>{
    status.snackbarColor = "red";
    status.snackbarText= err.response.data.message;
    status.snackbarShow = true;
  })
}
function loginHandler(){
  loginRequest.login(formFields.username,formFields.password).then(re=>{
    formFields.password="";
    sessionStorage.setItem("jwt",re.data.data);
    router.push({'path':'/'});
  }).catch(err=>{
    console.log(err)
    status.snackbarColor = "red";
    status.snackbarText= err.response.data.message;
    status.snackbarShow = true;
  })
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
