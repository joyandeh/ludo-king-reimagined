import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Coins, Settings, Maximize, Minimize, UserRound, Star, Smartphone, Globe2, X, Music2, VolumeX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleMusic } from "@/lib/sound";
import background from "@/assets/lobby-background.jpg";
import logo from "@/assets/lobby-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Ludo Royale — Choose Your Game" },
    { name: "description", content: "Enter Ludo Royale and play against the computer or share a local game with friends." },
    { property: "og:title", content: "Ludo Royale — Choose Your Game" },
    { property: "og:description", content: "Choose a computer match or a local Pass & Play game." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Lobby,
});

function Lobby() {
  const [dialog, setDialog] = useState<"settings" | "profile" | "coins" | null>(null);
  const [name, setName] = useState("Guest1234");
  const [music, setMusic] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { const changed = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener("fullscreenchange", changed); return () => { document.removeEventListener("fullscreenchange", changed); toggleMusic(false); }; }, []);
  useEffect(() => { if (!dialog) return; const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setDialog(null); }; window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape); }, [dialog]);
  const full = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { setNotice("Fullscreen is unavailable in this browser."); } };
  return <main className="lobby-page">
    <img className="lobby-backdrop" src={background} width={1024} height={1536} alt="" />
    <div className="lobby-shell">
      <header className="lobby-topbar">
        <Button className="lobby-profile" variant="ghost" aria-label="Edit profile" onClick={() => setDialog("profile")}>
          <span className="lobby-avatar"><UserRound /><span className="lobby-online-dot" /></span>
          <span className="lobby-level"><Star fill="currentColor" /> <span>1</span></span>
        </Button>
        <span className="lobby-name">{name}</span>
        <span className="lobby-coins"><Coins /> 0</span>
      </header>
      <Button className="lobby-more-coins" onClick={() => setDialog("coins")}>MORE COINS</Button>
      <Button className="lobby-settings lobby-icon" size="icon" aria-label="Settings" title="Settings" onClick={() => setDialog("settings")}><Settings /></Button>
      <h1 className="lobby-brand"><span className="sr-only">Ludo Royale</span><img src={logo} width={1024} height={768} alt="" /></h1>
      <nav className="lobby-modes" aria-label="Game mode">
        <Button asChild className="lobby-mode"><Link to="/pass-play"><span className="lobby-mode-art"><Smartphone /><span className="lobby-world"><Globe2 /></span><Smartphone /></span><span className="lobby-mode-label">PASS &amp; PLAY</span></Link></Button>
        <Button asChild className="lobby-mode"><Link to="/computer"><span className="lobby-mode-art"><span className="lobby-vs"><Smartphone /><b>VS</b></span></span><span className="lobby-mode-label">COMPUTER</span></Link></Button>
      </nav>
      <footer className="lobby-footer"><span className="lobby-local"><Users /> Ludo Royale</span><Button className="lobby-icon" size="icon" onClick={full} aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"} title="Fullscreen">{fullscreen ? <Minimize /> : <Maximize />}</Button></footer>
      {notice && <p className="lobby-notice" role="status">{notice}</p>}
    </div>
    {dialog && <div className="lobby-modal-backdrop" onClick={() => setDialog(null)}><section className="lobby-modal" role="dialog" aria-modal="true" aria-label={dialog === "settings" ? "Settings" : dialog === "profile" ? "Profile" : "Coins"} onClick={e => e.stopPropagation()}>
      <header><h2>{dialog === "settings" ? "Settings" : dialog === "profile" ? "Profile" : "Coins"}</h2><Button variant="ghost" size="icon" aria-label="Close" autoFocus onClick={() => setDialog(null)}><X /></Button></header>
      {dialog === "settings" && <Button className="w-full" variant="secondary" aria-pressed={music} onClick={() => { toggleMusic(!music); setMusic(!music); }}>{music ? <Music2 /> : <VolumeX />} Music {music ? "On" : "Off"}</Button>}
      {dialog === "profile" && <form onSubmit={e => { e.preventDefault(); setName(name.trim() || "Guest1234"); setDialog(null); }}><label htmlFor="guest-name">Player name</label><input id="guest-name" value={name} maxLength={18} onChange={e => setName(e.target.value)} required /><Button type="submit">Done</Button></form>}
      {dialog === "coins" && <p>0 coins · Both game modes are free. Coin purchases are not available.</p>}
    </section></div>}
  </main>;
}
