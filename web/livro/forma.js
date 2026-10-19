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
    objetivo: "Construir uma frase de um só motivo, decidindo em cada compasso que traço preservar (ritmo, contorno, intervalos) e qual mudar.",
    ouvir: ["Beethoven, Sinfonia nº 5, 1º mov.: motivo quase só ritmo", "Brahms, Sinfonia nº 4, 1º mov.: cadeia de terças", "Rachmaninoff, Rapsódia sobre um tema de Paganini, var. 18: tema invertido"],
    esboco: "Escreva um motivo de um compasso sobre o acorde de tônica e, embaixo, três versões: uma que mantém só o ritmo, uma que mantém só o contorno, uma invertida.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "O motivo e os operadores de variação (Schoenberg)", html: `
        <p><b>Motivo</b> (Schoenberg, <i>Fundamentals</i>, cap. III): menor unidade que se repete de modo reconhecível — intervalos e ritmo num contorno, com harmonia implícita. Regra: <b>variar alguns traços, preservar os outros</b>; preservar o ritmo é o que mais garante coerência.</p>
        <table class="tabela-modos"><thead><tr><th>Traço</th><th>Operações (Schoenberg, exs. 17–29)</th></tr></thead><tbody>
        <tr><td>Ritmo</td><td>mudar durações; repetir notas; repetir células rítmicas; deslocar no compasso; acrescentar anacruse</td></tr>
        <tr><td>Intervalos</td><td>mudar ordem ou direção; acrescentar ou omitir intervalos; preencher saltos com passagens e bordaduras; condensar; inverter</td></tr>
        <tr><td>Harmonia</td><td>reharmonizar a mesma melodia; inverter o acorde; inserir ou substituir acordes</td></tr>
        <tr><td>Adaptação melódica</td><td>transpor e ajustar os intervalos ao acorde novo (a 4ª vira 3ª para caber no vi)</td></tr></tbody></table>
        <table class="tabela-modos"><thead><tr><th>Termo</th><th>O que é</th></tr></thead><tbody>
        <tr><td>Repetição sob outra forma</td><td>transposição, inversão, aumentação, diminuição: preservam as relações</td></tr>
        <tr><td>Variação</td><td>muda alguns traços</td></tr>
        <tr><td>Variante × forma do motivo</td><td>mudança local, sem consequência × mudança que gera continuação</td></tr>
        <tr><td>Variação desenvolvente</td><td>cada formulação deriva da anterior (música homofônica pós-1750; Brahms)</td></tr></tbody></table>
        <h3>Como trabalhar</h3>
        <ol><li>Liste os traços: ritmo, intervalos (com direção), contorno, harmonia.</li>
        <li>A cada compasso, mude <b>um</b> traço; o acorde novo costuma obrigar a adaptar intervalos.</li>
        <li>Perto da cadência, liquide até sobrar a fórmula cadencial.</li></ol>` },
      { tipo: "exemplo", titulo: "Uma frase de um motivo só", intro: "Dó maior, 4/4. Baixo e cifras prontos; cada compasso aplica uma operação ao motivo do c. 1.",
        camadas: [
          { titulo: "O motivo e os seus traços", partitura: "tom: C maior\nmotivo: C5/1 E5/0.5 D5 C5/1 G4/1", rotulos: ["motivo"],
            anotacoes: [[0, 0, "♩"], [0, 1, "3ª ↑"], [0, 2, "passagem"], [0, 4, "4ª ↓"]],
            notas: [["decisao", "Ritmo ♩ ♪♪ ♩ ♩; intervalos +3, −2, −2, −4; contorno sobe–desce–desce–desce; harmonia I (ré = passagem)."],
              ["rejeitada", "Arpejo puro (C5–E5–G5–E5): sem a passagem, pouco para preencher ou condensar."]] },
          { titulo: "Antecedente: reharmonizar, inverter, liquidar", partitura: `${C1}\nbaixo: ${C1B}`, rotulos: ["melodia", "baixo"], cifras: cif(`${C1}\nbaixo: ${C1B}`, "I vi IV V"),
            anotacoes: [[0, 0, "motivo"], [0, 5, "sobre vi"], [0, 10, "inversão"], [0, 15, "liquidação"]],
            notas: [["decisao", "C. 2: mesma melodia sobre vi; só o último intervalo se adapta (G4 → A4: a 4ª vira 3ª)."],
              ["decisao", "C. 3: inversão exata sobre IV (C5–A4–B4–C5–F5); o ritmo intacto a torna reconhecível."],
              ["decisao", "C. 4: liquidação (D5–C5–B4), semicadência na sensível."]],
            pausa: ["Por que o c. 2 repete a melodia em vez de variá-la?", "A variação é harmônica: mesma melodia sobre vi. Mudar melodia e harmonia já no c. 2 enfraqueceria o motivo antes de ele ser reconhecido."] },
          { titulo: "A frase inteira: variação desenvolvente até a cadência", partitura: C1_8, rotulos: ["melodia", "baixo"], cifras: cif(C1_8, C1_CIF),
            anotacoes: [[0, 20, "intervalos ampliados"], [0, 25, "diminuição"], [0, 30, "sequência"]],
            notas: [["decisao", "C. 5: o começo volta com o 1º intervalo ampliado (+5): ritmo e contorno ficam, intervalos mudam."],
              ["decisao", "C. 6: diminuição e sequência uma 2ª acima sobre I6–ii6: a fragmentação acelera."],
              ["decisao", "C. 7: sem colcheias (E5–G5–D5–B4 sobre I64–V); o clímax G5 chega com o motivo já liquidado."]],
            pausa: ["Qual compasso está mais longe do motivo, e por que ainda soa coerente?", "O c. 7: sem ritmo nem intervalos do motivo. Coerente porque a liquidação foi gradual (c. 4, c. 6) e porque é cadência, onde se espera material convencional."] },
        ] },
      { tipo: "contraste", titulo: "Um motivo variado × uma ideia nova por compasso",
        a: { rotulo: "A — um motivo, operações escolhidas", partitura: C1_8, cifras: cif(C1_8, C1_CIF) },
        b: { rotulo: "B — mesmas harmonias, uma figura diferente em cada compasso", partitura: C1_8B, cifras: cif(C1_8B, C1_CIF) },
        pergunta: "As duas passam no verificador. Qual você reconheceria amanhã, e o que fica na memória?",
        comentario: "<p>B: figura nova a cada compasso; nada se repete nem se fixa, e o c. 7 não tem o que liquidar. A: ♩ ♪♪ ♩ ♩ volta em três compassos e o desenho de intervalos em dois; a variedade vem das operações, não de material novo.</p>" },
      { tipo: "quebra", titulo: "Quando a variação não volta ao motivo", html: `
        <table class="tabela-modos"><thead><tr><th>Obra</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Beethoven, 5ª Sinfonia</td><td>só o ritmo fica; altura, intervalo, harmonia e timbre mudam</td><td>caso-limite da primazia do ritmo</td></tr>
        <tr><td>Brahms (variação desenvolvente; 4ª Sinfonia, cadeia de 3ªs)</td><td>cada formulação deriva da anterior, não do motivo</td><td>após alguns elos, nenhum traço literal do começo</td></tr>
        <tr><td>Rachmaninoff, Rapsódia Paganini, var. 18</td><td>inversão lenta, em outro modo</td><td>a operação 'exata' gera um tema novo</td></tr></tbody></table>
        <p>Continuidade sem retorno. Preço: o ouvinte precisa de harmonia clara e cadências para não se perder.</p>`,
        exemplos: [
          { rotulo: "Beethoven, Sinfonia nº 5, início (só a melodia)", partitura: "compasso: 2/4\ntom: C menor\nmelodia: P/0.5 G4/0.5 G4 G4 Eb4/2 P/0.5 F4/0.5 F4 F4 D4/2~ D4/2", comentario: "Mesmo ritmo, outra altura e intervalo (3ª M, depois 3ª m): o ritmo carrega a identidade." },
          exc("tom: G maior\nmelodia: B4/1 D5/1 G5/2 F#5/2 D5/1 A4/1 B4/2 E5/1 G5/1 G4/0.5 C5/0.5 E5/3 E5/1 C5/1 A4/2 G4/4\nbaixo: G2/4 D3/4 G2/4 E3/4 C3/2 D3/2 G2/4", "I V vi6 IV6 ii6 V I",
            { rotulo: "Cadeia de variações (exemplo construído)", perfil: { ...BASE }, contexto: { plano: { cadencia: 6 } },
              comentario: "C. 2 = ritmo do c. 1 retrogradado, intervalos espelhados; c. 3 = ritmo do c. 2, intervalos novos; c. 4 = intervalos do c. 3, ritmo novo: quase nada do c. 1. C. 5 liquida." }),
        ] },
    ],
    exercicios: [
      { id: "mot1", titulo: "Adaptar e inverter", modo: "completar", perfil: { ...BASE, semicadencia: "erro", frm_variacao: "erro", frm_transformacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4 }, motivo: { de: 1, variar: [{ em: 2, manter: ["ritmo", "contorno"], mudar: ["intervalos"] }], inversao: [3] } },
        cifras: "I V7 vi ii6 V".split(" "),
        instrucoes: "<p>Escreva os c. 2–4: <b>c. 2</b> com ritmo e contorno do motivo, intervalos adaptados ao V7; <b>c. 3</b>, inversão sobre vi; <b>c. 4</b>, liquidação até a semicadência.</p>",
        texto: "tom: C maior\ncf: baixo\nmelodia: E5/0.5 D5 C5/1 G5/1 E5/1\nbaixo: C3/4 G2/4 A2/4 F2/2 G2/2", duracao: 1, alvoCompassos: 4, plano: PLANO_MOTIVO,
        solucao: "tom: C maior\ncf: baixo\nmelodia: E5/0.5 D5 C5/1 G5/1 E5/1 D5/0.5 C5 B4/1 D5/1 G4/1 C5/0.5 D5 E5/1 A4/1 C5/1 D5/1.5 C5/0.5 B4/2\nbaixo: C3/4 G2/4 A2/4 F2/2 G2/2",
        comentarioSolucao: "Motivo −2, −2, +5, −3. C. 2: −2, −2, +3, −4 (o salto encolhe para o V7). C. 3: +2, +2, −5, +3, inversão exata. C. 4: D5–C5–B4." },
      { id: "mot2", titulo: "Um ritmo, quatro variações", modo: "menos apoio", perfil: { ...MELODIA, semicadencia: "erro", frm_variacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, motivo: { de: 1, variar: [2, 3, 5, 6].map((em) => ({ em, manter: ["ritmo"] })) } },
        cifras: "i V7 i iv6 V i6 iv i64 V i".split(" "),
        instrucoes: "<p>Lá menor. Componha os c. 2–8: <b>c. 2, 3, 5 e 6</b> com o ritmo do motivo (♩. ♪ ♩ ♩), intervalos livres. Semicadência no c. 4, cadência perfeita no c. 8.</p>",
        texto: "tom: A menor\ncf: baixo\nmelodia: E5/1.5 D5/0.5 C5/1 A4/1\nbaixo: A2/4 E2/4 A2/4 F2/2 E2/2 C3/4 D3/4 E3/2 E3/2 A2/4", duracao: 1, alvoCompassos: 8, plano: PLANO_MOTIVO,
        solucao: "tom: A menor\ncf: baixo\nmelodia: E5/1.5 D5/0.5 C5/1 A4/1 D5/1.5 C5/0.5 B4/1 G#4/1 A4/1.5 B4/0.5 C5/1 E5/1 D5/1 A4/1 B4/2 E5/1.5 D5/0.5 C5/1 A4/1 F5/1.5 E5/0.5 D5/1 A4/1 C5/1 E5/1 B4/2 A4/4\nbaixo: A2/4 E2/4 A2/4 F2/2 E2/2 C3/4 D3/4 E3/2 E3/2 A2/4",
        comentarioSolucao: "C. 2: sequência uma 2ª abaixo. C. 3: contorno invertido, resolve o sol♯. C. 5: motivo sobre i6. C. 6: 1º salto maior (F5) sobre iv. C. 7 liquida." },
      { id: "mot3", titulo: "O motivo alargado antes da cadência", modo: "restrição", perfil: { ...MELODIA, semicadencia: "erro", frm_transformacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, motivo: { de: 1, aumentacao: [5] } },
        cifras: "I V7 I ii6 V I I6 ii6 I64 V7 I".split(" "),
        instrucoes: "<p>Sol maior. <b>Restrição:</b> nos c. 5–6 o motivo volta em <b>aumentação</b> (durações dobradas, mesmo desenho). Semicadência no c. 4, cadência perfeita no c. 8.</p>",
        texto: "tom: G maior\ncf: baixo\nmelodia: D5/1 B4/0.5 C5/0.5 D5/2\nbaixo: G2/4 D3/4 G2/4 C3/2 D3/2 G3/4 B2/4 C3/2 D3/1 D3/1 G2/4", duracao: 1, alvoCompassos: 8, plano: PLANO_MOTIVO,
        solucao: "tom: G maior\ncf: baixo\nmelodia: D5/1 B4/0.5 C5/0.5 D5/2 C5/1 A4/0.5 B4/0.5 C5/2 B4/1 G4/0.5 A4/0.5 B4/2 C5/1 E5/1 F#5/2 D5/2 B4/1 C5/1 D5/4 C5/2 B4/1 A4/1 G4/4\nbaixo: G2/4 D3/4 G2/4 C3/2 D3/2 G3/4 B2/4 C3/2 D3/1 D3/1 G2/4",
        comentarioSolucao: "C. 2–3: sequência descendente. C. 4 sobe a F#5 (semicadência). C. 5–6: o motivo em câmera lenta sobre I e I6; a cadência volta às semínimas." },
      { id: "mot4", titulo: "Livre: seu motivo, três operações", modo: "livre", perfil: { ...MELODIA, semicadencia: "erro", frm_variacao: "erro", frm_transformacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, motivo: { de: 1, variar: [{ em: 2, manter: ["ritmo"], mudar: ["intervalos"] }], inversao: [3] } },
        cifrasAluno: true, alvoCompassos: 8,
        instrucoes: "<p>Ré menor. Melodia, baixo e cifras, 8 c., sobre um motivo seu: <b>c. 2</b> mesmo ritmo, outros intervalos; <b>c. 3</b> inversão. Semicadência no c. 4, perfeita no c. 8. Do c. 5 em diante, operações livres (anote no plano).</p>",
        texto: "tom: D menor\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_MOTIVO,
        solucao: "tom: D menor\nmelodia: A4/1 F4/0.5 G4 A4/1 D5/1 E5/1 C#5/0.5 D5 E5/1 C#5/1 D5/1 F5/0.5 E5 D5/1 Bb4/1 Bb4/1 G4/1 A4/2 A4/1 F4/0.5 G4 A4/1 D5/1 Bb4/1 G4/0.5 A4 Bb4/1 D5/1 F5/2 E5/1 C#5/1 D5/4\nbaixo: D3/4 A2/4 Bb2/4 Bb2/2 A2/2 D3/4 G2/4 A2/2 A2/2 D3/4",
        solucaoCifras: "i V VI iv6 V i iv i64 V7 i",
        comentarioSolucao: "Motivo −3, +2, +2, +4. C. 2 sobre V: −3, +2, +2, −3. C. 3: inversão tonal sobre VI (4ª vira 3ª). C. 5 retoma, c. 6 transpõe sobre iv, c. 7 liquida (6–5)." },
      { id: "mot5", titulo: "Quebrar: os intervalos ficam, o ritmo muda", modo: "quebrar", perfil: { ...MELODIA, semicadencia: "erro", frm_variacao: "erro", sequencia_do_motivo: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, motivo: { de: 1, em: [2, 3, 6], variar: [2, 3, 6].map((em) => ({ em, manter: ["intervalos"], mudar: ["ritmo"] })) } },
        cifras: "i VI iv V i iv6 i64 V i".split(" "),
        instrucoes: "<p>Mi menor, à maneira de Brahms: nos <b>c. 2, 3 e 6</b> preserve os intervalos do motivo (−3, +2, +2) e <b>mude o ritmo</b> a cada vez. Harmonia e cadências claras: semicadência no c. 4, perfeita no c. 8.</p>",
        texto: "tom: E menor\ncf: baixo\nmelodia: B4/1 G4/0.5 A4/0.5 B4/2\nbaixo: E3/4 C3/4 A2/4 B2/4 E3/4 C3/4 B2/2 B2/2 E3/4", duracao: 1, alvoCompassos: 8, plano: PLANO_MOTIVO,
        solucao: "tom: E menor\ncf: baixo\nmelodia: B4/1 G4/0.5 A4/0.5 B4/2 E5/2 C5/0.5 D5/0.5 E5/1 C5/0.5 A4/0.5 B4/1 C5/2 B4/1 F#4/1 B4/2 B4/1 G4/0.5 A4/0.5 B4/2 E5/2 C5/1 D5/0.5 E5/0.5 G5/2 F#5/1 D#5/1 E5/4\nbaixo: E3/4 C3/4 A2/4 B2/4 E3/4 C3/4 B2/2 B2/2 E3/4",
        comentarioSolucao: "−3, +2, +2 em três ritmos: 2–½–½–1 (c. 2), ½–½–1–2 (c. 3), 2–1–½–½ (c. 6). A identidade passa ao intervalo; as cadências seguram a forma." },
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
    objetivo: "Transformar uma frase-modelo de 4 + 4 numa frase assimétrica convincente: repetição, cadência evitada, 'one more time', sufixo.",
    ouvir: ["Beethoven, 'Patética', 3º mov.: refrão de 8 c. vira 17", "Beethoven, Sinfonia nº 9, Scherzo: 'ritmo di tre battute'", "Brahms, Variações op. 56a: tema em frases de 5 compassos"],
    esboco: "Pegue um consequente de 4 compassos (I | IV | I64 V7 | I) e escreva só o plano harmônico de duas versões mais longas: uma com repetição, outra com cadência de engano.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "A frase-modelo e as maneiras de esticá-la (Koch, Riepel, Caplin)", html: `
        <p>Riepel e Koch (<i>Versuch</i>, vol. 3): escrever a frase-modelo de <b>4 compassos</b> e depois <b>estendê-la</b>. A expansão <b>não apaga o modelo</b>: ainda se ouve de onde parte e aonde vai.</p>
        <table class="tabela-modos"><thead><tr><th>Técnica</th><th>Onde</th><th>O que faz</th></tr></thead><tbody>
        <tr><td>Repetição</td><td>dentro da frase</td><td>um compasso (ou grupo) volta, exato ou em sequência: 4 → 5</td></tr>
        <tr><td>Estiramento</td><td>dentro</td><td>a progressão é a mesma, com acordes mais longos (um por compasso na cadência)</td></tr>
        <tr><td>Cadência evitada / de engano</td><td>no ponto de chegada</td><td>o V não vai ao I em estado fundamental (vai a vi, I6, V42/IV): a frase precisa continuar</td></tr>
        <tr><td>'One more time' (Schmalfeldt 1992)</td><td>depois da evitada</td><td>o material pré-cadencial volta e a cadência é tentada de novo</td></tr>
        <tr><td>Prefixo / sufixo</td><td>antes / depois</td><td>introdução; codetta ou extensão pós-cadencial, sobre a tônica</td></tr>
        <tr><td>Elisão</td><td>na junção</td><td>a cadência de uma frase é o 1º compasso da seguinte (8 = 1)</td></tr>
        <tr><td>Contração</td><td>dentro</td><td>a frase chega antes do esperado (mais rara)</td></tr></tbody></table>
        <p><b>Internas</b> (entre começo e cadência) mudam o tamanho da frase; <b>externas</b> (prefixo, sufixo) ficam fora dela (Caplin, Rothstein). Boa expansão adia a cadência e reforça a chegada.</p>` },
      { tipo: "exemplo", titulo: "Um período, quatro tamanhos", intro: "Fá maior. Antecedente (c. 1–4, semicadência) fixo; muda só o consequente.",
        camadas: [
          { titulo: "Frase-modelo: 4 + 4", ...E_L1, rotulos: ["melodia", "baixo"],
            notas: [["decisao", "Consequente: motivo (c. 5), sequência sobre IV (c. 6), clímax A5 sobre I64 com 6–5 (c. 7), tônica (c. 8)."],
              ["checagem", "SC no c. 4 (sensível), cadência perfeita no c. 8; o ritmo harmônico acelera no c. 7."]] },
          { titulo: "Repetição: 4 + 5", ...expF(`${E5} ${E6} ${E6} ${E7} F5/4`, "F3/4 Bb2/4 Bb2/4 C3/2 C3/2 F3/4", "I IV IV I64 V7 I"), rotulos: ["melodia", "baixo"],
            anotacoes: [[0, 25, "repetição"]],
            notas: [["decisao", "C. 6 repetido igual (Koch): a pré-dominante insiste e o ouvinte percebe o compasso a mais."],
              ["rejeitada", "Repetir o c. 7 (I64–V7) dobraria a dominante sem resolver: hesitante, não enfático."],
              ["checagem", "Tire o c. 7 e sobra a frase-modelo."]] },
          { titulo: "Cadência de engano + 'one more time': 4 + 6", ...E_L3, rotulos: ["melodia", "baixo"],
            anotacoes: [[0, 26, "engano"], [0, 28, "de novo"]],
            notas: [["decisao", "C. 8: V7 → vi; a melodia chega ao fá, mas o baixo sobe a ré: chegada negada."],
              ["decisao", "C. 8, 2ª metade: IV recua à pré-dominante; o c. 9 repete o c. 7 ('one more time') e a cadência fecha no c. 10."],
              ["rejeitada", "I6 no c. 8 (cadência evitada) serviria; o engano convence mais porque o fá chega na melodia."]],
            pausa: ["Por que a cadência do c. 10 soa mais forte que a do c. 8 do modelo, com as mesmas notas?", "Foi esperada duas vezes: a 1ª tentativa criou e frustrou a expectativa; a repetição deixa prever a chegada, e o I a confirma."] },
          { titulo: "Sufixo: uma codetta que repete a cadência", ...expF(`${E5} ${E6} ${E7} F5/2 D5/2 ${E7} F5/4 D5/1 Bb4/1 G4/1 E4/1 F4/4`, "F3/4 Bb2/4 C3/2 C3/2 D3/2 Bb2/2 C3/2 C3/2 F3/4 Bb2/2 C3/2 F3/4", "I IV I64 V7 vi IV I64 V7 I IV V7 I"), rotulos: ["melodia", "baixo"],
            notas: [["decisao", "C. 11–12: IV–V7–I uma 8ª abaixo; a frase acabou no c. 10, a codetta confirma a tônica e dissipa a energia."],
              ["checagem", "Sufixo = expansão externa: a frase termina no c. 10."]] },
        ] },
      { tipo: "contraste", titulo: "Chegar na hora × chegar depois",
        a: { rotulo: "A — frase-modelo (cadência no c. 8)", partitura: E_L1.partitura, cifras: E_L1.cifras },
        b: { rotulo: "B — cadência de engano e nova tentativa (cadência no c. 10)", partitura: E_L3.partitura, cifras: E_L3.cifras },
        pergunta: "Em qual a cadência final pesa mais? Em qual o antecedente soa mais 'curto'?",
        comentario: "<p>A: 4 + 4 simétrico e neutro; a cadência chega quando se espera. B: a cadência é adiada duas vezes (engano, recuo ao IV) e o c. 10 pesa como conquista. Preço: o antecedente soa como pergunta curta diante de resposta longa — efeito buscado por Haydn e Beethoven em fins de seção.</p>" },
      { tipo: "quebra", titulo: "A grade de 4 compassos posta em xeque", html: `
        <p>A grade de 4 compassos é a norma de Riepel e Koch; o séc. XVIII joga com ela, o XIX a põe em dúvida.</p>
        <table class="tabela-modos"><thead><tr><th>Quem</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Haydn</td><td>frases de 5–7 c., cadências adiadas (fonte de muitos exemplos de Koch)</td><td>respiração mais larga</td></tr>
        <tr><td>Beethoven</td><td>Scherzo da 9ª: 'ritmo di tre battute'; 'Patética': refrão de 8 → 17 c. ('one more time', sufixo elidido)</td><td>impulso, desequilíbrio dançante</td></tr>
        <tr><td>Brahms</td><td>op. 56a: frases de 5 c.; Quarteto op. 25, finale: frases de 3 (Schoenberg, cap. XIV)</td><td>a assimetria vira o caráter do tema</td></tr>
        <tr><td>Romantismo (Rothstein)</td><td>elisões, entradas antecipadas</td><td>esconde a quadratura; no limite, 'melodia infinita'</td></tr></tbody></table>`,
        exemplos: [
          exc("tom: C maior\nmelodia: E5/1 C5/1 E5/1 G5/1 F5/1 A5/1 F5/1 A5/1 G5/2 B4/2 E5/1 C5/1 E5/1 G5/1 F5/2 E5/1 D5/1 C5/4\nbaixo: C3/4 F3/4 G3/4 C3/4 F3/2 G3/1 G3/1 C3/4", "I IV V I ii6 I64 V7 I",
            { rotulo: "Período de 3 + 3 (exemplo construído)", perfil: { ...MELODIA }, contexto: { plano: { cadencia: 6 } },
              comentario: "SC no c. 3, cadência perfeita no c. 6: cada frase termina um compasso cedo — a pressa dos grupos de 3 num scherzo." }),
          exc("tom: F maior\nmelodia: C5/1 A4/0.5 Bb4/0.5 C5/1 F5/1 D5/1 Bb4/0.5 C5/0.5 D5/1 F5/1 A5/2 G5/1 E5/1 F5/1 A4/0.5 Bb4/0.5 C5/1 F5/1 D5/1 Bb4/0.5 C5/0.5 D5/1 F5/1 A5/2 G5/1 E5/1 F5/4\nbaixo: F3/4 Bb2/4 C3/2 C3/2 F3/4 Bb2/4 C3/2 C3/2 F3/4", "I IV I64 V7 I IV I64 V7 I",
            { rotulo: "Elisão: 4 + 4 = 7 (exemplo construído)", perfil: { ...MELODIA }, contexto: { plano: { cadencia: 7 } }, anotacoes: [[0, 13, "fim = começo"]],
              comentario: "No c. 4 o fá da cadência é a 1ª nota da 2ª frase (no lugar do dó do motivo). Duas frases de 4 c. em 7." }),
        ] },
    ],
    exercicios: [
      { id: "exp1", titulo: "Um compasso a mais", modo: "completar", perfil: { ...MELODIA, semicadencia: "erro", sequencia_do_motivo: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 9 }, motivo: { de: 6, em: [7] } },
        cifras: "I V7 I6 IV V I IV6 vi I64 V7 I".split(" "),
        instrucoes: "<p>Ré maior, c. 1–5 dados. Consequente de <b>5 compassos</b>: escreva os c. 6–9 com o <b>c. 7 em sequência do c. 6</b> (mesmo ritmo e desenho, outra altura) e cadência perfeita no c. 9.</p>",
        texto: "tom: D maior\ncf: baixo\nmelodia: F#4/1 A4/0.5 G4/0.5 F#4/1 D5/1 E5/1.5 D5/0.5 C#5/2 D5/1 A4/1 B4/1 D5/1 C#5/1 E5/1 A4/2 F#4/1 A4/0.5 G4/0.5 F#4/1 D5/1\nbaixo: D3/4 A2/4 F#2/2 G2/2 A2/4 D3/4 B2/4 B2/4 A2/2 A2/2 D3/4",
        duracao: 1, alvoCompassos: 9, plano: PLANO_EXP,
        solucao: "tom: D maior\ncf: baixo\nmelodia: F#4/1 A4/0.5 G4/0.5 F#4/1 D5/1 E5/1.5 D5/0.5 C#5/2 D5/1 A4/1 B4/1 D5/1 C#5/1 E5/1 A4/2 F#4/1 A4/0.5 G4/0.5 F#4/1 D5/1 G4/1 B4/0.5 A4/0.5 G4/1 D5/1 B4/1 D5/0.5 C#5/0.5 B4/1 F#5/1 F#5/2 E5/1 C#5/1 D5/4\nbaixo: D3/4 A2/4 F#2/2 G2/2 A2/4 D3/4 B2/4 B2/4 A2/2 A2/2 D3/4",
        comentarioSolucao: "C. 6: motivo uma 4ª acima sobre IV6; c. 7: mesmo desenho uma 3ª acima sobre vi (o compasso inserido). F#5 fica como 6ª sobre I64 e desce a E5 no V7." },
      { id: "exp2", titulo: "Engano e nova tentativa", modo: "menos apoio", perfil: { ...MELODIA, semicadencia: "erro", frm_cadencias: "erro", frm_variacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 10 }, cadencias: [{ c: 8, tipo: "engano" }], motivo: { de: 7, variar: [{ em: 9, manter: ["ritmo", "contorno"] }] } },
        cifras: "i V7 i6 iv V i iv i64 V VI iv6 i64 V i".split(" "),
        instrucoes: "<p>Lá menor, consequente de 6 compassos. Escreva os c. 5–10: tentativa de cadência no c. 7, <b>engano</b> no c. 8 (V → VI) e <b>'one more time'</b>: o c. 9 repete ritmo e contorno do c. 7; cadência perfeita no c. 10.</p>",
        texto: "tom: A menor\ncf: baixo\nmelodia: A4/1 C5/1 E5/1.5 D5/0.5 E5/1 D5/0.5 C5/0.5 B4/2 C5/1 E5/1 F5/1 D5/1 B4/1 E5/1 G#4/2\nbaixo: A2/4 E3/4 C3/2 D3/2 E3/4 A2/4 D3/4 E3/2 E3/2 F3/2 F3/2 E3/2 E3/2 A2/4",
        duracao: 1, alvoCompassos: 10, plano: PLANO_EXP,
        solucao: "tom: A menor\ncf: baixo\nmelodia: A4/1 C5/1 E5/1.5 D5/0.5 E5/1 D5/0.5 C5/0.5 B4/2 C5/1 E5/1 F5/1 D5/1 B4/1 E5/1 G#4/2 A4/1 C5/1 E5/2 D5/1 F5/1 A5/2 E5/1 C5/1 B4/1 G#4/1 A4/1 C5/1 F5/1 D5/1 E5/1 C5/1 B4/1 G#4/1 A4/4\nbaixo: A2/4 E3/4 C3/2 D3/2 E3/4 A2/4 D3/4 E3/2 E3/2 F3/2 F3/2 E3/2 E3/2 A2/4",
        comentarioSolucao: "C. 8: a melodia cadencia (sol♯ → lá), o baixo vai a fá: engano. IV6 recua à pré-dominante; os c. 9–10 refazem a fórmula do c. 7 até o fim." },
      { id: "exp3", titulo: "Cadência evitada: 4 + 6, com o seu baixo", modo: "restrição", perfil: { ...MELODIA, frm_cadencias: "erro", frm_variacao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 10 }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "evitada" }, { c: 10, tipo: "perfeita" }], motivo: { de: 7, variar: [{ em: 9, manter: ["ritmo"] }] } },
        cifrasAluno: true, cifrasIniciais: "I V7 I6 IV V", alvoCompassos: 10,
        instrucoes: "<p>Sol maior, antecedente dado. Componha o consequente (duas vozes e cifras): <b>cadência evitada no c. 8</b> (V → acorde que não seja I em estado fundamental, p. ex. I6), c. 9 com o ritmo do c. 7, <b>cadência perfeita no c. 10</b>.</p>",
        texto: "tom: G maior\nmelodia: D5/1 B4/0.5 C5/0.5 D5/1 G5/1 F#5/1.5 E5/0.5 D5/1 C5/1 B4/1 D5/1 E5/1 C5/1 A4/2 D5/2\nbaixo: G2/4 D3/4 B2/2 C3/2 D3/4", duracao: 1, plano: PLANO_EXP,
        solucao: "tom: G maior\nmelodia: D5/1 B4/0.5 C5/0.5 D5/1 G5/1 F#5/1.5 E5/0.5 D5/1 C5/1 B4/1 D5/1 E5/1 C5/1 A4/2 D5/2 D5/1 B4/0.5 C5/0.5 D5/1 G5/1 E5/1 C5/0.5 D5/0.5 E5/1 G5/1 B4/2 A4/1 F#4/1 D5/2 E5/1 C5/1 B4/2 A4/1 F#4/1 G4/4\nbaixo: G2/4 D3/4 B2/2 C3/2 D3/4 G2/4 C3/4 D3/2 D3/2 B2/2 C3/2 D3/2 D3/2 G2/4",
        solucaoCifras: "I V7 I6 IV V I IV I64 V I6 IV I64 V I",
        comentarioSolucao: "C. 8: V → I6, e a melodia salta a ré em vez de cair no sol; o baixo sobe si–dó e recua à pré-dominante. C. 9–10 refazem o c. 7 e fecham." },
      { id: "exp4", titulo: "Livre: período com codetta", modo: "livre", perfil: { ...MELODIA, frm_cadencias: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 10 }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita" }] },
        cifrasAluno: true, alvoCompassos: 10,
        instrucoes: "<p>Mi menor: melodia, baixo e cifras. Período de 8 c. (SC no c. 4, perfeita no c. 8) + <b>codetta de 2 c.</b> que repete a cadência sobre a tônica (perfeita no c. 10), sem material novo de peso.</p>",
        texto: "tom: E menor\nmelodia:\nbaixo:", duracao: 1, plano: PLANO_EXP,
        solucao: "tom: E menor\nmelodia: B4/1 G4/0.5 A4/0.5 B4/1 E5/1 F#5/1.5 E5/0.5 D#5/1 F#5/1 E5/1 B4/1 C5/1 E5/1 D#5/2 B4/2 B4/1 G4/0.5 A4/0.5 B4/1 E5/1 C5/1 A4/0.5 B4/0.5 C5/1 E5/1 G5/2 F#5/1 D#5/1 E5/4 C5/1 A4/1 F#4/1 D#4/1 E4/4\nbaixo: E3/4 B2/4 G2/2 A2/2 B2/4 E3/4 A2/4 B2/2 B2/2 E3/4 A2/2 B2/2 E3/4",
        solucaoCifras: "i V i6 iv V i iv i64 V7 i iv V7 i",
        comentarioSolucao: "Período paralelo 4 + 4; a codetta repete iv–V7–i uma 8ª abaixo, e a melodia desce em arpejo ao mi grave: a energia se esgota." },
      { id: "exp5", titulo: "Quebrar: um período de 5 + 5", modo: "quebrar", perfil: { ...MELODIA, frm_cadencias: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 10 }, cadencias: [{ c: 5, tipo: "semi" }, { c: 10, tipo: "perfeita" }] },
        cifras: "I IV ii6 I6 IV V I IV ii6 I64 V7 I".split(" "),
        instrucoes: "<p>Si♭ maior, como no tema do op. 56a de Brahms: <b>duas frases de 5 c.</b> sobre o baixo dado, SC no <b>c. 5</b>, perfeita no <b>c. 10</b>. O compasso extra é a pré-dominante prolongada (c. 2–3, 7–8): use-o na melodia, sem notas soltas.</p>",
        texto: "tom: Bb maior\ncf: baixo\nmelodia:\nbaixo: Bb2/4 Eb3/4 Eb3/4 D3/2 Eb3/2 F3/4 Bb3/4 Eb3/4 Eb3/4 F3/2 F3/2 Bb2/4", duracao: 1, alvoCompassos: 10, plano: PLANO_EXP,
        solucao: "tom: Bb maior\ncf: baixo\nmelodia: F4/1 Bb4/1 D5/1.5 C5/0.5 Bb4/1 G4/1 Eb5/1.5 D5/0.5 C5/1 G4/1 Eb5/2 F5/1 D5/1 G5/2 C5/2 A4/2 F4/1 Bb4/1 D5/1.5 C5/0.5 Bb4/1 G4/1 Eb5/1.5 D5/0.5 C5/1 G4/1 Eb5/2 D5/2 C5/1 A4/1 Bb4/4\nbaixo: Bb2/4 Eb3/4 Eb3/4 D3/2 Eb3/2 F3/4 Bb3/4 Eb3/4 Eb3/4 F3/2 F3/2 Bb2/4",
        comentarioSolucao: "O c. 3 retoma o gesto do c. 2 (dó–sol–mi♭ após si♭–sol–mi♭): a repetição justifica os 5 compassos. SC do c. 5 na sensível (lá)." },
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
    objetivo: "Compor um minueto em binária arredondada (8 + 8), com plano tonal, cadências no lugar e Monte, Fonte ou Ponte após a barra dupla.",
    ouvir: ["Caderno de Anna Magdalena Bach: Minueto em sol (Petzold)", "Mozart, Sinfonia nº 40, Menuetto e Trio", "Haydn, minuetos dos Quartetos op. 33"],
    esboco: "Escreva o plano de um minueto em ré maior de 16 compassos: em que compasso e em que tom cada frase termina, e onde volta o começo.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "As formas pequenas e o minueto como escola (Riepel, Koch, Schoenberg)", html: `
        <p>Escola de composição do séc. XVIII. Riepel (<i>Anfangsgründe</i>, 1752), na reconstrução de Eckert: 4 × 4 c. — abertura em I, ida a V, continuação, cadência; cada cadência ocupa 2 c.</p>` },
      { tipo: "exemplo", titulo: "Um minueto em dó maior, das cadências para dentro", intro: "3/4, binária arredondada, 8 + 8 compassos (sem as repetições).",
        camadas: [
          { titulo: "O plano", texto: "<b>1ª reprise</b>: c. 1–4 em I, SC; c. 5–8 modula a sol (pivô vi6 = ii6) e cadencia. <b>2ª reprise</b>: Fonte (c. 9–12), retorno (c. 13–14), cadência perfeita (c. 15–16)." },
          { titulo: "As cadências primeiro", partitura: "compasso: 3/4\ntom: C maior\nmelodia: P/6 A5/1 F5/1 D5/1 P/9 B4/2 A4/1 G4/2 P/1 P/18 G5/1 F5/1 D5/1 C5/3\nbaixo: P/6 F3/2 G3/1 P/9 D3/2 D3/1 G2/3 P/18 E3/1 F3/1 G3/1 C3/3", rotulos: ["melodia", "baixo"],
            notas: [["decisao", "C. 4: ii6–V, melodia no ré: SC. C. 7–8: I64–V–I em sol (si–lá–sol). C. 15–16: I6–ii6–V7–I (sol–fá–ré–dó)."],
              ["checagem", "Três chegadas de força crescente: aberta, fechada no V, fechada em casa."]] },
          { titulo: "1ª reprise", ...exc(`compasso: 3/4\ntom: C maior\nmelodia: ${B_R1}\nbaixo: ${B_R1B}`, B_R1C, { contexto: { plano: {}, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita", tom: "G maior" }] } }), rotulos: ["melodia", "baixo"],
            anotacoes: [[0, 15, "pivô"], [0, 18, "sol maior"]],
            notas: [["decisao", "C. 5 retoma o c. 1 com o arpejo invertido: a abertura se reconhece, mas a frase vai a outro lugar."],
              ["decisao", "C. 6: lá menor com dó no baixo = vi6 em dó = ii6 em sol. O fá♯ só entra no V do c. 7."],
              ["rejeitada", "V7/V já no c. 5 perderia a simetria: a 2ª frase deve começar como a 1ª para o desvio se perceber."]] },
          { titulo: "Minueto inteiro: Fonte e retorno", ...B_MIN, rotulos: ["melodia", "baixo"],
            anotacoes: [[0, 25, "Fonte"], [0, 31, "Fonte, um grau abaixo"], [0, 35, "retorno"]],
            notas: [["decisao", "C. 9–12, Fonte: V7/ii–ii, V7–I, um grau abaixo; a 7ª de cada dominante desce por grau."],
              ["decisao", "C. 13–14 = c. 1–2; o c. 15 acelera para a cadência, que 'rima' com o c. 4: a pergunta agora fecha."],
              ["checagem", "Plano: dó → sol (c. 8) → ré menor (c. 9–10) → dó."]],
            pausa: ["A Fonte termina na tônica e o começo volta, também na tônica. O que se perde sem uma Ponte?", "A tensão: após a Ponte, o retorno resolve uma dominante prolongada; após a Fonte, chega 'de lado', mais suave."] },
        ] },
      { tipo: "contraste", titulo: "Arredondada × simples",
        a: { rotulo: "A — o começo volta no c. 13", partitura: B_MIN.partitura, cifras: B_MIN.cifras, contexto: B_MIN.contexto },
        b: { rotulo: "B — a 2ª reprise continua sem retorno", partitura: B_SIMPLES.partitura, cifras: B_SIMPLES.cifras, contexto: B_SIMPLES.contexto },
        pergunta: "Mesma 1ª reprise, Fonte e cadência. Em qual o fim soa mais 'em casa'? Qual soa mais barroca?",
        comentario: "<p>A: o começo volta na tônica — a forma fecha por memória, não só por cadência (caminho para a sonata). B: a melodia termina em terreno novo: binária simples das suítes barrocas.</p>" },
      { tipo: "quebra", titulo: "Quando a 1ª parte não cadencia", html: `
        <table class="tabela-modos"><thead><tr><th>Obra</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Beethoven (op. 2 nº 2 e 3)</td><td>scherzo no lugar do minueto</td><td>mais rápido; 2ª reprise longa, desenvolvida</td></tr>
        <tr><td>Schumann (<i>Papillons</i> nº 1, <i>Kinderszenen</i> nº 9)</td><td>prolonga a tônica em vez de cadenciar a 1ª parte</td><td>a parte acaba sem 'chegar'</td></tr>
        <tr><td>Chopin</td><td>esconde ou elide a SC antes do retorno; repetições escritas e variadas</td><td>continuidade</td></tr></tbody></table>
        <p>Resultado: forma contínua, de peça de caráter, articulada mais pelo material que pelas cadências.</p>`,
        exemplos: [
          exc("compasso: 3/4\ntom: C maior\nmelodia: G4/1 C5/1 E5/1 D5/2 F5/1 E5/1 C5/1 G5/1 A5/1 F5/1 D5/1 E5/1 C5/1 G4/1 A4/1 C5/1 F5/1 E5/1 F5/1 E5/1 C5/3\nbaixo: C3/3 D3/3 E3/3 F3/2 G3/1 C3/3 F3/3 C3/1 C3/1 C3/1 C3/3", "I V43 I6 ii6 V I IV I IV64 I I",
            { rotulo: "1ª parte terminando sem cadência (exemplo construído)", perfil: { ...BASE, frm_cadencias: "erro" }, contexto: { plano: {}, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "aberta" }] },
              comentario: "C. 7–8: I–IV64–I sobre pedal de dó, sem V. A melodia desce à tônica; o fim se percebe pela duração e pelo registro." }),
        ] },
    ],
    exercicios: [
      { id: "bin1", titulo: "A escada de Eckert, degrau 1: a cadência da 1ª reprise", modo: "completar", perfil: { ...BASE, frm_cadencias: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: {}, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita", tom: "A maior" }] },
        cifras: "I V I6 IV V I vi=A:ii I64 V I".split(" "),
        instrucoes: "<p>Ré maior, 3/4. C. 6 = pivô (vi em ré = ii em lá). Escreva os c. 7–8: <b>cadência perfeita em lá</b> (I64–V–I), com lá na melodia no tempo forte do c. 8.</p>",
        texto: `compasso: 3/4\ntom: D maior\ncf: baixo\nmelodia: ${B_D1}\nbaixo: ${B_DB}`, duracao: 1, alvoCompassos: 8, plano: PLANO_MINUETO,
        solucao: `compasso: 3/4\ntom: D maior\ncf: baixo\nmelodia: ${B_D1} C#5/2 B4/1 A4/2 C#5/1\nbaixo: ${B_DB}`,
        comentarioSolucao: "Dó♯ (6ª sobre mi) → si (5ª) no V → lá: 6–5 sobre o 6/4, a fórmula de 2 c. de Riepel. O dó♯ final aponta para a 2ª reprise." },
      { id: "bin2", titulo: "Degrau 2: a 2ª reprise com Ponte", modo: "menos apoio", perfil: { ...MELODIA, frm_cadencias: "erro", ideia_repetida: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 16, repete: [1, 13] }, cadencias: [{ c: 16, tipo: "perfeita" }] },
        cifras: "I V I6 IV V I vi=A:ii I64 V I D:V I64 V V7 I V I6 ii6 V7 I".split(" "),
        instrucoes: "<p>Escreva a 2ª reprise (c. 9–16): <b>Ponte</b> nos c. 9–12 (pedal de lá: V – 6/4 de bordadura – V – V7), <b>retorno</b> nos c. 13–14, cadência perfeita no c. 16. A 7ª do c. 12 desce por grau à 1ª nota do retorno.</p>",
        texto: `compasso: 3/4\ntom: D maior\ncf: baixo\nmelodia: ${B_D1} C#5/2 B4/1 A4/2 C#5/1\nbaixo: ${B_DB} A2/3 A2/3 A2/3 A2/3 D3/3 A2/3 F#3/1 G3/1 A3/1 D3/3`, duracao: 1, alvoCompassos: 16, plano: PLANO_MINUETO,
        solucao: `compasso: 3/4\ntom: D maior\ncf: baixo\nmelodia: ${B_D1} C#5/2 B4/1 A4/2 C#5/1 E5/1 C#5/1 E5/1 F#5/1 A5/1 F#5/1 E5/1 C#5/1 A4/1 C#5/1 E5/1 G5/1 F#5/1 E5/0.5 D5/0.5 A4/1 C#5/1 E5/1 A4/1 D5/1 E5/1 C#5/1 D5/3\nbaixo: ${B_DB} A2/3 A2/3 A2/3 A2/3 D3/3 A2/3 F#3/1 G3/1 A3/1 D3/3`,
        comentarioSolucao: "Ponte de 4 c. sobre lá, subindo ao sol (7ª), que desce ao fá♯ do retorno: a volta resolve a dominante. C. 15 acelera (I6–ii6–V7)." },
      { id: "bin3", titulo: "Degrau 3: minueto em menor com Monte", modo: "restrição", perfil: { ...MELODIA, frm_cadencias: "erro", ideia_repetida: "erro", sequencia_do_motivo: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 16, repete: [1, 13] }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita", tom: "C maior" }, { c: 12, tipo: "semi" }, { c: 16, tipo: "perfeita" }], motivo: { de: 9, em: [11] } },
        cifras: "i V6 i iv6 V i iv6=C:ii6 I64 V I a:V7/iv iv V7/V V i V6 i64 V i".split(" "),
        instrucoes: "<p>Lá menor, 3/4: a 1ª reprise vai a dó (pivô iv6 = ii6); a 2ª abre com <b>Monte</b> (V7/iv–iv, V7/V–V). Escreva a melodia. <b>Restrição:</b> c. 11 = sequência exata do c. 9, um grau acima; c. 13–14 = c. 1–2.</p>",
        texto: "compasso: 3/4\ntom: A menor\ncf: baixo\nmelodia:\nbaixo: A2/3 G#2/3 A2/3 F2/2 E2/1 A2/3 F2/3 G2/2 G2/1 C3/3 A2/3 D3/3 B2/3 E3/3 A2/3 G#2/3 E3/2 E3/1 A2/3", duracao: 1, alvoCompassos: 16, plano: PLANO_MINUETO,
        solucao: "compasso: 3/4\ntom: A menor\ncf: baixo\nmelodia: E5/1 C5/1 A4/1 B4/2 E5/1 C5/1 E5/1 A5/1 A5/1 D5/1 E5/1 E5/1 C5/1 A4/1 D5/1 F5/1 A5/1 E5/2 D5/1 C5/2 G4/1 A4/1 C#5/1 E5/1 F5/1 D5/1 A4/1 B4/1 D#5/1 F#5/1 G#5/1 B4/1 E5/1 E5/1 C5/1 A4/1 B4/2 E5/1 E5/2 B4/1 A4/3\nbaixo: A2/3 G#2/3 A2/3 F2/2 E2/1 A2/3 F2/3 G2/2 G2/1 C3/3 A2/3 D3/3 B2/3 E3/3 A2/3 G#2/3 E3/2 E3/1 A2/3",
        comentarioSolucao: "Monte: A7 → ré menor, B7 → E, cada sensível subindo por grau; o sol do c. 8 desce a lá (c. 9). SC no c. 12, retorno no c. 13." },
      { id: "bin4", titulo: "Livre: o trio", modo: "livre", perfil: { ...MELODIA, frm_cadencias: "erro", ideia_repetida: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 16, repete: [1, 13] }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita", tom: "C maior" }, { c: 16, tipo: "perfeita" }] },
        cifrasAluno: true, alvoCompassos: 16,
        instrucoes: "<p>Trio em <b>fá maior</b> (IV), 3/4, 16 c. (melodia, baixo, cifras): SC no c. 4; perfeita em <b>dó</b> no c. 8 (pivô nas cifras, ex.: vi6=C:ii6); Monte, Fonte ou Ponte; retorno no c. 13; perfeita no c. 16. Caráter contrastante (p. ex. legato).</p>",
        texto: "compasso: 3/4\ntom: F maior\nmelodia:\nbaixo:", duracao: 2, plano: PLANO_MINUETO,
        solucao: "compasso: 3/4\ntom: F maior\nmelodia: A4/2 C5/1 Bb4/2 G4/1 C5/2 F5/1 D5/2 C5/1 A4/2 C5/1 D5/2 F5/1 E5/2 D5/1 C5/3 C5/2 E5/1 G5/2 E5/1 E5/1 D5/1 C5/1 G4/2 Bb4/1 A4/2 C5/1 Bb4/2 G4/1 C5/1 D5/1 E5/1 F5/3\nbaixo: F3/3 G3/3 A3/3 Bb3/2 C4/1 F3/3 F3/3 G3/2 G3/1 C3/3 C3/3 C3/3 C3/3 C3/3 F3/3 G3/3 A3/1 Bb3/1 C4/1 F3/3",
        solucaoCifras: "I V43 I6 ii6 V I vi6=C:ii6 I64 V I F:V V V7 V7 I V43 I6 ii6 V7 I",
        comentarioSolucao: "Mínima + semínima quase sempre (o minueto andava em semínimas). 2ª reprise: Ponte sobre pedal de dó; a 7ª (si♭) desce a lá no retorno." },
      { id: "bin5", titulo: "Quebrar: a 1ª parte que não cadencia", modo: "quebrar", perfil: { ...BASE, frm_cadencias: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: {}, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "aberta" }] },
        cifras: "I V43 I6 ii6 V I IV I IV64 I I".split(" "),
        instrucoes: "<p>Sol maior, 3/4, 1ª parte de peça de caráter: SC no c. 4, mas os c. 7–8 <b>não cadenciam</b> — tônica prolongada por 6/4 de bordadura sobre pedal (I–IV64–I), como em Schumann. A melodia desce à tônica para marcar o fim.</p>",
        texto: "compasso: 3/4\ntom: G maior\ncf: baixo\nmelodia:\nbaixo: G2/3 A2/3 B2/3 C3/2 D3/1 G2/3 C3/3 G2/1 G2/1 G2/1 G2/3", duracao: 1, alvoCompassos: 8, plano: PLANO_MINUETO,
        solucao: "compasso: 3/4\ntom: G maior\ncf: baixo\nmelodia: B4/1 D5/1 G5/1 F#5/2 A5/1 G5/2 D5/1 E5/2 F#5/1 G5/1 D5/1 B4/1 C5/1 E5/1 G5/1 B4/1 C5/1 B4/1 G4/3\nbaixo: G2/3 A2/3 B2/3 C3/2 D3/1 G2/3 C3/3 G2/1 G2/1 G2/1 G2/3",
        comentarioSolucao: "C. 7: si–dó–si espelha a bordadura do baixo; o c. 8 desce ao sol grave. Sem V: a parte termina em casa, sem gesto de chegada." },
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
    objetivo: "Compor variações de um tema de 8 c. (figurais, minore, de caráter) mantendo harmonia, cadências e esqueleto — e saber quando abandoná-lo.",
    ouvir: ["Mozart, Sonata K. 331, 1º mov. (var. III em lá menor)", "Beethoven, Variações Diabelli op. 120 (var. 1, Alla marcia)", "Brahms, Variações op. 56a: finale em passacaglia"],
    esboco: "Escreva o esqueleto do tema da aula (uma nota por meio compasso) e invente duas figuras de colcheias que caibam entre duas notas do esqueleto.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Mudar a superfície, manter o curso (Schoenberg, Reicha)", html: `
        <p>Tema típico (Schoenberg): dois segmentos equilibrados, o 1º terminando em V; muitas vezes pequena binária. A variação clássica <b>mantém o curso</b>: número e ordem dos segmentos, harmonia, cadências.</p>
        <ol><li>Reduza o tema ao <b>esqueleto</b> (sem apojaturas, trinados, escalas; pode haver mais de um).</li>
        <li>Escolha um <b>motivo de variação</b> (até 2 c.) e aplique-o a cada nota do esqueleto, ajustando só o que a harmonia exige.</li>
        <li>Primeiro <b>circunscrever</b> com bordaduras; depois acelerar (colcheias, tercinas, semicolcheias), mudar registro ou voz.</li></ol>
        <table class="tabela-modos"><thead><tr><th>Tipo</th><th>O que muda</th><th>O que fica</th></tr></thead><tbody>
        <tr><td>Figural (ornamental)</td><td>a superfície: um motivo de variação</td><td>esqueleto, harmonia, cadências, compasso</td></tr>
        <tr><td>Minore / maggiore</td><td>o modo (homônimo)</td><td>tônica, funções, esqueleto adaptado</td></tr>
        <tr><td>De caráter</td><td>compasso, andamento, textura, às vezes a melodia</td><td>harmonia e cadências (e o número de segmentos)</td></tr>
        <tr><td>Cantus firmus</td><td>o que está em volta</td><td>a melodia inteira, passando de voz em voz</td></tr>
        <tr><td>Ostinato (passacaglia, chacona)</td><td>tudo acima do baixo</td><td>o baixo (ou a harmonia) repetido</td></tr></tbody></table>
        <p>Reicha, <i>L'art de varier</i>: 57 variações sobre um tema.</p>` },
      { tipo: "exemplo", titulo: "Um tema, duas variações", intro: "Sol maior, 4/4: período de 8 c. (SC no c. 4, perfeita no c. 8), um acorde por compasso.",
        camadas: [
          { titulo: "O tema (que já é o esqueleto)", partitura: V_TEMA, cifras: cif(V_TEMA, V_C), rotulos: ["tema", "baixo"],
            notas: [["decisao", "Duas mínimas por compasso, só notas do acorde: tema simples, para qualquer figura caber."],
              ["checagem", "Contrário ou oblíquo nas mudanças de acorde; SC em ré (c. 4), cadência em sol (c. 7–8)."]] },
          { titulo: "Var. 1: bordaduras em colcheias", partitura: V_BORD, cifras: cif(V_BORD, V_C), rotulos: ["var. 1", "baixo"],
            notas: [["decisao", "Motivo de variação: esqueleto – bordadura – esqueleto – ligação por grau à próxima nota."],
              ["rejeitada", "C. 2: F#4–E4 sairia por salto; virou F#4–G4–A4–F#4 ('modificar só o necessário')."],
              ["checagem", "1ª colcheia de cada meio compasso: D5 B4 | A4 F#4 | G4 B4 | … — o esqueleto inteiro."]],
            pausa: ["A figura para no c. 8. Por que não continuar as colcheias?", "A cadência deve ser mais lenta que a superfície para soar como chegada (liquidação)."] },
          { titulo: "Var. 2: minore", partitura: V_MIN, cifras: cif(V_MIN, V_CM), rotulos: ["minore", "baixo"],
            notas: [["decisao", "Sol menor: si♭ e mi♭; V e V7 mantêm o fá♯."],
              ["checagem", "Sem intervalos aumentados: fá♯ e mi♭ nunca vizinhos."]] },
        ] },
      { tipo: "contraste", titulo: "Figura sistemática × ornamentos soltos",
        a: { rotulo: "A — var. 1: uma figura do começo ao fim", partitura: V_BORD, cifras: cif(V_BORD, V_C) },
        b: { rotulo: "B — o tema com arpejos: outra figura, também sistemática", partitura: "tom: G maior\nmelodia: D5/0.5 B4 G4 B4 B4 D5 G5 B4 A4 D5 F#5 D5 F#4 A4 D5 A4 G4 B4 D5 B4 B4 D5 G5 B4 A4 D5 F#5 D5 D5 A4 D5 F#4 D5 B4 G4 B4 B4 D5 G5 B4 C5 E5 G5 E5 E5 C5 G4 E5 D5 B4 D5 B4 A4 D5 F#4 A4 G4/4\nbaixo: " + V_B, cifras: cif("tom: G maior\nmelodia: D5/0.5 B4 G4 B4 B4 D5 G5 B4 A4 D5 F#5 D5 F#4 A4 D5 A4 G4 B4 D5 B4 B4 D5 G5 B4 A4 D5 F#5 D5 D5 A4 D5 F#4 D5 B4 G4 B4 B4 D5 G5 B4 C5 E5 G5 E5 E5 C5 G4 E5 D5 B4 D5 B4 A4 D5 F#4 A4 G4/4\nbaixo: " + V_B, V_C) },
        pergunta: "As duas mantêm o esqueleto. Qual soa mais próxima do tema, qual mais virtuosística? Por quê?",
        comentario: "<p>A (bordadura) fica colada às notas do tema. B (arpejo) espalha cada acorde por mais de uma 8ª: o tema se esconde e se ouve antes a harmonia. Por isso as séries vão da bordadura ao arpejo.</p>" },
      { tipo: "quebra", titulo: "Variações que abandonam o esqueleto", html: `
        <p>Desde Beethoven, a <b>variação de caráter</b> mantém harmonia e proporções e troca melodia, compasso, andamento.</p>
        <table class="tabela-modos"><thead><tr><th>Obra</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Beethoven, Variações Diabelli</td><td>a valsa vira marcha (var. 1); tema reduzido a poucos traços; citação de <i>Don Giovanni</i></td><td>variação como comentário</td></tr>
        <tr><td>Brahms, op. 56a e op. 24</td><td>finais em passacaglia e em fuga</td><td>a série vira processo, não catálogo</td></tr>
        <tr><td>Elgar, Variações 'Enigma'</td><td>cada variação retrata uma pessoa</td><td>o tema fica nas proporções</td></tr></tbody></table>
        <p>O tema se reconhece pela harmonia e pelas cadências, não pela melodia.</p>`,
        exemplos: [
          exc("compasso: 3/4\ntom: G menor\nmelodia: G4/1 Bb4/1 D5/1 F#5/1 D5/1 A4/1 Bb4/1 D5/1 G5/1 A5/2 F#5/1 G5/1 D5/1 Bb4/1 C5/1 Eb5/1 G5/1 G5/2 F#5/1 G5/3\nbaixo: G2/3 D3/3 G2/3 D3/3 G2/3 C3/3 D3/2 D3/1 G2/3", V_CM,
            { rotulo: "Var. de caráter: minore, em 3/4, melodia nova (exemplo construído)", perfil: { ...MELODIA, frm_cadencias: "erro" }, contexto: { plano: { cadencia: 8 }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita" }] },
              comentario: "Ficam harmonia (i V i V | i iv i64–V7 i), cadências nos c. 4 e 8 e número de compassos; melodia nova em arpejo, clímax lá5 na SC. Reconhecível pelo baixo." }),
        ] },
    ],
    exercicios: [
      { id: "var1", titulo: "Var. em arpejos", modo: "completar", perfil: { ...MELODIA, esqueleto_preservado: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: V_ESQ },
        cifras: V_C.split(" "),
        instrucoes: "<p>Continue o motivo dos c. 1–2 (<b>arpejo em colcheias a partir da nota do esqueleto</b>) até o c. 7; c. 8: semibreve na tônica. Esqueleto no início de cada meio compasso: D5 B4 | A4 F#4 | G4 B4 | A4 D5 | D5 B4 | C5 E5 | D5 A4 | G4.</p>",
        texto: `tom: G maior\ncf: baixo\nmelodia: D5/0.5 B4 G4 B4 B4 D5 G5 B4 A4 D5 F#5 D5 F#4 A4 D5 A4\nbaixo: ${V_B}`, duracao: 0.5, alvoCompassos: 8, plano: PLANO_VAR,
        solucao: `tom: G maior\ncf: baixo\nmelodia: D5/0.5 B4 G4 B4 B4 D5 G5 B4 A4 D5 F#5 D5 F#4 A4 D5 A4 G4 B4 D5 B4 B4 D5 G5 B4 A4 D5 F#5 D5 D5 A4 D5 F#4 D5 B4 G4 B4 B4 D5 G5 B4 C5 E5 G5 E5 E5 C5 G4 E5 D5 B4 D5 B4 A4 D5 F#4 A4 G4/4\nbaixo: ${V_B}`,
        comentarioSolucao: "O arpejo segue a direção da próxima nota do esqueleto, sem 5ª/8ª paralela na troca de acorde (B4, não D5, antes do lá do c. 2). C. 7: 6/4 só com ré e si." },
      { id: "var2", titulo: "Minore com bordaduras", modo: "menos apoio", perfil: { ...MELODIA, esqueleto_preservado: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: V_ESQM },
        cifras: V_CM.split(" "),
        instrucoes: "<p><b>Minore</b> (sol menor) em colcheias, com o motivo da var. 1 (esqueleto – bordadura – esqueleto – ligação). Esqueleto: D5 B♭4 | A4 F#4 | G4 B♭4 | A4 D5 | D5 B♭4 | C5 E♭5 | D5 A4 | G4. Evite a 2ª aumentada mi♭–fá♯.</p>",
        texto: `tom: G menor\ncf: baixo\nmelodia:\nbaixo: ${V_B}`, duracao: 0.5, alvoCompassos: 8, plano: PLANO_VAR,
        solucao: `tom: G menor\ncf: baixo\nmelodia: D5/0.5 Eb5 D5 C5 Bb4 C5 Bb4 G4 A4 Bb4 A4 G4 F#4 G4 A4 F#4 G4 A4 G4 A4 Bb4 C5 Bb4 G4 A4 G4 F#4 A4 D5 Eb5 D5 C5 D5 Eb5 D5 C5 Bb4 A4 Bb4 D5 C5 D5 C5 D5 Eb5 D5 C5 Eb5 D5 Eb5 D5 Bb4 A4 Bb4 A4 F#4 G4/4\nbaixo: ${V_B}`,
        comentarioSolucao: "Figura da var. 1 em menor; as bordaduras superiores a meio tom (mi♭ sobre ré, si♭ sobre lá) dão o peso da minore." },
      { id: "var3", titulo: "Var. de caráter: em 3/4", modo: "restrição", perfil: { ...MELODIA, esqueleto_preservado: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: V_ESQ3 },
        cifras: V_C.split(" "),
        instrucoes: "<p>O tema como minueto: <b>3/4</b>, um compasso por compasso do tema. Esqueleto no 1º e no 3º tempos (a 1ª nota dura dois tempos ou ganha passagem no 2º). Mesma harmonia e cadências.</p>",
        texto: "compasso: 3/4\ntom: G maior\ncf: baixo\nmelodia:\nbaixo: G2/3 D3/3 G2/3 D3/3 G2/3 C3/3 D3/2 D3/1 G2/3", duracao: 1, alvoCompassos: 8, plano: PLANO_VAR,
        solucao: "compasso: 3/4\ntom: G maior\ncf: baixo\nmelodia: D5/1 C5/1 B4/1 A4/1 G4/1 F#4/1 G4/1 A4/1 B4/1 A4/1 F#5/1 D5/1 D5/1 C5/1 B4/1 C5/1 D5/1 E5/1 D5/2 A4/1 G4/3\nbaixo: G2/3 D3/3 G2/3 D3/3 G2/3 C3/3 D3/2 D3/1 G2/3",
        comentarioSolucao: "Passagem no 2º tempo preenchendo a 3ª entre notas do esqueleto: semínimas contínuas. C. 4: o salto lá–fá♯5–ré impulsiona a 2ª frase." },
      { id: "var4", titulo: "Quebrar: só a harmonia fica", modo: "quebrar", perfil: { ...MELODIA, esqueleto_preservado: "info", frm_cadencias: "erro", climax_no_lugar: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, esqueleto: V_ESQ, climax: { compasso: 6 }, cadencias: [{ c: 4, tipo: "semi" }, { c: 8, tipo: "perfeita" }] },
        cifras: V_C.split(" "),
        instrucoes: "<p>Variação de caráter que <b>abandona o esqueleto</b> (o verificador só informa): melodia nova sobre baixo e cifras do tema, SC no c. 4, perfeita no c. 8, <b>clímax no c. 6</b> (nota mais aguda única).</p>",
        texto: `tom: G maior\ncf: baixo\nmelodia:\nbaixo: ${V_B}`, duracao: 1, alvoCompassos: 8, plano: PLANO_VAR,
        solucao: `tom: G maior\ncf: baixo\nmelodia: G4/1 B4/1 D5/2 F#5/1 D5/1 A4/2 B4/1 D5/1 B4/2 F#5/1 E5/1 D5/2 B4/1 C5/1 D5/2 C5/1 E5/1 G5/1 E5/1 D5/1 B4/1 A4/1 F#4/1 G4/4\nbaixo: ${V_B}`,
        comentarioSolucao: "Quase nada da melodia original nos tempos fortes. É variação pelo resto: baixo, harmonia, cadências nos c. 4 e 8, proporções 4 + 4." },
    ],
  }, { depoisDe: "binaria" });

  // escrita de tema: avisar o ritmo quase uniforme (nas variações, a figuração uniforme é proposital)
  for (const t of T.niveis.find((n) => n.numero === 3).temas) if (["motivo", "expansao", "binaria"].includes(t.id)) T.acrescentarRegras(t, { variedade_ritmica: "aviso" });

})(this);
