/**
 * @description Shared types for CEP <-> ExtendScript communication.
 */

/** RGB color with components in the 0..1 range (AE's native fillColor format). */
export type AEColor = [number, number, number];

/** A contiguous run of characters in a text layer that should be colored. */
export type HighlightRange = {
  start: number;
  length: number;
  color: AEColor;
};

/** Per-layer highlight payload produced by the panel and consumed by ExtendScript. */
export type LayerHighlight = {
  layerIndex: number;
  ranges: HighlightRange[];
  defaultColor?: AEColor;
};

/** A selected text layer with its source text, returned by getSelectedTextLayerContents. */
export type SelectedTextLayerInfo = {
  index: number;
  name: string;
  text: string;
};

/** Result returned after applying highlighting. */
export type ApplyHighlightResult = {
  ok: boolean;
  formattedLayers: number;
};

/**
 * @description Declare event types for listening with listenTS() and dispatching with dispatchTS()
 */
export type EventTS = {
  myCustomEvent: {
    oneValue: string;
    anotherValue: number;
  };
};
