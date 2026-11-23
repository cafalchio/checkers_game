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

test("plays a full party against the computer until game over", async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });

  await page.goto("/");
  await page.locator("#vs-computer").click();
  await page.locator("#difficulty-select").selectOption("hard");
  await page.locator("#ruleset-select").selectOption("british");
  await page.locator("#start-computer").click();

  await expect(page.locator("#game > .square")).toHaveCount(64);
  await expect(page.locator("#game > .square .piece")).toHaveCount(24);

  for (let turn = 0; turn < 300; turn += 1) {
    if (await page.locator("#game-over").count()) {
      break;
    }

    await page.waitForFunction(() => {
      return Boolean(document.querySelector("#game-over"))
        || (
          document.querySelector("#messages")?.textContent
          && [...document.querySelectorAll(".piece-white")]
            .some((piece) => piece.movable)
        );
    }, null, { timeout: 5000 });

    if (await page.locator("#game-over").count()) {
      break;
    }

    const moved = await page.evaluate(() => {
      const pieces = [...document.querySelectorAll(".piece-white")]
        .filter((piece) => piece.movable);
      for (const piece of pieces) {
        piece.click();
        const destination = document.querySelector(".square.possible");
        if (destination) {
          destination.click();
          return true;
        }
      }
      return false;
    });

    expect(moved).toBe(true);
  }

  await expect(page.locator("#game-over")).toBeVisible();
  await expect(page.locator("#game-over")).toContainText(/wins|draw/i);
});
