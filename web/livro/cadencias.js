/* Nível 2 · Cadências; Função e progressão.
 * Fontes: Aldwell & Schachter, Harmony and Voice Leading; Caplin, Classical Form (1998); Rameau, Traité (1722);
 * Schoenberg, Harmonielehre (1911) e Structural Functions of Harmony (1954), via Meeus (MTO 6.1, 2000);
 * Kostka & Payne, Tonal Harmony; notas em research_notes/O que se ensina em composição/harmonia.md. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL, PLANO_BAIXO, PLANO_FRASE } = T.perfis;

  // ------------------------------------------------------------ regras do capítulo

  const FUN = { 1: "T", 3: "T", 6: "T", 2: "PD", 4: "PD", 5: "D", 7: "D" };
  const funcao = (c) => (c.secundaria ? "sec" : c.napolitana || c.aumentada ? "PD" : c.seisQuatro && c.grau === 1 ? "D" : FUN[c.grau]);
  const ehV = (c) => c.grau === 5 && !c.secundaria && !c.alteracao && c.membroBaixo === 0 && !c.seisQuatro;
  const ehI = (c) => c.grau === 1 && !c.secundaria && !c.alteracao && c.membroBaixo === 0;
  const cifradas = (ex, ctx) => R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
  const NOMES = {
    perfeita: "cadência autêntica perfeita (V–I em estado fundamental, tônica na melodia)",
    perfeita64: "cadência autêntica perfeita com 6/4 cadencial (I64–V–I)",
    imperfeita: "cadência autêntica imperfeita (dominante → I, sem as condições da perfeita)",
    semi: "semicadência (o compasso termina num V em estado fundamental, sem 7ª)",
    frigia: "semicadência frígia (iv6 → V, o baixo descendo meio tom do 6º ao 5º grau)",
    plagal: "cadência plagal (IV ou iv → I)",
    engano: "cadência de engano (V → vi/VI, ou V → IV6/iv6)",
    evitada: "cadência evitada (V → I6, ou V → V42 → I6)",
    retrogressao: "retrogressão (dominante → pré-dominante)",
  };

  function cadenciaEm(ex, hs, comp, tipo) {
    const C = ex.duracaoCompasso;
    const mel = ex.vozes[0];
    const tonicaNaMelodia = (h) => { const n = mel.soandoEm(h.inicio); return n && n.altura.nome === h.tom.tonica.nome; };
    if (tipo === "semi" || tipo === "frigia") {
      const fimC = comp * C;
      const k = hs.map((h) => h.inicio < fimC).lastIndexOf(true);
      const h = hs[k];
      if (!h || h.fim < fimC || !ehV(h.cifra) || h.cifra.setima) return false;
      if (tipo === "semi") return true;
      // volta ao início do V (o mesmo acorde pode estar repetido) e olha o anterior
      let j = k;
      while (j > 0 && hs[j - 1].texto === h.texto) j--;
      const a = hs[j - 1];
      return !!a && h.tom.modo === "minor" && a.cifra.grau === 4 && !a.cifra.maior && a.cifra.membroBaixo === 1 && a.baixo.ps - hs[j].baixo.ps === 1;
    }
    for (let k = 1; k < hs.length; k++) {
      const h = hs[k], a = hs[k - 1];
      if (ex.compassoDe(h.inicio) !== comp) continue;
      const perfeita = ehV(a.cifra) && ehI(h.cifra) && tonicaNaMelodia(h);
      if (tipo === "perfeita" && perfeita) return true;
      if (tipo === "perfeita64" && perfeita && hs[k - 2] && hs[k - 2].cifra.grau === 1 && hs[k - 2].cifra.seisQuatro && hs[k - 2].baixo.ps === a.baixo.ps) return true;
      if (tipo === "imperfeita" && !perfeita && ehI(h.cifra) && (a.cifra.grau === 5 || a.cifra.grau === 7) && !a.cifra.secundaria && !a.cifra.seisQuatro) return true;
      if (tipo === "plagal" && a.cifra.grau === 4 && !a.cifra.secundaria && !a.cifra.alteracao && a.cifra.membroBaixo === 0 && ehI(h.cifra)) return true;
      if (tipo === "engano" && ehV(a.cifra) && ((h.cifra.grau === 6 && !h.cifra.secundaria) || (h.cifra.grau === 4 && h.cifra.membroBaixo === 1 && !h.cifra.secundaria))) return true;
      if (tipo === "evitada" && ehV(a.cifra)) {
        const i6 = (c) => c.grau === 1 && c.membroBaixo === 1 && !c.secundaria && !c.alteracao;
        if (i6(h.cifra)) return true;
        if (h.cifra.grau === 5 && h.cifra.membroBaixo === 3 && hs[k + 1] && i6(hs[k + 1].cifra)) return true;
      }
      if (tipo === "retrogressao" && funcao(a.cifra) === "D" && funcao(h.cifra) === "PD") return true;
    }
    return false;
  }

  /* ctx.cadencias = [{ compasso: 4, tipo: "frigia" }, …]
   * tipos: perfeita, perfeita64, imperfeita, semi, frigia, plagal, engano, evitada, retrogressao */
  M.definirRegra("cad_pedidas", "Cadências pedidas",
    "Em cada compasso indicado pelo exercício a frase faz o tipo de cadência pedido (perfeita, imperfeita, semicadência, frígia, plagal, de engano, evitada) ou a progressão pedida.",
    function* (ex, ctx) {
      if (!ctx.cadencias || !ex.tonalidade) return;
      const hs = cifradas(ex, ctx);
      if (!hs.length) return;
      for (const { compasso, tipo } of ctx.cadencias) {
        if (cadenciaEm(ex, hs, compasso, tipo)) continue;
        const no = hs.filter((h) => ex.compassoDe(h.inicio) === compasso);
        const ant = hs.filter((h) => ex.compassoDe(h.inicio) < compasso).pop();
        const visto = [...(ant ? [ant] : []), ...no].map((h) => h.texto).join(" → ") || "nenhuma cifra";
        yield [compasso, `no compasso ${compasso} o exercício pede ${NOMES[tipo] || tipo}; as cifras ali fazem ${visto}`, no.map((h) => h.baixo)];
      }
    }, { precisaTom: true,
      porque: "Cada tipo de cadência tem um peso diferente na frase: a semicadência abre, a perfeita fecha, a imperfeita fecha pela metade, a de engano e a evitada adiam. Pedir um tipo num compasso é pedir uma decisão de forma.",
      corrigir: "Confira as duas últimas cifras que chegam ao compasso pedido: o tipo depende do acorde de chegada, do estado (fundamental ou invertido) e da nota da melodia sobre ele." });

  // Schoenberg: fortes (4ª acima / 3ª abaixo), descendentes (4ª abaixo / 3ª acima), superfortes (2ª)
  function classeDoMovimento(c1, tom1, c2, tom2) {
    const r1 = M.lerAltura(R3.membros(c1, tom1)[0].replace(/-/g, "b") + "4"), r2 = M.lerAltura(R3.membros(c2, tom2)[0].replace(/-/g, "b") + "4");
    const d = (((r2.letra - r1.letra) % 7) + 7) % 7;
    return { 0: null, 3: "forte", 5: "forte", 4: "descendente", 2: "descendente", 1: "superforte", 6: "superforte" }[d];
  }
  /* ctx.movimentos = { proibir: ["descendente"] } — os acordes de 6/4 (cadencial, de passagem) não contam */
  M.definirRegra("cad_progressao", "Movimento das fundamentais",
    "O exercício limita as progressões de fundamental pelas classes de Schoenberg: fortes (4ª acima ou 3ª abaixo), descendentes (4ª abaixo ou 3ª acima) e superfortes (por grau). Os acordes de 6/4 não contam.",
    function* (ex, ctx) {
      const mv = ctx.movimentos;
      if (!mv || !ex.tonalidade) return;
      const hs = cifradas(ex, ctx).filter((h) => !h.cifra.seisQuatro);
      const nomes = { forte: "forte", descendente: "descendente (4ª abaixo ou 3ª acima)", superforte: "superforte (por grau)" };
      for (let k = 1; k < hs.length; k++) {
        const cl = classeDoMovimento(hs[k - 1].cifra, hs[k - 1].tom, hs[k].cifra, hs[k].tom);
        if (cl && (mv.proibir || []).includes(cl)) yield [ex.compassoDe(hs[k].inicio), `${hs[k - 1].texto} → ${hs[k].texto}: progressão ${nomes[cl]}, que este exercício não permite`, [hs[k - 1].baixo, hs[k].baixo]];
      }
    }, { precisaTom: true,
      porque: "Para Schoenberg, as progressões fortes (como V–I, I–vi, vi–ii) podem ser usadas sem restrição; as descendentes (I–V, I–iii) soam como recuo e pedem compensação; as superfortes (IV–V, V–vi) são enfáticas. Limitar as classes obriga a ouvir o movimento das fundamentais, e não só o do baixo.",
      corrigir: "Troque o acorde por outro da mesma função cuja fundamental esteja uma 4ª acima ou uma 3ª abaixo da anterior (ex.: em vez de I–V, I–ii–V ou I–IV–V)." });

  /* ctx.acordesPedidos = ["iii", "vi"] — cada grau precisa aparecer ao menos uma vez nas cifras */
  M.definirRegra("cad_acordes_pedidos", "Acordes pedidos",
    "O exercício pede que certos acordes (graus) apareçam ao menos uma vez nas cifras.",
    function* (ex, ctx) {
      if (!ctx.acordesPedidos || !ex.tonalidade) return;
      const hs = cifradas(ex, ctx);
      if (!hs.length) return;
      for (const s of ctx.acordesPedidos) {
        const p = R3.lerCifra(s);
        if (!p) continue;
        if (!hs.some((h) => h.cifra.grau === p.grau && !h.cifra.secundaria && (h.cifra.alteracao || 0) === (p.alteracao || 0))) {
          yield [ex.compassoDe(ex.fim - 1), `o exercício pede o acorde ${s} (em qualquer estado) e ele não aparece nas cifras`, []];
        }
      }
    }, { precisaTom: true,
      porque: "Usar o acorde pedido no lugar certo é o que transforma a teoria do substituto em escolha de composição.",
      corrigir: "Procure uma nota da melodia que pertença ao acorde pedido e um ponto da frase em que a função dele faça sentido." });

  for (const id of ["cad_pedidas", "cad_progressao", "cad_acordes_pedidos"]) M.PRECISA_FIM.add(id);

  // ------------------------------------------------------------ utilidades

  // [[tempo em semínimas, cifra]] a partir do baixo (sem pausas) e de "I V43 I6 …"
  function cifrasDe(baixo, simbolos) {
    const ss = simbolos.trim().split(/\s+/);
    let t = 0, d = 1;
    return baixo.trim().split(/\s+/).map((tok, i) => {
      const m = /\/([\d.]+)/.exec(tok);
      if (m) d = +m[1];
      const r = [t, ss[i]];
      t += d;
      return r;
    });
  }
  const PERFIL = { ...TONAL, notas_do_acorde: "erro" };
  const COM_CAD = { ...PERFIL, cad_pedidas: "erro" };

  // ------------------------------------------------------------ partituras (todas conferidas no verificador)

  const PER_S = "D5/1 C5/1 B4/2 E5/2 D5/2 C5/2 E5/2 D5/4 D5/1 C5/1 B4/2 E5/1 F#5/1 G5/2 E5/1 C5/1 B4/1 A4/1 G4/4";
  const PER_B = "G2/1 A2/1 B2/2 C3/2 B2/2 A2/2 C3/2 D3/4 G2/1 A2/1 B2/2 C3/2 B2/2 C3/2 D3/1 D3/1 G2/4";
  const PER_C = "I V43 I6 IV I6 ii ii6 V I V43 I6 IV I6 ii6 I64 V I";

  const RE_S = "D5/2 E5/1 F5/1 A5/2 G5/2 F5/2 G5/2 A5/4 A5/2 G5/1 F5/1 D5/2 E5/2 F5/2 E5/2 D5/4";
  const RE_B = "D3/2 C#3/1 D3/1 F3/2 E3/2 D3/2 Bb2/2 A2/4 D3/2 C#3/1 D3/1 Bb2/2 G2/2 A2/2 A2/2 D3/4";
  const RE_C = "i V65 i i6 vii°6 i iv6 V i V65 i VI ii°6 i64 V i";

  const ENG_S = "F4/2 Bb4/2 C5/2 D5/1 C5/1 Bb4/2 Eb5/2 D5/2 C5/2 Bb4/4";
  const ENG_B = "Bb2/2 D3/2 Eb3/2 F3/1 F3/1 G3/2 Eb3/2 F3/2 F3/2 Bb2/4";
  const ENG_C = "I I6 ii6 I64 V vi ii6 I64 V I";

  const EVI_S = "B4/1 D5/1 E5/1 C5/1 B4/2 A4/2 D5/1 B4/1 E5/1 C5/1 B4/2 A4/2 G4/4";
  const EVI_B = "G2/2 C3/2 D3/2 D3/2 B2/2 C3/2 D3/2 D3/2 G2/4";
  const EVI_C = "I IV I64 V7 I6 IV I64 V I";

  const CAD1_S = "F#5/2 E5/1 D5/1 F#5/2 G5/2 E5/2 D5/1 C#5/1 D5/4";
  const CAD1_B = "D3/2 E3/1 F#3/1 B2/2 E3/2 G3/2 A3/1 A3/1 D3/4";
  const CAD2_S = "A4/1 Bb4/1 C5/2 D5/1 C5/1 Bb4/1 A4/1 G4/1 A4/1 Bb4/1 D5/1 C5/4 A4/1 Bb4/1 C5/2 D5/1 E5/1 F5/1 G5/1 A5/2 G5/2 F5/4";
  const CAD2_B = "F2/1 G2/1 A2/2 Bb2/2 G2/2 Bb2/4 C3/4 F2/1 G2/1 A2/2 Bb2/4 C3/2 C3/2 F2/4";
  const CAD3_S = "C5/2 B4/1 A4/1 E5/2 D5/2 C5/2 D5/2 E5/4 E5/2 D5/1 C5/1 F5/2 D5/2 C5/2 B4/2 A4/4";
  const CAD3_B = "A2/2 G#2/1 A2/1 C3/2 B2/2 A2/2 F3/2 E3/4 A2/2 B2/1 C3/1 D3/2 F3/2 E3/2 E3/2 A2/4";
  const CAD4_S = "Bb4/2 Ab4/1 G4/1 C5/1 D5/1 Eb5/1 C5/1 Ab4/1 C5/1 Bb4/1 Ab4/1 G4/4 Bb4/2 Ab4/1 G4/1 C5/1 Eb5/1 Ab5/1 F5/1 G5/2 F5/2 Eb5/4";
  const CAD4_B = "Eb3/2 D3/1 Eb3/1 Ab3/4 F3/2 Bb2/2 Eb3/4 Eb3/2 D3/1 Eb3/1 C3/2 F3/2 Bb2/2 Bb2/2 Eb3/4";
  const CAD5_S = "G5/2 F#5/1 E5/1 G5/2 A5/2 G5/2 F#5/2 E5/2 A5/2 G5/2 F#5/2 E5/4";
  const CAD5_B = "E3/2 D#3/1 E3/1 C3/2 A2/2 B2/2 B2/2 C3/2 A2/2 B2/2 B2/2 E3/4";

  // ================================================================== CADÊNCIAS
  T.inserir(2, {
    id: "cadencias", titulo: "Cadências",
    antes: [
      { p: "Quais são as condições de uma cadência autêntica perfeita?", o: ["V(7) e I em estado fundamental, com a tônica na voz de cima no acorde final", "V–I com qualquer inversão, desde que a melodia termine na tônica", "IV–I com a tônica na melodia", "V–I em estado fundamental com a 3ª do I na melodia"], e: "As três condições juntas: dominante e tônica em estado fundamental (baixo 5→1) e 1̂ na melodia. Com o I invertido, ou com 3̂/5̂ em cima, a cadência é imperfeita; IV–I é plagal." },
      { p: "Em lá menor, a semicadência frígia é:", o: ["iv6 → V: fá no baixo descendo meio tom para mi", "ii°6 → i", "V → VI", "iv → i em estado fundamental"], e: "O nome vem do semitom descendente no baixo (♭6̂→5̂), o mesmo da cadência do modo frígio. Por cima, a voz superior sobe ré→mi: as externas abrem de uma 6ª para a 8ª." },
      { p: "O 6/4 cadencial:", o: ["Cai num tempo mais forte que o V que o resolve, sobre o mesmo baixo (5̂), com 6–5 e 4–3", "Cai no tempo fraco, logo antes do V", "É o I em 2ª inversão e pode fechar a frase", "Resolve no IV"], e: "É uma dupla apojatura do V: a 6ª e a 4ª acima do baixo resolvem descendo sobre o mesmo baixo. Como toda apojatura, precisa do apoio métrico; no tempo fraco soa como erro de ritmo." },
    ],
    objetivo: "Escolher a cadência certa para cada ponto da frase — perfeita, imperfeita, semicadência (inclusive a frígia), plagal, de engano ou evitada — e escrevê-la no par soprano–baixo com o 6/4 cadencial no lugar métrico certo.",
    ouvir: [
      "Bach, Concerto de Brandemburgo nº 3, o 'Adagio' entre os dois Allegros: só uma semicadência frígia em mi menor",
      "Corais de Bach: compare os fins de verso (semicadências, cadências de engano) com o fim do coral",
      "Mozart, Sonata K. 545, 1º mov.: cadências perfeitas com 6/4 cadencial",
      "Händel, Messias, 'Hallelujah': o fim plagal (IV–I) depois da última pausa",
      "Wagner, Tristão e Isolda, Prelúdio: a cadência de engano em fá maior (VI de lá menor) no c. 17",
      "Schumann, Dichterliebe nº 1, 'Im wunderschönen Monat Mai': termina num acorde de 7ª de dominante sem resolução",
    ],
    esboco: "Pense numa melodia de 8 compassos em sol maior que você conheça (ou invente). Onde ela respira no meio? Que nota tem a melodia ali, e que acorde você poria por baixo? E no fim?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Os tipos de cadência e a sua força", html: `
        <p>Cadência é a fórmula que <b>fecha uma frase</b> ou uma parte dela. As cláusulas do contraponto renascentista já eram fórmulas de duas vozes (a sensível sobe, o 2º grau desce, a 6ª maior abre para a 8ª); Rameau (1722) as transformou em progressões de acordes, com a <i>cadence parfaite</i> (V–I, baixo fundamental descendo uma 5ª) como modelo; Koch (1782–93) mede a forma pelos pontos de repouso. Os manuais modernos (Aldwell &amp; Schachter, Kostka &amp; Payne) e Caplin (<i>Classical Form</i>, 1998) usam a mesma tipologia:</p>
        <table class="tabela-modos"><thead><tr><th>Tipo</th><th>Harmonia</th><th>Baixo</th><th>Voz de cima</th><th>Efeito</th><th>Lugar na frase</th></tr></thead><tbody>
        <tr><td><b>Autêntica perfeita</b> (CAP)</td><td>V(7) → I, ambos em fundamental</td><td>5 → 1</td><td>termina em 1̂</td><td>fechamento completo</td><td>fim do consequente, fim de seção</td></tr>
        <tr><td><b>Autêntica imperfeita</b> (CAI)</td><td>V → I com 3̂ ou 5̂ em cima (ou vii°6–I, V6–I)</td><td>5 → 1 (ou 7/2 → 1)</td><td>3̂ ou 5̂</td><td>fecha, mas deixa algo em aberto</td><td>fim de frase interna, antecedente forte</td></tr>
        <tr><td><b>Semicadência</b> (SC)</td><td>… → V em fundamental, sem 7ª</td><td>termina em 5</td><td>2̂, 7̂ ou 5̂</td><td>pergunta, suspensão</td><td>fim do antecedente; fim de transição</td></tr>
        <tr><td><b>Semicadência frígia</b></td><td>iv6 → V (menor)</td><td>♭6 → 5, meio tom</td><td>4̂ → 5̂ (as externas abrem 6ª → 8ª)</td><td>pergunta arcaica, solene</td><td>meio de frase em menor; fim de movimento lento barroco</td></tr>
        <tr><td><b>Plagal</b></td><td>IV (ou iv) → I</td><td>4 → 1</td><td>1̂ (nota comum) ou 6̂–5̂</td><td>confirmação, “Amém”</td><td>depois da CAP, como coda</td></tr>
        <tr><td><b>De engano</b> (interrompida)</td><td>V(7) → vi (VI em menor); também V → IV6</td><td>5 → 6</td><td>como na CAP: 2̂–1̂, 7̂–1̂</td><td>surpresa: a frase precisa continuar</td><td>no lugar onde se esperava a CAP</td></tr>
        <tr><td><b>Evitada</b></td><td>V(7) → I6 (ou V → V42 → I6)</td><td>5 → 3 (ou 5 → 4 → 3)</td><td>muitas vezes salta para recomeçar</td><td>“mais uma vez”: a cadência é refeita</td><td>no lugar da CAP, antes da CAP verdadeira</td></tr>
        </tbody></table>
        <h3>A hierarquia</h3>
        <p>Da mais forte à mais fraca: <b>CAP &gt; CAI &gt; SC</b>. É a hierarquia que organiza o período: um antecedente que termina em SC (ou CAI) e um consequente que termina em CAP — a resposta precisa ser mais conclusiva que a pergunta. Duas observações de Caplin: a cadência é um <i>evento formal</i> — só existe no fim de um processo (ideia, continuação, fórmula cadencial) —, e a <b>plagal não é uma cadência genuína</b> no estilo clássico: ela quase sempre aparece <i>depois</i> de uma CAP, prolongando a tônica. A de engano e a evitada também não fecham: são <b>desvios</b> da CAP prometida, e por isso exigem outra cadência depois delas.</p>
        <h3>O que torna a perfeita perfeita</h3>
        <ul><li>As duas fundamentais no baixo: 5 → 1 é o salto mais conclusivo que existe.</li>
        <li>A tônica em cima no acorde final: com 3̂ em cima o ouvido ainda espera algo.</li>
        <li>A chegada num tempo mais forte que o V. Na 2/4 ou na 4/4, o I cai no tempo 1.</li>
        <li>Preparação por uma pré-dominante (IV, ii6, ii65): a sequência PD → D → T é a <i>progressão cadencial</i>.</li></ul>
        <p>No ateliê o coral fica implícito: você escreve o <b>par externo</b> e as cifras. Por isso as fórmulas da voz de cima e do baixo são o essencial: o resto é preenchimento.</p>` },
      { tipo: "texto", rotulo: "A regra", titulo: "O 6/4 cadencial e as fórmulas melódicas", html: `
        <p>O <b>6/4 cadencial</b> (I64 – V sobre o mesmo baixo) é uma dupla apojatura do V: a 6ª e a 4ª acima do 5º grau resolvem em 5ª e 3ª. Por isso ele é tratado como um <b>V ornamentado</b>, não como tônica (vários manuais escrevem V<sup>6–5</sup><sub>4–3</sub>). Três regras:</p>
        <ol><li><b>Metro:</b> o 6/4 cai num tempo mais forte que o V. Na 4/4: 6/4 no 1, V no 3; ou 6/4 no 3, V no 4. Nunca 6/4 no fraco e V no forte.</li>
        <li><b>Baixo:</b> o mesmo 5º grau sob os dois acordes (pode ser repetido ou sustentado); chega-se a ele de preferência de uma pré-dominante (4 → 5: IV, ii6, ii65).</li>
        <li><b>Resolução:</b> a 6ª desce à 5ª e a 4ª desce à 3ª (sensível). Na voz de cima isso dá 3̂–2̂ (6–5) ou 1̂–7̂ (4–3).</li></ol>
        <table class="tabela-modos"><thead><tr><th>Fórmula (voz de cima)</th><th>Sobre</th><th>Comentário</th></tr></thead><tbody>
        <tr><td><b>3̂–2̂–1̂</b></td><td>I64 – V – I (ou ii6 – V – I)</td><td>a mais comum; o 3̂ sobre o 6/4 é a 6ª que desce</td></tr>
        <tr><td><b>5̂–4̂–3̂–2̂–1̂</b></td><td>I – V43 – I6 … ii6 – I64 – V – I</td><td>a descida completa (a <i>Urlinie</i> de Schenker); o 4̂ sobre V43 ou V7 é a 7ª que desce</td></tr>
        <tr><td><b>8̂–7̂–8̂</b></td><td>I64 – V – I</td><td>a 4ª do 6/4 (1̂) desce à sensível e volta: a voz de cima tem a cláusula do soprano renascentista</td></tr>
        <tr><td><b>2̂–7̂–1̂</b></td><td>V – (V7) – I</td><td>2̂ e 7̂ são notas do mesmo V; a melodia desce à sensível e a resolve subindo</td></tr>
        <tr><td><b>2̂–3̂</b>, <b>4̂–3̂</b></td><td>V – I, V7 – I</td><td>fecham em 3̂: cadência imperfeita</td></tr>
        <tr><td><b>4̂–5̂</b> (menor: ♭6 no baixo)</td><td>iv6 – V</td><td>a semicadência frígia: externas em movimento contrário, 6ª → 8ª</td></tr>
        </tbody></table>
        <p>Em menor, o V e o vii° levam a sensível; na voz de cima, ♭6̂–7̂ (fá–sol♯ em lá menor) é 2ª aumentada: evite-a, ou passe pelo 6º elevado só quando a linha sobe.</p>` },
      { tipo: "exemplo", titulo: "Um período em sol maior: semicadência e cadência perfeita",
        intro: "Antecedente (c. 1–4) e consequente (c. 5–8) começam iguais; só as cadências decidem quem pergunta e quem responde.",
        camadas: [
          { titulo: "Os pontos de chegada", partitura: "tom: G maior\nsoprano: P/4 P/4 C5/2 E5/2 D5/4 P/4 P/4 E5/1 C5/1 B4/1 A4/1 G4/4\nbaixo: P/4 P/4 A2/2 C3/2 D3/4 P/4 P/4 C3/2 D3/1 D3/1 G2/4", rotulos: ["soprano", "baixo"],
            notas: [["decisao", "Antes de qualquer outra nota, os dois pontos de chegada: SC no c. 4 (ii – ii6 – V, com 5̂ em cima) e CAP no c. 8 (ii6 – I64 – V – I, com 3̂–2̂–1̂)."],
              ["decisao", "As duas cadências usam a mesma pré-dominante (ii6 sobre dó): o ouvido reconhece o gesto e percebe a diferença só na chegada."]] },
          { titulo: "O período completo", partitura: `tom: G maior\nsoprano: ${PER_S}\nbaixo: ${PER_B}`, rotulos: ["soprano", "baixo"], cifras: cifrasDe(PER_B, PER_C),
            contexto: { plano: { semicadencia: 4, cadencia: 8 } },
            anotacoes: [[1, 7, "SC"], [1, 14, "6/4"], [1, 16, "CAP"], [0, 13, "clímax"]],
            notas: [["decisao", "C. 1 e 5: I – V43 – I6 com 5̂–4̂–3̂ em cima. O dó5 é a 7ª do V43 e desce ao si4 em movimento contrário ao baixo (troca de vozes)."],
              ["decisao", "C. 4: a semicadência para no V em fundamental, sem 7ª, com ré5 (5̂) em cima, em 8ª com o baixo por movimento contrário. O compasso inteiro de V é a 'vírgula'."],
              ["decisao", "C. 6: o consequente sobe ao clímax (sol5) sobre o I6, para ter de onde descer até a cadência."],
              ["decisao", "C. 7: ii6 no 1º tempo, 6/4 no 3º (forte), V no 4º (fraco). A voz de cima faz 3̂–2̂–1̂: si4 (a 6ª do 6/4) – lá4 – sol4."],
              ["rejeitada", "Pensei em fechar o antecedente com V–I (uma CAI): a pergunta ficaria quase tão conclusiva quanto a resposta, e o período perderia o desequilíbrio que o move."],
              ["rejeitada", "6/4 no 4º tempo e V no 1º do c. 8 deslocaria tudo: o V cairia no tempo forte e a tônica final num tempo fraco — a cadência soaria tropeçada."],
              ["checagem", "Nenhuma 5ª ou 8ª atingida por salto em movimento direto: as 8ªs dos c. 4 e 8 chegam por grau na voz de cima."]],
            pausa: ["O que mudaria se o c. 8 tivesse si4 (3̂) em cima, em vez de sol4?", "Viraria uma cadência autêntica imperfeita: as mesmas harmonias, mas o ouvido ainda esperaria a tônica em cima. O consequente ficaria mais fraco — às vezes é exatamente isso que se quer, quando ainda vem outra frase (o 'período progressivo')."] },
        ] },
      { tipo: "exemplo", titulo: "Em ré menor: a semicadência frígia",
        intro: "A mesma forma em menor. A pergunta termina em iv6 → V, com o baixo descendo meio tom.",
        camadas: [
          { titulo: "Antecedente e consequente", partitura: `tom: D menor\nsoprano: ${RE_S}\nbaixo: ${RE_B}`, rotulos: ["soprano", "baixo"], cifras: cifrasDe(RE_B, RE_C),
            contexto: { plano: { semicadencia: 4, cadencia: 8 } },
            anotacoes: [[1, 7, "♭6"], [1, 8, "5"], [1, 15, "6/4"]],
            notas: [["decisao", "C. 2: i6 – vii°6 – i com o baixo descendo fá–mi–ré e a voz de cima em 10ªs: prolongamento da tônica antes da pré-dominante."],
              ["decisao", "C. 3–4: iv6 → V. O si♭2 desce ao lá2 enquanto a voz de cima sobe sol5 → lá5: movimento contrário, 6ª → 8ª. É a cláusula frígia transposta para dentro do menor."],
              ["decisao", "C. 6–8: VI – ii°6 – i64 – V – i. O ii°6 (e não o ii° em fundamental) é o costume: o trítono entre si e fá fica entre as vozes de cima e o baixo canta sol → lá."],
              ["rejeitada", "iv em fundamental (sol2 → lá2) também é semicadência, mas perde o meio tom no baixo — e com ele a cor arcaica que torna a pergunta mais grave."],
              ["checagem", "Em menor, o dó♯ (sensível) aparece só sobre o V65 e o V; nenhuma linha faz a 2ª aumentada si♭–dó♯."]],
            pausa: ["Por que a semicadência frígia era tão usada como final de movimentos lentos no Barroco (por exemplo, no Brandemburgo nº 3)?", "Porque ela para na dominante do tom seguinte: o movimento lento termina em suspensão e o Allegro que vem depois começa na tônica que o V prometia. O meio tom no baixo dá à pausa um peso de final, sem fechar."] },
        ] },
      { tipo: "contraste", titulo: "Perfeita × imperfeita: a mesma progressão",
        a: { rotulo: "A — CAP: 5̂–4̂–3̂–2̂–1̂", partitura: "tom: F maior\nsoprano: C5/1 Bb4/1 A4/1 G4/1 F4/4\nbaixo: A2/1 Bb2/1 C3/1 C3/1 F2/4", cifras: cifrasDe("A2/1 Bb2/1 C3/1 C3/1 F2/4", "I6 ii6 I64 V I"), contexto: { plano: { cadencia: 2 } } },
        b: { rotulo: "B — CAI: a 7ª resolve em 3̂", partitura: "tom: F maior\nsoprano: C5/1 Bb4/1 A4/1 Bb4/1 A4/4\nbaixo: A2/1 Bb2/1 C3/1 C3/1 F2/4", cifras: cifrasDe("A2/1 Bb2/1 C3/1 C3/1 F2/4", "I6 ii6 I64 V7 I"), contexto: { plano: {} } },
        pergunta: "O baixo e as harmonias são os mesmos. O que muda na sensação de fim, e onde você usaria cada uma?",
        comentario: "<p>Em A a linha de cima desce até a tônica: o fim é inequívoco. Em B ela volta ao si♭ (a 7ª do V7) e resolve em lá — a 3ª: o acorde final é o mesmo, mas a melodia não chegou em casa. B serve para fechar uma frase interna (um antecedente forte, a primeira frase de um período progressivo) e guardar a CAP para o fim.</p>" },
      { tipo: "quebra", titulo: "A cadência que não vem",
        html: `
        <p>Se a CAP é a promessa de toda frase tonal, adiar a promessa é o recurso retórico mais simples que existe. O estilo clássico já o usava o tempo todo: a <b>cadência de engano</b> (V → vi) e a <b>cadência evitada</b> (V → I6, muitas vezes com a melodia saltando para recomeçar — o “one more time” descrito por Schmalfeldt e Caplin) <b>alongam a frase</b>: a fórmula cadencial é repetida, às vezes duas ou três vezes, antes da CAP verdadeira. O efeito é de expectativa aumentada, não de erro — a frase fica maior do que a quadratura prometia.</p>
        <ul><li><b>Corais de Bach:</b> a cadência de engano em fins de verso internos, guardando a CAP para o último.</li>
        <li><b>A plagal como coda:</b> depois da CAP, IV–I confirma sem acrescentar tensão — o “Amém” dos hinos, o fim do “Hallelujah” de Händel. No Romantismo a coda plagal ganha o iv emprestado do menor (IV – iv – I, com 6̂–♭6̂–5̂ numa voz): o fechamento vira cor.</li>
        <li><b>Wagner, Prelúdio de Tristão e Isolda:</b> as frases iniciais terminam em dominantes de lá menor que não resolvem; quando enfim uma cadência parece chegar, no c. 17, ela é de engano — o acorde de fá maior (VI) no lugar da tônica. Adiar a tônica vira o princípio da peça inteira.</li>
        <li><b>Schumann, Dichterliebe nº 1:</b> a canção termina no acorde de 7ª de dominante de fá♯ menor, sem resolver. A cadência que não vem é o assunto do poema (o desejo não realizado).</li></ul>
        <p>O que esses exemplos têm em comum: <b>a regra continua valendo</b>. O engano só engana porque o ouvido espera a CAP; a coda plagal só confirma porque a CAP já veio. Quebrar a cadência é trabalhar com a expectativa que ela criou.</p>`,
        exemplos: [
          { rotulo: "Cadência de engano e cadência repetida (si♭ maior)", partitura: `tom: Bb maior\nsoprano: ${ENG_S}\nbaixo: ${ENG_B}`, cifras: cifrasDe(ENG_B, ENG_C),
            perfil: COM_CAD, contexto: { plano: { cadencia: 5 }, cadencias: [{ compasso: 3, tipo: "engano" }, { compasso: 5, tipo: "perfeita" }] },
            comentario: "C. 2–3: ii6 – I64 – V e a voz de cima faz 3̂–2̂–1̂ (ré–dó–si♭) — tudo promete a CAP. O baixo sobe ao sol (vi): a melodia chegou em casa, a harmonia não. A frase precisa refazer a pré-dominante (ii6) e a cadência inteira (c. 4–5); o engano acrescentou dois compassos a uma frase de três." },
          { rotulo: "Cadência evitada: 'mais uma vez' (sol maior)", partitura: `tom: G maior\nsoprano: ${EVI_S}\nbaixo: ${EVI_B}`, cifras: cifrasDe(EVI_B, EVI_C),
            perfil: COM_CAD, contexto: { plano: { cadencia: 5 }, cadencias: [{ compasso: 3, tipo: "evitada" }, { compasso: 5, tipo: "perfeita64" }] },
            comentario: "C. 2: I64 – V7 com 3̂–2̂ em cima; no c. 3 o baixo vai ao si (I6) e a voz de cima salta de volta ao ré5: o gesto do c. 1 recomeça, e a cadência é refeita igual — agora com a tônica no baixo. É o procedimento que Caplin chama de cadência evitada: a chegada é substituída pelo começo de uma repetição." },
        ] },
    ],
    exercicios: [
      { id: "cad1", titulo: "Completar: a cadência perfeita com 6/4", modo: "completar", perfil: PERFIL, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, cifrasIniciais: "I V43 I6 vi ii",
        instrucoes: "<p>Ré maior. A melodia está pronta, e o baixo e as cifras dos c. 1–2 também. Escreva o baixo e as cifras dos c. 3–4: uma <b>cadência autêntica perfeita com 6/4 cadencial</b>. Repare na melodia do c. 3–4: mi5 – ré5 – dó♯5 – ré5 — que acorde aceita o ré5 no 3º tempo, e qual aceita o dó♯5?</p>",
        texto: `tom: D maior\ncf: soprano\nsoprano: ${CAD1_S}\nbaixo: D3/2 E3/1 F#3/1 B2/2 E3/2`, duracao: 1, alvoCompassos: 4, plano: PLANO_BAIXO,
        solucao: `tom: D maior\ncf: soprano\nsoprano: ${CAD1_S}\nbaixo: ${CAD1_B}`, solucaoCifras: "I V43 I6 vi ii ii6 I64 V I",
        comentarioSolucao: "ii6 – I64 – V – I sobre sol – lá – lá – ré. A melodia faz 8̂–7̂–8̂ sobre o 6/4: o ré5 é a 4ª do 6/4 (dissonante, chegando e saindo por grau) e desce à sensível sobre o V. O 6/4 cai no 3º tempo (forte) e o V no 4º." },
      { id: "cad2", titulo: "Período em fá maior: SC e CAP", modo: "menos apoio", perfil: PERFIL, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 } }, cifrasAluno: true,
        instrucoes: "<p>Escreva o baixo e as cifras para o período: <b>semicadência no c. 4</b> (V em fundamental, sem 7ª) e <b>cadência autêntica perfeita no c. 8</b>. Os dois começos são iguais: aproveite isso. Use inversões no começo (o baixo pode andar por grau) e fundamentais na cadência.</p>",
        texto: `tom: F maior\ncf: soprano\nsoprano: ${CAD2_S}\nbaixo:`, duracao: 2, alvoCompassos: 8, plano: PLANO_BAIXO,
        solucao: `tom: F maior\ncf: soprano\nsoprano: ${CAD2_S}\nbaixo: ${CAD2_B}`, solucaoCifras: "I V43 I6 IV ii ii6 V I V43 I6 IV I64 V I",
        comentarioSolucao: "C. 1 e 5: I – V43 – I6; a 7ª do V43 (si♭4) sobe ao dó5 em 10ªs com o baixo — a exceção que Aldwell & Schachter admitem para o V43 de passagem. C. 2–4: IV – ii – ii6 – V (pré-dominante longa, SC com 5̂ em cima). C. 7: IV – I64 – V – I com 3̂–2̂–1̂ depois do clímax lá5." },
      { id: "cad3", titulo: "Lá menor: semicadência frígia e 6/4 cadencial", modo: "restrição", perfil: COM_CAD, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, cadencias: [{ compasso: 4, tipo: "frigia" }, { compasso: 8, tipo: "perfeita64" }] },
        cifrasAluno: true, cifrasIniciais: "i V65 i",
        instrucoes: "<p>Componha as duas vozes e as cifras de um período de 8 compassos em lá menor (o c. 1 está escrito). <b>Restrições:</b> o antecedente termina numa <b>semicadência frígia</b> no c. 4 (iv6 → V, baixo fá → mi), e o consequente numa <b>CAP com 6/4 cadencial</b> no c. 8. Cuidado com a 2ª aumentada fá–sol♯ em qualquer voz.</p>",
        texto: "tom: A menor\nsoprano: C5/2 B4/1 A4/1\nbaixo: A2/2 G#2/1 A2/1", duracao: 2, alvoCompassos: 8, plano: PLANO_FRASE,
        solucao: `tom: A menor\nsoprano: ${CAD3_S}\nbaixo: ${CAD3_B}`, solucaoCifras: "i V65 i i6 vii°6 i iv6 V i V43 i6 iv iv6 i64 V i",
        comentarioSolucao: "C. 3–4: iv6 → V com ré5 → mi5 em cima (6ª → 8ª em movimento contrário). C. 5 varia o c. 1 (V43 em vez de V65) para o baixo subir lá–si–dó–ré; c. 6–8: iv – iv6 – i64 – V – i, a voz de cima descendo fá–ré–dó–si–lá." },
      { id: "cad4", titulo: "Período progressivo em mi♭: CAI e CAP", modo: "livre", perfil: COM_CAD, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, cadencias: [{ compasso: 4, tipo: "imperfeita" }, { compasso: 8, tipo: "perfeita64" }] }, cifrasAluno: true, alvoCompassos: 8,
        instrucoes: "<p>Componha as duas vozes e as cifras: 8 compassos em mi♭ maior. A primeira frase fecha com uma <b>cadência autêntica imperfeita</b> no c. 4 (V → I com 3̂ ou 5̂ em cima); a segunda com uma <b>CAP com 6/4 cadencial</b> no c. 8. A hierarquia CAI &lt; CAP é o que faz a segunda frase soar como resposta.</p>",
        texto: "tom: Eb maior\nsoprano:\nbaixo:", duracao: 2, plano: PLANO_FRASE,
        solucao: `tom: Eb maior\nsoprano: ${CAD4_S}\nbaixo: ${CAD4_B}`, solucaoCifras: "I V65 I IV ii V7 I I V65 I vi ii I64 V I",
        comentarioSolucao: "C. 3–4: ii – V7 – I com o lá♭4 (7ª do V7, 4̂) resolvendo em sol4 (3̂): CAI. A segunda frase repete o começo, sobe ao clímax (lá♭5) sobre o ii e fecha com sol5 – fá5 – mi♭5 sobre I64 – V – I." },
      { id: "cad5", titulo: "Quebrar: a cadência de engano em mi menor", modo: "quebrar", perfil: { ...COM_CAD, retrogressao_cifrada: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 6 }, cadencias: [{ compasso: 4, tipo: "engano" }, { compasso: 6, tipo: "perfeita64" }] },
        cifrasAluno: true, cifrasIniciais: "i V65 i VI iv i64 V",
        instrucoes: "<p>Os c. 1–3 estão escritos e preparam uma CAP no c. 4 (i64 – V, com sol5 – fá♯5 em cima). <b>Quebre a promessa:</b> no c. 4 faça uma <b>cadência de engano</b> (V → VI; o V → iv6 também é aceito, e o verificador marca essa 'retrogressão' só como informação). Depois refaça a pré-dominante e a cadência, e feche com <b>CAP com 6/4 no c. 6</b>. A frase de 4 compassos vira uma de 6.</p>",
        texto: "tom: E menor\nsoprano: G5/2 F#5/1 E5/1 G5/2 A5/2 G5/2 F#5/2\nbaixo: E3/2 D#3/1 E3/1 C3/2 A2/2 B2/2 B2/2", duracao: 2, alvoCompassos: 6, plano: PLANO_FRASE,
        solucao: `tom: E menor\nsoprano: ${CAD5_S}\nbaixo: ${CAD5_B}`, solucaoCifras: "i V65 i VI iv i64 V VI ii°6 i64 V i",
        comentarioSolucao: "C. 4: a melodia chega ao mi5 como prometido, mas o baixo sobe ao dó (VI): engano. O ii°6 refaz a pré-dominante com a voz de cima saltando ao lá5, e os c. 5–6 repetem literalmente o gesto cadencial dos c. 3–4 — agora com a tônica. A repetição é o que torna o engano legível: o ouvinte reconhece a mesma fórmula e percebe que desta vez ela chegou." },
    ],
  }, { depoisDe: "oitava" });

  // ================================================================== FUNÇÃO E PROGRESSÃO

  const F1_B = "A2/2 F#2/2 D3/2 B2/2 E3/2 E3/2 A2/4";
  const F1_S = "A4/2 C#5/2 D5/2 F#5/2 C#5/2 B4/2 A4/4";
  const F2_B = "A2/2 D3/2 G2/2 C3/2 F2/2 D2/2 E2/4 A2/4";
  const F2_S = "C5/2 A4/2 B4/2 G4/2 A4/2 B4/2 G#4/4 A4/4";
  const BLU_S = "D5/4 E5/4 D5/4 F#5/4 E5/4 D5/4";
  const BLU_B = "G2/4 C3/4 G2/4 D3/4 C3/4 G2/4";
  const PLG_S = "F5/2 E5/2 F5/2 D5/2 Db5/2 C5/2";
  const PLG_B = "F2/2 C3/2 F2/2 Bb2/2 Bb2/2 F2/2";
  const FUN1_S = "E5/2 D5/2 C5/2 F5/2 E5/2 D5/2 C5/4";
  const FUN1_B = "C3/2 B2/2 A2/2 F2/2 G2/2 G2/2 C3/4";
  const FUN2_S = "Eb5/2 D5/1 C5/1 G5/2 F5/2 Eb5/2 F5/2 G5/4 G5/2 F5/1 Eb5/1 Ab5/2 F5/2 Eb5/2 D5/2 C5/4";
  const FUN2_B = "C3/2 B2/1 C3/1 Eb3/2 D3/2 C3/2 Ab2/2 G2/4 C3/2 B2/1 C3/1 F2/2 Ab2/2 G2/2 G2/2 C3/4";
  const FUN3_S = "D5/2 Bb4/2 Eb5/2 F5/2 D5/2 Eb5/2 D5/2 C5/2 Bb4/4";
  const FUN3_B = "Bb2/2 G2/2 C3/2 F2/2 G2/2 Eb3/2 F2/2 F2/2 Bb2/4";
  const FUN4_S = "D5/2 C#5/2 B4/2 E5/2 F#5/2 E5/2 D5/4";
  const FUN4_B = "D3/2 F#3/2 G3/2 E3/2 A2/2 A2/2 D3/4";
  const FUN5_S = "C#5/2 B4/2 D5/2 C#5/2 B4/2 G#4/2 A4/4";
  const FUN5_B = "A2/2 E3/2 D3/2 A2/2 D3/2 E3/2 A2/4";

  T.inserir(2, {
    id: "funcao", titulo: "Função e progressão",
    antes: [
      { p: "Qual é a ordem normativa das funções numa frase tonal?", o: ["T → PD → D → T", "T → D → PD → T", "PD → T → D → T", "D → PD → T → D"], e: "Tônica, pré-dominante, dominante, tônica: o modelo de frase dos manuais (Aldwell & Schachter, Kostka & Payne). A pré-dominante prepara a dominante; a dominante cria a expectativa que a tônica resolve." },
      { p: "Para Schoenberg, que movimento de fundamental é 'forte' (ascendente)?", o: ["4ª acima (= 5ª abaixo) ou 3ª abaixo, como V–I e I–vi", "4ª abaixo ou 3ª acima, como I–V e I–iii", "Por grau, como IV–V", "A mesma fundamental em outra inversão"], e: "Nas progressões fortes, a fundamental do primeiro acorde passa a ser um membro secundário do seguinte (o sol de G vira a 5ª de C). As descendentes (I–V, I–iii) fazem o contrário; as superfortes (por grau) não têm nota comum." },
      { p: "Por que V → IV é chamado de retrogressão?", o: ["Porque volta da dominante para a pré-dominante, desfazendo a tensão sem resolvê-la", "Porque produz 5ªs paralelas inevitáveis", "Porque toda fundamental que desce por grau é proibida", "Porque o IV não pode seguir nenhum acorde maior"], e: "A dominante pede a tônica; voltar à pré-dominante anda para trás no caminho T → PD → D → T. No estilo estrito ela só é aceita quando o IV6 é de passagem (baixo 5–6–7). No blues e no rock, V–IV–I é idioma." },
    ],
    objetivo: "Encadear acordes pela função (T–PD–D–T), escolhendo o movimento das fundamentais e os substitutos (vi, ii/IV, iii) pelo efeito que produzem — e reconhecer quando a retrogressão é um recurso, e não um erro.",
    ouvir: [
      "Corais de Bach: quase todas as progressões são de 5ª descendente ou substitutos dela",
      "Händel, Suíte em sol menor HWV 432, Passacaille: o ciclo de 5ªs como motor da peça",
      "Pachelbel, Cânone em ré: I–V–vi–iii–IV–I–IV–V, 4ªs descendentes compensadas por graus",
      "'Autumn Leaves' (Kosma): cadeias de ii–V–I",
      "Um blues de 12 compassos qualquer: V–IV–I nos c. 9–11",
      "Satie, Gymnopédie nº 1: dois acordes alternando sem dominante",
      "Debussy, 'La cathédrale engloutie' (Prelúdios, livro 1): acordes em paralelo, sem função",
    ],
    esboco: "Escreva só as cifras de uma frase de 4 compassos em lá maior que vá da tônica à cadência perfeita sem usar o V antes do último compasso. Que acordes você pôs no meio, e por quê?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Três funções e um caminho", html: `
        <p>A ideia de que cada acorde tem uma <b>função</b> é de Riemann (1893), que reduziu a harmonia a tônica (T), subdominante (S) e dominante (D); os manuais americanos chamam a subdominante de <b>pré-dominante</b> (PD), porque é isso o que ela faz. Os acordes diatônicos se distribuem assim:</p>
        <table class="tabela-modos"><thead><tr><th>Função</th><th>Acordes (maior)</th><th>Acordes (menor)</th><th>O que faz</th></tr></thead><tbody>
        <tr><td><b>Tônica</b></td><td>I; vi (substituto); iii (ambíguo)</td><td>i; VI; III</td><td>repouso, ponto de partida e de chegada</td></tr>
        <tr><td><b>Pré-dominante</b></td><td>IV, ii, ii6, ii65</td><td>iv, ii°6, iiø65, VI (às vezes)</td><td>afasta-se da tônica e prepara a dominante (o 4º grau no baixo ou na voz de cima sobe ao 5)</td></tr>
        <tr><td><b>Dominante</b></td><td>V, V7, vii°6, vii°7; I64 cadencial</td><td>V, V7, vii°6, vii°7 (com a sensível)</td><td>tensão: sensível e 7ª que pedem a tônica</td></tr>
        </tbody></table>
        <p>O <b>caminho normativo</b> é T → PD → D → T. Kostka &amp; Payne o desenham como um mapa em que cada acorde tende ao próximo por 5ª descendente: <b>iii → vi → ii/IV → V/vii° → I</b>, com o I podendo ir a qualquer ponto do mapa. Andar para a direita no mapa é progredir; voltar é <b>retrogressão</b>. A mais grave é D → PD (V → IV, V → ii, vii° → IV): a dominante criou a expectativa da tônica, e a pré-dominante a desfaz sem resolver. A exceção clássica é o IV6 de passagem no baixo 5–6–7 (V – IV6 – V6), que já aparece na regra da oitava.</p>
        <h3>Os substitutos</h3>
        <ul><li><b>vi no lugar do I:</b> divide duas notas com o I (em dó, lá–dó–mi e dó–mi–sol). Depois do V, ele é a cadência de engano; no começo da frase, prolonga a tônica e já desce em 3ªs para a pré-dominante (I–vi–IV–ii).</li>
        <li><b>ii e IV se trocam:</b> os dois têm o 4º grau e o 6º; o ii6 tem o mesmo baixo do IV. É o <i>double emploi</i> de Rameau: fá–lá–dó–ré pode ser IV com a 6ª acrescentada (<i>sixte ajoutée</i>) ou ii7 (ii65) — e a resolução decide qual. Em geral IV → ii é possível (3ª abaixo), ii → IV é mais fraco.</li>
        <li><b>iii, o ambíguo:</b> divide duas notas com o I e duas com o V. No estilo estrito ele aparece sobretudo para harmonizar o 7º grau <i>descendente</i> na melodia (8̂–7̂–6̂ sobre I – iii – IV) e segue para vi ou IV; o iii → V ou o iii no lugar do V soam vagos.</li></ul>` },
      { tipo: "texto", rotulo: "A regra", titulo: "O movimento das fundamentais: Rameau e Schoenberg", html: `
        <p>Rameau (<i>Traité</i>, 1722) mediu a harmonia pelo <b>baixo fundamental</b> — a sucessão das fundamentais, qualquer que seja a nota real do baixo. O modelo é a <b>5ª descendente</b> da <i>cadence parfaite</i>; as 3ªs descendentes a subdividem (I–vi–IV–ii–V–I) e o ciclo de 5ªs (I–IV–vii°–iii–vi–ii–V–I) é a mesma ideia levada a uma sequência inteira. Schoenberg (<i>Harmonielehre</i>, 1911; <i>Structural Functions</i>, 1954) classificou os movimentos em três tipos:</p>
        <table class="tabela-modos"><thead><tr><th>Classe</th><th>Fundamental</th><th>Exemplos</th><th>Uso segundo Schoenberg</th></tr></thead><tbody>
        <tr><td><b>Forte (ascendente)</b></td><td>4ª acima (5ª abaixo) ou 3ª abaixo</td><td>V–I, ii–V, vi–ii; I–vi, IV–ii</td><td>pode ser usada sem restrição</td></tr>
        <tr><td><b>Descendente (fraca)</b></td><td>4ª abaixo (5ª acima) ou 3ª acima</td><td>I–V, IV–I; I–iii, vi–I</td><td>melhor em grupos de três acordes que, somados, façam um movimento forte (I–iii–vi = I–vi)</td></tr>
        <tr><td><b>Superforte (por grau)</b></td><td>2ª acima ou abaixo</td><td>IV–V, V–vi, ii–iii</td><td>enfática, muitas vezes de engano; forte demais para uso contínuo</td></tr>
        </tbody></table>
        <p>O critério é a nota comum: num movimento forte, a fundamental do primeiro acorde vira 5ª ou 3ª do seguinte (fica subordinada); num descendente, um membro secundário vira fundamental. Repare que <b>I–V</b> é descendente: por isso a frase clássica raramente vai direto da tônica à dominante sem passar pela pré-dominante, e quando vai (a semicadência I–V), soa como pergunta. Bruckner, seguindo Sechter, explicava o IV–V como 5ª descendente com um ii subentendido — o que mostra o quanto o modelo de 5ªs domina a teoria.</p>
        <p>As fundamentais não são o baixo: I64 tem fundamental na tônica mas função de dominante (ele não conta na classificação), e um baixo por grau pode esconder uma progressão forte (I6 – ii6: a fundamental vai de dó a ré, superforte; o baixo, de mi a fá).</p>` },
      { tipo: "exemplo", titulo: "Terças e quintas descendentes (lá maior)",
        intro: "I – vi – IV – ii – I64 – V – I: o modelo de Kostka & Payne, todo em movimentos fortes.",
        camadas: [
          { titulo: "O baixo fundamental e as funções", partitura: `tom: A maior\nbaixo: ${F1_B}`, rotulos: ["baixo"], cifras: cifrasDe(F1_B, "I vi IV ii I64 V I"),
            notas: [["decisao", "T (I – vi) → PD (IV – ii) → D (I64 – V) → T. As fundamentais descem em 3ªs (lá–fá♯–ré–si) e depois em 5ª (si–mi–lá)."],
              ["checagem", "Todos os movimentos são fortes na classificação de Schoenberg (3ª abaixo ou 4ª acima); o I64 não conta — é o V ornamentado."]] },
          { titulo: "A voz de cima", partitura: `tom: A maior\nsoprano: ${F1_S}\nbaixo: ${F1_B}`, rotulos: ["soprano", "baixo"], cifras: cifrasDe(F1_B, "I vi IV ii I64 V I"),
            contexto: { plano: { cadencia: 4 } },
            notas: [["decisao", "Contra um baixo que desce em 3ªs, a voz de cima sobe (lá – dó♯ – ré – fá♯): movimento contrário, de 8ª para 5ª, 8ª e 5ª."],
              ["decisao", "IV → ii no c. 2: o ré5 salta ao fá♯5 enquanto o baixo desce ré → si — contrário, sem 8ªs paralelas."],
              ["rejeitada", "ré5 → si4 sobre o ii: ré/ré e si/si seriam 8ªs paralelas. O fá♯5 (5ª do ii) dá o clímax e deixa a descida 3̂–2̂–1̂ para a cadência."],
              ["checagem", "A 8ª do c. 2 (ré5/ré3) é atingida por grau na voz de cima: aceita nas externas tonais."]],
            pausa: ["Troque o vi do c. 1 por um V. O que acontece com a frase?", "I–V é um movimento descendente (fraco) e põe a dominante antes da pré-dominante: o IV seguinte seria uma retrogressão. O vi faz o contrário: prolonga a tônica e desce em 3ª até o IV, preparando o caminho em vez de antecipar o fim."] },
        ] },
      { tipo: "exemplo", titulo: "O ciclo de quintas em lá menor",
        intro: "i – iv – VII – III – VI – ii°6 – V – i: cada fundamental 4ª acima da anterior. O baixo alterna 4ª acima e 5ª abaixo; a voz de cima alterna 10ª e 5ª, sempre em movimento contrário.",
        camadas: [
          { titulo: "A sequência", partitura: `tom: A menor\nsoprano: ${F2_S}\nbaixo: ${F2_B}`, rotulos: ["soprano", "baixo"], cifras: cifrasDe(F2_B, "i iv VII III VI ii°6 V i"),
            contexto: { plano: { cadencia: 5 } },
            notas: [["decisao", "VII (sol maior, sem sensível) e III (dó maior) são diatônicos do menor natural: no meio da sequência o ciclo passa pela relativa maior sem modular."],
              ["decisao", "ii°6 em vez de ii° em fundamental: fá2 → si2 seria um trítono no baixo. Com ré no baixo o ciclo continua (a fundamental ainda é si) e o baixo desce por grau até o mi."],
              ["rejeitada", "Pensei em 10ªs o tempo todo (dó5–ré5–si4…): com o baixo saltando 5ª abaixo e a voz de cima indo para a 5ª por salto em movimento direto, apareceriam 5ªs ocultas. Alternar 10ª–5ª em movimento contrário resolve."],
              ["checagem", "O sol natural do VII e do III e o sol♯ do V nunca se tocam numa mesma linha: não há cromatismo melódico."]],
            pausa: ["Por que uma sequência de 5ªs descendentes soa tão 'inevitável', mesmo passando por acordes como VII e III?", "Porque cada passo é a mesma progressão forte da cadência (fundamental 4ª acima): o ouvido ouve uma cadeia de pequenas cadências, cada acorde como 'dominante' do seguinte. A direção vem do movimento, não da identidade dos acordes — é por isso que Rameau e Sechter fizeram dele o modelo de toda a harmonia."] },
        ] },
      { tipo: "contraste", titulo: "Progressão × retrogressão",
        a: { rotulo: "A — I – IV – V – I", partitura: "tom: G maior\nsoprano: B4/2 C5/2 A4/2 G4/2\nbaixo: G2/2 C3/2 D3/2 G2/2", cifras: cifrasDe("G2/2 C3/2 D3/2 G2/2", "I IV V I"), contexto: { plano: { cadencia: 2 } } },
        b: { rotulo: "B — I – V – IV – I", partitura: "tom: G maior\nsoprano: B4/2 A4/2 C5/2 B4/2\nbaixo: G2/2 D3/2 C3/2 G2/2", cifras: cifrasDe("G2/2 D3/2 C3/2 G2/2", "I V IV I"), perfil: { ...PERFIL, retrogressao_cifrada: "info" }, contexto: { plano: {} } },
        pergunta: "Os mesmos quatro acordes, em outra ordem. Qual soa como frase com fim, e qual como um balanço? Qual você reconhece da música popular?",
        comentario: "<p>A percorre o caminho T → PD → D → T: o IV prepara, o V tensiona, o I resolve — uma cadência autêntica. B vai à dominante cedo (I–V, movimento descendente) e volta à pré-dominante (retrogressão): a tensão do V se desfaz sem resolver e o fim é plagal (IV–I). No estilo clássico, B soaria sem direção; no rock e no blues, V–IV–I é justamente o gesto de 'relaxar' do riff. A regra descreve um estilo, não a música inteira.</p>" },
      { tipo: "quebra", titulo: "Quando a função deixa de mandar",
        html: `
        <p>A retrogressão e a progressão fraca foram quebradas de três maneiras diferentes, cada uma com um efeito próprio:</p>
        <ul><li><b>Blues e rock: V–IV–I.</b> No blues de 12 compassos, os c. 9–11 fazem V – IV – I. A dominante não resolve: ela cede ao IV, que cai na tônica por movimento plagal. A frase termina relaxando, não resolvendo — e o retorno ao I tem o peso de um refrão, não de uma conclusão.</li>
        <li><b>Movimentos descendentes compensados.</b> O Cânone de Pachelbel (I–V–vi–iii–IV–I–IV–V) é uma cadeia de 4ªs descendentes — o movimento “fraco” de Schoenberg — compensada por subidas de grau. O resultado não tem a urgência de um ciclo de 5ªs; tem a calma de um baixo que desce sem pressa, ideal para variações.</li>
        <li><b>A coda plagal romântica.</b> O IV–I e o iv–I (emprestado do menor) depois da cadência perfeita transformam o fim em cor: a 6ª que desce cromaticamente (6̂–♭6̂–5̂) substitui a sensível que sobe.</li>
        <li><b>Função levada pela condução das vozes.</b> No Prelúdio de Tristão, Wagner prolonga dominantes de lá menor sem nunca fazer soar a tônica: o que dá direção é o movimento cromático das vozes, não a sucessão de fundamentais.</li>
        <li><b>Sem função.</b> Debussy (“La cathédrale engloutie”, a Sarabande de <i>Pour le piano</i>) move acordes inteiros em paralelo: o acorde vira timbre da melodia. Satie, na Gymnopédie nº 1, alterna dois acordes de 7ª maior sem dominante nenhuma: a música não vai a lugar algum, de propósito.</li></ul>
        <p>Nos dois primeiros casos a gramática ainda existe — o ouvido entende a retrogressão justamente porque conhece o caminho normal. Nos dois últimos, o caminho foi abandonado, e a forma passa a depender de outras coisas (registro, timbre, motivo).</p>`,
        exemplos: [
          { rotulo: "V–IV–I à maneira do blues (sol maior)", partitura: `tom: G maior\nsoprano: ${BLU_S}\nbaixo: ${BLU_B}`, cifras: cifrasDe(BLU_B, "I IV I V IV I"),
            perfil: { ...COM_CAD, retrogressao_cifrada: "info" }, contexto: { plano: {}, cadencias: [{ compasso: 5, tipo: "retrogressao" }, { compasso: 6, tipo: "plagal" }] },
            comentario: "Um acorde por compasso, como num blues condensado. No c. 5 o V volta ao IV (o verificador marca a retrogressão só como informação) e o fim é plagal. A voz de cima caminha em 10ªs com o baixo nos c. 4–5 (fá♯5/ré3 → mi5/dó3) e desce por grau à 5ª do I." },
          { rotulo: "CAP e coda plagal com o iv emprestado (fá maior)", partitura: `tom: F maior\nsoprano: ${PLG_S}\nbaixo: ${PLG_B}`, cifras: cifrasDe(PLG_B, "I V7 I IV iv I"),
            perfil: { ...COM_CAD, intervalo_melodico_aumentado_diminuto: "info" }, contexto: { plano: {}, cadencias: [{ compasso: 2, tipo: "perfeita" }, { compasso: 3, tipo: "plagal" }] },
            comentario: "C. 1–2: CAP com 8̂–7̂–8̂ em cima. Depois dela, IV – iv – I: a voz de cima desce ré5 – ré♭5 – dó5, o semitom cromático que o estilo estrito proíbe numa linha (aqui marcado só como informação). A tônica já chegou; a coda só lhe dá cor." },
        ] },
    ],
    exercicios: [
      { id: "fun1", titulo: "Completar: qual acorde, qual função?", modo: "completar", perfil: PERFIL, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, cifrasIniciais: "I V6",
        instrucoes: "<p>Dó maior. O baixo está pronto e o c. 1 também. Escreva a voz de cima dos c. 2–4 e todas as cifras. O lá2 do c. 2 pode ser vi (tônica substituta) ou IV6; o fá2, IV ou ii6 — a nota da melodia decide. A frase deve andar T → PD → D → T e fechar com CAP.</p>",
        texto: `tom: C maior\ncf: baixo\nsoprano: E5/2 D5/2\nbaixo: ${FUN1_B}`, duracao: 2, alvoCompassos: 4, plano: PLANO_BAIXO,
        solucao: `tom: C maior\ncf: baixo\nsoprano: ${FUN1_S}\nbaixo: ${FUN1_B}`, solucaoCifras: "I V6 vi IV I64 V I",
        comentarioSolucao: "I – V6 – vi: a tônica é prolongada pelo V6 de bordadura e continua no vi (a 'cadência de engano' interna, sem peso de cadência). vi → IV (3ª abaixo, forte) entra na pré-dominante; o fá5 em 8ª com o baixo chega por movimento contrário. Depois, I64 – V – I com 3̂–2̂–1̂." },
      { id: "fun2", titulo: "Dó menor: baixo e cifras para um período", modo: "menos apoio", perfil: PERFIL, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 } }, cifrasAluno: true,
        instrucoes: "<p>Escreva o baixo e as cifras: SC no c. 4, CAP no c. 8. Planeje primeiro as funções de cada compasso (T, PD, D) e só depois escolha os acordes e as inversões. Em menor: V e vii° com a sensível (si♮).</p>",
        texto: `tom: C menor\ncf: soprano\nsoprano: ${FUN2_S}\nbaixo:`, duracao: 2, alvoCompassos: 8, plano: PLANO_BAIXO,
        solucao: `tom: C menor\ncf: soprano\nsoprano: ${FUN2_S}\nbaixo: ${FUN2_B}`, solucaoCifras: "i V65 i i6 vii°6 i iv6 V i V65 i iv iv6 i64 V i",
        comentarioSolucao: "Funções: c. 1–3 T (i – V65 – i – i6 – vii°6 – i: a dominante aqui é de bordadura e de passagem, prolongando a tônica), c. 3 PD (iv6), c. 4 D (semicadência frígia). No consequente a PD ocupa um compasso inteiro (iv – iv6) antes do i64 – V – i." },
      { id: "fun3", titulo: "Só progressões fortes (si♭ maior)", modo: "restrição", perfil: { ...PERFIL, cad_progressao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 }, movimentos: { proibir: ["descendente"] } }, cifrasAluno: true,
        instrucoes: "<p>Escreva o baixo e as cifras. <b>Restrição (Schoenberg):</b> nenhuma progressão descendente — a fundamental nunca vai uma 4ª abaixo (I–V, IV–I) nem uma 3ª acima (I–iii, vi–I). Só fortes (4ª acima, 3ª abaixo) e superfortes (por grau). O 6/4 cadencial não conta. Termine com CAP.</p>",
        texto: `tom: Bb maior\ncf: soprano\nsoprano: ${FUN3_S}\nbaixo:`, duracao: 2, alvoCompassos: 5, plano: PLANO_BAIXO,
        solucao: `tom: Bb maior\ncf: soprano\nsoprano: ${FUN3_S}\nbaixo: ${FUN3_B}`, solucaoCifras: "I vi ii V vi ii6 I64 V I",
        comentarioSolucao: "I – vi – ii – V: 3ª abaixo e duas 4ªs acima. No c. 3 o V vai ao vi (superforte: uma cadência de engano no meio da frase), e vi – ii6 – (I64) – V – I refaz o caminho. Para chegar ao V a partir do I sem I–V, foi preciso passar pela tônica substituta e pela pré-dominante — é o que a restrição ensina." },
      { id: "fun4", titulo: "Livre: o iii sobre o 7º grau descendente", modo: "livre", perfil: { ...PERFIL, cad_acordes_pedidos: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, acordesPedidos: ["iii"] }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha as duas vozes e as cifras: uma frase de 4 compassos em ré maior, T → PD → D → T, com CAP no fim. Use o <b>iii</b> uma vez, do jeito que o estilo estrito o usa: harmonizando o 7º grau que desce (dó♯ → si na melodia).</p>",
        texto: "tom: D maior\nsoprano:\nbaixo:", duracao: 2, plano: PLANO_BAIXO,
        solucao: `tom: D maior\nsoprano: ${FUN4_S}\nbaixo: ${FUN4_B}`, solucaoCifras: "I iii IV ii I64 V I",
        comentarioSolucao: "A melodia desce 8̂–7̂–6̂ (ré–dó♯–si) sobre I – iii – IV: o dó♯ é a 5ª do iii, e por isso não pede resolução como sensível. iii → IV é superforte; IV → ii (3ª abaixo) troca um pré-dominante pelo outro antes do I64 – V – I." },
      { id: "fun5", titulo: "Quebrar: a retrogressão como idioma", modo: "quebrar", perfil: { ...COM_CAD, retrogressao_cifrada: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, cadencias: [{ compasso: 2, tipo: "retrogressao" }] }, cifrasAluno: true, cifrasIniciais: "I V",
        instrucoes: "<p>Lá maior. O c. 1 (I – V) está escrito. <b>No c. 2, quebre a regra:</b> volte da dominante para a pré-dominante (V → IV, como no rock) e caia na tônica. Nos c. 3–4, mostre o contraste: o caminho clássico PD → D → T com cadência autêntica perfeita. A retrogressão aparece só como informação.</p>",
        texto: "tom: A maior\nsoprano: C#5/2 B4/2\nbaixo: A2/2 E3/2", duracao: 2, alvoCompassos: 4, plano: PLANO_FRASE,
        solucao: `tom: A maior\nsoprano: ${FUN5_S}\nbaixo: ${FUN5_B}`, solucaoCifras: "I V IV I ii6 V I",
        comentarioSolucao: "C. 1–2: I – V – IV – I, o balanço do rock: o V cede ao IV e a frase volta à tônica sem tensão (com a voz de cima ré5 → dó♯5 sobre IV – I, 8ª e 10ª por movimento contrário). C. 3–4: ii6 – V – I, a mesma tônica agora atingida por cadência. Ouvir as duas metades lado a lado mostra que a retrogressão é uma escolha de estilo, não um acidente." },
    ],
  }, { depoisDe: "cadencias" });
})(this);
