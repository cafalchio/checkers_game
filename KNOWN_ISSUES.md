# Known Issues and Improvement Notes

Findings from reading the source in `assets/js/script.js`, `assets/css/style.css`, `index.html` and the README. Items marked **(read from code)** were identified by inspection and have not all been reproduced in a browser. Treat them as leads to verify.

## Already documented in the README

- Captures are forced, but the player is not required to take the *maximum* number of pieces.
- The computer uses a shallow move-scoring heuristic on Medium and Hard, and random choices on Easy. It does not search future turns.
- A crash on Android was reported but not reproduced.

## Remaining likely bugs

### Undefined `this.notify` sound
`playSound("notify")` references `this.notify`, which is never created. Nothing calls it today, but it would throw.

## Rules text vs behaviour

The in-game Rules screen says things the code does not do:

| Rules text | Actual behaviour |
|---|---|
| "A draw will also occur after 30 moves made just by kings without piece taking" | No draw logic exists |
| Jumps are "forward only" | Kings can capture backwards (correct for checkers, but the text is misleading) |
| Stray word "Kings" before the King heading | Typo in the template |
| "jungs" | Typo for "kings" |

## README discrepancies

- The README states each side has 16 pieces; the code creates **12** per side (the standard 8x8 count).
- The Introduction says the pieces occupy "the 12 squares closest", which matches the code but contradicts the 16 figure above.
- The W3C validation line has a stray `-->` and the image is not embedded.
- The `rel="nofolow"` attribute is misspelled (should be `rel="nofollow"`, or better `noopener`).
- `index.html` metadata lists "247games LLC" as author and copyright holder, while the LICENSE names `__cafa__`. Worth confirming which is correct.

## Code quality and maintainability

- **Global `board` / `menu` instances** are referenced inside class methods. This makes the classes hard to test; passing dependencies in would help.
- **UI state remains on DOM nodes** (`movable`, `suppressClick`), while position, color, king status, legal moves, AI simulation and winner detection use `GameState` and `RulesEngine`.
- **`innerHTML` string templates** in `Menu` repeat the same close/back wiring in four places and could share a helper.
- **`updateScore`** has a redundant null-branch (scores are initialised in the constructor).
- **`turn` counter** is incremented but never used.
- **Win/loss handling** now uses an in-game dialog; acknowledging it reloads to the main menu and resets the board. The forced-capture highlight setting is still reset on reload.
- **Accessibility:** pieces and squares are not keyboard-accessible and have no ARIA labels. Menu items are `div`s rather than buttons.
- **Font Awesome** is loaded twice, v4.7 CSS and v5.0.6 JS. Only one is needed (the code uses v5 class names such as `far fa-times-circle`).
- **`favicon.ico?`** in `index.html` has a stray `?`.

## Suggested roadmap

1. Implement the maximum-capture and draw rules, or remove them from the Rules text.
2. Improve the AI (e.g. avoid immediate losses, then minimax with a shallow depth).
3. Add a move timer, smoother animations, and multiplayer.
