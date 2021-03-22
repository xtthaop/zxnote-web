import request from '@/utils/request'

export function createCategory(data){
  return request({
    url: '/category',
    method: 'post',
    data
  })
}

export function getCategoryList(){
  return request({
    url: '/category',
    method: 'get',
  })
}

export function deleteCategory(data){
  return request({
    url: '/category',
    method: 'delete',
    data
  })
}

export function updateCategory(data){
  return request({
    url: '/category',
    method: 'put',
    data
  })
}
