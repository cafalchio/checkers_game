
function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}


class Piece {
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

// represent the board

let b = ['01010101', '10101010', '01010101', '00000000', '00000000', '10101010', '01010101', '10101010']



class Board {

  createBoard() {
    this.createHTMLSquares();
    this.createPieces();
  }

  createPieces() {
    const blackPieces = [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23];
    const whitePieces = [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62];
    const squares = document.querySelectorAll(".square");
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

  createHTMLSquares() {
    let game_html = document.getElementById("game");
    let color = "white";
    for (let i = 0; i < 64; i++) {
      color = color == "black" ? "white" : "black";
      if (i % 8 == 0) {
        color = color == "black" ? "white" : "black";
      }
      const newDiv = document.createElement("div");
      newDiv.className = "square";
      newDiv.classList.add(color);
      newDiv.id = i;
      newDiv.setAttribute("occupied", "false");
      game_html.appendChild(newDiv);
    }
  }

  getState() {
    return this.state;
  }

  updateUi() {
    return None;
  }

}





class Game {
  constructor() {
    this.playing = false;
    this.board = new Board();
  }

  start() {
    this.playing = true;
    this.board.createBoard();
  }

}

game = new Game();
game.start();