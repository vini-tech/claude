/* Motor do verificador em JavaScript: a mesma lógica de verificador/ (Python), para o navegador.
 * tests/test_web.py compara os dois em todos os exemplos e em exercícios aleatórios. */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica();
  else raiz.Motor = fabrica();
})(this, function () {
  "use strict";

  // durações em "ticks": 960 por semínima, para a aritmética ser exata
  const T = 960;

  // ------------------------------------------------------------ alturas e intervalos

  const LETRAS = "CDEFGAB";
  const PC = [0, 2, 4, 5, 7, 9, 11];

  function altura(letra, alter, oitava) {
    const nome = LETRAS[letra] + (alter > 0 ? "#".repeat(alter) : "-".repeat(-alter));
    return { letra, alter, oitava, ps: 12 * (oitava + 1) + PC[letra] + alter, nome, nomeOitava: nome + oitava };
  }

  function transpor(p, passos, semitons) {
    const bruto = p.letra + passos;
    const letra = ((bruto % 7) + 7) % 7;
    const oitava = p.oitava + Math.floor(bruto / 7);
    const alvo = p.ps + semitons;
    const natural = 12 * (oitava + 1) + PC[letra];
    return altura(letra, alvo - natural, oitava);
  }

  const RE_ALTURA = /^([A-Ga-g])(##|#|bb|b|--|-)?(-?\d)$/;

  function lerAltura(token) {
    const m = RE_ALTURA.exec(token);
    if (!m) throw new ErroDeLeitura(`altura inválida: '${token}' (use, por exemplo, C4, F#3, Bb4 ou E-5)`);
    const acid = (m[2] || "").replace(/b/g, "-");
    const alter = acid.startsWith("#") ? acid.length : -acid.length;
    return altura(LETRAS.indexOf(m[1].toUpperCase()), alter, parseInt(m[3], 10));
  }

  const QUAL_PERFEITO = { 0: "P", 1: "A", 2: "AA", "-1": "d", "-2": "dd" };
  const QUAL_MAIOR = { 0: "M", "-1": "m", 1: "A", "-2": "d", 2: "AA", "-3": "dd" };
  const BASE = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };

  function intervaloAlturas(p1, p2) {
    const d = p2.letra + 7 * p2.oitava - (p1.letra + 7 * p1.oitava);
    const semitons = p2.ps - p1.ps;
    let dd = d, ss = semitons;
    if (d < 0 || (d === 0 && semitons < 0)) { dd = -d; ss = -semitons; }
    const oit = Math.floor(dd / 7);
    const simples = (dd % 7) + 1;
    const desvio = ss - 12 * oit - BASE[simples];
    const tabela = [1, 4, 5].includes(simples) ? QUAL_PERFEITO : QUAL_MAIOR;
    const qual = tabela[desvio] || "?";
    const geral = dd + 1;
    return {
      geral, simples, semitons, qual,
      direcionado: d === 0 ? 1 : Math.sign(d) * geral,
      nome: qual + geral,
      nomeSimples: qual + simples,
    };
  }

  const intervalo = (a, b) => intervaloAlturas(a.altura, b.altura);

  function harmonico(sup, inf) {
    return sup.ps >= inf.ps ? intervaloAlturas(inf.altura, sup.altura) : intervaloAlturas(sup.altura, inf.altura);
  }

  const CONSONANCIAS = new Set(["P1", "m3", "M3", "P5", "m6", "M6"]);

  function ehConsonante(iv, contraBaixo = true) {
    if (CONSONANCIAS.has(iv.nomeSimples)) return true;
    return iv.nomeSimples === "P4" && !contraBaixo;
  }

  function classePerfeita(iv) {
    if (iv.nomeSimples === "P5") return "5";
    if (iv.nomeSimples === "P1") return "8";
    return null;
  }

  function nomeIntervalo(iv) {
    const nomes = { 1: "uníssono", 2: "2ª", 3: "3ª", 4: "4ª", 5: "5ª", 6: "6ª", 7: "7ª", 8: "8ª" };
    const quals = { P: "justa", M: "maior", m: "menor", A: "aumentada", d: "diminuta", AA: "dupl. aumentada", dd: "dupl. diminuta" };
    const g = iv.geral;
    if (g === 1) return iv.qual === "P" ? "uníssono" : iv.qual === "A" ? "uníssono aumentado" : `uníssono ${iv.qual}`;
    if (g === 8 && iv.qual === "P") return "8ª justa";
    return `${nomes[g] || g + "ª"} ${quals[iv.qual] || iv.qual}`;
  }

  const ehGrau = (a, b) => intervalo(a, b).geral === 2;
  const ehSalto = (a, b) => intervalo(a, b).geral >= 3;
  const direcao = (a, b) => Math.sign(b.ps - a.ps);

  // ------------------------------------------------------------ modelo

  class ErroDeLeitura extends Error {}

  function nota(alt, inicio, duracao) {
    return {
      altura: alt, inicio, duracao,
      get fim() { return this.inicio + this.duracao; },
      get ps() { return this.altura.ps; },
      get nome() { return this.altura.nomeOitava; },
    };
  }

  function criarVoz(nome) {
    const v = {
      nome, notas: [],
      soandoEm(t) { return this.notas.find((n) => n.inicio <= t && t < n.fim) || null; },
      anterior(n) {
        const i = this.notas.indexOf(n);
        return i > 0 && this.notas[i - 1].fim === n.inicio ? this.notas[i - 1] : null;
      },
      seguinte(n) {
        const i = this.notas.indexOf(n);
        return i + 1 < this.notas.length && this.notas[i + 1].inicio === n.fim ? this.notas[i + 1] : null;
      },
      paresMelodicos() {
        const r = [];
        for (let i = 0; i + 1 < this.notas.length; i++) {
          if (this.notas[i].fim === this.notas[i + 1].inicio) r.push([this.notas[i], this.notas[i + 1]]);
        }
        return r;
      },
    };
    return v;
  }

  function criarExercicio({ vozes, formula = [4, 4], tonalidade = null, cantusFirmus = null, titulo = "" }) {
    const [num, den] = formula;
    const compasso = (T * 4 * num) / den;
    return {
      vozes, formula, tonalidade, cantusFirmus, titulo,
      duracaoCompasso: compasso,
      get baixo() { return this.vozes.length - 1; },
      get fim() {
        let f = 0;
        for (const v of this.vozes) if (v.notas.length) f = Math.max(f, v.notas[v.notas.length - 1].fim);
        return f;
      },
      compassoDe(t) { return Math.floor(t / compasso) + 1; },
      ehTempoForte(t) { return ((t % compasso) + compasso) % compasso === 0; },
      forcaMetrica(t) {
        const pos = t % compasso;
        if (pos === 0) return 3;
        const tempo = ((T * 4) / den) * (den === 8 && num % 3 === 0 && num > 3 ? 3 : 1);
        const batidas = compasso / tempo;
        if (pos % tempo === 0) {
          if (batidas % 2 === 0 && pos === compasso / 2) return 2;
          return 1;
        }
        return 0;
      },
    };
  }

  // ------------------------------------------------------------ leitura do formato de texto

  const CABECALHOS = new Set(["titulo", "compasso", "tom", "cf"]);
  const MODOS = {
    maior: "major", menor: "minor", jonio: "ionian", dorico: "dorian", frigio: "phrygian",
    lidio: "lydian", mixolidio: "mixolydian", eolio: "aeolian",
  };
  const MODOS_PT = { major: "maior", minor: "menor", ionian: "jônio", dorian: "dórico", phrygian: "frígio",
    lydian: "lídio", mixolydian: "mixolídio", aeolian: "eólio", locrian: "lócrio" };

  const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

  function interpretarTom(texto) {
    const partes = texto.trim().split(/\s+/);
    let tonica = partes[0];
    let modo = partes.length > 1 ? partes[1].toLowerCase() : tonica === tonica.toLowerCase() ? "minor" : "major";
    modo = MODOS[semAcento(modo)] || modo;
    if (!MODOS_PT[modo]) throw new ErroDeLeitura(`modo desconhecido: '${partes[1]}'`);
    tonica = tonica[0].toUpperCase() + tonica.slice(1).replace(/b/g, "-");
    const m = /^([A-G])(#{1,2}|-{1,2})?$/.exec(tonica);
    if (!m) throw new ErroDeLeitura(`tônica inválida: '${partes[0]}'`);
    const acid = m[2] || "";
    const alt = altura(LETRAS.indexOf(m[1]), acid.startsWith("#") ? acid.length : -acid.length, 4);
    return { tonica: alt, modo, texto: `${alt.nome} ${modo}` };
  }

  function lerDuracao(texto, nome, tok) {
    let v;
    if (/^\d+\/\d+$/.test(texto)) {
      const [a, b] = texto.split("/").map(Number);
      v = a / b;
    } else if (/^\d*\.?\d+$/.test(texto)) {
      v = parseFloat(texto);
    } else {
      throw new ErroDeLeitura(`${nome}: duração inválida em '${tok}'`);
    }
    return Math.round(v * T);
  }

  function vozDeTokens(nome, tokens) {
    const voz = criarVoz(nome);
    let t = 0, dur = 4 * T, ligar = false;
    voz.tokens = []; // [indice do token, nota] para o editor saber de onde veio cada nota
    for (let tok of tokens) {
      const ligaProxima = tok.endsWith("~");
      tok = tok.replace(/~+$/, "");
      let alt = tok;
      const barra = tok.indexOf("/");
      if (barra >= 0) {
        alt = tok.slice(0, barra);
        dur = lerDuracao(tok.slice(barra + 1), nome, tok);
      }
      if (alt.toUpperCase() === "P" || alt.toUpperCase() === "R") {
        ligar = false;
        t += dur;
        continue;
      }
      const a = lerAltura(alt);
      const ultima = voz.notas[voz.notas.length - 1];
      if (ligar && ultima && ultima.altura.ps === a.ps) {
        ultima.duracao += dur;
        ultima.partes.push([t, dur]);
      } else {
        const n = nota(a, t, dur);
        n.partes = [[t, dur]];
        voz.notas.push(n);
      }
      t += dur;
      ligar = ligaProxima;
    }
    return voz;
  }

  function indiceDaVoz(vozes, ref) {
    ref = ref.trim();
    const i = vozes.findIndex((v) => v.nome.toLowerCase() === ref.toLowerCase());
    if (i >= 0) return i;
    if (/^\d+$/.test(ref) && +ref >= 1 && +ref <= vozes.length) return +ref - 1;
    throw new ErroDeLeitura(`cf: não existe voz chamada '${ref}'`);
  }

  function lerTexto(texto) {
    const cab = {};
    const tokensPorVoz = new Map();
    const linhas = texto.split(/\r?\n/);
    for (let k = 0; k < linhas.length; k++) {
      const linha = linhas[k].replace(/(^|\s)#.*$/, "").trim();
      if (!linha) continue;
      const dp = linha.indexOf(":");
      if (dp < 0) throw new ErroDeLeitura(`linha ${k + 1}: esperava 'nome: conteúdo'`);
      const chave = linha.slice(0, dp).trim();
      const valor = linha.slice(dp + 1).trim();
      const norm = semAcento(chave.toLowerCase());
      if (CABECALHOS.has(norm)) cab[norm] = valor;
      else {
        if (!tokensPorVoz.has(chave)) tokensPorVoz.set(chave, []);
        tokensPorVoz.get(chave).push(...valor.split(/\s+/).filter(Boolean));
      }
    }
    if (!tokensPorVoz.size) throw new ErroDeLeitura("nenhuma voz encontrada");
    const vozes = [...tokensPorVoz].map(([nome, toks]) => vozDeTokens(nome, toks));
    let formula = [4, 4];
    if (cab.compasso) {
      const m = /^(\d+)\s*\/\s*(\d+)$/.exec(cab.compasso);
      if (!m) throw new ErroDeLeitura(`compasso inválido: '${cab.compasso}' (use, por exemplo, 4/4 ou 2/2)`);
      formula = [+m[1], +m[2]];
    }
    return criarExercicio({
      vozes, formula,
      tonalidade: cab.tom ? interpretarTom(cab.tom) : null,
      cantusFirmus: cab.cf ? indiceDaVoz(vozes, cab.cf) : null,
      titulo: cab.titulo || "",
    });
  }

  // ------------------------------------------------------------ análise

  function momentos(ex, i, j) {
    const vi = ex.vozes[i], vj = ex.vozes[j];
    const ts = [...new Set([...vi.notas.map((n) => n.inicio), ...vj.notas.map((n) => n.inicio)])].sort((a, b) => a - b);
    return ts.map((t) => {
      const sup = vi.soandoEm(t), inf = vj.soandoEm(t);
      return {
        t, sup, inf,
        completo: sup !== null && inf !== null,
        atacaSup: sup !== null && sup.inicio === t,
        atacaInf: inf !== null && inf.inicio === t,
      };
    });
  }

  function sucessoes(ex, i, j) {
    const ms = momentos(ex, i, j);
    const r = [];
    for (let k = 0; k + 1 < ms.length; k++) if (ms[k].completo && ms[k + 1].completo) r.push([ms[k], ms[k + 1]]);
    return r;
  }

  function preparada(ex, outra, n) {
    const par = ex.vozes[outra].soandoEm(n.inicio);
    return par === null || ehConsonante(harmonico(n, par), true);
  }

  function dissonancias(ex) {
    if (ex._diss) return ex._diss;
    const b = ex.baixo;
    const achadas = new Map();
    for (let u = 0; u < b; u++) {
      for (const m of momentos(ex, u, b)) {
        if (!m.completo) continue;
        const iv = harmonico(m.sup, m.inf);
        if (ehConsonante(iv, true)) continue;
        let d;
        if (m.atacaSup && m.atacaInf) d = { t: m.t, voz: u, nota: m.sup, contra: b, iv, tipo: "ataque" };
        else {
          const [atac, sust] = m.atacaSup ? [u, b] : [b, u];
          const nSust = m.atacaSup ? m.inf : m.sup;
          const nAtac = m.atacaSup ? m.sup : m.inf;
          if (ex.forcaMetrica(m.t) > ex.forcaMetrica(nSust.inicio) && preparada(ex, atac, nSust)) {
            d = { t: m.t, voz: sust, nota: nSust, contra: atac, iv, tipo: "retardo" };
          } else {
            d = { t: m.t, voz: atac, nota: nAtac, contra: sust, iv, tipo: "ataque" };
          }
        }
        if (!achadas.has(d.nota)) achadas.set(d.nota, d);
      }
    }
    ex._diss = [...achadas.values()].sort((x, y) => x.t - y.t || x.voz - y.voz);
    return ex._diss;
  }

  function paresDeVozes(ex, soExternas) {
    const n = ex.vozes.length;
    if (n < 2) return [];
    if (soExternas) return [[0, n - 1]];
    const r = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) r.push([i, j]);
    return r;
  }

  const parExterno = (ex) => (ex.vozes.length >= 2 ? [0, ex.vozes.length - 1] : null);
  const sensivel = (ex) => (ex.tonalidade ? transpor(ex.tonalidade.tonica, -1, -1).nome : null);
  const tonica = (ex) => (ex.tonalidade ? ex.tonalidade.tonica.nome : null);

  // ------------------------------------------------------------ regras

  const REGRAS = {};
  function regra(id, titulo, explicacao, verificar, precisaTom = false) {
    REGRAS[id] = { id, titulo, explicacao, verificar, precisaTom };
  }

  const nv = (ex, i) => ex.vozes[i].nome;
  const par = (ex, i, j) => `${nv(ex, i)}/${nv(ex, j)}`;
  const cN = (ex, n) => ex.compassoDe(n.inicio);
  const cM = (ex, m) => ex.compassoDe(m.t);
  const vozesDoContraponto = (ex) => ex.vozes.map((_, i) => i).filter((i) => i !== ex.cantusFirmus);
  const q = (ticks) => {
    const v = ticks / T;
    return Number.isInteger(v) ? String(v) : String(+v.toFixed(3));
  };

  // cada item: [compasso, mensagem, notas envolvidas]
  regra("ritmo_da_especie", "Ritmo da espécie",
    "Na 1ª espécie, nota contra nota; na 2ª, duas notas por nota do cantus firmus; na 3ª, quatro; na 4ª, síncopes (notas ligadas por cima da barra).",
    function* (ex, ctx) {
      const especie = { 1: 1, 2: 2, 3: 4, 4: "sincope" }[ctx.nivel];
      if (especie === undefined) return;
      let cf = ex.cantusFirmus;
      const C = ex.duracaoCompasso;
      if (cf === null) {
        cf = ex.vozes.findIndex((v) => v.notas.length && v.notas.every((n) => n.duracao === C && n.inicio % C === 0));
        if (cf < 0) cf = null;
      }
      if (cf === null) {
        yield [1, "não encontrei o cantus firmus (uma nota por compasso); indique-o com 'cf: <voz>'", []];
        return;
      }
      for (const n of ex.vozes[cf].notas) {
        if (n.duracao !== C || n.inicio % C !== 0) yield [cN(ex, n), `cantus firmus (${nv(ex, cf)}) deve ter uma nota por compasso (${n.nome})`, [n]];
      }
      const ultimo = ex.compassoDe(ex.fim - T);
      for (let i = 0; i < ex.vozes.length; i++) {
        if (i === cf) continue;
        const notas = ex.vozes[i].notas;
        for (let k = 0; k < notas.length; k++) {
          const n = notas[k], c = cN(ex, n), pos = n.inicio % C;
          if (k === notas.length - 1) {
            if (pos !== 0 || c !== ultimo) yield [c, `${nv(ex, i)}: a nota final deve cair no tempo forte do último compasso`, [n]];
            continue;
          }
          if (especie === "sincope") {
            const penultima = k === notas.length - 2;
            const ok = pos === C / 2 && (n.duracao === C || (penultima && n.duracao === C / 2));
            if (!ok) yield [c, `${nv(ex, i)}: na 4ª espécie cada nota começa no meio do compasso e se liga ao seguinte (${n.nome})`, [n]];
            continue;
          }
          const dur = C / especie;
          if (especie === 2 && k === notas.length - 2 && pos === 0 && n.duracao === C) continue; // licença cadencial
          const primeiraComPausa = k === 0 && especie > 1 && pos === dur;
          if (n.duracao !== dur || pos % dur !== 0 || (pos !== 0 && k === 0 && !primeiraComPausa)) {
            yield [c, `${nv(ex, i)}: esperava ${especie} nota(s) por compasso, mas ${n.nome} dura ${q(n.duracao)} semínima(s)`, [n]];
          }
        }
      }
    });

  regra("dissonancia_proibida", "Só consonâncias",
    "Na 1ª espécie todo intervalo contra o baixo deve ser consonante: uníssono, 3ª, 5ª, 6ª ou 8ª (a 4ª justa conta como dissonância).",
    function* (ex) {
      for (const d of dissonancias(ex)) yield [ex.compassoDe(d.t), `${par(ex, d.voz, d.contra)}: ${nomeIntervalo(d.iv)} (${d.nota.nome}) é dissonância`, [d.nota]];
    });

  regra("dissonancia_tempo_forte", "Tempo forte consonante",
    "O tempo forte de cada compasso deve ser consonante. A única dissonância aceita no tempo forte é o retardo (nota preparada e sustentada).",
    function* (ex) {
      for (const d of dissonancias(ex)) {
        if (d.tipo === "ataque" && ex.ehTempoForte(d.t)) yield [ex.compassoDe(d.t), `${nv(ex, d.voz)}: ${d.nota.nome} forma ${nomeIntervalo(d.iv)} no tempo forte`, [d.nota]];
      }
    });

  regra("retardo_nao_permitido", "Sem retardos nesta espécie",
    "Na 2ª e na 3ª espécie o contraponto não sustenta notas por cima do tempo forte, então não há retardos.",
    function* (ex) {
      for (const d of dissonancias(ex)) if (d.tipo === "retardo") yield [ex.compassoDe(d.t), `${nv(ex, d.voz)}: retardo em ${d.nota.nome}`, [d.nota]];
    });

  regra("dissonancia_aproximacao", "Dissonância chega por grau",
    "Uma nota dissonante deve chegar por grau conjunto (ou ser preparada pela mesma nota). Chegar a ela por salto é uma apojatura, que só entra no estilo livre.",
    function* (ex, ctx) {
      for (const d of dissonancias(ex)) {
        if (d.tipo !== "ataque") continue;
        const ant = ex.vozes[d.voz].anterior(d.nota);
        if (ctx.nivel >= 3 && bordaduraDupla(ex, d.voz, d.nota)) continue;
        if (ant === null || !(ehGrau(ant, d.nota) || ant.ps === d.nota.ps)) {
          const como = ant === null ? "sem nota anterior" : `por salto de ${ant.nome}`;
          yield [ex.compassoDe(d.t), `${nv(ex, d.voz)}: dissonância ${d.nota.nome} (${nomeIntervalo(d.iv)}) atingida ${como}`, [d.nota]];
        }
      }
    });

  // a nota é a 2ª ou a 3ª de uma bordadura dupla (dó–ré–si–dó ou dó–si–ré–dó)?
  function bordaduraDupla(ex, voz, n) {
    const ns = ex.vozes[voz].notas, i = ns.indexOf(n);
    for (const ini of [i - 1, i - 2]) {
      if (ini < 0 || ini + 3 >= ns.length) continue;
      const [n1, n2, n3, n4] = ns.slice(ini, ini + 4);
      if (!(n1.fim === n2.inicio && n2.fim === n3.inicio && n3.fim === n4.inicio)) continue;
      const d2 = direcao(n1, n2);
      if (n1.ps === n4.ps && ehGrau(n1, n2) && ehGrau(n1, n3) && d2 === -direcao(n1, n3) && d2 !== 0) return true;
    }
    return false;
  }

  function cambiata(ex, voz, n) {
    const v = ex.vozes[voz];
    const ant = v.anterior(n), prox = v.seguinte(n);
    if (ant === null || prox === null) return false;
    const depois = v.seguinte(prox);
    return direcao(ant, n) < 0 && ehGrau(ant, n) && intervalo(n, prox).direcionado === -3
      && depois !== null && ehGrau(prox, depois) && direcao(prox, depois) > 0;
  }

  regra("dissonancia_resolucao", "Dissonância sai por grau",
    "Uma nota dissonante deve seguir por grau conjunto. A partir da 3ª espécie a nota cambiata (desce por grau, salta uma 3ª para baixo e sobe por grau) e a bordadura dupla (dó–ré–si–dó) são aceitas.",
    function* (ex, ctx) {
      for (const d of dissonancias(ex)) {
        if (d.tipo !== "ataque") continue;
        const prox = ex.vozes[d.voz].seguinte(d.nota);
        if (prox !== null && ehGrau(d.nota, prox)) continue;
        if (ctx.nivel >= 3 && (cambiata(ex, d.voz, d.nota) || bordaduraDupla(ex, d.voz, d.nota))) continue;
        const como = prox === null ? "e a música termina" : `mas salta para ${prox.nome}`;
        yield [ex.compassoDe(d.t), `${nv(ex, d.voz)}: dissonância ${d.nota.nome} precisa resolver por grau, ${como}`, [d.nota]];
      }
    });

  regra("bordadura_na_2a_especie", "Só notas de passagem na 2ª espécie",
    "No contraponto estrito de 2ª espécie a dissonância é sempre nota de passagem: continua na mesma direção em que chegou. A bordadura fica para a 3ª espécie.",
    function* (ex) {
      for (const d of dissonancias(ex)) {
        if (d.tipo !== "ataque") continue;
        const v = ex.vozes[d.voz];
        const ant = v.anterior(d.nota), prox = v.seguinte(d.nota);
        if (ant && prox && ehGrau(ant, d.nota) && ehGrau(d.nota, prox) && direcao(ant, d.nota) !== direcao(d.nota, prox)) {
          yield [ex.compassoDe(d.t), `${nv(ex, d.voz)}: ${d.nota.nome} é bordadura dissonante`, [d.nota]];
        }
      }
    });

  regra("retardo_resolve_descendo", "Retardo resolve descendo",
    "A nota sustentada que vira dissonância no tempo forte (retardo) deve resolver descendo por grau conjunto.",
    function* (ex) {
      for (const d of dissonancias(ex)) {
        if (d.tipo !== "retardo") continue;
        const prox = ex.vozes[d.voz].seguinte(d.nota);
        if (prox === null || !(ehGrau(d.nota, prox) && direcao(d.nota, prox) < 0)) {
          const destino = prox === null ? "nada" : prox.nome;
          yield [ex.compassoDe(d.t), `${nv(ex, d.voz)}: retardo ${d.nota.nome} (${nomeIntervalo(d.iv)}) resolve em ${destino}, e não um grau abaixo`, [d.nota]];
        }
      }
    });

  function* paralelas(ex, ctx, classe) {
    for (const [i, j] of paresDeVozes(ex, ctx.soExternas)) {
      for (const [m1, m2] of sucessoes(ex, i, j)) {
        if (m1.sup.ps === m2.sup.ps || m1.inf.ps === m2.inf.ps) continue;
        const iv1 = harmonico(m1.sup, m1.inf), iv2 = harmonico(m2.sup, m2.inf);
        if (classePerfeita(iv1) === classe && classePerfeita(iv2) === classe) {
          const contrario = direcao(m1.sup, m2.sup) !== direcao(m1.inf, m2.inf);
          yield [cM(ex, m2), `${par(ex, i, j)}: ${m1.sup.nome}-${m1.inf.nome} → ${m2.sup.nome}-${m2.inf.nome}${contrario ? " por movimento contrário" : ""}`,
            [m1.sup, m1.inf, m2.sup, m2.inf]];
        }
      }
    }
  }

  regra("quintas_paralelas", "Quintas paralelas",
    "Duas vozes não podem ir de uma 5ª justa para outra 5ª justa (nem por movimento contrário).",
    function* (ex, ctx) { for (const [c, m, n] of paralelas(ex, ctx, "5")) yield [c, "quintas paralelas, " + m, n]; });

  regra("oitavas_paralelas", "Oitavas e uníssonos paralelos",
    "Duas vozes não podem ir de uma 8ª (ou uníssono) para outra 8ª (ou uníssono).",
    function* (ex, ctx) { for (const [c, m, n] of paralelas(ex, ctx, "8")) yield [c, "oitavas paralelas, " + m, n]; });

  regra("quintas_oitavas_ocultas", "Quintas e oitavas diretas (ocultas)",
    "Não se chega a uma 5ª ou 8ª justa por movimento direto. No contraponto a duas vozes (níveis 1–5) vale sempre; a partir da harmonia, só entre as vozes externas e quando a voz superior chega por salto.",
    function* (ex, ctx) {
      const p = parExterno(ex);
      if (!p) return;
      const [i, j] = p;
      const estrito = ctx.nivel <= 5;
      for (const [m1, m2] of sucessoes(ex, i, j)) {
        if (m1.sup.ps === m2.sup.ps || m1.inf.ps === m2.inf.ps) continue;
        if (direcao(m1.sup, m2.sup) !== direcao(m1.inf, m2.inf)) continue;
        const chegada = classePerfeita(harmonico(m2.sup, m2.inf));
        if (chegada === null || classePerfeita(harmonico(m1.sup, m1.inf)) === chegada) continue;
        if (!estrito && !ehSalto(m1.sup, m2.sup)) continue;
        yield [cM(ex, m2), `${chegada === "5" ? "quinta" : "oitava"} direta em ${par(ex, i, j)}: ${m2.sup.nome}-${m2.inf.nome} atingida por movimento direto`,
          [m1.sup, m1.inf, m2.sup, m2.inf]];
      }
    });

  regra("quintas_tempo_forte", "Quintas/oitavas em tempos fortes seguidos",
    "Na 2ª e 3ª espécie, 5ªs ou 8ªs em tempos fortes consecutivos soam como paralelas disfarçadas.",
    function* (ex, ctx) {
      for (const [i, j] of paresDeVozes(ex, ctx.soExternas)) {
        const fortes = momentos(ex, i, j).filter((m) => m.completo && ex.ehTempoForte(m.t));
        for (let k = 0; k + 1 < fortes.length; k++) {
          const m1 = fortes[k], m2 = fortes[k + 1];
          if (ex.compassoDe(m2.t) !== ex.compassoDe(m1.t) + 1) continue;
          if (k + 1 === fortes.length - 1 && m2.t >= ex.fim - ex.duracaoCompasso) continue;
          if (m1.sup.ps === m2.sup.ps || m1.inf.ps === m2.inf.ps) continue;
          if (m2.sup.inicio === m1.sup.fim && m2.inf.inicio === m1.inf.fim) continue;
          const c1 = classePerfeita(harmonico(m1.sup, m1.inf));
          if (c1 && c1 === classePerfeita(harmonico(m2.sup, m2.inf))) {
            yield [cM(ex, m2), `${par(ex, i, j)}: ${c1 === "5" ? "5ª" : "8ª"} em tempos fortes seguidos (${m1.sup.nome}-${m1.inf.nome} → ${m2.sup.nome}-${m2.inf.nome})`,
              [m1.sup, m1.inf, m2.sup, m2.inf]];
          }
        }
      }
    });

  regra("paralelas_imperfeitas_excessivas", "Terças ou sextas paralelas demais",
    "Mais de três 3ªs (ou 6ªs) paralelas seguidas tiram a independência das vozes.",
    function* (ex, ctx) {
      for (const [i, j] of paresDeVozes(ex, ctx.soExternas)) {
        let seq = 0, tipo = null;
        for (const [m1, m2] of sucessoes(ex, i, j)) {
          const g1 = harmonico(m1.sup, m1.inf).simples, g2 = harmonico(m2.sup, m2.inf).simples;
          const d1 = direcao(m1.sup, m2.sup);
          const paralelo = g1 === g2 && (g1 === 3 || g1 === 6) && d1 === direcao(m1.inf, m2.inf) && d1 !== 0;
          if (paralelo && g2 === tipo) seq += 1;
          else if (paralelo) { seq = 2; tipo = g2; }
          else { seq = 0; tipo = null; }
          if (seq === 4) yield [cM(ex, m2), `${par(ex, i, j)}: quatro ${tipo}ªs paralelas seguidas`, [m2.sup, m2.inf]];
        }
      }
    });

  regra("unissono_interno", "Uníssono no meio do exercício",
    "No contraponto estrito o uníssono só aparece no começo e no fim.",
    function* (ex, ctx) {
      for (const [i, j] of paresDeVozes(ex, ctx.soExternas)) {
        const ms = momentos(ex, i, j).filter((m) => m.completo);
        for (const m of ms.slice(1, -1)) {
          if (m.sup.ps === m.inf.ps && (m.atacaSup || m.atacaInf)) yield [cM(ex, m), `${par(ex, i, j)}: uníssono em ${m.sup.nome}`, [m.sup, m.inf]];
        }
      }
    });

  regra("cruzamento_de_vozes", "Cruzamento de vozes",
    "Uma voz não passa abaixo da voz que está embaixo dela (nem acima da que está em cima).",
    function* (ex) {
      for (let i = 0; i + 1 < ex.vozes.length; i++) {
        for (const m of momentos(ex, i, i + 1)) {
          if (m.completo && m.sup.ps < m.inf.ps) yield [cM(ex, m), `${nv(ex, i)} (${m.sup.nome}) está abaixo de ${nv(ex, i + 1)} (${m.inf.nome})`, [m.sup, m.inf]];
        }
      }
    });

  regra("sobreposicao_de_vozes", "Sobreposição de vozes",
    "Uma voz não deve ir além da nota que a voz vizinha acabou de tocar.",
    function* (ex) {
      for (let i = 0; i + 1 < ex.vozes.length; i++) {
        for (const [m1, m2] of sucessoes(ex, i, i + 1)) {
          if (m2.atacaInf && m2.inf.ps > m1.sup.ps) yield [cM(ex, m2), `${nv(ex, i + 1)} sobe para ${m2.inf.nome}, acima do ${m1.sup.nome} anterior de ${nv(ex, i)}`, [m2.inf]];
          else if (m2.atacaSup && m2.sup.ps < m1.inf.ps) yield [cM(ex, m2), `${nv(ex, i)} desce para ${m2.sup.nome}, abaixo do ${m1.inf.nome} anterior de ${nv(ex, i + 1)}`, [m2.sup]];
        }
      }
    });

  regra("espacamento", "Espaçamento entre vozes",
    "A duas vozes, no máximo uma 10ª entre elas. A três ou mais, vozes superiores vizinhas ficam a no máximo uma 8ª (entre tenor e baixo pode ser mais).",
    function* (ex, ctx) {
      const n = ex.vozes.length;
      let pares, limite;
      if (n === 2) {
        if (ctx.nivel > 5) return;
        pares = [[0, 1]]; limite = 10;
      } else {
        pares = []; for (let i = 0; i < n - 2; i++) pares.push([i, i + 1]);
        limite = 8;
      }
      for (const [i, j] of pares) {
        const vistos = new Set();
        for (const m of momentos(ex, i, j)) {
          if (!m.completo) continue;
          const chave = m.sup.inicio + ":" + m.inf.inicio;
          if (vistos.has(chave)) continue;
          vistos.add(chave);
          const iv = harmonico(m.sup, m.inf);
          if (iv.geral > limite || (limite === 8 && Math.abs(iv.semitons) > 12)) {
            yield [cM(ex, m), `${par(ex, i, j)}: ${m.sup.nome} e ${m.inf.nome} estão a mais de uma ${limite}ª`, [m.sup, m.inf]];
          }
        }
      }
    });

  const EXTENSOES = { soprano: ["C4", "G5"], contralto: ["G3", "D5"], alto: ["G3", "D5"], tenor: ["C3", "G4"], baixo: ["E2", "C4"] };

  regra("extensao_da_voz", "Extensão das vozes do coral",
    "Soprano C4–G5, contralto G3–D5, tenor C3–G4, baixo E2–C4. Só vale para vozes com esses nomes.",
    function* (ex) {
      for (const v of ex.vozes) {
        const lim = EXTENSOES[v.nome.toLowerCase()];
        if (!lim) continue;
        const g = lerAltura(lim[0]).ps, a = lerAltura(lim[1]).ps;
        for (const n of v.notas) if (n.ps < g || n.ps > a) yield [cN(ex, n), `${v.nome}: ${n.nome} fora da extensão (${lim[0]}–${lim[1]})`, [n]];
      }
    });

  regra("salto_maior_que_oitava", "Salto maior que uma 8ª", "Nenhuma voz salta mais que uma oitava.",
    function* (ex) {
      for (const v of ex.vozes) for (const [a, b] of v.paresMelodicos()) {
        if (Math.abs(b.ps - a.ps) > 12) yield [cN(ex, b), `${v.nome}: salto de ${a.nome} para ${b.nome}`, [a, b]];
      }
    });

  regra("intervalo_melodico_aumentado_diminuto", "Intervalo melódico aumentado ou diminuto",
    "A melodia evita intervalos aumentados e diminutos (trítono, 2ª aumentada, 4ª diminuta…) e cromatismos.",
    function* (ex) {
      for (const v of ex.vozes) for (const [a, b] of v.paresMelodicos()) {
        const iv = intervalo(a, b);
        if (iv.qual[0] === "A" || iv.qual[0] === "d") yield [cN(ex, b), `${v.nome}: ${nomeIntervalo(iv)} de ${a.nome} para ${b.nome}`, [a, b]];
      }
    });

  regra("salto_de_sexta_ou_setima", "Salto de 6ª ou 7ª",
    "No estilo estrito não se salta 7ª nem 6ª maior; a 6ª menor só ascendente.",
    function* (ex) {
      for (const v of ex.vozes) for (const [a, b] of v.paresMelodicos()) {
        const iv = intervalo(a, b);
        if (iv.geral === 7 || (iv.geral === 6 && !(iv.nome === "m6" && b.ps > a.ps))) {
          yield [cN(ex, b), `${v.nome}: salto de ${nomeIntervalo(iv)} (${a.nome}→${b.nome})`, [a, b]];
        }
      }
    });

  regra("salto_nao_compensado", "Salto grande sem compensação",
    "Depois de um salto maior que uma 4ª justa, a melodia muda de direção.",
    function* (ex) {
      for (const v of ex.vozes) {
        const ps = v.paresMelodicos();
        for (let k = 0; k + 1 < ps.length; k++) {
          const [n1, n2] = ps[k], [m1, n3] = ps[k + 1];
          if (m1 !== n2 || Math.abs(n2.ps - n1.ps) <= 5) continue;
          if (direcao(n2, n3) === direcao(n1, n2)) yield [cN(ex, n3), `${v.nome}: depois do salto ${n1.nome}→${n2.nome} a melodia continua na mesma direção (${n3.nome})`, [n1, n2, n3]];
        }
      }
    });

  regra("saltos_consecutivos", "Saltos seguidos na mesma direção",
    "Dois saltos na mesma direção só se somarem no máximo uma 8ª (arpejo de acorde); três nunca.",
    function* (ex) {
      for (const v of ex.vozes) {
        const ns = v.notas;
        for (let k = 0; k + 2 < ns.length; k++) {
          const [n1, n2, n3] = ns.slice(k, k + 3);
          if (n1.fim !== n2.inicio || n2.fim !== n3.inicio) continue;
          if (!(ehSalto(n1, n2) && ehSalto(n2, n3))) continue;
          if (direcao(n1, n2) !== direcao(n2, n3)) continue;
          const n4 = k + 3 < ns.length ? ns[k + 3] : null;
          const tres = n4 !== null && n3.fim === n4.inicio && ehSalto(n3, n4) && direcao(n3, n4) === direcao(n2, n3);
          if (Math.abs(n3.ps - n1.ps) > 12 || tres) yield [cN(ex, n3), `${v.nome}: saltos seguidos ${n1.nome}→${n2.nome}→${n3.nome}`, [n1, n2, n3]];
        }
      }
    });

  regra("nota_repetida", "Nota repetida", "No contraponto estrito a mesma nota não é atacada duas vezes seguidas.",
    function* (ex) {
      for (const i of vozesDoContraponto(ex)) {
        const v = ex.vozes[i];
        for (const [a, b] of v.paresMelodicos()) if (a.ps === b.ps) yield [cN(ex, b), `${v.nome}: ${b.nome} repetida`, [a, b]];
      }
    });

  regra("ponto_culminante", "Ponto culminante único", "A nota mais aguda da melodia aparece uma vez só.",
    function* (ex) {
      for (const i of vozesDoContraponto(ex)) {
        const v = ex.vozes[i];
        if (!v.notas.length) continue;
        const topo = Math.max(...v.notas.map((n) => n.ps));
        const cumes = v.notas.filter((n) => n.ps === topo);
        if (cumes.length > 1) yield [cN(ex, cumes[1]), `${v.nome}: o ponto culminante ${cumes[0].nome} aparece ${cumes.length} vezes`, cumes];
      }
    });

  regra("ambito_melodico", "Âmbito da melodia", "Cada voz do contraponto cabe numa 10ª.",
    function* (ex) {
      for (const i of vozesDoContraponto(ex)) {
        const v = ex.vozes[i];
        if (v.notas.length < 2) continue;
        let g = v.notas[0], a = v.notas[0];
        for (const n of v.notas) { if (n.ps < g.ps) g = n; if (n.ps > a.ps) a = n; }
        if (intervalo(g, a).geral > 10) yield [1, `${v.nome}: vai de ${g.nome} a ${a.nome}, mais que uma 10ª`, [g, a]];
      }
    });

  regra("inicio_perfeito", "Começo em consonância perfeita",
    "O primeiro intervalo é uníssono, 5ª ou 8ª. Se o contraponto está abaixo do cantus firmus, só uníssono ou 8ª.",
    function* (ex) {
      const p = parExterno(ex);
      if (!p) return;
      const ms = momentos(ex, ...p).filter((m) => m.completo);
      if (!ms.length) return;
      const iv = harmonico(ms[0].sup, ms[0].inf);
      const ok = ex.cantusFirmus === 0 ? ["P1"] : ["P1", "P5"];
      if (!ok.includes(iv.nomeSimples)) yield [cM(ex, ms[0]), `começa com ${nomeIntervalo(iv)} entre as vozes externas`, [ms[0].sup, ms[0].inf]];
    });

  regra("final_perfeito", "Final em uníssono ou 8ª", "O último intervalo entre as vozes externas é uníssono ou 8ª.",
    function* (ex) {
      const p = parExterno(ex);
      if (!p) return;
      const ms = momentos(ex, ...p).filter((m) => m.completo);
      if (!ms.length) return;
      const u = ms[ms.length - 1], iv = harmonico(u.sup, u.inf);
      if (iv.nomeSimples !== "P1") yield [cM(ex, u), `termina com ${nomeIntervalo(iv)} entre as vozes externas`, [u.sup, u.inf]];
    });

  regra("cadencia_contraponto", "Cadência do contraponto",
    "No fim, as vozes externas chegam ao uníssono/8ª por grau e em movimento contrário, vindas de uma 6ª maior ou 3ª menor (a sensível sobe meio tom).",
    function* (ex) {
      const p = parExterno(ex);
      if (!p) return;
      const ms = momentos(ex, ...p).filter((m) => m.completo);
      if (ms.length < 2) return;
      const pen = ms[ms.length - 2], fim = ms[ms.length - 1], c = cM(ex, fim);
      const notas = [pen.sup, pen.inf, fim.sup, fim.inf];
      const ds = direcao(pen.sup, fim.sup);
      if (!(ehGrau(pen.sup, fim.sup) && ehGrau(pen.inf, fim.inf) && ds === -direcao(pen.inf, fim.inf) && ds !== 0)) {
        yield [c, "as vozes externas não chegam ao final por grau em movimento contrário", notas];
        return;
      }
      const iv = harmonico(pen.sup, pen.inf);
      if (iv.nomeSimples !== "M6" && iv.nomeSimples !== "m3") {
        yield [c, `o penúltimo intervalo é ${nomeIntervalo(iv)}; esperava 6ª maior ou 3ª menor (sensível meio tom abaixo da final)`, notas];
      }
    });

  regra("sensivel_resolve", "Sensível resolve na tônica",
    "Na voz superior, a sensível vai para a tônica quando o baixo chega à tônica.",
    function* (ex) {
      const lt = sensivel(ex), ton = tonica(ex);
      if (ex.vozes.length < 2) return;
      const sup = ex.vozes[0], baixo = ex.vozes[ex.baixo];
      for (const [a, b] of sup.paresMelodicos()) {
        if (a.altura.nome !== lt) continue;
        const bx = baixo.soandoEm(b.inicio);
        if (bx === null || bx.altura.nome !== ton) continue;
        if (!(b.altura.nome === ton && b.ps > a.ps)) yield [cN(ex, b), `${sup.nome}: sensível ${a.nome} vai para ${b.nome}, e não para ${ton}`, [a, b]];
      }
    }, true);

  regra("sensivel_dobrada", "Sensível dobrada", "A sensível nunca é dobrada.",
    function* (ex) {
      const lt = sensivel(ex);
      const ts = [...new Set(ex.vozes.flatMap((v) => v.notas.map((n) => n.inicio)))].sort((a, b) => a - b);
      for (const t of ts) {
        const soando = ex.vozes.map((v) => [v, v.soandoEm(t)]);
        const com = soando.filter(([, n]) => n !== null && n.altura.nome === lt);
        const atacou = soando.some(([, n]) => n !== null && n.inicio === t && n.altura.nome === lt);
        if (com.length > 1 && atacou) yield [ex.compassoDe(t), `sensível ${lt} dobrada em ${com.map(([v]) => v.nome).join(", ")}`, com.map(([, n]) => n)];
      }
    }, true);

  regra("cadencia_autentica", "Termina em cadência",
    "O baixo termina na tônica, vindo da dominante (ou da subdominante, cadência plagal).",
    function* (ex) {
      const bx = ex.vozes[ex.baixo].notas, ton = tonica(ex);
      if (!bx.length) return;
      const final = bx[bx.length - 1];
      if (final.altura.nome !== ton) {
        yield [cN(ex, final), `o baixo termina em ${final.altura.nome}, não na tônica ${ton}`, [final]];
        return;
      }
      const ants = bx.slice(0, -1).filter((n) => n.altura.nome !== ton);
      if (!ants.length) return;
      const pen = ants[ants.length - 1];
      const dom = transpor(ex.tonalidade.tonica, 4, 7).nome, sub = transpor(ex.tonalidade.tonica, 3, 5).nome;
      if (pen.altura.nome !== dom && pen.altura.nome !== sub) {
        yield [cN(ex, final), `o baixo chega à tônica vindo de ${pen.altura.nome}; esperava ${dom} (autêntica) ou ${sub} (plagal)`, [pen, final]];
      }
    }, true);

  // ------------------------------------------------------------ níveis (cópia de verificador/niveis.py; tests/test_web.py confere)

  const NIVEIS = [
    { numero: 1, nome: "Contraponto a 2 vozes, 1ª espécie (nota contra nota)", soExternas: false },
    { numero: 2, nome: "Contraponto a 2 vozes, 2ª espécie (duas contra uma)", soExternas: false },
    { numero: 3, nome: "Contraponto a 2 vozes, 3ª espécie (quatro contra uma)", soExternas: false },
    { numero: 4, nome: "Contraponto a 2 vozes, 4ª espécie (síncopes e retardos)", soExternas: false },
    { numero: 5, nome: "Contraponto a 2 e 3 vozes, 5ª espécie (florido)", soExternas: false },
    { numero: 6, nome: "Harmonia a 4 vozes, diatônica (coral)", soExternas: false },
    { numero: 7, nome: "Harmonia cromática e modulação", soExternas: false },
    { numero: 8, nome: "Estilo clássico ao piano: frase, forma e textura", soExternas: true },
    { numero: 9, nome: "Linguagem romântica", soExternas: true },
    { numero: 10, nome: "Escrita livre: as regras viram lentes", soExternas: true },
  ];

  const TABELA = {
    ritmo_da_especie:                      "E E E E - - - - - -",
    dissonancia_proibida:                  "E - - - - - - - - -",
    dissonancia_tempo_forte:               "- E E E E - - - - -",
    retardo_nao_permitido:                 "- E E - - - - - - -",
    bordadura_na_2a_especie:               "- E - - - - - - - -",
    dissonancia_aproximacao:               "- E E E E E A A I I",
    dissonancia_resolucao:                 "- E E E E E E A A I",
    retardo_resolve_descendo:              "- - - E E E E A I I",
    quintas_paralelas:                     "E E E E E E E E A I",
    oitavas_paralelas:                     "E E E E E E E E A I",
    quintas_oitavas_ocultas:               "E E E E E E E A I -",
    quintas_tempo_forte:                   "- A A - - - - - - -",
    paralelas_imperfeitas_excessivas:      "A A A A A - - - - -",
    unissono_interno:                      "E A A A A - - - - -",
    cruzamento_de_vozes:                   "E E E E E E E A I -",
    sobreposicao_de_vozes:                 "A A A A A E E A - -",
    espacamento:                           "A A A A A E E A - -",
    extensao_da_voz:                       "- - - - - E E - - -",
    salto_maior_que_oitava:                "E E E E E E E A I I",
    intervalo_melodico_aumentado_diminuto: "E E E E E E A A I -",
    salto_de_sexta_ou_setima:              "E E E E E A A - - -",
    salto_nao_compensado:                  "E E E E E A A I - -",
    saltos_consecutivos:                   "E E E E E A A I - -",
    nota_repetida:                         "A E E A A - - - - -",
    ponto_culminante:                      "A A A A A - - - - -",
    ambito_melodico:                       "A A A A A - - - - -",
    inicio_perfeito:                       "E E E E E - - - - -",
    final_perfeito:                        "E E E E E - - - - -",
    cadencia_contraponto:                  "E E E E E - - - - -",
    sensivel_resolve:                      "- - - - - E E A I -",
    sensivel_dobrada:                      "- - - - - E E A I -",
    cadencia_autentica:                    "- - - - - A A A I -",
  };

  const SEVERIDADES = { E: "erro", A: "aviso", I: "info" };
  const ORDEM = { erro: 0, aviso: 1, info: 2 };

  function severidade(id, nivel) {
    return SEVERIDADES[TABELA[id].split(/\s+/)[nivel - 1]] || null;
  }

  const regrasAtivas = (nivel) => Object.keys(TABELA).filter((r) => severidade(r, nivel) !== null);

  function verificar(ex, nivel) {
    const niv = NIVEIS[nivel - 1];
    if (!niv) throw new Error(`nível ${nivel} não existe (use 1 a ${NIVEIS.length})`);
    const ctx = { nivel, soExternas: niv.soExternas };
    const achados = [];
    const naoVerificadas = [];
    for (const id of regrasAtivas(nivel)) {
      const r = REGRAS[id];
      if (r.precisaTom && !ex.tonalidade) { naoVerificadas.push(id); continue; }
      for (const [compasso, mensagem, notas] of r.verificar(ex, ctx)) {
        achados.push({ regra: id, severidade: severidade(id, nivel), compasso, mensagem, notas: notas || [] });
      }
    }
    achados.sort((a, b) => a.compasso - b.compasso || ORDEM[a.severidade] - ORDEM[b.severidade]);
    const contar = (s) => achados.filter((a) => a.severidade === s).length;
    return { nivel, achados, naoVerificadas, contar, aprovado: contar("erro") === 0 };
  }

  // ------------------------------------------------------------ explicações (só na versão web)

  const DETALHES = {
    ritmo_da_especie: ["Cada espécie isola um problema: a 1ª treina os intervalos, a 2ª a nota de passagem, a 3ª o movimento contínuo, a 4ª o retardo. Com outro ritmo, o exercício deixa de treinar o que deveria.",
      "Use a duração da espécie: semibreves na 1ª; mínimas na 2ª (pode começar com pausa de mínima); semínimas na 3ª; mínimas ligadas por cima da barra na 4ª. A última nota é sempre uma semibreve."],
    dissonancia_proibida: ["Na 1ª espécie cada nota dura o compasso inteiro contra uma única nota do cantus firmus. Não há como preparar nem resolver uma dissonância, então ela soa como um choque sem explicação.",
      "Troque a nota por uma que forme 3ª, 5ª, 6ª ou 8ª com o cantus firmus. A 4ª justa conta como dissonância."],
    dissonancia_tempo_forte: ["O tempo forte é onde o ouvido mede a harmonia. Uma dissonância ali, sem preparação, soa como nota errada, e não como passagem.",
      "Ponha uma consonância no tempo forte e deixe a dissonância para o tempo fraco, entre duas notas por grau conjunto."],
    retardo_nao_permitido: ["Nesta espécie o contraponto se move no tempo forte, que deve ser consonante. A nota sustentada que vira dissonância (retardo) é o assunto da 4ª espécie.",
      "Mude de nota no tempo forte em vez de sustentar a anterior, ou escolha uma nota que continue consonante."],
    bordadura_na_2a_especie: ["Com só duas notas por compasso, uma bordadura dissonante sai e volta para a mesma nota e soa como um tropeço. A nota de passagem, que liga duas notas diferentes, dá direção à linha.",
      "Faça a dissonância continuar na mesma direção em que chegou (por exemplo lá–sol–fá, descendo), ou use uma consonância no tempo fraco."],
    dissonancia_aproximacao: ["Uma dissonância se justifica pelo movimento: a voz passa por ela a caminho de outra nota. Chegando por salto, ela aparece solta, sem essa lógica.",
      "Chegue à dissonância por grau conjunto (a nota anterior a um tom ou meio tom dela), ou troque-a por uma consonância."],
    dissonancia_resolucao: ["A dissonância cria uma tensão que o ouvido espera ver resolvida na nota vizinha. Se a voz salta, a tensão fica no ar.",
      "Depois da dissonância, vá por grau conjunto, de preferência na mesma direção. A partir da 3ª espécie vale a cambiata: desce por grau, salta uma 3ª para baixo e sobe por grau."],
    retardo_resolve_descendo: ["O retardo é uma nota que chegou atrasada: ela pertence à harmonia anterior e desce para a nota que a harmonia nova pede. Resolvendo para cima ou por salto, o gesto perde o sentido.",
      "Depois da nota sustentada, desça um grau. Se a resolução não couber, prepare outra nota antes da barra."],
    quintas_paralelas: ["A 5ª justa funde tanto as duas notas que duas vozes em 5ªs seguidas soam como uma voz só, dobrada. A independência das linhas desaparece.",
      "Mude uma das vozes: use movimento contrário ou oblíquo, ou troque a segunda 5ª por uma 3ª ou 6ª."],
    oitavas_paralelas: ["Oitavas ou uníssonos seguidos fazem as duas vozes virarem uma só, e o contraponto perde uma linha.",
      "Troque a segunda 8ª por uma 3ª, 5ª ou 6ª, ou deixe uma das vozes parada ou indo na direção contrária."],
    quintas_oitavas_ocultas: ["Chegando a uma 5ª ou 8ª com as duas vozes na mesma direção, o ouvido completa a paralela escondida entre as notas. É um defeito menor que a paralela, mas enfraquece a independência.",
      "Chegue à consonância perfeita por movimento contrário ou oblíquo. A partir da harmonia, basta que a voz superior chegue por grau."],
    quintas_tempo_forte: ["Mesmo com uma nota no meio, 5ªs ou 8ªs em tempos fortes seguidos soam como paralelas, porque é nos tempos fortes que o ouvido acompanha a harmonia.",
      "Troque o intervalo de um dos tempos fortes por uma 3ª ou 6ª."],
    paralelas_imperfeitas_excessivas: ["3ªs e 6ªs paralelas soam bem, mas muitas seguidas fazem uma voz virar a sombra da outra.",
      "Depois de três, quebre a sequência com movimento contrário ou oblíquo."],
    unissono_interno: ["No uníssono as duas vozes se fundem numa nota só; no meio do exercício isso apaga uma das linhas por um instante.",
      "Afaste as vozes: troque a nota por uma que forme 3ª ou 6ª."],
    cruzamento_de_vozes: ["Quando as vozes se cruzam, o ouvido tende a seguir a nota mais aguda, e as linhas se misturam.",
      "Mantenha cada voz no seu registro: a de cima sempre acima (ou em uníssono) da de baixo."],
    sobreposicao_de_vozes: ["Se uma voz passa da nota que a vizinha acabou de tocar, o ouvido pode ligar as notas erradas e perder as linhas.",
      "Não ultrapasse a nota anterior da voz vizinha; mude a direção ou a oitava."],
    espacamento: ["Vozes muito distantes deixam um buraco no meio da textura e deixam de soar como conjunto.",
      "Aproxime as vozes: no máximo uma 10ª a duas vozes, e uma 8ª entre vozes superiores vizinhas no coral."],
    extensao_da_voz: ["Fora da extensão a voz fica forçada ou sem som, e o equilíbrio do coral se perde.",
      "Traga a nota para dentro da extensão trocando de oitava, ou redistribua as notas do acorde entre as vozes."],
    salto_maior_que_oitava: ["Saltos maiores que uma oitava são difíceis de cantar e quebram a continuidade da linha.",
      "Troque a nota de oitava, ou chegue a ela em dois movimentos."],
    intervalo_melodico_aumentado_diminuto: ["Intervalos aumentados e diminutos, como o trítono, são difíceis de entoar e soam instáveis numa linha diatônica.",
      "Escolha outra nota, ou chegue à mesma nota passando por uma intermediária."],
    salto_de_sexta_ou_setima: ["No estilo estrito, 7ªs e 6ªs maiores são difíceis de cantar e chamam atenção demais. Só a 6ª menor ascendente é aceita.",
      "Troque o salto por um menor (3ª, 4ª ou 5ª) ou por uma 8ª."],
    salto_nao_compensado: ["Um salto grande abre um espaço que o ouvido quer ver preenchido. Continuar na mesma direção deixa a linha desequilibrada.",
      "Depois de um salto maior que uma 4ª, mude de direção, de preferência por grau conjunto."],
    saltos_consecutivos: ["Vários saltos na mesma direção viram um arpejo sem rumo e esticam demais o âmbito.",
      "Depois de um salto, mude de direção ou siga por grau. Dois saltos seguidos só se formarem um acorde dentro de uma 8ª."],
    nota_repetida: ["Repetir a nota interrompe o movimento da linha, que é justamente o que o exercício quer treinar.",
      "Vá para uma nota vizinha ou para outra consonância."],
    ponto_culminante: ["Uma linha com um único ponto mais agudo tem forma: sobe até ele e volta. Repetir o clímax dilui essa curva.",
      "Deixe a nota mais aguda aparecer uma vez só: baixe uma das repetições ou crie um clímax novo."],
    ambito_melodico: ["Uma voz que passa de uma 10ª fica difícil de cantar e perde unidade.",
      "Aproxime os extremos: baixe o ponto mais agudo ou suba o mais grave."],
    inicio_perfeito: ["A consonância perfeita no início afirma o modo logo de cara. Com o contraponto embaixo, uma 5ª poria o baixo numa nota que não é a final do modo.",
      "Comece em uníssono, 5ª ou 8ª com o cantus firmus; se o contraponto estiver embaixo, só uníssono ou 8ª."],
    final_perfeito: ["O uníssono ou a 8ª no fim dão repouso completo; qualquer outro intervalo deixa a música em suspenso.",
      "Termine na mesma nota do cantus firmus, em uníssono ou em oitava."],
    cadencia_contraponto: ["A cadência é a fórmula que soa como fim: as vozes convergem por grau, e uma delas chega pela sensível, meio tom abaixo da final.",
      "No penúltimo compasso use a 6ª maior (contraponto em cima) ou a 3ª menor (contraponto embaixo), e vá por grau em movimento contrário para a 8ª ou o uníssono. Nos modos sem sensível, eleve a nota: dó♯ em ré dórico, fá♯ em sol mixolídio, sol♯ em lá eólio."],
    sensivel_resolve: ["A sensível fica meio tom abaixo da tônica e puxa para ela. Na voz superior, não resolver é ouvido claramente como frustração.",
      "Leve a sensível para a tônica, meio tom acima."],
    sensivel_dobrada: ["A sensível precisa resolver na tônica. Dobrada, as duas vozes iriam juntas para a tônica, em oitavas paralelas.",
      "Deixe a sensível numa voz só e dobre a fundamental ou a quinta do acorde."],
    cadencia_autentica: ["Frases tonais terminam numa cadência: o baixo vai da dominante (ou da subdominante) para a tônica e fecha a ideia.",
      "Termine com o baixo em V–I (cadência autêntica) ou IV–I (plagal)."],
  };
  for (const [id, [porque, corrigir]] of Object.entries(DETALHES)) Object.assign(REGRAS[id], { porque, corrigir });

  // ------------------------------------------------------------ exercício em andamento

  // regras que só fazem sentido com o exercício inteiro escrito
  const PRECISA_FIM = new Set(["final_perfeito", "cadencia_contraponto", "cadencia_autentica", "ponto_culminante"]);
  // regras que olham a nota seguinte: esperam a próxima nota ser escrita
  const OLHA_ADIANTE = new Set(["dissonancia_resolucao", "retardo_resolve_descendo", "ritmo_da_especie", "bordadura_na_2a_especie"]);

  /* Separa o que já pode ser mostrado: um achado só aparece quando todas as vozes
   * completaram o compasso dele. `fins` é até onde cada voz foi escrita (em ticks,
   * contando pausas); sem ele, usa o fim da última nota. */
  function concluidos(ex, resultado, fins, opcoes = {}) {
    fins = fins || ex.vozes.map((v) => (v.notas.length ? v.notas[v.notas.length - 1].fim : 0));
    // alvo: tamanho do exercício (padrão: o do cantus firmus). terminado: o aluno disse que acabou.
    const alvo = opcoes.alvo || (ex.cantusFirmus !== null && fins[ex.cantusFirmus] > 0 ? fins[ex.cantusFirmus] : Math.max(0, ...fins));
    const completo = opcoes.terminado ? alvo > 0 : alvo > 0 && fins.every((f) => f >= alvo) && !opcoes.semFimAutomatico;
    const compassosCompletos = completo ? ex.compassoDe(Math.max(alvo, ...fins) - 1) : Math.floor(Math.min(...fins) / ex.duracaoCompasso);
    const ultimas = new Set();
    ex.vozes.forEach((v, i) => { if (fins[i] < alvo && v.notas.length) ultimas.add(v.notas[v.notas.length - 1]); });
    const visiveis = resultado.achados.filter((a) => completo || (
      a.compasso <= compassosCompletos && !PRECISA_FIM.has(a.regra)
      && !(OLHA_ADIANTE.has(a.regra) && a.notas.some((n) => ultimas.has(n)))));
    const conta = (s) => visiveis.filter((a) => a.severidade === s).length;
    return {
      completo, compassosCompletos, visiveis, pendentes: resultado.achados.length - visiveis.length,
      contar: conta, aprovado: completo && conta("erro") === 0,
    };
  }

  /* Verifica com um perfil próprio em vez da tabela de níveis: { regra: "erro"|"aviso"|"info" }.
   * contexto.nivel decide detalhes de estilo (ex.: a cambiata vale a partir do 3). */
  function verificarPerfil(ex, perfil, contexto = {}) {
    const ctx = { ...contexto, nivel: contexto.nivel || 1, soExternas: !!contexto.soExternas };
    const achados = [], naoVerificadas = [];
    for (const [id, sev] of Object.entries(perfil)) {
      const r = REGRAS[id];
      if (!r || !sev) continue;
      if (r.precisaTom && !ex.tonalidade) { naoVerificadas.push(id); continue; }
      for (const [compasso, mensagem, notas] of r.verificar(ex, ctx)) achados.push({ regra: id, severidade: sev, compasso, mensagem, notas: notas || [] });
    }
    achados.sort((a, b) => a.compasso - b.compasso || ORDEM[a.severidade] - ORDEM[b.severidade]);
    const contar = (s) => achados.filter((a) => a.severidade === s).length;
    return { nivel: ctx.nivel, achados, naoVerificadas, contar, aprovado: contar("erro") === 0 };
  }

  // perfil equivalente a um nível da tabela
  function perfilDoNivel(nivel) {
    const p = {};
    for (const id of regrasAtivas(nivel)) p[id] = severidade(id, nivel);
    return p;
  }

  // para módulos que acrescentam regras (web/regras2.js)
  function definirRegra(id, titulo, explicacao, verificarFn, { precisaTom = false, porque = "", corrigir = "" } = {}) {
    regra(id, titulo, explicacao, verificarFn, precisaTom);
    Object.assign(REGRAS[id], { porque, corrigir });
  }
  const ferramentas = {
    momentos, sucessoes, dissonancias, harmonico, intervalo, intervaloAlturas, ehConsonante, classePerfeita,
    nomeIntervalo, ehGrau, ehSalto, direcao, sensivel, tonica, transpor, parExterno, paresDeVozes,
  };

  return {
    definirRegra, ferramentas, PRECISA_FIM, OLHA_ADIANTE,
    T, lerTexto, verificar, verificarPerfil, perfilDoNivel, concluidos, REGRAS, TABELA, NIVEIS, severidade, regrasAtivas,
    ErroDeLeitura, MODOS_PT, lerAltura, interpretarTom, altura, transpor, intervaloAlturas,
    ehConsonante, classePerfeita, criarVoz, criarExercicio, nota,
  };
});
