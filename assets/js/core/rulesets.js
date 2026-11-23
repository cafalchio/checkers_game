export const RULESETS = Object.freeze({
  british: Object.freeze({
    boardSize: 8,
    menCaptureBackward: false,
    flyingKings: false,
    longestCaptureMandatory: false,
    deferCapturedPieces: false
  }),
  international: Object.freeze({
    boardSize: 10,
    menCaptureBackward: true,
    flyingKings: true,
    longestCaptureMandatory: true,
    deferCapturedPieces: true
  })
});

export function getBoardSize(ruleset = "international") {
  if (!RULESETS[ruleset]) throw new RangeError(`Unsupported ruleset: ${ruleset}`);
  return RULESETS[ruleset].boardSize;
}

export function getSquareCount(ruleset = "international") {
  return getBoardSize(ruleset) ** 2;
}
