import { motion, AnimatePresence } from 'framer-motion'

export default function HabitModalEliminar({ habito, onClose, onConfirm }) {
  if (!habito) return null

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modal-contenedor-small" initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
            <h2 className="modal-titulo" style={{ marginBottom: '12px' }}>¿Eliminar hábito?</h2>
            <p className="modal-texto-p" style={{ lineHeight: '1.5' }}>Vas a eliminar <strong>{habito.nombre}</strong>. Esta acción es irreversible.</p>
          </div>
          <div className="modal-botones">
            <button className="modal-boton-cancelar" onClick={onClose}>Cancelar</button>
            <button className="modal-boton-eliminar" onClick={onConfirm}>Sí, eliminar</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}