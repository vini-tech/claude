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

  // dois acordes seguidos são "o mesmo" (só muda a inversão): a 7ª pode trocar de voz antes de resolver
  function mesmoAcorde(a, b) {
    if (!a.cifra || !b.cifra || a.tom !== b.tom) return false;
    const x = a.cifra, y = b.cifra;
    return x.grau === y.grau && x.maior === y.maior && x.qualidade === y.qualidade && x.alteracao === y.alteracao && y.setima
      && !!x.secundaria === !!y.secundaria && (!x.secundaria || x.secundaria.alvo === y.secundaria.alvo);
  }

  M.definirRegra("set_setima", "A 7ª do acorde desce por grau",
    "Em qualquer acorde de sétima (V7, V65, ii65, vii°7, IV7…), a voz externa que tem a 7ª do acorde no fim dele desce um grau quando a harmonia muda. Licença: no V43 → I6, com o baixo subindo por grau, a 7ª pode subir em 10ªs paralelas com ele.",
    function* (ex, ctx) {
      if (!ex.tonalidade || !ctx.cifras) return;
      const hs = R3.harmoniasCifradas(ex, ctx);
      for (let k = 0; k < hs.length; k++) {
        const h = hs[k];
        if (!h.cifra || !h.cifra.setima || h.cifra.aumentada || h.cifra.nona) continue;
        const prox = hs[k + 1];
        if (prox && mesmoAcorde(h, prox)) continue; // V7 → V65: a resolução fica para depois
        const sete = R3.membros(h.cifra, h.tom)[3];
        if (!sete) continue;
        for (let i = 0; i < ex.vozes.length; i++) {
          const v = ex.vozes[i];
          const n = v.soandoEm(h.fim - 1);
          if (!n || n.altura.nome !== sete) continue;
          const seg = n.fim > h.fim ? n : v.seguinte(n);
          const c = ex.compassoDe(h.inicio);
          if (seg === null) {
            yield [c, prox ? `${v.nome}: a 7ª de ${h.texto} (${n.nome}) fica sem continuação` : `${v.nome}: ${n.nome} é a 7ª de ${h.texto} e a música termina sem resolvê-la`, [n]];
            continue;
          }
          // ii65 → I64 → V: a 7ª pode ficar (presa ou repetida) sobre o 6/4 cadencial e descer no V
          if (seg.ps === n.ps && prox && prox.cifra && prox.cifra.seisQuatro) {
            const depois = v.soandoEm(prox.fim);
            if (depois && depois.ps !== n.ps && F.ehGrau(n, depois) && F.direcao(n, depois) < 0) continue;
          }
          if (seg === n) { yield [c, `${v.nome}: a 7ª de ${h.texto} (${n.nome}) fica presa no acorde seguinte em vez de descer`, [n]]; continue; }
          if (F.ehGrau(n, seg) && F.direcao(n, seg) < 0) continue;
          // licença: V43 → I6 com o baixo subindo por grau e a 7ª subindo junto, em 10ªs
          const b0 = h.baixo, b1 = prox && prox.baixo;
          const licenca = prox && prox.cifra && h.cifra.grau === 5 && h.cifra.membroBaixo === 2 && !h.cifra.secundaria
            && prox.cifra.grau === 1 && prox.cifra.membroBaixo === 1 && i < ex.vozes.length - 1
            && F.ehGrau(n, seg) && F.direcao(n, seg) > 0 && b1 && F.ehGrau(b0, b1) && F.direcao(b0, b1) > 0;
          if (licenca) continue;
          yield [c, `${v.nome}: ${n.nome} é a 7ª de ${h.texto} e devia descer um grau, mas vai para ${seg.nome}`, [n, seg]];
        }
      }
    }, { precisaTom: true,
      porque: "A 7ª é a dissonância que define o acorde de sétima: ela nasceu como retardo ou nota de passagem descendente, e o ouvido continua esperando que ela caia. Se ela salta ou fica parada, a tensão não se desfaz — ou se desfaz numa voz que o ouvinte não está seguindo.",
      corrigir: "Ache a 7ª do acorde (V7: o 4º grau; ii7: o 1º; vii°7: o 6º abaixado) e faça a voz que a tem descer um grau no acorde seguinte. Se a nota de resolução dobraria o baixo de forma ruim, troque a voz que tem a 7ª ou a inversão do acorde." });
  M.OLHA_ADIANTE.add("set_setima");

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
    antes: [
      { p: "Em dó maior, o V7 é sol–si–ré–fá. Para onde vai o fá quando o acorde resolve no I?", o: ["Desce para mi", "Sobe para sol", "Fica em fá", "Desce para ré"], e: "O fá é a 7ª do acorde: uma dissonância contra a fundamental (sol), e toda a tradição a trata como nota que cai um grau — 4̂ → 3̂. Subir ou ficar parado deixa a dissonância sem resolução." },
      { p: "Que inversão do V7 tem a 7ª no baixo, e para onde vai esse baixo?", o: ["V42; o baixo desce um grau e o I chega com a 3ª no baixo (I6)", "V43; o baixo sobe para a tônica", "V65; o baixo sobe para a tônica", "V42; o baixo salta para a tônica (I)"], e: "No V42 (4/2) o baixo é a própria 7ª (fá em dó): ele obedece à 7ª, desce para mi, e o acorde de chegada é o I6. V65 tem a sensível no baixo (sobe à tônica); V43, o 2º grau (vai a 1 ou a 3)." },
      { p: "No V7 → I em estado fundamental a quatro vozes, por que um dos acordes costuma ficar incompleto?", o: ["Porque a sensível sobe e a 7ª desce: com as duas resolvidas, falta a 5ª em um dos acordes", "Porque a 5ª do V7 é dissonante e não pode soar", "Porque o I nunca pode ter a fundamental dobrada", "Por causa das oitavas entre o baixo e a 7ª"], e: "Com 7̂ → 1̂ e 4̂ → 3̂ obrigatórios, ou o V7 omite a 5ª (e dobra a fundamental) e vai a um I completo, ou o V7 completo vai a um I com a fundamental triplicada e sem 5ª. É o preço de resolver as duas notas de tendência." },
    ],
    objetivo: "Usar o V7 e as suas três inversões com o baixo e a melodia certos: a 7ª descendo um grau, a sensível subindo, e o baixo de cada inversão indo para onde a sua posição manda.",
    ouvir: [
      "Corais de Bach: procure o V42 → I6 e o V65 → I no meio das frases, não só na cadência",
      "Beethoven, Sinfonia nº 1, abertura: a obra começa com uma 7ª de dominante (de fá maior), sem preparação",
      "Schumann, Dichterliebe, 'Im wunderschönen Monat Mai': a canção termina num acorde de 7ª de dominante sem resolução",
      "Satie, Gymnopédie nº 1: duas sétimas (maiores) alternadas, que nunca resolvem",
    ],
    esboco: "Em sol maior, escreva só baixo e soprano para I – V43 – I6 – IV – V42 – I6 (uma nota por acorde). Onde está a 7ª do acorde em cada V, e para onde ela vai?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Uma dissonância que virou acorde", html: `
        <p>A 7ª do V7 nasceu no contraponto: era uma <b>dissonância de passagem</b> (a voz que dobrava a fundamental descia 8–7 a caminho da 3ª do acorde seguinte) ou um <b>retardo</b> (nota preparada no acorde anterior, presa e resolvida para baixo). Rameau, no <i>Traité de l'harmonie</i> (1722), deu o passo teórico: a 7ª passa a ser parte do acorde de dominante, a dissonância que o define — mas continua obrigada a resolver como a dissonância que era.</p>
        <h3>As duas notas de tendência</h3>
        <ul><li><b>A 7ª (4̂) desce um grau</b> (para 3̂) no acorde seguinte, seja qual for a voz que a tem — inclusive o baixo.</li>
        <li><b>A sensível (7̂) sobe para a tônica</b> quando está numa voz externa. Numa voz interna, no V7 → I em estado fundamental, ela pode cair para 5̂ para o I ficar completo (Bach faz isso o tempo todo); no soprano, nunca.</li>
        <li>7̂ e 4̂ formam um trítono, e as duas tendências o resolvem: a 5ª diminuta si–fá <b>se fecha</b> na 3ª dó–mi; a 4ª aumentada fá–si <b>se abre</b> na 6ª mi–dó.</li></ul>
        <h3>As inversões e o baixo</h3>
        <table class="tabela-modos"><thead><tr><th>Cifra</th><th>No baixo (em dó)</th><th>O baixo vai a</th><th>Uso típico</th></tr></thead><tbody>
        <tr><td><b>V7</b></td><td>5̂ (sol)</td><td>1̂ (I)</td><td>cadência; a fórmula mais forte</td></tr>
        <tr><td><b>V65</b></td><td>7̂ (si)</td><td>1̂ (I)</td><td>bordadura inferior da tônica (1–7–1)</td></tr>
        <tr><td><b>V43</b></td><td>2̂ (ré)</td><td>1̂ (I) ou 3̂ (I6)</td><td>passagem 1–2–3 (troca de vozes) ou bordadura</td></tr>
        <tr><td><b>V42</b></td><td>4̂ (fá) = a 7ª</td><td>3̂ (I6), sempre</td><td>passagem descendente 5–4–3, ou depois do IV com o fá preso</td></tr>
        </tbody></table>
        <p>As inversões não são versões fracas do V7: são o que deixa o <b>baixo andar por grau</b>, e por isso aparecem na regra da oitava (V43 no 2º grau, V65 no 7º subindo, V42 no 4º descendo).</p>
        <h3>Como a 7ª chega</h3>
        <ul><li><b>Preparada</b> (nota comum com o acorde anterior: IV ou ii → V7, a nota fá fica) — a maneira do Barroco estrito.</li>
        <li><b>De passagem</b> (8–7: a fundamental desce à 7ª, como na passagem I64 – V7 sol → fá).</li>
        <li><b>Bordadura</b> (3–4–3: mi–fá–mi sobre I – V43 – I).</li>
        <li><b>Livre</b>, por salto — normal no estilo clássico, de preferência vindo de cima. A preparação se afrouxou; a <b>resolução nunca</b>.</li></ul>
        <p>Aqui, como no resto do livro, você escreve o par externo e as cifras; as vozes internas ficam implícitas, como no baixo cifrado. A regra <b>A 7ª do acorde desce por grau</b> olha a voz externa que tem a 7ª no fim do acorde. Não dobre a 7ª: se baixo e soprano a têm, as duas descem juntas em oitavas paralelas.</p>` },
      { tipo: "exemplo", titulo: "As quatro posições numa frase", intro: "Dó maior. O baixo usa V65, V43, V42 e V7; a melodia mostra três maneiras de tratar a 7ª.",
        camadas: [
          { titulo: "O baixo e as cifras", partitura: "tom: C maior\nbaixo: C3/1 B2 C3 D3 E3 F3 F3 E3 F3/2 G3/1 G3 C3/4", rotulos: ["baixo"], cifras: cifrar(D1, D1c),
            anotacoes: [[0, 1, "7̂ sobe"], [0, 6, "7ª"], [0, 7, "3̂"]],
            notas: [["decisao", "Compasso 1: I – V65 – I – V43, a tônica prolongada por duas dominantes invertidas (bordadura inferior 1–7–1 e passagem 1–2–3)."],
              ["decisao", "Compasso 2: IV → V42 com o fá repetido no baixo: a 7ª do V42 está preparada pelo IV, como num retardo, e desce a mi (I6)."],
              ["checagem", "Compasso 3: ii65 – I64 – V7 – I, a cadência composta; o 6/4 no 3º tempo (mais forte que o 4º)."]] },
          { titulo: "Onde estão as 7ªs", partitura: "tom: C maior\nsoprano: P/1 F5/1 E5 P/1 P/4 P/2 P/1 F5/1 E5/4\nbaixo: C3/1 B2 C3 D3 E3 F3 F3 E3 F3/2 G3/1 G3 C3/4", rotulos: ["soprano", "baixo"], cifras: cifrar(D1, D1c),
            notas: [["decisao", "V65: a 7ª fá5 na melodia, como bordadura mi–fá–mi; sobre o si2 do baixo forma uma 5ª diminuta, que resolve para dentro (fá–si → mi–dó)."],
              ["decisao", "V7 da cadência: fá5 de passagem — a 8ª (sol5) do 6/4 desce à 7ª e segue para mi5. É a origem contrapontística da 7ª, 8–7."]],
            pausa: ["E no V42, quem tem a 7ª?", "O baixo (fá3). Por isso a melodia não pode ter fá ali: as duas vozes desceriam fá → mi juntas, em oitavas paralelas. A melodia fica com si4 (a sensível), que sobe a dó5."] },
          { titulo: "A frase inteira", partitura: D1, cifras: cifrar(D1, D1c), rotulos: ["soprano", "baixo"],
            anotacoes: [[0, 1, "7ª"], [0, 6, "sensível"], [0, 8, "clímax"], [0, 10, "7ª (8–7)"]],
            notas: [["decisao", "Compasso 2: dó5 – lá4 – si4 – dó5 sobre I6 – IV – V42 – I6: a sensível do V42 sobe enquanto a 7ª, no baixo, desce."],
              ["decisao", "Clímax lá5 no início do compasso 3 (5ª do ii65), depois uma descida por grau lá–sol–fá–mi que atravessa o 6/4 e a 7ª do V7."],
              ["rejeitada", "Pensei em dó5 sobre o ii65 (a 7ª do acorde, preparada pelo dó5 anterior): correto, mas a linha ficaria parada em dó por três tempos e perderia o clímax."],
              ["checagem", "Nenhuma 7ª dobrada; as três 7ªs nas vozes externas (fá5, fá3, fá5) descem um grau; as quintas e oitavas chegam por movimento contrário ou com o soprano por grau."]],
            pausa: ["Por que V43 (e não V7) no 4º tempo do compasso 1?", "Porque o baixo vai de dó3 a mi3 por grau: com ré no baixo, a dominante está na 2ª inversão. Em estado fundamental (sol) o baixo saltaria e a passagem 1–2–3 sob a melodia 3–2–1 desapareceria."] },
        ] },
      { tipo: "exemplo", titulo: "Em menor: V42, a cadência de engano e a 7ª que cai", intro: "Lá menor. A sensível (sol♯) vem da escala harmônica; a 7ª do V7 continua sendo o 4º grau (ré).",
        camadas: [
          { titulo: "Esqueleto", partitura: "tom: A menor\nbaixo: A2/2 D3 D3 C3 E3 F3 D3 E3 A2/4", rotulos: ["baixo"], cifras: cifrar(D2, D2c),
            notas: [["decisao", "iv → V42 com o ré preso no baixo, V42 → i6; depois V7 → VI, a cadência de engano, e só então a cadência perfeita."]] },
          { titulo: "Com a melodia", partitura: D2, cifras: cifrar(D2, D2c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 4, "7ª"], [0, 5, "resolve no VI"]],
            notas: [["decisao", "Compasso 3: a 7ª ré5 está na melodia e desce a dó5 mesmo que o baixo vá ao VI (fá) em vez do i. A 7ª resolve igual; quem é enganado é o baixo."],
              ["decisao", "Na cadência final a 7ª fica implícita (voz interna) e a melodia faz si4 – sol♯4 – lá4: a sensível sobe."],
              ["rejeitada", "No compasso 3 pensei em mi5 sobre o V7 (fundamental, oitava do baixo) indo a dó5: sem erro, mas a cadência de engano perde a dissonância que torna a chegada ao VI tão marcada."],
              ["checagem", "Clímax ré5 único, no compasso 3; a 2ª aumentada fá–sol♯ não aparece em nenhuma voz."]],
            pausa: ["No V7 → VI a quatro vozes, o que se dobra no VI, e por quê?", "A 3ª (dó, em lá menor). A sensível tem de subir a lá (sol♯ → fá seria 2ª aumentada) e a 7ª desce a dó; com as vozes superiores andando contra o baixo, que sobe a fá, o dó acaba em duas vozes. É o caso clássico em que dobrar a 3ª é a regra, não o descuido."] },
        ] },
      { tipo: "contraste", titulo: "7ª preparada × 7ª livre",
        a: { rotulo: "A — preparada (Barroco): o dó do ii fica e vira 7ª", ...ex("tom: G maior\nsoprano: D5/2 E5 C5 C5 B4/4\nbaixo: G2/2 C3 A2 D3 G2/4", "I IV ii V7 I") },
        b: { rotulo: "B — livre (Clássico): a 7ª entra por salto", ...ex("tom: G maior\nsoprano: D5/2 E5 A5 C5 B4/4\nbaixo: G2/2 C3 C3 D3 G2/4", "I IV ii6 V7 I") },
        pergunta: "As duas resolvem dó → si. Em qual a dissonância soa como surpresa, e em qual como consequência?",
        comentario: "<p>Em A o dó já soava como consonância (3ª do ii) e só vira dissonância quando o baixo anda: a tensão é <b>gerada pelo baixo</b>, como num retardo — é o tratamento estrito, o de Corelli e dos corais. Em B a melodia salta de lá5 para a 7ª: a dissonância é <b>atacada</b>, e soa como acento expressivo. O estilo clássico aceita isso para o V7; o que não muda nos dois é a resolução descendente.</p>" },
      { tipo: "quebra", titulo: "A 7ª que sobe, a que se transfere e a que fica", html: `
        <p><b>A licença do V43.</b> No V43 → I6, com o baixo subindo 2̂ → 3̂, a 7ª pode <b>subir</b> (4̂ → 5̂) em 10ªs paralelas com o baixo. Aldwell & Schachter e Kostka & Payne aceitam: descer para 3̂ dobraria o baixo (a 3ª do I6), e a linha em 10ªs justifica a 7ª como nota de passagem ascendente. É a única exceção corrente — e só nessa posição.</p>
        <p><b>A 7ª transferida.</b> Dentro do mesmo acorde a 7ª pode mudar de voz (V7 → V42: o fá passa do soprano ao baixo) e resolver na voz nova. Na escrita para teclado e orquestra do século XIX é comum a 7ª "sumir" de uma voz e reaparecer, resolvida, em outra — o ouvido aceita porque a resolução acontece no registro.</p>
        <p><b>A 7ª que fica.</b> Beethoven abre a Sinfonia nº 1 com uma 7ª de dominante sem preparação, e de outro tom (a dominante de fá, não de dó): o começo já é tensão. Schumann termina 'Im wunderschönen Monat Mai' (Dichterliebe) num acorde de 7ª de dominante que não resolve: a canção acaba como pergunta. No fim do século, Satie (Gymnopédie nº 1) alterna duas 7ªs maiores como cor estática, e Chopin, no Prelúdio em mi menor op. 28 nº 4, encadeia acordes de 7ª que deslizam por semitons sem resolver no sentido escolar. A 7ª deixa de ser uma obrigação e vira timbre.</p>` ,
        exemplos: [
          { rotulo: "A licença: V43 → I6 com a 7ª subindo em 10ªs", ...ex("tom: G maior\nsoprano: B4/1 C5 D5 E5 D5 C5 B4/2\nbaixo: G2/1 A2 B2 C3 D3 D3 G2/2", "I V43 I6 IV V V7 I"),
            perfil: { ...SET }, comentario: "Dó5 (a 7ª do V43) sobe a ré5 junto com o baixo lá2 → si2: quatro 10ªs paralelas sol–si, lá–dó, si–ré, dó–mi. O verificador aceita: é a licença prevista na regra. Repare que a outra 7ª (dó5 sobre o V7, de passagem 8–7) desce normalmente." },
          { rotulo: "A 7ª suspensa no fim (à maneira de Schumann)", ...ex("tom: A menor\nsoprano: C5/2 C5 F5 E5 D5/4\nbaixo: A2/2 F3 D3 E3 E2/4", "i VI iv V V7"),
            perfil: { ...SET, set_setima: "info", dissonancia_resolucao: "info" }, comentario: "A frase para no V7 com a 7ª (ré5) no soprano. Sem a resolução, o ouvinte completa mentalmente o ré → dó que não vem: o fim fica aberto, como pergunta ou como reticência. Funciona porque é o último acorde e a expectativa é clara; no meio da frase, a mesma 7ª sem resolução soaria como erro de condução." },
        ] },
    ],
    exercicios: [
      { id: "set1", titulo: "Completar: as 7ªs no lugar", modo: "completar", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: {} },
        cifras: "I V65 I V43 I6 IV V42 I6 ii6 I64 V7 I".split(" "),
        instrucoes: "<p>Sol maior. O baixo, as cifras e o primeiro compasso da melodia estão prontos (repare no dó5 do V65 descendo a si4). Escreva a melodia dos compassos 2–4, uma nota por nota do baixo. No V42 a 7ª está no baixo: não a dobre. Busque um clímax no começo do compasso 3 e termine na tônica.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: B4/1 C5 B4 A4\nbaixo: G2/1 F#2 G2 A2 B2 C3 C3 B2 C3/2 D3/1 D3/1 G2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 C5 B4 A4 D5 E5 F#5 G5 E5/2 B4/1 A4/1 G4/4\nbaixo: G2/1 F#2 G2 A2 B2 C3 C3 B2 C3/2 D3/1 D3/1 G2/4",
        comentarioSolucao: "No compasso 2 a melodia sobe por grau ré–mi–fá♯–sol em 10ªs e 6ªs com o baixo: fá♯5 (a sensível, 4ª aumentada contra o dó3 do V42) sobe a sol5 enquanto o baixo, que tem a 7ª, desce a si2. O clímax sol5 cai no fim do compasso 2 e a linha desce até a tônica." },
      { id: "set2", titulo: "Menos apoio: cifras e melodia em ré menor", modo: "menos apoio", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifrasAluno: true, cifrasIniciais: "i V65 i",
        instrucoes: "<p>Ré menor. Só o baixo está dado (e as três primeiras cifras). Escreva todas as cifras e a melodia. O baixo pede, entre outras, um V43, um V42 e uma cadência composta (6/4 cadencial – V7 – i). Cada 7ª nas vozes externas desce um grau; a sensível (dó♯) sobe.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/1 C#3 D3 E3 F3 G3 G3 F3 Bb2/2 A2/1 A2/1 D3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5 D5 C#5 D5 D5 C#5 D5 G5/2 F5/1 E5/1 D5/4\nbaixo: D3/1 C#3 D3 E3 F3 G3 G3 F3 Bb2/2 A2/1 A2/1 D3/4",
        solucaoCifras: "i V65 i V43 i6 iv V42 i6 iv6 i64 V7 i",
        comentarioSolucao: "O sol3 repetido (iv → V42) é a 7ª preparada no baixo; a melodia fica com dó♯5, que sobe a ré5 sobre o i6. O salto ré5 → sol5 no compasso 3 dá o clímax antes da cadência composta." },
      { id: "set3", titulo: "Restrição: três 7ªs na melodia", modo: "restrição", perfil: { ...SET, set_setima_no_soprano: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, minSetimasSoprano: 3 }, cifrasAluno: true,
        instrucoes: "<p>Fá maior. Escreva cifras e melodia para o baixo dado. <b>Restrição:</b> a 7ª de um acorde de sétima aparece na melodia pelo menos três vezes — e cada uma resolve. Dica: a 7ª do ii65 pode ficar sobre o 6/4 cadencial e descer só no V7.</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano:\nbaixo: F2/1 E2 F2 G2 A2 Bb2 Bb2 A2 Bb2/2 C3/1 C3/1 F2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: F maior\ncf: baixo\nsoprano: C5/1 Bb4 A4 Bb4 C5 D5 E5 F5 F5/2 F5/1 E5/1 F5/4\nbaixo: F2/1 E2 F2 G2 A2 Bb2 Bb2 A2 Bb2/2 C3/1 C3/1 F2/4",
        solucaoCifras: "I V65 I V43 I6 IV V42 I6 ii65 I64 V7 I",
        comentarioSolucao: "Três 7ªs na melodia: si♭4 no V65 (desce a lá4), si♭4 no V43 (sobe a dó5 — a licença do V43 → I6, em 10ªs com o baixo) e fá5 no ii65, preparado pelo fá5 do I6, repetido sobre o 6/4 e resolvido em mi5 sobre o V7. Se preferir a resolução estrita no V43, use lá4 sobre o I6." },
      { id: "set4", titulo: "Livre: uma frase em mi menor", modo: "livre", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha baixo, melodia e cifras: 4 compassos em mi menor, com o V7 em pelo menos duas inversões diferentes e cadência autêntica perfeita no fim. Planeje o clímax e confira cada 7ª.</p>",
        texto: "tom: E menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: E menor\nsoprano: G4/1 F#4 G4 A4 G4 E5 D#5 E5 F#5/2 D#5/2 E5/4\nbaixo: E3/1 D#3 E3 F#3 E3 A2 A2 G2 A2/2 B2/2 E3/4",
        solucaoCifras: "i V65 i V43 i iv V42 i6 ii°6 V7 i",
        comentarioSolucao: "V65 e V43 como bordaduras da tônica (o V43 volta ao i em estado fundamental, com a 7ª lá4 descendo a sol4), V42 com o lá preso do iv. A melodia começa grave e só ganha registro no compasso 2, para o clímax fá♯5 cair no compasso 3." },
      { id: "set5", titulo: "Quebrar: terminar em suspenso", modo: "quebrar", perfil: { ...SET, set_setima: "info", dissonancia_resolucao: "info", set_setima_no_soprano: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: {}, minSetimasSoprano: 1 }, cifras: "I vi IV ii I64 V V7".split(" "),
        instrucoes: "<p>Dó maior. Baixo e cifras estão dados; a frase termina num V7. <b>Quebre a regra num ponto só:</b> no último acorde, ponha a 7ª (fá) na melodia e deixe-a sem resolução, como Schumann no fim de 'Im wunderschönen Monat Mai'. Antes disso, nada de licenças. Pense em como chegar ao fá para que ele soe como pergunta, não como descuido.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/2 A2 F2 D3 G2 G2 G2/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/2 C5 A4 F5 E5 D5 F5/4\nbaixo: C3/2 A2 F2 D3 G2 G2 G2/4",
        comentarioSolucao: "O fá5 já aparece no compasso 2 (3ª do ii), volta como 7ª no fim e fica: a resolução esperada (fá → mi) não vem. A cadência 6/4 – V prepara a chegada; o V7 final tem o compasso inteiro para a dissonância durar." },
    ],
  }, { depoisDe: "retardos_harm" });

//CAPITULOS
})(this);
