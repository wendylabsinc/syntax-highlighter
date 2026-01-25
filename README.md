# Syntax Highlighter

A syntax highlighting extension for Microsoft Office and Adobe Creative Cloud applications. Highlight code snippets in your presentations, documents, and designs with beautiful, accurate syntax coloring powered by [Shiki](https://shiki.style/).

## Supported Applications

| Application | Platform | Status |
|-------------|----------|--------|
| Microsoft PowerPoint | Office 365 Add-in | ✅ Supported |
| Microsoft Word | Office 365 Add-in | ✅ Supported |
| Adobe After Effects | CEP Panel | ✅ Supported |
| Adobe Illustrator | CEP Panel | ✅ Supported |
| Adobe Premiere Pro | CEP Panel | 🔄 Planned |
| Adobe Photoshop | CEP Panel | 🔄 Planned |
| Adobe InDesign | CEP Panel | 🔄 Planned |

## Features

- **60+ Themes** - Dark and light themes including GitHub, Dracula, Nord, One Dark Pro, and more
- **50+ Languages** - JavaScript, TypeScript, Python, Swift, Rust, Go, and many more
- **Auto-Detection** - Automatically detects the programming language
- **Searchable Dropdowns** - Quickly find languages and themes
- **Font Style Toggle** - Optionally apply bold/italic from theme

## Project Structure

This is a monorepo with shared packages to eliminate code duplication:

```
syntax-highlighter/
├── packages/
│   ├── core/                # @syntax-highlighter/core
│   │   └── src/
│   │       ├── config.ts    # Themes, languages, defaults
│   │       ├── highlighter.ts # Shiki integration
│   │       └── storage.ts   # localStorage helpers
│   │
│   └── ui/                  # @syntax-highlighter/ui
│       └── src/
│           ├── components/  # Shared React components (shadcn/ui)
│           └── utils.ts     # cn() utility
│
├── office-365/              # Microsoft Office Add-in (Word & PowerPoint)
│   ├── src/
│   │   └── App.tsx          # Office.js integration
│   └── manifest.xml         # Office Add-in manifest
│
└── adobe-cep/               # Adobe CEP Panel (After Effects, Illustrator, etc.)
    ├── src/
    │   ├── App.tsx          # CEP panel UI
    │   └── lib/cep.ts       # CSInterface wrapper
    ├── jsx/host.jsx         # ExtendScript for Adobe apps
    └── CSXS/manifest.xml    # CEP manifest
```

### Why Shared Packages?

- **@syntax-highlighter/core** - Contains Shiki highlighter, theme/language configs, and storage utilities shared by all apps
- **@syntax-highlighter/ui** - Contains React components (Button, Combobox, Accordion, etc.) used across all apps

The platform-specific code (Office.js API, CEP/ExtendScript) remains in their respective app folders.

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm 7+ (for workspaces support)
- For Adobe: Creative Cloud apps with CEP debugging enabled
- For Office: Microsoft 365 subscription

### Install Dependencies

From the repository root:

```bash
npm install
```

This installs dependencies for all packages and apps, and links the shared packages.

### Build Commands

```bash
# Build everything
npm run build

# Build only shared packages
npm run build:packages

# Build only Office 365 add-in
npm run build:office

# Build only Adobe CEP panel
npm run build:cep
```

---

## Microsoft Office (Word & PowerPoint)

### Development

1. Start the dev server with HTTPS:
   ```bash
   npm run dev:office
   ```
   This starts Vite on `https://localhost:3000`

2. Accept the self-signed certificate by visiting `https://localhost:3000` in your browser

3. Sideload the add-in:
   ```bash
   cd office-365
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
npm run build:office
```

Output is in `office-365/dist/`.

---

## Adobe After Effects

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
   npm run build:cep
   ```

2. Create a symlink to the extensions folder:

   **macOS:**
   ```bash
   ln -s "$(pwd)/adobe-cep" "$HOME/Library/Application Support/Adobe/CEP/extensions/sh.wendy.syntaxhighlighter.cep"
   ```

   **Windows:**
   ```cmd
   mklink /D "%APPDATA%\Adobe\CEP\extensions\sh.wendy.syntaxhighlighter.cep" "%cd%\adobe-cep"
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

## Adobe Illustrator

The CEP panel is also available in Illustrator. Setup is the same as After Effects - the symlinked extension folder is shared.

### Testing in Illustrator

1. Create a text frame with code
2. Select the text frame
3. Open Window → Extensions → Syntax Highlighter
4. Choose language and theme
5. Click "Highlight Selection"

Note: Illustrator support requires implementing the appropriate ExtendScript in `jsx/host.jsx`.

---

## Adobe Premiere Pro / Photoshop / InDesign

The CEP manifest includes these apps, but ExtendScript implementation is pending. The panel will load but highlighting won't work until `jsx/host.jsx` is extended.

---

## Tech Stack

- **Monorepo:** npm workspaces
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
