# Guia para enxugar o texto dos capítulos

O usuário achou o ateliê com texto demais, poluindo a tela. Objetivo: **cortar o inútil, encurtar o
resto e trocar prosa por tabelas e listas curtas, sem perder informação técnica importante.** Meta:
reduzir o texto de cada capítulo em **pelo menos 45%** (meça com `node tests/medir_texto.js id …`) e
deixar **todos** os campos dentro dos limites que a ferramenta aponta.

## O que NÃO mexer
Partituras (`partitura`, `texto`, `solucao`), cifras, `anotacoes`, ids, perfis, contextos, regras,
`verificar`, a estrutura (seções, camadas, exercícios, perguntas e o índice da alternativa certa) e o
sentido musical de cada explicação. `node tests/validar_temas.js` tem de continuar imprimindo `[]`.

## Como cortar
- **Fora:** frases de transição ("Agora vamos…", "Repare que…", "Como vimos…"), repetição do que a
  partitura ou a cifra já mostra, histórico longo (fica uma referência curta: "Fux, 1725"), adjetivos,
  explicações do que o aluno já sabe (teoria básica), avisos sobre a própria interface.
- **Tabelas** (`<table class="tabela-modos">`) para comparações: tipos × tratamento, grau × cifra,
  regra × exceção, quem quebrou × o quê × efeito. Tabela não conta no limite de texto — use-a.
- **Listas** curtas no lugar de parágrafos; frases nominais ("Preparação consonante no fraco.").
- **Notas de decisão** (camadas): no máximo 3 por camada, uma linha cada; mantenha a alternativa
  rejeitada só se ensinar algo.
- **Instruções de exercício:** o que fazer + a restrição, em uma ou duas frases. Não repita a aula.
- **Perguntas:** enunciado curto; `e` = o princípio em uma frase; `por` = o erro exato em uma frase
  ("ré5→dó5 sobre ré4→dó4: 8ªs paralelas.").
- **Quebra:** uma tabela "obra/compositor · o que quebra · efeito" + no máximo duas frases.
- **Ouvir:** no máximo 3 itens, curtos ("Bach, Invenção nº 1").
- Português do Brasil, técnico; abreviações musicais normais (c. 5, 6ª M, V7) são bem-vindas.

## Limites por campo (caracteres sem HTML, tabelas fora da conta)
objetivo 140 · cada item de ouvir 80 (máx. 3 itens) · seção de texto 700 · nota de camada 160 (máx. 3
por camada) · pausa 130 / comentário 280 · contraste: pergunta 120 / comentário 320 · quebra 600 / comentário
de exemplo 180 · instruções 230 · comentário da solução 170 · pergunta: p 150, e 220, por 160, texto de
alternativa 110.

## Conferir
```
node tests/medir_texto.js id1 id2 …     # sem "acima do limite" e com ~45% menos que antes
node tests/validar_temas.js             # []
```
Edite só os arquivos que lhe foram atribuídos. Não faça commit.
