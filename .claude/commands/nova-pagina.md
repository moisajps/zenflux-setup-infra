---
description: Cria uma página nova do zero a partir dos componentes do projeto.
argument-hint: <descrição da página>
---

Crie uma página nova no projeto a partir desta descrição: $ARGUMENTS

Diretrizes:
- Crie a rota em `app/<slug>/page.tsx` (slug curto e claro).
- Reuse os componentes da base: `SiteHeader`, `SiteFooter`, `Hero`, `CTAButton`,
  `Section`. (`LeadForm` só se o add-on de captura de leads existir.)
- Marca/cores/links globais vêm de `content/site.config.ts`.
- Acione skills de design (frontend-design / ui-ux-pro-max) para o visual.
- Rode `npm run dev` para o usuário ver e itere. Valide com `/validar`.
