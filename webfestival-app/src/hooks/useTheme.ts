import { useState, useEffect, useCallback } from 'react';

// === TIPOS ===
export type ThemeName = 
  | 'looper'
  | 'corporate' 
  | 'minimal'
  | 'elegant'
  | 'dark-professional'
  | 'cinematic' 
  | 'neon'
  | 'retro'
  | 'cyberpunk'
  | 'ocean';

export type ThemeCategory = 'professional' | 'cinematic';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  category: ThemeCategory;
  description: string;
  primaryColor: string;
  isDark: boolean;
}

// === CONFIGURACIÓN DE TEMAS ===
export const THEMES: Record<ThemeName, ThemeConfig> = {
  // Temas Profesionales
  looper: {
    name: 'looper',
    displayName: 'Looper Professional',
    category: 'professional',
    description: 'Tema profesional basado en Looper',
    primaryColor: '#346CB0',
    isDark: false
  },
  corporate: {
    name: 'corporate',
    displayName: 'Corporate Modern',
    category: 'professional',
    description: 'Diseño corporativo limpio',
    primaryColor: '#2563eb',
    isDark: false
  },
  minimal: {
    name: 'minimal',
    displayName: 'Minimal Clean',
    category: 'professional',
    description: 'Minimalismo elegante',
    primaryColor: '#000000',
    isDark: false
  },
  elegant: {
    name: 'elegant',
    displayName: 'Elegant Business',
    category: 'professional',
    description: 'Elegancia profesional',
    primaryColor: '#3498db',
    isDark: false
  },
  'dark-professional': {
    name: 'dark-professional',
    displayName: 'Dark Professional',
    category: 'professional',
    description: 'Profesional oscuro',
    primaryColor: '#007acc',
    isDark: true
  },
  
  // Temas Cinematográficos
  cinematic: {
    name: 'cinematic',
    displayName: 'Cinematic Dark',
    category: 'cinematic',
    description: 'Tema cinematográfico original',
    primaryColor: '#4a7bc8',
    isDark: true
  },
  neon: {
    name: 'neon',
    displayName: 'Neon Cyber',
    category: 'cinematic',
    description: 'Efectos neon futuristas',
    primaryColor: '#00ffff',
    isDark: true
  },
  retro: {
    name: 'retro',
    displayName: 'Retro Wave',
    category: 'cinematic',
    description: 'Estética retro-futurista',
    primaryColor: '#ff6b9d',
    isDark: true
  },
  cyberpunk: {
    name: 'cyberpunk',
    displayName: 'Cyberpunk 2077',
    category: 'cinematic',
    description: 'Inspirado en cyberpunk',
    primaryColor: '#ff0080',
    isDark: true
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean Deep',
    category: 'cinematic',
    description: 'Profundidades oceánicas',
    primaryColor: '#0ea5e9',
    isDark: true
  }
};

// === CONSTANTES ===
const THEME_STORAGE_KEY = 'webfestival-theme';
const DEFAULT_THEME: ThemeName = 'looper';

// === HOOK PRINCIPAL ===
export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar tema desde localStorage o sistema
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // 1. Intentar cargar desde localStorage
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName;
        if (savedTheme && THEMES[savedTheme]) {
          setThemeState(savedTheme);
          applyThemeToDocument(savedTheme);
          setIsLoading(false);
          return;
        }

        // 2. Detectar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme: ThemeName = prefersDark ? 'cinematic' : 'looper';
        
        setThemeState(systemTheme);
        applyThemeToDocument(systemTheme);
        
      } catch (error) {
        console.warn('Error initializing theme:', error);
        setThemeState(DEFAULT_THEME);
        applyThemeToDocument(DEFAULT_THEME);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Escuchar cambios en preferencias del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Solo cambiar si no hay tema guardado manualmente
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        const systemTheme: ThemeName = e.matches ? 'cinematic' : 'looper';
        setThemeState(systemTheme);
        applyThemeToDocument(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Aplicar tema al documento
  const applyThemeToDocument = useCallback((themeName: ThemeName) => {
    const root = document.documentElement;
    
    // Remover clases de tema anteriores
    Object.keys(THEMES).forEach(t => {
      root.classList.remove(`theme-${t}`);
    });
    
    // Aplicar nuevo tema
    root.setAttribute('data-theme', themeName);
    root.classList.add(`theme-${themeName}`);
    
    // Actualizar meta theme-color para móviles
    const themeConfig = THEMES[themeName];
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeConfig.primaryColor);
    }
  }, []);

  // Cambiar tema
  const setTheme = useCallback((newTheme: ThemeName) => {
    if (!THEMES[newTheme]) {
      console.warn(`Theme "${newTheme}" not found`);
      return;
    }

    setThemeState(newTheme);
    applyThemeToDocument(newTheme);
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  }, [applyThemeToDocument]);

  // Alternar entre tema claro y oscuro
  const toggleTheme = useCallback(() => {
    const currentConfig = THEMES[theme];
    const newTheme: ThemeName = currentConfig.isDark ? 'looper' : 'cinematic';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Cambiar a tema aleatorio
  const randomTheme = useCallback(() => {
    const themeNames = Object.keys(THEMES) as ThemeName[];
    const availableThemes = themeNames.filter(t => t !== theme);
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    setTheme(availableThemes[randomIndex]);
  }, [theme, setTheme]);

  // Resetear a tema por defecto
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (error) {
      console.warn('Could not remove theme from localStorage:', error);
    }
  }, [setTheme]);

  // Obtener temas por categoría
  const getThemesByCategory = useCallback((category: ThemeCategory) => {
    return Object.values(THEMES).filter(t => t.category === category);
  }, []);

  // Obtener configuración del tema actual
  const currentThemeConfig = THEMES[theme];

  return {
    // Estado
    theme,
    currentThemeConfig,
    isLoading,
    isDark: currentThemeConfig.isDark,
    
    // Acciones
    setTheme,
    toggleTheme,
    randomTheme,
    resetTheme,
    
    // Utilidades
    getThemesByCategory,
    availableThemes: THEMES,
    
    // Información del tema actual
    themeName: currentThemeConfig.displayName,
    themeDescription: currentThemeConfig.description,
    primaryColor: currentThemeConfig.primaryColor,
    category: currentThemeConfig.category
  };
};

// === HOOK PARA COMPONENTES ===
export const useComponentVariant = () => {
  const { theme, currentThemeConfig } = useTheme();
  
  // Mapear tema a variante de componente
  const getVariantForComponent = useCallback((_componentType: 'button' | 'card' | 'modal' = 'button') => {
    if (currentThemeConfig.isDark) {
      switch (theme) {
        case 'cinematic': return 'glass';
        case 'retro': return 'retro';
        default: return 'glass';
      }
    } else {
      switch (theme) {
        case 'looper': return 'professional';
        case 'corporate': return 'corporate';
        case 'minimal': return 'minimal';
        case 'elegant': return 'elegant';
        default: return 'professional';
      }
    }
  }, [theme, currentThemeConfig.isDark]);

  return {
    theme,
    variant: getVariantForComponent(),
    getVariantForComponent,
    isDark: currentThemeConfig.isDark,
    category: currentThemeConfig.category
  };
};

// === UTILIDADES ===
export const getThemeFromUrl = (): ThemeName | null => {
  const params = new URLSearchParams(window.location.search);
  const themeParam = params.get('theme') as ThemeName;
  return themeParam && THEMES[themeParam] ? themeParam : null;
};

export const setThemeInUrl = (theme: ThemeName) => {
  const url = new URL(window.location.href);
  url.searchParams.set('theme', theme);
  window.history.replaceState({}, '', url.toString());
};

export const removeThemeFromUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('theme');
  window.history.replaceState({}, '', url.toString());
};