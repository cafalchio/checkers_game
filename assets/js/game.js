import { promoteToKing, createPieces } from "./piece.js";
import Board from "./new_game.js";
import Menu from "./menu.js";
import Game from "./game_new.js";
import { playSound, removeMoving } from "./utils.js";


let game = new Game();
game.start();