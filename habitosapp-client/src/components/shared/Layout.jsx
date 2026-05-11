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
  MessageSquare,
  Menu,
  X
} from 'lucide-react'
import Logo from '../../shared/Logo'
import BrandText from '../../shared/BrandText'
import './Layout.css'

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
  const [sidebarAbierta, setSidebarAbierta] = useState(false)
  const menuRef = useRef(null)
  const sidebarRef = useRef(null)

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
      // Cerrar sidebar en móvil si se hace clic fuera
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth <= 768) {
        setSidebarAbierta(false)
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setMenuAbierto(false)
        setSidebarAbierta(false)
      }
    }

    if (menuAbierto || sidebarAbierta) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [menuAbierto, sidebarAbierta])

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

  const handleNavClick = () => {
    // Cerrar sidebar en móvil cuando se navega
    if (window.innerWidth <= 768) {
      setSidebarAbierta(false)
    }
  }

  const iniciales = usuario?.nombre
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className="layout-contenedor">
      {/* Overlay para móvil */}
      <AnimatePresence>
        {sidebarAbierta && (
          <motion.div
            className="layout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarAbierta(false)}
          />
        )}
      </AnimatePresence>

      {/* Botón hamburguesa para móvil */}
      <button
        className="layout-hamburger"
        onClick={() => setSidebarAbierta(!sidebarAbierta)}
        aria-label="Abrir menú"
      >
        {sidebarAbierta ? <X size={24} /> : <Menu size={24} />}
      </button>

      <motion.aside
        ref={sidebarRef}
        className={`layout-sidebar ${sidebarAbierta ? 'abierta' : ''}`}
        initial={{ x: -240, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          transform: window.innerWidth <= 768 && !sidebarAbierta ? 'translateX(-100%)' : 'translateX(0)'
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="layout-logo">
          <Logo size={30} />
          <BrandText size="normal" className="layout-logo-texto" />
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
                onClick={handleNavClick}
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