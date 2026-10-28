let ctx: AudioContext | null = null;
const ac = () => (ctx ??= new AudioContext());

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15, delay = 0) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = a.currentTime + delay;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

export const sfx = {
  roll: () => { for (let i = 0; i < 6; i++) tone(200 + Math.random() * 300, 0.05, "square", 0.05, i * 0.06); },
  move: () => tone(660, 0.08, "triangle", 0.12),
  capture: () => { tone(300, 0.15, "sawtooth", 0.12); tone(150, 0.3, "sawtooth", 0.12, 0.12); },
  home: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", 0.12, i * 0.1)),
  six: () => { tone(880, 0.1, "sine", 0.12); tone(1175, 0.15, "sine", 0.12, 0.08); },
  win: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "triangle", 0.14, i * 0.15)),
};

let musicTimer: number | null = null;
const MELODY = [262, 330, 392, 330, 294, 349, 440, 349, 262, 330, 392, 523, 440, 392, 330, 294];
export function toggleMusic(on: boolean) {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  if (!on) return;
  let i = 0;
  musicTimer = window.setInterval(() => {
    tone(MELODY[i % MELODY.length], 0.3, "sine", 0.04);
    if (i % 4 === 0) tone(MELODY[i % MELODY.length] / 2, 0.6, "triangle", 0.035);
    i++;
  }, 280);
}
