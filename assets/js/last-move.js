// Render the most recent move and its captured-piece markers.
document.addEventListener("checkers:move", (event) => {
  const {
    from,
    to,
    captures = [],
    capturedSquares = captures,
    pendingCaptures = [],
    capturedColors = [],
    capturedPieces = []
  } = event.detail;

  document.querySelectorAll(".square.last-move").forEach((square) => {
    square.classList.remove("last-move");
  });
  document.querySelectorAll(".square.last-capture").forEach((square) => {
    square.classList.remove("last-capture");
  });
  document.querySelectorAll(".last-captured-ghost").forEach((ghost) => {
    ghost.remove();
  });

  document.getElementById(from)?.classList.add("last-move");
  document.getElementById(to)?.classList.add("last-move");

  [...new Set([...pendingCaptures, ...capturedSquares])].forEach((squareId) => {
    document.getElementById(squareId)?.classList.add("last-capture");
  });

  capturedSquares.forEach((squareId, index) => {
    const capturedSquare = document.getElementById(squareId);
    const piece = capturedPieces[index];
    if (!capturedSquare || !piece) return;

    const ghost = piece.cloneNode(true);
    ghost.removeAttribute("id");
    ghost.classList.remove(
      "piece",
      "piece-white",
      "piece-black",
      "piece-out-white",
      "piece-out-black",
      "moving",
      "highlight"
    );
    const color =
      capturedColors[index] ||
      (piece.classList.contains("piece-white") ? "white" : "black");
    ghost.classList.add(`captured-ghost-${color}`, "last-captured-ghost");
    ghost.setAttribute("aria-hidden", "true");
    ghost.setAttribute("tabindex", "-1");
    capturedSquare.appendChild(ghost);
  });
});
