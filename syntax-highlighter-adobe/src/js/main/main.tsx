import { useEffect, useState } from "react";
import {
  bundledLanguagesInfo,
  bundledThemesInfo,
  codeToTokens,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";
import { evalTS, subscribeBackgroundColor } from "../lib/utils/bolt";
import "./main.scss";

import type {
  AEColor,
  HighlightRange,
  LayerHighlight,
} from "../../shared/universals";

const DEFAULT_LANGUAGE: BundledLanguage = "typescript";
const DEFAULT_THEME: BundledTheme = "github-dark";

/** Parse a shiki "#rrggbb" or "#rrggbbaa" hex string into AE's 0..1 RGB. */
const hexToAEColor = (hex: string | undefined): AEColor | undefined => {
  if (!hex) return undefined;
  const m = /^#?([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(hex);
  if (!m) return undefined;
  const v = m[1];
  return [
    parseInt(v.slice(0, 2), 16) / 255,
    parseInt(v.slice(2, 4), 16) / 255,
    parseInt(v.slice(4, 6), 16) / 255,
  ];
};

const sortedLanguages = [...bundledLanguagesInfo].sort((a, b) =>
  a.name.localeCompare(b.name),
);
const sortedThemes = [...bundledThemesInfo].sort((a, b) =>
  a.displayName.localeCompare(b.displayName),
);

export const App = () => {
  const [bgColor, setBgColor] = useState("#282c34");
  const [language, setLanguage] = useState<BundledLanguage>(DEFAULT_LANGUAGE);
  const [theme, setTheme] = useState<BundledTheme>(DEFAULT_THEME);
  const [formatting, setFormatting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (window.cep) subscribeBackgroundColor(setBgColor);
  }, []);

  const handleFormat = async () => {
    if (formatting) return;
    setFormatting(true);
    setStatus(null);
    try {
      // 1. Ask ExtendScript for the current selection's text layers + content.
      const selectionAndTexts = await evalTS("getSelectedTextLayerContents");
      if (!selectionAndTexts || selectionAndTexts.length === 0) {
        setStatus(
          "Formatted 0 layers. Please select at least 1 text layer before clicking Format.",
        );
        return;
      }

      // 2. Tokenize each layer's text with shiki and build highlight payloads.
      const updates: LayerHighlight[] = [];
      for (const layer of selectionAndTexts) {
        if (!layer.text) continue;
        const result = await codeToTokens(layer.text, {
          lang: language,
          theme,
        });
        const defaultColor = hexToAEColor(result.fg);
        const ranges: HighlightRange[] = [];
        for (const line of result.tokens) {
          for (const token of line) {
            const color = hexToAEColor(token.color) ?? defaultColor;
            if (!color) continue;
            if (!token.content || token.content.length === 0) continue;
            ranges.push({
              start: token.offset,
              length: token.content.length,
              color,
            });
          }
        }
        updates.push({
          layerIndex: layer.index,
          ranges,
          defaultColor,
        });
      }

      if (updates.length === 0) {
        setStatus(
          "Formatted 0 layers. Please select at least 1 text layer before clicking Format.",
        );
        return;
      }

      // 3. Apply the highlighting in AE.
      const res = await evalTS("applyHighlighting", updates);
      setStatus(
        res && res.ok
          ? `Formatted ${res.formattedLayers} layer${res.formattedLayers === 1 ? "" : "s"}.`
          : "Failed to apply highlighting.",
      );
    } catch (e) {
      console.error(e);
      setStatus(
        "Error: " + (e instanceof Error ? e.message : JSON.stringify(e)),
      );
    } finally {
      setFormatting(false);
    }
  };

  return (
    <div className="app" style={{ backgroundColor: bgColor }}>
      <div className="panel">
        <h1 className="title">Syntax Highlighter</h1>

        <label className="field">
          <span className="field-label">Language</span>
          <select
            className="select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as BundledLanguage)}
          >
            {sortedLanguages.map((info) => (
              <option key={info.id} value={info.id}>
                {info.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Theme</span>
          <select
            className="select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as BundledTheme)}
          >
            {sortedThemes.map((info) => (
              <option key={info.id} value={info.id}>
                {info.displayName} ({info.type})
              </option>
            ))}
          </select>
        </label>

        <div className="action">
          <button
            className="primary"
            onClick={handleFormat}
            disabled={formatting}
          >
            {formatting ? "Formatting…" : "Format"}
          </button>
          {status && <p className="status text-sm">{status}</p>}
        </div>
      </div>
    </div>
  );
};
