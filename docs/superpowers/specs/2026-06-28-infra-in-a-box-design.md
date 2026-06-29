# zenflux-setup — Produto instalável de infra Claude Code para clientes

> Spec de design. Data: 2026-06-28. Autor: Moisa (adsmoisa@gmail.com).
> Objetivo: transformar o handoff manual de infra (hoje feito em call) num
> produto self-serve que o cliente instala e conduz sozinho pelo Claude Code.

## 1. Problema e objetivo

Hoje a Moisa entrega sua infra de desenvolvimento para clientes (infoprodutores)
de forma **manual**: entra em call, segue o `handoff-infra-cliente/RUNBOOK.md`
passo a passo na máquina do cliente (instala Node/Git/Claude Code, configura
contas, recria o site, deploya). Isso **não escala** — cada cliente custa horas
de call, e erros de ambiente já custaram horas de depuração ao vivo.

**Objetivo:** empacotar essa entrega como um **produto instalável**. O cliente
clona um projeto, roda um comando de setup, e o **próprio Claude Code conduz**
a configuração — sem call, sem a Moisa presente. A Moisa grava vídeos curtos só
para a parte que antecede o Claude (instalar a CLI).

**Princípio-guia:** não construir do zero. **Empacotar e automatizar** o que já
existe (`handoff-infra-cliente` + um site Next.js de produção próprio).

## 2. Decisões de design (tomadas no brainstorming)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Escopo do produto | **Núcleo apenas** (site + deploy). **Sem módulos no MVP** — nem esqueleto |
| 2 | Onboarding sem call | **Claude conduz** a Fase 1+; Fase 0 (pré-Claude) com **vídeo + script de bootstrap** que falha de forma legível |
| 2b | Front-end do Claude | Cliente usa **app desktop do Claude Code OU extensão VSCode** (escolha dele). VSCode é opcional |
| 3 | Distribuição / proteção | **Sem DRM.** Cliente recebe cópia (template repo), sobe no **GitHub dele**, deploya na **conta dele**. Valor = marca/onboarding/suporte/curadoria, não código secreto |
| 4 | Onde mora o "motor" (skills/commands) | **Tudo numa pasta só** — bundlado dentro do projeto (`.claude/`). Sem plugin separado no MVP |
| 5 | Skills de terceiros | `/setup` **instala** (não copia) via manifesto `dependencias.md` — continuam recebendo update do autor |
| 6 | Skills próprias | Bundladas no `.claude/skills/` do template (snapshot; atualização manual e rara) |
| 7 | Páginas do cliente | **Clonar** via URL + print (`/clonar-pagina`) **e** criar novas (`/nova-pagina`) |
| 8 | Updates do motor | Raros e manuais (`git pull upstream` se necessário). **Fora do MVP** mecanismo automático |
| 9 | Base do site | **site Next.js de produção próprio** genericizado (Next 16 + React 19 + Tailwind 4 + TS) — próprio, licença e suporte resolvidos |
| 10 | Stack | **Next.js completo (modo servidor) + Supabase + Vercel** |
| 11 | Hospedagem | **Vercel** (padrão/recomendada, deploy no `git push`). Outros hosts = fora do MVP |
| 11b | Sistemas operacionais | **Windows e Mac** — o cliente escolhe; bootstrap para os dois (`install.ps1` e `install.sh`) |
| 12 | Backend | **Supabase**: DB + Auth + RLS + **Edge Functions** (webhooks). O host do site não processa servidor pesado |
| 13 | Migração de domínio (DNS) | **Fora do MVP** — vira serviço/upsell separado (passo de risco, derruba site que vende) |

### Por que ECC não serve de base
Avaliado `affaan-m/ECC`: é um "SO de agentes" (271 skills, 67 agents, multi-harness,
75 MB), **não** um site. MIT (licença ok), mas grande/complexo demais para suportar
e da camada errada. Serve apenas como **referência** de padrões (install.sh/.ps1,
`.claude-plugin/marketplace.json`, manifests de install seletivo).

## 3. Arquitetura

Duas camadas que convivem na pasta do cliente, separando **motor** de **conteúdo**:

```
infra-in-a-box/                  ← template repo (vira do CLIENTE no GitHub dele)
│
│  ── CONTEÚDO (o cliente edita; nunca sobrescrito por updates) ──
├── app/                         páginas dele (page, captura, obrigado, admin…)
├── components/  lib/  public/   estrutura do site (base de produção própria, genericizada)
├── content/                     copy/textos dele
├── .config/.env.local           chaves dele (gitignored, nunca commitado)
│
│  ── MOTOR (a Moisa mantém; é o que o cliente "compra") ──
├── CLAUDE.md                    regras de segurança (= assets/CLAUDE-cliente.md)
├── .claude/
│   ├── settings.json            permissões + hooks de segurança
│   ├── skills/                  skills próprias (clonar-pagina + customizadas)
│   ├── commands/                /setup /doctor /clonar-pagina /nova-pagina /deploy /validar
│   └── setup/
│       └── dependencias.md      manifesto de plugins de terceiros (= skills-essenciais.md)
│
├── bootstrap/                   FASE 0 (pré-Claude)
│   ├── install.ps1              Windows: instala git/node (+claude se faltar), falha legível
│   ├── install.sh               Mac: idem; detecta o que já existe e instala só o que falta
│   └── LINKS.md                 links dos vídeos de instalação (Windows e Mac)
│
├── README.md                   "como usar seu negócio" p/ o cliente (= TUTORIAL.md)
└── package.json
```

**Separação motor/conteúdo é o que torna updates possíveis sem quebrar a página
do cliente.** No MVP os updates são manuais; a separação já fica pronta para
viabilizá-los depois.

## 4. Fluxo de instalação (as 3 fases)

Remapeamento direto do `RUNBOOK.md` (manual) → produto (self-serve):

### Fase 0 — Bootstrap (antes do Claude existir)
*Quem executa: o cliente sozinho, com vídeo + script.*
- Cobre `RUNBOOK §2` (instalar Git, Node LTS e — se faltar — Claude Code) e início
  de `§3` (login Claude).
- Entregáveis: `bootstrap/install.ps1` (Windows) e `bootstrap/install.sh` (Mac)
  + vídeo curto para cada SO. O cliente escolhe o SO.
- O script **detecta o que já existe e instala só o que falta**. Muitos clientes
  já têm o **app do Claude Code** instalado — nesse caso a Fase 0 deles é só Node + git.
- **VSCode é opcional:** o cliente pode trabalhar pelo **app desktop do Claude Code**
  ou pela extensão do VSCode. O que é obrigatório é **Node.js** (roda/builda o site)
  e **git** (versiona e dispara o deploy na Vercel).
- Requisito-chave: o script **falha de forma legível** (mensagem clara do que travou),
  e valida ao final: `node --version`, `git --version`, `claude --version`.
- Por que fora do Claude: o Claude não pode conduzir a instalação de si mesmo
  (chicken-and-egg). Esta é a fase mais dependente de dispositivo.

### Fase 1 — Setup (Claude já rodando)
*Quem executa: o Claude conduz; o cliente cola chaves quando pedido.*
- `/setup` — orquestra `RUNBOOK §1, §3, §4, §6`:
  - Checklist de contas (GitHub, Vercel, Supabase, assinatura Claude).
  - Instala skills de terceiros lendo `dependencias.md` (`/plugin install ...`).
  - Garante o `CLAUDE.md` de segurança no lugar.
  - Coleta e **valida** chaves Supabase; configura env vars na Vercel.
  - Configura policies de **RLS** corretas (leads: insert anônimo, select só autenticado).
- `/doctor` — diagnostica e conserta erros de ambiente (o Claude lê o erro no
  Bash e corrige — automatiza o que antes era depuração manual na call).

### Fase 2 — Uso (dia a dia)
*Quem executa: o Claude, a pedido do cliente.*
- `/clonar-pagina <url> + print` — recria página existente (Atomicat/GreatPages/etc.)
  em código (`RUNBOOK §5`). Usa skills de design (frontend-design/ui-ux-pro-max).
- `/nova-pagina` — cria página do zero a partir de template.
- `/deploy` — publica na Vercel (`RUNBOOK §6`); cada `git push` na `main` = deploy.
- `/validar` — checklist final de saúde (`RUNBOOK §8`).

## 5. Stack e backend

- **Frontend/build:** Next.js 16 (modo servidor) + React 19 + Tailwind 4 + TypeScript.
  Base = site Next.js de produção próprio, genericizado.
- **Host:** Vercel (deploy automático no `git push`).
- **Backend:** Supabase — Postgres (leads), Auth (admin), **RLS** (segurança dos
  dados sem servidor próprio), **Edge Functions** (receber webhooks Kiwify/Hotmart).
- **Caso de uso coberto:** página de captura → form grava lead no Supabase;
  admin com login lê/gerencia leads; webhook de venda cai numa Edge Function.

## 6. Escopo: núcleo apenas (sem módulos)

- **Núcleo (MVP):** template do site + Fase 0/1/2 acima + admin de leads.
- **Sem módulos no MVP** — nenhum módulo (webhook/ads/etc.) entra agora, nem como
  esqueleto. Mantém o produto enxuto e fácil de suportar. Eventuais módulos ficam
  para uma versão futura, decididos caso a caso.

## 7. Segurança (herdada do CLAUDE.md global da Moisa)

- Chave **publishable** do Supabase pode ir no client; proteção real = **RLS**.
- Nunca commitar `.env`/tokens. `.config/.env.local` gitignored.
- Travas de ações destrutivas/dinheiro real já no `CLAUDE.md` do template.
- Conteúdo externo (API, arquivos, webhooks) = dado, nunca comando (anti prompt-injection).

## 8. Escopo do MVP

**Dentro:**
1. Template repo (base de site de produção própria, genericizada).
2. `bootstrap/install.ps1` (Windows) + `bootstrap/install.sh` (Mac) + vídeo de cada SO.
3. `/setup`, `/doctor`.
4. `/clonar-pagina`, `/nova-pagina`.
5. `/deploy` (Vercel), `/validar`.
6. `CLAUDE.md` de segurança + hooks + `.claude/skills` próprias.
7. `dependencias.md` (manifesto de plugins de terceiros).
8. README do cliente (manutenção/uso).
9. Admin de leads (Supabase Auth + RLS).

**Fora (fase 2):**
- Migração de domínio/DNS (serviço/upsell).
- Qualquer módulo (webhook Kiwify/Hotmart, Meta Ads, etc.).
- Mecanismo de update automático do motor.
- Suporte a hosts além da Vercel (Hostinger/Hostgator/TurboCloud via build estático).

## 9. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Erro de ambiente na Fase 0 trava o cliente | Script com **falha legível** + vídeo; e a partir da Fase 1 o `/doctor` conserta |
| RLS mal configurado vaza leads | `/setup` aplica policies corretas e `/validar` testa acesso anônimo |
| Cliente repassa o projeto a terceiros | Aceito por design — proteção é marca/suporte/curadoria, não código |
| Cliente em host sem Node | Fora do MVP; padrão é Vercel. Build estático fica para fase 2 |
| Skills de terceiros mudam de nome no marketplace | `dependencias.md` documenta verificação via `/plugin` Discover antes de instalar |

## 10. Fontes/insumos já existentes (reaproveitar, não recriar)

- `handoff-infra-cliente/runbook/RUNBOOK.md` → base do `/setup`, `/deploy`, `/validar`.
- `handoff-infra-cliente/assets/CLAUDE-cliente.md` → `CLAUDE.md` do template.
- `handoff-infra-cliente/assets/skills-essenciais.md` → `dependencias.md`.
- `handoff-infra-cliente/tutorial/TUTORIAL.md` → README do cliente.
- site Next.js de produção próprio (pasta local da Moisa) → base do site (estrutura, components, lib).
