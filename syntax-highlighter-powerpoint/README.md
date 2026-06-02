# Syntax Highlighter for PowerPoint

PowerPoint Office.js task pane that reuses the shared syntax-highlighter panel UI.

## Develop

```bash
npm install
npm run dev:certs
npm run sideload:mac
npm run dev
```

Restart PowerPoint, then open the add-in from `Home > Add-ins > Syntax Highlighter`.

The development manifest points PowerPoint at `https://127.0.0.1:3001/taskpane.html`.
Select text, or select one or more text boxes, choose a language/theme, then click `Format`.

## Build

```bash
npm run build
```

The static task pane output is written to `dist`. For production, host those files over HTTPS and update `manifest.xml` URLs away from `localhost`.
