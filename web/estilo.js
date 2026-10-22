/* Relatório de estilo: descreve um exercício com números e compara com referências do estilo.
 * Não julga regra (isso é o verificador): mostra como a peça se comporta, para o compositor decidir.
 *
 *   Estilo.relatorio(ex, { cf, cifras, plano, nivelLivro }) → [{ grupo, titulo, valor, referencia, nota, nivel: "ok"|"atencao", medida? }]
 *     cifras:     uma por nota do baixo (as do exercício ou as do aluno); sem elas não há o grupo Harmonia
 *     plano:      o plano do exercício ({ semicadencia, cadencia }); marca as frases e as cadências
 *     nivelLivro: o nível do capítulo; com ele, cada medida é comparada com a faixa das soluções do livro
 *                 nesse nível (web/referencias-estilo.js, gerado por tests/calibrar_estilo.js)
 *   Estilo.numeros(ex, opcoes) → { medida: [valores] }: os números brutos, para a calibração
 *
 * Grupos: Melodia, Ritmo, Harmonia, Forma e Vozes. Fontes das referências: Patel & Daniele 2003 (nPVI),
 * Huron 1993 (ritmo complementar), Huron 1996 (contorno, canções folclóricas), von Hippel & Huron 2000
 * (regressão ao centro), Meeùs e Tymoczko (fundamentais "dominantes"), Caplin 1998 e Sears, Caplin &
 * McAdams 2014 (cadências), Schoenberg e Caplin (liquidação).
 */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) {
    let refs = null;
    try { refs = require("./referencias-estilo.js"); } catch (e) { refs = null; }
    module.exports = fabrica(require("./motor.js"), require("./regras2.js"), require("./regras3.js"), refs);
  } else raiz.Estilo = fabrica(raiz.Motor, raiz.Regras2, raiz.Regras3, raiz.ReferenciasEstilo || null);
})(this, function (M, R2, R3, REFERENCIAS) {
  "use strict";
  const F = M.ferramentas;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const pc = (nome) => ((M.lerAltura(nome.replace(/-/g, "b") + "4").ps % 12) + 12) % 12;

  function perfilMelodico(v) {
    const pares = v.paresMelodicos();
    const graus = pares.filter(([a, b]) => F.ehGrau(a, b)).length;
    const saltos = pares.filter(([a, b]) => F.ehSalto(a, b)).length;
    const repet = pares.filter(([a, b]) => a.ps === b.ps).length;
    const ps = v.notas.map((n) => n.ps);
    const topo = Math.max(...ps), fundo = Math.min(...ps);
    const cumes = v.notas.filter((n) => n.ps === topo);
    const posClimax = v.notas.length > 1 ? v.notas.indexOf(cumes[0]) / (v.notas.length - 1) : 0;
    const agudo = v.notas.find((n) => n.ps === topo), grave = v.notas.find((n) => n.ps === fundo);
    let mudancas = 0;
    for (let k = 1; k < pares.length; k++) if (F.direcao(...pares[k - 1]) * F.direcao(...pares[k]) < 0) mudancas++;
    return { pares: pares.length, graus, saltos, repet, cumes: cumes.length, posClimax, ambito: F.intervalo(grave, agudo), mudancas };
  }

  // ------------------------------------------------------------ medidas (exportadas para a calibração)

  const nPVI = (v) => R2.nPVI(v.notas.map((n) => n.duracao));

  // ataques por compasso
  function densidade(ex, v) {
    const n = Math.max(1, ex.compassoDe(ex.fim - 1));
    const d = Array(n).fill(0);
    for (const x of v.notas) d[ex.compassoDe(x.inicio) - 1]++;
    return d;
  }

  /* Ritmo complementar (Huron 1993): ataques simultâneos observados ÷ esperados ao acaso (p1·p2), numa
   * grade do menor valor de duração. < 1: as vozes se revezam; 1: tanto quanto o acaso; > 1: em bloco. */
  function complementaridade(ex, a, b) {
    const ds = [...a.notas, ...b.notas].map((n) => n.duracao);
    if (!ds.length) return null;
    const u = Math.min(...ds), N = Math.round(ex.fim / u);
    if (N < 2) return null;
    const ta = new Set(a.notas.map((n) => n.inicio)), tb = new Set(b.notas.map((n) => n.inicio));
    const juntos = [...ta].filter((t) => tb.has(t)).length;
    const pa = ta.size / N, pb = tb.size / N;
    if (!pa || !pb) return null;
    return juntos / N / (pa * pb);
  }

  /* Harmonia a partir das cifras: acordes (cifra repetida sobre o baixo é o mesmo acorde) com o grau da
   * fundamental. Movimento "dominante" das fundamentais (Meeùs, Tymoczko): 5ª abaixo, 3ª abaixo, 2ª acima,
   * contado em graus (IV → vii° é 5ª abaixo, mesmo sendo trítono). A tônica pode ir a qualquer acorde: as
   * saídas do I não entram na conta, nem as trocas de tom. */
  function acordes(ex, cifras) {
    if (!cifras || !ex.tonalidade) return [];
    const lista = [];
    for (const h of R3.harmoniasCifradas(ex, { cifras })) {
      if (!h.cifra) continue;
      const ult = lista[lista.length - 1];
      if (ult && ult.texto === h.texto) { ult.fim = h.fim; continue; }
      lista.push({ texto: h.texto, cifra: h.cifra, tom: h.tom, inicio: h.inicio, fim: h.fim, baixo: h.baixo, raiz: pc(R3.membros(h.cifra, h.tom)[0]), grau: h.cifra.grau });
    }
    return lista;
  }
  function fundamentais(acs) {
    let dom = 0, total = 0;
    const tonica = (a) => a.grau === 1 && !a.cifra.secundaria && !a.cifra.alteracao;
    for (let k = 1; k < acs.length; k++) {
      const a = acs[k - 1], b = acs[k];
      if (a.tom !== b.tom || tonica(a)) continue;
      const d = (b.grau - a.grau + 7) % 7; // em graus: 3 = 5ª abaixo, 5 = 3ª abaixo, 1 = 2ª acima
      if (d === 0) continue;
      total++;
      if ([3, 5, 1].includes(d)) dom++;
    }
    return { dom, total };
  }

  // tipo da cadência que termina no compasso c: PAC, IAC, SC (semicadência), engano ou nenhuma
  const FORCA = { PAC: 4, IAC: 3, SC: 2, engano: 1 };
  function cadenciaEm(ex, acs, c) {
    const fim = c * ex.duracaoCompasso;
    const k = acs.findIndex((a) => a.inicio < fim && a.fim >= fim);
    const x = acs[k], y = acs[k - 1];
    if (!x) return null;
    const dominante = (a) => a && a.cifra.grau === 5 && !a.cifra.secundaria && !a.cifra.seisQuatro;
    if (dominante(x)) return x.cifra.membroBaixo === 0 ? "SC" : null; // semicadência: V em estado fundamental
    if (!dominante(y)) return null;
    if (x.cifra.grau === 6 && !x.cifra.alteracao) return "engano";
    if (x.cifra.grau !== 1 || x.cifra.seisQuatro) return null;
    // a tônica na melodia em qualquer nota do acorde final (a apojatura ou o retardo podem vir antes)
    const mel = ex.vozes[0].notas.filter((n) => n.fim > x.inicio && n.inicio < x.fim);
    const perfeita = x.cifra.membroBaixo === 0 && y.cifra.membroBaixo === 0 && mel.some((n) => n.altura.nome === x.tom.tonica.nome);
    return perfeita ? "PAC" : "IAC";
  }

  /* Contorno de uma frase (Huron 1996): nota inicial × média das do meio × nota final. 9 classes; o
   * convexo (arco) é o mais comum nas canções folclóricas. Diferença de até 1 semitom conta como "igual". */
  const CONTORNOS = { "+-": "convexo (arco)", "-+": "côncavo", "++": "ascendente", "--": "descendente", "==": "horizontal",
    "+=": "sobe e fica", "=-": "fica e desce", "-=": "desce e fica", "=+": "fica e sobe" };
  function contorno(notas) {
    if (notas.length < 3) return null;
    const meio = notas.slice(1, -1).reduce((s, n) => s + n.ps, 0) / (notas.length - 2);
    const cmp = (a, b) => (b - a > 1 ? "+" : a - b > 1 ? "-" : "=");
    return CONTORNOS[cmp(notas[0].ps, meio) + cmp(meio, notas[notas.length - 1].ps)];
  }

  // frases: do início até cada cadência do plano; sem plano, a linha inteira
  function frases(ex, v, plano) {
    const C = ex.duracaoCompasso;
    const cortes = [plano && plano.semicadencia, plano && plano.cadencia].filter(Boolean).sort((a, b) => a - b);
    const lista = [];
    let ini = 0;
    for (const c of cortes) { lista.push(v.notas.filter((n) => n.inicio >= ini && n.inicio < c * C)); ini = c * C; }
    const resto = v.notas.filter((n) => n.inicio >= ini);
    if (resto.length) lista.push(resto);
    return lista.filter((f) => f.length);
  }

  /* Extremos do registro (von Hippel & Huron 2000): a linha que já esteve na zona extrema (os 15% de cima ou
   * de baixo do âmbito), está nela de novo e continua se afastando do centro. O ouvido espera a volta ao
   * centro (regressão à média). A primeira chegada ao extremo (a subida ao clímax) e a nota final não contam. */
  function afastamentos(v) {
    const ps = v.notas.map((n) => n.ps);
    const topo = Math.max(...ps), fundo = Math.min(...ps), faixa = topo - fundo;
    if (faixa < 5) return [];
    const lim = Math.max(1, Math.round(faixa * 0.15));
    const casos = [];
    const ultima = v.notas[v.notas.length - 1];
    let maxAntes = -Infinity, minAntes = Infinity;
    for (const [a, b] of v.paresMelodicos()) {
      if (b !== ultima) {
        if (a.ps >= topo - lim && b.ps > a.ps && maxAntes >= topo - lim) casos.push(b);
        else if (a.ps <= fundo + lim && b.ps < a.ps && minAntes <= fundo + lim) casos.push(b);
      }
      maxAntes = Math.max(maxAntes, a.ps);
      minAntes = Math.min(minAntes, a.ps);
    }
    return casos;
  }

  /* Forma compasso a compasso: cada compasso comparado com os anteriores (ritmo e intervalos diatônicos).
   * Repete (ritmo e intervalos iguais, mesmo transposto) → mesma letra; varia (ritmo ou contorno) → letra′;
   * novo → letra nova. */
  function formaPorCompasso(ex, v) {
    const C = ex.duracaoCompasso, n = ex.compassoDe(ex.fim - 1);
    const letras = [];
    let prox = 0;
    const notasEm = (c) => v.notas.filter((x) => ex.compassoDe(x.inicio) === c).length;
    for (let c = 1; c <= n; c++) {
      let rotulo = null;
      // repete: herda o rótulo inteiro (a repetição de a′ é a′); compasso de uma nota só não tem desenho
      // de intervalos, então não "repete"
      for (let b = 1; b < c && !rotulo; b++) {
        if (notasEm(b) < 2 || notasEm(c) < 2) continue;
        const s = R2.semelhanca(v, b, c, 1, C);
        if (s.ritmo >= 0.75 && s.intervalos >= 0.75) rotulo = letras[b - 1];
      }
      for (let b = 1; b < c && !rotulo; b++) {
        const s = R2.semelhanca(v, b, c, 1, C);
        if (s.ritmo >= 0.75 || (s.contorno >= 0.75 && s.ritmo >= 0.5)) rotulo = letras[b - 1].replace("′", "") + "′";
      }
      letras.push(rotulo || "abcdefghijklmnopqrstuvwxyz"[prox++ % 26]);
    }
    return letras;
  }

  /* Liquidação (Schoenberg; Caplin): semelhança com a ideia inicial (os 2 primeiros compassos, em frases de 8
   * ou mais; senão o 1º) depois dela, na 1ª metade, × nos 2 compassos antes do fim. */
  function liquidacao(ex, v) {
    const C = ex.duracaoCompasso, n = ex.compassoDe(ex.fim - 1);
    if (n < 6) return null;
    const ideia = n >= 8 ? [1, 2] : [1];
    const sim = (c) => Math.max(...ideia.map((b) => { const s = R2.semelhanca(v, b, c, 1, C); return (s.ritmo + s.contorno) / 2; }));
    const media = (cs) => cs.reduce((s, c) => s + sim(c), 0) / cs.length;
    const meio = Math.floor(n / 2);
    const depois = Array.from({ length: meio - ideia.length }, (_, i) => i + ideia.length + 1);
    if (!depois.length) return null;
    return { antes: media(depois), fim: media([n - 2, n - 1]) };
  }

  // ------------------------------------------------------------ o relatório

  function relatorio(ex, opcoes = {}) {
    const itens = [];
    const item = (grupo, x) => itens.push({ grupo, ...x });
    const cf = opcoes.cf !== undefined ? opcoes.cf : ex.cantusFirmus;
    const alvos = ex.vozes.map((_, i) => i).filter((i) => i !== cf && ex.vozes[i].notas.length > 1);

    // melodia e ritmo de cada voz escrita pelo aluno
    for (const i of alvos) {
      const v = ex.vozes[i], p = perfilMelodico(v);
      const nome = ex.vozes.length > 1 ? ` (${v.nome})` : "";
      item("Melodia", {
        titulo: `Graus e saltos${nome}`, valor: `${pct(p.graus, p.pares)}% por grau · ${p.saltos} saltos`,
        referencia: "linhas vocais: cerca de 2/3 ou mais por grau",
        nota: p.pares && p.graus / p.pares < 0.55 ? "A linha salta muito: tende a soar como arpejo, não como melodia." : "Equilíbrio de linha cantável.",
        nivel: p.pares && p.graus / p.pares < 0.55 ? "atencao" : "ok",
        medida: p.pares ? ["porGrau", pct(p.graus, p.pares)] : null,
      });
      const pos = Math.round(p.posClimax * 100);
      item("Melodia", {
        titulo: `Clímax${nome}`, valor: p.cumes > 1 ? `aparece ${p.cumes} vezes` : `único, a ${pos}% da linha`,
        referencia: "único, entre ~40% e ~75% do percurso",
        nota: p.cumes > 1 ? "O ponto mais agudo se repete: o arco perde definição." : pos < 30 ? "Clímax muito cedo: o resto da linha só desce." : pos > 85 ? "Clímax quase no fim: pouca linha para resolver a tensão." : "Posição que dá tempo de preparar e de resolver.",
        nivel: p.cumes > 1 || pos < 30 || pos > 85 ? "atencao" : "ok",
        medida: p.cumes === 1 ? ["posClimax", pos] : ["climaxRepetido", p.cumes],
      });
      item("Melodia", {
        titulo: `Âmbito${nome}`, valor: `${F.nomeIntervalo(p.ambito)}`, referencia: "de uma 6ª a uma 10ª",
        nota: p.ambito.geral < 6 ? "Âmbito estreito: a linha pode soar estática." : p.ambito.geral > 10 ? "Âmbito largo para uma voz." : "Âmbito de voz real.",
        nivel: p.ambito.geral < 6 || p.ambito.geral > 10 ? "atencao" : "ok",
        medida: ["ambito", p.ambito.geral],
      });
      if (p.repet) item("Melodia", { titulo: `Notas repetidas${nome}`, valor: String(p.repet), referencia: "0 a 1", nota: "Cada repetição congela o movimento da linha.", nivel: p.repet > 1 ? "atencao" : "ok", medida: ["notasRepetidas", p.repet] });

      const fs = frases(ex, v, opcoes.plano).map(contorno).filter(Boolean);
      if (fs.length) item("Melodia", {
        titulo: `Contorno das frases${nome}`, valor: fs.join(" · "), referencia: "o convexo (sobe e desce) é o contorno mais comum nas canções folclóricas (Huron 1996)",
        nota: fs.length > 1 && fs.every((x) => x === fs[0]) ? "As frases repetem o desenho, como num período paralelo." : fs.length > 1 ? "Cada frase tem o seu desenho." : "Uma frase só.",
        nivel: "ok",
      });
      const af = afastamentos(v);
      if (af.length) item("Melodia", {
        titulo: `Afastamento nos extremos${nome}`, valor: `${af.length} vez${af.length > 1 ? "es" : ""}`,
        referencia: "depois de uma nota no extremo do registro, a linha costuma voltar ao centro (von Hippel & Huron 2000)",
        nota: af.length > 1 ? "A linha segue se afastando a partir do extremo do registro: o ouvido espera a volta ao centro." : "Um afastamento isolado a partir do extremo; vale conferir se ele prepara o clímax.",
        nivel: af.length > 1 ? "atencao" : "ok",
      });

      const d = v.notas.map((x) => x.duracao), valores = new Set(d).size;
      if (valores > 1) {
        const np = nPVI(v);
        item("Ritmo", {
          titulo: `Variedade rítmica${nome}`, valor: `nPVI ${np.toFixed(0)} · ${valores} valores de duração`,
          referencia: "médias de temas instrumentais: ingleses ≈ 47, franceses ≈ 41 (Patel & Daniele 2003); 0 = ritmo uniforme",
          nota: np < 20 ? "Pouco contraste entre durações vizinhas: o ritmo corre uniforme." : np > 70 ? "Contraste forte entre durações vizinhas (pontuados, longas e curtas): ritmo marcado." : "Contraste moderado entre durações vizinhas.",
          nivel: "ok", medida: ["npvi", Math.round(np)],
        });
        const den = densidade(ex, v);
        if (den.length >= 4) {
          const meio = Math.floor(den.length / 2), m1 = den.slice(0, meio).reduce((s, x) => s + x, 0) / meio, m2 = den.slice(meio, -1).reduce((s, x) => s + x, 0) / Math.max(1, den.length - 1 - meio);
          item("Ritmo", {
            titulo: `Ataques por compasso${nome}`, valor: den.join(" "),
            referencia: "na sentença, a continuação fragmenta e acelera; o último compasso pousa (Caplin)",
            nota: m2 > m1 ? "A densidade cresce na 2ª metade: a frase acelera para a cadência." : "A densidade não cresce na 2ª metade.",
            nivel: "ok",
          });
        }
      }
    }

    // relação entre duas vozes (a primeira voz do aluno contra o cantus firmus, ou as externas)
    if (ex.vozes.length >= 2) {
      const par = cf !== null && cf !== undefined && cf >= 0 && alvos.length ? [Math.min(alvos[0], cf), Math.max(alvos[0], cf)] : [0, ex.vozes.length - 1];
      const ms = F.momentos(ex, ...par).filter((m) => m.completo);
      const fortes = ms.filter((m) => ex.ehTempoForte(m.t));
      const tipos = fortes.map((m) => {
        const iv = F.harmonico(m.sup, m.inf);
        return F.classePerfeita(iv) ? "perfeita" : F.ehConsonante(iv, true) ? "imperfeita" : "dissonante";
      });
      const perf = tipos.filter((t) => t === "perfeita").length, imp = tipos.filter((t) => t === "imperfeita").length;
      item("Vozes", {
        titulo: "Consonâncias nos tempos fortes", valor: `${pct(imp, tipos.length)}% imperfeitas · ${pct(perf, tipos.length)}% perfeitas`,
        referencia: "Fux: mais imperfeitas que perfeitas (perfeitas no começo, no fim e em pontos de articulação)",
        nota: imp < perf ? "Muitas 5ªs e 8ªs: o tecido fica oco e as vozes perdem identidade." : "3ªs e 6ªs formam o tecido; as perfeitas marcam pontos.",
        nivel: imp < perf ? "atencao" : "ok",
        medida: tipos.length ? ["imperfeitas", pct(imp, tipos.length)] : null,
      });
      const suc = F.sucessoes(ex, ...par).filter(([, b]) => b.atacaSup || b.atacaInf);
      // movimento de tempo a tempo (como a referência dos corais): as notas que soam em cada tempo
      const vs = ex.vozes[par[0]], vi = ex.vozes[par[1]];
      const tempos = [];
      for (let t = 0; t < ex.fim; t += M.T / 4) if (ex.forcaMetrica(t) >= 1) tempos.push(t);
      const nosTempos = [];
      for (let k = 1; k < tempos.length; k++) {
        const a = { sup: vs.soandoEm(tempos[k - 1]), inf: vi.soandoEm(tempos[k - 1]) }, b = { sup: vs.soandoEm(tempos[k]), inf: vi.soandoEm(tempos[k]) };
        if (a.sup && a.inf && b.sup && b.inf && (a.sup !== b.sup || a.inf !== b.inf)) nosTempos.push([a, b]);
      }
      const cont = { contrario: 0, obliquo: 0, direto: 0, paralelo: 0 };
      for (const [a, b] of nosTempos) {
        const ds = F.direcao(a.sup, b.sup), di = F.direcao(a.inf, b.inf);
        if (ds === 0 || di === 0) cont.obliquo++;
        else if (ds !== di) cont.contrario++;
        else if (F.harmonico(a.sup, a.inf).simples === F.harmonico(b.sup, b.inf).simples) cont.paralelo++;
        else cont.direto++;
      }
      const tot = nosTempos.length;
      item("Vozes", {
        titulo: "Movimento entre as vozes", valor: `contrário ${pct(cont.contrario, tot)}% · oblíquo ${pct(cont.obliquo, tot)}% · direto ${pct(cont.direto, tot)}% · paralelo ${pct(cont.paralelo, tot)}%`,
        referencia: "corais de Bach, soprano e baixo nos tempos: contrário 43%, oblíquo 26%, direto 27%, paralelo 5% (medido com o music21)",
        nota: cont.contrario < Math.max(cont.direto, cont.paralelo) ? "As vozes andam muito juntas: a independência sofre, mesmo sem erro de regra." : "Boa independência de direção.",
        nivel: cont.contrario < Math.max(cont.direto, cont.paralelo) ? "atencao" : "ok",
        medida: tot ? ["contrario", pct(cont.contrario, tot)] : null,
      });
      // saltos simultâneos
      let simult = 0;
      for (const [a, b] of suc) if (b.atacaSup && b.atacaInf && F.ehSalto(a.sup, b.sup) && F.ehSalto(a.inf, b.inf)) simult++;
      if (simult) item("Vozes", { titulo: "Saltos simultâneos", valor: String(simult), referencia: "raros: quando uma voz salta, a outra costuma andar por grau",
        nota: "Saltos nas duas vozes ao mesmo tempo chamam atenção e dificultam o equilíbrio.", nivel: simult > 1 ? "atencao" : "ok", medida: ["saltosSimultaneos", simult] });
      // clímax coincidente
      const top = (v) => { const m = Math.max(...v.notas.map((n) => n.ps)); return v.notas.filter((n) => n.ps === m).map((n) => ex.compassoDe(n.inicio)); };
      const a = ex.vozes[par[0]], b = ex.vozes[par[1]];
      if (a.notas.length && b.notas.length) {
        const coincide = top(a).some((c) => top(b).includes(c));
        item("Vozes", { titulo: "Clímax das duas vozes", valor: coincide ? "no mesmo compasso" : "em compassos diferentes", referencia: "em momentos diferentes",
          nota: coincide ? "Os dois pontos altos juntos fazem as vozes soarem como bloco." : "Cada voz tem o seu arco.", nivel: coincide ? "atencao" : "ok", medida: ["climaxJunto", coincide ? 1 : 0] });
        const comp = complementaridade(ex, a, b);
        if (comp !== null) item("Ritmo", {
          titulo: "Ritmo entre as vozes", valor: `${comp.toFixed(2)} × o acaso`,
          referencia: "nas Invenções de Bach, as vozes atacam juntas menos que o acaso prevê (Huron 1993)",
          medida: ["complementaridade", Math.round(comp * 100) / 100],
          nota: comp < 0.9 ? "Ritmo complementar: quando uma voz se move, a outra tende a esperar." : comp > 1.5 ? "As vozes atacam juntas bem mais que o acaso: o baixo marca os tempos da melodia (textura de melodia acompanhada, não de duas vozes iguais)." : "Ataques juntos perto da medida do acaso.",
          nivel: "ok",
        });
      }
    }

    // harmonia (só com cifras)
    const acs = acordes(ex, opcoes.cifras);
    if (acs.length >= 3) {
      const { dom, total } = fundamentais(acs);
      if (total) item("Harmonia", {
        titulo: "Movimento das fundamentais", valor: `${pct(dom, total)}% "dominantes" (5ª ↓, 3ª ↓, 2ª ↑)`,
        referencia: "em Bach, a grande maioria (Meeùs, Tymoczko); a retrogressão é rara, não proibida. Saídas do I não contam",
        nota: dom / total < 0.5 ? "Muitas progressões para trás: a harmonia anda em círculos em vez de avançar para a cadência." : "A harmonia avança como no estilo tonal.",
        nivel: dom / total < 0.5 ? "atencao" : "ok",
        medida: ["dominantes", pct(dom, total)],
      });
      const n = ex.compassoDe(ex.fim - 1);
      // acordes que soam em cada compasso (o que vem do compasso anterior também conta)
      const C = ex.duracaoCompasso;
      const trocas = Array.from({ length: n }, (_, k) => acs.filter((a) => a.inicio < (k + 1) * C && a.fim > k * C).length);
      item("Harmonia", {
        titulo: "Acordes por compasso", valor: `${trocas.join(" ")} · ${new Set(acs.map((a) => a.texto)).size} acordes diferentes`,
        referencia: "o ritmo harmônico acelera antes da cadência (Caplin)",
        nota: trocas.length >= 4 && trocas[trocas.length - 2] > trocas[0] ? "A troca de acordes acelera antes do fim." : "Ritmo harmônico sem aceleração antes do fim.",
        nivel: "ok",
      });
      const pl = opcoes.plano || {};
      const pontos = [...new Set([pl.semicadencia, pl.cadencia, n].filter(Boolean))].sort((x, y) => x - y);
      const cads = pontos.map((c) => [c, cadenciaEm(ex, acs, c)]).filter(([, t]) => t);
      if (cads.length) {
        const forcas = cads.map(([, t]) => FORCA[t]);
        const fraca = forcas.length > 1 && forcas[forcas.length - 1] <= Math.max(...forcas.slice(0, -1));
        item("Harmonia", {
          titulo: "Cadências", valor: cads.map(([c, t]) => `c. ${c} ${t}`).join(" → "),
          referencia: "força percebida: PAC > IAC > SC > engano (Caplin; Sears, Caplin & McAdams 2014); a última cadência é a mais forte",
          nota: fraca ? "A cadência final não é mais forte que a anterior: o fim não soa como fim." : "As cadências ficam mais fortes até o fim.",
          nivel: fraca ? "atencao" : "ok",
        });
      }
    }

    // forma (uma voz do aluno com 4 compassos ou mais)
    if (alvos.length) {
      const v = ex.vozes[alvos[0]], n = ex.compassoDe(ex.fim - 1);
      if (n >= 4 && new Set(v.notas.map((x) => x.duracao)).size > 1) {
        const letras = formaPorCompasso(ex, v);
        const novos = new Set(letras.map((l) => l.replace("′", ""))).size;
        item("Forma", {
          titulo: "Compasso a compasso", valor: letras.join(" "),
          referencia: "letra igual = repete (mesmo transposto); ′ = varia; letra nova = material novo",
          nota: novos === letras.length ? "Nada se repete nem volta: falta uma ideia que dê unidade." : novos === 1 ? "Tudo é a mesma ideia: falta contraste." : "Repetição e contraste convivem.",
          nivel: novos === letras.length ? "atencao" : "ok",
        });
        const lq = liquidacao(ex, v);
        if (lq) item("Forma", {
          titulo: "Motivo inicial perto da cadência", valor: `${pct(lq.antes, 1)}% na 1ª metade · ${pct(lq.fim, 1)}% antes do fim`,
          referencia: "liquidação (Schoenberg; Caplin): na sentença, os traços do motivo se dissolvem antes da cadência",
          nota: lq.fim < lq.antes - 0.15 ? "O motivo se dissolve perto da cadência: há liquidação."
            : lq.fim >= 0.6 ? "O motivo continua quase igual até perto do fim." : "A semelhança com o motivo já é baixa antes do fim.",
          nivel: "ok",
        });
      }
    }
    // faixas do livro: a atenção só fica se a medida também foge do que as soluções do nível fazem
    const faixas = REFERENCIAS && opcoes.nivelLivro ? REFERENCIAS[opcoes.nivelLivro] : null;
    if (faixas) {
      for (const i of itens) {
        const f = i.medida && faixas[i.medida[0]];
        if (!f) continue;
        const [lo, hi] = f, x = i.medida[1];
        i.referencia += `; nas soluções do livro neste nível: ${lo}–${hi}`;
        if (i.nivel === "atencao" && x >= lo && x <= hi) { i.nivel = "ok"; i.nota += " Ainda assim, dentro do que as soluções do livro fazem neste nível."; }
      }
    }
    return itens;
  }

  // os números brutos do relatório (sem as faixas), para a calibração
  function numeros(ex, opcoes = {}) {
    const n = {};
    for (const i of relatorio(ex, { ...opcoes, nivelLivro: null })) if (i.medida) (n[i.medida[0]] = n[i.medida[0]] || []).push(i.medida[1]);
    return n;
  }

  return { relatorio, numeros, medidas: { nPVI, densidade, complementaridade, acordes, fundamentais, cadenciaEm, contorno, frases, afastamentos, formaPorCompasso, liquidacao } };
});
