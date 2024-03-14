import request from '@/utils/request'

// 新增笔记
export function addNote(data) {
  return request({
    url: '/restful/note/add_note',
    method: 'post',
    data,
  })
}

// 获取分类下笔记
export function getCategoryNote(params) {
  return request({
    url: '/restful/note/get_category_note',
    method: 'get',
    params,
  })
}

// 删除笔记
export function deleteNote(data) {
  return request({
    url: '/restful/note',
    method: 'delete',
    data,
  })
}

// 移动笔记
export function moveNote(data) {
  return request({
    url: '/restful/note/move_note',
    method: 'post',
    data,
  })
}

export function getNoteContent(params) {
  return request({
    url: '/note/get_note_content',
    method: 'get',
    params,
  })
}

export function saveNote(data) {
  return request({
    url: '/note/save_note',
    method: 'post',
    data,
  })
}

export function publishNote(data) {
  return request({
    url: '/note/publish_note',
    method: 'post',
    data,
  })
}
