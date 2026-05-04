import cliente from './cliente'

export const enviarMensajeIA = (datos) => cliente.post('/ai/chat', datos)
export const obtenerHistorialIA = () => cliente.get('/ai/historial')
export const limpiarHistorialIA = () => cliente.delete('/ai/historial')
export const generarResumenSemanal = () => cliente.get('/ai/resumen-semanal')
export const enviarNotificacionDesdeIA = (mensaje) => cliente.post('/ai/enviar-notificacion', { mensaje })
