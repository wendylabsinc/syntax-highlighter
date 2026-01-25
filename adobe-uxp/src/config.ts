// Types
export interface ThemeConfig {
  id: string;
  name: string;
  type: 'dark' | 'light';
}

export interface LanguageConfig {
  id: string;
  name: string;
}

export interface Settings {
  language: string;
  theme: string;
}

// ShikiJS Themes - All bundled themes
export const THEMES: ThemeConfig[] = [
  { id: 'andromeeda', name: 'Andromeeda', type: 'dark' },
  { id: 'aurora-x', name: 'Aurora X', type: 'dark' },
  { id: 'ayu-dark', name: 'Ayu Dark', type: 'dark' },
  { id: 'catppuccin-frappe', name: 'Catppuccin Frappé', type: 'dark' },
  { id: 'catppuccin-latte', name: 'Catppuccin Latte', type: 'light' },
  { id: 'catppuccin-macchiato', name: 'Catppuccin Macchiato', type: 'dark' },
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', type: 'dark' },
  { id: 'dark-plus', name: 'Dark+', type: 'dark' },
  { id: 'dracula', name: 'Dracula', type: 'dark' },
  { id: 'dracula-soft', name: 'Dracula Soft', type: 'dark' },
  { id: 'everforest-dark', name: 'Everforest Dark', type: 'dark' },
  { id: 'everforest-light', name: 'Everforest Light', type: 'light' },
  { id: 'github-dark', name: 'GitHub Dark', type: 'dark' },
  { id: 'github-dark-default', name: 'GitHub Dark Default', type: 'dark' },
  { id: 'github-dark-dimmed', name: 'GitHub Dark Dimmed', type: 'dark' },
  { id: 'github-dark-high-contrast', name: 'GitHub Dark High Contrast', type: 'dark' },
  { id: 'github-light', name: 'GitHub Light', type: 'light' },
  { id: 'github-light-default', name: 'GitHub Light Default', type: 'light' },
  { id: 'github-light-high-contrast', name: 'GitHub Light High Contrast', type: 'light' },
  { id: 'gruvbox-dark-hard', name: 'Gruvbox Dark Hard', type: 'dark' },
  { id: 'gruvbox-dark-medium', name: 'Gruvbox Dark Medium', type: 'dark' },
  { id: 'gruvbox-dark-soft', name: 'Gruvbox Dark Soft', type: 'dark' },
  { id: 'gruvbox-light-hard', name: 'Gruvbox Light Hard', type: 'light' },
  { id: 'gruvbox-light-medium', name: 'Gruvbox Light Medium', type: 'light' },
  { id: 'gruvbox-light-soft', name: 'Gruvbox Light Soft', type: 'light' },
  { id: 'houston', name: 'Houston', type: 'dark' },
  { id: 'kanagawa-dragon', name: 'Kanagawa Dragon', type: 'dark' },
  { id: 'kanagawa-lotus', name: 'Kanagawa Lotus', type: 'light' },
  { id: 'kanagawa-wave', name: 'Kanagawa Wave', type: 'dark' },
  { id: 'laserwave', name: 'Laserwave', type: 'dark' },
  { id: 'light-plus', name: 'Light+', type: 'light' },
  { id: 'material-theme', name: 'Material Theme', type: 'dark' },
  { id: 'material-theme-darker', name: 'Material Theme Darker', type: 'dark' },
  { id: 'material-theme-lighter', name: 'Material Theme Lighter', type: 'light' },
  { id: 'material-theme-ocean', name: 'Material Theme Ocean', type: 'dark' },
  { id: 'material-theme-palenight', name: 'Material Theme Palenight', type: 'dark' },
  { id: 'min-dark', name: 'Min Dark', type: 'dark' },
  { id: 'min-light', name: 'Min Light', type: 'light' },
  { id: 'monokai', name: 'Monokai', type: 'dark' },
  { id: 'night-owl', name: 'Night Owl', type: 'dark' },
  { id: 'nord', name: 'Nord', type: 'dark' },
  { id: 'one-dark-pro', name: 'One Dark Pro', type: 'dark' },
  { id: 'one-light', name: 'One Light', type: 'light' },
  { id: 'plastic', name: 'Plastic', type: 'dark' },
  { id: 'poimandres', name: 'Poimandres', type: 'dark' },
  { id: 'red', name: 'Red', type: 'dark' },
  { id: 'rose-pine', name: 'Rosé Pine', type: 'dark' },
  { id: 'rose-pine-dawn', name: 'Rosé Pine Dawn', type: 'light' },
  { id: 'rose-pine-moon', name: 'Rosé Pine Moon', type: 'dark' },
  { id: 'slack-dark', name: 'Slack Dark', type: 'dark' },
  { id: 'slack-ochin', name: 'Slack Ochin', type: 'light' },
  { id: 'snazzy-light', name: 'Snazzy Light', type: 'light' },
  { id: 'solarized-dark', name: 'Solarized Dark', type: 'dark' },
  { id: 'solarized-light', name: 'Solarized Light', type: 'light' },
  { id: 'synthwave-84', name: 'Synthwave 84', type: 'dark' },
  { id: 'tokyo-night', name: 'Tokyo Night', type: 'dark' },
  { id: 'vesper', name: 'Vesper', type: 'dark' },
  { id: 'vitesse-black', name: 'Vitesse Black', type: 'dark' },
  { id: 'vitesse-dark', name: 'Vitesse Dark', type: 'dark' },
  { id: 'vitesse-light', name: 'Vitesse Light', type: 'light' },
];

// Popular languages for the dropdown (sorted by popularity)
export const POPULAR_LANGUAGES: LanguageConfig[] = [
  { id: 'auto', name: 'Auto Detect' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'csharp', name: 'C#' },
  { id: 'cpp', name: 'C++' },
  { id: 'c', name: 'C' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'php', name: 'PHP' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'scss', name: 'SCSS' },
  { id: 'json', name: 'JSON' },
  { id: 'yaml', name: 'YAML' },
  { id: 'xml', name: 'XML' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'sql', name: 'SQL' },
  { id: 'shellscript', name: 'Bash/Shell' },
  { id: 'powershell', name: 'PowerShell' },
  { id: 'dockerfile', name: 'Dockerfile' },
  { id: 'graphql', name: 'GraphQL' },
  { id: 'jsx', name: 'JSX' },
  { id: 'tsx', name: 'TSX' },
  { id: 'vue', name: 'Vue' },
  { id: 'svelte', name: 'Svelte' },
  { id: 'dart', name: 'Dart' },
  { id: 'scala', name: 'Scala' },
  { id: 'haskell', name: 'Haskell' },
  { id: 'elixir', name: 'Elixir' },
  { id: 'clojure', name: 'Clojure' },
  { id: 'lua', name: 'Lua' },
  { id: 'r', name: 'R' },
  { id: 'matlab', name: 'MATLAB' },
  { id: 'perl', name: 'Perl' },
  { id: 'toml', name: 'TOML' },
  { id: 'ini', name: 'INI' },
  { id: 'diff', name: 'Diff' },
  { id: 'regex', name: 'Regex' },
  { id: 'terraform', name: 'Terraform' },
  { id: 'nginx', name: 'Nginx' },
  { id: 'proto', name: 'Protocol Buffers' },
  { id: 'solidity', name: 'Solidity' },
  { id: 'zig', name: 'Zig' },
  { id: 'text', name: 'Plain Text' },
];

// Default settings
export const DEFAULTS: Settings = {
  language: 'auto',
  theme: 'github-dark',
};

// Storage keys
export const STORAGE_KEYS = {
  language: 'syntaxHighlighter_language',
  theme: 'syntaxHighlighter_theme',
} as const;
