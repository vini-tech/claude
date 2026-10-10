/* Busca soluções de contraponto (1ª a 3ª espécie) com o próprio verificador: usado para gerar as
 * versões do professor dos exercícios e para conferir que cada exercício tem solução.
 *   Buscador.contraponto({ texto, voz: "contraponto", especie: 1|2|3, esqueleto?, fixos?, perfil, ctx, filtro?, rng, limite })
 *   Buscador.solucao({ texto, especie, perfil, ctx })   → esqueleto de 1ª espécie + elaboração
 * texto: exercício com a voz do contraponto vazia. Devolve o texto completo ou null. */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"), require("./editor.js"));
  else raiz.Buscador = fabrica(raiz.Motor, raiz.Editor);
})(this, function (M, Ed) {
  "use strict";
  const T = M.T;

  function contraponto({ texto, voz = "contraponto", especie = 1, esqueleto = null, fixos = {}, perfil, ctx = {}, filtro = null, rng = Math.random, limite = 20000, pausaInicial = false }) {
    const modelo = Ed.ler(texto);
    const iv = modelo.vozes.findIndex((v) => v.nome === voz);
    const icf = modelo.vozes.findIndex((v, i) => i !== iv);
    const cf = modelo.vozes[icf].eventos;
    const tom = M.interpretarTom(modelo.cab.tom);
    const acima = iv < icf;
    const n = cf.length;
    const C = cf[0].dur;
    const porCompasso = especie === 1 ? 1 : especie === 2 ? 2 : 4;
    const d = C / porCompasso;
    // alturas candidatas: diatônicas + sensível, numa faixa em volta do cantus
    const esc = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11] }[tom.modo];
    const cands = [];
    for (let g = -14; g <= 21; g++) {
      const o = Math.floor(g / 7), k = ((g % 7) + 7) % 7;
      cands.push(M.transpor(M.altura(tom.tonica.letra, tom.tonica.alter, 4), g, 12 * o + esc[k]));
    }
    const lt = M.transpor(M.altura(tom.tonica.letra, tom.tonica.alter, 4), -1, -1);
    const sensiveis = [-1, 0, 1].map((o) => M.altura(lt.letra, lt.alter, lt.oitava + o)).filter((a) => !cands.some((c) => c.ps === a.ps));
    const cfPs = cf.map((e) => M.lerAltura(e.alt).ps);
    const nomeDe = (a) => a.nome.replace(/-/g, "b") + a.oitava;
    const eventos = [];
    let nos = 0;

    function textoCom(evs) {
      const m = JSON.parse(JSON.stringify(modelo));
      m.vozes[iv].eventos = evs.map((e) => ({ ...e }));
      return Ed.escrever(m);
    }
    function valido(evs, completo) {
      const tx = textoCom(evs);
      let ex;
      try { ex = M.lerTexto(tx); } catch (e) { return false; }
      const r = M.verificarPerfil(ex, perfil, ctx);
      const fins = Ed.ler(tx).vozes.map((v) => Ed.inicios(v).fim);
      const vis = M.concluidos(ex, r, fins);
      if (vis.visiveis.some((a) => a.severidade === "erro")) return false;
      if (completo && (!vis.completo || (filtro && !filtro(ex, r)))) return false;
      return true;
    }
    const emb = (l) => { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

    function busca(c, k) {
      if (++nos > limite) return null;
      if (c === n) return valido(eventos, true) ? textoCom(eventos) : null;
      const ultimo = c === n - 1;
      // na 2ª espécie o penúltimo compasso pode ser uma semibreve (licença cadencial)
      const inteira = ultimo || (especie === 2 && c === n - 2 && esqueleto);
      const slots = fixos[c] ? fixos[c].length : inteira ? 1 : porCompasso;
      if (k === slots) return valido(eventos, false) ? busca(c + 1, 0) : null;
      const dur = fixos[c] ? C / fixos[c].length : inteira ? C : d;
      if (c === 0 && k === 0 && pausaInicial && especie > 1) {
        eventos.push({ alt: null, dur: d, liga: false });
        const r = busca(c, 1);
        if (r) return r;
        eventos.pop();
        return null;
      }
      let lista;
      const base = c >= n - 2 ? cands.concat(sensiveis) : cands; // a sensível só na cadência
      if (fixos[c]) lista = [M.lerAltura(fixos[c][k])];
      else if (esqueleto && k === 0) lista = [M.lerAltura(esqueleto[c])];
      else lista = emb(base.filter((a) => (acima ? a.ps > cfPs[c] - 3 && a.ps <= cfPs[c] + 17 : a.ps < cfPs[c] + 3 && a.ps >= cfPs[c] - 17)));
      const ant = eventos.length ? eventos[eventos.length - 1] : null;
      for (const a of lista) {
        if (ant && ant.alt) {
          const pa = M.lerAltura(ant.alt).ps;
          if (Math.abs(a.ps - pa) > 7 && !esqueleto) continue;
          if (especie === 3 && k > 0 && !fixos[c] && Math.abs(a.ps - pa) > 4) continue; // dentro da célula: grau ou 3ª
        }
        eventos.push({ alt: nomeDe(a), dur, liga: false });
        const r = busca(c, k + 1);
        if (r) return r;
        eventos.pop();
      }
      return null;
    }
    // 4ª espécie: pausa + nota ligada; cada compasso repete no tempo forte a nota fraca anterior.
    // Cadência fixa: a final no tempo forte do penúltimo compasso (7–6 em cima, 2–3 embaixo), depois a sensível.
    function quarta() {
      const h = C / 2;
      const ref = acima ? cfPs[n - 1] + 12 : cfPs[n - 1] - 12;
      const finais = cands.filter((a) => (a.ps - M.lerAltura(cf[n - 1].alt).ps) % 12 === 0).sort((x, y) => Math.abs(x.ps - ref) - Math.abs(y.ps - ref));
      const fin = finais[0];
      const sens = [...cands, ...sensiveis].filter((a) => a.ps === fin.ps - 1)[0] || M.transpor(fin, -1, -1);
      // [pausa, p0~ | p0, p1~ | p1, p2~ | …]: termina na última nota ligada
      const montar = (ps) => {
        const evs = [{ alt: null, dur: h, liga: false }];
        ps.forEach((a, k) => { if (k) evs.push({ alt: nomeDe(ps[k - 1]), dur: h, liga: false }); evs.push({ alt: nomeDe(a), dur: h, liga: true }); });
        return evs;
      };
      const escolhidas = [];
      function passo(k) {
        if (++nos > limite) return null;
        if (k === n - 2) {
          // compasso n-1: final ligada (vinda do compasso anterior) e sensível; depois a final
          if (escolhidas[k - 1].ps !== fin.ps) return null;
          const evs = montar(escolhidas);
          evs.push({ alt: nomeDe(fin), dur: h, liga: false }, { alt: nomeDe(sens), dur: h, liga: false }, { alt: nomeDe(fin), dur: C, liga: false });
          return valido(evs, true) ? textoCom(evs) : null;
        }
        const ant = escolhidas[k - 1];
        let lista = cands.filter((a) => (acima ? a.ps > cfPs[k] - 3 && a.ps <= cfPs[k] + 17 : a.ps < cfPs[k] + 3 && a.ps >= cfPs[k] - 17));
        if (ant) lista = lista.filter((a) => a.ps !== ant.ps && Math.abs(a.ps - ant.ps) <= 7);
        if (k === n - 3) lista = lista.filter((a) => a.ps === fin.ps);
        for (const a of emb(lista)) {
          escolhidas.push(a);
          if (valido(montar(escolhidas), false)) {
            const r = passo(k + 1);
            if (r) return r;
          }
          escolhidas.pop();
        }
        return null;
      }
      return passo(0);
    }

    if (especie === 4) return quarta();
    return busca(0, 0);
  }

  /* Solução completa para um exercício de 1ª a 3ª espécie (a versão do professor dos cantus sorteados).
   * Na 2ª e 3ª espécie compõe primeiro um esqueleto de 1ª espécie e depois o elabora; na 3ª, a célula
   * cadencial é a fórmula clássica (cambiata em cima, 7–5–6–7 embaixo). */
  function solucao({ texto, voz = "contraponto", especie = 1, perfil, ctx = {}, tentativas = 8, maxAvisos = 2 }) {
    const base = texto.replace(new RegExp(`^${voz}:.*$`, "m"), voz + ":");
    const m = Ed.ler(base);
    const iv = m.vozes.findIndex((v) => v.nome === voz);
    const c = { ...ctx, alvo: iv, cf: m.vozes.findIndex((v, i) => i !== iv) };
    const poucos = (ex, r) => r.achados.filter((a) => a.severidade === "aviso").length <= maxAvisos;
    const base1 = base.replace(/^compasso:.*\n/m, "");
    const nome = (a) => a.nome.replace(/-/g, "b") + a.oitava;
    for (let s = 1; s <= tentativas; s++) {
      const rng = rngDe(s * 7919);
      if (especie === 1) { const r = contraponto({ texto: base, voz, especie, perfil, ctx: c, rng, filtro: poucos }); if (r) return r; continue; }
      if (especie === 4) {
        // a 4ª espécie só ensina se tiver retardos de verdade: pelo menos dois tempos fortes dissonantes
        const retardos = (ex) => M.ferramentas.momentos(ex, 0, 1).filter((mo) => mo.completo && ex.ehTempoForte(mo.t) && !M.ferramentas.ehConsonante(M.ferramentas.harmonico(mo.sup, mo.inf), true)).length;
        const r = contraponto({ texto: base, voz, especie, perfil, ctx: c, rng, limite: 8000, filtro: (ex, res) => poucos(ex, res) && retardos(ex) >= 2 });
        if (r) return r;
        continue;
      }
      const esq = contraponto({ texto: base1, voz, especie: 1, perfil: M.perfilDoNivel(1), ctx: { ...c, nivel: 1 }, rng, limite: 5000 });
      if (!esq) continue;
      const esqueleto = Ed.ler(esq).vozes[iv].eventos.map((x) => x.alt);
      const fixos = {};
      if (especie === 3) {
        const n = esqueleto.length, lt = M.lerAltura(esqueleto[n - 2]), seis = M.transpor(lt, -1, -2);
        fixos[n - 2] = (iv < c.cf ? [lt, M.lerAltura(esqueleto[n - 1]), seis, lt] : [lt, M.transpor(lt, -2, -4), seis, lt]).map(nome);
      }
      const r = contraponto({ texto: base, voz, especie, esqueleto, fixos, perfil, ctx: c, rng, limite: 4000, filtro: poucos });
      if (r) return r;
    }
    return null;
  }

  function rngDe(semente) {
    let a = semente >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  return { contraponto, solucao };
});
