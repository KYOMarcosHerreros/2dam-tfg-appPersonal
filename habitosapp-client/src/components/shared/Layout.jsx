import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { obtenerNotificaciones } from '../../api/notificaciones'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Bot,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Cloud,
  MessageSquare
} from 'lucide-react'
import './Layout.css'

function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c6aff" />
          <stop offset="100%" stopColor="#ff6ab0" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#logoGrad)" />
      <path d="M18 6C13 6 9 10 9 15C9 18.5 11 21.5 14 23V28C14 28.6 14.4 29 15 29H21C21.6 29 22 28.6 22 28V23C25 21.5 27 18.5 27 15C27 10 23 6 18 6Z" fill="white" />
      <rect x="15" y="24" width="6" height="1.5" rx="0.75" fill="white" />
      <rect x="15" y="26" width="6" height="1.5" rx="0.75" fill="white" />
    </svg>
  )
}

const navItems = [
  { ruta: '/dashboard', icono: LayoutDashboard, etiqueta: 'Inicio' },
  { ruta: '/habitos', icono: CheckSquare, etiqueta: 'Hábitos' },
  { ruta: '/estadisticas', icono: BarChart2, etiqueta: 'Estadísticas' },
  { ruta: '/foro', icono: MessageSquare, etiqueta: 'Foro' },
  { ruta: '/tiempo', icono: Cloud, etiqueta: 'Tiempo' },
  { ruta: '/asistente', icono: Bot, etiqueta: 'Asistente IA' },
  { ruta: '/notificaciones', icono: Bell, etiqueta: 'Notificaciones' },
]

export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    cargarNotificaciones()
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000)
    // Escuchar evento personalizado cuando se marcan notificaciones
    window.addEventListener('notificacionesActualizadas', cargarNotificaciones)
    // Escuchar evento personalizado cuando se actualiza el perfil
    const handlePerfilActualizado = () => {
      // Forzar re-render del componente
      setMenuAbierto(false)
    }
    window.addEventListener('perfilActualizado', handlePerfilActualizado)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('notificacionesActualizadas', cargarNotificaciones)
      window.removeEventListener('perfilActualizado', handlePerfilActualizado)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false)
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setMenuAbierto(false)
      }
    }

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [menuAbierto])

  const cargarNotificaciones = async () => {
    try {
      const response = await obtenerNotificaciones()
      const noLeidas = response.data.filter(n => !n.leida).length
      setNotificacionesNoLeidas(noLeidas)
    } catch (error) {
      // Silencioso - no mostrar error si falla
      console.error('Error al cargar notificaciones:', error)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const iniciales = usuario?.nombre
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className="layout-contenedor">
      <motion.aside
        className="layout-sidebar"
        initial={{ x: -240, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="layout-logo">
          <Logo size={30} />
          <span className="layout-logo-texto">HabitosApp</span>
        </div>

        <nav className="layout-nav">
          {navItems.map((item, i) => (
            <motion.div
              key={item.ruta}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <NavLink
                to={item.ruta}
                className={({ isActive }) =>
                  `layout-nav-item ${isActive ? 'activo' : ''}`
                }
              >
                <item.icono size={18} />
                {item.etiqueta}
                {item.ruta === '/notificaciones' && notificacionesNoLeidas > 0 && (
                  <span className="layout-nav-badge">
                    {notificacionesNoLeidas > 99 ? '+99' : notificacionesNoLeidas}
                  </span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="layout-nav-separador" />

        <motion.button
          className="layout-sidebar-logout"
          onClick={handleLogout}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.15 }}
        >
          <LogOut size={18} />
          Cerrar sesión
        </motion.button>
      </motion.aside>

          <div className="layout-topbar">
              <motion.div
                  className="layout-topbar-usuario"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  ref={menuRef}
              >
                  <button 
                    className="layout-topbar-boton"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                  >
                    {usuario?.fotoPerfil ? (
                      <img 
                        src={usuario.fotoPerfil} 
                        alt="Perfil" 
                        className="layout-topbar-avatar-imagen" 
                      />
                    ) : (
                      <div className="layout-topbar-avatar">{iniciales}</div>
                    )}
                    <div>
                        <div className="layout-topbar-nombre">{usuario?.nombre}</div>
                        <div className="layout-topbar-email">{usuario?.email}</div>
                    </div>
                    <ChevronDown size={16} className={`layout-topbar-chevron ${menuAbierto ? 'abierto' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {menuAbierto && (
                      <motion.div
                        className="layout-topbar-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          className="layout-topbar-menu-item"
                          onClick={() => {
                            navigate('/perfil')
                            setMenuAbierto(false)
                          }}
                        >
                          <User size={16} />
                          Ver Perfil
                        </button>
                        <div className="layout-topbar-menu-separador" />
                        <button
                          className="layout-topbar-menu-item logout"
                          onClick={() => {
                            handleLogout()
                            setMenuAbierto(false)
                          }}
                        >
                          <LogOut size={16} />
                          Cerrar Sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="layout-topbar-separador" />
              </motion.div>
          </div>

      <main className="layout-contenido">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}