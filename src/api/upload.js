import request from '@/utils/request'

// 通用文件上传
export function uploadFile(data) {
  return request({
    url: '/restful/upload',
    method: 'post',
    data,
  })
}

// 获取已不在笔记中引用的图片文件信息
export function getFilesInfo() {
  return request({
    url: '/restful/upload',
    method: 'get',
  })
}

// 清除已不在笔记中引用的图片文件
export function clearCache() {
  return request({
    url: '/restful/upload',
    method: 'delete',
  })
}
