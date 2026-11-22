import test from "node:test";
import assert from "node:assert/strict";

import { GameState } from "../../assets/js/core/game-state.js";

function emptySquares() {
  return Array(64).fill(null);
}

test("GameState validates its snapshot shape", () => {
  assert.throws(
    () => new GameState({ squares: Array(63).fill(null) }),
    /Expected 64 board squares/
  );
  assert.throws(
    () => new GameState({ squares: emptySquares(), turn: "red" }),
    /Invalid player turn/
  );
});

test("GameState serializes independent piece copies", () => {
  const squares = emptySquares();
  squares[40] = { color: "white", king: false };

  const state = new GameState({ squares, revision: 3 });
  const snapshot = state.toJSON();

  snapshot.squares[40].king = true;
  assert.equal(state.squares[40].king, false);
  assert.equal(state.revision, 3);
});

test("applyMove updates pieces, captures, promotion, turn, and revision", () => {
  const squares = emptySquares();
  squares[17] = { color: "white", king: false };
  squares[26] = { color: "black", king: false };
  const state = new GameState({ squares, turn: "white", revision: 4 });

  const snapshot = state.applyMove({
    from: 17,
    to: 35,
    captures: [26],
    keepTurn: false,
    revision: 4
  });

  assert.equal(snapshot.squares[17], null);
  assert.equal(snapshot.squares[26], null);
  assert.deepEqual(snapshot.squares[35], { color: "white", king: false });
  assert.equal(snapshot.turn, "black");
  assert.equal(snapshot.revision, 5);
});

test("applyMove promotes a man and rejects a stale or invalid command", () => {
  const squares = emptySquares();
  squares[9] = { color: "white", king: false };
  const state = new GameState({ squares, turn: "white", revision: 2 });

  const snapshot = state.applyMove({
    from: 9,
    to: 0,
    captures: [],
    revision: 2
  });
  assert.deepEqual(snapshot.squares[0], { color: "white", king: true });

  assert.throws(
    () => state.applyMove({ from: 0, to: 9, revision: 1 }),
    /stale/
  );
  assert.throws(
    () => state.applyMove({ from: 9, to: 18, revision: 3 }),
    /empty/
  );
});
