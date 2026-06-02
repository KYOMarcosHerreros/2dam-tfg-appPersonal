import cliente from './cliente'

// Nuestras categorías simuladas para que la web no falle
const categoriasMock = [
  { id: 1, nombre: 'General', color: '#3b82f6' },
  { id: 2, nombre: 'Ejercicios', color: '#10b981' },
  { id: 3, nombre: 'Productividad', color: '#8b5cf6' }
];

export const obtenerCategorias = () => Promise.resolve({ data: categoriasMock });

// ============ TEMAS ============
export const obtenerTemas = (params = {}) => cliente.get('/foro/temas', { params })

export const obtenerTema = (id) => cliente.get(`/foro/temas/${id}`)

export const crearTema = (tema) => {
  // 1. Empezamos asumiendo 'General' por si acaso
  let nombreCategoria = 'General';

  // 2. Si React nos envía un número (el ID), buscamos su nombre real
  if (typeof tema.categoria === 'number' || typeof tema.categoriaId === 'number') {
    const idBusqueda = tema.categoria || tema.categoriaId;
    const catEncontrada = categoriasMock.find(c => c.id === idBusqueda);
    if (catEncontrada) nombreCategoria = catEncontrada.nombre;
  } 
  // 3. Si ya nos lo envía como texto, lo dejamos tal cual
  else if (typeof tema.categoria === 'string') {
    nombreCategoria = tema.categoria;
  }

  // 4. Empaquetamos los datos exactamente como le gustan a C#
  const temaSeguro = {
    titulo: tema.titulo,
    contenido: tema.contenido,
    categoria: nombreCategoria
  };

  return cliente.post('/foro/temas', temaSeguro);
}

export const editarTema = (id, tema) => cliente.put(`/foro/temas/${id}`, tema)

export const eliminarTema = (id) => cliente.delete(`/foro/temas/${id}`)

export const buscarTemas = (query) => cliente.get('/foro/temas/buscar', { params: { q: query } })


// ============ RESPUESTAS ============
export const crearRespuesta = (respuesta) => cliente.post('/foro/respuestas', respuesta)

export const editarRespuesta = (id, respuesta) => cliente.put(`/foro/respuestas/${id}`, respuesta)

export const eliminarRespuesta = (id) => cliente.delete(`/foro/respuestas/${id}`)


// ============ REACCIONES ============
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