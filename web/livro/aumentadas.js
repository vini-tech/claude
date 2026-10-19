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
  delete AUM.aumentada_resolve; // a do capítulo (aum_resolucao) também confere o acorde seguinte e o dobramento

  // ================================================================== capítulo 1
  T.inserir(4, {
    id: "aumentadas", titulo: "Sextas aumentadas",
    objetivo: "Usar It6, Fr43 e Ger65 antes do V, em menor e maior, com ♭6 e ♯4 abrindo por semitom na oitava do 5º grau.",
    ouvir: ["Mozart, Sonata K. 310, 1º mov.", "Beethoven, Sinfonia nº 5, 1º mov.", "Bach, Paixões: o iv6–V frígio"],
    esboco: "Dó menor, baixo lá♭ → sol (cadência frígia). Que nota da melodia você alteraria sobre o lá♭ para intensificar a chegada?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Duas sensíveis para a dominante", html: `
        <p>Nasce da <b>cadência frígia</b> (iv6 → V) com o 4º elevado: <b>duas sensíveis do 5º grau</b>, ♭6 ↓ e ♯4 ↑, que abrem a 6ª aumentada na oitava. Pré-dominante cromática: vem de iv/IV, iv6 ou VI; vai ao V ou ao I6/4.</p>
        <table class="tabela-modos"><thead><tr><th>Cifra</th><th>Em dó menor</th><th>Acréscimo</th><th>Vai para</th></tr></thead><tbody>
        <tr><td>It6</td><td>lá♭ – dó – fá♯</td><td>dobra-se a tônica (dó)</td><td>V</td></tr>
        <tr><td>Fr43</td><td>lá♭ – dó – ré – fá♯</td><td>2º grau (ré), nota comum com o V</td><td>V (ou V7)</td></tr>
        <tr><td>Ger65</td><td>lá♭ – dó – mi♭ – fá♯</td><td>3º abaixado (mi♭)</td><td>i6/4 → V</td></tr>
        </tbody></table>
        <table class="tabela-modos"><thead><tr><th>Aspecto</th><th>Regra</th></tr></thead><tbody>
        <tr><td>Grafia</td><td>♭6 no baixo, ♯4 em cima; em maior, ♭6 e ♭3 vêm do menor</td></tr>
        <tr><td>Resolução</td><td>♭6 ↓, ♯4 ↑ — <b>nunca dobrados</b>; a tônica desce ou fica como 4ª do I6/4</td></tr>
        <tr><td>Preparação</td><td>Menor: iv6 (4 → ♯4) ou VI. Maior: IV6 (baixo lá → lá♭) ou IV (fá → fá♯)</td></tr>
        <tr><td>Alemã</td><td>Vai ao I6/4 (direto ao V: 5ªs lá♭–mi♭ → sol–ré). Em maior, ♭3 sobe a 3 (mi♭ → mi)</td></tr>
        <tr><td>Par externo</td><td>♯4 no soprano mostra a 6ª aum.; senão, fica implícito numa voz interna</td></tr>
        </tbody></table>
        <p>Os nomes nacionais são convenção didática.</p>` },
      { tipo: "exemplo", titulo: "Da cadência frígia à sexta alemã", intro: "Dó menor. Mesmo começo nas três camadas; o que muda é a chegada à dominante.",
        camadas: [
          { titulo: "A cadência frígia (iv6 → V)", partitura: "tom: C menor\nsoprano: C5/1 D5/1 Eb5/1 C5/1 Ab4/1 F4/2 G4/1\nbaixo: C3/1 B2/1 C3/1 Eb3/1 F3/1 Ab3/2 G3/1", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "i6"], [4, "iv"], [5, "iv6"], [7, "V"]],
            notas: [["decisao", "Semicadência frígia: baixo lá♭ → sol, soprano fá → sol."],
              ["checagem", "6ª maior → oitava, por movimento contrário."]] },
          { titulo: "O ♯4: a sexta italiana", partitura: "tom: C menor\nsoprano: C5/1 D5/1 Eb5/1 C5/1 Ab4/1 F4/1 F#4/1 G4/1\nbaixo: C3/1 B2/1 C3/1 Eb3/1 F3/1 Ab3/1 Ab3/1 G3/1", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "i6"], [4, "iv"], [5, "iv6"], [6, "It6"], [7, "V"]],
            anotacoes: [[0, 6, "♯4"], [1, 6, "♭6"]],
            notas: [["decisao", "Fá → fá♯ sobre o lá♭: 6ª maior vira aumentada e abre na oitava."],
              ["rejeitada", "Lá♭4 → fá♯ direto: 3ª diminuta, sem a lógica de passagem."],
              ["checagem", "Nada da 6ª aum. dobrado; a italiana dobra a tônica (voz interna)."]],
            pausa: ["Por que a italiana soa mais urgente que o iv6?", "O iv6 tem uma nota atraída por semitom ao V; a italiana tem duas, em sentidos contrários."] },
          { titulo: "A frase inteira: italiana na semicadência, alemã na cadência", partitura: "tom: C menor\nsoprano: C5/1 D5/1 Eb5/1 C5/1 Ab4/1 F4/1 F#4/1 G4/1 C5/2 Ab4/1 C5/1 C5/1 B4/1 C5/2\nbaixo: C3/1 B2/1 C3/1 Eb3/1 F3/1 Ab3/1 Ab3/1 G3/1 Eb3/2 F3/1 Ab3/1 G3/1 G3/1 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [1, "V6"], [2, "i"], [3, "i6"], [4, "iv"], [5, "iv6"], [6, "It6"], [7, "V"], [8, "i6"], [10, "iv"], [11, "Ger65"], [12, "i64"], [13, "V"], [14, "i"]],
            notas: [["decisao", "C. 3: iv → Ger65, soprano no dó (nota comum), 4ª do i6/4, desce ao si."],
              ["decisao", "Mi♭ (voz interna) fica: é a 3ª do i6/4; desce ao ré só sobre o V."],
              ["rejeitada", "Ger65 → V direto: 'quintas de Mozart' (ver a quebra)."]],
            pausa: ["Por que a segunda é alemã, e não outra italiana?", "A alemã, mais cheia, pede o i6/4 e alarga a cadência final; a italiana, leve, serve à semicadência."] },
        ] },
      { tipo: "contraste", titulo: "A alemã em menor e em maior",
        a: { rotulo: "A — dó menor: o mi♭ fica", partitura: "tom: C menor\nsoprano: Eb5/1 C5/1 C5/2 C5/1 B4/1 C5/2\nbaixo: C3/1 F3/1 Ab3/2 G3/1 G3/1 C3/2", cifras: [[0, "i"], [1, "iv"], [2, "Ger65"], [4, "i64"], [5, "V"], [6, "i"]] },
        b: { rotulo: "B — dó maior: o mi♭ sobe a mi", partitura: "tom: C maior\nsoprano: E5/1 C5/1 C5/2 C5/1 B4/1 C5/2\nbaixo: C3/1 F3/1 Ab3/2 G3/1 G3/1 C3/2", cifras: [[0, "I"], [1, "IV"], [2, "Ger65"], [4, "I64"], [5, "V"], [6, "I"]] },
        pergunta: "O par externo é quase igual. O que acontece com o 3º grau abaixado (mi♭, numa voz interna) em cada caso?",
        comentario: "<p>Menor: o mi♭ é a 3ª do i6/4 e fica parado. Maior: o mi♭ é emprestado e <b>sobe</b> a mi no I6/4 — escurece e clareia. Por subir, muitos o escrevem ré♯ (próximo capítulo).</p>" },
      { tipo: "quebra", titulo: "As quintas de Mozart", html: `
        <table class="tabela-modos"><thead><tr><th>Prática</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Ger65 → V direto (estilo clássico)</td><td>5ªs paralelas lá♭–mi♭ → sol–ré</td><td>Cadência curta, cor cheia até o fim</td></tr>
        </tbody></table>
        <p>Toleradas só numa voz interna, encobertas pelas resoluções por semitom. No exemplo, a voz interna está exposta no soprano para ser ouvida.</p>`,
        exemplos: [
          { rotulo: "Ger65 → V, com as quintas à mostra", partitura: "tom: C menor\nsoprano: G4/1 F4/1 Eb4/1 D4/1 C4/4\nbaixo: Eb3/1 F3/1 Ab2/1 G2/1 C3/4", cifras: [[0, "i6"], [1, "iv"], [2, "Ger65"], [3, "V"], [4, "i"]],
            perfil: { ...AUM, quintas_paralelas: "info", aum_ger_64: "info" },
            comentario: "Lá♭2–mi♭4 → sol2–ré4: 5ªs expostas só para o ouvido. Na música real o soprano faria fá♯ → sol ou dó → si." },
        ] },
    ],
    exercicios: [
      { id: "aum1", titulo: "Completar: italiana e alemã em sol menor", modo: "completar", perfil: { ...AUM }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "i V6 i i6 iv iv6 It6 V i6 iv Ger65 i64 V i".split(" "),
        instrucoes: "<p>Escreva o soprano dos c. 2–4, uma nota por nota do baixo. No It6, ♯4 (dó♯) no soprano, chegando por semitom; na Ger65, uma nota que siga bem ao i6/4.</p>",
        texto: "tom: G menor\ncf: baixo\nsoprano: Bb4/1 A4/1 G4/1 D5/1\nbaixo: G2/1 F#2/1 G2/1 Bb2/1 C3/1 Eb3/1 Eb3/1 D3/1 Bb2/2 C3/1 Eb3/1 D3/1 D3/1 G2/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G menor\ncf: baixo\nsoprano: Bb4/1 A4/1 G4/1 D5/1 G4/1 C5/1 C#5/1 D5/1 G5/2 Eb5/1 Bb4/1 Bb4/1 A4/1 G4/2\nbaixo: G2/1 F#2/1 G2/1 Bb2/1 C3/1 Eb3/1 Eb3/1 D3/1 Bb2/2 C3/1 Eb3/1 D3/1 D3/1 G2/2",
        comentarioSolucao: "C. 2: dó5 → dó♯5 sobre mi♭; mi♭3–dó♯5 abre em ré3–ré5. C. 3: si♭4 (♭3) fica no i6/4 e desce ao lá sobre o V." },
      { id: "aum2", titulo: "Francesa e alemã em ré maior", modo: "menos apoio", perfil: { ...AUM }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, cifrasIniciais: "I V43 I6 IV IV6",
        instrucoes: "<p>Complete cifras e soprano. Sobre o si♭ (♭6): <b>Fr43</b> na semicadência do c. 2, <b>Ger65 → I64</b> no c. 3. Em uma delas, ♯4 (sol♯) no soprano.</p>",
        texto: "tom: D maior\ncf: baixo\nsoprano:\nbaixo: D3/1 E3/1 F#3/1 G3/1 B3/1 Bb3/1 A3/2 F#3/1 G3/1 Bb3/2 A3/1 A3/1 D3/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: D maior\ncf: baixo\nsoprano: A4/1 G4/1 F#4/1 B4/1 D5/1 E5/1~ E5/2 D5/1 G4/1 G#4/2 A4/1 C#5/1 D5/2\nbaixo: D3/1 E3/1 F#3/1 G3/1 B3/1 Bb3/1 A3/2 F#3/1 G3/1 Bb3/2 A3/1 A3/1 D3/2",
        solucaoCifras: "I V43 I6 IV IV6 Fr43 V I6 IV Ger65 I64 V I",
        comentarioSolucao: "Baixo si → si♭ (IV6 → Fr43); na francesa o soprano fica no mi, nota comum com o V. Na alemã, sol–sol♯–lá: si♭3–sol♯4 abre em lá3–lá4." },
      { id: "aum3", titulo: "Restrição: o ré♯ da melodia pede uma sexta aumentada", modo: "restrição", perfil: { ...AUM, aum_exige: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, aumentadas: 1 }, cifrasAluno: true,
        instrucoes: "<p>Escreva baixo e cifras. <b>Restrição:</b> ré♯5 do c. 2 harmonizado por sexta aumentada (fá no baixo), preparada por pré-dominante e resolvida no V. Cadência perfeita.</p>",
        texto: "tom: A menor\ncf: soprano\nsoprano: C5/1 B4/1 A4/1 E5/1 D5/1 D#5/1 E5/2 E5/1 D5/1 C5/1 B4/1 A4/4\nbaixo:", duracao: 1, alvoCompassos: 4,
        solucao: "tom: A menor\ncf: soprano\nsoprano: C5/1 B4/1 A4/1 E5/1 D5/1 D#5/1 E5/2 E5/1 D5/1 C5/1 B4/1 A4/4\nbaixo: A2/1 G#2/1 A2/1 C3/1 F3/1 F3/1 E3/2 C3/1 D3/1 A2/1 E3/1 A2/4",
        solucaoCifras: "i V6 i i6 iv6 It6 V i6 iv i V i",
        comentarioSolucao: "Ré5 sobre fá = iv6; ré → ré♯ faz do fá o ♭6 de uma italiana. Frígia intensificada: fá3 → mi3 contra ré♯5 → mi5." },
      { id: "aum4", titulo: "Livre: frase com sexta aumentada em si♭ maior", modo: "livre", perfil: { ...AUM, aum_exige: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, aumentadas: 2 }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Frase de 4 compassos com <b>duas</b> sextas aumentadas: uma na semicadência, uma alemã com I6/4 no fim. O ♭6 é sol♭.</p>",
        texto: "tom: Bb maior\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: Bb maior\nsoprano: F4/1 Eb4/1 D4/1 G4/1 Bb4/1 C5/1~ C5/2 Bb4/1 Eb4/1 E4/2 F4/1 A4/1 Bb4/2\nbaixo: Bb2/1 C3/1 D3/1 Eb3/1 G3/1 Gb3/1 F3/2 D3/1 Eb3/1 Gb3/2 F3/1 F3/1 Bb2/2",
        solucaoCifras: "I V43 I6 IV IV6 Fr43 V I6 IV Ger65 I64 V I" },
      { id: "aum5", titulo: "Quebrar: a alemã direto ao V", modo: "quebrar", perfil: { ...AUM, aum_ger_64: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "I V43 I6 I IV6 Ger65 V I6 ii6 V V7 I".split(" "),
        instrucoes: "<p>C. 2: <b>Ger65 direto ao V</b>. Escreva o soprano dos c. 2–4 com as 5ªs <b>só nas vozes internas</b>: fá (IV6) → fá♯ → sol no soprano.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/1 D5/1 C5/1 E5/1\nbaixo: C3/1 D3/1 E3/1 C3/1 A2/1 Ab2/1 G2/2 E2/1 F2/1 G2/1 G2/1 C3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 D5/1 C5/1 E5/1 F5/1 F#5/1 G5/2 G5/1 F5/1 D5/1 B4/1 C5/4\nbaixo: C3/1 D3/1 E3/1 C3/1 A2/1 Ab2/1 G2/2 E2/1 F2/1 G2/1 G2/1 C3/4",
        comentarioSolucao: "Fá5–fá♯5–sol5 contra lá2–lá♭2–sol2: abrem na oitava. As 5ªs lá♭–mi♭ → sol–ré ficam numa voz interna." },
    ],
  });

  // ================================================================== capítulo 2
  const AUM2 = { ...AUM };
  T.inserir(4, {
    id: "aumentadas2", titulo: "Sextas aumentadas além do V",
    objetivo: "Usar a sexta aumentada como pivô enarmônico (Ger65 = V7), com 4ª dupl. aumentada, em outros graus e invertida.",
    ouvir: ["Schubert: Ger65 relida como V7", "Wagner, Tristão, Prelúdio, c. 1–3", "Mozart, Sonata K. 310, desenvolvimento"],
    esboco: "Toque lá♭–dó–mi♭–fá♯. Resolva no i6/4 de dó; depois, com fá♯ = sol♭, em ré♭ maior. Que nota muda de função?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "O mesmo som, outra grafia, outro destino", html: `
        <p>A sexta aumentada se define pela <b>direção</b> das notas, não pelo som.</p>
        <table class="tabela-modos"><thead><tr><th>Uso</th><th>Como funciona</th><th>Cifra</th></tr></thead><tbody>
        <tr><td>Ger65 = V7 (enarmonia)</td><td>Fá♯ ↑ e lá♭ ↓ abrem ao sol; como V7 de ré♭, sol♭ (7ª) desce e o baixo salta a ré♭. O V7 de dó = Ger65 de si (fá = mi♯)</td><td><code>Ger65=Db:V7</code>, <code>V7=b:Ger65</code></td></tr>
        <tr><td>4ª duplamente aumentada (maior)</td><td>♭3 escrito ré♯ (lá♭–ré♯) sobe a mi do I6/4; mi♭ também é aceito</td><td>Ger65</td></tr>
        <tr><td>Outro alvo</td><td>♭6–♯4 de outro tom prepara a sua dominante: fá–lá–si–ré♯ (lá menor) → Mi (V/vi)</td><td><code>a:Fr43</code>, <code>C:V/vi</code></td></tr>
        <tr><td>Inversão (♯4 no baixo)</td><td>Vira 3ª diminuta, que fecha no sol; mais rara (It, Fr)</td><td>—</td></tr>
        <tr><td>Nota comum (CT+6)</td><td>Lá♭–dó–ré♯–fá♯ sobre a tônica enfeita o I (séc. XIX)</td><td>—</td></tr>
        </tbody></table>` },
      { tipo: "exemplo", titulo: "Sexta alemã e V7: a mesma sonoridade", intro: "Dó maior, modulando a ré♭ maior pelo lá♭7.",
        camadas: [
          { titulo: "Ger65 = V7 de ré♭", partitura: "tom: C maior\nsoprano: E5/1 G5/1 F5/1 Gb5/1 F5/1 Db5/1 Db5/1 C5/1 Db5/4\nbaixo: C3/1 E3/1 A2/1 Ab2/1 Db3/1 Gb3/1 Ab3/1 Ab3/1 Db3/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "I6"], [2, "IV6"], [3, "Ger65=Db:V7"], [4, "Db:I"], [5, "IV"], [6, "I64"], [7, "V"], [8, "I"]],
            contexto: { plano: { cadencia: 3, tomFinal: "Db maior" } },
            notas: [["decisao", "Baixo lá → lá♭: o ouvido espera a Ger65 indo ao I6/4 de dó."],
              ["decisao", "Sol♭5 desce a fá e o baixo salta a ré♭: era V7 de ré♭. Fá♯ seria grafia errada."],
              ["checagem", "IV–I6/4–V–I confirma ré♭."]],
            pausa: ["Quando se percebe que não haverá cadência em dó?", "Só na resolução: o ré♭ no baixo reescreve o acorde para trás."] },
        ] },
      { tipo: "exemplo", titulo: "A 4ª duplamente aumentada em maior", intro: "Dó maior: a alemã com ré♯ no soprano.",
        camadas: [
          { titulo: "Ré → ré♯ → mi", partitura: "tom: C maior\nsoprano: E5/2 D5/1 D#5/1 E5/1 D5/1 C5/2\nbaixo: C3/2 F3/1 Ab3/1 G3/1 G3/1 C3/2", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [2, "ii6"], [3, "Ger65"], [4, "I64"], [5, "V"], [6, "I"]],
            anotacoes: [[0, 2, "4ª dupl. aum."]],
            notas: [["decisao", "Soprano ré–ré♯–mi: ré♯ é sensível do mi do I6/4; mi♭ pareceria descer."],
              ["decisao", "Baixo fá–lá♭–sol: cadência I6/4–V–I."],
              ["checagem", "Lá♭3–ré♯5 resolve em sol3–mi5 (6ª), sem quintas."]] },
        ] },
      { tipo: "exemplo", titulo: "Outros graus e inversões",
        camadas: [
          { titulo: "Sexta aumentada de lá menor dentro de dó maior", partitura: "tom: C maior\nsoprano: E5/1 G5/1 A5/1 G#5/1 A5/1 F5/1 E5/1 D5/1 C5/4\nbaixo: C3/1 E3/1 F3/1 E3/1 A2/1 D3/1 G2/1 G2/1 C3/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "I"], [1, "I6"], [2, "a:Fr43"], [3, "C:V/vi"], [4, "vi"], [5, "ii"], [6, "I64"], [7, "V"], [8, "I"]],
            notas: [["decisao", "Fá–lá–si–ré♯ = francesa de lá menor: fá ↓ mi, ré♯ ↑ mi; Mi soa como V/vi."],
              ["decisao", "Soprano lá–sol♯–lá: a sensível do vi sobe."],
              ["checagem", "ii–I6/4–V–I volta a dó: só tonicizou o vi."]] },
          { titulo: "Italiana invertida: o ♯4 no baixo", partitura: "tom: C menor\nsoprano: C5/1 B4/1 C5/1 Ab4/1 Ab4/2 G4/2 G4/1 Ab4/1 Eb5/1 D5/1 C5/4\nbaixo: C3/1 D3/1 Eb3/1 F3/1 F#3/2 G3/2 Eb3/1 F3/1 G3/1 G3/1 C3/4", rotulos: ["soprano", "baixo"],
            cifras: [[0, "i"], [1, "V43"], [2, "i6"], [3, "iv"], [4, "It (♯4 no baixo)"], [6, "V"], [8, "i6"], [9, "iv"], [10, "i64"], [11, "V"], [12, "i"]],
            perfil: (({ aum_cifras, aum_resolucao, ...p }) => p)(AUM2), contexto: { plano: { cadencia: 4 } },
            notas: [["decisao", "Baixo fá–fá♯–sol, soprano segura lá♭: 3ª diminuta fá♯3–lá♭4 fecha em sol3–sol4."],
              ["rejeitada", "It6 com lá♭ no baixo: posição de manual, sem o baixo cromático ao V."],
              ["checagem", "Conferida sem a regra de cifras (que supõe ♭6 no baixo)."]],
            pausa: ["Mais áspera: 6ª aumentada ou 3ª diminuta?", "A 3ª diminuta: as notas convergem em vez de abrir. Por isso é rara, em baixos cromáticos."] },
        ] },
      { tipo: "contraste", titulo: "Mesmo acorde, duas resoluções",
        a: { rotulo: "A — Ger65: abre para o I6/4 de dó", partitura: "tom: C maior\nsoprano: E5/1 F5/1 F#5/2 G5/1 F5/1 E5/2\nbaixo: C3/1 A2/1 Ab2/2 G2/1 G2/1 C3/2", cifras: [[0, "I"], [1, "IV6"], [2, "Ger65"], [4, "I64"], [5, "V7"], [6, "I"]] },
        b: { rotulo: "B — V7 de ré♭: fecha no ré♭", partitura: "tom: C maior\nsoprano: E5/1 F5/1 Gb5/2 F5/4\nbaixo: C3/1 A2/1 Ab2/2 Db3/4", cifras: [[0, "I"], [1, "IV6"], [2, "Ger65=Db:V7"], [4, "Db:I"]] },
        pergunta: "Os dois primeiros tempos e o acorde do 3º tempo soam iguais. Onde está a diferença, e o que o ouvinte ouve primeiro?",
        comentario: "<p>A: fá♯ ↑ e lá♭ ↓ abrem ao sol; dó se confirma. B: sol♭ desce a fá e o baixo cai a ré♭ — 7ª de dominante. O ouvinte só decide <b>depois</b>: daí a surpresa.</p>" },
      { tipo: "quebra", titulo: "Wagner: a sexta aumentada que não resolve onde deve", html: `
        <table class="tabela-modos"><thead><tr><th>Obra / prática</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Wagner, <i>Tristão</i>, c. 1–3 (fá–si–ré♯–sol♯)</td><td>Apojatura (sol♯ → lá) no tempo forte; o V7 não resolve</td><td>Anseio sem resolução</td></tr>
        <tr><td>Ger65 como V7 do ♭II</td><td>A 6ª aum. não abre; volta logo ao tom</td><td>Enarmonia como cor, sem modular</td></tr>
        </tbody></table>
        <p>Uma leitura (entre várias) do Tristão: francesa de lá menor (fá–lá–si–ré♯) indo ao V7 — e parando aí.</p>`,
        exemplos: [
          { rotulo: "Esquema do Tristão (redução a duas vozes, não a partitura)", partitura: "tom: A menor\nsoprano: G#4/1.5 A4/0.5 A#4/1 B4/1\nbaixo: F3/2 E3/2", cifras: [[0, "Fr43 (com apojatura)"], [2, "V7"]],
            perfil: { quintas_paralelas: "erro", oitavas_paralelas: "erro", cruzamento_de_vozes: "erro", aum_cromatismo: "erro" },
            comentario: "Sol♯ resolve em lá (francesa de lá menor); lá♯ passa ao si sobre mi7. Baixo fá → mi = ♭6 → 5, mas a dominante fica sem tônica." },
          { rotulo: "Ger65 como V7 do ♭II, sem modular", partitura: "tom: C maior\nsoprano: E5/1 F5/1 Gb5/2 F5/1 Db5/1 C5/1 B4/1 C5/4\nbaixo: C3/1 A2/1 Ab2/2 F2/2 G2/1 G2/1 C3/4", cifras: [[0, "I"], [1, "IV6"], [2, "Ger65=Db:V7"], [4, "C:N6=Db:I6"], [6, "C:I64"], [7, "V7"], [8, "I"]],
            perfil: { ...AUM2 },
            comentario: "Lá♭7 resolve em ré♭ (= N6 de dó) e volta por N6–I6/4–V7–I. O som da alemã serviu de dominante de passagem." },
        ] },
    ],
    exercicios: [
      { id: "aum6", titulo: "Completar: o V7 de dó vira a alemã de si", modo: "completar", perfil: { ...AUM2 }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4, tomFinal: "B menor" } },
        cifras: "I V43 I6 IV V7=b:Ger65 b:i64 b:V b:i b:iv b:V b:i".split(" "),
        instrucoes: "<p>Dó → <b>si menor</b>: no c. 2 o sol7 vira Ger65 de si (fá = mi♯) e abre ao i6/4. Escreva o soprano dos c. 2–4; sobre o V7, a nota comum (si ou ré) é segura.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: G5/1 F5/1 E5/1 A5/1\nbaixo: C3/1 D3/1 E3/1 F3/1 G3/2 F#3/1 F#3/1 B2/1 E3/1 F#3/2 B2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\ncf: baixo\nsoprano: G5/1 F5/1 E5/1 A5/1 D5/2 D5/1 C#5/1 D5/1 B4/1 A#4/2 B4/4\nbaixo: C3/1 D3/1 E3/1 F3/1 G3/2 F#3/1 F#3/1 B2/1 E3/1 F#3/2 B2/4",
        comentarioSolucao: "Ré5, comum a sol7 e i6/4 de si, fica parado; a surpresa vem do baixo (sol → fá♯) e do mi♯ interno. Duas cadências V–i confirmam si." },
      { id: "aum7", titulo: "A 4ª duplamente aumentada em lá maior", modo: "menos apoio", perfil: { ...AUM2 }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, cifrasIniciais: "I V6 I I6 IV ii V",
        instrucoes: "<p>Cifre os c. 3–4 e escreva o soprano. No fá do c. 3: <b>Ger65 → I64</b>, com <b>si♯</b> (não dó) no soprano subindo a dó♯.</p>",
        texto: "tom: A maior\ncf: baixo\nsoprano:\nbaixo: A2/1 G#2/1 A2/1 C#3/1 D3/1 B2/1 E3/2 C#3/1 D3/1 F3/2 E3/1 E3/1 A2/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: A maior\ncf: baixo\nsoprano: C#5/1 B4/1 A4/1 E5/1 D5/1 D5/1 B4/2 A4/1 B4/1 B#4/2 C#5/1 B4/1 A4/2\nbaixo: A2/1 G#2/1 A2/1 C#3/1 D3/1 B2/1 E3/2 C#3/1 D3/1 F3/2 E3/1 E3/1 A2/2",
        solucaoCifras: "I V6 I I6 IV ii V I6 ii6 Ger65 I64 V I",
        comentarioSolucao: "Lá–si–si♯–dó♯ no soprano; baixo ré–fá–mi. Si♯, não dó♮, porque a nota sobe." },
      { id: "aum8", titulo: "Restrição: sexta aumentada para o V/vi", modo: "restrição", perfil: { ...AUM2, aum_exige: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, aumentadas: 1 }, cifrasAluno: true,
        instrucoes: "<p>Escreva baixo e cifras. <b>Restrição:</b> lá♯4 (c. 2) = ♯4 de mi menor: sexta aumentada de mi (dó no baixo) abrindo ao V/vi. Cifre <code>e:It6</code> (ou Fr43, Ger65), depois <code>G:V/vi</code>.</p>",
        texto: "tom: G maior\ncf: soprano\nsoprano: B4/1 A4/1 G4/1 B4/1 A4/1 A#4/1 B4/2 G4/1 C5/1 B4/1 A4/1 G4/4\nbaixo:", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G maior\ncf: soprano\nsoprano: B4/1 A4/1 G4/1 B4/1 A4/1 A#4/1 B4/2 G4/1 C5/1 B4/1 A4/1 G4/4\nbaixo: G2/1 F#2/1 G2/1 E2/1 A2/1 C3/1 B2/2 E3/1 C3/1 D3/1 D3/1 G2/4",
        solucaoCifras: "I V6 I vi ii e:It6 G:V/vi vi IV I64 V I",
        comentarioSolucao: "Dó3–lá♯4 abre em si2–si4: a italiana de mi faz do Si uma dominante local, e o vi soa como chegada." },
      { id: "aum9", titulo: "Quebrar: a alemã que vira dominante da napolitana", modo: "quebrar", perfil: { ...AUM2, aum_resolucao: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } },
        cifras: "i V6 i i6 iv Ger65=F:V7 e:N6=F:I6 e:i64 e:V e:i".split(" "),
        instrucoes: "<p>C. 2: a Ger65 de mi vira <b>dó7, dominante de fá</b> (a N de mi); lá♯ = si♭ desce. Escreva o soprano dos c. 2–4, com fá (♭2) sobre a N: ♭2–1–7–1.</p>",
        texto: "tom: E menor\ncf: baixo\nsoprano: G4/1 F#4/1 G4/1 B4/1\nbaixo: E3/1 D#3/1 E3/1 G3/1 A3/2 C4/2 A3/2 B3/1 B3/1 E3/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: E menor\ncf: baixo\nsoprano: G4/1 F#4/1 G4/1 B4/1 C5/2 E5/2 F5/2 E5/1 D#5/1 E5/4\nbaixo: E3/1 D#3/1 E3/1 G3/1 A3/2 C4/2 A3/2 B3/1 B3/1 E3/4",
        comentarioSolucao: "Mi5 (sensível de fá) sobe a fá5 da N; dó–si♭ fecha em vez de abrir. Fá → mi (i6/4) → ré♯ (V): a cadência absorve o desvio." },
    ],
  });
})(this);
