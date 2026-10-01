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
        <div class="of-partitura"></div>
        ${cfg.cifrasAluno ? `<label class="of-cifras-rot">Cifras, uma por nota do baixo (ex.: I V43 I6 ii6 I64 V I)
          <input class="of-cifras" type="text" autocapitalize="off" autocomplete="off" spellcheck="false" value="${esc(cfg.cifrasIniciais || "")}"></label>` : ""}
        <div class="detalhe of-detalhe" hidden></div>
      </section>
      <section class="cartao of-correcao" aria-live="polite">
        <div class="rotulo">Correção</div>
        <div class="veredito"><span class="selo neutro of-selo">—</span><div class="contagens of-contagens"></div></div>
        <p class="progresso of-progresso" hidden></p>
        ${cfg.fimLivre ? `<button class="botao primario of-terminei">Terminei</button>` : ""}
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
        est.visao = M.concluidos(est.ex, est.resultado, est.fins, { alvo, terminado: est.terminado, semFimAutomatico: !!cfg.fimLivre });
      } else est.resultado = est.visao = null;
      est.selecionado = null;
      $(".of-detalhe").hidden = true;
      mostrar();
      desenhar();
      atualizarDoca();
    }

    function mostrar() {
      const v = est.visao;
      const lista = $(".of-achados"), nada = $(".of-nada"), prog = $(".of-progresso");
      lista.innerHTML = "";
      nada.hidden = prog.hidden = true;
      let selo = "—", classe = "neutro", chips = "";
      if (v) {
        chips = ["erro", "aviso", "info"].map((s) => { const n = v.contar(s); return `<span class="chip ${s}${n ? "" : " zero"}">${n} ${s}</span>`; }).join("");
        const campoCifras = el.querySelector(".of-cifras");
    if (campoCifras) {
      let tc = null;
      campoCifras.addEventListener("input", () => { clearTimeout(tc); tc = setTimeout(() => { if (cfg.aoMudarCifras) cfg.aoMudarCifras(campoCifras.value); analisar(); }, 350); });
    }
    const ter = $(".of-terminei");
        if (v.completo) {
          selo = v.aprovado ? "Aprovado" : "Reprovado";
          classe = v.aprovado ? "aprovado" : "reprovado";
          if (!v.visiveis.length) { nada.textContent = "Nenhuma regra quebrada. Toque em Ouvir e escute o resultado."; nada.hidden = false; }
          if (ter) ter.hidden = true;
        } else {
          selo = "Escrevendo"; classe = "andamento";
          prog.textContent = cfg.fimLivre
            ? "As regras do fim (final, cadência, tamanho) são conferidas quando você tocar em Terminei."
            : v.compassosCompletos === 0 ? "A correção começa quando o primeiro compasso estiver completo."
              : `Compassos 1–${v.compassosCompletos} verificados. O resto aparece quando você completar os próximos.`;
          prog.hidden = false;
          if (ter) ter.hidden = false;
          if (!v.visiveis.length && v.compassosCompletos > 0) { nada.textContent = "Nada de errado até aqui."; nada.hidden = false; }
        }
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
        if (v.completo && v.aprovado) {
          mostrarAutoavaliacao();
          if (!est.aprovadoAvisado) { est.aprovadoAvisado = true; if (cfg.aoAprovar) cfg.aoAprovar(Ed.escrever(est.modelo)); }
        } else $(".of-auto").hidden = true;
        if (v.completo && !v.aprovado && cfg.aoErro) cfg.aoErro([...new Set(v.visiveis.filter((a) => a.severidade === "erro").map((a) => a.regra))]);
      }
      for (const [s, c, mini] of [[".of-selo", ".of-contagens", false], [".of-selo-mini", ".of-contagens-mini", true]]) {
        $(s).textContent = selo;
        $(s).className = `selo ${classe} ${mini ? "of-selo-mini" : "of-selo"}`;
        $(c).innerHTML = chips;
      }
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

    // ---------------------------------------------------------------- partitura
    function desenhar() {
      const caixa = $(".of-partitura"), ex = est.ex;
      if (!ex) { caixa.innerHTML = `<div class="vazio">O texto do exercício tem um erro.</div>`; est.layout = null; return; }
      const t = ex.tonalidade;
      $(".of-info").textContent = `${ex.formula.join("/")}${t ? " · " + bonito(t.tonica.nome) + " " + M.MODOS_PT[t.modo] : ""}`;
      const vS = vozSel(), sel = est.sel;
      let selecao = null, extraFim = cfg.alvoCompassos ? cfg.alvoCompassos * ex.duracaoCompasso : 0;
      if (vS && !travada(sel.voz)) {
        const { inicios, fim } = Ed.inicios(vS);
        const cursor = sel.pos >= vS.eventos.length;
        selecao = { voz: sel.voz, t: cursor ? fim : inicios[sel.pos], cursor };
        if (cursor) extraFim = Math.max(extraFim, fim + durAtual());
      }
      const marcas = (est.visao ? est.visao.visiveis : []).map((a) => ({ notas: a.notas, sev: a.severidade, compasso: a.compasso }));
      let cifras = [];
      if (cfg.acordes && t) cifras = R2.harmoniaDe(cfg.acordes, t, ex.duracaoCompasso).map((a) => ({ t: a.inicio, texto: a.simbolo }));
      else {
        const cf = cifrasAtuais();
        const baixo = ex.vozes[ex.vozes.length - 1];
        if (cf && baixo) cifras = baixo.notas.map((n, i) => cf[i] && { t: n.inicio, texto: cf[i] }).filter(Boolean);
      }
      est.layout = P.desenhar(caixa, ex, {
        fins: est.fins, extraFim, marcas, selecao, ativa: sel.voz, cifras,
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
      if (est.sel.pos < v.eventos.length && !travada(est.sel.voz)) { registrar(); v.eventos[est.sel.pos].dur = durAtual(); aplicar(); }
      else { desenhar(); atualizarDoca(); }
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
      for (const k of doca.querySelectorAll(".tecla.ativa")) k.classList.remove("ativa");
      const v = vozSel();
      if (est.sel.pos < v.eventos.length && v.eventos[est.sel.pos].alt) {
        doca.querySelector(`.tecla[data-midi="${M.lerAltura(v.eventos[est.sel.pos].alt).ps}"]`)?.classList.add("ativa");
      }
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
    $(".of-esq").addEventListener("click", () => { est.sel.pos = Math.max(0, est.sel.pos - 1); sincronizarDuracao(); desenhar(); atualizarDoca(); });
    $(".of-dir").addEventListener("click", () => { est.sel.pos = Math.min(vozSel().eventos.length, est.sel.pos + 1); sincronizarDuracao(); desenhar(); atualizarDoca(); });
    $(".of-apagar").addEventListener("click", () => {
      if (!podeEditar()) return;
      const v = vozSel();
      if (!v.eventos.length) return;
      // no meio da voz a nota vira pausa de mesmo valor (nada se desloca); no fim, o último evento sai
      const ev = v.eventos[est.sel.pos];
      if (ev && ev.alt) { registrar(); ev.alt = null; ev.liga = false; }
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
    const ter = $(".of-terminei");
    if (ter) ter.addEventListener("click", () => { est.terminado = true; analisar(); est.terminado = true; });

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
