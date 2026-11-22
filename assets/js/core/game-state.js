const BOARD_SIZE = 8;
const SQUARE_COUNT = BOARD_SIZE * BOARD_SIZE;

function assertSquare(square) {
  if (!Number.isInteger(square) || square < 0 || square >= SQUARE_COUNT) {
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
  constructor({ squares, turn = "white", ruleset = "flying", revision = 0 }) {
    if (!Array.isArray(squares) || squares.length !== SQUARE_COUNT) {
      throw new TypeError(`Expected ${SQUARE_COUNT} board squares`);
    }
    if (turn !== "white" && turn !== "black") {
      throw new RangeError(`Invalid player turn: ${turn}`);
    }
    if (ruleset !== "flying" && ruleset !== "british") {
      throw new RangeError(`Invalid ruleset: ${ruleset}`);
    }
    if (!Number.isSafeInteger(revision) || revision < 0) {
      throw new RangeError(`Invalid state revision: ${revision}`);
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
    this.turn = turn;
    this.ruleset = ruleset;
    this.revision = revision;
  }

  static fromJSON(snapshot) {
    return new GameState(snapshot);
  }

  toJSON() {
    return {
      squares: this.squares.map(copyPiece),
      turn: this.turn,
      ruleset: this.ruleset,
      revision: this.revision
    };
  }

  /**
   * Apply a move approved by the rules engine.
   * The command shape is transport-safe JSON:
   * { from, to, captures?: number[], keepTurn?: boolean, revision? }
   */
  applyMove({ from, to, captures = [], keepTurn = false, revision }) {
    assertSquare(from);
    assertSquare(to);
    if (!Array.isArray(captures)) {
      throw new TypeError("captures must be an array of square indexes");
    }
    captures.forEach(assertSquare);
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
      if (!capturedPiece || capturedPiece.color === piece.color) {
        throw new Error("Capture square must contain an opposing piece");
      }
    });

    this.squares[from] = null;
    this.squares[to] = piece;
    captures.forEach((square) => {
      this.squares[square] = null;
    });

    const row = Math.floor(to / BOARD_SIZE);
    if (
      !piece.king &&
      ((piece.color === "white" && row === 0) ||
        (piece.color === "black" && row === BOARD_SIZE - 1))
    ) {
      piece.king = true;
    }

    if (!keepTurn) this.turn = piece.color === "white" ? "black" : "white";
    this.revision += 1;
    return this.toJSON();
  }
}
