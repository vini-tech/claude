/* Nível 2 · Notas fora do acorde e retardos na harmonia.
 * Fontes: Fux (Gradus, 1725) para a passagem, a bordadura e a ligadura; C. P. E. Bach (Versuch, 1753) para a apojatura;
 * Kirnberger (Die Kunst des reinen Satzes) para a distinção entre dissonância essencial e acidental;
 * Aldwell & Schachter, Kostka & Payne e Piston para a classificação moderna; Schoenberg (Harmonielehre) para a crítica
 * do conceito de "nota estranha à harmonia". Notas: research_notes/O que se ensina em composição/harmonia.md, §3. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL } = T.perfis;
  const F = M.ferramentas;

  // ================================================================== classificação das notas fora do acorde
  /* Para cada nota da voz de cima que não pertence ao acorde cifrado (no ataque, ou quando o baixo muda por
   * baixo dela), devolve { nota, tipo, rotulo, problema? }. Tipos do estilo estrito: passagem, passagem_acentuada,
   * bordadura, bordadura_acentuada, bordadura_incompleta, escapada, antecipacao, apojatura, retardo, retardo_baixo.
   * Licenças (só valem quando ctx.ornLicencas as lista): apojatura_livre (acentuada e sem resolução por grau),
   * retardacao (retardo que resolve subindo), retardo_sem_preparacao, retardo_sem_resolucao.
   * Problemas: solta (não se explica por nenhum tipo), setima (7ª do acorde que não resolve), retardo_fraco. */
  const NOMES = {
    passagem: "nota de passagem", passagem_acentuada: "passagem acentuada", bordadura: "bordadura",
    bordadura_acentuada: "bordadura acentuada", bordadura_incompleta: "bordadura incompleta", escapada: "escapada",
    antecipacao: "antecipação", apojatura: "apojatura", retardo: "retardo", retardo_baixo: "retardo no baixo",
    apojatura_livre: "apojatura livre (sem resolução por grau)", retardacao: "retardo ascendente",
    retardo_sem_preparacao: "retardo sem preparação", retardo_sem_resolucao: "retardo sem resolução",
  };
  const LICENCAS = ["apojatura_livre", "retardacao", "retardo_sem_preparacao", "retardo_sem_resolucao"];
  const passo = (a, b) => { const iv = F.intervalo(a, b); return iv.geral === 2 || (iv.geral === 1 && Math.abs(iv.semitons) === 1); };
  const salto = (a, b) => F.intervalo(a, b).geral >= 3;
  const numIv = (sup, inf) => { const g = F.harmonico(sup, inf).geral, k = ((g - 1) % 7) + 1; return k === 2 ? 9 : k === 1 && g > 1 ? 8 : k; };
  const simples = (sup, inf) => ((F.harmonico(sup, inf).geral - 1) % 7) + 1;

  function classificar(ex, ctx) {
    if (ex._orn && ex._ornCifras === ctx.cifras) return ex._orn;
    const r = [];
    const mel = ex.vozes[0], bai = ex.vozes[ex.vozes.length - 1];
    if (!mel || mel === bai || !ctx.cifras || !ex.tonalidade) return r;
    const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra && h.notas);
    if (!hs.length) return r;
    const hEm = (t) => hs.find((h) => h.inicio <= t && t < h.fim) || null;
    const tem = (h, n) => !!h && h.notas.has(n.altura.nome);
    const forca = (t) => ex.forcaMetrica(t);
    const add = (nota, tipo, extra = {}) => r.push({ nota, tipo, rotulo: NOMES[tipo] || tipo, ...extra });

    for (const n of mel.notas) {
      const ant = mel.anterior(n), prox = mel.seguinte(n);
      const h0 = hEm(n.inicio);
      const hP = prox ? hEm(prox.inicio) : null;
      // ---- a nota atacada fora do acorde
      if (h0 && !tem(h0, n)) {
        const b = bai.soandoEm(n.inicio);
        const bn = b && bai.seguinte(b);
        const hb = bn && hEm(bn.inicio);
        const acc = n.inicio === h0.inicio || forca(n.inicio) >= 2;
        const sIn = ant && passo(ant, n), sOut = prox && passo(n, prox);
        if (b && b.inicio < n.inicio && bn && F.ehGrau(b, bn) && F.direcao(b, bn) < 0 && tem(hb, n) && forca(n.inicio) > forca(b.inicio)) {
          add(n, "retardo_baixo", { iv: `${simples(n, b)}–${simples(n, bn)}` });
        } else if (sIn && sOut && F.direcao(ant, n) === F.direcao(n, prox)) add(n, acc ? "passagem_acentuada" : "passagem");
        else if (sIn && sOut) add(n, acc ? "bordadura_acentuada" : "bordadura");
        else if (!acc && prox && prox.ps === n.ps && hP && hP !== h0 && tem(hP, prox)) add(n, "antecipacao");
        else if (!acc && sIn && prox && salto(n, prox) && F.direcao(ant, n) !== F.direcao(n, prox) && tem(hP, prox)) add(n, "escapada");
        else if (sOut && tem(hP, prox)) add(n, acc ? "apojatura" : "bordadura_incompleta");
        else if (acc) add(n, "apojatura_livre");
        else add(n, "solta", { problema: `${n.nome} está fora de ${h0.texto} e não é passagem, bordadura, escapada, antecipação nem apojatura` });
      }
      // ---- a nota presa quando o baixo muda por baixo dela (retardo)
      for (const h of hs) {
        if (!(h.inicio > n.inicio && h.inicio < n.fim) || tem(h, n)) continue;
        const b = bai.soandoEm(h.inicio);
        if (!tem(h0, n)) { add(n, "retardo_sem_preparacao", { h }); continue; }
        if (forca(h.inicio) <= forca(n.inicio)) { add(n, "retardo_fraco", { h, problema: `${n.nome} fica presa sobre ${h.texto} num tempo mais fraco que a preparação: o retardo precisa cair no tempo forte` }); continue; }
        if (prox && passo(n, prox) && F.direcao(n, prox) < 0 && tem(hEm(prox.inicio), prox)) {
          add(n, "retardo", { h, iv: `${numIv(n, b)}–${numIv(prox, bai.soandoEm(prox.inicio))}` });
          continue;
        }
        if (prox && passo(n, prox) && F.direcao(n, prox) > 0 && tem(hEm(prox.inicio), prox)) { add(n, "retardacao", { h, iv: `${numIv(n, b)}–${numIv(prox, bai.soandoEm(prox.inicio))}` }); continue; }
        // resolução ornamentada: a nota um grau abaixo chega antes de o acorde mudar
        const depois = mel.notas.filter((q) => q.inicio >= n.fim && q.inicio < h.fim);
        const res = depois.find((q) => passo(n, q) && F.direcao(n, q) < 0 && tem(hEm(q.inicio), q));
        if (res) add(n, "retardo", { h, iv: `${numIv(n, b)}–${numIv(res, bai.soandoEm(res.inicio))}`, ornamentada: true });
        else add(n, "retardo_sem_resolucao", { h });
      }
      // ---- a 7ª do acorde (dissonância essencial) resolve descendo por grau quando o acorde muda
      if (h0 && tem(h0, n) && h0.cifra.setima && !h0.pivo && [...h0.notas][3] === n.altura.nome && prox && hP && hP !== h0) {
        const desce = passo(n, prox) && F.direcao(n, prox) < 0;
        const b = bai.soandoEm(n.inicio), bp = bai.soandoEm(prox.inicio);
        const sobe43 = passo(n, prox) && F.direcao(n, prox) > 0 && h0.cifra.membroBaixo === 2 && b && bp && F.ehGrau(b, bp) && F.direcao(b, bp) > 0;
        if (!desce && prox.ps !== n.ps && !sobe43) add(n, "setima", { problema: `${n.nome} é a 7ª de ${h0.texto} e não desce por grau para o acorde seguinte` });
      }
    }
    ex._orn = r; ex._ornCifras = ctx.cifras;
    return r;
  }

  const permitidas = (ctx) => new Set(ctx.ornLicencas || []);
  const EXPLICA_LICENCA = {
    apojatura_livre: "apojatura que não resolve por grau numa nota do acorde (licença romântica)",
    retardacao: "retardo que resolve subindo (licença posterior ao estilo estrito)",
    retardo_sem_preparacao: "nota presa que não era consonante antes (retardo sem preparação)",
    retardo_sem_resolucao: "nota presa que não resolve um grau abaixo",
  };

  M.definirRegra("orn_cifras", "Cifra coerente com o baixo",
    "Cada nota do baixo tem uma cifra reconhecida e é o membro do acorde que a cifra indica (I6: a 3ª no baixo; V43: a 5ª). A melodia pode ter notas fora do acorde: quem as confere é a regra das notas fora do acorde.",
    function* (ex, ctx) {
      for (const h of R3.harmoniasCifradas(ex, ctx)) {
        const c = ex.compassoDe(h.inicio);
        if (!h.texto) { yield [c, `baixo ${h.baixo.nome}: falta a cifra`, [h.baixo]]; continue; }
        if (!h.cifra) { yield [c, `cifra "${h.texto}" não reconhecida (use I, ii6, V43, I64, V7, vii°6…)`, [h.baixo]]; continue; }
        const esperado = R3.membros(h.cifra, h.tom)[h.cifra.membroBaixo];
        const velho = h.pivo ? R3.membros(h.pivo.velho.cifra, h.pivo.velho.tom)[h.pivo.velho.cifra.membroBaixo] : null;
        if (h.baixo.altura.nome !== esperado && h.baixo.altura.nome !== velho) yield [c, `${h.texto} pede ${esperado} no baixo, e o baixo tem ${h.baixo.nome}`, [h.baixo]];
      }
    }, { precisaTom: true,
      porque: "A cifra é a sua leitura da harmonia. Neste capítulo a melodia pode ter notas fora do acorde no ataque do baixo (apojaturas, retardos), por isso a coerência da cifra é conferida só no baixo.",
      corrigir: "Confira qual membro do acorde está no baixo (fundamental = sem número, 3ª = 6, 5ª = 64; com 7ª: 7, 65, 43, 42) e troque a cifra ou a nota." });

  M.definirRegra("orn_notas_fora", "Notas fora do acorde com tratamento",
    "Toda nota da melodia fora do acorde cifrado se explica por um tipo: passagem (grau–grau, mesma direção), bordadura (grau e volta), bordadura incompleta, escapada (grau, salto para o outro lado), antecipação (nota do acorde seguinte, repetida), apojatura (acentuada, resolve por grau), retardo (preparado, preso no tempo forte, resolve um grau abaixo). A 7ª do acorde desce por grau.",
    function* (ex, ctx) {
      const ok = permitidas(ctx);
      for (const c of classificar(ex, ctx)) {
        const comp = ex.compassoDe(c.h ? c.h.inicio : c.nota.inicio);
        if (c.problema) yield [comp, c.problema, [c.nota]];
        else if (LICENCAS.includes(c.tipo) && !ok.has(c.tipo)) yield [comp, `${c.nota.nome}: ${EXPLICA_LICENCA[c.tipo]}; no estilo estrito ela precisa de preparação e resolução por grau`, [c.nota]];
      }
    }, { precisaTom: true,
      porque: "Os tratados aceitam a nota estranha ao acorde porque o ouvido a entende como movimento: ela vem de uma nota do acorde e vai a outra por caminhos conhecidos. Fora desses caminhos, ela soa como nota errada.",
      corrigir: "Leve a nota por grau a uma nota do acorde (no tempo fraco: passagem ou bordadura; no forte: apojatura), ou prenda-a da nota anterior e resolva um grau abaixo (retardo). Escapada: chega por grau e salta na direção contrária. Antecipação: repete a nota do acorde seguinte." });

  M.definirRegra("orn_rotulos", "Classificação das notas fora do acorde",
    "Mostra como o verificador leu cada nota fora do acorde da melodia (informativo).",
    function* (ex, ctx) {
      for (const c of classificar(ex, ctx)) if (!c.problema) yield [ex.compassoDe(c.h ? c.h.inicio : c.nota.inicio), `${c.nota.nome}: ${c.rotulo}${c.iv ? " " + c.iv : ""}${c.ornamentada ? " (resolução ornamentada)" : ""}`, [c.nota]];
    }, { precisaTom: true, porque: "Nomear cada ornamento obriga a ouvir de onde ele vem e para onde vai.", corrigir: "Nada a corrigir: é só a leitura das suas notas." });

  /* ctx.ornMinimos = { apojatura: 1, escapada: 1, retardo: 2, … } */
  M.definirRegra("orn_minimos", "Ornamentos pedidos",
    "O exercício pede um número mínimo de certos tipos de nota fora do acorde (indicados no enunciado).",
    function* (ex, ctx) {
      if (!ctx.ornMinimos) return;
      const cs = classificar(ex, ctx).filter((c) => !c.problema);
      for (const [tipo, n] of Object.entries(ctx.ornMinimos)) {
        const k = cs.filter((c) => c.tipo === tipo).length;
        if (k < n) yield [ex.compassoDe(Math.max(0, ex.fim - 1)), `${k} × ${NOMES[tipo] || tipo}; o exercício pede pelo menos ${n}`, []];
      }
    }, { precisaTom: true,
      porque: "Usar cada ornamento de propósito, no lugar escolhido, é o que o transforma de acidente em vocabulário.",
      corrigir: "Procure o lugar que pede aquele gesto: apojatura no tempo forte, com salto antes e grau depois; escapada saindo por grau e voltando por salto; retardo preparado no tempo fraco, preso no forte, resolvido um grau abaixo." });
  for (const id of ["orn_notas_fora", "orn_rotulos"]) M.OLHA_ADIANTE.add(id);
  M.PRECISA_FIM.add("orn_minimos");

  // perfil base dos dois capítulos: o TONAL, com as regras de dissonância "cegas" (só intervalo contra o baixo)
  // trocadas pela leitura harmônica das notas fora do acorde
  const { cifras_coerentes, dissonancia_aproximacao, dissonancia_resolucao, ...BASE } = TONAL;
  const ORN = { ...BASE, orn_cifras: "erro", orn_notas_fora: "erro", orn_rotulos: "info" };

  const PERFIL_ORN = { ...ORN };
  const PERFIL_MIN = { ...ORN, orn_minimos: "erro" };
  const PLANO_ORN = [
    ["Esqueleto", "Uma nota do acorde por cifra: que linha estrutural você vai ornamentar?"],
    ["Ornamentos", "Onde entra cada nota fora do acorde (compasso, tempo) e de que tipo?"],
    ["Cadência", "Como a melodia chega à tônica (antecipação? apojatura sobre o 6/4?)"],
  ];
  const PLANO_RET = [
    ["Preparação", "Que nota do acorde anterior você vai prender, e em que tempo fraco?"],
    ["Retardo", "Sobre que acorde ela vira dissonância (4–3, 7–6, 9–8, 2–3)?"],
    ["Resolução", "Um grau abaixo, sobre qual nota do acorde? Direta ou ornamentada?"],
  ];

  // ================================================================== capítulo 1: notas fora do acorde
  const B_SOL = "baixo: G2/2 B2 C3 D3 E3 C3 D3 D3 G3/4";
  const CIF_SOL = [[0, "I"], [2, "I6"], [4, "IV"], [6, "V"], [8, "vi"], [10, "ii6"], [12, "I64"], [14, "V"], [16, "I"]];
  const CIF_LAM = [[0, "i"], [2, "VI"], [4, "iv"], [6, "V"], [8, "i"]];

  T.inserir(2, {
    id: "ornamentos", titulo: "Notas fora do acorde",
    objetivo: "Ornamentar uma melodia sobre baixo cifrado com cada nota fora do acorde, sabendo como chega, sai e em que tempo cai.",
    ouvir: ["Mozart, Requiem, 'Lacrimosa': apojaturas em suspiro", "Chopin, Prelúdio op. 28 nº 4: si–dó sobre acordes que mudam", "Wagner, Prelúdio de Tristão: apojatura sol♯–lá"],
    esboco: "Sobre I – IV – V – I em sol maior (uma mínima por acorde), escreva primeiro uma nota do acorde por mínima. Depois, sem consultar nada, acrescente uma nota fora do acorde em cada compasso e tente dizer o nome de cada uma.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Dissonância acidental: de onde vem, para onde vai", html: `
        <p>Dissonância <b>essencial</b>: está na cifra (7ª do V7). <b>Acidental</b>: fora do acorde, explicada pela condução (Kirnberger, 1771; espécies de Fux, 1725). Três perguntas: <b>como chega</b>, <b>como sai</b>, <b>em que tempo cai</b>.</p>
        <table class="tabela-modos"><thead><tr><th>Tipo</th><th>Chega</th><th>Sai</th><th>Tempo</th><th>Observação</th></tr></thead><tbody>
        <tr><td><b>Passagem</b></td><td>grau</td><td>grau, mesma direção</td><td>fraco</td><td>preenche uma 3ª entre notas do acorde; duas seguidas preenchem uma 4ª. <b>Cromática</b>: o semitom intermediário (dó–dó♯–ré)</td></tr>
        <tr><td><b>Passagem acentuada</b></td><td>grau</td><td>grau, mesma direção</td><td>forte</td><td>a dissonância cai com o baixo: mais tensa, mais "vocal"</td></tr>
        <tr><td><b>Bordadura</b></td><td>grau</td><td>grau, volta à nota</td><td>fraco (ou forte: acentuada)</td><td>superior ou inferior; a inferior costuma ser a 2ª menor (com sensível)</td></tr>
        <tr><td><b>Bordadura incompleta</b></td><td>salto</td><td>grau</td><td>fraco</td><td>meia bordadura; Aldwell &amp; Schachter juntam aqui também a escapada</td></tr>
        <tr><td><b>Apojatura</b></td><td>salto (ou sem preparação)</td><td>grau (geralmente descendente)</td><td><b>forte</b></td><td>a dissonância mais expressiva; resolve numa nota do mesmo acorde</td></tr>
        <tr><td><b>Escapada</b> (<i>échappée</i>)</td><td>grau</td><td>salto, direção contrária</td><td>fraco</td><td>típica na cadência: 2–3–1 (lá–si–sol)</td></tr>
        <tr><td><b>Antecipação</b></td><td>grau (em geral)</td><td>mesma nota</td><td>fraco, curta</td><td>a nota do acorde seguinte chega antes; clássica no soprano da cadência</td></tr>
        <tr><td><b>Retardo</b></td><td>preparado (mesma nota)</td><td>grau descendente</td><td>forte</td><td>tem capítulo próprio: <i>Retardos na harmonia</i></td></tr>
        <tr><td><b>Pedal</b></td><td colspan="2">nota longa (quase sempre no baixo: tônica ou dominante) sobre a qual as harmonias mudam</td><td>—</td><td>começa e termina consonante; no meio, as vozes de cima podem formar acordes estranhos a ela</td></tr>
        </tbody></table>
        <h3>Em que voz, e para quê</h3>
        <ul><li>Ornamentos no <b>soprano</b>; cada nota do baixo é do acorde.</li>
        <li>Passagem, bordadura: fluência. Apojatura, passagem acentuada: o “suspiro”. Escapada, antecipação: gestos de cadência.</li></ul>
        <ol><li>Esqueleto: uma nota do acorde por cifra.</li>
        <li>Ornamentos fracos para ligar.</li>
        <li>Poucos fortes, onde quer acento.</li>
        <li>Reconfira 5ªs e 8ªs: <b>a nota ornamental também forma intervalo</b>.</li></ol>` },
      { tipo: "exemplo", titulo: "Ornamentar um esqueleto em sol maior", intro: "Baixo e cifras fixos; só o soprano muda.",
        camadas: [
          { titulo: "1. Esqueleto: uma nota do acorde por cifra", partitura: `tom: G maior\nsoprano: D5/2 B4 E5 D5 G5 E5 G5 A5 G5/4\n${B_SOL}`, rotulos: ["soprano", "baixo"], cifras: CIF_SOL,
            notas: [["decisao", "Consonâncias perfeitas por movimento contrário; a 4ª do c. 4 é do 6/4 cadencial (cifra)."],
              ["checagem", "Nenhuma nota fora do acorde: correta e morta. Ponto de partida."]] },
          { titulo: "2. Ornamentos fracos: passagem e bordadura", partitura: `tom: G maior\nsoprano: D5/1 C5 B4 C5/0.5 D5 E5/0.5 F#5 E5/1 D5 F#5 G5/2 E5/1 F#5 G5/2 A5 G5/4\n${B_SOL}`, rotulos: ["soprano", "baixo"], cifras: CIF_SOL,
            anotacoes: [[0, 1, "P"], [0, 3, "P"], [0, 6, "B"], [0, 12, "P"]],
            notas: [["decisao", "C. 1: dó5 preenche a 3ª ré–si (passagem); si–dó–ré leva ao mi5 do IV."],
              ["decisao", "C. 2: em vez de repetir mi5, bordadura em colcheia (mi–fá♯–mi)."],
              ["checagem", "Todas em tempo fraco, entrando e saindo por grau: estilo estrito."]],
            pausa: ["Por que nada fora do acorde nos tempos 1 e 3?", "Aqui os ornamentos só ligam. No tempo forte a nota estranha vira acontecimento (apojatura): é a próxima decisão."] },
          { titulo: "3. Ornamentos fortes e de cadência: apojatura, antecipação, escapada", partitura: `tom: G maior\nsoprano: D5/1 C5 B4 C5/0.5 D5 E5/0.5 F#5 E5/1 D5 F#5 A5 G5 E5 F#5/0.5 G5 G5/2 A5/1 B5 G5/4\n${B_SOL}`, rotulos: ["soprano", "baixo"], cifras: CIF_SOL,
            anotacoes: [[0, 1, "P"], [0, 3, "P"], [0, 6, "B"], [0, 10, "Apoj."], [0, 13, "P"], [0, 14, "Ant."], [0, 17, "Esc."]],
            notas: [["decisao", "C. 3: lá5 chega por salto, cai com o baixo e resolve por grau: apojatura, o acento da frase."],
              ["decisao", "C. 3, 4º tempo: sol5 uma colcheia antes do 6/4: antecipação."],
              ["decisao", "C. 4: lá5 → si5 → sol5: escapada; o ponto mais agudo num tempo fraco."]],
            pausa: ["E com passagem acentuada (sol–fá♯–mi) no lugar da apojatura?", "Chega por grau e segue: fluxo. A apojatura chega por salto e volta: ênfase. Ambas corretas; muda o caráter."] },
        ] },
      { tipo: "contraste", titulo: "As mesmas notas, fracas ou fortes",
        a: { rotulo: "A — ornamentos nos tempos fracos (bordadura, antecipação, passagem)", partitura: "tom: A menor\nsoprano: C5/1 B4 C5 D5 D5 C5 B4/2 A4/4\nbaixo: A2/2 F3 D3 E3 A2/4", cifras: CIF_LAM },
        b: { rotulo: "B — ornamentos nos tempos fortes (bordadura acentuada, apojatura, passagem acentuada)", partitura: "tom: A menor\nsoprano: C5/2 D5/1 C5 E5 D5 C5 B4 A4/4\nbaixo: A2/2 F3 D3 E3 A2/4", cifras: CIF_LAM },
        pergunta: "Quase as mesmas notas. Onde cada uma põe o peso, e qual soa mais 'falada'?",
        comentario: "<p>A: notas estranhas entre os tempos; tempo forte consonante, a linha flui. B: caem com o baixo (bordadura acentuada, apojatura, passagem acentuada): o 'suspiro' a cada compasso. Em todos os tempos, a ênfase deixa de enfatizar.</p>" },
      { tipo: "quebra", titulo: "Quando a apojatura toma o lugar do acorde", html: `
        <table class="tabela-modos"><thead><tr><th>Quem</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>C. P. E. Bach (1753)</td><td>apojatura longa, metade da nota, tocada <i>forte</i></td><td>o ornamento ganha peso</td></tr>
        <tr><td>Mozart, 'Lacrimosa'; Sinf. nº 40</td><td>apojaturas e semitom mi♭–ré como tema</td><td>o suspiro vira motivo</td></tr>
        <tr><td>Chopin, op. 28 nº 4</td><td>si–dó quase parados sob acordes que descem</td><td>a nota muda de função a cada compasso</td></tr>
        <tr><td>Wagner, Tristão (1859)</td><td>sol♯–lá mais longa que a resolução; apojaturas encadeadas</td><td>nota real ou ornamento? ambíguo</td></tr>
        <tr><td>Schoenberg (1911); Debussy, Ravel</td><td>apojatura sem resolução vira nota acrescentada (6ª, 9ª)</td><td>a dissonância passa a ser harmonia</td></tr>
        </tbody></table>
        <p>Para soar intencional, o contexto em volta precisa ser estrito: a apojatura livre é ouvida como gesto, não como erro.</p>`,
        exemplos: [
          { rotulo: "Redução a duas vozes, à maneira do início de Tristão (não é a partitura de Wagner: só o soprano e o baixo, em 4/4)", partitura: "tom: A menor\nsoprano: G#4/3 A4/1 A#4/2 B4/2\nbaixo: F2/4 E2/4", cifras: [[0, "Fr43"], [4, "V7"]],
            perfil: { ...ORN, intervalo_melodico_aumentado_diminuto: "info" },
            comentario: "Sol♯ resolve por grau no lá; lá♯ é passagem cromática ao si do V7. Quebra a proporção: três tempos de apojatura, um de resolução. Lá–lá♯ fica como informação." },
          { rotulo: "A apojatura que não resolve vira cor (final com 9ª acrescentada)", partitura: "tom: C maior\nsoprano: G5/1 F5 E5/2 A5/1 G5 F5/2 E5/1 C5 D5/2\nbaixo: C3/4 F2/2 G2 C3/4", cifras: [[0, "I"], [4, "IV"], [6, "V7"], [8, "I"]],
            perfil: { ...ORN }, contexto: { ornLicencas: ["apojatura_livre"] },
            comentario: "Tudo estrito até o c. 3; então o ré5 cai sobre dó e fica sem resolver: a 9ª acrescentada. Aceito com a licença 'apojatura livre'." },
        ] },
    ],
    exercicios: [
      { id: "orn1", titulo: "Completar: apojatura e antecipação na cadência", modo: "completar", perfil: PERFIL_ORN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifras: "I V6 I vi ii6 I64 V7 I".split(" "),
        instrucoes: "<p>Soprano dos c. 3–4: <b>apojatura</b> sobre o 6/4 (3º tempo do c. 3) e <b>antecipação</b> da tônica no fim.</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano: A4/1 Bb4 C5 G4 A4 C5 F5 E5\nbaixo: F2/2 E2 F2 D3 Bb2 C3/1 C3 F2/4", duracao: 1, alvoCompassos: 4, plano: PLANO_ORN,
        solucao: "tom: F maior\ncf: baixo\nsoprano: A4/1 Bb4 C5 G4 A4 C5 F5 E5 D5 Bb4 D5/0.5 C5 E5 F5 F5/4\nbaixo: F2/2 E2 F2 D3 Bb2 C3/1 C3 F2/4",
        comentarioSolucao: "Ré5 chega por salto sobre o 6/4 e resolve no dó5: apojatura. No 4º tempo, mi5 – fá5 em colcheia: a tônica chega antes do baixo (antecipação)." },
      { id: "orn2", titulo: "Passagem, bordadura e apojatura em ré menor", modo: "menos apoio", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, ornMinimos: { passagem: 1, bordadura: 1, apojatura: 1 } }, cifras: "i V6 i iv6 ii°6 V i".split(" "),
        instrucoes: "<p>Soprano com ao menos uma <b>passagem</b>, uma <b>bordadura</b> e uma <b>apojatura</b>. Evite si♭–dó♯; dó♮ só em passagem descendente.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/2 C#3 D3 Bb2 G2 A2 D3/4", duracao: 1, alvoCompassos: 4, plano: PLANO_ORN,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 G5/0.5 F5 E5/2 D5/1 C5 Bb4/2 D5/1 E5 C#5/2 D5/4\nbaixo: D3/2 C#3 D3 Bb2 G2 A2 D3/4",
        comentarioSolucao: "Sol5: bordadura. Dó5♮: passagem descendente. C. 3: ré5 por salto sobre o ii°6, resolve subindo no mi5: apojatura ascendente." },
      { id: "orn3", titulo: "Apojatura, escapada e antecipação", modo: "restrição", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, ornMinimos: { apojatura: 1, escapada: 1, antecipacao: 1 } }, cifras: "i VI iv V i6 iv V i".split(" "),
        instrucoes: "<p>Soprano com ao menos uma <b>apojatura</b> (tempo forte), uma <b>escapada</b> e uma <b>antecipação</b> (gestos de cadência).</p>",
        texto: "tom: E menor\ncf: baixo\nsoprano:\nbaixo: E3/2 C3 A2 B2 G2 A2 B2 E3", duracao: 1, alvoCompassos: 4, plano: PLANO_ORN,
        solucao: "tom: E menor\ncf: baixo\nsoprano: G5/1 A5 E5/2 G5/1 A5 F#5/2 G5/1 E5 C5/2 B4/1 D#5/0.5 E5 E5/2\nbaixo: E3/2 C3 A2 B2 G2 A2 B2 E3",
        comentarioSolucao: "C. 1: sol–lá–mi: escapada. C. 2: sol5 por salto no tempo forte, resolve no lá5: apojatura. Mesmas notas, outro tempo, outro tipo. C. 4: antecipação." },
      { id: "orn4", titulo: "Livre: frase ornamentada com o seu baixo", modo: "livre", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, ornMinimos: { apojatura: 1, passagem: 1 } }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Soprano, baixo e cifras, 4 c., CAP. Esqueleto primeiro; depois ao menos uma <b>passagem</b> e uma <b>apojatura</b>.</p>",
        texto: "tom: C maior\nsoprano:\nbaixo:", duracao: 1, plano: PLANO_ORN,
        solucao: "tom: C maior\nsoprano: E5/1 F5/0.5 E5 D5/2 C5/0.5 D5 E5/1 G5 F5 A5 F5 D5 B4 C5/4\nbaixo: C3/2 B2 C3 F3 D3 G3 C3/4", solucaoCifras: "I V6 I IV ii V I",
        comentarioSolucao: "Bordadura e passagem nos tempos fracos; c. 2: sol5 por salto sobre o IV, resolve no fá5 (apojatura). Baixo sol3 → dó3 evita 8ª direta." },
      { id: "orn5", titulo: "Quebrar: o suspiro que não resolve", modo: "quebrar", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, ornLicencas: ["apojatura_livre"], ornMinimos: { apojatura_livre: 1 } }, cifras: "i V6 i VI iv V i".split(" "),
        instrucoes: "<p>Soprano. <b>C. 3, 1º tempo (iv):</b> apojatura que chega e sai por salto, nota mais aguda, sem resolver. O resto, estrito.</p>",
        texto: "tom: C menor\ncf: baixo\nsoprano:\nbaixo: C3/2 B2 C3 Ab2 F2 G2 C3/4", duracao: 1, alvoCompassos: 4, plano: PLANO_ORN,
        solucao: "tom: C menor\ncf: baixo\nsoprano: Eb5/2 D5 C5/1 D5 Eb5/2 Bb5/1 F5 D5/2 C5/4\nbaixo: C3/2 B2 C3 Ab2 F2 G2 C3/4",
        comentarioSolucao: "Si♭5 por salto, 4ª contra o fá do iv; em vez do lá♭5, salta ao fá5. O ouvido supre o lá♭: suspiro interrompido. O resto é estrito." },
    ],
  }, { depoisDe: "baixo" });

  // ================================================================== capítulo 2: retardos na harmonia
  const B_RE = "baixo: D3/2 A2 D3 F3 E3 D3 G3 A2 D3/4";
  const CIF_RE = [[0, "i"], [2, "V"], [4, "i"], [6, "i6"], [8, "vii°6"], [10, "i"], [12, "iv"], [14, "V"], [16, "i"]];
  const SOL_76 = "soprano: E5/1 C5/2 B4/2 A4/2 G4/2 C5/3~ C5/2 B4/2 C5/4\nbaixo: E3/2 D3 C3 B2 C3 A2 G2/4 C3/4";

  T.inserir(2, {
    id: "retardos_harm", titulo: "Retardos na harmonia",
    objetivo: "Escrever retardos 4–3, 7–6, 9–8 e 2–3 (baixo) sobre baixo cifrado, em cadeias e com resolução ornamentada.",
    ouvir: ["Corelli, Sonatas a três: cadeias de 7–6 e 2–3", "Bach, Ária BWV 1068: notas presas sobre a barra", "Monteverdi, 'Cruda Amarilli': o que Artusi criticou"],
    esboco: "Em dó maior, baixo fá3 → sol3 → dó3 (IV – V – I). Escreva um soprano que tenha uma dissonância no tempo forte do V sem atacá-la. Que nota você precisa ter no IV?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Preparação, retardo, resolução — agora com cifras", html: `
        <p>A 4ª espécie (Fux) com cifras: a cifra mostra o acorde de <b>resolução</b>.</p>
        <ol><li><b>Preparação:</b> tempo fraco, nota do acorde, não mais curta que a dissonância.</li>
        <li><b>Retardo:</b> tempo mais forte, mesma nota ligada; o baixo muda.</li>
        <li><b>Resolução:</b> grau abaixo, nota do acorde que soa então (o baixo pode mudar).</li></ol>
        <table class="tabela-modos"><thead><tr><th>Retardo</th><th>Onde aparece</th><th>Exemplo em dó maior</th><th>Cuidado</th></tr></thead><tbody>
        <tr><td><b>4–3</b></td><td>sobre o V (cadência), sobre qualquer 5/3</td><td>dó5 do IV preso sobre sol → si4</td><td>a 3ª de resolução não deve soar ao mesmo tempo em outra voz</td></tr>
        <tr><td><b>7–6</b></td><td>sobre acordes de sexta, baixo descendo por grau</td><td>dó5 (6ª sobre mi3) preso sobre ré3 → si4</td><td>em cadeia: o modelo de Corelli; a 6ª de resolução vira a preparação seguinte</td></tr>
        <tr><td><b>9–8</b></td><td>sobre 5/3 em estado fundamental</td><td>mi5 do V preso sobre ré3 (em ré menor) → ré5</td><td>resolve numa 8ª: em cadeia, as 8ªs ficam paralelas por baixo do atraso — evite encadear</td></tr>
        <tr><td><b>2–3</b> (baixo)</td><td>baixo preso, voz de cima ataca</td><td>baixo dó3 preso sob ré5 → si2 (V6)</td><td>a voz de cima ataca no tempo forte; quem resolve é o baixo</td></tr>
        </tbody></table>
        <h3>Cadeias e resoluções ornamentadas</h3>
        <ul><li><b>Cadeia:</b> baixo descendo com sextas; cada 6 prepara o próximo 7. Precisa de destino (cadência).</li>
        <li><b>Resolução ornamentada:</b> nota do acorde ou bordadura inferior antes; a resolução chega antes de o acorde mudar.</li>
        <li><b>Retardação:</b> resolve <b>subindo</b> (sensível sobre a tônica, 7–8). Só como licença.</li></ul>` },
      { tipo: "exemplo", titulo: "Atrasar o soprano: 9–8, 7–6 e 4–3 em ré menor",
        camadas: [
          { titulo: "1. A moldura sem retardos", partitura: `tom: D menor\nsoprano: F5/2 E5 D5 D5 C#5 D5 Bb4/1 D5 C#5/2 D5/4\n${B_RE}`, rotulos: ["soprano", "baixo"], cifras: CIF_RE,
            notas: [["decisao", "Soprano desce fá–mi–ré e gira em torno do ré5: pontos de apoio para prender."],
              ["checagem", "Sem paralelas; a 4ª do c. 4 é onde entra o 4–3."]] },
          { titulo: "2. Prender: três retardos", partitura: `tom: D menor\nsoprano: F5/2 E5/2~ E5/1 D5/3~ D5/1 C#5/1 D5/2 Bb4/1 D5/1~ D5/1 C#5/1 D5/4\n${B_RE}`, rotulos: ["soprano", "baixo"], cifras: CIF_RE,
            anotacoes: [[0, 1, "9–8"], [0, 2, "7–6"], [0, 6, "4–3"]],
            notas: [["decisao", "C. 1–2: mi5 do V preso sobre ré3: 9–8. C. 2–3: ré5 preso sobre mi3: 7–6 (a resolução prepara o próximo)."],
              ["decisao", "C. 4: ré5 no 2º tempo do iv, preso sobre o V: 4–3 de cadência."],
              ["rejeitada", "Preparar o 4–3 no 1º tempo: mais forte que o retardo, a dissonância soaria como sobra."]],
            pausa: ["Por que não encadear vários 9–8?", "Cada um resolve numa 8ª: seriam 8ªs paralelas só adiadas. Cadeias usam 7–6 e 2–3, que resolvem em consonâncias imperfeitas."] },
          { titulo: "3. Ornamentar: passagem e resolução ornamentada", partitura: `tom: D menor\nsoprano: F5/2 E5/2~ E5/1 D5/3~ D5/1 C#5/1 D5/1 C5/1 Bb4/1 D5/1~ D5/1 B4/0.5 C#5/0.5 D5/4\n${B_RE}`, rotulos: ["soprano", "baixo"], cifras: CIF_RE,
            anotacoes: [[0, 1, "9–8"], [0, 2, "7–6"], [0, 5, "P"], [0, 7, "4–3"], [0, 8, "B. inc."]],
            notas: [["decisao", "C. 3: dó5♮ como passagem descendente sobre o i."],
              ["decisao", "C. 4: ré5 desce ao si4♮ e sobe ao dó♯5: resolução ornamentada, dentro do V."],
              ["rejeitada", "Lá4 como intermediária: dois saltos, e o dó♯ chegaria por salto, não por grau."]] },
        ] },
      { tipo: "contraste", titulo: "Cadeia de 7–6 em cima × cadeia de 2–3 embaixo",
        a: { rotulo: "A — o soprano preso: 7–6, 7–6, 7–6 e o 4–3 da cadência", partitura: `tom: C maior\n${SOL_76}`, cifras: [[0, "I6"], [2, "vii°6"], [4, "vi6"], [6, "V6"], [8, "I"], [10, "IV6"], [12, "V"], [16, "I"]] },
        b: { rotulo: "B — o baixo preso: 2–3, 2–3, 2–3", partitura: "tom: C maior\nsoprano: E5/4 D5 C5 B4 C5\nbaixo: C3/2 C3/2~ C3/2 B2/2~ B2/2 A2/2~ A2/2 G2/2 C3/4", cifras: [[0, "I"], [2, "I"], [6, "V6"], [10, "vi"], [14, "V"], [16, "I"]] },
        pergunta: "Uma dissonância presa por compasso nas duas. Em qual a tensão está no agudo, e o que muda?",
        comentario: "<p>A: o soprano síncopado é a cadeia de suspiros; o baixo é só o chão. B: a melodia é estável e quem atrasa é o baixo: tensão de baixo, mais pesada, um chão que cede. Corelli e Handel alternam as duas.</p>" },
      { tipo: "quebra", titulo: "Retardos que sobem, que não resolvem, que não foram preparados", html: `
        <table class="tabela-modos"><thead><tr><th>Quem</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Monteverdi, 'Cruda Amarilli' (criticado por Artusi, 1600)</td><td>dissonância sem preparação</td><td><i>seconda pratica</i>: o texto governa a harmonia</td></tr>
        <tr><td>Corelli, Handel, Bach (BWV 1068)</td><td>cadeias; resolução com troca de baixo, ornamentada</td><td>o retardo vira motor</td></tr>
        <tr><td>Barroco, cadências</td><td>retardação: a sensível presa sobe</td><td>fórmula de cadência</td></tr>
        <tr><td>Século XIX</td><td>resolução adiada, em outra voz ou sobre outro acorde; sem preparação</td><td>retardo e apojatura se confundem</td></tr>
        </tbody></table>
        <p>A tensão deixa de ter prazo: o retardo romântico pode adiar, deslocar ou negar a resolução que a regra promete.</p>`,
        exemplos: [
          { rotulo: "Retardação: a sensível presa sobre a tônica sobe (7–8)", partitura: "tom: G maior\nsoprano: E5/2 F#5/2~ F#5/2 G5/2\nbaixo: C3/2 D3 G2/4", cifras: [[0, "IV"], [2, "V"], [4, "I"]],
            perfil: { ...ORN }, contexto: { ornLicencas: ["retardacao"] },
            comentario: "Fá♯5 preso sobre o sol2 (7ª M) sobe ao sol5: a tônica chega meio compasso depois do baixo. Aceito só com a licença." },
          { rotulo: "Retardo sem resolução: a 4ª presa salta e deixa a resolução para a voz interna", partitura: "tom: D menor\nsoprano: F5/1 D5/2 A5/1 F5/4\nbaixo: Bb2/2 A2/2 D3/4", cifras: [[0, "VI"], [2, "V"], [4, "i"]],
            perfil: { ...ORN }, contexto: { ornLicencas: ["retardo_sem_resolucao"] },
            comentario: "Ré5 preso sobre lá2 (4ª) salta ao lá5 em vez de descer ao dó♯5; a resolução fica subentendida numa voz interna." },
        ] },
    ],
    exercicios: [
      { id: "rh1", titulo: "Completar: a cadeia de 7–6 e o 4–3", modo: "completar", perfil: PERFIL_ORN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 } }, cifras: "I6 vii°6 vi6 V6 I IV6 V I".split(" "),
        instrucoes: "<p>O primeiro 7–6 está escrito. <b>Continue a cadeia</b> (cada resolução presa sobre o baixo seguinte) até o I do c. 3 e faça um <b>4–3</b> sobre o V do c. 4.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/1 C5/2 B4/2\nbaixo: E3/2 D3 C3 B2 C3 A2 G2/4 C3/4", duracao: 2, alvoCompassos: 5, plano: PLANO_RET,
        solucao: `tom: C maior\ncf: baixo\n${SOL_76}`,
        comentarioSolucao: "Si4 → lá4, lá4 → sol4 (7–6); sol4 sobre dó3 é 5ª: a cadeia para. Dó5 atravessa o IV6 e fica preso sobre o V: 4–3." },
      { id: "rh2", titulo: "Três retardos em lá menor", modo: "menos apoio", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 }, ornMinimos: { retardo: 3 } }, cifras: "i V i i6 vii°6 i iv V i".split(" "),
        instrucoes: "<p>Soprano com ao menos <b>três retardos</b> (9–8 após o V, 7–6 sobre sexta, 4–3 na cadência). Preparação sempre em tempo mais fraco.</p>",
        texto: "tom: A menor\ncf: baixo\nsoprano:\nbaixo: A2/2 E2 A2 C3 B2 A2 D3 E3 A3/4", duracao: 2, alvoCompassos: 5, plano: PLANO_RET,
        solucao: "tom: A menor\ncf: baixo\nsoprano: C5/2 B4/2~ B4/1 A4/3~ A4/1 G#4/1 A4/2 F4/1 A4/1~ A4/1 G#4/1 A4/4\nbaixo: A2/2 E2 A2 C3 B2 A2 D3 E3 A3/4",
        comentarioSolucao: "9–8 (si4 sobre lá2), 7–6 (lá4 sobre si2), 4–3 (lá4 sobre mi3): o plano do exemplo em ré menor." },
      { id: "rh3", titulo: "O baixo preso: cadeia de 2–3", modo: "restrição", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 }, ornMinimos: { retardo_baixo: 2 } }, cifrasAluno: true,
        instrucoes: "<p>Baixo e cifras com ao menos dois <b>2–3 no baixo</b>: entra no 3º tempo, fica ligado enquanto o soprano ataca, desce à 3ª. Fim V–I.</p>",
        texto: "tom: G maior\ncf: soprano\nsoprano: B4/4 A4 G4 F#4 G4\nbaixo:", duracao: 2, alvoCompassos: 5, plano: PLANO_RET,
        solucao: "tom: G maior\ncf: soprano\nsoprano: B4/4 A4 G4 F#4 G4\nbaixo: G2/2 G2/2~ G2/2 F#2/2~ F#2/2 E2/2~ E2/2 D2/2 G2/4", solucaoCifras: "I I V6 vi V I",
        comentarioSolucao: "Três 2–3: sol2 → fá♯2, fá♯2 → mi2, mi2 → ré2. O sol2 é repetido para entrar no tempo fraco: só assim pode ficar preso." },
      { id: "rh4", titulo: "Livre: retardos sobre o seu baixo", modo: "livre", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 }, ornMinimos: { retardo: 3 } }, cifrasAluno: true, alvoCompassos: 5,
        instrucoes: "<p>Soprano, baixo e cifras, 5 c., CAP, com <b>três retardos</b> de tipos diferentes no soprano. Planeje as preparações primeiro.</p>",
        texto: "tom: G maior\nsoprano:\nbaixo:", duracao: 2, plano: PLANO_RET,
        solucao: "tom: G maior\nsoprano: G4/1 B4/1 D5/2~ D5/1 C5/1 A4/2~ A4/1 G4/1 C5/2~ C5/1 B4/1 A4/2 G4/4\nbaixo: G2/2 B2 C3 D3 E3 C3 D3 D3 G2/4", solucaoCifras: "I I6 IV V vi ii6 I64 V I",
        comentarioSolucao: "9–8 sobre o IV, 4–3 sobre o vi, 7–6 sobre o 6/4 cadencial (mais um atraso). Cada nota entra no 3º tempo e é presa no 1º." },
      { id: "rh5", titulo: "Quebrar: a sensível que sobe", modo: "quebrar", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 3 }, ornLicencas: ["retardacao"], ornMinimos: { retardacao: 1 } }, cifras: "i VI iv V i".split(" "),
        instrucoes: "<p>No último compasso, ré♯5 <b>preso sobre a tônica</b> resolve <b>subindo</b> ao mi5 (retardação). Antes, tudo estrito.</p>",
        texto: "tom: E menor\ncf: baixo\nsoprano:\nbaixo: E3/2 C3 A2 B2 E3/4", duracao: 2, alvoCompassos: 3, plano: PLANO_RET,
        solucao: "tom: E menor\ncf: baixo\nsoprano: G4/1 B4/1 C5/2 E5/2 D#5/2~ D#5/2 E5/2\nbaixo: E3/2 C3 A2 B2 E3/4",
        comentarioSolucao: "Ré♯5 entra no V, fica preso sobre mi3 e sobe meio tom: o atraso de um 4–3, na direção natural da sensível." },
    ],
  }, { depoisDe: "ornamentos" });
})(this);
