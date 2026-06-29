#!/usr/bin/env bash
# iniciar.sh — Ponto de partida (macOS/Linux).
# Verifica o ambiente e abre o Claude JÁ conduzindo a configuração do site.
cd "$(dirname "$0")" || exit 1

echo ""
echo "============================================================"
echo " zenflux — vamos colocar seu site no ar"
echo "============================================================"

# 1. Node é obrigatório (o resto o check.mjs valida)
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "✖ Node.js não está instalado — ele é necessário."
  echo "  Veja como instalar em: docs/prerequisitos.md"
  echo "  (no Mac, normalmente: brew install node)"
  echo ""
  exit 1
fi

# 2. Checa pré-requisitos (mostra o que falta, por SO)
node setup/check.mjs || exit 1

# 3. Abre o Claude já disparando a primeira ação (setup na 1ª vez)
echo ""
echo "Abrindo o Claude para configurar seu site..."
echo "(é só conversar em português — ele faz o resto)"
echo ""
exec claude "Acabei de abrir este projeto pelo terminal. Execute agora a sua primeira ação conforme o topo do CLAUDE.md (se for a primeira vez, comece a configuração; caso contrário, me cumprimente e pergunte o que eu quero fazer)."
