import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Brain, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import IconSelector from '../shared/IconSelector'

export default function HabitModalCrear({ 
  show, onClose, onSubmit, tab, setTab, form, setForm, categorias,
  sugerenciaIA, cargandoSugerencia, obtenerSugerenciaIA
}) {
  if (!show) return null

  // Obtener sugerencia de IA cuando cambia el nombre en modo personalizado
  useEffect(() => {
    if (tab === 'personalizado' && form.nombre.trim().length > 3 && form.usarCategorizacionIA) {
      const timer = setTimeout(() => {
        obtenerSugerenciaIA()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [form.nombre, tab, form.usarCategorizacionIA])

  const handleCategoriaChange = (categoriaId) => {
    setForm({...form, categoriaId: parseInt(categoriaId)})
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
            <h2 className="modal-titulo">Nuevo hábito</h2>
            <button onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-tabs">
            <button 
              className={`modal-tab ${tab === 'catalogo' ? 'activo' : ''}`} 
              onClick={() => setTab('catalogo')}
            >
              Catálogo
            </button>
            <button 
              className={`modal-tab ${tab === 'personalizado' ? 'activo' : ''}`} 
              onClick={() => setTab('personalizado')}
            >
              Personalizado
            </button>
          </div>

          <form onSubmit={onSubmit} className="modal-form">
            <div className="modal-campo">
              <label className="modal-label">Nombre</label>
              <input 
                className="modal-input" 
                value={form.nombre} 
                onChange={e => setForm({...form, nombre: e.target.value})} 
                placeholder="Ej: Hacer ejercicio, Leer 30 minutos..."
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

            {/* Sugerencia de IA para hábitos personalizados */}
            {tab === 'personalizado' && (
              <div className="modal-ia-section">
                <div className="modal-ia-toggle">
                  <label className="modal-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={form.usarCategorizacionIA}
                      onChange={e => setForm({...form, usarCategorizacionIA: e.target.checked})}
                    />
                    <Sparkles size={14} /> Usar IA para categorizar
                  </label>
                </div>

                {form.usarCategorizacionIA && cargandoSugerencia && (
                  <div className="modal-ia-loading">
                    <Loader2 size={16} className="spinner" />
                    Analizando hábito...
                  </div>
                )}

                {form.usarCategorizacionIA && sugerenciaIA && (
                  <div className="modal-ia-sugerencia">
                    <div className="modal-ia-header">
                      <Brain size={16} />
                      <span>Sugerencia de IA</span>
                      <span className="modal-ia-confianza">{Math.round(sugerenciaIA.confianza)}% confianza</span>
                    </div>
                    <div className="modal-ia-categoria">
                      <strong>{sugerenciaIA.categoriaNombre}</strong>
                    </div>
                    <div className="modal-ia-razon">{sugerenciaIA.razon}</div>
                    
                    {sugerenciaIA.alternativasSugeridas?.length > 0 && (
                      <div className="modal-ia-alternativas">
                        <span>Otras opciones:</span>
                        {sugerenciaIA.alternativasSugeridas.map(alt => (
                          <button 
                            key={alt.categoriaId}
                            type="button"
                            className="modal-ia-alternativa"
                            onClick={() => handleCategoriaChange(alt.categoriaId)}
                          >
                            {alt.nombre} ({Math.round(alt.confianza)}%)
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Selector de categoría manual para catálogo */}
            {tab === 'catalogo' && (
              <div className="modal-campo">
                <label className="modal-label">Categoría</label>
                <select 
                  className="modal-select" 
                  value={form.categoriaId || ''} 
                  onChange={e => handleCategoriaChange(e.target.value)}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selector manual de categoría para personalizado si no usa IA */}
            {tab === 'personalizado' && !form.usarCategorizacionIA && (
              <div className="modal-campo">
                <label className="modal-label">Categoría</label>
                <select 
                  className="modal-select" 
                  value={form.categoriaId || ''} 
                  onChange={e => handleCategoriaChange(e.target.value)}
                >
                  <option value="">Selecciona una categoría (opcional)</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                Crear hábito
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}