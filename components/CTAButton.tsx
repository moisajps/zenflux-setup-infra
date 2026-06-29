import { siteConfig } from "@/content/site.config";

export function CTAButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-block rounded-lg px-6 py-3 font-semibold text-white shadow"
      style={{ backgroundColor: siteConfig.primaryHex }}
    >
      {label}
    </a>
  );
}
