import requestInstance from "@/networks/request";

export function getActiveStatus(){
  return requestInstance.request({
    url:'/ham/status',
    method: "get",
  })
}

export function setStatusActive(times: number[]){
  return requestInstance.request({
    url:'/ham/status',
    method: "post",
    data:{
      times: times,
    }
  })
}

export function setStatusInactive(){
  return requestInstance.request({
    url:'/ham/status',
    method: "delete",
  })
}

export function getNearByHam(distance: number){
  return requestInstance.request({
    url:'/ham',
    method: "get",
    params:{
      distance:distance
    }
  })
}
