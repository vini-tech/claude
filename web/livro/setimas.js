/* Nível 2 · Acordes de sétima e sequências. Fontes: Aldwell & Schachter, Harmony and Voice Leading (cap. sobre V7,
 * sétimas da sensível e sétimas diatônicas; sequências); Kostka & Payne, Tonal Harmony (partes III e cap. 7);
 * Rameau, Traité de l'harmonie (1722); Fenaroli, Regole (regra da oitava); Riepel, Anfangsgründe (1755) via
 * Gjerdingen, Music in the Galant Style (Monte, Fonte, Ponte); research_notes/…/harmonia.md §3–4. */
(function (raiz) {
  "use strict";
  const T_ = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL } = T_.perfis;

  // ------------------------------------------------------------ regras do capítulo (prefixo set_)
  const F = M.ferramentas, T = M.T;


  // restrição barroca: toda 7ª de acorde numa voz externa vem preparada (a mesma nota já soava no acorde anterior)
  M.definirRegra("set_setima_preparada", "A 7ª vem preparada",
    "Estilo estrito: a 7ª de um acorde de sétima, na voz externa que a tem, já soava como consonância no acorde anterior (nota comum, repetida ou ligada) — como num retardo.",
    function* (ex, ctx) {
      if (!ex.tonalidade || !ctx.cifras) return;
      const hs = R3.harmoniasCifradas(ex, ctx);
      for (let k = 0; k < hs.length; k++) {
        const h = hs[k];
        if (!h.cifra || !h.cifra.setima || h.cifra.aumentada) continue;
        if (k > 0 && R3.mesmoAcorde(hs[k - 1], h) && hs[k - 1].cifra.setima) continue;
        const sete = R3.membros(h.cifra, h.tom)[3];
        for (const v of ex.vozes) {
          for (const n of v.notas) {
            if (n.altura.nome !== sete || n.fim <= h.inicio || n.inicio >= h.fim) continue;
            if (n.inicio < h.inicio) continue; // ligada desde o acorde anterior
            const ant = v.anterior(n);
            if (ant && ant.ps === n.ps && ant.inicio < h.inicio) continue;
            yield [ex.compassoDe(n.inicio), `${v.nome}: a 7ª de ${h.texto} (${n.nome}) entra sem preparação`, [n]];
          }
        }
      }
    }, { precisaTom: true,
      porque: "No estilo estrito a 7ª é tratada como retardo: a dissonância não é atacada, ela nasce de uma nota que já estava lá quando o baixo muda. É isso que dá às cadeias de sétimas de Corelli e Bach a sua fluidez.",
      corrigir: "No acorde anterior, coloque na mesma voz a nota que vai virar 7ª (como consonância) e repita-a ou ligue-a; escolha acordes vizinhos que tenham essa nota em comum." });

  /* ctx.minSetimasSoprano = n: quantas vezes a 7ª de um acorde aparece no soprano (no ataque do baixo) */
  M.definirRegra("set_setima_no_soprano", "A 7ª na melodia",
    "O exercício pede que a 7ª de um acorde de sétima apareça na voz de cima um número mínimo de vezes (e resolva).",
    function* (ex, ctx) {
      if (!ctx.minSetimasSoprano || !ctx.cifras || !ex.tonalidade) return;
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra && h.cifra.setima);
      const sop = ex.vozes[0];
      const n = hs.filter((h) => sop.notas.some((x) => x.inicio < h.fim && x.fim > h.inicio && x.altura.nome === R3.membros(h.cifra, h.tom)[3])).length;
      if (n < ctx.minSetimasSoprano) yield [ex.compassoDe(ex.fim - 1), `a 7ª de um acorde aparece ${n} vez(es) no soprano; o exercício pede pelo menos ${ctx.minSetimasSoprano}`, []];
    }, { precisaTom: true, porque: "Com a 7ª na voz de cima, a resolução fica exposta: é ali que se ouve se ela foi bem conduzida.", corrigir: "Escolha, sobre o V7 (ou outro acorde de sétima), a 7ª do acorde para a melodia, chegando a ela por grau ou por nota comum, e desça um grau no acorde seguinte." });
  M.PRECISA_FIM.add("set_setima_no_soprano");

  /* ctx.cifrasPedidas = ["vii°7", "viiø65", …]: cada cifra (ou cifra sem a figura) tem de aparecer */
  M.definirRegra("set_cifras_pedidas", "Acordes pedidos",
    "O exercício pede certos acordes (por exemplo vii°7 e viiø65); cada um tem de aparecer nas cifras.",
    function* (ex, ctx) {
      if (!ctx.cifrasPedidas || !ctx.cifras) return;
      // "vii°7" vale para vii°7, vii°65, vii°43 e vii°42; sem figura ("V"), qualquer posição; com outra figura, exata
      const fig = (s) => (/(65|43|42|64|7|6|9)$/.exec(String(s || "")) || [""])[0];
      const base = (s) => String(s || "").slice(0, String(s || "").length - fig(s).length);
      const vale = (c, p) => c === p || (base(c) === base(p) && (fig(p) === "" || (fig(p) === "7" && ["7", "65", "43", "42"].includes(fig(c)))));
      for (const p of ctx.cifrasPedidas) {
        if (!ctx.cifras.some((c) => vale(c, p))) yield [ex.compassoDe(ex.fim - 1), `falta usar ${p}${fig(p) === "7" ? " (em qualquer inversão)" : ""}`, []];
      }
    }, { porque: "Usar o acorde de propósito, no lugar certo, é o que o transforma de nome em vocabulário.", corrigir: "Encontre um ponto da frase em que o acorde pedido tem a função certa e reescreva o baixo, as cifras e a melodia ali." });
  M.PRECISA_FIM.add("set_cifras_pedidas");

  /* ctx.sequencia = { modelo: [início, fim] em semínimas, copias: n, real: bool }
   * cada cópia (logo depois do modelo, com o mesmo tamanho) repete o ritmo e os intervalos melódicos de cada voz,
   * transposta pelo mesmo intervalo em todas as vozes; com real: true, os semitons também */
  M.definirRegra("set_sequencia", "Modelo e cópia",
    "Numa sequência, cada cópia repete o modelo inteiro (ritmo e intervalos de cada voz) transposto pelo mesmo intervalo em todas as vozes. Na sequência diatônica a qualidade dos intervalos pode mudar (3ª maior vira menor); na real, nem isso.",
    function* (ex, ctx) {
      const sq = ctx.sequencia;
      if (!sq) return;
      const [a, b] = sq.modelo, L = (b - a) * T;
      const pega = (v, ini) => v.notas.filter((n) => n.inicio >= ini && n.inicio < ini + L);
      const pos = (p) => p.altura.letra + 7 * p.altura.oitava;
      for (let k = 1; k <= (sq.copias || 1); k++) {
        const ini = a * T + k * L, c = ex.compassoDe(ini);
        if (ex.fim < ini + L) { yield [c, `falta a ${k}ª cópia do modelo`, []]; continue; }
        let passo = null, semis = null, ok = true;
        for (const v of ex.vozes) {
          const m = pega(v, a * T), cp = pega(v, ini);
          if (!m.length) continue;
          if (m.length !== cp.length || m.some((n, j) => n.inicio - a * T !== cp[j].inicio - ini || n.duracao !== cp[j].duracao)) {
            yield [c, `${v.nome}: a ${k}ª cópia não repete o ritmo do modelo (${m.length} nota(s) no modelo, ${cp.length} na cópia)`, cp]; ok = false; continue;
          }
          const p = (((pos(cp[0]) - pos(m[0])) % 7) + 7) % 7;
          if (passo === null) { passo = p; semis = (((cp[0].ps - m[0].ps) % 12) + 12) % 12; }
          else if (p !== passo) { yield [c, `${v.nome}: a ${k}ª cópia está transposta por outro intervalo que a outra voz — o contraponto do modelo não se repete`, [cp[0]]]; ok = false; continue; }
          for (let j = 1; j < m.length; j++) {
            const im = F.intervalo(m[j - 1], m[j]), ic = F.intervalo(cp[j - 1], cp[j]);
            if (im.direcionado !== ic.direcionado) { yield [c, `${v.nome}: na ${k}ª cópia, ${cp[j - 1].nome} → ${cp[j].nome} não repete o intervalo do modelo (${m[j - 1].nome} → ${m[j].nome})`, [cp[j - 1], cp[j]]]; ok = false; break; }
            if (sq.real && im.semitons !== ic.semitons) { yield [c, `${v.nome}: sequência real pede o mesmo intervalo exato: ${m[j - 1].nome} → ${m[j].nome} e ${cp[j - 1].nome} → ${cp[j].nome} diferem`, [cp[j - 1], cp[j]]]; ok = false; break; }
          }
          if (sq.real && ok && ((((cp[0].ps - m[0].ps) % 12) + 12) % 12) !== semis) { yield [c, `${v.nome}: na sequência real todas as vozes sobem ou descem o mesmo número de semitons`, [cp[0]]]; ok = false; }
        }
      }
    }, { porque: "A sequência convence porque o ouvido reconhece o modelo e passa a prever a cópia. Se uma voz muda o desenho, o padrão se desfaz e o trecho soa como uma série de acordes soltos — com o risco de paralelas que o modelo evitava aparecerem na cópia.",
      corrigir: "Copie o modelo voz por voz: mesmo ritmo, mesmos intervalos melódicos (contados em graus), e desloque as duas vozes pelo mesmo intervalo." });
  M.PRECISA_FIM.add("set_sequencia");

  // perfis do capítulo
  const SET = { ...TONAL, notas_do_acorde: "erro", set_setima: "erro" };

  // cifras de um exemplo a partir da partitura: uma por nota do baixo, no tempo dela
  function cifrar(partitura, s) {
    const ex = M.lerTexto(partitura);
    const b = ex.vozes[ex.vozes.length - 1];
    const xs = s.trim().split(/\s+/);
    if (xs.length !== b.notas.length) throw new Error(`setimas: ${xs.length} cifras para ${b.notas.length} notas do baixo em "${s}"`);
    return b.notas.map((n, i) => [n.inicio / M.T, xs[i]]);
  }
  const ex = (partitura, s, resto = {}) => ({ partitura, cifras: cifrar(partitura, s), rotulos: ["soprano", "baixo"], ...resto });

  // ================================================================ 1. A sétima da dominante
  const D1 = "tom: C maior\nsoprano: E5/1 F5 E5 D5 C5 A4 B4 C5 A5/2 G5/1 F5 E5/4\nbaixo: C3/1 B2 C3 D3 E3 F3 F3 E3 F3/2 G3/1 G3 C3/4";
  const D1c = "I V65 I V43 I6 IV V42 I6 ii65 I64 V7 I";
  const D2 = "tom: A menor\nsoprano: C5/2 A4 B4 C5 D5 C5 B4 G#4 A4/4\nbaixo: A2/2 D3 D3 C3 E3 F3 D3 E3 A2/4";
  const D2c = "i iv V42 i6 V7 VI ii°6 V7 i";

  T_.inserir(2, {
    id: "setima_dom", titulo: "A sétima da dominante",
    objetivo: "Usar o V7 e as inversões: 7ª desce um grau, sensível sobe, e o baixo de cada inversão vai ao seu destino.",
    ouvir: [
      "Corais de Bach: V42 → I6 e V65 → I no meio da frase",
      "Beethoven, Sinfonia nº 1, início: V7 sem preparação",
      "Schumann, 'Im wunderschönen Monat Mai': termina no V7",
    ],
    esboco: "Em sol maior, escreva só baixo e soprano para I – V43 – I6 – IV – V42 – I6 (uma nota por acorde). Onde está a 7ª do acorde em cada V, e para onde ela vai?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Uma dissonância que virou acorde", html: `
        <p>A 7ª nasceu como passagem (8–7) ou retardo; Rameau (1722) a fez parte do acorde, mas ela ainda resolve como dissonância.</p>
        <table class="tabela-modos"><thead><tr><th>Nota</th><th>Tratamento</th></tr></thead><tbody>
        <tr><td><b>7ª (4̂)</b></td><td>desce a 3̂, em qualquer voz — inclusive no baixo</td></tr>
        <tr><td><b>Sensível (7̂)</b></td><td>sobe a 1̂ nas vozes externas; numa interna, no V7 → I, pode cair a 5̂</td></tr>
        <tr><td><b>Trítono 7̂–4̂</b></td><td>5ª d se fecha (si–fá → dó–mi); 4ª A se abre (fá–si → mi–dó)</td></tr>
        </tbody></table>
        <h3>As inversões e o baixo</h3>
        <table class="tabela-modos"><thead><tr><th>Cifra</th><th>No baixo (em dó)</th><th>O baixo vai a</th><th>Uso típico</th></tr></thead><tbody>
        <tr><td><b>V7</b></td><td>5̂ (sol)</td><td>1̂ (I)</td><td>cadência; a fórmula mais forte</td></tr>
        <tr><td><b>V65</b></td><td>7̂ (si)</td><td>1̂ (I)</td><td>bordadura inferior da tônica (1–7–1)</td></tr>
        <tr><td><b>V43</b></td><td>2̂ (ré)</td><td>1̂ (I) ou 3̂ (I6)</td><td>passagem 1–2–3 (troca de vozes) ou bordadura</td></tr>
        <tr><td><b>V42</b></td><td>4̂ (fá) = a 7ª</td><td>3̂ (I6), sempre</td><td>passagem descendente 5–4–3, ou depois do IV com o fá preso</td></tr>
        </tbody></table>
        <p>As inversões deixam o baixo andar por grau (regra da oitava).</p>
        <h3>Como a 7ª chega</h3>
        <table class="tabela-modos"><thead><tr><th>Entrada</th><th>Exemplo (dó maior)</th></tr></thead><tbody>
        <tr><td><b>Preparada</b></td><td>IV ou ii → V7, o fá fica (Barroco estrito)</td></tr>
        <tr><td><b>De passagem</b></td><td>8–7: sol → fá sobre I64 – V7</td></tr>
        <tr><td><b>Bordadura</b></td><td>3–4–3: mi–fá–mi sobre I – V43 – I</td></tr>
        <tr><td><b>Livre</b></td><td>por salto, de preferência de cima (estilo clássico)</td></tr>
        </tbody></table>
        <p>A preparação se afrouxou; a <b>resolução nunca</b>. Não dobre a 7ª: baixo e soprano desceriam em 8ªs.</p>` },
      { tipo: "exemplo", titulo: "As quatro posições numa frase", intro: "Dó maior. O baixo usa V65, V43, V42 e V7; a melodia mostra três maneiras de tratar a 7ª.",
        camadas: [
          { titulo: "O baixo e as cifras", partitura: "tom: C maior\nbaixo: C3/1 B2 C3 D3 E3 F3 F3 E3 F3/2 G3/1 G3 C3/4", rotulos: ["baixo"], cifras: cifrar(D1, D1c),
            anotacoes: [[0, 1, "7̂ sobe"], [0, 6, "7ª"], [0, 7, "3̂"]],
            notas: [["decisao", "C. 1: I – V65 – I – V43 prolonga a tônica (bordadura 1–7–1, passagem 1–2–3)."],
              ["decisao", "C. 2: IV → V42 com o fá repetido no baixo: 7ª preparada, desce a mi (I6)."],
              ["checagem", "C. 3: ii65 – I64 – V7 – I; o 6/4 no 3º tempo."]] },
          { titulo: "Onde estão as 7ªs", partitura: "tom: C maior\nsoprano: P/1 F5/1 E5 P/1 P/4 P/2 P/1 F5/1 E5/4\nbaixo: C3/1 B2 C3 D3 E3 F3 F3 E3 F3/2 G3/1 G3 C3/4", rotulos: ["soprano", "baixo"], cifras: cifrar(D1, D1c),
            notas: [["decisao", "V65: fá5 como bordadura mi–fá–mi; 5ª d com si2, que resolve para dentro (dó–mi)."],
              ["decisao", "V7 da cadência: fá5 de passagem, 8–7 (sol5 → fá5 → mi5)."]],
            pausa: ["E no V42, quem tem a 7ª?", "O baixo (fá3). Fá na melodia daria 8ªs fá → mi; ela fica com si4, que sobe a dó5."] },
          { titulo: "A frase inteira", partitura: D1, cifras: cifrar(D1, D1c), rotulos: ["soprano", "baixo"],
            anotacoes: [[0, 1, "7ª"], [0, 6, "sensível"], [0, 8, "clímax"], [0, 10, "7ª (8–7)"]],
            notas: [["decisao", "C. 2: dó–lá–si–dó sobre I6–IV–V42–I6: a sensível sobe enquanto a 7ª desce no baixo."],
              ["decisao", "Clímax lá5 (5ª do ii65); a descida lá–sol–fá–mi atravessa o 6/4 e a 7ª do V7."],
              ["rejeitada", "Dó5 sobre o ii65 (7ª preparada): correto, mas parado três tempos e sem clímax."]],
            pausa: ["Por que V43 (e não V7) no 4º tempo do c. 1?", "Para o baixo ir dó–ré–mi por grau (1–2–3 contra 3–2–1 na melodia); com sol no baixo, ele saltaria."] },
        ] },
      { tipo: "exemplo", titulo: "Em menor: V42, a cadência de engano e a 7ª que cai", intro: "Lá menor: sol♯ da escala harmônica; a 7ª do V7 continua sendo 4̂ (ré).",
        camadas: [
          { titulo: "Esqueleto", partitura: "tom: A menor\nbaixo: A2/2 D3 D3 C3 E3 F3 D3 E3 A2/4", rotulos: ["baixo"], cifras: cifrar(D2, D2c),
            notas: [["decisao", "iv → V42 (ré preso no baixo) → i6; V7 → VI (engano); depois a cadência perfeita."]] },
          { titulo: "Com a melodia", partitura: D2, cifras: cifrar(D2, D2c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 4, "7ª"], [0, 5, "resolve no VI"]],
            notas: [["decisao", "C. 3: a 7ª ré5 desce a dó5 mesmo com o baixo indo ao VI: quem é enganado é o baixo."],
              ["decisao", "Cadência final: 7ª implícita; melodia si–sol♯–lá, a sensível sobe."],
              ["rejeitada", "Mi5 sobre o V7 do c. 3: correto, mas o engano perde a dissonância que marca a chegada ao VI."]],
            pausa: ["No V7 → VI a quatro vozes, o que se dobra no VI?", "A 3ª (dó): a sensível sobe a lá (sol♯ → fá seria 2ª A) e a 7ª desce a dó. Aqui dobrar a 3ª é a regra."] },
        ] },
      { tipo: "contraste", titulo: "7ª preparada × 7ª livre",
        a: { rotulo: "A — preparada (Barroco): o dó do ii fica e vira 7ª", ...ex("tom: G maior\nsoprano: D5/2 E5 C5 C5 B4/4\nbaixo: G2/2 C3 A2 D3 G2/4", "I IV ii V7 I") },
        b: { rotulo: "B — livre (Clássico): a 7ª entra por salto", ...ex("tom: G maior\nsoprano: D5/2 E5 A5 C5 B4/4\nbaixo: G2/2 C3 C3 D3 G2/4", "I IV ii6 V7 I") },
        pergunta: "Ambas resolvem dó → si. Em qual a 7ª soa como surpresa, e em qual como consequência?",
        comentario: "<p>A: o dó já soava (3ª do ii) e vira dissonância quando o baixo anda — tensão <b>gerada pelo baixo</b>, como retardo (estilo estrito). B: a 7ª é <b>atacada</b> por salto, como acento expressivo (Clássico). Nos dois, resolução descendente.</p>" },
      { tipo: "quebra", titulo: "A 7ª que sobe, a que se transfere e a que fica", html: `
        <table class="tabela-modos"><thead><tr><th>Caso</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Licença do V43 → I6</td><td>a 7ª sobe 4̂ → 5̂ em 10ªs com o baixo 2̂ → 3̂</td><td>descer dobraria o baixo do I6; só nessa posição</td></tr>
        <tr><td>7ª transferida</td><td>muda de voz no mesmo acorde (V7 → V42)</td><td>resolve na voz nova; comum no séc. XIX</td></tr>
        <tr><td>Beethoven, Sinfonia nº 1</td><td>começa num V7 de outro tom, sem preparação</td><td>a obra abre em tensão</td></tr>
        <tr><td>Schumann, 'Im wunderschönen Monat Mai'</td><td>termina no V7</td><td>a canção acaba como pergunta</td></tr>
        <tr><td>Satie, Gymnopédie nº 1; Chopin, Prelúdio op. 28 nº 4</td><td>7ªs estáticas ou deslizando, sem resolver</td><td>a 7ª vira timbre</td></tr>
        </tbody></table>` ,
        exemplos: [
          { rotulo: "A licença: V43 → I6 com a 7ª subindo em 10ªs", ...ex("tom: G maior\nsoprano: B4/1 C5 D5 E5 D5 C5 B4/2\nbaixo: G2/1 A2 B2 C3 D3 D3 G2/2", "I V43 I6 IV V V7 I"),
            perfil: { ...SET }, comentario: "Dó5 (7ª do V43) sobe a ré5 em 10ªs com o baixo lá2 → si2: a licença, aceita pelo verificador. A 7ª do V7 (8–7) desce normalmente." },
          { rotulo: "A 7ª suspensa no fim (à maneira de Schumann)", ...ex("tom: A menor\nsoprano: C5/2 C5 F5 E5 D5/4\nbaixo: A2/2 F3 D3 E3 E2/4", "i VI iv V V7"),
            perfil: { ...SET, set_setima: "info", dissonancia_resolucao: "info" }, comentario: "Para no V7 com a 7ª (ré5) no soprano: o ouvinte completa o ré → dó. Funciona no último acorde; no meio da frase soaria como erro." },
        ] },
    ],
    exercicios: [
      { id: "set1", titulo: "Completar: as 7ªs no lugar", modo: "completar", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: {} },
        cifras: "I V65 I V43 I6 IV V42 I6 ii6 I64 V7 I".split(" "),
        instrucoes: "<p>Sol maior. Escreva a melodia dos c. 2–4, uma nota por nota do baixo. No V42 a 7ª está no baixo: não a dobre. Clímax no início do c. 3; termine na tônica.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: B4/1 C5 B4 A4\nbaixo: G2/1 F#2 G2 A2 B2 C3 C3 B2 C3/2 D3/1 D3/1 G2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 C5 B4 A4 D5 E5 F#5 G5 E5/2 B4/1 A4/1 G4/4\nbaixo: G2/1 F#2 G2 A2 B2 C3 C3 B2 C3/2 D3/1 D3/1 G2/4",
        comentarioSolucao: "C. 2 sobe ré–mi–fá♯–sol em 10ªs e 6ªs: fá♯5 (sensível) sobe a sol5 enquanto o baixo, com a 7ª, desce a si2. Depois, descida até a tônica." },
      { id: "set2", titulo: "Menos apoio: cifras e melodia em ré menor", modo: "menos apoio", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifrasAluno: true, cifrasIniciais: "i V65 i",
        instrucoes: "<p>Ré menor. Escreva cifras e melodia. O baixo pede V43, V42 e cadência composta (6/4 – V7 – i). 7ªs descem um grau; dó♯ sobe.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/1 C#3 D3 E3 F3 G3 G3 F3 Bb2/2 A2/1 A2/1 D3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5 D5 C#5 D5 D5 C#5 D5 G5/2 F5/1 E5/1 D5/4\nbaixo: D3/1 C#3 D3 E3 F3 G3 G3 F3 Bb2/2 A2/1 A2/1 D3/4",
        solucaoCifras: "i V65 i V43 i6 iv V42 i6 iv6 i64 V7 i",
        comentarioSolucao: "Sol3 repetido (iv → V42): 7ª preparada no baixo; a melodia faz dó♯5 → ré5. O salto ré5 → sol5 (c. 3) dá o clímax." },
      { id: "set3", titulo: "Restrição: três 7ªs na melodia", modo: "restrição", perfil: { ...SET, set_setima_no_soprano: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, minSetimasSoprano: 3 }, cifrasAluno: true,
        instrucoes: "<p>Fá maior. Escreva cifras e melodia. <b>Restrição:</b> ao menos três 7ªs de acorde na melodia, todas resolvidas. Dica: a 7ª do ii65 pode ficar sobre o 6/4 e descer no V7.</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano:\nbaixo: F2/1 E2 F2 G2 A2 Bb2 Bb2 A2 Bb2/2 C3/1 C3/1 F2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: F maior\ncf: baixo\nsoprano: C5/1 Bb4 A4 Bb4 C5 D5 E5 F5 F5/2 F5/1 E5/1 F5/4\nbaixo: F2/1 E2 F2 G2 A2 Bb2 Bb2 A2 Bb2/2 C3/1 C3/1 F2/4",
        solucaoCifras: "I V65 I V43 I6 IV V42 I6 ii65 I64 V7 I",
        comentarioSolucao: "Si♭4 no V65 (→ lá4), si♭4 no V43 (→ dó5, licença do V43 → I6) e fá5 no ii65 (preparado, mantido no 6/4, → mi5 no V7)." },
      { id: "set4", titulo: "Livre: uma frase em mi menor", modo: "livre", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Mi menor, 4 compassos: baixo, melodia e cifras. V7 em ao menos duas inversões; cadência autêntica perfeita.</p>",
        texto: "tom: E menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: E menor\nsoprano: G4/1 F#4 G4 A4 G4 E5 D#5 E5 F#5/2 D#5/2 E5/4\nbaixo: E3/1 D#3 E3 F#3 E3 A2 A2 G2 A2/2 B2/2 E3/4",
        solucaoCifras: "i V65 i V43 i iv V42 i6 ii°6 V7 i",
        comentarioSolucao: "V65 e V43 como bordaduras da tônica (lá4 → sol4); V42 com o lá preso do iv. Melodia grave no início; clímax fá♯5 no c. 3." },
      { id: "set5", titulo: "Quebrar: terminar em suspenso", modo: "quebrar", perfil: { ...SET, set_setima: "info", dissonancia_resolucao: "info", set_setima_no_soprano: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: {}, minSetimasSoprano: 1 }, cifras: "I vi IV ii I64 V V7".split(" "),
        instrucoes: "<p>Dó maior. A frase termina num V7. <b>Quebre só aqui:</b> a 7ª (fá) na melodia no último acorde, sem resolver, como Schumann. Antes, nenhuma licença; faça o fá soar como pergunta.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/2 A2 F2 D3 G2 G2 G2/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/2 C5 A4 F5 E5 D5 F5/4\nbaixo: C3/2 A2 F2 D3 G2 G2 G2/4",
        comentarioSolucao: "Fá5 aparece no c. 2 (3ª do ii) e volta como 7ª final, sem ir a mi. O 6/4 – V prepara; o V7 dura um compasso inteiro." },
    ],
  }, { depoisDe: "retardos_harm" });

  // ================================================================ 2. As sétimas da sensível
  const S1 = "tom: A menor\nsoprano: E5/1 F5 E5 D5 C5 B4 C5 A4 D5/2 C5/1 B4/1 A4/4\nbaixo: A2/1 G#2 A2 B2 C3 D3 C3 D3 F3/2 E3/1 E3/1 A2/4";
  const S1c = "i vii°7 i vii°65 i6 vii°43 i6 iv vii°42 i64 V7 i";
  const S2 = "tom: C maior\nsoprano: E5/1 G5 A5 G5 F5 Ab5 G5 F5 E5/2 D5/2 C5/4\nbaixo: C3/1 E3 D3 E3 F3 F3 E3 F3 G3/2 G3/2 C3/4";
  const S2c = "I I6 viiø65 I6 IV vii°43 I6 ii6 I64 V7 I";

  T_.inserir(2, {
    id: "setima_sens", titulo: "As sétimas da sensível",
    objetivo: "Usar vii°7 e viiø7 como dominantes: resolver as duas dissonâncias, evitar as 5ªs escondidas, ouvir a ambiguidade do diminuto.",
    ouvir: [
      "Bach, Paixão segundo São Mateus: 'Barrabam!' num vii°7",
      "Mozart, Don Giovanni, ato II: a entrada do Comendador",
      "Beethoven, Sonata 'Patética', Grave: 7ªs diminutas no c. 1",
    ],
    esboco: "Em lá menor, escreva só baixo e soprano para i – vii°7 – i e para i6 – vii°43 – i6. Em cada vii°7, qual nota é a 7ª, e qual é a sensível?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Dominante sem fundamental", html: `
        <p>O vii7 é uma <b>dominante</b> (7̂, 4̂ e 2̂, mais uma 7ª própria); lido como V9 sem fundamental, vai aonde o V7 iria.</p>
        <table class="tabela-modos"><thead><tr><th>Acorde</th><th>Em</th><th>Notas (tônica dó)</th><th>Qualidade</th></tr></thead><tbody>
        <tr><td><b>vii°7</b></td><td>menor (natural da escala harmônica)</td><td>si–ré–fá–lá♭</td><td>três 3ªs menores; duas 5ªs diminutas</td></tr>
        <tr><td><b>vii°7</b></td><td>maior, por mistura</td><td>si–ré–fá–lá♭</td><td>o mesmo acorde, com o 6º grau emprestado</td></tr>
        <tr><td><b>viiø7</b></td><td>maior (diatônico)</td><td>si–ré–fá–lá</td><td>tríade diminuta + 7ª menor</td></tr>
        </tbody></table>
        <h3>Resoluções</h3>
        <table class="tabela-modos"><thead><tr><th>Nota</th><th>Vai a</th></tr></thead><tbody>
        <tr><td>Fundamental (7̂)</td><td>sobe a 1̂</td></tr>
        <tr><td>7ª (6̂ ou ♭6̂)</td><td>desce a 5̂ — no vii°7, meio tom</td></tr>
        <tr><td>5ª (4̂)</td><td>desce a 3̂</td></tr>
        <tr><td>3ª (2̂)</td><td>livre: 1̂ ou 3̂</td></tr>
        </tbody></table>
        <ul><li><b>viiø7 → I:</b> ré–lá é 5ª justa; o ré sobe e o I fica com a 3ª dobrada (senão, 5ªs paralelas). No vii°7 (ré–lá♭, 5ª d), evite só com o baixo.</li>
        <li><b>viiø7 → V7:</b> o lá desce a sol e o resto fica.</li></ul>
        <h3>Inversões</h3>
        <table class="tabela-modos"><thead><tr><th>Cifra</th><th>Baixo</th><th>Vai a</th></tr></thead><tbody>
        <tr><td>vii°7</td><td>7̂</td><td>i (1̂)</td></tr>
        <tr><td>vii°65</td><td>2̂</td><td>i6 (3̂) — passagem 1–2–3, como o V43</td></tr>
        <tr><td>vii°43</td><td>4̂</td><td>i6 (3̂) — o baixo desce como a 7ª do V42</td></tr>
        <tr><td>vii°42</td><td>♭6̂ = a 7ª</td><td>5̂: V, ou i64 cadencial — o baixo desce meio tom</td></tr>
        </tbody></table>
        <p>Quem tem a 7ª desce; no vii°42 é o baixo, e a melodia não o dobra.</p>
        <h3>Um acorde sem centro</h3>
        <p>Quatro 3ªs menores iguais: qualquer nota pode ser a sensível (só há três diminutos). O tom vem da resolução — base da modulação enarmônica (nível 4).</p>` },
      { tipo: "exemplo", titulo: "As quatro posições em lá menor", intro: "Cada inversão do vii°7 leva o baixo a um lugar diferente; a sensível e a 7ª resolvem sempre igual.",
        camadas: [
          { titulo: "O baixo e as cifras", partitura: "tom: A menor\nbaixo: A2/1 G#2 A2 B2 C3 D3 C3 D3 F3/2 E3/1 E3/1 A2/4", rotulos: ["baixo"], cifras: cifrar(S1, S1c),
            notas: [["decisao", "C. 1: vii°7 em bordadura (lá–sol♯–lá), vii°65 em passagem (lá–si–dó). C. 2: vii°43 entre dois i6 (3–4–3)."],
              ["decisao", "C. 3: iv → vii°42; o baixo (a 7ª) desce meio tom, fá → mi."],
              ["checagem", "vii°42 → i64, não i: com o baixo em mi, a tônica só pode ser 6/4 cadencial."]] },
          { titulo: "A melodia", partitura: S1, cifras: cifrar(S1, S1c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 1, "7ª"], [0, 3, "5ª do acorde"], [1, 8, "7ª"]],
            notas: [["decisao", "Fá5 sobre sol♯2: 7ª do vii°7 como bordadura de mi5; a 7ª d resolve na 5ª J."],
              ["decisao", "vii°65: ré5 (4̂) desce a dó5, como o fá no V7."],
              ["rejeitada", "Fá5 sobre o vii°42 dobraria a 7ª do baixo (8ªs fá → mi); ré5 → dó5 não dobra nada."]],
            pausa: ["Por que vii°43 (e não vii°7) entre os dois i6?", "O baixo em dó (3̂) pede bordadura superior: ré (4̂) é a 5ª de sol♯°, logo vii°43 — o lugar do V42 na regra da oitava."] },
        ] },
      { tipo: "exemplo", titulo: "Em maior: o viiø7 diatônico e o vii°7 emprestado", intro: "Dó maior: lá (viiø7) e lá♭ (vii°7) na mesma frase.",
        camadas: [
          { titulo: "A frase", partitura: S2, cifras: cifrar(S2, S2c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 2, "7ª (lá)"], [0, 5, "7ª (lá♭)"]],
            notas: [["decisao", "C. 1: viiø65 borda o I6 (mi–ré–mi); lá5 → sol5 e o ré do baixo sobe, evitando as 5ªs."],
              ["decisao", "C. 2: o fá3 do IV fica e vira vii°43 com lá♭5 — clímax e 7ª, cai meio tom a sol5."],
              ["checagem", "Lá5 → sol5 sobre mi3 (10ª); sobre dó3 seriam 5ªs paralelas ré–lá → dó–sol."]],
            pausa: ["Ouça lá5 e depois lá♭5: muda a função?", "Não: os dois são dominantes. Muda a cor — lá♭ a meio tom de sol, dó menor por um instante."] },
        ] },
      { tipo: "contraste", titulo: "viiø65 × vii°65 na mesma frase",
        a: { rotulo: "A — viiø65 (lá natural)", ...ex("tom: C maior\nsoprano: E5/1 G5 A5 G5 F5/2 E5/1 D5/1 C5/4\nbaixo: C3/1 E3 D3 E3 F3/2 G3/1 G3/1 C3/4", "I I6 viiø65 I6 ii6 I64 V7 I") },
        b: { rotulo: "B — vii°65 (lá♭, por mistura)", ...ex("tom: C maior\nsoprano: E5/1 G5 Ab5 G5 F5/2 E5/1 D5/1 C5/4\nbaixo: C3/1 E3 D3 E3 F3/2 G3/1 G3/1 C3/4", "I I6 vii°65 I6 ii6 I64 V7 I") },
        pergunta: "Só uma nota muda. Qual das duas versões pede mais a resolução, e por quê?",
        comentario: "<p>A: lá5 a um tom de sol5 — 7ª suave, quase passagem. B: lá♭5 forma 5ª d com o ré do baixo e fica a meio tom de sol: atração maior, frase mais escura. vii°7 para as crises; viiø7 para o dia a dia.</p>" },
      { tipo: "quebra", titulo: "A 7ª diminuta como efeito", html: `
        <table class="tabela-modos"><thead><tr><th>Obra</th><th>O diminuto como</th></tr></thead><tbody>
        <tr><td>Bach, Paixão segundo São Mateus</td><td>o grito 'Barrabam!'</td></tr>
        <tr><td>Mozart, Don Giovanni</td><td>a entrada do Comendador</td></tr>
        <tr><td>Weber, Der Freischütz</td><td>o sobrenatural (Garganta do Lobo)</td></tr>
        <tr><td>Beethoven, 'Patética'</td><td>tensão já no c. 1</td></tr>
        <tr><td>Ópera do séc. XIX</td><td>tremolo de susto (clichê)</td></tr>
        </tbody></table>
        <p>A 7ª continua resolvendo; quebra-se a <b>função</b>: diminuto sem preparação no tempo forte, longo, ou deslizando a outro diminuto por semitom sem ir à tônica. A simetria deixa resolver noutro tom.</p>`,
        exemplos: [
          { rotulo: "Deslizando por diminutos", ...ex("tom: C maior\nsoprano: G5/2 Ab5 G5 F#5 F5 F5 E5/4\nbaixo: C3/2 B2 Bb2 A2 Ab2 G2 C3/4", "I vii°7 vii°42/ii vii°65/V vii°42 V7 I"),
            perfil: { ...SET, intervalo_melodico_aumentado_diminuto: "info" }, comentario: "Baixo cromático dó → sol sob quatro diminutos. Cada 7ª desce, mas nenhum vai à sua tônica: o tom some até o V7. Os semitons cromáticos são o efeito." },
          { rotulo: "O diminuto que muda de tom", ...ex("tom: C menor\nsoprano: Eb5/2 F5 E5 F5 D5 C5\nbaixo: C3/2 B2 C3 D3 E3 A2", "i vii°7=a:vii°65 i6 iv V7 i"),
            perfil: { ...SET }, comentario: "Si–ré–fá–lá♭ (vii°7 de dó menor) relido como sol♯–si–ré–fá, vii°65 de lá menor: fá → mi♮, e a cadência confirma lá menor." },
        ] },
    ],
    exercicios: [
      { id: "sns1", titulo: "Completar: o vii°7 em ré menor", modo: "completar", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: {} },
        cifras: "i vii°7 i vii°65 i6 vii°43 i6 iv vii°42 i64 V7 i".split(" "),
        instrucoes: "<p>Ré menor. Escreva a melodia dos c. 2–4. No vii°43 a 7ª (si♭) pode ir à melodia; no vii°42 ela está no baixo. Dó♯ sobe sempre.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5 D5 C#5\nbaixo: D3/1 C#3 D3 E3 F3 G3 F3 G2 Bb2/2 A2/1 A2/1 D3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5 D5 C#5 D5 Bb4 A4 D5 E5/2 D5/1 C#5/1 D5/4\nbaixo: D3/1 C#3 D3 E3 F3 G3 F3 G2 Bb2/2 A2/1 A2/1 D3/4",
        comentarioSolucao: "Si♭4 (7ª do vii°43) → lá4; salto lá4 → ré5 contra o baixo descendo. No vii°42, mi5 → ré5 enquanto o baixo desce si♭ → lá." },
      { id: "sns2", titulo: "Menos apoio: sol menor", modo: "menos apoio", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifrasAluno: true, cifrasIniciais: "i vii°7 i",
        instrucoes: "<p>Sol menor. Escreva cifras e melodia: vii°7, vii°65, vii°43 (7ª preparada pelo iv) e vii°42 antes da cadência composta.</p>",
        texto: "tom: G menor\ncf: baixo\nsoprano:\nbaixo: G2/1 F#2 G2 A2 Bb2 C3 C3 Bb2 Eb3/2 D3/1 D3/1 G2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G menor\ncf: baixo\nsoprano: D5/1 C5 Bb4 C5 Bb4 Eb5/2 D5/1 C5/2 Bb4/1 A4/1 G4/4\nbaixo: G2/1 F#2 G2 A2 Bb2 C3 C3 Bb2 Eb3/2 D3/1 D3/1 G2/4",
        solucaoCifras: "i vii°7 i vii°65 i6 iv vii°43 i6 vii°42 i64 V7 i",
        comentarioSolucao: "Mi♭5 (3ª do iv) fica e vira 7ª do vii°43, resolvendo em ré5. vii°42 → 6/4 cadencial; descida por grau até a tônica." },
      { id: "sns3", titulo: "Restrição: lá natural e lá bemol", modo: "restrição", perfil: { ...SET, set_cifras_pedidas: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, cifrasPedidas: ["viiø7", "vii°7"] }, cifrasAluno: true,
        instrucoes: "<p>Dó maior. Escreva cifras e melodia. <b>Restrição:</b> um viiø7 (lá) e um vii°7 (lá♭), em qualquer inversão, com as 7ªs resolvidas. Cuidado com a 5ª J ré–lá do viiø7.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 D3 E3 F3 F3 E3 F3/2 G3/2 G3/2 C3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: C5/1 F5 G5 F5 Ab5 G5 F5/2 E5/2 D5/2 C5/4\nbaixo: C3/1 D3 E3 F3 F3 E3 F3/2 G3/2 G3/2 C3/4",
        solucaoCifras: "I viiø65 I6 IV vii°43 I6 ii6 I64 V7 I",
        comentarioSolucao: "viiø65 de passagem dó–ré–mi (melodia em 10ªs); vii°43 sobre o fá do IV, lá♭5 (clímax) → sol5; depois a cadência composta." },
      { id: "sns4", titulo: "Livre: dó menor", modo: "livre", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Dó menor, 4 compassos: baixo, melodia e cifras, com o vii°7 em ao menos duas posições e cadência autêntica perfeita.</p>",
        texto: "tom: C menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: C menor\nsoprano: Eb5/1 D5 C5 B4 C5 Ab4 G4 C5 D5/2 C5/1 B4/1 C5/4\nbaixo: C3/1 B2 C3 D3 Eb3 F3 Eb3 F2 Ab2/2 G2/1 G2/1 C3/4",
        solucaoCifras: "i vii°7 i vii°65 i6 vii°43 i6 iv vii°42 i64 V7 i",
        comentarioSolucao: "As quatro posições: vii°7 e vii°65 em volta da tônica, vii°43 com a 7ª lá♭4 na melodia, vii°42 com lá♭2 → sol2 no baixo." },
      { id: "sns5", titulo: "Quebrar: diminutos em cadeia", modo: "quebrar", perfil: { ...SET, intervalo_melodico_aumentado_diminuto: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: {} }, cifras: "i vii°7 vii°43/iv vii°65/V vii°42 V7 i".split(" "),
        instrucoes: "<p>Mi menor. Três diminutos sobre baixo cromático antes do V7. <b>A quebra:</b> nenhum vai à sua tônica; há semitons cromáticos. Escreva a melodia (uma nota por acorde), cada 7ª descendo um grau.</p>",
        texto: "tom: E menor\ncf: baixo\nsoprano:\nbaixo: E3/2 D#3 D3 C#3 C3 B2 E3/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: E menor\ncf: baixo\nsoprano: B4/2 C5 B4 A#4 A4 A4 G4/4\nbaixo: E3/2 D#3 D3 C#3 C3 B2 E3/4",
        comentarioSolucao: "Dó5 – si4 – lá♯4 – lá4 em 6ªs com o baixo; cada 7ª desce, e lá4 vira 7ª do V7. Só o V7 devolve mi menor." },
    ],
  }, { depoisDe: "setima_dom" });

  // ================================================================ 3. Sétimas diatônicas
  const P1 = "tom: G maior\nsoprano: G5/2 F#5 E5 D5 C5 C5 B4/4\nbaixo: G2/2 G2 C3 E3 A2 D3 G2/4";
  const P1c = "I I7 IV vi7 ii7 V7 I";
  const P2 = "tom: C maior\nsoprano: E5/2 E5 D5 D5 C5 C5 B4 C5/4\nbaixo: C3/2 A2 B2 G2 A2 F2 G2 C3/4";
  const P2c = "I IV65 viiø7 iii65 vi7 ii65 V7 I";

  T_.inserir(2, {
    id: "setimas_diat", titulo: "Sétimas diatônicas",
    objetivo: "Usar ii7/ii65 como pré-dominante e IV7, vi7, iii7 e I7 com preparação e resolução, sobretudo em cadeias de quintas.",
    ouvir: [
      "Corelli, op. 5 e op. 6: cadeias de sétimas em quintas",
      "Vivaldi, L'estro armonico op. 3: episódios em quintas",
      "Corais de Bach: ii65 antes da cadência",
    ],
    esboco: "Em dó maior, sobre o baixo dó–lá–si–sol–lá–fá–sol–dó, que acordes de sétima você poria? Tente uma melodia em que cada nota se repita uma vez antes de descer.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Sétimas sobre todos os graus", html: `
        <p>Qualquer grau aceita 7ª: <b>preparada</b> (no Barroco estrito, sempre) e <b>resolvida descendo</b>. Mudam a qualidade e o uso.</p>
        <table class="tabela-modos"><thead><tr><th>Acorde</th><th>Dó maior</th><th>Lá menor</th><th>7ª → resolução</th><th>Uso</th></tr></thead><tbody>
        <tr><td><b>ii7 / ii65</b></td><td>ré–fá–lá–dó (m7)</td><td>siø7: si–ré–fá–lá</td><td>1̂ → 7̂ (sobre o V)</td><td>a pré-dominante com 7ª; o ii65 é o 4º grau subindo da regra da oitava</td></tr>
        <tr><td><b>IV7</b></td><td>fá–lá–dó–mi (M7)</td><td>iv7: ré–fá–lá–dó</td><td>3̂ → 2̂ (sobre V ou vii°)</td><td>pré-dominante; cuidado com 5ªs fá–dó → sol–ré a quatro vozes</td></tr>
        <tr><td><b>vi7</b></td><td>lá–dó–mi–sol</td><td>VI7: fá–lá–dó–mi</td><td>5̂ → 4̂ (sobre ii)</td><td>elo de cadeia: vi7 → ii7 → V7</td></tr>
        <tr><td><b>iii7</b></td><td>mi–sol–si–ré</td><td>III7: dó–mi–sol–si</td><td>2̂ → 1̂ (sobre vi)</td><td>quase só em sequências</td></tr>
        <tr><td><b>I7</b></td><td>dó–mi–sol–si (M7)</td><td>i7: lá–dó–mi–sol</td><td>7̂ → 6̂ (sobre IV)</td><td>7ª de passagem 8–7 levando ao IV; em sequência</td></tr>
        </tbody></table>
        <h3>A preparação</h3>
        <ul><li><b>Nota comum:</b> a mesma voz mantém a nota que vira 7ª (ii7: a tônica, vinda do I ou do vi; IV7: 3̂, vinda do I).</li>
        <li><b>De passagem:</b> 8–7 sobre o mesmo baixo (I → I7).</li></ul>
        <h3>A cadeia de quintas</h3>
        <ul><li>A 3ª de cada acorde é a 7ª do seguinte.</li>
        <li><b>Par externo:</b> soprano 3 → 7 → 3 → 7 (repete, desce um grau); baixo em fundamentais ou alternando 7 e 65.</li>
        <li><b>A quatro vozes:</b> acordes completos e incompletos alternados.</li>
        <li>ii65 → I64 → V: a 7ª pode ficar sobre o 6/4 e descer no V.</li></ul>` },
      { tipo: "exemplo", titulo: "Uma escala com quatro sétimas", intro: "Sol maior. A melodia desce a oitava sol–sol; cada passo de grau vira a 7ª de um acorde ou a sua resolução.",
        camadas: [
          { titulo: "Baixo e cifras", partitura: "tom: G maior\nbaixo: G2/2 G2 C3 E3 A2 D3 G2/4", rotulos: ["baixo"], cifras: cifrar(P1, P1c),
            notas: [["decisao", "I → I7 sobre sol: 7ª de passagem (8–7). Depois IV e a cadeia vi7 – ii7 – V7 – I."],
              ["checagem", "IV → vi7 não é retrogressão aqui: prepara a cadeia de quintas até o fim."]] },
          { titulo: "A melodia", partitura: P1, cifras: cifrar(P1, P1c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 1, "7ª (8–7)"], [0, 3, "7ª (8–7)"], [0, 5, "7ª preparada"]],
            notas: [["decisao", "Fá♯5 (7ª do I7) → mi5 sobre o IV: o I7 age como dominante do IV."],
              ["decisao", "Ré5 (7ª do vi7, de passagem) → dó5; dó5 fica e vira 7ª do V7, → si4."],
              ["rejeitada", "V (ré3) sob fá♯5: mais comum, mas perde a 7ª maior sobre a tônica."]],
            pausa: ["Por que a 7ª do ii7 (sol) não está no par externo?", "A melodia está na 3ª (dó), que será 7ª do V7; o sol fica numa voz interna. Só uma 7ª da cadeia cabe no soprano."] },
        ] },
      { tipo: "exemplo", titulo: "A cadeia 7 – 65", intro: "Dó maior. Quintas descendentes; baixo alternando estado fundamental e 1ª inversão (65).",
        camadas: [
          { titulo: "Baixo e cifras", partitura: "tom: C maior\nbaixo: C3/2 A2 B2 G2 A2 F2 G2 C3/4", rotulos: ["baixo"], cifras: cifrar(P2, P2c),
            notas: [["decisao", "Fundamentais dó–fá–si–mi–lá–ré–sol–dó; com as 1ªs inversões, baixo dó–lá–si–sol–lá–fá–sol–dó, sem o trítono fá–si."]] },
          { titulo: "Com a melodia", partitura: P2, cifras: cifrar(P2, P2c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 1, "7ª"], [0, 3, "7ª"], [0, 5, "7ª"]],
            notas: [["decisao", "Melodia 3–7, 3–7: mi5 é 3ª do I e 7ª do IV65, desce a ré5, que vira 7ª do iii65…"],
              ["rejeitada", "Melodia subindo no meio: quebraria a preparação, e as 7ªs entrariam por salto."],
              ["checagem", "7ªs da melodia preparadas e resolvidas; as dos acordes em estado fundamental ficam nas vozes internas."]],
            pausa: ["As 5ªs J a cada dois acordes (mi5/lá2, ré5/sol2…) são problema?", "Não: nunca consecutivas, chegam por movimento oblíquo. É o padrão — no próximo capítulo, sequência."] },
        ] },
      { tipo: "contraste", titulo: "Tríades × sétimas sobre o mesmo baixo",
        a: { rotulo: "A — tríades (I IV6 vii° iii6 vi ii6 V I)", ...ex("tom: C maior\nsoprano: G5/2 F5 F5 E5 E5 D5 D5 C5/4\nbaixo: C3/2 A2 B2 G2 A2 F2 G2 C3/4", "I IV6 vii° iii6 vi ii6 V I") },
        b: { rotulo: "B — sétimas (I IV65 viiø7 iii65 vi7 ii65 V7 I)", ...ex(P2, P2c) },
        pergunta: "O baixo é o mesmo. O que as sétimas acrescentam ao movimento?",
        comentario: "<p>A: acordes estáveis; o impulso vem só do baixo. B: cada 7ª, preparada no acorde anterior, pede o seguinte — a 'corrente' barroca. A cadência é a primeira chegada sem dissonância.</p>" },
      { tipo: "quebra", titulo: "Sétimas sem preparação e sétimas paralelas", html: `
        <table class="tabela-modos"><thead><tr><th>Estilo / obra</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Clássico</td><td>ii7 e IV7 sem preparação</td><td>7ª atacada, como no V7</td></tr>
        <tr><td>Satie, Gymnopédie nº 1</td><td>duas 7ªs maiores alternadas, sem resolver</td><td>imobilidade, tempo suspenso</td></tr>
        <tr><td>Debussy, Ravel</td><td>acordes com 7ª e 9ª em paralelo (<i>planing</i>)</td><td>a 7ª vira timbre</td></tr>
        </tbody></table>
        <p>Perde-se a corrente de tensões barroca; ganham-se cor e ambiguidade.</p>`,
        exemplos: [
          { rotulo: "Sétimas em paralelo (planing), depois uma cadência clássica", ...ex("tom: C maior\nsoprano: B4/1 C5 D5 E5 F5/2 E5/2\nbaixo: C3/1 D3 E3 F3 G3/2 C3/2", "I7 ii7 iii7 IV7 V7 I"),
            perfil: { ...SET, set_setima: "info" }, comentario: "7ªs paralelas subindo (si/dó, dó/ré, ré/mi, mi/fá): o verificador anota, mas é a ideia. No V7, fá5 → mi5: o contraste mostra o que o planing suspende." },
          { rotulo: "Duas 7ªs maiores alternadas, sem resolução", ...ex("tom: D maior\nsoprano: D5/2 F#5/2~ F#5/2 C#5/2 D5/2 F#5/2~ F#5/2 C#5/2\nbaixo: G2/4 D3/4 G2/4 D3/4", "IV7 I7 IV7 I7"),
            perfil: { ...SET, set_setima: "info", dissonancia_resolucao: "info", dissonancia_aproximacao: "info" }, comentario: "IV7 e I7 alternados, como na Gymnopédie nº 1 (outra melodia). Fá♯ fica ligado como 3ª do I7; dó♯ sobe a ré. Nada resolve: cor." },
        ] },
    ],
    exercicios: [
      { id: "sd1", titulo: "Completar: a cadeia 7 – 65 em ré maior", modo: "completar", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: {} },
        cifras: "I IV65 viiø7 iii65 vi7 ii65 V7 I".split(" "),
        instrucoes: "<p>Ré maior. A melodia começa em fá♯5 (3ª do I), repetido como 7ª do IV65. Continue: nos acordes em 1ª inversão (65), a 7ª preparada; nos em estado fundamental, a resolução.</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano: F#5/2 F#5\nbaixo: D3/2 B2 C#3 A2 B2 G2 A2 D3/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: D maior\ncf: baixo\nsoprano: F#5/2 F#5 E5 E5 D5 D5 C#5 D5/4\nbaixo: D3/2 B2 C#3 A2 B2 G2 A2 D3/4",
        comentarioSolucao: "Fá♯–fá♯–mi–mi–ré–ré–dó♯–ré: cada nota é 3ª de um acorde e 7ª do seguinte." },
      { id: "sd2", titulo: "Menos apoio: a cadeia em lá menor", modo: "menos apoio", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifrasAluno: true, cifrasIniciais: "i iv65",
        instrucoes: "<p>Lá menor. Cadeia de quintas alternando 7 e 65. Escreva cifras (iv7, VII7, III7, VI7, iiø7, V7) e melodia, com 7ªs preparadas e resolvidas.</p>",
        texto: "tom: A menor\ncf: baixo\nsoprano:\nbaixo: A2/2 F2 G2 E2 F2 D2 E2 A2/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: A menor\ncf: baixo\nsoprano: C5/2 C5 B4 B4 A4 A4 G#4 A4/4\nbaixo: A2/2 F2 G2 E2 F2 D2 E2 A2/4",
        solucaoCifras: "i iv65 VII7 III65 VI7 iiø65 V7 i",
        comentarioSolucao: "Em menor natural a cadeia passa por VII7 e III7; o sol♯ só aparece no V7. A 7ª do iiø65 (lá) vem do VI7 e resolve na sensível." },
      { id: "sd3", titulo: "Restrição: só sétimas preparadas", modo: "restrição", perfil: { ...SET, set_setima_preparada: "erro" }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true,
        instrucoes: "<p>Fá maior, estilo barroco. Escreva cifras e melodia com ao menos um IV7 e um ii7. <b>Restrição:</b> toda 7ª nas vozes externas vem preparada.</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano:\nbaixo: F3/2 Bb2 C3 D3 G2 C3 F2/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: F maior\ncf: baixo\nsoprano: A5/2 A5 G5 F5 F5 E5 F5/4\nbaixo: F3/2 Bb2 C3 D3 G2 C3 F2/4",
        solucaoCifras: "I IV7 V vi ii7 V7 I",
        comentarioSolucao: "Lá5 (3ª do I) vira 7ª do IV7 → sol5; fá5 (3ª do vi) vira 7ª do ii7 → mi5. A 7ª do V7 (si♭) fica implícita." },
      { id: "sd4", titulo: "Livre: uma cadeia de sétimas em ré menor", modo: "livre", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Ré menor, 4 compassos: baixo, melodia e cifras. Cadeia de quintas com ao menos três 7ªs diatônicas além do V7; cadência autêntica perfeita.</p>",
        texto: "tom: D menor\nsoprano:\nbaixo:", duracao: 2,
        solucao: "tom: D menor\nsoprano: F5/2 F5 E5 E5 D5 D5 C#5 D5/4\nbaixo: D3/2 Bb2 C3 A2 Bb2 G2 A2 D3/4",
        solucaoCifras: "i iv65 VII7 III65 VI7 iiø65 V7 i",
        comentarioSolucao: "i – iv7 – VII7 – III7 – VI7 – iiø7 – V7 – i; baixo alternando 7 e 65 (sem o trítono si♭–mi), melodia 3ª–7ª em cada par." },
      { id: "sd5", titulo: "Quebrar: sétimas em paralelo", modo: "quebrar", perfil: { ...SET, set_setima: "info" }, nivel: 6, contexto: { nivel: 6, plano: {} },
        cifras: "I7 ii7 iii7 IV7 V7 I".split(" "),
        instrucoes: "<p>Sol maior. <b>A quebra:</b> nos quatro primeiros acordes a melodia fica uma 7ª acima do baixo e sobe com ele (planing). No V7 → I, resolva a 7ª.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/1 A2 B2 C3 D3/2 G2/2", duracao: 1, alvoCompassos: 2,
        solucao: "tom: G maior\ncf: baixo\nsoprano: F#4/1 G4 A4 B4 C5/2 B4/2\nbaixo: G2/1 A2 B2 C3 D3/2 G2/2",
        comentarioSolucao: "Fá♯4–sol4–lá4–si4: quatro 7ªs paralelas. O dó5 do V7 é a única tratada à maneira antiga — a volta à gramática." },
    ],
  }, { depoisDe: "setima_sens" });

  // ================================================================ 4. Sequências
  const SEQ = { ...SET, intervalo_melodico_aumentado_diminuto: "aviso", set_sequencia: "erro" };
  const sq = (modelo, copias, real) => ({ sequencia: { modelo, copias, ...(real ? { real: true } : {}) } });
  const Q1 = "tom: C maior\nsoprano: E5/2 F5 D5 E5 C5 D5 B4 C5\nbaixo: C3/2 F3 B2 E3 A2 D3 G2 C3";
  const Q2 = "tom: C maior\nsoprano: E5/2 E5 D5 D5 C5 C5 B4 C5\nbaixo: C3/2 F3 B2 E3 A2 D3 G2 C3";
  const Q3 = "tom: C maior\nsoprano: G4/1 A4 A4 B4 B4 C5 C5 D5 D5/2 C5/2\nbaixo: C3/1 C3 D3 D3 E3 E3 F3 F3 G3/2 C3/2";
  const Q4 = "tom: C maior\nsoprano: E5/1 E5 F5 F5 G5 G5 A5 A5 G5/2 E5/2\nbaixo: C3/1 C3 D3 D3 E3 E3 F3 F3 G3/2 C3/2";
  const Q5 = "tom: C maior\nsoprano: E5/2 D5 C5 B4 A4 G4 A4 B4 C5/4\nbaixo: C3/2 G2 A2 E2 F2 C2 F2 G2 C3/4";
  const Q6 = "tom: C maior\nsoprano: E5/2 D5 C5 B4 A4 G4 A4 B4 C5/4\nbaixo: C3/2 B2 A2 G2 F2 E2 F2 G2 C3/4";

  T_.inserir(2, {
    id: "sequencias", titulo: "Sequências",
    objetivo: "Compor sequências (quintas, 5–6, Romanesca, Monte, Fonte) copiando o modelo voz por voz, e saber onde pará-las.",
    ouvir: [
      "Pachelbel, Cânone em ré: o baixo da Romanesca",
      "Bach, fugas do Cravo Bem Temperado: os episódios",
      "Minuetos de Haydn e Mozart: Monte e Fonte após a barra dupla",
    ],
    esboco: "Escreva um compasso em dó maior (baixo e soprano, duas mínimas) e copie-o duas vezes, um grau abaixo a cada vez, sem mudar nenhum intervalo das vozes. O que acontece com as qualidades dos acordes?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Modelo e cópia", html: `
        <p>Um <b>modelo</b> (baixo, melodia e harmonia) repetido em outros graus. Partimenti: os <i>moti</i> do baixo; Riepel (1755): Monte, Fonte, Ponte.</p>
        <table class="tabela-modos"><thead><tr><th>Ponto</th><th>Regra</th></tr></thead><tbody>
        <tr><td><b>Cópia</b></td><td>todas as vozes: mesmo ritmo e intervalos (em graus), mesma transposição</td></tr>
        <tr><td><b>Condução</b></td><td>modelo limpo → cópia limpa; confira a junção modelo → cópia</td></tr>
        <tr><td><b>Diatônica</b></td><td>qualidades mudam; vii° em estado fundamental e trítono no baixo (fá–si) tolerados</td></tr>
        <tr><td><b>Real</b></td><td>cópia exata em semitons; sai do tom</td></tr>
        <tr><td><b>Extensão</b></td><td>modelo + duas cópias; termina numa cadência</td></tr>
        </tbody></table>
        <h3>Os tipos principais</h3>
        <table class="tabela-modos"><thead><tr><th>Tipo</th><th>Fundamentais</th><th>Baixo típico (dó maior)</th><th>Observação</th></tr></thead><tbody>
        <tr><td><b>Quintas descendentes</b></td><td>4ª acima, 5ª abaixo</td><td>dó–fá–si–mi–lá–ré–sol–dó</td><td>a mais comum; aceita 7ªs em cadeia e inversões alternadas (7–65)</td></tr>
        <tr><td><b>5–6 ascendente</b></td><td>3ª abaixo, 4ª acima</td><td>dó–dó–ré–ré–mi–mi…</td><td>a voz superior faz 5–6 sobre cada nota do baixo: o 6 quebra as 5ªs paralelas de tríades subindo por grau</td></tr>
        <tr><td><b>Descendente 5–6 / Romanesca</b></td><td>4ª abaixo, 2ª acima</td><td>dó–sol–lá–mi–fá–dó (ou dó–si–lá–sol–fá–mi)</td><td>o baixo do Cânone de Pachelbel; as fundamentais descem por 3ªs a cada par</td></tr>
        <tr><td><b>Monte</b></td><td>V7/IV–IV, V7/V–V</td><td>mi–fá, fá♯–sol</td><td>sobe um grau; tensão crescente</td></tr>
        <tr><td><b>Fonte</b></td><td>V7/ii–ii, V7–I</td><td>dó♯–ré, si–dó</td><td>desce um grau, de menor para maior; relaxamento</td></tr>
        <tr><td><b>Ponte</b></td><td>V prolongado</td><td>sol pedal</td><td>não é sequência: é a dominante sustentada antes da volta do tema</td></tr>
        </tbody></table>` },
      { tipo: "exemplo", titulo: "Quintas descendentes, com e sem sétimas", intro: "Dó maior. Modelo: o compasso 1. Cada cópia desce um grau.",
        camadas: [
          { titulo: "Tríades", ...ex(Q1, "I IV vii° iii vi ii V I"), contexto: sq([0, 4], 3), anotacoes: [[1, 0, "modelo"], [1, 2, "cópia 1"], [1, 4, "cópia 2"], [1, 6, "cópia 3 = cadência"]],
            notas: [["decisao", "Modelo: baixo dó3 → fá3 (4ª acima), melodia mi5 → fá5 (grau acima), 10ª → 8ª; cada cópia um grau abaixo."],
              ["decisao", "A 3ª cópia (sol → dó, si → dó) já é a cadência V–I."],
              ["checagem", "8ªs por movimento direto com o soprano por grau, nunca consecutivas; a junção é igual em todas as cópias."]],
            pausa: ["O baixo fá3 → si2 é 5ª d. Por que só um aviso?", "Na sequência diatônica o trítono vem do padrão. Alterar si ou fá tornaria a sequência real, fora do tom."] },
          { titulo: "Com sétimas", ...ex(Q2, "I IV7 viiø7 iii7 vi7 ii7 V7 I"), contexto: sq([0, 4], 2),
            notas: [["decisao", "Mi–mi–ré–ré–dó–dó–si–dó: a nota repetida é 3ª de um acorde e 7ª do seguinte."],
              ["rejeitada", "A melodia da camada anterior: sobre o IV7 o fá dobraria a fundamental, e a cadeia de 7ªs sumiria da melodia."]] },
        ] },
      { tipo: "exemplo", titulo: "5–6 ascendente e Romanesca", intro: "Duas sequências por grau: uma sobe, outra desce.",
        camadas: [
          { titulo: "5–6 ascendente: a voz que faz o 5–6", ...ex(Q3, "I vi6 ii vii°6 iii I6 IV ii6 V I"), contexto: sq([0, 2], 3),
            notas: [["decisao", "Sobre cada baixo repetido, 5ª → 6ª (sol–lá sobre dó…): o 6 evita as 5ªs paralelas de I–ii–iii–IV."],
              ["checagem", "As 5ªs chegam por movimento oblíquo."]] },
          { titulo: "5–6 ascendente: a melodia em 10ªs", ...ex(Q4, "I vi6 ii vii°6 iii I6 IV ii6 V I"), contexto: sq([0, 2], 3),
            notas: [["decisao", "Em textura real o 5–6 vai para uma voz interna, e a melodia segue o baixo em 10ªs."],
              ["checagem", "10ªs seguidas são legais, mas tiram independência: pare após três cópias; a cadência traz movimento contrário."]] },
          { titulo: "Romanesca saltada (descendente 5–6)", ...ex(Q5, "I V vi iii IV I IV V I"), contexto: sq([0, 4], 2),
            notas: [["decisao", "Baixo dó–sol, lá–mi, fá–dó: cada par desce uma 4ª, o seguinte começa uma 2ª acima. Melodia em escala, 10ª–5ª."],
              ["decisao", "Após duas cópias, fá–sol–dó cadencia."]] },
          { titulo: "Romanesca por graus", ...ex(Q6, "I V6 vi iii6 IV I6 IV V I"), contexto: sq([0, 4], 2),
            notas: [["decisao", "Com V6 e iii6, baixo por grau sob a mesma melodia, em 10ªs: a Romanesca 'por graus' (Gjerdingen)."]],
            pausa: ["Mesmas fundamentais: qual Romanesca soa mais como sequência?", "A saltada: o salto de 4ª marca cada cópia. Por graus, vira uma linha descendente contínua."] },
        ] },
      { tipo: "contraste", titulo: "Monte × Fonte",
        a: { rotulo: "A — Monte: V65/IV – IV, V65/V – V (sobe)", ...ex("tom: C maior\nsoprano: C5/2 Bb4 A4 C5 B4 D5 C5/4\nbaixo: C3/2 E3 F3 F#3 G3 G2 C3/4", "I V65/IV IV V65/V V V7 I"), contexto: sq([2, 6], 1, true) },
        b: { rotulo: "B — Fonte: V65/ii – ii, V65 – I (desce)", ...ex("tom: C maior\nsoprano: G5/2 G5 F5 F5 E5 D5 B4 C5\nbaixo: E3/2 C#3 D3 B2 C3 F2 G2 C3", "I6 V65/ii ii V65 I ii6 V7 I"), contexto: sq([2, 6], 1) },
        pergunta: "As duas fazem 'dominante → resolução' duas vezes. Qual cria expectativa, e qual a desfaz?",
        comentario: "<p><b>Monte</b>: sobe um grau por elo e para no V — tensão crescente, boa para a volta do tema; é real. <b>Fonte</b>: vai ao ii (menor) e, um grau abaixo, ao I — desce e repousa. Riepel: montanha × fonte.</p>" },
      { tipo: "quebra", titulo: "Sequências reais, cromáticas e interrompidas", html: `
        <table class="tabela-modos"><thead><tr><th>Estilo</th><th>Uso</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Barroco (Vivaldi, Bach)</td><td>episódios em quintas descendentes</td><td>movimento sem novidade harmônica</td></tr>
        <tr><td>Clássico</td><td>após a barra dupla; duas cópias, a terceira interrompida por cadência</td><td>sinaliza mudança de fase</td></tr>
        <tr><td>Romântico (Wagner, Tristão)</td><td>sequência real: dominantes, diminutos, transposição por 3ªs</td><td>apaga o centro tonal</td></tr>
        </tbody></table>`,
        exemplos: [
          { rotulo: "Sequência real: dominantes encadeadas", ...ex("tom: C maior\nsoprano: E5/2 D5 C#5 C5 B4 C5\nbaixo: C3/2 E3 A2 D3 G2 C3", "I V7/vi V7/ii V7/V V7 I"),
            perfil: { ...SEQ, intervalo_melodico_aumentado_diminuto: "info" }, contexto: sq([2, 6], 1, true),
            comentario: "Mi7 → lá7, ré7 → sol7: cópia exata. Cada 7ª desce, mas a 3ª (dó♯) desce cromaticamente: a sensível de ré não chega. O tom volta no V7 → I." },
          { rotulo: "Sequência interrompida", ...ex("tom: C maior\nsoprano: E5/2 F5 D5 E5 C5/2 B4/2 C5/4\nbaixo: C3/2 F3 B2 E3 F3/2 G3/2 C3/4", "I IV vii° iii IV V I"),
            perfil: { ...SEQ, set_sequencia: "info" }, contexto: sq([0, 4], 2),
            comentario: "Modelo e uma cópia; a 2ª cópia (lá–ré) não vem e a frase cadencia. O verificador anota a falta — é a expectativa frustrada." },
        ] },
    ],
    exercicios: [
      { id: "sq1", titulo: "Completar: as cópias de um modelo com sétimas", modo: "completar", perfil: SEQ, nivel: 6, contexto: { nivel: 6, plano: {}, ...sq([0, 4], 2) },
        cifras: "I IV7 viiø7 iii7 vi7 ii7 V7 I".split(" "),
        instrucoes: "<p>Ré maior. Modelo dado no c. 1 (fá♯5 repetido: 3ª do I, 7ª do IV7). Escreva as duas cópias (c. 2–3), um grau abaixo cada, e a cadência no c. 4.</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano: F#5/2 F#5\nbaixo: D3/2 G3 C#3 F#3 B2 E3 A2 D3", duracao: 2, alvoCompassos: 4,
        solucao: "tom: D maior\ncf: baixo\nsoprano: F#5/2 F#5 E5 E5 D5 D5 C#5 D5\nbaixo: D3/2 G3 C#3 F#3 B2 E3 A2 D3",
        comentarioSolucao: "Cada cópia repete a nota (3ª → 7ª) e desce: mi–mi, ré–ré. Os trítonos do baixo (sol–dó♯) são os aceitos da sequência diatônica." },
      { id: "sq2", titulo: "Menos apoio: 5–6 ascendente em sol maior", modo: "menos apoio", perfil: SEQ, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 3 }, ...sq([0, 2], 3) },
        cifrasAluno: true, cifrasIniciais: "I vi6",
        instrucoes: "<p>Sol maior, 5–6 ascendente. Escreva cifras e melodia: modelo nos dois primeiros tempos, três cópias um grau acima. Feche com V–I e a tônica no soprano.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/1 G2 A2 A2 B2 B2 C3 C3 D3/2 G2/2", duracao: 1, alvoCompassos: 3,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 B4 C5 C5 D5 D5 E5 E5 F#5/2 G5/2\nbaixo: G2/1 G2 A2 A2 B2 B2 C3 C3 D3/2 G2/2",
        solucaoCifras: "I vi6 ii vii°6 iii I6 IV ii6 V I",
        comentarioSolucao: "Melodia em 10ªs com o baixo; o 5–6 fica implícito (I–vi6, ii–vii°6, iii–I6, IV–ii6). Fá♯5 sobe a sol5." },
      { id: "sq3", titulo: "Restrição: Monte, com a cópia exata", modo: "restrição", perfil: SEQ, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 }, ...sq([2, 6], 1, true) },
        cifras: "I V65/IV IV V65/V V V7 I".split(" "),
        instrucoes: "<p>Ré maior, Monte. Escreva a melodia. <b>Restrição:</b> a cópia (sol♯ → lá) repete o modelo (fá♯ → sol) exatamente, em semitons. A 7ª de cada dominante está na melodia e desce.</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano:\nbaixo: D3/2 F#3 G3 G#3 A3 A2 D3/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: D maior\ncf: baixo\nsoprano: D5/2 C5 B4 D5 C#5 E5 D5/4\nbaixo: D3/2 F#3 G3 G#3 A3 A2 D3/4",
        comentarioSolucao: "Dó5 (7ª de ré7) → si4; ré5 (7ª de mi7) → dó♯5: elos idênticos um tom acima. O Monte é real porque IV e V são maiores." },
      { id: "sq4", titulo: "Livre: quintas descendentes em lá menor", modo: "livre", perfil: SEQ, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 }, ...sq([0, 4], 2) }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Lá menor, 4 compassos: c. 1 é o modelo (duas mínimas) de quintas descendentes; c. 2–3, as cópias; c. 4, cadência perfeita.</p>",
        texto: "tom: A menor\nsoprano:\nbaixo:", duracao: 2,
        solucao: "tom: A menor\nsoprano: C5/2 D5 B4 C5 A4 B4 G#4 A4\nbaixo: A2/2 D3 G2 C3 F2 B2 E2 A2",
        solucaoCifras: "i iv VII III VI ii° V i",
        comentarioSolucao: "Em menor natural passa por VII, III e ii° (tolerado); o sol♯ só aparece na cadência. Melodia 10ª → 8ª em cada par." },
      { id: "sq5", titulo: "Quebrar: uma sequência real que sai do tom", modo: "quebrar", perfil: { ...SEQ, intervalo_melodico_aumentado_diminuto: "info" }, nivel: 6, contexto: { nivel: 6, plano: {}, ...sq([2, 6], 1, true) },
        cifras: "I V7/vi V7/ii V7/V V7 I".split(" "),
        instrucoes: "<p>Sol maior. Dominantes encadeadas (si7 → mi7, lá7 → ré7) antes do I. <b>A quebra:</b> a cópia é real e força um semitom cromático. A 7ª de cada dominante desce um grau.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/2 B2 E3 A2 D3 G2", duracao: 2, alvoCompassos: 3,
        solucao: "tom: G maior\ncf: baixo\nsoprano: G5/2 A5 G#5 G5 F#5 G5\nbaixo: G2/2 B2 E3 A2 D3 G2",
        comentarioSolucao: "Lá5 (7ª de si7) → sol♯5; sol5 (7ª de lá7) → fá♯5. O sol♯5 → sol5 abandona a sensível de lá e tira a cópia da escala." },
    ],
  }, { antesDe: "esquemas" });
})(this);
