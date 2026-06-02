import type {
  ApplyHighlightResult,
  HighlightUpdate,
  SyntaxHighlighterAdapter,
  TextTarget,
} from "@syntax-highlighter/shared";

const SELECTED_TEXT_RANGE_ID = "__selected_text_range__";

const getOffice = () => (globalThis as { Office?: any }).Office;
const getPowerPoint = () => (globalThis as { PowerPoint?: any }).PowerPoint;

const ensurePowerPoint = () => {
  const office = getOffice();
  const powerpoint = getPowerPoint();

  if (!office?.context) {
    throw new Error("Office.js is not ready yet.");
  }
  if (office.context.host !== office.HostType.PowerPoint) {
    throw new Error("This add-in must be opened in PowerPoint.");
  }
  if (!powerpoint?.run) {
    throw new Error("PowerPoint JavaScript APIs are unavailable.");
  }

  return powerpoint;
};

const getSelectedTextRangeTarget = async (): Promise<TextTarget[]> => {
  const powerpoint = ensurePowerPoint();

  try {
    return await powerpoint.run(async (context: any) => {
      const textRange = context.presentation.getSelectedTextRange();
      textRange.load("text");
      await context.sync();

      const text = String(textRange.text ?? "");
      return text.length > 0
        ? [
            {
              id: SELECTED_TEXT_RANGE_ID,
              name: "Selected text",
              text,
            },
          ]
        : [];
    });
  } catch {
    return [];
  }
};

const getSelectedShapeTargets = async (): Promise<TextTarget[]> => {
  const powerpoint = ensurePowerPoint();

  return powerpoint.run(async (context: any) => {
    const shapes = context.presentation.getSelectedShapes();
    const countResult = shapes.getCount();
    await context.sync();

    const shapeCount = Number(countResult.value ?? 0);
    const selectedShapes: any[] = [];

    for (let index = 0; index < shapeCount; index++) {
      const shape = shapes.getItemAt(index);
      shape.load("id,name");
      shape.textFrame.load("hasText");
      selectedShapes.push(shape);
    }

    await context.sync();

    const textShapes = selectedShapes.filter(
      (shape) => shape.textFrame?.hasText,
    );
    for (const shape of textShapes) {
      shape.textFrame.textRange.load("text");
    }

    await context.sync();

    return textShapes
      .map((shape, index): TextTarget => {
        const text = String(shape.textFrame.textRange.text ?? "");
        return {
          id: shape.id ? String(shape.id) : String(index),
          name: shape.name ? String(shape.name) : `Shape ${index + 1}`,
          text,
        };
      })
      .filter((target) => target.text.length > 0);
  });
};

const applySelectedTextRangeHighlighting = async (
  update: HighlightUpdate,
): Promise<ApplyHighlightResult> => {
  const powerpoint = ensurePowerPoint();

  return powerpoint.run(async (context: any) => {
    const textRange = context.presentation.getSelectedTextRange();

    if (update.defaultColor) {
      textRange.font.color = update.defaultColor;
    }

    for (const range of update.ranges) {
      if (range.length <= 0) continue;
      textRange.getSubstring(range.start, range.length).font.color = range.color;
    }

    await context.sync();
    return { ok: true, formattedTargets: 1 };
  });
};

const applySelectedShapeHighlighting = async (
  updates: HighlightUpdate[],
): Promise<ApplyHighlightResult> => {
  const powerpoint = ensurePowerPoint();
  const updatesByTarget = new Map(updates.map((update) => [update.targetId, update]));

  return powerpoint.run(async (context: any) => {
    const shapes = context.presentation.getSelectedShapes();
    const countResult = shapes.getCount();
    await context.sync();

    const shapeCount = Number(countResult.value ?? 0);
    const selectedShapes: any[] = [];

    for (let index = 0; index < shapeCount; index++) {
      const shape = shapes.getItemAt(index);
      shape.load("id");
      shape.textFrame.load("hasText");
      selectedShapes.push(shape);
    }

    await context.sync();

    let formatted = 0;
    for (let index = 0; index < selectedShapes.length; index++) {
      const shape = selectedShapes[index];
      if (!shape.textFrame?.hasText) continue;

      const targetId = shape.id ? String(shape.id) : String(index);
      const update = updatesByTarget.get(targetId);
      if (!update) continue;

      const textRange = shape.textFrame.textRange;
      if (update.defaultColor) {
        textRange.font.color = update.defaultColor;
      }

      for (const range of update.ranges) {
        if (range.length <= 0) continue;
        textRange.getSubstring(range.start, range.length).font.color =
          range.color;
      }

      formatted++;
    }

    await context.sync();
    return { ok: true, formattedTargets: formatted };
  });
};

export const powerpointAdapter: SyntaxHighlighterAdapter = {
  hostLabel: "PowerPoint",
  targetLabelSingular: "text box",
  targetLabelPlural: "text boxes",
  emptySelectionMessage:
    "Formatted 0 text boxes. Select text or at least 1 text box before clicking Format.",
  getSelectedTextTargets: async () => {
    const selectedText = await getSelectedTextRangeTarget();
    return selectedText.length > 0 ? selectedText : getSelectedShapeTargets();
  },
  applyHighlighting: async (updates) => {
    const selectedTextUpdate = updates.find(
      (update) => update.targetId === SELECTED_TEXT_RANGE_ID,
    );

    if (selectedTextUpdate) {
      return applySelectedTextRangeHighlighting(selectedTextUpdate);
    }

    return applySelectedShapeHighlighting(updates);
  },
};
