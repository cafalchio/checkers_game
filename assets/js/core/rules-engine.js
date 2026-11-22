import { GameState } from "./game-state.js";

export const BOARD_SIZE = 8;
export const SQUARE_COUNT = BOARD_SIZE * BOARD_SIZE;

function inBounds(row, column) {
  return row >= 0 && row < BOARD_SIZE && column >= 0 && column < BOARD_SIZE;
}

function squareAt(row, column) {
  return inBounds(row, column) ? row * BOARD_SIZE + column : -1;
}

export class RulesEngine {
  constructor(ruleset = "flying") {
    if (ruleset !== "flying" && ruleset !== "british") {
      throw new RangeError(`Unsupported ruleset: ${ruleset}`);
    }
    this.ruleset = ruleset;
  }

  getCaptureOptions(state, from) {
    if (!(state instanceof GameState) && (!state || !Array.isArray(state.squares))) {
      throw new TypeError("A GameState snapshot is required");
    }

    const piece = state.squares[from];
    if (!piece) return [];

    const row = Math.floor(from / BOARD_SIZE);
    const column = from % BOARD_SIZE;
    const directions = piece.king
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.color === "white"
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];

    const options = [];
    directions.forEach(([rowStep, columnStep]) => {
      if (piece.king && this.ruleset === "flying") {
        let enemy = null;
        let nextRow = row + rowStep;
        let nextColumn = column + columnStep;
        while (inBounds(nextRow, nextColumn)) {
          const square = squareAt(nextRow, nextColumn);
          const occupant = state.squares[square];
          if (enemy === null) {
            if (occupant) {
              if (occupant.color !== piece.color) enemy = square;
              else break;
            }
          } else {
            if (occupant) break;
            options.push({ to: square, captures: [enemy] });
          }
          nextRow += rowStep;
          nextColumn += columnStep;
        }
        return;
      }

      const enemyRow = row + rowStep;
      const enemyColumn = column + columnStep;
      const landingRow = row + rowStep * 2;
      const landingColumn = column + columnStep * 2;
      if (!inBounds(landingRow, landingColumn)) return;
      const enemy = squareAt(enemyRow, enemyColumn);
      const landing = squareAt(landingRow, landingColumn);
      const enemyPiece = state.squares[enemy];
      if (
        enemyPiece &&
        enemyPiece.color !== piece.color &&
        state.squares[landing] === null
      ) {
        options.push({ to: landing, captures: [enemy] });
      }
    });
    return options;
  }

  getSimpleMoves(state, from) {
    const piece = state.squares[from];
    if (!piece) return [];
    const row = Math.floor(from / BOARD_SIZE);
    const column = from % BOARD_SIZE;
    const directions = piece.king
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.color === "white"
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];

    const moves = [];
    if (piece.king && this.ruleset === "flying") {
      directions.forEach(([rowStep, columnStep]) => {
        let nextRow = row + rowStep;
        let nextColumn = column + columnStep;
        while (inBounds(nextRow, nextColumn)) {
          const square = squareAt(nextRow, nextColumn);
          if (state.squares[square]) break;
          moves.push(square);
          nextRow += rowStep;
          nextColumn += columnStep;
        }
      });
    } else {
      directions.forEach(([rowStep, columnStep]) => {
        const nextRow = row + rowStep;
        const nextColumn = column + columnStep;
        if (!inBounds(nextRow, nextColumn)) return;
        const square = squareAt(nextRow, nextColumn);
        if (state.squares[square] === null) moves.push(square);
      });
    }
    return moves;
  }

  getMandatoryCaptures(state, color) {
    const captures = new Map();
    for (let from = 0; from < SQUARE_COUNT; from++) {
      const piece = state.squares[from];
      if (piece && piece.color === color) {
        const options = this.getCaptureOptions(state, from);
        if (options.length > 0) captures.set(from, options);
      }
    }
    return captures;
  }

  getLegalMoves(state, from) {
    if (!state || !Array.isArray(state.squares)) {
      throw new TypeError("A GameState snapshot is required");
    }
    const piece = state.squares[from];
    if (!piece) return [];

    const captures = this.getCaptureOptions(state, from);
    if (captures.length > 0) return captures.map((option) => option.to);

    const mandatory = this.getMandatoryCaptures(state, piece.color);
    if (mandatory.size > 0) return [];
    return this.getSimpleMoves(state, from);
  }

  getCaptureMoves(state, from) {
    return this.getCaptureOptions(state, from).map((option) => option.to);
  }

  validateMove(state, command) {
    if (!command || !Number.isInteger(command.from) || !Number.isInteger(command.to)) {
      return { valid: false, error: "Move must contain integer from and to squares" };
    }
    const piece = state.squares[command.from];
    if (!piece) return { valid: false, error: "The source square is empty" };
    if (piece.color !== state.turn) return { valid: false, error: "It is not this piece's turn" };
    if (state.squares[command.to]) return { valid: false, error: "The destination square is occupied" };

    const mandatory = this.getMandatoryCaptures(state, piece.color);
    const options = this.getCaptureOptions(state, command.from);
    if (mandatory.size > 0) {
      if (!mandatory.has(command.from)) {
        return { valid: false, error: "A capture is mandatory" };
      }
      const match = options.find((option) => option.to === command.to);
      if (!match) return { valid: false, error: "The capture is illegal" };
      return { valid: true, captures: match.captures, capture: true };
    }

    if (options.length > 0) {
      const match = options.find((option) => option.to === command.to);
      if (match) return { valid: true, captures: match.captures, capture: true };
    }
    if (!this.getSimpleMoves(state, command.from).includes(command.to)) {
      return { valid: false, error: "The move is illegal" };
    }
    return { valid: true, captures: [], capture: false };
  }

  hasLegalMoves(state, color) {
    for (let from = 0; from < SQUARE_COUNT; from++) {
      const piece = state.squares[from];
      if (!piece || piece.color !== color) continue;
      if (this.getLegalMoves(state, from).length > 0) return true;
    }
    return false;
  }
}

export class CheckersRules extends RulesEngine {}

export function getLegalMoves(state, from, ruleset = "flying") {
  return new RulesEngine(ruleset).getLegalMoves(state, from);
}

export function validateMove(state, command, ruleset = "flying") {
  return new RulesEngine(ruleset).validateMove(state, command);
}
