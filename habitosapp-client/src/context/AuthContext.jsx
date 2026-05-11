import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado)
      const usuario = JSON.parse(usuarioGuardado)
      // Asegurar que el usuario tenga la estructura correcta
      setUsuario({
        nombre: usuario.nombre,
        email: usuario.email,
        fotoPerfil: usuario.fotoPerfil || null
      })
    }
    setCargando(false)

    // Escuchar evento de logout automático
    const handleAutoLogout = () => {
      setToken(null)
      setUsuario(null)
    }

    window.addEventListener('auth-logout', handleAutoLogout)
    
    return () => {
      window.removeEventListener('auth-logout', handleAutoLogout)
    }
  }, [])

  const login = (datos) => {
    console.log('🔐 Guardando datos de login:', { 
      token: datos.token ? datos.token.substring(0, 20) + '...' : 'NO TOKEN',
      nombre: datos.nombre,
      email: datos.email 
    })
    
    localStorage.setItem('token', datos.token)
    localStorage.setItem('usuario', JSON.stringify({ 
      nombre: datos.nombre, 
      email: datos.email,
      fotoPerfil: datos.fotoPerfil || null
    }))
    setToken(datos.token)
    setUsuario({ 
      nombre: datos.nombre, 
      email: datos.email,
      fotoPerfil: datos.fotoPerfil || null
    })
    
    console.log('✅ Login completado, token guardado')
  }

  const actualizarUsuario = (datosUsuario) => {
    const usuarioActualizado = { ...usuario, ...datosUsuario }
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
    setUsuario(usuarioActualizado)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('chat-mensajes') // Limpiar historial del chat
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, actualizarUsuario, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}