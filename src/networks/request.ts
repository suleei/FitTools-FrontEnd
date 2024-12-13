import axios from "axios";
let requestInstance = axios.create({
  baseURL: "http://localhost:8080"
})
export default requestInstance;
