import requestInstance from "@/networks/request";

export function getConfirmLog(){
  return requestInstance.request({
    url:'/confirm',
    method: "get",
  })
}

export function deleteConfirmLog(){
  return requestInstance.request({
    url:'/confirm',
    method: "delete",
  })
}
