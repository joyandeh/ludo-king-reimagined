import { Button } from "@/components/ui/button";
import type { Color } from "@/lib/ludo";

const PIPS: Record<number, [number, number][]> = {
  1: [[32, 32]], 2: [[18, 18], [46, 46]],
  3: [[18, 18], [32, 32], [46, 46]],
  4: [[18, 18], [46, 18], [18, 46], [46, 46]],
  5: [[18, 18], [46, 18], [32, 32], [18, 46], [46, 46]],
  6: [[18, 18], [46, 18], [18, 32], [46, 32], [18, 46], [46, 46]],
};

export function DiceFace({ value }: { value: number }) {
  return <svg viewBox="0 0 64 64" className="dice-face" aria-hidden="true">
    {(PIPS[value] ?? PIPS[6])?.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" className="dice-pip" />)}
  </svg>;
}

export function Pawn({ color, id }: { color: Color; id: string }) {
  return <svg viewBox="0 0 36 46" className={`pawn-art text-${color}`} aria-hidden="true">
    <defs><linearGradient id={`pawn-${id}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" className="pawn-light" /><stop offset="0.45" stopColor="currentColor" /><stop offset="1" className="pawn-dark" />
    </linearGradient></defs>
    <ellipse cx="18" cy="41" rx="14" ry="4" className="pawn-shadow" />
    <path d="M12 24 C12 29 9 32 7 36 Q5 42 18 42 Q31 42 29 36 C27 32 24 29 24 24 Z" fill={`url(#pawn-${id})`} className="pawn-outline" />
    <circle cx="18" cy="15" r="12" fill={`url(#pawn-${id})`} className="pawn-outline" />
    <path d="M10 13 Q11 7 17 7" className="pawn-shine" />
    <path d="M10 37 Q18 40 26 37" className="pawn-base-line" />
  </svg>;
}

export function PlayerPanel({ color, name, active, human, dice, rolling, disabled, finished, onRoll }: {
  color: Color; name: string; active: boolean; human: boolean; dice: number | null;
  rolling: boolean; disabled: boolean; finished: number; onRoll: () => void;
}) {
  return <section className={`player-panel player-${color} ${active ? "player-current" : ""}`} aria-label={`${name}${active ? ", current player" : ""}`}>
    <div className={`player-avatar text-${color}`}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="23" className="avatar-background" />
        <path d="M7 47 C7 30 41 30 41 47" fill="currentColor" />
        <path d="M19 28 H29 V37 Q24 41 19 37 Z" className="avatar-skin" />
        <ellipse cx="24" cy="21" rx="10" ry="13" className="avatar-skin" />
        <path d={color === "green" ? "M13 26 Q8 6 24 6 Q40 6 35 28 L32 16 Q20 18 17 12 Z" : color === "yellow" ? "M13 18 Q10 8 18 7 L22 4 27 7 Q38 5 35 20 L30 13 17 16 Z" : color === "blue" ? "M13 20 Q11 6 24 6 Q38 6 35 20 L29 14 17 15 Z" : "M13 20 Q10 5 24 6 Q39 4 35 20 L31 14 Q22 16 17 12 Z"} className="avatar-hair" />
        <circle cx="20" cy="22" r="1" className="avatar-hair" /><circle cx="28" cy="22" r="1" className="avatar-hair" />
        <path d="M21 28 Q24 30 27 28" className="avatar-smile" />
      </svg>
    </div>
    <div className="player-identity"><strong>{name}</strong><span>{human ? "You" : "Computer"} · {finished}/4</span></div>
    <Button variant="outline" className={`player-dice ${active ? "dice-current" : ""} ${active && rolling ? "animate-dice" : ""}`}
      disabled={disabled} onClick={onRoll} aria-label={human ? "Roll dice" : `${name}'s dice`}>
      <DiceFace value={active ? dice ?? 6 : 6} />
    </Button>
    {active && <span className="turn-marker" aria-hidden="true" />}
  </section>;
}