import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Bot, User, Loader2, Bell } from 'lucide-react'
import { enviarMensajeIA, obtenerHistorialIA, limpiarHistorialIA, enviarNotificacionDesdeIA } from '../api/asistente'
import toast from 'react-hot-toast'
import './AsistentePage.css'

export default function AsistentePage() {
  const [mensajes, setMensajes] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cargandoHistorial, setCargandoHistorial] = useState(true)
  const mensajesEndRef = useRef(null)

  useEffect(() => {
    cargarHistorial()
    document.title = 'EliasHealthy - HabitosApp'
    return () => {
      document.title = 'HabitosApp'
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Guardar mensajes en localStorage cuando cambien
  useEffect(() => {
    if (mensajes.length > 0 && !cargandoHistorial) {
      localStorage.setItem('chat-mensajes', JSON.stringify(mensajes))
    }
  }, [mensajes, cargandoHistorial])

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const cargarHistorial = async () => {
    try {
      // Primero intentar cargar desde localStorage
      const mensajesGuardados = localStorage.getItem('chat-mensajes')
      if (mensajesGuardados) {
        setMensajes(JSON.parse(mensajesGuardados))
      }

      // Luego cargar desde el servidor (puede tener mensajes más recientes)
      const response = await obtenerHistorialIA()
      if (response.data && response.data.length > 0) {
        setMensajes(response.data)
        localStorage.setItem('chat-mensajes', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('Error al cargar historial:', error)
      // Si falla, mantener los mensajes de localStorage
    } finally {
      setCargandoHistorial(false)
    }
  }

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!mensaje.trim() || cargando) return

    const mensajeUsuario = mensaje.trim()
    setMensaje('')
    setCargando(true)

    // Agregar mensaje del usuario inmediatamente
    const nuevoMensajeUsuario = {
      rol: 'user',
      contenido: mensajeUsuario,
      fechaEnvio: new Date().toISOString()
    }
    setMensajes(prev => [...prev, nuevoMensajeUsuario])

    try {
      console.log('Enviando mensaje:', mensajeUsuario)
      const response = await enviarMensajeIA({ mensaje: mensajeUsuario })
      console.log('Respuesta recibida:', response.data)
      
      // Actualizar con el historial completo del servidor
      if (response.data && response.data.historial) {
        setMensajes(response.data.historial)
      } else if (response.data) {
        // Si no hay historial, usar la respuesta directa
        const mensajeAsistente = {
          rol: 'assistant',
          contenido: response.data.respuesta || response.data,
          fechaEnvio: new Date().toISOString()
        }
        setMensajes(prev => [...prev, mensajeAsistente])
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      console.error('Detalles del error:', error.response?.data)
      // Agregar mensaje de error
      setMensajes(prev => [...prev, {
        rol: 'assistant',
        contenido: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        fechaEnvio: new Date().toISOString()
      }])
    } finally {
      setCargando(false)
    }
  }

  const handleLimpiar = async () => {
    try {
      await limpiarHistorialIA()
      setMensajes([])
      localStorage.removeItem('chat-mensajes')
      toast.success('Historial limpiado')
    } catch (error) {
      console.error('Error al limpiar historial:', error)
      toast.error('Error al limpiar historial')
    }
  }

  const handleEnviarNotificacion = async () => {
    try {
      await enviarNotificacionDesdeIA('💡 Consejo de EliasHealthy: ¡Recuerda mantener la consistencia en tus hábitos! Pequeños pasos diarios generan grandes cambios.')
      toast.success('Notificación enviada')
      // Disparar evento para actualizar el badge
      window.dispatchEvent(new Event('notificacionesActualizadas'))
    } catch (error) {
      console.error('Error al enviar notificación:', error)
      toast.error('Error al enviar notificación')
    }
  }

  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  if (cargandoHistorial) {
    return <div className="cargando">Cargando conversación...</div>
  }

  return (
    <div className="asistente-contenedor">
      <div className="asistente-header">
        <div className="asistente-header-info">
          <div className="asistente-icono-principal">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="asistente-titulo">EliasHealthy</h1>
            <p className="asistente-subtitulo">
              Tu asistente personal de hábitos saludables
            </p>
          </div>
        </div>
        {mensajes.length > 0 && (
          <motion.button
            className="asistente-boton-limpiar"
            onClick={handleLimpiar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Limpiar historial"
          >
            <Trash2 size={18} />
            <span>Limpiar</span>
          </motion.button>
        )}
        <motion.button
          className="asistente-boton-notificacion"
          onClick={handleEnviarNotificacion}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Enviar notificación de prueba"
        >
          <Bell size={18} />
          <span>Enviar notificación</span>
        </motion.button>
      </div>

      <div className="asistente-chat">
        <div className="asistente-mensajes">
          {mensajes.length === 0 ? (
            <div className="asistente-vacio">
              <div className="asistente-vacio-icono">
                <Bot size={64} />
              </div>
              <h3 className="asistente-vacio-titulo">¡Hola! Soy EliasHealthy</h3>
              <p className="asistente-vacio-texto">
                Tu asistente personal de hábitos saludables. Puedo ayudarte con:
              </p>
              <ul className="asistente-sugerencias">
                <li>📊 Analizar tu progreso y estadísticas</li>
                <li>💡 Sugerir nuevos hábitos personalizados</li>
                <li>🎯 Darte consejos para mantener la motivación</li>
                <li>🔥 Ayudarte a mejorar tus rachas</li>
              </ul>
            </div>
          ) : (
            <AnimatePresence>
              {mensajes.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`mensaje ${msg.rol}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mensaje-avatar">
                    {msg.rol === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="mensaje-contenido">
                    <div className="mensaje-texto">{msg.contenido}</div>
                    <div className="mensaje-hora">{formatearFecha(msg.fechaEnvio)}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {cargando && (
            <motion.div
              className="mensaje assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mensaje-avatar">
                <Bot size={20} />
              </div>
              <div className="mensaje-contenido">
                <div className="mensaje-cargando">
                  <Loader2 size={16} className="spinner" />
                  <span>Pensando...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={mensajesEndRef} />
        </div>

        <form className="asistente-input-form" onSubmit={handleEnviar}>
          <input
            type="text"
            className="asistente-input"
            placeholder="Escribe tu mensaje..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            disabled={cargando}
          />
          <motion.button
            type="submit"
            className="asistente-boton-enviar"
            disabled={!mensaje.trim() || cargando}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={20} />
          </motion.button>
        </form>
      </div>
    </div>
  )
}
