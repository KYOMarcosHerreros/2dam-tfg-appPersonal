import cliente from './cliente';

export const obtenerHabitos = () => cliente.get('/habitos');
export const obtenerCategorias = () => cliente.get('/habitos/categorias');
export const crearHabitoCatalogo = (datos) => cliente.post('/habitos/catalogo', datos);
export const crearHabitoPersonalizado = (datos) => cliente.post('/habitos/personalizado', datos);
export const crearHabitoPersonalizadoConIA = (datos) => cliente.post('/habitos/personalizado-con-ia', datos);
export const sugerirCategorizacion = (datos) => cliente.post('/habitos/sugerir-categorizacion', datos);
export const actualizarHabito = (id, datos) => cliente.put(`/habitos/${id}`, datos);
export const eliminarHabito = (id) => cliente.delete(`/habitos/${id}`);
export const obtenerRacha = (id) => cliente.get(`/habitos/${id}/racha`);