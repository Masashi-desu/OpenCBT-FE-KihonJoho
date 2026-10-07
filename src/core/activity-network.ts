import type { Scene } from "./types";
import { DataError } from "./errors";

// Managed profile of the public 2024 A Q13 figure, not arbitrary SVG/HTML.
// Coordinates describe the diagram's layout, not time or activity duration.
export const activityNetworkPositions = [
  [46, 178],
  [253, 178],
  [445, 49],
  [473, 178],
  [499, 306],
  [693, 178],
  [900, 178],
] as const;
const pairs = [
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 6],
];
export const activityNetworkRenderer = {
  id: "renderer-activity-network",
  version: "1.0.0",
};

export function readActivityNetwork(scene: Scene) {
  const fail = (): never => {
    throw new DataError(
      "ACTIVITY_NETWORK",
      "アローダイアグラムの節点・作業・ダミー接続が登録図と一致しません",
    );
  };
  if (
    scene.kind !== "graph" ||
    scene.nodes.length !== 7 ||
    scene.edges.length !== 10
  )
    return fail();
  const nodes = activityNetworkPositions.map(([x, y], i) => {
    const node = scene.nodes.find((n) => n.id === `node-${i}`);
    if (!node || node.role !== "vertex") return fail();
    return { ...node, x, y };
  });
  const activities = pairs.map(([from, to], i) => {
    const edge = scene.edges.find((e) => e.id === `edge-${i}`);
    const label = /^([A-H]) ([1-9][0-9]?)日$/.exec(edge?.label ?? "");
    if (
      !edge ||
      !edge.directed ||
      edge.from !== `node-${from}` ||
      edge.to !== `node-${to}` ||
      !label ||
      label[1] !== "ABCDEFGH"[i] ||
      Number(label[2]) > 60
    )
      return fail();
    return { ...edge, name: label[1], days: Number(label[2]) };
  });
  const dummies = [
    [2, 3],
    [3, 4],
  ].map(([from, to], i) => {
    const edge = scene.edges.find((e) => e.id === `edge-dummy-${i + 1}`);
    if (
      !edge ||
      !edge.directed ||
      edge.from !== `node-${from}` ||
      edge.to !== `node-${to}` ||
      edge.label !== "ダミー 0日"
    )
      return fail();
    return edge;
  });
  return { nodes, activities, dummies };
}

// Narrow compatibility projection for saved v1/v2 diagrams. It changes only
// presentation: persisted parameters, dependencies, answer and snapshot stay intact.
export function isLegacyActivityNetwork(scene: Scene) {
  try {
    readActivityNetwork(scene);
    return true;
  } catch {
    return false;
  }
}

export function activityNetworkAlt(scene: Scene) {
  const { activities } = readActivityNetwork(scene);
  const positions = [
    "左端",
    "左から二つ目",
    "中央上",
    "中央",
    "中央下",
    "右から二つ目",
    "右端",
  ];
  const descriptions = activities.map(
    (a, i) =>
      `${positions[pairs[i][0]]}の円から${positions[pairs[i][1]]}の円へ、作業${a.name}、所要日数${a.days}`,
  );
  return `アローダイアグラム。円は無記名の節点。${descriptions.join("。")}。中央上から中央、中央から中央下への破線の矢印はダミー作業。凡例：実線の矢印の上に作業名、下に所要日数を示す。破線の矢印はダミー作業。`;
}
