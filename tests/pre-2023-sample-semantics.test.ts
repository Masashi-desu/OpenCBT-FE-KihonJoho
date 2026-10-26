import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { aprilBReview as review } from "./fixtures/pre-2023-sample-review";

const labels = [..."アイウエオカキクケコ"];
function uniqueAnswer(question: { answer: string }, results: boolean[]) {
  assert.deepEqual(results.flatMap((ok, i) => ok ? [labels[i]] : []), [question.answer]);
}

test("April 2022 review is bound to the acquired official PDF, pages and answer table", () => {
  const evidence = JSON.parse(fs.readFileSync("scripts/source-evidence/ipa-pre-2023.json", "utf8"));
  const source = evidence.collections.find((c: { id: string }) => c.id === review.collectionId);
  assert.equal(source.questionPaper.sha256, review.questionPaper.sha256);
  assert.equal(source.questionPaper.url, review.questionPaper.url);
  assert.deepEqual(review.questions.map(q => q.number), source.questionNumbers);
  assert.deepEqual(review.questions.map(q => q.answer), source.answerKey);
  assert.deepEqual(review.questions.map(q => q.choices.length), [7, 4, 6, 4, 4, 10]);
  assert.deepEqual(review.questions.map(q => q.pages), [[2], [3], [4, 5], [6], [7, 8], [9, 10]]);
  // This cannot certify a nonexistent generator or promote acquisition metadata.
  assert.equal(source.review.generation, "pending");
});

function ageCondition(expression: string, age: number): boolean {
  if (expression.includes(" and ")) return expression.split(" and ").every(x => ageCondition(x, age));
  if (expression.includes(" or ")) return expression.split(" or ").some(x => ageCondition(x, age));
  const m = /^age が (\d+) (以上|以下|と等しい|より大きい|より小さい)$/.exec(expression.replace(/[()]/g, ""));
  assert(m, `Unreviewed expression: ${expression}`);
  const n = Number(m[1]);
  return ({ "以上": age >= n, "以下": age <= n, "と等しい": age === n, "より大きい": age > n, "より小さい": age < n })[m[2] as "以上"];
}
test("April B1: every branch and all seven conditions agree with the fee specification only for カ", () => {
  const q = review.questions[0];
  const [low, high] = q.input.boundaries, [child, junior, adult] = q.input.fees;
  // Predicates are constant above their last threshold, so 0..10 covers the
  // complete integer domain's equivalence classes, including all boundaries.
  uniqueAnswer(q, q.choices.map(condition => Array.from({ length: high + 2 }, (_, age) => age).every(age => {
    const expected = age < 4 ? 100 : age < 10 ? 300 : 500;
    return (age <= low ? child : ageCondition(condition, age) ? junior : adult) === expected;
  })));
  assert.equal(ageCondition(q.choices[5], 9), true);
  assert.equal(ageCondition(q.choices[5], 10), false);
});

function reverseCandidate(data: readonly number[], pair: readonly string[]) {
  const a: (number | undefined)[] = [undefined, ...data];
  for (let left = 1; left <= Math.floor(data.length / 2); left++) {
    assert(["arrayの要素数 − left", "arrayの要素数 − left ＋ 1"].includes(pair[0]));
    assert(["array[left]", "array[right]"].includes(pair[1]));
    const right = data.length - left + (pair[0] === "arrayの要素数 − left ＋ 1" ? 1 : 0);
    if (right < 1 || right > data.length) return;
    const saved = a[right];
    a[right] = a[left];
    a[pair[1] === "array[left]" ? left : right] = saved;
  }
  return a.slice(1);
}
test("April B2: all four filled programs are traced against reversal, including odd/even lengths", () => {
  const q = review.questions[1];
  uniqueAnswer(q, q.choices.map(pair => JSON.stringify(reverseCandidate(q.input, pair)) === JSON.stringify([...q.input].reverse())));
  for (let length = 1; length <= 8; length++) {
    const input = Array.from({ length }, (_, i) => i * 3 - 8);
    assert.deepEqual(reverseCandidate(input, q.choices[2]), [...input].reverse());
  }
  assert.equal(q.choices[2][0], "arrayの要素数 − left ＋ 1");
  assert.equal(q.choices[2][1], "array[left]");
});

type Node = { val: string; next?: Node };
function appendCandidate(input: readonly string[], value: string, pair: readonly string[]): string[] | undefined {
  let head: Node | undefined;
  for (const val of [...input].reverse()) head = { val, next: head };
  const curr: Node = { val: value };
  const isEmpty = head === undefined;
  if (pair[0] === "未定義" ? isEmpty : !isEmpty) head = curr;
  else {
    if (!head) return; // The wrong empty-list branch dereferences an undefined reference.
    let prev = head;
    while (prev.next) prev = prev.next;
    prev.next = pair[1] === "curr" ? curr : pair[1] === "curr.next" ? curr.next : head;
  }
  const seen = new Set<Node>(), output: string[] = [];
  for (let n: Node | undefined = head; n; n = n.next) {
    if (seen.has(n)) return; // Cyclic lists cannot implement append.
    seen.add(n); output.push(n.val);
  }
  return output;
}
test("April B3: six condition/reference pairs cover empty, singleton, multiple and cyclic lists", () => {
  const q = review.questions[2];
  const inputs = [[], ["a"], ["a", "b"], ["a", "b", "a"]];
  uniqueAnswer(q, q.choices.map(pair => inputs.every(input =>
    JSON.stringify(appendCandidate(input, "c", pair)) === JSON.stringify([...input, "c"]))));
  assert.equal(appendCandidate(["a"], "c", q.choices[2]), undefined, "head as the tail's next produces a cycle");
  assert.deepEqual(appendCandidate(["a"], "c", q.choices[1]), ["a"], "curr.next does not append the new node");
});

test("April B4: independent coordinate collection preserves every nonzero value and row-major order", () => {
  const q = review.questions[3];
  // Enumerate columns first, then sort coordinates, independently of the
  // original's row-first accumulation into three arrays.
  const coordinates = q.input[0].flatMap((_, col) => q.input.flatMap((row, r) => row[col] ? [[r + 1, col + 1, row[col]]] : []))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const expected = [0, 1, 2].map(i => coordinates.map(c => c[i]));
  uniqueAnswer(q, q.choices.map(c => JSON.stringify(c) === JSON.stringify(expected)));
  const [rows, columns, values] = q.choices[1];
  const restored = q.input.map(row => row.map(() => 0 as number));
  rows.forEach((r, i) => { restored[r - 1][columns[i] - 1] = values[i]; });
  assert.deepEqual(restored, q.input);
});

function directBigram(words: readonly string[], first: string, second: string) {
  const following = words.flatMap(word => [...word].slice(0, -1).flatMap((char, i) => char === first ? [word[i + 1]] : []));
  return following.length ? following.filter(char => char === second).length / following.length : 0;
}
function filledProbability(words: readonly string[], first: string, second: string, formula: string) {
  const freq = (str: string) => words.reduce((total, word) => total + [...word].filter((_, i) => word.startsWith(str, i)).length, 0);
  const endings = (str: string) => words.filter(word => word.endsWith(str)).length;
  const pairCount = freq(first + second);
  if (!pairCount) return 0; // Original program's guard, not an added division rule.
  const expressions = review.questions[4].choices;
  switch (formula) {
    case expressions[0]: return (freq(first) - endings(first)) / pairCount;
    case expressions[1]: return (freq(second) - endings(second)) / pairCount;
    case expressions[2]: return pairCount / (freq(first) - endings(first));
    case expressions[3]: return pairCount / (freq(second) - endings(second));
    default: throw Error("Unreviewed formula");
  }
}
test("April B5: all four formulas, overlapping occurrences, terminal exclusions and absent pairs", () => {
  const q = review.questions[4], { words, c1, c2 } = q.input;
  assert.equal(directBigram(words, c1, c2), 0.4);
  uniqueAnswer(q, q.choices.map(c => filledProbability(words, c1, c2, c) === directBigram(words, c1, c2)));
  const vocabulary = ["a", "b", "aa", "ab", "ba", "bb", "aaa", "aab", "aba", "abb", "baa", "bab", "bba", "bbb"];
  for (const firstWord of vocabulary) for (const secondWord of vocabulary) {
    const corpus = [firstWord, secondWord];
    for (const [a, b] of [["a", "b"], ["b", "a"]])
      assert.equal(filledProbability(corpus, a, b, q.choices[2]), directBigram(corpus, a, b));
  }
  for (const corpus of [[], ["x"], ["n", "nn"], ["f", "ff"]])
    assert.equal(filledProbability(corpus, "n", "f", q.choices[2]), 0);
});

test("April B6: all ten responsibility triples obey the question's PaaS boundary and explicit contract", () => {
  const q = review.questions[5];
  const expected = q.issues.map(issue => q.responsibilities[issue]);
  uniqueAnswer(q, q.choices.map(c => c.every((organization, i) => organization === expected[i])));
  assert.equal(q.premises.length, 4);
  assert.deepEqual(expected, ["B社", "B社", "C社"]);
});
