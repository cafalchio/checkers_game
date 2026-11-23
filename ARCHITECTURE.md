# Architecture

A technical walkthrough of how the Checkers game is built. For the player-facing description, see [README.md](README.md).

## Overview

The game is a static, dependency-free web app: plain HTML, CSS and vanilla JavaScript (ES6 classes). There is no build step and no backend. After clicking Start Game, the player chooses white (bottom) or black (top); the computer plays the other color.

```
.
├── index.html              # Page shell: containers + script/style includes
├── assets/
│   ├── css/style.css       # Board, pieces, menus, switches, captured-piece trays
│   ├── js/script.js        # DOM controller and computer opponent
│   ├── js/core/
│   │   ├── game-state.js   # Serializable, DOM-independent position model
│   │   ├── rules-engine.js # Pure move and capture validation
│   │   └── rulesets.js     # Board and variant rule configuration
│   ├── audio/              # move.mp3, capture.mp3, menu.mp3
│   └── images/             # Wood textures, piece sprites, README screenshots
├── LICENSE                 # MIT
└── README.md
```

External resources: Font Awesome (CDN) for the cog, close and back icons.

## Page structure (`index.html`)

```
#center
├── #removedb   tray of white pieces captured by black
├── #game       8x8 grid (squares, pieces and menu are all injected here by JS)
├── #removedw   tray of black pieces captured by white
└── #messages   status text ("White's turn")
```

`script.js` is loaded at the end of `<body>`, so the DOM exists when it runs.

## Classes in `assets/js/script.js`

### `Board`
Owns the game state and rules. A single global instance, `board`, is created at the bottom of the file and referenced directly by event handlers and timeouts.

| State | Purpose |
|---|---|
| `gameState` | Authoritative 64-square position, turn, ruleset and revision |
| `pieceElements`, `piecePositions` | DOM projection: maps model squares to rendered piece elements |
| `playerColor`, `computerColor` | The selected human side and the opposite computer side |
| `needTake` | Pieces that currently have a mandatory capture |
| `takeIt` | Capture descriptors: `[piece, enemySquareId, landingSquareId]` |
| `pieceTaking` | Piece locked to the current multi-capture sequence |
| `optionSound`, `optionHighlight` | Settings toggled from the Options menu |
| `menuIsOpen`, `isPlaying` | UI state |
| `turn` | Turn counter (incremented in `gameControl`, otherwise unused) |

Key methods:

| Method | Responsibility |
|---|---|
| `constructor` | Builds the 64 squares, initialises `localStorage` scores |
| `startGame` | Creates pieces, installs `movestart` guard, starts first turn |
| `gameControl` | Turn dispatcher. Freezes/unfreezes rendered pieces, schedules `checkWinner`, and schedules `computerMove` when it is the computer's turn |
| `createPieces` | Creates the starting `GameState` and renders its pieces |
| `pieceClick` | Selects a movable piece and highlights its target squares |
| `movePiece` | Submits a human move; state application renders the move and handles captures |
| `computerMove` | Computer's turn: capture if forced, otherwise make a move |
| `takePiece` / `moveComputerPiece` | The computer's capture and plain-move implementations |
| `checkpossibleMove` | Adapts the rules engine's legal moves to the rendered piece UI |
| `checkIfcanTake` | Applies the forced-capture rule to a group of pieces |
| `checkWinner` | Uses `GameState` and the rules engine to detect no pieces or legal moves |
| `updateScore` | Increments the winner's counter in `localStorage` |
| `playSound`, `updatePieceElement` | Helpers |

### `Piece`
Thin wrapper that creates a `<div class="piece piece-{color}">`. `get_piece(id)` assigns the element id and returns it. Color and king classes are rendered from `GameState`; `element.movable` remains UI-only state.

### `Menu`
Builds and swaps the in-board menu panel: main menu, color choice, Options, Rules and Results sub-screens, plus the small cog button shown when the menu is hidden. The menu cannot be hidden until a game starts; during a game, clicking outside it closes it. Menu HTML is generated via `innerHTML` template strings and listeners are attached after each render.

## Data model

`GameState` is the source of truth. It stores 64 or 100 `null` or `{ color, king }` entries, the current turn, ruleset, revision, pending captured squares and the square that must continue a capture. `RulesEngine` validates each jump while enforcing mandatory and longest capture sequences. The DOM renders accepted state changes and supplies user input; it is not scanned to reconstruct the board.

- Squares are `div.square` with ids `0`–`63` (British) or `0`–`99` (International), in row-major order (`id = row * boardSize + col`), alternating `.white` / `.black`. Only `.black` squares are playable; `.white` has `pointer-events: none`.
- Square 0 is light, so dark squares are those where `row + col` is odd.
- Each square has an optional rendered piece. `pieceElements` and `piecePositions` map this view to the corresponding model square.
- Piece ids remain stable after movement and are only DOM identifiers. Rules, turn ownership, promotion, captures and winner detection use `GameState`.
- The `occupied`, `movable`, color and king classes are renderer/UI details, not game-state inputs.

### Movement geometry
With `id = row * 8 + col`:

| Direction | Offset |
|---|---|
| Up-left / up-right | `-9` / `-7` |
| Down-left / down-right | `+7` / `+9` |

White men move up, black men move down, and kings move in all four directions. `RulesEngine` uses row and column bounds to prevent wrap-around.

## Turn flow

```
startGame()
   └─ gameControl()
        ├─ Player's turn
        │    ├─ freeze computer pieces; schedule model-based checkWinner
        │    ├─ checkIfcanTake(player) → only capturing pieces are movable (+ highlight)
        │    └─ otherwise all player pieces are movable
        │         user clicks piece → pieceClick → target squares get .possible
        │         user clicks square → movePiece
        │              ├─ validate and apply command to GameState
        │              ├─ render the accepted position and capture tray
        │                      └─ keep the turn and lock the capturing piece until its sequence ends, otherwise switch
        └─ Computer's turn
             ├─ freeze player pieces; schedule model-based checkWinner
             └─ setTimeout(computerMove, 1.2–3.2 s)
                  ├─ forced capture → takePiece(), then visibly schedule each continuation jump
                  └─ otherwise choose a legal move with model-based scoring
                       └─ submit AI command through the same GameState path
```

White always moves first, so choosing black gives the computer the opening move.

### How `checkpossibleMove` works
It resolves the rendered piece to its model square, asks `RulesEngine` for capture options or legal moves, then adapts those results to the UI's `.possible` markers and computer capture descriptors. Board occupancy and move geometry are read from `GameState`, not the DOM.

## Persistence

Only the win counters, in `localStorage`:

| Key | Meaning |
|---|---|
| `whiteScore` | Games won by the player |
| `blackScore` | Games won by the computer |

Settings (sound, highlight) and the game state are not persisted. A finished or reset game calls `location.reload()`.

## Rules implemented

- 8x8 board, 12 pieces per side, dark squares only
- Men move one square diagonally forward
- Captures are mandatory, including multi-jumps
- Kings move diagonally in all directions; the selected ruleset controls whether they can fly across empty squares
- Win by capturing everything or leaving the opponent without moves

International captures require a longest sequence and are presented one jump at a time; captured pieces remain as blockers until the sequence finishes. Draw detection is not implemented (the in-game Rules text mentions a 30-move rule). The computer uses a shallow move-scoring heuristic at higher difficulties and random choices at Easy; it does not search future turns.

## Styling notes

- Sizes are driven by `vmin` units with `max()` floors so the board scales on small phones.
- Menu panels are absolutely positioned inside `#game`.
- Pieces and squares use PNG textures from `assets/images/`; captured pieces use the `.piece-out-*` classes.
