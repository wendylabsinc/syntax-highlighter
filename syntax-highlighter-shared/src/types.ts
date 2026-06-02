export type HighlightColor = `#${string}`;

export type TextTarget = {
  id: string;
  name?: string;
  text: string;
};

export type HighlightRange = {
  start: number;
  length: number;
  color: HighlightColor;
};

export type HighlightUpdate = {
  targetId: string;
  ranges: HighlightRange[];
  defaultColor?: HighlightColor;
};

export type ApplyHighlightResult = {
  ok: boolean;
  formattedTargets: number;
  message?: string;
};

export type SyntaxHighlighterAdapter = {
  hostLabel: string;
  targetLabelSingular: string;
  targetLabelPlural: string;
  emptySelectionMessage?: string;
  getSelectedTextTargets: () => Promise<TextTarget[]>;
  applyHighlighting: (updates: HighlightUpdate[]) => Promise<ApplyHighlightResult>;
  subscribeBackgroundColor?: (setColor: (color: string) => void) => void | (() => void);
};
