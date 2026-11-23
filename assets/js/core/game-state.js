import { getBoardSize, getSquareCount, RULESETS } from "./rulesets.js";

function assertSquare(square) {
  if (!Number.isInteger(square) || square < 0) {
    throw new RangeError(`Invalid board square: ${square}`);
  }
}

function copyPiece(piece) {
  return piece ? { color: piece.color, king: Boolean(piece.king) } : null;
}

/**
 * Serializable, DOM-independent checkers position state.
 *
 * This is the state boundary for a future server/peer transport: it contains
 * only plain data and never reads or mutates the board UI. Move legality remains
 * the responsibility of the rules engine; applyMove validates state integrity
 * and turn ownership before applying a move already accepted by that engine.
 */
export class GameState {
  constructor({
    squares,
    turn = "white",
    ruleset = "british",
    revision = 0,
    pendingCaptures = [],
    continuationSquare = null
  }) {
    if (!RULESETS[ruleset]) {
      throw new RangeError(`Invalid ruleset: ${ruleset}`);
    }
    const boardSize = getBoardSize(ruleset);
    const squareCount = getSquareCount(ruleset);
    if (!Array.isArray(squares) || squares.length !== squareCount) {
      throw new TypeError(`Expected ${squareCount} board squares`);
    }
    if (turn !== "white" && turn !== "black") {
      throw new RangeError(`Invalid player turn: ${turn}`);
    }
    if (!Number.isSafeInteger(revision) || revision < 0) {
      throw new RangeError(`Invalid state revision: ${revision}`);
    }
    if (!Array.isArray(pendingCaptures)) {
      throw new TypeError("pendingCaptures must be an array of square indexes");
    }
    if (
      new Set(pendingCaptures).size !== pendingCaptures.length ||
      pendingCaptures.some(
        (square) => !Number.isInteger(square) || square < 0 || square >= squareCount
      )
    ) {
      throw new RangeError("Invalid pending capture squares");
    }
    if (
      continuationSquare != null &&
      (!Number.isInteger(continuationSquare) ||
        continuationSquare < 0 ||
        continuationSquare >= squareCount)
    ) {
      throw new RangeError(`Invalid board square: ${continuationSquare}`);
    }

    this.squares = squares.map((piece) => {
      if (piece == null) return null;
      if (
        (piece.color !== "white" && piece.color !== "black") ||
        (piece.king != null && typeof piece.king !== "boolean")
      ) {
        throw new TypeError("Invalid piece in board position");
      }
      return copyPiece(piece);
    });
    if (
      pendingCaptures.some(
        (square) =>
          !this.squares[square] ||
          square === continuationSquare ||
          this.squares[square].color === turn
      ) ||
      (pendingCaptures.length > 0 && continuationSquare == null) ||
      (pendingCaptures.length > 0 && !RULESETS[ruleset].deferCapturedPieces) ||
      (continuationSquare != null &&
        (!this.squares[continuationSquare] ||
          this.squares[continuationSquare].color !== turn))
    ) {
      throw new TypeError("Invalid capture continuation state");
    }
    this.turn = turn;
    this.ruleset = ruleset;
    this.revision = revision;
    this.pendingCaptures = pendingCaptures.slice();
    this.continuationSquare = continuationSquare;
  }

  static fromJSON(snapshot) {
    return new GameState(snapshot);
  }

  toJSON() {
    return {
      squares: this.squares.map(copyPiece),
      turn: this.turn,
      ruleset: this.ruleset,
      revision: this.revision,
      pendingCaptures: this.pendingCaptures.slice(),
      continuationSquare: this.continuationSquare
    };
  }

  /**
   * Apply a move approved by the rules engine.
   * The command shape is transport-safe JSON:
   * { from, to, captures?: number[], keepTurn?: boolean, revision? }
   */
  applyMove({ from, to, captures = [], keepTurn = false, revision }) {
    const boardSize = getBoardSize(this.ruleset);
    const squareCount = getSquareCount(this.ruleset);
    if (!Number.isInteger(from) || from < 0 || from >= squareCount) {
      throw new RangeError(`Invalid board square: ${from}`);
    }
    if (!Number.isInteger(to) || to < 0 || to >= squareCount) {
      throw new RangeError(`Invalid board square: ${to}`);
    }
    if (!Array.isArray(captures)) {
      throw new TypeError("captures must be an array of square indexes");
    }
    captures.forEach(assertSquare);
    if (captures.some((square) => square >= squareCount)) {
      throw new RangeError("Invalid capture square");
    }
    if (revision != null && revision !== this.revision) {
      throw new Error("Move is based on a stale game state");
    }

    const piece = this.squares[from];
    if (!piece) throw new Error("The source square is empty");
    if (piece.color !== this.turn) throw new Error("It is not this piece's turn");
    if (this.squares[to]) throw new Error("The destination square is occupied");
    if (captures.includes(from) || captures.includes(to) || new Set(captures).size !== captures.length) {
      throw new Error("Invalid capture squares");
    }
    captures.forEach((square) => {
      const capturedPiece = this.squares[square];
      if (
        !capturedPiece ||
        capturedPiece.color === piece.color ||
        this.pendingCaptures.includes(square)
      ) {
        throw new Error("Capture square must contain an opposing piece");
      }
    });
    if (
      this.continuationSquare != null &&
      (from !== this.continuationSquare || captures.length === 0)
    ) {
      throw new Error("A capture continuation is mandatory");
    }

    this.squares[from] = null;
    this.squares[to] = piece;
    if (
      RULESETS[this.ruleset].deferCapturedPieces &&
      keepTurn &&
      captures.length > 0
    ) {
      this.pendingCaptures.push(...captures);
    } else {
      const capturedSquares = RULESETS[this.ruleset].deferCapturedPieces
        ? [...this.pendingCaptures, ...captures]
        : captures;
      capturedSquares.forEach((square) => {
        this.squares[square] = null;
      });
      this.pendingCaptures = [];
    }

    const row = Math.floor(to / boardSize);
    if (
      !piece.king &&
      ((piece.color === "white" && row === 0) ||
        (piece.color === "black" && row === boardSize - 1))
    ) {
      piece.king = true;
    }

    this.continuationSquare =
      keepTurn && captures.length > 0 ? to : null;
    if (!keepTurn) this.turn = piece.color === "white" ? "black" : "white";
    this.revision += 1;
    return this.toJSON();
  }
}
