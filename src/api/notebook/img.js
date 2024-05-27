import request from '@/utils/request'

// 获取所有被删除的图片
export function getBackupImgs() {
  return request({
    url: '/restful/note_img/get_backup_imgs',
    method: 'get',
  })
}

// 恢复被删除的图片
export function restoreImg(data) {
  return request({
    url: '/restful/note_img/restore_note_img',
    method: 'put',
    data,
  })
}

// 彻底删除图片
export function completelyDeleteImg(data) {
  return request({
    url: '/restful/note_img/completely_delete_img',
    method: 'delete',
    data,
  })
}
