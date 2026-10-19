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
    objetivo: "Ir a um tom vizinho por acorde-pivô, com a nota nova na mesma voz e cadência que convença — e saber quando encurtar o caminho.",
    ouvir: [
      "Bach, Oratório de Natal, “Ermuntre dich”: sol → ré (I = IV)",
      "Bach, Invenção nº 1: cadências em sol e lá menor, volta a dó",
      "Mozart, Sonata K. 545, 1º mov.: dó → sol no 2º tema",
    ],
    esboco: "Sem consultar a aula: escreva só as cifras de um caminho de seis acordes de dó maior a sol maior. Qual acorde você leu nos dois tons? Ele era pré-dominante no tom novo?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Um acorde que pertence aos dois tons", html: `
        <p>Modular = <b>mudar o centro tonal de modo que o ouvido aceite o novo</b>. Na diatônica, um <b>acorde-pivô</b> comum aos dois tons é ouvido no velho e reinterpretado no novo (Schoenberg: neutralizar → acorde característico → cadenciar).</p>
        <h3>O procedimento</h3>
        ${tab(["Passo", "Como"], [
          ["1. Firmar o tom de partida", "expansão de tônica ou cadência"],
          ["2. Pivô", "mesma fundamental e qualidade nos dois tons; o melhor é <b>pré-dominante no novo</b> (ii, IV; iv em menor); evite o que é V ou I do novo"],
          ["3. Nota característica", "fá♯ (dó → sol), si♭ (dó → fá), <b>na mesma voz</b> da forma natural; em geral na dominante nova"],
          ["4. Tempo no tom novo", "1–2 acordes (ii6, I64) antes do V–I"],
          ["5. Confirmar", "V(7) → I em fundamental; numa peça, continuar no tom novo"]])}
        <p>Achar o pivô: leia no tom velho até as cifras não fazerem sentido e volte um acorde. Cifra: <code>vi=G:ii</code>.</p>
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
        <p>Pivô pré-dominante diatônico só existe para <b>V, vi, iii</b> (maior) e <b>III, v</b> (menor); para os outros, pivôs alterados (próximo capítulo).</p>
        <h3>Tonicização × modulação</h3>
        ${tab(["", "O que é"], [
          ["Tonicização", "V/V → V, sem cadência no tom novo"],
          ["Tonicização longa", "vários acordes do tom novo, sem cadência"],
          ["Modulação fraca", "cadência no tom novo e retorno imediato"],
          ["Modulação", "cadência no tom novo e música que continua nele"]])}
        <p>Ajudam o ouvido a mudar: dominante e tônica novas em tempo forte, pivô bem colocado, escala (ou sensível) nova na melodia.</p>` },

      { tipo: "exemplo", titulo: "De dó a sol pelo vi = ii", intro: "c. 1–2 firmam dó; c. 3 pivô e dominante nova; c. 4–5 confirmam sol.",
        camadas: [
          ex("1. Firmar o tom de partida", pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2"), "I V43 I6 IV V I", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "Troca de vozes com V43 de passagem e IV–V–I: dó firmado em dois compassos."],
              ["decisao", "Baixo em C4, não C3: evita descer duas vezes (G3→C3→pivô lá)."]] }),
          ex("2. O pivô e a dominante nova (ainda uma tonicização)", pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2 E5/2 D5/1 C5/1 B4/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F#3/2 G3/2"), "I V43 I6 IV V I vi=G:ii V65 I", {
            contexto: cx(null, null, 0),
            anotacoes: [[1, 6, "vi = ii"], [1, 7, "fá♯"]],
            notas: [["decisao", "Lá menor: vi em dó (prolongação de tônica), ii em sol (pré-dominante). O fá♯ entra logo depois, no baixo do V65."],
              ["rejeitada", "Mi menor (iii = vi): tônica nos dois tons, não empurra. Sol maior (V = I) soaria só como V de dó."],
              ["checagem", "Fá (c. 2) e fá♯ (c. 3) na mesma voz, o baixo: sem falsa relação."]],
            pausa: ["No 1º tempo do c. 4, já modulamos para sol?", "Não: V65 invertido e nada impede a volta a dó. É tonicização; só a cadência perfeita em sol a torna modulação."] }),
          ex("3. Confirmar: ii6 – I6/4 – V7 – I em sol", C1_CG, C1_CG_CIF, {
            contexto: cx("G maior", "pivo", 5),
            notas: [["decisao", "ii6 – I64 – V7 – I: dois compassos inteiros em sol antes do ponto final; o soprano desce 3̂–2̂–1̂ de sol."],
              ["rejeitada", "Cadenciar já no c. 4 (vi=ii → V → I): soaria como cadência passageira no V de dó (ver “Como quebrar”)."]],
            pausa: ["Onde cai o ponto mais agudo da melodia?", "E5, na abertura e no ii6 de sol (c. 4): marca o início da confirmação; dali a melodia só desce."] }),
        ] },

      { tipo: "exemplo", titulo: "Do menor ao relativo maior: lá menor → dó maior", intro: "Destino mais comum do menor. Sem nota nova: a confirmação depende só da harmonia e da cadência.",
        camadas: [
          ex("lá menor → dó maior pelo VI = IV", pt("A menor", "C5/2 B4/1 C5/1 D5/1 B4/1 A4/2 A4/1 C5/1 E5/2 D5/2 E5/1 D5/1 C5/4", "A2/2 G#2/1 A2/1 D3/1 E3/1 A3/2 F3/2 E3/2 F3/2 G3/1 G3/1 C3/4"), "i V6 i iv V i VI=C:IV I6 ii6 I64 V7 I", {
            contexto: cx("C maior", "pivo", 5),
            notas: [["decisao", "Pivô fá maior: VI em lá, IV em dó. Sol natural (baixo, c. 4) substitui o sol♯ na mesma voz."],
              ["decisao", "I6, ii6, I64: quatro acordes em dó antes do V7 → I."],
              ["rejeitada", "Sol maior (VII = V): já é a dominante nova; perde-se a costura."]] }),
        ] },

      { tipo: "contraste", titulo: "Tonicização × modulação",
        a: lado("A — tonicização: V65/V e volta a dó", pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2 E5/2 D5/1 C5/1 B4/1 D5/1 C5/2 A4/1 B4/1 C5/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F#3/2 G3/1 F3/1 E3/2 F3/1 G3/1 C3/2"), "I V43 I6 IV V I vi V65/V V V42 I6 IV V I", { contexto: cx(null, null, 5) }),
        b: lado("B — modulação: vi = ii, V65 e cadência em sol", C1_CG, C1_CG_CIF, { contexto: cx("G maior", "pivo", 5) }),
        pergunta: "Mesmos três compassos, mesmo fá♯. Onde o ouvido decide se mudou de tom?",
        comentario: "<p>A: o sol maior vira V42 de dó (fá natural volta) e cadencia em dó — tonicização. B: ii6 – I64 – V7 – I de sol — modulação. Pivô e dominante iguais; decide o que vem depois.</p>" },

      { tipo: "quebra", titulo: "Confirmação mínima, pivô na dominante", html: `
        ${tab(["Quem", "O que quebra", "Efeito"], [
          ["Bach, corais", "cadência no V/vi/iii logo após o pivô; a frase seguinte volta ao tom", "variedade de cadências sem perder o tom"],
          ["Ida ao IV", "pivô = I de dó = V de fá, confirmado pelo si♭", "dominante secundária que não volta; IV soa como repouso “mais baixo”"],
          ["Transições", "pivô e dominante nova, sem cadência", "expectativa frustrada: finge chegar"]])}
        <p>A confirmação longa é coisa de forma grande (2º tema de sonata), não de frase de quatro compassos.</p>`,
        exemplos: [
          lado("À maneira de um coral: cadência em sol logo depois do pivô, e volta imediata a dó", pt("C maior", "E5/1 D5/1 E5/1 C5/1 A4/2 B4/2 C5/1 A4/1 E5/1 D5/1 C5/4", "C3/1 B2/1 C3/1 A2/1 D3/2 G2/2 C3/1 F3/1 G3/1 G3/1 C3/4"), "I V6 I vi=G:ii V I C:I IV I64 V I", {
            perfil: { ...P1, mod_caminho: "info" }, contexto: cx("G maior", "pivo", 0, { plano: { cadencia: 4 } }),
            comentario: "vi=ii → V → I em dois tempos e meio; a frase seguinte recomeça em dó (sol é V de dó). O verificador informa a cadência logo após o pivô." }),
          lado("Para a subdominante com o pivô na dominante: I de dó = V de fá", pt("C maior", "E5/2 F5/1 D5/1 E5/2~ E5/2 F5/1 G5/1 F5/1 E5/1 F5/4", "C3/2 F2/1 G2/1 C3/2 Bb2/2 A2/1 Bb2/1 C3/1 C3/1 F2/4"), "I IV V I=F:V V42 I6 ii6 I64 V7 I", {
            perfil: { ...P1, mod_pivo_predominante: "info" }, contexto: cx("F maior", "pivo", 4),
            comentario: "Dó maior = I de dó = V de fá; o si♭ (V42) desfaz a dúvida e o mi preso sobe a fá. Nada antes do si♭ avisa a saída de dó." }),
        ] },
    ],
    exercicios: [
      { id: "pv1", titulo: "Completar: de dó maior a lá menor", modo: "completar", perfil: P1, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "A menor", tipo: "pivo" }, plano: { cadencia: 5, tomFinal: "A menor" } },
        cifrasAluno: true, cifrasIniciais: "I I6 IV V I",
        instrucoes: "<p>Baixo dado. No 3º tempo do c. 2, o <b>pivô</b> com as duas leituras (<code>ii=a:iv</code>); depois dominante de lá (si no baixo: que inversão?) e cadência perfeita no c. 5. Complete soprano e cifras.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/1 C5/1 A4/1 B4/1 C5/2\nbaixo: C3/1 E3/1 F3/1 G3/1 C3/2 D3/2 B2/2 A2/2 F2/2 E2/1 E2/1 A2/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/1 C5/1 A4/1 B4/1 C5/2 F5/2 E5/1 D5/1 C5/2 D5/2 C5/1 B4/1 A4/4\nbaixo: C3/1 E3/1 F3/1 G3/1 C3/2 D3/2 B2/2 A2/2 F2/2 E2/1 E2/1 A2/4",
        solucaoCifras: "I I6 IV V I ii=a:iv V43 i iv6 i64 V7 i",
        comentarioSolucao: "Ré menor: ii em dó, iv em lá. Si no baixo = V43 de lá. Soprano desce F5 → A4 pela 7ª (D5) e pelo 6/4 cadencial." },
      { id: "pv2", titulo: "Menos apoio: de ré menor a fá maior", modo: "menos apoio", perfil: P1, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "F maior", tipo: "pivo" }, plano: { cadencia: 5, tomFinal: "F maior" } },
        cifrasAluno: true,
        instrucoes: "<p>Só o baixo é dado. Escreva cifras e soprano: ré menor nos c. 1–2, pivô para fá maior (III), cadência em fá no c. 5.</p>",
        texto: "tom: D menor\ncf: baixo\nsoprano:\nbaixo: D3/2 C#3/1 D3/1 Bb2/1 A2/1 D3/2 G3/1 E3/1 F3/2 Bb2/2 C3/1 C3/1 F2/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: D menor\ncf: baixo\nsoprano: F5/2 E5/1 D5/1 D5/1 C#5/1 D5/2 Bb4/1 C5/1 A4/2 G4/2 A4/1 G4/1 F4/4\nbaixo: D3/2 C#3/1 D3/1 Bb2/1 A2/1 D3/2 G3/1 E3/1 F3/2 Bb2/2 C3/1 C3/1 F2/4",
        solucaoCifras: "i V6 i iv6 V i iv=F:ii V65 I ii6 I64 V7 I",
        comentarioSolucao: "Sol menor (c. 3): iv em ré, ii em fá. O mi seguinte é a sensível de fá (V65); dó♯ e dó natural ficam no baixo, distantes." },
      { id: "pv3", titulo: "Restrição: harmonizar uma melodia que vai a mi menor", modo: "restrição", perfil: { ...P1, mod_pivo_predominante: "erro" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "pivo", ate: 6 }, plano: { cadencia: 6, tomFinal: "E menor" } },
        cifrasAluno: true,
        instrucoes: "<p>Melodia dada (dó → mi menor). Escreva baixo e cifras. <b>Restrição:</b> pivô <b>pré-dominante em mi menor</b>; cadência perfeita em mi até o c. 6. Que acorde de dó é iv em mi?</p>",
        texto: "tom: C maior\ncf: soprano\nsoprano: C5/2 B4/1 C5/1 A4/1 B4/1 C5/2 E5/2 D#5/2 E5/2 A4/2 B4/2 D#5/2 E5/4\nbaixo:", duracao: 1, alvoCompassos: 6,
        solucao: "tom: C maior\ncf: soprano\nsoprano: C5/2 B4/1 C5/1 A4/1 B4/1 C5/2 E5/2 D#5/2 E5/2 A4/2 B4/2 D#5/2 E5/4\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F#3/2 E3/2 C3/2 B2/2 B2/2 E2/4",
        solucaoCifras: "I V43 I6 IV V I vi=e:iv V43 i iv6 i64 V7 i",
        comentarioSolucao: "Mi5 (c. 3) sobre lá menor: vi em dó = iv em mi. O ré♯ pede V43 de mi (fá♯ no baixo). I de dó (= VI) não é pré-dominante." },
      { id: "pv4", titulo: "Livre: de lá menor à dominante menor", modo: "livre", perfil: P1, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "pivo" }, plano: { cadencia: 5, tomFinal: "E menor" } },
        cifrasAluno: true, alvoCompassos: 5,
        instrucoes: "<p>Componha vozes e cifras: lá menor → mi menor (v) em 5 c., pivô pré-dominante, ré♯ na voz do ré natural (ou longe dele), cadência perfeita no c. 5.</p>",
        texto: "tom: A menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: A menor\nsoprano: E5/2 D5/1 A4/1 A4/1 G#4/1 A4/1 E5/1 D#5/1 E5/1 F#5/1 E5/1 E5/2 D#5/2 E5/4\nbaixo: A2/2 B2/1 C3/1 D3/1 E3/1 C3/1 A2/1 F#2/1 G2/1 A2/2 B2/2 B2/2 E2/4",
        solucaoCifras: "i V43 i6 iv V i6 i=e:iv V43 i6 ii°6 i64 V7 i",
        comentarioSolucao: "i de lá = iv de mi, logo após o i6: costura invisível. Fá♯ e ré♯ entram no V43; ii°6 e 6/4 dão tempo antes do V7 → i." },
      { id: "pv5", titulo: "Quebrar: a cadência de coral", modo: "quebrar", perfil: { ...P1, mod_caminho: "info" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "D maior", tipo: "pivo" }, plano: { cadencia: 4 } },
        cifrasAluno: true, cifrasIniciais: "I V6 I",
        instrucoes: "<p>Duas frases de coral em sol. <b>Quebre o “tempo depois do pivô”</b>: pivô no 4º tempo do c. 1, ré maior <b>já</b> no c. 2 (pivô → V → I); a 2ª frase volta a sol (<code>G:</code>) com cadência perfeita.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/1 F#2/1 G2/1 E2/1 A2/2 D3/2 B2/1 C3/1 D3/1 D3/1 G2/4", duracao: 1, alvoCompassos: 4,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/1 A4/1 G4/1 B4/1 C#5/2 D5/2 D5/1 C5/1 B4/1 A4/1 G4/4\nbaixo: G2/1 F#2/1 G2/1 E2/1 A2/2 D3/2 B2/1 C3/1 D3/1 D3/1 G2/4",
        solucaoCifras: "I V6 I vi=D:ii V I G:I6 IV I64 V7 I",
        comentarioSolucao: "Mi menor (vi = ii de ré) → lá maior, dó♯ sobe a ré: cadência em dois tempos. Ré é V de sol, então a volta soa natural." },
    ],
  });

  // ================================================================ 2. cromática

  const C2_FD = pt("F maior", "A4/2 G4/1 A4/1 D5/1 E5/1 C5/2 C#5/2 D5/2 E5/2 D5/1 C#5/1 D5/4", "F2/2 E2/1 F2/1 Bb2/1 C3/1 A2/2 A2/2 D3/2 G2/2 A2/1 A2/1 D3/4");
  const C2_FD_CIF = "I V6 I IV V I6 d:V i ii°6 i64 V7 i";

  T.inserir(4, {
    id: "modulacao2", titulo: "Modulação II: cromática",
    objetivo: "Modular sem pivô diatônico: inflexão cromática numa voz, acorde comum alterado ou nota comum.",
    ouvir: [
      "Corais de Bach: inflexão dó → dó♯ do I ao vi",
      "Beethoven, “Waldstein”, 1º mov.: dó → 2º tema em mi maior",
      "Schubert, Quinteto D. 956, 1º mov.: dó → 2º tema em mi♭",
    ],
    esboco: "Sem consultar a aula: em dó maior, toque I – IV – iv. Que nota mudou, e em que voz? Para que tom o iv poderia levar?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Quando não há acorde comum (ou ele é alterado)", html: `
        <p>Três famílias sem pivô diatônico.</p>
        <h3>1. Inflexão cromática numa voz</h3>
        ${tab(["Regra", "Como"], [
          ["Semitom cromático", "dó → dó♯: a nota característica (em geral a sensível), já na dominante nova"],
          ["Mesma voz", "em vozes diferentes = falsa relação"],
          ["Direção", "elevada sobe (dó♯ → ré), abaixada desce (si♭ → lá)"],
          ["Confirmação", "dominante nova e cadência perfeita"]])}
        ${tab(["Tom velho → novo", "Acorde de saída", "Inflexão", "Chegada"], [
          ["Fá → ré menor", "I6 (dó no soprano)", "dó → dó♯", "V de ré → i"],
          ["Sol → mi menor", "I6 (ré no soprano)", "ré → ré♯", "V de mi → i"],
          ["Dó → lá menor", "V (sol no baixo)", "sol → sol♯", "V6 de lá → i"],
          ["Dó → sol", "IV (fá no baixo)", "fá → fá♯", "V65 de sol → I"],
          ["Dó → mi♭", "IV (lá no soprano)", "lá → lá♭", "iv = ii de mi♭ (acorde alterado)"]])}
        <h3>2. Acorde comum alterado</h3>
        <p>Empréstimo, napolitana ou dominante secundária. Em dó maior:</p>
        ${tab(["Pivô", "em dó", "no tom novo", "Tom novo"], [
          ["fá–lá♭–dó", "iv (de dó menor)", "ii", "mi♭ maior"],
          ["fá–lá♭–dó", "iv", "vi", "lá♭ maior"],
          ["lá♭–dó–mi♭", "♭VI", "IV", "mi♭ maior"],
          ["ré♭–fá–lá♭", "N6", "IV6", "lá♭ maior"],
          ["ré–fá♯–lá", "V/V", "IV", "lá maior"]])}
        <p>Todos são <b>pré-dominantes no tom novo</b>. Cifra: <code>iv=Eb:ii</code>, <code>N6=F:IV6</code>.</p>
        <h3>3. Nota comum e mediantes cromáticas</h3>
        <p>Uma nota presa no soprano liga os tons (Schubert).</p>
        ${tab(["De dó maior para", "Relação", "Nota comum", "Nota que muda"], [
          ["mi maior", "III♯ (mediante superior)", "mi", "sol → sol♯"],
          ["lá maior", "VI♯ (submediante superior)", "mi", "dó → dó♯"],
          ["mi♭ maior", "♭III", "sol", "mi → mi♭"],
          ["lá♭ maior", "♭VI", "dó", "sol → lá♭, mi → mi♭"]])}
        <p>Depois, cadência no tom novo.</p>` },

      { tipo: "exemplo", titulo: "Fá maior → ré menor: dó → dó♯ no soprano", intro: "O mesmo baixo (lá) serve a fá e a ré; muda uma nota do soprano.",
        camadas: [
          ex("1. Fá maior até o I6", pt("F maior", "A4/2 G4/1 A4/1 D5/1 E5/1 C5/2", "F2/2 E2/1 F2/1 Bb2/1 C3/1 A2/2"), "I V6 I IV V I6", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "Fá firmado; soprano sobe ao mi5 e cai no dó5 sobre o I6."],
              ["decisao", "Termina no I6, não no I: o lá do baixo servirá ao V de ré."]] }),
          ex("2. A inflexão e a confirmação", C2_FD, C2_FD_CIF, {
            contexto: cx("D menor", "cromatica", 5),
            anotacoes: [[0, 6, "dó"], [0, 7, "dó♯"]],
            notas: [["decisao", "C5 → C♯5 sobre o mesmo lá: I6 de fá vira V de ré; o dó♯ sobe a ré."],
              ["decisao", "Confirmação ii°6 – i64 – V7 – i; o 4–3 do 6/4 é o próprio ré–dó♯."],
              ["rejeitada", "Pivô B♭ (IV = VI): funcionaria, mas a inflexão é mais curta e audível."]],
            pausa: ["Fá maior é III em ré. Por que não chamar o I6 de pivô (I6=d:III6)?", "Poderia, mas ninguém ouve ré menor no c. 2: o centro só muda quando o dó vira dó♯."] }),
        ] },

      { tipo: "exemplo", titulo: "Acorde comum alterado: dó maior → mi♭ maior pelo iv = ii", intro: "O iv emprestado de dó menor é ii em mi♭.",
        camadas: [
          ex("IV – iv = ii – V65 de mi♭", pt("C maior", "E5/2 D5/1 C5/1 A4/1 Ab4/1~ Ab4/2 G4/1 C5/1 G4/1 F4/1 Eb4/4", "C3/2 B2/1 C3/1 F3/1 F3/1 D3/2 Eb3/1 Ab3/1 Bb3/1 Bb3/1 Eb3/4"), "I V65 I IV iv=Eb:ii V65 I IV I64 V7 I", {
            contexto: cx("Eb maior", "pivo", 4),
            anotacoes: [[0, 4, "lá"], [0, 5, "lá♭"]],
            notas: [["decisao", "IV → iv sobre o mesmo fá: lá → lá♭ no soprano. Fá menor = iv em dó, ii em mi♭."],
              ["decisao", "O lá♭ preso vira 7ª do V65 de mi♭ e desce a sol: inflexão, pivô e 7ª numa nota."],
              ["rejeitada", "Pivô diatônico: não há tríade comum pré-dominante em mi♭."]] }),
        ] },

      { tipo: "contraste", titulo: "Inflexão na mesma voz × falsa relação",
        a: lado("A — dó → dó♯ no soprano", C2_FD, C2_FD_CIF, { contexto: cx("D menor", "cromatica", 5) }),
        b: lado("B — dó no soprano, dó♯ no baixo", pt("F maior", "A4/2 G4/1 A4/1 D5/1 E5/1 C5/2 E5/2 F5/2 E5/2 D5/1 C#5/1 D5/4", "F2/2 E2/1 F2/1 Bb2/1 C3/1 A2/2 C#3/2 D3/2 G2/2 A2/1 A2/1 D3/4"), "I V6 I IV V I6 d:V6 i ii°6 i64 V7 i", {
          perfil: { ...P2, mod_falsa_relacao: "info" }, contexto: cx("D menor", "direta", 5) }),
        pergunta: "Mesmos acordes até o c. 2, mesma chegada a ré menor. O que você ouve no c. 3?",
        comentario: "<p>A: dó → dó♯ na mesma voz, uma inflexão. B: dó5 no soprano, dó♯3 no baixo — falsa relação, um choque. A escola proíbe; a polifonia inglesa e os românticos a usam pelo atrito.</p>" },

      { tipo: "quebra", titulo: "A nota comum como única ponte (Schubert, Beethoven)", html: `
        ${tab(["Obra", "O que quebra", "Efeito"], [
          ["Beethoven, “Waldstein” op. 53", "2º tema em mi maior (dó)", "mediante no lugar do V"],
          ["Beethoven, op. 31 nº 1", "2º tema em si maior (sol)", "idem"],
          ["Schubert, Quinteto D. 956", "2º tema em mi♭ (dó); nota presa, sem dominante", "mudança de luz, não chegada"],
          ["Tallis, Byrd, Purcell", "7ª natural e elevada em vozes diferentes na cadência", "falsa relação inglesa"]])}
        <p>Cai a “ponte funcional”; a nota comum impede que soe como erro.</p>`,
        exemplos: [
          lado("Dó maior → mi maior: o mi fica no soprano, a harmonia sobe uma 3ª maior", pt("C maior", "G4/1 A4/1 B4/1 E5/1~ E5/2 C#5/2 G#4/2 F#4/2 E4/4", "C3/1 A2/1 G2/1 C3/1 E3/2 A2/2 B2/2 B2/2 E3/4"), "I IV6 V I E:I IV I64 V7 I", {
            perfil: { ...P2, mod_nota_comum: "erro" }, contexto: cx("E maior", "nota comum", 4, { notaComum: true }),
            comentario: "Mi5 (3ª de dó) preso vira fundamental de mi maior. Sem dominante antes; a cadência confirma depois." }),
          lado("Dó maior → lá♭ maior: o dó fica, o baixo desce uma 3ª maior", pt("C maior", "E5/2 D5/2 C5/2~ C5/2 Db5/2 C5/1 Bb4/1 Ab4/4", "C3/2 G2/2 C3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4"), "I V I Ab:I ii6 I64 V7 I", {
            perfil: { ...P2, mod_nota_comum: "erro" }, contexto: cx("Ab maior", "nota comum", 4, { notaComum: true }),
            comentario: "Dó vira 3ª de lá♭ maior (♭VI): queda, escurecimento — o oposto da subida a mi maior." }),
        ] },
    ],
    exercicios: [
      { id: "cr1", titulo: "Completar: de sol maior a mi menor pela inflexão ré → ré♯", modo: "completar", perfil: P2, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "cromatica" }, plano: { cadencia: 5, tomFinal: "E menor" } },
        cifrasAluno: true, cifrasIniciais: "I V43 I6 IV V I I6",
        instrucoes: "<p>C. 1–2 dados (fim: I6 de sol, ré5 no soprano). No c. 3, sobre o mesmo si, entre em mi menor <b>sem pivô</b>: inflexão na voz do ré. Cadência perfeita em mi.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 D5/1 E5/1 F#5/1 G5/1 D5/1\nbaixo: G2/2 A2/1 B2/1 C3/1 D3/1 G2/1 B2/1 B2/2 E3/2 A2/2 B2/1 B2/1 E3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 D5/1 E5/1 F#5/1 G5/1 D5/1 D#5/2 E5/2 C5/2 B4/1 D#5/1 E5/4\nbaixo: G2/2 A2/1 B2/1 C3/1 D3/1 G2/1 B2/1 B2/2 E3/2 A2/2 B2/1 B2/1 E3/4",
        solucaoCifras: "I V43 I6 IV V I I6 e:V i iv i64 V7 i",
        comentarioSolucao: "Ré5 → ré♯5 sobre o si: o I6 de sol vira o V de mi. A sensível nova sobe a mi5 sobre o i. Depois, iv – i6/4 – V7 – i, com o soprano dó5 – si4 – ré♯5 – mi5." },
      { id: "cr2", titulo: "Menos apoio: a inflexão no baixo (dó maior → lá menor)", modo: "menos apoio", perfil: P2, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "A menor", tipo: "cromatica" }, plano: { cadencia: 5, tomFinal: "A menor" } },
        cifrasAluno: true,
        instrucoes: "<p>Melodia dada (dó → lá menor); escreva baixo e cifras. A modulação ocorre no si4 preso (c. 2–3); como a melodia não altera nada, a <b>inflexão fica no baixo</b>, sem pivô.</p>",
        texto: "tom: C maior\ncf: soprano\nsoprano: E5/2 D5/1 B4/1 C5/2 B4/2~ B4/2 C5/2 D5/2 C5/1 B4/1 A4/4\nbaixo:", duracao: 1, alvoCompassos: 5,
        solucao: "tom: C maior\ncf: soprano\nsoprano: E5/2 D5/1 B4/1 C5/2 B4/2~ B4/2 C5/2 D5/2 C5/1 B4/1 A4/4\nbaixo: C3/2 F3/1 G3/1 E3/2 G3/2 G#3/2 A3/2 D3/2 E3/1 E3/1 A2/4",
        solucaoCifras: "I ii6 V I6 V a:V6 i iv i64 V7 i",
        comentarioSolucao: "Si4: 3ª do V de dó, 5ª do V de lá. O baixo sobe sol → sol♯ e o V de dó vira V6 de lá." },
      { id: "cr3", titulo: "Restrição: de sol maior a mi♭ maior pela nota comum", modo: "restrição", perfil: { ...P2, mod_nota_comum: "erro" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "Eb maior", tipo: "nota comum" }, notaComum: true, plano: { cadencia: 5, tomFinal: "Eb maior" } },
        cifras: ["I", "V65", "I", "IV", "V", "I", "Eb:I", "IV", "I64", "V7", "I"],
        instrucoes: "<p>Baixo e cifras dados: sol maior, e no c. 3 mi♭ maior (♭VI) sem preparação. Escreva o soprano. <b>Restrição:</b> na troca, o soprano segura a nota comum. Qual?</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: D5/2 C5/1 B4/1\nbaixo: G2/2 F#2/1 G2/1 C3/1 D3/1 G3/2 Eb3/2 Ab2/2 Bb2/2 Bb2/2 Eb3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: G maior\ncf: baixo\nsoprano: D5/2 C5/1 B4/1 C5/1 A4/1 G4/2~ G4/2 C5/2 G4/2 F4/2 Eb4/4\nbaixo: G2/2 F#2/1 G2/1 C3/1 D3/1 G3/2 Eb3/2 Ab2/2 Bb2/2 Bb2/2 Eb3/4",
        comentarioSolucao: "Sol: tônica de sol, 3ª de mi♭. O soprano o segura enquanto o baixo desce sol → mi♭; a cadência dos c. 4–5 confirma." },
      { id: "cr4", titulo: "Livre: de lá menor a fá maior pela napolitana", modo: "livre", perfil: P2, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "F maior", tipo: "pivo" }, plano: { cadencia: 6, tomFinal: "F maior" } },
        cifrasAluno: true, alvoCompassos: 6,
        instrucoes: "<p>Componha vozes e cifras: lá menor → fá maior (VI) com a <b>napolitana de lá</b> como pivô (que acorde é em fá?). Cadência em fá até o c. 6.</p>",
        texto: "tom: A menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: A menor\nsoprano: C5/2 B4/1 C5/1 D5/1 B4/1 A4/2 Bb4/4 A4/2 D5/2 A4/2 G4/2 F4/4\nbaixo: A2/2 G#2/1 A2/1 D3/1 E3/1 A2/2 D3/2 E3/2 F3/2 Bb2/2 C3/2 C3/2 F2/4",
        solucaoCifras: "i V6 i iv V i N6=F:IV6 V65 I ii6 I64 V7 I",
        comentarioSolucao: "Si♭–ré–fá: N6 de lá = IV6 de fá. O si♭4 preso vira 7ª do V65 de fá e desce a lá." },
      { id: "cr5", titulo: "Quebrar: a falsa relação", modo: "quebrar", perfil: { ...P2, mod_falsa_relacao: "info" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "direta" }, plano: { cadencia: 5, tomFinal: "E menor" } },
        cifrasAluno: true, cifrasIniciais: "I V43 I6 IV V I6",
        instrucoes: "<p>Sol → mi menor. <b>Quebre a inflexão na mesma voz</b>: I6 de sol com <b>ré5 no soprano</b> no fim do c. 2; no c. 3, ré♯ <b>no baixo</b> (V6 de mi). Cadência perfeita em mi.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 D5/1\nbaixo: G2/2 A2/1 B2/1 C3/1 D3/1 B2/2 D#3/2 E3/2 A2/2 B2/1 B2/1 E3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 D5/1 E5/1 F#5/1 D5/2 F#5/2 E5/2 C5/2 B4/1 D#5/1 E5/4\nbaixo: G2/2 A2/1 B2/1 C3/1 D3/1 B2/2 D#3/2 E3/2 A2/2 B2/1 B2/1 E3/4",
        solucaoCifras: "I V43 I6 IV V I6 e:V6 i iv i64 V7 i",
        comentarioSolucao: "Ré5 no soprano, ré♯3 no baixo: a inflexão vira choque. Erro no coral escolar; atrito expressivo na polifonia inglesa." },
    ],
  });

  // ================================================================ 3. enarmônica

  const C3_CEB = pt("C maior", "E5/2 D5/1 C5/1 A4/1 B4/1 G4/2 Ab4/2 G4/1 F4/1 G4/1 Ab4/1 F4/1 Eb4/1", "C3/2 B2/1 C3/1 F3/1 G3/1 C4/2 Cb4/2 Bb3/1 Bb3/1 Eb3/1 Ab3/1 Bb3/1 Eb3/1");
  const C3_CEB_CIF = "I V65 I IV V I vii°7=Eb:vii°42 I64 V7 I IV V7 I";

  T.inserir(4, {
    id: "modulacao3", titulo: "Modulação III: enarmônica",
    objetivo: "Chegar a tons distantes por pivô enarmônico (vii°7, Ger65 = V7, V+), grafado pela resolução.",
    ouvir: [
      "Beethoven, “Patética”, Grave: sétimas diminutas",
      "Liszt, Sinfonia Fausto, início: tríades aumentadas",
      "Wagner, Tristão, Prelúdio: o acorde ambíguo",
    ],
    esboco: "Sem consultar a aula: toque si–ré–fá–lá♭ e resolva-o primeiro em dó. Depois toque o mesmo acorde e resolva-o em lá menor e em mi♭. Que nota subiu meio tom em cada caso?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "Um som, várias grafias", html: `
        <p>Acorde ouvido numa leitura; a resolução revela outra.</p>
        <h3>1. Sétima diminuta: quatro sensíveis</h3>
        <p>Quatro 3ªs menores dividem a oitava: qualquer nota pode ser a sensível.</p>
        ${tab(["Grafia", "Sensível", "Resolve em", "Cifra a partir de dó"], [
          ["si–ré–fá–lá♭", "si", "dó (maior ou menor)", "vii°7"],
          ["ré–fá–lá♭–dó♭", "ré", "mi♭", "vii°7=Eb:vii°7 (ou eb:)"],
          ["mi♯–sol♯–si–ré", "mi♯", "fá♯", "vii°7=f#:vii°7"],
          ["sol♯–si–ré–fá", "sol♯", "lá", "vii°7=a:vii°7"]])}
        <p>Distâncias: 3ª m, trítono, 6ª M. Baixar uma nota do vii°7 por semitom dá um V7.</p>
        <h3>2. V7 = sexta alemã</h3>
        ${tab(["Leitura", "Exemplo", "Resolução", "Destino"], [
          ["Ger65 → V7", "em dó: lá♭–dó–mi♭–fá♯ = sol♭", "sol♭ desce a fá; baixo lá♭ → ré♭", "ré♭ (½ tom acima)"],
          ["V7 → Ger65", "em fá: dó–mi–sol–si♭ = lá♯", "dó → si, lá♯ → si", "mi menor (½ tom abaixo)"]])}
        <p><b>7ª da dominante desce; 6ª aumentada abre-se em 8ª</b> sobre o 5º grau. A italiana serve igual.</p>
        <h3>3. Tríade aumentada: três leituras</h3>
        <p>Sol–si–ré♯ (V+ de dó) = mi♭–sol–si (lá♭) = si–ré♯–fá𝄪 (mi): ciclo de 3ªs maiores.</p>
        <h3>Grafia e condução</h3>
        <ul>
          <li><b>Grafe pela resolução</b>: lá♭ que sobe é sol♯.</li>
          <li>Prepare na leitura velha; confirme com cadência.</li>
        </ul>
        <p>Cifra: <code>vii°7=Eb:vii°42</code>, <code>Ger65=Db:V7</code>, <code>V+=Ab:V+6</code>.</p>` },

      { tipo: "exemplo", titulo: "A sétima diminuta de dó resolvida em mi♭", intro: "O mesmo acorde: primeiro como esperado, depois reescrito.",
        camadas: [
          ex("1. O vii°7 em dó, resolvendo em dó", pt("C maior", "E5/2 D5/1 C5/1 A4/1 B4/1 G4/2 Ab4/2 G4/2", "C3/2 B2/1 C3/1 F3/1 G3/1 C4/2 B3/2 C4/2"), "I V65 I IV V I vii°7 I", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "vii°7 de dó: si sobe a dó, lá♭ desce a sol. Uso normal."]] }),
          ex("2. O mesmo som, grafado ré–fá–lá♭–dó♭: mi♭ maior", C3_CEB, C3_CEB_CIF, {
            contexto: cx("Eb maior", "enarmonica", 4),
            anotacoes: [[1, 6, "si = dó♭"]],
            notas: [["decisao", "Baixo si grafado dó♭: 7ª do vii°42 de mi♭, desce a si♭. Espera-se dó; vem o I64 de mi♭."],
              ["decisao", "Salto de três bemóis: cadência explícita logo (I64 – V7 – I – IV – V7 – I)."],
              ["rejeitada", "Grafar si: a partitura diria “sobe” e a música desce; si → si♭ pareceria cromatismo."]],
            pausa: ["O que muda no soprano entre os passos 1 e 2?", "Nada: sol – lá♭ – sol. Muda o baixo (si → dó ou dó♭ → si♭) e o que vem depois."] }),
        ] },

      { tipo: "contraste", titulo: "Sexta alemã × V7: a mesma sonoridade, duas resoluções",
        a: lado("A — sexta alemã de dó: abre-se em sol", pt("C maior", "E5/2 F5/2 F#5/2 G5/1 F5/1 E5/4", "C3/2 A2/2 Ab2/2 G2/1 G2/1 C3/4"), "I IV6 Ger65 I64 V7 I", { contexto: cx(null, null, 0) }),
        b: lado("B — o mesmo acorde como V7 de ré♭: a “sexta” desce", pt("C maior", "E5/2 F5/2 Gb5/2 F5/2 Eb5/2 F5/1 Eb5/1 Db5/4", "C3/2 A2/2 Ab2/2 Db3/2 Gb2/2 Ab2/1 Ab2/1 Db3/4"), "I IV6 Ger65=Db:V7 I ii6 I64 V7 I", { contexto: cx("Db maior", "enarmonica", 4) }),
        pergunta: "Os c. 1–2 soam igual. Onde está a diferença, na partitura e no ouvido?",
        comentario: "<p>A: fá♯5 e lá♭2 abrem-se em 8ª sobre sol — sexta alemã de dó. B: sol♭5 <b>desce</b> a fá5 (7ª de dominante) e o baixo salta a ré♭ — ré♭ maior. A grafia diz qual história é.</p>" },

      { tipo: "quebra", titulo: "Tons remotos e ciclos de terças (Schubert, Liszt, Wagner)", html: `
        ${tab(["Quem", "O que quebra", "Efeito"], [
          ["Classicismo", "enarmonia como exceção, com cadência logo", "surpresa"],
          ["Schubert", "Ger65 ↔ V7 como rotina", "tons a ½ tom de distância"],
          ["Liszt, Sinfonia Fausto", "tema sobre tríades aumentadas", "ambiguidade máxima"],
          ["Wagner, Tristão", "resolução adiada", "tonalidade suspensa"]])}
        <p>Cai a distância, depois a confirmação, por fim a grafia como verdade (grafia antiga por legibilidade).</p>`,
        exemplos: [
          lado("A tríade aumentada: o V+ de dó (sol–si–ré♯) lido como V+ de lá♭ (mi♭–sol–si)", pt("C maior", "E5/2 D5/2 C5/2 Eb5/2~ Eb5/2 Db5/2 C5/1 Bb4/1 Ab4/2", "C3/2 G2/2 C3/2 G2/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/2"), "I V I V+=Ab:V+6 I ii6 I64 V7 I", {
            perfil: P3, contexto: cx("Ab maior", "enarmonica", 4),
            comentario: "Sol–si–ré♯ grafado com mi♭ (leitura de lá♭): o sol sobe a lá♭ e o mi♭ fica. Lá♭ maior, 3ª M abaixo de dó." }),
        ] },
    ],
    exercicios: [
      { id: "en1", titulo: "Completar: de lá menor a dó menor pela sétima diminuta", modo: "completar", perfil: P3, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "C menor", tipo: "enarmonica" }, plano: { cadencia: 5, tomFinal: "C menor" } },
        cifrasAluno: true, cifrasIniciais: "i V65 i iv V i",
        instrucoes: "<p>No 4º tempo do c. 2, o vii°65 de lá (si no baixo): <b>reinterprete-o</b> como vii°7 de dó menor (<code>vii°65=c:vii°7</code>) e siga até a cadência perfeita em dó menor.</p>",
        texto: "tom: A menor\ncf: baixo\nsoprano: C5/2 B4/1 C5/1 D5/1 B4/1 C5/1\nbaixo: A2/2 G#2/1 A2/1 D3/1 E3/1 A2/1 B2/1 C3/2 Ab2/2 G2/2 G2/2 C3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: A menor\ncf: baixo\nsoprano: C5/2 B4/1 C5/1 D5/1 B4/1 C5/1 D5/1 Eb5/2 C5/2 C5/2 B4/2 C5/4\nbaixo: A2/2 G#2/1 A2/1 D3/1 E3/1 A2/1 B2/1 C3/2 Ab2/2 G2/2 G2/2 C3/4",
        solucaoCifras: "i V65 i iv V i vii°65=c:vii°7 i iv6 i64 V7 i",
        comentarioSolucao: "Sol♯–si–ré–fá = si–ré–fá–lá♭: si vira sensível de dó e sobe; sol♯ vira lá♭ e desce. Soprano ré5 → mi♭5." },
      { id: "en2", titulo: "Menos apoio: de sol maior a lá♭ maior (sexta alemã = V7)", modo: "menos apoio", perfil: P3, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "Ab maior", tipo: "enarmonica" }, plano: { cadencia: 5, tomFinal: "Ab maior" } },
        cifrasAluno: true,
        instrucoes: "<p>Só o baixo é dado. No c. 3, a sexta alemã de sol (mi♭ no baixo) vira V7 de lá♭; a 7ª nova <b>grafada pela resolução</b>, descendo. Cadência perfeita em lá♭ no c. 5.</p>",
        texto: "tom: G maior\ncf: baixo\nsoprano:\nbaixo: G2/2 C3/1 D3/1 G2/2 E3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: G maior\ncf: baixo\nsoprano: B4/2 C5/1 A4/1 B4/2 C5/2 Db5/2 C5/2 Bb4/2 C5/1 Bb4/1 Ab4/4\nbaixo: G2/2 C3/1 D3/1 G2/2 E3/2 Eb3/2 Ab2/2 Db3/2 Eb3/1 Eb3/1 Ab2/4",
        solucaoCifras: "I IV V I IV6 Ger65=Ab:V7 I ii6 I64 V7 I",
        comentarioSolucao: "Soprano dó5 → ré♭5 (dó♯ reescrito): 7ª do V7 de lá♭, desce a dó5. Escrito dó♯, seria uma 6ª aumentada que não se abre." },
      { id: "en3", titulo: "Restrição: de fá maior a mi menor (V7 = sexta alemã)", modo: "restrição", perfil: { ...P3, mod_grafia_enarmonica: "erro" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "E menor", tipo: "enarmonica" }, plano: { cadencia: 4, tomFinal: "E menor" } },
        cifrasAluno: true, cifrasIniciais: "I V65 I IV I6 ii6",
        instrucoes: "<p>No 4º tempo do c. 2, o V7 de fá vira <b>sexta alemã de mi menor</b>, resolvida no 6/4 cadencial. <b>Restrição:</b> pivô grafado na leitura nova, com a 6ª aumentada no soprano. Que nota é?</p>",
        texto: "tom: F maior\ncf: baixo\nsoprano: A4/2 G4/1 A4/1 D5/1 C5/1 Bb4/1\nbaixo: F2/2 E2/1 F2/1 Bb2/1 A2/1 Bb2/1 C3/1 B2/2 B2/2 E3/1 A2/1 B2/1 E2/1", duracao: 1, alvoCompassos: 4,
        solucao: "tom: F maior\ncf: baixo\nsoprano: A4/2 G4/1 A4/1 D5/1 C5/1 Bb4/1 A#4/1 B4/2 A4/2 G4/1 A4/1 F#4/1 E4/1\nbaixo: F2/2 E2/1 F2/1 Bb2/1 A2/1 Bb2/1 C3/1 B2/2 B2/2 E3/1 A2/1 B2/1 E2/1",
        solucaoCifras: "I V65 I IV I6 ii6 V7=e:Ger65 i64 V7 i iv V7 i",
        comentarioSolucao: "Si♭4 reescrito lá♯4: a 7ª vira 6ª aumentada e sobe a si, com o baixo dó → si. Como 7ª desceria a lá." },
      { id: "en4", titulo: "Livre: de mi menor a sol menor", modo: "livre", perfil: P3, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "G menor", tipo: "enarmonica" }, plano: { cadencia: 4, tomFinal: "G menor" } },
        cifrasAluno: true, alvoCompassos: 4,
        instrucoes: "<p>Componha vozes e cifras: mi menor → sol menor <b>reinterpretando o vii°7</b> (que nota vira sensível de sol?). Cadência perfeita no c. 4.</p>",
        texto: "tom: E menor\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: E menor\nsoprano: G4/2 F#4/1 G4/1 A4/1 F#4/1 G4/1 A4/1 Bb4/1 C5/1 Bb4/1 A4/1 G4/4\nbaixo: E3/2 D#3/1 E3/1 A2/1 B2/1 E3/1 F#3/1 G3/1 Eb3/1 D3/1 D3/1 G2/4",
        solucaoCifras: "i V65 i iv V i vii°65=g:vii°7 i iv6 i64 V7 i",
        comentarioSolucao: "Ré♯–fá♯–lá–dó = fá♯–lá–dó–mi♭: fá♯ é sensível de sol. Baixo mi – fá♯ – sol por grau; a mudança só aparece no si♭." },
      { id: "en5", titulo: "Quebrar: o ciclo de terças maiores", modo: "quebrar", perfil: { ...P3, modulacao: "info", mod_grafia_enarmonica: "info", mod_plano_de_tons: "erro" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "Ab maior", tipo: "enarmonica" }, planoTons: [[2, "E maior"], [3, "Ab maior"], [4, "C maior"]], plano: { cadencia: 5 } },
        cifrasAluno: true, cifrasIniciais: "I",
        instrucoes: "<p>Ciclo de 3ªs maiores: dó → mi (c. 2) → lá♭ (c. 3) → dó (c. 4–5), cada passo por <b>V+</b> reinterpretado (<code>V+6=E:V+</code>). <b>Quebre a confirmação:</b> mi e lá♭ só com o V+, dois tempos cada. Cadência perfeita em dó.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano:\nbaixo: C3/2 B2/2 E3/2 Eb3/2 Ab3/2 G3/2 C3/1 F3/1 G3/1 G3/1 C3/4", duracao: 1, alvoCompassos: 5,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/2 D#5/2 E5/2 G5/2 Ab5/2 Eb5/2 E5/1 D5/1 E5/1 D5/1 C5/4\nbaixo: C3/2 B2/2 E3/2 Eb3/2 Ab3/2 G3/2 C3/1 F3/1 G3/1 G3/1 C3/4",
        solucaoCifras: "I V+6=E:V+ I V+6=Ab:V+ I V+6=C:V+ I ii6 I64 V7 I",
        comentarioSolucao: "Cada V+ serve a dois tons a 3ª M. Baixo desce por semitons (dó–si, mi–mi♭, lá♭–sol); sem cadência intermediária, os tons passam como paisagens." },
    ],
  });

  // ================================================================ 4. na forma

  const C4_SEQ = pt("C maior", "E5/1 F5/1 D5/1 E5/1 F5/1 G5/1 E5/1 F5/1 G5/1 A5/1 F#5/1 G5/1 E5/2 B4/1 A4/1 G4/4", "C3/1 F3/1 G3/1 C3/1 D3/1 G3/1 A3/1 D3/1 E3/1 A3/1 B3/1 E4/1 C4/2 D4/1 D4/1 G3/4");
  const C4_SEQ_CIF = "I IV V I d:i iv V i e:i iv V i=G:vi ii6 I64 V7 I";

  T.inserir(4, {
    id: "modulacao4", titulo: "Modulação na forma",
    objetivo: "Planejar o plano de tons de uma forma e escrever sequência modulante, modulação direta e retorno.",
    ouvir: [
      "Bach, Suítes francesas: binárias I → V | V → I",
      "Mozart, Sonata K. 545, 1º mov.: recapitulação em fá (IV)",
      "Beethoven, “Waldstein”, 1º mov.: 2º grupo em mi maior",
    ],
    esboco: "Sem consultar a aula: desenhe o plano de tons (só os tons e onde chegam) da primeira parte de um minueto de 8 compassos em mi menor. Onde você poria a modulação?",
    secoes: [
      { tipo: "texto", rotulo: "A regra", titulo: "O plano de tons é a arquitetura", html: `
        <p>Na forma: <i>onde</i> modular, <i>para onde</i>, <i>por quanto tempo</i> (Koch; Rosen).</p>
        <h3>Para onde se vai</h3>
        ${tab(["Forma", "Em maior", "Em menor", "Volta"], [
          ["Período modulante", "antecedente em I (semicadência), consequente cadencia em V", "consequente em III (ou v)", "não volta: é a 1ª frase de algo maior"],
          ["Binária (dança barroca, minueto)", "1ª parte: I → V", "1ª parte: i → III (às vezes v)", "2ª parte: do V (III) de volta ao I, passando por vizinhos (vi, ii, IV)"],
          ["Exposição de sonata", "1º grupo em I, transição, 2º grupo em V", "2º grupo em III (às vezes v)", "recapitulação: os dois grupos em I"],
          ["Desenvolvimento", "sequências, tons vizinhos e remotos", "idem", "retransição: pedal ou prolongação do V do tom principal"],
          ["Trio (minueto, marcha)", "IV (ou o próprio I)", "III ou o homônimo maior", "da capo"]])}
        <h3>As técnicas de forma</h3>
        ${tab(["Técnica", "Como", "Onde"], [
          ["Pivô", "capítulos anteriores", "transição da exposição, 1ª parte da binária"],
          ["Sequência modulante", "modelo de 2–4 acordes repetido em outro grau; a última cópia vira pivô (<code>e:i=G:vi</code>) e recebe cadência", "desenvolvimentos, 2ª parte da binária"],
          ["Direta (de frase)", "frase fecha num tom, a seguinte abre em outro, sem ponte", "entre seções (trio, episódio de rondó)"],
          ["Retorno", "do V: acrescentar a 7ª do tom principal (fá natural); de longe: sequência ou pivô", "retransição, insistindo no V"]])}
        <h3>Quanto confirmar</h3>
        ${tab(["Papel do tom", "Confirmação"], [
          ["2º grupo de sonata", "seção inteira, várias cadências"],
          ["Consequente de período modulante", "uma cadência"],
          ["Etapa de sequência", "nenhuma (soa como passagem)"]])}
        <p>Decida primeiro o <b>plano de tons</b> (tom por compasso; o verificador confere), depois a técnica.</p>` },

      { tipo: "exemplo", titulo: "Sequência modulante: dó → ré menor → mi menor = sol: vi", intro: "Modelo de um compasso, duas cópias um grau acima; a última vira pivô.",
        camadas: [
          ex("1. O modelo", pt("C maior", "E5/1 F5/1 D5/1 E5/1", "C3/1 F3/1 G3/1 C3/1"), "I IV V I", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "Modelo curto e completo (T – PD – D – T), soprano em bordadura: fácil de reconhecer."]] }),
          ex("2. Duas cópias, um grau acima", pt("C maior", "E5/1 F5/1 D5/1 E5/1 F5/1 G5/1 E5/1 F5/1 G5/1 A5/1 F#5/1 G5/1", "C3/1 F3/1 G3/1 C3/1 D3/1 G3/1 A3/1 D3/1 E3/1 A3/1 B3/1 E3/1"), "I IV V I d:i iv V i e:i iv V i", {
            contexto: cx(null, null, 0),
            notas: [["decisao", "Cópias tonais: i – iv – V – i de ré menor, depois de mi menor."],
              ["decisao", "De longe, sequência dentro de dó (ii, iii); de perto, três pequenos tons."]],
            pausa: ["Se a música parasse aqui, em que tom estaria?", "Em nenhum (ou mi menor por inércia): o ouvido espera a 4ª cópia. A sequência suspende a tonalidade até algo quebrá-la."] }),
          ex("3. A última cópia vira pivô: cadência em sol", C4_SEQ, C4_SEQ_CIF, {
            contexto: cx("G maior", "pivo", 5, { planoTons: [[1, "C maior"], [2, "D menor"], [3, "E menor"], [5, "G maior"]] }),
            anotacoes: [[1, 11, "i = vi"]],
            notas: [["decisao", "Mi menor = vi de sol: o padrão para; segue ii6 – I64 – V7 – I."],
              ["decisao", "Baixo sobe ao mi4: o registro marca o fim do padrão."],
              ["rejeitada", "4ª cópia (fá♯ menor): mais longe e rotineira; três é o limite clássico."]] }),
        ] },

      { tipo: "contraste", titulo: "Modulação direta × modulação por pivô",
        a: lado("A — direta: cadência em dó, nova frase em sol", pt("C maior", "E5/2 D5/1 C5/1 C5/1 B4/1 C5/2 B4/1 A4/1 B4/1 C5/1 A4/2 G4/2", "C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 G3/1 F#3/1 G3/1 C3/1 D3/2 G2/2"), "I V43 I6 IV V I G:I V6 I IV V I", { contexto: cx("G maior", "direta", 4) }),
        b: lado("B — pivô: vi = ii, V65 e cadência em sol", C1_CG, C1_CG_CIF, { contexto: cx("G maior", "pivo", 5) }),
        pergunta: "Mesmo começo, mesma chegada em sol. Qual soa como “novo começo” e qual como “viagem”?",
        comentario: "<p>A: cadência em dó, nova frase em sol — a articulação é a ponte (entre seções). B: a mudança acontece <i>dentro</i> da frase — transição. Direta onde há articulação; pivô onde a música caminha.</p>" },

      { tipo: "quebra", titulo: "Três tons, recapitulações no lugar errado, saltos de tom", html: `
        ${tab(["Quem", "O que quebra", "Efeito"], [
          ["Beethoven, “Waldstein” / “Hammerklavier”", "2º grupo em III♯ / ♭VI", "mediante no lugar do V"],
          ["Schubert", "exposição de três tons", "viagem com escala até a dominante"],
          ["Mozart, K. 545", "recapitulação em IV", "a transição leva de fá a dó sem ser recomposta"],
          ["Haydn", "falsa recapitulação no desenvolvimento", "brinca com a expectativa"],
          ["Canção popular, românticos", "salto direto a tom não vizinho", "corte, intensificação"]])}`,
        exemplos: [
          lado("Exposição de três tons em miniatura: dó → mi menor → sol", pt("C maior", "E5/2 D5/2 C5/2 E5/2 D#5/2 E5/2 A4/2 B4/1 A4/1 G4/4", "C3/2 G2/2 C3/2 A2/2 B2/2 E3/2 C3/2 D3/1 D3/1 G2/4"), "I V I vi=e:iv V i=G:vi ii6 I64 V7 I", {
            perfil: P4, contexto: cx("G maior", "pivo", 5, { planoTons: [[1, "C maior"], [3, "E menor"], [5, "G maior"]] }),
            comentario: "Lá menor (vi = iv de mi) leva a mi menor (V – i); mi menor = vi de sol, e a frase cadencia no V. Numa exposição, cada tom é uma seção." }),
          lado("Corte direto meio tom acima: dó maior → ré♭ maior", pt("C maior", "E5/1 F5/1 D5/1 C5/1 F5/1 Gb5/1 Eb5/1 Db5/1", "C3/1 F3/1 G3/1 C3/1 Db3/1 Gb3/1 Ab3/1 Db3/1"), "I IV V I Db:I IV V7 I", {
            perfil: P4, contexto: cx("Db maior", "direta", 2),
            comentario: "A frase meio tom acima, sem nota comum nem pivô: o ouvido aceita porque reconhece a frase." }),
        ] },
    ],
    exercicios: [
      { id: "fm1", titulo: "Completar: o período modulante", modo: "completar", perfil: P4, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "G maior", tipo: "pivo" }, planoTons: [[1, "C maior"], [5, "C maior"], [8, "G maior"]], plano: { semicadencia: 4, cadencia: 8, tomFinal: "G maior" } },
        cifrasAluno: true, cifrasIniciais: "I V43 I6 IV V I vi ii6 V I V43 I6",
        instrucoes: "<p>Período de 8 c.: antecedente em semicadência em dó; consequente termina em <b>cadência perfeita em sol</b>. Escreva pivô (c. 6), cifras e soprano dos c. 6–8.</p>",
        texto: "tom: C maior\ncf: baixo\nsoprano: E5/2 D5/1 C5/1 A4/1 B4/1 C5/2 E5/2 D5/2 B4/4 E5/2 D5/1 C5/1\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F3/2 G3/4 C3/2 D3/1 E3/1 A3/2 F#3/2 G3/2 C3/2 D3/1 D3/1 G2/2", duracao: 1, alvoCompassos: 8,
        solucao: "tom: C maior\ncf: baixo\nsoprano: E5/2 D5/1 C5/1 A4/1 B4/1 C5/2 E5/2 D5/2 B4/4 E5/2 D5/1 C5/1 A4/2 D5/1 C5/1 B4/2 E5/2 B4/1 A4/1 G4/2\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C4/2 A3/2 F3/2 G3/4 C3/2 D3/1 E3/1 A3/2 F#3/2 G3/2 C3/2 D3/1 D3/1 G2/2",
        solucaoCifras: "I V43 I6 IV V I vi ii6 V I V43 I6 vi=G:ii V65 I ii6 I64 V7 I",
        comentarioSolucao: "Lá menor é vi no c. 3 e pivô (vi = ii de sol) no c. 6: a cor do tom vira a porta do tom novo." },
      { id: "fm2", titulo: "Menos apoio: a primeira parte de um minueto em mi menor", modo: "menos apoio", perfil: P4, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "G maior", tipo: "pivo" }, planoTons: [[1, "E menor"], [5, "G maior"], [8, "G maior"]], plano: { cadencia: 8, tomFinal: "G maior" } },
        cifrasAluno: true,
        instrucoes: "<p>1ª reprise de minueto (3/4), só baixo dado. Cifras e soprano: mi menor c. 1–3, pivô no fim do c. 3, sol maior desde o c. 4, cadências em sol nos c. 6–7 e 7–8.</p>",
        texto: "compasso: 3/4\ntom: E menor\ncf: baixo\nsoprano:\nbaixo: E3/2 D#3/1 E3/1 A2/1 B2/1 E3/2 A3/1 F#3/2 G3/1 B2/2 C3/1 D3/2 D3/1 G2/1 C3/1 D3/1 G2/3", duracao: 1, alvoCompassos: 8,
        solucao: "compasso: 3/4\ntom: E menor\ncf: baixo\nsoprano: G4/2 F#4/1 G4/1 C5/1 B4/1 B4/2 C5/1 D5/1 C5/1 B4/1 D5/2 E5/1 B4/2 A4/1 B4/1 C5/1 A4/1 G4/3\nbaixo: E3/2 D#3/1 E3/1 A2/1 B2/1 E3/2 A3/1 F#3/2 G3/1 B2/2 C3/1 D3/2 D3/1 G2/1 C3/1 D3/1 G2/3",
        solucaoCifras: "i V65 i iv V i iv=G:ii V65 I I6 ii6 I64 V I IV V7 I",
        comentarioSolucao: "Lá menor: iv de mi, ii de sol; fá♯ no baixo = V65 de sol. Duas cadências (I64 – V – I e codeta I – IV – V7 – I) firmam sol." },
      { id: "fm3", titulo: "Restrição: sequência de fá maior a dó maior", modo: "restrição", perfil: P4, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "C maior", tipo: "pivo" }, planoTons: [[1, "F maior"], [2, "G menor"], [3, "A menor"], [5, "C maior"]], plano: { cadencia: 5, tomFinal: "C maior" } },
        cifrasAluno: true, cifrasIniciais: "I IV V I",
        instrucoes: "<p>Modelo dado (c. 1). Duas cópias um grau acima. <b>Restrição — plano de tons:</b> c. 2 sol menor, c. 3 lá menor, cadência perfeita em <b>dó maior</b> no c. 5; a última cópia vira pivô.</p>",
        texto: "tom: F maior\nsoprano: A4/1 Bb4/1 G4/1 A4/1\nbaixo: F2/1 Bb2/1 C3/1 F2/1", duracao: 1, alvoCompassos: 5,
        solucao: "tom: F maior\nsoprano: A4/1 Bb4/1 G4/1 A4/1 Bb4/1 C5/1 A4/1 Bb4/1 C5/1 D5/1 B4/1 C5/1 A4/2 E4/1 D4/1 C4/4\nbaixo: F2/1 Bb2/1 C3/1 F2/1 G2/1 C3/1 D3/1 G2/1 A2/1 D3/1 E3/1 A3/1 F3/2 G3/1 G3/1 C3/4",
        solucaoCifras: "I IV V I g:i iv V i a:i iv V i=C:vi ii6 I64 V7 I",
        comentarioSolucao: "Cópias tonais; lá menor = vi de dó, depois ii6 – I64 – V7 – I. O exemplo da aula uma 5ª abaixo." },
      { id: "fm4", titulo: "Livre: ir à dominante e voltar", modo: "livre", perfil: P4, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "A maior", tipo: "pivo" }, planoTons: [[5, "A maior"], [8, "D maior"]], plano: { cadencia: 8 } },
        cifrasAluno: true, alvoCompassos: 8,
        instrucoes: "<p>8 c. em ré maior: module a lá (V) com cadência no c. 5 e <b>volte</b> a ré, cadência perfeita no c. 8. Que nota precisa reaparecer na volta?</p>",
        texto: "tom: D maior\nsoprano:\nbaixo:", duracao: 1,
        solucao: "tom: D maior\nsoprano: F#5/2 E5/1 D5/1 D5/1 C#5/1 D5/2 F#5/2 E5/1 D5/1 C#5/1 E5/1 F#5/1 D5/1 C#5/1 B4/1 A4/2 E5/2 D5/2 E5/2 F#5/1 E5/1 D5/4\nbaixo: D3/2 E3/1 F#3/1 G3/1 A3/1 D4/2 B3/2 G#3/2 A3/2 D3/2 E3/1 E3/1 A3/2 G3/2 F#3/2 G3/2 A3/1 A3/1 D3/4",
        solucaoCifras: "I V43 I6 IV V I vi=A:ii V65 I ii6 I64 V7 I D:V42 I6 ii6 I64 V7 I",
        comentarioSolucao: "Ida: si menor (vi = ii de lá), sol♯ no V65. Volta: sol natural no baixo faz do lá maior V42 de ré; sol cai a fá♯ (I6)." },
      { id: "fm5", titulo: "Quebrar: o salto direto para mi♭", modo: "quebrar", perfil: { ...P4, modulacao: "info" }, nivel: 6,
        contexto: { nivel: 6, modulacao: { para: "Eb maior", tipo: "pivo" }, planoTons: [[3, "Eb maior"]], plano: { cadencia: 4, tomFinal: "Eb maior" } },
        cifrasAluno: true, cifrasIniciais: "I V43 I6 IV V I",
        instrucoes: "<p>Frase em dó dada (c. 1–2). <b>Quebre o pivô:</b> no c. 3 entre <b>direto</b> em mi♭ maior (♭III) e repita a frase, com cadência perfeita no c. 4.</p>",
        texto: "tom: C maior\nsoprano: E5/2 D5/1 C5/1 A4/1 B4/1 C5/2\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C3/2", duracao: 1, alvoCompassos: 4,
        solucao: "tom: C maior\nsoprano: E5/2 D5/1 C5/1 A4/1 B4/1 C5/2 G5/2 F5/1 Eb5/1 C5/1 D5/1 Eb5/2\nbaixo: C3/2 D3/1 E3/1 F3/1 G3/1 C3/2 Eb3/2 F3/1 G3/1 Ab3/1 Bb3/1 Eb3/2",
        solucaoCifras: "I V43 I6 IV V I Eb:I V43 I6 IV V I",
        comentarioSolucao: "A frase uma 3ª m acima. O sol do soprano pertence às duas tônicas: sem preparação, soa como mudança de luz, não erro." },
    ],
  });

})(this);
