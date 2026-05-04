import { motion } from 'framer-motion'

export default function GraficoSemanal({ datos }) {
  if (!datos || datos.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay datos disponibles</div>
  }

  const maxPorcentaje = Math.max(...datos.map(d => d.porcentajeCompletado), 1)

  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return dias[date.getDay()]
  }

  return (
    <div className="grafico-semanal">
      <div className="grafico-semanal-barras">
        {datos.map((dia, index) => (
          <div key={index} className="barra-contenedor">
            <motion.div 
              className="barra-wrapper"
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <motion.div
                className="barra"
                style={{
                  height: `${(dia.porcentajeCompletado / maxPorcentaje) * 100}%`,
                  background: dia.porcentajeCompletado === 100 
                    ? 'linear-gradient(180deg, #10b981, #34d399)' // Verde para 100%
                    : dia.porcentajeCompletado >= 50
                    ? 'linear-gradient(180deg, #f59e0b, #fbbf24)' // Naranja/amarillo para 50-99%
                    : 'linear-gradient(180deg, #ef4444, #f87171)' // Rojo para <50%
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
              >
                <div className="barra-tooltip">
                  {dia.habitosCompletados}/{dia.totalHabitos}
                  <br />
                  {dia.porcentajeCompletado.toFixed(0)}%
                </div>
              </motion.div>
            </motion.div>
            <span className="barra-label">{formatearFecha(dia.fecha)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
