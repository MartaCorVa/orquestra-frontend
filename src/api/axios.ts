import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

import { getAccessToken, removeAccessToken } from '../utils/storage'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  async (error: AxiosError): Promise<never> => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<never> => {
    if (error.response?.status === 401) {
      removeAccessToken()
    }

    return Promise.reject(error)
  },
)

export default apiClient