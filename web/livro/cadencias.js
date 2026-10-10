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
})(this);
