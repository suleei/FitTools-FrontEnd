import requestInstance from "@/networks/request";

export function getCaptcha(){
  return requestInstance.request({
    url:'/captcha',
    method: "get",
  })
}
