# Checker's Game

#### Author: Matheus Cafalchio

The Checker's Game is a game that consists of a board with 64 squares, 32 of which are occupied by 16 black and 16 white pieces. The pieces are placed in the 12 squares closest to each player. The objective of the game is to capture all the opponent's pieces or to block them so that they cannot move. There are many variations of the game. The rules implemented in this project are based on the international rules but using a 8x8 board.
The game code was developed in javascript and the interface was developed in HTML and CSS.

<a href="https://cafalchio.github.io/checkers_game/" rel="nofolow">Visit and play the live version of the game here</a>
![Responsive Game](assets/images/responsive.png)

- [Checker's Game](#checker-s-game) - [Author: Matheus Cafalchio](#author--matheus-cafalchio)
  - [Concepts](#concepts)
  - [Technologies](#technologies)
  - [Features](#features)
    - [Features Left to Implement](#features-left-to-implement)
  - [Testing](#testing)
  - [Unfixed Bugs](#unfixed-bugs)
  - [Deployment](#deployment)
  - [Credits](#credits)
  - [Acknowledgements](#acknowledgements)

## Concepts

The ideia was to make a game that could be played by one player. The player would play against the computer. The computer would be able to play in two different levels: easy and hard. The easy level would be a random move, while the hard level would be a move that would try to capture the most pieces. The game would be played in any browser, and the player would be able to choose the color of the pieces.

This is my first code in javascript, so I had to learn a lot of things. I had to learn how to manipulate the DOM to create the board, how to use classes, how to use event listerners and the javascipt in general. The game logic was the most difficult part, because I had to think about all the game rules and how to implement them in the code.

## Technologies

The technologies used in this project were HTML, CSS and JavaScript. The HTML was used to create the structure of the page, the CSS was used to style the page and the JavaScript was used to make the entire game work.

    * HTML
    * CSS
    * JavaScript
    * GitHub
    * GIMP

## Features

- Landing page
  The landing page is the first page that the user sees when he enters the game. It has a title, a button to start the game and a button to see the rules of the game.

<!-- add image of each feature -->

- Interactive game
  The game is played in the browser. The user can choose the color of the pieces and the level of the computer. The user can also choose to play against another player.

- Score board
  The score board is a table that shows the number of pieces that each player has captured.

- Rules
  The rules page shows the rules of the game.

## Testing

The website was tested on a desktop computer and a mobile phone.
Also, W3C and Jigsaw validation was used to validate the website HTML and CSS.

W3C Validation:

<!-- ![W3C](assets/images/readme/W3C.png)

Jigsaw Validation:

![Jigsaw](assets/images/readme/jigsaw.png)

Lighhouse mobile and desktop testing:

![LightHouse Mobile](assets/images/readme/light_mobile.png)

![LightHouse Desktop](assets/images/readme/light_desktop.png) -->

The major concerns were the speed to load the images. The images were reduced both in size and optimizila image compressor. The speed increased but it is still a concern in slow phone connection.
So images were converted to jpg format and the quality was reduced.

## Unfixed Bugs

- dragging
  Sometimes the user can drag the background, which is not the desired behavior.

## Features Left to Implement

- The game could be played in two players mode.
- A timer could be added to the game.

## Deployment

- The game was deployed on GitHub pages.

## Credits

- Stack Overflow

## Acknowledgements

- My mentor for saving me from starting in a wrong way, which would make the project impossible to finish.
- My colleagues for the slack channel.
- The student tutors for the help.
