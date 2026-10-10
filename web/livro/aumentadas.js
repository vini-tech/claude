/* Nível 4 · Sextas aumentadas (It6, Fr43, Ger65) e o seu uso além do V.
 * Fontes: Aldwell & Schachter (Harmony and Voice Leading, cap. sobre a sexta aumentada); Piston (Harmony);
 * Kostka & Payne; Open Music Theory 2e (Augmented Sixth Chords; Common-Tone Chords);
 * research_notes/O que se ensina em composição/harmonia.md (seção 5). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL } = T.perfis;
  const F = M.ferramentas;

  const bonito = (nome) => String(nome).replace(/--/g, "𝄫").replace(/-/g, "♭").replace(/##/g, "𝄪").replace(/#/g, "♯");
  // graus do tom (nomes no formato do motor) usados pelas regras das sextas aumentadas
  const graus = (tom) => ({
    b6: F.transpor(tom.tonica, 5, 8).nome, s4: F.transpor(tom.tonica, 3, 6).nome,
    s2: F.transpor(tom.tonica, 1, 3).nome, cinco: F.transpor(tom.tonica, 4, 7).nome,
  });

  // ------------------------------------------------------------ regras do capítulo

  M.definirRegra("aum_cromatismo", "Cromatismo sim, salto aumentado não",
    "A melodia pode andar um semitom cromático (fá–fá♯, lá–lá♭): é assim que nascem a sexta aumentada e os acordes cromáticos. Saltos aumentados e diminutos (trítono, 2ª aumentada, 3ª diminuta…) continuam proibidos.",
    function* (ex) {
      for (const v of ex.vozes) for (const [a, b] of v.paresMelodicos()) {
        const iv = F.intervalo(a, b);
        if (iv.geral === 1) continue; // semitom cromático (uníssono aumentado)
        if (iv.qual[0] === "A" || iv.qual[0] === "d") yield [ex.compassoDe(b.inicio), `${v.nome}: ${F.nomeIntervalo(iv)} de ${bonito(a.nome)} para ${bonito(b.nome)}`, [a, b]];
      }
    }, {
      porque: "No estilo cromático a voz que sobe ou desce meio tom cromático é a mais suave possível — é ela que transforma o iv6 em sexta italiana. Já o salto aumentado ou diminuto (lá♭–fá♯, a 3ª diminuta) é difícil de cantar e destrói a condução que justifica o acorde.",
      corrigir: "Troque o salto por movimento cromático ou por grau: em vez de lá♭ → fá♯, faça fá → fá♯ ou sol → fá♯.",
    });

  M.definirRegra("aum_aproximacao", "Dissonância chega por grau (ou por semitom cromático)",
    "Uma nota dissonante contra o baixo chega por grau conjunto, por semitom cromático ou preparada pela mesma nota. Chegar a ela por salto é uma apojatura.",
    function* (ex) {
      for (const d of F.dissonancias(ex)) {
        if (d.tipo !== "ataque") continue;
        const ant = ex.vozes[d.voz].anterior(d.nota);
        if (ant !== null && (F.ehGrau(ant, d.nota) || ant.ps === d.nota.ps || F.intervalo(ant, d.nota).geral === 1)) continue;
        yield [ex.compassoDe(d.t), `${ex.vozes[d.voz].nome}: dissonância ${bonito(d.nota.nome)} (${F.nomeIntervalo(d.iv)}) atingida ${ant === null ? "sem nota anterior" : "por salto de " + bonito(ant.nome)}`, [d.nota]];
      }
    }, {
      porque: "O ♯4 da sexta aumentada soa como uma sensível da dominante: ele precisa ser ouvido como passagem cromática (fá → fá♯ → sol) ou bordadura (sol → fá♯ → sol). Atacado por salto, vira apojatura.",
      corrigir: "Chegue à nota dissonante por grau, por semitom cromático ou mantendo a nota do acorde anterior.",
    });

  M.definirRegra("aum_cifras", "Cifra coerente com as vozes (com a grafia da sexta alemã em maior)",
    "Como 'Cifra coerente com as vozes', mas aceita, na sexta alemã, o 2º grau elevado (ré♯ em dó) no lugar do 3º abaixado (mi♭): a 4ª duplamente aumentada que sobe para a 3ª do I6/4.",
    function* (ex, ctx) {
      const hs = R3.harmoniasCifradas(ex, ctx);
      for (const y of M.REGRAS.cifras_coerentes.verificar(ex, ctx)) {
        const notas = y[2] || [];
        if (notas.length === 2) {
          const h = hs.find((x) => x.baixo === notas[1]);
          if (h && h.cifra && h.cifra.aumentada === "Ger" && notas[0].altura.nome === graus(h.tom).s2) continue;
        }
        yield y;
      }
    }, {
      precisaTom: true,
      porque: "A cifra é a sua leitura da harmonia. A sexta alemã tem duas grafias: com o 3º grau abaixado (mi♭, que fica como 3ª do i6/4 em menor) e, em maior, com o 2º elevado (ré♯, que sobe ao mi do I6/4). O som é o mesmo; a grafia mostra para onde a nota vai.",
      corrigir: "Confira qual membro do acorde está no baixo (It6, Fr43 e Ger65 têm o 6º abaixado no baixo) e se a melodia é nota do acorde.",
    });

  M.definirRegra("aum_resolucao", "A sexta aumentada abre para a oitava",
    "Na sexta aumentada, o 6º grau abaixado (no baixo) desce meio tom até o 5º grau e o 4º elevado sobe meio tom até o 5º: o intervalo se abre na oitava da dominante. Nenhuma das duas notas é dobrada; o acorde seguinte contém o 5º grau (V ou I6/4).",
    function* (ex, ctx) {
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const mel = ex.vozes[0];
      for (let i = 0; i < hs.length; i++) {
        const h = hs[i];
        if (!h.cifra.aumentada) continue;
        const g = graus(h.tom), c = ex.compassoDe(h.inicio), prox = hs[i + 1];
        if (prox) {
          if (h.baixo.altura.nome === g.b6 && prox.baixo.ps !== h.baixo.ps - 1) yield [c, `o ${bonito(g.b6)} do baixo (6º grau abaixado) deve descer meio tom até ${bonito(g.cinco)}, e vai para ${bonito(prox.baixo.nome)}`, [h.baixo, prox.baixo]];
          if (!prox.notas.has(g.cinco)) yield [c, `${h.texto} pede a dominante depois (V ou I6/4, com ${bonito(g.cinco)}); veio ${prox.texto}`, [h.baixo, prox.baixo]];
        }
        if (mel === ex.vozes[ex.vozes.length - 1]) continue;
        for (const n of mel.notas.filter((x) => x.inicio < h.fim && x.fim > h.inicio && x.inicio >= h.inicio)) {
          const nome = n.altura.nome;
          if (nome === g.b6) yield [c, `${bonito(nome)} na melodia dobra o 6º grau abaixado do baixo: a nota que resolve por semitom não se dobra`, [n, h.baixo]];
          if (nome === g.s4 || (nome === g.s2 && h.cifra.aumentada === "Ger")) {
            const seg = mel.seguinte(n);
            if (seg && seg.ps !== n.ps + 1) yield [c, `${bonito(nome)} (${nome === g.s4 ? "4º elevado" : "4ª duplamente aumentada"}) sobe meio tom; aqui vai para ${bonito(seg.nome)}`, [n, seg]];
          }
        }
      }
    }, {
      precisaTom: true,
      porque: "A sexta aumentada é a soma de duas sensíveis — uma de baixo (♭6 → 5) e uma de cima (♯4 → 5). É essa dupla atração por semitom que dá ao acorde a sua força; se uma delas não resolve, o acorde perde o sentido.",
      corrigir: "Faça o baixo descer meio tom (lá♭ → sol em dó) e a voz com o ♯4 subir meio tom (fá♯ → sol), chegando ao V ou ao I6/4.",
    });

  M.definirRegra("aum_ger_64", "A sexta alemã vai ao 6/4 cadencial",
    "A sexta alemã (Ger65) resolve primeiro no I6/4 (i6/4) cadencial, e só depois no V: indo direto ao V, a 5ª justa entre o baixo e o 3º grau abaixado (lá♭–mi♭) vai a outra 5ª (sol–ré).",
    function* (ex, ctx) {
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      for (let i = 0; i + 1 < hs.length; i++) {
        const h = hs[i], prox = hs[i + 1];
        if (h.cifra.aumentada !== "Ger") continue;
        if (!(prox.cifra.grau === 1 && prox.cifra.seisQuatro)) yield [ex.compassoDe(prox.inicio), `${h.texto} → ${prox.texto}: a sexta alemã vai ao I6/4 cadencial antes do V (senão, quintas paralelas nas vozes internas)`, [h.baixo, prox.baixo]];
      }
    }, {
      precisaTom: true,
      porque: "A Ger65 tem uma 5ª justa sobre o baixo (lá♭–mi♭ em dó). Se o baixo desce ao sol e o mi♭ desce ao ré, saem quintas paralelas — as 'quintas de Mozart'. O I6/4 segura o mi♭ (que é a 3ª do i6/4) e evita o problema.",
      corrigir: "Ponha um I6/4 (i6/4) entre a Ger65 e o V, sobre o mesmo 5º grau no baixo; ou troque a Ger65 por It6 ou Fr43, que vão direto ao V.",
    });

  M.definirRegra("aum_exige", "Sexta aumentada pedida",
    "O exercício pede um número mínimo de sextas aumentadas (It6, Fr43 ou Ger65) nas cifras.",
    function* (ex, ctx) {
      if (!ctx.aumentadas) return;
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra && h.cifra.aumentada);
      if (hs.length < ctx.aumentadas) yield [ex.compassoDe(ex.fim - 1), `${hs.length} sexta(s) aumentada(s); o exercício pede pelo menos ${ctx.aumentadas}`, []];
    }, {
      precisaTom: true,
      porque: "O exercício existe para você usar o acorde no lugar certo: antes da dominante, preparado por uma pré-dominante.",
      corrigir: "Procure o ponto em que o baixo pode ir do 6º grau abaixado ao 5º e escreva It6, Fr43 ou Ger65 ali.",
    });
  M.PRECISA_FIM.add("aum_exige");

  // perfil do capítulo: o cromatismo é permitido, os saltos aumentados não
  const { intervalo_melodico_aumentado_diminuto: _i, dissonancia_aproximacao: _d, cifras_coerentes: _c, ...BASE } = TONAL;
  const AUM = { ...BASE, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", aum_resolucao: "erro", aum_ger_64: "erro" };

  // ================================================================== capítulo 1
  T.inserir(4, {
    id: "aumentadas", titulo: "Sextas aumentadas",
    antes: [
      { p: "Em dó menor, quais são as notas da sexta alemã (Ger65)?", o: ["lá♭–dó–mi♭–fá♯", "lá♭–dó–fá♯", "lá♭–dó–ré–fá♯", "fá–lá♭–dó–mi♭"], e: "As três sextas aumentadas têm o mesmo núcleo — lá♭ (6º abaixado), dó (tônica) e fá♯ (4º elevado). A italiana fica só nisso; a francesa acrescenta ré (2º grau); a alemã acrescenta mi♭ (3º abaixado). Fá–lá♭–dó–mi♭ é o iv7." },
      { p: "Como resolve o intervalo de 6ª aumentada lá♭–fá♯?", o: ["Abre por semitom nos dois sentidos, até a oitava sol–sol", "Fecha numa 5ª (sol–ré)", "O lá♭ sobe ao lá e o fá♯ sobe ao sol", "Fica parado e o resto do acorde muda"], e: "As duas notas são sensíveis da dominante: lá♭ desce ao sol, fá♯ sobe ao sol. A 6ª aumentada se abre na oitava — por isso nenhuma das duas pode ser dobrada (sairiam oitavas paralelas)." },
      { p: "Por que a sexta alemã costuma ir ao i6/4 cadencial, e não direto ao V?", o: ["Porque indo direto ao V o mi♭ desce ao ré e forma quintas paralelas com o baixo (lá♭–mi♭ → sol–ré)", "Porque o V não contém o sol", "Porque o 6/4 é obrigatório em toda cadência", "Porque a alemã não tem 6ª aumentada"], e: "A alemã tem uma 5ª justa sobre o baixo. No i6/4 o mi♭ fica parado (é a 3ª do i6/4) e só depois desce ao ré, quando o baixo já está no sol. As 'quintas de Mozart' (Ger65 → V direto) aparecem na prática clássica, mas são a exceção." },
    ],
    objetivo: "Usar a sexta italiana, a francesa e a alemã antes da dominante, em menor e em maior, com o ♭6 e o ♯4 abrindo por semitom na oitava do 5º grau.",
    ouvir: ["Mozart, Sonata em lá menor K. 310, 1º mov.: sextas aumentadas antes das semicadências", "Beethoven, Sinfonia n.º 5, 1º mov.: as sextas aumentadas nas preparações da dominante", "Bach, Cantatas e Paixões: o iv6–V frígio, de onde a sexta aumentada nasce", "Schubert, lieder: a Ger65 como cor nas cadências"],
    esboco: "Em dó menor, o baixo faz lá♭ → sol (iv6 → V, a cadência frígia). Que nota da melodia você alteraria cromaticamente sobre o lá♭ para intensificar a chegada ao sol?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Duas sensíveis para a dominante", html: `
        <p>A sexta aumentada nasce da <b>cadência frígia</b> (iv6 → V em menor: baixo ♭6 → 5, voz superior 4 → 5). Elevando o 4º grau, a voz de cima ganha também uma sensível: o acorde passa a ter <b>duas notas que caminham por semitom até o 5º grau</b>, uma de baixo (♭6 → 5) e uma de cima (♯4 → 5). Entre elas soa a 6ª aumentada, que <b>se abre na oitava</b>. Os tratados clássicos (e, hoje, Aldwell &amp; Schachter, Piston, Kostka) a tratam como pré-dominante cromática: vem depois de iv/IV, iv6 ou VI e vai ao V ou ao I6/4 cadencial.</p>
        <table class="tabela-modos"><thead><tr><th>Cifra</th><th>Em dó menor</th><th>Acréscimo</th><th>Vai para</th></tr></thead><tbody>
        <tr><td>It6</td><td>lá♭ – dó – fá♯</td><td>dobra-se a tônica (dó)</td><td>V</td></tr>
        <tr><td>Fr43</td><td>lá♭ – dó – ré – fá♯</td><td>2º grau (ré), nota comum com o V</td><td>V (ou V7)</td></tr>
        <tr><td>Ger65</td><td>lá♭ – dó – mi♭ – fá♯</td><td>3º abaixado (mi♭)</td><td>i6/4 → V</td></tr>
        </tbody></table>
        <p>Os nomes "italiana", "francesa" e "alemã" são convenção didática: não indicam origem nacional comprovada. As cifras <b>It6, Fr43, Ger65</b> lembram os intervalos sobre o baixo (6; 6/4/3; 6/5/3).</p>
        <h3>A regra, como os manuais a dão</h3>
        <ul><li><b>Grafia:</b> o ♭6 no baixo (posição normal) e o ♯4 numa voz superior. Em maior, ♭6 e ♭3 são emprestados do menor: em dó maior, lá♭ – dó – (ré | mi♭) – fá♯.</li>
        <li><b>Resolução:</b> ♭6 desce meio tom, ♯4 sobe meio tom — <b>nunca dobre nenhum dos dois</b>. A tônica (dó) desce ao si ou fica como 4ª do I6/4.</li>
        <li><b>Preparação:</b> o melhor caminho é o iv6 (o baixo já está no ♭6; o 4 sobe cromaticamente ao ♯4) ou o VI; em maior, o IV6 (o baixo desce cromaticamente lá → lá♭) ou o IV (fá → fá♯ numa voz superior).</li>
        <li><b>Alemã:</b> vai ao <b>I6/4 cadencial</b>. Direto ao V, o mi♭ desceria ao ré em quintas paralelas com o baixo (lá♭–mi♭ → sol–ré). Em maior, o ♭3 sobe cromaticamente para a 3ª maior do I6/4 (mi♭ → mi) — por isso muitos o escrevem ré♯ (próximo capítulo).</li>
        <li><b>Duas vozes:</b> aqui trabalhamos com o par soprano–baixo e as cifras. Ponha o ♯4 no soprano quando quiser a 6ª aumentada à mostra (as vozes externas abrem na oitava); com o soprano na tônica ou no ♭3, o ♯4 fica numa voz interna implícita.</li></ul>` },
      { tipo: "exemplo", titulo: "Da cadência frígia à sexta alemã", intro: "Dó menor. Mesmo começo nas três camadas; o que muda é a chegada à dominante.",
        camadas: [
          { titulo: "A cadência frígia (iv6 → V)", partitura: "tom: C menor\nsoprano: C5/1 D5/1 Eb5/1 C5/1 Ab4/1 F4/2 G4/1\nbaixo: C3/1 B2/1 C3/1 Eb3/1 F3/1 Ab3/2 G3/1", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "i6"], [4, "iv"], [5, "iv6"], [7, "V"]],
            notas: [["decisao", "Semicadência frígia: o baixo desce lá♭ → sol (meio tom) e o soprano sobe fá → sol. É a fórmula barroca de onde a sexta aumentada sai."],
              ["checagem", "Fá4 sobre lá♭3 é 6ª maior; sol4 sobre sol3, oitava, por movimento contrário."]] },
          { titulo: "O ♯4: a sexta italiana", partitura: "tom: C menor\nsoprano: C5/1 D5/1 Eb5/1 C5/1 Ab4/1 F4/1 F#4/1 G4/1\nbaixo: C3/1 B2/1 C3/1 Eb3/1 F3/1 Ab3/1 Ab3/1 G3/1", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "i6"], [4, "iv"], [5, "iv6"], [6, "It6"], [7, "V"]],
            anotacoes: [[0, 6, "♯4"], [1, 6, "♭6"]],
            notas: [["decisao", "O mesmo iv6, agora com o fá subindo cromaticamente a fá♯ sobre o lá♭ que fica: a 6ª maior vira 6ª aumentada e as duas vozes abrem na oitava sol3–sol4."],
              ["rejeitada", "Pensei em chegar ao fá♯ direto do lá♭4 (que soava antes): seria uma 3ª diminuta melódica, difícil de cantar e sem a lógica de passagem. O fá intermediário (iv6) é o caminho clássico."],
              ["checagem", "Nenhuma das notas da 6ª aumentada está dobrada: dó, a tônica, é a nota dobrada da italiana (nas vozes internas)."]],
            pausa: ["Por que a sexta italiana soa mais 'urgente' que o iv6 que ela substitui?", "Porque o iv6 tem uma só nota atraída por semitom para a dominante (o lá♭ do baixo); a italiana tem duas, em sentidos contrários. A chegada ao V fica mais inevitável — e mais tensa."] },
          { titulo: "A frase inteira: italiana na semicadência, alemã na cadência", partitura: "tom: C menor\nsoprano: C5/1 D5/1 Eb5/1 C5/1 Ab4/1 F4/1 F#4/1 G4/1 C5/2 Ab4/1 C5/1 C5/1 B4/1 C5/2\nbaixo: C3/1 B2/1 C3/1 Eb3/1 F3/1 Ab3/1 Ab3/1 G3/1 Eb3/2 F3/1 Ab3/1 G3/1 G3/1 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "i6"], [4, "iv"], [5, "iv6"], [6, "It6"], [7, "V"], [8, "i6"], [10, "iv"], [11, "Ger65"], [12, "i64"], [13, "V"], [14, "i"]],
            notas: [["decisao", "Compasso 3: iv → Ger65 com o soprano no dó (nota comum), que fica como 4ª do i6/4 e desce ao si — a cadência composta clássica."],
              ["decisao", "A alemã vai ao i6/4: o mi♭ (voz interna) fica parado, porque é a 3ª do i6/4; só desce ao ré quando o baixo já chegou ao sol."],
              ["rejeitada", "Ger65 → V direto daria lá♭–mi♭ → sol–ré nas vozes internas: as 'quintas de Mozart'. Correto na prática clássica como exceção, não como regra (veja a quebra)."],
              ["checagem", "As duas sextas aumentadas vêm de pré-dominantes (iv6, iv) e vão à dominante; a italiana tem a 6ª aumentada nas vozes externas, a alemã a deixa nas internas."]],
            pausa: ["A frase tem duas sextas aumentadas. Por que a segunda é a alemã, e não outra italiana?", "Porque a alemã é a mais cheia (quatro sons, com a 5ª justa sobre o baixo) e pede o i6/4: isso alarga a cadência final, enquanto a italiana, mais leve, serve à semicadência do meio. A hierarquia das cadências fica audível."] },
        ] },
      { tipo: "contraste", titulo: "A alemã em menor e em maior",
        a: { rotulo: "A — dó menor: o mi♭ fica", partitura: "tom: C menor\nsoprano: Eb5/1 C5/1 C5/2 C5/1 B4/1 C5/2\nbaixo: C3/1 F3/1 Ab3/2 G3/1 G3/1 C3/2", cifras: [[0, "i"], [1, "iv"], [2, "Ger65"], [4, "i64"], [5, "V"], [6, "i"]] },
        b: { rotulo: "B — dó maior: o mi♭ sobe a mi", partitura: "tom: C maior\nsoprano: E5/1 C5/1 C5/2 C5/1 B4/1 C5/2\nbaixo: C3/1 F3/1 Ab3/2 G3/1 G3/1 C3/2", cifras: [[0, "I"], [1, "IV"], [2, "Ger65"], [4, "I64"], [5, "V"], [6, "I"]] },
        pergunta: "O par externo é quase igual. O que acontece com o 3º grau abaixado (mi♭, numa voz interna) em cada caso?",
        comentario: "<p>Em menor, o mi♭ da alemã é a própria 3ª do i6/4: fica parado, e a sexta alemã soa como um i6/4 'com o baixo e o ♯4 alterados'. Em maior, o mi♭ é emprestado do menor e precisa <b>subir cromaticamente</b> para o mi do I6/4 — a sonoridade escurece por um instante e clareia na chegada. Como a nota sobe, muitos autores a escrevem ré♯ (a 4ª duplamente aumentada), assunto do próximo capítulo.</p>" },
      { tipo: "quebra", titulo: "As quintas de Mozart", html: `
        <p>A regra do I6/4 depois da alemã é dos manuais; o repertório clássico a quebra com frequência. A Ger65 que vai <b>direto ao V</b> produz quintas paralelas entre o baixo e a voz com o ♭3 (lá♭–mi♭ → sol–ré): o nome corrente, "quintas de Mozart", diz que eram toleradas no estilo clássico, em geral escondidas numa voz interna e encobertas pela força da resolução por semitom das outras vozes.</p>
        <p>O que se ganha: uma cadência mais curta e direta (sem o 6/4) e a cor cheia da alemã até o último instante. O que se paga: as quintas — por isso o compositor cuidadoso as deixa no meio da textura, nunca nas vozes externas. No exemplo, para que você as ouça, a voz interna está exposta no soprano.</p>`,
        exemplos: [
          { rotulo: "Ger65 → V, com as quintas à mostra", partitura: "tom: C menor\nsoprano: G4/1 F4/1 Eb4/1 D4/1 C4/4\nbaixo: Eb3/1 F3/1 Ab2/1 G2/1 C3/4", cifras: [[0, "i6"], [1, "iv"], [2, "Ger65"], [3, "V"], [4, "i"]],
            perfil: { ...AUM, quintas_paralelas: "info", aum_ger_64: "info" },
            comentario: "Lá♭2–mi♭4 → sol2–ré4: quintas paralelas, que no original ficariam numa voz interna. Escrevê-las nas vozes externas, como aqui, é só para o ouvido: na música real, o soprano ficaria no fá♯ → sol ou no dó → si." },
        ] },
    ],
    exercicios: [
      { id: "aum1", titulo: "Completar: italiana e alemã em sol menor", modo: "completar", perfil: { ...AUM }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "i V6 i i6 iv iv6 It6 V i6 iv Ger65 i64 V i".split(" "),
        instrucoes: "<p>O baixo e as cifras estão dados, e o soprano do 1º compasso também. Escreva o soprano dos compassos 2–4 (uma nota por nota do baixo). No It6, ponha o ♯4 (dó♯) no soprano e faça-o chegar por semitom; na Ger65, escolha uma nota que siga sem problema para o i6/4.</p>",
        texto: "tom: G menor\ncf: baixo\nsoprano: Bb4/1 A4/1 G4/1 D5/1\nbaixo: G2/1 F#2/1 G2/1 Bb2/1 C3/1 Eb3/1 Eb3/1 D3/1 Bb2/2 C3/1 Eb3/1 D3/1 D3/1 G2/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G menor\ncf: baixo\nsoprano: Bb4/1 A4/1 G4/1 D5/1 Eb5/1 C5/1 C#5/1 D5/1 G5/2 Eb5/1 Bb4/1 Bb4/1 A4/1 G4/2\nbaixo: G2/1 F#2/1 G2/1 Bb2/1 C3/1 Eb3/1 Eb3/1 D3/1 Bb2/2 C3/1 Eb3/1 D3/1 D3/1 G2/2",
        comentarioSolucao: "No c. 2 o dó5 do iv6 sobe cromaticamente a dó♯5 sobre o mi♭ que fica: a 6ª aumentada mi♭3–dó♯5 abre na oitava ré3–ré5. No c. 3 o si♭4 da alemã (o ♭3) fica parado como 6ª do i6/4 e desce ao lá sobre o V — exatamente o mi♭ do exemplo em dó menor." },
      { id: "aum2", titulo: "Francesa e alemã em ré maior", modo: "menos apoio", perfil: { ...AUM }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, cifrasIniciais: "I V43 I6 IV IV6",
        instrucoes: "<p>O baixo está dado; as cifras, até o IV6 do c. 2. Escreva as cifras restantes e o soprano. O si♭ do baixo (c. 2 e c. 3) é o 6º grau abaixado: use uma <b>Fr43</b> na semicadência do c. 2 e uma <b>Ger65 → I64</b> no c. 3. Em pelo menos uma delas, ponha o ♯4 (sol♯) no soprano.</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano:\nbaixo: D3/1 E3/1 F#3/1 G3/1 B3/1 Bb3/1 A3/2 F#3/1 G3/1 Bb3/2 A3/1 A3/1 D3/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: D maior\ncf: baixo\nsoprano: A4/1 G4/1 F#4/1 B4/1 D5/1 E5/1~ E5/2 D5/1 G4/1 G#4/2 A4/1 C#5/1 D5/2\nbaixo: D3/1 E3/1 F#3/1 G3/1 B3/1 Bb3/1 A3/2 F#3/1 G3/1 Bb3/2 A3/1 A3/1 D3/2",
        solucaoCifras: "I V43 I6 IV IV6 Fr43 V I6 IV Ger65 I64 V I",
        comentarioSolucao: "Em maior, o baixo chega ao ♭6 descendo cromaticamente do 6 (si → si♭: IV6 → Fr43). Na francesa o soprano fica no mi (2º grau), nota comum com o V; na alemã o sol do IV sobe a sol♯ e a lá: a 6ª aumentada si♭3–sol♯4 abre na oitava lá3–lá4 do I6/4." },
      { id: "aum3", titulo: "Restrição: o ré♯ da melodia pede uma sexta aumentada", modo: "restrição", perfil: { ...AUM, aum_exige: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, aumentadas: 1 }, cifrasAluno: true,
        instrucoes: "<p>A melodia está dada, em lá menor. Escreva o baixo e as cifras. <b>Restrição:</b> o ré♯5 do c. 2 tem de ser harmonizado por uma sexta aumentada (o baixo no fá, 6º grau abaixado), preparada por uma pré-dominante e resolvida no V. Termine em cadência perfeita.</p>",
        texto: "tom: A menor\ncf: soprano\nsoprano: C5/1 B4/1 A4/1 E5/1 D5/1 D#5/1 E5/2 E5/1 D5/1 C5/1 B4/1 A4/4\nbaixo:", duracao: 1, alvoCompassos: 4,
        solucao: "tom: A menor\ncf: soprano\nsoprano: C5/1 B4/1 A4/1 E5/1 D5/1 D#5/1 E5/2 E5/1 D5/1 C5/1 B4/1 A4/4\nbaixo: A2/1 G#2/1 A2/1 C3/1 F3/1 F3/1 E3/2 C3/1 D3/1 A2/1 E3/1 A2/4",
        solucaoCifras: "i V6 i i6 iv6 It6 V i6 iv i V i",
        comentarioSolucao: "O ré5 do c. 2 cabe no iv6 (fá no baixo); quando ele sobe a ré♯, o mesmo fá vira o ♭6 de uma italiana. É a cadência frígia intensificada, em movimento contrário: fá3 → mi3 embaixo, ré♯5 → mi5 em cima." },
      { id: "aum4", titulo: "Livre: frase com sexta aumentada em si♭ maior", modo: "livre", perfil: { ...AUM, aum_exige: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, aumentadas: 2 }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha soprano, baixo e cifras de uma frase de 4 compassos em si♭ maior com <b>duas</b> sextas aumentadas: uma na semicadência do meio e uma (alemã, com o I6/4) na cadência final. O ♭6 de si♭ maior é sol♭.</p>",
        texto: "tom: Bb maior\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: Bb maior\nsoprano: F4/1 Eb4/1 D4/1 G4/1 Bb4/1 C5/1~ C5/2 Bb4/1 Eb4/1 E4/2 F4/1 A4/1 Bb4/2\nbaixo: Bb2/1 C3/1 D3/1 Eb3/1 G3/1 Gb3/1 F3/2 D3/1 Eb3/1 Gb3/2 F3/1 F3/1 Bb2/2",
        solucaoCifras: "I V43 I6 IV IV6 Fr43 V I6 IV Ger65 I64 V I" },
      { id: "aum5", titulo: "Quebrar: a alemã direto ao V", modo: "quebrar", perfil: { ...AUM, aum_ger_64: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "I V43 I6 I IV6 Ger65 V I6 ii6 V V7 I".split(" "),
        instrucoes: "<p>Quebre a regra no c. 2: a <b>Ger65 vai direto ao V</b>, sem o I6/4 — as 'quintas de Mozart' do estilo clássico. Escreva o soprano dos c. 2–4 de modo que as quintas fiquem <b>só nas vozes internas</b>: no soprano, faça o ♯4 (fá♯) subir ao sol, vindo do fá do IV6 por semitom.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/1 D5/1 C5/1 E5/1\nbaixo: C3/1 D3/1 E3/1 C3/1 A2/1 Ab2/1 G2/2 E3/1 F3/1 G3/1 G2/1 C3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 D5/1 C5/1 E5/1 F5/1 F#5/1 G5/2 G5/1 F5/1 D5/1 B4/1 C5/4\nbaixo: C3/1 D3/1 E3/1 C3/1 A2/1 Ab2/1 G2/2 E3/1 F3/1 G3/1 G2/1 C3/4",
        comentarioSolucao: "Fá5 → fá♯5 → sol5 contra lá2 → lá♭2 → sol2: as vozes externas abrem em movimento contrário até a oitava, e o soprano não tem quintas com o baixo. As quintas lá♭–mi♭ → sol–ré existem, mas numa voz interna — onde Mozart as deixava." },
    ],
  });

  // ================================================================== capítulo 2
  const AUM2 = { ...AUM };
  T.inserir(4, {
    id: "aumentadas2", titulo: "Sextas aumentadas além do V",
    antes: [
      { p: "Em dó maior, a Ger65 (lá♭–dó–mi♭–fá♯) soa igual a que acorde?", o: ["Lá♭7, o V7 de ré♭ (fá♯ = sol♭)", "Ré7, o V7/V", "Fá♯°7", "Lá♭ maior com 6ª"], e: "Escrevendo o fá♯ como sol♭, a alemã vira lá♭–dó–mi♭–sol♭: uma dominante com sétima de ré♭, o ♭II de dó. É o pivô da modulação enarmônica meio tom acima (ou, ao contrário, o V7 de dó pode virar a alemã de si)." },
      { p: "Por que, em maior, a alemã às vezes é escrita com ré♯ em vez de mi♭ (lá♭–dó–ré♯–fá♯)?", o: ["Porque a nota sobe ao mi do I6/4: escrita como ré♯, ela é a 4ª duplamente aumentada que resolve por grau ascendente", "Porque ré♯ e mi♭ soam diferente no piano", "Porque a alemã em maior não tem o 3º grau", "Para evitar a 6ª aumentada"], e: "A grafia mostra a direção: mi♭ tende a descer (em menor, fica no i6/4), ré♯ tende a subir. Em maior, o 3º grau abaixado sobe a mi, por isso a grafia ré♯ é a mais lógica — embora mi♭ seja comum." },
      { p: "Uma sexta aumentada pode preparar outro acorde que não o V do tom?", o: ["Sim: qualquer acorde maior pode ser preparado pelo ♭6 e pelo ♯4 do seu próprio tom (ex.: a sexta aumentada de lá menor antes de Mi maior, o V/vi de dó)", "Não: ela só existe antes do V", "Só o I", "Só em modulações enarmônicas"], e: "A sexta aumentada é uma dupla sensível de uma nota-alvo. Fá–ré♯ abre na oitava mi–mi; em dó maior isso prepara o Mi maior (V/vi), como uma dominante secundária faria." },
    ],
    objetivo: "Usar a sexta aumentada fora da semicadência no V: como pivô enarmônico (Ger65 = V7), com a grafia da 4ª duplamente aumentada em maior, em outros graus e em inversões.",
    ouvir: ["Schubert, lieder e sonatas: a Ger65 reinterpretada como V7 (modulação meio tom acima)", "Wagner, Tristão e Isolda, Prelúdio, c. 1–3: o 'acorde de Tristão' e a sua resolução no Mi com sétima", "Mozart, Sonata em lá menor K. 310: sextas aumentadas em vários graus no desenvolvimento"],
    esboco: "Toque lá♭–dó–mi♭–fá♯ (Ger65 de dó). Resolva uma vez no i6/4 de dó; depois, chamando o fá♯ de sol♭, resolva no ré♭ maior. Que nota muda de função?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "O mesmo som, outra grafia, outro destino", html: `
        <p>A sexta aumentada é definida pela <b>direção</b> das suas notas, não pelo som. Isso tem três consequências, todas tratadas nos manuais (Aldwell &amp; Schachter, Kostka &amp; Payne, Open Music Theory):</p>
        <h3>1. Ger65 = V7 (enarmonia)</h3>
        <p>Lá♭–dó–mi♭–fá♯ e lá♭–dó–mi♭–sol♭ soam iguais. Como Ger65 de dó, o fá♯ sobe e o lá♭ desce (abrem para o sol); como V7 de ré♭, o sol♭ (7ª) desce ao fá e o lá♭ (fundamental) salta para o ré♭. O inverso também vale: o V7 de dó (sol–si–ré–fá) é a Ger65 de si (sol–si–ré–mi♯), e pode abrir para o i6/4 de si. É a <b>modulação enarmônica</b> por meio tom (assunto do capítulo de modulação); na cifra, escreva as duas leituras: <code>Ger65=Db:V7</code> ou <code>V7=b:Ger65</code>.</p>
        <h3>2. A 4ª duplamente aumentada</h3>
        <p>Em maior, o ♭3 da alemã sobe à 3ª maior do I6/4 (mi♭ → mi em dó). Escrito ré♯, ele forma com o baixo uma <b>4ª duplamente aumentada</b> (lá♭–ré♯) e resolve por grau ascendente, como uma sensível. A grafia mi♭ é comum, mas é a ré♯ que mostra a condução. (O verificador aceita as duas na Ger65.)</p>
        <h3>3. Outros graus e inversões</h3>
        <ul><li><b>Outros alvos:</b> o ♭6–♯4 de qualquer tom prepara a sua dominante. Em dó maior, fá–(lá)–(si)–ré♯ é a sexta aumentada de lá menor e prepara o Mi maior (V/vi). Na cifra, troque o tom: <code>a:Fr43</code>, depois <code>C:V/vi</code>.</li>
        <li><b>Inversões:</b> com o ♯4 no baixo, a 6ª aumentada vira <b>3ª diminuta</b> (ou 10ª diminuta), que fecha no uníssono/oitava: fá♯ sobe, lá♭ desce, ambos ao sol. É menos comum que a posição com o ♭6 no baixo; os tratados a admitem, sobretudo para a italiana e a francesa.</li>
        <li><b>Acorde de nota comum:</b> sobre a tônica no baixo, lá♭–ré♯–fá♯ (com dó) enfeita o próprio I em vez de levar ao V — a "sexta aumentada de nota comum" (CT+6) da Open Music Theory, frequente no século XIX.</li></ul>` },
      { tipo: "exemplo", titulo: "Sexta alemã e V7: a mesma sonoridade", intro: "Dó maior, modulando a ré♭ maior pelo lá♭7.",
        camadas: [
          { titulo: "Ger65 = V7 de ré♭", partitura: "tom: C maior\nsoprano: E5/1 G5/1 F5/1 Gb5/1 F5/1 Db5/1 Db5/1 C5/1 Db5/4\nbaixo: C3/1 E3/1 A2/1 Ab2/1 Db3/1 Gb3/1 Ab3/1 Ab3/1 Db3/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "I6"], [2, "IV6"], [3, "Ger65=Db:V7"], [4, "Db:I"], [5, "IV"], [6, "I64"], [7, "V"], [8, "I"]],
            contexto: { plano: { cadencia: 3, tomFinal: "Db maior" } },
            notas: [["decisao", "IV6 → (lá♭ no baixo): o baixo desce cromaticamente lá → lá♭, como antes de uma sexta aumentada. O ouvido espera a Ger65 abrindo para o I6/4 de dó."],
              ["decisao", "Mas o soprano escreve sol♭5 (não fá♯) e desce ao fá: o acorde se revela V7 de ré♭, e o baixo salta lá♭ → ré♭. A 6ª aumentada não abre — fecha como 7ª menor."],
              ["rejeitada", "Pensei em escrever fá♯5 no soprano: seria a grafia da sexta alemã, que pede o sol. Como a nota desce, a grafia certa é sol♭."],
              ["checagem", "Em ré♭: IV → I6/4 → V → I confirma o tom novo com cadência perfeita."]],
            pausa: ["Em que momento o ouvinte percebe que não haverá a cadência em dó?", "Só na resolução: até o lá♭7 soar, nada distingue Ger65 de V7. É o ré♭ no baixo (e o sol♭ descendo ao fá) que reescreve o acorde para trás — o princípio de toda modulação enarmônica."] },
        ] },
      { tipo: "exemplo", titulo: "A 4ª duplamente aumentada em maior", intro: "Dó maior: a alemã com ré♯ no soprano.",
        camadas: [
          { titulo: "Ré → ré♯ → mi", partitura: "tom: C maior\nsoprano: E5/2 D5/1 D#5/1 E5/1 D5/1 C5/2\nbaixo: C3/2 F3/1 Ab3/1 G3/1 G3/1 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [2, "ii6"], [3, "Ger65"], [4, "I64"], [5, "V"], [6, "I"]],
            anotacoes: [[0, 2, "4ª dupl. aum."]],
            notas: [["decisao", "Do ii6 (ré no soprano) a voz sobe cromaticamente ré → ré♯ → mi: o ré♯ é a 'sensível' do mi do I6/4. Escrita mi♭, a mesma nota pareceria descer."],
              ["decisao", "O baixo, ao mesmo tempo, vai de fá ao lá♭ (♭6) e desce ao sol: a cadência composta I6/4–V–I completa."],
              ["checagem", "Lá♭3–ré♯5 é uma 4ª duplamente aumentada composta; resolve em sol3–mi5 (6ª), sem quintas — a mesma razão pela qual a alemã vai ao 6/4."]] },
        ] },
      { tipo: "exemplo", titulo: "Outros graus e inversões",
        camadas: [
          { titulo: "Sexta aumentada de lá menor dentro de dó maior", partitura: "tom: C maior\nsoprano: E5/1 G5/1 A5/1 G#5/1 A5/1 F5/1 E5/1 D5/1 C5/4\nbaixo: C3/1 E3/1 F3/1 E3/1 A2/1 D3/1 G2/1 G2/1 C3/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "I6"], [2, "a:Fr43"], [3, "C:V/vi"], [4, "vi"], [5, "ii"], [6, "I64"], [7, "V"], [8, "I"]],
            notas: [["decisao", "Fá–lá–si–ré♯ é a francesa de lá menor: o fá desce ao mi, o ré♯ (voz interna) sobe ao mi, e o Mi maior soa como dominante de lá (V/vi)."],
              ["decisao", "O soprano fica no lá (tônica de lá menor, nota da francesa) e desce ao sol♯: a sensível do vi, que sobe de novo ao lá."],
              ["checagem", "Depois do vi, a frase volta a dó com ii–I6/4–V–I: a sexta aumentada só tonicizou o vi, como uma dominante secundária."]] },
          { titulo: "Italiana invertida: o ♯4 no baixo", partitura: "tom: C menor\nsoprano: C5/1 B4/1 C5/1 Ab4/1 Ab4/2 G4/2 G4/1 Ab4/1 Eb5/1 D5/1 C5/4\nbaixo: C3/1 D3/1 Eb3/1 F3/1 F#3/2 G3/2 Eb3/1 F3/1 G3/1 G3/1 C3/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [1, "V43"], [2, "i6"], [3, "iv"], [4, "It (♯4 no baixo)"], [6, "V"], [8, "i6"], [9, "iv"], [10, "i64"], [11, "V"], [12, "i"]],
            perfil: (({ aum_cifras, aum_resolucao, ...p }) => p)(AUM2), contexto: { plano: { cadencia: 4 } },
            notas: [["decisao", "O baixo sobe fá → fá♯ → sol e o soprano segura o lá♭ (que vem do iv): a 6ª aumentada aparece invertida, como 3ª diminuta composta fá♯3–lá♭4, que fecha na oitava sol3–sol4."],
              ["rejeitada", "Pensei em dobrar o lá♭ no baixo e no soprano (iv6 → It6 normal): é a posição de manual, mas aqui eu queria o baixo subindo cromaticamente para a dominante."],
              ["checagem", "As cifras de sexta aumentada do verificador supõem o ♭6 no baixo, por isso esta camada é conferida sem a regra de cifras; as vozes e as paralelas, sim."]],
            pausa: ["O que soa mais áspero: a 6ª aumentada (lá♭ embaixo, fá♯ em cima) ou a 3ª diminuta (fá♯ embaixo, lá♭ em cima)?", "Em geral a 3ª diminuta: as duas notas estão 'apertadas' e convergem para a mesma nota em vez de se abrirem. Por isso a inversão é mais rara e costuma aparecer em passagens cromáticas do baixo, como aqui."] },
        ] },
      { tipo: "contraste", titulo: "Mesmo acorde, duas resoluções",
        a: { rotulo: "A — Ger65: abre para o I6/4 de dó", partitura: "tom: C maior\nsoprano: E5/1 F5/1 F#5/2 G5/1 F5/1 E5/2\nbaixo: C3/1 A2/1 Ab2/2 G2/1 G2/1 C3/2", cifras: [[0, "I"], [1, "IV6"], [2, "Ger65"], [4, "I64"], [5, "V7"], [6, "I"]] },
        b: { rotulo: "B — V7 de ré♭: fecha no ré♭", partitura: "tom: C maior\nsoprano: E5/1 F5/1 Gb5/2 F5/4\nbaixo: C3/1 A2/1 Ab2/2 Db3/4", cifras: [[0, "I"], [1, "IV6"], [2, "Ger65=Db:V7"], [4, "Db:I"]] },
        pergunta: "Os dois primeiros tempos e o acorde do 3º tempo soam iguais. Onde está a diferença, e o que o ouvinte ouve primeiro?",
        comentario: "<p>Em A, fá♯ sobe a sol e lá♭ desce a sol: a 6ª aumentada abre, e dó se confirma. Em B, a mesma nota (agora sol♭) desce ao fá e o baixo cai ao ré♭: a 6ª aumentada virou 7ª menor de uma dominante. O ouvinte só decide <b>depois</b> — e é isso que torna a enarmonia uma ferramenta de surpresa e de modulação distante.</p>" },
      { tipo: "quebra", titulo: "Wagner: a sexta aumentada que não resolve onde deve", html: `
        <p>No Romantismo tardio a sexta aumentada deixa de ser só uma pré-dominante e vira <b>cor e ambiguidade</b>. O exemplo mais estudado é o começo do Prelúdio de <i>Tristão e Isolda</i> de Wagner: o "acorde de Tristão" (fá–si–ré♯–sol♯) soa enquanto o oboé sobe sol♯ → lá → lá♯ → si, e a frase para num mi com sétima — uma dominante que não resolve na tônica. Uma das leituras correntes (há várias, e a discussão é famosa) ouve o sol♯ como apojatura do lá, o que faz do acorde uma <b>francesa de lá menor</b> (fá–lá–si–ré♯) que vai ao seu V7 — e para aí.</p>
        <p>O que se quebra: a sexta aumentada chega com a nota "errada" (a apojatura) no tempo forte, e a dominante a que ela leva não resolve. O que se ganha: o anseio sem resolução que define a obra. Outra quebra romântica é a enarmonia usada sem modular: a Ger65 resolvida como V7 do ♭II, que volta logo ao tom (segundo exemplo).</p>`,
        exemplos: [
          { rotulo: "Esquema do Tristão (redução a duas vozes, não a partitura)", partitura: "tom: A menor\nsoprano: G#4/1.5 A4/0.5 A#4/1 B4/1\nbaixo: F3/2 E3/2", cifras: [[0, "Fr43 (com apojatura)"], [2, "V7"]],
            perfil: { quintas_paralelas: "erro", oitavas_paralelas: "erro", cruzamento_de_vozes: "erro", aum_cromatismo: "erro" },
            comentario: "Sol♯ sobre o fá (o 'acorde de Tristão'), resolvido em lá (a francesa de lá menor); o lá♯ passa ao si sobre o mi com sétima. O baixo fá → mi é o ♭6 → 5 da sexta aumentada — mas a dominante fica sem tônica." },
          { rotulo: "Ger65 como V7 do ♭II, sem modular", partitura: "tom: C maior\nsoprano: E5/1 F5/1 Gb5/2 F5/1 Db5/1 C5/1 B4/1 C5/4\nbaixo: C3/1 A2/1 Ab2/2 F2/2 G2/1 G2/1 C3/4", cifras: [[0, "I"], [1, "IV6"], [2, "Ger65=Db:V7"], [4, "C:N6=Db:I6"], [6, "C:I64"], [7, "V7"], [8, "I"]],
            perfil: { ...AUM2 },
            comentario: "O lá♭7 resolve como dominante no ré♭ (que é a napolitana de dó) e a frase volta a dó pela cadência N6–I6/4–V7–I. A sexta aumentada não abriu: o 'som' da alemã serviu de dominante de passagem." },
        ] },
    ],
    exercicios: [
      { id: "aum6", titulo: "Completar: o V7 de dó vira a alemã de si", modo: "completar", perfil: { ...AUM2 }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4, tomFinal: "B menor" } },
        cifras: "I V43 I6 IV V7=b:Ger65 b:i64 b:V b:i b:iv b:V b:i".split(" "),
        instrucoes: "<p>Dó maior, modulando a <b>si menor</b>. O baixo, as cifras e o soprano do c. 1 estão dados. No c. 2, o sol7 (V7 de dó) é reinterpretado como Ger65 de si (o fá vira mi♯) e abre para o i6/4 de si. Escreva o soprano dos c. 2–4: uma escolha segura é a nota comum (si ou ré) sobre o V7, que fica no i6/4.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: G5/1 F5/1 E5/1 A5/1\nbaixo: C3/1 D3/1 E3/1 F3/1 G3/2 F#3/1 F#3/1 B2/1 E3/1 F#3/2 B2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: G5/1 F5/1 E5/1 A5/1 D5/2 D5/1 C#5/1 D5/1 B4/1 A#4/2 B4/4\nbaixo: C3/1 D3/1 E3/1 F3/1 G3/2 F#3/1 F#3/1 B2/1 E3/1 F#3/2 B2/4",
        comentarioSolucao: "O ré5 é nota comum do sol7 e do i6/4 de si: fica parado, e a surpresa vem do baixo (sol → fá♯) e da voz interna (fá = mi♯ → fá♯). Si menor se confirma com duas cadências V–i." },
      { id: "aum7", titulo: "A 4ª duplamente aumentada em lá maior", modo: "menos apoio", perfil: { ...AUM2 }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, cifrasIniciais: "I V6 I I6 IV ii V",
        instrucoes: "<p>O baixo está dado, e as cifras dos c. 1–2. Escreva as cifras dos c. 3–4 e o soprano inteiro. No fá do c. 3 use uma <b>Ger65 → I64</b> e escreva no soprano a grafia de 4ª duplamente aumentada: <b>si♯</b> (não dó), subindo ao dó♯ do I6/4.</p>",
        texto: "tom: A maior\ncf: baixo\nsoprano:\nbaixo: A2/1 G#2/1 A2/1 C#3/1 D3/1 B2/1 E3/2 C#3/1 D3/1 F3/2 E3/1 E3/1 A2/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: A maior\ncf: baixo\nsoprano: C#5/1 B4/1 A4/1 E5/1 D5/1 D5/1 B4/2 A4/1 B4/1 B#4/2 C#5/1 B4/1 A4/2\nbaixo: A2/1 G#2/1 A2/1 C#3/1 D3/1 B2/1 E3/2 C#3/1 D3/1 F3/2 E3/1 E3/1 A2/2",
        solucaoCifras: "I V6 I I6 IV ii V I6 ii6 Ger65 I64 V I",
        comentarioSolucao: "Lá4 – si4 – si♯4 – dó♯5: o soprano sobe cromaticamente enquanto o baixo vai de ré a fá e desce ao mi. Si♯ (e não dó♮) porque a nota sobe — a grafia conta a condução." },
      { id: "aum8", titulo: "Restrição: sexta aumentada para o V/vi", modo: "restrição", perfil: { ...AUM2, aum_exige: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, aumentadas: 1 }, cifrasAluno: true,
        instrucoes: "<p>Sol maior. A melodia está dada; escreva baixo e cifras. <b>Restrição:</b> o lá♯4 do c. 2 é o ♯4 de <b>mi menor</b>: harmonize-o com uma sexta aumentada de mi menor (baixo no dó) que abra para o Si maior (V/vi). Escreva <code>e:It6</code> (ou <code>e:Fr43</code>, <code>e:Ger65</code>) e volte com <code>G:V/vi</code>. Termine em cadência perfeita em sol.</p>",
        texto: "tom: G maior\ncf: soprano\nsoprano: B4/1 A4/1 G4/1 B4/1 A4/1 A#4/1 B4/2 G4/1 C5/1 B4/1 A4/1 G4/4\nbaixo:", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G maior\ncf: soprano\nsoprano: B4/1 A4/1 G4/1 B4/1 A4/1 A#4/1 B4/2 G4/1 C5/1 B4/1 A4/1 G4/4\nbaixo: G2/1 F#2/1 G2/1 E2/1 A2/1 C3/1 B2/2 E3/1 C3/1 D3/1 D3/1 G2/4",
        solucaoCifras: "I V6 I vi ii e:It6 G:V/vi vi IV I64 V I",
        comentarioSolucao: "Dó3–lá♯4 abre em si2–si4: a italiana de mi menor faz do Si maior uma dominante local, e o vi que vem depois soa como chegada — a sexta aumentada tonicizou o vi do mesmo modo que um V/vi faria." },
      { id: "aum9", titulo: "Quebrar: a alemã que vira dominante da napolitana", modo: "quebrar", perfil: { ...AUM2, aum_resolucao: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "i V6 i i6 iv Ger65=F:V7 e:N6=F:I6 e:i64 e:V e:i".split(" "),
        instrucoes: "<p>Mi menor. Quebre a resolução no c. 2: o dó–mi–sol–lá♯ (Ger65 de mi) é tratado como <b>dó7, dominante de fá</b> — e fá maior é a napolitana de mi. A 6ª aumentada não abre: o lá♯ vira si♭ e desce. Escreva o soprano dos c. 2–4; sobre a napolitana use o fá (♭2), que desce ao mi e ao ré♯ na cadência (♭2–1–7–1).</p>",
        texto: "tom: E menor\ncf: baixo\nsoprano: G4/1 F#4/1 E4/1 B4/1\nbaixo: E3/1 D#3/1 E3/1 G3/1 A3/2 C4/2 A3/2 B3/1 B3/1 E3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: E menor\ncf: baixo\nsoprano: G4/1 F#4/1 E4/1 B4/1 C5/2 E5/2 F5/2 E5/1 D#5/1 E5/4\nbaixo: E3/1 D#3/1 E3/1 G3/1 A3/2 C4/2 A3/2 B3/1 B3/1 E3/4",
        comentarioSolucao: "O mi5 sobre o dó7 é a sensível de fá e sobe ao fá5 da napolitana; a 6ª aumentada dó–lá♯ (escrita si♭) fecha em vez de abrir. Depois o fá desce ao mi (i6/4) e ao ré♯ (V): a cadência de mi menor absorve o desvio." },
    ],
  });
})(this);
