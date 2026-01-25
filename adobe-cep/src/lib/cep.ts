// CEP Interface types and utilities

declare global {
  interface Window {
    CSInterface: new () => CSInterface;
  }
}

interface CSInterface {
  evalScript(script: string, callback?: (result: string) => void): void;
  getHostEnvironment(): HostEnvironment | null;
  addEventListener(type: string, listener: (event: CSEvent) => void): void;
}

interface HostEnvironment {
  appName: string;
  appVersion: string;
  appSkinInfo?: AppSkinInfo;
}

interface AppSkinInfo {
  panelBackgroundColor: {
    color: { red: number; green: number; blue: number };
  };
}

interface CSEvent {
  type: string;
  data: string;
}

let csInterface: CSInterface | null = null;

export function initCSInterface(): boolean {
  try {
    if (window.CSInterface) {
      csInterface = new window.CSInterface();
      return true;
    }
  } catch (e) {
    console.error('Failed to initialize CSInterface:', e);
  }
  return false;
}

export function getCSInterface(): CSInterface | null {
  return csInterface;
}

export function evalScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!csInterface) {
      reject(new Error('CSInterface not initialized'));
      return;
    }
    try {
      csInterface.evalScript(script, (result: string) => {
        if (result === 'EvalScript error.' || result === 'undefined' || result === undefined || result === null) {
          reject(new Error('ExtendScript returned: ' + result));
        } else {
          resolve(result);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function detectHostApp(): string {
  if (!csInterface) return 'Unknown';
  try {
    const env = csInterface.getHostEnvironment();
    if (env) return env.appName;
  } catch (e) {
    console.error('Could not detect host app:', e);
  }
  return 'Unknown';
}

export interface TextLayerInfo {
  index: number;
  name: string;
  text: string;
}

export interface GetLayersResult {
  success: boolean;
  textLayers: TextLayerInfo[];
  ignoredLayers: Array<{ index: number; name: string; type: string }>;
  error: string | null;
}

export interface ApplyResult {
  success: boolean;
  error: string | null;
  debug?: string[];
  appliedChars?: number;
  totalChars?: number;
}

export async function getSelectedTextLayers(): Promise<GetLayersResult> {
  const result = await evalScript('getSelectedTextLayers()');
  return JSON.parse(result) as GetLayersResult;
}

export async function applyHighlighting(data: {
  layerIndex: number;
  tokens: Array<Array<{ content: string; style: { color: string } }>>;
  backgroundColor: string;
  foregroundColor: string;
}): Promise<ApplyResult> {
  const jsonStr = JSON.stringify(data)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');

  const result = await evalScript(`applyHighlighting('${jsonStr}')`);
  return JSON.parse(result) as ApplyResult;
}
