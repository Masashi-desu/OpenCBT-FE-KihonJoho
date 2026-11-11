export type Tree = string | readonly [operator: string, left: Tree, right: Tree];
const node = (operator: string, left: Tree, right: Tree): Tree => [operator, left, right];
const op = (left: Tree, right: Tree) => node('op', left, right);
const low = (left: Tree, right: Tree) => node('op1', left, right);
const high = (left: Tree, right: Tree) => node('op2', left, right);

export const exampleTree = op(op('a', 'b'), 'c');
export const firstTrees = [
  op('a', op('b', op('c', 'd'))),
  op(op('a', 'b'), op('c', 'd')),
  op(op('a', 'd'), op('b', 'c')),
  op('a', op(op('b', 'c'), 'd')),
  op(op('a', op('b', 'c')), 'd'),
];
export const secondTrees = [
  low('a', high('b', high('c', low('d', 'e')))),
  low('a', high(high('b', 'c'), low('d', 'e'))),
  high(low('a', high('b', 'c')), low('d', 'e')),
  high(low('a', 'b'), high('c', low('d', 'e'))),
  high(high(low('a', 'b'), 'c'), low('d', 'e')),
];

export const bracketExpressions = ['a op (b op c) op d', 'a op b op (c op d)', 'a op (b op (c op d))', 'a op ((b op c) op d)'];
export const syntaxExpressions = [
  'a op1 b op2 c op2 (d op1 e)', 'a op1 b op2 (c op2 (d op1 e))', '(a op1 b op2 c) op2 (d op1 e)', '(a op1 b) op2 (c op2 (d op1 e))',
];
export const postfixExpressions = ['a × b ＋ c × d ＋ e', 'a ＋ b × (c × d) ＋ e', '(a ＋ b × c) × d ＋ e', '(a × b ＋ c) × d ＋ e'];
export const stackExpressions = ['a ＋ b ＋ c × d', '(a ＋ b) × c ＋ d', 'a × (b ＋ (c ＋ d))', 'a ＋ (b × c ＋ d)'];

export const postfixOptions = ['a b c d × × ＋ e ＋', 'a b c × ＋ d × e ＋', 'a b × c d × ＋ e ＋', 'a b × c ＋ d × e ＋'];
export function stackOptions(index: number) {
  const source = ['push(a) → add → push(b) → add → push(c) → mul → push(d)',
    'push(a) → push(b) → add → push(c) → mul → push(d) → add',
    'push(a) → push(b) → add → push(c) → push(d) → mul → add',
    'push(a) → push(b) → push(c) → push(d) → add → add → mul'];
  if (index === 3) source[0] = 'push(a) → push(b) → push(c) → mul → push(d) → add → add';
  return source;
}
export function treeText(tree: Tree): string {
  if (typeof tree === 'string') return tree;
  const [op, a, b] = tree;
  return op + '(' + treeText(a) + ', ' + treeText(b) + ')';
}
export function postfix(tree: Tree): string[] {
  if (typeof tree === 'string') return [tree];
  const [op, a, b] = tree;
  return [...postfix(a), ...postfix(b), op];
}

const precedence: Readonly<Record<string, number>> = { op: 1, op1: 1, op2: 2, '＋': 1, '×': 2 };
export function parseExpression(expression: string): Tree {
  const tokens = expression.match(/op[12]?|[a-e()＋×]/g)!;
  let cursor = 0;
  const parse = (minimum: number): Tree => {
    const first = tokens[cursor++];
    let left = first === '(' ? parse(1) : first;
    if (first === '(' && tokens[cursor++] !== ')') throw Error('SYNTAX');
    while ((precedence[tokens[cursor]] ?? 0) >= minimum) {
      const operator = tokens[cursor++];
      left = node(operator, left, parse(precedence[operator] + 1));
    }
    return left;
  };
  const result = parse(1);
  if (cursor !== tokens.length) throw Error('SYNTAX');
  return result;
}
