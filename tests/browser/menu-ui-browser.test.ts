import assert from "node:assert/strict";
import test from "node:test";
import { withUiBrowser } from "../helpers/ui-browser";

test("menu cards preserve keyboard selection and fit at narrow widths", { timeout: 90_000 }, async () => {
  await withUiBrowser(async (page, url) => {
    await page.goto(url + "#/menu");
    const start = page.getByRole("button", { name: "開始前の説明へ" });
    await start.and(page.locator(":enabled")).waitFor();
    const timing = page.getByRole("group", { name: "制限時間" });
    const timed = timing.getByRole("button", { name: /^あり/ });
    const untimed = timing.getByRole("button", { name: /^なし/ });
    assert.equal(await timed.getAttribute("aria-pressed"), "true");
    await untimed.press("Enter");
    assert.equal(await timed.getAttribute("aria-pressed"), "false");
    assert.equal(await untimed.getAttribute("aria-pressed"), "true");
    await page.setViewportSize({ width: 320, height: 700 });
    assert(await timing.getByRole("button").evaluateAll(cards => cards.every(card => {
      const { left, right, height } = card.getBoundingClientRect();
      return left >= 0 && right <= innerWidth && height >= 44;
    })));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal(await start.isEnabled(), true);
  });
});

test("endless subject changes leave the instructions reachable for both subjects", { timeout: 90_000 }, async () => {
  await withUiBrowser(async (page, url) => {
    await page.goto(url + "#/menu");
    const start = page.getByRole("button", { name: "開始前の説明へ", exact: true });
    await start.and(page.locator(":enabled")).waitFor();
    await page.getByRole("button", { name: "無限周回", exact: true }).click();
    const subjects = page.getByRole("group", { name: "科目・試験区分" });
    for (const subject of ["B", "A"]) {
      await subjects.getByRole("button", { name: new RegExp(`科目${subject}`) }).click();
      await start.click();
      await page.getByRole("heading", { name: "開始前の確認", exact: true }).waitFor();
      await page.getByText(`無限周回・生成問題 · 科目${subject}`, { exact: true }).waitFor();
      await page.getByRole("button", { name: "セット選択に戻る", exact: true }).click();
    }
  });
});
