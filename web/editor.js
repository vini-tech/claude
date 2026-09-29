/* Modelo editável do exercício (o que o piano modifica) e conversão para o formato de texto. */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"));
  else raiz.Editor = fabrica(raiz.Motor);
})(this, function (M) {
  "use strict";

  const T = M.T;
  const CABECALHOS = ["titulo", "compasso", "tom", "cf"];
  const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* modelo: { comentarios: [linha], cab: {titulo, compasso, tom, cf}, vozes: [{nome, eventos}] }
   * evento: { alt: "D5" | null (pausa), dur: ticks, liga: bool } */
  function ler(texto) {
    const modelo = { comentarios: [], cab: {}, vozes: [] };
    const porNome = new Map();
    for (const bruta of texto.split(/\r?\n/)) {
      if (/^\s*#/.test(bruta)) { modelo.comentarios.push(bruta.trim()); continue; }
      const linha = bruta.replace(/(^|\s)#.*$/, "").trim();
      if (!linha) continue;
      const dp = linha.indexOf(":");
      if (dp < 0) throw new M.ErroDeLeitura(`esperava 'nome: conteúdo' em "${linha}"`);
      const chave = linha.slice(0, dp).trim(), valor = linha.slice(dp + 1).trim();
      const norm = semAcento(chave.toLowerCase());
      if (CABECALHOS.includes(norm)) { modelo.cab[norm] = valor; continue; }
      let voz = porNome.get(chave);
      if (!voz) { voz = { nome: chave, eventos: [] }; porNome.set(chave, voz); modelo.vozes.push(voz); }
      let dur = voz.eventos.length ? voz.eventos[voz.eventos.length - 1].dur : 4 * T;
      for (let tok of valor.split(/\s+/).filter(Boolean)) {
        const liga = tok.endsWith("~");
        tok = tok.replace(/~+$/, "");
        let alt = tok;
        const barra = tok.indexOf("/");
        if (barra >= 0) {
          alt = tok.slice(0, barra);
          const d = tok.slice(barra + 1);
          const v = /^\d+\/\d+$/.test(d) ? d.split("/").reduce((a, b) => a / b) : parseFloat(d);
          if (!(v > 0)) throw new M.ErroDeLeitura(`${chave}: duração inválida em '${tok}'`);
          dur = Math.round(v * T);
        }
        if (/^[PR]$/i.test(alt)) { voz.eventos.push({ alt: null, dur, liga: false }); continue; }
        M.lerAltura(alt); // valida
        voz.eventos.push({ alt: normalizarAltura(alt), dur, liga });
      }
    }
    return modelo;
  }

  function normalizarAltura(alt) {
    const a = M.lerAltura(alt);
    return a.nome.replace(/-/g, "b") + a.oitava;
  }

  const numero = (ticks) => {
    const v = ticks / T;
    return Number.isInteger(v) ? String(v) : String(+v.toFixed(4));
  };

  function escrever(modelo) {
    const linhas = [...modelo.comentarios];
    for (const c of CABECALHOS) if (modelo.cab[c]) linhas.push(`${c}: ${modelo.cab[c]}`);
    if (linhas.length) linhas.push("");
    const largura = Math.max(0, ...modelo.vozes.map((v) => v.nome.length)) + 2;
    for (const v of modelo.vozes) {
      let dur = null;
      const toks = v.eventos.map((e) => {
        let t = e.alt === null ? "P" : e.alt;
        if (e.dur !== dur) { t += "/" + numero(e.dur); dur = e.dur; }
        if (e.liga && e.alt !== null) t += "~";
        return t;
      });
      linhas.push(`${(v.nome + ":").padEnd(largura)}${toks.join(" ")}`.trimEnd());
    }
    return linhas.join("\n") + "\n";
  }

  function inicios(voz) {
    const r = [];
    let t = 0;
    for (const e of voz.eventos) { r.push(t); t += e.dur; }
    return { inicios: r, fim: t };
  }

  const clonar = (m) => JSON.parse(JSON.stringify(m));

  return { ler, escrever, inicios, clonar, normalizarAltura };
});
