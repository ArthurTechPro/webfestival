import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';
// Estilos ya importados en main.tsx con globals.scss

// Importar páginas públicas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import GaleriaPublica from './pages/GaleriaPublica';
import ProfilePage from './pages/ProfilePage';

// Importar dashboards específicos por rol
import ParticipanteDashboard from './pages/ParticipanteDashboard';
import JuradoDashboard from './pages/JuradoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ContentAdminDashboard from './pages/ContentAdminDashboard';

// Importar componentes de layout y protección
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRedirect from './components/auth/RoleBasedRedirect';

// Importar componentes premium
import { Button, ThemeSelector } from './components/ui';
import StyleShowcaseSimple from './pages/StyleShowcaseSimple';
import ProfessionalComponentsDemoSimple from './pages/ProfessionalComponentsDemoSimple';
import ModernComponentsDemo from './pages/ModernComponentsDemo';
import { LandingPage } from './components/pages/Landing';

// Crear instancia de QueryClient para TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente principal simple y elegante
const HomePage = () => (
  <div className="wf-w-full wf-min-h-screen wf-bg-gradient-to-br wf-from-gray-900 wf-to-black wf-pt-16">
    {/* Hero simple de pantalla completa */}
    <div className="wf-w-full wf-min-h-screen wf-flex wf-items-center wf-justify-center wf-px-6">
      <div className="wf-text-center wf-max-w-4xl">
        <h1 className="wf-text-6xl wf-md:text-7xl wf-font-bold wf-text-white wf-mb-6">
          WebFestival 2024
        </h1>
        <h2 className="wf-text-2xl wf-md:text-3xl wf-text-primary wf-mb-8">
          Festival Internacional de Multimedia
        </h2>
        <p className="wf-text-lg wf-text-gray-300 wf-mb-12 wf-max-w-2xl wf-mx-auto">
          La plataforma más avanzada para concursos de fotografía, video, audio y cine. 
          Únete a la comunidad creativa más grande del mundo.
        </p>
        
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/login'}
          >
            Iniciar Sesión
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/register'}
          >
            Registrarse
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.location.href = '/showcase'}
          >
            Ver Demo Premium
          </Button>
        </div>
        
        <div className="mt-4">
          <Button
            variant="secondary"
            size="md"
            onClick={() => window.location.href = '/modern-demo'}
          >
            ✨ Nuevo Sistema CSS Modules
          </Button>
        </div>
      </div>
    </div>

    {/* Sección de características */}
    <section className="wf-w-full wf-py-20 wf-bg-gray-800">
      <div className="wf-w-full wf-px-6 wf-lg:px-8">
        <h2 className="wf-text-4xl wf-font-bold wf-text-center wf-text-white wf-mb-16">
          Experiencia Premium Implementada
        </h2>
        
        <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-2 wf-lg:grid-cols-4 wf-gap-8 wf-max-w-6xl wf-mx-auto">
          <div className="wf-bg-gray-900 wf-p-6 wf-rounded-lg wf-text-center wf-border wf-border-gray-700">
            <div className="wf-text-4xl wf-mb-4">🎭</div>
            <h3 className="wf-text-xl wf-font-semibold wf-mb-2 wf-text-white">Autenticación JWT</h3>
            <p className="wf-text-sm wf-text-gray-400">Sistema completo con roles y protección de rutas</p>
          </div>
          
          <div className="wf-bg-gray-900 wf-p-6 wf-rounded-lg wf-text-center wf-border wf-border-gray-700">
            <div className="wf-text-4xl wf-mb-4">✨</div>
            <h3 className="wf-text-xl wf-font-semibold wf-mb-2 wf-text-white">Efectos Premium</h3>
            <p className="wf-text-sm wf-text-gray-400">Glassmorphism y animaciones cinematográficas</p>
          </div>
          
          <div className="wf-bg-gray-900 wf-p-6 wf-rounded-lg wf-text-center wf-border wf-border-gray-700">
            <div className="wf-text-4xl wf-mb-4">🎬</div>
            <h3 className="wf-text-xl wf-font-semibold wf-mb-2 wf-text-white">Multimedia Premium</h3>
            <p className="wf-text-sm wf-text-gray-400">Reproductores estilo Netflix y Spotify</p>
          </div>
          
          <div className="wf-bg-gray-900 wf-p-6 wf-rounded-lg wf-text-center wf-border wf-border-gray-700">
            <div className="wf-text-4xl wf-mb-4">🎨</div>
            <h3 className="wf-text-xl wf-font-semibold wf-mb-2 wf-text-white">7 Temas</h3>
            <p className="wf-text-sm wf-text-gray-400">Incluyendo modo cinematográfico único</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

// Componente wrapper con tema
const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <div className="App wf-min-h-screen" data-theme={theme}>
      {/* Selector de tema flotante */}
      <div className="wf-fixed wf-top-4 wf-right-4 wf-z-50">
        <ThemeSelector showLabel={false} position="fixed" />
      </div>
      
      <Navbar />
      <main className="wf-main-content">
        <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/showcase" element={<StyleShowcaseSimple />} />
              <Route path="/professional-demo" element={<ProfessionalComponentsDemoSimple />} />
              <Route path="/modern-demo" element={<ModernComponentsDemo />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/galeria" element={<GaleriaPublica />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Ruta de redirección automática según rol */}
              <Route path="/dashboard" element={<RoleBasedRedirect />} />
              
              {/* Rutas protegidas por rol - Participantes */}
              <Route 
                path="/participante/dashboard" 
                element={
                  <ProtectedRoute requiredRoles={['PARTICIPANTE']}>
                    <ParticipanteDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas protegidas por rol - Jurados */}
              <Route 
                path="/jurado/dashboard" 
                element={
                  <ProtectedRoute requiredRoles={['JURADO']}>
                    <JuradoDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas protegidas por rol - Administradores */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas protegidas por rol - Administradores de Contenido */}
              <Route 
                path="/content-admin/dashboard" 
                element={
                  <ProtectedRoute requiredRoles={['CONTENT_ADMIN']}>
                    <ContentAdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas protegidas generales (cualquier usuario autenticado) */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas futuras para cada rol (próximamente) */}
              {/* Participantes */}
              <Route path="/participante/concursos" element={<ProtectedRoute requiredRoles={['PARTICIPANTE']}><div className="container py-5"><h1>Mis Concursos (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/participante/envios" element={<ProtectedRoute requiredRoles={['PARTICIPANTE']}><div className="container py-5"><h1>Mis Envíos (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/participante/comunidad" element={<ProtectedRoute requiredRoles={['PARTICIPANTE']}><div className="container py-5"><h1>Comunidad (Próximamente)</h1></div></ProtectedRoute>} />
              
              {/* Jurados */}
              <Route path="/jurado/asignaciones" element={<ProtectedRoute requiredRoles={['JURADO']}><div className="container py-5"><h1>Mis Asignaciones (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/jurado/evaluaciones" element={<ProtectedRoute requiredRoles={['JURADO']}><div className="container py-5"><h1>Evaluaciones (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/jurado/especializacion" element={<ProtectedRoute requiredRoles={['JURADO']}><div className="container py-5"><h1>Mi Especialización (Próximamente)</h1></div></ProtectedRoute>} />
              
              {/* Administradores */}
              <Route path="/admin/concursos" element={<ProtectedRoute requiredRoles={['ADMIN']}><div className="container py-5"><h1>Gestión de Concursos (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute requiredRoles={['ADMIN']}><div className="container py-5"><h1>Gestión de Usuarios (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/admin/jurados" element={<ProtectedRoute requiredRoles={['ADMIN']}><div className="container py-5"><h1>Asignación de Jurados (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/admin/criterios" element={<ProtectedRoute requiredRoles={['ADMIN']}><div className="container py-5"><h1>Criterios de Evaluación (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/admin/metricas" element={<ProtectedRoute requiredRoles={['ADMIN']}><div className="container py-5"><h1>Métricas y Analytics (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/admin/suscripciones" element={<ProtectedRoute requiredRoles={['ADMIN']}><div className="container py-5"><h1>Suscripciones (Próximamente)</h1></div></ProtectedRoute>} />
              
              {/* Administradores de Contenido */}
              <Route path="/content-admin/cms" element={<ProtectedRoute requiredRoles={['CONTENT_ADMIN']}><div className="container py-5"><h1>CMS Dinámico (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/content-admin/blog" element={<ProtectedRoute requiredRoles={['CONTENT_ADMIN']}><div className="container py-5"><h1>Blog de la Comunidad (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/content-admin/educativo" element={<ProtectedRoute requiredRoles={['CONTENT_ADMIN']}><div className="container py-5"><h1>Contenido Educativo (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/content-admin/moderacion" element={<ProtectedRoute requiredRoles={['CONTENT_ADMIN']}><div className="container py-5"><h1>Moderación (Próximamente)</h1></div></ProtectedRoute>} />
              <Route path="/content-admin/analytics" element={<ProtectedRoute requiredRoles={['CONTENT_ADMIN']}><div className="container py-5"><h1>Analytics de Contenido (Próximamente)</h1></div></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
