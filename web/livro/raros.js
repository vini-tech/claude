/* Nível 4 · Tópicos menores: nona de dominante e acordes raros; cromatismo linear.
 * Fontes: Rimsky-Korsakov e Dubois (seções sobre a nona); Aldwell & Schachter; Kostka & Payne (cap. "Further
 * Elements" e "Late 19th Century"); Open Music Theory 2e (Common-Tone Chords; The Omnibus Progression; Augmented
 * Options; Altered and Extended Chords); research_notes/O que se ensina em composição/harmonia.md (seções 5–6).
 * Usa as regras aum_cromatismo, aum_aproximacao e aum_cifras definidas em livro/aumentadas.js (carregado antes). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL } = T.perfis;
  const F = M.ferramentas;
  const bonito = (nome) => String(nome).replace(/-/g, "♭").replace(/#/g, "♯");
  const tab = (cab, linhas) => `<table class="tabela-modos"><thead><tr>${cab.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  // ------------------------------------------------------------ regras

  M.definirRegra("nona_resolve", "A nona desce por grau",
    "A nona de um acorde de nona (V9), quando está na melodia, desce por grau conjunto e chega a uma consonância com o baixo — em geral a 5ª do I, ou a fundamental do mesmo V (V9 → V7).",
    function* (ex, ctx) {
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra && h.cifra.nona);
      const mel = ex.vozes[0], bai = ex.vozes[ex.vozes.length - 1];
      if (mel === bai) return;
      for (const h of hs) {
        const nona = R3.membros(h.cifra, h.tom)[4];
        const n = mel.soandoEm(h.inicio);
        if (!n || n.altura.nome !== nona) continue;
        const seg = mel.seguinte(n);
        const c = ex.compassoDe(h.inicio);
        if (!seg) { yield [c, `a nona ${bonito(nona)} de ${h.texto} não resolve: a música acaba nela`, [n]]; continue; }
        const b = bai.soandoEm(seg.inicio);
        const desce = F.ehGrau(n, seg) && seg.ps < n.ps;
        const consonante = !b || M.ehConsonante(F.harmonico(seg, b), true);
        if (!desce || !consonante) yield [c, `a nona ${bonito(nona)} de ${h.texto} ${desce ? "desce, mas para outra dissonância (" + bonito(seg.nome) + ")" : "vai para " + bonito(seg.nome) + " em vez de descer por grau"}`, [n, seg]];
      }
    }, {
      precisaTom: true,
      porque: "A nona é a dissonância mais aguda do acorde: como a 7ª, ela é uma tendência para baixo. Os tratados do século XIX (Dubois, Rimsky-Korsakov) a preparam como nota comum ou por grau e a resolvem descendo.",
      corrigir: "Faça a nona descer um grau: lá → sol em dó (V9 → I, a nona vira a 5ª do I) ou lá → sol sobre o mesmo baixo (V9 → V7).",
    });

  M.definirRegra("nona_exige", "Acorde de nona pedido",
    "O exercício pede um número mínimo de acordes de nona (V9) nas cifras.",
    function* (ex, ctx) {
      if (!ctx.nonas) return;
      const n = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra && h.cifra.nona).length;
      if (n < ctx.nonas) yield [ex.compassoDe(ex.fim - 1), `${n} acorde(s) de nona; o exercício pede pelo menos ${ctx.nonas}`, []];
    }, { precisaTom: true, porque: "O exercício é sobre a nona de dominante: ela precisa aparecer, preparada e resolvida.", corrigir: "Escreva V9 sobre um baixo no 5º grau e ponha a nona na melodia, preparada pela nota anterior." });
  M.PRECISA_FIM.add("nona_exige");

  M.definirRegra("lin_resolucao", "Dissonância sai por grau ou por semitom cromático",
    "Uma nota dissonante contra o baixo segue por grau conjunto ou por semitom cromático (lá♭ → lá): no cromatismo linear, a nota que sobe meio tom cromático também resolve.",
    function* (ex) {
      for (const d of F.dissonancias(ex)) {
        if (d.tipo !== "ataque") continue;
        const prox = ex.vozes[d.voz].seguinte(d.nota);
        if (prox !== null && (F.ehGrau(d.nota, prox) || F.intervalo(d.nota, prox).geral === 1)) continue;
        yield [ex.compassoDe(d.t), `${ex.vozes[d.voz].nome}: dissonância ${bonito(d.nota.nome)} precisa seguir por grau ou semitom, ${prox === null ? "e a música termina" : "mas salta para " + bonito(prox.nome)}`, [d.nota]];
      }
    }, {
      porque: "No cromatismo linear (ônibus, acordes de passagem) as vozes andam por semitom, diatônico ou cromático; é esse movimento mínimo que justifica a dissonância. O salto continua sem justificativa.",
      corrigir: "Faça a nota dissonante andar um grau ou um semitom cromático (lá♭ → lá, fá → fá♯).",
    });

  M.definirRegra("lin_seis_quatro", "Uso do 6/4 (com passagem cromática)",
    "O 6/4 é cadencial (tempo forte, sobre o 5º grau, seguido do V com o mesmo baixo), de bordadura, ou de passagem — e a passagem pode ser cromática (baixo si♭ → lá → lá♭).",
    function* (ex, ctx) {
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const passo = (a, b) => Math.abs(b.ps - a.ps) >= 1 && Math.abs(b.ps - a.ps) <= 2;
      for (let i = 0; i < hs.length; i++) {
        const h = hs[i];
        if (!h.cifra.seisQuatro) continue;
        const prox = hs[i + 1], ant = hs[i - 1];
        const cadencial = prox && prox.cifra.grau === 5 && !prox.cifra.seisQuatro && prox.baixo.altura.nome === h.baixo.altura.nome && ex.forcaMetrica(h.inicio) >= ex.forcaMetrica(prox.inicio);
        const passagem = ant && prox && passo(ant.baixo, h.baixo) && passo(h.baixo, prox.baixo) && F.direcao(ant.baixo, h.baixo) === F.direcao(h.baixo, prox.baixo);
        const bordadura = ant && prox && ant.baixo.ps === h.baixo.ps && prox.baixo.ps === h.baixo.ps;
        if (!(cadencial || passagem || bordadura)) yield [ex.compassoDe(h.inicio), `${h.texto} sobre ${bonito(h.baixo.nome)} não é cadencial, de passagem nem de bordadura`, [h.baixo]];
      }
    }, {
      precisaTom: true,
      porque: "A 4ª contra o baixo torna o 6/4 instável: ele só funciona resolvendo (cadencial) ou de passagem. Num baixo cromático, a passagem por semitom vale tanto quanto a diatônica.",
      corrigir: "Use o 6/4 sobre o 5º grau no tempo forte (cadencial) ou com o baixo passando por grau ou semitom, na mesma direção.",
    });
  for (const id of ["lin_seis_quatro", "nona_resolve"]) M.OLHA_ADIANTE.add(id);

  // perfis
  const { intervalo_melodico_aumentado_diminuto: _i, dissonancia_aproximacao: _d, cifras_coerentes: _c, ...BASE } = TONAL;
  const NONA = { ...BASE, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", nona_resolve: "erro" };
  const { dissonancia_resolucao: _r, seis_quatro: _s, ...BASE2 } = BASE;
  const LIN = { ...BASE2, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", lin_resolucao: "erro", lin_seis_quatro: "erro" };

  // ================================================================== nona e acordes raros
  T.inserir(4, {
    id: "nona", titulo: "Nona de dominante e acordes raros",
    objetivo: "Preparar e resolver a nona do V9 (maior e menor); ler 11ª, 13ª e tríade aumentada como fenômenos lineares.",
    ouvir: ["Beethoven, “Patética”, introdução: nonas menores", "Satie, Trois Sarabandes: nonas sem resolução", "Debussy, Pour le piano, Sarabande: planing"],
    esboco: "Sobre IV – V – I em dó, com o soprano lá – ? – ?, qual nota você manteria sobre o V para criar uma nona? Para onde ela vai sobre o I?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "A nona: uma 7ª acima da 7ª", html: `
        <p><b>V9</b> = V7 + 3ª: em dó maior sol–si–ré–fá–<b>lá</b> (nona maior); em menor, <b>lá♭</b> (nona menor). Mais romântico que clássico.</p>
        ${tab(["Aspecto", "Regra"], [
          ["Posição", "voz superior (soprano), acima da sensível, a 9ª ou mais da fundamental; a 4 vozes, sem a 5ª"],
          ["Preparação", "nota comum do acorde anterior (lá do IV ou ii) ou por grau"],
          ["Resolução", "desce por grau (lá → sol, 5ª do I); ou 9–8 sobre o V (V9 → V7)"],
          ["Nona × retardo 9–8", "resolve sobre o mesmo baixo = retardo; dura até o acorde seguinte = V9"],
          ["vii°7", "lido por Rameau como V9 menor sem fundamental; resolve igual"]])}
        <h3>Raros: 11ª, 13ª, tríade aumentada</h3>
        ${tab(["Acorde", "Leitura"], [
          ["“V13”", "V7 com apojatura ou retardo da 6ª (mi sobre sol7 → ré)"],
          ["“11ª”", "retardo 4–3 sobre o V"],
          ["Tríade aumentada (V+, III+)", "condução: ré → ré♯ → mi; sem fundamental audível"]])}` },
      { tipo: "exemplo", titulo: "Preparar e resolver a nona",
        camadas: [
          { titulo: "Nona maior em dó maior", partitura: "tom: C maior\nsoprano: E5/2 A5/2~ A5/2 G5/2 F5/2 D5/2 B4/2 C5/2\nbaixo: C3/2 F3/2 G3/2 C3/2 A2/2 F2/2 G2/2 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [2, "IV"], [4, "V9"], [6, "I"], [8, "IV6"], [10, "ii6"], [12, "V7"], [14, "I"]],
            anotacoes: [[0, 1, "9ª"]],
            notas: [["decisao", "Lá5 entra como 3ª do IV, fica preso sobre o sol (nona do V9) e desce ao sol5 sobre o dó."],
              ["rejeitada", "Atacar o lá5 por salto sobre o V: soaria como apojatura."]],
            pausa: ["Por que a nona resolve no sol, e não no si?", "O si é a sensível e sobe a dó; descer ao si a dobraria. Lá → sol e si → dó em movimento contrário, como no V7."] },
          { titulo: "Nona menor em lá menor", partitura: "tom: A menor\nsoprano: C5/2 F5/2~ F5/2 E5/2 D5/2 B4/2 A4/4\nbaixo: A2/2 D3/2 E3/2 A2/2 D3/2 E3/2 A2/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [2, "iv"], [4, "V9"], [6, "i"], [8, "iv"], [10, "V"], [12, "i"]],
            notas: [["decisao", "Fá5 (3ª do iv) fica sobre o mi: nona menor; desce ao mi5."],
              ["checagem", "Sol♯–fá = 7ª diminuta: o vii°7 com mi embaixo (leitura de Rameau)."]] },
          { titulo: "A tríade aumentada de passagem", partitura: "tom: C maior\nsoprano: E5/1 D5/1 C5/1 C5/1 D5/1 D#5/1 E5/2\nbaixo: C3/1 D3/1 E3/1 A2/1 G2/1 G2/1 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "V43"], [2, "I6"], [3, "IV6"], [4, "V"], [5, "V+"], [6, "I"]],
            contexto: { plano: {} },
            notas: [["decisao", "Ré5 → ré♯5 → mi5: a 5ª do V sobe e o V vira V+ por um tempo."],
              ["checagem", "Ré♯ (5ª aum.) chega por semitom e resolve por grau: condução, não função nova."]] },
        ] },
      { tipo: "contraste", titulo: "V9 × retardo 9–8",
        a: { rotulo: "A — V9: a nona fica até o I", partitura: "tom: C maior\nsoprano: E5/2 A5/2~ A5/2 G5/2\nbaixo: C3/2 F3/2 G3/2 C3/2", cifras: [[0, "I"], [2, "IV"], [4, "V9"], [6, "I"]], contexto: { plano: {} } },
        b: { rotulo: "B — 9–8: a nona resolve sobre o V", partitura: "tom: C maior\nsoprano: E5/2 A5/2~ A5/1 G5/1 G5/2\nbaixo: C3/2 F3/2 G3/2 C3/2", cifras: [[0, "I"], [2, "IV"], [4, "V"], [6, "I"]], contexto: { plano: {} },
          perfil: (({ aum_cifras, ...p }) => p)(NONA) },
        pergunta: "Em qual o lá é membro do acorde, e em qual é ornamento do V?",
        comentario: "<p>A: o lá dura todo o V e resolve com a mudança do baixo — nona. B: resolve sobre o mesmo baixo — retardo 9–8; a harmonia é só V.</p>" },
      { tipo: "quebra", titulo: "Nonas paralelas: a dissonância vira cor", html: `
        ${tab(["Quem", "O que quebra", "Efeito"], [
          ["Satie, Sarabandes (1887)", "nonas encadeadas sem resolução", "nona como timbre"],
          ["Debussy, Pour le piano", "planing: o acorde inteiro segue a melodia", "linha “engrossada”, sem função"],
          ["Ravel", "herda o planing", "idem"]])}
        <p>A nona vai a outra nona, não a uma consonância; o acorde vale como cor.</p>`,
        exemplos: [
          { rotulo: "Nonas paralelas descendo sobre a escala (esquema)", partitura: "tom: C maior\nsoprano: E5/2 A5/2~ A5/2 G5/2~ G5/1 F5/1 E5/1 D5/1 B4/2 C5/2\nbaixo: C3/2 F3/2 G3/2 C3/2 F3/1 E3/1 D3/1 C3/1 G2/2 C3/2",
            cifras: [[0, "I"], [2, "IV"], [4, "V9"], [6, "I"], [8, "IV9"], [9, "iii9"], [10, "ii9"], [11, "I9"], [12, "V7"], [14, "I"]],
            perfil: { ...NONA, nona_resolve: "info" },
            comentario: "V9 clássico no c. 2; no c. 3, quatro nonas paralelas com o baixo, cada uma indo a outra dissonância." },
        ] },
    ],
    exercicios: [
      { id: "non1", titulo: "Completar: a nona em fá maior", modo: "completar", perfil: { ...NONA }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "I IV V9 I vi ii6 V7 I".split(" "),
        instrucoes: "<p>Escreva o soprano dos c. 2–4, com a <b>nona (ré) no soprano</b> do V9, preparada e resolvida descendo por grau.</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano: A4/2 D5/2\nbaixo: F3/2 Bb2/2 C3/2 F3/2 D3/2 Bb2/2 C3/2 F2/2", duracao: 2, alvoCompassos: 4,
        solucao: "tom: F maior\ncf: baixo\nsoprano: A4/2 D5/2 D5/2 C5/2 F5/2 G5/2 E5/2 F5/2\nbaixo: F3/2 Bb2/2 C3/2 F3/2 D3/2 Bb2/2 C3/2 F2/2",
        comentarioSolucao: "Ré5 do IV preso sobre o dó (nona) desce ao dó5, 5ª do I." },
      { id: "non2", titulo: "Restrição: a nona menor em ré menor", modo: "restrição", perfil: { ...NONA, nona_exige: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, nonas: 1 }, cifrasAluno: true, cifrasIniciais: "i V6 i iv",
        instrucoes: "<p>Escreva cifras e soprano. <b>Restrição:</b> V9 no início do c. 2, nona menor (si♭) no soprano, ligada do tempo anterior e resolvida descendo; cadência perfeita.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/1 C#3/1 D3/1 G2/1 A2/2 D3/2 Bb2/2 A2/2 D3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5/1 D5/1 Bb4/1~ Bb4/2 A4/2 D5/2 C#5/2 D5/4\nbaixo: D3/1 C#3/1 D3/1 G2/1 A2/2 D3/2 Bb2/2 A2/2 D3/4",
        solucaoCifras: "i V6 i iv V9 i VI V i",
        comentarioSolucao: "Si♭4 (fundamental do iv) preso sobre o lá: nona menor; desce ao lá4, 5ª do i." },
      { id: "non3", titulo: "Quebrar: nonas em paralelo", modo: "quebrar", perfil: { ...NONA, nona_resolve: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "I IV V9 I IV9 iii9 ii9 I9 V7 I".split(" "),
        instrucoes: "<p>C. 1–2 dados (V9 clássico). No c. 3, <b>quebre a resolução</b>: nonas paralelas com o baixo (fá–mi–ré–dó). No c. 4, V7–I.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/2 A5/2~ A5/2 G5/2\nbaixo: C3/2 F3/2 G3/2 C3/2 F3/1 E3/1 D3/1 C3/1 G2/2 C3/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/2 A5/2~ A5/2 G5/2~ G5/1 F5/1 E5/1 D5/1 B4/2 C5/2\nbaixo: C3/2 F3/2 G3/2 C3/2 F3/1 E3/1 D3/1 C3/1 G2/2 C3/2",
        comentarioSolucao: "Sol5 preso sobre fá3 (IV9) desce em nonas paralelas até ré5/dó3; nenhuma resolve, a última se dissolve no V7." },
    ],
  });

  // ================================================================== cromatismo linear
  T.inserir(4, {
    id: "linear", titulo: "Cromatismo linear",
    objetivo: "Usar °7 de nota comum, acorde cromático de passagem, ônibus e troca de vozes cromática sem perder a direção tonal.",
    ouvir: ["Schubert, Sonata D. 845, 1º mov.: ônibus", "Tchaikovsky, Quebra-Nozes, cena da árvore: cunha", "Chopin, Prelúdio op. 28 nº 4: uma nota por vez"],
    esboco: "Em dó maior, com o baixo parado no dó, mova só o soprano mi → ré♯ → mi e uma voz interna sol → lá → sol. Que acorde soa no meio?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Acordes que vêm das vozes", html: `
        <p>Acordes que nascem da <b>condução</b>: vozes por semitom, outras paradas. A função não muda: o acorde <b>prolonga</b> o que está em volta.</p>
        <table class="tabela-modos"><thead><tr><th>Procedimento</th><th>Em dó maior</th><th>O que prolonga</th></tr></thead><tbody>
        <tr><td>°7 de nota comum</td><td>ré♯–fá♯–lá–dó sobre dó (<code>#ii°42</code>); lá♯–dó♯–mi–sol sobre sol (<code>#vi°42</code>)</td><td>I ou V</td></tr>
        <tr><td>Acorde cromático de passagem</td><td>IV – fá♯°7 (vii°7/V) – V: baixo fá–fá♯–sol</td><td>pré-dominante → V</td></tr>
        <tr><td>Ônibus</td><td>baixo dó–si–si♭–lá–lá♭–sol contra soprano sol–sol–lá♭–lá–si♭–si</td><td>a dominante (ou a ida I → V7)</td></tr>
        <tr><td>Troca de vozes cromática</td><td>(menor) iv → It6: baixo fá → lá♭, soprano lá♭ → fá♯</td><td>a pré-dominante</td></tr>
        </tbody></table>
        <h3>Regras de escrita</h3>
        <ul><li><b>Grafia pela resolução:</b> ré♯ (não mi♭) porque volta ao mi.</li>
        <li><b>Semitom cromático vale como grau</b> (lá♭ → lá); saltos aumentados/diminutos, não.</li>
        <li><b>Pontas diatônicas firmes</b> (I, V); no meio, lógica das vozes.</li></ul>` },
      { tipo: "exemplo", titulo: "Cor sem mudança de função",
        camadas: [
          { titulo: "°7 de nota comum e acorde cromático de passagem", partitura: "tom: C maior\nsoprano: E5/1 D#5/1 E5/2 C5/1 A4/1 A4/1 G4/1 B4/1 A#4/1 B4/2 C5/4\nbaixo: C3/1 C3/1 C3/2 E3/1 F3/1 F#3/1 G3/1 G3/1 G3/1 G3/2 C3/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "#ii°42"], [2, "I"], [4, "I6"], [5, "IV"], [6, "vii°7/V"], [7, "V"], [8, "V"], [9, "#vi°42"], [10, "V"], [12, "I"]],
            notas: [["decisao", "C. 1: dó parado, soprano mi → ré♯ → mi: °7 de nota comum enfeita o I."],
              ["decisao", "C. 2: baixo fá → fá♯ → sol: vii°7/V de passagem entre IV e V."],
              ["decisao", "C. 3: o mesmo enfeite sobre o V (si → lá♯ → si)."]],
            pausa: ["Sem os acordes cromáticos, o que sobra?", "I – I6 – IV – V – I. O cromatismo não muda o percurso; só colore as vozes."] },
          { titulo: "A ônibus (forma básica)", partitura: "tom: C maior\nsoprano: G4/1 G4/1 Ab4/1 A4/1 Bb4/1 B4/1 C5/2\nbaixo: C3/1 B2/1 Bb2/1 A2/1 Ab2/1 G2/1 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "V65"], [2, "d:Ger65=C:bVII7"], [3, "d:i64"], [4, "C:bVII42"], [5, "V7"], [6, "I"]],
            notas: [["decisao", "Movimento contrário cromático nas vozes externas; ré e fá parados por dentro."],
              ["decisao", "Si♭7 = ♭VII7 de dó e Ger65 de ré menor: por isso o ré 6/4 soa como chegada momentânea."],
              ["checagem", "Lá♭4 (7ª) sobe ao lá: o semitom cromático resolve a dissonância."]],
            pausa: ["Por que o ouvinte não se perde?", "Pontas firmes (I, V7 → I) e vozes externas em movimentos simples e opostos."] },
        ] },
      { tipo: "contraste", titulo: "Troca de vozes diatônica × cromática",
        a: { rotulo: "A — diatônica: iv → iv6", partitura: "tom: C menor\nsoprano: Eb5/1 D5/1 C5/1 Ab4/1 G4/1 F4/1 G4/1 B4/1 C5/4\nbaixo: C3/1 B2/1 C3/1 F3/1 G3/1 Ab3/1 G3/1 G3/1 C3/4", cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "iv"], [4, "i64"], [5, "iv6"], [6, "V"], [7, "V7"], [8, "i"]] },
        b: { rotulo: "B — cromática: iv → It6", partitura: "tom: C menor\nsoprano: Eb5/1 D5/1 C5/1 Ab4/1 G4/1 F#4/1 G4/1 B4/1 C5/4\nbaixo: C3/1 B2/1 C3/1 F3/1 G3/1 Ab3/1 G3/1 G3/1 C3/4", cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "iv"], [4, "i64"], [5, "It6"], [6, "V"], [7, "V7"], [8, "i"]] },
        pergunta: "Nos dois, as vozes trocam fá e lá♭ pelo sol. O que muda com o fá♯?",
        comentario: "<p>A: iv → iv6, pré-dominante prolongada. B: fá♯ sobre lá♭ forma a 6ª aumentada — It6, e o V chega com duas sensíveis.</p>" },
      { tipo: "quebra", titulo: "Saturação cromática", html: `
        ${tab(["Quem", "O que quebra", "Efeito"], [
          ["Chopin, Prelúdio op. 28 nº 4", "acordes mudam uma nota por vez sob melodia quase parada", "graus incertos"],
          ["Wagner, Tristão", "condução cromática como matéria", "tonalidade só nas cadências"],
          ["Schoenberg", "°7 e aumentados como “acordes errantes”", "ponte para qualquer tom"]])}
        <p>Cai a função: vozes deslizam, sem progressão de graus.</p>`,
        exemplos: [
          { rotulo: "À maneira do Prelúdio op. 28 n.º 4 (esquema, não a partitura)", partitura: "tom: E menor\nsoprano: B4/3 C5/1 B4/3 C5/1 B4/2 C5/1 A4/1 F#4/2 E4/2\nbaixo: E3/2 D#3/2 D3/2 C#3/2 C3/4 B2/2 E3/2",
            cifras: [[0, "i"], [2, "V65"], [4, "V42/iv"], [6, "#viø7"], [8, "VI7"], [12, "V"], [14, "i"]],
            perfil: { quintas_paralelas: "erro", oitavas_paralelas: "erro", cruzamento_de_vozes: "erro", aum_cromatismo: "erro" },
            comentario: "Baixo desce por semitom até o V; todos os acordes contêm o si da melodia. Os graus são rótulos, não progressão." },
        ] },
    ],
    exercicios: [
      { id: "lin1", titulo: "Completar: °7 de nota comum sobre o V", modo: "completar", perfil: { ...LIN }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "I #ii°42 I IV ii V V #vi°42 V I".split(" "),
        instrucoes: "<p>Escreva o soprano dos c. 3–4: sobre o ré, o <b>#vi°42</b> enfeita o V — bordadura cromática inferior que volta à nota do V; feche na tônica.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: B4/1 A#4/1 B4/2 E5/1 E5/1 F#5/2\nbaixo: G2/1 G2/1 G2/2 C3/1 A2/1 D3/2 D3/1 D3/1 D3/2 G2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 A#4/1 B4/2 E5/1 E5/1 F#5/2 F#5/1 E#5/1 F#5/2 G5/4\nbaixo: G2/1 G2/1 G2/2 C3/1 A2/1 D3/2 D3/1 D3/1 D3/2 G2/4",
        comentarioSolucao: "Fá♯5 → mi♯5 → fá♯5 sobre o ré parado: o mi♯ é a bordadura elevada (grafada pela resolução, não fá♮). O V continua V; o °7 só o colore." },
      { id: "lin2", titulo: "A ônibus em ré maior", modo: "menos apoio", perfil: { ...LIN }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 3 } }, cifras: "I vi IV V I V65 e:Ger65=D:bVII7 e:i64 D:bVII42 V7 I".split(" "),
        instrucoes: "<p>Baixo e cifras dados; o baixo desce cromaticamente de ré a lá (c. 2–3). Escreva o soprano, <b>subindo cromaticamente</b> em movimento contrário (ônibus).</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano:\nbaixo: D3/1 B2/1 G2/1 A2/1 D3/1 C#3/1 C3/1 B2/1 Bb2/1 A2/1 D3/2", duracao: 1, alvoCompassos: 3,
        solucao: "tom: D maior\ncf: baixo\nsoprano: D5/1 D5/1 B4/1 A4/1 A4/1 A4/1 Bb4/1 B4/1 C5/1 C#5/1 D5/2\nbaixo: D3/1 B2/1 G2/1 A2/1 D3/1 C#3/1 C3/1 B2/1 Bb2/1 A2/1 D3/2",
        comentarioSolucao: "Soprano lá4 → ré5 contra baixo ré → lá: ônibus transposta. As 7ªs sobem por semitom cromático." },
      { id: "lin3", titulo: "Quebrar: sétimas que deslizam", modo: "quebrar", perfil: { ...LIN, retrogressao_cifrada: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "i V43 i6 iv V7 bV7 IV7 bIV7 V7/VI V7/V V7 i".split(" "),
        instrucoes: "<p>C. 2: cadeia de <b>dominantes com 7ª</b> (mi7, mi♭7, ré7, ré♭7). Quebre a função: soprano em 7ªs paralelas com o baixo, sem resolver. C. 3–4: V7/V – V7 – i.</p>",
        texto: "tom: A menor\ncf: baixo\nsoprano: C5/1 D5/1 E5/1 D5/1\nbaixo: A2/1 B2/1 C3/1 D3/1 E3/1 Eb3/1 D3/1 Db3/1 C3/1 B2/1 E3/2 A2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: A menor\ncf: baixo\nsoprano: C5/1 D5/1 E5/1 D5/1 D5/1 Db5/1 C5/1 Cb5/1 Bb4/1 A4/1 G#4/2 A4/4\nbaixo: A2/1 B2/1 C3/1 D3/1 E3/1 Eb3/1 D3/1 Db3/1 C3/1 B2/1 E3/2 A2/4",
        comentarioSolucao: "7ªs paralelas: cada dominante vai a outra meio tom abaixo. A função só volta no V7 → i." },
    ],
  });
})(this);
