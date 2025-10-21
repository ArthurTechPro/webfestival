import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
      <h1>Página de Prueba</h1>
      <p>Si puedes ver esto, la aplicación está funcionando correctamente.</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Ir a Login
        </a>
      </div>
    </div>
  );
};

export default TestPage;