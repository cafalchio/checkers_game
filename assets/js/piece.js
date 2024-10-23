export default class Piece {
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

  export function createPieces() {
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

 export function promoteToKing(pieces) {

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
  
