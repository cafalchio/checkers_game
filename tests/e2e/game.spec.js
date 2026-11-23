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
