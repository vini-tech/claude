/* Perguntas de antes dos exercícios · nível 4 (modulação; nona e acordes raros; cromatismo linear).
 * Perguntas de julgamento, com partitura: escolher o pivô, achar onde a tonicização vira modulação,
 * grafar o pivô enarmônico, decidir quando a quebra funciona. Formato em docs/guia-perguntas.md.
 * Usa as regras mod_* (livro/modulacao.js), nona_*, lin_* (livro/raros.js) e aum_* (livro/aumentadas.js). */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const { TONAL } = T.perfis;

  // partitura soprano–baixo e cifras de exemplo ([tempo em semínimas, cifra]) a partir de uma cifra por nota do baixo
  const pt = (tom, s, b) => `tom: ${tom}\nsoprano: ${s}\nbaixo: ${b}`;
  function pares(partitura, cifras) {
    const ex = M.lerTexto(partitura);
    const b = ex.vozes[ex.vozes.length - 1];
    const cs = cifras.trim().split(/\s+/);
    return b.notas.map((n, i) => [n.inicio / M.T, cs[i]]);
  }
  // alternativa (ou enunciado) com partitura e cifras
  const op = (tom, s, b, cifras, resto = {}) => {
    const partitura = pt(tom, s, b);
    return { partitura, cifras: pares(partitura, cifras), ...resto };
  };
  // trechos curtos: sem a regra de cadência do plano (o perfil de cada pergunta diz o que vale)
  const trecho = (p) => { const q = { ...p }; delete q.cadencias_do_plano; return q; };

  // perfis dos capítulos (os mesmos de livro/modulacao.js e livro/raros.js)
  const BASE = { ...TONAL, mod_intervalo_melodico: "erro", modulacao: "erro" };
  delete BASE.intervalo_melodico_aumentado_diminuto;
  const P1 = { ...BASE, mod_falsa_relacao: "aviso", mod_pivo_predominante: "aviso", mod_caminho: "aviso" };
  const P2 = { ...BASE, mod_falsa_relacao: "erro" };
  const P3 = { ...BASE, mod_falsa_relacao: "aviso", mod_grafia_enarmonica: "aviso" };
  const P4 = { ...BASE, mod_falsa_relacao: "aviso", mod_plano_de_tons: "erro" };
  const { intervalo_melodico_aumentado_diminuto: _i, dissonancia_aproximacao: _d, cifras_coerentes: _c, ...NB } = TONAL;
  const NONA = { ...NB, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", nona_resolve: "erro" };
  const { dissonancia_resolucao: _r, seis_quatro: _s, ...NB2 } = NB;
  const LIN = { ...NB2, aum_cromatismo: "erro", aum_aproximacao: "aviso", aum_cifras: "erro", lin_resolucao: "erro", lin_seis_quatro: "erro" };

  // ================================================================ Modulação I: diatônica (pivô)

  T.perguntas("modulacao1", [
    { p: "Sol maior → mi menor; só muda o pivô (c. 2, 1º tempo). Qual costura convence mais?",
      o: [
        op("G maior", "B4/2 A4/1 G4/1 A4/2 G4/1 F#4/1 E4/4", "G2/2 A2/1 B2/1 C3/2 B2/1 B2/1 E3/4", "I V43 I6 ii6=e:iv6 i64 V7 i", { texto: "pivô: lá menor (ii6 = iv6)" }),
        op("G maior", "B4/2 A4/1 G4/1 F#4/2 G4/1 F#4/1 E4/4", "G2/2 A2/1 B2/1 D3/2 B2/1 B2/1 E3/4", "I V43 I6 V=e:VII i64 V7 i", { texto: "pivô: ré maior (V = VII)",
          por: "Ré maior soa como V de sol e promete sol; em mi é VII, que não prepara o si: o 6/4 chega como desvio." }),
        op("G maior", "B4/2 A4/1 G4/1 B4/2 G4/1 F#4/1 E4/4", "G2/2 A2/1 B2/1 E2/2 B2/1 B2/1 E3/4", "I V43 I6 vi=e:i i64 V7 i", { texto: "pivô: mi menor (vi = i)",
          por: "Mi menor já é a tônica nova: chega sem preparação, e i → i64 fica parado. Soa como sol indo ao vi." }),
      ],
      e: "Lá menor = ii6 de sol = iv6 de mi: pré-dominante nos dois. Espera-se ré; vem o 6/4 de mi. Escolha o pivô pré-dominante no tom de chegada." },

    { p: "Dó maior → lá menor, que deve ficar como tom de chegada. Qual versão está correta?",
      o: [
        op("C maior", "E5/2 D5/1 C5/1 F5/2 D5/2 C5/2 A4/2 C5/1 B4/1 A4/2", "C3/2 D3/1 E3/1 D3/2 B2/2 C3/2 D3/2 E3/1 E3/1 A2/2", "I V43 I6 ii=a:iv V43 i6 iv i64 V7 i"),
        op("C maior", "E5/2 D5/1 C5/1 F5/2 D5/2 C5/2 A4/2 C5/1 B4/1 C5/2", "C3/2 D3/1 E3/1 D3/2 B2/2 C3/2 F3/2 G3/1 G3/1 C3/2", "I V43 I6 ii=a:iv V43 C:vi6 IV I64 V7 I", {
          por: "Depois do lá menor a frase cadencia em dó (IV – I64 – V7 – I): só tonicização, sem V–i em lá." }),
        op("C maior", "E5/2 D5/1 C5/1 F5/2 E5/2 C5/4", "C3/2 D3/1 E3/1 D3/2 E3/2 A2/4", "I V43 I6 ii=a:iv V i", {
          por: "Pivô → V → i num compasso: o ouvido ainda está em dó e ouve cadência no vi, não tom de chegada." }),
        op("C maior", "E5/2 D5/1 C5/1 F5/2 G#5/2 A5/2 F5/2 E5/1 D5/1 C5/2", "C3/2 D3/1 E3/1 D3/2 E3/2 C3/2 D3/2 E3/1 E3/1 A2/2", "I V43 I6 ii=a:iv V i6 iv i64 V7 i", {
          por: "Fá5 → sol♯5 (c. 2): 2ª aumentada no soprano. Ponha a sensível numa voz interna ou faça-a chegar por grau." }),
      ],
      e: "Pivô ré menor (ii = iv), sol♯ sem salto no V43, quatro acordes em lá e cadência perfeita: as quatro decisões da modulação diatônica.",
      verificar: { perfil: trecho({ ...P1, mod_caminho: "erro" }), contexto: { nivel: 6, plano: {}, modulacao: { para: "A menor", tipo: "pivo" } } } },

    { p: "Dó maior → fá maior (IV), sem pivô pré-dominante diatônico. Qual continuação muda de tom com mais clareza?",
      ...op("C maior", "E5/2 F5/1 D5/1 E5/2", "C3/2 F2/1 G2/1 C3/2", "I IV V I"),
      o: [
        op("C maior", "E5/2 F5/1 D5/1 E5/2~ E5/2 F5/1 G5/1 F5/1 E5/1 F5/4", "C3/2 F2/1 G2/1 C3/2 Bb2/2 A2/1 Bb2/1 C3/1 C3/1 F2/4", "I IV V I=F:V V42 I6 ii6 I64 V7 I", { texto: "o dó ganha a 7ª (si♭ no baixo)" }),
        op("C maior", "E5/2 F5/1 D5/1 E5/2 F5/2 D5/1 Bb4/1 A4/1 G4/1 F4/4", "C3/2 F2/1 G2/1 C3/2 F2/2 Bb2/1 G2/1 C3/1 C3/1 F2/4", "I IV V I=F:V I IV ii I64 V7 I", { texto: "o dó vai direto ao fá",
          por: "Dó → fá em fundamental soa como I → IV de dó; só o si♭ do c. 3 revela a mudança, tarde demais." }),
        op("C maior", "E5/2 F5/1 D5/1 E5/2 C5/2 D5/1 Bb4/1 A4/1 G4/1 F4/4", "C3/2 F2/1 G2/1 C3/2 A2/2 Bb2/1 G2/1 C3/1 C3/1 F2/4", "I IV V I vi=F:iii IV ii I64 V7 I", { texto: "pivô: lá menor (vi = iii)",
          por: "Lá menor (vi = iii) é tônica nos dois tons: não empurra. Soa como dó com cadência em fá colada." }),
      ],
      e: "Solução histórica: I vira V do tom novo. O si♭ no baixo (V42) revela na hora a dominante, e o mi5 preso sobe a fá; sem a 7ª, soaria como dó." },
  ]);

  // ================================================================ Modulação II: cromática

  T.perguntas("modulacao2", [
    { p: "Sol maior → mi menor sem pivô, por inflexão cromática. Qual está correta?",
      o: [
        op("G maior", "B4/1 E5/1 F#5/1 G5/1 D5/1 D#5/1 E5/2 C5/2 B4/1 D#5/1 E5/4", "G2/1 C3/1 D3/1 G2/1 B2/1 B2/1 E3/2 A2/2 B2/1 B2/1 E3/4", "I IV V I I6 e:V i iv i64 V7 i"),
        op("G maior", "B4/1 E5/1 F#5/1 G5/1 D5/1 F#5/1 E5/2 C5/2 B4/1 D#5/1 E5/4", "G2/1 C3/1 D3/1 G2/1 B2/1 D#3/1 E3/2 A2/2 B2/1 B2/1 E3/4", "I IV V I I6 e:V6 i iv i64 V7 i", {
          por: "Ré5 no soprano, ré♯3 no baixo logo depois: falsa relação. Nenhuma voz faz ré → ré♯." }),
        op("G maior", "B4/1 E5/1 F#5/1 B4/1 C5/1 D#5/1 E5/2 C5/2 B4/1 D#5/1 E5/4", "G2/1 C3/1 D3/1 G2/1 C3/1 B2/1 E3/2 A2/2 B2/1 B2/1 E3/4", "I IV V I IV e:V i iv i64 V7 i", {
          por: "Dó5 → ré♯5: 2ª aumentada. O IV não tem ré a alterar: a sensível chega por salto, sem inflexão." }),
        op("G maior", "B4/1 E5/1 F#5/1 G5/1 D5/1 Eb5/1 E5/2 C5/2 B4/1 D#5/1 E5/4", "G2/1 C3/1 D3/1 G2/1 B2/1 B2/1 E3/2 A2/2 B2/1 B2/1 E3/4", "I IV V I I6 e:V i iv i64 V7 i", {
          por: "Mi♭ é outra letra: o V de mi tem ré♯. A inflexão é ré → ré♯, mesma letra alterada." }),
      ],
      e: "Sobre o mesmo si, ré5 → ré♯5 → mi5: inflexão e resolução da sensível num gesto; iv – i64 – V7 – i confirma.",
      verificar: { perfil: trecho(P2), contexto: { nivel: 6, plano: {}, modulacao: { para: "E menor", tipo: "cromatica" } } } },

    { p: "Dó → lá♭ maior sem dominante (à Schubert): a harmonia cai uma 3ª M no c. 2. Qual está correta?",
      o: [
        op("C maior", "E5/2 D5/2 C5/2~ C5/2 Db5/2 C5/1 Bb4/1 Ab4/4", "C3/2 G2/2 C3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4", "I V I Ab:I ii6 I64 V7 I"),
        op("C maior", "C5/2 D5/2 E5/2~ E5/2 F5/2 Eb5/1 Db5/1 C5/4", "C3/2 G2/2 C3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4", "I V I Ab:I ii6 I64 V7 I", {
          por: "Mi5 não está em lá♭ maior: 5ª aumentada sobre lá♭2. A única nota comum é o dó." }),
        op("C maior", "E5/2 D5/2 C5/2 Eb5/2 Db5/2 C5/1 Bb4/1 Ab4/4", "C3/2 G2/2 C3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4", "I V I Ab:I ii6 I64 V7 I", {
          por: "Soprano e baixo saltam juntos: nada fica parado e soa como corte. Sem dominante, a nota presa é a única ponte." }),
      ],
      e: "Dó5 (tônica de dó, 3ª de lá♭) fica no soprano enquanto o baixo desce: escurecimento do ♭VI. A cadência confirma depois.",
      verificar: { perfil: trecho({ ...P2, mod_nota_comum: "erro" }), contexto: { nivel: 6, plano: {}, notaComum: true, modulacao: { para: "Ab maior", tipo: "nota comum" } } } },

    { p: "Dó → lá♭ maior por acorde comum alterado; só muda o pivô. Qual é o melhor?",
      o: [
        op("C maior", "E5/2 D5/1 C5/1 Db5/2 Db5/2 C5/2 Bb4/2 C5/1 Bb4/1 Ab4/2", "C3/2 B2/1 C3/1 F3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/2", "I V65 I N6=Ab:IV6 V7 I ii6 I64 V7 I", { texto: "pivô: ré♭ maior (N6 = IV6)" }),
        op("C maior", "E5/2 D5/1 C5/1 C5/2 Db5/2 C5/2 Bb4/2 C5/1 Bb4/1 Ab4/2", "C3/2 B2/1 C3/1 F3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/2", "I V65 I iv=Ab:vi V7 I ii6 I64 V7 I", { texto: "pivô: fá menor (iv = vi)",
          por: "Fá menor é vi em lá♭: função de tônica. Funciona, mas não empurra para o mi♭7." }),
        op("C maior", "E5/2 D5/1 C5/1 Bb4/2 G4/2 Ab4/2 Bb4/2 C5/1 Bb4/1 Ab4/2", "C3/2 B2/1 C3/1 Eb3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/2", "I V65 I bIII=Ab:V V7 I ii6 I64 V7 I", { texto: "pivô: mi♭ maior (♭III = V)",
          por: "Mi♭ maior já é o V de lá♭: o tom novo começa pela dominante, sem preparação. Pivô a evitar." }),
      ],
      e: "Ré♭ maior: N6 de dó = IV6 de lá♭, pré-dominante nos dois. O ré♭5 preso vira 7ª do mi♭7. Pivô alterado segue a mesma regra." },
  ]);

  // ================================================================ Modulação III: enarmônica

  T.perguntas("modulacao3", [
    { p: "O vii°7 de dó (c. 2) vai a fá♯ menor, onde é mi♯–sol♯–si–ré. Qual grafia de soprano e baixo está correta?",
      o: [
        op("C maior", "G4/2 F4/1 G4/1 G#4/2 A4/2 B4/2 A4/1 G#4/1 F#4/4", "C3/2 D3/1 E3/1 E#3/2 F#3/2 D3/2 C#3/1 C#3/1 F#3/4", "I V43 I6 vii°43=f#:vii°7 i iv6 i64 V7 i"),
        op("C maior", "G4/2 F4/1 G4/1 Ab4/2 A4/2 B4/2 A4/1 G#4/1 F#4/4", "C3/2 D3/1 E3/1 F3/2 F#3/2 D3/2 C#3/1 C#3/1 F#3/4", "I V43 I6 vii°43=f#:vii°7 i iv6 i64 V7 i", {
          por: "Fá3 e lá♭4 são a grafia de dó, mas as duas notas sobem (mi♯ → fá♯, sol♯ → lá). Grafe pela resolução." }),
        op("C maior", "G4/2 F4/1 G4/1 Ab4/2 A4/2 B4/2 A4/1 G#4/1 F#4/4", "C3/2 D3/1 E3/1 E#3/2 F#3/2 D3/2 C#3/1 C#3/1 F#3/4", "I V43 I6 vii°43=f#:vii°7 i iv6 i64 V7 i", {
          por: "Baixo certo (mi♯), mas o soprano mantém lá♭4: a nota que sobe a lá parece uma 7ª que desce." }),
        op("C maior", "G4/2 F4/1 E4/1 G#4/2 A4/2 B4/2 A4/1 G#4/1 F#4/4", "C3/2 G2/1 C3/1 E#3/2 F#3/2 D3/2 C#3/1 C#3/1 F#3/4", "I V7 I vii°43=f#:vii°7 i iv6 i64 V7 i", {
          por: "Grafia certa, mas dó3 → mi♯3 é 3ª aumentada (e falsa relação com o mi4). Chegue ao mi♯ pelo mi." }),
      ],
      e: "Mi → mi♯ → fá♯ no baixo, sol → sol♯ → lá no soprano: semitons cromáticos que seguem subindo. A grafia conta a resolução.",
      verificar: { perfil: trecho({ ...P3, mod_grafia_enarmonica: "erro" }), contexto: { nivel: 6, plano: {}, modulacao: { para: "F# menor", tipo: "enarmonica" } } } },

    { p: "Si♭–ré–fá–lá♭ soa como a sexta alemã de ré (si♭–ré–fá–sol♯). Quando o ouvido descobre que não é?",
      ...op("D maior", "F#5/2 G5/2 Ab5/2 G5/2 F5/2 G5/1 F5/1 Eb5/4", "D3/2 B2/2 Bb2/2 Eb3/2 Ab2/2 Bb2/1 Bb2/1 Eb3/4", "I IV6 Ger65=Eb:V7 I ii6 I64 V7 I"),
      o: [
        "Na resolução: lá♭5 desce a sol5 e o baixo salta a mi♭ — 7ª de dominante, não 6ª aumentada",
        { texto: "No próprio acorde: a sexta alemã e o V7 soam diferentes", por: "São as mesmas teclas (lá♭ = sol♯); só a grafia e a resolução os distinguem." },
        { texto: "No 6/4 cadencial do c. 3", por: "O 6/4 do c. 3 é de mi♭ e vem depois da decisão; a sexta alemã de ré iria ao 6/4 de ré, sobre lá." },
        { texto: "Só na cadência final em mi♭ (c. 3–4)", por: "A cadência confirma, mas no c. 2 o lá♭ já desceu e o baixo já saltou a mi♭: V7 de mi♭." },
      ],
      e: "V7 × Ger65 só se distinguem depois: a 7ª desce e o baixo salta; a 6ª aumentada se abre em 8ª. Daí o salto ré → mi♭ num passo." },

    { p: "Três passagens chegam a lá♭ pela tríade aumentada, sem V–I. Em qual a falta de confirmação funciona?",
      o: [
        op("C maior", "E5/2 D5/2 C5/2 Eb5/2~ Eb5/2 D#5/2 E5/1 D5/1 C5/1 B4/1 C5/4", "C3/2 G2/2 C3/2 G2/2 Ab2/2 G2/2 C3/1 F3/1 G3/1 G3/1 C3/4", "I V I V+=Ab:V+6 I V+6=C:V+ I ii6 I64 V7 I", { texto: "lá♭ tocado e deixado; cadência em dó" }),
        op("C maior", "E5/2 D5/2 C5/2 Eb5/2~ Eb5/4", "C3/2 G2/2 C3/2 G2/2 Ab2/4", "I V I V+=Ab:V+6 I", { texto: "termina em lá♭",
          por: "Termina em lá♭ sem V–I: soa como ♭VI de dó suspenso, que pede continuação." }),
        op("C maior", "E5/2 D5/2 C5/2 Eb5/2~ Eb5/2 D#5/2 E5/4", "C3/2 G2/2 C3/2 G2/2 Ab2/2 G2/2 C3/4", "I V I V+=Ab:V+6 I V+6=C:V+ I", { texto: "volta a dó e para",
          por: "Volta a dó também só pela tríade aumentada: nenhum tom confirmado, o ciclo fica no ar." }),
      ],
      e: "Lá♭ só passa; o V+ relido leva de volta a dó, que recebe ii6 – I64 – V7 – I. Tons do meio dispensam cadência se as pontas são firmes." },
  ]);

  // ================================================================ Modulação na forma

  T.perguntas("modulacao4", [
    { p: "Modelo em sol, cópias em lá menor e si menor. Qual continuação para a sequência e firma ré maior?",
      ...op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1", "I IV V I a:i iv V i b:i iv V i"),
      o: [
        op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1 B4/2 F#4/1 E4/1 D4/4", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1 G2/2 A2/1 A2/1 D3/4", "I IV V I a:i iv V i b:i iv V i=D:vi ii6 I64 V7 I"),
        op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1 C#5/2 D5/2", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1 A2/2 D3/2", "I IV V I a:i iv V i b:i iv V i=D:vi V7 I", {
          por: "V7 – I repete o gesto das cópias: soa como mais um elo, não chegada. Falta tempo e quebra do padrão." }),
        op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1 E5/1 F#5/1 D#5/1 E5/1", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1 C#3/1 F#3/1 G#3/1 C#3/1", "I IV V I a:i iv V i b:i iv V i c#:i iv V i", {
          por: "Mais uma cópia (dó♯ menor): o padrão vira rotina e a frase para num tom que não era o destino." }),
        op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1 B4/2 D5/1 C#5/1 B4/4", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1 G2/2 F#2/1 F#2/1 B2/4", "I IV V I a:i iv V i b:i iv V i iv6 i64 V7 i", {
          por: "Cadência perfeita, mas em si menor: o si menor vira tom de chegada em vez de pivô." }),
      ],
      e: "Si menor relido como vi de ré, e a cadência ii6 – I64 – V7 – I quebra o padrão: reinterpretar a última cópia e cadenciar diferente encerra a sequência." },

    { p: "Período modulante em fá: antecedente em semicadência; o consequente deve cadenciar em dó no c. 5. Qual está correta?",
      o: [
        op("F maior", "C5/2 Bb4/1 A4/1 D5/2 C5/2 C5/1 Bb4/1 A4/1 A4/1 D5/1 C5/1 D5/2 C5/1 B4/1 C5/2", "F2/2 G2/1 A2/1 Bb2/2 C3/2 F2/1 G2/1 A2/1 D3/1 B2/1 C3/1 F3/2 G3/1 G3/1 C3/2", "I V43 I6 IV V I V43 I6 vi=C:ii V65 I ii6 I64 V7 I"),
        op("F maior", "C5/2 Bb4/1 A4/1 D5/2 C5/2 C5/1 Bb4/1 A4/1 D5/1 C#5/1 D5/1 D5/1 C#5/1 D5/2", "F2/2 G2/1 A2/1 Bb2/2 C3/2 F2/1 G2/1 A2/1 Bb2/1 A2/1 D3/1 G2/1 A2/1 D2/2", "I V43 I6 IV V I V43 I6 ii6=d:iv6 V i iv V7 i", {
          por: "Cadência perfeita, mas em ré menor: o plano pede dó, a dominante." }),
        op("F maior", "C5/2 Bb4/1 A4/1 D5/2 C5/2 C5/1 Bb4/1 A4/1 G4/1 D5/1 C5/1 D5/2 C5/1 B4/1 C5/2", "F2/2 G2/1 A2/1 Bb2/2 C3/2 F2/1 G2/1 A2/1 C3/1 B2/1 C3/1 F3/2 G3/1 G3/1 C3/2", "I V43 I6 IV V I V43 I6 V=C:I V65 I ii6 I64 V7 I", {
          por: "Pivô dó maior (V = I): soa como a dominante de fá da semicadência; o tom novo chega sem caminho." }),
        op("F maior", "C5/2 Bb4/1 A4/1 D5/2 C5/2 C5/1 Bb4/1 A4/1 A4/1 D5/1 C5/1 D5/2 E5/1 D5/1 E5/2", "F2/2 G2/1 A2/1 Bb2/2 C3/2 F2/1 G2/1 A2/1 D3/1 B2/1 C3/1 F3/2 G3/1 G3/1 C3/2", "I V43 I6 IV V I V43 I6 vi=C:ii V65 I ii6 I64 V7 I", {
          por: "Termina no mi5 (3ª de dó): cadência imperfeita. A chegada pede a tônica nova no soprano." }),
      ],
      e: "Pivô ré menor (vi = ii), si♮ no V65, ii6 e 6/4 antes do V7 → I com dó no soprano. Semicadência em fá × cadência em dó: a forma.",
      verificar: { perfil: { ...P4, mod_pivo_predominante: "erro" }, contexto: { nivel: 6, plano: { semicadencia: 2, cadencia: 5, tomFinal: "C maior" }, planoTons: [[1, "F maior"], [5, "C maior"]], modulacao: { para: "C maior", tipo: "pivo" } } } },

    { p: "Frase em ré com cadência perfeita; a seguinte começa direto em si♭ maior (♭VI). Por que não soa como erro?",
      ...op("D maior", "F#5/2 E5/1 D5/1 B4/1 C#5/1 D5/2 D5/2 C5/1 Bb4/1 G4/1 A4/1 Bb4/2", "D3/2 E3/1 F#3/1 G3/1 A3/1 D3/2 Bb2/2 C3/1 D3/1 Eb3/1 F3/1 Bb2/2", "I V43 I6 IV V I Bb:I V43 I6 IV V I"),
      o: [
        "A cadência permite recomeçar, a frase se repete 3ª M abaixo e o ré5 (comum) atravessa a emenda",
        { texto: "Porque si♭ maior é tom vizinho de ré maior", por: "Dois sustenidos × dois bemóis: quatro acidentes. Si♭ é ♭VI, mediante cromática." },
        { texto: "Porque o ré maior final funciona como pivô (I de ré = III de si♭)", por: "Ré maior (com fá♯) não existe em si♭; o III de si♭ é ré menor. Não há pivô." },
        { texto: "Porque o baixo prepara si♭ com a dominante do tom novo", por: "Não há fá7 antes do si♭: o baixo vai direto do ré ao si♭2." },
      ],
      e: "Na direta, a articulação de frase substitui a ponte; a repetição e o ré comum costuram. No meio de uma frase, o salto soaria como engano." },
  ]);

  // ================================================================ Nona de dominante e acordes raros

  T.perguntas("nona", [
    { p: "Sol maior, IV – V9 – I, nona (mi) no soprano. Qual trata a nona corretamente?",
      o: [
        op("G maior", "B4/2 E5/2~ E5/2 D5/2", "G2/2 C3/2 D3/2 G2/2", "I IV V9 I"),
        op("G maior", "B4/2 E5/2~ E5/2 G5/2", "G2/2 C3/2 D3/2 G2/2", "I IV V9 I", {
          por: "A nona salta a sol5 em vez de descer: fica sem resolução." }),
        op("G maior", "B4/2 E5/2~ E5/2 D5/2", "G2/2 C3/2 D3/2 E3/2", "I IV V9 vi", {
          por: "Ré5 sobre o mi3 do vi é 7ª: resolve em outra dissonância (ré não está no vi)." }),
        op("G maior", "B4/2 G4/2 E5/2 D5/2", "G2/2 C3/2 D3/2 G2/2", "I IV V9 I", {
          por: "Sol4 → mi5 por salto de 6ª: sem preparação, a nona soa como apojatura." }),
      ],
      e: "Mi5 entra como 3ª do IV, fica preso sobre o ré (nona) e desce ao ré5, 5ª do I: preparar, manter, descer por grau.",
      verificar: { perfil: trecho({ ...NONA, aum_aproximacao: "erro" }), contexto: { nivel: 6, plano: {} } } },

    { p: "Dó maior, IV – V7 – I: sobre o sol, o soprano salta ao mi5 e desce ao ré5 antes do I. Como ler o mi5?",
      ...op("C maior", "C5/2 A4/2 E5/1 D5/1 C5/2", "C3/2 F3/2 G2/2 C3/2", "I IV V7 I"),
      o: [
        "Apojatura (6–5) sobre o V7, resolvendo no ré sobre o mesmo baixo",
        { texto: "Acorde de 13ª (V13): o mi é membro do acorde", por: "O mi resolve antes de a harmonia mudar: 6–5 sobre o sol. O \"V13\" é quase sempre isso." },
        { texto: "A nona do V9", por: "A nona de sol é lá, não mi. O mi está uma 13ª (6ª composta) acima do baixo." },
        { texto: "Acorde de 11ª (V11)", por: "A 11ª de sol é dó, não mi (e a \"11ª\" é em geral o retardo 4–3)." },
      ],
      e: "11ª e 13ª são, em geral, apojaturas ou retardos sobre o V7. O mi chega por salto em tempo forte e desce por grau: apojatura, que precisa resolver." },

    { p: "Três passagens quebram a resolução da nona. Em qual a quebra é estilo (Satie, Debussy), não erro?",
      o: [
        op("G maior", "B4/2 E5/2~ E5/2 D5/2 D5/1 E5/1 F#5/1 G5/1 F#5/2 G5/2", "G2/2 C3/2 D3/2 G2/2 C3/1 D3/1 E3/1 F#3/1 D3/2 G2/2", "I IV V9 I IV9 V9 vi9 viiø9 V7 I", { texto: "nonas paralelas no c. 3" }),
        op("G maior", "B4/2 E5/2~ E5/2 B4/2 C5/2 A4/2 B4/4", "G2/2 C3/2 D3/2 G2/2 A2/2 D3/2 G2/4", "I IV V9 I ii V I", { texto: "uma nona que salta",
          por: "Nona isolada que salta numa frase clássica: sem outra lógica, soa como descuido." }),
        op("G maior", "B4/2 E5/2~ E5/1 F#5/1 G5/2~ G5/2 F#5/2 G5/4", "G2/2 C3/2 D3/1 D3/1 G2/2 E3/2 D3/2 G2/4", "I IV V9 V7 I vi V7 I", { texto: "uma nona que sobe",
          por: "A nona sobe ao fá♯5, contra a tendência: tratada como sensível, não como cor." }),
      ],
      e: "C. 3 em nonas paralelas sistemáticas (planing): a dissonância vira timbre. Funciona porque troca a regra por outra lógica audível e fecha com V7 – I." },
  ]);

  // ================================================================ Cromatismo linear

  T.perguntas("linear", [
    { p: "Ré maior: o #ii°42 (mi♯–sol♯–si–ré sobre ré) enfeita o I. Qual soprano está correto?",
      o: [
        op("D maior", "F#5/1 E#5/1 F#5/2 G5/1 E5/1 D5/2", "D3/1 D3/1 D3/2 G2/1 A2/1 D3/2", "I #ii°42 I IV V I"),
        op("D maior", "F#5/1 F5/1 F#5/2 G5/1 E5/1 D5/2", "D3/1 D3/1 D3/2 G2/1 A2/1 D3/2", "I #ii°42 I IV V I", {
          por: "Fá♮ não está no acorde: a bordadura que volta ao fá♯ se escreve mi♯." }),
        op("D maior", "F#5/1 E#5/1 A4/2 G5/1 E5/1 D5/2", "D3/1 D3/1 D3/2 G2/1 A2/1 D3/2", "I #ii°42 I IV V I", {
          por: "Mi♯5 salta a lá4 (5ª aumentada) sem resolver: a nota alterada deve seguir por semitom (mi♯ → fá♯)." }),
      ],
      e: "Fá♯5 → mi♯5 → fá♯5 sobre o ré parado: bordadura cromática grafada pela resolução. O I continua I, só colorido.",
      verificar: { perfil: trecho(LIN), contexto: { nivel: 6, plano: {} } } },

    { p: "Ônibus em sol: o mi♭5, 7ª de fá7 (♭VII7), sobe a mi5 em vez de descer. Por que não é erro?",
      ...op("G maior", "D5/1 D5/1 Eb5/1 E5/1 F5/1 F#5/1 G5/2", "G2/1 F#2/1 F2/1 E2/1 Eb2/1 D2/1 G2/2", "I V65 a:Ger65=G:bVII7 a:i64 G:bVII42 V7 I"),
      o: [
        "Fá7 = sexta alemã de lá menor: o mi♭ é um ré♯ que sobe ao mi do 6/4 de lá",
        { texto: "Porque a 7ª de qualquer acorde pode subir quando o baixo desce", por: "Não: a 7ª tende a descer. Aqui o mi♭ sobe pela dupla leitura e pelo movimento contrário." },
        { texto: "Porque mi♭ é a sensível de mi", por: "A sensível de mi é ré♯; mi♭ → mi é semitom cromático. Só relido como ré♯ funciona assim." },
        { texto: "Porque o acorde seguinte é o V7 de sol, que contém mi", por: "O seguinte é o 6/4 de lá menor; o V7 de sol não tem mi e só vem no fim." },
      ],
      e: "Na ônibus os acordes nascem das linhas (externas cromáticas em movimento contrário) e a dissonância resolve por semitom. As pontas (I, V7 → I) seguram o tom." },

    { p: "Mi menor: cadeia de dominantes com 7ª deslizando por semitons. Em qual a quebra da função funciona?",
      o: [
        op("E menor", "E5/1 D#5/1 E5/1 E5/1 D#5/1 D5/1 C#5/1 C5/1 B4/1 C#5/1 D#5/2 E5/4", "E2/1 F#2/1 G2/1 A2/1 B2/1 Bb2/1 A2/1 Ab2/1 G2/1 F#2/1 B2/2 E2/4", "i V43 i6 iv V7 bV7 IV7 bIV7 V7/VI V7/V V7 i", { texto: "pontas firmes; soprano nas terças" }),
        op("E menor", "D#5/1 D5/1 C#5/1 C5/1 B4/1 Bb4/1 A4/1 G#4/1", "B2/1 Bb2/1 A2/1 Ab2/1 G2/1 Gb2/1 F2/1 E2/1", "V7 bV7 IV7 bIV7 V7/VI bIII7 bII7 V7/iv", { texto: "só a cadeia",
          por: "Sem pontas diatônicas (começa em si7, termina em mi7), o cromatismo não prolonga nada." }),
        op("E menor", "E5/1 D#5/1 E5/1 E5/1 F#5/1 F5/1 E5/1 Eb5/1 D5/1 C#5/1 D#5/2 E5/4", "E2/1 F#2/1 G2/1 A2/1 B2/1 Bb2/1 A2/1 Ab2/1 G2/1 F#2/1 B2/2 E2/4", "i V43 i6 iv V7 bV7 IV7 bIV7 V7/VI V7/V V7 i", { texto: "pontas firmes; soprano nas quintas",
          por: "O soprano desliza nas quintas dos acordes: 5ªs paralelas entre as vozes externas, ainda erro." }),
      ],
      e: "Pontas firmes e, no meio, soprano em 10ªs com o baixo nas 3ªs das dominantes: a função fica suspensa um compasso, mas a direção tonal se mantém." },
  ]);
})(this);
