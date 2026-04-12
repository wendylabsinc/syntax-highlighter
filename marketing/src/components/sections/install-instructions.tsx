import { Download, FolderOpen, RefreshCw, Terminal } from 'lucide-react';

const STEPS = [
  {
    icon: Download,
    title: 'Download the extension',
    description: (
      <>
        Grab{' '}
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
          Syntax-Highlighter_0.0.1.zip
        </code>{' '}
        from the{' '}
        <a
          href="https://github.com/wendylabsinc/syntax-highlighter/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="text-tagline underline underline-offset-2"
        >
          latest GitHub release
        </a>
        . Unzip it — you&apos;ll get a{' '}
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">cep/</code>{' '}
        folder.
      </>
    ),
  },
  {
    icon: FolderOpen,
    title: 'Copy to your extensions folder',
    description: (
      <>
        Rename{' '}
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">cep/</code> to{' '}
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
          sh.wendy.syntax-highlighter
        </code>{' '}
        and move it to:
        <span className="mt-2 block space-y-1 text-sm">
          <span className="block">
            <strong>macOS:</strong>{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              ~/Library/Application Support/Adobe/CEP/extensions/
            </code>
          </span>
          <span className="block">
            <strong>Windows:</strong>{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              %APPDATA%\Adobe\CEP\extensions\
            </code>
          </span>
        </span>
      </>
    ),
  },
  {
    icon: Terminal,
    title: 'Enable unsigned extensions (one-time)',
    description: (
      <>
        <span className="block space-y-1 text-sm">
          <span className="block">
            <strong>macOS:</strong>
          </span>
          <code className="bg-muted block rounded px-2 py-1.5 text-xs">
            defaults write com.adobe.CSXS.12 PlayerDebugMode 1
          </code>
          <span className="mt-2 block">
            <strong>Windows:</strong> Add a string value{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              PlayerDebugMode = 1
            </code>{' '}
            to{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              HKCU\Software\Adobe\CSXS.12
            </code>
          </span>
        </span>
      </>
    ),
  },
  {
    icon: RefreshCw,
    title: 'Restart and open',
    description: (
      <>
        Restart After Effects or Illustrator, then go to{' '}
        <strong>Window → Extensions → Syntax Highlighter</strong>. Select text
        layers, pick a language and theme, and click <strong>Format</strong>.
      </>
    ),
  },
];

const InstallInstructions = () => {
  return (
    <section id="install" className="bg-background px-6 lg:px-0">
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-28">
        <p className="text-tagline mb-4 text-center text-sm sm:text-base">
          Installation
        </p>

        <h2 className="text-foreground mx-auto max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl md:text-5xl">
          Up and Running in Minutes
        </h2>

        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg">
          Works with After Effects 2024+ and Illustrator 2022+. No account, no
          license key — just download, copy, and go.
        </p>

        <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:mt-14">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-5">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="bg-tagline/10 text-tagline flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="border-border mt-2 flex-1 border-l" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-foreground text-lg font-medium">
                    <span className="text-tagline mr-2">{i + 1}.</span>
                    {step.title}
                  </h3>
                  <div className="text-muted-foreground mt-1.5 text-sm leading-relaxed sm:text-base">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InstallInstructions;
