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

  // ------------------------------------------------------------ capítulos (abaixo)
  const CAPITULOS = [];

  for (const c of CAPITULOS) T.inserir(4, c);
  if (typeof module === "object" && module.exports) module.exports = { CROM, MIST, NAP };
})(this);
