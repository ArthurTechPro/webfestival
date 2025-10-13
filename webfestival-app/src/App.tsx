import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Crear instancia de QueryClient para TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente temporal de página principal
const HomePage = () => (
  <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-8 text-center">
        <h1 className="display-4 text-primary mb-4">WebFestival App</h1>
        <p className="lead">
          Plataforma de concursos multimedia para artistas creativos
        </p>
        <div className="alert alert-info" role="alert">
          <strong>Configuración inicial completada!</strong>
          <br />
          React 19+ ✓ | Vite 5+ ✓ | TypeScript 5+ ✓ | Bootstrap 5.3+ ✓
          <br />
          React Router 6+ ✓ | TanStack Query 5+ ✓ | Zustand 4+ ✓ | Axios 1.6+ ✓
          <br />
          Vitest 1+ ✓ | React Testing Library ✓ | ESLint ✓ | Prettier ✓
        </div>
        <p className="text-muted">
          API URL configurada: {import.meta.env.VITE_API_URL}
        </p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Aquí se agregarán más rutas en futuras tareas */}
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
