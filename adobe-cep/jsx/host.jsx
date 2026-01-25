/**
 * ExtendScript Host for Adobe Apps
 * Supports: After Effects, Illustrator
 */

// Detect which app we're running in
var HOST_APP = (function() {
  if (typeof app !== 'undefined') {
    if (app.name === 'Adobe Illustrator') return 'ILST';
    if (app.name === 'Adobe After Effects') return 'AEFT';
    if (app.name === 'Adobe Premiere Pro') return 'PPRO';
    if (app.name === 'Adobe Photoshop') return 'PHSP';
    if (app.name === 'Adobe InDesign') return 'IDSN';
  }
  return 'UNKNOWN';
})();

// ============================================================================
// AFTER EFFECTS
// ============================================================================

function isTextLayer_AE(layer) {
  try {
    var sourceText = layer.property("Source Text");
    return sourceText !== null && sourceText !== undefined;
  } catch (e) {
    return false;
  }
}

function getSelectedTextLayers_AE() {
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

      if (isTextLayer_AE(layer)) {
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

function applyHighlighting_AE(highlightDataJson) {
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

    if (!layer || !isTextLayer_AE(layer)) {
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

      // Add newline color
      if (lineIdx < tokens.length - 1) {
        charColors.push(defaultColor);
      }
    }
    result.debug.push("Built color array: " + charColors.length + " colors");

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

    // Commit changes
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
    result.error = "Error: " + e.toString();
    try { app.endUndoGroup(); } catch(ex) {}
  }

  return JSON.stringify(result);
}

// ============================================================================
// ILLUSTRATOR
// ============================================================================

function getSelectedTextLayers_ILST() {
  var result = {
    success: false,
    textLayers: [],
    ignoredLayers: [],
    error: null
  };

  try {
    if (!app.documents.length) {
      result.error = "No document open. Please open a document first.";
      return JSON.stringify(result);
    }

    var doc = app.activeDocument;
    var selection = doc.selection;

    if (!selection || selection.length === 0) {
      result.error = "No items selected. Please select one or more text frames.";
      return JSON.stringify(result);
    }

    for (var i = 0; i < selection.length; i++) {
      var item = selection[i];

      if (item.typename === 'TextFrame') {
        result.textLayers.push({
          index: i,
          name: item.name || ('Text Frame ' + (i + 1)),
          text: item.contents
        });
      } else {
        result.ignoredLayers.push({
          index: i,
          name: item.name || item.typename,
          type: item.typename
        });
      }
    }

    if (result.textLayers.length === 0) {
      result.error = "No text frames in selection. Please select text frame(s) only.";
      return JSON.stringify(result);
    }

    result.success = true;

  } catch (e) {
    result.error = "Error: " + e.toString();
  }

  return JSON.stringify(result);
}

function applyHighlighting_ILST(highlightDataJson) {
  var result = {
    success: false,
    error: null,
    debug: [],
    appliedChars: 0,
    totalChars: 0
  };

  try {
    var data = JSON.parse(highlightDataJson);
    result.debug.push("Parsed data, token lines: " + data.tokens.length);

    if (!app.documents.length) {
      result.error = "No document open.";
      return JSON.stringify(result);
    }

    var doc = app.activeDocument;
    var selection = doc.selection;

    if (!selection || selection.length <= data.layerIndex) {
      result.error = "Selected item not found.";
      return JSON.stringify(result);
    }

    var textFrame = selection[data.layerIndex];

    if (textFrame.typename !== 'TextFrame') {
      result.error = "Selected item is not a text frame.";
      return JSON.stringify(result);
    }

    result.debug.push("Text frame found: " + textFrame.contents.length + " chars");

    // Build flat array of colors for each character
    var charColors = [];
    var tokens = data.tokens;

    for (var lineIdx = 0; lineIdx < tokens.length; lineIdx++) {
      var line = tokens[lineIdx];

      for (var tokenIdx = 0; tokenIdx < line.length; tokenIdx++) {
        var token = line[tokenIdx];
        var color = token.style.color;
        var content = token.content;

        for (var c = 0; c < content.length; c++) {
          charColors.push(color);
        }
      }

      // Add newline color (use foreground color)
      if (lineIdx < tokens.length - 1) {
        charColors.push(data.foregroundColor || '#ffffff');
      }
    }
    result.debug.push("Built color array: " + charColors.length + " colors");

    // Get text range
    var textRange = textFrame.textRange;
    var totalChars = textRange.characters.length;
    result.totalChars = totalChars;
    result.debug.push("Total characters in frame: " + totalChars);

    // Apply per-character coloring
    var applyLength = Math.min(charColors.length, totalChars);
    var appliedCount = 0;

    for (var i = 0; i < applyLength; i++) {
      try {
        var charItem = textRange.characters[i];
        var hexColor = charColors[i];

        // Convert hex to RGB color
        var rgbColor = new RGBColor();
        var hex = hexColor.replace('#', '');
        if (hex.length === 8) hex = hex.substring(0, 6); // Strip alpha

        rgbColor.red = parseInt(hex.substring(0, 2), 16);
        rgbColor.green = parseInt(hex.substring(2, 4), 16);
        rgbColor.blue = parseInt(hex.substring(4, 6), 16);

        charItem.characterAttributes.fillColor = rgbColor;
        appliedCount++;
      } catch (charErr) {
        result.debug.push("Char " + i + " error: " + charErr.toString());
      }
    }

    result.debug.push("Applied colors to " + appliedCount + " chars");
    result.appliedChars = appliedCount;
    result.success = true;

  } catch (e) {
    result.error = "Error: " + e.toString();
  }

  return JSON.stringify(result);
}

// ============================================================================
// ROUTER - Route calls to appropriate app-specific functions
// ============================================================================

function getSelectedTextLayers() {
  switch (HOST_APP) {
    case 'AEFT':
      return getSelectedTextLayers_AE();
    case 'ILST':
      return getSelectedTextLayers_ILST();
    default:
      return JSON.stringify({
        success: false,
        textLayers: [],
        ignoredLayers: [],
        error: "Unsupported application: " + (app.name || 'Unknown') + ". Currently supports After Effects and Illustrator."
      });
  }
}

function applyHighlighting(highlightDataJson) {
  switch (HOST_APP) {
    case 'AEFT':
      return applyHighlighting_AE(highlightDataJson);
    case 'ILST':
      return applyHighlighting_ILST(highlightDataJson);
    default:
      return JSON.stringify({
        success: false,
        error: "Unsupported application: " + (app.name || 'Unknown') + ". Currently supports After Effects and Illustrator.",
        debug: []
      });
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function hexToRgbArray(hex) {
  if (!hex) return [0.83, 0.83, 0.83];
  hex = hex.replace('#', '');
  if (hex.length === 8) hex = hex.substring(0, 6); // Strip alpha
  if (hex.length !== 6) return [0.83, 0.83, 0.83];

  var r = parseInt(hex.substring(0, 2), 16) / 255;
  var g = parseInt(hex.substring(2, 4), 16) / 255;
  var b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
}

function getAppInfo() {
  return JSON.stringify({
    appName: app.name || 'Unknown',
    version: app.version || 'Unknown',
    hostApp: HOST_APP
  });
}

function testConnection() {
  return JSON.stringify({
    success: true,
    message: "ExtendScript connection working",
    hostApp: HOST_APP,
    appName: app.name || 'Unknown'
  });
}
