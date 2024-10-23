// Functions without home

// sounds
let optionSound = true;
const moveSound = new Audio("assets/audio/move.mp3");
const takeSound = new Audio("assets/audio/capture.mp3");
const menuSound = new Audio("assets/audio/menu.mp3");

export function playSound(soundType) {
  /* Play sound */
  const soundOption = localStorage.getItem("sound");
  if (soundOption == "true") {
    if (soundType == "move") {
      moveSound.play();
    } else if (soundType == "take") {
      takeSound.play();
    } else if (soundType == "menu") {
      menuSound.play();
    } else if (soundType == "notify") {
      notify.play();
    }
  }
}

export function pieceClick(e) {
    /* Method to add click event listeners to the pieces*/
    const moving = document.querySelectorAll(".moving");
    moving.forEach((item) => {
      item.classList.remove("moving");
    });
    const oldPossibleMoves = document.querySelectorAll(".possible");
    if (oldPossibleMoves.length > 0) {
      oldPossibleMoves.forEach((item) => {
        item.classList.remove("possible");
      });
    }
    if (e.target.classList[0] == "piece" && e.target.movable) {
      e.target.classList.add("moving");
      // check for possible moves
      const possibleMove = board.checkpossibleMove(e.target);
      if (possibleMove.length > 0) {
        possibleMove.forEach((item) => {
          const square = document.getElementById(item);
          square.classList.add("possible");
          square.addEventListener("click", board.movePiece);
        });
      } else {
        e.target.classList.remove("moving");
      }
    } else {
      return false;
    }
  }

export function removeMoving() {
    document.addEventListener("movestart", (event) => {
      event.preventDefault();
      const oldPossibleMoves = document.querySelectorAll(".possible");
      if (oldPossibleMoves.length > 0) {
        oldPossibleMoves.forEach((item) => {
          item.classList.remove("possible");
        });
      }
    });
  }


  