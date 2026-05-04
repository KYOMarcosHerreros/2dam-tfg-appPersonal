import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  TrendingUp, 
  Clock,
  Users,
  Sparkles,
  Filter,
  X
} from 'lucide-react'
import { obtenerTemas, obtenerCategorias } from '../api/foroApi'
import toast from 'react-hot-toast'
import './ForoPage.css'

export default function ForoPage() {
  const navigate = useNavigate()
  const [temas, setTemas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [ordenar, setOrdenar] = useState('reciente') // reciente, popular, activo
  const [cargando, setCargando] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  useEffect(() => {
    document.title = 'Foro - HabitosApp'
    cargarDatos()
    
    return () => {
      document.title = 'HabitosApp'
    }
  }, [categoriaSeleccionada, ordenar])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      
      // Cargar categorías
      const resCategorias = await obtenerCategorias()
      setCategorias(resCategorias.data)
      
      // Cargar temas
      const params = {}
      if (categoriaSeleccionada) params.categoriaId = categoriaSeleccionada
      if (ordenar === 'popular') params.ordenar = 'vistas'
      if (ordenar === 'activo') params.ordenar = 'respuestas'
      
      const resTemas = await obtenerTemas(params)
      setTemas(resTemas.data)
      
    } catch (error) {
      console.error('Error cargando datos del foro:', error)
      toast.error('Error al cargar el foro')
    } finally {
      setCargando(false)
    }
  }

  const temasFiltrados = temas.filter(tema => 
    tema.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    tema.contenido.toLowerCase().includes(busqueda.toLowerCase())
  )

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
      <div className="foro-cargando">
        <div className="foro-cargando-spinner"></div>
        <span>Cargando foro...</span>
      </div>
    )
  }

  return (
    <div className="foro-contenedor">
      {/* Header del Foro */}
      <motion.div
        className="foro-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="foro-header-contenido">
          <div className="foro-titulo-seccion">
            <MessageSquare size={32} className="foro-icono-principal" />
            <div>
              <h1>Foro de la Comunidad</h1>
              <p>Comparte experiencias, consejos y motiva a otros</p>
            </div>
          </div>
          
          <motion.button
            className="foro-btn-crear"
            onClick={() => navigate('/foro/nuevo')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Crear Tema
          </motion.button>
        </div>
      </motion.div>

      {/* Barra de búsqueda y filtros */}
      <motion.div
        className="foro-controles"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="foro-busqueda">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar temas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="foro-filtros-rapidos">
          <button
            className={`filtro-btn ${ordenar === 'reciente' ? 'activo' : ''}`}
            onClick={() => setOrdenar('reciente')}
          >
            <Clock size={18} />
            Recientes
          </button>
          <button
            className={`filtro-btn ${ordenar === 'popular' ? 'activo' : ''}`}
            onClick={() => setOrdenar('popular')}
          >
            <TrendingUp size={18} />
            Populares
          </button>
          <button
            className={`filtro-btn ${ordenar === 'activo' ? 'activo' : ''}`}
            onClick={() => setOrdenar('activo')}
          >
            <Sparkles size={18} />
            Activos
          </button>
          
          <button
            className="filtro-btn-toggle"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </motion.div>

      {/* Panel de filtros expandible */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            className="foro-panel-filtros"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filtros-categorias">
              <h3>Categorías</h3>
              <div className="categorias-grid">
                <button
                  className={`categoria-chip ${!categoriaSeleccionada ? 'activo' : ''}`}
                  onClick={() => setCategoriaSeleccionada(null)}
                >
                  Todas
                </button>
                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    className={`categoria-chip ${categoriaSeleccionada === cat.id ? 'activo' : ''}`}
                    onClick={() => setCategoriaSeleccionada(cat.id)}
                    style={{ '--cat-color': cat.color }}
                  >
                    <span>{obtenerIconoCategoria(cat.nombre)}</span>
                    {cat.nombre}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de contenido */}
      <div className="foro-grid">
        {/* Lista de temas */}
        <div className="foro-temas-lista">
          {temasFiltrados.length === 0 ? (
            <motion.div
              className="foro-vacio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MessageSquare size={48} />
              <h3>No hay temas aún</h3>
              <p>Sé el primero en iniciar una conversación</p>
              <button
                className="foro-btn-crear-vacio"
                onClick={() => navigate('/foro/nuevo')}
              >
                <Plus size={20} />
                Crear el primer tema
              </button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {temasFiltrados.map((tema, index) => (
                <motion.div
                  key={tema.id}
                  className={`foro-tema-card ${tema.fijado ? 'fijado' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/foro/tema/${tema.id}`)}
                  whileHover={{ scale: 1.02 }}
                >
                  {tema.fijado && (
                    <div className="tema-fijado-badge">
                      📌 Fijado
                    </div>
                  )}
                  
                  <div className="tema-card-header">
                    <div className="tema-categoria" style={{ '--cat-color': tema.categoria?.color }}>
                      <span>{obtenerIconoCategoria(tema.categoria?.nombre)}</span>
                      {tema.categoria?.nombre}
                    </div>
                    <div className="tema-meta">
                      <span className="tema-vistas">👁️ {tema.vistas}</span>
                    </div>
                  </div>

                  <h3 className="tema-titulo">{tema.titulo}</h3>
                  <p className="tema-preview">{tema.contenido}</p>

                  <div className="tema-card-footer">
                    <div className="tema-autor">
                      <div className="autor-avatar">
                        {tema.nombreUsuario?.charAt(0).toUpperCase()}
                      </div>
                      <div className="autor-info">
                        <span className="autor-nombre">{tema.nombreUsuario}</span>
                        <span className="tema-fecha">
                          {new Date(tema.fechaCreacion).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="tema-stats">
                      <span className="stat-item">
                        💬 {tema.respuestas?.length || 0}
                      </span>
                      <span className="stat-item">
                        ❤️ {tema.reacciones?.length || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Sidebar con información */}
        <div className="foro-sidebar">
          <motion.div
            className="sidebar-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3>
              <Users size={20} />
              Estadísticas
            </h3>
            <div className="sidebar-stats">
              <div className="sidebar-stat">
                <span className="stat-numero">{temas.length}</span>
                <span className="stat-label">Temas</span>
              </div>
              <div className="sidebar-stat">
                <span className="stat-numero">
                  {temas.reduce((acc, t) => acc + (t.respuestas?.length || 0), 0)}
                </span>
                <span className="stat-label">Respuestas</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="sidebar-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>
              <Sparkles size={20} />
              Reglas del Foro
            </h3>
            <ul className="sidebar-reglas">
              <li>✅ Sé respetuoso con todos</li>
              <li>✅ Comparte experiencias reales</li>
              <li>✅ Motiva a otros miembros</li>
              <li>❌ No spam ni publicidad</li>
              <li>❌ No contenido ofensivo</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
