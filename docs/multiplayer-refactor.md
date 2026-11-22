# Game architecture and multiplayer preparation

The browser game uses `assets/js/script.js` as its controller for input, rendering, computer opponent, and menu. `assets/js/core/game-state.js` is the authoritative position model, and `assets/js/core/rules-engine.js` generates and validates moves without reading the DOM. The last-move indication listens to accepted move commands in `assets/js/last-move.js` and is styled in `assets/css/last-move.css`.

The controller maps rendered piece elements to model squares for interaction, but does not rebuild game state from the DOM. Human and computer moves are validated against `GameState`, applied there, and then rendered. Computer move scoring simulates snapshots rather than temporarily moving DOM elements. A future server or peer transport can exchange the JSON snapshots and move commands without depending on DOM elements.

## State and command contract

A snapshot contains 64 entries in `squares`, where each entry is `null` or `{ color: "white" | "black", king: boolean }`, plus `turn`, `ruleset`, and a monotonically increasing `revision`.

An accepted move command contains `{ from, to, captures, keepTurn, revision }`. `revision` lets a multiplayer host reject stale commands; `keepTurn` supports continued captures. `GameState.applyMove` checks structure, turn ownership, occupancy, captures, and promotion. It does **not** check move geometry or mandatory-capture rules. Those must be enforced by the rules engine before a command is applied; this model alone is not a security boundary for a networked game.

## Remaining multiplayer preparation

1. Add a transport adapter (WebSocket or WebRTC) that sends commands with the current revision and applies authoritative snapshots.
2. Add protocol and synchronization tests before enabling remote play.
