import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { siteConfig } from "@/content/site.config";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero
          title={siteConfig.brand}
          subtitle={siteConfig.description}
          ctaHref={siteConfig.ctaUrl}
          ctaLabel="Saiba mais"
        />
        <Section title="Esta é a sua base">
          Edite esta página ou peça ao Claude para criar novas (ex.:
          &quot;crie uma página de captura&quot;). Tudo da sua marca está em
          <code> content/site.config.ts</code>.
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
