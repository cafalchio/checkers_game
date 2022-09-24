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
      // newDiv.setAttribute("ondrop", "drop(event)");
      // newDiv.setAttribute("ondragover", "allowDrop(event)");
      newDiv.addEventListener("dragover", dragOver);
      newDiv.addEventListener("dragenter", dragEnter);
      newDiv.addEventListener("dragleave", dragLeave);
      newDiv.addEventListener("drop", dragDrop);
      this.game.appendChild(newDiv);
    }
  }

  startGame() {
    const blackPieces = [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23];
    const whitePieces = [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62];
    // create pieces
    for (let i = 0; i < 64; i++) {
      const newPiece = new Piece("black");
      document.getElementById(blackPieces[i]).appendChild(newPiece.get_piece());
      const newPiece2 = new Piece("white");
      document
        .getElementById(whitePieces[i])
        .appendChild(newPiece2.get_piece());
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
    // make it draggable
    this.piece.addEventListener("dragstart", dragStart);
    this.piece.addEventListener("dragend", dragEnd);
  }
  // create a new piece
  get_piece() {
    return this.piece;
  }
}

// Drag and drop
function allowDrop(ev) {
  ev.preventDefault();
}
// create board
const board = new Board();
board.startGame();

// Drag Functions

function dragStart() {
  this.className += " hold";
  setTimeout(() => (this.className = "invisible"), 0);
}

function dragEnd() {
  this.className = "piece";
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  this.className += " hovered";
}

function dragLeave() {
  this.className = "square";
}

function dragDrop() {
  this.className = "square";
  this.append(piece);
}
