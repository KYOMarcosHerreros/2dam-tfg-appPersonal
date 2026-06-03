import cliente from './cliente'

// Nuestras categorías simuladas para que la web no falle al cargar
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
  // 1. Asumimos 'General' por defecto
  let nombreCategoria = 'General';

  // 2. Buscamos el nombre real de la categoría si nos llega un número
  if (typeof tema.categoria === 'number' || typeof tema.categoriaId === 'number') {
    const idBusqueda = tema.categoria || tema.categoriaId;
    const catEncontrada = categoriasMock.find(c => c.id === idBusqueda);
    if (catEncontrada) nombreCategoria = catEncontrada.nombre;
  } 
  // 3. Si ya es texto, lo usamos directamente
  else if (typeof tema.categoria === 'string') {
    nombreCategoria = tema.categoria;
  }

  // 4. Empaquetamos los datos con campos "dummy" para pasar la validación estricta de C#
  const temaSeguro = {
    id: 0,                                   // Dato dummy requerido por C#
    titulo: tema.titulo,
    contenido: tema.contenido,
    categoria: nombreCategoria,
    usuarioId: 0,                            // Dato dummy (El backend pondrá el de tu token)
    fechaCreacion: new Date().toISOString()  // Dato dummy (El backend pondrá la fecha real)
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
// Simulación temporal para que no crashee si alguien le da a "me gusta"
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