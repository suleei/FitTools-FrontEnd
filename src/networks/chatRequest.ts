import requestInstance from "@/networks/request";

export function sendMessage(time_str: string, target_call_sign : string, message: string) {
  return requestInstance.request({
    url:'/chat/message',
    method: "post",
    data: {
      time: time_str,
      target: target_call_sign,
      message: message
    }
  })
}

export function getCachedMessages(target_call_sign : string) {
  return requestInstance.request({
    url:'/chat/message/cached',
    method: "get",
    params: {
      target_call_sign: target_call_sign ,
    }
  })
}

export function getHistoryMessages(target_call_sign : string, time_before: string) {
  return requestInstance.request({
    url:'/chat/message/history',
    method: "get",
    params: {
      timeBefore: time_before,
      targetCallSign: target_call_sign ,
    }
  })
}
