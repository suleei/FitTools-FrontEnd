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

export function updateUsername(username:string){
  return requestInstance.request({
    url:'/user/username',
    method: "put",
    params: {
      username: username
    }
  })
}

export function sendEmailCaptcha(captchaHash:string, captchaCode:string){
  return requestInstance.request({
    url:'/user/email/captcha',
    method: "get",
    params: {
      captchaHash: captchaHash,
      captchaCode: captchaCode
    }
  })
}

export function sendEmailCaptchaNew(email:string, captchaHash:string, captchaCode:string){
  return requestInstance.request({
    url:'/user/email/captcha/new',
    method: "get",
    params: {
      email: email,
      captchaHash: captchaHash,
      captchaCode: captchaCode
    }
  })
}

export function verifyEmail(captcha:string){
  return requestInstance.request({
    url:'/user/email/verify',
    method: "get",
    params: {
      captcha: captcha,
    }
  })
}

export function modifyEmail(jwt:string, email:string, captcha:string){
  return requestInstance.request({
    url:'/user/email',
    method: "post",
    data: {
      jwt: jwt,
      email: email,
      captcha: captcha,
    }
  })
}
