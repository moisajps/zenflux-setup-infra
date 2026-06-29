import { CTAButton } from "@/components/CTAButton";

export function Hero({
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mt-6 text-lg text-gray-600">{subtitle}</p>
      <div className="mt-8">
        <CTAButton href={ctaHref} label={ctaLabel} />
      </div>
    </section>
  );
}
