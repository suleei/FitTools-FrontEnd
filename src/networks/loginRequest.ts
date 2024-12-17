import requestInstance from "./request";


export function login(username:string, password:string){
  return requestInstance.request({
    url:'/login',
    method: "post",
    data: {
      username: username,
      password: password
    }
  })
}

export function sendEmailCaptcha(email:string, captchaHash:string, captchaCode:string){
  return requestInstance.request({
    url:'/login/register/email',
    method: "post",
    data: {
      email: email,
      captchaHash: captchaHash,
      captchaCode: captchaCode
    }
  })
}

export function sendRetrieveEmailCaptcha(username:string, email:string, captchaHash:string, captchaCode:string){
  return requestInstance.request({
    url:'/login/retrieve/email',
    method: "post",
    data: {
      username: username,
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

export function retrieve(username:string, password:string, email:string, verificationCode:string){
  return requestInstance.request({
    url:'/login/retrieve',
    method: "post",
    data: {
      username: username,
      password:password,
      email: email,
      verificationCode:verificationCode
    }
  })
}
