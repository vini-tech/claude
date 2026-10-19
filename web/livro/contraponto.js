/* Nível 1 · Contraponto: 5ª espécie (florido), contraponto invertível à 8ª, imitação e cânone a duas vozes.
 * Fontes: Fux, Gradus ad Parnassum (1725; trad. Mann, The Study of Counterpoint); Jeppesen, Counterpoint (1931);
 * Salzer & Schachter, Counterpoint in Composition (1969); Kennan e Gauldin (contraponto tonal, cânone);
 * research_notes/O que se ensina em composição/contraponto.md. Exemplos compostos para o livro e conferidos no verificador. */
(function (raiz) {
  "use strict";
  const TT = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const { N1, N2, PLANO_CP, FUX, CF1, CF2 } = TT.perfis;

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

  // ------------------------------------------------------------ perfis dos capítulos
  const FLOR = { ...M.perfilDoNivel(5), cpt_ritmo_florido: "erro", climax_coincidente: "aviso", notas_do_modo: "erro" };
  const CANONE = { ...M.perfilDoNivel(5), notas_do_modo: "erro", cpt_canone: "erro" };
  delete CANONE.inicio_perfeito; // o comes entra depois: o primeiro intervalo a duas vozes raramente é perfeito
  const INV1 = { ...N1, extras: { ...N1.extras, cpt_invertivel: "erro" } };
  const INV2 = { ...N2, extras: { ...N2.extras, cpt_invertivel: "erro" } };
  const SO_N1 = { ...M.perfilDoNivel(1), climax_coincidente: "aviso" };

  const FL_LICAO = "P/2 A4/2 D5/1 C5 B4 A4 G4/1 A4/0.5 B4 C5/2~ C5/1 B4/0.5 A4 B4/2 E5/1 D5 C5 B4 A4/2 D5~ D5 C5 G5 F5/1 E5 A4/1 B4/0.5 C5 D5/2~ D5 C#5 D5/4";
  const FLO1 = "P/2 C5/2 B4/1 A4 G4 F4 A4/2 D5~ D5/1 C5/0.5 B4 C5/2";
  const FLO1_SOL = `${FLO1} E5/2 D5 C5/1 D5 E5/2~ E5 D5 G5/1 E5 C5/2~ C5 B4 C5/4`;
  const ORN = (fig) => `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5/2 G4/2 C5/2~ ${fig} C5/4\ncantus: C4/4 E4 D4 C4`;

  // ================================================================== 5ª espécie
  TT.inserir(1, {
    id: "florida", titulo: "5ª espécie: contraponto florido",
    objetivo: "Contraponto florido a duas vozes: as quatro espécies misturadas com lógica de frase, retardos ornamentados e cadência por retardo.",
    ouvir: ["Palestrina, Missa Papae Marcelli (Kyrie)", "Victoria, O magnum mysterium", "Fux, Gradus ad Parnassum: exemplos de 5ª espécie"],
    esboco: "Sobre o cantus de Fux (ré–fá–mi–ré–sol–fá–lá–sol–fá–mi–ré), onde você colocaria a primeira síncope e onde as primeiras semínimas? Escreva só o ritmo, compasso por compasso.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Misturar as espécies — e fazer sentido", html: `
        <p><i>Contrapunctus floridus</i> (Fux, 1725): as quatro espécies juntas, no estilo de Palestrina. Compasso alla breve (2/2).</p>
        <h3>O que cada valor pode fazer</h3>
        <table class="tabela-modos"><thead><tr><th>Valor</th><th>Onde começa</th><th>Dissonância</th></tr></thead><tbody>
        <tr><td>Mínima (2ª espécie)</td><td>1º ou 3º tempo</td><td>no 3º tempo, só de passagem</td></tr>
        <tr><td>Semínima (3ª espécie)</td><td>em qualquer tempo</td><td>nos tempos fracos: passagem, bordadura, cambiata</td></tr>
        <tr><td>Mínima ligada (4ª espécie)</td><td>3º tempo, presa por cima da barra</td><td>no tempo forte, como retardo preparado que desce por grau</td></tr>
        <tr><td>Colcheias</td><td>em par, no 2º ou no 4º tempo</td><td>passagem ou bordadura, entrando e saindo por grau</td></tr>
        </tbody></table>
        <ul>
        <li><b>Ligaduras:</b> atravessam a barra; nunca valor menor preso a maior.</li>
        <li><b>Mínima</b> nunca começa no 2º ou 4º tempo.</li>
        <li><b>Começo e fim:</b> pausa de mínima; cadência por retardo (7–6 em cima, 2–3 embaixo).</li>
        <li><b>Resolução ornamentada:</b> colcheias, salto de 3ª abaixo a uma consonância ou antecipação; a resolução fica no 3º tempo.</li>
        </ul>
        <h3>A regra da linha</h3>
        <p><b>Nenhuma espécie domina</b> — mas rodízio mecânico também é ruim. Frase: valores longos, semínimas que <b>desembocam</b> numa síncope, respiro antes do clímax, freio na cadência. Colcheias são enfeite, não motor.</p>` },
      { tipo: "exemplo", titulo: "Um contraponto florido sobre o cantus de Fux", intro: "Ré dórico, contraponto em cima: plano, esqueleto, ritmo.",
        camadas: [
          { titulo: "Plano: começo, clímax e cadência", partitura: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 A4/2 P/4 P/4 P/4 P/4 P/4 P/4 G5/2 P/2 P/2 D5/2~ D5 C#5 D5/4\ncantus: ${FUX}`,
            anotacoes: [[0, 0, "5"], [0, 1, "clímax"], [0, 2, "7"], [0, 3, "6"], [0, 4, "8"]],
            notas: [["decisao", "Cadência: ré5 preparado no c. 9 (6ª), preso sobre mi4 (7ª), dó♯5, ré5."],
              ["decisao", "Clímax sol5 no c. 8, depois do clímax do cantus (c. 7)."],
              ["rejeitada", "Clímax como retardo (fá5 preso): seria atacado no c. 7, junto com o do cantus."]] },
          { titulo: "Esqueleto de 1ª espécie", especie: 1, partitura: `tom: D dorico\ncf: cantus\ncontraponto: A4/4 D5 G4 B4 E5 A4 C5 G5 D5 C#5 D5\ncantus: ${FUX}`,
            anotacoes: [[0, 0, "5"], [0, 1, "6"], [0, 2, "3"], [0, 3, "6"], [0, 4, "6"], [0, 5, "3"], [0, 6, "3"], [0, 7, "8"], [0, 8, "6"], [0, 9, "6"], [0, 10, "8"]],
            notas: [["decisao", "Uma nota estrutural por compasso; saltos de 5ª que o ritmo vai preencher."],
              ["checagem", "3ªs e 6ªs no meio; a 8ª sol5/sol4 só no clímax, por movimento contrário."]] },
          { titulo: "O ritmo: quatro espécies, uma frase", partitura: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${FL_LICAO}\ncantus: ${FUX}`,
            notas: [["decisao", "C. 1–4: pausa e mínima, semínimas, colcheias e síncope; dó5 preso (7ª) resolve via colcheias si–lá."],
              ["decisao", "C. 6–9: síncope ré5 vira 4–3; salto ao clímax sol5, descida em semínimas até a cadência."],
              ["rejeitada", "Semínimas nos c. 5–6: movimento contínuo demais, clímax sem preparo."]],
            pausa: ["Onde estão as dissonâncias, e qual é a mais forte?", "Passagens e bordaduras (c. 2, 3, 5, 8, 9) são fracas. Fortes são as presas: 7ª no c. 4, 4ª no c. 7, 7ª no c. 10 — a última é a cadência."] },
        ] },
      { tipo: "exemplo", titulo: "Três (e meia) maneiras de resolver o mesmo retardo", intro: "O mesmo 7–6 (dó5 sobre ré4); a resolução si4 sempre no 3º tempo.",
        camadas: [
          { titulo: "Direta (4ª espécie)", partitura: ORN("C5/2 B4/2"), notas: [["decisao", "Dó5 preso, si4 no 3º tempo: o modelo."]] },
          { titulo: "Com colcheias", partitura: ORN("C5/1 B4/0.5 A4/0.5 B4/2"), notas: [["decisao", "Dó5 em semínima, colcheias si4–lá4 no 2º tempo, si4 no 3º."]] },
          { titulo: "Salto para a consonância", partitura: ORN("C5/1 A4/1 B4/2"), perfil: { ...FLOR, retardo_resolve_descendo: "info" },
            notas: [["decisao", "Dó5 salta à consonância lá4 (5ª) e sobe ao si4: figura de Fux."],
              ["checagem", "O verificador a marca como 'info'; nos exercícios, prefira as outras."]] },
          { titulo: "Antecipação (portamento)", partitura: ORN("C5/1 B4/1 B4/2"), notas: [["decisao", "Si4 adiantado uma semínima e repetido no 3º tempo (Palestrina, segundo Jeppesen)."]] },
        ] },
      { tipo: "contraste", titulo: "Rodízio de espécies × frase rítmica", intro: "Mesmo cantus, duas soluções sem erro de regra.",
        a: { rotulo: "A — uma espécie por compasso", partitura: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 A4/2 D5/4 C5/1 B4 A4 G4 F4/2 A4 B4/4 C5/1 D5 C5 A4 C5/2 E5~ E5 D5 A4/4 C#5/4 D5/4\ncantus: ${FUX}` },
        b: { rotulo: "B — o ritmo como frase", partitura: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${FL_LICAO}\ncantus: ${FUX}` },
        pergunta: "Mesmos valores nas duas. Em qual o ritmo vai para algum lugar?",
        comentario: "<p>A troca de espécie a cada compasso; semibreves no meio (c. 2, 5, 9) param a linha, e o clímax coincide com o do cantus. Em B, as semínimas desembocam em síncopes (c. 3, 6, 9): movimento → retardo → resolução.</p>" },
      { tipo: "quebra", titulo: "Palestrina não é Fux; Bach não é Palestrina", html: `
        <table class="tabela-modos"><thead><tr><th>Quem</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Palestrina (Jeppesen, 1922)</td><td>antecipação da resolução; passagem descendente acentuada</td><td>o Gradus é simplificação didática</td></tr>
        <tr><td>Bach (contraponto livre)</td><td>apojatura por salto no tempo forte; semicolcheias; dissonância medida contra a harmonia</td><td>ganha expressão e direção harmônica; perde a pureza vocal</td></tr>
        </tbody></table>`,
        exemplos: [
          { rotulo: "Florido ao modo de Palestrina: antecipação na cadência", partitura: ORN("C5/1 B4/1 B4/2"), perfil: { ...FLOR, nota_repetida: "info", ponto_culminante: "info" },
            comentario: "Si4 adiantado e repetido: para Fux, nota repetida; para Palestrina, gesto cadencial." },
          { rotulo: "Florido 'barroco': colcheias livres e apojatura (4/4, sobre um baixo)", partitura: "compasso: 4/4\ntom: C maior\ncf: baixo\nsoprano: C5/1 D5/0.5 E5/0.5 G5/1 F5/0.5 E5/0.5 A5/1 F5/1 C5/1 B4/1 C5/4\nbaixo: C3/2 E3/2 F3/2 G3/2 C3/4",
            perfil: { ...M.perfilDoNivel(5), inicio_perfeito: null, cadencia_contraponto: null, espacamento: null, cpt_ritmo_florido: "info", dissonancia_aproximacao: "info", dissonancia_tempo_forte: "info" },
            comentario: "Colcheias saltando (mi5→sol5) e apojatura dó5/sol3 → si4: certo contra I–I6–IV–V–I, três infrações na 5ª espécie." },
        ] },
    ],
    exercicios: [
      { id: "flo1", titulo: "Completar: clímax e cadência por retardo", modo: "completar", perfil: FLOR, nivel: 5, contexto: { nivel: 5 },
        instrucoes: "<p>Continue em 5ª espécie: clímax depois do c. 6 (clímax do cantus) e cadência 7–6 sobre ré4 (dó5 preso, si4, dó5).</p>",
        texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${FLO1}\ncantus: ${CF1}`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${FLO1_SOL}\ncantus: ${CF1}`,
        comentarioSolucao: "Mínimas no c. 5 para respirar; semínimas até a síncope mi5 (7ª, c. 7); clímax sol5 (c. 8) e arpejo até o 7–6." },
      { id: "flo2", titulo: "Embaixo do cantus", modo: "menos apoio", perfil: FLOR, nivel: 5, contexto: { nivel: 5 },
        instrucoes: "<p>Florido <b>embaixo</b>. Retardos: 2–3 (9–10) e 4–5. Cadência: dó preso sob ré, si, dó.</p>",
        texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto: P/2 C3/2`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto: P/2 C3/2 B2/1 A2 G2/2 A2/1 B2/0.5 C3 D3/2~ D3 C3 F3 G3 E3/1 F3 G3/2 A3 G3/1 F3 G3 E3 C3/2~ C3 B2 C3/4`,
        comentarioSolucao: "Dois 9–10 (c. 4 e cadência); clímax lá3 no c. 7. Nos c. 2–3 as vozes passam de uma 10ª: aviso aceitável por poucos tempos." },
      { id: "flo3", titulo: "Lá eólio, com dois retardos", modo: "restrição", perfil: { ...FLOR, retardos_minimos: "erro" }, nivel: 5, contexto: { nivel: 5, minRetardos: 2 },
        instrucoes: "<p>Florido em cima. <b>Restrição:</b> ao menos dois retardos, um na cadência (lá4 preso sobre si3, sol♯4, lá4), e um par de colcheias.</p>",
        texto: "compasso: 2/2\ntom: A eolio\ncf: cantus\ncontraponto:\ncantus: A3/4 C4 B3 D4 C4 E4 F4 E4 D4 C4 B3 A3", duracao: 2, plano: PLANO_CP,
        solucao: "compasso: 2/2\ntom: A eolio\ncf: cantus\ncontraponto: P/2 E4/2 A4/1 G4 F4 G4 B4/2 D5/2~ D5/1 C5/0.5 B4/0.5 A4/2 C5/2 D5/2 C5/1 B4/1 A4/2~ A4/2 B4/1 A4/1 C5/2 E5/2~ E5/1 D5/0.5 C5/0.5 D5/1 B4/1 C5/2 A4/2~ A4/2 G#4/2 A4/4\ncantus: A3/4 C4 B3 D4 C4 E4 F4 E4 D4 C4 B3 A3",
        comentarioSolucao: "Retardos: 9–8 ornamentado no c. 9 e 7–6 na cadência. As síncopes dos c. 4 e 7 são consonantes." },
      { id: "flo4", titulo: "Livre, embaixo do cantus de Fux", modo: "livre", perfil: FLOR, nivel: 5, contexto: { nivel: 5 },
        instrucoes: "<p>Florido embaixo do cantus de Fux. Planeje cadência (9–10 ou 2–3 sob mi, com dó♯), clímax e frase rítmica.</p>",
        texto: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncantus: ${FUX}\ncontraponto:`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncantus: ${FUX}\ncontraponto: P/2 D3/2 A3/1 G3/1 A3/2 G3/2 F3/2~ F3/1 E3/0.5 D3/0.5 C3/2 B2/1 A2/1 B2/1 E3/1 D3/2 A3/2 F3/2 G3/1 A3/1 B3/2 G3/2~ G3/1 F3/0.5 E3/0.5 D3/2~ D3/2 C#3/2 D3/4` },
      { id: "flo5", titulo: "Quebrar: uma apojatura no lugar do retardo", modo: "quebrar", perfil: { ...FLOR, dissonancia_tempo_forte: "info", dissonancia_aproximacao: "info" }, nivel: 5, contexto: { nivel: 5 },
        instrucoes: "<p>Como no exercício 1, mas <b>no c. 9</b> troque o retardo por uma <b>apojatura</b>: dó5 atacado no tempo forte, por salto, resolvendo em si4.</p>",
        texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${FLO1}\ncantus: ${CF1}`, duracao: 2,
        solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${FLO1} E5/2 D5 C5/1 D5 E5/2~ E5 D5 G5/2 E5 C5 B4 C5/4\ncantus: ${CF1}`,
        comentarioSolucao: "Dó5 (7ª sobre ré4) chega por salto de mi5, sem preparação: duas regras em 'info'. No exercício 1 ele já soava antes." },
    ],
  }, { depoisDe: "retardos" });

  // ================================================================== contraponto invertível
  const ARQ = "C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5";
  const ARQ_INV = "C4/4 B3 A3 C4 E4 C4 D4 C4 B3 C4";
  const COM5 = "C5/4 A4 D5 C5 E5 C5 D5 C5 B4 C5";
  TT.inserir(1, {
    id: "invertivel", titulo: "Contraponto invertível na oitava",
    objetivo: "Escrever um par de vozes que funcione nas duas posições, controlando a 5ª e as dissonâncias; saber o que muda à 10ª e à 12ª.",
    ouvir: ["Bach, Invenções a duas vozes (BWV 772–786)", "Bach, Cravo bem temperado I, Fuga em dó menor (BWV 847)", "Mozart, Sinfonia nº 41 'Júpiter', finale (coda)"],
    esboco: "Pegue um contraponto de 1ª espécie seu (de um capítulo anterior). Desça a voz de cima uma 8ª e escreva-a embaixo do cantus. Que intervalos ficaram ruins, e por quê?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Um par de vozes, duas posições", html: `
        <p>Contraponto <b>invertível</b> (duplo): um par de vozes que funciona também trocado — sujeito e contrassujeito da fuga, as mãos da invenção. Caso básico: <b>à 8ª</b> (ou 15ª), uma voz se desloca uma ou duas 8ªs.</p>
        <table class="tabela-modos"><thead><tr><th>Original</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr></thead><tbody>
        <tr><td><b>Invertido à 8ª</b> (9 − n)</td><td>8</td><td>7</td><td>6</td><td><b>5</b></td><td><b>4</b></td><td>3</td><td>2</td><td>1</td></tr></tbody></table>
        <h3>As consequências</h3>
        <ul>
        <li><b>3ªs, 6ªs, 1 e 8</b>: seguras, paralelas de 3ª/6ª permitidas.</li>
        <li><b>5ª → 4ª</b>, dissonante: nada de 5ª no tempo forte; no fraco, só como passagem por grau.</li>
        <li><b>Distância</b> acima de uma 8ª: inverta à 15ª.</li>
        </ul>
        <table class="tabela-modos"><thead><tr><th>Retardo em cima</th><th>Invertido</th><th>Resultado</th></tr></thead><tbody>
        <tr><td>7–6</td><td>2–3</td><td>par perfeito</td></tr>
        <tr><td>4–3</td><td>5–6</td><td>sem dissonância, aceitável</td></tr>
        <tr><td>6–5</td><td>3–4</td><td>resolve em dissonância</td></tr>
        <tr><td>9–8</td><td>7–8</td><td>nota presa no baixo, fora do estilo</td></tr>
        </tbody></table>
        <h3>À 10ª e à 12ª, em resumo</h3>
        <table class="tabela-modos"><thead><tr><th>Inversão</th><th>Regra</th><th>Fixas</th><th>Problema</th></tr></thead><tbody>
        <tr><td>À 8ª</td><td>n → 9 − n</td><td>1, 3, 6, 8</td><td>5 → 4</td></tr>
        <tr><td>À 10ª</td><td>n → 11 − n</td><td>—</td><td>3 → 8 e 6 → 5: nenhum movimento paralelo; diatonicamente, 6ªs podem virar 5ªs diminutas</td></tr>
        <tr><td>À 12ª</td><td>n → 13 − n</td><td>1, 3, 5, 8</td><td>6 → 7: a 6ª tem de ser tratada como dissonância (preparada e resolvida)</td></tr></tbody></table>
` },
      { tipo: "exemplo", titulo: "Um contraponto que já era invertível", intro: "O contraponto de 'Arquitetura da linha', sem nenhuma 5ª, descido uma 8ª.",
        camadas: [
          { titulo: "O original", partitura: `tom: C maior\ncf: cantus\ncontraponto: ${ARQ}\ncantus: ${CF1}`,
            anotacoes: [[0, 0, "8"], [0, 1, "6"], [0, 2, "3"], [0, 3, "6"], [0, 4, "6"], [0, 5, "3"], [0, 6, "6"], [0, 7, "6"], [0, 8, "6"], [0, 9, "8"]],
            notas: [["decisao", "Só 3ªs e 6ªs no meio, 8ªs nas pontas: por isso é invertível."],
              ["checagem", "Distância máxima: 8ª. A inversão à 8ª não cruza as vozes."]] },
          { titulo: "Invertido à 8ª: o cantus em cima", partitura: `tom: C maior\ncf: cantus\ncantus: ${CF1}\ncontraponto: ${ARQ_INV}`,
            anotacoes: [[1, 0, "1"], [1, 1, "3"], [1, 2, "6"], [1, 3, "3"], [1, 4, "3"], [1, 5, "6"], [1, 6, "3"], [1, 7, "3"], [1, 8, "3"], [1, 9, "1"]],
            notas: [["decisao", "6ª ↔ 3ª; 8ªs viram uníssonos, permitidos nas pontas."],
              ["checagem", "Cadência 6ª M → 8ª virou 3ª m → uníssono: a do contraponto embaixo."],
              ["rejeitada", "Subir o cantus: mesmo resultado, mas fora do registro dele."]],
            pausa: ["E se o c. 1 fosse uma 5ª sol4/dó4?", "Viraria a 4ª sol3/dó4, dissonante contra o baixo. Invertível à 8ª começa em 8ª ou uníssono."] },
        ] },
      { tipo: "contraste", titulo: "Correto no original, errado na inversão", intro: "A: 1ª espécie correta, uma 5ª no c. 2. B: A invertida à 8ª.",
        a: { rotulo: "A — original (5ª no c. 2)", partitura: `tom: C maior\ncf: cantus\ncontraponto: ${COM5}\ncantus: ${CF1}`, perfil: SO_N1 },
        b: { rotulo: "B — invertido à 8ª", partitura: `tom: C maior\ncf: cantus\ncantus: ${CF1}\ncontraponto: C4/4 A3 D4 C4 E4 C4 D4 C4 B3 C4`, perfil: { ...SO_N1, dissonancia_proibida: "info" } },
        pergunta: "Ouça o c. 2 nas duas. O que muda no peso daquele tempo?",
        comentario: "<p>Em A, a 5ª lá4/ré4 é apoio estável. Em B, a 4ª lá3/ré4 no tempo forte soa como 6/4 sem resolução. Escreva pensando nas duas versões.</p>" },
      { tipo: "quebra", titulo: "Bach, Mozart e as inversões raras", html: `
        <table class="tabela-modos"><thead><tr><th>Obra</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Bach, <i>Cravo bem temperado</i></td><td>ajusta notas do par invertido (entradas, cadências)</td><td>invertibilidade não estrita, mas funcional</td></tr>
        <tr><td>Bach, textura a 3+ vozes</td><td>a 4ª fica entre vozes superiores</td><td>apoiada pelo baixo, deixa de ser dissonância</td></tr>
        <tr><td>Bach, <i>Arte da Fuga</i></td><td>inversões à 10ª e à 12ª</td><td>outras tabelas de intervalos</td></tr>
        <tr><td>Mozart, "Júpiter", finale</td><td>temas combinados na coda</td><td>o artifício vira clímax</td></tr>
        </tbody></table>`,
        exemplos: [
          { rotulo: "A inversão com uma nota reescrita (o 'ajuste' de Bach)", partitura: `tom: C maior\ncf: cantus\ncantus: ${CF1}\ncontraponto: C4/4 B3 D4 C4 E4 C4 D4 C4 B3 C4`, perfil: SO_N1,
            comentario: "A inversão do contraste com lá3 trocado por si3 (3ª sob ré4): não estrita, mas funciona." },
          { rotulo: "O mesmo contraponto da aula invertido à 10ª", partitura: `tom: C maior\ncf: cantus\ncantus: ${CF1}\ncontraponto: A3/4 G3 F3 A3 C4 A3 B3 A3 G3 A3`,
            perfil: { ...SO_N1, quintas_paralelas: "info", quintas_oitavas_ocultas: "info", dissonancia_proibida: "info", final_perfeito: "info", cadencia_contraponto: "info", inicio_perfeito: "info", unissono_interno: "info" },
            comentario: "À 10ª falha: 6ªs paralelas (c. 4–5, 8–9) viram 5ªs, ré5/fá4 vira 5ª dim., a cadência acaba em 3ª." },
        ] },
    ],
    exercicios: [
      { id: "inv1", titulo: "Completar: 1ª espécie invertível", modo: "completar", ...INV1,
        instrucoes: "<p>1ª espécie em cima, invertível à 8ª. Evite 5ªs.</p>",
        texto: `tom: D dorico\ncf: cantus\ncontraponto: D5/4 A4 C5\ncantus: ${FUX}`, duracao: 4, plano: PLANO_CP,
        solucao: `tom: D dorico\ncf: cantus\ncontraponto: D5/4 A4 C5 D5 B4 A4 C5 E5 D5 C#5 D5\ncantus: ${FUX}`,
        comentarioSolucao: "Só 3ªs, 6ªs e 8ªs; clímax mi5 no c. 8. Invertido, o ré5 do c. 4 vira uníssono: permitido, mas o ponto mais fraco." },
      { id: "inv2", titulo: "2ª espécie invertível", modo: "menos apoio", ...INV2,
        instrucoes: "<p>2ª espécie em cima, invertível à 8ª. 5ª no tempo fraco só como passagem por grau.</p>",
        texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto:\ncantus: ${CF2}`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5/2 B4 C5 D5 A4 G4 C5 D5 F5 E5 B4 A4 D5 G4 C5 D5 B4 C5/4\ncantus: ${CF2}`,
        comentarioSolucao: "Nenhuma 5ª. A única dissonância (7ª dó5/ré4, c. 2) é passagem; invertida, vira 2ª de passagem." },
      { id: "inv3", titulo: "À 10ª: sem movimento paralelo", modo: "restrição", ...INV1, contexto: { inversao: { intervalo: 10 } },
        instrucoes: "<p>1ª espécie em cima. <b>Restrição:</b> invertível <b>à 10ª</b> (3ª ↔ 8ª, 6ª ↔ 5ª): só movimento contrário ou oblíquo; evite a 6ª si/ré (vira 5ª dim.).</p>",
        texto: `tom: C maior\ncf: cantus\ncontraponto:\ncantus: ${CF2}`, duracao: 4, plano: PLANO_CP,
        solucao: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5 D5 B4 C5 E5 B4 C5\ncantus: ${CF2}`,
        comentarioSolucao: "Quase só movimento contrário: as perfeitas (c. 5, 7, 8) viram 6ªs e 3ªs; as imperfeitas viram perfeitas sem paralelas." },
      { id: "inv4", titulo: "Livre: embaixo, em 2ª espécie", modo: "livre", ...INV2,
        instrucoes: "<p>2ª espécie <b>embaixo</b> do cantus de Fux, invertível à 8ª. Cadência: mi–dó♯–ré sob fá–mi–ré.</p>",
        texto: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncantus: ${FUX}\ncontraponto:`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncantus: ${FUX}\ncontraponto: P/2 D3/2 A2 B2 C3 E3 F3 D3 B2 E3 A3 G3 F3 C3 E3 B2 A2 D3 E3 C#3 D3/4` },
      { id: "inv5", titulo: "Quebrar: uma 5ª que não será invertida", modo: "quebrar", ...N1, extras: { ...N1.extras, cpt_invertivel: "info" },
        instrucoes: "<p>1ª espécie em cima, invertível à 8ª <b>exceto no c. 2</b>: ali, uma 5ª justa no tempo forte, a reescrever na reaparição (como Bach). A inversão fica em 'info' e aponta só o c. 2.</p>",
        texto: `tom: C maior\ncf: cantus\ncontraponto: C5/4\ncantus: ${CF1}`, duracao: 4, plano: PLANO_CP,
        solucao: `tom: C maior\ncf: cantus\ncontraponto: ${COM5}\ncantus: ${CF1}`,
        comentarioSolucao: "Lá4/ré4 (c. 2) é a única 5ª; invertida, vira 4ª. Na reaparição, troque lá3 por si3." },
    ],
  }, { depoisDe: "florida" });

  // ================================================================== imitação e cânone
  const DUX = "C5/2 D5 G5 F5 D5 E5 F5 C5 A4 C5 E5 D5 B4/4 C5/4";
  const COMES = "P/4 C4/2 D4 G4 F4 D4 E4 F4 C4 A3 C4 D4/4 C4/4";
  const CAN8 = { canone: { guia: 0, intervalo: -8, atraso: 4, ate: 6 } };
  TT.inserir(1, {
    id: "imitacao", titulo: "Imitação e cânone a duas vozes",
    objetivo: "Compor cânones a duas vozes à 8ª e à 5ª, elo por elo, com diferentes atrasos e cadência; conhecer inversão e aumentação.",
    ouvir: ["Pachelbel, Cânone em ré", "Bach, Variações Goldberg (var. 3, 6, 9… 27)", "Webern, Sinfonia op. 21"],
    esboco: "Escreva quatro notas de um dux em mínimas, em dó maior. Agora escreva-as uma 8ª abaixo, deslocadas dois tempos. Que intervalos se formaram entre as vozes? Algum é dissonante?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Uma melodia contra ela mesma", html: `
        <p><b>Imitação:</b> uma voz retoma o motivo da outra e segue livre (moteto, invenção). <b>Cânone:</b> o <b>comes</b> repete toda a melodia do <b>dux</b>, no mesmo ritmo, a intervalo e atraso fixos.</p>
        <table class="tabela-modos"><thead><tr><th>Variável</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Intervalo 1/8</td><td>mesmas notas</td></tr>
        <tr><td>Intervalo 5/4</td><td>diatônico: mesmo número, qualidade do modo (dó → fá abaixo, sol acima)</td></tr>
        <tr><td>Atraso 1 compasso</td><td>cada compasso do dux contra o anterior</td></tr>
        <tr><td>Atraso ½ compasso</td><td>cada nota contra a anterior</td></tr>
        <tr><td>Fim</td><td>finito: o comes larga a imitação e cadencia (6ª M → 8ª); perpétuo: volta ao começo</td></tr>
        </tbody></table>
        <h3>Elo por elo</h3>
        <ol>
        <li>Escreva o 1º elo do dux (um atraso de comprimento).</li>
        <li>Copie no comes; escreva o próximo elo do dux <b>contra a cópia</b>. Repita.</li>
        <li>Alguns elos antes do fim, leve o dux a um registro que permita cadenciar.</li>
        </ol>
        <p>Elo sem solução: corrija <b>o dux</b>, nunca o comes. Com atraso de ½ compasso à 8ª, notas seguidas do dux são consonantes entre si; grau conjunto só como passagem no fraco.</p>` },
      { tipo: "exemplo", titulo: "Um cânone à 8ª, elo por elo", intro: "Dó maior, comes uma 8ª abaixo, um compasso depois. Cânone até o c. 6, cadência nos c. 7–8.",
        camadas: [
          { titulo: "Elo 1: o dux sozinho", partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 D5\ncomes: P/4", rotulos: ["dux", "comes"],
            notas: [["decisao", "Dó5–ré5: da final, por grau; o próximo elo soará contra dó4–ré4."]] },
          { titulo: "Elo 2 contra a cópia do elo 1", partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 D5 G5 F5\ncomes: P/4 C4/2 D4", rotulos: ["dux", "comes"],
            anotacoes: [[0, 2, "12 (5)"], [0, 3, "10 (3)"]],
            notas: [["decisao", "Contra dó4–ré4: sol5 (12ª, comes vindo da pausa) e fá5 (10ª)."],
              ["rejeitada", "Mi5–fá5: 10ªs paralelas e linha só subindo por grau."]] },
          { titulo: "Elo 3 contra a cópia do elo 2", partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 D5 G5 F5 D5 E5\ncomes: P/4 C4/2 D4 G4 F4", rotulos: ["dux", "comes"],
            anotacoes: [[0, 4, "5"], [0, 5, "7 pass."]],
            notas: [["decisao", "Contra sol4–fá4: ré5 (5ª) e mi5 (7ª de passagem, segue a fá5). Movimento contrário."],
              ["checagem", "12ª → 10ª → 5ª, sem paralelas."]] },
          { titulo: "O cânone inteiro e a cadência", partitura: `compasso: 2/2\ntom: C maior\ndux: ${DUX}\ncomes: ${COMES}`, rotulos: ["dux", "comes"], contexto: CAN8,
            notas: [["decisao", "Elos 4–6: fá5–dó5, lá4–dó5, mi5–ré5; o dux desce para alcançar a cadência."],
              ["decisao", "C. 7–8: o comes larga a cópia e toca ré4 sob si4: 6ª M → 8ª."]],
            pausa: ["Por que o dux desce ao lá4 nos c. 5–6?", "O comes toca isso nos c. 6–7 e precisa chegar à cadência por grau, perto do dó. O fim se planeja dois elos antes."] },
        ] },
      { tipo: "contraste", titulo: "Imitação que desiste × cânone até a cadência", intro: "Mesmo dux. A: imitação por dois compassos. B: até a cadência.",
        a: { rotulo: "A — imitação nos c. 2–3, depois livre", partitura: `compasso: 2/2\ntom: C maior\ndux: ${DUX}\ncomes: P/4 C4/2 D4 G4 F4 A4/4 F4/4 C4/2 G4/2 D4/4 C4/4`, contexto: { canone: { guia: 0, intervalo: -8, atraso: 4, ate: 3 } } },
        b: { rotulo: "B — cânone até o c. 6", partitura: `compasso: 2/2\ntom: C maior\ndux: ${DUX}\ncomes: ${COMES}`, contexto: CAN8 },
        pergunta: "Em qual a segunda voz fica independente até o fim e a melodia se ouve duas vezes?",
        comentario: "<p>Em A, após o c. 3 o comes vira acompanhamento em semibreves: melodia acompanhada, como o moteto que dissolve a imitação — legítimo, mas não cânone. Em B, cada elo reaparece e a cadência fecha o processo.</p>" },
      { tipo: "quebra", titulo: "Inversão, aumentação, Goldberg e Webern", html: `
        <table class="tabela-modos"><thead><tr><th>Obra</th><th>Variante</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Bach, Goldberg var. 12 e 15</td><td><b>inversão</b>: o comes espelha os intervalos</td><td>independência por movimento contrário</td></tr>
        <tr><td>Bach, <i>Arte da Fuga</i></td><td><b>aumentação</b> em movimento contrário</td><td>o comes em valores mais longos</td></tr>
        <tr><td>Bach, <i>Oferenda Musical</i></td><td><b>cancrizans</b>: dux de trás para frente</td><td>enigma, mais visual que audível</td></tr>
        <tr><td>Ockeghem, <i>Missa prolationum</i></td><td>mensuração: velocidades diferentes</td><td>uma melodia gera todas as vozes</td></tr>
        <tr><td>Webern, Sinfonia op. 21</td><td>cânone duplo por inversão, serial</td><td>unidade total; ouve-se parentesco, não repetição</td></tr>
        </tbody></table>`,
        exemplos: [
          { rotulo: "Cânone por inversão à 8ª abaixo, atraso de um compasso", partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 G4 A4 B4 C5 F5 G5 F5 D5 E5 D5 C5 B4/4 C5/4\ncomes: P/4 C4/2 F4 E4 D4 C4 G3 F3 G3 B3 A3 D4/4 C4/4", rotulos: ["dux", "comes"],
            contexto: { canone: { guia: 0, intervalo: -8, atraso: 4, ate: 6, inversao: true } },
            comentario: "Dux desce uma 4ª (dó5→sol4), comes sobe uma 4ª (dó4→fá4): movimento contrário constante, e o comes chega a um grave (fá3) que a forma reta não alcançaria." },
        ] },
    ],
    exercicios: [
      { id: "imi1", titulo: "Completar: cânone à 8ª em ré dórico", modo: "completar", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 4, ate: 6 } }, alvoCompassos: 8,
        instrucoes: "<p>Cânone à 8ª abaixo, atraso de um compasso. Continue elo por elo até o c. 6; cadência nos c. 7–8: dó♯5/mi4 → ré5/ré4.</p>",
        texto: "compasso: 2/2\ntom: D dorico\ndux: D5/2 F5 A5 F5 C5 D5\ncomes: P/4 D4/2 F4 A4 F4", duracao: 2,
        solucao: "compasso: 2/2\ntom: D dorico\ndux: D5/2 F5 A5 F5 C5 D5 E5 D5 B4 C5 D5 E5 C#5/4 D5/4\ncomes: P/4 D4/2 F4 A4 F4 C4 D4 E4 D4 B3 C4 E4/4 D4/4",
        comentarioSolucao: "O dux desce do lá5 (mi5–ré5, si4–dó5) para o comes chegar ao registro da cadência; no c. 7 o comes toca mi4, 6ª M sob dó♯5." },
      { id: "imi2", titulo: "Cânone à 5ª abaixo", modo: "menos apoio", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 0, intervalo: -5, atraso: 4, ate: 6 } }, alvoCompassos: 8,
        instrucoes: "<p>Cânone <b>à 5ª abaixo</b>, diatônico (dó→fá, mi→lá, si→mi), atraso de um compasso. Cânone até o c. 6; cadência si4/ré4 → dó5/dó4.</p>",
        texto: "compasso: 2/2\ntom: C maior\ndux: C5/2 E5\ncomes: P/4", duracao: 2,
        solucao: "compasso: 2/2\ntom: C maior\ndux: C5/2 E5 D5 C5 B4 A4 C5 B4 A4 G4 B4 C5 B4/4 C5/4\ncomes: P/4 F4/2 A4 G4 F4 E4 D4 F4 E4 D4 C4 D4/4 C4/4",
        comentarioSolucao: "O comes começa na subdominante (fá); a descida do dux (ré5–lá4) o traz de volta ao dó a tempo da cadência." },
      { id: "imi3", titulo: "Atraso de meio compasso", modo: "restrição", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 2, ate: 6 } }, alvoCompassos: 8,
        instrucoes: "<p>Cânone à 8ª abaixo, <b>atraso de uma mínima</b>. <b>Restrição:</b> notas seguidas do dux consonantes entre si; grau conjunto só como passagem no tempo fraco.</p>",
        texto: "compasso: 2/2\ntom: C maior\ndux: E5/2\ncomes: P/2", duracao: 2,
        solucao: "compasso: 2/2\ntom: C maior\ndux: E5/2 C5 E5 C5 A4 C5 E5 F5 D5 E5 C5 D5 B4/4 C5/4\ncomes: P/2 E4/2 C4 E4 C4 A3 C4 E4 F4 D4 E4 C4 D4/4 C4/4",
        comentarioSolucao: "Saltos de 3ª e 6ª impostos pela restrição. O único grau conjunto: fá5 no c. 4, 9ª de passagem no fraco, resolvendo em ré5." },
      { id: "imi4", titulo: "Livre: cânone à 5ª acima", modo: "livre", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 1, intervalo: 5, atraso: 4, ate: 6 } }, alvoCompassos: 8,
        instrucoes: "<p>Dux no <b>baixo</b>, comes em cima <b>à 5ª acima</b> (dó→sol), um compasso depois. Cânone até o c. 6, cadência livre.</p>",
        texto: "compasso: 2/2\ntom: C maior\ncomes:\ndux:", duracao: 2,
        solucao: "compasso: 2/2\ntom: C maior\ncomes: P/4 G4/2 C5 B4 E5 D5 B4 C5 A4 G4 A4 B4/4 C5/4\ndux: C4/2 F4 E4 A4 G4 E4 F4 D4 C4 D4 E4 C4 D4/4 C4/4" },
      { id: "imi5", titulo: "Quebrar: cânone por inversão", modo: "quebrar", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 4, ate: 6, inversao: true } }, alvoCompassos: 8,
        instrucoes: "<p>Cânone à 8ª abaixo, um compasso depois, <b>por inversão</b>: cada grau que o dux sobe, o comes desce (Goldberg, var. 12 e 15). Cânone até o c. 6, cadência nos c. 7–8.</p>",
        texto: "compasso: 2/2\ntom: D dorico\ndux: D5/2 C5\ncomes: P/4", duracao: 2,
        solucao: "compasso: 2/2\ntom: D dorico\ndux: D5/2 C5 A4 C5 B4 C5 D5 C5 F5 E5 D5 E5 C#5/4 D5/4\ncomes: P/4 D4/2 E4 G4 E4 F4 E4 D4 E4 B3 C4 E4/4 D4/4",
        comentarioSolucao: "Eixo ré: dux ré5–dó5–lá4, comes ré4–mi4–sol4. No c. 7 o comes larga o espelho: mi4 sob dó♯5." },
    ],
  }, { depoisDe: "invertivel" });
})(this);
