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
    objetivo: "Escolher a cadência de cada ponto da frase e escrevê-la no par soprano–baixo, com o 6/4 cadencial no tempo certo.",
    ouvir: [
      "Bach, Brandemburgo nº 3, Adagio: uma semicadência frígia",
      "Mozart, Sonata K. 545, 1º mov.: CAP com 6/4 cadencial",
      "Wagner, Prelúdio de Tristão, c. 17: cadência de engano",
    ],
    esboco: "Pense numa melodia de 8 compassos em sol maior que você conheça (ou invente). Onde ela respira no meio? Que nota tem a melodia ali, e que acorde você poria por baixo? E no fim?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Os tipos de cadência e a sua força", html: `
        <p>Cadência: fórmula que <b>fecha uma frase</b> (Rameau, 1722; Caplin, 1998).</p>
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
        <ul><li><b>CAP &gt; CAI &gt; SC</b>: antecedente em SC (ou CAI), consequente em CAP.</li>
        <li>Plagal: quase sempre depois de uma CAP, prolongando a tônica (Caplin).</li>
        <li>Engano e evitada: desvios da CAP; exigem outra cadência depois.</li></ul>
        <h3>O que torna a perfeita perfeita</h3>
        <ul><li>Baixo 5 → 1, fundamentais.</li>
        <li>1̂ em cima no acorde final.</li>
        <li>I num tempo mais forte que o V.</li>
        <li>Preparação PD → D → T (IV, ii6, ii65).</li></ul>` },
      { tipo: "texto", rotulo: "A regra", titulo: "O 6/4 cadencial e as fórmulas melódicas", html: `
        <p><b>6/4 cadencial</b> = V ornamentado (V<sup>6–5</sup><sub>4–3</sub>), dupla apojatura sobre 5̂.</p>
        <ol><li><b>Metro:</b> 6/4 mais forte que o V (4/4: 1–3 ou 3–4).</li>
        <li><b>Baixo:</b> mesmo 5̂ sob os dois; vem de uma PD (IV, ii6, ii65).</li>
        <li><b>Resolução:</b> 6–5 e 4–3; em cima, 3̂–2̂ ou 1̂–7̂.</li></ol>
        <table class="tabela-modos"><thead><tr><th>Fórmula (voz de cima)</th><th>Sobre</th><th>Comentário</th></tr></thead><tbody>
        <tr><td><b>3̂–2̂–1̂</b></td><td>I64 – V – I (ou ii6 – V – I)</td><td>a mais comum; o 3̂ sobre o 6/4 é a 6ª que desce</td></tr>
        <tr><td><b>5̂–4̂–3̂–2̂–1̂</b></td><td>I – V43 – I6 … ii6 – I64 – V – I</td><td>a descida completa (a <i>Urlinie</i> de Schenker); o 4̂ sobre V43 ou V7 é a 7ª que desce</td></tr>
        <tr><td><b>8̂–7̂–8̂</b></td><td>I64 – V – I</td><td>a 4ª do 6/4 (1̂) desce à sensível e volta: a voz de cima tem a cláusula do soprano renascentista</td></tr>
        <tr><td><b>2̂–7̂–1̂</b></td><td>V – (V7) – I</td><td>2̂ e 7̂ são notas do mesmo V; a melodia desce à sensível e a resolve subindo</td></tr>
        <tr><td><b>2̂–3̂</b>, <b>4̂–3̂</b></td><td>V – I, V7 – I</td><td>fecham em 3̂: cadência imperfeita</td></tr>
        <tr><td><b>4̂–5̂</b> (menor: ♭6 no baixo)</td><td>iv6 – V</td><td>a semicadência frígia: externas em movimento contrário, 6ª → 8ª</td></tr>
        </tbody></table>
        <p>Menor: evite ♭6̂–7̂ (2ª aum.); use o 6̂ elevado só subindo.</p>` },
      { tipo: "exemplo", titulo: "Um período em sol maior: semicadência e cadência perfeita",
        intro: "Antecedente e consequente começam iguais; só as cadências os distinguem.",
        camadas: [
          { titulo: "Os pontos de chegada", partitura: "tom: G maior\nsoprano: P/4 P/4 C5/2 E5/2 D5/4 P/4 P/4 E5/1 C5/1 B4/1 A4/1 G4/4\nbaixo: P/4 P/4 A2/2 C3/2 D3/4 P/4 P/4 C3/2 D3/1 D3/1 G2/4", rotulos: ["soprano", "baixo"],
            notas: [["decisao", "Primeiro as chegadas: SC no c. 4 (ii – ii6 – V, 5̂ em cima), CAP no c. 8 (ii6 – I64 – V – I, 3̂–2̂–1̂)."],
              ["decisao", "Mesma PD (ii6) nas duas: a diferença está só na chegada."]] },
          { titulo: "O período completo", partitura: `tom: G maior\nsoprano: ${PER_S}\nbaixo: ${PER_B}`, rotulos: ["soprano", "baixo"], cifras: cifrasDe(PER_B, PER_C),
            contexto: { plano: { semicadencia: 4, cadencia: 8 } },
            anotacoes: [[1, 7, "SC"], [1, 14, "6/4"], [1, 16, "CAP"], [0, 13, "clímax"]],
            notas: [["decisao", "C. 1 e 5: I – V43 – I6, 5̂–4̂–3̂ em cima; a 7ª (dó5) desce contra o baixo."],
              ["decisao", "C. 7: ii6 (1º tempo), 6/4 (3º, forte), V (4º); em cima 3̂–2̂–1̂."],
              ["rejeitada", "V–I no c. 4 (CAI): a pergunta ficaria quase tão conclusiva quanto a resposta."]],
            pausa: ["E se o c. 8 tivesse si4 (3̂) em cima?", "Seria CAI: mesmas harmonias, mas sem 1̂ em cima o fim fica mais fraco — útil quando ainda vem outra frase (período progressivo)."] },
        ] },
      { tipo: "exemplo", titulo: "Em ré menor: a semicadência frígia",
        intro: "Mesma forma em menor; a pergunta termina em iv6 → V, baixo descendo meio tom.",
        camadas: [
          { titulo: "Antecedente e consequente", partitura: `tom: D menor\nsoprano: ${RE_S}\nbaixo: ${RE_B}`, rotulos: ["soprano", "baixo"], cifras: cifrasDe(RE_B, RE_C),
            contexto: { plano: { semicadencia: 4, cadencia: 8 } },
            anotacoes: [[1, 7, "♭6"], [1, 8, "5"], [1, 15, "6/4"]],
            notas: [["decisao", "C. 3–4: iv6 → V; si♭2 → lá2 contra sol5 → lá5: 6ª → 8ª, a cláusula frígia."],
              ["decisao", "C. 6: ii°6, não ii°: o trítono fica nas vozes de cima; baixo sol → lá."],
              ["rejeitada", "iv em fundamental também é SC, mas perde o meio tom no baixo e a cor arcaica."]],
            pausa: ["Por que a SC frígia fechava movimentos lentos barrocos?", "Para no V do tom seguinte: o Allegro começa na tônica prometida. O meio tom no baixo dá peso de final sem fechar."] },
        ] },
      { tipo: "contraste", titulo: "Perfeita × imperfeita: a mesma progressão",
        a: { rotulo: "A — CAP: 5̂–4̂–3̂–2̂–1̂", partitura: "tom: F maior\nsoprano: C5/1 Bb4/1 A4/1 G4/1 F4/4\nbaixo: A2/1 Bb2/1 C3/1 C3/1 F2/4", cifras: cifrasDe("A2/1 Bb2/1 C3/1 C3/1 F2/4", "I6 ii6 I64 V I"), contexto: { plano: { cadencia: 2 } } },
        b: { rotulo: "B — CAI: a 7ª resolve em 3̂", partitura: "tom: F maior\nsoprano: C5/1 Bb4/1 A4/1 Bb4/1 A4/4\nbaixo: A2/1 Bb2/1 C3/1 C3/1 F2/4", cifras: cifrasDe("A2/1 Bb2/1 C3/1 C3/1 F2/4", "I6 ii6 I64 V7 I"), contexto: { plano: {} } },
        pergunta: "Mesmo baixo, mesmas harmonias. O que muda no fim, e onde usar cada uma?",
        comentario: "<p>A: a melodia chega à tônica, fim inequívoco. B: a 7ª (si♭) resolve na 3ª, a melodia não chega em casa. B fecha frases internas e guarda a CAP para o fim.</p>" },
      { tipo: "quebra", titulo: "A cadência que não vem",
        html: `
        <table class="tabela-modos"><thead><tr><th>Obra</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Estilo clássico (Caplin, Schmalfeldt)</td><td>engano (V → vi) e evitada (V → I6), fórmula repetida</td><td>frase alongada, expectativa maior</td></tr>
        <tr><td>Corais de Bach</td><td>engano em fins de verso internos</td><td>CAP guardada para o último verso</td></tr>
        <tr><td>Händel, “Hallelujah”; Romantismo</td><td>coda plagal após a CAP (IV – iv – I)</td><td>confirma sem tensão; o iv dá cor</td></tr>
        <tr><td>Wagner, Prelúdio de Tristão</td><td>dominantes sem resolução; c. 17: engano em VI</td><td>adiar a tônica vira o princípio da peça</td></tr>
        <tr><td>Schumann, Dichterliebe nº 1</td><td>termina no V7, sem resolver</td><td>o desejo não realizado do poema</td></tr>
        </tbody></table>
        <p>A regra continua valendo: o engano só engana porque o ouvido espera a CAP.</p>`,
        exemplos: [
          { rotulo: "Cadência de engano e cadência repetida (si♭ maior)", partitura: `tom: Bb maior\nsoprano: ${ENG_S}\nbaixo: ${ENG_B}`, cifras: cifrasDe(ENG_B, ENG_C),
            perfil: COM_CAD, contexto: { plano: { cadencia: 5 }, cadencias: [{ compasso: 3, tipo: "engano" }, { compasso: 5, tipo: "perfeita" }] },
            comentario: "C. 2–3: ii6 – I64 – V com 3̂–2̂–1̂ promete a CAP; o baixo vai ao sol (vi). A cadência é refeita nos c. 4–5: dois compassos a mais." },
          { rotulo: "Cadência evitada: 'mais uma vez' (sol maior)", partitura: `tom: G maior\nsoprano: ${EVI_S}\nbaixo: ${EVI_B}`, cifras: cifrasDe(EVI_B, EVI_C),
            perfil: COM_CAD, contexto: { plano: { cadencia: 5 }, cadencias: [{ compasso: 3, tipo: "evitada" }, { compasso: 5, tipo: "perfeita64" }] },
            comentario: "C. 2: I64 – V7, 3̂–2̂ em cima; c. 3: baixo ao si (I6), a melodia salta ao ré5 e recomeça. A cadência é refeita, agora com a tônica no baixo." },
        ] },
    ],
    exercicios: [
      { id: "cad1", titulo: "Completar: a cadência perfeita com 6/4", modo: "completar", perfil: PERFIL, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, cifrasIniciais: "I V43 I6 vi ii",
        instrucoes: "<p>Escreva baixo e cifras dos c. 3–4: <b>CAP com 6/4 cadencial</b>. Que acorde aceita o ré5 do 3º tempo, e qual o dó♯5?</p>",
        texto: `tom: D maior\ncf: soprano\nsoprano: ${CAD1_S}\nbaixo: D3/2 E3/1 F#3/1 B2/2 E3/2`, duracao: 1, alvoCompassos: 4, plano: PLANO_BAIXO,
        solucao: `tom: D maior\ncf: soprano\nsoprano: ${CAD1_S}\nbaixo: ${CAD1_B}`, solucaoCifras: "I V43 I6 vi ii ii6 I64 V I",
        comentarioSolucao: "ii6 – I64 – V – I. Melodia 8̂–7̂–8̂: o ré5 é a 4ª do 6/4 e desce à sensível. 6/4 no 3º tempo, V no 4º." },
      { id: "cad2", titulo: "Período em fá maior: SC e CAP", modo: "menos apoio", perfil: PERFIL, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 } }, cifrasAluno: true,
        instrucoes: "<p>Baixo e cifras: <b>SC no c. 4</b> (V sem 7ª) e <b>CAP no c. 8</b>. Os começos são iguais. Inversões no começo, fundamentais na cadência.</p>",
        texto: `tom: F maior\ncf: soprano\nsoprano: ${CAD2_S}\nbaixo:`, duracao: 2, alvoCompassos: 8, plano: PLANO_BAIXO,
        solucao: `tom: F maior\ncf: soprano\nsoprano: ${CAD2_S}\nbaixo: ${CAD2_B}`, solucaoCifras: "I V43 I6 IV ii ii6 V I V43 I6 IV I64 V I",
        comentarioSolucao: "C. 1: I – V43 – I6, a 7ª sobe em 10ªs (V43 de passagem). C. 2–4: IV – ii – ii6 – V. C. 7: IV – I64 – V – I, 3̂–2̂–1̂ após o clímax." },
      { id: "cad3", titulo: "Lá menor: semicadência frígia e 6/4 cadencial", modo: "restrição", perfil: COM_CAD, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 }, cadencias: [{ compasso: 4, tipo: "frigia" }, { compasso: 8, tipo: "perfeita64" }] },
        cifrasAluno: true, cifrasIniciais: "i V65 i",
        instrucoes: "<p>Período de 8 c. (duas vozes e cifras): <b>SC frígia no c. 4</b> (iv6 → V) e <b>CAP com 6/4 no c. 8</b>. Evite a 2ª aum. fá–sol♯.</p>",
        texto: "tom: A menor\nsoprano: C5/2 B4/1 A4/1\nbaixo: A2/2 G#2/1 A2/1", duracao: 2, alvoCompassos: 8, plano: PLANO_FRASE,
        solucao: `tom: A menor\nsoprano: ${CAD3_S}\nbaixo: ${CAD3_B}`, solucaoCifras: "i V65 i i6 vii°6 i iv6 V i V43 i6 iv iv6 i64 V i",
        comentarioSolucao: "C. 3–4: iv6 → V, ré5 → mi5 (6ª → 8ª). C. 5: V43 para o baixo subir. C. 6–8: iv – iv6 – i64 – V – i, melodia descendo ao lá." },
      { id: "cad4", titulo: "Período progressivo em mi♭: CAI e CAP", modo: "livre", perfil: COM_CAD, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 8 }, cadencias: [{ compasso: 4, tipo: "imperfeita" }, { compasso: 8, tipo: "perfeita64" }] }, cifrasAluno: true, alvoCompassos: 8,
        instrucoes: "<p>Duas vozes e cifras, 8 c.: <b>CAI no c. 4</b> (3̂ ou 5̂ em cima) e <b>CAP com 6/4 no c. 8</b>.</p>",
        texto: "tom: Eb maior\nsoprano:\nbaixo:", duracao: 2, plano: PLANO_FRASE,
        solucao: `tom: Eb maior\nsoprano: ${CAD4_S}\nbaixo: ${CAD4_B}`, solucaoCifras: "I V65 I IV ii V7 I I V65 I vi ii I64 V I",
        comentarioSolucao: "C. 3–4: ii – V7 – I, a 7ª (lá♭4) resolve em 3̂: CAI. 2ª frase: clímax lá♭5 sobre ii, 3̂–2̂–1̂ sobre I64 – V – I." },
      { id: "cad5", titulo: "Quebrar: a cadência de engano em mi menor", modo: "quebrar", perfil: { ...COM_CAD, retrogressao_cifrada: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 6 }, cadencias: [{ compasso: 4, tipo: "engano" }, { compasso: 6, tipo: "perfeita64" }] },
        cifrasAluno: true, cifrasIniciais: "i V65 i VI iv i64 V",
        instrucoes: "<p>Os c. 1–3 prometem CAP no c. 4. Faça <b>engano no c. 4</b> (V → VI ou iv6), refaça PD e cadência e feche com <b>CAP com 6/4 no c. 6</b>.</p>",
        texto: "tom: E menor\nsoprano: G5/2 F#5/1 E5/1 G5/2 A5/2 G5/2 F#5/2\nbaixo: E3/2 D#3/1 E3/1 C3/2 A2/2 B2/2 B2/2", duracao: 2, alvoCompassos: 6, plano: PLANO_FRASE,
        solucao: `tom: E menor\nsoprano: ${CAD5_S}\nbaixo: ${CAD5_B}`, solucaoCifras: "i V65 i VI iv i64 V VI ii°6 i64 V i",
        comentarioSolucao: "C. 4: melodia no mi5, baixo no dó (VI): engano. ii°6 refaz a PD; c. 5–6 repetem o gesto dos c. 3–4, agora chegando à tônica." },
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
    objetivo: "Encadear acordes por função (T–PD–D–T), escolhendo fundamentais e substitutos pelo efeito; usar a retrogressão como recurso.",
    ouvir: [
      "Händel, Passacaille HWV 432: ciclo de 5ªs",
      "Pachelbel, Cânone em ré: 4ªs descendentes compensadas",
      "Blues de 12 compassos: V–IV–I nos c. 9–11",
    ],
    esboco: "Escreva só as cifras de uma frase de 4 compassos em lá maior que vá da tônica à cadência perfeita sem usar o V antes do último compasso. Que acordes você pôs no meio, e por quê?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Três funções e um caminho", html: `
        <p>Funções (Riemann, 1893): tônica, <b>pré-dominante</b> (PD, a subdominante) e dominante.</p>
        <table class="tabela-modos"><thead><tr><th>Função</th><th>Acordes (maior)</th><th>Acordes (menor)</th><th>O que faz</th></tr></thead><tbody>
        <tr><td><b>Tônica</b></td><td>I; vi (substituto); iii (ambíguo)</td><td>i; VI; III</td><td>repouso, ponto de partida e de chegada</td></tr>
        <tr><td><b>Pré-dominante</b></td><td>IV, ii, ii6, ii65</td><td>iv, ii°6, iiø65, VI (às vezes)</td><td>afasta-se da tônica e prepara a dominante (o 4º grau no baixo ou na voz de cima sobe ao 5)</td></tr>
        <tr><td><b>Dominante</b></td><td>V, V7, vii°6, vii°7; I64 cadencial</td><td>V, V7, vii°6, vii°7 (com a sensível)</td><td>tensão: sensível e 7ª que pedem a tônica</td></tr>
        </tbody></table>
        <p>Caminho: <b>iii → vi → ii/IV → V/vii° → I</b> (Kostka &amp; Payne); o I vai a qualquer ponto. Voltar é <b>retrogressão</b>; a mais grave, D → PD (V → IV). Exceção: IV6 de passagem (V – IV6 – V6).</p>
        <table class="tabela-modos"><thead><tr><th>Substituto</th><th>Por quê</th><th>Uso</th></tr></thead><tbody>
        <tr><td><b>vi</b> por I</td><td>2 notas comuns</td><td>após V: engano; no início: prolonga T e desce em 3ªs (I–vi–IV–ii)</td></tr>
        <tr><td><b>ii</b> ↔ <b>IV</b></td><td>4̂ e 6̂ comuns; <i>double emploi</i> (Rameau)</td><td>IV → ii bom; ii → IV mais fraco</td></tr>
        <tr><td><b>iii</b></td><td>ambíguo entre I e V</td><td>7̂ descendente (I – iii – IV), segue a vi ou IV; nunca no lugar do V</td></tr>
        </tbody></table>` },
      { tipo: "texto", rotulo: "A regra", titulo: "O movimento das fundamentais: Rameau e Schoenberg", html: `
        <p><b>Baixo fundamental</b> (Rameau, 1722): a sucessão das fundamentais; modelo, a <b>5ª descendente</b>. Classes de Schoenberg (1911):</p>
        <table class="tabela-modos"><thead><tr><th>Classe</th><th>Fundamental</th><th>Exemplos</th><th>Uso segundo Schoenberg</th></tr></thead><tbody>
        <tr><td><b>Forte (ascendente)</b></td><td>4ª acima (5ª abaixo) ou 3ª abaixo</td><td>V–I, ii–V, vi–ii; I–vi, IV–ii</td><td>pode ser usada sem restrição</td></tr>
        <tr><td><b>Descendente (fraca)</b></td><td>4ª abaixo (5ª acima) ou 3ª acima</td><td>I–V, IV–I; I–iii, vi–I</td><td>melhor em grupos de três acordes que, somados, façam um movimento forte (I–iii–vi = I–vi)</td></tr>
        <tr><td><b>Superforte (por grau)</b></td><td>2ª acima ou abaixo</td><td>IV–V, V–vi, ii–iii</td><td>enfática, muitas vezes de engano; forte demais para uso contínuo</td></tr>
        </tbody></table>
        <ul><li>Forte: a fundamental anterior vira 3ª ou 5ª do seguinte.</li>
        <li><b>I–V</b> é descendente: soa como pergunta; por isso a PD no meio.</li>
        <li>Fundamental ≠ baixo: I64 não conta; I6 – ii6 é superforte.</li></ul>` },
      { tipo: "exemplo", titulo: "Terças e quintas descendentes (lá maior)",
        intro: "I – vi – IV – ii – I64 – V – I: só movimentos fortes.",
        camadas: [
          { titulo: "O baixo fundamental e as funções", partitura: `tom: A maior\nbaixo: ${F1_B}`, rotulos: ["baixo"], cifras: cifrasDe(F1_B, "I vi IV ii I64 V I"),
            notas: [["decisao", "T (I – vi) → PD (IV – ii) → D (I64 – V) → T: 3ªs descendentes, depois 5ªs."],
              ["checagem", "Todos fortes (Schoenberg); o I64 não conta."]] },
          { titulo: "A voz de cima", partitura: `tom: A maior\nsoprano: ${F1_S}\nbaixo: ${F1_B}`, rotulos: ["soprano", "baixo"], cifras: cifrasDe(F1_B, "I vi IV ii I64 V I"),
            contexto: { plano: { cadencia: 4 } },
            notas: [["decisao", "Baixo desce em 3ªs, voz de cima sobe (lá – dó♯ – ré – fá♯): movimento contrário."],
              ["rejeitada", "ré5 → si4 sobre o ii: 8ªs paralelas com o baixo. O fá♯5 dá o clímax."]],
            pausa: ["Troque o vi do c. 1 por um V. O que acontece?", "I–V é fraco e põe a D antes da PD: o IV seria retrogressão. O vi prolonga a tônica e desce em 3ª ao IV."] },
        ] },
      { tipo: "exemplo", titulo: "O ciclo de quintas em lá menor",
        intro: "i – iv – VII – III – VI – ii°6 – V – i: cada fundamental 4ª acima da anterior.",
        camadas: [
          { titulo: "A sequência", partitura: `tom: A menor\nsoprano: ${F2_S}\nbaixo: ${F2_B}`, rotulos: ["soprano", "baixo"], cifras: cifrasDe(F2_B, "i iv VII III VI ii°6 V i"),
            contexto: { plano: { cadencia: 5 } },
            notas: [["decisao", "VII e III (menor natural): o ciclo passa pela relativa sem modular."],
              ["decisao", "ii°6, não ii°: evita o trítono fá2 → si2 no baixo."],
              ["decisao", "Voz de cima alterna 10ª e 5ª em movimento contrário: 10ªs seguidas dariam 5ªs ocultas."]],
            pausa: ["Por que o ciclo de 5ªs soa 'inevitável', mesmo com VII e III?", "Cada passo é a progressão forte da cadência: uma cadeia de pequenas cadências. A direção vem do movimento, não dos acordes."] },
        ] },
      { tipo: "contraste", titulo: "Progressão × retrogressão",
        a: { rotulo: "A — I – IV – V – I", partitura: "tom: G maior\nsoprano: B4/2 C5/2 A4/2 G4/2\nbaixo: G2/2 C3/2 D3/2 G2/2", cifras: cifrasDe("G2/2 C3/2 D3/2 G2/2", "I IV V I"), contexto: { plano: { cadencia: 2 } } },
        b: { rotulo: "B — I – V – IV – I", partitura: "tom: G maior\nsoprano: B4/2 A4/2 C5/2 B4/2\nbaixo: G2/2 D3/2 C3/2 G2/2", cifras: cifrasDe("G2/2 D3/2 C3/2 G2/2", "I V IV I"), perfil: { ...PERFIL, retrogressao_cifrada: "info" }, contexto: { plano: {} } },
        pergunta: "Mesmos acordes, outra ordem. Qual fecha, qual balança? Qual vem da música popular?",
        comentario: "<p>A: T → PD → D → T, cadência autêntica. B: V cedo e volta à PD (retrogressão); fim plagal. No clássico, B soa sem direção; no rock e no blues, V–IV–I é o 'relaxar' do riff.</p>" },
      { tipo: "quebra", titulo: "Quando a função deixa de mandar",
        html: `
        <table class="tabela-modos"><thead><tr><th>Quem</th><th>O que quebra</th><th>Efeito</th></tr></thead><tbody>
        <tr><td>Blues, rock</td><td>V – IV – I (c. 9–11)</td><td>relaxa em vez de resolver; volta como refrão</td></tr>
        <tr><td>Pachelbel, Cânone</td><td>cadeia de 4ªs descendentes</td><td>calma, sem urgência; ideal para variações</td></tr>
        <tr><td>Coda plagal romântica</td><td>IV – iv – I após a CAP (6̂–♭6̂–5̂)</td><td>o fim vira cor</td></tr>
        <tr><td>Wagner, Tristão</td><td>dominantes sem tônica</td><td>direção pelas vozes cromáticas</td></tr>
        <tr><td>Debussy, Satie</td><td>acordes paralelos; dois acordes sem dominante</td><td>sem função: acorde vira timbre</td></tr>
        </tbody></table>
        <p>Nos primeiros casos a retrogressão se entende porque o caminho normal é conhecido; nos últimos, a forma depende de registro, timbre e motivo.</p>`,
        exemplos: [
          { rotulo: "V–IV–I à maneira do blues (sol maior)", partitura: `tom: G maior\nsoprano: ${BLU_S}\nbaixo: ${BLU_B}`, cifras: cifrasDe(BLU_B, "I IV I V IV I"),
            perfil: { ...COM_CAD, retrogressao_cifrada: "info" }, contexto: { plano: {}, cadencias: [{ compasso: 5, tipo: "retrogressao" }, { compasso: 6, tipo: "plagal" }] },
            comentario: "Blues condensado: no c. 5 o V volta ao IV (retrogressão, só informação) e o fim é plagal. 10ªs nos c. 4–5." },
          { rotulo: "CAP e coda plagal com o iv emprestado (fá maior)", partitura: `tom: F maior\nsoprano: ${PLG_S}\nbaixo: ${PLG_B}`, cifras: cifrasDe(PLG_B, "I V7 I IV iv I"),
            perfil: { ...COM_CAD, intervalo_melodico_aumentado_diminuto: "info" }, contexto: { plano: {}, cadencias: [{ compasso: 2, tipo: "perfeita" }, { compasso: 3, tipo: "plagal" }] },
            comentario: "C. 1–2: CAP. Depois, IV – iv – I com ré5 – ré♭5 – dó5: o semitom cromático (só informação) dá cor à tônica já alcançada." },
        ] },
    ],
    exercicios: [
      { id: "fun1", titulo: "Completar: qual acorde, qual função?", modo: "completar", perfil: PERFIL, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 } }, cifrasAluno: true, cifrasIniciais: "I V6",
        instrucoes: "<p>Voz de cima dos c. 2–4 e todas as cifras: T → PD → D → T, CAP no fim. Lá2: vi ou IV6? Fá2: IV ou ii6? A melodia decide.</p>",
        texto: `tom: C maior\ncf: baixo\nsoprano: E5/2 D5/2\nbaixo: ${FUN1_B}`, duracao: 2, alvoCompassos: 4, plano: PLANO_BAIXO,
        solucao: `tom: C maior\ncf: baixo\nsoprano: ${FUN1_S}\nbaixo: ${FUN1_B}`, solucaoCifras: "I V6 vi IV I64 V I",
        comentarioSolucao: "I – V6 – vi prolonga a tônica (V6 de bordadura). vi → IV (forte) entra na PD; I64 – V – I com 3̂–2̂–1̂." },
      { id: "fun2", titulo: "Dó menor: baixo e cifras para um período", modo: "menos apoio", perfil: PERFIL, nivel: 6,
        contexto: { nivel: 6, plano: { semicadencia: 4, cadencia: 8 } }, cifrasAluno: true,
        instrucoes: "<p>Baixo e cifras: SC no c. 4, CAP no c. 8. Planeje as funções por compasso (T, PD, D) antes dos acordes. V e vii° com si♮.</p>",
        texto: `tom: C menor\ncf: soprano\nsoprano: ${FUN2_S}\nbaixo:`, duracao: 2, alvoCompassos: 8, plano: PLANO_BAIXO,
        solucao: `tom: C menor\ncf: soprano\nsoprano: ${FUN2_S}\nbaixo: ${FUN2_B}`, solucaoCifras: "i V65 i i6 vii°6 i iv6 V i V65 i iv iv6 i64 V i",
        comentarioSolucao: "C. 1–3: T (V65 e vii°6 só prolongam o i); iv6 (PD); c. 4: V (SC frígia). Consequente: iv – iv6 por um compasso, depois i64 – V – i." },
      { id: "fun3", titulo: "Só progressões fortes (si♭ maior)", modo: "restrição", perfil: { ...PERFIL, cad_progressao: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 5 }, movimentos: { proibir: ["descendente"] } }, cifrasAluno: true,
        instrucoes: "<p>Baixo e cifras, CAP no fim. <b>Restrição:</b> só progressões fortes (4ª acima, 3ª abaixo) e superfortes (por grau); nada de I–V, IV–I, I–iii. O 6/4 não conta.</p>",
        texto: `tom: Bb maior\ncf: soprano\nsoprano: ${FUN3_S}\nbaixo:`, duracao: 2, alvoCompassos: 5, plano: PLANO_BAIXO,
        solucao: `tom: Bb maior\ncf: soprano\nsoprano: ${FUN3_S}\nbaixo: ${FUN3_B}`, solucaoCifras: "I vi ii V vi ii6 I64 V I",
        comentarioSolucao: "I – vi – ii – V: sem I–V, o caminho passa por vi e PD. C. 3: V → vi (superforte, engano interno); vi – ii6 – I64 – V – I." },
      { id: "fun4", titulo: "Livre: o iii sobre o 7º grau descendente", modo: "livre", perfil: { ...PERFIL, cad_acordes_pedidos: "erro" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, acordesPedidos: ["iii"] }, cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Duas vozes e cifras, 4 c., T → PD → D → T, CAP. Use o <b>iii</b> uma vez, sob o 7̂ descendente (dó♯ → si).</p>",
        texto: "tom: D maior\nsoprano:\nbaixo:", duracao: 2, plano: PLANO_BAIXO,
        solucao: `tom: D maior\nsoprano: ${FUN4_S}\nbaixo: ${FUN4_B}`, solucaoCifras: "I iii IV ii I64 V I",
        comentarioSolucao: "8̂–7̂–6̂ sobre I – iii – IV: o dó♯ é 5ª do iii, não sensível. IV → ii troca de PD antes do I64 – V – I." },
      { id: "fun5", titulo: "Quebrar: a retrogressão como idioma", modo: "quebrar", perfil: { ...COM_CAD, retrogressao_cifrada: "info" }, nivel: 6,
        contexto: { nivel: 6, plano: { cadencia: 4 }, cadencias: [{ compasso: 2, tipo: "retrogressao" }] }, cifrasAluno: true, cifrasIniciais: "I V",
        instrucoes: "<p><b>C. 2:</b> V → IV → I, como no rock. <b>C. 3–4:</b> o contraste clássico, PD → D → T com CAP.</p>",
        texto: "tom: A maior\nsoprano: C#5/2 B4/2\nbaixo: A2/2 E3/2", duracao: 2, alvoCompassos: 4, plano: PLANO_FRASE,
        solucao: `tom: A maior\nsoprano: ${FUN5_S}\nbaixo: ${FUN5_B}`, solucaoCifras: "I V IV I ii6 V I",
        comentarioSolucao: "C. 1–2: I – V – IV – I, o V cede ao IV sem tensão. C. 3–4: ii6 – V – I, a mesma tônica por cadência. Retrogressão é escolha de estilo." },
    ],
  }, { depoisDe: "cadencias" });
})(this);
