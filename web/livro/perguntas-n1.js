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

  // ------------------------------------------------------------------ Os modos
  const frig = (linha) => `tom: E frigio\ncf: cantus\ncontraponto: ${linha}\ncantus: G4/4 E4 F4 E4`;
  const dor = (linha) => `tom: D dorico\ncf: cantus\ncontraponto: ${linha}\ncantus: A4/4 G4 F4 E4 D4`;
  T.perguntas("modos", [
    { p: "Mi frígio: os quatro últimos compassos do cantus (sol4 mi4 fá4 mi4), contraponto em cima. Qual destes finais está correto?",
      o: [
        { partitura: frig("B4/4 C5 D5 E5") },
        { partitura: frig("B4/4 C5 D#5 E5"), por: "Ré♯5 é o reflexo tonal de 'criar uma sensível': sobre fá4 ele forma uma 6ª aumentada (dissonância), e dó5→ré♯5 é uma 2ª aumentada. No frígio o semitom da cadência já está no cantus (fá→mi); a voz de cima chega à final por tom, ré→mi, sem alteração." },
        { partitura: frig("B4/4 C5 F5 E5"), por: "Pôr o semitom frígio também em cima dá fá5/fá4 → mi5/mi4: 8ªs paralelas (e a primeira 8ª chega por movimento direto). Só uma voz tem o fá→mi; a outra converge por tom, de baixo." },
        { partitura: frig("B4/4 C#5 D5 E5"), por: "Dó♯5 (c. 2) não é nota de mi frígio: a 6ª do modo é menor (dó). Elevar o 6º grau é recurso do eólio, subindo 6–7–1 para a sensível; o frígio não tem sensível para criar, e a linha nem passa pelo ré♯." },
      ],
      e: "Ré5 → mi5 sobre fá4 → mi4: 6ª maior → 8ª, em movimento contrário, sem nenhuma alteração. A cadência frígia é a única em que o semitom fica na voz que desce (fá→mi): a outra sobe por tom. Por isso a 'sensível' ré♯ nunca entra no frígio.",
      verificar: { perfil: N1_TRECHO, contexto: { nivel: 1 } } },
    { p: "Três cantus firmi corretos em ré dórico. Em qual a cor do modo — a 6ª maior acima da final — mais se ouve?",
      o: [
        { partitura: "tom: D dorico\ncantus: D4/4 F4 E4 G4 A4 B4 G4 A4 F4 E4 D4" },
        { partitura: "tom: D dorico\ncantus: D4/4 F4 E4 G4 A4 G4 F4 E4 D4", por: "Não há nenhum si: a linha caberia igualmente em ré eólio (com si♭). Correta, mas modalmente neutra — nada nela diz 'dórico'." },
        { partitura: "tom: D dorico\ncantus: D4/4 B3 C4 E4 D4 F4 G4 E4 D4", por: "O si aparece, mas só abaixo da final (si3), como apoio para o dó4: o que se ouve é o semitom si–dó puxando para dó. A 6ª maior ré–si, medida para cima a partir da final, nunca soa." },
      ],
      e: "O si4 é o ponto culminante (c. 6), alcançado por grau desde o lá4: a 6ª maior sobre a final soa no lugar mais exposto da linha. Repare também como a linha sai do si4 por salto para sol4 e volta ao lá4: assim evita descer em linha reta de si a fá, o trítono que o dórico esconde.",
    },
    { p: "Ré dórico, os cinco últimos compassos do cantus de Fux, contraponto em cima. A sensível alterada (dó♯) é a única nota de fora que o modo admite. Em qual final ela está bem usada?",
      o: [
        { partitura: dor("C5/4 B4 D5 C#5 D5") },
        { partitura: dor("C#5/4 B4 D5 C#5 D5"), por: "O dó♯5 do c. 1 (sobre lá4) aparece fora da cadência: a linha passa a soar ré menor tonal e, quando a sensível volta no c. 4, já não é novidade. A musica ficta altera só a penúltima nota." },
        { partitura: dor("C5/4 B4 D5 C5 D5"), por: "Dó5 natural sobre mi4 é 6ª menor → 8ª: falta o semitom que leva à final. Fiel às notas do modo, mas a cadência não fecha — é justamente onde o dó vira dó♯." },
      ],
      e: "Dó natural no c. 1 (a 7ª menor do modo, a cor de ré dórico junto com o si natural do c. 2) e dó♯ só no c. 4, a 6ª maior que converge para a 8ª. A alteração é uma licença localizada: um semitom emprestado para a cadência, nada antes.",
      verificar: { perfil: N1_TRECHO, contexto: { nivel: 1 } } },
  ]);

  // ------------------------------------------------------------------ Elaborar (2ª espécie)
  const N2_TRECHO = trecho({ ...M.perfilDoNivel(2), notas_do_modo: "erro" });
  const ela = (linha) => `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${linha}\ncantus: A4/4 G4 F4 E4 D4`;
  const ela5 = (nota) => `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: A4/2 D5 B4 ${nota} C5/4\ncantus: D4/4 G4 F4`;
  T.perguntas("elaborar", [
    { p: "O esqueleto é dó5 – si4 – ré5 – dó♯5 – ré5 sobre o fim do cantus de Fux (lá4 sol4 fá4 mi4 ré4). Qual destas diminuições em 2ª espécie está correta?",
      o: [
        { partitura: ela("C5/2 E5 B4 C5 D5 A4 C#5/4 D5/4") },
        { partitura: ela("C5/2 E5 D5 B4 D5 A4 C#5/4 D5/4"), por: "Mi5 (5ª sobre lá4, tempo fraco do c. 1) → ré5 (5ª sobre sol4, tempo forte do c. 2): 5ªs paralelas do fraco para o forte. E o esqueleto mudou: o c. 2 devia começar em si4." },
        { partitura: ela("C5/2 E5 B4 C5 D5 E5 C#5/4 D5/4"), por: "Mi5 sobre fá4 (c. 3) é 7ª: chega por grau, mas sai por salto de 3ª para dó♯5. É o desenho da cambiata, que só entra na 3ª espécie; na 2ª, a dissonância é sempre passagem — continua por grau na mesma direção." },
        { partitura: ela("C5/2 E5 C5 B4 D5 A4 C#5/4 D5/4"), por: "Dó5 no tempo forte do c. 2 é 4ª sobre sol4, e ainda chega por salto (mi5→dó5): a dissonância caiu no tempo forte, que pertence ao esqueleto (si4). Trocar a ordem das duas notas não é diminuir." },
      ],
      e: "Cada nota fraca tem uma razão: mi5 (5ª consonante) é um salto dentro da mesma consonância, que volta por 4ª ao si4; dó5 (4ª sobre sol4) é passagem entre si4 e ré5; lá4 (3ª sobre fá4) prepara a sensível. A penúltima nota em semibreve é a licença cadencial dos tratados.",
      verificar: { perfil: N2_TRECHO, contexto: { nivel: 2 } } },
    { p: "Uma 2ª espécie em lá eólio (contraponto em cima). Nenhuma regra estrita é quebrada, mas o ouvido estranha o meio. O que está escondido?",
      partitura: "compasso: 2/2\ntom: A eolio\ncf: cantus\ncontraponto: C5/2 G4 A4 F4 G4 E4 G#4/4 A4/4\ncantus: E4/4 D4 C4 B3 A3",
      o: [
        "Os tempos fortes dos c. 2 e 3 formam duas 5ªs seguidas (lá4/ré4 → sol4/dó4): a nota fraca do meio (fá4) não basta para separá-las",
        { texto: "5ªs paralelas do tempo fraco para o forte entre os c. 2 e 3", por: "A nota fraca do c. 2 é fá4 sobre ré4, uma 3ª; ela vai à 5ª sol4/dó4. 3ª → 5ª não é paralela: o problema está entre os dois tempos fortes." },
        { texto: "O fá4 do c. 2 é uma dissonância que sai por salto", por: "Fá4 sobre ré4 é 3ª menor, consonante; chega por salto de 3ª e sai por grau (fá4→sol4). Nada a resolver." },
        { texto: "A cadência não tem sensível", por: "Sol♯4 sobre si3 é 6ª maior → lá4/lá3 em 8ª: a sensível está lá, na penúltima nota, como pede o eólio." },
      ],
      e: "Reduza aos tempos fortes: dó5–lá4–sol4–sol♯4–lá4 sobre mi4–ré4–dó4–si3–lá3 dá 6–5–5–6–8. O esqueleto de 1ª espécie tem 5ªs paralelas, e uma única mínima entre elas não as disfarça. Por isso a 2ª espécie se escreve a partir de um esqueleto bom: troque um dos dois tempos fortes por uma 3ª ou 6ª e só então refaça as notas fracas em volta dele." },
    { p: "No c. 5 do exercício de Fux, o esqueleto vai de si4 a dó5 sobre sol4 → fá4. Que nota pôr no tempo fraco do c. 5? (Pense no que cada escolha faz com o tempo forte seguinte.)",
      o: [
        { partitura: ela5("G4"), texto: "sol4 (uníssono com o cantus)" },
        { partitura: ela5("A4"), texto: "lá4", por: "Lá4 sobre sol4 é 2ª: dissonância que chega por grau, mas salta uma 3ª para dó5. Não é passagem (a linha volta para cima), e a bordadura dissonante não existe na 2ª espécie." },
        { partitura: ela5("D5"), texto: "ré5", por: "Ré5/sol4 (5ª, tempo fraco) → dó5/fá4 (5ª, tempo forte): 5ªs paralelas do fraco para o forte, as que mais escapam na revisão." },
        { partitura: ela5("E5"), texto: "mi5", por: "Mi5 → dó5 desce junto com sol4 → fá4: as duas vozes chegam à 5ª dó5/fá4 por movimento direto — uma 5ª oculta, proibida a duas vozes." },
      ],
      c: 0,
      e: "Aqui a regra cede: o uníssono no meio do exercício é desaconselhado (só um aviso), mas todas as outras notas produzem um erro de verdade. Entre um uníssono e uma paralela, fica o uníssono — e o salto sol4→dó5 em movimento contrário ao cantus ainda dá impulso à chegada.",
      verificar: { perfil: trecho(N2_TRECHO, ...SEM_FIM), contexto: { nivel: 2 } } },
  ]);

  // ------------------------------------------------------------------ Linha contínua (3ª espécie)
  const N3_TRECHO = trecho({ ...M.perfilDoNivel(3), notas_do_modo: "erro", paralelas_entre_tempos: "erro" });
  const cad3 = (penultimo) => `tom: D dorico\ncf: cantus\ncontraponto: B4/1 C5 D5 B4 A4 B4 C5 D5 ${penultimo} D5/4\ncantus: G4/4 F4 E4 D4`;
  const cont = (linha) => `tom: C maior\ncf: cantus\ncontraponto: ${linha} C5/4\ncantus: C4/4 F4 E4 D4 C4`;
  T.perguntas("continua", [
    { p: "Ré dórico, cadência em 3ª espécie (cantus sol4 fá4 mi4 ré4, contraponto em cima). Só o penúltimo compasso muda. Qual está correto?",
      o: [
        { partitura: cad3("E5 D5 B4 C#5") },
        { partitura: cad3("C#5 D5 E5 C#5"), por: "Mi5 no 3º tempo do c. 3 forma 8ª com mi4, e ré5/ré4 no tempo forte seguinte é outra 8ª: separadas só por uma semínima, soam paralelas. O contorno em volta da final é óbvio demais." },
        { partitura: cad3("B4 C#5 B4 C#5"), por: "Dó5 no 3º tempo do c. 2 é 5ª sobre fá4, e si4/mi4 no tempo forte do c. 3 é outra 5ª: com uma só semínima no meio, são 5ªs paralelas. E a 5ª do c. 3 ainda chega por movimento direto (ré5→si4 contra fá4→mi4)." },
        { partitura: cad3("E5 F5 D5 C#5"), por: "Fá5 (9ª sobre mi4) chega subindo e salta uma 3ª para ré5, que também é dissonância (7ª). Parece uma cambiata, mas não é: na cambiata a linha desce por grau até a dissonância e o salto de 3ª cai numa consonância." },
      ],
      e: "Mi5–ré5–si4–dó♯5: a cambiata. Ré5 (7ª sobre mi4) chega descendo por grau, salta uma 3ª para baixo até si4 (5ª, consonante) e a linha volta por grau à sensível. É a exceção consagrada à regra 'dissonância sai por grau' — e só nesse desenho exato.",
      verificar: { perfil: N3_TRECHO, contexto: { nivel: 3 } } },
    { p: "Três versões em 3ª espécie, todas sem erro, com a mesma cadência. Reduza cada uma às notas do tempo 1: qual tem o melhor esqueleto?",
      o: [
        { partitura: cont("G4/1 F4 E4 G4 A4 G4 A4 B4 C5 D5 B4 C5 D5 C5 A4 B4") },
        { partitura: cont("C5/1 D5 E5 D5 C5 B4 A4 B4 C5 D5 B4 C5 D5 C5 A4 B4"), por: "Os tempos 1 são dó5–dó5–dó5–ré5: o esqueleto fica parado numa nota-pivô e as semínimas giram em volta dele. A superfície se mexe, a estrutura não vai a lugar nenhum." },
        { partitura: cont("G4/1 C5 E5 D5 C5 A4 G4 A4 B4 A4 B4 C5 D5 C5 A4 B4"), por: "Os tempos 1 são sol4/dó4, dó5/fá4, si4/mi4: três 5ªs em tempos fortes seguidos. O esqueleto é uma 1ª espécie com 5ªs paralelas, e as semínimas não as escondem (o verificador avisa nos c. 2 e 3)." },
      ],
      e: "Os tempos 1 da primeira são sol4–lá4–dó5–ré5–dó5 (5–3–6–8–8): um esqueleto que sobe em direção ao ré5 e cadencia. Cada célula sai de uma nota estrutural e aterrissa na próxima. Na 3ª espécie, primeiro se escolhe o esqueleto; as semínimas vêm depois." },
    { p: "No c. 1, mi5 (9ª sobre ré4) sai por salto para dó5 (7ª): duas dissonâncias seguidas, ligadas por salto. O verificador aceita. Por quê?",
      partitura: "tom: D dorico\ncf: cantus\ncontraponto: D5/1 E5 C5 D5 A4 B4 C5 D5 E5 D5 B4 C#5 D5/4\ncantus: D4/4 F4 E4 D4",
      o: [
        "É a bordadura dupla: as duas vizinhas de ré5 (a de cima e a de baixo) em volta da nota principal, que volta no tempo 4; o salto fica dentro da figura, entre as duas bordaduras",
        { texto: "É uma cambiata", por: "A cambiata desce por grau até a dissonância e salta uma 3ª para baixo até uma consonância, depois sobe por grau. Aqui a dissonância mi5 chega subindo e o salto cai em outra dissonância (dó5). A cambiata está no c. 3." },
        { texto: "Porque, com o tempo 1 consonante, o resto do compasso é livre", por: "Os tempos 2–4 seguem as regras: passagem, bordadura ou uma das duas figuras consagradas. Um mi5 que saltasse para lá4, por exemplo, seria erro." },
        { texto: "Porque 9ªs e 7ªs no tempo fraco não contam como dissonâncias", por: "Contam. Mi5/ré4 (9ª) e dó5/ré4 (7ª) são dissonâncias; o que as legitima é a figura, não o tempo fraco." },
      ],
      e: "A bordadura dupla (ré–mi–dó–ré) é a outra figura da 3ª espécie em que uma dissonância sai por salto: as duas bordaduras envolvem a nota principal, e o ouvido entende o salto como troca de lado em torno de um centro que volta logo. Fora dessas figuras, dissonância sai por grau." },
  ]);

  // ------------------------------------------------------------------ Retardos (4ª espécie)
  const N4_TRECHO = trecho({ ...M.perfilDoNivel(4), notas_do_modo: "erro" });
  const ret = (linha) => `compasso: 2/2\ntom: A eolio\ncf: cantus\ncontraponto: ${linha}\ncantus: E4/4 D4 C4 B3 A3`;
  const quebra4 = (linha) => `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${linha}\ncantus: A4/4 G4 F4 E4 D4`;
  T.perguntas("retardos", [
    { p: "Lá eólio, cantus descendo por grau (mi4 ré4 dó4 si3 lá3), contraponto em cima, em síncopes. Qual cadeia de retardos está correta?",
      o: [
        { partitura: ret("P/2 C5~ C5 B4~ B4 A4~ A4 G#4 A4/4") },
        { partitura: ret("P/2 C5~ C5 B4~ B4 A4~ A4 B4 A4/4"), por: "No c. 4, lá4 preso sobre si3 (7ª) sobe a si4 em vez de descer ao sol♯4: o retardo não resolve, a sensível some, e si4/si3 → lá4/lá3 são 8ªs paralelas." },
        { partitura: ret("P/2 C5~ C5 B4~ B4 A4 A4 G#4 A4/4"), por: "No c. 4 o lá4 é atacado de novo em vez de ligado: a 7ª sobre si3 cai no tempo forte sem preparação. A dissonância do retardo só existe porque a nota já soava." },
        { partitura: ret("P/2 E5~ E5 D5~ D5 C5~ C5 B4 A4/4"), por: "Cadeia de 9–8: cada retardo resolve numa 8ª (ré5/ré4, dó5/dó4, si4/si3) — 8ªs paralelas atrasadas meio compasso. No fim, si4/si3 → lá4/lá3 já são 8ªs paralelas de fato, e a cadência fica sem sensível." },
      ],
      e: "Três 7–6 encadeados: cada 6ª de resolução (si4/ré4, lá4/dó4, sol♯4/si3) é a preparação do retardo seguinte, e o último é a cadência. Com o cantus descendo por grau, o 7–6 é o retardo que se encadeia sem paralelas — o vocabulário de Corelli.",
      verificar: { perfil: N4_TRECHO, contexto: { nivel: 4 } } },
    { p: "Seis compassos de 4ª espécie em dó maior. Cada retardo está bem preparado e bem resolvido, e o verificador não acusa nada. Ainda assim, o que enfraquece a passagem?",
      partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 F5~ F5 E5~ E5 D5~ D5 C5~ C5 B4 C5/4\ncantus: A4/4 G4 F4 E4 D4 C4",
      o: [
        "É uma escala disfarçada: a voz desce de fá5 a si4 sem parar, e as resoluções formam 6ªs paralelas (mi5/sol4, ré5/fá4, dó5/mi4, si4/ré4). Falta um ponto em que a cadeia pare e a linha mude de rumo",
        { texto: "Os 7–6 deveriam ser 9–8, que soam mais cheios", por: "Em cadeia, o 9–8 resolve sempre numa 8ª: seriam 8ªs paralelas atrasadas pela síncope. O 7–6 é justamente o retardo que se encadeia bem." },
        { texto: "O primeiro retardo não tem preparação", por: "Fá5 entra no tempo fraco do c. 1 como 6ª sobre lá4 (consonante) e só depois fica preso sobre sol4: está preparado." },
        { texto: "A cadência está errada", por: "Dó5 preso sobre ré4 (7ª) resolve em si4 (6ª maior) e vai a dó5/dó4: é o 7–6 cadencial clássico." },
      ],
      e: "Uma cadeia de 7–6 é 6ªs paralelas com atraso: o efeito vem da tensão a cada compasso, mas o desenho é o de uma escala descendente. Corelli a usa como caminho, não como frase inteira: depois de dois ou três retardos, uma síncope consonante ou um salto devolve o registro e dá à cadeia um destino." },
    { p: "Ré dórico. Depois do 4–3 do c. 2 (dó5 preso sobre sol4, resolvendo em si4), nenhuma síncope leva à cadência 7–6: si4 preso sobre fá4 é trítono, e a sua resolução (lá4) fica longe do ré5 que precisa ser preparado. Qual saída funciona?",
      o: [
        { partitura: quebra4("P/2 C5~ C5 B4 A4 D5~ D5 C#5 D5/4"), texto: "quebrar a espécie no c. 3: duas mínimas, lá4 e ré5" },
        { partitura: quebra4("P/2 C5~ C5 B4~ B4 A4~ A4 C#5 D5/4"), texto: "manter as síncopes", por: "A cadeia continua (si4 preso sobre fá4 → lá4), mas no c. 4 o lá4 preso sobre mi4 é 4ª e não tem onde descer: a 'resolução' salta para cima, ao dó♯5. Não há 7–6, e a dissonância fica sem resolver." },
        { partitura: quebra4("P/2 C5~ C5 B4~ B4 D5~ D5 C#5 D5/4"), texto: "prender o si4 e subir ao ré5", por: "Si4 preso sobre fá4 é 4ª aumentada: precisa descer por grau. Subir ao ré5 para preparar a cadência deixa o trítono sem resolução." },
        { partitura: quebra4("P/2 C5~ C5 B4 F5 D5~ D5 C#5 D5/4"), texto: "quebrar a espécie com fá5", por: "A ideia (duas mínimas no c. 3) está certa, mas si4 → fá5 é 5ª diminuta melódica, um salto proibido. Lá4 (3ª sobre fá4) é a nota que serve." },
      ],
      e: "Os tratados permitem quebrar a espécie por um compasso quando a ligadura não tem saída. Lá4 (3ª) e ré5 (6ª, a preparação) atacados no c. 3 devolvem a linha à cadência: ré5 preso sobre mi4 (7ª) → dó♯5 → ré5. A quebra é uma solução local, não um hábito: um compasso, e a síncope volta.",
      verificar: { perfil: { ...N4_TRECHO, ritmo_da_especie: "info" }, contexto: { nivel: 4 } } },
  ]);

  // ------------------------------------------------------------------ 5ª espécie
  const FLOR_TRECHO = trecho({ ...M.perfilDoNivel(5), cpt_ritmo_florido: "erro", notas_do_modo: "erro" });
  const flo = (linha) => `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${linha}\ncantus: F4/4 E4 D4`;
  const flor = (linha) => `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${linha}\ncantus: C4/4 E4 F4 G4 E4 D4 C4`;
  T.perguntas("florida", [
    { p: "Cadência florida em ré dórico (cantus fá4 mi4 ré4): ré5 preparado no c. 1, preso sobre mi4, resolvendo em dó♯5. Qual versão está correta?",
      o: [
        { partitura: flo("A4/1 B4/0.5 C5/0.5 D5/2~ D5/1 C#5/0.5 B4/0.5 C#5/2 D5/4") },
        { partitura: flo("A4/1 B4/0.5 C5/0.5 D5/2~ D5/1 E5/1 C#5/2 D5/4"), por: "O ré5 preso (7ª sobre mi4) sobe a mi5 antes de chegar ao dó♯5: a dissonância não desce, e a ornamentação esconde a resolução em vez de enfeitá-la." },
        { partitura: flo("A4/1 B4 C5 D5~ D5/2 C#5/2 D5/4"), por: "O ré5 do 4º tempo (semínima) está ligado a uma mínima: ligadura de valor menor para maior, que soa como tropeço, não como síncope. A preparação do retardo precisa ser uma mínima no 3º tempo." },
        { partitura: flo("A4/1 B4/0.5 C5/0.5 D5/2~ D5/2 C#5/0.5 B4/0.5 C#5/1 D5/4"), por: "As colcheias dó♯5–si4 caem no 3º tempo, que é o lugar da resolução: ali o estilo pede um valor que pouse. As colcheias, quando há, vêm no 2º tempo, antes da resolução." },
      ],
      e: "Colcheias no 2º tempo do c. 1 (si4–dó5, por grau) levam à mínima ré5 do 3º tempo, que prepara o retardo. No c. 2, o ré5 preso dura uma semínima, as colcheias dó♯5–si4 ornamentam e a resolução dó♯5 chega no 3º tempo, como mínima: a dissonância continua resolvendo descendo, só que com um desvio.",
      verificar: { perfil: FLOR_TRECHO, contexto: { nivel: 5 } } },
    { p: "Três contrapontos floridos sobre o mesmo cantus, todos sem erro e com a mesma cadência (7–6). Em qual o ritmo funciona como frase?",
      o: [
        { partitura: flor("P/2 G4/2 C5/1 B4 A4 G4 A4/2 C5/2~ C5/1 B4/0.5 A4/0.5 B4/2 E5/1 D5 C5/2~ C5/2 B4/2 C5/4") },
        { partitura: flor("P/2 G4/2 C5/1 B4 A4 G4 A4/1 B4 C5 A4 B4/1 C5 D5 B4 G4/2 C5/2~ C5/2 B4/2 C5/4"), por: "Três compassos seguidos de semínimas que giram (lá4–si4–dó5–lá4, si4–dó5–ré5–si4) e param numa mínima sem tensão: é uma 3ª espécie com moldura, não uma 5ª. Nenhuma síncope antes da cadência, e o clímax ainda cai junto com o do cantus (c. 4)." },
        { partitura: flor("P/2 G4/2 C5/4 A4/1 B4 C5 A4 B4/2 D5/2 E5/1 D5 C5/2~ C5/2 B4/2 C5/4"), por: "Rodízio de espécies: semibreve, semínimas, mínimas, semínimas. A semibreve logo no c. 2 para a linha antes que ela comece, e cada troca de valor acontece por troca, não por consequência — nada desemboca em nada." },
      ],
      e: "Começa calmo (mínima), ganha movimento com semínimas que desembocam numa síncope (dó5 do c. 3, preso como 4ª sobre sol4), resolve com colcheias ornamentais, sobe ao clímax mi5 e freia no 7–6. O ritmo tem causa e consequência: as semínimas produzem a síncope, a síncope produz a tensão." },
    { p: "Neste trecho o verificador acusa duas regras no c. 2 (ré5 sobre mi4). Que figura é essa, e em que estilo ela é correta?",
      partitura: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: A4/1 C5/1 F5/2 D5/2 C#5/2 D5/4\ncantus: F4/4 E4 D4",
      o: [
        "Uma apojatura: dissonância (7ª) atacada no tempo forte, por salto, sem preparação, que resolve por grau. É do estilo livre (Bach, o Classicismo); no florido estrito, a dissonância forte precisa ser um retardo preparado",
        { texto: "Um retardo 7–6", por: "Não há ligadura: o ré5 é atacado no c. 2, vindo de fá5. O retardo exige que a nota já soe antes como consonância e fique presa." },
        { texto: "Uma nota de passagem acentuada, como em Palestrina", por: "A passagem chega por grau. Aqui o ré5 chega por salto de 3ª (fá5→ré5), e no tempo forte do compasso." },
        { texto: "Uma antecipação (portamento)", por: "A antecipação é a nota de resolução que chega antes do tempo, consonante, e se repete. O ré5 é a dissonância, não a resolução." },
      ],
      e: "A apojatura é a quebra mais importante do contraponto estrito: a dissonância cai no tempo forte sem aviso, mais dura e mais expressiva que o retardo. Medida contra a harmonia (e não contra um cantus), ela é o vocabulário de Bach; contra as regras da 5ª espécie, são duas infrações — dissonância atacada no tempo forte e alcançada por salto." },
  ]);

  // ------------------------------------------------------------------ Contraponto invertível
  const INV2_TRECHO = trecho({ ...M.perfilDoNivel(2), notas_do_modo: "erro", cpt_invertivel: "erro" });
  const inv = (linha) => `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${linha}\ncantus: E4/4 F4 D4 C4`;
  const reap = (nota) => `tom: D dorico\ncf: cantus\ncantus: D4/4 E4 G4 F4 E4 D4\ncontraponto: D4/4 ${nota} E4 A3 C#4 D4`;
  T.perguntas("invertivel", [
    { p: "Quatro trechos de 2ª espécie corretos no original, cada um com uma 5ª. Qual continua correto invertido à 8ª (a voz de cima desce uma 8ª e vira o baixo)?",
      o: [
        { partitura: inv("C5/2 B4 A4 D5 B4/4 C5/4") },
        { partitura: inv("G4/2 B4 A4 D5 B4/4 C5/4"), por: "Si4 (5ª sobre mi4, tempo fraco) chega por salto de sol4. Invertido, vira si3 sob mi4: uma 4ª — dissonância — atingida por salto." },
        { partitura: inv("C5/2 B4 D5 A4 B4/4 C5/4"), por: "Si4 (5ª) chega por grau, mas sai por salto para ré5. Invertido, a 4ª si3/mi4 sai por salto: uma dissonância sem resolução." },
        { partitura: inv("E5/2 D5 C5 A4 B4/4 C5/4"), por: "Dó5 sobre fá4 é 5ª no tempo forte do c. 2. Invertido, dó4 sob fá4 é 4ª no tempo forte — e ainda sai por salto para lá3." },
      ],
      e: "À 8ª, a 5ª vira 4ª. Uma 5ª só sobrevive se a 4ª que ela vai virar também funcionar: no tempo fraco, chegando e saindo por grau, como nota de passagem (dó5–si4–lá4 → dó4–si3–lá3). Escrever invertível é tratar toda 5ª como uma dissonância em potencial.",
      verificar: { perfil: INV2_TRECHO, contexto: { nivel: 2 } } },
    { p: "Este par funciona invertido à 8ª. Um compositor quer usá-lo também invertido à 10ª (a voz de cima desce uma 10ª). O que acontece?",
      partitura: "tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 G4 B4 C5\ncantus: C4/4 D4 F4 E4 D4 C4",
      o: [
        "As 3ªs paralelas dos c. 3–4 viram 8ªs paralelas (fá3/fá4 → mi3/mi4), e as 8ªs das pontas viram 3ªs: à 10ª, 3ª ↔ 8ª",
        { texto: "As 6ªs dos c. 2 e 5 viram 4ªs, dissonantes", por: "À 10ª o intervalo n vira 11 − n: a 6ª vira 5ª (si3… sol3 sob ré4), não 4ª. A 4ª é o que a 5ª vira à 8ª." },
        { texto: "Nada muda: o que é invertível à 8ª é invertível à 10ª", por: "As tabelas são outras. À 8ª, 3 ↔ 6 (as imperfeitas continuam imperfeitas); à 10ª, 3 ↔ 8 e 5 ↔ 6: cada imperfeita tem uma perfeita como par." },
        { texto: "As vozes se cruzam", por: "Descendo uma 10ª, a voz de cima fica inteira abaixo do cantus (lá3–mi3 sob dó4–fá4): não há cruzamento, só os intervalos mudam." },
      ],
      e: "À 10ª, todo movimento paralelo de 3ªs ou 6ªs vira 8ªs ou 5ªs paralelas. Um par invertível à 10ª tem de ser escrito quase só em movimento contrário e oblíquo — por isso Bach reserva essas inversões para peças-demonstração, como os contrapontos 'alla Decima' da Arte da Fuga." },
    { p: "O original (contraponto em cima) tem uma única 5ª, si4/mi4 no c. 2. Na reaparição invertida, a voz desce uma 8ª e aquela 5ª vira a 4ª si3/mi4. Como Bach faz, você aceita reescrever uma nota da versão invertida. Qual reaparição funciona?",
      partitura: "tom: D dorico\ncf: cantus\ncontraponto: D5/4 B4 E5 A4 C#5 D5\ncantus: D4/4 E4 G4 F4 E4 D4",
      o: [
        { partitura: reap("C4"), texto: "dó4 no c. 2" },
        { partitura: reap("B3"), texto: "si3 no c. 2 (inversão estrita)", por: "É a inversão estrita: si3 sob mi4 é 4ª, dissonância contra o baixo no tempo forte de uma 1ª espécie. É exatamente o ponto que precisa do ajuste." },
        { partitura: reap("E3"), texto: "mi3 no c. 2", por: "Mi3 sob mi4 é 8ª, mas ré4 → mi3 é salto de 7ª, e uníssono ré4/ré4 → 8ª mi3/mi4 são perfeitas paralelas por movimento contrário." },
        { partitura: reap("G3"), texto: "sol3 no c. 2", por: "Sol3 (6ª sob mi4) é consonante, mas a volta sol3 → mi4 é salto de 6ª maior, fora do estilo estrito." },
      ],
      e: "Dó4 (3ª sob mi4) troca a 4ª por uma consonância imperfeita, por grau dos dois lados (ré4–dó4–mi4). O par deixa de ser estritamente invertível, mas a segunda aparição funciona: é o 'ajuste' que Bach faz nas reaparições do contrassujeito, sobretudo nas entradas e cadências.",
      verificar: { perfil: N1_TRECHO, contexto: { nivel: 1 } } },
  ]);

  // ------------------------------------------------------------------ Imitação e cânone
  const CANONE_TRECHO = trecho({ ...M.perfilDoNivel(5), notas_do_modo: "erro", cpt_canone: "erro" });
  const elo3 = (dux, comes) => `compasso: 2/2\ntom: F maior\ndux: C5/2 F5 E5 D5 ${dux}\ncomes: P/4 C4/2 F4 ${comes}`;
  const espelho = (dux, comes) => `compasso: 2/2\ntom: A eolio\ndux: A4/2 G4 ${dux} A4 B4 C5 B4 G#4/4 A4/4\ncomes: P/4 A3/2 ${comes} B3/4 A3/4`;
  T.perguntas("imitacao", [
    { p: "Cânone à 8ª abaixo, atraso de um compasso, em fá maior. Dois elos do dux estão escritos e o comes já copiou o primeiro. Agora o c. 3: o comes vai tocar mi4–ré4 (a cópia do c. 2). Qual elo do dux funciona?",
      partitura: "compasso: 2/2\ntom: F maior\ndux: C5/2 F5 E5 D5\ncomes: P/4 C4/2 F4",
      o: [
        { partitura: elo3("G5 F5", "E4 D4"), texto: "sol5–fá5" },
        { partitura: elo3("E5 D5", "E4 D4"), texto: "mi5–ré5", por: "O dux repete o próprio elo anterior: contra a cópia (mi4–ré4), mi5/mi4 → ré5/ré4 são 8ªs paralelas. Num cânone à 8ª, repetir um elo dá sempre 8ªs com o comes." },
        { partitura: elo3("F5 D5", "E4 D4"), texto: "fá5–ré5", por: "Fá5 no tempo forte contra mi4 é 9ª, atacada por salto (ré5→fá5) e deixada por salto: uma dissonância sem preparação nem resolução." },
        { partitura: elo3("E5 D5", "C4 Bb3"), texto: "mi5–ré5, com o comes ajustado", por: "Para fugir das 8ªs, o comes foi trocado (dó4–si♭3 em vez de mi4–ré4): deixou de imitar o dux. Num cânone, conserta-se o dux, nunca o comes." },
      ],
      c: 0,
      e: "Sol5–fá5 contra mi4–ré4: 6ª e 3ª (compostas), com o dux subindo enquanto o comes desce. É assim que o cânone se constrói: cada elo novo do dux é escrito contra a cópia do anterior — e o que ele tocar agora o comes vai tocar no c. 4, contra o próximo elo.",
      verificar: { perfil: trecho(CANONE_TRECHO, ...SEM_FIM), contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 4 } } } },
    { p: "Cânone à 5ª abaixo em dó maior. O verificador marca o si♭4 do comes (c. 3). Por quê?",
      partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 E5 D5 F5 E5 D5\ncomes: P/4 F4/2 A4 G4 Bb4",
      o: [
        "À 5ª, a imitação é diatônica: uma 5ª abaixo do fá5 do dux, dentro do modo, é si4 natural. O si♭ é transposição real (para fá maior) e tira o comes de dó maior",
        { texto: "Porque si♭4 forma uma dissonância com o dux", por: "Contra o ré5 do dux, si♭4 é uma 3ª maior — consonante. O problema não é vertical, é de imitação." },
        { texto: "Porque o si natural evitaria o trítono fá4…si4 no próprio comes", por: "É o contrário: o si natural cria esse contorno (fá4–lá4–sol4–si4), e mesmo assim é a nota pedida — o comes copia o modo do dux. Se o contorno incomodar, muda-se o dux." },
        { texto: "Porque o comes deveria estar uma 4ª abaixo, não uma 5ª", por: "Dó5 → fá4 é exatamente uma 5ª abaixo, como pede o exercício; o lá4 (de mi5) e o sol4 (de ré5) também estão certos." },
      ],
      e: "Ao uníssono e à 8ª o comes repete as mesmas notas; à 5ª, mantém o número de cada intervalo, mas a qualidade se ajusta ao modo (a 3ª maior dó–mi do dux vira a 3ª maior fá–lá, a 3ª menor ré–fá vira a 3ª maior sol–si). É a imitação diatônica dos cânones de Bach: o comes vive na região da subdominante sem sair do modo." },
    { p: "Quebra da imitação reta: cânone por inversão à 8ª abaixo, em lá eólio, com eixo lá4/lá3 (cada grau que o dux desce, o comes sobe). Qual versão está correta?",
      o: [
        { partitura: espelho("F4 G4", "B3 C4 B3 A3 G3") },
        { partitura: espelho("F4 G4", "G3 F3 G3 A3 B3"), por: "O comes repete o dux reto (lá3–sol3, fá3–sol3…): é um cânone à 8ª comum. Por inversão, o dux descendo lá4–sol4 pede o comes subindo lá3–si3." },
        { partitura: espelho("F4 G4", "B3 C#4 B3 A3 G3"), por: "Dó♯4 espelha exatamente o tom sol4–fá4, mas a inversão é diatônica: um grau acima de si3, no modo, é dó4 natural. O dó♯ tira o comes de lá eólio." },
        { partitura: espelho("F4 E4", "B3 C4 D4 A3 G3"), por: "Trocar o elo 2 do dux para fá4–mi4 dá um espelho correto (dó4–ré4), mas o mi4 forma uma 4ª com o si3 do comes, no tempo fraco, e sai por salto para lá4." },
      ],
      e: "O dux desce lá4–sol4–fá4 e o comes sobe lá3–si3–dó4: graus espelhados em torno do eixo, com as qualidades do modo (o tom sol–fá vira o semitom si–dó). Como no cânone reto, cada elo do dux é escrito contra o espelho do anterior; a diferença é que o ouvido reconhece o parentesco, não a repetição.",
      verificar: { perfil: CANONE_TRECHO, contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 4, ate: 4, inversao: true } } } },
  ]);
})(this);
