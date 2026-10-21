import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => {
    // Appwrite 使用 session cookie 自动处理认证，此处无需手动添加 token
    return config
  },
  (error) => Promise.reject(error),
)

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 在这里处理全局错误
    return Promise.reject(error)
  },
)

export default request
