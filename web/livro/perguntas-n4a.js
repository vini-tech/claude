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
  const CROM = { ...BASE, sec_intervalo_melodico: "erro", sec_falsa_relacao: "erro", sec_sensivel_sobe: "erro", sec_setima_desce: "erro", sec_resolve_no_alvo: "erro" };
  const MIST = { ...CROM, sec_sexto_abaixado_desce: "erro" };
  const NAP = { ...MIST, sec_napolitana_desce: "erro" };
  const { intervalo_melodico_aumentado_diminuto: _i, dissonancia_aproximacao: _d, cifras_coerentes: _c, cadencias_do_plano: _p, ...BASE_AUM } = TONAL;
  const AUM = { ...BASE_AUM, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", aum_resolucao: "erro", aum_ger_64: "erro" };
  const CTX = { nivel: 6, plano: {} };

  // ================================================================ dominantes secundárias
  T.perguntas("secundarias", [
    { p: "Ré maior: o si7 (V65/ii, com ré♯ no baixo) tonicizando o mi menor. Qual versão está correta?",
      o: [
        alt("D maior", "A5/2 A5/2 G5/2 G5/2 F#5/4", "D3/2 D#3/2 E3/2 A2/2 D3/4", "I V65/ii ii V7 I"),
        alt("D maior", "D5/2 B4/2 B4/2 C#5/2 D5/4", "D3/2 D#3/2 E3/2 A2/2 D3/4", "I V65/ii ii V I",
          { por: "Ré5 no soprano sobre o I e, logo em seguida, ré♯3 no baixo: falsa relação. O ré natural e o ré♯ estão em vozes diferentes, e o cromatismo que devia ser uma linha (ré → ré♯ → mi no baixo) vira um choque entre as vozes." }),
        alt("D maior", "A5/2 A5/2 G5/2 G5/2 F#5/4", "D3/2 D#3/2 G3/2 A3/2 D3/4", "I V65/ii ii6 V7 I",
          { por: "O baixo vai de ré♯3 a sol3: 4ª diminuta, e a sensível de mi não sobe. O alvo pode vir invertido, mas com o ré♯ no baixo a sensível tem de ir ao mi — o ii6 aqui custa a própria tonicização." }),
        alt("D maior", "A5/2 A5/2 B5/2 G5/2 F#5/4", "D3/2 D#3/2 E3/2 A2/2 D3/4", "I V65/ii ii V7 I",
          { por: "Lá5 é a 7ª do si7 (V65/ii) e sobe a si5 sobre o ii: a dissonância resolve para cima, contra a tendência de toda 7ª de dominante. E o sol5 do V7 ainda chega por salto." }),
      ],
      e: "O ré♯ do baixo é a sensível de mi e sobe meio tom. O lá5 do soprano entra como nota comum do I e vira a 7ª do V65/ii, descendo a sol5 sobre o ii; o sol fica parado como 7ª do V7 e desce a fá♯5. As duas dissonâncias são preparadas e resolvem para baixo, e o cromatismo fica numa voz só.",
      verificar: { perfil: CROM, contexto: CTX } },

    { p: "O si7 (V7/vi) do c. 1 não vai ao mi menor. Erro ou recurso? O que a progressão mantém, e o que troca?",
      partitura: par("G maior", "B4/2 D#5/2 E5/2 D5/1 C5/1 B4/4", "G2/2 B2/2 C3/2 D3/2 G2/4"),
      cifras: cif(par("G maior", "B4/2", "G2/2 B2/2 C3/2 D3/2 G2/4"), "I V7/vi IV V7 I"),
      o: [
        "Recurso: é o engano secundário. A sensível (ré♯5) sobe a mi5 e a 7ª (lá, numa voz interna) desce a sol; só o alvo é trocado — o baixo sobe si → dó em vez de cair a mi, e o IV soa como chegada",
        { texto: "Erro: o ré♯5 do soprano não resolve", por: "Ré♯5 sobe meio tom a mi5, que é a 3ª do IV (dó–mi–sol): a sensível cumpre o seu papel; o que muda é o baixo." },
        { texto: "Erro: falsa relação entre o ré♯5 do c. 1 e o ré5 do c. 2", por: "Ré♯ e ré natural estão na mesma voz (o soprano), com o mi5 no meio. Falsa relação é a alteração passando de uma voz para outra, o que não acontece aqui." },
        { texto: "É uma modulação para mi menor, interrompida pelo IV", por: "O mi menor nem chega a soar: sem o alvo, não há sequer tonicização cumprida, muito menos cadência no tom novo. O V7–I de sol confirma o tom logo depois." },
      ],
      e: "A regra que se quebra é só 'o V/x vai a x'; 'a sensível sobe' e 'a 7ª desce' continuam valendo, e é por isso que o desvio soa intencional. Perde-se a confirmação do vi; ganha-se peso no IV, que chega como resolução e não como passagem." },

    { p: "Três semicadências em fá maior, todas corretas no par externo. Qual usa melhor a dominante secundária?",
      o: [
        alt("F maior", "A5/2 F5/1 F5/1 E5/4", "F2/2 Bb2/1 B2/1 C3/4", "I IV V65/V V"),
        alt("F maior", "A5/2 F5/2 F5/3 E5/1", "F2/2 Bb2/2 B2/3 C3/1", "I IV V65/V V",
          { por: "O V65/V ocupa o tempo forte do c. 2 e o V chega no 4º tempo, fraco: a dominante, que é o ponto de chegada da semicadência, soa como anacruse da sua própria preparação. A tonicização inverte a hierarquia métrica." }),
        alt("F maior", "A5/2 G5/1 G5/1 E5/4", "F2/2 Bb2/1 G2/1 C3/4", "I ii6 V/V V",
          { por: "O si♮ (sensível de dó) fica numa voz interna logo depois do si♭ do baixo: o cromatismo si♭ → si♮ passa de uma voz para outra (falsa relação implícita, que o par externo esconde), e o baixo sol–dó só salta. A sensível existe, mas não se ouve subir." }),
      ],
      e: "Em A o cromatismo si♭–si♮–dó fica numa voz só, o baixo, e a sensível de dó sobe à vista; o fá5 do soprano é nota comum que vira 7ª do V65/V e desce a mi5. E o acorde secundário cai no tempo fraco, empurrando para o V no tempo forte: a tonicização serve à chegada." },
  ]);

  // ================================================================ sensíveis secundárias e cadeias
  T.perguntas("secundarias2", [
    { p: "Lá maior: uma sensível diminuta (lá♯ no baixo) antes do ii, si menor. Qual versão está correta?",
      o: [
        alt("A maior", "E5/2 G5/2 F#5/2 G#5/2 A5/4", "A2/2 A#2/2 B2/2 E2/2 A2/4", "I vii°7/ii ii V I"),
        alt("A maior", "E5/2 G#5/2 F#5/2 G#5/2 A5/4", "A2/2 A#2/2 B2/2 E2/2 A2/4", "I vii°7/ii ii V I",
          { por: "Sol♯5 sobre o lá♯2 faz lá♯–dó♯–mi–sol♯, um acorde meio-diminuto, e a cifra vii°7/ii não contém sol♯. Antes de um alvo menor a 7ª tem de ser diminuta: sol♮, que vem de si menor (é a 9ª menor do fá♯7 sem fundamental)." }),
        alt("A maior", "A5/2 G5/2 F#5/2 G#5/2 A5/4", "A2/2 A#2/2 B2/2 E2/2 A2/4", "I vii°7/ii ii V I",
          { por: "Lá5 no soprano sobre o I e lá♯2 no baixo logo depois: falsa relação. O lá natural precisava virar lá♯ na mesma voz, ou sair do soprano antes do acorde de sensível." }),
        alt("A maior", "E5/2 G5/2 D5/2 D5/2 C#5/4", "A2/2 A#2/2 B2/2 E2/2 A2/4", "I vii°7/ii ii V7 I",
          { por: "Sol5, a 7ª diminuta do lá♯°7, salta para ré5 em vez de descer a fá♯5: a dissonância mais tensa do acorde fica sem resolução, justo na chegada ao alvo." }),
      ],
      e: "O lá♯ do baixo sobe a si e o sol5 (7ª diminuta) desce a fá♯5. A 7ª diminuta vem do menor do alvo: si menor tem sol natural, e é ele que o acorde de sensível usa. O viiø7 (com sol♯) só serve antes de um alvo maior.",
      verificar: { perfil: CROM, contexto: CTX } },

    { p: "No c. 2 o ré♯ do baixo (sensível de mi) desce a ré, contra a regra 'sensível sobe'. Por que a passagem funciona?",
      partitura: par("D maior", "F#5/1 D5/1 C#5/2 B4/4 A4/2 F#5/2 G5/2 E5/2 D5/4", "D3/2 E3/2 D#3/2 D3/2 C#3/2 D3/2 E3/2 A3/2 D3/4"),
      cifras: cif(par("D maior", "F#5/1", "D3/2 E3/2 D#3/2 D3/2 C#3/2 D3/2 E3/2 A3/2 D3/4"), "I V42/vi V65/ii V42/V V65 I ii V7 I"),
      o: [
        "A resolução é elidida: o alvo do V65/ii chega já como mi7, com a 7ª (ré) no baixo — V42/V —, e o ré♯ desce meio tom para virar essa 7ª. Cada 7ª do baixo desce por grau (mi–ré♯, ré–dó♯), e é isso que dá a direção",
        { texto: "Não funciona: a sensível sobe sempre, e a cadeia devia ser escrita em estado fundamental", por: "Numa cadeia de dominantes cada alvo chega já como dominante, e a sensível desce para virar a 7ª seguinte. Em estado fundamental a quebra seria a mesma, só que o baixo saltaria em vez de deslizar por semitons." },
        { texto: "O ré♯ é uma nota de passagem cromática, fora da harmonia", por: "O ré♯3 está no ataque do baixo, com cifra própria: é a 3ª do si7 (V65/ii), nota do acorde, não ornamento." },
        { texto: "É uma falsa relação, tolerada porque passa rápido", por: "Não há falsa relação: ré♯ e ré estão na mesma voz (o baixo). O ponto é outro: a sensível que desce." },
      ],
      e: "Na cadeia, 'a sensível sobe' é a regra que se quebra; 'a 7ª desce' é a que se mantém. O baixo ré–mi–ré♯–ré–dó♯–ré desliza por semitons enquanto o soprano segura o si4 como nota comum, e só o V65 → I confirma ré maior." },

    { p: "Mi menor. O baixo continua lá–lá♯–si (vii°7/V → V) e volta ao mi. Qual continuação do soprano está correta?",
      partitura: par("E menor", "G5/2 E5/2", "E3/2 A3/2"),
      cifras: [[0, "i"], [2, "iv"]],
      o: [
        alt("E menor", "G5/2 E5/2 E5/2 D#5/2 E5/4", "E3/2 A3/2 A#3/2 B3/2 E3/4", "i iv vii°7/V V i"),
        alt("E menor", "G5/2 E5/2 G5/2 G5/2 G5/4", "E3/2 A3/2 A#3/2 B3/2 E3/4", "i iv vii°7/V V i",
          { por: "Sol5 é a 7ª diminuta do lá♯°7 e fica parado sobre o V: sol não pertence ao si maior (si–ré♯–fá♯) e a dissonância nunca resolve. Devia descer a fá♯5." }),
        alt("E menor", "G5/2 E5/2 A#4/2 B4/2 G4/4", "E3/2 A3/2 A#3/2 B3/2 E3/4", "i iv vii°7/V V i",
          { por: "Mi5 → lá♯4 é um trítono descendente, e o lá♯ dobra a sensível que já está no baixo: lá♯–si nas duas vozes dá oitavas paralelas." }),
        alt("E menor", "G5/2 E5/2 E5/2 E5/2 E5/4", "E3/2 A3/2 A#3/2 B3/2 E3/4", "i iv vii°7/V V i",
          { por: "Mi5 é a 5ª diminuta do lá♯°7; parado sobre o V, vira uma 4ª contra o si que nunca resolve (mi não pertence ao si maior). A 5ª diminuta tende a descer: mi → ré♯." }),
      ],
      e: "Mi5 é nota comum entre o iv e o lá♯°7 (é a 5ª diminuta) e desce meio tom a ré♯5, a 3ª do V, enquanto o lá♯ do baixo sobe a si: as vozes externas convergem por semitom, como num vii°7 do próprio tom.",
      verificar: { perfil: CROM, contexto: CTX } },
  ]);

  // ================================================================ empréstimo modal
  T.perguntas("emprestimo", [
    { p: "Sol maior: o ♭VI (mi♭–sol–si♭) antes do V. Qual versão está correta?",
      o: [
        alt("G maior", "D5/2 G5/2 G5/2 F#5/2 G5/4", "G3/2 E3/2 Eb3/2 D3/2 G2/4", "I vi bVI V I"),
        alt("G maior", "D5/2 E5/2 G5/2 F#5/2 G5/4", "G3/2 E3/2 Eb3/2 D3/2 G2/4", "I vi bVI V I",
          { por: "Mi5 no soprano sobre o vi e mi♭3 no baixo logo depois: falsa relação. O mi natural precisava virar mi♭ na mesma voz; aqui ele salta para sol e a alteração aparece em outra voz." }),
        alt("G maior", "D5/2 G5/2 Eb5/2 D5/2 B4/4", "G3/2 E3/2 Eb3/2 D3/2 G2/4", "I vi bVI V I",
          { por: "Mi♭5 sobre mi♭3 dobra o ♭6, chegando por movimento direto (oitava direta), e as duas vozes descem juntas a ré: oitavas paralelas. A nota de tendência não se dobra." }),
        alt("G maior", "D5/2 G5/2 G5/2 F#5/2 G5/4", "G3/2 Eb3/2 E3/2 D3/2 G2/4", "I bVI vi V I",
          { por: "Os mesmos acordes, na ordem trocada: o mi♭ do baixo sobe a mi natural. O ♭6 contraria a sua tendência e soa como correção de um erro de escrita, não como cor." }),
      ],
      e: "O baixo mi–mi♭–ré leva o ♭6 numa linha cromática descendente e o deixa cair no 5º grau; o sol5 do soprano é nota comum do vi, do ♭VI e do I. O ♭VI escurece a pré-dominante sem mudar o caminho até o V — e vem depois do vi, para o ouvido sentir o escurecimento.",
      verificar: { perfil: MIST, contexto: CTX } },

    { p: "A frase começa em fá menor e termina em fá maior. No c. 2 o ré♭ do soprano sobe a ré natural — contra a regra 'o ♭6 desce'. Por que aqui funciona?",
      partitura: par("F maior", "C5/2 Db5/2 D5/2 E5/2 F5/4", "F3/2 Bb2/2 Bb2/2 C3/2 F2/4"),
      cifras: cif(par("F maior", "C5/2", "F3/2 Bb2/2 Bb2/2 C3/2 F2/4"), "i iv IV V I"),
      o: [
        "Porque a subida coincide com a troca de modo: o baixo fica em si♭, o iv vira IV pela mesma voz, e o maior se confirma logo depois (mi natural, V–I). A nota sobe porque a luz volta — como na volta ao maior de Schubert",
        { texto: "Porque o ré♭ é uma nota de passagem cromática entre dó e ré", por: "Ré♭5 cai com o baixo, sobre o iv, e dura uma mínima: é a 3ª do si♭ menor, nota do acorde. A linha dó–ré♭–ré–mi–fá é cromática, mas cada nota é harmônica." },
        { texto: "Não funciona: é falsa relação entre ré♭ e ré", por: "Ré♭ e ré estão na mesma voz (o soprano), em acordes seguidos: é justamente a inflexão cromática que evita a falsa relação." },
        { texto: "Funciona porque a frase modula para si♭ maior", por: "Não há cadência em si♭: o si♭ do baixo é o IV de fá, e a frase fecha com V–I de fá." },
      ],
      e: "A regra do ♭6 descendente descreve o empréstimo como cor local. Quando a frase muda de modo, a nota abaixada pode subir: é o sinal audível de que o maior voltou. O que decide é a confirmação — se o maior não se firmasse, a subida soaria como erro." },

    { p: "Lá maior: a mesma cadência, escurecida pelo fá♮ (♭6). As três versões estão corretas. Qual usa melhor o empréstimo?",
      o: [
        alt("A maior", "C#5/2 F#5/2 F5/2 E5/1 D5/1 C#5/4", "A2/2 D3/2 D3/2 E3/2 A2/4", "I IV iv V7 I"),
        alt("A maior", "C#5/2 D5/2 F5/2 E5/1 D5/1 C#5/4", "A2/2 D3/4 E3/2 A2/4", "I iv V7 I",
          { por: "O iv entra sem o IV antes: o fá♮ chega por salto (ré–fá) e não há fá♯ que o ouvido possa sentir escurecer. A cor existe, mas não é percebida como mudança." }),
        alt("A maior", "E5/1 F5/1 E5/1 F5/1 E5/2 D5/2 C#5/4", "A2/1 D3/1 C#3/1 D3/1 E3/2 E3/2 A2/4", "I iv I6 iv V V7 I",
          { por: "O fá♮ aparece duas vezes, em bordadura mi–fá–mi: a nota de cor vira figura repetida e se gasta antes da cadência; o iv, ouvido duas vezes, deixa de ser acontecimento." }),
      ],
      e: "Em A o IV vem primeiro e o fá♯ vira fá♮ na mesma voz: fá♯–fá–mi é a linha cromática descendente que caracteriza o empréstimo, e o ♭6 cai no 5º grau sobre o V7. O ouvido precisa do maior para ouvir o menor." },
  ]);

  // ================================================================ sexta napolitana
  T.perguntas("napolitana", [
    { p: "Mi menor: a napolitana (fá maior, com lá no baixo) a caminho do V. Qual versão está correta?",
      o: [
        alt("E menor", "G5/2 F5/2 E5/1 D#5/1 E5/2", "E3/2 A3/2 B3/1 B3/1 E3/2", "i N6 i64 V i"),
        alt("E menor", "G5/2 F5/2 F#5/2 E5/2", "E3/2 A3/2 B3/2 E3/2", "i N6 V7 i",
          { por: "Fá5, o ♭2, sobe a fá♯5 sobre o V7: a 'sensível de cima' da tônica é puxada para o lado errado, e o fá → fá♯ apaga a cor napolitana justo na resolução." }),
        alt("E menor", "G5/2 F5/2 F5/2 E5/2", "E3/2 A3/2 B3/2 E3/2", "i N6 V7 i",
          { por: "Fá5 fica parado sobre o V7 (si–ré♯–fá♯–lá): choca com o fá♯ do acorde, e o ♭2 só desce depois que a dominante já passou." }),
        alt("E menor", "G5/2 F5/2 D#5/2 E5/2", "E3/2 F3/2 B2/2 E3/2", "i N V7 i",
          { por: "Com fá no baixo (napolitana em estado fundamental), o baixo é obrigado ao trítono fá–si e o ♭2 fica dobrado nas duas vozes. Na regra escolar a N6 tem o 4º grau (lá) no baixo, que sobe por grau ao 5º." }),
      ],
      e: "O ♭2 (fá5) desce à tônica sobre o i6/4 e daí à sensível: fá–mi–ré♯–mi. O baixo lá–si, 4º → 5º grau, é o mesmo do iv6: a napolitana só troca a 5ª do iv pela 6ª menor.",
      verificar: { perfil: NAP, contexto: CTX } },

    { p: "Em sol maior a napolitana traz duas notas de sol menor (lá♭ e mi♭) e, mesmo assim, aqui soa como uma inflexão suave. Por quê?",
      partitura: par("G maior", "B4/2 A4/1 Ab4/1 G4/2 F#4/2 G4/4", "G2/2 C3/1 C3/1 D3/2 D3/2 G2/4"),
      cifras: cif(par("G maior", "B4/2", "G2/2 C3/1 C3/1 D3/2 D3/2 G2/4"), "I ii6 N6 I64 V7 I"),
      o: [
        "Porque o ii6 já tem o baixo dó e as notas lá e mi: a N6 só abaixa as duas meio tom, cada uma na sua voz (lá → lá♭ no soprano, mi → mi♭ numa voz interna), e o lá♭ continua descendo: lá–lá♭–sol–fá♯–sol",
        { texto: "Porque a napolitana está em estado fundamental, como o ii6", por: "O baixo é dó, a 3ª de lá♭ maior: é a 1ª inversão (N6), com o 4º grau no baixo — e o ii6 também é uma 1ª inversão." },
        { texto: "Porque o lá♭ volta a lá natural no V7", por: "Lá♭4 desce a sol4 sobre o I6/4 e a fá♯4 sobre o V7; o lá natural não reaparece." },
        { texto: "Porque o lá♭ é uma nota de passagem, não do acorde", por: "Lá♭4 é atacado junto com o baixo no 4º tempo do c. 1: é a 6ª sobre dó, a 'sexta' que dá nome ao acorde." },
      ],
      e: "A napolitana chega como inflexão do ii6: mesmo baixo, duas notas abaixadas por semitom. A linha cromática lá–lá♭–sol é o que o ouvido acompanha, e o ♭2 resolve na tônica sobre o I6/4. Em maior, preparar a N6 por um acorde que já tem o 4º grau no baixo é o que a torna natural." },

    { p: "Ré menor: a napolitana em estado fundamental (mi♭ no baixo), a quebra romântica. O trítono do baixo está liberado (aparece só como informação). Qual versão quebra a regra com controle?",
      o: [
        alt("D menor", "F5/2 D5/2 Eb5/2 C#5/2 D5/4", "D3/2 Bb2/2 Eb3/2 A2/2 D3/4", "i VI N V7 i"),
        alt("D menor", "F5/2 D5/2 Eb5/2 E5/2 D5/4", "D3/2 Bb2/2 Eb3/2 A2/2 D3/4", "i VI N V7 i",
          { por: "Mi♭5 sobe a mi5 sobre o V7: o ♭2 vai para cima, e o mi♭ do baixo seguido do mi natural no soprano é falsa relação. Com o trítono já no baixo, era o soprano que tinha de dar a direção: mi♭ → dó♯." }),
        alt("D menor", "F5/2 D5/2 Bb4/2 E5/2 F5/4", "D3/2 Bb2/2 Eb3/2 A3/2 D3/4", "i VI N V7 i",
          { por: "Baixo e soprano saltam juntos um trítono para cima (mi♭–lá, si♭–mi): 5ªs paralelas, e de novo mi♭ numa voz e mi natural na outra (falsa relação). Uma quebra só soa expressiva se o resto da condução estiver limpo." }),
      ],
      e: "Em A o trítono mi♭–lá do baixo é o único desvio: o soprano faz a 3ª diminuta mi♭–dó♯ (aceita na voz de cima, do ♭2 para a sensível) e chega à tônica por semitom. Os dois cromatismos acontecem juntos, em movimento contrário — é daí que vem o peso da napolitana em estado fundamental.",
      verificar: { perfil: { ...NAP, sec_intervalo_melodico: "info" }, contexto: CTX } },
  ]);

  // ================================================================ sextas aumentadas
  T.perguntas("aumentadas", [
    { p: "Mi menor: do iv6 à sexta italiana (dó–mi–lá♯) e ao V. Qual versão está correta?",
      o: [
        alt("E menor", "G4/2 A4/1 A#4/1 B4/2 G4/2", "E3/2 C3/1 C3/1 B2/2 E3/2", "i iv6 It6 V i"),
        alt("E menor", "G4/2 C5/1 A#4/1 B4/2 G4/2", "E3/2 C3/1 C3/1 B2/2 E3/2", "i iv6 It6 V i",
          { por: "Dó5 → lá♯4 é uma 3ª diminuta: o ♯4 chega por salto, como apojatura, e perde a lógica de passagem (lá–lá♯–si) que justifica o acorde." }),
        alt("E menor", "G4/2 A4/1 C5/1 B4/2 G4/2", "E3/2 C3/1 C3/1 B2/2 E3/2", "i iv6 It6 V i",
          { por: "Dó5 sobre dó3 dobra o ♭6, e as duas vozes descem juntas a si: oitavas paralelas. As notas da 6ª aumentada nunca se dobram." }),
        alt("E menor", "G4/2 A4/1 A#4/1 F#4/2 G4/2", "E3/2 C3/1 C3/1 B2/2 E3/2", "i iv6 It6 V i",
          { por: "Lá♯4, o ♯4, cai a fá♯4 em vez de subir a si: a 6ª aumentada não abre na oitava, a sensível da dominante fica sem resolução, e fá♯4 sobre si2 chega por 5ª direta." }),
      ],
      e: "O iv6 já tem o dó (♭6) no baixo; o lá do soprano sobe cromaticamente a lá♯ e o acorde vira It6. Dó3–lá♯4 abre por semitom nos dois sentidos até a oitava si2–si4: é a cadência frígia com duas sensíveis.",
      verificar: { perfil: AUM, contexto: CTX } },

    { p: "Fá menor: a sexta alemã indo direto ao V, sem o 6/4 — as 'quintas de Mozart'. A regra do 6/4 aparece só como informação. Qual destas é a quebra aceitável?",
      o: [
        alt("F menor", "Ab4/2 Bb4/1 B4/1 C5/2 Ab4/2", "F3/2 Bb2/1 Db3/1 C3/2 F2/2", "i iv Ger65 V i"),
        alt("F menor", "Ab4/2 Bb4/1 Ab4/1 G4/2 Ab4/2", "F3/2 Bb2/1 Db3/1 C3/2 F2/2", "i iv Ger65 V i",
          { por: "O soprano está no ♭3 (lá♭4) e desce a sol4 enquanto o baixo vai de ré♭ a dó: lá♭/ré♭ → sol/dó, quintas paralelas nas vozes externas. As 'quintas de Mozart' só eram toleradas escondidas numa voz interna." }),
        alt("F menor", "Ab4/2 Db5/1 Db5/1 C5/2 C5/2", "F3/2 Bb2/1 Db3/1 C3/2 F2/2", "i iv Ger65 V i",
          { por: "Ré♭5 sobre ré♭3 dobra o ♭6, e as duas vozes descem juntas a dó: oitavas paralelas — erro, não licença." }),
        alt("F menor", "Ab4/2 Bb4/1 B4/1 G4/2 Ab4/2", "F3/2 Bb2/1 Db3/1 C3/2 F2/2", "i iv Ger65 V i",
          { por: "Si♮4, o ♯4, salta a sol4 em vez de subir a dó5: a 6ª aumentada não abre, e sol4 sobre dó3 chega por 5ª direta." }),
      ],
      e: "Com o ♯4 (si♮4) no soprano subindo a dó5, as vozes externas abrem em oitava por movimento contrário. As quintas lá♭–ré♭ → sol–dó existem, mas numa voz interna implícita, encobertas pelas duas resoluções por semitom — exatamente onde Mozart as deixava.",
      verificar: { perfil: { ...AUM, aum_ger_64: "info" }, contexto: CTX } },

    { p: "Sol maior: três maneiras de chegar à sexta alemã (mi♭–sol–si♭–dó♯) e ao I6/4, todas corretas. Qual conduz melhor?",
      o: [
        alt("G maior", "B4/2 C5/1 C#5/1 D5/1 C5/1 B4/2", "G2/2 E3/1 Eb3/1 D3/1 D3/1 G2/2", "I IV6 Ger65 I64 V7 I"),
        alt("G maior", "B4/2 C#5/2 D5/1 C5/1 B4/2", "G2/2 Eb3/2 D3/1 D3/1 G2/2", "I Ger65 I64 V7 I",
          { por: "A alemã vem direto do I, sem pré-dominante: o baixo salta sol–mi♭ e o ♭6 cai do céu; o dó♯ chega por grau diatônico (si–dó♯), não como alteração de um dó que já soava." }),
        alt("G maior", "B4/2 E5/1 C#5/1 D5/1 C5/1 B4/2", "G2/2 C3/1 Eb3/1 D3/1 D3/1 G2/2", "I IV Ger65 I64 V7 I",
          { por: "O dó♯5 chega por salto de mi5 — uma apojatura — e o baixo salta dó–mi♭: nenhuma das duas sensíveis nasce de uma linha. Correto, mas o acorde soa colado, não conduzido." }),
      ],
      e: "Em A o baixo desce mi–mi♭–ré e o soprano sobe dó–dó♯–ré: as duas sensíveis nascem de notas do IV6 por semitom cromático e convergem, em movimento contrário, na oitava do ré. É a preparação que os manuais recomendam em maior (IV6 com o baixo cromático)." },
  ]);

  // ================================================================ sextas aumentadas além do V
  T.perguntas("aumentadas2", [
    { p: "Sol maior. No c. 1 o baixo desce mi–mi♭ como para uma sexta alemã, mas o acorde resolve em lá♭ maior. Qual versão está escrita e cifrada corretamente?",
      o: [
        alt("G maior", "B4/1 C5/1 Db5/2 C5/4", "G2/1 E3/1 Eb3/2 Ab2/4", "I IV6 Ger65=Ab:V7 Ab:I", { texto: "ré♭ → dó; cifra Ger65=Ab:V7" }),
        alt("G maior", "B4/1 C5/1 C#5/2 C5/4", "G2/1 E3/1 Eb3/2 Ab2/4", "I IV6 Ger65=Ab:V7 Ab:I",
          { texto: "dó♯ → dó; cifra Ger65=Ab:V7", por: "Dó♯5 é a grafia da sexta alemã de sol: o 4º elevado promete subir a ré, e aqui desce a dó. A grafia contradiz a condução; como 7ª do mi♭7, a nota é ré♭." }),
        alt("G maior", "B4/1 C5/1 Db5/2 C5/4", "G2/1 E3/1 Eb3/2 Ab2/4", "I IV6 Ger65 Ab:I",
          { texto: "ré♭ → dó; cifra Ger65", por: "Sem a releitura (=Ab:V7), a cifra diz sexta alemã de sol: ré♭ não pertence a ela (seria dó♯), e o mi♭ do baixo teria de descer a ré, não saltar a lá♭." }),
        alt("G maior", "B4/1 C5/1 Db5/2 Db5/4", "G2/1 E3/1 Eb3/2 Ab2/4", "I IV6 Ger65=Ab:V7 Ab:I",
          { texto: "ré♭ parado; cifra Ger65=Ab:V7", por: "Ré♭5 é a 7ª do mi♭7 e fica parada sobre o lá♭ maior (lá♭–dó–mi♭), que não a contém: a dissonância não resolve. Devia descer a dó." }),
      ],
      e: "Mi♭–sol–si♭–ré♭ soa igual à alemã de sol (mi♭–sol–si♭–dó♯). O destino decide: indo a lá♭, a nota de cima é 7ª e desce (ré♭ → dó), o baixo salta uma 5ª como em todo V–I, e a cifra mostra as duas leituras do acorde.",
      verificar: { perfil: AUM, contexto: CTX } },

    { p: "Ré maior. O acorde do c. 1, 3º tempo (si♭–ré–fá–lá♭), soa como a sexta alemã de ré, mas não abre para o lá. O que acontece — e a frase modula?",
      partitura: par("D maior", "F#5/1 G5/1 Ab5/2 G5/2 F#5/1 E5/1 D5/4", "D3/1 B2/1 Bb2/2 G2/2 A2/1 A2/1 D3/4"),
      cifras: cif(par("D maior", "F#5/1", "D3/1 B2/1 Bb2/2 G2/2 A2/1 A2/1 D3/4"), "I IV6 Ger65=Eb:V7 D:N6=Eb:I6 D:I64 V7 I"),
      o: [
        "É relido como V7 de mi♭: o lá♭5 é 7ª e desce a sol5, e o mi♭ que chega é a napolitana de ré (N6), que leva ao I6/4–V7–I. A enarmonia serve de dominante de passagem; sem cadência em mi♭, não há modulação",
        { texto: "É uma sexta alemã mal resolvida: o sol♯ devia subir a lá", por: "Não há sol♯: a nota está escrita lá♭ e desce a sol — grafia e condução de 7ª de dominante, não de 4º elevado." },
        { texto: "A frase modula para mi♭ maior", por: "Mi♭ maior soa um único acorde, já como N6 de ré, seguido de I6/4–V7–I em ré: tonicização passageira, sem cadência no tom novo." },
        { texto: "É uma cadência de engano da sexta alemã", por: "No engano o baixo sobe por grau e chega um acorde do tom; aqui o si♭7 resolve como dominante (a 7ª desce, e chega a tônica de mi♭, com sol no baixo), num acorde fora do tom." },
      ],
      e: "A sexta aumentada é definida pela direção das notas. Lido o 4º elevado como 7ª (sol♯ = lá♭), o acorde vira dominante do ♭II; como o ♭II é a napolitana, a volta ao tom é imediata. É a enarmonia como cor, não como modulação." },

    { p: "Si♭ maior: o soprano deve subir cromaticamente do dó até o ré do I6/4, passando pela sexta aumentada (sol♭ no baixo). As três versões passam no verificador. Qual realiza melhor a ideia?",
      o: [
        alt("Bb maior", "D5/2 C5/1 C#5/1 D5/1 C5/1 Bb4/2", "Bb2/2 Eb3/1 Gb3/1 F3/1 F3/1 Bb2/2", "I ii6 Ger65 I64 V I"),
        alt("Bb maior", "D5/2 C5/1 Db5/1 D5/1 C5/1 Bb4/2", "Bb2/2 Eb3/1 Gb3/1 F3/1 F3/1 Bb2/2", "I ii6 Ger65 I64 V I",
          { por: "Mesmo som, outra grafia: o 3º abaixado escrito ré♭ promete descer e sobe a ré♮. A grafia contradiz a condução; em maior, a nota que sobe ao 3º do I6/4 se escreve dó♯ (4ª duplamente aumentada sobre sol♭)." }),
        alt("Bb maior", "D5/2 C5/2~ C5/2 D5/2", "Bb2/2 Eb3/1 Gb3/1 F3/2 Bb2/2", "I ii6 Fr43 V I",
          { por: "A francesa segura o dó (2º grau, nota comum com o V) e vai direto ao V: a linha para no dó e o ré só chega com o I. A ideia — subir cromaticamente ao 3º do I6/4 — não acontece." }),
      ],
      e: "Dó–dó♯–ré: a alemã escrita com o 2º elevado (dó♯, 4ª duplamente aumentada sobre sol♭) mostra a direção da nota, e o I6/4 recebe o ré como 3ª. A grafia conta a condução." },
  ]);
})(this);
