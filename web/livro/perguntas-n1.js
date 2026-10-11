/* Perguntas de antes dos exercícios · nível 1 (A linha a duas vozes).
 * Perguntas de julgamento, com partitura: escolher entre versões, diagnosticar um problema.
 * Formato em docs/guia-perguntas.md. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const CF1 = "C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4";
  const cp = (linha) => `tom: C maior\ncf: cantus\ncontraponto: ${linha}\ncantus: ${CF1}`;
  const N1 = { ...M.perfilDoNivel(1), climax_coincidente: "aviso", notas_do_modo: "erro" };
  // trechos (só o fim de um exercício): sem as regras de começo, de tamanho e de arco da linha inteira
  const N1_TRECHO = { ...N1 };
  for (const k of ["inicio_perfeito", "ponto_culminante", "ambito_melodico", "climax_coincidente"]) delete N1_TRECHO[k];
  const fim = (linha) => `tom: C maior\ncf: cantus\ncontraponto: ${linha}\ncantus: F4/4 E4 D4 C4`;

  T.perguntas("arquitetura", [
    { p: "Os quatro últimos compassos do cantus (fá4 mi4 ré4 dó4), contraponto em cima. Qual destes finais está correto?",
      o: [
        { partitura: fim("D5/4 C5 B4 C5") },
        { partitura: fim("A4/4 G4 D5 C5"), por: "Ré5→dó5 sobre ré4→dó4 são 8ªs paralelas: as duas vozes chegam juntas à final, e a cadência perde a sensível (si4) que deveria convergir por grau." },
        { partitura: fim("D5/4 E5 F5 E5"), por: "Termina na 3ª: a 1ª espécie fecha em 8ª ou uníssono. E fá5–mi5 contra ré4–dó4 é 3ª → 3ª, sem a convergência 6ª → 8ª." },
        { partitura: fim("D5/4 G4 G4 C5"), por: "Sol4 sobre ré4 é uma 4ª — dissonância a duas vozes — e a final chega por salto (sol4→dó5), sem a sensível." },
      ],
      e: "Si4 → dó5 sobre ré4 → dó4: 6ª maior → 8ª, as duas vozes por grau em movimento contrário. É a única convergência que o estilo aceita com o contraponto em cima.",
      verificar: { perfil: N1_TRECHO, contexto: { nivel: 1 } } },
    { p: "As três linhas não quebram nenhuma regra. Qual tem o arco mais bem construído?",
      o: [
        { partitura: cp("C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5") },
        { partitura: cp("C5/4 F5 D5 C5 B4 C5 A4 G4 B4 C5"), por: "O clímax (fá5) vem já no compasso 2: o resto da linha só desce, e a tensão se gasta antes da metade. Não há preparação nem volta." },
        { partitura: cp("G4/4 F4 A4 G4 B4 C5 D5 C5 B4 C5"), por: "A linha sobe junto com o cantus, em 3ªs e 6ªs paralelas, até o compasso 7: as duas vozes soam como uma voz dobrada. Falta movimento contrário, e o clímax não tem contraste." },
      ],
      e: "Desce um pouco (dó5–si4–lá4), sobe em dois saltos de 3ª até o mi5 (c. 5, um só ponto culminante, fora do clímax do cantus) e volta por grau à cadência: preparação, ponto alto e resolução." },
    { p: "Esta linha está correta pelas regras, mas soa sem direção. Qual é o problema?",
      partitura: cp("C5/4 A4 D5 E5 D5 C5 A4 B4 B4 C5"),
      o: [
        "Consonâncias perfeitas demais no meio (5ª no c. 2, 8ª no c. 4, 5ªs nos c. 5 e 8): cada uma soa como uma pequena chegada",
        { texto: "Há 5ªs paralelas entre os compassos 4 e 5", por: "Mi5/mi4 (8ª) → ré5/sol4 (5ª) não são paralelas: são classes diferentes e as vozes vão em sentido contrário." },
        { texto: "O clímax se repete", por: "O mi5 aparece uma vez só, no compasso 4." },
        { texto: "A cadência não converge", por: "Si4 → dó5 sobre ré4 → dó4 é 6ª maior → 8ª, por grau, em movimento contrário: a cadência está certa." },
      ],
      e: "Quatro consonâncias perfeitas entre o primeiro e o último compasso: a linha 'pousa' a cada dois compassos, e a 8ª final já não é novidade. Troque algumas por 3ªs e 6ªs e guarde as perfeitas para as pontas." },
  ]);
})(this);
