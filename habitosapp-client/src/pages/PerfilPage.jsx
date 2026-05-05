import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Bell, Save, Calendar, Edit2, ArrowLeft, Camera, X } from 'lucide-react'
import { obtenerPerfil, actualizarPerfil } from '../api/perfil'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './PerfilPage.css'

export default function PerfilPage() {
  const navigate = useNavigate()
  const { actualizarUsuario } = useAuth()
  const fileInputRef = useRef(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fotoPerfil: '',
    notificacionesEmail: false, // Cambiar a false por defecto
    notificacionesPush: true,
    emailVerificado: false // Nuevo campo
  })

  useEffect(() => {
    cargarPerfil()
    document.title = 'Mi Perfil - HabitosApp'
    return () => {
      document.title = 'HabitosApp'
    }
  }, [])

  const cargarPerfil = async () => {
    try {
      setCargando(true)
      const response = await obtenerPerfil()
      console.log('Datos del perfil recibidos:', response.data)
      setPerfil(response.data)
      setForm({
        nombre: response.data.nombre || '',
        email: response.data.email || '',
        telefono: response.data.telefono || '',
        fotoPerfil: response.data.fotoPerfil || '',
        notificacionesEmail: response.data.emailVerificado ? (response.data.notificacionesEmail ?? false) : false, // Solo true si está verificado Y activado
        notificacionesPush: response.data.notificacionesPush ?? true,
        emailVerificado: response.data.emailVerificado ?? false
      })
    } catch (error) {
      console.error('Error al cargar perfil:', error)
      console.error('Detalles del error:', error.response?.data)
      toast.error('Error al cargar el perfil. Por favor, intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Prevenir activar notificaciones si el email no está verificado
    if (name === 'notificacionesEmail' && type === 'checkbox' && checked && !form.emailVerificado) {
      toast.error('Debes verificar tu email primero para recibir notificaciones')
      return
    }
    
    // Mostrar feedback específico para notificaciones por email
    if (name === 'notificacionesEmail' && type === 'checkbox') {
      if (checked) {
        toast.success('📧 Notificaciones por email activadas. ¡Recibirás consejos de EliasHealthy!')
      } else {
        toast('📧 Notificaciones por email desactivadas', { icon: '🔕' })
      }
    }
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const solicitarVerificacionEmail = async () => {
    try {
      console.log('🔥🔥🔥 FRONTEND - Iniciando solicitud de verificación de email...')
      
      const token = localStorage.getItem('token')
      console.log('🔥🔥🔥 FRONTEND - Token JWT:', token ? 'PRESENTE' : 'AUSENTE')
      
      // Determinar la URL base correcta
      let baseUrl = ''
      if (window.location.origin.includes('localhost')) {
        baseUrl = 'http://localhost:5000' // Desarrollo local
      } else {
        baseUrl = 'https://back-production-4f9d.up.railway.app' // Producción
      }
      
      const url = `${baseUrl}/api/VerificacionEmail/solicitar`
      console.log('🔥🔥🔥 FRONTEND - URL completa de solicitud:', url)
      console.log('🔥🔥🔥 FRONTEND - Origin actual:', window.location.origin)
      
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
      
      console.log('🔥🔥🔥 FRONTEND - Opciones de request:', requestOptions)
      
      const response = await fetch(url, requestOptions)

      console.log('🔥🔥🔥 FRONTEND - Respuesta del servidor:', response.status, response.statusText)
      console.log('🔥🔥🔥 FRONTEND - Content-Type de respuesta:', response.headers.get('content-type'))
      console.log('🔥🔥🔥 FRONTEND - URL final:', response.url)

      if (response.ok) {
        const data = await response.json()
        console.log('🔥🔥🔥 FRONTEND - Respuesta exitosa:', data)
        toast.success('📧 Email de verificación enviado. Revisa tu bandeja de entrada.')
      } else {
        const responseText = await response.text()
        console.log('🔥🔥🔥 FRONTEND - Respuesta de error (texto):', responseText)
        
        // Si recibimos HTML en lugar de JSON, es probable que sea un error de routing
        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
          console.log('🔥🔥🔥 FRONTEND - ERROR: Recibimos HTML en lugar de JSON - problema de routing')
          toast.error('Error de conexión con el servidor. Verifica la URL del backend.')
          return
        }
        
        try {
          const error = JSON.parse(responseText)
          toast.error(error.mensaje || 'Error al enviar email de verificación')
        } catch {
          toast.error(`Error del servidor: ${response.status} ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('🔥🔥🔥 FRONTEND - Error de red:', error)
      toast.error('Error al solicitar verificación de email')
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no puede superar 2MB')
        return
      }
      
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos JPG, PNG o WebP')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, fotoPerfil: reader.result }))
        toast.success('Imagen cargada correctamente')
      }
      reader.onerror = () => {
        toast.error('Error al cargar la imagen')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.nombre.trim() || !form.email.trim()) {
      toast.error('Nombre y email son obligatorios')
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      toast.error('Por favor, introduce un email válido')
      return
    }

    try {
      setGuardando(true)
      console.log('Enviando datos al backend:', form)
      const response = await actualizarPerfil(form)
      console.log('Respuesta del backend:', response.data)
      
      // Actualizar el contexto de usuario con los nuevos datos
      actualizarUsuario({
        nombre: form.nombre,
        email: form.email,
        fotoPerfil: form.fotoPerfil
      })
      
      // Disparar evento personalizado para notificar la actualización
      window.dispatchEvent(new CustomEvent('perfilActualizado'))
      
      toast.success('Perfil actualizado correctamente')
      await cargarPerfil()
      setModoEdicion(false)
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      console.error('Detalles del error:', error.response?.data)
      const mensaje = error.response?.data?.mensaje || 'Error al actualizar el perfil'
      toast.error(mensaje)
    } finally {
      setGuardando(false)
    }
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const eliminarFotoPerfil = () => {
    setForm(prev => ({ ...prev, fotoPerfil: '' }))
    toast.success('Foto de perfil eliminada')
  }

  const getIniciales = () => {
    const nombre = perfil?.nombre || form.nombre || '?'
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (cargando) {
    return (
      <div className="perfil-cargando">
        <div className="perfil-cargando-spinner"></div>
        <span>Cargando perfil...</span>
      </div>
    )
  }

  return (
    <div className="perfil-contenedor">
      <div className="perfil-header">
        <motion.button
          className="perfil-boton-volver"
          onClick={() => navigate('/habitos')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} />
          Volver a Hábitos
        </motion.button>
      </div>

      <div className="perfil-card-principal">
        {!modoEdicion && (
          <div className="perfil-info-banner">
            <Edit2 size={16} />
            <span>Haz clic en "Editar" para modificar tu información</span>
          </div>
        )}
        <div className="perfil-avatar-seccion">
          <div className="perfil-avatar-contenedor">
            {form.fotoPerfil ? (
              <img src={form.fotoPerfil} alt="Perfil" className="perfil-avatar-imagen" />
            ) : (
              <div className="perfil-avatar-grande">{getIniciales()}</div>
            )}
            {modoEdicion && (
              <>
                <button
                  className="perfil-avatar-cambiar"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  title="Cambiar foto de perfil"
                >
                  <Camera size={16} />
                </button>
                {form.fotoPerfil && (
                  <button
                    className="perfil-avatar-eliminar"
                    onClick={eliminarFotoPerfil}
                    type="button"
                    title="Eliminar foto de perfil"
                  >
                    <X size={14} />
                  </button>
                )}
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          <h1 className="perfil-nombre">{form.nombre || 'Usuario'}</h1>
          <p className="perfil-fecha">
            <Calendar size={14} />
            Miembro desde {perfil?.fechaRegistro ? formatearFecha(perfil.fechaRegistro) : 'Fecha no disponible'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="perfil-form">
          <div className="perfil-seccion">
            <div className="perfil-seccion-header">
              <div className="perfil-seccion-info">
                <h2 className="perfil-seccion-titulo">
                  <User size={20} />
                  Información Personal
                </h2>
              </div>
              {!modoEdicion && (
                <motion.button
                  type="button"
                  className="perfil-boton-editar-inline"
                  onClick={() => setModoEdicion(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit2 size={16} />
                  Editar
                </motion.button>
              )}
            </div>
            
            <div className="perfil-campo">
              <label className="perfil-label">
                <User size={16} />
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                className="perfil-input"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                disabled={!modoEdicion}
                required
              />
            </div>

            <div className="perfil-campo">
              <label className="perfil-label">
                <Mail size={16} />
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                className="perfil-input"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                disabled={!modoEdicion}
                required
              />
            </div>

            <div className="perfil-campo">
              <label className="perfil-label">
                <Phone size={16} />
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                name="telefono"
                className="perfil-input"
                value={form.telefono}
                onChange={handleChange}
                placeholder="+34 600 000 000"
                disabled={!modoEdicion}
              />
            </div>
          </div>

          <div className="perfil-seccion">
            <div className="perfil-seccion-header">
              <div className="perfil-seccion-info">
                <h2 className="perfil-seccion-titulo">
                  <Bell size={20} />
                  Preferencias de Notificaciones
                </h2>
                <p className="perfil-seccion-descripcion">
                  Configura cómo quieres recibir notificaciones de la app
                </p>
              </div>
              {!modoEdicion && (
                <motion.button
                  type="button"
                  className="perfil-boton-editar-inline"
                  onClick={() => setModoEdicion(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit2 size={16} />
                  Editar
                </motion.button>
              )}
            </div>

            <div className="perfil-switches">
              <label className={`perfil-switch ${!modoEdicion ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  name="notificacionesEmail"
                  checked={form.notificacionesEmail}
                  onChange={handleChange}
                  disabled={!modoEdicion || !form.emailVerificado}
                />
                <span className="perfil-switch-slider"></span>
                <div className="perfil-switch-info">
                  <span className="perfil-switch-titulo">
                    Notificaciones por Email 
                    {form.notificacionesEmail && form.emailVerificado && <span style={{color: '#22c55e', marginLeft: '8px'}}>✓ Activo</span>}
                    {!form.emailVerificado && <span style={{color: '#f59e0b', marginLeft: '8px'}}>🔒 Requiere verificación</span>}
                  </span>
                  <span className="perfil-switch-descripcion">
                    Recibe consejos diarios de EliasHealthy y recordatorios directamente en tu bandeja de entrada
                    {!form.emailVerificado && (
                      <div style={{color: '#f59e0b', fontSize: '12px', marginTop: '8px'}}>
                        💡 <button 
                          type="button" 
                          onClick={solicitarVerificacionEmail}
                          disabled={!modoEdicion}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#7c6aff',
                            textDecoration: 'underline',
                            cursor: modoEdicion ? 'pointer' : 'not-allowed',
                            fontSize: '12px',
                            padding: '0',
                            marginRight: '10px'
                          }}
                        >
                          Verificar email primero
                        </button>
                        <button 
                          type="button" 
                          onClick={async () => {
                            try {
                              const baseUrl = window.location.origin.includes('localhost') 
                                ? 'http://localhost:5000' 
                                : 'https://back-production-4f9d.up.railway.app'
                              const response = await fetch(`${baseUrl}/api/VerificacionEmail/test`)
                              const data = await response.json()
                              console.log('Test response:', data)
                              toast.success('Conexión OK: ' + data.mensaje)
                            } catch (error) {
                              console.error('Test error:', error)
                              toast.error('Error de conexión: ' + error.message)
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#22c55e',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: '0'
                          }}
                        >
                          [Test conexión]
                        </button> para activar esta opción
                      </div>
                    )}
                  </span>
                </div>
              </label>

              <label className={`perfil-switch ${!modoEdicion ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  name="notificacionesPush"
                  checked={form.notificacionesPush}
                  onChange={handleChange}
                  disabled={!modoEdicion}
                />
                <span className="perfil-switch-slider"></span>
                <div className="perfil-switch-info">
                  <span className="perfil-switch-titulo">Notificaciones en la App</span>
                  <span className="perfil-switch-descripcion">
                    Recibe notificaciones dentro de la aplicación
                  </span>
                </div>
              </label>
            </div>
          </div>

          {modoEdicion && (
            <div className="perfil-botones">
              <motion.button
                type="button"
                className="perfil-boton-cancelar"
                onClick={() => {
                  setModoEdicion(false)
                  cargarPerfil()
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                className="perfil-boton-guardar"
                disabled={guardando}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={18} />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </motion.button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
