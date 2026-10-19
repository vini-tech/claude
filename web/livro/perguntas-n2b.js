/* Perguntas de antes dos exercícios · nível 2 (b): sétimas, sequências, ritmo harmônico e esquemas.
 * Perguntas de julgamento, com partitura (par externo + cifras): escolher a versão correta, a melhor,
 * diagnosticar um trecho, decidir a continuação. Formato em docs/guia-perguntas.md. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const { TONAL } = T.perfis;

  // partitura a duas vozes
  const pt = (tom, sop, bai) => `tom: ${tom}\nsoprano: ${sop}\nbaixo: ${bai}`;
  // cifras ([tempo em semínimas, cifra]) a partir da partitura: uma por nota do baixo
  function cif(partitura, s) {
    const ex = M.lerTexto(partitura);
    const b = ex.vozes[ex.vozes.length - 1];
    const xs = s.trim().split(/\s+/);
    if (xs.length !== b.notas.length) throw new Error(`perguntas-n2b: ${xs.length} cifras para ${b.notas.length} notas do baixo em "${s}"`);
    return b.notas.map((n, i) => [n.inicio / M.T, xs[i]]);
  }
  // alternativa / enunciado com partitura e cifras
  const op = (tom, sop, bai, cifras, resto = {}) => {
    const partitura = pt(tom, sop, bai);
    return { partitura, cifras: cif(partitura, cifras), ...resto };
  };

  // perfis para trechos curtos (sem regras de peça inteira; plano vazio = sem exigência de cadência)
  const SET = { ...TONAL, notas_do_acorde: "erro", set_setima: "erro" };
  const SET_SENS = { ...SET, sensivel_resolve: "erro" };
  const SET_BARROCO = { ...SET, set_setima_preparada: "erro" };
  const SEQ = { ...SET, intervalo_melodico_aumentado_diminuto: "aviso", set_sequencia: "erro" };
  const PRINNER = [{ nome: "Prinner", inicio: 0, etapa: 2, baixo: [4, 3, 2, 1], soprano: [6, 5, 4, 3] }];

  // ================================================================ A sétima da dominante
  T.perguntas("setima_dom", [
    { p: "Ré maior: I – IV – V42 – I6 | ii65 – V7 – I, baixo e cifras iguais. Qual melodia está correta?",
      o: [
        op("D maior", "A4/1 B4 C#5 D5 D5 C#5 D5/2", "D3/1 G3 G3 F#3 G3 A2 D3/2", "I IV V42 I6 ii65 V7 I"),
        op("D maior", "A4/1 D5 G5 F#5 D5 C#5 D5/2", "D3/1 G3 G3 F#3 G3 A2 D3/2", "I IV V42 I6 ii65 V7 I",
          { por: "Sol5 dobra a 7ª do V42 (sol3): 8ªs paralelas sol → fá♯. E lá4/ré3 → ré5/sol3 são 5ªs paralelas." }),
        op("D maior", "A4/1 B4 C#5 D5 E5 G5 D5/2", "D3/1 G3 G3 F#3 G3 A2 D3/2", "I IV V42 I6 ii65 V7 I",
          { por: "Sol5 (7ª do V7) salta a ré5 em vez de descer a fá♯5." }),
        op("D maior", "A4/1 B4 C#5 D5 D5 C#5 A4/2", "D3/1 G3 G3 F#3 G3 A2 D3/2", "I IV V42 I6 ii65 V7 I",
          { por: "Dó♯5, sensível no soprano, cai a lá4: tem de subir a ré5." }),
      ],
      e: "Quem tem a 7ª? No V42, o baixo (sol3 → fá♯3), e a melodia fica com a sensível. No ii65, a melodia: ré5, preparado, desce a dó♯5.",
      verificar: { perfil: SET_SENS, contexto: { nivel: 6, plano: {} } } },

    { p: "A 7ª do V7 (si♭4) sobe a dó5 em todas. Em qual isso é a licença aceita?",
      o: [
        op("F maior", "A4/1 Bb4 C5 D5 C5 Bb4 A4/2", "F2/1 G2 A2 Bb2 C3 C3 F2/2", "I V43 I6 IV V V7 I"),
        op("F maior", "A4/1 Bb4 C5 D5 C5 Bb4 A4/2", "F2/1 E2 F2 Bb2 C3 C3 F2/2", "I V65 I IV V V7 I",
          { por: "V65 → I: baixo mi2 → fá2, sem 10ªs paralelas. Si♭4 devia descer a lá4." }),
        op("F maior", "A4/1 Bb4 C5 D5 C5 Bb4 A4/2", "F2/1 G2 F2 Bb2 C3 C3 F2/2", "I V43 I IV V V7 I",
          { por: "V43 → I com o baixo descendo: a licença exige V43 → I6, baixo e 7ª subindo em 10ªs." }),
        op("F maior", "A4/1 Bb4 C5 D5 C5 Bb4 C5/2", "F2/1 G2 A2 Bb2 C3 C3 F2/2", "I V43 I6 IV V V7 I",
          { por: "No V7 da cadência si♭4 sobe a dó5: a licença vale só no V43 → I6." }),
      ],
      e: "V43 → I6: si♭4 → dó5 em 10ªs com o baixo sol2 → lá2; descer a lá4 dobraria o baixo do I6. Só nessa posição.",
      verificar: { perfil: SET, contexto: { nivel: 6, plano: {} } } },

    { p: "A sensível sobe e a melodia termina na tônica, mas o trecho não soa resolvido. Por quê?",
      ...op("C maior", "E5/1 C5 B4 C5 D5/2 C5/2", "C3/1 F3 F3 C3 G2/2 C3/2", "I IV V42 I V I"),
      o: [
        "O baixo do V42 é a 7ª (fá3) e salta a dó3: devia descer a mi (I6)",
        { texto: "A melodia dobra a 7ª do V42", por: "A melodia tem si4 (sensível); a 7ª está só no baixo." },
        { texto: "A sensível não resolve", por: "Si4 sobe a dó5." },
        { texto: "O IV não pode ir ao V42 com o baixo parado", por: "Pode: é a 7ª preparada. Falta a resolução." },
      ],
      e: "No V42 o baixo tem a 7ª e desce um grau ao I6. Saltando a dó3, o fá fica sem resolução." },
  ]);

  // ================================================================ As sétimas da sensível
  T.perguntas("setima_sens", [
    { p: "Lá menor: i – vii°7 – i – vii°65 | i6 – vii°43 – i6 (uma versão muda o fim). Qual está correta?",
      o: [
        op("A menor", "E5/1 F5 E5 D5 C5/1 B4 C5/2", "A2/1 G#2 A2 B2 C3/1 D3 C3/2", "i vii°7 i vii°65 i6 vii°43 i6"),
        op("A menor", "E5/1 F5 E5 D5 C5/1 D5 C5/2", "A2/1 G#2 A2 B2 C3/1 F3 A2/2", "i vii°7 i vii°65 i6 vii°42 i",
          { por: "No vii°42 o baixo (7ª, fá3) salta a lá2: devia descer a mi (i64 ou V)." }),
        op("A menor", "E5/1 F5 A5 D5 C5/1 B4 C5/2", "A2/1 G#2 A2 B2 C3/1 D3 C3/2", "i vii°7 i vii°65 i6 vii°43 i6",
          { por: "Fá5, 7ª do vii°7, salta a lá5 em vez de cair a mi5; e lá5/lá2 é 8ª direta por salto." }),
        op("A menor", "E5/1 F5 E5 D5 C5/1 D5 C5/2", "A2/1 G#2 A2 B2 C3/1 D3 C3/2", "i vii°7 i vii°65 i6 vii°43 i6",
          { por: "Ré5 dobra o ré3 do vii°43: 8ªs paralelas dó → ré e ré → dó." }),
      ],
      e: "Sensível sobe, 7ª cai meio tom: fá5 → mi5 no vii°7; ré5 → dó5 no vii°65; no vii°43, si4 em movimento contrário ao baixo.",
      verificar: { perfil: SET_SENS, contexto: { nivel: 6, plano: {} } } },

    { p: "Sol menor: baixo sol–fá♯–sol, bordadura com um diminuto. O que acontece no 2º acorde?",
      ...op("G menor", "Bb4/2 C5 B4 C5 A4 G4", "G2/2 F#2 G2 A2 B2 E2", "i vii°7=e:vii°65 i6 iv V7 i"),
      o: [
        "É relido como vii°65 de mi menor: dó5 cai a si♮4, e o sol2 vira 3ª de mi menor",
        { texto: "É só uma bordadura: vii°7 → i em sol menor", por: "Sobre sol2 a melodia tem si♮4: é o i6 de mi menor, e V7 → i fecha em mi menor." },
        { texto: "A 7ª do diminuto fica sem resolver", por: "Resolve: em mi menor a 7ª é dó5 → si4. Só não vem a resolução de sol menor." },
        { texto: "É uma sequência real que sai de sol menor", por: "Não há modelo copiado: é um acorde com duas leituras enarmônicas." },
      ],
      e: "Só há três diminutos; qualquer nota pode ser a sensível. A resolução decide o tom: espera-se sol menor, chega mi menor." },

    { p: "Dó maior: I – I6 – viiø65, com lá5 (a 7ª) sobre ré3. Qual continuação está correta?",
      ...op("C maior", "E5/1 G5 A5", "C3/1 E3 D3", "I I6 viiø65"),
      o: [
        op("C maior", "E5/1 G5 A5 G5 F5/1 D5 C5/2", "C3/1 E3 D3 E3 F3/1 G3 C3/2", "I I6 viiø65 I6 IV V I"),
        op("C maior", "E5/1 G5 A5 G5 F5/1 D5 C5/2", "C3/1 E3 D3 C3 F3/1 G3 C3/2", "I I6 viiø65 I IV V I",
          { por: "Ré–lá → dó–sol: 5ªs paralelas. No viiø7 a 3ª (ré) tem de subir." }),
        op("C maior", "E5/1 G5 A5 C6 F5/1 D5 C5/2", "C3/1 E3 D3 E3 F3/1 G3 C3/2", "I I6 viiø65 I6 IV V I",
          { por: "Lá5, a 7ª, salta a dó6 em vez de descer a sol5." }),
        op("C maior", "E5/1 G5 A5 E5 F5/1 D5 C5/2", "C3/1 E3 D3 C3 F3/1 G3 C3/2", "I I6 viiø65 I IV V I",
          { por: "Evita as 5ªs abandonando a 7ª (lá5 → mi5); o certo é o baixo subir ré → mi." }),
      ],
      e: "No viiø7, ré–lá é 5ª justa: com o lá descendo, o ré sobe a mi (I6). No vii°7 (ré–lá♭, 5ª d) o problema some.",
      verificar: { perfil: SET_SENS, contexto: { nivel: 6, plano: {} } } },
  ]);

  // ================================================================ Sétimas diatônicas
  T.perguntas("setimas_diat", [
    { p: "Sol maior, estilo barroco (7ªs preparadas): I – IV65 – viiø7 – iii65 – vi7 – ii65 – V7 – I. Qual melodia está correta?",
      o: [
        op("G maior", "B4/1 B4 A4 A4 G4 G4 F#4 G4", "G3/1 E3 F#3 D3 E3 C3 D3 G2", "I IV65 viiø7 iii65 vi7 ii65 V7 I"),
        op("G maior", "B4/1 B4 A4 A4 G4 G4 A4 G4", "G3/1 E3 F#3 D3 E3 C3 D3 G2", "I IV65 viiø7 iii65 vi7 ii65 V7 I",
          { por: "Sol4, 7ª do ii65, sobe a lá4; e dó–sol → ré–lá são 5ªs paralelas." }),
        op("G maior", "G4/1 B4 A4 A4 G4 G4 F#4 G4", "G3/1 E3 F#3 D3 E3 C3 D3 G2", "I IV65 viiø7 iii65 vi7 ii65 V7 I",
          { por: "Si4, 7ª do IV65, entra por salto, sem preparação." }),
        op("G maior", "B4/1 B4 A4 A4 A4 G4 F#4 G4", "G3/1 E3 F#3 D3 E3 C3 D3 G2", "I IV65 viiø7 iii65 vi7 ii65 V7 I",
          { por: "Lá4, 7ª do iii65, fica parada sobre o vi7; a resolução atrasa e o ii65 fica sem preparação." }),
      ],
      e: "A 3ª de cada acorde é a 7ª do seguinte: a melodia repete a nota e desce um grau (si–si, lá–lá, sol–sol, fá♯–sol).",
      verificar: { perfil: SET_BARROCO, contexto: { nivel: 6, plano: {} } } },

    { p: "Aqui as 7ªs sobem todas até o V7. Por que é estilo, e não erro?",
      ...op("D maior", "C#5/1 D5 E5 F#5 G5/2 F#5/2", "D3/1 E3 F#3 G3 A3/2 D3/2", "I7 ii7 iii7 IV7 V7 I"),
      o: [
        "É planing: a 7ª é cor do acorde, não voz a resolver; no V7 → I a resolução volta",
        { texto: "Porque as 7ªs estão preparadas", por: "Dó♯5 abre o trecho, e as seguintes entram por grau, sem nota comum." },
        { texto: "Porque são 7ªs de passagem (8–7)", por: "A 7ª de passagem desce da 8ª sobre o mesmo baixo; aqui sobe junto com o baixo." },
        { texto: "Porque vale a licença do V43", por: "Só vale no V43 → I6; estes acordes não são dominantes." },
      ],
      e: "Impressionismo (Debussy, Ravel): a 7ª vira timbre. Funciona por ser sistemático e porque a cadência devolve a gramática." },

    { p: "Cadeia correta, sete acordes de sétima nas cifras, mas o par externo soa como tríades. Por quê?",
      ...op("G maior", "D5/2 C5 C5 B4 B4 A4 A4 G4/4", "G2/2 E2 F#2 D2 E2 C2 D2 G2/4", "I IV65 viiø7 iii65 vi7 ii65 V7 I"),
      o: [
        "Nenhuma 7ª no par externo: a melodia só tem fundamentais e 5ªs; as 7ªs ficam nas vozes internas",
        { texto: "Faltam as resoluções das 7ªs", por: "Não há 7ª no par externo para resolver; nas internas, elas resolvem." },
        { texto: "O baixo devia ir só em fundamentais", por: "Alternar 7 e 65 evita o trítono; quem esconde as 7ªs é a melodia." },
        { texto: "Há 5ªs paralelas escondidas na cadeia", por: "As 5ªs nunca são consecutivas e chegam por movimento oblíquo." },
      ],
      e: "Com si–si–lá–lá–sol–sol–fá♯–sol a melodia carrega as 7ªs. A cifra diz que elas existem; a melodia decide se se ouvem." },
  ]);

  // ================================================================ Sequências
  T.perguntas("sequencias", [
    { p: "Sol maior. Modelo no c. 1 (baixo sobe 4ª, melodia um grau); três cópias, a última é a cadência. Qual está correta?",
      o: [
        op("G maior", "B4/2 C5 A4 B4 G4 A4 F#4 G4", "G3/2 C4 F#3 B3 E3 A3 D3 G3", "I IV vii° iii vi ii V I"),
        op("G maior", "B4/2 C5 A4 B4 B4 A4 F#4 G4", "G3/2 C4 F#3 B3 E3 A3 D3 G3", "I IV vii° iii vi ii V I",
          { por: "Na 2ª cópia (c. 3) a melodia desce (si4 → lá4) onde o modelo sobe." }),
        op("G maior", "D5/2 G5 C5 F#5 B4 E5 A4 D5", "G3/2 C4 F#3 B3 E3 A3 D3 G3", "I IV vii° iii vi ii V I",
          { por: "O modelo tem 5ªs paralelas (sol–ré → dó–sol), repetidas em cada cópia." }),
        op("G maior", "B4/2 C5 C5 D5 G4 A4 F#4 G4", "G3/2 C4 F#3 B3 E3 A3 D3 G3", "I IV vii° iii vi ii V I",
          { por: "Na 1ª cópia baixo e melodia são transpostos por intervalos diferentes: 10ª → 8ª vira 5ª d → 10ª." }),
      ],
      e: "Cada cópia repete o modelo voz por voz, um grau abaixo (10ª → 8ª). O trítono dó4 → fá♯3 vem do padrão diatônico.",
      verificar: { perfil: SEQ, contexto: { nivel: 6, plano: {}, sequencia: { modelo: [0, 4], copias: 3 } } } },

    { p: "Fá maior: lá7 → ré7, sol7 → dó7, I. No c. 2, fá♯4 (3ª de ré7) desce a fá♮. Erro de condução?",
      ...op("F maior", "A4/2 G4 F#4 F4 E4 F4", "F3/2 A3 D3 G3 C3 F3", "I V7/vi V7/ii V7/V V7 I"),
      o: [
        "Não: a cópia é real; cada 7ª desce, e fá♯ → fá♮ é o cromatismo que o padrão exige",
        { texto: "Sim: a sensível de uma dominante secundária sempre sobe", por: "Só sobe se o acorde vai à sua tônica; aqui ré7 vai a sol7, e a cópia exata manda." },
        { texto: "Não, porque é uma sequência diatônica", por: "Diatônica teria sol menor e si♭; o si♮ e o fá♯ → fá mostram cópia real." },
        { texto: "Sim: há 5ªs paralelas entre os elos", por: "Intervalos 3ª–7ª–10ª–7ª–10ª–8ª: nenhuma 5ª seguida." },
      ],
      e: "A sequência real sai do tom de propósito (dominantes românticas); o padrão faz o cromatismo soar lógico." },

    { p: "Minueto em sol maior, após a barra dupla: três compassos antes da volta do tema (na tônica). Qual prepara melhor a volta?",
      o: [
        op("G maior", "D5/2 F5 E5 G5 F#5/4", "G2/2 B2 C3 C#3 D3/4", "I V65/IV IV V65/V V", { texto: "Monte" }),
        op("G maior", "D5/2 D5 C5 C5 B4/4", "B2/2 G#2 A2 F#2 G2/4", "I6 V65/ii ii V65 I",
          { texto: "Fonte", por: "Desce e termina na tônica: o tema entraria sobre a tônica recém-ouvida. Após um Fonte, prepare a volta com uma Ponte." }),
        op("G maior", "D5/2 E5 C5 D5 B4/4", "B2/2 E3 A2 D3 G2/4", "iii vi ii V I",
          { texto: "Quintas descendentes", por: "Fecha com V–I: a volta soaria como recomeço, não como chegada." }),
      ],
      e: "O Monte sobe um grau por elo e para no V; a volta do tema resolve esse V." },
  ]);

  // ================================================================ Ritmo harmônico e cadência
  T.perguntas("ritmo", [
    { p: "Fim de frase em sol maior, cadência perfeita no c. 3. Qual está correta?",
      o: [
        op("G maior", "B4/2 C5 B4 A4 G4/4", "G3/2 C3 D3 D3 G3/4", "I IV I64 V I"),
        op("G maior", "B4/2 C5/1 B4/1 A4/4 G4/4", "G3/2 C3/1 D3/1 D3/4 G3/4", "I IV I64 V I",
          { por: "I64 no 4º tempo e V no 1º: a apojatura fica no tempo fraco e a resolução no forte." }),
        op("G maior", "B4/2 A4 C5 A4 G4/4", "G3/2 D3 C3 D3 G3/4", "I V IV V I",
          { por: "V → IV (c. 1–2): retrogressão; o V seguinte soa como recomeço." }),
        op("G maior", "B4/2 C5 B4 A4 B4/4", "G3/2 C3 D3 D3 G3/4", "I IV I64 V I",
          { por: "Termina em si4 (3ª): cadência imperfeita, não a perfeita pedida." }),
      ],
      e: "I64 no 1º tempo, V no 3º: a dissonância no tempo forte, e o I no forte seguinte.",
      verificar: { perfil: { ...TONAL }, contexto: { nivel: 6, plano: { cadencia: 3 } } } },

    { p: "Mesma melodia, três baixos, todos corretos. Com qual a cadência 'chega' melhor?",
      o: [
        op("C maior", "E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4", "C3/4 F3/4 E3/1 F3/1 G3/1 G3/1 C3/4", "I IV I6 ii6 I64 V I", { texto: "1 – 1 – 4 – 1 acordes por compasso" }),
        op("C maior", "E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4", "C3/4 F3/4 G3/4 C3/4", "I IV V7 I",
          { texto: "1 – 1 – 1 – 1", por: "Um acorde por compasso: o V7 vem no mesmo passo, sem aceleração." }),
        op("C maior", "E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4", "C3/1 A2/1 E3/1 C3/1 F3/1 D3/1 F3/1 D3/1 G3/4 C3/4", "I vi I6 I IV ii IV ii V7 I",
          { texto: "4 – 4 – 1 – 1", por: "O ritmo harmônico desacelera: a energia se gasta no início." }),
      ],
      e: "Começo lento e aceleração no c. 3 (um acorde por tempo), com o 6/4 no 3º tempo: a aceleração anuncia a cadência." },

    { p: "Correto acorde por acorde, mas a cadência soa fraca. Por quê?",
      ...op("C maior", "E5/2 C5 G5 F5 D5 C5", "C3/2 F3 E3 F3 G3 C3", "I IV I6 ii6 V I"),
      o: [
        "O I final cai no 3º tempo, mais fraco que o do V: a resolução fica no tempo fraco",
        { texto: "Falta a aceleração do ritmo harmônico", por: "O ritmo é constante; o problema é a métrica da chegada." },
        { texto: "O 6/4 cadencial está no tempo fraco", por: "Não há 6/4: a cadência é ii6 → V → I." },
        { texto: "A melodia não termina na tônica", por: "Termina em dó5 sobre dó3; o que enfraquece é o lugar métrico." },
      ],
      e: "A chegada cai num tempo mais forte que o V. A 'terminação feminina' (polonaise) é exceção de gênero." },
  ]);

  // ================================================================ Esquemas galantes
  T.perguntas("esquemas", [
    { p: "Fá maior: Prinner em mínimas (soprano 6–5–4–3, baixo 4–3–2–1). Qual está bem conduzido?",
      o: [
        op("F maior", "D5/2 C5 Bb4 A4", "Bb2/2 A2 G2 F2", "IV I6 vii°6 I"),
        op("F maior", "D5/2 C5 Bb4 A4", "D3/2 C3 Bb2 A2", "vi V IV I6",
          { por: "Baixo em 8ªs com o soprano (8ªs paralelas) e V → IV. O Prinner é em 10ªs." }),
        op("F maior", "F5/2 E5 D5 C5", "Bb2/2 A2 G2 F2", "IV iii ii I",
          { por: "Soprano 1–7–6–5 uma 5ª acima do baixo: 5ªs paralelas e graus errados." }),
        op("F maior", "D5/2 C5 Bb4 A4", "Bb2/2 A2 C3 F2", "IV I6 V7 I",
          { por: "Sem erro, mas o baixo salta a 5̂ na 3ª etapa: vira cadência, não Prinner." }),
      ],
      e: "Ré–dó–si♭–lá sobre si♭–lá–sol–fá: 10ªs paralelas, IV – I6 – vii°6 – I. O resto é diminuição.",
      verificar: { perfil: { ...TONAL, esquema: "erro" }, contexto: { nivel: 6, plano: {}, esquemas: PRINNER } } },

    { p: "Sol maior, quatro compassos, mesma cadência; todas corretas. Qual tem a gramática galante mais convincente?",
      o: [
        op("G maior", "G4/1 A4 B4/2 E5/1 D5 C5 B4 C5/2 A4/2 G4/4", "G2/1 F#2 G2/2 C3/1 B2 A2 G2 C3/2 D3/2 G2/4", "I V6 I IV I6 vii°6 I ii6 V I",
          { texto: "Do-Re-Mi → Prinner → cadência" }),
        op("G maior", "G4/1 A4 B4/2 G4/1 A4 B4/2 C5/2 A4/2 G4/4", "G2/1 F#2 G2/2 G2/1 F#2 G2/2 C3/2 D3/2 G2/4", "I V6 I I V6 I ii6 V I",
          { texto: "Do-Re-Mi → Do-Re-Mi → cadência", por: "Abertura dita duas vezes, sem resposta: dois compassos parados na tônica." }),
        op("G maior", "E5/1 D5 C5 B4 G4/1 A4 B4/2 C5/2 A4/2 G4/4", "C3/1 B2 A2 G2 G2/1 F#2 G2/2 C3/2 D3/2 G2/4", "IV I6 vii°6 I I V6 I ii6 V I",
          { texto: "Prinner → Do-Re-Mi → cadência", por: "Resposta antes da pergunta: começa no IV, e o Do-Re-Mi soa como recomeço." }),
      ],
      e: "Abertura (Do-Re-Mi), resposta (Prinner) e cadência, cada esquema na sua função." },

    { p: "Prinner em sol maior diminuído em semínimas (etapas no 1º e 3º tempos). Qual diminuição ainda é correta?",
      o: [
        op("G maior", "E5/1 C5 D5/1 B4 C5/1 A4 B4/2", "C3/2 B2 A2 G2", "IV I6 vii°6 I"),
        op("G maior", "C5/1 E5 B4/1 D5 A4/1 C5 G4/2", "C3/2 B2 A2 G2", "IV I6 vii°6 I",
          { por: "Nas etapas o soprano faz 4–3–2–1, dobrando o baixo em 8ªs por salto." }),
        op("G maior", "E5/1 A5 D5/1 B4 C5/1 A4 B4/2", "C3/2 B2 A2 G2", "IV I6 vii°6 I",
          { por: "Lá5 (2º tempo) não pertence ao IV e entra e sai por salto." }),
      ],
      e: "Etapas mi–ré–dó–si sobre dó–si–lá–sol (10ªs); entre elas, notas do acorde ou notas por grau.",
      verificar: { perfil: { ...TONAL, notas_do_acorde: "erro", esquema: "erro" }, contexto: { nivel: 6, plano: {}, esquemas: PRINNER } } },
  ]);
})(this);
