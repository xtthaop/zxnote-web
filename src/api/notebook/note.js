import request from '@/utils/request'

export function createNote(data){
  return request({
    url: '/note',
    method: 'post',
    data
  })
}

export function getCategoryNote(params){
  return request({
    url: '/note/get_category_note',
    method: 'get',
    params
  })
}

export function deleteNote(data){
  return request({
    url: '/note',
    method: 'delete',
    data
  })
}
