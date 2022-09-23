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
      this.game.appendChild(newDiv);

      // Create initial pieces
      // if ((i != 3) & (i != 4)) {
      //   if ((i % 2 == 0) & (j % 2 != 0) & (i < 3)) {
      //     span.classList.add("wPiece");
      //   } else if ((i % 2 != 0) & (j % 2 == 0) & (i < 3)) {
      //     span.classList.add("wPiece");
      //   } else if ((i % 2 == 0) & (j % 2 != 0) & (i > 4)) {
      //     span.classList.add("bPiece");
      //   } else if ((i % 2 != 0) & (j % 2 == 0) & (i > 4)) {
      //     span.classList.add("bPiece");
      //   }
      // }
    } // end for
  } // end constructor

  getPosition() {
    // for this.game.ele
  }

  updateMove() {}

  isOver() {}
}

// create board
const board = new Board();
board.getPosition();
