# iniciar.ps1 — Ponto de partida (Windows).
# Verifica o ambiente e abre o Claude JA conduzindo a configuracao do site.
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "============================================================"
Write-Host " zenflux - vamos colocar seu site no ar"
Write-Host "============================================================"

# 1. Node e obrigatorio
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host ""
  Write-Host "X Node.js nao esta instalado - ele e necessario." -ForegroundColor Red
  Write-Host "  Veja como instalar em: docs/prerequisitos.md"
  Write-Host "  (no Windows, normalmente: winget install OpenJS.NodeJS.LTS)"
  Write-Host ""
  exit 1
}

# 2. Checa pre-requisitos (mostra o que falta, por SO)
node setup/check.mjs
if ($LASTEXITCODE -ne 0) { exit 1 }

# 3. Abre o Claude ja disparando a primeira acao (setup na 1a vez)
Write-Host ""
Write-Host "Abrindo o Claude para configurar seu site..."
Write-Host "(e so conversar em portugues - ele faz o resto)"
Write-Host ""
claude "Acabei de abrir este projeto pelo terminal. Execute agora a sua primeira acao conforme o topo do CLAUDE.md (se for a primeira vez, comece a configuracao; caso contrario, me cumprimente e pergunte o que eu quero fazer)."
