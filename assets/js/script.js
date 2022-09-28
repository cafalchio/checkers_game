class Board {
  // Method to create the board
  constructor() {
    // create board
    this.game = document.getElementById("game");
    this.whitePlay = true;
    this.blackPlay = false;
    this.whiteKing = false;
    this.blackKing = false;
    this.moved = false;
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
    // const blackPieces = document.querySelectorAll(".piece-black");
    // blackPieces.forEach((item) => {
    //   item.draggable = false;
    // });
    //   // wait for white movement
    //   this.waitForWhiteMovement();
    //   //block all white pieces
    // const whitePieces = document.querySelectorAll(".piece-white");
    // whitePieces.forEach((item) => {
    //   item.draggable = false;
    // });
    //   // wait for black movement
    //   this.waitForBlackMovement();

    // }
  }

  // wait for white movement
  waitForWhiteMovement() {
    this.moved = false;
    this.whitePlay = true;
    this.blackPlay = false;
    const whitePieces = document.querySelectorAll(".piece-white");
    whitePieces.forEach((item) => {
      item.draggable = true;
    });
    console.log("white");
    while (!this.moved) {
      if (this.whiteTime <= 0.0) {
        this.checkWinner();
      }
    }
  }

  // wait for black movement
  waitForBlackMovement() {
    this.moved = false;
    this.moved = false;
    this.whitePlay = false;
    this.blackPlay = true;
    const blackPieces = document.querySelectorAll(".piece-black");
    blackPieces.forEach((item) => {
      item.draggable = true;
    });
    while (!this.moved) {
      if (this.blackTime <= 0.0) {
        this.checkWinner();
      }
    }
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

  // check for moves left white
  checkMovesLeftWhite() {
    let moves = 0;
    const whitePieces = document.querySelectorAll(".piece-white");
    whitePieces.forEach((item) => {
      moves = moves + this.checkPossibleTarget(item).length;
    });
    if (moves > 0) {
      return true;
    } else {
      return false;
    }
  }

  // check for moves left black
  checkMovesLeftBlack() {
    let moves = 0;
    const blackPieces = document.querySelectorAll(".piece-black");
    blackPieces.forEach((item) => {
      moves = moves + this.checkPossibleTarget(item).length;
    });
    if (moves > 0) {
      return true;
    } else {
      return false;
    }
  }

  /////////////////////////////////////////////////

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

  // Method to add event listener
  addEventListeners() {
    // dragstarted event
    document.addEventListener("dragstart", (e) => {
      // avoid another element to be dragged over
      if (e.target.classList[0] == "piece") {
        e.target.classList.add("dragging");
        const possibleTarget = this.checkPossibleTarget();
        if (possibleTarget.length > 0) {
          possibleTarget.forEach((item) => {
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
                this.moved = true;
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
  checkPossibleTarget() {
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
    const movPiece = document.querySelector(".dragging");
    if (!movPiece) {
      return false;
    }
    // get piece color
    const pieceColor = movPiece.classList[1];
    // get piece id
    const pieceId = parseInt(movPiece.parentNode.id);
    // get piece position
    let possibleTargets = [];
    // check if is a isKing
    if (movPiece.isKing) {
      possibleTargets.push(pieceId - 9);
      possibleTargets.push(pieceId - 7);
      possibleTargets.push(pieceId + 7);
      possibleTargets.push(pieceId + 9);
      // check for borders for King
      if (leftCorners.includes(pieceId)) {
        possibleTargets = possibleTargets.filter((item) => item != pieceId - 9);
        possibleTargets = possibleTargets.filter((item) => item != pieceId + 7);
      }
      if (rightCorners.includes(pieceId)) {
        possibleTargets = possibleTargets.filter((item) => item != pieceId - 7);
        possibleTargets = possibleTargets.filter((item) => item != pieceId + 9);
      }
      if (whiteTopCorners.includes(pieceId)) {
        possibleTargets = possibleTargets.filter((item) => item != pieceId - 9);
        possibleTargets = possibleTargets.filter((item) => item != pieceId - 7);
      }
      if (blackTopCorners.includes(pieceId)) {
        possibleTargets = possibleTargets.filter((item) => item != pieceId + 7);
        possibleTargets = possibleTargets.filter((item) => item != pieceId + 9);
      }
    } else {
      switch (pieceColor) {
        case "piece-white":
          possibleTargets.push(pieceId - 9);
          possibleTargets.push(pieceId - 7);
          if (leftCorners.includes(pieceId)) {
            possibleTargets.shift(); // remove the first element
          }
          if (rightCorners.includes(pieceId)) {
            possibleTargets.pop(); // remove the last element
          }
          break;
        case "piece-black":
          possibleTargets.push(pieceId + 9);
          possibleTargets.push(pieceId + 7);
          if (leftCorners.includes(pieceId)) {
            possibleTargets.pop();
          }
          if (rightCorners.includes(pieceId)) {
            possibleTargets.shift();
          }
          break;
      }
    }
    // check for pieces on the way
    if ((possibleTargets.length > 0) & (possibleTargets != null)) {
      for (let i = 0; i < possibleTargets.length + 1; i++) {
        // try {
        const targetSquare = document.getElementById(possibleTargets[i]);
        try {
          if ((targetSquare != null) & targetSquare.hasChildNodes()) {
            // (targetSquare.getAttribute("occupied") == "true")
            // square has piece of same color
            if (targetSquare.firstChild.classList[1] == pieceColor) {
              possibleTargets.splice(i, 1);
              i--;
            } else if (targetSquare.firstChild.classList[1] != pieceColor) {
              // if square has piece of different color
              // check if the next square is occupied
              let target = this.canTake(possibleTargets[i]);
              if (target) {
                // send the square with the piece to take and the square to move to
                // taking.push((targetSquare, possibleTargets[i]));
                taking.push(possibleTargets[i]);
              }
              possibleTargets.splice(i, 1);
              i--;
            }
          }
        } catch (err) {
          continue;
        }
        // There is no position to go! (out of the board)
        if (possibleTargets[i] < 0 || possibleTargets[i] > 63) {
          possibleTargets.splice(i, 1);
          i--;
        }
      }
    }

    // check if there is nan
    if (possibleTargets.includes(NaN)) {
      return false;
    }
    // check if there is a taking
    if (taking.length > 0) {
      this.takePiece(taking);
      // possibleTargets = [];
      // for (let i = 0; i < taking.length; i++) {
      //   possibleTargets.push(taking[i][1]);
      // }
      // return taking;
    }
    return possibleTargets;
  }

  // Method to check if the piece can take another piece
  canTake(enemySquareId) {
    // define corners
    const corners = [1, 3, 5, 7, 8, 24, 40, 56, 58, 60, 62, 55, 39, 23];
    // check if the oposite square is occupied
    const movPiece = document.querySelector(".dragging");
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
        return opositeSquareId;
      }
    }
  }
  // // method to take a piece
  // takePiece(taking) {
  //   // get the piece to be taken
  //   let pieces = document.querySelectorAll(".piece");
  //   for (let i = 0; i < taking.length; i++) {

  //   pieces.forEach((piece) => {});
  // }
}

// Piece class
class Piece {
  constructor(color) {
    this.color = color;
    this.isKing = false;
    this.couldDie = false;
    this.hasEnemy = false;
    this.piece = document.createElement("div");
    this.piece.className = "piece";
    this.piece.classList.add("piece-" + color);
    this.piece.draggable = true;
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
