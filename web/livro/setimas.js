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
      const base = (s) => String(s || "").replace(/(7|65|43|42|64|6|9)$/, "");
      for (const p of ctx.cifrasPedidas) {
        if (!ctx.cifras.some((c) => c === p || base(c) === p)) yield [ex.compassoDe(ex.fim - 1), `falta usar ${p}`, []];
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

//CAPITULOS
})(this);
