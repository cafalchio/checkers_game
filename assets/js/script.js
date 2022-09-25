class Board {
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
      // newDiv.innerText = newDiv.id;
      this.game.appendChild(newDiv);
    }
  }

  startGame() {
    // start place for pieces
    const blackPieces = [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23];
    const whitePieces = [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62];
    const squares = document.querySelectorAll(".square");

    // dragstarted event
    document.addEventListener("dragstart", (e) => {
      e.target.classList.add("dragging");
      const possibleTarget = this.checkPossibleTarget(e.target.id);
      e.dataTransfer.setData("targets", possibleTarget);
      console.log(possibleTarget);
    });
    // dragended event
    document.addEventListener("dragend", (e) => {
      e.target.classList.remove("dragging");
      const data = e.dataTransfer.getData("targets");
      let possibleTarget = data.split(",");
      let targets = possibleTarget.map((item) => parseInt(item));
      if (targets.includes(e.target.id)) {
        console.log("ok");
      }
    });
    // create pieces
    for (let i = 0; i < 64; i++) {
      const bPiece = new Piece("black");
      const wPiece = new Piece("white");
      if (blackPieces.includes(i)) {
        squares[i].appendChild(bPiece.get_piece(100 + i));
      }
      if (whitePieces.includes(i)) {
        squares[i].appendChild(wPiece.get_piece(200 + i));
      }
      // add event listeners
      squares[i].addEventListener("dragover", (e) => {
        const dragging = document.querySelector(".dragging");
        // const applyAfter = this.movedPiece(squares[i]);
        // console.log("dragover " + e.target.id);
      });
    }
  }
  // Method to check possible targets
  checkPossibleTarget(id) {
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
    for (let i = 0; i < possibleTargets.length; i++) {
      if (possibleTargets[i] < 0 || possibleTargets[i] > 63) {
        possibleTargets.splice(i, 1);
      } else {
        if (squares[possibleTargets[i]].hasChildNodes()) {
          possibleTargets.splice(i, 1);
        }
      }
    }
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
}

// create board
const board = new Board();
board.startGame();
