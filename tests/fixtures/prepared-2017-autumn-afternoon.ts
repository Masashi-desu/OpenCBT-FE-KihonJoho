import fs from "node:fs";
import assert from "node:assert/strict";
import type { Autumn2017Records } from "../../scripts/stage-2017-autumn-afternoon";

/** Current source-only preparation, never a saved/published historical body.
 * These records keep their excluded distribution and individual rights holds. */
export async function prepared2017AutumnAfternoon() {
  const records: { number: number; records: Autumn2017Records }[] = [];
  for (let number = 1; number <= 13; number++) {
    const metadata = JSON.parse(fs.readFileSync(`tests/fixtures/legacy-2017-autumn-pm${number}-original-metadata.json`,"utf8"));
    const module = await import(`../../scripts/import-legacy-2017-autumn-pm${number}.ts`);
    const result = await module[`legacy2017AutumnPm${number}Records`](metadata);
    const own = result.bundle ?? result.records;
    assert(own && own.questions.length === 2 && own.templates.length === 1);
    records.push({ number, records: own });
  }
  return records;
}
