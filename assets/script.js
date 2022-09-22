lass Board {
  constructor() {
    // create board
    this.game = document.getElementById("game");
    let color = "black";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (j == 0) {
          //Create the div of the row
          let lastDiv = document.createElement("div");
          lastDiv.setAttribute("id", "" + i);
          // check if it is the first element
          if (this.game.lastElement) {
            this.game.lastElement.appendChild(lastDiv);
          } else {
            this.game.appendChild(lastDiv);
          }
        }
        // Create a span (next square)
        let span = document.createElement("span");
        color = color == "black" ? "white" : "black";
        span.className = color;
        span.setAttribute("id", "" + i + "" + j);
        this.game.lastElementChild.appendChild(span);
        // Create initial pieces
        if ((i != 3) & (i != 4)) {
          if ((i % 2 == 0) & (j % 2 != 0) & (i < 3)) {
            span.classList.add("wPiece");
          } else if ((i % 2 != 0) & (j % 2 == 0) & (i < 3)) {
            span.classList.add("wPiece");
          } else if ((i % 2 == 0) & (j % 2 != 0) & (i > 4)) {
            span.classList.add("bPiece");
          } else if ((i % 2 != 0) & (j % 2 == 0) & (i > 4)) {
            span.classList.add("bPiece");
          }
        }
      } // end for
      color = color == "black" ? "white" : "black"; // invert the color to the next row
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
