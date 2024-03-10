// 字符串驼峰转横线
export function toHorizontalLine(str) {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

// md5密码
import md5 from 'js-md5'
export function md5Password(password, salt = 'ZX@2024!') {
  return md5(password + salt)
}
