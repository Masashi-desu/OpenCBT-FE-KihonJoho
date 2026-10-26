import{legacy2017Pm2Source as source}from'./legacy-2017-pm2-source';
/** Three physical LED target states. Figure1's digit2 is a fixed example. */
export const legacy2017Pm2Profile='legacy-2017-pm2-temperature-monitor';
export const legacy2017Pm2BitPositions=['decimalPoint','middle','upperLeft','lowerLeft','bottom','lowerRight','upperRight','top'] as const;
const lit:Record<number,readonly number[]>={2:[7,6,4,3,1],3:[7,6,5,4,1],4:[6,5,2,1],6:[7,5,4,3,2,1]};
export function legacy2017Pm2Model(variant:number){
 if(!Number.isInteger(variant)||variant<0||variant>2)throw Error('PARAMETER_CONSTRAINT');
 const digit=[6,4,3][variant],bits=lit[digit],mask=bits.reduce((n,b)=>n+2**b,0),code=digit-1,center=code*10;
 const a=['66','BE','DA','F2','FE'],b=['010','011','100','101','110'],ranges=[[center-10,center],[center-5,center+5],[center,center+10],[center+5,center+15],[center+10,center+20]],c=ranges.map(([l,u])=>`${l}℃以上${u}℃未満`),d=['GR＜0','GR＝0','GR＝1','GR＞1'],e=['INPUT 1','INPUT 2','INPUT 3','OUTPUT 1','OUTPUT 2'];
 return{variant,digit,bits,mask,hex:mask.toString(16).toUpperCase().padStart(2,'0'),code,binary:code.toString(2).padStart(3,'0'),center,lower:center-5,upper:center+5,choices:[a,b,c,d,e],indices:[a.indexOf(mask.toString(16).toUpperCase()),b.indexOf(code.toString(2).padStart(3,'0')),1,1,3]};
}
export function legacy2017Pm2FigureAlt(variant:number,part:number){const m=legacy2017Pm2Model(variant);if(!Number.isInteger(part)||part<0||part>4)throw Error('FIGURE_DOMAIN');
 if(part===0)return source.selectionNotice+' 選は丸で囲まれている。';
 if(part===1)return'図1。CPU、一定間隔で割り込むタイマ、A/D変換器、出力ポートがバスへ接続。温度検出器からA/D変換器へ矢印。出力ポートのビット15から0を縦に表示。LEDの上横はビット7、右上は6、右下は5、下横は4、左下は3、左上は2、中横は1、小数点は0へ接続。上横、右上、中横、左下、下横が点灯、左上、右下、小数点は消灯。凡例は塗りつぶしが点灯、輪郭だけが消灯。';
 if(part===2){const names=['小数点','中横','左上','左下','下横','右下','右上','上横'];return'図2。LEDの'+Array.from({length:8},(_,b)=>names[b]+'は'+(m.bits.includes(b)?'点灯':'消灯')).join('、')+'。';}
 if(part===3){const table=source.pages[2].blocks.find(b=>b.id==='table2');if(!table||!('rows'in table))throw Error('SOURCE_TABLE');return '表2。列は機器、I/Oポート番号、動作概要。'+table.rows.map(r=>r.join('：')).join(' ')+ ' A/D変換器の機器セルは4行結合、ポート2セルは3行結合。';}
 return'図3。開始、GR←1、OUTPUT 2（コメント：A/D変換開始）、INPUT 2、条件の空欄dの順。dがYesなら左へ戻りINPUT 2の直前へ、Noなら下のINPUT 3へ。続いて変換処理（コメント：A/D変換器の出力値を形状データαに変換）、GR←α、命令の空欄e、終了。2コメントは右の破線と括弧による注釈。';
}
