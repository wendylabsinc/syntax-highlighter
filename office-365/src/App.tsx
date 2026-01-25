/// <reference types="office-js" />

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
  type HighlightedToken,
} from '@syntax-highlighter/core';

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
  const [hostApp, setHostApp] = useState<'word' | 'powerpoint' | 'unknown'>('unknown');
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
    // Detect Office app
    if (Office.context.host === Office.HostType.Word) {
      setHostApp('word');
      addDebug('Running in Word');
    } else if (Office.context.host === Office.HostType.PowerPoint) {
      setHostApp('powerpoint');
      addDebug('Running in PowerPoint');
    } else {
      setHostApp('unknown');
      addDebug('Unknown Office host');
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

  // PowerPoint-specific highlighting
  const highlightPowerPoint = async (
    tokens: HighlightedToken[][],
    backgroundColor: string,
    includeFontStyles: boolean
  ): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      PowerPoint.run(async (context) => {
        try {
          const selection = context.presentation.getSelectedShapes();
          selection.load('items');
          await context.sync();

          if (selection.items.length === 0) {
            resolve({ success: false, message: 'No shapes selected. Please select text box(es) containing code.' });
            return;
          }

          let textShapesFound = 0;
          let ignoredShapes = 0;
          const ignoredNames: string[] = [];

          for (const shape of selection.items) {
            shape.load(['id', 'name', 'type']);
            await context.sync();

            try {
              const textFrame = shape.textFrame;
              textFrame.load('hasText');
              await context.sync();

              if (!textFrame.hasText) {
                ignoredShapes++;
                ignoredNames.push(shape.name || `Shape ${shape.id}`);
                continue;
              }

              const textRange = textFrame.textRange;
              textRange.load('text');
              await context.sync();

              if (!textRange.text || !textRange.text.trim()) {
                ignoredShapes++;
                ignoredNames.push(shape.name || `Shape ${shape.id}`);
                continue;
              }

              const originalText = textRange.text;
              addDebug(`Processing shape "${shape.name}" with ${originalText.length} chars`);

              // Detect line ending style in original text
              const usesCR = originalText.includes('\r') && !originalText.includes('\n');
              const usesCRLF = originalText.includes('\r\n');
              addDebug(`Original text line endings: CR=${usesCR}, CRLF=${usesCRLF}`);

              // First, test if we can set color on the whole range
              addDebug('Testing basic color set...');
              try {
                // Try setting a simple color on first character
                const testRange = textRange.getSubstring(0, 1);
                testRange.font.color = 'FF0000'; // Red
                await context.sync();
                addDebug('Basic color test passed');
              } catch (testErr) {
                const testMsg = testErr instanceof Error ? testErr.message : String(testErr);
                addDebug(`Basic color test failed: ${testMsg}`);
                throw testErr;
              }

              // Apply highlighting token by token
              let charIndex = 0;
              for (let lineIdx = 0; lineIdx < tokens.length; lineIdx++) {
                const line = tokens[lineIdx];
                addDebug(`Line ${lineIdx}: ${line.length} tokens, starting at char ${charIndex}`);

                for (let tokenIdx = 0; tokenIdx < line.length; tokenIdx++) {
                  const token = line[tokenIdx];
                  const tokenLength = token.content.length;
                  const tokenContent = token.content.replace(/\n/g, '\\n').replace(/\r/g, '\\r');

                  addDebug(`  Token ${tokenIdx}: "${tokenContent}" (${tokenLength} chars) at ${charIndex}, color=${token.style.color}`);

                  if (charIndex + tokenLength > originalText.length) {
                    addDebug(`Warning: token would exceed text length at ${charIndex}`);
                    break;
                  }

                  // Get range for entire token at once
                  const tokenRange = textRange.getSubstring(charIndex, tokenLength);
                  // Remove # prefix and strip alpha channel if present (8-char hex -> 6-char)
                  let color = token.style.color.replace('#', '');
                  if (color.length === 8) {
                    // RRGGBBAA format - strip the last 2 characters (alpha)
                    color = color.substring(0, 6);
                  }
                  tokenRange.font.color = color;

                  if (includeFontStyles) {
                    if (token.style.fontStyle?.includes('bold')) {
                      tokenRange.font.bold = true;
                    }
                    if (token.style.fontStyle?.includes('italic')) {
                      tokenRange.font.italic = true;
                    }
                  }

                  charIndex += tokenLength;
                }
                // Account for newline character(s) in original text
                if (lineIdx < tokens.length - 1) {
                  if (usesCRLF) {
                    charIndex += 2; // Skip \r\n
                  } else {
                    charIndex += 1; // Skip \r or \n
                  }
                }

                // Sync after each line
                await context.sync();
                addDebug(`Line ${lineIdx} synced, charIndex now ${charIndex}`);
              }
              addDebug(`Applied ${charIndex} chars, synced ${tokens.length} lines`);

              // Set background color on shape (remove # prefix if present)
              const bgColor = backgroundColor.replace('#', '');
              addDebug(`Setting fill color: ${bgColor}`);
              shape.fill.setSolidColor(bgColor);

              await context.sync();
              addDebug('Fill color synced');

              textShapesFound++;
            } catch (shapeError) {
              const errMsg = shapeError instanceof Error ? shapeError.message : String(shapeError);
              addDebug(`Shape error: ${errMsg}`);
              ignoredShapes++;
              ignoredNames.push(shape.name || `Shape ${shape.id}`);
            }
          }

          if (textShapesFound === 0) {
            resolve({ success: false, message: 'No text boxes found in selection. Please select text box(es) only.' });
            return;
          }

          if (ignoredShapes > 0) {
            resolve({
              success: true,
              message: `Highlighted ${textShapesFound} text box(es). Ignored ${ignoredShapes} non-text shape(s).`,
            });
          } else {
            resolve({ success: true, message: `Highlighted ${textShapesFound} text box(es) successfully!` });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          resolve({ success: false, message });
        }
      });
    });
  };

  // Word-specific highlighting (HTML insertion)
  const highlightWord = async (
    tokens: HighlightedToken[][],
    backgroundColor: string,
    includeFontStyles: boolean
  ): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      Word.run(async (context) => {
        try {
          const selection = context.document.getSelection();
          addDebug('Word: Getting selection...');

          // Strip alpha from background color
          let bgColor = backgroundColor;
          if (bgColor.startsWith('#') && bgColor.length === 9) {
            bgColor = bgColor.substring(0, 7); // #RRGGBBAA -> #RRGGBB
          }

          // Build HTML using a table (Word handles table cell backgrounds better than pre)
          let lines = '';

          tokens.forEach((line) => {
            let lineHtml = '';
            line.forEach((token) => {
              // Strip alpha from token color
              let color = token.style.color;
              if (color.startsWith('#') && color.length === 9) {
                color = color.substring(0, 7);
              }

              const bold = includeFontStyles && token.style.fontStyle?.includes('bold') ? 'font-weight: bold;' : '';
              const italic = includeFontStyles && token.style.fontStyle?.includes('italic') ? 'font-style: italic;' : '';

              // Escape HTML special characters
              const content = token.content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/ /g, '&nbsp;'); // Preserve spaces

              lineHtml += `<span style="color: ${color}; ${bold} ${italic}">${content}</span>`;
            });

            lines += `<p style="margin: 0; line-height: 1.4;">${lineHtml || '&nbsp;'}</p>`;
          });

          const html = `<table style="border-collapse: collapse; width: 100%;"><tr><td style="background-color: ${bgColor}; padding: 12px; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 11pt;">${lines}</td></tr></table>`;

          addDebug(`Word: Created HTML with ${tokens.flat().length} spans`);
          addDebug('Word: Inserting HTML...');

          selection.insertHtml(html, Word.InsertLocation.replace);
          await context.sync();
          addDebug('Word: HTML inserted successfully');

          resolve({ success: true, message: 'Code highlighted successfully!' });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          addDebug(`Word error: ${message}`);
          resolve({ success: false, message });
        }
      });
    });
  };

  const handleHighlight = async () => {
    if (hostApp === 'unknown') {
      showStatus('Unsupported Office application', 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Getting selected text...', 'info');

    try {
      // Get selected text based on app
      let code = '';

      if (hostApp === 'word') {
        await Word.run(async (context) => {
          const selection = context.document.getSelection();
          selection.load('text');
          await context.sync();
          code = selection.text;
        });
      } else if (hostApp === 'powerpoint') {
        await PowerPoint.run(async (context) => {
          const selection = context.presentation.getSelectedShapes();
          selection.load('items');
          await context.sync();

          if (selection.items.length > 0) {
            const shape = selection.items[0];
            try {
              const textFrame = shape.textFrame;
              const textRange = textFrame.textRange;
              textRange.load('text');
              await context.sync();
              code = textRange.text;
            } catch {
              // Shape doesn't have text
            }
          }
        });
      }

      if (!code || !code.trim()) {
        throw new Error('No text selected. Please select some text first.');
      }

      addDebug(`Got text: ${code.length} chars`);

      // Check and normalize line endings
      const hasLF = code.includes('\n');
      const hasCR = code.includes('\r');
      addDebug(`Line endings: LF=${hasLF}, CR=${hasCR}`);

      let normalizedCode = code;
      if (hasCR && !hasLF) {
        // PowerPoint uses \r for line breaks
        normalizedCode = code.replace(/\r/g, '\n');
        addDebug('Normalized \\r to \\n');
      } else if (hasCR && hasLF) {
        normalizedCode = code.replace(/\r\n/g, '\n');
        addDebug('Normalized \\r\\n to \\n');
      }

      showStatus('Highlighting code...', 'info');

      // Highlight the code
      const result: HighlightResult = await highlightCode(normalizedCode, language, theme);
      addDebug(`Got ${result.tokens.length} token lines`);

      showStatus('Applying colors...', 'info');

      // Apply highlighting based on app
      let applyResult: { success: boolean; message: string };
      if (hostApp === 'word') {
        applyResult = await highlightWord(result.tokens, result.backgroundColor, applyFontStyles);
      } else {
        applyResult = await highlightPowerPoint(result.tokens, result.backgroundColor, applyFontStyles);
      }

      if (applyResult.success) {
        showStatus(applyResult.message, applyResult.message.includes('Ignored') ? 'warning' : 'success');
      } else {
        throw new Error(applyResult.message);
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
    if (hostApp === 'word') return 'Word';
    if (hostApp === 'powerpoint') return 'PPT';
    return 'Office';
  };

  const getBadgeColor = () => {
    if (hostApp === 'powerpoint') return 'bg-orange-600';
    return 'bg-primary';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold">Syntax Highlighter</h1>
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${getBadgeColor()} text-white`}>
          {getAppBadge()}
        </span>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Highlight code in selected text boxes
      </p>

      {/* Language Select */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Language</label>
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
        <label className="text-xs text-muted-foreground">Theme</label>
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
          className="text-xs text-muted-foreground cursor-pointer"
        >
          Apply bold/italic from theme
        </label>
      </div>

      {/* Highlight Button */}
      <Button
        onClick={handleHighlight}
        disabled={isLoading || hostApp === 'unknown'}
        className="w-full h-9 text-sm"
      >
        {isLoading ? 'Processing...' : 'Highlight Selection'}
      </Button>

      {/* Status */}
      {status && (
        <div
          className={`px-3 py-2 rounded text-xs ${
            status.type === 'info'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : status.type === 'success'
              ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30'
              : status.type === 'warning'
              ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
              : 'bg-destructive/15 text-destructive border border-destructive/30'
          }`}
        >
          {status.message}
        </div>
      )}

      <Separator />

      {/* Help Text */}
      <div className="text-[11px] text-muted-foreground leading-relaxed">
        <strong>How to use:</strong>
        <br />
        1. Select text box(es) in your {hostApp === 'word' ? 'document' : 'slide'}
        <br />
        2. Choose a language (or use Auto Detect)
        <br />
        3. Pick a color theme
        <br />
        4. Click "Highlight Selection"
      </div>

      <Separator />

      {/* Debug Section with Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="debug" className="border-none">
          <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-2">
            Debug Log {debugLog.length > 0 && `(${debugLog.length})`}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={copyDebugLog}
                className="w-full h-7 text-[10px]"
              >
                Copy Debug Log
              </Button>
              <div className="max-h-32 overflow-y-auto text-[9px] text-muted-foreground font-mono bg-muted rounded p-2">
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
