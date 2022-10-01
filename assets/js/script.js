class Board {
  // Method to create the board
  constructor() {
    this.game = document.getElementById("game");
    this.colorPlay = "piece-white";
    this.whiteKing = false;
    this.blackKing = false;
    this.needTake = [];
    this.takeIt = [];

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
      // newDiv.innerHTML = i; // for debug
      this.game.appendChild(newDiv);
    }
  }
  // Method to start the game
  startGame() {
    this.createPieces();
    this.addDragEndListener();
    // this.addEventListeners();
    this.gameControl();
  }

  // Method to control the game turns
  gameControl() {
    //////////////////////////////////////////////////////////////
    // White move
    //////////////////////////////////////////////////////////////
    console.log("White move");
    if (this.colorPlay == "piece-white") {
      // check if white pieces can take
      // freeze black pieces
      let blackPieces = document.querySelectorAll(".piece-black");
      blackPieces.forEach((item) => {
        item.draggable = false;
        item.addEventListener("click", this.pieceClick);
        this.checkpossibleMove(item);
      });
      // promote to king
      this.promoteToKing(blackPieces);
      // check if white pieces can take
      let whitePieces = document.querySelectorAll(".piece-white");
      if (!this.checkIfcanTake(whitePieces)) {
        // unfreeze white pieces
        whitePieces.forEach((item) => {
          item.draggable = true;
          item.addEventListener("click", this.pieceClick);
          this.checkpossibleMove(item);
        });
      }
      // set next move to black
      this.colorPlay = "piece-black";
    } else {
      ////////////////////////////////////////////////////////////
      // Black move
      ////////////////////////////////////////////////////////////
      console.log("Black move");
      //freeze white pieces
      const whitePieces = document.querySelectorAll(".piece-white");
      whitePieces.forEach((item) => {
        item.draggable = false;
        this.checkpossibleMove(item);
      });
      // check if white piece can be promoted
      this.promoteToKing(whitePieces);
      // deal with taking by freezing all except the ones that can take
      const blackPieces = document.querySelectorAll(".piece-black");
      if (!this.checkIfcanTake(blackPieces)) {
        // unfreeze black pieces
        this.needTake = [];
        blackPieces.forEach((item) => {
          item.draggable = true;
          this.checkpossibleMove(item);
        });
      }
      // set next move to white
      this.colorPlay = "piece-white";
    }
  }

  // Method to check if there is forced take for the pieces
  checkIfcanTake(pieces) {
    /* Check if a piece can take another
    Input (obj): Piece

    Output (boolean): true if piece can take */

    this.needTake = [];
    pieces.forEach((item) => {
      this.checkpossibleMove(item);
    });
    if (this.needTake.length > 0) {
      this.needTake.forEach((item) => {
        item.draggable = true;
      });
      // freeze the rest
      pieces.forEach((item) => {
        if (!this.needTake.includes(item)) {
          item.draggable = false;
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
      if (item.classList.contains("piece-white") & (item.parentNode.id < 8)) {
        item.classList.add("white-king");
        item.isKing = true;
      } else if (
        item.classList.contains("piece-black") &
        (item.parentNode.id > 55)
      ) {
        item.classList.add("black-king");
        item.isKing = true;
      }
    });
  }

  // check winner
  checkWinner() {
    /* Check if there is a winner */

    // No pieces left
    const whitePieces = document.querySelectorAll(".piece-white");
    const blackPieces = document.querySelectorAll(".piece-black");
    if (whitePieces.length == 0) {
      alert("No pieces left Black wins!");
      location.reload();
    } else if (blackPieces.length == 0) {
      alert("No pieces left White wins!");
      location.reload();
    }
    // No moves left
    if (!this.whiteKing) {
      if (!this.checkMovesLeftBlack()) {
        alert("No moves left White wins!");
        location.reload();
      }
    }
    if (!this.blackKing) {
      if (!this.checkMovesLeftWhite()) {
        alert("No moves left Black wins!");
        location.reload();
      }
    }
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
  addDragEndListener() {
    document.addEventListener("dragstart", (event) => {
      event.preventDefault();
      const oldPossibleMoves = document.querySelectorAll(".possible");
      if (oldPossibleMoves.length > 0) {
        oldPossibleMoves.forEach((item) => {
          item.classList.remove("possible");
        });
        console.log("removed old possible moves");
      }
    });
  }

  // Method to add click event listeners
  pieceClick(e) {
    /* Method to add click event listeners to the pieces*/
    e.preventDefault();
    console.log("click");
    const oldPossibleMoves = document.querySelectorAll(".possible");
    if (oldPossibleMoves.length > 0) {
      oldPossibleMoves.forEach((item) => {
        item.classList.remove("possible");
      });
      console.log("removed old possible moves");
    }
    if ((e.target.classList[0] == "piece") & e.target.draggable) {
      e.target.classList.add("dragging");
      // check for possible moves
      const possibleMove = board.checkpossibleMove(e.target);
      if (possibleMove.length > 0) {
        possibleMove.forEach((item) => {
          const square = document.getElementById(item);
          square.classList.add("possible");
          square.addEventListener("click", board.movePiece);
        });
      } else {
        e.target.classList.remove("dragging");
      }
    } else {
      return false;
    }
  }

  // add square click to possible squares
  movePiece(e) {
    if (e.target.classList[2] == "possible") {
      const piece = document.querySelector(".dragging");
      const square = document.getElementById(e.target.id);
      const oldSquare = document.getElementById(piece.parentNode.id);
      // move piece
      square.appendChild(piece);
      // check if took piece
      console.log(piece);
      if (board.takeIt.length > 0) {
        board.takeIt.forEach((item) => {
          const movPiece = item[0];
          const enemySquareId = item[1];
          const opositeSquare = document.getElementById(item[2]);
          if ((movPiece == piece) & (opositeSquare == square)) {
            // remove enemy piece
            const enemySquare = document.getElementById(enemySquareId);
            enemySquare.innerHTML = "";
            enemySquare.setAttribute("occupied", "false");
          }
        });
      }
      piece.classList.remove("dragging");
      // remove possible class
      const dragSquares = document.querySelectorAll(".possible");
      dragSquares.forEach((item) => {
        item.classList.remove("possible");
      });

      // remove occupied from old square
      oldSquare.setAttribute("occupied", "false");
      square.setAttribute("occupied", "true");
      console.log("piece moved from click");
      board.gameControl();
    }
  }

  // Method to check possible targets
  checkpossibleMove(pieceToCheck = null) {
    /* This method will check the possible moves for the piece that is being dragged
    and will return an array with the possible squares

    Inpunt: pieceToCheck = can be a piece or null, when null,
    the method will check the piece that is being dragged

    Output: array with the possible squares
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
    let movPiece = document.querySelector(".dragging");
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
    if ((possibleMoves.length > 0) & (possibleMoves != null)) {
      for (let i = 0; i < possibleMoves.length + 1; i++) {
        const targetSquare = document.getElementById(possibleMoves[i]);
        try {
          if ((targetSquare != null) & targetSquare.hasChildNodes()) {
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
    let movPiece = document.querySelector(".dragging");
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

// Piece class
class Piece {
  constructor(color) {
    this.color = color;
    this.isKing = false;
    this.piece = document.createElement("div");
    this.piece.className = "piece";
    this.piece.classList.add("piece-" + color);
    // this.piece.draggable = true;
  }
  // create a new piece
  get_piece(id) {
    this.piece.id = id;
    return this.piece;
  }
}

// create board
const board = new Board();
board.startGame();
