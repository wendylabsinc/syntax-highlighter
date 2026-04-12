import { Github } from 'lucide-react';
import Link from 'next/link';

const links = [
  { name: 'Features', href: '/#features' },
  { name: 'FAQ', href: '/#faq' },
  {
    name: 'GitHub',
    href: 'https://github.com/wendylabsinc/syntax-highlighter',
    external: true,
  },
];

export const Footer = () => {
  return (
    <footer className="force-light-vars bg-primary text-primary-foreground px-2.5 lg:px-0">
      <div className="container py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="md:min-w-[140px]">
            <Link href="/" aria-label="Syntax Highlighter">
              <span className="text-xl font-bold tracking-tight text-white">
                Syntax Highlighter
              </span>
            </Link>
          </div>

          <ul className="flex flex-wrap gap-6">
            {links.map((l) => (
              <li key={l.name}>
                <Link
                  href={l.href}
                  {...(l.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="text-primary-foreground/90 hover:text-primary-foreground text-sm font-normal transition-colors"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border/40 mt-12 border-t" />

        <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-muted-foreground text-sm font-normal">
            © {new Date().getFullYear()} Wendy Labs. All rights reserved.
          </p>

          <Link
            href="https://github.com/wendylabsinc/syntax-highlighter"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-primary-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
};
