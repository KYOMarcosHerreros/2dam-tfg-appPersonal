import cliente from './cliente'

export const obtenerResumenDia = (fecha) => cliente.get(`/registrodiario/${fecha}`)
export const marcarHabito = (datos) => cliente.post('/registrodiario/marcar', datos)