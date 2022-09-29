class Board {
  // Method to create the board
  constructor() {
    this.game = document.getElementById("game");
    this.whitePlay = true;
    this.whiteKing = false;
    this.blackKing = false;
    this.needTake = [];
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
    this.addEventListeners();
    this.gameControl();
  }

  // Method to control the game turns
  gameControl() {
    //////////////////////////////////////////////////////////////
    // White move
    //////////////////////////////////////////////////////////////

    if (this.whitePlay) {
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
      this.whitePlay = false;
    } else {
      ////////////////////////////////////////////////////////////
      // Black move
      ////////////////////////////////////////////////////////////
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
      this.whitePlay = true;
    }
  }

  // Method to check if there is forced take for the pieces
  checkIfcanTake(pieces) {
    this.needTake = [];
    pieces.forEach((item) => {
      this.checkpossibleMove(item);
    });
    if (this.needTake.length > 0) {
      this.needTake.forEach((item) => {
        item.draggable = true;
        // add click here to take
      });
      return true;
    } else {
      return false;
    }
  }

  // Promote to king
  promoteToKing(pieces) {
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
    // start place for pieces
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

  // Method to add click event listeners
  pieceClick(e) {
    e.preventDefault();
    if (e.target.draggable) {
      // avoid another element to be dragged over
      if (e.target.classList[0] == "piece") {
        e.target.classList.add("dragging");
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
  }

  // add square click to possible squares
  movePiece(e) {
    if (e.target.classList[2] == "possible") {
      const piece = document.querySelector(".dragging");
      const square = document.getElementById(e.target.id);
      const oldSquare = document.getElementById(piece.parentNode.id);
      // move piece
      square.appendChild(piece);
      piece.classList.remove("dragging");
      // remove possible class
      const dragSquares = document.querySelectorAll(".possible");
      dragSquares.forEach((item) => {
        item.classList.remove("possible");
      });
      // remove occupied from old square
      oldSquare.setAttribute("occupied", "false");
      square.setAttribute("occupied", "true");
      board.gameControl();
    }
  }

  // Method to add event listener
  addEventListeners() {
    // dragstarted event
    document.addEventListener("dragstart", (e) => {
      // avoid another element to be dragged over
      if (e.target.classList[0] == "piece") {
        e.target.classList.add("dragging");
        const possibleMove = this.checkpossibleMove();
        if (possibleMove.length > 0) {
          possibleMove.forEach((item) => {
            const square = document.getElementById(item);
            square.classList.add("possible");
          });
        } else {
          e.target.classList.remove("dragging");
        }
      } else {
        return false;
      }
    });

    // dragover event
    document.addEventListener("dragover", (e) => {
      e.preventDefault();
      // avoid another element to be dragged over
      if (e.target.classList[0] == "piece") {
        let posibleSquares;
        posibleSquares = game.querySelectorAll(".possible");
        // get the square where the piece is adding dropId
        posibleSquares.forEach((item) => {
          item.addEventListener("dragover", () => {
            const movPiece = document.querySelector(".dragging");
            if (!movPiece) {
              return false;
            }
            movPiece.setAttribute("dropId", item.id);
          });
        });
      } else {
        return false;
      }
    });

    // on dragend event
    document.addEventListener("dragend", (e) => {
      // avoid another element to be dragged over
      if (e.target.classList[0] == "piece") {
        e.preventDefault();
        let posibleSquares = game.querySelectorAll(".possible");
        // check if the piece is dropped in a possible square
        const movPiece = document.querySelector(".dragging");
        if (!movPiece) {
          return false;
        }
        if (
          (movPiece.getAttribute("dropId") != "false") &
          (posibleSquares.length > 0)
        ) {
          try {
            // set square occupied to false
            const parentId = movPiece.parentNode.id;
            document.getElementById(parentId).setAttribute("occupied", "false");
            // move the piece but check if the square is occupied
            const position = document.getElementById(
              movPiece.getAttribute("dropId")
            );

            posibleSquares.forEach((item) => {
              if (item.id == movPiece.getAttribute("dropId")) {
                position.appendChild(movPiece);
                position.setAttribute("occupied", "true");
                //change state of game
                this.gameControl();
              }
            });
            // set square occupied to true
            document
              .getElementById(movPiece.getAttribute("dropId"))
              .setAttribute("occupied", "true");
          } catch (error) {
            const message = document.getElementById("message");
            message.innerHTML = error;
          }
        }
        // remove the dragging class
        e.target.classList.remove("dragging");
        // remove the dropId attribute
        movPiece.setAttribute("dropId", "false");
        // remove the possible class
        posibleSquares.forEach((item) => {
          item.classList.remove("possible");
        });
      } else {
        return false;
      }
    });
  }

  // Method to check possible targets
  checkpossibleMove(pieceToCheck = null) {
    // will be used to check if the piece can take another piece
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
        // create a object to save piece to take and square to move to and piece to move
        this.needTake.push(movPiece);

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
    this.canMove = false;
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
