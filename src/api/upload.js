import request from '@/utils/request'

// 上传文件
export function uploadFile(data) {
  return request({
    url: '/restful/upload',
    method: 'post',
    data,
  })
}

export function clearCache() {
  return request({
    url: '/upload',
    method: 'delete',
  })
}
