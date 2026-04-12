import Link from 'next/link';

import { Button } from '@/components/ui/button';

const MetafiCta = () => {
  return (
    <section id="cta" className="bg-tagline relative overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:16px_16px] [color:oklch(1_0_89.88)] opacity-30" />
      <div className="bg-tagline pointer-events-none absolute top-0 left-1/2 h-full w-[500px] -translate-x-1/2" />

      <div className="relative container px-0 py-16 text-center sm:py-20 md:px-6 md:py-28">
        <h2 className="text-primary-foreground mx-auto max-w-5xl text-4xl leading-tight font-medium text-balance sm:text-5xl md:text-6xl">
          Beautiful Code in
          <br className="hidden sm:block" /> Every Frame
        </h2>

        <p className="text-primary-foreground/80 mx-auto mt-4 max-w-2xl text-base font-normal sm:text-lg">
          Open source and free to use. Install the panel and start highlighting.
        </p>

        <div className="mt-8 flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            className="bg-primary-foreground text-tagline hover:bg-primary-foreground/90 h-12 w-full rounded-[12px] sm:w-auto"
          >
            <Link
              href="https://github.com/wendylabsinc/syntax-highlighter"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MetafiCta;
