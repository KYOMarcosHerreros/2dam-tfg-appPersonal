import cliente from './cliente'

export const obtenerNotificaciones = () => cliente.get('/notificaciones')
export const marcarComoLeida = (id) => cliente.put(`/notificaciones/${id}/leer`)
export const marcarTodasComoLeidas = () => cliente.put('/notificaciones/leer-todas')
export const eliminarNotificacion = (id) => cliente.delete(`/notificaciones/eliminar/${id}`)
