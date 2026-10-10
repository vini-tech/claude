/* Oficina: editor de exercício com partitura, piano, correção ao vivo e explicações.
 * Usada pelas práticas do curso (curso.html).
 *
 *   const of = Oficina.criar(elemento, {
 *     titulo, instrucoes,            // enunciado
 *     texto,                         // exercício inicial no formato de texto
 *     perfil,                        // { regra: "erro"|"aviso"|"info" }
 *     contexto,                      // ctx das regras (harmonia, plano, motivo, graus, alvo, cf, nivel)
 *     acordes,                       // ["I", "IV V", …] mostrados acima da pauta (opcional)
 *     duracao,                       // duração inicial em semínimas (padrão 4)
 *     alvoCompassos,                 // tamanho do exercício; sem ele vale o do cantus firmus
 *     fimLivre,                      // o aluno toca em "Terminei" para a correção final
 *     autoavaliacao,                 // perguntas que o aluno responde sozinho
 *     cifras | cifrasAluno           // cifras fixas (uma por nota do baixo) ou um campo para o aluno escrever
 *     licaoDaRegra(id),              // → { titulo, abrir } para o link "rever a lição"
 *     aoMudar(texto), aoAprovar(texto), aoErro(regras)
 *   })
 *   of.destruir()
 */
(function (raiz) {
  "use strict";
  const M = raiz.Motor, Ed = raiz.Editor, P = raiz.Partitura, Som = raiz.Som, Cn = raiz.Cantus, R2 = raiz.Regras2, R3 = raiz.Regras3;
  const T = M.T;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const bonito = (s) => String(s).replace(/\b([A-G])(##|#|--|-|bb|b)?(-?\d)?\b/g, (m, l, a = "", o = "") =>
    l + a.replace(/##/, "𝄪").replace(/#/, "♯").replace(/--|bb/, "𝄫").replace(/-|b/, "♭") + o);
  const NOTA_SEV = {
    erro: "É erro: a prática não passa enquanto isto não for corrigido.",
    aviso: "É aviso: evite, mas não impede a aprovação.",
    info: "É só informação: a regra foi quebrada, e aqui isso é permitido.",
  };

  // "Notas de ré dórico: D E F G A B C · na cadência: C♯" (para os modos e o menor)
  const SOLFEJO = { C: "dó", D: "ré", E: "mi", F: "fá", G: "sol", A: "lá", B: "si" };
  function textoEscala(t) {
    if (t.modo === "major" || t.modo === "ionian") return "";
    const esc = (Cn.ESCALAS[t.modo] || Cn.ESCALAS.major).map((s, g) => M.transpor(t.tonica, g, s));
    const acid = (x) => x.replace(/#/g, "♯").replace(/-/g, "♭");
    const nome = (a) => a.nome[0] + acid(a.nome.slice(1));
    const solf = (a) => SOLFEJO[a.nome[0]] + acid(a.nome.slice(1));
    const lt = M.transpor(t.tonica, -1, -1), seis = M.transpor(lt, -1, -2);
    const temLt = !esc.some((a) => a.nome === lt.nome);
    const cad = t.modo === "phrygian" ? "sem sensível: a cadência se apoia no semitom 2–1, que desce" : temLt
      ? `na cadência (dois últimos compassos): ${nome(lt)}${!esc.some((a) => a.nome === seis.nome) ? ` e, subindo para ele, ${nome(seis)}` : ""}` : "";
    return `<b>${solf(t.tonica)} ${M.MODOS_PT[t.modo]}:</b> ${esc.map(nome).join(" ")} <span class="solf">(${esc.map(solf).join(" ")})</span>${cad ? ` · ${cad}` : ""}`;
  }

  function criar(el, cfg) {
    const est = {
      modelo: Ed.ler(cfg.texto), ex: null, resultado: null, visao: null, fins: [], layout: null,
      sel: { voz: 0, pos: 0 }, dur: (cfg.duracao || 4) * T, ponto: false, historico: [], selecionado: null,
      terminado: false, aprovadoAvisado: false,
    };
    const tom = () => { try { return est.modelo.cab.tom ? M.interpretarTom(est.modelo.cab.tom) : null; } catch (e) { return null; } };

    el.innerHTML = `
      <section class="cartao of-enunciado">
        <div class="rotulo">Prática</div>
        <h2>${esc(cfg.titulo || "")}</h2>
        <div class="of-instrucoes">${cfg.instrucoes || ""}</div>
      </section>
      <section class="cartao">
        <div class="of-topo"><span class="rotulo of-info"></span>
          <label class="andamento">♩ = <input type="range" class="of-bpm" min="40" max="200" step="4" value="96"><span class="of-bpm-v">96</span></label></div>
        <p class="of-escala" hidden></p>
        <div class="of-partitura"></div>
        ${cfg.cifrasAluno ? `<label class="of-cifras-rot">Cifras, uma por nota do baixo (ex.: I V43 I6 ii6 I64 V I)
          <input class="of-cifras" type="text" autocapitalize="off" autocomplete="off" spellcheck="false" value="${esc(cfg.cifrasIniciais || "")}"></label>` : ""}
        <div class="detalhe of-detalhe" hidden></div>
      </section>
      <section class="cartao of-correcao" aria-live="polite">
        <div class="rotulo">Correção</div>
        <div class="veredito"><span class="selo neutro of-selo">—</span><div class="contagens of-contagens"></div></div>
        <p class="progresso of-progresso" hidden></p>
        <button class="botao primario of-terminei">Terminei</button>
        <ul class="achados of-achados"></ul>
        <p class="nada of-nada" hidden></p>
        <div class="of-auto" hidden></div>
      </section>`;
    const doca = document.createElement("div");
    doca.className = "doca";
    doca.innerHTML = `<div class="dentro">
      <div class="linha-doca">
        <button class="resumo of-resumo"><span class="selo neutro of-selo-mini">—</span><span class="contagens of-contagens-mini"></span></button>
        <button class="tocar of-tocar">▶ Ouvir</button>
        <button class="recolher of-recolher" aria-label="Recolher o piano">▾</button>
      </div>
      <div class="linha-doca so-aberta">
        <div class="vozes of-vozes"></div>
        <button class="ferr of-esq" aria-label="Nota anterior">◀</button>
        <button class="ferr of-dir" aria-label="Próxima nota">▶</button>
        <button class="ferr of-apagar" aria-label="Apagar nota">⌫</button>
        <button class="ferr of-desfazer" aria-label="Desfazer">↶</button>
      </div>
      <div class="ferramentas so-aberta">
        <button class="ferr" data-dur="4" aria-label="Semibreve"><span class="fig">𝅝</span></button>
        <button class="ferr" data-dur="2" aria-label="Mínima"><span class="fig">𝅗𝅥</span></button>
        <button class="ferr" data-dur="1" aria-label="Semínima"><span class="fig">𝅘𝅥</span></button>
        <button class="ferr" data-dur="0.5" aria-label="Colcheia"><span class="fig">𝅘𝅥𝅮</span></button>
        <button class="ferr" data-dur="0.25" aria-label="Semicolcheia"><span class="fig">𝅘𝅥𝅯</span></button>
        <button class="ferr of-ponto" aria-pressed="false" aria-label="Ponto de aumento">•</button>
        <button class="ferr of-pausa" aria-label="Pausa"><span class="fig">𝄽</span></button>
        <button class="ferr of-liga" aria-pressed="false" aria-label="Ligadura"><span class="fig">⁀</span></button>
        <button class="ferr of-enarm" aria-label="Trocar a grafia">♯♭</button>
      </div>
      <div class="legenda-piano so-aberta of-legenda"></div>
      <div class="piano-rolo so-aberta"><div class="piano"></div></div>
      <div class="aviso-doca so-aberta of-aviso" aria-live="polite"></div>
    </div>`;
    document.body.appendChild(doca);
    const $ = (sel) => el.querySelector(sel) || doca.querySelector(sel);
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty("--doca", doca.offsetHeight + "px"));
    ro.observe(doca);

    // ---------------------------------------------------------------- modelo
    const cfIndice = () => {
      const cf = est.modelo.cab.cf;
      if (!cf) return -1;
      const i = est.modelo.vozes.findIndex((v) => v.nome.toLowerCase() === cf.trim().toLowerCase());
      return i >= 0 ? i : -1;
    };
    const travada = (i) => i === cfIndice() || (cfg.travadas || []).includes(est.modelo.vozes[i] && est.modelo.vozes[i].nome);
    const vozSel = () => est.modelo.vozes[est.sel.voz];
    const durAtual = () => est.dur * (est.ponto ? 1.5 : 1);
    const avisar = (m) => { $(".of-aviso").textContent = m; };

    function corrigirSel() {
      const vs = est.modelo.vozes;
      if (est.sel.voz >= vs.length || travada(est.sel.voz)) {
        const livre = vs.findIndex((_, i) => !travada(i));
        est.sel.voz = livre >= 0 ? livre : 0;
      }
      est.sel.pos = Math.max(0, Math.min(est.sel.pos, vozSel().eventos.length));
    }
    corrigirSel();
    est.sel.pos = vozSel().eventos.length;

    function registrar() {
      est.historico.push(Ed.escrever(est.modelo));
      if (est.historico.length > 200) est.historico.shift();
    }

    function aplicar() {
      est.terminado = false;
      est.aprovadoAvisado = false;
      corrigirSel();
      const texto = Ed.escrever(est.modelo);
      if (cfg.aoMudar) cfg.aoMudar(texto);
      analisar();
    }

    // ---------------------------------------------------------------- análise
    const cifrasAtuais = () => {
      if (cfg.cifrasAluno) { const i = el.querySelector(".of-cifras"); return i ? i.value.trim().split(/\s+/).filter(Boolean) : []; }
      return cfg.cifras || null;
    };
    function contextoRegras() {
      const ctx = { ...(cfg.contexto || {}) };
      const cf = cifrasAtuais();
      if (cf) ctx.cifras = cf;
      if (ctx.alvo === undefined) ctx.alvo = est.modelo.vozes.findIndex((_, i) => !travada(i));
      if (ctx.cf === undefined && cfIndice() >= 0) ctx.cf = cfIndice();
      if (cfg.acordes && est.ex && est.ex.tonalidade) ctx.harmonia = R2.harmoniaDe(cfg.acordes, est.ex.tonalidade, est.ex.duracaoCompasso);
      else if (ctx.cifras && est.ex && est.ex.tonalidade && R3) ctx.harmonia = R3.harmoniaDasCifras(est.ex, ctx);
      return ctx;
    }

    function analisar() {
      try { est.ex = M.lerTexto(Ed.escrever(est.modelo)); } catch (e) { est.ex = null; }
      est.fins = est.modelo.vozes.map((v) => Ed.inicios(v).fim);
      if (est.ex) {
        const ctx = contextoRegras();
        est.resultado = M.verificarPerfil(est.ex, cfg.perfil, ctx);
        const alvo = cfg.alvoCompassos ? cfg.alvoCompassos * est.ex.duracaoCompasso : undefined;
        est.visao = M.concluidos(est.ex, est.resultado, est.fins, { alvo, terminado: est.terminado && !est.falta, semFimAutomatico: true });
      } else est.resultado = est.visao = null;
      est.selecionado = null;
      $(".of-detalhe").hidden = true;
      mostrar();
      desenhar();
      atualizarDoca();
    }

    // enquanto escreve: só os intervalos e as cifras coloridos na partitura; a lista de correção
    // aparece quando o aluno toca em Terminei (e some de novo na próxima edição)
    function mostrar() {
      const v = est.visao;
      const lista = $(".of-achados"), nada = $(".of-nada"), prog = $(".of-progresso"), ter = $(".of-terminei");
      lista.innerHTML = "";
      nada.hidden = prog.hidden = true;
      ter.hidden = false;
      ter.textContent = "Terminei";
      let selo = "Escrevendo", classe = "andamento", chips = "";
      if (!v) selo = "—", classe = "neutro";
      else if (!est.terminado) {
        prog.innerHTML = "Embaixo das notas aparecem os intervalos entre as vozes: <b class=\"t-erro\">vermelho</b> quando há erro, <b class=\"t-aviso\">âmbar</b> quando há aviso. Quando acabar, toque em <b>Terminei</b> para a correção completa, com as explicações.";
        prog.hidden = false;
      } else if (est.falta) {
        selo = "Incompleto"; classe = "reprovado";
        prog.textContent = est.falta;
        prog.hidden = false;
      } else {
        chips = ["erro", "aviso", "info"].map((s) => { const n = v.contar(s); return `<span class="chip ${s}${n ? "" : " zero"}">${n} ${s}</span>`; }).join("");
        selo = v.aprovado ? "Aprovado" : "Reprovado";
        classe = v.aprovado ? "aprovado" : "reprovado";
        if (!v.visiveis.length) { nada.textContent = "Nenhuma regra quebrada. Toque em Ouvir e escute o resultado."; nada.hidden = false; }
        if (v.aprovado) ter.hidden = true;
        else { ter.textContent = "Corrigir de novo"; prog.textContent = "Toque num item para ver onde está, por que é um problema e como corrigir. Depois de mudar a partitura, toque em Corrigir de novo."; prog.hidden = false; }
        v.visiveis.forEach((a, k) => {
          const li = document.createElement("li");
          const b = document.createElement("button");
          b.className = `achado sev-${a.severidade}`;
          b.setAttribute("aria-pressed", "false");
          b.dataset.k = k;
          b.innerHTML = `<span class="tarja"></span><span class="c">c. ${a.compasso}</span>
            <span class="msg">${esc(bonito(a.mensagem))}<span class="qual">${a.severidade} · ${esc(M.REGRAS[a.regra].titulo)}</span>
            <span class="explica" hidden>${explicacao(a)}</span></span>`;
          b.addEventListener("click", (ev) => {
            if (ev.target.closest(".rever")) return;
            selecionar(est.selecionado === k ? null : k, true);
          });
          li.appendChild(b);
          lista.appendChild(li);
        });
        ligarRever(lista);
        if (v.aprovado) {
          mostrarAutoavaliacao();
          if (!est.aprovadoAvisado) { est.aprovadoAvisado = true; if (cfg.aoAprovar) cfg.aoAprovar(Ed.escrever(est.modelo)); }
        } else {
          $(".of-auto").hidden = true;
          if (cfg.aoErro) cfg.aoErro([...new Set(v.visiveis.filter((a) => a.severidade === "erro").map((a) => a.regra))]);
        }
      }
      for (const [s, c, mini] of [[".of-selo", ".of-contagens", false], [".of-selo-mini", ".of-contagens-mini", true]]) {
        $(s).textContent = selo;
        $(s).className = `selo ${classe} ${mini ? "of-selo-mini" : "of-selo"}`;
        $(c).innerHTML = chips;
      }
    }

    // o que falta para o exercício ter o tamanho pedido (só quando ele tem tamanho fixo)
    function faltando() {
      if (cfg.fimLivre || !est.ex) return "";
      const C = est.ex.duracaoCompasso;
      const cf = cfIndice();
      const alvo = cfg.alvoCompassos ? cfg.alvoCompassos * C : cf >= 0 ? est.fins[cf] : 0;
      if (!alvo) return "";
      const curtas = est.modelo.vozes.map((v, i) => [v, i]).filter(([, i]) => !travada(i) && est.fins[i] < alvo);
      if (!curtas.length) return "";
      return "Ainda não está completo: " + curtas.map(([v, i]) => `"${v.nome}" vai até o compasso ${Math.max(1, Math.ceil(est.fins[i] / C))}`).join(", ")
        + `, e o exercício tem ${Math.round(alvo / C)} compassos.`;
    }

    function mostrarAutoavaliacao() {
      const caixa = $(".of-auto");
      if (!cfg.autoavaliacao || !cfg.autoavaliacao.length) { caixa.hidden = true; return; }
      caixa.innerHTML = `<p class="rotulo">Antes de seguir, responda para você mesmo</p>
        <ul class="auto-lista">${cfg.autoavaliacao.map((q, i) => `<li><label><input type="checkbox" id="auto-${i}"> ${esc(q)}</label></li>`).join("")}</ul>`;
      caixa.hidden = false;
    }

    function explicacao(a) {
      const r = M.REGRAS[a.regra];
      const lic = cfg.licaoDaRegra && cfg.licaoDaRegra(a.regra);
      return `<p><span class="t">Por que é um problema</span>${esc(r.porque || r.explicacao)}</p>
        <p><span class="t">Como corrigir</span>${esc(r.corrigir || "")}</p>
        <p class="nivel-nota">${NOTA_SEV[a.severidade]}</p>
        ${a.severidade === "erro" ? `<div class="sugestao" data-k="${est.visao ? est.visao.visiveis.indexOf(a) : -1}"></div>` : ""}
        ${lic ? `<button class="botao rever" data-regra="${a.regra}">Rever: ${esc(lic.titulo)}</button>` : ""}`;
    }

    function ligarRever(caixa) {
      for (const b of caixa.querySelectorAll(".rever")) b.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const lic = cfg.licaoDaRegra(b.dataset.regra);
        if (lic) lic.abrir();
      });
    }

    function selecionar(k, daLista) {
      est.selecionado = k;
      el.querySelectorAll(".achado").forEach((b) => {
        const ativo = +b.dataset.k === k;
        b.setAttribute("aria-pressed", String(ativo));
        b.querySelector(".explica").hidden = !ativo;
      });
      const det = $(".of-detalhe");
      if (k === null) { det.hidden = true; desenhar(); return; }
      const a = est.visao.visiveis[k];
      det.className = `detalhe of-detalhe sev-${a.severidade}`;
      det.innerHTML = `<div class="cab"><b><span class="pilula ${a.severidade}">${a.severidade}</span>c. ${a.compasso} · ${esc(M.REGRAS[a.regra].titulo)}</b>
        <button class="fechar" aria-label="Fechar">✕</button></div><div>${esc(bonito(a.mensagem))}</div><div class="explica">${explicacao(a)}</div>`;
      det.querySelector(".fechar").addEventListener("click", () => selecionar(null));
      ligarRever(det);
      for (const caixa of el.querySelectorAll(`.sugestao[data-k="${k}"]`)) mostrarSugestao(caixa, a);
      det.hidden = false;
      desenhar();
      if (daLista && est.layout) {
        const m = est.layout.compassos[a.compasso - 1];
        if (m) {
          const topo = $(".of-partitura").getBoundingClientRect().top + window.scrollY + est.layout.sistemas[m.sistema].y;
          if (topo < window.scrollY + 40 || topo > window.scrollY + window.innerHeight - doca.offsetHeight - 160) window.scrollTo({ top: topo - 60, behavior: "smooth" });
        }
      }
    }

    // ---------------------------------------------------------------- correção explicada (Albrechtsberger)
    // procura trocas de uma nota da voz do aluno que façam o erro sumir sem criar outro
    const assinatura = (x) => `${x.regra}|${x.compasso}|${x.mensagem}`;
    function sugestoes(a) {
      if (!est.ex || !est.resultado) return [];
      const base = est.resultado.achados.filter((x) => x.severidade === "erro");
      const baseSig = new Set(base.map(assinatura));
      const ctx = contextoRegras();
      const t = tom();
      const alvos = [];
      est.modelo.vozes.forEach((v, i) => {
        if (travada(i)) return;
        const { inicios } = Ed.inicios(v);
        for (const n of a.notas) {
          if (!est.ex.vozes[i] || !est.ex.vozes[i].notas.includes(n)) continue;
          const j = inicios.findIndex((x, k) => x === n.inicio && v.eventos[k].alt);
          if (j >= 0) alvos.push([i, j, n]);
        }
      });
      const res = [];
      for (const [i, j, n] of alvos) {
        const orig = M.lerAltura(est.modelo.vozes[i].eventos[j].alt);
        let cands = [];
        for (let d = -9; d <= 9; d++) {
          if (!d) continue;
          const midi = orig.ps + d;
          const nome = grafia(midi);
          if (t) {
            const a2 = M.lerAltura(nome);
            const esc = (Cn.ESCALAS[t.modo] || Cn.ESCALAS.major).map((st, g) => M.transpor(t.tonica, g, st).nome);
            const lt = M.transpor(t.tonica, -1, -1).nome;
            if (!esc.includes(a2.nome) && a2.nome !== lt) continue;
          }
          cands.push(nome);
        }
        for (const nome of cands) {
          const m = Ed.clonar(est.modelo);
          m.vozes[i].eventos[j].alt = nome;
          let ex2;
          try { ex2 = M.lerTexto(Ed.escrever(m)); } catch (e) { continue; }
          const r = M.verificarPerfil(ex2, cfg.perfil, ctx);
          const erros = r.achados.filter((x) => x.severidade === "erro");
          if (erros.some((x) => x.regra === a.regra && x.compasso === a.compasso)) continue;
          if (erros.some((x) => !baseSig.has(assinatura(x)))) continue; // criou erro novo
          const avisos = r.achados.filter((x) => x.severidade === "aviso").length;
          res.push({ voz: i, ev: j, de: n.nome, para: nome, compasso: est.ex.compassoDe(n.inicio), erros: erros.length, avisos, dist: Math.abs(M.lerAltura(nome).ps - orig.ps), ex: ex2, modelo: m });
        }
      }
      res.sort((x, y) => x.erros - y.erros || x.avisos - y.avisos || x.dist - y.dist);
      const vistos = new Set();
      return res.filter((r) => { const k = r.voz + ":" + r.ev; if (vistos.has(k)) return false; vistos.add(k); return true; }).slice(0, 2);
    }
    function tocarTrecho(ex, compasso) {
      const C = ex.duracaoCompasso;
      Som.tocar(ex, { bpm: +$(".of-bpm").value, T, de: Math.max(0, (compasso - 2) * C), ate: (compasso + 1) * C,
        aoTick: (tk) => P.moverCursor(est.layout, tk), aoFim: () => P.moverCursor(est.layout, null) });
    }
    function mostrarSugestao(caixa, a) {
      if (caixa.dataset.feito) return;
      caixa.dataset.feito = "1";
      const ss = sugestoes(a);
      if (!ss.length) {
        caixa.innerHTML = `<p class="sug-nada">Nenhuma troca de uma nota só resolve isto sem criar outro problema: o erro vem da combinação de notas. Mude a linha antes deste ponto (o caminho até aqui), não só a nota marcada.</p>`;
        return;
      }
      caixa.innerHTML = `<p class="t">O que acontece se você mudar</p>` + ss.map((s, k) => `<div class="sug">
          <p>Se trocar <b>${esc(bonito(s.de))}</b> por <b>${esc(bonito(s.para))}</b> (c. ${s.compasso}), este erro some${s.erros ? ` (restam ${s.erros} outro${s.erros > 1 ? "s" : ""}, que já existiam)` : " e não sobra nenhum"}${s.avisos ? `; ficam ${s.avisos} aviso${s.avisos > 1 ? "s" : ""}` : ""}.</p>
          <div class="linha-botoes"><button class="botao sug-antes" data-s="${k}">▶ Como está</button><button class="botao sug-ouvir" data-s="${k}">▶ Com a troca</button><button class="botao primario sug-aplicar" data-s="${k}">Aplicar</button></div></div>`).join("")
        + `<p class="sug-nota">A troca é uma saída possível, não "a" resposta: ouça as duas versões e decida.</p>`;
      caixa.querySelectorAll(".sug-antes").forEach((b) => b.addEventListener("click", (ev) => { ev.stopPropagation(); tocarTrecho(est.ex, ss[+b.dataset.s].compasso); }));
      caixa.querySelectorAll(".sug-ouvir").forEach((b) => b.addEventListener("click", (ev) => { ev.stopPropagation(); tocarTrecho(ss[+b.dataset.s].ex, ss[+b.dataset.s].compasso); }));
      caixa.querySelectorAll(".sug-aplicar").forEach((b) => b.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const s = ss[+b.dataset.s];
        registrar();
        est.modelo.vozes[s.voz].eventos[s.ev].alt = s.para;
        est.sel = { voz: s.voz, pos: s.ev };
        aplicar();
        avisar(`Trocado: ${bonito(s.de)} → ${bonito(s.para)}. Toque em Terminei para corrigir de novo.`);
      }));
    }

    // ---------------------------------------------------------------- partitura
    // intervalo de cada nota da voz do aluno com a outra voz (a dada, ou a de baixo/cima)
    function nomeIntervalo(iv) {
      const n = iv.simples === 1 ? (iv.geral === 1 ? "U" : "8") : String(iv.simples);
      return n + (iv.qual === "A" ? "+" : iv.qual === "d" ? "°" : "");
    }
    function intervalos(ex) {
      if (ex.vozes.length < 2) {
        // uma voz só (cantus firmus): o intervalo melódico de chegada em cada nota
        const ns = ex.vozes[0] ? ex.vozes[0].notas : [];
        return ns.slice(1).map((n, k) => { const iv = M.ferramentas.intervaloAlturas(ns[k].altura, n.altura); return [n, (n.ps > ns[k].ps ? "↑" : n.ps < ns[k].ps ? "↓" : "") + nomeIntervalo(iv), null]; });
      }
      const livres = ex.vozes.map((_, i) => i).filter((i) => !travada(i));
      if (!livres.length) return [];
      const minha = livres[0];
      const cf = cfIndice();
      const outra = cf >= 0 && cf !== minha ? cf : minha === 0 ? ex.vozes.length - 1 : 0;
      const r = [];
      for (const n of ex.vozes[minha].notas) {
        const o = ex.vozes[outra].soandoEm(n.inicio);
        if (!o) continue;
        const [sup, inf] = minha < outra ? [n, o] : [o, n];
        r.push([n, nomeIntervalo(M.ferramentas.harmonico(sup, inf)), o]);
      }
      return r;
    }

    function desenhar() {
      const caixa = $(".of-partitura"), ex = est.ex;
      if (!ex) { caixa.innerHTML = `<div class="vazio">O texto do exercício tem um erro.</div>`; est.layout = null; return; }
      const t = ex.tonalidade;
      $(".of-info").textContent = `${ex.formula.join("/")}${t ? " · " + bonito(t.tonica.nome) + " " + M.MODOS_PT[t.modo] : ""}`;
      const le = $(".of-escala");
      const txt = t ? textoEscala(t) : "";
      le.hidden = !txt; le.innerHTML = txt;
      const vS = vozSel(), sel = est.sel;
      let selecao = null, extraFim = cfg.alvoCompassos ? cfg.alvoCompassos * ex.duracaoCompasso : 0;
      if (vS && !travada(sel.voz)) {
        const { inicios, fim } = Ed.inicios(vS);
        const cursor = sel.pos >= vS.eventos.length;
        selecao = { voz: sel.voz, t: cursor ? fim : inicios[sel.pos], cursor };
        if (cursor) extraFim = Math.max(extraFim, fim + durAtual());
      }
      const vis = est.visao ? est.visao.visiveis.filter((a) => est.terminado || a.severidade !== "info") : [];
      const marcas = est.terminado ? vis.map((a) => ({ notas: a.notas, sev: a.severidade, compasso: a.compasso })) : [];
      const sevDe = (n) => { let r = null; for (const a of vis) if (a.notas.includes(n)) { if (a.severidade === "erro") return "erro"; r = "aviso"; } return r; };
      const anotacoes = intervalos(ex).map(([n, texto, outra]) => ({ nota: n, texto, sev: sevDe(n) || (outra && sevDe(outra)) || null }));
      let cifras = [];
      if (cfg.acordes && t) cifras = R2.harmoniaDe(cfg.acordes, t, ex.duracaoCompasso).map((a) => ({ t: a.inicio, texto: a.simbolo }));
      else {
        const cf = cifrasAtuais();
        const baixo = ex.vozes[ex.vozes.length - 1];
        if (cf && baixo) cifras = baixo.notas.map((n, i) => cf[i] && { t: n.inicio, texto: cf[i], sev: vis.some((a) => /cifra|retrogress|seis_quatro|notas_do_acorde/.test(a.regra) && a.notas.includes(n)) ? (vis.find((a) => a.notas.includes(n)).severidade) : null }).filter(Boolean);
      }
      est.layout = P.desenhar(caixa, ex, {
        fins: est.fins, extraFim, marcas, selecao, ativa: sel.voz, cifras, anotacoes,
        foco: est.selecionado !== null ? marcas[est.selecionado] : null,
        rotulos: ex.vozes.map((v, i) => v.nome + (travada(i) ? " · dado" : "")),
      });
    }

    $(".of-partitura").addEventListener("click", (ev) => {
      const L = est.layout;
      if (!L) return;
      const box = L.svg.getBoundingClientRect();
      const px = ev.clientX - box.left, py = ev.clientY - box.top;
      const onde = P.localizar(L, px, py);
      if (!onde) return;
      const vi = Math.max(0, Math.min(est.modelo.vozes.length - 1, onde.voz));
      const { perto, compasso: m } = onde;
      const vis = est.visao ? est.visao.visiveis : [];
      const cand = perto ? vis.map((a, k) => [a, k]).filter(([a]) => a.notas.includes(perto.nota)) : [];
      if (!travada(vi) && m) {
        let t;
        if (perto && perto.voz === vi) t = perto.nota.inicio;
        else {
          let melhor = null;
          for (const col of m.cols) if (!melhor || Math.abs(col.x - px) < Math.abs(melhor.x - px)) melhor = col;
          t = melhor && Math.abs(melhor.x - px) < 30 ? melhor.t : m.ini + ((px - m.x0) / (m.x1 - m.x0)) * L.C;
        }
        const v = est.modelo.vozes[vi];
        const { inicios, fim } = Ed.inicios(v);
        let pos = v.eventos.length;
        if (t < fim) { pos = inicios.length - 1; while (pos > 0 && inicios[pos] > t) pos--; }
        est.sel = { voz: vi, pos };
        sincronizarDuracao();
        avisar("");
      }
      if (cand.length) {
        const i = cand.findIndex(([, k]) => k === est.selecionado);
        selecionar(cand[(i + 1) % cand.length][1]);
      } else if (est.selecionado !== null) selecionar(null);
      else desenhar();
      atualizarDoca();
      centralizar();
    });

    // ---------------------------------------------------------------- edição
    function podeEditar() {
      if (travada(est.sel.voz)) { avisar("Esta voz é dada pelo exercício. Escreva na outra."); return false; }
      return true;
    }
    function eventoAlvo() {
      const v = vozSel();
      return est.sel.pos < v.eventos.length ? v.eventos[est.sel.pos] : v.eventos[v.eventos.length - 1] || null;
    }
    function sincronizarDuracao() {
      const v = vozSel();
      if (est.sel.pos < v.eventos.length) {
        const d = v.eventos[est.sel.pos].dur;
        const base = [4, 2, 1, 0.5, 0.25].map((x) => x * T).find((b) => d === b || d === b * 1.5);
        if (base) { est.dur = base; est.ponto = d !== base; }
      }
    }
    function inserir(alt) {
      if (!podeEditar()) return;
      registrar();
      const v = vozSel();
      if (est.sel.pos < v.eventos.length) {
        v.eventos[est.sel.pos].alt = alt;
        if (alt === null) v.eventos[est.sel.pos].liga = false;
        est.sel.pos++;
      } else {
        v.eventos.push({ alt, dur: durAtual(), liga: false });
        est.sel.pos = v.eventos.length;
      }
      avisar("");
      aplicar();
    }
    function mudarDuracao(q) {
      est.dur = q * T;
      const v = vozSel();
      if (est.sel.pos < v.eventos.length && !travada(est.sel.voz)) { registrar(); ajustarDuracao(v, est.sel.pos, durAtual()); aplicar(); }
      else { desenhar(); atualizarDoca(); }
    }
    // mudar a duração no meio da voz não desloca o resto: encurtar deixa uma pausa no lugar,
    // alongar ocupa o tempo dos eventos seguintes
    const PARTES = [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25].map((x) => x * T);
    function pausas(d) {
      const r = [];
      while (d > 0) { const p = PARTES.find((x) => x <= d + 1e-6); if (!p) break; r.push({ alt: null, dur: p, liga: false }); d -= p; }
      return r;
    }
    function ajustarDuracao(v, pos, nova) {
      const ev = v.eventos[pos];
      const velha = ev.dur;
      if (nova === velha) return;
      ev.dur = nova;
      if (nova < velha) { v.eventos.splice(pos + 1, 0, ...pausas(velha - nova)); return; }
      let falta = nova - velha;
      ev.liga = false;
      while (falta > 0 && pos + 1 < v.eventos.length) {
        const prox = v.eventos[pos + 1];
        if (prox.dur <= falta) { falta -= prox.dur; v.eventos.splice(pos + 1, 1); }
        else { v.eventos.splice(pos + 1, 1, ...pausas(prox.dur - falta)); falta = 0; }
      }
    }

    function atualizarDoca() {
      const caixa = $(".of-vozes");
      caixa.innerHTML = "";
      est.modelo.vozes.forEach((v, i) => {
        if (travada(i)) return;
        const b = document.createElement("button");
        b.className = "chip-voz";
        b.setAttribute("aria-pressed", String(i === est.sel.voz));
        b.textContent = v.nome;
        b.addEventListener("click", () => { est.sel = { voz: i, pos: v.eventos.length }; desenhar(); atualizarDoca(); centralizar(); });
        caixa.appendChild(b);
      });
      for (const b of doca.querySelectorAll("[data-dur]")) b.setAttribute("aria-pressed", String(+b.dataset.dur * T === est.dur));
      $(".of-ponto").setAttribute("aria-pressed", String(est.ponto));
      const alvo = eventoAlvo();
      $(".of-liga").setAttribute("aria-pressed", String(!!(alvo && alvo.liga)));
      $(".of-desfazer").disabled = !est.historico.length;
      $(".of-enarm").disabled = !(alvo && alvo.alt && /[#b]/.test(alvo.alt.slice(1, -1)));
      // no piano: a nota selecionada (azul) e, no mesmo instante, a das outras vozes (roxo)
      for (const k of doca.querySelectorAll(".tecla.ativa, .tecla.outra")) k.classList.remove("ativa", "outra");
      const v = vozSel();
      const marcar = (alt, cls) => { if (alt) doca.querySelector(`.tecla[data-midi="${M.lerAltura(alt).ps}"]`)?.classList.add(cls); };
      if (est.sel.pos < v.eventos.length) marcar(v.eventos[est.sel.pos].alt, "ativa");
      const { inicios, fim } = Ed.inicios(v);
      const t = est.sel.pos < v.eventos.length ? inicios[est.sel.pos] : fim;
      const outras = [];
      est.modelo.vozes.forEach((o, i) => {
        if (i === est.sel.voz) return;
        const ini = Ed.inicios(o).inicios;
        let k = -1;
        for (let j = 0; j < o.eventos.length; j++) if (ini[j] <= t && t < ini[j] + o.eventos[j].dur) { k = j; break; }
        if (k >= 0) marcar(o.eventos[k].alt, "outra");
        if (k >= 0 && o.eventos[k].alt) outras.push([o.nome, o.eventos[k].alt]);
      });
      est.outraPs = outras.length ? M.lerAltura(outras[0][1]).ps : null;
      const sua = est.sel.pos < v.eventos.length && v.eventos[est.sel.pos].alt;
      $(".of-legenda").innerHTML = (sua ? `<span class="leg ativa"></span>${esc(v.nome)}: ${esc(bonito(sua))}` : "")
        + outras.map(([n, a]) => ` <span class="leg outra"></span>${esc(n)}: ${esc(bonito(a))}`).join("");
    }

    for (const b of doca.querySelectorAll("[data-dur]")) b.addEventListener("click", () => { est.ponto = false; mudarDuracao(+b.dataset.dur); });
    $(".of-ponto").addEventListener("click", () => { est.ponto = !est.ponto; mudarDuracao(est.dur / T); });
    $(".of-pausa").addEventListener("click", () => inserir(null));
    $(".of-liga").addEventListener("click", () => {
      if (!podeEditar()) return;
      const alvo = eventoAlvo();
      if (!alvo || !alvo.alt) { avisar("Escreva uma nota antes de ligar."); return; }
      registrar(); alvo.liga = !alvo.liga; aplicar();
      avisar(alvo.liga ? "Ligada: toque a mesma nota para continuar o som." : "");
    });
    $(".of-enarm").addEventListener("click", () => {
      if (!podeEditar()) return;
      const alvo = eventoAlvo();
      if (!alvo || !alvo.alt) return;
      const a = M.lerAltura(alvo.alt);
      if (!a.alter) return;
      const outra = a.alter > 0 ? M.transpor(a, 1, 0) : M.transpor(a, -1, 0);
      registrar(); alvo.alt = Ed.normalizarAltura(outra.nome + outra.oitava); aplicar();
    });
    $(".of-esq").addEventListener("click", () => { est.sel.pos = Math.max(0, est.sel.pos - 1); sincronizarDuracao(); desenhar(); atualizarDoca(); centralizar(); });
    $(".of-dir").addEventListener("click", () => { est.sel.pos = Math.min(vozSel().eventos.length, est.sel.pos + 1); sincronizarDuracao(); desenhar(); atualizarDoca(); centralizar(); });
    $(".of-apagar").addEventListener("click", () => {
      if (!podeEditar()) return;
      const v = vozSel();
      if (!v.eventos.length) return;
      // no meio da voz a nota vira pausa de mesmo valor (nada se desloca); no fim, o último evento sai
      let ev = v.eventos[est.sel.pos];
      // sobre uma pausa no meio, o apagar anda para trás e apaga a nota anterior
      if (ev && !ev.alt && est.sel.pos < v.eventos.length - 1 && est.sel.pos > 0 && v.eventos[est.sel.pos - 1].alt) { est.sel.pos--; ev = v.eventos[est.sel.pos]; }
      if (ev && ev.alt) { registrar(); ev.alt = null; ev.liga = false; if (est.sel.pos > 0 && v.eventos[est.sel.pos - 1].liga) v.eventos[est.sel.pos - 1].liga = false; }
      else if (ev && est.sel.pos === v.eventos.length - 1) { registrar(); v.eventos.pop(); }
      else if (!ev) { registrar(); v.eventos.pop(); est.sel.pos = v.eventos.length; }
      else return;
      aplicar();
    });
    $(".of-desfazer").addEventListener("click", () => {
      const ant = est.historico.pop();
      if (ant === undefined) return;
      est.modelo = Ed.ler(ant);
      aplicar();
    });
    $(".of-terminei").addEventListener("click", () => {
      est.terminado = true;
      est.falta = faltando();
      analisar();
      $(".of-correcao").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const campoCifras = el.querySelector(".of-cifras");
    if (campoCifras) {
      let tc = null;
      campoCifras.addEventListener("input", () => { clearTimeout(tc); tc = setTimeout(() => { if (cfg.aoMudarCifras) cfg.aoMudarCifras(campoCifras.value); est.terminado = false; est.aprovadoAvisado = false; analisar(); }, 350); });
    }

    // grafia das teclas pretas conforme a tonalidade
    function grafia(midi) {
      const pc = midi % 12, oit = Math.floor(midi / 12) - 1;
      const NEUTRO = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
      const t = tom();
      if (t) {
        const escala = Cn.ESCALAS[t.modo] || Cn.ESCALAS.major;
        const notas = escala.map((s, g) => M.transpor(t.tonica, g, s));
        for (const n of [M.transpor(t.tonica, -1, -1), ...notas]) {
          if (((n.ps % 12) + 12) % 12 === pc && Math.abs(n.alter) <= 1) {
            const o = oit + Math.round((midi - (12 * (oit + 1) + [0, 2, 4, 5, 7, 9, 11][n.letra] + n.alter)) / 12);
            return n.nome.replace("-", "b") + o;
          }
        }
        if (notas.some((n) => n.alter < 0)) return ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"][pc] + oit;
        if (notas.some((n) => n.alter > 0)) return ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][pc] + oit;
      }
      return NEUTRO[pc] + oit;
    }

    const piano = doca.querySelector(".piano");
    Piano.montar(piano, (midi) => { Som.nota(midi); inserir(grafia(midi)); }, (midi) => bonito(grafia(midi)));

    function centralizar() {
      const rolo = doca.querySelector(".piano-rolo");
      let ps = null;
      const alvo = eventoAlvo();
      if (alvo && alvo.alt) ps = M.lerAltura(alvo.alt).ps;
      else if (est.ex) { const outra = est.ex.vozes.find((x) => x.notas.length); if (outra) ps = outra.notas[0].ps + (est.sel.voz === 0 ? 7 : -9); }
      // as duas notas marcadas cabem na tela? então centraliza entre elas
      if (ps !== null && est.outraPs != null && Math.abs(ps - est.outraPs) * 23 < rolo.clientWidth * 0.8) ps = Math.round((ps + est.outraPs) / 2);
      Piano.centralizar(rolo, ps === null ? 60 : ps);
    }

    // ---------------------------------------------------------------- som e doca
    $(".of-tocar").addEventListener("click", () => {
      if (Som.tocando()) { Som.parar(); return; }
      if (Som.tocar(est.ex, { bpm: +$(".of-bpm").value, T,
        aoTick: (t) => P.moverCursor(est.layout, t),
        aoFim: () => { $(".of-tocar").textContent = "▶ Ouvir"; P.moverCursor(est.layout, null); } })) $(".of-tocar").textContent = "■ Parar";
    });
    $(".of-bpm").addEventListener("input", () => { $(".of-bpm-v").textContent = $(".of-bpm").value; });
    $(".of-resumo").addEventListener("click", () => $(".of-correcao").scrollIntoView({ behavior: "smooth", block: "start" }));
    $(".of-recolher").addEventListener("click", () => {
      const f = doca.classList.toggle("recolhida");
      $(".of-recolher").textContent = f ? "▴" : "▾";
    });
    let larg = 0;
    const ro2 = new ResizeObserver(() => { const w = $(".of-partitura").clientWidth; if (Math.abs(w - larg) > 8) { larg = w; desenhar(); } });
    ro2.observe($(".of-partitura"));

    analisar();
    centralizar();

    return {
      texto: () => Ed.escrever(est.modelo),
      cifras: () => cifrasAtuais(),
      destruir() { Som.parar(); ro.disconnect(); ro2.disconnect(); doca.remove(); el.innerHTML = ""; document.documentElement.style.setProperty("--doca", "0px"); },
    };
  }

  // ---------------------------------------------------------------- piano (também usado nas aulas)
  const Piano = {
    montar(caixa, aoTocar, rotulo, { de = 36, ate = 84 } = {}) {
      const W = 40, PRETAS = new Set([1, 3, 6, 8, 10]);
      let brancas = 0;
      caixa.innerHTML = "";
      for (let midi = de; midi <= ate; midi++) {
        const pc = midi % 12;
        const b = document.createElement("button");
        b.dataset.midi = midi;
        if (PRETAS.has(pc)) { b.className = "tecla preta"; b.style.left = `${brancas * W - 13}px`; }
        else {
          b.className = "tecla branca" + (midi === 60 ? " c4" : "");
          b.style.left = `${brancas * W}px`;
          if (pc === 0) b.textContent = "C" + (midi / 12 - 1);
          brancas++;
        }
        if (rotulo) b.setAttribute("aria-label", rotulo(midi));
        b.addEventListener("click", () => {
          b.classList.add("tocada");
          setTimeout(() => b.classList.remove("tocada"), 140);
          aoTocar(midi, b);
        });
        caixa.appendChild(b);
      }
      caixa.style.width = `${brancas * W}px`;
    },
    centralizar(rolo, ps) {
      const k = rolo.querySelector(`.tecla[data-midi="${Math.round(ps)}"]`);
      if (k) rolo.scrollLeft = k.offsetLeft - rolo.clientWidth / 2 + 20;
    },
  };

  raiz.Oficina = { criar, bonito, esc };
  raiz.Piano = Piano;
})(this);
