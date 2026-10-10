/* Nível 3 · Forma: motivo e variação, expansão da frase, binária/ternária/minueto, tema e variações.
 * Fontes: Schoenberg, Fundamentals of Musical Composition (caps. III, XIII–XVII); Koch, Versuch (vol. 3);
 * Riepel, Anfangsgründe (via Eckert, MTO 11.2); Caplin, Classical Form; Schmalfeldt (1992); Rothstein,
 * Phrase Rhythm in Tonal Music; Open Music Theory 2e (3.2–3.7). Melodias: compostas para o livro (não são citações). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL, MELODIA, PLANO_FRASE } = T.perfis;
  const F = M.ferramentas;

  // ------------------------------------------------------------ utilidades

  // cifras de exemplo: "I V65 IV6 V" (uma por nota do baixo) → [[tempo, cifra]]
  function cif(partitura, cifras) {
    const ex = M.lerTexto(partitura);
    const b = ex.vozes[ex.vozes.length - 1].notas;
    const lista = cifras.trim().split(/\s+/);
    if (lista.length !== b.length) throw new Error(`forma.js: ${lista.length} cifras para ${b.length} notas do baixo em "${partitura.slice(0, 60)}…"`);
    return b.map((n, i) => [n.inicio / M.T, lista[i]]);
  }
  // exemplo com cifras: { rotulo/titulo, partitura, cifras }
  const exc = (partitura, cifras, resto = {}) => ({ partitura, cifras: cif(partitura, cifras), ...resto });

  // ------------------------------------------------------------ regras do capítulo (prefixo frm_)

  const vozAlvo = (ex, ctx) => (ctx.alvo !== undefined ? ctx.alvo : ex.vozes.findIndex((_, i) => i !== ex.cantusFirmus));
  const doCompasso = (ex, v, c) => v.notas.filter((n) => n.inicio >= (c - 1) * ex.duracaoCompasso && n.inicio < c * ex.duracaoCompasso);
  // intervalo diatônico com sinal: +3 = 3ª acima, -2 = 2ª abaixo, 0 = nota repetida
  const passo = (a, b) => {
    const d = b.altura.letra + 7 * b.altura.oitava - (a.altura.letra + 7 * a.altura.oitava);
    return d === 0 ? 0 : Math.sign(d) * (Math.abs(d) + 1);
  };
  const tracos = (ex, ns, base = 0) => ({
    ritmo: ns.map((n) => `${(n.inicio - base) / M.T}:${n.duracao / M.T}`).join(" "),
    duracoes: ns.map((n) => n.duracao),
    inicios: ns.map((n) => n.inicio - base),
    intervalos: ns.slice(1).map((n, k) => passo(ns[k], n)),
    contorno: ns.slice(1).map((n, k) => Math.sign(passo(ns[k], n))).join(" "),
    altura: ns.length ? ns[0].ps : null,
  });
  const NOMES = { ritmo: "o ritmo", intervalos: "os intervalos", contorno: "o contorno", altura: "a nota inicial" };
  const completo = (ex, ns, c, n = 1) => ns.length && ns[ns.length - 1].fim >= (c + n - 1) * ex.duracaoCompasso;

  function igual(a, b, traco) {
    if (traco === "intervalos") return a.intervalos.join(" ") === b.intervalos.join(" ");
    return a[traco] === b[traco];
  }

  /* ctx.motivo = { de: 1, variar: [{ em: 2, manter: ["ritmo", "contorno"], mudar: ["intervalos"] }] } */
  M.definirRegra("frm_variacao", "Variar uns traços, manter outros",
    "Num compasso pedido, a variação mantém os traços indicados do motivo (ritmo, contorno, intervalos) e muda os outros indicados — a definição de Schoenberg: repetição em que alguns traços mudam e os demais se preservam.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      const mt = ctx.motivo;
      if (!v || !mt || !mt.variar) return;
      const C = ex.duracaoCompasso;
      const base = tracos(ex, doCompasso(ex, v, mt.de), (mt.de - 1) * C);
      if (!base.ritmo) return;
      for (const pedido of mt.variar) {
        const c = pedido.em;
        const ns = doCompasso(ex, v, c);
        if (!completo(ex, ns, c)) continue;
        const s = tracos(ex, ns, (c - 1) * C);
        for (const t of pedido.manter || []) {
          if (!igual(base, s, t)) { yield [c, `${v.nome}: o compasso ${c} devia manter ${NOMES[t]} do motivo (compasso ${mt.de})`, ns]; break; }
        }
        for (const t of pedido.mudar || []) {
          if (igual(base, s, t)) { yield [c, `${v.nome}: o compasso ${c} devia mudar ${NOMES[t]} do motivo (compasso ${mt.de}); por enquanto é igual`, ns]; break; }
        }
      }
    }, {
      porque: "Sem traços preservados não se reconhece o motivo (Schoenberg: mudar tudo dá algo 'estranho, incoerente'); sem traços mudados, é só repetição. A arte está em escolher o que fica.",
      corrigir: "Compare com o compasso do motivo: ritmo = mesmas durações nas mesmas posições; contorno = mesma sequência de sobe/desce; intervalos = mesmos passos (3ª acima, 2ª abaixo…). Mude só o que o exercício pede.",
    });

  /* ctx.motivo = { de: 1, inversao: [3], aumentacao: [5] }
   * inversão (tonal): mesmo ritmo, cada intervalo troca de direção e mantém o tamanho (admite ajustar um grau para caber no acorde)
   * aumentação: a partir do compasso indicado, o motivo com as durações dobradas (dois compassos), mesmo desenho */
  M.definirRegra("frm_transformacao", "Inversão e aumentação do motivo",
    "Nos compassos pedidos o motivo aparece invertido (mesmo ritmo, intervalos espelhados: o que subia desce) ou aumentado (durações dobradas, mesmo desenho). Na versão tonal, um intervalo pode crescer ou encolher um grau para caber na harmonia.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      const mt = ctx.motivo;
      if (!v || !mt || (!mt.inversao && !mt.aumentacao)) return;
      const C = ex.duracaoCompasso;
      const base = tracos(ex, doCompasso(ex, v, mt.de), (mt.de - 1) * C);
      if (!base.ritmo) return;
      const perto = (a, b) => a.length === b.length && a.every((x, k) => Math.sign(x) === Math.sign(b[k]) && Math.abs(Math.abs(x) - Math.abs(b[k])) <= 1);
      for (const c of mt.inversao || []) {
        const ns = doCompasso(ex, v, c);
        if (!completo(ex, ns, c)) continue;
        const s = tracos(ex, ns, (c - 1) * C);
        if (s.ritmo !== base.ritmo) yield [c, `${v.nome}: a inversão (compasso ${c}) mantém o ritmo do motivo, e o ritmo mudou`, ns];
        else if (!perto(s.intervalos, base.intervalos.map((x) => -x))) yield [c, `${v.nome}: o compasso ${c} não é a inversão do motivo (intervalos esperados: ${base.intervalos.map((x) => (x > 0 ? "desce " : x < 0 ? "sobe " : "repete ") + Math.abs(x || 1)).join(", ")})`, ns];
      }
      for (const c of mt.aumentacao || []) {
        const ns = v.notas.filter((n) => n.inicio >= (c - 1) * C && n.inicio < (c + 1) * C);
        if (!completo(ex, ns, c, 2)) continue;
        const s = tracos(ex, ns, (c - 1) * C);
        const ritmoOk = s.duracoes.length === base.duracoes.length && s.duracoes.every((d, k) => d === 2 * base.duracoes[k] && s.inicios[k] === 2 * base.inicios[k]);
        if (!ritmoOk) yield [c, `${v.nome}: nos compassos ${c}–${c + 1} as durações deviam ser o dobro das do motivo (${base.duracoes.map((d) => (2 * d) / M.T).join(" ")} semínimas)`, ns];
        else if (!perto(s.intervalos, base.intervalos)) yield [c, `${v.nome}: a aumentação (compassos ${c}–${c + 1}) muda o desenho de intervalos do motivo`, ns];
      }
    }, {
      porque: "Inversão e aumentação são, para Schoenberg, repetições 'exatas' sob outra forma: o ouvinte reconhece o motivo pelo ritmo (na inversão) ou pelo desenho (na aumentação), e a mudança dá direção nova à frase.",
      corrigir: "Inversão: copie o ritmo e espelhe cada passo (3ª acima vira 3ª abaixo). Aumentação: dobre cada duração (colcheia → semínima) e mantenha os passos; o motivo de um compasso ocupa dois.",
    });

  /* ctx.cadencias = [{ c: 4, tipo: "semi" | "perfeita" | "evitada" | "engano" | "aberta", tom: "G maior" }] */
  M.definirRegra("frm_cadencias", "Cadências nos compassos do plano",
    "Cada ponto do plano tem a sua cadência: semicadência (o compasso termina num V em estado fundamental), perfeita (V–I em estado fundamental no tempo forte, tônica na melodia), evitada (o V não vai para o I em estado fundamental), de engano (V → vi/VI) ou aberta (sem V–I: a tônica é prolongada). O tom local pode ser indicado.",
    function* (ex, ctx) {
      if (!ctx.cadencias || !ctx.cifras || !ex.tonalidade) return;
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const mel = ex.vozes[0];
      const C = ex.duracaoCompasso;
      const tomOk = (h, tom) => {
        if (!tom) return true;
        const t = M.interpretarTom(tom);
        return h.tom.tonica.nome === t.tonica.nome && (h.tom.modo === "minor") === (t.modo === "minor");
      };
      const raizV = (h) => h && h.cifra.grau === 5 && h.cifra.membroBaixo === 0 && !h.cifra.secundaria;
      const raizI = (h) => h && h.cifra.grau === 1 && h.cifra.membroBaixo === 0 && !h.cifra.secundaria && !h.cifra.seisQuatro;
      for (const cd of ctx.cadencias) {
        const c = cd.c, t0 = (c - 1) * C, t1 = c * C;
        const nomeTom = cd.tom ? ` em ${cd.tom}` : "";
        if (cd.tipo === "semi") {
          const h = hs.filter((x) => x.inicio < t1).pop();
          if (!h || h.fim < t1) continue;
          if (!(raizV(h) && !h.cifra.setima)) yield [c, `o compasso ${c} devia terminar numa semicadência${nomeTom} (V em estado fundamental, sem 7ª); termina em ${h.texto}`, [h.baixo]];
          else if (!tomOk(h, cd.tom)) yield [c, `a semicadência do compasso ${c} devia estar${nomeTom}`, [h.baixo]];
          continue;
        }
        const k = hs.findIndex((x) => x.inicio <= t0 && t0 < x.fim);
        if (k < 0) continue;
        const h = hs[k], ant = hs[k - 1];
        if (cd.tipo === "perfeita") {
          const m = mel.soandoEm(t0);
          if (!(raizI(h) && raizV(ant) && h.inicio === t0)) yield [c, `no compasso ${c} o plano pede cadência perfeita${nomeTom}: V(7) → I em estado fundamental, com o I no tempo forte (está ${ant ? ant.texto : "?"} → ${h.texto})`, [h.baixo]];
          else if (!tomOk(h, cd.tom)) yield [c, `a cadência do compasso ${c} devia confirmar ${cd.tom}`, [h.baixo]];
          else if (m && m.altura.nome !== h.tom.tonica.nome) yield [c, `cadência perfeita no compasso ${c}: a melodia devia chegar à tônica (${h.tom.tonica.nome}), e está em ${m.nome}`, [m]];
        } else if (cd.tipo === "evitada" || cd.tipo === "engano") {
          if (!raizV(ant) || h.inicio !== t0) yield [c, `no compasso ${c} a cadência evitada precisa de um V(7) em estado fundamental logo antes do tempo forte (está ${ant ? ant.texto : "?"} → ${h.texto})`, [h.baixo]];
          else if (raizI(h)) yield [c, `no compasso ${c} o V resolve no I em estado fundamental: a cadência não foi evitada`, [h.baixo]];
          else if (cd.tipo === "engano" && h.cifra.grau !== 6) yield [c, `no compasso ${c} a cadência de engano vai do V ao vi (ou VI); está ${h.texto}`, [h.baixo]];
        } else if (cd.tipo === "aberta") {
          const fim = hs.filter((x) => x.inicio < t1 && x.fim > t0 - C);
          const cadencia = fim.some((x, i) => i > 0 && raizI(x) && raizV(fim[i - 1]));
          const ult = fim[fim.length - 1];
          if (cadencia) yield [c, `nos compassos ${c - 1}–${c} há um V → I em estado fundamental: o plano pede que a seção termine sem cadência, prolongando a tônica`, []];
          else if (ult && !(ult.cifra.grau === 1 && !ult.cifra.secundaria)) yield [c, `o compasso ${c} devia terminar na tônica (prolongada, sem cadência); termina em ${ult.texto}`, [ult.baixo]];
        }
      }
    }, {
      precisaTom: true,
      porque: "A forma é feita de cadências de força diferente nos lugares certos: é por elas que o ouvinte sabe onde está (Koch chamava esses pontos de 'pontos de repouso' do discurso).",
      corrigir: "Confira as cifras no compasso indicado: semicadência = termina em V; perfeita = V → I no tempo forte, os dois em estado fundamental, com a tônica na melodia; evitada = o V vai para outra coisa (vi, I6, V42/IV…).",
    });
  for (const id of ["frm_cadencias"]) M.OLHA_ADIANTE.add(id);

  const SEM_PLANO = { plano: {}, cadencias: null };
  void SEM_PLANO; void exc; void TONAL; void MELODIA; void PLANO_FRASE; void F;
})(this);
