import type { Scene } from "./types";
import { DataError } from "./errors";
import { scatterPoints, signalValues } from "./generators/subject-a";
import {
  graphEdges,
  adjacency,
  onehot,
  palettes,
} from "./generators/subject-b";
import domains from "./source-figure-domains.json";
export const sourceFigureDomains: Record<string, [number, number][]> =
  Object.fromEntries(
    Object.entries(domains).map(([profile, bounds]) => [
      profile,
      bounds.map((bound) => {
        if (
          bound.length !== 2 ||
          !bound.every(Number.isInteger) ||
          bound[0] > bound[1]
        )
          throw Error("Invalid managed figure domain");
        return [bound[0], bound[1]] as [number, number];
      }),
    ]),
  );
export function validateSourceFigure(scene: Scene) {
  if (scene.kind !== "source_figure")
    throw new DataError("FIGURE_PROFILE", "図プロファイルの型が不正です");
  const domain = sourceFigureDomains[scene.profile];
  if (
    !domain ||
    scene.values.length !== domain.length ||
    scene.values.some(
      (v, i) => !Number.isInteger(v) || v < domain[i][0] || v > domain[i][1],
    )
  )
    throw new DataError("FIGURE_PROFILE", "登録図の入力域と一致しません");
}
export function sourceFigureAlt(profile: string, v: number[]) {
  const prefix = "原資料の形式に基づく改変図。";
  switch (profile) {
    case "waf-network":
      return (
        prefix +
        `PCからインターネット、ファイアウォール、SSLアクセラレータ、Webサーバ、データベースサーバへ接続。位置記号は上から${[0, 1, 2, 3].map((i) => "abcd"[(i + v[1]) % 4]).join("、")}。TLSを${v[0] === 0 ? "ファイアウォール" : "SSLアクセラレータ"}で復号する。復号前はHTTPS、復号後のWeb要求はHTTP、最後はデータベースアクセス用サービス。`
      );
    case "euclid-flow":
      return (
        prefix +
        "開始→①m=a,n=b→②mとnを比較。等しければ⑥mを印字して終了。異なれば③大小を比較し、m>nなら④m=m−n、m<nなら⑤n=n−m。いずれも②へ戻る。"
      );
    case "crash-network":
      return (
        prefix +
        `Aの後にB→E、C、D→Fが分岐・合流し、その後G。A〜Gの標準日数は${v.join("、")}。凡例では作業名が矢印の上、日数が下。`
      );
    case "cache-layout":
      return (
        prefix +
        `CPU内の${v[0]}kバイトのキャッシュメモリと、${v[1]}Mバイトの主記憶が接続する。`
      );
    case "scatter":
      return (
        prefix +
        `散布図の点(x,y)は${scatterPoints(v[0], v[1])
          .map((p) => `(${p.join(",")})`)
          .join("、")}。`
      );
    case "bst": {
      const l = (i: number) => "abcdefg"[(i + v[0]) % 7];
      return (
        prefix +
        `根は${l(0)}。${v[1] ? "右" : "左"}子は${l(1)}、${v[1] ? "左" : "右"}子は${l(2)}。${l(1)}の${v[1] ? "右・左" : "左・右"}子は${l(3)}・${l(4)}、${l(2)}の${v[1] ? "右・左" : "左・右"}子は${l(5)}・${l(6)}。`
      );
    }
    case "project-network":
      return (
        prefix +
        `A後にB・E・Fが分岐。E後のダミーがB終点へ接続。B終点からC・G・Hへ分岐。G後のダミーがC終点へ接続。C・G・Fが合流しD、D・Hが合流してI。A〜Iの日数は${v.join("、")}。開始・終了と実線・破線の凡例をもつ。`
      );
    case "logic-circuit":
      return (
        prefix +
        `Aを第1ゲートの両入力、Bを第2ゲートの両入力へ接続する。それぞれの出力を第3のAND形ゲートへ、第3の出力を第4の両入力へ接続しYを出力する。出力反転の小円は${
          [0, 1, 2, 3]
            .filter((i) => (v[0] & (1 << i)) !== 0)
            .map((i) => `第${i + 1}ゲート`)
            .join("、") || "なし"
        }。`
      );
    case "waveform":
      return (
        prefix +
        `同じ時刻区間のAは${v.slice(0, 7).join("、")}、Bは${v.slice(7, 14).join("、")}、Yは${v.slice(14).join("、")}。`
      );
    case "undirected-graph":
      return (
        prefix +
        `5頂点の番号は${Array.from({ length: 5 }, (_, i) => i + 1 + v[0]).join("、")}。辺は${graphEdges(
          v[1],
        )
          .map((p) => p.map((n) => n + v[0]).join("−"))
          .join("、")}。`
      );
    case "adjacency-matrix":
      return (
        prefix +
        `行と列は頂点番号${v[0] + 1}から${v[0] + 5}に対応する。行列の各行は${adjacency(
          v[0],
          v[1],
        )
          .map((r) => r.join(" "))
          .join("；")}。`
      );
    case "stack":
      return (
        prefix +
        `添字1・2に${v[2]}・${v[3]}を格納し、3から${v[1]}は網掛けで未定義。次の空き位置は3、stackPos=${3 + v[0]}。位置変数の基準差は${v[0]}。`
      );
    case "linked-arrays":
      return (
        prefix +
        `dataListは${[10, 30, 20, 40].map((n) => n * v[1]).join("、")}、未定義。pointerListは${[3, 4, 2].map((n) => n + v[0]).join("、")}、未定義、未定義。ポインタには基準差${v[0]}を加えて保存する。`
      );
    case "ordered-array":
      return (
        prefix +
        `添字1〜4の値は${[10, 20, 30, 40].map((n) => n * v[0]).join("、")}。`
      );
    case "onehot":
      return (
        prefix +
        `入力は${palettes[v[0]].join("、")}。初出順の一覧は${[...new Set(palettes[v[0]])].join("、")}。対応する戻り値は${onehot(
          palettes[v[0]],
        )
          .map((a) => `{${a.join(", ")}}`)
          .join("、")}。`
      );
    default:
      throw new DataError("FIGURE_PROFILE", "未登録の図です");
  }
}
