type Link = readonly [number, number];
export type Edge = readonly [number, number, number];
const teachingLinks: readonly Link[] = [[1, 2], [2, 3], [1, 4], [1, 5], [2, 5], [4, 5], [5, 3], [3, 6], [5, 6]];
const exerciseLinks: readonly Link[] = [[1, 2], [2, 3], [1, 4], [4, 2], [2, 5], [4, 5], [5, 3], [3, 6], [5, 6]];
const teachingWeights = [
  [10, 40, 20, 30, 10, 20, 10, 30, 30],
  [10, 60, 30, 50, 20, 20, 10, 20, 40],
  [10, 30, 20, 40, 10, 10, 10, 20, 20],
  [20, 40, 30, 50, 10, 10, 10, 40, 40],
];
const exerciseWeights = [
  [20, 30, 10, 20, 20, 20, 30, 10, 40],
  [10, 20, 20, 20, 30, 20, 30, 30, 40],
  [10, 50, 20, 20, 20, 20, 40, 20, 60],
  [20, 20, 10, 20, 40, 40, 20, 30, 40],
];

export const points = [1, 2, 3, 4, 5, 6];
export function graph(index: number, exercise: boolean): Edge[] {
  const links = exercise ? exerciseLinks : teachingLinks;
  const weights = (exercise ? exerciseWeights : teachingWeights)[index];
  return links.map(([from, to], i) => [from, to, weights[i]]);
}

export function trace(edges: readonly Edge[]) {
  const remaining = [...points], settled: number[] = [], predecessor: number[] = Array(7).fill(0);
  const distances: number[] = Array(7).fill(Infinity);
  const snapshots = [];
  while (remaining.length > 0) {
    remaining.sort((a, b) => distances[a] - distances[b] || a - b);
    const node = remaining.shift()!;
    settled.push(node);
    for (const [from, to, weight] of edges) {
      const next = (node === 1 ? 0 : distances[node]) + weight;
      if (from === node && remaining.includes(to) && next < distances[to]) {
        distances[to] = next;
        predecessor[to] = node;
      }
    }
    snapshots.push({ node, distances: [...distances], settled: [...settled], predecessor: [...predecessor] });
  }
  return snapshots;
}

export function stage(value: number) {
  const index = Math.floor(value / 8), stageNumber = value % 8;
  const edges = graph(index, stageNumber === 7);
  const state = stageNumber > 0 && stageNumber < 7 ? trace(edges)[stageNumber - 1] : undefined;
  return { edges, state, stageNumber };
}
