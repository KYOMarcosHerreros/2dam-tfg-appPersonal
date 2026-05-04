import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Flame, Trophy, Calendar, RefreshCw } from 'lucide-react'
import { obtenerEstadisticasGenerales, obtenerMapaCalor } from '../api/estadisticas'
import GraficoSemanal from '../components/stats/GraficoSemanal'
import GraficoCircular from '../components/stats/GraficoCircular'
import MapaCalor from '../components/stats/MapaCalor'
import './EstadisticasPage.css'

export default function EstadisticasPage() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [mapaCalor, setMapaCalor] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const [resEstadisticas, resMapaCalor] = await Promise.all([
        obtenerEstadisticasGenerales(),
        obtenerMapaCalor(90)
      ])
      console.log('Estadísticas cargadas:', resEstadisticas.data)
      console.log('Mapa de calor cargado:', resMapaCalor.data)
      setEstadisticas(resEstadisticas.data)
      setMapaCalor(resMapaCalor.data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
      // Establecer datos vacíos en caso de error
      setEstadisticas({
        totalHabitos: 0,
        habitosCompletadosHoy: 0,
        porcentajeHoy: 0,
        mejorRacha: 0,
        rachaActualMaxima: 0,
        ultimos7Dias: []
      })
      setMapaCalor([])
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return <div className="cargando">Cargando estadísticas...</div>
  }

  // Mostrar mensaje si no hay hábitos
  if (!estadisticas || estadisticas.totalHabitos === 0) {
    return (
      <div className="estadisticas-contenedor">
        <div className="estadisticas-header">
          <div>
            <h1 className="estadisticas-titulo">
              <TrendingUp size={28} />
              Estadísticas
            </h1>
            <p className="estadisticas-subtitulo">
              Visualiza tu progreso y mantén la motivación
            </p>
          </div>
          <motion.button
            className="estadisticas-boton-recargar"
            onClick={cargarEstadisticas}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Recargar estadísticas"
          >
            <RefreshCw size={18} />
            <span>Actualizar</span>
          </motion.button>
        </div>
        <div className="estadisticas-vacio">
          <div className="estadisticas-vacio-icono">📊</div>
          <h3 className="estadisticas-vacio-titulo">No hay estadísticas aún</h3>
          <p className="estadisticas-vacio-texto">
            Crea algunos hábitos y empieza a marcarlos como completados para ver tus estadísticas aquí.
            <br /><br />
            Si ya marcaste hábitos, haz clic en "Actualizar" para recargar los datos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="estadisticas-contenedor">
      <div className="estadisticas-header">
        <div>
          <h1 className="estadisticas-titulo">
            <TrendingUp size={28} />
            Estadísticas
          </h1>
          <p className="estadisticas-subtitulo">
            Visualiza tu progreso y mantén la motivación
          </p>
        </div>
        <motion.button
          className="estadisticas-boton-recargar"
          onClick={cargarEstadisticas}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Recargar estadísticas"
        >
          <RefreshCw size={18} />
          <span>Actualizar</span>
        </motion.button>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="estadisticas-metricas">
        <motion.div 
          className="metrica-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="metrica-icono" style={{ background: 'linear-gradient(135deg, #7c6aff, #ff6ab0)' }}>
            <Target size={24} />
          </div>
          <div className="metrica-info">
            <span className="metrica-valor">{estadisticas.totalHabitos}</span>
            <span className="metrica-label">Hábitos activos</span>
          </div>
        </motion.div>

        <motion.div 
          className="metrica-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="metrica-icono" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
            <Calendar size={24} />
          </div>
          <div className="metrica-info">
            <span className="metrica-valor">{estadisticas.habitosCompletadosHoy}/{estadisticas.totalHabitos}</span>
            <span className="metrica-label">Completados hoy</span>
          </div>
        </motion.div>

        <motion.div 
          className="metrica-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="metrica-icono" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
            <Flame size={24} />
          </div>
          <div className="metrica-info">
            <span className="metrica-valor">{estadisticas.rachaActualMaxima}</span>
            <span className="metrica-label">Racha actual</span>
          </div>
        </motion.div>

        <motion.div 
          className="metrica-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="metrica-icono" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
            <Trophy size={24} />
          </div>
          <div className="metrica-info">
            <span className="metrica-valor">{estadisticas.mejorRacha}</span>
            <span className="metrica-label">Récord histórico</span>
          </div>
        </motion.div>
      </div>

      {/* Gráficos principales */}
      <div className="estadisticas-graficos">
        <motion.div 
          className="grafico-card grafico-grande"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="grafico-titulo">Progreso últimos 7 días</h3>
          <GraficoSemanal datos={estadisticas.ultimos7Dias} />
        </motion.div>

        <motion.div 
          className="grafico-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="grafico-titulo">Completitud hoy</h3>
          <GraficoCircular 
            porcentaje={estadisticas.porcentajeHoy}
            completados={estadisticas.habitosCompletadosHoy}
            total={estadisticas.totalHabitos}
          />
        </motion.div>
      </div>

      {/* Mapa de calor */}
      <motion.div 
        className="grafico-card grafico-completo"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="grafico-titulo">Actividad últimos 90 días</h3>
        <MapaCalor datos={mapaCalor} />
      </motion.div>
    </div>
  )
}
