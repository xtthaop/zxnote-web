import request from '@/utils/request'

export function getCaptcha(){
  return request({
    url: '/permission/get_captcha',
    method: 'get',
  })
}