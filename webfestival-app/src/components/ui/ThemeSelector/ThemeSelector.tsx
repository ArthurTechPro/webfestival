import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from '../../../hooks/useTheme';
import type { ThemeCategory, ThemeName } from '../../../hooks/useTheme';
import styles from './ThemeSelector.module.scss';

// === INTERFACES ===
export interface ThemeSelectorProps {
  showLabel?: boolean;
  position?: 'relative' | 'fixed';
  align?: 'left' | 'right';
  compact?: boolean;
  className?: string;
}

// === COMPONENTE PRINCIPAL ===
const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  showLabel = true,
  position = 'relative',
  align = 'right',
  compact = false,
  className = ''
}) => {
  const { 
    theme, 
    currentThemeConfig, 
    setTheme, 
    toggleTheme, 
    randomTheme, 
    resetTheme,
    getThemesByCategory 
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Manejar selección de tema
  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName);
    setIsOpen(false);
  };

  // Renderizar opción de tema
  const renderThemeOption = (themeName: ThemeName) => {
    const themeConfig = THEMES[themeName];
    const isActive = theme === themeName;

    return (
      <div
        key={themeName}
        className={`${styles.themeOption} ${isActive ? styles.active : ''}`}
        onClick={() => handleThemeSelect(themeName)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleThemeSelect(themeName);
          }
        }}
      >
        <div 
          className={`${styles.themePreview} ${themeConfig.isDark ? styles.dark : ''}`}
          style={{ '--preview-color': themeConfig.primaryColor } as React.CSSProperties}
        />
        <div className={styles.themeInfo}>
          <div className={styles.themeName}>
            {themeConfig.displayName}
          </div>
          <div className={styles.themeDescription}>
            {themeConfig.description}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar sección de categoría
  const renderCategorySection = (category: ThemeCategory) => {
    const themes = getThemesByCategory(category);
    const categoryTitle = category === 'professional' ? 'Profesionales' : 'Cinematográficos';

    return (
      <div key={category} className={styles.categorySection}>
        <h4 className={styles.categoryTitle}>{categoryTitle}</h4>
        <div className={styles.themeGrid}>
          {themes.map(themeConfig => renderThemeOption(themeConfig.name))}
        </div>
      </div>
    );
  };

  // Clases CSS
  const containerClasses = [
    styles.themeSelector,
    position === 'fixed' && styles.fixed,
    compact && styles.compact,
    className
  ].filter(Boolean).join(' ');

  const triggerClasses = [
    styles.trigger,
    isOpen && styles.open
  ].filter(Boolean).join(' ');

  const dropdownClasses = [
    styles.dropdown,
    isOpen && styles.open,
    align === 'left' && styles.left
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        className={triggerClasses}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Selector de tema"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div 
          className={styles.triggerIcon}
          style={{ background: currentThemeConfig.primaryColor }}
        />
        {showLabel && !compact && (
          <span className={styles.triggerText}>
            {currentThemeConfig.displayName}
          </span>
        )}
        <span className={`${styles.triggerArrow} ${isOpen ? styles.open : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown */}
      <div ref={dropdownRef} className={dropdownClasses}>
        {/* Header */}
        <div className={styles.dropdownHeader}>
          <h3 className={styles.title}>Selector de Tema</h3>
          <p className={styles.subtitle}>
            Elige entre {Object.keys(THEMES).length} temas disponibles
          </p>
        </div>

        {/* Theme Categories */}
        <div className={styles.themeCategories}>
          {renderCategorySection('professional')}
          {renderCategorySection('cinematic')}
        </div>

        {/* Actions */}
        <div className={styles.dropdownActions}>
          <button
            className={styles.actionButton}
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            title="Alternar entre claro y oscuro"
          >
            🌓 Alternar
          </button>
          
          <button
            className={styles.actionButton}
            onClick={() => {
              randomTheme();
              setIsOpen(false);
            }}
            title="Tema aleatorio"
          >
            🎲 Aleatorio
          </button>
          
          <button
            className={`${styles.actionButton} ${styles.primary}`}
            onClick={() => {
              resetTheme();
              setIsOpen(false);
            }}
            title="Resetear a tema por defecto"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;