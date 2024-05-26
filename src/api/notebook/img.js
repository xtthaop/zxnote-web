import request from '@/utils/request'

// 新增笔记
export function getBackupImgs() {
  return request({
    url: '/restful/note_img/get_backup_imgs',
    method: 'get',
  })
}
