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

  // restrição barroca: toda 7ª de acorde numa voz externa vem preparada (a mesma nota já soava no acorde anterior)
  M.definirRegra("set_setima_preparada", "A 7ª vem preparada",
    "Estilo estrito: a 7ª de um acorde de sétima, na voz externa que a tem, já soava como consonância no acorde anterior (nota comum, repetida ou ligada) — como num retardo.",
    function* (ex, ctx) {
      if (!ex.tonalidade || !ctx.cifras) return;
      const hs = R3.harmoniasCifradas(ex, ctx);
      for (let k = 0; k < hs.length; k++) {
        const h = hs[k];
        if (!h.cifra || !h.cifra.setima || h.cifra.aumentada) continue;
        if (k > 0 && mesmoAcorde(hs[k - 1], h) && hs[k - 1].cifra.setima) continue;
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

  // ================================================================ 2. As sétimas da sensível
  const S1 = "tom: A menor\nsoprano: E5/1 F5 E5 D5 C5 B4 C5 A4 D5/2 C5/1 B4/1 A4/4\nbaixo: A2/1 G#2 A2 B2 C3 D3 C3 D3 F3/2 E3/1 E3/1 A2/4";
  const S1c = "i vii°7 i vii°65 i6 vii°43 i6 iv vii°42 i64 V7 i";
  const S2 = "tom: C maior\nsoprano: E5/1 G5 A5 G5 F5 Ab5 G5 F5 E5/2 D5/2 C5/4\nbaixo: C3/1 E3 D3 E3 F3 F3 E3 F3 G3/2 G3/2 C3/4";
  const S2c = "I I6 viiø65 I6 IV vii°43 I6 ii6 I64 V7 I";

  T_.inserir(2, {
    id: "setima_sens", titulo: "As sétimas da sensível",
    antes: [
      { p: "Em lá menor, quais são as notas do vii°7, e para onde vai a 7ª dele?", o: ["sol♯–si–ré–fá; o fá desce para mi", "sol–si–ré–fá; o fá sobe para sol", "sol♯–si–ré–fá♯; o fá♯ desce para mi", "si–ré–fá–lá; o lá desce para sol"], e: "O vii°7 é feito de 3ªs menores sobre a sensível: sol♯–si–ré–fá. A 7ª é o 6º grau (fá), que desce ao 5º (mi); a sensível sobe à tônica." },
      { p: "Em dó maior, qual a diferença entre viiø7 e vii°7?", o: ["O viiø7 tem lá (diatônico); o vii°7 tem lá♭, emprestado de dó menor", "O viiø7 tem fá♯; o vii°7 tem fá", "O viiø7 é menor; o vii°7 é maior", "Nenhuma: são duas grafias do mesmo acorde"], e: "Si–ré–fá–lá é a tétrade diatônica (meio-diminuta). Com lá♭ ela vira diminuta, por empréstimo do modo menor (mistura): mais escura e mais tensa, com o lá♭ querendo cair em sol." },
      { p: "No viiø7 → I em dó maior, por que o ré costuma subir a mi (dobrando a 3ª do I)?", o: ["Porque ré–lá é uma 5ª justa: se o ré descesse a dó enquanto o lá desce a sol, haveria quintas paralelas", "Porque o ré é a 7ª do acorde", "Porque a 3ª do I nunca pode faltar", "Porque o ré é a sensível"], e: "No viiø7 a 3ª (ré) e a 7ª (lá) formam uma 5ª justa. Com lá → sol obrigatório, ré → dó daria 5ªs paralelas; por isso o ré sobe a mi e o I fica com a 3ª dobrada — ou o acorde vai antes ao V7." },
    ],
    objetivo: "Usar o vii°7 (em menor e, por mistura, em maior) e o viiø7 como dominantes: resolver as suas duas dissonâncias, evitar as quintas que eles escondem e perceber a ambiguidade do acorde diminuto.",
    ouvir: [
      "Bach, Paixão segundo São Mateus: o grito 'Barrabam!' da multidão, num acorde de 7ª diminuta",
      "Mozart, Don Giovanni, cena do Comendador (ato II): as 7ªs diminutas da entrada da estátua",
      "Beethoven, Sonata 'Patética' op. 13, Grave inicial: 7ªs diminutas no primeiro compasso",
      "Weber, Der Freischütz, cena da Garganta do Lobo: a 7ª diminuta como som do sobrenatural",
    ],
    esboco: "Em lá menor, escreva só baixo e soprano para i – vii°7 – i e para i6 – vii°43 – i6. Em cada vii°7, qual nota é a 7ª, e qual é a sensível?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Dominante sem fundamental", html: `
        <p>O acorde de 7ª construído sobre a sensível é uma <b>dominante</b>: tem 7̂ (que sobe a 1̂), 4̂ (que desce a 3̂) e 2̂, como o V7, mais uma 7ª própria. Muitos tratados dos séculos XVIII e XIX o explicavam como um V9 sem a fundamental (em dó menor, sol–si–ré–fá–lá♭ sem o sol). A leitura ajuda a lembrar as resoluções: ele vai onde o V7 iria.</p>
        <table class="tabela-modos"><thead><tr><th>Acorde</th><th>Em</th><th>Notas (tônica dó)</th><th>Qualidade</th></tr></thead><tbody>
        <tr><td><b>vii°7</b></td><td>menor (natural da escala harmônica)</td><td>si–ré–fá–lá♭</td><td>três 3ªs menores; duas 5ªs diminutas</td></tr>
        <tr><td><b>vii°7</b></td><td>maior, por mistura</td><td>si–ré–fá–lá♭</td><td>o mesmo acorde, com o 6º grau emprestado</td></tr>
        <tr><td><b>viiø7</b></td><td>maior (diatônico)</td><td>si–ré–fá–lá</td><td>tríade diminuta + 7ª menor</td></tr>
        </tbody></table>
        <h3>Resoluções</h3>
        <ul><li><b>Fundamental (7̂) sobe</b> a 1̂; <b>7ª (6̂ ou ♭6̂) desce</b> a 5̂ — no vii°7, meio tom (lá♭ → sol), o que dá ao acorde o seu peso.</li>
        <li><b>A 5ª (4̂) desce</b> a 3̂, como a 7ª do V7. <b>A 3ª (2̂)</b> é livre: desce a 1̂ ou sobe a 3̂.</li>
        <li>Resultado frequente: <b>3ª dobrada no I</b>. Em menor ela é inofensiva; no viiø7 → I ela é <b>obrigatória</b> quando 2̂ e 6̂ estão a uma 5ª justa (ré–lá), para evitar quintas paralelas. No vii°7 a mesma relação é uma 5ª diminuta (ré–lá♭): d5 → 5ª justa entre vozes superiores é tolerado; com o baixo, evite.</li>
        <li>O <b>viiø7</b> também vai muitas vezes ao <b>V7</b> antes do I: o lá desce a sol e as outras três notas ficam — uma dominante que se transforma em outra.</li></ul>
        <h3>Inversões</h3>
        <table class="tabela-modos"><thead><tr><th>Cifra</th><th>Baixo</th><th>Vai a</th></tr></thead><tbody>
        <tr><td>vii°7</td><td>7̂</td><td>i (1̂)</td></tr>
        <tr><td>vii°65</td><td>2̂</td><td>i6 (3̂) — passagem 1–2–3, como o V43</td></tr>
        <tr><td>vii°43</td><td>4̂</td><td>i6 (3̂) — o baixo desce como a 7ª do V42</td></tr>
        <tr><td>vii°42</td><td>♭6̂ = a 7ª</td><td>5̂: V, ou i64 cadencial — o baixo desce meio tom</td></tr>
        </tbody></table>
        <p>No par externo, a pergunta de sempre: quem tem a 7ª? Se é o soprano, ele desce; se é o baixo (vii°42), o baixo desce e a melodia não pode dobrá-lo.</p>
        <h3>Um acorde sem centro</h3>
        <p>O vii°7 divide a oitava em quatro 3ªs menores iguais. Soado isoladamente, qualquer uma das quatro notas pode ser a sensível: si–ré–fá–lá♭ (dó menor) é, para o ouvido, o mesmo acorde que sol♯–si–ré–fá (lá menor), ré–fá–lá♭–dó♭ (mi♭ menor) ou fá–lá♭–dó♭–mi♭♭. Só existem três acordes diminutos diferentes. Essa simetria é a base da <b>modulação enarmônica</b> (nível 4); aqui, basta ouvir que o acorde só ganha tom quando resolve.</p>` },
      { tipo: "exemplo", titulo: "As quatro posições em lá menor", intro: "Cada inversão do vii°7 leva o baixo a um lugar diferente; a sensível e a 7ª resolvem sempre igual.",
        camadas: [
          { titulo: "O baixo e as cifras", partitura: "tom: A menor\nbaixo: A2/1 G#2 A2 B2 C3 D3 C3 D3 F3/2 E3/1 E3/1 A2/4", rotulos: ["baixo"], cifras: cifrar(S1, S1c),
            notas: [["decisao", "Compasso 1: vii°7 como bordadura inferior (lá–sol♯–lá) e vii°65 como passagem (lá–si–dó). Compasso 2: vii°43 entre dois i6, o baixo 3–4–3."],
              ["decisao", "Compasso 3: iv → vii°42, o baixo sobe ré → fá e desce meio tom a mi, onde o 6/4 cadencial prepara o V7."],
              ["checagem", "O vii°42 vai ao i64, não direto ao i: o baixo (a 7ª, fá) precisa descer a mi, e no mi o acorde de tônica só pode ser 6/4 — cadencial."]] },
          { titulo: "A melodia", partitura: S1, cifras: cifrar(S1, S1c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 1, "7ª"], [0, 3, "5ª do acorde"], [1, 8, "7ª"]],
            notas: [["decisao", "Fá5 sobre sol♯2: a 7ª do vii°7 na melodia, como bordadura de mi5 — a 7ª diminuta contra o baixo resolve na 5ª justa da tônica."],
              ["decisao", "Sobre o vii°65, ré5 (a 5ª do acorde) desce a dó5: a tendência 4̂ → 3̂ é a mesma do fá no V7."],
              ["rejeitada", "Sobre o vii°42 pensei em fá5, dobrando a 7ª do baixo: as duas desceriam fá → mi em oitavas. Ré5 desce a dó5 (sobre o 6/4) por grau, sem dobrar nada."],
              ["checagem", "A 2ª aumentada fá–sol♯ não aparece em nenhuma voz; o clímax (fá5) é a própria dissonância do compasso 1."]],
            pausa: ["Por que o vii°43 (e não o vii°7) entre os dois i6?", "Porque o baixo está em dó (3̂) e quer uma bordadura superior: ré (4̂) é a 5ª do acorde de sol♯ diminuto, logo vii°43. É o mesmo lugar do V42 na regra da oitava — mas, com o ré no baixo em vez de fá, o baixo pode voltar a dó subindo ou descendo."] },
        ] },
      { tipo: "exemplo", titulo: "Em maior: o viiø7 diatônico e o vii°7 emprestado", intro: "Dó maior. O lá natural do viiø7 e o lá♭ do vii°7 na mesma frase.",
        camadas: [
          { titulo: "A frase", partitura: S2, cifras: cifrar(S2, S2c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 2, "7ª (lá)"], [0, 5, "7ª (lá♭)"]],
            notas: [["decisao", "Compasso 1: viiø65 como bordadura do I6 (mi–ré–mi no baixo); a 7ª lá5 desce a sol5. O baixo sobe ré → mi: é a 3ª do viiø7 que sobe, como manda a regra das quintas."],
              ["decisao", "Compasso 2: o fá3 do IV fica no baixo e o acorde vira vii°43 com lá♭5 — o empréstimo é o clímax da linha, e a 7ª diminuta cai meio tom em sol5."],
              ["rejeitada", "Pensei em chegar ao viiø65 vindo do I em estado fundamental (dó3 → ré3) com mi5 → lá5: 5ª atingida por salto em movimento direto. Com o I6 antes, o baixo desce mi → ré enquanto a melodia sobe: movimento contrário."],
              ["checagem", "Lá5 sobre ré3 é uma 5ª justa; a resolução vai a sol5 sobre mi3 (10ª), não a sol5 sobre dó3 — que seriam quintas paralelas ré–lá → dó–sol."]],
            pausa: ["Ouça lá5 e depois lá♭5: o que muda na função?", "Nada: os dois são dominantes e resolvem igual. Muda a cor e a força da 7ª — o lá♭ está a meio tom do sol, e a frase escurece por um instante, como se dó menor passasse por dentro de dó maior."] },
        ] },
      { tipo: "contraste", titulo: "viiø65 × vii°65 na mesma frase",
        a: { rotulo: "A — viiø65 (lá natural)", ...ex("tom: C maior\nsoprano: E5/1 G5 A5 G5 F5/2 E5/1 D5/1 C5/4\nbaixo: C3/1 E3 D3 E3 F3/2 G3/1 G3/1 C3/4", "I I6 viiø65 I6 ii6 I64 V7 I") },
        b: { rotulo: "B — vii°65 (lá♭, por mistura)", ...ex("tom: C maior\nsoprano: E5/1 G5 Ab5 G5 F5/2 E5/1 D5/1 C5/4\nbaixo: C3/1 E3 D3 E3 F3/2 G3/1 G3/1 C3/4", "I I6 vii°65 I6 ii6 I64 V7 I") },
        pergunta: "Só uma nota muda. Qual das duas versões pede mais a resolução, e por quê?",
        comentario: "<p>Em A, lá5 está a um tom de sol5: a 7ª é uma dissonância suave, quase uma nota de passagem. Em B, lá♭5 forma uma 5ª diminuta com o ré do baixo e está a meio tom de sol: a atração é muito maior, e o empréstimo do menor faz a frase escurecer por um instante. É por isso que o vii°7 foi o acorde preferido para os momentos de crise — e o viiø7 para o tecido do dia a dia.</p>" },
      { tipo: "quebra", titulo: "A 7ª diminuta como efeito", html: `
        <p>Pela sua tensão e pela ambiguidade, o acorde diminuto virou o som do susto. Bach põe o grito da multidão, 'Barrabam!', na Paixão segundo São Mateus, sobre uma 7ª diminuta; Mozart abre a cena do Comendador em Don Giovanni com ela; Weber faz dela a cor do sobrenatural na Garganta do Lobo (Der Freischütz); Beethoven a coloca já no primeiro compasso da 'Patética'. No século XIX o diminuto em tremolo vira clichê de ópera e, depois, de trilha sonora.</p>
        <p>O que se quebra não é a resolução da 7ª (os compositores continuam resolvendo), mas a <b>função</b>: o acorde aparece no tempo forte sem preparação, dura além do normal, ou desliza para <b>outro</b> diminuto por semitom, sem ir à tônica — a tonalidade fica suspensa até uma dominante "de verdade" aparecer. E a simetria permite a virada: o mesmo som que era sensível de dó menor resolve, de repente, em lá menor.</p>`,
        exemplos: [
          { rotulo: "Deslizando por diminutos", ...ex("tom: C maior\nsoprano: G5/2 Ab5 G5 F#5 F5 F5 E5/4\nbaixo: C3/2 B2 Bb2 A2 Ab2 G2 C3/4", "I vii°7 vii°42/ii vii°65/V vii°42 V7 I"),
            perfil: { ...SET, intervalo_melodico_aumentado_diminuto: "info" }, comentario: "O baixo desce cromaticamente de dó a sol sob quatro acordes diminutos seguidos. Cada 7ª ainda desce um grau (lá♭5, si♭2, lá♭2), mas nenhum diminuto vai à sua tônica: o ouvido perde o tom até o V7. Os semitons cromáticos (si → si♭, fá♯ → fá), que o estilo estrito evita, são o próprio efeito." },
          { rotulo: "O diminuto que muda de tom", ...ex("tom: C menor\nsoprano: Eb5/2 F5 E5 F5 D5 C5\nbaixo: C3/2 B2 C3 D3 E3 A2", "i vii°7=a:vii°65 i6 iv V7 i"),
            perfil: { ...SET }, comentario: "Si–ré–fá–lá♭ é o vii°7 de dó menor. Lido como sol♯–si–ré–fá, é o vii°65 de lá menor — e resolve lá: o baixo sobe si → dó, mas a melodia vai de fá a mi natural, e a cadência confirma lá menor. Uma prévia da modulação enarmônica (nível 4)." },
        ] },
    ],
    exercicios: [
      { id: "sns1", titulo: "Completar: o vii°7 em ré menor", modo: "completar", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: {} },
        cifras: "i vii°7 i vii°65 i6 vii°43 i6 iv vii°42 i64 V7 i".split(" "),
        instrucoes: "<p>Ré menor. Baixo, cifras e o primeiro compasso da melodia estão prontos. Escreva a melodia dos compassos 2–4. No vii°43 a 7ª (si♭) pode estar na melodia; no vii°42 ela está no baixo. A sensível (dó♯) sobe sempre.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5 D5 C#5\nbaixo: D3/1 C#3 D3 E3 F3 G3 F3 G2 Bb2/2 A2/1 A2/1 D3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5 D5 C#5 D5 Bb4 A4 D5 E5/2 D5/1 C#5/1 D5/4\nbaixo: D3/1 C#3 D3 E3 F3 G3 F3 G2 Bb2/2 A2/1 A2/1 D3/4",
        comentarioSolucao: "Si♭4 (a 7ª do vii°43) desce a lá4 sobre o i6; o salto lá4 → ré5 vem com o baixo descendo sol3 → sol2 (movimento contrário). Sobre o vii°42 a melodia tem mi5, que desce a ré5 enquanto o baixo, com a 7ª, desce si♭ → lá." },
      { id: "sns2", titulo: "Menos apoio: sol menor", modo: "menos apoio", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifrasAluno: true, cifrasIniciais: "i vii°7 i",
        instrucoes: "<p>Sol menor. Só o baixo está dado. Escreva cifras e melodia: o baixo pede vii°7, vii°65, vii°43 (com a 7ª preparada pelo iv) e vii°42 antes da cadência composta.</p>",
        texto: "tom: G menor\ncf: baixo\nsoprano:\nbaixo: G2/1 F#2 G2 A2 Bb2 C3 C3 Bb2 Eb3/2 D3/1 D3/1 G2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G menor\ncf: baixo\nsoprano: D5/1 C5 Bb4 C5 Bb4 Eb5/2 D5/1 C5/2 Bb4/1 A4/1 G4/4\nbaixo: G2/1 F#2 G2 A2 Bb2 C3 C3 Bb2 Eb3/2 D3/1 D3/1 G2/4",
        solucaoCifras: "i vii°7 i vii°65 i6 iv vii°43 i6 vii°42 i64 V7 i",
        comentarioSolucao: "O mi♭5 entra como 3ª do iv e fica (ligado) enquanto o acorde vira vii°43: a 7ª preparada à maneira barroca, resolvida em ré5. O vii°42 (mi♭ no baixo) desce ao 6/4 cadencial, e a melodia desce por grau até a tônica." },
      { id: "sns3", titulo: "Restrição: lá natural e lá bemol", modo: "restrição", perfil: { ...SET, set_cifras_pedidas: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, cifrasPedidas: ["viiø7", "vii°7"] }, cifrasAluno: true,
        instrucoes: "<p>Dó maior. Escreva cifras e melodia para o baixo dado. <b>Restrição:</b> use um viiø7 (com lá) e um vii°7 (com lá♭, por mistura), em qualquer inversão, e resolva as 7ªs. Cuidado com a 5ª justa ré–lá do viiø7.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/1 D3 E3 F3 F3 E3 F3/2 G3/2 G3/2 C3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: C5/1 F5 G5 F5 Ab5 G5 F5/2 E5/2 D5/2 C5/4\nbaixo: C3/1 D3 E3 F3 F3 E3 F3/2 G3/2 G3/2 C3/4",
        solucaoCifras: "I viiø65 I6 IV vii°43 I6 ii6 I64 V7 I",
        comentarioSolucao: "viiø65 como passagem dó–ré–mi (a melodia sobe fá5 → sol5 em 10ªs com o baixo); vii°43 sobre o fá preso do IV, com lá♭5 como clímax e 7ª, descendo a sol5. Depois, a cadência composta desce por grau até dó5." },
      { id: "sns4", titulo: "Livre: dó menor", modo: "livre", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha baixo, melodia e cifras: 4 compassos em dó menor com o vii°7 em pelo menos duas posições e cadência autêntica perfeita. Escolha onde a 7ª fica na melodia e onde fica no baixo.</p>",
        texto: "tom: C menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: C menor\nsoprano: Eb5/1 D5 C5 B4 C5 Ab4 G4 C5 D5/2 C5/1 B4/1 C5/4\nbaixo: C3/1 B2 C3 D3 Eb3 F3 Eb3 F2 Ab2/2 G2/1 G2/1 C3/4",
        solucaoCifras: "i vii°7 i vii°65 i6 vii°43 i6 iv vii°42 i64 V7 i",
        comentarioSolucao: "As quatro posições em ordem: vii°7 e vii°65 em volta da tônica, vii°43 com a 7ª (lá♭4) na melodia, vii°42 com a 7ª no baixo (lá♭2 → sol2, sobre o 6/4 cadencial)." },
      { id: "sns5", titulo: "Quebrar: diminutos em cadeia", modo: "quebrar", perfil: { ...SET, intervalo_melodico_aumentado_diminuto: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: {} }, cifras: "i vii°7 vii°43/iv vii°65/V vii°42 V7 i".split(" "),
        instrucoes: "<p>Mi menor. O baixo desce cromaticamente sob três acordes diminutos seguidos (cifras dadas) antes do V7. <b>A quebra:</b> nenhum diminuto vai à sua tônica, e as vozes andam por semitons cromáticos, como na ópera e no piano românticos. Escreva a melodia (uma nota por acorde), mantendo cada 7ª descendo um grau — o efeito vem da cadeia, não do descuido.</p>",
        texto: "tom: E menor\ncf: baixo\nsoprano:\nbaixo: E3/2 D#3 D3 C#3 C3 B2 E3/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: E menor\ncf: baixo\nsoprano: B4/2 C5 B4 A#4 A4 A4 G4/4\nbaixo: E3/2 D#3 D3 C#3 C3 B2 E3/4",
        comentarioSolucao: "A melodia desce dó5 – si4 – lá♯4 – lá4 em 6ªs com o baixo cromático: dó5 (7ª do vii°7) desce a si4, o dó3 do baixo (7ª do vii°42) desce a si2, e lá4 é preparado e vira a 7ª do V7. Só o V7 devolve o tom de mi menor." },
    ],
  }, { depoisDe: "setima_dom" });

  // ================================================================ 3. Sétimas diatônicas
  const P1 = "tom: G maior\nsoprano: G5/2 F#5 E5 D5 C5 C5 B4/4\nbaixo: G2/2 G2 C3 E3 A2 D3 G2/4";
  const P1c = "I I7 IV vi7 ii7 V7 I";
  const P2 = "tom: C maior\nsoprano: E5/2 E5 D5 D5 C5 C5 B4 C5/4\nbaixo: C3/2 A2 B2 G2 A2 F2 G2 C3/4";
  const P2c = "I IV65 viiø7 iii65 vi7 ii65 V7 I";

  T_.inserir(2, {
    id: "setimas_diat", titulo: "Sétimas diatônicas",
    antes: [
      { p: "Em dó maior, qual é a 7ª do ii7, e para onde ela vai no ii7 → V?", o: ["Dó; desce para si", "Fá; desce para mi", "Lá; desce para sol", "Dó; sobe para ré"], e: "ii7 = ré–fá–lá–dó. A 7ª é dó (a tônica), que desce para si, a 3ª do V. Por isso o ii7 se prepara tão bem a partir do I: o dó já está lá." },
      { p: "Numa cadeia de quintas descendentes com sétimas em todos os acordes, de onde vem a 7ª de cada acorde?", o: ["Da 3ª do acorde anterior, que fica parada enquanto o baixo muda", "Da 5ª do acorde anterior", "Da fundamental do acorde anterior, que desce", "De um salto, porque não há nota comum"], e: "Se as fundamentais descem por quintas, a 3ª de um acorde é a 7ª do seguinte (lá–dó–mi → ré–fá–lá–dó: o dó). Enquanto uma voz segura a 3ª que vira 7ª, outra resolve a 7ª anterior: as 7ªs se preparam e se resolvem em cadeia." },
      { p: "Que acorde de sétima diatônico tem a 7ª maior e aparece quase só em sequências ou como passagem?", o: ["I7 (e IV7) — dó–mi–sol–si", "V7", "ii7", "vii°7"], e: "Em maior, I7 e IV7 têm 7ª maior (si sobre dó, mi sobre fá). Fora das cadeias de quintas eles quase só aparecem com a 7ª de passagem (8–7), porque o I7 enfraquece a tônica e o si quer descer, contrariando a sensível." },
    ],
    objetivo: "Usar ii7/ii65 como pré-dominante e as outras sétimas diatônicas (IV7, vi7, iii7, I7) com preparação e resolução — sobretudo nas cadeias de quintas descendentes, onde elas se encadeiam sozinhas.",
    ouvir: [
      "Corelli, Sonatas op. 5 e Concerti grossi op. 6: cadeias de sétimas sobre baixos em quintas descendentes",
      "Vivaldi, concertos de L'estro armonico op. 3: progressões de quintas nos episódios",
      "Corais de Bach: o ii65 antes da cadência, com a 7ª preparada pela tônica",
    ],
    esboco: "Em dó maior, sobre o baixo dó–lá–si–sol–lá–fá–sol–dó, que acordes de sétima você poria? Tente uma melodia em que cada nota se repita uma vez antes de descer.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Sétimas sobre todos os graus", html: `
        <p>Qualquer grau pode levar 7ª, e a regra é a do contraponto: a 7ª é uma dissonância, <b>preparada</b> (no Barroco estrito, sempre) e <b>resolvida descendo um grau</b>. O que muda de um grau para outro é a qualidade e o uso.</p>
        <table class="tabela-modos"><thead><tr><th>Acorde</th><th>Dó maior</th><th>Lá menor</th><th>7ª → resolução</th><th>Uso</th></tr></thead><tbody>
        <tr><td><b>ii7 / ii65</b></td><td>ré–fá–lá–dó (m7)</td><td>siø7: si–ré–fá–lá</td><td>1̂ → 7̂ (sobre o V)</td><td>a pré-dominante com 7ª; o ii65 é o 4º grau subindo da regra da oitava</td></tr>
        <tr><td><b>IV7</b></td><td>fá–lá–dó–mi (M7)</td><td>iv7: ré–fá–lá–dó</td><td>3̂ → 2̂ (sobre V ou vii°)</td><td>pré-dominante; cuidado com 5ªs fá–dó → sol–ré a quatro vozes</td></tr>
        <tr><td><b>vi7</b></td><td>lá–dó–mi–sol</td><td>VI7: fá–lá–dó–mi</td><td>5̂ → 4̂ (sobre ii)</td><td>elo de cadeia: vi7 → ii7 → V7</td></tr>
        <tr><td><b>iii7</b></td><td>mi–sol–si–ré</td><td>III7: dó–mi–sol–si</td><td>2̂ → 1̂ (sobre vi)</td><td>quase só em sequências</td></tr>
        <tr><td><b>I7</b></td><td>dó–mi–sol–si (M7)</td><td>i7: lá–dó–mi–sol</td><td>7̂ → 6̂ (sobre IV)</td><td>7ª de passagem 8–7 levando ao IV; em sequência</td></tr>
        </tbody></table>
        <h3>A preparação</h3>
        <p>A 7ª nasce de uma nota comum: o acorde anterior tem a nota que vai virar 7ª, e a mesma voz a mantém enquanto o baixo muda. No ii7 a 7ª é a tônica — vem naturalmente do I ou do vi; no IV7 é o 3º grau, que vem do I. A alternativa histórica é a <b>7ª de passagem</b>: a fundamental desce à 7ª sobre o mesmo baixo (I → I7, 8–7).</p>
        <h3>A cadeia de quintas</h3>
        <p>Com as fundamentais descendo por quintas, a 3ª de cada acorde é a 7ª do seguinte. Por isso as sétimas se encadeiam sem esforço (é o que se ouve em Corelli e Vivaldi):</p>
        <ul><li><b>A quatro vozes</b>, alternam-se acordes completos e incompletos (sem 5ª), e as vozes que têm a 7ª se revezam.</li>
        <li><b>No par externo</b>, a voz de cima faz <b>3ª → 7ª → 3ª → 7ª</b>: repete uma nota (consonante, depois dissonante) e desce um grau. O baixo pode ir só em fundamentais (saltos de 4ª e 5ª) ou alternar 7 e 65 (lá–si–sol–lá–fá–sol), andando quase por grau.</li>
        <li>No ii65 → I64 → V a 7ª pode <b>ficar</b> sobre o 6/4 cadencial e descer só no V: o 6/4 é uma dupla apojatura do V, e a resolução é adiada, não abandonada.</li></ul>` },
      { tipo: "exemplo", titulo: "Uma escala com quatro sétimas", intro: "Sol maior. A melodia desce a oitava sol–sol; cada passo de grau vira a 7ª de um acorde ou a sua resolução.",
        camadas: [
          { titulo: "Baixo e cifras", partitura: "tom: G maior\nbaixo: G2/2 G2 C3 E3 A2 D3 G2/4", rotulos: ["baixo"], cifras: cifrar(P1, P1c),
            notas: [["decisao", "I → I7 sobre o mesmo sol: a 7ª entra de passagem (8–7). Depois IV, e a cadeia vi7 – ii7 – V7 – I em quintas descendentes."],
              ["checagem", "IV → vi7 não é retrogressão para a regra (pré-dominante → tônica), e prepara a cadeia de quintas que leva ao fim."]] },
          { titulo: "A melodia", partitura: P1, cifras: cifrar(P1, P1c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 1, "7ª (8–7)"], [0, 3, "7ª (8–7)"], [0, 5, "7ª preparada"]],
            notas: [["decisao", "Fá♯5 é a 7ª do I7 e desce a mi5 sobre o IV: o I7 funciona como uma dominante do IV sem sair do tom."],
              ["decisao", "Ré5 sobre mi3 é a 7ª do vi7, de novo de passagem (mi5 → ré5); desce a dó5, a 3ª do ii7."],
              ["decisao", "O dó5 fica: era 3ª do ii7 e vira 7ª do V7 (preparada), resolvendo em si4 sobre o I."],
              ["rejeitada", "Pensei em harmonizar o fá♯5 com V (ré3): mais comum, mas o baixo sairia do sol cedo demais e a 7ª maior sobre a tônica — a cor deste exemplo — desapareceria."],
              ["checagem", "Três 7ªs na melodia (fá♯5, ré5, dó5), todas descendo um grau; nenhuma 5ª ou 8ª entre as vozes a não ser no início."]],
            pausa: ["Por que a 7ª do ii7 (sol) não está em nenhuma voz externa?", "Porque a melodia está ocupada com a 3ª (dó), que vai ser preparada como 7ª do V7. Na realização a quatro vozes, o sol fica numa voz interna e desce a fá♯ — as duas 7ªs da cadeia se revezam entre as vozes, e só uma cabe no soprano."] },
        ] },
      { tipo: "exemplo", titulo: "A cadeia 7 – 65", intro: "Dó maior. Fundamentais descendo por quintas, baixo alternando estado fundamental e 1ª inversão.",
        camadas: [
          { titulo: "Baixo e cifras", partitura: "tom: C maior\nbaixo: C3/2 A2 B2 G2 A2 F2 G2 C3/4", rotulos: ["baixo"], cifras: cifrar(P2, P2c),
            notas: [["decisao", "Fundamentais dó–fá–si–mi–lá–ré–sol–dó; com IV, iii e ii em 6/5, o baixo vira dó–lá–si–sol–lá–fá–sol–dó: quase só graus e 3ªs, sem o trítono fá–si."]] },
          { titulo: "Com a melodia", partitura: P2, cifras: cifrar(P2, P2c), rotulos: ["soprano", "baixo"], anotacoes: [[0, 1, "7ª"], [0, 3, "7ª"], [0, 5, "7ª"]],
            notas: [["decisao", "A melodia faz 3–7, 3–7, 3–7: mi5 é 3ª do I e 7ª do IV65, desce a ré5 (3ª do viiø7), que vira 7ª do iii65, e assim por diante."],
              ["rejeitada", "Pensei em uma melodia que subisse no meio da cadeia: quebraria o padrão de preparação e cada 7ª teria de entrar por salto."],
              ["checagem", "Todas as 7ªs da melodia estão preparadas (a mesma nota no acorde anterior) e resolvem; as 7ªs dos acordes em estado fundamental (lá, sol, fá) ficam nas vozes internas."]],
            pausa: ["As 5ªs justas entre as vozes (mi5/lá2, ré5/sol2, dó5/fá2) a cada dois acordes são um problema?", "Não: nunca são consecutivas (entre elas há sempre uma 10ª) e chegam por movimento oblíquo, com a melodia parada. É o padrão da cadeia, e ele se repete igual — o que, no próximo capítulo, vai se chamar sequência."] },
        ] },
      { tipo: "contraste", titulo: "Tríades × sétimas sobre o mesmo baixo",
        a: { rotulo: "A — tríades (I IV6 vii° iii6 vi ii6 V I)", ...ex("tom: C maior\nsoprano: G5/2 F5 F5 E5 E5 D5 D5 C5/4\nbaixo: C3/2 A2 B2 G2 A2 F2 G2 C3/4", "I IV6 vii° iii6 vi ii6 V I") },
        b: { rotulo: "B — sétimas (I IV65 viiø7 iii65 vi7 ii65 V7 I)", ...ex(P2, P2c) },
        pergunta: "O baixo é o mesmo. O que as sétimas acrescentam ao movimento?",
        comentario: "<p>Em A a cadeia anda, mas cada acorde é estável: o impulso vem só do baixo. Em B cada acorde tem uma dissonância que pede o seguinte — a 7ª preparada no acorde anterior cria uma tensão que só se desfaz no próximo, e esse se encarrega de criar a sua. É a 'corrente' que os tratados barrocos admiravam: cada elo puxa o outro, e a cadência final é a primeira chegada sem dissonância.</p>" },
      { tipo: "quebra", titulo: "Sétimas sem preparação e sétimas paralelas", html: `
        <p>Já no estilo clássico a preparação deixa de ser obrigatória para o ii7 e o IV7 (como já tinha deixado para o V7). No século XIX a 7ª diatônica vira <b>cor</b>: acordes de 7ª maior e menor aparecem atacados no tempo forte, sustentados, encadeados sem resolver. Satie, na Gymnopédie nº 1, alterna duas 7ªs maiores (sobre sol e sobre ré) durante toda a introdução, sem resolução nenhuma — o efeito é de imobilidade, de um tempo suspenso.</p>
        <p>No impressionismo (Debussy, Ravel) acordes inteiros, com 7ª e 9ª, <b>deslizam em paralelo</b> sobre a melodia (o <i>planing</i>): a 7ª não é mais uma voz que precisa ir a algum lugar, é parte do timbre do acorde, e o acorde se move como uma linha engrossada. O que se perde é justamente a corrente de tensões da cadeia barroca; o que se ganha é cor e ambiguidade.</p>`,
        exemplos: [
          { rotulo: "Sétimas em paralelo (planing), depois uma cadência clássica", ...ex("tom: C maior\nsoprano: B4/1 C5 D5 E5 F5/2 E5/2\nbaixo: C3/1 D3 E3 F3 G3/2 C3/2", "I7 ii7 iii7 IV7 V7 I"),
            perfil: { ...SET, set_setima: "info" }, comentario: "As vozes sobem juntas em 7ªs: si/dó, dó/ré, ré/mi, mi/fá. Cada 7ª sobe em vez de descer — o verificador anota, mas aqui é a ideia. No V7 a linguagem volta ao normal (fá5 → mi5), e o contraste deixa claro o que o planing suspende." },
          { rotulo: "Duas 7ªs maiores alternadas, sem resolução", ...ex("tom: D maior\nsoprano: D5/2 F#5/2~ F#5/2 C#5/2 D5/2 F#5/2~ F#5/2 C#5/2\nbaixo: G2/4 D3/4 G2/4 D3/4", "IV7 I7 IV7 I7"),
            perfil: { ...SET, set_setima: "info", dissonancia_resolucao: "info", dissonancia_aproximacao: "info" }, comentario: "IV7 e I7 em ré maior, alternados como na introdução da Gymnopédie nº 1 de Satie (o desenho da melodia aqui é outro). O fá♯ é 7ª do IV7 e fica, ligado, como 3ª do I7; o dó♯, 7ª do I7, sobe a ré em vez de descer. Nada resolve: as 7ªs são cor." },
        ] },
    ],
    exercicios: [
      { id: "sd1", titulo: "Completar: a cadeia 7 – 65 em ré maior", modo: "completar", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: {} },
        cifras: "I IV65 viiø7 iii65 vi7 ii65 V7 I".split(" "),
        instrucoes: "<p>Ré maior. Baixo e cifras da cadeia de quintas estão prontos; a melodia começa com fá♯5 (3ª do I), repetido como 7ª do IV65. Continue: em cada acorde em 6/5, a melodia tem a 7ª preparada; em cada acorde em estado fundamental, a resolução.</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano: F#5/2 F#5\nbaixo: D3/2 B2 C#3 A2 B2 G2 A2 D3/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: D maior\ncf: baixo\nsoprano: F#5/2 F#5 E5 E5 D5 D5 C#5 D5/4\nbaixo: D3/2 B2 C#3 A2 B2 G2 A2 D3/4",
        comentarioSolucao: "fá♯–fá♯–mi–mi–ré–ré–dó♯–ré: cada nota é 3ª de um acorde e 7ª do seguinte. A melodia desce uma 3ª em quatro compassos, sempre por preparação e resolução." },
      { id: "sd2", titulo: "Menos apoio: a cadeia em lá menor", modo: "menos apoio", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifrasAluno: true, cifrasIniciais: "i iv65",
        instrucoes: "<p>Lá menor. O baixo (lá–fá–sol–mi–fá–ré–mi–lá) é uma cadeia de quintas alternando 7 e 65. Escreva as cifras (em menor: iv7, VII7, III7, VI7, iiø7, V7) e a melodia, com as 7ªs preparadas e resolvidas, terminando na tônica.</p>",
        texto: "tom: A menor\ncf: baixo\nsoprano:\nbaixo: A2/2 F2 G2 E2 F2 D2 E2 A2/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: A menor\ncf: baixo\nsoprano: C5/2 C5 B4 B4 A4 A4 G#4 A4/4\nbaixo: A2/2 F2 G2 E2 F2 D2 E2 A2/4",
        solucaoCifras: "i iv65 VII7 III65 VI7 iiø65 V7 i",
        comentarioSolucao: "Em menor natural a cadeia passa por VII7 e III7 (sol e dó maiores com 7ª): só no fim a sensível sol♯ aparece, no V7. Repare que o iiø65 tem a 7ª (lá) preparada pelo VI7 e resolvida na sensível." },
      { id: "sd3", titulo: "Restrição: só sétimas preparadas", modo: "restrição", perfil: { ...SET, set_setima_preparada: "erro" }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true,
        instrucoes: "<p>Fá maior, à maneira barroca. Escreva cifras e melodia para o baixo dado usando pelo menos um IV7 e um ii7. <b>Restrição:</b> toda 7ª de acorde na melodia ou no baixo vem preparada — a mesma nota já soava no acorde anterior.</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano:\nbaixo: F3/2 Bb2 C3 D3 G2 C3 F2/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: F maior\ncf: baixo\nsoprano: A5/2 A5 G5 F5 F5 E5 F5/4\nbaixo: F3/2 Bb2 C3 D3 G2 C3 F2/4",
        solucaoCifras: "I IV7 V vi ii7 V7 I",
        comentarioSolucao: "Lá5 (3ª do I) fica e vira a 7ª do IV7, resolvendo em sol5 sobre o V; fá5 (3ª do vi) fica e vira a 7ª do ii7, resolvendo em mi5 sobre o V7. A 7ª do V7 (si♭) fica implícita, preparada pelo ii7." },
      { id: "sd4", titulo: "Livre: uma cadeia de sétimas em ré menor", modo: "livre", perfil: SET, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha baixo, melodia e cifras em ré menor: 4 compassos com uma cadeia de quintas descendentes que use pelo menos três sétimas diatônicas além do V7, e cadência autêntica perfeita.</p>",
        texto: "tom: D menor\nsoprano:\nbaixo:", duracao: 2,
        solucao: "tom: D menor\nsoprano: F5/2 F5 E5 E5 D5 D5 C#5 D5/4\nbaixo: D3/2 Bb2 C3 A2 Bb2 G2 A2 D3/4",
        solucaoCifras: "i iv65 VII7 III65 VI7 iiø65 V7 i",
        comentarioSolucao: "A cadeia completa i – iv7 – VII7 – III7 – VI7 – iiø7 – V7 – i, com o baixo alternando 7 e 65 para evitar o trítono si♭–mi e a melodia fazendo 3ª–7ª em cada par." },
      { id: "sd5", titulo: "Quebrar: sétimas em paralelo", modo: "quebrar", perfil: { ...SET, set_setima: "info" }, nivel: 6, contexto: { nivel: 6, plano: {} },
        cifras: "I7 ii7 iii7 IV7 V7 I".split(" "),
        instrucoes: "<p>Sol maior. Baixo e cifras estão dados. <b>A quebra:</b> nos quatro primeiros acordes, a melodia fica sempre uma 7ª acima do baixo e sobe com ele (planing): as 7ªs sobem em vez de descer, como cor. No V7 → I, volte ao tratamento clássico e resolva a 7ª.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/1 A2 B2 C3 D3/2 G2/2", duracao: 1, alvoCompassos: 2,
        solucao: "tom: G maior\ncf: baixo\nsoprano: F#4/1 G4 A4 B4 C5/2 B4/2\nbaixo: G2/1 A2 B2 C3 D3/2 G2/2",
        comentarioSolucao: "Fá♯4–sol4–lá4–si4 sobre sol–lá–si–dó: quatro 7ªs paralelas (maior, menor, menor, maior). O dó5 do V7 é a única 7ª tratada à maneira antiga — e soa como volta à gramática depois da cor." },
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
    antes: [
      { p: "O que define uma sequência harmônica?", o: ["Um modelo (vozes e harmonia) repetido em outros graus, com o mesmo desenho em todas as vozes", "Qualquer progressão que passe por todos os graus", "Uma melodia repetida sobre harmonias diferentes", "Um baixo que desce por grau"], e: "A sequência é o princípio modelo + cópia: o bloco inteiro (baixo, melodia, harmonia) é transposto. Repetir só a melodia é sequência melódica; repetir o baixo sob outra melodia é um ostinato." },
      { p: "Numa sequência diatônica de quintas descendentes em dó maior, o baixo vai de fá a si. O que isso tem de especial?", o: ["É um trítono, aceito porque o padrão da sequência manda", "É um erro: a sequência tem de ser alterada para fá♯", "Nada: fá–si é uma 5ª justa", "Obriga a modular para sol maior"], e: "Na sequência diatônica as qualidades mudam (5ª justa vira diminuta, acorde maior vira diminuto) para continuar no tom. O vii° em estado fundamental e o trítono do baixo são tolerados dentro do padrão — fora dele, seriam evitados." },
      { p: "Qual destes esquemas de Riepel é uma sequência ascendente que toniciza IV e depois V?", o: ["Monte", "Fonte", "Ponte", "Prinner"], e: "Monte (montanha) sobe: V7/IV – IV, V7/V – V. Fonte (fonte, que desce) toniciza ii e depois I. Ponte (ponte) não é sequência: prolonga a dominante. O Prinner é uma resposta em 10ªs, não uma sequência." },
    ],
    objetivo: "Compor sequências — quintas descendentes, 5–6 ascendente e descendente, Romanesca, Monte e Fonte — copiando o modelo voz por voz, e saber quando a sequência deve parar.",
    ouvir: [
      "Pachelbel, Cânone em ré: o baixo da Romanesca (1–5–6–3–4–1–4–5) repetido como ostinato",
      "Vivaldi, concertos de L'estro armonico op. 3: sequências de quintas descendentes nos episódios",
      "Bach, fugas do Cravo Bem Temperado: os episódios entre as entradas do sujeito são quase sempre sequências",
      "Minuetos de Haydn e Mozart: Monte e Fonte logo depois da barra dupla",
    ],
    esboco: "Escreva um compasso em dó maior (baixo e soprano, duas mínimas) e copie-o duas vezes, um grau abaixo a cada vez, sem mudar nenhum intervalo das vozes. O que acontece com as qualidades dos acordes?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Modelo e cópia", html: `
        <p>Uma sequência é um <b>modelo</b> — um pequeno bloco de baixo, melodia e harmonia — repetido em outros graus. Kostka & Payne a ensinam junto com a progressão harmônica; a pedagogia napolitana dos partimenti a ensinava como <b>movimentos de baixo</b> (os <i>moti</i>) a realizar em todos os tons, e Riepel (<i>Anfangsgründe</i>, 1755) deu nome a três fórmulas galantes: Monte, Fonte e Ponte.</p>
        <h3>O que tem de se repetir</h3>
        <ul><li><b>Todas as vozes</b>, com o mesmo ritmo e os mesmos intervalos (contados em graus), transpostas pelo mesmo intervalo. Se a melodia muda o desenho, o ouvido não reconhece a cópia.</li>
        <li><b>A condução de vozes repete-se exatamente</b>: se o modelo é limpo, a cópia é limpa. Por isso se verifica com cuidado a <b>junção</b> modelo → cópia (o último acorde do modelo para o primeiro da cópia), que é o único lugar novo.</li>
        <li>Na <b>sequência diatônica</b> (ou tonal) as qualidades mudam para ficar no tom: o I maior vira ii menor, o IV vira vii° diminuto. Dentro do padrão toleram-se o vii° em estado fundamental e o trítono melódico no baixo (fá–si), que fora dele seriam evitados.</li>
        <li>Na <b>sequência real</b> (ou modulante) a cópia é exata, semitom por semitom, e por isso sai do tom.</li>
        <li>O uso é limitado: modelo + duas cópias costuma bastar (a terceira já cansa); a sequência <b>precisa de destino</b>, normalmente uma cadência.</li></ul>
        <h3>Os tipos principais</h3>
        <table class="tabela-modos"><thead><tr><th>Tipo</th><th>Fundamentais</th><th>Baixo típico (dó maior)</th><th>Observação</th></tr></thead><tbody>
        <tr><td><b>Quintas descendentes</b></td><td>4ª acima, 5ª abaixo</td><td>dó–fá–si–mi–lá–ré–sol–dó</td><td>a mais comum; aceita 7ªs em cadeia e inversões alternadas (7–65)</td></tr>
        <tr><td><b>5–6 ascendente</b></td><td>3ª abaixo, 4ª acima</td><td>dó–dó–ré–ré–mi–mi…</td><td>a voz superior faz 5–6 sobre cada nota do baixo: o 6 quebra as 5ªs paralelas de tríades subindo por grau</td></tr>
        <tr><td><b>Descendente 5–6 / Romanesca</b></td><td>4ª abaixo, 2ª acima</td><td>dó–sol–lá–mi–fá–dó (ou dó–si–lá–sol–fá–mi)</td><td>o baixo do Cânone de Pachelbel; as fundamentais descem por 3ªs a cada par</td></tr>
        <tr><td><b>Monte</b></td><td>V7/IV–IV, V7/V–V</td><td>mi–fá, fá♯–sol</td><td>sobe um grau; tensão crescente</td></tr>
        <tr><td><b>Fonte</b></td><td>V7/ii–ii, V7–I</td><td>dó♯–ré, si–dó</td><td>desce um grau, de menor para maior; relaxamento</td></tr>
        <tr><td><b>Ponte</b></td><td>V prolongado</td><td>sol pedal</td><td>não é sequência: é a dominante sustentada antes da volta do tema</td></tr>
        </tbody></table>
        <p>No verificador, a regra <b>Modelo e cópia</b> recebe onde está o modelo e quantas cópias o exercício pede, e confere ritmo, intervalos e transposição em cada voz.</p>` },
      { tipo: "exemplo", titulo: "Quintas descendentes, com e sem sétimas", intro: "Dó maior. Modelo: o compasso 1. Cada cópia desce um grau.",
        camadas: [
          { titulo: "Tríades", ...ex(Q1, "I IV vii° iii vi ii V I"), contexto: sq([0, 4], 3), anotacoes: [[1, 0, "modelo"], [1, 2, "cópia 1"], [1, 4, "cópia 2"], [1, 6, "cópia 3 = cadência"]],
            notas: [["decisao", "Modelo: baixo dó3 → fá3 (4ª acima), melodia mi5 → fá5 (grau acima) — 10ª → 8ª. As cópias repetem os dois intervalos um grau abaixo."],
              ["decisao", "A terceira cópia (sol2 → dó3, si4 → dó5) é a própria cadência V–I: a sequência chega ao destino sem mudar de padrão."],
              ["checagem", "As 8ªs (fá5/fá3, mi5/mi3, ré5/ré3) chegam por movimento direto com a melodia por grau, e nunca são consecutivas. A junção (fá3 → si2 e fá5 → ré5) é a mesma em todas as cópias."]],
            pausa: ["O baixo fá3 → si2 é uma 5ª diminuta. Por que o verificador só avisa?", "Porque, numa sequência diatônica, a cópia tem de manter os graus para ficar no tom: o trítono é consequência do padrão, e o ouvido o aceita porque já reconheceu o modelo. Alterar o si para si♭ (ou o fá para fá♯) mudaria a sequência para real — e sairia do tom."] },
          { titulo: "Com sétimas", ...ex(Q2, "I IV7 viiø7 iii7 vi7 ii7 V7 I"), contexto: sq([0, 4], 2),
            notas: [["decisao", "Melodia mi–mi–ré–ré–dó–dó–si–dó: a nota repetida é 3ª de um acorde e 7ª do seguinte, sempre preparada e resolvida um grau abaixo."],
              ["rejeitada", "Pensei em manter a melodia da camada anterior (mi–fá–ré–mi…): sobre IV7 o fá dobraria a fundamental e a 7ª ficaria só nas vozes internas — a cadeia de dissonâncias, que é o interesse desta versão, não apareceria na melodia."]] },
        ] },
      { tipo: "exemplo", titulo: "5–6 ascendente e Romanesca", intro: "Duas sequências por grau: uma sobe, outra desce.",
        camadas: [
          { titulo: "5–6 ascendente: a voz que faz o 5–6", ...ex(Q3, "I vi6 ii vii°6 iii I6 IV ii6 V I"), contexto: sq([0, 2], 3),
            notas: [["decisao", "Sobre cada nota do baixo (repetida), a voz de cima faz 5ª → 6ª: sol–lá sobre dó, lá–si sobre ré… O 6 transforma cada tríade num acorde de sexta e evita as 5ªs paralelas de I–ii–iii–IV."],
              ["checagem", "As 5ªs (sol/dó, lá/ré, si/mi, dó/fá) são todas chegadas por movimento oblíquo — a voz de cima fica parada enquanto o baixo sobe."]] },
          { titulo: "5–6 ascendente: a melodia em 10ªs", ...ex(Q4, "I vi6 ii vii°6 iii I6 IV ii6 V I"), contexto: sq([0, 2], 3),
            notas: [["decisao", "Numa textura real o 5–6 fica numa voz interna, e a melodia acompanha o baixo em 10ªs: mi–fá–sol–lá sobre dó–ré–mi–fá."],
              ["checagem", "Dez 10ªs seguidas não são problema para a regra (não são perfeitas), mas a melodia perde independência: por isso a sequência para depois de três cópias e a cadência traz movimento contrário."]] },
          { titulo: "Romanesca saltada (descendente 5–6)", ...ex(Q5, "I V vi iii IV I IV V I"), contexto: sq([0, 4], 2),
            notas: [["decisao", "Baixo dó–sol, lá–mi, fá–dó: cada par desce uma 4ª, e o par seguinte começa uma 2ª acima. A melodia desce a escala mi–ré–dó–si–lá–sol, 10ª–5ª em cada par."],
              ["decisao", "Depois de duas cópias, a sequência para: fá–sol–dó é a cadência (IV–V–I)."]] },
          { titulo: "Romanesca por graus", ...ex(Q6, "I V6 vi iii6 IV I6 IV V I"), contexto: sq([0, 4], 2),
            notas: [["decisao", "Com V6 e iii6 o baixo desce por grau (dó–si–lá–sol–fá–mi) sob a mesma melodia, em 10ªs paralelas. É a forma da Romanesca que Gjerdingen chama de 'por graus'."]],
            pausa: ["As duas Romanescas têm as mesmas fundamentais. Qual delas soa mais como sequência, e por quê?", "A saltada: o salto de 4ª no baixo marca o começo de cada cópia e o ouvido conta os pares. Na versão por graus o baixo vira uma escala contínua e a segmentação em modelo e cópia quase desaparece — soa mais como uma linha descendente que como uma repetição."] },
        ] },
      { tipo: "contraste", titulo: "Monte × Fonte",
        a: { rotulo: "A — Monte: V65/IV – IV, V65/V – V (sobe)", ...ex("tom: C maior\nsoprano: C5/2 Bb4 A4 C5 B4 D5 C5/4\nbaixo: C3/2 E3 F3 F#3 G3 G2 C3/4", "I V65/IV IV V65/V V V7 I"), contexto: sq([2, 6], 1, true) },
        b: { rotulo: "B — Fonte: V65/ii – ii, V65 – I (desce)", ...ex("tom: C maior\nsoprano: G5/2 G5 F5 F5 E5 D5 B4 C5\nbaixo: E3/2 C#3 D3 B2 C3 F2 G2 C3", "I6 V65/ii ii V65 I ii6 V7 I"), contexto: sq([2, 6], 1) },
        pergunta: "As duas fazem 'dominante → resolução' duas vezes. Qual cria expectativa, e qual a desfaz?",
        comentario: "<p>No Monte cada elo é um grau mais alto (fá, depois sol) e termina no V: a música sobe e chega a uma dominante — tensão crescente, ideal para levar à volta do tema. No Fonte o primeiro elo vai a um acorde menor (ii) e o segundo, um grau abaixo, à tônica maior: a música desce e repousa. Riepel deu os nomes pela imagem — a montanha que se sobe, a fonte que corre para baixo. Repare também que o Monte é uma sequência real (as duas metades são idênticas, só transpostas), enquanto o Fonte muda de menor para maior.</p>" },
      { tipo: "quebra", titulo: "Sequências reais, cromáticas e interrompidas", html: `
        <p><b>Barroco.</b> Vivaldi e Bach usam sequências como motor: nos episódios das fugas e dos concertos, um fragmento do tema é copiado em quintas descendentes até a próxima entrada ou cadência. A sequência diatônica mantém o tom e gera movimento sem gerar novidade harmônica.</p>
        <p><b>Clássico.</b> A sequência aparece sobretudo nas seções instáveis (depois da barra dupla, nos desenvolvimentos), e raramente vai além de duas cópias: o modelo é dito, copiado, e a terceira vez é <b>fragmentada ou interrompida</b> por uma cadência. A quebra do padrão é o sinal de que a forma vai mudar de fase.</p>
        <p><b>Romântico.</b> A sequência real (exata) sai do tom, e é usada justamente para isso: cadeias de dominantes com 7ª, diminutos deslizando por semitom, transposições por 3ªs maiores ou menores que dividem a oitava em partes iguais e apagam o centro tonal. No prelúdio de Tristão e Isolda, Wagner reapresenta o gesto inicial em transposições ascendentes, e a sequência vira o próprio motor da harmonia.</p>`,
        exemplos: [
          { rotulo: "Sequência real: dominantes encadeadas", ...ex("tom: C maior\nsoprano: E5/2 D5 C#5 C5 B4 C5\nbaixo: C3/2 E3 A2 D3 G2 C3", "I V7/vi V7/ii V7/V V7 I"),
            perfil: { ...SEQ, intervalo_melodico_aumentado_diminuto: "info" }, contexto: sq([2, 6], 1, true),
            comentario: "Mi7 → lá7, ré7 → sol7: a cópia é exata, semitom por semitom. Cada 7ª desce (ré5 → dó♯5, dó5 → si4), mas a 3ª de cada dominante (dó♯) desce cromaticamente em vez de subir — a 'sensível' de ré nunca chega a ré. O ouvido segue o padrão e aceita a saída do tom, que só volta com o V7 → I." },
          { rotulo: "Sequência interrompida", ...ex("tom: C maior\nsoprano: E5/2 F5 D5 E5 C5/2 B4/2 C5/4\nbaixo: C3/2 F3 B2 E3 F3/2 G3/2 C3/4", "I IV vii° iii IV V I"),
            perfil: { ...SEQ, set_sequencia: "info" }, contexto: sq([0, 4], 2),
            comentario: "Modelo e uma cópia de quintas descendentes; a segunda cópia esperada (lá–ré) não vem: o baixo vai a fá e a frase cadencia. O verificador anota a cópia que falta — é exatamente a expectativa frustrada que dá força à cadência." },
        ] },
    ],
    exercicios: [
      { id: "sq1", titulo: "Completar: as cópias de um modelo com sétimas", modo: "completar", perfil: SEQ, nivel: 6, contexto: { nivel: 6, plano: {}, ...sq([0, 4], 2) },
        cifras: "I IV7 viiø7 iii7 vi7 ii7 V7 I".split(" "),
        instrucoes: "<p>Ré maior. O baixo é uma sequência de quintas descendentes; as cifras e o modelo da melodia (compasso 1: fá♯5 repetido, 3ª do I e 7ª do IV7) estão dados. Escreva as duas cópias (compassos 2 e 3), repetindo o desenho do modelo um grau abaixo de cada vez, e a cadência no compasso 4.</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano: F#5/2 F#5\nbaixo: D3/2 G3 C#3 F#3 B2 E3 A2 D3", duracao: 2, alvoCompassos: 4,
        solucao: "tom: D maior\ncf: baixo\nsoprano: F#5/2 F#5 E5 E5 D5 D5 C#5 D5\nbaixo: D3/2 G3 C#3 F#3 B2 E3 A2 D3",
        comentarioSolucao: "Cada cópia repete a nota (3ª → 7ª preparada) e desce: mi–mi sobre viiø7–iii7, ré–ré sobre vi7–ii7. O si do baixo no compasso 3 e o sol–dó♯ da junção do compasso 1 são os trítonos aceitos da sequência diatônica." },
      { id: "sq2", titulo: "Menos apoio: 5–6 ascendente em sol maior", modo: "menos apoio", perfil: SEQ, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 3 }, ...sq([0, 2], 3) },
        cifrasAluno: true, cifrasIniciais: "I vi6",
        instrucoes: "<p>Sol maior. O baixo sobe por grau com cada nota repetida (5–6 ascendente). As duas primeiras cifras estão dadas. Escreva as outras e a melodia: o modelo são os dois primeiros tempos, e cada cópia repete o desenho um grau acima (três cópias). Feche com V–I e a tônica na melodia.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/1 G2 A2 A2 B2 B2 C3 C3 D3/2 G2/2", duracao: 1, alvoCompassos: 3,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 B4 C5 C5 D5 D5 E5 E5 F#5/2 G5/2\nbaixo: G2/1 G2 A2 A2 B2 B2 C3 C3 D3/2 G2/2",
        solucaoCifras: "I vi6 ii vii°6 iii I6 IV ii6 V I",
        comentarioSolucao: "A melodia em 10ªs com o baixo (si–dó–ré–mi sobre sol–lá–si–dó) e o 5–6 implícito na voz interna: I–vi6, ii–vii°6, iii–I6, IV–ii6. A sensível fá♯5 sobe a sol5 na cadência." },
      { id: "sq3", titulo: "Restrição: Monte, com a cópia exata", modo: "restrição", perfil: SEQ, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 }, ...sq([2, 6], 1, true) },
        cifras: "I V65/IV IV V65/V V V7 I".split(" "),
        instrucoes: "<p>Ré maior. O baixo e as cifras são um Monte (V65/IV – IV, V65/V – V). Escreva a melodia. <b>Restrição:</b> a cópia (compassos 2–3, do sol♯ ao lá) repete o modelo (do fá♯ ao sol) <b>exatamente</b>, semitom por semitom — uma sequência real. A 7ª de cada dominante secundária está na melodia e desce.</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano:\nbaixo: D3/2 F#3 G3 G#3 A3 A2 D3/4", duracao: 2, alvoCompassos: 4,
        solucao: "tom: D maior\ncf: baixo\nsoprano: D5/2 C5 B4 D5 C#5 E5 D5/4\nbaixo: D3/2 F#3 G3 G#3 A3 A2 D3/4",
        comentarioSolucao: "Dó5 (7ª de ré7, a dominante do IV) desce a si4; ré5 (7ª de mi7, a dominante do V) desce a dó♯5. Os dois elos são idênticos um tom acima — o Monte é real por natureza, porque as duas metas (IV e V) são maiores." },
      { id: "sq4", titulo: "Livre: quintas descendentes em lá menor", modo: "livre", perfil: SEQ, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 }, ...sq([0, 4], 2) }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha baixo, melodia e cifras em lá menor: o compasso 1 é o modelo (duas mínimas) de uma sequência de quintas descendentes; os compassos 2 e 3 são duas cópias; o 4 é a cadência perfeita.</p>",
        texto: "tom: A menor\nsoprano:\nbaixo:", duracao: 2,
        solucao: "tom: A menor\nsoprano: C5/2 D5 B4 C5 A4 B4 G#4 A4\nbaixo: A2/2 D3 G2 C3 F2 B2 E2 A2",
        solucaoCifras: "i iv VII III VI ii° V i",
        comentarioSolucao: "Em menor natural a cadeia passa por VII e III (sol e dó maiores) e por ii° em estado fundamental (tolerado na sequência); só na cópia final, que é a cadência, aparece a sensível sol♯. A melodia sobe um grau em cada par (10ª → 8ª), descendo por cópias." },
      { id: "sq5", titulo: "Quebrar: uma sequência real que sai do tom", modo: "quebrar", perfil: { ...SEQ, intervalo_melodico_aumentado_diminuto: "info" }, nivel: 6, contexto: { nivel: 6, plano: {}, ...sq([2, 6], 1, true) },
        cifras: "I V7/vi V7/ii V7/V V7 I".split(" "),
        instrucoes: "<p>Sol maior. O baixo e as cifras encadeiam dominantes (si7 → mi7, lá7 → ré7) antes do I. <b>A quebra:</b> a cópia tem de ser real — exata, semitom por semitom —, o que obriga a melodia a um semitom cromático que a sequência diatônica evitaria. Escreva a melodia com a 7ª de cada dominante do modelo e da cópia descendo um grau.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/2 B2 E3 A2 D3 G2", duracao: 2, alvoCompassos: 3,
        solucao: "tom: G maior\ncf: baixo\nsoprano: G5/2 A5 G#5 G5 F#5 G5\nbaixo: G2/2 B2 E3 A2 D3 G2",
        comentarioSolucao: "Lá5 (7ª de si7) desce a sol♯5, a 3ª de mi7; sol5 (7ª de lá7) desce a fá♯5, a 3ª de ré7. Entre os dois elos, sol♯5 → sol5: a 'sensível' de lá é abandonada cromaticamente, e é esse semitom que faz a cópia sair da escala e voltar ao tom pela dominante." },
    ],
  }, { antesDe: "esquemas" });
})(this);
