import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { legacy2018SpringPm1StudyTerms as q1 } from "../src/core/generators/legacy-2018-spring-pm1-study-terms";
import { legacy2018SpringPm2StudyTerms as q2 } from "../src/core/generators/legacy-2018-spring-pm2-study-terms";
import { legacy2018SpringPm3StudyTerms as q3 } from "../src/core/generators/legacy-2018-spring-pm3-study-terms";
import { legacy2018SpringPm4StudyTerms as q4 } from "../src/core/generators/legacy-2018-spring-pm4-study-terms";
import { legacy2018SpringPm13StudyTerms as q13 } from "../src/core/generators/legacy-2018-spring-pm13-study-terms";
import { spring2018TermReview as reviewed, spring2018TermExpansions as expansions } from "./fixtures/legacy-2018-spring-pm1-4-13-term-review";
const questions = { 1: q1, 2: q2, 3: q3, 4: q4, 13: q13 };

test("58用語は5大問だけに属し、原資料で査読した全意味・19略語展開を保つ", () => {
  let count = 0, expanded = 0;
  for (const [number, terms] of Object.entries(questions)) {
    assert.equal(new Set(terms.map(t => t.term)).size, terms.length);
    assert.deepEqual(terms.map(t => t.term).sort(), Object.keys(reviewed[Number(number)]).sort());
    for (const term of terms) {
      assert.deepEqual(term.sources, [`2018h30h-fe-pm-${number}`]);
      for (const fact of reviewed[Number(number)][term.term]) assert(term.meaning.includes(fact), `${number}/${term.term}/${fact}`);
      const expansion = expansions[number + "/" + term.term];
      if (expansion) { assert.equal(term.expansion, expansion); expanded++; }
      else assert.equal(term.expansion, undefined, `${term.term} is not given a fabricated expansion`);
      assert(!/未登録|未受入|pending|独立検算|private|Schema|registry/.test(term.meaning)); count++;
    }
  }
  assert.equal(count, 58); assert.equal(expanded, 19);
});

test("用語が区別する論理境界・SQL三値・CPU通信両条件を別方式で具体検算する", () => {
  for (const x of [0, 1]) for (const y of [0, 1]) {
    const addition = x + y, low = addition % 2, carry = Math.floor(addition / 2);
    assert.equal(low, x === y ? 0 : 1); assert.equal(carry, x && y);
    const threshold = (value: number) => value >= 3 ? 1 : 0;
    assert.equal(threshold(2), 0); assert.equal(threshold(3), 1); assert.equal(threshold(4), 1);
  }
  // Real SQLite is a test-only independent SQL evaluator; no runtime import.
  const db = new DatabaseSync(":memory:");
  try {
    assert.equal(db.prepare("SELECT NULL = NULL AS v").get()!.v, null);
    assert.equal(db.prepare("SELECT 1 NOT IN (2,NULL) AS v").get()!.v, null);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM (SELECT 1 WHERE NULL)").get()!.n, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM (SELECT DISTINCT 1 UNION SELECT 1)").get()!.n, 1);
  } finally { db.close(); }
  const counts = [[10, 100], [100, 10], [30, 50]];
  for (const [cpuSeconds, networkSeconds] of counts) {
    const required = Math.max(Math.ceil(cpuSeconds / 50), Math.ceil(networkSeconds / 50));
    assert(cpuSeconds / required <= 50 && networkSeconds / required <= 50);
    if (required > 1) assert(cpuSeconds / (required - 1) > 50 || networkSeconds / (required - 1) > 50);
  }
});

test("表計算の1始まり位置・0始まりの相対ずれ・同率・端点接触の各境界を区別する", () => {
  const roomNumbers = [501, 702, 801], rates = [0.5, 0.5, 0];
  const position = rates.findIndex(x => x === Math.max(...rates)) + 1;
  assert.equal(position, 1); assert.equal(roomNumbers[position - 1], 501); assert.notEqual(position, roomNumbers[0]);
  assert.equal(2 + (position - 1), 2); // D2 shifted by (position-1) rows.
  const overlap = (start: number, end: number, bookedStart: number, bookedEnd: number) => start < bookedEnd && bookedStart < end;
  assert.equal(overlap(9, 10, 10, 11), false); assert.equal(overlap(9, 11, 10, 12), true);
  const capacity = (people: number, seats: number, screen: boolean, needsScreen: boolean, usable: boolean) =>
    people > seats || needsScreen && !screen || !usable ? 0 : people / seats;
  assert.equal(capacity(10, 10, true, true, true), 1);
  assert.equal(capacity(11, 10, true, true, true), 0);
  assert.equal(capacity(5, 10, false, true, true), 0);
  assert.equal(capacity(5, 10, true, false, false), 0);
  assert.equal(capacity(5, 10, false, false, true), 0.5);
});
