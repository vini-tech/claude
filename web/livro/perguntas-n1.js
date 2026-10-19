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
  // trechos (só um pedaço de um exercício): sem as regras de começo, de tamanho e de arco da linha inteira
  const SO_DA_LINHA = ["inicio_perfeito", "ponto_culminante", "ambito_melodico", "climax_coincidente"];
  const trecho = (perfil, ...outras) => {
    const r = { ...perfil };
    for (const k of [...SO_DA_LINHA, ...outras]) delete r[k];
    return r;
  };
  const N1_TRECHO = trecho(N1);
  const fim = (linha) => `tom: C maior\ncf: cantus\ncontraponto: ${linha}\ncantus: F4/4 E4 D4 C4`;
  // trechos que param no meio da linha: também sem as regras do fim
  const SEM_FIM = ["final_perfeito", "cadencia_contraponto"];

  T.perguntas("arquitetura", [
    { p: "Fim do cantus, contraponto em cima. Qual final está correto?",
      o: [
        { partitura: fim("D5/4 C5 B4 C5") },
        { partitura: fim("A4/4 G4 D5 C5"), por: "Ré5→dó5 sobre ré4→dó4: 8ªs paralelas, e sem a sensível si4." },
        { partitura: fim("D5/4 E5 F5 E5"), por: "Termina na 3ª (a 1ª espécie fecha em 8ª/uníssono), sem a convergência 6ª → 8ª." },
        { partitura: fim("D5/4 G4 G4 C5"), por: "Sol4/ré4 é 4ª (dissonância); a final chega por salto, sem sensível." },
      ],
      e: "Si4→dó5 sobre ré4→dó4: 6ª M → 8ª, por grau e em movimento contrário — a cadência com o contraponto em cima.",
      verificar: { perfil: N1_TRECHO, contexto: { nivel: 1 } } },
    { p: "Nenhuma das três quebra regra. Qual tem o melhor arco?",
      o: [
        { partitura: cp("C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5") },
        { partitura: cp("C5/4 F5 D5 C5 B4 C5 A4 G4 B4 C5"), por: "Clímax fá5 já no c. 2: o resto só desce, sem preparação." },
        { partitura: cp("G4/4 F4 A4 G4 B4 C5 D5 C5 B4 C5"), por: "Sobe com o cantus em 3ªs/6ªs paralelas: soa como voz dobrada." },
      ],
      e: "Desce, sobe por 3ªs a um único clímax (mi5, c. 5) e volta por grau: preparação, ponto alto, resolução." },
    { p: "Correta pelas regras, mas sem direção. Por quê?",
      partitura: cp("C5/4 A4 D5 E5 D5 C5 A4 B4 B4 C5"),
      o: [
        "Perfeitas demais no meio (c. 2, 4, 5, 8): cada uma soa como chegada",
        { texto: "5ªs paralelas entre os c. 4 e 5", por: "8ª mi5/mi4 → 5ª ré5/sol4, em movimento contrário: não são paralelas." },
        { texto: "O clímax se repete", por: "O mi5 aparece uma vez só (c. 4)." },
        { texto: "A cadência não converge", por: "Si4→dó5 sobre ré4→dó4: 6ª M → 8ª, correta." },
      ],
      e: "Perfeitas no meio fazem a linha pousar a cada dois compassos. Guarde-as para as pontas." },
  ]);

  // ------------------------------------------------------------------ Os modos
  const frig = (linha) => `tom: E frigio\ncf: cantus\ncontraponto: ${linha}\ncantus: G4/4 E4 F4 E4`;
  const dor = (linha) => `tom: D dorico\ncf: cantus\ncontraponto: ${linha}\ncantus: A4/4 G4 F4 E4 D4`;
  T.perguntas("modos", [
    { p: "Mi frígio, fim do cantus (sol4 mi4 fá4 mi4), contraponto em cima. Qual final está correto?",
      o: [
        { partitura: frig("B4/4 C5 D5 E5") },
        { partitura: frig("B4/4 C5 D#5 E5"), por: "Ré♯5 é sensível tonal: 6ª aumentada sobre fá4 e 2ª aumentada dó5→ré♯5." },
        { partitura: frig("B4/4 C5 F5 E5"), por: "Fá5→mi5 sobre fá4→mi4: 8ªs paralelas. Só uma voz faz o fá→mi." },
        { partitura: frig("B4/4 C#5 D5 E5"), por: "Dó♯ não é do frígio (6ª menor); elevar o 6º grau é recurso do eólio." },
      ],
      e: "Ré5→mi5 sobre fá4→mi4: 6ª M → 8ª, sem alteração. No frígio o semitom está na voz que desce; a outra sobe por tom.",
      verificar: { perfil: N1_TRECHO, contexto: { nivel: 1 } } },
    { p: "Três cantus corretos em ré dórico. Em qual mais se ouve a 6ª maior acima da final?",
      o: [
        { partitura: "tom: D dorico\ncantus: D4/4 F4 E4 G4 A4 B4 G4 A4 F4 E4 D4" },
        { partitura: "tom: D dorico\ncantus: D4/4 F4 E4 G4 A4 G4 F4 E4 D4", por: "Sem nenhum si: cabe também em ré eólio. Modalmente neutro." },
        { partitura: "tom: D dorico\ncantus: D4/4 B3 C4 E4 D4 F4 G4 E4 D4", por: "Si3 só abaixo da final, puxando para dó: a 6ª ré–si acima nunca soa." },
      ],
      e: "Si4 é o clímax (c. 6), por grau desde lá4: a 6ª M soa no ponto mais exposto. A saída por salto a sol4 evita o trítono si–fá.",
    },
    { p: "Ré dórico, fim do cantus de Fux, contraponto em cima. Em qual final a sensível dó♯ está bem usada?",
      o: [
        { partitura: dor("C5/4 B4 D5 C#5 D5") },
        { partitura: dor("C#5/4 B4 D5 C#5 D5"), por: "Dó♯ no c. 1, fora da cadência: soa ré menor tonal. A ficta altera só a penúltima nota." },
        { partitura: dor("C5/4 B4 D5 C5 D5"), por: "Dó5 sobre mi4: 6ª menor → 8ª, sem semitom para a final. A cadência não fecha." },
      ],
      e: "Dó natural no c. 1 (cor dórica) e dó♯ só no c. 4, a 6ª M que converge à 8ª: alteração local, só na cadência.",
      verificar: { perfil: N1_TRECHO, contexto: { nivel: 1 } } },
  ]);

  // ------------------------------------------------------------------ Elaborar (2ª espécie)
  const N2_TRECHO = trecho({ ...M.perfilDoNivel(2), notas_do_modo: "erro" });
  const ela = (linha) => `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${linha}\ncantus: A4/4 G4 F4 E4 D4`;
  const ela5 = (nota) => `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: A4/2 D5 B4 ${nota} C5/4\ncantus: D4/4 G4 F4`;
  T.perguntas("elaborar", [
    { p: "Esqueleto dó5–si4–ré5–dó♯5–ré5 sobre lá4 sol4 fá4 mi4 ré4. Qual diminuição em 2ª espécie está correta?",
      o: [
        { partitura: ela("C5/2 E5 B4 C5 D5 A4 C#5/4 D5/4") },
        { partitura: ela("C5/2 E5 D5 B4 D5 A4 C#5/4 D5/4"), por: "Mi5/lá4 (fraco) → ré5/sol4 (forte): 5ªs paralelas; e o c. 2 devia começar em si4." },
        { partitura: ela("C5/2 E5 B4 C5 D5 E5 C#5/4 D5/4"), por: "Mi5/fá4 (7ª) sai por salto: é cambiata, só na 3ª espécie. Na 2ª, só passagem." },
        { partitura: ela("C5/2 E5 C5 B4 D5 A4 C#5/4 D5/4"), por: "Dó5/sol4 (4ª) no tempo forte, por salto: o forte é do esqueleto (si4)." },
      ],
      e: "Nota fraca com função: mi5 salta dentro da consonância, dó5 é passagem, lá4 prepara a sensível. Penúltima em semibreve: licença cadencial.",
      verificar: { perfil: N2_TRECHO, contexto: { nivel: 2 } } },
    { p: "2ª espécie em lá eólio, sem erro de regra, mas o meio soa estranho. O que está escondido?",
      partitura: "compasso: 2/2\ntom: A eolio\ncf: cantus\ncontraponto: C5/2 G4 A4 F4 G4 E4 G#4/4 A4/4\ncantus: E4/4 D4 C4 B3 A3",
      o: [
        "Tempos fortes dos c. 2–3 em 5ªs seguidas (lá4/ré4 → sol4/dó4); o fá4 no meio não as separa",
        { texto: "5ªs paralelas do fraco para o forte (c. 2–3)", por: "Fá4/ré4 é 3ª → 5ª: não é paralela. O problema está nos tempos fortes." },
        { texto: "O fá4 do c. 2 é dissonância que sai por salto", por: "Fá4/ré4 é 3ª, consonante, e sai por grau." },
        { texto: "A cadência não tem sensível", por: "Sol♯4/si3 → lá4/lá3: 6ª M → 8ª, com sensível." },
      ],
      e: "Tempos fortes: 6–5–5–6–8. Esqueleto com 5ªs paralelas; uma mínima não disfarça. Corrija o esqueleto antes das notas fracas." },
    { p: "C. 5 de Fux: si4 → dó5 sobre sol4 → fá4. Que nota no tempo fraco?",
      o: [
        { partitura: ela5("G4"), texto: "sol4 (uníssono com o cantus)" },
        { partitura: ela5("A4"), texto: "lá4", por: "Lá4/sol4 (2ª) salta para dó5: bordadura dissonante, inexistente na 2ª espécie." },
        { partitura: ela5("D5"), texto: "ré5", por: "Ré5/sol4 → dó5/fá4: 5ªs paralelas do fraco para o forte." },
        { partitura: ela5("E5"), texto: "mi5", por: "Mi5→dó5 com sol4→fá4: 5ª oculta (movimento direto)." },
      ],
      c: 0,
      e: "Uníssono no meio é só aviso; as outras dão erro. Entre uníssono e paralela, fica o uníssono — e o salto sol4→dó5 contrário ao cantus dá impulso.",
      verificar: { perfil: trecho(N2_TRECHO, ...SEM_FIM), contexto: { nivel: 2 } } },
  ]);

  // ------------------------------------------------------------------ Linha contínua (3ª espécie)
  const N3_TRECHO = trecho({ ...M.perfilDoNivel(3), notas_do_modo: "erro", paralelas_entre_tempos: "erro" });
  const cad3 = (penultimo) => `tom: D dorico\ncf: cantus\ncontraponto: B4/1 C5 D5 B4 A4 B4 C5 D5 ${penultimo} D5/4\ncantus: G4/4 F4 E4 D4`;
  const cont = (linha) => `tom: C maior\ncf: cantus\ncontraponto: ${linha} C5/4\ncantus: C4/4 F4 E4 D4 C4`;
  T.perguntas("continua", [
    { p: "Ré dórico, cadência em 3ª espécie (cantus sol4 fá4 mi4 ré4). Só o penúltimo compasso muda. Qual está correto?",
      o: [
        { partitura: cad3("E5 D5 B4 C#5") },
        { partitura: cad3("C#5 D5 E5 C#5"), por: "Mi5/mi4 (3º tempo) → ré5/ré4 (forte): 8ªs separadas por uma semínima, soam paralelas." },
        { partitura: cad3("B4 C#5 B4 C#5"), por: "Dó5/fá4 → si4/mi4: 5ªs separadas por uma semínima, e a 2ª por movimento direto." },
        { partitura: cad3("E5 F5 D5 C#5"), por: "Fá5 (9ª) chega subindo e salta a ré5 (7ª): falsa cambiata." },
      ],
      e: "Mi5–ré5–si4–dó♯5: cambiata. 7ª por grau descendente, salto de 3ª abaixo até consonância, volta por grau.",
      verificar: { perfil: N3_TRECHO, contexto: { nivel: 3 } } },
    { p: "Três versões sem erro, mesma cadência. Reduzidas ao tempo 1, qual tem o melhor esqueleto?",
      o: [
        { partitura: cont("G4/1 F4 E4 G4 A4 G4 A4 B4 C5 D5 B4 C5 D5 C5 A4 B4") },
        { partitura: cont("C5/1 D5 E5 D5 C5 B4 A4 B4 C5 D5 B4 C5 D5 C5 A4 B4"), por: "Tempos 1: dó5–dó5–dó5–ré5. Esqueleto parado; as semínimas só giram." },
        { partitura: cont("G4/1 C5 E5 D5 C5 A4 G4 A4 B4 A4 B4 C5 D5 C5 A4 B4"), por: "Tempos 1: três 5ªs seguidas (c. 1–3). Esqueleto com 5ªs paralelas." },
      ],
      e: "Tempos 1: sol4–lá4–dó5–ré5–dó5 (5–3–6–8–8), subindo ao ré5 e cadenciando. Primeiro o esqueleto, depois as semínimas." },
    { p: "C. 1: mi5 (9ª) salta para dó5 (7ª), duas dissonâncias. Por que o verificador aceita?",
      partitura: "tom: D dorico\ncf: cantus\ncontraponto: D5/1 E5 C5 D5 A4 B4 C5 D5 E5 D5 B4 C#5 D5/4\ncantus: D4/4 F4 E4 D4",
      o: [
        "Bordadura dupla: as vizinhas de cima e de baixo de ré5, que volta no tempo 4",
        { texto: "É uma cambiata", por: "Na cambiata a 7ª chega descendo e o salto cai em consonância. Ela está no c. 3." },
        { texto: "Com o tempo 1 consonante, o resto do compasso é livre", por: "Não: os tempos 2–4 seguem as regras. Mi5→lá4 seria erro." },
        { texto: "9ªs e 7ªs no tempo fraco não contam como dissonâncias", por: "Contam; o que as legitima é a figura." },
      ],
      e: "Bordadura dupla (ré–mi–dó–ré): o salto troca de lado em volta de um centro que volta logo. Fora dela e da cambiata, dissonância sai por grau." },
  ]);

  // ------------------------------------------------------------------ Retardos (4ª espécie)
  const N4_TRECHO = trecho({ ...M.perfilDoNivel(4), notas_do_modo: "erro" });
  const ret = (linha) => `compasso: 2/2\ntom: A eolio\ncf: cantus\ncontraponto: ${linha}\ncantus: E4/4 D4 C4 B3 A3`;
  const quebra4 = (linha) => `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${linha}\ncantus: A4/4 G4 F4 E4 D4`;
  T.perguntas("retardos", [
    { p: "Lá eólio, cantus descendo (mi4 ré4 dó4 si3 lá3), contraponto em síncopes. Qual cadeia está correta?",
      o: [
        { partitura: ret("P/2 C5~ C5 B4~ B4 A4~ A4 G#4 A4/4") },
        { partitura: ret("P/2 C5~ C5 B4~ B4 A4~ A4 B4 A4/4"), por: "Lá4/si3 (7ª) sobe a si4: não resolve, perde a sensível e dá 8ªs si→lá." },
        { partitura: ret("P/2 C5~ C5 B4~ B4 A4 A4 G#4 A4/4"), por: "Lá4 reatacado, não ligado: 7ª no tempo forte sem preparação." },
        { partitura: ret("P/2 E5~ E5 D5~ D5 C5~ C5 B4 A4/4"), por: "Cadeia de 9–8: 8ªs paralelas atrasadas, e 8ªs reais no fim, sem sensível." },
      ],
      e: "Três 7–6: cada 6ª de resolução prepara o retardo seguinte. Sobre cantus descendente, o 7–6 encadeia sem paralelas (Corelli).",
      verificar: { perfil: N4_TRECHO, contexto: { nivel: 4 } } },
    { p: "4ª espécie em dó maior, sem erro. O que enfraquece a passagem?",
      partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 F5~ F5 E5~ E5 D5~ D5 C5~ C5 B4 C5/4\ncantus: A4/4 G4 F4 E4 D4 C4",
      o: [
        "Escala disfarçada: desce de fá5 a si4 sem parar, com resoluções em 6ªs paralelas; a cadeia não muda de rumo",
        { texto: "Os 7–6 deveriam ser 9–8, mais cheios", por: "Em cadeia, o 9–8 dá 8ªs paralelas atrasadas." },
        { texto: "O primeiro retardo não tem preparação", por: "Fá5 entra no fraco do c. 1 como 6ª: está preparado." },
        { texto: "A cadência está errada", por: "Dó5/ré4 (7ª) → si4 (6ª M) → dó5/dó4: 7–6 cadencial correto." },
      ],
      e: "Cadeia de 7–6 = 6ªs paralelas atrasadas. Após dois ou três retardos, uma síncope consonante ou um salto dá destino à linha." },
    { p: "Ré dórico. Após o 4–3 do c. 2, nenhuma síncope leva à cadência 7–6 (si4 preso sobre fá4 é trítono). Qual saída funciona?",
      o: [
        { partitura: quebra4("P/2 C5~ C5 B4 A4 D5~ D5 C#5 D5/4"), texto: "quebrar a espécie no c. 3: duas mínimas, lá4 e ré5" },
        { partitura: quebra4("P/2 C5~ C5 B4~ B4 A4~ A4 C#5 D5/4"), texto: "manter as síncopes", por: "Lá4/mi4 (4ª) no c. 4 salta para dó♯5: sem 7–6 e sem resolução." },
        { partitura: quebra4("P/2 C5~ C5 B4~ B4 D5~ D5 C#5 D5/4"), texto: "prender o si4 e subir ao ré5", por: "Trítono si4/fá4 tem de descer; subir ao ré5 o deixa sem resolução." },
        { partitura: quebra4("P/2 C5~ C5 B4 F5 D5~ D5 C#5 D5/4"), texto: "quebrar a espécie com fá5", por: "Si4→fá5 é 5ª diminuta melódica, salto proibido." },
      ],
      e: "Quebrar a espécie por um compasso é permitido quando a ligadura não tem saída: lá4 e ré5 preparam o 7–6. Depois, a síncope volta.",
      verificar: { perfil: { ...N4_TRECHO, ritmo_da_especie: "info" }, contexto: { nivel: 4 } } },
  ]);

  // ------------------------------------------------------------------ 5ª espécie
  const FLOR_TRECHO = trecho({ ...M.perfilDoNivel(5), cpt_ritmo_florido: "erro", notas_do_modo: "erro" });
  const flo = (linha) => `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${linha}\ncantus: F4/4 E4 D4`;
  const flor = (linha) => `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${linha}\ncantus: C4/4 E4 F4 G4 E4 D4 C4`;
  T.perguntas("florida", [
    { p: "Cadência florida em ré dórico: ré5 preparado no c. 1, preso sobre mi4, resolvendo em dó♯5. Qual versão está correta?",
      o: [
        { partitura: flo("A4/1 B4/0.5 C5/0.5 D5/2~ D5/1 C#5/0.5 B4/0.5 C#5/2 D5/4") },
        { partitura: flo("A4/1 B4/0.5 C5/0.5 D5/2~ D5/1 E5/1 C#5/2 D5/4"), por: "Ré5 preso (7ª) sobe a mi5: a dissonância não desce." },
        { partitura: flo("A4/1 B4 C5 D5~ D5/2 C#5/2 D5/4"), por: "Semínima ligada a mínima: valor menor preso a maior, tropeço métrico." },
        { partitura: flo("A4/1 B4/0.5 C5/0.5 D5/2~ D5/2 C#5/0.5 B4/0.5 C#5/1 D5/4"), por: "Colcheias no 3º tempo, lugar da resolução; elas vão no 2º." },
      ],
      e: "Colcheias no 2º tempo, preparação em mínima no 3º; no c. 2, ré5 preso uma semínima, colcheias e resolução dó♯5 no 3º tempo.",
      verificar: { perfil: FLOR_TRECHO, contexto: { nivel: 5 } } },
    { p: "Três floridos sem erro, mesma cadência 7–6. Em qual o ritmo funciona como frase?",
      o: [
        { partitura: flor("P/2 G4/2 C5/1 B4 A4 G4 A4/2 C5/2~ C5/1 B4/0.5 A4/0.5 B4/2 E5/1 D5 C5/2~ C5/2 B4/2 C5/4") },
        { partitura: flor("P/2 G4/2 C5/1 B4 A4 G4 A4/1 B4 C5 A4 B4/1 C5 D5 B4 G4/2 C5/2~ C5/2 B4/2 C5/4"), por: "Três compassos de semínimas que giram, sem síncope: 3ª espécie com moldura; clímax junto com o do cantus." },
        { partitura: flor("P/2 G4/2 C5/4 A4/1 B4 C5 A4 B4/2 D5/2 E5/1 D5 C5/2~ C5/2 B4/2 C5/4"), por: "Rodízio de espécies: a semibreve do c. 2 para a linha; nada desemboca em nada." },
      ],
      e: "Mínima, semínimas que desembocam numa síncope (4ª dó5/sol4), colcheias na resolução, clímax mi5, 7–6. Causa e consequência." },
    { p: "O verificador acusa duas regras no c. 2 (ré5 sobre mi4). Que figura é, e em que estilo é correta?",
      partitura: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: A4/1 C5/1 F5/2 D5/2 C#5/2 D5/4\ncantus: F4/4 E4 D4",
      o: [
        "Apojatura: 7ª no forte, por salto, sem preparação, resolvendo por grau. Estilo livre (Bach)",
        { texto: "Um retardo 7–6", por: "Sem ligadura: o ré5 é atacado no c. 2, vindo de fá5." },
        { texto: "Passagem acentuada, como em Palestrina", por: "A passagem chega por grau; o ré5 chega por salto." },
        { texto: "Uma antecipação (portamento)", por: "A antecipação é a resolução adiantada e consonante; o ré5 é a dissonância." },
      ],
      e: "Apojatura: dissonância forte sem aviso, mais expressiva que o retardo. Vocabulário de Bach; na 5ª espécie, duas infrações." },
  ]);

  // ------------------------------------------------------------------ Contraponto invertível
  const INV2_TRECHO = trecho({ ...M.perfilDoNivel(2), notas_do_modo: "erro", cpt_invertivel: "erro" });
  const inv = (linha) => `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${linha}\ncantus: E4/4 F4 D4 C4`;
  const reap = (nota) => `tom: D dorico\ncf: cantus\ncantus: D4/4 E4 G4 F4 E4 D4\ncontraponto: D4/4 ${nota} E4 A3 C#4 D4`;
  T.perguntas("invertivel", [
    { p: "2ª espécie, cada trecho com uma 5ª. Qual continua correto invertido à 8ª?",
      o: [
        { partitura: inv("C5/2 B4 A4 D5 B4/4 C5/4") },
        { partitura: inv("G4/2 B4 A4 D5 B4/4 C5/4"), por: "Si4 (5ª) chega por salto: invertido, 4ª atingida por salto." },
        { partitura: inv("C5/2 B4 D5 A4 B4/4 C5/4"), por: "Si4 (5ª) sai por salto: invertido, 4ª sem resolução." },
        { partitura: inv("E5/2 D5 C5 A4 B4/4 C5/4"), por: "Dó5/fá4 (5ª) no tempo forte: invertido, 4ª no forte, saindo por salto." },
      ],
      e: "À 8ª, 5ª vira 4ª. Só sobrevive a 5ª que, como 4ª, seria passagem: tempo fraco, por grau dos dois lados.",
      verificar: { perfil: INV2_TRECHO, contexto: { nivel: 2 } } },
    { p: "Este par é invertível à 8ª. E invertido à 10ª (a voz de cima desce uma 10ª)?",
      partitura: "tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 G4 B4 C5\ncantus: C4/4 D4 F4 E4 D4 C4",
      o: [
        "As 3ªs paralelas dos c. 3–4 viram 8ªs paralelas (fá3/fá4 → mi3/mi4): à 10ª, 3ª ↔ 8ª",
        { texto: "As 6ªs dos c. 2 e 5 viram 4ªs", por: "À 10ª, n → 11 − n: 6ª vira 5ª. 4ª é o que a 5ª vira à 8ª." },
        { texto: "Nada muda", por: "À 10ª, 3 ↔ 8 e 5 ↔ 6: toda imperfeita tem par perfeito." },
        { texto: "As vozes se cruzam", por: "A voz desce inteira abaixo do cantus: sem cruzamento." },
      ],
      e: "À 10ª, 3ªs/6ªs paralelas viram 8ªs/5ªs paralelas: só movimento contrário e oblíquo (Bach, Arte da Fuga, 'alla Decima')." },
    { p: "O original tem uma 5ª si4/mi4 (c. 2), que invertida vira 4ª. Reescrevendo uma nota da inversão, qual reaparição funciona?",
      partitura: "tom: D dorico\ncf: cantus\ncontraponto: D5/4 B4 E5 A4 C#5 D5\ncantus: D4/4 E4 G4 F4 E4 D4",
      o: [
        { partitura: reap("C4"), texto: "dó4 no c. 2" },
        { partitura: reap("B3"), texto: "si3 no c. 2 (inversão estrita)", por: "Si3/mi4 é 4ª no tempo forte: justamente o ponto a ajustar." },
        { partitura: reap("E3"), texto: "mi3 no c. 2", por: "Salto de 7ª ré4→mi3, e uníssono → 8ª: perfeitas consecutivas." },
        { partitura: reap("G3"), texto: "sol3 no c. 2", por: "Consonante, mas sol3→mi4 é salto de 6ª M, fora do estilo." },
      ],
      e: "Dó4 (3ª), por grau dos dois lados: o par deixa de ser estrito, mas a reaparição funciona — o 'ajuste' de Bach.",
      verificar: { perfil: N1_TRECHO, contexto: { nivel: 1 } } },
  ]);

  // ------------------------------------------------------------------ Imitação e cânone
  const CANONE_TRECHO = trecho({ ...M.perfilDoNivel(5), notas_do_modo: "erro", cpt_canone: "erro" });
  const elo3 = (dux, comes) => `compasso: 2/2\ntom: F maior\ndux: C5/2 F5 E5 D5 ${dux}\ncomes: P/4 C4/2 F4 ${comes}`;
  const espelho = (dux, comes) => `compasso: 2/2\ntom: A eolio\ndux: A4/2 G4 ${dux} A4 B4 C5 B4 G#4/4 A4/4\ncomes: P/4 A3/2 ${comes} B3/4 A3/4`;
  T.perguntas("imitacao", [
    { p: "Cânone à 8ª abaixo, atraso de 1 compasso, fá maior. No c. 3 o comes toca mi4–ré4. Qual elo do dux funciona?",
      partitura: "compasso: 2/2\ntom: F maior\ndux: C5/2 F5 E5 D5\ncomes: P/4 C4/2 F4",
      o: [
        { partitura: elo3("G5 F5", "E4 D4"), texto: "sol5–fá5" },
        { partitura: elo3("E5 D5", "E4 D4"), texto: "mi5–ré5", por: "Repete o elo anterior: mi5/mi4 → ré5/ré4, 8ªs paralelas." },
        { partitura: elo3("F5 D5", "E4 D4"), texto: "fá5–ré5", por: "Fá5/mi4 (9ª) no forte, entrando e saindo por salto." },
        { partitura: elo3("E5 D5", "C4 Bb3"), texto: "mi5–ré5, com o comes ajustado", por: "O comes deixou de imitar. Conserta-se o dux, nunca o comes." },
      ],
      c: 0,
      e: "Sol5–fá5 contra mi4–ré4: 6ª e 3ª em movimento contrário. Cada elo do dux se escreve contra a cópia do anterior.",
      verificar: { perfil: trecho(CANONE_TRECHO, ...SEM_FIM), contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 4 } } } },
    { p: "Cânone à 5ª abaixo em dó maior. Por que o si♭4 do comes (c. 3) é marcado?",
      partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 E5 D5 F5 E5 D5\ncomes: P/4 F4/2 A4 G4 Bb4",
      o: [
        "À 5ª a imitação é diatônica: 5ª abaixo de fá5, no modo, é si4 natural. Si♭ é transposição real (fá maior)",
        { texto: "Si♭4 é dissonante com o dux", por: "Si♭4/ré5 é 3ª M, consonante. O problema é de imitação." },
        { texto: "O si natural evitaria um trítono no comes", por: "Ao contrário, cria o contorno fá–si; mesmo assim é o pedido. Mude o dux." },
        { texto: "O comes deveria estar uma 4ª abaixo", por: "Dó5 → fá4 é uma 5ª abaixo, como pedido." },
      ],
      e: "À 5ª, o número de cada intervalo se mantém e a qualidade segue o modo (ré–fá menor vira sol–si maior)." },
    { p: "Cânone por inversão à 8ª abaixo, lá eólio, eixo lá4/lá3. Qual versão está correta?",
      o: [
        { partitura: espelho("F4 G4", "B3 C4 B3 A3 G3") },
        { partitura: espelho("F4 G4", "G3 F3 G3 A3 B3"), por: "Comes reto (lá3–sol3…): cânone comum, não por inversão." },
        { partitura: espelho("F4 G4", "B3 C#4 B3 A3 G3"), por: "Dó♯4 é espelho cromático; no modo, o grau acima de si3 é dó4." },
        { partitura: espelho("F4 E4", "B3 C4 D4 A3 G3"), por: "Espelho certo, mas mi4/si3 (4ª) sai por salto para lá4." },
      ],
      e: "Dux lá4–sol4–fá4, comes lá3–si3–dó4: graus espelhados com as qualidades do modo (tom sol–fá vira semitom si–dó).",
      verificar: { perfil: CANONE_TRECHO, contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 4, ate: 4, inversao: true } } } },
  ]);
})(this);
