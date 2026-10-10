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
  // contexto de um exemplo: modulação para `para`, cadência final no compasso `cad`
  const cx = (para, tipo, cad, extra = {}) => ({ modulacao: para ? { para, tipo } : null, plano: cad ? { cadencia: cad, ...(para ? { tomFinal: para } : {}) } : {}, ...extra });

  // CAPITULOS
})(this);
