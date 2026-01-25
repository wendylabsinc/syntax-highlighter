import { DEFAULTS } from './config';

const STORAGE_KEY = 'syntax-highlighter-settings';

interface Settings {
  language: string;
  theme: string;
}

export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULTS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return { ...DEFAULTS };
}

export function saveLanguage(language: string): void {
  try {
    const settings = loadSettings();
    settings.language = language;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save language:', e);
  }
}

export function saveTheme(theme: string): void {
  try {
    const settings = loadSettings();
    settings.theme = theme;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save theme:', e);
  }
}
