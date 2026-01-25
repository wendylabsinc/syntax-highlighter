// Config exports
export {
  THEMES,
  POPULAR_LANGUAGES,
  DEFAULTS,
  STORAGE_KEYS,
  type ThemeConfig,
  type LanguageConfig,
  type Settings,
} from './config';

// Highlighter exports
export {
  highlightCode,
  detectLanguage,
  getHighlighter,
  ensureThemeLoaded,
  ensureLanguageLoaded,
  type TokenStyle,
  type HighlightedToken,
  type HighlightResult,
} from './highlighter';

// Storage exports
export {
  loadSettings,
  saveLanguage,
  saveTheme,
} from './storage';
