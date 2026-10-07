/* Regras da versão 2 (curso.html): cantus firmus, melodia tonal, período e baixo.
 * Cada exercício do curso escolhe quais regras usa (um "perfil"); estas não entram na tabela de
 * níveis da versão 1. O contexto (ctx) de cada exercício pode trazer:
 *   ctx.alvo      índice da voz que o aluno escreve
 *   ctx.cf        índice da voz dada (cantus firmus, melodia ou baixo)
 *   ctx.harmonia  [{ inicio, fim, grau, notas: Set de nomes }] — um acorde por trecho
 *   ctx.plano     { semicadencia: 4, final: 8, repete: [1, 5] } (compassos)
 *   ctx.motivo    { de: 1, em: [2, 3] } (compassos)
 *   ctx.graus     graus aceitos no baixo, ex.: [1, 4, 5] */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"), require("./cantus.js"));
  else raiz.Regras2 = fabrica(raiz.Motor, raiz.Cantus);
})(this, function (M, Cn) {
  "use strict";

  const F = M.ferramentas, T = M.T;
  const def = M.definirRegra;
  const nome = (n) => n.nome;
  const vozAlvo = (ex, ctx) => (ctx.alvo !== undefined ? ctx.alvo : ex.vozes.findIndex((_, i) => i !== ex.cantusFirmus));

  // ------------------------------------------------------------ tonalidade e acordes

  function escala(tom) {
    const esc = Cn.ESCALAS[tom.modo] || Cn.ESCALAS.major;
    return esc.map((s, g) => F.transpor(tom.tonica, g, s));
  }

  // grau (1–7) de uma nota na tonalidade, pela letra
  function grauDe(alt, tom) {
    return ((alt.letra - tom.tonica.letra) % 7 + 7) % 7 + 1;
  }

  const NUMERAIS = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };

  // "V", "ii6", "IV" → { grau, notas: Set de nomes }
  function acorde(simbolo, tom) {
    const m = /^([ivIV]+)/.exec(simbolo);
    const grau = NUMERAIS[m[1].toUpperCase()];
    const esc = escala(tom);
    const notas = new Set((/7/.test(simbolo) ? [0, 2, 4, 6] : [0, 2, 4]).map((k) => esc[(grau - 1 + k) % 7].nome));
    // em menor, o V e o vii° usam a sensível
    if (tom.modo === "minor" && (grau === 5 || grau === 7)) {
      notas.delete(esc[6].nome);
      notas.add(F.transpor(tom.tonica, -1, -1).nome);
    }
    return { grau, simbolo, notas };
  }

  /* ["I", "I", "IV V", "V", …] (um item por compasso; vários acordes dividem o compasso)
   * → [{ inicio, fim, grau, simbolo, notas }] */
  function harmoniaDe(acordes, tom, duracaoCompasso) {
    const r = [];
    acordes.forEach((item, c) => {
      const partes = item.trim().split(/\s+/);
      const d = duracaoCompasso / partes.length;
      partes.forEach((s, k) => r.push({ ...acorde(s, tom), inicio: c * duracaoCompasso + k * d, fim: c * duracaoCompasso + (k + 1) * d }));
    });
    return r;
  }

  const acordeEm = (ctx, t) => (ctx.harmonia || []).find((a) => a.inicio <= t && t < a.fim) || null;

  const EXPL = (porque, corrigir) => ({ porque, corrigir });

  // ------------------------------------------------------------ cantus firmus

  def("cf_final", "Começa e termina na final",
    "O cantus firmus começa e termina na nota principal do modo (a final, ou tônica).",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)], ton = F.tonica(ex);
      if (!v || !v.notas.length) return;
      const [a, z] = [v.notas[0], v.notas[v.notas.length - 1]];
      if (a.altura.nome !== ton) yield [1, `${v.nome}: começa em ${a.nome}; a final é ${ton}`, [a]];
      if (z.altura.nome !== ton) yield [ex.compassoDe(z.inicio), `${v.nome}: termina em ${z.nome}; a final é ${ton}`, [z]];
    }, { precisaTom: true, ...EXPL(
      "Começar e terminar na final é o que faz o ouvido reconhecer o modo: a melodia sai de casa e volta para ela.",
      "Troque a primeira e a última nota pela final (a tônica). Em ré dórico, por exemplo, comece e termine em ré.") });

  def("cf_chegada", "Chega à final por grau",
    "A penúltima nota é a vizinha da final (o 2º grau, ou a sensível), para a chegada ser por grau conjunto.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v || v.notas.length < 2) return;
      const [p, z] = v.notas.slice(-2);
      if (!F.ehGrau(p, z)) yield [ex.compassoDe(z.inicio), `${v.nome}: chega à final por salto (${p.nome}→${z.nome})`, [p, z]];
    }, EXPL(
      "A chegada por grau (ré→dó ou si→dó) é a fórmula de fim mais forte; por salto a final soa acidental.",
      "Faça a penúltima nota ser o 2º grau (ré em dó) e desça para a final, ou use a sensível e suba."));

  def("cf_tamanho", "Tamanho do cantus firmus",
    "Entre 8 e 14 notas: longo o bastante para ter forma, curto o bastante para ser dominado.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v || !v.notas.length) return;
      const n = v.notas.length;
      if (n < 8) yield [ex.compassoDe(v.notas[n - 1].inicio), `${v.nome}: tem ${n} notas; escreva pelo menos 8`, []];
      if (n > 14) yield [ex.compassoDe(v.notas[n - 1].inicio), `${v.nome}: tem ${n} notas; use no máximo 14`, []];
    }, EXPL(
      "Com poucas notas não há espaço para subir a um clímax e voltar; com muitas, a linha perde a forma.",
      "Ajuste para 8 a 14 notas."));

  def("notas_do_modo", "Notas do modo",
    "Cada nota pertence ao modo; a sensível (7º grau elevado) e, subindo para ela, o 6º elevado só aparecem na cadência, nos dois últimos compassos.",
    function* (ex, ctx) {
      const tom = ex.tonalidade;
      if (!tom || tom.modo === "major" || tom.modo === "ionian") return;
      const esc = escala(tom);
      const nomes = new Set(esc.map(nome));
      const lt = F.transpor(tom.tonica, -1, -1), seis = F.transpor(lt, -1, -2);
      const lista = esc.map((a) => a.nome.replace(/-/g, "b")).join(" ");
      const cf = ctx.cf !== undefined ? ctx.cf : ex.cantusFirmus;
      for (let i = 0; i < ex.vozes.length; i++) {
        const v = ex.vozes[i];
        if (i === cf || !v.notas.length) continue;
        const ultimo = ex.compassoDe(v.notas[v.notas.length - 1].inicio);
        for (const n of v.notas) {
          if (nomes.has(n.altura.nome)) continue;
          const c = ex.compassoDe(n.inicio);
          const alterada = n.altura.nome === lt.nome || n.altura.nome === seis.nome;
          const k = v.notas.indexOf(n), prox = v.notas[k + 1];
          const cadencial = c >= ultimo - 1 || (n.altura.nome === seis.nome && prox && prox.altura.nome === lt.nome);
          if (alterada && (tom.modo === "minor" || cadencial)) continue;
          yield [c, alterada
            ? `${v.nome}: ${n.nome} é a nota alterada da cadência; fora dos dois últimos compassos use a do modo (${lista})`
            : `${v.nome}: ${n.nome} não pertence a ${tom.tonica.nome.replace(/-/g, "b")} ${M.MODOS_PT[tom.modo]} (${lista})`, [n]];
        }
      }
    }, { precisaTom: true, ...EXPL(
      "O modo é definido pelas notas da escala e pela posição dos semitons em relação à final. Uma nota de fora muda o modo (ré dórico com si♭ vira ré eólio) e apaga a cor característica. A alteração da sensível é uma convenção de cadência (musica ficta), não uma nota do modo.",
      "Troque pela nota do modo indicada na linha de escala acima da partitura; deixe a sensível alterada só para a penúltima nota.") });

  def("so_semibreves", "Só semibreves",
    "O cantus firmus não tem ritmo: todas as notas são semibreves, uma por compasso.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v) return;
      const C = ex.duracaoCompasso;
      for (const n of v.notas) {
        if (n.duracao !== C || n.inicio % C !== 0) yield [ex.compassoDe(n.inicio), `${v.nome}: ${n.nome} não é uma semibreve no começo do compasso`, [n]];
      }
    }, EXPL(
      "Sem ritmo, toda a atenção fica nas alturas e nos intervalos: é isso que o cantus firmus treina.",
      "Escolha a semibreve (primeiro botão de duração) e escreva uma nota por compasso."));

  def("cf_saltos_seguidos", "Dois saltos seguidos na mesma direção",
    "No cantus firmus, dois saltos seguidos nunca vão na mesma direção (a única exceção são duas 3ªs, que formam um acorde).",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v) return;
      const ps = v.paresMelodicos();
      for (let k = 0; k + 1 < ps.length; k++) {
        const [a, b] = ps[k], [b2, c] = ps[k + 1];
        if (b !== b2 || !F.ehSalto(a, b) || !F.ehSalto(b, c) || F.direcao(a, b) !== F.direcao(b, c)) continue;
        if (F.intervalo(a, b).geral === 3 && F.intervalo(b, c).geral === 3) continue;
        yield [ex.compassoDe(c.inicio), `${v.nome}: saltos seguidos na mesma direção ${a.nome}→${b.nome}→${c.nome}`, [a, b, c]];
      }
    }, EXPL(
      "Dois saltos na mesma direção somam um intervalo grande e deixam a linha sem apoio; o ouvido perde o fio.",
      "Depois de um salto, mude de direção ou siga por grau."));

  def("cf_salto_recuperado", "Salto grande volta por grau",
    "Depois de um salto de 4ª ou maior, a melodia volta por grau conjunto, na direção contrária.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v) return;
      const ps = v.paresMelodicos();
      for (let k = 0; k + 1 < ps.length; k++) {
        const [a, b] = ps[k], [b2, c] = ps[k + 1];
        if (b !== b2 || Math.abs(b.ps - a.ps) < 5) continue;
        if (!(F.ehGrau(b, c) && F.direcao(b, c) === -F.direcao(a, b))) {
          yield [ex.compassoDe(c.inicio), `${v.nome}: depois do salto ${a.nome}→${b.nome}, volte por grau (veio ${c.nome})`, [a, b, c]];
        }
      }
    }, EXPL(
      "O salto abre um espaço vazio; voltar por grau preenche esse espaço e equilibra a linha (o 'preenchimento do salto').",
      "Depois de um salto de 4ª ou mais, a nota seguinte fica a um grau da anterior, na direção oposta."));

  def("contorno_tritono", "Trítono escondido no contorno",
    "Uma subida ou descida contínua não deve ir de fá a si (ou de si a fá): o ouvido percebe o trítono entre as pontas.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v) return;
      const ns = v.notas;
      let ini = 0;
      for (let i = 1; i < ns.length; i++) {
        const dir = F.direcao(ns[i - 1], ns[i]);
        const prox = i + 1 < ns.length ? F.direcao(ns[i], ns[i + 1]) : 0;
        if (ns[i - 1].fim !== ns[i].inicio) { ini = i; continue; }
        if (prox !== dir) {
          const iv = F.intervalo(ns[ini], ns[i]);
          if ((iv.nomeSimples === "A4" || iv.nomeSimples === "d5") && i - ini >= 2) {
            yield [ex.compassoDe(ns[i].inicio), `${v.nome}: a linha vai de ${ns[ini].nome} a ${ns[i].nome} sem mudar de direção (trítono)`, ns.slice(ini, i + 1)];
          }
          ini = i;
        }
      }
    }, EXPL(
      "Mesmo sem saltar o trítono, uma escala de fá até si deixa as duas pontas na memória, e o intervalo instável aparece.",
      "Mude de direção antes de completar o trítono, ou pare numa nota vizinha (mi ou dó)."));

  // ------------------------------------------------------------ contraponto

  def("climax_coincidente", "Clímax junto com o do cantus firmus",
    "O ponto mais agudo do contraponto não cai no mesmo compasso do ponto mais agudo do cantus firmus.",
    function* (ex, ctx) {
      const cf = ex.cantusFirmus;
      if (cf === null) return;
      const topo = (v) => { const m = Math.max(...v.notas.map((n) => n.ps)); return v.notas.filter((n) => n.ps === m); };
      const cfTopo = ex.vozes[cf].notas.length ? topo(ex.vozes[cf]) : [];
      if (cfTopo.length !== 1) return;
      const cc = ex.compassoDe(cfTopo[0].inicio);
      for (let i = 0; i < ex.vozes.length; i++) {
        if (i === cf || !ex.vozes[i].notas.length) continue;
        const t = topo(ex.vozes[i]);
        if (t.some((n) => ex.compassoDe(n.inicio) === cc)) {
          yield [cc, `os clímax das duas vozes caem juntos no compasso ${cc}`, [cfTopo[0], ...t]];
        }
      }
    }, EXPL(
      "Se as duas vozes chegam ao ponto mais alto juntas, soam como um bloco só; em momentos diferentes, cada linha tem seu próprio arco.",
      "Mova o clímax do contraponto para outro compasso (antes ou depois do clímax do cantus firmus)."));

  def("paralelas_entre_tempos", "5ªs ou 8ªs entre o tempo fraco e o forte",
    "Na 3ª espécie, uma 5ª no tempo forte não pode vir de outra 5ª nos tempos 3–4 do compasso anterior; uma 8ª, de outra 8ª nos tempos 2–4.",
    function* (ex, ctx) {
      const C = ex.duracaoCompasso;
      for (const [i, j] of F.paresDeVozes(ex, false)) {
        const ms = F.momentos(ex, i, j).filter((m) => m.completo);
        for (let k = 1; k < ms.length; k++) {
          const m2 = ms[k];
          if (!ex.ehTempoForte(m2.t)) continue;
          const classe = F.classePerfeita(F.harmonico(m2.sup, m2.inf));
          if (!classe) continue;
          const anterior = ms[k - 1];
          for (const m1 of ms) {
            if (m1 === anterior || m1.t >= m2.t || m1.t < m2.t - C) continue;
            const pos = m1.t % C;
            if (classe === "5" && pos < C / 2) continue;
            if (classe === "8" && pos === 0) continue;
            if (F.classePerfeita(F.harmonico(m1.sup, m1.inf)) !== classe) continue;
            if (m1.sup.ps === m2.sup.ps || m1.inf.ps === m2.inf.ps) continue;
            yield [ex.compassoDe(m2.t), `${ex.vozes[i].nome}/${ex.vozes[j].nome}: ${classe === "5" ? "5ª" : "8ª"} em ${m1.sup.nome}-${m1.inf.nome} e de novo no tempo forte (${m2.sup.nome}-${m2.inf.nome})`, [m1.sup, m1.inf, m2.sup, m2.inf]];
            break;
          }
        }
      }
    }, EXPL(
      "Com quatro notas por compasso, uma 5ª perto do fim do compasso e outra no tempo forte seguinte ainda soam ligadas, como paralelas.",
      "Troque o intervalo do tempo forte por uma 3ª ou 6ª, ou mude a nota que formava a 5ª (ou a 8ª) no compasso anterior."));

  // ------------------------------------------------------------ melodia tonal

  def("notas_do_acorde", "Notas do acorde nos tempos fortes",
    "Nos tempos fortes a melodia usa notas do acorde; as outras notas ficam nos tempos fracos e andam por grau (passagem ou bordadura).",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v || !ctx.harmonia) return;
      for (const n of v.notas) {
        const ac = acordeEm(ctx, n.inicio);
        if (!ac || ac.notas.has(n.altura.nome)) continue;
        if (ex.forcaMetrica(n.inicio) >= 2) {
          yield [ex.compassoDe(n.inicio), `${v.nome}: ${n.nome} no tempo forte não pertence ao acorde ${ac.simbolo} (${[...ac.notas].join("–")})`, [n]];
          continue;
        }
        const ant = v.anterior(n), prox = v.seguinte(n);
        if (!(ant && prox && F.ehGrau(ant, n) && F.ehGrau(n, prox))) {
          yield [ex.compassoDe(n.inicio), `${v.nome}: ${n.nome} está fora do acorde ${ac.simbolo} e não chega e sai por grau`, [n]];
        }
      }
    }, EXPL(
      "Os tempos fortes carregam a harmonia: se a nota do tempo forte está no acorde, o ouvido entende a progressão. Nota de fora só soa bem de passagem, por grau.",
      "Troque a nota do tempo forte por uma nota do acorde (veja as notas no enunciado). Notas de fora do acorde: no tempo fraco, entre duas notas por grau."));

  def("semicadencia", "Pergunta termina em semicadência",
    "O antecedente (a pergunta) termina no 2º, 5º ou 7º grau, sobre o acorde de dominante (V).",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      const c = ctx.plano && ctx.plano.semicadencia;
      if (!v || !c || !ex.tonalidade) return;
      const fimC = c * ex.duracaoCompasso;
      const n = v.notas.filter((x) => x.inicio < fimC).pop();
      if (!n || n.fim < fimC) return;
      const g = grauDe(n.altura, ex.tonalidade);
      if (![2, 5, 7].includes(g)) yield [c, `${v.nome}: o compasso ${c} termina no ${g}º grau (${n.nome}); a pergunta pede 2º, 5º ou 7º grau`, [n]];
    }, { precisaTom: true, ...EXPL(
      "Parar no 2º, 5º ou 7º grau, sobre a dominante, soa como pergunta: a música respira mas ainda não acabou.",
      "Faça a última nota do compasso ser ré, sol ou si (em dó maior): notas do acorde de V.") });

  def("cadencia_final", "Resposta termina na tônica",
    "O consequente (a resposta) termina na tônica, no tempo forte, vindo do 2º grau ou da sensível.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      if (!v || v.notas.length < 2 || !ex.tonalidade) return;
      const [p, z] = v.notas.slice(-2);
      const ton = F.tonica(ex);
      const c = ex.compassoDe(z.inicio);
      if (z.altura.nome !== ton) { yield [c, `${v.nome}: termina em ${z.nome}; a resposta termina na tônica ${ton}`, [z]]; return; }
      if (!ctx.finalLivre && !ex.ehTempoForte(z.inicio)) yield [c, `${v.nome}: a tônica final cai fora do tempo forte`, [z]];
      const g = grauDe(p.altura, ex.tonalidade);
      if (!(F.ehGrau(p, z) && (g === 2 || g === 7))) yield [c, `${v.nome}: a tônica final vem de ${p.nome}; use o 2º grau ou a sensível`, [p, z]];
    }, { precisaTom: true, ...EXPL(
      "A cadência perfeita termina na tônica chegando por grau (2→1 ou 7→1) no tempo forte: é o ponto final da frase.",
      "Termine com ré→dó ou si→dó (em dó maior), com o dó no primeiro tempo do último compasso.") });

  def("ideia_repetida", "A resposta começa como a pergunta",
    "No período paralelo, os dois primeiros compassos da resposta repetem (ou quase) os dois primeiros da pergunta.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      const r = ctx.plano && ctx.plano.repete;
      if (!v || !r) return;
      const C = ex.duracaoCompasso;
      const trecho = (c) => v.notas.filter((n) => n.inicio >= (c - 1) * C && n.inicio < (c + 1) * C).map((n) => [n.inicio - (c - 1) * C, n.ps]);
      const a = trecho(r[0]), b = trecho(r[1]);
      if (!b.length) return;
      const iguais = b.filter(([t, ps]) => a.some(([t2, ps2]) => t2 === t && ps2 === ps)).length;
      if (iguais / Math.max(a.length, b.length) < 0.6) {
        yield [r[1] + 1, `${v.nome}: os compassos ${r[1]}–${r[1] + 1} deviam retomar a ideia dos compassos ${r[0]}–${r[0] + 1}`, v.notas.filter((n) => n.inicio >= (r[1] - 1) * C && n.inicio < (r[1] + 1) * C)];
      }
    }, EXPL(
      "A repetição da ideia inicial é o que faz o ouvinte reconhecer a resposta como resposta: mesma pergunta, final diferente.",
      "Copie as notas e o ritmo dos compassos 1–2 nos compassos 5–6 (pode variar um detalhe) e mude só o final."));

  def("sequencia_do_motivo", "Sequência do motivo",
    "Cada compasso da sequência repete o ritmo e o desenho de intervalos do motivo, começando em outra nota.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      const mt = ctx.motivo;
      if (!v || !mt) return;
      const C = ex.duracaoCompasso;
      const doCompasso = (c) => v.notas.filter((n) => n.inicio >= (c - 1) * C && n.inicio < c * C);
      const assinatura = (ns) => ({
        ritmo: ns.map((n) => [n.inicio % C, n.duracao].join(":")).join(" "),
        graus: ns.slice(1).map((n, k) => F.intervalo(ns[k], n).direcionado).join(" "),
      });
      const base = assinatura(doCompasso(mt.de));
      for (const c of mt.em) {
        const ns = doCompasso(c);
        if (!ns.length || ns[ns.length - 1].fim < c * C) continue;
        const s = assinatura(ns);
        if (s.ritmo !== base.ritmo) yield [c, `${v.nome}: o ritmo do compasso ${c} é diferente do motivo`, ns];
        else if (s.graus !== base.graus) yield [c, `${v.nome}: os intervalos do compasso ${c} não seguem o desenho do motivo`, ns];
      }
    }, EXPL(
      "A sequência só é reconhecida se o desenho for o mesmo: mesmo ritmo e mesmos passos (grau acima, 3ª abaixo...), só que começando em outra altura.",
      "Copie o ritmo do motivo e repita cada intervalo na mesma direção e com o mesmo número de graus, a partir de uma nota nova."));

  // ------------------------------------------------------------ baixo

  function* notasDoBaixo(ex, ctx) {
    const b = ex.vozes[vozAlvo(ex, ctx)];
    if (b) for (const n of b.notas) yield n;
  }

  def("baixo_graus", "O baixo usa I, IV e V",
    "Cada nota do baixo é a fundamental de um dos acordes permitidos (no começo, I, IV e V).",
    function* (ex, ctx) {
      if (!ex.tonalidade) return;
      const ok = ctx.graus || [1, 4, 5];
      for (const n of notasDoBaixo(ex, ctx)) {
        const g = grauDe(n.altura, ex.tonalidade);
        const naEscala = escala(ex.tonalidade)[g - 1].nome === n.altura.nome;
        if (!ok.includes(g) || !naEscala) yield [ex.compassoDe(n.inicio), `baixo: ${n.nome} é o ${g}º grau; use ${ok.map((x) => ["I", "ii", "iii", "IV", "V", "vi", "vii"][x - 1]).join(", ")}`, [n]];
      }
    }, { precisaTom: true, ...EXPL(
      "Com poucos acordes o aluno enxerga a função de cada um: I é casa, IV prepara, V pede a volta.",
      "Troque a nota do baixo pela fundamental de I, IV ou V (em dó maior: dó, fá ou sol).") });

  def("acorde_contem_melodia", "O acorde contém a nota da melodia",
    "O acorde formado sobre cada nota do baixo precisa conter a nota da melodia que soa junto.",
    function* (ex, ctx) {
      if (!ex.tonalidade) return;
      const mel = ex.vozes[ctx.cf !== undefined ? ctx.cf : ex.cantusFirmus];
      if (!mel) return;
      for (const n of notasDoBaixo(ex, ctx)) {
        const g = grauDe(n.altura, ex.tonalidade);
        const ac = acorde(["I", "ii", "iii", "IV", "V", "vi", "vii"][g - 1], ex.tonalidade);
        const m = mel.soandoEm(n.inicio);
        if (m && !ac.notas.has(m.altura.nome)) {
          yield [ex.compassoDe(n.inicio), `sobre ${n.nome} (acorde de ${ac.simbolo}: ${[...ac.notas].join("–")}) a melodia tem ${m.nome}, que não é do acorde`, [n, m]];
        }
      }
    }, { precisaTom: true, ...EXPL(
      "O acorde é escolhido pela nota da melodia: se ela não faz parte do acorde, soa como choque, não como harmonia.",
      "Procure um acorde que contenha a nota da melodia: dó, mi e sol → I; fá, lá e dó → IV; sol, si e ré → V.") });

  def("baixo_cadencia", "O baixo termina em V–I",
    "O baixo começa na tônica e termina com a dominante indo para a tônica (5→1).",
    function* (ex, ctx) {
      if (!ex.tonalidade) return;
      const b = ex.vozes[vozAlvo(ex, ctx)];
      if (!b || b.notas.length < 2) return;
      const [a] = b.notas, [p, z] = b.notas.slice(-2);
      const ton = F.tonica(ex), dom = F.transpor(ex.tonalidade.tonica, 4, 7).nome;
      if (a.altura.nome !== ton) yield [1, `baixo: começa em ${a.nome}; comece na tônica (${ton})`, [a]];
      if (z.altura.nome !== ton || p.altura.nome !== dom) yield [ex.compassoDe(z.inicio), `baixo: termina ${p.nome}→${z.nome}; a cadência pede ${dom}→${ton}`, [p, z]];
    }, { precisaTom: true, ...EXPL(
      "O baixo 5→1 é a assinatura da cadência autêntica: é ele, mais que a melodia, que diz 'acabou'.",
      "Faça as duas últimas notas do baixo serem sol→dó (em dó maior) e comece em dó.") });

  def("retrogressao", "Dominante voltando para a subdominante",
    "Depois do V não se volta para o IV: a progressão clássica anda T → PD → D → T.",
    function* (ex, ctx) {
      if (!ex.tonalidade) return;
      const b = ex.vozes[vozAlvo(ex, ctx)];
      if (!b) return;
      for (const [x, y] of b.paresMelodicos()) {
        if (grauDe(x.altura, ex.tonalidade) === 5 && [4, 2].includes(grauDe(y.altura, ex.tonalidade))) {
          yield [ex.compassoDe(y.inicio), `baixo: ${x.nome}→${y.nome} volta da dominante para a subdominante`, [x, y]];
        }
      }
    }, { precisaTom: true, ...EXPL(
      "A dominante cria a expectativa da tônica; voltar para o IV desfaz essa tensão sem resolvê-la. É comum no pop, mas evitado no estilo clássico.",
      "Depois do V, vá para o I (ou para o vi, na cadência de engano).") });

  // estas regras precisam do exercício inteiro
  for (const id of ["cf_final", "cf_chegada", "cf_tamanho", "climax_coincidente", "cadencia_final", "baixo_cadencia"]) M.PRECISA_FIM.add(id);
  // estas olham a nota seguinte
  for (const id of ["cf_salto_recuperado", "notas_do_acorde", "contorno_tritono"]) M.OLHA_ADIANTE.add(id);

  return { acorde, harmoniaDe, grauDe, escala };
});
