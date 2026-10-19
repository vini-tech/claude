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
      objetivo: "Usar V/x e V7/x para dar direção a um grau diatônico, com a nota alterada como sensível e sem falsa relação.",
      ouvir: ["Beethoven, Sinfonia nº 1, início (V7/IV → IV)", "Bach, Prelúdio em dó BWV 846 (V/V)", "Corais de Bach: V/V e V/vi em cadências internas"],
      esboco: "Sobre o baixo dó–mi–fá–sol–dó (dó maior), troque um acorde por uma dominante secundária. Que nota você altera, e para onde ela vai?",
      secoes: [
        { tipo: "texto", rotulo: "A regra", titulo: "A dominante emprestada de um grau", html: `
          <p>Toda tríade <b>maior ou menor</b> do tom pode ter a sua dominante (maior, com ou sem 7ª menor, uma 5ª acima). Notação <b>V/x</b> (Piston, 1941); <i>Zwischendominante</i>; tonicização (Schenker).</p>
          <table class="tabela-modos"><thead><tr><th>Alvo</th><th>Em dó maior</th><th>Nota alterada</th><th>Em lá menor</th><th>Nota alterada</th></tr></thead><tbody>
          <tr><td>ii / ii°</td><td>V/ii = lá–dó♯–mi(–sol)</td><td>dó♯</td><td>— (ii° é diminuto)</td><td></td></tr>
          <tr><td>iii / III</td><td>V/iii = si–ré♯–fá♯(–lá)</td><td>ré♯, fá♯</td><td>V/III = sol–si–ré(–fá)</td><td>nenhuma (é o VII)</td></tr>
          <tr><td>IV / iv</td><td>V7/IV = dó–mi–sol–si♭</td><td>si♭ (a 7ª)</td><td>V/iv = lá–dó♯–mi(–sol)</td><td>dó♯</td></tr>
          <tr><td>V</td><td>V/V = ré–fá♯–lá(–dó)</td><td>fá♯</td><td>V/V = si–ré♯–fá♯(–lá)</td><td>ré♯</td></tr>
          <tr><td>vi / VI</td><td>V/vi = mi–sol♯–si(–ré)</td><td>sol♯</td><td>V/VI = dó–mi–sol(–si♭)</td><td>si♭ (a 7ª)</td></tr>
          <tr><td>vii° / VII</td><td>— (vii° é diminuto)</td><td></td><td>V/VII = ré–fá♯–lá(–dó)</td><td>fá♯</td></tr>
          </tbody></table>
          <h3>Condução das vozes</h3>
          <table class="tabela-modos"><thead><tr><th>Nota / caso</th><th>Tratamento</th></tr></thead><tbody>
          <tr><td>Nota elevada (sensível do alvo)</td><td>Sobe meio tom (fá♯ → sol); nunca dobrada</td></tr>
          <tr><td>7ª do V7/x</td><td>Desce por grau</td></tr>
          <tr><td>Cromatismo</td><td>Na mesma voz (fá → fá♯ → sol); em vozes diferentes = falsa relação</td></tr>
          <tr><td>Sensível no par externo</td><td>No baixo (V6/x, V65/x) ou no soprano, nunca nos dois</td></tr>
          <tr><td>Alvo</td><td>Qualquer inversão; V/V e vii°7/V também vão ao I6/4 cadencial</td></tr>
          </tbody></table>
          <table class="tabela-modos"><thead><tr><th></th><th>Tonicização</th><th>Modulação</th></tr></thead><tbody>
          <tr><td>Centro</td><td>O mesmo; o grau soa tônica por um instante</td><td>Novo, confirmado por cadência</td></tr>
          <tr><td>Exemplo</td><td>V/x → x</td><td>Ver capítulo de modulação</td></tr>
          </tbody></table>
          <p>Regras novas: sensível secundária sobe, 7ª desce, acorde vai ao alvo, falsa relação; semitom cromático na mesma voz é aceito.</p>` },
        { tipo: "exemplo", titulo: "Duas tonicizações numa frase de quatro compassos", intro: "Par externo e cifras; as vozes internas ficam implícitas, como num baixo cifrado.",
          camadas: [
            ex(P_DIAT, "I I6 IV ii7 V V7 I", { titulo: "A frase diatônica",
              notas: [["decisao", "Baixo sobe ao IV e cai ao V; soprano desce em graus de mi5 a lá4."],
                ["checagem", "Correto, mas nada puxa: I6 e ii7 só preenchem."]] }),
            ex(P_CROM, "I V65/IV IV V65/V V V7 I", { titulo: "Duas sensíveis emprestadas", anotacoes: [[0, 3, "7ª de V7/IV ↓"], [1, 1, "sensível de fá ↑"], [1, 3, "sensível de sol ↑"]],
              notas: [["decisao", "C. 1: I6 → V65/IV. Mi do baixo (sensível) sobe a fá; si♭ do soprano (7ª) desce a lá."],
                ["decisao", "C. 2: ii7 → V65/V. Baixo fá–fá♯–sol numa voz só; dó5 (7ª) desce a si4."],
                ["rejeitada", "V/V com ré no baixo: o fá♯ iria ao soprano logo após o fá do baixo — falsa relação."]],
              pausa: ["Por que o V65/IV cabe logo depois do I?", "Basta somar si♭ ao I: a tônica ganha 7ª e aponta para o IV (Beethoven, Sinfonia nº 1)."] }),
          ] },
        { tipo: "contraste", titulo: "Falsa relação × cromatismo numa voz",
          a: { rotulo: "A — fá no soprano, fá♯ no baixo", partitura: "tom: C maior\nsoprano: E5/2 F5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 A2/2 F#2/2 G2/2 C3/4", cifras: cif("baixo: C3/2 A2/2 F#2/2 G2/2 C3/4", "I IV6 V65/V V I"), perfil: { ...CROM, sec_falsa_relacao: "info" } },
          b: { rotulo: "B — fá → fá♯ → sol no baixo", partitura: "tom: C maior\nsoprano: E5/2 C5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 F3/2 F#3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 F#3/2 G3/2 C3/4", "I IV V65/V V I") },
          pergunta: "Os acordes são quase os mesmos. Onde está o choque em A, e por que B soa como uma linha?",
          comentario: "<p>A: fá5 no soprano e logo fá♯2 no baixo — as duas versões em vozes diferentes soam como choque. B: fá → fá♯ → sol na mesma voz; o cromatismo vira melodia.</p>" },
        { tipo: "quebra", titulo: "Quando a dominante secundária não resolve como manda a regra", html: `
          <table class="tabela-modos"><thead><tr><th>Desvio</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
          <tr><td>Engano secundário (V7/vi → IV)</td><td>O alvo; a sensível ainda sobe, o baixo sobe por grau</td><td>O IV soa como chegada</td></tr>
          <tr><td>Cadeia de dominantes (mi7–lá7–ré7–sol7–dó)</td><td>A sensível desce e vira a 7ª da seguinte</td><td>Motor das sequências por 5ªs; adia a tônica</td></tr>
          </tbody></table>
          <p>Perde-se a confirmação do alvo; ganha-se impulso.</p>`,
          exemplos: [
            ex("tom: C maior\nsoprano: C5/2 B4/1 G#4/1 G4/2 F#4/2 F4/2 E4/2\nbaixo: C3/2 E3/2 A2/2 D3/2 G2/2 C3/2", "I V7/vi V7/ii V7/V V7 I", { rotulo: "Cadeia mi7–lá7–ré7–sol7–dó: a sensível desce e vira 7ª",
              perfil: { ...CROM, sec_sensivel_sobe: "info" }, contexto: { plano: {} },
              comentario: "Soprano sol♯–sol–fá♯–fá–mi: cada sensível cai meio tom e vira a 7ª seguinte, que desce por grau. 'Sensível sobe' fica como informação." }),
            ex("tom: C maior\nsoprano: E5/2 D5/2 C5/2 B4/1 D5/1 C5/4\nbaixo: C3/2 E3/2 F3/2 G3/2 C3/4", "I V7/vi IV V I", { rotulo: "V7/vi → IV: o engano secundário",
              perfil: { ...CROM, sec_resolve_no_alvo: "info" },
              comentario: "Mi7 promete lá menor; o baixo sobe mi–fá e chega o IV, com peso de chegada. A 7ª (ré) desce a dó." }),
          ] },
      ],
      exercicios: [
        { id: "sec1", titulo: "Completar: V/ii e V/V em sol maior", modo: "completar", perfil: { ...CROM }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true, cifrasIniciais: "I V65/ii ii",
          instrucoes: "<p>Cifre o resto (o dó♯ é sensível de quê?) e complete o soprano até I6/4–V7–I. Evite falsa relação entre dó do soprano e dó♯ do baixo.</p>",
          texto: "tom: G maior\ncf: baixo\nsoprano: B4/1 C5/1 D5/2 C5/1 D5/1\nbaixo: G2/2 G#2/2 A2/2 C#3/2 D3/2 D3/2 G2/4", duracao: 1,
          solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 C5/1 D5/2 C5/1 D5/1 E5/2 G5/2 F#5/2 G5/4\nbaixo: G2/2 G#2/2 A2/2 C#3/2 D3/2 D3/2 G2/4",
          solucaoCifras: "I V65/ii ii V65/V I64 V7 I",
          comentarioSolucao: "Dó♯ = sensível de ré: V65/V → I6/4. O soprano deixa o dó um tempo antes (dó–ré–mi), sem falsa relação." },
        { id: "sec2", titulo: "Ré menor: V/iv e V7/III", modo: "menos apoio", perfil: { ...CROM }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 5 } },
          cifrasAluno: true,
          instrucoes: "<p>Escreva soprano e cifras. Fá♯ (c. 1) e dó (c. 2) pedem dominantes secundárias: de quais graus? Em menor, III e iv são tonicizáveis; ii° não.</p>",
          texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/2 F#2/2 G2/2 C3/2 F2/2 G2/2 A2/2 A2/2 D3/4", duracao: 1,
          solucao: "tom: D menor\ncf: baixo\nsoprano: A4/4 Bb4/1 D5/1 E5/2 F5/2 E5/2 D5/2 C#5/2 D5/4\nbaixo: D3/2 F#2/2 G2/2 C3/2 F2/2 G2/2 A2/2 A2/2 D3/4",
          solucaoCifras: "i V6/iv iv V7/III III iiø65 i64 V7 i",
          comentarioSolucao: "Fá♯ = V6/iv (sobe a sol); dó sob mi = V7/III, e o mi sobe a fá no clímax (c. 3). O lá4 do c. 1 é nota comum entre i e V6/iv." },
        { id: "sec3", titulo: "Três dominantes secundárias sob uma melodia", modo: "restrição", perfil: { ...CROM, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 5 }, pedidos: [{ tipo: "secundaria", min: 3 }] }, cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras. <b>Restrição:</b> ≥ 3 acordes secundários. Pistas: mi♭ e fá♯ da melodia.</p>",
          texto: "tom: F maior\ncf: soprano\nsoprano: C5/2 Eb5/2 D5/2 F#5/2 G5/2 F5/2 E5/2 G5/2 F5/4\nbaixo:", duracao: 2,
          solucao: "tom: F maior\ncf: soprano\nsoprano: C5/2 Eb5/2 D5/2 F#5/2 G5/2 F5/2 E5/2 G5/2 F5/4\nbaixo: F2/2 A2/2 Bb2/2 A2/2 G2/2 B2/2 C3/2 C3/2 F2/4",
          solucaoCifras: "I V65/IV IV V43/ii ii V65/V V V7 I",
          comentarioSolucao: "Mi♭ = 7ª de V65/IV (lá no baixo); fá♯ = sensível de sol (V43/ii); fá sobre si♮ = 7ª de V65/V, desce a mi. Baixo quase todo por grau." },
        { id: "sec4", titulo: "Livre: frase em mi menor com duas tonicizações", modo: "livre", perfil: { ...CROM, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 5 }, pedidos: [{ tipo: "secundaria", min: 2 }] }, cifrasAluno: true, alvoCompassos: 5,
          instrucoes: "<p>Frase de 5 compassos: soprano, baixo e cifras. ≥ 2 dominantes secundárias de graus diferentes, um cromatismo numa voz só (sol → sol♯ → lá), cadência perfeita.</p>",
          texto: "tom: E menor\nsoprano:\nbaixo:", duracao: 2,
          solucao: "tom: E menor\nsoprano: B4/1 G4/1 G#4/2 A4/1 C5/1 C5/2 B4/1 D5/1 E5/1 G5/1 E5/2 D#5/2 E5/4\nbaixo: E3/2 E3/2 A2/2 D3/2 G2/2 C3/2 C#3/2 B2/2 E3/4",
          solucaoCifras: "i V7/iv iv V7/III III VI V43/V V i",
          comentarioSolucao: "Toniciza iv (sol–sol♯–lá no soprano), III (7ª dó → si) e V (dó–dó♯–si no baixo: VI → V43/V). Clímax sol5 no c. 3." },
        { id: "sec5", titulo: "Quebrar: cadeia de dominantes em sol maior", modo: "quebrar", perfil: { ...CROM, sec_sensivel_sobe: "info" }, nivel: 6, contexto: { nivel: 6, plano: {} },
          cifras: ["I", "V7/vi", "V7/ii", "V7/V", "V7", "I"],
          instrucoes: "<p>Cadeia si7–mi7–lá7–ré7–sol. Escreva o soprano: <b>cada sensível desce meio tom e vira a 7ª seguinte</b> (ré♯ → ré, dó♯ → dó); a 7ª continua descendo.</p>",
          texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/2 B2/2 E3/2 A2/2 D3/4 G2/4", duracao: 2,
          solucao: "tom: G maior\ncf: baixo\nsoprano: D5/2 D#5/2 D5/2 C#5/2 C5/4 B4/4\nbaixo: G2/2 B2/2 E3/2 A2/2 D3/4 G2/4",
          comentarioSolucao: "Ré–ré♯–ré–dó♯–dó–si: escala cromática em que cada nota é 3ª de um acorde e 7ª do seguinte. Fecha com o 3º grau no soprano." },
      ],
    });
  }

  // ================================================================ 2. Sensíveis secundárias e cadeias
  {
    const P_DIAT = "tom: C maior\nsoprano: G5/2 F5/2 G5/1 A5/3 E5/2 D5/2 C5/4\nbaixo: C3/2 D3/2 E3/1 F3/3 G3/2 G3/2 C3/4";
    const P_DIM = "tom: C maior\nsoprano: G5/2 F5/1 F#5/1 G5/1 A5/3 E5/2 D5/2 C5/4\nbaixo: C3/1 C#3 D3 D#3 E3/1 F3/1 F#3/2 G3/2 G3/2 C3/4";
    CAPITULOS.push({
      id: "secundarias2", titulo: "Sensíveis secundárias e cadeias",
      objetivo: "Usar vii°7/x e viiø7/x e encadear dominantes por 5ªs, sabendo quando a resolução é elidida.",
      ouvir: ["Bach, Prelúdio em dó BWV 846 (7ªs diminutas)", "Vivaldi, L'estro armonico op. 3 (sequências por 5ªs)", "Chopin, Prelúdio op. 28 nº 4 (acordes deslizando)"],
      esboco: "Baixo dó–dó♯–ré–ré♯–mi em dó maior: que acorde vai sobre cada nota alterada, e por que não um V/x em estado fundamental?",
      secoes: [
        { tipo: "texto", rotulo: "A regra", titulo: "A sensível de cada grau", html: `
          <p>Cada V/x tem o seu acorde de sensível, sobre a <b>sensível do alvo</b>. É um V9 sem fundamental: vii°7/ii = dó♯–mi–sol–si♭ = lá7(♭9) sem lá.</p>
          <table class="tabela-modos"><thead><tr><th>Acorde</th><th>Construção</th><th>Uso</th></tr></thead><tbody>
          <tr><td><b>vii°7/x</b></td><td>sensível do alvo + 3ª m + 5ª d + 7ª d</td><td>antes de qualquer alvo, maior ou menor (a 7ª diminuta vem do menor do alvo)</td></tr>
          <tr><td><b>viiø7/x</b></td><td>sensível do alvo + 3ª m + 5ª d + 7ª m</td><td>só antes de alvo maior: viiø7/V, viiø7/IV</td></tr>
          <tr><td><b>vii°6/x</b></td><td>tríade diminuta na 1ª inversão</td><td>passagem, mais leve que o 7ª diminuta</td></tr>
          </tbody></table>
          <h3>Condução</h3>
          <table class="tabela-modos"><thead><tr><th>Nota / caso</th><th>Tratamento</th></tr></thead><tbody>
          <tr><td>Fundamental (sensível do alvo)</td><td>Sobe meio tom</td></tr>
          <tr><td>7ª</td><td>Desce por grau</td></tr>
          <tr><td>5ª diminuta</td><td>Tende a descer</td></tr>
          <tr><td>vii°7/V → I6/4 (maior)</td><td>A 7ª (mi♭) pode subir a mi, 6ª do I6/4</td></tr>
          <tr><td>Inversões no baixo</td><td>Baixo cromático ascendente: dó–dó♯–ré–ré♯–mi…</td></tr>
          </tbody></table>
          <h3>Cadeias de dominantes</h3>
          <ul><li>V/V/V = V/ii; encadeadas por 5ªs: mi7–lá7–ré7–sol7–dó (sequência barroca).</li>
          <li>Cada 7ª desce; a cadeia termina num alvo diatônico estável.</li>
          <li>Tonicização estendida (ii–V–I do alvo) só vira modulação com cadência no tom novo.</li></ul>` },
        { tipo: "exemplo", titulo: "Uma escada de sensíveis", intro: "Baixo cromático ascendente: uma sensível diminuta antes de cada grau.",
          camadas: [
            ex(P_DIAT, "I ii iii IV I64 V7 I", { titulo: "O esqueleto diatônico",
              notas: [["decisao", "Baixo sobe em graus até sol; soprano em arco, em 10ªs e 6ªs."],
                ["checagem", "Correto e plano: nenhum grau é preparado."]] }),
            ex(P_DIM, "I vii°7/ii ii vii°7/iii iii IV vii°7/V I64 V7 I", { titulo: "Uma sensível diminuta antes de ii, iii e V", anotacoes: [[1, 1, "dó♯ ↑"], [1, 3, "ré♯ ↑"], [1, 6, "fá♯ ↑"]],
              notas: [["decisao", "Dó♯, ré♯, fá♯ no baixo: sensíveis de ii, iii e V, cada uma sobe meio tom."],
                ["decisao", "Soprano fá–fá♯–sol sobre ré–ré♯–mi: 10ªs cromáticas (fá♯ é 3ª do vii°7/iii)."],
                ["rejeitada", "V65/ii, V65/iii, V65/V: funcionam, mas soariam como três cadências."]],
              pausa: ["O baixo sobe sete semitons. Por que o tom não se perde?", "Cada nota cromática resolve logo (dó♯ → ré, ré♯ → mi): soa escala diatônica com sensíveis de passagem, e I6/4–V7–I confirma dó."] }),
          ] },
        { tipo: "contraste", titulo: "V65/V × vii°7/V",
          a: { rotulo: "A — V65/V (ré–fá♯–lá–dó)", partitura: "tom: C maior\nsoprano: E5/2 C5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 F3/2 F#3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 F#3/2 G3/2 C3/4", "I IV V65/V V I") },
          b: { rotulo: "B — vii°7/V (fá♯–lá–dó–mi♭)", partitura: "tom: C maior\nsoprano: E5/2 C5/2 Eb5/2 D5/2 C5/4\nbaixo: C3/2 F3/2 F#3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 F#3/2 G3/2 C3/4", "I IV vii°7/V V I") },
          pergunta: "O baixo é o mesmo. O que o mi♭ de B acrescenta?",
          comentario: "<p>A: a 7ª (dó) desce a si; o V chega claro. B: o mi♭ (9ª menor de ré7) desce a ré — duas vozes chegam ao V por semitom (fá♯ → sol, mi♭ → ré). Mais tenso e escuro: uma nota do menor no maior, como no empréstimo modal.</p>" },
        { tipo: "quebra", titulo: "Cadeias cromáticas e resoluções elididas", html: `
          <table class="tabela-modos"><thead><tr><th>Prática (séc. XIX)</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
          <tr><td>7ªs diminutas descendo por semitom (Chopin, op. 28 nº 4; Liszt)</td><td>Nenhum vii°7/x vai ao alvo</td><td>Tensão suspensa até a cadência</td></tr>
          <tr><td>Dominantes invertidas, baixo cromático (mi7/ré–lá7/dó♯–ré7/dó…)</td><td>Alvos elididos; a sensível desce e vira 7ª</td><td>A 7ª que desce dá a direção</td></tr>
          </tbody></table>
          <p>Só há três 7ªs diminutas: uma sempre está a meio tom de outra.</p>`,
          exemplos: [
            ex("tom: C maior\nsoprano: E5/2 D5/2 G5/2 F#5/2 F5/4 E5/2 D5/2 C5/4\nbaixo: C3/2 B2/2 Bb2/2 A2/2 Ab2/4 G2/2 G2/2 C3/4", "I vii°7 vii°42/ii vii°65/V vii°42 I64 V7 I", { rotulo: "7ªs diminutas descendo por semitom",
              perfil: { ...CROM, sec_resolve_no_alvo: "info" },
              comentario: "Baixo cromático de si a sol, soprano em 6ªs. Nenhum vii°7/x vai ao alvo (informação); só o último resolve, no I6/4." }),
            ex("tom: C maior\nsoprano: E5/1 C5/1 B4/2 A4/4 G4/2 E5/2 F5/2 D5/2 C5/4\nbaixo: C3/2 D3/2 C#3/2 C3/2 B2/2 C3/2 D3/2 G3/2 C3/4", "I V42/vi V65/ii V42/V V65 I ii V7 I", { rotulo: "Dominantes em inversão: baixo ré–dó♯–dó–si–dó",
              perfil: { ...CROM, sec_sensivel_sobe: "info" },
              comentario: "Cada 7ª do baixo desce por grau; dó♯ desce a dó porque ré chega já como ré7. O soprano segura lá4 como nota comum." }),
          ] },
      ],
      exercicios: [
        { id: "sec2a", titulo: "Completar: vii°7/ii e vii°7/V em ré maior", modo: "completar", perfil: { ...CROM }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true, cifrasIniciais: "I vii°7/ii",
          instrucoes: "<p>Cifre o resto (sol♯ do c. 2 é sensível de quê?) e complete o soprano até I6/4–V7–I. Evite sol♮ no soprano antes do sol♯ do baixo.</p>",
          texto: "tom: D maior\ncf: baixo\nsoprano: F#5/2 A5/2\nbaixo: D3/2 D#3/2 E3/2 G#3/2 A3/2 A2/2 D3/4", duracao: 2,
          solucao: "tom: D maior\ncf: baixo\nsoprano: F#5/2 A5/2 B5/4 F#5/2 E5/2 D5/4\nbaixo: D3/2 D#3/2 E3/2 G#3/2 A3/2 A2/2 D3/4",
          solucaoCifras: "I vii°7/ii ii vii°7/V I64 V7 I",
          comentarioSolucao: "Sol♯ = sensível de lá: vii°7/V → I6/4. O si5 é nota comum entre ii e sol♯°7; o soprano não toca sol♮." },
        { id: "sec2b", titulo: "Sol menor: sensíveis de iv e de V", modo: "menos apoio", perfil: { ...CROM }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras com sensíveis secundárias onde couber. Dica: si♮ antes de dó, dó♯ antes de ré, no baixo.</p>",
          texto: "tom: G menor\ncf: soprano\nsoprano: D5/2 F5/2 Eb5/2 E5/2 D5/2 F#5/2 G5/4\nbaixo:", duracao: 2,
          solucao: "tom: G menor\ncf: soprano\nsoprano: D5/2 F5/2 Eb5/2 E5/2 D5/2 F#5/2 G5/4\nbaixo: G2/2 B2/2 C3/2 C#3/2 D3/2 D3/2 G2/4",
          solucaoCifras: "i vii°7/iv iv vii°7/V V V7 i",
          comentarioSolucao: "Baixo sol–si–dó–dó♯–ré: duas sensíveis sobem. Fá5 (5ª dim. do si°7) desce a mi♭; mi♭–mi♮ em 10ªs com dó–dó♯." },
        { id: "sec2c", titulo: "Cadeia de três dominantes em lá maior", modo: "restrição", perfil: { ...CROM, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "cadeia", min: 3 }] }, cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras. <b>Restrição:</b> cadeia de ≥ 3 dominantes secundárias por 5ªs (V7/vi → V7/ii → V7/V…). Inversões para o baixo andar por grau; sensíveis do baixo sobem.</p>",
          texto: "tom: A maior\ncf: soprano\nsoprano: E5/2 E#5/2 F#5/2 F#5/2 G#5/2 B5/2 A5/4\nbaixo:", duracao: 2,
          solucao: "tom: A maior\ncf: soprano\nsoprano: E5/2 E#5/2 F#5/2 F#5/2 G#5/2 B5/2 A5/4\nbaixo: A2/2 C#3/2 A#2/2 B2/2 E3/4 A2/4",
          solucaoCifras: "I V7/vi V65/ii V7/V V7 I",
          comentarioSolucao: "Dó♯7 → fá♯7/lá♯ → si7 → mi7 → lá. Mi♯ (soprano) e lá♯ (baixo) sobem: sensíveis nas vozes que vão às fundamentais." },
        { id: "sec2d", titulo: "Livre: duas sensíveis secundárias em si♭ maior", modo: "livre", perfil: { ...CROM, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "sensivel", min: 2 }] }, cifrasAluno: true, alvoCompassos: 4,
          instrucoes: "<p>Frase de 4 compassos (soprano, baixo, cifras) com ≥ 2 sensíveis secundárias, uma delas o <b>viiø7/V</b> (mi–sol–si♭–ré). Cadência perfeita.</p>",
          texto: "tom: Bb maior\nsoprano:\nbaixo:", duracao: 2,
          solucao: "tom: Bb maior\nsoprano: F5/2 Ab5/2 G5/4 Bb5/2 A5/2 Bb5/4\nbaixo: Bb2/2 B2/2 C3/2 E3/2 F3/2 F3/2 Bb2/4",
          solucaoCifras: "I vii°7/ii ii viiø7/V I64 V7 I",
          comentarioSolucao: "Si♮ (vii°7/ii) e mi♮ (viiø7/V) no baixo sobem. Lá♭5 (7ª dim.) desce a sol; sol5 fica (3ª do miø7). Sem mi♭/si♭ antes no soprano." },
        { id: "sec2e", titulo: "Quebrar: 7ªs diminutas descendo em sol maior", modo: "quebrar", perfil: { ...CROM, sec_resolve_no_alvo: "info" }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifras: ["I", "vii°7", "vii°42/ii", "vii°65/V", "vii°42", "I64", "V7", "I"],
          instrucoes: "<p>Baixo cromático sob 7ªs diminutas que não resolvem. Escreva o soprano descendo em 6ªs (ou 3ªs m) com o baixo até a cadência.</p>",
          texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G3/2 F#3/2 F3/1 E3/1 Eb3/2 D3/2 D3/2 G2/4", duracao: 2,
          solucao: "tom: G maior\ncf: baixo\nsoprano: D5/2 Eb5/2 D5/1 C#5/1 C5/2 B4/2 A4/2 G4/4\nbaixo: G3/2 F#3/2 F3/1 E3/1 Eb3/2 D3/2 D3/2 G2/4",
          comentarioSolucao: "Mi♭5 (7ª do fá♯°7) desce a ré; depois ré–dó♯–dó–si em 6ªs com o baixo. Nenhum alvo resolvido; I6/4–V7–I explica tudo." },
      ],
    });
  }

  // ================================================================ 3. Empréstimo modal
  {
    const P_MAIOR = "tom: C maior\nsoprano: E5/2 A5/2 A5/2 G5/2 F5/2 D5/2 C5/4\nbaixo: C3/2 F3/2 F3/2 C3/2 F3/2 G3/2 C3/4";
    const P_MIST = "tom: C maior\nsoprano: E5/2 A5/2 Ab5/2 G5/2 F5/2 D5/2 C5/4\nbaixo: C3/2 F3/2 F3/2 C3/2 F3/2 G3/2 C3/4";
    CAPITULOS.push({
      id: "emprestimo", titulo: "Empréstimo modal",
      objetivo: "Escurecer o maior com acordes do menor homônimo, mantendo a função e levando as notas abaixadas para baixo.",
      ouvir: ["Brahms, Sinfonia nº 3 (mote fá–lá♭–fá)", "Schubert, Sonata D. 960, 1º mov. (♭VI)", "Corais de Bach em menor (terça de picardia)"],
      esboco: "Toque I–IV–I e depois I–iv–I em dó maior. Que nota muda, e em que voz você a poria?",
      secoes: [
        { tipo: "texto", rotulo: "A regra", titulo: "Notas do menor dentro do maior", html: `
          <p><b>Empréstimo modal</b> (mistura): acordes do menor homônimo no maior. Muda a cor, <b>não a função</b>.</p>
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
          <ul><li>Notas abaixadas <b>descem</b>: lá♭ → sol (a mais forte), mi♭ → ré, si♭ → lá.</li>
          <li>Natural → abaixada <b>na mesma voz</b> (lá–lá♭–sol); em vozes diferentes, falsa relação.</li>
          <li>Diatônico antes, emprestado depois (IV → iv).</li></ul>` },
        { tipo: "exemplo", titulo: "Escurecer a pré-dominante", intro: "A mesma frase em dó maior, primeiro pura, depois com iv e iiø65.",
          camadas: [
            ex(P_MAIOR, "I IV IV I ii65 V7 I", { titulo: "Dó maior puro",
              notas: [["decisao", "I–IV–I e ii65–V7–I; soprano sobe a lá5 e desce em graus."],
                ["checagem", "O lá5 repetido sobre o IV é a nota a trocar."]] }),
            ex(P_MIST, "I IV iv I iiø65 V7 I", { titulo: "iv e iiø65 emprestados", anotacoes: [[0, 2, "♭6 ↓"]],
              notas: [["decisao", "IV → iv: soprano lá–lá♭–sol numa voz; o ♭6 cai no 5º grau."],
                ["decisao", "ii65 → iiø65: lá♭ implícito numa voz interna, desce a sol no V7."],
                ["rejeitada", "Lá♭ também no soprano do c. 3: sol–lá♭–sol duas vezes gasta a cor."]],
              pausa: ["Por que IV antes de iv, e não o contrário?", "Sem o lá♮ antes, o lá♭ não soa como escurecimento; e em iv → IV o lá♭ subiria, soando como correção."] }),
          ] },
        { tipo: "contraste", titulo: "Engano diatônico × engano emprestado",
          a: { rotulo: "A — V → vi", partitura: "tom: C maior\nsoprano: E5/2 D5/2 B4/2 C5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 F3/2 G3/2 A3/2 F3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 G3/2 A3/2 F3/2 G3/2 C3/4", "I ii6 V vi ii65 V7 I") },
          b: { rotulo: "B — V → ♭VI", partitura: "tom: C maior\nsoprano: E5/2 D5/2 B4/2 C5/2 C5/2 B4/2 C5/4\nbaixo: C3/2 F3/2 G3/2 Ab3/2 F3/2 G3/2 C3/4", cifras: cif("baixo: C3/2 F3/2 G3/2 Ab3/2 F3/2 G3/2 C3/4", "I ii6 V bVI iiø65 V7 I") },
          pergunta: "As duas cadências de engano têm a mesma melodia. O que muda com o lá♭ no baixo?",
          comentario: "<p>A: engano suave (baixo sobe um tom, vi tem notas comuns com o I). B: baixo sobe meio tom a um acorde maior estranho ao tom — porta para outra região. O ♭VI pede iiø65, e o lá♭ só desce ao sol no V7.</p>" },
        { tipo: "quebra", titulo: "O empréstimo como cor e como região", html: `
          <table class="tabela-modos"><thead><tr><th>Obra</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
          <tr><td>Schubert, 'Gute Nacht' (<i>Winterreise</i>)</td><td>Troca o modo da tônica (i → I); o ♭6 sobe</td><td>A luz volta</td></tr>
          <tr><td>Brahms, Sinfonia nº 3</td><td>Fá–lá♭–fá contra harmonia maior</td><td>Ambiguidade como mote</td></tr>
          <tr><td>Schubert, Sonata D. 960 (si♭ → sol♭)</td><td>♭VI tonicizado com a própria dominante</td><td>O acorde de cor vira região</td></tr>
          </tbody></table>
          <p>No séc. XIX a mistura deixa de ser detalhe local e vira estrutura.</p>`,
          exemplos: [
            ex("tom: C maior\nsoprano: E5/1 D5/1 C5/2 D5/1 B4/1 C5/2 Eb5/1 D5/1 C5/2 D5/1 B4/1 C5/2\nbaixo: C3/1 D3/1 E3/2 F3/1 G3/1 C3/2 C3/1 D3/1 Eb3/2 F3/1 G3/1 C3/2", "I V43 I6 ii6 V I i V43 i6 ii°6 V i", { rotulo: "A mesma frase em maior e depois em menor",
              perfil: { ...MIST },
              comentario: "Os mesmos dois compassos em maior e em menor (mi → mi♭, ii6 → ii°6). A mistura decide o modo da cadência." }),
            ex("tom: C maior\nsoprano: E5/2 Eb5/2 Db5/2 C5/2 F5/2 D5/2 C5/4\nbaixo: C3/2 Ab2/2 Eb3/2 Ab2/2 F2/2 G2/2 C3/4", "I bVI=Ab:I V7 I vi=C:iv V7 I", { rotulo: "♭VI tonicizado: uma visita a lá♭ maior",
              perfil: { ...MIST },
              comentario: "♭VI = I de lá♭, com a própria dominante (mi♭7; ré♭ desce a dó). Volta por fá menor: vi de lá♭ = iv emprestado de dó." }),
          ] },
      ],
      exercicios: [
        { id: "emp1", titulo: "Completar: iv, ♭VI e iiø65 em ré maior", modo: "completar", perfil: { ...MIST }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 5 } },
          cifrasAluno: true, cifrasIniciais: "I IV iv I",
          instrucoes: "<p>Cifre e complete os c. 3–5. Que acordes emprestados cabem sobre si♭ e sol do baixo? Leve o si♭ (♭6) a lá na volta ao maior.</p>",
          texto: "tom: D maior\ncf: baixo\nsoprano: A4/2 B4/2 Bb4/2 A4/2\nbaixo: D3/2 G3/2 G3/2 D3/2 Bb2/2 G2/2 A2/4 D3/4", duracao: 2,
          solucao: "tom: D maior\ncf: baixo\nsoprano: A4/2 B4/2 Bb4/2 A4/2 D5/2 E5/2~ E5/2 C#5/2 D5/4\nbaixo: D3/2 G3/2 G3/2 D3/2 Bb2/2 G2/2 A2/4 D3/4",
          solucaoCifras: "I IV iv I bVI iiø65 V7 I",
          comentarioSolucao: "Si♭ = ♭VI; sol = iiø65 (mi–sol–si♭–ré), que leva o si♭ implícito a lá no V7. Soprano sobe a mi5 e cadencia por dó♯." },
        { id: "emp2", titulo: "Fá maior: baixo para uma melodia com ré♭", modo: "menos apoio", perfil: { ...MIST }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras. O ré♭ (♭6) pede acordes emprestados e desce a dó. Sugestão: baixo fá–ré–ré♭…; evite ré♮ no soprano contra ré♭ no baixo.</p>",
          texto: "tom: F maior\ncf: soprano\nsoprano: C5/2 F5/2~ F5/2 Db5/2 C5/2 E5/2 F5/4\nbaixo:", duracao: 2,
          solucao: "tom: F maior\ncf: soprano\nsoprano: C5/2 F5/2~ F5/2 Db5/2 C5/2 E5/2 F5/4\nbaixo: F3/2 D3/2 Db3/2 Bb2/2 C3/2 C3/2 F2/4",
          solucaoCifras: "I vi bVI iv V V7 I",
          comentarioSolucao: "Baixo fá–ré–ré♭–si♭–dó: vi → ♭VI por semitom, fá5 parado. O iv põe o ré♭ na melodia; desce a dó sobre o V." },
        { id: "emp3", titulo: "Dois empréstimos no compasso 2", modo: "restrição", perfil: { ...MIST, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "emprestimo", compasso: 2 }, { tipo: "emprestimo", min: 2 }] }, cifrasAluno: true,
          instrucoes: "<p>Escreva soprano e cifras. <b>Restrição:</b> os dois acordes do c. 2 vêm de sol menor, com mi♭ no soprano descendo. Cadência I6/4–V7–I.</p>",
          texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/2 B2/2 C3/2 A2/2 D3/2 D3/2 G2/4", duracao: 2,
          solucao: "tom: G maior\ncf: baixo\nsoprano: B4/2 D5/2 Eb5/2 Eb5/2 D5/2 F#5/2 G5/4\nbaixo: G2/2 B2/2 C3/2 A2/2 D3/2 D3/2 G2/4",
          solucaoCifras: "I I6 iv iiø7 I64 V7 I",
          comentarioSolucao: "iv e iiø7: mi♭5 sobre os dois, desce a ré no I6/4. Sobre lá, o mi♭ é 5ª diminuta e resolve na mesma descida." },
        { id: "emp4", titulo: "Livre: lá menor com terça de picardia", modo: "livre", perfil: { ...MIST, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "picardia", min: 1 }, { tipo: "secundaria", min: 1 }] }, cifrasAluno: true, alvoCompassos: 4,
          instrucoes: "<p>Frase de 4 compassos em lá menor terminando no I <b>maior</b> (picardia), com ≥ 1 acorde secundário. Ponha o dó♯ no soprano sobre o acorde final.</p>",
          texto: "tom: A menor\nsoprano:\nbaixo:", duracao: 2,
          solucao: "tom: A menor\nsoprano: E5/1 D5/1 C5/2 F5/2 F#5/2 E5/2 D5/2 C#5/2 A4/2\nbaixo: A2/1 B2/1 C3/2 D3/2 D#3/2 E3/2 E3/2 A2/4",
          solucaoCifras: "i V43 i6 iv vii°7/V i64 V7 I",
          comentarioSolucao: "vii°7/V com fá–fá♯ e ré–ré♯ em 10ªs cromáticas. A 7ª ré do V7 desce a dó♯ (terça maior), depois lá." },
        { id: "emp5", titulo: "Quebrar: do menor para o maior", modo: "quebrar", perfil: { ...MIST, sec_sexto_abaixado_desce: "info" }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 5 } },
          cifras: ["i", "iv", "IV", "V", "I6", "ii6", "V", "V7", "I"],
          instrucoes: "<p>Dó menor passa ao maior no c. 2. Escreva o soprano: em iv → IV, <b>lá♭ sobe a lá♮</b> (quebra de 'o ♭6 desce'). Depois, fique no maior.</p>",
          texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/2 F3/2 F3/2 G3/2 E3/2 F3/2 G3/2 G3/2 C3/4", duracao: 2,
          solucao: "tom: C maior\ncf: baixo\nsoprano: G5/2 Ab5/2 A5/2 G5/2 C5/2 D5/2 B4/2 D5/2 C5/4\nbaixo: C3/2 F3/2 F3/2 G3/2 E3/2 F3/2 G3/2 G3/2 C3/4",
          comentarioSolucao: "Sol–lá♭–lá–sol: o lá♭ sobe quando a harmonia clareia sobre o mesmo fá. Soa como luz, não erro, porque o maior se confirma." },
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
      objetivo: "Usar a napolitana como pré-dominante em menor e em maior, chegando ao V pelo I6/4, pelo vii°7/V ou pela 3ª diminuta.",
      ouvir: ["Beethoven, Sonata 'Ao luar', 1º mov., c. 3 (N6)", "Beethoven, 'Appassionata', início (região ♭II)"],
      esboco: "Em dó menor, troque o iv de iv–V–i pela napolitana. Que nota muda, e para onde vai?",
      secoes: [
        { tipo: "texto", rotulo: "A regra", titulo: "O ♭II como pré-dominante", html: `
          <p><b>N6 (♭II6)</b>: tríade maior sobre o 2º grau abaixado, na 1ª inversão. É um iv com a 6ª menor no lugar da 5ª: fá–lá♭–ré♭ em vez de fá–lá♭–dó.</p>
          <table class="tabela-modos"><thead><tr><th>Elemento</th><th>Tratamento</th></tr></thead><tbody>
          <tr><td>Notas estranhas</td><td>Menor: ré♭. Maior: ré♭ e lá♭</td></tr>
          <tr><td>Baixo (4º grau)</td><td>Sobe ao 5º, direto ou via vii°7/V (fá–fá♯–sol)</td></tr>
          <tr><td>Ré♭ → dó → si</td><td>Pelo I6/4 cadencial ou pelo vii°7/V</td></tr>
          <tr><td>Ré♭ → si direto</td><td>3ª diminuta: só na voz de cima</td></tr>
          <tr><td>Ré♭ e ré♮ (do V7) em vozes diferentes</td><td>Falsa relação</td></tr>
          </tbody></table>` },
        { tipo: "exemplo", titulo: "Do iv à napolitana", intro: "A mesma cadência em dó menor, três versões.",
          camadas: [
            ex(P_IV, "i V43 i6 iv V7 i", { titulo: "Com o iv",
              notas: [["decisao", "Dó5 (5ª do iv) passa a si4 no V7."]] }),
            ex(P_N6V, "i V43 i6 N6 V7 i", { titulo: "N6 → V7: a 3ª diminuta", anotacoes: [[0, 3, "♭2"], [0, 4, "3ª dim."]],
              notas: [["decisao", "Só dó5 → ré♭5; o baixo fá forma a 'sexta' (fá–ré♭)."],
                ["decisao", "Ré♭5 → si4 sobre o V7: a 3ª diminuta característica."],
                ["checagem", "Ré♮ do V7 implícito numa voz interna: sem falsa relação no par externo."]] }),
            ex(P_N64, "i V43 i6 N6 i64 V7 i", { titulo: "N6 → I6/4 → V7: o caminho escolar",
              notas: [["decisao", "O I6/4 preenche a 3ª diminuta: ré♭–dó–si. Mais suave e lento."],
                ["rejeitada", "Ré♭ parado sobre o I6/4: fora do acorde, e falsa relação com o ré do V7."]],
              pausa: ["Qual soa mais dramática, a direta ou com I6/4?", "A direta: a 3ª diminuta concentra a tensão num gesto. O I6/4 a dilui em graus, para a cadência respirar."] }),
          ] },
        { tipo: "contraste", titulo: "N6 → V × N6 → vii°7/V → V",
          a: { rotulo: "A — direto, com a 3ª diminuta", partitura: "tom: C menor\nsoprano: Eb5/2 Db5/2 B4/2 C5/2\nbaixo: C3/2 F3/2 G3/2 C3/2", cifras: cif("baixo: C3/2 F3/2 G3/2 C3/2", "i N6 V7 i") },
          b: { rotulo: "B — pelo vii°7/V, baixo cromático", partitura: "tom: C menor\nsoprano: Eb5/2 Db5/2 C5/1 B4/1 C5/2\nbaixo: C3/2 F3/2 F#3/1 G3/1 C3/2", cifras: cif("baixo: C3/2 F3/2 F#3/1 G3/1 C3/2", "i N6 vii°7/V V i") },
          pergunta: "Onde está o cromatismo em cada versão?",
          comentario: "<p>A: no salto do soprano (ré♭–si), abrupto. B: no baixo (fá–fá♯–sol), com o soprano em graus (ré♭–dó–si), mais fluido. Ambas são de repertório.</p>" },
        { tipo: "quebra", titulo: "A napolitana fora da 1ª inversão", html: `
          <table class="tabela-modos"><thead><tr><th>Extensão (séc. XIX)</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
          <tr><td>♭II em estado fundamental</td><td>Trítono no baixo (ré♭–sol)</td><td>Aspereza; acorde com peso próprio</td></tr>
          <tr><td>Região napolitana (Beethoven, 'Appassionata')</td><td>Frase repetida meio tom acima, com a própria dominante</td><td>♭II vira tom; volta fácil (I do ♭II = N6)</td></tr>
          </tbody></table>`,
          exemplos: [
            ex("tom: C menor\nsoprano: Eb5/2 C5/2 Db5/2 B4/2 C5/4\nbaixo: C3/2 Ab2/2 Db3/2 G2/2 C3/4", "i VI N V7 i", { rotulo: "♭II em estado fundamental: o trítono no baixo",
              perfil: { ...NAP, sec_intervalo_melodico: "info" },
              comentario: "Baixo ré♭–sol (5ª diminuta, como informação) junto com a 3ª diminuta ré♭–si no soprano." }),
            ex("tom: C menor\nsoprano: C5/1 Eb5/1 F5/2 Eb5/4 Db5/1 F5/1 Gb5/2 F5/2 Ab5/2 G5/2 D5/2 C5/4\nbaixo: C3/2 G2/2 C3/4 Db3/2 Ab2/2 Db3/2 F3/2 G3/4 C3/4", "i V7 i N=Db:I V7 I I6=c:N6 V7 i", { rotulo: "A frase repetida meio tom acima (à maneira da Appassionata)",
              perfil: { ...NAP },
              comentario: "i–V7–i em dó menor, depois em ré♭ maior (♭II como I, com lá♭7). Volta: I6 de ré♭ = N6 de dó." }),
          ] },
      ],
      exercicios: [
        { id: "nap1", titulo: "Completar: N6 e I6/4 em ré menor", modo: "completar", perfil: { ...NAP }, nivel: 6, contexto: { nivel: 6, plano: { cadencia: 4 } },
          cifrasAluno: true, cifrasIniciais: "i V43 i6",
          instrucoes: "<p>C. 2, sobre o sol do baixo: <b>N6</b> (mi♭ maior). Leve o mi♭ do soprano a ré sobre o I6/4; feche com V7–i.</p>",
          texto: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5/1 D5/2\nbaixo: D3/1 E3/1 F3/2 G3/4 A3/2 A2/2 D3/4", duracao: 2,
          solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5/1 D5/2 Bb4/2 Eb5/2 D5/2 C#5/2 D5/4\nbaixo: D3/1 E3/1 F3/2 G3/4 A3/2 A2/2 D3/4",
          solucaoCifras: "i V43 i6 N6 i64 V7 i",
          comentarioSolucao: "Si♭4 e depois mi♭5 sobre a N6 (evita 8ª direta); mi♭ → ré (I6/4) → dó♯ (V7)." },
        { id: "nap2", titulo: "Napolitana em sol maior", modo: "restrição", perfil: { ...NAP, sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 5 }, pedidos: [{ tipo: "napolitana", compasso: 3 }] }, cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras. <b>Restrição:</b> N6 no c. 3 (lá♭ e mi♭ estão na melodia). Leve o lá♭ a sol sobre o I6/4.</p>",
          texto: "tom: G maior\ncf: soprano\nsoprano: B4/2 D5/2 E5/2 C5/2 Eb5/2 Ab4/2 G4/2 F#4/2 G4/4\nbaixo:", duracao: 2,
          solucao: "tom: G maior\ncf: soprano\nsoprano: B4/2 D5/2 E5/2 C5/2 Eb5/2 Ab4/2 G4/2 F#4/2 G4/4\nbaixo: G2/2 B2/2 C3/2 A2/2 C3/4 D3/2 D3/2 G2/4",
          solucaoCifras: "I I6 IV ii N6 I64 V7 I",
          comentarioSolucao: "Dó sustenta a N6 um compasso; o soprano arpeja mi♭–lá♭ e lá♭ cai a sol no I6/4. Mi♮ e mi♭ na mesma voz." },
        { id: "nap3", titulo: "Quebrar: ♭II em estado fundamental", modo: "quebrar", perfil: { ...NAP, sec_intervalo_melodico: "info", sec_acordes_pedidos: "erro" }, nivel: 6,
          contexto: { nivel: 6, plano: { cadencia: 4 }, pedidos: [{ tipo: "napolitana_fundamental", compasso: 3 }] }, cifrasAluno: true,
          instrucoes: "<p>Escreva baixo e cifras. C. 3: <b>N em estado fundamental</b> (si♭ no baixo) direto ao V7 — trítono si♭–mi no baixo contra a 3ª diminuta si♭–sol♯ do soprano.</p>",
          texto: "tom: A menor\ncf: soprano\nsoprano: C5/2 E5/2 F5/2 C5/2 Bb4/2 G#4/2 A4/4\nbaixo:", duracao: 2,
          solucao: "tom: A menor\ncf: soprano\nsoprano: C5/2 E5/2 F5/2 C5/2 Bb4/2 G#4/2 A4/4\nbaixo: A2/2 C3/2 D3/2 F3/2 Bb2/2 E3/2 A2/4",
          solucaoCifras: "i i6 iv VI N V7 i",
          comentarioSolucao: "Si♭2 → mi3 (4ª aum.) contra si♭4 → sol♯4. Mais pesada que a N6: reservada a momentos de crise." },
      ],
    });
  }

  for (const c of CAPITULOS) T.inserir(4, c);
  if (typeof module === "object" && module.exports) module.exports = { CROM, MIST, NAP };
})(this);
