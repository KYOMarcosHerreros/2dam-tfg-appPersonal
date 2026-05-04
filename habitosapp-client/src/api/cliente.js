import axios from 'axios'

// Debug: mostrar todas las variables de entorno disponibles
console.log('Variables de entorno disponibles:', import.meta.env)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('NODE_ENV:', import.meta.env.NODE_ENV)
console.log('MODE:', import.meta.env.MODE)

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5161/api'
console.log('URL final que se usará:', baseURL)

const cliente = axios.create({
  baseURL: baseURL,
})

cliente.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('Petición a:', config.baseURL + config.url)
  return config
})

cliente.interceptors.response.use(
  (response) => response,
  (error) =>
    {
    console.error('Error en petición:', error)
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