//Board class that create and command the game
/*jshint esversion: 6 */
class Board {
  // Method to create the board
  constructor() {
    this.game = document.getElementById("game");
    this.colorPlay = "piece-white";
    this.whiteKing = false;
    this.blackKing = false;
    this.needTake = []; // save pieces that need to take
    // takeIt info to take a piece: actualPieceId, enemySquareId, opositeSquareId
    this.takeIt = [];
    this.pieceTaking = null; //keeps the piece that is taking
    this.moveSound = new Audio("assets/audio/move.mp3");
    this.takeSound = new Audio("assets/audio/capture.mp3");
    this.menu = new Audio("assets/audio/menu.mp3");
    this.turn = 0;
    this.optionHighlight = true;
    this.optionSound = true;
    this.menuIsOpen = true;
    this.isPlaying = false;

    // prepare for score saving
    if (localStorage.getItem("whiteScore") == null) {
      localStorage.setItem("whiteScore", "0");
    }
    if (localStorage.getItem("blackScore") == null) {
      localStorage.setItem("blackScore", "0");
    }

    // create squares
    let color = "white";
    for (let i = 0; i < 64; i++) {
      color = color == "black" ? "white" : "black";
      if (i % 8 == 0) {
        color = color == "black" ? "white" : "black"; // invert the color to the next row
      }
      const newDiv = document.createElement("div");
      newDiv.className = "square";
      newDiv.classList.add(color);
      newDiv.id = i;
      newDiv.setAttribute("occupied", "false");
      this.game.appendChild(newDiv);
    }
  }
  // Method to start the game
  startGame() {
    /* Start the game*/
    this.createPieces();
    this.removeMoving();
    this.gameControl();
  }

  // Method to control the game turns
  gameControl() {
    /* Method to control the game turns*/
    this.turn += 1;
    if (this.colorPlay == "piece-white") {
      const message = document.getElementById("messages");
      message.innerHTML = "White's turn";
      // check if white pieces can take
      // freeze black pieces
      let blackPieces = document.querySelectorAll(".piece-black");
      blackPieces.forEach((item) => {
        item.movable = false;
        item.addEventListener("click", this.pieceClick);
      });
      this.promoteToKing(blackPieces);
      setTimeout(() => {
        this.checkWinner();
      }, 1000);

      // check if white pieces can take
      let whitePieces = document.querySelectorAll(".piece-white");
      if (!this.checkIfcanTake(whitePieces)) {
        // unfreeze white pieces
        whitePieces.forEach((item) => {
          item.movable = true;
          item.addEventListener("click", this.pieceClick);
          this.checkpossibleMove(item);
        });
      }
    } else if (this.colorPlay == "piece-black") {
      const message = document.getElementById("messages");
      message.innerHTML = "";
      // remove highlight from white pieces
      let highlightPieces = document.querySelectorAll(".highlight");
      highlightPieces.forEach((item) => {
        item.classList.remove("highlight");
      });

      //freeze white pieces
      const whitePieces = document.querySelectorAll(".piece-white");
      whitePieces.forEach((item) => {
        item.movable = false;
      });
      this.promoteToKing(whitePieces);
      setTimeout(() => {
        this.checkWinner();
      }, 1000);
      const blackPieces = document.querySelectorAll(".piece-black");
      blackPieces.forEach((item) => {
        item.movable = false;
        this.checkpossibleMove(item);
      });
      //random to computer move, sound more
      let timeMove = Math.random() * 2000 + 1200;
      setTimeout(board.computerMove, timeMove);
    }
    board.pieceTaking = null;
  }

  // Method to create pieces
  createPieces() {
    /* Create the pieces on the board*/
    const blackPieces = [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23];
    const whitePieces = [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62];
    // get squares
    const squares = document.querySelectorAll(".square");
    // create pieces
    for (let i = 0; i < 64; i++) {
      const bPiece = new Piece("black");
      const wPiece = new Piece("white");
      if (blackPieces.includes(i)) {
        squares[i].appendChild(bPiece.get_piece(100 + i));
        squares[i].setAttribute("occupied", "true");
      }
      if (whitePieces.includes(i)) {
        squares[i].appendChild(wPiece.get_piece(200 + i));
        squares[i].setAttribute("occupied", "true");
      }
    }
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

    if (e.target.classList[2] == "possible") {
      board.playSound("move");
      const piece = document.querySelector(".moving");
      const square = document.getElementById(e.target.id);
      const oldSquare = document.getElementById(piece.parentNode.id);
      // move piece
      square.appendChild(piece);
      // check if took piece
      if (board.takeIt.length > 0) {
        for (let i = 0; i < board.takeIt.length; i++) {
          let item = board.takeIt[i];
          const movPiece = item[0];
          const enemySquareId = item[1];
          const opositeSquare = document.getElementById(item[2]);
          if (movPiece == piece && opositeSquare == square) {
            board.playSound("take");
            // remove enemy piece
            const enemySquare = document.getElementById(enemySquareId);
            // add piece board score
            let whiteCapture = document.getElementById("removedw");
            const outPiece = enemySquare.firstChild;
            outPiece.classList.remove("piece-black");
            outPiece.classList.add("piece-out-black");
            whiteCapture.appendChild(outPiece);
            // remove from board
            enemySquare.innerHTML = "";
            enemySquare.setAttribute("occupied", "false");
            // check if can take again
            board.takeIt = [];
            board.needTake = [];
            //get white pieces
            if (board.checkIfcanTake([piece])) {
              board.needTake = [];
              board.takeIt = [];
              // player can take again
              board.invertPlayerTurn();
              break;
            }
          }
        }
      }
      piece.classList.remove("moving");
      // remove possible class
      const dragSquares = document.querySelectorAll(".possible");
      dragSquares.forEach((item) => {
        item.classList.remove("possible");
      });
      // remove occupied from old square
      oldSquare.setAttribute("occupied", "false");
      square.setAttribute("occupied", "true");
      board.invertPlayerTurn();
      this.pieceTaking = null;
      board.gameControl();
    }
  }

  // Method to move the black piece automatically and take if possible
  computerMove() {
    /* Method to move the black piece automatically and take if possible*/
    board.takeIt = [];
    board.needTake = [];
    let whiteCounter = 0;
    // get all black pieces
    const blackPieces = document.querySelectorAll(".piece-black");
    // check if black pieces can take
    if (board.checkIfcanTake(blackPieces)) {
      while (board.checkIfcanTake(blackPieces) || whiteCounter > 5) {
        // take a piece
        board.takePiece();
        board.takeIt = [];
        board.needTake = [];
        whiteCounter++;
      }
    } else {
      // move a piece
      board.moveComputerPiece();
    }
    this.pieceTaking = null;
    board.invertPlayerTurn();
    board.gameControl();
  }

  // take a piece
  takePiece() {
    /* Method to take a piece */
    let group;
    let piece;
    let enemySquare;
    let oppositeSquare;
    // if it is retaking
    if (board.pieceTaking != null) {
      for (let i = 0; i < board.takeIt.length; i++) {
        group = board.takeIt[i];
        if (group[0] == this.pieceTaking) {
          board.playSound("take");
          piece = group[0];
          enemySquare = document.getElementById(group[1]);
          oppositeSquare = document.getElementById(group[2]);
          piece.parentNode.innerHTML = "";
          oppositeSquare.appendChild(piece);
          // add piece to removed
          let blackCapture = document.getElementById("removedb");
          const outPiece = enemySquare.firstChild;
          outPiece.classList.remove("piece-white");
          outPiece.classList.add("piece-out-white");
          blackCapture.appendChild(outPiece);
          // remove from board
          enemySquare.innerHTML = "";
          enemySquare.setAttribute("occupied", "false");
          oppositeSquare.setAttribute("occupied", "true");
          return true;
        }
      }
    } else {
      // if it is the first time
      for (let i = 0; i < board.takeIt.length; i++) {
        board.playSound("take");
        group = board.takeIt[i];
        piece = group[0];
        this.pieceTaking = piece;
        enemySquare = document.getElementById(group[1]);
        oppositeSquare = document.getElementById(group[2]);
        // add piece to removed
        let blackCapture = document.getElementById("removedb");
        const outPiece = enemySquare.firstChild;
        outPiece.classList.remove("piece-white");
        outPiece.classList.add("piece-out-white");
        blackCapture.appendChild(outPiece);
        // move the piece
        piece.parentNode.innerHTML = "";
        oppositeSquare.appendChild(piece);
        enemySquare.innerHTML = "";
        enemySquare.setAttribute("occupied", "false");
        oppositeSquare.setAttribute("occupied", "true");
        return true;
      }
    }
  }

  // Method to move a piece
  moveComputerPiece() {
    /* Method to move a piece */
    let allMoves = {};
    let tempId = -1;
    let tempMoves = [];
    const blackPieces = document.querySelectorAll(".piece-black");
    // check pieces that can move
    blackPieces.forEach((item) => {
      board.playSound("move");
      tempMoves = this.checkpossibleMove(item);
      if (tempMoves.length > 0) {
        tempId = item.id;
        allMoves[tempId] = tempMoves;
      }
    });
    const keys = Object.keys(allMoves);
    const pieceId = keys[Math.floor(Math.random() * keys.length)]; //random piece
    let possibleMoves = allMoves[pieceId];
    const piece = document.getElementById(pieceId);
    const pieceSquare = piece.parentNode;
    // move the piece
    const toSquareId = possibleMoves[0];
    const toSquare = document.getElementById(toSquareId);
    toSquare.appendChild(piece);
    toSquare.setAttribute("occupied", "true");
    pieceSquare.setAttribute("occupied", "false");
    pieceSquare.innerHTML = "";
  }

  // Method to check if there is forced take for the pieces
  checkIfcanTake(pieces) {
    /* Check if any piece can take another
    Input (arr(obj)): Pieces

    Output (boolean): true if piece can take */

    this.needTake = [];
    pieces.forEach((item) => {
      this.checkpossibleMove(item);
    });
    if (this.needTake.length > 0) {
      this.needTake.forEach((item) => {
        item.movable = true;
        if (this.optionHighlight && item.classList.contains("piece-white")) {
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

  // Promote to king
  promoteToKing(pieces) {
    /* Change the piece to king if it reaches the end of the board
    Input (obj): Piece
    */

    pieces.forEach((item) => {
      if (item.classList.contains("piece-white") && item.parentNode.id < 8) {
        item.classList.add("white-king");
        item.isKing = true;
      } else if (
        item.classList.contains("piece-black") &&
        item.parentNode.id > 55
      ) {
        item.classList.add("black-king");
        item.isKing = true;
      }
    });
  }

  updateScore(color) {
    /* Update the score
    Input (str): Color of the piece
    */

    let score = localStorage.getItem(color + "Score");
    if (score == null) {
      score = 0;
    } else {
      score = parseInt(score) + 1;
      localStorage.setItem(color + "Score", String(score));
    }
  }

  // check winner
  checkWinner() {
    /* Check if there is a winner */
    let whitePiecesLeft = 0;
    let blackPiecesLeft = 0;

    // No pieces left
    const whitePieces = document.querySelectorAll(".piece-white");
    const blackPieces = document.querySelectorAll(".piece-black");
    whitePieces.forEach((item) => {
      whitePiecesLeft += this.checkpossibleMove(item).length;
    });
    blackPieces.forEach((item) => {
      blackPiecesLeft += this.checkpossibleMove(item).length;
    });

    if (whitePieces.length == 0) {
      alert("No pieces left, Black wins!");
      this.updateScore("black");
      location.reload();
      return -1;
    } else if (blackPieces.length == 0) {
      alert("Congratulations!!!!\n\nNo pieces left, White wins!");
      this.updateScore("white");
      location.reload();
      return -1;
    } else if (whitePiecesLeft == 0) {
      alert("No moves left, Black wins!");
      this.updateScore("black");
      location.reload();
      return -1;
    } else if (blackPiecesLeft == 0) {
      alert("Congratulations!!!!\n\nNo moves left, White wins!");
      this.updateScore("white");
      location.reload();
      return -1;
    }
  }

  // play sound
  playSound(soundType) {
    /* Play sound */
    if (this.optionSound) {
      if (soundType == "move") {
        this.moveSound.play();
      } else if (soundType == "take") {
        this.takeSound.play();
      } else if (soundType == "menu") {
        this.menu.play();
      } else if (soundType == "notify") {
        this.notify.play();
      }
    }
  }

  // invert Player turn
  invertPlayerTurn() {
    /* Invert the player turn */
    const colors = ["piece-white", "piece-black"];
    if (this.colorPlay == colors[0]) {
      this.colorPlay = colors[1];
    } else {
      this.colorPlay = colors[0];
    }
  }

  // Method to check possible targets
  checkpossibleMove(pieceToCheck = null) {
    /* This method will check the possible moves for the piece that is being moved
    and will return an array with the possible squares

    Inpunt: pieceToCheck = can be a piece or null, when null,
    the method will check the piece that is being moved

    Output: returns an array of possible squares or array of squares to take a piece
    or an empty array if there is no possible move.
    */

    let taking = [];
    // left corners
    const leftCorners = [8, 24, 40, 56];
    // right corners
    const rightCorners = [7, 23, 39, 55];
    // white top corners
    const whiteTopCorners = [1, 3, 5, 7];
    // black top corners
    const blackTopCorners = [56, 58, 60, 62];
    // get piece
    let movPiece = document.querySelector(".moving");
    if (pieceToCheck) {
      movPiece = pieceToCheck;
    }
    if (!movPiece) {
      return false;
    }
    // get piece color
    const pieceColor = movPiece.classList[1];
    // get piece id
    const pieceId = parseInt(movPiece.parentNode.id);
    // get piece position
    let possibleMoves = [];
    // check if is a isKing
    if (movPiece.isKing) {
      possibleMoves.push(pieceId - 9);
      possibleMoves.push(pieceId - 7);
      possibleMoves.push(pieceId + 7);
      possibleMoves.push(pieceId + 9);
      // check for borders for King
      if (leftCorners.includes(pieceId)) {
        possibleMoves = possibleMoves.filter((item) => item != pieceId - 9);
        possibleMoves = possibleMoves.filter((item) => item != pieceId + 7);
      }
      if (rightCorners.includes(pieceId)) {
        possibleMoves = possibleMoves.filter((item) => item != pieceId - 7);
        possibleMoves = possibleMoves.filter((item) => item != pieceId + 9);
      }
      if (whiteTopCorners.includes(pieceId)) {
        possibleMoves = possibleMoves.filter((item) => item != pieceId - 9);
        possibleMoves = possibleMoves.filter((item) => item != pieceId - 7);
      }
      if (blackTopCorners.includes(pieceId)) {
        possibleMoves = possibleMoves.filter((item) => item != pieceId + 7);
        possibleMoves = possibleMoves.filter((item) => item != pieceId + 9);
      }
    } else {
      switch (pieceColor) {
        case "piece-white":
          possibleMoves.push(pieceId - 9);
          possibleMoves.push(pieceId - 7);
          if (leftCorners.includes(pieceId)) {
            possibleMoves.shift();
          }
          if (rightCorners.includes(pieceId)) {
            possibleMoves.pop();
          }
          break;
        case "piece-black":
          possibleMoves.push(pieceId + 9);
          possibleMoves.push(pieceId + 7);
          if (leftCorners.includes(pieceId)) {
            possibleMoves.pop();
          }
          if (rightCorners.includes(pieceId)) {
            possibleMoves.shift();
          }
          break;
      }
    }
    // check for pieces on the way
    if (possibleMoves.length > 0 && possibleMoves != null) {
      for (let i = 0; i < possibleMoves.length + 1; i++) {
        const targetSquare = document.getElementById(possibleMoves[i]);
        try {
          if (targetSquare != null && targetSquare.hasChildNodes()) {
            // square has piece of same color
            if (targetSquare.firstChild.classList[1] == pieceColor) {
              // remove move
              possibleMoves.splice(i, 1);
              i--;
              // if square has piece of different color
            } else if (targetSquare.firstChild.classList[1] != pieceColor) {
              // check if the next square is occupied
              let targetSquare = this.canTake(possibleMoves[i], movPiece);
              if (targetSquare) {
                // send the square with the piece to take and the square to move to
                taking.push(targetSquare);
              }
              possibleMoves.splice(i, 1);
              i--;
            }
          }
        } catch (err) {
          continue;
        }
        // There is no position to go! (out of the board)
        if (possibleMoves[i] < 0 || possibleMoves[i] > 63) {
          possibleMoves.splice(i, 1);
          i--;
        }
      }
    }
    // check if there is nan
    if (possibleMoves.includes(NaN)) {
      return false;
    }
    // check if there is a taking
    if (taking.length > 0) {
      return taking;
    }
    return possibleMoves;
  }

  // Method to check if the piece can take another piece
  canTake(enemySquareId, pieceToCheck) {
    // define corners
    const corners = [1, 3, 5, 7, 8, 24, 40, 56, 58, 60, 62, 55, 39, 23];
    // check if the oposite square is occupied
    let movPiece = document.querySelector(".moving");
    if (pieceToCheck) {
      movPiece = pieceToCheck;
    }
    // test for different directions
    const piecePositionId = parseInt(movPiece.parentNode.id);
    // target piece position
    if (corners.includes(enemySquareId)) {
      return false;
    } else {
      let relation = enemySquareId - piecePositionId;
      let opositeSquareId = enemySquareId + relation;
      const opositeSquare = document.getElementById(opositeSquareId);
      if (opositeSquare.hasChildNodes()) {
        return false;
      } else {
        // movePiece : piece that need to move
        this.needTake.push(movPiece);
        // enemySquare : square with the piece to take
        this.takeIt.push([movPiece, enemySquareId, opositeSquareId]);
        return opositeSquareId;
      }
    }
  }
}

// Piece class to create pieces
class Piece {
  constructor(color) {
    this.color = color;
    this.isKing = false;
    this.piece = document.createElement("div");
    this.piece.className = "piece";
    this.piece.classList.add("piece-" + color);
  }
  // create a new piece
  get_piece(id) {
    this.piece.id = id;
    return this.piece;
  }
}

// Menu class
class Menu {
  /* Menu class to create the menu and the buttons */

  createMenu() {
    /* Create menu */
    const menu = document.createElement("div");
    menu.id = "menu";
    menu.classList.add("menu");
    menu.innerHTML = `<div id="close-menu"><i class="far fa-times-circle"></i></div>`;
    if (board.isPlaying) {
      menu.innerHTML += `<div class="menu-item" id="new-game">Reset Game!</div>`;
    } else {
      menu.innerHTML += `<div class="menu-item" id="new-game">Start Game!</div>`;
    }
    menu.innerHTML += `
        <div class="menu-item" id="options">Options</div>
        <div class="menu-item" id="rules">Rules</div>
        <div class="menu-item" id="results">Results</div>`;
    board.game.appendChild(menu);

    document.getElementById("close-menu").addEventListener("click", () => {
      board.playSound("menu");
      this.hiddenMenu();
      board.menuIsOpen = false;
    });
    document.getElementById("new-game").addEventListener("click", () => {
      board.playSound("menu");
      if (board.isPlaying == true) {
        this.hiddenMenu();
        location.reload();
      } else {
        board.startGame();
        board.isPlaying = true;
        board.menuIsOpen = false;
        this.hiddenMenu();
      }
    });
    document.getElementById("options").addEventListener("click", () => {
      board.playSound("menu");
      this.options();
    });
    document.getElementById("rules").addEventListener("click", () => {
      board.playSound("menu");
      this.rules();
    });
    document.getElementById("results").addEventListener("click", () => {
      board.playSound("menu");
      this.results();
    });
  }
  //Hidden menu method
  hiddenMenu() {
    const smallMenu = document.createElement("div");
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
    menu.innerHTML = `
    <div id="close-menu"><i class="far fa-times-circle"></i></div>
    <div class="menu-item" id="options">Options</div>
    `;
    if (board.optionSound) {
      menu.innerHTML += `<div class="submenu" id="sound"><span class="space">Sound On/Off</span>  
                        <label class="switch" id="sound-switch">
                        <input type="checkbox" checked>
                        <span class="slider round"></span>
                        </label></div>`;
    } else {
      menu.innerHTML += `<div class="submenu" id="sound"><span class="space">Sound On/Off</span>
                        <label class="switch" id="sound-switch">
                        <input type="checkbox">
                        <span class="slider round"></span>
                        </label></div>`;
    }
    if (board.optionHighlight) {
      menu.innerHTML += `<div class="submenu" id="highlight"><span class="space-s">Forced Highlight  </span>
                          <label class="switch" id="highlight-switch">
                          <input type="checkbox" checked>
                          <span class="slider round"></span>
                          </label></div>`;
    } else {
      menu.innerHTML += `<div class="submenu" id="highlight"><span class="space-s">Forced Highlight</span>
                          <label class="switch" id="highlight-switch">
                          <input type="checkbox">
                          <span class="slider round"></span>
                          </label></div>`;
    }
    menu.innerHTML += `<div class="submenu" id="back"><i class="fa fa-backward" aria-hidden="true"></i>
                       </div>`;

    //check if sound switch is off
    const switchSound = document.getElementById("sound-switch");
    switchSound.addEventListener("change", () => {
      if (board.optionSound) {
        board.optionSound = false;
      } else {
        board.optionSound = true;
      }
      board.playSound("menu");
    });

    const switchHighlight = document.getElementById("highlight-switch");
    switchHighlight.addEventListener("change", () => {
      board.playSound("menu");
      if (board.optionHighlight) {
        board.optionHighlight = false;
      } else {
        board.optionHighlight = true;
      }
    });

    // add event listeners
    document.getElementById("close-menu").addEventListener("click", () => {
      board.playSound("menu");
      this.hiddenMenu();
      board.menuIsOpen = false;
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
    <div id="close-menu"><i class="far fa-times-circle"></i></div>
    <div class="menu-item new-page" id="options">Rules</div>
    <p class="text-g">Simple move:</p> 
    <p>Moving a piece one square to the front, diagonally to an adjacent 
    unoccupied dark square.</p> 
    <p class="text-g">Jump (take an opponent piece):</p><p>Jumping over an opponent's piece, 
    to an empty square immediately to the opposite square (forward only).
    Jumping is always mandatory: if a player has the option to jump, they must take it. 
    If there are more pieces to be taken, they have to be taken.
    Multiple jumps are mandatory if they can be made.
    Multiple jumps are possible if, after one jump, another piece is immediately eligible to 
    be jumped by the moving piece, even if that jump is in a 
    different diagonal direction.
    Kings</p><p class="text-g">King:</p> 
    <p>If a piece moves into the last row, it gains the ability to move both forward and 
    backward. One square per turn.</p>
    <p class="text-g">End of game</p> 
    <p>A player wins by capturing all of the opponent's pieces or by leaving the opponent 
    with no legal move. 
    The game is a draw if neither side can force a win.
    A draw will also occur after 30 moves made just by jungs without piece taking.</p>
    <div class="submenu" id="rules-back"><i class="fa fa-backward" aria-hidden="true"></i></div>`;

    // add event listeners
    document.getElementById("close-menu").addEventListener("click", () => {
      board.playSound("menu");
      this.hiddenMenu();
      board.menuIsOpen = false;
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
    <div id="close-menu"><i class="far fa-times-circle"></i></div>
    <div class="menu-item new-page" id="results">Results</div>`;
    // add scores
    let plyerScore = localStorage.getItem("whiteScore");
    let computerScore = localStorage.getItem("blackScore");
    menu.innerHTML += `<p class="submenu results-menu" id="player-score">Player  ${plyerScore}</p>`;
    menu.innerHTML += `<p class="submenu results-menu" id="computer-score">Computer  ${computerScore}</p>`;
    menu.innerHTML += `<div class="submenu results-menu" id="reset-score">Reset Score</div>`;
    menu.innerHTML += `<div class="submenu results-menu" id="rules-back"><i class="fa fa-backward" aria-hidden="true"></i></div>`;
    // add event listeners
    document.getElementById("close-menu").addEventListener("click", () => {
      board.playSound("menu");
      this.hiddenMenu();
      board.menuIsOpen = false;
    });

    document.getElementById("rules-back").addEventListener("click", () => {
      board.playSound("menu");
      this.clearMenu();
      this.createMenu();
    });

    document.getElementById("reset-score").addEventListener("click", () => {
      board.playSound("menu");
      localStorage.setItem("whiteScore", 0);
      localStorage.setItem("blackScore", 0);
      document.getElementById("player-score").innerHTML = "Player 0";
      document.getElementById("computer-score").innerHTML = "Computer 0";
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
