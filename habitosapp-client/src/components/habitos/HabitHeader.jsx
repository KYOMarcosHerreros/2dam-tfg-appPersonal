import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HabitHeader({ 
  fecha, 
  completadas, 
  pendientes, 
  alAbrirCrear, 
  onCambiarFecha, 
  onIrAHoy,
  esHoy 
}) {
  return (
    <div className="habitos-header">
      <div className="habitos-header-izq">
        <h1 className="habitos-titulo">Mis Hábitos</h1>
        
        <div className="habitos-fecha-navegacion">
          <button 
            className="fecha-nav-btn" 
            onClick={() => onCambiarFecha(-1)}
            title="Día anterior"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="habitos-fecha">
            <Calendar size={16} />
            <span>{fecha}</span>
          </div>
          
          <button 
            className="fecha-nav-btn" 
            onClick={() => onCambiarFecha(1)}
            title="Día siguiente"
          >
            <ChevronRight size={18} />
          </button>
          
          {!esHoy && (
            <button 
              className="fecha-hoy-btn" 
              onClick={onIrAHoy}
            >
              Hoy
            </button>
          )}
        </div>
        
        <div className="habitos-contador">
          <div className="habitos-contador-item completadas">
            <CheckCircle2 size={16} className="habitos-contador-icono" />
            <span>{completadas} Completadas</span>
          </div>
          <div className="habitos-contador-item pendientes">
            <Clock size={16} className="habitos-contador-icono" />
            <span>{pendientes} Pendientes</span>
          </div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="habitos-boton-nuevo"
        onClick={alAbrirCrear}
      >
        <Plus size={18} />
        <span>Añadir hábito</span>
      </motion.button>
    </div>
  );
}