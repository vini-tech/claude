/* Nível 4 · Modulação: diatônica (pivô), cromática, enarmônica e na forma.
 * Fontes: Aldwell & Schachter (Harmony and Voice Leading), Piston (Harmony), Schoenberg (Harmonielehre;
 * Structural Functions of Harmony), Reger (Beiträge zur Modulationslehre), Open Music Theory 2e (4.15),
 * Hutchinson, Music Theory for the 21st-Century Classroom (caps. 22–23), Rosen (Sonata Forms).
 * Os exemplos são composições didáticas, não transcrições. */
(function (raiz) {
  "use strict";
  const T = raiz.TEMAS || require("../temas.js").TEMAS;
  const M = raiz.Motor || require("../motor.js");
  const R3 = raiz.Regras3 || require("../regras3.js");
  const { TONAL } = T.perfis;
  const F = M.ferramentas;
  const def = M.definirRegra;

  // ------------------------------------------------------------ regras do capítulo

  const mesmoTom = (a, b) => a.tonica.nome === b.tonica.nome && (a.modo === "minor") === (b.modo === "minor");
  const pc = (nome) => ((M.lerAltura(nome.replace(/-/g, "b") + "4").ps % 12) + 12) % 12;

  def("mod_intervalo_melodico", "Intervalo melódico aumentado ou diminuto",
    "A melodia evita saltos aumentados e diminutos (trítono, 2ª aumentada, 4ª diminuta…). O semitom cromático (dó → dó♯ na mesma voz) é permitido — é ele que conduz a modulação cromática —, assim como a reescrita enarmônica de uma nota presa (si♭ → lá♯).",
    function* (ex) {
      for (const v of ex.vozes) for (const [a, b] of v.paresMelodicos()) {
        const iv = F.intervalo(a, b);
        // semitom cromático (dó → dó♯, dó → dó♭) e reescrita enarmônica da mesma altura (si♭ → lá♯)
        if (iv.nome === "A1" || iv.nome === "d1" || (iv.semitons === 0 && a.ps === b.ps)) continue;
        if (iv.qual[0] === "A" || iv.qual[0] === "d") yield [ex.compassoDe(b.inicio), `${v.nome}: ${F.nomeIntervalo(iv)} de ${a.nome} para ${b.nome}`, [a, b]];
      }
    }, { porque: "Saltos aumentados e diminutos são difíceis de cantar e apontam para tons que a harmonia não confirma. O semitom cromático é outra coisa: ele altera a mesma nota e mostra ao ouvido, numa voz só, que a escala mudou.",
      corrigir: "Troque o salto por um intervalo justo, maior ou menor; se a nota alterada é a sensível nova, faça-a chegar pela mesma letra (fá → fá♯) ou por grau." });

  def("mod_falsa_relacao", "Falsa relação",
    "A nota alterada da modulação aparece na mesma voz que tinha a forma natural (fá → fá♯ no soprano), e não em vozes diferentes em acordes vizinhos (fá no soprano, fá♯ no baixo).",
    function* (ex) {
      const vs = ex.vozes;
      if (vs.length < 2) return;
      const vistos = new Set();
      for (let j = 0; j < vs.length; j++) for (let i = 0; i < vs.length; i++) {
        if (i === j) continue;
        for (const b of vs[j].notas) {
          const a = vs[i].soandoEm(b.inicio - 1), agora = vs[i].soandoEm(b.inicio);
          for (const x of [a, agora]) {
            if (!x || x.altura.letra !== b.altura.letra || x.altura.alter === b.altura.alter) continue;
            // a própria voz faz a inflexão até a nota nova: não é falsa relação
            if (agora && agora !== x && agora.altura.nome === b.altura.nome) continue;
            const chave = [vs[i].notas.indexOf(x), i, vs[j].notas.indexOf(b), j].join();
            if (vistos.has(chave)) continue;
            vistos.add(chave);
            yield [ex.compassoDe(b.inicio), `${x.nome} (${vs[i].nome}) e ${b.nome} (${vs[j].nome}): a mesma nota em duas formas, em vozes diferentes`, [x, b]];
          }
        }
      }
    }, { porque: "Quando a forma natural e a alterada da mesma nota soam em vozes diferentes, uma logo depois da outra, o ouvido ouve as duas escalas ao mesmo tempo: a mudança de tom vira um choque em vez de uma inflexão.",
      corrigir: "Ponha a alteração na voz que tinha a nota natural (fá → fá♯ no soprano), ou tire a nota natural do acorde anterior." });

  def("mod_pivo_predominante", "Pivô pré-dominante no tom novo",
    "O melhor acorde-pivô é pré-dominante no tom novo (ii, IV; em menor, iv, ii°); evite o pivô que já é a dominante (ou a tônica) do tom novo.",
    function* (ex, ctx) {
      for (const h of R3.harmoniasCifradas(ex, ctx)) {
        if (!h.pivo || !h.cifra) continue;
        const g = h.cifra.grau;
        if (g === 2 || g === 4) continue;
        const c = ex.compassoDe(h.inicio);
        if (g === 5 || g === 7) yield [c, `pivô ${h.texto}: no tom novo ele já é dominante — o ouvido o ouve como V antes de saber que mudou de tom`, [h.baixo]];
        else if (g === 1) yield [c, `pivô ${h.texto}: no tom novo ele é a própria tônica — a chegada fica sem preparação`, [h.baixo]];
        else yield [c, `pivô ${h.texto}: funciona, mas o pivô mais claro é pré-dominante no tom novo (ii ou IV; iv em menor)`, [h.baixo]];
      }
    }, { precisaTom: true, porque: "O pivô pré-dominante já 'aponta' para a dominante do tom novo: a frase segue PD → D → T no tom novo sem que o ouvido perceba a costura. Um pivô que já é V do tom novo soa ao mesmo tempo como estável (no tom velho) e instável (no novo); se for a tônica nova, não há caminho.",
      corrigir: "Procure, entre os acordes comuns aos dois tons, o que é ii ou IV (iv em menor) no tom novo; no tom velho ele costuma ser I, IV ou vi." });

  def("mod_caminho", "Tempo entre o pivô e a cadência",
    "Entre o pivô e a cadência que confirma o tom novo há pelo menos um acorde no tom novo (pivô → … → V → I), para o ouvido se ajustar.",
    function* (ex, ctx) {
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const k = hs.findIndex((h) => h.pivo);
      if (k < 0) return;
      const tom = hs[k].tom;
      for (let i = k + 1; i + 1 < hs.length; i++) {
        const a = hs[i], b = hs[i + 1];
        if (!mesmoTom(a.tom, tom) || !mesmoTom(b.tom, tom)) break;
        if (a.cifra.grau === 5 && a.cifra.membroBaixo === 0 && !a.cifra.secundaria && b.cifra.grau === 1 && b.cifra.membroBaixo === 0) {
          if (i === k + 1) yield [ex.compassoDe(b.inicio), `${hs[k].texto} → ${a.texto} → ${b.texto}: a cadência vem logo depois do pivô, sem tempo para o tom novo se firmar`, [hs[k].baixo, b.baixo]];
          break;
        }
      }
    }, { precisaTom: true, porque: "Os manuais pedem que não se cadencie logo depois do pivô: o ouvido ainda está no tom velho e ouve a cadência como uma tonicização passageira. Um ou dois acordes no tom novo (a pré-dominante, um 6/4 cadencial, uma cadência de engano) dão tempo à mudança.",
      corrigir: "Depois do pivô, passe por mais um acorde do tom novo (ii6, IV, I64 cadencial) antes do V–I." });

  def("mod_nota_comum", "Nota comum segura no soprano",
    "Na modulação por nota comum, o soprano sustenta (ou repete) a mesma nota do último acorde do tom velho para o primeiro do tom novo: é ela que costura os dois tons.",
    function* (ex, ctx) {
      if (!ctx.notaComum) return;
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const h = hs.find((x) => x.mudou);
      if (!h) return;
      const s = ex.vozes[0];
      const antes = s.soandoEm(h.inicio - 1), agora = s.soandoEm(h.inicio);
      if (!antes || !agora || antes.ps !== agora.ps) yield [ex.compassoDe(h.inicio), `na entrada do tom novo (${h.texto}) o soprano ${antes && agora ? `vai de ${antes.nome} a ${agora.nome}` : "não tem nota"}; a nota comum deveria ficar parada`, [antes, agora].filter(Boolean)];
    }, { precisaTom: true, porque: "Sem acorde comum, a única coisa que liga os dois tons é uma nota. Se ela fica no soprano, presa enquanto a harmonia muda por baixo, o ouvido segue o fio e aceita a mudança, por mais distante que seja o tom novo.",
      corrigir: "Escolha uma nota que pertença ao último acorde do tom velho e ao primeiro do novo (mi em dó maior e em mi maior) e deixe-a parada no soprano na troca." });

  def("mod_grafia_enarmonica", "Grafia pela resolução",
    "No pivô enarmônico, as notas escritas seguem a leitura nova (a do tom para onde o acorde resolve): lá♭ vira sol♯ se vai subir para lá.",
    function* (ex, ctx) {
      for (const h of R3.harmoniasCifradas(ex, ctx)) {
        if (!h.pivo || !h.cifra) continue;
        const novo = new Set(R3.membros(h.cifra, h.tom));
        const velho = h.pivo.velho.notas;
        if ([...novo].sort().join() === [...velho].sort().join()) continue;
        for (const v of [ex.vozes[0], ex.vozes[ex.vozes.length - 1]]) {
          const n = v.soandoEm(h.inicio);
          if (n && !novo.has(n.altura.nome)) yield [ex.compassoDe(h.inicio), `${n.nome} está grafado na leitura antiga de ${h.texto}; pela resolução seria ${[...novo].find((x) => pc(x) === pc(n.altura.nome)) || "outra grafia"}`, [n]];
        }
      }
    }, { precisaTom: true, porque: "A grafia mostra ao intérprete para onde cada nota vai: a sensível sobe, a 7ª desce. Escrevendo o acorde na leitura do tom novo, a partitura conta a resolução que o ouvido vai ouvir.",
      corrigir: "Reescreva as notas do pivô pela leitura nova (por exemplo, lá♭ → sol♯, sol♭ → fá♯)." });

  def("mod_plano_de_tons", "Plano de tons",
    "Nos compassos marcados pelo exercício, a harmonia está no tom previsto pelo plano (as cifras dizem em que tom cada acorde está).",
    function* (ex, ctx) {
      if (!ctx.planoTons) return;
      const hs = R3.harmoniasCifradas(ex, ctx).filter((h) => h.cifra);
      const C = ex.duracaoCompasso;
      for (const [comp, nome] of ctx.planoTons) {
        const t = (comp - 1) * C;
        const h = hs.find((x) => x.inicio <= t && t < x.fim) || hs.filter((x) => x.inicio < comp * C && x.inicio >= t)[0];
        if (!h) continue;
        const alvo = M.interpretarTom(nome);
        if (!mesmoTom(h.tom, alvo)) yield [comp, `no compasso ${comp} o plano pede ${nome}, e as cifras estão em ${h.tom.tonica.nome.replace(/-/g, "b")} ${h.tom.modo === "minor" ? "menor" : "maior"}`, [h.baixo]];
      }
    }, { precisaTom: true, porque: "Numa forma tonal, o plano de tons é a arquitetura: cada seção tem o seu tom, e as chegadas a eles são os pontos de articulação. Um tom no lugar errado muda a forma.",
      corrigir: "Confira onde o plano pede cada tom e marque nas cifras a troca (G:… ou um pivô) antes desse compasso." });

  for (const id of ["mod_plano_de_tons"]) M.PRECISA_FIM.add(id);

  // ------------------------------------------------------------ perfis e ajudas

  const BASE = { ...TONAL, mod_intervalo_melodico: "erro", modulacao: "erro" };
  delete BASE.intervalo_melodico_aumentado_diminuto;
  const P1 = { ...BASE, mod_falsa_relacao: "aviso", mod_pivo_predominante: "aviso", mod_caminho: "aviso" };
  const P2 = { ...BASE, mod_falsa_relacao: "erro" };
  const P3 = { ...BASE, mod_falsa_relacao: "aviso", mod_grafia_enarmonica: "aviso" };
  const P4 = { ...BASE, mod_falsa_relacao: "aviso", mod_plano_de_tons: "erro" };
  // contexto de um exemplo: modulação para `para` (ou nenhuma), cadência final no compasso `cad` (0 = sem cadência)
  const cx = (para, tipo, cad, extra = {}) => ({ modulacao: para ? { para, tipo } : null, plano: cad ? { cadencia: cad, ...(para ? { tomFinal: para } : {}) } : {}, planoTons: null, notaComum: false, ...extra });
  // partitura soprano–baixo; `cab` pode trazer "compasso: 3/4\n"
  const pt = (tom, s, b, cab = "") => `${cab}tom: ${tom}\nsoprano: ${s}\nbaixo: ${b}`;
  // cifras de exemplo ([tempo em semínimas, cifra]) a partir de uma cifra por nota do baixo
  function pares(partitura, cifras) {
    const ex = M.lerTexto(partitura);
    const b = ex.vozes[ex.vozes.length - 1];
    const cs = cifras.trim().split(/\s+/);
    return b.notas.map((n, i) => [n.inicio / M.T, cs[i]]);
  }
  const ex = (titulo, partitura, cifras, resto = {}) => ({ titulo, partitura, rotulos: ["soprano", "baixo"], cifras: pares(partitura, cifras), ...resto });
  const lado = (rotulo, partitura, cifras, resto = {}) => ({ rotulo, partitura, cifras: pares(partitura, cifras), ...resto });
  const tab = (cab, linhas) => `<table class="tabela-modos"><thead><tr>${cab.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  // ================================================================ 1. diatônica (pivô)

  const C1_CG = pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2 E5/2 D5/1 C5/1 B4/1 D5/1 E5/1 C5/1 B4/1 A4/1 G4/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F#3/2 G3/2 C3/2 D3/1 D3/1 G2/2");
  const C1_CG_CIF = "I V43 I6 IV V I vi=G:ii V65 I ii6 I64 V7 I";

  T.inserir(4, {
    id: "modulacao1", titulo: "Modulação I: diatônica (acorde-pivô)",
    antes: [
      { p: "De dó maior para sol maior: qual é o melhor acorde-pivô?", o: ["Lá menor (vi em dó = ii em sol)", "Ré maior (V/V em dó = V em sol)", "Sol maior (V em dó = I em sol)", "Fá maior (IV em dó)"],
        e: "Lá menor é diatônico nos dois tons e, em sol, é pré-dominante: ele já aponta para o ré maior que vem depois. Ré maior não é acorde comum (tem fá♯, que dó não tem); sol maior é comum, mas já é a tônica nova, e a chegada fica sem caminho; fá maior não existe em sol maior." },
      { p: "O que separa uma modulação de uma tonicização?", o: ["Uma cadência no tom novo, seguida de música que continua nele", "O número de acidentes na passagem", "O uso de uma dominante secundária", "A presença de um acorde de sétima"],
        e: "Uma dominante secundária (V/V → V) tonicaliza: o ouvido continua no tom principal. Só uma cadência no tom novo — e, de preferência, a permanência nele — faz o ouvido trocar de centro. Entre as duas pontas há uma zona cinzenta (a tonicização longa, sem cadência)." },
      { p: "Quais são os tons vizinhos de lá menor?", o: ["Dó maior, ré menor, mi menor, fá maior e sol maior", "Dó maior, lá maior, mi maior, ré menor e mi menor", "Mi menor, si menor, ré menor, sol menor e dó menor", "Lá maior, ré maior, mi maior, fá♯ menor e dó♯ menor"],
        e: "Tons vizinhos são os que diferem da armadura em no máximo um acidente; na prática, os tons cujas tônicas são tríades maiores ou menores do próprio tom: III, iv, v, VI e VII em menor (dó, ré, mi, fá, sol). Entre eles há acordes comuns de sobra — por isso a modulação diatônica é o caminho natural." },
    ],
    objetivo: "Levar uma frase de um tom a um tom vizinho por acorde-pivô, com a nota nova na mesma voz e uma cadência que convença o ouvido — e saber quando (e por que) encurtar esse caminho.",
    ouvir: [
      "Bach, Oratório de Natal BWV 248, coral “Ermuntre dich, mein schwacher Geist”: de sol a ré por acorde-pivô (o sol maior é I em sol e IV em ré)",
      "Bach, Invenção nº 1 em dó, BWV 772: cadências em sol (V) e em lá menor (vi) antes da volta a dó",
      "Mozart, Sonata K. 545, 1º mov.: a exposição sai de dó e firma sol maior para o 2º tema",
      "Corais de Bach (qualquer edição Riemenschneider): frases que cadenciam no V ou no vi e voltam logo ao tom principal",
    ],
    esboco: "Sem consultar a aula: escreva só as cifras de um caminho de seis acordes de dó maior a sol maior. Qual acorde você leu nos dois tons? Ele era pré-dominante no tom novo?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Um acorde que pertence aos dois tons", html: `
        <p>Para a tradição escolar (Piston, Aldwell &amp; Schachter; o catálogo de Reger, <i>Beiträge zur Modulationslehre</i>, que termina cada modulação com um “Cadência!”), modular é <b>mudar o centro tonal de modo que o ouvido aceite o novo</b>. A modulação diatônica faz isso pelo caminho mais suave: um <b>acorde-pivô</b>, diatônico nos dois tons, que o ouvido escuta no tom velho e, depois, reinterpreta no novo. Schoenberg descreve o mesmo processo em três etapas: <b>neutralizar</b> (o acorde comum), apresentar o <b>acorde característico</b> do tom novo (o que tem a nota que o distingue) e <b>cadenciar</b>.</p>
        <h3>O procedimento</h3>
        <ol>
          <li><b>Firmar o tom de partida</b> — uma expansão de tônica ou uma cadência. Não há modulação se ainda não há tom.</li>
          <li><b>Escolher o pivô</b>: um acorde com a mesma fundamental e a mesma qualidade nos dois tons. O melhor é <b>pré-dominante no tom novo</b> (ii, IV; em menor, iv); o segundo melhor é tônica (ou prolongação de tônica) no velho e pré-dominante no novo (I = IV). <b>Evite o pivô que é V (ou I) do tom novo</b>: ele soa ao mesmo tempo estável e instável, e a chegada perde o caminho.</li>
          <li><b>Apresentar a nota característica</b> — em dó → sol, o fá♯; em dó → fá, o si♭ — <b>na mesma voz</b> que cantava a forma natural (fá → fá♯ no soprano), para não criar falsa relação. Normalmente ela vem na dominante do tom novo, logo depois do pivô.</li>
          <li><b>Não cadenciar logo depois do pivô</b>: dê ao ouvido um ou dois acordes no tom novo (ii6, I6/4 cadencial, até uma cadência de engano).</li>
          <li><b>Confirmar</b> com V(7) → I em estado fundamental — a cadência perfeita — e, numa peça, <b>continuar</b> no tom novo.</li>
        </ol>
        <p>Como achar o pivô na análise (e na composição): leia as cifras no tom velho até elas “pararem de fazer sentido”; volte um acorde e teste-o como pivô; se não servir, volte mais um. Nas cifras do ateliê o pivô se escreve com as duas leituras: <code>vi=G:ii</code>; daí em diante as cifras estão no tom novo.</p>
        <h3>Pivôs para os tons vizinhos</h3>
        ${tab(["Acorde", "em dó maior", "em sol maior", "como pivô"], [
          ["lá menor", "vi", "ii", "<b>o melhor</b>: prolongação de tônica → pré-dominante"],
          ["dó maior", "I", "IV", "bom: tônica → pré-dominante"],
          ["mi menor", "iii", "vi", "possível (tônica → tônica), menos direcional"],
          ["sol maior", "V", "I", "evite: o pivô já é a tônica nova"]])}
        ${tab(["Acorde", "em dó maior", "em lá menor", "como pivô"], [
          ["ré menor", "ii", "iv", "<b>o melhor</b>: pré-dominante nos dois tons"],
          ["fá maior", "IV", "VI", "bom: o VI leva ao iv/ii° e ao V"],
          ["dó maior", "I", "III", "possível"],
          ["sol maior", "V", "VII", "evite: dominante no velho, e o VII não prepara o V de lá"]])}
        ${tab(["Acorde", "em lá menor", "em dó maior", "como pivô"], [
          ["ré menor", "iv", "ii", "<b>o melhor</b>"],
          ["fá maior", "VI", "IV", "<b>o melhor</b>"],
          ["lá menor", "i", "vi", "bom: tônica → prolongação de tônica"],
          ["sol maior", "VII", "V", "evite: o pivô já é a dominante nova"],
          ["dó maior", "III", "I", "evite: o pivô já é a tônica nova"]])}
        <h3>Todos os vizinhos, de dó maior e de lá menor</h3>
        ${tab(["Destino", "Caminho típico (cifras)", "Observação"], [
          ["V (sol)", "I – IV – vi=G:ii – V7 – I", "o destino clássico do modo maior"],
          ["vi (lá menor)", "I – IV – ii=a:iv – V43 – i – iv6 – i64 – V7 – i", "o sol♯ entra na dominante nova"],
          ["iii (mi menor)", "I – IV – vi=e:iv – V43 – i …", "raro no Classicismo, comum como etapa"],
          ["IV (fá)", "I – vi=F:iii – IV – V7 – I (ou I=F:V, veja a quebra)", "não há pivô pré-dominante diatônico: sol menor e si♭ não existem em dó"],
          ["ii (ré menor)", "I – IV=d:III – iv6 – V – i", "também sem pivô pré-dominante; o dó♯ é a nota nova"],
          ["III (dó, de lá menor)", "i – iv – V – i – VI=C:IV – I6 – ii6 – I64 – V7 – I", "o destino clássico do modo menor"],
          ["v (mi menor)", "i – iv – V – i6 – i=e:iv – V43 – i6 …", "o ré♯ entra na dominante nova"],
          ["iv (ré menor)", "i – III=d:VII – VI=d:III … – V – i", "sem pivô pré-dominante; o si♭ é a nota nova"],
          ["VI (fá)", "i – iv=F:vi – ii6 – V7 – I", "sem pivô pré-dominante; ii6 de fá logo depois resolve"]])}
        <p>Repare: só para <b>V, vi e iii</b> (em maior) e <b>III e v</b> (em menor) existe um pivô diatônico pré-dominante. Para os outros vizinhos o pivô é tônica no tom novo ou de função fraca — e é justamente aí que entram os pivôs alterados do próximo capítulo.</p>
        <h3>Tonicização × modulação</h3>
        <p>Um V/V → V tonicaliza a dominante; uma cadência em sol seguida de música em sol modula. Entre as duas há um contínuo: a <b>tonicização longa</b> (vários acordes do tom novo, sem cadência) e a <b>modulação fraca</b> (cadência no tom novo e retorno imediato). Schoenberg leva isso ao extremo — para ele, numa peça só há um tom, e o que chamamos de modulação é a passagem por uma <i>região</i> dele (<i>Structural Functions of Harmony</i>). A pergunta prática é: <b>o ouvido mudou de centro?</b> Para isso, três coisas ajudam (Forte as resume como requisitos): uma dominante do tom novo e a tônica nova em tempos fortes, um pivô bem colocado e, na melodia, um trecho da escala nova (ou a sensível nova em evidência).</p>
        <p>Como o ateliê trabalha a duas vozes, as vozes internas ficam implícitas nas cifras (como no baixo cifrado). O verificador confere o pivô (as duas leituras têm de ser o mesmo acorde), a cadência V–I no tom novo, a falsa relação entre soprano e baixo e — como aviso — se o pivô é pré-dominante e se houve tempo entre o pivô e a cadência.</p>` },

      { tipo: "exemplo", titulo: "De dó a sol pelo vi = ii", intro: "Cinco compassos: dois para firmar dó, um para o pivô e a dominante nova, dois para confirmar sol.",
        camadas: [
          ex("1. Firmar o tom de partida", pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2"), "I V43 I6 IV V I", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "Troca de vozes (E5–D5–C5 contra C3–D3–E3, com V43 de passagem) e uma cadência IV–V–I: dó está firmado em dois compassos."],
              ["decisao", "Termino o c. 2 com o baixo em C4, e não em C3: o salto de 5ª (G3→C3) seguido da descida para o pivô (lá) iria duas vezes para baixo."],
              ["checagem", "Soprano–baixo: 3 – 8 – 6 | 5 – 3 – 8. A 8ª final chega com o soprano por grau."]] }),
          ex("2. O pivô e a dominante nova (ainda uma tonicização)", pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2 E5/2 D5/1 C5/1 B4/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F#3/2 G3/2"), "I V43 I6 IV V I vi=G:ii V65 I", {
            contexto: cx(null, null, 0),
            anotacoes: [[1, 6, "vi = ii"], [1, 7, "fá♯"]],
            notas: [["decisao", "Lá menor (A3, soprano E5): em dó ainda soa como vi, uma prolongação de tônica; em sol é ii, pré-dominante. A nota característica, fá♯, entra logo depois, no baixo do V65 de sol."],
              ["decisao", "No V65 o soprano passa D5 → C5: o dó é a 7ª do acorde e resolve em si (B4) sobre o I de sol."],
              ["rejeitada", "Pivô em mi menor (iii = vi): funciona, mas é tônica nos dois tons e não empurra para a dominante; e o próprio sol maior (V = I) não é pivô — o ouvido o ouviria só como a dominante de dó."],
              ["checagem", "Fá natural (baixo, c. 2) e fá♯ (baixo, c. 3) estão na mesma voz e longe um do outro: sem falsa relação."]],
            pausa: ["Ao fim do c. 4 (primeiro tempo), já modulamos para sol?", "Ainda não: houve pivô e dominante nova, mas a dominante está invertida (V65) e nada nos impede de voltar a dó — sol, afinal, é o V de dó. Por enquanto é uma tonicização. O que transforma isso em modulação é a cadência perfeita em sol."] }),
          ex("3. Confirmar: ii6 – I6/4 – V7 – I em sol", C1_CG, C1_CG_CIF, {
            contexto: cx("G maior", "pivo", 5),
            notas: [["decisao", "Depois do I de sol, mais uma pré-dominante (ii6) e a cadência composta (I6/4 – V7 – I): o ouvido tem dois compassos inteiros no tom novo antes do ponto final."],
              ["decisao", "A melodia desce 3̂–2̂–1̂ de sol (B4–A4–G4) sobre I6/4 – V7 – I: o soprano canta a escala nova."],
              ["rejeitada", "Cadenciar já no c. 4 (vi=ii → V → I): a mudança soaria como uma cadência passageira no V de dó. É o que a seção “Como quebrar” mostra — e o que Bach faz no fim de cada frase de coral."],
              ["checagem", "O 6/4 cai no 1º tempo do c. 5 e resolve no V7 com o mesmo baixo (D3); a cadência final é V7 → I em fundamental, com a tônica nova no soprano."]],
            pausa: ["Qual é o ponto mais agudo da melodia, e onde ele cai em relação à mudança de tom?", "E5, duas vezes: na abertura em dó e de novo no c. 4, sobre o ii6 de sol. A segunda vez marca o começo da confirmação; dali a melodia só desce até a tônica nova."] }),
        ] },

      { tipo: "exemplo", titulo: "Do menor ao relativo maior: lá menor → dó maior", intro: "O destino mais comum do modo menor. Não há nota nova a introduzir — a escala de dó já está em lá menor natural —, então a confirmação depende só da harmonia e da cadência.",
        camadas: [
          ex("lá menor → dó maior pelo VI = IV", pt("A menor", "C5/2 B4/1 C5/1 D5/1 B4/1 A4/2 A4/1 C5/1 E5/2 D5/2 E5/1 D5/1 C5/4", "A2/2 G#2/1 A2/1 D3/1 E3/1 A3/2 F3/2 E3/2 F3/2 G3/1 G3/1 C3/4"), "i V6 i iv V i VI=C:IV I6 ii6 I64 V7 I", {
            contexto: cx("C maior", "pivo", 5),
            notas: [["decisao", "Pivô no fá maior (F3): VI em lá menor, IV em dó — pré-dominante no tom novo. O sol natural (baixo, c. 4) substitui o sol♯ do c. 1 na mesma voz."],
              ["decisao", "Depois do pivô vêm I6, ii6 e o 6/4 cadencial: quatro acordes em dó antes do V7 → I."],
              ["rejeitada", "Pivô em sol maior (VII = V): seria a dominante nova — o ouvido ouviria um VII de lá menor indo para dó, e só depois entenderia; perde-se a costura."],
              ["checagem", "O E5 do c. 3 é o clímax; ele cai sobre o I6 de dó, a primeira tônica do tom novo."]] }),
        ] },

      { tipo: "contraste", titulo: "Tonicização × modulação",
        a: lado("A — tonicização: V65/V e volta a dó", pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2 E5/2 D5/1 C5/1 B4/1 D5/1 C5/2 A4/1 B4/1 C5/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F#3/2 G3/1 F3/1 E3/2 F3/1 G3/1 C3/2"), "I V43 I6 IV V I vi V65/V V V42 I6 IV V I", { contexto: cx(null, null, 5) }),
        b: lado("B — modulação: vi = ii, V65 e cadência em sol", C1_CG, C1_CG_CIF, { contexto: cx("G maior", "pivo", 5) }),
        pergunta: "Os três primeiros compassos são idênticos, e nos dois o fá♯ chega no mesmo lugar. Onde o ouvido decide que mudou (ou não) de tom?",
        comentario: "<p>Em A, o sol maior do c. 4 vira de novo dominante de dó: o baixo desce F3 (V42), a 7ª fá devolve o fá natural e a cadência é em dó. O fá♯ foi só uma cor — uma tonicização do V. Em B, depois do sol maior vêm ii6, I6/4 e V7 de sol: a cadência perfeita no tom novo é o que decide. O mesmo pivô e a mesma dominante servem às duas coisas; quem escolhe é o que vem depois.</p>" },

      { tipo: "quebra", titulo: "Confirmação mínima, pivô na dominante", html: `
        <p><b>Bach, corais.</b> Quase toda frase de coral termina numa cadência; muitas cadenciam no V, no vi ou no iii — e a frase seguinte volta imediatamente ao tom principal. A “modulação” dura o tempo de um pivô, uma dominante e uma fermata. Pela regra escolar seria uma modulação fraca (ou uma tonicização com cadência); no coral, é o que dá variedade às cadências sem perder o tom da peça. A quebra é de escala: a confirmação longa é coisa de forma grande (o 2º tema de uma sonata), não de uma frase de quatro compassos.</p>
        <p><b>O pivô na dominante.</b> Para ir ao IV, o modo maior não tem pivô pré-dominante diatônico, e a solução histórica mais comum é justamente a que os manuais desaconselham: o <b>I vira V do IV</b>, e a 7ª (si♭ em dó) o confirma. O efeito é o de uma dominante secundária que não volta — por isso o IV soa como um lugar de repouso “mais baixo”, menos como conquista. É o que se ouve, por exemplo, nos trios e nas seções centrais que vão à subdominante.</p>
        <p><b>Voltar antes da cadência.</b> No extremo oposto, um compositor pode preparar tudo (pivô, dominante nova) e não cadenciar — a modulação abortada do contraste A. Ela cria uma expectativa que a volta frustra: o recurso preferido das transições que fingem chegar antes de chegar.</p>`,
        exemplos: [
          lado("À maneira de um coral: cadência em sol logo depois do pivô, e volta imediata a dó", pt("C maior", "E5/1 D5/1 E5/1 C5/1 A4/2 B4/2 C5/1 A4/1 E5/1 D5/1 C5/4", "C3/1 B2/1 C3/1 A2/1 D3/2 G2/2 C3/1 F3/1 G3/1 G3/1 C3/4"), "I V6 I vi=G:ii V I C:I IV I64 V I", {
            perfil: { ...P1, mod_caminho: "info" }, contexto: cx("G maior", "pivo", 0, { plano: { cadencia: 4 } }),
            comentario: "vi=ii → V → I em dois tempos e meio: a cadência em sol fecha a primeira frase, e a segunda recomeça em dó como se nada tivesse acontecido — o sol maior final é, afinal, o V de dó. O verificador marca, como informação, a cadência logo depois do pivô." }),
          lado("Para a subdominante com o pivô na dominante: I de dó = V de fá", pt("C maior", "E5/2 F5/1 D5/1 E5/2~ E5/2 F5/1 G5/1 F5/1 E5/1 F5/4", "C3/2 F2/1 G2/1 C3/2 Bb2/2 A2/1 Bb2/1 C3/1 C3/1 F2/4"), "I IV V I=F:V V42 I6 ii6 I64 V7 I", {
            perfil: { ...P1, mod_pivo_predominante: "info" }, contexto: cx("F maior", "pivo", 4),
            comentario: "O dó maior do c. 2 é I de dó e V de fá; o si♭ no baixo (V42) desfaz a dúvida, e o mi do soprano, preso, sobe a fá como sensível nova. Funciona — mas repare que nada no c. 2 avisa que a música vai sair de dó: a mudança só se revela no si♭." }),
        ] },
    ],
    exercicios: [
      { id: "pv1", titulo: "Completar: de dó maior a lá menor", modo: "completar", perfil: P1, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "A menor", tipo: "pivo" }, plano: { cadencia: 5, tomFinal: "A menor" } },
        cifrasAluno: true, cifrasIniciais: "I I6 IV V I",
        instrucoes: "<p>O baixo está pronto, e o soprano e as cifras dos compassos 1 e 2 (até o 1º tempo) também. No 3º tempo do c. 2 escolha o <b>acorde-pivô</b> (escreva as duas leituras, como <code>ii=a:iv</code>), depois a dominante de lá menor e a cadência perfeita no c. 5. Escreva o soprano dali até o fim.</p><p>Dica: o baixo já diz muito — ré no pivô, si sob a dominante (que inversão?), fá–mi–mi–lá no fim.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/1 C5/1 A4/1 B4/1 C5/2\nbaixo: C3/1 E3/1 F3/1 G3/1 C3/2 D3/2 B2/2 A2/2 F2/2 E2/1 E2/1 A2/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 C5/1 A4/1 B4/1 C5/2 F5/2 E5/1 D5/1 C5/2 D5/2 C5/1 B4/1 A4/4\nbaixo: C3/1 E3/1 F3/1 G3/1 C3/2 D3/2 B2/2 A2/2 F2/2 E2/1 E2/1 A2/4",
        solucaoCifras: "I I6 IV V I ii=a:iv V43 i iv6 i64 V7 i",
        comentarioSolucao: "Ré menor é ii em dó e iv em lá: pré-dominante nos dois tons. O si do baixo pede V43 de lá (mi–sol♯–si–ré, com a 5ª no baixo); a melodia desce de F5 a A4, passando pela 7ª (D5) do V43 e pelo 6/4 cadencial (C5–B4 sobre mi)." },
      { id: "pv2", titulo: "Menos apoio: de ré menor a fá maior", modo: "menos apoio", perfil: P1, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "F maior", tipo: "pivo" }, plano: { cadencia: 5, tomFinal: "F maior" } },
        cifrasAluno: true,
        instrucoes: "<p>Só o baixo é dado. Escreva todas as cifras e o soprano: firme ré menor nos dois primeiros compassos, encontre o pivô para fá maior (o relativo maior, III) e cadencie em fá no c. 5.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/2 C#3/1 D3/1 Bb2/1 A2/1 D3/2 G3/1 E3/1 F3/2 Bb2/2 C3/1 C3/1 F2/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/2 E5/1 D5/1 D5/1 C#5/1 D5/2 Bb4/1 C5/1 A4/2 G4/2 A4/1 G4/1 F4/4\nbaixo: D3/2 C#3/1 D3/1 Bb2/1 A2/1 D3/2 G3/1 E3/1 F3/2 Bb2/2 C3/1 C3/1 F2/4",
        solucaoCifras: "i V6 i iv6 V i iv=F:ii V65 I ii6 I64 V7 I",
        comentarioSolucao: "O sol do c. 3 é sol menor: iv em ré, ii em fá — o pivô ideal. O mi seguinte já é a sensível de fá, no V65; o dó♯ do c. 1 e o dó natural do c. 4 ficam no baixo, longe um do outro." },
      { id: "pv3", titulo: "Restrição: harmonizar uma melodia que vai a mi menor", modo: "restrição", perfil: { ...P1, mod_pivo_predominante: "erro" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "pivo", ate: 6 }, plano: { cadencia: 6, tomFinal: "E menor" } },
        cifrasAluno: true,
        instrucoes: "<p>A melodia é dada: ela começa em dó maior e termina em mi menor (o iii). Escreva o baixo e as cifras. <b>Restrição:</b> o pivô tem de ser <b>pré-dominante em mi menor</b> (o verificador recusa outro), e a cadência perfeita em mi menor chega até o c. 6.</p><p>Qual acorde de dó maior é iv em mi menor? Onde a melodia permite colocá-lo?</p>",
        texto: "tom: C maior\ncf: soprano\nsoprano: C5/2 B4/1 C5/1 A4/1 B4/1 C5/2 E5/2 D#5/2 E5/2 A4/2 B4/2 D#5/2 E5/4\nbaixo:", duracao: 1, alvoCompassos: 6,
        solucao: "tom: C maior\ncf: soprano\nsoprano: C5/2 B4/1 C5/1 A4/1 B4/1 C5/2 E5/2 D#5/2 E5/2 A4/2 B4/2 D#5/2 E5/4\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F#3/2 E3/2 C3/2 B2/2 B2/2 E2/4",
        solucaoCifras: "I V43 I6 IV V I vi=e:iv V43 i iv6 i64 V7 i",
        comentarioSolucao: "O mi5 do c. 3 cabe em lá menor (vi em dó = iv em mi). O ré♯ que vem a seguir pede a dominante de mi: com o baixo em fá♯ ela é V43 e resolve no i. O I de dó (= VI de mi) também conteria o mi5, mas não é pré-dominante — a restrição o exclui." },
      { id: "pv4", titulo: "Livre: de lá menor à dominante menor", modo: "livre", perfil: P1, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "pivo" }, plano: { cadencia: 5, tomFinal: "E menor" } },
        cifrasAluno: true, alvoCompassos: 5,
        instrucoes: "<p>Componha as duas vozes e as cifras: cinco compassos que firmem lá menor e modulem para mi menor (v), com pivô pré-dominante, ré♯ na mesma voz que tinha ré natural (ou longe dele) e cadência perfeita em mi no c. 5.</p>",
        texto: "tom: A menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: A menor\nsoprano: E5/2 D5/1 A4/1 A4/1 G#4/1 A4/1 E5/1 D#5/1 E5/1 F#5/1 E5/1 E5/2 D#5/2 E5/4\nbaixo: A2/2 B2/1 C3/1 D3/1 E3/1 C3/1 A2/1 F#2/1 G2/1 A2/2 B2/2 B2/2 E2/4",
        solucaoCifras: "i V43 i6 iv V i6 i=e:iv V43 i6 ii°6 i64 V7 i",
        comentarioSolucao: "A tônica de lá é iv em mi: o pivô vem logo depois do i6, como o mesmo acorde em estado fundamental — o ouvido não percebe a costura. Fá♯ e ré♯ entram no V43 de mi; o ii°6 (fá♯–lá–dó sobre lá) e o 6/4 cadencial dão tempo antes do V7 → i." },
      { id: "pv5", titulo: "Quebrar: a cadência de coral", modo: "quebrar", perfil: { ...P1, mod_caminho: "info" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "D maior", tipo: "pivo" }, plano: { cadencia: 4 } },
        cifrasAluno: true, cifrasIniciais: "I V6 I",
        instrucoes: "<p>Duas frases de coral em sol maior sobre o baixo dado. <b>Quebre a regra do “tempo depois do pivô”</b>: no 4º tempo do c. 1 use um pivô para ré maior e cadencie em ré <b>imediatamente</b> (pivô → V → I, fermata no c. 2); a segunda frase volta direto a sol (escreva <code>G:</code> na primeira cifra dela) e fecha com cadência perfeita.</p><p>O verificador vai informar a cadência logo depois do pivô: é a quebra pedida. Pense no porquê: numa frase de coral não há espaço para confirmar, e o tom principal nunca chegou a sair do ouvido.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/1 F#2/1 G2/1 E2/1 A2/2 D3/2 B2/1 C3/1 D3/1 D3/1 G2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 A4/1 G4/1 B4/1 C#5/2 D5/2 D5/1 C5/1 B4/1 A4/1 G4/4\nbaixo: G2/1 F#2/1 G2/1 E2/1 A2/2 D3/2 B2/1 C3/1 D3/1 D3/1 G2/4",
        solucaoCifras: "I V6 I vi=D:ii V I G:I6 IV I64 V7 I",
        comentarioSolucao: "Mi menor (vi em sol = ii em ré) leva ao lá maior com dó♯ no soprano, que sobe a ré: uma cadência perfeita em ré em dois tempos. O ré maior é também o V de sol — por isso a volta (I6 de sol) soa natural: a modulação nunca convenceu de verdade, e não precisava." },
    ],
  });

  // ================================================================ 2. cromática

  const C2_FD = pt("F maior", "A4/2 G4/1 A4/1 D5/1 E5/1 C5/2 C#5/2 D5/2 E5/2 D5/1 C#5/1 D5/4", "F2/2 E2/1 F2/1 Bb2/1 C3/1 A2/2 A2/2 D3/2 G2/2 A2/1 A2/1 D3/4");
  const C2_FD_CIF = "I V6 I IV V I6 d:V i ii°6 i64 V7 i";

  T.inserir(4, {
    id: "modulacao2", titulo: "Modulação II: cromática",
    antes: [
      { p: "Fá maior → ré menor sem acorde-pivô: o I6 de fá (dó no soprano) vai direto para o V de ré. Que voz deve fazer o dó → dó♯?", o: ["A mesma que tinha o dó: o soprano sobe dó → dó♯ → ré", "O baixo, para destacar a nota nova", "Qualquer voz, desde que o dó♯ apareça no tempo forte", "Nenhuma: o dó♯ deve aparecer só depois da tônica nova"],
        e: "A modulação cromática se apoia numa inflexão: a mesma nota, alterada, na mesma voz. Se o dó natural está no soprano e o dó♯ aparece no baixo, as duas formas soam em vozes diferentes, uma logo depois da outra — a falsa relação." },
      { p: "Em dó maior, o fá menor (iv emprestado de dó menor) pode ser pivô para qual tom, como pré-dominante?", o: ["Mi♭ maior (onde ele é ii)", "Sol maior (onde ele é ii)", "Lá menor (onde ele é iv)", "Fá maior (onde ele é i)"],
        e: "Fá–lá♭–dó é ii em mi♭ maior. O acorde não é diatônico em dó, mas o empréstimo modal o torna familiar ao ouvido: é o “acorde comum alterado”, a ponte para tons a dois ou três acidentes de distância." },
      { p: "Dó maior e mi maior têm em comum só a nota mi. Como se chama a relação entre as duas tríades?", o: ["Mediante cromática", "Relativo maior", "Dominante secundária", "Tons homônimos"],
        e: "Fundamentais a uma 3ª, mesma qualidade, uma nota comum: mediantes cromáticas. Dó maior tem quatro — mi, lá, mi♭ e lá♭ maiores. A modulação por nota comum costuma ligar justamente esses acordes." },
    ],
    objetivo: "Modular sem acorde-pivô diatônico — por inflexão cromática numa voz, por acorde comum alterado (emprestado, napolitano) ou por nota comum — e controlar o efeito: da costura invisível ao deslocamento de cor.",
    ouvir: [
      "Corais de Bach: inflexões cromáticas numa voz (dó → dó♯) que levam do I ao vi sem acorde comum",
      "Beethoven, Sonata “Waldstein” op. 53, 1º mov.: numa peça em dó maior, o 2º tema em mi maior (mediante)",
      "Beethoven, Sonata op. 31 nº 1, 1º mov.: numa peça em sol maior, o 2º tema começa em si maior (III♯)",
      "Schubert, Quinteto de cordas D. 956, 1º mov.: de dó maior ao 2º tema em mi♭ maior",
    ],
    esboco: "Sem consultar a aula: em dó maior, toque I – IV – iv. Que nota mudou, e em que voz? Para que tom o iv poderia levar?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Quando não há acorde comum (ou ele é alterado)", html: `
        <p>A modulação diatônica precisa de acordes comuns; quanto mais longe no círculo das quintas, menos acordes os dois tons dividem. Os manuais (Piston, Kostka &amp; Payne, Hutchinson) agrupam como <b>modulação cromática</b> os procedimentos que dispensam o pivô diatônico. São três famílias.</p>
        <h3>1. Inflexão cromática numa voz</h3>
        <p>Uma voz altera a sua nota por semitom cromático (mesma letra: dó → dó♯, si → si♭) e essa nota alterada é a <b>característica do tom novo</b> — normalmente a sensível nova, já dentro da dominante nova. O acorde anterior pertence ao tom velho; o seguinte, ao novo; não há acorde com duas leituras.</p>
        <ul>
          <li><b>Mesma voz.</b> A forma natural e a alterada ficam na mesma voz (dó → dó♯ no soprano). Em vozes diferentes, em acordes vizinhos, elas formam a <b>falsa relação</b>, que a escrita escolar proíbe.</li>
          <li><b>Direção.</b> A nota elevada continua subindo (dó♯ → ré), a abaixada continua descendo (si♭ → lá): a inflexão já é a condução da sensível.</li>
          <li><b>Confirmação.</b> Como no pivô, a dominante nova e a cadência perfeita — a inflexão só abre a porta.</li>
        </ul>
        ${tab(["Tom velho → novo", "Acorde de saída", "Inflexão", "Chegada"], [
          ["Fá → ré menor", "I6 (dó no soprano)", "dó → dó♯", "V de ré → i"],
          ["Sol → mi menor", "I6 (ré no soprano)", "ré → ré♯", "V de mi → i"],
          ["Dó → lá menor", "V (sol no baixo)", "sol → sol♯", "V6 de lá → i"],
          ["Dó → sol", "IV (fá no baixo)", "fá → fá♯", "V65 de sol → I"],
          ["Dó → mi♭", "IV (lá no soprano)", "lá → lá♭", "iv = ii de mi♭ (acorde alterado)"]])}
        <h3>2. Acorde comum alterado</h3>
        <p>O pivô existe, mas é cromático num dos tons: um <b>empréstimo modal</b> (iv, ♭VI, ii° de dó menor usados em dó maior), a <b>napolitana</b> ou uma <b>dominante secundária</b>. O ouvido já conhece esses acordes como cores do tom velho, e por isso aceita reinterpretá-los. Em dó maior:</p>
        ${tab(["Pivô", "em dó", "no tom novo", "Tom novo"], [
          ["fá–lá♭–dó", "iv (de dó menor)", "ii", "mi♭ maior"],
          ["fá–lá♭–dó", "iv", "vi", "lá♭ maior"],
          ["lá♭–dó–mi♭", "♭VI", "IV", "mi♭ maior"],
          ["ré♭–fá–lá♭", "N6", "IV6", "lá♭ maior"],
          ["ré–fá♯–lá", "V/V", "IV", "lá maior"]])}
        <p>Repare que todos podem ser <b>pré-dominantes no tom novo</b>: a regra do pivô do capítulo anterior continua valendo. No verificador, o acorde comum alterado é um pivô (<code>iv=Eb:ii</code>, <code>N6=F:IV6</code>); a palavra “cromática” fica para a modulação <b>sem</b> acorde de duas leituras.</p>
        <h3>3. Nota comum e mediantes cromáticas</h3>
        <p>Às vezes só <b>uma nota</b> liga os dois tons: ela fica presa (em geral no soprano, às vezes sozinha) enquanto a harmonia muda por baixo. É o caminho típico entre <b>mediantes cromáticas</b> — dó maior → mi maior (pelo mi), dó maior → lá♭ maior (pelo dó). Raras no Barroco e no Classicismo, elas se tornam uma marca do Romantismo; Schubert é o nome mais associado a elas.</p>
        ${tab(["De dó maior para", "Relação", "Nota comum", "Nota que muda"], [
          ["mi maior", "III♯ (mediante superior)", "mi", "sol → sol♯"],
          ["lá maior", "VI♯ (submediante superior)", "mi", "dó → dó♯"],
          ["mi♭ maior", "♭III", "sol", "mi → mi♭"],
          ["lá♭ maior", "♭VI", "dó", "sol → lá♭, mi → mi♭"]])}
        <p>Sem dominante preparando, quem convence é a <b>nota presa</b> e, depois, a cadência no tom novo. A duas vozes, o soprano segura a nota comum; o baixo salta para a fundamental nova.</p>` },

      { tipo: "exemplo", titulo: "Fá maior → ré menor: dó → dó♯ no soprano", intro: "O mesmo baixo (lá) sustenta o último acorde de fá e o primeiro de ré; o que muda é uma nota do soprano.",
        camadas: [
          ex("1. Fá maior até o I6", pt("F maior", "A4/2 G4/1 A4/1 D5/1 E5/1 C5/2", "F2/2 E2/1 F2/1 Bb2/1 C3/1 A2/2"), "I V6 I IV V I6", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "I – V6 – I e IV – V – I6: fá firmado, com o soprano subindo até o mi5 (sensível) e caindo no dó5 sobre o I6."],
              ["decisao", "Termino no I6 (lá no baixo), não no I: o baixo lá vai servir também ao V de ré."],
              ["checagem", "D5 sobre B♭2 e E5 sobre C3: 3ªs; C5 sobre A2: 3ª menor. Nenhuma perfeita por movimento direto com salto."]] }),
          ex("2. A inflexão e a confirmação", C2_FD, C2_FD_CIF, {
            contexto: cx("D menor", "cromatica", 5),
            anotacoes: [[0, 6, "dó"], [0, 7, "dó♯"]],
            notas: [["decisao", "C5 → C♯5 sobre o mesmo lá do baixo: o acorde de fá (I6) vira lá maior (V de ré) pela alteração de uma nota. O dó♯ sobe a ré: inflexão e resolução da sensível num só gesto."],
              ["decisao", "A confirmação é ii°6 – i6/4 – V7 – i, com o soprano em mi5–ré5–dó♯5–ré5: o 4–3 do 6/4 é o próprio ré–dó♯."],
              ["rejeitada", "Pivô diatônico (B♭ = IV em fá e VI em ré): funcionaria, mas é a costura invisível do capítulo anterior. A inflexão é mais curta e mais audível: o ouvido ouve o dó virar dó♯."],
              ["checagem", "Dó natural e dó♯ estão no soprano, em notas seguidas: sem falsa relação. O dó3 do baixo (c. 2) está dois tempos antes, já resolvido."]],
            pausa: ["O acorde de fá maior também existe em ré menor (é o III). Por que não chamar o I6 de pivô (I6=d:III6)?", "Poderia: a análise admite as duas leituras, e as fronteiras entre os tipos de modulação são, em parte, de interpretação. Mas aqui o III6 de ré não faz nada — nenhum ouvinte ouve ré menor no c. 2. O ouvido só muda de centro quando o dó vira dó♯, e é essa inflexão, numa voz, que a passagem põe em primeiro plano."] }),
        ] },

      { tipo: "exemplo", titulo: "Acorde comum alterado: dó maior → mi♭ maior pelo iv = ii", intro: "O iv emprestado de dó menor é uma cor conhecida em dó maior — e é ii em mi♭.",
        camadas: [
          ex("IV – iv = ii – V65 de mi♭", pt("C maior", "E5/2 D5/1 C5/1 A4/1 Ab4/1~ Ab4/2 G4/1 C5/1 G4/1 F4/1 Eb4/4", "C3/2 B2/1 C3/1 F3/1 F3/1 D3/2 Eb3/1 Ab3/1 Bb3/1 Bb3/1 Eb3/4"), "I V65 I IV iv=Eb:ii V65 I IV I64 V7 I", {
            contexto: cx("Eb maior", "pivo", 4),
            anotacoes: [[0, 4, "lá"], [0, 5, "lá♭"]],
            notas: [["decisao", "Sobre o mesmo fá do baixo, IV → iv: o soprano faz lá → lá♭ (inflexão na mesma voz). O fá menor é o pivô: iv emprestado em dó, ii em mi♭."],
              ["decisao", "O lá♭ fica preso e vira a 7ª do V65 de mi♭ (si♭–ré–fá–lá♭ sobre ré); depois desce a sol sobre o I. Uma nota faz três papéis: inflexão, pivô e 7ª da dominante nova."],
              ["rejeitada", "Ir de dó a mi♭ por pivô diatônico: não há tríade comum que seja pré-dominante em mi♭ (fá menor e lá♭ maior não existem em dó maior). O empréstimo é o que torna o caminho curto."],
              ["checagem", "Mi natural (soprano, c. 1) e mi♭ (baixo, c. 3) estão separados por dois compassos; si (c. 1) e si♭ (c. 3) também."]] }),
        ] },

      { tipo: "contraste", titulo: "Inflexão na mesma voz × falsa relação",
        a: lado("A — dó → dó♯ no soprano", C2_FD, C2_FD_CIF, { contexto: cx("D menor", "cromatica", 5) }),
        b: lado("B — dó no soprano, dó♯ no baixo", pt("F maior", "A4/2 G4/1 A4/1 D5/1 E5/1 C5/2 E5/2 F5/2 E5/2 D5/1 C#5/1 D5/4", "F2/2 E2/1 F2/1 Bb2/1 C3/1 A2/2 C#3/2 D3/2 G2/2 A2/1 A2/1 D3/4"), "I V6 I IV V I6 d:V6 i ii°6 i64 V7 i", {
          perfil: { ...P2, mod_falsa_relacao: "info" }, contexto: cx("D menor", "direta", 5) }),
        pergunta: "As duas usam os mesmos acordes até o c. 2 e chegam a ré menor. O que você ouve no c. 3?",
        comentario: "<p>Em A, o dó♯ é a continuação do dó: o ouvido segue uma voz que sobe meio tom e entende a mudança de escala. Em B, o dó5 do soprano é seguido pelo dó♯3 do baixo: as duas formas soam em vozes diferentes e o ouvido registra um choque — a falsa relação. Por isso a regra escolar a proíbe; e por isso mesmo a polifonia inglesa e, mais tarde, compositores românticos a usam quando querem esse atrito (veja “Como quebrar”).</p>" },

      { tipo: "quebra", titulo: "A nota comum como única ponte (Schubert, Beethoven)", html: `
        <p>O Classicismo modula, nas exposições, para o V (ou o III em menor), preparando com pivô e dominante. A partir de Beethoven e sobretudo de Schubert, a relação de <b>mediante</b> passa a disputar esse lugar. Beethoven põe o 2º tema da Sonata “Waldstein” (op. 53) em <b>mi maior</b> numa peça em dó, e o da Sonata op. 31 nº 1 em <b>si maior</b> numa peça em sol; Schubert leva o 2º tema do Quinteto D. 956 de dó a <b>mi♭ maior</b>. Em Schubert é frequente o procedimento mais nu de todos: uma <b>nota presa</b> e a harmonia que desliza por baixo dela para um tom a três ou quatro acidentes de distância, sem dominante preparando.</p>
        <p>O que se quebra é a ideia de que a mudança precisa de uma “ponte funcional”. O efeito também é outro: em vez de uma chegada (dominante → tônica), uma <b>mudança de luz</b> — o mesmo som, de repente, iluminado por outra harmonia. A nota comum é o que impede que isso soe como um erro: o ouvido segue o fio.</p>
        <p>A <b>falsa relação</b> também tem a sua história fora da regra: a polifonia inglesa (Tallis, Byrd, Purcell) cultivava a sétima natural e a elevada em vozes diferentes, quase juntas, na cadência — a chamada falsa relação inglesa.</p>`,
        exemplos: [
          lado("Dó maior → mi maior: o mi fica no soprano, a harmonia sobe uma 3ª maior", pt("C maior", "G4/1 A4/1 B4/1 E5/1~ E5/2 C#5/2 G#4/2 F#4/2 E4/4", "C3/1 A2/1 G2/1 C3/1 E3/2 A2/2 B2/2 B2/2 E3/4"), "I IV6 V I E:I IV I64 V7 I", {
            perfil: { ...P2, mod_nota_comum: "erro" }, contexto: cx("E maior", "nota comum", 4, { notaComum: true }),
            comentario: "Cadência em dó; o mi5 (3ª de dó) fica preso e vira fundamental de mi maior. Não há dominante de mi antes da chegada — a cadência vem depois, para confirmar. O sol do c. 1 e o sol♯ do c. 3 estão no soprano, longe um do outro." }),
          lado("Dó maior → lá♭ maior: o dó fica, o baixo desce uma 3ª maior", pt("C maior", "E5/2 D5/2 C5/2~ C5/2 Db5/2 C5/1 Bb4/1 Ab4/4", "C3/2 G2/2 C3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4"), "I V I Ab:I ii6 I64 V7 I", {
            perfil: { ...P2, mod_nota_comum: "erro" }, contexto: cx("Ab maior", "nota comum", 4, { notaComum: true }),
            comentario: "A tônica de dó vira 3ª de lá♭ maior (♭VI). A sensação é de queda, de escurecimento — o oposto da subida para mi maior do exemplo anterior. As duas mediantes cromáticas mais usadas pelos românticos, a partir da mesma nota de partida." }),
        ] },
    ],
    exercicios: [
      { id: "cr1", titulo: "Completar: de sol maior a mi menor pela inflexão ré → ré♯", modo: "completar", perfil: P2, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "cromatica" }, plano: { cadencia: 5, tomFinal: "E menor" } },
        cifrasAluno: true, cifrasIniciais: "I V43 I6 IV V I I6",
        instrucoes: "<p>O baixo está pronto; o soprano e as cifras dos compassos 1–2 também. O c. 2 termina no I6 de sol, com ré5 no soprano. No c. 3, sobre o mesmo si do baixo, entre em mi menor <b>sem pivô</b>: uma inflexão cromática na mesma voz que tem o ré. Termine com cadência perfeita em mi menor.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 D5/1 E5/1 F#5/1 G5/1 D5/1\nbaixo: G2/2 A2/1 B2/1 C3/1 D3/1 G2/1 B2/1 B2/2 E3/2 A2/2 B2/1 B2/1 E3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 D5/1 E5/1 F#5/1 G5/1 D5/1 D#5/2 E5/2 C5/2 B4/1 D#5/1 E5/4\nbaixo: G2/2 A2/1 B2/1 C3/1 D3/1 G2/1 B2/1 B2/2 E3/2 A2/2 B2/1 B2/1 E3/4",
        solucaoCifras: "I V43 I6 IV V I I6 e:V i iv i64 V7 i",
        comentarioSolucao: "Ré5 → ré♯5 sobre o si: o I6 de sol vira o V de mi. A sensível nova sobe a mi5 sobre o i. Depois, iv – i6/4 – V7 – i, com o soprano dó5 – si4 – ré♯5 – mi5." },
      { id: "cr2", titulo: "Menos apoio: a inflexão no baixo (dó maior → lá menor)", modo: "menos apoio", perfil: P2, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "A menor", tipo: "cromatica" }, plano: { cadencia: 5, tomFinal: "A menor" } },
        cifrasAluno: true,
        instrucoes: "<p>A melodia é dada; escreva o baixo e as cifras. Ela começa em dó maior e termina em lá menor. Repare no si4 preso do c. 2 ao c. 3: é ali que a modulação acontece. Como a melodia não altera nenhuma nota, a <b>inflexão cromática tem de estar no baixo</b> (sem pivô).</p>",
        texto: "tom: C maior\ncf: soprano\nsoprano: E5/2 D5/1 B4/1 C5/2 B4/2~ B4/2 C5/2 D5/2 C5/1 B4/1 A4/4\nbaixo:", duracao: 1, alvoCompassos: 5,
        solucao: "tom: C maior\ncf: soprano\nsoprano: E5/2 D5/1 B4/1 C5/2 B4/2~ B4/2 C5/2 D5/2 C5/1 B4/1 A4/4\nbaixo: C3/2 F3/1 G3/1 E3/2 G3/2 G#3/2 A3/2 D3/2 E3/1 E3/1 A2/4",
        solucaoCifras: "I ii6 V I6 V a:V6 i iv i64 V7 i",
        comentarioSolucao: "O si4 é 3ª do V de dó e 5ª do V de lá: o baixo sobe sol → sol♯ sob ele, e o V de dó vira V6 de lá. A nota comum no soprano e a inflexão no baixo trabalham juntas." },
      { id: "cr3", titulo: "Restrição: de sol maior a mi♭ maior pela nota comum", modo: "restrição", perfil: { ...P2, mod_nota_comum: "erro" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "Eb maior", tipo: "nota comum" }, notaComum: true, plano: { cadencia: 5, tomFinal: "Eb maior" } },
        cifras: ["I", "V65", "I", "IV", "V", "I", "Eb:I", "IV", "I64", "V7", "I"],
        instrucoes: "<p>Baixo e cifras são dados: dois compassos em sol maior e, no c. 3, mi♭ maior (♭VI) sem preparação. Escreva o soprano. <b>Restrição:</b> na troca de tom o soprano segura a nota comum aos dois acordes (o verificador confere). Qual é ela?</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: D5/2 C5/1 B4/1\nbaixo: G2/2 F#2/1 G2/1 C3/1 D3/1 G3/2 Eb3/2 Ab2/2 Bb2/2 Bb2/2 Eb3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: G maior\ncf: baixo\nsoprano: D5/2 C5/1 B4/1 C5/1 A4/1 G4/2~ G4/2 C5/2 G4/2 F4/2 Eb4/4\nbaixo: G2/2 F#2/1 G2/1 C3/1 D3/1 G3/2 Eb3/2 Ab2/2 Bb2/2 Bb2/2 Eb3/4",
        comentarioSolucao: "Sol é tônica de sol maior e 3ª de mi♭ maior: o soprano chega a sol4 na cadência do c. 2 e o segura enquanto o baixo desce de sol a mi♭. A cor muda de uma vez — si natural vira si♭, ré vira mi♭ nas vozes implícitas — e a cadência dos c. 4–5 confirma." },
      { id: "cr4", titulo: "Livre: de lá menor a fá maior pela napolitana", modo: "livre", perfil: P2, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "F maior", tipo: "pivo" }, plano: { cadencia: 6, tomFinal: "F maior" } },
        cifrasAluno: true, alvoCompassos: 6,
        instrucoes: "<p>Componha as duas vozes e as cifras: firme lá menor e module para fá maior (VI) usando a <b>napolitana de lá</b> como acorde comum alterado — que acorde ela é em fá? Escreva o pivô com as duas leituras e cadencie em fá até o c. 6.</p>",
        texto: "tom: A menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: A menor\nsoprano: C5/2 B4/1 C5/1 D5/1 B4/1 A4/2 Bb4/4 A4/2 D5/2 A4/2 G4/2 F4/4\nbaixo: A2/2 G#2/1 A2/1 D3/1 E3/1 A2/2 D3/2 E3/2 F3/2 Bb2/2 C3/2 C3/2 F2/4",
        solucaoCifras: "i V6 i iv V i N6=F:IV6 V65 I ii6 I64 V7 I",
        comentarioSolucao: "Si♭–ré–fá é a napolitana de lá (N6, ré no baixo) e o IV6 de fá: pré-dominante nos dois tons. O si♭4 do soprano fica preso e vira a 7ª do V65 de fá; desce a lá sobre o I." },
      { id: "cr5", titulo: "Quebrar: a falsa relação", modo: "quebrar", perfil: { ...P2, mod_falsa_relacao: "info" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "direta" }, plano: { cadencia: 5, tomFinal: "E menor" } },
        cifrasAluno: true, cifrasIniciais: "I V43 I6 IV V I6",
        instrucoes: "<p>De sol maior a mi menor sobre o baixo dado. <b>Quebre a regra da inflexão na mesma voz</b>: o c. 2 termina no I6 de sol com <b>ré5 no soprano</b>; no c. 3 o ré♯ entra <b>no baixo</b> (V6 de mi), e o soprano salta para outra nota do acorde. Termine com cadência perfeita em mi menor.</p><p>O verificador vai informar a falsa relação: é a quebra pedida. Ouça o atrito do ré contra o ré♯ e compare com a solução do exercício “Completar”.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 D5/1\nbaixo: G2/2 A2/1 B2/1 C3/1 D3/1 B2/2 D#3/2 E3/2 A2/2 B2/1 B2/1 E3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 D5/1 E5/1 F#5/1 D5/2 F#5/2 E5/2 C5/2 B4/1 D#5/1 E5/4\nbaixo: G2/2 A2/1 B2/1 C3/1 D3/1 B2/2 D#3/2 E3/2 A2/2 B2/1 B2/1 E3/4",
        solucaoCifras: "I V43 I6 IV V I6 e:V6 i iv i64 V7 i",
        comentarioSolucao: "Ré5 no soprano, ré♯3 no baixo logo em seguida: a mudança de tom deixa de ser uma inflexão e vira um choque. Num coral escolar é um erro; como gesto expressivo pontual, é um atrito que a polifonia inglesa e muitos românticos cultivaram." },
    ],
  });

  // ================================================================ 3. enarmônica

  const C3_CEB = pt("C maior", "E5/2 D5/1 C5/1 A4/1 B4/1 G4/2 Ab4/2 G4/1 F4/1 G4/1 Ab4/1 F4/1 Eb4/1", "C3/2 B2/1 C3/1 F3/1 G3/1 C4/2 Cb4/2 Bb3/1 Bb3/1 Eb3/1 Ab3/1 Bb3/1 Eb3/1");
  const C3_CEB_CIF = "I V65 I IV V I vii°7=Eb:vii°42 I64 V7 I IV V7 I";

  T.inserir(4, {
    id: "modulacao3", titulo: "Modulação III: enarmônica",
    antes: [
      { p: "O acorde si–ré–fá–lá♭ (vii°7 de dó) pode ser reescrito como sensível de quantos tons diferentes (contando maior e menor do mesmo centro como um)?", o: ["Quatro: dó, mi♭, fá♯ e lá", "Dois: dó e fá♯", "Três: dó, mi e lá♭", "Doze"],
        e: "A sétima diminuta divide a oitava em quatro terças menores iguais: qualquer uma das quatro notas pode ser a sensível. Si → dó, ré → mi♭, mi♯ (= fá) → fá♯, sol♯ (= lá♭) → lá. O som é o mesmo; a grafia e a resolução escolhem o tom." },
      { p: "Lá♭–dó–mi♭–sol♭ é V7 de ré♭. Reescrito como lá♭–dó–mi♭–fá♯, que acorde é, e em que tom?", o: ["Sexta alemã de dó (maior ou menor)", "Sexta alemã de sol", "V7 de dó", "Napolitana de dó"],
        e: "A 7ª menor (lá♭–sol♭) vira 6ª aumentada (lá♭–fá♯): as duas notas se abrem em oitava sobre sol, a dominante de dó. A diferença audível está só na resolução: a 7ª da dominante desce; a 6ª aumentada se abre." },
      { p: "Por que a grafia importa, se o som é o mesmo?", o: ["Porque mostra para onde cada nota resolve: a sensível sobe, a sétima desce", "Porque muda a afinação no piano", "Porque só a grafia antiga é correta", "Não importa: é uma convenção sem efeito"],
        e: "Num teclado temperado lá♭ e sol♯ são a mesma tecla, mas na partitura dizem coisas diferentes: lá♭ tende a descer para sol, sol♯ a subir para lá. A regra escolar é grafar pelo destino; na prática, os compositores muitas vezes mantêm a grafia antiga por legibilidade, e o intérprete precisa ouvir a reinterpretação." },
    ],
    objetivo: "Usar os acordes simétricos ou ambíguos (sétima diminuta, sexta alemã = V7, tríade aumentada) como pivôs que mudam de grafia, para chegar a tons distantes em um ou dois acordes — e saber escrever a passagem pela resolução.",
    ouvir: [
      "Beethoven, Sonata “Patética” op. 13, 1º mov., Introdução (Grave): os acordes de sétima diminuta como eixo da harmonia",
      "Schubert, Lieder e música de câmara: a sexta alemã resolvida como V7 (e o V7 resolvido como sexta alemã) é um procedimento recorrente",
      "Liszt, Sinfonia Fausto, início: o tema construído sobre tríades aumentadas",
      "Wagner, Tristão e Isolda, Prelúdio: o acorde inicial e a ambiguidade de leitura que ele abre",
    ],
    esboco: "Sem consultar a aula: toque si–ré–fá–lá♭ e resolva-o primeiro em dó. Depois toque o mesmo acorde e resolva-o em lá menor e em mi♭. Que nota subiu meio tom em cada caso?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Um som, várias grafias", html: `
        <p>No temperamento igual, alguns acordes são <b>simétricos</b> ou <b>ambíguos</b>: o mesmo conjunto de teclas pode ser grafado — e resolvido — de mais de uma maneira. A modulação enarmônica usa um desses acordes como pivô: o ouvido o escuta numa leitura e a resolução revela outra. Ela alcança tons a cinco ou seis acidentes de distância num só passo; Reger, nas <i>Beiträge zur Modulationslehre</i>, percorre assim o caminho de dó a todos os tons em sequências curtas, e os manuais (Hutchinson, cap. 23; Aldwell &amp; Schachter) a apresentam em três tipos.</p>
        <h3>1. A sétima diminuta: quatro sensíveis</h3>
        <p>O vii°7 é feito de três terças menores; a sua 7ª diminuta, invertida, é uma 2ª aumentada — enarmonicamente, outra 3ª menor —, e as quatro dividem a oitava em partes iguais. Por isso cada nota pode ser a sensível:</p>
        ${tab(["Grafia", "Sensível", "Resolve em", "Cifra a partir de dó"], [
          ["si–ré–fá–lá♭", "si", "dó (maior ou menor)", "vii°7"],
          ["ré–fá–lá♭–dó♭", "ré", "mi♭", "vii°7=Eb:vii°7 (ou eb:)"],
          ["mi♯–sol♯–si–ré", "mi♯", "fá♯", "vii°7=f#:vii°7"],
          ["sol♯–si–ré–fá", "sol♯", "lá", "vii°7=a:vii°7"]])}
        <p>Distâncias: 3ª menor, trítono e 6ª maior. E mais: baixando uma nota qualquer do vii°7 por semitom, obtém-se um V7 (de outro tom) — a sétima diminuta é o acorde-curinga da fantasia e do recitativo do século XVIII.</p>
        <h3>2. V7 = sexta alemã</h3>
        <p>Lá♭–dó–mi♭–sol♭ (V7 de ré♭) e lá♭–dó–mi♭–fá♯ (sexta alemã de dó) soam igual. Leia num sentido ou no outro:</p>
        <ul>
          <li><b>Ger65 → V7</b>: em dó, a sexta alemã que “devia” abrir-se em sol desce como V7: o fá♯ (= sol♭) cai a fá, o baixo lá♭ salta a ré♭. Dó → ré♭, meio tom acima.</li>
          <li><b>V7 → Ger65</b>: em fá, o V7 (dó–mi–sol–si♭) é reescrito dó–mi–sol–lá♯ e resolve como sexta alemã de mi menor: dó → si, lá♯ → si. Fá → mi, meio tom abaixo.</li>
        </ul>
        <p>A diferença audível está só na resolução: <b>a 7ª da dominante desce por grau; as notas da 6ª aumentada se abrem em oitava sobre o 5º grau</b>. Omitindo a 5ª da sexta alemã obtém-se a italiana, que serve da mesma forma.</p>
        <h3>3. A tríade aumentada: três leituras</h3>
        <p>Sol–si–ré♯ (V+ de dó) = mi♭–sol–si (V+ de lá♭) = si–ré♯–fá𝄪 (V+ de mi). Três tônicas a 3ª maior umas das outras — dó, mi, lá♭ —, o ciclo de terças maiores que os românticos exploraram.</p>
        <h3>Grafia e condução</h3>
        <ul>
          <li>A regra escolar: <b>grafe o pivô pela resolução</b> (leitura nova). Lá♭ que vai subir a lá é sol♯; sol♭ que vai descer a fá não é fá♯. A grafia mostra a condução — e o verificador mede os intervalos pela grafia: um fá♯ que “resolve” em fá parece um intervalo cromático, não uma 7ª resolvendo.</li>
          <li>As tendências se trocam: no vii°7, a nota que era 7ª (lá♭, desce) pode virar sensível (sol♯, sobe). Planeje a resolução de cada voz pela leitura nova.</li>
          <li>Prepare o pivô no tom velho como um acorde que o ouvido entende ali (um vii°7 de dó, um Ger65 de dó): o engano só funciona se houver expectativa.</li>
          <li>Confirme o tom novo: depois de um salto tão grande, a cadência perfeita é indispensável.</li>
        </ul>
        <p>Nas cifras do ateliê o pivô enarmônico tem as duas leituras: <code>vii°7=Eb:vii°42</code>, <code>Ger65=Db:V7</code>, <code>V+=Ab:V+6</code>. O verificador confere que as duas leituras são o mesmo som com grafias diferentes, e avisa se o soprano ou o baixo estiverem grafados na leitura antiga.</p>` },

      { tipo: "exemplo", titulo: "A sétima diminuta de dó resolvida em mi♭", intro: "O mesmo acorde, duas vezes: primeiro como o ouvido espera, depois reescrito.",
        camadas: [
          ex("1. O vii°7 em dó, resolvendo em dó", pt("C maior", "E5/2 D5/1 C5/1 A4/1 B4/1 G4/2 Ab4/2 G4/2", "C3/2 B2/1 C3/1 F3/1 G3/1 C4/2 B3/2 C4/2"), "I V65 I IV V I vii°7 I", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "Si–ré–fá–lá♭ (vii°7 de dó, com o lá♭ emprestado de dó menor): o si do baixo sobe a dó, o lá♭ do soprano desce a sol. É o uso normal."],
              ["checagem", "Lá♭4 contra si3 é uma 7ª diminuta: dissonância que chega por grau (sol → lá♭) e resolve por grau (lá♭ → sol)."]] }),
          ex("2. O mesmo som, grafado ré–fá–lá♭–dó♭: mi♭ maior", C3_CEB, C3_CEB_CIF, {
            contexto: cx("Eb maior", "enarmonica", 4),
            anotacoes: [[1, 6, "si = dó♭"]],
            notas: [["decisao", "O baixo, que seria si (sensível de dó, sobe), é grafado dó♭: a 7ª do vii°7 de mi♭ em 4/2, que desce a si♭. O ouvido ouve o mesmo acorde do passo 1 e espera dó; recebe o 6/4 cadencial de mi♭."],
              ["decisao", "A cadência vem logo: I6/4 – V7 sobre si♭, depois I – IV – V7 – I. Depois de um salto de três bemóis, a confirmação precisa ser explícita."],
              ["rejeitada", "Grafar o baixo como si (leitura antiga): o som é o mesmo, mas a partitura diria “sobe” e a música desce. Além disso, si → si♭ apareceria como um semitom cromático, e não como a resolução da 7ª."],
              ["checagem", "Dó (c. 2, baixo) → dó♭ (c. 3, baixo) é um semitom cromático na mesma voz; o soprano faz sol → lá♭ → sol, a mesma figura do passo 1."]],
            pausa: ["O que o soprano faz de diferente entre os passos 1 e 2?", "Nada: sol – lá♭ – sol nos dois. Toda a diferença está no baixo (si → dó, ou dó♭ → si♭) e no que vem depois. Isso é o cerne da modulação enarmônica: o ouvido é enganado por uma voz, enquanto as outras continuam fazendo o gesto esperado."] }),
        ] },

      { tipo: "contraste", titulo: "Sexta alemã × V7: a mesma sonoridade, duas resoluções",
        a: lado("A — sexta alemã de dó: abre-se em sol", pt("C maior", "E5/2 F5/2 F#5/2 G5/1 F5/1 E5/4", "C3/2 A2/2 Ab2/2 G2/1 G2/1 C3/4"), "I IV6 Ger65 I64 V7 I", { contexto: cx(null, null, 0) }),
        b: lado("B — o mesmo acorde como V7 de ré♭: a “sexta” desce", pt("C maior", "E5/2 F5/2 Gb5/2 F5/2 Eb5/2 F5/1 Eb5/1 Db5/4", "C3/2 A2/2 Ab2/2 Db3/2 Gb2/2 Ab2/1 Ab2/1 Db3/4"), "I IV6 Ger65=Db:V7 I ii6 I64 V7 I", { contexto: cx("Db maior", "enarmonica", 4) }),
        pergunta: "Os dois primeiros compassos soam igual (lá♭–dó–mi♭–fá♯/sol♭ no 3º acorde). Onde está a diferença — na partitura e no ouvido?",
        comentario: "<p>Em A, fá♯5 e lá♭2 abrem-se em oitava sobre sol: é a sexta alemã, pré-dominante de dó, e o ouvido chega ao 6/4 cadencial. Em B, a mesma nota do soprano é sol♭5 e <b>desce</b> a fá5 — a 7ª de uma dominante —, enquanto o baixo salta lá♭ → ré♭: estamos em ré♭ maior, meio tom acima, a cinco bemóis de distância. A grafia (fá♯ × sol♭) é o que diz ao intérprete qual das duas histórias está sendo contada.</p>" },

      { tipo: "quebra", titulo: "Tons remotos e ciclos de terças (Schubert, Liszt, Wagner)", html: `
        <p>Para o Classicismo, a enarmonia é um recurso de exceção — um momento de surpresa, normalmente num desenvolvimento ou numa fantasia, com a cadência logo depois. No Romantismo ela vira <b>método</b>. Schubert lê a sexta alemã como V7 (e o V7 como sexta alemã) com naturalidade, abrindo portas para tons a meio tom de distância. Liszt constrói o tema que abre a <i>Sinfonia Fausto</i> sobre tríades aumentadas, o acorde mais ambíguo de todos. Em Wagner (<i>Tristão</i>), a ambiguidade de leitura de um acorde passa a ser o próprio assunto: a resolução esperada é adiada, e a tonalidade fica suspensa.</p>
        <p>O que se quebra, em graus crescentes: primeiro, a <b>distância</b> (tons remotos em um passo); depois, a <b>confirmação</b> (o tom novo é tocado e abandonado sem cadência); por fim, a própria <b>grafia como verdade</b> — muitas partituras mantêm a grafia antiga por legibilidade, e cabe ao ouvinte (e ao intérprete) reconstituir a leitura.</p>`,
        exemplos: [
          lado("A tríade aumentada: o V+ de dó (sol–si–ré♯) lido como V+ de lá♭ (mi♭–sol–si)", pt("C maior", "E5/2 D5/2 C5/2 Eb5/2~ Eb5/2 Db5/2 C5/1 Bb4/1 Ab4/2", "C3/2 G2/2 C3/2 G2/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/2"), "I V I V+=Ab:V+6 I ii6 I64 V7 I", {
            perfil: P3, contexto: cx("Ab maior", "enarmonica", 4),
            comentario: "Depois de uma cadência em dó, o sol do baixo volta com ré♯ — grafado mi♭, a leitura de lá♭ — no soprano. Em dó, sol–si–ré♯ resolveria em dó–mi–sol; reescrito como 6/3 da tríade aumentada de lá♭, o sol sobe a lá♭ e o mi♭ fica: lá♭ maior, a 3ª maior abaixo de dó." }),
        ] },
    ],
    exercicios: [
      { id: "en1", titulo: "Completar: de lá menor a dó menor pela sétima diminuta", modo: "completar", perfil: P3, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "C menor", tipo: "enarmonica" }, plano: { cadencia: 5, tomFinal: "C menor" } },
        cifrasAluno: true, cifrasIniciais: "i V65 i iv V i",
        instrucoes: "<p>O baixo é dado; o soprano e as cifras vão até o 3º tempo do c. 2. No 4º tempo, o si do baixo sustenta a sétima diminuta de lá menor (sol♯–si–ré–fá, com si no baixo). <b>Reinterprete-a</b> como a sétima diminuta de dó menor (escreva as duas leituras, como <code>vii°65=c:vii°7</code>) e continue até a cadência perfeita em dó menor.</p>",
        texto: "tom: A menor\ncf: baixo\nsoprano: C5/2 B4/1 C5/1 D5/1 B4/1 C5/1\nbaixo: A2/2 G#2/1 A2/1 D3/1 E3/1 A2/1 B2/1 C3/2 Ab2/2 G2/2 G2/2 C3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: A menor\ncf: baixo\nsoprano: C5/2 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 Eb5/2 C5/2 C5/2 B4/2 C5/4\nbaixo: A2/2 G#2/1 A2/1 D3/1 E3/1 A2/1 B2/1 C3/2 Ab2/2 G2/2 G2/2 C3/4",
        solucaoCifras: "i V65 i iv V i vii°65=c:vii°7 i iv6 i64 V7 i",
        comentarioSolucao: "Sol♯–si–ré–fá = si–ré–fá–lá♭: o si, que em lá era a 3ª do acorde, vira sensível de dó e sobe. O sol♯ implícito vira lá♭ e desce a sol. O soprano (ré5 → mi♭5) canta a 3ª menor de dó já no primeiro acorde do tom novo." },
      { id: "en2", titulo: "Menos apoio: de sol maior a lá♭ maior (sexta alemã = V7)", modo: "menos apoio", perfil: P3, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "Ab maior", tipo: "enarmonica" }, plano: { cadencia: 5, tomFinal: "Ab maior" } },
        cifrasAluno: true,
        instrucoes: "<p>Só o baixo é dado. Firme sol maior; no c. 3, o mi♭ do baixo carrega a sexta alemã de sol (mi♭–sol–si♭–dó♯), que você vai reinterpretar como V7 de lá♭ maior. Escreva todas as cifras e o soprano, com a 7ª da dominante nova <b>grafada pela resolução</b> e resolvendo descendo. Cadência perfeita em lá♭ no c. 5.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/2 C3/1 D3/1 G2/2 E3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 A4/1 B4/2 C5/2 Db5/2 C5/2 Bb4/2 C5/1 Bb4/1 Ab4/4\nbaixo: G2/2 C3/1 D3/1 G2/2 E3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4",
        solucaoCifras: "I IV V I IV6 Ger65=Ab:V7 I ii6 I64 V7 I",
        comentarioSolucao: "O baixo mi → mi♭ prepara a sexta alemã de sol; o soprano dó5 → ré♭5 (o dó♯ reescrito) faz dela a 7ª do V7 de lá♭, que desce a dó5. Se o ré♭ fosse escrito dó♯, a partitura mostraria uma 6ª aumentada que não se abre." },
      { id: "en3", titulo: "Restrição: de fá maior a mi menor (V7 = sexta alemã)", modo: "restrição", perfil: { ...P3, mod_grafia_enarmonica: "erro" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "enarmonica" }, plano: { cadencia: 4, tomFinal: "E menor" } },
        cifrasAluno: true, cifrasIniciais: "I V65 I IV I6 ii6",
        instrucoes: "<p>O baixo é dado; o soprano e as cifras chegam até o ii6 de fá (c. 2, 3º tempo). No 4º tempo, o dó do baixo carrega o V7 de fá — reinterprete-o como <b>sexta alemã de mi menor</b> e resolva pelo 6/4 cadencial. <b>Restrição:</b> o soprano e o baixo do pivô grafados na leitura nova (o verificador confere), e o soprano com a nota que vira 6ª aumentada. Que nota de fá maior é ela, e como se escreve em mi menor?</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano: A4/2 G4/1 A4/1 D5/1 C5/1 Bb4/1\nbaixo: F2/2 E2/1 F2/1 Bb2/1 A2/1 Bb2/1 C3/1 B2/2 B2/2 E3/1 A2/1 B2/1 E2/1", duracao: 1, alvoCompassos: 4,
        solucao: "tom: F maior\ncf: baixo\nsoprano: A4/2 G4/1 A4/1 D5/1 C5/1 Bb4/1 A#4/1 B4/2 A4/2 G4/1 A4/1 F#4/1 E4/1\nbaixo: F2/2 E2/1 F2/1 Bb2/1 A2/1 Bb2/1 C3/1 B2/2 B2/2 E3/1 A2/1 B2/1 E2/1",
        solucaoCifras: "I V65 I IV I6 ii6 V7=e:Ger65 i64 V7 i iv V7 i",
        comentarioSolucao: "O si♭4 do soprano fica parado e é reescrito lá♯4: a 7ª de dó–mi–sol–si♭ vira a 6ª aumentada de dó–mi–sol–lá♯, e sobe a si enquanto o baixo desce dó → si. A mesma tecla, duas funções: num caso desceria a lá (7ª de V7 de fá), no outro sobe a si." },
      { id: "en4", titulo: "Livre: de mi menor a sol menor", modo: "livre", perfil: P3, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "G menor", tipo: "enarmonica" }, plano: { cadencia: 4, tomFinal: "G menor" } },
        cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha as duas vozes e as cifras: firme mi menor e module para sol menor por <b>reinterpretação da sétima diminuta</b> (qual nota do vii°7 de mi menor vira sensível de sol?). Cadência perfeita em sol menor no c. 4.</p>",
        texto: "tom: E menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: E menor\nsoprano: G4/2 F#4/1 G4/1 A4/1 F#4/1 G4/1 A4/1 Bb4/1 C5/1 Bb4/1 A4/1 G4/4\nbaixo: E3/2 D#3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 G3/1 Eb3/1 D3/1 D3/1 G2/4",
        solucaoCifras: "i V65 i iv V i vii°65=g:vii°7 i iv6 i64 V7 i",
        comentarioSolucao: "Ré♯–fá♯–lá–dó (vii°7 de mi) = fá♯–lá–dó–mi♭ (vii°7 de sol): o fá♯, 3ª do acorde em mi, é a sensível de sol. Com fá♯ no baixo, o baixo sobe mi – fá♯ – sol por grau e a mudança de tom fica quase escondida — até o si♭ do soprano." },
      { id: "en5", titulo: "Quebrar: o ciclo de terças maiores", modo: "quebrar", perfil: { ...P3, modulacao: "info", mod_grafia_enarmonica: "info", mod_plano_de_tons: "erro" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "Ab maior", tipo: "enarmonica" }, planoTons: [[2, "E maior"], [3, "Ab maior"], [4, "C maior"]], plano: { cadencia: 5 } },
        cifrasAluno: true, cifrasIniciais: "I",
        instrucoes: "<p>Uma volta inteira pelo ciclo de terças maiores: dó (c. 1) → mi (c. 2) → lá♭ (c. 3) → dó (c. 4–5), cada passo pela <b>tríade aumentada</b> reinterpretada (<code>V+6=E:V+</code> etc.), e cadência perfeita em dó no fim. <b>Quebre a regra da confirmação:</b> mi e lá♭ duram dois tempos cada, só com a tríade aumentada como dominante — nada de pré-dominante, de 6/4 cadencial, de V7. (O verificador, que procura V → I, não vê a diferença; o ouvido vê.) O plano de tons por compasso é obrigatório.</p><p>Repare também na grafia: num ciclo assim, alguma nota acaba escrita na leitura “errada” (o verificador informa); o compositor romântico escolhe a grafia mais legível.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/2 B2/2 E3/2 Eb3/2 Ab3/2 G3/2 C3/1 F3/1 G3/1 G3/1 C3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/2 D#5/2 E5/2 G5/2 Ab5/2 Eb5/2 E5/1 D5/1 E5/1 D5/1 C5/4\nbaixo: C3/2 B2/2 E3/2 Eb3/2 Ab3/2 G3/2 C3/1 F3/1 G3/1 G3/1 C3/4",
        solucaoCifras: "I V+6=E:V+ I V+6=Ab:V+ I V+6=C:V+ I ii6 I64 V7 I",
        comentarioSolucao: "Cada tríade aumentada é ao mesmo tempo V+ de dois tons a 3ª maior: si–ré♯–fá𝄪 = mi♭–sol–si = sol–si–ré♯. O baixo desce por semitons cromáticos (dó–si, mi–mi♭, lá♭–sol) e a melodia segue a nota que sobe em cada resolução. Nenhum dos tons intermediários tem cadência: a música passa por eles como por paisagens — o oposto da modulação clássica." },
    ],
  });

  // ================================================================ 4. na forma

  const C4_SEQ = pt("C maior", "E5/1 F5/1 D5/1 E5/1 F5/1 G5/1 E5/1 F5/1 G5/1 A5/1 F#5/1 G5/1 E5/2 B4/1 A4/1 G4/4", "C3/1 F3/1 G3/1 C3/1 D3/1 G3/1 A3/1 D3/1 E3/1 A3/1 B3/1 E4/1 C4/2 D4/1 D4/1 G3/4");
  const C4_SEQ_CIF = "I IV V I d:i iv V i e:i iv V i=G:vi ii6 I64 V7 I";

  T.inserir(4, {
    id: "modulacao4", titulo: "Modulação na forma",
    antes: [
      { p: "Numa sonata clássica em modo maior, para onde costuma ir a exposição?", o: ["Para a dominante (V)", "Para a subdominante (IV)", "Para o relativo menor (vi)", "Para o homônimo menor (i)"],
        e: "O 2º grupo de temas fica, por norma, na dominante (em menor, no relativo maior, III, ou na dominante menor, v). A recapitulação traz o 2º grupo de volta à tônica: a forma inteira é um arco I → V → I." },
      { p: "Numa modulação por sequência, o que garante a chegada ao tom novo?", o: ["A última cópia é reinterpretada (um pivô) e o tom novo recebe cadência", "A própria repetição do padrão, sem mais nada", "Que o modelo tenha uma dominante secundária", "Que a sequência suba por grau"],
        e: "A sequência suspende a lógica funcional: o ouvido segue o padrão, não a tonalidade. Para que ela pare num tom, a última cópia tem de ser lida no tom novo (por exemplo, e:i = G:vi) e o tom novo, confirmado por cadência." },
      { p: "O que é uma modulação direta (ou de frase)?", o: ["O tom novo começa na frase seguinte, sem pivô nem preparação", "Uma modulação para um tom vizinho por acorde-pivô", "Uma modulação por inflexão cromática", "Uma modulação que dura um só acorde"],
        e: "Uma frase fecha num tom, a seguinte abre em outro. A articulação de frase faz o papel da ponte: o ouvido aceita um novo começo. É frequente entre seções de uma forma e é o recurso típico da canção popular (a “subida” de meio tom ou de um tom no último refrão)." },
    ],
    objetivo: "Planejar onde as modulações acontecem numa forma — período modulante, binária, exposição de sonata — e escrever as três técnicas de forma: sequência modulante, modulação direta e retorno ao tom principal.",
    ouvir: [
      "Bach, Suítes francesas e inglesas: danças binárias com a 1ª parte indo de I a V (maior) ou de i a III (menor) e a 2ª parte voltando",
      "Mozart, Sonata K. 545, 1º mov.: exposição de dó a sol; a recapitulação começa em fá maior (IV)",
      "Beethoven, Sonata “Waldstein” op. 53, 1º mov.: o 2º grupo em mi maior, não em sol",
      "Beethoven, Sonata “Hammerklavier” op. 106, 1º mov.: de si♭ maior ao 2º grupo em sol maior (♭VI)",
    ],
    esboco: "Sem consultar a aula: desenhe o plano de tons (só os tons e onde chegam) da primeira parte de um minueto de 8 compassos em mi menor. Onde você poria a modulação?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "O plano de tons é a arquitetura", html: `
        <p>Até aqui a modulação foi um problema de condução de vozes. Numa peça, ela é um problema de <b>forma</b>: <i>onde</i> se modula, <i>para onde</i> e <i>por quanto tempo</i>. Koch (<i>Versuch einer Anleitung zur Composition</i>) descreve as formas do século XVIII justamente pelos pontos de repouso e pelos tons em que eles caem; Rosen (<i>Sonata Forms</i>) mostra que a oposição tônica × dominante é o motor da forma-sonata.</p>
        <h3>Para onde se vai</h3>
        ${tab(["Forma", "Em maior", "Em menor", "Volta"], [
          ["Período modulante", "antecedente em I (semicadência), consequente cadencia em V", "consequente em III (ou v)", "não volta: é a 1ª frase de algo maior"],
          ["Binária (dança barroca, minueto)", "1ª parte: I → V", "1ª parte: i → III (às vezes v)", "2ª parte: do V (III) de volta ao I, passando por vizinhos (vi, ii, IV)"],
          ["Exposição de sonata", "1º grupo em I, transição, 2º grupo em V", "2º grupo em III (às vezes v)", "recapitulação: os dois grupos em I"],
          ["Desenvolvimento", "sequências, tons vizinhos e remotos", "idem", "retransição: pedal ou prolongação do V do tom principal"],
          ["Trio (minueto, marcha)", "IV (ou o próprio I)", "III ou o homônimo maior", "da capo"]])}
        <h3>As técnicas de forma</h3>
        <ul>
          <li><b>Modulação por pivô</b> (capítulos anteriores): a transição de uma exposição, a 1ª parte de uma binária.</li>
          <li><b>Sequência modulante</b>: um modelo (dois a quatro acordes) é repetido em outro grau; cada cópia tonicaliza um tom diferente, e o ouvido segue o <b>padrão</b> em vez da função. Para parar, a última cópia é reinterpretada (<code>e:i=G:vi</code>) e o tom de chegada recebe cadência. É o motor dos desenvolvimentos e das segundas partes das binárias.</li>
          <li><b>Modulação direta (de frase)</b>: uma frase fecha num tom e a seguinte começa no outro, sem ponte. A articulação de frase faz o papel do pivô. Comum entre seções (o trio de um minueto, um episódio de rondó) e, entre tons vizinhos, até dentro de um tema.</li>
          <li><b>Retorno</b>: voltar ao tom principal é modular de novo. Do V, basta acrescentar a 7ª do tom principal (o I de sol vira V7 de dó com o fá natural); de tons mais longe, uma sequência ou um pivô — e, na sonata, uma retransição que insiste no V antes da recapitulação.</li>
        </ul>
        <h3>Quanto confirmar</h3>
        <p>A confirmação é proporcional ao papel do tom na forma. O 2º grupo de uma sonata ocupa uma seção inteira no tom novo, com várias cadências; o consequente de um período modulante cadencia uma vez; uma etapa de sequência não cadencia — é por isso que ela soa como passagem. Ao planejar, decida primeiro o <b>plano de tons</b> (que tom em que compasso) e só depois a técnica de cada mudança.</p>
        <p>Nos exercícios deste capítulo o verificador confere o <b>plano de tons</b>: em cada compasso marcado, as cifras têm de estar no tom previsto.</p>` },

      { tipo: "exemplo", titulo: "Sequência modulante: dó → ré menor → mi menor = sol: vi", intro: "Um modelo de um compasso (I – IV – V – I) repetido duas vezes, um grau acima; a terceira cópia vira pivô.",
        camadas: [
          ex("1. O modelo", pt("C maior", "E5/1 F5/1 D5/1 E5/1", "C3/1 F3/1 G3/1 C3/1"), "I IV V I", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "Um modelo curto e completo (T – PD – D – T), com o soprano em bordadura (mi–fá–ré–mi) contra o baixo em fundamentais: fácil de reconhecer quando repetido."],
              ["checagem", "Soprano–baixo: 3 – 8 – 5 – 3. A 8ª (fá/fá) chega com o soprano por grau."]] }),
          ex("2. Duas cópias, um grau acima", pt("C maior", "E5/1 F5/1 D5/1 E5/1 F5/1 G5/1 E5/1 F5/1 G5/1 A5/1 F#5/1 G5/1", "C3/1 F3/1 G3/1 C3/1 D3/1 G3/1 A3/1 D3/1 E3/1 A3/1 B3/1 E3/1"), "I IV V I d:i iv V i e:i iv V i", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "As cópias são tonais, não reais: em ré, o modelo vira i – iv – V – i de ré menor (com dó♯ implícito no V); em mi, i – iv – V – i de mi menor (fá♯ no soprano)."],
              ["decisao", "Cada cópia tonicaliza um grau de dó (ii, depois iii): ouvida de longe, é uma sequência ascendente dentro de dó; de perto, três pequenos tons."],
              ["checagem", "Entre as cópias o soprano sobe por grau (mi → fá → sol) e o baixo também (dó → ré → mi), em 10ªs: a articulação de cada cópia é clara."]],
            pausa: ["Se a música parasse aqui, em que tom ela estaria?", "Em lugar nenhum, ou em mi menor por inércia: a última cópia tem a sua cadência (V – i), mas o ouvido ouviu três vezes o mesmo padrão e espera a quarta. Uma sequência não cria tonalidade; ela suspende a tonalidade até que alguma coisa a quebre."] }),
          ex("3. A última cópia vira pivô: cadência em sol", C4_SEQ, C4_SEQ_CIF, {
            contexto: cx("G maior", "pivo", 5, { planoTons: [[1, "C maior"], [2, "D menor"], [3, "E menor"], [5, "G maior"]] }),
            anotacoes: [[1, 11, "i = vi"]],
            notas: [["decisao", "O mi menor final da 3ª cópia é lido como vi de sol: o padrão para, e a frase segue para ii6 – I6/4 – V7 – I de sol."],
              ["decisao", "O baixo sobe ao mi4 no fim da cópia (e não desce a mi3): a mudança de registro marca que o padrão terminou."],
              ["rejeitada", "Continuar a sequência até fá♯ (a 4ª cópia): fá♯ menor é ainda mais longe de dó, e o padrão viraria rotina — três vezes é o limite clássico."],
              ["checagem", "O clímax (lá5) está na última cópia, logo antes da quebra do padrão; depois a melodia desce mi5 – si4 – lá4 – sol4."]] }),
        ] },

      { tipo: "contraste", titulo: "Modulação direta × modulação por pivô",
        a: lado("A — direta: cadência em dó, nova frase em sol", pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2 B4/1 A4/1 B4/1 C5/1 A4/2 G4/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 G3/1 F#3/1 G3/1 C3/1 D3/2 G2/2"), "I V43 I6 IV V I G:I V6 I IV V I", { contexto: cx("G maior", "direta", 4) }),
        b: lado("B — pivô: vi = ii, V65 e cadência em sol", C1_CG, C1_CG_CIF, { contexto: cx("G maior", "pivo", 5) }),
        pergunta: "As duas terminam em sol depois do mesmo começo. Em qual delas o ouvido percebe um “novo começo”, e em qual uma “viagem”?",
        comentario: "<p>Em A, a cadência do c. 2 fecha uma frase em dó; o c. 3 recomeça em sol como se fosse a tônica desde sempre (é o V de dó, e a passagem soa natural). A articulação de frase é a ponte: é o procedimento das seções que se sucedem. Em B, a mudança acontece <i>dentro</i> da frase — o pivô, o fá♯, a confirmação —, e o ouvido acompanha uma transição. Numa forma, use a direta onde há articulação (fim de seção) e o pivô onde a música precisa “caminhar” (transição).</p>" },

      { tipo: "quebra", titulo: "Três tons, recapitulações no lugar errado, saltos de tom", html: `
        <p><b>O tom do 2º grupo.</b> A norma clássica (V em maior; III em menor) é quebrada já por Beethoven: o 2º grupo da “Waldstein” está em mi maior (III♯ de dó), o da “Hammerklavier” em sol maior (♭VI de si♭). Schubert vai mais longe com a <b>exposição de três tons</b>: o 2º grupo começa num tom intermediário e só depois chega ao tom em que a exposição fecha — o caminho até a dominante vira uma viagem com escala.</p>
        <p><b>A recapitulação no tom “errado”.</b> Na Sonata K. 545, Mozart começa a recapitulação em <b>fá maior</b> (IV). O efeito é engenhoso e econômico: a transição da exposição, que levava de dó a sol, agora leva de fá a dó — e o 2º tema chega à tônica sem que a transição precise ser recomposta. Haydn, por sua vez, é o mestre da <b>falsa recapitulação</b>: o tema principal volta no meio do desenvolvimento, às vezes até na tônica, e a música continua desenvolvendo — a forma brinca com a expectativa que ela mesma criou.</p>
        <p><b>O salto direto.</b> A modulação direta para um tom não vizinho, sem preparação nenhuma, é um efeito de corte: na canção popular, a subida de meio tom (ou de um tom) no último refrão é um clichê de intensificação; nos românticos, a justaposição de tons remotos entre seções dispensa qualquer ponte.</p>`,
        exemplos: [
          lado("Exposição de três tons em miniatura: dó → mi menor → sol", pt("C maior", "E5/2 D5/2 C5/2 E5/2 D#5/2 E5/2 A4/2 B4/1 A4/1 G4/4", "C3/2 G2/2 C3/2 A2/2 B2/2 E3/2 C3/2 D3/1 D3/1 G2/4"), "I V I vi=e:iv V i=G:vi ii6 I64 V7 I", {
            perfil: P4, contexto: cx("G maior", "pivo", 5, { planoTons: [[1, "C maior"], [3, "E menor"], [5, "G maior"]] }),
            comentario: "O lá menor (vi de dó = iv de mi) leva primeiro a mi menor, com uma cadência V – i; o próprio mi menor é então lido como vi de sol, e a frase cadencia na dominante. O tom intermediário (iii) é o mesmo que Schubert e Brahms usam muitas vezes — aqui em cinco compassos, numa exposição são seções inteiras." }),
          lado("Corte direto meio tom acima: dó maior → ré♭ maior", pt("C maior", "E5/1 F5/1 D5/1 C5/1 F5/1 Gb5/1 Eb5/1 Db5/1", "C3/1 F3/1 G3/1 C3/1 Db3/1 Gb3/1 Ab3/1 Db3/1"), "I IV V I Db:I IV V7 I", {
            perfil: P4, contexto: cx("Db maior", "direta", 2),
            comentario: "A mesma frase, transposta meio tom acima, logo depois da cadência: nenhuma nota comum na harmonia (dó maior e ré♭ maior não dividem nada), nenhum pivô. É a lógica da repetição intensificada — o ouvido aceita porque reconhece a frase." }),
        ] },
    ],
    exercicios: [
      { id: "fm1", titulo: "Completar: o período modulante", modo: "completar", perfil: P4, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "G maior", tipo: "pivo" }, planoTons: [[1, "C maior"], [5, "C maior"], [8, "G maior"]], plano: { semicadencia: 4, cadencia: 8, tomFinal: "G maior" } },
        cifrasAluno: true, cifrasIniciais: "I V43 I6 IV V I vi ii6 V I V43 I6",
        instrucoes: "<p>Um período de 8 compassos: o antecedente (c. 1–4) termina em semicadência em dó; o consequente começa igual e deve terminar em <b>cadência perfeita em sol</b>. O baixo inteiro é dado, e o soprano e as cifras até o c. 5. Escreva o pivô (c. 6), as cifras e o soprano dos c. 6–8.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/2 D5/1 C5/1 A4/1 B4/1 C5/2 E5/2 D5/2 B4/4 E5/2 D5/1 C5/1\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F3/2 G3/4 C3/2 D3/1 E3/1 A3/2 F#3/2 G3/2 C3/2 D3/1 D3/1 G2/2", duracao: 1, alvoCompassos: 8,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/2 D5/1 C5/1 A4/1 B4/1 C5/2 E5/2 D5/2 B4/4 E5/2 D5/1 C5/1 A4/2 D5/1 C5/1 B4/2 E5/2 B4/1 A4/1 G4/2\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F3/2 G3/4 C3/2 D3/1 E3/1 A3/2 F#3/2 G3/2 C3/2 D3/1 D3/1 G2/2",
        solucaoCifras: "I V43 I6 IV V I vi ii6 V I V43 I6 vi=G:ii V65 I ii6 I64 V7 I",
        comentarioSolucao: "O antecedente usa lá menor como vi (c. 3); o consequente usa o mesmo acorde como pivô (vi = ii de sol) no c. 6. O que era uma cor do tom vira a porta do tom novo — a assimetria entre as duas frases é exatamente a modulação." },
      { id: "fm2", titulo: "Menos apoio: a primeira parte de um minueto em mi menor", modo: "menos apoio", perfil: P4, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "G maior", tipo: "pivo" }, planoTons: [[1, "E menor"], [5, "G maior"], [8, "G maior"]], plano: { cadencia: 8, tomFinal: "G maior" } },
        cifrasAluno: true,
        instrucoes: "<p>A primeira reprise de um minueto (3/4, 8 compassos) vai de mi menor ao relativo maior. Só o baixo é dado. Escreva cifras e soprano: mi menor nos c. 1–3, o pivô no fim do c. 3, sol maior a partir do c. 4 e duas cadências em sol (c. 6–7 e c. 7–8).</p>",
        texto: "compasso: 3/4\ntom: E menor\ncf: baixo\nsoprano:\nbaixo: E3/2 D#3/1 E3/1 A2/1 B2/1 E3/2 A3/1 F#3/2 G3/1 B2/2 C3/1 D3/2 D3/1 G2/1 C3/1 D3/1 G2/3", duracao: 1, alvoCompassos: 8,
        solucao: "compasso: 3/4\ntom: E menor\ncf: baixo\nsoprano: G4/2 F#4/1 G4/1 C5/1 B4/1 B4/2 C5/1 D5/1 C5/1 B4/1 D5/2 E5/1 B4/2 A4/1 B4/1 C5/1 A4/1 G4/3\nbaixo: E3/2 D#3/1 E3/1 A2/1 B2/1 E3/2 A3/1 F#3/2 G3/1 B2/2 C3/1 D3/2 D3/1 G2/1 C3/1 D3/1 G2/3",
        solucaoCifras: "i V65 i iv V i iv=G:ii V65 I I6 ii6 I64 V I IV V7 I",
        comentarioSolucao: "O lá menor do c. 3 é iv de mi e ii de sol; o fá♯ do baixo já é a 3ª do V65 de sol. Depois de chegar a sol (c. 4), a frase dá duas cadências: a primeira (I6/4 – V – I) e uma segunda, curta (I – IV – V7 – I), como codeta. Na forma binária, a primeira parte termina assim, firme no tom novo, antes do ritornelo." },
      { id: "fm3", titulo: "Restrição: sequência de fá maior a dó maior", modo: "restrição", perfil: P4, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "C maior", tipo: "pivo" }, planoTons: [[1, "F maior"], [2, "G menor"], [3, "A menor"], [5, "C maior"]], plano: { cadencia: 5, tomFinal: "C maior" } },
        cifrasAluno: true, cifrasIniciais: "I IV V I",
        instrucoes: "<p>O modelo (c. 1, fá maior: I – IV – V – I) está escrito. Continue com duas cópias um grau acima. <b>Restrição — o plano de tons:</b> c. 2 em sol menor, c. 3 em lá menor e cadência perfeita em <b>dó maior</b> no c. 5 (o verificador confere o tom de cada compasso). A última cópia precisa ser reinterpretada no tom de chegada.</p>",
        texto: "tom: F maior\nsoprano: A4/1 Bb4/1 G4/1 A4/1\nbaixo: F2/1 Bb2/1 C3/1 F2/1", duracao: 1, alvoCompassos: 5,
        solucao: "tom: F maior\nsoprano: A4/1 Bb4/1 G4/1 A4/1 Bb4/1 C5/1 A4/1 Bb4/1 C5/1 D5/1 B4/1 C5/1 A4/2 E4/1 D4/1 C4/4\nbaixo: F2/1 Bb2/1 C3/1 F2/1 G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A3/1 F3/2 G3/1 G3/1 C3/4",
        solucaoCifras: "I IV V I g:i iv V i a:i iv V i=C:vi ii6 I64 V7 I",
        comentarioSolucao: "As cópias são tonais (sol menor, lá menor); o lá menor final é vi de dó, e a frase cadencia em dó com ii6 – I6/4 – V7 – I. É a mesma sequência do exemplo da aula, uma 5ª abaixo." },
      { id: "fm4", titulo: "Livre: ir à dominante e voltar", modo: "livre", perfil: P4, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "A maior", tipo: "pivo" }, planoTons: [[5, "A maior"], [8, "D maior"]], plano: { cadencia: 8 } },
        cifrasAluno: true, alvoCompassos: 8,
        instrucoes: "<p>Componha 8 compassos em ré maior: firme o tom, module para lá maior (V) com cadência no c. 5 e <b>volte</b> a ré, com cadência perfeita no c. 8. O plano de tons (lá maior no c. 5, ré maior no c. 8) é conferido. Como se volta da dominante? Que nota precisa reaparecer?</p>",
        texto: "tom: D maior\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: D maior\nsoprano: F#5/2 E5/1 D5/1 D5/1 C#5/1 D5/2 F#5/2 E5/1 D5/1 C#5/1 E5/1 F#5/1 D5/1 C#5/1 B4/1 A4/2 E5/2 D5/2 E5/2 F#5/1 E5/1 D5/4\nbaixo: D3/2 E3/1 F#3/1 G3/1 A3/1 D4/2 B3/2 G#3/2 A3/2 D3/2 E3/1 E3/1 A3/2 G3/2 F#3/2 G3/2 A3/1 A3/1 D3/4",
        solucaoCifras: "I V43 I6 IV V I vi=A:ii V65 I ii6 I64 V7 I D:V42 I6 ii6 I64 V7 I",
        comentarioSolucao: "Ida: si menor (vi = ii de lá), sol♯ no V65, cadência em lá no c. 5. Volta: o lá maior recebe o sol natural no baixo — vira V42 de ré —, e o sol cai a fá♯ (I6). O retorno é uma modulação de uma nota só, porque lá maior nunca deixou de ser a dominante de ré." },
      { id: "fm5", titulo: "Quebrar: o salto direto para mi♭", modo: "quebrar", perfil: { ...P4, modulacao: "info" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "Eb maior", tipo: "pivo" }, planoTons: [[3, "Eb maior"]], plano: { cadencia: 4, tomFinal: "Eb maior" } },
        cifrasAluno: true, cifrasIniciais: "I V43 I6 IV V I",
        instrucoes: "<p>A primeira frase (c. 1–2, dó maior) está escrita e termina em cadência perfeita. <b>Quebre a regra do pivô:</b> no c. 3 entre <b>diretamente</b> em mi♭ maior (♭III), sem acorde comum nem dominante preparando, e repita a frase no tom novo, com cadência perfeita em mi♭ no c. 4. O verificador informa (como informação) que não há pivô: é a quebra pedida. O plano de tons (mi♭ no c. 3) é obrigatório.</p>",
        texto: "tom: C maior\nsoprano: E5/2 D5/1 C5/1 A4/1 B4/1 C5/2\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C3/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\nsoprano: E5/2 D5/1 C5/1 A4/1 B4/1 C5/2 G5/2 F5/1 Eb5/1 C5/1 D5/1 Eb5/2\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C3/2 Eb3/2 F3/1 G3/1 Ab3/1 Bb3/1 Eb3/2",
        solucaoCifras: "I V43 I6 IV V I Eb:I V43 I6 IV V I",
        comentarioSolucao: "A frase inteira, uma 3ª menor acima, logo depois da cadência. O sol do soprano no começo do c. 3 pertence às duas tônicas (dó maior e mi♭ maior) — por isso o salto, embora sem preparação, não soa como um erro: soa como uma mudança de luz." },
    ],
  });

})(this);
