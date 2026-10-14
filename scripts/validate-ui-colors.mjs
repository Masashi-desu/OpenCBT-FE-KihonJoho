import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import ts from "typescript";

const palettePath = "src/ui/tokens.css";
const namedColors = new Set(("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen").split(" "));
const references = value => [...value.matchAll(/\bvar\(\s*(--[\w-]+)/g)].map(match => match[1]);
const colorProperty = property => {
  const name = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  if (/-(?:width|radius|spacing|size|position|repeat|clip|origin|attachment|dasharray|dashoffset|linecap|linejoin|miterlimit)$/.test(name)) return false;
  return /^(?:color|background(?:-.+)?|border(?:-.+)?|outline(?:-.+)?|fill|stroke(?:-.+)?|box-shadow|text-shadow|text-decoration(?:-.+)?|column-rule(?:-.+)?|caret-color|accent-color|filter)$/i.test(name);
};
export function hasFixedColor(value) {
  const plain = value.replace(/url\([^)]*\)/gi, "");
  return /#[\da-f]{3}(?:[\da-f]{1}|[\da-f]{3}|[\da-f]{5})?\b/i.test(plain) ||
    /\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|device-cmyk)\s*\(/i.test(plain) ||
    plain.replace(/\bvar\(\s*--[\w-]+\s*(?:,\s*)?/g, "var(").split(/[^a-z]+/i).some(word => namedColors.has(word.toLowerCase()));
}

export function inspectPalette(source) {
  const issues = [], light = new Map(), dark = new Map();
  const tree = postcss.parse(source, { from: palettePath });
  tree.walkDecls(declaration => {
    if (!declaration.prop.startsWith("--")) { issues.push(`正本にはCSS変数だけを定義: ${declaration.prop}`); return; }
    const selector = declaration.parent.selector ?? "";
    if (!selector.split(",").every(part => /^:root(?:\.dark|\[data-theme=(?:"dark"|'dark'|dark)\])?$/.test(part.trim()))) {
      issues.push(`正本の定義先は:rootとダークテーマ: ${selector}`); return;
    }
    (selector.includes("dark") ? dark : light).set(declaration.prop, declaration.value);
  });
  const tokens = new Set(light.keys());
  for (const key of tokens) if (key !== "--font" && !dark.has(key)) issues.push(`ダークテーマの定義なし: ${key}`);
  for (const key of dark.keys()) if (!tokens.has(key)) issues.push(`ライトテーマの定義なし: ${key}`);
  for (const [theme, values] of [["light", light], ["dark", new Map([...light, ...dark])]]) {
    const completed = new Set(), visiting = new Set();
    const visit = key => {
      if (completed.has(key)) return;
      if (visiting.has(key)) { issues.push(`${theme}の変数参照が循環: ${key}`); return; }
      visiting.add(key);
      for (const dependency of references(values.get(key) ?? "")) {
        if (!tokens.has(dependency)) issues.push(`${theme}の未知の色変数: ${dependency}`);
        else visit(dependency);
      }
      visiting.delete(key); completed.add(key);
    };
    for (const key of values.keys()) visit(key);
  }
  return { tokens, light, dark, issues };
}

export function inspectColorCss(source, file, tokens) {
  const tree = postcss.parse(source, { from: file }), issues = [];
  const local = new Set();
  tree.walkDecls(declaration => { if (declaration.prop.startsWith("--")) local.add(declaration.prop); });
  tree.walkDecls(declaration => {
    const { prop, value } = declaration, at = `${file}:${declaration.source.start.line}`;
    if (tokens.has(prop)) issues.push(`${at} 共通変数を画面側で上書きしない: ${prop}`);
    if (!prop.startsWith("--") && !colorProperty(prop)) return;
    const visual = prop.startsWith("--visual-") && declaration.prev()?.type === "comment" && /^visual-color:\s*\S/.test(declaration.prev().text.trim());
    if (hasFixedColor(value) && !visual) issues.push(`${at} 固定色・色のフォールバックは正本のCSS変数を使用: ${prop}`);
    // Border/shadow shorthands can also consume numeric lengths supplied by the
    // component (for example the question rail height). They are not color roles.
    const dimensions = /^(?:border(?:-(?:top|bottom|left|right))?|outline|box-shadow|text-shadow|column-rule)$/.test(prop)
      ? new Set([...value.matchAll(/var\(\s*(--[\w-]+)\s*,\s*-?(?:\d*\.)?\d+(?:[a-z%]+)?\s*\)/gi)].map(match => match[1])) : new Set();
    for (const variable of references(value)) if (!tokens.has(variable) && !local.has(variable) && !dimensions.has(variable)) issues.push(`${at} 未定義の色変数: ${variable}`);
  });
  return issues;
}

export function inspectInlineColors(source, file, tokens, knownVariables = tokens) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS);
  const issues = [];
  const keyOf = node => node && (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) ? node.text : undefined;
  const inspect = (node, key) => {
    const at = `${file}:${tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1}`;
    if (tokens.has(key)) issues.push(`${at} 共通変数をJSで上書きしない: ${key}`);
    if (!colorProperty(key) && !tokens.has(key)) return;
    const visit = item => {
      if (ts.isStringLiteralLike(item) || ts.isTemplateHead(item) || ts.isTemplateMiddle(item) || ts.isTemplateTail(item)) {
        if (hasFixedColor(item.text)) issues.push(`${at} インラインの固定色はCSS変数を使用: ${key}`);
        for (const variable of references(item.text)) if (!knownVariables.has(variable)) issues.push(`${at} 未定義の色変数: ${variable}`);
      }
      ts.forEachChild(item, visit);
    };
    visit(node);
  };
  const visit = node => {
    if (ts.isJsxAttribute(node)) {
      const key = keyOf(node.name); if (key && node.initializer) inspect(node.initializer, key);
    } else if (ts.isPropertyAssignment(node)) {
      const key = keyOf(node.name); if (key) inspect(node.initializer, key);
    } else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const key = ts.isPropertyAccessExpression(node.left) ? keyOf(node.left.name) : ts.isElementAccessExpression(node.left) ? keyOf(node.left.argumentExpression) : undefined;
      if (key) inspect(node.right, key);
    } else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
      ["setProperty", "setAttribute"].includes(node.expression.name.text) && node.arguments.length >= 2) {
      const key = keyOf(node.arguments[0]); if (key) inspect(node.arguments[1], key);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return issues;
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : /\.(?:css|tsx?|js|html)$/.test(file) ? [file] : [];
  });
}
export function validateUiColors(root = ".") {
  const source = fs.readFileSync(path.join(root, palettePath), "utf8"), palette = inspectPalette(source);
  const issues = [...palette.issues];
  const files = [
    ...walk(path.join(root, "src/ui")),
    ...walk(path.join(root, "docs/.vitepress/theme")),
    ...walk(path.join(root, "public/explanations")),
    path.join(root, "index.html"),
  ];
  const knownVariables = new Set(palette.tokens);
  for (const file of files.filter(file => file.endsWith(".css"))) {
    postcss.parse(fs.readFileSync(file, "utf8")).walkDecls(declaration => {
      if (declaration.prop.startsWith("--")) knownVariables.add(declaration.prop);
    });
  }
  for (const file of files) {
    const relative = path.relative(root, file).replaceAll(path.sep, "/"), text = fs.readFileSync(file, "utf8");
    if (relative === palettePath) continue;
    if (relative.startsWith("public/explanations/") && /\/(theme|scrollbars)\.css$/.test(relative)) {
      const original = relative.endsWith("/theme.css") ? source : fs.readFileSync(path.join(root, "src/ui/scrollbars.css"), "utf8");
      if (text !== original) issues.push(`${relative} 正本の生成した複製と不一致`);
      continue;
    }
    if (file.endsWith(".css")) issues.push(...inspectColorCss(text, relative, palette.tokens));
    else if (/\.(?:tsx?|js)$/.test(file)) issues.push(...inspectInlineColors(text, relative, palette.tokens, knownVariables));
    else {
      const html = text.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
      for (const [, css] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) issues.push(...inspectColorCss(css, relative, palette.tokens));
      for (const [, , css] of html.matchAll(/\bstyle=("|')([\s\S]*?)\1/gi)) issues.push(...inspectColorCss(`element{${css}}`, relative, palette.tokens));
    }
  }
  return { issues: [...new Set(issues)], files: files.length, tokens: palette.tokens.size };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = validateUiColors();
  if (result.issues.length) {
    console.error(result.issues.join("\n")); process.exitCode = 1;
  } else console.log(`共通色: ${result.tokens}変数・${result.files}ファイルの参照、テーマ、生成した複製を確認`);
}
