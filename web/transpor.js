/* Transpõe um exercício no formato de texto para outra tonalidade (mesmo modo): as cifras em graus
 * romanos não mudam. Usado nos treinos "em todos os tons" (regra da oitava, cadências).
 *   Transpor.texto(texto, "D maior") → texto com as alturas e o cabeçalho tom: trocados
 *   Transpor.tomDoDia(lista, data)    → um tom da lista, o mesmo durante o dia */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"), require("./editor.js"));
  else raiz.Transpor = fabrica(raiz.Motor, raiz.Editor);
})(this, function (M, Ed) {
  "use strict";

  function texto(tx, novoTom) {
    const m = Ed.ler(tx);
    if (!m.cab.tom) return tx;
    const de = M.interpretarTom(m.cab.tom), para = M.interpretarTom(novoTom);
    const passos = ((para.tonica.letra - de.tonica.letra) % 7 + 7) % 7;
    let semis = (((para.tonica.ps - de.tonica.ps) % 12) + 12) % 12;
    // escolhe o sentido que move menos (sobe até uma 4ª, senão desce)
    const desce = semis > 6;
    const p = desce ? passos - 7 : passos, s = desce ? semis - 12 : semis;
    for (const v of m.vozes) for (const e of v.eventos) {
      if (!e.alt) continue;
      const a = M.transpor(M.lerAltura(e.alt), p, s);
      e.alt = Ed.normalizarAltura(a.nome + a.oitava);
    }
    m.cab.tom = novoTom;
    return Ed.escrever(m);
  }

  function tomDoDia(lista, data = new Date()) {
    const d = Math.floor(data.getTime() / 86400000);
    return lista[((d * 7) % lista.length + lista.length) % lista.length];
  }

  return { texto, tomDoDia };
});
