/* Relatório de estilo: descreve um exercício com números e compara com referências do estilo.
 * Não julga regra (isso é o verificador): mostra como a peça se comporta, para o compositor decidir.
 *
 *   Estilo.relatorio(ex, { cf }) → [{ titulo, valor, referencia, nota, nivel: "ok"|"atencao" }]
 */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"));
  else raiz.Estilo = fabrica(raiz.Motor);
})(this, function (M) {
  "use strict";
  const F = M.ferramentas;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  function perfilMelodico(v) {
    const pares = v.paresMelodicos();
    const graus = pares.filter(([a, b]) => F.ehGrau(a, b)).length;
    const saltos = pares.filter(([a, b]) => F.ehSalto(a, b)).length;
    const repet = pares.filter(([a, b]) => a.ps === b.ps).length;
    const ps = v.notas.map((n) => n.ps);
    const topo = Math.max(...ps), fundo = Math.min(...ps);
    const cumes = v.notas.filter((n) => n.ps === topo);
    const posClimax = v.notas.length > 1 ? v.notas.indexOf(cumes[0]) / (v.notas.length - 1) : 0;
    const agudo = v.notas.find((n) => n.ps === topo), grave = v.notas.find((n) => n.ps === fundo);
    let mudancas = 0;
    for (let k = 1; k < pares.length; k++) if (F.direcao(...pares[k - 1]) * F.direcao(...pares[k]) < 0) mudancas++;
    return { pares: pares.length, graus, saltos, repet, cumes: cumes.length, posClimax, ambito: F.intervalo(grave, agudo), mudancas };
  }

  function relatorio(ex, opcoes = {}) {
    const itens = [];
    const cf = opcoes.cf !== undefined ? opcoes.cf : ex.cantusFirmus;
    const alvos = ex.vozes.map((_, i) => i).filter((i) => i !== cf && ex.vozes[i].notas.length > 1);

    // melodia de cada voz escrita pelo aluno
    for (const i of alvos) {
      const v = ex.vozes[i], p = perfilMelodico(v);
      const nome = ex.vozes.length > 1 ? ` (${v.nome})` : "";
      itens.push({
        titulo: `Graus e saltos${nome}`, valor: `${pct(p.graus, p.pares)}% por grau · ${p.saltos} saltos`,
        referencia: "linhas vocais: cerca de 2/3 ou mais por grau",
        nota: p.pares && p.graus / p.pares < 0.55 ? "A linha salta muito: tende a soar como arpejo, não como melodia." : "Equilíbrio de linha cantável.",
        nivel: p.pares && p.graus / p.pares < 0.55 ? "atencao" : "ok",
      });
      const pos = Math.round(p.posClimax * 100);
      itens.push({
        titulo: `Clímax${nome}`, valor: p.cumes > 1 ? `aparece ${p.cumes} vezes` : `único, a ${pos}% da linha`,
        referencia: "único, entre ~40% e ~75% do percurso",
        nota: p.cumes > 1 ? "O ponto mais agudo se repete: o arco perde definição." : pos < 30 ? "Clímax muito cedo: o resto da linha só desce." : pos > 85 ? "Clímax quase no fim: pouca linha para resolver a tensão." : "Posição que dá tempo de preparar e de resolver.",
        nivel: p.cumes > 1 || pos < 30 || pos > 85 ? "atencao" : "ok",
      });
      itens.push({
        titulo: `Âmbito${nome}`, valor: `${F.nomeIntervalo(p.ambito)}`, referencia: "de uma 6ª a uma 10ª",
        nota: p.ambito.geral < 6 ? "Âmbito estreito: a linha pode soar estática." : p.ambito.geral > 10 ? "Âmbito largo para uma voz." : "Âmbito de voz real.",
        nivel: p.ambito.geral < 6 || p.ambito.geral > 10 ? "atencao" : "ok",
      });
      if (p.repet) itens.push({ titulo: `Notas repetidas${nome}`, valor: String(p.repet), referencia: "0 a 1", nota: "Cada repetição congela o movimento da linha.", nivel: p.repet > 1 ? "atencao" : "ok" });
    }

    // relação entre duas vozes (a primeira voz do aluno contra o cantus firmus, ou as externas)
    if (ex.vozes.length >= 2) {
      const par = cf !== null && cf !== undefined && alvos.length ? [Math.min(alvos[0], cf), Math.max(alvos[0], cf)] : [0, ex.vozes.length - 1];
      const ms = F.momentos(ex, ...par).filter((m) => m.completo);
      const fortes = ms.filter((m) => ex.ehTempoForte(m.t));
      const tipos = fortes.map((m) => {
        const iv = F.harmonico(m.sup, m.inf);
        return F.classePerfeita(iv) ? "perfeita" : F.ehConsonante(iv, true) ? "imperfeita" : "dissonante";
      });
      const perf = tipos.filter((t) => t === "perfeita").length, imp = tipos.filter((t) => t === "imperfeita").length;
      itens.push({
        titulo: "Consonâncias nos tempos fortes", valor: `${pct(imp, tipos.length)}% imperfeitas · ${pct(perf, tipos.length)}% perfeitas`,
        referencia: "Fux: mais imperfeitas que perfeitas (perfeitas no começo, no fim e em pontos de articulação)",
        nota: imp < perf ? "Muitas 5ªs e 8ªs: o tecido fica oco e as vozes perdem identidade." : "3ªs e 6ªs formam o tecido; as perfeitas marcam pontos.",
        nivel: imp < perf ? "atencao" : "ok",
      });
      const suc = F.sucessoes(ex, ...par).filter(([a, b]) => b.atacaSup || b.atacaInf);
      const cont = { contrario: 0, obliquo: 0, direto: 0, paralelo: 0 };
      for (const [a, b] of suc) {
        const ds = F.direcao(a.sup, b.sup), di = F.direcao(a.inf, b.inf);
        if (ds === 0 || di === 0) cont.obliquo++;
        else if (ds !== di) cont.contrario++;
        else if (F.harmonico(a.sup, a.inf).simples === F.harmonico(b.sup, b.inf).simples) cont.paralelo++;
        else cont.direto++;
      }
      const tot = suc.length;
      itens.push({
        titulo: "Movimento entre as vozes", valor: `contrário ${pct(cont.contrario, tot)}% · oblíquo ${pct(cont.obliquo, tot)}% · direto ${pct(cont.direto, tot)}% · paralelo ${pct(cont.paralelo, tot)}%`,
        referencia: "o contrário costuma ser o mais frequente em contraponto a duas vozes",
        nota: cont.contrario < Math.max(cont.direto, cont.paralelo) ? "As vozes andam muito juntas: a independência sofre, mesmo sem erro de regra." : "Boa independência de direção.",
        nivel: cont.contrario < Math.max(cont.direto, cont.paralelo) ? "atencao" : "ok",
      });
      // saltos simultâneos
      let simult = 0;
      for (const [a, b] of suc) if (b.atacaSup && b.atacaInf && F.ehSalto(a.sup, b.sup) && F.ehSalto(a.inf, b.inf)) simult++;
      if (simult) itens.push({ titulo: "Saltos simultâneos", valor: String(simult), referencia: "raros: quando uma voz salta, a outra costuma andar por grau",
        nota: "Saltos nas duas vozes ao mesmo tempo chamam atenção e dificultam o equilíbrio.", nivel: simult > 1 ? "atencao" : "ok" });
      // clímax coincidente
      const top = (v) => { const m = Math.max(...v.notas.map((n) => n.ps)); return v.notas.filter((n) => n.ps === m).map((n) => ex.compassoDe(n.inicio)); };
      const a = ex.vozes[par[0]], b = ex.vozes[par[1]];
      if (a.notas.length && b.notas.length) {
        const coincide = top(a).some((c) => top(b).includes(c));
        itens.push({ titulo: "Clímax das duas vozes", valor: coincide ? "no mesmo compasso" : "em compassos diferentes", referencia: "em momentos diferentes",
          nota: coincide ? "Os dois pontos altos juntos fazem as vozes soarem como bloco." : "Cada voz tem o seu arco.", nivel: coincide ? "atencao" : "ok" });
      }
    }
    return itens;
  }

  return { relatorio };
});
