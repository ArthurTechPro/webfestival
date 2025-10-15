import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Landing Page con tema oscuro estilo Looper
 * Página de entrada fullscreen para WebFestival Platform
 */
const LandingPageDark: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Manejar scroll para navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevenir scroll del body
  useEffect(() => {
    document.body.classList.add('wf-no-scroll');
    
    return () => {
      document.body.classList.remove('wf-no-scroll');
    };
  }, []);

  return (
    <div className="wf-landing-dark">
      {/* Navbar */}
      <nav className={`wf-navbar-dark ${isScrolled ? 'wf-navbar-scrolled' : ''}`}>
        <div className="wf-navbar-container">
          <Link to="/" className="wf-navbar-brand">
            <div className="wf-navbar-logo">
              🎬
            </div>
            WebFestival
          </Link>
          
          <div className="wf-navbar-nav">
            <Link to="/gallery" className="wf-nav-link">
              Galería
            </Link>
            <Link to="/concursos" className="wf-nav-link">
              Concursos
            </Link>
            <Link to="/about" className="wf-nav-link">
              Acerca de
            </Link>
            <Link to="/login" className="wf-btn-hero-primary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="wf-hero-dark">
        <div className="wf-hero-content">
          <div className="wf-hero-grid">
            <div className="wf-hero-text wf-fade-in-up">
              <h1 className="wf-hero-title">
                Bienvenido al <strong>Festival</strong> de <strong>Creatividad</strong> Digital
              </h1>
              <p className="wf-hero-subtitle">
                Descubre, participa y conecta con una comunidad global de artistas creativos. 
                Compite en concursos de fotografía, video, audio y cortometrajes.
              </p>
              <div className="wf-hero-buttons">
                <Link to="/register" className="wf-btn-hero-primary">
                  Comenzar Ahora
                  <i className="fas fa-arrow-right"></i>
                </Link>
                <Link to="/gallery" className="wf-btn-hero-secondary">
                  Explorar Galería
                </Link>
              </div>
            </div>
            
            <div className="wf-hero-visual">
              <div className="wf-hero-illustration wf-float-animation">
                {/* Ilustración SVG personalizada */}
                <svg width="500" height="400" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Fondo con gradiente */}
                  <defs>
                    <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#346CB0" />
                      <stop offset="100%" stopColor="#4a7bc8" />
                    </linearGradient>
                    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00A28A" />
                      <stop offset="100%" stopColor="#F7C46C" />
                    </linearGradient>
                  </defs>
                  
                  {/* Elementos de fondo */}
                  <circle cx="400" cy="100" r="60" fill="url(#heroGradient)" opacity="0.3" />
                  <circle cx="100" cy="300" r="40" fill="url(#accentGradient)" opacity="0.4" />
                  
                  {/* Cámara principal */}
                  <rect x="150" y="120" width="200" height="160" rx="20" fill="url(#heroGradient)" />
                  <rect x="170" y="140" width="160" height="120" rx="10" fill="#ffffff" opacity="0.9" />
                  <circle cx="250" cy="200" r="40" fill="url(#heroGradient)" />
                  <circle cx="250" cy="200" r="25" fill="#ffffff" />
                  
                  {/* Elementos multimedia */}
                  <rect x="50" y="80" width="60" height="40" rx="8" fill="url(#accentGradient)" />
                  <text x="80" y="105" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">📷</text>
                  
                  <rect x="390" y="200" width="60" height="40" rx="8" fill="url(#accentGradient)" />
                  <text x="420" y="225" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">🎥</text>
                  
                  <rect x="80" y="320" width="60" height="40" rx="8" fill="url(#heroGradient)" />
                  <text x="110" y="345" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">🎵</text>
                  
                  <rect x="360" y="320" width="60" height="40" rx="8" fill="url(#heroGradient)" />
                  <text x="390" y="345" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">🎬</text>
                  
                  {/* Líneas conectoras */}
                  <line x1="110" y1="120" x2="180" y2="160" stroke="url(#accentGradient)" strokeWidth="2" opacity="0.6" strokeDasharray="5,5" />
                  <line x1="390" y1="240" x2="320" y2="220" stroke="url(#accentGradient)" strokeWidth="2" opacity="0.6" strokeDasharray="5,5" />
                  <line x1="140" y1="320" x2="200" y2="280" stroke="url(#heroGradient)" strokeWidth="2" opacity="0.6" strokeDasharray="5,5" />
                  <line x1="360" y1="340" x2="300" y2="280" stroke="url(#heroGradient)" strokeWidth="2" opacity="0.6" strokeDasharray="5,5" />
                  
                  {/* Estrellas decorativas */}
                  <text x="450" y="50" fill="#F7C46C" fontSize="20">⭐</text>
                  <text x="30" y="50" fill="#F7C46C" fontSize="16">✨</text>
                  <text x="470" y="380" fill="#4a7bc8" fontSize="18">💫</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="wf-features-dark">
        <div className="wf-section-title">
          <h2>Explora Todas las Categorías</h2>
          <p>Participa en concursos multimedia y muestra tu talento creativo al mundo</p>
        </div>
        
        <div className="wf-features-grid">
          <div className="wf-feature-card wf-fade-in-up">
            <div className="wf-feature-icon">
              📷
            </div>
            <h3 className="wf-feature-title">Fotografía</h3>
            <p className="wf-feature-description">
              Captura momentos únicos y comparte tu visión artística a través de la fotografía profesional y creativa.
            </p>
          </div>
          
          <div className="wf-feature-card wf-fade-in-up">
            <div className="wf-feature-icon">
              🎥
            </div>
            <h3 className="wf-feature-title">Video</h3>
            <p className="wf-feature-description">
              Crea contenido audiovisual impactante y cuenta historias que conecten con audiencias globales.
            </p>
          </div>
          
          <div className="wf-feature-card wf-fade-in-up">
            <div className="wf-feature-icon">
              🎵
            </div>
            <h3 className="wf-feature-title">Audio</h3>
            <p className="wf-feature-description">
              Compone, produce y comparte tu música original en una plataforma dedicada a la excelencia sonora.
            </p>
          </div>
          
          <div className="wf-feature-card wf-fade-in-up">
            <div className="wf-feature-icon">
              🎬
            </div>
            <h3 className="wf-feature-title">Cortometrajes</h3>
            <p className="wf-feature-description">
              Desarrolla narrativas cinematográficas completas y participa en la categoría más prestigiosa del festival.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="wf-features-dark">
        <div className="wf-section-title">
          <h2>¿Listo para Comenzar?</h2>
          <p>Únete a miles de artistas que ya forman parte de nuestra comunidad creativa</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div className="wf-hero-buttons" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="wf-btn-hero-primary">
              Crear Cuenta Gratuita
              <i className="fas fa-user-plus"></i>
            </Link>
            <Link to="/login" className="wf-btn-hero-secondary">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="wf-footer-dark">
        <div className="wf-footer-content">
          <div className="wf-footer-links">
            <Link to="/about" className="wf-footer-link">Acerca de</Link>
            <Link to="/terms" className="wf-footer-link">Términos</Link>
            <Link to="/privacy" className="wf-footer-link">Privacidad</Link>
            <Link to="/contact" className="wf-footer-link">Contacto</Link>
            <Link to="/help" className="wf-footer-link">Ayuda</Link>
          </div>
          
          <div className="wf-footer-copyright">
            © 2024 WebFestival Platform. Plataforma profesional para concursos multimedia creativos.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageDark;