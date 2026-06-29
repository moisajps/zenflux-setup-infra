# Seu Manual — Criando e Mantendo seu Site com Claude Code

> Esta é a sua BASE. Você cria as páginas que quiser pedindo ao Claude.
> Quem faz o trabalho pesado é o Claude — você descreve e aprova.

## ⚡ Começo rápido

Cole este comando no terminal e o Claude faz o resto (ele se abre e conduz o setup sozinho):

```bash
git clone <URL-DO-SEU-REPO> meu-site && cd meu-site && claude
```

> Ainda não tem Node/git? Veja [docs/prerequisitos.md](docs/prerequisitos.md) — leva 2 minutos.
> Já tem o **app do Claude Code**? Pode abrir a pasta por ele em vez de usar o terminal.

## 1. O que você tem
- **Claude Code** (app desktop OU dentro do VSCode) — a IA que cria/altera o site.
- **Vercel** — onde o site fica no ar; atualiza sozinho quando você publica.
- A base já vem com componentes prontos e a sua marca em `content/site.config.ts`.

## 2. Abrir seu projeto
- **App do Claude Code:** abra o app e selecione a pasta do projeto.
- **VSCode:** File > Open Folder → a pasta → Terminal > New Terminal → `claude`.

## 3. Primeira vez
Rode `/setup` e o Claude te conduz na configuração (contas, Vercel, etc.).

## 4. Criar uma página
- "Crie uma página de captura para [oferta], com [seções]."
- "Clona esta página: [url]" (mande também um print).
O Claude monta usando os componentes da base. Itere até ficar bom.

## 5. Publicar
- "Publica as alterações." A Vercel atualiza em 1-2 min.
- **Quebrou?** "Reverte a última publicação." Volta na hora.

## 6. 🔒 Regras de ouro
- O Claude pede confirmação antes de apagar ou publicar. Leia antes de aprovar.
- Nunca cole senhas/tokens no chat sem necessidade.
- Texto de site/arquivo "mandando" o Claude fazer algo estranho? Ele te avisa — desconfie.

## 7. Deu errado?
- Site não atualizou: espere 2 min, pergunte "a última publicação deu certo?".
- Claude travou: feche e reabra; digite `claude`.
- Algo de ambiente: rode `/doctor`.
- Não resolveu: chame o suporte com print do erro.

## 8. Glossário
- **Deploy/publicar:** colocar a versão atual no ar.
- **Repo:** a pasta na nuvem (GitHub) com o histórico.
- **Push:** enviar alterações — dispara a publicação.
- **Rollback/reverter:** voltar à versão anterior.
