/* Nível 4 · Cromatismo: dominantes secundárias, sensíveis secundárias e cadeias, empréstimo modal, sexta napolitana.
 * Fontes: Aldwell & Schachter (Harmony and Voice Leading), Piston (Harmony), Schoenberg (Harmonielehre;
 * Structural Functions of Harmony), Kostka & Payne, Open Music Theory 2e; notas de pesquisa em
 * research_notes/O que se ensina em composição/harmonia.md. Exemplos: reconstruções conferidas no verificador. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL } = T.perfis;
  const F = M.ferramentas;

  // ------------------------------------------------------------ apoio

  const PC = (nome) => ((M.lerAltura(nome.replace(/-/g, "b") + "4").ps % 12) + 12) % 12;
  const ESCALA_MAIOR = [0, 2, 4, 5, 7, 9, 11];
  // vozes externas: a primeira (soprano) e a última (baixo)
  const externas = (ex) => (ex.vozes.length >= 2 ? [ex.vozes[0], ex.vozes[ex.vozes.length - 1]] : ex.vozes.slice());
  // a última nota da voz que soa durante a harmonia h, e a seguinte (se vier encostada)
  function ultimaNaHarmonia(v, h) {
    const ns = v.notas.filter((n) => n.fim > h.inicio && n.inicio < h.fim);
    if (!ns.length) return null;
    const n = ns[ns.length - 1];
    return { n, prox: v.seguinte(n) };
  }
  const raizDe = (h) => R3.membros(h.cifra, h.tom)[0];
  const alvoDe = (h) => {
    const t = h.tom, esc = ESCALA_MAIOR;
    // grau-alvo na escala do tom (menor natural no modo menor)
    const passos = h.cifra.secundaria.alvo - 1;
    const st = t.modo === "minor" ? [0, 2, 3, 5, 7, 8, 10][passos] : esc[passos];
    return M.transpor(t.tonica, passos, st).nome;
  };
  // empréstimo: no modo maior, acorde (não secundário, não napolitano, não sexta aumentada) com o 3º, 6º ou 7º grau abaixado
  function abaixadas(h) {
    if (!h.cifra || h.tom.modo !== "major" || h.cifra.secundaria || h.cifra.napolitana || h.cifra.aumentada) return [];
    const t = h.tom.tonica;
    const baixados = [2, 5, 6].map((g) => M.transpor(t, g, ESCALA_MAIOR[g] - 1).nome);
    return R3.membros(h.cifra, h.tom).filter((n) => baixados.includes(n));
  }
  const sextoAbaixado = (tom) => M.transpor(tom.tonica, 5, 8).nome;
  const harmonias = (ex, ctx) => R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
  const nomeBonito = (n) => n.replace(/-/g, "♭").replace(/#/g, "♯");

  // ------------------------------------------------------------ regras do capítulo

  M.definirRegra("sec_intervalo_melodico", "Intervalos aumentados e diminutos (estilo cromático)",
    "Nenhuma voz faz intervalo melódico aumentado ou diminuto (2ª aumentada, trítono, 4ª diminuta, 7ª diminuta…). O semitom cromático na mesma voz (dó → dó♯) é permitido: é o jeito certo de introduzir a nota alterada. Exceção: na voz de cima, a 3ª diminuta do ♭2 da napolitana para a sensível (ré♭ → si em dó).",
    function* (ex) {
      const tom = ex.tonalidade;
      const b2 = tom ? M.transpor(tom.tonica, 1, 1).nome : null, sens = tom ? M.transpor(tom.tonica, -1, -1).nome : null;
      for (let iv = 0; iv < ex.vozes.length; iv++) {
        const v = ex.vozes[iv];
        for (const [a, b] of v.paresMelodicos()) {
          const i = F.intervalo(a, b);
          if (!(i.qual[0] === "A" || i.qual[0] === "d")) continue;
          if (i.geral === 1) continue; // semitom cromático na mesma voz
          if (iv === 0 && ex.vozes.length > 1 && i.nomeSimples === "d3" && b.ps < a.ps && a.altura.nome === b2 && b.altura.nome === sens) continue;
          yield [ex.compassoDe(b.inicio), `${v.nome}: ${F.nomeIntervalo(i)} de ${a.nome} para ${b.nome}`, [a, b]];
        }
      }
    }, { porque: "Intervalos aumentados e diminutos são difíceis de cantar e soam como um defeito da linha, não como cor. O cromatismo bem escrito mora no semitom cromático dentro de uma mesma voz.",
      corrigir: "Leve a nota alterada por semitom cromático na mesma voz (fá → fá♯ → sol) ou chegue a ela por grau; troque o salto por outra nota do acorde." });

  M.definirRegra("sec_falsa_relacao", "Falsa relação",
    "Uma nota e a sua versão alterada (fá e fá♯) não aparecem em vozes diferentes em acordes seguidos: a alteração fica na mesma voz.",
    function* (ex) {
      if (ex.vozes.length < 2) return;
      const i = 0, j = ex.vozes.length - 1;
      for (const [m1, m2] of F.sucessoes(ex, i, j)) {
        const casos = [];
        if (m2.atacaInf && m1.sup.altura.letra === m2.inf.altura.letra && m1.sup.altura.alter !== m2.inf.altura.alter
          && !(m2.sup.altura.letra === m2.inf.altura.letra && m2.sup.altura.alter === m2.inf.altura.alter)) casos.push([m1.sup, m2.inf]);
        if (m2.atacaSup && m1.inf.altura.letra === m2.sup.altura.letra && m1.inf.altura.alter !== m2.sup.altura.alter
          && !(m2.inf.altura.letra === m2.sup.altura.letra && m2.inf.altura.alter === m2.sup.altura.alter)) casos.push([m1.inf, m2.sup]);
        for (const [a, b] of casos) yield [ex.compassoDe(m2.t), `falsa relação: ${nomeBonito(a.altura.nome)} numa voz, ${nomeBonito(b.altura.nome)} na outra logo depois`, [a, b]];
      }
    }, { porque: "Quando a alteração passa de uma voz para outra, o ouvido escuta as duas versões da nota como um choque, e a linha cromática que daria sentido à alteração some.",
      corrigir: "Deixe a nota natural e a alterada na mesma voz (fá → fá♯), ou afaste-as com um acorde no meio." });

  M.definirRegra("sec_sensivel_sobe", "Sensível secundária sobe",
    "Quando um acorde secundário (V/x, vii°/x) vai para o seu alvo, a sensível temporária — a 3ª do V/x, a fundamental do vii°/x — sobe meio tom, nas vozes externas.",
    function* (ex, ctx) {
      const hs = harmonias(ex, ctx);
      for (let k = 0; k + 1 < hs.length; k++) {
        const h = hs[k], prox = hs[k + 1];
        if (!h.cifra.secundaria) continue;
        if (PC(raizDe(prox)) !== PC(alvoDe(h))) continue;
        const m = R3.membros(h.cifra, h.tom);
        const sens = h.cifra.secundaria.tipo === 5 ? m[1] : m[0];
        for (const v of externas(ex)) {
          const u = ultimaNaHarmonia(v, h);
          if (!u || !u.prox || u.n.altura.nome !== sens) continue;
          if (u.prox.ps - u.n.ps !== 1) yield [ex.compassoDe(u.prox.inicio), `${v.nome}: ${nomeBonito(sens)} é a sensível de ${h.texto} e devia subir meio tom (vai a ${u.prox.nome})`, [u.n, u.prox]];
        }
      }
    }, { precisaTom: true, porque: "A nota alterada de uma dominante secundária é a sensível do acorde que ela tonaliza: é ela que faz o ouvido esperar o alvo. Se ela não sobe, a tonicização não se cumpre.",
      corrigir: "Leve a nota alterada meio tom acima (fá♯ → sol em V/V), na mesma voz." });

  M.definirRegra("sec_setima_desce", "Sétima do acorde secundário desce",
    "A 7ª de um acorde secundário (V7/x, vii°7/x, viiø7/x) desce por grau nas vozes externas, ou fica parada se o acorde seguinte a contém.",
    function* (ex, ctx) {
      const hs = harmonias(ex, ctx);
      for (let k = 0; k + 1 < hs.length; k++) {
        const h = hs[k], prox = hs[k + 1];
        if (!h.cifra.secundaria || !h.cifra.setima) continue;
        const set = R3.membros(h.cifra, h.tom)[3];
        for (const v of externas(ex)) {
          const u = ultimaNaHarmonia(v, h);
          if (!u || !u.prox || u.n.altura.nome !== set) continue;
          const d = u.n.ps - u.prox.ps;
          const fica = d === 0 && prox.notas.has(set);
          if (!fica && !(F.ehGrau(u.n, u.prox) && d > 0)) yield [ex.compassoDe(u.prox.inicio), `${v.nome}: ${nomeBonito(set)} é a 7ª de ${h.texto} e devia descer por grau (vai a ${u.prox.nome})`, [u.n, u.prox]];
        }
      }
    }, { precisaTom: true, porque: "A 7ª é a dissonância do acorde; como em toda dominante, ela resolve descendo por grau.",
      corrigir: "Leve a 7ª um grau abaixo no acorde seguinte (ou mantenha-a, se ela pertence ao acorde seguinte, como no V7/V → I6/4)." });

  M.definirRegra("sec_resolve_no_alvo", "O acorde secundário vai para o seu alvo",
    "V/x e vii°/x resolvem no acorde x (em qualquer inversão). Valem também a troca de posição do próprio acorde secundário e, para V/V e vii°7/V, o I6/4 cadencial que adia o V.",
    function* (ex, ctx) {
      const hs = harmonias(ex, ctx);
      for (let k = 0; k + 1 < hs.length; k++) {
        const h = hs[k], prox = hs[k + 1];
        if (!h.cifra.secundaria) continue;
        if (PC(raizDe(prox)) === PC(alvoDe(h))) continue;
        const mesmo = prox.cifra.secundaria && prox.cifra.secundaria.alvo === h.cifra.secundaria.alvo && prox.tom === h.tom;
        const cadencial = h.cifra.secundaria.alvo === 5 && prox.cifra.grau === 1 && prox.cifra.seisQuatro;
        if (mesmo || cadencial) continue;
        yield [ex.compassoDe(prox.inicio), `${h.texto} devia resolver no seu alvo (${nomeBonito(alvoDe(h))}), e vai para ${prox.texto}`, [h.baixo, prox.baixo]];
      }
    }, { precisaTom: true, porque: "O acorde secundário é a dominante de um grau: ele existe para fazer esse grau soar, por um instante, como tônica. Sem a resolução, o ouvido fica com uma promessa não cumprida.",
      corrigir: "Depois de V/x (ou vii°/x), escreva o acorde x; para V/V, o I6/4 cadencial antes do V também serve." });

  M.definirRegra("sec_sexto_abaixado_desce", "O 6º grau abaixado desce",
    "No modo maior, o ♭6 emprestado do menor (lá♭ em dó) desce por grau (normalmente ao 5º) ou fica parado quando a harmonia volta ao maior; nunca sobe ao 6º natural.",
    function* (ex, ctx) {
      const hs = harmonias(ex, ctx);
      for (let k = 0; k + 1 < hs.length; k++) {
        const h = hs[k], prox = hs[k + 1];
        const b6 = sextoAbaixado(h.tom);
        if (!abaixadas(h).includes(b6) || abaixadas(prox).includes(b6)) continue;
        for (const v of externas(ex)) {
          const u = ultimaNaHarmonia(v, h);
          if (!u || !u.prox || u.n.altura.nome !== b6) continue;
          const d = u.n.ps - u.prox.ps;
          if (!(d === 0 || (d > 0 && F.ehGrau(u.n, u.prox)))) yield [ex.compassoDe(u.prox.inicio), `${v.nome}: ${nomeBonito(b6)} (6º abaixado de ${h.texto}) devia descer por grau, e vai a ${u.prox.nome}`, [u.n, u.prox]];
        }
      }
    }, { precisaTom: true, porque: "O ♭6 é uma nota do menor dentro do maior: a sua tendência é cair meio tom para o 5º grau. Subindo ao 6º natural, a mistura soa como erro de escrita, não como cor.",
      corrigir: "Leve o ♭6 ao 5º grau (lá♭ → sol), ou mantenha-o como nota comum." });

  M.definirRegra("sec_napolitana_desce", "O ♭2 da napolitana desce",
    "Na napolitana, o 2º grau abaixado (ré♭ em dó), quando está na voz de cima, desce: à tônica sobre o I6/4 cadencial ou sobre o vii°7/V, ou direto à sensível (3ª diminuta) sobre o V.",
    function* (ex, ctx) {
      const hs = harmonias(ex, ctx);
      for (let k = 0; k + 1 < hs.length; k++) {
        const h = hs[k];
        if (!h.cifra.napolitana) continue;
        const b2 = R3.membros(h.cifra, h.tom)[0];
        for (const v of externas(ex).slice(0, 1)) {
          const u = ultimaNaHarmonia(v, h);
          if (!u || !u.prox || u.n.altura.nome !== b2) continue;
          const i = F.intervalo(u.n, u.prox);
          if (!(u.prox.ps < u.n.ps && i.geral <= 3)) yield [ex.compassoDe(u.prox.inicio), `${v.nome}: ${nomeBonito(b2)} (♭2 da napolitana) devia descer à tônica ou à sensível, e vai a ${u.prox.nome}`, [u.n, u.prox]];
        }
      }
    }, { precisaTom: true, porque: "O ♭2 é uma 'sensível de cima' da tônica: puxado para baixo, ele dá à napolitana a sua direção para a dominante.",
      corrigir: "Leve o ♭2 à tônica (sobre o I6/4 ou o vii°7/V) ou, na voz de cima, direto à sensível sobre o V." });

  /* ctx.pedidos = [{ tipo: "secundaria"|"dominante"|"sensivel"|"emprestimo"|"napolitana"|"cadeia", min?, compasso? }] */
  const TIPOS = {
    secundaria: ["acorde secundário", (h) => !!h.cifra.secundaria],
    dominante: ["dominante secundária (V/x)", (h) => !!h.cifra.secundaria && h.cifra.secundaria.tipo === 5],
    sensivel: ["sensível secundária (vii°/x)", (h) => !!h.cifra.secundaria && h.cifra.secundaria.tipo === 7],
    emprestimo: ["acorde emprestado do menor", (h) => abaixadas(h).length > 0],
    napolitana: ["napolitana", (h) => !!h.cifra.napolitana],
    napolitana_fundamental: ["napolitana em estado fundamental", (h) => !!h.cifra.napolitana && h.cifra.membroBaixo === 0],
    picardia: ["terça de picardia (I maior no fim de uma peça em menor)", (h) => h.tom.modo === "minor" && h.cifra.grau === 1 && h.cifra.maior && !h.cifra.secundaria && !h.cifra.alteracao],
  };
  function maiorCadeia(hs) {
    let melhor = 0, atual = 0;
    for (let k = 0; k < hs.length; k++) {
      const h = hs[k], prox = hs[k + 1];
      if (h.cifra.secundaria && h.cifra.secundaria.tipo === 5 && prox && (PC(raizDe(prox)) - PC(raizDe(h)) + 12) % 12 === 5) { atual += 1; melhor = Math.max(melhor, atual); }
      else atual = 0;
    }
    return melhor;
  }
  M.definirRegra("sec_acordes_pedidos", "Acordes pedidos pelo exercício",
    "O exercício pede certos acordes cromáticos: um número mínimo de acordes secundários, de empréstimos ou uma cadeia de dominantes, ou um acorde num compasso dado.",
    function* (ex, ctx) {
      if (!ctx.pedidos) return;
      const hs = harmonias(ex, ctx);
      const fim = ex.compassoDe(ex.fim - 1);
      for (const p of ctx.pedidos) {
        if (p.tipo === "cadeia") {
          const n = maiorCadeia(hs);
          if (n < (p.min || 2)) yield [fim, `a maior cadeia de dominantes secundárias encadeadas por 5ª tem ${n} acorde(s); o exercício pede ${p.min || 2}`, []];
          continue;
        }
        const [nome, teste] = TIPOS[p.tipo];
        if (p.compasso) {
          if (!hs.some((h) => teste(h) && ex.compassoDe(h.inicio) === p.compasso)) yield [p.compasso, `o compasso ${p.compasso} devia ter uma ${nome}`, []];
        } else {
          const n = hs.filter(teste).length;
          if (n < (p.min || 1)) yield [fim, `${n} ${nome}(s); o exercício pede pelo menos ${p.min || 1}`, []];
        }
      }
    }, { precisaTom: true, porque: "Usar o acorde de propósito, num lugar escolhido, é o que transforma a regra em vocabulário.",
      corrigir: "Procure os pontos em que o baixo ou a melodia permitem o acorde pedido e reescreva a cifra e as vozes ali." });
  M.PRECISA_FIM.add("sec_acordes_pedidos");
  for (const id of ["sec_sensivel_sobe", "sec_setima_desce", "sec_resolve_no_alvo", "sec_sexto_abaixado_desce", "sec_napolitana_desce"]) M.OLHA_ADIANTE.add(id);

  // ------------------------------------------------------------ perfis

  const BASE = { ...TONAL };
  delete BASE.intervalo_melodico_aumentado_diminuto;
  const CROM = { ...BASE, sec_intervalo_melodico: "erro", sec_falsa_relacao: "erro", sec_sensivel_sobe: "erro", sec_setima_desce: "erro", sec_resolve_no_alvo: "erro" };
  const MIST = { ...CROM, sec_sexto_abaixado_desce: "erro" };
  const NAP = { ...MIST, sec_napolitana_desce: "erro" };

  // ------------------------------------------------------------ capítulos
  // cifras de um exemplo a partir da linha do baixo: [[tempo em semínimas, cifra], …]
  function cif(partitura, simbolos) {
    const linha = partitura.split("\n").find((l) => /^baixo:/.test(l));
    const sim = simbolos.trim().split(/\s+/);
    let t = 0, d = 1, i = 0;
    const r = [];
    for (const tok of linha.replace(/^baixo:/, "").trim().split(/\s+/)) {
      const m = /\/([\d.]+)/.exec(tok);
      if (m) d = parseFloat(m[1]);
      if (!/^P/.test(tok)) r.push([t, sim[i++]]);
      t += d;
    }
    return r;
  }
  const ex = (partitura, simbolos, resto = {}) => ({ partitura, cifras: cif(partitura, simbolos), rotulos: ["soprano", "baixo"], ...resto });

  const CAPITULOS = [];

  // ================================================================ 1. Dominantes secundárias
  {
    const P_DIAT = "tom: C maior\nsoprano: E5/1 D5 C5 B4 A4/2 C5/2 B4/2 D5/2 C5/4\nbaixo: C3/2 E3/2 F3/2 D3/2 G3/2 G2/2 C3/4";
    const P_CROM = "tom: C maior\nsoprano: E5/1 D5 C5 Bb4 A4/2 C5/2 B4/2 D5/2 C5/4\nbaixo: C3/2 E3/2 F3/2 F#3/2 G3/2 G2/2 C3/4";
    CAPITULOS.push({
      id: "secundarias", titulo: "Dominantes secundárias",
      antes: [
        { p: "Em dó maior, qual é o V/V?", o: ["Ré–fá♯–lá (ré maior)", "Sol–si–ré", "Ré–fá–lá", "Lá–dó♯–mi"], e: "V/V é a dominante da dominante: o acorde maior uma 5ª acima de sol, ré–fá♯–lá. O fá♯ é a sensível de sol. Ré–fá–lá é o ii diatônico; lá–dó♯–mi é o V/ii." },
        { p: "Por que não existe V/vii° em dó maior?", o: ["Porque um acorde diminuto não pode soar como tônica, nem por um instante", "Porque a sensível nunca pode ser dobrada", "Porque a nota fá♯♯ não existe", "Porque daria quintas paralelas"], e: "Tonicizar é fazer um acorde soar, por um momento, como tônica. Só tríades maiores e menores (consonantes) servem; o vii° (e o ii° do menor) têm 5ª diminuta e não podem ser 'tônica' de nada." },
        { p: "Em V65/V → V (dó maior), o fá♯ do baixo:", o: ["Sobe meio tom para sol", "Desce para fá", "Fica parado", "Salta para ré"], e: "O fá♯ é a sensível temporária de sol: sobe meio tom. Descer para fá natural desmancharia a tonicização (e criaria um cromatismo descendente sem sentido)." },
      ],
      objetivo: "Usar V/x e V7/x de qualquer grau tonicizável para dar direção a um acorde diatônico, conduzindo a nota alterada como sensível e sem falsas relações.",
      ouvir: ["Beethoven, Sinfonia nº 1 op. 21, início: a obra abre com um V7/IV que resolve no IV", "Bach, Prelúdio em dó maior BWV 846 (Cravo bem temperado I): a progressão passa pela dominante da dominante sobre o baixo", "Corais de Bach: V/V e V/vi nas cadências intermediárias"],
      esboco: "Sobre o baixo dó–mi–fá–sol–dó (dó maior), troque um dos acordes por uma dominante secundária. Qual nota do baixo ou da melodia você alteraria, e para onde ela vai?",
      secoes: [
        { tipo: "texto", rotulo: "A regra", titulo: "A dominante emprestada de um grau", html: `
          <p>Qualquer tríade <b>maior ou menor</b> do tom pode receber a sua própria dominante: o acorde maior (com ou sem 7ª menor) uma 5ª acima dela. A notação <b>V/x</b> (lê-se "cinco de x") fixou-se nos manuais americanos depois de Piston (<i>Harmony</i>, 1941); a tradição alemã fala em <i>Zwischendominante</i> (dominante intermediária) e Schenker chamou o efeito de <i>Tonikalisierung</i>, tonicização.</p>
          <table class="tabela-modos"><thead><tr><th>Alvo</th><th>Em dó maior</th><th>Nota alterada</th><th>Em lá menor</th><th>Nota alterada</th></tr></thead><tbody>
          <tr><td>ii / ii°</td><td>V/ii = lá–dó♯–mi(–sol)</td><td>dó♯</td><td>— (ii° é diminuto)</td><td></td></tr>
          <tr><td>iii / III</td><td>V/iii = si–ré♯–fá♯(–lá)</td><td>ré♯, fá♯</td><td>V/III = sol–si–ré(–fá)</td><td>nenhuma (é o VII)</td></tr>
          <tr><td>IV / iv</td><td>V7/IV = dó–mi–sol–si♭</td><td>si♭ (a 7ª)</td><td>V/iv = lá–dó♯–mi(–sol)</td><td>dó♯</td></tr>
          <tr><td>V</td><td>V/V = ré–fá♯–lá(–dó)</td><td>fá♯</td><td>V/V = si–ré♯–fá♯(–lá)</td><td>ré♯</td></tr>
          <tr><td>vi / VI</td><td>V/vi = mi–sol♯–si(–ré)</td><td>sol♯</td><td>V/VI = dó–mi–sol(–si♭)</td><td>si♭ (a 7ª)</td></tr>
          <tr><td>vii° / VII</td><td>— (vii° é diminuto)</td><td></td><td>V/VII = ré–fá♯–lá(–dó)</td><td>fá♯</td></tr>
          </tbody></table>
          <h3>Condução das vozes</h3>
          <ul><li>A nota elevada é a <b>sensível do alvo</b>: sobe meio tom (fá♯ → sol em V/V → V). A 7ª do V7/x desce por grau, como a de qualquer dominante.</li>
          <li>Leve o cromatismo <b>na mesma voz</b>: fá → fá♯ → sol. Se o fá natural está numa voz e o fá♯ chega em outra, há <b>falsa relação</b>; o ouvido ouve as duas versões como um choque.</li>
          <li>Não dobre a sensível secundária. No par soprano–baixo, ela costuma ir no baixo (V6/x, V65/x: o baixo sobe meio tom para a fundamental do alvo) ou no soprano, nunca nos dois.</li>
          <li>O alvo pode vir em qualquer inversão; V/V e vii°7/V também resolvem no I6/4 cadencial, que é um ornamento do V.</li></ul>
          <h3>Tonicização × modulação</h3>
          <p>Um V/x seguido do x é uma <b>tonicização</b>: o centro continua o mesmo, só um grau ganhou brilho de tônica por um instante. Só há <b>modulação</b> quando o novo centro se confirma com cadência própria e o tom antigo deixa de ser referência — assunto do capítulo de modulação. Schoenberg (<i>Structural Functions of Harmony</i>) leva a ideia ao extremo: toda tonicização é uma <i>região</i> dentro de uma única tonalidade.</p>
          <p>Os exercícios usam regras novas: <b>Sensível secundária sobe</b>, <b>Sétima do acorde secundário desce</b>, <b>O acorde secundário vai para o seu alvo</b>, <b>Falsa relação</b> e uma versão de <b>Intervalos aumentados e diminutos</b> que aceita o semitom cromático na mesma voz.</p>` },
        { tipo: "exemplo", titulo: "Duas tonicizações numa frase de quatro compassos", intro: "Par externo e cifras; as vozes internas ficam implícitas, como num baixo cifrado.",
          camadas: [
            ex(P_DIAT, "I I6 IV ii7 V V7 I", { titulo: "A frase diatônica",
              notas: [["decisao", "Baixo dó–mi–fá–ré–sol: uma linha que sobe até o IV e cai para a dominante. Soprano descendo de mi5 a lá4 em graus, depois a cadência."],
                ["checagem", "Nenhum erro, mas nada puxa: o I6 e o ii7 só preenchem o caminho até o V."]] }),
            ex(P_CROM, "I V65/IV IV V65/V V V7 I", { titulo: "Duas sensíveis emprestadas", anotacoes: [[0, 3, "7ª de V7/IV ↓"], [1, 1, "sensível de fá ↑"], [1, 3, "sensível de sol ↑"]],
              notas: [["decisao", "C. 1: o I6 vira V65/IV — o mi do baixo passa a ser sensível de fá e sobe para fá. O si♭ do soprano é a 7ª e desce para lá: a linha mi–ré–dó–si♭–lá ganha um semitom cromático de passagem."],
                ["decisao", "C. 2: o ii7 vira V65/V. O baixo fá–fá♯–sol leva o cromatismo numa voz só; o dó5 do soprano é a 7ª e desce para si4."],
                ["rejeitada", "Pensei em V/V em estado fundamental (ré no baixo): o baixo saltaria fá–ré–sol e o fá♯ teria de ir para o soprano, longe do fá natural que acabou de soar no baixo — falsa relação."],
                ["checagem", "Em cada acorde secundário: a sensível sobe meio tom (mi → fá, fá♯ → sol), a 7ª desce (si♭ → lá, dó → si), e o alvo vem logo depois."]],
              pausa: ["Por que o V65/IV fica bem justamente no começo, logo depois do I?", "Porque dó–mi–sol vira dó–mi–sol–si♭ com uma nota só: a tônica 'ganha uma 7ª' e passa a apontar para o IV. É o gesto que abre a Sinfonia nº 1 de Beethoven — começar pela dominante do IV, adiando a confirmação do I."] }),
          ] },
        { tipo: "contraste", titulo: "Falsa relação × cromatismo numa voz",
          a: { rotulo: "A — fá no soprano, fá♯ no baixo", partitura: "tom: C maior\nsoprano: E5/2 F5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 A2/2 F#2/2 G2/2 C3/4", cifras: cif("baixo: C3/2 A2/2 F#2/2 G2/2 C3/4", "I IV6 V65/V V I"), perfil: { ...CROM, sec_falsa_relacao: "info" } },
          b: { rotulo: "B — fá → fá♯ → sol no baixo", partitura: "tom: C maior\nsoprano: E5/2 C5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 F3/2 F#3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 F#3/2 G3/2 C3/4", "I IV V65/V V I") },
          pergunta: "Os acordes são quase os mesmos. Onde está o choque em A, e por que B soa como uma linha?",
          comentario: "<p>Em A o fá5 do soprano é seguido imediatamente pelo fá♯2 do baixo: as duas versões da nota soam em vozes diferentes e o ouvido não liga uma à outra — ouve um choque, não uma inflexão. Em B o fá natural do IV vira fá♯ <i>na mesma voz</i> e continua até sol: o cromatismo é melodia, e a sensível secundária tem de onde vir e para onde ir.</p>" },
        { tipo: "quebra", titulo: "Quando a dominante secundária não resolve como manda a regra", html: `
          <p>A regra pede que o V/x vá ao x e que a sensível suba. Dois desvios entraram cedo no vocabulário:</p>
          <ul><li><b>Resolução de engano</b>: o V7/vi vai ao IV em vez do vi (o mesmo engano V–VI, visto do tom de lá menor). A sensível ainda sobe (sol♯ → lá), mas o baixo sobe por grau em vez de cair uma 5ª, e o alvo prometido não chega.</li>
          <li><b>Cadeias de dominantes</b>: cada V7/x vai para a dominante seguinte, já com 7ª (mi7–lá7–ré7–sol7–dó). O alvo de cada um é trocado pela sua própria versão dominante; a sensível de um acorde <i>desce</i> meio tom e vira a 7ª do seguinte. É o motor das sequências por 5ªs e, no século XIX, um modo de adiar a tônica por compassos inteiros.</li></ul>
          <p>Nos dois casos o que se perde é a confirmação do alvo; o que se ganha é impulso — o ouvido corre para a próxima dominante.</p>`,
          exemplos: [
            ex("tom: C maior\nsoprano: C5/2 B4/1 G#4/1 G4/2 F#4/2 F4/2 E4/2\nbaixo: C3/2 E3/2 A2/2 D3/2 G2/2 C3/2", "I V7/vi V7/ii V7/V V7 I", { rotulo: "Cadeia mi7–lá7–ré7–sol7–dó: a sensível desce e vira 7ª",
              perfil: { ...CROM, sec_sensivel_sobe: "info" }, contexto: { plano: {} },
              comentario: "O soprano desce cromaticamente sol♯–sol–fá♯–fá–mi: cada 3ª de dominante (sensível) cai meio tom e vira a 7ª da dominante seguinte, que por sua vez desce por grau. A regra 'sensível sobe' aparece como informação: aqui ela é deliberadamente quebrada." }),
            ex("tom: C maior\nsoprano: E5/2 D5/2 C5/2 B4/1 D5/1 C5/4\nbaixo: C3/2 E3/2 F3/2 G3/2 C3/4", "I V7/vi IV V I", { rotulo: "V7/vi → IV: o engano secundário",
              perfil: { ...CROM, sec_resolve_no_alvo: "info" },
              comentario: "O mi7 promete lá menor; o baixo sobe mi–fá e chega o IV. A 7ª (ré) desce para dó e o lá menor nunca aparece — o desvio dá ao IV um peso de chegada que ele não teria vindo do I." }),
          ] },
      ],
      exercicios: [
        { id: "sec1", titulo: "Completar: V/ii e V/V em sol maior", modo: "completar", perfil: { ...CROM }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true, cifrasIniciais: "I V65/ii ii",
          instrucoes: "<p>O baixo está pronto; o soprano e as cifras do começo também. O baixo tem dois cromatismos: sol♯ (já cifrado como V65/ii) e dó♯. Cifre o resto (o dó♯ é a sensível de quê?), escreva o soprano e feche com I6/4–V7–I. Cuidado com o dó natural do soprano antes do dó♯ do baixo.</p>",
          texto: "tom: G maior\ncf: baixo\nsoprano: B4/1 C5/1 D5/2 C5/1 D5/1\nbaixo: G2/2 G#2/2 A2/2 C#3/2 D3/2 D3/2 G2/4", duracao: 1,
          solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 C5/1 D5/2 C5/1 D5/1 E5/2 G5/2 F#5/2 G5/4\nbaixo: G2/2 G#2/2 A2/2 C#3/2 D3/2 D3/2 G2/4",
          solucaoCifras: "I V65/ii ii V65/V I64 V7 I",
          comentarioSolucao: "O dó♯ é a sensível de ré: V65/V, que resolve no I6/4 cadencial (um V ornamentado). O soprano deixa o dó natural um tempo antes (dó–ré–mi) para não haver falsa relação com o dó♯ do baixo." },
        { id: "sec2", titulo: "Ré menor: V/iv e V7/III", modo: "menos apoio", perfil: { ...CROM }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 5 } },
          cifrasAluno: true,
          instrucoes: "<p>Escreva o soprano e as cifras sobre o baixo dado. O fá♯ do c. 1 e o dó do c. 2 pedem dominantes secundárias: descubra de que graus. No modo menor, lembre que o III (fá maior) e o iv (sol menor) são tonicizáveis; o ii° não.</p>",
          texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/2 F#2/2 G2/2 C3/2 F2/2 G2/2 A2/2 A2/2 D3/4", duracao: 1,
          solucao: "tom: D menor\ncf: baixo\nsoprano: A4/4 Bb4/1 D5/1 E5/2 F5/2 E5/2 D5/2 C#5/2 D5/4\nbaixo: D3/2 F#2/2 G2/2 C3/2 F2/2 G2/2 A2/2 A2/2 D3/4",
          solucaoCifras: "i V6/iv iv V7/III III iiø65 i64 V7 i",
          comentarioSolucao: "Fá♯ no baixo = V6/iv (sobe a sol); dó no baixo sob o mi do soprano = V7/III, e o mi (sensível de fá) sobe a fá no c. 3, o clímax. O lá4 longo do c. 1 é nota comum entre i e V6/iv: o soprano não precisa se mexer para a tonicização acontecer." },
        { id: "sec3", titulo: "Três dominantes secundárias sob uma melodia", modo: "restrição", perfil: { ...CROM, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 5 }, pedidos: [{ tipo: "secundaria", min: 3 }] }, cifrasAluno: true,
          instrucoes: "<p>A melodia está dada; escreva o baixo e as cifras. <b>Restrição:</b> pelo menos três acordes secundários. Os acidentes da melodia (mi♭, fá♯) são pistas: a qual acorde secundário cada um pertence, e qual nota do baixo resolve a sensível?</p>",
          texto: "tom: F maior\ncf: soprano\nsoprano: C5/2 Eb5/2 D5/2 F#5/2 G5/2 F5/2 E5/2 G5/2 F5/4\nbaixo:", duracao: 2,
          solucao: "tom: F maior\ncf: soprano\nsoprano: C5/2 Eb5/2 D5/2 F#5/2 G5/2 F5/2 E5/2 G5/2 F5/4\nbaixo: F2/2 A2/2 Bb2/2 A2/2 G2/2 B2/2 C3/2 C3/2 F2/4",
          solucaoCifras: "I V65/IV IV V43/ii ii V65/V V V7 I",
          comentarioSolucao: "Mi♭ = 7ª de V7/IV (com a sensível lá no baixo); fá♯ = sensível de sol menor (V43/ii); o fá do c. 3 sobre si natural = 7ª de V65/V, que desce a mi. Três tonicizações seguidas (IV, ii, V), cada uma resolvida — o baixo sobe quase todo por grau." },
        { id: "sec4", titulo: "Livre: frase em mi menor com duas tonicizações", modo: "livre", perfil: { ...CROM, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 5 }, pedidos: [{ tipo: "secundaria", min: 2 }] }, cifrasAluno: true, alvoCompassos: 5,
          instrucoes: "<p>Componha soprano, baixo e cifras de uma frase de 5 compassos em mi menor, com cadência perfeita no fim e pelo menos duas dominantes secundárias (ou mais) de graus diferentes. Faça pelo menos um cromatismo numa voz só (por exemplo sol → sol♯ → lá).</p>",
          texto: "tom: E menor\nsoprano:\nbaixo:", duracao: 2,
          solucao: "tom: E menor\nsoprano: B4/1 G4/1 G#4/2 A4/1 C5/1 C5/2 B4/1 D5/1 E5/1 G5/1 E5/2 D#5/2 E5/4\nbaixo: E3/2 E3/2 A2/2 D3/2 G2/2 C3/2 C#3/2 B2/2 E3/4",
          solucaoCifras: "i V7/iv iv V7/III III VI V43/V V i",
          comentarioSolucao: "Três tonicizações: iv (sol → sol♯ → lá no soprano), III (a 7ª dó desce a si) e V (dó → dó♯ → si no baixo — o VI vira V43/V por uma nota). O clímax sol5 cai no c. 3, antes da descida cadencial." },
        { id: "sec5", titulo: "Quebrar: cadeia de dominantes em sol maior", modo: "quebrar", perfil: { ...CROM, sec_sensivel_sobe: "info" }, nivel: 6, contexto: { nivel: 6, plano: {} },
          cifras: ["I", "V7/vi", "V7/ii", "V7/V", "V7", "I"],
          instrucoes: "<p>O baixo e as cifras formam a cadeia si7–mi7–lá7–ré7–sol. Escreva o soprano de modo que, a partir do c. 1, <b>a sensível de cada dominante desça meio tom e vire a 7ª da seguinte</b> (ré♯ → ré, dó♯ → dó). É a quebra da regra 'sensível sobe': ela aparece como informação. A 7ª, essa sim, continua descendo por grau.</p>",
          texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/2 B2/2 E3/2 A2/2 D3/4 G2/4", duracao: 2,
          solucao: "tom: G maior\ncf: baixo\nsoprano: D5/2 D#5/2 D5/2 C#5/2 C5/4 B4/4\nbaixo: G2/2 B2/2 E3/2 A2/2 D3/4 G2/4",
          comentarioSolucao: "Ré–ré♯–ré–dó♯–dó–si: depois da bordadura cromática inicial, o soprano é uma escala cromática descendente em que cada nota alterna função (3ª de um acorde, 7ª do seguinte). A tônica só se confirma no fim — com o 3º grau no soprano, uma chegada mais suave que a perfeita." },
      ],
    });
  }

  // ================================================================ 2. Sensíveis secundárias e cadeias
  {
    const P_DIAT = "tom: C maior\nsoprano: G5/2 F5/2 G5/1 A5/3 E5/2 D5/2 C5/4\nbaixo: C3/2 D3/2 E3/1 F3/3 G3/2 G3/2 C3/4";
    const P_DIM = "tom: C maior\nsoprano: G5/2 F5/1 F#5/1 G5/1 A5/3 E5/2 D5/2 C5/4\nbaixo: C3/1 C#3 D3 D#3 E3/1 F3/1 F#3/2 G3/2 G3/2 C3/4";
    CAPITULOS.push({
      id: "secundarias2", titulo: "Sensíveis secundárias e cadeias",
      antes: [
        { p: "Em dó maior, quais são as notas de vii°7/V?", o: ["Fá♯–lá–dó–mi♭", "Si–ré–fá–lá♭", "Fá♯–lá–dó–mi", "Ré–fá♯–lá–dó"], e: "É o acorde de 7ª diminuta sobre a sensível de sol (fá♯): fá♯–lá–dó–mi♭. Com mi natural seria o viiø7/V (meio-diminuto); ré–fá♯–lá–dó é o V7/V, do qual o vii°7/V é a versão sem fundamental com 9ª menor." },
        { p: "Quando se usa viiø7/x em vez de vii°7/x?", o: ["Só quando o alvo é uma tríade maior (a 7ª menor vem da escala maior do alvo)", "Sempre que o alvo é menor", "Só no modo menor", "Nunca: só existe o vii°7"], e: "O viiø7 é o acorde de sensível do modo maior; por isso só soa natural antes de um alvo maior (viiø7/V, viiø7/IV). Antes de um alvo menor (ii, iii, vi) a 7ª precisa ser diminuta." },
        { p: "Numa cadeia mi7 → lá7 → ré7 → sol7 → dó, o que acontece com o sol♯ do mi7?", o: ["Desce para sol, a 7ª do lá7", "Sobe para lá, a fundamental do lá7", "Fica parado", "Salta para mi"], e: "Na cadeia, cada alvo chega já como dominante: o sol♯ (sensível de lá) desce meio tom e vira a 7ª do lá7. Sobe para lá só se a voz que leva a sensível for a que passa à fundamental; no par externo típico da cadeia, a linha cromática desce." },
      ],
      objetivo: "Usar os acordes de sensível de cada grau (vii°7/x, viiø7/x) e encadear dominantes secundárias por 5ªs, sabendo quando a tonicização se estende e quando a resolução é elidida.",
      ouvir: ["Bach, Prelúdio em dó maior BWV 846: acordes de 7ª diminuta sobre o baixo na segunda metade", "Vivaldi, concertos do L'estro armonico op. 3: sequências por quintas descendentes", "Chopin, Prelúdio em mi menor op. 28 nº 4: acordes que deslizam por semitom sem resolver como dominantes"],
      esboco: "Escreva um baixo dó–dó♯–ré–ré♯–mi em dó maior. Que acorde poria sobre cada nota alterada, e por que ele não pode ser um V/x em estado fundamental?",
      secoes: [
        { tipo: "texto", rotulo: "A regra", titulo: "A sensível de cada grau", html: `
          <p>Assim como o V tem o seu acorde de sensível (vii°), cada V/x tem o seu: o acorde construído sobre a <b>sensível do alvo</b>. Os manuais clássicos (Piston, Aldwell & Schachter) cifram <b>vii°7/x</b> e <b>viiø7/x</b>; a teoria alemã do século XIX explicava o 7ª diminuta como um V9 sem fundamental, e a cifra mostra exatamente isso: vii°7/ii = dó♯–mi–sol–si♭ = lá7(♭9) sem o lá.</p>
          <table class="tabela-modos"><thead><tr><th>Acorde</th><th>Construção</th><th>Uso</th></tr></thead><tbody>
          <tr><td><b>vii°7/x</b></td><td>sensível do alvo + 3ª m + 5ª d + 7ª d</td><td>antes de qualquer alvo, maior ou menor (a 7ª diminuta vem do menor do alvo)</td></tr>
          <tr><td><b>viiø7/x</b></td><td>sensível do alvo + 3ª m + 5ª d + 7ª m</td><td>só antes de alvo maior: viiø7/V, viiø7/IV</td></tr>
          <tr><td><b>vii°6/x</b></td><td>tríade diminuta na 1ª inversão</td><td>passagem, mais leve que o 7ª diminuta</td></tr>
          </tbody></table>
          <h3>Condução</h3>
          <ul><li>A fundamental (sensível do alvo) sobe meio tom; a 7ª desce por grau; a 5ª diminuta tende a descer.</li>
          <li>O vii°7/V resolve no V (a 7ª mi♭ desce a ré) ou no I6/4 cadencial; neste caso, em maior, a 7ª costuma subir cromaticamente a mi, a 6ª do I6/4.</li>
          <li>Com o 7ª diminuta no baixo em inversão (vii°65/x, vii°42/x) o baixo ganha linhas cromáticas: o baixo dó–dó♯–ré–ré♯–mi–fá–fá♯–sol, com uma sensível diminuta antes de cada grau, é um padrão clássico de baixo ascendente.</li></ul>
          <h3>Cadeias de dominantes</h3>
          <p>Uma dominante secundária pode ter a sua própria dominante: V/V/V em dó é lá maior (que também se chama V/ii), V/V/V/V é mi maior (V/vi). Encadeadas por 5ªs descendentes, elas formam a <b>sequência por quintas</b> — mi(7)–lá(7)–ré(7)–sol(7)–dó —, o mecanismo mais comum de condução harmônica a longa distância no Barroco. Cada acorde resolve no seguinte; a regra histórica pede que a cadeia termine num alvo diatônico estável e que cada 7ª desça.</p>
          <p><b>Tonicização estendida</b>: quando o alvo ganha mais que um acorde de preparação (ii–V–I do alvo, ou um compasso inteiro na sua órbita), a fronteira com a modulação fica tênue. O critério continua o mesmo: há cadência no tom novo, e o tom de partida desaparece do ouvido?</p>` },
        { tipo: "exemplo", titulo: "Uma escada de sensíveis", intro: "Baixo cromático ascendente: uma sensível diminuta antes de cada grau.",
          camadas: [
            ex(P_DIAT, "I ii iii IV I64 V7 I", { titulo: "O esqueleto diatônico",
              notas: [["decisao", "Baixo dó–ré–mi–fá–sol: escala ascendente até a dominante; o soprano faz um arco sol5–lá5–ré5–dó5 em 10ªs e 6ªs com o baixo."],
                ["checagem", "Correto e plano: cada grau chega sem preparação; ii e iii soam iguais em peso ao I."]] }),
            ex(P_DIM, "I vii°7/ii ii vii°7/iii iii IV vii°7/V I64 V7 I", { titulo: "Uma sensível diminuta antes de ii, iii e V", anotacoes: [[1, 1, "dó♯ ↑"], [1, 3, "ré♯ ↑"], [1, 6, "fá♯ ↑"]],
              notas: [["decisao", "Entre cada dois graus do baixo entra o semitom cromático: dó♯ (vii°7/ii), ré♯ (vii°7/iii), fá♯ (vii°7/V). Cada um é a sensível do acorde seguinte e sobe meio tom."],
                ["decisao", "O soprano faz fá–fá♯–sol enquanto o baixo faz ré–ré♯–mi: 10ªs paralelas cromáticas — o fá♯ do soprano é a 3ª do vii°7/iii, não uma nova sensível."],
                ["rejeitada", "Pensei em V65/ii, V65/iii e V65/V (as dominantes com a mesma sensível no baixo). Funcionam, mas o 7ª diminuta é mais compacto e simétrico; com três acordes de dominante seguidos a frase soaria como três cadências."],
                ["checagem", "O vii°7/V vai ao I6/4 (permitido: o 6/4 cadencial é um V ornamentado); o lá5, nota comum do fá♯°7, é o clímax e só então a melodia desce."]],
              pausa: ["O baixo sobe sete semitons seguidos. Por que a frase não perde a tonalidade?", "Porque cada nota cromática é imediatamente explicada pela resolução: dó♯ só existe para ir a ré, ré♯ para ir a mi. O ouvido ouve uma escala diatônica (dó–ré–mi–fá–sol) com sensíveis de passagem, e a cadência I6/4–V7–I confirma dó no fim."] }),
          ] },
        { tipo: "contraste", titulo: "V65/V × vii°7/V",
          a: { rotulo: "A — V65/V (ré–fá♯–lá–dó)", partitura: "tom: C maior\nsoprano: E5/2 C5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 F3/2 F#3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 F#3/2 G3/2 C3/4", "I IV V65/V V I") },
          b: { rotulo: "B — vii°7/V (fá♯–lá–dó–mi♭)", partitura: "tom: C maior\nsoprano: E5/2 C5/2 Eb5/2 D5/2 C5/4\nbaixo: C3/2 F3/2 F#3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 F#3/2 G3/2 C3/4", "I IV vii°7/V V I") },
          pergunta: "O baixo é o mesmo. O que o mi♭ de B acrescenta?",
          comentario: "<p>Em A a 7ª da dominante secundária (dó) desce a si: a sensível de sol e a sensível de dó se sucedem, e o V chega claro. Em B o mi♭ — a 9ª menor do ré7 sem fundamental — desce a ré por semitom: duas vozes chegam ao V por meio tom (fá♯ → sol, mi♭ → ré). O 7ª diminuta é mais tenso e mais escuro, e traz uma nota do menor para dentro do maior: a mesma família do empréstimo modal, assunto do próximo capítulo.</p>" },
        { tipo: "quebra", titulo: "Cadeias cromáticas e resoluções elididas", html: `
          <p>No século XIX a cadeia de sensíveis e dominantes vira um fim em si. Duas práticas:</p>
          <ul><li><b>7ªs diminutas deslizando por semitom.</b> Como só existem três acordes de 7ª diminuta, um deles sempre está a meio tom do outro; descendo cromaticamente, cada um 'resolve' noutro 7ª diminuta, e nenhum alvo é confirmado até a cadência. Chopin e Liszt usam sequências desse tipo em passagens de transição; no Prelúdio em mi menor op. 28 nº 4, Chopin faz acordes descerem por semitom, uma voz de cada vez, sem que as 7ªs resolvam como dominantes.</li>
          <li><b>Dominantes em inversão com o baixo cromático.</b> Na cadeia mi7/ré–lá7/dó♯–ré7/dó–sol7/si–dó, os alvos são elididos (cada um chega já como dominante do próximo) e o baixo desce por semitom: a sensível dó♯ do lá7 desce a dó, a 7ª do ré7. A regra 'sensível sobe' é quebrada de propósito; a regra 'a 7ª desce' é a que dá a direção.</li></ul>`,
          exemplos: [
            ex("tom: C maior\nsoprano: E5/2 D5/2 G5/2 F#5/2 F5/4 E5/2 D5/2 C5/4\nbaixo: C3/2 B2/2 Bb2/2 A2/2 Ab2/4 G2/2 G2/2 C3/4", "I vii°7 vii°42/ii vii°65/V vii°42 I64 V7 I", { rotulo: "7ªs diminutas descendo por semitom",
              perfil: { ...CROM, sec_resolve_no_alvo: "info" },
              comentario: "si°7 → dó♯°7/si♭ → fá♯°7/lá → si°7/lá♭: o baixo desce cromaticamente de si a sol e o soprano desce em 6ªs paralelas (sol–fá♯–fá–mi). Nenhum vii°7/x vai ao seu alvo (a regra aparece como informação); só o último, com o lá♭ no baixo, resolve — no I6/4 da cadência." }),
            ex("tom: C maior\nsoprano: E5/1 C5/1 B4/2 A4/4 G4/2 E5/2 F5/2 D5/2 C5/4\nbaixo: C3/2 D3/2 C#3/2 C3/2 B2/2 C3/2 D3/2 G3/2 C3/4", "I V42/vi V65/ii V42/V V65 I ii V7 I", { rotulo: "Dominantes em inversão: baixo ré–dó♯–dó–si–dó",
              perfil: { ...CROM, sec_sensivel_sobe: "info" },
              comentario: "Mi7/ré → lá7/dó♯ → ré7/dó → sol7/si → dó: cada 7ª do baixo desce por grau, e o dó♯ (sensível de ré) desce a dó porque o ré chega já como ré7. O soprano segura o lá4 como nota comum enquanto o baixo desliza por baixo dele." }),
          ] },
      ],
      exercicios: [
        { id: "sec2a", titulo: "Completar: vii°7/ii e vii°7/V em ré maior", modo: "completar", perfil: { ...CROM }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true, cifrasIniciais: "I vii°7/ii",
          instrucoes: "<p>O baixo está pronto; o primeiro compasso do soprano e das cifras também. Cifre o resto — o sol♯ do c. 2 é a sensível de quê? — e escreva o soprano até a cadência I6/4–V7–I. Evite o sol natural no soprano logo antes do sol♯ do baixo.</p>",
          texto: "tom: D maior\ncf: baixo\nsoprano: F#5/2 A5/2\nbaixo: D3/2 D#3/2 E3/2 G#3/2 A3/2 A2/2 D3/4", duracao: 2,
          solucao: "tom: D maior\ncf: baixo\nsoprano: F#5/2 A5/2 B5/4 F#5/2 E5/2 D5/4\nbaixo: D3/2 D#3/2 E3/2 G#3/2 A3/2 A2/2 D3/4",
          solucaoCifras: "I vii°7/ii ii vii°7/V I64 V7 I",
          comentarioSolucao: "Sol♯ = sensível de lá: vii°7/V, que vai ao I6/4. O si5 longo é nota comum entre ii (mi–sol–si) e o sol♯°7 — o soprano fica parado e não toca sol natural." },
        { id: "sec2b", titulo: "Sol menor: sensíveis de iv e de V", modo: "menos apoio", perfil: { ...CROM }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true,
          instrucoes: "<p>A melodia está dada. Escreva o baixo e as cifras usando acordes de sensível secundária onde a melodia permitir. Dica: as notas cromáticas podem estar no baixo — si natural antes de dó, dó♯ antes de ré.</p>",
          texto: "tom: G menor\ncf: soprano\nsoprano: D5/2 F5/2 Eb5/2 E5/2 D5/2 F#5/2 G5/4\nbaixo:", duracao: 2,
          solucao: "tom: G menor\ncf: soprano\nsoprano: D5/2 F5/2 Eb5/2 E5/2 D5/2 F#5/2 G5/4\nbaixo: G2/2 B2/2 C3/2 C#3/2 D3/2 D3/2 G2/4",
          solucaoCifras: "i vii°7/iv iv vii°7/V V V7 i",
          comentarioSolucao: "O baixo sol–si–dó–dó♯–ré sobe com duas sensíveis (si → dó, dó♯ → ré). O fá5 sobre o si°7 é a 5ª diminuta do acorde e desce a mi♭; mi♭ → mi natural no soprano acompanha o dó → dó♯ do baixo em 10ªs." },
        { id: "sec2c", titulo: "Cadeia de três dominantes em lá maior", modo: "restrição", perfil: { ...CROM, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "cadeia", min: 3 }] }, cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras para a melodia. <b>Restrição:</b> uma cadeia de pelo menos três dominantes secundárias seguidas, cada uma resolvendo uma 5ª abaixo na seguinte (V7/vi → V7/ii → V7/V…). Use inversões para o baixo andar por grau, e deixe cada sensível do baixo subir.</p>",
          texto: "tom: A maior\ncf: soprano\nsoprano: E5/2 E#5/2 F#5/2 F#5/2 G#5/2 B5/2 A5/4\nbaixo:", duracao: 2,
          solucao: "tom: A maior\ncf: soprano\nsoprano: E5/2 E#5/2 F#5/2 F#5/2 G#5/2 B5/2 A5/4\nbaixo: A2/2 C#3/2 A#2/2 B2/2 E3/4 A2/4",
          solucaoCifras: "I V7/vi V65/ii V7/V V7 I",
          comentarioSolucao: "Dó♯7 → fá♯7/lá♯ → si7 → mi7 → lá: três dominantes secundárias por 5ªs. O mi♯ do soprano é a sensível de fá♯ e sobe; o lá♯ do baixo é a sensível de si e sobe. Aqui nenhuma regra é quebrada: as sensíveis estão nas vozes que vão às fundamentais." },
        { id: "sec2d", titulo: "Livre: duas sensíveis secundárias em si♭ maior", modo: "livre", perfil: { ...CROM, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "sensivel", min: 2 }] }, cifrasAluno: true, alvoCompassos: 4,
          instrucoes: "<p>Componha soprano, baixo e cifras de uma frase de 4 compassos em si♭ maior com pelo menos dois acordes de sensível secundária, um deles o <b>viiø7/V</b> (mi–sol–si♭–ré), que só funciona antes de um alvo maior. Cadência perfeita no fim.</p>",
          texto: "tom: Bb maior\nsoprano:\nbaixo:", duracao: 2,
          solucao: "tom: Bb maior\nsoprano: F5/2 Ab5/2 G5/4 Bb5/2 A5/2 Bb5/4\nbaixo: Bb2/2 B2/2 C3/2 E3/2 F3/2 F3/2 Bb2/4",
          solucaoCifras: "I vii°7/ii ii viiø7/V I64 V7 I",
          comentarioSolucao: "Si natural no baixo (vii°7/ii) e mi natural (viiø7/V), cada um subindo meio tom. O lá♭5 é a 7ª diminuta e desce a sol; o sol5 fica parado sobre o mi°ø7 (é a 3ª dele). Repare: o soprano nunca toca mi♭ ou si♭ logo antes do mi ou do si natural do baixo." },
        { id: "sec2e", titulo: "Quebrar: 7ªs diminutas descendo em sol maior", modo: "quebrar", perfil: { ...CROM, sec_resolve_no_alvo: "info" }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifras: ["I", "vii°7", "vii°42/ii", "vii°65/V", "vii°42", "I64", "V7", "I"],
          instrucoes: "<p>O baixo desce cromaticamente sob uma cadeia de 7ªs diminutas, nenhuma resolvendo no seu alvo (a regra aparece como informação). Escreva o soprano: escolha em cada acorde uma nota consonante com o baixo (3ª menor ou 6ª maior) para que o soprano também desça, em 6ªs, até a cadência.</p>",
          texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G3/2 F#3/2 F3/1 E3/1 Eb3/2 D3/2 D3/2 G2/4", duracao: 2,
          solucao: "tom: G maior\ncf: baixo\nsoprano: D5/2 Eb5/2 D5/1 C#5/1 C5/2 B4/2 A4/2 G4/4\nbaixo: G3/2 F#3/2 F3/1 E3/1 Eb3/2 D3/2 D3/2 G2/4",
          comentarioSolucao: "Mi♭5 sobre o fá♯°7 (a 7ª, desce a ré); depois ré–dó♯–dó–si em 6ªs com o baixo fá–mi–mi♭–ré. Quatro acordes de sensível sem um único alvo resolvido, e mesmo assim a cadência I6/4–V7–I explica tudo no fim." },
      ],
    });
  }

  // ================================================================ 3. Empréstimo modal
  {
    const P_MAIOR = "tom: C maior\nsoprano: E5/2 A5/2 A5/2 G5/2 F5/2 D5/2 C5/4\nbaixo: C3/2 F3/2 F3/2 C3/2 F3/2 G3/2 C3/4";
    const P_MIST = "tom: C maior\nsoprano: E5/2 A5/2 Ab5/2 G5/2 F5/2 D5/2 C5/4\nbaixo: C3/2 F3/2 F3/2 C3/2 F3/2 G3/2 C3/4";
    CAPITULOS.push({
      id: "emprestimo", titulo: "Empréstimo modal",
      antes: [
        { p: "Em dó maior, quais notas o empréstimo do menor traz?", o: ["Mi♭, lá♭ e si♭ (3º, 6º e 7º abaixados)", "Fá♯, dó♯ e sol♯", "Ré♭ e sol♭", "Só o si♭"], e: "Dó menor difere de dó maior no 3º, 6º e 7º graus: mi♭, lá♭, si♭. Os acordes emprestados são os que contêm essas notas: iv, ii°, iiø7, ♭VI, ♭III, ♭VII, vii°7." },
        { p: "Para onde tende o lá♭ do iv (fá–lá♭–dó) em dó maior?", o: ["Desce meio tom para sol", "Sobe para lá natural", "Salta para dó", "Sobe para si♭"], e: "O ♭6 é uma nota 'pesada' do menor: cai meio tom para o 5º grau (lá♭ → sol). Subir para lá natural é ouvir as duas versões da nota em seguida, sem razão." },
        { p: "O que é a terça de picardia?", o: ["O acorde de tônica maior no fim de uma peça em menor", "O ♭3 usado numa peça em maior", "Uma cadência que termina na 3ª da tônica", "A 3ª dobrada no acorde final"], e: "Terminar uma peça em menor com o I maior é um empréstimo no sentido contrário (do maior para o menor); o nome aparece no Dicionário de Rousseau (1768). É frequente nos corais e prelúdios em menor do Barroco." },
      ],
      objetivo: "Escurecer uma frase em maior com acordes do menor homônimo (iv, ii°6, iiø65, ♭VI, ♭III, ♭VII, vii°7) mantendo a função de cada um, e conduzir as notas abaixadas para baixo.",
      ouvir: ["Brahms, Sinfonia nº 3 op. 90: o mote fá–lá♭–fá, ambiguidade maior/menor que atravessa a obra", "Schubert, Winterreise, 'Gute Nacht': a última estrofe passa ao maior", "Schubert, Sonata em si♭ D. 960, 1º mov.: a música chega a sol♭ maior (♭VI) logo no início", "Corais de Bach em modo menor que terminam com o acorde maior (terça de picardia)"],
      esboco: "Toque I–IV–I em dó maior e depois I–iv–I. Onde está a diferença, numa só nota? Que voz você daria a essa nota?",
      secoes: [
        { tipo: "texto", rotulo: "A regra", titulo: "Notas do menor dentro do maior", html: `
          <p><b>Empréstimo modal</b> (ou mistura; <i>Mischung</i> em Schenker) é usar, num tom maior, acordes do menor homônimo. O acorde muda de cor, <b>não de função</b>: o iv continua pré-dominante, o ♭VI continua um substituto da tônica/pré-dominante, o vii°7 continua dominante.</p>
          <table class="tabela-modos"><thead><tr><th>Acorde</th><th>Em dó maior</th><th>Nota emprestada</th><th>Função</th></tr></thead><tbody>
          <tr><td>iv / iv6</td><td>fá–lá♭–dó</td><td>lá♭</td><td>pré-dominante (e plagal: iv–I)</td></tr>
          <tr><td>ii°6</td><td>fá–lá♭–ré (baixo fá)</td><td>lá♭</td><td>pré-dominante</td></tr>
          <tr><td>iiø65</td><td>fá–lá♭–dó–ré (baixo fá)</td><td>lá♭</td><td>pré-dominante, a mais comum</td></tr>
          <tr><td>♭VI</td><td>lá♭–dó–mi♭</td><td>lá♭, mi♭</td><td>engano (V–♭VI) e pré-dominante</td></tr>
          <tr><td>♭III</td><td>mi♭–sol–si♭</td><td>mi♭, si♭</td><td>cor; raro no Classicismo</td></tr>
          <tr><td>♭VII</td><td>si♭–ré–fá</td><td>si♭</td><td>cor, frequentemente como V/♭III</td></tr>
          <tr><td>vii°7</td><td>si–ré–fá–lá♭</td><td>lá♭</td><td>dominante</td></tr>
          <tr><td>I (em menor)</td><td>em lá menor: lá–dó♯–mi</td><td>dó♯</td><td>tônica final: terça de picardia</td></tr>
          </tbody></table>
          <h3>Condução</h3>
          <ul><li>As notas abaixadas <b>tendem a descer</b>: lá♭ → sol (♭6 → 5) é a mais forte; mi♭ → ré, si♭ → lá. A regra <b>O 6º grau abaixado desce</b> verifica o lá♭ nas vozes externas quando a harmonia volta ao maior.</li>
          <li>A troca natural → abaixada fica <b>na mesma voz</b> (lá → lá♭ → sol: a linha cromática descendente é o som característico do empréstimo); em vozes diferentes há falsa relação.</li>
          <li>O empréstimo costuma vir depois da versão diatônica (IV → iv), não antes: o ouvido precisa do maior para sentir o escurecimento.</li>
          <li>Em menor, o empréstimo do maior quase se resume à terça de picardia no acorde final.</li></ul>` },
        { tipo: "exemplo", titulo: "Escurecer a pré-dominante", intro: "A mesma frase em dó maior, primeiro pura, depois com iv e iiø65.",
          camadas: [
            ex(P_MAIOR, "I IV IV I ii65 V7 I", { titulo: "Dó maior puro",
              notas: [["decisao", "I–IV–I (plagal) e depois ii65–V7–I: o soprano sobe a lá5 e desce por graus até dó5."],
                ["checagem", "O lá5 repetido sobre o IV é a nota que vamos trocar."]] }),
            ex(P_MIST, "I IV iv I iiø65 V7 I", { titulo: "iv e iiø65 emprestados", anotacoes: [[0, 2, "♭6 ↓"]],
              notas: [["decisao", "O segundo IV vira iv: o soprano faz lá–lá♭–sol, uma linha cromática descendente numa voz só, e o ♭6 cai no 5º grau."],
                ["decisao", "O ii65 vira iiø65 (ré–fá–lá♭–dó): o lá♭ fica implícito numa voz interna e desce a sol no V7. O baixo e o soprano não mudam."],
                ["rejeitada", "Pensei em lá♭ também no soprano do c. 3 (sobre o iiø65). Ficaria sol–lá♭–sol duas vezes seguidas: a cor se gasta. Uma vez na melodia, outra implícita, basta."],
                ["checagem", "Funções iguais às da camada 1 (T–PD–PD–T–PD–D–T): o empréstimo muda a cor, não o caminho."]],
              pausa: ["Por que o IV vem antes do iv, e não o contrário?", "Porque o ouvido precisa do lá natural para perceber o lá♭ como escurecimento. Na ordem inversa (iv → IV) o lá♭ subiria para lá: a nota abaixada contrariaria a sua tendência e soaria como correção, não como cor."] }),
          ] },
        { tipo: "contraste", titulo: "Engano diatônico × engano emprestado",
          a: { rotulo: "A — V → vi", partitura: "tom: C maior\nsoprano: E5/2 D5/2 B4/2 C5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 F3/2 G3/2 A3/2 F3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 G3/2 A3/2 F3/2 G3/2 C3/4", "I ii6 V vi ii65 V7 I") },
          b: { rotulo: "B — V → ♭VI", partitura: "tom: C maior\nsoprano: E5/2 D5/2 B4/2 C5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 F3/2 G3/2 Ab3/2 F3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 G3/2 Ab3/2 F3/2 G3/2 C3/4", "I ii6 V bVI iiø65 V7 I") },
          pergunta: "As duas cadências de engano têm a mesma melodia. O que muda com o lá♭ no baixo?",
          comentario: "<p>Em A o engano é suave: lá menor tem duas notas em comum com dó maior, e o baixo sobe um tom. Em B o baixo sobe só meio tom (sol → lá♭) e o acorde que chega é maior e estranho ao tom — o engano soa como uma porta aberta para outra região. O ♭VI pede a continuação emprestada (iiø65), e o lá♭ só desce ao sol no V7. É a semente do ♭VI como região tonal, que os românticos exploram em grande escala.</p>" },
        { tipo: "quebra", titulo: "O empréstimo como cor e como região", html: `
          <p>A regra clássica trata a mistura como detalhe local: um acorde escurecido, voltando logo ao maior, com o ♭6 descendo. No século XIX ela vira <b>estrutura</b>:</p>
          <ul><li><b>Maior e menor alternados.</b> Schubert repete uma frase trocando o modo da própria tônica (I → i); em 'Gute Nacht' (<i>Winterreise</i>) a última estrofe passa ao maior. Brahms faz da ambiguidade um mote: na Sinfonia nº 3, fá–lá♭–fá põe a 3ª menor contra a harmonia maior. Na volta ao maior, as notas abaixadas <i>sobem</i> (lá♭ → lá): a regra da tendência descendente é quebrada para que a luz volte.</li>
          <li><b>♭VI como região.</b> O acorde de engano vira tom: Schubert (Sonata D. 960, que vai de si♭ a sol♭ maior) e Beethoven tonicizam o ♭VI com a sua própria dominante e voltam por meio de um acorde comum. Aqui só antecipamos o procedimento; o capítulo de modulação trata dele por inteiro.</li></ul>`,
          exemplos: [
            ex("tom: C maior\nsoprano: E5/1 D5/1 C5/2 D5/1 B4/1 C5/2 Eb5/1 D5/1 C5/2 D5/1 B4/1 C5/2\nbaixo: C3/1 D3/1 E3/2 F3/1 G3/1 C3/2 C3/1 D3/1 Eb3/2 F3/1 G3/1 C3/2", "I V43 I6 ii6 V I i V43 i6 ii°6 V i", { rotulo: "A mesma frase em maior e depois em menor",
              perfil: { ...MIST },
              comentario: "Dois compassos em dó maior, os mesmos dois em dó menor: só mi → mi♭ no soprano e no baixo, e ii6 → ii°6. A frase termina na tônica menor — a mistura deixou de ser um acorde de passagem e passou a decidir o modo da cadência." }),
            ex("tom: C maior\nsoprano: E5/2 Eb5/2 Db5/2 C5/2 F5/2 D5/2 C5/4\nbaixo: C3/2 Ab2/2 Eb3/2 Ab2/2 F2/2 G2/2 C3/4", "I bVI=Ab:I V7 I vi=C:iv V7 I", { rotulo: "♭VI tonicizado: uma visita a lá♭ maior",
              perfil: { ...MIST },
              comentario: "O ♭VI é relido como I de lá♭ e recebe a própria dominante (mi♭7, com a 7ª ré♭ descendo a dó). A volta usa o fá menor, que é vi de lá♭ e iv emprestado de dó. Em dois compassos, o acorde de cor virou região." }),
          ] },
      ],
      exercicios: [
        { id: "emp1", titulo: "Completar: iv, ♭VI e iiø65 em ré maior", modo: "completar", perfil: { ...MIST }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 5 } },
          cifrasAluno: true, cifrasIniciais: "I IV iv I",
          instrucoes: "<p>Os dois primeiros compassos estão prontos (repare no si → si♭ do soprano: IV → iv). Cifre e complete o soprano dos c. 3–5: o si♭ do baixo no c. 3 é um empréstimo — qual acorde? E o sol que vem depois, antes do V7? Leve o ♭6 (si♭) a lá quando a harmonia voltar ao maior.</p>",
          texto: "tom: D maior\ncf: baixo\nsoprano: A4/2 B4/2 Bb4/2 A4/2\nbaixo: D3/2 G3/2 G3/2 D3/2 Bb2/2 G2/2 A2/4 D3/4", duracao: 2,
          solucao: "tom: D maior\ncf: baixo\nsoprano: A4/2 B4/2 Bb4/2 A4/2 D5/2 E5/2~ E5/2 C#5/2 D5/4\nbaixo: D3/2 G3/2 G3/2 D3/2 Bb2/2 G2/2 A2/4 D3/4",
          solucaoCifras: "I IV iv I bVI iiø65 V7 I",
          comentarioSolucao: "Si♭ no baixo = ♭VI (si♭–ré–fá); sol no baixo = iiø65 (mi–sol–si♭–ré), que mantém o si♭ e o leva implícito a lá no V7. O soprano sobe ao mi5, ligado sobre a barra, e cadencia por dó♯." },
        { id: "emp2", titulo: "Fá maior: baixo para uma melodia com ré♭", modo: "menos apoio", perfil: { ...MIST }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras para a melodia. O ré♭ é o ♭6 de fá maior: escolha acordes emprestados que o contenham e deixe-o descer a dó. Um baixo descendente (fá–ré–ré♭…) funciona bem; cuidado com a falsa relação entre um ré natural no soprano e um ré♭ no baixo.</p>",
          texto: "tom: F maior\ncf: soprano\nsoprano: C5/2 F5/2~ F5/2 Db5/2 C5/2 E5/2 F5/4\nbaixo:", duracao: 2,
          solucao: "tom: F maior\ncf: soprano\nsoprano: C5/2 F5/2~ F5/2 Db5/2 C5/2 E5/2 F5/4\nbaixo: F3/2 D3/2 Db3/2 Bb2/2 C3/2 C3/2 F2/4",
          solucaoCifras: "I vi bVI iv V V7 I",
          comentarioSolucao: "O baixo fá–ré–ré♭–si♭–dó: o vi vira ♭VI por um semitom no baixo, enquanto o fá5 do soprano fica parado (nota comum). O iv põe o ré♭ na melodia, e ele desce a dó sobre o V." },
        { id: "emp3", titulo: "Dois empréstimos no compasso 2", modo: "restrição", perfil: { ...MIST, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "emprestimo", compasso: 2 }, { tipo: "emprestimo", min: 2 }] }, cifrasAluno: true,
          instrucoes: "<p>O baixo é inteiramente diatônico. Escreva soprano e cifras com a <b>restrição</b>: os dois acordes do c. 2 são emprestados de sol menor, e a nota emprestada (mi♭) aparece no soprano e desce. Cadência I6/4–V7–I.</p>",
          texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/2 B2/2 C3/2 A2/2 D3/2 D3/2 G2/4", duracao: 2,
          solucao: "tom: G maior\ncf: baixo\nsoprano: B4/2 D5/2 Eb5/2 Eb5/2 D5/2 F#5/2 G5/4\nbaixo: G2/2 B2/2 C3/2 A2/2 D3/2 D3/2 G2/4",
          solucaoCifras: "I I6 iv iiø7 I64 V7 I",
          comentarioSolucao: "iv (dó–mi♭–sol) e iiø7 (lá–dó–mi♭–sol): o mi♭5 se repete sobre os dois e só desce a ré quando a harmonia volta ao maior (I6/4). Sobre o lá do baixo o mi♭ forma 5ª diminuta — a dissonância do iiø7 resolve na mesma descida." },
        { id: "emp4", titulo: "Livre: lá menor com terça de picardia", modo: "livre", perfil: { ...MIST, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "picardia", min: 1 }, { tipo: "secundaria", min: 1 }] }, cifrasAluno: true, alvoCompassos: 4,
          instrucoes: "<p>Componha soprano, baixo e cifras de uma frase de 4 compassos em lá menor que termine com o acorde de tônica <b>maior</b> (cifra I). Use também pelo menos um acorde secundário. Para a terça de picardia aparecer no par externo, o soprano pode tocar o dó♯ sobre o acorde final e só então descer à tônica.</p>",
          texto: "tom: A menor\nsoprano:\nbaixo:", duracao: 2,
          solucao: "tom: A menor\nsoprano: E5/1 D5/1 C5/2 F5/2 F#5/2 E5/2 D5/2 C#5/2 A4/2\nbaixo: A2/1 B2/1 C3/2 D3/2 D#3/2 E3/2 E3/2 A2/4",
          solucaoCifras: "i V43 i6 iv vii°7/V i64 V7 I",
          comentarioSolucao: "Troca de vozes no c. 1, vii°7/V com fá → fá♯ no soprano e ré → ré♯ no baixo (10ªs cromáticas), e no fim o dó♯ do soprano sobre o I: a sensível ré da 7ª do V7 desce a dó♯, a terça maior, e o soprano pousa no lá." },
        { id: "emp5", titulo: "Quebrar: do menor para o maior", modo: "quebrar", perfil: { ...MIST, sec_sexto_abaixado_desce: "info" }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 5 } },
          cifras: ["i", "iv", "IV", "V", "I6", "ii6", "V", "V7", "I"],
          instrucoes: "<p>A frase começa em dó menor (i, iv) e passa ao maior no c. 2 (IV). Escreva o soprano de modo que, na passagem iv → IV, o <b>lá♭ do soprano suba para lá natural</b> — a quebra da regra 'o ♭6 desce', como na volta ao maior de Schubert. A regra aparece como informação. Depois disso, fique no maior até a cadência.</p>",
          texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/2 F3/2 F3/2 G3/2 E3/2 F3/2 G3/2 G3/2 C3/4", duracao: 2,
          solucao: "tom: C maior\ncf: baixo\nsoprano: G5/2 Ab5/2 A5/2 G5/2 C5/2 D5/2 B4/2 D5/2 C5/4\nbaixo: C3/2 F3/2 F3/2 G3/2 E3/2 F3/2 G3/2 G3/2 C3/4",
          comentarioSolucao: "Sol–lá♭–lá–sol: o lá♭ sobe cromaticamente no momento em que o baixo repete o fá e a harmonia clareia. A subida é a quebra; o efeito é de luz entrando, não de erro, porque o maior se confirma logo depois." },
      ],
    });
  }

  // ================================================================ 4. Sexta napolitana
  {
    const P_IV = "tom: C menor\nsoprano: Eb5/1 D5/1 C5/2 C5/4 B4/4 C5/4\nbaixo: C3/1 D3/1 Eb3/2 F3/4 G3/4 C3/4";
    const P_N6V = "tom: C menor\nsoprano: Eb5/1 D5/1 C5/2 Db5/4 B4/4 C5/4\nbaixo: C3/1 D3/1 Eb3/2 F3/4 G3/4 C3/4";
    const P_N64 = "tom: C menor\nsoprano: Eb5/1 D5/1 C5/2 Db5/4 C5/2 B4/2 C5/4\nbaixo: C3/1 D3/1 Eb3/2 F3/4 G3/2 G3/2 C3/4";
    CAPITULOS.push({
      id: "napolitana", titulo: "A sexta napolitana",
      antes: [
        { p: "Em dó menor, quais são as notas da napolitana (N6)?", o: ["Fá–lá♭–ré♭ (ré♭ maior com fá no baixo)", "Ré–fá–lá♭", "Fá–lá–ré", "Ré♭–fá–lá"], e: "É a tríade maior sobre o 2º grau abaixado (ré♭–fá–lá♭), normalmente na 1ª inversão: fá no baixo, a mesma nota do baixo do iv. Ré–fá–lá♭ é o ii°." },
        { p: "Para onde vai o ré♭ da N6 em dó menor?", o: ["Desce: a dó (sobre o I6/4) ou direto a si (sobre o V)", "Sobe a ré natural", "Fica parado até o V", "Salta a sol"], e: "O ♭2 é uma 'sensível de cima': desce. O caminho mais suave é ré♭–dó–si (via I6/4 cadencial ou vii°7/V); o direto ré♭–si é uma 3ª diminuta, aceita na melodia como gesto expressivo." },
        { p: "Que nota se dobra na N6 a quatro vozes?", o: ["O baixo (a 3ª do acorde, o 4º grau)", "O ré♭", "O lá♭", "Nenhuma: omite-se a 5ª"], e: "Como no ii6 e no iv6, dobra-se o baixo (fá em dó menor), que é o 4º grau do tom. Dobrar o ré♭ criaria oitavas ao descer." },
      ],
      objetivo: "Usar a napolitana como pré-dominante em menor e em maior, chegando ao V pelo I6/4 cadencial, pelo vii°7/V ou pela 3ª diminuta na melodia.",
      ouvir: ["Beethoven, Sonata op. 27 nº 2 ('Ao luar'), 1º mov., c. 3: napolitana (ré maior) em dó♯ menor", "Beethoven, Sonata op. 57 ('Appassionata'), 1º mov., início: a frase de fá menor é repetida meio tom acima, em sol♭ maior"],
      esboco: "Em dó menor, troque o iv (fá–lá♭–dó) de uma cadência iv–V–i pela napolitana. Qual nota muda, e para onde ela tem de ir?",
      secoes: [
        { tipo: "texto", rotulo: "A regra", titulo: "O ♭II como pré-dominante", html: `
          <p>A <b>sexta napolitana</b> (N6, ♭II6) é a tríade maior sobre o 2º grau abaixado, quase sempre na 1ª inversão. O nome vem da associação com os compositores de ópera napolitanos do século XVIII, embora o acorde seja mais antigo. Funciona como um iv com a 5ª substituída pela 6ª menor: fá–lá♭–ré♭ em vez de fá–lá♭–dó.</p>
          <ul><li><b>Em menor</b> só uma nota é estranha (ré♭); em <b>maior</b> são duas (ré♭ e lá♭), e a N6 traz junto o empréstimo do menor.</li>
          <li><b>Baixo</b>: o 4º grau, como no iv6/ii6; sobe ao 5º (diretamente ou via vii°7/V: fá–fá♯–sol).</li>
          <li><b>Ré♭</b>: desce. Três caminhos: ré♭ → dó sobre o I6/4 cadencial, depois si sobre o V; ré♭ → dó sobre o vii°7/V; ou ré♭ → si direto sobre o V — a <b>3ª diminuta</b> melódica. Os manuais escolares a evitam ou a preenchem com a tônica (ré♭–dó–si); no repertório ela aparece na voz de cima como gesto patético. Nos exercícios ela é aceita só na voz de cima, do ♭2 para a sensível.</li>
          <li>Não ponha o ré♭ e o ré natural (do V7) em vozes diferentes em acordes seguidos: falsa relação.</li></ul>` },
        { tipo: "exemplo", titulo: "Do iv à napolitana", intro: "A mesma cadência em dó menor, três versões.",
          camadas: [
            ex(P_IV, "i V43 i6 iv V7 i", { titulo: "Com o iv",
              notas: [["decisao", "Troca de vozes i–V43–i6 e cadência iv–V7–i: o dó5 do soprano é a 5ª do iv e passa ao si4."]] }),
            ex(P_N6V, "i V43 i6 N6 V7 i", { titulo: "N6 → V7: a 3ª diminuta", anotacoes: [[0, 3, "♭2"], [0, 4, "3ª dim."]],
              notas: [["decisao", "Uma nota muda: dó5 → ré♭5. O baixo continua fá: é a 'sexta' da sexta napolitana (fá–ré♭)."],
                ["decisao", "O ré♭5 vai direto ao si4 sobre o V7: 3ª diminuta descendente, o intervalo mais característico da napolitana."],
                ["checagem", "O ré natural do V7 fica implícito numa voz interna, longe do ré♭ do soprano; no par externo não há falsa relação."]] }),
            ex(P_N64, "i V43 i6 N6 i64 V7 i", { titulo: "N6 → I6/4 → V7: o caminho escolar",
              notas: [["decisao", "O I6/4 cadencial preenche a 3ª diminuta: ré♭–dó–si. Mais suave e mais lento; a napolitana ganha um compasso inteiro e a cadência, um tempo de suspensão."],
                ["rejeitada", "Pensei em manter o ré♭ sobre o I6/4: ele não pertence ao acorde, e o choque ré♭/ré do V7 seguinte viraria falsa relação."]],
              pausa: ["Qual das duas versões (direta ou com I6/4) soa mais dramática, e por quê?", "A direta: o ré♭ e o si estão a uma 3ª diminuta, um intervalo 'quebrado' que concentra a tensão num único gesto. A versão com I6/4 dilui o mesmo caminho em graus conjuntos — é a escolha quando a cadência precisa respirar."] }),
          ] },
        { tipo: "contraste", titulo: "N6 → V × N6 → vii°7/V → V",
          a: { rotulo: "A — direto, com a 3ª diminuta", partitura: "tom: C menor\nsoprano: Eb5/2 Db5/2 B4/2 C5/2\nbaixo: C3/2 F3/2 G3/2 C3/2", cifras: cif("baixo: C3/2 F3/2 G3/2 C3/2", "i N6 V7 i") },
          b: { rotulo: "B — pelo vii°7/V, baixo cromático", partitura: "tom: C menor\nsoprano: Eb5/2 Db5/2 C5/1 B4/1 C5/2\nbaixo: C3/2 F3/2 F#3/1 G3/1 C3/2", cifras: cif("baixo: C3/2 F3/2 F#3/1 G3/1 C3/2", "i N6 vii°7/V V i") },
          pergunta: "Onde está o cromatismo em cada versão?",
          comentario: "<p>Em A ele está no salto do soprano (ré♭–si). Em B ele passa ao baixo (fá–fá♯–sol) e o soprano anda por graus (ré♭–dó–si): a napolitana desce ao vii°7/V, cuja sensível fá♯ sobe ao sol. B é mais 'falado', A mais abrupto; as duas são do repertório.</p>" },
        { tipo: "quebra", titulo: "A napolitana fora da 1ª inversão", html: `
          <p>Duas extensões do século XIX:</p>
          <ul><li><b>♭II em estado fundamental.</b> Com o ré♭ no baixo, a ida ao V obriga o baixo a um trítono (ré♭–sol), que a regra melódica proíbe. Os românticos aceitam o salto justamente pela aspereza: a napolitana deixa de ser inflexão da pré-dominante e vira um acorde com peso próprio.</li>
          <li><b>A região napolitana.</b> Na Appassionata (op. 57), Beethoven apresenta a frase inicial em fá menor e a repete meio tom acima, em sol♭ maior — o ♭II tratado como tom, com a sua própria dominante. Schoenberg chama isso de região napolitana. O retorno é fácil porque o I do tom napolitano é a própria napolitana do tom principal.</li></ul>`,
          exemplos: [
            ex("tom: C menor\nsoprano: Eb5/2 C5/2 Db5/2 B4/2 C5/4\nbaixo: C3/2 Ab2/2 Db3/2 G2/2 C3/4", "i VI N V7 i", { rotulo: "♭II em estado fundamental: o trítono no baixo",
              perfil: { ...NAP, sec_intervalo_melodico: "info" },
              comentario: "O baixo sobe lá♭–ré♭ e cai ré♭–sol, uma 5ª diminuta (a regra aparece como informação). O soprano, por sua vez, faz a 3ª diminuta ré♭–si: os dois cromatismos acontecem ao mesmo tempo." }),
            ex("tom: C menor\nsoprano: C5/1 Eb5/1 F5/2 Eb5/4 Db5/1 F5/1 Gb5/2 F5/2 Ab5/2 G5/2 D5/2 C5/4\nbaixo: C3/2 G2/2 C3/4 Db3/2 Ab2/2 Db3/2 F3/2 G3/4 C3/4", "i V7 i N=Db:I V7 I I6=c:N6 V7 i", { rotulo: "A frase repetida meio tom acima (à maneira da Appassionata)",
              perfil: { ...NAP },
              comentario: "i–V7–i em dó menor; depois o mesmo gesto em ré♭ maior (o ♭II virou I, com a sua dominante lá♭7). A volta: o I6 de ré♭ é a N6 de dó menor, que leva ao V7 e à tônica." }),
          ] },
      ],
      exercicios: [
        { id: "nap1", titulo: "Completar: N6 e I6/4 em ré menor", modo: "completar", perfil: { ...NAP }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true, cifrasIniciais: "i V43 i6",
          instrucoes: "<p>O baixo e o primeiro compasso estão prontos. No c. 2, sobre o sol do baixo, escreva a <b>napolitana</b> (mi♭ maior com sol no baixo) e leve o mi♭ do soprano a ré sobre o I6/4; feche com V7–i.</p>",
          texto: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5/1 D5/2\nbaixo: D3/1 E3/1 F3/2 G3/4 A3/2 A2/2 D3/4", duracao: 2,
          solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5/1 D5/2 Bb4/2 Eb5/2 D5/2 C#5/2 D5/4\nbaixo: D3/1 E3/1 F3/2 G3/4 A3/2 A2/2 D3/4",
          solucaoCifras: "i V43 i6 N6 i64 V7 i",
          comentarioSolucao: "Si♭4 e depois mi♭5 sobre a N6 (o si♭ antes evita oitavas diretas com o baixo); o mi♭ desce a ré sobre o I6/4, que desce a dó♯ sobre o V7." },
        { id: "nap2", titulo: "Napolitana em sol maior", modo: "restrição", perfil: { ...NAP, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 5 }, pedidos: [{ tipo: "napolitana", compasso: 3 }] }, cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras para a melodia. <b>Restrição:</b> napolitana no c. 3. Em maior ela traz duas notas do menor (lá♭ e mi♭ em sol): ambas estão na melodia. Leve o lá♭ à tônica sobre o I6/4.</p>",
          texto: "tom: G maior\ncf: soprano\nsoprano: B4/2 D5/2 E5/2 C5/2 Eb5/2 Ab4/2 G4/2 F#4/2 G4/4\nbaixo:", duracao: 2,
          solucao: "tom: G maior\ncf: soprano\nsoprano: B4/2 D5/2 E5/2 C5/2 Eb5/2 Ab4/2 G4/2 F#4/2 G4/4\nbaixo: G2/2 B2/2 C3/2 A2/2 C3/4 D3/2 D3/2 G2/4",
          solucaoCifras: "I I6 IV ii N6 I64 V7 I",
          comentarioSolucao: "Dó no baixo sustenta a N6 (lá♭–dó–mi♭) por um compasso inteiro: o soprano arpeja mi♭–lá♭ e o lá♭ cai em sol sobre o I6/4. O mi natural do c. 2 e o mi♭ do c. 3 estão na mesma voz, sem falsa relação." },
        { id: "nap3", titulo: "Quebrar: ♭II em estado fundamental", modo: "quebrar", perfil: { ...NAP, sec_intervalo_melodico: "info", sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "napolitana_fundamental", compasso: 3 }] }, cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras para a melodia em lá menor. No c. 3, use a napolitana <b>em estado fundamental</b> (si♭ no baixo, cifra N) e vá direto ao V7: o baixo fará o trítono si♭–mi, a quebra da regra melódica (aparece como informação). O soprano faz, ao mesmo tempo, a 3ª diminuta si♭–sol♯.</p>",
          texto: "tom: A menor\ncf: soprano\nsoprano: C5/2 E5/2 F5/2 C5/2 Bb4/2 G#4/2 A4/4\nbaixo:", duracao: 2,
          solucao: "tom: A menor\ncf: soprano\nsoprano: C5/2 E5/2 F5/2 C5/2 Bb4/2 G#4/2 A4/4\nbaixo: A2/2 C3/2 D3/2 F3/2 Bb2/2 E3/2 A2/4",
          solucaoCifras: "i i6 iv VI N V7 i",
          comentarioSolucao: "Si♭2 → mi3: 4ª aumentada no baixo, contra si♭4 → sol♯4 no soprano. A napolitana em estado fundamental soa mais pesada e menos 'de passagem' que a N6 — por isso os românticos a reservam para momentos de crise." },
      ],
    });
  }

  for (const c of CAPITULOS) T.inserir(4, c);
  if (typeof module === "object" && module.exports) module.exports = { CROM, MIST, NAP };
})(this);
