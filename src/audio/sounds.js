// src/audio/sounds.js
// Procedural game sound effects using Web Audio API — zero external dependencies.
// All sounds < 0.5s except playBossSound (≈1.5s).

// ---------------------------------------------------------------------------
// Shared AudioContext (lazily created on first call)
// ---------------------------------------------------------------------------
let _ctx = null;

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browsers require user-gesture)
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }
  return _ctx;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Quick one-shot oscillator with envelope. Returns a Promise that resolves
 *  when the sound finishes (or after `when + dur + tail`). Callers can ignore
 *  the promise if fire-and-forget is fine. */
function playTone({
  type = 'sine',
  freq,
  freqEnd,
  gain = 0.3,
  dur = 0.15,
  attack = 0.005,
  decay = 0.02,
  detune = 0,
  when = 0,
}) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const t0 = now + when;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, t0 + dur);
  }
  if (detune) {
    osc.detune.setValueAtTime(detune, t0);
  }

  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.setValueAtTime(gain, t0 + dur - decay);
  g.gain.linearRampToValueAtTime(0, t0 + dur);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + dur + 0.01);

  // Auto-cleanup after playback
  const endTime = t0 + dur + 0.05;
  return new Promise((resolve) => {
    setTimeout(() => {
      osc.disconnect();
      g.disconnect();
      resolve();
    }, (endTime - now) * 1000 + 50);
  });
}

// ---------------------------------------------------------------------------
// 1. playCardSound  —  short rising sweep (卡牌打出)
// ---------------------------------------------------------------------------
export function playCardSound() {
  // Two slightly-detuned squares for a crunchy "snap" feel
  playTone({ type: 'square', freq: 500, freqEnd: 900, gain: 0.18, dur: 0.12, decay: 0.03 });
  playTone({ type: 'square', freq: 520, freqEnd: 920, gain: 0.12, dur: 0.12, decay: 0.03, detune: 5 });
}

// ---------------------------------------------------------------------------
// 2. playDamageSound —  low thud / impact (受击)
// ---------------------------------------------------------------------------
export function playDamageSound() {
  // Deep noise-like burst — rapid frequency drop
  playTone({ type: 'sawtooth', freq: 150, freqEnd: 40, gain: 0.35, dur: 0.25, attack: 0.002, decay: 0.1 });
  // Sub-bass thump
  playTone({ type: 'sine', freq: 60, freqEnd: 30, gain: 0.4, dur: 0.22, attack: 0.002, decay: 0.08 });
}

// ---------------------------------------------------------------------------
// 3. playHealSound  —  soft rising shimmer (治疗)
// ---------------------------------------------------------------------------
export function playHealSound() {
  // Gentle rising sine with chime-like overtone
  playTone({ type: 'sine', freq: 400, freqEnd: 800, gain: 0.22, dur: 0.4, attack: 0.03, decay: 0.15 });
  // Slightly-detuned overtone for sparkle
  playTone({ type: 'sine', freq: 800, freqEnd: 1200, gain: 0.1, dur: 0.35, attack: 0.04, decay: 0.12, detune: 7 });
  // Triangle wave body
  playTone({ type: 'triangle', freq: 300, freqEnd: 600, gain: 0.15, dur: 0.38, attack: 0.05, decay: 0.2 });
}

// ---------------------------------------------------------------------------
// 4. playSacrificeSound — eerie descent + heartbeat (献祭)
// ---------------------------------------------------------------------------
export function playSacrificeSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Eerie descending whine
  playTone({ type: 'sawtooth', freq: 600, freqEnd: 150, gain: 0.15, dur: 0.45, attack: 0.02, decay: 0.1 });
  playTone({ type: 'sine', freq: 900, freqEnd: 200, gain: 0.08, dur: 0.4, attack: 0.03, decay: 0.12, detune: -10 });

  // Heartbeat thumps (two pulses)
  function heartbeat(tOffset, vol) {
    const t0 = now + tOffset;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.2);
    setTimeout(() => { osc.disconnect(); g.disconnect(); }, 300);
  }

  heartbeat(0.1, 0.45);
  heartbeat(0.28, 0.35);
}

// ---------------------------------------------------------------------------
// 5. playBossSound  —  deep rumbling roar (Boss登场, ≈1.5s)
// ---------------------------------------------------------------------------
export function playBossSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const dur = 1.5;

  // Layer 1: deep sub rumble
  const osc1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(40, now);
  osc1.frequency.linearRampToValueAtTime(35, now + dur);
  g1.gain.setValueAtTime(0, now);
  g1.gain.linearRampToValueAtTime(0.25, now + 0.15);
  g1.gain.setValueAtTime(0.25, now + dur - 0.4);
  g1.gain.linearRampToValueAtTime(0, now + dur);
  osc1.connect(g1);
  g1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + dur + 0.05);

  // Layer 2: dissonant mid-range growl
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(90, now);
  osc2.frequency.linearRampToValueAtTime(55, now + dur);
  g2.gain.setValueAtTime(0, now);
  g2.gain.linearRampToValueAtTime(0.12, now + 0.3);
  g2.gain.setValueAtTime(0.12, now + dur - 0.3);
  g2.gain.linearRampToValueAtTime(0, now + dur);
  osc2.connect(g2);
  g2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + dur + 0.05);

  // Layer 3: slow tremolo pulse
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(6, now);
  lfoGain.gain.setValueAtTime(15, now);
  lfo.connect(lfoGain);
  lfoGain.connect(osc2.frequency);
  lfo.start(now);
  lfo.stop(now + dur + 0.05);

  // Cleanup
  setTimeout(() => {
    osc1.disconnect(); g1.disconnect();
    osc2.disconnect(); g2.disconnect();
    lfo.disconnect(); lfoGain.disconnect();
  }, (dur + 0.1) * 1000);
}

// ---------------------------------------------------------------------------
// 6. playVictorySound — glorious ascending arpeggio + chord (胜利)
// ---------------------------------------------------------------------------
export function playVictorySound() {
  // C5-E5-G5 ascending arpeggio into a held major chord
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const stepTime = 0.08;
  const holdTime = 0.35;

  notes.forEach((freq, i) => {
    const when = i * stepTime;
    playTone({
      type: 'triangle',
      freq,
      gain: 0.2,
      dur: holdTime + (notes.length - i) * stepTime,
      attack: 0.01,
      decay: 0.12,
      when,
    });
    // Bright overtone
    playTone({
      type: 'sine',
      freq: freq * 2,
      gain: 0.08,
      dur: holdTime + (notes.length - i) * stepTime - 0.03,
      attack: 0.015,
      decay: 0.1,
      when,
    });
  });

  // Final shimmer: high octave C
  playTone({
    type: 'sine',
    freq: 1046.5,
    gain: 0.1,
    dur: holdTime,
    attack: 0.02,
    decay: 0.15,
    when: notes.length * stepTime - 0.01,
  });
}

// ---------------------------------------------------------------------------
// 7. playDeathSound  —  fading descent (死亡)
// ---------------------------------------------------------------------------
export function playDeathSound() {
  // Descending sad tone
  playTone({ type: 'sawtooth', freq: 350, freqEnd: 60, gain: 0.18, dur: 0.45, attack: 0.02, decay: 0.2 });
  // Low mournful undertone
  playTone({ type: 'triangle', freq: 200, freqEnd: 40, gain: 0.2, dur: 0.5, attack: 0.01, decay: 0.25 });
  // Slight dissonance
  playTone({ type: 'sine', freq: 420, freqEnd: 80, gain: 0.07, dur: 0.42, attack: 0.03, decay: 0.18, detune: -20 });
}

// ---------------------------------------------------------------------------
// 8. playClickSound — UI click (点击)
// ---------------------------------------------------------------------------
export function playClickSound() {
  // Very short high-frequency tick
  playTone({ type: 'sine', freq: 1200, gain: 0.2, dur: 0.04, attack: 0.001, decay: 0.015 });
  // Subtle body
  playTone({ type: 'square', freq: 800, gain: 0.08, dur: 0.03, attack: 0.001, decay: 0.01 });
}

// ---------------------------------------------------------------------------
// Optional: resume AudioContext from a user-gesture event handler.
// Call this once on the first click/touch/keydown in your app.
// ---------------------------------------------------------------------------
export function initAudio() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}