// Valida o conteúdo do ateliê (web/temas.js e web/livro/*.js). Imprime JSON com a lista de problemas.
const M = require("../web/motor.js");
require("../web/regras2.js");
const R3 = require("../web/regras3.js");
const G = require("../web/geradores.js");
const Ed = require("../web/editor.js");
const Bu = require("../web/buscador.js");
const Tr = require("../web/transpor.js");
const { niveis } = require("../web/temas.js").TEMAS;
const problemasModulos = [];
for (const nome of require("../web/livro/indice.js")) {
  try { require(`../web/livro/${nome}.js`); } catch (e) { problemasModulos.push(`módulo ${nome}: ${e.message}`); }
}

const problemas = [];
const erro = (onde, msg) => problemas.push(`${onde}: ${msg}`);
const ids = new Set();
const T = M.T;

// regras que são restrições de um exercício, não do estilo: não valem para os exemplos da aula
const SO_DO_EXERCICIO = ["climax_no_lugar", "perfeitas_no_meio", "esqueleto_preservado", "figuras_obrigatorias", "dissonancias_minimas",
  "sequencia_do_motivo", "esquema", "ideia_repetida", "baixo_por_grau", "ritmo_harmonico", "semicadencia", "cadencia_final",
  "modulacao", "retardos_minimos", "sec_acordes_pedidos", "cad_pedidas", "cad_acordes_pedidos", "cad_progressao",
  "set_sequencia", "set_setima_no_soprano", "set_cifras_pedidas", "set_setima_preparada", "mod_plano_de_tons", "mod_nota_comum", "frm_cadencias", "frm_variacao", "frm_transformacao"];
const CTX_DO_EXERCICIO = ["esqueleto", "climax", "maxPerfeitas", "figuras", "minDissonancias", "motivo", "esquemas", "repete", "maxSaltosBaixo",
  "pedidos", "cadencias", "acordesPedidos", "movimentos", "modulacao", "minRetardos", "sequencia", "minSetimasSoprano", "cifrasPedidas", "planoTons", "notaComum"];

function lerOk(onde, texto) {
  try { return M.lerTexto(texto); } catch (e) { erro(onde, "partitura inválida: " + e.message); return null; }
}

function contextoBase(p, modelo) {
  const ctx = { ...G.contextoDaPratica(p) };
  const cf = modelo.cab.cf ? modelo.vozes.findIndex((v) => v.nome === modelo.cab.cf) : -1;
  if (ctx.alvo === undefined) ctx.alvo = modelo.vozes.findIndex((_, i) => i !== cf);
  if (cf >= 0) ctx.cf = cf;
  return ctx;
}

function comCifras(ctx, ex, cifras) {
  if (!cifras) return ctx;
  const c = { ...ctx, cifras };
  if (ex.tonalidade) c.harmonia = R3.harmoniaDasCifras(ex, c);
  return c;
}

const resumo = (r) => r.achados.filter((a) => a.severidade === "erro").map((a) => `${a.regra} c.${a.compasso} ${a.mensagem}`).join(" | ");

// cifras de um exemplo ([[tempo em semínimas, símbolo]]) → uma por nota do baixo
function cifrasPorNota(onde, ex, pares) {
  const baixo = ex.vozes[ex.vozes.length - 1];
  const mapa = new Map(pares.map(([t, s]) => [Math.round(t * T), s]));
  for (const t of mapa.keys()) if (!baixo.notas.some((n) => n.inicio === t)) erro(onde, `cifra no tempo ${t / T} sem nota do baixo`);
  return baixo.notas.map((n) => mapa.get(n.inicio) || "");
}

function validarPartitura(onde, obj, perfilEx, ctxEx) {
  const ex = lerOk(onde, obj.partitura);
  if (!ex) return;
  for (const [v, i] of obj.anotacoes || []) if (!ex.vozes[v] || !ex.vozes[v].notas[i]) erro(onde, `anotação fora do lugar [${v},${i}]`);
  if (obj.rotulos && obj.rotulos.length !== ex.vozes.length) erro(onde, "rótulos não batem com as vozes");
  // camadas parciais (com pausas ou uma voz só sem cifras) não são verificadas
  // camadas parciais (pausa depois de uma nota = trecho ainda não escrito; vozes de tamanhos diferentes; uma voz sem cifras) não são verificadas
  const fins = ex.vozes.map((v) => (v.notas.length ? v.notas[v.notas.length - 1].fim : 0));
  const pausaNoMeio = obj.partitura.split("\n").some((l) => /:\s*\S/.test(l) && /\S\s+P\//.test(l.replace(/^[^:]*:\s*(P\/\S+\s+)*/, "")));
  const parcial = obj.parcial || pausaNoMeio || ex.vozes.length < 2 || new Set(fins).size > 1;
  if (parcial || obj.semVerificar) return;
  const modelo = Ed.ler(obj.partitura);
  // exemplos de "como quebrar" (e outros) podem trazer o próprio perfil e contexto
  if (obj.perfil) perfilEx = { ...obj.perfil };
  if (obj.contexto) ctxEx = { ...ctxEx, ...obj.contexto };
  // camada de esqueleto: vale o perfil da espécie indicada
  if (obj.especie) { perfilEx = { ...M.perfilDoNivel(obj.especie), climax_coincidente: "aviso" }; ctxEx = { ...ctxEx, nivel: obj.especie }; }
  let ctx = contextoBase({ nivel: ctxEx.nivel, contexto: ctxEx }, modelo);
  if (obj.cifras) ctx = comCifras(ctx, ex, cifrasPorNota(onde, ex, obj.cifras));
  else if (!modelo.cab.cf) return;  // sem cantus firmus nem cifras, não há o que verificar
  const perfil = { ...perfilEx };
  if (!obj.cifras) for (const k of ["cifras_coerentes", "retrogressao_cifrada", "seis_quatro", "notas_do_acorde"]) delete perfil[k];
  const r = M.verificarPerfil(ex, perfil, ctx);
  const e = resumo(r);
  if (e) erro(onde, "erros: " + e);
}

/* Pergunta de antes: { p, partitura?, cifras?, o: [texto | { texto?, partitura?, cifras?, por? }], c?, e, verificar?: { perfil, contexto } }
 * Com "verificar", a alternativa certa precisa passar no perfil e cada alternativa errada com partitura precisa falhar. */
function validarPergunta(onde, q, perfilEx, ctxEx) {
  const ops = (q.o || []).map((x) => (typeof x === "string" ? { texto: x } : x));
  const c = q.c !== undefined ? q.c : 0;
  if (!q.p || !q.e || ops.length < 3) { erro(onde, "pergunta malformada (p, e e pelo menos 3 alternativas)"); return; }
  if (c < 0 || c >= ops.length) erro(onde, "alternativa certa fora do lugar");
  const chaves = ops.map((o) => (o.texto || "") + "|" + (o.partitura || ""));
  if (new Set(chaves).size !== chaves.length) erro(onde, "alternativas repetidas");
  if (q.partitura) lerOk(onde + " (enunciado)", q.partitura);
  for (const o of ops) if (o.partitura) lerOk(onde + " (alternativa)", o.partitura);
  if (!q.verificar) return;
  const perfil = q.verificar.perfil || perfilEx;
  const passa = (o) => {
    const ex = lerOk(onde, o.partitura);
    if (!ex) return null;
    const modelo = Ed.ler(o.partitura);
    let ctx = contextoBase({ nivel: (q.verificar.contexto || ctxEx).nivel, contexto: { ...ctxEx, ...(q.verificar.contexto || {}) } }, modelo);
    if (o.cifras) ctx = comCifras(ctx, ex, cifrasPorNota(onde, ex, o.cifras));
    const r = M.verificarPerfil(ex, perfil, ctx);
    return r.achados.filter((a) => a.severidade === "erro");
  };
  ops.forEach((o, i) => {
    if (!o.partitura) return;
    const errs = passa(o);
    if (!errs) return;
    if (i === c && errs.length) erro(onde, `a alternativa certa não passa: ${errs.map((a) => a.regra + " " + a.mensagem).join(" | ")}`);
    if (i !== c && !errs.length) erro(onde, `a alternativa ${i + 1} (errada) passa no verificador`);
  });
}

function validarExercicio(onde, p, transposto = false) {
  if (!transposto) {
    if (ids.has(p.id)) erro(onde, "id repetido");
    ids.add(p.id);
    // treino "no tom do dia": a solução transposta tem de passar em todos os tons da lista
    for (const tom of p.tomDoDia || []) validarExercicio(`${onde} [${tom}]`, { ...p, tomDoDia: null, texto: Tr.texto(p.texto, tom), solucao: Tr.texto(p.solucao, tom) }, true);
  }
  const perfil = G.perfilDaPratica(p);
  for (const id of Object.keys(perfil)) if (!M.REGRAS[id]) erro(onde, "regra desconhecida no perfil " + id);
  if (!p.perfilVariante && !Object.keys(perfil).length) erro(onde, "perfil vazio");
  const ini = lerOk(onde + " (início)", p.texto);
  try { Ed.ler(p.texto); } catch (e) { erro(onde, "editor não lê o início: " + e.message); }
  if (!p.instrucoes) erro(onde, "sem instruções");
  if (p.cifrasIniciais && !p.cifrasAluno) erro(onde, "cifrasIniciais sem cifrasAluno");
  if (p.cifrasAluno && !p.solucaoCifras && p.solucao) erro(onde, "solução sem cifras");
  // cantus sorteado: a versão do professor é procurada na hora; tem de existir para o cantus inicial
  if (p.sortear) {
    const sol = Bu.solucao({ texto: p.texto, especie: p.perfilNivel === 4 ? 4 : p.duracao >= 4 ? 1 : p.duracao >= 2 ? 2 : 3, perfil, ctx: G.contextoDaPratica(p) });
    if (!sol) erro(onde, "o buscador não acha solução para o cantus inicial");
    else if (!p.solucao) p = { ...p, solucao: sol };
  }
  if (!p.solucao) return;
  const ex = lerOk(onde + " (solução)", p.solucao);
  if (!ex) return;
  const modelo = Ed.ler(p.solucao);
  const ctx = comCifras(contextoBase(p, modelo), ex, p.solucaoCifras ? p.solucaoCifras.split(/\s+/) : p.cifras);
  const r = M.verificarPerfil(ex, perfil, ctx);
  const fins = modelo.vozes.map((v) => Ed.inicios(v).fim);
  const alvo = p.alvoCompassos ? p.alvoCompassos * ex.duracaoCompasso : undefined;
  const vis = M.concluidos(ex, r, fins, { alvo, terminado: !!p.fimLivre });
  if (!vis.completo) erro(onde, "a solução não fica completa");
  const e = resumo(r);
  if (e) erro(onde, "a solução tem erros: " + e);
  // o início não pode estar aprovado antes do aluno escrever
  if (ini && !p.fimLivre && ini.vozes.every((v) => v.notas.length)) {
    const mi = Ed.ler(p.texto);
    const fi = mi.vozes.map((v) => Ed.inicios(v).fim);
    const ci = comCifras(contextoBase(p, mi), ini, p.cifrasIniciais ? p.cifrasIniciais.split(/\s+/) : p.cifras);
    if (M.concluidos(ini, M.verificarPerfil(ini, perfil, ci), fi, { alvo }).completo) erro(onde, "o exercício já começa completo");
  }
}

for (const n of niveis) {
  for (const t of n.temas) {
    const onde = `${n.numero}/${t.id}`;
    for (const campo of ["titulo", "objetivo"]) if (!t[campo]) erro(onde, "sem " + campo);
    if (!t.exercicios || t.exercicios.length < 2) erro(onde, "poucos exercícios");
    if (!t.antes || t.antes.length < 2) erro(onde, "sem perguntas de antes");
    const ref = t.exercicios.find((p) => p.solucao) || t.exercicios[0];
    const perfilEx = { ...G.perfilDaPratica(ref) };
    for (const k of SO_DO_EXERCICIO) delete perfilEx[k];
    const ctxEx = { ...G.contextoDaPratica(ref) };
    for (const k of CTX_DO_EXERCICIO) delete ctxEx[k];
    (t.antes || []).forEach((q, k) => validarPergunta(`${onde}?${k + 1}`, q, perfilEx, ctxEx));
    // perguntas de julgamento: 3 por capítulo, pelo menos 2 com partitura (no enunciado ou nas alternativas)
    const comPartitura = (t.antes || []).filter((q) => q.partitura || (q.o || []).some((o) => o && o.partitura)).length;
    if ((t.antes || []).length < 3 || comPartitura < 2) erro(onde, `perguntas de antes: ${(t.antes || []).length}, com partitura: ${comPartitura} (pede 3, pelo menos 2 com partitura)`);
    (t.secoes || []).forEach((s, k) => {
      const os = `${onde}#${k + 1}`;
      if (s.tipo === "exemplo") s.camadas.forEach((c, j) => { if (c.partitura) validarPartitura(`${os}.${j + 1}`, c, perfilEx, ctxEx); });
      if (s.tipo === "quebra") (s.exemplos || []).forEach((x, j) => validarPartitura(`${os}q${j + 1}`, x, perfilEx, ctxEx));
      if (!["texto", "exemplo", "contraste", "quebra"].includes(s.tipo)) erro(os, "tipo de seção desconhecido: " + s.tipo);
      if (s.tipo === "contraste") {
        validarPartitura(os + "a", s.a, perfilEx, ctxEx);
        validarPartitura(os + "b", s.b, perfilEx, ctxEx);
        if (!s.pergunta || !s.comentario) erro(os, "contraste sem pergunta ou comentário");
      }
    });
    t.exercicios.forEach((p) => validarExercicio(`${onde}/${p.id}`, p));
  }
}

console.log(JSON.stringify([...problemasModulos, ...problemas], null, 1));
