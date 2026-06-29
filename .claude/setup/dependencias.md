<!-- Este arquivo é lido pelo comando /setup (Etapa 3). Se renomear/mover, atualize .claude/commands/setup.md. -->
# Complementos (skills) instalados pelo /setup

> Duas fontes: **marketplace** (instala por comando) e **repositórios GitHub**
> (skills que a Moisa mantém/usa fora do marketplace). Skills de vídeo (hyperframes)
> NÃO entram — são de outro fluxo, não do produto de site.

## 1. Plugins de marketplace — instalar por comando
Dentro do Claude Code:
```
/plugin install vercel@claude-plugins-official
/plugin install superpowers@claude-plugins-official
/plugin install commit-commands@claude-plugins-official
```
Depois: `/reload-plugins` e `/plugin list` para conferir.
> Confirme o nome exato na aba Discover do `/plugin` antes de instalar (pode variar).

### Só se o cliente for usar banco (add-on de leads)
```
/plugin install supabase@claude-plugins-official
```

## 2. Skills de repositórios GitHub
Para skills que moram num repo GitHub (não no marketplace), há dois métodos:

- **Como marketplace** (preferido quando o repo é um marketplace de plugins):
  ```
  /plugin marketplace add <usuario>/<repo>
  /plugin install <nome-da-skill>@<repo>
  ```
- **Cópia manual** (quando é só uma pasta de skill): copiar `skills/<nome>/` do repo
  para `.claude/skills/<nome>/` deste projeto (ou para `~/.claude/skills/<nome>/`).

> ⚠️ LISTA A PREENCHER — a Moisa vai fornecer as skills exatas (nome + repo + método).
> Modelo:
> - `<nome-da-skill>` — repo `usuario/repo` — método: marketplace | cópia

## 3. Skills próprias (já vêm neste projeto)
- `clonar-pagina` — recria uma página existente (URL + print) em código.
- `comecar` — ponto de partida pós-setup: conduz o usuário a criar o que quiser.
