import request from '@/utils/request'

export function getCaptcha(){
  return request({
    url: '/permission/get_captcha',
    method: 'get',
  })
}

export function login(data){
  return request({
    url: '/permission/login',
    method: 'post',
    data
  })
}

export function getUserInfo(){
  return request({
    url: '/permission/get_user_info',
    method: 'get',
  })
}
