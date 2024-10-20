// sounds
let optionSound = true;
const moveSound = new Audio("assets/audio/move.mp3");
const takeSound = new Audio("assets/audio/capture.mp3");
const menuSound = new Audio("assets/audio/menu.mp3");

export default function playSound(soundType) {
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