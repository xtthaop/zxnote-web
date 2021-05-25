import axios from 'axios'
import { getToken, removeToken } from '@/utils/auth'
import { message } from '@/components/message.js'
import { messagebox } from '@/components/messagebox'

// create an axios instance
const service = axios.create({
  baseURL: '/restful',
  timeout: 30000,
})

// request interceptor
service.interceptors.request.use(
  config => {
    const token = getToken()
    if(token){
      config.headers['X-Token'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data

    // if the custom code is not 0, it is judged as an error.
    if(res.code !== 0){
      message.error(res.message || 'Error')
      return Promise.reject(res || new Error('Error'))
    }else{
      return res
    }
  },
  error => {
    if (error.response.status === 401) {
      messagebox.warning('提示', '登录验证失败，请重新登录', {
        showCancelButton: false,
      }).then(() => {
        removeToken()
        location.reload()
      })
    }else{
      message.error(error.response.data.message || error.message || 'Error')
    }
    return Promise.reject(error)
  }
)

export default service
