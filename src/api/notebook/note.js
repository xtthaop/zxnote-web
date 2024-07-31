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
export function getCategoryNote(params, signal) {
  return request({
    url: '/restful/note/get_category_note',
    method: 'get',
    params,
    signal,
  })
}

// 逻辑删除笔记
export function softDeleteNote(data) {
  return request({
    url: '/restful/note/soft_delete_note',
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

// 获取笔记内容
export function getNote(params, signal) {
  return request({
    url: '/restful/note/get_note',
    method: 'get',
    params,
    signal,
  })
}

// 保存笔记
export function saveNote(data) {
  return request({
    url: '/restful/note/save_note',
    method: 'post',
    data,
  })
}

// 获取笔记历史列表
export function getNoteHistoryList(params) {
  return request({
    url: '/restful/note/get_note_history_list',
    method: 'get',
    params,
  })
}

// 获取笔记某个历史版本
export function getNoteHistoryVersion(params) {
  return request({
    url: '/restful/note/get_note_history_version',
    method: 'get',
    params,
  })
}

// 恢复笔记到某个历史版本
export function recoveryNote(data) {
  return request({
    url: '/restful/note/recovery_note',
    method: 'put',
    data,
  })
}

// 获取已删除的笔记列表
export function getDeletedNoteList() {
  return request({
    url: '/restful/note/get_deleted_note_list',
    method: 'get',
  })
}

// 获取已删除的笔记内容
export function getDeletedNoteContent(params) {
  return request({
    url: '/restful/note/get_deleted_note_content',
    method: 'get',
    params,
  })
}

// 恢复删除的笔记
export function restoreNote(data) {
  return request({
    url: '/restful/note/restore_note',
    method: 'put',
    data,
  })
}

// 彻底删除笔记
export function completelyDeleteNote(data) {
  return request({
    url: '/restful/note/completely_delete_note',
    method: 'delete',
    data,
  })
}

// 发布笔记
export function publishNote(data) {
  return request({
    url: '/restful/note/publish_note',
    method: 'post',
    data,
  })
}

// 获取笔记中引用的文件信息
export function getFilesInfo() {
  return request({
    url: '/restful/note/get_note_files_info',
    method: 'get',
  })
}

// 清理空间
export function clearSpace(data) {
  return request({
    url: '/restful/note/clear_space',
    method: 'delete',
    data,
  })
}
