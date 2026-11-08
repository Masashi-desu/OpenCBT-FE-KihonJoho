import { field, figure, p, table, type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { answerBody, blockText, choiceBankText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';
import { spring2014PmPageAssetId, spring2014PmReference } from './legacy-2014-spring-pm-materials';
import { spring2014PmJavaReference, spring2014PmCaslCodesReference } from './legacy-2014-spring-pm-09-13-reference';
import { legacy2014SpringPm0913Figures } from './legacy-2014-spring-pm-09-13-figures';
import {
  spring2014Pm9Model,spring2014Pm10Model,spring2014Pm11Model,spring2014Pm12Model,
  spring2014Pm13Model,spring2014Pm0913CaseCount,
} from './legacy-2014-spring-pm-09-13-models';
import { spring2014Pm9Pages,spring2014Pm9Banks } from './legacy-2014-spring-pm-9-source';
import { spring2014Pm10Pages,spring2014Pm10Banks } from './legacy-2014-spring-pm-10-source';
import {
  spring2014Pm11Pages,spring2014Pm11Banks,spring2014Pm11OriginalArticles,javaArticleRegistration,
} from './legacy-2014-spring-pm-11-source';
import { spring2014Pm12Pages,spring2014Pm12Banks } from './legacy-2014-spring-pm-12-source';
import { spring2014Pm13Pages,spring2014Pm13Banks,spring2014Pm13JobFormula } from './legacy-2014-spring-pm-13-source';
import type { SourcePage } from './legacy-2014-spring-pm-09-13-source';

const kana='アイウエオカキクケコ';
type Settings = {
  prose?:(text:string)=>string;
  code?:(text:string)=>string;
  choices?:Record<string,string[]>;
  answers?:Record<string,string>;
  contexts?:GeneratedBody['contexts'];
  explanation:string;
};
type Field = {id:string; section:number; bank:string; key:string};
type Source = { pages:SourcePage[]; fields:Field[]; banks:Record<string,{options:string[]}> };
const entry = (id:string,section:number,key:string,bank=id):Field=>({id,section,bank,key});
const sources:Record<number,Source>={
  9:{pages:spring2014Pm9Pages,banks:spring2014Pm9Banks,
    fields:[entry('a',1,'ア'),entry('b',1,'イ'),entry('c',1,'ア'),entry('d',1,'カ'),entry('e',2,'ウ'),entry('f',2,'ウ')]},
  10:{pages:spring2014Pm10Pages,banks:spring2014Pm10Banks,
    fields:[entry('a',1,'ア','ab'),entry('b',1,'オ','ab'),entry('c',1,'イ'),entry('d',1,'ア'),entry('e',2,'ウ'),entry('f',2,'ウ'),entry('g',2,'エ')]},
  11:{pages:spring2014Pm11Pages,banks:spring2014Pm11Banks,
    fields:[entry('a',1,'イ','ad'),entry('b',1,'ウ'),entry('c',1,'ウ'),entry('d',1,'キ','ad'),entry('e',1,'キ','ef'),entry('f',1,'カ','ef'),entry('s2',2,'エ')]},
  12:{pages:spring2014Pm12Pages,banks:spring2014Pm12Banks,
    fields:[entry('a',1,'イ'),entry('b',1,'カ'),entry('s2',2,'カ'),entry('c',3,'エ'),entry('d',3,'エ'),entry('e',3,'オ')]},
  13:{pages:spring2014Pm13Pages,banks:spring2014Pm13Banks,
    fields:[entry('a',1,'エ'),entry('b',1,'イ'),entry('c',1,'イ'),entry('d',2,'ウ'),entry('e',2,'オ','ef'),entry('f',2,'ケ','ef')]},
};
const caslPages=[80,81,82,83,84,85];
const pseudoPages=[4,5];
const spreadsheetPages=[86,87,88,89,90,91];

function sourceDiagram(question:number,page:number,index:number,profile:string,caption:string) {
  const id='legacy-2014-spring-pm-'+question+'-'+profile;
  const drawing=legacy2014SpringPm0913Figures.find(item=>item.profile===id);
  if (!drawing) throw new Error('FIGURE_PROFILE');
  const block=figure(id,[index],caption,drawing.alt([index]));
  if (block.type!=='diagram') throw new Error('FIGURE_PROFILE');
  const questionId='2014h26h-fe-pm-'+question;
  block.attribution={origin:'adapted',sourceRefs:[{
    sourceId:'source-ipa-'+questionId+'-qs',locator:{
      section:'問題',year:2014,period:'春期',exam:'基本情報技術者試験',timeSlot:'午後',subject:'旧制度・午後',
      questionNumber:String(question),page,
    },
  }],rightsRefs:['rights-ipa-'+questionId],creatorIds:['codex']};
  return block;
}

function makeBanks(question:number,settings:Settings) {
  const {fields,banks}=sources[question];
  return Object.entries(banks).map(([name,bank]):AnswerBank=>{
    const members=fields.filter(part=>part.bank===name);
    const options=settings.choices?.[name]??bank.options;
    if (options.length!==bank.options.length || new Set(options).size!==options.length) throw new Error('ANSWER_CHOICES');
    const language=question===9?'c':question===10&&name!=='e'?'cobol':question===11&&name!=='s2'?'java':
      question===12&&name!=='s2'?'casl2':question===13&&name!=='c'?'text':undefined;
    return {names:members.map(member=>member.id),
      labels:members.map(({id,section})=>'設問'+section+(id==='s2'?'':' '+id)),options,language,
      keys:members.map(({id,key})=>{
        const answer=settings.answers?.[id];
        const result=answer===undefined?kana.indexOf(key):options.indexOf(answer);
        if (result<0) throw new Error('ANSWER_REF');
        return result;
      }),
    };
  });
}

function build(question:number,index:number,settings:Settings):GeneratedBody {
  const {fields,pages}=sources[question];
  const prompt=pages.flatMap(({page,parts})=>parts.flatMap((part):GeneratedBody['prompt']=>{
    if (part.type==='bank') return [];
    if (part.type==='panel') return [sourceDiagram(question,page,index,part.profile,settings.prose?.(part.caption)??part.caption)];
    if (part.type==='paragraph'&&settings.prose) return [{...part,text:settings.prose(part.text)}];
    if (part.type==='code'&&settings.code) return [{...part,text:settings.code(part.text)}];
    return [part];
  }));
  const banks=makeBanks(question,settings);
  const body=answerBody(prompt,banks,settings.explanation,settings.contexts);
  const partOrder=fields.map(({id})=>'part-'+id);
  body.answerParts!.sort((a,b)=>partOrder.indexOf(a.id)-partOrder.indexOf(b.id));
  body.partAnswers!.sort((a,b)=>('partId'in a&&'partId'in b)?partOrder.indexOf(a.partId)-partOrder.indexOf(b.partId):0);
  if (question===13) {
    const first=banks[0].options.length+banks[1].options.length;
    banks[2].options.forEach((option,i)=>{
      body.choices[first+i]=[table('空欄の組合せ',['c1','c2'],[option.split(' | ')])];
    });
  }
  return body;
}

export function spring2014Pm0913OriginalPageAlt(question:number):Record<number,string> {
  const {pages,fields,banks}=sources[question];
  return Object.fromEntries(pages.map(({page,parts})=>[page,parts.map(part=>{
    if (part.type==='panel') return blockText(sourceDiagram(question,page,0,part.profile,part.caption));
    if (part.type!=='bank') {
      const text=blockText(part);
      return question===13&&page===73&&part.type==='code'&&text===spring2014Pm13JobFormula?text.replaceAll('～',':'):text;
    }
    const options=banks[part.id].options;
    if (question===13&&part.id==='c')
      return 'cに関する解答群\n選択記号｜c1｜c2\n'+options.map((option,i)=>kana[i]+'｜'+option.replace(' | ','｜')).join('\n');
    if (part.id==='s2') return choiceBankText('',options).replace('に関する解答群','解答群');
    const label=fields.filter(field=>field.bank===part.id).map(field=>field.id).join('，');
    return choiceBankText(label,question===13&&part.id==='b'?options.map(option=>option.replaceAll('～',':')):options);
  }).join('\n\n')]));
}

function q9(index:number):Settings {
  const {width,punctuation}=spring2014Pm9Model(index);
  return {
    choices:{f:spring2014Pm9Banks.f.options.map(option=>option.replace("'.'","'"+punctuation+"'"))},
    prose:text=>text.replaceAll('最大文字数を50','最大文字数を'+width).replace('“.”','“'+punctuation+'”'),
    explanation:'aは改行を出力したので，行で既に出力した文字数lposを0に戻す。bには改行を入れ，幅'+width+
      'ちょうどで終わる単語の後の空白を次の行に送る。cで空白までに出力した単語のバッファを空にする。'+
      'dは現在行の出力済み文字数と単語のバッファ内の文字数の和が幅以上になったところで，次の文字を含む単語全体を次行へ移す。'+
      '設問2のeは行頭以外の空白だけを出力する。fで読み込んだ単語の文字を毎回lchに覚えれば，次の行の先頭で前の単語が“'+punctuation+
      '”で終わったか判定できる。初期値も同じ記号なので最初の単語の前に空白が入る。',
  };
}

function q10(index:number):Settings {
  const {history,cutoff}=spring2014Pm10Model(index);
  return {
    prose:text=>text.replaceAll('5回',history+'回').replaceAll('上位10名','上位'+cutoff+'名').replaceAll('10人目',cutoff+'人目'),
    code:text=>text.replace('OCCURS 5.','OCCURS '+history+'.'),
    choices:{
      ab:spring2014Pm10Banks.ab.options.map(option=>option.replace(/W-CNT > ([45])/,(_match,value)=>'W-CNT > '+(value==='5'?history:history-1)).replace('FROM 4 BY -1','FROM '+(history-1)+' BY -1')),
      d:spring2014Pm10Banks.d.options.map(option=>option==='5'?String(history):option),
      f:spring2014Pm10Banks.f.options.map(option=>option.replace('10',String(cutoff))),
    },
    explanation:'採点ファイルの今回の受検者ごとに，aで得点マスタを少なくとも1件読んでから従業員番号の一致を調べる。'+
      '履歴を古い側の'+(history-1)+'番目から1番目へ逆順に移すbなら上書き前の値を利用できる。日付が0の枠は未受検である一方，0点は有効なのでcは日付で判断する。'+
      'dでは最新の受検日と得点を1番目に置く。eは今回の受検者を一度だけ整列に渡す位置。降順なのでfで'+cutoff+
      '人目を超え，かつ前の得点より低くなった時点で止める。gで今回表示した得点を次との比較用に保持する。',
  };
}

function q11(index:number):Settings {
  const {articles,changed,after,denied}=spring2014Pm11Model(index);
  const paidCount=after.filter(article=>!article.free).length;
  return {
    contexts:[spring2014PmJavaReference()],
    code:text=>text.replace(javaArticleRegistration(spring2014Pm11OriginalArticles),javaArticleRegistration(articles)),
    prose:text=>text.replace('記事識別子 "0003"','記事識別子 "'+changed+'"'),
    answers:{s2:denied+'回'},
    explanation:'aはGuestで無料記事だけを許す。bはそれぞれの親クラスのコンストラクタに利用者名を渡す。cは記録した日付が今日と同じとき，同一の有料記事だけを許すための条件。'+
      '有料会員のdは常に閲覧を許す。eで利用者を外側，fでTreeMapのキーを内側にして利用者ごとに識別子順で記事を処理する。'+
      '記事'+changed+'を有料にすると有料記事は'+paidCount+'本。ゲストの拒否'+paidCount+'回と登録会員の拒否'+(paidCount-1)+'回，有料会員の0回を足して'+denied+'回となる。',
  };
}

function q12(index:number):Settings {
  const {next}=spring2014Pm12Model(index);
  return {
    contexts:[spring2014PmReference('アセンブラ言語の仕様',caslPages),spring2014PmCaslCodesReference()],
    answers:{s2:next},
    explanation:'空白ならSETTKNを呼んでからaでLPへ戻るため，空白を次の単語に含めない。bでは区切り位置GR1から単語の先頭位置GR6を引いて長さを得る。'+
      'NEXTは各単語で数字以外が初めて出たときだけ実行する。設問2の2度目でGR4にある文字は'+next+'である。'+
      'cは文字列の開始番地そのものではなく，番地と長さが入る最初の表要素をGR1に渡す。*を引いた演算子コードは0，1，3。dはその位置の分岐番地を読み出す。'+
      'eで乗数を1ビット右へ論理シフトして順に各ビットを調べる。左へシフトするのは被乗数GR4である。',
  };
}

function q13(index:number):Settings {
  const {ages,sampleAge,sampleMajor,sampleMiddle,jobs,minimum,groupCount}=spring2014Pm13Model(index);
  const erratum=spring2014PmReference('問13の公式正誤表',[2]);
  erratum.blocks.unshift(p('原冊子の印刷p.72（PDF p.73）にある職業コードのIF式とbの解答群では，セル範囲の区切りを「:」から「～」に読み替える。公式解答の記号は変わらない。'));
  const majorRow=jobs.indexOf(sampleMajor)+2, middleRow=jobs.indexOf(sampleMiddle)+2;
  return {
    contexts:[erratum,spring2014PmReference('共通に使用される擬似言語の記述形式',pseudoPages),
      spring2014PmReference('表計算ソフトの機能・用語（基本情報技術者試験用）',spreadsheetPages)],
    prose:text=>text.replace('23歳の場合，“20”',''+sampleAge+'歳の場合，“'+ages[1]+'”')
      .replace('セルL2には大分類コード100','セルL'+majorRow+'には大分類コード'+sampleMajor)
      .replace('セルM2は“*”なので，100番台の全ての職業コードは100','セルM'+majorRow+'は“*”なので，'+sampleMajor+'番台の全ての職業コードは'+sampleMajor)
      .replace('セルL6には中分類コード210','セルL'+middleRow+'には中分類コード'+sampleMiddle)
      .replace('セルM6は“*”なので，210番台の全ての職業コードは210','セルM'+middleRow+'は“*”なので，'+sampleMiddle+'番台の全ての職業コードは'+sampleMiddle),
    explanation:'aは郵便番号を10の5乗で割った整数部。bは年齢以下で最大の区分開始値を昇順の表から取る。c1は十と一の位を0にし，c2は一の位だけを0にする。'+
      '大分類を先に照合し，該当しない場合だけ中分類を調べる。dで未処理の最小評価値の位置を探す。マークが付くと最上位桁が1になり，未処理の行より後になる。'+
      'キーが変わった時に直前の組の多重度が'+minimum+'以上ならeで出力を次の行に進め，同じキーが続く時はfで多重度だけを1増やす。'+
      '最後の組も下限未満なら消去する。この例の提供リストには'+groupCount+'組が載る。',
  };
}

type Info={number:number;title:string;notes:string;make:(index:number)=>Settings;references?:number[];fixed?:boolean};
function definition({number,title,notes,make,references,fixed}:Info):AfternoonBookletDefinition {
  const {fields}=sources[number];
  const sourceAnswer=[...new Set(fields.map(part=>part.section))].map(section=>{
    const parts=fields.filter(part=>part.section===section);
    return '設問'+section+' '+parts.map(({id,key})=>id==='s2'?key:id+'='+key).join('，');
  }).join('／');
  return {
    source:'2014h26h-fe-pm-'+number,title,version:'3.7.0',
    fields:[field('対象・条件',0,spring2014Pm0913CaseCount-1)],reference:[0],sourceAnswer,
    notes:notes+' 原資料の設問、空欄、各解答群と必要な図表を保持する。',publicNotes:notes,
    ...(references?{fixedReferenceAssetIds:references.map(spring2014PmPageAssetId)}:{}),
    ...(fixed?{answerVariation:'fixed' as const}:{}),
    build(values){const index=selectCase(values,spring2014Pm0913CaseCount);return build(number,index,make(index));},
  };
}
export const legacy2014SpringPm9Definition=definition({number:9,title:'テキストの編集（C）',make:q9,fixed:true,
  notes:'最大文字数、入力テキスト、段落の先頭に空白を出す条件を変え、処理結果とコードの変更表に反映します。'});
export const legacy2014SpringPm10Definition=definition({number:10,title:'英語の検定テストの結果管理（COBOL）',make:q10,
  notes:'得点履歴を残す回数と同点の受検者も含める順位を変え、レコードと繰返し条件に反映します。'});
export const legacy2014SpringPm11Definition=definition({number:11,title:'雑誌記事のオンライン購読サイト（Java）',make:q11,
  notes:'記事識別子、無料と有料の記事、設問2で有料にする記事を変え、各利用者の閲覧結果を更新します。'});
export const legacy2014SpringPm12Definition=definition({number:12,title:'文字列中の単語の切出し処理（アセンブラ）',make:q12,references:caslPages,
  notes:'文字列と開始番地を変え、単語管理テーブルと条件分岐を実行したときのレジスタの文字を更新します。'});
export const legacy2014SpringPm13Definition=definition({number:13,title:'顧客情報の匿名化（表計算）',make:q13,fixed:true,references:[2,...pseudoPages,...spreadsheetPages],
  notes:'年齢区分、職業分類、多重度の下限と顧客の例を変え、匿名化・提供リストへ反映します。公式正誤表の範囲記号を適用します。'});
