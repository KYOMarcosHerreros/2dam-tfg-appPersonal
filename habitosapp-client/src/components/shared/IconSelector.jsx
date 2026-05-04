import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const ICONOS_PREDEFINIDOS = [
  // Salud y Ejercicio
  '💪', '🏃‍♂️', '🏋️‍♀️', '🧘‍♀️', '🚴‍♂️', '🏊‍♂️', '🤸‍♀️', '🏃‍♀️',
  '❤️', '🫀', '🩺', '💊', '🧬', '🦷', '👁️', '🧠',
  
  // Alimentación
  '🥗', '🍎', '🥕', '🥑', '🍊', '🫐', '🥛', '💧',
  '🍳', '🥘', '🍲', '🥙', '🍱', '🥪', '☕', '🍵',
  
  // Productividad y Trabajo
  '📚', '✍️', '💻', '📝', '📊', '📈', '🎯', '⚡',
  '🔥', '💡', '🚀', '⭐', '🏆', '🎖️', '📅', '⏰',
  
  // Aprendizaje y Cultura
  '🎓', '📖', '🔬', '🎨', '🎵', '🎬', '📺', '🎪',
  '🌍', '🗣️', '🧩', '🎲', '♟️', '🎯', '🔍', '💭',
  
  // Finanzas
  '💰', '💳', '🏦', '📊', '💎', '🪙', '💸', '📈',
  '💹', '🧮', '📋', '📑', '💼', '🏪', '🛒', '💱',
  
  // Hogar y Organización
  '🏠', '🧹', '🧽', '🗂️', '📦', '🛏️', '🪴', '🕯️',
  '🧺', '👕', '🧴', '🔧', '🔨', '🪚', '🧰', '🗝️',
  
  // Relaciones Sociales
  '👥', '💬', '📞', '💌', '🤝', '👨‍👩‍👧‍👦', '🎉', '🎁',
  '❤️‍🔥', '💕', '🫂', '👋', '😊', '🥳', '🤗', '💐',
  
  // Tecnología
  '💻', '📱', '⌨️', '🖥️', '🖱️', '💾', '🔌', '📡',
  '🤖', '⚙️', '🔧', '💿', '📀', '🎮', '📷', '🔋',
  
  // Creatividad
  '🎨', '✏️', '🖌️', '🖍️', '📝', '✂️', '📐', '🎭',
  '🎪', '🎨', '🖼️', '📸', '🎥', '🎬', '🎤', '🎸',
  
  // Naturaleza y Ambiente
  '🌱', '🌿', '🌳', '🌸', '🌺', '🌻', '🌼', '🍃',
  '☀️', '🌙', '⭐', '🌈', '🦋', '🐝', '🌍', '♻️',
  
  // Otros
  '🎯', '🔥', '⚡', '💫', '✨', '🌟', '💎', '🏅',
  '🎪', '🎭', '🎨', '🎵', '🎶', '🎸', '🥁', '🎺'
]

export default function IconSelector({ iconoSeleccionado, onSeleccionar }) {
  const [mostrarSelector, setMostrarSelector] = useState(false)
  const selectorRef = useRef(null)

  // Cerrar selector cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setMostrarSelector(false)
      }
    }

    if (mostrarSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mostrarSelector])

  const handleSeleccionarIcono = (icono) => {
    onSeleccionar(icono)
    setMostrarSelector(false)
  }

  return (
    <div className="icon-selector" ref={selectorRef}>
      <div className="icon-selector-input" onClick={() => setMostrarSelector(!mostrarSelector)}>
        <div className="icon-preview">
          {iconoSeleccionado}
        </div>
        <span className="icon-selector-text">Seleccionar icono</span>
      </div>

      {mostrarSelector && (
        <motion.div 
          className="icon-selector-grid"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="icon-grid">
            {ICONOS_PREDEFINIDOS.map((icono, index) => (
              <button
                key={index}
                type="button"
                className={`icon-option ${iconoSeleccionado === icono ? 'selected' : ''}`}
                onClick={() => handleSeleccionarIcono(icono)}
              >
                {icono}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}