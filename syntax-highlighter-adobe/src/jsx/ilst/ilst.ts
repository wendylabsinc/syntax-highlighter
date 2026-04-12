import {
  helloVoid,
  helloError,
  helloStr,
  helloNum,
  helloArrayStr,
  helloObj,
} from "../utils/samples";
export { helloError, helloStr, helloNum, helloArrayStr, helloObj, helloVoid };

import type {
  ApplyHighlightResult,
  LayerHighlight,
  SelectedTextLayerInfo,
} from "../../shared/universals";

export const helloWorld = () => {
  alert("Hello from Illustrator");
};

/**
 * Converts a 0..1 RGB triple to an Illustrator RGBColor (0..255).
 */
const makeRGBColor = (color: [number, number, number]): RGBColor => {
  const c = new RGBColor();
  c.red = Math.round(color[0] * 255);
  c.green = Math.round(color[1] * 255);
  c.blue = Math.round(color[2] * 255);
  return c;
};

/**
 * Returns the selected text frames and their contents.
 * In Illustrator, the "index" we return is the item's position in the
 * selection array (0-based). This is stable between getSelectedTextLayerContents
 * and applyHighlighting because both calls happen back-to-back from the
 * panel's handleFormat without any user interaction in between.
 */
export const getSelectedTextLayerContents = (): SelectedTextLayerInfo[] => {
  if (!app.documents.length) return [];
  const doc = app.activeDocument;
  const sel = doc.selection;
  if (!sel || !sel.length) return [];

  const result: SelectedTextLayerInfo[] = [];
  for (let i = 0; i < sel.length; i++) {
    const item = sel[i];
    if (!(item instanceof TextFrame)) continue;
    const text = item.contents;
    if (text.length === 0) continue;
    result.push({
      index: i,
      name: item.name || "Text Frame " + (i + 1),
      text: text,
    });
  }
  return result;
};

/**
 * Applies per-character fill colors to the selected text frames.
 * Illustrator auto-groups all scripted changes into a single undo step,
 * so no explicit undo group is needed.
 */
export const applyHighlighting = (
  updates: LayerHighlight[],
): ApplyHighlightResult => {
  if (!app.documents.length) return { ok: false, formattedLayers: 0 };
  const doc = app.activeDocument;
  const sel = doc.selection;
  if (!sel || !sel.length) return { ok: false, formattedLayers: 0 };

  let formatted = 0;
  for (let u = 0; u < updates.length; u++) {
    const update = updates[u];
    const idx = update.layerIndex;
    if (idx < 0 || idx >= sel.length) continue;
    const item = sel[idx];
    if (!(item instanceof TextFrame)) continue;

    const chars = item.characters;
    const fullLen = chars.length;
    if (fullLen === 0) continue;

    // Apply default foreground color to all characters first.
    if (update.defaultColor) {
      const defaultFill = makeRGBColor(update.defaultColor);
      for (let c = 0; c < fullLen; c++) {
        chars[c].characterAttributes.fillColor = defaultFill;
      }
    }

    // Apply per-token colors.
    for (let r = 0; r < update.ranges.length; r++) {
      const range = update.ranges[r];
      if (range.length <= 0) continue;
      const start = range.start;
      if (start >= fullLen) continue;
      let end = start + range.length;
      if (end > fullLen) end = fullLen;
      const fill = makeRGBColor(range.color);
      for (let c = start; c < end; c++) {
        chars[c].characterAttributes.fillColor = fill;
      }
    }

    formatted++;
  }

  // Force a redraw so the color changes are visible immediately.
  app.redraw();

  return { ok: true, formattedLayers: formatted };
};
