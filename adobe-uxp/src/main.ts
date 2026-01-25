import { THEMES, POPULAR_LANGUAGES, DEFAULTS } from './config';
import { highlightCode, type HighlightedToken } from './highlighter';
import { loadSettings, saveLanguage, saveTheme } from './storage';

// UI Elements
let languageSelect: HTMLSelectElement;
let themeSelect: HTMLSelectElement;
let highlightBtn: HTMLButtonElement;
let statusEl: HTMLDivElement;

// Detect which Adobe app we're running in
// Note: After Effects uses CEP, not UXP - see adobe-cep directory
function detectAdobeApp(): 'photoshop' | 'illustrator' | 'indesign' | 'unknown' {
  try {
    if (typeof require !== 'undefined') {
      try {
        const ps = require('photoshop');
        if (ps) return 'photoshop';
      } catch { /* not photoshop */ }

      try {
        const ai = require('illustrator');
        if (ai) return 'illustrator';
      } catch { /* not illustrator */ }

      try {
        const id = require('indesign');
        if (id) return 'indesign';
      } catch { /* not indesign */ }
    }
  } catch {
    // Ignore errors during detection
  }
  return 'unknown';
}

// Show status message
function showStatus(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
  statusEl.textContent = message;
  statusEl.className = `status visible ${type}`;

  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusEl.classList.remove('visible');
    }, 3000);
  }
}

// Populate dropdowns
function populateDropdowns(): void {
  POPULAR_LANGUAGES.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.id;
    option.textContent = lang.name;
    languageSelect.appendChild(option);
  });

  const darkThemesGroup = document.getElementById('dark-themes') as HTMLOptGroupElement;
  const lightThemesGroup = document.getElementById('light-themes') as HTMLOptGroupElement;

  THEMES.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme.id;
    option.textContent = theme.name;

    if (theme.type === 'dark') {
      darkThemesGroup.appendChild(option);
    } else {
      lightThemesGroup.appendChild(option);
    }
  });
}

// Load saved preferences
function loadPreferences(): void {
  const settings = loadSettings();

  if (settings.language && languageSelect.querySelector(`option[value="${settings.language}"]`)) {
    languageSelect.value = settings.language;
  } else {
    languageSelect.value = DEFAULTS.language;
  }

  if (settings.theme && themeSelect.querySelector(`option[value="${settings.theme}"]`)) {
    themeSelect.value = settings.theme;
  } else {
    themeSelect.value = DEFAULTS.theme;
  }
}

// Convert hex color to RGB components (0-255)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  return { r: 212, g: 212, b: 212 };
}


// Photoshop-specific highlighting
async function highlightPhotoshop(_code: string, tokens: HighlightedToken[][]): Promise<void> {
  const photoshop = require('photoshop') as {
    app: { activeDocument: { activeLayers: Array<{ kind: string; name: string }> } | null };
    action: { batchPlay: (commands: unknown[], options: unknown) => Promise<unknown[]> };
    core: { executeAsModal: <T>(fn: () => Promise<T>, opts: { commandName: string }) => Promise<T> }
  };
  const { app, action, core } = photoshop;

  if (!app.activeDocument) {
    throw new Error('No document open');
  }

  const activeLayers = app.activeDocument.activeLayers;
  if (!activeLayers || activeLayers.length === 0) {
    throw new Error('No layers selected');
  }

  const textLayers = activeLayers.filter(layer => layer.kind === 'text');
  const nonTextLayers = activeLayers.filter(layer => layer.kind !== 'text');

  if (nonTextLayers.length > 0) {
    const names = nonTextLayers.map(l => l.name).join(', ');
    showStatus(`Ignored non-text layers: ${names}`, 'warning');
  }

  if (textLayers.length === 0) {
    throw new Error('No text layers selected. Please select text layer(s) only.');
  }

  await core.executeAsModal(async () => {
    const styles: Array<{ color: { r: number; g: number; b: number } }> = [];
    tokens.forEach(line => {
      line.forEach(token => {
        const rgb = hexToRgb(token.style.color);
        for (let i = 0; i < token.content.length; i++) {
          styles.push({ color: rgb });
        }
      });
      styles.push({ color: { r: 212, g: 212, b: 212 } });
    });

    for (const _layer of textLayers) {
      const textStyleRanges = styles.map((style, index) => ({
        from: index,
        to: index + 1,
        textStyle: {
          color: {
            _obj: 'RGBColor',
            red: style.color.r,
            green: style.color.g,
            blue: style.color.b,
          },
        },
      }));

      await action.batchPlay(
        [{
          _obj: 'set',
          _target: [{ _ref: 'textLayer', _enum: 'ordinal', _value: 'targetEnum' }],
          to: {
            _obj: 'textLayer',
            textStyleRange: textStyleRanges,
          },
        }],
        { synchronousExecution: true }
      );
    }
  }, { commandName: 'Apply Syntax Highlighting' });

  showStatus(`Highlighted ${textLayers.length} text layer(s)`, 'success');
}

// Illustrator-specific highlighting
async function highlightIllustrator(_code: string, tokens: HighlightedToken[][]): Promise<void> {
  const illustrator = require('illustrator') as {
    app: { activeDocument: { selection: Array<{ typename: string; name?: string; contents?: string; characters?: { length: number; [index: number]: { characterAttributes: { fillColor: unknown } } } }> } | null };
    RGBColor: new () => { red: number; green: number; blue: number }
  };
  const { app, RGBColor } = illustrator;

  if (!app.activeDocument) {
    throw new Error('No document open');
  }

  const selection = app.activeDocument.selection;
  if (!selection || selection.length === 0) {
    throw new Error('No objects selected');
  }

  const textFrames = selection.filter(item => item.typename === 'TextFrame');
  const nonTextItems = selection.filter(item => item.typename !== 'TextFrame');

  if (nonTextItems.length > 0) {
    showStatus(`Ignored ${nonTextItems.length} non-text object(s). Select text frames only.`, 'warning');
  }

  if (textFrames.length === 0) {
    throw new Error('No text frames selected. Please select text frame(s) only.');
  }

  const chars: Array<{ char: string; color: { r: number; g: number; b: number } }> = [];
  tokens.forEach((line, lineIndex) => {
    line.forEach(token => {
      const rgb = hexToRgb(token.style.color);
      for (const char of token.content) {
        chars.push({ char, color: rgb });
      }
    });
    if (lineIndex < tokens.length - 1) {
      chars.push({ char: '\n', color: { r: 212, g: 212, b: 212 } });
    }
  });

  for (const frame of textFrames) {
    const characters = frame.characters;
    if (!characters) continue;

    for (let i = 0; i < Math.min(characters.length, chars.length); i++) {
      const color = new RGBColor();
      color.red = chars[i].color.r;
      color.green = chars[i].color.g;
      color.blue = chars[i].color.b;
      characters[i].characterAttributes.fillColor = color;
    }
  }

  showStatus(`Highlighted ${textFrames.length} text frame(s)`, 'success');
}

// Generic highlighting handler that routes to app-specific implementation
// Note: After Effects uses CEP, not UXP - see adobe-cep directory
async function handleHighlight(): Promise<void> {
  const language = languageSelect.value;
  const theme = themeSelect.value;

  highlightBtn.disabled = true;
  showStatus('Processing...', 'info');

  try {
    const adobeApp = detectAdobeApp();

    if (adobeApp === 'unknown') {
      throw new Error('Could not detect Adobe application. Make sure plugin is running in a supported app.');
    }

    // Get selected text content based on app
    let code = '';

    if (adobeApp === 'photoshop') {
      const photoshop = require('photoshop') as { app: { activeDocument: { activeLayers: Array<{ kind: string; textItem?: { contents: string } }> } | null } };
      const { app } = photoshop;

      if (!app.activeDocument) {
        throw new Error('No document open');
      }

      const textLayers = app.activeDocument.activeLayers.filter(l => l.kind === 'text');
      if (textLayers.length === 0) {
        throw new Error('No text layers selected');
      }

      code = textLayers[0].textItem?.contents || '';

    } else if (adobeApp === 'illustrator') {
      const illustrator = require('illustrator') as { app: { activeDocument: { selection: Array<{ typename: string; contents?: string }> } | null } };
      const { app } = illustrator;

      if (!app.activeDocument) {
        throw new Error('No document open');
      }

      const textFrames = app.activeDocument.selection.filter(item => item.typename === 'TextFrame');
      if (textFrames.length === 0) {
        throw new Error('No text frames selected');
      }

      code = textFrames[0].contents || '';

    } else if (adobeApp === 'indesign') {
      throw new Error('InDesign support coming soon');
    }

    if (!code.trim()) {
      throw new Error('Selected text is empty');
    }

    // Highlight the code
    const result = await highlightCode(code, language, theme);

    // Apply highlighting based on app
    if (adobeApp === 'photoshop') {
      await highlightPhotoshop(code, result.tokens);
    } else if (adobeApp === 'illustrator') {
      await highlightIllustrator(code, result.tokens);
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    showStatus(message, 'error');
  } finally {
    highlightBtn.disabled = false;
  }
}

// Initialize the plugin
function init(): void {
  languageSelect = document.getElementById('language') as HTMLSelectElement;
  themeSelect = document.getElementById('theme') as HTMLSelectElement;
  highlightBtn = document.getElementById('highlight-btn') as HTMLButtonElement;
  statusEl = document.getElementById('status') as HTMLDivElement;

  populateDropdowns();
  loadPreferences();

  languageSelect.addEventListener('change', () => {
    saveLanguage(languageSelect.value);
  });

  themeSelect.addEventListener('change', () => {
    saveTheme(themeSelect.value);
  });

  highlightBtn.addEventListener('click', handleHighlight);

  const adobeApp = detectAdobeApp();
  if (adobeApp !== 'unknown') {
    const appNames: Record<string, string> = {
      photoshop: 'Photoshop',
      illustrator: 'Illustrator',
      indesign: 'InDesign',
    };
    showStatus(`Ready - Running in ${appNames[adobeApp]}`, 'info');
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
