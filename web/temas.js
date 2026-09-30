/* Conteúdo do ateliê (versão 3): níveis 1–3 para quem já sabe teoria e quer aprender ofício.
 * Base: pesquisa/06 (como ensinar) e pesquisa/07 (conteúdo). Cada tema:
 *   objetivo, ouvir, esboco (antes da aula), secoes (texto | exemplo em camadas | contraste), exercicios
 * Exemplos e soluções estão no formato de texto do verificador e são conferidos por tests/validar_temas.js. */
(function (raiz) {
  "use strict";

  const FUX = "D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4";
  const CF1 = "C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4";
  const CF2 = "C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4";

  // perfis
  const N1 = { perfilNivel: 1, nivel: 1, extras: { climax_coincidente: "aviso" } };
  const N2 = { perfilNivel: 2, nivel: 2, extras: { climax_coincidente: "aviso" } };
  const N3 = { perfilNivel: 3, nivel: 3, extras: { climax_coincidente: "aviso", paralelas_entre_tempos: "erro" } };
  const TONAL = {
    quintas_paralelas: "erro", oitavas_paralelas: "erro", quintas_oitavas_ocultas: "erro", cruzamento_de_vozes: "erro",
    dissonancia_aproximacao: "aviso", dissonancia_resolucao: "erro", cifras_coerentes: "erro", retrogressao_cifrada: "erro",
    seis_quatro: "erro", cadencias_do_plano: "erro", salto_maior_que_oitava: "erro", intervalo_melodico_aumentado_diminuto: "erro",
    salto_nao_compensado: "aviso",
  };
  const MELODIA = { ...TONAL, notas_do_acorde: "erro", cadencia_final: "erro" };

  const PLANO_CP = [
    ["Cadência", "Quais as duas últimas notas do contraponto, e que intervalos formam?"],
    ["Clímax", "Que nota, em que compasso? Coincide com o do cantus firmus?"],
    ["Contorno", "Descreva o caminho: começa onde, sobe/desce até o clímax, como volta."],
  ];
  const PLANO_BAIXO = [
    ["Cadências", "Onde a frase fecha e com que fórmula de baixo (4–5–1, ii6–I64–V–I…)?"],
    ["Notas estruturais", "Quais notas da melodia você vai harmonizar (uma por acorde)?"],
    ["Linha do baixo", "Onde ele anda por grau (inversões) e onde salta (articulações)?"],
  ];
  const PLANO_FRASE = [
    ["Forma", "Onde estão a ideia básica, a repetição/contraste e a cadência?"],
    ["Clímax e esqueleto", "Qual o ponto mais alto e qual a descida estrutural até a cadência?"],
    ["Motivo", "Que figura rítmico-melódica você vai desenvolver, e como (fragmentar, sequenciar, liquidar)?"],
  ];

  const niveis = [
    // ================================================================== NÍVEL 1
    {
      numero: 1, titulo: "A linha a duas vozes",
      resumo: "Contraponto estrito como disciplina de composição: arquitetura da linha, textura das consonâncias e elaboração de um esqueleto.",
      temas: [
        {
          id: "arquitetura", titulo: "Arquitetura da linha",
          objetivo: "Compor uma 1ª espécie de trás para frente: cadência, clímax, contorno e só então o preenchimento.",
          ouvir: ["Palestrina, Missa Papae Marcelli, Kyrie (linhas vocais em arco)", "Fux, Gradus ad Parnassum, exemplos de 1ª espécie", "Bach, corais: o par soprano–baixo reduzido a uma nota por tempo"],
          esboco: "Sobre o cantus firmus C4 D4 F4 E4 G4 A4 F4 E4 D4 C4, qual seria a sua primeira decisão? Escreva as duas últimas notas do contraponto e onde ficaria o clímax.",
          secoes: [
            { tipo: "texto", titulo: "Compor de trás para frente", html: `
              <p>Quem escreve nota a nota, da esquerda para a direita, costuma chegar à cadência sem saída e desperdiçar o registro no começo. A linha contrapontística é uma <b>trajetória com destino</b>: decida primeiro onde ela precisa chegar e o que acontece no meio do caminho.</p>
              <ol><li><b>Cadência.</b> As duas últimas notas são quase obrigatórias: 6ª maior → 8ª com o contraponto em cima (7–1 contra 2–1), 3ª menor → uníssono (ou 10ª → 8ª) embaixo.</li>
              <li><b>Clímax.</b> Um único ponto mais agudo, entre metade e dois terços da linha, sem coincidir com o clímax do cantus firmus. Ele organiza tudo: antes dele a linha ganha registro; depois, gasta.</li>
              <li><b>Início.</b> 8ª, 5ª ou uníssono — escolha pela distância até o clímax: começar alto demais não deixa espaço para subir.</li>
              <li><b>Contorno-alvo.</b> Desenhe o caminho grosso (por exemplo: desce um pouco, sobe em duas ondas até o clímax, desce por grau à cadência).</li>
              <li><b>Preenchimento</b> nota a nota, escolhendo entre as consonâncias possíveis a que melhor serve ao contorno.</li></ol>` },
            { tipo: "texto", titulo: "Textura: tecido e articulação", html: `
              <p>As consonâncias imperfeitas são o <b>tecido</b> do movimento; as perfeitas, <b>pontos de articulação</b>. Cada 5ª ou 8ª no meio soa como uma pequena chegada e tira a direção. A hierarquia de independência — contrário, oblíquo, semelhante, paralelo — serve para dosar: longos trechos de 3ªs paralelas soam como uma voz dobrada, mesmo sem erro.</p>
              <p>Notas-pivô (a mesma altura voltando várias vezes) estagnam a linha. Saltos: compense o grande com movimento contrário; dois seguidos na mesma direção só se desenharem uma tríade.</p>` },
            { tipo: "exemplo", titulo: "Um contraponto decidido em camadas", intro: "Cantus firmus em dó maior; o contraponto fica em cima.",
              camadas: [
                { titulo: "Cadência primeiro", partitura: `tom: C maior\ncf: cantus\ncontraponto: P/32 B4/4 C5\ncantus: ${CF1}`, anotacoes: [[0, 0, "6ª M"], [0, 1, "8ª"]],
                  notas: [["decisao", "B4 → C5 sobre D4 → C4: 6ª maior → 8ª, as duas vozes convergindo por grau."],
                    ["checagem", "O B4 é a sensível: ela vai precisar de uma chegada que não a antecipe (evitar B4 logo antes)."]] },
                { titulo: "Clímax e início", partitura: `tom: C maior\ncf: cantus\ncontraponto: C5/4 P/12 E5/4 P/12 B4/4 C5\ncantus: ${CF1}`, anotacoes: [[0, 0, "8ª"], [0, 1, "clímax"]],
                  notas: [["decisao", "Clímax E5 no compasso 5 (6ª sobre G4). O clímax do cantus é o A4 do compasso 6: não coincidem."],
                    ["rejeitada", "Pensei no clímax no compasso 6 (C5 sobre A4, 3ª): coincidiria com o clímax do cantus e as duas vozes chegariam juntas ao ponto alto."],
                    ["decisao", "Início em C5 (8ª): começa no meio do âmbito, com espaço para descer antes de subir."]],
                  pausa: ["Por que não começar em G4 (5ª) e subir direto até o E5?", "Porque a linha teria um só gesto ascendente longo, e o E5 chegaria como fim de escala, não como ponto culminante. Descer um pouco primeiro cria uma onda — o clímax ganha peso por contraste."] },
                { titulo: "Preenchimento", partitura: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5\ncantus: ${CF1}`,
                  anotacoes: [[0, 0, "8"], [0, 1, "6"], [0, 2, "3"], [0, 3, "6"], [0, 4, "6"], [0, 5, "3"], [0, 6, "6"], [0, 7, "6"], [0, 8, "6"], [0, 9, "8"]],
                  notas: [["decisao", "Descida C5–B4–A4 em movimento contrário ao cantus, depois A4–C5–E5: dois saltos de 3ª que desenham a tríade de lá menor."],
                    ["checagem", "Nenhuma 5ª ou 8ª no meio: só 3ªs e 6ªs. As perfeitas ficam nas pontas."],
                    ["checagem", "Três 6ªs seguidas nos compassos 7–9 (D5–C5–B4 sobre F4–E4–D4): é o limite. Uma quarta seria dobramento."]] },
              ] },
            { tipo: "contraste", titulo: "Muitas perfeitas × tecido imperfeito", intro: "Mesmo cantus, duas soluções sem erro de regra.",
              a: { rotulo: "A — 5ªs e 8ªs no meio", partitura: `tom: C maior\ncf: cantus\ncontraponto: C5/4 A4 D5 E5 D5 C5 A4 B4 B4 C5\ncantus: ${CF1}` },
              b: { rotulo: "B — 3ªs e 6ªs no meio", partitura: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5\ncantus: ${CF1}` },
              pergunta: "Ouça as duas. Onde cada uma parece 'parar'? Qual tem mais direção até a cadência?",
              comentario: "<p>Em A, a 5ª do compasso 2, a 8ª do 4 e as 5ªs do 5 e do 8 soam como pequenas chegadas: a linha parece respirar a cada dois compassos, e a 8ª final já não é novidade — a cadência perde o peso de ponto final. Em B, o tecido de 3ªs e 6ªs mantém o fluxo e a 8ª final é a primeira consonância perfeita desde o começo — ela realmente conclui.</p>" },
          ],
          exercicios: [
            { id: "arq1", titulo: "Completar: clímax e cadência", modo: "completar", ...N1,
              instrucoes: "<p>As quatro primeiras notas estão escritas. Complete o contraponto decidindo o clímax e a cadência (e o caminho entre eles).</p>",
              texto: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5\ncantus: ${CF1}`, duracao: 4, plano: PLANO_CP,
              solucao: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5\ncantus: ${CF1}` },
            { id: "arq2", titulo: "Clímax no compasso 5", modo: "restrição", ...N1, extras: { ...N1.extras, climax_no_lugar: "erro" }, contexto: { climax: { compasso: 5 } },
              instrucoes: "<p>Cantus firmus de Fux, contraponto em cima. <b>Restrição:</b> o clímax do contraponto é único e cai no compasso 5. Planeje a subida e a descida inteiras em função dele.</p>",
              texto: `tom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 4, plano: PLANO_CP,
              solucao: `tom: D dorico\ncf: cantus\ncontraponto: D4/4 A4 G4 B4 E5 D5 C5 D5 A4 C#5 D5\ncantus: ${FUX}`,
              comentarioSolucao: "Solução encontrada e conferida pelo verificador: compare o caminho até o E5 com o seu." },
            { id: "arq3", titulo: "Embaixo, com no máximo uma perfeita", modo: "restrição", ...N1, extras: { ...N1.extras, perfeitas_no_meio: "erro" }, contexto: { maxPerfeitas: 1 },
              instrucoes: "<p>Contraponto <b>embaixo</b> do cantus firmus. <b>Restrição:</b> no máximo uma 5ª ou 8ª entre o primeiro e o último compasso. Comece em 8ª ou uníssono e termine 3ª menor → uníssono (ou 10ª → 8ª).</p>",
              texto: `tom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto:`, duracao: 4, plano: PLANO_CP,
              solucao: `tom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto: C3/4 B2 D3 G3 F3 E3 F3 C4 B3 C4`,
              comentarioSolucao: "Solução encontrada e conferida pelo verificador." },
            { id: "arq4", titulo: "Livre, sobre um cantus sorteado", modo: "livre", ...N1, sortear: true,
              instrucoes: "<p>Contraponto em cima de um cantus firmus sorteado. Sem ajuda: planeje, escreva, ouça. Depois da reflexão você vê uma solução gerada pelo verificador para comparar.</p>",
              texto: `tom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 4, plano: PLANO_CP },
            { id: "arq5", titulo: "Variante: seu cantus, seu contraponto", modo: "variante", ...N1, fimLivre: true,
              instrucoes: "<p>Escreva você mesmo um cantus firmus (voz de baixo, 8 a 14 semibreves, começando e terminando na final) e um contraponto de 1ª espécie em cima. Toque em <b>Terminei</b> para a correção do fim.</p>",
              texto: "tom: C maior\ncontraponto:\ncantus:", duracao: 4, plano: [["Ideia", "Que tipo de cantus você quer testar (mais saltos? âmbito maior? outro modo)?"], ...PLANO_CP] },
          ],
        },
        {
          id: "elaborar", titulo: "Elaborar um esqueleto: a 2ª espécie",
          objetivo: "Tratar a 2ª espécie como diminuição de uma 1ª espécie: cada nota fraca tem uma razão.",
          ouvir: ["Bach, Invenção nº 1 (BWV 772): reduza os compassos 1–2 a uma nota por tempo", "Corais de Bach: passagens em colcheia no baixo são 2ª espécie"],
          esboco: "O esqueleto G4 → C5 (sobre C4 → E4) está a uma 4ª. Que nota você poria no tempo fraco entre eles, e por quê?",
          secoes: [
            { tipo: "texto", titulo: "Espécies como níveis de elaboração", html: `
              <p>Schenker via a composição livre como prolongamento da estrita, e Salzer & Schachter organizam o contraponto assim: as espécies não são estilos, são <b>níveis de elaboração</b>. Os tempos fortes de uma boa 2ª espécie formam uma 1ª espécie válida; os fracos são <b>diminuições</b>.</p>
              <p>O intervalo entre duas notas do esqueleto sugere a diminuição:</p>
              <ul><li><b>3ª</b> → nota de passagem (consonante ou dissonante) preenchendo-a.</li>
              <li><b>grau</b> → salto consonante (arpejo dentro da mesma consonância) ou bordadura consonante.</li>
              <li><b>4ª ou 5ª</b> → substituição (salto e volta por grau) ou mudança de registro.</li>
              <li><b>nota repetida</b> → bordadura ou arpejo (a repetição literal é proibida).</li></ul>
              <p>Depois de escolher, confira as paralelas <b>do tempo fraco ao forte seguinte</b> (as mais esquecidas) e as 5ªs/8ªs em tempos fortes seguidos.</p>` },
            { tipo: "exemplo", titulo: "Do esqueleto à superfície", intro: "Cantus firmus curto em dó maior.",
              camadas: [
                { titulo: "Esqueleto de 1ª espécie", especie: 1, partitura: "tom: C maior\ncf: cantus\ncontraponto: G4/4 C5 A4 B4 C5\ncantus: C4/4 E4 F4 D4 C4",
                  anotacoes: [[0, 0, "5"], [0, 1, "6"], [0, 2, "3"], [0, 3, "6"], [0, 4, "8"]],
                  notas: [["decisao", "Esqueleto 5–6–3–6–8: nenhuma consonância perfeita no meio; os intervalos entre as notas do esqueleto (4ª, 3ª, grau, grau) vão decidir as diminuições."]] },
                { titulo: "Diminuições", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: G4/2 A4 C5 B4 A4 C5 B4/4 C5\ncantus: C4/4 E4 F4 D4 C4",
                  anotacoes: [[0, 1, "6"], [0, 3, "5 pass."], [0, 5, "5 salto"], [0, 6, "6"]],
                  notas: [["decisao", "G4 → C5 (4ª): uma nota só não preenche a 4ª. A4 (6ª, consonante) divide o salto em grau + 3ª e deixa o C5 chegar como ponto de chegada."],
                    ["decisao", "C5 → A4 (3ª): B4 preenche, nota de passagem (aqui consonante: 5ª sobre E4)."],
                    ["decisao", "A4 → B4 (grau): repetir o A4 é proibido e uma passagem não cabe. Salto consonante A4–C5 (5ª sobre F4) e volta por grau: a linha contorna o alvo."],
                    ["rejeitada", "No compasso 3 pensei em G4 (bordadura inferior): seria 2ª contra F4, dissonância que não é de passagem — só a partir da 3ª espécie."],
                    ["checagem", "Do fraco ao forte: C5/F4 (5ª) → B4/D4 (6ª). Nenhuma 5ª do tempo fraco vai a outra 5ª no forte seguinte."]],
                  pausa: ["No compasso 4 a linha fica parada numa semibreve. Por quê?", "A penúltima nota é a sensível sobre o 2º grau (6ª maior → 8ª). Numa 2ª espécie estrita ela viria depois de uma nota fraca (5–6 ou 8–6); a semibreve é a licença cadencial que os tratados aceitam — e aqui mantém o B4 do esqueleto no tempo forte sem inventar um enfeite só para cumprir o ritmo."] },
              ] },
            { tipo: "contraste", titulo: "Diminuição com razão × diminuição mecânica",
              a: { rotulo: "A — notas fracas que fogem", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: G4/2 A4 C5 E5 A4 D5 B4/4 C5\ncantus: C4/4 E4 F4 D4 C4" },
              b: { rotulo: "B — notas fracas que conduzem", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: G4/2 A4 C5 B4 A4 C5 B4/4 C5\ncantus: C4/4 E4 F4 D4 C4" },
              pergunta: "Mesmo esqueleto, as duas corretas; só os compassos 2 e 3 mudam. O que a linha A perde?",
              comentario: "<p>Em A, as notas fracas dos compassos 2 e 3 saltam para longe (E5, D5) e a linha precisa voltar com outro salto: o esqueleto C5–A4–B4 fica escondido atrás de um zigue-zague, e o E5 vira um clímax acidental. Em B, cada nota fraca aponta para o tempo forte seguinte (passagem, salto que contorna o alvo), e a linha tem direção contínua.</p>" },
          ],
          exercicios: [
            { id: "ela1", titulo: "Elaborar o esqueleto de Fux", modo: "completar", ...N2, extras: { ...N2.extras, esqueleto_preservado: "erro" },
              contexto: { esqueleto: [[0, "A4"], [4, "A4"], [8, "G4"], [12, "A4"], [16, "B4"], [20, "C5"], [24, "C5"], [28, "B4"], [32, "D5"], [36, "C#5"], [40, "D5"]] },
              instrucoes: "<p>O esqueleto é a 1ª espécie de Fux (A4 A4 G4 A4 B4 C5 C5 B4 D5 C#5 D5). Escreva a 2ª espécie mantendo essas notas nos tempos fortes; o penúltimo compasso pode ficar em semibreve.</p>",
              texto: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 2, plano: [["Diminuições", "Para cada par do esqueleto, qual diminuição (passagem, salto, bordadura consonante)?"], ["Pontos difíceis", "Onde as notas repetidas do esqueleto pedem outra solução?"]],
              solucao: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: A4/2 B4 A4 C5 G4 E4 A4 D5 B4 G4 C5 A4 C5 E5 B4 G5 D5 A4 C#5/4 D5\ncantus: ${FUX}`,
              comentarioSolucao: "Solução encontrada e conferida pelo verificador. Repare no compasso 5: entre o si e o dó do esqueleto (sobre sol → fá) qualquer nota fraca gera paralela, direta ou uníssono; o uníssono é a saída menos grave." },
            { id: "ela2", titulo: "2ª espécie livre, em cima", modo: "livre", ...N2, sortear: true,
              instrucoes: "<p>Escreva primeiro (de cabeça ou no plano) um esqueleto de 1ª espécie e depois diminua. Pode começar com pausa de mínima.</p>",
              texto: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 2, plano: [["Esqueleto", "Escreva aqui a 1ª espécie que você vai elaborar."], ...PLANO_CP] },
            { id: "ela3", titulo: "Embaixo, com três dissonâncias de passagem", modo: "restrição", ...N2, extras: { ...N2.extras, dissonancias_minimas: "erro" }, contexto: { minDissonancias: 3 },
              instrucoes: "<p>Contraponto embaixo. <b>Restrição:</b> pelo menos três dissonâncias de passagem nos tempos fracos — use-as para dar impulso, não como enfeite.</p>",
              texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto:`, duracao: 2, plano: PLANO_CP,
              solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto: P/2 C3 F3 D3 A3 D3 E3 F3 G3 A3 B3 E3 A3 B3 C4 A3 D4 B3 C4/4`,
              comentarioSolucao: "Solução encontrada e conferida pelo verificador." },
            { id: "ela4", titulo: "2ª espécie livre, embaixo", modo: "livre", ...N2, sortear: true,
              instrucoes: "<p>Embaixo de um cantus sorteado. Atenção à cadência: 5ª → 3ª menor → uníssono (ou 8ª).</p>",
              texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto:`, duracao: 2, plano: PLANO_CP },
          ],
        },
        {
          id: "continua", titulo: "Linha contínua: a 3ª espécie",
          objetivo: "Escrever quatro notas por tempo sem perder o esqueleto: células que saem de uma nota estrutural e chegam na próxima.",
          ouvir: ["Bach, Invenções nº 4 (ré menor) e nº 8 (fá maior): a voz em semicolcheias contra a voz mais lenta", "Mozart, sonatas: o soprano ornamentado sobre um esqueleto de 10ªs"],
          esboco: "Entre C5 (sobre D4) e A4 (sobre F4, no compasso seguinte), escreva quatro semínimas que saiam do C5 e cheguem ao A4.",
          secoes: [
            { tipo: "texto", titulo: "Células, não escalas", html: `
              <p>Pense em <b>células de quatro semínimas</b> que partem de uma nota do esqueleto e aterrissam na próxima. O perigo da 3ª espécie é a escala que 'corre' sem destino e perde o esqueleto.</p>
              <ul><li>Tempo 1 consonante; tempos 2–4 com passagem, bordadura, <b>bordadura dupla</b> (C–D–B–C) ou <b>cambiata</b> (desce por grau à dissonância, salta 3ª para baixo, sobe por grau).</li>
              <li>A 5ª (ou 8ª) nos tempos 3–4 e outra no tempo forte seguinte soam paralelas mesmo não sendo vizinhas.</li>
              <li>Saltos de preferência <b>dentro</b> do compasso; através da barra eles expõem o tempo forte.</li>
              <li>A cambiata é o vocabulário clássico de cadência: E5–D5–B4–C#5 | D5 sobre E4 → D4.</li></ul>` },
            { tipo: "exemplo", titulo: "Esqueleto e células", intro: "O mesmo esqueleto do tema anterior, agora em 3ª espécie.",
              camadas: [
                { titulo: "Esqueleto", especie: 1, partitura: "tom: C maior\ncf: cantus\ncontraponto: G4/4 C5 A4 B4 C5\ncantus: C4/4 E4 F4 D4 C4" },
                { titulo: "Células", partitura: "tom: C maior\ncf: cantus\ncontraponto: G4/1 E4 F4 G4 C5 B4 A4 G4 A4 G4 A4 C5 B4 C5 A4 B4 C5/4\ncantus: C4/4 E4 F4 D4 C4",
                  anotacoes: [[0, 2, "4ª pass."], [0, 6, "4ª pass."], [0, 9, "2ª bord."], [0, 13, "7ª camb."]],
                  notas: [["decisao", "Compasso 1: G4–E4–F4–G4 volta à nota de partida para depois saltar à C5 no tempo forte: a célula prepara o salto de 4ª."],
                    ["decisao", "Compasso 2: C5–B4–A4–G4 desce em escala e aterrissa em A4 (compasso 3) por grau."],
                    ["checagem", "Compasso 3: G4 é bordadura inferior dissonante (2ª sobre F4) — permitida a partir da 3ª espécie."],
                    ["decisao", "Compasso 4: cambiata B4–C5–A4–B4 — a dissonância C5 salta uma 3ª e a linha volta por grau."],
                    ["checagem", "Nenhum tempo 2–4 forma com o tempo forte seguinte a mesma consonância perfeita."]],
                  pausa: ["O compasso 4 é B4–C5–A4–B4. Por que não B4–D5–C5–B4, que contorna a nota final de forma mais óbvia?", "Porque D5 sobre D4 é uma 8ª no 2º tempo e o C5 final forma outra 8ª com C4: duas 8ªs separadas só por notas de passagem ainda soam paralelas. A cambiata resolve: C5 (7ª, por grau) salta uma 3ª para baixo e volta por grau à sensível — a figura cadencial clássica da 3ª espécie."] },
              ] },
          ],
          exercicios: [
            { id: "cont1", titulo: "Elaborar em 3ª espécie", modo: "completar", ...N3, extras: { ...N3.extras, esqueleto_preservado: "erro" },
              contexto: { esqueleto: [[0, "C5"], [4, "B4"], [8, "A4"], [12, "C5"], [16, "E5"], [20, "C5"], [24, "D5"], [28, "C5"], [32, "B4"], [36, "C5"]] },
              instrucoes: "<p>O esqueleto é o contraponto do tema 'Arquitetura da linha'. Mantenha essas notas nos tempos fortes e escreva quatro semínimas por compasso.</p>",
              texto: `tom: C maior\ncf: cantus\ncontraponto:\ncantus: ${CF1}`, duracao: 1, plano: [["Células", "Para cada compasso, de onde a célula sai e onde chega?"]],
              solucao: `tom: C maior\ncf: cantus\ncontraponto: C5/1 B4 C5 D5 B4 C5 A4 B4 A4 G4 B4 A4 C5 B4 C5 D5 E5 B4 D5 B4 C5 A4 C5 B4 D5 C5 F5 E5 C5 D5 C5 E5 B4 C5 A4 B4 C5/4\ncantus: ${CF1}`,
              comentarioSolucao: "Solução encontrada e conferida pelo verificador." },
            { id: "cont2", titulo: "Cambiata e bordadura dupla", modo: "restrição", ...N3, extras: { ...N3.extras, figuras_obrigatorias: "erro" }, contexto: { figuras: ["cambiata", "bordadura_dupla"] },
              instrucoes: "<p>3ª espécie em cima do cantus de Fux. <b>Restrição:</b> use pelo menos uma cambiata e uma bordadura dupla, em lugares em que elas façam sentido.</p>",
              texto: `tom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 1, plano: [["Onde", "Em que compassos entram a cambiata e a bordadura dupla, e por quê ali?"]],
              solucao: `tom: D dorico\ncf: cantus\ncontraponto: A4/1 F4 A4 G4 A4 B4 G4 A4 B4 E4 F4 G4 B4 A4 F4 A4 E5 D5 B4 D5 F5 E5 G5 F5 E5 F5 E5 D5 B4 C5 A4 B4 D5 E5 C5 D5 E5 D5 B4 C#5 D5/4\ncantus: ${FUX}`,
              comentarioSolucao: "Solução encontrada pelo verificador (as duas figuras foram fixadas nos compassos 2 e 10). É correta, não necessariamente bonita: compare o fluxo com o seu." },
            { id: "cont3", titulo: "3ª espécie livre, em cima", modo: "livre", ...N3, sortear: true,
              instrucoes: "<p>Sobre um cantus sorteado. Esboce o esqueleto no plano antes.</p>",
              texto: `tom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 1, plano: [["Esqueleto", "A 1ª espécie por trás das suas semínimas."], ...PLANO_CP] },
            { id: "cont4", titulo: "3ª espécie livre, embaixo", modo: "livre", ...N3, sortear: true,
              instrucoes: "<p>Embaixo de um cantus sorteado. Cadência típica: 7–5–6–7 | 1 (em ré: C#4 A3 B3 C#4 | D4).</p>",
              texto: `tom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto:`, duracao: 1, plano: PLANO_CP },
          ],
        },
      ],
    },

    // ================================================================== NÍVEL 2
    {
      numero: 2, titulo: "Das vozes à harmonia",
      resumo: "A moldura soprano–baixo como motor da harmonia tonal: desenho do baixo com inversões, ritmo harmônico e esquemas galantes.",
      temas: [
        {
          id: "baixo", titulo: "O baixo gera a harmonia",
          objetivo: "Escrever o baixo de uma melodia como contraponto, com inversões, e só depois nomear os acordes.",
          ouvir: ["Corais de Bach: cante o baixo sozinho", "Mozart, Sonata K. 545, 1º mov., c. 1–4", "Partimenti de Fenaroli (Regra da Oitava)"],
          esboco: "A melodia G4 A4 B4 C5 (semínimas) fecha em dó. Escreva dois baixos diferentes para ela e diga qual prefere.",
          secoes: [
            { tipo: "texto", titulo: "Duas vozes e um preenchimento", html: `
              <p>Na harmonia tonal as decisões estruturais estão no par <b>soprano–baixo</b>; as vozes internas completam. Reduzido a uma nota por harmonia, esse par é uma 1ª espécie: 10ªs e 6ªs no interior, 8ªs e 5ªs nas articulações, contrário para chegar às perfeitas.</p>
              <p>Ferramentas de baixo: <b>I6</b> (tônica no meio da linha), <b>V6</b> e <b>V4/3</b> (bordadura/passagem em volta do 1), <b>ii6</b> (baixo 4 subindo a 5), <b>IV6</b> (6 descendo a 5), <b>6/4 de passagem</b> (baixo por grau entre harmonias da mesma função), <b>6/4 cadencial</b> (sobre 5 no tempo forte, resolvendo 6–5, 4–3). Regra da Oitava: 1 e 5 são estáveis (5/3), os outros graus levam 6.</p>
              <h3>Procedimento</h3>
              <ol><li>Marque as cadências e escolha a fórmula de baixo (4–5–1; ii6–I6/4–V–I; x–5 na semicadência).</li>
              <li>Marque as notas estruturais da melodia (uma por harmonia).</li>
              <li>Para cada uma, liste os baixos possíveis (membros de acordes que a contêm).</li>
              <li>Escolha preferindo grau conjunto e movimento contrário; fundamentais com saltos de 4ª/5ª nas articulações.</li>
              <li>Confira o par externo como 1ª espécie. Só então escreva as cifras.</li></ol>
              <p>Nos exercícios você escreve o baixo e as <b>cifras</b> (I, V43, I6, ii6, I64, V7, vii°6…), uma por nota do baixo; o verificador confere se o baixo é o membro que a cifra diz, se a melodia está no acorde, retrogressões e o uso do 6/4.</p>` },
            { tipo: "exemplo", titulo: "Expansão de tônica e cadência composta",
              camadas: [
                { titulo: "Cadência e articulação", partitura: "tom: C maior\nmelodia: E5/1 D5 C5 D5 E5 D5 C5/2\nbaixo: P/4 P/1 G3 C3/2", rotulos: ["melodia", "baixo"],
                  notas: [["decisao", "Fim: I6/4 – V – I sobre G3 G3 C3 (cadência composta): a melodia E5–D5–C5 desce por grau sobre o 5 sustentado."]] },
                { titulo: "O baixo do começo", partitura: "tom: C maior\nmelodia: E5/1 D5 C5 D5 E5 D5 C5/2\nbaixo: C3/1 D3 E3 F3 G3 G3 C3/2", rotulos: ["melodia", "baixo"],
                  cifras: [[0, "I"], [1, "V43"], [2, "I6"], [3, "ii6"], [4, "I64"], [5, "V"], [6, "I"]],
                  notas: [["decisao", "C3–D3–E3 sob E5–D5–C5: troca de vozes (movimento contrário) — a tônica se prolonga com V4/3 de passagem."],
                    ["decisao", "F3 (ii6) leva por grau ao G3: o baixo inteiro é uma escala de C3 a G3 antes da queda cadencial."],
                    ["rejeitada", "C3–G2–C3–F3 (tudo em fundamental) daria as mesmas funções, mas o baixo saltaria o tempo todo e a troca de vozes desapareceria."],
                    ["checagem", "Soprano–baixo: 3 – 8 – 6 – 6 | 6 – 5 – 8. A 5ª do V chega com o soprano por grau (aceita nas externas tonais)."]],
                  pausa: ["Por que V43 (e não V ou V6) no segundo tempo?", "Porque o baixo precisa de D3 para andar por grau de C3 a E3; com D no baixo, o acorde de dominante está na 2ª inversão da tétrade — V4/3 —, o que também dá a 7ª (F) só implícita, sem precisar resolvê-la no soprano."] },
              ] },
            { tipo: "contraste", titulo: "Mesma melodia, dois baixos",
              a: { rotulo: "A — linear", partitura: "tom: C maior\nmelodia: G4/1 A4 B4 C5\nbaixo: E3/1 D3 G2 C3", cifras: [[0, "I6"], [1, "ii"], [2, "V"], [3, "I"]] },
              b: { rotulo: "B — só fundamentais", partitura: "tom: C maior\nmelodia: G4/1 A4 B4 C5\nbaixo: C3/1 F3 G3 C3", cifras: [[0, "I"], [1, "IV"], [2, "V"], [3, "I"]] },
              pergunta: "Nenhum tem erro. O que muda na sensação de direção?",
              comentario: "<p>A é contraponto: o baixo 3–2–5–1 anda em movimento contrário ao soprano e tem um desenho próprio. B é vertical: as funções estão certas, mas o baixo salta em todos os tempos e as duas vozes sobem juntas até o V — soa como acordes em bloco, não como duas linhas.</p>" },
          ],
          exercicios: [
            { id: "bx1", titulo: "Completar o baixo", modo: "completar", perfil: { ...TONAL }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
              cifrasAluno: true, cifrasIniciais: "I ii I6 I V6 I V43 I6",
              instrucoes: "<p>A melodia está pronta; o baixo e as cifras dos compassos 1–2 também. Escreva o baixo e as cifras dos compassos 3–4, terminando em cadência autêntica perfeita.</p>",
              texto: "tom: C maior\ncf: melodia\nmelodia: E5/1 F5 G5 E5 D5 C5 B4 C5 A4 B4 C5 D5 E5 D5 C5/2\nbaixo: C3/1 D3 E3 C3 B2 C3 D3 E3", duracao: 1, plano: PLANO_BAIXO,
              solucao: "tom: C maior\ncf: melodia\nmelodia: E5/1 F5 G5 E5 D5 C5 B4 C5 A4 B4 C5 D5 E5 D5 C5/2\nbaixo: C3/1 D3 E3 C3 B2 C3 D3 E3 F3 D3 E3 F3 G3 G3 C3/2",
              solucaoCifras: "I ii I6 I V6 I V43 I6 IV vii°6 I6 ii6 I64 V I" },
            { id: "bx2", titulo: "Baixo melódico", modo: "restrição", perfil: { ...TONAL, baixo_por_grau: "erro" }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 2 }, maxSaltosBaixo: 1 },
              cifrasAluno: true,
              instrucoes: "<p>Escreva baixo e cifras para a melodia. <b>Restrição:</b> no máximo um salto no baixo (fora da queda 5 → 1 final). Use inversões para andar por grau.</p>",
              texto: "tom: C maior\ncf: melodia\nmelodia: E5/1 D5 C5 D5 E5 D5 C5/2\nbaixo:", duracao: 1, plano: PLANO_BAIXO,
              solucao: "tom: C maior\ncf: melodia\nmelodia: E5/1 D5 C5 D5 E5 D5 C5/2\nbaixo: C3/1 D3 E3 F3 G3 G3 C3/2", solucaoCifras: "I V43 I6 ii6 I64 V I" },
            { id: "bx3", titulo: "Livre: melodia, baixo e cifras", modo: "variante", perfil: { ...TONAL }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
              cifrasAluno: true, alvoCompassos: 4,
              instrucoes: "<p>Componha você as duas vozes: uma frase de 4 compassos em dó maior que feche em cadência autêntica perfeita, com o baixo usando pelo menos duas inversões diferentes.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_BAIXO },
          ],
        },
        {
          id: "ritmo", titulo: "Ritmo harmônico e cadência",
          objetivo: "Controlar quando os acordes mudam: começo lento, aceleração, cadência que chega.",
          ouvir: ["Mozart, K. 331, tema: 1 acorde por compasso no começo, 2 perto da cadência", "Beethoven, op. 2 nº 1, c. 1–8"],
          esboco: "Numa frase de 8 compassos com semicadência no 4 e cadência perfeita no 8, quantos acordes por compasso você usaria em cada trecho?",
          secoes: [
            { tipo: "texto", titulo: "Onde e quando os acordes mudam", html: `
              <ul><li>Mudanças de acorde preferem tempos fortes; um acorde que atravessa a barra vindo do tempo fraco é síncope harmônica (efeito, não rotina).</li>
              <li>A chegada da cadência cai num tempo mais forte que o acorde anterior; o 6/4 cadencial fica no forte e o V no fraco — invertido, soa como erro métrico.</li>
              <li><b>Aceleração:</b> começo com um acorde por compasso (ou menos), dois ou mais nos compassos antes da cadência. Ritmo harmônico uniforme desde o início não deixa espaço para acelerar e a cadência 'não chega'.</li>
              <li>Dissonâncias harmônicas (7ª do V7, retardos) no tempo forte intensificam; passagens ficam nos fracos.</li></ul>` },
            { tipo: "exemplo", titulo: "Frase de 8 compassos com aceleração",
              camadas: [
                { titulo: "Melodia e plano", partitura: "tom: C maior\nmelodia: E5/2 D5 C5/4 F5/2 E5 D5/4 E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4", rotulos: ["melodia"],
                  notas: [["decisao", "Semicadência no c. 4 (D5 sobre V), cadência perfeita no c. 8. Clímax A5 no c. 6, antes da descida cadencial."]] },
                { titulo: "Baixo e ritmo harmônico", partitura: "tom: C maior\nmelodia: E5/2 D5 C5/4 F5/2 E5 D5/4 E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4\nbaixo: C3/4 E3 D3/2 C3 G2/4 C3/2 E3 D3 F3 E3/1 F3 G3 G3 C3/4", rotulos: ["melodia", "baixo"],
                  cifras: [[0, "I"], [4, "I6"], [8, "ii"], [10, "I"], [12, "V"], [16, "I"], [18, "I6"], [20, "ii"], [22, "ii6"], [24, "I6"], [25, "ii6"], [26, "I64"], [27, "V"], [28, "I"]],
                  notas: [["decisao", "Compassos 1–4: 1, 1, 2, 1 acordes por compasso. Compassos 5–7: 2, 2, 4 — a aceleração empurra para a cadência."],
                    ["decisao", "C. 7: I6–ii6–I64–V em semínimas; o 6/4 no 3º tempo (forte) e o V no 4º (fraco)."],
                    ["checagem", "C. 1: D5 sobre C3 é uma 9ª de passagem no tempo fraco (E5–D5–C5), resolvida por grau."]],
                  pausa: ["O que aconteceria se o c. 7 tivesse um só acorde (V) e o c. 8 o I?", "A cadência chegaria com o mesmo ritmo harmônico do começo: sem aceleração, soaria como mais um compasso de tônica–dominante, e não como fechamento."] },
              ] },
          ],
          exercicios: [
            { id: "rit1", titulo: "Baixo com aceleração", modo: "restrição", perfil: { ...TONAL, ritmo_harmonico: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, acelerar: [[1, 4], [5, 7]] } }, cifrasAluno: true,
              instrucoes: "<p>Escreva baixo e cifras para a melodia de 8 compassos: semicadência no compasso 4, cadência perfeita no 8, e <b>ritmo harmônico mais rápido nos compassos 5–7 que nos 1–4</b>.</p>",
              texto: "tom: C maior\ncf: melodia\nmelodia: E5/2 D5 C5/4 F5/2 E5 D5/4 E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4\nbaixo:", duracao: 2, plano: PLANO_BAIXO,
              solucao: "tom: C maior\ncf: melodia\nmelodia: E5/2 D5 C5/4 F5/2 E5 D5/4 E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4\nbaixo: C3/4 E3 D3/2 C3 G2/4 C3/2 E3 D3 F3 E3/1 F3 G3 G3 C3/4",
              solucaoCifras: "I I6 ii I V I I6 ii ii6 I6 ii6 I64 V I" },
            { id: "rit2", titulo: "Frase livre com aceleração", modo: "livre", perfil: { ...TONAL, ritmo_harmonico: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, acelerar: [[1, 4], [5, 7]] } }, cifrasAluno: true, alvoCompassos: 8,
              instrucoes: "<p>Componha melodia, baixo e cifras: 8 compassos, semicadência no 4, cadência perfeita no 8, aceleração harmônica nos compassos 5–7.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 2, plano: PLANO_FRASE },
          ],
        },
        {
          id: "esquemas", titulo: "Esquemas galantes",
          objetivo: "Compor frases encadeando moldes de soprano e baixo (Do-Re-Mi, Romanesca, Prinner, cadência composta).",
          ouvir: ["Pachelbel, Cânone em ré (Romanesca)", "Mozart, Sonata K. 545, 1º mov. (Prinners)", "Minuetos de Haydn e Mozart depois da barra dupla (Monte, Fonte, Ponte)", "Corelli, Sonatas op. 5"],
          esboco: "Escreva só os graus (soprano/baixo) de uma frase de 4 compassos: uma abertura, uma resposta e uma cadência.",
          secoes: [
            { tipo: "texto", titulo: "Moldes com lugar na frase", html: `
              <p>Para Gjerdingen, um esquema é um par de vozes externas com <b>etapas</b> fixas e um lugar típico na frase. A originalidade vinha da recombinação — o ensino napolitano memorizava esses moldes cantando, tocando e realizando.</p>
              <ul><li><b>Aberturas:</b> Do-Re-Mi (sop. 1–2–3 / baixo 1–7–1), Romanesca (baixo 1–7–6–3 ou 1–5–6–3 saltada; sop. 3–2–1–7 ou 1–5–1–1), Meyer (sop. 1–7…4–3 / baixo 1–2…7–1).</li>
              <li><b>Resposta:</b> Prinner (sop. 6–5–4–3 / baixo 4–3–2–1, em 10ªs).</li>
              <li><b>Continuação:</b> Monte (sobe, tonicizando IV e V), Fonte (desce, ii e I), Ponte (prolonga o V).</li>
              <li><b>Cadências:</b> simples, composta (5 repetido: 6/4–5/3), dupla; convergente (4–♯4–5) para a semicadência; Quiescenza como moldura final.</li></ul>
              <p>Gramática típica: <b>abertura → Prinner → (continuação) → cadência</b>, conexões por nota comum ou grau no soprano e por contrário ou 10ªs no baixo, ritmo harmônico acelerando.</p>` },
            { tipo: "exemplo", titulo: "Do-Re-Mi → Prinner → cadência composta",
              camadas: [
                { titulo: "O esqueleto de graus", texto: "Do-Re-Mi (c. 1–3): soprano 1–2–3 sobre baixo 1–7–1. Prinner (c. 4–5): soprano 6–5–4–3 sobre baixo 4–3–2–1. Cadência composta (c. 6–8): ii6 – I64 – V – I.",
                  partitura: "tom: C maior\nsoprano: C5/4 D5 E5 A5/2 G5 F5 E5 D5/4 E5/2 D5 C5/4\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4", rotulos: ["soprano", "baixo"],
                  cifras: [[0, "I"], [4, "V6"], [8, "I"], [12, "IV"], [14, "I6"], [16, "vii°6"], [18, "I"], [20, "ii6"], [24, "I64"], [26, "V"], [28, "I"]],
                  notas: [["decisao", "Ligação Do-Re-Mi → Prinner: E5 → A5 no soprano (salto de 4ª) sobre C3 → F3: 10ª → 10ª, o registro sobe para o Prinner descer."],
                    ["decisao", "Prinner → cadência: E5/C3 → D5/F3, contrário, e 6ªs paralelas no ii6 → I64."],
                    ["checagem", "Ritmo harmônico: 1, 1, 1, 2, 2, 1, 2, 1 por compasso — acelera no Prinner e na cadência."]] },
              ] },
            { tipo: "contraste", titulo: "Romanesca saltada e Prinner, em mínimas",
              a: { rotulo: "Romanesca → Prinner", partitura: "tom: C maior\nsoprano: E5/2 D5 C5 B4 A4 G4 F4 E4\nbaixo: C3/2 G2 A2 E2 F2 E2 D2 C2", cifras: [[0, "I"], [2, "V"], [4, "vi"], [6, "iii"], [8, "IV"], [10, "I6"], [12, "vii°6"], [14, "I"]] },
              b: { rotulo: "A mesma abertura sem o Prinner", partitura: "tom: C maior\nsoprano: E5/2 D5 C5 B4 A4 B4 C5/4\nbaixo: C3/2 G2 A2 E2 F2 G2 C3/4", cifras: [[0, "I"], [2, "V"], [4, "vi"], [6, "iii"], [8, "IV"], [10, "V"], [12, "I"]] },
              pergunta: "Qual das duas soa como 'pergunta e resposta', e qual como um gesto só?",
              comentario: "<p>Em A, a Romanesca abre e o Prinner responde — a melodia desce uma oitava inteira em dois gestos simétricos (5–10–5–10 e depois 10ªs). Em B, a abertura vai direto para uma cadência: o mesmo material, sem a resposta, soa curto e apressado; falta a segunda metade do arco.</p>" },
          ],
          exercicios: [
            { id: "esq1", titulo: "Realizar o soprano sobre um baixo de esquemas", modo: "completar", perfil: { ...MELODIA, esquema: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 }, esquemas: [{ nome: "Do-Re-Mi", inicio: 0, etapa: 4, baixo: [1, 7, 1], soprano: [1, 2, 3] }, { nome: "Prinner", inicio: 12, etapa: 2, baixo: [4, 3, 2, 1], soprano: [6, 5, 4, 3] }] },
              cifras: "I V6 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>O baixo e as cifras estão prontos: Do-Re-Mi (c. 1–3), Prinner (c. 4–5) e cadência composta (c. 6–8). Escreva o soprano com os graus de cada esquema no começo das etapas; entre elas, diminua à vontade (notas do acorde nos tempos fortes).</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4", duracao: 4, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nsoprano: C5/4 D5 E5 A5/2 G5 F5 E5 D5/4 E5/2 D5 C5/4\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4" },
            { id: "esq2", titulo: "Romanesca → Prinner → cadência", modo: "menos apoio", perfil: { ...TONAL, esquema: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 6 }, esquemas: [{ nome: "Romanesca", inicio: 0, etapa: 2, baixo: [1, 5, 6, 3], soprano: [3, 2, 1, 7] }, { nome: "Prinner", inicio: 8, etapa: 2, baixo: [4, 3, 2, 1], soprano: [6, 5, 4, 3] }] },
              cifrasAluno: true, alvoCompassos: 6,
              instrucoes: "<p>Escreva as duas vozes (em mínimas) e as cifras: Romanesca saltada (c. 1–2), Prinner (c. 3–4) e uma cadência autêntica perfeita (c. 5–6).</p>",
              texto: "tom: C maior\nsoprano:\nbaixo:", duracao: 2, plano: PLANO_FRASE,
              solucao: "tom: C maior\nsoprano: E5/2 D5 C5 B4 A4 G4 F4 E4 D4 B3 C4/4\nbaixo: C3/2 G2 A2 E2 F2 E2 D2 C2 F2 G2 C2/4",
              solucaoCifras: "I V vi iii IV I6 vii°6 I ii6 V I" },
            { id: "esq3", titulo: "Sua combinação de esquemas", modo: "variante", perfil: { ...TONAL }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 8 } }, cifrasAluno: true, alvoCompassos: 8,
              instrucoes: "<p>Escolha três esquemas e encadeie-os numa frase de 8 compassos que termine em cadência perfeita. Escreva no plano quais esquemas e em que compassos.</p>",
              texto: "tom: C maior\nsoprano:\nbaixo:", duracao: 2, plano: [["Esquemas", "Quais, em que ordem e em que compassos?"], ...PLANO_FRASE] },
          ],
        },
      ],
    },

    // ================================================================== NÍVEL 3
    {
      numero: 3, titulo: "A frase e o tema",
      resumo: "Melodia como esqueleto diminuído, e as duas formas-base do tema clássico: sentença e período.",
      temas: [
        {
          id: "superficie", titulo: "Esqueleto e superfície da melodia",
          objetivo: "Compor a melodia em dois níveis: uma linha estrutural (uma nota por harmonia) e a sua diminuição com uma figura consistente.",
          ouvir: ["Mozart, K. 545, 1º mov.: reduza o soprano a uma nota por acorde", "Bach, Prelúdio em dó maior BWV 846: a melodia composta dentro do arpejo"],
          esboco: "Sobre I | V6 | I (uma semibreve por compasso), escreva a linha estrutural (3 notas) e depois uma versão em semínimas.",
          secoes: [
            { tipo: "texto", titulo: "Estrutural e ornamental", html: `
              <p>Notas estruturais tendem a ser consonantes com o baixo, fortes ou longas, e se ligam por grau (descidas 5–4–3–2–1 ou 3–2–1). As ornamentais se explicam como passagem, bordadura, apojatura, arpejo ou antecipação — uma apojatura no tempo forte é ornamento, e a estrutural é a sua resolução. Saltos alternados criam <b>melodia composta</b>: duas linhas implícitas, cada uma precisando de boa condução.</p>
              <h3>Compor ao contrário da análise</h3>
              <ol><li>Linha-esqueleto: uma nota por harmonia, com uma descida estrutural rumo à cadência.</li>
              <li>Confira-a como 1ª espécie contra o baixo.</li>
              <li>Diminua com <b>uma figura rítmico-melódica consistente</b> (não invente uma figura nova por compasso).</li>
              <li>Reduza de novo o que escreveu: o esqueleto sobreviveu?</li></ol>` },
            { tipo: "exemplo", titulo: "Uma figura, do começo à cadência", intro: "Frase de 4 compassos em dó maior; o baixo e as cifras já estão decididos.",
              camadas: [
                { titulo: "Linha-esqueleto", partitura: "tom: C maior\nsoprano: E5/2 G5 A5 G5 E5 F5 E5 D5 C5/4\nbaixo: C3/2 E3 F3 G3 A3 F3 G3 G3 C3/4", rotulos: ["esqueleto", "baixo"], cifras: [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]],
                  notas: [["decisao", "Uma nota por acorde. Sobe E5–G5–A5 (clímax no IV, c. 2) e desce G5–E5–F5–E5–D5–C5: a descida estrutural 3–2–1 fica para o fim."],
                    ["checagem", "Contra o baixo: 10–10–10–8 | 5–8–6–5 | 8. As 10ªs paralelas do começo são o tecido; as 8ªs e 5ªs do meio chegam por movimento contrário ou oblíquo."],
                    ["rejeitada", "Pensei em B4 sobre o V do c. 2: a linha cairia uma 7ª logo depois do clímax e jogaria fora o registro que acabou de conquistar. G5 começa a descida por grau."]] },
                { titulo: "Superfície: semínima + duas colcheias", partitura: "tom: C maior\nsoprano: E5/1 G5/0.5 F5 G5/1 E5/0.5 G5 A5/1 F5/0.5 A5 G5/1 D5/0.5 G5 E5/1 C5/0.5 E5 F5/1 A5/0.5 F5 E5/1 G5/0.5 E5 D5/2 C5/4\nbaixo: C3/2 E3 F3 G3 A3 F3 G3 G3 C3/4", rotulos: ["melodia", "baixo"], cifras: [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]],
                  notas: [["decisao", "Figura: a nota do esqueleto na semínima; as colcheias arpejam o acorde e voltam (ou passam) para a próxima nota estrutural."],
                    ["decisao", "Compassos 1–3 repetem a figura em sequência (G5–E5–G5, A5–F5–A5, G5–D5–G5): o ouvinte reconhece o gesto e passa a ouvir o esqueleto por trás dele."],
                    ["decisao", "C. 4: liquidação — a figura some e sobra D5–C5 em mínimas; a cadência é mais lenta que a frase, e é por isso que chega."],
                    ["checagem", "Reduzindo de novo (primeira nota de cada meio compasso): E5 G5 A5 G5 E5 F5 E5 D5 C5. O esqueleto sobreviveu."]],
                  pausa: ["No c. 1, por que F5 (fora do acorde) e não outra nota do acorde entre G5 e G5?", "Porque o F5 liga G5 à próxima nota do esqueleto… que também é G5: ele funciona como bordadura. Uma nota do acorde (C5) faria um salto de 4ª para baixo e outro de volta, e o gesto do c. 1 ficaria diferente dos seguintes."] },
              ] },
            { tipo: "contraste", titulo: "Figura consistente × figura nova a cada tempo",
              a: { rotulo: "A — uma figura por meio compasso", partitura: "tom: C maior\nsoprano: E5/1.5 F5/0.5 G5/0.25 F5 E5 F5 G5/1 A5/2 G5/0.5 D5 G5 F5 E5/1.5 C5/0.5 F5/0.5 E5 D5 F5 E5/2 D5 C5/4\nbaixo: C3/2 E3 F3 G3 A3 F3 G3 G3 C3/4", cifras: [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]] },
              b: { rotulo: "B — uma figura para a frase", partitura: "tom: C maior\nsoprano: E5/1 G5/0.5 F5 G5/1 E5/0.5 G5 A5/1 F5/0.5 A5 G5/1 D5/0.5 G5 E5/1 C5/0.5 E5 F5/1 A5/0.5 F5 E5/1 G5/0.5 E5 D5/2 C5/4\nbaixo: C3/2 E3 F3 G3 A3 F3 G3 G3 C3/4", cifras: [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]] },
              pergunta: "Mesmo esqueleto, mesmas harmonias, nenhum erro. Qual delas você conseguiria cantar de memória depois de ouvir duas vezes? Por quê?",
              comentario: "<p>A usa pontuada, semicolcheias, mínima, colcheias em arpejo e colcheias em escala — cinco ideias em três compassos. Cada uma é aceitável; juntas, nenhuma se torna tema e o ouvinte não sabe o que é essencial. B repete um gesto e o transporta com a harmonia: a variedade vem do esqueleto (que sobe e desce) e não da superfície. A liquidação do c. 4 só é percebida porque havia uma figura para liquidar.</p>" },
          ],
          exercicios: [
            { id: "sup1", titulo: "Diminuir um esqueleto", modo: "completar", perfil: { ...MELODIA, esqueleto_preservado: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: [[0, "C5"], [4, "D5"], [8, "E5"], [12, "A5"], [14, "G5"], [16, "F5"], [18, "E5"], [20, "D5"], [24, "E5"], [26, "D5"], [28, "C5"]] },
              cifras: "I V6 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>O baixo, as cifras e o esqueleto do soprano (C5 D5 E5 | A5 G5 F5 E5 | D5 | E5 D5 | C5, nos inícios de cada acorde) estão dados. Escreva o soprano diminuído, em semínimas e colcheias, mantendo as notas do esqueleto nesses tempos e usando notas fora do acorde só por grau.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nsoprano: C5/1 D5 E5 C5 D5 C5 B4 D5 E5 D5 E5 G5 A5 F5 G5 E5 F5 D5 E5 C5 D5 E5 F5 D5 E5 C5 D5 B4 C5/4\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4" },
            { id: "sup2", titulo: "Seu esqueleto, uma figura só", modo: "menos apoio", perfil: { ...MELODIA }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 5 } }, cifras: "I vi IV V I6 vi ii6 V I".split(" "),
              instrucoes: "<p>Baixo e cifras dados (5 compassos, um acorde por mínima). Escreva primeiro no plano a linha-esqueleto (uma nota por acorde, descida 3–2–1 ou 5–4–3–2–1 no fim) e depois o soprano com <b>uma única figura rítmica</b> em todos os meios compassos até a cadência, que pode liquidar.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/2 A2 F2 G2 E2 A2 F2 G2 C3/4", duracao: 1, alvoCompassos: 5,
              plano: [["Esqueleto", "As 9 notas estruturais, uma por acorde."], ["Figura", "Qual figura (ritmo e desenho) e o que ela faz entre duas notas do esqueleto?"], ["Liquidação", "Onde a figura para, e o que sobra?"]],
              solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 G5/0.5 F5 E5/1 C5/0.5 E5 F5/1 A5/0.5 F5 D5/1 B4/0.5 D5 C5/1 E5/0.5 D5 C5/1 A4/0.5 C5 D5/2 B4 C5/4\nbaixo: C3/2 A2 F2 G2 E2 A2 F2 G2 C3/4",
              comentarioSolucao: "Esqueleto E5 E5 | F5 D5 | C5 C5 | D5 B4 | C5, figura semínima + duas colcheias (arpejo e volta ou passagem), liquidada no c. 4." },
            { id: "sup3", titulo: "Livre: frase de 4 compassos em dois níveis", modo: "livre", perfil: { ...MELODIA }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, alvoCompassos: 4,
              instrucoes: "<p>Componha melodia, baixo e cifras de uma frase de 4 compassos que feche em cadência perfeita. Primeiro o esqueleto (no plano), depois a superfície com uma figura consistente.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 1, plano: [["Esqueleto", "Uma nota por acorde, com a descida estrutural."], ...PLANO_FRASE] },
          ],
        },
        {
          id: "sentenca", titulo: "A sentença",
          objetivo: "Compor uma sentença de 8 compassos: apresentação que prolonga a tônica, continuação que fragmenta, acelera e liquida.",
          ouvir: ["Beethoven, Sonata op. 2 nº 1, 1º mov., c. 1–8 (o modelo de Schoenberg)", "Mozart, Sinfonia nº 40, 1º mov., tema"],
          esboco: "Escreva só a ideia básica (2 compassos) e decida: a repetição será exata ou em tônica–dominante?",
          secoes: [
            { tipo: "texto", titulo: "Funções da sentença (Caplin)", html: `
              <ul><li><b>Apresentação</b> (c. 1–4): ideia básica de 2 compassos + repetição (exata ou tônica–dominante), prolongando I.</li>
              <li><b>Continuação</b> (c. 5–6/7): <b>fragmentação</b> (unidades de 1 compasso ou menos), aceleração do ritmo harmônico e melódico, sequência.</li>
              <li><b>Cadência</b> (c. 7–8): fórmula convencional, normalmente fundida com a continuação; a <b>liquidação</b> tira do motivo seus traços até restar a fórmula cadencial.</li></ul>
              <p>Fragmentação é tamanho; liquidação é conteúdo. Uma continuação que não fragmenta nem acelera transforma a sentença em 4 + 4 da mesma densidade. Um Prinner funciona perfeitamente como continuação.</p>` },
            { tipo: "exemplo", titulo: "Uma sentença decidida em camadas",
              camadas: [
                { titulo: "Plano harmônico e esqueleto", partitura: "tom: C maior\nsoprano: G5/4 F5 F5 E5 A5/2 G5 F5 E5 D5 C5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3 G3 C3/4", rotulos: ["esqueleto", "baixo"],
                  notas: [["decisao", "I | V7 | V7 | I (apresentação, um acorde por compasso) → IV I6 | vii°6 I (dois por compasso) → ii6 I64–V | I."],
                    ["decisao", "Esqueleto: G5 – F5 – E5 na apresentação, clímax A5 no início da continuação, descida A5–G5–F5–E5–D5–C5 até a cadência."]] },
                { titulo: "Superfície", partitura: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2 A5/0.75 G5/0.25 A5/1 G5/0.75 F5/0.25 G5/1 F5/0.75 E5/0.25 F5/1 E5/0.75 D5/0.25 E5/1 D5/2 E5/1 D5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4",
                  rotulos: ["melodia", "baixo"], cifras: [[0, "I"], [4, "V7"], [8, "V7"], [12, "I"], [16, "IV"], [18, "I6"], [20, "vii°6"], [22, "I"], [24, "ii6"], [26, "I64"], [27, "V"], [28, "I"]],
                  notas: [["decisao", "Ideia básica: a = C5–E5–G5 (arpejo pontuado) + b = F5–E5–D5 (descida). Repetição em tônica–dominante: B4–D5–F5 | E5–D5–C5."],
                    ["decisao", "Continuação: fragmentos de meio compasso (pontuada + semicolcheia, diminuição rítmica da cabeça de a) em sequência descendente sobre 10ªs — um Prinner."],
                    ["rejeitada", "Uma primeira versão tinha F5 no c. 5: C5/C3 → F5/F3 formava 8ªs paralelas entre melodia e baixo. A5 resolve e ainda dá o clímax."],
                    ["decisao", "C. 7: liquidação — sem ritmo pontuado, só D5–E5–D5 sobre ii6–I64–V."]],
                  pausa: ["Por que a repetição da ideia básica é sobre V7, e não exata?", "A versão tônica–dominante já cria movimento harmônico dentro da apresentação e deixa a continuação começar com IV sem soar como recomeço. Uma repetição exata seria mais estática e pediria uma continuação mais enérgica."] },
              ] },
          ],
          exercicios: [
            { id: "sen1", titulo: "Completar a continuação", modo: "completar", perfil: { ...MELODIA }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 } }, cifras: "I V7 V7 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>A apresentação (c. 1–4), o baixo e as cifras estão prontos. Escreva a continuação e a cadência (c. 5–8): fragmente, acelere e liquide.</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4",
              duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2 A5/0.75 G5/0.25 A5/1 G5/0.75 F5/0.25 G5/1 F5/0.75 E5/0.25 F5/1 E5/0.75 D5/0.25 E5/1 D5/2 E5/1 D5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4" },
            { id: "sen2", titulo: "Continuação em sequência", modo: "restrição", perfil: { ...MELODIA, sequencia_do_motivo: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 }, motivo: { de: 5, em: [6] } }, cifras: "I V7 V7 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>Escreva a sentença inteira sobre o baixo dado. <b>Restrição:</b> o compasso 6 é uma sequência do compasso 5 (mesmo ritmo, mesmo desenho, outra altura).</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia:\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2 A5/0.75 G5/0.25 A5/1 G5/0.75 F5/0.25 G5/1 F5/0.75 E5/0.25 F5/1 E5/0.75 D5/0.25 E5/1 D5/2 E5/1 D5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4" },
            { id: "sen3", titulo: "Sentença com o seu baixo", modo: "livre", perfil: { ...MELODIA, ritmo_harmonico: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8, acelerar: [[1, 4], [5, 7]] } }, cifrasAluno: true, alvoCompassos: 8,
              instrucoes: "<p>Componha melodia, baixo e cifras de uma sentença de 8 compassos, com aceleração harmônica na continuação e cadência perfeita no fim.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_FRASE },
          ],
        },
        {
          id: "periodo", titulo: "O período",
          objetivo: "Compor antecedente e consequente com a mesma ideia básica e cadências de força diferente.",
          ouvir: ["Mozart, Sonata K. 331, 1º mov., tema (semicadência no c. 4, cadência perfeita no c. 8)", "Beethoven, 9ª Sinfonia, 'Hino à Alegria'"],
          esboco: "Com a ideia básica da sentença (C5–E5–G5 | F5–E5–D5), como seria uma ideia contrastante que termina em semicadência?",
          secoes: [
            { tipo: "texto", titulo: "Antecedente e consequente", html: `
              <p><b>Antecedente</b>: ideia básica + ideia contrastante, terminando em cadência fraca (semicadência ou autêntica imperfeita). <b>Consequente</b>: a ideia básica volta; a contrastante é refeita para chegar à cadência perfeita. Para Caplin a diferença entre ideia básica e contrastante é harmônica: a primeira prolonga a tônica, a segunda cadencia.</p>
              <p>Armadilhas: ideia contrastante igual à básica; consequente que termina em semicadência (período de duas perguntas); cadência perfeita já no antecedente; a mesma densidade rítmica do começo ao fim.</p>` },
            { tipo: "exemplo", titulo: "Um período com a mesma ideia básica",
              camadas: [
                { titulo: "Antecedente e consequente", partitura: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 E5/0.5 G5 F5 E5 D5 E5 D5 C5 B4/4 C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 G5/1 F5 E5 D5 C5/4\nbaixo: C3/4 G2 C3/2 D3 G2/4 C3/4 G3 E3/1 F3 G3 G3 C3/4",
                  rotulos: ["melodia", "baixo"], cifras: [[0, "I"], [4, "V7"], [8, "I"], [10, "ii"], [12, "V"], [16, "I"], [20, "V7"], [24, "I6"], [25, "ii6"], [26, "I64"], [27, "V"], [28, "I"]],
                  notas: [["decisao", "Ideia contrastante (c. 3): colcheias contínuas — contraste de ritmo, não só de alturas."],
                    ["decisao", "Semicadência no c. 4 em B4 (a 3ª do V): a melodia desce por grau C5–B4 e fica suspensa na sensível, pedindo o consequente. D5 (a 5ª) também serviria, mas repetiria a nota final do c. 2."],
                    ["decisao", "Consequente: c. 5–6 = c. 1–2; c. 7 desce 5–4–3–2 sobre I6–ii6–I64–V, c. 8 chega à tônica."]] },
              ] },
          ],
          exercicios: [
            { id: "per1", titulo: "Completar o consequente", modo: "completar", perfil: { ...MELODIA, ideia_repetida: "erro", semicadencia: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, repete: [1, 5] } }, cifras: "I V7 I ii V I V7 I6 ii6 I64 V I".split(" "),
              instrucoes: "<p>O antecedente, o baixo e as cifras estão prontos. Escreva o consequente (c. 5–8).</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 E5/0.5 G5 F5 E5 D5 E5 D5 C5 B4/4\nbaixo: C3/4 G2 C3/2 D3 G2/4 C3/4 G3 E3/1 F3 G3 G3 C3/4",
              duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 E5/0.5 G5 F5 E5 D5 E5 D5 C5 B4/4 C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 G5/1 F5 E5 D5 C5/4\nbaixo: C3/4 G2 C3/2 D3 G2/4 C3/4 G3 E3/1 F3 G3 G3 C3/4" },
            { id: "per2", titulo: "Período sobre o baixo dado", modo: "menos apoio", perfil: { ...MELODIA, ideia_repetida: "erro", semicadencia: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, repete: [1, 5] } }, cifras: "I V7 I ii V I V7 I6 ii6 I64 V I".split(" "),
              instrucoes: "<p>Escreva o período inteiro (com uma ideia básica sua) sobre o baixo e as cifras dados.</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia:\nbaixo: C3/4 G2 C3/2 D3 G2/4 C3/4 G3 E3/1 F3 G3 G3 C3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE },
            { id: "per3", titulo: "Período com o seu baixo", modo: "livre", perfil: { ...MELODIA, ideia_repetida: "erro", semicadencia: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, repete: [1, 5] } }, cifrasAluno: true, alvoCompassos: 8,
              instrucoes: "<p>Componha melodia, baixo e cifras de um período de 8 compassos: semicadência no 4, cadência perfeita no 8, consequente começando como o antecedente.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_FRASE },
          ],
        },
      ],
    },
  ];

  raiz.TEMAS = { niveis };
})(this);
