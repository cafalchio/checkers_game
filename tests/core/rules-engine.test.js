import test from "node:test";
import assert from "node:assert/strict";

import { GameState } from "../../assets/js/core/game-state.js";
import { RulesEngine } from "../../assets/js/core/rules-engine.js";

function stateWith(squares, options = {}) {
  return new GameState({
    squares,
    turn: options.turn || "white",
    ruleset: options.ruleset || "british",
    revision: options.revision || 0
  });
}

function emptySquares() {
  return Array(64).fill(null);
}

test("British men move one square forward and cannot move backward", () => {
  const squares = emptySquares();
  squares[17] = { color: "white", king: false };
  const state = stateWith(squares);
  const engine = new RulesEngine("british");

  assert.deepEqual(engine.getSimpleMoves(state, 17).sort((a, b) => a - b), [8, 10]);
  assert.equal(engine.validateMove(state, { from: 17, to: 26 }).valid, false);
});

test("British kings move and capture one square diagonally", () => {
  const squares = emptySquares();
  squares[18] = { color: "white", king: true };
  squares[27] = { color: "black", king: false };
  const state = stateWith(squares);
  const engine = new RulesEngine("british");

  assert.deepEqual(engine.getCaptureOptions(state, 18), [
    { to: 36, captures: [27] }
  ]);
  assert.equal(engine.validateMove(state, { from: 18, to: 36 }).valid, true);
});

test("Flying kings can capture at a distance", () => {
  const squares = emptySquares();
  squares[18] = { color: "white", king: true };
  squares[27] = { color: "black", king: false };
  const state = stateWith(squares, { ruleset: "flying" });
  const engine = new RulesEngine("flying");

  const captures = engine.getCaptureOptions(state, 18);
  assert.ok(captures.some((option) => option.to === 36 && option.captures[0] === 27));
  assert.ok(captures.some((option) => option.to === 45));
  assert.ok(captures.some((option) => option.to === 54));
});

test("A mandatory capture blocks ordinary moves", () => {
  const squares = emptySquares();
  squares[26] = { color: "white", king: false };
  squares[17] = { color: "black", king: false };
  squares[10] = { color: "white", king: false };
  const state = stateWith(squares);
  const engine = new RulesEngine("british");

  assert.equal(engine.validateMove(state, { from: 10, to: 1 }).valid, false);
  assert.equal(engine.validateMove(state, { from: 26, to: 8 }).valid, true);
  assert.equal(engine.getMandatoryCaptures(state, "white").has(26), true);
});

test("A continued capture keeps the same turn available", () => {
  const squares = emptySquares();
  squares[17] = { color: "white", king: false };
  squares[26] = { color: "black", king: false };
  const state = stateWith(squares);
  const engine = new RulesEngine("british");

  const first = state.applyMove({
    from: 17,
    to: 35,
    captures: [26],
    keepTurn: true,
    revision: 0
  });
  const continued = stateWith(
    GameState.fromJSON(first).squares,
    { turn: "white", ruleset: "british", revision: first.revision }
  );

  assert.equal(engine.validateMove(continued, { from: 35, to: 44 }).valid, false);
  assert.equal(continued.turn, "white");
});

test("hasLegalMoves checks only the requested color", () => {
  const squares = emptySquares();
  squares[1] = { color: "black", king: false };
  const engine = new RulesEngine("british");

  const blocked = stateWith(squares, { turn: "white" });
  assert.equal(engine.hasLegalMoves(blocked, "white"), false);

  squares[40] = { color: "white", king: false };
  const playable = stateWith(squares, { turn: "white" });
  assert.equal(engine.hasLegalMoves(playable, "white"), true);
});
