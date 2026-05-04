import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Send,
  MoreVertical,
  Edit,
  Trash,
  Flag,
  Eye
} from 'lucide-react'
import { obtenerTema, crearRespuesta, toggleReaccion } from '../api/foroApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './ForoTemaPage.css'

export default function ForoTemaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [tema, setTema] = useState(null)
  const [respuestas, setRespuestas] = useState([])
  const [nuevaRespuesta, setNuevaRespuesta] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    cargarTema()
  }, [id])

  const cargarTema = async () => {
    try {
      setCargando(true)
      const res = await obtenerTema(id)
      setTema(res.data)
      setRespuestas(res.data.respuestas || [])
      document.title = `${res.data.titulo} - Foro`
    } catch (error) {
      console.error('Error cargando tema:', error)
      toast.error('Error al cargar el tema')
      navigate('/foro')
    } finally {
      setCargando(false)
    }
  }

  const handleEnviarRespuesta = async (e) => {
    e.preventDefault()
    
    if (!nuevaRespuesta.trim()) {
      toast.error('Escribe una respuesta')
      return
    }

    try {
      setEnviando(true)
      const res = await crearRespuesta({
        temaId: parseInt(id),
        contenido: nuevaRespuesta
      })
      
      setRespuestas([...respuestas, res.data])
      setNuevaRespuesta('')
      toast.success('Respuesta publicada')
    } catch (error) {
      console.error('Error enviando respuesta:', error)
      toast.error('Error al publicar respuesta')
    } finally {
      setEnviando(false)
    }
  }

  const handleReaccion = async (tipo, temaId = null, respuestaId = null) => {
    try {
      await toggleReaccion(tipo, temaId, respuestaId)
      await cargarTema() // Recargar para actualizar contadores
    } catch (error) {
      console.error('Error con reacción:', error)
      toast.error('Error al reaccionar')
    }
  }

  const obtenerIconoCategoria = (nombre) => {
    const iconos = {
      'General': '💬',
      'Motivación': '🔥',
      'Consejos': '💡',
      'Logros': '🏆',
      'Preguntas': '❓',
      'Salud': '🏃',
      'Productividad': '⚡'
    }
    return iconos[nombre] || '📌'
  }

  if (cargando) {
    return (
      <div className="tema-cargando">
        <div className="tema-cargando-spinner"></div>
        <span>Cargando tema...</span>
      </div>
    )
  }

  if (!tema) {
    return null
  }

  return (
    <div className="tema-contenedor">
      {/* Header con navegación */}
      <motion.div
        className="tema-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="tema-btn-volver" onClick={() => navigate('/foro')}>
          <ArrowLeft size={20} />
          Volver al foro
        </button>
      </motion.div>

      {/* Contenido principal del tema */}
      <motion.div
        className="tema-principal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="tema-principal-header">
          <div className="tema-categoria" style={{ '--cat-color': tema.categoria?.color }}>
            <span>{obtenerIconoCategoria(tema.categoria?.nombre)}</span>
            {tema.categoria?.nombre}
          </div>
          <div className="tema-meta-info">
            <span className="tema-vistas">
              <Eye size={16} />
              {tema.vistas} vistas
            </span>
          </div>
        </div>

        <h1 className="tema-titulo-principal">{tema.titulo}</h1>

        <div className="tema-autor-info">
          <div className="autor-avatar-grande">
            {tema.nombreUsuario?.charAt(0).toUpperCase()}
          </div>
          <div className="autor-detalles">
            <span className="autor-nombre">{tema.nombreUsuario}</span>
            <span className="tema-fecha">
              {new Date(tema.fechaCreacion).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className="tema-contenido">
          <p>{tema.contenido}</p>
        </div>

        <div className="tema-acciones">
          <button
            className={`accion-btn ${tema.reacciones?.some(r => r.usuarioId === usuario?.id) ? 'activo' : ''}`}
            onClick={() => handleReaccion('like', tema.id, null)}
          >
            <Heart size={18} />
            <span>{tema.reacciones?.length || 0}</span>
          </button>
          <button className="accion-btn">
            <MessageCircle size={18} />
            <span>{respuestas.length}</span>
          </button>
        </div>
      </motion.div>

      {/* Respuestas */}
      <div className="tema-respuestas-seccion">
        <h2 className="respuestas-titulo">
          {respuestas.length} {respuestas.length === 1 ? 'Respuesta' : 'Respuestas'}
        </h2>

        <AnimatePresence>
          {respuestas.map((respuesta, index) => (
            <motion.div
              key={respuesta.id}
              className="respuesta-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="respuesta-autor">
                <div className="autor-avatar">
                  {respuesta.nombreUsuario?.charAt(0).toUpperCase()}
                </div>
                <div className="autor-info">
                  <span className="autor-nombre">{respuesta.nombreUsuario}</span>
                  <span className="respuesta-fecha">
                    {new Date(respuesta.fechaCreacion).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div className="respuesta-contenido">
                <p>{respuesta.contenido}</p>
              </div>

              <div className="respuesta-acciones">
                <button
                  className={`accion-btn-small ${respuesta.reacciones?.some(r => r.usuarioId === usuario?.id) ? 'activo' : ''}`}
                  onClick={() => handleReaccion('like', null, respuesta.id)}
                >
                  <Heart size={16} />
                  <span>{respuesta.reacciones?.length || 0}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {respuestas.length === 0 && (
          <div className="respuestas-vacio">
            <MessageCircle size={48} />
            <p>Sé el primero en responder</p>
          </div>
        )}
      </div>

      {/* Formulario de respuesta */}
      <motion.div
        className="tema-responder"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3>Tu respuesta</h3>
        <form onSubmit={handleEnviarRespuesta}>
          <textarea
            value={nuevaRespuesta}
            onChange={(e) => setNuevaRespuesta(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows={5}
            disabled={enviando}
          />
          <div className="responder-footer">
            <span className="responder-info">
              Sé respetuoso y constructivo
            </span>
            <button
              type="submit"
              className="btn-enviar-respuesta"
              disabled={enviando || !nuevaRespuesta.trim()}
            >
              {enviando ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send size={18} />
                  Publicar respuesta
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
