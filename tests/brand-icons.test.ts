import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generateIcons, makeBrandSvg } from "../scripts/generate-brand-icons.mjs";

test("certification labels are outlined and preserve the common OpenCBT frame", () => {
  const labels = ["FE", "AP", "IT", "SC", "CBT", "A&B", ""];
  const svgs = labels.map((label) => makeBrandSvg({ label }));
  const frame = (svg: string) => svg.match(/<g id="common-frame">(.*?)<\/g>/s)![1];
  for (const [i, svg] of svgs.entries()) {
    assert.equal(frame(svg), frame(svgs[0]));
    assert(!/<text\b|<image\b|font-family=|href=/u.test(svg));
    assert.equal(svg.includes('id="qualification"'), Boolean(labels[i]));
  }
  assert(svgs[5].includes("A&amp;B"));
  assert.notEqual(svgs[0], svgs[1]);
  assert(makeBrandSvg({ label: "FE", box: "620,700,480,300", ink: "#123456" }).includes('fill="#123456"'));
});

test("generated PNGs and ICO entries contain the requested native sizes", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-icons-"));
  try {
    assert.equal(generateIcons({ outDir: directory }).length, 9);
    for (const [name, size] of [
      ["favicon-16.png", 16], ["favicon-32.png", 32], ["favicon-48.png", 48],
      ["apple-touch-icon.png", 180], ["app-icon-192.png", 192], ["app-icon-512.png", 512],
    ] as const) {
      const png = fs.readFileSync(path.join(directory, name));
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(png.readUInt32BE(16), size);
      assert.equal(png.readUInt32BE(20), size);
    }
    const ico = fs.readFileSync(path.join(directory, "favicon.ico"));
    assert.equal(ico.readUInt16LE(2), 1);
    assert.equal(ico.readUInt16LE(4), 3);
    for (const [i, size] of [16, 32, 48].entries()) {
      const entry = 6 + i * 16, length = ico.readUInt32LE(entry + 8), start = ico.readUInt32LE(entry + 12);
      assert.equal(ico[entry], size);
      assert.deepEqual(ico.subarray(start, start + length), fs.readFileSync(path.join(directory, `favicon-${size}.png`)));
    }
    assert(!fs.readFileSync(path.join(directory, "brand-icon.svg"), "utf8").includes("<rect"));
    assert(fs.readFileSync(path.join(directory, "favicon.svg"), "utf8").includes('<rect width="1254"'));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("invalid customization leaves existing icons intact", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "opencbt-icons-invalid-"));
  try {
    const existing = path.join(directory, "favicon.svg");
    fs.writeFileSync(existing, "existing asset");
    assert.throws(() => generateIcons({ outDir: directory, label: "基本情報" }), /フォントにない文字/);
    assert.throws(() => generateIcons({ outDir: directory, ink: 'red" onload="alert(1)' }), /--color/);
    assert.throws(() => generateIcons({ outDir: directory, box: "1000,1000,500,500" }), /--label-box/);
    assert.equal(fs.readFileSync(existing, "utf8"), "existing asset");
    assert.deepEqual(fs.readdirSync(directory), ["favicon.svg"]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
