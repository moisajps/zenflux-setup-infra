// ÚNICO arquivo que o cliente edita para personalizar a marca.
export type SiteConfig = {
  brand: string;
  domain: string;       // ex.: "https://meunegocio.com.br"
  description: string;
  primaryHex: string;   // cor principal, ex.: "#16a34a"
  ctaUrl: string;       // link do botão principal (checkout, WhatsApp, etc.)
};

export const siteConfig: SiteConfig = {
  brand: "Meu Negócio",
  domain: "https://exemplo.com.br",
  description: "Descreva aqui a sua oferta em uma frase.",
  primaryHex: "#16a34a",
  ctaUrl: "https://wa.me/5500000000000",
};
