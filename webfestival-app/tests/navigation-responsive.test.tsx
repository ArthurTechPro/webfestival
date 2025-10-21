import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NavigationProvider } from '../src/contexts/NavigationContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import SideNavigation from '../src/components/layout/SideNavigation';
import TopNavigation from '../src/components/layout/TopNavigation';
import MainLayout from '../src/components/layout/MainLayout';

// Mock del usuario autenticado
const mockUser = {
  id: '1',
  email: 'test@example.com',
  nombre: 'Test User',
  role: 'PARTICIPANTE' as const,
  picture_url: null,
  bio: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock del contexto de autenticación
const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn()
};

// Mock de React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/app/dashboard' })
}));

// Mock del AuthContext
vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper para simular cambios de tamaño de ventana
const resizeWindow = (width: number, height: number = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <NavigationProvider>
      {children}
    </NavigationProvider>
  </AuthProvider>
);

describe('Responsive Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Establecer tamaño de ventana por defecto (desktop)
    resizeWindow(1200);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Screen Size Detection', () => {
    it('should detect mobile screen size correctly', async () => {
      resizeWindow(600); // Mobile size
      
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // En móvil, el menú debería estar en modo overlay
      await waitFor(() => {
        const sideNav = document.querySelector('nav[aria-label="Navegación principal"]');
        expect(sideNav).toHaveClass('wf-z-40'); // z-index para overlay
      });
    });

    it('should detect tablet screen size correctly', async () => {
      resizeWindow(800); // Tablet size
      
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // En tablet, el menú debería estar en modo push
      await waitFor(() => {
        const sideNav = document.querySelector('nav[aria-label="Navegación principal"]');
        expect(sideNav).toHaveClass('wf-z-30'); // z-index para push
      });
    });

    it('should detect desktop screen size correctly', async () => {
      resizeWindow(1200); // Desktop size
      
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // En desktop, el menú debería estar en modo static
      await waitFor(() => {
        const sideNav = document.querySelector('nav[aria-label="Navegación principal"]');
        expect(sideNav).toHaveClass('wf-z-20'); // z-index para static
      });
    });
  });

  describe('Side Menu Behaviors', () => {
    it('should show overlay behavior on mobile', async () => {
      resizeWindow(600); // Mobile size
      
      render(
        <TestWrapper>
          <SideNavigation />
        </TestWrapper>
      );

      // Buscar el botón hamburguesa (en móvil debería decir "Abrir menú")
      const hamburgerButton = screen.getByLabelText(/abrir menú|colapsar menú/i);
      expect(hamburgerButton).toBeInTheDocument();

      // Hacer clic para abrir el menú
      fireEvent.click(hamburgerButton);

      // Verificar que aparece el overlay
      await waitFor(() => {
        const overlay = document.querySelector('.wf-fixed.wf-inset-0.wf-bg-black');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should show push behavior on tablet', async () => {
      resizeWindow(800); // Tablet size
      
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // En tablet con modo push, el contenido debería tener margen
      await waitFor(() => {
        const mainContent = document.querySelector('main');
        const styles = window.getComputedStyle(mainContent!);
        // El contenido debería tener margen izquierdo cuando el menú está abierto
        expect(styles.marginLeft).toBeTruthy();
      });
    });

    it('should show static behavior on desktop', async () => {
      resizeWindow(1200); // Desktop size
      
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // En desktop con modo static, el contenido siempre tiene margen
      await waitFor(() => {
        const mainContent = document.querySelector('main');
        const styles = window.getComputedStyle(mainContent!);
        expect(styles.marginLeft).toBeTruthy();
      });
    });
  });

  describe('Menu Collapse/Expand', () => {
    it('should toggle menu collapse on desktop', async () => {
      resizeWindow(1200); // Desktop size
      
      render(
        <TestWrapper>
          <TopNavigation />
          <SideNavigation />
        </TestWrapper>
      );

      // Buscar el botón de colapso
      const collapseButton = screen.getByLabelText(/colapsar menú/i);
      expect(collapseButton).toBeInTheDocument();

      // Hacer clic para colapsar
      fireEvent.click(collapseButton);

      // Verificar que el menú se colapsa
      await waitFor(() => {
        const sideNav = document.querySelector('nav[aria-label="Navegación principal"]');
        expect(sideNav).toHaveClass('wf-w-16'); // Ancho colapsado
      });
    });

    it('should show tooltips when menu is collapsed', async () => {
      resizeWindow(1200); // Desktop size
      
      render(
        <TestWrapper>
          <TopNavigation />
          <SideNavigation />
        </TestWrapper>
      );

      // Colapsar el menú
      const collapseButton = screen.getByLabelText(/colapsar menú/i);
      fireEvent.click(collapseButton);

      // Hacer hover sobre un elemento del menú
      await waitFor(() => {
        const menuItem = document.querySelector('.wf-menu-item');
        if (menuItem) {
          fireEvent.mouseEnter(menuItem);
          
          // Verificar que aparece el tooltip
          const tooltip = document.querySelector('.wf-tooltip');
          expect(tooltip).toBeInTheDocument();
        }
      });
    });
  });

  describe('Responsive Transitions', () => {
    it('should adapt when screen size changes', async () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Comenzar en desktop
      resizeWindow(1200);
      
      await waitFor(() => {
        const sideNav = document.querySelector('nav[aria-label="Navegación principal"]');
        expect(sideNav).toHaveClass('wf-z-20'); // Static mode
      });

      // Cambiar a móvil
      resizeWindow(600);
      
      await waitFor(() => {
        const sideNav = document.querySelector('nav[aria-label="Navegación principal"]');
        expect(sideNav).toHaveClass('wf-z-40'); // Overlay mode
      });
    });

    it('should close mobile menu when resizing to desktop', async () => {
      resizeWindow(600); // Mobile size
      
      render(
        <TestWrapper>
          <TopNavigation />
          <SideNavigation />
        </TestWrapper>
      );

      // Abrir menú móvil
      const hamburgerButton = screen.getByLabelText(/abrir menú/i);
      fireEvent.click(hamburgerButton);

      // Verificar que el menú está abierto
      await waitFor(() => {
        const overlay = document.querySelector('.wf-opacity-100');
        expect(overlay).toBeInTheDocument();
      });

      // Cambiar a desktop
      resizeWindow(1200);

      // Verificar que el menú móvil se cierra
      await waitFor(() => {
        const overlay = document.querySelector('.wf-opacity-100');
        expect(overlay).not.toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save menu state to localStorage', async () => {
      render(
        <TestWrapper>
          <TopNavigation />
          <SideNavigation />
        </TestWrapper>
      );

      // Colapsar el menú
      const collapseButton = screen.getByLabelText(/colapsar menú/i);
      fireEvent.click(collapseButton);

      // Verificar que se guarda en localStorage
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'webfestival-navigation-state',
          expect.stringContaining('"sideMenuCollapsed":true')
        );
      });
    });

    it('should restore menu state from localStorage', () => {
      // Mock del estado guardado
      const savedState = JSON.stringify({
        sideMenuCollapsed: true,
        activeMenuItem: 'menu-dashboard-0',
        currentPath: '/app/dashboard'
      });
      localStorageMock.getItem.mockReturnValue(savedState);

      render(
        <TestWrapper>
          <SideNavigation />
        </TestWrapper>
      );

      // Verificar que el estado se restaura
      const sideNav = document.querySelector('nav[aria-label="Navegación principal"]');
      expect(sideNav).toHaveClass('wf-w-16'); // Menú colapsado
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <TopNavigation />
          <SideNavigation />
        </TestWrapper>
      );

      // Verificar atributos ARIA en el botón hamburguesa
      const hamburgerButton = screen.getByLabelText(/colapsar menú|abrir menú/i);
      expect(hamburgerButton).toHaveAttribute('aria-expanded');
      expect(hamburgerButton).toHaveAttribute('aria-label');

      // Verificar atributos ARIA en la navegación principal (específica)
      const navigation = screen.getByLabelText('Navegación principal');
      expect(navigation).toHaveAttribute('aria-label', 'Navegación principal');
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <SideNavigation />
        </TestWrapper>
      );

      // Verificar que los elementos del menú son focusables
      const menuItems = document.querySelectorAll('.wf-menu-item');
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Animation Preferences', () => {
    it('should respect reduced motion preference', () => {
      // Mock de prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <SideNavigation />
        </TestWrapper>
      );

      // Verificar que las animaciones están deshabilitadas
      const sideNav = document.querySelector('nav[aria-label="Navegación principal"]');
      expect(sideNav).not.toHaveClass('wf-transition-transform');
    });
  });
});