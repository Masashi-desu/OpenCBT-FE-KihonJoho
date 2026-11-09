import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { createServer } from "vite";
import { schemaDirectory, validatorFile } from "../scripts/compile-schemas.mjs";
import { devSchemaValidators } from "../scripts/dev-schema-validators";

async function waitFor(condition: () => boolean | Promise<boolean>, message: string) {
  const deadline = Date.now() + 10_000;
  while (!(await condition())) {
    assert(Date.now() < deadline, message);
    await delay(50);
  }
}

test("Vite replaces stale validators at startup and reloads them after schema edits", async () => {
  await fs.mkdir("output", { recursive: true });
  const root = await fs.mkdtemp(path.resolve("output/dev-schema-test-"));
  const schemas = path.join(root, schemaDirectory);
  const schemaFile = path.join(schemas, "catalog.schema.json");
  const generated = path.join(root, validatorFile);
  try {
    await fs.cp(schemaDirectory, schemas, { recursive: true });
    await fs.mkdir(path.join(root, "src/core"), { recursive: true });
    await fs.copyFile("src/core/unicode.js", path.join(root, "src/core/unicode.js"));
    await fs.mkdir(path.dirname(generated), { recursive: true });
    await fs.writeFile(generated, "export const catalog = () => false;\n");
    const server = await createServer({
      root,
      configFile: false,
      publicDir: false,
      plugins: [devSchemaValidators()],
      logLevel: "silent",
      optimizeDeps: { noDiscovery: true, include: [] },
      server: { middlewareMode: true, hmr: false },
    });
    try {
      const catalog = JSON.parse(await fs.readFile("public/data/catalog.json", "utf8"));
      const accepts = async () => (await server.ssrLoadModule("/" + validatorFile)).catalog(catalog);
      assert.equal(await accepts(), true);
      await waitFor(() => server.watcher.getWatched()[schemas]?.includes(path.basename(schemaFile)) === true,
        "Vite should watch the source schemas");

      const original = await fs.readFile(schemaFile, "utf8");
      const modified = JSON.parse(original);
      modified.properties.scope.enum = ["docs_fixture"];
      await fs.writeFile(schemaFile, JSON.stringify(modified));
      await waitFor(async () => !(await accepts()), "An already-loaded validator should use the edited schema");

      await fs.writeFile(schemaFile, original);
      await waitFor(accepts, "Restoring the schema should restore the validator");

      const current = await fs.readFile(generated, "utf8");
      await fs.writeFile(generated, "export const catalog = () => false;\n");
      await waitFor(async () => (await fs.readFile(generated, "utf8")) === current && await accepts(),
        "A stale write to the generated file should be repaired by the running server");
    } finally {
      await server.close();
    }
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
