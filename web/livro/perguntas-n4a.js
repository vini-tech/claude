/* Perguntas de antes dos exercícios · nível 4 (cromatismo): dominantes secundárias, sensíveis secundárias e
 * cadeias, empréstimo modal, sexta napolitana, sextas aumentadas e sextas aumentadas além do V.
 * Perguntas de julgamento, com partitura (par externo + cifras). Formato em docs/guia-perguntas.md. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const { TONAL } = T.perfis;

  // cifras [[tempo em semínimas, cifra], …] a partir da linha do baixo (uma cifra por nota do baixo)
  function cif(partitura, simbolos) {
    const linha = partitura.split("\n").find((l) => /^baixo:/.test(l));
    const sim = simbolos.trim().split(/\s+/);
    let t = 0, d = 1, i = 0;
    const r = [];
    for (const tok of linha.replace(/^baixo:/, "").trim().split(/\s+/)) {
      const m = /\/([\d.]+)/.exec(tok);
      if (m) d = parseFloat(m[1]);
      if (!/^P/.test(tok)) r.push([t, sim[i++]]);
      t += d;
    }
    return r;
  }
  const par = (tom, soprano, baixo) => `tom: ${tom}\nsoprano: ${soprano}\nbaixo: ${baixo}`;
  // alternativa em partitura com as cifras já calculadas
  const alt = (tom, soprano, baixo, simbolos, resto = {}) => {
    const partitura = par(tom, soprano, baixo);
    return { partitura, cifras: cif(partitura, simbolos), ...resto };
  };

  // perfis dos capítulos (os mesmos de secundarias.js e aumentadas.js), sem as regras de peça inteira:
  // os trechos são curtos e não terminam necessariamente na cadência do plano
  const BASE = { ...TONAL };
  delete BASE.intervalo_melodico_aumentado_diminuto;
  delete BASE.cadencias_do_plano;
  const CROM = { ...BASE, sec_intervalo_melodico: "erro", sec_falsa_relacao: "erro", sec_resolve_no_alvo: "erro" };
  const MIST = { ...CROM, sec_sexto_abaixado_desce: "erro" };
  const NAP = { ...MIST, sec_napolitana_desce: "erro" };
  delete NAP.napolitana_resolve;
  const { intervalo_melodico_aumentado_diminuto: _i, dissonancia_aproximacao: _d, cifras_coerentes: _c, cadencias_do_plano: _p, ...BASE_AUM } = TONAL;
  const AUM = { ...BASE_AUM, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", aum_resolucao: "erro", aum_ger_64: "erro" };
  delete AUM.aumentada_resolve;
  const CTX = { nivel: 6, plano: {} };

  // ================================================================ dominantes secundárias
  T.perguntas("secundarias", [
    { p: "Ré maior: si7 (V65/ii, ré♯ no baixo) tonicizando mi menor. Qual versão está correta?",
      o: [
        alt("D maior", "A5/2 A5/2 G5/2 G5/2 F#5/4", "D3/2 D#3/2 E3/2 A2/2 D3/4", "I V65/ii ii V7 I"),
        alt("D maior", "D5/2 B4/2 B4/2 C#5/2 D5/4", "D3/2 D#3/2 E3/2 A2/2 D3/4", "I V65/ii ii V I",
          { por: "Ré5 no soprano e logo ré♯3 no baixo: falsa relação. O cromatismo devia ficar numa voz (ré–ré♯–mi no baixo)." }),
        alt("D maior", "A5/2 A5/2 G5/2 G5/2 F#5/4", "D3/2 D#3/2 G3/2 A3/2 D3/4", "I V65/ii ii6 V7 I",
          { por: "Ré♯3 → sol3: 4ª diminuta, e a sensível de mi não sobe. Com ré♯ no baixo, o baixo tem de ir a mi." }),
        alt("D maior", "A5/2 A5/2 B5/2 G5/2 F#5/4", "D3/2 D#3/2 E3/2 A2/2 D3/4", "I V65/ii ii V7 I",
          { por: "Lá5, 7ª do si7, sobe a si5: a 7ª resolve para cima. E o sol5 do V7 chega por salto." }),
      ],
      e: "Ré♯ (sensível de mi) sobe no baixo. Lá5, nota comum, vira 7ª do V65/ii e desce a sol5, que vira 7ª do V7 e desce a fá♯5: dissonâncias preparadas e resolvidas para baixo.",
      verificar: { perfil: CROM, contexto: CTX } },

    { p: "O si7 (V7/vi) do c. 1 não vai a mi menor. Erro ou recurso?",
      partitura: par("G maior", "B4/2 D#5/2 E5/2 D5/1 C5/1 B4/4", "G2/2 B2/2 C3/2 D3/2 G2/4"),
      cifras: cif(par("G maior", "B4/2", "G2/2 B2/2 C3/2 D3/2 G2/4"), "I V7/vi IV V7 I"),
      o: [
        "Recurso: engano secundário. Sensível e 7ª resolvem; só o alvo muda (baixo si → dó), e o IV soa como chegada",
        { texto: "Erro: o ré♯5 do soprano não resolve", por: "Ré♯5 sobe a mi5, 3ª do IV: a sensível resolve; o que muda é o baixo." },
        { texto: "Erro: falsa relação entre o ré♯5 do c. 1 e o ré5 do c. 2", por: "Ré♯ e ré estão na mesma voz (soprano): não há falsa relação." },
        { texto: "É uma modulação para mi menor, interrompida pelo IV", por: "Mi menor nem soa, e V7–I de sol confirma o tom logo depois." },
      ],
      e: "Só 'V/x vai a x' é quebrada; sensível sobe e 7ª desce continuam valendo, por isso o desvio soa intencional. Perde-se o vi; o IV ganha peso de chegada." },

    { p: "Três semicadências em fá maior, todas corretas. Qual usa melhor a dominante secundária?",
      o: [
        alt("F maior", "A5/2 F5/1 F5/1 E5/4", "F2/2 Bb2/1 B2/1 C3/4", "I IV V65/V V"),
        alt("F maior", "A5/2 F5/2 F5/3 E5/1", "F2/2 Bb2/2 B2/3 C3/1", "I IV V65/V V",
          { por: "V65/V no tempo forte e V no tempo fraco: a chegada soa como anacruse da preparação." }),
        alt("F maior", "A5/2 G5/1 G5/1 E5/4", "F2/2 Bb2/1 G2/1 C3/4", "I ii6 V/V V",
          { por: "Si♭ no baixo e si♮ numa voz interna: falsa relação implícita, e o baixo sol–dó salta. A sensível não se ouve subir." }),
      ],
      e: "A: si♭–si♮–dó numa voz (baixo); fá5, nota comum, vira 7ª e desce a mi5. O acorde secundário no tempo fraco empurra o V ao tempo forte." },
  ]);

  // ================================================================ sensíveis secundárias e cadeias
  T.perguntas("secundarias2", [
    { p: "Lá maior: sensível diminuta (lá♯ no baixo) antes do ii. Qual versão está correta?",
      o: [
        alt("A maior", "E5/2 G5/2 F#5/2 G#5/2 A5/4", "A2/2 A#2/2 B2/2 E2/2 A2/4", "I vii°7/ii ii V I"),
        alt("A maior", "E5/2 G#5/2 F#5/2 G#5/2 A5/4", "A2/2 A#2/2 B2/2 E2/2 A2/4", "I vii°7/ii ii V I",
          { por: "Sol♯5 faz o acorde meio-diminuto, fora da cifra. Antes de alvo menor a 7ª é diminuta: sol♮, de si menor." }),
        alt("A maior", "A5/2 G5/2 F#5/2 G#5/2 A5/4", "A2/2 A#2/2 B2/2 E2/2 A2/4", "I vii°7/ii ii V I",
          { por: "Lá5 no soprano e logo lá♯2 no baixo: falsa relação." }),
        alt("A maior", "E5/2 G5/2 D5/2 D5/2 C#5/4", "A2/2 A#2/2 B2/2 E2/2 A2/4", "I vii°7/ii ii V7 I",
          { por: "Sol5 (7ª dim.) salta a ré5 em vez de descer a fá♯5: não resolve." }),
      ],
      e: "Lá♯ sobe a si; sol5 (7ª dim., de si menor) desce a fá♯5. O viiø7 (com sol♯) só serve antes de alvo maior.",
      verificar: { perfil: CROM, contexto: CTX } },

    { p: "No c. 2 o ré♯ do baixo (sensível de mi) desce a ré. Por que funciona?",
      partitura: par("D maior", "F#5/1 D5/1 C#5/2 B4/4 A4/2 F#5/2 G5/2 E5/2 D5/4", "D3/2 E3/2 D#3/2 D3/2 C#3/2 D3/2 E3/2 A3/2 D3/4"),
      cifras: cif(par("D maior", "F#5/1", "D3/2 E3/2 D#3/2 D3/2 C#3/2 D3/2 E3/2 A3/2 D3/4"), "I V42/vi V65/ii V42/V V65 I ii V7 I"),
      o: [
        "Resolução elidida: o alvo chega já como mi7 (V42/V), e o ré♯ desce a ré, a 7ª dele",
        { texto: "Não funciona: a sensível sobe sempre; devia estar em estado fundamental", por: "Na cadeia a sensível desce para virar a 7ª seguinte; em estado fundamental o baixo só saltaria." },
        { texto: "O ré♯ é uma nota de passagem cromática, fora da harmonia", por: "Ré♯3 é atacado com cifra própria: 3ª do si7, nota do acorde." },
        { texto: "É uma falsa relação, tolerada porque passa rápido", por: "Ré♯ e ré estão na mesma voz (baixo): não há falsa relação." },
      ],
      e: "Na cadeia quebra-se 'a sensível sobe' e mantém-se 'a 7ª desce'. O baixo desliza por semitons sob o si4 parado, e só V65 → I confirma ré." },

    { p: "Mi menor, baixo lá–lá♯–si–mi (vii°7/V → V → i). Qual soprano está correto?",
      partitura: par("E menor", "G5/2 E5/2", "E3/2 A3/2"),
      cifras: [[0, "i"], [2, "iv"]],
      o: [
        alt("E menor", "G5/2 E5/2 E5/2 D#5/2 E5/4", "E3/2 A3/2 A#3/2 B3/2 E3/4", "i iv vii°7/V V i"),
        alt("E menor", "G5/2 E5/2 G5/2 G5/2 G5/4", "E3/2 A3/2 A#3/2 B3/2 E3/4", "i iv vii°7/V V i",
          { por: "Sol5 (7ª dim.) fica parado sobre o V, onde não cabe: devia descer a fá♯5." }),
        alt("E menor", "G5/2 E5/2 A#4/2 B4/2 G4/4", "E3/2 A3/2 A#3/2 B3/2 E3/4", "i iv vii°7/V V i",
          { por: "Mi5 → lá♯4: trítono, e lá♯–si nas duas vozes dá 8ªs paralelas (sensível dobrada)." }),
        alt("E menor", "G5/2 E5/2 E5/2 E5/2 E5/4", "E3/2 A3/2 A#3/2 B3/2 E3/4", "i iv vii°7/V V i",
          { por: "Mi5 (5ª dim.) fica parado sobre o V, fora do acorde: devia descer a ré♯." }),
      ],
      e: "Mi5, comum ao iv e ao lá♯°7 (5ª dim.), desce a ré♯5 enquanto lá♯ sobe a si: as vozes externas convergem por semitom.",
      verificar: { perfil: CROM, contexto: CTX } },
  ]);

  // ================================================================ empréstimo modal
  T.perguntas("emprestimo", [
    { p: "Sol maior: ♭VI (mi♭–sol–si♭) antes do V. Qual versão está correta?",
      o: [
        alt("G maior", "D5/2 G5/2 G5/2 F#5/2 G5/4", "G3/2 E3/2 Eb3/2 D3/2 G2/4", "I vi bVI V I"),
        alt("G maior", "D5/2 E5/2 G5/2 F#5/2 G5/4", "G3/2 E3/2 Eb3/2 D3/2 G2/4", "I vi bVI V I",
          { por: "Mi5 no soprano e logo mi♭3 no baixo: falsa relação." }),
        alt("G maior", "D5/2 G5/2 Eb5/2 D5/2 B4/4", "G3/2 E3/2 Eb3/2 D3/2 G2/4", "I vi bVI V I",
          { por: "Mi♭5 sobre mi♭3 dobra o ♭6 (8ª direta) e ambos descem a ré: 8ªs paralelas." }),
        alt("G maior", "D5/2 G5/2 G5/2 F#5/2 G5/4", "G3/2 Eb3/2 E3/2 D3/2 G2/4", "I bVI vi V I",
          { por: "Ordem trocada: mi♭ sobe a mi♮, contra a tendência; soa como correção, não cor." }),
      ],
      e: "Baixo mi–mi♭–ré: o ♭6 desce cromaticamente ao 5º grau; sol5 é nota comum. O ♭VI vem depois do vi, para o escurecimento ser ouvido.",
      verificar: { perfil: MIST, contexto: CTX } },

    { p: "De fá menor a fá maior: no c. 2 o ré♭ do soprano sobe a ré♮. Por que funciona?",
      partitura: par("F maior", "C5/2 Db5/2 D5/2 E5/2 F5/4", "F3/2 Bb2/2 Bb2/2 C3/2 F2/4"),
      cifras: cif(par("F maior", "C5/2", "F3/2 Bb2/2 Bb2/2 C3/2 F2/4"), "i iv IV V I"),
      o: [
        "A subida marca a troca de modo: iv vira IV na mesma voz e o maior se confirma logo (V–I)",
        { texto: "Porque o ré♭ é uma nota de passagem cromática entre dó e ré", por: "Ré♭5 é atacado sobre o iv e dura uma mínima: é nota do acorde (3ª de si♭ menor)." },
        { texto: "Não funciona: é falsa relação entre ré♭ e ré", por: "Ré♭ e ré estão na mesma voz: é inflexão cromática, não falsa relação." },
        { texto: "Funciona porque a frase modula para si♭ maior", por: "Não há cadência em si♭: é o IV de fá, e a frase fecha com V–I de fá." },
      ],
      e: "'O ♭6 desce' vale para a cor local. Na troca de modo, a nota abaixada pode subir — desde que o maior se confirme logo." },

    { p: "Lá maior, cadência escurecida pelo fá♮ (♭6). Todas corretas: qual usa melhor o empréstimo?",
      o: [
        alt("A maior", "C#5/2 F#5/2 F5/2 E5/1 D5/1 C#5/4", "A2/2 D3/2 D3/2 E3/2 A2/4", "I IV iv V7 I"),
        alt("A maior", "C#5/2 D5/2 F5/2 E5/1 D5/1 C#5/4", "A2/2 D3/4 E3/2 A2/4", "I iv V7 I",
          { por: "Sem IV antes, o fá♮ chega por salto e não há fá♯ para escurecer: a cor não soa como mudança." }),
        alt("A maior", "E5/1 F5/1 E5/1 F5/1 E5/2 D5/2 C#5/4", "A2/1 D3/1 C#3/1 D3/1 E3/2 E3/2 A2/4", "I iv I6 iv V V7 I",
          { por: "Fá♮ duas vezes em bordadura mi–fá–mi: a cor se gasta antes da cadência." }),
      ],
      e: "A: IV antes, e fá♯–fá–mi na mesma voz; o ♭6 cai no 5º grau sobre o V7. O maior precisa soar antes do menor." },
  ]);

  // ================================================================ sexta napolitana
  T.perguntas("napolitana", [
    { p: "Mi menor: N6 (fá maior, lá no baixo) a caminho do V. Qual versão está correta?",
      o: [
        alt("E menor", "G5/2 F5/2 E5/1 D#5/1 E5/2", "E3/2 A3/2 B3/1 B3/1 E3/2", "i N6 i64 V i"),
        alt("E menor", "G5/2 F5/2 F#5/2 E5/2", "E3/2 A3/2 B3/2 E3/2", "i N6 V7 i",
          { por: "Fá5 (♭2) sobe a fá♯5: vai para o lado errado e apaga a cor napolitana." }),
        alt("E menor", "G5/2 F5/2 F5/2 E5/2", "E3/2 A3/2 B3/2 E3/2", "i N6 V7 i",
          { por: "Fá5 parado sobre o V7 choca com o fá♯ do acorde." }),
        alt("E menor", "G5/2 F5/2 D#5/2 E5/2", "E3/2 F3/2 B2/2 E3/2", "i N V7 i",
          { por: "Fá no baixo: trítono fá–si e ♭2 dobrado. A N6 leva o 4º grau (lá) no baixo." }),
      ],
      e: "O ♭2 desce à tônica no i6/4 e à sensível: fá–mi–ré♯–mi. Baixo lá–si (4º → 5º), como no iv6.",
      verificar: { perfil: NAP, contexto: CTX } },

    { p: "Em sol maior a N6 traz lá♭ e mi♭, mas aqui soa suave. Por quê?",
      partitura: par("G maior", "B4/2 A4/1 Ab4/1 G4/2 F#4/2 G4/4", "G2/2 C3/1 C3/1 D3/2 D3/2 G2/4"),
      cifras: cif(par("G maior", "B4/2", "G2/2 C3/1 C3/1 D3/2 D3/2 G2/4"), "I ii6 N6 I64 V7 I"),
      o: [
        "O ii6 tem o mesmo baixo: a N6 só abaixa lá e mi, cada um na sua voz, e o lá♭ segue descendo",
        { texto: "Porque a napolitana está em estado fundamental, como o ii6", por: "Baixo dó = 3ª de lá♭: é 1ª inversão (N6), como o ii6." },
        { texto: "Porque o lá♭ volta a lá natural no V7", por: "Lá♭4 desce a sol4 e fá♯4; o lá♮ não volta." },
        { texto: "Porque o lá♭ é uma nota de passagem, não do acorde", por: "Lá♭4 é atacado com o baixo: é a 6ª sobre dó, nota do acorde." },
      ],
      e: "A N6 é uma inflexão do ii6: mesmo baixo, duas notas abaixadas por semitom. O ouvido segue lá–lá♭–sol, e o ♭2 resolve no I6/4." },

    { p: "Ré menor: N em estado fundamental (trítono do baixo liberado). Qual versão quebra a regra com controle?",
      o: [
        alt("D menor", "F5/2 D5/2 Eb5/2 C#5/2 D5/4", "D3/2 Bb2/2 Eb3/2 A2/2 D3/4", "i VI N V7 i"),
        alt("D menor", "F5/2 D5/2 Eb5/2 E5/2 D5/4", "D3/2 Bb2/2 Eb3/2 A2/2 D3/4", "i VI N V7 i",
          { por: "Mi♭5 sobe a mi5: ♭2 para cima e falsa relação com o mi♭ do baixo. Devia ir a dó♯." }),
        alt("D menor", "F5/2 D5/2 Bb4/2 E5/2 F5/4", "D3/2 Bb2/2 Eb3/2 A3/2 D3/4", "i VI N V7 i",
          { por: "Mi♭–lá contra si♭–mi: 5ªs paralelas e falsa relação mi♭/mi. A quebra exige o resto limpo." }),
      ],
      e: "A: o trítono do baixo é o único desvio; o soprano faz a 3ª dim. mi♭–dó♯ e chega à tônica por semitom, em movimento contrário.",
      verificar: { perfil: { ...NAP, sec_intervalo_melodico: "info" }, contexto: CTX } },
  ]);

  // ================================================================ sextas aumentadas
  T.perguntas("aumentadas", [
    { p: "Mi menor: iv6 → It6 (dó–mi–lá♯) → V. Qual versão está correta?",
      o: [
        alt("E menor", "G4/2 A4/1 A#4/1 B4/2 G4/2", "E3/2 C3/1 C3/1 B2/2 E3/2", "i iv6 It6 V i"),
        alt("E menor", "G4/2 C5/1 A#4/1 B4/2 G4/2", "E3/2 C3/1 C3/1 B2/2 E3/2", "i iv6 It6 V i",
          { por: "Dó5 → lá♯4: 3ª diminuta; o ♯4 chega por salto, sem a passagem lá–lá♯–si." }),
        alt("E menor", "G4/2 A4/1 C5/1 B4/2 G4/2", "E3/2 C3/1 C3/1 B2/2 E3/2", "i iv6 It6 V i",
          { por: "Dó5 sobre dó3 dobra o ♭6; ambos descem a si: 8ªs paralelas." }),
        alt("E menor", "G4/2 A4/1 A#4/1 F#4/2 G4/2", "E3/2 C3/1 C3/1 B2/2 E3/2", "i iv6 It6 V i",
          { por: "Lá♯4 cai a fá♯4 em vez de subir a si: não abre, e 5ª direta." }),
      ],
      e: "Sobre o dó (♭6) do iv6, lá sobe a lá♯: It6. Dó3–lá♯4 abre na oitava si2–si4 — frígia com duas sensíveis.",
      verificar: { perfil: AUM, contexto: CTX } },

    { p: "Fá menor: Ger65 direto ao V ('quintas de Mozart'). Qual é a quebra aceitável?",
      o: [
        alt("F menor", "Ab4/2 Bb4/1 B4/1 C5/2 Ab4/2", "F3/2 Bb2/1 Db3/1 C3/2 F2/2", "i iv Ger65 V i"),
        alt("F menor", "Ab4/2 Bb4/1 Ab4/1 G4/2 Ab4/2", "F3/2 Bb2/1 Db3/1 C3/2 F2/2", "i iv Ger65 V i",
          { por: "Lá♭4/ré♭3 → sol4/dó3: 5ªs nas vozes externas. Só se toleravam numa voz interna." }),
        alt("F menor", "Ab4/2 Db5/1 Db5/1 C5/2 C5/2", "F3/2 Bb2/1 Db3/1 C3/2 F2/2", "i iv Ger65 V i",
          { por: "Ré♭5 sobre ré♭3 dobra o ♭6; ambos descem a dó: 8ªs paralelas." }),
        alt("F menor", "Ab4/2 Bb4/1 B4/1 G4/2 Ab4/2", "F3/2 Bb2/1 Db3/1 C3/2 F2/2", "i iv Ger65 V i",
          { por: "Si♮4 salta a sol4 em vez de subir a dó5: não abre, e 5ª direta." }),
      ],
      e: "Si♮4 (♯4) sobe a dó5: as externas abrem em oitava. As 5ªs ficam numa voz interna, encobertas pelas resoluções por semitom.",
      verificar: { perfil: { ...AUM, aum_ger_64: "info" }, contexto: CTX } },

    { p: "Sol maior: três chegadas à Ger65 e ao I6/4, todas corretas. Qual conduz melhor?",
      o: [
        alt("G maior", "B4/2 C5/1 C#5/1 D5/1 C5/1 B4/2", "G2/2 E3/1 Eb3/1 D3/1 D3/1 G2/2", "I IV6 Ger65 I64 V7 I"),
        alt("G maior", "B4/2 C#5/2 D5/1 C5/1 B4/2", "G2/2 Eb3/2 D3/1 D3/1 G2/2", "I Ger65 I64 V7 I",
          { por: "Sem pré-dominante: o baixo salta a mi♭ e o dó♯ não nasce de um dó." }),
        alt("G maior", "B4/2 E5/1 C#5/1 D5/1 C5/1 B4/2", "G2/2 C3/1 Eb3/1 D3/1 D3/1 G2/2", "I IV Ger65 I64 V7 I",
          { por: "Dó♯5 por salto de mi5 e baixo dó–mi♭: nenhuma sensível nasce de uma linha." }),
      ],
      e: "A: baixo mi–mi♭–ré, soprano dó–dó♯–ré. As sensíveis nascem do IV6 por semitom e abrem na oitava do ré." },
  ]);

  // ================================================================ sextas aumentadas além do V
  T.perguntas("aumentadas2", [
    { p: "Sol maior: baixo mi–mi♭ como para Ger65, mas resolve em lá♭ maior. Qual está escrita e cifrada certo?",
      o: [
        alt("G maior", "B4/1 C5/1 Db5/2 C5/4", "G2/1 E3/1 Eb3/2 Ab2/4", "I IV6 Ger65=Ab:V7 Ab:I", { texto: "ré♭ → dó; cifra Ger65=Ab:V7" }),
        alt("G maior", "B4/1 C5/1 C#5/2 C5/4", "G2/1 E3/1 Eb3/2 Ab2/4", "I IV6 Ger65=Ab:V7 Ab:I",
          { texto: "dó♯ → dó; cifra Ger65=Ab:V7", por: "Dó♯ promete subir a ré e desce a dó. Como 7ª de mi♭7, a nota é ré♭." }),
        alt("G maior", "B4/1 C5/1 Db5/2 C5/4", "G2/1 E3/1 Eb3/2 Ab2/4", "I IV6 Ger65 Ab:I",
          { texto: "ré♭ → dó; cifra Ger65", por: "Sem =Ab:V7, a cifra pede dó♯ e o baixo mi♭ → ré, não o salto a lá♭." }),
        alt("G maior", "B4/1 C5/1 Db5/2 Db5/4", "G2/1 E3/1 Eb3/2 Ab2/4", "I IV6 Ger65=Ab:V7 Ab:I",
          { texto: "ré♭ parado; cifra Ger65=Ab:V7", por: "Ré♭5, 7ª do mi♭7, fica parado sobre lá♭ maior: não resolve. Devia descer a dó." }),
      ],
      e: "Mi♭7 soa igual à Ger65 de sol. Indo a lá♭, a nota é 7ª e desce (ré♭ → dó), o baixo salta uma 5ª, e a cifra mostra as duas leituras.",
      verificar: { perfil: AUM, contexto: CTX } },

    { p: "Ré maior: si♭–ré–fá–lá♭ (c. 1) soa como Ger65 de ré, mas não abre ao lá. O que acontece? Modula?",
      partitura: par("D maior", "F#5/1 G5/1 Ab5/2 G5/2 F#5/1 E5/1 D5/4", "D3/1 B2/1 Bb2/2 G2/2 A2/1 A2/1 D3/4"),
      cifras: cif(par("D maior", "F#5/1", "D3/1 B2/1 Bb2/2 G2/2 A2/1 A2/1 D3/4"), "I IV6 Ger65=Eb:V7 D:N6=Eb:I6 D:I64 V7 I"),
      o: [
        "V7 de mi♭: lá♭5 (7ª) desce a sol5; o mi♭ é a N6 de ré, que vai a I6/4–V7–I. Sem cadência em mi♭, não modula",
        { texto: "É uma sexta alemã mal resolvida: o sol♯ devia subir a lá", por: "Não há sol♯: lá♭ desce a sol, como 7ª de dominante." },
        { texto: "A frase modula para mi♭ maior", por: "Mi♭ soa um só acorde, já como N6 de ré, e I6/4–V7–I confirma ré." },
        { texto: "É uma cadência de engano da sexta alemã", por: "Não: si♭7 resolve como dominante (7ª desce) num acorde fora do tom." },
      ],
      e: "Lido o ♯4 como 7ª (sol♯ = lá♭), o acorde vira dominante do ♭II; como ♭II é a napolitana, a volta é imediata. Enarmonia como cor." },

    { p: "Si♭ maior: o soprano sobe cromaticamente de dó ao ré do I6/4, via sexta aumentada. Todas passam: qual é melhor?",
      o: [
        alt("Bb maior", "D5/2 C5/1 C#5/1 D5/1 C5/1 Bb4/2", "Bb2/2 Eb3/1 Gb3/1 F3/1 F3/1 Bb2/2", "I ii6 Ger65 I64 V I"),
        alt("Bb maior", "D5/2 C5/1 Db5/1 D5/1 C5/1 Bb4/2", "Bb2/2 Eb3/1 Gb3/1 F3/1 F3/1 Bb2/2", "I ii6 Ger65 I64 V I",
          { por: "Ré♭ promete descer e sobe a ré♮: a grafia contradiz a condução. A nota que sobe se escreve dó♯." }),
        alt("Bb maior", "D5/2 C5/2~ C5/2 D5/2", "Bb2/2 Eb3/1 Gb3/1 F3/2 Bb2/2", "I ii6 Fr43 V I",
          { por: "A francesa segura o dó e vai direto ao V: a subida cromática ao 3º do I6/4 não acontece." }),
      ],
      e: "Dó–dó♯–ré: a alemã com dó♯ (4ª dupl. aum. sobre sol♭) mostra que a nota sobe ao ré do I6/4. A grafia conta a condução." },
  ]);
})(this);
