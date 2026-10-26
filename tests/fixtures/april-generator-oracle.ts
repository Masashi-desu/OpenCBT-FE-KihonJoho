import assert from "node:assert/strict";
import type { GeneratedBody } from "../../src/core/generators/definition";
import type { Block } from "../../src/core/types";

const text = (b: Block): string => b.type === "paragraph" || b.type === "code" ? b.text : "";
const row = (blocks: Block[]) => blocks.flatMap(b => b.type === "table" ? b.rows : []).flat();
const all = (b: GeneratedBody) => [...b.prompt, ...(b.contexts ?? []).flatMap(c => c.blocks)].map(text).join("\n");
function unique(b: GeneratedBody, valid: boolean[]) {
  assert.equal(new Set(b.choices.map(c => JSON.stringify(c))).size, b.choices.length);
  assert.deepEqual(valid.flatMap((yes, i) => yes ? [i] : []), [b.correctIndex]);
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const corpusCases = [
  { words: ["importance", "inflation", "information", "innovation"], a: "n", b: "f", hits: 2, total: 5 },
  { words: ["banana", "band", "car", "can"], a: "a", b: "n", hits: 4, total: 5 },
  { words: ["network", "newton", "banana", "can"], a: "n", b: "e", hits: 2, total: 4 },
  { words: ["paper", "pen", "apple", "map"], a: "p", b: "e", hits: 2, total: 5 },
];
// Reviewed service boundaries, frozen independently of the production options.
// NIST SP 800-145, September 2011, p.3 (PDF p.7): PaaS consumer
// controls deployed applications, not the OS; IaaS consumer controls the OS.
// https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-145.pdf
// DBMS scope and delegation come from the explicit fictional contract, not
// a claim that every real PaaS/DBaaS product has identical responsibilities.
const cloudFacts = [
  { DBMS: "B社", OS: "B社", login: "C社", premise: "PaaS上のDBMS" },
  { DBMS: "B社", OS: "C社", login: "C社", premise: "OSの導入と運用もC社" },
  { DBMS: "C社", OS: "B社", login: "C社", premise: "DBMSはC社がユーザープログラムとして導入・運用" },
];

export function aprilGeneratorOracle(number: number, b: GeneratedBody, values: number[]) {
  const prompt = all(b), options = b.choices.map(c => c.map(text).join(""));
  if (number === 1) {
    const m = prompt.match(/0歳から(\d+)歳までは(\d+)円、(\d+)歳から(\d+)歳までは(\d+)円、(\d+)歳以上は(\d+)円/)!;
    assert(m); const [, l, f1, start, h, f2, adult, f3] = m.map(Number);
    assert.deepEqual([l, h, f1, f2, f3], [values[0], values[0] + values[1], values[2] * 100, (values[2] + values[3]) * 100, (values[2] + 2 * values[3]) * 100]);
    assert.equal(start, l + 1); assert.equal(adult, h + 1);
    const atom = (s: string, age: number) => {
      const found = s.replace(/[()]/g, "").trim().match(/^age が (\d+) (以上|以下|より大きい|より小さい|と等しい)$/)!;
      assert(found, s); const limit = Number(found[1]);
      return ({ "以上": age >= limit, "以下": age <= limit, "より大きい": age > limit, "より小さい": age < limit, "と等しい": age === limit })[found[2]];
    };
    const condition = (s: string, age: number): boolean => s.includes(" and ") ? s.split(" and ").every(x => atom(x, age)) : s.includes(" or ") ? s.split(" or ").some(x => atom(x, age)) : !!atom(s, age);
    unique(b, options.map(option => Array.from({ length: h + 5 }, (_, age) => age).every(age =>
      (age <= l ? f1 : condition(option, age) ? f2 : f3) === (age < start ? f1 : age < adult ? f2 : f3))));
    for (const amount of [f1, f2, f3]) assert(prompt.includes(`ret ← ${amount}`));
    assert(b.explanation.includes(`${h}以下`));
  } else if (number === 2) {
    const base = Number(prompt.match(/要素番号は(\d)から/)![1]);
    const data = prompt.match(/array ← \{([^}]+)\}/)![1].split(",").map(Number);
    assert.equal(base, values[0]); assert.equal(data.length, values[1]);
    assert.deepEqual(data, Array.from({ length: values[1] }, (_, i) => i + 1 + values[2]));
    assert(prompt.includes(`left を ${base} から`));
    assert(prompt.includes(base ? "÷ 2 の商) まで" : "÷ 2 の商) − 1 まで"));
    unique(b, b.choices.map(c => {
      const [a, target] = row(c), offset = a.match(/left(?: ([＋−]) (\d+))?$/)!;
      assert(offset, a); const adjustment = offset[1] ? Number(offset[2]) * (offset[1] === "＋" ? 1 : -1) : 0;
      const actual = [...data];
      for (let i = 0; i < Math.floor(data.length / 2); i++) {
        const left = base + i, right = data.length - left + adjustment;
        if (right < base || right >= base + data.length) return false;
        const tmp = actual[right - base]; actual[right - base] = actual[left - base];
        actual[(target === "array[left]" ? left : right) - base] = tmp;
      }
      return same(actual, [...data].reverse());
    }));
    assert(b.explanation.includes(`{${[...data].reverse().join(", ")}}`));
  } else if (number === 3) {
    const sentinel = values[0] === 1;
    assert(prompt.includes(sentinel ? "空リストのlistHeadと" : "空のときは、listHeadは未定義"));
    assert(prompt.includes(sentinel ? "prev.next が endNodeと等しくない" : "prev.next が 未定義でない"));
    const figure = b.prompt.find(x => x.type === "diagram")!;
    assert(figure.type === "diagram" && figure.scene.kind === "source_figure");
    assert.equal(figure.scene.profile, "list-element-class"); assert.deepEqual(figure.scene.values, [values[0]]);
    unique(b, b.choices.map(c => [0, 1, 4].every(length => {
      type Node = { val: string; next?: Node };
      const end: Node | undefined = sentinel ? { val: "END" } : undefined;
      let head = end;
      for (let i = length - 1; i >= 0; i--) head = { val: String(i), next: head };
      const curr: Node = { val: "new", next: end }, [condition, target] = row(c);
      const isEmpty = head === end;
      const saysEmpty = condition === (sentinel ? "endNodeと等しい" : "未定義");
      if (saysEmpty ? isEmpty : !isEmpty) head = curr;
      else {
        let prev = head, steps = 0;
        while (prev && prev !== end && prev.next !== end && steps++ < 10) prev = prev.next;
        if (!prev || prev === end || steps >= 10) return false;
        prev.next = target === "curr" ? curr : target === "curr.next" ? curr.next : target === "prev" ? prev : head;
      }
      const actual: string[] = [], seen = new Set<Node>();
      for (let node = head; node !== end; node = node.next) {
        if (!node || seen.has(node)) return false;
        seen.add(node); actual.push(node.val);
      }
      return same(actual, [...Array.from({ length }, (_, i) => String(i)), "new"]);
    })));
  } else if (number === 4) {
    const literal = prompt.match(/呼び出したとき/) ? prompt.match(/transformSparseMatrix\((\{\{.*\}\})\)として/)![1] : "";
    const matrix = JSON.parse(literal.replaceAll("{", "[").replaceAll("}", "]")) as number[][];
    assert.equal(matrix.length, 5); assert(matrix.every(r => r.length === 5));
    // Independent inverse mapping to the manually reviewed original matrix.
    const original = [[3,0,0,0,0],[0,2,2,0,0],[0,0,0,1,3],[0,0,0,2,0],[0,0,0,0,1]];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++)
      assert.equal(matrix[(r + values[0]) % 5][(c + values[1]) % 5], original[r][c] ? (original[r][c] + values[2] - 1) % 3 + 1 : 0);
    const coordinates = matrix.flatMap((r, i) => r.flatMap((n, j) => n ? [[i + 1, j + 1, n]] : []));
    assert.equal(coordinates.length, 7);
    unique(b, b.choices.map(c => {
      const arrays = row(c).map(s => s.split(",").map(Number));
      const triples = arrays[0].map((r, i) => [r, arrays[1][i], arrays[2][i]]);
      return same(triples, coordinates);
    }));
    const restored = Array.from({ length: 5 }, () => Array<number>(5).fill(0));
    coordinates.forEach(([r,c,n]) => { restored[r-1][c-1] = n; }); assert.deepEqual(restored, matrix);
    for (const column of [0,1,2]) assert(b.explanation.includes(coordinates.map(p => p[column]).join(", ")));
    assert(prompt.includes("要素番号は1から")); assert(prompt.includes("要素数0の配列を三つ"));
  } else if (number === 5) {
    const sample = corpusCases[values[0]], internal = !!values[1];
    for (const word of sample.words) assert(prompt.includes(`“${word}”`));
    assert(prompt.includes(`語末以外の“${sample.a}”は${sample.total}個`));
    assert(prompt.includes(`“${sample.b}”であるものは${sample.hits}個`));
    assert(prompt.includes("異なる2文字")); assert(prompt.includes("実数として計算"));
    const methods = b.prompt.find(x => x.type === "table")!; assert(methods.type === "table");
    assert.equal(methods.rows[1][0], internal ? "freqI(文字列型: str)" : "freqE(文字列型: str)");
    assert(methods.rows[1][2].includes(internal ? "末尾以外" : "終わる英単語の数"));
    const f = b.prompt.find(x => x.type === "diagram")!; assert(f.type === "diagram" && f.scene.kind === "source_figure");
    assert.deepEqual(f.scene.values, [values[0]]);
    // Decode the displayed formula, then evaluate through independent string
    // slicing. No production probability/answer helper is used.
    const den = (s: string) => internal ? `words.freqI(${s})` : `(words.freq(${s}) − words.freqE(${s}))`;
    const forms = [den("s1") + " ÷ words.freq(s1 ＋ s2)", den("s2") + " ÷ words.freq(s1 ＋ s2)", "words.freq(s1 ＋ s2) ÷ " + den("s1"), "words.freq(s1 ＋ s2) ÷ " + den("s2")];
    assert(options.every(c => forms.includes(c)));
    const vocab = ["a", "b", "aa", "ab", "ba", "bb", "aaa", "aab", "aba", "abb", "baa", "bab", "bba", "bbb"];
    const tests = vocab.flatMap(a => vocab.map(bb => [a, bb]));
    tests.push([], ["z"], ...corpusCases.map(c => c.words));
    const works = options.map(() => true);
    for (const words of tests) for (const [a, second] of [["a", "b"], ["b", "a"], [sample.a, sample.b]]) {
      const links = words.flatMap(w => Array.from({length: Math.max(0, w.length - 1)}, (_, i) => w.slice(i, i+2)));
      const aCount = links.filter(x => x[0] === a).length, bCount = links.filter(x => x[0] === second).length, hits = links.filter(x => x === a + second).length;
      const expected = hits ? hits / aCount : 0;
      options.forEach((option, i) => {
        const index = forms.indexOf(option), actual = !hits ? 0 : [aCount / hits, bCount / hits, hits / aCount, hits / bCount][index];
        if (actual !== expected) works[i] = false;
      });
    }
    unique(b, works);
  } else if (number === 6) {
    const fact = cloudFacts[values[0]]; assert(prompt.includes(fact.premise));
    assert(prompt.includes("Webアプリケーションプログラムの脆弱性対策はC社"));
    const issues = b.contexts![1].blocks.map(text);
    const order = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]][values[1]];
    assert.deepEqual(issues.map(s => s.includes("DBMS") ? 0 : s.includes("OS") ? 1 : 2), order);
    const expected = issues.map(s => s.includes("DBMS") ? fact.DBMS : s.includes("OS") ? fact.OS : fact.login);
    assert.equal(issues.length, 3);
    unique(b, b.choices.map(c => same(row(c), expected)));
    for (const org of expected) assert(b.explanation.includes(org));
  } else throw Error(`Missing April oracle ${number}`);
}
