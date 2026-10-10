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
    antes: [
      { p: "Uma nota fora do acorde chega por salto, cai no tempo forte e resolve por grau numa nota do acorde. Como se chama?", o: ["Apojatura", "Nota de passagem acentuada", "Escapada", "Antecipação"], e: "Salto (ou nenhuma preparação) + tempo forte + resolução por grau = apojatura. A passagem acentuada também cai no forte, mas chega por grau e continua na mesma direção; a escapada chega por grau e sai por salto; a antecipação repete a nota do acorde seguinte." },
      { p: "Qual destas notas fora do acorde chega por grau e sai por salto, na direção contrária?", o: ["A escapada (échappée)", "A bordadura", "A apojatura", "O retardo"], e: "A escapada é o espelho da apojatura: grau para entrar, salto (normalmente de 3ª) para sair, e sempre num tempo fraco. Na cadência, a fórmula 2–3–1 no soprano (lá–si–sol em sol maior) é a mais comum." },
      { p: "Na antecipação, a nota fora do acorde…", o: ["é a nota do acorde seguinte, tocada um pouco antes e repetida (ou ligada) quando o acorde chega", "é a nota do acorde anterior, presa no tempo forte", "salta para fora do acorde e volta por grau", "é sempre a sensível"], e: "Antecipar é chegar antes da harmonia: a nota já pertence ao acorde que vem. O retardo é o contrário (a nota do acorde anterior fica presa). Na cadência barroca, antecipar a tônica no soprano é quase uma fórmula." },
    ],
    objetivo: "Ornamentar uma melodia sobre um baixo cifrado com cada tipo de nota fora do acorde — passagem, bordadura, apojatura, escapada, antecipação — sabendo de onde ela vem, para onde vai e em que tempo cai, e escolher o tipo pelo caráter que ele dá à linha.",
    ouvir: ["Mozart, Requiem K. 626, 'Lacrimosa': os violinos em suspiros (apojaturas descendentes ligadas duas a duas)", "Mozart, Sinfonia nº 40 em sol menor K. 550, 1º mov.: o motivo de semitom descendente (mi♭–ré) que abre o tema", "Chopin, Prelúdio em mi menor op. 28 nº 4: a melodia que oscila entre si e dó sobre acordes que mudam por baixo", "Wagner, Tristão e Isolda, Prelúdio: a apojatura cromática sol♯–lá sobre o 'acorde de Tristão'", "Corais de Bach: notas de passagem e bordaduras em todas as vozes; antecipações nas cadências"],
    esboco: "Sobre I – IV – V – I em sol maior (uma mínima por acorde), escreva primeiro uma nota do acorde por mínima. Depois, sem consultar nada, acrescente uma nota fora do acorde em cada compasso e tente dizer o nome de cada uma.",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Dissonância acidental: de onde vem, para onde vai", html: `
        <p>A harmonia escolar separa dois tipos de dissonância. A <b>essencial</b> pertence ao acorde (a 7ª do V7, do ii65): ela está na cifra e resolve descendo. A <b>acidental</b> é a nota que está fora do acorde e se explica só pela condução da voz: ela vem de uma nota do acorde e vai para outra por um caminho conhecido. A distinção aparece com nitidez em Kirnberger (<i>Die Kunst des reinen Satzes</i>, 1771–79), mas os caminhos são mais antigos: a <b>nota de passagem</b> é a dissonância da 2ª espécie de Fux (1725); a <b>bordadura</b> e a cambiata, da 3ª; a <b>ligadura</b> (retardo), da 4ª. A <b>apojatura</b> vem da prática do século XVIII: C. P. E. Bach (<i>Versuch</i>, 1753) dedica aos <i>Vorschläge</i> um capítulo inteiro — a apojatura longa toma metade do valor da nota principal (dois terços, se ela é pontuada) e é tocada mais forte que a resolução, que se apaga.</p>
        <p>Os manuais do século XIX (Richter, Dubois) e os modernos (Piston, Aldwell &amp; Schachter, Kostka &amp; Payne) organizam tudo por três perguntas: <b>como a nota chega</b>, <b>como sai</b> e <b>em que tempo cai</b>.</p>
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
        <ul><li>No coral a quatro vozes todas as vozes ornamentam; aqui, a duas vozes, os ornamentos ficam no <b>soprano</b> e o baixo traz as cifras (uma por nota): cada nota do baixo é membro do acorde. O pedal fica de fora da escrita cifrada: num baixo cifrado ele é uma nota longa sob várias cifras (no exemplo mais simples, I – IV64 – I sobre a tônica repetida).</li>
        <li><b>Passagem e bordadura</b> dão fluência: são a superfície de uma linha que se move por grau. <b>Apojatura e passagem acentuada</b> põem a dissonância no tempo forte e por isso falam: são o "suspiro". <b>Escapada e antecipação</b> são gestos de cadência: deixam a linha chegar antes ou depois do baixo.</li>
        <li>Procedimento: (1) esqueleto — uma nota do acorde por cifra, conferida como 1ª espécie contra o baixo; (2) ornamentos fracos para ligar; (3) poucos ornamentos fortes, onde você quer acento; (4) confira de novo as 5ªs e 8ªs: <b>a nota fora do acorde também forma intervalo com o baixo</b>, e uma passagem pode criar paralelas.</li></ul>
        <p>Nos exercícios, a regra <b>Notas fora do acorde com tratamento</b> classifica cada nota da melodia que não pertence à cifra e recusa as que não se explicam; a <b>Classificação</b> mostra, como informação, o nome que o verificador deu a cada uma.</p>` },
      { tipo: "exemplo", titulo: "Ornamentar um esqueleto em sol maior", intro: "O baixo e as cifras são os mesmos nas três camadas; só o soprano muda. As cifras mostram o acorde, não as notas de passagem.",
        camadas: [
          { titulo: "1. Esqueleto: uma nota do acorde por cifra", partitura: `tom: G maior\nsoprano: D5/2 B4 E5 D5 G5 E5 G5 A5 G5/4\n${B_SOL}`, rotulos: ["soprano", "baixo"], cifras: CIF_SOL,
            notas: [["decisao", "Contra o baixo: 5 – 8 – 10 – 8 | 10 – 13 – 11 – 12 – 15. As consonâncias perfeitas (c. 1 e 2) chegam por movimento contrário; a 4ª do c. 4 é a do 6/4 cadencial, que é cifra, não ornamento."],
              ["decisao", "Contorno: desce ao si4, sobe por saltos de acorde até sol5–mi5–sol5 e para no lá5 do V. O ponto mais alto ainda vai ser decidido pelos ornamentos."],
              ["checagem", "Nenhuma nota fora do acorde: a linha é correta e morta. É o ponto de partida, não o resultado."]] },
          { titulo: "2. Ornamentos fracos: passagem e bordadura", partitura: `tom: G maior\nsoprano: D5/1 C5 B4 C5/0.5 D5 E5/0.5 F#5 E5/1 D5 F#5 G5/2 E5/1 F#5 G5/2 A5 G5/4\n${B_SOL}`, rotulos: ["soprano", "baixo"], cifras: CIF_SOL,
            anotacoes: [[0, 1, "P"], [0, 3, "P"], [0, 6, "B"], [0, 12, "P"]],
            notas: [["decisao", "C. 1: o ré5–si4 do esqueleto é uma 3ª — o dó5 no 2º tempo a preenche (passagem descendente). No 4º tempo, outra passagem (si–dó–ré) leva ao mi5 do IV."],
              ["decisao", "C. 2: o mi5 é repetido no esqueleto; em vez de repetir, uma bordadura superior em colcheia (mi–fá♯–mi). O fá♯ é a sensível do tom contra o dó do baixo: dissonância de passagem rápida, sem peso."],
              ["rejeitada", "Pensei em preencher o salto ré5–fá♯5 do c. 2 com mi5: viraria três notas por grau (ré–mi–fá♯) e o mi5 cairia como passagem — mas o mi5 acabou de ser ouvido duas vezes. O salto de 3ª, nota de acorde, é mais limpo."],
              ["checagem", "C. 3: mi5–fá♯5–sol5 sobre o ii6 — fá♯ é passagem no tempo fraco. Todas as notas novas estão em tempo fraco e entram e saem por grau: é o estilo estrito de Fux, transplantado para a harmonia."]],
            pausa: ["Por que nenhuma nota fora do acorde no 1º ou no 3º tempo, nesta camada?", "Porque nesta camada os ornamentos só ligam: ficam nos tempos fracos, onde o ouvido os toma como movimento. No tempo forte uma nota estranha ao acorde vira acontecimento — apojatura ou passagem acentuada — e isso é a próxima decisão, tomada em poucos lugares."] },
          { titulo: "3. Ornamentos fortes e de cadência: apojatura, antecipação, escapada", partitura: `tom: G maior\nsoprano: D5/1 C5 B4 C5/0.5 D5 E5/0.5 F#5 E5/1 D5 F#5 A5 G5 E5 F#5/0.5 G5 G5/2 A5/1 B5 G5/4\n${B_SOL}`, rotulos: ["soprano", "baixo"], cifras: CIF_SOL,
            anotacoes: [[0, 1, "P"], [0, 3, "P"], [0, 6, "B"], [0, 10, "Apoj."], [0, 13, "P"], [0, 14, "Ant."], [0, 17, "Esc."]],
            notas: [["decisao", "C. 3, 1º tempo: o sol5 do esqueleto vira lá5 → sol5. O lá5 chega por salto (fá♯5–lá5), cai com o baixo mi3 (uma 4ª contra ele) e resolve por grau: apojatura. É o acento da frase, no compasso do ponto mais alto."],
              ["decisao", "C. 3, 4º tempo: depois da passagem fá♯5, o sol5 entra uma colcheia antes do 6/4 — antecipação. A chegada ao 6/4 cadencial fica suave, sem salto."],
              ["decisao", "C. 4: lá5 (V) → si5 → sol5 (I). O si5 sai por grau do lá5 e salta uma 3ª para baixo, na direção contrária: escapada. Ela dá à melodia o seu ponto mais agudo (si5) num tempo fraco, logo antes da tônica."],
              ["rejeitada", "Na cadência, pensei em lá5–fá♯5–sol5 (sensível resolvendo): mais estrito, mas a linha já tinha usado o fá♯5 três vezes. A escapada deixa a sensível para a voz interna (implícita) e põe um gesto novo no fim."],
              ["checagem", "O baixo sobe ré3–sol3 na cadência: com o soprano descendo si5–sol5 o movimento é contrário. Se o baixo descesse ao sol2, o salto do soprano faria uma 8ª direta."]],
            pausa: ["Troque mentalmente a apojatura do c. 3 por uma passagem acentuada (sol5–fá♯5–mi5 com o fá♯ no tempo forte). O que muda?", "A passagem acentuada também põe uma dissonância com o baixo, mas chega por grau e continua: soa como fluxo. A apojatura chega por salto e volta: é um gesto de ênfase, uma 'palavra' acentuada. A escolha não é de correção — as duas são corretas —, é de caráter."] },
        ] },
      { tipo: "contraste", titulo: "As mesmas notas, fracas ou fortes",
        a: { rotulo: "A — ornamentos nos tempos fracos (bordadura, antecipação, passagem)", partitura: "tom: A menor\nsoprano: C5/1 B4 C5 D5 D5 C5 B4/2 A4/4\nbaixo: A2/2 F3 D3 E3 A2/4", cifras: CIF_LAM },
        b: { rotulo: "B — ornamentos nos tempos fortes (bordadura acentuada, apojatura, passagem acentuada)", partitura: "tom: A menor\nsoprano: C5/2 D5/1 C5 E5 D5 C5 B4 A4/4\nbaixo: A2/2 F3 D3 E3 A2/4", cifras: CIF_LAM },
        pergunta: "As duas melodias usam quase as mesmas notas sobre i – VI – iv – V – i em lá menor. Onde cada uma põe o peso, e qual soa mais 'falada'?",
        comentario: "<p>Em A as notas estranhas ao acorde ficam entre os tempos: si4 (bordadura), ré5 no 4º tempo (antecipação do iv), dó5 sobre o iv (passagem). O tempo forte é sempre consonante, e a linha flui. Em B as mesmas classes de nota caem com o baixo: ré5 sobre o VI (bordadura acentuada), mi5 sobre o iv chegando por salto (apojatura, a 9ª contra o ré), dó5 sobre o V (passagem acentuada, 6ª menor contra o mi mas fora do acorde de mi maior). B acentua cada compasso com uma dissonância que resolve: é a retórica do 'suspiro'. O preço é a densidade: usada em todos os tempos, a ênfase deixa de enfatizar.</p>" },
      { tipo: "quebra", titulo: "Quando a apojatura toma o lugar do acorde", html: `
        <p>A regra pede que a nota estranha seja <b>subordinada</b>: curta ou fraca, explicada pela resolução. O século XVIII já a esticava — a apojatura longa de C. P. E. Bach dura metade da nota principal e é tocada <i>forte</i>. Mozart transforma o suspiro em tema: no 'Lacrimosa' do Requiem, os violinos tocam apojaturas descendentes ligadas duas a duas; na Sinfonia nº 40, o tema abre com o semitom mi♭–ré repetido, uma dissonância de vizinhança que dá o tom de toda a peça. No Prelúdio em mi menor op. 28 nº 4, Chopin deixa a melodia quase parada no si, com o dó vizinho, enquanto os acordes descem por baixo: a mesma nota muda de função a cada compasso.</p>
        <p>No Romantismo tardio a hierarquia se inverte. No início do Prelúdio de <i>Tristão e Isolda</i> (Wagner, 1859), o sol♯ do oboé cai sobre o 'acorde de Tristão' (fá–si–ré♯–sol♯) e sobe por semitom ao lá — uma apojatura ascendente, cromática e mais longa que a própria resolução; o lá segue cromaticamente (lá♯) até o si sobre o acorde de dominante de lá menor. A pergunta "qual é a nota real e qual é o ornamento?" deixa de ter resposta única, e é dessa ambiguidade que vive a harmonia cromática. Daí em diante, apojaturas cromáticas se encadeiam: cada resolução já é a próxima apojatura. Schoenberg (<i>Harmonielehre</i>, 1911) tira a conclusão teórica: as chamadas notas estranhas à harmonia não são estranhas a ela — são harmonia que ainda não foi reconhecida como tal. Em Debussy e Ravel, a apojatura que não resolve vira <b>nota acrescentada</b> (6ª, 9ª) e passa a pertencer ao acorde.</p>
        <p>O que a quebra produz: a dissonância deixa de ser um acidente do caminho e passa a ser o lugar onde a música mora. Para que isso soe intencional, o contexto precisa ser estrito em volta — uma apojatura livre num tecido de passagens corretas é ouvida como gesto, não como erro.</p>`,
        exemplos: [
          { rotulo: "Redução a duas vozes, à maneira do início de Tristão (não é a partitura de Wagner: só o soprano e o baixo, em 4/4)", partitura: "tom: A menor\nsoprano: G#4/3 A4/1 A#4/2 B4/2\nbaixo: F2/4 E2/4", cifras: [[0, "Fr43"], [4, "V7"]],
            perfil: { ...ORN, intervalo_melodico_aumentado_diminuto: "info" },
            comentario: "Formalmente a regra se cumpre: sol♯ (apojatura, fora da sexta aumentada francesa fá–lá–si–ré♯) resolve por grau no lá; o lá♯ é passagem cromática acentuada até o si do V7. O que quebra é a proporção: a apojatura dura três tempos e a resolução um, e o ouvido toma o acorde com o sol♯ como a harmonia real. O cromatismo melódico (lá–lá♯), proibido no estilo estrito, fica como informação." },
          { rotulo: "A apojatura que não resolve vira cor (final com 9ª acrescentada)", partitura: "tom: C maior\nsoprano: G5/1 F5 E5/2 A5/1 G5 F5/2 E5/1 C5 D5/2\nbaixo: C3/4 F2/2 G2 C3/4", cifras: [[0, "I"], [4, "IV"], [6, "V7"], [8, "I"]],
            perfil: { ...ORN }, contexto: { ornLicencas: ["apojatura_livre"] },
            comentario: "Até o 1º tempo do c. 3 tudo é estrito (passagens, a 7ª do V7 descendo ao mi). No 3º tempo o ré5 cai sobre o acorde de dó e fica: não há resolução. A mesma nota que no c. 1 seria uma passagem agora é o som final — a 9ª acrescentada do fim do século XIX. Com a licença 'apojatura livre' ativa, o verificador aceita." },
        ] },
    ],
    exercicios: [
      { id: "orn1", titulo: "Completar: apojatura e antecipação na cadência", modo: "completar", perfil: PERFIL_ORN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifras: "I V6 I vi ii6 I64 V7 I".split(" "),
        instrucoes: "<p>Fá maior. O baixo, as cifras e o soprano dos compassos 1–2 (com duas passagens) estão dados. Escreva os compassos 3–4: ponha uma <b>apojatura</b> sobre o 6/4 cadencial (3º tempo do c. 3) e termine com uma <b>antecipação</b> da tônica. Toda nota fora do acorde precisa se explicar por um dos tipos da tabela.</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano: A4/1 Bb4 C5 G4 A4 C5 F5 E5\nbaixo: F2/2 E2 F2 D3 Bb2 C3/1 C3 F2/4", duracao: 1, alvoCompassos: 4, plano: PLANO_ORN,
        solucao: "tom: F maior\ncf: baixo\nsoprano: A4/1 Bb4 C5 G4 A4 C5 F5 E5 D5 Bb4 D5/0.5 C5 E5 F5 F5/4\nbaixo: F2/2 E2 F2 D3 Bb2 C3/1 C3 F2/4",
        comentarioSolucao: "Ré5 chega por salto (si♭4–ré5) sobre o 6/4 e resolve no dó5: apojatura (a 6ª contra o baixo dó3 vira, na resolução, a 5ª — o 6/4 cadencial ornamentado). No 4º tempo, mi5 (sensível, nota do V7) e fá5 em colcheia: a tônica chega antes do baixo — antecipação. O mi5 do c. 2 é passagem (fá–mi–ré) entre o vi e o ii6." },
      { id: "orn2", titulo: "Passagem, bordadura e apojatura em ré menor", modo: "menos apoio", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, ornMinimos: { passagem: 1, bordadura: 1, apojatura: 1 } }, cifras: "i V6 i iv6 ii°6 V i".split(" "),
        instrucoes: "<p>Ré menor, baixo e cifras dados. Escreva o soprano inteiro com pelo menos uma <b>nota de passagem</b>, uma <b>bordadura</b> e uma <b>apojatura</b> (no tempo forte, chegando por salto). Em menor, cuidado com a 2ª aumentada si♭–dó♯ e com o dó natural/dó♯: o V usa a sensível, a passagem descendente pode usar o dó natural.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/2 C#3 D3 Bb2 G2 A2 D3/4", duracao: 1, alvoCompassos: 4, plano: PLANO_ORN,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 G5/0.5 F5 E5/2 D5/1 C5 Bb4/2 D5/1 E5 C#5/2 D5/4\nbaixo: D3/2 C#3 D3 Bb2 G2 A2 D3/4",
        comentarioSolucao: "Sol5 em colcheia é bordadura superior do fá5; dó5 natural é passagem descendente (ré–dó–si♭) — subindo, seria dó♯. No c. 3, ré5 chega por salto do si♭4 e cai com o sol2 do ii°6: apojatura que resolve subindo no mi5. A apojatura ascendente é menos comum que a descendente, mas é a mesma figura." },
      { id: "orn3", titulo: "Apojatura, escapada e antecipação", modo: "restrição", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, ornMinimos: { apojatura: 1, escapada: 1, antecipacao: 1 } }, cifras: "i VI iv V i6 iv V i".split(" "),
        instrucoes: "<p>Mi menor. <b>Restrição:</b> use pelo menos uma <b>apojatura</b>, uma <b>escapada</b> e uma <b>antecipação</b>, cada uma no lugar em que soa natural (pense: a escapada e a antecipação são gestos de cadência ou de fim de membro; a apojatura pede um tempo forte).</p>",
        texto: "tom: E menor\ncf: baixo\nsoprano:\nbaixo: E3/2 C3 A2 B2 G2 A2 B2 E3", duracao: 1, alvoCompassos: 4, plano: PLANO_ORN,
        solucao: "tom: E menor\ncf: baixo\nsoprano: G5/1 A5 E5/2 G5/1 A5 F#5/2 G5/1 E5 C5/2 B4/1 D#5/0.5 E5 E5/2\nbaixo: E3/2 C3 A2 B2 G2 A2 B2 E3",
        comentarioSolucao: "C. 1: lá5 sai do sol5 por grau e salta para o mi5 do VI — escapada. C. 2: o mesmo sol5 agora chega por salto (mi5–sol5) no tempo forte do iv e resolve subindo no lá5 — apojatura. As mesmas duas notas mudam de tipo porque mudam de lugar métrico. C. 4: o mi5 em colcheia antecipa a tônica." },
      { id: "orn4", titulo: "Livre: frase ornamentada com o seu baixo", modo: "livre", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, ornMinimos: { apojatura: 1, passagem: 1 } }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha soprano, baixo e cifras de uma frase de 4 compassos em dó maior, com cadência perfeita. Primeiro o esqueleto (uma nota do acorde por cifra); depois os ornamentos, com pelo menos uma <b>passagem</b> e uma <b>apojatura</b>. Use a classificação (informativa) para conferir se cada nota foi lida como você pensou.</p>",
        texto: "tom: C maior\nsoprano:\nbaixo:", duracao: 1, plano: PLANO_ORN,
        solucao: "tom: C maior\nsoprano: E5/1 F5/0.5 E5 D5/2 C5/0.5 D5 E5/1 G5 F5 A5 F5 D5 B4 C5/4\nbaixo: C3/2 B2 C3 F3 D3 G3 C3/4", solucaoCifras: "I V6 I IV ii V I",
        comentarioSolucao: "Bordadura (fá5) e passagem (ré5) nos tempos fracos; no 3º tempo do c. 2, sol5 salta do mi5 para cima do IV e resolve no fá5 — apojatura. Na cadência o baixo sobe ao sol3 e volta ao dó3, para o soprano (ré5–si4–dó5) não chegar em 5ª ou 8ª direta." },
      { id: "orn5", titulo: "Quebrar: o suspiro que não resolve", modo: "quebrar", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, ornLicencas: ["apojatura_livre"], ornMinimos: { apojatura_livre: 1 } }, cifras: "i V6 i VI iv V i".split(" "),
        instrucoes: "<p>Dó menor. Escreva o soprano. <b>Quebra pedida:</b> no 1º tempo do c. 3, sobre o iv, uma <b>apojatura que não resolve por grau</b>: ela chega por salto, é a nota mais aguda da frase e sai por salto para outra nota do acorde — a resolução fica subentendida (numa voz interna, ou na imaginação do ouvinte). Todo o resto deve ser estrito, para que a quebra se ouça como gesto.</p>",
        texto: "tom: C menor\ncf: baixo\nsoprano:\nbaixo: C3/2 B2 C3 Ab2 F2 G2 C3/4", duracao: 1, alvoCompassos: 4, plano: PLANO_ORN,
        solucao: "tom: C menor\ncf: baixo\nsoprano: Eb5/2 D5 C5/1 D5 Eb5/2 Bb5/1 F5 D5/2 C5/4\nbaixo: C3/2 B2 C3 Ab2 F2 G2 C3/4",
        comentarioSolucao: "Si♭5 salta uma 5ª do mi♭5, cai como 4ª contra o fá do iv e, em vez de descer ao lá♭5, salta uma 4ª para o fá5. O ouvido 'ouve' o lá♭ que faltou — o suspiro interrompido. Tudo em volta é estrito: passagem (ré5) no c. 2, 7ª nenhuma sem resolução, cadência V–i." },
    ],
  }, { depoisDe: "baixo" });

  // ================================================================== capítulo 2: retardos na harmonia
  const B_RE = "baixo: D3/2 A2 D3 F3 E3 D3 G3 A2 D3/4";
  const CIF_RE = [[0, "i"], [2, "V"], [4, "i"], [6, "i6"], [8, "vii°6"], [10, "i"], [12, "iv"], [14, "V"], [16, "i"]];
  const SOL_76 = "soprano: E5/1 C5/2 B4/2 A4/2 G4/2 C5/3~ C5/2 B4/2 C5/4\nbaixo: E3/2 D3 C3 B2 C3 A2 G2/4 C3/4";

  T.inserir(2, {
    id: "retardos_harm", titulo: "Retardos na harmonia",
    antes: [
      { p: "Soprano dó5 sobre o IV (fá3) em dó maior; o baixo vai ao sol2 e o dó5 fica preso. Que retardo é, e onde resolve?", o: ["4–3: dó5 (4ª sobre sol) desce ao si4", "7–6: dó5 desce ao si4", "9–8: dó5 desce ao si4", "2–3: o baixo desce"], e: "Dó sobre sol é uma 4ª (11ª composta): o retardo 4–3, a dominante com a 3ª atrasada. Resolve no si4, a sensível. É o retardo de cadência por excelência." },
      { p: "Num retardo 2–3, quem está preso?", o: ["O baixo: ele fica parado enquanto a voz de cima ataca uma 2ª (9ª), e depois desce à 3ª", "O soprano, sobre um baixo que sobe", "O soprano, que resolve subindo", "As duas vozes"], e: "O 2–3 é o retardo do baixo: a dissonância é a nota de baixo que ficou, e é ela que resolve descendo por grau. É o espelho do 7–6 de cima, e encadeado forma as cadeias de 2–3 de Corelli e Handel." },
      { p: "O que distingue um retardo de uma apojatura?", o: ["A preparação: a nota do retardo já soava (consonante) no acorde anterior e fica presa; a apojatura é atacada", "A resolução: o retardo resolve subindo", "O tempo: o retardo cai no tempo fraco", "Nada: são sinônimos"], e: "Os dois são dissonâncias no tempo forte que resolvem por grau. A diferença é como chegam: o retardo é preparado pela mesma nota, consonante, no tempo fraco anterior; a apojatura é atacada (normalmente por salto)." },
    ],
    objetivo: "Escrever retardos 4–3, 7–6, 9–8 (no soprano) e 2–3 (no baixo) sobre um baixo cifrado — preparação, dissonância, resolução —, encadeá-los em cadeias e ornamentar a resolução; e saber o que a retardação (resolução para cima) e o retardo sem preparação significam como licença.",
    ouvir: ["Corelli, Sonatas a três op. 1–4: cadeias de 7–6 e de 2–3 nos movimentos lentos (Grave, Adagio)", "Bach, Ária da Suíte orquestral nº 3 BWV 1068: notas longas do violino presas por cima da barra sobre o baixo que caminha", "Handel: os movimentos lentos das sonatas e concerti grossi op. 6, com retardos encadeados sobre baixos por grau", "Monteverdi, 'Cruda Amarilli' (5º livro de madrigais): as dissonâncias que Artusi criticou em 1600"],
    esboco: "Em dó maior, baixo fá3 → sol3 → dó3 (IV – V – I). Escreva um soprano que tenha uma dissonância no tempo forte do V sem atacá-la. Que nota você precisa ter no IV?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Preparação, retardo, resolução — agora com cifras", html: `
        <p>O retardo da 4ª espécie (Fux) entra intacto na harmonia: uma nota do acorde fica presa enquanto o baixo muda, vira dissonância no tempo forte e desce por grau para a nota que o acorde novo pede. No baixo cifrado barroco o retardo está na cifra (<b>4 3</b>, <b>7 6</b>, <b>9 8</b>, e no baixo <b>2 3</b>); os <i>partimenti</i> napolitanos (Fenaroli) os ensinam como fórmulas de cada movimento do baixo. Aqui a cifra mostra o acorde de <b>resolução</b> e o verificador reconhece a nota presa.</p>
        <ol><li><b>Preparação</b> — tempo fraco, nota do acorde (consonante). Pela regra tradicional, não mais curta que a dissonância.</li>
        <li><b>Retardo</b> — tempo forte (mais forte que a preparação), a mesma nota, ligada; o baixo mudou por baixo dela.</li>
        <li><b>Resolução</b> — um grau abaixo, numa nota do acorde. O baixo pode mudar no momento da resolução (resolução com troca de baixo): a nota de chegada só precisa pertencer ao acorde que soa então.</li></ol>
        <table class="tabela-modos"><thead><tr><th>Retardo</th><th>Onde aparece</th><th>Exemplo em dó maior</th><th>Cuidado</th></tr></thead><tbody>
        <tr><td><b>4–3</b></td><td>sobre o V (cadência), sobre qualquer 5/3</td><td>dó5 do IV preso sobre sol → si4</td><td>a 3ª de resolução não deve soar ao mesmo tempo em outra voz</td></tr>
        <tr><td><b>7–6</b></td><td>sobre acordes de sexta, baixo descendo por grau</td><td>dó5 (6ª sobre mi3) preso sobre ré3 → si4</td><td>em cadeia: o modelo de Corelli; a 6ª de resolução vira a preparação seguinte</td></tr>
        <tr><td><b>9–8</b></td><td>sobre 5/3 em estado fundamental</td><td>mi5 do V preso sobre ré3 (em ré menor) → ré5</td><td>resolve numa 8ª: em cadeia, as 8ªs ficam paralelas por baixo do atraso — evite encadear</td></tr>
        <tr><td><b>2–3</b> (baixo)</td><td>baixo preso, voz de cima ataca</td><td>baixo dó3 preso sob ré5 → si2 (V6)</td><td>a voz de cima ataca no tempo forte; quem resolve é o baixo</td></tr>
        </tbody></table>
        <h3>Cadeias e resoluções ornamentadas</h3>
        <ul><li><b>Cadeias</b>: sobre um baixo que desce por grau com acordes de sexta, cada resolução 6 prepara o próximo 7 — I6, vii°6, vi6, V6… A cadeia é uma escala descendente com tensão em cada passo; ela precisa de destino (uma cadência, um salto que a interrompa).</li>
        <li><b>Resolução ornamentada</b>: entre o retardo e a resolução pode entrar uma nota do acorde (salto e volta) ou a bordadura inferior da nota de chegada, ou a resolução pode ser antecipada em valor curto. A regra é que a nota um grau abaixo chegue antes de o acorde mudar.</li>
        <li><b>Retardação</b> (Kostka &amp; Payne: <i>retardation</i>): a nota presa resolve <b>subindo</b>, quase sempre a sensível presa sobre a tônica (7–8). Fux não a admite — na 4ª espécie a resolução desce —, e os manuais a tratam como caso à parte. Aqui ela só vale como licença.</li></ul>
        <p>A duas vozes, as vozes internas ficam implícitas como no baixo cifrado. A regra <b>Notas fora do acorde com tratamento</b> confere preparação, tempo forte e resolução; a <b>Classificação</b> diz que retardo o verificador leu (4–3, 7–6…).</p>` },
      { tipo: "exemplo", titulo: "Atrasar o soprano: 9–8, 7–6 e 4–3 em ré menor",
        camadas: [
          { titulo: "1. A moldura sem retardos", partitura: `tom: D menor\nsoprano: F5/2 E5 D5 D5 C#5 D5 Bb4/1 D5 C#5/2 D5/4\n${B_RE}`, rotulos: ["soprano", "baixo"], cifras: CIF_RE,
            notas: [["decisao", "Progressão i V | i i6 | vii°6 i | iv V | i. O soprano desce fá5–mi5–ré5 e depois gira em volta do ré5 com a sensível dó♯5: uma linha de canto, cheia de 'pontos de apoio' para prender."],
              ["checagem", "Contra o baixo: 10 – 12 – 8 – 6 | 6 – 8 | 10 – 4 – 3 – 8. Nenhuma paralela; a 4ª no c. 4 (ré5 sobre o lá2) é exatamente onde vai entrar o 4–3."]] },
          { titulo: "2. Prender: três retardos", partitura: `tom: D menor\nsoprano: F5/2 E5/2~ E5/1 D5/3~ D5/1 C#5/1 D5/2 Bb4/1 D5/1~ D5/1 C#5/1 D5/4\n${B_RE}`, rotulos: ["soprano", "baixo"], cifras: CIF_RE,
            anotacoes: [[0, 1, "9–8"], [0, 2, "7–6"], [0, 6, "4–3"]],
            notas: [["decisao", "C. 1–2: o mi5 do V (5ª sobre lá2, consonante, no 3º tempo) fica preso quando o baixo vai ao ré3: 9ª no tempo forte, que desce ao ré5 — retardo 9–8."],
              ["decisao", "C. 2–3: o ré5 de resolução passa pelo i6 (ainda nota do acorde) e fica preso sobre o mi3 do vii°6: 7ª, que desce ao dó♯5 (6ª) — retardo 7–6. Uma mesma nota é resolução de um retardo e preparação do seguinte."],
              ["decisao", "C. 4: ré5 no 2º tempo do iv (preparação curta, num tempo fraco), preso sobre o lá2 do V no 3º tempo: 4ª → dó♯5. É o 4–3 de cadência."],
              ["rejeitada", "Pensei em preparar o 4–3 com o ré5 no 1º tempo do c. 4 (mínima): a preparação cairia num tempo mais forte que o retardo, e a dissonância soaria como nota que sobrou, não como tensão. Por isso o si♭4 no 1º tempo e o ré5 no 2º."],
              ["checagem", "Todas as dissonâncias presas caem em tempo mais forte que a sua preparação e resolvem um grau abaixo, numa nota do acorde."]],
            pausa: ["Por que o 9–8 não seria uma boa escolha para encadear vários seguidos?", "Porque cada 9–8 resolve numa 8ª com o baixo. Numa cadeia, as resoluções formariam 8ªs paralelas apenas deslocadas pelo atraso — o retardo não esconde a paralela, só a adia. Por isso as cadeias clássicas são de 7–6 (em cima) e 2–3 (embaixo), que resolvem em consonâncias imperfeitas."] },
          { titulo: "3. Ornamentar: passagem e resolução ornamentada", partitura: `tom: D menor\nsoprano: F5/2 E5/2~ E5/1 D5/3~ D5/1 C#5/1 D5/1 C5/1 Bb4/1 D5/1~ D5/1 B4/0.5 C#5/0.5 D5/4\n${B_RE}`, rotulos: ["soprano", "baixo"], cifras: CIF_RE,
            anotacoes: [[0, 1, "9–8"], [0, 2, "7–6"], [0, 5, "P"], [0, 7, "4–3"], [0, 8, "B. inc."]],
            notas: [["decisao", "C. 3: ré5–dó5–si♭4, com o dó natural como passagem descendente (escala menor melódica descendo) sobre o i."],
              ["decisao", "C. 4: o retardo ré5 não resolve direto: desce uma 3ª ao si4 natural e sobe ao dó♯5 — resolução ornamentada. O si4 é bordadura incompleta da resolução; o dó♯5 chega ainda dentro do V."],
              ["rejeitada", "Pensei em lá4 como nota intermediária (nota do acorde de V): ré5–lá4–dó♯5 tem um salto de 4ª seguido de outro de 3ª na direção contrária, e o dó♯ chegaria por salto — a resolução deixaria de ser ouvida como grau conjunto."],
              ["checagem", "Si4 natural e dó♯5: a escala menor melódica subindo para a tônica, sem 2ª aumentada (si♭–dó♯)."]] },
        ] },
      { tipo: "contraste", titulo: "Cadeia de 7–6 em cima × cadeia de 2–3 embaixo",
        a: { rotulo: "A — o soprano preso: 7–6, 7–6, 7–6 e o 4–3 da cadência", partitura: `tom: C maior\n${SOL_76}`, cifras: [[0, "I6"], [2, "vii°6"], [4, "vi6"], [6, "V6"], [8, "I"], [10, "IV6"], [12, "V"], [16, "I"]] },
        b: { rotulo: "B — o baixo preso: 2–3, 2–3, 2–3", partitura: "tom: C maior\nsoprano: E5/4 D5 C5 B4 C5\nbaixo: C3/2 C3/2~ C3/2 B2/2~ B2/2 A2/2~ A2/2 G2/2 C3/4", cifras: [[0, "I"], [2, "I"], [6, "V6"], [10, "vi"], [14, "V"], [16, "I"]] },
        pergunta: "As duas frases descem por grau numa voz e criam uma dissonância presa por compasso. Em qual delas a tensão está no agudo, e o que isso muda na escuta?",
        comentario: "<p>Em A o soprano é síncopado: cada nota é preparada no tempo fraco, fica presa sobre o novo baixo (7ª) e desce à 6ª; a melodia ouvida é a cadeia de suspiros, e o baixo é só o chão que desce. Em B a melodia é uma escala em semibreves, totalmente consonante na sua chegada, e quem 'atrasa' é o baixo: a 2ª (9ª) nasce quando o soprano ataca, e se desfaz quando o baixo desce. A tensão vem de baixo — soa mais grave, mais 'pesada', e a melodia parece estável sobre um chão que cede. Corelli e Handel usam as duas, muitas vezes alternando-as entre as vozes de uma sonata a três.</p>" },
      { tipo: "quebra", titulo: "Retardos que sobem, que não resolvem, que não foram preparados", html: `
        <p>A regra do retardo é a mais antiga das que este livro ensina — e foi a primeira a ser publicamente quebrada. Em 1600, Giovanni Maria Artusi publicou <i>L'Artusi, overo Delle imperfettioni della moderna musica</i>, criticando trechos de madrigais de Monteverdi (entre eles 'Cruda Amarilli') em que dissonâncias entram sem preparação. Monteverdi respondeu no prefácio do 5º livro (1605) com a ideia de uma <b>seconda pratica</b>, em que o texto governa a harmonia; seu irmão Giulio Cesare a explicou em 1607. A dissonância não preparada passa a ser um recurso de expressão, com nome e justificativa.</p>
        <p>O Barroco italiano faz do retardo preparado um motor: as cadeias de 7–6 e 2–3 de <b>Corelli</b> e <b>Handel</b> e as notas longas presas de <b>Bach</b> (a Ária da Suíte BWV 1068) obedecem à regra e a estendem — preparam com uma resolução, resolvem trocando o baixo, ornamentam a chegada. A <b>retardação</b>, com a sensível presa sobre a tônica e subindo, aparece como fórmula de cadência. No século XIX o retardo se confunde com a apojatura: a nota presa resolve quando o acorde já mudou (a resolução cai numa harmonia nova), a resolução é adiada por vários tempos ou transferida para outra voz ou oitava, e a nota 'presa' muitas vezes nem foi preparada — é uma apojatura longa, que o ouvido toma por retardo pelo contexto.</p>
        <p>O que se ganha: a tensão deixa de ter prazo. Um retardo estrito promete a resolução no tempo seguinte; um retardo romântico pode adiar a promessa, cumpri-la em outra voz ou não cumpri-la — e o ouvinte, educado na regra, sente cada uma dessas escolhas.</p>`,
        exemplos: [
          { rotulo: "Retardação: a sensível presa sobre a tônica sobe (7–8)", partitura: "tom: G maior\nsoprano: E5/2 F#5/2~ F#5/2 G5/2\nbaixo: C3/2 D3 G2/4", cifras: [[0, "IV"], [2, "V"], [4, "I"]],
            perfil: { ...ORN }, contexto: { ornLicencas: ["retardacao"] },
            comentario: "Fá♯5, nota do V, fica preso quando o baixo cai no sol2: 7ª maior contra a tônica. Em vez de descer, sobe ao sol5. A tensão da sensível é a mesma da cadência; o que muda é o atraso, que faz a tônica chegar meio compasso depois do baixo. No estilo estrito o verificador recusaria (retardo que sobe); aqui a licença está ativa." },
          { rotulo: "Retardo sem resolução: a 4ª presa salta e deixa a resolução para a voz interna", partitura: "tom: D menor\nsoprano: F5/1 D5/2 A5/1 F5/4\nbaixo: Bb2/2 A2/2 D3/4", cifras: [[0, "VI"], [2, "V"], [4, "i"]],
            perfil: { ...ORN }, contexto: { ornLicencas: ["retardo_sem_resolucao"] },
            comentario: "Ré5 preparado no VI (2º tempo) fica preso sobre o lá2 — 4ª — e, em vez de descer ao dó♯5, salta à 5ª do acorde (lá5). Numa textura de piano a resolução apareceria numa voz interna; a duas vozes ela fica subentendida. A expectativa criada pela regra é o que dá sentido à sua quebra." },
        ] },
    ],
    exercicios: [
      { id: "rh1", titulo: "Completar: a cadeia de 7–6 e o 4–3", modo: "completar", perfil: PERFIL_ORN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 } }, cifras: "I6 vii°6 vi6 V6 I IV6 V I".split(" "),
        instrucoes: "<p>Dó maior. O baixo desce por grau com acordes de sexta (I6 vii°6 vi6 V6) e depois cadencia (I IV6 V I). O primeiro retardo está escrito: dó5 preparado no 2º tempo, preso sobre o ré3 (7ª), resolvendo no si4 do 4º tempo. <b>Continue a cadeia</b> (cada resolução fica presa sobre o baixo seguinte), pare-a no I do c. 3 e prepare um <b>4–3</b> sobre o V do c. 4.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/1 C5/2 B4/2\nbaixo: E3/2 D3 C3 B2 C3 A2 G2/4 C3/4", duracao: 2, alvoCompassos: 5, plano: PLANO_RET,
        solucao: `tom: C maior\ncf: baixo\n${SOL_76}`,
        comentarioSolucao: "Si4 preso sobre o dó3 (7ª) → lá4; lá4 preso sobre o si2 (7ª) → sol4; o sol4 preso sobre o dó3 é uma 5ª, consonante: a cadeia para sozinha. O dó5 entra no 2º tempo do c. 3, atravessa o IV6 como nota do acorde e fica preso sobre o sol2 do V: 4–3, resolvendo no si4 e subindo à tônica." },
      { id: "rh2", titulo: "Três retardos em lá menor", modo: "menos apoio", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 }, ornMinimos: { retardo: 3 } }, cifras: "i V i i6 vii°6 i iv V i".split(" "),
        instrucoes: "<p>Lá menor, baixo e cifras dados. Escreva o soprano com pelo menos <b>três retardos</b>. Procure onde cada um cabe: um 5/3 depois do V (9–8), um baixo que desce sob um acorde de sexta (7–6), o V da cadência (4–3). Cada preparação num tempo mais fraco que o retardo.</p>",
        texto: "tom: A menor\ncf: baixo\nsoprano:\nbaixo: A2/2 E2 A2 C3 B2 A2 D3 E3 A3/4", duracao: 2, alvoCompassos: 5, plano: PLANO_RET,
        solucao: "tom: A menor\ncf: baixo\nsoprano: C5/2 B4/2~ B4/1 A4/3~ A4/1 G#4/1 A4/2 F4/1 A4/1~ A4/1 G#4/1 A4/4\nbaixo: A2/2 E2 A2 C3 B2 A2 D3 E3 A3/4",
        comentarioSolucao: "9–8 (si4 sobre lá2), 7–6 (lá4 sobre si2) e 4–3 (lá4 sobre mi3), o mesmo plano do exemplo em ré menor. Experimente variar: uma resolução ornamentada no c. 4, ou mudar a ordem das preparações." },
      { id: "rh3", titulo: "O baixo preso: cadeia de 2–3", modo: "restrição", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 }, ornMinimos: { retardo_baixo: 2 } }, cifrasAluno: true,
        instrucoes: "<p>Sol maior. O soprano desce em semibreves (si4 lá4 sol4 fá♯4 sol4). Escreva o <b>baixo</b> e as cifras. <b>Restrição:</b> pelo menos dois retardos <b>2–3 no baixo</b>: o baixo entra no 3º tempo, fica ligado por cima da barra enquanto o soprano ataca a nota nova (2ª ou 9ª), e desce por grau à 3ª (10ª). Termine com V–I.</p>",
        texto: "tom: G maior\ncf: soprano\nsoprano: B4/4 A4 G4 F#4 G4\nbaixo:", duracao: 2, alvoCompassos: 5, plano: PLANO_RET,
        solucao: "tom: G maior\ncf: soprano\nsoprano: B4/4 A4 G4 F#4 G4\nbaixo: G2/2 G2/2~ G2/2 F#2/2~ F#2/2 E2/2~ E2/2 D2/2 G2/4", solucaoCifras: "I I V6 vi V I",
        comentarioSolucao: "Três 2–3 seguidos: sol2 preso sob lá4 → fá♯2 (V6); fá♯2 preso sob sol4 → mi2 (vi); mi2 preso sob fá♯4 → ré2 (V). O baixo repete o sol2 no começo só para poder entrar no tempo fraco: um baixo atacado no tempo forte não pode ficar preso." },
      { id: "rh4", titulo: "Livre: retardos sobre o seu baixo", modo: "livre", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 }, ornMinimos: { retardo: 3 } }, cifrasAluno: true, alvoCompassos: 5,
        instrucoes: "<p>Componha soprano, baixo e cifras de uma frase de 5 compassos em sol maior (ou no tom que preferir, mudando o cabeçalho), com pelo menos <b>três retardos</b> de tipos diferentes no soprano e cadência perfeita. Planeje primeiro onde vão as preparações.</p>",
        texto: "tom: G maior\nsoprano:\nbaixo:", duracao: 2, plano: PLANO_RET,
        solucao: "tom: G maior\nsoprano: G4/1 B4/1 D5/2~ D5/1 C5/1 A4/2~ A4/1 G4/1 C5/2~ C5/1 B4/1 A4/2 G4/4\nbaixo: G2/2 B2 C3 D3 E3 C3 D3 D3 G2/4", solucaoCifras: "I I6 IV V vi ii6 I64 V I",
        comentarioSolucao: "9–8 (ré5 sobre o dó3 do IV), 4–3 (lá4 sobre o mi3 do vi) e 7–6 sobre o 6/4 cadencial (dó5 sobre ré3, resolvendo no si4) — o 6/4 cadencial ganha mais uma camada de atraso. Cada nota presa entra no 3º tempo e é presa no 1º." },
      { id: "rh5", titulo: "Quebrar: a sensível que sobe", modo: "quebrar", perfil: PERFIL_MIN, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 3 }, ornLicencas: ["retardacao"], ornMinimos: { retardacao: 1 } }, cifras: "i VI iv V i".split(" "),
        instrucoes: "<p>Mi menor, três compassos. <b>Quebra pedida:</b> no último compasso, a sensível (ré♯5) do V fica <b>presa sobre a tônica</b> (7ª maior) e resolve <b>subindo</b> ao mi5 no 3º tempo — uma retardação. Antes disso, tudo estrito.</p>",
        texto: "tom: E menor\ncf: baixo\nsoprano:\nbaixo: E3/2 C3 A2 B2 E3/4", duracao: 2, alvoCompassos: 3, plano: PLANO_RET,
        solucao: "tom: E menor\ncf: baixo\nsoprano: G4/1 B4/1 C5/2 E5/2 D#5/2~ D#5/2 E5/2\nbaixo: E3/2 C3 A2 B2 E3/4",
        comentarioSolucao: "Ré♯5 entra no V (3º tempo do c. 2), fica preso sobre o mi3 e sobe meio tom. O atraso da tônica é o mesmo de um 4–3, mas a direção é a da sensível: a resolução para cima é ouvida como natural justamente porque a sensível 'quer' subir." },
    ],
  }, { depoisDe: "ornamentos" });
})(this);
