import cliente from './cliente'

export const obtenerEstadisticasGenerales = () => cliente.get('/estadisticas/generales')
export const obtenerEstadisticasPorHabito = (fechaInicio, fechaFin) => 
  cliente.get('/estadisticas/habitos', { params: { fechaInicio, fechaFin } })
export const obtenerMapaCalor = (dias = 90) => 
  cliente.get('/estadisticas/mapa-calor', { params: { dias } })
