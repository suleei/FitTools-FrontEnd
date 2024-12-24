import requestInstance from "@/networks/request";

export function addCommunicationLog(form: any) {
  return requestInstance.request({
    url:'/log',
    method: "post",
    data: {
      source_call_sign: form.source_call_sign,
      target_call_sign: form.target_call_sign,
      source_address: form.source_address+form.source_location,
      source_district: form.source_district,
      source_lng: form.source_longitude,
      source_lat: form.source_latitude,
      target_address: form.target_province + form.target_city + form.target_district + form.target_area,
      target_lng: form.target_lng,
      target_lat: form.target_lat,
      source_device: form.source_device_name,
      target_device: form.target_device_name,
      source_antenna: form.source_antenna,
      target_antenna: form.target_antenna,
      source_power: form.source_power,
      target_power: form.target_power,
      frequency: form.frequency,
      mode: form.mode,
      source_rst: form.source_signal_report,
      target_rst: form.target_signal_report,
      weather: form.weather,
      start_time: form.start_date + ' ' + form.start_time,
      end_time: form.end_date + ' ' + form.end_time,
      comments: form.comments,
      distance: form.distance,
    }
  })
}

export function getCommunicationLogs(pageNum: number) {
  return requestInstance.request({
    url:'/log',
    method: "get",
    params:{
      pageNum: pageNum,
    }
  })
}

export function deleteCommunicationLog(logId: number) {
  return requestInstance.request({
    url:'/log',
    method: "delete",
    params:{
      logId: logId,
    }
  })
}

export function getCommunicationLogDetail(logId: number) {
  return requestInstance.request({
    url:'/log/detail',
    method: "get",
    params:{
      logId: logId,
    }
  })
}
