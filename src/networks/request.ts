import axios from "axios";
let requestInstance = axios.create({
  baseURL: "http://localhost:8080"
})
requestInstance.interceptors.request.use(function (config) {
  if(sessionStorage.getItem('jwt')){
    config.headers.Authorization = sessionStorage.getItem('jwt');
  }
  return config;
}, function (error) {
})
export default requestInstance;
