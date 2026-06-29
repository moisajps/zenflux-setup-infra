---
description: Diagnostica e conserta problemas de ambiente (Node, deps, build) e configuração (chaves, Supabase).
---

Aja como suporte técnico do projeto. Em português, diagnostique e, quando seguro,
conserte — confirmando antes de mudanças.

Checagens, nesta ordem (reporte cada uma com ✔/✖):
1. `node --version` e `git --version` respondem? Se não, oriente reabrir o terminal
   ou rodar o `bootstrap/` do SO.
2. `npm install` roda sem erro? Se falhar, leia a saída e corrija (versões, lockfile).
3. `npm run build` passa? Se falhar, leia o erro e proponha a correção mínima.
4. `npm run lint` passa? (e `npm run test`, se existir o script — a base não tem.)
5. Se o site usa Supabase (add-on opcional): `.config/.env.local` existe com
   `NEXT_PUBLIC_SUPABASE_URL` e `_ANON_KEY`? Se faltar, oriente o `/setup`.

Ao final, liste o que estava errado, o que foi corrigido e o que ainda precisa
de ação do usuário. Nunca exponha chaves completas.
