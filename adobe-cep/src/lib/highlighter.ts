import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';

export interface TokenStyle {
  color: string;
  fontStyle?: 'italic' | 'bold' | 'bold italic';
}

export interface HighlightedToken {
  content: string;
  style: TokenStyle;
}

export interface HighlightResult {
  tokens: HighlightedToken[][];
  backgroundColor: string;
  foregroundColor: string;
}

let highlighterInstance: Highlighter | null = null;
const loadedThemes = new Set<string>();
const loadedLanguages = new Set<string>();

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript'],
    });
    loadedThemes.add('github-dark');
    loadedLanguages.add('javascript');
  }
  return highlighterInstance;
}

export async function ensureThemeLoaded(theme: string): Promise<void> {
  if (loadedThemes.has(theme)) return;
  const highlighter = await getHighlighter();
  await highlighter.loadTheme(theme as BundledTheme);
  loadedThemes.add(theme);
}

export async function ensureLanguageLoaded(lang: string): Promise<void> {
  if (lang === 'auto' || lang === 'text') return;
  if (loadedLanguages.has(lang)) return;
  const highlighter = await getHighlighter();
  try {
    await highlighter.loadLanguage(lang as BundledLanguage);
    loadedLanguages.add(lang);
  } catch (e) {
    console.warn(`Failed to load language: ${lang}`, e);
  }
}

export function detectLanguage(code: string): string {
  const trimmed = code.trim();

  if (trimmed.startsWith('<?php')) return 'php';
  if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html')) return 'html';
  if (trimmed.startsWith('<?xml')) return 'xml';
  if (trimmed.startsWith('#!')) {
    if (trimmed.includes('python')) return 'python';
    if (trimmed.includes('node') || trimmed.includes('deno') || trimmed.includes('bun')) return 'javascript';
    if (trimmed.includes('bash') || trimmed.includes('sh')) return 'shellscript';
    if (trimmed.includes('ruby')) return 'ruby';
    if (trimmed.includes('perl')) return 'perl';
  }

  if (/^(import|from)\s+\w+/.test(trimmed) && /def\s+\w+\s*\(/.test(trimmed)) return 'python';
  if (/^package\s+\w+/.test(trimmed) && /func\s+\w*\(/.test(trimmed)) return 'go';
  if (/^(import|export)\s+/.test(trimmed) || /^(const|let|var|function|class)\s+/.test(trimmed)) {
    if (/:[\s]*[\w<>[\]|&]+[\s]*[=;{,)]/.test(trimmed) || /interface\s+\w+/.test(trimmed)) {
      return 'typescript';
    }
    return 'javascript';
  }
  if (/^use\s+\w+::/.test(trimmed) || /fn\s+\w+\s*\(/.test(trimmed)) return 'rust';
  if (/^#include\s*[<"]/.test(trimmed)) {
    if (/class\s+\w+/.test(trimmed) || /std::/.test(trimmed)) return 'cpp';
    return 'c';
  }
  if (/^(public|private|protected|class|interface|enum)\s+/.test(trimmed)) {
    if (/namespace\s+\w+/.test(trimmed) || /using\s+System/.test(trimmed)) return 'csharp';
    return 'java';
  }
  if (/^\s*{[\s\S]*}[\s]*$/.test(trimmed) && /"[\w]+"[\s]*:/.test(trimmed)) return 'json';
  if (/^[\w-]+:\s*/.test(trimmed)) return 'yaml';
  if (/^<[\w-]+/.test(trimmed)) return 'xml';
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/i.test(trimmed)) return 'sql';
  if (/^def\s+\w+/.test(trimmed) || (/^class\s+\w+/.test(trimmed) && /:$/.test(trimmed.split('\n')[0]))) return 'python';
  if (/^\$[\w]+\s*=/.test(trimmed) || (/^function\s+\w+\s*{/.test(trimmed) && /-/.test(trimmed))) return 'powershell';
  if (/^(FROM|RUN|COPY|CMD|ENTRYPOINT|ENV|WORKDIR)\s+/i.test(trimmed)) return 'dockerfile';

  return 'text';
}

export async function highlightCode(
  code: string,
  language: string,
  theme: string
): Promise<HighlightResult> {
  const highlighter = await getHighlighter();

  const detectedLang = language === 'auto' ? detectLanguage(code) : language;

  await ensureThemeLoaded(theme);
  await ensureLanguageLoaded(detectedLang);

  const themeObj = highlighter.getTheme(theme as BundledTheme);
  const backgroundColor = themeObj.bg || '#1e1e1e';
  const foregroundColor = themeObj.fg || '#d4d4d4';

  const tokensResult = highlighter.codeToTokens(code, {
    lang: detectedLang === 'text' ? 'text' : detectedLang as BundledLanguage,
    theme: theme as BundledTheme,
  });

  const tokens: HighlightedToken[][] = tokensResult.tokens.map(line => {
    return line.map(token => {
      const style: TokenStyle = {
        color: token.color || themeObj.fg || '#d4d4d4',
      };

      if (token.fontStyle) {
        if (token.fontStyle & 1) style.fontStyle = 'italic';
        if (token.fontStyle & 2) style.fontStyle = style.fontStyle ? 'bold italic' : 'bold';
      }

      return { content: token.content, style };
    });
  });

  return { tokens, backgroundColor, foregroundColor };
}
