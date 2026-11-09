import path from "node:path";
import { normalizePath, type Plugin, type ResolvedConfig } from "vite";
import { compileSchemas, schemaDirectory, validatorFile } from "./compile-schemas.mjs";

export function devSchemaValidators(): Plugin {
  let config: ResolvedConfig;
  let schemas: string;
  let validators: string;
  return {
    name: "dev-schema-validators",
    apply: "serve",
    configResolved(resolved) {
      config = resolved;
      schemas = normalizePath(path.join(config.root, schemaDirectory));
      validators = normalizePath(path.join(config.root, validatorFile));
    },
    configureServer() {
      compileSchemas(config.root);
    },
    watchChange(file) {
      const schemaChanged = path.posix.dirname(file) === schemas && file.endsWith(".schema.json");
      if (!schemaChanged && file !== validators) return;
      try {
        // A parallel CLI check can overwrite the generated file after a schema edit.
        // Unchanged output is never written, so handling its events does not loop.
        compileSchemas(config.root);
      } catch (error) {
        config.logger.error(`スキーマ検証コードを更新できません（${file}）。${String(error)}`);
      }
    },
  };
}
