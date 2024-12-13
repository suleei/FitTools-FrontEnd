import requestInstance from "./request";


export function login(username:string, password:string){
  return requestInstance.request({
    url:'/login/login',
    method: "post",
    data: {
      username: username,
      password: password
    }
  })
}


export function getCaptcha(){
  return requestInstance.request({
    url:'/login/captcha',
    method: "get",
  })
}

export function sendEmailCaptcha(email:string, captchaHash:string, captchaCode:string){
  return requestInstance.request({
    url:'/login/email',
    method: "post",
    data: {
      email: email,
      captchaHash: captchaHash,
      captchaCode: captchaCode
    }
  })
}

export function register(username:string, password:string, email:string, verificationCode:string){
  return requestInstance.request({
    url:'/login/register',
    method: "post",
    data: {
      username: username,
      password:password,
      email: email,
      verificationCode:verificationCode
    }
  })
}
