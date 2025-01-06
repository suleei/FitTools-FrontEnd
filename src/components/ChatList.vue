<script setup lang="ts">
import {onMounted, ref} from "vue";
import * as chatRequest from "@/networks/chatRequest";

defineExpose({
  insertMessage,
  messageNotifyHandler
});
const {socket, online_status} = defineProps(['socket','online_status']);


let WarnInfo = ref("")
let MessageWarnInfo = ref("")

let chatList = ref([
])

let chat = ref(false)
let pre_target_call_sign = ref("");
let target_call_sign = "";
let target_show = ref("")
let load_more = ref(true);
let messages = ref([
])
let inputMessage = ref("");


onMounted(()=>{
  getChatList()
})

function getChatList(){
  chatRequest.getChatList().then((res)=>{
    chatList.value = res.data.data;
  }).catch((err)=>{
    WarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      WarnInfo.value = ""
    },1000)
  })
}

function openChatWindow(chatObj: any){
  let target = chatObj.targetCallSign;
  if(chat.value === false || chat.value === true && pre_target_call_sign.value !== target){
    if(chatObj.hasNewMessage){
      chatRequest.notifyConfirm(target).then((res)=>{
        chatObj.hasNewMessage = false;
      }).catch((err)=>{
        WarnInfo.value = err.response.data.message;
        setTimeout(()=>{
          WarnInfo.value = ""
        },1000)
      })
    }
    chat.value = true;
    target_show.value = target;
    target_call_sign = target;
    socket.send(JSON.stringify({
      active_target: target
    }))
    load_more.value = true;
    pre_target_call_sign.value = target;
    chatRequest.getCachedMessages(target).then(res=>{
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

function loadHistoryMessagesHandler(){
  let timeBefore = null;
  if(messages.value.length > 0) timeBefore = messages.value[0].time;
  chatRequest.getHistoryMessages(target_call_sign, timeBefore).then(res=>{
    if(res.data.data.length === 0){
      load_more.value = false;
      return;
    }
    messages.value = res.data.data.concat(messages.value);
  }).catch(err=>{
    MessageWarnInfo.value = err.response.data.message;
    setTimeout(()=>{
      MessageWarnInfo.value = ""
    },1000)
  })
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
  chatRequest.sendMessage(now_date+' '+now_time, target_call_sign, inputMessage.value).then(res=>{
    const element = document.getElementById("chat_window");
    element.scrollTop = element.scrollHeight;
    setTimeout(()=>{
        getChatList()
    },1000)
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
    getChatList()
  },1000)
  setTimeout(()=>{
    const element = document.getElementById("chat_window");
    element.scrollTop = element.scrollHeight;
  },500)
}

function messageNotifyHandler(){
  /*if(targetCallSign === "") return;
  for(var i=0; i<chatList.value.length; i++){
    if(chatList.value[i].targetCallSign === targetCallSign){
      chatList.value[i].hasNewMessage = true;
      return;
    }
  }*/
  getChatList();
}
</script>

<template>
  <div>
    <div id="listPad">
      <div id="list" style="height: 100%;overflow: scroll;overflow-x:hidden">
        <div v-for="chat in chatList" style="display: flex;flex-direction: column;color: grey;margin-top: 1rem;margin-bottom: 1rem;" class="item" @click="openChatWindow(chat)">
          <div style="width: 90%;margin: auto;display: flex;flex-direction: row;justify-content: center;align-items: center;">
            <div style="width: 40%">
              <div style="text-align: center;font-size: 2rem;margin: auto;line-height: 2rem">
                {{chat.targetCallSign}}
              </div>
              <div style="font-size: 0.8rem;text-align: center;margin: auto;line-height: 0.8rem">
                {{chat.latestTime}}
              </div>
            </div>
            <div style="width: 55%;margin: auto;overflow: hidden;font-size: 1.5rem">
              {{chat.message}}
            </div>
            <v-avatar color="red" size="x-small" style="height: 1rem;width: 1rem;margin-left: 3%" v-show="chat.hasNewMessage"></v-avatar>
          </div>

        </div>
        <div style="text-align: center;color: darkred;">{{WarnInfo}}</div>
      </div>
    </div>

    <div id="chatPad" v-show="chat">
      <div style="width: 90%;height: 5%;font-size: 2rem;color: grey;margin: auto;display: flex;flex-direction: raw;justify-content: center;align-items: center;">
        <div>{{target_show}}</div>
        <v-avatar color="green" style="height: 1.5rem;width: 1.5rem;margin-left: 1rem" v-show="online_status"></v-avatar>
        <v-avatar color="grey" style="height: 1.5rem;width: 1.5rem;margin-left: 1rem" v-show="!online_status"></v-avatar>
      </div>
      <div style="height: 83%;overflow: scroll;overflow-x:hidden;" id="chat_window">
        <div style="width: 96%;margin: auto;text-align: center;">
          <v-btn variant="plain" @click="loadHistoryMessagesHandler" v-show="load_more">
            加载更多
          </v-btn>
        </div>
        <div v-for="message in messages" style="width: 96%;margin: auto;" >
          <div style="width: 80%;">
            <div style="font-size: 1.1rem;background-color: rgba(125, 125, 125, 0.2);border-radius: 0.5rem;margin: 0.5rem;width:fit-content;padding: 0.5rem" v-show="!message.owner">
              <div style="color: grey;margin-left: 1%">
                <div>{{message.message}}</div>
              </div>
              <div style="color: grey;font-size: 0.8rem;text-align: right">
                {{message.time}}
              </div>
            </div>
          </div>
          <div style="width: 80%;margin-left: 20%;display: flex;flex-direction: row;justify-content: right">
            <div style="font-size: 1.1rem;background-color: rgba(125, 125, 125, 0.2);border-radius: 0.5rem;margin: 0.5rem;width:fit-content;padding: 0.5rem" v-show="message.owner">
              <div style="color: white;margin-left: 1%">
                <div>{{message.message}}</div>
              </div>
              <div style="color: grey;font-size: 0.8rem;text-align: right">
                {{message.time}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="height: 10%;width: 96%;margin: auto;display: flex;flex-direction: row;margin-top: 2%">
        <v-text-field  variant="outlined" maxlength="100" counter style="width: 85%" v-model="inputMessage"></v-text-field>
        <v-btn variant="outlined" style="width: 3rem;height:3rem;color: grey;margin-left: 2%;margin-top:0.5%;" icon="mdi-send" @click="messageSendingHandler">
        </v-btn>
      </div>
      <div style="text-align: center;color: darkred;">{{MessageWarnInfo}}</div>
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
  width: 19.6%;
  height: 92%;
  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

#list{
  overflow: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.item:hover{
  background-color: rgba(125, 125, 125, 0.2);
  cursor: pointer;
}

#list::-webkit-scrollbar {
  display: none;
}

#chatPad{
  position: absolute;
  left:20.6%;
  top: 7%;
  border-radius: 1rem;
  border: 1px solid gray;
  width: 77.4%;
  height: 92%;

  background: rgba(255, 255, 255, .1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  margin-left: 1rem;
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
