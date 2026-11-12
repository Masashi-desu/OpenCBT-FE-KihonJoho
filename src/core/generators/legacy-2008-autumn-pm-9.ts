import {code,p,table} from './definition';
import {bank,createDefinition} from './legacy-2008-autumn-pm-06-09-support';
import {autumn2008PmPageAssetId,autumn2008PmReference} from './legacy-2008-autumn-pm-materials';

export const caslReferencePages=[64,65,66,67,68,69] as const;
const maskCases=[
  {width:1,lowOffset:0,highOffset:1,inside:0},
  {width:2,lowOffset:0,highOffset:1,inside:1},
  {width:3,lowOffset:0,highOffset:0,inside:0},
  {width:4,lowOffset:1,highOffset:1,inside:1},
] as const;
const ptn1=`PTN1    START
        PUSH  0,GR1
        LAD   GR2,15
        SUBL  GR2,GR1
        LD    GR1,GR2
        LD    GR2,=［a］
        SRA   GR2,0,GR1
        POP   GR1
        RET
        END`;
const ptn2=`PTN2    START
        PUSH  0,GR1
        LAD   GR2,16
        SUBL  GR2,GR1
        LD    GR1,GR2
        LD    GR2,=［b］
        SRL   GR2,0,GR1
        POP   GR1
        RET
        END`;
const ptn3=`PTN3    START
        LD    GR2,=［c］
        SLL   GR2,0,GR1
        RET
        END`;
export function ptn4(index:number) {
  const {lowOffset,highOffset}=maskCases[index];
  const lower=lowOffset?'LAD   GR1,1,GR2   ; 下端B2の次のビット':'LD    GR1,GR2';
  return `PTN4    START
        ST    GR1,WRK
        ${lower}
        CALL  PTN1
        PUSH  0,GR2       ; PTN1の結果を一時保存
        LD    GR1,WRK
        LAD   GR1,${highOffset},GR1   ; ${index===0?'ビット番号の調整':highOffset?'上端B1を含める':'上端B1を含めない'}
        CALL  PTN2
        POP   GR1         ; 保存していたPTN1の結果をGR1へ
        ［d］
        LD    GR1,WRK
        RET
WRK     DS    1
        END`;
}
const asHex=(word:number)=>'#'+word.toString(16).toUpperCase().padStart(4,'0');
const section2Choices=['AND GR2,GR1','OR GR2,GR1','SLL GR2,0,GR1','SRA GR2,0,GR1','SRL GR2,0,GR1','XOR GR2,GR1'];
export const q9=createDefinition(9,'CASL II：16ビットのマスクパターン生成','連続するビット数と区間の端点・内外の値',
  'aウ bオ cア／dカ',
  '16ビット語、上位ビット15・下位ビット0、レジスタGR1復元、算術右／論理右／論理左、PTN1とPTN2を合成する4欄を維持。PTN3の連続ビット幅とPTN4の区間端点・区間内外の値を変更する。文字コードを用いない。',
  index=>{
    const {width,lowOffset,highOffset,inside}=maskCases[index];
    const seed=asHex(2**width-1);
    const ptn3Description=width===1?'与えられたビット番号のビットを1，それ以外を0に設定':
      '与えられたビット番号BからB＋'+(width-1)+'までの'+width+'ビットを1，それ以外を0に設定';
    const range=index===0?'与えられたビット番号B1からB2（15＞B1≧B2＞0）まで':
      '与えられたビット番号B1とB2（15＞B1'+(highOffset===lowOffset?'＞':'≧')+'B2＞0）に対し，'+
        (lowOffset?'B2＋1':'B2')+'以上'+(highOffset?'B1以下':'B1未満');
    const operator=inside?'AND':'XOR';
    return {
      pages:[
        {number:35,blocks:[
          p('問9　次のアセンブラプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕'),p('1語のマスクパターンを生成するプログラムである。'),
          p('(1) プログラムと生成するマスクパターンの対応を表1に示す。'),
          table('表1　プログラムと生成するマスクパターンの対応',['プログラム名','マスクパターンの生成'],[
            ['PTN1','最上位ビットから与えられたビット番号までのビットを1，それ以外を0に設定'],
            ['PTN2','最上位ビットから与えられたビット番号までのビットを0，それ以外を1に設定'],
            ['PTN3',ptn3Description],
          ]),
          p(index===0?'(2) プログラムは，ビット番号（0～15）をGR1に設定して呼び出され，生成したマスクパターンをGR2に格納して主プログラムに戻る。':
            '(2) プログラムは，ビット番号をGR1に設定して呼び出され，生成したマスクパターンをGR2に格納して主プログラムに戻る。ビット番号は最下位が0，最上位が15で，PTN1とPTN2では0～15，PTN3では0～'+(16-width)+'とする。'),
          p('(3) プログラムから戻るとき，汎用レジスタGR1の内容は元に戻す。'),
        ]},
        {number:36,blocks:[
          p('〔プログラム1〕'),code(ptn1,'casl2'),
          p('〔プログラム2〕'),code(ptn2,'casl2'),
          p('〔プログラム3〕'),code(ptn3,'casl2'),
          p('設問1　プログラム1～3中の空欄に入れる正しい答えを，解答群の中から選べ。'),
        ],banks:[bank('abc',[seed,'#0FFF','#8000','#FFF0','#FFFF'],'ウオア','casl2',1)]},
        {number:37,blocks:[
          p('設問2　PTN1，PTN2を使用して，表2に示すマスクパターンを生成するPTN4を作成した。プログラム4中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          table('表2　作成したプログラムと生成するマスクパターンの対応',['プログラム名','マスクパターンの生成'],[
            ['PTN4',range+'のビットを'+inside+'，それ以外を'+(1-inside)+'に設定'],
          ]),
          p('プログラムは，B1をGR1に，B2をGR2に設定して呼び出され，生成したマスクパターンをGR2に格納して主プログラムに戻る。プログラムから戻るとき，汎用レジスタGR1の内容は元に戻す。'),
          p('〔プログラム4〕'),code(ptn4(index),'casl2'),
        ],banks:[bank('d',section2Choices,inside?'ア':'カ','casl2',2)]},
      ],
      contexts:[autumn2008PmReference('アセンブラ言語の仕様',caslReferencePages)],
      explanation:[
        'a：#8000は最上位ビットだけが1。15−GR1ビットの算術右シフトは空いた上位に符号の1を補い，ビット15から指定位置までを1にする。',
        'b：#FFFFの全ビットは1。16−GR1ビットの論理右シフトは空いた上位に0を補うので，指定位置より下のビットだけが1になる。',
        'c：'+seed+'は下位'+width+'ビットを1にした語。GR1ビットの論理左シフトで指定位置から'+width+'ビットを1にする。',
        'd：PTN1は下端から上の範囲，PTN2は上端以下の範囲を1にする。区間内は両者が1，外は片方だけが1なので，'+
          operator+' で内側を'+inside+'，外側を'+(1-inside)+'にする。最後にWRKからGR1を復元する。',
      ].join('\n'),
    };
  },caslReferencePages.map(autumn2008PmPageAssetId));
