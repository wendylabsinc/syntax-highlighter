import InstallInstructions from '@/components/sections/install-instructions';
import MetafiCta from '@/components/sections/matafi-cta';
import MetafiFaq from '@/components/sections/metafi-faq';
import MetafiFeatures from '@/components/sections/metafi-features';
import MetafiHero from '@/components/sections/metafi-hero';

export default function Home() {
  return (
    <>
      <MetafiHero />
      <MetafiFeatures />
      <InstallInstructions />
      <MetafiFaq />
      <MetafiCta />
    </>
  );
}
