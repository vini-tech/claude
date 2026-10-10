/* Nível 3 · Forma: motivo e variação, expansão da frase, binária/ternária/minueto, tema e variações.
 * Fontes: Schoenberg, Fundamentals of Musical Composition (caps. III, XIII–XVII); Koch, Versuch (vol. 3);
 * Riepel, Anfangsgründe (via Eckert, MTO 11.2); Caplin, Classical Form; Schmalfeldt (1992); Rothstein,
 * Phrase Rhythm in Tonal Music; Open Music Theory 2e (3.2–3.7). Melodias: compostas para o livro (não são citações). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL, MELODIA } = T.perfis;

  // ------------------------------------------------------------ utilidades

  // cifras de exemplo: "I V65 IV6 V" (uma por nota do baixo) → [[tempo, cifra]]
  function cif(partitura, cifras) {
    const ex = M.lerTexto(partitura);
    const b = ex.vozes[ex.vozes.length - 1].notas;
    const lista = cifras.trim().split(/\s+/);
    if (lista.length !== b.length) throw new Error(`forma.js: ${lista.length} cifras para ${b.length} notas do baixo em "${partitura.slice(0, 60)}…"`);
    return b.map((n, i) => [n.inicio / M.T, lista[i]]);
  }
  // exemplo com cifras: { rotulo/titulo, partitura, cifras }
  const exc = (partitura, cifras, resto = {}) => ({ partitura, cifras: cif(partitura, cifras), ...resto });

  // ------------------------------------------------------------ regras do capítulo (prefixo frm_)

  const vozAlvo = (ex, ctx) => (ctx.alvo !== undefined ? ctx.alvo : ex.vozes.findIndex((_, i) => i !== ex.cantusFirmus));
  const doCompasso = (ex, v, c) => v.notas.filter((n) => n.inicio >= (c - 1) * ex.duracaoCompasso && n.inicio < c * ex.duracaoCompasso);
  // intervalo diatônico com sinal: +3 = 3ª acima, -2 = 2ª abaixo, 0 = nota repetida
  const passo = (a, b) => {
    const d = b.altura.letra + 7 * b.altura.oitava - (a.altura.letra + 7 * a.altura.oitava);
    return d === 0 ? 0 : Math.sign(d) * (Math.abs(d) + 1);
  };
  const tracos = (ex, ns, base = 0) => ({
    ritmo: ns.map((n) => `${(n.inicio - base) / M.T}:${n.duracao / M.T}`).join(" "),
    duracoes: ns.map((n) => n.duracao),
    inicios: ns.map((n) => n.inicio - base),
    intervalos: ns.slice(1).map((n, k) => passo(ns[k], n)),
    contorno: ns.slice(1).map((n, k) => Math.sign(passo(ns[k], n))).join(" "),
    altura: ns.length ? ns[0].ps : null,
  });
  const NOMES = { ritmo: "o ritmo", intervalos: "os intervalos", contorno: "o contorno", altura: "a nota inicial" };
  const completo = (ex, ns, c, n = 1) => ns.length && ns[ns.length - 1].fim >= (c + n - 1) * ex.duracaoCompasso;

  function igual(a, b, traco) {
    if (traco === "intervalos") return a.intervalos.join(" ") === b.intervalos.join(" ");
    return a[traco] === b[traco];
  }

  /* ctx.motivo = { de: 1, variar: [{ em: 2, manter: ["ritmo", "contorno"], mudar: ["intervalos"] }] } */
  M.definirRegra("frm_variacao", "Variar uns traços, manter outros",
    "Num compasso pedido, a variação mantém os traços indicados do motivo (ritmo, contorno, intervalos) e muda os outros indicados — a definição de Schoenberg: repetição em que alguns traços mudam e os demais se preservam.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      const mt = ctx.motivo;
      if (!v || !mt || !mt.variar) return;
      const C = ex.duracaoCompasso;
      const base = tracos(ex, doCompasso(ex, v, mt.de), (mt.de - 1) * C);
      if (!base.ritmo) return;
      for (const pedido of mt.variar) {
        const c = pedido.em;
        const ns = doCompasso(ex, v, c);
        if (!completo(ex, ns, c)) continue;
        const s = tracos(ex, ns, (c - 1) * C);
        for (const t of pedido.manter || []) {
          if (!igual(base, s, t)) { yield [c, `${v.nome}: o compasso ${c} devia manter ${NOMES[t]} do motivo (compasso ${mt.de})`, ns]; break; }
        }
        for (const t of pedido.mudar || []) {
          if (igual(base, s, t)) { yield [c, `${v.nome}: o compasso ${c} devia mudar ${NOMES[t]} do motivo (compasso ${mt.de}); por enquanto é igual`, ns]; break; }
        }
      }
    }, {
      porque: "Sem traços preservados não se reconhece o motivo (Schoenberg: mudar tudo dá algo 'estranho, incoerente'); sem traços mudados, é só repetição. A arte está em escolher o que fica.",
      corrigir: "Compare com o compasso do motivo: ritmo = mesmas durações nas mesmas posições; contorno = mesma sequência de sobe/desce; intervalos = mesmos passos (3ª acima, 2ª abaixo…). Mude só o que o exercício pede.",
    });

  /* ctx.motivo = { de: 1, inversao: [3], aumentacao: [5] }
   * inversão (tonal): mesmo ritmo, cada intervalo troca de direção e mantém o tamanho (admite ajustar um grau para caber no acorde)
   * aumentação: a partir do compasso indicado, o motivo com as durações dobradas (dois compassos), mesmo desenho */
  M.definirRegra("frm_transformacao", "Inversão e aumentação do motivo",
    "Nos compassos pedidos o motivo aparece invertido (mesmo ritmo, intervalos espelhados: o que subia desce) ou aumentado (durações dobradas, mesmo desenho). Na versão tonal, um intervalo pode crescer ou encolher um grau para caber na harmonia.",
    function* (ex, ctx) {
      const v = ex.vozes[vozAlvo(ex, ctx)];
      const mt = ctx.motivo;
      if (!v || !mt || (!mt.inversao && !mt.aumentacao)) return;
      const C = ex.duracaoCompasso;
      const base = tracos(ex, doCompasso(ex, v, mt.de), (mt.de - 1) * C);
      if (!base.ritmo) return;
      const perto = (a, b) => a.length === b.length && a.every((x, k) => Math.sign(x) === Math.sign(b[k]) && Math.abs(Math.abs(x) - Math.abs(b[k])) <= 1);
      for (const c of mt.inversao || []) {
        const ns = doCompasso(ex, v, c);
        if (!completo(ex, ns, c)) continue;
        const s = tracos(ex, ns, (c - 1) * C);
        if (s.ritmo !== base.ritmo) yield [c, `${v.nome}: a inversão (compasso ${c}) mantém o ritmo do motivo, e o ritmo mudou`, ns];
        else if (!perto(s.intervalos, base.intervalos.map((x) => -x))) yield [c, `${v.nome}: o compasso ${c} não é a inversão do motivo (intervalos esperados: ${base.intervalos.map((x) => (x > 0 ? "desce " : x < 0 ? "sobe " : "repete ") + Math.abs(x || 1)).join(", ")})`, ns];
      }
      for (const c of mt.aumentacao || []) {
        const ns = v.notas.filter((n) => n.inicio >= (c - 1) * C && n.inicio < (c + 1) * C);
        if (!completo(ex, ns, c, 2)) continue;
        const s = tracos(ex, ns, (c - 1) * C);
        const ritmoOk = s.duracoes.length === base.duracoes.length && s.duracoes.every((d, k) => d === 2 * base.duracoes[k] && s.inicios[k] === 2 * base.inicios[k]);
        if (!ritmoOk) yield [c, `${v.nome}: nos compassos ${c}–${c + 1} as durações deviam ser o dobro das do motivo (${base.duracoes.map((d) => (2 * d) / M.T).join(" ")} semínimas)`, ns];
        else if (!perto(s.intervalos, base.intervalos)) yield [c, `${v.nome}: a aumentação (compassos ${c}–${c + 1}) muda o desenho de intervalos do motivo`, ns];
      }
    }, {
      porque: "Inversão e aumentação são, para Schoenberg, repetições 'exatas' sob outra forma: o ouvinte reconhece o motivo pelo ritmo (na inversão) ou pelo desenho (na aumentação), e a mudança dá direção nova à frase.",
      corrigir: "Inversão: copie o ritmo e espelhe cada passo (3ª acima vira 3ª abaixo). Aumentação: dobre cada duração (colcheia → semínima) e mantenha os passos; o motivo de um compasso ocupa dois.",
    });

  /* ctx.cadencias = [{ c: 4, tipo: "semi" | "perfeita" | "evitada" | "engano" | "aberta", tom: "G maior" }] */
  M.definirRegra("frm_cadencias", "Cadências nos compassos do plano",
    "Cada ponto do plano tem a sua cadência: semicadência (o compasso termina num V em estado fundamental), perfeita (V–I em estado fundamental no tempo forte, tônica na melodia), evitada (o V não vai para o I em estado fundamental), de engano (V → vi/VI) ou aberta (sem V–I: a tônica é prolongada). O tom local pode ser indicado.",
    function* (ex, ctx) {
      if (!ctx.cadencias || !ctx.cifras || !ex.tonalidade) return;
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const mel = ex.vozes[0];
      const C = ex.duracaoCompasso;
      const tomOk = (h, tom) => {
        if (!tom) return true;
        const t = M.interpretarTom(tom);
        return h.tom.tonica.nome === t.tonica.nome && (h.tom.modo === "minor") === (t.modo === "minor");
      };
      const raizV = (h) => h && h.cifra.grau === 5 && h.cifra.membroBaixo === 0 && !h.cifra.secundaria;
      const raizI = (h) => h && h.cifra.grau === 1 && h.cifra.membroBaixo === 0 && !h.cifra.secundaria && !h.cifra.seisQuatro;
      for (const cd of ctx.cadencias) {
        const c = cd.c, t0 = (c - 1) * C, t1 = c * C;
        const nomeTom = cd.tom ? ` em ${cd.tom}` : "";
        if (cd.tipo === "semi") {
          const h = hs.filter((x) => x.inicio < t1).pop();
          if (!h || h.fim < t1) continue;
          if (!(raizV(h) && !h.cifra.setima)) yield [c, `o compasso ${c} devia terminar numa semicadência${nomeTom} (V em estado fundamental, sem 7ª); termina em ${h.texto}`, [h.baixo]];
          else if (!tomOk(h, cd.tom)) yield [c, `a semicadência do compasso ${c} devia estar${nomeTom}`, [h.baixo]];
          continue;
        }
        const k = hs.findIndex((x) => x.inicio <= t0 && t0 < x.fim);
        if (k < 0) continue;
        const h = hs[k], ant = hs[k - 1];
        if (cd.tipo === "perfeita") {
          const m = mel.soandoEm(t0);
          if (!(raizI(h) && raizV(ant) && h.inicio === t0)) yield [c, `no compasso ${c} o plano pede cadência perfeita${nomeTom}: V(7) → I em estado fundamental, com o I no tempo forte (está ${ant ? ant.texto : "?"} → ${h.texto})`, [h.baixo]];
          else if (!tomOk(h, cd.tom)) yield [c, `a cadência do compasso ${c} devia confirmar ${cd.tom}`, [h.baixo]];
          else if (m && m.altura.nome !== h.tom.tonica.nome) yield [c, `cadência perfeita no compasso ${c}: a melodia devia chegar à tônica (${h.tom.tonica.nome}), e está em ${m.nome}`, [m]];
        } else if (cd.tipo === "evitada" || cd.tipo === "engano") {
          if (!raizV(ant) || h.inicio !== t0) yield [c, `no compasso ${c} a cadência evitada precisa de um V(7) em estado fundamental logo antes do tempo forte (está ${ant ? ant.texto : "?"} → ${h.texto})`, [h.baixo]];
          else if (raizI(h)) yield [c, `no compasso ${c} o V resolve no I em estado fundamental: a cadência não foi evitada`, [h.baixo]];
          else if (cd.tipo === "engano" && h.cifra.grau !== 6) yield [c, `no compasso ${c} a cadência de engano vai do V ao vi (ou VI); está ${h.texto}`, [h.baixo]];
        } else if (cd.tipo === "aberta") {
          const fim = hs.filter((x) => x.inicio < t1 && x.fim > t0 - C);
          const cadencia = fim.some((x, i) => i > 0 && raizI(x) && raizV(fim[i - 1]));
          const ult = fim[fim.length - 1];
          if (cadencia) yield [c, `nos compassos ${c - 1}–${c} há um V → I em estado fundamental: o plano pede que a seção termine sem cadência, prolongando a tônica`, []];
          else if (ult && !(ult.cifra.grau === 1 && !ult.cifra.secundaria)) yield [c, `o compasso ${c} devia terminar na tônica (prolongada, sem cadência); termina em ${ult.texto}`, [ult.baixo]];
        }
      }
    }, {
      precisaTom: true,
      porque: "A forma é feita de cadências de força diferente nos lugares certos: é por elas que o ouvinte sabe onde está (Koch chamava esses pontos de 'pontos de repouso' do discurso).",
      corrigir: "Confira as cifras no compasso indicado: semicadência = termina em V; perfeita = V → I no tempo forte, os dois em estado fundamental, com a tônica na melodia; evitada = o V vai para outra coisa (vi, I6, V42/IV…).",
    });
  for (const id of ["frm_cadencias"]) M.OLHA_ADIANTE.add(id);

  // ------------------------------------------------------------ perfis do módulo

  const BASE = { ...TONAL, notas_do_acorde: "erro" };          // melodia sobre baixo cifrado, sem exigir final na tônica
  const PLANO_MOTIVO = [
    ["Motivo", "Quais são os traços do motivo: ritmo, intervalos, contorno, harmonia implícita?"],
    ["O que fica, o que muda", "Em cada compasso pedido, qual traço você preserva e qual transforma?"],
    ["Cadência", "Onde o motivo se dissolve (liquidação) para a frase poder cadenciar?"],
  ];

  // ================================================================== 1. MOTIVO E VARIAÇÃO

  const C1 = "tom: C maior\nmelodia: C5/1 E5/0.5 D5 C5/1 G4/1 C5/1 E5/0.5 D5 C5/1 A4/1 C5/1 A4/0.5 B4 C5/1 F5/1 D5/1.5 C5/0.5 B4/2";
  const C1B = "C3/4 A2/4 F2/4 G2/4";
  const C1_8 = "tom: C maior\nmelodia: C5/1 E5/0.5 D5 C5/1 G4/1 C5/1 E5/0.5 D5 C5/1 A4/1 C5/1 A4/0.5 B4 C5/1 F5/1 D5/1.5 C5/0.5 B4/2 C5/1 G5/0.5 F5 E5/1 C5/1 C5/0.5 E5/0.25 D5 C5/0.5 G4/0.5 D5/0.5 F5/0.25 E5 D5/0.5 A4/0.5 E5/1 G5/1 D5/1 B4/1 C5/4\nbaixo: C3/4 A2/4 F2/4 G2/4 C3/4 E3/2 F3/2 G2/2 G2/2 C3/4";
  const C1_8B = "tom: C maior\nmelodia: G4/2 C5/0.5 D5 E5/1 C5/0.25 B4 A4 B4 C5/3 F5/2 A4/1 C5/1 B4/0.5 D5 G5 D5 B4/2 E5/3 C5/1 G5/1 E5/1 A5/0.5 F5 D5/1 E5/0.5 D5 E5 F5 G5/1 D5/1 C5/4\nbaixo: C3/4 A2/4 F2/4 G2/4 C3/4 E3/2 F3/2 G2/2 G2/2 C3/4";
  const C1_CIF = "I vi IV V I I6 ii6 I64 V I";

  T.inserir(3, {
    id: "motivo", titulo: "Motivo e variação",
    antes: [
      { p: "Para Schoenberg, o que é uma variação?", o: ["Uma repetição em que alguns traços mudam e os outros se preservam", "Qualquer melodia nova sobre a mesma harmonia", "A repetição exata em outra altura", "Uma melodia com mais notas que a original"], e: "\"Variação é repetição em que alguns traços são mudados e o resto preservado\" (Fundamentals, cap. III). Mudar tudo produz algo estranho e incoerente; não mudar nada é só repetição. Transposição exata, para ele, ainda conta como repetição." },
      { p: "Qual traço, preservado, mais garante a coerência segundo Schoenberg?", o: ["O ritmo", "O registro", "A dinâmica", "A nota inicial"], e: "Preservar o ritmo 'produz coerência' mesmo quando os intervalos mudam bastante — é por isso que um motivo se reconhece sob harmonias diferentes." },
      { p: "O que é a inversão de um motivo?", o: ["O mesmo ritmo com os intervalos espelhados: o que subia desce", "O motivo tocado de trás para a frente", "O motivo com as durações dobradas", "O motivo uma oitava abaixo"], e: "De trás para a frente é o retrógrado; durações dobradas, a aumentação. Na música tonal a inversão costuma ajustar um intervalo para caber no acorde (inversão tonal)." },
    ],
    objetivo: "Construir uma frase a partir de um único motivo, escolhendo em cada compasso que traço preservar (ritmo, contorno, intervalos) e qual transformar.",
    ouvir: ["Beethoven, Sinfonia nº 5, 1º mov.: o motivo de quatro notas, quase só ritmo", "Brahms, Sinfonia nº 4, 1º mov.: o tema como cadeia de terças (o exemplo de Schoenberg)", "Beethoven, Sonata op. 2 nº 1, 1º mov., c. 1–8", "Rachmaninoff, Rapsódia sobre um tema de Paganini, variação 18 (o tema invertido)"],
    esboco: "Escreva um motivo de um compasso sobre o acorde de tônica e, embaixo, três versões: uma que mantém só o ritmo, uma que mantém só o contorno, uma invertida.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "O motivo e os operadores de variação (Schoenberg)", html: `
        <p>Para Schoenberg (<i>Fundamentals of Musical Composition</i>, cap. III) o motivo é a menor unidade que se repete de modo reconhecível: <b>intervalos e ritmo combinados num contorno memorável</b>, que em geral implica uma harmonia. A tradição (Marx, depois Schoenberg e Caplin) ensina um repertório fechado de operações sobre ele, e uma regra para usá-las: <b>variar alguns traços e preservar os outros</b>. Mudar tudo dá algo "estranho, incoerente, ilógico"; preservar o ritmo é o que mais garante coerência.</p>
        <table class="tabela-modos"><thead><tr><th>Traço</th><th>Operações (Schoenberg, exs. 17–29)</th></tr></thead><tbody>
        <tr><td>Ritmo</td><td>mudar durações; repetir notas; repetir células rítmicas; deslocar no compasso; acrescentar anacruse</td></tr>
        <tr><td>Intervalos</td><td>mudar ordem ou direção; acrescentar ou omitir intervalos; preencher saltos com passagens e bordaduras; condensar; inverter</td></tr>
        <tr><td>Harmonia</td><td>reharmonizar a mesma melodia; inverter o acorde; inserir ou substituir acordes</td></tr>
        <tr><td>Adaptação melódica</td><td>transpor e ajustar os intervalos ao acorde novo (a 4ª vira 3ª para caber no vi)</td></tr></tbody></table>
        <p>Schoenberg separa as <b>repetições exatas sob outra forma</b> — transposição, inversão, aumentação, diminuição, que preservam as relações — da <b>variação</b> propriamente dita, que muda traços. E distingue a <i>variante</i> local, sem consequência, da <i>forma do motivo</i> que gera continuação. A música homofônica depois de 1750, diz ele, produz seu material por <b>variação desenvolvente</b>: cada formulação nova deriva da anterior, e Brahms seria o estágio mais avançado dessa técnica.</p>
        <h3>Como trabalhar</h3>
        <ol><li>Liste os traços do motivo: ritmo, intervalos (em graus, com direção), contorno, harmonia implícita.</li>
        <li>Para cada compasso novo, decida <b>um</b> traço que muda; os outros ficam. O baixo decide muitas vezes por você: o acorde novo obriga a adaptar intervalos.</li>
        <li>Perto da cadência, liquide: retire os traços característicos até sobrar a fórmula cadencial.</li></ol>` },
      { tipo: "exemplo", titulo: "Uma frase de um motivo só", intro: "Dó maior, 4/4. O baixo e as cifras foram decididos antes; cada compasso aplica uma operação diferente ao motivo do compasso 1.",
        camadas: [
          { titulo: "O motivo e os seus traços", partitura: "tom: C maior\nmotivo: C5/1 E5/0.5 D5 C5/1 G4/1", rotulos: ["motivo"],
            anotacoes: [[0, 0, "♩"], [0, 1, "3ª ↑"], [0, 2, "passagem"], [0, 4, "4ª ↓"]],
            notas: [["decisao", "Ritmo ♩ ♪♪ ♩ ♩ (semínima, duas colcheias, duas semínimas); intervalos +3, −2, −2, −4; contorno sobe–desce–desce–desce; harmonia implícita: I (o ré é passagem)."],
              ["rejeitada", "Pensei num arpejo puro (C5–E5–G5–E5). Sem a nota de passagem o motivo fica sem 'lado melódico': as variações de intervalo (preencher, condensar) teriam pouco com que trabalhar."]] },
          { titulo: "Antecedente: reharmonizar, inverter, liquidar", partitura: `${C1}\nbaixo: ${C1B}`, rotulos: ["melodia", "baixo"], cifras: cif(`${C1}\nbaixo: ${C1B}`, "I vi IV V"),
            anotacoes: [[0, 0, "motivo"], [0, 5, "sobre vi"], [0, 10, "inversão"], [0, 15, "liquidação"]],
            notas: [["decisao", "C. 2: a mesma melodia sobre vi (operador de harmonia). Só o último intervalo se adapta: G4 não é do acorde de lá menor, A4 é — a 4ª descendente vira 3ª."],
              ["decisao", "C. 3: inversão exata (−3, +2, +2, +4: C5–A4–B4–C5–F5) sobre IV. O ritmo intacto faz o ouvido reconhecer o motivo de cabeça para baixo."],
              ["decisao", "C. 4: liquidação — sobram três notas (D5–C5–B4), sem a figura de colcheias; semicadência na sensível."],
              ["rejeitada", "Inverter já no c. 2 sobre V: C5–A4 seria um salto para fora do acorde no tempo fraco, e o ouvinte ainda não teria fixado o original. Primeiro afirmar, depois transformar."],
              ["checagem", "Baixo C3–A2–F2–G2: contrário ou oblíquo nas chegadas; F5/F2 → D5/G2 por movimento contrário, sem 5ª direta."]],
            pausa: ["Por que o c. 2 repete a melodia em vez de variá-la?", "Porque a variação ali é harmônica: a mesma melodia soa diferente sobre vi. Mudar ao mesmo tempo a harmonia e a melodia logo no segundo compasso enfraqueceria o motivo antes de ele ser reconhecido."] },
          { titulo: "A frase inteira: variação desenvolvente até a cadência", partitura: C1_8, rotulos: ["melodia", "baixo"], cifras: cif(C1_8, C1_CIF),
            anotacoes: [[0, 20, "intervalos ampliados"], [0, 25, "diminuição"], [0, 30, "sequência"]],
            notas: [["decisao", "C. 5: volta o começo, mas com o primeiro intervalo ampliado (+5: C5–G5–F5–E5–C5). Ritmo e contorno ficam, intervalos mudam — a regra de Schoenberg em estado puro."],
              ["decisao", "C. 6: diminuição (tudo pela metade) e sequência uma 2ª acima sobre I6–ii6: a fragmentação acelera a frase rumo à cadência."],
              ["decisao", "C. 7: sem colcheias — E5–G5–D5–B4 sobre I64–V. O clímax G5 chega quando o motivo já foi liquidado."],
              ["rejeitada", "Repetir o c. 1 literalmente no c. 5 faria um período comum; aqui quis mostrar que até a volta pode ser variação."],
              ["checagem", "Reduza cada compasso ao seu traço preservado: ritmo (c. 2, 3, 5), desenho de intervalos (c. 3, 6). Nenhum compasso muda tudo de uma vez."]],
            pausa: ["Qual compasso está mais longe do motivo, e por que ele ainda soa como parte da mesma frase?", "O c. 7: não tem a figura rítmica nem os intervalos. Ele soa coerente porque a liquidação foi gradual (c. 4, depois c. 6) e porque chega como cadência — o ouvinte espera material convencional ali."] },
        ] },
      { tipo: "contraste", titulo: "Um motivo variado × uma ideia nova por compasso",
        a: { rotulo: "A — um motivo, operações escolhidas", partitura: C1_8, cifras: cif(C1_8, C1_CIF) },
        b: { rotulo: "B — mesmas harmonias, uma figura diferente em cada compasso", partitura: C1_8B, cifras: cif(C1_8B, C1_CIF) },
        pergunta: "As duas passam no verificador. Qual delas você reconheceria se a ouvisse de novo amanhã? O que, exatamente, fica na memória?",
        comentario: "<p>Em B cada compasso traz uma figura nova — mínima e colcheias, semicolcheias, arpejo, notas longas. Nada é errado, mas nada se repete: o ouvinte não sabe o que é essencial, e o c. 7 não soa como liquidação porque não havia nada a liquidar. Em A o ritmo ♩ ♪♪ ♩ ♩ volta em três compassos e o desenho de intervalos em outros dois; a variedade vem das operações, não de material novo. É o que Schoenberg chama de mudar tudo: 'algo estranho, incoerente'.</p>" },
      { tipo: "quebra", titulo: "Quando a variação não volta ao motivo", html: `
        <p>A regra pede um motivo de referência e variações que preservam traços dele. Dois extremos do repertório tensionam a regra sem abandoná-la:</p>
        <ul><li><b>Beethoven, 5ª Sinfonia:</b> o motivo de abertura é quase só ritmo (três notas repetidas e uma longa). O ritmo fica, e altura, intervalo, harmonia e instrumentação mudam o tempo todo — o caso-limite da preferência de Schoenberg pelo ritmo.</li>
        <li><b>Brahms e a variação desenvolvente:</b> cada formulação deriva da anterior, não do motivo original. Depois de alguns elos, o que se ouve pode não compartilhar nenhum traço literal com o começo; a coerência está na cadeia. Schoenberg usa o tema da 4ª Sinfonia (uma sucessão de terças) como exemplo de motivo mínimo.</li>
        <li><b>Rachmaninoff, Rapsódia sobre um tema de Paganini, var. 18:</b> a inversão, desacelerada e em outro modo, vira uma melodia lírica independente — a operação 'exata' produz um tema novo.</li></ul>
        <p>O que a quebra produz: continuidade sem retorno. O preço é que o ouvinte precisa de outros apoios (harmonia clara, cadências) para não se perder.</p>`,
        exemplos: [
          { rotulo: "Beethoven, Sinfonia nº 5, início (só a melodia)", partitura: "compasso: 2/4\ntom: C menor\nmelodia: P/0.5 G4/0.5 G4 G4 Eb4/2 P/0.5 F4/0.5 F4 F4 D4/2~ D4/2", comentario: "Mesmo ritmo, outra altura e outro intervalo (3ª maior, depois 3ª menor): o ritmo carrega a identidade. As fermatas sobre as notas longas não aparecem aqui." },
          exc("tom: G maior\nmelodia: B4/1 D5/1 G5/2 F#5/2 D5/1 A4/1 B4/2 E5/1 G5/1 G4/0.5 C5/0.5 E5/3 E5/1 C5/1 A4/2 G4/4\nbaixo: G2/4 D3/4 G2/4 E3/4 C3/2 D3/2 G2/4", "I V vi6 IV6 ii6 V I",
            { rotulo: "Cadeia de variações (exemplo construído)", perfil: { ...BASE }, contexto: { plano: { cadencia: 6 } },
              comentario: "C. 2 = ritmo do c. 1 invertido no tempo e intervalos espelhados; c. 3 = ritmo do c. 2 com intervalos novos; c. 4 = intervalos do c. 3 com ritmo novo. O c. 4 quase não tem nada do c. 1 — cada elo só se explica pelo anterior. C. 5 liquida." }),
        ] },
    ],
    exercicios: [
      { id: "mot1", titulo: "Adaptar e inverter", modo: "completar", perfil: { ...BASE, semicadencia: "erro", frm_variacao: "erro", frm_transformacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4 }, motivo: { de: 1, variar: [{ em: 2, manter: ["ritmo", "contorno"], mudar: ["intervalos"] }], inversao: [3] } },
        cifras: "I V7 vi ii6 V".split(" "),
        instrucoes: "<p>O motivo (c. 1), o baixo e as cifras estão dados. Escreva os c. 2–4: no <b>c. 2</b> mantenha o ritmo e o contorno do motivo, mas adapte os intervalos ao V7; no <b>c. 3</b> escreva a inversão do motivo sobre vi; no <b>c. 4</b> liquide até a semicadência.</p>",
        texto: "tom: C maior\ncf: baixo\nmelodia: E5/0.5 D5 C5/1 G5/1 E5/1\nbaixo: C3/4 G2/4 A2/4 F2/2 G2/2", duracao: 1, alvoCompassos: 4, plano: PLANO_MOTIVO,
        solucao: "tom: C maior\ncf: baixo\nmelodia: E5/0.5 D5 C5/1 G5/1 E5/1 D5/0.5 C5 B4/1 D5/1 G4/1 C5/0.5 D5 E5/1 A4/1 C5/1 D5/1.5 C5/0.5 B4/2\nbaixo: C3/4 G2/4 A2/4 F2/2 G2/2",
        comentarioSolucao: "Motivo: −2, −2, +5, −3. C. 2: −2, −2, +3, −4 (o salto encolhe para caber no V7). C. 3: +2, +2, −5, +3 — a inversão exata cabe em lá menor. C. 4: D5–C5–B4, semicadência na sensível." },
      { id: "mot2", titulo: "Um ritmo, quatro variações", modo: "menos apoio", perfil: { ...MELODIA, semicadencia: "erro", frm_variacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, motivo: { de: 1, variar: [2, 3, 5, 6].map((em) => ({ em, manter: ["ritmo"] })) } },
        cifras: "i V7 i iv6 V i6 iv i64 V i".split(" "),
        instrucoes: "<p>Lá menor. O motivo (c. 1) e o baixo cifrado estão dados. Componha os c. 2–8: os <b>c. 2, 3, 5 e 6</b> mantêm o ritmo do motivo (♩. ♪ ♩ ♩) com intervalos à sua escolha; semicadência no c. 4, cadência perfeita no c. 8.</p>",
        texto: "tom: A menor\ncf: baixo\nmelodia: E5/1.5 D5/0.5 C5/1 A4/1\nbaixo: A2/4 E2/4 A2/4 F2/2 E2/2 C3/4 D3/4 E3/2 E3/2 A2/4", duracao: 1, alvoCompassos: 8, plano: PLANO_MOTIVO,
        solucao: "tom: A menor\ncf: baixo\nmelodia: E5/1.5 D5/0.5 C5/1 A4/1 D5/1.5 C5/0.5 B4/1 G#4/1 A4/1.5 B4/0.5 C5/1 E5/1 D5/1 A4/1 B4/2 E5/1.5 D5/0.5 C5/1 A4/1 F5/1.5 E5/0.5 D5/1 A4/1 C5/1 E5/1 B4/2 A4/4\nbaixo: A2/4 E2/4 A2/4 F2/2 E2/2 C3/4 D3/4 E3/2 E3/2 A2/4",
        comentarioSolucao: "C. 2: sequência uma 2ª abaixo (mesmo desenho). C. 3: contorno invertido (sobe), que resolve o sol♯. C. 5: o motivo volta sobre i6. C. 6: o primeiro salto cresce (F5 em vez de E5) sobre iv. C. 7 liquida." },
      { id: "mot3", titulo: "O motivo alargado antes da cadência", modo: "restrição", perfil: { ...MELODIA, semicadencia: "erro", frm_transformacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, motivo: { de: 1, aumentacao: [5] } },
        cifras: "I V7 I ii6 V I I6 ii6 I64 V7 I".split(" "),
        instrucoes: "<p>Sol maior. Motivo no c. 1, baixo e cifras dados. <b>Restrição:</b> nos c. 5–6 o motivo volta em <b>aumentação</b> (todas as durações dobradas, mesmo desenho), como uma respiração antes da cadência. Semicadência no c. 4 e cadência perfeita no c. 8.</p>",
        texto: "tom: G maior\ncf: baixo\nmelodia: D5/1 B4/0.5 C5/0.5 D5/2\nbaixo: G2/4 D3/4 G2/4 C3/2 D3/2 G3/4 B2/4 C3/2 D3/1 D3/1 G2/4", duracao: 1, alvoCompassos: 8, plano: PLANO_MOTIVO,
        solucao: "tom: G maior\ncf: baixo\nmelodia: D5/1 B4/0.5 C5/0.5 D5/2 C5/1 A4/0.5 B4/0.5 C5/2 B4/1 G4/0.5 A4/0.5 B4/2 C5/1 E5/1 F#5/2 D5/2 B4/1 C5/1 D5/4 C5/2 B4/1 A4/1 G4/4\nbaixo: G2/4 D3/4 G2/4 C3/2 D3/2 G3/4 B2/4 C3/2 D3/1 D3/1 G2/4",
        comentarioSolucao: "C. 2–3: sequência descendente do motivo. C. 4 sobe até F#5 (semicadência na sensível). C. 5–6: D5 (mínima) B4–C5 (semínimas) | D5 (semibreve) — o motivo em câmera lenta sobre I e I6, e a cadência volta ao movimento em semínimas." },
      { id: "mot4", titulo: "Livre: seu motivo, três operações", modo: "livre", perfil: { ...MELODIA, semicadencia: "erro", frm_variacao: "erro", frm_transformacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, motivo: { de: 1, variar: [{ em: 2, manter: ["ritmo"], mudar: ["intervalos"] }], inversao: [3] } },
        cifrasAluno: true, alvoCompassos: 8,
        instrucoes: "<p>Ré menor. Componha melodia, baixo e cifras de uma frase de 8 compassos sobre um motivo seu (c. 1): <b>c. 2</b> com o mesmo ritmo e outros intervalos, <b>c. 3</b> com a inversão do motivo; semicadência no c. 4 e cadência perfeita no c. 8. Do c. 5 em diante, a escolha das operações é sua (anote no plano).</p>",
        texto: "tom: D menor\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_MOTIVO,
        solucao: "tom: D menor\nmelodia: A4/1 F4/0.5 G4 A4/1 D5/1 E5/1 C#5/0.5 D5 E5/1 C#5/1 D5/1 F5/0.5 E5 D5/1 Bb4/1 Bb4/1 G4/1 A4/2 A4/1 F4/0.5 G4 A4/1 D5/1 Bb4/1 G4/0.5 A4 Bb4/1 D5/1 F5/2 E5/1 C#5/1 D5/4\nbaixo: D3/4 A2/4 Bb2/4 Bb2/2 A2/2 D3/4 G2/4 A2/2 A2/2 D3/4",
        solucaoCifras: "i V VI iv6 V i iv i64 V7 i",
        comentarioSolucao: "Motivo −3, +2, +2, +4. C. 2 sobre V: −3, +2, +2, −3. C. 3: inversão tonal sobre VI (o último intervalo encolhe de 4ª para 3ª para cair no si♭). C. 5 retoma o motivo, c. 6 o transpõe sobre iv, c. 7 liquida em 6–5 sobre i64–V7." },
      { id: "mot5", titulo: "Quebrar: os intervalos ficam, o ritmo muda", modo: "quebrar", perfil: { ...MELODIA, semicadencia: "erro", frm_variacao: "erro", sequencia_do_motivo: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, motivo: { de: 1, em: [2, 3, 6], variar: [2, 3, 6].map((em) => ({ em, manter: ["intervalos"], mudar: ["ritmo"] })) } },
        cifras: "i VI iv V i iv6 i64 V i".split(" "),
        instrucoes: "<p>Mi menor. Contra a preferência de Schoenberg pelo ritmo, faça como na variação desenvolvente de Brahms: nos <b>c. 2, 3 e 6</b> preserve o desenho de intervalos do motivo (3ª abaixo, 2ª acima, 2ª acima) e <b>mude o ritmo</b> a cada vez. O que mantém a unidade agora é o intervalo; para o ouvinte não se perder, deixe a harmonia e as cadências bem claras (semicadência no c. 4, perfeita no c. 8).</p>",
        texto: "tom: E menor\ncf: baixo\nmelodia: B4/1 G4/0.5 A4/0.5 B4/2\nbaixo: E3/4 C3/4 A2/4 B2/4 E3/4 C3/4 B2/2 B2/2 E3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_MOTIVO,
        solucao: "tom: E menor\ncf: baixo\nmelodia: B4/1 G4/0.5 A4/0.5 B4/2 E5/2 C5/0.5 D5/0.5 E5/1 C5/0.5 A4/0.5 B4/1 C5/2 B4/1 F#4/1 B4/2 B4/1 G4/0.5 A4/0.5 B4/2 E5/2 C5/1 D5/0.5 E5/0.5 G5/2 F#5/1 D#5/1 E5/4\nbaixo: E3/4 C3/4 A2/4 B2/4 E3/4 C3/4 B2/2 B2/2 E3/4",
        comentarioSolucao: "O desenho −3, +2, +2 aparece com três ritmos: 2–½–½–1 (c. 2), ½–½–1–2 (c. 3), 2–1–½–½ (c. 6). A identidade passa do ritmo para o intervalo; a regularidade das cadências segura a forma." },
    ],
  }, { antesDe: "sentenca" });

  // ================================================================== 2. EXPANSÃO DA FRASE

  const E_ANT = "C5/1 A4/0.5 Bb4/0.5 C5/1 F5/1 E5/1.5 D5/0.5 C5/2 C5/1 F5/1 F5/1 D5/1 C5/1 D5/1 E5/2";
  const E_ANTB = "F3/4 C3/4 A2/2 Bb2/2 C3/4", E_ANTC = "I V7 I6 IV V";
  const E5 = "C5/1 A4/0.5 Bb4/0.5 C5/1 F5/1", E6 = "D5/1 Bb4/0.5 C5/0.5 D5/1 F5/1", E7 = "A5/2 G5/1 E5/1";
  const expF = (mel, bx, c, resto) => exc(`tom: F maior\nmelodia: ${E_ANT} ${mel}\nbaixo: ${E_ANTB} ${bx}`, `${E_ANTC} ${c}`, resto);
  const E_L1 = expF(`${E5} ${E6} ${E7} F5/4`, "F3/4 Bb2/4 C3/2 C3/2 F3/4", "I IV I64 V7 I");
  const E_L3 = expF(`${E5} ${E6} ${E7} F5/2 D5/2 ${E7} F5/4`, "F3/4 Bb2/4 C3/2 C3/2 D3/2 Bb2/2 C3/2 C3/2 F3/4", "I IV I64 V7 vi IV I64 V7 I");
  const PLANO_EXP = [
    ["Frase-modelo", "Como seria a frase sem expansão (4 compassos, cadência no 4º)?"],
    ["Onde expandir", "Que compasso você repete, estica ou insere — e por quê ali?"],
    ["Cadência", "Onde a cadência é evitada e onde finalmente chega?"],
  ];

  T.inserir(3, {
    id: "expansao", titulo: "Expansão da frase",
    antes: [
      { p: "O que é uma expansão interna da frase?", o: ["Um acréscimo entre o começo e a cadência (repetição, estiramento, cadência evitada) que adia a chegada", "Uma introdução antes da frase", "Uma codetta depois da cadência", "Encurtar a frase de 4 para 3 compassos"], e: "Introdução é prefixo e codetta é sufixo — expansões externas, fora dos limites da frase. Encurtar é contração. A expansão interna acontece antes da cadência e muda o tamanho da própria frase." },
      { p: "O que é a técnica do 'one more time' (Schmalfeldt)?", o: ["A cadência é evitada e a frase volta atrás para tentar de novo, muitas vezes com o mesmo material", "Repetir a peça inteira", "Repetir a cadência perfeita depois que ela já chegou", "Tocar o tema uma oitava acima"], e: "Três passos: a música tenta cadenciar, a cadência é evitada (de engano ou com o I invertido) e o material pré-cadencial volta para uma nova tentativa, que agora fecha." },
      { p: "O que é uma elisão?", o: ["O compasso da cadência é ao mesmo tempo o primeiro da frase seguinte", "Uma cadência de engano", "A omissão da semicadência", "Uma pausa entre duas frases"], e: "Na elisão (Koch: Tacterstickung; Rothstein: '8 = 1') a chegada de uma frase coincide com o começo da outra: um compasso 'desaparece' da contagem e a música não para." },
    ],
    objetivo: "Transformar uma frase-modelo de 4 + 4 compassos numa frase assimétrica e convincente, por repetição, cadência evitada, 'one more time' e sufixo.",
    ouvir: ["Beethoven, Sonata 'Patética' op. 13, 3º mov.: o refrão que poderia ter 8 compassos tem 17 na primeira vez", "Beethoven, Sinfonia nº 9, Scherzo: 'ritmo di tre battute' (grupos de 3 compassos)", "Brahms, Variações sobre um tema de Haydn op. 56a: o tema abre com duas frases de 5 compassos", "Mozart, Sonata K. 545, 1º mov.: cadências evitadas antes do fim da exposição"],
    esboco: "Pegue um consequente de 4 compassos (I | IV | I64 V7 | I) e escreva só o plano harmônico de duas versões mais longas: uma com repetição, outra com cadência de engano.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "A frase-modelo e as maneiras de esticá-la (Koch, Riepel, Caplin)", html: `
        <p>Riepel e Koch ensinavam a compor a partir de frases de <b>4 compassos</b> agrupadas aos pares, e a fazer delas, depois, frases maiores. Koch (<i>Versuch</i>, vol. 3) descreve o procedimento: escrever a forma-modelo e então <b>estendê-la</b> — repetindo um segmento (exato ou em sequência), acrescentando um apêndice depois da cadência, inserindo um parêntese, prolongando a cadência; também descreve a fusão de duas frases pela supressão de um compasso (<i>Tacterstickung</i>). A regra de fundo é que a expansão <b>não apaga a frase-modelo</b>: ainda se ouve de onde ela partiu e onde quer chegar.</p>
        <table class="tabela-modos"><thead><tr><th>Técnica</th><th>Onde</th><th>O que faz</th></tr></thead><tbody>
        <tr><td>Repetição</td><td>dentro da frase</td><td>um compasso (ou grupo) volta, exato ou em sequência: 4 → 5</td></tr>
        <tr><td>Estiramento</td><td>dentro</td><td>a progressão é a mesma, com acordes mais longos (um por compasso na cadência)</td></tr>
        <tr><td>Cadência evitada / de engano</td><td>no ponto de chegada</td><td>o V não vai ao I em estado fundamental (vai a vi, I6, V42/IV): a frase precisa continuar</td></tr>
        <tr><td>'One more time' (Schmalfeldt 1992)</td><td>depois da evitada</td><td>o material pré-cadencial volta e a cadência é tentada de novo</td></tr>
        <tr><td>Prefixo / sufixo</td><td>antes / depois</td><td>introdução; codetta ou extensão pós-cadencial, sobre a tônica</td></tr>
        <tr><td>Elisão</td><td>na junção</td><td>a cadência de uma frase é o 1º compasso da seguinte (8 = 1)</td></tr>
        <tr><td>Contração</td><td>dentro</td><td>a frase chega antes do esperado (mais rara)</td></tr></tbody></table>
        <p>Caplin e Rothstein distinguem as expansões <b>internas</b> (entre o começo e a cadência: mudam o tamanho da frase) das <b>externas</b> (prefixo e sufixo: ficam fora dela). Uma boa expansão quase sempre coincide com um adiamento da cadência — por isso ela aumenta a força da chegada.</p>` },
      { tipo: "exemplo", titulo: "Um período, quatro tamanhos", intro: "Fá maior. O antecedente (c. 1–4, semicadência) é o mesmo em todas as camadas; muda só o consequente.",
        camadas: [
          { titulo: "Frase-modelo: 4 + 4", ...E_L1, rotulos: ["melodia", "baixo"],
            notas: [["decisao", "Consequente: motivo (c. 5), sequência sobre IV (c. 6), clímax A5 sobre I64 com 6–5 para o V7 (c. 7), tônica (c. 8)."],
              ["checagem", "Semicadência no c. 4 (melodia na sensível), cadência perfeita no c. 8; ritmo harmônico acelera no c. 7."]] },
          { titulo: "Repetição: 4 + 5", ...expF(`${E5} ${E6} ${E6} ${E7} F5/4`, "F3/4 Bb2/4 Bb2/4 C3/2 C3/2 F3/4", "I IV IV I64 V7 I"), rotulos: ["melodia", "baixo"],
            anotacoes: [[0, 25, "repetição"]],
            notas: [["decisao", "O c. 6 é repetido igual (Koch: repetição de um segmento). O ouvinte que contava 1–2–3–4 percebe o 'compasso a mais' justamente porque a pré-dominante insiste."],
              ["rejeitada", "Repetir o c. 7 (I64–V7) seria mais tenso, mas dobraria a dominante sem resolver: o 6/4 repetido soa hesitante, não enfático."],
              ["checagem", "A frase-modelo continua audível: tire o c. 7 e sobra exatamente a camada anterior."]] },
          { titulo: "Cadência de engano + 'one more time': 4 + 6", ...E_L3, rotulos: ["melodia", "baixo"],
            anotacoes: [[0, 26, "engano"], [0, 28, "de novo"]],
            notas: [["decisao", "C. 8: o V7 vai para vi — a melodia chega à tônica (fá), mas o baixo sobe para ré: a chegada é negada."],
              ["decisao", "C. 8, 2ª metade: IV 'recua' para a pré-dominante; c. 9 repete o c. 7 (one more time) e agora a cadência fecha no c. 10."],
              ["rejeitada", "Fechar já com I6 no c. 8 (cadência evitada) também serviria; preferi o engano porque a nota fá na melodia faz o ouvinte acreditar no fim por um instante."],
              ["checagem", "Da cadência de engano volta-se à pré-dominante (vi → IV), nunca da dominante direto para a pré-dominante."]],
            pausa: ["Por que a cadência do c. 10 soa mais forte que a do c. 8 da frase-modelo, se as notas são as mesmas?", "Porque foi esperada duas vezes. A primeira tentativa criou a expectativa e a frustrou; a repetição do material deixa o ouvinte prever a chegada e o I finalmente a confirma."] },
          { titulo: "Sufixo: uma codetta que repete a cadência", ...expF(`${E5} ${E6} ${E7} F5/2 D5/2 ${E7} F5/4 D5/1 Bb4/1 G4/1 E4/1 F4/4`, "F3/4 Bb2/4 C3/2 C3/2 D3/2 Bb2/2 C3/2 C3/2 F3/4 Bb2/2 C3/2 F3/4", "I IV I64 V7 vi IV I64 V7 I IV V7 I"), rotulos: ["melodia", "baixo"],
            notas: [["decisao", "C. 11–12: IV–V7–I uma oitava abaixo na melodia — a frase já acabou no c. 10; a codetta confirma a tônica e esvazia a energia."],
              ["checagem", "O sufixo é expansão externa: a frase propriamente dita termina no c. 10; nada do que vem depois muda a sua forma."]] },
        ] },
      { tipo: "contraste", titulo: "Chegar na hora × chegar depois",
        a: { rotulo: "A — frase-modelo (cadência no c. 8)", partitura: E_L1.partitura, cifras: E_L1.cifras },
        b: { rotulo: "B — cadência de engano e nova tentativa (cadência no c. 10)", partitura: E_L3.partitura, cifras: E_L3.cifras },
        pergunta: "Em qual delas a cadência final tem mais peso? E em qual o antecedente soa mais 'curto' por comparação?",
        comentario: "<p>Em A a simetria 4 + 4 é perfeita e por isso neutra: a cadência chega quando o ouvinte espera. Em B a mesma cadência é adiada duas vezes (o engano e o recuo para IV), e a chegada do c. 10 tem o peso de algo conquistado. O preço é a simetria: o antecedente passa a soar como uma pergunta curta diante de uma resposta longa — exatamente o efeito que Haydn e Beethoven procuravam nos fins de seção.</p>" },
      { tipo: "quebra", titulo: "A grade de 4 compassos posta em xeque", html: `
        <p>A frase de 4 compassos é a norma de Riepel e Koch; os compositores do século XVIII já jogavam com ela, e o XIX a pôs em dúvida.</p>
        <ul><li><b>Haydn</b> é famoso pelas frases de 5, 6 ou 7 compassos e pelas cadências adiadas — muitos exemplos de Koch são tirados dele.</li>
        <li><b>Beethoven</b> escreve na partitura do Scherzo da 9ª Sinfonia 'ritmo di tre battute': os compassos passam a se agrupar de três em três. E no rondó da 'Patética' o refrão de 8 compassos vira 17 na primeira apresentação, com 'one more time' e sufixo elidido; nas voltas seguintes ele é encurtado.</li>
        <li><b>Brahms</b>: o tema das Variações op. 56a ('de Haydn') abre com duas frases de 5 compassos; Schoenberg (<i>Fundamentals</i>, cap. XIV) cita no finale do Quarteto com piano op. 25 uma série de frases de 3 compassos. A assimetria deixa de ser exceção e vira o próprio caráter do tema.</li>
        <li>No Romantismo (Rothstein: o 'grande problema rítmico do século XIX') elisões e entradas antecipadas servem para esconder a quadratura — no limite, a 'melodia infinita'.</li></ul>
        <p>O que a quebra produz: com 3 compassos, impulso e um certo desequilíbrio dançante; com 5 ou mais, uma respiração mais larga; com elisões, continuidade — a música não para para respirar.</p>`,
        exemplos: [
          exc("tom: C maior\nmelodia: E5/1 C5/1 E5/1 G5/1 F5/1 A5/1 F5/1 A5/1 G5/2 B4/2 E5/1 C5/1 E5/1 G5/1 F5/2 E5/1 D5/1 C5/4\nbaixo: C3/4 F3/4 G3/4 C3/4 F3/2 G3/1 G3/1 C3/4", "I IV V I ii6 I64 V7 I",
            { rotulo: "Período de 3 + 3 (exemplo construído)", perfil: { ...MELODIA }, contexto: { plano: { cadencia: 6 } },
              comentario: "Semicadência no c. 3, cadência perfeita no c. 6. Sem o 4º compasso, cada frase termina 'um tempo cedo' — o efeito de pressa que os grupos de 3 compassos dão a um scherzo." }),
          exc("tom: F maior\nmelodia: C5/1 A4/0.5 Bb4/0.5 C5/1 F5/1 D5/1 Bb4/0.5 C5/0.5 D5/1 F5/1 A5/2 G5/1 E5/1 F5/1 A4/0.5 Bb4/0.5 C5/1 F5/1 D5/1 Bb4/0.5 C5/0.5 D5/1 F5/1 A5/2 G5/1 E5/1 F5/4\nbaixo: F3/4 Bb2/4 C3/2 C3/2 F3/4 Bb2/4 C3/2 C3/2 F3/4", "I IV I64 V7 I IV I64 V7 I",
            { rotulo: "Elisão: 4 + 4 = 7 (exemplo construído)", perfil: { ...MELODIA }, contexto: { plano: { cadencia: 7 } }, anotacoes: [[0, 13, "fim = começo"]],
              comentario: "No c. 4 o fá da cadência é também a primeira nota da segunda frase: a cabeça do motivo (dó) é substituída pela tônica, e o resto do motivo continua. Duas frases de 4 compassos ocupam 7." }),
        ] },
    ],
    exercicios: [
      { id: "exp1", titulo: "Um compasso a mais", modo: "completar", perfil: { ...MELODIA, semicadencia: "erro", sequencia_do_motivo: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 9 }, motivo: { de: 6, em: [7] } },
        cifras: "I V7 I6 IV V I IV6 vi I64 V7 I".split(" "),
        instrucoes: "<p>Ré maior. O antecedente e o início do consequente (c. 1–5), o baixo e as cifras estão dados. O consequente tem <b>5 compassos</b>: escreva os c. 6–9 de modo que o <b>c. 7 seja uma sequência do c. 6</b> (mesmo ritmo e desenho, outra altura) — a repetição sequencial de Koch — e feche com cadência perfeita no c. 9.</p>",
        texto: "tom: D maior\ncf: baixo\nmelodia: F#4/1 A4/0.5 G4/0.5 F#4/1 D5/1 E5/1.5 D5/0.5 C#5/2 D5/1 A4/1 B4/1 D5/1 C#5/1 E5/1 A4/2 F#4/1 A4/0.5 G4/0.5 F#4/1 D5/1\nbaixo: D3/4 A2/4 F#2/2 G2/2 A2/4 D3/4 B2/4 B2/4 A2/2 A2/2 D3/4",
        duracao: 1, alvoCompassos: 9, plano: PLANO_EXP,
        solucao: "tom: D maior\ncf: baixo\nmelodia: F#4/1 A4/0.5 G4/0.5 F#4/1 D5/1 E5/1.5 D5/0.5 C#5/2 D5/1 A4/1 B4/1 D5/1 C#5/1 E5/1 A4/2 F#4/1 A4/0.5 G4/0.5 F#4/1 D5/1 G4/1 B4/0.5 A4/0.5 G4/1 D5/1 B4/1 D5/0.5 C#5/0.5 B4/1 F#5/1 F#5/2 E5/1 C#5/1 D5/4\nbaixo: D3/4 A2/4 F#2/2 G2/2 A2/4 D3/4 B2/4 B2/4 A2/2 A2/2 D3/4",
        comentarioSolucao: "C. 6: o motivo uma 4ª acima sobre IV6; c. 7: o mesmo desenho uma 3ª acima, sobre vi — o compasso inserido. F#5 (clímax) fica preso como 6ª sobre o I64 e desce para E5 no V7." },
      { id: "exp2", titulo: "Engano e nova tentativa", modo: "menos apoio", perfil: { ...MELODIA, semicadencia: "erro", frm_cadencias: "erro", frm_variacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 10 }, cadencias: [{ c: 8, tipo: "engano" }], motivo: { de: 7, variar: [{ em: 9, manter: ["ritmo", "contorno"] }] } },
        cifras: "i V7 i6 iv V i iv i64 V VI iv6 i64 V i".split(" "),
        instrucoes: "<p>Lá menor. O antecedente, o baixo e as cifras estão dados; o consequente tem 6 compassos. Escreva os c. 5–10: tentativa de cadência no c. 7, <b>cadência de engano</b> no c. 8 (V → VI) e <b>'one more time'</b>: o c. 9 repete o ritmo e o contorno do c. 7, e agora a cadência perfeita chega no c. 10.</p>",
        texto: "tom: A menor\ncf: baixo\nmelodia: A4/1 C5/1 E5/1.5 D5/0.5 E5/1 D5/0.5 C5/0.5 B4/2 C5/1 E5/1 F5/1 D5/1 B4/1 E5/1 G#4/2\nbaixo: A2/4 E3/4 C3/2 D3/2 E3/4 A2/4 D3/4 E3/2 E3/2 F3/2 F3/2 E3/2 E3/2 A2/4",
        duracao: 1, alvoCompassos: 10, plano: PLANO_EXP,
        solucao: "tom: A menor\ncf: baixo\nmelodia: A4/1 C5/1 E5/1.5 D5/0.5 E5/1 D5/0.5 C5/0.5 B4/2 C5/1 E5/1 F5/1 D5/1 B4/1 E5/1 G#4/2 A4/1 C5/1 E5/2 D5/1 F5/1 A5/2 E5/1 C5/1 B4/1 G#4/1 A4/1 C5/1 F5/1 D5/1 E5/1 C5/1 B4/1 G#4/1 A4/4\nbaixo: A2/4 E3/4 C3/2 D3/2 E3/4 A2/4 D3/4 E3/2 E3/2 F3/2 F3/2 E3/2 E3/2 A2/4",
        comentarioSolucao: "No c. 8 a melodia faz o que faria numa cadência perfeita (sol♯ → lá), mas o baixo vai a fá: engano. IV6 recua para a pré-dominante e os c. 9–10 repetem a fórmula do c. 7, agora até o fim." },
      { id: "exp3", titulo: "Cadência evitada: 4 + 6, com o seu baixo", modo: "restrição", perfil: { ...MELODIA, frm_cadencias: "erro", frm_variacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 10 }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "evitada" }, { c: 10, tipo: "perfeita" }], motivo: { de: 7, variar: [{ em: 9, manter: ["ritmo"] }] } },
        cifrasAluno: true, cifrasIniciais: "I V7 I6 IV V", alvoCompassos: 10,
        instrucoes: "<p>Sol maior. O antecedente está escrito (melodia, baixo e cifras). Componha o consequente com as duas vozes e as cifras: <b>cadência evitada no c. 8</b> (o V vai para um acorde que não é o I em estado fundamental — I6, por exemplo), o c. 9 retomando o ritmo do c. 7, e <b>cadência perfeita no c. 10</b>.</p>",
        texto: "tom: G maior\nmelodia: D5/1 B4/0.5 C5/0.5 D5/1 G5/1 F#5/1.5 E5/0.5 D5/1 C5/1 B4/1 D5/1 E5/1 C5/1 A4/2 D5/2\nbaixo: G2/4 D3/4 B2/2 C3/2 D3/4", duracao: 1, plano: PLANO_EXP,
        solucao: "tom: G maior\nmelodia: D5/1 B4/0.5 C5/0.5 D5/1 G5/1 F#5/1.5 E5/0.5 D5/1 C5/1 B4/1 D5/1 E5/1 C5/1 A4/2 D5/2 D5/1 B4/0.5 C5/0.5 D5/1 G5/1 E5/1 C5/0.5 D5/0.5 E5/1 G5/1 B4/2 A4/1 F#4/1 D5/2 E5/1 C5/1 B4/2 A4/1 F#4/1 G4/4\nbaixo: G2/4 D3/4 B2/2 C3/2 D3/4 G2/4 C3/4 D3/2 D3/2 B2/2 C3/2 D3/2 D3/2 G2/4",
        solucaoCifras: "I V7 I6 IV V I IV I64 V I6 IV I64 V I",
        comentarioSolucao: "C. 8: o V vai para I6 e a melodia, em vez de cair no sol, salta para ré — a cadência evitada típica, com o baixo subindo por grau (si–dó) para recuar à pré-dominante. Os c. 9–10 repetem a fórmula do c. 7 e fecham." },
      { id: "exp4", titulo: "Livre: período com codetta", modo: "livre", perfil: { ...MELODIA, frm_cadencias: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 10 }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita" }] },
        cifrasAluno: true, alvoCompassos: 10,
        instrucoes: "<p>Mi menor. Componha melodia, baixo e cifras: um período de 8 compassos (semicadência no c. 4, cadência perfeita no c. 8) seguido de uma <b>codetta de 2 compassos</b> que repete a cadência sobre a tônica e termina em cadência perfeita no c. 10. A codetta não deve trazer material novo de peso — ela fecha, não começa.</p>",
        texto: "tom: E menor\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_EXP,
        solucao: "tom: E menor\nmelodia: B4/1 G4/0.5 A4/0.5 B4/1 E5/1 F#5/1.5 E5/0.5 D#5/1 F#5/1 E5/1 B4/1 C5/1 E5/1 D#5/2 B4/2 B4/1 G4/0.5 A4/0.5 B4/1 E5/1 C5/1 A4/0.5 B4/0.5 C5/1 E5/1 G5/2 F#5/1 D#5/1 E5/4 C5/1 A4/1 F#4/1 D#4/1 E4/4\nbaixo: E3/4 B2/4 G2/2 A2/2 B2/4 E3/4 A2/4 B2/2 B2/2 E3/4 A2/2 B2/2 E3/4",
        solucaoCifras: "i V i6 iv V i iv i64 V7 i iv V7 i",
        comentarioSolucao: "Período paralelo de 4 + 4; a codetta (c. 9–10) repete iv–V7–i uma oitava abaixo, com a melodia descendo em arpejo até o mi grave — a energia se esgota em vez de recomeçar." },
      { id: "exp5", titulo: "Quebrar: um período de 5 + 5", modo: "quebrar", perfil: { ...MELODIA, frm_cadencias: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 10 }, cadencias: [{ c: 5, tipo: "semi" }, { c: 10, tipo: "perfeita" }] },
        cifras: "I IV ii6 I6 IV V I IV ii6 I64 V7 I".split(" "),
        instrucoes: "<p>Si♭ maior. Contra a norma de Riepel (pergunta no c. 4), escreva sobre o baixo dado um período de <b>duas frases de 5 compassos</b>, como no tema das Variações op. 56a de Brahms: semicadência no <b>c. 5</b> e cadência perfeita no <b>c. 10</b>. O compasso a mais está no baixo (a pré-dominante IV → ii6 se prolonga nos c. 2–3 e 7–8); faça a melodia aproveitá-lo, sem 'encher' o compasso com notas soltas.</p>",
        texto: "tom: Bb maior\ncf: baixo\nmelodia:\nbaixo: Bb2/4 Eb3/4 Eb3/4 D3/2 Eb3/2 F3/4 Bb3/4 Eb3/4 Eb3/4 F3/2 F3/2 Bb2/4", duracao: 1, alvoCompassos: 10, plano: PLANO_EXP,
        solucao: "tom: Bb maior\ncf: baixo\nmelodia: F4/1 Bb4/1 D5/1.5 C5/0.5 Bb4/1 G4/1 Eb5/1.5 D5/0.5 C5/1 G4/1 Eb5/2 F5/1 D5/1 G5/2 C5/2 A4/2 F4/1 Bb4/1 D5/1.5 C5/0.5 Bb4/1 G4/1 Eb5/1.5 D5/0.5 C5/1 G4/1 Eb5/2 D5/2 C5/1 A4/1 Bb4/4\nbaixo: Bb2/4 Eb3/4 Eb3/4 D3/2 Eb3/2 F3/4 Bb3/4 Eb3/4 Eb3/4 F3/2 F3/2 Bb2/4",
        comentarioSolucao: "O c. 3 retoma o gesto do c. 2 (dó–sol–mi♭ depois de si♭–sol–mi♭): é a repetição que faz a frase ter 5 compassos sem soar como erro de contagem. A semicadência do c. 5 termina na sensível (lá), suspensa." },
    ],
  }, { depoisDe: "periodo" });

  // ================================================================== 3. BINÁRIA, TERNÁRIA E MINUETO

  const B_R1 = "G4/1 C5/1 E5/1 D5/2 F5/1 E5/1 C5/1 G5/1 A5/1 F5/1 D5/1 E5/1 C5/1 G4/1 A4/1 C5/1 E5/1 B4/2 A4/1 G4/2 B4/1";
  const B_R1B = "C3/3 D3/3 E3/3 F3/2 G3/1 C3/3 C3/3 D3/2 D3/1 G2/3", B_R1C = "I V43 I6 ii6 V I vi6=G:ii6 I64 V I";
  const B_FONTE = "C#5/1 E5/1 G5/1 F5/1 D5/1 A4/1 B4/1 D5/1 F5/1 E5/3", B_FONTEB = "A2/3 D3/3 G2/3 C3/3", B_FONTEC = "C:V7/ii ii V7 I";
  const B_MIN = exc(`compasso: 3/4\ntom: C maior\nmelodia: ${B_R1} ${B_FONTE} G4/1 C5/1 E5/1 D5/2 F5/1 G5/1 F5/1 D5/1 C5/3\nbaixo: ${B_R1B} ${B_FONTEB} C3/3 D3/3 E3/1 F3/1 G3/1 C3/3`, `${B_R1C} ${B_FONTEC} I V43 I6 ii6 V7 I`, { contexto: { plano: { cadencia: 16 }, cadencias: null } });
  const B_SIMPLES = exc(`compasso: 3/4\ntom: C maior\nmelodia: ${B_R1} ${B_FONTE} F5/1 C5/1 A4/1 B4/1 D5/1 G5/1 G5/1 F5/1 D5/1 C5/3\nbaixo: ${B_R1B} ${B_FONTEB} F3/3 G3/3 E3/1 F3/1 G3/1 C3/3`, `${B_R1C} ${B_FONTEC} IV V I6 ii6 V7 I`, { contexto: { plano: { cadencia: 16 }, cadencias: null } });
  const PLANO_MINUETO = [
    ["Plano de compassos", "Onde terminam as frases (c. 4, 8, 12, 16) e com que cadência?"],
    ["Plano de tonalidades", "Para onde vai a 1ª reprise (V ou III) e por que acorde-pivô?"],
    ["2ª reprise", "Monte, Fonte ou Ponte? Onde volta o começo?"],
  ];
  const B_D1 = "F#5/1 E5/0.5 D5/0.5 A4/1 C#5/1 E5/1 A4/1 D5/1 F#5/1 A5/1 B5/1 G5/1 E5/1 F#5/1 E5/0.5 D5/0.5 A4/1 B4/1 D5/1 F#5/1";
  const B_DB = "D3/3 A2/3 F#3/3 G3/2 A3/1 D3/3 B2/3 E3/2 E3/1 A2/3";

  T.inserir(3, {
    id: "binaria", titulo: "Binária, ternária e minueto",
    antes: [
      { p: "No minueto clássico em tom maior, onde costuma terminar a 1ª reprise?", o: ["Numa cadência perfeita na dominante (ou numa semicadência no tom principal)", "Numa cadência perfeita no tom principal, sempre", "Na subdominante", "Numa cadência de engano"], e: "A 1ª reprise abre o plano tonal: vai para V (em menor, para III) e cadencia lá; às vezes só para numa semicadência. A 2ª reprise traz a música de volta e termina obrigatoriamente com cadência perfeita na tônica." },
      { p: "O que distingue a binária arredondada da binária simples?", o: ["Na 2ª reprise volta o começo da 1ª, na tônica", "A 2ª reprise é mais curta", "Não há repetições", "A 1ª reprise termina na tônica"], e: "Arredondada: depois de uma parte menos estável (sequência, pedal de dominante), a ideia inicial volta na tônica dentro da 2ª reprise. Na simples a 2ª reprise continua sem esse retorno." },
      { p: "Para Riepel, o que são Monte, Fonte e Ponte?", o: ["Padrões de continuação para depois da barra dupla do minueto", "Tipos de cadência final", "Três formas de abrir a peça", "Nomes de andamento"], e: "Monte sobe (tonicizando IV e V, ou graus vizinhos), Fonte desce (ii, depois I) e Ponte fica na dominante: três maneiras de começar a 2ª reprise e preparar a volta." },
    ],
    objetivo: "Compor um minueto completo em binária arredondada (8 + 8 compassos), com plano de tonalidades, cadências nos lugares certos e Monte, Fonte ou Ponte depois da barra dupla.",
    ouvir: ["Minuetos do 'Caderno de Anna Magdalena Bach' (o Minueto em sol, atribuído a Petzold)", "Mozart, Sinfonia nº 40, Menuetto e Trio", "Haydn, minuetos dos quartetos op. 33", "Beethoven, Sonata op. 2 nº 2 e nº 3: o Scherzo no lugar do minueto"],
    esboco: "Escreva o plano de um minueto em ré maior de 16 compassos: em que compasso e em que tom cada frase termina, e onde volta o começo.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "As formas pequenas e o minueto como escola (Riepel, Koch, Schoenberg)", html: `
        <p>O minueto foi a forma em que o século XVIII aprendia a compor. Riepel (<i>Anfangsgründe</i>, 1752–) ensina-o em diálogo com um aluno, a partir de frases de 4 compassos; Koch descreve a composição em três etapas — <i>Anlage</i> (o plano), <i>Ausführung</i> (a execução) e <i>Ausarbeitung</i> (a elaboração). Na reconstrução de Eckert do método de Riepel, o minueto tem quatro seções de 4 compassos: abertura em I → movimento para V → padrão de continuação → cadência na tônica; as cadências ocupam 2 compassos (pré-dominante e 6/4 cadencial, depois a chegada).</p>
        <table class="tabela-modos"><thead><tr><th>Forma</th><th>1ª reprise</th><th>2ª reprise</th></tr></thead><tbody>
        <tr><td>Binária simples</td><td>A: I → V (ou HC)</td><td>A′ ou B: continua e volta a I, sem retorno do começo</td></tr>
        <tr><td>Binária balanceada</td><td>A termina em V com uma fórmula cadencial</td><td>a mesma fórmula reaparece no fim, transposta para I</td></tr>
        <tr><td>Binária arredondada</td><td>A: I → V</td><td>B (instável: Monte/Fonte/Ponte, termina em V) + A′ (o começo volta em I)</td></tr>
        <tr><td>Ternária pequena</td><td>A fechado (pode terminar em I)</td><td>B contrastante (outra região, 'acorde de anacruse' de dominante) + A′ raramente igual (Schoenberg)</td></tr>
        <tr><td>Minueto e trio</td><td colspan="2">ternária composta: minueto (binária) – trio (outro minueto, em geral em IV, no homônimo ou no relativo) – minueto da capo sem repetições</td></tr></tbody></table>
        <h3>Plano de tonalidades</h3>
        <ul><li>Maior: I → V ‖ (V) … → I. Menor: i → III (ou v) ‖ … → i.</li>
        <li>A modulação da 1ª reprise passa por um acorde-pivô (vi = ii do tom da dominante) e se confirma com cadência perfeita no tom novo.</li>
        <li>Depois da barra dupla, os padrões de Riepel: <b>Monte</b> (sequência ascendente, V7/IV–IV, V7/V–V), <b>Fonte</b> (descendente: V7/ii–ii, V7–I), <b>Ponte</b> (prolonga o V, preparando a volta).</li>
        <li>A 2ª reprise termina com cadência autêntica perfeita na tônica — uma convenção praticamente obrigatória.</li></ul>
        <p>Ordem de trabalho (a 'escada' de Eckert): primeiro as <b>cadências</b>; depois, dada a 1ª reprise, a <b>2ª reprise</b>; por fim o <b>minueto inteiro</b>.</p>` },
      { tipo: "exemplo", titulo: "Um minueto em dó maior, das cadências para dentro", intro: "3/4, binária arredondada, 8 + 8 compassos (sem as repetições).",
        camadas: [
          { titulo: "O plano", texto: "<b>1ª reprise</b> (c. 1–8): frase de 4 em I com semicadência (c. 4); frase de 4 que modula para sol maior pelo pivô vi6 = ii6 e cadencia lá (c. 8). <b>2ª reprise</b>: Fonte (c. 9–12: V7/ii–ii, V7–I), volta do começo em I (c. 13–14), cadência perfeita (c. 15–16)." },
          { titulo: "As cadências primeiro", partitura: "compasso: 3/4\ntom: C maior\nmelodia: P/6 A5/1 F5/1 D5/1 P/9 B4/2 A4/1 G4/2 P/1 P/18 G5/1 F5/1 D5/1 C5/3\nbaixo: P/6 F3/2 G3/1 P/9 D3/2 D3/1 G2/3 P/18 E3/1 F3/1 G3/1 C3/3", rotulos: ["melodia", "baixo"],
            notas: [["decisao", "C. 4: ii6–V, a melodia para no ré (2º grau) — semicadência. C. 7–8: I64–V–I em sol, melodia si–lá–sol. C. 15–16: I6–ii6–V7–I com a melodia sol–fá–ré–dó."],
              ["checagem", "Três chegadas de força crescente: aberta (V), fechada no tom vizinho, fechada no tom principal. É esse desenho que o ouvinte guarda."]] },
          { titulo: "1ª reprise", ...exc(`compasso: 3/4\ntom: C maior\nmelodia: ${B_R1}\nbaixo: ${B_R1B}`, B_R1C, { contexto: { plano: {}, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita", tom: "G maior" }] } }), rotulos: ["melodia", "baixo"],
            anotacoes: [[0, 15, "pivô"], [0, 18, "sol maior"]],
            notas: [["decisao", "C. 5 retoma o c. 1 com o arpejo invertido (mi–dó–sol): o ouvinte reconhece a abertura, mas a frase vai para outro lugar."],
              ["decisao", "C. 6: o acorde de lá menor com dó no baixo é vi6 em dó e ii6 em sol — a pré-dominante do tom novo. O fá♯ só aparece no V do c. 7."],
              ["rejeitada", "Modular com V7/V já no c. 5 seria mais rápido, mas jogaria fora a simetria: a 2ª frase deve começar como a 1ª para o ouvinte perceber o desvio."],
              ["checagem", "Cadência do c. 8: V em fundamental → I em fundamental no tempo forte, sol na melodia."]] },
          { titulo: "Minueto inteiro: Fonte e retorno", ...B_MIN, rotulos: ["melodia", "baixo"],
            anotacoes: [[0, 25, "Fonte"], [0, 31, "Fonte, um grau abaixo"], [0, 35, "retorno"]],
            notas: [["decisao", "C. 9–12, Fonte: V7/ii–ii, depois V7–I, a mesma figura um grau abaixo. A 7ª de cada dominante (sol, depois fá) desce por grau."],
              ["decisao", "C. 13–14 = c. 1–2 (binária arredondada); c. 15 acelera (três acordes) para a cadência, que 'rima' com o c. 4: o que lá era pergunta aqui fecha."],
              ["rejeitada", "Voltar ao começo já no c. 11: a 2ª reprise teria só 2 compassos de contraste e o retorno não seria esperado."],
              ["checagem", "Plano tonal: dó → sol (c. 8) → passagem por ré menor (c. 9–10) → dó."]],
            pausa: ["A Fonte termina na tônica (c. 12), e o começo volta logo depois, também na tônica. O que se perde em relação a uma Ponte (pedal de dominante antes do retorno)?", "A tensão antes da volta. Com a Ponte, o retorno resolve uma dominante prolongada; depois da Fonte, ele chega 'de lado' — mais suave, típico de minuetos curtos. Nos exercícios você vai usar a Ponte e o Monte."] },
        ] },
      { tipo: "contraste", titulo: "Arredondada × simples",
        a: { rotulo: "A — o começo volta no c. 13", partitura: B_MIN.partitura, cifras: B_MIN.cifras, contexto: B_MIN.contexto },
        b: { rotulo: "B — a 2ª reprise continua sem retorno", partitura: B_SIMPLES.partitura, cifras: B_SIMPLES.cifras, contexto: B_SIMPLES.contexto },
        pergunta: "Mesma 1ª reprise, mesma Fonte, mesma cadência final. Em qual o fim soa mais 'em casa'? E qual soa mais como uma dança barroca?",
        comentario: "<p>Em A o retorno da ideia inicial na tônica faz o ouvinte sentir que a peça voltou ao ponto de partida — a forma fecha por memória, não só por cadência. Em B a cadência fecha a harmonia, mas a melodia termina em território novo: é a binária simples das danças das suítes barrocas, em que a 2ª reprise continua as ideias. A arredondada é a forma que leva à sonata.</p>" },
      { tipo: "quebra", titulo: "Quando a 1ª parte não cadencia", html: `
        <p>A regra dá à 1ª reprise uma cadência (em V, ou uma semicadência) e à 2ª uma cadência perfeita na tônica. As quebras vêm por três lados:</p>
        <ul><li><b>Beethoven</b> troca o minueto pelo <i>scherzo</i> (já nas Sonatas op. 2 nº 2 e nº 3): mais rápido, com uma 2ª reprise muito mais longa e desenvolvida.</li>
        <li><b>Schumann</b>, segundo o Open Music Theory, termina a 1ª parte de algumas peças (<i>Papillons</i> nº 1, <i>Kinderszenen</i> nº 9) prolongando a tônica em vez de cadenciar: a parte acaba, mas não 'chega'.</li>
        <li><b>Chopin</b> esconde ou elide a semicadência antes do retorno, e as repetições passam a ser escritas por extenso, variadas.</li></ul>
        <p>O que a quebra produz: uma forma mais contínua, de peça de caráter, em que as articulações são sentidas mais pelo material do que pelas cadências.</p>`,
        exemplos: [
          exc("compasso: 3/4\ntom: C maior\nmelodia: G4/1 C5/1 E5/1 D5/2 F5/1 E5/1 C5/1 G5/1 A5/1 F5/1 D5/1 E5/1 C5/1 G4/1 A4/1 C5/1 F5/1 E5/1 F5/1 E5/1 C5/3\nbaixo: C3/3 D3/3 E3/3 F3/2 G3/1 C3/3 F3/3 C3/1 C3/1 C3/1 C3/3", "I V43 I6 ii6 V I IV I IV64 I I",
            { rotulo: "1ª parte terminando sem cadência (exemplo construído)", perfil: { ...BASE, frm_cadencias: "erro" }, contexto: { plano: {}, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "aberta" }] },
              comentario: "C. 7–8: I–IV64–I sobre o pedal de dó, sem nenhum V. A melodia desce para a tônica, mas a harmonia não 'fecha': o ouvido entende o fim da parte pela duração e pelo registro, não pela cadência." }),
        ] },
    ],
    exercicios: [
      { id: "bin1", titulo: "A escada de Eckert, degrau 1: a cadência da 1ª reprise", modo: "completar", perfil: { ...BASE, frm_cadencias: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: {}, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita", tom: "A maior" }] },
        cifras: "I V I6 IV V I vi=A:ii I64 V I".split(" "),
        instrucoes: "<p>Ré maior, 3/4. Os c. 1–6, o baixo e as cifras estão dados; o c. 6 é o pivô (vi em ré = ii em lá). Escreva os c. 7–8: <b>cadência perfeita em lá maior</b> sobre I64–V–I, com a tônica do tom novo na melodia no tempo forte do c. 8.</p>",
        texto: `compasso: 3/4\ntom: D maior\ncf: baixo\nmelodia: ${B_D1}\nbaixo: ${B_DB}`, duracao: 1, alvoCompassos: 8, plano: PLANO_MINUETO,
        solucao: `compasso: 3/4\ntom: D maior\ncf: baixo\nmelodia: ${B_D1} C#5/2 B4/1 A4/2 C#5/1\nbaixo: ${B_DB}`,
        comentarioSolucao: "Dó♯ (6ª sobre mi) desce para si (5ª) no V e chega a lá: 6–5 sobre o 6/4 cadencial, a fórmula de 2 compassos de Riepel. O dó♯ do fim do c. 8 já aponta para a 2ª reprise." },
      { id: "bin2", titulo: "Degrau 2: a 2ª reprise com Ponte", modo: "menos apoio", perfil: { ...MELODIA, frm_cadencias: "erro", ideia_repetida: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 16, repete: [1, 13] }, cadencias: [{ c: 16, tipo: "perfeita" }] },
        cifras: "I V I6 IV V I vi=A:ii I64 V I D:V I64 V V7 I V I6 ii6 V7 I".split(" "),
        instrucoes: "<p>A 1ª reprise está pronta. Escreva a 2ª (c. 9–16) sobre o baixo dado: <b>Ponte</b> nos c. 9–12 (pedal de lá, V – 6/4 de bordadura – V – V7), <b>retorno</b> do começo nos c. 13–14 e cadência perfeita no c. 16. Faça a 7ª do c. 12 descer por grau para a primeira nota do retorno.</p>",
        texto: `compasso: 3/4\ntom: D maior\ncf: baixo\nmelodia: ${B_D1} C#5/2 B4/1 A4/2 C#5/1\nbaixo: ${B_DB} A2/3 A2/3 A2/3 A2/3 D3/3 A2/3 F#3/1 G3/1 A3/1 D3/3`, duracao: 1, alvoCompassos: 16, plano: PLANO_MINUETO,
        solucao: `compasso: 3/4\ntom: D maior\ncf: baixo\nmelodia: ${B_D1} C#5/2 B4/1 A4/2 C#5/1 E5/1 C#5/1 E5/1 F#5/1 A5/1 F#5/1 E5/1 C#5/1 A4/1 C#5/1 E5/1 G5/1 F#5/1 E5/0.5 D5/0.5 A4/1 C#5/1 E5/1 A4/1 D5/1 E5/1 C#5/1 D5/3\nbaixo: ${B_DB} A2/3 A2/3 A2/3 A2/3 D3/3 A2/3 F#3/1 G3/1 A3/1 D3/3`,
        comentarioSolucao: "A Ponte fica quatro compassos sobre lá, subindo até o sol (7ª do V7), que desce para fá♯ no retorno: a volta resolve a dominante prolongada. C. 15 acelera (I6–ii6–V7)." },
      { id: "bin3", titulo: "Degrau 3: minueto em menor com Monte", modo: "restrição", perfil: { ...MELODIA, frm_cadencias: "erro", ideia_repetida: "erro", sequencia_do_motivo: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 16, repete: [1, 13] }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita", tom: "C maior" }, { c: 12, tipo: "semi" }, { c: 16, tipo: "perfeita" }], motivo: { de: 9, em: [11] } },
        cifras: "i V6 i iv6 V i iv6=C:ii6 I64 V I a:V7/iv iv V7/V V i V6 i64 V i".split(" "),
        instrucoes: "<p>Lá menor, 3/4. Baixo e cifras dados: a 1ª reprise vai para o relativo (dó maior, pivô iv6 = ii6); a 2ª começa com um <b>Monte</b> (V7/iv–iv, V7/V–V). Escreva a melodia inteira. <b>Restrição:</b> o c. 11 é uma sequência exata do c. 9 (mesmo ritmo e desenho, um grau acima), e os c. 13–14 retomam os c. 1–2.</p>",
        texto: "compasso: 3/4\ntom: A menor\ncf: baixo\nmelodia:\nbaixo: A2/3 G#2/3 A2/3 F2/2 E2/1 A2/3 F2/3 G2/2 G2/1 C3/3 A2/3 D3/3 B2/3 E3/3 A2/3 G#2/3 E3/2 E3/1 A2/3", duracao: 1, alvoCompassos: 16, plano: PLANO_MINUETO,
        solucao: "compasso: 3/4\ntom: A menor\ncf: baixo\nmelodia: E5/1 C5/1 A4/1 B4/2 E5/1 C5/1 E5/1 A5/1 A5/1 D5/1 E5/1 E5/1 C5/1 A4/1 D5/1 F5/1 A5/1 E5/2 D5/1 C5/2 G4/1 A4/1 C#5/1 E5/1 F5/1 D5/1 A4/1 B4/1 D#5/1 F#5/1 G#5/1 B4/1 E5/1 E5/1 C5/1 A4/1 B4/2 E5/1 E5/2 B4/1 A4/3\nbaixo: A2/3 G#2/3 A2/3 F2/2 E2/1 A2/3 F2/3 G2/2 G2/1 C3/3 A2/3 D3/3 B2/3 E3/3 A2/3 G#2/3 E3/2 E3/1 A2/3",
        comentarioSolucao: "Monte: lá–dó♯–mi sobre A7 → fá–ré–lá sobre ré menor; si–ré♯–fá♯ sobre B7 → sol♯ sobre E. O sol do fim do c. 8 desce a lá (c. 9) e a sensível de cada tonicização sobe por grau. Semicadência no c. 12 e retorno no c. 13." },
      { id: "bin4", titulo: "Livre: o trio", modo: "livre", perfil: { ...MELODIA, frm_cadencias: "erro", ideia_repetida: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 16, repete: [1, 13] }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita", tom: "C maior" }, { c: 16, tipo: "perfeita" }] },
        cifrasAluno: true, alvoCompassos: 16,
        instrucoes: "<p>Componha o trio do minueto da aula, em <b>fá maior</b> (IV), 3/4, 16 compassos, com melodia, baixo e cifras: semicadência no c. 4, cadência perfeita em <b>dó maior</b> no c. 8 (use um pivô e escreva-o nas cifras, ex.: vi6=C:ii6), 2ª reprise à sua escolha (Monte, Fonte ou Ponte), retorno do começo no c. 13 e cadência perfeita no c. 16. Contraste com o minueto: Schoenberg pede outro caráter — por exemplo, mais legato, em mínimas.</p>",
        texto: "compasso: 3/4\ntom: F maior\nmelodia:\nbaixo:", duracao: 2, plano: PLANO_MINUETO,
        solucao: "compasso: 3/4\ntom: F maior\nmelodia: A4/2 C5/1 Bb4/2 G4/1 C5/2 F5/1 D5/2 C5/1 A4/2 C5/1 D5/2 F5/1 E5/2 D5/1 C5/3 C5/2 E5/1 G5/2 E5/1 E5/1 D5/1 C5/1 G4/2 Bb4/1 A4/2 C5/1 Bb4/2 G4/1 C5/1 D5/1 E5/1 F5/3\nbaixo: F3/3 G3/3 A3/3 Bb3/2 C4/1 F3/3 F3/3 G3/2 G3/1 C3/3 C3/3 C3/3 C3/3 C3/3 F3/3 G3/3 A3/1 Bb3/1 C4/1 F3/3",
        solucaoCifras: "I V43 I6 ii6 V I vi6=C:ii6 I64 V I F:V V V7 V7 I V43 I6 ii6 V7 I",
        comentarioSolucao: "Mínima + semínima em quase todos os compassos (o minueto andava em semínimas). 2ª reprise: Ponte de quatro compassos sobre o pedal de dó, com a 7ª (si♭) descendo para lá no retorno." },
      { id: "bin5", titulo: "Quebrar: a 1ª parte que não cadencia", modo: "quebrar", perfil: { ...BASE, frm_cadencias: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: {}, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "aberta" }] },
        cifras: "I V43 I6 ii6 V I IV I IV64 I I".split(" "),
        instrucoes: "<p>Sol maior, 3/4. Escreva a melodia da 1ª parte de uma peça de caráter sobre o baixo dado: semicadência normal no c. 4, mas os c. 7–8 <b>não cadenciam</b> — a tônica é prolongada por um 6/4 de bordadura sobre o pedal (I–IV64–I), à maneira das peças de Schumann citadas na aula. Faça a melodia descer para a tônica, para que o fim da parte se perceba pelo contorno, já que a harmonia não o marca.</p>",
        texto: "compasso: 3/4\ntom: G maior\ncf: baixo\nmelodia:\nbaixo: G2/3 A2/3 B2/3 C3/2 D3/1 G2/3 C3/3 G2/1 G2/1 G2/1 G2/3", duracao: 1, alvoCompassos: 8, plano: PLANO_MINUETO,
        solucao: "compasso: 3/4\ntom: G maior\ncf: baixo\nmelodia: B4/1 D5/1 G5/1 F#5/2 A5/1 G5/2 D5/1 E5/2 F#5/1 G5/1 D5/1 B4/1 C5/1 E5/1 G5/1 B4/1 C5/1 B4/1 G4/3\nbaixo: G2/3 A2/3 B2/3 C3/2 D3/1 G2/3 C3/3 G2/1 G2/1 G2/1 G2/3",
        comentarioSolucao: "C. 7: si–dó–si, bordadura na melodia espelhando o 6/4 de bordadura no baixo; c. 8 desce ao sol grave. Não há V no fim: a parte termina 'em casa', mas sem o gesto de chegada." },
    ],
  }, { depoisDe: "expansao" });

  // ================================================================== 4. TEMA E VARIAÇÕES

  const V_B = "G2/4 D3/4 G2/4 D3/4 G2/4 C3/4 D3/2 D3/2 G2/4", V_C = "I V I V I IV I64 V7 I", V_CM = "i V i V i iv i64 V7 i";
  const V_N = "D5 B4 A4 F#4 G4 B4 A4 D5 D5 B4 C5 E5 D5 A4 G4".split(" ");
  const V_NM = V_N.map((n) => n.replace("B4", "Bb4").replace("E5", "Eb5"));
  const meias = (ns) => ns.map((n, i) => n + (i === ns.length - 1 ? "/4" : "/2")).join(" ");
  const V_TEMA = `tom: G maior\nmelodia: ${meias(V_N)}\nbaixo: ${V_B}`;
  const V_BORD = `tom: G maior\nmelodia: D5/0.5 E5 D5 C5 B4 C5 B4 G4 A4 B4 A4 G4 F#4 G4 A4 F#4 G4 A4 G4 A4 B4 C5 B4 G4 A4 G4 F#4 A4 D5 E5 D5 C5 D5 E5 D5 C5 B4 A4 B4 D5 C5 D5 C5 D5 E5 D5 C5 E5 D5 E5 D5 B4 A4 B4 A4 F#4 G4/4\nbaixo: ${V_B}`;
  const V_MIN = `tom: G menor\nmelodia: ${meias(V_NM)}\nbaixo: ${V_B}`;
  const V_ESQ = V_N.map((n, i) => [2 * i, n]), V_ESQM = V_NM.map((n, i) => [2 * i, n]);
  const V_ESQ3 = V_N.map((n, i) => [3 * Math.floor(i / 2) + 2 * (i % 2), n]);
  const PLANO_VAR = [
    ["Motivo de variação", "Que figura (ritmo e desenho) você vai aplicar a cada nota do esqueleto?"],
    ["O que fica", "Harmonia, cadências, número de compassos — e o esqueleto, nos tempos marcados?"],
    ["Liquidação", "A figura para na cadência ou vai até o fim?"],
  ];

  T.inserir(3, {
    id: "variacoes", titulo: "Tema e variações",
    antes: [
      { p: "Para Schoenberg, o que uma variação clássica deve manter do tema?", o: ["O curso dos acontecimentos: número e ordem dos segmentos, harmonia e cadências", "Só a melodia, nota por nota", "Só o compasso e o andamento", "Nada: cada variação é uma peça nova"], e: "\"O curso dos acontecimentos não deve mudar, mesmo que o caráter mude; o número e a ordem dos segmentos continuam os mesmos\" (Fundamentals, cap. XVII). O que muda é a superfície, organizada por um 'motivo de variação'." },
      { p: "O que é o 'motivo de variação'?", o: ["Uma figura sistemática aplicada ao esqueleto do tema ao longo de toda a variação", "O primeiro motivo do tema", "Uma melodia nova que substitui o tema", "O acompanhamento do tema"], e: "Schoenberg manda reduzir o tema ao esqueleto e aplicar sobre ele uma figura predeterminada, modificada só o necessário. É ela que dá à variação uma unidade 'maior que a do tema'." },
      { p: "O que é uma variação 'minore'?", o: ["A variação no modo menor da mesma tônica (homônimo)", "Uma variação mais lenta", "Uma variação no tom relativo menor, com outra tônica", "Uma variação com menos notas"], e: "Num tema em sol maior, a minore está em sol menor: mesma tônica, mesmas funções, terça e sexta abaixadas. É um dos contrastes de caráter mais usados (Mozart, K. 331, var. III)." },
    ],
    objetivo: "Compor variações de um tema de 8 compassos mantendo harmonia, cadências e esqueleto: figurais (um motivo de variação), minore e de caráter — e saber quando abandonar o esqueleto.",
    ouvir: ["Mozart, Sonata K. 331, 1º mov.: tema e variações (var. III em lá menor)", "Beethoven, 32 Variações em dó menor WoO 80", "Haydn, Quarteto op. 76 nº 3, 2º mov.: a melodia passa intacta de instrumento a instrumento", "Beethoven, Variações Diabelli op. 120 (var. 1, Alla marcia)", "Brahms, Variações sobre um tema de Haydn op. 56a: finale em passacaglia"],
    esboco: "Escreva o esqueleto do tema da aula (uma nota por meio compasso) e invente duas figuras de colcheias que caibam entre duas notas do esqueleto.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Mudar a superfície, manter o curso (Schoenberg, Reicha)", html: `
        <p>O tema típico de variação, diz Schoenberg, tem dois segmentos equilibrados (o primeiro termina em V) e muitas vezes é uma pequena binária. A variação clássica <b>mantém o curso dos acontecimentos</b>: o número e a ordem dos segmentos, o plano harmônico e as cadências. Para escrevê-la:</p>
        <ol><li>Reduza o tema ao <b>esqueleto</b>, omitindo apojaturas, trinados e escalas (pode haver mais de um esqueleto possível).</li>
        <li>Escolha um <b>motivo de variação</b> — raramente maior que 2 compassos — e aplique-o sistematicamente a cada nota do esqueleto, modificando-o só o necessário para caber na harmonia.</li>
        <li>As primeiras variações costumam <b>circunscrever</b> as notas principais com bordaduras; as seguintes aceleram (colcheias, tercinas, semicolcheias), mudam de registro ou de voz.</li></ol>
        <table class="tabela-modos"><thead><tr><th>Tipo</th><th>O que muda</th><th>O que fica</th></tr></thead><tbody>
        <tr><td>Figural (ornamental)</td><td>a superfície: um motivo de variação</td><td>esqueleto, harmonia, cadências, compasso</td></tr>
        <tr><td>Minore / maggiore</td><td>o modo (homônimo)</td><td>tônica, funções, esqueleto adaptado</td></tr>
        <tr><td>De caráter</td><td>compasso, andamento, textura, às vezes a melodia</td><td>harmonia e cadências (e o número de segmentos)</td></tr>
        <tr><td>Cantus firmus</td><td>o que está em volta</td><td>a melodia inteira, passando de voz em voz</td></tr>
        <tr><td>Ostinato (passacaglia, chacona)</td><td>tudo acima do baixo</td><td>o baixo (ou a harmonia) repetido</td></tr></tbody></table>
        <p>Reicha publicou uma <i>L'art de varier</i> com 57 variações sobre um tema; os tratados do século XIX tratam a série de variações como o lugar natural para treinar os operadores do capítulo 'Motivo e variação'.</p>` },
      { tipo: "exemplo", titulo: "Um tema, duas variações", intro: "Sol maior, 4/4: período de 8 compassos (semicadência no c. 4, cadência perfeita no c. 8), um acorde por compasso.",
        camadas: [
          { titulo: "O tema (que já é o esqueleto)", partitura: V_TEMA, cifras: cif(V_TEMA, V_C), rotulos: ["tema", "baixo"],
            notas: [["decisao", "Duas mínimas por compasso, todas notas do acorde: o tema é deliberadamente simples, para que qualquer figura caiba sobre ele."],
              ["checagem", "Contra o baixo: contrário ou oblíquo em todas as mudanças de acorde; semicadência em ré (c. 4), cadência em sol vindo de lá (c. 7–8)."]] },
          { titulo: "Var. 1: bordaduras em colcheias", partitura: V_BORD, cifras: cif(V_BORD, V_C), rotulos: ["var. 1", "baixo"],
            notas: [["decisao", "Motivo de variação: nota do esqueleto – bordadura – nota do esqueleto – nota de ligação (passagem ou do acorde) que leva por grau à próxima nota do esqueleto."],
              ["rejeitada", "No c. 2 a ligação natural seria F#4–E4–… para o sol, mas E4 sairia por salto. Troquei a figura por F#4–G4–A4–F#4: a regra 'modificar só o necessário' em ação."],
              ["checagem", "Primeira colcheia de cada meio compasso: D5 B4 | A4 F#4 | G4 B4 | A4 D5 | … — o esqueleto inteiro sobreviveu."]],
            pausa: ["A figura para no c. 8 (semibreve). Por que não continuar as colcheias até o fim?", "Porque a cadência precisa ser mais lenta que a superfície para soar como chegada — é a mesma liquidação da sentença. Muitas variações clássicas guardam a figura até o último compasso e só então param."] },
          { titulo: "Var. 2: minore", partitura: V_MIN, cifras: cif(V_MIN, V_CM), rotulos: ["minore", "baixo"],
            notas: [["decisao", "Sol menor: si♭ e mi♭ no lugar de si e mi; o V e o V7 mantêm o fá♯ (sensível)."],
              ["checagem", "O esqueleto adaptado continua passando no verificador: a troca de modo não cria intervalos aumentados (fá♯ e mi♭ nunca estão lado a lado)."]] },
        ] },
      { tipo: "contraste", titulo: "Figura sistemática × ornamentos soltos",
        a: { rotulo: "A — var. 1: uma figura do começo ao fim", partitura: V_BORD, cifras: cif(V_BORD, V_C) },
        b: { rotulo: "B — o tema com arpejos: outra figura, também sistemática", partitura: "tom: G maior\nmelodia: D5/0.5 B4 G4 B4 B4 D5 G5 B4 A4 D5 F#5 D5 F#4 A4 D5 A4 G4 B4 D5 B4 B4 D5 G5 B4 A4 D5 F#5 D5 D5 A4 D5 F#4 D5 B4 G4 B4 B4 D5 G5 B4 C5 E5 G5 E5 E5 C5 G4 E5 D5 B4 D5 B4 A4 D5 F#4 A4 G4/4\nbaixo: " + V_B, cifras: cif("tom: G maior\nmelodia: D5/0.5 B4 G4 B4 B4 D5 G5 B4 A4 D5 F#5 D5 F#4 A4 D5 A4 G4 B4 D5 B4 B4 D5 G5 B4 A4 D5 F#5 D5 D5 A4 D5 F#4 D5 B4 G4 B4 B4 D5 G5 B4 C5 E5 G5 E5 E5 C5 G4 E5 D5 B4 D5 B4 A4 D5 F#4 A4 G4/4\nbaixo: " + V_B, V_C) },
        pergunta: "As duas mantêm o esqueleto. Qual soa mais 'próxima' do tema, e qual mais virtuosística? O que decide isso?",
        comentario: "<p>A bordadura (A) fica colada às notas do tema: o ouvido acompanha a melodia original o tempo todo. O arpejo (B) espalha cada acorde por mais de uma oitava: o tema fica escondido no alto de cada arpejo e o que se ouve primeiro é a harmonia e o movimento. Por isso as séries clássicas costumam começar pela bordadura e só depois arpejar — do mais reconhecível para o mais distante.</p>" },
      { tipo: "quebra", titulo: "Variações que abandonam o esqueleto", html: `
        <p>A regra mantém o esqueleto e muda a superfície. Desde Beethoven, a <b>variação de caráter</b> faz o contrário com frequência: mantém a harmonia e as proporções e troca a melodia, o compasso, o andamento.</p>
        <ul><li><b>Beethoven, Variações Diabelli:</b> a valsa de Diabelli vira, já na var. 1, uma marcha; outras variações reduzem o tema a poucos traços (o salto inicial, a progressão) e uma delas cita 'Notte e giorno faticar' do <i>Don Giovanni</i>.</li>
        <li><b>Brahms</b> encerra as Variações op. 56a com uma passacaglia sobre um baixo derivado do tema, e as Variações Handel op. 24 com uma fuga: a série vira processo, não catálogo.</li>
        <li><b>Elgar, Variações 'Enigma':</b> cada variação é o retrato de uma pessoa — o caráter manda, o tema fica nas proporções.</li></ul>
        <p>O que a quebra produz: o ouvinte reconhece o tema pelo plano harmônico e pelas cadências, não pela melodia — a variação passa a ser comentário sobre o tema.</p>`,
        exemplos: [
          exc("compasso: 3/4\ntom: G menor\nmelodia: G4/1 Bb4/1 D5/1 F#5/1 D5/1 A4/1 Bb4/1 D5/1 G5/1 A5/2 F#5/1 G5/1 D5/1 Bb4/1 C5/1 Eb5/1 G5/1 G5/2 F#5/1 G5/3\nbaixo: G2/3 D3/3 G2/3 D3/3 G2/3 C3/3 D3/2 D3/1 G2/3", V_CM,
            { rotulo: "Var. de caráter: minore, em 3/4, melodia nova (exemplo construído)", perfil: { ...MELODIA, frm_cadencias: "erro" }, contexto: { plano: { cadencia: 8 }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita" }] },
              comentario: "Do tema sobram o plano harmônico (i V i V | i iv i64–V7 i), as cadências nos c. 4 e 8 e o número de compassos. A melodia sobe em arpejo e chega ao clímax lá5 na semicadência — nada disso está no tema, e mesmo assim ele é reconhecível pelo baixo." }),
        ] },
    ],
    exercicios: [
      { id: "var1", titulo: "Var. em arpejos", modo: "completar", perfil: { ...MELODIA, esqueleto_preservado: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: V_ESQ },
        cifras: V_C.split(" "),
        instrucoes: "<p>O baixo e as cifras são os do tema da aula. Os c. 1–2 já trazem o motivo de variação: <b>arpejo em colcheias que começa na nota do esqueleto</b>. Continue-o até o c. 7 (c. 8: semibreve na tônica), mantendo a nota do esqueleto no começo de cada meio compasso (D5 B4 | A4 F#4 | G4 B4 | A4 D5 | D5 B4 | C5 E5 | D5 A4 | G4).</p>",
        texto: `tom: G maior\ncf: baixo\nmelodia: D5/0.5 B4 G4 B4 B4 D5 G5 B4 A4 D5 F#5 D5 F#4 A4 D5 A4\nbaixo: ${V_B}`, duracao: 0.5, alvoCompassos: 8, plano: PLANO_VAR,
        solucao: `tom: G maior\ncf: baixo\nmelodia: D5/0.5 B4 G4 B4 B4 D5 G5 B4 A4 D5 F#5 D5 F#4 A4 D5 A4 G4 B4 D5 B4 B4 D5 G5 B4 A4 D5 F#5 D5 D5 A4 D5 F#4 D5 B4 G4 B4 B4 D5 G5 B4 C5 E5 G5 E5 E5 C5 G4 E5 D5 B4 D5 B4 A4 D5 F#4 A4 G4/4\nbaixo: ${V_B}`,
        comentarioSolucao: "O arpejo sobe ou desce conforme a próxima nota do esqueleto; a última colcheia de cada meio compasso evita chegar à mudança de acorde por 5ª ou 8ª paralela (por isso B4, e não D5, antes do lá do c. 2). No c. 7 o 6/4 é só ré e si: o sol (a 4ª sobre o baixo) ficaria sem resolução." },
      { id: "var2", titulo: "Minore com bordaduras", modo: "menos apoio", perfil: { ...MELODIA, esqueleto_preservado: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: V_ESQM },
        cifras: V_CM.split(" "),
        instrucoes: "<p>Escreva a variação <b>minore</b> (sol menor) em colcheias, com o motivo de variação da var. 1 da aula (nota do esqueleto – bordadura – nota do esqueleto – ligação). Esqueleto em menor, no começo de cada meio compasso: D5 B♭4 | A4 F#4 | G4 B♭4 | A4 D5 | D5 B♭4 | C5 E♭5 | D5 A4 | G4. Cuidado com a 2ª aumentada mi♭–fá♯.</p>",
        texto: `tom: G menor\ncf: baixo\nmelodia:\nbaixo: ${V_B}`, duracao: 0.5, alvoCompassos: 8, plano: PLANO_VAR,
        solucao: `tom: G menor\ncf: baixo\nmelodia: D5/0.5 Eb5 D5 C5 Bb4 C5 Bb4 G4 A4 Bb4 A4 G4 F#4 G4 A4 F#4 G4 A4 G4 A4 Bb4 C5 Bb4 G4 A4 G4 F#4 A4 D5 Eb5 D5 C5 D5 Eb5 D5 C5 Bb4 A4 Bb4 D5 C5 D5 C5 D5 Eb5 D5 C5 Eb5 D5 Eb5 D5 Bb4 A4 Bb4 A4 F#4 G4/4\nbaixo: ${V_B}`,
        comentarioSolucao: "A figura da var. 1 transposta para o modo menor; as bordaduras superiores ficam meio tom acima (mi♭ sobre ré, si♭ sobre lá), o que dá à minore o seu peso." },
      { id: "var3", titulo: "Var. de caráter: em 3/4", modo: "restrição", perfil: { ...MELODIA, esqueleto_preservado: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: V_ESQ3 },
        cifras: V_C.split(" "),
        instrucoes: "<p>Transforme o tema num minueto: <b>compasso 3/4</b>, um compasso de 3/4 para cada compasso do tema. As duas notas do esqueleto caem no 1º e no 3º tempo (a primeira dura dois tempos, ou ganha uma nota de passagem no 2º). Mesma harmonia, mesmas cadências.</p>",
        texto: "compasso: 3/4\ntom: G maior\ncf: baixo\nmelodia:\nbaixo: G2/3 D3/3 G2/3 D3/3 G2/3 C3/3 D3/2 D3/1 G2/3", duracao: 1, alvoCompassos: 8, plano: PLANO_VAR,
        solucao: "compasso: 3/4\ntom: G maior\ncf: baixo\nmelodia: D5/1 C5/1 B4/1 A4/1 G4/1 F#4/1 G4/1 A4/1 B4/1 A4/1 F#5/1 D5/1 D5/1 C5/1 B4/1 C5/1 D5/1 E5/1 D5/2 A4/1 G4/3\nbaixo: G2/3 D3/3 G2/3 D3/3 G2/3 C3/3 D3/2 D3/1 G2/3",
        comentarioSolucao: "Quase toda a variação preenche a 3ª entre as notas do esqueleto com uma passagem no 2º tempo — o movimento contínuo em semínimas do minueto. No c. 4 o salto lá–fá♯5–ré dá o impulso antes da segunda frase." },
      { id: "var4", titulo: "Quebrar: só a harmonia fica", modo: "quebrar", perfil: { ...MELODIA, esqueleto_preservado: "info", frm_cadencias: "erro", climax_no_lugar: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: V_ESQ, climax: { compasso: 6 }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita" }] },
        cifras: V_C.split(" "),
        instrucoes: "<p>Escreva uma variação de caráter que <b>abandona o esqueleto</b> (o verificador só o mostra como informação): melodia nova sobre o baixo e as cifras do tema, com a semicadência do c. 4 e a cadência perfeita do c. 8 nos seus lugares. Para que ela não seja o tema disfarçado, ponha o <b>clímax no c. 6</b> (nota mais aguda única), onde o tema não tem nenhum.</p>",
        texto: `tom: G maior\ncf: baixo\nmelodia:\nbaixo: ${V_B}`, duracao: 1, alvoCompassos: 8, plano: PLANO_VAR,
        solucao: `tom: G maior\ncf: baixo\nmelodia: G4/1 B4/1 D5/2 F#5/1 D5/1 A4/2 B4/1 D5/1 B4/2 F#5/1 E5/1 D5/2 B4/1 C5/1 D5/2 C5/1 E5/1 G5/1 E5/1 D5/1 B4/1 A4/1 F#4/1 G4/4\nbaixo: ${V_B}`,
        comentarioSolucao: "Da melodia original quase nada fica nos tempos fortes (o verificador acusa as diferenças como informação). O que garante que é uma variação do mesmo tema é o resto: baixo, harmonia, cadências nos c. 4 e 8 e as proporções 4 + 4." },
    ],
  }, { depoisDe: "binaria" });

})(this);
