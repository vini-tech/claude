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
    { p: "Ré maior, dois compassos: I – IV – V42 – I6 | ii65 – V7 – I. O baixo e as cifras são iguais nas quatro versões. Qual melodia está correta?",
      o: [
        op("D maior", "A4/1 B4 C#5 D5 D5 C#5 D5/2", "D3/1 G3 G3 F#3 G3 A2 D3/2", "I IV V42 I6 ii65 V7 I"),
        op("D maior", "A4/1 D5 G5 F#5 D5 C#5 D5/2", "D3/1 G3 G3 F#3 G3 A2 D3/2", "I IV V42 I6 ii65 V7 I",
          { por: "Sol5 sobre o V42 dobra a 7ª, que já está no baixo (sol3): as duas descem a fá♯ juntas, em 8ªs paralelas (sol–sol → fá♯–fá♯). E o começo já tinha 5ªs paralelas: lá4/ré3 → ré5/sol3." }),
        op("D maior", "A4/1 B4 C#5 D5 E5 G5 D5/2", "D3/1 G3 G3 F#3 G3 A2 D3/2", "I IV V42 I6 ii65 V7 I",
          { por: "Sol5 é a 7ª do V7 e salta uma 4ª para ré5 em vez de descer a fá♯5: a melodia chega à tônica, mas a dissonância mais exposta do trecho fica sem resolução." }),
        op("D maior", "A4/1 B4 C#5 D5 D5 C#5 A4/2", "D3/1 G3 G3 F#3 G3 A2 D3/2", "I IV V42 I6 ii65 V7 I",
          { por: "Dó♯5, a sensível no soprano, cai para lá4 quando o baixo chega à tônica: na voz de cima ela tem de subir a ré5. A cadência termina na 5ª e perde a sua nota de tendência mais forte." }),
      ],
      e: "Quem tem a 7ª em cada acorde de sétima? No V42 é o baixo (sol3 → fá♯3), e a melodia fica com a sensível (dó♯5 → ré5) sem dobrá-lo; no ii65 é a melodia: ré5, preparado pelo ré5 do I6, desce a dó♯5 sobre o V7, e a sensível sobe à tônica.",
      verificar: { perfil: SET_SENS, contexto: { nivel: 6, plano: {} } } },

    { p: "A 7ª do V7 sobe em todas as versões (si♭4 → dó5). Em qual dessas subidas ela é a licença que o estilo aceita?",
      o: [
        op("F maior", "A4/1 Bb4 C5 D5 C5 Bb4 A4/2", "F2/1 G2 A2 Bb2 C3 C3 F2/2", "I V43 I6 IV V V7 I"),
        op("F maior", "A4/1 Bb4 C5 D5 C5 Bb4 A4/2", "F2/1 E2 F2 Bb2 C3 C3 F2/2", "I V65 I IV V V7 I",
          { por: "No V65 → I o baixo sobe mi2 → fá2 (a sensível): não há 10ªs paralelas que expliquem a 7ª subindo. Si♭4 devia descer a lá4; subindo a dó5, a dissonância fica sem resolução." }),
        op("F maior", "A4/1 Bb4 C5 D5 C5 Bb4 A4/2", "F2/1 G2 F2 Bb2 C3 C3 F2/2", "I V43 I IV V V7 I",
          { por: "É um V43, mas o baixo volta a fá2 (V43 → I, bordadura): a melodia sobe enquanto o baixo desce. A licença exige V43 → I6, com o baixo subindo 2̂ → 3̂ e a 7ª subindo junto em 10ªs." }),
        op("F maior", "A4/1 Bb4 C5 D5 C5 Bb4 C5/2", "F2/1 G2 A2 Bb2 C3 C3 F2/2", "I V43 I6 IV V V7 I",
          { por: "O V43 → I6 do primeiro compasso está certo, mas na cadência si♭4 é a 7ª do V7 (de passagem, 8–7) e sobe a dó5. A licença vale só no V43 → I6; no V7 → I a 7ª desce, sempre." }),
      ],
      e: "Si♭4 sobe a dó5 enquanto o baixo vai de sol2 a lá2: quatro 10ªs paralelas (fá–lá, sol–si♭, lá–dó, si♭–ré). Descer a lá4 dobraria a 3ª do I6, que está no baixo. É a única exceção corrente, e só nessa posição; na cadência a outra 7ª (si♭4 sobre o V7) volta a descer.",
      verificar: { perfil: SET, contexto: { nivel: 6, plano: {} } } },

    { p: "Este trecho não soa resolvido, embora a sensível suba e a melodia termine na tônica. Qual é o problema?",
      ...op("C maior", "E5/1 C5 B4 C5 D5/2 C5/2", "C3/1 F3 F3 C3 G2/2 C3/2", "I IV V42 I V I"),
      o: [
        "O baixo do V42 é a própria 7ª (fá3) e salta para dó3: a dissonância nunca resolve. O V42 pede o I6 (fá → mi)",
        { texto: "A melodia dobra a 7ª do V42", por: "Sobre o V42 a melodia tem si4, a sensível; a 7ª (fá) só está no baixo." },
        { texto: "A sensível não resolve", por: "Si4 sobe a dó5 no fim do compasso 1, como deve." },
        { texto: "O IV não pode ir ao V42 com o baixo parado", por: "Pode, e é a maneira mais estrita: o fá do IV fica e vira 7ª. A 7ª está preparada; o que falta é a resolução." },
      ],
      e: "A pergunta de sempre: quem tem a 7ª? No V42, o baixo. Ele obedece à 7ª e desce um grau, e o acorde de chegada é o I6. O salto fá3 → dó3 troca a resolução por uma tônica em estado fundamental, e o fá fica sem resposta." },
  ]);

  // ================================================================ As sétimas da sensível
  T.perguntas("setima_sens", [
    { p: "Lá menor: i – vii°7 – i – vii°65 | i6 – vii°43 – i6 (uma das versões muda o fim do baixo). Qual está correta?",
      o: [
        op("A menor", "E5/1 F5 E5 D5 C5/1 B4 C5/2", "A2/1 G#2 A2 B2 C3/1 D3 C3/2", "i vii°7 i vii°65 i6 vii°43 i6"),
        op("A menor", "E5/1 F5 E5 D5 C5/1 D5 C5/2", "A2/1 G#2 A2 B2 C3/1 F3 A2/2", "i vii°7 i vii°65 i6 vii°42 i",
          { por: "No vii°42 o baixo é a 7ª (fá3) e salta para lá2. Ele tem de descer meio tom a mi, o que leva ao i64 cadencial ou ao V, nunca direto ao i." }),
        op("A menor", "E5/1 F5 A5 D5 C5/1 B4 C5/2", "A2/1 G#2 A2 B2 C3/1 D3 C3/2", "i vii°7 i vii°65 i6 vii°43 i6",
          { por: "Fá5, a 7ª diminuta do vii°7, salta para lá5 em vez de cair meio tom a mi5. A dissonância mais carregada fica pendurada, e lá5 sobre lá2 chega por movimento direto e salto (8ª direta)." }),
        op("A menor", "E5/1 F5 E5 D5 C5/1 D5 C5/2", "A2/1 G#2 A2 B2 C3/1 D3 C3/2", "i vii°7 i vii°65 i6 vii°43 i6",
          { por: "Ré5 dobra o ré3 do vii°43 (o 4̂, que tende a descer): as duas vozes sobem juntas de dó a ré e descem juntas a dó, 8ªs paralelas na ida e na volta." }),
      ],
      e: "As duas dissonâncias resolvem sempre igual: a sensível (sol♯) sobe, a 7ª (fá) cai meio tom. Fá5 → mi5 sobre o vii°7; ré5 (o 4̂) → dó5 sobre o vii°65; sobre o vii°43 a melodia fica com si4, movendo-se em movimento contrário ao baixo ré → dó.",
      verificar: { perfil: SET_SENS, contexto: { nivel: 6, plano: {} } } },

    { p: "Sol menor. O baixo faz sol–fá♯–sol, uma bordadura da tônica com um diminuto no meio. Ouça a melodia e o fim. O que acontece no 2º acorde?",
      ...op("G menor", "Bb4/2 C5 B4 C5 A4 G4", "G2/2 F#2 G2 A2 B2 E2", "i vii°7=e:vii°65 i6 iv V7 i"),
      o: [
        "O fá♯–lá–dó–mi♭ é relido como ré♯–fá♯–lá–dó, vii°65 de mi menor: o dó5 (agora a 7ª) cai em si♮4, e o sol2 que volta é a 3ª de mi menor (i6), não a tônica de sol",
        { texto: "É só uma bordadura: vii°7 → i em sol menor", por: "Sobre o sol2 a melodia tem si♮4, não si♭: o acorde é mi–sol–si (i6 de mi menor), e a cadência V7 → i fecha em mi menor." },
        { texto: "A 7ª do diminuto fica sem resolver", por: "Ela resolve: na leitura de mi menor a 7ª é o dó5, que desce a si4. O que não acontece é a resolução esperada em sol menor (mi♭ → ré)." },
        { texto: "É uma sequência real que sai de sol menor", por: "Não há modelo copiado em outro grau: é um único acorde com duas leituras enarmônicas." },
      ],
      e: "O vii°7 divide a oitava em quatro 3ªs menores, e qualquer das suas notas pode ser a sensível: há só três diminutos diferentes. Quem decide o tom é a resolução. Aqui o ouvido espera sol menor e recebe mi menor. É o uso 'de efeito' do diminuto e a porta da modulação enarmônica." },

    { p: "Dó maior: I – I6 – viiø65… O primeiro compasso para no lá5, a 7ª do viiø65 sobre ré3. Qual continuação está correta?",
      ...op("C maior", "E5/1 G5 A5", "C3/1 E3 D3", "I I6 viiø65"),
      o: [
        op("C maior", "E5/1 G5 A5 G5 F5/1 D5 C5/2", "C3/1 E3 D3 E3 F3/1 G3 C3/2", "I I6 viiø65 I6 IV V I"),
        op("C maior", "E5/1 G5 A5 G5 F5/1 D5 C5/2", "C3/1 E3 D3 C3 F3/1 G3 C3/2", "I I6 viiø65 I IV V I",
          { por: "Ré3–lá5 é uma 5ª justa; com o lá descendo a sol e o ré descendo a dó, ré–lá → dó–sol são 5ªs paralelas. No viiø7 a 3ª (ré) tem de subir." }),
        op("C maior", "E5/1 G5 A5 C6 F5/1 D5 C5/2", "C3/1 E3 D3 E3 F3/1 G3 C3/2", "I I6 viiø65 I6 IV V I",
          { por: "O baixo resolve bem (ré → mi), mas lá5, a 7ª, salta para dó6 em vez de descer a sol5." }),
        op("C maior", "E5/1 G5 A5 E5 F5/1 D5 C5/2", "C3/1 E3 D3 C3 F3/1 G3 C3/2", "I I6 viiø65 I IV V I",
          { por: "Evita as 5ªs do jeito errado: com o baixo indo a dó, a melodia foge para mi5 e abandona a 7ª (lá5 → mi5). As 5ªs se evitam mudando o baixo (ré → mi), não largando a dissonância." }),
      ],
      e: "No viiø7 a 3ª e a 7ª (ré–lá) estão a uma 5ª justa. Com o lá obrigado a descer, o ré tem de subir a mi: o I chega em 1ª inversão (ou com a 3ª dobrada a quatro vozes). No vii°7 a mesma relação é uma 5ª diminuta (ré–lá♭), e o problema desaparece.",
      verificar: { perfil: SET_SENS, contexto: { nivel: 6, plano: {} } } },
  ]);

  // ================================================================ Sétimas diatônicas
  T.perguntas("setimas_diat", [
    { p: "Sol maior, à maneira barroca (toda 7ª preparada): a cadeia de quintas I – IV65 – viiø7 – iii65 – vi7 – ii65 – V7 – I. Qual melodia está correta?",
      o: [
        op("G maior", "B4/1 B4 A4 A4 G4 G4 F#4 G4", "G3/1 E3 F#3 D3 E3 C3 D3 G2", "I IV65 viiø7 iii65 vi7 ii65 V7 I"),
        op("G maior", "B4/1 B4 A4 A4 G4 G4 A4 G4", "G3/1 E3 F#3 D3 E3 C3 D3 G2", "I IV65 viiø7 iii65 vi7 ii65 V7 I",
          { por: "Sol4, 7ª do ii65, sobe a lá4 em vez de descer a fá♯4. Com o baixo dó3 → ré3, isso ainda dá 5ªs paralelas (dó–sol → ré–lá)." }),
        op("G maior", "G4/1 B4 A4 A4 G4 G4 F#4 G4", "G3/1 E3 F#3 D3 E3 C3 D3 G2", "I IV65 viiø7 iii65 vi7 ii65 V7 I",
          { por: "Si4, a 7ª do IV65, entra por salto (sol4 → si4), sem ter soado no acorde anterior. No estilo estrito a 7ª nasce de uma nota comum, como um retardo." }),
        op("G maior", "B4/1 B4 A4 A4 A4 G4 F#4 G4", "G3/1 E3 F#3 D3 E3 C3 D3 G2", "I IV65 viiø7 iii65 vi7 ii65 V7 I",
          { por: "Lá4, 7ª do iii65, fica parada sobre o vi7, onde nem pertence ao acorde. A resolução (sol4) chega atrasada, já sobre o ii65, e aí vira uma 7ª sem preparação." }),
      ],
      e: "Na cadeia de quintas a 3ª de cada acorde é a 7ª do seguinte: a melodia repete a nota (consonante, depois dissonante) e desce um grau. Si–si, lá–lá, sol–sol, fá♯–sol: cada 7ª preparada e resolvida, e a corrente se encadeia sozinha.",
      verificar: { perfil: SET_BARROCO, contexto: { nivel: 6, plano: {} } } },

    { p: "Aqui as 7ªs sobem todas, uma depois da outra, até o V7. Por que isso funciona como estilo, e não como erro?",
      ...op("D maior", "C#5/1 D5 E5 F#5 G5/2 F#5/2", "D3/1 E3 F#3 G3 A3/2 D3/2", "I7 ii7 iii7 IV7 V7 I"),
      o: [
        "Os acordes deslizam em paralelo (planing): a 7ª não é uma voz que precisa ir a algum lugar, é cor do acorde. No V7 → I o tratamento clássico volta (sol5 → fá♯5), e o contraste mostra o que o planing suspendeu",
        { texto: "Porque as 7ªs estão preparadas", por: "Dó♯5 sobre ré3 é o primeiro acorde, sem nada antes; e as seguintes entram por grau ascendente, sem nota comum." },
        { texto: "Porque são 7ªs de passagem (8–7)", por: "Uma 7ª de passagem desce da 8ª sobre o mesmo baixo. Aqui a melodia sobe junto com o baixo, sempre a uma 7ª dele." },
        { texto: "Porque vale a licença do V43", por: "A licença vale só para o V43 → I6 com o baixo subindo. Estes acordes estão em estado fundamental e não são dominantes." },
      ],
      e: "É a quebra do capítulo: no impressionismo (Debussy, Ravel) a 7ª vira timbre, e o acorde se move como uma linha engrossada. Perde-se a corrente de tensões da cadeia barroca e ganha-se cor. Funciona porque é sistemático (todas as vozes em paralelo) e porque a cadência devolve a gramática." },

    { p: "A cadeia está correta e as cifras pedem sete acordes de sétima. Mas, tocado só o par externo, o trecho soa como uma cadeia de tríades. Por quê?",
      ...op("G maior", "D5/2 C5 C5 B4 B4 A4 A4 G4/4", "G2/2 E2 F#2 D2 E2 C2 D2 G2/4", "I IV65 viiø7 iii65 vi7 ii65 V7 I"),
      o: [
        "Nenhuma 7ª está no par externo: a melodia só tem fundamentais e 5ªs (dó sobre o IV65, si sobre o iii65, lá sobre o ii65…), e a preparação e a resolução das 7ªs ficam todas nas vozes internas",
        { texto: "Faltam as resoluções das 7ªs", por: "Não há 7ª na melodia nem no baixo para resolver. Nas vozes internas, implícitas, elas resolvem normalmente." },
        { texto: "O baixo devia ir só em fundamentais", por: "Com 7 e 65 alternados o baixo anda quase por grau e evita o trítono. Isso não esconde as 7ªs; o que as esconde é a melodia." },
        { texto: "Há 5ªs paralelas escondidas na cadeia", por: "As 5ªs (si4/mi2, lá4/ré2) nunca são consecutivas e chegam por movimento oblíquo, com a melodia parada." },
      ],
      e: "Compare com si–si–lá–lá–sol–sol–fá♯–sol sobre o mesmo baixo: ali a melodia carrega a 3ª que vira 7ª, e cada elo puxa o seguinte. A cifra diz que as sétimas existem; é a melodia que decide se elas se ouvem." },
  ]);

  // ================================================================ Sequências
  T.perguntas("sequencias", [
    { p: "Sol maior. Modelo: o compasso 1 (baixo sobe uma 4ª, melodia sobe um grau). Três cópias em quintas descendentes, a última é a cadência. Qual está correta?",
      o: [
        op("G maior", "B4/2 C5 A4 B4 G4 A4 F#4 G4", "G3/2 C4 F#3 B3 E3 A3 D3 G3", "I IV vii° iii vi ii V I"),
        op("G maior", "B4/2 C5 A4 B4 B4 A4 F#4 G4", "G3/2 C4 F#3 B3 E3 A3 D3 G3", "I IV vii° iii vi ii V I",
          { por: "Na 2ª cópia (c. 3) a melodia faz si4 → lá4, descendo, onde o modelo subia um grau. O ouvido perde o padrão justamente na cópia que devia confirmá-lo." }),
        op("G maior", "D5/2 G5 C5 F#5 B4 E5 A4 D5", "G3/2 C4 F#3 B3 E3 A3 D3 G3", "I IV vii° iii vi ii V I",
          { por: "O modelo já tem 5ªs paralelas (sol–ré → dó–sol): a melodia copia o baixo uma 5ª acima, e a sequência repete as paralelas em todas as cópias. Se o modelo é sujo, a cópia é suja." }),
        op("G maior", "B4/2 C5 C5 D5 G4 A4 F#4 G4", "G3/2 C4 F#3 B3 E3 A3 D3 G3", "I IV vii° iii vi ii V I",
          { por: "Na 1ª cópia o baixo desce um grau (fá♯3), mas a melodia sobe (dó5–ré5): as vozes foram transpostas por intervalos diferentes. O contraponto 10ª → 8ª do modelo vira 5ª diminuta → 10ª, e a cópia deixa de ser cópia." }),
      ],
      e: "Cada cópia repete o modelo inteiro, voz por voz, um grau abaixo: 10ª → 8ª, baixo subindo uma 4ª e melodia um grau. O trítono dó4 → fá♯3 no baixo é consequência do padrão diatônico, e o ouvido o aceita porque já reconheceu o modelo.",
      verificar: { perfil: SEQ, contexto: { nivel: 6, plano: {}, sequencia: { modelo: [0, 4], copias: 3 } } } },

    { p: "Fá maior: lá7 → ré7, depois sol7 → dó7, e o I. No c. 2 o fá♯4, a 3ª de ré7 e 'sensível' de sol, desce a fá♮ em vez de subir. Erro de condução?",
      ...op("F maior", "A4/2 G4 F#4 F4 E4 F4", "F3/2 A3 D3 G3 C3 F3", "I V7/vi V7/ii V7/V V7 I"),
      o: [
        "Não: a cópia é real (sol7 → dó7 repete lá7 → ré7 um tom abaixo, semitom por semitom). Cada 7ª desce (sol4 → fá♯4, fá4 → mi4), e o fá♯ → fá♮ é o semitom cromático que o padrão exige e que traz a música de volta ao tom",
        { texto: "Sim: a sensível de uma dominante secundária sempre sobe", por: "Ela sobe quando o acorde resolve na sua tônica. Aqui o ré7 não vai a sol menor, vai a sol7: a cópia exata manda, e o fá♯ é abandonado de propósito." },
        { texto: "Não, porque é uma sequência diatônica", por: "Diatônica manteria as notas de fá maior (sol menor com 7ª, si♭). O si♮ do sol7 e o semitom fá♯ → fá mostram que a cópia é exata: real." },
        { texto: "Sim: há 5ªs paralelas entre os elos", por: "Os intervalos são 3ª–7ª–10ª–7ª–10ª–8ª: não há duas 5ªs seguidas." },
      ],
      e: "É a quebra do capítulo: a sequência real sai do tom e é usada justamente para isso, como nas cadeias de dominantes românticas. O ouvido segue o padrão e aceita o cromatismo que, fora dele, soaria como erro." },

    { p: "Minueto em sol maior, logo depois da barra dupla. Estes três compassos vêm antes da volta do tema, que começa na tônica, e a volta deve soar como chegada. Todas estão corretas. Qual prepara melhor a volta?",
      o: [
        op("G maior", "D5/2 F5 E5 G5 F#5/4", "G2/2 B2 C3 C#3 D3/4", "I V65/IV IV V65/V V", { texto: "Monte" }),
        op("G maior", "D5/2 D5 C5 C5 B4/4", "B2/2 G#2 A2 F#2 G2/4", "I6 V65/ii ii V65 I",
          { texto: "Fonte", por: "O Fonte desce (ii, depois I) e para na tônica: a tensão se desfaz antes da volta, e o tema entra sobre a tônica que acabou de soar. Funciona melhor como relaxamento no meio da seção, não como preparação." }),
        op("G maior", "D5/2 E5 C5 D5 B4/4", "B2/2 E3 A2 D3 G2/4", "iii vi ii V I",
          { texto: "Quintas descendentes", por: "A cadeia de quintas chega ao I por V–I: é um fechamento, e a volta do tema soaria como mais um começo depois de um fim, não como chegada." }),
      ],
      e: "O Monte sobe um grau por elo (V65/IV → IV, V65/V → V; uma cópia real) e para na dominante. A tensão cresce, e a volta do tema resolve esse V: é a montanha que se sobe antes de chegar. Sequência com destino." },
  ]);

  // ================================================================ Ritmo harmônico e cadência
  T.perguntas("ritmo", [
    { p: "Fim de frase em sol maior, com cadência perfeita no c. 3. Qual está correta?",
      o: [
        op("G maior", "B4/2 C5 B4 A4 G4/4", "G3/2 C3 D3 D3 G3/4", "I IV I64 V I"),
        op("G maior", "B4/2 C5/1 B4/1 A4/4 G4/4", "G3/2 C3/1 D3/1 D3/4 G3/4", "I IV I64 V I",
          { por: "O I64 cai no 4º tempo e o V no 1º do compasso seguinte: a dupla apojatura fica no tempo fraco e a resolução no forte. Soa como se a tônica viesse cedo demais e o V fosse a chegada." }),
        op("G maior", "B4/2 A4 C5 A4 G4/4", "G3/2 D3 C3 D3 G3/4", "I V IV V I",
          { por: "V → IV (c. 1–2): depois da dominante o baixo volta à pré-dominante, e o V seguinte soa como recomeço, não como chegada." }),
        op("G maior", "B4/2 C5 B4 A4 B4/4", "G3/2 C3 D3 D3 G3/4", "I IV I64 V I",
          { por: "O baixo faz V–I, mas a melodia termina em si4 (a 3ª): a cadência fica autêntica imperfeita, e o fechamento que o plano pede (perfeita, com a tônica em cima) não acontece." }),
      ],
      e: "I64 no 1º tempo e V no 3º: a dissonância (a 6ª e a 4ª sobre o ré) fica no tempo mais forte e resolve no mais fraco, e o I chega no tempo forte do compasso seguinte.",
      verificar: { perfil: { ...TONAL }, contexto: { nivel: 6, plano: { cadencia: 3 } } } },

    { p: "A mesma melodia, três baixos. As três estão corretas pelas regras. Com qual a cadência 'chega' melhor?",
      o: [
        op("C maior", "E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4", "C3/4 F3/4 E3/1 F3/1 G3/1 G3/1 C3/4", "I IV I6 ii6 I64 V I", { texto: "1 – 1 – 4 – 1 acordes por compasso" }),
        op("C maior", "E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4", "C3/4 F3/4 G3/4 C3/4", "I IV V7 I",
          { texto: "1 – 1 – 1 – 1", por: "Um acorde por compasso do começo ao fim: o V7 chega com o mesmo passo do I e do IV, e a cadência soa como mais um compasso. Não sobra aceleração para marcar o fim." }),
        op("C maior", "E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4", "C3/1 A2/1 E3/1 C3/1 F3/1 D3/1 F3/1 D3/1 G3/4 C3/4", "I vi I6 I IV ii IV ii V7 I",
          { texto: "4 – 4 – 1 – 1", por: "O ritmo harmônico desacelera: quatro acordes por compasso no começo, um só antes da cadência. A energia se gasta no início, e a frase perde impulso justamente onde devia ganhar." }),
      ],
      e: "Começo lento (I, IV: um acorde por compasso) e aceleração no c. 3 (I6 – ii6 – I64 – V, um por tempo), com o 6/4 no 3º tempo. A aceleração é um dos sinais mais fortes de que a cadência se aproxima; com ritmo uniforme ou desacelerando, ela 'não chega'." },

    { p: "Este fim de frase está correto acorde por acorde, mas a cadência soa fraca, como se escorregasse. Por quê?",
      ...op("C maior", "E5/2 C5 G5 F5 D5 C5", "C3/2 F3 E3 F3 G3 C3", "I IV I6 ii6 V I"),
      o: [
        "A tônica final chega no 3º tempo, mais fraco que o 1º, onde está o V: a resolução cai num tempo mais fraco que a tensão. A cadência pede o contrário (V no tempo fraco, I no forte)",
        { texto: "Falta a aceleração do ritmo harmônico", por: "O ritmo é constante (dois acordes por compasso). O problema que se ouve está no último compasso: a métrica da chegada." },
        { texto: "O 6/4 cadencial está no tempo fraco", por: "Não há 6/4 neste trecho: a cadência é ii6 → V → I." },
        { texto: "A melodia não termina na tônica", por: "Termina em dó5, sobre dó3: a cadência é perfeita no papel. O que a enfraquece é o lugar métrico." },
      ],
      e: "A chegada da cadência cai num tempo mais forte que o acorde anterior. Quando se quebra isso, é de propósito: a 'terminação feminina', com a tônica num tempo fraco, faz parte de certos gêneros (é típica da polonaise), e lá o contexto a anuncia. Numa frase comum ela soa como descuido métrico." },
  ]);

  // ================================================================ Esquemas galantes
  T.perguntas("esquemas", [
    { p: "Fá maior. Depois de uma abertura, a frase pede um Prinner em mínimas (soprano 6–5–4–3 sobre baixo 4–3–2–1). Qual destes é um Prinner bem conduzido?",
      o: [
        op("F maior", "D5/2 C5 Bb4 A4", "Bb2/2 A2 G2 F2", "IV I6 vii°6 I"),
        op("F maior", "D5/2 C5 Bb4 A4", "D3/2 C3 Bb2 A2", "vi V IV I6",
          { por: "O soprano está certo, mas o baixo desce em 8ªs com ele (ré–dó–si♭–lá): quatro 8ªs paralelas, e uma retrogressão V → IV. O Prinner é um par de vozes em 10ªs, não uma voz dobrada." }),
        op("F maior", "F5/2 E5 D5 C5", "Bb2/2 A2 G2 F2", "IV iii ii I",
          { por: "O baixo está certo, mas o soprano desce 1–7–6–5, uma 5ª acima dele: quatro 5ªs paralelas (si♭–fá, lá–mi, sol–ré, fá–dó), e o soprano não está nos graus do Prinner." }),
        op("F maior", "D5/2 C5 Bb4 A4", "Bb2/2 A2 C3 F2", "IV I6 V7 I",
          { por: "Sem erro de condução, mas não é um Prinner: na 3ª etapa o baixo salta para o 5º grau (dó3), e o trecho vira uma cadência 4–3–5–1. O Prinner desce por grau até 1, em 10ªs com o soprano." }),
      ],
      e: "Ré–dó–si♭–lá sobre si♭–lá–sol–fá: duas descidas paralelas em 10ªs, do IV ao I (IV – I6 – vii°6 – I). Gjerdingen reconhece o esquema por essas etapas; tudo o que se acrescenta entre elas é diminuição.",
      verificar: { perfil: { ...TONAL, esquema: "erro" }, contexto: { nivel: 6, plano: {}, esquemas: PRINNER } } },

    { p: "Sol maior, quatro compassos com a mesma cadência no fim. As três versões estão corretas. Qual tem a gramática galante mais convincente?",
      o: [
        op("G maior", "G4/1 A4 B4/2 E5/1 D5 C5 B4 C5/2 A4/2 G4/4", "G2/1 F#2 G2/2 C3/1 B2 A2 G2 C3/2 D3/2 G2/4", "I V6 I IV I6 vii°6 I ii6 V I",
          { texto: "Do-Re-Mi → Prinner → cadência" }),
        op("G maior", "G4/1 A4 B4/2 G4/1 A4 B4/2 C5/2 A4/2 G4/4", "G2/1 F#2 G2/2 G2/1 F#2 G2/2 C3/2 D3/2 G2/4", "I V6 I I V6 I ii6 V I",
          { texto: "Do-Re-Mi → Do-Re-Mi → cadência", por: "A abertura é dita duas vezes e a resposta nunca vem: a frase passa dois compassos na tônica, sem a descida que equilibraria a subida 1–2–3, e o ritmo harmônico fica parado." }),
        op("G maior", "E5/1 D5 C5 B4 G4/1 A4 B4/2 C5/2 A4/2 G4/4", "C3/1 B2 A2 G2 G2/1 F#2 G2/2 C3/2 D3/2 G2/4", "IV I6 vii°6 I I V6 I ii6 V I",
          { texto: "Prinner → Do-Re-Mi → cadência", por: "A resposta vem antes da pergunta: a frase começa no IV, sem tônica que a assente, e o Do-Re-Mi, que é uma abertura, aparece no meio, onde soa como recomeço." }),
      ],
      e: "Abertura (1–2–3 sobre 1–7–1), resposta (6–5–4–3 sobre 4–3–2–1, depois de um salto que leva o soprano ao alto) e cadência. Cada esquema no lugar que a gramática lhe dá: a originalidade galante está em recombinar e diminuir, não em trocar as funções." },

    { p: "O mesmo Prinner em sol maior, diminuído em semínimas (as etapas caem no 1º e no 3º tempos). Liberdade entre as etapas tem limite: qual destas diminuições ainda é um Prinner correto?",
      o: [
        op("G maior", "E5/1 C5 D5/1 B4 C5/1 A4 B4/2", "C3/2 B2 A2 G2", "IV I6 vii°6 I"),
        op("G maior", "C5/1 E5 B4/1 D5 A4/1 C5 G4/2", "C3/2 B2 A2 G2", "IV I6 vii°6 I",
          { por: "As notas do Prinner estão lá, mas no tempo fraco: nas etapas o soprano faz dó–si–lá–sol (4–3–2–1), dobrando o baixo em 8ªs que chegam por salto. O ouvido ouve o baixo dobrado, não o 6–5–4–3." }),
        op("G maior", "E5/1 A5 D5/1 B4 C5/1 A4 B4/2", "C3/2 B2 A2 G2", "IV I6 vii°6 I",
          { por: "Lá5, no 2º tempo, não pertence ao IV e entra e sai por salto (mi5 → lá5 → ré5). Nota estranha só no tempo fraco e por grau; por salto, só nota do acorde." }),
      ],
      e: "Nas etapas, mi–ré–dó–si sobre dó–si–lá–sol (6–5–4–3 em 10ªs); entre elas, uma 3ª abaixo, sempre notas do acorde. O esquema só exige os graus no começo das etapas; o resto é livre, desde que as notas fora do acorde andem por grau. É o que os exercícios pedem: diminuir sem apagar o molde.",
      verificar: { perfil: { ...TONAL, notas_do_acorde: "erro", esquema: "erro" }, contexto: { nivel: 6, plano: {}, esquemas: PRINNER } } },
  ]);
})(this);
