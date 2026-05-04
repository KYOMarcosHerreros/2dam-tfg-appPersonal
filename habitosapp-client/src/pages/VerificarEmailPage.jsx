import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import './VerificarEmailPage.css'

export default function VerificarEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [estado, setEstado] = useState('verificando') // verificando, exito, error
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    document.title = 'Verificar Email - HabitosApp'
    verificarToken()
    
    return () => {
      document.title = 'HabitosApp'
    }
  }, [])

  const verificarToken = async () => {
    const token = searchParams.get('token')
    
    if (!token) {
      setEstado('error')
      setMensaje('Token de verificación no encontrado')
      return
    }

    try {
      const authToken = localStorage.getItem('token')
      if (!authToken) {
        setEstado('error')
        setMensaje('Debes iniciar sesión para verificar tu email')
        return
      }

      const response = await fetch('/api/VerificacionEmail/confirmar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok && data.verificado) {
        setEstado('exito')
        setMensaje(data.mensaje)
        toast.success('¡Email verificado correctamente!')
        
        // Redirigir al perfil después de 3 segundos
        setTimeout(() => {
          navigate('/perfil')
        }, 3000)
      } else {
        setEstado('error')
        setMensaje(data.mensaje || 'Error al verificar el email')
      }
    } catch (error) {
      console.error('Error:', error)
      setEstado('error')
      setMensaje('Error de conexión al verificar el email')
    }
  }

  return (
    <div className="verificar-email-contenedor">
      <motion.div
        className="verificar-email-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {estado === 'verificando' && (
          <div className="verificar-email-content">
            <div className="verificar-email-spinner"></div>
            <h1>Verificando tu email...</h1>
            <p>Por favor espera mientras confirmamos tu dirección de correo.</p>
          </div>
        )}

        {estado === 'exito' && (
          <div className="verificar-email-content verificar-email-exito">
            <CheckCircle size={64} />
            <h1>¡Email Verificado!</h1>
            <p>{mensaje}</p>
            <div className="verificar-email-beneficios">
              <h3>Ahora puedes:</h3>
              <ul>
                <li>✅ Recibir consejos diarios de EliasHealthy</li>
                <li>✅ Obtener recordatorios personalizados</li>
                <li>✅ Mantener tus hábitos con notificaciones útiles</li>
              </ul>
            </div>
            <p className="verificar-email-redirect">
              Serás redirigido a tu perfil en unos segundos...
            </p>
          </div>
        )}

        {estado === 'error' && (
          <div className="verificar-email-content verificar-email-error">
            <XCircle size={64} />
            <h1>Error de Verificación</h1>
            <p>{mensaje}</p>
            <div className="verificar-email-acciones">
              <button
                onClick={() => navigate('/perfil')}
                className="verificar-email-boton"
              >
                <ArrowLeft size={16} />
                Volver al Perfil
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}