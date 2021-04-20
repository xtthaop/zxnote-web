import request from '@/utils/request'

export function createNote(data){
  return request({
    url: '/note/create_note',
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

export function moveNote(data){
  return request({
    url: '/note/move_note',
    method: 'post',
    data
  })
}

export function getNoteContent(params){
  return request({
    url: '/note/get_note_content',
    method: 'get',
    params
  })
}

export function saveNote(data){
  return request({
    url: '/note/save_note',
    method: 'post',
    data
  })
}
