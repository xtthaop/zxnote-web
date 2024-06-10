import axios from 'axios'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'
import { ElMessageBox, ElMessage } from 'element-plus'

let messageBoxFlag = 0

const service = axios.create({
  baseURL: '',
  // timeout: 5000,
  // `validateStatus` 定义了对于给定的 HTTP 状态码是 resolve 还是 reject promise，
  // 如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，
  // 则 promise 将会 resolved，否则是 rejected。
  // validateStatus: function (status) {
  //   return status >= 200 && status < 300; // 默认值
  // },
})

service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['X-Token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
      })

      return Promise.reject(res || 'Error')
    } else {
      return res
    }
  },
  (error) => {
    if (!error.response) {
      // 被取消的请求没有响应体
      return Promise.reject(error)
    }

    if (error.response.status === 401) {
      if (messageBoxFlag === 0) {
        messageBoxFlag = 1
        ElMessageBox.confirm('您的登录状态已失效，请重新登录', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          'show-close': false,
          'close-on-click-modal': false,
          type: 'warning',
        })
          .then(async () => {
            messageBoxFlag = 0
            removeToken()
            router.push('/login')
          })
          .catch(() => {
            messageBoxFlag = 0
          })
      }
    } else {
      ElMessage({
        message: error.response.data?.message || error.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
        showClose: true,
      })
    }

    return Promise.reject(error)
  }
)

export default service
