/* Perguntas de múltipla escolha sobre o que o aluno acabou de compor: obrigam a reler a própria
 * partitura com os olhos do estilo (clímax, consonâncias, movimento, inversões, ritmo harmônico).
 * As respostas são calculadas da partitura aprovada.
 *
 *   Questoes.depois(ex, { cf, cifras }) → [{ p, o: [texto], certas: [índices], e }]
 */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"), require("./regras3.js"));
  else raiz.Questoes = fabrica(raiz.Motor, raiz.Regras3);
})(this, function (M, R3) {
  "use strict";
  const F = M.ferramentas;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  // opções numéricas: a certa e vizinhas plausíveis, em ordem crescente
  function vizinhos(certo, min, max) {
    const s = new Set([certo]);
    for (const d of [1, -1, 2, -2, 3, 4]) { if (s.size >= 4) break; const v = certo + d; if (v >= min && v <= max) s.add(v); }
    return [...s].sort((a, b) => a - b);
  }

  function climax(ex, i) {
    const v = ex.vozes[i];
    const topo = Math.max(...v.notas.map((n) => n.ps));
    const comps = [...new Set(v.notas.filter((n) => n.ps === topo).map((n) => ex.compassoDe(n.inicio)))];
    const nComp = ex.compassoDe(v.notas[v.notas.length - 1].inicio);
    const nome = v.notas.find((n) => n.ps === topo).nome;
    const varios = "Em mais de um compasso";
    let o, certa;
    if (comps.length > 1) {
      o = vizinhos(Math.min(nComp, Math.max(1, Math.round(nComp * 0.6))), 1, nComp).slice(0, 3).map((c) => `Compasso ${c}`).concat(varios);
      certa = 3;
    } else {
      const nums = vizinhos(comps[0], 1, nComp).slice(0, 3);
      o = nums.map((c) => `Compasso ${c}`).concat(varios);
      certa = nums.indexOf(comps[0]);
    }
    const pos = comps.length === 1 ? Math.round(((comps[0] - 0.5) / nComp) * 100) : null;
    const julg = comps.length > 1 ? "Repetido, ele perde força de ponto culminante: o ouvinte não sabe qual é o alvo da linha."
      : pos < 35 ? "Muito cedo: o resto da linha só desce, e a tensão se gasta antes da cadência."
        : pos > 85 ? "Quase no fim: sobra pouco espaço para a linha resolver a tensão antes da cadência."
          : "Boa posição: há tempo para preparar a subida e para resolver a descida até a cadência.";
    return {
      p: `Em que compasso está o ponto mais agudo (${nome}) da sua voz "${v.nome}"?`, o, certas: [certa],
      e: `${comps.length > 1 ? `O ${nome} aparece nos compassos ${comps.join(", ")}.` : `No compasso ${comps[0]}, a cerca de ${pos}% da frase.`} ${julg}`,
    };
  }

  function perfeitasNoMeio(ex, i, j) {
    const C = ex.duracaoCompasso;
    const ms = F.momentos(ex, Math.min(i, j), Math.max(i, j)).filter((m) => m.completo && m.t % C === 0);
    const meio = ms.filter((m) => m.t > 0 && m.t < ms[ms.length - 1].t);
    const n = meio.filter((m) => F.classePerfeita(F.harmonico(m.sup, m.inf))).length;
    const faixas = ["Nenhuma", "Uma", "Duas ou três", "Quatro ou mais"];
    const k = n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3;
    return {
      p: "Entre o primeiro e o último compasso, quantas 5ªs ou 8ªs você formou nos tempos fortes?", o: faixas, certas: [k],
      e: `${n} de ${meio.length} tempos fortes do meio são consonâncias perfeitas. ${n <= 1 ? "O tecido é de 3ªs e 6ªs: as perfeitas ficam como pontos de chegada, e a 8ª final soa como conclusão." : n <= 3 ? "Aceitável; confira se cada uma marca uma articulação (um ponto de chegada) e não cai no meio de um gesto." : "Muitas: cada 5ª ou 8ª soa como uma pequena cadência, e a linha perde direção. Troque algumas por 3ªs ou 6ªs."}`,
    };
  }

  function movimento(ex, i, j, tonal = false) {
    const a = Math.min(i, j), b = Math.max(i, j);
    const suc = F.sucessoes(ex, a, b).filter(([, y]) => y.atacaSup || y.atacaInf);
    const c = { contrário: 0, oblíquo: 0, direto: 0, paralelo: 0 };
    for (const [x, y] of suc) {
      const ds = F.direcao(x.sup, y.sup), di = F.direcao(x.inf, y.inf);
      if (ds === 0 || di === 0) c.oblíquo++;
      else if (ds !== di) c.contrário++;
      else if (F.harmonico(x.sup, x.inf).simples === F.harmonico(y.sup, y.inf).simples) c.paralelo++;
      else c.direto++;
    }
    const nomes = Object.keys(c), max = Math.max(...Object.values(c));
    const tot = suc.length;
    return {
      p: `Entre "${ex.vozes[a].nome}" e "${ex.vozes[b].nome}", que tipo de movimento aparece mais?`,
      o: nomes.map((n) => n[0].toUpperCase() + n.slice(1)), certas: nomes.map((n, k) => (c[n] === max ? k : -1)).filter((k) => k >= 0),
      e: `Contrário ${pct(c.contrário, tot)}% · oblíquo ${pct(c.oblíquo, tot)}% · direto ${pct(c.direto, tot)}% · paralelo ${pct(c.paralelo, tot)}%. ${tonal ? (c.contrário >= c.paralelo ? "O contrário predomina: soprano e baixo funcionam como duas linhas, e as chegadas às perfeitas ficam firmes." : "Muito paralelo: 10ªs paralelas são normais em trechos (Prinner, sequências), mas uma frase inteira assim soa como melodia dobrada. Reserve o contrário para as articulações e a cadência.") : c.contrário >= Math.max(c.direto, c.paralelo) ? "O contrário predomina: as vozes têm independência." : "As vozes andam muito na mesma direção; mesmo sem erro, soam como uma voz dobrada. Procure trechos para inverter a direção de uma delas."}`,
    };
  }

  function inversoes(ex, cifras) {
    const lidas = cifras.map((c) => { try { return R3.lerCifra(String(c).split("=").pop().replace(/^[A-Ga-g][#b]?:/, "")); } catch (e) { return null; } }).filter(Boolean);
    const n = lidas.filter((c) => c.membroBaixo > 0).length;
    const nums = vizinhos(n, 0, lidas.length).slice(0, 4);
    const baixo = ex.vozes[ex.vozes.length - 1].notas;
    let graus = 0;
    for (let k = 1; k < baixo.length; k++) if (F.ehGrau(baixo[k - 1], baixo[k])) graus++;
    return {
      p: "Quantos dos seus acordes têm o baixo fora da fundamental (6, 6/4, 6/5, 4/3, 4/2)?", o: nums.map(String), certas: [nums.indexOf(n)],
      e: `${n} de ${lidas.length} acordes invertidos; o baixo anda por grau em ${graus} de ${baixo.length - 1} movimentos. ${n === 0 ? "Só fundamentais: as funções podem estar certas, mas o baixo salta o tempo todo e deixa de ser uma linha." : "As inversões são o que deixa o baixo andar por grau e ter desenho próprio; as fundamentais ficam para as articulações e a cadência."}`,
    };
  }

  function ritmoHarmonico(ex, cifras) {
    const baixo = ex.vozes[ex.vozes.length - 1].notas;
    const C = ex.duracaoCompasso;
    const nComp = Math.ceil(baixo[baixo.length - 1].fim / C);
    if (nComp < 6) return null;
    const meio = Math.floor(nComp / 2);
    const porComp = (de, ate) => baixo.filter((n, k) => cifras[k] && n.inicio >= (de - 1) * C && n.inicio < ate * C).length / (ate - de + 1);
    const a = porComp(1, meio), b = porComp(meio + 1, nComp - 1);
    const o = [`Nos compassos 1–${meio}`, `Nos compassos ${meio + 1}–${nComp - 1}`, "É igual nas duas metades"];
    const certa = Math.abs(a - b) < 0.01 ? 2 : a > b ? 0 : 1;
    return {
      p: "Onde os acordes mudam mais depressa (mais acordes por compasso)?", o, certas: [certa],
      e: `${a.toFixed(1).replace(".", ",")} acordes por compasso em 1–${meio}; ${b.toFixed(1).replace(".", ",")} em ${meio + 1}–${nComp - 1}. ${certa === 1 ? "A aceleração antes da cadência empurra a frase para o fim." : "Sem aceleração na segunda metade, a cadência chega com a mesma energia do começo e fecha menos."}`,
    };
  }

  // uma voz só (cantus firmus): saltos e a nota característica do modo
  function saltos(ex, i) {
    const ns = ex.vozes[i].notas;
    let n = 0;
    for (let k = 1; k < ns.length; k++) if (F.ehSalto(ns[k - 1], ns[k])) n++;
    const faixas = ["Nenhum ou um", "Dois ou três", "Quatro ou cinco", "Seis ou mais"];
    const k = n <= 1 ? 0 : n <= 3 ? 1 : n <= 5 ? 2 : 3;
    return {
      p: "Quantos saltos (intervalos maiores que um grau) a sua linha tem?", o: faixas, certas: [k],
      e: `${n} saltos em ${ns.length - 1} movimentos. ${n <= 1 ? "Quase só graus: cantável, mas pode faltar perfil; um ou dois saltos bem colocados dão relevo." : n <= 4 ? "Equilíbrio típico de cantus firmus: predominância de graus, saltos como acontecimentos." : "Muitos saltos para uma linha vocal: ela tende a soar como arpejo."}`,
    };
  }
  const CARACTERISTICA = { dorian: [6, "a 6ª maior"], phrygian: [2, "a 2ª menor"], lydian: [4, "a 4ª aumentada"], mixolydian: [7, "a 7ª menor"], aeolian: [6, "a 6ª menor"] };
  function caracteristica(ex, i) {
    const t = ex.tonalidade;
    if (!t || !CARACTERISTICA[t.modo]) return null;
    const [grau, nome] = CARACTERISTICA[t.modo];
    const ns = ex.vozes[i].notas;
    const alvo = M.transpor(t.tonica, grau - 1, ({ dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10] })[t.modo][grau - 1]);
    const n = ns.filter((x) => x.altura.nome === alvo.nome).length;
    const nomeNota = alvo.nome.replace(/-/g, "b");
    const nums = vizinhos(n, 0, ns.length).slice(0, 4);
    return {
      p: `A nota característica deste modo é ${nome} (${nomeNota}). Quantas vezes ela aparece na sua linha?`, o: nums.map(String), certas: [nums.indexOf(n)],
      e: `${n === 0 ? `Nenhuma: sem o ${nomeNota}, a linha não soa ${M.MODOS_PT[t.modo]} — poderia ser outro modo com a mesma final.` : `${n} vez(es). É essa nota que diferencia o modo dos vizinhos; ela soa mais quando aparece num ponto de destaque (clímax, nota longa, começo de um gesto).`}`,
    };
  }

  function depois(ex, { cf = -1, cifras = null } = {}) {
    if (ex.vozes.filter((v) => v.notas.length > 1).length === 1) {
      const i = ex.vozes.findIndex((v) => v.notas.length > 1);
      return [climax(ex, i), saltos(ex, i), caracteristica(ex, i)].filter((q) => q && q.certas.length && q.certas.every((k) => k >= 0 && k < q.o.length));
    }
    const vozes = ex.vozes.map((v, i) => i).filter((i) => ex.vozes[i].notas.length > 1);
    const minhas = vozes.filter((i) => i !== cf);
    if (!minhas.length) return [];
    const qs = [];
    if (cifras && cifras.length && ex.vozes.length >= 2) {
      // harmonia tonal: clímax só da melodia; ritmo harmônico e inversões do baixo
      const baixo = ex.vozes.length - 1;
      if (minhas.includes(0)) qs.push(climax(ex, 0));
      qs.push(ritmoHarmonico(ex, cifras));
      qs.push(inversoes(ex, cifras));
      if (qs.filter(Boolean).length < 3) qs.push(movimento(ex, 0, baixo, true));
    } else {
      qs.push(climax(ex, minhas[0]));
      const outra = cf >= 0 ? cf : vozes.find((i) => i !== minhas[0]);
      if (outra !== undefined) { qs.push(perfeitasNoMeio(ex, minhas[0], outra)); qs.push(movimento(ex, minhas[0], outra)); }
    }
    return qs.filter((q) => q && q.certas.length && q.certas.every((k) => k >= 0 && k < q.o.length)).slice(0, 3);
  }

  return { depois };
});
