// Generate a real-layout regression check for an isolated headless Playwright CLI session.
import fs from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:5177/";
const directory = "output/playwright/scrollbars";
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(`${directory}/verify.js`, `async page => {
  const base = ${JSON.stringify(base)}, observed = [], errors = [];
  const check = (value, message) => { if (!value) throw Error(message); };
  page.on('pageerror', error => errors.push(error.message));
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const bars = () => page.locator('.overlay-scrollbar-vertical:not([hidden])');
  const bottom = async () => { await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await settle(); };
  for (const width of [1140, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1140 ? 609 : 844 });
    await page.goto(base + '#/licenses');
    await page.locator('.license-text').first().waitFor({ state: 'attached' });
    for (const theme of ['light', 'dark']) {
      await page.getByRole('button', { name: theme === 'light' ? 'ライトモード' : 'ダークモード', exact: true }).click();
      await bottom();
      check(await bars().count() === 1, 'closed licenses must only show the page scrollbar: ' + width + ' ' + theme);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal page overflow: ' + width);
      const notice = page.locator('.license-sections details').filter({ hasText: '独自問題・独自解説・図データ · CC0-1.0' });
      await notice.locator('summary').click();
      await notice.locator('.license-text').scrollIntoViewIfNeeded();
      await settle();
      check(await bars().count() === 2, 'opened overflowing license needs its own scrollbar: ' + width + ' ' + theme);
      const text = notice.locator('.license-text');
      const textBox = await text.boundingBox();
      const track = bars().last();
      const trackBox = await track.boundingBox();
      check(textBox && trackBox && trackBox.x >= textBox.x && trackBox.x + trackBox.width <= textBox.x + textBox.width + 1,
        'license scrollbar stays over the text');
      await page.mouse.move(trackBox.x + trackBox.width / 2, trackBox.y + 16);
      await page.mouse.wheel(0, 140);
      await page.waitForFunction(() => [...document.querySelectorAll('.license-text')].some(node => node.scrollTop > 0));
      const thumb = track.locator('.overlay-scrollbar-thumb');
      const thumbBox = await thumb.boundingBox();
      await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(thumbBox.x + thumbBox.width / 2, trackBox.y + trackBox.height - 2, { steps: 5 });
      await page.mouse.up();
      check(await text.evaluate(node => node.scrollTop >= node.scrollHeight - node.clientHeight - 2), 'license scrollbar drag reaches end');
      await notice.locator('summary').click();
      await bottom();
      check(await bars().count() === 1, 'closing license removes its scrollbar immediately: ' + width + ' ' + theme);
      await page.screenshot({ path: '${directory}/licenses-' + width + '-' + theme + '.png', animations: 'disabled' });
      observed.push({ width, theme, closed: 1, opened: 2 });
    }
  }
  // Closed disclosures can retain client rectangles even though their contents
  // are not rendered. A scrollable summary remains visible inside that state.
  await page.setViewportSize({ width: 1140, height: 609 });
  await page.evaluate(() => {
    const fixture = document.createElement('section'); fixture.id = 'scrollbar-fixture';
    fixture.style.cssText = 'position:fixed;inset:20px;z-index:10;background:var(--surface)';
    fixture.innerHTML = '<details><summary>Outer summary</summary><details open><summary>Inner summary</summary><div class="fixture-scroll"><div></div></div></details></details><div class="skipped"><div class="fixture-scroll"><div></div></div></div><details class="summary-fixture"><summary><div class="fixture-scroll"><div></div></div></summary><p>Closed content</p></details>';
    for (const node of fixture.querySelectorAll('.fixture-scroll')) {
      node.style.cssText = 'overflow:auto;width:200px;height:100px';
      node.firstElementChild.style.cssText = 'width:600px;height:600px';
    }
    fixture.querySelector('.skipped').style.contentVisibility = 'hidden';
    document.body.append(fixture);
  });
  await settle();
  check(await bars().count() === 2, 'hide nested closed/skipped content while retaining the scrollable summary');
  check(await page.locator('.overlay-scrollbar-horizontal:not([hidden])').count() === 1, 'only the summary has a horizontal scrollbar');
  const outer = page.locator('#scrollbar-fixture > details').first();
  await outer.locator('summary').first().click(); await settle();
  check(await bars().count() === 3, 'opening the outer disclosure reveals the nested scrollbar');
  await outer.locator('summary').first().click(); await settle();
  check(await bars().count() === 2, 'closing the outer disclosure hides the nested scrollbar');
  await page.locator('#scrollbar-fixture').evaluate(node => node.remove()); await settle();
  await page.goto(base + '#/search/question/question-ipa-2026-a-2');
  await page.locator('.question-footer').getByRole('button', { name: 'ライセンス表記', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'ライセンス表記', exact: true });
  await dialog.locator('.license-text').first().waitFor({ state: 'attached' });
  await dialog.evaluate(node => { node.scrollTop = node.scrollHeight; }); await settle();
  check(await bars().count() === 1 && await dialog.locator('.overlay-scrollbar-vertical:not([hidden])').count() === 1,
    'modal only shows its own scrollbar with closed licenses');
  const dialogNotice = dialog.locator('details').filter({ hasText: '独自問題・独自解説・図データ · CC0-1.0' });
  await dialogNotice.locator('summary').click();
  await dialogNotice.locator('.license-text').scrollIntoViewIfNeeded(); await settle();
  check(await bars().count() === 2 && await dialog.locator('.overlay-scrollbar-vertical:not([hidden])').count() === 2,
    'modal retains the opened license scrollbar and hides background bars');
  await dialogNotice.locator('summary').click(); await settle();
  check(await bars().count() === 1, 'closing a modal license removes its scrollbar');
  await dialog.getByRole('button', { name: '閉じる', exact: true }).click();
  check(errors.length === 0, 'browser errors: ' + errors.join(', '));
  return { scrollbars: 'passed', observed, jsErrors: errors };
}\n`);
console.log(`Generated ${directory}/verify.js for an isolated headless Playwright CLI session.`);
