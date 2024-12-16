import requestInstance from "./request";


export function uploadAvatar(file:any){
  const formData = new FormData();
  formData.append("file", file);
  return requestInstance.request({
    url:'/user/avatar',
    method: "post",
    data: formData
  })
}

export function getUserInfo(){
  return requestInstance.request({
    url:'/user',
    method: "get",
  })
}
