---
name: perguntas
description: Escreve ou refaz as 3 perguntas de julgamento de antes dos exercícios de um capítulo do ateliê, seguindo docs/guia-perguntas.md, com conferência no verificador e revisão musical.
argument-hint: "<id do capítulo>"
disable-model-invocation: true
---

Capítulo: $ARGUMENTS

1. Leia `docs/guia-perguntas.md` inteiro e o modelo em `web/livro/perguntas-n1.js` (capítulo `arquitetura`).
2. Leia o capítulo inteiro em `web/livro/*.js` (texto, exemplos, quebra, exercícios): as perguntas
   preparam justamente para os exercícios.
3. Escreva as 3 perguntas no módulo `web/livro/perguntas-*.js` do nível do capítulo: pelo menos dois
   tipos diferentes, pelo menos 2 com partitura, uma sobre a decisão central e uma sobre a quebra.
   Alternativas erradas plausíveis, cada uma com `por` concreto (nota, compasso, intervalo).
   Use `verificar` nas perguntas "qual está correta?".
4. `node tests/validar_temas.js` imprime `[]`; `node tests/medir_texto.js $ARGUMENTS` sem nada acima do limite.
5. Rode o subagente `revisor-musical` só nas perguntas desse capítulo e corrija os erros certos;
   leve ao usuário os itens "duvidoso".
6. Relate ao usuário as perguntas (enunciado e alternativa certa) e o resultado da verificação.
