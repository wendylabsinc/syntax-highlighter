/**
 * ExtendScript Host for After Effects
 * This file runs in After Effects' ExtendScript engine
 */

// Helper: Check if a layer is a text layer
function isTextLayer(layer) {
  try {
    var sourceText = layer.property("Source Text");
    return sourceText !== null && sourceText !== undefined;
  } catch (e) {
    return false;
  }
}

// Get selected text layers from the active composition
function getSelectedTextLayers() {
  var result = {
    success: false,
    textLayers: [],
    ignoredLayers: [],
    error: null
  };

  try {
    var comp = app.project.activeItem;

    if (!comp || !(comp instanceof CompItem)) {
      result.error = "No active composition. Please open a composition first.";
      return JSON.stringify(result);
    }

    var selectedLayers = comp.selectedLayers;

    if (!selectedLayers || selectedLayers.length === 0) {
      result.error = "No layers selected. Please select one or more text layers.";
      return JSON.stringify(result);
    }

    for (var i = 0; i < selectedLayers.length; i++) {
      var layer = selectedLayers[i];

      if (isTextLayer(layer)) {
        var textProp = layer.property("Source Text");
        var textDocument = textProp.value;

        result.textLayers.push({
          index: layer.index,
          name: layer.name,
          text: textDocument.text
        });
      } else {
        result.ignoredLayers.push({
          index: layer.index,
          name: layer.name,
          type: "non-text"
        });
      }
    }

    if (result.textLayers.length === 0) {
      result.error = "No text layers in selection. Please select text layer(s) only.";
      return JSON.stringify(result);
    }

    result.success = true;

  } catch (e) {
    result.error = "Error: " + e.toString();
  }

  return JSON.stringify(result);
}

// Helper: Convert hex color to RGB array [r, g, b] normalized to 0-1
function hexToRgbArray(hex) {
  if (!hex) return [0.83, 0.83, 0.83];
  hex = hex.replace('#', '');
  if (hex.length !== 6) return [0.83, 0.83, 0.83];

  var r = parseInt(hex.substring(0, 2), 16) / 255;
  var g = parseInt(hex.substring(2, 4), 16) / 255;
  var b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
}

// Apply syntax highlighting to a text layer using CharacterRange API (AE 24.2+)
function applyHighlighting(highlightDataJson) {
  var result = {
    success: false,
    error: null,
    debug: []
  };

  try {
    var data = JSON.parse(highlightDataJson);
    result.debug.push("Parsed data, tokens lines: " + data.tokens.length);

    var comp = app.project.activeItem;

    if (!comp || !(comp instanceof CompItem)) {
      result.error = "No active composition.";
      return JSON.stringify(result);
    }

    var layer = comp.layer(data.layerIndex);

    if (!layer || !isTextLayer(layer)) {
      result.error = "Layer not found or not a text layer.";
      return JSON.stringify(result);
    }

    app.beginUndoGroup("Syntax Highlighting");

    var textProp = layer.property("Source Text");
    var textDocument = textProp.value;
    result.debug.push("Text length: " + textDocument.text.length);

    // Check if CharacterRange API is available (AE 24.2+)
    if (typeof textDocument.characterRange !== "function") {
      result.error = "CharacterRange API not available. Please update to After Effects 24.2 or later.";
      app.endUndoGroup();
      return JSON.stringify(result);
    }
    result.debug.push("CharacterRange API available");

    // Build a flat array of colors for each character
    var charColors = [];
    var defaultColor = data.foregroundColor ? hexToRgbArray(data.foregroundColor) : [0.83, 0.83, 0.83];
    var tokens = data.tokens;

    for (var lineIdx = 0; lineIdx < tokens.length; lineIdx++) {
      var line = tokens[lineIdx];

      for (var tokenIdx = 0; tokenIdx < line.length; tokenIdx++) {
        var token = line[tokenIdx];
        var color = hexToRgbArray(token.style.color);
        var content = token.content;

        for (var c = 0; c < content.length; c++) {
          charColors.push(color);
        }
      }

      // Add newline/carriage return color (AE uses \r for line breaks)
      if (lineIdx < tokens.length - 1) {
        charColors.push(defaultColor);
      }
    }
    result.debug.push("Built color array: " + charColors.length + " colors");

    // Check text for line ending type
    var textContent = textDocument.text;
    var hasLF = textContent.indexOf('\n') >= 0;
    var hasCR = textContent.indexOf('\r') >= 0;
    result.debug.push("Text line endings: LF=" + hasLF + ", CR=" + hasCR);

    // Apply per-character coloring
    var totalTextLength = textDocument.text.length;
    var applyLength = Math.min(charColors.length, totalTextLength);
    result.debug.push("Will apply to " + applyLength + " chars");

    var lastError = null;
    var appliedCount = 0;

    for (var i = 0; i < applyLength; i++) {
      try {
        var charRange = textDocument.characterRange(i, i + 1);
        charRange.fillColor = charColors[i];
        appliedCount++;
      } catch (charErr) {
        if (!lastError) {
          lastError = "Char " + i + ": " + charErr.toString();
        }
      }
    }
    result.debug.push("Applied " + appliedCount + " colors");
    if (lastError) {
      result.debug.push("First error: " + lastError);
    }

    // Commit changes
    result.debug.push("Committing with setValue...");
    if (textProp.isTimeVarying) {
      textProp.setValueAtTime(comp.time, textDocument);
    } else {
      textProp.setValue(textDocument);
    }
    result.debug.push("setValue complete");

    app.endUndoGroup();
    result.success = true;
    result.appliedChars = appliedCount;
    result.totalChars = totalTextLength;

  } catch (e) {
    result.error = "Error: " + e.toString() + " Line: " + (e.line || "?");
    try { app.endUndoGroup(); } catch(ex) {}
  }

  return JSON.stringify(result);
}


// Get app info for debugging
function getAppInfo() {
  return JSON.stringify({
    appName: app.appName,
    version: app.version,
    buildNumber: app.buildNumber
  });
}

// Test function
function testConnection() {
  return JSON.stringify({ success: true, message: "ExtendScript connection working" });
}
