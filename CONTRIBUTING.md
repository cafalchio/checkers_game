# Contributing

Thanks for your interest in improving the Checkers game! This is a small, dependency-free project, so getting started is quick.

## Getting started

1. Fork and clone the repository.
2. Open `index.html` in a browser. No build step or package install is needed.
   - For audio and `localStorage` to behave consistently, serving over HTTP is recommended:
     ```bash
     python3 -m http.server 8000
     # then visit http://localhost:8000
     ```
3. Create a branch for your change: `git checkout -b fix/short-description`.

Before diving in, read [ARCHITECTURE.md](ARCHITECTURE.md) to see how the code is organised, and [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for good first tasks.

## Project conventions

### Versioning
- Increment the version displayed in `index.html` by `0.01` for each change (for example, `v0.10` to `v0.11`).

### JavaScript
- Keep the `/*jshint esversion: 6 */` header; the code is validated with JSHint.
- Match the existing style: 2-space indentation, double quotes, semicolons, `camelCase` for methods and variables, `PascalCase` for classes.
- Add a short doc comment (`/* ... */`) under new methods describing inputs and outputs, as existing methods do.
- `GameState` is the source of truth for board positions, turns and king status; keep DOM changes as rendering/input only.
- `RulesEngine` must remain DOM-independent. `checkpossibleMove` adapts its results for the UI and computer move selection.

### CSS
- Use `vmin` units with a `max()` pixel floor, so the layout keeps working down to about 250 x 300 px.
- Keep the wood theme (existing textures in `assets/images/`).

### HTML
- Keep it minimal. Game elements are generated from JavaScript.

## Manual test checklist

Run the core unit tests with `npm test`. Before opening a pull request, also check:

- [ ] Start Game, Reset Game, and the cog / close-menu buttons work
- [ ] Options: sound and highlight toggles take effect
- [ ] Rules and Results menus open, scroll, and go back
- [ ] A plain move works for white; invalid squares are not clickable
- [ ] Forced capture: only capturing pieces are movable, and highlight follows the option
- [ ] Multi-jump keeps the turn with the same player
- [ ] Reaching the far row crowns a king that can move backwards
- [ ] Win and loss show the game-over dialog, update the Results counters, and return to the menu
- [ ] Works on a narrow mobile viewport (use browser dev tools)
- [ ] No errors in the browser console

Also run the JavaScript through [JSHint](https://jshint.com/) and, for CSS/HTML changes, the W3C validators, which the README uses for validation.

## Submitting changes

1. Keep pull requests focused: one fix or feature each.
2. Write a clear title and describe what changed and how you tested it. Include screenshots for visual changes.
3. Update `README.md`, `ARCHITECTURE.md` or `KNOWN_ISSUES.md` if your change affects documented behaviour.
4. Use concise, imperative commit messages, e.g. `Fix infinite loop in computer capture`.

## Reporting bugs

Open an issue with:
- What you expected vs what happened
- Steps to reproduce (a move sequence helps a lot)
- Browser, OS and device (the README notes an unconfirmed Android crash, so mobile details are especially useful)
- Console errors, if any

## Ideas welcome

See the "Features Left to Implement" section of the README: a smarter AI, a move timer, smoother animation and a multiplayer mode are all on the wish list.

## License

By contributing, you agree that your contributions are licensed under the project's [MIT License](LICENSE).
