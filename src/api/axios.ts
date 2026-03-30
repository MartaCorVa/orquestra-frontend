import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  async (error: AxiosError): Promise<never> => Promise.reject(error),
)

export default apiClient