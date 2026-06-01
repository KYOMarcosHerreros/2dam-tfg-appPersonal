import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, Sparkles } from 'lucide-react';
import Logo from '../shared/Logo';
import BrandText from '../shared/BrandText';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-contenedor">
      {/* Barra de Navegación */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <Logo size={32} />
          <BrandText size="normal" />
        </div>
        <div className="landing-nav-botones">
          <button className="btn-login" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Sección Principal (Hero) */}
      <header className="landing-hero">
        <motion.div 
          className="hero-contenido"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="hero-titulo">
            Transforma tu vida, <br />
            <span className="texto-destacado">un hábito a la vez.</span>
          </h1>
          <p className="hero-subtitulo">
            BetterYOU es tu compañero personal para construir rutinas saludables, 
            rastrear tu progreso y conectar con una comunidad que te motiva a mejorar cada día.
          </p>
          <button className="btn-comenzar" onClick={() => navigate('/login')}>
            Comienza tu viaje ahora
          </button>
        </motion.div>
      </header>

      {/* Sección de Características */}
      <section className="landing-caracteristicas">
        <div className="caracteristicas-grid">
          <motion.div className="caracteristica-card" whileHover={{ y: -5 }}>
            <div className="icono-contenedor"><Target size={28} /></div>
            <h3>Sigue tu Progreso</h3>
            <p>Registra tus hábitos diarios y mantén tus rachas vivas. La constancia es la clave del éxito.</p>
          </motion.div>

          <motion.div className="caracteristica-card" whileHover={{ y: -5 }}>
            <div className="icono-contenedor"><TrendingUp size={28} /></div>
            <h3>Estadísticas Detalladas</h3>
            <p>Visualiza tu evolución con gráficos claros y descubre en qué áreas estás brillando más.</p>
          </motion.div>

          <motion.div className="caracteristica-card" whileHover={{ y: -5 }}>
            <div className="icono-contenedor"><Users size={28} /></div>
            <h3>Comunidad y Foro</h3>
            <p>Comparte tus logros, resuelve dudas y encuentra inspiración en nuestra comunidad activa.</p>
          </motion.div>

          <motion.div className="caracteristica-card" whileHover={{ y: -5 }}>
            <div className="icono-contenedor"><Sparkles size={28} /></div>
            <h3>Asistente IA</h3>
            <p>Recibe consejos personalizados y recomendaciones inteligentes basadas en tu rendimiento.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <Logo size={24} />
          <BrandText size="small" />
        </div>
        <p>© 2026 BetterYOU. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}