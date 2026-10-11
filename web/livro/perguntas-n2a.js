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
    { p: "Fá maior, baixo descendo a escala inteira (8 → 1), uma harmonia por nota. Qual realização segue a regra da oitava sem erro?",
      o: [
        op("F maior", "F5/1 G5 F5 E5 E5 F5 E5 F5", OIT_B, "I V6 V43/V V V42 I6 V43 I"),
        op("F maior", "F5/1 G5 F5 E5 D5 C5 E5 F5", OIT_B, "I V6 V43/V V ii65 I6 V43 I",
          { por: "O si♭2 descendo leva 4/2 (V42): ele é a 7ª da dominante e cai no lá (I6). O ii65 é a harmonia do 4º grau subindo, que aponta para o 5 — mas aqui o 5 já passou. A frase volta da dominante à pré-dominante logo antes do I6." }),
        op("F maior", "A4/1 C5 B4 C5 Bb4 A4 Bb4 A4", OIT_B, "I V6 V43/V V V42 I6 V43 I",
          { por: "Dó5–si♭4–lá4 sobre dó3–si♭2–lá2 (c. 1–2): 8ªs paralelas. O soprano dobra justamente o baixo do V42, que é a 7ª do acorde; a voz de cima deveria ficar no mi5 (a sensível) e resolver no fá5." }),
        op("F maior", "A4/1 C5 Bb4 C5 C5 C5 Bb4 A4", OIT_B, "I V6 V43/V V V42 I6 V43 I",
          { por: "Si♭4 sobre o ré3 (3º tempo do c. 1) não cabe no V43/V (sol–si♮–ré–fá). O 6º grau descendo ganha o 4º grau elevado do tom: é o si♮ que transforma o acorde em dominante da dominante e faz o dó3 chegar como meta." }),
      ],
      e: "Descendo: I V6 V43/V V V42 I6 V43 I. As duas assimetrias em relação à subida estão no 6 (V43/V, com o si♮) e no 4 (V42, a 7ª no baixo caindo no 3). O soprano quase parado (fá5–sol5–fá5–mi5…) deixa o baixo andar e resolve cada 7ª descendo: o fá5 do V43/V cai no mi5, o mi5 sobe ao fá5 só quando o baixo chega ao 1.",
      verificar: { perfil: { ...HARM, regra_da_oitava: "erro" }, contexto: { nivel: 6 } } },
    { p: "Ré maior, baixo subindo a escala com a regra da oitava (I V43 I6 ii65 V IV6 V65 I). Os três sopranos são corretos. Qual faz o melhor contraponto com o baixo?",
      o: [
        op("D maior", "F#5/1 G5 F#5 E5 C#5 D5 E5 D5", "D3/1 E3 F#3 G3 A3 B3 C#4 D4", "I V43 I6 ii65 V IV6 V65 I"),
        op("D maior", "F#4/1 G4 A4 B4 C#5 D5 E5 F#5", "D3/1 E3 F#3 G3 A3 B3 C#4 D4", "I V43 I6 ii65 V IV6 V65 I",
          { por: "Oito 10ªs paralelas: o soprano é o baixo dobrado uma 10ª acima, e as duas vozes viram uma só. A 7ª do V43 (sol4) sobe em vez de descer, e a frase termina na 3ª, no ponto mais agudo, sem nenhum movimento contrário na chegada." }),
        op("D maior", "A4/1 G4 A4 B4 A4 G4 A4 F#4", "D3/1 E3 F#3 G3 A3 B3 C#4 D4", "I V43 I6 ii65 V IV6 V65 I",
          { por: "O soprano gira em volta do lá4 enquanto o baixo sobe uma oitava inteira: as vozes se aproximam até ficarem a uma 3ª (fá♯4 sobre ré4) e a frase acaba espremida e grave, sem chegada à tônica em cima. Ficar parado ajuda, mas aqui não há direção nenhuma." }),
      ],
      e: "Contra um baixo em escala, a voz de cima ganha independência descendo ou ficando quase parada, e sobe só para a cadência: fá♯5–sol5–fá♯5 (a 7ª do V43 resolve descendo) desce até o dó♯5 sobre o V e volta por grau ao ré5, chegando à 8ª por movimento contrário (mi5/dó♯4 → ré5/ré4)." },
    { p: "Na subida, a regra da oitava põe um IV6 logo depois do V. Por que isso não é a retrogressão (dominante → pré-dominante) que o estilo proíbe?",
      partitura: sb("Bb maior", "D5/1 Eb5 D5 C5 A4 Bb4 C5 Bb4", "Bb2/1 C3 D3 Eb3 F3 G3 A3 Bb3"),
      cifras: cif("Bb2/1 C3 D3 Eb3 F3 G3 A3 Bb3", "I V43 I6 ii65 V IV6 V65 I"),
      o: [
        "O IV6 é de passagem: o baixo continua por grau (5–6–7) na mesma direção, entre dois acordes de dominante (V – IV6 – V65); a dominante se prolonga e a pré-dominante não chega a ser uma etapa",
        { texto: "Porque o IV6 está invertido: retrogressão só conta entre acordes em estado fundamental", por: "V → ii6 também é invertido e continua sendo retrogressão. O que salva o IV6 é o baixo em escala entre dois acordes de dominante, não a inversão em si." },
        { texto: "Porque na subida o 6º grau é um grau estável", por: "Só o 1 e o 5 são estáveis e levam 5/3; o 6 leva acorde de sexta justamente porque não é ponto de chegada: ele aponta para o 7 e o 8." },
        { texto: "Porque o IV6 resolve diretamente na tônica", por: "O IV6 (sol3) vai ao V65 (lá3), não ao I: a tônica só chega no si♭3, depois da dominante." },
      ],
      e: "A função se mede no caminho, não acorde por acorde: sol3 é uma nota de passagem do baixo entre fá3 e lá3, e o IV6 é o acorde que a harmoniza. Se o baixo voltasse (fá–sol–fá) ou saltasse, o mesmo IV6 seria uma retrogressão de verdade." },
  ]);

  // ================================================================== O BAIXO GERA A HARMONIA
  const BX_S = "A4/1 G4 F4 Bb4 A4 G4 F4/2";
  T.perguntas("baixo", [
    { p: "Melodia em fá maior: lá–sol–fá–si♭ | lá–sol–fá (3̂–2̂–1̂–4̂ | 3̂–2̂–1̂), com cadência perfeita no fim. Qual baixo (com as cifras) está correto?",
      o: [
        op("F maior", BX_S, "F3/1 G3 A3 G3 C3 C3 F2/2", "I V43 I6 ii I64 V I"),
        op("F maior", BX_S, "A3/1 G3 F3 G3 C3 C3 F2/2", "I6 V I ii I64 V I",
          { por: "Lá–sol–fá no baixo sob lá4–sol4–fá4: 8ªs paralelas (c. 1, tempos 1–3). O baixo copia a melodia uma oitava abaixo; a troca de vozes pede o contrário — o baixo sobe 1–2–3 enquanto a melodia desce 3–2–1." }),
        op("F maior", BX_S, "F3/1 G3 A3 G3 C3 E3 F3/2", "I V43 I6 ii I64 V6 I",
          { por: "O I64 do c. 2 vai para um V6 (mi3), com outro baixo: o 6/4 não resolve sobre o mesmo 5º grau, não é cadencial nem de passagem. E V6–I não é cadência perfeita: a frase fecha sem o 5 → 1 no baixo." }),
        op("F maior", BX_S, "F3/1 G3 A3 Bb3 C4 C4 F3/2", "I V43 I6 IV I64 V I",
          { por: "Lá4/lá3 → si♭4/si♭3 (c. 1, tempos 3–4): as duas vozes sobem e chegam a uma 8ª com salto de 4ª na voz de cima — 8ª direta. O baixo sobe junto com a melodia justamente no ponto em que deveria ir contra ela." }),
      ],
      e: "Fá–sol–lá sob lá–sol–fá: troca de vozes, com o V43 de passagem prolongando a tônica. Depois o baixo desce ao sol (ii, contra o si♭4 que sobe) e salta ao dó para o 6/4 cadencial no tempo forte, resolvendo no V sobre o mesmo dó e caindo no fá.",
      verificar: { perfil: { ...TRECHO }, contexto: { nivel: 6, plano: { cadencia: 2 } } } },
    { p: "Melodia em ré maior: ré–mi–fá♯–sol | fá♯–mi–ré. Os três baixos estão corretos pelas regras. Qual é o melhor?",
      o: [
        op("D maior", "D5/1 E5 F#5 G5 F#5 E5 D5/2", "D3/1 C#3 B2 G2 A2 A2 D3/2", "I V6 vi IV I64 V I"),
        op("D maior", "D5/1 E5 F#5 G5 F#5 E5 D5/2", "D3/1 A2 D3 G2 A2 A2 D3/2", "I V I IV I64 V I",
          { por: "Só fundamentais: o baixo salta em todos os tempos (ré–lá–ré–sol), e I–V–I no c. 1 é um balanço no lugar, sem direção. As funções estão certas, mas o baixo não tem linha própria — soa como acordes em bloco." }),
        op("D maior", "D5/1 E5 F#5 G5 F#5 E5 D5/2", "B2/1 C#3 D3 E3 A2 A2 D3/2", "vi V6 I ii I64 V I",
          { por: "O baixo sobe em 10ªs paralelas com a melodia (si–dó♯–ré–mi sob ré–mi–fá♯–sol): as duas vozes andam como uma só. E a frase começa no vi, antes de a tônica ter sido ouvida — o tom fica incerto justamente no começo." }),
      ],
      e: "Enquanto a melodia sobe ré–mi–fá♯–sol, o baixo desce ré–dó♯–si–sol (I – V6 – vi – IV): movimento contrário o tempo todo, inversões no meio da linha e fundamentais só na articulação cadencial (lá–lá–ré). O baixo é uma segunda melodia, e não o pé de cada acorde." },
    { p: "Neste trecho em sol maior, o verificador aponta um problema no 6/4. Qual é ele?",
      partitura: sb("G maior", "B4/1 C5 A4 B4 A4/2 G4/2", "G2/1 C3 C3 D3 D3/2 G2/2"),
      cifras: cif("G2/1 C3 C3 D3 D3/2 G2/2", "I IV ii6 I64 V I"),
      o: [
        "O I64 cai no 4º tempo e o V no 1º do compasso seguinte: a dupla apojatura fica no tempo fraco e a resolução no forte — o 6/4 cadencial precisa de um tempo mais forte que o V",
        { texto: "O 6/4 deveria resolver no I, e não no V", por: "O 6/4 cadencial é um V ornamentado: a 6ª e a 4ª descem sobre o mesmo baixo (ré), e é isso que acontece aqui. O que está errado é o lugar métrico." },
        { texto: "O ii6 não pode vir antes do 6/4", por: "ii6 → I64 é a pré-dominante clássica do 6/4 cadencial (baixo 4 → 5). O problema está depois dele." },
        { texto: "Há 8ªs paralelas entre o IV e o ii6", por: "Dó5/dó3 → lá4/dó3: o baixo fica parado e o soprano desce; não há paralelas." },
      ],
      e: "A 6ª e a 4ª acima do 5º grau são dissonâncias acentuadas (apojaturas) que resolvem em 5ª e 3ª: precisam do apoio métrico. Desloque tudo meio compasso — ii6 no 2º tempo, I64 no 3º, V no 4º — e a cadência fica no lugar." },
  ]);

  // ================================================================== CADÊNCIAS
  const CAD_PERFIL = { ...HARM, cad_pedidas: "erro", cadencias_do_plano: "erro" };
  T.perguntas("cadencias", [
    { p: "Ré menor: o fim de uma frase, com cadência autêntica perfeita e 6/4 cadencial no c. 2. Qual versão está correta?",
      o: [
        op("D menor", "D5/1 E5 F5 G5 F5 E5 D5/2", "D3/1 C#3 D3 Bb2 A2 A2 D3/2", "i V6 i iv6 i64 V i"),
        op("D menor", "D5/1 E5 G5 F5 E5/2 D5/2", "D3/1 C#3 Bb2 A2 A2/2 D3/2", "i V6 iv6 i64 V i",
          { por: "O i64 cai no 4º tempo do c. 1 e o V no 1º do c. 2: a dupla apojatura está no tempo fraco e a resolução no forte. A cadência inteira tropeça — o 6/4 tem de cair num tempo mais forte que o V." }),
        op("D menor", "D5/1 E5 F5 G5 F5 E5 F5/2", "D3/1 C#3 D3 Bb2 A2 A2 D3/2", "i V6 i iv6 i64 V i",
          { por: "A voz de cima volta ao fá5 (3̂) sobre o i final: é uma cadência autêntica imperfeita. Harmonia certa, mas o fim fica em aberto — a perfeita pede a tônica em cima." }),
        op("D menor", "D5/1 E5 F5 G5 D5 C5 D5/2", "D3/1 C#3 D3 Bb2 A2 A2 D3/2", "i V6 i iv6 i64 V i",
          { por: "Dó5 natural sobre o V (c. 2): sem a sensível, a dominante fica menor (v) e a cadência perde o semitom dó♯–ré que a torna conclusiva. Em menor, V e vii° levam sempre o 7º grau elevado." }),
      ],
      e: "iv6 → i64 → V → i: o baixo desce meio tom si♭–lá e fica no lá sob o 6/4 (1º tempo, forte) e o V (2º tempo), enquanto a voz de cima faz 3̂–2̂–1̂ (fá–mi–ré). As três condições da perfeita — V e i em fundamental, tônica em cima — mais o 6/4 no tempo forte.",
      verificar: { perfil: CAD_PERFIL, contexto: { nivel: 6, plano: { cadencia: 2 }, cadencias: [{ compasso: 2, tipo: "perfeita64" }] } } },
    { p: "Sol maior. Os c. 1–2 prometem uma cadência perfeita no c. 3 (ii6 – I64 – V). Você quer adiar essa chegada e fazer uma frase de 4 compassos. Qual continuação faz isso como a tradição clássica?",
      partitura: sb("G maior", "B4/1 C5 D5 E5 C5 B4 A4/2", "G2/1 A2 B2 C3 C3 D3 D3/2"),
      cifras: cif("G2/1 A2 B2 C3 C3 D3 D3/2", "I V43 I6 IV ii6 I64 V"),
      o: [
        op("G maior", "B4/1 C5 D5 E5 C5 B4 A4/2 G4/1 E5 C5 B4 A4/2 G4/2", "G2/1 A2 B2 C3 C3 D3 D3/2 E3/1 C3 C3 D3 D3/2 G2/2", "I V43 I6 IV ii6 I64 V vi IV ii6 I64 V I"),
        op("G maior", "B4/1 C5 D5 E5 C5 B4 A4/2 G4/2 C5/1 B4 B4/2 C5/1 B4 B4/2", "G2/1 A2 B2 C3 C3 D3 D3/2 G2/2 C3/1 G2 G2/2 C3/1 G2 G2/2", "I V43 I6 IV ii6 I64 V I IV I I IV I I",
          { por: "A cadência perfeita já chega no c. 3; o c. 4 só repete IV–I (plagal). Não há adiamento: a frase fecha cedo e o último compasso é um apêndice — 3 + 1, e não 4." }),
        op("G maior", "B4/1 C5 D5 E5 C5 B4 A4/2 G4/1 E5 C5 B4 A4/4", "G2/1 A2 B2 C3 C3 D3 D3/2 E3/1 C3 C3 D3 D3/4", "I V43 I6 IV ii6 I64 V vi IV ii6 I64 V",
          { por: "O engano do c. 3 está certo, mas a frase termina num V (semicadência): a cadência que foi adiada nunca chega. O engano só funciona se a CAP vier depois dele." }),
        op("G maior", "B4/1 C5 D5 E5 C5 B4 A4/2 C5/2 B4/2 A4/1 C5 B4/2", "G2/1 A2 B2 C3 C3 D3 D3/2 C3/2 G2/2 F#2/1 A2 G2/2", "I V43 I6 IV ii6 I64 V IV I V6 V43/V I",
          { por: "V → IV no c. 3 desfaz a dominante sem resolver: é retrogressão, não engano. E o fim (V43/V → I) nem é cadência: a frase fica sem a CAP que os c. 1–2 prometeram." }),
      ],
      e: "V → vi: a melodia chega ao sol4 (1̂) como prometido, mas o baixo sobe ao mi e a harmonia não chega em casa. A frase refaz a pré-dominante (IV – ii6) e repete o gesto cadencial — agora com o I. O engano alonga a frase porque o ouvido continua esperando a mesma cadência, que vem dois compassos depois." },
    { p: "Este trecho seria o antecedente de um período; o consequente vai repetir os c. 1–2. O que está errado na forma?",
      partitura: sb("F maior", "A4/2 C5/2 D5/2 C5/2 Bb4/2 A4/1 G4/1 F4/4", "F2/2 A2/2 Bb2/2 A2/2 Bb2/2 C3/1 C3/1 F2/4"),
      cifras: cif("F2/2 A2/2 Bb2/2 A2/2 Bb2/2 C3/1 C3/1 F2/4", "I I6 IV I6 ii6 I64 V I"),
      o: [
        "O antecedente já fecha com cadência autêntica perfeita (I64–V–I, tônica em cima): a pergunta fica tão conclusiva quanto a resposta, e o consequente não tem como ser mais forte. Ele pede uma semicadência (parar no V) ou, no máximo, uma imperfeita",
        { texto: "O 6/4 cadencial está no tempo fraco", por: "I64 no 3º tempo do c. 3 e V no 4º: o 6/4 cai num tempo mais forte que o V, como deve." },
        { texto: "Há 8ªs paralelas entre os c. 2 e 3", por: "Dó5/lá2 → si♭4/si♭2: as vozes vão em sentido contrário, de uma 10ª para uma 8ª. Não há paralelas." },
        { texto: "I6 → ii6 é retrogressão", por: "I6 → ii6 é tônica → pré-dominante, o caminho normal. Retrogressão é dominante → pré-dominante." },
      ],
      e: "A cadência é uma decisão de forma: a hierarquia CAP > CAI > SC é o que faz o consequente soar como resposta. Com a mesma progressão parando no V (ii6 – V, ré5 ou dó5 em cima), a frase vira pergunta." },
  ]);

  // ================================================================== FUNÇÃO E PROGRESSÃO
  const FN_S = "A4/2 C#5 D5 B4 C#5 B4 A4/4";
  T.perguntas("funcao", [
    { p: "Lá maior: harmonize a melodia lá–dó♯ | ré–si | dó♯–si | lá (uma harmonia por mínima), andando T → PD → D → T até a cadência perfeita. Qual baixo, com as cifras, está correto?",
      o: [
        op("A maior", FN_S, "A2/2 F#2 D3 D3 E3 E3 A2/4", "I vi IV ii6 I64 V I"),
        op("A maior", FN_S, "A2/2 F#2 B2 D3 E3 E3 A2/4", "I vi vii°6 ii6 I64 V I",
          { por: "vii°6 → ii6 no c. 2: a dominante (vii°) volta para a pré-dominante — retrogressão. O si2 faz o baixo andar bonito, mas o acorde sobre ele já é de dominante, e a frase anda para trás antes de chegar ao 6/4." }),
        op("A maior", FN_S, "A2/2 C#3 D3 D3 E3 E3 A2/4", "I I6 IV ii6 I64 V I",
          { por: "Dó♯5/dó♯3 → ré5/ré3 (c. 1–2): 8ªs paralelas. Trocar o vi pelo I6 deixa o baixo correndo junto com a melodia exatamente na entrada da pré-dominante." }),
        op("A maior", FN_S, "A2/2 F#2 F#2 D3 E3 E3 A2/4", "I vi vi ii6 I64 V I",
          { por: "Ré5 sobre fá♯2 não cabe no vi (fá♯–lá–dó♯): com fá♯ embaixo e ré em cima, o acorde é IV6. A cifra errada esconde a função — ali já começou a pré-dominante, e não a tônica substituta." }),
      ],
      e: "I – vi (tônica e substituto, fundamental descendo uma 3ª) → IV – ii6 (pré-dominante, o mesmo ré no baixo) → I64 – V → I. Todas as progressões são fortes ou de mesma função, e o baixo lá–fá♯–ré–ré–mi–mi–lá chega ao 5 por grau.",
      verificar: { perfil: { ...HARM }, contexto: { nivel: 6, plano: { cadencia: 4 } } } },
    { p: "Ré maior, três frases curtas sem erro nenhum. Qual tem o caminho funcional mais convincente até a cadência?",
      o: [
        op("D maior", "F#5/2 D5 E5 C#5 D5/4", "D3/2 B2 E3 A2 D3/4", "I vi ii V I"),
        op("D maior", "F#5/2 E5 D5 C#5 D5/4", "D3/2 A2 B2 A2 D3/4", "I V vi V I",
          { por: "A dominante aparece logo no 2º acorde (I–V, movimento descendente) e volta no fim sem nenhuma pré-dominante antes: o V final não é preparado, e a frase gira em volta da tônica (V–vi–V) em vez de avançar." }),
        op("D maior", "F#5/2 G5 F#5 E5 D5/4", "D3/2 G2 D3 A2 D3/4", "I IV I V I",
          { por: "O IV volta para o I (IV–I, movimento descendente): a pré-dominante não prepara nada e se desfaz na tônica. O V chega direto do I, de novo sem preparação — duas pequenas idas e voltas, nenhum caminho." }),
      ],
      e: "I – vi – ii – V – I: a fundamental desce uma 3ª (tônica → substituto) e depois anda em 4ªs ascendentes (5ªs descendentes), todas progressões fortes. Cada acorde aponta para o seguinte e a dominante chega preparada pela pré-dominante: T → PD → D → T." },
    { p: "Só uma destas frases em sol maior volta da dominante para a pré-dominante de um jeito que o estilo estrito aceita. Qual?",
      o: [
        op("G maior", "B4/1 A4 G4 A4 G4/4", "G2/1 D3 E3 F#3 G3/4", "I V IV6 V6 I"),
        op("G maior", "B4/1 A4 G4 G4/4", "G2/1 D3 C3 G2/4", "I V IV I",
          { por: "V → IV em fundamental, e o IV cai na tônica: é o gesto do blues e do rock (V–IV–I), uma retrogressão como idioma. No estilo estrito a dominante se desfaz sem resolver e o fim é plagal." }),
        op("G maior", "B4/1 A4 A4 F#4 G4/4", "G2/1 D3 C3 D3 G2/4", "I V ii6 V I",
          { por: "V → ii6 → V: o baixo vai e volta (ré–dó–ré), não passa. O ii6 é uma pré-dominante de verdade depois da dominante — retrogressão, e a segunda dominante soa como recomeço." }),
        op("G maior", "B4/1 C5 C5 A4 G4/4", "G2/1 A2 C3 D3 G2/4", "I vii°6 IV V I",
          { por: "vii°6 → IV: o vii° é dominante, e o baixo salta (lá–dó) para uma pré-dominante. O vii°6 só funciona aqui como acorde de passagem entre I e I6 (sol–lá–si)." }),
      ],
      e: "V – IV6 – V6: o baixo sobe ré–mi–fá♯ na mesma direção, e o IV6 é só o acorde que harmoniza uma nota de passagem entre duas dominantes — a mesma licença da regra da oitava. O V → IV que o blues usa é outra coisa: uma retrogressão assumida, que só soa como estilo porque o ouvido conhece o caminho normal.",
      verificar: { perfil: { ...HARM }, contexto: { nivel: 6 } } },
  ]);

  // ================================================================== NOTAS FORA DO ACORDE
  const ORN_B = "A2/2 F#2 D3 E3 A2/4";
  const ORN_C = "I vi IV V I";
  T.perguntas("ornamentos", [
    { p: "Lá maior, baixo e cifras dados (I – vi – IV – V – I). Qual soprano ornamentado está correto?",
      o: [
        op("A maior", "C#5/1 B4 A4 C#5 E5 D5 C#5 B4 A4/4", ORN_B, ORN_C),
        op("A maior", "C#5/1 B4 A4 C#5 E5 A4 C#5 B4 A4/4", ORN_B, ORN_C,
          { por: "Mi5 sobre o IV (c. 2, 1º tempo) chega por salto, cai no tempo forte e sai por salto para o lá4: é uma apojatura sem resolução. No estilo estrito ela desce por grau a uma nota do acorde (ré5)." }),
        op("A maior", "C#5/1 B4 A4 C#5 E5 D5 D5/2 A4/4", ORN_B, "I vi IV V7 I",
          { por: "Ré5 sobre o V7 (c. 2, 3º tempo) é a 7ª do acorde e salta para o lá4 em vez de descer ao dó♯5: a dissonância essencial fica sem resolução, e a cadência perde a condução 4̂–3̂." }),
        op("A maior", "C#5/1 D5 F#5 E5 D5 C#5 B4/2 A4/4", ORN_B, ORN_C,
          { por: "Ré5 no 2º tempo do c. 1 chega por grau (dó♯5) e sai por salto na mesma direção (fá♯5): não é passagem (que continua por grau) nem escapada (que salta para o lado oposto). É uma nota solta sobre o I." }),
      ],
      e: "Si4 é passagem (dó♯–si–lá) no tempo fraco; mi5 chega por salto ao tempo forte do IV e desce ao ré5 — apojatura; dó♯5 cai com o baixo do V e continua por grau ao si4 — passagem acentuada. Cada nota estranha vem de uma nota do acorde e vai a outra por um caminho conhecido.",
      verificar: { perfil: { ...ORN }, contexto: { nivel: 6 } } },
    { p: "Dó maior, sobre I – I6 – IV – V – I. Os três sopranos estão corretos e chegam ao mesmo si5 agudo. Qual usa melhor a dissonância?",
      o: [
        op("C maior", "C5/1 D5 E5 G5 B5 A5 G5 D5 C5/4", "C3/2 E3 F3 G3 C3/4", "I I6 IV V I"),
        op("C maior", "C5/1 D5 E5 G5 A5 B5 G5 D5 C5/4", "C3/2 E3 F3 G3 C3/4", "I I6 IV V I",
          { por: "O si5 vem no 2º tempo do c. 2 como escapada (sobe do lá5 e salta para o sol5): a nota mais aguda passa num tempo fraco, sem apoio, e o compasso do clímax fica sem acento. As notas são quase as mesmas da melhor versão; o lugar métrico muda tudo." }),
        op("C maior", "C5/1 G5 F5 E5 G5 F5 E5 D5 C5/4", "C3/2 E3 F3 G3 C3/4", "I I6 IV V I",
          { por: "Uma dissonância em cada tempo forte (fá5 sobre mi3, sol5 sobre fá3, mi5 sobre sol3): o suspiro vira tique. A linha repete sol–fá–mi duas vezes, o ponto alto não se destaca, e a ênfase usada em todo lugar deixa de enfatizar." }),
      ],
      e: "Passagem nos tempos fracos (ré5 no c. 1), e uma só dissonância acentuada: o si5 chega por salto ao 1º tempo do IV e resolve no lá5 — a apojatura coincide com o ponto mais alto da frase. A nota estranha é o acento; por isso ela vale mais quando é rara e está no lugar certo." },
    { p: "Lá menor. A quebra pedida: uma apojatura que não resolve por grau (licença romântica). Em qual versão a quebra soa como gesto, e não como erro?",
      o: [
        op("A menor", "C5/2 B4/2 A4/1 C5 G5 D5 B4/2 A4/2", "A2/2 G#2/2 A2/2 D3/2 E3/2 A2/2", "i V6 i iv V i"),
        op("A menor", "C5/2 B4/2 A4/1 G5 C5 D5 B4/2 A4/2", "A2/2 G#2/2 A2/2 D3/2 E3/2 A2/2", "i V6 i iv V i",
          { por: "Sol5 no 2º tempo do c. 2 entra e sai por salto num tempo fraco: sem apoio métrico não há apojatura, livre ou não — é só uma nota fora do acorde i, sem explicação." }),
        op("A menor", "C5/2 B4/2 A4/1 C5 G5 D5 E5/2 A4/2", "A2/2 G#2/2 A2/2 D3/2 E3/2 A2/2", "i V6 i iv V i",
          { por: "A apojatura livre está no lugar certo, mas a saída dela (ré5 sobre ré3) vai em 8ªs paralelas para mi5 sobre mi3. A quebra só soa intencional num tecido correto em volta." }),
        op("A menor", "C5/2 B4/2 A4/1 C5 G5 D5 D5/2 A4/2", "A2/2 G#2/2 A2/2 D3/2 E3/2 A2/2", "i V6 i iv V7 i",
          { por: "Além da apojatura livre, o ré5 do V7 (a 7ª) salta para lá4 sem resolver: duas dissonâncias sem resolução seguidas, e a licença vira descuido." }),
      ],
      e: "Sol5 é o ponto mais alto, cai no tempo forte do iv, chega por salto e sai por salto para o ré5 (nota do acorde): a resolução (fá5) fica subentendida. Todo o resto é estrito — por isso a quebra se ouve como suspiro interrompido.",
      verificar: { perfil: { ...ORN }, contexto: { nivel: 6, ornLicencas: ["apojatura_livre"] } } },
  ]);

  // ================================================================== RETARDOS NA HARMONIA
  const RH_B = "C3/2 A2/2 Bb2/1 G2/1 F2/2 Bb2/4";
  const RH_C = "ii V6 I IV6 V I";
  T.perguntas("retardos_harm", [
    { p: "Si♭ maior: um 7–6 sobre o V6 e um 4–3 sobre o V da cadência. Qual versão está correta?",
      o: [
        op("Bb maior", "C5/1 G4/1~ G4/1 F4/1 F4/1 Bb4/1~ Bb4/1 A4/1 Bb4/4", RH_B, RH_C),
        op("Bb maior", "G4/3 F4/1 F4/1 Bb4/1~ Bb4/1 A4/1 Bb4/4", RH_B, RH_C,
          { por: "O sol4 do c. 1 é atacado no 1º tempo e preso até o 3º: a preparação cai num tempo mais forte que a dissonância, e a 7ª sobre o lá2 soa como nota que sobrou, não como tensão. A preparação vai no tempo fraco (2º)." }),
        op("Bb maior", "C5/1 G4/1~ G4/1 F4/1 F4/1 Bb4/1~ Bb4/1 C5/1 Bb4/4", RH_B, RH_C,
          { por: "O si♭4 preso sobre o fá3 (4ª, c. 2) sobe ao dó5: a dissonância resolve para cima e a 3ª do V (lá, a sensível) nunca chega. No estilo estrito o retardo desce por grau." }),
        op("Bb maior", "C5/1 G4/1~ G4/1 F4/1 F4/1 Bb4/1~ Bb4/1 F5/1 D5/4", RH_B, RH_C,
          { por: "O si♭4 preso sobre o fá3 salta para o fá5 em vez de descer ao lá4: o 4–3 fica sem resolução, e a dominante perde a sensível justamente na cadência." }),
      ],
      e: "Sol4 preparado no 2º tempo (nota do ii), preso sobre o lá2 do V6 (7ª), resolvido no fá4 (6ª); si♭4 atacado no 2º tempo do c. 2 (nota do IV6), preso sobre o fá2 (4ª) e resolvido no lá4 (3ª). Preparação fraca, dissonância forte, resolução um grau abaixo.",
      verificar: { perfil: { ...ORN }, contexto: { nivel: 6 } } },
    { p: "Uma cadeia de retardos 9–8 em lá menor, sobre i – VII – VI – V. O verificador não aponta erro nenhum. Por que ela soa pobre?",
      partitura: sb("A menor", "C5/1 A4/1~ A4/1 G4/1~ G4/1 F4/1~ F4/1 E4/1 E4/4", "A3/2 G3/2 F3/2 E3/2 A2/4"),
      cifras: cif("A3/2 G3/2 F3/2 E3/2 A2/4", "i VII VI V i"),
      o: [
        "Cada 9ª resolve numa 8ª com o baixo (sol/sol, fá/fá, mi/mi nos tempos fracos): são 8ªs paralelas apenas deslocadas pelo atraso. O retardo adia a paralela, não a esconde — por isso as cadeias clássicas são de 7–6 em cima ou 2–3 no baixo, que resolvem em consonâncias imperfeitas",
        { texto: "As notas presas não foram preparadas por consonância", por: "Foram: lá4 sobre lá3, sol4 sobre sol3, fá4 sobre fá3 — todas 8ªs (o que, aliás, é parte do problema)." },
        { texto: "O fá4 sobre o mi3 é uma 9ª menor, que não pode ser retardo", por: "A 9ª menor sobre a dominante é um retardo normal (♭9–8): fá4 desce ao mi4, nota do acorde." },
        { texto: "VI → V é uma retrogressão", por: "Em menor, VI é pré-dominante: VI → V é PD → D, o caminho normal (é o fim do baixo de lamento lá–sol–fá–mi)." },
      ],
      e: "Os tratados avisam que o 9–8 não se encadeia: as resoluções caem todas na 8ª, e o ouvido percebe a sequência de 8ªs nos tempos fracos. Troque o baixo por acordes de sexta e as 9ªs por 7ªs (7–6) — as resoluções viram 6ªs e a cadeia ganha o tecido imperfeito de Corelli." },
    { p: "Ré maior, cadência IV – V – I. Três maneiras de quebrar a regra do retardo (que desce). Qual é a retardação que a tradição consagrou como fórmula de cadência?",
      o: [
        op("D maior", "B4/2 A4/1 C#5/1~ C#5/2 D5/2", "G2/2 A2/2 D3/4", "IV V I"),
        op("D maior", "B4/1 D5/1~ D5/1 E5/1 F#5/4", "G2/2 A2/2 D3/4", "IV V I",
          { por: "O ré5 preso sobre o lá2 (4ª) sobe ao mi5: a 4ª vira 5ª e a 3ª do V (dó♯, a sensível) nunca soa. Sem a atração da sensível, a subida soa como um 4–3 que errou de direção." }),
        op("D maior", "G4/1 C#5/1 E5/2~ E5/2 F#5/2", "G2/2 A2/2 D3/4", "IV V I",
          { por: "O mi5 preso sobre o ré3 (9ª) sobe ao fá♯5: um 9–10. A 9ª sobre a tônica pede o ré5 (9–8); subindo, a dissonância não tem a tendência de semitom que justificaria a direção, e o ouvido continua esperando o ré." }),
      ],
      e: "O dó♯5, sensível do V, fica preso sobre o ré3 (7ª maior) e sobe meio tom ao ré5. O atraso é o mesmo de um 4–3, mas a direção é a da sensível — por isso a resolução para cima é ouvida como natural. Fora da sensível, o retardo que sobe soa como erro de direção." },
  ]);
})(this);
