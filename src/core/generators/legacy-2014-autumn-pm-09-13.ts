import { field, figure, p, table, type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { answerBody, blockText, choiceBankText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';
import { autumn2014PmPageAssetId, autumn2014PmReference } from './legacy-2014-autumn-pm-materials';
import {
  autumn2014Pm9Model, autumn2014Pm10Model, autumn2014Pm11Model, autumn2014Pm12Model, autumn2014Pm13Model,
  autumn2014Pm0913CaseCount, station, tenthKm,
} from './legacy-2014-autumn-pm-09-13-models';
import { autumn2014PmJavaReference, autumn2014PmCaslCharacterCodesReference } from './legacy-2014-autumn-pm-09-13-reference';
import { legacy2014AutumnPm0913Figures } from './legacy-2014-autumn-pm-09-13-figures';
import { autumn2014Pm9Pages } from './legacy-2014-autumn-pm-9-source';
import { autumn2014Pm10Pages } from './legacy-2014-autumn-pm-10-source';
import { autumn2014Pm11Pages } from './legacy-2014-autumn-pm-11-source';
import { autumn2014Pm12Pages } from './legacy-2014-autumn-pm-12-source';
import { autumn2014Pm13Pages } from './legacy-2014-autumn-pm-13-source';
import type { SourcePage } from './legacy-2014-autumn-pm-09-13-source';
import sourceData from './legacy-2014-autumn-pm-09-13-source-data.json';

type Settings = {
  prose?: (text: string) => string;
  code?: (text: string) => string;
  choices?: Record<string,string[]>;
  answers?: Record<string,string>;
  contexts?: GeneratedBody['contexts'];
  explanation: string;
};
type Bank = { page: number; options: string[] };
type Source = { fields: { id:string; section:number; bank:string; key:string }[]; banks: Record<string,Bank> };
const source: Record<number,Source> = sourceData;
const pages: Record<number,SourcePage[]> = {
  9:autumn2014Pm9Pages,10:autumn2014Pm10Pages,11:autumn2014Pm11Pages,12:autumn2014Pm12Pages,13:autumn2014Pm13Pages,
};
const kana = 'アイウエオカキクケコ';
const caslPages = [79,80,81,82,83,84];
const spreadsheetPages = [85,86,87,88,89,90];
const pseudoPages = [3,4];

function sourceDiagram(question:number, page:number, index:number, profile:string, caption:string) {
  const id = 'legacy-2014-autumn-pm-'+question+'-'+profile;
  const drawing = legacy2014AutumnPm0913Figures.find(item=>item.profile===id);
  if (!drawing) throw new Error('FIGURE_PROFILE');
  const diagram = figure(id,[index],caption,drawing.alt([index]));
  if (diagram.type !== 'diagram') throw new Error('FIGURE_PROFILE');
  const collection = '2014h26a-fe-pm-'+question;
  diagram.attribution = {
    origin:'adapted',sourceRefs:[{sourceId:'source-ipa-'+collection+'-qs',locator:{
      section:'問題',year:2014,period:'秋期',exam:'基本情報技術者試験',timeSlot:'午後',subject:'旧制度・午後',
      questionNumber:String(question),page,
    }}],rightsRefs:['rights-ipa-'+collection],creatorIds:['codex'],
  };
  if (profile === 'attribute') diagram.captionPresentation = 'accessible';
  return diagram;
}

function banksFor(question:number, settings?:Settings) {
  const {fields,banks} = source[question];
  return Object.entries(banks).map(([name, bank]): AnswerBank => {
    const members = fields.filter(field=>field.bank===name);
    const options = settings?.choices?.[name] ?? bank.options;
    if (options.length !== bank.options.length || new Set(options).size !== options.length) throw new Error('ANSWER_CHOICES');
    return {
      names:members.map(field=>field.id),
      labels:members.map(field=>'設問'+field.section+' '+field.id),
      options,
      language:question===9?'c':question===10?'cobol':question===11?'java':
        question===12&&name!=='cd'?'casl2':question===13&&!['a','g'].includes(name)?'text':undefined,
      keys:members.map(field=>{
        const answer = settings?.answers?.[field.id];
        const choice = answer===undefined?kana.indexOf(field.key):options.indexOf(answer);
        if (choice<0) throw new Error('ANSWER_REF');
        return choice;
      }),
    };
  });
}

function build(question:number, index:number, settings:Settings):GeneratedBody {
  const blocks = pages[question].flatMap(({page,parts})=>parts.flatMap((part):GeneratedBody['prompt']=>{
    if (part.type==='bank') return [];
    if (part.type==='panel') {
      const caption = settings.prose?.(part.caption) ?? part.caption;
      return [sourceDiagram(question,page,index,part.profile,caption)];
    }
    if (part.type==='paragraph'&&settings.prose) return [{...part,text:settings.prose(part.text)}];
    if (part.type==='code'&&settings.code) return [{...part,text:settings.code(part.text)}];
    return [part];
  }));
  const banks = banksFor(question,settings);
  const body = answerBody(blocks,banks,settings.explanation,settings.contexts);
  if(question===13) {
    const group = banks.at(-1)!;
    const offset = body.choices.length-group.options.length;
    group.options.forEach((option,i)=>{
      const pair = option.split(' | ');
      body.choices[offset+i] = [table('空欄の組合せ',['g1','g2'],[pair])];
    });
  }
  return body;
}

export function autumn2014Pm0913OriginalPageAlt(question:number):Record<number,string> {
  const banks = source[question].banks;
  return Object.fromEntries(pages[question].map(({page,parts})=>[page,parts.map(part=>{
    if (part.type==='panel') return blockText(sourceDiagram(question,page,0,part.profile,part.caption));
    if (part.type!=='bank') return blockText(part);
    const options = banks[part.id].options;
    if (question===13&&part.id==='g') {
      return 'gに関する解答群\n選択記号｜g1｜g2\n'+options.map((option,i)=>kana[i]+'｜'+option.replace(' | ','｜')).join('\n');
    }
    const label = source[question].fields.filter(field=>field.bank===part.id).map(field=>field.id).join('，');
    return choiceBankText(label,options);
  }).join('\n\n')]));
}

function q9(index:number):Settings {
  const {disabledBit,differences,usage} = autumn2014Pm9Model(index);
  const newCheck = '(NewAttr & BitR) == '+(disabledBit?'BitR':'0x00');
  const choices = disabledBit ? undefined : {ef:source[9].banks.ef.options.map(option=>
    option.replaceAll('(NewAttr & BitR) == BitR',newCheck))};
  return {
    choices,answers:{e:newCheck},
    prose:text=>disabledBit?text:text.replace('属性のビットrが1である利用者ID','属性のビットrが0である利用者ID')
      .replace('利用者IDが使用可能なら0，使用不可なら1','利用者IDが使用可能なら1，使用不可なら0'),
    explanation:'aは少なくとも一方の一覧に未処理レコードが残る条件。bはマスクでS/Oだけを比較する。同一IDを処理したcでは両方を読み進め、dの新規追加は新IDが旧IDより先に並ぶときである。'+
      '差分を印字するIDは'+differences.map(row=>row[0]).join('、')+'。設問2のeはrが'+disabledBit+'、fはIDと最終使用日の両方の一致を検査する。'+
      'どちらかに当たるIDは'+usage.map(row=>row[0]).join('、')+'。日付が全て0同士でも同一IDなら一致として扱う。',
  };
}

function q10(index:number):Settings {
  const {cumulativePriority} = autumn2014Pm10Model(index);
  const [,,,slideYear] = source[10].banks.def.options;
  const addTotal = source[10].banks.def.options[0];
  return {
    answers:{e:cumulativePriority?slideYear:addTotal,f:cumulativePriority?addTotal:slideYear},
    prose:text=>cumulativePriority?text.replace('“#”＞“@”＞“*”','“@”＞“#”＞“*”'):text,
    explanation:'対象商品について月が変わればaで現在月を記憶し、bで売上金額を現列の月額に加算する。cは行、列の順で指定した2桁のPRINT-MKを指す。'+
      'dは最初の12か月をZ-YEARに加えておく。各列でZ-TOTALに当月を足し、Z-YEARには当月を加えて12か月前を引く。'+
      (cumulativePriority?'今の条件では#を先に、@を後に書くため、重なったときは@が残る。':'#を最後に書くため、@や*と重なったときも#が残る。')+
      '印刷行は10万円又は50万円の区間に合わせて計算し、用紙には降順で書く。',
  };
}

const forwardValid = 'new long[] { now, now + 1, now + DELTA - 1 }';
const forwardInvalid = 'new long[] { now - 1, now + DELTA, now + DELTA + 1 }';
const backwardValid = 'new long[] { now, now - 1, now - DELTA + 1 }';
const backwardInvalid = 'new long[] { now + 1, now - DELTA, now - DELTA - 1 }';
function q11(index:number):Settings {
  const {includeStart,span,minutes} = autumn2014Pm11Model(index);
  const end = 'now + '+span;
  const valid = includeStart ? ['now','now + 1',end+' - 1'] : ['now + 1',end+' - 1',end];
  const invalid = includeStart ? ['now - 1',end,end+' + 1'] : ['now - 1','now',end+' + 1'];
  const array = (items:string[])=>'new long[] { '+items.join(', ')+' }';
  return {
    contexts:[autumn2014PmJavaReference()],
    answers:{a:includeStart?'<=':'<',b:includeStart?'>':'>=',g:span},
    prose:text=>includeStart?text:text
      .replace('今週月曜日の午前0時から金曜日の終わりまで（土曜日の午前0時以降は，無効）',
        '今週月曜日の午前0時より後から土曜日の午前0時ちょうどまで（土曜日の午前0時より後は，無効）')
      .replace('始点は含まれるが終点は含まれない','始点は含まれないが終点は含まれる'),
    code:text=>{
      const bound = text.replace('60 * 60 * 1000L',minutes+' * 60 * 1000L')
        .replace('Date end = new Date(now + DELTA);','Date end = new Date('+end+');')
        .replace('testConsistency(period, DELTA);','testConsistency(period, '+span+');')
        .replaceAll(forwardValid,array(valid)).replaceAll(forwardInvalid,array(invalid))
        .replace('end.setTime(now + DELTA * 2);','end.setTime(now + DELTA * '+(index===0?2:4)+');');
      return includeStart?bound:bound
        .replace('time.compareTo(start) >= 0','time.compareTo(start) > 0')
        .replace('time.compareTo(end) < 0','time.compareTo(end) <= 0')
        .replace(backwardValid,array(['now - 1','now - DELTA + 1','now - DELTA']))
        .replace(backwardInvalid,array(['now + 1','now','now - DELTA - 1']));
    },
    explanation:'逆向きの区間でも'+(includeStart?'始点を含み終点を含まないので、始点以下かつ終点より後':'始点を含めず終点を含むので、始点より前かつ終点以上')+'である。始点と終点が同じなら両方向とも条件を満たさない。'+
      '長さが負のときだけisBackwardが真。dとeは例外を表すClassを渡すため、nullのときNullPointerException.class、エポックより前のときIllegalArgumentException.classを使う。'+
      'fではDateをコピーして返す。コンストラクタでも別のDateを作っているため、呼出し元の引数とgetterで受け取ったDateのどちらを変えても、Periodの元の長さ'+span+'は変わらない。',
  };
}

function q12(index:number):Settings {
  const {order,descending,counted,digits,swaps,comparisons} = autumn2014Pm12Model(index);
  return {
    contexts:[autumn2014PmReference('アセンブラ言語CASL IIの仕様',caslPages),autumn2014PmCaslCharacterCodesReference()],
    answers:{a:descending?'JPL CONT':'JMI CONT',c:String(comparisons),d:String(swaps)},
    prose:text=>text.replaceAll('昇順',order).replace('配列の要素数nが4で','配列の要素数nが'+counted.length+'で')
      .replace("数字列'298'","数字列'"+digits[0]+"'"),
    explanation:'比較で左が'+(descending?'右より大きければJPL':'右より小さければJMI')+'で入替えを飛ばす。等しければ値は変わらないが入替え命令は実行される。'+
      '外側はカウンタが正の間JPL LOOP1で繰り返す。図2の比較は'+comparisons+'回で，入替え側の行11は'+swaps+'回実行される。'+
      'eではGR3に複写した下位4ビットだけを取り出し、ORで数字の文字コードにする。fではGR0を4ビット右に論理シフトし、残りがあれば次の桁を処理する。',
  };
}

function q13(index:number):Settings {
  const {from,to,base,line,total,sections,distance,distanceFare,fare,window,ratio} = autumn2014Pm13Model(index);
  const [one,two] = sections;
  const firstBand = String(one.distance/10);
  return {
    contexts:[autumn2014PmReference('共通に使用される擬似言語の記述形式',pseudoPages),
      autumn2014PmReference('表計算ソフトの機能・用語（基本情報技術者試験用）',spreadsheetPages)],
    answers:{f:'J：1, J ≦ '+(window-1)},
    prose:text=>text.replace('全長94.2km','全長'+tenthKm(total)+'km')
      .replace('セルB3に格納されている3.0','セルB3に格納されている'+tenthKm(line[1]))
      .replace('基本運賃100円','基本運賃'+base+'円')
      .replace('乗車距離が11.6kmの場合，区分番号1の区分距離10kmと，区分番号2の区分距離1.6km（11.6km−10km）',
        '乗車距離が'+tenthKm(distance)+'kmの場合，区分番号1の区分距離'+firstBand+'kmと，区分番号2の区分距離'+tenthKm(two.distance)+'km（'+tenthKm(distance)+'km−'+firstBand+'km）')
      .replace('乗車距離が11.6kmである駅コード“004”から駅コード“001”','乗車距離が'+tenthKm(distance)+'kmである駅コード“'+station(from)+'”から駅コード“'+station(to)+'”')
      .replace('1kmまでごとに10円','1kmまでごとに'+one.unitPrice+'円')
      .replace('3kmまでごとに20円',two.unit+'kmまでごとに'+two.unitPrice+'円')
      .replace('距離運賃120円','距離運賃'+distanceFare+'円')
      .replace('合計した220円','合計した'+fare+'円')
      .replaceAll('五つ離れた',(window===5?'五':'六')+'つ離れた')
      .replaceAll('50％',ratio+'％'),
    code:text=>text.replace('10円 × 切上げ(10km ÷ 1km, 0) ＝ 100円',
        one.unitPrice+'円 × 切上げ('+firstBand+'km ÷ 1km, 0) ＝ '+one.cost+'円')
      .replace('20円 × 切上げ((11.6km − 10km) ÷ 3km, 0) ＝ 20円',
        two.unitPrice+'円 × 切上げ(('+tenthKm(distance)+'km − '+firstBand+'km) ÷ '+two.unit+'km, 0) ＝ '+two.cost+'円')
      .replace('I ≦ 26','I ≦ '+(31-window))
      .replace(' * 0.5',' * '+ratio/100),
    explanation:'駅コードの一致位置は1から始まる。行の区間は次駅までなので，小さい位置以上かつ大きい位置未満を論理積で印す。'+
      '区分距離は当区分までの上限で切った累計から先行区分距離を引き、区分距離を単位距離で割った結果を切り上げて単位運賃を掛ける。'+
      '例の乗車距離は'+tenthKm(distance)+'km、基本運賃込み'+fare+'円。マクロの内側では既に先頭1区間を足しているのでJは1から'+(window-1)+'まで。'+
      '後の区分では各目標距離から一つ前の丸め後の上限（B5、B6）を差し引き、その残りを単位距離の倍数に切り上げてから上限を足し戻す。',
  };
}

function definition(number:number, title:string, publicNotes:string, buildSettings:(index:number)=>Settings, fixedPages:number[]=[]):AfternoonBookletDefinition {
  return {
    source:'2014h26a-fe-pm-'+number,title,version:'3.2.0',fields:[field('対象・条件',0,autumn2014Pm0913CaseCount-1)],reference:[0],
    sourceAnswer:source[number].fields.map(part=>part.key).join(''),
    notes:publicNotes+' 原資料の空欄と各解答群の個数、印字例、注意書きを維持する。',
    publicNotes,
    ...(fixedPages.length?{fixedReferenceAssetIds:fixedPages.map(autumn2014PmPageAssetId)}:{}),
    build(values) {
      const index = selectCase(values,autumn2014Pm0913CaseCount);
      return build(number,index,buildSettings(index));
    },
  };
}

export const legacy2014AutumnPm9Definition = definition(9,'利用者ID管理の確認（C）','新旧一覧の特権、日付と利用可否ビットの意味を変え、照合条件と印字結果を更新します。',q9);
export const legacy2014AutumnPm10Definition = definition(10,'売上傾向の分析（COBOL）','月売上とグラフの描画優先を変え、集計、記号の重なりと更新順を扱います。',q10);
export const legacy2014AutumnPm11Definition = definition(11,'可変オブジェクト（Java）','期間の端点の包含と長さを変え、Dateの比較と防御的コピーを検査します。',q11);
export const legacy2014AutumnPm12Definition = definition(12,'バブルソート（アセンブラ）','並べ替えの方向と配列内容、数字列を変え、分岐、回数と表示を更新します。',q12,caslPages);
export const legacy2014AutumnPm13Definition = definition(13,'鉄道運賃（表計算）','乗降駅と運賃体系、改定の区間数や割合を変え、ワークシートとマクロを更新します。',q13,[...pseudoPages,...spreadsheetPages]);
