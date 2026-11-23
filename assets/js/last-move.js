let completedTurnHistory = null;
let currentTurnHistory = null;

function createCaptureGhost(squareId) {
  const square = document.getElementById(squareId);
  const piece = square.querySelector(".piece");
  if (!piece) {
    throw new Error(`No rendered captured piece at square ${squareId}`);
  }

  const color = piece.classList.contains("piece-white") ? "white" : "black";
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
  ghost.classList.add(`captured-ghost-${color}`, "last-captured-ghost");
  ghost.setAttribute("aria-hidden", "true");
  ghost.setAttribute("tabindex", "-1");
  return ghost;
}

function renderMoveHistory() {
  document.querySelectorAll(".square.last-move, .square.last-capture").forEach((square) => {
    square.classList.remove("last-move", "last-capture");
  });
  document.querySelectorAll(".last-captured-ghost").forEach((ghost) => {
    ghost.remove();
  });

  [completedTurnHistory, currentTurnHistory].forEach((history) => {
    if (!history) return;
    history.moves.forEach(({ from, to }) => {
      document.getElementById(from).classList.add("last-move");
      document.getElementById(to).classList.add("last-move");
    });
    history.captures.forEach(({ squareId, ghost, pending }) => {
      document.getElementById(squareId).classList.add("last-capture");
      if (history === completedTurnHistory || !pending) {
        document.getElementById(squareId).appendChild(ghost);
      }
    });
  });
}

document.addEventListener("checkers:move", (event) => {
  const {
    from,
    to,
    captures = [],
    pendingCaptures = [],
    mover,
    turnCompleted = false
  } = event.detail;

  if (!currentTurnHistory || currentTurnHistory.mover !== mover) {
    if (currentTurnHistory) completedTurnHistory = currentTurnHistory;
    currentTurnHistory = { mover, moves: [], captures: [] };
  }

  const pendingCaptureSet = new Set(pendingCaptures);
  currentTurnHistory.moves.push({ from, to });
  captures.forEach((squareId) => {
    currentTurnHistory.captures.push({
      squareId,
      ghost: createCaptureGhost(squareId),
      pending: pendingCaptureSet.has(squareId)
    });
  });

  renderMoveHistory();
  if (turnCompleted) {
    completedTurnHistory = currentTurnHistory;
    currentTurnHistory = null;
    renderMoveHistory();
  }
});
