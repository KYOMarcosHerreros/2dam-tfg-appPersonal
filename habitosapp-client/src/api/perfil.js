import cliente from './cliente'

export const obtenerPerfil = () => cliente.get('/perfil')
export const actualizarPerfil = (datos) => cliente.put('/perfil', datos)
