import { useState, useEffect, useCallback } from 'react';

// === TIPOS ===
export type ThemeName = 
  | 'professional' 
  | 'corporate' 
  | 'minimal' 
  | 'cinematic' 
  | 'neuro' 
  | 'retro' 
  | 'ocean' 
  | 'sunset' 
  | 'forest';

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
  professional: {
    name: 'professional',
    displayName: 'Looper Professional',
    category: 'professional',
    description: 'Diseño profesional inspirado en Looper con colores corporativos',
    primaryColor: '#346CB0',
    isDark: false
  },
  corporate: {
    name: 'corporate',
    displayName: 'Corporate',
    category: 'professional',
    description: 'Estilo corporativo minimalista y elegante',
    primaryColor: '#2563eb',
    isDark: false
  },
  minimal: {
    name: 'minimal',
    displayName: 'Minimal',
    category: 'professional',
    description: 'Diseño minimalista y limpio',
    primaryColor: '#000000',
    isDark: false
  },
  
  // Temas Cinematográficos
  cinematic: {
    name: 'cinematic',
    displayName: 'Cinematic Dark',
    category: 'cinematic',
    description: 'Tema oscuro cinematográfico con efectos glassmorphism',
    primaryColor: '#4a7bc8',
    isDark: true
  },
  neuro: {
    name: 'neuro',
    displayName: 'Neuro',
    category: 'cinematic',
    description: 'Estilo futurista con colores neón verdes',
    primaryColor: '#00ff88',
    isDark: true
  },
  retro: {
    name: 'retro',
    displayName: 'Retro Wave',
    category: 'cinematic',
    description: 'Estilo retro synthwave con colores vibrantes',
    primaryColor: '#ff6b9d',
    isDark: true
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean Deep',
    category: 'cinematic',
    description: 'Tema oceánico con tonos azules profundos',
    primaryColor: '#38bdf8',
    isDark: true
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset',
    category: 'cinematic',
    description: 'Colores cálidos inspirados en el atardecer',
    primaryColor: '#f97316',
    isDark: true
  },
  forest: {
    name: 'forest',
    displayName: 'Forest',
    category: 'cinematic',
    description: 'Tema natural con tonos verdes del bosque',
    primaryColor: '#22c55e',
    isDark: true
  }
};

// === CONSTANTES ===
const THEME_STORAGE_KEY = 'webfestival-theme';
const DEFAULT_THEME: ThemeName = 'professional';

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
        const systemTheme: ThemeName = prefersDark ? 'cinematic' : 'professional';
        
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
        const systemTheme: ThemeName = e.matches ? 'cinematic' : 'professional';
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
    const newTheme: ThemeName = currentConfig.isDark ? 'professional' : 'cinematic';
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
        case 'neuro': return 'neuro';
        case 'retro': return 'retro';
        case 'ocean': return 'ocean';
        case 'sunset': return 'sunset';
        case 'forest': return 'forest';
        default: return 'glass';
      }
    } else {
      switch (theme) {
        case 'professional': return 'professional';
        case 'corporate': return 'corporate';
        case 'minimal': return 'minimal';
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