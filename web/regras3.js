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
  function lerCifra(s) {
    const m = /^([ivIV]+)(°|o|ø)?(7|65|6\/5|43|4\/3|42|4\/2|2|64|6\/4|6)?$/.exec(String(s).trim());
    if (!m) return null;
    const grau = NUM[m[1].toUpperCase()];
    if (!grau) return null;
    const fig = (m[3] || "").replace("/", "");
    const setima = ["7", "65", "43", "42", "2"].includes(fig);
    const membroBaixo = { "": 0, 7: 0, 6: 1, 65: 1, 64: 2, 43: 2, 42: 3, 2: 3 }[fig];
    return { grau, setima, membroBaixo, fig, texto: s.trim(), seisQuatro: fig === "64" };
  }

  function membros(c, tom) {
    const esc = R2.escala(tom);
    const nomes = [0, 2, 4, 6].map((k) => esc[(c.grau - 1 + k) % 7].nome);
    if (tom.modo === "minor" && (c.grau === 5 || c.grau === 7)) {
      const lt = F.transpor(tom.tonica, -1, -1).nome;
      const i = nomes.indexOf(esc[6].nome);
      if (i >= 0) nomes[i] = lt;
    }
    return c.setima ? nomes : nomes.slice(0, 3);
  }

  // [{ nota do baixo, cifra lida, texto, notas do acorde }]
  function harmoniasCifradas(ex, ctx) {
    const b = ex.vozes[ex.vozes.length - 1];
    if (!ctx.cifras || !ex.tonalidade || !b) return [];
    return b.notas.map((n, i) => {
      const texto = ctx.cifras[i];
      const c = texto ? lerCifra(texto) : null;
      return { baixo: n, texto, cifra: c, notas: c ? new Set(membros(c, ex.tonalidade)) : null, inicio: n.inicio, fim: n.fim };
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
        if (!h.cifra) { yield [c, `cifra "${h.texto}" não reconhecida (use I, ii6, V43, I64, V7, vii°6…)`, [h.baixo]]; continue; }
        const esperado = membros(h.cifra, ex.tonalidade)[h.cifra.membroBaixo];
        if (h.baixo.altura.nome !== esperado) yield [c, `${h.texto} pede ${esperado} no baixo, e o baixo tem ${h.baixo.nome}`, [h.baixo]];
        const m = mel.soandoEm(h.inicio);
        if (m && mel !== ex.vozes[ex.vozes.length - 1] && !h.notas.has(m.altura.nome)) {
          yield [c, `${m.nome} na melodia não pertence a ${h.texto} (${[...h.notas].join("–")})`, [m, h.baixo]];
        }
      }
    }, { precisaTom: true, ...EXPL(
      "A cifra é a sua leitura da harmonia. Se ela não bate com o baixo e com a melodia, ou o acorde não é o que você pensa, ou a nota da melodia é uma dissonância que precisa de tratamento.",
      "Confira qual membro do acorde está no baixo (fundamental = sem número, 3ª = 6, 5ª = 64; com 7ª: 7, 65, 43, 42) e troque a cifra ou a nota.") });

  def("retrogressao_cifrada", "Retrogressão harmônica",
    "Depois da dominante não se volta à pré-dominante (V → IV, V → ii, vii° → IV).",
    function* (ex, ctx) {
      const hs = harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      for (let i = 1; i < hs.length; i++) {
        const a = FUNCAO[hs[i - 1].cifra.grau], b = FUNCAO[hs[i].cifra.grau];
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
          const ok = ult.cifra.grau === 1 && ult.cifra.membroBaixo === 0 && pen && pen.cifra.grau === 5 && pen.cifra.membroBaixo === 0 && fim && fim.altura.nome === F.tonica(ex);
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

  for (const id of ["cadencias_do_plano", "ritmo_harmonico", "climax_no_lugar", "perfeitas_no_meio", "figuras_obrigatorias", "dissonancias_minimas", "baixo_por_grau"]) M.PRECISA_FIM.add(id);
  for (const id of ["seis_quatro", "retrogressao_cifrada"]) M.OLHA_ADIANTE.add(id);

  return { lerCifra, membros, harmoniaDasCifras, harmoniasCifradas };
});
