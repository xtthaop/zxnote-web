import request from '@/utils/request'

export function getCategoryList(data){
  return request({
    url: '/category',
    method: 'post',
    data
  })
}
