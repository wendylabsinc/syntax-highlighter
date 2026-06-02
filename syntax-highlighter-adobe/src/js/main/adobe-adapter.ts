import type {
  ApplyHighlightResult as SharedApplyHighlightResult,
  HighlightColor,
  HighlightUpdate,
  SyntaxHighlighterAdapter,
  TextTarget,
} from "@syntax-highlighter/shared";
import type {
  AEColor,
  LayerHighlight,
  SelectedTextLayerInfo,
} from "../../shared/universals";
import { evalTS, subscribeBackgroundColor } from "../lib/utils/bolt";

const hexToAEColor = (hex: HighlightColor | undefined): AEColor | undefined => {
  if (!hex) return undefined;
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return undefined;
  const value = match[1];
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
};

const toLayerHighlight = (update: HighlightUpdate): LayerHighlight | undefined => {
  const ranges = update.ranges
    .map((range) => {
      const color = hexToAEColor(range.color);
      return color
        ? {
            start: range.start,
            length: range.length,
            color,
          }
        : undefined;
    })
    .filter((range): range is LayerHighlight["ranges"][number] =>
      Boolean(range),
    );

  if (ranges.length === 0) return undefined;

  return {
    layerIndex: Number(update.targetId),
    ranges,
    defaultColor: hexToAEColor(update.defaultColor),
  };
};

export const adobeAdapter: SyntaxHighlighterAdapter = {
  hostLabel: "Adobe",
  targetLabelSingular: "layer",
  targetLabelPlural: "layers",
  emptySelectionMessage:
    "Formatted 0 layers. Please select at least 1 text layer before clicking Format.",
  subscribeBackgroundColor: (setColor) => {
    if (window.cep) subscribeBackgroundColor(setColor);
  },
  getSelectedTextTargets: async (): Promise<TextTarget[]> => {
    const layers = (await evalTS(
      "getSelectedTextLayerContents",
    )) as SelectedTextLayerInfo[];

    return (layers ?? []).map((layer) => ({
      id: String(layer.index),
      name: layer.name,
      text: layer.text,
    }));
  },
  applyHighlighting: async (
    updates: HighlightUpdate[],
  ): Promise<SharedApplyHighlightResult> => {
    const payload = updates
      .map(toLayerHighlight)
      .filter((update): update is LayerHighlight => Boolean(update));

    const result = await evalTS("applyHighlighting", payload);

    return {
      ok: Boolean(result?.ok),
      formattedTargets: result?.formattedLayers ?? 0,
    };
  },
};
