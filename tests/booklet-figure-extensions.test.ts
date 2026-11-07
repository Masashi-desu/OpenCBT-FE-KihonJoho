import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { validateBookletFigureExtensions, readBookletFigure, type BookletFigureDefinition } from '../src/core/booklet-figure-extension-contract';
import { bookletFigureExtensions } from '../src/core/booklet-figure-extensions';
import { bookletFigureRenderers } from '../src/ui/booklet-figure-renderers';
import { validateBookletFigureRenderers } from '../src/ui/booklet-figure-renderer-contract';

const profile = 'legacy-2016-autumn-pm-2-probe';
function figure(): BookletFigureDefinition {
  return { profile, domain: [[0, 2], [1, 3]],
    validate(values) { if (values[0] >= values[1]) throw new Error('PARAMETER_CONSTRAINT'); },
    alt: values => `Probe edge ${values[0]} to ${values[1]}` };
}

test('booklet figures retain ownership and cannot duplicate a profile or admit an invalid input domain', () => {
  const entry = (figures: BookletFigureDefinition[]) => ({ scope: '2016-autumn-pm', figures });
  const f = figure();
  assert.deepEqual(validateBookletFigureExtensions([entry([f])]), [f]);
  const morning = { ...f, profile: 'legacy-2015-autumn-am-80-probe' };
  assert.deepEqual(validateBookletFigureExtensions([{ scope: '2015-autumn-am', figures: [morning] }]), [morning]);
  for (const entries of [[entry([])], [entry([f, f])], [entry([f]), entry([f])],
    [entry([{ ...f, profile: 'legacy-2017-spring-pm-2-probe' }])], [entry([{ ...f, profile: 'legacy-2016-autumn-pm-14-probe' }])],
    [{ scope: '2015-autumn-am', figures: [{ ...morning, profile: 'legacy-2015-autumn-am-81-probe' }] }],
    [{ scope: '2015-autumn-am', figures: [f] }],
    [entry([{ ...f, domain: [[2, 1]] }])], [entry([{ ...f, domain: [[0, Infinity]] }])],
    [entry([{ ...f, domain: new Array(1) }])], [entry([{ ...f, domain: [new Array(2) as [number, number]] }])]])
    assert.throws(() => validateBookletFigureExtensions(entries), { code: 'FIGURE_PROFILE' });
});

test('figure semantics check exact arity, safe integer bounds and correlations and isolate callback inputs', () => {
  const f = figure();
  assert.equal(readBookletFigure(f, [0, 1]), 'Probe edge 0 to 1');
  assert.equal(readBookletFigure(f, [2, 3]), 'Probe edge 2 to 3');
  for (const values of [[], [0], [0, 1, 2], [-1, 1], [3, 3], [0, 4], [NaN, 1], [0.5, 1], new Array(2), [0, ...new Array(1)]])
    assert.throws(() => readBookletFigure(f, values), { code: 'FIGURE_PROFILE' });
  const disguised = Object.assign(new Array(2), { first: 0, second: 1 });
  assert.throws(() => readBookletFigure(f, disguised), { code: 'FIGURE_PROFILE' });
  let reads = 0;
  const getter = [0, 1];
  Object.defineProperty(getter, 0, { get() { reads++; return 0; } });
  assert.throws(() => readBookletFigure(f, getter), { code: 'FIGURE_PROFILE' });
  assert.equal(reads, 0);
  assert.throws(() => readBookletFigure(f, [2, 1]), /PARAMETER_CONSTRAINT/);
  const values = [0, 1];
  assert.equal(readBookletFigure({ ...f, validate(v) { v[0] = 99; } }, values), 'Probe edge 0 to 1');
  assert.deepEqual(values, [0, 1]);
  assert.throws(() => readBookletFigure({ ...f, alt: () => ' ' }, values), { code: 'FIGURE_PROFILE' });
});

test('semantic profiles and display components require an exact same-booklet one-to-one registration', () => {
  const figures = [{ scope: '2016-autumn-pm', figures: [figure()] }];
  const renderer = { profile, component: ({ caption }: { values: number[]; caption: string }) => createElement('figure', null, caption) };
  const entry = { scope: '2016-autumn-pm', renderers: [renderer] };
  assert.deepEqual(validateBookletFigureRenderers([entry], figures), [renderer]);
  assert.equal(renderToStaticMarkup(createElement(renderer.component, { caption: 'probe', values: [0, 1] })), '<figure>probe</figure>');
  for (const entries of [[], [{ ...entry, renderers: [] }], [entry, entry], [{ ...entry, scope: '2017-spring-pm' }],
    [{ ...entry, renderers: [renderer, renderer] }], [{ ...entry, renderers: [{ ...renderer, profile: profile + '-extra' }] }]])
    assert.throws(() => validateBookletFigureRenderers(entries, figures), { code: 'FIGURE_PROFILE' });
  assert.throws(() => validateBookletFigureRenderers([entry], []), { code: 'FIGURE_PROFILE' });
});

test('all actual application booklet figure declarations have both validated semantics and managed display components', () => {
  const figures = validateBookletFigureExtensions(bookletFigureExtensions);
  const renderers = validateBookletFigureRenderers(bookletFigureRenderers, bookletFigureExtensions);
  assert.deepEqual(figures.map(f => f.profile).sort(), renderers.map(r => r.profile).sort());
});
