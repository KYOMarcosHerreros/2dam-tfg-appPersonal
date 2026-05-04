import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { crearTema, obtenerCategorias } from '../api/foroApi'
import toast from 'react-hot-toast'
import './ForoNuevoTemaPage.css'

export default function ForoNuevoTemaPage() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    categoriaId: ''
  })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    document.title = 'Crear Tema - Foro'
    cargarCategorias()
    
    return () => {
      document.title = 'HabitosApp'
    }
  }, [])

  const cargarCategorias = async () => {
    try {
      const res = await obtenerCategorias()
      setCategorias(res.data)
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, categoriaId: res.data[0].id }))
      }
    } catch (error) {
      console.error('Error cargando categorías:', error)
      toast.error('Error al cargar categorías')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio')
      return
    }

    if (!formData.contenido.trim()) {
      toast.error('El contenido es obligatorio')
      return
    }

    if (!formData.categoriaId) {
      toast.error('Selecciona una categoría')
      return
    }

    try {
      setEnviando(true)
      const res = await crearTema({
        titulo: formData.titulo,
        contenido: formData.contenido,
        categoriaId: parseInt(formData.categoriaId)
      })
      
      toast.success('Tema creado exitosamente')
      navigate(`/foro/tema/${res.data.id}`)
    } catch (error) {
      console.error('Error creando tema:', error)
      toast.error('Error al crear el tema')
    } finally {
      setEnviando(false)
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

  return (
    <div className="nuevo-tema-contenedor">
      <motion.div
        className="nuevo-tema-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="btn-volver" onClick={() => navigate('/foro')}>
          <ArrowLeft size={20} />
          Volver al foro
        </button>
      </motion.div>

      <motion.div
        className="nuevo-tema-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="nuevo-tema-titulo-seccion">
          <h1>Crear Nuevo Tema</h1>
          <p>Comparte tus ideas, preguntas o experiencias con la comunidad</p>
        </div>

        <form onSubmit={handleSubmit} className="nuevo-tema-form">
          <div className="form-grupo">
            <label htmlFor="categoria">Categoría</label>
            <div className="categorias-selector">
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`categoria-opcion ${formData.categoriaId === cat.id ? 'activa' : ''}`}
                  onClick={() => setFormData({ ...formData, categoriaId: cat.id })}
                  style={{ '--cat-color': cat.color }}
                >
                  <span className="categoria-icono">{obtenerIconoCategoria(cat.nombre)}</span>
                  <span className="categoria-nombre">{cat.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-grupo">
            <label htmlFor="titulo">Título del tema</label>
            <input
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Escribe un título claro y descriptivo..."
              maxLength={200}
              disabled={enviando}
            />
            <span className="form-ayuda">
              {formData.titulo.length}/200 caracteres
            </span>
          </div>

          <div className="form-grupo">
            <label htmlFor="contenido">Contenido</label>
            <textarea
              id="contenido"
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              placeholder="Describe tu tema con detalle..."
              rows={12}
              disabled={enviando}
            />
            <span className="form-ayuda">
              Sé claro y respetuoso. Proporciona contexto suficiente.
            </span>
          </div>

          <div className="form-acciones">
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => navigate('/foro')}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-publicar"
              disabled={enviando || !formData.titulo.trim() || !formData.contenido.trim()}
            >
              {enviando ? (
                <>Publicando...</>
              ) : (
                <>
                  <Send size={18} />
                  Publicar tema
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        className="nuevo-tema-consejos"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>💡 Consejos para un buen tema</h3>
        <ul>
          <li>✅ Usa un título claro y específico</li>
          <li>✅ Proporciona contexto y detalles</li>
          <li>✅ Sé respetuoso y constructivo</li>
          <li>✅ Revisa antes de publicar</li>
          <li>❌ Evita contenido ofensivo o spam</li>
        </ul>
      </motion.div>
    </div>
  )
}
