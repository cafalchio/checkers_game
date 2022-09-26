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
      this.game.appendChild(newDiv);
    }
  }
  // Method to start the game
  startGame() {
    this.createPieces();
    this.addEventListener();
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
  addEventListener() {
    // dragstarted event
    document.addEventListener("dragstart", (e) => {
      e.target.classList.add("dragging");
      const possibleTarget = this.checkPossibleTarget();
      if (possibleTarget) {
        possibleTarget.forEach((item) => {
          const square = document.getElementById(item);
          // check if has piece
          console.log("add class " + square.getAttribute("occupied"));
          if (square.getAttribute("occupied") == "false") {
            square.classList.add("possible");
          }
        });
      } else {
        e.target.classList.remove("dragging");
      }
    });

    // dragover event
    document.addEventListener("dragover", (e) => {
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
    });
    // on dragend event
    document.addEventListener("dragend", (e) => {
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
          message.innerHTML = "Add sound / message";
        }
      }
      // remove the dragging class
      e.target.classList.remove("dragging");
      movPiece.setAttribute("dropId", "false");
      // remove the possible class
      posibleSquares.forEach((item) => {
        item.classList.remove("possible");
        console.log(item);
      });
    });
  }

  // Method to check possible targets
  checkPossibleTarget() {
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
    // get squares
    const squares = document.querySelectorAll(".square");
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
            possibleTargets.shift();
          }
          if (rightCorners.includes(pieceId)) {
            possibleTargets.pop();
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
    for (let i = 0; i < possibleTargets.length + 1; i++) {
      try {
        const target = possibleTargets[i];
        if (squares[target].getAttribute("occupied") == "true") {
          console.log("piece on the way");
          // square has piece of same color
          if (squares[target].firstChild.classList[1] == pieceColor) {
            console.log("same color");
            possibleTargets.splice(i, 1);
            i--;
          }
          // square has piece of different color
          if (squares[target].firstChild.classList[1] != pieceColor) {
            console.log("different color");
            possibleTargets.splice(i, 1);
            i--;
          }
        }
        // There is no position to go! (out of the board)
        if (target < 0 || target > 63) {
          const index = possibleTargets.indexOf(target);
          possibleTargets.splice(index, 1);
        }
      } catch (error) {
        console.log("error");
      }
    }
    // check if there is nan
    if (possibleTargets.includes(NaN)) {
      return false;
    }
    console.log(possibleTargets);
    return possibleTargets;
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
  touchStart() {}
  touchMove() {}
  touchEnd() {}
}

// create board
const board = new Board();
board.startGame();
