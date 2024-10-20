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


 export function promoteToKing(pieces) {
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
  