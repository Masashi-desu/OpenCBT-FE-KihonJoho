import {autumn2016NumericInputs as inputs,autumn2016FsmOptions,autumn2016BstOptions,autumn2016GateOptions,autumn2016LedOptions,autumn2016GateNames} from './legacy-2016-autumn-am-01-40-models';
const unique=(rows:readonly (readonly number[])[])=>Array.from(new Map(rows.map(r=>[JSON.stringify(r),[...r]])).values());
export const legacy2016AutumnAm0140FigureDomains:Record<string,number[][]>={
 'legacy-2016-autumn-am-3-fsm':unique(autumn2016FsmOptions.flat()),
 'legacy-2016-autumn-am-6-bst':unique(autumn2016BstOptions.flat()),
 'legacy-2016-autumn-am-9-address':unique(inputs[9]),
 'legacy-2016-autumn-am-11-bus':[[8],[16],[32]],
 'legacy-2016-autumn-am-18-switch':[[0]],
 'legacy-2016-autumn-am-21-circuit':[[0]],
 'legacy-2016-autumn-am-21-led':unique(autumn2016LedOptions.flat().map(v=>[v])),
 'legacy-2016-autumn-am-23-gates':unique(autumn2016GateOptions.flat()),
 'legacy-2016-autumn-am-31-stack':[[1],[2],[3],[5]],
 'legacy-2016-autumn-am-34-ntp':unique(inputs[34]),
};
export function legacy2016AutumnAm0140FigureAllowed(profile:string,v:readonly number[]):boolean{return Array.isArray(v)&&v.every(Number.isInteger)&&Boolean(legacy2016AutumnAm0140FigureDomains[profile]?.some(r=>r.length===v.length&&r.every((x,i)=>x===v[i])));}
export const autumn2016SegmentLabels=['a','b','c','d','e','f','g','Dt'];
export const autumn2016LayerLabels=['アプリケーション層','トランスポート層','インターネット層','リンク層','ハードウェア層'];
export const autumn2016Time=(n:number)=>'aa:bb:cc.'+String(n).padStart(6,'0');
export function legacy2016AutumnAm0140FigureAlt(profile:string,v:readonly number[]):string{
 if(!legacy2016AutumnAm0140FigureAllowed(profile,v))throw Error('PARAMETER_CONSTRAINT');
 if(profile.endsWith('-3-fsm')){const[o1,o2,oc,from,to,end,l0,l1,l2,swap]=v,a=swap?'b':'a',b=swap?'a':'b';return `左からS0，S1，S2の3状態。開始矢印はS0へ。終了状態は二重円のS${end}。S0→S1は${a}/${o1}，S1→S2は${a}/${o2}，底辺の曲線S${from}→S${to}は${a}/${oc}。S0，S1，S2にはそれぞれ${b}/${l0}，${b}/${l1}，${b}/${l2}の自己ループ。ラベルは入力／出力である。`;}
 if(profile.endsWith('-6-bst'))return `2分木。根の値は${v[0]}。`+v.flatMap((value,i)=>value?[2*i+1,2*i+2].filter(j=>j<v.length&&v[j]).map(j=>`値${value}の${j===2*i+1?'左':'右'}の子は${v[j]}。`):[]).join('')+'示した以外に節や枝はない。';
 if(profile.endsWith('-9-address')){const[mode,a,b]=v;if(mode===0)return `命令部とアドレス部から成る命令のアドレス部は${a}。主記憶のアドレス${a}には${b}，アドレス${b}にはデータが入る。矢印は命令のアドレス部から主記憶${a}へ，その内容${b}から主記憶${b}へ進む。`;if(mode===3)return `命令部とアドレス部から成る命令のアドレス部は${a}。矢印はアドレス部から主記憶のアドレス${a}にあるデータへ直接進む。`;return `命令部とアドレス部から成る命令のアドレス部は${a}。${mode===1?'指標レジスタ':'プログラムカウンタ'}の内容は${b}。二つの値は加算器＋へ入り，加算結果${a+b}が主記憶のアドレス${a+b}にあるデータを指す。`;}
 if(profile.endsWith('-11-bus'))return `左にMPU，右にメモリ。上側のn本の線はアドレスバスで，メモリ側の上からAn−1，An−2，An−3，省略記号，A2，A1，A0。下側の太い線はデータバスでD0～D${v[0]-1}。アドレス線の本数nは未知である。`;
 if(profile.endsWith('-18-switch'))return '縦の時間軸に沿って上から下へ進む。左はプロセスAの状態，中央はOSの処理，右はプロセスBの状態。Aは実行状態で割込みを受け，実行可能状態となる。矢印はAからOSの箱a，箱b，箱cの順に通り，Bへ向かう。Bは実行可能状態から実行状態になる。a，b，cの処理名は空欄である。';
 if(profile.endsWith('-21-circuit'))return 'アノードコモン型7セグメントLED。共通アノードはVccへ接続する。出力ポートP0，P1，P2，P3，P4，P5，P6，P7をそれぞれ独立した抵抗を介してa，b，c，d，e，f，g，Dtへ接続。aは上，bは右上，cは右下，dは下，eは左下，fは左上，gは中央，Dtは右下の点。白抜きは消灯，黒塗りは点灯という凡例を示す。';
 if(profile.endsWith('-21-led'))return autumn2016SegmentLabels.map((s,i)=>s+'は'+((v[0]>>i)&1?'点灯':'消灯')).join('，')+'。白抜きは消灯，塗りつぶしは点灯。';
 if(profile.endsWith('-23-gates'))return `3入力A，B，C。第1ゲートはAとB，第2はBとC，第3はAとCを入力とする。これらは順に${v.slice(0,3).map(i=>autumn2016GateNames[i]).join('，')}。第1と第2の出力が${autumn2016GateNames[v[3]]}へ入り，その出力と第3の出力が最後の${autumn2016GateNames[v[4]]}へ入りYを出す。`;
 if(profile.endsWith('-31-stack'))return `左にノード1，中央に装置A，右にノード2。各ノードには上から${autumn2016LayerLabels.join('，')}。装置Aには${autumn2016LayerLabels.slice(5-v[0]).join('，')}がある。ノード1と装置AはLANセグメント1，装置Aとノード2はLANセグメント2で接続。破線の両矢印はノードの全層と各LANを通り，装置Aではその最上段の層まで上がってから反対側へ進むデータの流れを示す。`;
 if(profile.endsWith('-34-ntp'))return `左にPC，右にNTPサーバの縦線。PCの問合せ送信時刻は${autumn2016Time(v[0])}，サーバの問合せ受信時刻は${autumn2016Time(v[1])}，サーバの応答送信時刻は${autumn2016Time(v[2])}，PCの応答受信時刻は${autumn2016Time(v[3])}。問合せの矢印はPCからサーバへ，応答はサーバからPCへ進む。応答にはサーバの問合せ受信時刻と応答送信時刻が含まれる。`;
 throw Error('FIGURE_PROFILE');
}
