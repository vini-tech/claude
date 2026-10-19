/* Perguntas de antes dos exercícios · nível 3 (A frase e o tema; forma).
 * Perguntas de julgamento, com partitura: escolher entre versões, diagnosticar, decidir a continuação.
 * Formato em docs/guia-perguntas.md. Melodias compostas para as perguntas (não são citações). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const { TONAL, MELODIA } = T.perfis;

  // cifras "I V7 I" (uma por nota do baixo) → [[tempo em semínimas, cifra]]
  function cif(partitura, cifras) {
    const ex = M.lerTexto(partitura);
    const b = ex.vozes[ex.vozes.length - 1].notas;
    const lista = cifras.trim().split(/\s+/);
    if (lista.length !== b.length) throw new Error(`perguntas-n3: ${lista.length} cifras para ${b.length} notas do baixo em "${partitura.slice(0, 60)}…"`);
    return b.map((n, i) => [n.inicio / M.T, lista[i]]);
  }
  // alternativa/enunciado com partitura e cifras
  const pc = (partitura, cifras, resto = {}) => ({ partitura, cifras: cif(partitura, cifras), ...resto });
  const duas = (tom, mel, bx, compasso) => `${compasso ? `compasso: ${compasso}\n` : ""}tom: ${tom}\nmelodia: ${mel}\nbaixo: ${bx}`;

  const BASE = { ...TONAL, notas_do_acorde: "erro" };   // melodia sobre baixo cifrado, sem exigir final na tônica

  // ================================================================== ESQUELETO E SUPERFÍCIE

  const SUP_BX = "G2/2 B2/2 C3/2 D3/2 G2/4", SUP_C = "I I6 IV V I";
  const sup1 = (mel) => pc(duas("G maior", mel, SUP_BX), SUP_C);
  const SUP_ESQ = [[0, "D5"], [2, "B4"], [4, "C5"], [6, "A4"], [8, "G4"]];

  const SUP2_BX = "F2/2 D3/2 Bb2/2 C3/2 A2/2 Bb2/2 C3/4 F2/4", SUP2_C = "I vi IV V I6 ii6 V I";
  const sup2 = (mel) => pc(duas("F maior", mel, SUP2_BX), SUP2_C);

  T.perguntas("superficie", [
    { p: "Sol maior, esqueleto ré5 si4 | dó5 lá4 | sol4 (I I6 | IV V | I). Figura: nota – bordadura superior – nota – ligação. Qual está correta?",
      o: [
        sup1("D5/0.5 E5 D5 C5 B4 C5 B4 D5 C5 D5 C5 B4 A4 B4 A4 F#4 G4/4"),
        { ...sup1("D5/0.5 E5 D5 C5 B4 D5 C5 B4 C5 D5 C5 B4 A4 B4 A4 F#4 G4/4"),
          por: "Fim do c. 1: si4/si2 → dó5/dó3, 8ªs paralelas na colcheia de ligação. Confira também o enchimento contra o baixo." },
        { ...sup1("D5/0.5 E5 D5 C5 B4 C5 B4 D5 C5 D5 C5 G4 F#4 G4 F#4 A4 G4/4"),
          por: "Fá♯4 no lugar de lá4 (c. 2): a descida dó–lá–sol vira dó–fá♯–sol e o 2º grau some do esqueleto." },
        { ...sup1("D5/0.5 E5 D5 C5 B4 C5 B4 D5 C5 D5 A4 B4 A4 B4 A4 F#4 G4/4"),
          por: "Ré5 (9ª sobre dó3) sai por salto para lá4, fora do IV: bordadura abandonada, e a nota do esqueleto não volta." },
      ],
      e: "Grupo = nota do esqueleto, bordadura, volta, ligação ao próximo ponto, sem 5ª/8ª paralela com o baixo. Reduzido: ré–si | dó–lá | sol.",
      verificar: { perfil: { ...MELODIA, esqueleto_preservado: "erro" }, contexto: { nivel: 6, plano: { cadencia: 3 }, esqueleto: SUP_ESQ } } },

    { p: "Fá maior, mesmo esqueleto e harmonias, sem erros de condução. Qual superfície funciona melhor?",
      o: [
        sup2("A4/1 Bb4/0.5 C5/0.5 D5/1 F5/0.5 E5/0.5 D5/1 F5/0.5 D5/0.5 C5/1 E5/0.5 D5/0.5 C5/1 D5/0.5 C5/0.5 Bb4/1 G4/0.5 A4/0.5 G4/2 E4/2 F4/4"),
        { ...sup2("A4/1.5 C5/0.5 D5/0.25 E5 F5 E5 D5/1 D5/2 C5/0.5 D5 C5 Bb4 C5/0.5 F5 C5/1 Bb4/0.5 C5 Bb4 A4 G4/2 E4/2 F4/4"),
          por: "Uma figura nova a cada meio compasso: nada se repete, o esqueleto some e o c. 4 não tem o que liquidar." },
        { ...sup2("A4/1 Bb4/0.5 C5/0.5 D5/1 F5/0.5 E5/0.5 D5/1 F5/0.5 D5/0.5 C5/1 E5/0.5 D5/0.5 C5/1 D5/0.5 C5/0.5 Bb4/1 G4/0.5 A4/0.5 G4/1 E4/0.5 F4/0.5 G4/1 F4/0.5 E4/0.5 F4/4"),
          por: "Figura consistente, mas o c. 4 não liquida: a cadência não desacelera e não pousa." },
      ],
      e: "Uma figura só (♩ ♪♪) seguindo a harmonia; a variedade vem do esqueleto. No c. 4 ela some (sol–mi em mínimas): a liquidação faz a cadência pousar." },

    { p: "Lá menor. Qual é a linha estrutural (uma nota por harmonia)?",
      ...pc(duas("A menor", "F5/1.5 E5/0.5 C5/1 A4/1 E5/1.5 D5/0.5 A4/1 F4/1 D5/1.5 C5/0.5 A4/1 E4/1 C5/1.5 B4/0.5 G#4/1 B4/1 A4/4", "A2/4 D3/4 C3/4 E3/4 A2/4"), "i iv i6 V i"),
      o: [
        "Mi5–ré5–dó5–si4–lá4: as colcheias de resolução (5–4–3–2–1)",
        { texto: "Fá5–mi5–ré5–dó5–lá4: as notas longas do tempo forte", por: "São apojaturas (fora do acorde, resolvem por grau na colcheia seguinte): a sombra da linha estrutural, um grau acima." },
        { texto: "Dó5–lá4–lá4–sol♯4–lá4: as notas do 3º tempo", por: "Notas do acorde que entram e saem por salto: arpejo. A linha fica parada, sem descida para a cadência." },
        { texto: "Lá4–fá4–mi4–sol♯4–lá4: a voz grave da melodia composta", por: "Fundo dos arpejos, por salto: não desce por grau até a cadência, não é linha conduzida." },
      ],
      e: "Cada compasso abre com apojatura; a estrutural é a resolução, mesmo curta e fraca. Por trás: 5–4–3–2–1, mi–ré–dó–si–lá." },
  ]);

  // ================================================================== A SENTENÇA

  const SEN_APR = duas("G maior", "G4/1.5 B4/0.5 D5/2 C5/1.5 B4/0.5 A4/2 F#4/1.5 A4/0.5 C5/2 B4/1.5 A4/0.5 G4/2", "G2/4 D3/4 D3/4 G2/4");
  const SEN_CONT_BX = "C3/2 B2/2 A2/2 G2/2 C3/2 D3/1 D3/1 G2/4", SEN_CONT_C = "IV I6 vii°6 I ii6 I64 V I";
  const SEN_FRAG = "E5/0.75 D5/0.25 C5/1 D5/0.75 C5/0.25 B4/1 C5/0.75 B4/0.25 A4/1 B4/0.75 A4/0.25 G4/1";

  const SEN2 = duas("Bb maior",
    "D5/1 F5/0.5 Eb5/0.5 D5/2 Eb5/1 D5/0.5 C5/0.5 A4/2 C5/1 Eb5/0.5 D5/0.5 C5/2 D5/1 C5/0.5 Bb4/0.5 D5/2 G5/1 F5/0.5 Eb5/0.5 F5/1 Eb5/0.5 D5/0.5 Eb5/1 D5/0.5 C5/0.5 D5/1 C5/0.5 Bb4/0.5 C5/2 D5/1 C5/1 Bb4/4",
    "Bb2/4 F2/4 F2/4 Bb2/4 Eb3/2 D3/2 C3/2 Bb2/2 Eb3/2 F3/1 F3/1 Bb2/4");

  const SEN3_BX = "Bb2/2 A2/2 G2/2 F2/2 Bb2/2 C3/1 C3/1 F2/4", SEN3_C = "IV I6 vii°6 I ii6 I64 V I";
  const sen3 = (mel) => pc(duas("F maior", mel, SEN3_BX), SEN3_C);

  T.perguntas("sentenca", [
    { p: "Apresentação em sol maior (c. 1–4): ideia sobre I–V7, repetida sobre V7–I. Qual continuação (c. 5–8) é de sentença?",
      ...pc(SEN_APR, "I V7 V7 I"),
      o: [
        pc(duas("G maior", `${SEN_FRAG} A4/2 B4/1 A4/1 G4/4`, SEN_CONT_BX), SEN_CONT_C),
        { ...pc(duas("G maior", `${SEN_FRAG} A4/0.75 B4/0.25 C5/1 B4/0.75 D5/0.25 A4/1 G4/0.75 B4/0.25 D5/1 B4/0.75 A4/0.25 G4/1`, SEN_CONT_BX), SEN_CONT_C),
          por: "Fragmenta e acelera, mas a célula pontuada continua nos c. 7–8: sem liquidação, a cadência não pousa." },
        { ...pc(duas("G maior", "C5/1.5 E5/0.5 G5/2 F#5/1.5 E5/0.5 D5/2 C5/1.5 B4/0.5 A4/2 G4/4", "C3/4 D3/4 D3/4 G2/4"), "IV V V7 I"),
          por: "Ideia inteira em unidades de 2 c., um acorde por compasso: nada encurta nem acelera. É 4 + 4, não sentença." },
      ],
      e: "Fragmentos de meio compasso (dó–si–lá em diminuição) em sequência sobre Prinner, dois acordes por compasso; o c. 7 liquida (lá–si–lá sobre ii6–I64–V)." },

    { p: "Sentença em si♭ maior. Onde está a liquidação, e o que a distingue da fragmentação?",
      ...pc(SEN2, "I V7 V7 I IV I6 vii°6 I ii6 I64 V7 I"),
      o: [
        "C. 7: a figura ♩ ♪♪ some (dó–ré–dó–si♭ longos); nos c. 5–6 ela estava inteira, só menor",
        { texto: "Nos c. 5–6: as unidades passam de 2 c. a meio compasso", por: "Isso é fragmentação: unidades menores, mas cada uma mantém o ♩ ♪♪ e a descida por grau da ideia." },
        { texto: "No c. 3: a ideia volta sobre V7", por: "É a repetição da ideia sobre V7: ainda apresentação." },
        { texto: "Não há: a cadência dos c. 7–8 é material novo", por: "Dó–ré–dó–si♭ é a fórmula 2–3–2–1 sem os traços da ideia: não é novo, é o que restou." },
      ],
      e: "Fragmentação é tamanho; liquidação é conteúdo. Nos c. 5–6 o motivo é reconhecível em pedaços; no c. 7 perde ritmo e desenho até sobrar a fórmula cadencial." },

    { p: "Fá maior: continuação (c. 5–8) sobre Prinner (IV I6 | vii°6 I | ii6 I64 V | I), em fragmentos de meio compasso. Qual está correta?",
      o: [
        sen3("D5/0.75 C5/0.25 D5/1 C5/0.75 Bb4/0.25 C5/1 Bb4/0.75 A4/0.25 Bb4/1 A4/0.75 G4/0.25 A4/1 G4/2 A4/1 G4/1 F4/4"),
        { ...sen3("Bb4/0.75 A4/0.25 Bb4/1 A4/0.75 G4/0.25 A4/1 G4/0.75 F4/0.25 G4/1 F4/0.75 E4/0.25 F4/1 G4/2 A4/1 G4/1 F4/4"),
          por: "Si♭4–lá4–sol4–fá4 dobra o baixo: 8ªs paralelas a cada meio compasso. Prinner = 6–5–4–3 sobre 4–3–2–1, em 10ªs." },
        { ...sen3("D5/0.75 C5/0.25 D5/1 C5/0.75 Bb4/0.25 C5/1 C5/0.75 Bb4/0.25 C5/1 Bb4/0.75 A4/0.25 Bb4/1 G4/2 A4/1 G4/1 F4/4"),
          por: "O c. 6 desce uma 2ª, o baixo uma 3ª: dó5 sobre vii°6 e si♭4 sobre I, fora do acorde nos tempos fortes." },
        { ...sen3("D5/0.75 C5/0.25 D5/1 C5/0.75 Bb4/0.25 C5/1 Bb4/0.75 A4/0.25 Bb4/1 A4/0.75 G4/0.25 A4/1 G4/2 A4/1 G4/1 A4/4"),
          por: "Termina no lá4 (3ª): cadência imperfeita. A sentença fecha na tônica." },
      ],
      e: "Ré5–dó5–si♭4–lá4 em 10ªs com o baixo; c. 6 = c. 5 uma 3ª abaixo, como o baixo; o c. 7 liquida (sol–lá–sol) e chega ao fá.",
      verificar: { perfil: { ...MELODIA }, contexto: { nivel: 6, plano: { cadencia: 4 } } } },
  ]);

  // ================================================================== O PERÍODO

  const PER_ANT = duas("D maior", "A4/1.5 D5/0.5 F#5/1 D5/1 E5/1.5 C#5/0.5 A4/2 F#4/0.5 A4 G4 F#4 E4 G4 A4 B4 A4/4", "D3/4 A2/4 D3/2 G2/2 A2/4");
  const PER_CONS_BX = "D3/4 A2/4 F#2/1 G2/1 A2/1 A2/1 D3/4";
  const PER_IB = "A4/1.5 D5/0.5 F#5/1 D5/1 E5/1.5 C#5/0.5 A4/2";

  const PER2_BX = "A2/4 E2/4 A2/2 D3/2 E3/4";
  const PER2_IB = "A4/1.5 C5/0.5 E5/2 D5/1.5 C5/0.5 B4/2 C5/0.5 E5 D5 C5";
  const per2 = (fim, bx, c) => pc(duas("A menor", `${PER2_IB} ${fim}`, bx || PER2_BX), c || "i V7 i iv V");

  const PER3 = duas("E menor",
    "E4/1 G4/0.5 B4/0.5 E5/2 F#5/1.5 E5/0.5 D#5/1 B4/1 B4/1 C5/1 B4/1 D#5/1 E5/4 E4/1 G4/0.5 B4/0.5 E5/2 F#5/1.5 E5/0.5 D#5/1 B4/1 E5/0.5 B4 C5 E5 D#5/1 F#5/1 E5/4",
    "E3/4 B2/4 G2/1 A2/1 B2/2 E3/4 E3/4 B2/4 G2/1 A2/1 B2/2 E3/4");

  T.perguntas("periodo", [
    { p: "Antecedente em ré maior, semicadência no c. 4. Qual consequente (c. 5–8) responde?",
      ...pc(PER_ANT, "I V I ii6 V"),
      o: [
        pc(duas("D maior", `${PER_IB} A4/1 B4/1 F#5/1 E5/1 D5/4`, PER_CONS_BX), "I V I6 ii6 I64 V I"),
        { ...pc(duas("D maior", "A4/1.5 D5/0.5 F#5/1 D5/1 E5/1.5 C#5/0.5 A4/2 F#4/0.5 A4 G4 F#4 E4 G4 A4 B4 A4/4", "D3/4 A2/4 D3/2 G2/2 A2/4"), "I V I ii6 V"),
          por: "Repete o antecedente, semicadência inclusive: duas perguntas, nenhuma resposta." },
        { ...pc(duas("D maior", "F#5/1 E5/1 D5/1 C#5/1 B4/1 D5/1 G5/1 B4/1 A4/1 B4/1 F#5/1 E5/1 D5/4", "D3/4 G2/4 F#2/1 G2/1 A2/1 A2/1 D3/4"), "I IV I6 ii6 I64 V I"),
          por: "Cadência perfeita, mas sem a volta da ideia básica: frase nova, não consequente." },
        { ...pc(duas("D maior", `${PER_IB} A4/1 B4/1 A4/1 G4/1 F#4/4`, PER_CONS_BX), "I V I6 ii6 I64 V7 I"),
          por: "Retoma a ideia, mas chega com fá♯4 (3ª): cadência imperfeita, quase tão fraca quanto a do c. 4." },
      ],
      e: "C. 5–6 = c. 1–2 (simetria); o resto é refeito para fechar: I6–ii6–I64–V–I, ré5 sobre o I. Pergunta aberta, resposta fechada." },

    { p: "Antecedente em lá menor: ideia básica (c. 1–2), contrastante em colcheias (c. 3), cadência no c. 4. Qual está correto?",
      o: [
        per2("F5/0.5 E5 D5 C5 B4/4"),
        { ...per2("D5/0.5 F5 E5 D5 C5/4", "A2/4 E2/4 A2/2 D3/2 E3/4", "i V7 i iv i64"),
          por: "Para no 6/4 cadencial, que é dominante com apojaturas e precisa ir ao V sobre o mesmo baixo." },
        { ...per2("F5/0.5 E5 D5 C5 B4/2 D5/2", "A2/4 E2/4 A2/2 D3/2 E3/4", "i V7 i iv V7"),
          por: "Termina no V7 (ré5 = 7ª): pede resolução e o c. 4 vira passagem. A semicadência repousa na tríade." },
        { ...per2("F5/0.5 E5 D5 A4 B4/4"),
          por: "Lá4/ré3 → si4/mi3: 5ªs paralelas em iv → V." },
      ],
      e: "iv → V, melodia descendo por grau até si4 (5ª do V): fim aberto na tríade. Dó5→si4 sobre ré3→mi3 = 7ª→5ª, sem paralelas.",
      verificar: { perfil: { ...BASE, semicadencia: "erro" }, contexto: { nivel: 6, plano: { semicadencia: 4 } } } },

    { p: "Mi menor, 8 c., sem erros de condução; o consequente retoma a ideia básica. Por que não é antecedente–consequente?",
      ...pc(PER3, "i V i6 iv V i i V i6 iv V i"),
      o: [
        "O c. 4 já tem cadência perfeita: as duas frases terminam com a mesma força",
        { texto: "O consequente deveria começar com material novo", por: "A volta da ideia no c. 5 é o que faz o período. O problema é o fim da 1ª frase." },
        { texto: "A ideia contrastante (c. 3) é igual à básica", por: "C. 3: semínimas sobre i6–iv–V; c. 1: arpejo de i em colcheias e mínima. Há contraste." },
        { texto: "O ritmo harmônico não acelera para a cadência", por: "Acelera: um acorde por compasso nos c. 1–2, três nos c. 3 e 7." },
      ],
      e: "O antecedente precisa de cadência fraca (SC ou CAI) para o consequente responder. Bastaria parar o c. 4 no V." },
  ]);

  // ================================================================== MOTIVO E VARIAÇÃO

  const MOT_M = "D5/1 A4/0.5 B4/0.5 A4/1 F#4/1";
  const mot1 = (c2) => pc(duas("D maior", `${MOT_M} ${c2}`, "D3/4 A2/4"), "I V7");

  const MOT2_BX = "G2/4 E3/4 C3/4 D3/4", MOT2_C = "I vi IV V";
  const mot2 = (mel) => pc(duas("G maior", mel, MOT2_BX), MOT2_C);
  const MOT2_ABC = "G4/1 B4/0.5 A4/0.5 G4/1 D5/1 G4/1 B4/0.5 A4/0.5 G4/1 E5/1 G5/1 E5/0.5 F5/0.5 G5/1 C5/1";

  const MOT3 = duas("F maior", "A4/1 C5/1 F5/2 E5/2 C5/1 G4/1 A4/2 D5/1 F5/1 F4/0.5 Bb4/0.5 D5/3 D5/1 Bb4/1 G4/2 F4/4", "F2/4 C3/4 F2/4 D3/4 Bb2/2 C3/2 F2/4");

  T.perguntas("motivo", [
    { p: "Ré maior: motivo sobre I (c. 1), c. 2 sobre V7. Manter ritmo e contorno, mudar os intervalos. Qual c. 2 faz isso?",
      o: [
        mot1("C#5/1 A4/0.5 B4/0.5 A4/1 E4/1"),
        { ...mot1("E5/1 B4/0.5 C#5/0.5 B4/1 G4/1"),
          por: "Transposição exata (2ª acima): repetição, não variação. E o si4 do 3º tempo fica fora do V7." },
        { ...mot1("C#5/0.5 A4/0.5 B4/1 A4/1 E4/1"),
          por: "Mudou o ritmo e os intervalos; só sobra o contorno. O ritmo é o traço que mais garante coerência." },
        { ...mot1("A4/1 C#5/0.5 B4/0.5 A4/1 E4/1"),
          por: "Ritmo mantido, mas o 1º intervalo sobe (lá4→dó♯5) onde o motivo descia: mudou o contorno." },
      ],
      e: "Dó♯5–lá4–si4–lá4–mi4: mesmo ritmo e desenho; intervalos ajustados ao V7 (4ª→3ª, 3ª→4ª). Um traço muda, os outros ficam (Schoenberg).",
      verificar: { perfil: { ...BASE, frm_variacao: "erro" }, contexto: { nivel: 6, plano: {}, motivo: { de: 1, variar: [{ em: 2, manter: ["ritmo", "contorno"], mudar: ["intervalos"] }] } } } },

    { p: "Sol maior, I | vi | IV | V (semicadência). As três passam no verificador. Qual usa melhor o motivo do c. 1?",
      o: [
        mot2(`${MOT2_ABC} A4/1.5 B4/0.5 A4/2`),
        { ...mot2("G4/1 B4/0.5 A4/0.5 G4/1 D5/1 E5/0.25 D5 C5 B4 G4/1 B4/2 E5/1.5 G5/0.5 C5/2 A4/0.5 B4 C5 B4 A4/2"),
          por: "Figura nova a cada compasso: nada se repete e o c. 4 não tem o que liquidar." },
        { ...mot2(`${MOT2_ABC} A4/1 F#4/0.5 G4/0.5 A4/1 D5/1`),
          por: "C. 2–3 bons, mas ♩ ♪♪ ♩ ♩ continua no c. 4: sem liquidação, a semicadência não soa como pausa." },
      ],
      e: "C. 2: mesma melodia sobre vi (última nota adaptada). C. 3: inversão exata sobre IV, ritmo intacto. C. 4: liquidação (lá–si–lá longos). Afirmar, transformar, dissolver." },

    { p: "Fá maior. O c. 4 quase nada tem do c. 1, mas a frase soa coerente. Por quê?",
      ...pc(MOT3, "I V vi6 IV6 ii6 V I"),
      o: [
        "Cada compasso herda um traço do anterior (ritmo retrogradado, ritmo, intervalos), não do c. 1",
        { texto: "O c. 4 mantém o ritmo do c. 1", por: "C. 1: semínima–semínima–mínima; c. 4: colcheia–colcheia–mínima pontuada. Nada coincide." },
        { texto: "O c. 4 é a inversão do c. 1", por: "C. 1 sobe 3ª + 4ª; c. 4 sobe 4ª + 3ª: mesma direção, ordem trocada. Inversão espelharia." },
        { texto: "O c. 4 repete a harmonia do c. 1", por: "C. 1: I sobre fá; c. 4: IV6 sobre ré. Outro acorde, outro baixo." },
      ],
      e: "Variação desenvolvente (Brahms): cada elo deriva do anterior, não do motivo. A coerência está na cadeia; harmonia clara e cadência seguram o ouvinte." },
  ]);

  // ================================================================== EXPANSÃO DA FRASE

  const EXP1_FIM = "D5/1 B4/1 A4/1 F#4/1 G4/4";
  const exp1 = (mel, bx, c) => pc(duas("G maior", mel, bx), c);

  const EXP2_A = "Bb4/1 G4/0.5 Ab4/0.5 Bb4/1 Eb5/1", EXP2_B = "C5/1 Ab4/0.5 Bb4/0.5 C5/1 Eb5/1", EXP2_C = "G5/2 F5/1 D5/1";
  const exp2 = (mel, bx, c) => pc(duas("Eb maior", mel, bx), c);

  const EXP3 = duas("D maior", "A4/1 F#4/0.5 G4/0.5 A4/1 D5/1 B4/1 G4/0.5 A4/0.5 B4/1 D5/1 F#5/2 E5/1 C#5/1 D5/1 F#4/0.5 G4/0.5 A4/1 D5/1 B4/1 G4/0.5 A4/0.5 B4/1 D5/1 F#5/2 E5/1 C#5/1 D5/4",
    "D3/4 G2/4 A2/2 A2/2 D3/4 G2/4 A2/2 A2/2 D3/4");

  T.perguntas("expansao", [
    { p: "Sol maior, fim de consequente: tentativa de cadência (c. 1), engano (c. 2), nova tentativa e cadência perfeita (c. 4). Qual está correto?",
      o: [
        exp1(`D5/1 B4/1 A4/1 F#4/1 G4/1 B4/1 C5/1 E5/1 ${EXP1_FIM}`, "D3/2 D3/2 E3/2 C3/2 D3/2 D3/2 G2/4", "I64 V vi IV I64 V I"),
        { ...exp1(`D5/1 B4/1 A4/1 F#4/1 G4/1 B4/1 C5/1 E5/1 ${EXP1_FIM}`, "D3/2 D3/2 G2/2 C3/2 D3/2 D3/2 G2/4", "I64 V I IV I64 V I"),
          por: "V → I no c. 2: a cadência perfeita já aconteceu e os c. 3–4 sobram. A nova tentativa exige que a 1ª falhe." },
        { ...exp1(`D5/1 B4/1 F#4/1 A4/1 B4/1 G4/1 C5/1 E5/1 ${EXP1_FIM}`, "D3/2 D3/2 E3/2 C3/2 D3/2 D3/2 G2/4", "I64 V vi IV I64 V I"),
          por: "Lá4→si4 sobre ré3→mi3: 5ªs paralelas em V → vi. A sensível sobe para a tônica." },
        { ...exp1(`D5/1 B4/1 A4/1 F#4/1 G4/1 E4/1 A4/1 F#4/1 G4/1 C5/1 A4/1 F#4/1 G4/4`, "D3/2 D3/2 E3/2 D3/2 C3/2 D3/2 G2/4", "I64 V vi V IV V I"),
          por: "V → IV no c. 3 é retrogressão. Do engano se volta à pré-dominante (vi → IV)." },
      ],
      e: "Fá♯4→sol4 com o baixo ré3→mi3: a melodia cadencia, o baixo nega (vi). Do vi ao IV, e os c. 3–4 refazem a fórmula: cadência esperada duas vezes.",
      verificar: { perfil: { ...MELODIA, frm_cadencias: "erro" }, contexto: { nivel: 6, plano: { cadencia: 4 }, cadencias: [{ c: 2, tipo: "engano" }, { c: 4, tipo: "perfeita" }] } } },

    { p: "Mi♭ maior, modelo de 4 c. (I | IV | I64 V7 | I). Três versões corretas de 5 c. Qual mantém o modelo audível e reforça a cadência?",
      o: [
        exp2(`${EXP2_A} ${EXP2_B} ${EXP2_B} ${EXP2_C} Eb5/4`, "Eb3/4 Ab2/4 Ab2/4 Bb2/2 Bb2/2 Eb3/4", "I IV IV I64 V7 I"),
        { ...exp2(`${EXP2_A} ${EXP2_B} ${EXP2_C} Eb5/4 Bb4/1 G4/1 Eb4/2`, "Eb3/4 Ab2/4 Bb2/2 Bb2/2 Eb3/4 Eb3/4", "I IV I64 V7 I I"),
          por: "O compasso extra vem depois da cadência: sufixo (externo). A frase segue com 4 c.; nada foi adiado." },
        { ...exp2(`${EXP2_A} ${EXP2_B} ${EXP2_C} ${EXP2_C} Eb5/4`, "Eb3/4 Ab2/4 Bb2/2 Bb2/2 Bb2/2 Bb2/2 Eb3/4", "I IV I64 V7 I64 V7 I"),
          por: "Repete 6/4–V7: dominante sem resolver duas vezes, com salto da sensível. Soa hesitante; a insistência cabe na pré-dominante." },
      ],
      e: "Repete o c. 2 (IV): repetição de segmento (Koch). A pré-dominante insiste e a cadência chega um compasso depois. Sem o c. 3, sobra o modelo." },

    { p: "Ré maior: duas frases, 7 compassos. O que aconteceu no c. 4?",
      ...pc(EXP3, "I IV I64 V7 I IV I64 V7 I"),
      o: [
        "Elisão: o c. 4 fecha a 1ª frase e abre a 2ª (8 = 1)",
        { texto: "Contração: a 2ª frase tem só 3 compassos", por: "Contando o c. 4, a 2ª frase tem os 4 compassos. O que 'falta' é o da junção." },
        { texto: "Cadência de engano no c. 4", por: "V7 → I com ré na melodia: cadência perfeita. A frase seguinte começa no mesmo compasso." },
        { texto: "Grupos de 3 compassos, como no scherzo da 9ª de Beethoven", por: "Nos grupos de 3 a frase acaba cedo. Aqui a 1ª tem 4 c. e a 2ª começa no compasso da cadência." },
      ],
      e: "Tacterstickung (Koch), '8 = 1' (Rothstein): o ré da cadência é a 1ª nota do motivo. Duas frases de 4 c. em 7, sem respiro: esconde a grade." },
  ]);

  // ================================================================== BINÁRIA, TERNÁRIA E MINUETO

  const bin1 = (mel, bx, c) => pc(duas("G maior", mel, bx, "3/4"), c);
  const BIN1_INI = "B4/1 D5/1 G5/1 E5/2 G5/1";
  const BIN1_BX = "G2/3 G2/3 A2/2 A2/1 D3/3", BIN1_C = "I vi6=D:ii6 I64 V I";

  const BIN2_RET = "F#5/1 E5/0.5 D5/0.5 A4/1 C#5/1 E5/1 A4/1";
  const bin2 = (mel, bx, c) => pc(duas("D maior", `${mel} ${BIN2_RET}`, `${bx} D3/3 A2/3`, "3/4"), `${c} I V`);

  const BIN3 = duas("Bb maior", "D5/1 Bb4/1 F4/1 G4/1 Bb4/1 Eb5/1 D5/1 Eb5/1 D5/1 Bb4/3", "Bb2/3 Eb3/3 Bb2/1 Bb2/1 Bb2/1 Bb2/3", "3/4");

  T.perguntas("binaria", [
    { p: "Minueto em sol maior, 3/4: os c. 5–8 da 1ª reprise devem fazer cadência perfeita em ré no c. 8. Qual está correto?",
      o: [
        bin1(`${BIN1_INI} F#5/2 E5/1 D5/3`, BIN1_BX, BIN1_C),
        { ...bin1("B4/1 D5/1 G5/1 E5/2 C5/1 B4/2 A4/1 G4/3", "G2/3 C3/3 D3/2 D3/1 G2/3", "I ii6 I64 V I"),
          por: "V → I em sol: a 1ª reprise volta para casa em vez de ir ao V, e a 2ª reprise fica sem de onde voltar." },
        { ...bin1(`${BIN1_INI} F#5/3 E5/3`, "G2/3 G2/3 A2/3 A2/3", "I vi6=D:ii6 I64 V"),
          por: "Para no V de ré: semicadência. Ré foi sugerido, não confirmado." },
        { ...bin1(`${BIN1_INI} F#5/2 E5/1 F#5/3`, BIN1_BX, BIN1_C),
          por: "V → I em ré, mas com fá♯5 (3ª): cadência imperfeita. Confirmar o tom pede ré na melodia." },
      ],
      e: "Mi menor sobre sol = vi6 em sol = ii6 em ré (pivô); depois I64–V–I em ré, ré5 no c. 8. Chegadas: aberta (c. 4), no V (c. 8), em casa (c. 16).",
      verificar: { perfil: { ...BASE, frm_cadencias: "erro" }, contexto: { nivel: 6, plano: {}, cadencias: [{ c: 4, tipo: "perfeita", tom: "D maior" }] } } },

    { p: "Ré maior, 3/4; a 1ª reprise terminou em lá. Em qual 2ª reprise (c. 9–12) o retorno (c. 13) soa como resolução?",
      o: [
        bin2("E5/1 C#5/1 E5/1 F#5/1 A5/1 F#5/1 E5/1 C#5/1 A4/1 C#5/1 E5/1 G5/1", "A2/3 A2/3 A2/3 A2/3", "V I64 V V7"),
        { ...bin2("D#5/1 F#5/1 A5/1 G5/1 E5/1 B4/1 C#5/1 E5/1 G5/1 F#5/3", "B2/3 E3/3 A2/3 D3/3", "V7/ii ii V7 I"),
          por: "A Fonte termina na tônica (c. 12): o retorno chega 'de lado', sem dominante a resolver. Mais suave, sem a tensão pedida." },
        { ...bin2("A4/1 D5/1 F#5/1 G5/1 B4/1 D5/1 F#5/2 E5/1 D5/3", "D3/3 G2/3 A2/2 A2/1 D3/3", "I IV I64 V7 I"),
          por: "Cadência perfeita em ré no c. 12: o retorno soa como recomeço. A 2ª reprise precisa terminar aberta." },
      ],
      e: "Ponte: 4 c. sobre o lá (V, 6/4 de bordadura, V, V7), subindo ao sol (7ª), que desce ao fá♯ do retorno. A volta resolve a dominante prolongada." },

    { p: "Si♭ maior, 3/4: c. 5–8 da 1ª parte de uma peça de caráter (c. 4 em semicadência). O que acontece no fim da parte?",
      ...pc(BIN3, "I IV I IV64 I I"),
      o: [
        "Não há V: tônica prolongada (6/4 de bordadura sobre pedal); o fim vem da melodia e da duração",
        { texto: "Cadência plagal (IV → I)", por: "O IV do c. 7 é 6/4 sobre pedal de si♭: bordadura da tônica, sem função cadencial." },
        { texto: "Cadência perfeita: o c. 8 chega ao I com a tônica na melodia", por: "Cadência perfeita pede V → I, e nos c. 5–8 não há dominante." },
        { texto: "Semicadência no c. 8", por: "Termina no I, não no V; a semicadência já foi no c. 4." },
      ],
      e: "A quebra do capítulo: em vez da cadência, Schumann (Papillons nº 1) prolonga a tônica. A parte acaba sem 'chegar': articula por contorno, registro e duração." },
  ]);

  // ================================================================== TEMA E VARIAÇÕES

  const VAR_BX = "D3/4 G2/4 A2/2 A2/2 D3/4";
  const VAR_TEMA = duas("D maior", "D5/2 F#5/2 B4/2 D5/2 F#5/2 E5/2 D5/4", VAR_BX);
  const var1 = (mel) => pc(duas("D menor", mel, VAR_BX), "i iv i64 V i");
  const VAR_ESQ = [[0, "D5"], [2, "F5"], [4, "Bb4"], [6, "D5"], [8, "F5"], [10, "E5"], [12, "D5"]];
  const VAR1_C1 = "D5/0.5 E5 D5 E5 F5 G5 F5 D5";

  const VAR2_BX = "A2/4 E3/4 E3/2 E3/2 A2/4";
  const VAR2_TEMA = duas("A maior", "A4/2 C#5/2 B4/2 G#4/2 C#5/2 B4/2 A4/4", VAR2_BX);
  const var2 = (mel, bx, c) => pc(duas("A maior", mel, bx || VAR2_BX), c || "I V I64 V7 I");

  const var3 = (mel, bx, c) => pc(duas("D maior", mel, bx || "D3/3 G2/3 A2/2 A2/1 D3/3", "3/4"), c || "I IV I64 V I");
  const VAR3_INI = "A4/1 D5/1 F#5/1";

  T.perguntas("variacoes", [
    { p: "Tema em ré maior, esqueleto ré5 fá♯5 | si4 ré5 | fá♯5 mi5 | ré5. Qual minore (ré menor), figura nota–bordadura–nota–ligação, está correta?",
      ...pc(VAR_TEMA, "I IV I64 V I"),
      o: [
        var1(`${VAR1_C1} Bb4 C5 Bb4 C5 D5 E5 D5 E5 F5 G5 F5 D5 E5 F5 E5 C#5 D5/4`),
        { ...var1(`${VAR1_C1} Bb4 C5 Bb4 C5 D5 E5 D5 E5 F#5 G5 F#5 D5 E5 F5 E5 C#5 D5/4`),
          por: "Fá♯5 no c. 3, sobre o 6/4 de ré menor: fora do acorde. A minore abaixa 3ª e 6ª, menos o dó♯ do V." },
        { ...var1(`${VAR1_C1} Bb4 C5 Bb4 C5 D5 E5 D5 E5 F5 G5 F5 D5 E5 F5 E5 A4 D5/4`),
          por: "Fim do c. 3: lá4/lá2 → ré5/ré3, 8ªs paralelas; e a sensível dó♯ some." },
        { ...var1(`${VAR1_C1} D5 C5 Bb4 C5 D5 E5 D5 E5 F5 G5 F5 D5 E5 F5 E5 C#5 D5/4`),
          por: "Ré5 no lugar de si♭4 (c. 2): o si♭, 3ª do iv e cor da minore, sai do esqueleto." },
      ],
      e: "Fá♮, si♭, mi♮ no lugar de fá♯ e si; o V mantém o dó♯. Bordaduras a meio tom dão o peso da minore; as cabeças refazem ré–fá | si♭–ré | fá–mi | ré.",
      verificar: { perfil: { ...MELODIA, esqueleto_preservado: "erro" }, contexto: { nivel: 6, plano: { cadencia: 4 }, esqueleto: VAR_ESQ } } },

    { p: "Tema em lá maior: I | V (semicadência) | I64 V7 | I. Três variações corretas em colcheias. Qual é a melhor variação clássica?",
      ...pc(VAR2_TEMA, "I V I64 V7 I"),
      o: [
        var2("A4/0.5 B4 A4 B4 C#5 D5 C#5 A4 B4 C#5 B4 A4 G#4 A4 G#4 B4 C#5 D5 C#5 A4 B4 C#5 B4 G#4 A4/4"),
        { ...var2("A4/1 B4/0.5 C#5/0.5 C#5/0.25 D5 C#5 B4 A4/1 B4/1.5 A4/0.5 G#4/0.5 B4 E5 B4 C#5/0.5 B4 A4 C#5 B4/2 A4/4"),
          por: "Ornamentos soltos, uma ideia por meio compasso: sem motivo de variação, o tema fica mais confuso." },
        { ...var2("A4/0.5 B4 A4 B4 C#5 D5 C#5 A4 E5 F#5 E5 D5 C#5 D5 C#5 B4 C#5 D5 C#5 A4 B4 C#5 B4 G#4 A4/4", "A2/4 C#3/4 E3/2 E3/2 A2/4", "I I6 I64 V7 I"),
          por: "Mesma figura, mas o c. 2 fica no I6: some a semicadência. Segmentos, harmonia e cadências não mudam (Schoenberg)." },
      ],
      e: "Um motivo de variação aplicado sempre, ajustado só à harmonia; harmonia e cadências no lugar. O tema segue nas cabeças: lá–dó♯ | si–sol♯ | dó♯–si | lá." },

    { p: "Variações de caráter em 3/4 sobre o tema em ré maior (I | IV | I64 V | I), sem a melodia do tema. Qual ainda é variação dele?",
      ...pc(VAR_TEMA, "I IV I64 V I"),
      o: [
        var3(`${VAR3_INI} G5/2 D5/1 A4/2 E5/1 D5/3`),
        { ...var3(`${VAR3_INI} D5/2 F#5/1 F#5/2 E5/1 D5/3`, "D3/3 B2/3 A2/2 A2/1 D3/3", "I vi I64 V I"),
          por: "Trocou o IV pelo vi no c. 2. Sem melodia e sem harmonia, só sobram as cadências." },
        { ...var3(`${VAR3_INI} G5/2 D5/1 A4/2 E5/1 F#5/2 C#5/1 D5/3`, "D3/3 G2/3 A2/2 A2/1 A2/2 A2/1 D3/3", "I IV I64 V I64 V I"),
          por: "Repete 6/4–V: 5 compassos. A variação de caráter não muda número e ordem dos segmentos." },
      ],
      e: "Ficam baixo, harmonia, cadência e 4 compassos; melodia, compasso e clímax (sol5 sobre IV) são novos. O tema se reconhece pelo plano harmônico." },
  ]);
})(this);
