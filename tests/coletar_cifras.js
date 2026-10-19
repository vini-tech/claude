// Junta cada cifra do livro com o tom em que ela é lida, a leitura do motor JS (regras3.membros) e as
// notas da partitura no ataque do baixo. Imprime JSON para tests/test_cifras_music21.py, que confere
// tudo com o music21, sem passar pelo motor JS.
const M = require("../web/motor.js");
require("../web/regras2.js");
const R3 = require("../web/regras3.js");
const Tr = require("../web/transpor.js");
const G = require("../web/geradores.js");
const { niveis } = require("../web/temas.js").TEMAS;
for (const nome of require("../web/livro/indice.js")) require(`../web/livro/${nome}.js`);

const T = M.T;
const saida = [], erros = [];
const tomJSON = (t) => ({ tonica: t.tonica.nome, menor: t.modo === "minor" });

// melodiaConta: no perfil, cifras_coerentes é erro (capítulos de ornamentos e retardos a desligam: lá a
// melodia no ataque pode ser nota fora do acorde)
function coletar(onde, partitura, cifras, perfil) {
  let ex;
  try { ex = M.lerTexto(partitura); } catch (e) { erros.push(`${onde}: ${e.message}`); return; }
  if (!ex.tonalidade || ex.vozes.length < 1) return;
  const baixo = ex.vozes[ex.vozes.length - 1], mel = ex.vozes[0];
  for (const h of R3.harmoniasCifradas(ex, { cifras })) {
    if (!h.texto || !h.cifra) continue;
    // cada leitura (no pivô são duas: tom velho e tom novo) vira uma cifra a conferir
    const leituras = [];
    const partes = h.texto.split("=");
    if (h.pivo) leituras.push({ cifra: partes[0].replace(/^[A-Ga-g][#b]?:/, ""), tom: h.pivo.velho.tom, js: R3.membros(h.pivo.velho.cifra, h.pivo.velho.tom), mb: h.pivo.velho.cifra.membroBaixo });
    leituras.push({ cifra: partes[partes.length - 1].replace(/^[A-Ga-g][#b]?:/, ""), tom: h.tom, js: R3.membros(h.cifra, h.tom), mb: h.cifra.membroBaixo });
    const m = mel !== baixo ? mel.soandoEm(h.inicio) : null;
    saida.push({
      onde: `${onde} c.${ex.compassoDe(h.inicio)}`, texto: h.texto, pivo: !!h.pivo,
      leituras: leituras.map((l) => ({ cifra: l.cifra, tom: tomJSON(l.tom), js: l.js, jsBaixo: l.js[l.mb] })),
      baixo: h.baixo.altura.nome, melodia: m ? m.altura.nome : null, melodiaConta: (perfil || {}).cifras_coerentes === "erro",
    });
  }
}

// cifras de um exemplo ([[tempo em semínimas, símbolo]]) → uma por nota do baixo
function porNota(onde, partitura, pares) {
  let ex;
  try { ex = M.lerTexto(partitura); } catch (e) { erros.push(`${onde}: ${e.message}`); return null; }
  const mapa = new Map(pares.map(([t, s]) => [Math.round(t * T), s]));
  return ex.vozes[ex.vozes.length - 1].notas.map((n) => mapa.get(n.inicio) || "");
}

function exercicio(onde, p) {
  if (!p.solucao) return;
  const cifras = p.solucaoCifras ? p.solucaoCifras.split(/\s+/) : p.cifras;
  if (!cifras) return;
  const perfil = G.perfilDaPratica(p);
  coletar(onde, p.solucao, cifras, perfil);
  for (const tom of p.tomDoDia || []) coletar(`${onde} [${tom}]`, Tr.texto(p.solucao, tom), cifras, perfil);
}

// o mesmo perfil que tests/validar_temas.js usa: o do capítulo, ou o próprio do exemplo ou da pergunta.
// semVerificar fica de fora; camada parcial ou de esqueleto (especie) não confere a melodia, como lá
const comCifras = (onde, o, perfil) => {
  if (!o || !o.partitura || !o.cifras || o.semVerificar) return;
  const c = porNota(onde, o.partitura, o.cifras);
  if (c) coletar(onde, o.partitura, c, o.parcial || o.especie ? null : o.perfil || perfil);
};

for (const n of niveis) {
  for (const t of n.temas) {
    const onde = `${n.numero}/${t.id}`;
    const ref = t.exercicios.find((p) => p.solucao) || t.exercicios[0];
    const perfilEx = G.perfilDaPratica(ref);
    (t.antes || []).forEach((q, k) => {
      // como em validar_temas.js: o enunciado e as perguntas sem "verificar" não passam pelo perfil (a
      // melodia pode ter notas fora do acorde de propósito); o baixo continua conferido
      const pq = q.verificar ? q.verificar.perfil || perfilEx : null;
      comCifras(`${onde}?${k + 1}`, { ...q, perfil: null }, null);
      // só a alternativa certa: as erradas podem ter cifra errada de propósito
      (q.o || []).forEach((o, i) => { if (typeof o === "object" && i === (q.c || 0)) comCifras(`${onde}?${k + 1}.${i + 1}`, o, pq); });
    });
    (t.secoes || []).forEach((s, k) => {
      const os = `${onde}#${k + 1}`;
      if (s.tipo === "exemplo") s.camadas.forEach((c, j) => comCifras(`${os}.${j + 1}`, c, perfilEx));
      if (s.tipo === "quebra") (s.exemplos || []).forEach((x, j) => comCifras(`${os}q${j + 1}`, x, perfilEx));
      if (s.tipo === "contraste") { comCifras(os + "a", s.a, perfilEx); comCifras(os + "b", s.b, perfilEx); }
    });
    t.exercicios.forEach((p) => exercicio(`${onde}/${p.id}`, p));
  }
}

process.stdout.write(JSON.stringify({ registros: saida, erros }));
