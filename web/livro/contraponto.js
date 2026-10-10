/* Nível 1 · Contraponto: 5ª espécie (florido), contraponto invertível à 8ª, imitação e cânone a duas vozes.
 * Fontes: Fux, Gradus ad Parnassum (1725; trad. Mann, The Study of Counterpoint); Jeppesen, Counterpoint (1931);
 * Salzer & Schachter, Counterpoint in Composition (1969); Kennan e Gauldin (contraponto tonal, cânone);
 * research_notes/O que se ensina em composição/contraponto.md. Exemplos compostos para o livro e conferidos no verificador. */
(function (raiz) {
  "use strict";
  const TT = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const { N1, N2, N4, PLANO_CP, FUX, CF1, CF2 } = TT.perfis;

  // ------------------------------------------------------------ regras do módulo (prefixo cpt_)
  const F = M.ferramentas, T = M.T;
  const PC = [0, 2, 4, 5, 7, 9, 11];
  const PADROES = {
    major: [0, 2, 4, 5, 7, 9, 11], ionian: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], aeolian: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
  };
  const ORD = (n) => (n === 8 ? "8ª" : `${n}ª`);
  const vozesLivres = (ex, ctx) => {
    const cf = ctx.cf !== undefined && ctx.cf >= 0 ? ctx.cf : ex.cantusFirmus;
    return ex.vozes.map((_, i) => i).filter((i) => i !== cf);
  };

  // transposição diatônica (dentro do modo do exercício), preservando a alteração cromática da nota em relação à escala
  function diatonico(alt, passos, tom) {
    const t = tom ? tom.tonica : M.altura(0, 0, 4);
    const pad = PADROES[tom ? tom.modo : "major"] || PADROES.major;
    const D0 = t.letra + 7 * t.oitava;
    const psEscala = (d) => { const r = d - D0, g = ((r % 7) + 7) % 7; return t.ps + 12 * Math.floor(r / 7) + pad[g]; };
    const D = alt.letra + 7 * alt.oitava, D2 = D + passos;
    const ps2 = psEscala(D2) + (alt.ps - psEscala(D));
    const letra = ((D2 % 7) + 7) % 7, oit = Math.floor(D2 / 7);
    return M.altura(letra, ps2 - (12 * (oit + 1) + PC[letra]), oit);
  }
  const passosDe = (a) => a.letra + 7 * a.oitava;
  const copiaNota = (n, alt) => { const c = M.nota(alt || n.altura, n.inicio, n.duracao); c.partes = n.partes; return c; };

  /* --- 5ª espécie: o ritmo do contraponto florido --- */
  M.definirRegra("cpt_ritmo_florido", "Ritmo do contraponto florido",
    "Na 5ª espécie valem semibreve, mínima, semínima e colcheia. Colcheias só em pares, no 2º ou no 4º tempo, entrando e saindo por grau; mínimas começam no 1º ou no 3º tempo; a ligadura atravessa a barra e nunca prende um valor menor a um maior; a última nota cai no tempo forte; e nenhum ritmo se repete por mais de três compassos seguidos (nenhuma espécie domina).",
    function* (ex, ctx) {
      const C = ex.duracaoCompasso, VALORES = [T / 2, T, 2 * T, 4 * T];
      for (const i of vozesLivres(ex, ctx)) {
        const v = ex.vozes[i], ns = v.notas;
        const padroes = new Map();
        ns.forEach((n, k) => {
          const c = ex.compassoDe(n.inicio), pos = n.inicio % C;
          const partes = n.partes || [[n.inicio, n.duracao]];
          const ataque = partes[0][1];
          if (!padroes.has(c)) padroes.set(c, []);
          padroes.get(c).push(`${pos}:${ataque}`);
          for (const [ti, d] of partes.slice(1)) {
            const cc = ex.compassoDe(ti);
            if (!padroes.has(cc)) padroes.set(cc, []);
            padroes.get(cc).push(`~${ti % C}:${d}`);
          }
        });
        for (let k = 0; k < ns.length; k++) {
          const n = ns[k], c = ex.compassoDe(n.inicio), pos = n.inicio % C;
          const partes = n.partes || [[n.inicio, n.duracao]];
          const ataque = partes[0][1];
          const ant = v.anterior(n), prox = v.seguinte(n);
          if (partes.some(([, d]) => !VALORES.includes(d))) {
            yield [c, `${v.nome}: ${n.nome} usa um valor fora da 5ª espécie (só semibreve, mínima, semínima e colcheia, com ligaduras)`, [n]];
            continue;
          }
          if (k === ns.length - 1) {
            if (pos !== 0) yield [c, `${v.nome}: a nota final (${n.nome}) deve cair no tempo forte`, [n]];
            continue;
          }
          if (ataque === T / 2) {
            if (pos % T === 0) {
              const par = prox && prox.duracao === T / 2 && (prox.partes || []).length <= 1 ? prox : null;
              if ((pos / T) % 2 !== 1) yield [c, `${v.nome}: colcheias (${n.nome}) só no 2º ou no 4º tempo, nunca no tempo forte nem no 3º`, [n]];
              else if (!par) yield [c, `${v.nome}: colcheia ${n.nome} sozinha; elas vêm sempre em pares`, [n]];
              else {
                const depois = v.seguinte(par);
                if (ant && !F.ehGrau(ant, n)) yield [c, `${v.nome}: o par de colcheias ${n.nome}–${par.nome} deve chegar por grau (vem de ${ant.nome})`, [ant, n]];
                else if (!F.ehGrau(n, par)) yield [c, `${v.nome}: as colcheias ${n.nome}–${par.nome} andam por grau`, [n, par]];
                else if (depois && !F.ehGrau(par, depois)) yield [c, `${v.nome}: depois das colcheias a linha continua por grau (${par.nome} → ${depois.nome})`, [par, depois]];
              }
            } else if (!(ant && ant.duracao === T / 2 && ant.inicio % T === 0)) {
              yield [c, `${v.nome}: colcheia ${n.nome} fora do lugar; o par começa junto com um tempo`, [n]];
            }
          } else if (ataque === T) {
            if (pos % T !== 0) yield [c, `${v.nome}: a semínima ${n.nome} começa fora do tempo`, [n]];
          } else if (ataque === 2 * T) {
            if (pos % (2 * T) !== 0) yield [c, `${v.nome}: a mínima ${n.nome} começa no 2º ou 4º tempo (síncope de semínima, fora do estilo)`, [n]];
          } else if (pos !== 0) yield [c, `${v.nome}: a semibreve ${n.nome} começa fora do tempo forte`, [n]];
          if (partes.length > 1) {
            if (!partes.slice(1).some(([ti]) => ti % C === 0)) yield [c, `${v.nome}: a ligadura de ${n.nome} não atravessa a barra`, [n]];
            for (let j = 0; j + 1 < partes.length; j++) {
              if (partes[j][1] < partes[j + 1][1]) { yield [c, `${v.nome}: ${n.nome} liga um valor menor a um maior (soa como síncope fraca)`, [n]]; break; }
            }
          }
        }
        // nenhuma espécie domina: o mesmo desenho rítmico no máximo três compassos seguidos (sem contar o primeiro e o último)
        const ultimo = ns.length ? ex.compassoDe(ns[ns.length - 1].inicio) : 0;
        let seq = 1;
        for (let c = 3; c < ultimo; c++) {
          const a = (padroes.get(c - 1) || []).join(" "), b = (padroes.get(c) || []).join(" ");
          seq = a && a === b ? seq + 1 : 1;
          if (seq === 4) yield [c, `${v.nome}: quatro compassos seguidos com o mesmo ritmo; no florido nenhuma espécie domina`, ns.filter((n) => ex.compassoDe(n.inicio) === c)];
        }
      }
    }, {
      porque: "A 5ª espécie é a síntese das outras quatro: o interesse vem da variedade rítmica controlada. Colcheias soltas ou no tempo forte, mínimas começando no meio do tempo e ligaduras de valor curto para longo soam como tropeços métricos no estilo vocal de Palestrina, que é o modelo de Fux e de Jeppesen.",
      corrigir: "Ponha as colcheias em pares no 2º ou no 4º tempo, por grau; comece as mínimas no 1º ou no 3º tempo; ligue mínima a mínima (ou mínima a semínima) por cima da barra; e alterne os padrões das quatro espécies.",
    });

  /* --- contraponto invertível --- */
  // versão invertida: a voz de cima desce (intervalo − 1) graus, mais quantas oitavas forem precisas para não cruzar
  function inverter(ex, intervalo) {
    if (ex.vozes.length !== 2) return null;
    const [sup, inf] = ex.vozes;
    if (!sup.notas.length || !inf.notas.length) return null;
    let dist = 0;
    for (const m of F.momentos(ex, 0, 1)) if (m.completo) dist = Math.max(dist, passosDe(m.sup.altura) - passosDe(m.inf.altura));
    let passos = intervalo - 1;
    while (passos < dist) passos += 7;
    const mapa = new Map();
    const baixo = M.criarVoz(inf.nome), cima = M.criarVoz(sup.nome);
    // a voz de cima vira a de baixo: a ordem das vozes também se inverte
    for (const n of inf.notas) { const c = copiaNota(n); mapa.set(c, n); baixo.notas.push(c); }
    for (const n of sup.notas) {
      const alt = passos % 7 === 0 ? M.transpor(n.altura, -passos, -12 * (passos / 7)) : diatonico(n.altura, -passos, ex.tonalidade);
      const c = copiaNota(n, alt); mapa.set(c, n); cima.notas.push(c);
    }
    const cf = ex.cantusFirmus === null ? null : 1 - ex.cantusFirmus;
    const exI = M.criarExercicio({ vozes: [baixo, cima], formula: ex.formula, tonalidade: ex.tonalidade, cantusFirmus: cf });
    return { exI, mapa, passos };
  }

  function regrasDaInversao(ctx) {
    const r = ctx.nivel === 1 ? ["dissonancia_proibida"]
      : ["dissonancia_tempo_forte", "dissonancia_aproximacao", "dissonancia_resolucao", "retardo_resolve_descendo"];
    if (ctx.nivel === 2) r.push("bordadura_na_2a_especie");
    return [...r, "quintas_paralelas", "oitavas_paralelas"];
  }

  M.definirRegra("cpt_invertivel", "Também funciona invertido",
    "O trecho continua correto com as vozes trocadas: a de cima desce uma 8ª (ou duas, se as vozes passam de uma 8ª) e vira o baixo. À 8ª o intervalo n vira 9 − n: a 5ª vira 4ª (dissonância contra o baixo), a 3ª vira 6ª. O exercício pode pedir a inversão à 10ª ou à 12ª (contexto inversao.intervalo).",
    function* (ex, ctx) {
      const cfg = ctx.inversao || {};
      const intervalo = cfg.intervalo || 8;
      const r = inverter(ex, intervalo);
      if (!r) return;
      const { exI, mapa } = r;
      const ids = regrasDaInversao(ctx);
      // o que já está errado no original não é repetido aqui
      const jaVisto = new Set();
      for (const id of ids) for (const [, , notas] of M.REGRAS[id].verificar(ex, ctx)) jaVisto.add(id + ":" + (notas || []).map((n) => n.inicio + "/" + n.ps).join(","));
      for (const id of ids) {
        for (const [c, msg, notas] of M.REGRAS[id].verificar(exI, ctx)) {
          if (cfg.ate && c > cfg.ate) continue;
          const orig = (notas || []).map((n) => mapa.get(n) || n);
          if (jaVisto.has(id + ":" + orig.map((n) => n.inicio + "/" + n.ps).join(","))) continue;
          yield [c, `invertido à ${ORD(intervalo)}: ${msg}`, orig];
        }
      }
    }, {
      porque: "Contraponto invertível é material que serve duas vezes: o mesmo par de linhas aparece depois com as vozes trocadas (o contrassujeito da fuga, as invenções de Bach). Uma 5ª inofensiva no original vira 4ª contra o baixo na inversão; 3ªs paralelas, invertidas à 10ª, viram 8ªs paralelas.",
      corrigir: "Leia o achado na versão invertida e troque a nota do original: à 8ª, trate a 5ª como dissonância (só de passagem ou em síncope que resolve) ou evite-a nos tempos fortes; à 10ª, evite movimento paralelo.",
    });

  /* --- cânone e imitação --- */
  // contexto.canone = { guia: índice da voz que lidera (padrão 0), intervalo: 8 | -8 | 5 | -5 | 1… (sinal = direção do comes),
  //                     atraso: semínimas, ate: último compasso em que o comes ainda imita (padrão: até o fim), inversao: bool }
  M.definirRegra("cpt_canone", "O comes imita o dux",
    "A voz que segue (comes) repete a que lidera (dux) no intervalo e com o atraso pedidos pelo exercício, nota por nota e com as mesmas durações, até o compasso em que o cânone se desfaz para a cadência. A imitação é diatônica (no modo do exercício); no cânone por inversão, os intervalos melódicos vêm espelhados.",
    function* (ex, ctx) {
      const cfg = ctx.canone;
      if (!cfg || ex.vozes.length !== 2) return;
      const g = cfg.guia || 0, s = 1 - g;
      const dux = ex.vozes[g], comes = ex.vozes[s];
      if (!dux.notas.length || !comes.notas.length) return;
      const C = ex.duracaoCompasso, d = Math.round((cfg.atraso || 4) * T);
      const limite = cfg.ate ? cfg.ate * C : Infinity;
      const passos = Math.sign(cfg.intervalo || 8) * (Math.abs(cfg.intervalo || 8) - 1);
      const fimComes = comes.notas[comes.notas.length - 1].fim;
      const nomeIv = `${ORD(Math.abs(cfg.intervalo || 8))} ${cfg.intervalo < 0 ? "abaixo" : "acima"}`;
      for (const n of comes.notas) {
        if (n.inicio < d) { yield [ex.compassoDe(n.inicio), `${comes.nome}: ${n.nome} entra antes do dux ter tocado o atraso (${(cfg.atraso || 4)} semínimas)`, [n]]; break; }
      }
      const d0 = dux.notas[0];
      for (const n of dux.notas) {
        const t = n.inicio + d;
        if (t >= limite || t >= fimComes) break;
        // por inversão (espelho): o primeiro intervalo dá o eixo; cada grau que o dux sobe, o comes desce
        const alvo = cfg.inversao ? diatonico(d0.altura, passos - (passosDe(n.altura) - passosDe(d0.altura)), ex.tonalidade)
          : diatonico(n.altura, passos, ex.tonalidade);
        const c = ex.compassoDe(t);
        const m = comes.soandoEm(t);
        const ondeDux = `c. ${ex.compassoDe(n.inicio)}`;
        if (!m || m.inicio !== t) { yield [c, `${comes.nome}: esperava ${alvo.nomeOitava.replace(/-/g, "b")} aqui, imitando o ${n.nome} do dux (${ondeDux}) à ${nomeIv}`, m ? [m, n] : [n]]; continue; }
        const mesmaNota = passosDe(m.altura) === passosDe(alvo) && (m.altura.ps === alvo.ps || cfg.livre);
        if (!mesmaNota) { yield [c, `${comes.nome}: ${m.nome} deveria ser ${alvo.nomeOitava.replace(/-/g, "b")} (o ${n.nome} do dux, ${ondeDux}, à ${nomeIv})`, [m, n]]; continue; }
        const corta = t + n.duracao > limite || t + n.duracao >= fimComes;
        if (!corta && m.duracao !== n.duracao) yield [c, `${comes.nome}: ${m.nome} deveria durar o mesmo que o ${n.nome} do dux (${n.duracao / T} semínima(s))`, [m, n]];
      }
    }, {
      porque: "No cânone a voz que segue é a mesma melodia, deslocada no tempo e na altura: é essa repetição estrita que o ouvido reconhece. Uma nota trocada para 'consertar' a harmonia desfaz o cânone.",
      corrigir: "Se a vertical não funciona, mude a nota no dux (e então no comes), em vez de alterar só o comes. Construa elo por elo: escreva um trecho do dux, copie-o no comes e só então escreva o trecho seguinte do dux contra essa cópia.",
    });
  M.OLHA_ADIANTE.add("cpt_invertivel");
  M.OLHA_ADIANTE.add("cpt_ritmo_florido");

  /*CAPITULOS*/
})(this);
