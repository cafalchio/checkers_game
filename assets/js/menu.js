import { playSound } from "./utils.js";


export default class Menu {

    constructor() {
        this.menuIsOpen = true;
        this.isPlaying = false;
        this.optionHighlight = true;
        this.optionSound = true;
        this.game_html = document.getElementById("game");
        this.menu_html = document.getElementById("menu");
      };

    createMenu() {

      const menu = document.createElement("div");
      menu.id = "menu";
      menu.classList.add("menu");
      menu.innerHTML = `<div id="close-menu"><i class="far fa-times-circle"></i></div>`;
      if (this.isPlaying) {
        menu.innerHTML += `<div class="menu-item" id="new-game">Reset Game!</div>`;
      } else {
        menu.innerHTML += `<div class="menu-item" id="new-game">Start Game!</div>`;
      }
      menu.innerHTML += `
          <div class="menu-item" id="options">Options</div>
          <div class="menu-item" id="rules">Rules</div>
          <div class="menu-item" id="results">Results</div>`;
      this.game_html.appendChild(menu);
  
      document.getElementById("close-menu").addEventListener("click", () => {
        playSound("menu");
        this.hiddenMenu();
        this.menuIsOpen = false;
      });
      document.getElementById("new-game").addEventListener("click", () => {
        playSound("menu");
        if (this.isPlaying) {
          this.hiddenMenu();
          location.reload();
        } else {
          this.isPlaying = true; 
          this.menuIsOpen = false;
          this.hiddenMenu();
        }
      });
      document.getElementById("options").addEventListener("click", () => {
        playSound("menu");
        this.options();
      });
      document.getElementById("rules").addEventListener("click", () => {
        playSound("menu");
        this.rules();
      });
      document.getElementById("results").addEventListener("click", () => {
        playSound("menu");
        this.results();
      });
    }
    //Hidden menu method
    hiddenMenu() {
      const smallMenu = document.createElement("div");
      smallMenu.classList.add("menu-hidden");
      this.game_html.appendChild(smallMenu);
      this.game_html.removeChild(document.getElementById("menu"));
      smallMenu.innerHTML = `<i class="fa fa-cog" aria-hidden="true"></i>`;
  
      smallMenu.addEventListener("click", () => {
        playSound("menu");
        if (!this.menuIsOpen) {
          this.createMenu();
          this.menuIsOpen = true;
        } else if (this.menuIsOpen) {
          this.hiddenMenu();
          this.menuIsOpen = false;
        }
      });
    }
  
    // Menu options
    options() {
      const menu = document.getElementById("menu");
      menu.innerHTML = `
      <div id="close-menu"><i class="far fa-times-circle"></i></div>
      <div class="menu-item" id="options">Options</div>
      `;
      if (localStorage.getItem("sound") == "true") {
        menu.innerHTML += `<div class="submenu" id="sound"><span class="space">Sound On/Off</span>  
                          <label class="switch" id="sound-switch">
                          <input type="checkbox" checked>
                          <span class="slider round"></span>
                          </label></div>`;
      } else {
        menu.innerHTML += `<div class="submenu" id="sound"><span class="space">Sound On/Off</span>
                          <label class="switch" id="sound-switch">
                          <input type="checkbox">
                          <span class="slider round"></span>
                          </label></div>`;
      }
      if (this.optionHighlight) {
        menu.innerHTML += `<div class="submenu" id="highlight"><span class="space-s">Forced Highlight  </span>
                            <label class="switch" id="highlight-switch">
                            <input type="checkbox" checked>
                            <span class="slider round"></span>
                            </label></div>`;
      } else {
        menu.innerHTML += `<div class="submenu" id="highlight"><span class="space-s">Forced Highlight</span>
                            <label class="switch" id="highlight-switch">
                            <input type="checkbox">
                            <span class="slider round"></span>
                            </label></div>`;
      }
      menu.innerHTML += `<div class="submenu" id="back"><i class="fa fa-backward" aria-hidden="true"></i>
                         </div>`;
  
      //check if sound switch is off
      const switchSound = document.getElementById("sound-switch");
      switchSound.addEventListener("change", () => {
        if (localStorage.getItem("sound") == "true") {
          localStorage.setItem('sound', false);
        } else {
          localStorage.setItem('sound', true);
        }
        playSound("menu");
      });
  
      const switchHighlight = document.getElementById("highlight-switch");
      switchHighlight.addEventListener("change", () => {
        playSound("menu");
        if (this.optionHighlight) {
          this.optionHighlight = false;
        } else {
          optionHighlight = true;
        }
      });
  
      // add event listeners
      document.getElementById("close-menu").addEventListener("click", () => {
        playSound("menu");
        this.hiddenMenu();
        this.menuIsOpen = false;
      });
  
      document.getElementById("back").addEventListener("click", () => {
        playSound("menu");
        this.clearMenu();
        this.createMenu();
      });
    }
    // Menu rules
    rules() {
      const menu = document.getElementById("menu");
      menu.classList.add("menu-rules");
      menu.innerHTML = `
      <div id="close-menu"><i class="far fa-times-circle"></i></div>
      <div class="menu-item new-page" id="options">Rules</div>
      <p class="text-g">Simple move:</p> 
      <p>Moving a piece one square to the front, diagonally to an adjacent 
      unoccupied dark square.</p> 
      <p class="text-g">Jump (take an opponent piece):</p><p>Jumping over an opponent's piece, 
      to an empty square immediately to the opposite square (forward only).
      Jumping is always mandatory: if a player has the option to jump, they must take it. 
      If there are more pieces to be taken, they have to be taken.
      Multiple jumps are mandatory if they can be made.
      Multiple jumps are possible if, after one jump, another piece is immediately eligible to 
      be jumped by the moving piece, even if that jump is in a 
      different diagonal direction.
      Kings</p><p class="text-g">King:</p> 
      <p>If a piece moves into the last row, it gains the ability to move both forward and 
      backward. One square per turn.</p>
      <p class="text-g">End of game</p> 
      <p>A player wins by capturing all of the opponent's pieces or by leaving the opponent 
      with no legal move. 
      The game is a draw if neither side can force a win.
      A draw will also occur after 30 moves made just by jungs without piece taking.</p>
      <div class="submenu" id="rules-back"><i class="fa fa-backward" aria-hidden="true"></i></div>`;
  
      // add event listeners
      document.getElementById("close-menu").addEventListener("click", () => {
        playSound("menu");
        this.hiddenMenu();
        this.menuIsOpen = false;
      });
  
      document.getElementById("rules-back").addEventListener("click", () => {
        playSound("menu");
        this.clearMenu();
        this.createMenu();
      });
    }
  
    // Menu results
    results() {
      const menu = document.getElementById("menu");
      menu.classList.add("menu");
      menu.innerHTML = `
      <div id="close-menu"><i class="far fa-times-circle"></i></div>
      <div class="menu-item new-page" id="results">Results</div>`;
      // add scores
      let plyerScore = localStorage.getItem("whiteScore");
      let computerScore = localStorage.getItem("blackScore");
      menu.innerHTML += `<p class="submenu results-menu" id="player-score">Player  ${plyerScore}</p>`;
      menu.innerHTML += `<p class="submenu results-menu" id="computer-score">Computer  ${computerScore}</p>`;
      menu.innerHTML += `<div class="submenu results-menu" id="reset-score">Reset Score</div>`;
      menu.innerHTML += `<div class="submenu results-menu" id="rules-back"><i class="fa fa-backward" aria-hidden="true"></i></div>`;
      // add event listeners
      document.getElementById("close-menu").addEventListener("click", () => {
        playSound("menu");
        this.hiddenMenu();
        this.menuIsOpen = false;
      });
  
      document.getElementById("rules-back").addEventListener("click", () => {
        playSound("menu");
        this.clearMenu();
        this.createMenu();
      });
  
      document.getElementById("reset-score").addEventListener("click", () => {
        playSound("menu");
        localStorage.setItem("whiteScore", 0);
        localStorage.setItem("blackScore", 0);
        document.getElementById("player-score").innerHTML = "Player 0";
        document.getElementById("computer-score").innerHTML = "Computer 0";
      });
    }
  
    clearMenu() {
      this.menu_html.remove();
    }
  }
  