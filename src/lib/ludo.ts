export type Color = "red" | "green" | "yellow" | "blue";
export const COLORS: Color[] = ["red", "green", "yellow", "blue"];

// 52-cell main track as [row, col], starting at red's start cell, clockwise.
export const TRACK: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0], [6, 0],
];

export const START: Record<Color, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
export const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const HOME_COL: Record<Color, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};

const BASE_ORIGIN: Record<Color, [number, number]> = {
  red: [0, 0], green: [0, 9], yellow: [9, 9], blue: [9, 0],
};
const CENTER: Record<Color, [number, number]> = {
  red: [7, 6.2], green: [6.2, 7], yellow: [7, 7.8], blue: [7.8, 7],
};

export const FINISH = 56;

/** progress: -1 base, 0..50 track, 51..55 home column, 56 finished */
export function cellOf(color: Color, progress: number, idx: number): [number, number] {
  if (progress < 0) {
    const [r, c] = BASE_ORIGIN[color];
    return [r + 1.5 + Math.floor(idx / 2) * 2, c + 1.5 + (idx % 2) * 2];
  }
  if (progress <= 50) return TRACK[(START[color] + progress) % 52];
  if (progress < FINISH) return HOME_COL[color][progress - 51];
  return CENTER[color];
}

export const trackIndex = (color: Color, p: number) =>
  p >= 0 && p <= 50 ? (START[color] + p) % 52 : -1;

export type State = Record<Color, number[]>;

export const initialState = (): State => ({
  red: [-1, -1, -1, -1], green: [-1, -1, -1, -1],
  yellow: [-1, -1, -1, -1], blue: [-1, -1, -1, -1],
});

export function canMove(p: number, dice: number) {
  if (p === FINISH) return false;
  if (p < 0) return dice === 6;
  return p + dice <= FINISH;
}

export function applyMove(s: State, color: Color, i: number, dice: number) {
  const next: State = JSON.parse(JSON.stringify(s));
  const p = next[color][i];
  const np = p < 0 ? 0 : p + dice;
  next[color][i] = np;
  let captured = false;
  const ti = trackIndex(color, np);
  if (ti >= 0 && !SAFE.has(ti)) {
    for (const c of COLORS) {
      if (c === color) continue;
      next[c] = next[c].map((op) => {
        if (trackIndex(c, op) === ti) { captured = true; return -1; }
        return op;
      });
    }
  }
  return { state: next, captured, finished: np === FINISH };
}

export function botChoose(s: State, color: Color, dice: number): number {
  const opts = s[color].map((p, i) => i).filter((i) => canMove(s[color][i], dice));
  let best = opts[0], score = -Infinity;
  for (const i of opts) {
    const r = applyMove(s, color, i, dice);
    const p = s[color][i];
    let sc = Math.random();
    if (r.captured) sc += 100;
    if (r.finished) sc += 60;
    if (p < 0) sc += 40;
    const ti = trackIndex(color, r.state[color][i]);
    if (SAFE.has(ti)) sc += 20;
    sc += p / 10;
    if (sc > score) { score = sc; best = i; }
  }
  return best;
}
