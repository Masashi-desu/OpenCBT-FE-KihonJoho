import type { Bundle } from "../src/core/types";
import { readDistributionBundle } from "../scripts/distribution-files";
export function fixture(): Bundle {
  const b = readDistributionBundle();
  b.questions.sort(
    (a, c) =>
      Number(a.origin.sourceRefs[0]?.locator.questionNumber ?? 0) -
      Number(c.origin.sourceRefs[0]?.locator.questionNumber ?? 0),
  );
  return b;
}
