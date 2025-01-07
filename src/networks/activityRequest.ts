import requestInstance from "@/networks/request";

export function getActivities() {
  return requestInstance.request({
    url:'/activity',
    method: "get"
  })
}

export function thumbsUp(activityId: number) {
  return requestInstance.request({
    url:'/activity/thumbs',
    method: "put",
    params:{
      activityId: activityId
    }
  })
}
