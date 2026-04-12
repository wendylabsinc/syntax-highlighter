'use client';

import { Minus, Plus } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

type QA = { question: string; answer: string };

const FAQS: QA[] = [
  {
    question: 'Which Adobe apps are supported?',
    answer:
      'The plugin is built as a CEP panel and currently targets Adobe After Effects 2024 and later (version 24+). The panel will appear in other Adobe hosts (Premiere Pro, Photoshop, Illustrator) but the character-range coloring API is After Effects–specific.',
  },
  {
    question: 'How does the syntax highlighting work?',
    answer:
      "When you click Format, the panel reads the source text from each selected text layer, tokenizes it with Shiki (the same engine that powers VS Code's syntax highlighting), converts each token's color to After Effects' 0–1 RGB format, then applies per-character fill colors via the TextDocument.characterRange() API.",
  },
  {
    question: 'Do I need an internet connection?',
    answer:
      'No. All 690+ language grammars and 130+ themes are bundled locally inside the panel. Once installed, highlighting works fully offline.',
  },
  {
    question: 'Can I undo the formatting?',
    answer:
      'Yes. Every Format operation is wrapped in a single After Effects undo group, so a single Cmd+Z (or Ctrl+Z) reverts all character-range changes at once.',
  },
  {
    question: 'Does it handle multi-line code?',
    answer:
      "Yes. After Effects text layers use carriage returns (\\r) for line breaks. The panel normalizes these to newlines before tokenizing so Shiki's TextMate grammars parse the code correctly. Offsets map 1:1 back to the original text.",
  },
];

function FaqItem({
  id,
  qa,
  open,
  onToggle,
}: {
  id: string;
  qa: QA;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  const regionId = `${id}-region`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>(open ? 'auto' : 0);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      const h = contentRef.current.scrollHeight;
      setHeight(h);
    } else {
      const current = wrapperRef.current?.offsetHeight ?? 0;
      setHeight(current);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open, qa.answer]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onEnd = () => {
      if (open) setHeight('auto');
    };
    el.addEventListener('transitionend', onEnd);
    return () => el.removeEventListener('transitionend', onEnd);
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (!contentRef.current) return;
      if (open) {
        const h = contentRef.current.scrollHeight;
        if (height !== 'auto') setHeight(h);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, height]);

  return (
    <div
      className={[
        'bg-card rounded-[16px] border px-4 py-2 sm:px-6 sm:py-4',
        'border-border shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]',
      ].join(' ')}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => onToggle(id)}
        className={[
          'group flex w-full items-center justify-between gap-4 text-left',
          'text-foreground text-xl leading-tight font-medium sm:text-2xl',
          'hover:no-underline',
          'py-1 sm:py-2',
        ].join(' ')}
      >
        <span className="pr-2">{qa.question}</span>
        <span
          className={[
            'flex size-6 shrink-0 items-center justify-center rounded-[6px] border',
            open
              ? 'border-tagline bg-tagline/10 text-tagline'
              : 'border-border text-muted-foreground',
          ].join(' ')}
          aria-hidden
        >
          {open ? (
            <Minus className="size-3" strokeWidth={2} />
          ) : (
            <Plus className="size-3" strokeWidth={2} />
          )}
        </span>
      </button>

      <div
        id={regionId}
        role="region"
        aria-hidden={!open}
        ref={wrapperRef}
        style={{ height, transition: 'height 200ms ease' }}
        className="overflow-hidden"
      >
        <div
          ref={contentRef}
          className="text-muted-foreground mt-2 text-sm font-normal whitespace-pre-wrap sm:text-base"
        >
          {qa.answer}
        </div>
      </div>
    </div>
  );
}

export default function MetafiFaq() {
  const [value, setValue] = useState<string | undefined>(undefined);
  const handleToggle = (id: string) =>
    setValue((curr) => (curr === id ? undefined : id));

  return (
    <section id="faq" className="bg-background px-6 lg:px-0">
      <div className="container px-0 py-16 sm:py-20 md:px-6 lg:py-28">
        <p className="text-tagline mb-4 text-center text-sm leading-tight font-normal sm:text-base">
          FAQ
        </p>

        <h2 className="text-foreground mx-auto mb-4 max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h2>

        <p className="text-muted-foreground mx-auto max-w-2xl text-center text-base font-normal sm:text-lg">
          Common questions about installing and using the Syntax Highlighter
          panel in After Effects.
        </p>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:mt-14">
          {FAQS.map((qa, i) => {
            const id = `item-${i + 1}`;
            const open = value === id;
            return (
              <FaqItem
                key={id}
                id={id}
                qa={qa}
                open={open}
                onToggle={handleToggle}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
