import Link from 'next/link';

import { Button } from '@/components/ui/button';

const MetafiHero = () => {
  return (
    <section
      id="hero"
      className="bg-background border-b-border relative overflow-hidden border-b px-6 lg:px-0"
    >
      <div className="relative container px-0 md:px-6">
        <div className="mx-auto grid max-w-4xl gap-6 py-14 text-center sm:py-16 md:gap-8 md:pt-24 md:pb-20">
          <h1 className="text-foreground text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl md:text-[68px]">
            Syntax Highlighting for After Effects
          </h1>
          <p className="text-muted-foreground md:text-md mx-auto max-w-2xl text-base sm:text-lg">
            Turn plain text layers into beautifully colored code. 690+
            languages, 130+ themes, one-click formatting — powered by Shiki.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <Button
              asChild
              className="w-full sm:w-auto"
              aria-label="View on GitHub"
            >
              <Link
                href="https://github.com/wendylabsinc/syntax-highlighter"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto"
              aria-label="See features"
            >
              <Link href="#features">See Features</Link>
            </Button>
          </div>
        </div>

        {/* Code preview block */}
        <div className="mx-auto mb-12 max-w-[700px] overflow-hidden rounded-[16px] border border-white/10 bg-[#0d1117] p-6 font-mono text-sm leading-relaxed shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="inline-block h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="inline-block h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <pre className="overflow-x-auto">
            <code>
              <span className="text-[#ff7b72]">const</span>{' '}
              <span className="text-[#79c0ff]">greet</span>{' '}
              <span className="text-[#c9d1d9]">=</span>{' '}
              <span className="text-[#c9d1d9]">(</span>
              <span className="text-[#ffa657]">name</span>
              <span className="text-[#ff7b72]">:</span>{' '}
              <span className="text-[#79c0ff]">string</span>
              <span className="text-[#c9d1d9]">)</span>{' '}
              <span className="text-[#ff7b72]">{'=>'}</span>{' '}
              <span className="text-[#c9d1d9]">{'{'}</span>
              {'\n'}
              <span className="text-[#c9d1d9]">{'  '}</span>
              <span className="text-[#ff7b72]">return</span>{' '}
              <span className="text-[#a5d6ff]">{`\`Hello, \${`}</span>
              <span className="text-[#c9d1d9]">name</span>
              <span className="text-[#a5d6ff]">{`}!\``}</span>
              <span className="text-[#c9d1d9]">;</span>
              {'\n'}
              <span className="text-[#c9d1d9]">{'}'}</span>
              {'\n\n'}
              <span className="text-[#79c0ff]">console</span>
              <span className="text-[#c9d1d9]">.</span>
              <span className="text-[#d2a8ff]">log</span>
              <span className="text-[#c9d1d9]">(</span>
              <span className="text-[#79c0ff]">greet</span>
              <span className="text-[#c9d1d9]">(</span>
              <span className="text-[#a5d6ff]">&quot;After Effects&quot;</span>
              <span className="text-[#c9d1d9]">));</span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
};

export default MetafiHero;
