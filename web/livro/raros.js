/* Nível 4 · Tópicos menores: nona de dominante e acordes raros; cromatismo linear.
 * Fontes: Rimsky-Korsakov e Dubois (seções sobre a nona); Aldwell & Schachter; Kostka & Payne (cap. "Further
 * Elements" e "Late 19th Century"); Open Music Theory 2e (Common-Tone Chords; The Omnibus Progression; Augmented
 * Options; Altered and Extended Chords); research_notes/O que se ensina em composição/harmonia.md (seções 5–6).
 * Usa as regras aum_cromatismo, aum_aproximacao e aum_cifras definidas em livro/aumentadas.js (carregado antes). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL } = T.perfis;
  const F = M.ferramentas;
  const bonito = (nome) => String(nome).replace(/-/g, "♭").replace(/#/g, "♯");

  // ------------------------------------------------------------ regras

  M.definirRegra("nona_resolve", "A nona desce por grau",
    "A nona de um acorde de nona (V9), quando está na melodia, desce por grau conjunto e chega a uma consonância com o baixo — em geral a 5ª do I, ou a fundamental do mesmo V (V9 → V7).",
    function* (ex, ctx) {
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra && h.cifra.nona);
      const mel = ex.vozes[0], bai = ex.vozes[ex.vozes.length - 1];
      if (mel === bai) return;
      for (const h of hs) {
        const nona = R3.membros(h.cifra, h.tom)[4];
        const n = mel.soandoEm(h.inicio);
        if (!n || n.altura.nome !== nona) continue;
        const seg = mel.seguinte(n);
        const c = ex.compassoDe(h.inicio);
        if (!seg) { yield [c, `a nona ${bonito(nona)} de ${h.texto} não resolve: a música acaba nela`, [n]]; continue; }
        const b = bai.soandoEm(seg.inicio);
        const desce = F.ehGrau(n, seg) && seg.ps < n.ps;
        const consonante = !b || M.ehConsonante(F.harmonico(seg, b), true);
        if (!desce || !consonante) yield [c, `a nona ${bonito(nona)} de ${h.texto} ${desce ? "desce, mas para outra dissonância (" + bonito(seg.nome) + ")" : "vai para " + bonito(seg.nome) + " em vez de descer por grau"}`, [n, seg]];
      }
    }, {
      precisaTom: true,
      porque: "A nona é a dissonância mais aguda do acorde: como a 7ª, ela é uma tendência para baixo. Os tratados do século XIX (Dubois, Rimsky-Korsakov) a preparam como nota comum ou por grau e a resolvem descendo.",
      corrigir: "Faça a nona descer um grau: lá → sol em dó (V9 → I, a nona vira a 5ª do I) ou lá → sol sobre o mesmo baixo (V9 → V7).",
    });

  M.definirRegra("nona_exige", "Acorde de nona pedido",
    "O exercício pede um número mínimo de acordes de nona (V9) nas cifras.",
    function* (ex, ctx) {
      if (!ctx.nonas) return;
      const n = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra && h.cifra.nona).length;
      if (n < ctx.nonas) yield [ex.compassoDe(ex.fim - 1), `${n} acorde(s) de nona; o exercício pede pelo menos ${ctx.nonas}`, []];
    }, { precisaTom: true, porque: "O exercício é sobre a nona de dominante: ela precisa aparecer, preparada e resolvida.", corrigir: "Escreva V9 sobre um baixo no 5º grau e ponha a nona na melodia, preparada pela nota anterior." });
  M.PRECISA_FIM.add("nona_exige");

  M.definirRegra("lin_resolucao", "Dissonância sai por grau ou por semitom cromático",
    "Uma nota dissonante contra o baixo segue por grau conjunto ou por semitom cromático (lá♭ → lá): no cromatismo linear, a nota que sobe meio tom cromático também resolve.",
    function* (ex) {
      for (const d of F.dissonancias(ex)) {
        if (d.tipo !== "ataque") continue;
        const prox = ex.vozes[d.voz].seguinte(d.nota);
        if (prox !== null && (F.ehGrau(d.nota, prox) || F.intervalo(d.nota, prox).geral === 1)) continue;
        yield [ex.compassoDe(d.t), `${ex.vozes[d.voz].nome}: dissonância ${bonito(d.nota.nome)} precisa seguir por grau ou semitom, ${prox === null ? "e a música termina" : "mas salta para " + bonito(prox.nome)}`, [d.nota]];
      }
    }, {
      porque: "No cromatismo linear (ônibus, acordes de passagem) as vozes andam por semitom, diatônico ou cromático; é esse movimento mínimo que justifica a dissonância. O salto continua sem justificativa.",
      corrigir: "Faça a nota dissonante andar um grau ou um semitom cromático (lá♭ → lá, fá → fá♯).",
    });

  M.definirRegra("lin_seis_quatro", "Uso do 6/4 (com passagem cromática)",
    "O 6/4 é cadencial (tempo forte, sobre o 5º grau, seguido do V com o mesmo baixo), de bordadura, ou de passagem — e a passagem pode ser cromática (baixo si♭ → lá → lá♭).",
    function* (ex, ctx) {
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const passo = (a, b) => Math.abs(b.ps - a.ps) >= 1 && Math.abs(b.ps - a.ps) <= 2;
      for (let i = 0; i < hs.length; i++) {
        const h = hs[i];
        if (!h.cifra.seisQuatro) continue;
        const prox = hs[i + 1], ant = hs[i - 1];
        const cadencial = prox && prox.cifra.grau === 5 && !prox.cifra.seisQuatro && prox.baixo.altura.nome === h.baixo.altura.nome && ex.forcaMetrica(h.inicio) >= ex.forcaMetrica(prox.inicio);
        const passagem = ant && prox && passo(ant.baixo, h.baixo) && passo(h.baixo, prox.baixo) && F.direcao(ant.baixo, h.baixo) === F.direcao(h.baixo, prox.baixo);
        const bordadura = ant && prox && ant.baixo.ps === h.baixo.ps && prox.baixo.ps === h.baixo.ps;
        if (!(cadencial || passagem || bordadura)) yield [ex.compassoDe(h.inicio), `${h.texto} sobre ${bonito(h.baixo.nome)} não é cadencial, de passagem nem de bordadura`, [h.baixo]];
      }
    }, {
      precisaTom: true,
      porque: "A 4ª contra o baixo torna o 6/4 instável: ele só funciona resolvendo (cadencial) ou de passagem. Num baixo cromático, a passagem por semitom vale tanto quanto a diatônica.",
      corrigir: "Use o 6/4 sobre o 5º grau no tempo forte (cadencial) ou com o baixo passando por grau ou semitom, na mesma direção.",
    });
  for (const id of ["lin_seis_quatro", "nona_resolve"]) M.OLHA_ADIANTE.add(id);

  // perfis
  const { intervalo_melodico_aumentado_diminuto: _i, dissonancia_aproximacao: _d, cifras_coerentes: _c, ...BASE } = TONAL;
  const NONA = { ...BASE, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", nona_resolve: "erro" };
  const { dissonancia_resolucao: _r, seis_quatro: _s, ...BASE2 } = BASE;
  const LIN = { ...BASE2, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", lin_resolucao: "erro", lin_seis_quatro: "erro" };

  // ================================================================== nona e acordes raros
  T.inserir(4, {
    id: "nona", titulo: "Nona de dominante e acordes raros",
    antes: [
      { p: "Como se trata a nona do V9 na harmonia clássica?", o: ["Preparada (nota comum ou por grau), acima da sensível, e resolvida descendo por grau", "Livre: pode saltar para qualquer nota do I", "Resolvida subindo, como a sensível", "Sempre no baixo"], e: "A nona é uma dissonância de tendência descendente, como a 7ª. Os tratados a querem preparada, numa voz superior, a pelo menos uma 9ª da fundamental (não como 2ª), e resolvida por grau descendente — em dó, lá → sol." },
      { p: "Sobre o mesmo sol no baixo, o soprano faz lá → sol antes do acorde mudar. Isso é um V9?", o: ["Melhor ler como retardo 9–8 sobre o V: a nona resolve antes de a harmonia mudar", "Sim, sempre", "Não: é um IV sobre sol", "É um acorde de 11ª"], e: "A distinção clássica: no retardo 9–8 a dissonância resolve sobre o mesmo baixo, na oitava; no V9 a nona é membro do acorde e se mantém até o acorde seguinte (ou resolve 9–8 dentro do próprio V, que vira V7)." },
      { p: "Em dó maior, o que é o V+ (sol–si–ré♯)?", o: ["Uma tríade aumentada, quase sempre de passagem: o ré sobe cromaticamente ao mi do I", "O V com a 5ª abaixada", "A sexta aumentada de dó", "Um acorde de nona sem fundamental"], e: "A tríade aumentada é rara na prática comum e aparece sobretudo como produto de condução: a 5ª do V sobe ré → ré♯ → mi. Como suas três notas dividem a oitava em partes iguais, ela não tem fundamental audível — por isso Schoenberg a conta entre os 'acordes errantes'." },
    ],
    objetivo: "Escrever o V9 (com nona maior em maior e nona menor em menor), preparando e resolvendo a nona, e reconhecer a 11ª, a 13ª e a tríade aumentada como fenômenos raros e lineares.",
    ouvir: ["Beethoven, Sonata 'Patética' op. 13: acordes de nona menor na introdução lenta", "Satie, Trois Sarabandes (1887): acordes de nona encadeados sem resolução", "Debussy, Pour le piano, Sarabande: acordes paralelos (planing)", "Wagner e Liszt: a tríade aumentada como acorde de passagem"],
    esboco: "Sobre IV – V – I em dó, com o soprano lá – ? – ?, qual nota você manteria sobre o V para criar uma nona? Para onde ela vai sobre o I?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "A nona: uma 7ª acima da 7ª", html: `
        <p>Acrescentando uma 3ª sobre o V7 obtém-se o <b>V9</b>: em dó maior sol–si–ré–fá–<b>lá</b> (nona maior); em dó menor, sol–si–ré–fá–<b>lá♭</b> (nona menor, o 6º grau do menor). Rimsky-Korsakov e Dubois dedicam a ele uma seção; nos corais e na música clássica ele é pouco frequente, mais comum no Romantismo.</p>
        <ul><li><b>Posição:</b> a nona fica numa voz superior (de preferência o soprano), acima da sensível e a pelo menos uma 9ª da fundamental — nunca como 2ª colada nela. A quatro vozes, omite-se a 5ª.</li>
        <li><b>Preparação:</b> como nota comum do acorde anterior (o lá do IV ou do ii) ou por grau.</li>
        <li><b>Resolução:</b> desce por grau: lá → sol, que é a 5ª do I. Pode também resolver 9–8 sobre o próprio V (V9 → V7) antes do I.</li>
        <li><b>Nona × retardo 9–8:</b> se a nota resolve sobre o mesmo baixo antes da mudança de harmonia, é um retardo; se se mantém como membro do acorde até a resolução, é um V9.</li>
        <li><b>vii°7 como nona sem fundamental:</b> Rameau e parte da tradição francesa e alemã leram o vii°7 (si–ré–fá–lá♭) como V9 menor sem o sol. É uma questão de teoria; na escrita, o vii°7 resolve igual.</li></ul>
        <h3>Raros: 11ª, 13ª, tríade aumentada</h3>
        <ul><li><b>11ª e 13ª</b> são raras na prática comum (a Open Music Theory sublinha a raridade da 11ª): o que aparece como "V13" é em geral um V7 com apojatura ou retardo da 6ª (mi sobre sol7, descendo ao ré); a "11ª" é o retardo 4–3 sobre o V. Leia-as como notas melódicas, não como acordes.</li>
        <li><b>Tríade aumentada</b> (V+, III+ do menor): produto de condução — uma voz sobe cromaticamente (ré → ré♯ → mi). Tem três notas equidistantes, por isso nenhuma é fundamental audível.</li></ul>
        <p>Como sempre, trabalhamos com o par soprano–baixo e as cifras: a nona interessa sobretudo no soprano, onde se ouve.</p>` },
      { tipo: "exemplo", titulo: "Preparar e resolver a nona",
        camadas: [
          { titulo: "Nona maior em dó maior", partitura: "tom: C maior\nsoprano: E5/2 A5/2~ A5/2 G5/2 F5/2 D5/2 B4/2 C5/2\nbaixo: C3/2 F3/2 G3/2 C3/2 A2/2 F2/2 G2/2 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [2, "IV"], [4, "V9"], [6, "I"], [8, "IV6"], [10, "ii6"], [12, "V7"], [14, "I"]],
            anotacoes: [[0, 1, "9ª"]],
            notas: [["decisao", "O lá5 entra como 3ª do IV (consonante, preparação) e fica preso quando o baixo vai ao sol: vira a nona do V9. Desce ao sol5 quando o baixo chega ao dó."],
              ["rejeitada", "Pensei em atacar o lá5 direto sobre o V, vindo do mi5 por salto: soaria como apojatura, e a nona perderia o caráter de membro do acorde preparado."],
              ["checagem", "Sol3–lá5 é 9ª composta, acima da sensível (si, implícita numa voz interna); resolve em dó3–sol5 (12ª). A segunda cadência (V7 → I) fecha na tônica."]],
            pausa: ["Por que a nona resolve no sol, e não no si (a sensível também está ali)?", "Porque o si é a sensível e sobe ao dó; se a nona descesse ao si, a sensível ficaria dobrada ou sem resolução. Lá → sol (9 → 5 do I) e si → dó andam em direções contrárias, como as duas dissonâncias do V7."] },
          { titulo: "Nona menor em lá menor", partitura: "tom: A menor\nsoprano: C5/2 F5/2~ F5/2 E5/2 D5/2 B4/2 A4/4\nbaixo: A2/2 D3/2 E3/2 A2/2 D3/2 E3/2 A2/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [2, "iv"], [4, "V9"], [6, "i"], [8, "iv"], [10, "V"], [12, "i"]],
            notas: [["decisao", "O fá5 (3ª do iv) fica sobre o mi do baixo: nona menor (mi–sol♯–si–ré–fá). Desce ao mi5 sobre o lá."],
              ["checagem", "A nona menor fica a uma 7ª diminuta da sensível (sol♯–fá): é o som do vii°7 com o mi embaixo — a razão da leitura de Rameau."]] },
          { titulo: "A tríade aumentada de passagem", partitura: "tom: C maior\nsoprano: E5/1 D5/1 C5/1 C5/1 D5/1 D#5/1 E5/2\nbaixo: C3/1 D3/1 E3/1 A2/1 G2/1 G2/1 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "V43"], [2, "I6"], [3, "IV6"], [4, "V"], [5, "V+"], [6, "I"]],
            contexto: { plano: {} },
            notas: [["decisao", "Ré5 → ré♯5 → mi5 sobre sol – sol – dó: a 5ª do V sobe cromaticamente e, por um tempo, o V vira tríade aumentada."],
              ["checagem", "O ré♯ é dissonante com o baixo (5ª aumentada), chega por semitom cromático e resolve por grau no mi: a tríade aumentada é condução, não função nova."]] },
        ] },
      { tipo: "contraste", titulo: "V9 × retardo 9–8",
        a: { rotulo: "A — V9: a nona fica até o I", partitura: "tom: C maior\nsoprano: E5/2 A5/2~ A5/2 G5/2\nbaixo: C3/2 F3/2 G3/2 C3/2", cifras: [[0, "I"], [2, "IV"], [4, "V9"], [6, "I"]], contexto: { plano: {} } },
        b: { rotulo: "B — 9–8: a nona resolve sobre o V", partitura: "tom: C maior\nsoprano: E5/2 A5/2~ A5/1 G5/1 G5/2\nbaixo: C3/2 F3/2 G3/2 C3/2", cifras: [[0, "I"], [2, "IV"], [4, "V"], [6, "I"]], contexto: { plano: {} },
          perfil: (({ aum_cifras, ...p }) => p)(NONA) },
        pergunta: "As notas são quase as mesmas. Em qual o lá é membro do acorde, e em qual é ornamento do V?",
        comentario: "<p>Em A o lá dura todo o V e só resolve quando o baixo muda: é a nona, membro do acorde. Em B ele resolve no sol sobre o mesmo baixo — 9–8, um retardo; a harmonia é só V. A diferença é de duração e de ponto de resolução, e é por ela que os tratados separam o acorde de nona da dissonância melódica.</p>" },
      { tipo: "quebra", titulo: "Nonas paralelas: a dissonância vira cor", html: `
        <p>No fim do século XIX a nona deixa de precisar de resolução. Satie, nas <i>Sarabandes</i> de 1887, encadeia acordes de nona sem resolvê-los; Debussy faz do <b>paralelismo de acordes</b> (planing) um procedimento central — o acorde inteiro se desloca com a melodia, como uma linha "engrossada" (a Sarabande de <i>Pour le piano</i> é um exemplo-padrão de acordes paralelos). Ravel herda o procedimento.</p>
        <p>O que se quebra: a nona não desce a uma consonância — desce (ou sobe) para outra nona; e a sucessão de graus perde a lógica de função. O que se ganha: a sonoridade do acorde vale por si, como timbre, e a harmonia vira superfície colorida de uma melodia.</p>`,
        exemplos: [
          { rotulo: "Nonas paralelas descendo sobre a escala (esquema)", partitura: "tom: C maior\nsoprano: E5/2 A5/2~ A5/2 G5/2~ G5/1 F5/1 E5/1 D5/1 B4/2 C5/2\nbaixo: C3/2 F3/2 G3/2 C3/2 F3/1 E3/1 D3/1 C3/1 G2/2 C3/2",
            cifras: [[0, "I"], [2, "IV"], [4, "V9"], [6, "I"], [8, "IV9"], [9, "iii9"], [10, "ii9"], [11, "I9"], [12, "V7"], [14, "I"]],
            perfil: { ...NONA, nona_resolve: "info" },
            comentario: "O V9 do c. 2 é clássico (preparado, resolvido). No c. 3 a mesma nona desce em paralelo com o baixo: sol5/fá3, fá5/mi3, mi5/ré3, ré5/dó3 — quatro nonas seguidas, cada uma 'resolvendo' em outra dissonância." },
        ] },
    ],
    exercicios: [
      { id: "non1", titulo: "Completar: a nona em fá maior", modo: "completar", perfil: { ...NONA }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "I IV V9 I vi ii6 V7 I".split(" "),
        instrucoes: "<p>Baixo e cifras dados; o soprano do c. 1 também. Escreva o soprano dos c. 2–4. Sobre o V9 ponha a <b>nona (ré) no soprano</b>, preparada pelo acorde anterior, e resolva-a descendo por grau.</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano: A4/2 D5/2\nbaixo: F3/2 Bb2/2 C3/2 F3/2 D3/2 Bb2/2 C3/2 F2/2", duracao: 2, alvoCompassos: 4,
        solucao: "tom: F maior\ncf: baixo\nsoprano: A4/2 D5/2 D5/2 C5/2 F5/2 G5/2 E5/2 F5/2\nbaixo: F3/2 Bb2/2 C3/2 F3/2 D3/2 Bb2/2 C3/2 F2/2",
        comentarioSolucao: "O ré5 do IV fica sobre o dó do baixo (nona do V9) e desce ao dó5 sobre o fá: preparação por nota comum, resolução descendo para a 5ª do I." },
      { id: "non2", titulo: "Restrição: a nona menor em ré menor", modo: "restrição", perfil: { ...NONA, nona_exige: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, nonas: 1 }, cifrasAluno: true, cifrasIniciais: "i V6 i iv",
        instrucoes: "<p>O baixo está dado e as cifras do c. 1 também. Escreva as cifras restantes e o soprano. <b>Restrição:</b> use um V9 no começo do c. 2 com a nona menor (si♭) no soprano, preparada como nota comum (ligada do tempo fraco anterior) e resolvida descendo; termine em cadência perfeita.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/1 C#3/1 D3/1 G2/1 A2/2 D3/2 Bb2/2 A2/2 D3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/1 E5/1 D5/1 Bb4/1~ Bb4/2 A4/2 D5/2 C#5/2 D5/4\nbaixo: D3/1 C#3/1 D3/1 G2/1 A2/2 D3/2 Bb2/2 A2/2 D3/4",
        solucaoCifras: "i V6 i iv V9 i VI V i",
        comentarioSolucao: "O si♭4, fundamental do iv no último tempo do c. 1, fica preso sobre o lá: nona menor. Desce ao lá4 sobre o ré (a 5ª do i). A cadência final, sem nona, fecha com a sensível subindo." },
      { id: "non3", titulo: "Quebrar: nonas em paralelo", modo: "quebrar", perfil: { ...NONA, nona_resolve: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "I IV V9 I IV9 iii9 ii9 I9 V7 I".split(" "),
        instrucoes: "<p>Os c. 1–2 trazem um V9 clássico (dado). No c. 3, <b>quebre a resolução da nona</b>: o soprano anda em nonas paralelas com o baixo (fá–mi–ré–dó), cada nona descendo para outra — o paralelismo de Satie e Debussy. Feche no c. 4 com V7–I clássico.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/2 A5/2~ A5/2 G5/2\nbaixo: C3/2 F3/2 G3/2 C3/2 F3/1 E3/1 D3/1 C3/1 G2/2 C3/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/2 A5/2~ A5/2 G5/2~ G5/1 F5/1 E5/1 D5/1 B4/2 C5/2\nbaixo: C3/2 F3/2 G3/2 C3/2 F3/1 E3/1 D3/1 C3/1 G2/2 C3/2",
        comentarioSolucao: "O sol5 do I fica preso sobre o fá3 (nona do IV9) e desce com o baixo em nonas paralelas até o ré5 sobre o dó3. Nenhuma nona resolve numa consonância — a última só se dissolve no si do V7." },
    ],
  });

  // ================================================================== cromatismo linear
  T.inserir(4, {
    id: "linear", titulo: "Cromatismo linear",
    antes: [
      { p: "Em dó maior, o que faz o acorde ré♯–fá♯–lá–dó sobre o dó do baixo, entre dois acordes de I?", o: ["Enfeita o I por bordaduras cromáticas, mantendo o dó como nota comum (°7 de nota comum)", "Leva ao V, como vii°7/V", "Modula para mi menor", "É uma sexta aumentada"], e: "É o °7 de nota comum (#ii°7, aqui com o dó no baixo): ré♯ e fá♯ são bordaduras inferiores de mi e sol, lá é bordadura superior do sol, e o dó fica. Não há mudança de função — só cor." },
      { p: "O que caracteriza a progressão 'ônibus'?", o: ["Baixo e soprano andam cromaticamente em movimento contrário enquanto as vozes internas seguram notas comuns, prolongando (em geral) a dominante", "Uma cadeia de quintas descendentes", "Acordes paralelos em 1ª inversão", "Uma modulação por acorde-pivô"], e: "Na forma básica (em dó): baixo dó–si–si♭–lá–lá♭–sol, soprano sol–sol–lá♭–lá–si♭–si, com ré e fá parados nas vozes internas. Os acordes alternam dominantes com sétima e acordes de 6/4." },
      { p: "Na troca de vozes cromática iv → It6 (dó menor), o que acontece?", o: ["O baixo vai de fá a lá♭ enquanto o soprano vai de lá♭ a fá♯: as vozes trocam as notas, uma delas alterada", "As duas vozes sobem em 3ªs paralelas", "O baixo fica parado e o soprano sobe", "O soprano salta uma 3ª diminuta"], e: "É uma troca de vozes (como I – V43 – I6), mas com uma nota alterada no caminho: fá → (sol) → lá♭ no baixo, lá♭ → (sol) → fá♯ no soprano. O sol do meio é de passagem." },
    ],
    objetivo: "Usar acordes que nascem da condução por semitom — °7 de nota comum, acordes cromáticos de passagem, a ônibus e a troca de vozes cromática — sem perder a direção tonal.",
    ouvir: ["Schubert, Sonata em lá menor D. 845, 1º mov.: a progressão ônibus na transição", "Tchaikovsky, O Quebra-Nozes: a progressão em cunha (cromatismo em movimento contrário) na cena da árvore", "Chopin, Prelúdio em mi menor op. 28 n.º 4: acordes que mudam uma nota de cada vez, por semitom", "Valsas românticas: °7 de nota comum enfeitando a tônica"],
    esboco: "Em dó maior, com o baixo parado no dó, mova só o soprano mi → ré♯ → mi e uma voz interna sol → lá → sol. Que acorde soa no meio?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Acordes que vêm das vozes", html: `
        <p>Os tratados da prática comum explicam a harmonia pelos graus; o século XIX acrescentou acordes que só se explicam pela <b>condução</b>: vozes que andam por semitom (diatônico ou cromático) enquanto outras seguram notas comuns. Kostka &amp; Payne os reúnem num capítulo; a Open Music Theory dá uma seção a cada um. A função não muda — o acorde cromático <b>prolonga</b> o que está em volta.</p>
        <table class="tabela-modos"><thead><tr><th>Procedimento</th><th>Em dó maior</th><th>O que prolonga</th></tr></thead><tbody>
        <tr><td>°7 de nota comum</td><td>ré♯–fá♯–lá–dó sobre dó (<code>#ii°42</code>); lá♯–dó♯–mi–sol sobre sol (<code>#vi°42</code>)</td><td>I ou V</td></tr>
        <tr><td>Acorde cromático de passagem</td><td>IV – fá♯°7 (vii°7/V) – V: baixo fá–fá♯–sol</td><td>pré-dominante → V</td></tr>
        <tr><td>Ônibus</td><td>baixo dó–si–si♭–lá–lá♭–sol contra soprano sol–sol–lá♭–lá–si♭–si</td><td>a dominante (ou a ida I → V7)</td></tr>
        <tr><td>Troca de vozes cromática</td><td>(menor) iv → It6: baixo fá → lá♭, soprano lá♭ → fá♯</td><td>a pré-dominante</td></tr>
        </tbody></table>
        <h3>Regras de escrita</h3>
        <ul><li><b>Grafia pela resolução:</b> no °7 de nota comum as notas são bordaduras elevadas — ré♯ (não mi♭) porque volta ao mi.</li>
        <li><b>Semitom cromático vale como grau:</b> a dissonância pode resolver por semitom cromático (lá♭ → lá na ônibus); saltos aumentados e diminutos continuam proibidos.</li>
        <li><b>Destino claro:</b> o trecho cromático começa e termina em acordes diatônicos firmes (I, V); no meio, a lógica é a das vozes, não a dos graus.</li></ul>` },
      { tipo: "exemplo", titulo: "Cor sem mudança de função",
        camadas: [
          { titulo: "°7 de nota comum e acorde cromático de passagem", partitura: "tom: C maior\nsoprano: E5/1 D#5/1 E5/2 C5/1 A4/1 A4/1 G4/1 B4/1 A#4/1 B4/2 C5/4\nbaixo: C3/1 C3/1 C3/2 E3/1 F3/1 F#3/1 G3/1 G3/1 G3/1 G3/2 C3/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "#ii°42"], [2, "I"], [4, "I6"], [5, "IV"], [6, "vii°7/V"], [7, "V"], [8, "V"], [9, "#vi°42"], [10, "V"], [12, "I"]],
            notas: [["decisao", "C. 1: o dó fica no baixo e o soprano faz mi → ré♯ → mi — o °7 de nota comum enfeita o I (as outras bordaduras, fá♯ e lá, ficam nas vozes internas)."],
              ["decisao", "C. 2: fá → fá♯ → sol no baixo: o vii°7/V entra como acorde de passagem cromático entre o IV e o V."],
              ["decisao", "C. 3: o mesmo enfeite, agora sobre o V: lá♯–dó♯–mi–sol com o sol no baixo; o soprano faz si → lá♯ → si."],
              ["checagem", "Ré♯5 e lá♯4 são dissonantes com o baixo, chegam e saem por grau; o lá4 do c. 2 fica preso como nota comum do IV e do vii°7/V."]],
            pausa: ["Se tirarmos os acordes cromáticos, o que sobra da frase?", "I – I6 – IV – V – I: uma frase diatônica comum. Os acordes cromáticos não mudam o percurso; dão cor e direção às vozes no caminho — é a definição de cromatismo linear."] },
          { titulo: "A ônibus (forma básica)", partitura: "tom: C maior\nsoprano: G4/1 G4/1 Ab4/1 A4/1 Bb4/1 B4/1 C5/2\nbaixo: C3/1 B2/1 Bb2/1 A2/1 Ab2/1 G2/1 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "V65"], [2, "d:Ger65=C:bVII7"], [3, "d:i64"], [4, "C:bVII42"], [5, "V7"], [6, "I"]],
            notas: [["decisao", "Baixo descendo dó–si–si♭–lá–lá♭–sol, soprano subindo sol–lá♭–lá–si♭–si–dó: movimento contrário cromático. As vozes internas (ré e fá) ficam paradas."],
              ["decisao", "Os acordes alternam: V65, si♭7, ré menor em 6/4, si♭7 em 4/2, V7. Cada um nasce do movimento de duas vozes por semitom."],
              ["decisao", "Na cifra, o si♭7 leva duas leituras: ♭VII7 de dó e, enarmonicamente, a sexta alemã de ré menor (si♭–ré–fá–sol♯), que abre para o 6/4 de ré. É por isso que o ré menor em 6/4 soa como chegada momentânea."],
              ["checagem", "O lá♭4 (7ª de si♭7) sobe cromaticamente ao lá: no cromatismo linear, o semitom cromático resolve a dissonância. O 6/4 sobre o lá é de passagem cromática."]],
            pausa: ["Por que o ouvinte não se perde, se a cada tempo surge um acorde estranho ao tom?", "Porque as pontas são firmes (I e V7 → I) e as vozes externas fazem dois movimentos simples e previsíveis em sentidos opostos. A lógica é a das linhas; os acordes são consequência."] },
        ] },
      { tipo: "contraste", titulo: "Troca de vozes diatônica × cromática",
        a: { rotulo: "A — diatônica: iv → iv6", partitura: "tom: C menor\nsoprano: Eb5/1 D5/1 C5/1 Ab4/1 G4/1 F4/1 G4/1 B4/1 C5/4\nbaixo: C3/1 B2/1 C3/1 F3/1 G3/1 Ab3/1 G3/1 G3/1 C3/4", cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "iv"], [4, "i64"], [5, "iv6"], [6, "V"], [7, "V7"], [8, "i"]] },
        b: { rotulo: "B — cromática: iv → It6", partitura: "tom: C menor\nsoprano: Eb5/1 D5/1 C5/1 Ab4/1 G4/1 F#4/1 G4/1 B4/1 C5/4\nbaixo: C3/1 B2/1 C3/1 F3/1 G3/1 Ab3/1 G3/1 G3/1 C3/4", cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "iv"], [4, "i64"], [5, "It6"], [6, "V"], [7, "V7"], [8, "i"]] },
        pergunta: "Nos dois, baixo e soprano trocam fá e lá♭ passando pelo sol. O que muda com o fá♯?",
        comentario: "<p>Em A a troca é diatônica: a pré-dominante iv se estende até o iv6, que vai ao V. Em B a nota que chega ao soprano é alterada: o fá vira fá♯ e, sobre o lá♭, forma a 6ª aumentada — a troca de vozes desemboca numa sexta italiana, e a chegada ao V ganha duas sensíveis. O 6/4 do meio, nos dois, é de passagem.</p>" },
      { tipo: "quebra", titulo: "Saturação cromática", html: `
        <p>No Romantismo tardio o cromatismo linear deixa de ser enfeite entre pontos diatônicos e passa a ocupar trechos inteiros. No Prelúdio em mi menor op. 28 n.º 4 de Chopin, a melodia quase parada (si–dó) paira sobre acordes que mudam <b>uma nota de cada vez</b>, por semitom, e cuja leitura por graus é incerta; em <i>Tristão</i>, Wagner faz da condução cromática a própria matéria da harmonia. Schoenberg chama os acordes de tipo diminuto e aumentado de "errantes" (<i>vagierende Akkorde</i>): sem tom fixo, servem de ponte para qualquer lugar.</p>
        <p>O que se quebra: a função. Entre um acorde e o seguinte não há mais progressão de graus — há vozes deslizando. O que se ganha: um fluxo contínuo e ambíguo em que a tonalidade só se confirma nas cadências, às vezes só no fim.</p>`,
        exemplos: [
          { rotulo: "À maneira do Prelúdio op. 28 n.º 4 (esquema, não a partitura)", partitura: "tom: E menor\nsoprano: B4/3 C5/1 B4/3 C5/1 B4/2 C5/1 A4/1 F#4/2 E4/2\nbaixo: E3/2 D#3/2 D3/2 C#3/2 C3/4 B2/2 E3/2",
            cifras: [[0, "i"], [2, "V65"], [4, "V42/iv"], [6, "#viø7"], [8, "VI7"], [12, "V"], [14, "i"]],
            perfil: { quintas_paralelas: "erro", oitavas_paralelas: "erro", cruzamento_de_vozes: "erro", aum_cromatismo: "erro" },
            comentario: "O baixo desce mi–ré♯–ré–dó♯–dó–si por semitom; todos os acordes contêm o si da melodia, que fica. Os graus (V65, V42/iv, #viø7, VI7) são rótulos possíveis, não uma progressão: o que se ouve é o deslizar do baixo até o V." },
        ] },
    ],
    exercicios: [
      { id: "lin1", titulo: "Completar: °7 de nota comum sobre o V", modo: "completar", perfil: { ...LIN }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "I #ii°42 I IV ii V V #vi°42 V I".split(" "),
        instrucoes: "<p>Sol maior. O baixo, as cifras e o soprano dos c. 1–2 estão dados (o °7 de nota comum sobre o I). Escreva o soprano dos c. 3–4: sobre o ré do baixo, o <b>#vi°42</b> (mi♯–sol♯–si–ré) enfeita o V — use no soprano uma bordadura cromática inferior que volte à nota do V, e feche na tônica.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: B4/1 A#4/1 B4/2 E5/1 E5/1 F#5/2\nbaixo: G2/1 G2/1 G2/2 C3/1 A2/1 D3/2 D3/1 D3/1 D3/2 G2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 A#4/1 B4/2 E5/1 E5/1 F#5/2 F#5/1 E#5/1 F#5/2 G5/4\nbaixo: G2/1 G2/1 G2/2 C3/1 A2/1 D3/2 D3/1 D3/1 D3/2 G2/4",
        comentarioSolucao: "Fá♯5 → mi♯5 → fá♯5 sobre o ré parado: o mi♯ é a bordadura elevada (grafada pela resolução, não fá♮). O V continua V; o °7 só o colore." },
      { id: "lin2", titulo: "A ônibus em ré maior", modo: "menos apoio", perfil: { ...LIN }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 3 } }, cifras: "I I6 IV V I V65 e:Ger65=D:bVII7 e:i64 D:bVII42 V7 I".split(" "),
        instrucoes: "<p>O baixo está dado: depois de uma cadência simples, ele desce cromaticamente de ré a lá (c. 2–3). As cifras estão dadas (o dó7 tem duas leituras: ♭VII7 de ré e sexta alemã de mi menor). Escreva o soprano inteiro, <b>subindo cromaticamente</b> em movimento contrário ao baixo no c. 2–3 (a ônibus).</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano:\nbaixo: D3/1 F#3/1 G3/1 A3/1 D3/1 C#3/1 C3/1 B2/1 Bb2/1 A2/1 D3/2", duracao: 1, alvoCompassos: 3,
        solucao: "tom: D maior\ncf: baixo\nsoprano: D5/1 D5/1 B4/1 A4/1 A4/1 A4/1 Bb4/1 B4/1 C5/1 C#5/1 D5/2\nbaixo: D3/1 F#3/1 G3/1 A3/1 D3/1 C#3/1 C3/1 B2/1 Bb2/1 A2/1 D3/2",
        comentarioSolucao: "Lá4–lá4–si♭4–si4–dó5–dó♯5–ré5 contra ré–dó♯–dó–si–si♭–lá: a ônibus básica transposta. As sétimas (si♭ de dó7, dó de dó7 em 4/2) sobem por semitom cromático, como pede o movimento contrário." },
      { id: "lin3", titulo: "Quebrar: sétimas que deslizam", modo: "quebrar", perfil: { ...LIN, retrogressao_cifrada: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "i V43 i6 iv V7 bV7 IV7 bIV7 V7/VI V7/V V7 i".split(" "),
        instrucoes: "<p>Lá menor. No c. 2 o baixo desce cromaticamente sob uma cadeia de <b>dominantes com sétima</b> (mi7, mi♭7, ré7, ré♭7): quebre a lógica de função — escreva o soprano em sétimas paralelas com o baixo, cada sétima deslizando meio tom para a seguinte, sem resolver. No c. 3 a cadeia desemboca em V7/V – V7 e, no c. 4, na tônica.</p>",
        texto: "tom: A menor\ncf: baixo\nsoprano: C5/1 D5/1 C5/1 F5/1\nbaixo: A2/1 B2/1 C3/1 D3/1 E3/1 Eb3/1 D3/1 Db3/1 C3/1 B2/1 E3/2 A2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: A menor\ncf: baixo\nsoprano: C5/1 D5/1 C5/1 F5/1 D5/1 Db5/1 C5/1 Cb5/1 Bb4/1 A4/1 G#4/2 A4/4\nbaixo: A2/1 B2/1 C3/1 D3/1 E3/1 Eb3/1 D3/1 Db3/1 C3/1 B2/1 E3/2 A2/4",
        comentarioSolucao: "Ré5–ré♭5–dó5–dó♭5–si♭4–lá4 contra mi–mi♭–ré–ré♭–dó–si: sétimas paralelas, cada dominante 'resolvendo' em outra dominante meio tom abaixo. A função só volta no V7 → i — o deslizamento cromático que Chopin e os românticos tardios exploraram." },
    ],
  });
})(this);
