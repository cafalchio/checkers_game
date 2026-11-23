import { expect, test } from "@playwright/test";

test("ruleset selection, Rules screen, and capture history preserve the board", async ({ page }) => {
  await page.goto("/");
  await page.locator("#vs-computer").click();
  await page.locator("#ruleset-select").selectOption("british");
  await page.locator("#ruleset-select").selectOption("international");

  await expect(page.locator("#start-computer")).toBeVisible();
  await page.locator("#start-computer").click();
  await expect(page.locator("#game > .square")).toHaveCount(100);
  await expect(page.locator("#game > .square .piece")).toHaveCount(40);

  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("checkers:move", {
      detail: {
        from: 44,
        to: 55,
        captures: [1],
        pendingCaptures: [1],
        mover: "white",
        turnCompleted: false
      }
    }));
  });
  await expect(page.locator(".last-captured-ghost")).toHaveCount(0);
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("checkers:move", {
      detail: {
        from: 55,
        to: 66,
        captures: [21],
        pendingCaptures: [],
        mover: "white",
        turnCompleted: true
      }
    }));
  });
  await expect(page.locator(".last-captured-ghost")).toHaveCount(2);
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("checkers:move", {
      detail: {
        from: 66,
        to: 77,
        captures: [],
        pendingCaptures: [],
        mover: "black",
        turnCompleted: true
      }
    }));
  });
  await expect(page.locator(".last-captured-ghost")).toHaveCount(0);

  await page.locator(".menu-hidden").click();
  await page.locator("#rules").click();
  await expect(page.locator("#menu")).toContainText("International draughts");
  await expect(page.locator("#game > .square")).toHaveCount(100);
  await expect(page.locator("#game > .square .piece")).toHaveCount(40);
});

test("hard computer only considers globally legal longest captures", async ({ page }) => {
  await page.goto("/");

  const captureSources = await page.evaluate(async () => {
    const { RulesEngine } = await import("/assets/js/core/rules-engine.js");
    const board = window.checkersBoard;
    const squares = Array(100).fill(null);
    squares[11] = { color: "white", king: false };
    squares[22] = { color: "black", king: false };
    squares[44] = { color: "black", king: false };
    squares[71] = { color: "white", king: false };
    squares[82] = { color: "black", king: false };
    const pieces = [{}, {}];

    board.ruleset = "international";
    board.rulesEngine = new RulesEngine("international");
    board.gameState = {
      squares,
      turn: "white",
      ruleset: "international",
      revision: 0,
      pendingCaptures: [],
      continuationSquare: null
    };
    board.piecePositions = new WeakMap([
      [pieces[0], 11],
      [pieces[1], 71]
    ]);

    return board.getComputerCaptures(pieces).map(([piece]) =>
      board.piecePositions.get(piece)
    );
  });

  expect(captureSources).toEqual([11]);
});

test("runs a full computer-vs-computer party", async ({ page }) => {
  await page.goto("/");
  await page.locator("#vs-computer").click();
  await page.locator("#difficulty-select").selectOption("hard");
  await page.locator("#ruleset-select").selectOption("british");
  await page.locator("#start-computer").click();

  await expect(page.locator("#game > .square")).toHaveCount(64);
  await expect(page.locator("#game > .square .piece")).toHaveCount(24);
  const initialRevision = await page.evaluate(
    () => window.checkersBoard.gameState.revision
  );

  for (let turn = 0; turn < 1000; turn += 1) {
    const stateBeforeMove = await page.evaluate(() => ({
      revision: window.checkersBoard.gameState.revision,
      turn: window.checkersBoard.gameState.turn
    }));

    if (await page.locator("#game-over").count()) break;

    const moveStarted = await page.evaluate(() => {
      if (window.checkersBoard.gameOver) return false;
      if (window.checkersBoard.pieceTaking) return true;

      const currentTurn = window.checkersBoard.gameState.turn;
      window.checkersBoard.setPlayerColor(currentTurn === "white" ? "black" : "white");
      window.checkersBoard.computerMove();
      return true;
    });

    expect(moveStarted).toBe(true);

    await page.waitForFunction(({ revision, turn }) => {
      if (document.querySelector("#game-over")) return true;
      if (window.checkersBoard.pieceTaking) return false;
      return window.checkersBoard.gameState.revision > revision
        || window.checkersBoard.gameState.turn !== turn;
    }, stateBeforeMove, { timeout: 5000 });
  }

  const finalState = await page.evaluate(() => ({
    revision: window.checkersBoard.gameState.revision,
    pieceCount: window.checkersBoard.gameState.squares.filter(Boolean).length
  }));
  expect(finalState.revision).toBeGreaterThan(initialRevision);
  expect(finalState.pieceCount).toBeLessThanOrEqual(24);
});
