# Checkers Game

## Introduction

Checkers Game is played against the computer, with 8x8 British draughts or 10x10 International draughts. The objective is to capture all the opponent's pieces or block them so they cannot move. You can play as White or Black at three difficulty levels. International draughts is the default, with 20 pieces per side, flying kings, backward man captures, and compulsory longest sequences. The interface is available in **English and French**.

The game logic is written in vanilla JavaScript (ES modules), and the interface in HTML and CSS. No build step or framework is needed.

<a href="https://cafalchio.github.io/checkers_game/" rel="noopener">Visit and play the live version of the game here</a>

![Responsive Game](assets/images/responsive.png)
The game can be played on any device, including small mobile phones down to about 250 x 300 px.

## Table of Contents

- [Checkers Game](#checkers-game)
  - [Introduction](#introduction)
  - [Table of Contents](#table-of-contents)
  - [UX](#ux)
  - [Technologies](#technologies)
  - [Architecture](#architecture)
  - [Features](#features)
    - [Main Menu](#main-menu)
    - [Computer Game Setup](#computer-game-setup)
    - [In-Game Menu](#in-game-menu)
    - [Options Menu](#options-menu)
    - [Rules Menu](#rules-menu)
    - [Results Menu](#results-menu)
    - [Game](#game)
    - [Saved Data](#saved-data)
  - [Testing](#testing)
  - [Known Issues and Rule Deviations](#known-issues-and-rule-deviations)
  - [Technical Debt](#technical-debt)
  - [Features Left to Implement](#features-left-to-implement)
  - [Deployment](#deployment)
  - [Credits](#credits)
  - [Acknowledgements](#acknowledgements)

## UX

- Site goals
  - Provide a fun and interactive game for the user to play.
  - Have a pleasant wood theme that is easy to use and navigate.
  - Have a responsive design that works on any device.
  - Have an intuitive menu.

- User goals
  - Play a quick game of checkers against the computer, with no sign-in.
  - Play on any device, in English or French.

## Technologies

- HTML: page structure.
- CSS: styling (`assets/css/style.css`, `assets/css/last-move.css`).
- JavaScript (ES modules): game logic, UI and AI.
- Font Awesome (loaded from CDN): menu icons.
- Node.js (dev only): dependency-free unit tests for the core modules.
- GitHub / GitHub Pages: version control and hosting.
- GIMP: image editing.

## Architecture

```
index.html
assets/js/
├── script.js            # UI layer: Board, Piece and Menu classes, computer AI, i18n strings
├── last-move.js         # Classic script: renders last-move highlight and captured "ghosts"
└── core/
    ├── game-state.js    # GameState: serializable, DOM-free position (squares, turn, ruleset, revision)
    └── rules-engine.js  # RulesEngine: captures, simple moves, mandatory capture, move validation
```

- **`GameState`** holds plain board data (64 squares for British or 100 for International, turn, ruleset, revision counter), so it can later be sent over a network. `applyMove` checks state integrity and turn ownership, handles king promotion, and rejects stale revisions.
- **`RulesEngine`** is stateless apart from the chosen ruleset. It decides what is legal (`getCaptureOptions`, `getSimpleMoves`, `getMandatoryCaptures`, `getLegalMoves`, `validateMove`, `hasLegalMoves`).
- **`script.js`** keeps the rendered DOM in sync with `GameState`. Every move goes through `Board.submitMove`, which validates, applies the move to the state, updates the DOM and dispatches a `checkers:move` event that `last-move.js` listens to.
- **Square numbering**: squares are indexed 0-63, row-major from the top-left. Black starts on the top three rows, White on the bottom three. White always moves first.

## Features

### Main Menu

The first screen asks you to choose a game mode:

- **Against computer** (available).
- **Against local player** and **Against online player** (disabled, marked "coming soon").

A footer gives access to **Options**, **Rules** and **Results**.

![Game menu](assets/images/main_menu.png)

### Computer Game Setup

After choosing "Against computer", you configure the game and press **Start Game!**:

- **Play as**: White or Black. If you choose Black, the computer moves first.
- **Difficulty**: Easy, Medium or Hard.
- **Rule set**: International draughts or British draughts.

Difficulty and ruleset are remembered for next time. The chosen colour is not.

### In-Game Menu

Once a game is running, the small cog icon opens a menu with **Restart**, **Rules** and **Results**. Restart reloads the page. The menu closes when you click outside it. Options (language, highlight) are only reachable from the main menu, before a game starts.

![Restart Game](assets/images/reset_game.png)

Two always-visible buttons control **sound** (off by default) and **fullscreen**.

### Options Menu

- **Forced capture highlight**: highlights the pieces that must capture (on by default, not saved between sessions).
- **Language**: English or French. The initial language follows the browser preference (French when French is preferred, otherwise English). The choice is saved.

![Options menu](assets/images/options_menu.png)

### Rules Menu

Shows the rules for the currently selected ruleset, in the selected language. The text can be scrolled.

![Rules menu](assets/images/rules_menu.png)

### Results Menu

Shows the number of games won by the player and by the computer, with a button to reset both. Results are stored in the browser's local storage. Draws are not tracked (see [Known Issues](#known-issues-and-rule-deviations)).

![Results menu](assets/images/results_menu.png)

### Game

![Game](assets/images/game_play.png)

- British: 8x8 board with 12 pieces per side. International: 10x10 board with 20 pieces per side.
- Move by **click** (select a piece, then a highlighted square) or by **dragging** (pointer events, so it works with mouse and touch).
- **Captures are mandatory.** A multi-capture is played one jump at a time with the same piece. International captures must use the longest available sequence; captured pieces remain as blockers and are removed when the sequence ends. The computer also shows each jump before continuing.
- A piece reaching the last row becomes a king.
- The last move is highlighted, and the pieces captured by it are shown as faint "ghosts" until the next move.
- Captured pieces are collected in trays beside the board.
- A game-over dialog announces the winner (no pieces left, or no legal moves) and returns to the menu.
- The computer plays with a random "thinking" delay that is shorter on higher difficulties.

| Difficulty | Quiet moves | Captures |
| --- | --- | --- |
| Easy | Random legal move | Random legal capture |
| Medium | Heuristic, but random 35% of the time | Heuristic, but random 35% of the time |
| Hard | Always the best-scoring move | Always the best-scoring capture |

The heuristic is a one-move scoring function (advancement, mobility, centre control, promotion bonus, and penalties for leaving pieces capturable). It does not search future turns.

### Saved Data

Stored in the browser's `localStorage`:

| Key | Meaning |
| --- | --- |
| `language` | `en` or `fr` |
| `ruleset` | `international` or `british` |
| `difficulty` | `easy`, `medium` or `hard` |
| `soundEnabled` | `"true"` or `"false"` |
| `whiteScore` | Games won by **the player** (regardless of colour) |
| `blackScore` | Games won by **the computer** (regardless of colour) |

## Testing

The core state and rules modules have dependency-free Node unit tests:

```bash
npm test
```

The browser E2E test covers ruleset selection, starting an International game, and opening its Rules screen without losing the board:

```bash
npx playwright install chromium
npm run test:e2e
```

Validation (screenshots may predate the current code and should be re-run, see [Technical Debt](#technical-debt)):

- W3C HTML validation: `assets/images/W3C.png`
- Jigsaw CSS validation:

  ![Jigsaw](assets/images/jigsaw.png)

- JSHint:

  ![Jshint](assets/images/javascript_test.png)

- Lighthouse mobile and desktop:

  ![LightHouse Mobile](assets/images/lighthouse_mobile.png)

  ![LightHouse Desktop](assets/images/lighthouse_desktop.png)

## Known Issues and Rule Deviations

User-visible behaviour that differs from what players, or the in-game rules text, may expect.

**Rules**

- **No draw detection.** The rules text promises a draw "after 30 moves by kings without a capture" and when "neither side can force a win", but `checkWinner` only detects "no pieces" and "no legal moves". Two kings can shuffle forever, and the results screen has no draw counter. *Either implement it or remove the sentence from both translations.*
- **Draw detection is incomplete.** No draw counter or forced-draw detection is implemented.
- International multi-captures are performed one jump at a time. Captured pieces stay on the board as blockers until the sequence finishes, then are removed together as required by the rules.

**Game**

- The computer uses a shallow one-move heuristic (Medium, Hard) or random choices (Easy). It does not search future turns, so it is easy to beat on tactics.
- It was reported to crash on Android, but I was not able to reproduce it. Likely suspects are listed in [Technical Debt](#technical-debt) (unguarded `localStorage`, uncaught `throw`s inside timers, unhandled `Audio.play()` rejections).
- "Restart" and "OK" after game over both call `location.reload()`, so there is no in-place restart and the chosen colour is lost.
- Changing language during a game is not possible (Options is not in the in-game menu), and only the turn message is re-translated when it is.

## Technical Debt

Ordered roughly by risk. "Where" points to the relevant code.

### High

| # | Debt | Where | Suggested fix |
| --- | --- | --- | --- |
| 1 | **Unguarded `localStorage`**: reads and writes are not wrapped in `try/catch`. In private modes or with blocked storage the constructor throws and the game never loads. This is a plausible cause of the Android crash. | `Board` constructor, `updateScore`, `Menu.results` | Small `storage` helper with `try/catch` and in-memory fallback. |
| 2 | **Uncaught `throw` inside timers**: `submitMove` and `scoreComputerMove` throw when the DOM and state disagree. They run from `setTimeout` callbacks, so one inconsistency freezes the game silently. | `submitMove`, `scoreComputerMove`, `computerMove` | Catch at the `computerMove` boundary, log, and recover or show a message. |
| 3 | **Two sources of truth**: `GameState` plus `pieceElements`, `piecePositions` (WeakMap), expando properties on DOM nodes (`piece.movable`, `piece.suppressClick`), and the `needTake` / `takeIt` arrays. They must be kept in sync by hand. | `Board` | Render the DOM from `GameState` in one `render()` function; derive "movable" and capture lists from the `RulesEngine` on demand. |
| 4 | **Rules text and code disagree** (draw rule, see above). | `translations`, `checkWinner` | Implement or remove. |
| 5 | **UI coverage is limited to a Playwright smoke flow**, and `script.js` is one ~1000-line file mixing i18n data, board rendering, AI, drag handling and menus. | `script.js` | Split into modules (`i18n.js`, `ai.js`, `board-view.js`, `menu.js`); move the AI to a pure function over `GameState` so it can be unit tested. |

### Medium

| # | Debt | Where | Suggested fix |
| --- | --- | --- | --- |
| 6 | **Global singleton coupling**: `Piece`, listeners and timers reference the global `board` (declared after the classes). Listeners are shared functions (`pieceClick`, `movePiece`) that use `board` instead of `this`. | `Piece.get_piece`, `pieceClick`, `movePiece`, `gameControl` | Pass the board in, or bind handlers. |
| 7 | **Implicit event ordering**: `submitMove` dispatches `checkers:move` *before* it moves captured pieces in the DOM, and `last-move.js` throws if the captured piece is already gone. | `submitMove`, `last-move.js` | Include the captured piece colour/king flag in the event detail, or dispatch after rendering. |
| 8 | **Duplicate AI paths**: `takePiece` and `moveComputerPiece` each implement the random-vs-heuristic choice. Magic numbers (0.35, delay ranges, loop cap 12, 80/100/10 weights) are inline. | `takePiece`, `moveComputerPiece`, `gameControl` | One `chooseMove(candidates, difficulty)` plus a `DIFFICULTY` config object. |
| 9 | **Fragile capture bookkeeping**: `takeIt` entries are `[piece, captured, landing]` tuples built as a side effect of `checkpossibleMove`, which also returns moves and mutates `needTake`. | `checkpossibleMove`, `checkIfcanTake`, `getComputerCaptures` | Make it a pure query on `RulesEngine`. |
| 10 | **Misleading score keys**: `whiteScore` / `blackScore` actually mean player / computer, and `updateScore` has an unreachable null branch. | `updateScore`, `Menu.results` | Rename (with a one-time migration) to `playerWins` / `computerWins`. |
| 11 | **Timers are never cancelled** (computer move, `checkWinner`, 3 s fullscreen error). "Restart" works only because it reloads the page. | `gameControl`, `toggleFullscreen` | Track timer ids; clear on restart. |
| 12 | **Checking for a winner on a 1 s timer** after every turn, and `checkWinner` counts *moves* in variables called `...PiecesLeft`. | `checkWinner` | Check right after each move, and rename variables. |
| 13 | **Accessibility**: close and back controls are `<div>` icons (not focusable or keyboard operable); the game-over dialog does not trap focus; the board is not keyboard playable. | `Menu.*`, `showGameOver` | Use `<button>`s with labels; add keyboard controls. |

### Low (cleanup)

- **Dead code**: `whiteKing`, `blackKing`, `this.turn` counter, `removeMoving()` (registers a `movestart` listener), `CheckersRules` alias, `RulesEngine.getCaptureMoves`, `hasLegalMoves` (unused in `script.js`), `Piece.color`, and the in-game branch of `setRuleset`, which is unreachable since the setup menu is only shown before a game.
- **Latent bug**: `playSound("notify")` references `this.notify`, which is never created.
- **Unhandled promise rejections**: `Audio.play()` is not awaited or caught (autoplay restrictions). All three audio files are created eagerly at start-up.
- **`/*jshint esversion: 6 */` is outdated**: the code uses object spread (ES2018), `async/await` (ES2017) and ES modules. Update the config and re-run JSHint; the README screenshot is likely stale.
- **Font Awesome is loaded twice**, as v4.7 CSS and v5.0.6 JS from two different CDNs, and the menu mixes `fa` and `far` classes. Neither include has SRI. Pick one version, preferably self-hosted.
- **Manual cache-busting**: version `0.22` is hard-coded in five places in `index.html` (two CSS, two JS, and the `#app-version` text).
- **Leftover template metadata** in `index.html`: `author` / `copyright` mention "247games LLC", and `X-UA-Compatible` (IE) is obsolete. Confirm they are intended.
- **Naming and typos**: `plyerScore`, `get_piece`, `checkpossibleMove` (mixed styles); the original README had `rel="nofolow"` and "Lighhouse".
- **Screenshots** in `assets/images` show the old menu layout (single menu with Start/Options/Rules/Results). Retake them.
- **Dependence on `package.json`**: the tests and the `type: "module"` setting are not verified in this review. Make sure they are committed and that CI (e.g. a GitHub Action) runs `npm test`.

## Features Left to Implement

- Implement a better AI for the computer (look-ahead search such as minimax with alpha-beta, plus a proper evaluation).
- Draw detection and a draw counter in Results.
- Local two-player mode (the menu button is already in place but disabled). `GameState` was designed to be serializable, which also prepares for an online mode.
- A timer to limit the time of each player.
- A smoother animation for the pieces moving.
- Persist player colour and the highlight option.
- Option to undo a move or review the move history.

## Deployment

- The game is deployed on GitHub Pages directly from the repository. Pages is a static host and no build step is required. Because the entry script is an ES module, the game must be served over HTTP(S) (not opened via `file://`).

## Credits

- Stack Overflow
- Guido, my mentor
- w3Schools
- This channel that teaches checkers: https://www.youtube.com/watch?v=WD3NTNQElew
- developer.mozilla.org (where I spent most of my time)

## Acknowledgements

- My mentor for saving me from starting in a wrong way, which would have made the project impossible to finish.
- My colleagues on the Slack channel.
- The tutors for their help.
- My last hackathon team, which tested the game and gave great feedback.
