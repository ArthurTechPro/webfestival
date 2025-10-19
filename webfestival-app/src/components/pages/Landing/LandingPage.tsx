import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import styles from './LandingPage.module.scss';

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
  },
  {
    icon: '📚',
    title: 'Contenido Educativo',
    description: 'Accede a tutoriales, guías y consejos para mejorar tus habilidades creativas.'
  },
  {
    icon: '🔧',
    title: 'Herramientas Avanzadas',
    description: 'Utiliza nuestras herramientas de gestión multimedia con integración Immich.'
  }
];

const stats: StatData[] = [
  { number: '10K+', label: 'Artistas Registrados' },
  { number: '500+', label: 'Concursos Realizados' },
  { number: '50K+', label: 'Obras Subidas' },
  { number: '100+', label: 'Jurados Profesionales' }
];

// === COMPONENTE PRINCIPAL ===
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
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
            <a 
              href="#cta" 
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('cta');
              }}
            >
              Únete
            </a>
            <Button 
              variant="professional" 
              size="sm"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
          </div>

          <button 
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menú móvil"
          >
            ☰
          </button>
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
            <Button 
              variant="professional" 
              size="lg"
              onClick={() => navigate('/register')}
            >
              Registrarse Gratis
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
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

      {/* CTA Section */}
      <section id="cta" className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            ¿Listo para Mostrar tu Talento?
          </h2>
          <p className={styles.ctaDescription}>
            Únete a miles de artistas creativos y comienza a participar en concursos 
            profesionales con evaluación especializada.
          </p>
          <div className={styles.heroActions}>
            <Button 
              variant="professional" 
              size="lg"
              onClick={() => navigate('/register')}
            >
              Registrarse Gratis
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/showcase')}
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>WebFestival</h4>
              <p>
                La plataforma líder en concursos multimedia online que conecta 
                artistas creativos con jurados profesionales.
              </p>
            </div>
            
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Plataforma</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#features">Características</a></li>
                <li><a href="#pricing">Precios</a></li>
                <li><a href="#gallery">Galería</a></li>
                <li><a href="#blog">Blog</a></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Comunidad</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#artists">Artistas</a></li>
                <li><a href="#judges">Jurados</a></li>
                <li><a href="#organizers">Organizadores</a></li>
                <li><a href="#support">Soporte</a></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Legal</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#privacy">Privacidad</a></li>
                <li><a href="#terms">Términos</a></li>
                <li><a href="#cookies">Cookies</a></li>
                <li><a href="#contact">Contacto</a></li>
              </ul>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div className={styles.socialLinks}>
              <a href="#facebook" aria-label="Facebook">📘</a>
              <a href="#instagram" aria-label="Instagram">📷</a>
              <a href="#twitter" aria-label="Twitter">🐦</a>
              <a href="#linkedin" aria-label="LinkedIn">💼</a>
              <a href="#youtube" aria-label="YouTube">📺</a>
            </div>
            <p>
              © 2024 WebFestival. Todos los derechos reservados. 
              Hecho con ❤️ para la comunidad creativa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;