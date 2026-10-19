/* Perguntas de antes dos exercícios · nível 2, primeira parte: regra da oitava, baixo, cadências, função,
 * notas fora do acorde e retardos na harmonia.
 * Perguntas de julgamento, com partitura (par soprano–baixo e cifras). Formato em docs/guia-perguntas.md. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const { TONAL } = T.perfis;

  // [[tempo em semínimas, cifra]] a partir do baixo ("C3/1 D3 E3/2", com P = pausa e ~ = ligadura) e de "I V43 I6"
  function cif(baixo, simbolos) {
    const ss = simbolos.trim().split(/\s+/);
    const r = [];
    let t = 0, d = 1, k = 0, ligada = false;
    for (const tok of baixo.trim().split(/\s+/)) {
      const m = /\/([\d.]+)/.exec(tok);
      if (m) d = +m[1];
      if (!/^P/.test(tok) && !ligada) r.push([t, ss[k++]]);
      ligada = /~$/.test(tok);
      t += d;
    }
    return r;
  }
  const sb = (tom, s, b) => `tom: ${tom}\nsoprano: ${s}\nbaixo: ${b}`;
  // opção com partitura e cifras
  const op = (tom, s, b, cifras, extra = {}) => ({ partitura: sb(tom, s, b), cifras: cif(b, cifras), ...extra });

  // trechos curtos: sem a cadência do plano (cada pergunta põe a sua, se precisar)
  const { cadencias_do_plano, ...TRECHO } = TONAL;
  const HARM = { ...TRECHO, notas_do_acorde: "erro" };
  // capítulos de ornamentos: a leitura harmônica das notas fora do acorde no lugar das regras "cegas" de dissonância
  const { cifras_coerentes, dissonancia_aproximacao, dissonancia_resolucao, ...BASE_ORN } = TRECHO;
  const ORN = { ...BASE_ORN, orn_cifras: "erro", orn_notas_fora: "erro" };

  // ================================================================== A REGRA DA OITAVA
  const OIT_B = "F3/1 E3 D3 C3 Bb2 A2 G2 F2";
  T.perguntas("oitava", [
    { p: "Fá maior, baixo descendo 8 → 1. Qual realização segue a regra da oitava sem erro?",
      o: [
        op("F maior", "F5/1 G5 F5 E5 E5 F5 E5 F5", OIT_B, "I V6 V43/V V V42 I6 V43 I"),
        op("F maior", "F5/1 G5 F5 E5 D5 C5 E5 F5", OIT_B, "I V6 V43/V V ii65 I6 V43 I",
          { por: "O 4 descendo leva V42 (7ª no baixo, cai no I6). O ii65 é do 4 subindo para o 5." }),
        op("F maior", "A4/1 C5 B4 C5 Bb4 A4 Bb4 A4", OIT_B, "I V6 V43/V V V42 I6 V43 I",
          { por: "Dó5–si♭4–lá4 sobre dó3–si♭2–lá2: 8ªs paralelas, e dobra a 7ª do V42." }),
        op("F maior", "A4/1 C5 Bb4 C5 C5 C5 Bb4 A4", OIT_B, "I V6 V43/V V V42 I6 V43 I",
          { por: "Si♭4 sobre ré3 não cabe no V43/V (sol–si♮–ré–fá): o 6 descendo pede o si♮." }),
      ],
      e: "Descendo: I V6 V43/V V V42 I6 V43 I. Difere da subida no 6 (V43/V, si♮) e no 4 (V42). Soprano quase parado; 7ªs descem, sensível sobe.",
      verificar: { perfil: { ...HARM, regra_da_oitava: "erro" }, contexto: { nivel: 6 } } },
    { p: "Ré maior, regra da oitava subindo. Os três sopranos são corretos. Qual faz o melhor contraponto?",
      o: [
        op("D maior", "F#5/1 G5 F#5 E5 C#5 D5 E5 D5", "D3/1 E3 F#3 G3 A3 B3 C#4 D4", "I V43 I6 ii65 V IV6 V65 I"),
        op("D maior", "F#4/1 G4 A4 B4 C#5 D5 E5 F#5", "D3/1 E3 F#3 G3 A3 B3 C#4 D4", "I V43 I6 ii65 V IV6 V65 I",
          { por: "Oito 10ªs paralelas: as vozes viram uma só; a 7ª do V43 sobe e o fim cai na 3ª." }),
        op("D maior", "A4/1 G4 A4 B4 A4 G4 A4 F#4", "D3/1 E3 F#3 G3 A3 B3 C#4 D4", "I V43 I6 ii65 V IV6 V65 I",
          { por: "Gira em torno do lá4 sem direção; as vozes se espremem até uma 3ª e o fim não chega a 1̂." }),
      ],
      e: "Contra baixo em escala, a voz de cima desce ou fica quase parada e chega à 8ª por movimento contrário; a 7ª do V43 desce." },
    { p: "Na subida, a regra da oitava põe IV6 depois do V. Por que não é retrogressão?",
      partitura: sb("Bb maior", "D5/1 Eb5 D5 C5 A4 Bb4 C5 Bb4", "Bb2/1 C3 D3 Eb3 F3 G3 A3 Bb3"),
      cifras: cif("Bb2/1 C3 D3 Eb3 F3 G3 A3 Bb3", "I V43 I6 ii65 V IV6 V65 I"),
      o: [
        "IV6 de passagem: baixo 5–6–7 entre duas dominantes (V – IV6 – V65)",
        { texto: "Porque o IV6 está invertido: retrogressão só conta entre acordes em estado fundamental", por: "V → ii6 também é invertido e é retrogressão. O que salva o IV6 é o baixo de passagem." },
        { texto: "Porque na subida o 6º grau é um grau estável", por: "Só 1 e 5 são estáveis (acorde em estado fundamental); o 6 leva sexta porque aponta para o 7." },
        { texto: "Porque o IV6 resolve diretamente na tônica", por: "O IV6 vai ao V65, não ao I." },
      ],
      e: "Função se mede no caminho: sol3 é passagem entre fá3 e lá3. Se o baixo voltasse ou saltasse, seria retrogressão." },
  ]);

  // ================================================================== O BAIXO GERA A HARMONIA
  const BX_S = "A4/1 G4 F4 Bb4 A4 G4 F4/2";
  T.perguntas("baixo", [
    { p: "Fá maior, melodia 3̂–2̂–1̂–4̂ | 3̂–2̂–1̂ com CAP. Qual baixo, com cifras, está correto?",
      o: [
        op("F maior", BX_S, "F3/1 G3 A3 G3 C3 C3 F2/2", "I V43 I6 ii I64 V I"),
        op("F maior", BX_S, "A3/1 G3 F3 G3 C3 C3 F2/2", "I6 V43 I ii I64 V I",
          { por: "Lá–sol–fá sob lá4–sol4–fá4: 8ªs paralelas. O baixo deveria subir 1–2–3 (troca de vozes)." }),
        op("F maior", BX_S, "F3/1 G3 A3 G3 C3 E3 F3/2", "I V43 I6 ii I64 V6 I",
          { por: "I64 → V6 muda o baixo: o 6/4 não resolve sobre o 5. E V6–I não é CAP." }),
        op("F maior", BX_S, "F3/1 G3 A3 Bb3 C4 C4 F3/2", "I V43 I6 IV I64 V I",
          { por: "Lá4/lá3 → si♭4/si♭3: 8ªs paralelas no c. 1; o baixo deveria ir contra a melodia." }),
      ],
      e: "Fá–sol–lá sob lá–sol–fá: troca de vozes com V43 de passagem. Depois ii, 6/4 no tempo forte e V sobre o mesmo dó.",
      verificar: { perfil: { ...TRECHO }, contexto: { nivel: 6, plano: { cadencia: 2 } } } },
    { p: "Ré maior: ré–mi–fá♯–sol | fá♯–mi–ré. Os três baixos são corretos. Qual é o melhor?",
      o: [
        op("D maior", "D5/1 E5 F#5 G5 F#5 E5 D5/2", "D3/1 C#3 B2 G2 A2 A2 D3/2", "I V6 vi IV I64 V I"),
        op("D maior", "D5/1 E5 F#5 G5 F#5 E5 D5/2", "D3/1 A2 D3 G2 A2 A2 D3/2", "I V I IV I64 V I",
          { por: "Só fundamentais, saltando sempre; I–V–I não sai do lugar. Acordes em bloco, sem linha." }),
        op("D maior", "D5/1 E5 F#5 G5 F#5 E5 D5/2", "B2/1 C#3 D3 E3 A2 A2 D3/2", "vi V6 I ii I64 V I",
          { por: "10ªs paralelas com a melodia: vozes como uma só. E começar no vi deixa o tom incerto." }),
      ],
      e: "Melodia sobe, baixo desce (I – V6 – vi – IV): movimento contrário, inversões no meio, fundamentais na cadência. O baixo é uma segunda melodia." },
    { p: "Este trecho em sol maior tem um erro. Qual?",
      partitura: sb("G maior", "B4/1 C5 A4 B4 A4/2 G4/2", "G2/1 C3 C3 D3 D3/2 G2/2"),
      cifras: cif("G2/1 C3 C3 D3 D3/2 G2/2", "I IV ii6 I64 V I"),
      o: [
        "I64 no 4º tempo e V no 1º seguinte: o 6/4 precisa de tempo mais forte que o V",
        { texto: "O 6/4 deveria resolver no I, e não no V", por: "O 6/4 cadencial resolve no V sobre o mesmo baixo, como aqui. O erro é métrico." },
        { texto: "O ii6 não pode vir antes do 6/4", por: "ii6 → I64 é a preparação clássica (baixo 4 → 5)." },
        { texto: "Há 8ªs paralelas entre o IV e o ii6", por: "O baixo fica parado no dó: não há paralelas." },
      ],
      e: "A 6ª e a 4ª do 6/4 são apojaturas: precisam do tempo forte. Com ii6 no 2º, I64 no 3º e V no 4º, a cadência se acerta." },
  ]);

  // ================================================================== CADÊNCIAS
  const CE_S = "B4/1 C5 D5 E5 C5/2 B4/1 A4/1", CE_B = "G2/1 A2 B2 C3 C3/2 D3/1 D3/1", CE_C = "I V43 I6 IV ii6 I64 V";
  const CAD_PERFIL = { ...HARM, cad_pedidas: "erro", cadencias_do_plano: "erro" };
  T.perguntas("cadencias", [
    { p: "Ré menor: CAP com 6/4 cadencial no c. 2. Qual versão está correta?",
      o: [
        op("D menor", "D5/1 E5 F5 G5 F5 E5 D5/2", "D3/1 C#3 D3 Bb2 A2 A2 D3/2", "i V6 i iv6 i64 V i"),
        op("D menor", "F5/1 D5 G5 F5 E5/2 D5/2", "D3/1 F3 Bb2 A2 A2/2 D3/2", "i i6 iv6 i64 V i",
          { por: "i64 no 4º tempo e V no 1º: o 6/4 cai mais fraco que o V e a cadência tropeça." }),
        op("D menor", "D5/1 E5 F5 G5 F5 E5 F5/2", "D3/1 C#3 D3 Bb2 A2 A2 D3/2", "i V6 i iv6 i64 V i",
          { por: "Termina em fá5 (3̂): é CAI. A perfeita pede 1̂ em cima." }),
        op("D menor", "D5/1 E5 F5 G5 D5 C5 D5/2", "D3/1 C#3 D3 Bb2 A2 A2 D3/2", "i V6 i iv6 i64 V i",
          { por: "Dó5♮ sobre o V: sem sensível, vira v e perde o semitom dó♯–ré." }),
      ],
      e: "iv6 → i64 → V → i: 6/4 no tempo forte sobre o mesmo lá, 3̂–2̂–1̂ em cima, V e i em fundamental.",
      verificar: { perfil: CAD_PERFIL, contexto: { nivel: 6, plano: { cadencia: 2 }, cadencias: [{ compasso: 2, tipo: "perfeita64" }] } } },
    { p: "Os c. 1–2 prometem CAP. Qual continuação adia a chegada até o c. 4, como no estilo clássico?",
      partitura: sb("G maior", CE_S, CE_B),
      cifras: cif(CE_B, CE_C),
      o: [
        op("G maior", `${CE_S} G4/2 C5/2 B4/1 A4/1 G4/2`, `${CE_B} E3/2 C3/2 D3/1 D3/1 G2/2`, `${CE_C} vi ii6 I64 V I`),
        op("G maior", `${CE_S} G4/2 G4/2 G4/4`, `${CE_B} G2/2 C3/2 G2/4`, `${CE_C} I IV I`,
          { por: "A CAP chega no c. 3; o IV–I do c. 4 é só apêndice. Não há adiamento." }),
        op("G maior", `${CE_S} G4/2 C5/2 B4/1 A4/3`, `${CE_B} E3/2 C3/2 D3/1 D3/3`, `${CE_C} vi ii6 I64 V`,
          { por: "Engano certo, mas termina no V: a CAP adiada nunca chega." }),
        op("G maior", `${CE_S} C5/2 B4/2 C5/2 B4/2`, `${CE_B} C3/2 G2/2 C3/2 G2/2`, `${CE_C} IV I IV I`,
          { por: "V → IV é retrogressão, não engano; e o fim plagal não substitui a CAP." }),
      ],
      e: "V → vi: a melodia chega a 1̂, a harmonia não. A frase refaz ii6 – I64 – V e chega ao I: o engano alonga a frase." },
    { p: "Este trecho é o antecedente de um período. O que está errado na forma?",
      partitura: sb("F maior", "A4/2 C5/2 D5/2 C5/2 Bb4/2 A4/1 G4/1 F4/4", "F2/2 A2/2 Bb2/2 A2/2 Bb2/2 C3/1 C3/1 F2/4"),
      cifras: cif("F2/2 A2/2 Bb2/2 A2/2 Bb2/2 C3/1 C3/1 F2/4", "I I6 IV I6 ii6 I64 V I"),
      o: [
        "Fecha com CAP: a pergunta fica tão conclusiva quanto a resposta. Pede SC ou CAI",
        { texto: "O 6/4 cadencial está no tempo fraco", por: "I64 no 3º tempo, V no 4º: correto." },
        { texto: "Há 8ªs paralelas entre os c. 2 e 3", por: "Movimento contrário, 10ª → 8ª: não há paralelas." },
        { texto: "I6 → ii6 é retrogressão", por: "I6 → ii6 é T → PD, o caminho normal." },
      ],
      e: "CAP > CAI > SC: o consequente só soa como resposta se for mais conclusivo. Parando no V, a frase vira pergunta." },
  ]);

  // ================================================================== FUNÇÃO E PROGRESSÃO
  const FN_S = "A4/2 C#5 D5 B4 C#5 B4 A4/4";
  T.perguntas("funcao", [
    { p: "Lá maior, T → PD → D → T até a CAP. Qual baixo, com cifras, está correto?",
      o: [
        op("A maior", FN_S, "A2/2 F#2 D3 D3 E3 E3 A2/4", "I vi IV ii6 I64 V I"),
        op("A maior", FN_S, "A2/2 F#2 B2 D3 E3 E3 A2/4", "I vi vii°6 ii6 I64 V I",
          { por: "vii°6 → ii6: dominante voltando à pré-dominante, retrogressão." }),
        op("A maior", FN_S, "A2/2 C#3 D3 D3 E3 E3 A2/4", "I I6 IV ii6 I64 V I",
          { por: "Lá–dó♯–ré nas duas vozes (c. 1–2): 8ªs paralelas." }),
        op("A maior", FN_S, "A2/2 F#2 F#2 D3 E3 E3 A2/4", "I vi vi ii6 I64 V I",
          { por: "Ré5 sobre fá♯2 não cabe no vi: o acorde é IV6, já pré-dominante." }),
      ],
      e: "I – vi (T) → IV – ii6 (PD, mesmo baixo) → I64 – V → I: só progressões fortes ou de mesma função.",
      verificar: { perfil: { ...HARM }, contexto: { nivel: 6, plano: { cadencia: 4 } } } },
    { p: "Ré maior, três frases sem erro. Qual tem o caminho funcional mais convincente?",
      o: [
        op("D maior", "F#5/2 D5 E5 C#5 D5/4", "D3/2 B2 E3 A2 D3/4", "I vi ii V I"),
        op("D maior", "F#5/2 E5 D5 C#5 D5/4", "D3/2 A2 B2 A2 D3/4", "I V vi V I",
          { por: "I–V logo de saída e V final sem pré-dominante: a frase gira em vez de avançar." }),
        op("D maior", "F#5/2 G5 F#5 E5 D5/4", "D3/2 G2 D3 A2 D3/4", "I IV I V I",
          { por: "IV volta ao I e o V chega direto do I: idas e voltas, sem caminho." }),
      ],
      e: "I – vi – ii – V – I: 3ª abaixo e depois 5ªs descendentes, todas fortes; a D chega preparada pela PD." },
    { p: "Só uma volta da D à PD de um jeito que o estilo estrito aceita. Qual?",
      o: [
        op("G maior", "B4/1 A4 G4 A4 G4/4", "G2/1 D3 E3 F#3 G3/4", "I V IV6 V6 I"),
        op("G maior", "B4/1 A4 C5 B4/4", "G2/1 D3 C3 G2/4", "I V IV I",
          { por: "V–IV–I é o gesto do blues: no estilo estrito, retrogressão com fim plagal." }),
        op("G maior", "B4/1 A4 A4 F#4 G4/4", "G2/1 D3 C3 D3 G2/4", "I V ii6 V I",
          { por: "V → ii6 → V: o baixo vai e volta (ré–dó–ré), não passa. É retrogressão." }),
        op("G maior", "B4/1 C5 C5 A4 G4/4", "G2/1 A2 C3 D3 G2/4", "I vii°6 IV V I",
          { por: "vii°6 → IV: dominante saltando para a pré-dominante." }),
      ],
      e: "V – IV6 – V6: o IV6 harmoniza uma passagem ré–mi–fá♯ entre duas dominantes, como na regra da oitava.",
      verificar: { perfil: { ...HARM }, contexto: { nivel: 6 } } },
  ]);

  // ================================================================== NOTAS FORA DO ACORDE
  const ORN_B = "A2/2 F#2 D3 E3 A2/4";
  const ORN_C = "I vi IV V I";
  T.perguntas("ornamentos", [
    { p: "Lá maior, I – vi – IV – V – I. Qual soprano ornamentado está correto?",
      o: [
        op("A maior", "C#5/1 B4 A4 C#5 E5 D5 C#5 B4 A4/4", ORN_B, ORN_C),
        op("A maior", "C#5/1 B4 A4 C#5 E5 A4 C#5 B4 A4/4", ORN_B, ORN_C,
          { por: "Mi5 sobre o IV sai por salto ao lá4: apojatura sem resolução (deveria ir ao ré5)." }),
        op("A maior", "C#5/1 B4 A4 C#5 E5 D5 D5/2 E5/4", ORN_B, "I vi IV V7 I",
          { por: "Ré5, 7ª do V7, sobe ao mi5 em vez de descer ao dó♯5." }),
        op("A maior", "C#5/1 D5 F#5 E5 D5 C#5 B4/2 A4/4", ORN_B, ORN_C,
          { por: "Ré5 chega por grau e salta na mesma direção: nem passagem nem escapada." }),
      ],
      e: "Si4: passagem. Mi5: apojatura (salto, tempo forte, desce ao ré5). Dó♯5 sobre o V: passagem acentuada.",
      verificar: { perfil: { ...ORN }, contexto: { nivel: 6 } } },
    { p: "Dó maior, três sopranos corretos. Qual usa melhor a dissonância?",
      o: [
        op("C maior", "C5/1 D5 E5 G5 B5 A5 G5 D5 C5/4", "C3/2 E3 F3 G3 C3/4", "I I6 IV V I"),
        op("C maior", "C5/1 D5 E5 G5 A5 B5 G5 D5 C5/4", "C3/2 E3 F3 G3 C3/4", "I I6 IV V I",
          { por: "Si5 vira escapada no tempo fraco: o clímax fica sem acento." }),
        op("C maior", "C5/1 G5 F5 E5 G5 F5 E5 D5 C5/4", "C3/2 E3 F3 G3 C3/4", "I I6 IV V I",
          { por: "Dissonância em cada tempo forte: o suspiro vira tique e nada se destaca." }),
      ],
      e: "Passagens nos tempos fracos e uma só apojatura (si5 → lá5) no clímax. A dissonância vale mais quando é rara." },
    { p: "Lá menor: apojatura sem resolução (licença). Em qual versão a quebra soa como gesto?",
      o: [
        op("A menor", "C5/2 B4/2 A4/1 C5 G5 D5 B4/2 A4/2", "A2/2 G#2/2 A2/2 D3/2 E3/2 A2/2", "i V6 i iv V i"),
        op("A menor", "C5/2 B4/2 A4/1 G5 C5 D5 B4/2 A4/2", "A2/2 G#2/2 A2/2 D3/2 E3/2 A2/2", "i V6 i iv V i",
          { por: "Sol5 no tempo fraco: sem apoio métrico não é apojatura, é nota solta." }),
        op("A menor", "C5/2 B4/2 A4/1 C5 G5 D5 E5/2 A4/2", "A2/2 G#2/2 A2/2 D3/2 E3/2 A2/2", "i V6 i iv V i",
          { por: "Ré5/ré3 → mi5/mi3: 8ªs paralelas. A quebra pede tecido correto em volta." }),
        op("A menor", "C5/2 B4/2 A4/1 C5 G5 D5 D5/2 E5/2", "A2/2 G#2/2 A2/2 D3/2 E3/2 A2/2", "i V6 i iv V7 i",
          { por: "A 7ª do V7 também sobe: duas dissonâncias sem resolução, a licença vira descuido." }),
      ],
      e: "Sol5, o ponto mais alto, no tempo forte do iv, sai por salto ao ré5; o resto é estrito: suspiro interrompido.",
      verificar: { perfil: { ...ORN }, contexto: { nivel: 6, ornLicencas: ["apojatura_livre"] } } },
  ]);

  // ================================================================== RETARDOS NA HARMONIA
  const RH_B = "C3/2 A2/2 Bb2/1 G2/1 F2/2 Bb2/4";
  const RH_C = "ii V6 I IV6 V I";
  T.perguntas("retardos_harm", [
    { p: "Si♭ maior: 7–6 sobre o V6 e 4–3 na cadência. Qual versão está correta?",
      o: [
        op("Bb maior", "C5/1 G4/1~ G4/1 F4/1 F4/1 Bb4/1~ Bb4/1 A4/1 Bb4/4", RH_B, RH_C),
        op("Bb maior", "G4/3 F4/1 F4/1 Bb4/1~ Bb4/1 A4/1 Bb4/4", RH_B, RH_C,
          { por: "Sol4 preparado no 1º tempo, mais forte que a dissonância: soa como sobra. Prepare no 2º." }),
        op("Bb maior", "C5/1 G4/1~ G4/1 F4/1 F4/1 Bb4/1~ Bb4/1 C5/1 Bb4/4", RH_B, RH_C,
          { por: "Si♭4 preso sobe ao dó5: a sensível (lá) nunca chega. O retardo desce." }),
        op("Bb maior", "C5/1 G4/1~ G4/1 F4/1 F4/1 Bb4/1~ Bb4/1 F5/1 D5/4", RH_B, RH_C,
          { por: "Si♭4 salta ao fá5: 4–3 sem resolução, V sem sensível." }),
      ],
      e: "Sol4: 7–6 sobre o V6; si♭4: 4–3 sobre o V. Preparação fraca, dissonância forte, resolução um grau abaixo.",
      verificar: { perfil: { ...ORN }, contexto: { nivel: 6 } } },
    { p: "Cadeia de 9–8 em lá menor, sem erro apontado. Por que soa pobre?",
      partitura: sb("A menor", "C5/1 A4/1~ A4/1 G4/1~ G4/1 F4/1~ F4/1 E4/1 E4/4", "A3/2 G3/2 F3/2 E3/2 A2/4"),
      cifras: cif("A3/2 G3/2 F3/2 E3/2 A2/4", "i VII VI V i"),
      o: [
        "Cada 9ª resolve numa 8ª: 8ªs paralelas só adiadas",
        { texto: "As notas presas não foram preparadas por consonância", por: "Foram, todas por 8ª." },
        { texto: "O fá4 sobre o mi3 é uma 9ª menor, que não pode ser retardo", por: "♭9–8 sobre o V é retardo normal." },
        { texto: "VI → V é uma retrogressão", por: "VI → V é PD → D, o caminho normal." },
      ],
      e: "O 9–8 não se encadeia. Com acordes de sexta e 7–6, as resoluções viram 6ªs (Corelli)." },
    { p: "Ré maior, IV – V – I: três retardos que sobem. Qual é a retardação consagrada na cadência?",
      o: [
        op("D maior", "B4/2 A4/1 C#5/1~ C#5/2 D5/2", "G2/2 A2/2 D3/4", "IV V I"),
        op("D maior", "B4/1 D5/1~ D5/1 E5/1 F#5/4", "G2/2 A2/2 D3/4", "IV V I",
          { por: "Ré5 preso sobe ao mi5: a sensível nunca soa; um 4–3 na direção errada." }),
        op("D maior", "B4/2 C#5/1 E5/1~ E5/2 F#5/2", "G2/2 A2/2 D3/4", "IV V I",
          { por: "Mi5 preso sobe ao fá♯5 (9–10): sem semitom que justifique, o ouvido espera o ré." }),
      ],
      e: "Dó♯5, a sensível, preso sobre ré3 sobe meio tom: direção natural. Fora da sensível, subir soa errado." },
  ]);
})(this);
