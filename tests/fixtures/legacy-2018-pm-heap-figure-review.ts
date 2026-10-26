/** Independently pinned source program text and layout correspondence.
 * The source's controls remain graphical, with the same nesting and scopes. */
export const heapProgramReview={
 one:[
 ["makeHeap-declaration",30,40,"○副プログラム：makeHeap（整数型：data[], 整数型：heap[], 整数型：hnum）"],
 ["makeHeap-variables",30,76,"○整数型：i, k"],["outer-loop",58,112,"i：0, i < hnum, 1"],
 ["insert",80,148,"・heap[i] ← data[i]       /* heapにデータを追加 */"],["initial-k",80,184,"・k ← i"],["inner-loop",80,220,"k > 0"],["blank-a",143,256,"a"],["swap-k-b",124,292,"・swap(heap, k,      )"],["blank-b",361,292,"b"],["move-parent",124,328,"・k ← parent(k)"],["break",124,400,"・break          /* 内側の繰返し処理から抜ける */"],
 ["swap-declaration",30,540,"○副プログラム：swap（整数型：heap[], 整数型：i, 整数型：j）"],["swap-variable",30,576,"○整数型：tmp"],["save-i",30,612,"・tmp ← heap[i]"],["copy-j",30,648,"・heap[i] ← heap[j]"],["restore-i",30,684,"・heap[j] ← tmp"]
 ],
 two:[
 ["heapSort-declaration",80,40,"○副プログラム：heapSort（整数型：data[], 整数型：heap[], 整数型：hnum）"],["last-variable",80,76,"○整数型：last"],["makeHeap-call",80,112,"・makeHeap(data, heap, hnum)"],["last-loop",102,160,"last：hnum−1, last > 0, −1"],["remove-root",124,196,"・swap(heap, 0, last)     /* heap[0]とheap[last]の値を交換 */"],["rebuild",124,232,"・downHeap(heap, last−1)  /* heapを再構成 */"],
 ["downHeap-declaration",80,350,"○副プログラム：downHeap（整数型：heap[], 整数型：hlast）"],["downHeap-variables",80,386,"○整数型：n, tmp"],["initial-n",80,422,"・n ← 0"],["has-left",102,458,"lchild(n) ≦ hlast"],["choose-left",124,494,"・tmp ← lchild(n)"],["has-right",124,530,"rchild(n) ≦ hlast"],["right-not-smaller",146,566,"heap[tmp] ≦ heap[rchild(n)]"],["choose-right",168,602,"・tmp ← rchild(n)"],["child-greater",124,710,"heap[tmp] > heap[n]"],["swap-child",146,746,"・swap(heap, n, tmp)"],["return",146,818,"・return         /* downHeapから抜ける */"],["next-n",124,890,"・n ← tmp"]
 ],
 controls:{one:[["all-data","loop",36,112,472,null],["upward","loop",58,220,448,null],["compare-parent","branch",80,256,424,364]],two:[["sort-pass","loop",80,160,268,null],["downward","loop",80,458,926,null],["right-exists","branch",102,530,674,null],["right-tie","branch",124,566,638,null],["parent-comparison","branch",102,710,854,782]]},
 treePoints:[[430,75],[250,180],[610,180],[140,300],[320,300],[540,300],[720,300]],
 treeEdges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]],
 array:{left:150,width:90,top:70,height:50,valueY:95,indexY:45,edgeY:[145,168,191,214,237,260]},
 regions:{labels:["0","1","…","k−1","k","k+1","…","hnum−1"],left:160,width:110,top:70,height:50,lastX:655,targetEnd:710,sortedEnd:1040},
 programTwoLineNumbers:[[1,40],[2,76],[3,112],[4,160],[5,196],[6,232],[7,268],[1,350],[2,386],[3,422],[4,458],[5,494],[6,530],[7,566],[8,602],[9,638],[10,674],[11,710],[12,746],[13,818],[14,854],[15,890],[16,926]],
} as const;
