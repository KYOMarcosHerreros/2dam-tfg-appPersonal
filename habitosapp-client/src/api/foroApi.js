import cliente from './cliente' // Importamos el cliente principal que ya tiene la URL correcta y el token

// ============ CATEGORÍAS ============
// OJO: Si no tienes tabla de categorías en el backend del foro, 
// puedes dejar que use un array temporal aquí o devolver los temas filtrados.
export const obtenerCategorias = () => Promise.resolve({ data: [
  { id: 1, nombre: 'General', color: '#3b82f6' },
  { id: 2, nombre: 'Ejercicios', color: '#10b981' },
  { id: 3, nombre: 'Productividad', color: '#8b5cf6' }
]}); // <-- Simulado temporalmente para que no dé error si no tienes la tabla en .NET

// ============ TEMAS ============
export const obtenerTemas = (params = {}) => 
  cliente.get('/foro/temas', { params }) // Usamos "cliente.get" en lugar de "foroApi.get"

export const obtenerTema = (id) => 
  cliente.get(`/foro/temas/${id}`)

export const crearTema = (tema) => 
  cliente.post('/foro/temas', tema)

export const editarTema = (id, tema) => 
  cliente.put(`/foro/temas/${id}`, tema)

export const eliminarTema = (id) => 
  cliente.delete(`/foro/temas/${id}`)

export const buscarTemas = (query) => 
  cliente.get('/foro/temas/buscar', { params: { q: query } })

// ============ RESPUESTAS ============
export const crearRespuesta = (respuesta) => 
  cliente.post('/foro/respuestas', respuesta)

export const editarRespuesta = (id, respuesta) => 
  cliente.put(`/foro/respuestas/${id}`, respuesta)

export const eliminarRespuesta = (id) => 
  cliente.delete(`/foro/respuestas/${id}`)

// ============ REACCIONES ============
// Si no creamos tabla de reacciones en el backend, dejamos esto como simulación para que no crashee la web
export const toggleReaccion = (tipo, temaId = null, respuestaId = null) => 
  Promise.resolve({ data: { success: true } })

export default {
  obtenerCategorias,
  obtenerTemas,
  obtenerTema,
  crearTema,
  editarTema,
  eliminarTema,
  buscarTemas,
  crearRespuesta,
  editarRespuesta,
  eliminarRespuesta,
  toggleReaccion
}