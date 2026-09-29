/* Sorteio de cantus firmi e busca de contrapontos de 1ª espécie.
 *
 * Um cantus firmus sorteado só é aceito se:
 *  - segue as regras de melodia do nível 1 (verificadas pelo próprio motor), mais as
 *    convenções de cantus firmus: começa e termina na final, termina 2→1 por grau,
 *    clímax único no meio, poucos saltos;
 *  - existe pelo menos um contraponto de 1ª espécie sem erros acima E abaixo dele
 *    (encontrado por busca e conferido pelo motor).
 */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"));
  else raiz.Cantus = fabrica(raiz.Motor);
})(this, function (M) {
  "use strict";

  const T = M.T;
  const ESCALAS = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
  };

  const MODOS = [
    { tom: "C maior", nome: "dó maior" }, { tom: "G maior", nome: "sol maior" },
    { tom: "F maior", nome: "fá maior" }, { tom: "D maior", nome: "ré maior" },
    { tom: "D dorico", nome: "ré dórico" }, { tom: "E frigio", nome: "mi frígio" },
    { tom: "G mixolidio", nome: "sol mixolídio" }, { tom: "A eolio", nome: "lá eólio" },
    { tom: "E eolio", nome: "mi eólio" }, { tom: "C dorico", nome: "dó dórico" },
  ];

  // gerador pseudoaleatório com semente, para os testes serem reproduzíveis
  function rngDe(semente) {
    let a = semente >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const escolher = (rng, lista) => lista[Math.floor(rng() * lista.length)];

  function embaralhar(rng, lista) {
    const l = lista.slice();
    for (let i = l.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [l[i], l[j]] = [l[j], l[i]];
    }
    return l;
  }

  // altura do grau `g` (0 = final; negativo = abaixo) no modo
  function grauParaAltura(tonica, escala, g) {
    const oit = Math.floor(g / 7), idx = ((g % 7) + 7) % 7;
    return M.transpor(tonica, g, 12 * oit + escala[idx]);
  }

  function tonicaDoModo(tom) {
    const t = M.interpretarTom(tom);
    // registro: a final entre dó3 e sol4, para o cantus firmus caber na clave de sol ou de fá
    const oitava = t.tonica.letra >= 5 ? 3 : 4; // lá e si ficam na oitava 3
    return { ...t, tonica: M.altura(t.tonica.letra, t.tonica.alter, oitava) };
  }

  function exercicioDe(vozesAlturas, cf) {
    const vozes = vozesAlturas.map(([nome, alts]) => {
      const v = M.criarVoz(nome);
      alts.forEach((a, k) => v.notas.push(M.nota(a, k * 4 * T, 4 * T)));
      return v;
    });
    return M.criarExercicio({ vozes, formula: [4, 4], cantusFirmus: cf });
  }

  const REGRAS_MELODIA = new Set([
    "salto_maior_que_oitava", "intervalo_melodico_aumentado_diminuto", "salto_de_sexta_ou_setima",
    "salto_nao_compensado", "saltos_consecutivos", "nota_repetida", "ponto_culminante", "ambito_melodico",
  ]);

  // convenções de cantus firmus além das regras do nível 1
  function contornoAceito(alturas) {
    const n = alturas.length;
    for (let i = 1; i < n; i++) {
      const d = alturas[i].ps - alturas[i - 1].ps;
      const prox = i + 1 < n ? alturas[i + 1].ps - alturas[i].ps : 0;
      const salto = M.intervaloAlturas(alturas[i - 1], alturas[i]).geral >= 3;
      const saltoProx = i + 1 < n && M.intervaloAlturas(alturas[i], alturas[i + 1]).geral >= 3;
      // nada de dois saltos seguidos na mesma direção
      if (salto && saltoProx && Math.sign(d) === Math.sign(prox)) return false;
      // salto de 4ª ou mais volta por grau na direção contrária
      if (Math.abs(d) >= 5 && i + 1 < n && (saltoProx || Math.sign(prox) === Math.sign(d))) return false;
    }
    // uma subida ou descida contínua não pode contornar um trítono (fá…si)
    let ini = 0;
    for (let i = 1; i <= n; i++) {
      const fimTrecho = i === n || (i + 1 < n && Math.sign(alturas[i + 1].ps - alturas[i].ps) !== Math.sign(alturas[i].ps - alturas[i - 1].ps));
      if (fimTrecho && i < n) {
        const iv = M.intervaloAlturas(alturas[ini], alturas[i]);
        if (iv.nomeSimples === "A4" || iv.nomeSimples === "d5") return false;
        ini = i;
      }
    }
    return true;
  }

  function melodiaAceita(alturas) {
    if (!contornoAceito(alturas)) return false;
    const ex = exercicioDe([["cantus", alturas]], null);
    const r = M.verificar(ex, 1);
    return !r.achados.some((a) => REGRAS_MELODIA.has(a.regra));
  }

  // passo aleatório em graus, com mais graus conjuntos que saltos
  const PASSOS = [[1, 34], [-1, 38], [2, 8], [-2, 9], [3, 4], [-3, 4], [4, 2], [-4, 1]];
  function passoAleatorio(rng) {
    const total = PASSOS.reduce((a, [, p]) => a + p, 0);
    let x = rng() * total;
    for (const [d, p] of PASSOS) { x -= p; if (x < 0) return d; }
    return 1;
  }

  function graus(rng, n) {
    for (let tentativa = 0; tentativa < 400; tentativa++) {
      const g = [0];
      while (g.length < n - 2) {
        const prox = g[g.length - 1] + passoAleatorio(rng);
        if (prox < -3 || prox > 8) continue;
        g.push(prox);
      }
      g.push(1, 0);
      if (conformeCantus(g)) return g;
    }
    return null;
  }

  function conformeCantus(g) {
    const n = g.length;
    const topo = Math.max(...g);
    const cumes = g.map((x, i) => [x, i]).filter(([x]) => x === topo);
    if (cumes.length !== 1) return false;
    const pos = cumes[0][1];
    if (pos < Math.floor(n * 0.3) || pos > n - 3) return false; // clímax no meio ou depois dele
    // chegada ao 2º grau: por grau de cima, por salto de cima, ou pela sensível embaixo
    if (![2, 3, 4, -1].includes(g[n - 3])) return false;
    // sem vai-e-volta: no máximo um retorno imediato (x y x) e nunca x y x y
    let retornos = 0;
    for (let i = 2; i < n; i++) {
      if (g[i] === g[i - 2]) retornos++;
      if (i >= 3 && g[i] === g[i - 2] && g[i - 1] === g[i - 3]) return false;
    }
    if (retornos > 1) return false;
    // nenhuma nota aparece mais de três vezes
    const vezes = {};
    for (const x of g) if ((vezes[x] = (vezes[x] || 0) + 1) > 3) return false;
    if (topo < 3) return false; // pelo menos uma 4ª acima da final
    if (Math.min(...g) < -2) return false;
    let saltos = 0, mesmaDirecao = 0, dirAnt = 0;
    for (let i = 1; i < n; i++) {
      const d = g[i] - g[i - 1];
      if (d === 0) return false;
      if (Math.abs(d) >= 2) saltos++;
      const dir = Math.sign(d);
      mesmaDirecao = dir === dirAnt ? mesmaDirecao + 1 : 1;
      dirAnt = dir;
      if (mesmaDirecao > 4) return false; // escalas longas demais soam como exercício de dedo
    }
    return saltos >= 1 && saltos <= Math.max(2, Math.round(n / 3));
  }

  /* Busca um contraponto de 1ª espécie sem erros para o cantus firmus (alturas).
   * posicao: "acima" ou "abaixo". Devolve a lista de alturas ou null. */
  function contraponto(cf, tom, posicao, rng, limite = 6000) {
    const { tonica, modo } = typeof tom === "string" ? tonicaDoModo(tom) : tom;
    const escala = ESCALAS[modo] || ESCALAS.major;
    const acima = posicao === "acima";
    const n = cf.length;
    // alturas diatônicas disponíveis
    const disponiveis = [];
    for (let g = -16; g <= 18; g++) disponiveis.push(grauParaAltura(tonica, escala, g));
    // penúltima: 6ª maior acima ou 3ª menor abaixo do cantus (a sensível, alterada se preciso)
    const pen = acima ? M.transpor(cf[n - 2].altura || cf[n - 2], 5, 9) : M.transpor(cf[n - 2].altura || cf[n - 2], -2, -3);
    const cfA = cf.map((c) => c.altura || c);
    const candidatos = cfA.map((c, i) => {
      if (i === n - 2) return [pen];
      return disponiveis.filter((p) => {
        const d = acima ? p.ps - c.ps : c.ps - p.ps;
        if (d < 0 || d > 16) return false;
        if (d === 0 && i !== 0 && i !== n - 1) return false;
        const iv = acima ? M.intervaloAlturas(c, p) : M.intervaloAlturas(p, c);
        if (!M.ehConsonante(iv, true)) return false;
        if (i === 0) return acima ? ["P1", "P5"].includes(iv.nomeSimples) : iv.nomeSimples === "P1";
        if (i === n - 1) return iv.nomeSimples === "P1";
        return true;
      });
    });
    let nos = 0;
    const cp = [];
    const ok = (i, p) => {
      if (i === 0) return true;
      const a = cp[i - 1], c1 = cfA[i - 1], c2 = cfA[i];
      const mel = M.intervaloAlturas(a, p);
      const sem = Math.abs(p.ps - a.ps);
      if (sem === 0 || sem > 12) return false;
      if (mel.qual[0] === "A" || mel.qual[0] === "d") return false;
      if (mel.geral === 7 || (mel.geral === 6 && !(mel.nome === "m6" && p.ps > a.ps))) return false;
      const [s1, i1, s2, i2] = acima ? [a, c1, p, c2] : [c1, a, c2, p];
      const h1 = M.intervaloAlturas(i1, s1), h2 = M.intervaloAlturas(i2, s2);
      const k1 = M.classePerfeita(h1), k2 = M.classePerfeita(h2);
      const dirS = Math.sign(s2.ps - s1.ps), dirI = Math.sign(i2.ps - i1.ps);
      if (k2 && dirS !== 0 && dirI !== 0) {
        if (k1 === k2) return false; // paralelas
        if (dirS === dirI) return false; // diretas
      }
      if (i >= 2) {
        const b = cp[i - 2];
        const antes = a.ps - b.ps, agora = p.ps - a.ps;
        if (Math.abs(antes) > 5 && Math.sign(antes) === Math.sign(agora)) return false;
        if (Math.abs(antes) >= 3 && Math.abs(agora) >= 3 && Math.sign(antes) === Math.sign(agora) && Math.abs(p.ps - b.ps) > 12) return false;
      }
      return true;
    };
    const busca = (i) => {
      if (++nos > limite) return false;
      if (i === n) {
        const ex = exercicioDe(acima ? [["contraponto", cp], ["cantus", cfA]] : [["cantus", cfA], ["contraponto", cp]], acima ? 1 : 0);
        return M.verificar(ex, 1).contar("erro") === 0;
      }
      for (const p of embaralhar(rng, candidatos[i])) {
        if (!ok(i, p)) continue;
        cp.push(p);
        if (busca(i + 1)) return true;
        cp.pop();
      }
      return false;
    };
    return busca(0) ? cp.slice() : null;
  }

  /* Sorteia um cantus firmus. Devolve { tom, nome, alturas, notas } ou null (raríssimo). */
  function sortear(rng = Math.random, opcoes = {}) {
    for (let tentativa = 0; tentativa < 300; tentativa++) {
      const modo = opcoes.tom ? MODOS.find((m) => m.tom === opcoes.tom) || { tom: opcoes.tom, nome: opcoes.tom } : escolher(rng, MODOS);
      const t = tonicaDoModo(modo.tom);
      const escala = ESCALAS[t.modo];
      const n = opcoes.tamanho || 8 + Math.floor(rng() * 5); // 8 a 12 notas
      const g = graus(rng, n);
      if (!g) continue;
      const alturas = g.map((x) => grauParaAltura(t.tonica, escala, x));
      if (!melodiaAceita(alturas)) continue;
      if (!contraponto(alturas, t, "acima", rng) || !contraponto(alturas, t, "abaixo", rng)) continue;
      return {
        tom: modo.tom, nome: modo.nome, alturas,
        notas: alturas.map((a) => a.nomeOitava.replace(/-/g, "b")).join(" "),
      };
    }
    return null;
  }

  return { sortear, contraponto, rngDe, MODOS, ESCALAS };
});
