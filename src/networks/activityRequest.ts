import requestInstance from "@/networks/request";

export function getActivities(startTime: any, id: any) {
  return requestInstance.request({
    url:'/activity',
    method: "get",
    params:{
      startTime:startTime,
      id:id
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
