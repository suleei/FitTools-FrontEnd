import requestInstance from "@/networks/request";


export function getActivities(startTime: any, id: any, activity_mode: string) {
  let commented = false;
  if(activity_mode === 'commented') commented = true;
  return requestInstance.request({
    url:'/activity',
    method: "get",
    params:{
      startTime:startTime,
      id:id,
      commented: commented,
    }
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

export function sendComment(activityId: number, comment: string, time: string, reply: string) {
  return requestInstance.request({
    url:'/activity/comment',
    method: "post",
    data: {
      activityId:activityId,
      time:time,
      comment:comment,
      replyCallSign:reply
    }
  })
}

export function getComments(activityId: number) {
  return requestInstance.request({
    url:'/activity/comment',
    method: "get",
    params: {
      activityId:activityId,
    }
  })
}

export function deleteComment(commentId: number) {
  return requestInstance.request({
    url:'/activity/comment',
    method: "delete",
    params: {
      commentId: commentId
    }
  })
}

export function deleteActivity(id: number) {
  return requestInstance.request({
    url:'/activity',
    method: "delete",
    params: {
      id: id
    }
  })
}

export function getCommentedCardinality() {
  return requestInstance.request({
    url:'/activity/commented/cardinality',
    method: "get"
  })
}

export function confirmCommentActivity(activityId: number) {
  return requestInstance.request({
    url:'/activity/commented',
    method: "delete",
    params:{
      activityId:activityId
    }
  })
}
