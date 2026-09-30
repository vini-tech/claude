/* Perguntas criadas na hora (para as lições e para a revisão espaçada) e montagem das práticas.
 * Cada gerador devolve um cartão no mesmo formato de licoes.js. */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica(require("./motor.js"));
  else raiz.Geradores = fabrica(raiz.Motor);
})(this, function (M) {
  "use strict";

  const LETRAS = "CDEFGAB";
  const PT = { C: "dó", D: "ré", E: "mi", F: "fá", G: "sol", A: "lá", B: "si" };
  const escolher = (rng, l) => l[Math.floor(rng() * l.length)];
  const embaralhar = (rng, l) => { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nat = (letra, oit) => M.altura(LETRAS.indexOf(letra), 0, oit);
  const txt = (a) => a.nome.replace(/-/g, "b") + a.oitava;
  const acima = (a, passos, semitons) => M.transpor(a, passos, semitons);

  // opções: a certa + distratores únicos, embaralhadas; devolve { opcoes, certa }
  function comDistratores(rng, certa, candidatos, n = 4) {
    const outros = embaralhar(rng, candidatos.filter((c) => c !== certa)).slice(0, n - 1);
    const opcoes = embaralhar(rng, [certa, ...outros]);
    return { opcoes, certa: opcoes.indexOf(certa) };
  }

  const nomeNota = (l) => `${l} (${PT[l]})`;

  function notaNaPauta(rng, faixa, conceito) {
    const [letra, oit] = escolher(rng, faixa);
    const { opcoes, certa } = comDistratores(rng, nomeNota(letra), LETRAS.split("").map(nomeNota));
    return { tipo: "escolha", conceito, pergunta: "Que nota é esta?", partitura: `v: ${letra}${oit}/4`, opcoes, certa,
      explica: `É ${letra}${oit} (${PT[letra]}).` };
  }

  const INTERVALOS = [
    // [passos, semitons, nome, classe]
    [1, 1, "2ª menor", "diss"], [1, 2, "2ª maior", "diss"], [2, 3, "3ª menor", "imp"], [2, 4, "3ª maior", "imp"],
    [3, 5, "4ª justa", "diss4"], [3, 6, "4ª aumentada (trítono)", "diss"], [4, 7, "5ª justa", "perf"], [5, 8, "6ª menor", "imp"],
    [5, 9, "6ª maior", "imp"], [6, 10, "7ª menor", "diss"], [6, 11, "7ª maior", "diss"], [7, 12, "8ª justa", "perf"],
  ];

  const G = {
    nota_sol: (rng) => notaNaPauta(rng, [["C", 4], ["D", 4], ["E", 4], ["F", 4], ["G", 4], ["A", 4], ["B", 4], ["C", 5], ["D", 5], ["E", 5], ["F", 5], ["G", 5]], "leitura"),
    nota_fa: (rng) => notaNaPauta(rng, [["G", 2], ["A", 2], ["B", 2], ["C", 3], ["D", 3], ["E", 3], ["F", 3], ["G", 3], ["A", 3]], "leitura"),

    grau(rng) {
      const g = Math.floor(rng() * 7);
      const letra = LETRAS[g];
      const nomes = ["1º (tônica)", "2º", "3º", "4º", "5º (dominante)", "6º", "7º (sensível)"];
      const { opcoes, certa } = comDistratores(rng, nomes[g], nomes);
      return { tipo: "escolha", conceito: "graus", pergunta: "Em dó maior, que grau é esta nota?", partitura: `tom: C maior\nv: ${letra}4/4`,
        opcoes, certa, explica: `${letra} (${PT[letra]}) é o ${nomes[g]} grau de dó maior.` };
    },

    intervalo_numero(rng) {
      const base = nat(escolher(rng, "CDEFG".split("")), 4);
      const passos = 1 + Math.floor(rng() * 7);
      const letra = LETRAS[(base.letra + passos) % 7], oit = base.oitava + Math.floor((base.letra + passos) / 7);
      const n = `${passos + 1}ª`;
      const { opcoes, certa } = comDistratores(rng, n, ["2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª"]);
      return { tipo: "escolha", conceito: "intervalos", pergunta: "Qual é o número deste intervalo?",
        partitura: `v: ${txt(base)}/2 ${letra}${oit}/2`, opcoes, certa,
        explica: `De ${txt(base)} até ${letra}${oit} são ${passos + 1} notas, contando as duas pontas.` };
    },

    intervalo_escrito(rng) {
      const base = nat(escolher(rng, "CDEFGA".split("")), 4);
      const [p, s, nome] = escolher(rng, INTERVALOS);
      const alto = acima(base, p, s);
      if (Math.abs(alto.alter) > 1) return G.intervalo_escrito(rng);
      const mesmos = INTERVALOS.filter((i) => i[0] === p).map((i) => i[2]);
      const vizinhos = INTERVALOS.filter((i) => Math.abs(i[0] - p) === 1).map((i) => i[2]);
      const { opcoes, certa } = comDistratores(rng, nome, [...new Set([...mesmos, ...vizinhos])]);
      return { tipo: "escolha", conceito: "intervalos", pergunta: "Qual é este intervalo?", partitura: `v: ${txt(base)}/2 ${txt(alto)}/2`,
        opcoes, certa, explica: `${txt(base)}–${txt(alto)}: ${p + 1} notas e ${s} semitons, ${nome}.` };
    },

    intervalo_ouvido(rng) {
      const base = nat(escolher(rng, "CDFG".split("")), 4);
      const lista = INTERVALOS.filter((i) => ["2ª maior", "3ª maior", "4ª justa", "5ª justa", "6ª maior", "8ª justa"].includes(i[2]));
      const [p, s, nome] = escolher(rng, lista);
      const alto = acima(base, p, s);
      const { opcoes, certa } = comDistratores(rng, nome, lista.map((i) => i[2]));
      return { tipo: "ouvir", conceito: "intervalos", pergunta: "Ouça e escolha o intervalo.",
        partitura: `v: ${txt(base)}/2 ${txt(alto)}/2`, opcoes, certa,
        explica: `Era ${nome} (${txt(base)} → ${txt(alto)}). Toque ▶ de novo para comparar.` };
    },

    consonancia(rng) {
      const base = nat(escolher(rng, "CDEFG".split("")), 4);
      const [p, s, nome, classe] = escolher(rng, INTERVALOS.filter((i) => i[2] !== "4ª aumentada (trítono)" || rng() < 0.5));
      const alto = acima(base, p, s);
      if (Math.abs(alto.alter) > 1) return G.consonancia(rng);
      const opcoes = ["Consonância perfeita", "Consonância imperfeita", "Dissonância"];
      const certa = classe === "perf" ? 0 : classe === "imp" ? 1 : 2;
      const extra = classe === "diss4" ? " A 4ª justa contra o baixo conta como dissonância." : "";
      return { tipo: "escolha", conceito: "consonancia", pergunta: "Como este intervalo soa a duas vozes?",
        partitura: `sup: ${txt(alto)}/4\ninf: ${txt(base)}/4`, opcoes, certa, explica: `${nome}: ${opcoes[certa].toLowerCase()}.${extra}` };
    },

    movimento(rng) {
      const tipo = escolher(rng, ["contrário", "oblíquo", "direto", "paralelo"]);
      const inf1 = nat(escolher(rng, "CDEF".split("")), 4);
      const sup1 = acima(inf1, 2, [3, 4][Math.floor(rng() * 2)]);
      const sup1n = nat(LETRAS[sup1.letra], sup1.oitava);
      let inf2, sup2;
      const passo = (a, d) => nat(LETRAS[((a.letra + d) % 7 + 7) % 7], a.oitava + Math.floor((a.letra + d) / 7));
      if (tipo === "contrário") { inf2 = passo(inf1, -1); sup2 = passo(sup1n, 1); }
      else if (tipo === "oblíquo") { inf2 = inf1; sup2 = passo(sup1n, 1); }
      else if (tipo === "paralelo") { inf2 = passo(inf1, 1); sup2 = passo(sup1n, 1); }
      else { inf2 = passo(inf1, 1); sup2 = passo(sup1n, 3); }
      const opcoes = ["Contrário", "Oblíquo", "Direto", "Paralelo"];
      const certa = opcoes.indexOf(tipo[0].toUpperCase() + tipo.slice(1));
      const def = { contrário: "uma voz sobe e a outra desce", oblíquo: "uma voz fica parada", direto: "as duas vão na mesma direção, com intervalos diferentes", paralelo: "as duas vão na mesma direção e mantêm o intervalo" };
      return { tipo: "escolha", conceito: "movimento", pergunta: "Que movimento as duas vozes fazem?",
        partitura: `sup: ${txt(sup1n)}/4 ${txt(sup2)}\ninf: ${txt(inf1)}/4 ${txt(inf2)}`, opcoes, certa, explica: `Movimento ${tipo}: ${def[tipo]}.` };
    },

    paralelas(rng) {
      const tem = rng() < 0.5;
      const inf1 = nat(escolher(rng, "CDEFG".split("")), 3);
      const passo = (a, d) => nat(LETRAS[((a.letra + d) % 7 + 7) % 7], a.oitava + Math.floor((a.letra + d) / 7));
      const classe = rng() < 0.5 ? 4 : 7; // 5ª ou 8ª (em graus)
      let sup1 = passo(inf1, classe), inf2, sup2;
      const d = rng() < 0.5 ? 1 : -1;
      if (tem) { inf2 = passo(inf1, d); sup2 = passo(sup1, d); }
      else { inf2 = passo(inf1, d); sup2 = passo(sup1, -d); }
      const ok = (a, b) => { const iv = M.intervaloAlturas(a, b); return iv.nomeSimples === "P5" || iv.nomeSimples === "P1"; };
      const reais = ok(inf1, sup1) && ok(inf2, sup2) && M.classePerfeita(M.intervaloAlturas(inf1, sup1)) === M.classePerfeita(M.intervaloAlturas(inf2, sup2));
      if (tem !== reais && tem) return G.paralelas(rng); // evita 5ª diminuta (si–fá) no meio
      const nome = classe === 4 ? "5ªs" : "8ªs";
      return { tipo: "escolha", conceito: "paralelas", pergunta: "Há 5ªs ou 8ªs paralelas aqui?",
        partitura: `sup: ${txt(sup1)}/4 ${txt(sup2)}\ninf: ${txt(inf1)}/4 ${txt(inf2)}`, opcoes: ["Sim", "Não"], certa: reais ? 0 : 1,
        explica: reais ? `Sim: duas ${nome} seguidas, com as vozes na mesma direção.` : "Não: as vozes andam em direções opostas ou o intervalo muda." };
    },

    acorde_da_nota(rng) {
      const ac = { I: ["C", "E", "G"], IV: ["F", "A", "C"], V: ["G", "B", "D"] };
      const rot = { I: "I (dó–mi–sol)", IV: "IV (fá–lá–dó)", V: "V (sol–si–ré)" };
      const letra = escolher(rng, "CDEFGAB".split(""));
      const opcoes = ["I", "IV", "V"].map((k) => rot[k]);
      const certa = ["I", "IV", "V"].map((k, i) => (ac[k].includes(letra) ? i : -1)).filter((i) => i >= 0);
      return { tipo: "escolha", conceito: "acordes", pergunta: `Em dó maior, qual acorde contém a nota ${letra} (${PT[letra]})?`, opcoes, certa,
        explica: `${letra} está em ${certa.map((i) => opcoes[i]).join(" e em ")}.` };
    },

    cadencia_ouvido(rng) {
      const autentica = rng() < 0.5;
      const sop = autentica ? "E5/4 F5 D5 C5" : "E5/4 F5 E5 D5";
      const alt = autentica ? "G4/4 A4 B4 G4" : "G4/4 A4 G4 B4";
      const bai = autentica ? "C3/4 F3 G3 C3" : "C3/4 F3 C3 G3";
      return { tipo: "ouvir", conceito: "cadencias", pergunta: "Ouça o final. Que cadência é?",
        partitura: `tom: C maior\ns: ${sop}\na: ${alt}\nb: ${bai}`,
        opcoes: ["Autêntica perfeita (termina no I)", "Semicadência (termina no V)"], certa: autentica ? 0 : 1,
        explica: autentica ? "V → I com dó na melodia: soa como ponto final." : "A frase para no V: soa como pergunta." };
    },
  };

  function gerar(nome, rng = Math.random) {
    const g = G[nome];
    if (!g) throw new Error(`gerador desconhecido: ${nome}`);
    return { ...g(rng), gerado: nome };
  }

  // perfil e contexto de uma prática
  function perfilDaPratica(p) {
    if (p.perfil) return p.perfil;
    return { ...M.perfilDoNivel(p.perfilNivel || 1), ...(p.extras || {}) };
  }
  const contextoDaPratica = (p) => ({ nivel: p.nivel || 1, ...(p.contexto || {}) });

  return { gerar, nomes: Object.keys(G), perfilDaPratica, contextoDaPratica };
});
