/* Conteúdo do ateliê (versão 3): níveis, perfis e TEMAS.inserir. Os capítulos dos níveis 1–3 estão em
 * web/livro/nivel1.js, nivel2.js e nivel3.js; os demais em web/livro/*.js (ordem em web/livro/indice.js).
 * Origem: níveis 1–3 para quem já sabe teoria e quer aprender ofício.
 * Base: pesquisa/06 (como ensinar) e pesquisa/07 (conteúdo). Cada tema:
 *   objetivo, ouvir, esboco (antes da aula), secoes (texto | exemplo em camadas | contraste), exercicios
 * Exemplos e soluções estão no formato de texto do verificador e são conferidos por tests/validar_temas.js. */
(function (raiz) {
  "use strict";

  const FUX = "D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4";
  const CF1 = "C4/4 D4 F4 E4 G4 A4 F4 E4 D4 C4";
  const CF2 = "C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4";

  // perfis
  const N1 = { perfilNivel: 1, nivel: 1, extras: { climax_coincidente: "aviso", notas_do_modo: "erro" } };
  const N2 = { perfilNivel: 2, nivel: 2, extras: { climax_coincidente: "aviso", notas_do_modo: "erro" } };
  const N4 = { perfilNivel: 4, nivel: 4, extras: { climax_coincidente: "aviso", notas_do_modo: "erro" } };
  const N3 = { perfilNivel: 3, nivel: 3, extras: { climax_coincidente: "aviso", notas_do_modo: "erro", paralelas_entre_tempos: "erro" } };
  const TONAL = {
    quintas_paralelas: "erro", oitavas_paralelas: "erro", quintas_oitavas_ocultas: "erro", cruzamento_de_vozes: "erro",
    dissonancia_aproximacao: "aviso", dissonancia_resolucao: "erro", cifras_coerentes: "erro", retrogressao_cifrada: "erro",
    seis_quatro: "erro", cadencias_do_plano: "erro", salto_maior_que_oitava: "erro", intervalo_melodico_aumentado_diminuto: "erro",
    salto_nao_compensado: "aviso",
    set_setima: "erro", sensivel_sobe: "erro", sensivel_frustrada: "aviso", sensivel_dupla: "erro", aumentada_resolve: "erro", napolitana_resolve: "erro",
    cadencia_tempo_forte: "aviso", harmonia_sincopada: "aviso",
  };
  const MELODIA = { ...TONAL, notas_do_acorde: "erro", cadencia_final: "erro" };
  const CANTUS = {
    cf_final: "erro", cf_chegada: "erro", cf_tamanho: "erro", so_semibreves: "erro", cf_saltos_seguidos: "erro", cf_salto_recuperado: "erro",
    contorno_tritono: "erro", notas_do_modo: "erro", intervalo_melodico_aumentado_diminuto: "erro", salto_maior_que_oitava: "erro",
    salto_de_sexta_ou_setima: "erro", nota_repetida: "erro", ponto_culminante: "aviso", ambito_melodico: "aviso",
  };

  const PLANO_CP = [
    ["Cadência", "Quais as duas últimas notas do contraponto, e que intervalos formam?"],
    ["Clímax", "Que nota, em que compasso? Coincide com o do cantus firmus?"],
    ["Contorno", "Descreva o caminho: começa onde, sobe/desce até o clímax, como volta."],
  ];
  const PLANO_BAIXO = [
    ["Cadências", "Onde a frase fecha e com que fórmula de baixo (4–5–1, ii6–I64–V–I…)?"],
    ["Notas estruturais", "Quais notas da melodia você vai harmonizar (uma por acorde)?"],
    ["Linha do baixo", "Onde ele anda por grau (inversões) e onde salta (articulações)?"],
  ];
  const PLANO_FRASE = [
    ["Forma", "Onde estão a ideia básica, a repetição/contraste e a cadência?"],
    ["Clímax e esqueleto", "Qual o ponto mais alto e qual a descida estrutural até a cadência?"],
    ["Motivo", "Que figura rítmico-melódica você vai desenvolver, e como (fragmentar, sequenciar, liquidar)?"],
  ];

  const niveis = [
    // ================================================================== NÍVEL 1
    {
      numero: 1, titulo: "A linha a duas vozes",
      resumo: "Os modos e o contraponto estrito como disciplina de composição: arquitetura da linha, textura das consonâncias e elaboração de um esqueleto.",
      temas: [], // capítulos em web/livro/nivel1.js
    },

    // ================================================================== NÍVEL 2
    {
      numero: 2, titulo: "Das vozes à harmonia",
      resumo: "A moldura soprano–baixo como motor da harmonia tonal: regra da oitava, desenho do baixo com inversões, ritmo harmônico e esquemas galantes.",
      temas: [], // capítulos em web/livro/nivel2.js
    },

    // ================================================================== NÍVEL 3
    {
      numero: 3, titulo: "A frase e o tema",
      resumo: "Melodia como esqueleto diminuído, e as duas formas-base do tema clássico: sentença e período.",
      temas: [], // capítulos em web/livro/nivel3.js
    },
  ];

  // nível 4: preenchido pelos módulos de web/livro
  niveis.push({ numero: 4, titulo: "Cromatismo e modulação", resumo: "Dominantes secundárias, empréstimo modal, napolitana, sextas aumentadas e os três tipos de modulação — primeiro como os tratados ensinam, depois como os compositores quebraram.", temas: [] });

  // capítulos em módulos separados (web/livro/*.js) entram com TEMAS.inserir
  function inserir(numero, tema, { antesDe, depoisDe } = {}) {
    let n = niveis.find((x) => x.numero === numero);
    if (!n) throw new Error("nível inexistente: " + numero);
    const lista = n.temas;
    if (lista.some((t) => t.id === tema.id)) throw new Error("tema repetido: " + tema.id);
    let k = lista.length;
    if (antesDe) { const i = lista.findIndex((t) => t.id === antesDe); if (i >= 0) k = i; }
    if (depoisDe) { const i = lista.findIndex((t) => t.id === depoisDe); if (i >= 0) k = i + 1; }
    lista.splice(k, 0, tema);
  }
  // acrescenta regras ao perfil de todos os exercícios de um capítulo (sem mexer nos perfis compartilhados)
  function acrescentarRegras(tema, regras) {
    for (const e of tema.exercicios) {
      if (e.perfil) e.perfil = { ...e.perfil, ...regras };
      else e.extras = { ...(e.extras || {}), ...regras };
    }
    return tema;
  }
  function novoNivel(nivel) {
    if (niveis.some((x) => x.numero === nivel.numero)) return;
    niveis.push({ temas: [], ...nivel });
    niveis.sort((a, b) => a.numero - b.numero);
  }
  // perguntas de antes dos exercícios em módulos próprios (web/livro/perguntas-*.js)
  function perguntas(id, lista) {
    for (const n of niveis) for (const t of n.temas) if (t.id === id) { t.antes = lista; return; }
    throw new Error("tema inexistente para perguntas: " + id);
  }
  const perfis = { N1, N2, N3, N4, TONAL, MELODIA, CANTUS, PLANO_CP, PLANO_BAIXO, PLANO_FRASE, FUX, CF1, CF2 };

  raiz.TEMAS = { niveis, inserir, novoNivel, perguntas, perfis, acrescentarRegras };
})(this);
