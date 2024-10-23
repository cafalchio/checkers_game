import { createPieces } from "./piece.js";
import Board from "./new_game.js";
import Menu from "./menu.js";
import { removeMoving, pieceClick } from "./utils.js";
import { promoteToKing } from "./piece.js";

export default class Game {
  constructor() {
    this.turn = 0;
    this.colorPlay = "piece-white";
    localStorage.setItem('sound', true);
    this.menuIsOpen = true;
    this.optionHighlight = true;
    this.game = document.getElementById("game");

  }

  start() {
    // Game menu
    const board = new Board();
    const menu = new Menu();
    this.gameControl(board);
    menu.createMenu();
    createPieces();
    removeMoving();
  }

  gameControl(board) {
    /* Method to control the game turns*/
    board.turn += 1;
    let whitePieces = document.querySelectorAll(".piece-white");
    let blackPieces = document.querySelectorAll(".piece-black");
    board.addClick(blackPieces);
    board.addClick(whitePieces);
    if (board.colorPlay == ".piece-white") {
      board.sendMessage("White's turn");
      board.freeze(blackPieces);
      promoteToKing(blackPieces);
      setTimeout(() => {
        console.log("Check winner")
        board.checkWinner();
      }, 1000);

      if (!board.checkIfcanTake(whitePieces)) {
        board.unfreeze(whitePieces);
        whitePieces.forEach((item) => {
          item.movable = true;
          console.log("white can move")
          item.addEventListener("click", pieceClick);
          board.checkpossibleMove(item);
        });
      }
    } else if (board.colorPlay == "piece-black") {
      board.sendMessage("");
      board.removeHighlight();
      board.freeze(whitePieces);
      promoteToKing(whitePieces);
      setTimeout(() => {
        board.checkWinner();
      }, 1000);
      board.freeze(blackPieces);
      board.checkpossibleMove(item);
      let timeMove = Math.random() * 2000 + 1200;
      setTimeout(board.computerMove, timeMove);
    }
    board.pieceTaking = null;
  }

  checkIfcanTake(pieces) {
    /* Check if any piece can take another
    Input (arr(obj)): Pieces
 
    Output (boolean): true if piece can take */

    this.needTake = [];
    pieces.forEach((item) => {
      this.checkpossibleMove(item);
    });
    if (this.needTake.length > 0) {
      this.needTake.forEach((item) => {
        item.movable = true;
        if (this.optionHighlight && item.classList.contains("piece-white")) {
          item.classList.add("highlight");
        }
      });
      // freeze the rest
      pieces.forEach((item) => {
        if (!this.needTake.includes(item)) {
          item.movable = false;
        }
      });
      return true;
    } else {
      return false;
    }
  }

}


