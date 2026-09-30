/* Desenho da partitura em SVG, usado pela oficina (index.html) e pelas aulas (curso.html).
 *
 *   const layout = Partitura.desenhar(elemento, ex, opcoes)
 *
 * ex é um exercício do Motor. opcoes (todas opcionais):
 *   fins        até onde cada voz foi escrita, em ticks (pausas finais contam)
 *   extraFim    reserva espaço até esse tempo (para o cursor de escrita)
 *   marcas      [{ notas, sev: "erro"|"aviso"|"info"|"ok"|"foco", compasso }] colore notas e compassos
 *   foco        uma das marcas, destacada com halo e faixa no compasso
 *   selecao     { voz, t, cursor: bool } nota selecionada (t) ou cursor de escrita
 *   rotulos     nome mostrado para cada voz; ativa: índice da voz em destaque
 *   largura     largura disponível (padrão: a do elemento)
 *   compacta    menos margem, para exemplos pequenos nas aulas
 *   cifras      [{ t, texto }] rótulos acima da pauta de cima (acordes)
 *   anotacoes   [{ nota, texto, sev }] rótulos embaixo de uma nota (intervalos, graus)
 */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"));
  else raiz.Partitura = fabrica(raiz.Motor);
})(this, function (M) {
  "use strict";

  const T = M.T;
  const S = 8, ALT_PAUTA = 4 * S, MARGEM_SUP = 34, MARGEM_INF = 26, FAIXA = MARGEM_SUP + ALT_PAUTA + MARGEM_INF, ESQ = 50;
  const DURS = [16, 12, 8, 6, 4, 3, 2, 1].map((x) => (x * T) / 4);
  const BASE_CLAVE = { sol: 2 + 7 * 4, fa: 4 + 7 * 2 };
  const PESO = { erro: 3, aviso: 2, info: 1, ok: 0, foco: 4 };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const passo = (alt, clave) => alt.letra + 7 * alt.oitava - BASE_CLAVE[clave];

  function partir(dur) {
    const r = [];
    let resto = dur;
    while (resto > 0) { const d = DURS.find((x) => x <= resto) || resto; r.push(d); resto -= d; }
    return r;
  }

  function segmentos(voz, C, fimEscrito) {
    const segs = [];
    let t = 0;
    const pedacos = (inicio, dur, nota) => {
      let a = inicio;
      const fimP = inicio + dur;
      while (a < fimP) {
        const b = Math.min(fimP, (Math.floor(a / C) + 1) * C);
        for (const d of partir(b - a)) { segs.push({ nota, inicio: a, dur: d }); a += d; }
      }
    };
    for (const n of voz.notas) {
      if (n.inicio > t) pedacos(t, n.inicio - t, null);
      pedacos(n.inicio, n.duracao, n);
      t = n.fim;
    }
    if (fimEscrito > t) pedacos(t, fimEscrito - t, null);
    for (const s of segs) if (!s.nota && s.inicio % C === 0 && s.dur === C) s.cheia = true;
    return segs;
  }

  function claveDe(voz) {
    if (!voz.notas.length) return null;
    const ps = voz.notas.map((n) => n.ps).sort((a, b) => a - b);
    return ps[Math.floor(ps.length / 2)] >= 59 ? "sol" : "fa";
  }

  function pausa(saida, x, yTopo, q) {
    if (q >= 4) { saida.push(`<rect class="tinta" x="${x - 1}" y="${yTopo + S}" width="10" height="${S / 2}"/>`); return; }
    if (q >= 2) { saida.push(`<rect class="tinta" x="${x - 5}" y="${yTopo + 1.5 * S}" width="10" height="${S / 2}"/>`); return; }
    saida.push(`<text class="glifo" x="${x - 5}" y="${yTopo + 2.6 * S}" font-size="${3.6 * S}">${q >= 1 ? "𝄽" : q >= 0.5 ? "𝄾" : "𝄿"}</text>`);
  }

  function desenhar(caixa, ex, o = {}) {
    const largura = Math.max(260, o.largura || caixa.clientWidth || 600);
    const C = ex.duracaoCompasso;
    const fins = o.fins || ex.vozes.map((v) => (v.notas.length ? v.notas[v.notas.length - 1].fim : 0));
    const fim = Math.max(ex.fim, ...fins, o.extraFim || 0, C);
    const nCompassos = Math.ceil(fim / C);
    const claves = ex.vozes.map(claveDe);
    const ultima = ex.vozes.length - 1;
    claves.forEach((c, i) => { if (!c) claves[i] = i === ultima && ultima > 0 ? "fa" : "sol"; });
    const vozes = ex.vozes.map((v, i) => ({ voz: v, clave: claves[i], segs: segmentos(v, C, fins[i] || 0) }));

    // acidentes: sempre que a nota é alterada; bequadro quando cancela uma alteração no compasso
    for (const V of vozes) {
      let comp = -1, vistos = {};
      for (const s of V.segs) {
        if (!s.nota) continue;
        const c = Math.floor(s.inicio / C);
        if (c !== comp) { comp = c; vistos = {}; }
        const chave = s.nota.altura.letra + 7 * s.nota.altura.oitava, alt = s.nota.altura.alter;
        if (s.inicio !== s.nota.inicio) { s.acid = null; vistos[chave] = alt; continue; }
        s.acid = alt !== 0 && vistos[chave] !== alt ? alt : alt === 0 && vistos[chave] !== undefined && vistos[chave] !== 0 ? 0 : null;
        vistos[chave] = alt;
      }
    }

    // colunas: cada ataque, de qualquer voz, ganha uma posição horizontal comum
    const PXQ = o.compacta ? 13 : 15, MINW = 24;
    const compassos = [];
    for (let c = 0; c < nCompassos; c++) {
      const ini = c * C, fimC = ini + C;
      const ts = new Set(), comAcid = new Set();
      for (const V of vozes) for (const s of V.segs) if (s.inicio >= ini && s.inicio < fimC) { ts.add(s.inicio); if (s.acid !== null && s.acid !== undefined) comAcid.add(s.inicio); }
      const lista = [...ts].sort((a, b) => a - b);
      const cols = lista.map((t, k) => {
        const prox = k + 1 < lista.length ? lista[k + 1] : fimC;
        return { t, w: Math.max(MINW, ((prox - t) / T) * PXQ) + (comAcid.has(t) ? 9 : 0), acid: comAcid.has(t) };
      });
      compassos.push({ cols, larg: Math.max(64, 10 + cols.reduce((a, x) => a + x.w, 0) + 4), ini });
    }
    const sistemas = [];
    let atual = null;
    for (let c = 0; c < nCompassos; c++) {
      if (!atual || atual.larg + compassos[c].larg > largura - ESQ - 2) { atual = { compassos: [], larg: 0 }; sistemas.push(atual); }
      atual.compassos.push(c);
      atual.larg += compassos[c].larg;
    }
    const altSistema = vozes.length * FAIXA, GAP = 14;
    sistemas.forEach((sis, k) => {
      sis.y = k * (altSistema + GAP);
      let fator = (largura - ESQ - 2) / sis.larg;
      if (k === sistemas.length - 1) fator = Math.min(fator, 1.35);
      fator = Math.max(1, fator);
      let x = ESQ;
      for (const c of sis.compassos) {
        const m = compassos[c];
        m.sistema = k; m.x0 = x;
        let cx = x + 10 * fator;
        for (const col of m.cols) { col.x = cx + (col.acid ? 9 : 0) + 6; cx += col.w * fator; }
        m.x1 = x + m.larg * fator;
        x = m.x1;
      }
      sis.x1 = x;
    });
    const alturaTotal = sistemas.length * (altSistema + GAP) - GAP + 4;
    const larguraTotal = Math.max(o.compacta ? 0 : largura, ...sistemas.map((s) => s.x1 + 2));

    const xDoTempo = (t) => {
      const c = Math.min(nCompassos - 1, Math.floor(t / C));
      const m = compassos[c];
      if (t >= (c + 1) * C) return m.x1 - 7;
      const exato = m.cols.find((x) => x.t === t);
      if (exato) return exato.x;
      let a = { t: m.ini, x: m.x0 + 16 }, b = { t: m.ini + C, x: m.x1 - 7 };
      for (const col of m.cols) { if (col.t < t) a = col; else { b = col; break; } }
      return a.x + ((t - a.t) / (b.t - a.t)) * (b.x - a.x);
    };

    const marcas = o.marcas || [];
    const cor = new Map();
    for (const a of marcas) for (const n of a.notas || []) if (!cor.has(n) || PESO[a.sev] > PESO[cor.get(n)]) cor.set(n, a.sev);
    const foco = o.foco || null;
    const notasFoco = new Set(foco ? foco.notas || [] : []);
    const pior = {};
    for (const a of marcas) if (a.compasso && a.sev !== "ok" && (!pior[a.compasso] || PESO[a.sev] > PESO[pior[a.compasso]])) pior[a.compasso] = a.sev;

    const fundo = [], corpo = [], topo = [], cabecas = [];
    const L0 = { sistemas };
    compassos.forEach((m, c) => {
      const sis = sistemas[m.sistema];
      if (foco && foco.compasso === c + 1) fundo.push(`<rect class="faixa sev-${foco.sev}" x="${m.x0}" y="${sis.y + 6}" width="${m.x1 - m.x0}" height="${altSistema - 10}" rx="4"/>`);
      if (pior[c + 1]) fundo.push(`<rect class="risco sev-${pior[c + 1]}" x="${m.x0 + 3}" y="${sis.y + altSistema - 7}" width="${m.x1 - m.x0 - 6}" height="3" rx="1.5"/>`);
    });

    const rotulos = o.rotulos || ex.vozes.map((v) => v.nome);
    sistemas.forEach((sis, k) => {
      vozes.forEach((V, vi) => {
        const yTopo = sis.y + vi * FAIXA + MARGEM_SUP;
        for (let l = 0; l < 5; l++) corpo.push(`<line class="pauta-linha" x1="${ESQ - 40}" x2="${sis.x1}" y1="${yTopo + l * S}" y2="${yTopo + l * S}"/>`);
        corpo.push(V.clave === "sol"
          ? `<text class="glifo" x="${ESQ - 38}" y="${yTopo + 3 * S}" font-size="${4.6 * S}">𝄞</text>`
          : `<text class="glifo" x="${ESQ - 38}" y="${yTopo + S}" font-size="${4.1 * S}">𝄢</text>`);
        if (k === 0 && rotulos[vi]) corpo.push(`<text class="nome-voz${vi === o.ativa ? " ativa" : ""}" x="${ESQ - 40}" y="${yTopo - 19}">${esc(rotulos[vi])}</text>`);
        for (const c of sis.compassos) {
          const m = compassos[c], final = c === nCompassos - 1;
          corpo.push(`<line class="barra${final ? " barra-final" : ""}" x1="${m.x1 - (final ? 4 : 0)}" x2="${m.x1 - (final ? 4 : 0)}" y1="${yTopo}" y2="${yTopo + ALT_PAUTA}"/>`);
          if (final) corpo.push(`<rect class="tinta" x="${m.x1 - 2.5}" y="${yTopo}" width="3" height="${ALT_PAUTA}"/>`);
        }
      });
      if (vozes.length > 1) corpo.push(`<line class="barra" x1="${ESQ - 40}" x2="${ESQ - 40}" y1="${sis.y + MARGEM_SUP}" y2="${sis.y + (vozes.length - 1) * FAIXA + MARGEM_SUP + ALT_PAUTA}"/>`);
      if (k > 0) corpo.push(`<text class="num-compasso" x="${ESQ + 2}" y="${sis.y + MARGEM_SUP - 16}">${sis.compassos[0] + 1}</text>`);
    });

    if (o.selecao && vozes[o.selecao.voz]) {
      const { voz, t, cursor } = o.selecao;
      const c = Math.min(nCompassos - 1, Math.floor(t / C));
      const sis = sistemas[compassos[c].sistema];
      const yTopo = sis.y + voz * FAIXA + MARGEM_SUP;
      const x = xDoTempo(t);
      if (!cursor) fundo.push(`<rect class="selecao" x="${x - 12}" y="${yTopo - 12}" width="24" height="${ALT_PAUTA + 24}" rx="6"/>`);
      else {
        topo.push(`<line class="caret" x1="${x}" x2="${x}" y1="${yTopo - 8}" y2="${yTopo + ALT_PAUTA + 8}"/>`);
        topo.push(`<path class="caret-alvo" d="M${x - 5} ${yTopo - 14} h10 l-5 6 z"/>`);
      }
    }

    vozes.forEach((V, vi) => {
      let anterior = null;
      for (const s of V.segs) {
        const c = Math.floor(s.inicio / C), m = compassos[c], sis = sistemas[m.sistema];
        const yTopo = sis.y + vi * FAIXA + MARGEM_SUP, yBase = yTopo + ALT_PAUTA;
        const x = m.cols.find((col) => col.t === s.inicio).x;
        const q = s.dur / T;
        if (!s.nota) { pausa(corpo, s.cheia ? (m.x0 + m.x1) / 2 - 4 : x, yTopo, s.cheia ? 4 : q); anterior = null; continue; }
        const p = passo(s.nota.altura, V.clave), y = yBase - p * (S / 2);
        const sev = cor.get(s.nota), g = [];
        if (notasFoco.has(s.nota)) {
          fundo.push(`<circle class="halo sev-${foco.sev}" cx="${x}" cy="${y}" r="11"/>`);
          topo.push(`<circle class="halo-anel sev-${foco.sev}" cx="${x}" cy="${y}" r="10.5"/>`);
        }
        for (let l = -2; l >= p; l -= 2) g.push(`<line class="suplementar" x1="${x - 8.5}" x2="${x + 8.5}" y1="${yBase - l * (S / 2)}" y2="${yBase - l * (S / 2)}"/>`);
        for (let l = 10; l <= p; l += 2) g.push(`<line class="suplementar" x1="${x - 8.5}" x2="${x + 8.5}" y1="${yBase - l * (S / 2)}" y2="${yBase - l * (S / 2)}"/>`);
        const base = [4, 2, 1, 0.5, 0.25].find((b) => q >= b) || 0.25;
        if (base === 4) g.push(`<ellipse class="contorno" cx="${x}" cy="${y}" rx="6.3" ry="4.2" stroke-width="2.2"/>`);
        else {
          g.push(base >= 2
            ? `<ellipse class="contorno" cx="${x}" cy="${y}" rx="5.2" ry="3.6" transform="rotate(-20 ${x} ${y})"/>`
            : `<ellipse class="tinta" cx="${x}" cy="${y}" rx="5.4" ry="3.9" transform="rotate(-20 ${x} ${y})"/>`);
          const acima = p < 4, hx = acima ? x + 4.9 : x - 4.9, hy = acima ? y - 3.5 * S : y + 3.5 * S;
          g.push(`<line class="haste" x1="${hx}" x2="${hx}" y1="${y + (acima ? -1 : 1)}" y2="${hy}"/>`);
          const band = base === 0.5 ? 1 : base === 0.25 ? 2 : 0;
          for (let f = 0; f < band; f++) {
            const fy = hy + (acima ? f * 7 : -f * 7);
            g.push(acima ? `<path class="tinta" d="M${hx} ${fy} c 1 5 8 7 6 14 c 0 -5 -3 -8 -6 -9 z"/>` : `<path class="tinta" d="M${hx} ${fy} c 1 -5 8 -7 6 -14 c 0 5 -3 8 -6 9 z"/>`);
          }
        }
        if (q !== base) g.push(`<circle class="tinta" cx="${x + 10}" cy="${y + (p % 2 === 0 ? -S / 2 : 0)}" r="1.8"/>`);
        if (s.acid !== null && s.acid !== undefined) {
          g.push(`<text class="glifo" x="${x - 17}" y="${y + 4.5}" font-size="17">${{ 0: "♮", 1: "♯", 2: "𝄪", "-1": "♭", "-2": "𝄫" }[s.acid]}</text>`);
        }
        corpo.push(`<g class="${sev ? `marcada sev-${sev}` : ""}">${g.join("")}</g>`);
        cabecas.push({ x, y, nota: s.nota, voz: vi, sistema: m.sistema });
        if (anterior && anterior.nota === s.nota) {
          const abaixo = p < 4, ya = anterior.y + (abaixo ? 6 : -6), yb = y + (abaixo ? 6 : -6);
          corpo.push(anterior.sistema === m.sistema
            ? `<path class="ligadura" d="M${anterior.x + 5} ${ya} Q ${(anterior.x + x) / 2} ${ya + (abaixo ? 7 : -7)} ${x - 5} ${yb}"/>`
            : `<path class="ligadura" d="M${anterior.x + 5} ${ya} q 10 ${abaixo ? 6 : -6} 20 0"/>`);
        }
        anterior = { nota: s.nota, x, y, sistema: m.sistema };
      }
    });

    for (const c of o.cifras || []) {
      const cc = Math.min(nCompassos - 1, Math.floor(c.t / C));
      const sis = sistemas[compassos[cc].sistema];
      topo.push(`<text class="cifra" x="${xDoTempo(c.t) - 4}" y="${sis.y + MARGEM_SUP - 10}">${esc(c.texto)}</text>`);
    }
    for (const an of o.anotacoes || []) {
      const cab = cabecas.find((x) => x.nota === an.nota);
      if (!cab) continue;
      const yBase = L0.sistemas[cab.sistema].y + cab.voz * FAIXA + MARGEM_SUP + ALT_PAUTA;
      topo.push(`<text class="anotacao${an.sev ? " sev-" + an.sev : ""}" x="${cab.x}" y="${Math.max(yBase + 15, cab.y + 18)}" text-anchor="middle">${esc(an.texto)}</text>`);
    }

    caixa.innerHTML = `<svg width="${larguraTotal}" height="${alturaTotal}" viewBox="0 0 ${larguraTotal} ${alturaTotal}" role="img" aria-label="${esc(o.descricao || "Partitura")}">
      <g>${fundo.join("")}</g><g>${corpo.join("")}</g><g>${topo.join("")}</g><line class="cursor" x1="0" x2="0" y1="0" y2="0" visibility="hidden"/></svg>`;
    return { compassos, sistemas, altSistema, cabecas, C, nCompassos, xDoTempo, FAIXA, MARGEM_SUP, MARGEM_INF, svg: caixa.querySelector("svg") };
  }

  // cursor de reprodução
  function moverCursor(L, t) {
    const cur = L && L.svg && L.svg.querySelector(".cursor");
    if (!cur) return;
    if (t === null) { cur.setAttribute("visibility", "hidden"); return; }
    const m = L.compassos[Math.min(L.nCompassos - 1, Math.floor(t / L.C))];
    let x = m.x1;
    for (let k = 0; k < m.cols.length; k++) {
      const a = m.cols[k], prox = m.cols[k + 1];
      const tFim = prox ? prox.t : m.ini + L.C, xFim = prox ? prox.x : m.x1 - 4;
      if (t >= a.t && t < tFim) { x = a.x + ((t - a.t) / (tFim - a.t)) * (xFim - a.x); break; }
    }
    const sis = L.sistemas[m.sistema];
    cur.setAttribute("x1", x); cur.setAttribute("x2", x);
    cur.setAttribute("y1", sis.y + MARGEM_SUP - 8); cur.setAttribute("y2", sis.y + L.altSistema - MARGEM_INF + 8);
    cur.setAttribute("visibility", "visible");
  }

  // ponto tocado → { sistema, voz, compasso, nota mais próxima }
  function localizar(L, px, py, raio = 16) {
    const sistema = L.sistemas.findIndex((s) => py >= s.y && py < s.y + L.altSistema);
    if (sistema < 0) return null;
    const voz = Math.floor((py - L.sistemas[sistema].y) / FAIXA);
    let perto = null, dist = raio;
    for (const c of L.cabecas) { const d = Math.hypot(c.x - px, c.y - py); if (d < dist) { dist = d; perto = c; } }
    const compasso = L.compassos.find((m) => m.sistema === sistema && px >= m.x0 && px < m.x1) || L.compassos.filter((m) => m.sistema === sistema).pop();
    return { sistema, voz, compasso, perto };
  }

  return { desenhar, moverCursor, localizar, FAIXA, S };
});
