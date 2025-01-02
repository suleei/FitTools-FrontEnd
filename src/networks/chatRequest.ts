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
