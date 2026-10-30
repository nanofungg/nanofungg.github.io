# NanoFun Arcade

GitHub Pages serves `docs/` at https://nanofungg.github.io/. The owned domain nanofungames.com is not connected yet.

## Development
Edit the homepage files in `dist/`, copy them to `docs/`, then run `node preview.mjs` for a localhost preview. Run `node --test tests/*.test.cjs` from this directory.

The Godot source is maintained separately in the private `games/pikachu-volleyball` repository. Only web exports belong in `docs/games/pikachu-volleyball/`. Use a new pack filename and update the HTML mainPack and cache versions when deploying an export.

## Demo wallet
Email identifies a browser-local demo wallet; no email is verified or sent. Daily grants are 10 simulated coins, each full match/restart costs 1, and a simulated reward adds 10 only at zero balance. No real ads, payments, backend ledger or anti-cheat protection are connected.

## Phone controls
`mobile.js` provides independent multi-pointer buttons outside the court. Portrait places controls below the court; short landscape places them beside it. Single player shows P1; local two-player shows P1 and P2. Move, jump and smash can be held/tapped together. Rotation or hiding the page pauses play; the large pause/resume button resumes it. The Touch Controls toggle can also expose these controls on desktop.

The web game polls the host touch bridge for movement and one-shot actions. Existing WASD/R and arrow/Enter keyboard controls remain available. The earlier `.openai/hosting.json` is not the GitHub Pages deployment configuration.
