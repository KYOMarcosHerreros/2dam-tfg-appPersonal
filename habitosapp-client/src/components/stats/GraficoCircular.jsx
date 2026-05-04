import { motion } from 'framer-motion'

export default function GraficoCircular({ porcentaje, completados, total }) {
  const radio = 70
  const circunferencia = 2 * Math.PI * radio
  const offset = circunferencia - (porcentaje / 100) * circunferencia

  return (
    <div className="grafico-circular">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="gradienteCircular" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        {/* Círculo de fondo */}
        <circle
          cx="100"
          cy="100"
          r={radio}
          fill="none"
          stroke="var(--bg-primary)"
          strokeWidth="16"
        />
        
        {/* Círculo de progreso */}
        <motion.circle
          cx="100"
          cy="100"
          r={radio}
          fill="none"
          stroke="url(#gradienteCircular)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 100 100)"
        />
        
        {/* Texto central */}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          fontSize="32"
          fontWeight="800"
          fill="var(--text-primary)"
          fontFamily="Outfit, sans-serif"
        >
          {porcentaje.toFixed(0)}%
        </text>
        <text
          x="100"
          y="115"
          textAnchor="middle"
          fontSize="14"
          fill="var(--text-secondary)"
          fontFamily="DM Sans, sans-serif"
        >
          {completados} de {total}
        </text>
      </svg>
    </div>
  )
}
