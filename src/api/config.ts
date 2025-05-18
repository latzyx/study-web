import axios from 'axios'

// API base configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth token here
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const res = response.data
    // 统一处理响应
    if (res.code !== 200) {
      // 处理错误情况
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  (error) => {
    if (error.response) {
      // Handle different error status codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          // Handle forbidden
          break
        case 404:
          // Handle not found
          break
        case 500:
          // Handle server error
          break
      }
    }
    return Promise.reject(error)
  }
) 