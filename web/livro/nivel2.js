/* Nível 2 · Das vozes à harmonia: capítulos oitava, baixo, ritmo, esquemas.
 * Saíram de web/temas.js sem nenhuma mudança de conteúdo; carregam antes dos outros módulos (web/livro/indice.js). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const { TONAL, MELODIA, N1, N2, N3, N4, CANTUS, PLANO_CP, PLANO_BAIXO, PLANO_FRASE, FUX, CF1, CF2 } = T.perfis;

  const temas = [
        {
          id: "oitava", titulo: "A regra da oitava",
          objetivo: "Um acorde pronto para cada grau do baixo em escala, subindo e descendo, em qualquer tom.",
          ouvir: ["Fenaroli, Partimenti, livro 1", "Corelli, Sonatas op. 5: baixos em escala", "Bach, Prelúdio em dó BWV 846, c. 1–11"],
          esboco: "Sem consultar a aula: que acorde você poria sobre o 7º grau subindo (si, em dó)? E descendo?",
          secoes: [
            { tipo: "texto", titulo: "Um acorde por grau, segundo a direção", html: `
              <p><b>Regra da Oitava</b> (Campion, 1716): sobre os graus <b>1 e 5</b>, acorde em estado fundamental; nos outros, inversões que <b>apontam para o próximo grau estável</b>. Entre parênteses, o mesmo acorde em baixo cifrado (intervalos acima do baixo), como os partimentos escrevem.</p>
              <table class="tabela-modos"><thead><tr><th>Grau do baixo</th><th>Subindo</th><th>Descendo</th></tr></thead><tbody>
              <tr><td>8 / 1</td><td>I <small>(5/3)</small></td><td>I <small>(5/3)</small></td></tr>
              <tr><td>7</td><td>V65 <small>(6/5)</small> → 1</td><td>V6 <small>(6)</small></td></tr>
              <tr><td>6</td><td>IV6 <small>(6)</small></td><td>V43/V <small>(♯6/4/3)</small> → 5; diatônico: IV6</td></tr>
              <tr><td>5</td><td>V <small>(5/3)</small></td><td>V <small>(5/3)</small></td></tr>
              <tr><td>4</td><td>ii65 <small>(6/5)</small> → 5</td><td>V42 <small>(4/2)</small> → 3</td></tr>
              <tr><td>3</td><td>I6 <small>(6)</small></td><td>I6 <small>(6)</small></td></tr>
              <tr><td>2</td><td>V43 <small>(6/4/3)</small></td><td>V43 <small>(6/4/3)</small></td></tr>
              </tbody></table>
              <p><small>Leia: 6 = 1ª inversão; 6/5, 6/4/3, 4/2 = acorde de 7ª na 1ª, 2ª, 3ª inversão (= 65, 43, 42); ♯6 = a 6ª acima do baixo, alterada.</small></p>
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
              <tr><td>cadência</td><td colspan="3">simples, composta (I64–V sobre o 5), dupla; convergente (baixo 4–♯4–5) na semicadência; Quiescenza no fim</td></tr>
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
  ];
  for (const tema of temas) T.inserir(2, tema);
})(this);
