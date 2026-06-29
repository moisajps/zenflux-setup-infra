import { siteConfig } from "@/content/site.config";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold">{siteConfig.brand}</span>
      </div>
    </header>
  );
}
