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
  const N1 = { perfilNivel: 1, nivel: 1, extras: { climax_coincidente: "aviso", notas_do_modo: "erro" } };
  const N2 = { perfilNivel: 2, nivel: 2, extras: { climax_coincidente: "aviso", notas_do_modo: "erro" } };
  const N4 = { perfilNivel: 4, nivel: 4, extras: { climax_coincidente: "aviso", notas_do_modo: "erro" } };
  const N3 = { perfilNivel: 3, nivel: 3, extras: { climax_coincidente: "aviso", notas_do_modo: "erro", paralelas_entre_tempos: "erro" } };
  const TONAL = {
    quintas_paralelas: "erro", oitavas_paralelas: "erro", quintas_oitavas_ocultas: "erro", cruzamento_de_vozes: "erro",
    dissonancia_aproximacao: "aviso", dissonancia_resolucao: "erro", cifras_coerentes: "erro", retrogressao_cifrada: "erro",
    seis_quatro: "erro", cadencias_do_plano: "erro", salto_maior_que_oitava: "erro", intervalo_melodico_aumentado_diminuto: "erro",
    salto_nao_compensado: "aviso",
  };
  const MELODIA = { ...TONAL, notas_do_acorde: "erro", cadencia_final: "erro" };
  const CANTUS = {
    cf_final: "erro", cf_chegada: "erro", cf_tamanho: "erro", so_semibreves: "erro", cf_saltos_seguidos: "erro", cf_salto_recuperado: "erro",
    contorno_tritono: "erro", notas_do_modo: "erro", intervalo_melodico_aumentado_diminuto: "erro", salto_maior_que_oitava: "erro",
    salto_de_sexta_ou_setima: "erro", nota_repetida: "erro", ponto_culminante: "aviso", ambito_melodico: "aviso",
  };

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
      resumo: "Os modos e o contraponto estrito como disciplina de composição: arquitetura da linha, textura das consonâncias e elaboração de um esqueleto.",
      temas: [
        {
          id: "modos", titulo: "Os modos",
          antes: [
            { p: "Quais são as notas de ré dórico?", o: ["D E F G A B C", "D E F G A B♭ C", "D E F♯ G A B C♯", "D E♭ F G A B♭ C"], e: "Dórico é a escala das teclas brancas a partir de ré: D E F G A B C. Com B♭ seria ré eólio; com F♯ e C♯, ré maior; com E♭, ré frígio." },
            { p: "O que distingue o dórico do eólio (menor natural)?", o: ["A 6ª maior acima da final", "A 3ª maior", "A 7ª maior", "A 4ª aumentada"], e: "Os dois têm 3ª menor e 7ª menor; o dórico tem a 6ª maior (si em ré dórico), o eólio a 6ª menor (si♭ em ré eólio). Essa 6ª é a cor do dórico." },
            { p: "Na cadência de ré dórico, a penúltima nota do contraponto em cima (sobre o mi do cantus) é:", o: ["dó♯ (sensível alterada)", "dó natural", "si", "mi"], e: "A cadência pede um semitom subindo para a final: dó vira dó♯ só ali (musica ficta). No resto da linha, dó natural." },
          ],
          objetivo: "Saber as notas de cada modo, a sua cor característica e como ele cadencia — o que está por trás de 'ré dórico', 'mi frígio' ou 'lá eólio' nos exercícios.",
          ouvir: ["Canto gregoriano: 'Veni Creator Spiritus' (mixolídio) e 'Dies irae' (dórico)", "Palestrina, Missa Papae Marcelli (vários modos)", "Scarborough Fair (dórico) e Greensleeves (dórico/eólio)", "Debussy, 'La cathédrale engloutie' (modal)"],
          esboco: "Sem consultar nada: quais notas você usaria em ré dórico, e onde acha que fica o semitom que leva à final?",
          secoes: [
            { tipo: "texto", titulo: "O modo é a posição dos semitons", html: `
              <p>Um modo é uma escala diatônica (cinco tons e dois semitons) vista a partir de uma nota chamada <b>final</b>. Nas teclas brancas, cada modo começa numa nota diferente:</p>
              <table class="tabela-modos"><thead><tr><th>Modo</th><th>Teclas brancas</th><th>Tons (T) e semitons (S)</th><th>Cor característica</th><th>Cadência</th></tr></thead><tbody>
              <tr><td><b>Dórico</b></td><td>D E F G A B C</td><td>T S T T T S T</td><td>menor com <b>6ª maior</b></td><td>7º elevado (C♯)</td></tr>
              <tr><td><b>Frígio</b></td><td>E F G A B C D</td><td>S T T T S T T</td><td>menor com <b>2ª menor</b></td><td>sem sensível: F → E desce</td></tr>
              <tr><td><b>Lídio</b></td><td>F G A B C D E</td><td>T T T S T T S</td><td>maior com <b>4ª aumentada</b></td><td>já tem semitom E → F</td></tr>
              <tr><td><b>Mixolídio</b></td><td>G A B C D E F</td><td>T T S T T S T</td><td>maior com <b>7ª menor</b></td><td>7º elevado (F♯)</td></tr>
              <tr><td><b>Eólio</b></td><td>A B C D E F G</td><td>T S T T S T T</td><td>menor natural (<b>6ª e 7ª menores</b>)</td><td>7º elevado (G♯) e, subindo, 6º (F♯)</td></tr>
              <tr><td><b>Jônio</b></td><td>C D E F G A B</td><td>T T S T T T S</td><td>o nosso maior</td><td>já tem sensível</td></tr>
              </tbody></table>
              <h3>Transpor um modo</h3>
              <p>O modo não são as notas, é a sequência de tons e semitons. Ré dórico usa as teclas brancas; <b>dó dórico</b> precisa da mesma sequência a partir de dó: C D E♭ F G A B♭. <b>Mi eólio</b>: E F♯ G A B C D. Para achar as notas, escreva a escala maior da final e altere: dórico = maior com 3ª e 7ª abaixadas; frígio = 2ª, 3ª, 6ª e 7ª abaixadas; lídio = 4ª elevada; mixolídio = 7ª abaixada; eólio = 3ª, 6ª e 7ª abaixadas.</p>
              <h3>A cadência e a <i>musica ficta</i></h3>
              <p>No contraponto as linhas cadenciam por semitom para a final, em movimento contrário. Onde o modo não tem esse semitom abaixo da final (dórico, mixolídio, eólio), a <b>sensível é elevada só na cadência</b>; no eólio, quando a linha sobe 6–7–1, o 6º também sobe (F♯–G♯–A) para evitar a 2ª aumentada. No frígio o semitom já existe acima da final (F → E): a voz que tem o 2º grau desce, e a outra chega por tom (D → E), sem alteração.</p>
              <p>Nos exercícios, a linha acima da partitura mostra as notas do modo e a alteração permitida; a regra <b>Notas do modo</b> marca qualquer nota de fora, e a sensível alterada fora dos dois últimos compassos.</p>` },
            { tipo: "exemplo", titulo: "Quatro modos sobre a mesma final", intro: "Todas as escalas começam em ré, para a cor de cada modo ficar evidente. O número embaixo é o grau; a estrela marca a nota característica.",
              camadas: [
                { titulo: "Ré dórico", partitura: "tom: D dorico\nescala: D4/1 E4 F4 G4 A4 B4 C5 D5/4", anotacoes: [[0, 0, "1"], [0, 1, "2"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6 ★"], [0, 6, "7"], [0, 7, "8"]],
                  notas: [["decisao", "D E F G A B C: 3ª menor (F) e 7ª menor (C), mas 6ª maior (B). É o si natural que torna o dórico menos sombrio que o menor."]] },
                { titulo: "Ré eólio", partitura: "tom: D eolio\nescala: D4/1 E4 F4 G4 A4 Bb4 C5 D5/4", anotacoes: [[0, 0, "1"], [0, 1, "2"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6 ★"], [0, 6, "7"], [0, 7, "8"]],
                  notas: [["checagem", "Só o 6º grau muda: B♭ em vez de B. Compare ouvindo as duas."]] },
                { titulo: "Ré frígio", partitura: "tom: D frigio\nescala: D4/1 Eb4 F4 G4 A4 Bb4 C5 D5/4", anotacoes: [[0, 0, "1"], [0, 1, "2 ★"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6"], [0, 6, "7"], [0, 7, "8"]],
                  notas: [["decisao", "A 2ª menor (E♭) logo acima da final é a assinatura do frígio: a cadência desce E♭ → D."]] },
                { titulo: "Ré mixolídio", partitura: "tom: D mixolidio\nescala: D4/1 E4 F#4 G4 A4 B4 C5 D5/4", anotacoes: [[0, 0, "1"], [0, 1, "2"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6"], [0, 6, "7 ★"], [0, 7, "8"]],
                  notas: [["decisao", "Maior com 7ª menor (C natural). Na cadência o C vira C♯; no meio da linha, o C natural dá a cor."]] },
              ] },
            { tipo: "contraste", titulo: "Dórico × eólio na mesma melodia",
              a: { rotulo: "A — ré dórico (si natural)", partitura: "tom: D dorico\ncantus: D4/4 F4 G4 A4 B4 A4 G4 F4 E4 D4" },
              b: { rotulo: "B — ré eólio (si bemol)", partitura: "tom: D eolio\ncantus: D4/4 F4 G4 A4 Bb4 A4 G4 F4 E4 D4" },
              pergunta: "Só uma nota muda. O que muda no caráter da linha, e em que ponto?",
              comentario: "<p>O clímax é justamente o 6º grau. Em A, o si natural forma uma 6ª maior com a final e abre o arco: a linha soa luminosa no ponto mais alto, e o caminho de volta tem um semitom a menos. Em B, o si♭ é um semitom acima do lá — o clímax 'pesa' e cai de volta, e a linha soa mais sombria. A cor do modo está nas notas que ele não divide com os vizinhos.</p>" },
          ],
          exercicios: [
            { id: "mod1", titulo: "Cantus firmus em ré dórico", modo: "completar", perfil: CANTUS, nivel: 1, fimLivre: true,
              instrucoes: "<p>As três primeiras notas estão escritas. Complete um cantus firmus em ré dórico (8 a 14 semibreves) que termine em ré, chegando por grau. Use o si natural ao menos uma vez: é ele que faz o modo soar dórico. Toque em <b>Terminei</b> quando acabar.</p>",
              texto: "tom: D dorico\ncantus: D4/4 F4 E4", duracao: 4,
              solucao: "tom: D dorico\ncantus: D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4", comentarioSolucao: "O cantus firmus dórico do Gradus ad Parnassum de Fux." },
            { id: "mod2", titulo: "Cantus firmus em mi frígio", modo: "restrição", perfil: CANTUS, nivel: 1, fimLivre: true,
              instrucoes: "<p>Escreva um cantus firmus em mi frígio. <b>Restrição:</b> termine descendo fá → mi (o semitom frígio) e use o fá também no meio da linha, para a cor do modo aparecer antes da cadência.</p>",
              texto: "tom: E frigio\ncantus:", duracao: 4,
              solucao: "tom: E frigio\ncantus: E4/4 C4 D4 C4 A3 A4 G4 E4 F4 E4", comentarioSolucao: "O cantus firmus frígio de Fux: repare que o salto de 8ª (A3–A4) é recuperado por grau e que o fá só aparece na cadência — uma solução mais contida que a pedida." },
            { id: "mod3", titulo: "Cantus firmus em sol mixolídio", modo: "livre", perfil: CANTUS, nivel: 1, fimLivre: true,
              instrucoes: "<p>Escreva um cantus firmus em sol mixolídio. A 7ª menor (fá natural) é a cor do modo: use-a no meio da linha; a chegada à final é por grau (lá → sol ou fá → sol).</p>",
              texto: "tom: G mixolidio\ncantus:", duracao: 4,
              solucao: "tom: G mixolidio\ncantus: G4/4 A4 C5 B4 D5 C5 A4 B4 A4 G4" },
            { id: "mod4", titulo: "1ª espécie em lá eólio", modo: "aplicar", ...N1,
              instrucoes: "<p>Contraponto de 1ª espécie em cima do cantus eólio de Fux. Notas do modo em toda a linha; na cadência, a sensível sol♯ sobre o si do cantus (6ª maior → 8ª).</p>",
              texto: "tom: A eolio\ncf: cantus\ncontraponto:\ncantus: A3/4 C4 B3 D4 C4 E4 F4 E4 D4 C4 B3 A3", duracao: 4, plano: PLANO_CP,
              solucao: "tom: A eolio\ncf: cantus\ncontraponto: E4/4 A4 D5 A4 C5 G4 A4 E5 B4 A4 G#4 A4\ncantus: A3/4 C4 B3 D4 C4 E4 F4 E4 D4 C4 B3 A3",
              comentarioSolucao: "Solução encontrada pelo verificador: o sol♯ aparece só na penúltima nota; no compasso 6 o sol natural é a 7ª menor do modo." },
          ],
        },
        {
          id: "arquitetura", titulo: "Arquitetura da linha",
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "Contraponto em cima; o cantus termina ré–dó (2̂–1̂). Quais são as duas últimas notas do contraponto?", o: ["si–dó (6ª maior → 8ª)", "sol–dó (5ª → 8ª)", "ré–dó (8ª → 8ª)", "fá–mi (3ª → 3ª)"], e: "A cadência converge por grau em movimento contrário: 6ª maior → 8ª com o contraponto em cima (3ª menor → uníssono embaixo). Sol–dó chega à 8ª por salto em movimento direto; ré–dó são 8ªs paralelas." },
            { p: "Onde planejar o clímax do contraponto?", o: ["Num ponto único, entre a metade e dois terços da linha, fora do compasso do clímax do cantus", "No primeiro terço, para ter tempo de descer até a cadência", "No mesmo compasso do clímax do cantus, para reforçá-lo", "Em dois pontos de mesma altura, para equilibrar a linha"], e: "Um único ponto culminante organiza a linha: antes dele ela ganha registro, depois gasta. Cedo demais, a linha só desce; repetido, perde força; junto com o do cantus, as vozes soam como bloco." },
            { p: "O que deve formar o 'tecido' do meio da linha?", o: ["3ªs e 6ªs, sem passar de três paralelas seguidas", "5ªs e 8ªs alternadas com 3ªs", "6ªs paralelas do começo ao fim, que são as mais suaves", "Qualquer consonância, desde que não haja paralelas proibidas"], e: "As imperfeitas mantêm o movimento; as perfeitas soam como chegadas e ficam nas pontas e nas articulações. Uma fila longa de 3ªs ou 6ªs paralelas soa como uma voz dobrada, não como duas linhas." },
          ],
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
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "Duas notas do esqueleto a uma 3ª de distância (dó → lá) em tempos fortes seguidos. Qual a diminuição mais natural no tempo fraco?", o: ["Nota de passagem (si), consonante ou dissonante", "Bordadura dissonante (ré)", "Repetir o dó", "Salto de 5ª para baixo e volta"], e: "A 3ª pede preenchimento: a passagem liga as duas notas estruturais por grau. A bordadura dissonante só entra na 3ª espécie; a repetição é proibida; o salto esconde o esqueleto." },
            { p: "Na 2ª espécie, onde as paralelas costumam passar despercebidas?", o: ["Do tempo fraco ao forte seguinte, e entre tempos fortes consecutivos", "Só entre as duas notas do mesmo compasso", "Só no primeiro e no último compasso", "Em lugar nenhum: a nota fraca sempre desfaz as paralelas"], e: "A nota fraca forma um intervalo com o próximo tempo forte (5ª → 5ª é paralela), e 5ªs ou 8ªs em tempos fortes seguidos continuam audíveis através de uma única nota fraca." },
            { p: "Que nota pode ser dissonante na 2ª espécie?", o: ["A do tempo fraco, só como passagem entre duas consonâncias", "A do tempo forte, se resolver por grau", "Qualquer uma que chegue por grau", "A do tempo fraco atingida por salto, se a seguinte for consonante"], e: "Na 2ª espécie a dissonância é só de passagem: chega e sai por grau, na mesma direção, no tempo fraco. Dissonância no tempo forte (retardo) é assunto da 4ª espécie." },
          ],
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
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "Na 3ª espécie, o que é a nota do tempo 1 de cada compasso?", o: ["Uma consonância: a nota do esqueleto", "Uma dissonância, para dar impulso", "A mesma nota do último tempo do compasso anterior", "Qualquer nota, desde que resolva no tempo 3"], e: "O tempo 1 carrega o esqueleto de 1ª espécie; as outras três semínimas são a célula que liga uma nota estrutural à seguinte." },
            { p: "Qual é o desenho da cambiata (contraponto em cima)?", o: ["Desce por grau a uma dissonância, salta uma 3ª para baixo e sobe por grau", "Sobe por grau, salta uma 4ª e volta", "Bordadura superior e inferior em volta da mesma nota", "Desce por grau quatro vezes seguidas"], e: "A cambiata é a exceção consagrada: a dissonância (2º tempo) sai por salto de 3ª e a linha volta por grau, preenchendo o espaço. É a fórmula clássica da cadência em 3ª espécie." },
            { p: "Uma 5ª no tempo 3 e outra 5ª no tempo 1 do compasso seguinte, com uma semínima no meio:", o: ["Soam como 5ªs paralelas: evite", "São aceitáveis porque não são notas vizinhas", "Só são problema se as duas vozes saltarem", "São aceitáveis se a nota do meio for dissonante"], e: "Uma única semínima entre duas 5ªs (ou 8ªs) não basta para separá-las: o ouvido liga as duas consonâncias perfeitas, sobretudo quando a segunda cai no tempo forte." },
          ],
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
        {
          id: "retardos", titulo: "Retardos: a 4ª espécie",
          antes: [
            { p: "Um retardo tem três tempos. Quais, em ordem?", o: ["Preparação consonante (fraco) → dissonância ligada (forte) → resolução por grau descendente (fraco)", "Dissonância no fraco → consonância no forte → salto", "Consonância no forte → dissonância no fraco → resolução ascendente", "Dissonância atacada no forte → resolução por salto"], e: "A dissonância do retardo não é atacada: ela já soava como consonância (preparação) e fica presa quando a outra voz se move. Resolve descendo por grau no tempo fraco." },
            { p: "Contraponto em cima: quais retardos são os bons?", o: ["7–6 e 4–3 (o 9–8 com cuidado)", "2–3 e 4–5", "6–5 e 5–4", "Qualquer um que resolva para cima"], e: "Em cima, a voz presa desce: 7 → 6 e 4 → 3 resolvem em consonância imperfeita. Embaixo, o retardo típico é 2–3. O 9–8 resolve numa perfeita e, em cadeia, soa oco." },
            { p: "Qual é a cadência da 4ª espécie com o contraponto em cima (cantus 2–1)?", o: ["7–6 sobre o 2º grau, depois a 8ª (a final presa forma 7ª, desce à sensível)", "4–3 sobre o 1º grau", "5–6 sobre o 2º grau", "Uma 8ª ligada até o fim"], e: "Em ré dórico: ré5 preso contra mi4 é 7ª, resolve em dó♯5 (6ª maior) e vai a ré5. Embaixo, a mesma ideia é 2–3: ré4 preso abaixo de mi4, resolve em dó♯4." },
          ],
          objetivo: "Usar a síncope para criar tensão no tempo forte: preparar, prender, resolver — e encadear retardos sem perder a direção da linha.",
          ouvir: ["Corelli, Sonatas op. 1–5: cadeias de 7–6 nos movimentos lentos", "Palestrina, Missa Papae Marcelli, Agnus Dei", "Pachelbel, Cânone: as suspensões das variações lentas", "Bach, Paixão segundo São Mateus, 'Erbarme dich' (retardos sobre o baixo)"],
          esboco: "Sobre ré4 → mi4 no cantus, um contraponto em cima que termine em ré5: como você criaria uma dissonância no tempo forte do penúltimo compasso sem atacá-la?",
          secoes: [
            { tipo: "texto", titulo: "A dissonância que não é atacada", html: `
              <p>Na 4ª espécie o contraponto anda em mínimas deslocadas: cada nota começa no tempo fraco e é <b>ligada</b> ao tempo forte seguinte. Quando o cantus muda de nota por baixo dela, o intervalo pode virar dissonância — e essa dissonância, já soando antes, é o <b>retardo</b>.</p>
              <ol><li><b>Preparação</b> (tempo fraco): consonância.</li>
              <li><b>Retardo</b> (tempo forte): a mesma nota, presa; o cantus andou e o intervalo virou 7ª, 4ª, 2ª ou 9ª.</li>
              <li><b>Resolução</b> (tempo fraco): um grau abaixo, numa consonância imperfeita.</li></ol>
              <p>Em cima, os bons são <b>7–6</b> e <b>4–3</b>; embaixo, <b>2–3</b>. Quando não há dissonância, a síncope é consonante (5–6, 6–5, 3–8…) e serve de ligação. Se a ligadura for impossível (uma 5ª ou 8ª no tempo forte vinda de outra, ou um salto necessário), pode-se <b>quebrar a espécie</b> por um compasso.</p>
              <h3>Cadeias e o que evitar</h3>
              <ul><li>Cadeias de 7–6 (em cima) e de 2–3 (embaixo) são o vocabulário clássico — Corelli as usa o tempo todo. Mas uma cadeia longa é uma escala disfarçada: ela precisa de um destino.</li>
              <li>9–8 e 2–1 resolvem em perfeita: em cadeia, viram 8ªs paralelas escondidas pelo atraso.</li>
              <li>A resolução é sempre para baixo; subir (a "retardo ao contrário") não resolve a tensão.</li></ul>` },
            { tipo: "exemplo", titulo: "Uma cadeia de retardos com destino", intro: "Contraponto em cima do cantus da 'Arquitetura da linha'.",
              camadas: [
                { titulo: "Síncopes e retardos", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5~ C5 B4~ B4 A4~ A4 G4~ G4 D5~ D5 C5~ C5 B4~ B4 C5~ C5 B4 C5/4\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4",
                  notas: [["decisao", "C. 2: dó5 (8ª preparada sobre dó4) fica preso sobre ré4 — 7ª — e resolve em si4 (6ª). C. 3 e 4: mais dois retardos que descem a linha (si4 sobre fá4, lá4 sobre mi4 → sol4)."],
                    ["decisao", "C. 5: sol4 preso sobre sol4 é uníssono, consonante: a cadeia para, e o salto sol4 → ré5 abre o registro para a segunda metade."],
                    ["decisao", "C. 6: ré5 preso sobre lá4 é 4ª, resolve em dó5 (3ª): um 4–3 no ponto mais alto da linha."],
                    ["checagem", "C. 9: a cadência é o 7–6 clássico — dó5 preso sobre ré4, resolve em si4, que sobe ao dó5 final."]],
                  pausa: ["Por que o salto do c. 5 vem justamente depois de três retardos seguidos?", "Porque a cadeia de retardos desce por grau a cada compasso: três seguidos já gastaram uma 4ª de registro. O salto (numa síncope consonante, sem retardo) devolve a linha ao agudo e dá início a um segundo arco, que termina na cadência — a cadeia tem destino em vez de virar escala."] },
              ] },
            { tipo: "contraste", titulo: "Síncope consonante × síncope com retardos",
              a: { rotulo: "A — quase só síncopes consonantes", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 G4~ G4 F4~ F4 C5~ C5 B4~ B4 E5~ E5 A4~ A4 B4~ B4 C5~ C5 B4 C5/4\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4" },
              b: { rotulo: "B — retardos encadeados", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5~ C5 B4~ B4 A4~ A4 G4~ G4 D5~ D5 C5~ C5 B4~ B4 C5~ C5 B4 C5/4\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4" },
              pergunta: "As duas usam ligaduras em todos os compassos. Onde cada uma cria tensão, e onde a resolve?",
              comentario: "<p>A desloca o ritmo mas quase não produz dissonância: a síncope fica como efeito rítmico, e a única tensão real é a da cadência. B transforma cada ligadura num pequeno ciclo tensão → resolução no início da frase, alivia no meio (síncopes consonantes e um salto) e volta ao 7–6 na cadência. A 4ª espécie é isso: a ligadura é o meio, a dissonância controlada é o fim.</p>" },
          ],
          exercicios: [
            { id: "ret1", titulo: "Completar: retardos sobre o cantus de Fux", modo: "completar", ...N4,
              instrucoes: "<p>Os quatro primeiros compassos estão escritos. Continue a 4ª espécie e termine com o 7–6 sobre o mi do cantus (ré5 preso, dó♯5, ré5).</p>",
              texto: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 A4~ A4 C5~ C5 D5~ D5 E5~\ncantus: D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4", duracao: 2,
              solucao: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 A4~ A4 C5~ C5 D5~ D5 E5~ E5 D5~ D5 E5~ E5 F5~ F5 E5~ E5 D5~ D5 C#5 D5/4\ncantus: D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4",
              comentarioSolucao: "Solução encontrada pelo verificador: três retardos 7–6 seguidos nos compassos 8–10, e a cadência." },
            { id: "ret2", titulo: "Embaixo: a cadeia de 2–3", modo: "restrição", ...N4, extras: { ...N4.extras, retardos_minimos: "erro" }, contexto: { minRetardos: 3 },
              instrucoes: "<p>Contraponto <b>embaixo</b>, em síncopes. <b>Restrição:</b> pelo menos três retardos (2–3 é o típico embaixo). Termine com o 2–3 sobre o ré do cantus: dó4 preso, si3, dó4.</p>",
              texto: "compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4\ncontraponto:", duracao: 2,
              solucao: "compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4\ncontraponto: P/2 C4~ C4 B3~ B3 A3~ A3 G3~ G3 F3~ F3 E3~ E3 D3~ D3 C3~ C3 B2 C3/4",
              comentarioSolucao: "A cadeia de 2–3 em estado puro: a linha desce a escala inteira, cada nota presa contra o cantus. Correta e clássica — mas repare como fica previsível: na sua, onde a cadeia para?" },
            { id: "ret3", titulo: "4ª espécie livre, em cima", modo: "livre", ...N4,
              instrucoes: "<p>Contraponto em cima do cantus, em síncopes. Busque pelo menos dois retardos de verdade (7–6 ou 4–3) e um ponto em que a cadeia para.</p>",
              texto: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto:\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4", duracao: 2,
              solucao: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5~ C5 B4~ B4 A4~ A4 G4~ G4 D5~ D5 C5~ C5 B4~ B4 C5~ C5 B4 C5/4\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4" },
            { id: "ret4", titulo: "Retardos sobre um cantus sorteado", modo: "livre", ...N4, sortear: true,
              instrucoes: "<p>Sobre um cantus sorteado. A versão do professor é procurada na hora pelo verificador (pode levar alguns segundos).</p>",
              texto: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto:\ncantus: D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4", duracao: 2 },
          ],
        },
      ],
    },

    // ================================================================== NÍVEL 2
    {
      numero: 2, titulo: "Das vozes à harmonia",
      resumo: "A moldura soprano–baixo como motor da harmonia tonal: regra da oitava, desenho do baixo com inversões, ritmo harmônico e esquemas galantes.",
      temas: [
        {
          id: "oitava", titulo: "A regra da oitava",
          antes: [
            { p: "Baixo subindo em dó: dó–ré–mi. Qual a harmonia do ré, pela regra da oitava?", o: ["V4/3 (6/4/3)", "ii (5/3)", "vii°6", "V (5/3)"], e: "O 2º grau subindo leva 6/4/3: a dominante com a 5ª no baixo (V43), que passa da tônica (I) à tônica com a 3ª no baixo (I6). É a mesma troca de vozes do tema 'O baixo gera a harmonia'." },
            { p: "O 4º grau tem harmonias diferentes subindo e descendo. Quais?", o: ["Subindo 6/5 (ii65); descendo 4/2 (V42)", "Subindo e descendo IV (5/3)", "Subindo V42; descendo ii65", "Subindo IV6; descendo ii6"], e: "Subindo, o fá vai para o sol (5º grau): leva a pré-dominante ii65. Descendo, o fá é a 7ª de V42 e resolve no mi (I6)." },
            { p: "Por que os napolitanos estudavam a regra da oitava em todos os tons antes dos partimenti?", o: ["Para ter na mão (e no ouvido) a harmonia de qualquer baixo em escala, sem calcular", "Porque ela substitui o estudo das cadências", "Porque cada tom tem uma regra da oitava diferente", "Para aprender a evitar acordes invertidos"], e: "A regra é a mesma em todos os tons (em graus); transpor até ela ficar automática é o que libera a atenção para a melodia e para o desenho do baixo — o mesmo princípio das cadências em todos os tons de Nadia Boulanger." },
          ],
          objetivo: "Ter um acorde pronto para cada grau de um baixo em escala, subindo e descendo, em qualquer tom — o vocabulário com que os napolitanos realizavam partimenti.",
          ouvir: ["Fenaroli, Partimenti, livro 1 (Monuments of Partimenti)", "Corelli, Sonatas op. 5: baixos em escala nos movimentos lentos", "Bach, Prelúdio em dó maior BWV 846, c. 1–11"],
          esboco: "Sem consultar a aula: que acorde você poria sobre o 7º grau subindo (si, em dó)? E descendo?",
          secoes: [
            { tipo: "texto", titulo: "Um acorde por grau, segundo a direção", html: `
              <p>A <b>Regra da Oitava</b> (Campion, 1716; Fenaroli) é a harmonização-padrão de um baixo que sobe ou desce a escala. Os graus estáveis, <b>1 e 5</b>, levam 5/3; todos os outros levam acordes de sexta que <b>apontam para o próximo grau estável</b>.</p>
              <table class="tabela-modos"><thead><tr><th>Grau</th><th>Subindo</th><th>Descendo</th></tr></thead><tbody>
              <tr><td>8 / 1</td><td>5/3 · I</td><td>5/3 · I</td></tr>
              <tr><td>7</td><td>6/5 · V65 (vai ao 1)</td><td>6 · V6</td></tr>
              <tr><td>6</td><td>6 · IV6</td><td>♯6/4/3 · V43/V (vai ao 5) — na versão diatônica, IV6</td></tr>
              <tr><td>5</td><td>5/3 · V</td><td>5/3 · V</td></tr>
              <tr><td>4</td><td>6/5 · ii65 (vai ao 5)</td><td>4/2 · V42 (resolve no 3)</td></tr>
              <tr><td>3</td><td>6 · I6</td><td>6 · I6</td></tr>
              <tr><td>2</td><td>6/4/3 · V43</td><td>6/4/3 · V43</td></tr>
              </tbody></table>
              <p>As assimetrias são o ponto: <b>subindo</b>, o 4º grau prepara o 5 (pré-dominante); <b>descendo</b>, ele é a 7ª da dominante e cai no 3. O 6º grau descendo ganha o ♯4 do tom (fá♯ em dó), dominante da dominante, para o 5 chegar como meta.</p>
              <h3>Como usar</h3>
              <ul><li>Em qualquer trecho de baixo por grau, a regra dá a harmonia; nos saltos você escolhe (fundamental na articulação, sexta no meio).</li>
              <li>A melodia escolhe entre as notas do acorde; as sétimas (de V43, ii65, V65, V42, V43/V) resolvem por grau descendente.</li>
              <li>Ela não depende do tom: escrita em graus romanos, é a mesma em dó, em mi♭ ou em lá. Por isso o treino é transpô-la até ficar automática.</li></ul>` },
            { tipo: "exemplo", titulo: "A oitava inteira em dó, subindo e descendo",
              camadas: [
                { titulo: "O baixo e as cifras", partitura: "tom: C maior\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", cifras: [[0, "I"], [1, "V43"], [2, "I6"], [3, "ii65"], [4, "V"], [5, "IV6"], [6, "V65"], [7, "I"], [8, "V6"], [9, "V43/V"], [10, "V"], [11, "V42"], [12, "I6"], [13, "V43"], [14, "I"]],
                  notas: [["decisao", "Subindo: I V43 I6 ii65 V IV6 V65 I. Descendo: V6 V43/V V V42 I6 V43 I."],
                    ["checagem", "O V → IV6 da subida não é retrogressão: o IV6 é de passagem, entre o 5 e o 7 do baixo em escala."]] },
                { titulo: "Uma melodia por cima", partitura: "tom: C maior\nsoprano: E5/1 F5 E5 D5 B4 C5 D5 C5 D5 C5 B4 B4 C5 B4 C5/2\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", rotulos: ["soprano", "baixo"], cifras: [[0, "I"], [1, "V43"], [2, "I6"], [3, "ii65"], [4, "V"], [5, "IV6"], [6, "V65"], [7, "I"], [8, "V6"], [9, "V43/V"], [10, "V"], [11, "V42"], [12, "I6"], [13, "V43"], [14, "I"]],
                  notas: [["decisao", "Começo E5–F5–E5: a 7ª do V43 (F5) resolve em E5 sobre o I6, em movimento contrário ao baixo."],
                    ["decisao", "Na subida, C5–D5–C5 em 10ªs com o baixo (A3–B3–C4): paralelas imperfeitas, permitidas e cantáveis."],
                    ["decisao", "Na descida, C5 é a 7ª de V43/V e desce a B4 sobre o V; o B4 fica como sensível e sobe ao C5 sobre o I6."],
                    ["rejeitada", "Pensei em F5 sobre o V42 (dobrando o baixo): F5–E5 contra F3–E3 seriam 8ªs paralelas. B4 (a sensível) resolve melhor."]],
                  pausa: ["Por que a melodia quase não salta, se o baixo anda o tempo todo?", "Porque, numa escala no baixo, a melodia ganha independência ficando quase parada ou indo em sentido contrário; se ela também corresse, as duas vozes andariam em paralelo. É o mesmo princípio da 1ª espécie: tecido imperfeito, movimento contrário nas chegadas."] },
              ] },
          ],
          exercicios: [
            { id: "ro1", titulo: "Completar a oitava em dó", modo: "completar", perfil: { ...TONAL, notas_do_acorde: "erro", regra_da_oitava: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: {} }, cifrasAluno: true, cifrasIniciais: "I V43 I6 ii65 V IV6 V65 I",
              instrucoes: "<p>O baixo sobe e desce a escala de dó. As cifras da subida estão dadas; escreva as da descida e uma melodia (uma nota por nota do baixo) do começo ao fim.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", duracao: 1, alvoCompassos: 4,
              solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 F5 E5 D5 B4 C5 D5 C5 D5 C5 B4 B4 C5 B4 C5/2\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", solucaoCifras: "I V43 I6 ii65 V IV6 V65 I V6 V43/V V V42 I6 V43 I" },
            { id: "ro2", titulo: "A oitava no tom do dia", modo: "treino", perfil: { ...TONAL, notas_do_acorde: "erro", regra_da_oitava: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: {} }, cifrasAluno: true, tomDoDia: ["G maior", "F maior", "D maior", "Bb maior", "A maior", "Eb maior", "E maior", "Ab maior"],
              instrucoes: "<p>A mesma oitava, num tom diferente a cada dia (ou toque em <b>Outro tom</b>). Escreva todas as cifras e a melodia. O objetivo é ficar automático: tente sem olhar a tabela.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", duracao: 1, alvoCompassos: 4,
              solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 F5 E5 D5 B4 C5 D5 C5 D5 C5 B4 B4 C5 B4 C5/2\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", solucaoCifras: "I V43 I6 ii65 V IV6 V65 I V6 V43/V V V42 I6 V43 I" },
            { id: "ro3", titulo: "Partimento: escalas e saltos", modo: "aplicar", perfil: { ...TONAL, notas_do_acorde: "erro", regra_da_oitava: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 5 } }, cifrasAluno: true,
              instrucoes: "<p>Um baixo à maneira dos partimenti: trechos em escala (use a regra da oitava, inclusive descendo) separados por saltos (escolha livre, fundamental nas articulações). Escreva as cifras e a melodia, com cadência perfeita no fim.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 D3 E3 C3 F3 E3 D3 G3 A3 B3 C4 F3 G3/2 G2 C3/4", duracao: 1, alvoCompassos: 5,
              solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 F5 E5 G5 D5 C5 B4 B4 C5 D5 E5 D5 B4/2 D5 C5/4\nbaixo: C3/1 D3 E3 C3 F3 E3 D3 G3 A3 B3 C4 F3 G3/2 G2 C3/4", solucaoCifras: "I V43 I6 I V42 I6 V43 V IV6 V65 I ii6 V V7 I" },
          ],
        },
        {
          id: "baixo", titulo: "O baixo gera a harmonia",
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "A melodia faz mi–ré–dó (3̂–2̂–1̂) sobre uma tônica prolongada. Que baixo cria movimento contrário e mantém a tônica?", o: ["dó–ré–mi (I – V4/3 – I6)", "dó–sol–dó (I – V – I)", "dó–si–dó (I – V6 – I)", "mi–ré–dó (I6 – ii – I)"], e: "É a troca de vozes: o baixo sobe 1–2–3 enquanto o soprano desce 3–2–1, com o V4/3 de passagem. Dó–si–dó começa em 10ªs paralelas com a melodia; dó–sol–dó salta em todos os tempos; mi–ré–dó anda paralelo ao soprano (8ªs/10ªs) e põe um ii onde a função é de dominante." },
            { p: "O 6/4 cadencial:", o: ["Cai no tempo forte, sobre o 5º grau, e resolve 6–5 e 4–3 sobre o mesmo baixo", "Cai no tempo fraco, logo antes do V", "É um I em 2ª inversão que pode aparecer em qualquer ponto da frase", "Resolve no IV"], e: "É uma dupla apojatura do V: por isso precisa de apoio métrico (tempo mais forte que o V) e do mesmo baixo na resolução. Fora disso, o 6/4 só aparece de passagem ou de bordadura." },
            { p: "Na Regra da Oitava (escala no baixo), que graus recebem acorde de 5/3?", o: ["O 1 e o 5", "O 1, o 4 e o 5", "Todos os graus", "Só o 1"], e: "Só os pontos estáveis (1 e 5) levam 5/3; os outros graus levam 6 (ou 6/5, 4/3, 4/2), o que faz o baixo andar por grau sem perder a tonalidade." },
          ],
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
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "Frase de 8 compassos com cadência perfeita no fim. Como deve ser o ritmo harmônico?", o: ["Lento no começo, acelerando nos compassos antes da cadência", "Rápido no começo e lento no fim", "Constante, um acorde por tempo", "Constante, um acorde por compasso"], e: "A aceleração é o que faz a cadência 'chegar'. Com ritmo uniforme desde o início não sobra espaço para acelerar, e o fim soa como mais um compasso." },
            { p: "Num compasso de 4/4 com 6/4 cadencial e V em mínimas, onde fica cada um?", o: ["6/4 no 1º tempo, V no 3º", "V no 1º tempo, 6/4 no 3º", "Os dois no mesmo tempo", "Tanto faz a ordem"], e: "O 6/4 cadencial é a dissonância (apojatura) e precisa do tempo mais forte; o V é a resolução e vem depois. Invertido, soa como erro métrico." },
            { p: "Que acorde encerra uma semicadência?", o: ["V em estado fundamental, sem 7ª", "V7", "I6", "IV"], e: "A semicadência para no V estável (fundamental, sem 7ª). Com a 7ª o acorde pede resolução imediata e deixa de ser ponto de repouso." },
          ],
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
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "Como é o Prinner?", o: ["Soprano 6–5–4–3 sobre baixo 4–3–2–1, em 10ªs", "Soprano 1–2–3 sobre baixo 1–7–1", "Soprano 3–2–1 sobre baixo 1–5–1", "Soprano 1–7–6–5 sobre baixo 1–7–6–5"], e: "Duas descidas paralelas em 10ªs, do IV ao I. O segundo é o Do-Re-Mi; o terceiro, uma cadência simples; o último daria 8ªs paralelas." },
            { p: "Onde o Prinner costuma aparecer na frase?", o: ["Como resposta, depois de uma abertura (Do-Re-Mi, Romanesca)", "Como abertura da peça", "Só na cadência final", "Depois da barra dupla, para modular"], e: "A gramática galante típica é abertura → Prinner → (continuação) → cadência. Depois da barra dupla aparecem Monte, Fonte e Ponte." },
            { p: "Qual é o baixo da Romanesca 'saltada'?", o: ["1–5–6–3 (fundamentais, por saltos de 4ª e 5ª)", "1–7–6–5 (por graus)", "4–3–2–1", "1–2–7–1"], e: "A Romanesca tem duas formas de baixo: por graus (1–7–6–3, com 6/3) ou saltada (1–5–6–3, como no Cânone de Pachelbel). 4–3–2–1 é o baixo do Prinner; 1–2–7–1, o do Meyer." },
          ],
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
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "Qual nota da melodia tende a ser estrutural?", o: ["A consonante com o baixo, forte ou longa, que se liga por grau à próxima estrutural", "A mais aguda de cada compasso", "A primeira de cada compasso, sempre", "A de menor duração"], e: "Estrutura é consonância + peso métrico ou duração + condução por grau. A primeira do compasso pode ser uma apojatura (ornamento): nesse caso a estrutural é a sua resolução." },
            { p: "Qual a ordem de trabalho para compor a melodia em dois níveis?", o: ["Esqueleto (uma nota por harmonia) → conferir como 1ª espécie contra o baixo → diminuir → reduzir de novo", "Superfície primeiro, depois procurar o esqueleto", "Escolher a figura rítmica, depois as harmonias", "Diminuir compasso a compasso, decidindo na hora"], e: "Compor é o caminho inverso da análise: primeiro a linha estrutural, conferida contra o baixo; a diminuição vem depois e é conferida reduzindo de novo." },
            { p: "O que dá unidade à superfície?", o: ["Uma figura rítmico-melódica consistente, transportada com a harmonia", "Uma figura nova a cada compasso, para variar", "Só semínimas", "Ritmos diferentes em cada voz"], e: "A variedade vem do esqueleto (que sobe e desce); a superfície repete um gesto reconhecível. Só assim a liquidação perto da cadência é percebida." },
          ],
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
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "O que forma a apresentação de uma sentença?", o: ["Ideia básica de 2 compassos + repetição (exata ou tônica–dominante), prolongando o I", "Ideia básica + ideia contrastante terminando em semicadência", "Quatro compassos de sequência", "Ideia básica + cadência perfeita"], e: "A apresentação expõe e repete a ideia sobre a tônica. Ideia básica + contrastante com cadência fraca é o antecedente de um período." },
            { p: "O que é fragmentação?", o: ["Reduzir o tamanho das unidades (de 2 compassos para 1 ou menos)", "Retirar os traços característicos do motivo", "Repetir a ideia em outra tonalidade", "Dividir a melodia entre as vozes"], e: "Fragmentação é tamanho; liquidação é conteúdo. As duas costumam vir juntas na continuação, com aceleração harmônica." },
            { p: "O que é liquidação?", o: ["Eliminar aos poucos os traços do motivo até restar a fórmula cadencial", "Encurtar as unidades", "Acelerar o ritmo harmônico", "Repetir a cadência"], e: "A liquidação tira do motivo o que o torna reconhecível (ritmo característico, intervalos), e o que sobra é material cadencial convencional." },
          ],
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
          // perguntas antes dos exercícios (a primeira opção é a certa; a ordem é embaralhada na página)
          antes: [
            { p: "Em que cadência termina o antecedente?", o: ["Numa cadência fraca (semicadência ou autêntica imperfeita)", "Numa cadência autêntica perfeita", "Sempre numa cadência de engano", "Sem cadência"], e: "O antecedente faz a pergunta: termina aberto. Com cadência perfeita já no c. 4, o consequente não tem o que responder." },
            { p: "O que faz o consequente?", o: ["Retoma a ideia básica e refaz a contrastante para chegar à cadência perfeita", "Começa com material novo", "Repete o antecedente inteiro, idêntico", "Termina em semicadência"], e: "A volta da ideia básica cria a simetria; a mudança está no fim, que agora fecha. Terminar de novo em semicadência faz um período de duas perguntas." },
            { p: "Para Caplin, em que diferem a ideia básica e a contrastante?", o: ["Na função harmônica: a básica prolonga a tônica, a contrastante leva à cadência", "No registro", "Só no ritmo", "No modo (maior ou menor)"], e: "O contraste de superfície (ritmo, contorno) ajuda, mas a diferença que define as duas ideias é harmônica." },
          ],
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

  // nível 4: preenchido pelos módulos de web/livro
  niveis.push({ numero: 4, titulo: "Cromatismo e modulação", resumo: "Dominantes secundárias, empréstimo modal, napolitana, sextas aumentadas e os três tipos de modulação — primeiro como os tratados ensinam, depois como os compositores quebraram.", temas: [] });

  // capítulos em módulos separados (web/livro/*.js) entram com TEMAS.inserir
  function inserir(numero, tema, { antesDe, depoisDe } = {}) {
    let n = niveis.find((x) => x.numero === numero);
    if (!n) throw new Error("nível inexistente: " + numero);
    const lista = n.temas;
    if (lista.some((t) => t.id === tema.id)) throw new Error("tema repetido: " + tema.id);
    let k = lista.length;
    if (antesDe) { const i = lista.findIndex((t) => t.id === antesDe); if (i >= 0) k = i; }
    if (depoisDe) { const i = lista.findIndex((t) => t.id === depoisDe); if (i >= 0) k = i + 1; }
    lista.splice(k, 0, tema);
  }
  function novoNivel(nivel) {
    if (niveis.some((x) => x.numero === nivel.numero)) return;
    niveis.push({ temas: [], ...nivel });
    niveis.sort((a, b) => a.numero - b.numero);
  }
  const perfis = { N1, N2, N3, N4, TONAL, MELODIA, CANTUS, PLANO_CP, PLANO_BAIXO, PLANO_FRASE, FUX, CF1, CF2 };

  raiz.TEMAS = { niveis, inserir, novoNivel, perfis };
})(this);
