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
  alert("Hello from After Effects!");
  app.project.activeItem;
};

const isTextLayer = (layer: Layer): layer is TextLayer => {
  try {
    return (layer as TextLayer).text !== undefined && (layer as any).text !== null;
  } catch (e) {
    return false;
  }
};

const escapeTextEditMode = (layer: Layer): void => {
  try {
    const wasSelected = layer.selected;
    layer.selected = false;
    layer.selected = wasSelected;
  } catch (e) {
    // best-effort
  }
};

/**
 * Returns the selected text layers and their source text content.
 * Called on-demand when the user clicks Format — by that point focus has
 * moved to the CEP panel so text-edit mode is dropped.
 */
export const getSelectedTextLayerContents = (): SelectedTextLayerInfo[] => {
  const activeItem = app.project.activeItem;
  if (!(activeItem instanceof CompItem)) return [];

  try {
    if (app.activeViewer) app.activeViewer.setActive();
  } catch (e) {
    /* ignore */
  }

  const selected = activeItem.selectedLayers;
  const result: SelectedTextLayerInfo[] = [];

  for (let i = 0; i < selected.length; i++) {
    const layer = selected[i];
    if (!isTextLayer(layer)) continue;
    escapeTextEditMode(layer);
    let text = "";
    try {
      text = (layer.property("Source Text") as TextDocumentProperty).value.text;
    } catch (e) {
      text = "";
    }
    if (text.length > 0) {
      result.push({ index: layer.index, name: layer.name, text: text });
    }
  }

  return result;
};

/**
 * Applies character-range fills to text layers using the
 * TextDocument.characterRange() API (AE 24+).
 */
export const applyHighlighting = (
  updates: LayerHighlight[],
): ApplyHighlightResult => {
  const activeItem = app.project.activeItem;
  if (!(activeItem instanceof CompItem)) {
    return { ok: false, formattedLayers: 0 };
  }

  try {
    if (app.activeViewer) app.activeViewer.setActive();
  } catch (e) {
    /* ignore */
  }

  app.beginUndoGroup("Syntax Highlight");
  let formatted = 0;
  let caught: any = null;
  try {
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const layer = activeItem.layer(update.layerIndex);
      if (!isTextLayer(layer)) continue;

      escapeTextEditMode(layer);

      const sourceTextProp = layer.property(
        "Source Text",
      ) as TextDocumentProperty;
      const textDoc = sourceTextProp.value;
      const fullLen = textDoc.text.length;
      if (fullLen === 0) continue;

      if (update.defaultColor) {
        textDoc.applyFill = true;
        textDoc.fillColor = update.defaultColor;
      }

      for (let r = 0; r < update.ranges.length; r++) {
        const range = update.ranges[r];
        if (range.length <= 0) continue;
        const start = range.start;
        if (start >= fullLen) continue;
        let end = start + range.length;
        if (end > fullLen) end = fullLen;
        if (end <= start) continue;
        const charRange = textDoc.characterRange(start, end);
        charRange.fillColor = range.color;
      }

      sourceTextProp.setValue(textDoc);
      formatted++;
    }
  } catch (e) {
    caught = e;
  }
  app.endUndoGroup();

  if (caught) {
    throw new Error(
      "applyHighlighting failed after " +
        formatted +
        " layer(s): " +
        (caught && caught.toString ? caught.toString() : String(caught)),
    );
  }

  return { ok: true, formattedLayers: formatted };
};
