//Board class that create and command the game
/*jshint esversion: 6 */
import { GameState } from "./core/game-state.js?v=0.24";
import {
  RulesEngine,
  getBoardSize,
  getSquareCount,
  RULESETS
} from "./core/rules-engine.js?v=0.24";

const translations = {
  en: {
    title: "Checkers Game",
    description:
      "Play checkers with the computer for free, no sign-in required, easy to use, classic Checkers game!",
    whiteTurn: "White's turn",
    blackTurn: "Black's turn",
    menu: "Menu",
    playMode: "Choose a game mode",
    vsComputer: "Against computer",
    vsLocal: "Against local player (coming soon)",
    vsOnline: "Against online player (coming soon)",
    computerSettings: "Computer game setup",
    playerColor: "Play as",
    back: "Back",
    chooseColor: "Choose your color",
    white: "White",
    black: "Black",
    blackWinsPieces: "Black wins!",
    whiteWinsPieces: "White wins!",
    blackWinsMoves: "Black wins!",
    whiteWinsMoves: "White wins!",
    gameOver: "Game over",
    ok: "OK",
    startGame: "Start Game!",
    restartGame: "Restart",
    options: "Options",
    soundOn: "Turn sound on",
    soundOff: "Turn sound off",
    enterFullscreen: "Enter fullscreen",
    exitFullscreen: "Exit fullscreen",
    fullscreenError: "Unable to change fullscreen mode.",
    rules: "Rules",
    results: "Results",
    sound: "Sound On/Off",
    forcedHighlight: "Forced capture highlight",
    language: "Language",
    ruleset: "Rule set",
    internationalDraughts: "International draughts",
    britishDraughts: "British draughts",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    simpleMove: "Simple move:",
    simpleMoveText:
      "Move a piece one square diagonally forward to an adjacent unoccupied dark square.",
    jump: "Jump (capture an opponent's piece):",
    jumpText:
      "Jump over an opponent's piece to an empty square beyond it. Captures are mandatory. If another capture is available after a jump, it must also be made.",
    king: "King:",
    internationalKingText:
      "A piece that reaches the last row becomes a king. Kings move and capture any distance diagonally. In International draughts, captures must take the longest available sequence.",
    britishKingText:
      "A piece that reaches the last row becomes a king. Kings move one square diagonally forward or backward and capture by jumping an adjacent piece.",
    endOfGame: "End of game:",
    endOfGameText:
      "A player wins by capturing all opposing pieces or leaving the opponent with no legal moves.",
    player: "Player",
    computer: "Computer",
    resetScore: "Reset Score"
  },
  fr: {
    title: "Jeu de dames",
    description:
      "Jouez aux dames gratuitement contre l'ordinateur, sans inscription. Un jeu de dames classique, simple à utiliser !",
    whiteTurn: "Aux Blancs de jouer",
    blackTurn: "Aux Noirs de jouer",
    menu: "Menu",
    playMode: "Choisissez un mode de jeu",
    vsComputer: "Contre l'ordinateur",
    vsLocal: "Contre un joueur local (bientôt)",
    vsOnline: "Contre un joueur en ligne (bientôt)",
    computerSettings: "Paramètres contre l'ordinateur",
    playerColor: "Jouer avec",
    back: "Retour",
    chooseColor: "Choisissez votre couleur",
    white: "Blancs",
    black: "Noirs",
    blackWinsPieces: "Les Noirs gagnent !",
    whiteWinsPieces: "Les Blancs gagnent !",
    blackWinsMoves: "Les Noirs gagnent !",
    whiteWinsMoves: "Les Blancs gagnent !",
    gameOver: "Fin de la partie",
    ok: "OK",
    startGame: "Commencer",
    restartGame: "Recommencer",
    options: "Options",
    soundOn: "Activer le son",
    soundOff: "Désactiver le son",
    enterFullscreen: "Passer en plein écran",
    exitFullscreen: "Quitter le plein écran",
    fullscreenError: "Impossible de changer le mode plein écran.",
    rules: "Règles",
    results: "Résultats",
    sound: "Son activé/désactivé",
    forcedHighlight: "Indiquer les prises obligatoires",
    language: "Langue",
    ruleset: "Variante",
    internationalDraughts: "Dames internationales",
    britishDraughts: "Dames anglaises",
    difficulty: "Difficulté",
    easy: "Facile",
    medium: "Intermédiaire",
    hard: "Difficile",
    simpleMove: "Déplacement simple :",
    simpleMoveText:
      "Déplacez un pion d'une case en diagonale vers l'avant, sur une case foncée adjacente inoccupée.",
    jump: "Prise d'un pion adverse :",
    jumpText:
      "Sautez par-dessus un pion adverse jusqu'à une case vide située après lui. Les prises sont obligatoires. Si une autre prise est possible après un saut, elle doit également être effectuée.",
    king: "Dame :",
    internationalKingText:
      "Lorsqu'un pion atteint la dernière rangée, il devient une dame. Les dames se déplacent et prennent en diagonale sur plusieurs cases libres. Aux dames internationales, une prise doit suivre la séquence la plus longue disponible.",
    britishKingText:
      "Lorsqu'un pion atteint la dernière rangée, il devient une dame. Elle se déplace d'une case en diagonale vers l'avant ou l'arrière et prend en sautant par-dessus un pion adjacent.",
    endOfGame: "Fin de partie :",
    endOfGameText:
      "Un joueur gagne en prenant tous les pions adverses ou en empêchant l'adversaire de jouer.",
    player: "Joueur",
    computer: "Ordinateur",
    resetScore: "Réinitialiser les scores"
  }
};

function getPreferredLanguage() {
  const preferredLanguage =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages[0]
      : navigator.language;
  return preferredLanguage && /^fr(?:-|$)/i.test(preferredLanguage)
    ? "fr"
    : "en";
}

const storage = {
  get(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      console.warn(`Could not read localStorage key "${key}":`, error);
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      console.warn(`Could not write localStorage key "${key}":`, error);
      return false;
    }
  }
};

class Board {
  // Method to create the board
  constructor() {
    const savedLanguage = storage.get("language");
    this.language =
      savedLanguage === "en" || savedLanguage === "fr"
        ? savedLanguage
        : getPreferredLanguage();
    const savedRuleset = storage.get("ruleset");
    this.ruleset =
      savedRuleset === "british" || savedRuleset === "international"
        ? savedRuleset
        : "international";
    this.rulesEngine = new RulesEngine(this.ruleset);
    this.gameState = new GameState({
      squares: Array(getSquareCount(this.ruleset)).fill(null),
      turn: "white",
      ruleset: this.ruleset,
      revision: 0
    });
    const savedDifficulty = storage.get("difficulty");
    this.difficulty =
      savedDifficulty === "easy" ||
      savedDifficulty === "medium" ||
      savedDifficulty === "hard"
        ? savedDifficulty
        : "easy";
    this.applyLanguage();
    this.game = document.getElementById("game");
    this.pieceElements = Array(getSquareCount(this.ruleset)).fill(null);
    this.piecePositions = new WeakMap();
    this.playerColor = "piece-white";
    this.computerColor = "piece-black";
    this.game.classList.add("player-white");
    this.whiteKing = false;
    this.blackKing = false;
    this.needTake = []; // save pieces that need to take
    // takeIt info to take a piece: actualPieceId, enemySquareId, opositeSquareId
    this.takeIt = [];
    this.pieceTaking = null;
    this.moveSound = new Audio("assets/audio/move.mp3");
    this.takeSound = new Audio("assets/audio/capture.mp3");
    this.menu = new Audio("assets/audio/menu.mp3");
    this.turn = 0;
    this.optionHighlight = true;
    this.optionSound = storage.get("soundEnabled") === "true";
    this.soundToggle = document.getElementById("sound-toggle");
    this.updateSoundToggle();
    this.soundToggle.addEventListener("click", () => {
      this.optionSound = !this.optionSound;
      storage.set("soundEnabled", this.optionSound);
      this.updateSoundToggle();
      this.playSound("menu");
    });
    this.fullscreenToggle = document.getElementById("fullscreen-toggle");
    this.updateFullscreenToggle();
    this.fullscreenToggle.addEventListener("click", () => {
      this.toggleFullscreen();
    });
    document.addEventListener("fullscreenchange", () => {
      this.updateFullscreenToggle();
    });
    this.menuIsOpen = true;
    this.isPlaying = false;
    this.gameOver = false;
    this.timers = new Set();

    // prepare for score saving
    if (storage.get("whiteScore") == null) {
      storage.set("whiteScore", 0);
    }
    if (storage.get("blackScore") == null) {
      storage.set("blackScore", 0);
    }

    // create squares
    this.buildBoard();
  }

  buildBoard() {
    const boardSize = getBoardSize(this.ruleset);
    this.game.querySelectorAll(".square").forEach((square) => square.remove());
    this.game.style.gridTemplateColumns = `repeat(${boardSize}, auto)`;
    const squareSize = boardSize === 10 ? "8vmin" : "10vmin";
    let color = "white";
    for (let i = 0; i < boardSize * boardSize; i++) {
      color = color == "black" ? "white" : "black";
      if (i % boardSize == 0) {
        color = color == "black" ? "white" : "black"; // invert the color to the next row
      }
      const newDiv = document.createElement("div");
      newDiv.className = "square";
      newDiv.classList.add(color);
      newDiv.style.width = `max(24px, ${squareSize})`;
      newDiv.id = i;
      newDiv.setAttribute("occupied", "false");
      this.game.appendChild(newDiv);
    }
  }

  getPieces(color) {
    return this.gameState.squares.reduce((pieces, piece, square) => {
      if (piece && piece.color === color && this.pieceElements[square]) {
        pieces.push(this.pieceElements[square]);
      }
      return pieces;
    }, []);
  }

  updatePieceElement(pieceElement, pieceState) {
    pieceElement.classList.remove("white-king", "black-king");
    if (pieceState.king) {
      pieceElement.classList.add(`${pieceState.color}-king`);
    }
  }

  submitMove(from, to) {
    const state = this.gameState;
    const validation = this.rulesEngine.validateMove(state, { from, to });
    if (!validation.valid) return { ...validation, keepTurn: false };

    const movingPiece = this.pieceElements[from];
    if (!movingPiece || this.piecePositions.get(movingPiece) !== from) {
      return { valid: false, error: `No rendered piece matches source square ${from}`, keepTurn: false };
    }
    const movingColor = state.squares[from].color;
    let keepTurn = false;
    if (validation.capture) {
      const provisional = GameState.fromJSON(state.toJSON());
      provisional.applyMove({
        from,
        to,
        captures: validation.captures,
        keepTurn: true,
        revision: state.revision
      });
      keepTurn =
        this.rulesEngine.getCaptureOptions(provisional, to).length > 0;
    }

    const capturedSquaresToRemove =
      RULESETS[this.gameState.ruleset].deferCapturedPieces && keepTurn
        ? []
        : [...new Set([...(state.pendingCaptures || []), ...validation.captures])];
    const capturedColors = capturedSquaresToRemove.map(
      (square) => state.squares[square].color
    );
    const capturedElements = capturedSquaresToRemove.map((square) => {
      const piece = this.pieceElements[square];
      if (!piece || this.piecePositions.get(piece) !== square) {
        throw new Error(`No rendered piece matches captured square ${square}`);
      }
      return piece;
    });

    const snapshot = this.gameState.applyMove({
      from,
      to,
      captures: validation.captures,
      keepTurn,
      revision: state.revision
    });
    this.gameState = GameState.fromJSON(snapshot);

    capturedSquaresToRemove.forEach((capturedSquare, index) => {
      const capturedPiece = capturedElements[index];
      const capturedColor = capturedColors[index];
      capturedPiece.classList.remove(`piece-${capturedColor}`);
      capturedPiece.classList.add(`piece-out-${capturedColor}`);
      const tray = document.getElementById(
        movingColor === "white" ? "removedw" : "removedb"
      );
      tray.appendChild(capturedPiece);
      this.pieceElements[capturedSquare] = null;
      this.piecePositions.set(capturedPiece, null);
      document.getElementById(capturedSquare).setAttribute("occupied", "false");
    });

    const sourceSquare = document.getElementById(from);
    const destinationSquare = document.getElementById(to);
    destinationSquare.appendChild(movingPiece);
    sourceSquare.setAttribute("occupied", "false");
    destinationSquare.setAttribute("occupied", "true");
    this.pieceElements[from] = null;
    this.pieceElements[to] = movingPiece;
    this.piecePositions.set(movingPiece, to);
    this.updatePieceElement(movingPiece, this.gameState.squares[to]);
    document.dispatchEvent(
      new CustomEvent("checkers:move", {
        detail: {
          from,
          to,
          captures: validation.captures.slice(),
          capturedSquares: capturedSquaresToRemove.slice(),
          pendingCaptures: this.gameState.pendingCaptures.slice(),
          capturedColors,
          capturedPieces: capturedElements.map((piece) => piece.cloneNode(true))
        }
      })
    );
    return { ...validation, keepTurn };
  }

  translate(key) {
    return translations[this.language][key];
  }

  applyLanguage() {
    document.documentElement.lang = this.language;
    document.title = this.translate("title");
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", this.translate("description"));
  }

  setLanguage(language) {
    if (language !== "en" && language !== "fr") {
      throw new RangeError(`Unsupported language: ${language}`);
    }
    this.language = language;
    storage.set("language", language);
    this.applyLanguage();
    this.updateSoundToggle();
    this.updateFullscreenToggle();
    if (
      this.isPlaying &&
      this.gameState.turn === this.playerColor.slice("piece-".length)
    ) {
      document.getElementById("messages").textContent =
        this.translate(
          this.playerColor === "piece-white" ? "whiteTurn" : "blackTurn"
        );
    }
  }

  updateSoundToggle() {
    this.soundToggle.textContent = this.optionSound ? "\u{1f50a}" : "\u{1f507}";
    this.soundToggle.setAttribute(
      "aria-label",
      this.translate(this.optionSound ? "soundOff" : "soundOn")
    );
    this.soundToggle.setAttribute("aria-pressed", String(this.optionSound));
  }

  updateFullscreenToggle() {
    const isFullscreen = Boolean(document.fullscreenElement);
    this.fullscreenToggle.textContent = isFullscreen ? "\u25a3" : "\u26f6";
    const label = this.translate(
      isFullscreen ? "exitFullscreen" : "enterFullscreen"
    );
    this.fullscreenToggle.setAttribute("aria-label", label);
    this.fullscreenToggle.setAttribute("title", label);
  }

  async toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Could not change fullscreen mode:", error);
      const messages = document.getElementById("messages");
      const previousMessage = messages.textContent;
      const errorMessage = this.translate("fullscreenError");
      messages.textContent = errorMessage;
      setTimeout(() => {
        if (messages.textContent === errorMessage) {
          messages.textContent = previousMessage;
        }
      }, 3000);
    }
  }

  setPlayerColor(color) {
    if (color !== "white" && color !== "black") {
      throw new RangeError(`Unsupported player color: ${color}`);
    }
    this.playerColor = `piece-${color}`;
    this.computerColor = color === "white" ? "piece-black" : "piece-white";
    this.game.classList.remove("player-white", "player-black");
    this.game.classList.add(`player-${color}`);
  }

  setRuleset(ruleset) {
    if (ruleset !== "international" && ruleset !== "british") {
      throw new RangeError(`Unsupported ruleset: ${ruleset}`);
    }
    this.ruleset = ruleset;
    this.rulesEngine = new RulesEngine(ruleset);
    this.gameState = new GameState({
      squares: Array(getSquareCount(ruleset)).fill(null),
      turn: "white",
      ruleset,
      revision: 0
    });
    storage.set("ruleset", ruleset);

    if (
      !this.isPlaying ||
      this.gameState.turn !== this.playerColor.slice("piece-".length)
    ) {
      return;
    }

    document.querySelectorAll(".possible, .moving").forEach((square) => {
      square.classList.remove("possible", "moving");
    });
    const playerPieces = this.getPieces(
      this.playerColor.slice("piece-".length)
    );
    playerPieces.forEach((piece) => {
      piece.classList.remove("highlight");
      piece.movable = true;
    });
    this.takeIt = [];
    this.needTake = [];
    if (!this.checkIfcanTake(playerPieces)) {
      playerPieces.forEach((piece) => {
        piece.movable = true;
        this.checkpossibleMove(piece);
      });
    }
  }

  setDifficulty(difficulty) {
    if (
      difficulty !== "easy" &&
      difficulty !== "medium" &&
      difficulty !== "hard"
    ) {
      throw new RangeError(`Unsupported difficulty: ${difficulty}`);
    }
    this.difficulty = difficulty;
    storage.set("difficulty", difficulty);
  }

  // Method to start the game
  startGame() {
    /* Start the game*/
    this.gameOver = false;
    this.createPieces();
    this.removeMoving();
    this.gameControl();
  }

  // Method to control the game turns
  gameControl() {
    /* Method to control the game turns*/
    this.turn += 1;
    if (this.gameState.turn === this.playerColor.slice("piece-".length)) {
      const message = document.getElementById("messages");
      message.textContent = this.translate(
        this.playerColor === "piece-white" ? "whiteTurn" : "blackTurn"
      );
      const computerColor = this.computerColor.slice("piece-".length);
      const computerPieces = this.getPieces(computerColor);
      computerPieces.forEach((item) => {
        item.movable = false;
        item.addEventListener("click", this.pieceClick);
      });
      setTimeout(() => {
        if (!this.pieceTaking) this.checkWinner();
      }, 1000);

      const playerColor = this.playerColor.slice("piece-".length);
      const playerPieces = this.getPieces(playerColor);
      if (!this.checkIfcanTake(playerPieces)) {
        playerPieces.forEach((item) => {
          item.movable = true;
          item.addEventListener("click", this.pieceClick);
          this.checkpossibleMove(item);
        });
      }
    } else {
      const message = document.getElementById("messages");
      message.innerHTML = "";
      let highlightPieces = document.querySelectorAll(".highlight");
      highlightPieces.forEach((item) => {
        item.classList.remove("highlight");
      });

      const playerColor = this.playerColor.slice("piece-".length);
      const playerPieces = this.getPieces(playerColor);
      playerPieces.forEach((item) => {
        item.movable = false;
      });
      setTimeout(() => {
        if (!this.pieceTaking) this.checkWinner();
      }, 1000);
      const computerColor = this.computerColor.slice("piece-".length);
      const computerPieces = this.getPieces(computerColor);
      computerPieces.forEach((item) => {
        item.movable = false;
        this.checkpossibleMove(item);
      });
      let timeMove;
      if (this.difficulty === "easy") {
        timeMove = Math.random() * 2000 + 1800;
      } else if (this.difficulty === "medium") {
        timeMove = Math.random() * 1300 + 1200;
      } else {
        timeMove = Math.random() * 700 + 550;
      }
      setTimeout(() => board.computerMove(), timeMove);
    }
  }

  // Method to create pieces
  createPieces() {
    /* Create the pieces on the board*/
    const boardSize = getBoardSize(this.ruleset);
    const squareCount = boardSize * boardSize;
    const blackPieces = [];
    const whitePieces = [];
    const pieceRows = this.ruleset === "international" ? 4 : 3;
    for (let row = 0; row < pieceRows; row++) {
      for (let column = 0; column < boardSize; column++) {
        if ((row + column) % 2 === 1) blackPieces.push(row * boardSize + column);
      }
    }
    for (let row = boardSize - pieceRows; row < boardSize; row++) {
      for (let column = 0; column < boardSize; column++) {
        if ((row + column) % 2 === 1) whitePieces.push(row * boardSize + column);
      }
    }
    const squares = Array(squareCount).fill(null);
    blackPieces.forEach((square) => {
      squares[square] = { color: "black", king: false };
    });
    whitePieces.forEach((square) => {
      squares[square] = { color: "white", king: false };
    });
    this.gameState = new GameState({
      squares,
      turn: "white",
      ruleset: this.ruleset,
      revision: 0
    });
    this.pieceElements = Array(squareCount).fill(null);

    this.gameState.squares.forEach((pieceState, square) => {
      const squareElement = document.getElementById(square);
      squareElement.setAttribute("occupied", String(Boolean(pieceState)));
      if (!pieceState) return;

      const piece = new Piece(pieceState.color);
      const element = piece.get_piece(
        (pieceState.color === "black" ? 100 : 200) + square
      );
      this.updatePieceElement(element, pieceState);
      squareElement.appendChild(element);
      this.pieceElements[square] = element;
      this.piecePositions.set(element, square);
    });
  }

  // Method to avoid bug of piece being moved to another square
  removeMoving() {
    document.addEventListener("movestart", (event) => {
      event.preventDefault();
      const oldPossibleMoves = document.querySelectorAll(".possible");
      if (oldPossibleMoves.length > 0) {
        oldPossibleMoves.forEach((item) => {
          item.classList.remove("possible");
        });
      }
    });
  }

  // Method to add click event listeners
  pieceClick(e) {
    /* Method to add click event listeners to the pieces*/
    if (e.target.suppressClick) {
      return false;
    }
    const moving = document.querySelectorAll(".moving");
    moving.forEach((item) => {
      item.classList.remove("moving");
    });
    const oldPossibleMoves = document.querySelectorAll(".possible");
    if (oldPossibleMoves.length > 0) {
      oldPossibleMoves.forEach((item) => {
        item.classList.remove("possible");
      });
    }
    if (e.target.classList[0] == "piece" && e.target.movable) {
      e.target.classList.add("moving");
      // check for possible moves
      const possibleMove = board.checkpossibleMove(e.target);
      if (possibleMove.length > 0) {
        possibleMove.forEach((item) => {
          const square = document.getElementById(item);
          square.classList.add("possible");
          square.addEventListener("click", board.movePiece);
        });
      } else {
        e.target.classList.remove("moving");
      }
    } else {
      return false;
    }
  }

  // add square click to possible squares
  movePiece(e) {
    /* Method to move the piece to the square*/

    if (e.target.classList.contains("possible")) {
      board.playSound("move");
      const piece = document.querySelector(".moving");
      const square = document.getElementById(e.target.id);
      const moveResult = board.submitMove(
        board.piecePositions.get(piece),
        Number(square.id)
      );
      if (!moveResult.valid) {
        piece.classList.remove("moving");
        document.querySelectorAll(".possible").forEach((item) => {
          item.classList.remove("possible");
        });
        return false;
      }
      if (moveResult.capture) {
        board.playSound("take");
      }
      piece.classList.remove("moving");
      const dragSquares = document.querySelectorAll(".possible");
      dragSquares.forEach((item) => {
        item.classList.remove("possible");
      });
      board.gameControl();
    }
  }

  // Method to move the computer piece automatically and take if possible
  computerMove() {
    /* Method to move the computer piece automatically and take if possible */
    if (this.gameOver) {
      return;
    }

    const computerPieces = this.getPieces(
      this.computerColor.slice("piece-".length)
    );
    let piecesToCheck = this.pieceTaking ? [this.pieceTaking] : computerPieces;
    const captureOptions = this.getComputerCaptures(piecesToCheck);

    if (captureOptions.length > 0) {
      this.takeIt = captureOptions;
      if (this.takePiece()) {
        setTimeout(() => this.computerMove(), 500);
        return;
      }
    } else {
      board.moveComputerPiece();
    }
    this.pieceTaking = null;
    board.gameControl();
  }

  getComputerCaptures(pieces) {
    this.takeIt = [];
    this.needTake = [];
    pieces.forEach((piece) => {
      this.checkpossibleMove(piece);
    });
    return this.takeIt.slice();
  }

  scoreComputerMove(piece, destination, capturedSquare = null) {
    const from = this.piecePositions.get(piece);
    const pieceState = this.gameState.squares[from];
    if (!pieceState) {
      throw new Error(`No game-state piece matches rendered square ${from}`);
    }
    const wasKing = pieceState.king;
    const destinationId = Number(destination.id);
    const captures =
      capturedSquare != null ? [Number(capturedSquare.id)] : [];
    const simulation = GameState.fromJSON(this.gameState.toJSON());
    simulation.applyMove({
      from,
      to: destinationId,
      captures,
      keepTurn: false,
      revision: simulation.revision
    });

    const movedPiece = simulation.squares[destinationId];
    const promotes = !wasKing && movedPiece.king;

    let immediateCaptures = 0;
    let capturesOfMovedPiece = 0;
    const opponentColor = this.playerColor.slice("piece-".length);
    this.rulesEngine
      .getMandatoryCaptures(simulation, opponentColor)
      .forEach((options) => {
        options.forEach((option) => {
          immediateCaptures += 1;
          if (option.captures.includes(destinationId)) {
            capturesOfMovedPiece += 1;
          }
        });
      });

    const mobility = this.rulesEngine.getLegalMoves(simulation, destinationId).length;
    const boardSize = getBoardSize(this.ruleset);
    const row = Math.floor(destinationId / boardSize);
    const column = Number(destination.id) % boardSize;
    const center = (boardSize - 1) / 2;
    const centerDistance = Math.abs(column - center) + Math.abs(row - center);
    const advancement = movedPiece.color === "white" ? -row : row;
    const score =
      advancement * 2 +
      mobility * 2 -
      centerDistance +
      (promotes ? 80 : 0) -
      capturesOfMovedPiece * 100 -
      (immediateCaptures - capturesOfMovedPiece) * 10;
    return score;
  }

  // take a piece
  takePiece() {
    /* Method to take a piece */
    let group = null;
    let piece;
    let oppositeSquare;
    let bestScore = -Infinity;
    const validOptions = board.takeIt.filter((option) => {
      return !this.pieceTaking || option[0] == this.pieceTaking;
    });

    if (
      validOptions.length > 0 &&
      (this.difficulty === "easy" ||
        (this.difficulty === "medium" && Math.random() < 0.35))
    ) {
      group =
        validOptions[Math.floor(Math.random() * validOptions.length)];
    } else {
      validOptions.forEach((option) => {
      if (this.pieceTaking && option[0] != this.pieceTaking) {
        return;
      }
      const target = document.getElementById(option[2]);
      const victim = document.getElementById(option[1]);
      const score = this.scoreComputerMove(option[0], target, victim);
      if (score > bestScore) {
        bestScore = score;
        group = option;
      }
      });
    }

    if (!group) {
      return false;
    }

    board.playSound("take");
    piece = group[0];
    this.pieceTaking = piece;
    oppositeSquare = document.getElementById(group[2]);
    const moveResult = this.submitMove(
      this.piecePositions.get(piece),
      Number(oppositeSquare.id)
    );
    if (!moveResult.valid) return false;
    return moveResult.keepTurn;
  }

  // Method to move a piece
  moveComputerPiece() {
    /* Method to move a piece */
    let bestMove = null;
    let bestScore = -Infinity;
    const possibleMoves = [];
    const computerPieces = this.getPieces(
      this.computerColor.slice("piece-".length)
    );
    computerPieces.forEach((piece) => {
      const pieceMoves = this.checkpossibleMove(piece);
      pieceMoves.forEach((moveId) => {
        const destination = document.getElementById(moveId);
        const score = this.scoreComputerMove(piece, destination);
        possibleMoves.push([piece, destination, score]);
        if (score > bestScore) {
          bestScore = score;
          bestMove = [piece, destination];
        }
      });
    });

    if (possibleMoves.length > 0) {
      if (this.difficulty === "easy") {
        bestMove =
          possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      } else if (
        this.difficulty === "medium" &&
        Math.random() < 0.35
      ) {
        bestMove =
          possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      }
    }

    if (!bestMove) {
      return false;
    }

    const piece = bestMove[0];
    const destination = bestMove[1];
    const moveResult = board.submitMove(
      board.piecePositions.get(piece),
      Number(destination.id)
    );
    if (!moveResult.valid) return false;
    board.playSound("move");
    return true;
  }

  // Method to check if there is forced take for the pieces
  checkIfcanTake(pieces) {
    /* Check if any piece can take another
    Input (arr(obj)): Pieces

    Output (boolean): true if piece can take */

    this.needTake = [];
    const piecesToCheck = this.pieceTaking
      ? pieces.filter((item) => item === this.pieceTaking)
      : pieces;
    piecesToCheck.forEach((item) => {
      this.checkpossibleMove(item);
    });
    if (this.needTake.length > 0) {
      this.needTake.forEach((item) => {
        item.movable = true;
        if (this.optionHighlight && item.classList.contains(this.playerColor)) {
          item.classList.add("highlight");
        }
      });
      // freeze the rest
      pieces.forEach((item) => {
        if (!this.needTake.includes(item)) {
          item.movable = false;
        }
      });
      return true;
    } else {
      return false;
    }
  }

  updateScore(color) {
    /* Update the score
    Input (str): Color of the piece
    */

    const scoreKey =
      `piece-${color}` === this.playerColor ? "whiteScore" : "blackScore";
    const savedScore = storage.get(scoreKey, "0");
    const score = (Number.parseInt(savedScore, 10) || 0) + 1;
    storage.set(scoreKey, score);
  }

  // check winner
  checkWinner() {
    /* Check if there is a winner */
    if (this.gameOver) {
      return -1;
    }

    let whitePiecesLeft = 0;
    let blackPiecesLeft = 0;

    // No pieces left
    const whitePieces = this.gameState.squares.filter(
      (piece) => piece && piece.color === "white"
    );
    const blackPieces = this.gameState.squares.filter(
      (piece) => piece && piece.color === "black"
    );
    this.gameState.squares.forEach((piece, square) => {
      if (!piece) return;
      const legalMoves = this.rulesEngine.getLegalMoves(this.gameState, square);
      if (piece.color === "white") {
        whitePiecesLeft += legalMoves.length;
      } else {
        blackPiecesLeft += legalMoves.length;
      }
    });

    if (whitePieces.length === 0) {
      this.updateScore("black");
      this.showGameOver(this.translate("blackWinsPieces"));
      return -1;
    } else if (blackPieces.length === 0) {
      this.updateScore("white");
      this.showGameOver(this.translate("whiteWinsPieces"));
      return -1;
    } else if (whitePiecesLeft == 0) {
      this.updateScore("black");
      this.showGameOver(this.translate("blackWinsMoves"));
      return -1;
    } else if (blackPiecesLeft == 0) {
      this.updateScore("white");
      this.showGameOver(this.translate("whiteWinsMoves"));
      return -1;
    }
  }

  showGameOver(message) {
    this.gameOver = true;
    const overlay = document.createElement("div");
    overlay.id = "game-over";
    overlay.className = "game-over";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "game-over-title");

    const card = document.createElement("div");
    card.className = "game-over-card";
    const heading = document.createElement("h2");
    heading.id = "game-over-title";
    heading.textContent = this.translate("gameOver");
    const result = document.createElement("p");
    result.textContent = message;
    const button = document.createElement("button");
    button.className = "game-over-button";
    button.type = "button";
    button.textContent = this.translate("ok");

    card.append(heading, result, button);
    overlay.appendChild(card);
    this.game.appendChild(overlay);

    const returnToMenu = () => location.reload();
    button.addEventListener("click", returnToMenu);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        returnToMenu();
      }
    });
    button.focus();
  }

  // play sound
  playSound(soundType) {
    /* Play sound */
    if (this.optionSound) {
      const audio =
        soundType == "move" ? this.moveSound :
        soundType == "take" ? this.takeSound :
        soundType == "menu" ? this.menu :
        null;
      if (!audio) return;
      Promise.resolve(audio.play()).catch((error) => {
        console.debug("Audio playback was blocked:", error);
      });
    }
  }

  // Method to check possible targets
  checkpossibleMove(pieceToCheck = null) {
    let movPiece =
      pieceToCheck || document.querySelector(".moving");
    if (!movPiece) return [];

    const state = this.gameState;
    const from = this.piecePositions.get(movPiece);
    if (!Number.isInteger(from)) return [];
    const piece = state.squares[from];
    if (!piece) return [];
    const captureOptions = this.rulesEngine.getCaptureOptions(state, from);
    if (captureOptions.length > 0) {
      this.needTake.push(movPiece);
      captureOptions.forEach((option) => {
        option.captures.forEach((captured) => {
          this.takeIt.push([movPiece, captured, option.to]);
        });
      });
      return captureOptions.map((option) => option.to);
    }

    const mandatory = this.rulesEngine.getMandatoryCaptures(
      state,
      piece.color
    );
    if (mandatory.size > 0) return [];
    return this.rulesEngine.getSimpleMoves(state, from);
  }

  // Method to enable drag-to-move on a piece
  setupPieceDrag(piece) {
    piece.draggable = false;
    let dragStarted = false;
    let startX = 0;
    let startY = 0;
    let dragPreview = null;
    let dropTarget = null;
    let grabOffsetX = 0;
    let grabOffsetY = 0;

    const findDropTarget = (x, y) => {
      let closestSquare = null;
      let closestDistance = Infinity;
      document.querySelectorAll(".possible").forEach((square) => {
        const rect = square.getBoundingClientRect();
        const distance = Math.hypot(
          x - (rect.left + rect.width / 2),
          y - (rect.top + rect.height / 2)
        );
        if (
          distance <= Math.min(rect.width, rect.height) * 0.75 &&
          distance < closestDistance
        ) {
          closestSquare = square;
          closestDistance = distance;
        }
      });
      return closestSquare;
    };

    const updateDropTarget = (x, y) => {
      const nextTarget = findDropTarget(x, y);
      if (nextTarget === dropTarget) {
        return dropTarget;
      }
      if (dropTarget) {
        dropTarget.classList.remove("drop-target");
      }
      dropTarget = nextTarget;
      if (dropTarget) {
        dropTarget.classList.add("drop-target");
      }
      return dropTarget;
    };

    const removeDragPreview = () => {
      if (dragPreview) {
        dragPreview.remove();
        dragPreview = null;
      }
      if (dropTarget) {
        dropTarget.classList.remove("drop-target");
        dropTarget = null;
      }
      piece.classList.remove("dragging");
      piece.style.pointerEvents = "";
    };

    piece.addEventListener("pointerdown", (event) => {
      if (!piece.movable || event.button !== 0) {
        return;
      }
      event.preventDefault();
      dragStarted = false;
      startX = event.clientX;
      startY = event.clientY;
      const rect = piece.getBoundingClientRect();
      grabOffsetX = event.clientX - rect.left;
      grabOffsetY = event.clientY - rect.top;
      piece.setPointerCapture(event.pointerId);
    });

    piece.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    piece.addEventListener("pointermove", (event) => {
      if (!piece.hasPointerCapture(event.pointerId)) {
        return;
      }
      const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
      if (!dragStarted && distance > 6) {
        dragStarted = true;
        board.pieceClick({ target: piece });
        piece.classList.add("dragging");

        const rect = piece.getBoundingClientRect();
        dragPreview = piece.cloneNode(false);
        dragPreview.removeAttribute("id");
        dragPreview.classList.add("drag-preview");
        dragPreview.style.width = rect.width + "px";
        dragPreview.style.height = rect.height + "px";
        dragPreview.style.left = event.clientX - grabOffsetX + "px";
        dragPreview.style.top = event.clientY - grabOffsetY + "px";
        document.body.appendChild(dragPreview);
      }
      if (dragStarted) {
        const targetSquare = updateDropTarget(event.clientX, event.clientY);
        if (targetSquare) {
          const targetRect = targetSquare.getBoundingClientRect();
          dragPreview.style.left =
            targetRect.left +
            (targetRect.width - dragPreview.offsetWidth) / 2 +
            "px";
          dragPreview.style.top =
            targetRect.top +
            (targetRect.height - dragPreview.offsetHeight) / 2 +
            "px";
        } else {
          dragPreview.style.left = event.clientX - grabOffsetX + "px";
          dragPreview.style.top = event.clientY - grabOffsetY + "px";
        }
      }
    });

    piece.addEventListener("pointerup", (event) => {
      if (!piece.hasPointerCapture(event.pointerId)) {
        return;
      }
      piece.releasePointerCapture(event.pointerId);

      if (!dragStarted) {
        return;
      }

      const snappedSquare = findDropTarget(event.clientX, event.clientY);
      removeDragPreview();

      // Ignore the synthetic click generated after a drag.
      piece.suppressClick = true;
      setTimeout(() => {
        piece.suppressClick = false;
      }, 100);

      const target = document.elementFromPoint(event.clientX, event.clientY);
      let square = snappedSquare || (target ? target.closest(".square") : null);
      if (square && !square.classList.contains("possible")) {
        const capture = board.takeIt
          .filter(
            (item) =>
              item[0] === piece &&
              item[1] === Number(square.id)
          )
          .sort((first, second) =>
            Math.abs(first[2] - first[1]) - Math.abs(second[2] - second[1])
          )[0];
        if (capture) {
          square = document.getElementById(capture[2]);
        }
      }
      if (square && square.classList.contains("possible")) {
        board.movePiece({ target: square });
      }
      dragStarted = false;
    });

    piece.addEventListener("pointercancel", () => {
      removeDragPreview();
      dragStarted = false;
    });
  }
}

// Piece class to create pieces
class Piece {
  constructor(color) {
    this.color = color;
    this.piece = document.createElement("div");
    this.piece.className = "piece";
    this.piece.classList.add("piece-" + color);
  }
  // create a new piece
  get_piece(id) {
    this.piece.id = id;
    board.setupPieceDrag(this.piece);
    return this.piece;
  }
}

// Menu class
class Menu {
  /* Menu class to create the menu and the buttons */

  createMenu() {
    /* Create menu */
    document.querySelectorAll(".menu-hidden").forEach((button) => {
      button.remove();
    });
    const menu = document.createElement("div");
    menu.id = "menu";
    menu.classList.add("menu");
    if (board.isPlaying) {
      menu.classList.add("is-playing");
      menu.innerHTML = `
        <button id="close-menu" type="button" aria-label="${board.translate("back")}"><span aria-hidden="true">&times;</span></button>
        <div class="menu-title">${board.translate("menu")}</div>
        <button class="menu-item menu-action" id="restart-game" type="button">${board.translate(
          "restartGame"
        )}</button>
        <button class="menu-item menu-action" id="rules" type="button">${board.translate(
          "rules"
        )}</button>
        <button class="menu-item menu-action" id="results" type="button">${board.translate(
          "results"
        )}</button>`;
    } else {
      menu.classList.add("menu-main");
      menu.innerHTML = `
        <div class="menu-title">${board.translate("playMode")}</div>
        <button class="menu-item menu-action" id="vs-computer" type="button">${board.translate(
          "vsComputer"
        )}</button>
        <button class="menu-item menu-action" id="vs-local" type="button" disabled>${board.translate(
          "vsLocal"
        )}</button>
        <button class="menu-item menu-action" id="vs-online" type="button" disabled>${board.translate(
          "vsOnline"
        )}</button>
        <div class="menu-divider"></div>
        <div class="menu-footer">
          <button class="menu-footer-button" id="options" type="button">${board.translate(
            "options"
          )}</button>
          <button class="menu-footer-button" id="rules" type="button">${board.translate(
            "rules"
          )}</button>
          <button class="menu-footer-button" id="results" type="button">${board.translate(
            "results"
          )}</button>
        </div>`;
    }
    board.game.appendChild(menu);

    const closeButton = document.getElementById("close-menu");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.closeMenu());
    }
    const restartButton = document.getElementById("restart-game");
    if (restartButton) {
      restartButton.addEventListener("click", () => location.reload());
    }
    const computerButton = document.getElementById("vs-computer");
    if (computerButton) {
      computerButton.addEventListener("click", () => {
        board.playSound("menu");
        this.setupComputerGame();
      });
    }
    const optionsButton = document.getElementById("options");
    if (optionsButton) {
      optionsButton.addEventListener("click", () => {
        board.playSound("menu");
        this.options();
      });
    }
    document.getElementById("rules").addEventListener("click", () => {
      board.playSound("menu");
      this.rules();
    });
    document.getElementById("results").addEventListener("click", () => {
      board.playSound("menu");
      this.results();
    });
  }

  setupComputerGame() {
    const menu = document.getElementById("menu");
    menu.classList.remove("menu-main");
    menu.classList.add("menu-setup");
    menu.innerHTML = `
      <div class="menu-title">${board.translate("computerSettings")}</div>
      <div class="setup-control" id="player-color-control">
        <label class="submenu" for="player-color-select">${board.translate(
          "playerColor"
        )}</label>
        <select id="player-color-select">
          <option value="white" ${
            board.playerColor === "piece-white" ? "selected" : ""
          }>${board.translate("white")}</option>
          <option value="black" ${
            board.playerColor === "piece-black" ? "selected" : ""
          }>${board.translate("black")}</option>
        </select>
      </div>
      <div class="setup-control" id="difficulty-control">
        <label class="submenu" for="difficulty-select">${board.translate(
          "difficulty"
        )}</label>
        <select id="difficulty-select">
          <option value="easy" ${
            board.difficulty === "easy" ? "selected" : ""
          }>${board.translate("easy")}</option>
          <option value="medium" ${
            board.difficulty === "medium" ? "selected" : ""
          }>${board.translate("medium")}</option>
          <option value="hard" ${
            board.difficulty === "hard" ? "selected" : ""
          }>${board.translate("hard")}</option>
        </select>
      </div>
      <div class="setup-control" id="ruleset-control">
        <label class="submenu" for="ruleset-select">${board.translate(
          "ruleset"
        )}</label>
        <select id="ruleset-select">
          <option value="international" ${
            board.ruleset === "international" ? "selected" : ""
          }>${board.translate("internationalDraughts")}</option>
          <option value="british" ${
            board.ruleset === "british" ? "selected" : ""
          }>${board.translate("britishDraughts")}</option>
        </select>
      </div>
      <button class="menu-item menu-action start-button" id="start-computer" type="button">${board.translate(
        "startGame"
      )}</button>
      <button class="submenu setup-back" id="setup-back" type="button">${board.translate(
        "back"
      )}</button>`;

    document.getElementById("difficulty-select").addEventListener("change", (event) => {
      board.setDifficulty(event.target.value);
    });
    document.getElementById("ruleset-select").addEventListener("change", (event) => {
      board.setRuleset(event.target.value);
    });
    document.getElementById("start-computer").addEventListener("click", () => {
      board.playSound("menu");
      board.setPlayerColor(
        document.getElementById("player-color-select").value
      );
      board.startGame();
      board.isPlaying = true;
      board.menuIsOpen = false;
      this.hiddenMenu();
    });
    document.getElementById("setup-back").addEventListener("click", () => {
      board.playSound("menu");
      this.clearMenu();
      this.createMenu();
    });
  }

  closeMenu() {
    if (!board.isPlaying) {
      return;
    }
    board.playSound("menu");
    this.hiddenMenu();
    board.menuIsOpen = false;
  }

  //Hidden menu method
  hiddenMenu() {
    if (!board.isPlaying) {
      return;
    }
    const smallMenu = document.createElement("button");
    smallMenu.type = "button";
    smallMenu.setAttribute("aria-label", board.translate("menu"));
    smallMenu.setAttribute("title", board.translate("menu"));
    smallMenu.classList.add("menu-hidden");
    board.game.appendChild(smallMenu);
    board.game.removeChild(document.getElementById("menu"));
    smallMenu.innerHTML = `<i class="fa fa-cog" aria-hidden="true"></i>`;

    smallMenu.addEventListener("click", () => {
      board.playSound("menu");
      if (!board.menuIsOpen) {
        this.createMenu();
        board.menuIsOpen = true;
      } else if (board.menuIsOpen) {
        this.hiddenMenu();
        board.menuIsOpen = false;
      }
    });
  }

  // Menu options
  options() {
    const menu = document.getElementById("menu");
    menu.classList.add("menu-options");
    menu.innerHTML = `
      <button id="close-menu" type="button" aria-label="${board.translate("back")}"><span aria-hidden="true">&times;</span></button>
      <div class="menu-title">${board.translate("options")}</div>
      <div class="submenu" id="highlight">
        <span>${board.translate("forcedHighlight")}</span>
        <label class="switch" id="highlight-switch">
          <input type="checkbox" ${board.optionHighlight ? "checked" : ""}>
          <span class="slider round"></span>
        </label>
      </div>
      <div id="language-control">
        <label class="submenu" for="language-select">${board.translate(
          "language"
        )}</label>
        <select id="language-select">
          <option value="en" ${
            board.language === "en" ? "selected" : ""
          }>English</option>
          <option value="fr" ${
            board.language === "fr" ? "selected" : ""
          }>Français</option>
        </select>
      </div>
      <button class="submenu setup-back" id="back" type="button">${board.translate(
        "back"
      )}</button>`;

    document.getElementById("highlight-switch").addEventListener("change", () => {
      board.optionHighlight = !board.optionHighlight;
      board.playSound("menu");
    });
    document.getElementById("language-select").addEventListener("change", (event) => {
      board.setLanguage(event.target.value);
      this.options();
    });
    document.getElementById("close-menu").addEventListener("click", () => {
      this.closeMenu();
    });
    document.getElementById("back").addEventListener("click", () => {
      board.playSound("menu");
      this.clearMenu();
      this.createMenu();
    });
  }
  // Menu rules
  rules() {
    const menu = document.getElementById("menu");
    menu.classList.add("menu-rules");
    menu.innerHTML = `
    <button id="close-menu" type="button" aria-label="${board.translate("back")}"><span aria-hidden="true">&times;</span></button>
    <div class="menu-item new-page" id="options">${board.translate("rules")}</div>
    <p class="text-g">${board.translate("simpleMove")}</p>
    <p>${board.translate("simpleMoveText")}</p>
    <p class="text-g">${board.translate("jump")}</p>
    <p>${board.translate("jumpText")}</p>
    <p class="text-g">${board.translate("king")}</p>
    <p>${board.translate(
      board.ruleset === "international" ? "internationalKingText" : "britishKingText"
    )}</p>
    <p class="text-g">${board.translate("endOfGame")}</p>
    <p>${board.translate("endOfGameText")}</p>
    <button class="submenu" id="rules-back" type="button" aria-label="${board.translate("back")}"><span aria-hidden="true">&#9664;</span></button>`;

    // add event listeners
    document.getElementById("close-menu").addEventListener("click", () => {
      this.closeMenu();
    });

    document.getElementById("rules-back").addEventListener("click", () => {
      board.playSound("menu");
      this.clearMenu();
      this.createMenu();
    });
  }

  // Menu results
  results() {
    const menu = document.getElementById("menu");
    menu.classList.add("menu");
    menu.innerHTML = `
    <button id="close-menu" type="button" aria-label="${board.translate("back")}"><span aria-hidden="true">&times;</span></button>
    <div class="menu-item new-page" id="results">${board.translate("results")}</div>`;
    // add scores
    const plyerScore = storage.get("whiteScore", "0");
    const computerScore = storage.get("blackScore", "0");
    menu.innerHTML += `<p class="submenu results-menu" id="player-score">${board.translate(
      "player"
    )}  ${plyerScore}</p>`;
    menu.innerHTML += `<p class="submenu results-menu" id="computer-score">${board.translate(
      "computer"
    )}  ${computerScore}</p>`;
    menu.innerHTML += `<button class="submenu results-menu" id="reset-score" type="button">${board.translate(
      "resetScore"
    )}</button>`;
    menu.innerHTML += `<button class="submenu results-menu" id="rules-back" type="button" aria-label="${board.translate("back")}"><span aria-hidden="true">&#9664;</span></button>`;
    // add event listeners
    document.getElementById("close-menu").addEventListener("click", () => {
      this.closeMenu();
    });

    document.getElementById("rules-back").addEventListener("click", () => {
      board.playSound("menu");
      this.clearMenu();
      this.createMenu();
    });

    document.getElementById("reset-score").addEventListener("click", () => {
      board.playSound("menu");
      storage.set("whiteScore", 0);
      storage.set("blackScore", 0);
      document.getElementById("player-score").textContent = `${board.translate(
        "player"
      )} 0`;
      document.getElementById("computer-score").textContent = `${board.translate(
        "computer"
      )} 0`;
    });
  }

  clearMenu() {
    const game = document.getElementById("menu");
    game.remove();
  }
}

// Game menu
const board = new Board();
const menu = new Menu();
menu.createMenu();
document.addEventListener("click", (event) => {
  if (!board.isPlaying || !board.menuIsOpen) {
    return;
  }
  const openMenu = document.getElementById("menu");
  if (
    !openMenu ||
    openMenu.contains(event.target) ||
    event.target.closest(".menu-hidden") ||
    event.target.closest("#sound-toggle") ||
    event.target.closest("#fullscreen-toggle")
  ) {
    return;
  }
  menu.closeMenu();
}, true);
