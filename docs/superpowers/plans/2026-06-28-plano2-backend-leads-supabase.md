# zenflux-setup-infra — Plano 2 (OPCIONAL): Captura de Leads com Supabase

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> ⚠️ **ADD-ON OPCIONAL — não faz parte da base.** Execute este plano só quando um
> cliente realmente quiser captura de leads (formulário → banco) e uma área para
> ver os cadastros. A base (Plano 1) funciona 100% sem isto. Quando o cliente pedir,
> o Claude pode rodar este plano sobre a base existente.

**Goal:** Adicionar à base, sob demanda, uma página de captura que grava o lead no Supabase e uma área de admin (com login) que lista os leads — com segurança por RLS (anônimo só insere; só logado lê).

**Architecture:** O site fala direto com o Supabase pelo navegador (sem servidor próprio); a proteção é o **RLS**. O cliente Supabase é lazy (build verde sem chaves). A validação do formulário fica isolada em `lib/leads.ts` e é coberta por teste (TDD). Este plano cria tudo o que precisa: client, util, form, páginas e admin.

**Tech Stack:** `@supabase/supabase-js` · Supabase (Postgres + Auth + RLS) · Vitest (validação) · Next.js client components.

## Global Constraints

- Pré-requisito: Plano 1 concluído (scaffold, componentes, `content/site.config.ts`).
- Pisos do Plano 1 (Next 16.2.9 / React 19.2.4 / Tailwind 4 / TS strict).
- Chave usada no front é a **publishable/anon** (pública por design) — proteção real é RLS.
- Env em `.config/.env.local` (gitignored). **Build verde mesmo sem chaves** (client lazy).
- Nunca commitar `.env`. Idioma: pt-BR.
- Cada task termina com `npm run build`, `npm run lint`, `npm run test` verdes antes do commit.

---

### Task 1: Runner de teste + cliente Supabase (lazy)

**Files:**
- Modify: `package.json` (add `@supabase/supabase-js`, `vitest`, script `test`)
- Create: `lib/supabase.ts`

**Interfaces:**
- Produces: `getSupabase(): SupabaseClient` — lança "Supabase não configurado. Rode /setup." se faltar env. Usado por `lib/leads.ts` e admin.

- [ ] **Step 1: Atualizar `package.json`**

Adicionar em `dependencies`: `"@supabase/supabase-js": "^2"`.
Adicionar em `devDependencies`: `"vitest": "^2"`.
Adicionar em `scripts`: `"test": "vitest run"`.

- [ ] **Step 2: `npm install`**

Run: `npm install`
Expected: instala sem erro.

- [ ] **Step 3: Criar `lib/supabase.ts`**

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Lazy: só exige env quando usado, mantendo o build verde sem chaves.
export function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase não configurado. Rode /setup.");
  client ??= createClient(url, anon);
  return client;
}
```

- [ ] **Step 4: Validar build/lint**

Run: `npm run build && npm run lint`
Expected: verdes (nada chama `getSupabase` ainda).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(leads): cliente Supabase lazy + runner de teste"
```

---

### Task 2: Validação + envio do lead (TDD)

**Files:**
- Create: `lib/leads.ts`, `lib/leads.test.ts`

**Interfaces:**
- Consumes: `getSupabase` (Task 1).
- Produces:
  - `isValidEmail(email: string): boolean`
  - `submitLead(input: { name: string; email: string }): Promise<{ ok: boolean; error?: string }>` — valida antes de tocar no banco; insere em `leads`.

- [ ] **Step 1: Escrever o teste que falha (`lib/leads.test.ts`)**

```ts
import { describe, it, expect } from "vitest";
import { isValidEmail, submitLead } from "@/lib/leads";

describe("isValidEmail", () => {
  it("aceita válido", () => expect(isValidEmail("ana@dominio.com.br")).toBe(true));
  it("rejeita sem arroba", () => expect(isValidEmail("anadominio.com")).toBe(false));
  it("rejeita sem domínio", () => expect(isValidEmail("ana@")).toBe(false));
  it("rejeita vazio", () => expect(isValidEmail("")).toBe(false));
});

describe("submitLead — validação antes da rede", () => {
  it("rejeita nome vazio", async () =>
    expect(await submitLead({ name: " ", email: "a@b.com" })).toEqual({
      ok: false, error: "Informe seu nome.",
    }));
  it("rejeita e-mail inválido", async () =>
    expect(await submitLead({ name: "Ana", email: "x" })).toEqual({
      ok: false, error: "E-mail inválido.",
    }));
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm run test`
Expected: FALHA (arquivo `lib/leads.ts` não existe).

- [ ] **Step 3: Implementar `lib/leads.ts`**

```ts
import { getSupabase } from "@/lib/supabase";

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm run test`
Expected: PASS (6 testes).

- [ ] **Step 5: build/lint + commit**

Run: `npm run build && npm run lint`
```bash
git add -A
git commit -m "feat(leads): validação de e-mail e submitLead (TDD)"
```

---

### Task 3: Formulário + páginas de captura e obrigado

**Files:**
- Create: `components/LeadForm.tsx`, `app/captura/page.tsx`, `app/obrigado/page.tsx`

**Interfaces:**
- Consumes: `submitLead` (Task 2), componentes da base (`SiteHeader`, `SiteFooter`, `CTAButton`), `siteConfig`.
- Produces: rotas `/captura/` e `/obrigado/`.

- [ ] **Step 1: Criar `components/LeadForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitLead } from "@/lib/leads";
import { siteConfig } from "@/content/site.config";

export function LeadForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitLead({ name, email });
    setLoading(false);
    if (!res.ok) return setError(res.error ?? "Algo deu errado.");
    router.push(redirectTo);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-md flex-col gap-3">
      <input className="rounded border px-4 py-3" placeholder="Seu nome"
        value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="rounded border px-4 py-3" type="email" placeholder="Seu melhor e-mail"
        value={email} onChange={(e) => setEmail(e.target.value)} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading}
        className="rounded-lg px-6 py-3 font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: siteConfig.primaryHex }}>
        {loading ? "Enviando..." : "Quero receber"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Criar `app/captura/page.tsx`**

```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LeadForm } from "@/components/LeadForm";

export default function Captura() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">Receba o material gratuito</h1>
        <p className="mt-4 text-gray-600">Deixe seu nome e e-mail para começar.</p>
        <div className="mt-8"><LeadForm redirectTo="/obrigado/" /></div>
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 3: Criar `app/obrigado/page.tsx`**

```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CTAButton } from "@/components/CTAButton";
import { siteConfig } from "@/content/site.config";

export default function Obrigado() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Obrigado! 🎉</h1>
        <p className="mt-4 text-gray-600">Recebemos seus dados.</p>
        <div className="mt-8"><CTAButton href={siteConfig.ctaUrl} label="Próximo passo" /></div>
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 4: build/lint/test + smoke**

Run: `npm run build && npm run lint && npm run test`
Run: `npm run dev` (background); `for r in /captura/ /obrigado/; do curl -s -o /dev/null -w "$r %{http_code}\n" http://localhost:3000$r; done`
Expected: tudo verde; `200` nas duas rotas.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(leads): formulário + páginas de captura e obrigado"
```

---

### Task 4: Migration `leads` + RLS

**Files:**
- Create: `supabase/migrations/0001_leads.sql`

**Interfaces:**
- Produces: tabela `public.leads` com RLS (insert anônimo, select só autenticado). Aplicada no Supabase do cliente.

- [ ] **Step 1: Criar `supabase/migrations/0001_leads.sql`**

```sql
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Anônimo pode inserir (mandar o formulário)...
create policy "anon insere leads"
  on public.leads for insert to anon with check (true);

-- ...mas só autenticado (admin) pode ler.
create policy "autenticado le leads"
  on public.leads for select to authenticated using (true);
```

- [ ] **Step 2: Aplicar no Supabase do cliente**

Aplicar via SQL Editor do dashboard (ou `supabase db push`).
Expected: tabela `leads` criada; 2 policies visíveis em Authentication > Policies.

- [ ] **Step 3: Verificar RLS (anônimo não lê)**

Com a chave **anon**: `insert` funciona; `select * from leads` volta vazio/negado.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(leads): migration leads com RLS (insert anon, select autenticado)"
```

---

### Task 5: Admin com login (Supabase Auth) + listagem

**Files:**
- Create: `components/AdminPanel.tsx`, `app/admin/page.tsx`

**Interfaces:**
- Consumes: `getSupabase` (Task 1).
- Produces: `/admin` — sem sessão mostra login; com sessão lista `leads`. RLS garante que anônimo não lê.

- [ ] **Step 1: Criar `components/AdminPanel.tsx`**

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
    getSupabase().auth.getSession()
      .then(({ data }) => setAuthed(!!data.session))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    getSupabase().from("leads").select("id,name,email,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setLeads((data as Lead[]) ?? []));
  }, [authed]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) setError("Login inválido."); else setAuthed(true);
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
      <thead><tr className="border-b"><th className="py-2">Nome</th><th>E-mail</th><th>Data</th></tr></thead>
      <tbody>
        {leads.map((l) => (
          <tr key={l.id} className="border-b">
            <td className="py-2">{l.name}</td><td>{l.email}</td>
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

- [ ] **Step 2: Criar `app/admin/page.tsx`**

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

- [ ] **Step 3: Criar usuário admin no Supabase**

Authentication > Users > Add user: e-mail/senha do cliente.

- [ ] **Step 4: build/lint + commit**

Run: `npm run build && npm run lint`
```bash
git add -A
git commit -m "feat(leads): admin com login Supabase Auth + RLS"
```

- [ ] **Step 5: Verificação real (RLS na prática)**

Com env + `npm run dev`: `/admin/` sem login não mostra leads (RLS nega); após login com o usuário admin, lista os leads. Enviar o form em `/captura/` cria 1 linha.

## Self-Review (Plano 2 vs spec)
- É **add-on opcional** (banner no topo) — coerente com "Supabase é sob demanda".
- Autossuficiente: cria client, util (TDD), form, páginas, migration/RLS e admin sobre a base.
- Sem placeholders; passos manuais (migration, criar admin) marcados (migram pro `/setup`).
- Consistência: `getSupabase` (T1) usado em T2/T5; `submitLead`/`isValidEmail` (T2) usados no form (T3).
