import axios from 'axios'

// create an axios instance
const service = axios.create({
  baseURL: '/restful',
  timeout: 5000,
})

// request interceptor
service.interceptors.request.use(
  config => {
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
      alert(res.message || 'Error')
      return Promise.reject(new Error(res.message || 'Error'))
    }else{
      return res
    }
  },
  error => {
    alert(error.message)
    return Promise.reject(error)
  }
)

export default service
