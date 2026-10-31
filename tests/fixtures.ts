import type { Bundle } from "../src/core/types";
import { readDistributionBundle } from "../scripts/distribution-files";
import { ensureLegacyMorningGenerators } from "../src/core/generators/legacy-morning-install";

// Only executable workflow tests opt in; raw historical/carrier fixtures stay
// synchronous and do not change the managed registry merely by importing them.
export async function installFixtureGenerators(): Promise<void> {
  await ensureLegacyMorningGenerators(readDistributionBundle());
}
export function fixture(): Bundle {
  const b = readDistributionBundle();
  b.questions.sort(
    (a, c) =>
      Number(a.origin.sourceRefs[0]?.locator.questionNumber ?? 0) -
      Number(c.origin.sourceRefs[0]?.locator.questionNumber ?? 0),
  );
  return b;
}
