import {
  legacyAfternoonDefinitions,
  test,
  assert,
  fixture,
  additionalDefinitions,
  amCapacity,
  amCapacityBySource,
  stage3MorningDefinitions,
  stage3AllMorningDefinitions,
  autumn2016FirstReview,
  autumn2016LastReview,
  stage3Counts,
  stage3FixedSignatures,
  isStage3Source,
  autumn2016Counts,
  autumn2016FixedSignatures,
  isAutumn2016Source,
  bindQuestion,
  answerSignature,
  answerCanVary,
  validateBundle,
  generationCoverage,
  prepareRun,
  validateRun,
  selectQuestions,
  validateSourceFigure,
  fs,
  sourceFigureDomains,
  morningFigureDomains,
  partitionFirst,
  doubleHash,
  mergeTailCount,
  matchingPrefixCount,
  expectedCounts,
  circuitValue,
  projectDuration,
  scatterPoints,
  diagramMarkup,
  assertDiagramMarkup,
  escapeHTML,
  type DiagramBlock
} from "./helpers/booklet-content-support";
import {additionalBookletFigures}from'../src/core/booklet-figure-extension-contract';
import {sourceScope,sourceExclusions}from'../scripts/source-inventory';

test("native AM semantic drawings reject missing names, cells, source marks and headers", () => {
  const b = fixture();
  const profiles = ["legacy-2019-database-diagnosis", "legacy-2019-data-feedback",
    "legacy-2019-truth-table", "legacy-2019-score-relation",
    "legacy-2016-spring-am-ppm", "legacy-2016-spring-am-pareto"];
  for (const profile of profiles) {
    const source = profile === "legacy-2019-database-diagnosis" ? "2019h31h-fe-am-15" :
      profile === "legacy-2019-data-feedback" ? "2019h31h-fe-am-64" :
      profile === "legacy-2019-truth-table" ? "2019r01a-fe-am-22" :
        profile === "legacy-2019-score-relation" ? "2019r01a-fe-am-26" :
          profile === "legacy-2016-spring-am-ppm" ? "2016h28h-fe-am-69" : "2016h28h-fe-am-77";
    const t = b.templates.find(t => t.generatorRef.id === `generator-source-${source}`)!;
    const base = b.questions.find(q => q.id === t.baseQuestionRef.questionId)!;
    const q = bindQuestion(base, t, t.referenceParameters.values, "native-markup-negative", "2026-10-31T00:00:00Z");
    const block = [q.prompt, ...q.contexts.map(c => c.content), ...q.choices.map(c => c.content)]
      .flatMap(c => c.blocks).find((block): block is DiagramBlock => block.type === "diagram" &&
        block.scene.kind === "source_figure" && block.scene.profile === profile)!;
    assert(block);
    const html = diagramMarkup(block);
    assertDiagramMarkup(block, html, true);
    if(profile.startsWith("legacy-2016-")){
      for(const corrupt of [html.replace('role="img"','role="presentation"'),
        html.replace('aria-label="'+escapeHTML(block.alt)+'"','aria-label="欠落した説明"'),
        html.replace(/<title>[^<]*<\/title>/,'<title>別の表題</title>'),
        html.replace(/<rect\b[^>]*><\/rect>/,'')]){
        assert.notEqual(corrupt,html,profile + " mutation must alter its intended source feature");
        assert.throws(()=>assertDiagramMarkup(block,corrupt,true),Error);
      }
      continue;
    }
    const mutations = [html.replace('aria-label="', 'data-lost-name="'),
      html.replace(/(<(?:figcaption|caption)\b[^>]*>)[\s\S]*?(<\/(?:figcaption|caption)>)/, "$1欠落した表題$2")];
    if (profile === "legacy-2019-score-relation") {
      mutations.push(html.replace("text-decoration-line:underline", "text-decoration-line:none"));
      mutations.push(html.replace(">学生番号</span>", ">点数</span>"));
    } else {
      mutations.push(html.replace('scope="col"', 'scope="row"'));
      mutations.push(html.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>(?=<\/tbody>)/, ""));
      if (profile !== "legacy-2019-truth-table") mutations.push(html.replace('data-questioned="true"', 'data-questioned="false"'));
      else mutations.push(html.replace(/<td>([01])<\/td>/, "<td>2</td>"));
    }
    for (const corrupt of mutations) {
      assert.notEqual(corrupt, html, profile + " mutation must alter its intended source feature");
      assert.throws(() => assertDiagramMarkup(block, corrupt, true), Error, profile + " must reject corrupted source structure");
    }
  }
});

test("source figure profiles match Schema and reject wrong shapes and parameter bounds", () => {
  const diagramSchema = JSON.parse(
    fs.readFileSync("docs/public/schemas/diagram.schema.json", "utf8"),
  );
  const source = diagramSchema.properties.scene.oneOf.find(
    (x: any) => x.properties.kind.const === "source_figure",
  );
  assert.deepEqual(
    [...source.properties.profile.anyOf[0].enum,...additionalBookletFigures.map(figure=>figure.profile)].sort(),
    Object.keys(sourceFigureDomains).sort(),
  );
  assert.equal(stage3MorningDefinitions.length,75);
  assert.equal(stage3AllMorningDefinitions.length,152);
  const stage3ReferenceBlocks = stage3AllMorningDefinitions.flatMap(definition => {
    const body = definition.build([...definition.reference!]);
    return [...body.prompt, ...body.choices.flat(), ...(body.contexts ?? []).flatMap(context => context.blocks)];
  });
  const afternoonReferenceBlocks=legacyAfternoonDefinitions.flatMap(definition=>{
    const body=definition.build(definition.fields.map(field=>field.minimum));
    return [...body.prompt,...body.choices.flat(),...(body.contexts??[]).flatMap(context=>context.blocks)];
  });
  for (const [profile, domain] of Object.entries(sourceFigureDomains)) {
    // Legacy AM drawings include correlated finite tuples, whose coordinate
    // minima need not form a valid drawing together.
    const morning = Object.hasOwn(morningFigureDomains, profile) ?
      morningFigureDomains[profile as keyof typeof morningFigureDomains] : undefined;
    const afternoon = afternoonReferenceBlocks.find(block => block.type === "diagram" && block.scene.kind === "source_figure" && block.scene.profile === profile);
    const stage3 = stage3ReferenceBlocks.find(block => block.type === "diagram" && block.scene.kind === "source_figure" && block.scene.profile === profile);
    const values = morning?.[0].values ?? (afternoon?.type === "diagram" && afternoon.scene.kind === "source_figure"
      ? [...afternoon.scene.values] : stage3?.type === "diagram" && stage3.scene.kind === "source_figure"
        ? [...stage3.scene.values] : domain.map(([minimum]) => minimum));
    validateSourceFigure({ kind: "source_figure", profile, values });
    assert.throws(
      () =>
        validateSourceFigure({
          kind: "source_figure",
          profile,
          values: [...values, 0],
        }),
      { code: "FIGURE_PROFILE" },
    );
    assert.throws(
      () =>
        validateSourceFigure({
          kind: "source_figure",
          profile,
          values: [domain[0][1] + 1, ...values.slice(1)],
        }),
      { code: "FIGURE_PROFILE" },
    );
  }
  assert.throws(
    () =>
      validateSourceFigure({
        kind: "source_figure",
        profile: "unknown",
        values: [0],
      }),
    { code: "FIGURE_PROFILE" },
  );
});

test("every independently declared eligible official source has exactly one generator and is a mix candidate", async () => {
  const b = fixture();
  await validateBundle(b);
  const c = generationCoverage(b);
  const expected=sourceScope.filter(id=>!Object.hasOwn(sourceExclusions,id)).length;
  assert.equal(c.total, expected);
  assert.equal(c.covered, expected);
  assert(
    c.rows.every((r) => r.templates.length === 1 && r.linked.length === 1),
  );
  for (const subject of ["A", "B"] as const) {
    const prepared = selectQuestions(b, {
      subject,
      kind: "mix",
      year: 2026,
      mode: "study",
      size: "full",
      bindingMode: "generated_values",
    });
    // Keep the previous 682 A families and append all 77 eligible autumn sources.
    assert.equal(prepared.set.questionRefs.length, subject === "A" ? 682 + 77 : 49);
  }
  const missing = structuredClone(b);
  missing.templates = missing.templates.filter(
    (t) => t.id !== "template-source-2026-a-1",
  );
  missing.sets = missing.sets.map((s) => ({
    ...s,
    generationBindings: s.generationBindings.filter(
      (g) => g.templateRef.id !== "template-source-2026-a-1",
    ),
  }));
  await assert.rejects(validateBundle(missing), {
    code: "GENERATION_COVERAGE",
  });
});
test("installed registry retains all467 reviewed AM families and their variable/fixed contracts", () => {
  const admitted = additionalDefinitions.filter(d => amCapacityBySource.has(d.source));
  assert.equal(amCapacity.rows.length, 467);
  assert.equal(new Set(admitted.map(d => d.source)).size, 467);
  assert.deepEqual(admitted.map(d => d.source).sort(), amCapacity.rows.map(r => r.source).sort());
  assert.equal(amCapacity.rows.filter(r => r.answerCanVary).length, 322);
  assert.equal(amCapacity.rows.filter(r => !r.answerCanVary).length, 145);
});
test("installed registry adds exactly75 stage3 morning families with all688 reviewed finite conditions", () => {
  const admitted = additionalDefinitions.filter(d => isStage3Source(d.source));
  assert.equal(admitted.length, 75); assert.equal(stage3Counts.size, 75);
  assert.deepEqual(admitted.map(d => Number(d.source.split("-").at(-1))).sort((a,b) => a-b),
    [...stage3Counts.keys()].sort((a,b) => a-b));
  assert.equal([...stage3Counts.values()].reduce((a,b) => a+b,0),688);
  assert.equal(stage3FixedSignatures.size,16);
  for (const d of admitted) {
    const n=Number(d.source.split("-").at(-1)), count=stage3Counts.get(n)!;
    assert.equal(d.fields.length,1); assert.equal(d.fields[0].minimum,0);
    assert.equal(d.fields[0].maximum,count-1); assert.deepEqual(d.reference,[0]);
    assert.equal(d.answerVariation === "fixed",stage3FixedSignatures.has(n));
  }
});
test("installed registry adds exactly77 autumn2016 families with all441 independent finite conditions and keeps spring75 separate",()=>{
  const expected=Array.from({length:80},(_,i)=>i+1).filter(n=>![55,56,57].includes(n)).map(n=>'2016h28a-fe-am-'+n);
  assert.equal(autumn2016FirstReview.rows.length,40);assert.equal(autumn2016LastReview.questions.length,37);
  assert.equal(autumn2016FirstReview.rows.reduce((n,r)=>n+r.finiteInputs,0),236);
  assert.equal(autumn2016LastReview.questions.reduce((n,r)=>n+r.variableDesign.finiteConditions,0),205);
  assert.equal(autumn2016Counts.size,77);assert.deepEqual([...autumn2016Counts.keys()],expected);
  assert.equal([...autumn2016Counts.values()].reduce((a,b)=>a+b,0),441);assert.equal(autumn2016FixedSignatures.size,18);
  const admitted=additionalDefinitions.filter(d=>isAutumn2016Source(d.source));assert.equal(admitted.length,77);
  assert.deepEqual(admitted.map(d=>d.source).sort(),[...expected].sort());
  assert.deepEqual(stage3AllMorningDefinitions.filter(d=>isAutumn2016Source(d.source)).map(d=>d.source),expected);
  for(const d of admitted){const n=Number(d.source.split('-').at(-1)),count=autumn2016Counts.get(d.source)!;
    assert.equal(d.fields.length,1);assert.equal(d.fields[0].minimum,0);assert.equal(d.fields[0].maximum,count-1);assert.deepEqual(d.reference,[0]);
    assert.equal(d.answerVariation==='fixed',autumn2016FixedSignatures.has(n));
  }
});
test("new mixed runs bind every slot and preserve issued content across validation", async () => {
  const b = fixture();
  for (const subject of ["A", "B"] as const) {
    const run = await prepareRun(
      b,
      {
        subject,
        kind: "mix",
        year: 2026,
        mode: "study",
        size: "full",
        bindingMode: "generated_values",
      },
      {},
    );
    assert.equal(run.issued.length, subject === "A" ? 60 : 20);
    const before = JSON.stringify(run.issued);
    await validateRun(structuredClone(run));
    assert.equal(JSON.stringify(run.issued), before);
  }
});

test("source numeric baselines independently match the public examples", () => {
  const b = fixture();
  const signature = (source: string) =>
    answerSignature(
      b.questions.find((q) => q.id === `question-template-source-${source}`)!,
    );
  assert.equal(signature("2024-a-3"), "0.90");
  assert.equal(signature("2025-a-4"), "0.92");
  assert.equal(signature("2025-a-7"), "80");
  assert.equal(signature("2025-a-14"), "31");
  assert.equal(signature("2023-a-2"), "a，f");
  assert.equal(signature("2023-a-10"), "c");
  assert.equal(signature("2023-a-11"), "3a＝2b");
  assert.equal(signature("2023-a-13"), "E");
  assert.equal(signature("2023-b-2"), "C，B，A，C");
  assert.equal(signature("2023-b-3"), "2 1 3 5 4");
  assert.equal(signature("2023-b-4"), "{-1, 18, -1, 3, 11}");
  assert.equal(signature("2024-b-4"), "1");
  assert.equal(signature("2025-b-4"), "8");
  assert.deepEqual(expectedCounts([82, 6, 58, 8]), [80, 6]);
});

test("project network, scatter and logic are checked by independent calculations", () => {
  const edges = [
    [0, 1, 0],
    [1, 2, 1],
    [2, 3, 2],
    [3, 4, 3],
    [1, 6, 4],
    [1, 3, 5],
    [2, 7, 6],
    [2, 4, 7],
    [4, 5, 8],
    [6, 2, -1],
    [7, 3, -1],
  ];
  const paths = (v: number[], node = 0): number[] =>
    node === 5
      ? [0]
      : edges
          .filter(([from]) => from === node)
          .flatMap(([, to, index]) =>
            paths(v, to).map((n) => n + (index < 0 ? 0 : v[index])),
          );
  for (let seed = 0; seed < 100; seed++) {
    const v = Array.from(
      { length: 9 },
      (_, i) => 1 + ((seed * 7 + i * 13) % 20),
    );
    assert.equal(projectDuration(v), Math.max(...paths(v)));
  }
  for (let mask = 0; mask < 16; mask++)
    for (const a of [0, 1])
      for (const b of [0, 1]) {
        const invert = (value: boolean, bit: number) =>
          mask & (1 << bit) ? !value : value;
        const first = invert(Boolean(a), 0),
          second = invert(Boolean(b), 1),
          third = invert(first && second, 2),
          expected = invert(third, 3);
        assert.equal(circuitValue(mask, a, b), Number(expected));
      }
  assert.deepEqual(
    [0, 0, 1, 1].map((a, i) => circuitValue(15, a, [0, 1, 0, 1][i])),
    [1, 0, 0, 0],
  );
  for (let kind = 0; kind < 3; kind++)
    for (let noise = 0; noise < 3; noise++) {
      const points = scatterPoints(kind, noise),
        xm = points.reduce((n, p) => n + p[0], 0) / points.length,
        ym = points.reduce((n, p) => n + p[1], 0) / points.length,
        cov = points.reduce((n, [x, y]) => n + (x - xm) * (y - ym), 0);
      assert.equal(Math.sign(Math.abs(cov) < 1e-9 ? 0 : cov), [-1, 1, 0][kind]);
    }
});

test("algorithm traces and expected frequencies agree with independent reference procedures", () => {
  const permutations = (a: number[]): number[][] =>
    a.length
      ? a.flatMap((n, i) =>
          permutations(a.filter((_, j) => j !== i)).map((r) => [n, ...r]),
        )
      : [[]];
  for (const input of permutations([1, 2, 3, 4, 5])) {
    const result = partitionFirst(input),
      pivot = input[2];
    let left = 0,
      right = 4,
      expected = [...input];
    while (left < right) {
      while (expected[left] < pivot) left++;
      while (expected[right] > pivot) right--;
      if (left >= right) break;
      const x = expected[left];
      expected[left] = expected[right];
      expected[right] = x;
      left++;
      right--;
    }
    assert.deepEqual(result, expected);
  }
  for (let n = 5; n <= 9; n++)
    for (let off = 1; off <= 4; off++)
      for (let start = 1; start <= 20; start++) {
        const input = [start, start + 5, start + 13],
          expected = Array(n).fill(-1);
        for (const value of input) {
          for (const pos of [value % n, (value + off) % n])
            if (expected[pos] === -1) {
              expected[pos] = value;
              break;
            }
        }
        assert.deepEqual(doubleHash(n, off, input), expected);
      }
  for (const a of [
    [1, 2],
    [2, 3],
    [3, 4],
  ])
    for (const b of [
      [1, 4],
      [2, 4],
      [3, 5],
    ]) {
      const combined = [
        ...a.map((n) => ({ n, source: 0 })),
        ...b.map((n) => ({ n, source: 1 })),
      ].sort((x, y) => x.n - y.n || x.source - y.source);
      let tail = 0;
      for (const value of combined.slice(
        combined.map((x) => x.source).lastIndexOf(0) + 1,
      ))
        if (value.source === 1) tail++;
      assert.equal(mergeTailCount(a, b), tail);
    }
  assert.equal(matchingPrefixCount("ababcabc", "abc"), 8);
  assert.equal(matchingPrefixCount("aaaaaaaa", "aaa"), 18);
  assert.equal(matchingPrefixCount("abababab", "cab"), 0);
  for (let a = 20; a <= 100; a += 13)
    for (let b = 1; b <= 20; b += 3)
      for (let c = 20; c <= 100; c += 17) {
        const d = 8,
          total = BigInt(a + b + c + d),
          expected = [
            Number(BigInt(a + b) * BigInt(a + c)) / Number(total),
            Number(BigInt(c + d) * BigInt(b + d)) / Number(total),
          ];
        assert.deepEqual(expectedCounts([a, b, c, d]), expected);
      }
});
