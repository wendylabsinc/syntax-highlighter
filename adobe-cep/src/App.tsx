import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Combobox,
  type ComboboxOption,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Separator,
  Checkbox,
} from '@syntax-highlighter/ui';
import {
  POPULAR_LANGUAGES,
  THEMES,
  DEFAULTS,
  loadSettings,
  saveLanguage,
  saveTheme,
  highlightCode,
  type HighlightResult,
} from '@syntax-highlighter/core';
import {
  initCSInterface,
  getSelectedTextLayers,
  applyHighlighting,
  detectHostApp,
} from '@/lib/cep';

type StatusType = 'info' | 'success' | 'warning' | 'error';

interface Status {
  message: string;
  type: StatusType;
}

function App() {
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [theme, setTheme] = useState(DEFAULTS.theme);
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hostApp, setHostApp] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [applyFontStyles, setApplyFontStyles] = useState(false);

  const addDebug = useCallback((msg: string) => {
    setDebugLog((prev) => [...prev, msg]);
    console.log(msg);
  }, []);

  const showStatus = useCallback((message: string, type: StatusType) => {
    setStatus({ message, type });
    if (type === 'success' || type === 'info') {
      setTimeout(() => setStatus(null), 4000);
    }
  }, []);

  useEffect(() => {
    // Initialize CSInterface
    const initialized = initCSInterface();
    setIsInitialized(initialized);

    if (!initialized) {
      addDebug('CSInterface not available - running outside CEP');
    } else {
      addDebug('CSInterface initialized');
      const app = detectHostApp();
      setHostApp(app);
      addDebug(`Host app: ${app}`);
    }

    // Load saved settings
    const settings = loadSettings();
    setLanguage(settings.language);
    setTheme(settings.theme);
  }, [addDebug]);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    saveLanguage(value);
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    saveTheme(value);
  };

  const handleHighlight = async () => {
    if (!isInitialized) {
      showStatus('CEP interface not available', 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Getting selected layers...', 'info');

    try {
      const layersResult = await getSelectedTextLayers();
      addDebug(`Got layers: ${JSON.stringify(layersResult).substring(0, 100)}`);

      if (!layersResult.success) {
        throw new Error(layersResult.error || 'Failed to get selected layers');
      }

      if (layersResult.ignoredLayers.length > 0) {
        const names = layersResult.ignoredLayers.map((l) => l.name).join(', ');
        showStatus(`Ignored non-text layers: ${names}`, 'warning');
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      showStatus(`Processing ${layersResult.textLayers.length} text layer(s)...`, 'info');

      let successCount = 0;
      let errorCount = 0;
      let lastError = '';

      for (const layer of layersResult.textLayers) {
        try {
          addDebug(`Processing layer "${layer.name}" with ${layer.text.length} chars`);

          // Check line endings and normalize
          const hasLF = layer.text.includes('\n');
          const hasCR = layer.text.includes('\r');
          addDebug(`Line endings: LF=${hasLF}, CR=${hasCR}`);

          let normalizedText = layer.text;
          if (hasCR && !hasLF) {
            normalizedText = layer.text.replace(/\r/g, '\n');
            addDebug('Normalized \\r to \\n');
          } else if (hasCR && hasLF) {
            normalizedText = layer.text.replace(/\r\n/g, '\n');
            addDebug('Normalized \\r\\n to \\n');
          }

          const highlightResult: HighlightResult = await highlightCode(normalizedText, language, theme);
          addDebug(`Shiki returned ${highlightResult.tokens.length} token lines`);

          const applyResult = await applyHighlighting({
            layerIndex: layer.index,
            tokens: highlightResult.tokens,
            backgroundColor: highlightResult.backgroundColor,
            foregroundColor: highlightResult.foregroundColor,
            applyFontStyles,
          });

          if (applyResult.debug) {
            applyResult.debug.forEach((d) => addDebug(`ExtendScript: ${d}`));
          }
          addDebug(`Applied ${applyResult.appliedChars}/${applyResult.totalChars} chars`);

          if (applyResult.success) {
            successCount++;
          } else {
            lastError = applyResult.error || 'Unknown error';
            addDebug(`Error: ${lastError}`);
            errorCount++;
          }
        } catch (e) {
          lastError = e instanceof Error ? e.message : String(e);
          addDebug(`Error processing layer: ${lastError}`);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        showStatus(`Highlighted ${successCount} text layer(s) successfully!`, 'success');
      } else if (successCount > 0) {
        showStatus(`Highlighted ${successCount} layer(s), ${errorCount} failed: ${lastError}`, 'warning');
      } else {
        throw new Error(lastError || 'Failed to highlight any layers');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      addDebug(`Error: ${message}`);
      showStatus(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyDebugLog = () => {
    navigator.clipboard.writeText(debugLog.join('\n')).then(() => {
      alert('Debug log copied to clipboard!');
    });
  };

  // Prepare options for comboboxes
  const languageOptions: ComboboxOption[] = [
    { value: 'auto', label: 'Auto Detect' },
    ...POPULAR_LANGUAGES.map((lang) => ({ value: lang.id, label: lang.name })),
  ];

  const themeOptions: ComboboxOption[] = THEMES.map((t) => ({
    value: t.id,
    label: t.name,
    group: t.type === 'dark' ? 'Dark Themes' : 'Light Themes',
  }));

  const getAppBadge = () => {
    if (hostApp.toLowerCase().includes('after')) return 'AE';
    if (hostApp.toLowerCase().includes('premiere')) return 'PR';
    return hostApp.substring(0, 2).toUpperCase() || 'CEP';
  };

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold">Syntax Highlighter</h1>
        <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-primary text-primary-foreground">
          {getAppBadge()}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground -mt-1">
        Highlight code in selected text layers
      </p>

      {/* Language Select */}
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground">Language</label>
        <Combobox
          options={languageOptions}
          value={language}
          onValueChange={handleLanguageChange}
          placeholder="Select language..."
          searchPlaceholder="Search languages..."
        />
      </div>

      {/* Theme Select */}
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground">Theme</label>
        <Combobox
          options={themeOptions}
          value={theme}
          onValueChange={handleThemeChange}
          placeholder="Select theme..."
          searchPlaceholder="Search themes..."
        />
      </div>

      {/* Font Styles Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="fontStyles"
          checked={applyFontStyles}
          onCheckedChange={(checked) => setApplyFontStyles(checked === true)}
        />
        <label
          htmlFor="fontStyles"
          className="text-[10px] text-muted-foreground cursor-pointer"
        >
          Apply bold/italic from theme
        </label>
      </div>

      {/* Highlight Button */}
      <Button
        onClick={handleHighlight}
        disabled={isLoading || !isInitialized}
        className="w-full h-8 text-xs"
      >
        {isLoading ? 'Processing...' : 'Highlight Selection'}
      </Button>

      {/* Status */}
      {status && (
        <div
          className={`px-2.5 py-2 rounded text-[10px] ${
            status.type === 'info'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : status.type === 'success'
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : status.type === 'warning'
              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
              : 'bg-destructive/15 text-destructive border border-destructive/30'
          }`}
        >
          {status.message}
        </div>
      )}

      <Separator />

      {/* Help Text */}
      <div className="text-[9px] text-muted-foreground leading-relaxed">
        <strong>How to use:</strong>
        <br />
        1. Select text layer(s) in your composition
        <br />
        2. Choose a language (or use Auto)
        <br />
        3. Pick a color theme
        <br />
        4. Click "Highlight Selection"
      </div>

      <Separator />

      {/* Debug Section with Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="debug" className="border-none">
          <AccordionTrigger className="text-[10px] text-muted-foreground hover:no-underline py-2">
            Debug Log {debugLog.length > 0 && `(${debugLog.length})`}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={copyDebugLog}
                className="w-full h-6 text-[9px]"
              >
                Copy Debug Log
              </Button>
              <div className="max-h-24 overflow-y-auto text-[8px] text-muted-foreground font-mono bg-muted rounded p-1.5">
                {debugLog.length === 0 ? (
                  <span className="italic">No debug messages yet</span>
                ) : (
                  debugLog.map((msg, i) => (
                    <div key={i}>{msg}</div>
                  ))
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default App;
