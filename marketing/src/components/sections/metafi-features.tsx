import type { LucideIcon } from 'lucide-react';
import { Code, Languages, Palette, Zap } from 'lucide-react';

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const FEATURES: Feature[] = [
  {
    title: '690+ Languages',
    description:
      "From TypeScript and Python to Swift, Rust, Go, and beyond — every language you work with is supported out of the box via Shiki's full grammar bundle.",
    icon: Languages,
  },
  {
    title: '130+ Themes',
    description:
      "GitHub Dark, Dracula, One Dark Pro, Catppuccin, Nord, and many more. Pick the theme that matches your video's look and feel.",
    icon: Palette,
  },
  {
    title: 'Character-Level Coloring',
    description:
      "Uses After Effects' TextDocument.characterRange() API to apply precise per-token fill colors — no workarounds, no hacks.",
    icon: Code,
  },
  {
    title: 'One-Click Formatting',
    description:
      'Select your text layers, pick a language and theme, hit Format. The entire operation is wrapped in a single undo group.',
    icon: Zap,
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="bg-card border-border relative flex flex-col rounded-[16px] border p-6 text-left shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]">
      <div className="bg-tagline/10 text-tagline mb-4 flex size-10 items-center justify-center rounded-lg">
        <Icon className="size-5" />
      </div>
      <h3 className="text-foreground text-lg font-medium sm:text-xl">
        {feature.title}
      </h3>
      <p className="text-muted-foreground mt-2 text-sm sm:text-base">
        {feature.description}
      </p>
    </div>
  );
}

const MetafiFeatures = () => {
  return (
    <section id="features" className="bg-background px-6 lg:px-0">
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-28">
        <p className="text-tagline mb-4 text-center text-sm sm:text-base">
          Features
        </p>

        <h2 className="text-foreground mx-auto max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl md:text-5xl">
          Everything You Need to
          <br className="hidden sm:block" /> Highlight Code in AE
        </h2>

        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg">
          A CEP panel that brings real syntax highlighting to After Effects text
          layers. Select, configure, format — done.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-14 md:grid-cols-2 md:gap-8">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetafiFeatures;
