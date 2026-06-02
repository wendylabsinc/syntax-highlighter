import { useEffect, useMemo, useState } from "react";
import {
  bundledLanguagesInfo,
  bundledThemesInfo,
  codeToTokens,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";
import type {
  HighlightColor,
  HighlightRange,
  HighlightUpdate,
  SyntaxHighlighterAdapter,
  TextTarget,
} from "./types";
import "./panel.css";

const DEFAULT_LANGUAGE: BundledLanguage = "typescript";
const DEFAULT_THEME: BundledTheme = "github-dark";
const LS_KEY_LANG = "sh.syntax-highlighter.language";
const LS_KEY_THEME = "sh.syntax-highlighter.theme";

const sortedLanguages = [...bundledLanguagesInfo].sort((a, b) =>
  a.name.localeCompare(b.name),
);
const sortedThemes = [...bundledThemesInfo].sort((a, b) =>
  a.displayName.localeCompare(b.displayName),
);

const languageIds = new Set(sortedLanguages.map((l) => l.id));
const themeIds = new Set(sortedThemes.map((t) => t.id));

const loadCached = <T extends string>(
  key: string,
  valid: Set<string>,
  fallback: T,
): T => {
  try {
    const value = localStorage.getItem(key);
    if (value && valid.has(value)) return value as T;
  } catch {
    // Ignore storage failures in host webviews.
  }
  return fallback;
};

const toHighlightColor = (hex: string | undefined): HighlightColor | undefined => {
  if (!hex) return undefined;
  const match = /^#?([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(hex);
  return match ? (`#${match[1]}` as HighlightColor) : undefined;
};

const buildHighlightUpdate = async (
  target: TextTarget,
  language: BundledLanguage,
  theme: BundledTheme,
): Promise<HighlightUpdate | undefined> => {
  if (!target.text) return undefined;

  const normalizedText = target.text.replace(/\r/g, "\n");
  const result = await codeToTokens(normalizedText, { lang: language, theme });
  const defaultColor = toHighlightColor(result.fg);
  const ranges: HighlightRange[] = [];
  let fallbackOffset = 0;

  for (let lineIndex = 0; lineIndex < result.tokens.length; lineIndex++) {
    const line = result.tokens[lineIndex];
    for (const token of line) {
      if (!token.content) continue;
      const offset =
        typeof token.offset === "number" ? token.offset : fallbackOffset;
      fallbackOffset = offset + token.content.length;
      const color = toHighlightColor(token.color) ?? defaultColor;
      if (!color) continue;
      ranges.push({
        start: offset,
        length: token.content.length,
        color,
      });
    }
    if (lineIndex < result.tokens.length - 1) {
      fallbackOffset += 1;
    }
  }

  return {
    targetId: target.id,
    ranges,
    defaultColor,
  };
};

type SyntaxHighlighterPanelProps = {
  adapter: SyntaxHighlighterAdapter;
  initialBackgroundColor?: string;
};

export const SyntaxHighlighterPanel = ({
  adapter,
  initialBackgroundColor = "#282c34",
}: SyntaxHighlighterPanelProps) => {
  const [bgColor, setBgColor] = useState(initialBackgroundColor);
  const [language, setLanguage] = useState<BundledLanguage>(
    loadCached(LS_KEY_LANG, languageIds, DEFAULT_LANGUAGE),
  );
  const [theme, setTheme] = useState<BundledTheme>(
    loadCached(LS_KEY_THEME, themeIds, DEFAULT_THEME),
  );
  const [formatting, setFormatting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    return adapter.subscribeBackgroundColor?.(setBgColor);
  }, [adapter]);

  const emptySelectionMessage = useMemo(
    () =>
      adapter.emptySelectionMessage ??
      `Formatted 0 ${adapter.targetLabelPlural}. Select at least 1 ${adapter.targetLabelSingular} before clicking Format.`,
    [adapter],
  );

  const handleFormat = async () => {
    if (formatting) return;
    setFormatting(true);
    setStatus(null);

    try {
      const targets = await adapter.getSelectedTextTargets();
      if (!targets || targets.length === 0) {
        setStatus(emptySelectionMessage);
        return;
      }

      const updates: HighlightUpdate[] = [];
      for (const target of targets) {
        const update = await buildHighlightUpdate(target, language, theme);
        if (update && update.ranges.length > 0) updates.push(update);
      }

      if (updates.length === 0) {
        setStatus(emptySelectionMessage);
        return;
      }

      const result = await adapter.applyHighlighting(updates);
      if (result.message) {
        setStatus(result.message);
        return;
      }

      setStatus(
        result.ok
          ? `Formatted ${result.formattedTargets} ${
              result.formattedTargets === 1
                ? adapter.targetLabelSingular
                : adapter.targetLabelPlural
            }.`
          : "Failed to apply highlighting.",
      );
    } catch (error) {
      console.error(error);
      setStatus(
        "Error: " +
          (error instanceof Error ? error.message : JSON.stringify(error)),
      );
    } finally {
      setFormatting(false);
    }
  };

  return (
    <div className="sh-app" style={{ backgroundColor: bgColor }}>
      <div className="sh-panel">
        <div className="sh-heading">
          <h1 className="sh-title">Syntax Highlighter</h1>
          <span className="sh-host">{adapter.hostLabel}</span>
        </div>

        <label className="sh-field">
          <span className="sh-field-label">Language</span>
          <select
            className="sh-select"
            value={language}
            onChange={(e) => {
              const next = e.target.value as BundledLanguage;
              setLanguage(next);
              try {
                localStorage.setItem(LS_KEY_LANG, next);
              } catch {
                // Ignore storage failures in host webviews.
              }
            }}
          >
            {sortedLanguages.map((info) => (
              <option key={info.id} value={info.id}>
                {info.name}
              </option>
            ))}
          </select>
        </label>

        <label className="sh-field">
          <span className="sh-field-label">Theme</span>
          <select
            className="sh-select"
            value={theme}
            onChange={(e) => {
              const next = e.target.value as BundledTheme;
              setTheme(next);
              try {
                localStorage.setItem(LS_KEY_THEME, next);
              } catch {
                // Ignore storage failures in host webviews.
              }
            }}
          >
            {sortedThemes.map((info) => (
              <option key={info.id} value={info.id}>
                {info.displayName} ({info.type})
              </option>
            ))}
          </select>
        </label>

        <div className="sh-action">
          <button
            className="sh-primary"
            onClick={handleFormat}
            disabled={formatting}
          >
            {formatting ? "Formatting..." : "Format"}
          </button>
          {status && <p className="sh-status">{status}</p>}
        </div>
      </div>
    </div>
  );
};
