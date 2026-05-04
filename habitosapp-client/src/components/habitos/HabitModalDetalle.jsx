import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit2, Flame, Trophy, CalendarDays } from 'lucide-react'

export default function HabitModalDetalle({ habito, racha, onClose, onEditar }) {
  if (!habito) return null

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modal-contenedor" initial={{ y: 20 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header-flex">
            <h2 className="modal-titulo">Detalle del hábito</h2>
            <button onClick={onClose}><X size={18} /></button>
          </div>
          
          <div className="detalle-header">
            <div className="detalle-icono">{habito.icono}</div>
            <div className="detalle-info">
              <div className="detalle-nombre">{habito.nombre}</div>
              <div className="detalle-categoria">{habito.categoriaNombre || 'Sin categoría'}</div>
            </div>
          </div>

          <div className="detalle-stats">
            <div className="detalle-stat">
              <Flame size={20} />
              <span className="detalle-stat-valor">{racha?.diasActual ?? 0}</span>
              <span className="detalle-stat-label">Racha actual</span>
            </div>
            <div className="detalle-stat">
              <Trophy size={20} />
              <span className="detalle-stat-valor">{racha?.diasRecord ?? 0}</span>
              <span className="detalle-stat-label">Récord histórico</span>
            </div>
          </div>

          <div className="modal-botones">
            <button className="modal-boton-cancelar" onClick={onClose}>
              Cerrar
            </button>
            <button className="modal-boton-confirmar" onClick={() => {
              onClose()
              onEditar && onEditar(habito)
            }}>
              <Edit2 size={16} />
              <span>Editar hábito</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}