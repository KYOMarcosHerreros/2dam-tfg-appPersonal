import { motion } from 'framer-motion'
import { useState } from 'react'

export default function MapaCalor({ datos }) {
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)

  if (!datos || datos.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay datos disponibles</div>
  }

  // Agrupar por semanas
  const semanas = []
  let semanaActual = []
  
  datos.forEach((dia, index) => {
    const fecha = new Date(dia.fecha)
    const diaSemana = fecha.getDay()
    
    if (index === 0 && diaSemana !== 0) {
      // Rellenar días vacíos al inicio
      for (let i = 0; i < diaSemana; i++) {
        semanaActual.push(null)
      }
    }
    
    semanaActual.push(dia)
    
    if (diaSemana === 6 || index === datos.length - 1) {
      // Rellenar días vacíos al final si es necesario
      while (semanaActual.length < 7) {
        semanaActual.push(null)
      }
      semanas.push(semanaActual)
      semanaActual = []
    }
  })

  const obtenerColor = (porcentaje) => {
    if (porcentaje === 0) return 'var(--bg-primary)'
    if (porcentaje < 25) return 'rgba(124, 106, 255, 0.2)'
    if (porcentaje < 50) return 'rgba(124, 106, 255, 0.4)'
    if (porcentaje < 75) return 'rgba(124, 106, 255, 0.6)'
    if (porcentaje < 100) return 'rgba(124, 106, 255, 0.8)'
    return 'rgba(16, 185, 129, 0.9)'
  }

  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  return (
    <div className="mapa-calor-contenedor">
      <div className="mapa-calor">
        <div className="mapa-calor-labels">
          {diasSemana.map((dia, index) => (
            <div key={index} className="mapa-calor-label">
              {dia}
            </div>
          ))}
        </div>
        
        <div className="mapa-calor-grid">
          {semanas.map((semana, semanaIndex) => (
            <div key={semanaIndex} className="mapa-calor-columna">
              {semana.map((dia, diaIndex) => (
                <motion.div
                  key={`${semanaIndex}-${diaIndex}`}
                  className="mapa-calor-celda"
                  style={{
                    backgroundColor: dia ? obtenerColor(dia.porcentaje) : 'transparent',
                    cursor: dia ? 'pointer' : 'default'
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (semanaIndex * 7 + diaIndex) * 0.002 }}
                  whileHover={dia ? { scale: 1.2 } : {}}
                  onMouseEnter={() => dia && setDiaSeleccionado(dia)}
                  onMouseLeave={() => setDiaSeleccionado(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {diaSeleccionado && (
        <motion.div 
          className="mapa-calor-tooltip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="tooltip-fecha">{formatearFecha(diaSeleccionado.fecha)}</div>
          <div className="tooltip-info">
            {diaSeleccionado.habitosCompletados} de {diaSeleccionado.totalHabitos} hábitos
          </div>
          <div className="tooltip-porcentaje">
            {diaSeleccionado.porcentaje.toFixed(0)}% completado
          </div>
        </motion.div>
      )}

      <div className="mapa-calor-leyenda">
        <span className="leyenda-texto">Menos</span>
        <div className="leyenda-colores">
          <div className="leyenda-color" style={{ backgroundColor: 'var(--bg-primary)' }} />
          <div className="leyenda-color" style={{ backgroundColor: 'rgba(124, 106, 255, 0.2)' }} />
          <div className="leyenda-color" style={{ backgroundColor: 'rgba(124, 106, 255, 0.4)' }} />
          <div className="leyenda-color" style={{ backgroundColor: 'rgba(124, 106, 255, 0.6)' }} />
          <div className="leyenda-color" style={{ backgroundColor: 'rgba(124, 106, 255, 0.8)' }} />
          <div className="leyenda-color" style={{ backgroundColor: 'rgba(16, 185, 129, 0.9)' }} />
        </div>
        <span className="leyenda-texto">Más</span>
      </div>
    </div>
  )
}
