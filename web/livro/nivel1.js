/* Nível 1 · A linha a duas vozes: capítulos modos, arquitetura, elaborar, continua, retardos.
 * Saíram de web/temas.js sem nenhuma mudança de conteúdo; carregam antes dos outros módulos (web/livro/indice.js). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const { TONAL, MELODIA, N1, N2, N3, N4, CANTUS, PLANO_CP, PLANO_BAIXO, PLANO_FRASE, FUX, CF1, CF2 } = T.perfis;

  const temas = [
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
  ];
  for (const tema of temas) T.inserir(1, tema);
})(this);
