import React, { useState } from 'react';

const SimpleLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de login
    console.log('Login attempt:', { email, password });
    alert('Funcionalidad de login en desarrollo');
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '3rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            background: 'linear-gradient(45deg, #346CB0, #4a7bc8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            WebFestival
          </h1>
          <p style={{ color: '#e5e7eb', fontSize: '1rem' }}>
            Iniciar Sesión
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#e5e7eb',
              fontSize: '0.9rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#e5e7eb',
              fontSize: '0.9rem'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: '#346CB0',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Iniciar Sesión
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleBackToHome}
              style={{
                background: 'transparent',
                color: '#346CB0',
                border: '1px solid #346CB0',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              ← Volver al Inicio
            </button>
            
            <button
              type="button"
              onClick={() => window.location.href = '/register'}
              style={{
                background: 'transparent',
                color: '#e5e7eb',
                border: 'none',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleLoginPage;