import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import Layout from './components/shared/Layout'
import InicioPage from './pages/InicioPage'
import HabitosPage from './pages/HabitosPage'
import EstadisticasPage from './pages/EstadisticasPage'
import AsistentePage from './pages/AsistentePage'
import NotificacionesPage from './pages/NotificacionesPage'
import PerfilPage from './pages/PerfilPage'
import VerificarEmailPage from './pages/VerificarEmailPage'
import TiempoPage from './pages/TiempoPage'
import ForoPage from './pages/ForoPage'
import ForoTemaPage from './pages/ForoTemaPage'
import ForoNuevoTemaPage from './pages/ForoNuevoTemaPage'

const queryClient = new QueryClient()

function RutaProtegida({ children }) {
  const { token, cargando } = useAuth()
  if (cargando) return null
  if (!token) return <Navigate to="/login" />
  return <Layout>{children}</Layout>
}

function AppRutas() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Dashboard */}
      <Route path="/dashboard" element={
        <RutaProtegida>
          <InicioPage />
        </RutaProtegida>
      } />

      {/* LA RUTA CORRECTA DE HÁBITOS (Solo una y con el componente real) */}
      <Route path="/habitos" element={
        <RutaProtegida>
          <HabitosPage />
        </RutaProtegida>
      } />

      <Route path="/estadisticas" element={
        <RutaProtegida>
          <EstadisticasPage />
        </RutaProtegida>
      } />

      <Route path="/asistente" element={
        <RutaProtegida>
          <AsistentePage />
        </RutaProtegida>
      } />

      <Route path="/notificaciones" element={
        <RutaProtegida>
          <NotificacionesPage />
        </RutaProtegida>
      } />

      <Route path="/perfil" element={
        <RutaProtegida>
          <PerfilPage />
        </RutaProtegida>
      } />

      <Route path="/verificar-email" element={
        <RutaProtegida>
          <VerificarEmailPage />
        </RutaProtegida>
      } />

      <Route path="/tiempo" element={
        <RutaProtegida>
          <TiempoPage />
        </RutaProtegida>
      } />

      <Route path="/foro" element={
        <RutaProtegida>
          <ForoPage />
        </RutaProtegida>
      } />

      <Route path="/foro/tema/:id" element={
        <RutaProtegida>
          <ForoTemaPage />
        </RutaProtegida>
      } />

      <Route path="/foro/nuevo" element={
        <RutaProtegida>
          <ForoNuevoTemaPage />
        </RutaProtegida>
      } />

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161616',
                color: '#f0f0f0',
                border: '1px solid #2a2a2a',
                fontFamily: 'DM Sans, sans-serif',
              },
              success: {
                iconTheme: { primary: '#aaff00', secondary: '#0a0a0a' }
              }
            }}
          />
          <AppRutas />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}