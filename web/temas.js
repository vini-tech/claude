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
          objetivo: "Notas, cor característica e cadência de cada modo.",
          ouvir: ["Gregoriano: Veni Creator (mixolídio), Dies irae (dórico)", "Palestrina, Missa Papae Marcelli", "Scarborough Fair (dórico)"],
          esboco: "Sem consultar nada: quais notas você usaria em ré dórico, e onde acha que fica o semitom que leva à final?",
          secoes: [
            { tipo: "texto", titulo: "O modo é a posição dos semitons", html: `
              <p>Modo = escala diatônica vista a partir da <b>final</b>. O que o define é a sequência de T e S, não as notas: dó dórico = C D E♭ F G A B♭.</p>
              <table class="tabela-modos"><thead><tr><th>Modo</th><th>Teclas brancas</th><th>T e S</th><th>Maior da final com</th><th>Cor</th><th>Cadência</th></tr></thead><tbody>
              <tr><td><b>Dórico</b></td><td>D E F G A B C</td><td>T S T T T S T</td><td>3ª e 7ª ♭</td><td>menor com <b>6ª maior</b></td><td>7º elevado (C♯)</td></tr>
              <tr><td><b>Frígio</b></td><td>E F G A B C D</td><td>S T T T S T T</td><td>2ª, 3ª, 6ª e 7ª ♭</td><td>menor com <b>2ª menor</b></td><td>sem sensível: F → E desce</td></tr>
              <tr><td><b>Lídio</b></td><td>F G A B C D E</td><td>T T T S T T S</td><td>4ª ♯</td><td>maior com <b>4ª aumentada</b></td><td>já tem semitom E → F</td></tr>
              <tr><td><b>Mixolídio</b></td><td>G A B C D E F</td><td>T T S T T S T</td><td>7ª ♭</td><td>maior com <b>7ª menor</b></td><td>7º elevado (F♯)</td></tr>
              <tr><td><b>Eólio</b></td><td>A B C D E F G</td><td>T S T T S T T</td><td>3ª, 6ª e 7ª ♭</td><td>menor natural (<b>6ª e 7ª menores</b>)</td><td>7º elevado (G♯) e, subindo, 6º (F♯)</td></tr>
              <tr><td><b>Jônio</b></td><td>C D E F G A B</td><td>T T S T T T S</td><td>—</td><td>o maior</td><td>já tem sensível</td></tr>
              </tbody></table>
              <h3>Cadência e <i>musica ficta</i></h3>
              <ul><li>Cadência por semitom para a final, em movimento contrário.</li>
              <li>Dórico, mixolídio, eólio: <b>sensível elevada só na cadência</b>; no eólio, subindo 6–7–1, sobe também o 6º (F♯–G♯–A).</li>
              <li>Frígio: a voz com o 2º grau desce (F → E); a outra chega por tom (D → E).</li></ul>
              <p>A regra <b>Notas do modo</b> marca notas de fora e a sensível alterada fora dos dois últimos compassos.</p>` },
            { tipo: "exemplo", titulo: "Quatro modos sobre a mesma final", intro: "Escalas sobre ré; ★ = nota característica.",
              camadas: [
                { titulo: "Ré dórico", partitura: "tom: D dorico\nescala: D4/1 E4 F4 G4 A4 B4 C5 D5/4", anotacoes: [[0, 0, "1"], [0, 1, "2"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6 ★"], [0, 6, "7"], [0, 7, "8"]],
                  notas: [["decisao", "3ª e 7ª menores, mas 6ª maior (B): menos sombrio que o eólio."]] },
                { titulo: "Ré eólio", partitura: "tom: D eolio\nescala: D4/1 E4 F4 G4 A4 Bb4 C5 D5/4", anotacoes: [[0, 0, "1"], [0, 1, "2"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6 ★"], [0, 6, "7"], [0, 7, "8"]],
                  notas: [["checagem", "Só o 6º grau muda: B♭."]] },
                { titulo: "Ré frígio", partitura: "tom: D frigio\nescala: D4/1 Eb4 F4 G4 A4 Bb4 C5 D5/4", anotacoes: [[0, 0, "1"], [0, 1, "2 ★"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6"], [0, 6, "7"], [0, 7, "8"]],
                  notas: [["decisao", "2ª menor (E♭): a cadência desce E♭ → D."]] },
                { titulo: "Ré mixolídio", partitura: "tom: D mixolidio\nescala: D4/1 E4 F#4 G4 A4 B4 C5 D5/4", anotacoes: [[0, 0, "1"], [0, 1, "2"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6"], [0, 6, "7 ★"], [0, 7, "8"]],
                  notas: [["decisao", "7ª menor (C) no meio; C♯ só na cadência."]] },
              ] },
            { tipo: "contraste", titulo: "Dórico × eólio na mesma melodia",
              a: { rotulo: "A — ré dórico (si natural)", partitura: "tom: D dorico\ncantus: D4/4 F4 G4 A4 B4 A4 G4 F4 E4 D4" },
              b: { rotulo: "B — ré eólio (si bemol)", partitura: "tom: D eolio\ncantus: D4/4 F4 G4 A4 Bb4 A4 G4 F4 E4 D4" },
              pergunta: "Só uma nota muda. O que muda no caráter, e onde?",
              comentario: "<p>O 6º grau é o clímax. A: si natural (6ª M) abre o arco, luminoso. B: si♭, semitom acima do lá, pesa e cai; mais sombrio.</p>" },
          ],
          exercicios: [
            { id: "mod1", titulo: "Cantus firmus em ré dórico", modo: "completar", perfil: CANTUS, nivel: 1, fimLivre: true,
              instrucoes: "<p>Complete o cantus em ré dórico (8–14 semibreves), terminando em ré por grau. Use o si natural ao menos uma vez.</p>",
              texto: "tom: D dorico\ncantus: D4/4 F4 E4", duracao: 4,
              solucao: "tom: D dorico\ncantus: D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4", comentarioSolucao: "Cantus dórico de Fux (1725)." },
            { id: "mod2", titulo: "Cantus firmus em mi frígio", modo: "restrição", perfil: CANTUS, nivel: 1, fimLivre: true,
              instrucoes: "<p>Cantus em mi frígio. <b>Restrição:</b> termine fá → mi e use o fá também no meio.</p>",
              texto: "tom: E frigio\ncantus:", duracao: 4,
              solucao: "tom: E frigio\ncantus: E4/4 C4 D4 C4 A3 A4 G4 E4 F4 E4", comentarioSolucao: "Cantus frígio de Fux: 8ª A3–A4 recuperada por grau; fá só na cadência." },
            { id: "mod3", titulo: "Cantus firmus em sol mixolídio", modo: "livre", perfil: CANTUS, nivel: 1, fimLivre: true,
              instrucoes: "<p>Cantus em sol mixolídio: fá natural no meio; chegada à final por grau.</p>",
              texto: "tom: G mixolidio\ncantus:", duracao: 4,
              solucao: "tom: G mixolidio\ncantus: G4/4 A4 C5 B4 D5 C5 A4 B4 A4 G4" },
            { id: "mod4", titulo: "1ª espécie em lá eólio", modo: "aplicar", ...N1,
              instrucoes: "<p>1ª espécie em cima do cantus eólio de Fux. Só notas do modo; sol♯ só na cadência (6ª M → 8ª).</p>",
              texto: "tom: A eolio\ncf: cantus\ncontraponto:\ncantus: A3/4 C4 B3 D4 C4 E4 F4 E4 D4 C4 B3 A3", duracao: 4, plano: PLANO_CP,
              solucao: "tom: A eolio\ncf: cantus\ncontraponto: E4/4 A4 D5 A4 C5 G4 A4 E5 B4 A4 G#4 A4\ncantus: A3/4 C4 B3 D4 C4 E4 F4 E4 D4 C4 B3 A3",
              comentarioSolucao: "Sol♯ só na penúltima nota; no c. 6, sol natural (7ª menor do modo)." },
          ],
        },
        {
          id: "arquitetura", titulo: "Arquitetura da linha",
          objetivo: "1ª espécie de trás para frente: cadência, clímax, contorno, preenchimento.",
          ouvir: ["Palestrina, Missa Papae Marcelli, Kyrie", "Fux, Gradus ad Parnassum (1725), 1ª espécie", "Bach, corais: soprano–baixo, uma nota por tempo"],
          esboco: "Sobre o cantus firmus C4 D4 F4 E4 G4 A4 F4 E4 D4 C4, qual seria a sua primeira decisão? Escreva as duas últimas notas do contraponto e onde ficaria o clímax.",
          secoes: [
            { tipo: "texto", titulo: "Compor de trás para frente", html: `
              <p>Nota a nota, da esquerda para a direita, a linha chega à cadência sem saída. Decida nesta ordem:</p>
              <ol><li><b>Cadência:</b> 6ª M → 8ª em cima (7–1 contra 2–1); 3ª m → uníssono (ou 10ª → 8ª) embaixo.</li>
              <li><b>Clímax:</b> único, entre ½ e ⅔ da linha, fora do clímax do cantus.</li>
              <li><b>Início:</b> 8ª, 5ª ou uníssono, com espaço para subir até o clímax.</li>
              <li><b>Contorno:</b> o caminho grosso (ex.: desce, sobe em duas ondas, desce por grau).</li>
              <li><b>Preenchimento:</b> a consonância que melhor serve ao contorno.</li></ol>` },
            { tipo: "texto", titulo: "Textura: tecido e articulação", html: `
              <ul><li><b>3ªs e 6ªs</b> = tecido; <b>5ªs e 8ªs</b> = articulação (no meio, soam como chegada).</li>
              <li>Movimento: contrário > oblíquo > direto > paralelo. 3ªs paralelas longas = voz dobrada.</li>
              <li>Notas-pivô (a mesma altura voltando) estagnam a linha.</li>
              <li>Salto grande: compense em sentido contrário; dois na mesma direção só em tríade.</li></ul>` },
            { tipo: "exemplo", titulo: "Um contraponto decidido em camadas", intro: "Cantus firmus em dó maior; o contraponto fica em cima.",
              camadas: [
                { titulo: "Cadência primeiro", parcial: true, partitura: `tom: C maior\ncf: cantus\ncontraponto: P/32 B4/4 C5\ncantus: ${CF1}`, anotacoes: [[0, 0, "6ª M"], [0, 1, "8ª"]],
                  notas: [["decisao", "B4 → C5 sobre D4 → C4: 6ª M → 8ª, convergindo por grau."],
                    ["checagem", "Não antecipar a sensível (evitar B4 logo antes)."]] },
                { titulo: "Clímax e início", partitura: `tom: C maior\ncf: cantus\ncontraponto: C5/4 P/12 E5/4 P/12 B4/4 C5\ncantus: ${CF1}`, anotacoes: [[0, 0, "8ª"], [0, 1, "clímax"]],
                  notas: [["decisao", "Clímax E5 no c. 5; o do cantus (A4) é no c. 6."],
                    ["rejeitada", "Clímax no c. 6 coincidiria com o do cantus."],
                    ["decisao", "Início C5 (8ª): espaço para descer antes de subir."]],
                  pausa: ["Por que não começar em G4 e subir direto ao E5?", "Um só gesto ascendente: o E5 viraria fim de escala. Descer antes cria a onda que dá peso ao clímax."] },
                { titulo: "Preenchimento", partitura: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5\ncantus: ${CF1}`,
                  anotacoes: [[0, 0, "8"], [0, 1, "6"], [0, 2, "3"], [0, 3, "6"], [0, 4, "6"], [0, 5, "3"], [0, 6, "6"], [0, 7, "6"], [0, 8, "6"], [0, 9, "8"]],
                  notas: [["decisao", "C5–B4–A4 contra o cantus; A4–C5–E5: duas 3ªs na tríade de lá m."],
                    ["checagem", "Meio só com 3ªs e 6ªs; perfeitas nas pontas."],
                    ["checagem", "Três 6ªs seguidas (c. 7–9): o limite."]] },
              ] },
            { tipo: "contraste", titulo: "Muitas perfeitas × tecido imperfeito", intro: "Mesmo cantus, duas soluções sem erro de regra.",
              a: { rotulo: "A — 5ªs e 8ªs no meio", partitura: `tom: C maior\ncf: cantus\ncontraponto: C5/4 A4 D5 E5 D5 C5 A4 B4 B4 C5\ncantus: ${CF1}` },
              b: { rotulo: "B — 3ªs e 6ªs no meio", partitura: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5\ncantus: ${CF1}` },
              pergunta: "Onde cada uma parece parar? Qual tem mais direção até a cadência?",
              comentario: "<p>A: as perfeitas dos c. 2, 4, 5 e 8 soam como chegadas; a 8ª final perde peso. B: 3ªs e 6ªs mantêm o fluxo, e a 8ª final é a primeira perfeita desde o início: conclui.</p>" },
          ],
          exercicios: [
            { id: "arq1", titulo: "Completar: clímax e cadência", modo: "completar", ...N1,
              instrucoes: "<p>Complete o contraponto: decida clímax, cadência e o caminho entre eles.</p>",
              texto: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5\ncantus: ${CF1}`, duracao: 4, plano: PLANO_CP,
              solucao: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5\ncantus: ${CF1}` },
            { id: "arq2", titulo: "Clímax no compasso 5", modo: "restrição", ...N1, extras: { ...N1.extras, climax_no_lugar: "erro" }, contexto: { climax: { compasso: 5 } },
              instrucoes: "<p>Contraponto em cima do cantus de Fux. <b>Restrição:</b> clímax único no c. 5.</p>",
              texto: `tom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 4, plano: PLANO_CP,
              solucao: `tom: D dorico\ncf: cantus\ncontraponto: D4/4 A4 G4 B4 E5 D5 C5 D5 A4 C#5 D5\ncantus: ${FUX}`,
              comentarioSolucao: "Compare o caminho até o E5 com o seu." },
            { id: "arq3", titulo: "Embaixo, com no máximo uma perfeita", modo: "restrição", ...N1, extras: { ...N1.extras, perfeitas_no_meio: "erro" }, contexto: { maxPerfeitas: 1 },
              instrucoes: "<p>Contraponto <b>embaixo</b>. <b>Restrição:</b> no máximo uma 5ª ou 8ª no meio. Início em 8ª ou uníssono; fim 3ª m → uníssono (ou 10ª → 8ª).</p>",
              texto: `tom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto:`, duracao: 4, plano: PLANO_CP,
              solucao: `tom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto: C3/4 B2 D3 G3 F3 E3 F3 C4 B3 C4` },
            { id: "arq4", titulo: "Livre, sobre um cantus sorteado", modo: "livre", ...N1, sortear: true,
              instrucoes: "<p>Contraponto em cima de um cantus sorteado. Planeje, escreva, ouça.</p>",
              texto: `tom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 4, plano: PLANO_CP },
            { id: "arq5", titulo: "Variante: seu cantus, seu contraponto", modo: "variante", ...N1, fimLivre: true,
              instrucoes: "<p>Escreva um cantus (baixo, 8–14 semibreves, da final à final) e uma 1ª espécie em cima.</p>",
              texto: "tom: C maior\ncontraponto:\ncantus:", duracao: 4, plano: [["Ideia", "Que tipo de cantus você quer testar (mais saltos? âmbito maior? outro modo)?"], ...PLANO_CP] },
          ],
        },
        {
          id: "elaborar", titulo: "Elaborar um esqueleto: a 2ª espécie",
          objetivo: "2ª espécie como diminuição de uma 1ª: cada nota fraca tem razão.",
          ouvir: ["Bach, Invenção nº 1: c. 1–2 a uma nota por tempo", "Bach, corais: colcheias de passagem no baixo"],
          esboco: "O esqueleto G4 → C5 (sobre C4 → E4) está a uma 4ª. Que nota você poria no tempo fraco entre eles, e por quê?",
          secoes: [
            { tipo: "texto", titulo: "Espécies como níveis de elaboração", html: `
              <p>Espécies são <b>níveis de elaboração</b> (Salzer & Schachter): os fortes formam uma 1ª espécie válida; os fracos são <b>diminuições</b>.</p>
              <table class="tabela-modos"><thead><tr><th>Esqueleto</th><th>Diminuição</th></tr></thead><tbody>
              <tr><td>3ª</td><td>passagem (consonante ou dissonante)</td></tr>
              <tr><td>grau</td><td>salto consonante ou bordadura consonante</td></tr>
              <tr><td>4ª ou 5ª</td><td>substituição (salto e volta por grau) ou troca de registro</td></tr>
              <tr><td>nota repetida</td><td>bordadura ou arpejo (repetir é proibido)</td></tr>
              </tbody></table>
              <p>Confira paralelas <b>do fraco ao forte seguinte</b> e 5ªs/8ªs em fortes seguidos.</p>` },
            { tipo: "exemplo", titulo: "Do esqueleto à superfície", intro: "Cantus firmus curto em dó maior.",
              camadas: [
                { titulo: "Esqueleto de 1ª espécie", especie: 1, partitura: "tom: C maior\ncf: cantus\ncontraponto: G4/4 C5 A4 B4 C5\ncantus: C4/4 E4 F4 D4 C4",
                  anotacoes: [[0, 0, "5"], [0, 1, "6"], [0, 2, "3"], [0, 3, "6"], [0, 4, "8"]],
                  notas: [["decisao", "5–6–3–6–8, sem perfeitas no meio. Os intervalos (4ª, 3ª, grau, grau) decidem as diminuições."]] },
                { titulo: "Diminuições", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: G4/2 A4 C5 B4 A4 C5 B4/4 C5\ncantus: C4/4 E4 F4 D4 C4",
                  anotacoes: [[0, 1, "6"], [0, 3, "5 pass."], [0, 5, "5 salto"], [0, 6, "6"]],
                  notas: [["decisao", "4ª G4–C5: A4 (6ª) divide em grau + 3ª. 3ª C5–A4: B4 de passagem."],
                    ["decisao", "Grau A4–B4: salto consonante A4–C5 e volta, contornando o alvo."],
                    ["rejeitada", "G4 no c. 3: 2ª contra F4, bordadura dissonante (só na 3ª espécie)."]],
                  pausa: ["Por que a semibreve no c. 4?", "Licença cadencial: mantém a sensível (6ª M → 8ª) no forte sem enfeite só para cumprir o ritmo."] },
              ] },
            { tipo: "contraste", titulo: "Diminuição com razão × diminuição mecânica",
              a: { rotulo: "A — notas fracas que fogem", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: G4/2 A4 C5 E5 A4 D5 B4/4 C5\ncantus: C4/4 E4 F4 D4 C4" },
              b: { rotulo: "B — notas fracas que conduzem", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: G4/2 A4 C5 B4 A4 C5 B4/4 C5\ncantus: C4/4 E4 F4 D4 C4" },
              pergunta: "Mesmo esqueleto, ambas corretas; mudam os c. 2–3. O que A perde?",
              comentario: "<p>A: fracas saltam para longe (E5, D5); o esqueleto some no zigue-zague e o E5 vira clímax acidental. B: cada fraca aponta para o forte seguinte.</p>" },
          ],
          exercicios: [
            { id: "ela1", titulo: "Elaborar o esqueleto de Fux", modo: "completar", ...N2, extras: { ...N2.extras, esqueleto_preservado: "erro" },
              contexto: { esqueleto: [[0, "A4"], [4, "A4"], [8, "G4"], [12, "A4"], [16, "B4"], [20, "C5"], [24, "C5"], [28, "B4"], [32, "D5"], [36, "C#5"], [40, "D5"]] },
              instrucoes: "<p>Esqueleto: a 1ª espécie de Fux (A4 A4 G4 A4 B4 C5 C5 B4 D5 C#5 D5) nos tempos fortes. Penúltimo compasso pode ser semibreve.</p>",
              texto: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 2, plano: [["Diminuições", "Para cada par do esqueleto, qual diminuição (passagem, salto, bordadura consonante)?"], ["Pontos difíceis", "Onde as notas repetidas do esqueleto pedem outra solução?"]],
              solucao: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: A4/2 B4 A4 C5 G4 E4 A4 D5 B4 G4 C5 A4 C5 E5 B4 G5 D5 A4 C#5/4 D5\ncantus: ${FUX}`,
              comentarioSolucao: "C. 5: entre si e dó (sobre sol → fá) toda nota fraca gera paralela, direta ou uníssono; o uníssono é o menor mal." },
            { id: "ela2", titulo: "2ª espécie livre, em cima", modo: "livre", ...N2, sortear: true,
              instrucoes: "<p>Esqueleto de 1ª espécie primeiro, depois diminua. Pode começar com pausa de mínima.</p>",
              texto: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 2, plano: [["Esqueleto", "Escreva aqui a 1ª espécie que você vai elaborar."], ...PLANO_CP] },
            { id: "ela3", titulo: "Embaixo, com três dissonâncias de passagem", modo: "restrição", ...N2, extras: { ...N2.extras, dissonancias_minimas: "erro" }, contexto: { minDissonancias: 3 },
              instrucoes: "<p>Contraponto embaixo. <b>Restrição:</b> ao menos três dissonâncias de passagem.</p>",
              texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto:`, duracao: 2, plano: PLANO_CP,
              solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto: P/2 C3 F3 D3 A3 D3 E3 F3 G3 A3 B3 E3 A3 B3 C4 A3 D4 B3 C4/4` },
            { id: "ela4", titulo: "2ª espécie livre, embaixo", modo: "livre", ...N2, sortear: true,
              instrucoes: "<p>Embaixo de um cantus sorteado. Cadência: 5ª → 3ª m → uníssono (ou 8ª).</p>",
              texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto:`, duracao: 2, plano: PLANO_CP },
          ],
        },
        {
          id: "continua", titulo: "Linha contínua: a 3ª espécie",
          objetivo: "Quatro notas por tempo sem perder o esqueleto: células de uma nota estrutural à próxima.",
          ouvir: ["Bach, Invenções nº 4 e nº 8", "Mozart, sonatas: soprano ornamentado sobre 10ªs"],
          esboco: "Entre C5 (sobre D4) e A4 (sobre F4, no compasso seguinte), escreva quatro semínimas que saiam do C5 e cheguem ao A4.",
          secoes: [
            { tipo: "texto", titulo: "Células, não escalas", html: `
              <p><b>Células de quatro semínimas</b> de uma nota do esqueleto à próxima, não escalas sem destino.</p>
              <ul><li>Tempo 1 consonante; 2–4: passagem, bordadura, <b>bordadura dupla</b> (C–D–B–C) ou <b>cambiata</b> (desce à dissonância, salta 3ª abaixo, sobe por grau).</li>
              <li>5ª/8ª nos tempos 3–4 e outra no forte seguinte = paralelas.</li>
              <li>Saltos <b>dentro</b> do compasso, não através da barra.</li>
              <li>Cadência com cambiata: E5–D5–B4–C#5 | D5 sobre E4 → D4.</li></ul>` },
            { tipo: "exemplo", titulo: "Esqueleto e células", intro: "O esqueleto do tema anterior em 3ª espécie.",
              camadas: [
                { titulo: "Esqueleto", especie: 1, partitura: "tom: C maior\ncf: cantus\ncontraponto: G4/4 C5 A4 B4 C5\ncantus: C4/4 E4 F4 D4 C4" },
                { titulo: "Células", partitura: "tom: C maior\ncf: cantus\ncontraponto: G4/1 E4 F4 G4 C5 B4 A4 G4 A4 G4 A4 C5 B4 C5 A4 B4 C5/4\ncantus: C4/4 E4 F4 D4 C4",
                  anotacoes: [[0, 2, "4ª pass."], [0, 6, "4ª pass."], [0, 9, "2ª bord."], [0, 13, "7ª camb."]],
                  notas: [["decisao", "C. 1: G4–E4–F4–G4 volta ao ponto de partida e prepara o salto ao C5."],
                    ["checagem", "C. 3: G4 = bordadura inferior dissonante (2ª sobre F4)."],
                    ["decisao", "C. 4: cambiata B4–C5–A4–B4."]],
                  pausa: ["Por que não B4–D5–C5–B4 no c. 4?", "D5/D4 (8ª) e C5/C4 (8ª) separadas só por passagem: 8ªs paralelas. A cambiata evita."] },
              ] },
          ],
          exercicios: [
            { id: "cont1", titulo: "Elaborar em 3ª espécie", modo: "completar", ...N3, extras: { ...N3.extras, esqueleto_preservado: "erro" },
              contexto: { esqueleto: [[0, "C5"], [4, "B4"], [8, "A4"], [12, "C5"], [16, "E5"], [20, "C5"], [24, "D5"], [28, "C5"], [32, "B4"], [36, "C5"]] },
              instrucoes: "<p>Esqueleto: o contraponto de 'Arquitetura da linha', nos tempos fortes. Quatro semínimas por compasso.</p>",
              texto: `tom: C maior\ncf: cantus\ncontraponto:\ncantus: ${CF1}`, duracao: 1, plano: [["Células", "Para cada compasso, de onde a célula sai e onde chega?"]],
              solucao: `tom: C maior\ncf: cantus\ncontraponto: C5/1 B4 C5 D5 B4 C5 A4 B4 A4 G4 B4 A4 C5 B4 C5 D5 E5 B4 D5 B4 C5 A4 C5 B4 D5 C5 F5 E5 C5 D5 C5 E5 B4 C5 A4 B4 C5/4\ncantus: ${CF1}` },
            { id: "cont2", titulo: "Cambiata e bordadura dupla", modo: "restrição", ...N3, extras: { ...N3.extras, figuras_obrigatorias: "erro" }, contexto: { figuras: ["cambiata", "bordadura_dupla"] },
              instrucoes: "<p>3ª espécie em cima do cantus de Fux. <b>Restrição:</b> ao menos uma cambiata e uma bordadura dupla.</p>",
              texto: `tom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 1, plano: [["Onde", "Em que compassos entram a cambiata e a bordadura dupla, e por quê ali?"]],
              solucao: `tom: D dorico\ncf: cantus\ncontraponto: A4/1 F4 A4 G4 A4 B4 G4 A4 B4 E4 F4 G4 B4 A4 F4 A4 E5 D5 B4 D5 F5 E5 G5 F5 E5 F5 E5 D5 B4 C5 A4 B4 D5 E5 C5 D5 E5 D5 B4 C#5 D5/4\ncantus: ${FUX}`,
              comentarioSolucao: "Figuras nos c. 2 e 10. Correta, não necessariamente bonita." },
            { id: "cont3", titulo: "3ª espécie livre, em cima", modo: "livre", ...N3, sortear: true,
              instrucoes: "<p>Cantus sorteado. Esqueleto no plano antes.</p>",
              texto: `tom: D dorico\ncf: cantus\ncontraponto:\ncantus: ${FUX}`, duracao: 1, plano: [["Esqueleto", "A 1ª espécie por trás das suas semínimas."], ...PLANO_CP] },
            { id: "cont4", titulo: "3ª espécie livre, embaixo", modo: "livre", ...N3, sortear: true,
              instrucoes: "<p>Embaixo de um cantus sorteado. Cadência: 7–5–6–7 | 1 (ré: C#4 A3 B3 C#4 | D4).</p>",
              texto: `tom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto:`, duracao: 1, plano: PLANO_CP },
          ],
        },
        {
          id: "retardos", titulo: "Retardos: a 4ª espécie",
          objetivo: "Tensão no tempo forte pela síncope: preparar, prender, resolver; encadear retardos com direção.",
          ouvir: ["Corelli, Sonatas op. 1–5: cadeias de 7–6", "Palestrina, Missa Papae Marcelli, Agnus Dei", "Bach, Paixão seg. S. Mateus, 'Erbarme dich'"],
          esboco: "Sobre ré4 → mi4 no cantus, um contraponto em cima que termine em ré5: como você criaria uma dissonância no tempo forte do penúltimo compasso sem atacá-la?",
          secoes: [
            { tipo: "texto", titulo: "A dissonância que não é atacada", html: `
              <p>Mínimas deslocadas: cada nota entra no fraco e é <b>ligada</b> ao forte. Se o cantus muda por baixo, a nota presa vira <b>retardo</b>.</p>
              <table class="tabela-modos"><thead><tr><th>Tempo</th><th>Fase</th><th>Intervalo</th></tr></thead><tbody>
              <tr><td>fraco</td><td>preparação</td><td>consonância</td></tr>
              <tr><td>forte</td><td>retardo (nota presa)</td><td>7ª, 4ª, 2ª ou 9ª</td></tr>
              <tr><td>fraco</td><td>resolução, um grau abaixo</td><td>imperfeita</td></tr>
              </tbody></table>
              <ul><li>Em cima: <b>7–6</b>, <b>4–3</b>. Embaixo: <b>2–3</b>.</li>
              <li>Sem dissonância, síncope consonante (5–6, 6–5…) liga. Ligadura impossível: <b>quebre a espécie</b> por um compasso.</li>
              <li>Cadeia longa = escala disfarçada: precisa de destino.</li>
              <li>9–8 e 2–1 em cadeia = 8ªs paralelas atrasadas.</li>
              <li>Resolução sempre para baixo.</li></ul>` },
            { tipo: "exemplo", titulo: "Uma cadeia de retardos com destino", intro: "Em cima do cantus de 'Arquitetura da linha'.",
              camadas: [
                { titulo: "Síncopes e retardos", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5~ C5 B4~ B4 A4~ A4 G4~ G4 D5~ D5 C5~ C5 B4~ B4 C5~ C5 B4 C5/4\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4",
                  notas: [["decisao", "C. 2–4: três retardos descendo (dó5/ré4 7–6, si4/fá4, lá4/mi4)."],
                    ["decisao", "C. 5: uníssono preso, a cadeia para; salto sol4 → ré5. C. 6: 4–3 no clímax."],
                    ["checagem", "C. 9: 7–6 cadencial, dó5 preso sobre ré4."]],
                  pausa: ["Por que o salto no c. 5?", "Três retardos já gastaram uma 4ª de registro. O salto abre um segundo arco até a cadência."] },
              ] },
            { tipo: "contraste", titulo: "Síncope consonante × síncope com retardos",
              a: { rotulo: "A — quase só síncopes consonantes", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 G4~ G4 F4~ F4 C5~ C5 B4~ B4 E5~ E5 A4~ A4 B4~ B4 C5~ C5 B4 C5/4\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4" },
              b: { rotulo: "B — retardos encadeados", partitura: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5~ C5 B4~ B4 A4~ A4 G4~ G4 D5~ D5 C5~ C5 B4~ B4 C5~ C5 B4 C5/4\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4" },
              pergunta: "Ambas ligam todos os compassos. Onde cada uma cria e resolve tensão?",
              comentario: "<p>A: síncope só rítmica; tensão real só na cadência. B: ciclos tensão → resolução no início, alívio no meio, 7–6 na cadência.</p>" },
          ],
          exercicios: [
            { id: "ret1", titulo: "Completar: retardos sobre o cantus de Fux", modo: "completar", ...N4,
              instrucoes: "<p>Continue a 4ª espécie; termine com 7–6 sobre o mi do cantus (ré5 preso, dó♯5, ré5).</p>",
              texto: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 A4~ A4 C5~ C5 D5~ D5 E5~\ncantus: D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4", duracao: 2,
              solucao: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 A4~ A4 C5~ C5 D5~ D5 E5~ E5 D5~ D5 E5~ E5 F5~ F5 E5~ E5 D5~ D5 C#5 D5/4\ncantus: D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4",
              comentarioSolucao: "Três 7–6 seguidos nos c. 8–10, e a cadência." },
            { id: "ret2", titulo: "Embaixo: a cadeia de 2–3", modo: "restrição", ...N4, extras: { ...N4.extras, retardos_minimos: "erro" }, contexto: { minRetardos: 3 },
              instrucoes: "<p>Síncopes <b>embaixo</b>. <b>Restrição:</b> ao menos três retardos. Fim: 2–3 sobre o ré (dó4 preso, si3, dó4).</p>",
              texto: "compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4\ncontraponto:", duracao: 2,
              solucao: "compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4\ncontraponto: P/2 C4~ C4 B3~ B3 A3~ A3 G3~ G3 F3~ F3 E3~ E3 D3~ D3 C3~ C3 B2 C3/4",
              comentarioSolucao: "Cadeia de 2–3 pura: desce a escala inteira. Correta, mas previsível; onde a sua para?" },
            { id: "ret3", titulo: "4ª espécie livre, em cima", modo: "livre", ...N4,
              instrucoes: "<p>Síncopes em cima: ao menos dois retardos (7–6 ou 4–3) e um ponto em que a cadeia para.</p>",
              texto: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto:\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4", duracao: 2,
              solucao: "compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5~ C5 B4~ B4 A4~ A4 G4~ G4 D5~ D5 C5~ C5 B4~ B4 C5~ C5 B4 C5/4\ncantus: C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4" },
            { id: "ret4", titulo: "Retardos sobre um cantus sorteado", modo: "livre", ...N4, sortear: true,
              instrucoes: "<p>Sobre um cantus sorteado.</p>",
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
          objetivo: "Um acorde pronto para cada grau do baixo em escala, subindo e descendo, em qualquer tom.",
          ouvir: ["Fenaroli, Partimenti, livro 1", "Corelli, Sonatas op. 5: baixos em escala", "Bach, Prelúdio em dó BWV 846, c. 1–11"],
          esboco: "Sem consultar a aula: que acorde você poria sobre o 7º grau subindo (si, em dó)? E descendo?",
          secoes: [
            { tipo: "texto", titulo: "Um acorde por grau, segundo a direção", html: `
              <p><b>Regra da Oitava</b> (Campion, 1716): graus <b>1 e 5</b> levam 5/3; os outros, acordes de sexta que <b>apontam para o próximo grau estável</b>.</p>
              <table class="tabela-modos"><thead><tr><th>Grau</th><th>Subindo</th><th>Descendo</th></tr></thead><tbody>
              <tr><td>8 / 1</td><td>5/3 · I</td><td>5/3 · I</td></tr>
              <tr><td>7</td><td>6/5 · V65 (vai ao 1)</td><td>6 · V6</td></tr>
              <tr><td>6</td><td>6 · IV6</td><td>♯6/4/3 · V43/V (vai ao 5) — na versão diatônica, IV6</td></tr>
              <tr><td>5</td><td>5/3 · V</td><td>5/3 · V</td></tr>
              <tr><td>4</td><td>6/5 · ii65 (vai ao 5)</td><td>4/2 · V42 (resolve no 3)</td></tr>
              <tr><td>3</td><td>6 · I6</td><td>6 · I6</td></tr>
              <tr><td>2</td><td>6/4/3 · V43</td><td>6/4/3 · V43</td></tr>
              </tbody></table>
              <ul><li>4º grau: subindo prepara o 5; descendo é 7ª do V e cai no 3.</li>
              <li>6º grau descendo: ♯4 do tom (V/V), para o 5 chegar como meta.</li>
              <li>Baixo por grau: a regra dá a harmonia. Saltos: fundamental na articulação, sexta no meio.</li>
              <li>Sétimas resolvem por grau descendente.</li>
              <li>Em graus, vale em qualquer tom: transponha até ficar automática.</li></ul>` },
            { tipo: "exemplo", titulo: "A oitava inteira em dó, subindo e descendo",
              camadas: [
                { titulo: "O baixo e as cifras", partitura: "tom: C maior\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", cifras: [[0, "I"], [1, "V43"], [2, "I6"], [3, "ii65"], [4, "V"], [5, "IV6"], [6, "V65"], [7, "I"], [8, "V6"], [9, "V43/V"], [10, "V"], [11, "V42"], [12, "I6"], [13, "V43"], [14, "I"]],
                  notas: [["checagem", "V → IV6 na subida não é retrogressão: o IV6 é de passagem."]] },
                { titulo: "Uma melodia por cima", partitura: "tom: C maior\nsoprano: E5/1 F5 E5 D5 B4 C5 D5 C5 D5 C5 B4 B4 C5 B4 C5/2\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", rotulos: ["soprano", "baixo"], cifras: [[0, "I"], [1, "V43"], [2, "I6"], [3, "ii65"], [4, "V"], [5, "IV6"], [6, "V65"], [7, "I"], [8, "V6"], [9, "V43/V"], [10, "V"], [11, "V42"], [12, "I6"], [13, "V43"], [14, "I"]],
                  notas: [["decisao", "F5 (7ª do V43) resolve em E5 sobre o I6, contra o baixo."],
                    ["decisao", "Descida: C5 (7ª do V43/V) desce a B4, que sobe ao C5 sobre o I6."],
                    ["rejeitada", "F5 sobre V42: F5–E5 contra F3–E3, 8ªs paralelas."]],
                  pausa: ["Por que a melodia quase não salta?", "Com escala no baixo, a independência vem de ficar parada ou ir em sentido contrário."] },
              ] },
          ],
          exercicios: [
            { id: "ro1", titulo: "Completar a oitava em dó", modo: "completar", perfil: { ...TONAL, notas_do_acorde: "erro", regra_da_oitava: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: {} }, cifrasAluno: true, cifrasIniciais: "I V43 I6 ii65 V IV6 V65 I",
              instrucoes: "<p>Escreva as cifras da descida e uma melodia, uma nota por nota do baixo.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", duracao: 1, alvoCompassos: 4,
              solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 F5 E5 D5 B4 C5 D5 C5 D5 C5 B4 B4 C5 B4 C5/2\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", solucaoCifras: "I V43 I6 ii65 V IV6 V65 I V6 V43/V V V42 I6 V43 I" },
            { id: "ro2", titulo: "A oitava no tom do dia", modo: "treino", perfil: { ...TONAL, notas_do_acorde: "erro", regra_da_oitava: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: {} }, cifrasAluno: true, tomDoDia: ["G maior", "F maior", "D maior", "Bb maior", "A maior", "Eb maior", "E maior", "Ab maior"],
              instrucoes: "<p>A oitava no tom do dia: todas as cifras e a melodia, sem olhar a tabela.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", duracao: 1, alvoCompassos: 4,
              solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 F5 E5 D5 B4 C5 D5 C5 D5 C5 B4 B4 C5 B4 C5/2\nbaixo: C3/1 D3 E3 F3 G3 A3 B3 C4 B3 A3 G3 F3 E3 D3 C3/2", solucaoCifras: "I V43 I6 ii65 V IV6 V65 I V6 V43/V V V42 I6 V43 I" },
            { id: "ro3", titulo: "Partimento: escalas e saltos", modo: "aplicar", perfil: { ...TONAL, notas_do_acorde: "erro", regra_da_oitava: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 5 } }, cifrasAluno: true,
              instrucoes: "<p>Partimento: regra da oitava nas escalas, escolha livre nos saltos. Cifras e melodia; cadência perfeita no fim.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 D3 E3 C3 F3 E3 D3 G3 A3 B3 C4 F3 G3/2 G2 C3/4", duracao: 1, alvoCompassos: 5,
              solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 F5 E5 G5 D5 C5 B4 B4 C5 D5 E5 D5 B4/2 D5 C5/4\nbaixo: C3/1 D3 E3 C3 F3 E3 D3 G3 A3 B3 C4 F3 G3/2 G2 C3/4", solucaoCifras: "I V43 I6 I V42 I6 V43 V IV6 V65 I ii6 V V7 I" },
          ],
        },
        {
          id: "baixo", titulo: "O baixo gera a harmonia",
          objetivo: "Baixo como contraponto da melodia, com inversões; os acordes vêm depois.",
          ouvir: ["Bach, corais: cante só o baixo", "Mozart, Sonata K. 545, 1º mov., c. 1–4", "Fenaroli, Partimenti"],
          esboco: "A melodia G4 A4 B4 C5 (semínimas) fecha em dó. Escreva dois baixos diferentes para ela e diga qual prefere.",
          secoes: [
            { tipo: "texto", titulo: "Duas vozes e um preenchimento", html: `
              <p>O par <b>soprano–baixo</b> decide; as internas completam. Uma nota por harmonia, é uma 1ª espécie: 10ªs e 6ªs no meio, 8ªs e 5ªs nas articulações.</p>
              <table class="tabela-modos"><thead><tr><th>Acorde</th><th>Uso no baixo</th></tr></thead><tbody>
              <tr><td>I6</td><td>tônica no meio da linha</td></tr>
              <tr><td>V6, V43</td><td>bordadura/passagem em volta do 1</td></tr>
              <tr><td>ii6</td><td>4 subindo a 5</td></tr>
              <tr><td>IV6</td><td>6 descendo a 5</td></tr>
              <tr><td>6/4 de passagem</td><td>grau entre harmonias da mesma função</td></tr>
              <tr><td>6/4 cadencial</td><td>sobre 5 no forte; 6–5, 4–3</td></tr>
              </tbody></table>
              <ol><li>Cadências e fórmula de baixo (4–5–1; ii6–I64–V–I; x–5).</li>
              <li>Notas estruturais da melodia, uma por harmonia.</li>
              <li>Baixos possíveis para cada uma.</li>
              <li>Prefira grau conjunto e contrário; fundamentais nas articulações.</li>
              <li>Confira o par externo; só então as cifras (uma por nota do baixo).</li></ol>` },
            { tipo: "exemplo", titulo: "Expansão de tônica e cadência composta",
              camadas: [
                { titulo: "Cadência e articulação", partitura: "tom: C maior\nmelodia: E5/1 D5 C5 D5 E5 D5 C5/2\nbaixo: P/4 P/1 G3 C3/2", rotulos: ["melodia", "baixo"],
                  notas: [["decisao", "Fim: I64–V–I sobre G3 G3 C3 (cadência composta)."]] },
                { titulo: "O baixo do começo", partitura: "tom: C maior\nmelodia: E5/1 D5 C5 D5 E5 D5 C5/2\nbaixo: C3/1 D3 E3 F3 G3 G3 C3/2", rotulos: ["melodia", "baixo"],
                  cifras: [[0, "I"], [1, "V43"], [2, "I6"], [3, "ii6"], [4, "I64"], [5, "V"], [6, "I"]],
                  notas: [["decisao", "C3–D3–E3 sob E5–D5–C5: troca de vozes; V43 de passagem."],
                    ["decisao", "F3 (ii6) leva ao G3: escala C3–G3 antes da queda cadencial."],
                    ["rejeitada", "Só fundamentais: baixo saltando, sem troca de vozes."]],
                  pausa: ["Por que V43 no 2º tempo?", "O baixo precisa de D3 para ir por grau de C3 a E3."] },
              ] },
            { tipo: "contraste", titulo: "Mesma melodia, dois baixos",
              a: { rotulo: "A — linear", partitura: "tom: C maior\nmelodia: G4/1 A4 B4 C5\nbaixo: E3/1 D3 G2 C3", cifras: [[0, "I6"], [1, "ii"], [2, "V"], [3, "I"]] },
              b: { rotulo: "B — só fundamentais", partitura: "tom: C maior\nmelodia: G4/1 A4 B4 C5\nbaixo: C3/1 F3 G3 C3", cifras: [[0, "I"], [1, "IV"], [2, "V"], [3, "I"]] },
              pergunta: "Nenhum tem erro. O que muda na sensação de direção?",
              comentario: "<p>A: baixo 3–2–5–1 contra o soprano, desenho próprio. B: baixo saltando, vozes subindo juntas até o V: blocos, não linhas.</p>" },
          ],
          exercicios: [
            { id: "bx1", titulo: "Completar o baixo", modo: "completar", perfil: { ...TONAL }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
              cifrasAluno: true, cifrasIniciais: "I ii I6 I V6 I V43 I6",
              instrucoes: "<p>Escreva baixo e cifras dos c. 3–4, até a cadência autêntica perfeita.</p>",
              texto: "tom: C maior\ncf: melodia\nmelodia: E5/1 F5 G5 E5 D5 C5 B4 C5 A4 B4 C5 D5 E5 D5 C5/2\nbaixo: C3/1 D3 E3 C3 B2 C3 D3 E3", duracao: 1, plano: PLANO_BAIXO,
              solucao: "tom: C maior\ncf: melodia\nmelodia: E5/1 F5 G5 E5 D5 C5 B4 C5 A4 B4 C5 D5 E5 D5 C5/2\nbaixo: C3/1 D3 E3 C3 B2 C3 D3 E3 F3 D3 E3 F3 G3 G3 C3/2",
              solucaoCifras: "I ii I6 I V6 I V43 I6 IV vii°6 I6 ii6 I64 V I" },
            { id: "bx2", titulo: "Baixo melódico", modo: "restrição", perfil: { ...TONAL, baixo_por_grau: "erro" }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 2 }, maxSaltosBaixo: 1 },
              cifrasAluno: true,
              instrucoes: "<p>Baixo e cifras. <b>Restrição:</b> no máximo um salto no baixo, fora o 5 → 1 final.</p>",
              texto: "tom: C maior\ncf: melodia\nmelodia: E5/1 D5 C5 D5 E5 D5 C5/2\nbaixo:", duracao: 1, plano: PLANO_BAIXO,
              solucao: "tom: C maior\ncf: melodia\nmelodia: E5/1 D5 C5 D5 E5 D5 C5/2\nbaixo: C3/1 D3 E3 F3 G3 G3 C3/2", solucaoCifras: "I V43 I6 ii6 I64 V I" },
            { id: "bx3", titulo: "Livre: melodia, baixo e cifras", modo: "variante", perfil: { ...TONAL }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
              cifrasAluno: true, alvoCompassos: 4,
              instrucoes: "<p>Frase de 4 compassos em dó, as duas vozes, com cadência autêntica perfeita e ao menos duas inversões diferentes no baixo.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_BAIXO },
          ],
        },
        {
          id: "ritmo", titulo: "Ritmo harmônico e cadência",
          objetivo: "Quando os acordes mudam: começo lento, aceleração, cadência.",
          ouvir: ["Mozart, K. 331, tema", "Beethoven, op. 2 nº 1, c. 1–8"],
          esboco: "Numa frase de 8 compassos com semicadência no 4 e cadência perfeita no 8, quantos acordes por compasso você usaria em cada trecho?",
          secoes: [
            { tipo: "texto", titulo: "Onde e quando os acordes mudam", html: `
              <ul><li>Acordes mudam nos tempos fortes; atravessar a barra vindo do fraco é síncope harmônica (efeito).</li>
              <li>Cadência chega em tempo mais forte que o anterior; 6/4 cadencial no forte, V no fraco.</li>
              <li><b>Aceleração:</b> 1 acorde por compasso no início, 2+ antes da cadência.</li>
              <li>Dissonâncias harmônicas no forte; passagens no fraco.</li></ul>` },
            { tipo: "exemplo", titulo: "Frase de 8 compassos com aceleração",
              camadas: [
                { titulo: "Melodia e plano", partitura: "tom: C maior\nmelodia: E5/2 D5 C5/4 F5/2 E5 D5/4 E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4", rotulos: ["melodia"],
                  notas: [["decisao", "Semicadência no c. 4, cadência perfeita no c. 8, clímax A5 no c. 6."]] },
                { titulo: "Baixo e ritmo harmônico", partitura: "tom: C maior\nmelodia: E5/2 D5 C5/4 F5/2 E5 D5/4 E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4\nbaixo: C3/4 E3 D3/2 C3 G2/4 C3/2 E3 D3 F3 E3/1 F3 G3 G3 C3/4", rotulos: ["melodia", "baixo"],
                  cifras: [[0, "I"], [4, "I6"], [8, "ii"], [10, "I"], [12, "V"], [16, "I"], [18, "I6"], [20, "ii"], [22, "ii6"], [24, "I6"], [25, "ii6"], [26, "I64"], [27, "V"], [28, "I"]],
                  notas: [["decisao", "Acordes por compasso: 1, 1, 2, 1 | 2, 2, 4."],
                    ["decisao", "C. 7: I64 no 3º tempo (forte), V no 4º."]],
                  pausa: ["E se o c. 7 tivesse só o V?", "Sem aceleração, a cadência soaria como mais um compasso, não como fechamento."] },
              ] },
          ],
          exercicios: [
            { id: "rit1", titulo: "Baixo com aceleração", modo: "restrição", perfil: { ...TONAL, ritmo_harmonico: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, acelerar: [[1, 4], [5, 7]] } }, cifrasAluno: true,
              instrucoes: "<p>Baixo e cifras: semicadência no c. 4, cadência perfeita no 8, <b>ritmo harmônico mais rápido nos c. 5–7</b>.</p>",
              texto: "tom: C maior\ncf: melodia\nmelodia: E5/2 D5 C5/4 F5/2 E5 D5/4 E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4\nbaixo:", duracao: 2, plano: PLANO_BAIXO,
              solucao: "tom: C maior\ncf: melodia\nmelodia: E5/2 D5 C5/4 F5/2 E5 D5/4 E5/2 G5 F5 A5 G5/1 F5 E5 D5 C5/4\nbaixo: C3/4 E3 D3/2 C3 G2/4 C3/2 E3 D3 F3 E3/1 F3 G3 G3 C3/4",
              solucaoCifras: "I I6 ii I V I I6 ii ii6 I6 ii6 I64 V I" },
            { id: "rit2", titulo: "Frase livre com aceleração", modo: "livre", perfil: { ...TONAL, ritmo_harmonico: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, acelerar: [[1, 4], [5, 7]] } }, cifrasAluno: true, alvoCompassos: 8,
              instrucoes: "<p>Melodia, baixo e cifras em 8 compassos: semicadência no 4, perfeita no 8, aceleração nos c. 5–7.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 2, plano: PLANO_FRASE },
          ],
        },
        {
          id: "esquemas", titulo: "Esquemas galantes",
          objetivo: "Frases que encadeiam moldes de soprano e baixo (Do-Re-Mi, Romanesca, Prinner, cadência composta).",
          ouvir: ["Pachelbel, Cânone em ré (Romanesca)", "Mozart, Sonata K. 545, 1º mov. (Prinners)", "Haydn, Mozart, minuetos após a barra dupla (Monte, Fonte)"],
          esboco: "Escreva só os graus (soprano/baixo) de uma frase de 4 compassos: uma abertura, uma resposta e uma cadência.",
          secoes: [
            { tipo: "texto", titulo: "Moldes com lugar na frase", html: `
              <p>Esquema (Gjerdingen): par de vozes externas com <b>etapas</b> fixas e lugar típico na frase.</p>
              <table class="tabela-modos"><thead><tr><th>Função</th><th>Esquema</th><th>Soprano</th><th>Baixo</th></tr></thead><tbody>
              <tr><td rowspan="3">abertura</td><td>Do-Re-Mi</td><td>1–2–3</td><td>1–7–1</td></tr>
              <tr><td>Romanesca</td><td>3–2–1–7 ou 1–5–1–1</td><td>1–7–6–3 ou 1–5–6–3 (saltada)</td></tr>
              <tr><td>Meyer</td><td>1–7…4–3</td><td>1–2…7–1</td></tr>
              <tr><td>resposta</td><td>Prinner</td><td>6–5–4–3</td><td>4–3–2–1 (10ªs)</td></tr>
              <tr><td rowspan="3">continuação</td><td>Monte</td><td colspan="2">sobe, tonicizando IV e V</td></tr>
              <tr><td>Fonte</td><td colspan="2">desce, ii e I</td></tr>
              <tr><td>Ponte</td><td colspan="2">prolonga o V</td></tr>
              <tr><td>cadência</td><td colspan="3">simples, composta (6/4–5/3 sobre 5), dupla; convergente (4–♯4–5) na semicadência; Quiescenza no fim</td></tr>
              </tbody></table>
              <p>Gramática: <b>abertura → Prinner → (continuação) → cadência</b>; ligações por nota comum ou grau no soprano, contrário ou 10ªs no baixo; ritmo harmônico acelerando.</p>` },
            { tipo: "exemplo", titulo: "Do-Re-Mi → Prinner → cadência composta",
              camadas: [
                { titulo: "O esqueleto de graus", texto: "Do-Re-Mi (c. 1–3) → Prinner (c. 4–5) → cadência composta (c. 6–8).",
                  partitura: "tom: C maior\nsoprano: C5/4 D5 E5 A5/2 G5 F5 E5 D5/4 E5/2 D5 C5/4\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4", rotulos: ["soprano", "baixo"],
                  cifras: [[0, "I"], [4, "V6"], [8, "I"], [12, "IV"], [14, "I6"], [16, "vii°6"], [18, "I"], [20, "ii6"], [24, "I64"], [26, "V"], [28, "I"]],
                  notas: [["decisao", "Do-Re-Mi → Prinner: E5 → A5 sobre C3 → F3 (10ª → 10ª); o registro sobe para o Prinner descer."],
                    ["decisao", "Prinner → cadência: E5/C3 → D5/F3, contrário."],
                    ["checagem", "Ritmo harmônico acelera no Prinner e na cadência."]] },
              ] },
            { tipo: "contraste", titulo: "Romanesca saltada e Prinner, em mínimas",
              a: { rotulo: "Romanesca → Prinner", partitura: "tom: C maior\nsoprano: E5/2 D5 C5 B4 A4 G4 F4 E4\nbaixo: C3/2 G2 A2 E2 F2 E2 D2 C2", cifras: [[0, "I"], [2, "V"], [4, "vi"], [6, "iii"], [8, "IV"], [10, "I6"], [12, "vii°6"], [14, "I"]] },
              b: { rotulo: "A mesma abertura sem o Prinner", partitura: "tom: C maior\nsoprano: E5/2 D5 C5 B4 A4 B4 C5/4\nbaixo: C3/2 G2 A2 E2 F2 G2 C3/4", cifras: [[0, "I"], [2, "V"], [4, "vi"], [6, "iii"], [8, "IV"], [10, "V"], [12, "I"]] },
              pergunta: "Qual soa como pergunta e resposta, e qual como um gesto só?",
              comentario: "<p>A: Romanesca abre, Prinner responde; a melodia desce uma 8ª em dois gestos simétricos. B: sem a resposta, soa curto; falta metade do arco.</p>" },
          ],
          exercicios: [
            { id: "esq1", titulo: "Realizar o soprano sobre um baixo de esquemas", modo: "completar", perfil: { ...MELODIA, esquema: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 }, esquemas: [{ nome: "Do-Re-Mi", inicio: 0, etapa: 4, baixo: [1, 7, 1], soprano: [1, 2, 3] }, { nome: "Prinner", inicio: 12, etapa: 2, baixo: [4, 3, 2, 1], soprano: [6, 5, 4, 3] }] },
              cifras: "I V6 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>Soprano sobre Do-Re-Mi (c. 1–3), Prinner (c. 4–5) e cadência composta (c. 6–8): graus do esquema no início das etapas; entre elas, diminua.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4", duracao: 4, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nsoprano: C5/4 D5 E5 A5/2 G5 F5 E5 D5/4 E5/2 D5 C5/4\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4" },
            { id: "esq2", titulo: "Romanesca → Prinner → cadência", modo: "menos apoio", perfil: { ...TONAL, esquema: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 6 }, esquemas: [{ nome: "Romanesca", inicio: 0, etapa: 2, baixo: [1, 5, 6, 3], soprano: [3, 2, 1, 7] }, { nome: "Prinner", inicio: 8, etapa: 2, baixo: [4, 3, 2, 1], soprano: [6, 5, 4, 3] }] },
              cifrasAluno: true, alvoCompassos: 6,
              instrucoes: "<p>Duas vozes em mínimas e cifras: Romanesca saltada (c. 1–2), Prinner (c. 3–4), cadência perfeita (c. 5–6).</p>",
              texto: "tom: C maior\nsoprano:\nbaixo:", duracao: 2, plano: PLANO_FRASE,
              solucao: "tom: C maior\nsoprano: E5/2 D5 C5 B4 A4 G4 F4 E4 D4 B3 C4/4\nbaixo: C3/2 G2 A2 E2 F2 E2 D2 C2 F2 G2 C2/4",
              solucaoCifras: "I V vi iii IV I6 vii°6 I ii6 V I" },
            { id: "esq3", titulo: "Sua combinação de esquemas", modo: "variante", perfil: { ...TONAL }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 8 } }, cifrasAluno: true, alvoCompassos: 8,
              instrucoes: "<p>Três esquemas numa frase de 8 compassos com cadência perfeita. No plano: quais e onde.</p>",
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
          objetivo: "Melodia em dois níveis: esqueleto (uma nota por harmonia) e diminuição com uma figura consistente.",
          ouvir: ["Mozart, K. 545, 1º mov.: uma nota por acorde", "Bach, Prelúdio em dó BWV 846: melodia composta"],
          esboco: "Sobre I | V6 | I (uma semibreve por compasso), escreva a linha estrutural (3 notas) e depois uma versão em semínimas.",
          secoes: [
            { tipo: "texto", titulo: "Estrutural e ornamental", html: `
              <table class="tabela-modos"><thead><tr><th></th><th>Estrutural</th><th>Ornamental</th></tr></thead><tbody>
              <tr><td>Com o baixo</td><td>consonante</td><td>passagem, bordadura, apojatura, arpejo, antecipação</td></tr>
              <tr><td>Métrica</td><td>forte ou longa</td><td>apojatura no forte: a estrutural é a resolução</td></tr>
              <tr><td>Ligação</td><td>por grau (5–4–3–2–1, 3–2–1)</td><td>—</td></tr>
              </tbody></table>
              <p>Saltos alternados = <b>melodia composta</b>: duas linhas implícitas.</p>
              <ol><li>Esqueleto: uma nota por harmonia, descida estrutural à cadência.</li>
              <li>Confira como 1ª espécie contra o baixo.</li>
              <li>Diminua com <b>uma figura consistente</b>.</li>
              <li>Reduza de novo: o esqueleto sobreviveu?</li></ol>` },
            { tipo: "exemplo", titulo: "Uma figura, do começo à cadência", intro: "Frase de 4 compassos; baixo e cifras dados.",
              camadas: [
                { titulo: "Linha-esqueleto", partitura: "tom: C maior\nsoprano: E5/2 G5 A5 G5 E5 F5 E5 D5 C5/4\nbaixo: C3/2 E3 F3 G3 A3 F3 G3 G3 C3/4", rotulos: ["esqueleto", "baixo"], cifras: [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]],
                  notas: [["decisao", "Sobe E5–G5–A5 (clímax no IV, c. 2), desce até C5; 3–2–1 no fim."],
                    ["checagem", "Contra o baixo: 10–10–10–8 | 5–8–6–5 | 8; perfeitas por contrário ou oblíquo."],
                    ["rejeitada", "B4 sobre o V do c. 2: queda de 7ª logo após o clímax."]] },
                { titulo: "Superfície: semínima + duas colcheias", partitura: "tom: C maior\nsoprano: E5/1 G5/0.5 F5 G5/1 E5/0.5 G5 A5/1 F5/0.5 A5 G5/1 D5/0.5 G5 E5/1 C5/0.5 E5 F5/1 A5/0.5 F5 E5/1 G5/0.5 E5 D5/2 C5/4\nbaixo: C3/2 E3 F3 G3 A3 F3 G3 G3 C3/4", rotulos: ["melodia", "baixo"], cifras: [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]],
                  notas: [["decisao", "Figura: esqueleto na semínima; colcheias arpejam e voltam (ou passam) à próxima nota."],
                    ["decisao", "C. 1–3: a figura em sequência; o gesto se torna reconhecível."],
                    ["decisao", "C. 4: liquidação, D5–C5 em mínimas; a cadência desacelera e chega."]],
                  pausa: ["No c. 1, por que F5 entre G5 e G5?", "Bordadura. C5 daria salto de 4ª e volta, quebrando o gesto dos compassos seguintes."] },
              ] },
            { tipo: "contraste", titulo: "Figura consistente × figura nova a cada tempo",
              a: { rotulo: "A — uma figura por meio compasso", partitura: "tom: C maior\nsoprano: E5/1.5 F5/0.5 G5/0.25 F5 E5 F5 G5/1 A5/2 G5/0.5 D5 G5 F5 E5/1.5 C5/0.5 F5/0.5 E5 D5 F5 E5/2 D5 C5/4\nbaixo: C3/2 E3 F3 G3 A3 F3 G3 G3 C3/4", cifras: [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]] },
              b: { rotulo: "B — uma figura para a frase", partitura: "tom: C maior\nsoprano: E5/1 G5/0.5 F5 G5/1 E5/0.5 G5 A5/1 F5/0.5 A5 G5/1 D5/0.5 G5 E5/1 C5/0.5 E5 F5/1 A5/0.5 F5 E5/1 G5/0.5 E5 D5/2 C5/4\nbaixo: C3/2 E3 F3 G3 A3 F3 G3 G3 C3/4", cifras: [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]] },
              pergunta: "Mesmo esqueleto, nenhum erro. Qual você cantaria de memória após duas audições?",
              comentario: "<p>A: cinco ideias em três compassos; nenhuma vira tema. B: um gesto transportado com a harmonia; a variedade vem do esqueleto. A liquidação do c. 4 só se percebe porque havia figura a liquidar.</p>" },
          ],
          exercicios: [
            { id: "sup1", titulo: "Diminuir um esqueleto", modo: "completar", perfil: { ...MELODIA, esqueleto_preservado: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: [[0, "C5"], [4, "D5"], [8, "E5"], [12, "A5"], [14, "G5"], [16, "F5"], [18, "E5"], [20, "D5"], [24, "E5"], [26, "D5"], [28, "C5"]] },
              cifras: "I V6 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>Diminua o esqueleto (C5 D5 E5 | A5 G5 F5 E5 | D5 | E5 D5 | C5, no início de cada acorde) em semínimas e colcheias. Notas fora do acorde só por grau.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nsoprano: C5/1 D5 E5 C5 D5 C5 B4 D5 E5 D5 E5 G5 A5 F5 G5 E5 F5 D5 E5 C5 D5 E5 F5 D5 E5 C5 D5 B4 C5/4\nbaixo: C3/4 B2 C3 F3/2 E3 D3 C3 F3/4 G3/2 G3 C3/4" },
            { id: "sup2", titulo: "Seu esqueleto, uma figura só", modo: "menos apoio", perfil: { ...MELODIA }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 5 } }, cifras: "I vi IV V I6 vi ii6 V I".split(" "),
              instrucoes: "<p>No plano, o esqueleto (uma nota por acorde, descida 3–2–1 ou 5–4–3–2–1). Depois o soprano com <b>uma só figura rítmica</b> até a cadência, que pode liquidar.</p>",
              texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/2 A2 F2 G2 E2 A2 F2 G2 C3/4", duracao: 1, alvoCompassos: 5,
              plano: [["Esqueleto", "As 9 notas estruturais, uma por acorde."], ["Figura", "Qual figura (ritmo e desenho) e o que ela faz entre duas notas do esqueleto?"], ["Liquidação", "Onde a figura para, e o que sobra?"]],
              solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 G5/0.5 F5 E5/1 C5/0.5 E5 F5/1 A5/0.5 F5 D5/1 B4/0.5 D5 C5/1 E5/0.5 D5 C5/1 A4/0.5 C5 D5/2 B4 C5/4\nbaixo: C3/2 A2 F2 G2 E2 A2 F2 G2 C3/4",
              comentarioSolucao: "Esqueleto E5 E5 | F5 D5 | C5 C5 | D5 B4 | C5; semínima + duas colcheias, liquidada no c. 4." },
            { id: "sup3", titulo: "Livre: frase de 4 compassos em dois níveis", modo: "livre", perfil: { ...MELODIA }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, alvoCompassos: 4,
              instrucoes: "<p>Frase de 4 compassos (melodia, baixo, cifras) com cadência perfeita: esqueleto no plano, depois a superfície com uma figura.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 1, plano: [["Esqueleto", "Uma nota por acorde, com a descida estrutural."], ...PLANO_FRASE] },
          ],
        },
        {
          id: "sentenca", titulo: "A sentença",
          objetivo: "Sentença de 8 compassos: apresentação na tônica; continuação que fragmenta, acelera e liquida.",
          ouvir: ["Beethoven, Sonata op. 2 nº 1, 1º mov., c. 1–8", "Mozart, Sinfonia nº 40, 1º mov., tema"],
          esboco: "Escreva só a ideia básica (2 compassos) e decida: a repetição será exata ou em tônica–dominante?",
          secoes: [
            { tipo: "texto", titulo: "Funções da sentença (Caplin)", html: `
              <table class="tabela-modos"><thead><tr><th>Função</th><th>Compassos</th><th>Conteúdo</th></tr></thead><tbody>
              <tr><td><b>Apresentação</b></td><td>1–4</td><td>ideia básica (2 c.) + repetição exata ou tônica–dominante; prolonga I</td></tr>
              <tr><td><b>Continuação</b></td><td>5–6/7</td><td><b>fragmentação</b> (unidades ≤ 1 c.), aceleração, sequência; um Prinner serve</td></tr>
              <tr><td><b>Cadência</b></td><td>7–8</td><td>fundida à continuação; <b>liquidação</b> até restar a fórmula</td></tr>
              </tbody></table>
              <p>Fragmentação é tamanho; liquidação é conteúdo. Sem fragmentar nem acelerar, vira 4 + 4 da mesma densidade.</p>` },
            { tipo: "exemplo", titulo: "Uma sentença decidida em camadas",
              camadas: [
                { titulo: "Plano harmônico e esqueleto", partitura: "tom: C maior\nsoprano: G5/4 F5 F5 E5 A5/2 G5 F5 E5 D5 C5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3 G3 C3/4", rotulos: ["esqueleto", "baixo"],
                  notas: [["decisao", "Um acorde por compasso na apresentação, dois na continuação."],
                    ["decisao", "Esqueleto G5–F5–E5; clímax A5 no c. 5; descida até C5."]] },
                { titulo: "Superfície", partitura: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2 A5/0.75 G5/0.25 A5/1 G5/0.75 F5/0.25 G5/1 F5/0.75 E5/0.25 F5/1 E5/0.75 D5/0.25 E5/1 D5/2 E5/1 D5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4",
                  rotulos: ["melodia", "baixo"], cifras: [[0, "I"], [4, "V7"], [8, "V7"], [12, "I"], [16, "IV"], [18, "I6"], [20, "vii°6"], [22, "I"], [24, "ii6"], [26, "I64"], [27, "V"], [28, "I"]],
                  notas: [["decisao", "Ideia básica: arpejo pontuado C5–E5–G5 + descida F5–E5–D5; repetida sobre V7."],
                    ["decisao", "Continuação: meio compasso (cabeça diminuída) em sequência sobre 10ªs, um Prinner. C. 7 liquida."],
                    ["rejeitada", "F5 no c. 5: C5/C3 → F5/F3, 8ªs paralelas."]],
                  pausa: ["Por que repetir sobre V7, e não exato?", "Já há movimento harmônico, e o IV do c. 5 não soa como recomeço."] },
              ] },
          ],
          exercicios: [
            { id: "sen1", titulo: "Completar a continuação", modo: "completar", perfil: { ...MELODIA }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 } }, cifras: "I V7 V7 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>Escreva continuação e cadência (c. 5–8): fragmente, acelere, liquide.</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4",
              duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2 A5/0.75 G5/0.25 A5/1 G5/0.75 F5/0.25 G5/1 F5/0.75 E5/0.25 F5/1 E5/0.75 D5/0.25 E5/1 D5/2 E5/1 D5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4" },
            { id: "sen2", titulo: "Continuação em sequência", modo: "restrição", perfil: { ...MELODIA, sequencia_do_motivo: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 }, motivo: { de: 5, em: [6] } }, cifras: "I V7 V7 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>Sentença inteira sobre o baixo. <b>Restrição:</b> c. 6 = sequência do c. 5.</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia:\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2 A5/0.75 G5/0.25 A5/1 G5/0.75 F5/0.25 G5/1 F5/0.75 E5/0.25 F5/1 E5/0.75 D5/0.25 E5/1 D5/2 E5/1 D5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4" },
            { id: "sen3", titulo: "Sentença com o seu baixo", modo: "livre", perfil: { ...MELODIA, ritmo_harmonico: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8, acelerar: [[1, 4], [5, 7]] } }, cifrasAluno: true, alvoCompassos: 8,
              instrucoes: "<p>Sentença de 8 compassos (melodia, baixo, cifras), acelerando na continuação, com cadência perfeita.</p>",
              texto: "tom: C maior\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_FRASE },
          ],
        },
        {
          id: "periodo", titulo: "O período",
          objetivo: "Antecedente e consequente: mesma ideia básica, cadências de força diferente.",
          ouvir: ["Mozart, Sonata K. 331, 1º mov., tema", "Beethoven, 9ª Sinfonia, 'Hino à Alegria'"],
          esboco: "Com a ideia básica da sentença (C5–E5–G5 | F5–E5–D5), como seria uma ideia contrastante que termina em semicadência?",
          secoes: [
            { tipo: "texto", titulo: "Antecedente e consequente", html: `
              <table class="tabela-modos"><thead><tr><th></th><th>c. 1–2</th><th>c. 3–4</th><th>Cadência</th></tr></thead><tbody>
              <tr><td><b>Antecedente</b></td><td>ideia básica (prolonga I)</td><td>ideia contrastante (cadencia)</td><td>fraca: SC ou CAI</td></tr>
              <tr><td><b>Consequente</b></td><td>ideia básica</td><td>contrastante refeita</td><td>perfeita</td></tr>
              </tbody></table>
              <p>Evite: contrastante igual à básica; consequente em semicadência; perfeita já no antecedente; densidade rítmica uniforme.</p>` },
            { tipo: "exemplo", titulo: "Um período com a mesma ideia básica",
              camadas: [
                { titulo: "Antecedente e consequente", partitura: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 E5/0.5 G5 F5 E5 D5 E5 D5 C5 B4/4 C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 G5/1 F5 E5 D5 C5/4\nbaixo: C3/4 G2 C3/2 D3 G2/4 C3/4 G3 E3/1 F3 G3 G3 C3/4",
                  rotulos: ["melodia", "baixo"], cifras: [[0, "I"], [4, "V7"], [8, "I"], [10, "ii"], [12, "V"], [16, "I"], [20, "V7"], [24, "I6"], [25, "ii6"], [26, "I64"], [27, "V"], [28, "I"]],
                  notas: [["decisao", "C. 3: colcheias contínuas, contraste de ritmo."],
                    ["decisao", "Semicadência em B4: suspensa na sensível. D5 repetiria o fim do c. 2."],
                    ["decisao", "C. 5–6 = c. 1–2; c. 7 desce 5–4–3–2 até o I."]] },
              ] },
          ],
          exercicios: [
            { id: "per1", titulo: "Completar o consequente", modo: "completar", perfil: { ...MELODIA, ideia_repetida: "erro", semicadencia: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, repete: [1, 5] } }, cifras: "I V7 I ii V I V7 I6 ii6 I64 V I".split(" "),
              instrucoes: "<p>Escreva o consequente (c. 5–8).</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 E5/0.5 G5 F5 E5 D5 E5 D5 C5 B4/4\nbaixo: C3/4 G2 C3/2 D3 G2/4 C3/4 G3 E3/1 F3 G3 G3 C3/4",
              duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 E5/0.5 G5 F5 E5 D5 E5 D5 C5 B4/4 C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 G5/1 F5 E5 D5 C5/4\nbaixo: C3/4 G2 C3/2 D3 G2/4 C3/4 G3 E3/1 F3 G3 G3 C3/4" },
            { id: "per2", titulo: "Período sobre o baixo dado", modo: "menos apoio", perfil: { ...MELODIA, ideia_repetida: "erro", semicadencia: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, repete: [1, 5] } }, cifras: "I V7 I ii V I V7 I6 ii6 I64 V I".split(" "),
              instrucoes: "<p>Período inteiro, com ideia básica sua, sobre baixo e cifras dados.</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia:\nbaixo: C3/4 G2 C3/2 D3 G2/4 C3/4 G3 E3/1 F3 G3 G3 C3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE },
            { id: "per3", titulo: "Período com o seu baixo", modo: "livre", perfil: { ...MELODIA, ideia_repetida: "erro", semicadencia: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8, repete: [1, 5] } }, cifrasAluno: true, alvoCompassos: 8,
              instrucoes: "<p>Período de 8 compassos (melodia, baixo, cifras): SC no 4, perfeita no 8, consequente começando como o antecedente.</p>",
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
  // perguntas de antes dos exercícios em módulos próprios (web/livro/perguntas-*.js)
  function perguntas(id, lista) {
    for (const n of niveis) for (const t of n.temas) if (t.id === id) { t.antes = lista; return; }
    throw new Error("tema inexistente para perguntas: " + id);
  }
  const perfis = { N1, N2, N3, N4, TONAL, MELODIA, CANTUS, PLANO_CP, PLANO_BAIXO, PLANO_FRASE, FUX, CF1, CF2 };

  raiz.TEMAS = { niveis, inserir, novoNivel, perguntas, perfis };
})(this);
