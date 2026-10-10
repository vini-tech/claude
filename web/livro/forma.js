/* Nível 3 · Forma: motivo e variação, expansão da frase, binária/ternária/minueto, tema e variações.
 * Fontes: Schoenberg, Fundamentals of Musical Composition (caps. III, XIII–XVII); Koch, Versuch (vol. 3);
 * Riepel, Anfangsgründe (via Eckert, MTO 11.2); Caplin, Classical Form; Schmalfeldt (1992); Rothstein,
 * Phrase Rhythm in Tonal Music; Open Music Theory 2e (3.2–3.7). Melodias: compostas para o livro (não são citações). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL, MELODIA, PLANO_FRASE } = T.perfis;
  const F = M.ferramentas;

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

  const SEM_PLANO = { plano: {}, cadencias: null };
  void SEM_PLANO; void exc; void TONAL; void MELODIA; void PLANO_FRASE; void F;
})(this);
