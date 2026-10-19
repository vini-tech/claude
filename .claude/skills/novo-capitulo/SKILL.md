---
name: novo-capitulo
description: Cria um capítulo novo do ateliê num módulo de web/livro/, seguindo docs/guia-capitulos.md, com verificação e revisão musical no fim.
argument-hint: "<assunto> [nível] [depois de <id>]"
disable-model-invocation: true
---

Capítulo pedido: $ARGUMENTS

Siga em ordem e não pule etapas:

1. **Plano** (antes de escrever qualquer arquivo): leia `docs/guia-capitulos.md` e a pesquisa do
   assunto em `research_notes/O que se ensina em composição/` e `reports/`. Proponha ao usuário: id,
   título, nível, posição (`depoisDe`), nome do módulo, as seções (regra histórica com fonte, exemplo
   em camadas, contraste, quebra com repertório) e os 3 a 5 exercícios na sequência do guia
   (completar → menos apoio → restrição → livre → quebrar). Espere a aprovação.
2. **Escrita**: delegue ao subagente `autor-capitulo` (ou escreva você mesmo só no módulo novo
   `web/livro/<nome>.js`) e acrescente o nome em `web/livro/indice.js`, depois dos módulos dos ids que
   o capítulo usa em `depoisDe`/`antesDe`.
3. **Perguntas**: as 3 perguntas de antes dos exercícios seguem `docs/guia-perguntas.md` (use `/perguntas <id>`).
4. **Verificação**: `node tests/validar_temas.js` imprime `[]`, `node tests/medir_texto.js <id>` sem
   nada acima do limite, `python -m pytest -q` passa.
5. **Revisão**: rode o subagente `revisor-musical` com o id. Corrija os erros certos; leve ao usuário
   os itens "duvidoso" em vez de decidir sozinho.
6. **Página**: abra http://localhost:8765/curso.html#<id> (`.claude/launch.json`) e confira a tela no
   celular e no desktop.
7. Relate ao usuário o que foi feito, o resultado de cada verificação e o que ficou em aberto. Não
   faça commit sem o usuário pedir.
