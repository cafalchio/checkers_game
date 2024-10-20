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

  