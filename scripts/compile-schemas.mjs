import fs from "node:fs";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import standalone from "ajv/dist/standalone/index.js";
const ajv = new Ajv({
  allErrors: true,
  strict: true,
  strictRequired: false,
  multipleOfPrecision: 8,
  code: { source: true, esm: true },
});
addFormats(ajv);
// Documentation annotations do not affect validation and need not ship in the app bundle.
function stripAnnotations(schema) {
  if (typeof schema !== "object" || schema === null) return schema;
  const out = {};
  for (const [key, value] of Object.entries(schema)) {
    if (["description", "$comment", "title"].includes(key)) continue;
    if (
      ["properties", "$defs", "patternProperties", "dependentSchemas"].includes(
        key,
      )
    )
      out[key] = Object.fromEntries(
        Object.entries(value).map(([name, child]) => [
          name,
          stripAnnotations(child),
        ]),
      );
    else if (
      [
        "additionalProperties",
        "propertyNames",
        "items",
        "contains",
        "not",
        "if",
        "then",
        "else",
      ].includes(key)
    )
      out[key] = stripAnnotations(value);
    else if (["allOf", "anyOf", "oneOf", "prefixItems"].includes(key))
      out[key] = value.map(stripAnnotations);
    else out[key] = value;
  }
  return out;
}
const schemaInput = (text) => stripAnnotations(JSON.parse(text));
for (const name of fs
  .readdirSync("docs/public/schemas")
  .filter((n) => n.endsWith(".schema.json")))
  ajv.addSchema(
    schemaInput(fs.readFileSync(`docs/public/schemas/${name}`, "utf8")),
  );
const names = [
  "catalog",
  "source",
  "rights",
  "asset",
  "question",
  "set",
  "exam",
  "template",
  "instance",
  "session",
  "result",
];
const exports = Object.fromEntries(
  names.map((n) => [
    n,
    `https://opencbt-fe-kihonjoho.example/schemas/3.0.0/${n}.schema.json`,
  ]),
);
let code = standalone(ajv, exports);
// AJV's standalone format implementation has a CommonJS import; convert it for Vite/Node ESM.
code =
  `import {fullFormats} from 'ajv-formats/dist/formats.js';\nimport equal from 'fast-deep-equal';\nimport {ucs2length as unicodeLength} from '../core/unicode.js';\n` +
  code
    .replaceAll(
      'require("ajv-formats/dist/formats").fullFormats',
      "fullFormats",
    )
    .replaceAll(
      'require("ajv/dist/runtime/ucs2length").default',
      "unicodeLength",
    )
    .replaceAll('require("ajv/dist/runtime/equal").default', "equal");
if (code.includes("require("))
  throw Error("Unconverted CommonJS dependency in standalone schema");
fs.mkdirSync("src/generated", { recursive: true });
fs.writeFileSync("src/generated/validators.js", code);
console.log(`${names.length} validators compiled without browser eval`);
