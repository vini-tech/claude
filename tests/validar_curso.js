// Valida o conteúdo do curso (web/licoes.js). Imprime JSON com a lista de problemas.
const M = require("../web/motor.js");
const Cn = require("../web/cantus.js");
const R2 = require("../web/regras2.js");
const G = require("../web/geradores.js");
const Ed = require("../web/editor.js");
const { niveis, regraParaLicao, conceitos } = require("../web/licoes.js").CURSO;

const problemas = [];
const erro = (onde, msg) => problemas.push(`${onde}: ${msg}`);
const idsLicoes = new Set();

function lerOk(onde, texto) {
  try { return M.lerTexto(texto); } catch (e) { erro(onde, "partitura inválida: " + e.message); return null; }
}

function validarCartao(onde, c, nivel) {
  if (c.tipo === "gerado") { if (!G.nomes.includes(c.gerador)) erro(onde, "gerador desconhecido " + c.gerador); return; }
  const ex = c.partitura ? lerOk(onde, c.partitura) : null;
  for (const [v, i] of c.anotacoes || []) if (!ex || !ex.vozes[v] || !ex.vozes[v].notas[i]) erro(onde, `anotação fora do lugar [${v},${i}]`);
  if (c.tipo === "escolha" || c.tipo === "ouvir") {
    const certas = [].concat(c.certa);
    if (!c.opcoes || certas.some((k) => k < 0 || k >= c.opcoes.length)) erro(onde, "resposta certa fora das opções");
    if (!c.explica) erro(onde, "sem explicação");
  }
  if (c.tipo === "vf" && typeof c.certa !== "boolean") erro(onde, "vf sem resposta booleana");
  if (c.tipo === "tocar") for (const a of c.aceita || []) { try { M.lerAltura(a); } catch (e) { erro(onde, "nota aceita inválida " + a); } }
  if (c.tipo === "erro" && ex) {
    const ctx = { nivel };
    if (c.acordes && ex.tonalidade) ctx.harmonia = R2.harmoniaDe(c.acordes, ex.tonalidade, ex.duracaoCompasso);
    if (!M.REGRAS[c.regra]) { erro(onde, "regra desconhecida " + c.regra); return; }
    const r = M.verificarPerfil(ex, { [c.regra]: "erro" }, ctx);
    const alvos = c.alvo.map(([v, i]) => ex.vozes[v] && ex.vozes[v].notas[i]);
    if (alvos.some((a) => !a)) { erro(onde, "alvo fora do lugar"); return; }
    if (!r.achados.some((a) => a.notas.some((n) => alvos.includes(n)))) erro(onde, `a regra ${c.regra} não marca o alvo (achados: ${r.achados.map((a) => a.mensagem).join(" | ") || "nenhum"})`);
  }
}

function validarPratica(onde, p) {
  const perfil = G.perfilDaPratica(p);
  for (const id of Object.keys(perfil)) if (!M.REGRAS[id]) erro(onde, "regra desconhecida no perfil " + id);
  const ini = lerOk(onde + " (início)", p.texto);
  try { Ed.ler(p.texto); } catch (e) { erro(onde, "editor não lê o início: " + e.message); }
  if (!p.solucao) return;
  const ex = lerOk(onde + " (solução)", p.solucao);
  if (!ex) return;
  const modelo = Ed.ler(p.solucao);
  const cf = modelo.cab.cf ? modelo.vozes.findIndex((v) => v.nome === modelo.cab.cf) : -1;
  const ctx = { ...G.contextoDaPratica(p) };
  ctx.alvo = modelo.vozes.findIndex((_, i) => i !== cf);
  if (cf >= 0) ctx.cf = cf;
  if (p.acordes) ctx.harmonia = R2.harmoniaDe(p.acordes, ex.tonalidade, ex.duracaoCompasso);
  const r = M.verificarPerfil(ex, perfil, ctx);
  const fins = modelo.vozes.map((v) => Ed.inicios(v).fim);
  const alvo = p.alvoCompassos ? p.alvoCompassos * ex.duracaoCompasso : undefined;
  const vis = M.concluidos(ex, r, fins, { alvo, terminado: !!p.fimLivre });
  if (!vis.completo) erro(onde, "a solução não fica completa");
  const erros = r.achados.filter((a) => a.severidade === "erro");
  if (erros.length) erro(onde, "a solução tem erros: " + erros.map((a) => `${a.regra} c.${a.compasso} ${a.mensagem}`).join(" | "));
  // o início não pode estar "aprovado" antes do aluno escrever
  if (ini && !p.fimLivre) {
    const mi = Ed.ler(p.texto);
    const fi = mi.vozes.map((v) => Ed.inicios(v).fim);
    const ri = M.verificarPerfil(ini, perfil, ctx);
    if (M.concluidos(ini, ri, fi, { alvo }).completo) erro(onde, "o exercício já começa completo");
  }
}

for (const n of niveis) {
  const nivel = +n.id.slice(1);
  for (const u of n.unidades) {
    for (const l of u.licoes) {
      if (idsLicoes.has(l.id)) erro(l.id, "id repetido");
      idsLicoes.add(l.id);
      l.cartoes.forEach((c, k) => validarCartao(`${l.id}#${k + 1}`, c, nivel));
      if (!l.cartoes.some((c) => c.tipo !== "conceito")) erro(l.id, "lição sem perguntas");
    }
    for (const p of u.praticas || []) validarPratica(p.id, p);
  }
}
for (const [regra, lic] of Object.entries(regraParaLicao)) {
  if (!idsLicoes.has(lic)) erro("regraParaLicao", `${regra} aponta para lição inexistente ${lic}`);
  if (!M.REGRAS[regra]) erro("regraParaLicao", `regra inexistente ${regra}`);
}
for (const [id, c] of Object.entries(conceitos)) if (!G.nomes.includes(c.gerador)) erro("conceitos", `${id}: gerador ${c.gerador}`);

// geradores: 300 perguntas de cada, todas coerentes
const rng = Cn.rngDe(42);
for (const g of G.nomes) {
  for (let i = 0; i < 300; i++) {
    let c;
    try { c = G.gerar(g, rng); } catch (e) { erro("gerador " + g, e.message); break; }
    const certas = [].concat(c.certa);
    if (!c.opcoes || certas.some((k) => k < 0 || k >= c.opcoes.length) || new Set(c.opcoes).size !== c.opcoes.length) { erro("gerador " + g, "opções inválidas " + JSON.stringify(c)); break; }
    if (c.partitura) { try { M.lerTexto(c.partitura); } catch (e) { erro("gerador " + g, "partitura " + c.partitura); break; } }
  }
}
// geradores de intervalo: a resposta confere com o motor
const nomesMotor = { "2ª menor": "m2", "2ª maior": "M2", "3ª menor": "m3", "3ª maior": "M3", "4ª justa": "P4", "4ª aumentada (trítono)": "A4", "5ª justa": "P5", "6ª menor": "m6", "6ª maior": "M6", "7ª menor": "m7", "7ª maior": "M7", "8ª justa": "P8" };
for (let i = 0; i < 300; i++) {
  const c = G.gerar("intervalo_escrito", rng);
  const [a, b] = M.lerTexto(c.partitura).vozes[0].notas;
  const iv = M.intervaloAlturas(a.altura, b.altura);
  if (nomesMotor[c.opcoes[c.certa]] !== iv.nome) { erro("intervalo_escrito", `${c.partitura} → ${c.opcoes[c.certa]} mas o motor diz ${iv.nome}`); break; }
}
for (let i = 0; i < 300; i++) {
  const c = G.gerar("consonancia", rng);
  const ex = M.lerTexto(c.partitura);
  const iv = M.ferramentas.harmonico(ex.vozes[0].notas[0], ex.vozes[1].notas[0]);
  const esperado = M.ehConsonante(iv, true) ? (M.classePerfeita(iv) ? 0 : 1) : 2;
  if (esperado !== c.certa) { erro("consonancia", `${c.partitura}: resposta ${c.certa}, motor ${esperado}`); break; }
}
for (let i = 0; i < 300; i++) {
  const c = G.gerar("paralelas", rng);
  const ex = M.lerTexto(c.partitura);
  const r = M.verificarPerfil(ex, { quintas_paralelas: "erro", oitavas_paralelas: "erro" });
  if ((r.achados.length > 0) !== (c.certa === 0)) { erro("paralelas", `${c.partitura}: resposta ${c.opcoes[c.certa]}, motor ${r.achados.length}`); break; }
}

console.log(JSON.stringify(problemas, null, 1));
