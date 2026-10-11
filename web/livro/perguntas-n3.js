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
    { p: "Sol maior. Esqueleto: ré5 si4 | dó5 lá4 | sol4, um por acorde (I I6 | IV V | I). A figura pedida é nota do esqueleto – bordadura superior – nota do esqueleto – ligação para a próxima. Qual diminuição está correta?",
      o: [
        sup1("D5/0.5 E5 D5 C5 B4 C5 B4 D5 C5 D5 C5 B4 A4 B4 A4 F#4 G4/4"),
        { ...sup1("D5/0.5 E5 D5 C5 B4 D5 C5 B4 C5 D5 C5 B4 A4 B4 A4 F#4 G4/4"),
          por: "No fim do c. 1 a ligação volta ao si4 sobre si2 (8ª) e sobe para dó5 sobre dó3 (8ª): 8ªs paralelas escondidas na colcheia de ligação. A diminuição tem de ser conferida contra o baixo também nas notas de enchimento, não só nas do esqueleto." },
        { ...sup1("D5/0.5 E5 D5 C5 B4 C5 B4 D5 C5 D5 C5 G4 F#4 G4 F#4 A4 G4/4"),
          por: "No 3º tempo do c. 2 entrou fá♯4 no lugar do lá4. A nota é do acorde de V, então nada 'soa errado', mas reduzindo de novo a descida estrutural dó–lá–sol virou dó–fá♯–sol: o 2º grau, que conduz à tônica, sumiu do esqueleto." },
        { ...sup1("D5/0.5 E5 D5 C5 B4 C5 B4 D5 C5 D5 A4 B4 A4 B4 A4 F#4 G4/4"),
          por: "No c. 2 o ré5 (9ª sobre dó3) não volta ao dó5: salta para lá4, que também está fora do IV. A bordadura abandonada vira dissonância que sai por salto, e a figura perde a forma (a nota do esqueleto não reaparece no meio do grupo)." },
      ],
      e: "Cada grupo de quatro colcheias começa na nota do esqueleto, borda por cima, volta, e a última colcheia leva por grau (ou por nota do acorde) ao próximo ponto estrutural. Conferida contra o baixo, a ligação nunca forma 5ª ou 8ª paralela com a chegada; reduzida de novo, dá ré–si | dó–lá | sol.",
      verificar: { perfil: { ...MELODIA, esqueleto_preservado: "erro" }, contexto: { nivel: 6, plano: { cadencia: 3 }, esqueleto: SUP_ESQ } } },

    { p: "Fá maior. Mesmo esqueleto (lá4 ré5 | ré5 dó5 | dó5 si♭4 | sol4 mi4 | fá4), mesmas harmonias, nenhum erro de condução. Qual superfície faz melhor o trabalho do capítulo?",
      o: [
        sup2("A4/1 Bb4/0.5 C5/0.5 D5/1 F5/0.5 E5/0.5 D5/1 F5/0.5 D5/0.5 C5/1 E5/0.5 D5/0.5 C5/1 D5/0.5 C5/0.5 Bb4/1 G4/0.5 A4/0.5 G4/2 E4/2 F4/4"),
        { ...sup2("A4/1.5 C5/0.5 D5/0.25 E5 F5 E5 D5/1 D5/2 C5/0.5 D5 C5 Bb4 C5/0.5 F5 C5/1 Bb4/0.5 C5 Bb4 A4 G4/2 E4/2 F4/4"),
          por: "Pontuada, semicolcheias, mínima, colcheias em bordadura, arpejo, colcheias em escala: uma ideia rítmica nova a cada meio compasso. Nada está errado, mas nada se repete; o ouvinte não sabe qual é o gesto e não percebe o esqueleto por trás. E a parada do c. 4 não soa como liquidação, porque não havia uma figura para liquidar." },
        { ...sup2("A4/1 Bb4/0.5 C5/0.5 D5/1 F5/0.5 E5/0.5 D5/1 F5/0.5 D5/0.5 C5/1 E5/0.5 D5/0.5 C5/1 D5/0.5 C5/0.5 Bb4/1 G4/0.5 A4/0.5 G4/1 E4/0.5 F4/0.5 G4/1 F4/0.5 E4/0.5 F4/4"),
          por: "A figura é consistente, mas não para: o c. 4 tem o mesmo movimento de semínima e colcheias do resto, e a chegada à tônica é só mais um tempo da frase. Sem liquidação a cadência não desacelera, e por isso não 'pousa'." },
      ],
      e: "Uma figura só (♩ ♪♪, as colcheias ligando por grau ou arpejo uma nota estrutural à seguinte) transportada com a harmonia: a variedade vem do esqueleto, que sobe e desce. No c. 4 a figura some e ficam sol–mi em mínimas: a liquidação faz a cadência mais lenta que a frase, e é por isso que ela chega." },

    { p: "Lá menor. Qual é a linha estrutural (uma nota por harmonia) desta frase?",
      ...pc(duas("A menor", "F5/1.5 E5/0.5 C5/1 A4/1 E5/1.5 D5/0.5 A4/1 F4/1 D5/1.5 C5/0.5 A4/1 E4/1 C5/1.5 B4/0.5 G#4/1 B4/1 A4/4", "A2/4 D3/4 C3/4 E3/4 A2/4"), "i iv i6 V i"),
      o: [
        "Mi5 – ré5 – dó5 – si4 – lá4: as colcheias de resolução, uma descida 5–4–3–2–1",
        { texto: "Fá5 – mi5 – ré5 – dó5 – lá4: as notas longas do tempo forte", por: "Fá5 sobre lá2, mi5 sobre ré3, ré5 sobre dó3 e dó5 sobre mi3 estão fora do acorde e descem por grau na colcheia seguinte: são apojaturas. A linha fá–mi–ré–dó é a sombra da estrutural, um grau acima; a nota forte e longa aqui é ornamento." },
        { texto: "Dó5 – lá4 – lá4 – sol♯4 – lá4: as notas do 3º tempo, também forte", por: "São notas do acorde, mas chegam e saem por salto: fazem parte do arpejo que desce de cada resolução. Ornamentam o acorde e não conduzem — a linha dó–lá–lá–sol♯–lá fica parada, sem a descida que leva à cadência." },
        { texto: "Lá4 – fá4 – mi4 – sol♯4 – lá4: a voz grave da melodia composta", por: "São o fundo dos arpejos: chegam por salto e saem por salto, e a 'linha' lá–fá–mi–sol♯–lá não desce por grau até a cadência. Melodia composta pede duas linhas bem conduzidas, e esta não é uma." },
      ],
      e: "Cada compasso começa com uma apojatura (pontuada, dissonante, resolvendo por grau): a estrutural é a resolução, mesmo sendo curta e fraca. É a exceção à regra 'nota forte e longa é estrutural' — e por trás dela está uma descida limpa 5–4–3–2–1, mi–ré–dó–si–lá." },
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
    { p: "A apresentação (c. 1–4, sol maior) está pronta: ideia básica sobre I–V7, repetida sobre V7–I. Qual continuação (c. 5–8) faz o trabalho de uma sentença?",
      ...pc(SEN_APR, "I V7 V7 I"),
      o: [
        pc(duas("G maior", `${SEN_FRAG} A4/2 B4/1 A4/1 G4/4`, SEN_CONT_BX), SEN_CONT_C),
        { ...pc(duas("G maior", `${SEN_FRAG} A4/0.75 B4/0.25 C5/1 B4/0.75 D5/0.25 A4/1 G4/0.75 B4/0.25 D5/1 B4/0.75 A4/0.25 G4/1`, SEN_CONT_BX), SEN_CONT_C),
          por: "Fragmenta e acelera bem nos c. 5–6, mas a célula pontuada não sai de cena: continua no c. 7 e até depois da chegada, no c. 8. Sem liquidação a cadência é só mais um fragmento, e a frase não pousa." },
        { ...pc(duas("G maior", "C5/1.5 E5/0.5 G5/2 F#5/1.5 E5/0.5 D5/2 C5/1.5 B4/0.5 A4/2 G4/4", "C3/4 D3/4 D3/4 G2/4"), "IV V V7 I"),
          por: "A ideia básica volta inteira, em unidades de 2 compassos, com um acorde por compasso — a mesma densidade da apresentação. Nada encurta, nada acelera: o resultado é 4 + 4 (uma segunda frase paralela), não apresentação + continuação." },
      ],
      e: "A continuação parte a ideia em pedaços de meio compasso (a descida dó–si–lá do c. 2, em diminuição), põe-nos em sequência sobre um Prinner (IV I6 | vii°6 I, dois acordes por compasso) e, no c. 7, liquida: sem ritmo pontuado, só lá–si–lá sobre ii6–I64–V. Encurtar, acelerar, liquidar." },

    { p: "Sentença em si♭ maior. Onde está a liquidação, e o que a separa da fragmentação?",
      ...pc(SEN2, "I V7 V7 I IV I6 vii°6 I ii6 I64 V7 I"),
      o: [
        "No c. 7: a figura ♩ ♪♪ desaparece e sobra dó–ré–dó–si♭ em notas longas sobre ii6–I64–V7; nos c. 5–6 a figura ainda estava inteira, só em unidades menores",
        { texto: "Nos c. 5–6, porque as unidades passam de 2 compassos para meio compasso", por: "Isso é fragmentação: as unidades encolhem, mas cada uma ainda tem o ritmo ♩ ♪♪ e a descida por grau da ideia (sol–fá–mi♭, fá–mi♭–ré, mi♭–ré–dó, ré–dó–si♭). Nada do conteúdo do motivo foi retirado." },
        { texto: "No c. 3, porque a ideia volta sobre V7, um grau abaixo", por: "O c. 3 é a repetição da ideia básica em tônica–dominante: a mesma figura transportada sobre V7. Ainda é apresentação, que expõe o motivo e prolonga a tônica." },
        { texto: "Não há liquidação: a cadência dos c. 7–8 é material novo", por: "Material cadencial convencional é exatamente o que a liquidação deixa. Dó–ré–dó–si♭ é a descida 2–3–2–1 sem os traços da ideia (sem colcheias, sem a bordadura do começo): não é novo, é o que restou." },
      ],
      e: "Fragmentação é tamanho; liquidação é conteúdo. Nos c. 5–6 o motivo continua reconhecível em pedaços menores; no c. 7 ele perde o ritmo e o desenho característicos até sobrar a fórmula cadencial — por isso a cadência soa como consequência, não como acréscimo." },

    { p: "Continuação (c. 5–8) de uma sentença em fá maior, sobre um Prinner (IV I6 | vii°6 I | ii6 I64 V | I), em fragmentos de meio compasso. Qual está correta?",
      o: [
        sen3("D5/0.75 C5/0.25 D5/1 C5/0.75 Bb4/0.25 C5/1 Bb4/0.75 A4/0.25 Bb4/1 A4/0.75 G4/0.25 A4/1 G4/2 A4/1 G4/1 F4/4"),
        { ...sen3("Bb4/0.75 A4/0.25 Bb4/1 A4/0.75 G4/0.25 A4/1 G4/0.75 F4/0.25 G4/1 F4/0.75 E4/0.25 F4/1 G4/2 A4/1 G4/1 F4/4"),
          por: "Si♭4–lá4–sol4–fá4 dobra o baixo do Prinner em oitavas: 8ªs paralelas a cada meio compasso (si♭4/si♭2 → lá4/lá2 → sol4/sol2 → fá4/fá2). O Prinner é 6–5–4–3 sobre 4–3–2–1, em 10ªs." },
        { ...sen3("D5/0.75 C5/0.25 D5/1 C5/0.75 Bb4/0.25 C5/1 C5/0.75 Bb4/0.25 C5/1 Bb4/0.75 A4/0.25 Bb4/1 G4/2 A4/1 G4/1 F4/4"),
          por: "O c. 6 repete o c. 5 só uma 2ª abaixo, mas o baixo desce uma 3ª (si♭ → sol): dó5 cai sobre o vii°6 (mi–sol–si♭) e si♭4 sobre o I, notas fora do acorde nos tempos fortes. A sequência tem de acompanhar o passo do baixo." },
        { ...sen3("D5/0.75 C5/0.25 D5/1 C5/0.75 Bb4/0.25 C5/1 Bb4/0.75 A4/0.25 Bb4/1 A4/0.75 G4/0.25 A4/1 G4/2 A4/1 G4/1 A4/4"),
          por: "Chega ao lá4 (3ª) no c. 8: é cadência autêntica imperfeita. A sentença fecha na tônica, e a liquidação do c. 7 devia levar a descida até o fá." },
      ],
      e: "Ré5–dó5–si♭4–lá4 nos tempos fortes, em 10ªs com o baixo si♭–lá–sol–fá; o c. 6 é a sequência exata do c. 5 uma 3ª abaixo, como o baixo; no c. 7 a figura some (sol–lá–sol sobre ii6–I64–V) e a melodia chega ao fá.",
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
    { p: "O antecedente (ré maior) termina em semicadência no c. 4. Qual consequente (c. 5–8) responde a ele?",
      ...pc(PER_ANT, "I V I ii6 V"),
      o: [
        pc(duas("D maior", `${PER_IB} A4/1 B4/1 F#5/1 E5/1 D5/4`, PER_CONS_BX), "I V I6 ii6 I64 V I"),
        { ...pc(duas("D maior", "A4/1.5 D5/0.5 F#5/1 D5/1 E5/1.5 C#5/0.5 A4/2 F#4/0.5 A4 G4 F#4 E4 G4 A4 B4 A4/4", "D3/4 A2/4 D3/2 G2/2 A2/4"), "I V I ii6 V"),
          por: "Repete o antecedente inteiro, inclusive a semicadência: duas perguntas e nenhuma resposta. O período precisa que a segunda frase termine mais forte que a primeira." },
        { ...pc(duas("D maior", "F#5/1 E5/1 D5/1 C#5/1 B4/1 D5/1 G5/1 B4/1 A4/1 B4/1 F#5/1 E5/1 D5/4", "D3/4 G2/4 F#2/1 G2/1 A2/1 A2/1 D3/4"), "I IV I6 ii6 I64 V I"),
          por: "Fecha com cadência perfeita, mas os c. 5–6 não retomam a ideia básica: sem a volta, o ouvinte não liga a resposta à pergunta. Isto é uma frase nova depois de uma semicadência, não um consequente." },
        { ...pc(duas("D maior", `${PER_IB} A4/1 B4/1 A4/1 G4/1 F#4/4`, PER_CONS_BX), "I V I6 ii6 I64 V7 I"),
          por: "Retoma a ideia básica, mas chega à tônica com fá♯4 (3ª) na melodia: cadência autêntica imperfeita, pouco mais forte que a semicadência do c. 4. A resposta não fecha de verdade." },
      ],
      e: "Os c. 5–6 repetem os c. 1–2 (é a volta que cria a simetria) e a ideia contrastante é refeita para chegar a outro lugar: I6–ii6–I64–V com o 6–5 (fá♯5–mi5) e ré5 na melodia sobre o I. Pergunta aberta, resposta fechada." },

    { p: "Antecedente em lá menor: ideia básica (c. 1–2), contrastante em colcheias (c. 3), cadência no c. 4. Qual está correto?",
      o: [
        per2("F5/0.5 E5 D5 C5 B4/4"),
        { ...per2("D5/0.5 F5 E5 D5 C5/4", "A2/4 E2/4 A2/2 D3/2 E3/4", "i V7 i iv i64"),
          por: "Para no 6/4 (lá–dó–mi sobre mi), com dó5 na melodia. O 6/4 cadencial é uma dominante com apojaturas: precisa ir ao V sobre o mesmo baixo. Parar nele é parar no meio da cadência, e o 3º grau na melodia não soa como pergunta." },
        { ...per2("F5/0.5 E5 D5 C5 B4/2 D5/2", "A2/4 E2/4 A2/2 D3/2 E3/4", "i V7 i iv V7"),
          por: "Termina no V7 (ré5 é a 7ª): a semicadência repousa na tríade do V. A 7ª pede resolução imediata, e o c. 4 vira passagem para o tempo seguinte em vez de ponto de chegada." },
        { ...per2("F5/0.5 E5 D5 A4 B4/4"),
          por: "Lá4 sobre ré3 (5ª) → si4 sobre mi3 (5ª): quintas paralelas na passagem iv → V, bem no gesto cadencial." },
      ],
      e: "iv → V com a melodia descendo por grau até si4, a 5ª do V: o antecedente termina aberto, sobre a tríade da dominante em estado fundamental. Dó5 → si4 sobre ré3 → mi3 é 7ª → 5ª, sem paralelas.",
      verificar: { perfil: { ...BASE, semicadencia: "erro" }, contexto: { nivel: 6, plano: { semicadencia: 4 } } } },

    { p: "Mi menor, 8 compassos. As duas frases passam em todas as regras de condução, e o consequente retoma a ideia básica. Por que isto não funciona como antecedente–consequente?",
      ...pc(PER3, "i V i6 iv V i i V i6 iv V i"),
      o: [
        "O c. 4 já fecha com cadência perfeita (V → i, mi na melodia): as duas frases terminam com a mesma força, e a segunda confirma em vez de responder",
        { texto: "O consequente deveria começar com material novo", por: "A volta da ideia básica no c. 5 é justamente o que faz um período. O problema não está no começo da segunda frase, está no fim da primeira." },
        { texto: "A ideia contrastante (c. 3) é igual à básica", por: "O c. 3 tem semínimas regulares e anda i6–iv–V rumo à cadência, enquanto o c. 1 arpeja o i com colcheias e mínima: há contraste de superfície e de função." },
        { texto: "O ritmo harmônico não acelera para a cadência", por: "Os c. 1–2 têm um acorde por compasso e os c. 3 e 7 têm três (i6–iv–V): a aceleração está lá, nas duas frases." },
      ],
      e: "O antecedente termina numa cadência fraca (semicadência ou autêntica imperfeita) para que o consequente tenha o que responder. Com cadência perfeita já no c. 4, o resultado são duas frases fechadas iguais, sem hierarquia de cadências. Bastaria parar o c. 4 no V (fá♯ ou si na melodia)." },
  ]);

  // ================================================================== MOTIVO E VARIAÇÃO

  const MOT_M = "D5/1 A4/0.5 B4/0.5 A4/1 F#4/1";
  const mot1 = (c2) => pc(duas("D maior", `${MOT_M} ${c2}`, "D3/4 A2/4"), "I V7");

  const MOT2_BX = "G2/4 E3/4 C3/4 D3/4", MOT2_C = "I vi IV V";
  const mot2 = (mel) => pc(duas("G maior", mel, MOT2_BX), MOT2_C);
  const MOT2_ABC = "G4/1 B4/0.5 A4/0.5 G4/1 D5/1 G4/1 B4/0.5 A4/0.5 G4/1 E5/1 G5/1 E5/0.5 F5/0.5 G5/1 C5/1";

  const MOT3 = duas("F maior", "A4/1 C5/1 F5/2 E5/2 C5/1 G4/1 A4/2 D5/1 F5/1 F4/0.5 Bb4/0.5 D5/3 D5/1 Bb4/1 G4/2 F4/4", "F2/4 C3/4 F2/4 D3/4 Bb2/2 C3/2 F2/4");

  T.perguntas("motivo", [
    { p: "Ré maior. O motivo (c. 1) está sobre I; o c. 2 está sobre V7. O pedido: manter o ritmo e o contorno do motivo e mudar os intervalos para caber no acorde. Qual c. 2 faz isso?",
      o: [
        mot1("C#5/1 A4/0.5 B4/0.5 A4/1 E4/1"),
        { ...mot1("E5/1 B4/0.5 C#5/0.5 B4/1 G4/1"),
          por: "É o motivo transportado exato uma 2ª acima: para Schoenberg, repetição, não variação. E a cópia literal põe si4 no 3º tempo, fora do acorde de V7 (lá–dó♯–mi–sol) — o acorde novo pedia justamente que os intervalos se adaptassem." },
        { ...mot1("C#5/0.5 A4/0.5 B4/1 A4/1 E4/1"),
          por: "O ritmo mudou (duas colcheias no 1º tempo, semínima no 2º), e os intervalos também: das três coisas, só o contorno liga o c. 2 ao motivo. O pedido era preservar o ritmo, o traço que mais garante a coerência." },
        { ...mot1("A4/1 C#5/0.5 B4/0.5 A4/1 E4/1"),
          por: "O ritmo ficou, mas o primeiro intervalo agora sobe (lá4 → dó♯5) onde o motivo descia (ré5 → lá4): o contorno, que devia ser preservado, mudou junto com os intervalos." },
      ],
      e: "Dó♯5–lá4–si4–lá4–mi4: mesmo ritmo (♩ ♪♪ ♩ ♩), mesmo desenho (desce, sobe, desce, desce), e os intervalos se ajustam ao V7 — a 4ª inicial vira 3ª, a 3ª final vira 4ª. Um traço muda, os outros ficam: a definição de variação de Schoenberg.",
      verificar: { perfil: { ...BASE, frm_variacao: "erro" }, contexto: { nivel: 6, plano: {}, motivo: { de: 1, variar: [{ em: 2, manter: ["ritmo", "contorno"], mudar: ["intervalos"] }] } } } },

    { p: "Sol maior, I | vi | IV | V (semicadência). As três frases passam no verificador. Qual faz o melhor uso do motivo do c. 1?",
      o: [
        mot2(`${MOT2_ABC} A4/1.5 B4/0.5 A4/2`),
        { ...mot2("G4/1 B4/0.5 A4/0.5 G4/1 D5/1 E5/0.25 D5 C5 B4 G4/1 B4/2 E5/1.5 G5/0.5 C5/2 A4/0.5 B4 C5 B4 A4/2"),
          por: "Cada compasso traz uma figura nova (semínima e colcheias, semicolcheias em escala, pontuada em arpejo, colcheias em bordadura): nada se repete além do c. 1, o ouvinte não sabe o que é essencial, e o c. 4 não soa como liquidação porque não havia o que liquidar." },
        { ...mot2(`${MOT2_ABC} A4/1 F#4/0.5 G4/0.5 A4/1 D5/1`),
          por: "As operações dos c. 2–3 são boas, mas a figura ♩ ♪♪ ♩ ♩ continua até o fim: o c. 4 não liquida, a semicadência chega no meio do movimento, e a pergunta não soa como pausa." },
      ],
      e: "C. 2: a mesma melodia sobre vi, só a última nota adaptada (ré → mi). C. 3: a inversão exata (desce 3ª, sobe, sobe, desce 5ª) sobre IV — o ritmo intacto faz reconhecer o motivo de cabeça para baixo. C. 4: liquidação, só lá–si–lá em valores longos. Primeiro afirmar, depois transformar, por fim dissolver." },

    { p: "Fá maior. O c. 4 quase não tem nada do c. 1, e mesmo assim a frase soa coerente. Por quê?",
      ...pc(MOT3, "I V vi6 IV6 ii6 V I"),
      o: [
        "Cada compasso herda um traço do anterior: o c. 2 tem o ritmo do c. 1 de trás para a frente e os intervalos espelhados; o c. 3 guarda o ritmo do c. 2; o c. 4 guarda os intervalos do c. 3",
        { texto: "O c. 4 mantém o ritmo do c. 1", por: "O c. 1 é semínima–semínima–mínima; o c. 4 é colcheia–colcheia–mínima pontuada. Nenhuma duração coincide." },
        { texto: "O c. 4 é a inversão do c. 1", por: "O c. 1 sobe 3ª e 4ª (lá–dó–fá); o c. 4 sobe 4ª e 3ª (fá–si♭–ré): mesma direção, ordem trocada. Inversão espelharia a direção." },
        { texto: "O c. 4 repete a harmonia do c. 1", por: "O c. 1 é I sobre fá; o c. 4 é IV6 sobre ré: outro acorde e outro baixo. A harmonia não volta ao começo antes da cadência." },
      ],
      e: "É a variação desenvolvente de Brahms, a quebra do capítulo: cada formulação deriva da anterior, não do motivo original, e depois de três elos o que se ouve já não compartilha traço literal com o começo. A coerência está na cadeia — e, como o capítulo adverte, a harmonia clara e a cadência no fim é que impedem o ouvinte de se perder." },
  ]);

  // ================================================================== EXPANSÃO DA FRASE

  const EXP1_FIM = "D5/1 B4/1 A4/1 F#4/1 G4/4";
  const exp1 = (mel, bx, c) => pc(duas("G maior", mel, bx), c);

  const EXP2_A = "Bb4/1 G4/0.5 Ab4/0.5 Bb4/1 Eb5/1", EXP2_B = "C5/1 Ab4/0.5 Bb4/0.5 C5/1 Eb5/1", EXP2_C = "G5/2 F5/1 D5/1";
  const exp2 = (mel, bx, c) => pc(duas("Eb maior", mel, bx), c);

  const EXP3 = duas("D maior", "A4/1 F#4/0.5 G4/0.5 A4/1 D5/1 B4/1 G4/0.5 A4/0.5 B4/1 D5/1 F#5/2 E5/1 C#5/1 D5/1 F#4/0.5 G4/0.5 A4/1 D5/1 B4/1 G4/0.5 A4/0.5 B4/1 D5/1 F#5/2 E5/1 C#5/1 D5/4",
    "D3/4 G2/4 A2/2 A2/2 D3/4 G2/4 A2/2 A2/2 D3/4");

  T.perguntas("expansao", [
    { p: "Sol maior. Os quatro últimos compassos de um consequente: tentativa de cadência no c. 1, cadência de engano no c. 2, nova tentativa e cadência perfeita no c. 4. Qual está correto?",
      o: [
        exp1(`D5/1 B4/1 A4/1 F#4/1 G4/1 B4/1 C5/1 E5/1 ${EXP1_FIM}`, "D3/2 D3/2 E3/2 C3/2 D3/2 D3/2 G2/4", "I64 V vi IV I64 V I"),
        { ...exp1(`D5/1 B4/1 A4/1 F#4/1 G4/1 B4/1 C5/1 E5/1 ${EXP1_FIM}`, "D3/2 D3/2 G2/2 C3/2 D3/2 D3/2 G2/4", "I64 V I IV I64 V I"),
          por: "No c. 2 o V vai para o I em estado fundamental (sol no baixo, sol na melodia): a cadência perfeita já aconteceu, e os c. 3–4 viram uma repetição sem motivo. O 'one more time' só faz sentido se a primeira tentativa falhar." },
        { ...exp1(`D5/1 B4/1 F#4/1 A4/1 B4/1 G4/1 C5/1 E5/1 ${EXP1_FIM}`, "D3/2 D3/2 E3/2 C3/2 D3/2 D3/2 G2/4", "I64 V vi IV I64 V I"),
          por: "Lá4 → si4 sobre ré3 → mi3: 5ªs paralelas no V → vi, o erro clássico da cadência de engano (as duas vozes sobem por grau juntas). A sensível deve subir para a tônica (fá♯ → sol) enquanto o baixo sobe." },
        { ...exp1(`D5/1 B4/1 A4/1 F#4/1 G4/1 E4/1 A4/1 F#4/1 G4/1 C5/1 A4/1 F#4/1 G4/4`, "D3/2 D3/2 E3/2 D3/2 C3/2 D3/2 G2/4", "I64 V vi V IV V I"),
          por: "Depois do engano o c. 2 volta ao V e o c. 3 recua para IV: V → IV é retrogressão. Da cadência de engano se volta direto à pré-dominante (vi → IV), sem passar de novo pela dominante." },
      ],
      e: "Fá♯4 → sol4 sobre ré3 → mi3: a melodia faz o que faria numa cadência perfeita, o baixo sobe para o vi e nega a chegada. Do vi se recua à pré-dominante (IV), e os c. 3–4 repetem a fórmula do c. 1 até o fim — a cadência agora tem o peso de algo esperado duas vezes.",
      verificar: { perfil: { ...MELODIA, frm_cadencias: "erro" }, contexto: { nivel: 6, plano: { cadencia: 4 }, cadencias: [{ c: 2, tipo: "engano" }, { c: 4, tipo: "perfeita" }] } } },

    { p: "Mi♭ maior. O consequente-modelo tem 4 compassos (I | IV | I64 V7 | I). Três versões de 5 compassos, todas corretas. Qual expansão mantém a frase-modelo audível e dá mais força à cadência?",
      o: [
        exp2(`${EXP2_A} ${EXP2_B} ${EXP2_B} ${EXP2_C} Eb5/4`, "Eb3/4 Ab2/4 Ab2/4 Bb2/2 Bb2/2 Eb3/4", "I IV IV I64 V7 I"),
        { ...exp2(`${EXP2_A} ${EXP2_B} ${EXP2_C} Eb5/4 Bb4/1 G4/1 Eb4/2`, "Eb3/4 Ab2/4 Bb2/2 Bb2/2 Eb3/4 Eb3/4", "I IV I64 V7 I I"),
          por: "O compasso a mais está depois da cadência (c. 5, sobre a tônica): é sufixo, expansão externa. A frase propriamente dita continua com 4 compassos e a cadência chega na hora de sempre — nada foi adiado." },
        { ...exp2(`${EXP2_A} ${EXP2_B} ${EXP2_C} ${EXP2_C} Eb5/4`, "Eb3/4 Ab2/4 Bb2/2 Bb2/2 Bb2/2 Bb2/2 Eb3/4", "I IV I64 V7 I64 V7 I"),
          por: "Repete o 6/4–V7: a dominante é afirmada duas vezes sem resolver, com um salto da sensível (ré5 → sol5) no meio. Soa hesitante, não enfático; a insistência funciona melhor na pré-dominante, antes da dominante." },
      ],
      e: "O c. 2 (motivo em sequência sobre IV) é repetido igual, a repetição de um segmento de Koch: o ouvinte que contava 1–2–3–4 percebe o compasso a mais justamente porque a pré-dominante insiste, e a cadência chega um compasso depois do esperado. Tire o c. 3 e sobra exatamente a frase-modelo." },

    { p: "Ré maior: duas frases, 7 compassos. O que aconteceu no c. 4?",
      ...pc(EXP3, "I IV I64 V7 I IV I64 V7 I"),
      o: [
        "Elisão: o c. 4 é ao mesmo tempo a chegada da 1ª frase e o 1º compasso da 2ª (8 = 1); a tônica da cadência ocupa o lugar da cabeça do motivo",
        { texto: "Contração: a 2ª frase tem só 3 compassos", por: "Contando o c. 4, a 2ª frase tem os quatro compassos completos — motivo, sequência sobre IV, 6/4–V7, tônica — como a 1ª. Nada foi suprimido dentro dela; o compasso que 'falta' é o da junção." },
        { texto: "Cadência de engano no c. 4", por: "O V7 do c. 3 vai para o I em estado fundamental, com ré na melodia: a cadência é perfeita. O que muda é que a frase seguinte começa nesse mesmo compasso." },
        { texto: "Grupos de 3 compassos, como no scherzo da 9ª de Beethoven", por: "Nos grupos de 3 cada frase termina um compasso cedo e a seguinte começa depois. Aqui a 1ª frase tem os seus 4 compassos (a cadência é o c. 4) e a 2ª começa nesse mesmo compasso." },
      ],
      e: "Koch chamava isso de Tacterstickung, Rothstein de '8 = 1': no c. 4 o ré da cadência é também a primeira nota do motivo (no lugar do lá), e o resto do motivo continua. Duas frases de 4 compassos ocupam 7, e a música não para para respirar — uma das maneiras de esconder a grade de 4 compassos." },
  ]);

  // ================================================================== BINÁRIA, TERNÁRIA E MINUETO

  const bin1 = (mel, bx, c) => pc(duas("G maior", mel, bx, "3/4"), c);
  const BIN1_INI = "B4/1 D5/1 G5/1 E5/2 G5/1";
  const BIN1_BX = "G2/3 G2/3 A2/2 A2/1 D3/3", BIN1_C = "I vi6=D:ii6 I64 V I";

  const BIN2_RET = "F#5/1 E5/0.5 D5/0.5 A4/1 C#5/1 E5/1 A4/1";
  const bin2 = (mel, bx, c) => pc(duas("D maior", `${mel} ${BIN2_RET}`, `${bx} D3/3 A2/3`, "3/4"), `${c} I V`);

  const BIN3 = duas("Bb maior", "D5/1 Bb4/1 F4/1 G4/1 Bb4/1 Eb5/1 D5/1 Eb5/1 D5/1 Bb4/3", "Bb2/3 Eb3/3 Bb2/1 Bb2/1 Bb2/1 Bb2/3", "3/4");

  T.perguntas("binaria", [
    { p: "Minueto em sol maior, 3/4: os c. 5–8 da 1ª reprise devem modular e fazer cadência perfeita na dominante (ré maior) no c. 8. Qual está correto?",
      o: [
        bin1(`${BIN1_INI} F#5/2 E5/1 D5/3`, BIN1_BX, BIN1_C),
        { ...bin1("B4/1 D5/1 G5/1 E5/2 C5/1 B4/2 A4/1 G4/3", "G2/3 C3/3 D3/2 D3/1 G2/3", "I ii6 I64 V I"),
          por: "Fecha com V → I em sol, no tom principal: a 1ª reprise volta para casa em vez de abrir o plano tonal. Num minueto em maior ela vai para V e se confirma lá (com o dó♯); senão a 2ª reprise não tem de onde voltar." },
        { ...bin1(`${BIN1_INI} F#5/3 E5/3`, "G2/3 G2/3 A2/3 A2/3", "I vi6=D:ii6 I64 V"),
          por: "O pivô funciona, mas o c. 8 para no V de ré (lá no baixo): é semicadência no tom novo. Ré maior foi sugerido e não confirmado — falta o V → I que o estabelece." },
        { ...bin1(`${BIN1_INI} F#5/2 E5/1 F#5/3`, BIN1_BX, BIN1_C),
          por: "Modula e faz V → I em ré, mas a melodia chega ao fá♯5, a 3ª: cadência imperfeita. A confirmação do tom novo pede a tônica (ré) na melodia." },
      ],
      e: "O mi menor com sol no baixo é vi6 em sol e ii6 em ré: a pré-dominante do tom novo. Depois I64–V–I em ré, com 6–5 (fá♯5–mi5) e ré5 no tempo forte do c. 8. É a primeira das três chegadas do minueto — aberta no c. 4, fechada no tom vizinho no c. 8, fechada em casa no c. 16.",
      verificar: { perfil: { ...BASE, frm_cadencias: "erro" }, contexto: { nivel: 6, plano: {}, cadencias: [{ c: 4, tipo: "perfeita", tom: "D maior" }] } } },

    { p: "Ré maior, 3/4: a 1ª reprise terminou em lá maior. Três começos de 2ª reprise (c. 9–12) seguidos do retorno do começo (c. 13–14). Em qual o retorno soa como resolução de uma tensão acumulada?",
      o: [
        bin2("E5/1 C#5/1 E5/1 F#5/1 A5/1 F#5/1 E5/1 C#5/1 A4/1 C#5/1 E5/1 G5/1", "A2/3 A2/3 A2/3 A2/3", "V I64 V V7"),
        { ...bin2("D#5/1 F#5/1 A5/1 G5/1 E5/1 B4/1 C#5/1 E5/1 G5/1 F#5/3", "B2/3 E3/3 A2/3 D3/3", "V7/ii ii V7 I"),
          por: "A Fonte (V7/ii–ii, V7–I) é um bom padrão de 2ª reprise, mas termina na tônica no c. 12: o retorno chega 'de lado', depois de um I, sem dominante para resolver. Mais suave — típico de minuetos curtos —, mas sem a tensão pedida." },
        { ...bin2("A4/1 D5/1 F#5/1 G5/1 B4/1 D5/1 F#5/2 E5/1 D5/3", "D3/3 G2/3 A2/2 A2/1 D3/3", "I IV I64 V7 I"),
          por: "Os c. 9–12 já fecham com cadência perfeita em ré: a peça chega em casa antes do retorno, e a volta do começo soa como recomeço, não como resolução. A 2ª reprise precisa de uma parte instável (Monte, Fonte ou Ponte) que termine aberta." },
      ],
      e: "A Ponte fica quatro compassos sobre o lá (V, 6/4 de bordadura, V, V7) e sobe até o sol, a 7ª, que desce para fá♯ na primeira nota do retorno. A volta resolve a dominante prolongada: é por isso que ela soa como chegada e não como recomeço." },

    { p: "Si♭ maior, 3/4: os c. 5–8 da 1ª parte de uma peça de caráter (o c. 4 terminou em semicadência). O que acontece no fim da parte?",
      ...pc(BIN3, "I IV I IV64 I I"),
      o: [
        "Não há V: a tônica é prolongada por um 6/4 de bordadura sobre o pedal de si♭, e o fim se percebe pela melodia que desce à tônica e pela duração, não por uma cadência",
        { texto: "Cadência plagal (IV → I)", por: "O IV do c. 7 está em 6/4 sobre o pedal de si♭: é bordadura da tônica (o baixo nem se move), não uma pré-dominante com função cadencial. E o IV em estado fundamental do c. 6 vai para o I sobre o mesmo baixo, sem gesto de chegada." },
        { texto: "Cadência perfeita: o c. 8 chega ao I em estado fundamental com a tônica na melodia", por: "Cadência perfeita pede V → I. Entre o c. 5 e o c. 8 não há nenhuma dominante: só I, IV e o 6/4 de bordadura." },
        { texto: "Semicadência no c. 8", por: "A parte termina no I, não no V; e a semicadência já foi usada no c. 4." },
      ],
      e: "É a quebra do capítulo: em vez da cadência que a regra pede no fim da 1ª reprise, Schumann (Papillons nº 1, Kinderszenen nº 9, segundo o Open Music Theory) prolonga a tônica. A parte acaba, mas não 'chega' — a articulação é sentida pelo contorno, pelo registro e pela duração, como numa peça de caráter." },
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
    { p: "O tema em ré maior tem o esqueleto ré5 fá♯5 | si4 ré5 | fá♯5 mi5 | ré5 (I | IV | I64 V | I). Qual variação minore (ré menor), com a figura nota – bordadura superior – nota – ligação, está correta?",
      ...pc(VAR_TEMA, "I IV I64 V I"),
      o: [
        var1(`${VAR1_C1} Bb4 C5 Bb4 C5 D5 E5 D5 E5 F5 G5 F5 D5 E5 F5 E5 C#5 D5/4`),
        { ...var1(`${VAR1_C1} Bb4 C5 Bb4 C5 D5 E5 D5 E5 F#5 G5 F#5 D5 E5 F5 E5 C#5 D5/4`),
          por: "No c. 3 ficou fá♯5, a terça maior do tema, sobre o 6/4 de ré menor: a nota está fora do acorde (ré–fá–lá) e o esqueleto pede fá5. A minore abaixa a 3ª e a 6ª em toda parte — menos no V, que mantém o dó♯." },
        { ...var1(`${VAR1_C1} Bb4 C5 Bb4 C5 D5 E5 D5 E5 F5 G5 F5 D5 E5 F5 E5 A4 D5/4`),
          por: "No fim do c. 3 a ligação lá4 (8ª com o lá2 do baixo) salta para ré5 sobre ré3: 8ªs paralelas na chegada da cadência. E a sensível (dó♯), que a ligação devia tocar antes da tônica, some." },
        { ...var1(`${VAR1_C1} D5 C5 Bb4 C5 D5 E5 D5 E5 F5 G5 F5 D5 E5 F5 E5 C#5 D5/4`),
          por: "No 1º tempo do c. 2 entrou ré5 no lugar do si♭4. É nota do acorde, mas não a do esqueleto: o si♭ — a 3ª do iv, que dá a cor da minore — escorrega para o meio da figura, e a linha do tema (fá–si♭ do c. 1 para o c. 2) se perde." },
      ],
      e: "A figura da variação transportada para o homônimo: fá♮, si♭ e mi♮ onde o tema tinha fá♯ e si; o V conserva o dó♯, que sobe para a tônica. As bordaduras superiores caem a meio tom (si♭ sobre lá, fá sobre mi) — é isso que dá peso à minore — e as cabeças de cada grupo refazem o esqueleto ré–fá | si♭–ré | fá–mi | ré.",
      verificar: { perfil: { ...MELODIA, esqueleto_preservado: "erro" }, contexto: { nivel: 6, plano: { cadencia: 4 }, esqueleto: VAR_ESQ } } },

    { p: "Tema de 4 compassos em lá maior: I | V (semicadência) | I64 V7 | I. Três variações em colcheias, todas corretas. Qual é a melhor variação clássica deste tema?",
      ...pc(VAR2_TEMA, "I V I64 V7 I"),
      o: [
        var2("A4/0.5 B4 A4 B4 C#5 D5 C#5 A4 B4 C#5 B4 A4 G#4 A4 G#4 B4 C#5 D5 C#5 A4 B4 C#5 B4 G#4 A4/4"),
        { ...var2("A4/1 B4/0.5 C#5/0.5 C#5/0.25 D5 C#5 B4 A4/1 B4/1.5 A4/0.5 G#4/0.5 B4 E5 B4 C#5/0.5 B4 A4 C#5 B4/2 A4/4"),
          por: "Ornamentos soltos: passagem, semicolcheias em bordadura, pontuada, arpejo, escala — uma ideia por meio compasso. Sem motivo de variação, a superfície não tem unidade própria e o tema fica mais confuso do que era." },
        { ...var2("A4/0.5 B4 A4 B4 C#5 D5 C#5 A4 E5 F#5 E5 D5 C#5 D5 C#5 B4 C#5 D5 C#5 A4 B4 C#5 B4 G#4 A4/4", "A2/4 C#3/4 E3/2 E3/2 A2/4", "I I6 I64 V7 I"),
          por: "A figura é a mesma da melhor, mas o c. 2 ficou no I6 em vez de ir ao V: a semicadência do tema desaparece e a variação perde a sua primeira articulação. Schoenberg: o curso dos acontecimentos — segmentos, harmonia, cadências — não muda." },
      ],
      e: "Um motivo de variação aplicado sistematicamente (nota do esqueleto, bordadura, nota, ligação por grau), modificado só onde a harmonia pede; a harmonia, a semicadência do c. 2 e a cadência do c. 4 ficam onde estão. O tema continua audível nas cabeças de cada grupo (lá–dó♯ | si–sol♯ | dó♯–si | lá)." },

    { p: "Variações de caráter, em 3/4, sobre o tema em ré maior (I | IV | I64 V | I). Todas abandonam a melodia do tema. Qual delas ainda é uma variação deste tema?",
      ...pc(VAR_TEMA, "I IV I64 V I"),
      o: [
        var3(`${VAR3_INI} G5/2 D5/1 A4/2 E5/1 D5/3`),
        { ...var3(`${VAR3_INI} D5/2 F#5/1 F#5/2 E5/1 D5/3`, "D3/3 B2/3 A2/2 A2/1 D3/3", "I vi I64 V I"),
          por: "O c. 2 trocou o IV pelo vi (si no baixo). Sem esqueleto e sem a harmonia, do tema sobram só as cadências: a variação de caráter pode trocar a melodia justamente porque mantém o plano harmônico." },
        { ...var3(`${VAR3_INI} G5/2 D5/1 A4/2 E5/1 F#5/2 C#5/1 D5/3`, "D3/3 G2/3 A2/2 A2/1 A2/2 A2/1 D3/3", "I IV I64 V I64 V I"),
          por: "Repete o 6/4–V e passa a ter 5 compassos. A variação de caráter muda compasso, andamento, textura e melodia, mas não o número e a ordem dos segmentos: o tema tem 4." },
      ],
      e: "Do tema sobram o baixo e a harmonia (I | IV | I64 V | I), a cadência perfeita no lugar e os 4 compassos; a melodia, o compasso e o clímax (sol5, sobre o IV) são novos. É a quebra do capítulo: o ouvinte reconhece o tema pelo plano harmônico, não pela melodia." },
  ]);
})(this);
