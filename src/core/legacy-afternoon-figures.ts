import type { Block } from "./types";
import { DataError } from "./errors";
import { legacyAfternoonDefinitions } from "./generators/legacy-afternoon-definitions";

// Enumerated, managed inputs only. Bounds are schema documentation; runtime
// acceptance uses exact tuples, including sparse domains and coupled fields.
const figures = new Map<string, Map<string, { alt: string; caption: string }>>();
for (const definition of legacyAfternoonDefinitions) {
  const visit = (index: number, values: number[]) => {
    if (index < definition.fields.length) {
      const field = definition.fields[index];
      for (let value = field.minimum; value <= field.maximum; value++) visit(index + 1, [...values, value]);
      return;
    }
    let body;
    try { body = definition.build(values); }
    catch (error) {
      if (error instanceof Error && error.message === "PARAMETER_CONSTRAINT") return;
      throw error;
    }
    const blocks: Block[] = [...body.prompt, ...body.choices.flat(), ...(body.contexts ?? []).flatMap(context => context.blocks)];
    for (const block of blocks) {
      if (block.type !== "diagram" || block.scene.kind !== "source_figure" ||
        block.scene.profile === "legacy-2017-pm3-waste-database") continue;
      const rows = figures.get(block.scene.profile) ?? new Map();
      const key = JSON.stringify(block.scene.values);
      const row = Object.freeze({ alt: block.alt, caption: block.caption });
      if (rows.has(key) && JSON.stringify(rows.get(key)) !== JSON.stringify(row))
        throw Error("Conflicting managed afternoon figure");
      rows.set(key, row); figures.set(block.scene.profile, rows);
    }
  };
  visit(0, []);
}
export const legacyAfternoonFigureDomains = Object.freeze(Object.fromEntries([...figures].map(([profile, rows]) => {
  const values = [...rows.keys()].map(key => JSON.parse(key) as number[]);
  return [profile, Object.freeze(values[0].map((_, index) => Object.freeze([Math.min(...values.map(row => row[index])), Math.max(...values.map(row => row[index]))])))];
})));
export const isLegacyAfternoonFigure = (profile: string) => figures.has(profile);
export function readLegacyAfternoonFigure(profile: string, values: unknown) {
  if (!Array.isArray(values) || Object.getPrototypeOf(values) !== Array.prototype ||
    Reflect.ownKeys(values).length !== values.length + 1 ||
    Array.from({ length: values.length }, (_, index) => Object.getOwnPropertyDescriptor(values, String(index)))
      .some(descriptor => !descriptor || !("value" in descriptor) || !Number.isSafeInteger(descriptor.value) || Object.is(descriptor.value, -0)))
    throw new DataError("FIGURE_PROFILE", "旧午後の図の入力が不正です。");
  const row = figures.get(profile)?.get(JSON.stringify(values));
  if (!row) throw new DataError("FIGURE_PROFILE", "旧午後の図に未登録の条件が指定されています。");
  return row;
}
