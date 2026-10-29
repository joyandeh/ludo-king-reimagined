import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/ludo-game";
export const Route = createFileRoute("/computer")({ head: () => ({ meta: [
  { title: "Ludo Royale — VS Computer" }, { name: "description", content: "Play the original Ludo Royale board against three computer players." },
  { property: "og:title", content: "Ludo Royale — VS Computer" }, { property: "og:description", content: "Roll the dice and race three computer players home." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Computer });
function Computer() { return <Game />; }
