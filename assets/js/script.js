class Board {
  // Method to create the board
  constructor() {
    // create board
    this.game = document.getElementById("game");
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

  // Method to add event listener
  addEventListeners() {
    // dragstarted event
    document.addEventListener("dragstart", (e) => {
      // avoid another element to be dragged over
      if (e.target.classList[0] == "piece") {
        console.log("dragstart");
        e.target.classList.add("dragging");
        const possibleTarget = this.checkPossibleTarget();
        if (possibleTarget.length > 0) {
          possibleTarget.forEach((item) => {
            const square = document.getElementById(item);
            square.classList.add("possible");
            // if (square.getAttribute("occupied") == "false") {
            //   // square.classList.add("possible");
            // }
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
      // avoid another element to be dragged over
      if (e.target.classList[0] == "piece") {
        e.preventDefault();
        let posibleSquares;
        posibleSquares = game.querySelectorAll(".possible");
        // get the square where the piece is adding dropId
        posibleSquares.forEach((item) => {
          item.addEventListener("dragover", () => {
            const movPiece = document.querySelector(".dragging");
            movPiece.setAttribute("dropId", item.id);
          });
          // On dragleave, remove the dropId attribute
          item.addEventListener("ondragleave", () => {
            const movPiece = document.querySelector(".dragging");
            movPiece.setAttribute("dropId", "false");
            posibleSquares.forEach((item) => {
              item.removeEventListener("dragover", () => {}); // remove the event listener
            });
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
            if (position.getAttribute("occupied") == "false") {
              position.appendChild(movPiece);
            }
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
    const leftCorners = [8, 16, 24, 32, 40, 48, 56];
    // right corners
    const rightCorners = [7, 15, 23, 31, 39, 47, 55, 63];
    // get piece
    const movPiece = document.querySelector(".dragging");
    // get piece color
    const pieceColor = movPiece.classList[1];
    // get piece id
    const pieceId = parseInt(movPiece.parentNode.id);
    // get piece position
    let possibleTargets = [];
    // check if is a Queen
    if (movPiece.isQueen) {
      possibleTargets.push(pieceId - 9);
      possibleTargets.push(pieceId - 7);
      possibleTargets.push(pieceId + 7);
      possibleTargets.push(pieceId + 9);
      // console.log("queen");
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
    console.log("before pieces " + possibleTargets);
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
              console.log("same color");
              possibleTargets.splice(i, 1);
              i--;
            } else if (targetSquare.firstChild.classList[1] != pieceColor) {
              // if square has piece of different color
              // check if the next square is occupied
              let target = this.canTake(possibleTargets[i]);
              if (target) {
                // deal with the taking later
                taking.push(target);
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
      console.log("taking");
      return taking;
    }
    return possibleTargets;
  }

  test() {
    console.log("test");
  }

  canTake(targetPieceId) {
    console.log("can take?");
    const corners = [
      1, 3, 5, 7, 8, 24, 40, 56, 23, 39, 55, 62, 60, 58, 56, 3, 5,
    ];
    // check if the oposite square is occupied
    const movPiece = document.querySelector(".dragging");
    // test for different directions
    const piecePositionId = parseInt(movPiece.parentNode.id);
    // target piece position
    if (corners.includes(targetPieceId)) {
      return false;
    } else {
      let relation = targetPieceId - piecePositionId;
      let opositeSquareId = targetPieceId + relation;
      const opositeSquare = document.getElementById(opositeSquareId);
      if (opositeSquare.hasChildNodes()) {
        return false;
      } else {
        return opositeSquareId;
      }
    }
  }
}

// Piece class
class Piece {
  constructor(color) {
    this.color = color;
    this.isQueen = false;
    this.isTaken = false;
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
