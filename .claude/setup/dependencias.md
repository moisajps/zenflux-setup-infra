<!-- Este arquivo é lido pelo comando /setup (Etapa 3). Se renomear/mover, atualize .claude/commands/setup.md. -->
# Dependências de skills (instaladas pelo /setup)

> Fonte: consolidado do handoff. Skills de vídeo (hyperframes) NÃO entram —
> são de outro fluxo, não do produto de site.

## 1. Plugins oficiais da base — instalar via comando
Dentro do Claude Code:
```
/plugin install vercel@claude-plugins-official
/plugin install superpowers@claude-plugins-official
/plugin install commit-commands@claude-plugins-official
```
Depois: `/reload-plugins` e `/plugin list` para conferir.
> Antes de instalar, confirmar o nome exato na aba Discover do `/plugin`
> (nomes de marketplace podem variar).

### Só se o cliente for usar banco (add-on de leads)
```
/plugin install supabase@claude-plugins-official
```

## 2. Skills de design/UX — preferir plugin; copiar só se não houver
- frontend-design
- ui-ux-pro-max
- web-design-guidelines
- core-web-vitals
- copywriting

Para cada uma: checar no `/plugin` Discover. Se existir como plugin oficial,
instalar via `/plugin install`. Se não existir, copiar a pasta da skill para
`.claude/skills/<nome>/` (ou para `~/.claude/skills/<nome>/` na máquina do cliente).

## 3. Skills próprias (já vêm no projeto)
- clonar-pagina (em `.claude/skills/clonar-pagina/`)
