import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Flame, 
  TrendingUp, 
  Cloud, 
  Newspaper, 
  CheckCircle, 
  Target,
  Calendar,
  ExternalLink,
  Sparkles,
  Award,
  Check
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './InicioPage.css'

export default function InicioPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [estadisticas, setEstadisticas] = useState(null)
  const [tiempoHoy, setTiempoHoy] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.title = 'Inicio - HabitosApp'
    cargarDatos()
    
    return () => {
      document.title = 'HabitosApp'
    }
  }, [])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('No hay token de autenticación')
        return
      }

      // Función helper para manejar respuestas de API
      const handleApiResponse = async (response, errorMessage) => {
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`${errorMessage}:`, response.status, errorText)
          throw new Error(`${errorMessage}: ${response.status}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text()
          console.error('Respuesta no es JSON:', text)
          throw new Error('La respuesta del servidor no es JSON válido')
        }
        
        return await response.json()
      }

      let estadisticasData = null
      let habitosData = []
      let resumenHoy = null

      // Obtener estadísticas generales reales
      try {
        const responseEstadisticas = await fetch('/api/estadisticas/generales', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        estadisticasData = await handleApiResponse(responseEstadisticas, 'Error al obtener estadísticas')
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error)
        // Usar valores por defecto si falla
        estadisticasData = {
          totalHabitos: 0,
          habitosCompletadosHoy: 0,
          rachaActualMaxima: 0,
          mejorRacha: 0,
          ultimos7Dias: []
        }
      }

      // Obtener hábitos del usuario
      try {
        const responseHabitos = await fetch('/api/habitos', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        habitosData = await handleApiResponse(responseHabitos, 'Error al obtener hábitos')
      } catch (error) {
        console.error('Error obteniendo hábitos:', error)
        habitosData = []
      }

      // Obtener resumen del día de hoy
      try {
        const hoy = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const responseHoy = await fetch(`/api/registrodiario/${hoy}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (responseHoy.ok) {
          resumenHoy = await handleApiResponse(responseHoy, 'Error al obtener resumen del día')
        }
      } catch (error) {
        console.error('Error obteniendo resumen del día:', error)
        resumenHoy = null
      }

      // Calcular días de uso real (desde el backend)
      let diasUso = estadisticasData?.diasUsoReal || 0

      // Calcular hábitos completados esta semana
      let habitosEstaSemana = 0
      if (estadisticasData && estadisticasData.ultimos7Dias) {
        habitosEstaSemana = estadisticasData.ultimos7Dias.reduce((total, dia) => total + dia.habitosCompletados, 0)
      }

      setEstadisticas({
        habitosHoy: estadisticasData?.totalHabitos || 0,
        habitosCompletados: estadisticasData?.habitosCompletadosHoy || 0,
        rachaActual: estadisticasData?.rachaActualMaxima || 0,
        rachaMaxima: estadisticasData?.mejorRacha || 0,
        recordUso: diasUso, // Ahora usa días reales de actividad
        tieneHabitos: habitosData.length > 0,
        habitosEstaSemana: habitosEstaSemana,
        totalHabitos: estadisticasData?.totalHabitos || 0
      })

      // Obtener datos del tiempo (mantener la API externa)
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              const { latitude, longitude } = position.coords
              const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
              )
              
              if (weatherResponse.ok) {
                const weatherData = await weatherResponse.json()
                setTiempoHoy({
                  temperatura: Math.round(weatherData.current_weather.temperature),
                  condicion: getWeatherDescription(weatherData.current_weather.weathercode),
                  ciudad: 'Tu ubicación'
                })
              } else {
                throw new Error('Error en API del tiempo')
              }
            } catch (error) {
              console.error('Error obteniendo datos del tiempo:', error)
              setTiempoHoy({
                temperatura: '--',
                condicion: 'No disponible',
                ciudad: 'Error al obtener tiempo'
              })
            }
          }, () => {
            // Si no se puede obtener la ubicación, usar datos por defecto
            setTiempoHoy({
              temperatura: '--',
              condicion: 'No disponible',
              ciudad: 'Ubicación no disponible'
            })
          })
        } else {
          setTiempoHoy({
            temperatura: '--',
            condicion: 'No disponible',
            ciudad: 'Geolocalización no soportada'
          })
        }
      } catch (error) {
        console.error('Error obteniendo datos del tiempo:', error)
        setTiempoHoy({
          temperatura: '--',
          condicion: 'No disponible',
          ciudad: 'Error al obtener ubicación'
        })
      }

    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar los datos del dashboard')
      
      // Establecer valores por defecto en caso de error general
      setEstadisticas({
        habitosHoy: 0,
        habitosCompletados: 0,
        rachaActual: 0,
        rachaMaxima: 0,
        recordUso: 0,
        tieneHabitos: false,
        habitosEstaSemana: 0,
        totalHabitos: 0
      })
      
      setTiempoHoy({
        temperatura: '--',
        condicion: 'No disponible',
        ciudad: 'Error de conexión'
      })
    } finally {
      setCargando(false)
    }
  }

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve intensa',
      95: 'Tormenta'
    }
    return descriptions[code] || 'Desconocido'
  }

  const obtenerSaludo = () => {
    const hora = new Date().getHours()
    if (hora < 12) return '¡Buenos días'
    if (hora < 18) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  const obtenerMensajeMotivacional = () => {
    if (!estadisticas) return ''
    
    if (!estadisticas.tieneHabitos) {
      return 'Es hora de comenzar tu viaje hacia una vida más saludable'
    }
    
    const porcentaje = (estadisticas.habitosCompletados / estadisticas.habitosHoy) * 100
    
    if (porcentaje === 100) {
      return '¡Increíble! Has completado todos tus hábitos de hoy'
    } else if (porcentaje >= 75) {
      return '¡Vas muy bien! Solo te faltan unos pocos hábitos'
    } else if (porcentaje >= 50) {
      return 'Buen progreso, ¡sigue así!'
    } else {
      return 'Aún tienes tiempo para completar tus hábitos de hoy'
    }
  }

  const abrirNoticias = () => {
    window.open('https://www.bbc.com/mundo', '_blank')
  }

  if (cargando) {
    return (
      <div className="inicio-cargando">
        <div className="inicio-cargando-spinner"></div>
        <span>Cargando tu inicio...</span>
      </div>
    )
  }

  return (
    <div className="inicio-contenedor">
      {/* Header de bienvenida */}
      <motion.div
        className="inicio-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inicio-saludo">
          <h1>{obtenerSaludo()}, {usuario?.nombre}! 👋</h1>
          <p>{obtenerMensajeMotivacional()}</p>
        </div>
      </motion.div>

      {/* Grid de widgets */}
      <div className="inicio-widgets-grid">
        
        {/* Widget de Hábitos - Adaptativo */}
        <motion.div
          className="inicio-widget inicio-widget-principal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onClick={() => navigate('/habitos')}
        >
          {!estadisticas?.tieneHabitos ? (
            <div className="widget-contenido">
              <div className="widget-icono-grande">
                <Plus size={32} />
              </div>
              <h3>Empieza a crear hábitos</h3>
              <p>Da el primer paso hacia una vida más saludable</p>
              <div className="widget-cta">
                <span>Crear mi primer hábito</span>
                <ExternalLink size={16} />
              </div>
            </div>
          ) : (
            <div className="widget-contenido">
              <div className="widget-icono-grande">
                <Target size={32} />
              </div>
              <h3>Sigue creciendo</h3>
              <p>Agrega nuevos hábitos a tu rutina</p>
              <div className="widget-stats">
                <span>{estadisticas.habitosCompletados}/{estadisticas.habitosHoy} hoy</span>
                <div className="widget-progreso">
                  <div 
                    className="widget-progreso-fill"
                    style={{ width: `${(estadisticas.habitosCompletados / estadisticas.habitosHoy) * 100}%` }}
                  ></div>
                  {estadisticas.habitosCompletados === estadisticas.habitosHoy && estadisticas.habitosHoy > 0 && (
                    <div className="widget-progreso-tick">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Widget de Racha Máxima */}
        <motion.div
          className="inicio-widget inicio-widget-racha"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="widget-contenido">
            <div className="widget-header">
              <Flame size={24} />
              <span>Racha Máxima</span>
            </div>
            <div className="widget-numero-grande">
              {estadisticas?.rachaMaxima || 0}
            </div>
            <p>días consecutivos</p>
            <div className="widget-secundario">
              Actual: {estadisticas?.rachaActual || 0} días
            </div>
          </div>
        </motion.div>

        {/* Widget de Record de Uso */}
        <motion.div
          className="inicio-widget inicio-widget-record"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="widget-contenido">
            <div className="widget-header">
              <Award size={24} />
              <span>Record de Uso</span>
            </div>
            <div className="widget-numero-grande">
              {estadisticas?.recordUso || 0}
            </div>
            <p>días usando la app</p>
            <div className="widget-secundario">
              ¡Sigue así! 🎉
            </div>
          </div>
        </motion.div>

        {/* Widget del Tiempo */}
        <motion.div
          className="inicio-widget inicio-widget-tiempo"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onClick={() => navigate('/tiempo')}
        >
          <div className="widget-contenido">
            <div className="widget-header">
              <Cloud size={24} />
              <span>Tiempo Hoy</span>
            </div>
            <div className="widget-tiempo-info">
              <div className="widget-temperatura">
                {tiempoHoy?.temperatura || '--'}°
              </div>
              <div className="widget-tiempo-detalles">
                <p>{tiempoHoy?.condicion || 'Cargando...'}</p>
                <span>{tiempoHoy?.ciudad || 'Tu ubicación'}</span>
              </div>
            </div>
            <div className="widget-cta">
              <span>Ver pronóstico completo</span>
              <ExternalLink size={16} />
            </div>
          </div>
        </motion.div>

        {/* Widget de Noticias */}
        <motion.div
          className="inicio-widget inicio-widget-noticias"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={abrirNoticias}
        >
          <div className="widget-contenido">
            <div className="widget-header">
              <Newspaper size={24} />
              <span>Noticias</span>
            </div>
            <p>Mantente informado con las últimas noticias</p>
            <div className="widget-cta">
              <span>Leer noticias</span>
              <ExternalLink size={16} />
            </div>
          </div>
        </motion.div>

        {/* Widget de Estadísticas Rápidas - Ancho completo */}
        <motion.div
          className="inicio-widget inicio-widget-stats inicio-widget-ancho-completo"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onClick={() => navigate('/estadisticas')}
        >
          <div className="widget-contenido">
            <div className="widget-header">
              <TrendingUp size={24} />
              <span>Esta Semana</span>
            </div>
            <div className="widget-stats-grid">
              <div className="stat-item">
                <span className="stat-numero">{estadisticas?.habitosEstaSemana || 0}</span>
                <span className="stat-label">Completados</span>
              </div>
              <div className="stat-item">
                <span className="stat-numero">{estadisticas?.totalHabitos || 0}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
            <div className="widget-cta">
              <span>Ver estadísticas</span>
              <ExternalLink size={16} />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}