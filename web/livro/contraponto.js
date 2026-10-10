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
    antes: [
      { p: "Na 5ª espécie de Fux, onde entram as colcheias?", o: ["Em pares, no 2º ou no 4º tempo, andando por grau", "Em qualquer tempo, desde que consonantes", "Só no tempo forte, como ornamento da consonância", "Em grupos de quatro, preenchendo um tempo inteiro"], e: "As colcheias são o valor mais rápido do estilo e ficam nos lugares mais fracos: duas, no 2º ou 4º tempo do compasso alla breve, por grau (passagem ou bordadura). No tempo forte ou em grupos longos, viram virtuosismo instrumental, fora do estilo vocal." },
      { p: "Retardo 7–6 em cima (dó5 preso sobre ré4, resolvendo em si4). Qual destas ornamentações da resolução NÃO é do estilo?", o: ["Dó5 (semínima) → ré5 → si4: subir antes de resolver", "Dó5 (semínima) → si4–lá4 (colcheias) → si4", "Dó5 (semínima) → lá4 (consonância, salto de 3ª) → si4", "Dó5 (semínima) → si4 → si4 (antecipação da resolução)"], e: "A ornamentação preenche o tempo entre a dissonância e a resolução sem esconder o movimento descendente: colcheias (si–lá) que voltam ao si, salto de 3ª para baixo até uma consonância e volta, ou a antecipação. Subir para ré5 tira a dissonância da sua resolução natural." },
      { p: "O que significa 'nenhuma espécie deve dominar' no contraponto florido?", o: ["O ritmo alterna os padrões das quatro espécies com uma lógica de frase, sem virar um bloco de mínimas ou de semínimas", "Cada compasso deve usar uma espécie diferente, em rodízio", "As semínimas devem ser a maioria, porque são a espécie mais livre", "As síncopes só podem aparecer na cadência"], e: "A 5ª espécie é síntese: mínimas, semínimas, síncopes e colcheias se misturam. Mas um rodízio mecânico (um compasso de cada) é tão pobre quanto uma espécie só: o ritmo tem de fazer sentido como frase — começar calmo, ganhar movimento, frear na cadência." },
    ],
    objetivo: "Escrever um contraponto florido a duas vozes que misture as quatro espécies com lógica de frase: semínimas que levam a uma síncope, retardos com resolução ornamentada, colcheias no lugar certo e uma cadência por retardo.",
    ouvir: ["Palestrina, Missa Papae Marcelli (Kyrie e Agnus Dei): o ritmo 'florido' das vozes", "Victoria, moteto 'O magnum mysterium'", "Josquin, 'Ave Maria… virgo serena'", "Fux, Gradus ad Parnassum: os exemplos de 5ª espécie (contrapunctus floridus)"],
    esboco: "Sobre o cantus de Fux (ré–fá–mi–ré–sol–fá–lá–sol–fá–mi–ré), onde você colocaria a primeira síncope e onde as primeiras semínimas? Escreva só o ritmo, compasso por compasso.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Misturar as espécies — e fazer sentido", html: `
        <p>No <i>Gradus ad Parnassum</i> (1725), Fux chama a 5ª espécie de <i>contrapunctus floridus</i>: o contraponto que junta as quatro espécies anteriores. É a primeira vez que o aluno escreve <b>ritmo</b> de verdade; e é aqui que o estilo de Palestrina, modelo de Fux e mais tarde de Jeppesen (<i>Counterpoint</i>, 1931), aparece por inteiro. O compasso é o alla breve (2/2): a semibreve do cantus vale um compasso; a mínima, meio; a semínima, um quarto.</p>
        <h3>O que cada valor pode fazer</h3>
        <table class="tabela-modos"><thead><tr><th>Valor</th><th>Onde começa</th><th>Dissonância</th></tr></thead><tbody>
        <tr><td>Mínima (2ª espécie)</td><td>1º ou 3º tempo</td><td>no 3º tempo, só de passagem</td></tr>
        <tr><td>Semínima (3ª espécie)</td><td>em qualquer tempo</td><td>nos tempos fracos: passagem, bordadura, cambiata</td></tr>
        <tr><td>Mínima ligada (4ª espécie)</td><td>3º tempo, presa por cima da barra</td><td>no tempo forte, como retardo preparado que desce por grau</td></tr>
        <tr><td>Colcheias</td><td>em par, no 2º ou no 4º tempo</td><td>passagem ou bordadura, entrando e saindo por grau</td></tr>
        </tbody></table>
        <ul>
        <li><b>Ligaduras:</b> atravessam a barra e não prendem um valor menor a um maior (semínima ligada a mínima soa como tropeço, não como síncope).</li>
        <li><b>Sem síncope de semínima:</b> uma mínima não começa no 2º ou no 4º tempo.</li>
        <li><b>Começo e fim:</b> é comum começar com pausa de mínima, como na 4ª espécie, e cadenciar com o retardo da 4ª espécie (7–6 em cima, 2–3 embaixo) antes da semibreve final.</li>
        <li><b>Resolução ornamentada:</b> o retardo pode chegar à resolução por um desvio — duas colcheias, um salto de 3ª para baixo até uma consonância, ou a antecipação da nota de resolução. A resolução continua no 3º tempo.</li>
        </ul>
        <h3>A regra da linha</h3>
        <p>Nenhuma regra acima garante música. O conselho constante dos manuais é que <b>nenhuma espécie domine</b>, mas o rodízio mecânico — um compasso de cada espécie — também é ruim. O ritmo precisa de uma lógica de frase: começar com valores longos, ganhar movimento com semínimas que <b>desembocam</b> numa síncope ou num valor longo, respirar antes do clímax e frear na cadência. Pense como um cantor: corridas de semínimas sobem com impulso e a voz pousa numa nota longa; colcheias são um enfeite de passagem, não um motor.</p>
        <p>Nos exercícios, a regra <b>Ritmo do contraponto florido</b> confere os valores, as colcheias, as ligaduras e marca quatro compassos seguidos com o mesmo ritmo. O resto — se o ritmo faz sentido — é com o seu ouvido.</p>` },
      { tipo: "exemplo", titulo: "Um contraponto florido sobre o cantus de Fux", intro: "Ré dórico, contraponto em cima. Primeiro o plano, depois o esqueleto de 1ª espécie, por fim o ritmo.",
        camadas: [
          { titulo: "Plano: começo, clímax e cadência", partitura: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 A4/2 P/4 P/4 P/4 P/4 P/4 P/4 G5/2 P/2 P/2 D5/2~ D5 C#5 D5/4\ncantus: ${FUX}`,
            anotacoes: [[0, 0, "5"], [0, 1, "clímax"], [0, 2, "7"], [0, 3, "6"], [0, 4, "8"]],
            notas: [["decisao", "Cadência da 4ª espécie: ré5 preparado no c. 9 (6ª sobre fá4), preso sobre mi4 (7ª), resolve em dó♯5 e chega a ré5."],
              ["decisao", "Clímax sol5 no c. 8, um compasso depois do clímax do cantus (lá4, c. 7): as duas vozes não chegam juntas ao ponto alto."],
              ["rejeitada", "Pensei em fazer o clímax como retardo (fá5 preparado no c. 7 e preso no c. 8). O fá5 começaria no c. 7, junto com o clímax do cantus — e a regra conta o compasso em que a nota é atacada."]] },
          { titulo: "Esqueleto de 1ª espécie", especie: 1, partitura: `tom: D dorico\ncf: cantus\ncontraponto: A4/4 D5 G4 B4 E5 A4 C5 G5 D5 C#5 D5\ncantus: ${FUX}`,
            anotacoes: [[0, 0, "5"], [0, 1, "6"], [0, 2, "3"], [0, 3, "6"], [0, 4, "6"], [0, 5, "3"], [0, 6, "3"], [0, 7, "8"], [0, 8, "6"], [0, 9, "6"], [0, 10, "8"]],
            notas: [["decisao", "Uma nota estrutural por compasso: é ela que o ritmo vai prolongar. O esqueleto é anguloso (saltos de 5ª), porque as semínimas e as síncopes vão preencher os saltos."],
              ["checagem", "Esqueleto válido em 1ª espécie: 3ªs e 6ªs no meio, a 8ª sol5/sol4 só no clímax, chegada por movimento contrário."]] },
          { titulo: "O ritmo: quatro espécies, uma frase", partitura: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${FL_LICAO}\ncantus: ${FUX}`,
            notas: [["decisao", "C. 1–2: começo calmo (pausa e mínima) e logo uma corrida de semínimas que desce da 6ª (ré5) à 3ª (lá4); o si4 é dissonância de passagem (4ª aumentada contra fá4), entre consonâncias."],
              ["decisao", "C. 3–4: semínima, duas colcheias no 2º tempo (lá4 é 4ª de passagem contra mi4) e uma mínima ligada — a corrida desemboca numa síncope. O dó5 preso sobre ré4 é 7ª: resolve em si4 com as colcheias si–lá antes da mínima si4 (resolução ornamentada)."],
              ["decisao", "C. 6–7: a síncope ré5 vira 4ª quando o cantus sobe a lá4 — um 4–3 (resolve em dó5). Depois, o salto dó5 → sol5 abre o clímax."],
              ["decisao", "C. 8–9: o clímax sol5 desce por semínimas; no c. 9 a bordadura si4 em colcheia (contra fá4, trítono) volta ao dó5, que leva ao ré5 preparado da cadência."],
              ["rejeitada", "Pensei em semínimas também nos c. 5–6. Seriam três compassos seguidos de movimento contínuo depois das colcheias do c. 4: o meio da frase ficaria sem respiração e o clímax chegaria sem preparo. As mínimas e a síncope dos c. 6–7 freiam antes do salto."],
              ["checagem", "Ritmo por compasso: mínima | 4 semínimas | semínima + colcheias + síncope | retardo ornamentado | semínimas | mínimas e síncope | 4–3 | mínima + semínimas | semínima + colcheias + síncope | 7–6 | semibreve. Nenhum padrão se repete mais de duas vezes seguidas."]],
            pausa: ["Onde estão as dissonâncias desta linha, e qual delas é a mais forte?", "As de passagem (si4 no c. 2, lá4 no c. 3, dó5 no c. 5, fá5 no c. 8) e as bordaduras (si4 no c. 9) são todas fracas, entre consonâncias. As fortes são as presas: 7ª no c. 4, 4ª no c. 7 e 7ª no c. 10. É a hierarquia da 5ª espécie: dissonância de passagem para o movimento, dissonância presa para a tensão — e a última delas é a cadência."] },
        ] },
      { tipo: "exemplo", titulo: "Três (e meia) maneiras de resolver o mesmo retardo", intro: "O mesmo 7–6 (dó5 preso sobre ré4) com a resolução direta e com as ornamentações do estilo. A resolução si4 está sempre no 3º tempo.",
        camadas: [
          { titulo: "Direta (4ª espécie)", partitura: ORN("C5/2 B4/2"), notas: [["decisao", "Dó5 preso, si4 no 3º tempo: o modelo."]] },
          { titulo: "Com colcheias", partitura: ORN("C5/1 B4/0.5 A4/0.5 B4/2"), notas: [["decisao", "O dó5 dura uma semínima; si4–lá4 em colcheias no 2º tempo e a resolução si4 no 3º. O si4 aparece antes — mas a resolução 'oficial' continua no 3º tempo."]] },
          { titulo: "Salto para a consonância", partitura: ORN("C5/1 A4/1 B4/2"), perfil: { ...FLOR, retardo_resolve_descendo: "info" },
            notas: [["decisao", "Do dó5 a dissonância salta uma 3ª para baixo até lá4 (5ª sobre ré4, consonante) e sobe ao si4. É a figura que Fux mostra para ornamentar a resolução."],
              ["checagem", "O verificador desta página exige que a nota presa desça por grau logo em seguida: esta figura aparece como 'info' de Retardo resolve descendo. Nos exercícios, prefira as outras formas."]] },
          { titulo: "Antecipação (portamento)", partitura: ORN("C5/1 B4/1 B4/2"), notas: [["decisao", "A resolução si4 chega uma semínima antes e é repetida no 3º tempo. Jeppesen a descreve como figura típica de Palestrina; nos exercícios ela aparece só como aviso de nota repetida."]] },
        ] },
      { tipo: "contraste", titulo: "Rodízio de espécies × frase rítmica", intro: "Mesmo cantus, duas soluções sem erro de regra.",
        a: { rotulo: "A — uma espécie por compasso", partitura: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: P/2 A4/2 D5/4 C5/1 B4 A4 G4 F4/2 A4 B4/4 C5/1 D5 C5 A4 C5/2 E5~ E5 D5 A4/4 C#5/4 D5/4\ncantus: ${FUX}` },
        b: { rotulo: "B — o ritmo como frase", partitura: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncontraponto: ${FL_LICAO}\ncantus: ${FUX}` },
        pergunta: "As duas usam semibreves, mínimas, semínimas e síncopes. Em qual o ritmo parece ir para algum lugar?",
        comentario: "<p>A troca de espécie a cada compasso: semibreve, semínimas, mínimas, semibreve de novo, semínimas… Cada corrida de semínimas termina num valor parado sem que nada a prepare, e as semibreves no meio (c. 2, 5, 9) param a linha. O clímax mi5 ainda cai junto com o do cantus. Em B, as semínimas sempre desembocam numa síncope (c. 3, 6, 9): o movimento produz a tensão do retardo, e o retardo produz a resolução. O ritmo tem causa e consequência — é isso que a 'regra da linha' pede.</p>" },
      { tipo: "quebra", titulo: "Palestrina não é Fux; Bach não é Palestrina", html: `
        <p>Jeppesen estudou a música de Palestrina nota por nota (<i>The Style of Palestrina and the Dissonance</i>, 1922) e mostrou que o Gradus é uma simplificação: Palestrina usa figuras que Fux omite ou restringe, como a <b>antecipação</b> (<i>portamento</i>) da resolução e as semínimas de passagem descendentes em tempo relativamente acentuado; e a cambiata, nele, é só descendente. A 5ª espécie dos manuais é um modelo didático do estilo, não uma transcrição dele.</p>
        <p>No Barroco tardio o contraponto florido vira <b>contraponto livre</b>, baseado em acordes. Nas invenções e fugas de Bach a dissonância pode cair no tempo forte sem preparação (<b>apojatura</b>, atingida por salto), o ritmo usa semicolcheias e figuras instrumentais, e a dissonância é medida contra a harmonia, não contra um cantus. O que se ganha é expressão e direção harmônica; o que se perde é a pureza vocal da linha.</p>`,
        exemplos: [
          { rotulo: "Florido ao modo de Palestrina: antecipação na cadência", partitura: ORN("C5/1 B4/1 B4/2"), perfil: { ...FLOR, nota_repetida: "info", ponto_culminante: "info" },
            comentario: "A resolução si4 chega antes do tempo e é repetida: para Fux, uma nota repetida; para Palestrina, um gesto cadencial comum." },
          { rotulo: "Florido 'barroco': colcheias livres e apojatura (4/4, sobre um baixo)", partitura: "compasso: 4/4\ntom: C maior\ncf: baixo\nsoprano: C5/1 D5/0.5 E5/0.5 G5/1 F5/0.5 E5/0.5 A5/1 F5/1 C5/1 B4/1 C5/4\nbaixo: C3/2 E3/2 F3/2 G3/2 C3/4",
            perfil: { ...M.perfilDoNivel(5), inicio_perfeito: null, cadencia_contraponto: null, espacamento: null, cpt_ritmo_florido: "info", dissonancia_aproximacao: "info", dissonancia_tempo_forte: "info" },
            comentario: "As colcheias saltam (mi5 → sol5), e o dó5 sobre sol3 é uma 4ª atingida por salto, que resolve em si4: uma apojatura. Contra o baixo cifrado (I–I6–IV–V–I) tudo faz sentido harmônico; contra as regras da 5ª espécie, são três infrações." },
        ] },
    ],
    exercicios: [
      { id: "flo1", titulo: "Completar: clímax e cadência por retardo", modo: "completar", perfil: FLOR, nivel: 5, contexto: { nivel: 5 },
        instrucoes: "<p>Os quatro primeiros compassos estão escritos (ritmo: mínima, semínimas, síncope, resolução ornamentada). Continue em 5ª espécie: planeje um clímax depois do c. 6 (o clímax do cantus é o lá4 do c. 6) e termine com o retardo 7–6 sobre o ré4 do cantus (dó5 preso, si4, dó5).</p>",
        texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${FLO1}\ncantus: ${CF1}`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${FLO1_SOL}\ncantus: ${CF1}`,
        comentarioSolucao: "Mínimas no c. 5 para respirar depois das colcheias; semínimas que desembocam numa síncope (mi5, 7ª sobre fá4 no c. 7); o clímax sol5 no c. 8 e o arpejo sol5–mi5–dó5 que prepara o 7–6 da cadência." },
      { id: "flo2", titulo: "Embaixo do cantus", modo: "menos apoio", perfil: FLOR, nivel: 5, contexto: { nivel: 5 },
        instrucoes: "<p>Contraponto florido <b>embaixo</b>. Só a primeira nota está escrita. Embaixo, os retardos bons são 2–3 (ou 9–10) e 4–5; na cadência, dó preso sob o ré do cantus resolve em si (9–10 ou 2–3) e chega a dó.</p>",
        texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto: P/2 C3/2`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncantus: ${CF2}\ncontraponto: P/2 C3/2 B2/1 A2 G2/2 A2/1 B2/0.5 C3 D3/2~ D3 C3 F3 G3 E3/1 F3 G3/2 A3 G3/1 F3 G3 E3 C3/2~ C3 B2 C3/4`,
        comentarioSolucao: "Dois 9–10 (c. 4 e c. 9, cadência), um mergulho grave no começo e a subida até o lá3 do c. 7 (o clímax do baixo, fora do compasso do clímax do cantus). Nos c. 2–3 a distância passa de uma 10ª: o verificador avisa; é aceitável por poucos tempos." },
      { id: "flo3", titulo: "Lá eólio, com dois retardos", modo: "restrição", perfil: { ...FLOR, retardos_minimos: "erro" }, nivel: 5, contexto: { nivel: 5, minRetardos: 2 },
        instrucoes: "<p>Contraponto florido em cima do cantus eólio. <b>Restrição:</b> pelo menos dois retardos (dissonâncias presas no tempo forte), um deles na cadência (lá4 preso sobre si3, sol♯4, lá4). Use pelo menos um par de colcheias.</p>",
        texto: "compasso: 2/2\ntom: A eolio\ncf: cantus\ncontraponto:\ncantus: A3/4 C4 B3 D4 C4 E4 F4 E4 D4 C4 B3 A3", duracao: 2, plano: PLANO_CP,
        solucao: "compasso: 2/2\ntom: A eolio\ncf: cantus\ncontraponto: P/2 E4/2 A4/1 G4 F4 G4 B4/2 D5/2~ D5/1 C5/0.5 B4/0.5 A4/2 C5/2 D5/2 C5/1 B4/1 A4/2~ A4/2 B4/1 A4/1 C5/2 E5/2~ E5/1 D5/0.5 C5/0.5 D5/1 B4/1 C5/2 A4/2~ A4/2 G#4/2 A4/4\ncantus: A3/4 C4 B3 D4 C4 E4 F4 E4 D4 C4 B3 A3",
        comentarioSolucao: "Os retardos estão no c. 9 (mi5 preso sobre ré4, 9–8, com resolução ornamentada por colcheias) e na cadência (7–6). As outras síncopes (c. 4, 7) são consonantes: ligação rítmica sem tensão." },
      { id: "flo4", titulo: "Livre, embaixo do cantus de Fux", modo: "livre", perfil: FLOR, nivel: 5, contexto: { nivel: 5 },
        instrucoes: "<p>Contraponto florido embaixo do cantus dórico de Fux. Sem apoio: planeje cadência (9–10 ou 2–3 sobre o mi do cantus, com dó♯), clímax e a frase rítmica.</p>",
        texto: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncantus: ${FUX}\ncontraponto:`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncantus: ${FUX}\ncontraponto: P/2 D3/2 A3/1 G3/1 A3/2 G3/2 F3/2~ F3/1 E3/0.5 D3/0.5 C3/2 B2/1 A2/1 B2/1 E3/1 D3/2 A3/2 F3/2 G3/1 A3/1 B3/2 G3/2~ G3/1 F3/0.5 E3/0.5 D3/2~ D3/2 C#3/2 D3/4` },
      { id: "flo5", titulo: "Quebrar: uma apojatura no lugar do retardo", modo: "quebrar", perfil: { ...FLOR, dissonancia_tempo_forte: "info", dissonancia_aproximacao: "info" }, nivel: 5, contexto: { nivel: 5 },
        instrucoes: "<p>Mesmo cantus e mesmo começo do exercício 1. Desta vez, <b>no c. 9</b> (sobre o ré4 do cantus), troque o retardo por uma <b>apojatura</b>: o dó5 é atacado no tempo forte, chegando por salto, sem preparação, e resolve em si4. É a dissonância do estilo livre (Bach, o Classicismo): mais dura e mais expressiva que o retardo, porque nada a anuncia.</p>",
        texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${FLO1}\ncantus: ${CF1}`, duracao: 2,
        solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: ${FLO1} E5/2 D5 C5/1 D5 E5/2~ E5 D5 G5/2 E5 C5 B4 C5/4\ncantus: ${CF1}`,
        comentarioSolucao: "O c. 8 termina em mi5 e o dó5 do c. 9 chega por salto de 3ª, atacado sobre ré4 (7ª): o verificador marca como 'info' as duas regras quebradas. Compare com a solução do exercício 1: lá o dó5 já soava antes (preparação); aqui ele cai sem aviso." },
    ],
  }, { depoisDe: "retardos" });

  // ================================================================== contraponto invertível
  const ARQ = "C5/4 B4 A4 C5 E5 C5 D5 C5 B4 C5";
  const ARQ_INV = "C4/4 B3 A3 C4 E4 C4 D4 C4 B3 C4";
  const COM5 = "C5/4 A4 D5 C5 E5 C5 D5 C5 B4 C5";
  TT.inserir(1, {
    id: "invertivel", titulo: "Contraponto invertível na oitava",
    antes: [
      { p: "Invertido à 8ª (a voz de cima desce uma 8ª e vira o baixo), uma 5ª justa vira:", o: ["4ª justa — dissonância contra o baixo", "5ª justa — não muda", "6ª — consonância imperfeita", "3ª — consonância imperfeita"], e: "À 8ª, o intervalo n vira 9 − n: 1↔8, 2↔7, 3↔6, 4↔5. A 5ª vira 4ª, que no contraponto a duas vozes conta como dissonância. Por isso a 5ª é o problema central da inversão à 8ª." },
      { p: "Que retardo da voz de cima continua bom quando o par é invertido à 8ª?", o: ["7–6, que vira 2–3 na voz de baixo", "4–3, que vira 5–6", "9–8, que vira 7–8", "6–5, que vira 3–4"], e: "7–6 em cima e 2–3 embaixo são o mesmo retardo visto dos dois lados: um é a inversão do outro. O 4–3 vira 5–6 (sem dissonância nenhuma); o 6–5 vira 3–4, que resolve numa dissonância." },
      { p: "Por que a inversão à 10ª proíbe 3ªs e 6ªs paralelas?", o: ["Porque à 10ª a 3ª vira 8ª e a 6ª vira 5ª: as paralelas imperfeitas viram paralelas perfeitas", "Porque à 10ª toda 3ª vira dissonância", "Porque a 10ª é grande demais para cantar", "Não proíbe: à 10ª vale o mesmo que à 8ª"], e: "À 10ª o intervalo n vira 11 − n: 3↔8, 5↔6, 1↔10. Cada imperfeita tem uma perfeita como par, então todo movimento paralelo de 3ªs ou 6ªs vira 8ªs ou 5ªs paralelas na inversão." },
    ],
    objetivo: "Escrever um par de vozes que funcione nas duas posições — com a voz de cima no baixo e vice-versa — controlando a 5ª e o tratamento das dissonâncias; e saber o que muda à 10ª e à 12ª.",
    ouvir: ["Bach, Invenções a duas vozes (BWV 772–786): as vozes trocam de material", "Bach, Cravo bem temperado I, Fuga em dó menor (BWV 847): sujeito e contrassujeitos combinados em várias posições", "Bach, A Arte da Fuga: os contrapontos 'alla Duodecima' e 'alla Decima' e os cânones à 8ª, 10ª e 12ª", "Mozart, Sinfonia nº 41 'Júpiter', finale: a coda combina os temas em contraponto invertível"],
    esboco: "Pegue um contraponto de 1ª espécie seu (de um capítulo anterior). Desça a voz de cima uma 8ª e escreva-a embaixo do cantus. Que intervalos ficaram ruins, e por quê?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Um par de vozes, duas posições", html: `
        <p>Contraponto <b>invertível</b> (ou duplo) é um par de vozes escrito para ser usado também com as vozes trocadas: a de cima passa para baixo. É o que permite a uma fuga reapresentar o sujeito com o mesmo contrassujeito embaixo ou em cima, e a uma invenção de Bach trocar o material entre as mãos. Zacconi o codificou no começo do séc. XVII; Taneyev, no início do séc. XX, o generalizou numa álgebra de intervalos. O caso básico é a inversão <b>à 8ª</b> (ou à 15ª, quando as vozes passam de uma 8ª): uma voz se desloca uma ou duas 8ªs, a outra fica.</p>
        <table class="tabela-modos"><thead><tr><th>Original</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr></thead><tbody>
        <tr><td><b>Invertido à 8ª</b> (9 − n)</td><td>8</td><td>7</td><td>6</td><td><b>5</b></td><td><b>4</b></td><td>3</td><td>2</td><td>1</td></tr></tbody></table>
        <h3>As consequências</h3>
        <ul>
        <li><b>3ªs, 6ªs, uníssonos e 8ªs</b> continuam consonâncias: são o material seguro, e as 3ªs e 6ªs paralelas continuam permitidas.</li>
        <li><b>A 5ª vira 4ª</b>, dissonante contra o baixo. Na prática: nada de 5ªs nos tempos fortes; nos fracos, só onde a 4ª resultante também funcionaria como dissonância (de passagem, chegando e saindo por grau). Uma 5ª consonante atingida por salto vira uma 4ª atingida por salto.</li>
        <li><b>Retardos:</b> 7–6 (em cima) ↔ 2–3 (embaixo) é o par perfeito. O 4–3 vira 5–6 (perde a dissonância, mas não erra); o 6–5 vira 3–4 (resolve numa dissonância) e o 9–8 vira 7–8 (a nota presa fica no baixo, numa figura estranha ao estilo).</li>
        <li><b>Distância:</b> se as vozes ficam dentro de uma 8ª, a inversão à 8ª não cruza as vozes; se chegam à 10ª, inverta à 15ª (duas 8ªs) — os intervalos simples são os mesmos.</li>
        </ul>
        <h3>À 10ª e à 12ª, em resumo</h3>
        <table class="tabela-modos"><thead><tr><th>Inversão</th><th>Regra</th><th>Fixas</th><th>Problema</th></tr></thead><tbody>
        <tr><td>À 8ª</td><td>n → 9 − n</td><td>1, 3, 6, 8</td><td>5 → 4</td></tr>
        <tr><td>À 10ª</td><td>n → 11 − n</td><td>—</td><td>3 → 8 e 6 → 5: nenhum movimento paralelo; diatonicamente, 6ªs podem virar 5ªs diminutas</td></tr>
        <tr><td>À 12ª</td><td>n → 13 − n</td><td>1, 3, 5, 8</td><td>6 → 7: a 6ª tem de ser tratada como dissonância (preparada e resolvida)</td></tr></tbody></table>
        <p>Nos exercícios, a regra <b>Também funciona invertido</b> monta a versão invertida (a voz de cima desce uma 8ª, ou duas, ou uma 10ª/12ª quando o exercício pede) e confere nela o tratamento das dissonâncias e as paralelas. Os achados aparecem no compasso, apontando as notas do original.</p>` },
      { tipo: "exemplo", titulo: "Um contraponto que já era invertível", intro: "O contraponto de 1ª espécie do capítulo 'Arquitetura da linha' não usa nenhuma 5ª. Veja o que acontece quando ele desce uma 8ª.",
        camadas: [
          { titulo: "O original", partitura: `tom: C maior\ncf: cantus\ncontraponto: ${ARQ}\ncantus: ${CF1}`,
            anotacoes: [[0, 0, "8"], [0, 1, "6"], [0, 2, "3"], [0, 3, "6"], [0, 4, "6"], [0, 5, "3"], [0, 6, "6"], [0, 7, "6"], [0, 8, "6"], [0, 9, "8"]],
            notas: [["decisao", "Só 3ªs e 6ªs no meio; 8ªs nas pontas. Essa escolha, feita lá por razões de textura (perfeitas soam como chegadas), é exatamente o que torna o par invertível."],
              ["checagem", "Maior distância entre as vozes: a 8ª do começo e do fim. A inversão à 8ª basta — as vozes não vão se cruzar."]] },
          { titulo: "Invertido à 8ª: o cantus em cima", partitura: `tom: C maior\ncf: cantus\ncantus: ${CF1}\ncontraponto: ${ARQ_INV}`,
            anotacoes: [[1, 0, "1"], [1, 1, "3"], [1, 2, "6"], [1, 3, "3"], [1, 4, "3"], [1, 5, "6"], [1, 6, "3"], [1, 7, "3"], [1, 8, "3"], [1, 9, "1"]],
            notas: [["decisao", "Cada 6ª virou 3ª, cada 3ª virou 6ª, as 8ªs viraram uníssonos. O começo e o fim em uníssono são permitidos com o contraponto embaixo."],
              ["checagem", "A cadência 6ª maior → 8ª virou 3ª menor → uníssono (si3–dó4 sob ré4–dó4): é a cadência do contraponto embaixo. As três 6ªs paralelas dos c. 7–9 viraram três 3ªs paralelas — ainda dentro do limite."],
              ["rejeitada", "Pensei em subir o cantus uma 8ª em vez de descer o contraponto. Dá o mesmo resultado intervalar, mas o cantus sairia do registro dele; em contraponto invertível, desloca-se a voz que o contexto permite."]],
            pausa: ["Se o original tivesse uma 5ª sol4/dó4 no c. 1, o que aconteceria aqui?", "Viraria sol3 sob dó4: uma 4ª no primeiro tempo do exercício, dissonante contra o baixo. Por isso, em contraponto invertível à 8ª, o começo também é em 8ª ou uníssono."] },
        ] },
      { tipo: "contraste", titulo: "Correto no original, errado na inversão", intro: "A é um contraponto de 1ª espécie correto, com uma única 5ª (c. 2). B é a mesma coisa invertida à 8ª.",
        a: { rotulo: "A — original (5ª no c. 2)", partitura: `tom: C maior\ncf: cantus\ncontraponto: ${COM5}\ncantus: ${CF1}`, perfil: SO_N1 },
        b: { rotulo: "B — invertido à 8ª", partitura: `tom: C maior\ncf: cantus\ncantus: ${CF1}\ncontraponto: C4/4 A3 D4 C4 E4 C4 D4 C4 B3 C4`, perfil: { ...SO_N1, dissonancia_proibida: "info" } },
        pergunta: "Ouça o c. 2 nas duas versões. O que muda no peso daquele tempo?",
        comentario: "<p>Em A, lá4 sobre ré4 é uma 5ª: aberta, estável, um pequeno ponto de apoio logo depois do começo. Em B, lá3 sob ré4 é uma 4ª contra o baixo, num tempo forte de 1ª espécie: soa como um acorde de 6/4 sem resolução, uma dissonância solta. Uma escolha inofensiva no original vira um erro na inversão — por isso quem escreve contraponto invertível escreve pensando nas duas versões ao mesmo tempo.</p>" },
      { tipo: "quebra", titulo: "Bach, Mozart e as inversões raras", html: `
        <p>Na prática, os compositores não tratam a invertibilidade como lei absoluta. Bach escreve sujeito e contrassujeito invertíveis à 8ª nas fugas do <i>Cravo bem temperado</i>, mas costuma <b>ajustar notas</b> quando o par aparece invertido, sobretudo nas cadências e nas entradas, onde o contexto harmônico já é outro. A três ou mais vozes, a 4ª que nasce da 5ª invertida pode ficar entre vozes superiores, apoiada por um baixo — e aí deixa de ser problema. Na <i>Arte da Fuga</i>, Bach explora deliberadamente as inversões à 10ª e à 12ª (os <i>contrapuncti alla Decima</i> e <i>alla Duodecima</i>), em que as regras são outras.</p>
        <p>No finale da <b>Sinfonia "Júpiter"</b>, Mozart guarda para a coda a combinação simultânea dos temas do movimento, em contraponto invertível: o artifício escolástico vira o clímax dramático da sinfonia.</p>`,
        exemplos: [
          { rotulo: "A inversão com uma nota reescrita (o 'ajuste' de Bach)", partitura: `tom: C maior\ncf: cantus\ncantus: ${CF1}\ncontraponto: C4/4 B3 D4 C4 E4 C4 D4 C4 B3 C4`, perfil: SO_N1,
            comentario: "A versão invertida do contraste, com o lá3 do c. 2 trocado por si3 (3ª sob ré4). O par não é estritamente invertível, mas a segunda aparição funciona: a nota livre resolve o único ponto ruim." },
          { rotulo: "O mesmo contraponto da aula invertido à 10ª", partitura: `tom: C maior\ncf: cantus\ncantus: ${CF1}\ncontraponto: A3/4 G3 F3 A3 C4 A3 B3 A3 G3 A3`,
            perfil: { ...SO_N1, quintas_paralelas: "info", quintas_oitavas_ocultas: "info", dissonancia_proibida: "info", final_perfeito: "info", cadencia_contraponto: "info", inicio_perfeito: "info", unissono_interno: "info" },
            comentario: "Invertível à 8ª, o contraponto da aula falha à 10ª: as 6ªs paralelas dos c. 4–5 e 8–9 viram 5ªs paralelas, a 6ª ré5/fá4 vira a 5ª diminuta si3/fá4, e a cadência termina numa 3ª. À 10ª é preciso escrever em movimento contrário quase o tempo todo." },
        ] },
    ],
    exercicios: [
      { id: "inv1", titulo: "Completar: 1ª espécie invertível", modo: "completar", ...INV1,
        instrucoes: "<p>Contraponto de 1ª espécie em cima do cantus de Fux, que precisa funcionar também invertido à 8ª. As três primeiras notas estão escritas. Evite as 5ªs; a regra <b>Também funciona invertido</b> confere a versão invertida enquanto você escreve.</p>",
        texto: `tom: D dorico\ncf: cantus\ncontraponto: D5/4 A4 C5\ncantus: ${FUX}`, duracao: 4, plano: PLANO_CP,
        solucao: `tom: D dorico\ncf: cantus\ncontraponto: D5/4 A4 C5 D5 B4 A4 C5 E5 D5 C#5 D5\ncantus: ${FUX}`,
        comentarioSolucao: "Só 3ªs, 6ªs e 8ªs; o clímax mi5 no c. 8 (depois do lá4 do cantus). Invertido, o ré5 do c. 4 vira uníssono — permitido, mas é o ponto mais fraco da versão invertida." },
      { id: "inv2", titulo: "2ª espécie invertível", modo: "menos apoio", ...INV2,
        instrucoes: "<p>2ª espécie em cima, invertível à 8ª. Cuidado com as 5ªs dos tempos fracos: invertidas, viram 4ªs, que só funcionam como notas de passagem (chegando e saindo por grau). Uma 5ª atingida por salto vira uma 4ª atingida por salto.</p>",
        texto: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto:\ncantus: ${CF2}`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: C maior\ncf: cantus\ncontraponto: P/2 C5/2 B4 C5 D5 A4 G4 C5 D5 F5 E5 B4 A4 D5 G4 C5 D5 B4 C5/4\ncantus: ${CF2}`,
        comentarioSolucao: "Nenhuma 5ª: os tempos fracos usam 3ªs, 6ªs, 8ªs e 10ªs, e a única dissonância (dó5 sobre ré4 no c. 2, uma 7ª) é de passagem — invertida, vira 2ª, ainda de passagem." },
      { id: "inv3", titulo: "À 10ª: sem movimento paralelo", modo: "restrição", ...INV1, contexto: { inversao: { intervalo: 10 } },
        instrucoes: "<p>1ª espécie em cima. <b>Restrição:</b> o par tem de funcionar invertido <b>à 10ª</b> (a voz de cima desce uma 10ª). Como 3ª ↔ 8ª e 6ª ↔ 5ª, as 3ªs e 6ªs paralelas viram 8ªs e 5ªs paralelas: escreva em movimento contrário ou oblíquo. E evite a 6ª si/ré, que vira a 5ª diminuta fá–si.</p>",
        texto: `tom: C maior\ncf: cantus\ncontraponto:\ncantus: ${CF2}`, duracao: 4, plano: PLANO_CP,
        solucao: `tom: C maior\ncf: cantus\ncontraponto: C5/4 B4 A4 C5 D5 B4 C5 E5 B4 C5\ncantus: ${CF2}`,
        comentarioSolucao: "Movimento contrário em quase todas as passagens; as 5ªs e 8ªs do original (c. 5, 7, 8) viram 6ªs e 3ªs na inversão, e as 3ªs e 6ªs viram 8ªs e 5ªs alcançadas por movimento contrário." },
      { id: "inv4", titulo: "Livre: embaixo, em 2ª espécie", modo: "livre", ...INV2,
        instrucoes: "<p>2ª espécie <b>embaixo</b> do cantus de Fux, invertível à 8ª (invertido, o seu contraponto sobe uma ou duas 8ªs e fica em cima). Cadência: mi–dó♯–ré sob fá–mi–ré.</p>",
        texto: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncantus: ${FUX}\ncontraponto:`, duracao: 2, plano: PLANO_CP,
        solucao: `compasso: 2/2\ntom: D dorico\ncf: cantus\ncantus: ${FUX}\ncontraponto: P/2 D3/2 A2 B2 C3 E3 F3 D3 B2 E3 A3 G3 F3 C3 E3 B2 A2 D3 E3 C#3 D3/4` },
      { id: "inv5", titulo: "Quebrar: uma 5ª que não será invertida", modo: "quebrar", ...N1, extras: { ...N1.extras, cpt_invertivel: "info" },
        instrucoes: "<p>1ª espécie em cima, invertível à 8ª — <b>exceto no c. 2</b>: ali use uma 5ª justa no tempo forte. Imagine que, quando o par voltar invertido, você vai reescrever aquela nota (como Bach faz nas reaparições do contrassujeito). A regra de inversão fica como 'info': ela vai apontar o c. 2, e só ele.</p>",
        texto: `tom: C maior\ncf: cantus\ncontraponto: C5/4\ncantus: ${CF1}`, duracao: 4, plano: PLANO_CP,
        solucao: `tom: C maior\ncf: cantus\ncontraponto: ${COM5}\ncantus: ${CF1}`,
        comentarioSolucao: "Lá4 sobre ré4 no c. 2 é a única 5ª. Invertida, vira a 4ª lá3/ré4; na reaparição, troque o lá3 por si3 (veja o exemplo 'A inversão com uma nota reescrita' na seção Como quebrar)." },
    ],
  }, { depoisDe: "florida" });

  // ================================================================== imitação e cânone
  const DUX = "C5/2 D5 G5 F5 D5 E5 F5 C5 A4 C5 E5 D5 B4/4 C5/4";
  const COMES = "P/4 C4/2 D4 G4 F4 D4 E4 F4 C4 A3 C4 D4/4 C4/4";
  const CAN8 = { canone: { guia: 0, intervalo: -8, atraso: 4, ate: 6 } };
  TT.inserir(1, {
    id: "imitacao", titulo: "Imitação e cânone a duas vozes",
    antes: [
      { p: "Num cânone à 8ª abaixo com atraso de um compasso, o que determina a nota do dux no compasso 3?", o: ["O que o comes toca no c. 3 — a cópia do c. 2 do dux, uma 8ª abaixo", "Nada: o dux é livre, só o comes é obrigado", "A nota do dux no c. 1", "A cadência final"], e: "Cada trecho novo do dux soa contra a cópia do trecho anterior. Por isso o cânone se constrói elo por elo: escreve-se um compasso do dux, copia-se no comes e só então se escreve o compasso seguinte do dux contra essa cópia." },
      { p: "Qual a diferença entre imitação e cânone?", o: ["Na imitação a segunda voz repete só o começo e depois segue livre; no cânone a repetição é estrita e contínua", "A imitação é sempre à 8ª; o cânone, à 5ª", "No cânone as vozes entram juntas", "Não há diferença"], e: "Imitar é retomar um motivo (o ponto de imitação de um moteto, a cabeça do sujeito de uma invenção). O cânone é a imitação levada ao limite: a voz que segue (comes) repete toda a melodia da que lidera (dux), até a cadência, quando o cânone se desfaz." },
      { p: "Como termina, em geral, um cânone finito a duas vozes?", o: ["O comes deixa de imitar nos últimos compassos e as duas vozes fazem uma cadência livre", "As duas vozes param juntas, onde o dux terminar a melodia", "O comes termina sozinho, um compasso depois do dux", "Com uma 5ª, para soar aberto"], e: "Como o comes está sempre atrasado, quando o dux chega ao fim o comes ainda deve material. A solução usual é 'liberar' o cânone: as vozes abandonam a imitação e fazem a cadência (6ª maior → 8ª, por exemplo). A outra é o cânone perpétuo, que volta ao começo." },
    ],
    objetivo: "Compor cânones a duas vozes à 8ª e à 5ª, com diferentes atrasos, construindo-os elo por elo, e terminá-los com uma cadência — e conhecer as variantes por inversão e aumentação.",
    ouvir: ["'Frère Jacques' e outros rounds: cânone ao uníssono", "Pachelbel, Cânone em ré: três violinos em cânone sobre um baixo obstinado", "Bach, Variações Goldberg: a cada três variações, um cânone (do uníssono à 9ª)", "Bach, Oferenda Musical: os cânones (inclusive o cânone cancrizans)", "Ockeghem, Missa prolationum: cânones de mensuração", "Webern, Sinfonia op. 21"],
    esboco: "Escreva quatro notas de um dux em mínimas, em dó maior. Agora escreva-as uma 8ª abaixo, deslocadas dois tempos. Que intervalos se formaram entre as vozes? Algum é dissonante?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Uma melodia contra ela mesma", html: `
        <p>Na <b>imitação</b>, uma voz retoma o motivo que outra acabou de apresentar — em outra altura, um pouco depois — e depois segue livre. É o procedimento central do moteto renascentista (o <i>ponto de imitação</i>) e da invenção barroca. O <b>cânone</b> é a imitação estrita e contínua: o <b>comes</b> (a voz que segue) repete toda a melodia do <b>dux</b> (a que lidera), no mesmo ritmo, a um intervalo e a uma distância fixos.</p>
        <h3>As variáveis</h3>
        <ul>
        <li><b>Intervalo:</b> ao uníssono e à 8ª o comes repete as mesmas notas; à 5ª (ou à 4ª) a imitação é <b>diatônica</b>: os intervalos melódicos mantêm o número, mas a qualidade se ajusta ao modo (uma 3ª maior pode virar menor). A 5ª abaixo de dó é fá; acima, sol.</li>
        <li><b>Atraso:</b> quanto menor, mais apertado o cânone. Com atraso de um compasso, cada compasso do dux soa contra o anterior; com meio compasso, cada nota soa contra a nota anterior.</li>
        <li><b>Fim:</b> o cânone <i>finito</i> se desfaz antes da cadência: nos dois últimos compassos o comes deixa de imitar e as vozes cadenciam (6ª maior → 8ª, como no contraponto de espécies). O cânone <i>perpétuo</i> volta ao começo.</li>
        </ul>
        <h3>Construir elo por elo</h3>
        <ol>
        <li>Escreva o primeiro elo do dux (um atraso de comprimento: aqui, um compasso). Ele soa sozinho.</li>
        <li>Copie-o no comes, no intervalo pedido. Escreva o segundo elo do dux <b>contra essa cópia</b>, obedecendo às regras do contraponto (consonância nos tempos fortes, dissonâncias de passagem, sem paralelas).</li>
        <li>Copie o segundo elo no comes; escreva o terceiro contra ele. E assim por diante.</li>
        <li>Planeje o fim: alguns compassos antes, conduza o dux para um registro e um grau de onde as duas vozes possam convergir à cadência.</li>
        </ol>
        <p>Se um elo não tem solução, a correção é sempre <b>no dux</b> (no elo anterior), nunca no comes — senão deixa de ser cânone. Com atraso de meio compasso à 8ª, cada nota do dux tem de ser consonante com a anterior: a linha anda por saltos consonantes, e o grau conjunto só cabe como dissonância de passagem nos tempos fracos.</p>
        <p>Nos exercícios, a regra <b>O comes imita o dux</b> confere cada nota do comes (altura e duração) contra o dux, no intervalo e com o atraso do exercício, até o compasso em que o cânone se desfaz. O resto é contraponto de 5ª espécie.</p>` },
      { tipo: "exemplo", titulo: "Um cânone à 8ª, elo por elo", intro: "Dó maior; o comes entra um compasso depois, uma 8ª abaixo. O cânone vai até o c. 6; os c. 7–8 são a cadência.",
        camadas: [
          { titulo: "Elo 1: o dux sozinho", partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 D5\ncomes: P/4", rotulos: ["dux", "comes"],
            notas: [["decisao", "Dó5–ré5: começa na final e sobe por grau. Num cânone à 8ª, um primeiro elo que sobe por grau é cômodo: o elo seguinte vai soar contra dó4–ré4."]] },
          { titulo: "Elo 2 contra a cópia do elo 1", partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 D5 G5 F5\ncomes: P/4 C4/2 D4", rotulos: ["dux", "comes"],
            anotacoes: [[0, 2, "12 (5)"], [0, 3, "10 (3)"]],
            notas: [["decisao", "Contra dó4–ré4, o dux salta a sol5 (12ª, uma 5ª composta, alcançada sem movimento direto porque o comes estava em pausa) e desce a fá5 (10ª)."],
              ["rejeitada", "Pensei em mi5–fá5 (10ª, 10ª): duas 10ªs paralelas e uma linha que só sobe por grau desde o início. O salto dá forma ao dux — e o clímax sol5 aparece cedo, mas uma vez só."]] },
          { titulo: "Elo 3 contra a cópia do elo 2", partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 D5 G5 F5 D5 E5\ncomes: P/4 C4/2 D4 G4 F4", rotulos: ["dux", "comes"],
            anotacoes: [[0, 4, "5"], [0, 5, "7 pass."]],
            notas: [["decisao", "Contra sol4–fá4 (o salto copiado), ré5 (5ª) e mi5 — uma 7ª sobre fá4, mas de passagem: no próximo elo o dux segue por grau até fá5. As vozes andam em movimento contrário. O dux desce do clímax — e o comes, um compasso atrás, ainda está subindo para o dele."],
              ["checagem", "Sol5/dó4 → fá5/ré4 → ré5/sol4: 5ª composta, 3ª, 5ª, sem paralelas (o fá5 → ré5 contra ré4 → sol4 é movimento contrário)."]] },
          { titulo: "O cânone inteiro e a cadência", partitura: `compasso: 2/2\ntom: C maior\ndux: ${DUX}\ncomes: ${COMES}`, rotulos: ["dux", "comes"], contexto: CAN8,
            notas: [["decisao", "Elos 4–6 do dux: fá5–dó5, lá4–dó5, mi5–ré5, cada um contra a cópia do anterior. O dux desce de registro para deixar a cadência ao alcance."],
              ["decisao", "C. 7–8: o cânone se desfaz. O comes, que deveria copiar mi4–ré4, toca ré4 (semibreve) sob si4: 6ª maior → 8ª dó5/dó4, a cadência do contraponto de espécies."],
              ["checagem", "Até o c. 6 o comes é o dux uma 8ª abaixo, nota por nota e com as mesmas durações; o verificador confere isso (regra 'O comes imita o dux')."]],
            pausa: ["Por que o dux, nos c. 5–6, desce ao lá4 e volta ao mi5, em vez de continuar no agudo?", "Porque o que o dux toca nos c. 5–6 o comes vai tocar nos c. 6–7, e a cadência precisa das duas vozes perto do dó (dux em si4–dó5, comes em ré4–dó4). Num cânone, o fim começa a ser planejado dois elos antes: o último elo copiado tem de levar o comes a um ponto de onde ele chegue à cadência por grau."] },
        ] },
      { tipo: "contraste", titulo: "Imitação que desiste × cânone até a cadência", intro: "Mesmo dux. Em A, o comes imita só dois compassos e depois acompanha; em B, imita até a cadência.",
        a: { rotulo: "A — imitação nos c. 2–3, depois livre", partitura: `compasso: 2/2\ntom: C maior\ndux: ${DUX}\ncomes: P/4 C4/2 D4 G4 F4 A4/4 F4/4 C4/2 G4/2 D4/4 C4/4`, contexto: { canone: { guia: 0, intervalo: -8, atraso: 4, ate: 3 } } },
        b: { rotulo: "B — cânone até o c. 6", partitura: `compasso: 2/2\ntom: C maior\ndux: ${DUX}\ncomes: ${COMES}`, contexto: CAN8 },
        pergunta: "Em qual das duas a segunda voz soa como uma voz independente até o fim? E em qual o ouvido reconhece a melodia duas vezes?",
        comentario: "<p>Em A, depois do c. 3 o comes vira acompanhamento em semibreves: é mais fácil de escrever, mas a textura muda de natureza — passa de diálogo a melodia acompanhada. É o que faz um moteto quando a imitação 'se dissolve' depois do ponto: uma escolha legítima, não um cânone. Em B, cada elo do dux reaparece no comes; o ouvido reconhece a melodia duas vezes, e a cadência dos c. 7–8 soa como chegada do processo inteiro.</p>" },
      { tipo: "quebra", titulo: "Inversão, aumentação, Goldberg e Webern", html: `
        <p>O cânone estrito tem variantes que transformam o dux em vez de só deslocá-lo: por <b>inversão</b> (movimento contrário: cada intervalo que o dux sobe, o comes desce), por <b>aumentação</b> ou diminuição (o comes em valores mais longos ou mais curtos), <b>cancrizans</b> (o dux de trás para frente). Nas <b>Variações Goldberg</b>, Bach escreve um cânone a cada três variações, com o intervalo crescendo do uníssono à 9ª; os cânones à 4ª (var. 12) e à 5ª (var. 15) são por movimento contrário. A <i>Oferenda Musical</i> traz cânones-enigma e um cânone cancrizans; a <i>Arte da Fuga</i>, um cânone por aumentação em movimento contrário. Antes de Bach, Ockeghem construiu a <i>Missa prolationum</i> inteira com cânones de mensuração (as vozes cantam a mesma melodia em velocidades diferentes).</p>
        <p>No séc. XX, Webern usa cânones como estrutura de obras seriais: o 1º movimento da Sinfonia op. 21 é construído como cânone duplo por movimento contrário. O que se ganha é unidade total; o que se arrisca é que o artifício fique inaudível — um cânone por inversão não é reconhecido pelo ouvido como repetição, só como parentesco.</p>`,
        exemplos: [
          { rotulo: "Cânone por inversão à 8ª abaixo, atraso de um compasso", partitura: "compasso: 2/2\ntom: C maior\ndux: C5/2 G4 A4 B4 C5 F5 G5 F5 D5 E5 D5 C5 B4/4 C5/4\ncomes: P/4 C4/2 F4 E4 D4 C4 G3 F3 G3 B3 A3 D4/4 C4/4", rotulos: ["dux", "comes"],
            contexto: { canone: { guia: 0, intervalo: -8, atraso: 4, ate: 6, inversao: true } },
            comentario: "O dux desce uma 4ª (dó5 → sol4); o comes, uma 8ª abaixo, sobe uma 4ª (dó4 → fá4). A cada passo, o movimento contrário garante independência — e o comes acaba numa região grave (fá3–sol3) que a forma reta não alcançaria." },
        ] },
    ],
    exercicios: [
      { id: "imi1", titulo: "Completar: cânone à 8ª em ré dórico", modo: "completar", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 4, ate: 6 } }, alvoCompassos: 8,
        instrucoes: "<p>Cânone à 8ª abaixo, com atraso de um compasso. Três elos do dux e dois do comes estão escritos. Continue elo por elo até o c. 6 (o comes copia o dux uma 8ª abaixo) e cadencie nos c. 7–8: dó♯5 sobre mi4, depois ré5 sobre ré4. As duas vozes são suas.</p>",
        texto: "compasso: 2/2\ntom: D dorico\ndux: D5/2 F5 A5 F5 C5 D5\ncomes: P/4 D4/2 F4 A4 F4", duracao: 2,
        solucao: "compasso: 2/2\ntom: D dorico\ndux: D5/2 F5 A5 F5 C5 D5 E5 D5 B4 C5 D5 E5 C#5/4 D5/4\ncomes: P/4 D4/2 F4 A4 F4 C4 D4 E4 D4 B3 C4 E4/4 D4/4",
        comentarioSolucao: "O dux desce do lá5 por elos curtos (mi5–ré5, si4–dó5) para o comes chegar à cadência no registro certo; no c. 7 o comes abandona a cópia e toca mi4, a 6ª maior sob dó♯5." },
      { id: "imi2", titulo: "Cânone à 5ª abaixo", modo: "menos apoio", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 0, intervalo: -5, atraso: 4, ate: 6 } }, alvoCompassos: 8,
        instrucoes: "<p>Cânone <b>à 5ª abaixo</b> (imitação diatônica em dó maior: dó vira fá, mi vira lá, si vira mi), atraso de um compasso. Só o primeiro elo do dux está escrito. Cânone até o c. 6, cadência nos c. 7–8 (si4/ré4 → dó5/dó4).</p>",
        texto: "compasso: 2/2\ntom: C maior\ndux: C5/2 E5\ncomes: P/4", duracao: 2,
        solucao: "compasso: 2/2\ntom: C maior\ndux: C5/2 E5 D5 C5 B4 A4 C5 B4 A4 G4 B4 C5 B4/4 C5/4\ncomes: P/4 F4/2 A4 G4 F4 E4 D4 F4 E4 D4 C4 D4/4 C4/4",
        comentarioSolucao: "À 5ª abaixo, o comes começa em fá e vive na região da subdominante; a descida por grau do dux (ré5–dó5–si4–lá4) leva o comes de volta ao dó a tempo da cadência." },
      { id: "imi3", titulo: "Atraso de meio compasso", modo: "restrição", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 2, ate: 6 } }, alvoCompassos: 8,
        instrucoes: "<p>Cânone à 8ª abaixo com <b>atraso de uma mínima</b>. <b>Restrição:</b> agora cada nota do dux soa contra a nota anterior dele mesmo, uma 8ª abaixo — as notas seguidas do dux têm de formar consonâncias entre si (3ªs, 6ªs, 8ªs), e o grau conjunto só cabe no tempo fraco, como dissonância de passagem.</p>",
        texto: "compasso: 2/2\ntom: C maior\ndux: E5/2\ncomes: P/2", duracao: 2,
        solucao: "compasso: 2/2\ntom: C maior\ndux: E5/2 C5 E5 C5 A4 C5 E5 F5 D5 E5 C5 D5 B4/4 C5/4\ncomes: P/2 E4/2 C4 E4 C4 A3 C4 E4 F4 D4 E4 C4 D4/4 C4/4",
        comentarioSolucao: "Os saltos de 3ª e 6ª do começo são consequência da restrição. No c. 4 o fá5 entra no tempo fraco como 9ª de passagem (mi5–fá5 contra mi4) e resolve em ré5: o único grau conjunto possível aparece exatamente onde a regra o permite." },
      { id: "imi4", titulo: "Livre: cânone à 5ª acima", modo: "livre", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 1, intervalo: 5, atraso: 4, ate: 6 } }, alvoCompassos: 8,
        instrucoes: "<p>Agora o dux é a voz de <b>baixo</b> e o comes entra em cima, <b>à 5ª acima</b>, um compasso depois (dó vira sol). Cânone até o c. 6, cadência livre nos c. 7–8.</p>",
        texto: "compasso: 2/2\ntom: C maior\ncomes:\ndux:", duracao: 2,
        solucao: "compasso: 2/2\ntom: C maior\ncomes: P/4 G4/2 C5 B4 E5 D5 B4 C5 A4 G4 A4 B4/4 C5/4\ndux: C4/2 F4 E4 A4 G4 E4 F4 D4 C4 D4 E4 C4 D4/4 C4/4" },
      { id: "imi5", titulo: "Quebrar: cânone por inversão", modo: "quebrar", perfil: CANONE, nivel: 5,
        contexto: { nivel: 5, canone: { guia: 0, intervalo: -8, atraso: 4, ate: 6, inversao: true } }, alvoCompassos: 8,
        instrucoes: "<p>Quebre a imitação reta: o comes começa uma 8ª abaixo do dux, um compasso depois, mas <b>em movimento contrário</b> — cada grau que o dux sobe, o comes desce, e vice-versa (como nos cânones das variações 12 e 15 das Goldberg). Cânone até o c. 6, cadência nos c. 7–8.</p>",
        texto: "compasso: 2/2\ntom: D dorico\ndux: D5/2 C5\ncomes: P/4", duracao: 2,
        solucao: "compasso: 2/2\ntom: D dorico\ndux: D5/2 C5 A4 C5 B4 C5 D5 C5 F5 E5 D5 E5 C#5/4 D5/4\ncomes: P/4 D4/2 E4 G4 E4 F4 E4 D4 E4 B3 C4 E4/4 D4/4",
        comentarioSolucao: "O eixo do espelho é o ré: o dux desce ré5–dó5, o comes sobe ré4–mi4; o salto descendente dó5–lá4 vira o salto ascendente mi4–sol4. No c. 7 o comes abandona o espelho e toca mi4 sob dó♯5 para a cadência." },
    ],
  }, { depoisDe: "invertivel" });
})(this);
