// Mede o texto (sem HTML) de cada capítulo e aponta campos acima do limite do guia de enxugamento.
//   node tests/medir_texto.js [id …]
const T = require("../web/temas.js").TEMAS;
for (const n of require("../web/livro/indice.js")) require(`../web/livro/${n}.js`);
const LIM = { objetivo: 140, ouvir: 80, texto: 700, nota: 160, pausaP: 130, pausaC: 280, contrasteP: 120, contrasteC: 320,
  quebra: 600, quebraEx: 180, instrucoes: 230, comentarioSolucao: 170, p: 150, e: 220, por: 160, opcao: 110 };
const so = process.argv.slice(2);
const tira = (s) => String(s || "").replace(/<table[\s\S]*?<\/table>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
let total = 0;
for (const nv of T.niveis) for (const t of nv.temas) {
  if (so.length && !so.includes(t.id)) continue;
  let c = 0; const longos = [];
  const med = (campo, s, onde) => { const l = tira(s).length; c += l; if (l > LIM[campo]) longos.push(`${onde || campo} ${l}/${LIM[campo]}`); };
  med("objetivo", t.objetivo); (t.ouvir || []).forEach((o, i) => med("ouvir", o, "ouvir" + (i + 1)));
  if ((t.ouvir || []).length > 3) longos.push(`ouvir: ${t.ouvir.length} itens (máx. 3)`);
  t.secoes.forEach((s, k) => {
    if (s.tipo === "texto") med("texto", s.html, `secao${k + 1}`);
    if (s.tipo === "quebra") { med("quebra", s.html, `quebra${k + 1}`); (s.exemplos || []).forEach((x, j) => med("quebraEx", x.comentario, `quebra${k + 1}.ex${j + 1}`)); }
    if (s.tipo === "exemplo") { med("texto", s.intro, `exemplo${k + 1}.intro`); s.camadas.forEach((cm, j) => {
      med("texto", cm.texto, `camada${j + 1}`);
      if ((cm.notas || []).length > 3) longos.push(`exemplo${k + 1}.camada${j + 1}: ${cm.notas.length} notas (máx. 3)`);
      (cm.notas || []).forEach((x, i) => med("nota", x[1], `exemplo${k + 1}.camada${j + 1}.nota${i + 1}`));
      if (cm.pausa) { med("pausaP", cm.pausa[0], "pausa"); med("pausaC", cm.pausa[1], "pausa.comentario"); } }); }
    if (s.tipo === "contraste") { med("contrasteP", s.pergunta, "contraste.pergunta"); med("contrasteC", s.comentario, "contraste.comentario"); }
  });
  t.exercicios.forEach((e) => { med("instrucoes", e.instrucoes, `${e.id}.instrucoes`); med("comentarioSolucao", e.comentarioSolucao, `${e.id}.comentario`); });
  (t.antes || []).forEach((q, k) => { med("p", q.p, `q${k + 1}.p`); med("e", q.e, `q${k + 1}.e`);
    (q.o || []).forEach((o, i) => { if (typeof o === "string") med("opcao", o, `q${k + 1}.o${i + 1}`); else { med("opcao", o.texto, `q${k + 1}.o${i + 1}`); med("por", o.por, `q${k + 1}.o${i + 1}.por`); } }); });
  total += c;
  console.log(`${t.id}: ${c} caracteres${longos.length ? " · acima do limite: " + longos.join(", ") : ""}`);
}
console.log("TOTAL", total);
