/* Nível 3 · A frase e o tema: capítulos superficie, sentenca, periodo.
 * Saíram de web/temas.js sem nenhuma mudança de conteúdo; carregam antes dos outros módulos (web/livro/indice.js). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const { TONAL, MELODIA, N1, N2, N3, N4, CANTUS, PLANO_CP, PLANO_BAIXO, PLANO_FRASE, FUX, CF1, CF2 } = T.perfis;

  const temas = [
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
            { id: "sen2", titulo: "Continuação em sequência", modo: "restrição", perfil: { ...MELODIA, sequencia_do_motivo: "erro", apresentacao_repetida: "erro" }, nivel: 6,
              contexto: { nivel: 6, plano: { cadencia: 8 }, motivo: { de: 5, em: [6] } }, cifras: "I V7 V7 I IV I6 vii°6 I ii6 I64 V I".split(" "),
              instrucoes: "<p>Sentença inteira sobre o baixo. <b>Restrição:</b> c. 6 = sequência do c. 5.</p>",
              texto: "tom: C maior\ncf: baixo\nmelodia:\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_FRASE,
              solucao: "tom: C maior\ncf: baixo\nmelodia: C5/1.5 E5/0.5 G5/2 F5/1.5 E5/0.5 D5/2 B4/1.5 D5/0.5 F5/2 E5/1.5 D5/0.5 C5/2 A5/0.75 G5/0.25 A5/1 G5/0.75 F5/0.25 G5/1 F5/0.75 E5/0.25 F5/1 E5/0.75 D5/0.25 E5/1 D5/2 E5/1 D5 C5/4\nbaixo: C3/4 G2 G2 C3 F3/2 E3 D3 C3 F3/2 G3/1 G3 C3/4" },
            { id: "sen3", titulo: "Sentença com o seu baixo", modo: "livre", perfil: { ...MELODIA, ritmo_harmonico: "erro", apresentacao_repetida: "erro" }, nivel: 6,
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
  ];
  // escrita de tema: avisar o ritmo quase uniforme (o esqueleto e a superfície pedem diminuição uniforme de propósito)
  for (const tema of temas) T.inserir(3, ["sentenca", "periodo"].includes(tema.id) ? T.acrescentarRegras(tema, { variedade_ritmica: "aviso" }) : tema);
})(this);
