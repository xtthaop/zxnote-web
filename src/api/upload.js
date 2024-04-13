import request from '@/utils/request'

// 通用文件上传
export function uploadFile(data) {
  return request({
    url: '/restful/upload',
    method: 'post',
    data,
  })
}
