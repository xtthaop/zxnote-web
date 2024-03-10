import request from '@/utils/request'

// 获取验证码
export function getCaptcha() {
  return request({
    url: '/restful/permission/get_captcha',
    method: 'get',
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/restful/permission/login',
    method: 'post',
    data,
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/restful/permission/get_user_info',
    method: 'get',
  })
}

// 用户修改密码
export function changePassword(data) {
  return request({
    url: '/restful/permission/change_password',
    method: 'put',
    data,
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/restful/permission/logout',
    method: 'post',
  })
}
