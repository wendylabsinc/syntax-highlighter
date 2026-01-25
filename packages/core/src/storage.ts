import { STORAGE_KEYS, DEFAULTS, type Settings } from './config';

export function loadSettings(): Settings {
  try {
    const language = localStorage.getItem(STORAGE_KEYS.language) || DEFAULTS.language;
    const theme = localStorage.getItem(STORAGE_KEYS.theme) || DEFAULTS.theme;
    return { language, theme };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveLanguage(language: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.language, language);
  } catch (e) {
    console.warn('Failed to save language preference:', e);
  }
}

export function saveTheme(theme: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }
}
