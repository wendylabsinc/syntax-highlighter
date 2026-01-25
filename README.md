# Syntax Highlighter

A syntax highlighting extension for Microsoft Office and Adobe Creative Cloud applications. Highlight code snippets in your presentations, documents, and designs with beautiful, accurate syntax coloring powered by [Shiki](https://shiki.style/).

## Supported Applications

| Application | Platform | Status |
|-------------|----------|--------|
| Microsoft PowerPoint | Office 365 Add-in | ✅ Supported |
| Microsoft Word | Office 365 Add-in | ✅ Supported |
| Adobe After Effects | CEP Panel | ✅ Supported |
| Adobe Premiere Pro | CEP Panel | 🔄 Planned |
| Adobe Illustrator | CEP Panel | 🔄 Planned |
| Adobe Photoshop | CEP Panel | 🔄 Planned |
| Adobe InDesign | CEP Panel | 🔄 Planned |

## Features

- **60+ Themes** - Dark and light themes including GitHub, Dracula, Nord, One Dark Pro, and more
- **50+ Languages** - JavaScript, TypeScript, Python, Swift, Rust, Go, and many more
- **Auto-Detection** - Automatically detects the programming language
- **Searchable Dropdowns** - Quickly find languages and themes
- **Font Style Toggle** - Optionally apply bold/italic from theme

## Project Structure

```
syntax-highlighter/
├── office-365/          # Microsoft Office Add-in (Word & PowerPoint)
│   ├── src/             # React + TypeScript source
│   ├── manifest.xml     # Office Add-in manifest
│   └── package.json
│
├── adobe-cep/           # Adobe CEP Panel (After Effects, Premiere, etc.)
│   ├── src/             # React + TypeScript source
│   ├── jsx/             # ExtendScript for Adobe apps
│   ├── CSXS/            # CEP manifest
│   └── package.json
│
└── adobe-uxp/           # Adobe UXP Plugin (Photoshop 2021+, future apps)
    ├── src/             # TypeScript source
    ├── manifest.json    # UXP manifest
    └── package.json
```

### Why Multiple Projects?

- **Office 365** uses the Office JavaScript API and runs as a web-based add-in
- **Adobe CEP** uses ExtendScript and the CEP (Common Extensibility Platform) framework for legacy Adobe apps
- **Adobe UXP** uses the newer Unified eXtensibility Platform for Photoshop 2021+ and future Adobe apps

While they share similar UI patterns, the underlying APIs are completely different, so they're maintained as separate packages.

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- For Adobe: Creative Cloud apps with CEP debugging enabled
- For Office: Microsoft 365 subscription

---

## Microsoft Office (Word & PowerPoint)

### Setup

```bash
cd office-365
npm install
```

### Development

1. Start the dev server with HTTPS:
   ```bash
   npm run dev
   ```
   This starts Vite on `https://localhost:3000`

2. Accept the self-signed certificate by visiting `https://localhost:3000` in your browser

3. Sideload the add-in:
   ```bash
   npm start
   ```
   Or manually: In Word/PowerPoint → Insert → Add-ins → My Add-ins → Upload My Add-in → select `manifest.xml`

4. The "Syntax Highlighter" button appears in the Home tab ribbon

### Testing in PowerPoint

1. Create a text box on a slide
2. Type or paste code into the text box
3. Select the text box
4. Click "Syntax Highlighter" in the ribbon
5. Choose language and theme
6. Click "Highlight Selection"

### Testing in Word

1. Type or paste code into the document
2. Select the text
3. Click "Syntax Highlighter" in the ribbon
4. Choose language and theme
5. Click "Highlight Selection"

### Build for Production

```bash
npm run build
```

Output is in the `dist/` folder.

---

## Adobe After Effects

### Setup

```bash
cd adobe-cep
npm install
```

### Enable CEP Debug Mode

Run this once to enable unsigned extensions:

**macOS:**
```bash
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

**Windows (PowerShell as Admin):**
```powershell
New-ItemProperty -Path "HKCU:\Software\Adobe\CSXS.11" -Name "PlayerDebugMode" -Value 1 -PropertyType String -Force
```

Note: Replace `CSXS.11` with the version matching your Adobe CC apps.

### Development

1. Build the extension:
   ```bash
   npm run build
   ```

2. Create a symlink to the extensions folder:

   **macOS:**
   ```bash
   ln -s "$(pwd)" "$HOME/Library/Application Support/Adobe/CEP/extensions/sh.wendy.syntaxhighlighter.cep"
   ```

   **Windows:**
   ```cmd
   mklink /D "%APPDATA%\Adobe\CEP\extensions\sh.wendy.syntaxhighlighter.cep" "%cd%"
   ```

3. Restart After Effects

4. Go to Window → Extensions → Syntax Highlighter

### Testing in After Effects

1. Create a text layer in your composition
2. Type or paste code into the text layer
3. Select the text layer(s) in the timeline
4. Open the Syntax Highlighter panel
5. Choose language and theme
6. Click "Highlight Selection"

**Requirements:** After Effects 24.2+ (uses the CharacterRange API for per-character coloring)

---

## Adobe Premiere Pro

The CEP panel is compatible with Premiere Pro but text layer support is limited. The extension will detect the host app and show "PR" badge.

Setup is the same as After Effects - the symlinked extension folder is shared.

---

## Adobe Illustrator

### Setup

Same as After Effects - use the shared CEP extension folder.

### Testing in Illustrator

1. Create a text frame with code
2. Select the text frame
3. Open Window → Extensions → Syntax Highlighter
4. Choose language and theme
5. Click "Highlight Selection"

Note: Illustrator support requires implementing the appropriate ExtendScript in `jsx/host.jsx`.

---

## Adobe Photoshop

### Setup

Same as After Effects - use the shared CEP extension folder.

### Testing in Photoshop

1. Create a text layer with code
2. Select the text layer
3. Open Window → Extensions → Syntax Highlighter
4. Choose language and theme
5. Click "Highlight Selection"

Note: Photoshop support requires implementing the appropriate ExtendScript in `jsx/host.jsx`.

---

## Adobe InDesign

### Setup

Same as After Effects - use the shared CEP extension folder.

### Testing in InDesign

1. Create a text frame with code
2. Select the text frame
3. Open Window → Extensions → Syntax Highlighter
4. Choose language and theme
5. Click "Highlight Selection"

Note: InDesign support requires implementing the appropriate ExtendScript in `jsx/host.jsx`.

---

## Tech Stack

- **UI Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS + shadcn/ui
- **Syntax Highlighting:** Shiki
- **Office API:** Office.js
- **Adobe API:** CEP + ExtendScript

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or pull request.
