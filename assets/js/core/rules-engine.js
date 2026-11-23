const APP_VERSION = globalThis.APP_VERSION || "0.23";
const { GameState } =
  await import(`./game-state.js?v=${encodeURIComponent(APP_VERSION)}`);
const { getBoardSize, getSquareCount, RULESETS } =
  await import(`./rulesets.js?v=${encodeURIComponent(APP_VERSION)}`);

export { getBoardSize, getSquareCount, RULESETS };

export class RulesEngine {
  constructor(ruleset = "international") {
    if (!RULESETS[ruleset]) throw new RangeError(`Unsupported ruleset: ${ruleset}`);
    this.ruleset = ruleset;
    this.config = RULESETS[ruleset];
    this.boardSize = this.config.boardSize;
    this.squareCount = this.boardSize * this.boardSize;
  }

  getCapturePaths(state, from) {
    if (!(state instanceof GameState) && (!state || !Array.isArray(state.squares))) {
      throw new TypeError("A GameState snapshot is required");
    }

    const piece = state.squares[from];
    if (!piece) return [];

    const size = this.boardSize;
    const inBoard = (row, column) => row >= 0 && row < size && column >= 0 && column < size;
    const at = (row, column) => row * size + column;
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    const occupancy = state.squares.map((item) => item ? { ...item } : null);
    const paths = [];

    const search = (current, isKing, captured, steps) => {
      let foundCapture = false;
      if (isKing && this.config.flyingKings) {
        const currentRow = Math.floor(current / size);
        const currentColumn = current % size;
        directions.forEach(([rowStep, columnStep]) => {
          let enemy = null;
          let nextRow = currentRow + rowStep;
          let nextColumn = currentColumn + columnStep;
          while (inBoard(nextRow, nextColumn)) {
            const square = at(nextRow, nextColumn);
            const occupant = occupancy[square];
            if (enemy === null) {
              if (occupant) {
                if (
                  occupant.color !== piece.color &&
                  !captured.includes(square) &&
                  !(state.pendingCaptures || []).includes(square)
                ) {
                  enemy = square;
                }
                else break;
              }
            } else {
              if (occupant) break;
              const nextOccupancy = occupancy.map((item) => item ? { ...item } : null);
              nextOccupancy[current] = null;
              if (!this.config.deferCapturedPieces) nextOccupancy[enemy] = null;
              nextOccupancy[square] = { color: piece.color, king: true };
              const original = occupancy.map((item) => item ? { ...item } : null);
              for (let i = 0; i < occupancy.length; i++) occupancy[i] = nextOccupancy[i];
              foundCapture = true;
              search(
                square,
                true,
                [...captured, enemy],
                [...steps, { to: square, capture: enemy }]
              );
              for (let i = 0; i < occupancy.length; i++) occupancy[i] = original[i];
            }
            nextRow += rowStep;
            nextColumn += columnStep;
          }
        });
      } else {
        const currentRow = Math.floor(current / size);
        const currentColumn = current % size;
        const manDirections = isKing
          ? directions
          : piece.color === "white"
            ? this.config.menCaptureBackward ? directions : [[-1, -1], [-1, 1]]
            : this.config.menCaptureBackward ? directions : [[1, -1], [1, 1]];
        manDirections.forEach(([rowStep, columnStep]) => {
          const enemyRow = currentRow + rowStep;
          const enemyColumn = currentColumn + columnStep;
          const landingRow = currentRow + rowStep * 2;
          const landingColumn = currentColumn + columnStep * 2;
          if (!inBoard(landingRow, landingColumn)) return;
          const enemy = at(enemyRow, enemyColumn);
          const landing = at(landingRow, landingColumn);
          const enemyPiece = occupancy[enemy];
          if (
            enemyPiece &&
            enemyPiece.color !== piece.color &&
            !captured.includes(enemy) &&
            !(state.pendingCaptures || []).includes(enemy) &&
            occupancy[landing] === null
          ) {
            const nextOccupancy = occupancy.map((item) => item ? { ...item } : null);
            nextOccupancy[current] = null;
            if (!this.config.deferCapturedPieces) nextOccupancy[enemy] = null;
            const promotionRow = landingRow === 0 || landingRow === size - 1;
            const becomesKing = isKing || (
              promotionRow &&
              !this.config.menCaptureBackward
            );
            nextOccupancy[landing] = { color: piece.color, king: becomesKing };
            const original = occupancy.map((item) => item ? { ...item } : null);
            for (let i = 0; i < occupancy.length; i++) occupancy[i] = nextOccupancy[i];
            foundCapture = true;
            const nextSteps = [...steps, { to: landing, capture: enemy }];
            if (becomesKing && !isKing) {
              paths.push({
                to: landing,
                captures: [...captured, enemy],
                steps: nextSteps
              });
            } else {
              search(landing, becomesKing, [...captured, enemy], nextSteps);
            }
            for (let i = 0; i < occupancy.length; i++) occupancy[i] = original[i];
          }
        });
      }
      if (!foundCapture && captured.length > 0) {
        paths.push({ to: current, captures: [...captured], steps });
      }
    };

    search(from, Boolean(piece.king), [], []);
    return paths;
  }

  getFirstCaptureOptions(paths, longest = null) {
    const options = new Map();
    paths.forEach((path) => {
      if (longest !== null && path.captures.length !== longest) return;
      const step = path.steps[0];
      if (!options.has(step.to)) {
        options.set(step.to, { to: step.to, captures: [step.capture] });
      }
    });
    return [...options.values()];
  }

  getCaptureOptions(state, from) {
    if (!(state instanceof GameState) && (!state || !Array.isArray(state.squares))) {
      throw new TypeError("A GameState snapshot is required");
    }
    if (state.continuationSquare != null && state.continuationSquare !== from) {
      return [];
    }
    const paths = this.getCapturePaths(state, from);
    if (paths.length === 0) return [];
    const longest = this.config.longestCaptureMandatory
      ? Math.max(...paths.map((path) => path.captures.length))
      : null;
    return this.getFirstCaptureOptions(paths, longest);
  }

  getSimpleMoves(state, from) {
    const piece = state.squares[from];
    if (!piece) return [];
    const row = Math.floor(from / this.boardSize);
    const column = from % this.boardSize;
    const inBoard = (nextRow, nextColumn) =>
      nextRow >= 0 && nextRow < this.boardSize &&
      nextColumn >= 0 && nextColumn < this.boardSize;
    const at = (nextRow, nextColumn) => nextRow * this.boardSize + nextColumn;
    const directions = piece.king
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.color === "white"
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];

    const moves = [];
    if (piece.king && this.config.flyingKings) {
      directions.forEach(([rowStep, columnStep]) => {
        let nextRow = row + rowStep;
        let nextColumn = column + columnStep;
        while (inBoard(nextRow, nextColumn)) {
          const square = at(nextRow, nextColumn);
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
        if (!inBoard(nextRow, nextColumn)) return;
        const square = at(nextRow, nextColumn);
        if (state.squares[square] === null) moves.push(square);
      });
    }
    return moves;
  }

  getMandatoryCaptures(state, color) {
    const captures = new Map();
    let longest = 0;
    for (let from = 0; from < this.squareCount; from++) {
      if (state.continuationSquare != null && from !== state.continuationSquare) {
        continue;
      }
      const piece = state.squares[from];
      if (piece && piece.color === color) {
        const paths = this.getCapturePaths(state, from);
        if (paths.length > 0) {
          const length = Math.max(...paths.map((path) => path.captures.length));
          longest = Math.max(longest, length);
          captures.set(from, { paths, length });
        }
      }
    }
    if (this.config.longestCaptureMandatory) {
      for (const [from, result] of captures) {
        if (result.length !== longest) {
          captures.delete(from);
          continue;
        }
        captures.set(
          from,
          this.getFirstCaptureOptions(result.paths, result.length)
        );
      }
    } else {
      for (const [from, result] of captures) {
        captures.set(from, this.getFirstCaptureOptions(result.paths));
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
    if (state.continuationSquare != null) return [];

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
    if (
      state.continuationSquare != null &&
      command.from !== state.continuationSquare
    ) {
      return { valid: false, error: "The same piece must continue capturing" };
    }
    const piece = state.squares[command.from];
    if (!piece) return { valid: false, error: "The source square is empty" };
    if (piece.color !== state.turn) return { valid: false, error: "It is not this piece's turn" };
    if (state.squares[command.to]) return { valid: false, error: "The destination square is occupied" };

    const mandatory = this.getMandatoryCaptures(state, piece.color);
    const options = this.getCaptureOptions(state, command.from);
    if (state.continuationSquare != null && options.length === 0) {
      return { valid: false, error: "A capture continuation is mandatory" };
    }
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
    for (let from = 0; from < this.squareCount; from++) {
      const piece = state.squares[from];
      if (!piece || piece.color !== color) continue;
      if (this.getLegalMoves(state, from).length > 0) return true;
    }
    return false;
  }
}

export class CheckersRules extends RulesEngine {}

export function getLegalMoves(state, from, ruleset = "international") {
  return new RulesEngine(ruleset).getLegalMoves(state, from);
}

export function validateMove(state, command, ruleset = "international") {
  return new RulesEngine(ruleset).validateMove(state, command);
}
