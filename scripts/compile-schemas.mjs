import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import standalone from "ajv/dist/standalone/index.js";

export const schemaDirectory = "docs/public/schemas";
export const validatorFile = "src/generated/validators.js";

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
const names = [
  "catalog",
  "source",
  "rights",
  "asset",
  "question",
  "detailed-explanation",
  "set",
  "exam",
  "template",
  "instance",
  "session",
  "result",
];
const exports = Object.fromEntries(
  names.map((n) => [
    n.replaceAll("-", "_"),
    `https://opencbt-fe-kihonjoho.example/schemas/3.0.0/${n}.schema.json`,
  ]),
);
export function compileSchemas(root = process.cwd()) {
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    strictRequired: false,
    multipleOfPrecision: 8,
    code: { source: true, esm: true },
  });
  addFormats(ajv);
  const schemas = path.join(root, schemaDirectory);
  for (const name of fs.readdirSync(schemas).filter(name => name.endsWith(".schema.json"))) {
    const file = path.join(schemas, name);
    ajv.addSchema(stripAnnotations(JSON.parse(fs.readFileSync(file, "utf8"))));
  }

  // Convert the standalone validator's CommonJS imports for Vite and Node ESM.
  const code =
    `import {fullFormats} from 'ajv-formats/dist/formats.js';\nimport equal from 'fast-deep-equal';\nimport {ucs2length as unicodeLength} from '../core/unicode.js';\n` +
    standalone(ajv, exports)
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

  const output = path.join(root, validatorFile);
  if (fs.existsSync(output) && fs.readFileSync(output, "utf8") === code) return;

  fs.mkdirSync(path.dirname(output), { recursive: true });
  // Vite and CLI checks may read or regenerate the file at the same time.
  const temporary = `${output}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporary, code);
    fs.renameSync(temporary, output);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  compileSchemas();
  console.log(`${names.length} validators compiled without browser eval`);
}
