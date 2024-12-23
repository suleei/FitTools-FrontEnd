import requestInstance from "@/networks/request";

export function addDevice(name: string, power: string, antenna: string) {
  return requestInstance.request({
    url:'/device',
    method: "post",
    data: {
      name: name,
      power: power,
      antenna: antenna
    }
  })
}

export function getDevices() {
  return requestInstance.request({
    url:'/device',
    method: "get"
  })
}

export function deleteDevices(id: String) {
  return requestInstance.request({
    url:'/device',
    method: "delete",
    params: {
      deviceId: id
    }
  })
}

export function setDefaultDevice(id: String) {
  return requestInstance.request({
    url:'/device/default',
    method: "post",
    params: {
      deviceId: id
    }
  })
}

export function getDefaultDevice(id: String) {
  return requestInstance.request({
    url:'/device/default',
    method: "get",
  })
}
