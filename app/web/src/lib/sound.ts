// Tiny synthesized UI sounds (no audio files). iOS unlocks audio on the first tap.
let ctx: AudioContext | null = null;
let enabled = true;

export const setSoundEnabled = (v: boolean) => { enabled = v; };

function ac() {
  if (!ctx) {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.08) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sounds = {
  correct() { if (!enabled) return; tone(660, 0, 0.12, 'triangle'); tone(990, 0.09, 0.2, 'triangle'); },
  wrong() { if (!enabled) return; tone(220, 0, 0.18, 'square', 0.04); tone(185, 0.12, 0.22, 'square', 0.04); },
  tap() { if (!enabled) return; tone(520, 0, 0.05, 'sine', 0.03); },
  complete() { if (!enabled) return; [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.07)); },
};
