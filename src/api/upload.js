import request from '@/utils/request'

export function uploadFile(data){
  return request({
    url: '/upload',
    method: 'post',
    data
  })
}

export function clearCache(){
  return request({
    url: '/upload',
    method: 'delete',
  })
}
