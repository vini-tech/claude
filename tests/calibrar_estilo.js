// Calibra as referências do relatório de estilo nas soluções do próprio livro: para cada nível, a faixa
// (percentis 10 a 90) de cada número de Estilo.numeros. O relatório compara o aluno com essas faixas, não
// com números absolutos (pesquisa: "medir em relação às soluções do próprio livro").
//
//   node tests/calibrar_estilo.js            imprime as faixas
//   node tests/calibrar_estilo.js --gravar   grava web/referencias-estilo.js
//
// tests/test_estilo.py confere que o arquivo gravado está em dia com o livro.
const fs = require("fs");
const path = require("path");
const M = require("../web/motor.js");
const Est = require("../web/estilo.js");
const G = require("../web/geradores.js");
const { niveis } = require("../web/temas.js").TEMAS;
for (const nome of require("../web/livro/indice.js")) require(`../web/livro/${nome}.js`);

const percentil = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  const i = (s.length - 1) * p, a = Math.floor(i), b = Math.ceil(i);
  return s[a] + (s[b] - s[a]) * (i - a);
};
const arred = (x) => Math.round(x * 100) / 100;

function faixas() {
  const saida = {};
  for (const nv of niveis) {
    const valores = {};
    for (const t of nv.temas) {
      for (const e of t.exercicios) {
        if (!e.solucao) continue;
        const ex = M.lerTexto(e.solucao);
        const nomeCf = (e.solucao.match(/^cf:\s*(\S+)/m) || [])[1];
        const cf = nomeCf ? ex.vozes.findIndex((v) => v.nome === nomeCf) : -1;
        const cifras = e.solucaoCifras ? e.solucaoCifras.split(/\s+/) : e.cifras;
        const n = Est.numeros(ex, { cf, cifras, plano: (G.contextoDaPratica(e) || {}).plano });
        for (const [k, xs] of Object.entries(n)) for (const x of xs) if (Number.isFinite(x)) (valores[k] = valores[k] || []).push(x);
      }
    }
    const f = {};
    // com poucas soluções a faixa não diz nada: só a partir de 8
    for (const [k, xs] of Object.entries(valores)) if (xs.length >= 8) f[k] = [arred(percentil(xs, 0.1)), arred(percentil(xs, 0.9)), xs.length];
    saida[nv.numero] = f;
  }
  return saida;
}

function arquivo(f) {
  const corpo = Object.entries(f).map(([n, ms]) => `    ${n}: {\n${Object.entries(ms).map(([k, v]) => `      ${k}: [${v.join(", ")}],`).join("\n")}\n    },`).join("\n");
  return `/* Gerado por tests/calibrar_estilo.js a partir das soluções do livro: não edite à mão.
 * Para cada nível, a faixa de cada número do relatório de estilo: [percentil 10, percentil 90, nº de soluções]. */
(function (raiz) {
  const REFERENCIAS = {
${corpo}
  };
  if (typeof module === "object" && module.exports) module.exports = REFERENCIAS;
  else raiz.ReferenciasEstilo = REFERENCIAS;
})(this);
`;
}

if (require.main === module) {
  const f = faixas();
  if (process.argv.includes("--gravar")) fs.writeFileSync(path.join(__dirname, "..", "web", "referencias-estilo.js"), arquivo(f));
  else process.stdout.write(arquivo(f));
}

module.exports = { faixas, arquivo };
