// Adobe UXP Type Definitions for Photoshop, Illustrator, InDesign

declare global {
  // Photoshop API
  const require: (module: string) => unknown;

  interface Window {
    require: (module: string) => unknown;
  }
}

// Photoshop types
export interface PhotoshopAction {
  batchPlay: (
    commands: PhotoshopCommand[],
    options?: { synchronousExecution?: boolean; modalBehavior?: string }
  ) => Promise<PhotoshopResult[]>;
}

export interface PhotoshopCommand {
  _obj: string;
  _target?: PhotoshopReference[];
  [key: string]: unknown;
}

export interface PhotoshopReference {
  _ref: string;
  _enum?: string;
  _value?: string;
  _id?: number;
  _index?: number;
}

export interface PhotoshopResult {
  [key: string]: unknown;
}

export interface PhotoshopCore {
  executeAsModal: <T>(
    callback: (context: ExecutionContext) => Promise<T>,
    options: { commandName: string }
  ) => Promise<T>;
}

export interface ExecutionContext {
  isCancelled: boolean;
  onCancel: () => void;
  reportProgress: (options: { value: number; commandName?: string }) => void;
  hostControl: {
    suspendHistory: (options: { documentID: number; name: string }) => Promise<number>;
    resumeHistory: (suspensionID: number, commit?: boolean) => Promise<void>;
  };
}

export interface PhotoshopApp {
  activeDocument: PhotoshopDocument | null;
  documents: PhotoshopDocument[];
}

export interface PhotoshopDocument {
  id: number;
  name: string;
  layers: PhotoshopLayer[];
  activeLayers: PhotoshopLayer[];
}

export interface PhotoshopLayer {
  id: number;
  name: string;
  kind: string;
  textItem?: PhotoshopTextItem;
  selected: boolean;
}

export interface PhotoshopTextItem {
  contents: string;
}

// Illustrator types
export interface IllustratorApp {
  activeDocument: IllustratorDocument | null;
  documents: IllustratorDocument[];
}

export interface IllustratorDocument {
  name: string;
  selection: IllustratorItem[];
  textFrames: IllustratorTextFrame[];
}

export interface IllustratorItem {
  typename: string;
}

export interface IllustratorTextFrame extends IllustratorItem {
  contents: string;
  textRange: IllustratorTextRange;
  characters: IllustratorCharacters;
}

export interface IllustratorTextRange {
  contents: string;
  characterAttributes: IllustratorCharacterAttributes;
  characters: IllustratorCharacters;
}

export interface IllustratorCharacters {
  length: number;
  [index: number]: IllustratorCharacter;
}

export interface IllustratorCharacter {
  contents: string;
  characterAttributes: IllustratorCharacterAttributes;
}

export interface IllustratorCharacterAttributes {
  fillColor: IllustratorColor;
}

export interface IllustratorColor {
  typename: string;
}

export interface IllustratorRGBColor extends IllustratorColor {
  typename: 'RGBColor';
  red: number;
  green: number;
  blue: number;
}

export {};
