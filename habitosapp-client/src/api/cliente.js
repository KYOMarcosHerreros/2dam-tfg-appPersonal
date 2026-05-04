import axios from 'axios'

const cliente = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5161/api',
})

cliente.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

cliente.interceptors.response.use(
  (response) => response,
  (error) =>
    {
    if (error.response?.status === 401)
    {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default cliente