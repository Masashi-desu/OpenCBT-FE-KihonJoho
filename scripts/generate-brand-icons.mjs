#!/usr/bin/env node
// The fixed frame and original FE outlines were traced from the selected rough.
// Other labels use Archivo Black (OFL-1.1), or an explicitly supplied font.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { Resvg } from "@resvg/resvg-js";
import opentype from "opentype.js";
import { prepareBrandFonts, readFontBytes } from "./brand-fonts.mjs";

const sourceDir = fileURLToPath(new URL("./brand/", import.meta.url));
const projectDir = fileURLToPath(new URL("../", import.meta.url));
const geometry = JSON.parse(fs.readFileSync(path.join(sourceDir, "geometry.json"), "utf8"));
const side = geometry.viewBox[2];
const number = (n) => Number(n.toFixed(6)).toString();
const escapeXml = (s) => s.replace(/[<>&"']/g, (c) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
})[c]);
const tracedPath = (p) => `<path d="${p.d}" transform="${p.transform}"/>`;

function color(value, name, transparent = false) {
  if ((transparent && value === "transparent") || /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value)) return value;
  throw Error(`${name} は #RGB または #RRGGBB${transparent ? "、transparent" : ""} を指定してください。`);
}

function labelBox(input) {
  const box = input === undefined ? geometry.label.box : input.split(",").map(Number);
  if (box.length !== 4 || box.some((n) => !Number.isFinite(n)) ||
      box[0] < 0 || box[1] < 0 || box[2] <= 0 || box[3] <= 0 ||
      box[0] + box[2] > side || box[1] + box[3] > side) {
    throw Error(`--label-box は ${side} × ${side} 内の x,y,width,height を指定してください。`);
  }
  return box;
}

/** @param {{label?: string, ink?: string, background?: string, backgroundRadius?: number, font?: string, box?: string}} [options] */
export function makeBrandSvg({ label = "FE", ink = "#171717", background = "transparent", backgroundRadius = 0, font, box } = {}) {
  color(ink, "--color");
  color(background, "--background", true);
  if (!Number.isFinite(backgroundRadius) || backgroundRadius < 0 || backgroundRadius > 0.5) {
    throw Error("--background-radius は 0〜0.5 の割合で指定してください。");
  }
  if (typeof label !== "string" || /[\u0000-\u001f\u007f]/u.test(label)) {
    throw Error("資格コードには改行・制御文字を使用できません。");
  }
  const target = labelBox(box);
  let variable = "";
  if (label.trim()) {
    let outlines, bounds;
    if (label === geometry.label.text && font === undefined) {
      outlines = geometry.label.paths.map(tracedPath).join("\n");
      const [x, y, w, h] = geometry.label.box;
      bounds = { x1: x, y1: y, x2: x + w, y2: y + h };
    } else {
      const bytes = font === undefined
        ? readFontBytes("ArchivoBlack-Regular.ttf")
        : fs.readFileSync(path.resolve(font));
      const face = opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
      const missing = [...new Set([...label].filter((c) => !face.hasChar(c)))];
      if (missing.length) throw Error(`フォントにない文字: ${missing.join(" ")}。対応するフォントを --font で指定してください。`);
      const outline = face.getPath(label, 0, 0, 1000);
      bounds = outline.getBoundingBox();
      outlines = `<path d="${outline.toPathData(4)}"/>`;
    }
    const width = bounds.x2 - bounds.x1, height = bounds.y2 - bounds.y1;
    if (width <= 0 || height <= 0) throw Error("資格コードに描画可能な文字がありません。");
    const scale = Math.min(target[2] / width, target[3] / height);
    // Align to the lower-right anchor, keeping the fixed frame untouched.
    const x = target[0] + target[2] - width * scale - bounds.x1 * scale;
    const y = target[1] + target[3] - height * scale - bounds.y1 * scale;
    variable = `<g id="qualification" transform="matrix(${number(scale)} 0 0 ${number(scale)} ${number(x)} ${number(y)})">\n${outlines}\n</g>`;
  }
  const title = escapeXml(`OpenCBT${label.trim() ? ` ${label}` : ""}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 ${side} ${side}" role="img" aria-labelledby="title">\n<title id="title">${title}</title>\n${background === "transparent" ? "" : `<rect width="${side}" height="${side}"${backgroundRadius ? ` rx="${number(side * backgroundRadius)}"` : ""} fill="${background}"/>\n`}<g fill="${ink}">\n<g id="common-frame">${tracedPath(geometry.frame)}</g>\n${variable}\n</g>\n</svg>\n`;
}

export function renderPng(svg, size) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false },
  }).render().asPng();
}

// ICO directory entries point at PNG images rendered at each native size.
export function makeIco(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  for (const [i, { size, png }] of images.entries()) {
    const entry = 6 + i * 16;
    header[entry] = header[entry + 1] = size === 256 ? 0 : size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  }
  return Buffer.concat([header, ...images.map((p) => p.png)]);
}

/** @param {{label?: string, ink?: string, background?: string, backgroundRadius?: number, font?: string, box?: string}} [options] */
export function createIconFiles({ background = "#ffffff", backgroundRadius = 0.18, ...options } = {}) {
  const brand = makeBrandSvg(options);
  const favicon = makeBrandSvg({ ...options, background, backgroundRadius });
  const appIcon = makeBrandSvg({ ...options, background });
  const files = new Map([["brand-icon.svg", Buffer.from(brand)], ["favicon.svg", Buffer.from(favicon)]]);
  const icoImages = [16, 32, 48].map((size) => ({ size, png: renderPng(favicon, size) }));
  files.set("favicon.ico", makeIco(icoImages));
  for (const image of icoImages) files.set(`favicon-${image.size}.png`, image.png);
  files.set("apple-touch-icon.png", renderPng(appIcon, 180));
  files.set("app-icon-192.png", renderPng(appIcon, 192));
  files.set("app-icon-512.png", renderPng(appIcon, 512));
  return files;
}

/** @param {{outDir?: string, label?: string, ink?: string, background?: string, backgroundRadius?: number, font?: string, box?: string}} [options] */
export function generateIcons({ outDir = path.join(projectDir, "public"), ...options } = {}) {
  const files = createIconFiles(options);
  // Validate and render all outputs before writing any of them.
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, data] of files) fs.writeFileSync(path.join(outDir, name), data);
  return [...files.keys()];
}

async function main() {
  const { values } = parseArgs({ options: {
    label: { type: "string", default: "FE" },
    color: { type: "string", default: "#171717" },
    background: { type: "string", default: "#ffffff" },
    "background-radius": { type: "string", default: "0.18" },
    font: { type: "string" },
    "label-box": { type: "string" },
    "out-dir": { type: "string", default: path.join(projectDir, "public") },
    help: { type: "boolean", short: "h" },
  } });
  if (values.help) {
    console.log(`OpenCBT ベクタ・ファビコン生成\n\n` +
      `npm run icons:generate -- [options]\n\n` +
      `--label FE              可変文字。空文字なら共通枠のみ\n` +
      `--color '#171717'        枠と文字の色\n` +
      `--background '#ffffff'  ファビコン・PNG の背景色（transparent も可）\n` +
      `--background-radius 0.18 ファビコン背景の角丸R（辺に対する割合、0〜0.5）\n` +
      `--font file.ttf         可変文字のフォント（既定: Archivo Black）\n` +
      `--label-box x,y,w,h     可変文字の位置・最大寸法（座標系: ${side} × ${side}）\n` +
      `--out-dir directory    出力先（既定: public）\n\n` +
      `元の FE はトレースした輪郭を保持。文字はすべてパスに変換します。\n` +
      `既定フォントは必要時にCDNから取得し、hashを検査してキャッシュします。`);
    return;
  }
  if (values.label.trim() && values.label !== "FE" && values.font === undefined) await prepareBrandFonts(["ArchivoBlack-Regular.ttf"]);
  const files = generateIcons({ label: values.label, ink: values.color, background: values.background,
    backgroundRadius: Number(values["background-radius"]),
    font: values.font, box: values["label-box"], outDir: path.resolve(values["out-dir"]) });
  console.log(`${values.label || "共通枠"}: ${files.length} ファイルを ${path.resolve(values["out-dir"])} に生成しました。`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(); } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
