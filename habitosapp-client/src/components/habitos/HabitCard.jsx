import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, Trash2 } from 'lucide-react';

export default function HabitCard({ habito, completado, onToggle, onVer, onEliminar }) {
  return (
    <motion.div 
      layout
      className={`habito-card ${completado ? 'completado' : ''} ${habito.esNegativo && !completado ? 'negativo' : ''}`}
    >
      <button 
        className={`habito-tick ${completado ? 'completado' : ''} ${habito.esNegativo && !completado ? 'negativo' : ''}`}
        onClick={() => onToggle(habito.id)}
      >
        <AnimatePresence>
          {completado && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check size={14} color="#ffffff" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="habito-icono">
        {habito.icono}
      </div>

      <div className="habito-info">
        <span className={`habito-nombre ${completado ? 'completado' : ''}`}>
          {habito.nombre}
        </span>
        {habito.categoriaNombre && (
          <span className="habito-categoria">{habito.categoriaNombre}</span>
        )}
      </div>

      <div className="habito-acciones">
        <button className="habito-accion-btn ver" onClick={() => onVer(habito)} title="Ver detalle">
          <Eye size={16} />
        </button>
        <button className="habito-accion-btn eliminar" onClick={() => onEliminar(habito)} title="Eliminar">
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}