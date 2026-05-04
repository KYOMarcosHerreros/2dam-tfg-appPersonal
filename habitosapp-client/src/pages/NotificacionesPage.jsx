import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, Trash2, Inbox } from 'lucide-react'
import { obtenerNotificaciones, marcarComoLeida, marcarTodasComoLeidas, eliminarNotificacion } from '../api/notificaciones'
import toast from 'react-hot-toast'
import './NotificacionesPage.css'

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas') // 'todas', 'noLeidas', 'leidas'

  useEffect(() => {
    cargarNotificaciones()
    document.title = 'Notificaciones - HabitosApp'
    return () => {
      document.title = 'HabitosApp'
    }
  }, [])

  const cargarNotificaciones = async () => {
    try {
      setCargando(true)
      const response = await obtenerNotificaciones()
      setNotificaciones(response.data)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      toast.error('Error al cargar notificaciones')
    } finally {
      setCargando(false)
    }
  }

  const handleMarcarLeida = async (id) => {
    try {
      await marcarComoLeida(id)
      setNotificaciones(notificaciones.map(n => 
        n.id === id ? { ...n, leida: true } : n
      ))
      // Disparar evento personalizado para actualizar el badge del menú
      window.dispatchEvent(new Event('notificacionesActualizadas'))
      toast.success('Notificación marcada como leída')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al marcar notificación')
    }
  }

  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasComoLeidas()
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })))
      // Disparar evento personalizado para actualizar el badge del menú
      window.dispatchEvent(new Event('notificacionesActualizadas'))
      toast.success('Todas las notificaciones marcadas como leídas')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al marcar notificaciones')
    }
  }

  const handleEliminar = async (id) => {
    try {
      await eliminarNotificacion(id)
      setNotificaciones(notificaciones.filter(n => n.id !== id))
      // Disparar evento personalizado para actualizar el badge del menú
      window.dispatchEvent(new Event('notificacionesActualizadas'))
      toast.success('Notificación eliminada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar notificación')
    }
  }

  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === 'noLeidas') return !n.leida
    if (filtro === 'leidas') return n.leida
    return true
  })

  const noLeidas = notificaciones.filter(n => !n.leida).length

  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    const ahora = new Date()
    const diff = ahora - date
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (minutos < 1) return 'Ahora'
    if (minutos < 60) return `Hace ${minutos} min`
    if (horas < 24) return `Hace ${horas}h`
    if (dias < 7) return `Hace ${dias}d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const getIconoTipo = (tipo) => {
    if (tipo === 'inactividad') return '⏰'
    if (tipo === 'racha') return '🔥'
    if (tipo === 'logro') return '🏆'
    if (tipo === 'consejo') return '💡'
    return '🔔'
  }

  if (cargando) {
    return <div className="notificaciones-cargando">Cargando notificaciones...</div>
  }

  return (
    <div className="notificaciones-contenedor">
      <div className="notificaciones-header">
        <div className="notificaciones-header-info">
          <div className="notificaciones-icono-principal">
            <Bell size={28} />
            {noLeidas > 0 && (
              <span className="notificaciones-badge">{noLeidas}</span>
            )}
          </div>
          <div>
            <h1 className="notificaciones-titulo">Notificaciones</h1>
            <p className="notificaciones-subtitulo">
              {noLeidas > 0 
                ? `Tienes ${noLeidas} notificación${noLeidas > 1 ? 'es' : ''} sin leer`
                : 'No tienes notificaciones sin leer'}
            </p>
          </div>
        </div>
        {noLeidas > 0 && (
          <motion.button
            className="notificaciones-boton-marcar-todas"
            onClick={handleMarcarTodasLeidas}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCheck size={18} />
            <span>Marcar todas como leídas</span>
          </motion.button>
        )}
      </div>

      <div className="notificaciones-filtros">
        <button
          className={`filtro-boton ${filtro === 'todas' ? 'activo' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          Todas ({notificaciones.length})
        </button>
        <button
          className={`filtro-boton ${filtro === 'noLeidas' ? 'activo' : ''}`}
          onClick={() => setFiltro('noLeidas')}
        >
          Sin leer ({noLeidas})
        </button>
        <button
          className={`filtro-boton ${filtro === 'leidas' ? 'activo' : ''}`}
          onClick={() => setFiltro('leidas')}
        >
          Leídas ({notificaciones.length - noLeidas})
        </button>
      </div>

      <div className="notificaciones-lista">
        {notificacionesFiltradas.length === 0 ? (
          <div className="notificaciones-vacio">
            <Inbox size={64} className="notificaciones-vacio-icono" />
            <h3 className="notificaciones-vacio-titulo">
              {filtro === 'noLeidas' 
                ? '¡Todo al día!' 
                : filtro === 'leidas'
                ? 'No hay notificaciones leídas'
                : 'No tienes notificaciones'}
            </h3>
            <p className="notificaciones-vacio-texto">
              {filtro === 'noLeidas'
                ? 'No tienes notificaciones pendientes'
                : 'Aquí aparecerán tus notificaciones y recordatorios'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {notificacionesFiltradas.map((notif, index) => (
              <motion.div
                key={notif.id}
                className={`notificacion-item ${!notif.leida ? 'no-leida' : 'leida'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="notificacion-icono">
                  {getIconoTipo(notif.tipo)}
                </div>
                <div className="notificacion-contenido">
                  <p className="notificacion-mensaje">{notif.mensaje}</p>
                  <span className="notificacion-fecha">{formatearFecha(notif.fechaCreacion)}</span>
                </div>
                <div className="notificacion-acciones">
                  {!notif.leida ? (
                    <motion.button
                      className="notificacion-boton-marcar"
                      onClick={() => handleMarcarLeida(notif.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Marcar como leída"
                    >
                      <Check size={16} />
                    </motion.button>
                  ) : (
                    <div className="notificacion-leida-icono" title="Leída">
                      <Check size={16} />
                    </div>
                  )}
                  <motion.button
                    className="notificacion-boton-eliminar"
                    onClick={() => handleEliminar(notif.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Eliminar notificación"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
