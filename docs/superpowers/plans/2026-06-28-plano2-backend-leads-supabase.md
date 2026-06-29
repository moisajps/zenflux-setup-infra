# zenflux-setup-infra — Plano 2: Backend de Leads (Supabase)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o formulário de captura gravar o lead de verdade no Supabase e o `/admin` listar os leads com login e segurança (RLS), sem expor dados a visitantes anônimos.

**Architecture:** O site estático/Next fala direto com o Supabase pelo navegador (sem servidor próprio). A proteção é por **RLS**: anônimo só pode **inserir** lead; só **autenticado** pode **ler**. O cliente Supabase é criado de forma preguiçosa (lazy) para o build seguir verde sem chaves. O `submitLead` do Plano 1 troca o corpo (mesma assinatura) por um insert real; o `/admin` vira client component com login (Supabase Auth) e listagem.

**Tech Stack:** `@supabase/supabase-js` · Supabase (Postgres + Auth + RLS) · Next.js client components.

## Global Constraints

- Mantém pisos do Plano 1 (Next 16.2.9 / React 19.2.4 / Tailwind 4 / TS strict).
- Chave usada no front é a **publishable/anon** (pública por design) — proteção real é RLS.
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` vêm de `.config/.env.local` (gitignored).
- Build **continua verde mesmo sem as chaves** (cliente Supabase lazy; falha amigável só em runtime).
- Nunca commitar `.env`. Idioma: pt-BR.
- Cada task termina com `npm run build`, `npm run lint`, `npm run test` verdes antes do commit.

---

### Task 1: Cliente Supabase (lazy) + dependência

**Files:**
- Create: `lib/supabase.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Produces: `getSupabase(): SupabaseClient` — lança erro amigável "Supabase não configurado. Rode /setup." se faltar env. Usado por `lib/leads.ts` (Task 3) e `/admin` (Task 4).

- [ ] **Step 1: Adicionar dependência em `package.json`**

Em `dependencies`, somar:
```json
"@supabase/supabase-js": "^2"
```

- [ ] **Step 2: `npm install`**

Run: `npm install`
Expected: instala `@supabase/supabase-js` sem erro.

- [ ] **Step 3: Criar `lib/supabase.ts`**

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Lazy: só cria (e só exige env) quando realmente usado, mantendo o build verde
// num template entregue sem chaves. O /setup preenche as variáveis.
export function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase não configurado. Rode /setup.");
  }
  client ??= createClient(url, anon);
  return client;
}
```

- [ ] **Step 4: Validar build/lint**

Run: `npm run build && npm run lint`
Expected: verdes (nenhuma página chama `getSupabase` ainda, então sem env já compila).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cliente Supabase lazy (build verde sem chaves)"
```

---

### Task 2: Migration da tabela `leads` + RLS

**Files:**
- Create: `supabase/migrations/0001_leads.sql`

**Interfaces:**
- Consumes: nada de código.
- Produces: tabela `public.leads(id, name, email, created_at)` com RLS: insert anônimo, select só autenticado. Aplicada no projeto Supabase do cliente (manual aqui; automatizada pelo `/setup` no Plano 4).

- [ ] **Step 1: Criar `supabase/migrations/0001_leads.sql`**

```sql
-- Tabela de leads capturados pelo formulário.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Segurança: sem servidor próprio, quem protege é o RLS.
alter table public.leads enable row level security;

-- Visitante anônimo PODE inserir (mandar o formulário)...
create policy "anon insere leads"
  on public.leads for insert
  to anon
  with check (true);

-- ...mas NÃO pode ler. Só usuário autenticado (admin) lê os leads.
create policy "autenticado le leads"
  on public.leads for select
  to authenticated
  using (true);
```

- [ ] **Step 2: Aplicar no Supabase do cliente (manual / via /setup no futuro)**

Aplicar o SQL no projeto Supabase (SQL Editor do dashboard ou `supabase db push`).
Expected: tabela `leads` criada; em Authentication > Policies aparecem as 2 policies.

- [ ] **Step 3: Verificar RLS (anônimo não lê)**

Com a chave **anon**, tentar `select * from leads` deve voltar **vazio/negado**; `insert` deve funcionar. (Testável no SQL Editor com "Run as: anon" ou via app na Task 3.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: migration da tabela leads com RLS (insert anon, select autenticado)"
```

---

### Task 3: Trocar o stub `submitLead` por insert real (TDD na validação)

**Files:**
- Modify: `lib/leads.ts`
- Modify: `lib/leads.test.ts`

**Interfaces:**
- Consumes: `getSupabase` (Task 1), `isValidEmail` (Plano 1).
- Produces: `submitLead` com **mesma assinatura** do Plano 1, agora inserindo em `leads`. Validação acontece **antes** de tocar no Supabase (testável sem rede).

- [ ] **Step 1: Adicionar testes de validação do `submitLead` (falham antes da mudança de contrato)**

Acrescentar em `lib/leads.test.ts`:
```ts
import { submitLead } from "@/lib/leads";

describe("submitLead — validação (antes da rede)", () => {
  it("rejeita nome vazio sem chamar o banco", async () => {
    const r = await submitLead({ name: "  ", email: "a@b.com" });
    expect(r).toEqual({ ok: false, error: "Informe seu nome." });
  });
  it("rejeita e-mail inválido sem chamar o banco", async () => {
    const r = await submitLead({ name: "Ana", email: "invalido" });
    expect(r).toEqual({ ok: false, error: "E-mail inválido." });
  });
});
```

- [ ] **Step 2: Rodar e confirmar que passam com o stub atual**

Run: `npm run test`
Expected: PASS (o stub do Plano 1 já valida nome/e-mail). Isso fixa o contrato de validação antes de mexer no corpo.

- [ ] **Step 3: Substituir o corpo de `submitLead` em `lib/leads.ts` (mantendo `isValidEmail` intacto)**

```ts
import { getSupabase } from "@/lib/supabase";

export async function submitLead(input: {
  name: string;
  email: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.name.trim()) return { ok: false, error: "Informe seu nome." };
  if (!isValidEmail(input.email)) return { ok: false, error: "E-mail inválido." };
  try {
    const { error } = await getSupabase()
      .from("leads")
      .insert({ name: input.name.trim(), email: input.email.trim() });
    if (error) return { ok: false, error: "Não foi possível enviar. Tente de novo." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Cadastro indisponível no momento." };
  }
}
```

- [ ] **Step 4: Rodar test/build/lint**

Run: `npm run test && npm run build && npm run lint`
Expected: testes de validação seguem verdes; build verde (insert só roda no navegador em runtime).

- [ ] **Step 5: Verificação real (com env preenchido)**

Com `.config/.env.local` preenchido e `npm run dev`: enviar o form em `/captura/` → deve redirecionar pra `/obrigado/` e criar 1 linha em `leads` (conferir no Supabase).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: submitLead grava lead no Supabase (validação testada)"
```

---

### Task 4: Admin com login (Supabase Auth) + listagem de leads

**Files:**
- Create: `components/AdminPanel.tsx`
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `getSupabase` (Task 1).
- Produces: `/admin` funcional — sem sessão mostra login; com sessão lista `leads` (id/nome/e-mail/data). RLS garante que sem login não há leitura.

- [ ] **Step 1: Criar `components/AdminPanel.tsx` (client component)**

```tsx
"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Lead = { id: string; name: string; email: string; created_at: string };

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    getSupabase()
      .auth.getSession()
      .then(({ data }) => setAuthed(!!data.session))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    getSupabase()
      .from("leads")
      .select("id,name,email,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setLeads((data as Lead[]) ?? []));
  }, [authed]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) setError("Login inválido.");
    else setAuthed(true);
  }

  if (!authed) {
    return (
      <form onSubmit={login} className="mx-auto flex max-w-sm flex-col gap-3">
        <input className="rounded border px-4 py-2" type="email" placeholder="E-mail"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="rounded border px-4 py-2" type="password" placeholder="Senha"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded bg-black px-4 py-2 font-semibold text-white">Entrar</button>
      </form>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b">
          <th className="py-2">Nome</th><th>E-mail</th><th>Data</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((l) => (
          <tr key={l.id} className="border-b">
            <td className="py-2">{l.name}</td>
            <td>{l.email}</td>
            <td>{new Date(l.created_at).toLocaleString("pt-BR")}</td>
          </tr>
        ))}
        {leads.length === 0 && (
          <tr><td colSpan={3} className="py-4 text-gray-500">Nenhum lead ainda.</td></tr>
        )}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Substituir `app/admin/page.tsx` pelo painel real**

```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { AdminPanel } from "@/components/AdminPanel";

export default function Admin() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-6 text-2xl font-bold">Admin — Leads</h1>
        <AdminPanel />
      </main>
    </>
  );
}
```

- [ ] **Step 3: Criar usuário admin no Supabase (manual / via /setup futuro)**

Em Authentication > Users > Add user: criar o e-mail/senha do cliente. (No Plano 4 o `/setup` faz isso.)

- [ ] **Step 4: Validar build/lint**

Run: `npm run build && npm run lint`
Expected: verdes.

- [ ] **Step 5: Verificação real (RLS na prática)**

Com env + `npm run dev`: abrir `/admin/` sem login → não mostra leads (RLS nega). Fazer login com o usuário admin → lista os leads. Confirma que anônimo não lê.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: admin de leads com login Supabase Auth + RLS"
```

## Self-Review (Plano 2 vs spec)
- Cobre: form→Supabase (T3), admin com Auth+RLS (T4), policies de segurança (T2), cliente lazy p/ build verde (T1).
- Assinatura `submitLead` preservada do Plano 1 (contrato fixado por teste antes da troca de corpo).
- Sem placeholders; passos manuais (aplicar migration, criar admin) são marcados e migram pro `/setup` no Plano 4.
