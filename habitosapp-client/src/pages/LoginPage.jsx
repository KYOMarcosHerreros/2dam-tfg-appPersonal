import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import cliente from '../api/cliente'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import Logo from '../shared/Logo'
import BrandText from '../shared/BrandText'
import './LoginPage.css'

const reglas = [
  { id: 'longitud', texto: 'Mínimo 8 caracteres', check: (p) => p.length >= 8 },
  { id: 'mayuscula', texto: 'Al menos una mayúscula', check: (p) => /[A-Z]/.test(p) },
  { id: 'numero', texto: 'Al menos un número', check: (p) => /[0-9]/.test(p) },
]

export default function LoginPage() {
  const [modo, setModo] = useState('login')
  const [verPassword, setVerPassword] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmarPassword: '' })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const passwordValida = reglas.every(r => r.check(form.password))
  const passwordsCoinciden = form.password === form.confirmarPassword
  const confirmarTocado = form.confirmarPassword.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (modo === 'registro') {
      if (!passwordValida) {
        toast.error('La contraseña no cumple los requisitos')
        return
      }
      if (!passwordsCoinciden) {
        toast.error('Las contraseñas no coinciden')
        return
      }
    }
    setCargando(true)
    try {
      if (modo === 'login') {
        const { data } = await cliente.post('/auth/login', {
          email: form.email,
          password: form.password
        })
        login(data)
        toast.success(`¡Bienvenido de vuelta, ${data.nombre}!`)
        navigate('/dashboard')
      } else {
        await cliente.post('/auth/registrar', {
          nombre: form.nombre,
          email: form.email,
          password: form.password
        })
        toast.success('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión')
        setModo('login')
        setForm({ nombre: '', email: form.email, password: '', confirmarPassword: '' })
      }
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-contenedor">
      <div className="login-fondo">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="login-orbe"
            style={{
              left: i === 0 ? '10%' : i === 1 ? '60%' : '30%',
              top: i === 0 ? '10%' : i === 1 ? '50%' : '70%',
              width: i === 0 ? '400px' : i === 1 ? '300px' : '350px',
              height: i === 0 ? '400px' : i === 1 ? '300px' : '350px',
              background: i === 0
                ? 'radial-gradient(circle, rgba(34,197,94,0.15), transparent)'
                : i === 1
                  ? 'radial-gradient(circle, rgba(245,158,11,0.12), transparent)'
                  : 'radial-gradient(circle, rgba(16,185,129,0.08), transparent)',
            }}
            animate={{ y: [0, -30, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
          />
        ))}
      </div>

      <motion.div
        className="login-tarjeta"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="login-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Logo size={36} />
          <BrandText size="normal" className="login-logo-texto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="login-titulo">
            {modo === 'login' ? 'Bienvenido de vuelta' : 'Empieza hoy'}
          </h1>
          <p className="login-subtitulo">
            {modo === 'login'
              ? 'Continúa construyendo tus hábitos'
              : 'Crea tu cuenta y transforma tu rutina'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="login-form">
          <AnimatePresence mode="wait">
            {modo === 'registro' && (
              <motion.div
                key="nombre"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="login-campo">
                  <label className="login-label">Nombre</label>
                  <input
                    className="login-input"
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="login-campo">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-campo">
            <label className="login-label">Contraseña</label>
            <div className="login-input-contenedor">
              <input
                className="login-input login-input-password"
                type={verPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <button type="button" className="login-ojo" onClick={() => setVerPassword(!verPassword)}>
                {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {modo === 'registro' && (passwordFocused || form.password.length > 0) && (
                <motion.div
                  className="login-reglas"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {reglas.map(regla => (
                    <div key={regla.id} className="login-regla-item">
                      {regla.check(form.password)
                        ? <CheckCircle size={13} color="#22c55e" />
                        : <XCircle size={13} color="#555" />
                      }
                      <span className={`login-regla-texto ${regla.check(form.password) ? 'cumplida' : 'no-cumplida'}`}>
                        {regla.texto}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {modo === 'registro' && (
              <motion.div
                key="confirmar"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="login-campo"
              >
                <label className="login-label">Confirmar contraseña</label>
                <div className="login-input-contenedor">
                  <input
                    className={`login-input login-input-password ${confirmarTocado ? passwordsCoinciden ? 'input-valido' : 'input-error' : ''}`}
                    type={verConfirmar ? 'text' : 'password'}
                    name="confirmarPassword"
                    placeholder="••••••••"
                    value={form.confirmarPassword}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="login-ojo" onClick={() => setVerConfirmar(!verConfirmar)}>
                    {verConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <AnimatePresence>
                  {confirmarTocado && !passwordsCoinciden && (
                    <motion.span
                      className="login-mensaje-error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Las contraseñas no coinciden
                    </motion.span>
                  )}
                  {confirmarTocado && passwordsCoinciden && (
                    <motion.span
                      className="login-mensaje-exito"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Las contraseñas coinciden ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className="login-boton-principal"
            type="submit"
            disabled={cargando}
            whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(34,197,94,0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            {cargando ? (
              <motion.div
                className="login-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
            )}
          </motion.button>
        </form>

        <motion.div
          className="login-cambiar-modo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>
            {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </span>
          <button
            className="login-boton-texto"
            onClick={() => {
              setModo(modo === 'login' ? 'registro' : 'login')
              setForm({ nombre: '', email: '', password: '', confirmarPassword: '' })
            }}
          >
            {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}