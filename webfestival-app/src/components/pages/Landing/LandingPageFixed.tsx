import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPageSimple.module.scss';

// === INTERFACES ===
interface FeatureData {
  icon: string;
  title: string;
  description: string;
}

interface StatData {
  number: string;
  label: string;
}

// === DATOS DE CONTENIDO ===
const features: FeatureData[] = [
  {
    icon: '📸',
    title: 'Concursos Multimedia',
    description: 'Participa en concursos de fotografía, video, audio y cortos de cine con evaluación profesional.'
  },
  {
    icon: '🏆',
    title: 'Evaluación Profesional',
    description: 'Jurados especializados evalúan tu trabajo con criterios específicos para cada tipo de medio.'
  },
  {
    icon: '🌟',
    title: 'Galería Pública',
    description: 'Muestra tus mejores trabajos en nuestra galería pública y gana reconocimiento.'
  },
  {
    icon: '👥',
    title: 'Comunidad Creativa',
    description: 'Conecta con otros artistas, sigue sus trabajos y participa en una comunidad activa.'
  }
];

const stats: StatData[] = [
  { number: '10K+', label: 'Artistas Registrados' },
  { number: '500+', label: 'Concursos Realizados' },
  { number: '50K+', label: 'Obras Subidas' },
  { number: '100+', label: 'Jurados Profesionales' }
];

// === COMPONENTE PRINCIPAL ===
const LandingPageFixed: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para scroll suave
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.landingContainer}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContent}>
          <a href="#home" className={styles.logo} onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}>
            WebFestival
          </a>
          
          <div className={styles.navLinks}>
            <a 
              href="#features" 
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              Características
            </a>
            <a 
              href="#stats" 
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('stats');
              }}
            >
              Estadísticas
            </a>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: '#346CB0',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} ${styles.fadeIn}`}>
            La Plataforma Definitiva para
            <br />
            Concursos Multimedia
          </h1>
          <p className={`${styles.heroSubtitle} ${styles.slideUp}`}>
            Conecta artistas creativos, jurados profesionales y organizadores en un ecosistema 
            completo para concursos de fotografía, video, audio y cortos de cine.
          </p>
          <div className={`${styles.heroActions} ${styles.scaleIn}`}>
            <button 
              onClick={() => navigate('/register')}
              style={{
                background: '#346CB0',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              Registrarse Gratis
            </button>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                color: '#346CB0',
                border: '2px solid #346CB0',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresContent}>
          <h2 className={styles.sectionTitle}>
            Todo lo que Necesitas para Concursos Creativos
          </h2>
          <p className={styles.sectionSubtitle}>
            Una plataforma completa diseñada para artistas, jurados y organizadores 
            con herramientas profesionales y evaluación especializada.
          </p>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className={styles.statsSection}>
        <div className={styles.statsContent}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>
              WebFestival 2025
            </h4>
            <p style={{ color: '#e5e7eb', marginBottom: '2rem' }}>
              La plataforma líder en concursos multimedia online que conecta 
              artistas creativos con jurados profesionales.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: '#346CB0',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Comenzar Ahora
              </button>
              <button
                onClick={() => navigate('/showcase')}
                style={{
                  background: 'transparent',
                  color: '#346CB0',
                  border: '2px solid #346CB0',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Ver Demo
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageFixed;