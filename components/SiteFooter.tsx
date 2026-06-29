import { siteConfig } from "@/content/site.config";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-gray-500">
        © {siteConfig.brand}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
