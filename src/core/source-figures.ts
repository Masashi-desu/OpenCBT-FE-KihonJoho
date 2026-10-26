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
import { sampleBigramCases } from "./generators/sample-2022-data";
import { sampleTree14 } from "./generators/sample-2022-dec-data";
import {aTree,aGrid,aTransform,aNetworkDays,aNetworkEdges,aMultiplicityCases} from "./generators/sample-2022-dec-a-data";
import { sampleMinimaxBoards, sampleMinimaxChildren, sampleMinimaxQueries } from "./generators/sample-2022-dec-data";
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
    case "dec-a-binary-flow": return prefix+`開始、jを入力、変換ループk：1，1，${v[0]}、空欄a、空欄b、変換ループ終端、終了。ループの指定は変数名：初期値，増分，終値。`;
    case "dec-a-automaton": return prefix+"初期状態S1。S1は0/0でS1、1/0でS2。S2は0/0でS1、1/1でS3。S3は0/0でS1、1/1でS3。ラベルは入力/出力。";
    case "dec-a-bst": {const tree=aTree(v[0],v[1],v[2]);return prefix+`根は${tree.values[0]}。`+tree.edges.map(([a,b])=>`${tree.values[a]}の${b===1||b===3||b===5&&v[1]!==2?"左":"右"}の子は${tree.values[b]}`).join("。");}
    case "dec-a-array": {const a=aGrid(v[1]),b=Array.from({length:8},()=>Array(8).fill(false));for(let i=0;i<8;i++)for(let j=0;j<8;j++){const [r,c]=aTransform(i,j,v[0]);b[r][c]=a[i][j];}return prefix+"二重ループi：0，1，7、j：0，1，7、空欄a。配列はi行j列、添字0〜7。"+[a,b].map((grid,i)=>`配列${i?"B":"A"}の行は`+grid.map(row=>row.map(x=>x?"＊":"・").join("")).join("、")).join("。");}
    case "dec-a-hash": return prefix+"位置0〜12の13要素の配列。各位置の格納欄は空欄。";
    case "dec-a-availability": return prefix+`サーバ1台、プリンタ${v[1]}台、クライアント${v[0]}台が一つのLANへ接続。`;
    case "dec-a-buffer": return prefix+"送信タスクからS、サイズLのバッファ、R、受信タスクの順に接続した矢印。";
    case "dec-a-multiplicity": {const [dl,du,el,eu]=aMultiplicityCases[v[0]],m=(l:number,u:number)=>l===u?String(l):`${l}..${u===2?"＊":u}`;return prefix+`部署と従業員の関連名は所属する。部署側の多重度${m(dl,du)}、従業員側の多重度${m(el,eu)}。関連名の読取方向は従業員から部署。`;}
    case "dec-a-network": {const days=[...aNetworkDays];days[0]=v[0];days[4]=v[1];return prefix+"A後にB→E→H、C→F→I、D→Gが分岐。HとIが合流してJ、JとGが終了点で合流。作業名は矢印の上、日数は下で、円と同じ凡例がある。"+aNetworkEdges.map((_,i)=>`${"ABCDEFGHIJ"[i]}=${days[i]}日`).join("、");}
    case "dec-a-dispatch": return prefix+`派遣元企業、派遣先企業、労働者の三者をそれぞれ双方向の矢印で結ぶ。太線は${["派遣先企業と労働者","派遣元企業と労働者","派遣元企業と派遣先企業"][v[0]]}の間。`;
    case "priority-queue-class":
      return prefix + `PrioQueue()は空のキューを生成。enqueue(s,p)は文字列sを優先度pで追加し戻り値なし。dequeue()は最も優先度の高い要素を取り出して文字列を返す。数値が${v[0]?"大きい":"小さい"}ほど高く、同値では${v[1]?"最後":"最初"}に追加した要素が先。size()は整数型の要素数を返す。同じ文字列も別の要素。`;
    case "sample-tree-14":
      return prefix + "○内は節番号。子が一つなら左の子。" + sampleTree14(v[0]).flatMap((children,i)=>children.length?[`節${i+1}の左の子は${children[0]}${children[1]?"、右の子は"+children[1]:""}`]:[]).join("。");
    case "sample-minimax":
      return prefix + "盤面は左上から行優先、Oは自分、Xは相手、.は空所。" + sampleMinimaxBoards.map((b,i)=>`盤面${i+1}=${b}${sampleMinimaxChildren[i].length?"。次の盤面は"+sampleMinimaxChildren[i].map(n=>n+1).join("、"):"。"+([2,9].includes(i)?`勝ち、評価値${v[0]*5}`:i===6?`負け、評価値${-v[0]*5}`:"引き分け、評価値0")}`).join("。") + `。根の子は左から2、3、4。Aは${sampleMinimaxQueries[v[1]][0]+2}、Bは${sampleMinimaxQueries[v[1]][1]+2}を指す。根は自分、次は相手、その次は自分の手番。`;
    case "list-element-class":
      return prefix + "ListElementのメンバはval（文字型、リストに格納する文字）とnext（ListElement型、次の要素の参照）。nextの初期値は" +
        (v[0] ? "データ要素ではendNode（終端専用endNode自身のnextは本文のとおり未定義）" : "未定義") + "。コンストラクタListElement(qVal)はvalをqValで初期化する。";
    case "bigram-example": {
      const sample = sampleBigramCases[v[0]];
      return prefix + `4語は${sample.words.join("、")}。枠は文字${sample.first}。` +
        sample.words.map(word => [...word].flatMap((char, i) => char !== sample.first ? [] : [
          `${word}の${i + 1}文字目は${i + 1 === word.length ? "語末なので集計対象外" : "次の文字が" + word[i + 1]}`,
        ]).join("、")).join("。");
    }
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
