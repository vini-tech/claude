---
name: enxugar
description: Corta o texto de um ou mais capítulos do ateliê seguindo docs/guia-enxugar.md (meta de 45% a menos, limites por campo), sem mexer em partituras, cifras, ids ou perfis.
argument-hint: "<id> [<id> …]"
disable-model-invocation: true
---

Capítulos: $ARGUMENTS

1. Leia `docs/guia-enxugar.md` inteiro.
2. Meça antes: `node tests/medir_texto.js $ARGUMENTS` e anote o total de cada capítulo.
3. Ache os capítulos em `web/livro/*.js` (`grep -n 'id: "<id>"' web/livro/*.js`) e as perguntas deles
   em `web/livro/perguntas-*.js`.
4. Corte seguindo o guia: fora transições, repetições do que a partitura mostra, histórico longo e
   adjetivos; tabelas e listas curtas no lugar de prosa; no máximo 3 notas de decisão por camada.
   **Não mexa** em partituras (`partitura`, `texto`, `solucao`), cifras, `anotacoes`, ids, perfis,
   contextos, regras, `verificar`, estrutura, índice da alternativa certa nem no sentido musical.
5. Meça depois: nenhum campo "acima do limite" e pelo menos 45% menos que antes em cada capítulo.
6. `node tests/validar_temas.js` imprime `[]` e `python -m pytest -q` passa.
7. Relate ao usuário a tabela antes → depois (caracteres e %) por capítulo. Um commit por capítulo
   ou grupo pequeno, só se o usuário pedir; não deixe capítulo pela metade.
