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
