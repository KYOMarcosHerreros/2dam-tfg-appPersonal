import axios from 'axios'

// URL de la API del foro (microservicio separado)
const FORO_API_URL = import.meta.env.VITE_FORO_API_URL || 'http://localhost:5001/api'

const foroApi = axios.create({
  baseURL: FORO_API_URL,
})

// Interceptor para añadir el token JWT automáticamente
foroApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
foroApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ CATEGORÍAS ============
export const obtenerCategorias = () => foroApi.get('/categorias')

// ============ TEMAS ============
export const obtenerTemas = (params = {}) => 
  foroApi.get('/temas', { params })

export const obtenerTema = (id) => 
  foroApi.get(`/temas/${id}`)

export const crearTema = (tema) => 
  foroApi.post('/temas', tema)

export const editarTema = (id, tema) => 
  foroApi.put(`/temas/${id}`, tema)

export const eliminarTema = (id) => 
  foroApi.delete(`/temas/${id}`)

export const buscarTemas = (query) => 
  foroApi.get('/temas/buscar', { params: { q: query } })

// ============ RESPUESTAS ============
export const crearRespuesta = (respuesta) => 
  foroApi.post('/respuestas', respuesta)

export const editarRespuesta = (id, respuesta) => 
  foroApi.put(`/respuestas/${id}`, respuesta)

export const eliminarRespuesta = (id) => 
  foroApi.delete(`/respuestas/${id}`)

// ============ REACCIONES ============
export const toggleReaccion = (tipo, temaId = null, respuestaId = null) => 
  foroApi.post('/reacciones/toggle', { tipo, temaId, respuestaId })

export default foroApi
