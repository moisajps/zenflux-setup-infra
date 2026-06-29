---
description: Roda o checklist de saúde do projeto antes de publicar.
---

Valide o projeto e reporte ✔/✖ para cada item:
1. `npm run build` passa.
2. `npm run lint` passa.
3. Se existir script `test` no `package.json`, `npm run test` passa. (A base não tem
   testes; o add-on de leads adiciona.)
4. Rotas respondem: suba `npm run dev` e cheque a home `/` (HTTP 200) e quaisquer
   páginas que o cliente tenha criado.
5. Se o site usa Supabase (add-on opcional): `.config/.env.local` presente.

Se algo falhar, NÃO recomende publicar — proponha a correção (ou rode `/doctor`).
