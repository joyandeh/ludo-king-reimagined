import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  COLORS, type Color, type State, TRACK, HOME_COL, SAFE, START, FINISH,
  initialState, cellOf, canMove, applyMove, botChoose,
} from "@/lib/ludo";
import { sfx, toggleMusic } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Pawn, PlayerPanel } from "@/components/game-pieces";
import { Music2, VolumeX, RotateCcw } from "lucide-react";

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

function Game() {
  const [state, setState] = useState<State>(initialState);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [music, setMusic] = useState(false);
  const [msg, setMsg] = useState("Tap the dice to roll!");
  const busy = useRef(false);
  const color = COLORS[turn] ?? HUMAN;

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
      const c = COLORS[turn] ?? HUMAN;
      const movable = state[c].map((p, i) => canMove(p, d) ? i : -1).filter((i) => i >= 0);
      if (movable.length === 0) {
        setMsg(`${NAMES[c]} rolled ${d} — no moves`);
        setTimeout(() => nextTurn(false), 800);
        return;
      }
      setMsg(`${NAMES[c]} rolled ${d}`);
      if (c !== HUMAN) {
        setTimeout(() => doMove(state, c, botChoose(state, c, d), d), 600);
      } else if (movable.length === 1) {
        const onlyMove = movable[0];
        if (onlyMove !== undefined) setTimeout(() => doMove(state, c, onlyMove, d), 350);
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
    const progress = state[c][i];
    if (progress === undefined || !canMove(progress, dice)) return;
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
    <main className="game-layout bg-background text-foreground">
      <header className="game-header grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h1 className="min-w-0 font-display text-2xl text-primary sm:text-3xl">Ludo Royale</h1>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="icon" className="h-11 w-11" aria-label={music ? "Turn music off" : "Turn music on"} aria-pressed={music} title={music ? "Turn music off" : "Turn music on"} onClick={() => { setMusic(!music); toggleMusic(!music); }}>
            {music ? <Music2 /> : <VolumeX />}
          </Button>
          <Button variant="secondary" size="icon" className="h-11 w-11" aria-label="New game" title="New game" onClick={restart}><RotateCcw /></Button>
        </div>
      </header>

      <div className="game-arena">
        <div className="player-row">
          {(["red", "green"] as Color[]).map((c) => <PlayerPanel key={c} color={c} name={NAMES[c]} active={color === c} human={c === HUMAN} dice={dice} rolling={rolling} disabled={c !== HUMAN || color !== HUMAN || dice != null || rolling || !!winner} finished={state[c].filter((p) => p === FINISH).length} onRoll={roll} />)}
        </div>
      <div className="game-board relative aspect-square bg-board shadow-board">
        <div className="board-grid relative grid h-full w-full grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)]">
          {Array.from({ length: 225 }).map((_, k) => {
            const r = Math.floor(k / 15), c = k % 15;
            const ti = TRACK.findIndex(([a, b]) => a === r && b === c);
            return (
              <div key={k} className={`board-cell relative ${cellClass(r, c)}`}>
                {ti >= 0 && SAFE.has(ti) && (
                  <svg viewBox="0 0 24 24" className="safe-star" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" /></svg>
                )}
              </div>
            );
          })}
          {COLORS.map((c) => {
            const pos = { red: "top-0 left-0", green: "top-0 right-0", yellow: "bottom-0 right-0", blue: "bottom-0 left-0" }[c];
            return (
              <div key={c} className={`home-zone absolute ${pos} h-[40%] w-[40%] bg-${c}`}>
                <div className="home-court bg-card" />
                {[0, 1, 2, 3].map((i) => <span key={i} className={`home-seat home-seat-${i} text-${c}`} />)}
              </div>
            );
          })}
          <div className="absolute left-[40%] top-[40%] h-[20%] w-[20%] center-tri" />
          {tokens.map(({ c, i, r, col, offset }) => {
            const progress = state[c][i];
            const active = c === HUMAN && color === HUMAN && dice != null && progress !== undefined && canMove(progress, dice);
            return (
              <Button variant="ghost"
                key={`${c}${i}`}
                onClick={() => clickToken(c, i)}
                className={`token ${active ? "token-active" : ""}`}
                style={{
                  top: `calc(${(r / 15) * 100}% + ${offset * 3}px)`,
                  left: `calc(${(col / 15) * 100}% + ${offset * 3}px)`,
                }}
                aria-label={`${c} token ${i + 1}`}
              ><Pawn color={c} id={`${c}-${i}`} /></Button>
            );
          })}
        </div>
      </div>
        <div className="player-row">
          {(["blue", "yellow"] as Color[]).map((c) => <PlayerPanel key={c} color={c} name={NAMES[c]} active={color === c} human={false} dice={dice} rolling={rolling} disabled finished={state[c].filter((p) => p === FINISH).length} onRoll={roll} />)}
        </div>
      </div>

      <div className="game-status flex items-center gap-3 bg-card p-3">
        <div className="min-w-0">
          <div className={`text-sm font-bold uppercase text-${color}`}>{color === HUMAN ? "Your" : NAMES[color] + "'s"} turn</div>
          <div className="break-words text-sm text-muted-foreground sm:text-base" aria-live="polite">{winner ? `${NAMES[winner]} won! 🎉` : msg}</div>
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60">
          <div className="mx-4 max-w-full rounded-lg bg-card p-6 text-center shadow-board">
            <div className="font-display text-4xl text-primary">{winner === HUMAN ? "You win!" : `${NAMES[winner]} wins`}</div>
            <Button onClick={restart} className="mt-6 h-11 px-6 font-bold">Play again</Button>
          </div>
        </div>
      )}
    </main>
  );
}
