---
name: commit-and-push
description: >
  Fluxo de git deste repositório (site da Lírio Pimenta): revisa o que mudou, monta
  um commit seguindo o estilo curto já usado no histórico do projeto, faz stage só
  dos arquivos relevantes, e só dá push depois de confirmação explícita mostrando
  branch e remoto. Use sempre que o usuário pedir para "commitar", "fazer um commit",
  "subir as mudanças", "dar push", "mandar pro remoto", "mandar pro GitHub", "salvar
  isso no git", ou variações — mesmo sem usar a palavra "commit" literalmente (ex:
  "pode registrar essas mudanças", "isso já pode ir pro repositório", "põe no
  histórico"). Invocar esta skill já vale como o pedido explícito de commit exigido
  pelo CLAUDE.md do projeto; push continua exigindo confirmação separada a cada vez.
  NÃO use para resolver conflito de merge, criar/trocar branch, rebase ou
  cherry-pick — sinalize isso ao usuário em vez de tentar.
---

# Commit and push — Lírio Site

Este projeto tem uma regra fixa no `CLAUDE.md`: nunca commitar ou dar push sem
pedido explícito. O usuário invocando esta skill já É o pedido explícito de
**commit**. Push é uma ação que outras pessoas com acesso ao repositório também
veem, então continua pedindo confirmação — mesmo que o usuário já tenha aprovado
um push antes nesta mesma conversa.

## 1. Levantar o que mudou

```bash
git status --short
git diff
git diff --staged
```

Se não houver nada para commitar, avisar e parar aqui — não force um commit vazio.

## 2. Calibrar a mensagem pelo histórico real

```bash
git log --oneline -10
```

Rode isso agora, não confie em um padrão memorizado de uma conversa anterior — o
estilo pode ter mudado. O padrão observado neste repositório: mensagens de uma
linha, prefixo `fix:`, `feat:`, `perf:` (às vezes outros, olhe o log), em
português, descrevendo o efeito ou o porquê da mudança — não a lista mecânica do
que foi tocado. Corpo longo só quando o commit junta várias mudanças relacionadas
que vieram de uma tarefa só; nesse caso, bullets curtos, um por mudança (veja o
commit `dbee1a8` como exemplo desse formato).

## 3. Stage seletivo

```bash
git add <arquivo1> <arquivo2> ...
```

Nunca `git add -A` nem `git add .`. Adicionar tudo cegamente é como um arquivo que
não devia estar ali — um `.env` gerado sem querer, um scratch file, uma nota com
dado pessoal — entra no histórico do projeto sem ninguém perceber no momento.

Depois do add, rode `git status --short` de novo e olhe cada arquivo staged. Se
algum nome parecer remotamente ligado a credencial ou segredo — mesmo com nome
inocente, tipo `config.local.js` ou `anotacoes.txt` — abra o conteúdo e confira
antes de continuar. `.env` nunca entra, mesmo que o usuário peça.

## 4. Commitar

- Sempre um commit novo. Nunca `git commit --amend`, a menos que o usuário peça
  isso explicitamente nesta conversa — amend em cima de um commit que já pode ter
  sido empurrado reescreve histórico compartilhado.
- Nunca `--no-verify`. Se um hook falhar, investigue a causa e corrija; não pule.
- Sempre feche a mensagem com:

  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

- Use heredoc para preservar quebras de linha na mensagem:

  ```bash
  git commit -m "$(cat <<'EOF'
  fix: resumo curto do efeito da mudança

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  EOF
  )"
  ```

Depois do commit, rode `git status --short` uma última vez para confirmar que a
árvore de trabalho ficou como esperado (limpa, ou só com o que ficou de fora de
propósito).

## 5. Push — sempre pergunta de novo

Mesmo que o usuário já tenha pedido push antes nesta conversa, confirme de novo
antes de cada `git push`. Aprovação de uma vez não vale para a próxima, porque
cada push é uma ação visível para qualquer outra pessoa com acesso ao repositório.

1. Rode `git status` (mostra se o branch está à frente do remoto) e, se precisar
   deixar claro para onde vai, `git remote -v`.
2. Pergunte nomeando branch e remoto — por exemplo: *"Posso dar push em `master`
   para `origin`?"*
3. Só depois de um "sim" claro, rode `git push`.
4. Nunca `--force` nem `--force-with-lease`, a menos que o usuário peça
   explicitamente — e mesmo assim, avise o risco (reescreve o histórico remoto)
   antes de rodar.

## Fora do escopo

- Conflito de merge, criar/trocar branch, rebase, cherry-pick: pare e peça
  orientação ao usuário em vez de tentar resolver sozinho.
- Arquivos `.env`: nunca editar, nunca commitar.
