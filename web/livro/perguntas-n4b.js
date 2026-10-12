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
    { p: "De sol maior para mi menor em três compassos. As três versões passam nas regras e só mudam o acorde-pivô (1º tempo do c. 2). Qual pivô faz a costura mais convincente?",
      o: [
        op("G maior", "B4/2 A4/1 G4/1 A4/2 G4/1 F#4/1 E4/4", "G2/2 A2/1 B2/1 C3/2 B2/1 B2/1 E3/4", "I V43 I6 ii6=e:iv6 i64 V7 i", { texto: "pivô: lá menor (ii6 = iv6)" }),
        op("G maior", "B4/2 A4/1 G4/1 F#4/2 G4/1 F#4/1 E4/4", "G2/2 A2/1 B2/1 D3/2 B2/1 B2/1 E3/4", "I V43 I6 V=e:VII i64 V7 i", { texto: "pivô: ré maior (V = VII)",
          por: "Ré maior é o V de sol: no c. 2 o ouvido o escuta como a dominante de sol e espera sol maior. Em mi menor ele é o VII, que não prepara o si — o 6/4 de mi chega como um desvio, não como o fim de um caminho." }),
        op("G maior", "B4/2 A4/1 G4/1 B4/2 G4/1 F#4/1 E4/4", "G2/2 A2/1 B2/1 E2/2 B2/1 B2/1 E3/4", "I V43 I6 vi=e:i i64 V7 i", { texto: "pivô: mi menor (vi = i)",
          por: "Mi menor é vi em sol, mas em mi é a própria tônica: a chegada acontece antes de qualquer preparação, e o i → i6/4 que vem depois fica parado sobre a mesma harmonia. O ouvido ouve sol indo ao seu vi e uma cadência colada, não uma viagem." }),
      ],
      e: "Lá menor com dó no baixo é ii6 em sol e iv6 em mi: pré-dominante nos dois tons. Em sol o ouvido espera a dominante (ré); recebe o 6/4 cadencial de mi — PD → D → T no tom novo, sem emenda audível. Entre os acordes comuns, escolha o que é pré-dominante no tom de chegada." },

    { p: "De dó maior para lá menor — e lá menor precisa ficar, como tom de chegada, não como uma cadência de passagem. O primeiro compasso é o mesmo nas quatro versões. Qual está correta?",
      o: [
        op("C maior", "E5/2 D5/1 C5/1 F5/2 D5/2 C5/2 A4/2 C5/1 B4/1 A4/2", "C3/2 D3/1 E3/1 D3/2 B2/2 C3/2 D3/2 E3/1 E3/1 A2/2", "I V43 I6 ii=a:iv V43 i6 iv i64 V7 i"),
        op("C maior", "E5/2 D5/1 C5/1 F5/2 D5/2 C5/2 A4/2 C5/1 B4/1 C5/2", "C3/2 D3/1 E3/1 D3/2 B2/2 C3/2 F3/2 G3/1 G3/1 C3/2", "I V43 I6 ii=a:iv V43 C:vi6 IV I64 V7 I", {
          por: "Até o 1º tempo do c. 3 vai tudo bem (pivô ré menor, V43 de lá, lá menor com dó no baixo) — mas depois a frase segue IV – I6/4 – V7 – I de dó. O lá menor foi só tonicizado: sem V–i em lá, não há modulação." }),
        op("C maior", "E5/2 D5/1 C5/1 F5/2 E5/2 C5/4", "C3/2 D3/1 E3/1 D3/2 E3/2 A2/4", "I V43 I6 ii=a:iv V i", {
          por: "Pivô → V → i em um compasso: a cadência vem logo depois do pivô, e a frase acaba ali. O ouvido ainda está em dó e ouve uma cadência no vi — a modulação de coral (veja a quebra do capítulo), não um tom de chegada." }),
        op("C maior", "E5/2 D5/1 C5/1 F5/2 G#5/2 A5/2 F5/2 E5/1 D5/1 C5/2", "C3/2 D3/1 E3/1 D3/2 E3/2 C3/2 D3/2 E3/1 E3/1 A2/2", "I V43 I6 ii=a:iv V i6 iv i64 V7 i", {
          por: "Fá5 → sol♯5 no c. 2 é uma 2ª aumentada no soprano: o pivô (ré menor) tem o fá, a dominante nova tem o sol♯, e o salto entre os dois é o erro clássico da modulação para o menor. Deixe a sensível numa voz interna (como no V43) ou faça-a chegar por grau." }),
      ],
      e: "Ré menor é ii em dó e iv em lá (pré-dominante nos dois); o V43 traz o sol♯ sem salto (o soprano canta a 7ª, ré, que resolve em dó sobre o i6); depois i6 – iv – i6/4 – V7 – i dão ao ouvido quatro acordes em lá antes da cadência perfeita. Pivô, nota nova sem 2ª aumentada, tempo no tom novo e cadência: as quatro decisões da modulação diatônica.",
      verificar: { perfil: trecho({ ...P1, mod_caminho: "erro" }), contexto: { nivel: 6, plano: {}, modulacao: { para: "A menor", tipo: "pivo" } } } },

    { p: "Dó maior, e a frase quer ir a fá maior (IV) — um vizinho para o qual o modo maior não tem pivô pré-dominante diatônico. O começo está dado. Qual continuação faz a mudança de tom acontecer com mais clareza?",
      ...op("C maior", "E5/2 F5/1 D5/1 E5/2", "C3/2 F2/1 G2/1 C3/2", "I IV V I"),
      o: [
        op("C maior", "E5/2 F5/1 D5/1 E5/2~ E5/2 F5/1 G5/1 F5/1 E5/1 F5/4", "C3/2 F2/1 G2/1 C3/2 Bb2/2 A2/1 Bb2/1 C3/1 C3/1 F2/4", "I IV V I=F:V V42 I6 ii6 I64 V7 I", { texto: "o dó ganha a 7ª (si♭ no baixo)" }),
        op("C maior", "E5/2 F5/1 D5/1 E5/2 F5/2 D5/1 Bb4/1 A4/1 G4/1 F4/4", "C3/2 F2/1 G2/1 C3/2 F2/2 Bb2/1 G2/1 C3/1 C3/1 F2/4", "I IV V I=F:V I IV ii I64 V7 I", { texto: "o dó vai direto ao fá",
          por: "O dó maior vai ao fá em estado fundamental: para o ouvido é I → IV de dó, o mesmo movimento do c. 1. Nada no c. 2 diz que o tom mudou; a suspeita só vem com o si♭ do c. 3, e a modulação acontece tarde, quase por acaso." }),
        op("C maior", "E5/2 F5/1 D5/1 E5/2 C5/2 D5/1 Bb4/1 A4/1 G4/1 F4/4", "C3/2 F2/1 G2/1 C3/2 A2/2 Bb2/1 G2/1 C3/1 C3/1 F2/4", "I IV V I vi=F:iii IV ii I64 V7 I", { texto: "pivô: lá menor (vi = iii)",
          por: "Lá menor é vi em dó e iii em fá: tônica nos dois tons, não empurra para lugar nenhum. A mudança só se decide no si♭ do c. 3, e a frase soa como dó com uma cadência em fá colada no fim." }),
      ],
      e: "Sem pivô pré-dominante, a solução histórica é justamente a que os manuais desaconselham: o I vira V do tom novo. O que a torna convincente é a 7ª — o si♭ no baixo (V42) transforma, no próprio acorde, a tônica em dominante, e o mi5 preso sobe a fá como sensível. A quebra funciona porque a 7ª revela a função nova na hora; sem ela, o \"V = I\" continua soando como dó maior." },
  ]);

  // ================================================================ Modulação II: cromática

  T.perguntas("modulacao2", [
    { p: "De sol maior para mi menor sem acorde-pivô: a passagem depende de uma inflexão cromática. Qual está correta?",
      o: [
        op("G maior", "B4/1 E5/1 F#5/1 G5/1 D5/1 D#5/1 E5/2 C5/2 B4/1 D#5/1 E5/4", "G2/1 C3/1 D3/1 G2/1 B2/1 B2/1 E3/2 A2/2 B2/1 B2/1 E3/4", "I IV V I I6 e:V i iv i64 V7 i"),
        op("G maior", "B4/1 E5/1 F#5/1 G5/1 D5/1 F#5/1 E5/2 C5/2 B4/1 D#5/1 E5/4", "G2/1 C3/1 D3/1 G2/1 B2/1 D#3/1 E3/2 A2/2 B2/1 B2/1 E3/4", "I IV V I I6 e:V6 i iv i64 V7 i", {
          por: "O ré5 do soprano (I6 de sol) é seguido pelo ré♯3 do baixo (V6 de mi): as duas formas da mesma nota em vozes diferentes, em acordes vizinhos — falsa relação. E nenhuma voz faz o semitom ré → ré♯: a mudança vira choque em vez de inflexão." }),
        op("G maior", "B4/1 E5/1 F#5/1 B4/1 C5/1 D#5/1 E5/2 C5/2 B4/1 D#5/1 E5/4", "G2/1 C3/1 D3/1 G2/1 C3/1 B2/1 E3/2 A2/2 B2/1 B2/1 E3/4", "I IV V I IV e:V i iv i64 V7 i", {
          por: "Dó5 → ré♯5 (c. 2) é uma 2ª aumentada no soprano. E, como o acorde anterior (IV, com dó no soprano e no baixo) não tem ré, não há nota a alterar — não há inflexão: a sensível nova chega por salto, sem o fio que justifica a modulação cromática." }),
        op("G maior", "B4/1 E5/1 F#5/1 G5/1 D5/1 Eb5/1 E5/2 C5/2 B4/1 D#5/1 E5/4", "G2/1 C3/1 D3/1 G2/1 B2/1 B2/1 E3/2 A2/2 B2/1 B2/1 E3/4", "I IV V I I6 e:V i iv i64 V7 i", {
          por: "Ré → mi♭ → mi não é inflexão: mi♭ é outra letra, e o si maior (V de mi) tem ré♯. A partitura diz \"mi♭, que desce\" e a música sobe ao mi. O semitom cromático da modulação é ré → ré♯: a mesma letra, alterada." }),
      ],
      e: "Sobre o mesmo si do baixo, o ré5 (I6 de sol) vira ré♯5 (V de mi) e sobe a mi5: inflexão na mesma voz e resolução da sensível num só gesto. O ouvido ouve uma nota mudar e entende que a escala mudou; iv – i6/4 – V7 – i confirma.",
      verificar: { perfil: trecho(P2), contexto: { nivel: 6, plano: {}, modulacao: { para: "E menor", tipo: "cromatica" } } } },

    { p: "Dó maior → lá♭ maior sem dominante preparando, à maneira de Schubert: a harmonia cai uma 3ª maior de uma vez (c. 2). Qual versão está correta?",
      o: [
        op("C maior", "E5/2 D5/2 C5/2~ C5/2 Db5/2 C5/1 Bb4/1 Ab4/4", "C3/2 G2/2 C3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4", "I V I Ab:I ii6 I64 V7 I"),
        op("C maior", "C5/2 D5/2 E5/2~ E5/2 F5/2 Eb5/1 Db5/1 C5/4", "C3/2 G2/2 C3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4", "I V I Ab:I ii6 I64 V7 I", {
          por: "O mi5 preso não pertence a lá♭ maior (que tem mi♭): sobre o lá♭2 ele forma uma 5ª aumentada, e a \"nota comum\" vira um choque. Dó maior e lá♭ maior só dividem uma nota — o dó." }),
        op("C maior", "E5/2 D5/2 C5/2 Eb5/2 Db5/2 C5/1 Bb4/1 Ab4/4", "C3/2 G2/2 C3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4", "I V I Ab:I ii6 I64 V7 I", {
          por: "Na troca (c. 2) o soprano salta dó5 → mi♭5 enquanto o baixo salta dó → lá♭: nada fica parado, e a mudança soa como um corte. Sem dominante, a nota presa é a única ponte entre os dois tons." }),
      ],
      e: "O dó5 é a tônica de dó e a 3ª de lá♭: ele fica no soprano enquanto o baixo desce dó → lá♭, e a mesma nota aparece de repente sob outra luz — o escurecimento da mediante ♭VI. A cadência (ii6 – I6/4 – V7 – I) confirma depois. A quebra (sem ponte funcional) funciona porque o ouvido segue o fio de uma nota.",
      verificar: { perfil: trecho({ ...P2, mod_nota_comum: "erro" }), contexto: { nivel: 6, plano: {}, notaComum: true, modulacao: { para: "Ab maior", tipo: "nota comum" } } } },

    { p: "De dó maior para lá♭ maior por acorde comum alterado. As três versões passam nas regras; só muda o pivô (c. 2, 1º tempo). Qual é o melhor?",
      o: [
        op("C maior", "E5/2 D5/1 C5/1 Db5/2 Db5/2 C5/2 Bb4/2 C5/1 Bb4/1 Ab4/2", "C3/2 B2/1 C3/1 F3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/2", "I V65 I N6=Ab:IV6 V7 I ii6 I64 V7 I", { texto: "pivô: ré♭ maior (N6 = IV6)" }),
        op("C maior", "E5/2 D5/1 C5/1 C5/2 Db5/2 C5/2 Bb4/2 C5/1 Bb4/1 Ab4/2", "C3/2 B2/1 C3/1 F3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/2", "I V65 I iv=Ab:vi V7 I ii6 I64 V7 I", { texto: "pivô: fá menor (iv = vi)",
          por: "Fá menor (iv emprestado em dó) é vi em lá♭: no tom novo, um pivô de função de tônica. Funciona, mas não empurra para a dominante — o mi♭7 que vem depois soa menos inevitável do que vindo de uma pré-dominante." }),
        op("C maior", "E5/2 D5/1 C5/1 Bb4/2 G4/2 Ab4/2 Bb4/2 C5/1 Bb4/1 Ab4/2", "C3/2 B2/1 C3/1 Eb3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/2", "I V65 I bIII=Ab:V V7 I ii6 I64 V7 I", { texto: "pivô: mi♭ maior (♭III = V)",
          por: "Mi♭ maior (♭III emprestado em dó) já é o V de lá♭: o tom novo começa pela dominante, sem pré-dominante que a prepare, e o ouvido ainda o escuta como uma cor de dó menor. É o pivô que os manuais mandam evitar." }),
      ],
      e: "Ré♭ maior é a napolitana de dó (N6, fá no baixo) e o IV6 de lá♭: pré-dominante nos dois tons. O ré♭5 fica preso e vira a 7ª do mi♭7, que desce a dó sobre o I. Com acordes alterados, a regra do pivô continua valendo: o melhor é o que é pré-dominante no tom de chegada." },
  ]);

  // ================================================================ Modulação III: enarmônica

  T.perguntas("modulacao3", [
    { p: "O som de si–ré–fá–lá♭ (a sétima diminuta de dó, c. 2) vai levar a fá♯ menor, onde ele é mi♯–sol♯–si–ré (vii°7 de fá♯). Soprano e baixo tocam duas dessas notas. Qual escrita está correta?",
      o: [
        op("C maior", "G4/2 F4/1 G4/1 G#4/2 A4/2 B4/2 A4/1 G#4/1 F#4/4", "C3/2 D3/1 E3/1 E#3/2 F#3/2 D3/2 C#3/1 C#3/1 F#3/4", "I V43 I6 vii°43=f#:vii°7 i iv6 i64 V7 i"),
        op("C maior", "G4/2 F4/1 G4/1 Ab4/2 A4/2 B4/2 A4/1 G#4/1 F#4/4", "C3/2 D3/1 E3/1 F3/2 F#3/2 D3/2 C#3/1 C#3/1 F#3/4", "I V43 I6 vii°43=f#:vii°7 i iv6 i64 V7 i", {
          por: "Fá3 e lá♭4 são a grafia de dó: o som está certo, mas a partitura diz que o lá♭ desce e que o fá é a 5ª do acorde, quando as duas notas sobem (o mi♯, sensível, vai a fá♯; o sol♯ vai a lá). Grafe o pivô pela resolução." }),
        op("C maior", "G4/2 F4/1 G4/1 Ab4/2 A4/2 B4/2 A4/1 G#4/1 F#4/4", "C3/2 D3/1 E3/1 E#3/2 F#3/2 D3/2 C#3/1 C#3/1 F#3/4", "I V43 I6 vii°43=f#:vii°7 i iv6 i64 V7 i", {
          por: "O baixo está certo (mi♯, a sensível de fá♯), mas o soprano mantém lá♭4: a nota que sobe a lá aparece escrita como uma 7ª que deveria descer. Metade do acorde em cada leitura." }),
        op("C maior", "G4/2 F4/1 E4/1 G#4/2 A4/2 B4/2 A4/1 G#4/1 F#4/4", "C3/2 G2/1 C3/1 E#3/2 F#3/2 D3/2 C#3/1 C#3/1 F#3/4", "I V7 I vii°43=f#:vii°7 i iv6 i64 V7 i", {
          por: "A grafia do pivô está certa, mas o baixo chega ao mi♯ por salto, dó3 → mi♯3: uma 3ª aumentada (e o mi4 do soprano, logo antes, faz falsa relação com ele). A grafia nova muda os intervalos melódicos: chegue ao mi♯ pelo mi, por semitom cromático." }),
      ],
      e: "Mi♯–sol♯–si–ré: o mi♯ do baixo sobe a fá♯ e o sol♯ do soprano sobe a lá — as duas vozes chegam por semitom cromático (mi → mi♯, sol → sol♯) e continuam subindo. A grafia conta a resolução que o ouvido vai ouvir; no teclado, o som é o mesmo vii°7 de dó.",
      verificar: { perfil: trecho({ ...P3, mod_grafia_enarmonica: "erro" }), contexto: { nivel: 6, plano: {}, modulacao: { para: "F# menor", tipo: "enarmonica" } } } },

    { p: "Até o 1º tempo do c. 2 tudo pode ser ré maior: si♭–ré–fá–lá♭ soa exatamente como si♭–ré–fá–sol♯, a sexta alemã de ré. Em que momento o ouvido descobre que não é?",
      ...op("D maior", "F#5/2 G5/2 Ab5/2 G5/2 F5/2 G5/1 F5/1 Eb5/4", "D3/2 B2/2 Bb2/2 Eb3/2 Ab2/2 Bb2/1 Bb2/1 Eb3/4", "I IV6 Ger65=Eb:V7 I ii6 I64 V7 I"),
      o: [
        "Na resolução: o lá♭5 desce a sol5 e o baixo salta si♭ → mi♭ — é a 7ª de uma dominante resolvendo, não uma 6ª aumentada se abrindo",
        { texto: "No próprio acorde: a sexta alemã e o V7 soam diferentes", por: "No temperamento igual são as mesmas teclas (lá♭ = sol♯). Só a grafia e, para o ouvido, a resolução distinguem os dois." },
        { texto: "No 6/4 cadencial do c. 3", por: "O 6/4 do c. 3 é de mi♭ (sobre si♭) e chega depois da decisão. Quem iria a um 6/4 seria a sexta alemã de ré — o de ré, sobre lá, com o sol♯ subindo a lá." },
        { texto: "Só na cadência final em mi♭ (c. 3–4)", por: "A cadência confirma, mas a reinterpretação já se ouve no c. 2: quando o lá♭ desce em vez de subir e o baixo salta para mi♭, o acorde já soou como V7 de mi♭." },
      ],
      e: "Entre V7 e Ger65 a diferença está só no que vem depois: a 7ª da dominante desce por grau e o baixo salta para a fundamental nova; as notas da 6ª aumentada se abrem em oitava sobre o 5º grau. O ouvido é enganado até o acorde seguinte — e é isso que permite subir meio tom (ré → mi♭) num só passo." },

    { p: "Três passagens românticas usam a tríade aumentada (sol–si–ré♯ = mi♭–sol–si) para chegar a lá♭ maior sem confirmá-lo com V–I. Em qual a falta de confirmação é uma escolha que funciona, e não um erro?",
      o: [
        op("C maior", "E5/2 D5/2 C5/2 Eb5/2~ Eb5/2 D#5/2 E5/1 D5/1 C5/1 B4/1 C5/4", "C3/2 G2/2 C3/2 G2/2 Ab2/2 G2/2 C3/1 F3/1 G3/1 G3/1 C3/4", "I V I V+=Ab:V+6 I V+6=C:V+ I ii6 I64 V7 I", { texto: "lá♭ tocado e deixado; cadência em dó" }),
        op("C maior", "E5/2 D5/2 C5/2 Eb5/2~ Eb5/4", "C3/2 G2/2 C3/2 G2/2 Ab2/4", "I V I V+=Ab:V+6 I", { texto: "termina em lá♭",
          por: "A peça termina em lá♭, alcançado só pela tríade aumentada: sem V–I no tom novo, o ouvido ouve o fim como o ♭VI de dó, suspenso — uma surpresa que pede continuação, não um final." }),
        op("C maior", "E5/2 D5/2 C5/2 Eb5/2~ Eb5/2 D#5/2 E5/4", "C3/2 G2/2 C3/2 G2/2 Ab2/2 G2/2 C3/4", "I V I V+=Ab:V+6 I V+6=C:V+ I", { texto: "volta a dó e para",
          por: "Volta a dó, mas também pela tríade aumentada, e para ali: nenhum tom foi confirmado e o ciclo fica no ar. A quebra só funciona se alguma coisa — aqui, o tom principal — tiver uma cadência." }),
      ],
      e: "Em lá♭ a música só passa: dois tempos, sem cadência, e a mesma tríade aumentada (relida como V+ de dó, com o mi♭ reescrito ré♯) leva de volta à tônica, que recebe ii6 – I6/4 – V7 – I. É a quebra romântica da confirmação: os tons do meio dispensam a cadência quando a peça tem um centro firme nas pontas." },
  ]);

  // ================================================================ Modulação na forma

  T.perguntas("modulacao4", [
    { p: "Sequência: o modelo em sol maior (c. 1) é copiado em lá menor e em si menor. Agora você quer parar e firmar ré maior. Qual continuação faz isso?",
      ...op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1", "I IV V I a:i iv V i b:i iv V i"),
      o: [
        op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1 B4/2 F#4/1 E4/1 D4/4", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1 G2/2 A2/1 A2/1 D3/4", "I IV V I a:i iv V i b:i iv V i=D:vi ii6 I64 V7 I"),
        op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1 C#5/2 D5/2", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1 A2/2 D3/2", "I IV V I a:i iv V i b:i iv V i=D:vi V7 I", {
          por: "V7 – I logo depois do si menor repete o gesto com que cada cópia termina (V–i): o ouvido ouve mais um elo, uma tonicização de ré, e não uma chegada. Falta tempo no tom novo e algo que quebre o padrão." }),
        op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1 E5/1 F#5/1 D#5/1 E5/1", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1 C#3/1 F#3/1 G#3/1 C#3/1", "I IV V I a:i iv V i b:i iv V i c#:i iv V i", {
          por: "Mais uma cópia, em dó♯ menor: a sequência continua se afastando de sol e de ré, o padrão vira rotina (três apresentações é o limite clássico) e a frase para num tom a quatro sustenidos que não era o destino." }),
        op("G maior", "B4/1 C5/1 A4/1 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 E5/1 C#5/1 D5/1 B4/2 D5/1 C#5/1 B4/4", "G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 B2/1 G2/2 F#2/1 F#2/1 B2/4", "I IV V I a:i iv V i b:i iv V i iv6 i64 V7 i", {
          por: "A cadência é perfeita, mas em si menor: o si menor deixa de ser pivô e vira tom de chegada (iv6 – i6/4 – V7 – i). O sol do baixo no c. 4 é o mesmo da versão certa — ii6 de ré ou iv6 de si —; quem decide é o lá (V de ré) ou o fá♯ (V de si) que vem depois." }),
      ],
      e: "O si menor que fecha a 2ª cópia é relido como vi de ré, e a frase quebra o padrão: ii6 – I6/4 – V7 – I, com outro ritmo harmônico (o 6/4 cadencial, o baixo que se sustenta). A sequência suspende a tonalidade; quem a encerra é a reinterpretação da última cópia e uma cadência que não se parece com as cópias." },

    { p: "Período modulante em fá maior: o antecedente (c. 1–2) termina em semicadência e é igual nas quatro versões; o consequente começa como ele e deve cadenciar em dó maior no c. 5. Qual está correta?",
      o: [
        op("F maior", "C5/2 Bb4/1 A4/1 D5/2 C5/2 C5/1 Bb4/1 A4/1 A4/1 D5/1 C5/1 D5/2 C5/1 B4/1 C5/2", "F2/2 G2/1 A2/1 Bb2/2 C3/2 F2/1 G2/1 A2/1 D3/1 B2/1 C3/1 F3/2 G3/1 G3/1 C3/2", "I V43 I6 IV V I V43 I6 vi=C:ii V65 I ii6 I64 V7 I"),
        op("F maior", "C5/2 Bb4/1 A4/1 D5/2 C5/2 C5/1 Bb4/1 A4/1 D5/1 C#5/1 D5/1 D5/1 C#5/1 D5/2", "F2/2 G2/1 A2/1 Bb2/2 C3/2 F2/1 G2/1 A2/1 Bb2/1 A2/1 D3/1 G2/1 A2/1 D2/2", "I V43 I6 IV V I V43 I6 ii6=d:iv6 V i iv V7 i", {
          por: "O consequente vai a ré menor (ii6 de fá = iv6 de ré, V, i) e cadencia lá: a cadência é perfeita, mas no tom errado. O plano pede dó (o V) no c. 5 — num período modulante em maior, o destino normal é a dominante." }),
        op("F maior", "C5/2 Bb4/1 A4/1 D5/2 C5/2 C5/1 Bb4/1 A4/1 G4/1 D5/1 C5/1 D5/2 C5/1 B4/1 C5/2", "F2/2 G2/1 A2/1 Bb2/2 C3/2 F2/1 G2/1 A2/1 C3/1 B2/1 C3/1 F3/2 G3/1 G3/1 C3/2", "I V43 I6 IV V I V43 I6 V=C:I V65 I ii6 I64 V7 I", {
          por: "O pivô é o próprio dó maior (V de fá = I de dó): no c. 3 o ouvido o escuta como a dominante de fá — a mesma da semicadência do antecedente — e o tom novo chega sem caminho. O pivô pré-dominante (ré menor, vi = ii) aponta para o sol maior que vem depois." }),
        op("F maior", "C5/2 Bb4/1 A4/1 D5/2 C5/2 C5/1 Bb4/1 A4/1 A4/1 D5/1 C5/1 D5/2 E5/1 D5/1 E5/2", "F2/2 G2/1 A2/1 Bb2/2 C3/2 F2/1 G2/1 A2/1 D3/1 B2/1 C3/1 F3/2 G3/1 G3/1 C3/2", "I V43 I6 IV V I V43 I6 vi=C:ii V65 I ii6 I64 V7 I", {
          por: "Tudo certo até o último acorde, mas a melodia termina no mi5 (3ª de dó): V7 – I com a 3ª no soprano é cadência imperfeita. A chegada ao tom novo pede cadência perfeita, com a tônica nova na melodia." }),
      ],
      e: "Ré menor (vi de fá = ii de dó) entra no último tempo do c. 3; o si♮ vem no baixo, no V65 de dó, e ainda há ii6 e o 6/4 cadencial antes do V7 → I com dó no soprano. A assimetria entre as frases — semicadência em fá, cadência perfeita em dó — é a própria forma do período modulante.",
      verificar: { perfil: { ...P4, mod_pivo_predominante: "erro" }, contexto: { nivel: 6, plano: { semicadencia: 2, cadencia: 5, tomFinal: "C maior" }, planoTons: [[1, "F maior"], [5, "C maior"]], modulacao: { para: "C maior", tipo: "pivo" } } } },

    { p: "Uma frase em ré maior fecha em cadência perfeita (c. 2) e a seguinte começa direto em si♭ maior (♭VI), sem pivô nem dominante. Por que a mudança não soa como erro?",
      ...op("D maior", "F#5/2 E5/1 D5/1 B4/1 C#5/1 D5/2 D5/2 C5/1 Bb4/1 G4/1 A4/1 Bb4/2", "D3/2 E3/1 F#3/1 G3/1 A3/1 D3/2 Bb2/2 C3/1 D3/1 Eb3/1 F3/1 Bb2/2", "I V43 I6 IV V I Bb:I V43 I6 IV V I"),
      o: [
        "A cadência perfeita fecha a frase (o ouvido aceita um recomeço), a frase seguinte é a mesma, uma 3ª maior abaixo, e o ré5 — tônica de ré, 3ª de si♭ — atravessa a emenda no soprano",
        { texto: "Porque si♭ maior é tom vizinho de ré maior", por: "Ré maior tem dois sustenidos e si♭ maior dois bemóis: quatro acidentes de distância. Si♭ é o ♭VI, uma mediante cromática — longe no círculo das quintas." },
        { texto: "Porque o ré maior final funciona como pivô (I de ré = III de si♭)", por: "Ré maior não existe em si♭ maior (tem fá♯; o III de si♭ é ré menor). Não há acorde com duas leituras: a passagem é direta." },
        { texto: "Porque o baixo prepara si♭ com a dominante do tom novo", por: "Não há fá7 antes do si♭: o baixo vai do ré da cadência direto ao si♭2. A dominante de si♭ só aparece depois que o tom novo já começou." },
      ],
      e: "A modulação direta troca a ponte harmônica pela articulação de frase: depois de uma cadência perfeita o ouvido aceita um novo começo, e a repetição da frase diz que é a mesma música sob outra luz. A nota comum no soprano (ré) ainda costura as duas frases. Use a direta onde a forma articula; no meio de uma frase, o mesmo salto soaria como engano." },
  ]);

  // ================================================================ Nona de dominante e acordes raros

  T.perguntas("nona", [
    { p: "Sol maior, IV – V9 – I, com a nona do V9 (mi) no soprano. Qual destas versões trata a nona corretamente?",
      o: [
        op("G maior", "B4/2 E5/2~ E5/2 D5/2", "G2/2 C3/2 D3/2 G2/2", "I IV V9 I"),
        op("G maior", "B4/2 E5/2~ E5/2 G5/2", "G2/2 C3/2 D3/2 G2/2", "I IV V9 I", {
          por: "O mi5 é preparado (3ª do IV) e mantido sobre o V9, mas salta para sol5 em vez de descer: a nona fica sem resolução. Como a 7ª, ela é uma dissonância de tendência descendente." }),
        op("G maior", "B4/2 E5/2~ E5/2 D5/2", "G2/2 C3/2 D3/2 E3/2", "I IV V9 vi", {
          por: "A nona desce ao ré5, mas sobre o mi3 do vi: ré contra mi é uma 7ª — a dissonância \"resolve\" em outra dissonância, e o ré nem pertence ao vi (mi–sol–si). Para a nona resolver, o acorde seguinte precisa ter a nota um grau abaixo dela." }),
        op("G maior", "B4/2 G4/2 E5/2 D5/2", "G2/2 C3/2 D3/2 G2/2", "I IV V9 I", {
          por: "Sobre o IV o soprano está em sol4 e salta uma 6ª para atacar a nona: sem preparação (nem nota comum, nem grau), o mi5 soa como apojatura, não como membro preparado do acorde." }),
      ],
      e: "O mi5 entra como 3ª do IV (consonante), fica preso quando o baixo vai ao ré — vira a nona do V9 — e desce ao ré5, a 5ª do I, quando o baixo chega ao sol. Preparar como nota comum, manter sobre o V e descer por grau: é o tratamento da nona nos tratados do século XIX.",
      verificar: { perfil: trecho({ ...NONA, aum_aproximacao: "erro" }), contexto: { nivel: 6, plano: {} } } },

    { p: "Dó maior, IV – V7 – I. Sobre o sol do baixo (com a 7ª, fá, numa voz interna), o soprano salta ao mi5 e desce ao ré5 antes do I. Como ler o mi5?",
      ...op("C maior", "C5/2 A4/2 E5/1 D5/1 C5/2", "C3/2 F3/2 G2/2 C3/2", "I IV V7 I"),
      o: [
        "Apojatura (6–5) sobre o V7: nota melódica que resolve no ré, a 5ª do acorde, sobre o mesmo baixo",
        { texto: "Acorde de 13ª (V13): o mi é membro do acorde", por: "O mi resolve no ré antes de a harmonia mudar, sobre o mesmo sol: é a 6ª do baixo descendo à 5ª. O \"V13\" da prática comum é quase sempre isto — uma apojatura ou um retardo sobre o V7." },
        { texto: "A nona do V9", por: "A nona de sol é lá, não mi. O mi está uma 13ª (6ª composta) acima do baixo." },
        { texto: "Acorde de 11ª (V11)", por: "A 11ª de sol é dó, não mi; e a \"11ª\" da prática comum também se lê como nota melódica (o retardo 4–3 sobre o V)." },
      ],
      e: "11ª e 13ª são raras na prática comum: o que aparece com esses nomes é, em geral, um V7 com a 6ª (ou a 4ª) do baixo como apojatura ou retardo. Aqui o mi chega por salto, no tempo forte, e desce por grau sobre o mesmo baixo — a definição de apojatura. Ler como nota melódica diz como tratá-la: ela precisa resolver." },

    { p: "Três passagens em sol maior quebram a resolução da nona. Em qual a quebra é uma escolha de estilo — a de Satie e Debussy — e não um erro?",
      o: [
        op("G maior", "B4/2 E5/2~ E5/2 D5/2 D5/1 E5/1 F#5/1 G5/1 F#5/2 G5/2", "G2/2 C3/2 D3/2 G2/2 C3/1 D3/1 E3/1 F#3/1 D3/2 G2/2", "I IV V9 I IV9 V9 vi9 viiø9 V7 I", { texto: "nonas paralelas no c. 3" }),
        op("G maior", "B4/2 E5/2~ E5/2 B4/2 C5/2 A4/2 B4/4", "G2/2 C3/2 D3/2 G2/2 A2/2 D3/2 G2/4", "I IV V9 I ii V I", { texto: "uma nona que salta",
          por: "Uma nona isolada que salta (mi5 → si4) numa frase toda clássica — o resto, até a cadência ii – V – I, segue a regra. Sem outra lógica que a substitua, a falta de resolução soa como descuido." }),
        op("G maior", "B4/2 E5/2~ E5/1 F#5/1 G5/2~ G5/2 F#5/2 G5/4", "G2/2 C3/2 D3/1 D3/1 G2/2 E3/2 D3/2 G2/4", "I IV V9 V7 I vi V7 I", { texto: "uma nona que sobe",
          por: "A nona sobe ao fá♯5 sobre o próprio ré: \"resolve\" para cima, na sensível, contra a tendência da dissonância. Não é paralelismo nem cor — é a nona tratada como se fosse a sensível." }),
      ],
      e: "O V9 do c. 2 é clássico; no c. 3 o soprano anda em nonas paralelas com o baixo (ré/dó, mi/ré, fá♯/mi, sol/fá♯), cada nona indo para outra. O paralelismo é sistemático — o acorde inteiro se desloca com a melodia (planing) — e a dissonância vira timbre. A quebra funciona porque troca a regra por outra lógica audível, e a frase ainda fecha com V7 – I." },
  ]);

  // ================================================================ Cromatismo linear

  T.perguntas("linear", [
    { p: "Ré maior: o °7 de nota comum (#ii°42 — mi♯–sol♯–si–ré sobre o ré do baixo) enfeita o I no c. 1. Qual soprano está correto?",
      o: [
        op("D maior", "F#5/1 E#5/1 F#5/2 G5/1 E5/1 D5/2", "D3/1 D3/1 D3/2 G2/1 A2/1 D3/2", "I #ii°42 I IV V I"),
        op("D maior", "F#5/1 F5/1 F#5/2 G5/1 E5/1 D5/2", "D3/1 D3/1 D3/2 G2/1 A2/1 D3/2", "I #ii°42 I IV V I", {
          por: "Fá♮5 não pertence ao acorde (mi♯–sol♯–si–ré): a grafia esconde a função. A nota é a bordadura inferior elevada do fá♯ — mi♯ — e se escreve assim porque volta ao fá♯." }),
        op("D maior", "F#5/1 E#5/1 A4/2 G5/1 E5/1 D5/2", "D3/1 D3/1 D3/2 G2/1 A2/1 D3/2", "I #ii°42 I IV V I", {
          por: "O mi♯5 não volta: salta para lá4 (uma 5ª aumentada na escrita) e deixa a dissonância contra o baixo sem resolução. No cromatismo linear a nota alterada só se justifica pelo movimento mínimo: ela segue por grau ou semitom (mi♯ → fá♯)." }),
      ],
      e: "Fá♯5 → mi♯5 → fá♯5 sobre o ré parado: bordadura inferior cromática, grafada pela resolução (mi♯ sobe ao fá♯). O acorde não muda a função — o I continua I —, só colore a tônica. É o vocabulário mínimo do cromatismo linear: nota comum parada, vozes andando por semitom.",
      verificar: { perfil: trecho(LIN), contexto: { nivel: 6, plano: {} } } },

    { p: "A ônibus em sol maior: o baixo desce sol–fá♯–fá–mi–mi♭–ré e o soprano sobe. No 3º tempo, o mi♭5 é a 7ª de fá7 (♭VII7) — e, em vez de descer, sobe a mi5. Por que isso não é erro?",
      ...op("G maior", "D5/1 D5/1 Eb5/1 E5/1 F5/1 F#5/1 G5/2", "G2/1 F#2/1 F2/1 E2/1 Eb2/1 D2/1 G2/2", "I V65 a:Ger65=G:bVII7 a:i64 G:bVII42 V7 I"),
      o: [
        "Porque o fá7 é também a sexta alemã de lá menor (fá–lá–dó–ré♯): lido assim, o mi♭ é um ré♯ que sobe ao mi do 6/4 de lá — e, na lógica linear, o semitom cromático resolve a dissonância",
        { texto: "Porque a 7ª de qualquer acorde pode subir quando o baixo desce", por: "Não é regra geral: a 7ª continua sendo tendência descendente. O que deixa o mi♭ subir aqui é a dupla leitura do acorde e o movimento cromático contrário das vozes externas." },
        { texto: "Porque mi♭ é a sensível de mi", por: "A sensível fica meio tom diatônico abaixo (ré♯ → mi). Mi♭ → mi é um semitom cromático, a mesma letra alterada; só na leitura enarmônica (o ré♯ da sexta alemã) a nota funciona como sensível." },
        { texto: "Porque o acorde seguinte é o V7 de sol, que contém mi", por: "O acorde seguinte é o 6/4 de lá menor (mi no baixo, lá e dó em cima); o V7 de sol (ré–fá♯–lá–dó) não tem mi e só chega no fim." },
      ],
      e: "A ônibus é condução pura: as vozes externas andam por semitom em movimento contrário e as internas (lá e dó) ficam paradas. Os acordes do meio — V65, fá7, 6/4 de lá menor, fá7 em 4/2 — são consequência das linhas, e a dissonância pode resolver por semitom cromático. O que mantém o ouvido no tom são as pontas: I no começo, V7 → I no fim." },

    { p: "Mi menor: três versões de uma cadeia de dominantes com sétima que desliza por semitons (si7, si♭7, lá7, lá♭7…). Em qual a quebra da função é uma escolha que funciona?",
      o: [
        op("E menor", "E5/1 D#5/1 E5/1 E5/1 D#5/1 D5/1 C#5/1 C5/1 B4/1 C#5/1 D#5/2 E5/4", "E2/1 F#2/1 G2/1 A2/1 B2/1 Bb2/1 A2/1 Ab2/1 G2/1 F#2/1 B2/2 E2/4", "i V43 i6 iv V7 bV7 IV7 bIV7 V7/VI V7/V V7 i", { texto: "pontas firmes; soprano nas terças" }),
        op("E menor", "D#5/1 D5/1 C#5/1 C5/1 B4/1 Bb4/1 A4/1 G#4/1", "B2/1 Bb2/1 A2/1 Ab2/1 G2/1 Gb2/1 F2/1 E2/1", "V7 bV7 IV7 bIV7 V7/VI bIII7 bII7 V7/iv", { texto: "só a cadeia",
          por: "A cadeia começa no meio (si7) e termina num mi7 — outra dominante. Sem ponto de partida nem de chegada diatônico, o cromatismo não prolonga nada: o ouvido não sabe de onde saiu nem para onde vai." }),
        op("E menor", "E5/1 D#5/1 E5/1 E5/1 F#5/1 F5/1 E5/1 Eb5/1 D5/1 C#5/1 D#5/2 E5/4", "E2/1 F#2/1 G2/1 A2/1 B2/1 Bb2/1 A2/1 Ab2/1 G2/1 F#2/1 B2/2 E2/4", "i V43 i6 iv V7 bV7 IV7 bIV7 V7/VI V7/V V7 i", { texto: "pontas firmes; soprano nas quintas",
          por: "As pontas são as mesmas da versão boa, mas o soprano desliza sobre as quintas dos acordes: mi5/lá2, fá♯5/si2, fá5/si♭2… são quintas paralelas entre as vozes externas, uma atrás da outra. O deslizamento da dissonância é cor; a perda de independência das vozes externas continua sendo erro." }),
      ],
      e: "As pontas são diatônicas e firmes (i – V43 – i6 – iv no começo, V7/V – V7 – i no fim) e, no meio, o soprano desliza em 10ªs com o baixo sobre as terças das dominantes: cada \"sensível\" desce meio tom em vez de subir. A função fica suspensa por um compasso, e as vozes justificam tudo — o cromatismo linear no limite, sem perder a direção tonal." },
  ]);
})(this);
