// Run against the local app with an isolated headless Chromium context.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, type Frame, type Page } from "playwright";
import { fixture, installFixtureGenerators } from "../tests/fixtures";
import { prepareRun, startRun, updateAnswer, finishRun, validateRun } from "../src/core/session";

const url = new URL(process.argv[2] ?? "http://127.0.0.1:5197/");
const output = "output/playwright/huffman-source-table", id = "question-ipa-2018h30a-fe-am-4";
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors: string[] = [];
const track = (page: Page) => page.on("pageerror", error => errors.push(error.message));

async function detail(page: Page) {
  const iframe = page.locator(".detail-frame.ready");
  await iframe.waitFor();
  const frame = await (await iframe.elementHandle())!.contentFrame();
  assert(frame);
  await frame.locator("#step-title").filter({ hasText: "5文字を葉に置く" }).waitFor();
  return frame;
}
async function settle(page: Page, frame: Frame) {
  await page.locator(".detail-frame.ready").evaluate(node => {
    const rect = node.getBoundingClientRect();
    if (Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0) < 100) node.scrollIntoView({ block: "start" });
  });
  await frame.waitForFunction(() => Math.abs(innerHeight - Math.ceil(document.body.getBoundingClientRect().bottom + scrollY)) <= 1);
}

const geometry = (frame: Frame) => frame.locator(".source, .source-table, #diagram, #tree, .navigation").evaluateAll(nodes => nodes.map(node => {
  const rect = node.getBoundingClientRect();
  return [rect.y + scrollY, rect.width, rect.height];
}));
const readStep = async (frame: Frame) => {
  await frame.locator("#seek").press("End");
  await frame.locator("#seek").press("ArrowLeft");
  await frame.locator("#seek").press("ArrowLeft");
};

try {
  for (const width of [1345, 390, 320]) for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1345 ? 609 : 680 } });
    await context.addInitScript(value => {
      if (self === top) localStorage.setItem("opencbt-fe-kihonjoho-theme", value);
    }, theme);
    const page = await context.newPage();
    track(page);
    await page.goto(new URL("#/search/detail/" + id, url).href);
    const frame = await detail(page), seek = frame.locator("#seek"), formula = frame.locator("#formula");
    const sourceButtons = frame.locator(".source-letter");
    const sourceWeights = frame.locator("#source-weights td span");
    const sourceCodes = frame.locator("#source-codes td > *");
    assert.deepEqual(await sourceWeights.allTextContents(), ["26%", "25%", "24%", "13%", "12%"]);
    assert.deepEqual(await sourceCodes.allTextContents(), ["00", "01", "10", "a", "111"]);
    assert.equal(await frame.locator("html").getAttribute("data-theme"), theme);
    assert(await frame.locator("#standalone-title").isHidden());
    const go = async (direction: "next" | "prev") => frame.locator("#" + direction).press("Enter");
    for (const font of [100, 200]) {
      await frame.locator("html").evaluate((html, size) => { html.style.fontSize = size + "%"; }, font);
      await seek.press("Home");
      await settle(page, frame);
      const initial = await geometry(frame);
      const stable = async () => {
        const current = await geometry(frame);
        assert(current.every((row, i) => row.every((value, j) => Math.abs(value - initial[i][j]) <= 1)),
          JSON.stringify({ width, theme, font, initial, current }));
        assert(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        assert(await frame.locator("button:visible, input:visible").evaluateAll(nodes => nodes.every(node => {
          const rect = node.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44 && node.scrollWidth <= node.clientWidth + 1;
        })), "touch targets and labels");
      };
      assert.equal(await frame.locator(".node:visible").count(), 5);
      await stable();
      const letterD = sourceButtons.nth(3);
      await letterD.press("Space");
      assert.equal(await letterD.getAttribute("aria-pressed"), "true");
      assert.equal(await frame.locator('.node[data-code="110"]').getAttribute("aria-pressed"), "true");
      assert.equal(await sourceWeights.nth(3).getAttribute("data-mark"), "path");
      assert.equal(await formula.innerText(), "13%");
      await letterD.press("Escape");
      assert(await letterD.evaluate(el => el === document.activeElement));
      assert.equal(await letterD.getAttribute("aria-pressed"), "false");
      await stable();
      const groups = [[[4], [3]], [[2], [3, 4]], [[1], [0]], [[2, 3, 4], [0, 1]]];
      for (const [index, weights] of [[12, 13, 25], [24, 25, 49], [25, 26, 51], [49, 51, 100]].entries()) {
        await go("next");
        assert.equal(await frame.locator(".node:visible").count(), index + 6);
        for (const [i, mark] of ["first", "second", "result"].entries()) {
          const term = formula.locator('[data-mark="' + mark + '"]');
          const node = frame.locator('.node[data-mark="' + mark + '"]');
          assert((await term.textContent())?.endsWith(weights[i] + "%"));
          assert((await node.textContent())?.endsWith(weights[i] + "%"));
          const color = await term.evaluate(el => getComputedStyle(el).textDecorationColor);
          assert.equal(color, await node.evaluate(el => getComputedStyle(el).borderColor));
          for (const cell of groups[index][i] ?? []) {
            const frequency = sourceWeights.nth(cell);
            assert.equal(await frequency.getAttribute("data-mark"), mark);
            assert.equal(color, await frequency.evaluate(el => getComputedStyle(el).textDecorationColor));
          }
        }
        if (index === 1) {
          assert.match(await frame.locator("#step-note").innerText(), /同じ重み.*Cの 10 と Eの 111 はどちらも 1/);
          assert.deepEqual(await frame.locator("#source-codes [data-mark]").allTextContents(), ["10", "111"]);
        }
        if (index === 3) {
          assert.equal(await formula.locator("[data-mark=result]").innerText(), "根 100%");
          assert.match(await frame.locator("#step-note").innerText(), /この根からDへの経路/);
        }
        const selected = frame.locator(".node[data-mark=result]");
        await selected.press("Space");
        assert.equal(await selected.getAttribute("aria-pressed"), "true");
        await stable();
        await selected.press("Escape");
        assert.equal(await selected.getAttribute("aria-pressed"), "false");
        assert(await selected.evaluate(el => el === document.activeElement));
        await stable();
        if (index === 3 && width === 1345 && theme === "dark" && font === 100) {
          await settle(page, frame);
          await page.evaluate(() => window.scrollTo(0, 0));
          const formulaBox = await formula.boundingBox();
          assert(formulaBox && formulaBox.y + formulaBox.height <= 609, "source table and merge formula fit in the reference viewport");
          await page.screenshot({ path: output + "/merge-viewport.png" });
          await page.screenshot({ path: output + "/merge-desktop.png", fullPage: true });
        }
      }
      await go("next");
      assert.equal(await formula.innerText(), "1 → 1 → 0 ⇒ 110");
      assert.equal(await frame.locator(".edge[data-mark=path]").count(), 3);
      if (width === 1345) {
        assert(await frame.evaluate(() => {
          const nodes = [...document.querySelectorAll(".node:not([hidden])")].map(el => el.getBoundingClientRect());
          return [...document.querySelectorAll(".branch:not([hidden])")].every(el => {
            const bit = el.getBoundingClientRect();
            return nodes.every(node => bit.right <= node.left || node.right <= bit.left || bit.bottom <= node.top || node.bottom <= bit.top);
          });
        }), "branch labels stay clear of nodes in the compact desktop tree");
      }
      assert.equal(await sourceCodes.nth(3).getAttribute("data-mark"), "path");
      assert.equal(await sourceCodes.nth(3).innerText(), "a");
      for (const [i, prefix] of ["Aの符号 00", "Bの符号 01", "Cの符号 10", "Dの葉"].entries()) {
        const choice = frame.locator("#comparison button").nth(i);
        await choice.press("Enter");
        assert.match(await frame.locator("#step-note").innerText(), new RegExp(prefix));
        assert.equal(await frame.locator(".edge[data-mark=conflict]").count(), i === 3 ? 0 : 2);
        assert.equal(await sourceCodes.nth(i).getAttribute("data-mark"), i === 3 ? "path" : "conflict");
        if (i < 3) assert.equal(await formula.locator(".unread-bits").innerText(), ["1", "0", "1"][i]);
        await stable();
        if (i === 0 && width === 390 && theme === "dark" && font === 100) {
          await settle(page, frame);
          await page.screenshot({ path: output + "/choice-mobile.png", fullPage: true });
        }
        await choice.press(i % 2 ? "Escape" : "Enter");
        assert.equal(await choice.getAttribute("aria-pressed"), "false");
      }
      await go("next");
      assert.equal(await formula.innerText(), "000110110111");
      const chunk = frame.locator("#chunks button").nth(3);
      await chunk.press("Space");
      assert.match(await formula.innerText(), /110$/);
      assert.equal(await frame.locator('.node[data-code="110"]').getAttribute("aria-pressed"), "true");
      await chunk.press("Escape");
      assert(await chunk.evaluate(el => el === document.activeElement));
      await stable();
      await go("next");
      assert.match(await formula.innerText(), /225 ビット$/);
      assert.match(await frame.locator("#step-note").innerText(), /75ビット（25%）/);
      assert.deepEqual(await frame.locator(".bars dd").allInnerTexts(), ["300 ビット", "225 ビット"]);
      const lengths = await frame.locator(".bar").evaluateAll(bars => bars.map(bar => bar.getBoundingClientRect().width));
      assert(Math.abs(lengths[1] / lengths[0] - .75) < .01);
      const term = frame.locator("#terms button").nth(3);
      await term.press("Enter");
      assert.match(await formula.innerText(), /13 × 3 ＝ 39/);
      assert.equal(await sourceWeights.nth(3).getAttribute("data-mark"), "path");
      assert.equal(await sourceCodes.nth(3).getAttribute("data-mark"), "path");
      await stable();
      await term.press("Escape");
      if (width === 1345 && theme === "light" && font === 100) {
        await settle(page, frame);
        await page.screenshot({ path: output + "/compression-desktop.png", fullPage: true });
      }
      for (let step = 6; step >= 0; step--) {
        await go("prev");
        assert.equal(await seek.inputValue(), String(step));
        await stable();
      }
      await settle(page, frame);
      assert(await frame.locator("body").evaluate(body => ![...body.querySelectorAll("*")].some(el =>
        ["scroll", "auto"].includes(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 2)));
    }
    await page.locator(".detail-references").scrollIntoViewIfNeeded();
    assert(await page.locator(".detail-references").isVisible());
    assert(await page.locator(".footer-changes").isVisible());
    await page.getByRole("button", { name: "通常解説へ戻る", exact: true }).click();
    await page.getByRole("button", { name: "詳細解説を見る", exact: true }).click();
    await detail(page);
    await context.close();
    console.log({ width, theme, fonts: [100, 200], steps: 8 });
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 680 } });
  track(page);
  const query = new URLSearchParams({ q: "ハフマン木", year: "2018", type: "detail" });
  await page.goto(new URL("#/search?" + query, url).href);
  await page.getByRole("link", { name: "ハフマン符号化とデータ圧縮", exact: true }).click();
  const original = await detail(page);
  await readStep(original);
  const candidate = original.locator("#comparison button").first();
  await candidate.click();
  assert.equal(await candidate.getAttribute("aria-pressed"), "true");
  await page.goto(new URL("explanations/ipa-2018-autumn-am-4/index.html", url).href);
  assert(await page.locator("#standalone-title").isVisible());
  assert(await page.getByRole("link", { name: "公式解答例" }).isVisible());

  await page.setViewportSize({ width: 1280, height: 680 });
  await page.goto(url.href);
  await page.getByRole("combobox", { name: "公開問題集" }).selectOption("set-annual-2018h30a-fe-am");
  await page.getByRole("button", { name: "なし 正答表示・一時停止" }).click();
  await page.getByRole("button", { name: "開始前の説明へ" }).click();
  await page.getByRole("button", { name: "準備して開始" }).click();
  await page.getByRole("button", { name: "問題一覧" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^4 未解答/ }).click();
  await page.getByRole("button", { name: "正答を見る" }).click();
  await page.getByRole("button", { name: "詳細解説を見る", exact: true }).click();
  const annual = await detail(page);
  assert(await annual.evaluate(id => {
    const context = (window as any).OpenCBTDetail.context;
    return context.question.id === id && context.generation === null;
  }, id));
  await page.getByRole("button", { name: "通常解説へ戻る", exact: true }).click();
  assert(await page.getByRole("button", { name: "詳細解説を見る", exact: true }).isVisible());
  console.log("annual study and search routes");

  await installFixtureGenerators();
  const bundle = fixture(), question = bundle.questions.find(q => q.id === id)!;
  const runs = new Map<number, Awaited<ReturnType<typeof finishRun>>>();
  for (let attempt = 0; attempt < 40 && runs.size < 2; attempt++) {
    let run = startRun(await prepareRun(bundle, { subject: "A", kind: "bookmark", mode: "study", bindingMode: "generated_values",
      bookmarkQuestionRef: { questionId: question.id, revision: question.revision } }, {}));
    const length = run.instances[0].parameters.values[0];
    if (runs.has(length)) continue;
    run = updateAnswer(run, run.issued[0].choices[0].id);
    run.session.entries[0].revealed = true;
    run = finishRun(run, "completed");
    await validateRun(run);
    runs.set(length, run);
  }
  assert.equal(runs.size, 2);
  const fixtures = [...runs.values()].map(({ bundle: _bundle, ...run }) => run);
  await page.route("**/huffman-fixtures.json", route => route.fulfill({ json: { bundle, fixtures } }));
  await page.setViewportSize({ width: 390, height: 680 });
  await page.goto(url.href);
  await page.getByRole("combobox", { name: "公開問題集" }).locator("option[value='set-annual-2018h30a-fe-am']").waitFor({ state: "attached" });
  await page.evaluate(async () => {
    const { bundle, fixtures } = await (await fetch("./huffman-fixtures.json")).json();
    const open = indexedDB.open("opencbt-fe-kihonjoho-v2");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      open.onsuccess = () => resolve(open.result); open.onerror = reject;
    });
    const tx = db.transaction(["catalogSnapshots", "generatedInstances", "sessions", "results"], "readwrite");
    for (const run of fixtures) {
      tx.objectStore("catalogSnapshots").put({ id: run.session.id, bundle, assets: {} });
      for (const instance of run.instances) tx.objectStore("generatedInstances").put(instance);
      tx.objectStore("sessions").put({ id: run.session.id, session: run.session, exam: run.exam, set: run.set,
        selection: run.selection, issued: run.issued, title: run.set.title, result: run.result });
      tx.objectStore("results").put(run.result);
    }
    await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = reject; });
    db.close();
  });
  for (const run of fixtures) {
    await page.goto(new URL("#/detail/" + run.session.id + "/0/review", url).href);
    const frame = await detail(page);
    const saved = await frame.evaluate(() => (window as any).OpenCBTDetail.context);
    assert.deepEqual(saved.generation.parameters, run.instances[0].parameters);
    const rows: string[][] = saved.question.prompt.blocks.find((block: any) => block.type === "table").rows;
    assert.deepEqual(await frame.locator("#source-weights td").allTextContents(), rows.map(([, weight]) => weight + "%"));
    assert.deepEqual(await frame.locator("#source-codes td").allTextContents(), rows.map(([letter, , code]) => letter === "D" ? "a" : code));
    for (const [letter, weight, code] of rows) {
      const node = frame.locator(".node").filter({ has: frame.getByText(letter, { exact: true }) });
      assert.match(await node.innerText(), new RegExp(weight + "%"));
      if (letter !== "D") assert.equal(await node.getAttribute("data-code"), code);
    }
    await frame.locator("#next").press("Enter");
    await frame.locator("#next").press("Enter");
    const [, , c] = rows[2];
    const [other, , code] = rows[run.instances[0].parameters.values[0] === 1 ? 0 : 4];
    assert.equal(c[0], code[0]);
    assert((await frame.locator("#step-note").innerText()).includes("Cの " + c + " と " + other + "の " + code + " はどちらも " + c[0]));
    await readStep(frame);
    const length = 3 - run.instances[0].parameters.values[0];
    assert.match(await frame.locator("#formula").innerText(), new RegExp("⇒ [01]{" + length + "}$"));
    for (const [i, { id, label }] of saved.choiceOrder.entries()) {
      const code = saved.question.choices.find((choice: any) => choice.id === id).content.blocks[0].text;
      const button = frame.locator("#comparison button").nth(i);
      assert.equal(await button.innerText(), label + " " + code);
      await button.press("Enter");
      assert.match(await frame.locator("#step-title").innerText(), id === saved.question.correctAnswer.choiceId ? /Dに到達/ : /衝突/);
    }
    assert(await frame.evaluate(before => Object.isFrozen((window as any).OpenCBTDetail.context) &&
      JSON.stringify((window as any).OpenCBTDetail.context) === before, JSON.stringify(saved)));
    await page.getByRole("button", { name: "通常解説へ戻る", exact: true }).click();
    const record = await page.evaluate(async id => {
      const open = indexedDB.open("opencbt-fe-kihonjoho-v2");
      const db = await new Promise<IDBDatabase>(resolve => { open.onsuccess = () => resolve(open.result); });
      const request = db.transaction("sessions").objectStore("sessions").get(id);
      const result = await new Promise<any>(resolve => { request.onsuccess = () => resolve(request.result); });
      db.close();
      return result;
    }, run.session.id);
    assert.deepEqual([record.issued, record.session.entries, record.result], [run.issued, run.session.entries, run.result]);
    console.log({ savedParameters: run.instances[0].parameters.values });
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
