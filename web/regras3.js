/* Regras da versão 3 (ateliê): cifragem com inversões, ritmo harmônico, esquemas, esqueletos
 * e restrições de exercício. O contexto (ctx) pode trazer:
 *   ctx.cifras        ["I", "V43", "I6", …] uma por nota do baixo (a última voz)
 *   ctx.plano         { semicadencia: 4, cadencia: 8, acelerar: [[1, 4], [5, 7]] }
 *   ctx.esquemas      [{ nome, inicio (semínimas), etapa (semínimas), baixo: [graus], soprano: [graus] }]
 *   ctx.esqueleto     [[semínima, "G4"], …] notas que a voz do aluno precisa ter nesses tempos
 *   ctx.climax        { compasso }         ctx.maxPerfeitas  n
 *   ctx.figuras       ["cambiata", "bordadura_dupla"]    ctx.minDissonancias  n
 *   ctx.maxSaltosBaixo n */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"), require("./regras2.js"));
  else raiz.Regras3 = fabrica(raiz.Motor, raiz.Regras2);
})(this, function (M, R2) {
  "use strict";
  const F = M.ferramentas, T = M.T, def = M.definirRegra;
  const EXPL = (porque, corrigir) => ({ porque, corrigir });
  const vozAlvo = (ex, ctx) => (ctx.alvo !== undefined ? ctx.alvo : ex.vozes.findIndex((_, i) => i !== ex.cantusFirmus));

  // ------------------------------------------------------------ cifras

  const NUM = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };
  const FUNCAO = { 1: "T", 6: "T", 3: "T", 2: "PD", 4: "PD", 5: "D", 7: "D" };

  /* "V43" → { grau, setima, membroBaixo (0 fundamental, 1 terça, 2 quinta, 3 sétima), texto } */
  /* Cifras aceitas:
   *   graus romanos com qualidade pela caixa (I maior, ii menor, vii° diminuto, viiø7 meio-diminuto, III+ aumentado)
   *   e figura (6, 64, 7, 65, 43, 42, 9): I6, ii65, V43, vii°7, IV7, V9
   *   empréstimo e alterações com b/# antes do grau: iv, bVI, bIII, bVII, #iv°7
   *   dominantes secundárias: V43/V, V7/IV, vii°7/V
   *   napolitana N ou N6; sextas aumentadas It6, Fr43, Ger65 (com o 6º grau abaixado no baixo) */
  const AUMENTADAS = { It: [5, 0, 3], Fr: [5, 0, 1, 3], Ger: [5, 0, 2, 3] };
  function lerCifra(s) {
    const t = String(s).trim();
    const aum = /^(It|Fr|Ger)(6|43|4\/3|65|6\/5)?$/.exec(t);
    if (aum) return { grau: 4, setima: aum[1] !== "It", membroBaixo: 0, fig: "", texto: t, aumentada: aum[1], seisQuatro: false };
    const nap = /^N(6|64)?$/.exec(t);
    if (nap) return { grau: 2, setima: false, membroBaixo: nap[1] === "6" ? 1 : nap[1] === "64" ? 2 : 0, fig: nap[1] || "", texto: t, napolitana: true, alteracao: -1, maior: true, seisQuatro: nap[1] === "64" };
    const m = /^(b|#)?([ivIV]+)(°|o|ø|\+)?(7|65|6\/5|43|4\/3|42|4\/2|2|64|6\/4|6|9)?(?:\/([ivIV]+))?$/.exec(t);
    if (!m) return null;
    const grau = NUM[m[2].toUpperCase()];
    if (!grau) return null;
    const fig = (m[4] || "").replace("/", "");
    const setima = ["7", "65", "43", "42", "2", "9"].includes(fig);
    const membroBaixo = { "": 0, 7: 0, 9: 0, 6: 1, 65: 1, 64: 2, 43: 2, 42: 3, 2: 3 }[fig];
    const q = m[3] === "o" ? "°" : m[3];
    const c = { grau, setima, membroBaixo, fig, texto: t, seisQuatro: fig === "64", nona: fig === "9",
      maior: m[2] === m[2].toUpperCase(), qualidade: q || "", alteracao: m[1] === "b" ? -1 : m[1] === "#" ? 1 : 0 };
    if (m[5]) {
      const alvo = NUM[m[5].toUpperCase()];
      if (!alvo || !(grau === 5 || grau === 7) || c.alteracao) return null;
      // o grau passa a ser o da fundamental do acorde (V/V → 2, vii°/V → 4), para as regras de função
      c.secundaria = { tipo: grau, alvo, semi: q === "ø" ? "meio" : "dim" };
      c.grau = ((alvo - 1 + (grau === 5 ? 4 : 6)) % 7) + 1;
    }
    return c;
  }

  function membros(c, tom) {
    const esc = R2.escala(tom);
    const nome = (a) => a.nome;
    if (c.aumentada) return AUMENTADAS[c.aumentada].map((k) => [F.transpor(tom.tonica, 5, 8), tom.tonica, F.transpor(tom.tonica, 1, 2), F.transpor(tom.tonica, 2, 3), F.transpor(tom.tonica, 3, 6)][[5, 0, 1, 2, 3].indexOf(k)]).map(nome);
    if (c.secundaria) {
      const alvo = esc[c.secundaria.alvo - 1];
      const nomes = c.secundaria.tipo === 5
        ? [[0, 0], [2, 4], [4, 7], [6, 10]].map(([g, st]) => F.transpor(F.transpor(alvo, 4, 7), g, st).nome)
        : [[0, 0], [2, 3], [4, 6], [6, c.secundaria.semi === "meio" ? 10 : 9]].map(([g, st]) => F.transpor(F.transpor(alvo, -1, -1), g, st).nome);
      return c.setima ? nomes : nomes.slice(0, 3);
    }
    // fundamental: grau da escala (no menor, o vii° e o V usam a sensível), alterada por b/#
    let raiz = esc[c.grau - 1];
    if (tom.modo === "minor" && c.grau === 7 && !c.maior && !c.alteracao) raiz = F.transpor(tom.tonica, -1, -1);
    if (c.alteracao) raiz = F.transpor(raiz, 0, c.alteracao);
    const dim = c.qualidade === "°" || c.qualidade === "ø", aum = c.qualidade === "+";
    const terca = F.transpor(raiz, 2, c.maior && !dim ? 4 : 3);
    const quinta = F.transpor(raiz, 4, dim ? 6 : aum ? 8 : 7);
    const nomes = [raiz, terca, quinta];
    if (c.setima) {
      let st;
      if (c.qualidade === "°") st = 9;
      else if (c.qualidade === "ø") st = 10;
      else if ((c.grau === 5 && c.maior && !c.alteracao) || c.alteracao) st = 10;
      else {
        // sétima diatônica: a nota da escala uma 7ª acima da fundamental
        const diat = esc[(c.grau - 1 + 6) % 7];
        st = (((diat.ps - raiz.ps) % 12) + 12) % 12;
      }
      nomes.push(F.transpor(raiz, 6, st));
    }
    if (c.nona) {
      const diat = esc[(c.grau - 1 + 1) % 7];
      nomes.push(F.transpor(raiz, 8, 12 + ((((diat.ps - raiz.ps) % 12) + 12) % 12)));
    }
    return nomes.map(nome);
  }

  /* Modulação nas cifras:
   *   "G:ii6"     a partir daqui o tom é sol maior (letra maiúscula = maior, minúscula = menor: "e:iv")
   *   "vi=G:ii"   acorde-pivô: vi no tom antigo e ii no novo; o tom novo vale a partir dele */
  function tomDaLetra(s) {
    const m = /^([A-Ga-g])(#|b)?$/.exec(s);
    if (!m) return null;
    try { return M.interpretarTom(`${m[1].toUpperCase()}${m[2] || ""} ${m[1] === m[1].toUpperCase() ? "maior" : "menor"}`); } catch (e) { return null; }
  }
  function lerComTom(texto, tomAtual) {
    const m = /^([A-Ga-g][#b]?):(.+)$/.exec(texto.trim());
    if (!m) return { tom: tomAtual, cifra: lerCifra(texto) };
    const t = tomDaLetra(m[1]);
    return { tom: t || tomAtual, cifra: t ? lerCifra(m[2]) : null, mudou: !!t };
  }
  // [{ nota do baixo, cifra lida, texto, notas do acorde, tom local, pivô }]
  function harmoniasCifradas(ex, ctx) {
    const b = ex.vozes[ex.vozes.length - 1];
    if (!ctx.cifras || !ex.tonalidade || !b) return [];
    let tom = ex.tonalidade;
    return b.notas.map((n, i) => {
      const texto = ctx.cifras[i];
      let c = null, pivo = null, mudou = false;
      if (texto) {
        const partes = texto.split("=");
        if (partes.length === 2) {
          const velho = lerComTom(partes[0], tom), novo = lerComTom(partes[1], velho.tom);
          pivo = velho.cifra && novo.cifra ? { velho: { ...velho, notas: new Set(membros(velho.cifra, velho.tom)) }, novo } : null;
          mudou = novo.tom !== tom;
          tom = novo.tom; c = novo.cifra;
        } else {
          const r = lerComTom(texto, tom);
          mudou = r.tom !== tom;
          tom = r.tom; c = r.cifra;
        }
      }
      // no pivô, a melodia e o baixo podem estar grafados em qualquer das duas leituras (enarmonia)
      const notas = c ? new Set([...membros(c, tom), ...(pivo ? pivo.velho.notas : [])]) : null;
      return { baixo: n, texto, cifra: c, tom, mudou, pivo, notas, inicio: n.inicio, fim: n.fim };
    });
  }

  // harmonia no formato de regras2 (para notas_do_acorde) a partir das cifras
  function harmoniaDasCifras(ex, ctx) {
    return harmoniasCifradas(ex, ctx).filter((h) => h.cifra).map((h) => ({ inicio: h.inicio, fim: h.fim, grau: h.cifra.grau, simbolo: h.texto, notas: h.notas }));
  }

  def("cifras_coerentes", "Cifra coerente com as vozes",
    "Cada nota do baixo tem uma cifra; o baixo é o membro do acorde que a cifra indica (I6: a 3ª no baixo; V43: a 5ª), e a melodia no ataque do baixo é nota do acorde.",
    function* (ex, ctx) {
      const hs = harmoniasCifradas(ex, ctx);
      const mel = ex.vozes[0];
      for (const h of hs) {
        const c = ex.compassoDe(h.inicio);
        if (!h.texto) { yield [c, `baixo ${h.baixo.nome}: falta a cifra`, [h.baixo]]; continue; }
        if (!h.cifra) { yield [c, `cifra "${h.texto}" não reconhecida (use I, ii6, V43, I64, V7, vii°6…; G:ii6 muda de tom; vi=G:ii é um pivô)`, [h.baixo]]; continue; }
        const classes = (ns) => [...new Set([...ns].map((x) => ((M.lerAltura(x.replace(/-/g, "b") + "4").ps % 12) + 12) % 12))].sort().join();
        if (h.pivo && classes(h.pivo.velho.notas) !== classes(membros(h.cifra, h.tom))) yield [c, `pivô ${h.texto}: as duas leituras não são o mesmo acorde (${[...h.pivo.velho.notas].join("–")} × ${[...h.notas].join("–")})`, [h.baixo]];
        const esperado = membros(h.cifra, h.tom)[h.cifra.membroBaixo];
        const esperadoVelho = h.pivo ? membros(h.pivo.velho.cifra, h.pivo.velho.tom)[h.pivo.velho.cifra.membroBaixo] : null;
        if (h.baixo.altura.nome !== esperado && h.baixo.altura.nome !== esperadoVelho) yield [c, `${h.texto} pede ${esperado} no baixo, e o baixo tem ${h.baixo.nome}`, [h.baixo]];
        const m = mel.soandoEm(h.inicio);
        if (m && mel !== ex.vozes[ex.vozes.length - 1] && !h.notas.has(m.altura.nome)) {
          yield [c, `${m.nome} na melodia não pertence a ${h.texto} (${[...h.notas].join("–")})`, [m, h.baixo]];
        }
      }
    }, { precisaTom: true, ...EXPL(
      "A cifra é a sua leitura da harmonia. Se ela não bate com o baixo e com a melodia, ou o acorde não é o que você pensa, ou a nota da melodia é uma dissonância que precisa de tratamento.",
      "Confira qual membro do acorde está no baixo (fundamental = sem número, 3ª = 6, 5ª = 64; com 7ª: 7, 65, 43, 42) e troque a cifra ou a nota.") });

  // Regra da Oitava (Fenaroli, Campion): a cifra de cada grau de um baixo em escala
  const OITAVA = {
    sobe: { 1: [[1, 0]], 2: [[5, 2]], 3: [[1, 1]], 4: [[2, 1]], 5: [[5, 0]], 6: [[4, 1]], 7: [[5, 1]] },
    desce: { 1: [[1, 0]], 2: [[5, 2]], 3: [[1, 1]], 4: [[5, 3]], 5: [[5, 0]], 6: [[2, 2, 5], [4, 1]], 7: [[5, 1]] },
  };
  const NOME_OITAVA = {
    sobe: { 1: "5/3 (I)", 2: "6/4/3 (V43)", 3: "6 (I6)", 4: "6/5 (ii65)", 5: "5/3 (V)", 6: "6 (IV6)", 7: "6/5 (V65)" },
    desce: { 1: "5/3 (I)", 2: "6/4/3 (V43)", 3: "6 (I6)", 4: "4/2 (V42)", 5: "5/3 (V)", 6: "♯6/4/3 (V43/V) ou, na versão diatônica, 6 (IV6)", 7: "6 (V6)" },
  };
  def("regra_da_oitava", "Regra da oitava",
    "Num baixo que anda por grau, cada grau tem a sua harmonia: subindo 1 5/3, 2 V43, 3 I6, 4 ii65, 5 V, 6 IV6, 7 V65; descendo 7 V6, 6 V43/V (ou IV6), 4 V42.",
    function* (ex, ctx) {
      const hs = harmoniasCifradas(ex, ctx);
      for (let k = 0; k < hs.length; k++) {
        const h = hs[k];
        if (!h.cifra) continue;
        const ant = hs[k - 1], prox = hs[k + 1];
        const tom = h.tom;
        const grauDe = (n) => ((n.altura.letra - tom.tonica.letra) % 7 + 7) % 7 + 1;
        let dir = null;
        if (ant && F.ehGrau(ant.baixo, h.baixo)) dir = h.baixo.ps > ant.baixo.ps ? "sobe" : "desce";
        else if (prox && F.ehGrau(h.baixo, prox.baixo)) dir = prox.baixo.ps > h.baixo.ps ? "sobe" : "desce";
        if (!dir) continue;
        const g = grauDe(h.baixo);
        const ok = OITAVA[dir][g].some(([gr, mb, sec]) => h.cifra.grau === gr && h.cifra.membroBaixo === mb && (!!sec === !!h.cifra.secundaria));
        if (!ok) yield [ex.compassoDe(h.inicio), `baixo ${h.baixo.nome} (${g}º grau, ${dir === "sobe" ? "subindo" : "descendo"}): a regra da oitava pede ${NOME_OITAVA[dir][g]}, e a cifra é ${h.texto}`, [h.baixo]];
      }
    }, { precisaTom: true, ...EXPL(
      "A Regra da Oitava é o vocabulário básico do baixo por grau: os graus estáveis (1 e 5) levam 5/3, os outros levam acordes de sexta que apontam para eles. Os músicos napolitanos a tocavam em todos os tons antes de qualquer partimento.",
      "Use a cifra indicada para esse grau e direção; depois confira se a melodia é nota do acorde.") });

  /* ctx.modulacao = { para: "G maior", tipo: "pivo" | "cromatica" | "enarmonica", ate: compasso da cadência } */
  def("modulacao", "Modulação",
    "O exercício pede uma modulação de um tipo dado: a cifra muda para o tom novo pelo meio pedido (acorde-pivô, inflexão cromática ou reinterpretação enarmônica) e o tom novo é confirmado por uma cadência V(7)–I.",
    function* (ex, ctx) {
      const md = ctx.modulacao;
      if (!md) return;
      const hs = harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      if (!hs.length) return;
      const alvo = M.interpretarTom(md.para);
      const noAlvo = (h) => h.tom.tonica.nome === alvo.tonica.nome && (h.tom.modo === "minor") === (alvo.modo === "minor");
      const k = hs.findIndex(noAlvo);
      const nomeAlvo = md.para;
      if (k < 0) { yield [ex.compassoDe(ex.fim - 1), `as cifras nunca chegam a ${nomeAlvo} (escreva "${alvo.tonica.nome.replace(/-/g, "b")}:" antes da primeira cifra no tom novo)`, []]; return; }
      const h = hs[k], ant = hs[k - 1];
      const c = ex.compassoDe(h.inicio);
      if (md.tipo === "pivo" && !(h.pivo && !h.pivo.velho.cifra.secundaria)) yield [c, `a mudança para ${nomeAlvo} não tem acorde-pivô: escreva o acorde comum com as duas leituras (ex.: vi=G:ii)`, [h.baixo]];
      if (md.tipo === "enarmonica") {
        const enarm = h.pivo && [...h.pivo.velho.notas].sort().join() !== [...membros(h.cifra, h.tom)].sort().join();
        if (!enarm) yield [c, `a modulação enarmônica pede um pivô que muda de grafia (ex.: vii°7=e:vii°7, ou V7=Gb:Ger65 escrito como acorde do tom novo)`, [h.baixo]];
      }
      if (md.tipo === "cromatica") {
        // alguma voz faz um semitom cromático (mesma letra, outra alteração) entre o acorde anterior e o primeiro do tom novo
        let cromatico = false;
        const ini = ant ? ant.inicio : h.inicio, fim = h.fim;
        for (const v of ex.vozes) {
          const ns = v.notas.filter((n) => n.fim > ini && n.inicio < fim);
          for (let i = 1; i < ns.length; i++) if (ns[i].altura.letra === ns[i - 1].altura.letra && ns[i].altura.alter !== ns[i - 1].altura.alter) cromatico = true;
        }
        if (h.pivo) yield [c, `a modulação cromática não usa acorde-pivô: o tom novo entra por uma inflexão cromática de uma voz`, [h.baixo]];
        else if (!cromatico) yield [c, `na entrada de ${nomeAlvo}, nenhuma voz faz o semitom cromático (ex.: dó → dó♯) que caracteriza a modulação cromática`, [h.baixo]];
      }
      // confirmação: V(7) → I em estado fundamental no tom novo
      let cad = -1;
      for (let i = k; i + 1 < hs.length; i++) {
        const a = hs[i], b = hs[i + 1];
        if (noAlvo(a) && noAlvo(b) && a.cifra.grau === 5 && a.cifra.membroBaixo === 0 && !a.cifra.secundaria && b.cifra.grau === 1 && b.cifra.membroBaixo === 0) { cad = i + 1; break; }
      }
      if (cad < 0) yield [ex.compassoDe(ex.fim - 1), `${nomeAlvo} não é confirmado por uma cadência (V ou V7 → I, os dois em estado fundamental, no tom novo)`, []];
      else if (md.ate && ex.compassoDe(hs[cad].inicio) > md.ate) yield [ex.compassoDe(hs[cad].inicio), `a cadência em ${nomeAlvo} chega no compasso ${ex.compassoDe(hs[cad].inicio)}; o plano pede até o ${md.ate}`, [hs[cad].baixo]];
    }, { precisaTom: true, ...EXPL(
      "Modular não é passar por um acorde de outro tom (isso é tonicização): é fazer o ouvido aceitar um novo centro. Para isso o caminho de entrada precisa ser claro e o tom novo precisa de uma cadência própria.",
      "Marque nas cifras onde o tom muda (G:… ou um pivô vi=G:ii) e confirme o tom novo com V–I em estado fundamental.") });

  def("retrogressao_cifrada", "Retrogressão harmônica",
    "Depois da dominante não se volta à pré-dominante (V → IV, V → ii, vii° → IV).",
    function* (ex, ctx) {
      const hs = harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      for (let i = 1; i < hs.length; i++) {
        const a = FUNCAO[hs[i - 1].cifra.grau], b = FUNCAO[hs[i].cifra.grau];
        // exceções: dominante secundária (V43/V…) e acorde de passagem num baixo em escala (V → IV6 da regra da oitava)
        const passagem = hs[i + 1] && F.ehGrau(hs[i - 1].baixo, hs[i].baixo) && F.ehGrau(hs[i].baixo, hs[i + 1].baixo)
          && F.direcao(hs[i - 1].baixo, hs[i].baixo) === F.direcao(hs[i].baixo, hs[i + 1].baixo) && hs[i].cifra.membroBaixo > 0;
        // na troca de tom (pivô ou mudança direta) a função é lida no tom novo: não há retrogressão a comparar
        if (hs[i].cifra.secundaria || passagem || hs[i].pivo || hs[i].mudou) continue;
        if (a === "D" && b === "PD" && !hs[i - 1].cifra.seisQuatro) yield [ex.compassoDe(hs[i].inicio), `${hs[i - 1].texto} → ${hs[i].texto}: volta da dominante para a pré-dominante`, [hs[i - 1].baixo, hs[i].baixo]];
      }
    }, { precisaTom: true, ...EXPL(
      "A dominante cria a expectativa da tônica. Voltar à pré-dominante desfaz a tensão sem resolvê-la: a frase anda para trás.",
      "Depois de V, vá para I (ou vi, como cadência de engano). Se precisa de mais pré-dominante, coloque-a antes do V.") });

  def("seis_quatro", "Uso do 6/4",
    "O acorde de 6/4 só aparece como cadencial (tempo forte, sobre o 5º grau, seguido do V com o mesmo baixo) ou de passagem (baixo por grau, na mesma direção).",
    function* (ex, ctx) {
      const hs = harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      for (let i = 0; i < hs.length; i++) {
        const h = hs[i];
        if (!h.cifra.seisQuatro) continue;
        const prox = hs[i + 1], ant = hs[i - 1];
        const cadencial = prox && prox.cifra.grau === 5 && !prox.cifra.seisQuatro && prox.baixo.altura.nome === h.baixo.altura.nome && ex.forcaMetrica(h.inicio) >= ex.forcaMetrica(prox.inicio);
        const passagem = ant && prox && F.ehGrau(ant.baixo, h.baixo) && F.ehGrau(h.baixo, prox.baixo) && F.direcao(ant.baixo, h.baixo) === F.direcao(h.baixo, prox.baixo);
        const bordadura = ant && prox && ant.baixo.ps === prox.baixo.ps && ant.baixo.ps === h.baixo.ps;
        if (!(cadencial || passagem || bordadura)) yield [ex.compassoDe(h.inicio), `${h.texto} sobre ${h.baixo.nome} não é cadencial, de passagem nem de bordadura`, [h.baixo]];
      }
    }, { precisaTom: true, ...EXPL(
      "A 4ª contra o baixo torna o 6/4 instável: ele só funciona quando a 6ª e a 4ª resolvem (cadencial) ou quando o baixo está só de passagem.",
      "Use o 6/4 no tempo forte sobre o 5º grau, seguido do V com o mesmo baixo (6/4–5/3), ou entre duas harmonias da mesma função com o baixo em escala.") });

  def("cadencias_do_plano", "Cadências do plano",
    "A semicadência termina num V em estado fundamental; a cadência perfeita faz V(7) → I, os dois em estado fundamental, com a tônica na melodia.",
    function* (ex, ctx) {
      const hs = harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const pl = ctx.plano || {};
      const C = ex.duracaoCompasso;
      if (pl.semicadencia) {
        const fimC = pl.semicadencia * C;
        const h = hs.filter((x) => x.inicio < fimC).pop();
        if (h && h.fim >= fimC && !(h.cifra.grau === 5 && h.cifra.membroBaixo === 0 && !h.cifra.setima)) {
          yield [pl.semicadencia, `o compasso ${pl.semicadencia} termina em ${h.texto}; a semicadência pede V em estado fundamental (sem 7ª)`, [h.baixo]];
        }
      }
      if (pl.cadencia) {
        const ult = hs[hs.length - 1], pen = hs[hs.length - 2];
        if (ult && ex.compassoDe(ult.inicio) >= pl.cadencia) {
          const mel = ex.vozes[0].notas;
          const fim = mel[mel.length - 1];
          const ok = ult.cifra.grau === 1 && ult.cifra.membroBaixo === 0 && pen && pen.cifra.grau === 5 && pen.cifra.membroBaixo === 0 && fim && fim.altura.nome === ult.tom.tonica.nome
            && (pl.tomFinal ? ult.tom.tonica.nome === M.interpretarTom(pl.tomFinal).tonica.nome : ult.tom.tonica.nome === ex.tonalidade.tonica.nome);
          if (!ok) yield [ex.compassoDe(ult.inicio), `a cadência final não é autêntica perfeita (${pen ? pen.texto : "?"} → ${ult.texto}, melodia em ${fim ? fim.nome : "?"})`, [ult.baixo]];
        }
      }
    }, { precisaTom: true, ...EXPL(
      "A cadência é o que dá forma à frase: a semicadência abre (pede continuação), a perfeita fecha. Com o acorde invertido ou a melodia fora da tônica, o fechamento fica fraco.",
      "Semicadência: termine num V em fundamental, de preferência vindo de uma pré-dominante. Cadência perfeita: V(7) em fundamental → I em fundamental, com a melodia chegando à tônica.") });

  def("ritmo_harmonico", "Ritmo harmônico acelera para a cadência",
    "Os compassos antes da cadência têm mais mudanças de acorde que o começo da frase.",
    function* (ex, ctx) {
      const pl = ctx.plano && ctx.plano.acelerar;
      if (!pl) return;
      const hs = harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const C = ex.duracaoCompasso;
      const mudancas = (de, ate) => {
        let n = 0;
        for (let i = 0; i < hs.length; i++) {
          const c = ex.compassoDe(hs[i].inicio);
          if (c >= de && c <= ate && (i === 0 || hs[i].texto !== hs[i - 1].texto)) n++;
        }
        return n / (ate - de + 1);
      };
      const [[a1, a2], [b1, b2]] = pl;
      if (hs.length && hs[hs.length - 1].fim >= b2 * C && mudancas(b1, b2) <= mudancas(a1, a2)) {
        yield [b2, `ritmo harmônico: ${mudancas(a1, a2).toFixed(1)} acorde(s) por compasso em ${a1}–${a2} e ${mudancas(b1, b2).toFixed(1)} em ${b1}–${b2}; ele deveria acelerar`, []];
      }
    }, { precisaTom: true, ...EXPL(
      "A aceleração do ritmo harmônico é um dos sinais mais fortes de que a cadência se aproxima. Com o mesmo ritmo do começo ao fim, a cadência 'não chega'.",
      "Deixe o começo com um acorde por compasso (ou menos) e use dois ou mais nos compassos antes da cadência (por exemplo I6 – ii6 | V64 – V | I).") });

  // ------------------------------------------------------------ notas com destino (7ª, sensível, +6, N)

  /* Acordes cifrados agrupados: notas seguidas do baixo com a mesma cifra no mesmo tom são um acorde só.
   * [{ cifra (null se não se lê), tom, texto, inicio, fim, membros, notas (Set, as duas leituras no pivô), baixo, pivo }] */
  const cacheAcordes = new WeakMap(); // ex → { cifras, grupos }: as regras de destino leem a mesma lista
  function acordesCifrados(ex, ctx) {
    const c = cacheAcordes.get(ex);
    if (c && c.cifras === ctx.cifras) return c.grupos;
    const grupos = [];
    for (const h of harmoniasCifradas(ex, ctx)) {
      const ult = grupos[grupos.length - 1];
      // sem cifra ainda (o aluno não escreveu): o acorde anterior continua; cifra que não se lê (rótulo
      // de exemplo, como "It (♯4 no baixo)"): um acorde desconhecido, que separa os vizinhos
      if (!h.cifra) {
        if (!h.texto) { if (ult) ult.fim = h.fim; }
        else grupos.push({ cifra: null, texto: h.texto, inicio: h.inicio, fim: h.fim, baixo: h.baixo, membros: [], notas: new Set() });
        continue;
      }
      if (ult && ult.cifra && ult.texto === h.texto && ult.tom === h.tom && !h.mudou) { ult.fim = h.fim; continue; }
      grupos.push({ cifra: h.cifra, tom: h.tom, texto: h.texto, inicio: h.inicio, fim: h.fim, membros: membros(h.cifra, h.tom), notas: h.notas, baixo: h.baixo, pivo: !!h.pivo });
    }
    cacheAcordes.set(ex, { cifras: ctx.cifras, grupos });
    return grupos;
  }

  /* Para cada acorde que tem notas com destino (ex.: a 7ª), olha as vozes externas na troca para o acorde
   * seguinte: se a nota soa no fim do acorde e não pertence ao próximo, ela tem de cumprir o destino na
   * próxima nota diferente da voz; notas fora do acorde seguinte (ornamentos) podem vir antes, mas a
   * primeira nota do acorde seguinte que a voz alcança tem de ser o destino.
   * Pivôs ficam de fora: a função da nota depende da leitura.
   * destinos(acorde, próximo, k, acordes) → [{ nome, ok(de, para), papel?, soCima?, soBaixo? }] */
  function* conferirDestinos(ex, ctx, destinos, mensagem) {
    if (ex.vozes.length < 2) return;
    const gs = acordesCifrados(ex, ctx);
    const cima = ex.vozes[0], baixo = ex.vozes[ex.vozes.length - 1];
    for (let k = 0; k + 1 < gs.length; k++) {
      const g = gs[k], prox = gs[k + 1];
      if (!g.cifra || !prox.cifra || g.pivo || prox.pivo) continue;
      for (const d of destinos(g, prox, k, gs)) {
        if (prox.notas.has(d.nome)) continue; // nota comum: segue no acorde seguinte
        for (const v of d.soCima ? [cima] : d.soBaixo ? [baixo] : [cima, baixo]) {
          const n = v.soandoEm(prox.inicio - 1);
          if (!n || n.altura.nome !== d.nome) continue;
          const seguintes = v.notas.slice(v.notas.indexOf(n) + 1).filter((x) => x.ps !== n.ps);
          if (!seguintes.length) continue; // a voz termina na nota (o fim fica para as regras de cadência)
          const depois = seguintes[0];
          let cumpriu = d.ok(n, depois);
          for (const x of seguintes) {
            if (cumpriu || x.inicio >= prox.fim) break;
            if (d.ok(n, x)) cumpriu = true;
            else if (prox.notas.has(x.altura.nome)) break; // chegou a uma nota do acorde que não é o destino
          }
          if (!cumpriu) yield [ex.compassoDe(depois.inicio), mensagem(v, d, n, depois, g, prox), [n, depois]];
        }
      }
    }
  }
  const semitom = (a, b, dir) => b.ps - a.ps === dir && F.ehGrau(a, b);
  const nomeVoz = (ex, v) => (v === ex.vozes[0] ? "voz de cima" : "baixo");

  // a 7ª do acorde (antes só no capítulo de sétimas, web/livro/setimas.js; agora em todos os perfis tonais)
  // dois acordes seguidos são "o mesmo" (só muda a inversão): a 7ª pode trocar de voz antes de resolver
  function mesmoAcorde(a, b) {
    if (!a.cifra || !b.cifra || a.tom !== b.tom) return false;
    const x = a.cifra, y = b.cifra;
    return x.grau === y.grau && x.maior === y.maior && x.qualidade === y.qualidade && x.alteracao === y.alteracao && y.setima
      && !!x.secundaria === !!y.secundaria && (!x.secundaria || x.secundaria.alvo === y.secundaria.alvo);
  }

  def("set_setima", "A 7ª do acorde desce por grau",
    "Em qualquer acorde de sétima (V7, V65, ii65, vii°7, IV7…), a voz externa que tem a 7ª do acorde no fim dele desce um grau (ou um semitom cromático) quando a harmonia muda; pode ficar se for nota do acorde seguinte. Licença: no V43 → I6, com o baixo subindo por grau, a 7ª pode subir em 10ªs paralelas com ele.",
    function* (ex, ctx) {
      if (!ex.tonalidade || !ctx.cifras) return;
      const hs = harmoniasCifradas(ex, ctx);
      for (let k = 0; k < hs.length; k++) {
        const h = hs[k];
        if (!h.cifra || !h.cifra.setima || h.cifra.aumentada || h.cifra.nona) continue;
        const prox = hs[k + 1];
        if (prox && mesmoAcorde(h, prox)) continue; // V7 → V65: a resolução fica para depois
        if (h.pivo || (prox && prox.pivo)) continue; // no pivô a função da nota depende da leitura
        const sete = membros(h.cifra, h.tom)[3];
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
          // nota comum com o acorde seguinte (ex.: a 7ª diminuta de nota comum, #ii°42 → I): pode ficar
          if (seg.ps === n.ps && prox && prox.notas && prox.notas.has(n.altura.nome)) continue;
          // resolução adiada: a 7ª fica (ligada ou repetida) sobre o acorde seguinte, como um 4–3, e desce
          // por grau ainda dentro dele
          if (seg.ps === n.ps && prox) {
            let fimProx = prox.fim;
            for (let j = k + 2; hs[j] && hs[j].texto === prox.texto; j++) fimProx = hs[j].fim;
            const depois = v.notas.slice(v.notas.indexOf(n) + 1).find((x) => x.ps !== n.ps);
            if (depois && depois.inicio < fimProx && F.direcao(n, depois) < 0 && (F.ehGrau(n, depois) || n.ps - depois.ps === 1)) continue;
          }
          if (seg === n) { yield [c, `${v.nome}: a 7ª de ${h.texto} (${n.nome}) fica presa no acorde seguinte em vez de descer`, [n]]; continue; }
          // desce um grau, ou um semitom cromático (ré → ré♭, no cromatismo linear)
          if (F.direcao(n, seg) < 0 && (F.ehGrau(n, seg) || n.ps - seg.ps === 1)) continue;
          // licença: V43 → I6 com o baixo subindo por grau e a 7ª subindo junto, em 10ªs
          const b0 = h.baixo, b1 = prox && prox.baixo;
          const licenca = prox && prox.cifra && h.cifra.grau === 5 && h.cifra.membroBaixo === 2 && !h.cifra.secundaria
            && prox.cifra.grau === 1 && prox.cifra.membroBaixo === 1 && i < ex.vozes.length - 1
            && F.ehGrau(n, seg) && F.direcao(n, seg) > 0 && b1 && F.ehGrau(b0, b1) && F.direcao(b0, b1) > 0;
          if (licenca) continue;
          // licença: vii°7/V → I6/4 cadencial no maior, a 7ª sobe meio tom cromático à 3ª do I (mi♭ → mi em dó)
          const sec = h.cifra.secundaria;
          if (sec && sec.tipo === 7 && sec.alvo === 5 && prox && prox.cifra && prox.cifra.seisQuatro && prox.cifra.grau === 1
            && h.tom.modo !== "minor" && seg.ps - n.ps === 1 && seg.altura.letra === n.altura.letra) continue;
          yield [c, `${v.nome}: ${n.nome} é a 7ª de ${h.texto} e devia descer um grau, mas vai para ${seg.nome}`, [n, seg]];
        }
      }
    }, { precisaTom: true,
      porque: "A 7ª é a dissonância que define o acorde de sétima: ela nasceu como retardo ou nota de passagem descendente, e o ouvido continua esperando que ela caia. Se ela salta ou fica parada, a tensão não se desfaz — ou se desfaz numa voz que o ouvinte não está seguindo.",
      corrigir: "Ache a 7ª do acorde (V7: o 4º grau; ii7: o 1º; vii°7: o 6º abaixado) e faça a voz que a tem descer um grau no acorde seguinte. Se a nota de resolução dobraria o baixo de forma ruim, troque a voz que tem a 7ª ou a inversão do acorde." });

  // sensível de um acorde de função dominante (V, vii°, e as secundárias): [sensível, alvo]
  function sensivelDe(g) {
    const c = g.cifra;
    if (c.aumentada || c.napolitana || c.alteracao) return null;
    if (c.secundaria) return c.secundaria.tipo === 5 ? g.membros[1] : g.membros[0];
    if (c.grau === 5 && c.maior && (!c.qualidade || c.qualidade === "+")) return g.membros[1];
    if (c.grau === 7 && (c.qualidade === "°" || c.qualidade === "ø")) return g.membros[0];
    return null;
  }
  // o acorde seguinte é a resolução: "alvo" (tem a nota alvo como fundamental), "engano" (V → vi) ou nada
  function resolveEm(g, prox, alvo) {
    if (prox.membros[0] === alvo) return "alvo";
    return !g.cifra.secundaria && g.cifra.grau === 5 && prox.cifra.grau === 6 && !prox.cifra.alteracao && prox.tom === g.tom ? "engano" : null;
  }

  /* Obrigação da sensível na troca g → prox: null (não há) ou { lt, ok, engano }.
   * Sem obrigação: o acorde seguinte não é a resolução; o I6/4 cadencial (ainda é dominante: a obrigação
   * passa para o V depois dele); e o V que fecha a semicadência (a frase termina nele). */
  function obrigacaoDaSensivel(ex, ctx, g, prox) {
    const lt = sensivelDe(g);
    if (!lt || (prox.cifra.seisQuatro && prox.cifra.grau === 1)) return null;
    const sc = ctx.plano && ctx.plano.semicadencia;
    if (sc && g.fim === sc * ex.duracaoCompasso) return null;
    const alvo = F.transpor(M.lerAltura(lt.replace(/-/g, "b") + "4"), 1, 1).nome;
    const res = resolveEm(g, prox, alvo);
    if (!res) return null;
    // cadeia de dominantes (V7/ii → V7/V, V7/V → V7): a sensível desce cromaticamente e vira a 7ª do seguinte
    const cromatica = (a, b) => prox.cifra.setima && a.ps - b.ps === 1 && a.altura.letra === b.altura.letra && b.altura.nome === prox.membros[3];
    return { lt, ok: (a, b) => semitom(a, b, 1) || cromatica(a, b), engano: res === "engano" };
  }
  /* a resolução é uma cadência: acorde de chegada em estado fundamental no compasso da cadência do plano
   * ou depois; sem plano (exemplos da aula), o último acorde. Com plano, o último acorde escrito de um
   * exercício pela metade não conta como cadência. */
  const ehCadencia = (ex, ctx, prox, k, gs) => prox.cifra.membroBaixo === 0
    && (ctx.plano && ctx.plano.cadencia ? ex.compassoDe(prox.inicio) >= ctx.plano.cadencia : k + 2 === gs.length);

  def("sensivel_sobe", "A sensível sobe",
    "A sensível de um acorde de dominante (V, vii°, V/x, vii°/x) sobe meio tom quando ele resolve no acorde alvo: no baixo sempre (V6 → I), na voz de cima na cadência (inclusive a de engano, V → vi).",
    function* (ex, ctx) {
      yield* conferirDestinos(ex, ctx,
        (g, prox, k, gs) => {
          const o = obrigacaoDaSensivel(ex, ctx, g, prox);
          if (!o) return [];
          const cad = ehCadencia(ex, ctx, prox, k, gs);
          // na cadência de engano só a voz de cima tem obrigação (o baixo em V6 → vi desce na escala)
          if (o.engano) return cad ? [{ nome: o.lt, ok: o.ok, soCima: true }] : [];
          return [{ nome: o.lt, ok: o.ok, soBaixo: !cad }];
        },
        (v, d, n, depois, g, prox) => `${nomeVoz(ex, v)}: ${n.nome} é a sensível de ${g.texto} e vai para ${depois.nome} em ${prox.texto}; ela devia subir meio tom`);
    }, { precisaTom: true, ...EXPL(
      "A sensível fica meio tom abaixo da nota alvo e é o que faz a dominante soar como dominante. No baixo e na voz de cima da cadência, quando ela não sobe, o ouvido percebe a resolução frustrada e a cadência perde a força.",
      "Leve a sensível meio tom acima (si → dó em dó maior; dó♯ → ré no V/ii). No baixo, V6 → I: o baixo sobe da sensível à tônica.") });

  def("sensivel_frustrada", "Sensível frustrada na voz de cima",
    "No meio da frase, a sensível na voz de cima que não sobe para a nota alvo (salta para o 5º ou o 3º grau).",
    function* (ex, ctx) {
      yield* conferirDestinos(ex, ctx,
        (g, prox, k, gs) => {
          const o = obrigacaoDaSensivel(ex, ctx, g, prox);
          return o && !o.engano && !ehCadencia(ex, ctx, prox, k, gs) ? [{ nome: o.lt, ok: o.ok, soCima: true }] : [];
        },
        (v, d, n, depois, g, prox) => `voz de cima: ${n.nome} é a sensível de ${g.texto} e vai para ${depois.nome} em ${prox.texto}, sem subir`);
    }, { precisaTom: true, ...EXPL(
      "Na escrita a duas vozes ao piano, a sensível que salta para baixo no meio da frase é comum: a resolução fica implícita numa voz interna. Mas a voz de cima é a que se ouve, e a sensível que não sobe enfraquece a chegada.",
      "Se quer a chegada clara, leve a sensível meio tom acima. Se o salto é a ideia da melodia, deixe: aqui não é erro.") });

  def("sensivel_dupla", "Sensível dobrada",
    "No ataque de um acorde de dominante (ou na entrada da voz de cima nele), a sensível não está nas duas vozes ao mesmo tempo.",
    function* (ex, ctx) {
      if (ex.vozes.length < 2) return;
      const sup = ex.vozes[0], bai = ex.vozes[ex.vozes.length - 1];
      for (const g of acordesCifrados(ex, ctx)) {
        const lt = g.cifra && sensivelDe(g);
        if (!lt) continue;
        // no ataque do acorde (ou na entrada da voz de cima, se ela estava em pausa): numa diminuição,
        // a sensível que passa depois, no meio do acorde, não é dobramento
        const entrada = sup.soandoEm(g.inicio) ? g.inicio : (sup.notas.find((n) => n.inicio > g.inicio && n.inicio < g.fim) || {}).inicio;
        if (entrada === undefined) continue;
        const a = sup.soandoEm(entrada), b = bai.soandoEm(entrada);
        if (a && b && a.altura.nome === lt && b.altura.nome === lt) yield [ex.compassoDe(entrada), `${lt} (sensível de ${g.texto}) nas duas vozes`, [a, b]];
      }
    }, { precisaTom: true, ...EXPL(
      "A sensível tem um destino só. Dobrada, as duas vozes sobem juntas para a mesma nota: 8ªs paralelas, ou uma delas não resolve.",
      "Deixe a sensível numa voz só e dobre a fundamental ou a 5ª do acorde.") });

  def("aumentada_resolve", "A sexta aumentada se abre na 8ª",
    "Nas vozes externas, o ♭6 da sexta aumentada desce meio tom e o ♯4 sobe meio tom, os dois para o 5º grau.",
    function* (ex, ctx) {
      yield* conferirDestinos(ex, ctx,
        (g) => (g.cifra.aumentada ? [
          { nome: g.membros[0], ok: (a, b) => semitom(a, b, -1), papel: "♭6" },
          { nome: g.membros[g.membros.length - 1], ok: (a, b) => semitom(a, b, 1), papel: "♯4" },
        ] : []),
        (v, d, n, depois, g) => `${nomeVoz(ex, v)}: ${n.nome} é o ${d.papel} de ${g.texto} e vai para ${depois.nome}; devia ${d.papel === "♭6" ? "descer" : "subir"} meio tom para o 5º grau`);
    }, { precisaTom: true, ...EXPL(
      "As duas notas que formam a 6ª aumentada são sensíveis do 5º grau, uma de cada lado. O acorde só se explica pela expansão: o intervalo se abre na oitava do V.",
      "Leve o ♭6 meio tom abaixo e o ♯4 meio tom acima (lá♭ → sol e fá♯ → sol, em dó). Se vier o I6/4 cadencial antes do V, elas já chegam ao 5º grau nele.") });

  def("napolitana_resolve", "O ♭2 da napolitana desce",
    "Na voz de cima, o 2º grau abaixado da napolitana desce no máximo uma 3ª (à sensível, por 3ª diminuta, ou passando pela tônica).",
    function* (ex, ctx) {
      yield* conferirDestinos(ex, ctx,
        // só na voz de cima: no baixo, o ♭2 é a napolitana em estado fundamental, que salta para o 5º grau
        // desce no máximo uma 3ª (à tônica ou, por 3ª diminuta, à sensível)
        (g) => (g.cifra.napolitana ? [{ nome: g.membros[0], ok: (a, b) => F.direcao(a, b) < 0 && a.ps - b.ps <= 4, soCima: true }] : []),
        (v, d, n, depois, g) => `${nomeVoz(ex, v)}: ${n.nome} é o ♭2 de ${g.texto} e vai para ${depois.nome}; ele devia descer`);
    }, { precisaTom: true, ...EXPL(
      "O ♭2 é uma inflexão para baixo: ele puxa para a tônica e para a sensível. Subindo, ele soa como uma nota errada do 2º grau natural.",
      "Leve o ♭2 para baixo: direto à sensível (ré♭ → si, 3ª diminuta, em dó) ou passando pela tônica (ré♭ → dó → si).") });

  // ------------------------------------------------------------ métrica da harmonia

  // chegada de um acorde: se um I6/4 cadencial com o mesmo baixo vem logo antes, a chegada é a do 6/4
  function chegada(gs, k) {
    const g = gs[k], ant = gs[k - 1];
    return ant && ant.cifra && ant.cifra.seisQuatro && ant.cifra.grau === 1 && ant.baixo.altura.nome === g.baixo.altura.nome ? ant.inicio : g.inicio;
  }

  def("cadencia_tempo_forte", "Cadência no tempo forte",
    "O I da cadência final e o V da semicadência chegam num tempo forte (o 1º tempo, ou o meio do compasso nos compassos de 2 e 4 tempos); com o 6/4 cadencial, conta a chegada do 6/4.",
    function* (ex, ctx) {
      const pl = ctx.plano || {};
      if (!pl.cadencia && !pl.semicadencia) return;
      const gs = acordesCifrados(ex, ctx);
      const C = ex.duracaoCompasso;
      const fraco = (t) => ex.forcaMetrica(t) < 2;
      if (pl.semicadencia) {
        const k = gs.findIndex((g) => g.inicio < pl.semicadencia * C && g.fim >= pl.semicadencia * C);
        const g = gs[k];
        if (g && g.cifra && g.cifra.grau === 5 && !g.cifra.secundaria && fraco(chegada(gs, k))) {
          yield [ex.compassoDe(g.inicio), `o V da semicadência chega num tempo fraco (compasso ${ex.compassoDe(g.inicio)}); a chegada da frase pede o tempo forte`, [g.baixo]];
        }
      }
      if (pl.cadencia && gs.length) {
        const k = gs.length - 1, g = gs[k];
        if (g.cifra && ex.compassoDe(g.inicio) >= pl.cadencia && g.cifra.grau === 1 && g.cifra.membroBaixo === 0 && fraco(g.inicio)) {
          yield [ex.compassoDe(g.inicio), `o I final chega num tempo fraco (compasso ${ex.compassoDe(g.inicio)}); a cadência pede o tempo forte`, [g.baixo]];
        }
      }
    }, { precisaTom: true, ...EXPL(
      "A cadência é a chegada da frase, e a chegada se ouve no tempo forte. No tempo fraco ela soa adiantada ou de passagem, e o fim da frase fica mole.",
      "Desloque a harmonia para que o I final (ou o V da semicadência) caia no 1º tempo: alongue um acorde anterior ou comece a frase em anacruse.") });

  // mesmo acorde sobre o mesmo baixo, com ou sem a 7ª acrescentada (V → V7); trocar a inversão (I → I6)
  // move o baixo e marca a barra, então não conta
  function mesmaHarmonia(a, b) {
    const x = a.cifra, y = b.cifra;
    if (!x || !y) return false;
    return a.tom === b.tom && a.baixo.altura.nome === b.baixo.altura.nome && x.grau === y.grau && x.maior === y.maior && (x.alteracao || 0) === (y.alteracao || 0)
      && !!x.aumentada === !!y.aumentada && !!x.napolitana === !!y.napolitana && !x.seisQuatro && !y.seisQuatro
      && (!x.secundaria) === (!y.secundaria) && (!x.secundaria || x.secundaria.alvo === y.secundaria.alvo);
  }

  def("harmonia_sincopada", "Harmonia sincopada",
    "O mesmo acorde, sobre o mesmo baixo, começa depois do 1º tempo e continua no 1º tempo do compasso seguinte. Não vale para o acorde inicial (anacruse) nem para o final, para a troca de inversão nem sobre um pedal.",
    function* (ex, ctx) {
      const gs = acordesCifrados(ex, ctx);
      const C = ex.duracaoCompasso;
      for (let k = 1; k < gs.length; k++) {
        if (!gs[k].cifra) continue;
        let fim = gs[k].fim, j = k;
        while (gs[j + 1] && mesmaHarmonia(gs[k], gs[j + 1])) fim = gs[++j].fim;
        const ini = gs[k].inicio, barra = (Math.floor(ini / C) + 1) * C;
        // o acorde anterior já era o mesmo (só acontece com o acorde inicial em anacruse): não é síncope
        const continua = mesmaHarmonia(gs[k - 1], gs[k]);
        // pedal: o acorde vizinho (antes ou depois) está sobre o mesmo baixo (I – IV6/4 – I, V – #vi°42 – V)
        const mesmoBaixo = (g) => g && g.baixo.altura.nome === gs[k].baixo.altura.nome;
        const pedal = mesmoBaixo(gs[k - 1]) || mesmoBaixo(gs[j + 1]);
        // o acorde final fica com cadencia_tempo_forte (sem aviso duplo)
        const final = j === gs.length - 1;
        // qualquer tempo mais fraco que a barra (inclusive o 3º do 4/4) que atravessa o 1º tempo
        if (!continua && !pedal && !final && ex.forcaMetrica(ini) < ex.forcaMetrica(barra) && barra < fim) {
          yield [ex.compassoDe(barra), `${gs[k].texto} começa depois do 1º tempo do compasso ${ex.compassoDe(ini)} e continua no 1º tempo do ${ex.compassoDe(barra)}`, [gs[k].baixo]];
        }
        k = j;
      }
    }, { precisaTom: true, ...EXPL(
      "A troca de acorde marca o tempo forte. Quando o acorde chega no tempo fraco e fica no forte, o ouvido ouve a barra de compasso no lugar errado: a métrica balança.",
      "Troque o acorde no 1º tempo (ou repita o do tempo fraco só até a barra e mude nela). Se a síncope é proposital (hemíola, pedal), deixe: é só aviso.") });

  // ------------------------------------------------------------ esquemas

  def("esquema", "Esquema galante",
    "Nas etapas do esquema, o baixo e o soprano estão nos graus previstos.",
    function* (ex, ctx) {
      if (!ctx.esquemas || !ex.tonalidade) return;
      const sop = ex.vozes[0], bai = ex.vozes[ex.vozes.length - 1];
      for (const e of ctx.esquemas) {
        const n = Math.max(e.baixo.length, e.soprano.length);
        for (let k = 0; k < n; k++) {
          const t = (e.inicio + k * e.etapa) * T;
          const c = ex.compassoDe(t);
          for (const [voz, graus, nomeVoz] of [[bai, e.baixo, "baixo"], [sop, e.soprano, "soprano"]]) {
            const g = graus[k];
            if (g === undefined || g === null) continue;
            const nt = voz.soandoEm(t);
            if (!nt) continue;
            const real = R2.grauDe(nt.altura, ex.tonalidade);
            const esperado = Math.abs(g);
            if (real !== esperado) yield [c, `${e.nome}, etapa ${k + 1}: o ${nomeVoz} devia estar no ${esperado}º grau e está em ${nt.nome} (${real}º)`, [nt]];
          }
        }
      }
    }, { precisaTom: true, ...EXPL(
      "Um esquema é reconhecido pelos graus do baixo e do soprano em cada etapa. Fora dos graus, o molde se desfaz e o ouvinte não reconhece a fórmula.",
      "Coloque o baixo e o soprano nos graus indicados no começo de cada etapa; o que vem entre as etapas é livre (diminuição).") });

  // ------------------------------------------------------------ esqueleto e restrições

  def("esqueleto_preservado", "O esqueleto continua lá",
    "Nos tempos marcados, a voz elaborada mantém as notas do esqueleto de 1ª espécie.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v || !ctx.esqueleto) return;
      for (const [t0, alt] of ctx.esqueleto) {
        const t = t0 * T;
        const n = v.soandoEm(t);
        if (!n) continue;
        if (n.ps !== M.lerAltura(alt).ps) yield [ex.compassoDe(t), `no tempo forte do compasso ${ex.compassoDe(t)} o esqueleto pede ${alt}, e a voz tem ${n.nome}`, [n]];
      }
    }, EXPL(
      "Elaborar é decorar uma estrutura, não trocá-la. Se as notas estruturais mudam, você escreveu outro contraponto — e perde o controle que a 1ª espécie garantia.",
      "Mantenha a nota do esqueleto no tempo forte e use os tempos fracos para chegar à próxima (passagem, bordadura, salto consonante)."));

  def("climax_no_lugar", "Clímax no compasso pedido",
    "A nota mais aguda da voz do aluno é única e cai no compasso definido pelo exercício.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v || !v.notas.length || !ctx.climax) return;
      const top = Math.max(...v.notas.map((n) => n.ps));
      const cumes = v.notas.filter((n) => n.ps === top);
      const c = ex.compassoDe(cumes[0].inicio);
      if (cumes.length > 1 || c !== ctx.climax.compasso) yield [c, `o ponto mais agudo (${cumes[0].nome}) ${cumes.length > 1 ? "aparece " + cumes.length + " vezes" : "está no compasso " + c}; o exercício pede um clímax único no compasso ${ctx.climax.compasso}`, cumes];
    }, EXPL(
      "Colocar o clímax num lugar fixo obriga a planejar a subida e a descida inteiras em função dele.",
      "Decida a nota do clímax e o caminho até ela: antes do compasso pedido, fique abaixo dela; depois, desça sem voltar a ela."));

  def("perfeitas_no_meio", "Poucas consonâncias perfeitas no meio",
    "Entre o primeiro e o último compasso, no máximo o número de 5ªs e 8ªs (nos tempos fortes) que o exercício permite.",
    function* (ex, ctx) {
      if (ctx.maxPerfeitas === undefined || ex.vozes.length < 2) return;
      const ms = F.momentos(ex, 0, ex.vozes.length - 1).filter((m) => m.completo && ex.ehTempoForte(m.t));
      const meio = ms.slice(1, -1).filter((m) => F.classePerfeita(F.harmonico(m.sup, m.inf)));
      if (meio.length > ctx.maxPerfeitas) yield [ex.compassoDe(meio[meio.length - 1].t), `${meio.length} consonâncias perfeitas no meio; o máximo aqui é ${ctx.maxPerfeitas}`, meio.flatMap((m) => [m.sup, m.inf])];
    }, EXPL(
      "Cada 5ª ou 8ª soa como uma pequena chegada. Limitando-as, você é obrigado a sustentar o fluxo com 3ªs e 6ªs e a guardar as perfeitas para os pontos que merecem.",
      "Troque algumas 5ªs e 8ªs por 3ªs ou 6ªs; mantenha a perfeita onde quer marcar uma articulação."));

  def("figuras_obrigatorias", "Figuras pedidas",
    "O exercício pede o uso de certas figuras (cambiata, bordadura dupla).",
    function* (ex, ctx) {
      if (!ctx.figuras) return;
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v) return;
      const ns = v.notas;
      const achou = { cambiata: false, bordadura_dupla: false };
      for (let i = 0; i + 3 < ns.length; i++) {
        const [a, b, c, d] = ns.slice(i, i + 4);
        if (a.ps === d.ps && F.ehGrau(a, b) && F.ehGrau(a, c) && F.direcao(a, b) === -F.direcao(a, c) && F.direcao(a, b) !== 0) achou.bordadura_dupla = true;
        if (F.ehGrau(a, b) && F.direcao(a, b) < 0 && F.intervalo(b, c).direcionado === -3 && F.ehGrau(c, d) && F.direcao(c, d) > 0) achou.cambiata = true;
      }
      const nomes = { cambiata: "cambiata", bordadura_dupla: "bordadura dupla" };
      for (const f of ctx.figuras) if (!achou[f]) yield [ex.compassoDe(ns.length ? ns[ns.length - 1].inicio : 0), `falta usar a ${nomes[f]}`, []];
    }, EXPL(
      "Usar a figura de propósito, no lugar certo, é o que a transforma de regra em vocabulário.",
      "Cambiata: desça por grau até uma dissonância, salte uma 3ª para baixo e suba por grau. Bordadura dupla: nota – vizinha de um lado – vizinha do outro – nota."));

  def("dissonancias_minimas", "Dissonâncias de passagem",
    "O exercício pede um número mínimo de dissonâncias nos tempos fracos.",
    function* (ex, ctx) {
      if (!ctx.minDissonancias) return;
      const d = F.dissonancias(ex).filter((x) => x.tipo === "ataque" && !ex.ehTempoForte(x.t));
      if (d.length < ctx.minDissonancias) yield [ex.compassoDe(ex.fim - 1), `${d.length} dissonância(s) no tempo fraco; o exercício pede pelo menos ${ctx.minDissonancias}`, []];
    }, EXPL(
      "A dissonância de passagem dá impulso: ela é o que faz a linha andar de uma consonância à outra. Evitá-la sempre deixa o contraponto pálido.",
      "Nos tempos fracos, onde duas notas consonantes estão a uma 3ª, preencha com a nota do meio."));

  def("retardos_minimos", "Retardos",
    "O exercício pede um número mínimo de retardos: dissonâncias presas (ligadas) no tempo forte.",
    function* (ex, ctx) {
      if (!ctx.minRetardos) return;
      const d = F.dissonancias(ex).filter((x) => x.tipo !== "ataque" && ex.ehTempoForte(x.t));
      if (d.length < ctx.minRetardos) yield [ex.compassoDe(ex.fim - 1), `${d.length} retardo(s); o exercício pede pelo menos ${ctx.minRetardos}`, []];
    }, EXPL(
      "Sem retardos a 4ª espécie vira só um deslocamento rítmico: a síncope é o meio, a dissonância controlada no tempo forte é o que ela produz.",
      "Procure pontos em que o cantus desce ou sobe por grau sob a sua nota ligada: ali a nota presa vira 7ª (em cima) ou 2ª (embaixo) e resolve descendo."));

  def("baixo_por_grau", "Baixo melódico",
    "O baixo anda sobretudo por grau (inversões), com poucos saltos fora da cadência.",
    function* (ex, ctx) {
      if (ctx.maxSaltosBaixo === undefined) return;
      const b = ex.vozes[ex.vozes.length - 1];
      const pares = b.paresMelodicos().slice(0, -1); // a queda 5→1 final não conta
      const saltos = pares.filter(([x, y]) => F.ehSalto(x, y));
      if (saltos.length > ctx.maxSaltosBaixo) yield [ex.compassoDe(saltos[saltos.length - 1][1].inicio), `o baixo tem ${saltos.length} saltos; o máximo aqui é ${ctx.maxSaltosBaixo}`, saltos.flat()];
    }, EXPL(
      "Um baixo só de fundamentais pula o tempo todo e soa como acompanhamento. Com inversões ele vira uma segunda melodia, e a harmonia ganha direção.",
      "Troque fundamentais por inversões que liguem por grau: I–V43–I6, I6–ii6–V, IV6–V."));

  for (const id of ["cadencia_tempo_forte", "cadencias_do_plano", "ritmo_harmonico", "climax_no_lugar", "perfeitas_no_meio", "figuras_obrigatorias", "dissonancias_minimas", "baixo_por_grau"]) M.PRECISA_FIM.add(id);
  for (const id of ["seis_quatro", "retrogressao_cifrada", "set_setima", "sensivel_sobe", "sensivel_frustrada", "aumentada_resolve", "napolitana_resolve"]) M.OLHA_ADIANTE.add(id);
  M.PRECISA_FIM.add("modulacao");

  return { lerCifra, membros, harmoniaDasCifras, harmoniasCifradas, mesmoAcorde };
});
