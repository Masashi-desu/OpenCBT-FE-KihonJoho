// Independent finite models for the displayed 2019 source algorithm forms.
import assert from "node:assert/strict";
import { legacy2019Tree } from "../../src/core/generators/legacy-2019-algorithms";
import { legacy2019GcdCases, legacy2019ReviewedTrees, legacy2019StackCases } from "./legacy-2019-algorithms-review";
import type { GeneratedBody } from "../../src/core/generators/definition";
import type { Block } from "../../src/core/types";

const texts = (blocks: Block[]) => blocks.flatMap(b => b.type === "paragraph" || b.type === "code" ? [b.text] : []).join("\n");
function reviewedEdges(parent: number): [number,number][] { return [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[parent,7],[parent,8]]; }
function readScene(block: Block) { assert(block.type === "diagram" && block.scene.kind === "source_figure"); return block.scene; }
function stackAssignmentExists(input: string, desired: string, count: number) {
  for (let assignment = 0; assignment < count ** input.length; assignment++) {
    let digits = assignment, written = 0;
    const stacks = Array.from({ length: count }, () => [] as string[]);
    for (const character of input) {
      stacks[digits % count].push(character); digits = Math.floor(digits / count);
      let changed = true;
      while (changed) {
        changed = false;
        for (const stack of stacks) if (written < desired.length && stack.length && stack.at(-1) === desired[written]) { stack.pop(); written++; changed = true; break; }
      }
    }
    if (written === desired.length) return true;
  }
  return false;
}
function oracle(source: string, body: GeneratedBody, values: number[]) {
  const prompt = texts(body.prompt), choices = body.choices.map(texts); let truth: boolean[];
  if (source === "2019h31h-fe-am-5") {
    const range = prompt.match(/数字(\d+)〜(\d+)/)!; assert(range); assert.deepEqual(range.slice(1).map(Number), [1+values[1],9+values[1]]);
    truth = body.choices.map((choice,candidate) => {
      const scene = readScene(choice[0]); assert.equal(scene.profile,"legacy-2019-bst"); assert.deepEqual(scene.values,[values[0],candidate,values[1]]);
      const frozen = legacy2019ReviewedTrees[values[0]][candidate], expected = frozen.values.map(v => v+values[1]), edges = reviewedEdges(frozen.parent);
      const actual = legacy2019Tree(...scene.values as [number,number,number]); assert.deepEqual(actual.values,expected); assert.deepEqual(actual.edges,edges);
      const visit = (node: number, lower: number, upper: number): boolean => {
        if (!(expected[node] > lower && expected[node] < upper)) return false;
        const children = edges.filter(e => e[0] === node).map(e => e[1]);
        return !children.length || visit(children[0],lower,expected[node]) && visit(children[1],expected[node],upper);
      };
      return visit(0,-Infinity,Infinity);
    });
    assert(body.explanation.includes("左部分木")); assert(body.explanation.includes("祖先"));
  } else if (source === "2019h31h-fe-am-7") {
    const m = prompt.match(/Aが(\d+)、Bが(\d+)/)!; assert(m); let [a,b] = m.slice(1).map(Number);
    assert.deepEqual([a,b],[legacy2019GcdCases[values[0]].A,legacy2019GcdCases[values[0]].B]);
    let sumQuotients = 0; while (b) { const q = Math.floor(a/b); sumQuotients += q; [a,b] = [b,a-q*b]; }
    assert.equal(sumQuotients,legacy2019GcdCases[values[0]].comparisons);
    const scene = readScene(body.prompt[1]); assert.deepEqual(scene,{kind:"source_figure",profile:"legacy-2019-gcd-flow",values:[0]});
    truth = choices.map(choice => Number(choice) === sumQuotients);
    assert(body.explanation.includes(`${sumQuotients}回`)); assert(body.explanation.includes("最後の比較"));
    assert(choices.every(c => /^\d{1,2}$/.test(c))); assert.equal(new Set(choices).size,4);
  } else if (source === "2019r01a-fe-am-4") {
    const functions = prompt.match(/f\(t\)=a\/\(t＋(\d+)\) 及び g\(t\)=b\/\(t²−(\d+)t\)/)!; assert(functions);
    assert.deepEqual(functions.slice(1).map(Number),values); assert(prompt.includes("a≠0、b≠0")); assert(prompt.includes(`t>${values[1]}`));
    // g/f has a first-degree numerator and second-degree denominator; its
    // leading ratio is 0 for every nonzero a,b, independent of coefficients.
    const numeratorDegree = 1, denominatorDegree = 2;
    const limitZero = numeratorDegree < denominatorDegree;
    truth = choices.map(choice => choice === "0" && limitZero);
    assert.deepEqual(choices,["0","1","b/a","∞"]); assert(body.explanation.includes("分子分母をt²で割る"));
  } else {
    assert.equal(source,"2019r01a-fe-am-8");
    const m = prompt.match(/^([ACKST、]+)の順に文字が入力される。スタックを利用して、([ACKST、]+)という順/)!; assert(m);
    const input = m[1].replaceAll("、",""), desired = m[2].replaceAll("、",""); assert.equal(input,"ACKST"); assert.equal(desired,legacy2019StackCases[values[0]]);
    assert(prompt.includes("ポップ操作が実行されたときには必ず文字を出力")); assert(prompt.includes("スタック間の文字の移動は行わない"));
    const possible = [1,2,3,4].map(count => stackAssignmentExists(input,desired,count));
    const needed = possible.indexOf(true)+1; assert(needed >= 1);
    truth = choices.map(choice => Number(choice) === needed); assert(body.explanation.includes(`${needed}個で実現でき`));
  }
  assert.deepEqual(truth.flatMap((v,i) => v ? [i] : []),[body.correctIndex]);
}
export { texts, reviewedEdges, oracle as assertLegacy2019Algorithms };
