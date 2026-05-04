import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  MapPin,
  RefreshCw,
  Calendar,
  Search,
  X,
  Navigation,
  Bot,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import './TiempoPage.css'

export default function TiempoPage() {
  const [tiempoData, setTiempoData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [ubicacion, setUbicacion] = useState(null)
  const [ubicacionOriginal, setUbicacionOriginal] = useState(null) // Guardar la ubicación original del usuario
  const [error, setError] = useState(null)
  const [mostrarBuscador, setMostrarBuscador] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false)

  useEffect(() => {
    document.title = 'Pronóstico del Tiempo - HabitosApp'
    obtenerUbicacionYTiempo()
    
    return () => {
      document.title = 'HabitosApp'
    }
  }, [])

  const obtenerUbicacionYTiempo = async () => {
    try {
      setCargando(true)
      setError(null)
      
      // Obtener ubicación del usuario
      const posicion = await obtenerUbicacion()
      setUbicacion(posicion)
      setUbicacionOriginal(posicion) // Guardar como ubicación original
      
      // Obtener datos del tiempo
      await obtenerDatosTiempo(posicion.lat, posicion.lon)
    } catch (error) {
      console.error('Error al obtener datos del tiempo:', error)
      setError(error.message)
      toast.error('Error al cargar el pronóstico del tiempo')
    } finally {
      setCargando(false)
    }
  }

  const obtenerUbicacion = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no está soportada por este navegador'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          // Si falla la geolocalización, usar Madrid como ubicación por defecto
          console.warn('Error de geolocalización, usando Madrid por defecto:', error)
          resolve({
            lat: 40.4168,
            lon: -3.7038,
            ciudad: 'Madrid, España'
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      )
    })
  }

  const obtenerDatosTiempo = async (lat, lon) => {
    try {
      // Usar Open-Meteo API que es completamente gratuita y ofrece 6 días de pronóstico
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,relative_humidity_2m_max&timezone=auto&forecast_days=6`
      )
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del tiempo')
      }
      
      const data = await response.json()
      
      // También obtener información de la ubicación
      const geoResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
      )
      
      let ciudadInfo = { ciudad: 'Tu ubicación', pais: '' }
      if (geoResponse.ok) {
        // Para obtener el nombre de la ciudad, usaremos reverse geocoding
        try {
          const reverseGeoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`
          )
          if (reverseGeoResponse.ok) {
            const geoData = await reverseGeoResponse.json()
            ciudadInfo = {
              ciudad: geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Tu ubicación',
              pais: geoData.address?.country || ''
            }
          }
        } catch (error) {
          console.warn('Error obteniendo nombre de ciudad:', error)
        }
      }
      
      setTiempoData(procesarDatosOpenMeteo(data, ciudadInfo))
    } catch (error) {
      console.warn('Error con API del tiempo, usando datos simulados:', error)
      // Si falla la API, usar datos simulados
      const datosSimulados = generarDatosSimulados()
      setTiempoData(datosSimulados)
    }
  }

  const procesarDatosOpenMeteo = (data, ciudadInfo) => {
    const hoy = new Date()
    const pronostico = []
    
    // Procesar los 6 días de pronóstico
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(data.daily.time[i])
      const weatherCode = data.daily.weathercode[i]
      
      pronostico.push({
        fecha: fecha,
        condicion: mapearCondicionOpenMeteo(weatherCode),
        icono: obtenerIconoCondicion(mapearCondicionOpenMeteo(weatherCode)),
        temperaturaMax: Math.round(data.daily.temperature_2m_max[i]),
        temperaturaMin: Math.round(data.daily.temperature_2m_min[i]),
        humedad: data.daily.relative_humidity_2m_max[i] || 50,
        viento: Math.round(data.daily.windspeed_10m_max[i]),
        precipitacion: data.daily.precipitation_probability_max[i] || 0,
        descripcion: obtenerDescripcionOpenMeteo(weatherCode)
      })
    }
    
    return {
      ciudad: ciudadInfo.ciudad,
      pais: ciudadInfo.pais,
      pronostico: pronostico
    }
  }

  const mapearCondicionOpenMeteo = (codigo) => {
    // Códigos WMO Weather interpretation codes
    if ([0, 1].includes(codigo)) return 'soleado' // Clear sky, mainly clear
    if ([2, 3].includes(codigo)) return 'nublado' // Partly cloudy, overcast
    if ([45, 48].includes(codigo)) return 'nublado' // Fog
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return 'lluvia' // Drizzle, rain, showers
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return 'nieve' // Snow
    if ([95, 96, 99].includes(codigo)) return 'tormenta' // Thunderstorm
    return 'nublado'
  }

  const obtenerDescripcionOpenMeteo = (codigo) => {
    const descripciones = {
      0: 'Cielo despejado',
      1: 'Principalmente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna intensa',
      56: 'Llovizna helada ligera',
      57: 'Llovizna helada intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      66: 'Lluvia helada ligera',
      67: 'Lluvia helada intensa',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve intensa',
      77: 'Granizo',
      80: 'Chubascos ligeros',
      81: 'Chubascos moderados',
      82: 'Chubascos intensos',
      85: 'Chubascos de nieve ligeros',
      86: 'Chubascos de nieve intensos',
      95: 'Tormenta',
      96: 'Tormenta con granizo ligero',
      99: 'Tormenta con granizo intenso'
    }
    return descripciones[codigo] || 'Condiciones variables'
  }

  const obtenerIconoCondicion = (condicion) => {
    const iconos = {
      soleado: Sun,
      nublado: Cloud,
      lluvia: CloudRain,
      nieve: CloudSnow,
      tormenta: CloudLightning
    }
    return iconos[condicion] || Cloud
  }

  const generarDatosSimulados = () => {
    const condiciones = ['soleado', 'nublado', 'lluvia', 'nieve', 'tormenta']
    
    const hoy = new Date()
    const datos = []
    
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(hoy)
      fecha.setDate(hoy.getDate() + i)
      
      const condicion = condiciones[Math.floor(Math.random() * condiciones.length)]
      const tempMax = Math.floor(Math.random() * 15) + 15 // 15-30°C
      const tempMin = tempMax - Math.floor(Math.random() * 10) - 5 // 5-10°C menos
      
      datos.push({
        fecha: fecha,
        condicion: condicion,
        icono: obtenerIconoCondicion(condicion),
        temperaturaMax: tempMax,
        temperaturaMin: tempMin,
        humedad: Math.floor(Math.random() * 40) + 40, // 40-80%
        viento: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        precipitacion: condicion === 'lluvia' || condicion === 'tormenta' || condicion === 'nieve'
          ? Math.floor(Math.random() * 80) + 10 
          : 0,
        descripcion: obtenerDescripcion(condicion)
      })
    }
    
    return {
      ciudad: ubicacion?.ciudad || 'Tu ubicación',
      pais: 'España',
      pronostico: datos
    }
  }

  const obtenerDescripcion = (condicion) => {
    const descripciones = {
      soleado: 'Cielo despejado',
      nublado: 'Parcialmente nublado',
      lluvia: 'Lluvia ligera',
      nieve: 'Nieve ligera',
      tormenta: 'Tormentas eléctricas'
    }
    return descripciones[condicion] || 'Condiciones variables'
  }

  const formatearFecha = (fecha) => {
    const hoy = new Date()
    const manana = new Date(hoy)
    manana.setDate(hoy.getDate() + 1)
    
    if (fecha.toDateString() === hoy.toDateString()) {
      return 'Hoy'
    } else if (fecha.toDateString() === manana.toDateString()) {
      return 'Mañana'
    } else {
      return fecha.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short'
      })
    }
  }

  const obtenerColorCondicion = (condicion) => {
    const colores = {
      soleado: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      nublado: 'linear-gradient(135deg, #6b7280, #4b5563)',
      lluvia: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      nieve: 'linear-gradient(135deg, #e5e7eb, #9ca3af)',
      tormenta: 'linear-gradient(135deg, #7c3aed, #5b21b6)'
    }
    return colores[condicion] || colores.nublado
  }

  const generarConsejos = (pronostico) => {
    const consejos = []
    const diasSoleados = pronostico.filter(dia => dia.condicion === 'soleado').length
    const diasLluviosos = pronostico.filter(dia => dia.condicion === 'lluvia' || dia.condicion === 'tormenta').length
    const tempPromedio = pronostico.reduce((acc, dia) => acc + dia.temperaturaMax, 0) / pronostico.length

    if (diasSoleados >= 3) {
      consejos.push({
        icono: Sun,
        titulo: 'Días soleados',
        descripcion: 'Excelente periodo para actividades al aire libre. Aprovecha para correr, caminar o hacer ejercicio en el parque.'
      })
    }

    if (diasLluviosos >= 2) {
      consejos.push({
        icono: CloudRain,
        titulo: 'Días de lluvia',
        descripcion: 'Planifica actividades en interiores. Perfecto para yoga en casa, ejercicios de fuerza o meditación.'
      })
    }

    if (tempPromedio > 25) {
      consejos.push({
        icono: Thermometer,
        titulo: 'Temperaturas altas',
        descripcion: 'Evita ejercitarte en las horas más calurosas (12-16h). Hidrátate bien y busca sombra.'
      })
    } else if (tempPromedio < 10) {
      consejos.push({
        icono: Wind,
        titulo: 'Temperaturas bajas',
        descripcion: 'Abrígate bien para actividades al aire libre. Perfecto para deportes de invierno.'
      })
    }

    // Consejos por defecto si no hay suficientes específicos
    if (consejos.length < 3) {
      consejos.push({
        icono: Calendar,
        titulo: 'Planifica con anticipación',
        descripcion: 'Revisa el pronóstico diariamente para ajustar tus rutinas de ejercicio.'
      })
    }

    return consejos.slice(0, 3).map((consejo, index) => (
      <div key={index} className="tiempo-consejo">
        <consejo.icono size={18} />
        <div>
          <strong>{consejo.titulo}:</strong>
          <p>{consejo.descripcion}</p>
        </div>
      </div>
    ))
  }

  const buscarUbicaciones = async (query) => {
    if (query.length < 2) {
      setSugerencias([])
      return
    }

    try {
      setBuscandoUbicacion(true)
      
      // Mejorar la búsqueda con múltiples intentos y parámetros
      const queries = [
        // Búsqueda principal con prioridad en España
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=es&limit=3&accept-language=es&addressdetails=1`,
        // Búsqueda global si no encuentra nada en España
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=es&addressdetails=1`,
        // Búsqueda específica para ciudades
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&featuretype=city&limit=5&accept-language=es&addressdetails=1`
      ]
      
      let todasLasUbicaciones = []
      
      // Intentar cada tipo de búsqueda
      for (const queryUrl of queries) {
        try {
          const response = await fetch(queryUrl)
          if (response.ok) {
            const data = await response.json()
            if (data.length > 0) {
              const ubicacionesProcesadas = data.map(item => ({
                nombre: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                ciudad: extraerNombreCiudad(item),
                pais: item.address?.country || '',
                tipo: item.type || 'lugar',
                importancia: item.importance || 0
              }))
              todasLasUbicaciones = [...todasLasUbicaciones, ...ubicacionesProcesadas]
            }
          }
        } catch (error) {
          console.warn('Error en una búsqueda específica:', error)
        }
      }
      
      // Eliminar duplicados y ordenar por relevancia
      const ubicacionesUnicas = eliminarDuplicados(todasLasUbicaciones)
      const ubicacionesOrdenadas = ubicacionesUnicas
        .sort((a, b) => {
          // Priorizar ciudades españolas
          if (a.pais === 'España' && b.pais !== 'España') return -1
          if (b.pais === 'España' && a.pais !== 'España') return 1
          
          // Luego por importancia
          return (b.importancia || 0) - (a.importancia || 0)
        })
        .slice(0, 6) // Limitar a 6 resultados
      
      setSugerencias(ubicacionesOrdenadas)
      
    } catch (error) {
      console.error('Error buscando ubicaciones:', error)
      toast.error('Error al buscar ubicaciones')
    } finally {
      setBuscandoUbicacion(false)
    }
  }

  const extraerNombreCiudad = (item) => {
    // Intentar extraer el nombre de la ciudad de diferentes campos
    const address = item.address || {}
    
    return address.city || 
           address.town || 
           address.village || 
           address.municipality || 
           address.county || 
           address.state || 
           item.name || 
           'Ubicación'
  }

  const eliminarDuplicados = (ubicaciones) => {
    const vistas = new Set()
    return ubicaciones.filter(ubicacion => {
      const clave = `${ubicacion.ciudad}-${ubicacion.pais}`
      if (vistas.has(clave)) {
        return false
      }
      vistas.add(clave)
      return true
    })
  }

  const seleccionarUbicacion = async (ubicacionSeleccionada) => {
    try {
      setUbicacion(ubicacionSeleccionada)
      setMostrarBuscador(false)
      setBusqueda('')
      setSugerencias([])
      
      await obtenerDatosTiempo(ubicacionSeleccionada.lat, ubicacionSeleccionada.lon)
      toast.success(`Pronóstico actualizado para ${ubicacionSeleccionada.ciudad}`)
    } catch (error) {
      toast.error('Error al obtener el pronóstico para esta ubicación')
    }
  }

  const ubicacionesPopulares = [
    { ciudad: 'Madrid', pais: 'España', lat: 40.4168, lon: -3.7038 },
    { ciudad: 'Barcelona', pais: 'España', lat: 41.3851, lon: 2.1734 },
    { ciudad: 'Valencia', pais: 'España', lat: 39.4699, lon: -0.3763 },
    { ciudad: 'Sevilla', pais: 'España', lat: 37.3891, lon: -5.9845 },
    { ciudad: 'Bilbao', pais: 'España', lat: 43.2627, lon: -2.9253 },
    { ciudad: 'Málaga', pais: 'España', lat: 36.7213, lon: -4.4214 },
    { ciudad: 'Coslada', pais: 'España', lat: 40.4209, lon: -3.5606 },
    { ciudad: 'Alcalá de Henares', pais: 'España', lat: 40.4817, lon: -3.3649 }
  ]

  const mostrarUbicacionesPopulares = () => {
    if (busqueda.length === 0) {
      setSugerencias(ubicacionesPopulares)
    }
  }

  const volverAUbicacionOriginal = async () => {
    if (!ubicacionOriginal) {
      toast.error('No se pudo obtener tu ubicación original')
      return
    }

    try {
      setCargando(true)
      setUbicacion(ubicacionOriginal)
      await obtenerDatosTiempo(ubicacionOriginal.lat, ubicacionOriginal.lon)
      toast.success('Volviendo a tu ubicación')
    } catch (error) {
      toast.error('Error al volver a tu ubicación')
    } finally {
      setCargando(false)
    }
  }

  const esUbicacionOriginal = () => {
    if (!ubicacion || !ubicacionOriginal) return true
    
    // Comparar coordenadas con una pequeña tolerancia
    const tolerancia = 0.01
    return Math.abs(ubicacion.lat - ubicacionOriginal.lat) < tolerancia &&
           Math.abs(ubicacion.lon - ubicacionOriginal.lon) < tolerancia
  }

  const generarRecomendacionIA = (pronostico) => {
    if (!pronostico || pronostico.length === 0) return null

    const hoy = pronostico[0]
    const nombreAsistente = "EliasHealthy"
    
    // Generar recomendaciones basadas en el clima de hoy
    let recomendacion = ""
    
    if (hoy.condicion === 'soleado') {
      if (hoy.temperaturaMax > 25) {
        recomendacion = "Aprovecha este día soleado para hacer ejercicio al aire libre temprano en la mañana o al atardecer. ¡Perfecto para correr en el parque o hacer yoga al aire libre!"
      } else if (hoy.temperaturaMax > 15) {
        recomendacion = "Es un día perfecto para actividades al aire libre. Te sugiero caminar, hacer senderismo o practicar deportes en el parque. ¡El clima está ideal!"
      } else {
        recomendacion = "Aunque hace sol, las temperaturas son frescas. Ideal para una caminata energizante o ejercicios al aire libre con ropa abrigada."
      }
    } else if (hoy.condicion === 'lluvia') {
      recomendacion = "Es un día perfecto para actividades en casa. Te recomiendo yoga, meditación, ejercicios de fuerza en casa o leer un buen libro. ¡Aprovecha para cuidarte desde adentro!"
    } else if (hoy.condicion === 'nublado') {
      if (hoy.temperaturaMax > 20) {
        recomendacion = "El clima nublado es perfecto para actividades moderadas. Te sugiero caminar, hacer ejercicio ligero al aire libre o visitar un museo."
      } else {
        recomendacion = "Día ideal para actividades tranquilas. Perfecto para una caminata relajante, leer en un café o hacer ejercicios suaves en casa."
      }
    } else if (hoy.condicion === 'tormenta') {
      recomendacion = "Mejor quedarse en casa hoy. Perfecto para planificar tus hábitos de la semana, hacer ejercicios en casa o dedicar tiempo a hobbies creativos."
    } else if (hoy.condicion === 'nieve') {
      recomendacion = "¡Qué día tan especial! Si tienes experiencia, perfecto para deportes de invierno. Si no, ideal para actividades en casa y disfrutar la vista nevada."
    } else {
      recomendacion = "Revisa el pronóstico y planifica tus actividades según el clima. ¡Siempre hay algo perfecto que hacer!"
    }

    return {
      asistente: nombreAsistente,
      mensaje: recomendacion,
      icono: 'estrella' // Usaremos un icono personalizado
    }
  }

  const handleBusquedaChange = (e) => {
    const valor = e.target.value
    setBusqueda(valor)
    
    if (valor.length === 0) {
      setSugerencias(ubicacionesPopulares)
      return
    }
    
    // Debounce la búsqueda para evitar demasiadas llamadas
    clearTimeout(window.busquedaTimeout)
    window.busquedaTimeout = setTimeout(() => {
      buscarUbicaciones(valor)
    }, 300)
  }

  if (cargando) {
    return (
      <div className="tiempo-cargando">
        <div className="tiempo-cargando-spinner"></div>
        <span>Obteniendo pronóstico del tiempo...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tiempo-error">
        <Cloud size={48} />
        <h2>Error al cargar el pronóstico</h2>
        <p>{error}</p>
        <motion.button
          className="tiempo-boton-reintentar"
          onClick={obtenerUbicacionYTiempo}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={18} />
          Reintentar
        </motion.button>
      </div>
    )
  }

  return (
    <div className="tiempo-contenedor">
      <div className="tiempo-header">
        <div className="tiempo-titulo-seccion">
          <h1 className="tiempo-titulo">
            <Cloud size={28} />
            Pronóstico del Tiempo
          </h1>
          <p className="tiempo-subtitulo">
            Planifica tus actividades al aire libre para los próximos 6 días
          </p>
        </div>
        
        <div className="tiempo-controles">
          <motion.button
            className="tiempo-boton-ubicacion"
            onClick={() => setMostrarBuscador(!mostrarBuscador)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={18} />
            Cambiar ubicación
          </motion.button>

          {!esUbicacionOriginal() && (
            <motion.button
              className="tiempo-boton-mi-ubicacion"
              onClick={volverAUbicacionOriginal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={cargando}
            >
              <Navigation size={18} />
              Mi ubicación
            </motion.button>
          )}

          <motion.button
            className="tiempo-boton-actualizar"
            onClick={obtenerUbicacionYTiempo}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={cargando}
          >
            <RefreshCw size={18} className={cargando ? 'girando' : ''} />
            Actualizar
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mostrarBuscador && (
          <motion.div
            className="tiempo-buscador"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="tiempo-buscador-contenido">
              <div className="tiempo-buscador-input">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar ciudad o ubicación..."
                  value={busqueda}
                  onChange={handleBusquedaChange}
                  onFocus={mostrarUbicacionesPopulares}
                  autoFocus
                />
                <button
                  className="tiempo-buscador-cerrar"
                  onClick={() => {
                    setMostrarBuscador(false)
                    setBusqueda('')
                    setSugerencias([])
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {buscandoUbicacion && (
                <div className="tiempo-buscador-cargando">
                  <RefreshCw size={16} className="girando" />
                  <span>Buscando ubicaciones...</span>
                </div>
              )}

              {sugerencias.length > 0 && (
                <div className="tiempo-sugerencias">
                  {busqueda.length === 0 && (
                    <div className="tiempo-sugerencias-titulo">
                      <span>Ubicaciones populares</span>
                    </div>
                  )}
                  {sugerencias.map((sugerencia, index) => (
                    <motion.button
                      key={index}
                      className="tiempo-sugerencia"
                      onClick={() => seleccionarUbicacion(sugerencia)}
                      whileHover={{ backgroundColor: 'rgba(124, 106, 255, 0.1)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MapPin size={16} />
                      <div>
                        <span className="tiempo-sugerencia-ciudad">{sugerencia.ciudad}</span>
                        <span className="tiempo-sugerencia-pais">{sugerencia.pais}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {!buscandoUbicacion && busqueda.length >= 2 && sugerencias.length === 0 && (
                <div className="tiempo-sin-resultados">
                  <MapPin size={20} />
                  <div>
                    <span>No se encontraron ubicaciones</span>
                    <p>Intenta con el nombre de una ciudad o región</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tiempoData && (
        <>
          <div className="tiempo-ubicacion">
            <MapPin size={16} />
            <span>{tiempoData.ciudad}{tiempoData.pais && `, ${tiempoData.pais}`}</span>
            {!esUbicacionOriginal() && (
              <span className="tiempo-ubicacion-badge">{ubicacion?.ciudad || 'Ubicación personalizada'}</span>
            )}
          </div>

          <div className="tiempo-grid">
            {tiempoData.pronostico.map((dia, index) => {
              const IconoCondicion = dia.icono
              const esHoy = index === 0
              
              return (
                <motion.div
                  key={index}
                  className={`tiempo-card ${esHoy ? 'tiempo-card-hoy' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="tiempo-card-header">
                    <span className="tiempo-fecha">{formatearFecha(dia.fecha)}</span>
                    {esHoy && <span className="tiempo-badge-hoy">Hoy</span>}
                  </div>

                  <div 
                    className="tiempo-icono-contenedor"
                    style={{ background: obtenerColorCondicion(dia.condicion) }}
                  >
                    <IconoCondicion size={32} color="white" />
                  </div>

                  <div className="tiempo-temperaturas">
                    <span className="tiempo-temp-max">{dia.temperaturaMax}°</span>
                    <span className="tiempo-temp-min">{dia.temperaturaMin}°</span>
                  </div>

                  <p className="tiempo-descripcion">{dia.descripcion}</p>

                  <div className="tiempo-detalles">
                    <div className="tiempo-detalle">
                      <Droplets size={14} />
                      <span>{dia.humedad}%</span>
                    </div>
                    <div className="tiempo-detalle">
                      <Wind size={14} />
                      <span>{dia.viento} km/h</span>
                    </div>
                    {dia.precipitacion > 0 && (
                      <div className="tiempo-detalle">
                        <CloudRain size={14} />
                        <span>{dia.precipitacion}%</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="tiempo-consejos">
            <h3>
              <Calendar size={20} />
              Consejos para tus hábitos al aire libre
            </h3>
            <div className="tiempo-consejos-grid">
              {generarConsejos(tiempoData.pronostico)}
            </div>
          </div>

          {(() => {
            const recomendacionIA = generarRecomendacionIA(tiempoData.pronostico)
            if (!recomendacionIA) return null
            
            // Componente de estrella de 4 puntas personalizada
            const EstrellaIA = () => (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" />
              </svg>
            )
            
            return (
              <motion.div
                className="tiempo-recomendacion-ia"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="tiempo-ia-header">
                  <div className="tiempo-ia-icono">
                    <EstrellaIA />
                  </div>
                  <span className="tiempo-ia-nombre">{recomendacionIA.asistente}</span>
                  <span className="tiempo-ia-texto">Recomienda</span>
                </div>
                <p className="tiempo-ia-mensaje">
                  {recomendacionIA.mensaje}
                </p>
              </motion.div>
            )
          })()}
        </>
      )}
    </div>
  )
}