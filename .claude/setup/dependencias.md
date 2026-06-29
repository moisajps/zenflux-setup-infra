<!-- Este arquivo é lido pelo comando /setup (Etapa 3). Se renomear/mover, atualize .claude/commands/setup.md. -->
# Complementos (skills) instalados pelo /setup

> Skills de vídeo (hyperframes) NÃO entram — são de outro fluxo, não do produto de site.

## 1. Marketplace oficial — instalar por comando
O marketplace `claude-plugins-official` (repo `anthropics/claude-plugins-official`) já é
conhecido por padrão. Dentro do Claude Code:
```
/plugin install context7@claude-plugins-official
/plugin install code-review@claude-plugins-official
/plugin install frontend-design@claude-plugins-official
/plugin install skill-creator@claude-plugins-official
/plugin install superpowers@claude-plugins-official
```
> `superpowers` é necessário: a skill `comecar` o aciona para conduzir o usuário.

## 2. Marketplace próprio — adicionar e depois instalar
```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

Depois de tudo: `/reload-plugins` e `/plugin list` para conferir.
> Antes de instalar, confirme o nome na aba Discover do `/plugin` (pode variar).

## 3. Opcionais (recomendados)
```
/plugin install vercel@claude-plugins-official          # ajuda no deploy
/plugin install commit-commands@claude-plugins-official # atalhos de git/commit
```

### Só se o cliente for usar banco (add-on de leads)
```
/plugin install supabase@claude-plugins-official
```

## 4. Skills próprias (já vêm neste projeto)
- `clonar-pagina` — recria uma página existente (URL + print) em código.
- `comecar` — ponto de partida pós-setup: conduz o usuário a criar o que quiser.
