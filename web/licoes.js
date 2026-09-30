/* Conteúdo do curso (versão 2): níveis 1–3, lições e práticas.
 * Base: pesquisa/01 a 05. Cada cartão é um de:
 *   conceito  { titulo, texto, partitura?, anotacoes?: [[voz, nota, texto]], cifras?: [[semínima, texto]] }
 *   escolha   { conceito, pergunta, opcoes, certa, explica, partitura?, anotacoes? }
 *   vf        { conceito, pergunta, certa: true|false, explica }
 *   tocar     { conceito, pergunta, aceita: ["C#5"], explica, partitura? }
 *   erro      { conceito, pergunta, partitura, alvo: [[voz, nota]], regra, explica }
 *   gerado    { gerador, quantos }  — perguntas criadas na hora (ver curso.html)
 * "partitura" está no formato de texto do verificador. */
(function (raiz) {
  "use strict";

  const CF_FUX = "D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4";
  const PERIODO = "C4/1 E4 G4 E4 F4 A4 C5 A4 G4/2 E4 B3 D4 C4/1 E4 G4 E4 F4 A4 C5 A4 B4 G4 F4 D4 C4/4";
  const ACORDES_PERIODO = ["I", "IV", "I", "V", "I", "IV", "V7", "I"];

  const niveis = [
    // ============================================================== NÍVEL 1
    {
      id: "n1", titulo: "A linha e o intervalo",
      resumo: "Ler e ouvir notas e intervalos, escrever uma boa melodia e o primeiro contraponto.",
      unidades: [
        {
          id: "n1u1", titulo: "Notas e graus",
          licoes: [
            {
              id: "n1u1l1", titulo: "A pauta e o teclado",
              cartoes: [
                { tipo: "conceito", titulo: "Os nomes das notas",
                  texto: "As notas são <b>C D E F G A B</b> (dó ré mi fá sol lá si). O número diz a oitava: <b>C4</b> é o dó central do piano. Na clave de sol, cada linha e cada espaço é uma nota.",
                  partitura: "v: C4/1 D4 E4 F4 G4 A4 B4 C5",
                  anotacoes: [[0, 0, "dó"], [0, 1, "ré"], [0, 2, "mi"], [0, 3, "fá"], [0, 4, "sol"], [0, 5, "lá"], [0, 6, "si"], [0, 7, "dó"]] },
                { tipo: "gerado", gerador: "nota_sol", quantos: 3 },
                { tipo: "tocar", conceito: "leitura", pergunta: "Toque o dó central (C4) no piano.", aceita: ["C4"],
                  explica: "O C4 fica no meio do teclado, marcado em azul. É a primeira linha suplementar abaixo da clave de sol." },
                { tipo: "conceito", titulo: "A clave de fá",
                  texto: "As notas graves usam a <b>clave de fá</b>. A linha onde ficam os dois pontos da clave é o fá (F3). O dó central (C4) fica logo acima da pauta.",
                  partitura: "v: C3/1 D3 E3 F3 G3 A3 B3 C4",
                  anotacoes: [[0, 0, "dó"], [0, 3, "fá"], [0, 7, "dó"]] },
                { tipo: "gerado", gerador: "nota_fa", quantos: 2 },
                { tipo: "tocar", conceito: "leitura", pergunta: "Toque o sol logo acima do dó central.", aceita: ["G4"],
                  explica: "Dó, ré, mi, fá, sol: o sol é a quinta nota a partir do dó central, G4." },
              ],
            },
            {
              id: "n1u1l2", titulo: "Graus da escala",
              cartoes: [
                { tipo: "conceito", titulo: "Tônica e graus",
                  texto: "Em dó maior, cada nota tem um número, o <b>grau</b>: C é o 1º (a <b>tônica</b>), D o 2º, até B, o 7º. A tônica é a casa: as melodias costumam começar e terminar nela.",
                  partitura: "tom: C maior\nv: C4/1 D4 E4 F4 G4 A4 B4 C5",
                  anotacoes: [[0, 0, "1"], [0, 1, "2"], [0, 2, "3"], [0, 3, "4"], [0, 4, "5"], [0, 5, "6"], [0, 6, "7"], [0, 7, "1"]] },
                { tipo: "escolha", conceito: "graus", pergunta: "Qual é o 5º grau de dó maior?", opcoes: ["F", "G", "A", "E"], certa: 1,
                  explica: "C D E F G: a quinta nota é G (sol), chamada de dominante." },
                { tipo: "conceito", titulo: "A sensível",
                  texto: "O 7º grau (B em dó maior) fica a <b>meio tom</b> da tônica e puxa para ela: é a <b>sensível</b>. Ouça si → dó: soa como chegada.",
                  partitura: "v: G4/1 A4 B4 C5/1", anotacoes: [[0, 2, "sensível"], [0, 3, "tônica"]] },
                { tipo: "tocar", conceito: "graus", pergunta: "Toque a sensível de dó maior: a nota logo abaixo de C5.", aceita: ["B4"],
                  explica: "B4 fica a meio tom de C5 e resolve nele." },
                { tipo: "gerado", gerador: "grau", quantos: 3 },
                { tipo: "escolha", conceito: "graus", pergunta: "Por que a sensível tende a subir para a tônica?",
                  opcoes: ["Porque fica a meio tom dela", "Porque é a nota mais aguda da escala", "Porque é o 5º grau"], certa: 0,
                  explica: "A distância de meio tom cria uma atração forte: o ouvido espera a resolução." },
              ],
            },
          ],
        },
        {
          id: "n1u2", titulo: "Intervalos",
          licoes: [
            {
              id: "n1u2l1", titulo: "Contando intervalos",
              cartoes: [
                { tipo: "conceito", titulo: "Distância entre duas notas",
                  texto: "Para saber o intervalo, conte as notas <b>incluindo as duas pontas</b>: C até E = C, D, E = <b>3ª</b>. C até G = <b>5ª</b>. C até o C seguinte = <b>8ª</b> (oitava).",
                  partitura: "v: C4/2 E4 C4 G4 C4 C5", anotacoes: [[0, 1, "3ª"], [0, 3, "5ª"], [0, 5, "8ª"]] },
                { tipo: "gerado", gerador: "intervalo_numero", quantos: 4 },
                { tipo: "tocar", conceito: "intervalos", pergunta: "Toque a nota uma 5ª acima de D4.", aceita: ["A4"],
                  explica: "D, E, F, G, A: cinco notas. A 5ª acima de D4 é A4." },
                { tipo: "escolha", conceito: "intervalos", pergunta: "Qual é o intervalo de E4 até C5?", opcoes: ["5ª", "6ª", "7ª", "4ª"], certa: 1,
                  explica: "E, F, G, A, B, C: seis notas, uma 6ª." },
                { tipo: "gerado", gerador: "intervalo_numero", quantos: 2 },
              ],
            },
            {
              id: "n1u2l2", titulo: "Qualidade e ouvido",
              cartoes: [
                { tipo: "conceito", titulo: "Maior, menor e justo",
                  texto: "Intervalos com o mesmo número podem ter tamanhos diferentes. C–E tem 4 semitons: <b>3ª maior</b>. D–F tem 3: <b>3ª menor</b>. A 4ª, a 5ª e a 8ª comuns se chamam <b>justas</b>.",
                  partitura: "v: C4/2 E4 D4 F4", anotacoes: [[0, 1, "3ª M"], [0, 3, "3ª m"]] },
                { tipo: "conceito", titulo: "Tabela de semitons",
                  texto: "3ª menor 3 · 3ª maior 4 · 4ª justa 5 · <b>trítono</b> 6 · 5ª justa 7 · 6ª menor 8 · 6ª maior 9 · 8ª 12. O trítono (fá–si) é uma 4ª aumentada: soa instável." },
                { tipo: "gerado", gerador: "intervalo_escrito", quantos: 3 },
                { tipo: "gerado", gerador: "intervalo_ouvido", quantos: 3 },
                { tipo: "escolha", conceito: "intervalos", pergunta: "Qual é o intervalo F4–B4?",
                  opcoes: ["4ª justa", "4ª aumentada (trítono)", "5ª justa", "5ª diminuta"], certa: 1,
                  explica: "F, G, A, B são quatro notas; com 6 semitons, é uma 4ª aumentada, o trítono." },
              ],
            },
          ],
        },
        {
          id: "n1u3", titulo: "Consonância",
          licoes: [
            {
              id: "n1u3l1", titulo: "Perfeitas, imperfeitas e dissonantes",
              cartoes: [
                { tipo: "conceito", titulo: "Estável ou tenso",
                  texto: "<b>Perfeitas</b> (uníssono, 5ª, 8ª): firmes e ocas. <b>Imperfeitas</b> (3ªs, 6ªs): cheias e doces. <b>Dissonâncias</b> (2ªs, 7ªs, trítono): tensas, pedem movimento. Toque ▶ para ouvir cada uma.",
                  partitura: "compasso: 2/2\nsup: G4/2 C5 E4 A4 D4 B4\ninf: C4/2 C4 C4 C4 C4 C4",
                  anotacoes: [[0, 0, "5ª"], [0, 1, "8ª"], [0, 2, "3ª"], [0, 3, "6ª"], [0, 4, "2ª"], [0, 5, "7ª"]] },
                { tipo: "gerado", gerador: "consonancia", quantos: 5 },
                { tipo: "escolha", conceito: "consonancia", pergunta: "Qual destes intervalos é uma consonância imperfeita?",
                  opcoes: ["5ª justa", "6ª maior", "7ª menor", "8ª justa"], certa: 1,
                  explica: "3ªs e 6ªs são as consonâncias imperfeitas." },
              ],
            },
            {
              id: "n1u3l2", titulo: "A 4ª e o baixo",
              cartoes: [
                { tipo: "conceito", titulo: "Um caso à parte",
                  texto: "A <b>4ª justa</b>, quando envolve a voz mais grave, é tratada como <b>dissonância</b>. No contraponto a duas vozes, então, ela não pode ser usada como consonância.",
                  partitura: "sup: G4/4\ninf: D4/4", anotacoes: [[0, 0, "4ª"]] },
                { tipo: "vf", conceito: "consonancia", pergunta: "No contraponto a duas vozes, a 4ª justa é uma consonância.", certa: false,
                  explica: "Falso: contra o baixo, a 4ª justa conta como dissonância." },
                { tipo: "gerado", gerador: "consonancia", quantos: 3 },
                { tipo: "escolha", conceito: "consonancia", pergunta: "Com D4 embaixo, qual nota de cima forma consonância?",
                  opcoes: ["G4", "A4", "E4", "C5"], certa: 1,
                  explica: "A4 forma 5ª justa. G4 seria 4ª, E4 uma 2ª e C5 uma 7ª." },
                { tipo: "tocar", conceito: "consonancia", pergunta: "Toque uma nota que forme 6ª acima de E4.", aceita: ["C5", "C#5"],
                  explica: "E, F, G, A, B, C: a 6ª acima de E4 é C5 (6ª menor) ou C#5 (6ª maior)." },
              ],
            },
          ],
        },
        {
          id: "n1u4", titulo: "A boa melodia",
          licoes: [
            {
              id: "n1u4l1", titulo: "Contorno e clímax",
              cartoes: [
                { tipo: "conceito", titulo: "Forma de arco",
                  texto: "Boas melodias costumam ter forma de <b>arco</b>: sobem até um ponto mais agudo, o <b>clímax</b>, e voltam. O clímax aparece <b>uma vez só</b>; repetido, perde a força.",
                  partitura: "melodia: C4/1 D4 E4 G4 A4 G4 E4 D4 C4/4", anotacoes: [[0, 4, "clímax"]] },
                { tipo: "escolha", conceito: "melodia", pergunta: "Quantas vezes a nota mais aguda aparece nesta melodia?",
                  partitura: "melodia: C4/1 E4 G4 E4 G4 F4 G4 E4 C4/4", opcoes: ["1", "2", "3"], certa: 2,
                  explica: "O sol aparece três vezes: a melodia fica sem um ponto alto claro." },
                { tipo: "erro", conceito: "melodia", pergunta: "Toque numa repetição do clímax.",
                  partitura: "melodia: D4/1 F4 A4 G4 A4 F4 E4 D4 D4/4", alvo: [[0, 2], [0, 4]], regra: "ponto_culminante",
                  explica: "O lá aparece duas vezes. Mude uma delas para ter um clímax único." },
                { tipo: "escolha", conceito: "melodia", pergunta: "Onde o clímax costuma ficar numa frase?",
                  opcoes: ["Na primeira nota", "Entre a metade e os dois terços", "Na última nota"], certa: 1,
                  explica: "Subir até perto dos 2/3 e voltar dá à frase um arco equilibrado." },
              ],
            },
            {
              id: "n1u4l2", titulo: "Graus e saltos",
              cartoes: [
                { tipo: "conceito", titulo: "Salto e preenchimento",
                  texto: "A melodia anda mais por <b>graus conjuntos</b> (notas vizinhas) do que por saltos. Depois de um salto de 4ª ou mais, ela <b>volta por grau</b> na direção contrária: preenche o espaço que abriu.",
                  partitura: "melodia: C4/1 G4 F4 E4 D4 E4 D4 C4 C4/4", anotacoes: [[0, 1, "salto"], [0, 2, "volta"]] },
                { tipo: "erro", conceito: "saltos", pergunta: "Toque na nota em que o salto não foi compensado.",
                  partitura: "melodia: D4/1 A4 B4 C5 B4 A4 G4 F4 E4/4", alvo: [[0, 2]], regra: "salto_nao_compensado",
                  explica: "Depois do salto D4→A4 (5ª), a melodia continua subindo para B4. Devia voltar por grau." },
                { tipo: "escolha", conceito: "saltos", pergunta: "Quais saltos o estilo estrito proíbe?",
                  opcoes: ["3ª e 4ª", "7ª e trítono", "5ª e 8ª"], certa: 1,
                  explica: "7ªs e o trítono são difíceis de cantar e soam instáveis." },
                { tipo: "escolha", conceito: "saltos", pergunta: "Depois de E4 → C5 (6ª menor subindo), qual continuação preenche o salto?",
                  opcoes: ["D5", "B4", "E5", "G4"], certa: 1,
                  explica: "B4 volta um grau, na direção contrária ao salto." },
                { tipo: "vf", conceito: "saltos", pergunta: "Num cantus firmus, dois saltos seguidos na mesma direção (C4 → E4 → A4) são bem-vindos.", certa: false,
                  explica: "Falso: dois saltos na mesma direção somam um intervalo grande. A única exceção são duas 3ªs, que formam um acorde." },
              ],
            },
            {
              id: "n1u4l3", titulo: "O cantus firmus",
              cartoes: [
                { tipo: "conceito", titulo: "A melodia-base",
                  texto: "O <b>cantus firmus</b> é uma melodia só de semibreves, base do contraponto. Tem 8 a 14 notas, começa e termina na final, chega a ela por grau, tem um único clímax e poucos saltos, sempre compensados.",
                  partitura: "tom: D dorico\ncantus: " + CF_FUX, anotacoes: [[0, 6, "clímax"], [0, 10, "final"]] },
                { tipo: "escolha", conceito: "cantus", pergunta: "Qual é a penúltima nota ideal de um cantus firmus em dó?", opcoes: ["G", "D", "F", "A"], certa: 1,
                  explica: "Ré → dó: a chegada à final por grau conjunto." },
                { tipo: "erro", conceito: "cantus", pergunta: "Este cantus firmus termina mal. Toque na nota do problema.",
                  partitura: "tom: C maior\ncantus: C4/4 E4 D4 F4 E4 G4 A4 G4 F4 E4 C4", alvo: [[0, 10]], regra: "cf_chegada",
                  explica: "Ele chega à final por salto (mi → dó). A penúltima nota devia ser ré." },
                { tipo: "vf", conceito: "cantus", pergunta: "Um cantus firmus deve ter um único clímax.", certa: true,
                  explica: "Verdadeiro: um só ponto mais agudo dá forma de arco à melodia." },
              ],
            },
          ],
          praticas: [
            { id: "n1p1", titulo: "Compor um cantus firmus", tipo: "cantus",
              instrucoes: "<p>Escreva um cantus firmus em <b>dó maior</b>, só com semibreves: 8 a 14 notas, começando e terminando em dó, chegando ao final por ré → dó, com um único clímax e saltos compensados.</p><p>Quando acabar, toque em <b>Terminei</b>.</p>",
              texto: "tom: C maior\ncantus:", duracao: 4, fimLivre: true,
              perfil: { so_semibreves: "erro", cf_final: "erro", cf_chegada: "erro", cf_tamanho: "erro", cf_saltos_seguidos: "erro",
                cf_salto_recuperado: "erro", contorno_tritono: "erro", salto_maior_que_oitava: "erro", intervalo_melodico_aumentado_diminuto: "erro",
                salto_de_sexta_ou_setima: "erro", nota_repetida: "erro", ponto_culminante: "erro", ambito_melodico: "aviso" },
              solucao: "tom: C maior\ncantus: C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4",
              autoavaliacao: ["Cantei a melodia inteira sem dificuldade?", "Dá para sentir o arco subindo até o clímax e voltando?"] },
          ],
        },
        {
          id: "n1u5", titulo: "Movimento",
          licoes: [
            {
              id: "n1u5l1", titulo: "Os quatro movimentos",
              cartoes: [
                { tipo: "conceito", titulo: "Como duas vozes andam",
                  texto: "<b>Contrário</b>: uma sobe, a outra desce. <b>Oblíquo</b>: uma fica parada. <b>Direto</b>: as duas na mesma direção. <b>Paralelo</b>: mesma direção e mesmo intervalo. O contrário é o que mais dá independência.",
                  partitura: "compasso: 2/2\nsup: E4/2 F4 E4 F4 E4 A4 E4 F4\ninf: C4/2 A3 C4 C4 C4 D4 C4 D4",
                  cifras: [[0, "contrário"], [4, "oblíquo"], [8, "direto"], [12, "paralelo"]] },
                { tipo: "gerado", gerador: "movimento", quantos: 5 },
                { tipo: "escolha", conceito: "movimento", pergunta: "Qual movimento deixa as vozes mais independentes?",
                  opcoes: ["Paralelo", "Contrário", "Direto"], certa: 1,
                  explica: "Indo em direções opostas, cada voz tem seu próprio desenho." },
              ],
            },
            {
              id: "n1u5l2", titulo: "Paralelas e diretas",
              cartoes: [
                { tipo: "conceito", titulo: "Quando as vozes se fundem",
                  texto: "Duas <b>5ªs seguidas</b> (ou duas 8ªs) fazem as vozes soarem como uma só, dobrada: são proibidas. E no contraponto estrito não se chega a uma 5ª ou 8ª com as duas vozes na mesma direção (<b>5ª ou 8ª direta</b>).",
                  partitura: "sup: A4/4 B4\ninf: D4/4 E4", anotacoes: [[0, 0, "5ª"], [0, 1, "5ª"]] },
                { tipo: "gerado", gerador: "paralelas", quantos: 4 },
                { tipo: "erro", conceito: "paralelas", pergunta: "Toque na nota de cima que chega à 5ª direta.",
                  partitura: "sup: E4/4 A4\ninf: C4/4 D4", alvo: [[0, 1]], regra: "quintas_oitavas_ocultas",
                  explica: "As duas vozes sobem e chegam juntas à 5ª lá–ré. Por movimento contrário, estaria certo." },
                { tipo: "vf", conceito: "paralelas", pergunta: "Duas 3ªs paralelas seguidas são proibidas.", certa: false,
                  explica: "Falso: 3ªs e 6ªs paralelas são permitidas. Só evite mais de três seguidas." },
                { tipo: "escolha", conceito: "paralelas", pergunta: "Para chegar a uma 8ª, que movimento é permitido?",
                  opcoes: ["Qualquer um", "Só contrário ou oblíquo", "Só paralelo"], certa: 1,
                  explica: "É a regra de Fux: consonância perfeita só por movimento contrário ou oblíquo." },
              ],
            },
          ],
        },
        {
          id: "n1u6", titulo: "Primeira espécie",
          licoes: [
            {
              id: "n1u6l1", titulo: "Começo e fim",
              cartoes: [
                { tipo: "conceito", titulo: "Nota contra nota",
                  texto: "Na <b>1ª espécie</b>, cada nota do contraponto soa contra uma nota do cantus firmus, só com consonâncias. Começa em 8ª, 5ª ou uníssono; se o contraponto estiver embaixo, só 8ª ou uníssono." },
                { tipo: "conceito", titulo: "A cadência",
                  texto: "No fim, as vozes se encontram por grau em movimento contrário: <b>6ª maior → 8ª</b> (contraponto em cima) ou <b>3ª menor → uníssono</b> (embaixo). Em ré dórico isso pede o dó sustenido, a sensível.",
                  partitura: "tom: D dorico\ncontraponto: D5/4 C#5 D5\ncantus: F4/4 E4 D4", anotacoes: [[0, 1, "6ª M"], [0, 2, "8ª"]] },
                { tipo: "escolha", conceito: "cadencia_cp", pergunta: "O contraponto está acima do cantus firmus. Que intervalo vem antes da 8ª final?",
                  opcoes: ["5ª justa", "6ª maior", "3ª menor"], certa: 1, explica: "6ª maior → 8ª, por grau e em movimento contrário." },
                { tipo: "tocar", conceito: "cadencia_cp", pergunta: "O cantus firmus faz E4 → D4 e o contraponto termina em D5. Toque a nota do contraponto sobre o E4.",
                  aceita: ["C#5"], explica: "C#5 forma 6ª maior com E4 e sobe meio tom para D5." },
                { tipo: "escolha", conceito: "inicio_cp", pergunta: "O contraponto está abaixo do cantus firmus, que começa em D4. Qual pode ser a primeira nota do contraponto?",
                  opcoes: ["G3", "D3", "A3", "F3"], certa: 1,
                  explica: "Embaixo, só 8ª ou uníssono: D3. G3 seria a 5ª abaixo, que tira o baixo da final." },
              ],
            },
            {
              id: "n1u6l2", titulo: "Juntando tudo",
              cartoes: [
                { tipo: "conceito", titulo: "Um exemplo de Fux",
                  texto: "Toque ▶ e acompanhe os intervalos: começa na 5ª, usa mais 3ªs e 6ªs no meio, chega a toda consonância perfeita por movimento contrário e termina 6ª → 8ª.",
                  partitura: "tom: D dorico\ncf: cantus\ncontraponto: A4/4 A4 G4 A4 B4 C5 C5 B4 D5 C#5 D5\ncantus: " + CF_FUX,
                  anotacoes: [[0, 0, "5"], [0, 1, "3"], [0, 2, "3"], [0, 3, "5"], [0, 4, "3"], [0, 5, "5"], [0, 6, "3"], [0, 7, "3"], [0, 8, "6"], [0, 9, "6"], [0, 10, "8"]] },
                { tipo: "erro", conceito: "paralelas", pergunta: "Há 5ªs paralelas aqui. Toque na segunda 5ª.",
                  partitura: "tom: D dorico\ncontraponto: A4/4 B4 A4 C#5 D5\ncantus: D4/4 E4 F4 E4 D4", alvo: [[0, 1]], regra: "quintas_paralelas",
                  explica: "Lá–ré e depois si–mi: duas 5ªs seguidas. Troque o si por uma nota que forme 3ª ou 6ª." },
                { tipo: "erro", conceito: "consonancia", pergunta: "Uma nota forma dissonância com o cantus firmus. Toque nela.",
                  partitura: "tom: D dorico\ncontraponto: A4/4 A4 D5 C#5 D5\ncantus: D4/4 F4 A4 E4 D4", alvo: [[0, 2]], regra: "dissonancia_proibida",
                  explica: "Ré sobre lá é uma 4ª: na 1ª espécie, a duas vozes, conta como dissonância." },
                { tipo: "escolha", conceito: "primeira_especie", pergunta: "Que consonâncias devem predominar no meio do exercício?",
                  opcoes: ["As perfeitas (5ª, 8ª)", "As imperfeitas (3ª, 6ª)"], certa: 1,
                  explica: "Fux: mais imperfeitas que perfeitas. Elas soam cheias; as perfeitas, vazias." },
                { tipo: "erro", conceito: "paralelas", pergunta: "Toque na nota que chega a uma 8ª direta.",
                  partitura: "tom: C maior\ncontraponto: G4/4 B4 E5 B4 C5\ncantus: C4/4 D4 E4 D4 C4", alvo: [[0, 2]], regra: "quintas_oitavas_ocultas",
                  explica: "Si → mi sobe enquanto ré → mi também sobe: as duas chegam à 8ª na mesma direção." },
              ],
            },
          ],
          praticas: [
            { id: "n1p2", titulo: "1ª espécie acima (com ajuda)", tipo: "especie",
              instrucoes: "<p>O cantus firmus de Fux está embaixo. As cinco primeiras notas do contraponto já estão escritas: <b>complete as outras seis</b>, uma semibreve por compasso, só com consonâncias.</p><p>Lembre da cadência: 6ª maior → 8ª (dó♯ → ré).</p>",
              texto: "tom: D dorico\ncf: cantus\ncontraponto: A4/4 A4 G4 A4 B4\ncantus: " + CF_FUX,
              duracao: 4, nivel: 1, perfilNivel: 1, extras: { climax_coincidente: "aviso" },
              solucao: "tom: D dorico\ncf: cantus\ncontraponto: A4/4 A4 G4 A4 B4 C5 C5 B4 D5 C#5 D5\ncantus: " + CF_FUX,
              autoavaliacao: ["Cantei o contraponto sozinho?", "As duas vozes se movem mais em direções opostas?"] },
            { id: "n1p3", titulo: "1ª espécie abaixo", tipo: "especie", sortear: true,
              instrucoes: "<p>Agora sem ajuda e com o contraponto <b>embaixo</b> do cantus firmus. Comece em 8ª ou uníssono e termine 3ª menor → uníssono (ou 10ª → 8ª).</p>",
              texto: "tom: C maior\ncf: cantus\ncantus: C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4\ncontraponto:",
              posicao: "abaixo", duracao: 4, nivel: 1, perfilNivel: 1, extras: { climax_coincidente: "aviso" },
              solucao: "tom: C maior\ncf: cantus\ncantus: C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4\ncontraponto: C3/4 B2 D3 E3 B3 E3 F3 A3 B3 C4",
              autoavaliacao: ["Cantei o contraponto sozinho?", "O contraponto tem um desenho próprio, com seu clímax (aqui, o ponto mais grave também conta)?"] },
          ],
        },
      ],
    },

    // ============================================================== NÍVEL 2
    {
      id: "n2", titulo: "Passagem e frase",
      resumo: "Tempo forte e fraco, a 2ª espécie, os primeiros acordes e cadências, o motivo e o período.",
      unidades: [
        {
          id: "n2u1", titulo: "Tempo forte e fraco",
          licoes: [
            {
              id: "n2u1l1", titulo: "Métrica",
              cartoes: [
                { tipo: "conceito", titulo: "Forte e fraco",
                  texto: "Em <b>2/2</b> contamos duas mínimas por compasso: a primeira é o <b>tempo forte</b>, a segunda o <b>tempo fraco</b>. É nos tempos fortes que o ouvido acompanha a harmonia.",
                  partitura: "compasso: 2/2\nv: C4/2 E4 D4 F4 E4 G4 C5/4", anotacoes: [[0, 0, "forte"], [0, 1, "fraco"], [0, 2, "forte"], [0, 3, "fraco"]] },
                { tipo: "escolha", conceito: "metrica", pergunta: "Em 2/2, a segunda mínima do compasso está no:", opcoes: ["tempo forte", "tempo fraco"], certa: 1,
                  explica: "O primeiro tempo é o forte; o segundo, o fraco." },
                { tipo: "escolha", conceito: "metrica", pergunta: "Em 4/4, qual tempo é o mais forte?", opcoes: ["1º", "2º", "3º", "4º"], certa: 0,
                  explica: "O 1º é o mais forte; o 3º é um forte secundário; o 2º e o 4º são fracos." },
              ],
            },
            {
              id: "n2u1l2", titulo: "A nota de passagem",
              cartoes: [
                { tipo: "conceito", titulo: "Dissonância a caminho",
                  texto: "Com duas notas por compasso, o tempo fraco pode ter uma <b>dissonância</b>, desde que seja <b>nota de passagem</b>: chega por grau e continua por grau na mesma direção, ligando duas consonâncias.",
                  partitura: "compasso: 2/2\ncontraponto: A4/2 G4 F4/4\ncantus: D4/4 D4", anotacoes: [[0, 0, "5ª"], [0, 1, "4ª passagem"], [0, 2, "3ª"]] },
                { tipo: "erro", conceito: "passagem", pergunta: "Esta dissonância não é nota de passagem. Toque nela.",
                  partitura: "compasso: 2/2\ntom: D dorico\ncontraponto: A4/2 G4 A4 D5 E5 C#5 D5/4\ncantus: D4/4 F4 E4 D4", alvo: [[0, 1]], regra: "bordadura_na_2a_especie",
                  explica: "Lá → sol → lá volta para a mesma nota: é uma bordadura, que na 2ª espécie não pode ser dissonante." },
                { tipo: "vf", conceito: "passagem", pergunta: "Na 2ª espécie o tempo forte pode ser dissonante se chegar por grau.", certa: false,
                  explica: "Falso: o tempo forte é sempre consonante." },
                { tipo: "escolha", conceito: "passagem", pergunta: "O baixo segura C4. A linha de cima é E4 – ? – G4. Qual nota do meio é uma passagem correta?",
                  opcoes: ["F4", "D4", "A4"], certa: 0, explica: "Mi → fá → sol: por grau, na mesma direção. O fá (4ª sobre dó) é a dissonância de passagem." },
              ],
            },
          ],
        },
        {
          id: "n2u2", titulo: "Segunda espécie",
          licoes: [
            {
              id: "n2u2l1", titulo: "Regras da 2ª espécie",
              cartoes: [
                { tipo: "conceito", titulo: "Duas contra uma",
                  texto: "Começa com <b>pausa de mínima</b> (ou direto na nota). Tempo forte sempre consonante; dissonância só de passagem; sem notas repetidas; evite 5ªs ou 8ªs em tempos fortes seguidos. Cadência em cima: 5ª → 6ª maior → 8ª.",
                  partitura: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 D5/2 C5 A4 G4 C5 B4 A4 B4 C5 D5 F5 E5 C5 B4 D5 A4 D5 E5 C#5 D5/4\ncantus: " + CF_FUX },
                { tipo: "erro", conceito: "segunda_especie", pergunta: "Duas 5ªs caem em tempos fortes seguidos. Toque na segunda.",
                  partitura: "compasso: 2/2\ntom: D dorico\ncontraponto: A4/2 F4 B4 G4 A4 C5 E5 C#5 D5/4\ncantus: D4/4 E4 F4 E4 D4", alvo: [[0, 2]], regra: "quintas_tempo_forte",
                  explica: "Lá–ré no compasso 1 e si–mi no compasso 2: 5ªs em tempos fortes seguidos soam como paralelas." },
                { tipo: "escolha", conceito: "segunda_especie", pergunta: "Como a 2ª espécie costuma começar?",
                  opcoes: ["Com pausa de mínima", "Com uma dissonância", "Com uma semibreve"], certa: 0,
                  explica: "A pausa deixa o cantus firmus soar sozinho e o contraponto entra no tempo fraco." },
                { tipo: "vf", conceito: "segunda_especie", pergunta: "Na 2ª espécie pode-se repetir a mesma nota no tempo fraco.", certa: false,
                  explica: "Falso: a repetição anula o movimento de duas notas contra uma." },
                { tipo: "escolha", conceito: "segunda_especie", pergunta: "Em ré dórico, com o cantus E4 → D4 e o contraponto em cima, qual é a cadência?",
                  opcoes: ["A4 C#5 | D5", "G4 B4 | D5", "A4 B4 | C5"], certa: 0,
                  explica: "5ª (lá), 6ª maior (dó♯) e 8ª (ré)." },
              ],
            },
          ],
          praticas: [
            { id: "n2p1", titulo: "2ª espécie", tipo: "especie", sortear: true,
              instrucoes: "<p>Escreva um contraponto de <b>2ª espécie acima</b> do cantus firmus: duas mínimas por compasso (pode começar com pausa de mínima), última nota em semibreve.</p>",
              texto: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto:\ncantus: " + CF_FUX,
              duracao: 2, nivel: 2, perfilNivel: 2, extras: { climax_coincidente: "aviso" },
              solucao: "compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 D5/2 C5 A4 G4 C5 B4 A4 B4 C5 D5 F5 E5 C5 B4 D5 A4 D5 E5 C#5 D5/4\ncantus: " + CF_FUX,
              autoavaliacao: ["As dissonâncias soam como passagem, e não como choque?", "Cantei o contraponto sozinho?"] },
          ],
        },
        {
          id: "n2u3", titulo: "Acordes e cadências",
          licoes: [
            {
              id: "n2u3l1", titulo: "Tríades e funções",
              cartoes: [
                { tipo: "conceito", titulo: "Três acordes principais",
                  texto: "Uma <b>tríade</b> é uma pilha de duas 3ªs: dó–mi–sol é o acorde de dó maior. Em dó maior, os acordes principais são <b>I</b> (C–E–G), <b>IV</b> (F–A–C) e <b>V</b> (G–B–D).",
                  partitura: "tom: C maior\na: G4/4 A4 B4 G4\nb: E4/4 F4 G4 E4\nc: C4/4 C4 D4 C4", cifras: [[0, "I"], [4, "IV"], [8, "V"], [12, "I"]] },
                { tipo: "conceito", titulo: "Funções",
                  texto: "<b>I</b> é a casa (tônica, T). <b>IV</b> prepara (pré-dominante, PD). <b>V</b> cria tensão e pede a volta (dominante, D). A frase típica anda <b>T → PD → D → T</b>." },
                { tipo: "gerado", gerador: "acorde_da_nota", quantos: 4 },
                { tipo: "escolha", conceito: "acordes", pergunta: "Qual acorde tem função de dominante em dó maior?", opcoes: ["C", "F", "G"], certa: 2,
                  explica: "O G (V) contém a sensível B, que puxa para C." },
                { tipo: "vf", conceito: "acordes", pergunta: "V → IV é uma progressão típica do estilo clássico.", certa: false,
                  explica: "Falso: voltar da dominante para a pré-dominante desfaz a tensão sem resolver. O V vai para o I." },
              ],
            },
            {
              id: "n2u3l2", titulo: "Cadências",
              cartoes: [
                { tipo: "conceito", titulo: "A pontuação da frase",
                  texto: "<b>Cadência autêntica perfeita</b>: V → I com a tônica na melodia; soa como ponto final. <b>Semicadência</b>: a frase para no V; soa como vírgula, uma pergunta.",
                  partitura: "tom: C maior\nmelodia: E4/2 D4 C4/4 E4/2 F4 D4/4\nbaixo: C3/2 G2 C3/4 C3/2 F2 G2/4", cifras: [[0, "I"], [2, "V"], [4, "I"], [8, "I"], [10, "IV"], [12, "V"]] },
                { tipo: "gerado", gerador: "cadencia_ouvido", quantos: 3 },
                { tipo: "escolha", conceito: "cadencias", pergunta: "Uma frase termina no acorde de V. Que cadência é?",
                  opcoes: ["Autêntica perfeita", "Semicadência", "Plagal"], certa: 1, explica: "Parar na dominante é a semicadência." },
                { tipo: "escolha", conceito: "cadencias", pergunta: "Em dó maior, em que nota a melodia termina na cadência autêntica perfeita?",
                  opcoes: ["G", "C", "D", "B"], certa: 1, explica: "Na autêntica perfeita a melodia chega à tônica, dó." },
              ],
            },
          ],
        },
        {
          id: "n2u4", titulo: "Motivo",
          licoes: [
            {
              id: "n2u4l1", titulo: "Repetir, transpor, inverter",
              cartoes: [
                { tipo: "conceito", titulo: "A ideia curta",
                  texto: "Um <b>motivo</b> é uma ideia curta que o ouvido reconhece. A <b>sequência</b> repete o motivo começando em outra nota, como os degraus de uma escada.",
                  partitura: "melodia: C4/1 E4 D4 F4 D4 F4 E4 G4 E4 G4 F4 A4 G4/4", anotacoes: [[0, 0, "motivo"], [0, 4, "sequência"], [0, 8, "sequência"]] },
                { tipo: "conceito", titulo: "Outras transformações",
                  texto: "<b>Inversão</b>: os intervalos trocam de direção (dó↑mi↑sol vira dó↓lá↓fá). <b>Aumentação</b>: mesmas notas, valores dobrados. <b>Fragmentação</b>: repetir só um pedaço do motivo." },
                { tipo: "escolha", conceito: "motivo", pergunta: "Que técnica aparece no compasso 2?",
                  partitura: "melodia: E4/1 F4 G4 E4 F4 G4 A4 F4 C5/4", opcoes: ["Repetição", "Sequência", "Inversão"], certa: 1,
                  explica: "Mi–fá–sol–mi vira fá–sol–lá–fá: o mesmo desenho um grau acima." },
                { tipo: "escolha", conceito: "motivo", pergunta: "E aqui, no compasso 2?",
                  partitura: "melodia: C4/1 E4 G4/2 C4/1 A3 F3/2", opcoes: ["Sequência", "Inversão", "Aumentação"], certa: 1,
                  explica: "Dó–mi–sol sobe em 3ªs; dó–lá–fá desce em 3ªs: é a inversão." },
                { tipo: "tocar", conceito: "motivo", pergunta: "O motivo C4–E4–D4 foi repetido um grau acima: D4–F4–E4. Toque a primeira nota do próximo degrau.",
                  aceita: ["E4"], explica: "Cada degrau sobe um grau: dó, ré, mi." },
              ],
            },
          ],
          praticas: [
            { id: "n2p2", titulo: "Motivo em sequência", tipo: "melodia",
              instrucoes: "<p>O compasso 1 traz um motivo. Escreva os compassos <b>2 e 3</b> como sequência dele: mesmo ritmo e mesmo desenho, um grau acima a cada vez. No compasso 4, chegue ao <b>dó</b> por grau.</p>",
              texto: "tom: C maior\nmelodia: C4/1 E4 D4 F4", duracao: 1, alvoCompassos: 4,
              contexto: { motivo: { de: 1, em: [2, 3] }, finalLivre: true },
              perfil: { sequencia_do_motivo: "erro", cadencia_final: "erro", salto_maior_que_oitava: "erro", intervalo_melodico_aumentado_diminuto: "erro" },
              solucao: "tom: C maior\nmelodia: C4/1 E4 D4 F4 D4 F4 E4 G4 E4 G4 F4 A4 B4/2 C5",
              autoavaliacao: ["O motivo continua reconhecível em cada degrau?", "O final soa como chegada?"] },
          ],
        },
        {
          id: "n2u5", titulo: "Pergunta e resposta",
          licoes: [
            {
              id: "n2u5l1", titulo: "O período",
              cartoes: [
                { tipo: "conceito", titulo: "Duas frases",
                  texto: "O <b>período</b> tem duas frases de 4 compassos. A primeira (antecedente) termina em <b>semicadência</b>: uma pergunta. A segunda (consequente) começa igual e termina na tônica, em <b>cadência perfeita</b>: a resposta.",
                  partitura: "tom: C maior\nmelodia: " + PERIODO, cifras: ACORDES_PERIODO.map((a, i) => [i * 4, a]),
                  anotacoes: [[0, 11, "pergunta"], [0, 24, "resposta"]] },
                { tipo: "escolha", conceito: "periodo", pergunta: "Em que grau a pergunta costuma terminar?",
                  opcoes: ["No 1º (tônica)", "No 2º, 5º ou 7º, sobre o V"], certa: 1, explica: "Parar sobre a dominante deixa a frase em aberto." },
                { tipo: "escolha", conceito: "periodo", pergunta: "Como começa a resposta num período paralelo?",
                  opcoes: ["Com uma ideia nova", "Igual (ou quase igual) à pergunta"], certa: 1,
                  explica: "A repetição faz o ouvinte reconhecer a resposta: mesma pergunta, final diferente." },
                { tipo: "erro", conceito: "periodo", pergunta: "Esta resposta termina no lugar errado. Toque na nota do problema.",
                  partitura: "tom: C maior\nmelodia: C4/1 E4 G4 E4 F4 A4 C5 A4 G4/2 E4 B3 D4 C4/1 E4 G4 E4 F4 A4 C5 A4 B4 G4 F4 D4 E4/4",
                  alvo: [[0, 24]], regra: "cadencia_final", explica: "A resposta termina em mi, e não na tônica dó." },
                { tipo: "vf", conceito: "periodo", pergunta: "A cadência mais forte do período fica no fim do antecedente.", certa: false,
                  explica: "Falso: a mais forte (autêntica perfeita) fica no fim do consequente." },
              ],
            },
          ],
          praticas: [
            { id: "n2p3", titulo: "Completar o consequente", tipo: "melodia",
              instrucoes: "<p>A pergunta (compassos 1–4) já está escrita e termina em semicadência. Escreva a <b>resposta</b> (compassos 5–8): comece igual à pergunta e termine no <b>dó</b>, no primeiro tempo do compasso 8, vindo do ré ou do si.</p><p>Os acordes estão acima da pauta: nos tempos fortes, use notas deles.</p>",
              texto: "tom: C maior\nmelodia: C4/1 E4 G4 E4 F4 A4 C5 A4 G4/2 E4 B3 D4", duracao: 1, alvoCompassos: 8,
              acordes: ACORDES_PERIODO, contexto: { plano: { semicadencia: 4, repete: [1, 5] } },
              perfil: { notas_do_acorde: "erro", semicadencia: "erro", cadencia_final: "erro", ideia_repetida: "erro",
                salto_maior_que_oitava: "erro", intervalo_melodico_aumentado_diminuto: "erro", salto_nao_compensado: "aviso" },
              solucao: "tom: C maior\nmelodia: " + PERIODO,
              autoavaliacao: ["A resposta soa como resposta à pergunta?", "Cantei o período inteiro?"] },
          ],
        },
      ],
    },

    // ============================================================== NÍVEL 3
    {
      id: "n3", titulo: "Movimento e harmonia",
      resumo: "Bordaduras e cambiata, a 3ª espécie, a moldura soprano–baixo e o período sobre um baixo.",
      unidades: [
        {
          id: "n3u1", titulo: "Bordaduras e cambiata",
          licoes: [
            {
              id: "n3u1l1", titulo: "Bordadura e bordadura dupla",
              cartoes: [
                { tipo: "conceito", titulo: "Quatro contra uma",
                  texto: "Na <b>3ª espécie</b> há quatro notas por compasso. Além da passagem, a dissonância pode ser <b>bordadura</b>: sai por grau e volta para a mesma nota (dó–ré–dó).",
                  partitura: "contraponto: C4/1 D4 C4 E4 F4/4\ncantus: A3/4 D4", anotacoes: [[0, 1, "bordadura"]] },
                { tipo: "conceito", titulo: "Bordadura dupla",
                  texto: "A <b>bordadura dupla</b> visita as duas vizinhas antes de voltar: dó–ré–si–dó. As duas notas do meio podem ser dissonantes.",
                  partitura: "contraponto: C4/1 D4 B3 C4 D4/4\ncantus: A3/4 B3", anotacoes: [[0, 1, "vizinha de cima"], [0, 2, "vizinha de baixo"]] },
                { tipo: "escolha", conceito: "bordaduras", pergunta: "Qual destas linhas é uma bordadura dupla?",
                  opcoes: ["mi–fá–ré–mi", "mi–fá–sol–lá", "mi–ré–dó–ré"], certa: 0, explica: "Sai de mi, visita fá e ré (as duas vizinhas) e volta para mi." },
                { tipo: "vf", conceito: "terceira_especie", pergunta: "Na 3ª espécie, a primeira semínima do compasso pode ser dissonante.", certa: false,
                  explica: "Falso: o primeiro tempo é sempre consonante." },
              ],
            },
            {
              id: "n3u1l2", titulo: "A cambiata",
              cartoes: [
                { tipo: "conceito", titulo: "A dissonância que salta",
                  texto: "A <b>cambiata</b> tem cinco notas: desce por grau para uma dissonância, salta uma 3ª para baixo e sobe por grau. É a única dissonância que sai por salto.",
                  partitura: "tom: D dorico\ncontraponto: E5/1 D5 B4 C#5 D5/4\ncantus: E4/4 D4", anotacoes: [[0, 1, "dissonância"], [0, 2, "salto de 3ª"]] },
                { tipo: "escolha", conceito: "cambiata", pergunta: "Depois da nota dissonante, a cambiata:",
                  opcoes: ["sobe por grau", "salta uma 3ª para baixo", "salta uma 5ª"], certa: 1, explica: "Salta uma 3ª para baixo e depois volta subindo por grau." },
                { tipo: "tocar", conceito: "cambiata", pergunta: "Complete a cambiata sobre o cantus E4: E5 – D5 – ? – C#5 – D5.", aceita: ["B4"],
                  explica: "Do ré, uma 3ª para baixo: si. Depois dó♯ e ré, subindo por grau." },
                { tipo: "vf", conceito: "cambiata", pergunta: "A escapada (chega por grau e sai por salto) é permitida na espécie estrita.", certa: false,
                  explica: "Falso: só passagem, bordadura, bordadura dupla e cambiata." },
              ],
            },
          ],
        },
        {
          id: "n3u2", titulo: "Terceira espécie",
          licoes: [
            {
              id: "n3u2l1", titulo: "Regras da 3ª espécie",
              cartoes: [
                { tipo: "conceito", titulo: "Quatro semínimas",
                  texto: "Tempo 1 sempre consonante; tempos 2, 3 e 4 podem ter passagem, bordadura, bordadura dupla ou cambiata. Cuidado: uma 5ª no fim do compasso seguida de outra 5ª no tempo forte seguinte também soa como paralela." },
                { tipo: "erro", conceito: "terceira_especie", pergunta: "Há uma 5ª no 3º tempo e outra no tempo forte seguinte. Toque na do tempo forte.",
                  partitura: "contraponto: F4/1 G4 A4 B4 C5/4\ncantus: D4/4 F4", alvo: [[0, 4]], regra: "paralelas_entre_tempos",
                  explica: "Lá–ré no 3º tempo e dó–fá no tempo forte seguinte: 5ªs perto demais." },
                { tipo: "escolha", conceito: "bordaduras", pergunta: "Na 3ª espécie, a figura dó–ré–si–dó é:",
                  opcoes: ["bordadura dupla", "cambiata", "um erro"], certa: 0, explica: "Visita as duas vizinhas e volta: bordadura dupla." },
                { tipo: "vf", conceito: "terceira_especie", pergunta: "Na 3ª espécie é melhor saltar dentro do compasso do que através da barra.", certa: true,
                  explica: "Verdadeiro: saltar através da barra chama atenção para o tempo forte." },
              ],
            },
          ],
          praticas: [
            { id: "n3p1", titulo: "3ª espécie", tipo: "especie", sortear: true,
              instrucoes: "<p>Escreva um contraponto de <b>3ª espécie acima</b> do cantus firmus: quatro semínimas por compasso, última nota em semibreve.</p>",
              texto: "tom: D dorico\ncf: cantus\ncontraponto:\ncantus: " + CF_FUX,
              duracao: 1, nivel: 3, perfilNivel: 3, extras: { climax_coincidente: "aviso", paralelas_entre_tempos: "erro" },
              autoavaliacao: ["O contraponto flui sem saltos demais?", "Cantei o contraponto sozinho?"] },
          ],
        },
        {
          id: "n3u3", titulo: "Soprano e baixo",
          licoes: [
            {
              id: "n3u3l1", titulo: "A nota escolhe o acorde",
              cartoes: [
                { tipo: "conceito", titulo: "Harmonizar",
                  texto: "Para harmonizar uma melodia, olhe a nota do tempo forte e procure um acorde que a contenha. Em dó maior: dó, mi ou sol → <b>I</b>; fá, lá ou dó → <b>IV</b>; sol, si ou ré → <b>V</b>." },
                { tipo: "gerado", gerador: "acorde_da_nota", quantos: 4 },
                { tipo: "escolha", conceito: "acordes", pergunta: "A melodia tem dó no tempo forte. Quais acordes servem?", opcoes: ["Só I", "I ou IV", "V"], certa: 1,
                  explica: "Dó está em I (C–E–G) e em IV (F–A–C)." },
                { tipo: "escolha", conceito: "acordes", pergunta: "E se a nota for si?", opcoes: ["I", "IV", "V"], certa: 2, explica: "Si só aparece no V (G–B–D)." },
              ],
            },
            {
              id: "n3u3l2", titulo: "O baixo e a cadência",
              cartoes: [
                { tipo: "conceito", titulo: "A segunda melodia",
                  texto: "O baixo começa na tônica e termina com <b>5 → 1</b> (sol → dó): é essa queda que diz 'acabou'. Entre soprano e baixo valem as regras do contraponto: nada de 5ªs ou 8ªs paralelas; prefira o movimento contrário.",
                  partitura: "tom: C maior\nmelodia: E5/4 F5 D5 E5 C5 A4 B4 C5\nbaixo: C3/4 F3 G3 C3 F3 F3 G3 C3",
                  cifras: [[0, "I"], [4, "IV"], [8, "V"], [12, "I"], [16, "IV"], [20, "IV"], [24, "V"], [28, "I"]] },
                { tipo: "conceito", titulo: "Moldes prontos",
                  texto: "Os compositores do século XVIII usavam moldes de soprano e baixo. <b>Do-Re-Mi</b>: a melodia sobe dó–ré–mi sobre o baixo dó–si–dó. <b>Prinner</b>: a melodia desce lá–sol–fá–mi sobre o baixo fá–mi–ré–dó.",
                  partitura: "tom: C maior\nsoprano: C5/2 D5 E5/4 A4/2 G4 F4 E4\nbaixo: C3/2 B2 C3/4 F3/2 E3 D3 C3", cifras: [[0, "Do-Re-Mi"], [8, "Prinner"]] },
                { tipo: "escolha", conceito: "esquemas", pergunta: "Qual é o baixo do Prinner?", opcoes: ["dó–si–dó", "fá–mi–ré–dó", "sol–dó"], certa: 1,
                  explica: "4–3–2–1 no baixo, com a melodia 6–5–4–3 em 10ªs." },
                { tipo: "erro", conceito: "paralelas", pergunta: "Encontre a 8ª paralela entre soprano e baixo.",
                  partitura: "tom: C maior\nsoprano: E5/4 F5 G5\nbaixo: C3/4 F3 G3", alvo: [[0, 2], [1, 2]], regra: "oitavas_paralelas",
                  explica: "Fá–fá e depois sol–sol: duas 8ªs seguidas." },
              ],
            },
          ],
          praticas: [
            { id: "n3p2", titulo: "Escrever o baixo", tipo: "baixo",
              instrucoes: "<p>A melodia está pronta. Escreva o <b>baixo</b>, uma semibreve por compasso, usando só as fundamentais de <b>I (dó), IV (fá) e V (sol)</b>. O acorde de cada compasso tem que conter a nota da melodia. Comece em dó e termine sol → dó.</p>",
              texto: "tom: C maior\ncf: melodia\nmelodia: E5/4 F5 D5 E5 C5 A4 B4 C5\nbaixo:", duracao: 4, nivel: 6,
              contexto: { nivel: 6, graus: [1, 4, 5] },
              perfil: { baixo_graus: "erro", acorde_contem_melodia: "erro", baixo_cadencia: "erro", retrogressao: "erro",
                quintas_paralelas: "erro", oitavas_paralelas: "erro", quintas_oitavas_ocultas: "erro", dissonancia_proibida: "erro",
                cruzamento_de_vozes: "erro", salto_maior_que_oitava: "erro", salto_nao_compensado: "aviso" },
              solucao: "tom: C maior\ncf: melodia\nmelodia: E5/4 F5 D5 E5 C5 A4 B4 C5\nbaixo: C3/4 F3 G3 C3 F3 F3 G3 C3",
              autoavaliacao: ["Toquei as duas vozes juntas no piano?", "O baixo anda em direção contrária à melodia na maior parte do tempo?"] },
          ],
        },
        {
          id: "n3u4", titulo: "O período",
          licoes: [
            {
              id: "n3u4l1", titulo: "Notas do acorde nos tempos fortes",
              cartoes: [
                { tipo: "conceito", titulo: "Forte = acorde",
                  texto: "Com acordes, os tempos fortes da melodia usam <b>notas do acorde</b>. As outras ficam nos tempos fracos e andam por grau: passagem (dó–ré–mi sobre I) ou bordadura (dó–ré–dó).",
                  partitura: "tom: C maior\nmelodia: C4/1 D4 E4 G4 G4 A4 B4/2", cifras: [[0, "I"], [4, "V"]], anotacoes: [[0, 1, "passagem"], [0, 5, "passagem"]] },
                { tipo: "erro", conceito: "harmonia_melodia", pergunta: "Uma nota de tempo forte está fora do acorde. Toque nela.",
                  partitura: "tom: C maior\nmelodia: C4/1 D4 E4 G4 G4 B4 A4 G4", cifras: [[0, "I"], [4, "V"]], alvo: [[0, 6]], regra: "notas_do_acorde",
                  acordes: ["I", "V"], explica: "O lá cai no 3º tempo (forte) e não pertence ao acorde de V (sol–si–ré)." },
                { tipo: "escolha", conceito: "harmonia_melodia", pergunta: "Sobre o acorde de IV (fá–lá–dó), qual nota pode ficar no tempo forte?",
                  opcoes: ["sol", "lá", "si"], certa: 1, explica: "Lá é a 3ª do acorde de fá." },
              ],
            },
            {
              id: "n3u4l2", titulo: "O plano do período",
              cartoes: [
                { tipo: "conceito", titulo: "Receita",
                  texto: "1) Veja a harmonia. 2) Escreva uma ideia de 2 compassos sobre a tônica. 3) Termine a pergunta (c. 4) no 2º, 5º ou 7º grau, sobre V. 4) Repita a ideia nos c. 5–6. 5) Chegue à tônica no c. 8, vindo do ré ou do si. 6) Cante e toque." },
                { tipo: "escolha", conceito: "acordes", pergunta: "Qual é a ordem do modelo de frase?", opcoes: ["T–PD–D–T", "D–T–PD–T", "T–D–PD–T"], certa: 0,
                  explica: "Tônica, pré-dominante, dominante e de volta à tônica." },
                { tipo: "escolha", conceito: "melodia", pergunta: "Onde fica o clímax de uma frase, normalmente?", opcoes: ["Na primeira nota", "Entre a metade e os dois terços", "Na cadência"], certa: 1,
                  explica: "Perto dos 2/3 a frase ainda tem tempo de descer até a cadência." },
                { tipo: "vf", conceito: "periodo", pergunta: "Cantar a melodia antes de tocá-la ajuda a ouvir se ela funciona.", certa: true,
                  explica: "Verdadeiro: a audição interna é a base de todos os métodos (Kodály, Boulanger)." },
              ],
            },
          ],
          praticas: [
            { id: "n3p3", titulo: "Período sobre um baixo dado", tipo: "melodia",
              instrucoes: "<p>O baixo e os acordes estão prontos. Escreva uma <b>melodia de 8 compassos</b>: um período com pergunta (termina no compasso 4 em ré, sol ou si) e resposta (os compassos 5–6 repetem os compassos 1–2 e a melodia termina em dó no compasso 8).</p><p>Nos tempos fortes, use notas do acorde. Evite 5ªs e 8ªs paralelas com o baixo.</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia:\nbaixo: C3/4 F3 C3 G2 C3 F3 G2 C3", duracao: 1, alvoCompassos: 8,
              acordes: ACORDES_PERIODO, contexto: { plano: { semicadencia: 4, repete: [1, 5] } },
              perfil: { notas_do_acorde: "erro", semicadencia: "erro", cadencia_final: "erro", ideia_repetida: "erro",
                quintas_paralelas: "erro", oitavas_paralelas: "erro", cruzamento_de_vozes: "erro",
                salto_maior_que_oitava: "erro", intervalo_melodico_aumentado_diminuto: "erro", salto_nao_compensado: "aviso" },
              solucao: "tom: C maior\ncf: baixo\nmelodia: " + PERIODO + "\nbaixo: C3/4 F3 C3 G2 C3 F3 G2 C3",
              autoavaliacao: ["A melodia tem um clímax claro em cada frase?", "Cantei a melodia com o baixo tocando?", "A resposta soa como resposta?"] },
          ],
        },
      ],
    },
  ];

  // lição que ensina cada regra (para o botão "Rever" nas práticas)
  const regraParaLicao = {
    dissonancia_proibida: "n1u3l2", inicio_perfeito: "n1u6l1", final_perfeito: "n1u6l1", cadencia_contraponto: "n1u6l1",
    unissono_interno: "n1u6l1", quintas_paralelas: "n1u5l2", oitavas_paralelas: "n1u5l2", quintas_oitavas_ocultas: "n1u5l2",
    paralelas_imperfeitas_excessivas: "n1u5l2", cruzamento_de_vozes: "n1u5l1", sobreposicao_de_vozes: "n1u5l1",
    espacamento: "n1u5l1", salto_maior_que_oitava: "n1u4l2", intervalo_melodico_aumentado_diminuto: "n1u2l2",
    salto_de_sexta_ou_setima: "n1u4l2", salto_nao_compensado: "n1u4l2", saltos_consecutivos: "n1u4l2", nota_repetida: "n1u4l3",
    ponto_culminante: "n1u4l1", ambito_melodico: "n1u4l3", cf_final: "n1u4l3", cf_chegada: "n1u4l3", cf_tamanho: "n1u4l3",
    cf_saltos_seguidos: "n1u4l2", cf_salto_recuperado: "n1u4l2", contorno_tritono: "n1u4l2", so_semibreves: "n1u4l3",
    climax_coincidente: "n1u4l1", ritmo_da_especie: "n2u2l1", dissonancia_tempo_forte: "n2u1l2",
    dissonancia_aproximacao: "n2u1l2", dissonancia_resolucao: "n2u1l2", bordadura_na_2a_especie: "n2u1l2",
    retardo_nao_permitido: "n2u2l1", quintas_tempo_forte: "n2u2l1", paralelas_entre_tempos: "n3u2l1",
    notas_do_acorde: "n3u4l1", semicadencia: "n2u5l1", cadencia_final: "n2u5l1", ideia_repetida: "n2u5l1",
    sequencia_do_motivo: "n2u4l1", baixo_graus: "n3u3l1", acorde_contem_melodia: "n3u3l1", baixo_cadencia: "n3u3l2",
    retrogressao: "n2u3l1",
  };

  // conceitos revisados pela fila de revisão: gerador que cria uma pergunta nova de cada um
  const conceitos = {
    leitura: { titulo: "Ler notas", gerador: "nota_sol" },
    graus: { titulo: "Graus da escala", gerador: "grau" },
    intervalos: { titulo: "Intervalos", gerador: "intervalo_escrito" },
    consonancia: { titulo: "Consonância", gerador: "consonancia" },
    movimento: { titulo: "Movimento", gerador: "movimento" },
    paralelas: { titulo: "Paralelas", gerador: "paralelas" },
    acordes: { titulo: "Acordes", gerador: "acorde_da_nota" },
    cadencias: { titulo: "Cadências", gerador: "cadencia_ouvido" },
  };

  raiz.CURSO = { niveis, regraParaLicao, conceitos };
})(this);
