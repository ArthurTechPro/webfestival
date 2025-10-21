import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

// === ESTILOS INLINE ===
const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: 'white',
    fontFamily: '"Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    scrollBehavior: 'smooth' as const
  },
  navbar: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'rgba(26, 26, 46, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1rem 0',
    transition: 'all 0.3s ease'
  },
  navbarScrolled: {
    background: 'rgba(26, 26, 46, 0.98)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    padding: '0.75rem 0'
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#346CB0',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.3s ease',
    cursor: 'pointer'
  },
  heroSection: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as const,
    paddingTop: '80px'
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    textAlign: 'center' as const,
    position: 'relative' as const,
    zIndex: 1
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '800',
    lineHeight: 1.1,
    marginBottom: '2rem',
    background: 'linear-gradient(45deg, #346CB0, #4a7bc8, #00A28A)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: '#e5e7eb',
    marginBottom: '3rem',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginBottom: '4rem'
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none'
  },
  buttonPrimary: {
    background: '#346CB0',
    color: 'white'
  },
  buttonOutline: {
    background: 'transparent',
    color: '#346CB0',
    border: '2px solid #346CB0'
  },
  featuresSection: {
    padding: '6rem 0',
    background: 'rgba(255, 255, 255, 0.02)'
  },
  featuresContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem'
  },
  sectionTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    textAlign: 'center' as const,
    marginBottom: '1rem',
    color: 'white'
  },
  sectionSubtitle: {
    fontSize: '1.1rem',
    color: '#e5e7eb',
    textAlign: 'center' as const,
    marginBottom: '4rem',
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center' as const,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    display: 'block'
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'white'
  },
  featureDescription: {
    color: '#e5e7eb',
    lineHeight: 1.6
  },
  statsSection: {
    padding: '4rem 0',
    background: 'rgba(52, 108, 176, 0.1)'
  },
  statsContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem'
  },
  statItem: {
    textAlign: 'center' as const
  },
  statNumber: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#346CB0',
    display: 'block',
    marginBottom: '0.5rem'
  },
  statLabel: {
    fontSize: '1rem',
    color: '#e5e7eb',
    fontWeight: '500'
  },
  footer: {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '4rem 0 2rem'
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    textAlign: 'center' as const
  }
};

// === COMPONENTE PRINCIPAL ===
const LandingPageNoSCSS: React.FC = () => {
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
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={{
        ...styles.navbar,
        ...(isScrolled ? styles.navbarScrolled : {})
      }}>
        <div style={styles.navContent}>
          <a 
            href="#home" 
            style={styles.logo}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
          >
            WebFestival
          </a>
          
          <div style={styles.navLinks}>
            <a 
              href="#features" 
              style={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              Características
            </a>
            <a 
              href="#stats" 
              style={styles.navLink}
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
                ...styles.button,
                ...styles.buttonPrimary
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            La Plataforma Definitiva para
            <br />
            Concursos Multimedia
          </h1>
          <p style={styles.heroSubtitle}>
            Conecta artistas creativos, jurados profesionales y organizadores en un ecosistema 
            completo para concursos de fotografía, video, audio y cortos de cine.
          </p>
          <div style={styles.heroActions}>
            <button 
              onClick={() => navigate('/register')}
              style={{
                ...styles.button,
                ...styles.buttonPrimary
              }}
            >
              Registrarse Gratis
            </button>
            <button 
              onClick={() => navigate('/login')}
              style={{
                ...styles.button,
                ...styles.buttonOutline
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.featuresContent}>
          <h2 style={styles.sectionTitle}>
            Todo lo que Necesitas para Concursos Creativos
          </h2>
          <p style={styles.sectionSubtitle}>
            Una plataforma completa diseñada para artistas, jurados y organizadores 
            con herramientas profesionales y evaluación especializada.
          </p>
          
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div 
                key={index} 
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(52, 108, 176, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={styles.featureIcon}>{feature.icon}</span>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" style={styles.statsSection}>
        <div style={styles.statsContent}>
          <div style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.statItem}>
                <span style={styles.statNumber}>{stat.number}</span>
                <span style={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
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
                ...styles.button,
                ...styles.buttonPrimary
              }}
            >
              Comenzar Ahora
            </button>
            <button
              onClick={() => navigate('/showcase')}
              style={{
                ...styles.button,
                ...styles.buttonOutline
              }}
            >
              Ver Demo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageNoSCSS;