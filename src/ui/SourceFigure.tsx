import { useId, type ReactNode } from "react";
import { DecemberAFigure } from "./DecemberAFigure";
import type { Scene } from "../core/types";
import { validateSourceFigure, sourceFigureAlt } from "../core/source-figures";
import { scatterPoints } from "../core/generators/subject-a";
import { sampleBigramCases } from "../core/generators/sample-2022-data";
import { sampleMinimaxBoards, sampleMinimaxChildren, sampleMinimaxQueries } from "../core/generators/sample-2022-dec-data";
import { sampleTree14 } from "../core/generators/sample-2022-dec-data";
import {
  adjacency,
  graphEdges,
  palettes,
  onehot,
} from "../core/generators/subject-b";

export function SourceFigure({
  scene,
  caption,
}: {
  scene: Extract<Scene, { kind: "source_figure" }>;
  caption: string;
}) {
  validateSourceFigure(scene);
  const id = useId().replace(/:/g, ""),
    v = scene.values,
    profile = scene.profile;
  if (profile.startsWith("dec-a-")) return <DecemberAFigure profile={profile} values={v} caption={caption}/>;
  let key = 0,
    height = 450;
  const parts: ReactNode[] = [];
  const t = (
    x: number,
    y: number,
    text: string | number,
    anchor: "middle" | "start" | "end" = "middle",
  ) => (
    <text key={key++} x={x} y={y} textAnchor={anchor}>
      {text}
    </text>
  );
  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    arrow = false,
    dashed = false,
  ) => (
    <line
      key={key++}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      markerEnd={arrow ? `url(#${id}-arrow)` : undefined}
      strokeDasharray={dashed ? "9 7" : undefined}
    />
  );
  const poly = (points: string, arrow = false) => (
    <polyline
      key={key++}
      points={points}
      markerEnd={arrow ? `url(#${id}-arrow)` : undefined}
      fill="none"
    />
  );
  const rect = (
    x: number,
    y: number,
    w: number,
    h: number,
    rx = 0,
    fill?: string,
  ) => (
    <rect
      key={key++}
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill={fill ?? "var(--surface)"}
    />
  );
  const circle = (x: number, y: number, r = 23, label?: string) => {
    parts.push(
      <circle key={key++} cx={x} cy={y} r={r} fill="var(--surface)" />,
    );
    if (label !== undefined) parts.push(t(x, y, label));
  };
  const path = (d: string) => <path key={key++} d={d} fill="none" />;
  const circleLink = (
    a: number[],
    b: number[],
    label?: string,
    days?: number,
    dummy = false,
  ) => {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      len = Math.hypot(dx, dy),
      nx = dy / len,
      ny = -dx / len;
    parts.push(
      line(
        a[0] + (dx * 23) / len,
        a[1] + (dy * 23) / len,
        b[0] - (dx * 25) / len,
        b[1] - (dy * 25) / len,
        true,
        dummy,
      ),
    );
    if (label)
      parts.push(
        t((a[0] + b[0]) / 2 + nx * 24, (a[1] + b[1]) / 2 + ny * 24, label),
        t((a[0] + b[0]) / 2 - nx * 24, (a[1] + b[1]) / 2 - ny * 24, days!),
      );
  };
  const legend = (
    x: number,
    y: number,
    dummy: boolean,
    daysLabel = "作業日数",
  ) => {
    parts.push(
      t(x, y - 48, "凡例", "start"),
      line(x + 23, y, x + 153, y, true),
      t(x + 90, y - 23, "作業名"),
      t(x + 90, y + 31, daysLabel),
    );
    circle(x, y);
    circle(x + 180, y);
    if (dummy)
      parts.push(
        line(x - 22, y + 75, x + 78, y + 75, true, true),
        t(x + 100, y + 75, "：ダミー作業", "start"),
      );
  };
  const cells = (
    name: string,
    values: (number | string)[],
    y: number,
    undefinedFrom = 100,
    arrowAt?: number,
  ) => {
    const start = 215,
      w = 720 / values.length;
    parts.push(t(30, y + 44, name, "start"), t(30, y - 5, "要素番号", "start"));
    values.forEach((value, i) => {
      parts.push(
        t(start + (i + 0.5) * w, y - 5, i + 1),
        rect(
          start + i * w,
          y + 15,
          w,
          60,
          0,
          i >= undefinedFrom ? "var(--soft-border)" : undefined,
        ),
      );
      if (i < undefinedFrom)
        parts.push(t(start + (i + 0.5) * w, y + 45, value));
    });
    if (arrowAt !== undefined)
      parts.push(
        line(
          start + (arrowAt - 0.5) * w,
          y + 125,
          start + (arrowAt - 0.5) * w,
          y + 80,
          true,
        ),
        t(start + (arrowAt - 0.5) * w, y + 145, "stackPos"),
      );
  };
  if (profile === "priority-queue-class") {
    height = 560;
    parts.push(rect(20, 10, 960, 100), line(430, 10, 430, 110), line(20, 55, 980, 55),
      t(225, 32, "コンストラクタ"), t(705, 32, "説明"),
      t(225, 82, "PrioQueue()"), t(705, 82, "空の優先度付きキューを生成する。"),
      rect(20, 135, 960, 400), line(300, 135, 300, 535), line(440, 135, 440, 535),
      ...[185,275,465].map(y => line(20,y,980,y)),
      t(160, 160, "メソッド"), t(370, 160, "戻り値"), t(710, 160, "説明"),
      t(160, 220, "enqueue(文字列型:"), t(160, 252, "s, 整数型: p)"), t(370, 232, "なし"),
      t(460, 215, "文字列sを優先度pで追加する。", "start"), t(460, 250, "同じ文字列も別の要素として保持。", "start"),
      t(160, 368, "dequeue()"), t(370, 368, "文字列型"),
      t(460, 310, "最も優先度が高い要素を取り出す。", "start"),
      t(460, 348, `数値が${v[0] ? "大きい" : "小さい"}ほど優先度が高い。`, "start"),
      t(460, 386, "同じ優先度の要素がある場合は、", "start"),
      t(460, 424, `${v[1] ? "最後" : "最初"}に追加したものを取り出す。`, "start"),
      t(160, 500, "size()"), t(370, 500, "整数型"), t(460, 500, "キューの要素数を返す。", "start"));
  } else if (profile === "sample-tree-14") {
    height = 490;
    const nodes = [[500,45],[260,155],[740,155],[140,265],[380,265],[620,265],[860,265]];
    const tree = sampleTree14(v[0]);
    for (let parent=4;parent<=7;parent++) tree[parent-1].forEach((_,i)=>nodes.push([nodes[parent-1][0]+(i?60:-60),375]));
    tree.forEach((children,i)=>children.forEach(child=>parts.push(line(nodes[i][0],nodes[i][1],nodes[child-1][0],nodes[child-1][1]))));
    nodes.forEach(([x,y],i)=>circle(x,y,25,String(i+1)));
    parts.push(t(500,435,"○の中の値は節番号を表す。"), t(500,472,"子が一つの節では、その子を左の子とする。"));
  } else if (profile === "sample-minimax") {
    height = 825;
    const centers = [[500,90],[260,265],[500,265],[760,265],[150,465],[370,465],[650,465],[870,465],[150,675],[370,675],[870,675]];
    sampleMinimaxChildren.forEach((children,i)=>children.forEach(child=>parts.push(line(centers[i][0],centers[i][1]+43,centers[child][0],centers[child][1]-43,true))));
    [170,395,600].forEach(y=>parts.push(line(20,y,980,y)));
    parts.push(t(970,145,"自分の手番","end"),t(970,345,"相手の手番","end"),t(970,545,"自分の手番","end"),t(500,24,"根の状態"));
    const query=sampleMinimaxQueries[v[1]];
    query.forEach((child,i)=>parts.push(t((500+centers[child+1][0])/2+(child===1?25:0),152,i?"B":"A")));
    sampleMinimaxBoards.forEach((board,i)=>{
      const [x,y]=centers[i], left=x-42, top=y-42;
      parts.push(rect(left,top,84,84));
      [28,56].forEach(d=>parts.push(line(left+d,top,left+d,top+84),line(left,top+d,left+84,top+d)));
      [...board].forEach((mark,j)=>{
        const cx=left+14+(j%3)*28,cy=top+14+Math.floor(j/3)*28;
        if(mark==="O") parts.push(<circle key={key++} cx={cx} cy={cy} r={9} fill="none" />);
        else if(mark==="X") parts.push(line(cx-8,cy-8,cx+8,cy+8),line(cx+8,cy-8,cx-8,cy+8));
      });
      if(!sampleMinimaxChildren[i].length) {
        const win=[2,9].includes(i), loss=i===6;
        parts.push(t(x,y+70,win?"勝ち":loss?"負け":"引き分け"),t(x,y+105,`評価値 ${win?v[0]*5:loss?-v[0]*5:0}`));
      }
    });
  } else if (profile === "list-element-class") {
    height = 355;
    parts.push(rect(20, 10, 960, 205), line(200, 10, 200, 215), line(390, 10, 390, 215),
      line(20, 60, 980, 60), line(20, 120, 980, 120),
      t(110, 35, "メンバ変数"), t(295, 35, "型"), t(685, 35, "説明"),
      t(110, 90, "val"), t(295, 90, "文字型"), t(685, 90, "リストに格納する文字。"),
      t(110, 164, "next"), t(295, 164, "ListElement"), t(685, 148, "次の要素の参照。"),
      t(685, 187, v[0] ? "データ要素の初期状態はendNode。" : "初期状態は未定義である。"),
      rect(20, 235, 960, 105), line(420, 235, 420, 340), line(20, 280, 980, 280),
      t(220, 258, "コンストラクタ"), t(700, 258, "説明"),
      t(220, 310, "ListElement(文字型: qVal)"), t(700, 310, "引数qValでvalを初期化する。"));
  } else if (profile === "bigram-example") {
    const sample = sampleBigramCases[v[0]];
    height = 565;
    sample.words.forEach((word, row) => {
      const y = 110 + row * 125;
      [...word].forEach((char, col) => {
        const x = 150 + col * 45;
        if (char === sample.first) {
          const end = col + 1 === word.length;
          parts.push(rect(x - 16, y - 22, 32, 44, 0, end ? "var(--soft-border)" : undefined));
          if (end) parts.push(poly(`${x},${y + 22} ${x},${y + 36} 730,${y + 36}`), t(970, y + 36, "語末：集計対象外", "end"));
          else {
            const labelY = y - (col % 2 ? 82 : 48);
            parts.push(t(x, labelY, `次は ${word[col + 1]}`), line(x, labelY + 17, x, y - 23, true));
          }
        }
        parts.push(t(x, y, char));
      });
    });
  } else if (profile === "waf-network") {
    height = 800;
    [340, 500, 660].forEach((x) => {
      parts.push(
        rect(x - 27, 20, 54, 56),
        t(x, 48, "PC"),
        line(x, 76, 500, 132),
      );
    });
    parts.push(
      <ellipse
        key={key++}
        cx="500"
        cy="145"
        rx="150"
        ry="35"
        fill="var(--surface)"
      />,
      t(500, 145, "インターネット"),
    );
    const names = [
      "ファイアウォール",
      "SSLアクセラレータ",
      "Webサーバ",
      "データベースサーバ",
    ];
    names.forEach((name, i) => {
      const top = 225 + i * 150;
      parts.push(
        line(500, i === 0 ? 180 : top - 95, 500, top),
        rect(350, top, 300, 75),
        t(500, top + 38, name),
      );
      parts.push(t(540, top - 32, "abcd"[(i + v[1]) % 4], "start"));
      if (i < 3)
        parts.push(t(465, top - 32, i <= v[0] ? "HTTPS" : "HTTP", "end"));
      else
        parts.push(
          t(465, top - 43, "データベース", "end"),
          t(465, top - 17, "アクセス用サービス", "end"),
        );
    });
  } else if (profile === "euclid-flow") {
    height = 700;
    parts.push(
      rect(130, 20, 175, 55, 27),
      t(217, 47, "開始"),
      line(217, 75, 217, 110),
      rect(130, 110, 175, 75),
      t(217, 135, "m ← a"),
      t(217, 164, "n ← b"),
      t(100, 115, "①"),
      line(217, 185, 217, 235),
    );
    parts.push(
      <polygon key={key++} points="217,235 310,280 217,325 124,280" />,
      t(217, 280, "m：n"),
      t(105, 252, "②"),
      line(310, 280, 470, 280),
      t(382, 255, "≠"),
    );
    parts.push(
      <polygon key={key++} points="555,235 647,280 555,325 463,280" />,
      t(555, 280, "m：n"),
      t(435, 250, "③"),
      line(555, 325, 555, 410),
      t(576, 362, ">"),
      poly("647,280 865,280 865,410"),
      t(689, 251, "<"),
    );
    parts.push(
      rect(455, 410, 205, 70),
      t(558, 445, "m ← m − n"),
      t(430, 432, "④"),
      rect(760, 410, 205, 70),
      t(862, 445, "n ← n − m"),
      t(733, 432, "⑤"),
      // ⑤の右辺（x=965）と②への戻り線の間に余白を設ける。
      poly("555,480 555,515 990,515 990,210 217,210", true),
    );
    parts.push(
      poly("865,480 865,515"),
      line(217, 325, 217, 410),
      t(238, 368, "="),
      <polygon key={key++} points="135,410 335,410 305,480 105,480" />,
      t(221, 445, "mの値を印字"),
      t(80, 432, "⑥"),
      line(217, 480, 217, 565),
      rect(130, 565, 175, 55, 27),
      t(217, 592, "終了"),
    );
  } else if (profile === "crash-network") {
    height = 500;
    const nodes = [
        [80, 175],
        [260, 175],
        [470, 60],
        [470, 290],
        [700, 175],
        [920, 175],
      ],
      edges = [
        [0, 1],
        [1, 2],
        [1, 4],
        [1, 3],
        [2, 4],
        [3, 4],
        [4, 5],
      ];
    edges.forEach(([a, b], i) =>
      circleLink(nodes[a], nodes[b], "ABCDEFG"[i], v[i]),
    );
    nodes.forEach((n) => circle(n[0], n[1]));
    legend(120, 410, false, "標準日数");
  } else if (profile === "project-network") {
    height = 600;
    const n = [
      [50, 260],
      [215, 260],
      [385, 260],
      [555, 260],
      [735, 260],
      [925, 260],
      [295, 400],
      [470, 120],
    ];
    [
      [0, 1, 0],
      [1, 2, 1],
      [2, 3, 2],
      [3, 4, 3],
      [1, 6, 4],
      [2, 7, 6],
      [4, 5, 8],
    ].forEach(([a, b, i]) => circleLink(n[a], n[b], "ABCDEFGHI"[i], v[i]));
    circleLink(n[6], n[2], undefined, undefined, true);
    circleLink(n[7], n[3], undefined, undefined, true);
    parts.push(
      poly("215,237 260,45 505,45 547,237", true),
      t(382, 24, "F"),
      t(382, 78, v[5]),
      poly("385,283 425,445 693,445 727,283", true),
      t(560, 420, "H"),
      t(560, 478, v[7]),
    );
    n.forEach((a) => circle(a[0], a[1]));
    parts.push(t(50, 310, "開始"), t(925, 310, "終了"));
    legend(730, 490, true);
  } else if (profile === "cache-layout") {
    height = 360;
    parts.push(
      rect(140, 60, 320, 215),
      t(225, 91, "CPU"),
      rect(178, 118, 282, 120),
      t(319, 150, "キャッシュメモリ"),
      t(319, 195, `${v[0]}kバイト`),
      line(460, 178, 590, 178),
      rect(590, 60, 270, 215),
      t(725, 137, "主記憶"),
      t(725, 198, `${v[1]}Mバイト`),
    );
  } else if (profile === "scatter") {
    height = 440;
    parts.push(
      line(230, 355, 830, 355, true),
      line(230, 355, 230, 40, true),
      t(840, 380, "x"),
      t(202, 43, "y"),
      t(211, 378, "0"),
    );
    for (const [x, y] of scatterPoints(v[0], v[1]))
      parts.push(
        <circle
          key={key++}
          className="scatter-point"
          cx={230 + x * 70}
          cy={335 - y * 30}
          r="5"
        />,
      );
  } else if (profile === "bst") {
    height = 460;
    const n = [
      [500, 60],
      [300, 215],
      [700, 215],
      [190, 370],
      [400, 370],
      [600, 370],
      [810, 370],
    ].map(([x, y]) => [v[1] ? 1000 - x : x, y]);
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [2, 6],
    ].forEach(([a, b]) => parts.push(line(n[a][0], n[a][1], n[b][0], n[b][1])));
    n.forEach((a, i) => circle(a[0], a[1], 33, "abcdefg"[(i + v[0]) % 7]));
  } else if (profile === "logic-circuit") {
    height = 320;
    const gate = (x: number, y: number, bit: number) => {
      parts.push(
        path(
          `M ${x} ${y - 43} H ${x + 63} A 43 43 0 0 1 ${x + 63} ${y + 43} H ${x} Z`,
        ),
      );
      if (v[0] & (1 << bit)) circle(x + 114, y, 9);
    };
    const output = (x: number, bit: number) =>
      x + 106 + (v[0] & (1 << bit) ? 17 : 0);
    gate(190, 85, 0);
    gate(190, 230, 1);
    gate(475, 157, 2);
    gate(770, 157, 3);
    parts.push(
      t(45, 85, "A"),
      t(45, 230, "B"),
      line(65, 85, 150, 85),
      poly("150,85 150,63 190,63"),
      poly("150,85 150,107 190,107"),
      line(65, 230, 150, 230),
      poly("150,230 150,208 190,208"),
      poly("150,230 150,252 190,252"),
      poly(`${output(190, 0)},85 395,85 395,135 475,135`),
      poly(`${output(190, 1)},230 395,230 395,179 475,179`),
      line(output(475, 2), 157, 715, 157),
      poly("715,157 715,135 770,135"),
      poly("715,157 715,179 770,179"),
      line(output(770, 3), 157, 960, 157),
      t(975, 157, "Y"),
    );
    [
      [150, 85],
      [150, 230],
      [715, 157],
    ].forEach(([x, y]) =>
      parts.push(
        <circle key={key++} className="junction" cx={x} cy={y} r="4" />,
      ),
    );
  } else if (profile === "waveform") {
    height = 285;
    for (let r = 0; r < 3; r++) {
      const base = 65 + r * 83,
        bits = v.slice(r * 7, r * 7 + 7);
      parts.push(
        t(32, base, "ABY"[r]),
        t(78, base - 18, "1"),
        t(78, base + 18, "0"),
      );
      for (let i = 1; i < 7; i++)
        parts.push(
          line(125 + i * 116, base - 32, 125 + i * 116, base + 32, false, true),
        );
      const points = bits
        .flatMap((bit, i) => [
          `${125 + i * 116},${base + (bit ? -23 : 23)}`,
          `${125 + (i + 1) * 116},${base + (bit ? -23 : 23)}`,
        ])
        .join(" ");
      parts.push(poly(points));
    }
  } else if (profile === "undirected-graph") {
    height = 360;
    const n = [
      [275, 155],
      [370, 290],
      [450, 50],
      [520, 175],
      [750, 290],
    ];
    graphEdges(v[1]).forEach(([a, b]) =>
      parts.push(
        line(
          ...(n[a - 1] as [number, number]),
          ...(n[b - 1] as [number, number]),
        ),
      ),
    );
    n.forEach((a, i) => circle(a[0], a[1], 25, i + 1 + v[0] + ""));
  } else if (profile === "adjacency-matrix") {
    height = 315;
    const matrix = adjacency(v[0], v[1]);
    parts.push(
      path("M 285 20 Q 263 20 263 157 Q 263 293 285 293"),
      path("M 720 20 Q 742 20 742 157 Q 742 293 720 293"),
    );
    matrix.forEach((row, r) =>
      row.forEach((value, c) =>
        parts.push(t(325 + c * 85, 42 + r * 53, value)),
      ),
    );
  } else if (profile === "stack") {
    height = 285;
    cells("stack", [v[2], v[3], ...Array(v[1] - 2).fill("")], 30, 2, 3);
    parts.push(t(180, 248, `網掛けは未定義。stackPos = ${3 + v[0]}`, "start"));
  } else if (profile === "linked-arrays") {
    height = 380;
    cells("dataList", [...[10, 30, 20, 40].map((n) => n * v[1]), ""], 35, 4);
    cells("pointerList", [3 + v[0], 4 + v[0], 2 + v[0], "", ""], 195, 3);
    parts.push(t(215, 335, "網掛けは未定義の要素。", "start"));
  } else if (profile === "ordered-array") {
    height = 150;
    cells(
      "",
      [10, 20, 30, 40].map((n) => n * v[0]),
      28,
    );
  } else if (profile === "onehot") {
    height = 400;
    const input = palettes[v[0]],
      names = [...new Set(input)],
      out = onehot(input);
    parts.push(
      t(500, 25, `引数の例：{${input.map((s) => `"${s}"`).join(", ")}}`),
      line(500, 55, 500, 86, true),
    );
    names.forEach((name, i) =>
      parts.push(
        t(
          500,
          125 + i * 60,
          `"${name}"のOne-Hot表現：{${names.map((_, j) => Number(i === j)).join(", ")}}`,
        ),
      ),
    );
    parts.push(
      line(500, 278, 500, 312, true),
      t(
        500,
        357,
        `戻り値：{${out.map((a) => `{${a.join(", ")}}`).join(", ")}}`,
      ),
    );
  }
  const showCaption = [
    "priority-queue-class",
    "sample-tree-14",
    "sample-minimax",
    "list-element-class",
    "bigram-example",
    "cache-layout",
    "undirected-graph",
    "adjacency-matrix",
    "stack",
    "linked-arrays",
    "ordered-array",
    "onehot",
  ].includes(profile);
  return (
    <figure className={`managed-diagram source-figure profile-${profile}`}>
      <div
        className="diagram-scroll"
        tabIndex={0}
        aria-label="問題の図。幅が足りない場合は左右にスクロールできます。"
      >
        <svg
          className="source-figure-svg"
          viewBox={`0 0 1000 ${height}`}
          role="img"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-desc`}
        >
          <title id={`${id}-title`}>{caption}</title>
          <desc id={`${id}-desc`}>{sourceFigureAlt(profile, v)}</desc>
          <defs>
            <marker
              id={`${id}-arrow`}
              viewBox="0 0 12 12"
              refX="11"
              refY="6"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 1 1 L 11 6 L 1 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </marker>
          </defs>
          <g aria-hidden="true">{parts}</g>
        </svg>
      </div>
      {showCaption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
