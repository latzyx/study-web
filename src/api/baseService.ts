import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { API_BASE_URL, BUSINESS_CODE } from './constants'
import type { ApiResponse } from '@/types/api'

export class BaseService {
  protected readonly http: AxiosInstance

  constructor() {
    this.http = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 请求拦截器
    this.http.interceptors.request.use(
      (config) => {
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

    // 响应拦截器
    this.http.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const res = response.data
        if (res.code !== BUSINESS_CODE.SUCCESS) {
          return Promise.reject(new Error(res.message || 'Error'))
        }
        return response
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.http.get<ApiResponse<T>>(url, { params })
    return response.data.data
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.http.post<ApiResponse<T>>(url, data)
    return response.data.data
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.http.put<ApiResponse<T>>(url, data)
    return response.data.data
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await this.http.delete<ApiResponse<T>>(url)
    return response.data.data
  }

  protected async patch<T>(url: string, data?: any): Promise<T> {
    return this.http.patch(url, data)
  }
} 