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

test("International kings move and capture at a distance on a 10x10 board", () => {
  const squares = Array(100).fill(null);
  squares[22] = { color: "white", king: true };
  squares[33] = { color: "black", king: false };
  const state = stateWith(squares, { ruleset: "international" });
  const engine = new RulesEngine("international");

  assert.deepEqual(engine.getSimpleMoves(state, 22).sort((a, b) => a - b), [
    0, 4, 11, 13, 31, 40
  ]);
  assert.ok(engine.getCaptureOptions(state, 22).some(
    (option) => option.to === 44 && option.captures[0] === 33
  ));
});

test("International rules require the longest capture sequence", () => {
  const squares = Array(100).fill(null);
  squares[11] = { color: "white", king: false };
  squares[22] = { color: "black", king: false };
  squares[44] = { color: "black", king: false };
  squares[71] = { color: "white", king: false };
  squares[82] = { color: "black", king: false };
  const state = stateWith(squares, { ruleset: "international" });
  const engine = new RulesEngine("international");

  const mandatory = engine.getMandatoryCaptures(state, "white");
  assert.deepEqual(mandatory.get(11), [{ to: 33, captures: [22] }]);
  assert.equal(mandatory.has(71), false);
});

test("International multi-captures are played one jump at a time", () => {
  const squares = Array(100).fill(null);
  squares[11] = { color: "white", king: false };
  squares[22] = { color: "black", king: false };
  squares[44] = { color: "black", king: false };
  squares[71] = { color: "white", king: false };
  const state = stateWith(squares, { ruleset: "international" });
  const engine = new RulesEngine("international");

  assert.deepEqual(engine.getCaptureOptions(state, 11), [
    { to: 33, captures: [22] }
  ]);
  assert.equal(engine.validateMove(state, { from: 11, to: 55 }).valid, false);

  const firstMove = engine.validateMove(state, { from: 11, to: 33 });
  assert.deepEqual(firstMove.captures, [22]);
  const firstStep = GameState.fromJSON(
    state.applyMove({
      from: 11,
      to: 33,
      captures: firstMove.captures,
      keepTurn: true
    })
  );
  assert.equal(firstStep.squares[22].color, "black");
  assert.deepEqual(firstStep.pendingCaptures, [22]);
  assert.equal(firstStep.continuationSquare, 33);
  assert.equal(engine.validateMove(firstStep, { from: 71, to: 60 }).valid, false);
  assert.deepEqual(engine.getCaptureOptions(firstStep, 33), [
    { to: 55, captures: [44] }
  ]);
  assert.equal(engine.getLegalMoves(firstStep, 71).length, 0);

  const secondMove = engine.validateMove(firstStep, { from: 33, to: 55 });
  assert.deepEqual(secondMove.captures, [44]);
  firstStep.applyMove({
    from: 33,
    to: 55,
    captures: secondMove.captures,
    keepTurn: false
  });
  assert.equal(firstStep.squares[22], null);
  assert.equal(firstStep.squares[44], null);
  assert.equal(firstStep.turn, "black");
  assert.deepEqual(firstStep.pendingCaptures, []);
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

test("British multi-captures require successive jumps with the same piece", () => {
  const squares = emptySquares();
  squares[36] = { color: "white", king: false };
  squares[27] = { color: "black", king: false };
  squares[9] = { color: "black", king: false };
  const state = stateWith(squares);
  const engine = new RulesEngine("british");

  assert.equal(engine.validateMove(state, { from: 36, to: 0 }).valid, false);
  const firstMove = engine.validateMove(state, { from: 36, to: 18 });
  assert.deepEqual(firstMove.captures, [27]);
  const continued = GameState.fromJSON(state.applyMove({
    from: 36,
    to: 18,
    captures: firstMove.captures,
    keepTurn: true
  }));

  assert.deepEqual(engine.getCaptureOptions(continued, 18), [
    { to: 0, captures: [9] }
  ]);
  assert.equal(engine.validateMove(continued, { from: 18, to: 0 }).valid, true);
  continued.applyMove({
    from: 18,
    to: 0,
    captures: [9],
    keepTurn: false
  });
  assert.equal(continued.squares[9], null);
  assert.equal(continued.squares[0].king, true);
  assert.equal(continued.turn, "black");
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

test("hasLegalMoves scans the full International board", () => {
  const squares = Array(100).fill(null);
  squares[80] = { color: "white", king: false };
  const state = stateWith(squares, {
    turn: "white",
    ruleset: "international"
  });
  const engine = new RulesEngine("international");

  assert.equal(engine.hasLegalMoves(state, "white"), true);
});
