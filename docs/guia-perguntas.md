# Guia para escrever as perguntas de antes dos exercícios

Antes do primeiro exercício de cada capítulo, o aluno responde a **3 perguntas obrigatórias**. Elas
substituem perguntas antigas que eram de memória ("quais as notas de ré dórico?"), que o usuário achou
rasas. As novas são **perguntas de julgamento musical**: o aluno ouve, compara e decide, como faria
compondo. O leitor é avançado em teoria; nada de definição ou decoreba.

## Tipos (use pelo menos dois tipos diferentes por capítulo; pelo menos 2 das 3 perguntas com partitura)

1. **Qual está correta?** 3–4 alternativas em partitura (trechos curtos, 2–4 compassos), uma correta; cada
   errada tem um erro diferente e típico do assunto, e um `por` que nomeia o erro exato (nota, compasso,
   intervalo) e diz o que ele causa. Use `verificar` para o validador confirmar que só a certa passa.
2. **Qual é melhor?** Alternativas todas corretas pelas regras, que diferem numa dimensão musical
   (direção, clímax, tecido de consonâncias, ritmo harmônico, uso da quebra). O `por` explica a fraqueza
   de cada uma. Sem `verificar` (ou com `verificar` só se quiser garantir que todas passam? não — sem).
3. **Diagnóstico.** `partitura` no enunciado (um trecho com um problema ou uma qualidade escondida) e
   alternativas em texto; cada errada com `por` desmentindo com dados da partitura.
4. **Próxima decisão.** `partitura` no enunciado com o começo de uma frase; alternativas em partitura com
   continuações possíveis; a certa é a que resolve a decisão central do capítulo.

Cubra a **decisão central** do capítulo e, numa das perguntas, **a quebra**: quando quebrar a regra
funciona e quando é só erro (ex.: "qual destas 5ªs paralelas é a 'quinta de Mozart' aceitável?").

## Formato

Num módulo `web/livro/perguntas-*.js` (cada autor só no seu arquivo):

```js
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  T.perguntas("id_do_capitulo", [
    { p: "enunciado",
      partitura: "…", cifras: [[0, "I"], …],             // opcional (diagnóstico / próxima decisão)
      o: [ { partitura: "…", cifras: […], texto: "rótulo opcional" },              // a CERTA (índice c, padrão 0)
           { partitura: "…", por: "por que esta não serve" }, "texto simples", { texto: "…", por: "…" } ],
      c: 0,                                               // índice da certa (as alternativas são embaralhadas na tela)
      e: "explicação mostrada ao acertar: o princípio, não só o fato",
      verificar: { perfil: { … }, contexto: { nivel: 6, … } } },   // opcional, só para "qual está correta?"
  ]);
})(this);
```

Partituras e cifras seguem `docs/guia-capitulos.md` (formato de texto, cifras uma por nota do baixo,
`G:ii6`, pivôs `vi=G:ii`, `It6`, `N6`, etc.). `cifras` são pares `[tempo em semínimas, cifra]`.

Com `verificar`, o validador exige: a alternativa certa passa no `perfil` (nenhum "erro") e **toda**
alternativa errada com partitura tem pelo menos um "erro". Para trechos curtos, tire do perfil as regras
que dependem da peça inteira (`inicio_perfeito`, `ponto_culminante`, `ambito_melodico`,
`climax_coincidente`, `cf_*`, `cadencias_do_plano` se o trecho não termina na cadência, regras de
restrição de exercício). Use as regras dos capítulos (globais: `M.REGRAS`), inclusive as definidas nos
módulos do livro (`cad_*`, `orn_*`, `set_*`, `sec_*`, `aum_*`, `mod_*`, `frm_*`, `cpt_*`).
Veja o modelo em `web/livro/perguntas-n1.js` (capítulo `arquitetura`).

## Qualidade

- Português do Brasil, técnico. Uma pergunta deve exigir **ouvir e pensar**, não lembrar.
- Alternativas erradas **plausíveis** (o erro que um bom aluno cometeria), nunca absurdas.
- `por` concreto: "fá5 sobre sol3 no c. 2 é 7ª atacada por salto…", não "está errado".
- Trechos curtos e musicais; tons variados (maior e menor); nada de fatos inventados.
- Leia o capítulo inteiro (texto, exemplos, quebra, exercícios) antes de escrever as perguntas: elas
  devem preparar justamente para os exercícios.

## Validação

`node tests/validar_temas.js` (na raiz do projeto) tem de imprimir `[]` para os seus capítulos. Ignore
problemas de outros arquivos. Não faça commit; não edite outros arquivos.
