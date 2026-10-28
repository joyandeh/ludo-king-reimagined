<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the game in a width-constrained portrait layout and a board-plus-controls landscape layout on short screens so play remains visible without horizontal scrolling.
- Render reusable pawn, die, and player visuals in the browser-safe game-pieces module; SVG keeps pieces crisp and dice pips stable at every board size.
