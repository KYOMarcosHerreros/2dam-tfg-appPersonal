import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import IconSelector from '../shared/IconSelector'

export default function HabitModalEditar({ habito, show, onClose, onSubmit, categorias }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    icono: '',
    frecuenciaSemanal: 7,
    categoriaId: null,
    esNegativo: false
  })

  useEffect(() => {
    if (habito) {
      setForm({
        nombre: habito.nombre || '',
        descripcion: habito.descripcion || '',
        icono: habito.icono || '⭐',
        frecuenciaSemanal: habito.frecuenciaSemanal || 7,
        categoriaId: habito.categoriaId || null,
        esNegativo: habito.esNegativo || false
      })
    }
  }, [habito])

  if (!show || !habito) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(habito.id, form)
  }

  const handleIconoChange = (icono) => {
    setForm({...form, icono})
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
      >
        <motion.div 
          className="modal-contenedor" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header-flex">
            <h2 className="modal-titulo">Editar hábito</h2>
            <button onClick={onClose}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-campo">
              <label className="modal-label">Nombre</label>
              <input 
                className="modal-input" 
                value={form.nombre} 
                onChange={e => setForm({...form, nombre: e.target.value})} 
                placeholder="Nombre del hábito"
                required 
              />
            </div>

            <div className="modal-campo">
              <label className="modal-label">Descripción (opcional)</label>
              <textarea 
                className="modal-input" 
                value={form.descripcion} 
                onChange={e => setForm({...form, descripcion: e.target.value})} 
                placeholder="Describe tu hábito..."
                rows="2"
              />
            </div>

            <div className="modal-campo">
              <label className="modal-label">Categoría</label>
              <select 
                className="modal-select" 
                value={form.categoriaId || ''} 
                onChange={e => setForm({...form, categoriaId: parseInt(e.target.value) || null})}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-campo">
              <label className="modal-label">Icono</label>
              <IconSelector 
                iconoSeleccionado={form.icono}
                onSeleccionar={handleIconoChange}
              />
            </div>

            <div className="modal-campo">
              <label className="modal-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={form.esNegativo}
                  onChange={e => setForm({...form, esNegativo: e.target.checked})}
                />
                Es un hábito negativo (que quiero evitar)
              </label>
            </div>

            <div className="modal-botones">
              <button type="button" className="modal-boton-cancelar" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="modal-boton-confirmar">
                <Save size={16} />
                Guardar cambios
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}