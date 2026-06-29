# zenflux-setup-infra — Plano 3: Bootstrap (Fase 0)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar o cliente do zero (máquina sem nada) até o Claude Code rodando, com **um vídeo + um script por sistema operacional**, sem call — e, principalmente, **falhando de forma legível** quando algo travar.

**Architecture:** Dois scripts idempotentes (`install.ps1` Windows, `install.sh` Mac) que **detectam o que já existe e instalam só o que falta** (muitos clientes já têm o app do Claude). Cada passo é embrulhado: se falhar, imprime mensagem clara + link manual e para. No fim, validam `node`/`git`/`claude`. `LINKS.md` aponta os vídeos que a Moisa grava.

**Tech Stack:** Bash (macOS, Homebrew) · PowerShell (Windows, winget) · instaladores oficiais do Claude Code.

## Global Constraints

- Idempotente: rodar 2x não quebra nada; só instala o que falta.
- **Falha legível obrigatória:** toda etapa que pode falhar imprime `ERRO: <o quê>` + como resolver manualmente, e encerra (não segue meio-quebrado).
- Não instala VSCode (opcional — cliente pode usar o app do Claude). Instala: git, Node LTS, Claude Code (se faltar).
- Idioma das mensagens: pt-BR.
- Não lida com DNS/domínio (fora do produto).

---

### Task 1: Script de bootstrap do macOS

**Files:**
- Create: `bootstrap/install.sh`

**Interfaces:**
- Produces: script que deixa `node`, `git`, `claude` disponíveis no macOS, ou para com erro legível.

- [ ] **Step 1: Criar `bootstrap/install.sh`**

```bash
#!/usr/bin/env bash
# zenflux-setup — Bootstrap macOS. Idempotente e com falha legível.
set -uo pipefail

say()  { printf "\n\033[1;36m%s\033[0m\n" "$1"; }
ok()   { printf "\033[32m✔ %s\033[0m\n" "$1"; }
fail() { printf "\n\033[31m✖ ERRO: %s\033[0m\n→ %s\n" "$1" "$2" >&2; exit 1; }

say "zenflux-setup — preparando seu Mac"

# Homebrew (gerenciador que instala os demais)
if ! command -v brew >/dev/null 2>&1; then
  say "Instalando o Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" \
    || fail "não consegui instalar o Homebrew" "Instale manualmente em https://brew.sh e rode este script de novo."
  # Garante o brew no PATH nesta sessão (Apple Silicon)
  [ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"
else ok "Homebrew já instalado"; fi

# git
if ! command -v git >/dev/null 2>&1; then
  say "Instalando git..."; brew install git || fail "falha ao instalar git" "Instale: https://git-scm.com/download/mac"
else ok "git já instalado"; fi

# Node LTS
if ! command -v node >/dev/null 2>&1; then
  say "Instalando Node.js (LTS)..."; brew install node || fail "falha ao instalar Node" "Baixe o LTS em https://nodejs.org"
else ok "Node já instalado ($(node --version))"; fi

# Claude Code (só se faltar — muitos já têm o app)
if ! command -v claude >/dev/null 2>&1; then
  say "Instalando Claude Code..."; curl -fsSL https://claude.ai/install.sh | bash \
    || fail "falha ao instalar o Claude Code" "Veja https://docs.claude.com/claude-code (ou use o app desktop)."
else ok "Claude Code já instalado"; fi

say "Validando a instalação..."
node  --version >/dev/null 2>&1 || fail "Node não respondeu" "Feche e reabra o Terminal e rode de novo."
git   --version >/dev/null 2>&1 || fail "git não respondeu"  "Feche e reabra o Terminal."
claude --version >/dev/null 2>&1 || fail "Claude Code não respondeu" "Feche e reabra o Terminal (ou abra o app do Claude)."

ok "Node: $(node --version)  |  git: $(git --version | awk '{print $3}')  |  Claude OK"
say "✅ Tudo pronto! Abra a pasta do projeto e rode:  claude"
```

- [ ] **Step 2: Tornar executável e checar sintaxe**

Run: `chmod +x bootstrap/install.sh && bash -n bootstrap/install.sh && echo "sintaxe OK"`
Expected: imprime "sintaxe OK" (sem erro de parse).

- [ ] **Step 3: Lint com shellcheck (se disponível)**

Run: `command -v shellcheck >/dev/null && shellcheck bootstrap/install.sh || echo "shellcheck ausente — pular"`
Expected: sem warnings graves, ou aviso de ausência.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: bootstrap macOS (install.sh) idempotente com falha legível"
```

---

### Task 2: Script de bootstrap do Windows

**Files:**
- Create: `bootstrap/install.ps1`

**Interfaces:**
- Produces: script PowerShell que deixa `node`, `git`, `claude` disponíveis no Windows, ou para com erro legível.

- [ ] **Step 1: Criar `bootstrap/install.ps1`**

```powershell
# zenflux-setup - Bootstrap Windows. Idempotente e com falha legivel.
$ErrorActionPreference = "Stop"

function Say($m){ Write-Host "`n$m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "OK: $m" -ForegroundColor Green }
function Fail($m,$h){ Write-Host "`nERRO: $m" -ForegroundColor Red; Write-Host "-> $h"; exit 1 }
function Have($c){ return [bool](Get-Command $c -ErrorAction SilentlyContinue) }

Say "zenflux-setup - preparando seu Windows"

if (-not (Have "winget")) {
  Fail "winget nao encontrado" "Atualize o 'App Installer' pela Microsoft Store e rode de novo."
}

if (-not (Have "git")) {
  Say "Instalando Git..."
  try { winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements }
  catch { Fail "falha ao instalar git" "Baixe manualmente: https://git-scm.com/download/win" }
} else { Ok "git ja instalado" }

if (-not (Have "node")) {
  Say "Instalando Node.js (LTS)..."
  try { winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements }
  catch { Fail "falha ao instalar Node" "Baixe o LTS: https://nodejs.org" }
} else { Ok "Node ja instalado" }

if (-not (Have "claude")) {
  Say "Instalando Claude Code..."
  try { Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression }
  catch { Fail "falha ao instalar o Claude Code" "Veja https://docs.claude.com/claude-code (ou use o app desktop)." }
} else { Ok "Claude Code ja instalado" }

Say "Validando (se algo falhar, FECHE e REABRA o PowerShell e rode de novo)..."
try {
  node --version | Out-Null
  git --version | Out-Null
  claude --version | Out-Null
} catch {
  Fail "uma das ferramentas nao respondeu" "Feche e reabra o PowerShell e rode o script novamente."
}

Ok "Node, git e Claude prontos."
Say "Tudo pronto! Abra a pasta do projeto e rode:  claude"
```

- [ ] **Step 2: Checar sintaxe PowerShell (se pwsh disponível)**

Run: `command -v pwsh >/dev/null && pwsh -NoProfile -Command "[void][System.Management.Automation.Language.Parser]::ParseFile('bootstrap/install.ps1',[ref]\$null,[ref]\$null); 'sintaxe OK'" || echo "pwsh ausente — validar em máquina Windows"`
Expected: "sintaxe OK" ou aviso de ausência (validar manualmente no Windows do cliente).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Windows (install.ps1) idempotente com falha legível"
```

---

### Task 3: LINKS.md (vídeos da Fase 0)

**Files:**
- Create: `bootstrap/LINKS.md`

**Interfaces:**
- Produces: documento que conecta o cliente ao vídeo certo do seu SO + o comando do script.

- [ ] **Step 1: Criar `bootstrap/LINKS.md`**

```markdown
# Comece por aqui (Fase 0 — preparar a máquina)

Escolha o seu sistema. Assista ao vídeo e rode o comando indicado.

## 🪟 Windows
1. Vídeo (5 min): <COLAR_LINK_DO_VIDEO_WINDOWS>
2. Abra o **PowerShell** e rode, dentro da pasta do projeto:
   ```powershell
   ./bootstrap/install.ps1
   ```

## 🍎 Mac
1. Vídeo (5 min): <COLAR_LINK_DO_VIDEO_MAC>
2. Abra o **Terminal** e rode, dentro da pasta do projeto:
   ```bash
   bash bootstrap/install.sh
   ```

## Deu certo?
Ao final o script mostra "Tudo pronto!". Então rode `claude` na pasta do projeto
(ou abra o app do Claude Code) e siga para o comando **/setup**.

## Travou?
O script para com uma mensagem **ERRO: ...** dizendo o que fazer. Siga o link
manual indicado. Se persistir, mande o print da mensagem para o suporte.
```

- [ ] **Step 2: Marcar pendência dos vídeos (ação da Moisa)**

Os dois `<COLAR_LINK_DO_VIDEO_*>` são preenchidos pela Moisa após gravar. Registrar como pendência de produto (não bloqueia o resto).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: LINKS.md da Fase 0 (vídeos + comando por SO)"
```

## Self-Review (Plano 3 vs spec)
- Cobre: bootstrap Windows + Mac (cliente escolhe), detecção do que já existe, falha legível, validação final, vídeos por SO.
- Não instala VSCode (opcional, coerente com "app do Claude OU VSCode").
- Placeholders de link são ação humana explícita (gravar vídeo), não placeholder de código.
- Verificação honesta: sintaxe checável aqui; execução real exige máquina do SO — marcada como verificação manual.
