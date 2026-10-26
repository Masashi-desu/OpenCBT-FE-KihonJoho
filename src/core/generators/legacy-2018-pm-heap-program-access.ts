/** Full alternative descriptions for the two source-format program figures.
 * Program1 has no printed line numbers; its numbering is explicitly an
 * accessibility reading order. Program2 retains each routine's printed rows.
 * These strings describe the unfilled listing and never supply blank answers. */
const makeHeap=[
 "○副プログラム：makeHeap（整数型：data[], 整数型：heap[], 整数型：hnum）",
 "○整数型：i, k",
 "繰返し開始。i：0, i < hnum, 1",
 "・heap[i] ← data[i] /* heapにデータを追加 */",
 "・k ← i",
 "内側の繰返し開始。k > 0",
 "分岐開始。空欄［a］",
 "・swap(heap, k, 空欄［b］)",
 "・k ← parent(k)",
 "それ以外の場合",
 "・break /* 内側の繰返し処理から抜ける */",
 "分岐終了",
 "内側の繰返し終了",
 "外側の繰返し終了",
] as const;
const swap=[
 "○副プログラム：swap（整数型：heap[], 整数型：i, 整数型：j）",
 "○整数型：tmp",
 "・tmp ← heap[i]",
 "・heap[i] ← heap[j]",
 "・heap[j] ← tmp",
] as const;
const heapSort=[
 "○副プログラム：heapSort（整数型：data[], 整数型：heap[], 整数型：hnum）",
 "○整数型：last",
 "・makeHeap(data, heap, hnum)",
 "繰返し開始。last：hnum−1, last > 0, −1",
 "・swap(heap, 0, last) /* heap[0]とheap[last]の値を交換 */",
 "・downHeap(heap, last−1) /* heapを再構成 */",
 "繰返し終了",
] as const;
const downHeap=[
 "○副プログラム：downHeap（整数型：heap[], 整数型：hlast）",
 "○整数型：n, tmp",
 "・n ← 0",
 "繰返し開始。lchild(n) ≦ hlast",
 "・tmp ← lchild(n)",
 "分岐開始。rchild(n) ≦ hlast",
 "内側の分岐開始。heap[tmp] ≦ heap[rchild(n)]",
 "・tmp ← rchild(n)",
 "内側の分岐終了",
 "右側の子の存在についての分岐終了",
 "分岐開始。heap[tmp] > heap[n]",
 "・swap(heap, n, tmp)",
 "それ以外の場合、・return /* downHeapから抜ける */",
 "値比較の分岐終了",
 "・n ← tmp",
 "繰返し終了",
] as const;
const numbered=(prefix:string,rows:readonly string[])=>rows.map((text,i)=>`${prefix}${i+1}行 ${text}`).join("。 ");
export const legacy2018HeapProgramOneDescription="プログラム1 makeHeapとswap。原資料には行番号がない。次の番号は各副プログラム内の読上げ順で、制御記号だけの行も含む。 "+numbered("makeHeap 読上げ順",makeHeap)+"。 "+numbered("swap 読上げ順",swap)+"。制御範囲：makeHeapの読上げ順3〜14は外側の繰返し、6〜13は内側の繰返し、7〜12は分岐で10がそれ以外の場合。空欄aは条件式、空欄bはswapの第3引数の位置。";
export const legacy2018HeapProgramTwoDescription="プログラム2 heapSortとdownHeap。各副プログラムの原行番号。 "+numbered("heapSort ",heapSort)+"。 "+numbered("downHeap ",downHeap)+"。制御範囲：heapSortの4〜7行は繰返し。αはheapSortの3行目の直後、4行目の前。downHeapの4〜16行は繰返し、6〜10行は右側の子の存在の分岐、7〜9行はその内側の値比較の分岐、11〜14行は親と子の値比較の分岐で13行目がそれ以外の場合。";
