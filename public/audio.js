// Web Audio synth engine — all sound generated in-code. Zero files.
// SFX (blips/arps/buzz) + per-world ambient drone loops. Global mute.

const Audio = (() => {
  let ctx = null;
  let master = null;
  let ambientNodes = [];
  let muted = false;
  let currentWorld = null;
  let ambientStarted = false; // true once oscillators are actually running
  let armed = false;          // true only after a real user gesture
  let pendingWorld = null;    // ambient requested before the gesture

  // The AudioContext MUST be created inside a real user gesture, or Chrome
  // permanently blocks it. `ensure()` therefore does nothing until armed.
  function ensure() {
    if (ctx || !armed) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { console.warn('[audio] Web Audio API unavailable'); return; }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
  }
  function resume() {
    if (ctx && ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
  }

  // Call this synchronously from the first pointerdown/keydown handler.
  // Creates + resumes the context inside the gesture, then plays whatever
  // ambient world was queued.
  function arm(world) {
    armed = true;
    ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume(); // synchronous, inside gesture
    playAmbient(world || pendingWorld || 'menu');
  }

  // ---- one-shot tone helper ----
  function tone(freq, start, dur, type = 'sine', vol = 0.2, glideTo = null) {
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function noise(start, dur, vol = 0.15, filterFreq = 1200) {
    const t0 = ctx.currentTime + start;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur);
  }

  // Run a sound now; if the context is still suspended (pre-gesture), resume
  // first and play once it's actually running so tones aren't scheduled into
  // a frozen timeline (currentTime stuck at 0 => silence).
  function withCtx(fn) {
    armed = true; // an SFX call is itself a user gesture
    ensure();
    if (!ctx) return;
    if (ctx.state === 'running') { fn(); return; }
    ctx.resume().then(fn).catch(fn);
  }

  // ---- SFX ----
  const sfx = {
    click() { withCtx(() => { tone(520, 0, 0.08, 'square', 0.12); tone(780, 0.02, 0.06, 'square', 0.08); }); },
    hover() { withCtx(() => tone(660, 0, 0.04, 'sine', 0.05)); },
    correct() {
      withCtx(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.22, 'triangle', 0.18)));
    },
    wrong() {
      withCtx(() => { tone(180, 0, 0.35, 'sawtooth', 0.16, 90); noise(0, 0.3, 0.08, 700); });
    },
    transition() {
      withCtx(() => { tone(300, 0, 0.5, 'sine', 0.12, 900); noise(0, 0.5, 0.06, 1600); });
    },
    start() {
      withCtx(() => [330, 440, 550, 660].forEach((f, i) => tone(f, i * 0.05, 0.3, 'sine', 0.14)));
    },
    win() {
      withCtx(() => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.4, 'triangle', 0.2)));
    },
    lose() {
      withCtx(() => [440, 370, 294, 220].forEach((f, i) => tone(f, i * 0.12, 0.4, 'sawtooth', 0.16)));
    },
  };

  // ---- ambient drone per world ----
  // Each world: base freqs (chord) + LFO wobble + optional filtered noise texture.
  const WORLDS = {
    phishing: { chord: [110, 164.81, 220], noiseFreq: 900, noiseVol: 0.015, wobble: 0.15 },
    server:   { chord: [82.41, 123.47, 164.81], noiseFreq: 400, noiseVol: 0.03, wobble: 0.08 },
    ddos:     { chord: [98, 130.81, 155.56], noiseFreq: 1400, noiseVol: 0.05, wobble: 0.4 },
    raid:     { chord: [130.81, 196, 261.63], noiseFreq: 600, noiseVol: 0.02, wobble: 0.2 },
    menu:     { chord: [130.81, 174.61, 220], noiseFreq: 700, noiseVol: 0.012, wobble: 0.1 },
  };

  function stopAmbient() {
    ambientNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
    ambientNodes = [];
  }

  function playAmbient(world) {
    // Not armed yet (no user gesture) — just remember what to play later.
    if (!armed) { pendingWorld = world; return; }
    ensure();
    if (!ctx) return;
    // Context still spinning up after the gesture's resume(); retry when running.
    if (ctx.state !== 'running') {
      currentWorld = null; // force a real (re)start after resume
      ctx.resume().then(() => playAmbient(world)).catch(() => {});
      return;
    }
    // Skip re-triggering only if this world's drone is already playing.
    if (currentWorld === world && ambientStarted) return;
    currentWorld = world;
    ambientStarted = true;
    stopAmbient();
    const cfg = WORLDS[world] || WORLDS.menu;
    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.gain.setValueAtTime(0, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2); // fade in
    bus.connect(master);
    ambientNodes.push(bus);

    cfg.chord.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.06 / (i + 1);
      // slow detune LFO for movement
      const lfo = ctx.createOscillator();
      lfo.frequency.value = cfg.wobble + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = f * 0.008;
      lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
      osc.connect(g); g.connect(bus);
      osc.start(); lfo.start();
      ambientNodes.push(osc, lfo);
    });

    // texture: looping filtered noise
    if (cfg.noiseVol > 0) {
      const len = Math.floor(ctx.sampleRate * 2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = cfg.noiseFreq; filt.Q.value = 0.7;
      const g = ctx.createGain(); g.gain.value = cfg.noiseVol;
      src.connect(filt); filt.connect(g); g.connect(bus);
      src.start();
      ambientNodes.push(src);
    }
  }

  // Back-compat alias: first-gesture entry point.
  function start(world) { arm(world); }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
  }
  function isMuted() { return muted; }

  // --- diagnostics (call from the browser console) ---
  // GameAudio.debug()  -> logs the live audio state
  // GameAudio.test()   -> plays a plain 1s beep straight to the speakers,
  //                       bypassing master gain / mute / ambient logic.
  function debug() {
    const s = {
      hasAudioContext: !!(window.AudioContext || window.webkitAudioContext),
      ctxCreated: !!ctx,
      ctxState: ctx ? ctx.state : 'none',
      muted,
      masterGain: master ? master.gain.value : 'n/a',
      currentWorld,
      ambientStarted,
      ambientNodeCount: ambientNodes.length,
      localStorage_df_muted: (typeof localStorage !== 'undefined') ? localStorage.getItem('df_muted') : 'n/a',
    };
    console.table(s);
    return s;
  }
  function test() {
    armed = true;
    ensure();
    if (!ctx) { console.error('[audio] no AudioContext'); return; }
    const run = () => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 440;
      g.gain.value = 0.25;
      o.connect(g); g.connect(ctx.destination); // bypass master + mute entirely
      o.start(); o.stop(ctx.currentTime + 1);
      console.log('[audio] test beep scheduled. ctx.state =', ctx.state);
    };
    if (ctx.state !== 'running') ctx.resume().then(run).catch(run); else run();
  }

  return { sfx, playAmbient, stopAmbient, setMuted, isMuted, ensure, resume, arm, start,
    debug, test, getWorld: () => currentWorld };
})();

window.GameAudio = Audio;
