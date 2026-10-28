import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  COLORS, type Color, type State, TRACK, HOME_COL, SAFE, START, FINISH,
  initialState, cellOf, canMove, applyMove, botChoose,
} from "@/lib/ludo";
import { sfx, toggleMusic } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludo Royale — Play Ludo Online vs Bots" },
      { name: "description", content: "Roll the dice and race your four tokens home in this colorful Ludo game against three computer opponents." },
      { property: "og:title", content: "Ludo Royale — Play Ludo Online" },
      { property: "og:description", content: "A colorful, free Ludo game in your browser with sounds and music." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

const HUMAN: Color = "red";
const NAMES: Record<Color, string> = { red: "You", green: "Bot Jade", yellow: "Bot Sunny", blue: "Bot Wave" };
const PIP: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

function Game() {
  const [state, setState] = useState<State>(initialState);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [music, setMusic] = useState(false);
  const [msg, setMsg] = useState("Tap the dice to roll!");
  const busy = useRef(false);
  const color = COLORS[turn]!;

  useEffect(() => () => toggleMusic(false), []);

  const nextTurn = (extra: boolean) => {
    setDice(null);
    busy.current = false;
    if (!extra) setTurn((t) => (t + 1) % 4);
    else setTurn((t) => t);
  };

  const doMove = (s: State, c: Color, i: number, d: number) => {
    const r = applyMove(s, c, i, d);
    setState(r.state);
    if (r.captured) { sfx.capture(); setMsg(`${NAMES[c]} captured a token!`); }
    else if (r.finished) sfx.home();
    else sfx.move();
    if (r.state[c].every((p) => p === FINISH)) { setWinner(c); sfx.win(); return; }
    setTimeout(() => nextTurn(d === 6 || r.captured || r.finished), 450);
  };

  const roll = () => {
    if (busy.current || winner) return;
    busy.current = true;
    setRolling(true);
    sfx.roll();
    setTimeout(() => {
      const d = 1 + Math.floor(Math.random() * 6);
      setRolling(false);
      setDice(d);
      if (d === 6) sfx.six();
      const c = COLORS[turn]!;
      const movable = state[c].map((_, i) => i).filter((i) => canMove(state[c][i]!, d));
      if (movable.length === 0) {
        setMsg(`${NAMES[c]} rolled ${d} — no moves`);
        setTimeout(() => nextTurn(false), 800);
        return;
      }
      setMsg(`${NAMES[c]} rolled ${d}`);
      if (c !== HUMAN) {
        setTimeout(() => doMove(state, c, botChoose(state, c, d), d), 600);
      } else if (movable.length === 1) {
        setTimeout(() => doMove(state, c, movable[0]!, d), 350);
      }
    }, 550);
  };

  useEffect(() => {
    if (winner || color === HUMAN) { if (color === HUMAN && !winner) setMsg("Your turn — tap the dice!"); return; }
    const t = setTimeout(roll, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner, state === state]);

  const clickToken = (c: Color, i: number) => {
    if (c !== HUMAN || color !== HUMAN || dice == null || rolling) return;
    if (!canMove(state[c][i]!, dice)) return;
    const d = dice;
    setDice(null);
    doMove(state, c, i, d);
  };

  const restart = () => { setState(initialState()); setTurn(0); setDice(null); setWinner(null); busy.current = false; };

  // Board cells
  const cellClass = (r: number, c: number) => {
    const ti = TRACK.findIndex(([a, b]) => a === r && b === c);
    for (const col of COLORS) {
      if (HOME_COL[col].some(([a, b]) => a === r && b === c)) return `bg-${col}`;
      if (ti === START[col]) return `bg-${col}`;
    }
    if (ti >= 0) return "bg-card";
    return "";
  };

  const tokens: { c: Color; i: number; r: number; col: number; offset: number }[] = [];
  const stack: Record<string, number> = {};
  for (const c of COLORS) state[c].forEach((p, i) => {
    const [r, col] = cellOf(c, p, i);
    const k = `${r},${col}`;
    const offset = p >= 0 ? (stack[k] = (stack[k] ?? -1) + 1) : 0;
    tokens.push({ c, i, r, col, offset });
  });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center px-3 py-6 gap-4">
      <header className="flex w-full max-w-[560px] items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide text-primary">Ludo Royale</h1>
        <div className="flex gap-2">
          <button className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground" onClick={() => { setMusic(!music); toggleMusic(!music); }}>
            {music ? "♫ Music on" : "♫ Music off"}
          </button>
          <button className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground" onClick={restart}>New game</button>
        </div>
      </header>

      <div className="relative aspect-square w-full max-w-[560px] rounded-2xl bg-board p-2 shadow-board">
        <div className="relative grid h-full w-full grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)] gap-px">
          {Array.from({ length: 225 }).map((_, k) => {
            const r = Math.floor(k / 15), c = k % 15;
            const ti = TRACK.findIndex(([a, b]) => a === r && b === c);
            return (
              <div key={k} className={`relative rounded-[3px] ${cellClass(r, c)}`}>
                {ti >= 0 && SAFE.has(ti) && !Object.values(START).includes(ti) && (
                  <span className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">★</span>
                )}
              </div>
            );
          })}
          {COLORS.map((c) => {
            const pos = { red: "top-0 left-0", green: "top-0 right-0", yellow: "bottom-0 right-0", blue: "bottom-0 left-0" }[c];
            return (
              <div key={c} className={`absolute ${pos} h-[40%] w-[40%] rounded-xl bg-${c} p-[12%] ${color === c ? "animate-pulse-ring" : ""}`}>
                <div className="h-full w-full rounded-lg bg-card" />
              </div>
            );
          })}
          <div className="absolute left-[40%] top-[40%] h-[20%] w-[20%] center-tri" />
          {tokens.map(({ c, i, r, col, offset }) => {
            const active = c === HUMAN && color === HUMAN && dice != null && canMove(state[c][i]!, dice);
            return (
              <button
                key={`${c}${i}`}
                onClick={() => clickToken(c, i)}
                className={`token bg-${c} ${active ? "token-active" : ""}`}
                style={{
                  top: `calc(${(r / 15) * 100}% + ${offset * 3}px)`,
                  left: `calc(${(col / 15) * 100}% + ${offset * 3}px)`,
                }}
                aria-label={`${c} token ${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex w-full max-w-[560px] items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-board">
        <div>
          <div className={`text-sm font-bold uppercase text-${color}`}>{color === HUMAN ? "Your" : NAMES[color] + "'s"} turn</div>
          <div className="text-muted-foreground">{winner ? `${NAMES[winner]} won! 🎉` : msg}</div>
        </div>
        <button
          onClick={() => color === HUMAN && roll()}
          disabled={color !== HUMAN || dice != null || !!winner}
          className={`dice grid grid-cols-3 grid-rows-3 gap-1 p-2 ${rolling ? "animate-dice" : ""} ${color === HUMAN && dice == null && !winner ? "ring-4 ring-primary" : ""}`}
          aria-label="Roll dice"
        >
          {Array.from({ length: 9 }).map((_, k) => (
            <span key={k} className={`rounded-full ${PIP[dice ?? 6]!.includes(k) ? "bg-foreground" : ""}`} />
          ))}
        </button>
      </div>

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60">
          <div className="rounded-3xl bg-card p-8 text-center shadow-board">
            <div className="font-display text-4xl text-primary">{winner === HUMAN ? "You win!" : `${NAMES[winner]} wins`}</div>
            <button onClick={restart} className="mt-6 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Play again</button>
          </div>
        </div>
      )}
    </main>
  );
}
