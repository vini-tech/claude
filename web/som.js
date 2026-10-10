/* Som: síntese simples de piano com WebAudio. O áudio só começa depois de um toque do usuário. */
(function (raiz, fabrica) {
  raiz.Som = fabrica();
})(this, function () {
  "use strict";

  let ctx = null;
  function contexto() {
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function voz(destino, ps, ini, dur, forte = 0.9) {
    const f = 440 * Math.pow(2, (ps - 69) / 12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ini);
    g.gain.linearRampToValueAtTime(forte, ini + 0.012);
    g.gain.exponentialRampToValueAtTime(forte * 0.4, ini + 0.35);
    g.gain.setTargetAtTime(forte * 0.2, ini + 0.35, Math.max(0.3, dur * 0.8));
    g.gain.setTargetAtTime(0.0001, ini + dur - 0.02, 0.04);
    g.connect(destino);
    const osc = [];
    for (const [tipo, mult, vol] of [["triangle", 1, 0.8], ["sine", 2, 0.18]]) {
      const o = ctx.createOscillator(), gv = ctx.createGain();
      gv.gain.value = vol; o.type = tipo; o.frequency.value = f * mult;
      o.connect(gv); gv.connect(g);
      o.start(ini); o.stop(ini + dur + 0.3);
      osc.push(o);
    }
    return osc;
  }

  // uma nota (ou várias juntas) agora
  function nota(ps, dur = 0.6, forte = 0.35) {
    if (!contexto()) return;
    for (const p of [].concat(ps)) voz(ctx.destination, p, ctx.currentTime + 0.01, dur, forte);
  }

  let atual = null;
  function parar() {
    if (!atual) return;
    for (const o of atual.osc) { try { o.stop(); } catch (e) {} }
    cancelAnimationFrame(atual.raf);
    const fim = atual.aoFim;
    atual = null;
    if (fim) fim();
  }

  /* toca um exercício do Motor. aoTick(t em ticks) a cada quadro; aoFim quando acaba ou para. */
  // de/ate (ticks): toca só um trecho
  function tocar(ex, { bpm = 112, T = 960, aoTick, aoFim, de = 0, ate = Infinity } = {}) {
    parar();
    if (!ex || !contexto()) return false;
    const seg = (ticks) => (ticks / T) * (60 / bpm);
    const t0 = ctx.currentTime + 0.12;
    const mestre = ctx.createGain();
    mestre.gain.value = 0.9 / Math.max(2, ex.vozes.length);
    mestre.connect(ctx.destination);
    const osc = [];
    const fim = Math.min(ex.fim, ate);
    for (const v of ex.vozes) for (const n of v.notas) {
      if (n.fim <= de || n.inicio >= fim) continue;
      const ini = Math.max(n.inicio, de);
      osc.push(...voz(mestre, n.ps, t0 + seg(ini - de), seg(Math.min(n.fim, fim) - ini)));
    }
    const total = seg(fim - de);
    atual = { osc, raf: 0, aoFim };
    const quadro = () => {
      if (!atual) return;
      const agora = ctx.currentTime - t0;
      if (agora > total + 0.25) { parar(); return; }
      if (aoTick) aoTick(de + Math.max(0, agora) * (bpm / 60) * T);
      atual.raf = requestAnimationFrame(quadro);
    };
    atual.raf = requestAnimationFrame(quadro);
    return true;
  }

  return { nota, tocar, parar, tocando: () => !!atual };
});
