/* Nível 2 · Notas fora do acorde e retardos na harmonia.
 * Fontes: Fux (Gradus, 1725) para a passagem, a bordadura e a ligadura; C. P. E. Bach (Versuch, 1753) para a apojatura;
 * Kirnberger (Die Kunst des reinen Satzes) para a distinção entre dissonância essencial e acidental;
 * Aldwell & Schachter, Kostka & Payne e Piston para a classificação moderna; Schoenberg (Harmonielehre) para a crítica
 * do conceito de "nota estranha à harmonia". Notas: research_notes/O que se ensina em composição/harmonia.md, §3. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL } = T.perfis;
  const F = M.ferramentas;

  // ================================================================== classificação das notas fora do acorde
  /* Para cada nota da voz de cima que não pertence ao acorde cifrado (no ataque, ou quando o baixo muda por
   * baixo dela), devolve { nota, tipo, rotulo, problema? }. Tipos do estilo estrito: passagem, passagem_acentuada,
   * bordadura, bordadura_acentuada, bordadura_incompleta, escapada, antecipacao, apojatura, retardo, retardo_baixo.
   * Licenças (só valem quando ctx.ornLicencas as lista): apojatura_livre (acentuada e sem resolução por grau),
   * retardacao (retardo que resolve subindo), retardo_sem_preparacao, retardo_sem_resolucao.
   * Problemas: solta (não se explica por nenhum tipo), setima (7ª do acorde que não resolve), retardo_fraco. */
  const NOMES = {
    passagem: "nota de passagem", passagem_acentuada: "passagem acentuada", bordadura: "bordadura",
    bordadura_acentuada: "bordadura acentuada", bordadura_incompleta: "bordadura incompleta", escapada: "escapada",
    antecipacao: "antecipação", apojatura: "apojatura", retardo: "retardo", retardo_baixo: "retardo no baixo",
    apojatura_livre: "apojatura livre (sem resolução por grau)", retardacao: "retardo ascendente",
    retardo_sem_preparacao: "retardo sem preparação", retardo_sem_resolucao: "retardo sem resolução",
  };
  const LICENCAS = ["apojatura_livre", "retardacao", "retardo_sem_preparacao", "retardo_sem_resolucao"];
  const passo = (a, b) => { const iv = F.intervalo(a, b); return iv.geral === 2 || (iv.geral === 1 && Math.abs(iv.semitons) === 1); };
  const salto = (a, b) => F.intervalo(a, b).geral >= 3;
  const numIv = (sup, inf) => { const g = F.harmonico(sup, inf).geral, k = ((g - 1) % 7) + 1; return k === 2 ? 9 : k === 1 && g > 1 ? 8 : k; };
  const simples = (sup, inf) => ((F.harmonico(sup, inf).geral - 1) % 7) + 1;

  function classificar(ex, ctx) {
    if (ex._orn && ex._ornCifras === ctx.cifras) return ex._orn;
    const r = [];
    const mel = ex.vozes[0], bai = ex.vozes[ex.vozes.length - 1];
    if (!mel || mel === bai || !ctx.cifras || !ex.tonalidade) return r;
    const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra && h.notas);
    if (!hs.length) return r;
    const hEm = (t) => hs.find((h) => h.inicio <= t && t < h.fim) || null;
    const tem = (h, n) => !!h && h.notas.has(n.altura.nome);
    const forca = (t) => ex.forcaMetrica(t);
    const add = (nota, tipo, extra = {}) => r.push({ nota, tipo, rotulo: NOMES[tipo] || tipo, ...extra });

    for (const n of mel.notas) {
      const ant = mel.anterior(n), prox = mel.seguinte(n);
      const h0 = hEm(n.inicio);
      const hP = prox ? hEm(prox.inicio) : null;
      // ---- a nota atacada fora do acorde
      if (h0 && !tem(h0, n)) {
        const b = bai.soandoEm(n.inicio);
        const bn = b && bai.seguinte(b);
        const hb = bn && hEm(bn.inicio);
        const acc = n.inicio === h0.inicio || forca(n.inicio) >= 2;
        const sIn = ant && passo(ant, n), sOut = prox && passo(n, prox);
        if (b && b.inicio < n.inicio && bn && F.ehGrau(b, bn) && F.direcao(b, bn) < 0 && tem(hb, n) && forca(n.inicio) > forca(b.inicio)) {
          add(n, "retardo_baixo", { iv: `${simples(n, b)}–${simples(n, bn)}` });
        } else if (sIn && sOut && F.direcao(ant, n) === F.direcao(n, prox)) add(n, acc ? "passagem_acentuada" : "passagem");
        else if (sIn && sOut) add(n, acc ? "bordadura_acentuada" : "bordadura");
        else if (!acc && prox && prox.ps === n.ps && hP && hP !== h0 && tem(hP, prox)) add(n, "antecipacao");
        else if (!acc && sIn && prox && salto(n, prox) && F.direcao(ant, n) !== F.direcao(n, prox) && tem(hP, prox)) add(n, "escapada");
        else if (sOut && tem(hP, prox)) add(n, acc ? "apojatura" : "bordadura_incompleta");
        else if (acc) add(n, "apojatura_livre");
        else add(n, "solta", { problema: `${n.nome} está fora de ${h0.texto} e não é passagem, bordadura, escapada, antecipação nem apojatura` });
      }
      // ---- a nota presa quando o baixo muda por baixo dela (retardo)
      for (const h of hs) {
        if (!(h.inicio > n.inicio && h.inicio < n.fim) || tem(h, n)) continue;
        const b = bai.soandoEm(h.inicio);
        if (!tem(h0, n)) { add(n, "retardo_sem_preparacao", { h }); continue; }
        if (forca(h.inicio) <= forca(n.inicio)) { add(n, "retardo_fraco", { h, problema: `${n.nome} fica presa sobre ${h.texto} num tempo mais fraco que a preparação: o retardo precisa cair no tempo forte` }); continue; }
        if (prox && passo(n, prox) && F.direcao(n, prox) < 0 && tem(hEm(prox.inicio), prox)) {
          add(n, "retardo", { h, iv: `${numIv(n, b)}–${numIv(prox, bai.soandoEm(prox.inicio))}` });
          continue;
        }
        if (prox && passo(n, prox) && F.direcao(n, prox) > 0 && tem(hEm(prox.inicio), prox)) { add(n, "retardacao", { h, iv: `${numIv(n, b)}–${numIv(prox, bai.soandoEm(prox.inicio))}` }); continue; }
        // resolução ornamentada: a nota um grau abaixo chega antes de o acorde mudar
        const depois = mel.notas.filter((q) => q.inicio >= n.fim && q.inicio < h.fim);
        const res = depois.find((q) => passo(n, q) && F.direcao(n, q) < 0 && tem(hEm(q.inicio), q));
        if (res) add(n, "retardo", { h, iv: `${numIv(n, b)}–${numIv(res, bai.soandoEm(res.inicio))}`, ornamentada: true });
        else add(n, "retardo_sem_resolucao", { h });
      }
      // ---- a 7ª do acorde (dissonância essencial) resolve descendo por grau quando o acorde muda
      if (h0 && tem(h0, n) && h0.cifra.setima && !h0.pivo && [...h0.notas][3] === n.altura.nome && prox && hP && hP !== h0) {
        const desce = passo(n, prox) && F.direcao(n, prox) < 0;
        const b = bai.soandoEm(n.inicio), bp = bai.soandoEm(prox.inicio);
        const sobe43 = passo(n, prox) && F.direcao(n, prox) > 0 && h0.cifra.membroBaixo === 2 && b && bp && F.ehGrau(b, bp) && F.direcao(b, bp) > 0;
        if (!desce && prox.ps !== n.ps && !sobe43) add(n, "setima", { problema: `${n.nome} é a 7ª de ${h0.texto} e não desce por grau para o acorde seguinte` });
      }
    }
    ex._orn = r; ex._ornCifras = ctx.cifras;
    return r;
  }

  const permitidas = (ctx) => new Set(ctx.ornLicencas || []);
  const EXPLICA_LICENCA = {
    apojatura_livre: "apojatura que não resolve por grau numa nota do acorde (licença romântica)",
    retardacao: "retardo que resolve subindo (licença posterior ao estilo estrito)",
    retardo_sem_preparacao: "nota presa que não era consonante antes (retardo sem preparação)",
    retardo_sem_resolucao: "nota presa que não resolve um grau abaixo",
  };

  M.definirRegra("orn_cifras", "Cifra coerente com o baixo",
    "Cada nota do baixo tem uma cifra reconhecida e é o membro do acorde que a cifra indica (I6: a 3ª no baixo; V43: a 5ª). A melodia pode ter notas fora do acorde: quem as confere é a regra das notas fora do acorde.",
    function* (ex, ctx) {
      for (const h of R3.harmoniasCifradas(ex, ctx)) {
        const c = ex.compassoDe(h.inicio);
        if (!h.texto) { yield [c, `baixo ${h.baixo.nome}: falta a cifra`, [h.baixo]]; continue; }
        if (!h.cifra) { yield [c, `cifra "${h.texto}" não reconhecida (use I, ii6, V43, I64, V7, vii°6…)`, [h.baixo]]; continue; }
        const esperado = R3.membros(h.cifra, h.tom)[h.cifra.membroBaixo];
        const velho = h.pivo ? R3.membros(h.pivo.velho.cifra, h.pivo.velho.tom)[h.pivo.velho.cifra.membroBaixo] : null;
        if (h.baixo.altura.nome !== esperado && h.baixo.altura.nome !== velho) yield [c, `${h.texto} pede ${esperado} no baixo, e o baixo tem ${h.baixo.nome}`, [h.baixo]];
      }
    }, { precisaTom: true,
      porque: "A cifra é a sua leitura da harmonia. Neste capítulo a melodia pode ter notas fora do acorde no ataque do baixo (apojaturas, retardos), por isso a coerência da cifra é conferida só no baixo.",
      corrigir: "Confira qual membro do acorde está no baixo (fundamental = sem número, 3ª = 6, 5ª = 64; com 7ª: 7, 65, 43, 42) e troque a cifra ou a nota." });

  M.definirRegra("orn_notas_fora", "Notas fora do acorde com tratamento",
    "Toda nota da melodia fora do acorde cifrado se explica por um tipo: passagem (grau–grau, mesma direção), bordadura (grau e volta), bordadura incompleta, escapada (grau, salto para o outro lado), antecipação (nota do acorde seguinte, repetida), apojatura (acentuada, resolve por grau), retardo (preparado, preso no tempo forte, resolve um grau abaixo). A 7ª do acorde desce por grau.",
    function* (ex, ctx) {
      const ok = permitidas(ctx);
      for (const c of classificar(ex, ctx)) {
        const comp = ex.compassoDe(c.h ? c.h.inicio : c.nota.inicio);
        if (c.problema) yield [comp, c.problema, [c.nota]];
        else if (LICENCAS.includes(c.tipo) && !ok.has(c.tipo)) yield [comp, `${c.nota.nome}: ${EXPLICA_LICENCA[c.tipo]}; no estilo estrito ela precisa de preparação e resolução por grau`, [c.nota]];
      }
    }, { precisaTom: true,
      porque: "Os tratados aceitam a nota estranha ao acorde porque o ouvido a entende como movimento: ela vem de uma nota do acorde e vai a outra por caminhos conhecidos. Fora desses caminhos, ela soa como nota errada.",
      corrigir: "Leve a nota por grau a uma nota do acorde (no tempo fraco: passagem ou bordadura; no forte: apojatura), ou prenda-a da nota anterior e resolva um grau abaixo (retardo). Escapada: chega por grau e salta na direção contrária. Antecipação: repete a nota do acorde seguinte." });

  M.definirRegra("orn_rotulos", "Classificação das notas fora do acorde",
    "Mostra como o verificador leu cada nota fora do acorde da melodia (informativo).",
    function* (ex, ctx) {
      for (const c of classificar(ex, ctx)) if (!c.problema) yield [ex.compassoDe(c.h ? c.h.inicio : c.nota.inicio), `${c.nota.nome}: ${c.rotulo}${c.iv ? " " + c.iv : ""}${c.ornamentada ? " (resolução ornamentada)" : ""}`, [c.nota]];
    }, { precisaTom: true, porque: "Nomear cada ornamento obriga a ouvir de onde ele vem e para onde vai.", corrigir: "Nada a corrigir: é só a leitura das suas notas." });

  /* ctx.ornMinimos = { apojatura: 1, escapada: 1, retardo: 2, … } */
  M.definirRegra("orn_minimos", "Ornamentos pedidos",
    "O exercício pede um número mínimo de certos tipos de nota fora do acorde (indicados no enunciado).",
    function* (ex, ctx) {
      if (!ctx.ornMinimos) return;
      const cs = classificar(ex, ctx).filter((c) => !c.problema);
      for (const [tipo, n] of Object.entries(ctx.ornMinimos)) {
        const k = cs.filter((c) => c.tipo === tipo).length;
        if (k < n) yield [ex.compassoDe(Math.max(0, ex.fim - 1)), `${k} × ${NOMES[tipo] || tipo}; o exercício pede pelo menos ${n}`, []];
      }
    }, { precisaTom: true,
      porque: "Usar cada ornamento de propósito, no lugar escolhido, é o que o transforma de acidente em vocabulário.",
      corrigir: "Procure o lugar que pede aquele gesto: apojatura no tempo forte, com salto antes e grau depois; escapada saindo por grau e voltando por salto; retardo preparado no tempo fraco, preso no forte, resolvido um grau abaixo." });
  for (const id of ["orn_notas_fora", "orn_rotulos"]) M.OLHA_ADIANTE.add(id);
  M.PRECISA_FIM.add("orn_minimos");

  // perfil base dos dois capítulos: o TONAL, com as regras de dissonância "cegas" (só intervalo contra o baixo)
  // trocadas pela leitura harmônica das notas fora do acorde
  const { cifras_coerentes, dissonancia_aproximacao, dissonancia_resolucao, ...BASE } = TONAL;
  const ORN = { ...BASE, orn_cifras: "erro", orn_notas_fora: "erro", orn_rotulos: "info" };

  raiz.__ORN = { ORN, classificar };
})(this);
