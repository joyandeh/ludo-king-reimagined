import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/ludo-game";
export const Route = createFileRoute("/pass-play")({ head: () => ({ meta: [
  { title: "Ludo Royale — Pass & Play" }, { name: "description", content: "Share a local four-player Ludo Royale match on one device." },
  { property: "og:title", content: "Ludo Royale — Pass & Play" }, { property: "og:description", content: "Play Ludo with friends on the same device." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: PassPlay });
function PassPlay() { return <Game passAndPlay />; }
