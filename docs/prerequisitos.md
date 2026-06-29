# Pré-requisitos (Fase 0)

Você só precisa de **2 coisas** instaladas: **Node.js** e **git**.
(O Claude Code você usa pelo **app desktop** ou instala a CLI — opcional.)

Depois de instalar, verifique tudo de uma vez:

```bash
node setup/check.mjs
```

---

## 🍎 macOS

```bash
# Node.js (LTS)
brew install node      # ou baixe em https://nodejs.org
# git
brew install git       # ou https://git-scm.com/download/mac
```

## 🪟 Windows

```powershell
# Node.js (LTS)
winget install OpenJS.NodeJS.LTS
# git
winget install Git.Git
```

> Se `winget` não existir, atualize o "App Installer" pela Microsoft Store.

---

## Conferir

```bash
node --version    # deve aparecer uma versão (ex.: v20+)
git --version     # deve aparecer uma versão
node setup/check.mjs
```

Deu "Pré-requisitos OK"? É só abrir a pasta no Claude Code (app ou `claude` no terminal)
que ele conduz o resto.
