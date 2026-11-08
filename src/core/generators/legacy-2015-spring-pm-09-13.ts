import { field, figure, p, type GeneratedBody } from './definition';
import type { AfternoonBookletDefinition } from './afternoon-booklet-extension-contract';
import { answerBody, blockText, choiceBankText, selectCase, type AnswerBank } from './legacy-2016-autumn-pm-09-13-support';
import { spring2015PmPageAssetId, spring2015PmReference } from './legacy-2015-spring-pm-materials';
import { spring2015PmErratum, spring2015Pm0913Pages } from './legacy-2015-spring-pm-09-13-source';
import sourceData from './legacy-2015-spring-pm-09-13-source-data.json';
import { legacy2015SpringPm0913Figures } from './legacy-2015-spring-pm-09-13-figures';
import { spring2015PmJavaReference } from './legacy-2015-spring-pm-09-13-java-reference';
import { spring2015Pm9Model, spring2015Pm10Model, spring2015Pm11Model, spring2015Pm12Model,
  spring2015Pm13Model, spring2015Pm0913CaseCounts } from './legacy-2015-spring-pm-09-13-models';

type Bank = { page: number; options: string[] };
type Source = { fields: {id:string; section:number; bank:string; key:string}[]; banks: Record<string,Bank> };
const source: Record<number,Source> = sourceData;
const kana = 'アイウエオカキクケコ';
type Settings = {
  prose?: (text: string) => string;
  program?: (text: string) => string;
  choices?: Record<string,string[] | undefined>;
  answers?: Record<string,string>;
  contexts?: GeneratedBody['contexts'];
  explanation: string;
};
type PromptBlock = GeneratedBody['prompt'][number];

function sourceBlocks(question: number, index: number, settings?: Settings) {
  return spring2015Pm0913Pages[question].map(page => ({
    page:page.page,
    blocks:page.parts.map((block): PromptBlock => {
      if (block.type === 'paragraph' && settings?.prose) return {...block,text:settings.prose(block.text)};
      if (block.type === 'code' && settings?.program) return {...block,text:settings.program(block.text)};
      if (block.type !== 'panel') return block;
      const profile = 'legacy-2015-spring-pm-' + question + '-' + block.profile;
      const drawing = legacy2015SpringPm0913Figures.find(item => item.profile === profile);
      if (!drawing) throw new Error('FIGURE_PROFILE');
      const result = figure(profile,[index],block.caption,drawing.alt([index]));
      if (result.type !== 'diagram') throw new Error('FIGURE_PROFILE');
      const collection = '2015h27h-fe-pm-' + question;
      result.attribution = {
        origin:'adapted', sourceRefs:[{sourceId:'source-ipa-' + collection + '-qs',locator:{
          section:'問題', year:2015, period:'春期', exam:'基本情報技術者試験', timeSlot:'午後',
          subject:'旧制度・午後', questionNumber:String(question), page:page.page,
        }}], rightsRefs:['rights-ipa-' + collection], creatorIds:['codex'],
      };
      return result;
    }),
  }));
}

const optionLanguage = (question:number,bank:string) =>
  question === 10 ? 'cobol' :
    question === 11 && bank !== 's2' ? 'java' :
    question === 12 && ['a','b','c'].includes(bank) ? 'casl2' :
    question === 13 ? 'text' : undefined;

function build(question: number,index: number,settings: Settings): GeneratedBody {
  const { fields, banks } = source[question];
  const answerBanks = Object.entries(banks).map(([id, bank]): AnswerBank => {
    const members = fields.filter(field => field.bank === id);
    const options = settings.choices?.[id] ?? bank.options;
    if (options.length !== bank.options.length || new Set(options).size !== options.length) throw new Error('ANSWER_CHOICES');
    return {
      names: members.map(field => field.id),
      labels: members.map(field => '設問' + field.section + (field.id.startsWith('s') ? '' : ' ' + field.id)),
      options, language:optionLanguage(question,id),
      keys:members.map(field => {
        const answer = settings.answers?.[field.id];
        const key = answer === undefined ? kana.indexOf(field.key) : options.indexOf(answer);
        if (key < 0) throw new Error('ANSWER_REF');
        return key;
      }),
    };
  });
  return answerBody(sourceBlocks(question,index,settings).flatMap(page => page.blocks),answerBanks,settings.explanation,settings.contexts);
}

function altBank(question: number, id: string, options: string[]) {
  const names = source[question].fields.filter(field => field.bank === id);
  return id === 's2' ? '解答群\n' + options.map((option,index) => kana[index] + ' ' + option).join('\n') :
    choiceBankText(names.map(field => field.id).join('，'),options);
}
export function spring2015Pm0913OriginalPageAlt(question: number): Record<number,string> {
  const { banks } = source[question];
  return Object.fromEntries(sourceBlocks(question,0).map(({page,blocks}) => {
    const body = blocks.map(blockText);
    const bankText = Object.entries(banks).filter(([,bank]) => bank.page === page)
      .map(([id,bank]) => ({id,text:altBank(question,id,bank.options)}));
    const before = page === 46 ? bankText.filter(bank => bank.id !== 's2') :
      page === 59 ? bankText.filter(bank => bank.id === 's2') : page === 65 ? bankText : [];
    const nextHeading = page === 46 ? '設問2' : '設問3';
    if (before.length) {
      const position = body.indexOf(nextHeading);
      if (position === -1) throw new Error('PAGE_TRANSCRIPTION');
      body.splice(position,0,...before.map(bank => bank.text));
    }
    return [page,[...body,...bankText.filter(bank => !before.includes(bank)).map(bank => bank.text)].join('\n\n')];
  }));
}

function q9(index: number): Settings {
  const { first,fifth,sixth,word,values,choices } = spring2015Pm9Model(index);
  const secondPosition = fifth.positions[1];
  return {
    choices, answers:values,
    prose: text => text.replace('pos[1]の値は9，引数str[9]', 'pos[1]の値は' + secondPosition + '，引数str[' + secondPosition + ']')
      .replace('平文“IPA”','平文“' + word + '”'),
    explanation:'αの最初の対象文字“' + first.first.character + '”は行' + values.b + '、列' + values.a + 'にある。' +
      '最初の2文字では同字、同行、同列、その他の順に条件を判定し、2文字目は' + values.c + 'になる。' +
      'βの5回目は位置' + fifth.positions.join('と') + 'を変換した直後で，後者が' + values.d +
      '。6回目は位置' + sixth.positions.join('と') + 'である。対象外の文字は位置を進めても組へ入れない。' +
      '“' + word + '”では最初の2文字を置換し，最後の一文字は行と列の両方を逆側へ写すので“' + values.s2 + '”になる。',
  };
}

function q10(index: number): Settings {
  const {year,dateWidth,cutoff,start,filler,maxHours} = spring2015Pm10Model(index);
  const dateSentence = year === 0 ? '月，日が，それぞれ2桁で格納されている。年は月単位のファイルに対応して別に管理する。' :
    year === 2 ? '西暦年の下2桁，月2桁，日2桁がこの順に格納されている。' :
      '年，月，日が，それぞれ4桁，2桁，2桁の西暦で格納されている。';
  return {
    answers:{a:filler},
    prose: text => text.replace('年，月，日が，それぞれ4桁，2桁，2桁の西暦で格納されている。',dateSentence)
      .replace('出社時刻は6時から22時まで','出社時刻は' + start + '時から' + cutoff + '時まで')
      .replace('C社では22時以降','C社では' + cutoff + '時以降'),
    program: text => text.replace(/(LOG-DATE\s+PIC 9\()8\)/,(_, prefix: string) => prefix + dateWidth + ')'),
    explanation:'日付を集団項目へ移した後，最後の2桁だけをIDXに取り出すのでFILLERは' + filler +
      '。月の勤務は最長' + maxHours + '時間で，時間3桁・分2桁を保持する。' +
      '未登録の従業員の履歴は，配下の数値項目すべてに9999を入れる。勤務時間を分に直して累積し，DIVIDEで時間HAと分MAに戻すので，転記元は両方を含むW-TIME-ACCUMである。' +
      cutoff + '時を超えた場合には深夜開始のNIGHT-TIMEから退社までを求め，既存の深夜合計ATD-NIGHTSUMに足す。',
  };
}

function q11(index: number): Settings {
  const { input,fallback,choices } = spring2015Pm11Model(index);
  return {
    ...(index ? {choices:{s2:choices}} : {}), answers:{s2:String(fallback.length)},
    program:text => text.startsWith('public class HtmlEncoderTest')
      ? text.replace(/\.encode\("[^"\n]*"\)/,'.encode(' + JSON.stringify(input) + ')') : text,
    contexts:[spring2015PmJavaReference()],
    explanation:'aは変換なしの文字を一文字の文字列として登録するput。bで元の文字列の文字を順に取り，cでMapから登録値を取得する。' +
      '未登録の文字だけが派生クラスの単文字encodeへ進む。HTMLのdはcharをintにして10進の数値参照を作る。' +
      'JavaScriptのeは256未満を2桁の16進に分ける。設問2のHTMLの単文字encodeが呼ばれるのは，' +
      fallback.map(character => character === ' ' ? '空白' : '“' + character + '”').join('、') + 'の' + fallback.length + '回。' +
      '英数字・許可記号・名前付き実体参照はMapに登録済みである。',
  };
}

const caslPages = [69,70,71,72,73,74];
const sheetPages = [75,76,77,78,79,80];
const sheetReferencePages = [2,4,5,...sheetPages];
const ordinal = ['','初めて','2回目に','3回目に','4回目に'];
function q12(index: number): Settings {
  const {iterative,recursive,visit,stack,stored,choices} = spring2015Pm12Model(index);
  return {
    choices, answers:{s2:String(iterative),d:'B - ' + stack,e:String(stored)},
    prose: text => text.replace('FACTを使用してF(4)','FACTを使用してF(' + iterative + ')')
      .replace('FACT2を使用してF(3)','FACT2を使用してF(' + recursive + ')')
      .replace('行番号11の命令を初めて','行番号11の命令を' + ordinal[visit]),
    contexts:[spring2015PmReference('アセンブラ言語CASL IIの仕様',caslPages)],
    explanation:'aのJPLはn−1が正のときだけ分岐し，nが0または1のときはF(n)=1のまま戻る。bのSUBLで残り回数を減らす。' +
      'MULTではGR4に被乗数を複製し，cで対象のビット位置まで左に移してGR0の和へ加える。' +
      'F(' + iterative + ')を求める繰返しでGR2は2から' + iterative + 'まで進むので，RPOP直前のGR2は' + iterative + 'である。' +
      '再帰側のCALLが戻り番地を，PUSHがその時点のGR1の値をそれぞれ1語積む。PUSHの' + visit + '回目にはSPはB−' +
      stack + 'となり，その番地に入るのは' + stored + 'である。',
  };
}

const japanDate = (text: string) => {
  const [year,month,day] = text.split('-').map(Number);
  return year + '年' + month + '月' + day + '日';
};
function q13(index: number): Settings {
  const {dayOffset,exampleStart,exampleEnd,entry,itemRows} = spring2015Pm13Model(index);
  const erratumTitle = 'IPA公式訂正（問13、冊子p.63／PDF p.64）';
  const erratum = spring2015PmReference(erratumTitle,[2]);
  erratum.blocks.unshift(p(spring2015PmErratum));
  const active = itemRows.find(row => row[1] === entry);
  return {
    answers:{a:source[13].banks.a.options[dayOffset === 1 ? 3 : 4]},
    prose: text => text
      .replace('学習開始日も学習完了日も学習に要した日数に含まれる。',
        dayOffset === 1 ? '学習開始日も学習完了日も学習に要した日数に含まれる。' :
          '学習開始日の翌日から学習完了日までを学習に要した日数に含める。開始日と完了日が同じときは0日である。')
      .replace('2014年5月10日で学習完了日が2014年5月12日の場合，学習に要した日数は3日',
        japanDate(exampleStart) + 'で学習完了日が' + japanDate(exampleEnd) + 'の場合，学習に要した日数は' + (2 + dayOffset) + '日'),
    contexts:[erratum,spring2015PmReference('共通に使用される疑似言語の記述形式',[4,5]),
      spring2015PmReference('表計算ソフトの機能・用語',sheetPages)],
    explanation:'aでは完了日が空値なら空値にする。日数は完了日−開始日' + (dayOffset === 1 ? '＋1' : '') +
      'で，標準日数以下か比較する。bは現在の単元の照合位置から1を引き，先行単元の完了日を見る。' +
      '最初の単元では位置が0になり，公式訂正の条件により表引きはnullを返す。cは任意で，順次のときは先頭か直前項目の完了を示すdで判定する。' +
      'eでは開始可と項目開始日の空値を同時に確認する。項目に本日の日付を入れた後，単元が未開始ならfで同じ項目の日付を取得する。' +
      'この例の登録ID' + entry + 'は' + (active?.[3] === '可' && active[4] === null ? '開始日を設定する条件を満たす。' : '開始日を変更する条件を満たさない。'),
  };
}

type DefinitionInfo = {number: number; title: string; fieldName: string; notes: string; publicNotes: string; make(index:number):Settings; references?:number[]};
function definition(info: DefinitionInfo): AfternoonBookletDefinition {
  const {number,title,fieldName,notes,publicNotes,make,references} = info;
  const count = spring2015Pm0913CaseCounts[number];
  const allFields = source[number].fields;
  const sections = [...new Set(allFields.map(field => field.section))];
  const sourceAnswer = sections.map(section => [section,allFields.filter(field => field.section === section)] as const)
    .map(([section,fields]) => '設問' + section +
    (fields.length === 1 && fields[0].id === 's2' ? ' ' + fields[0].key :
      ' ' + fields.map(({id,key}) => id + '=' + key).join('，'))).join('／');
  return { source:'2015h27h-fe-pm-' + number, title, fields:[field(fieldName,0,count-1)], reference:[0],version:'3.7.0',
    publicNotes,notes,sourceAnswer,...(references ? {fixedReferenceAssetIds:references.map(spring2015PmPageAssetId)} : {}),
    build(values) {const index = selectCase(values,count);return build(number,index,make(index));} };
}

export const legacy2015SpringPm9Definition = definition({number:9,title:'旧制度・午後：Cによる換字式暗号',
  fieldName:'平文と置換経路の条件番号',make:q9,
  publicNotes:'換字表とプログラムの形式を保ち，平文・トレース結果と選択肢を変更します。',
  notes:'印刷p41〜45／物理p42〜46。65字・5×13、2文字と末尾、非対象字とα/βの位置を保持。原例と7条件で全候補を独立置換とC11で確認する。'});
export const legacy2015SpringPm10Definition = definition({number:10,title:'旧制度・午後：COBOLによる従業員の勤務管理',
  fieldName:'日付レコードと深夜集計の条件番号',make:q10,
  publicNotes:'勤務管理の入出力・集団項目・計算を保ち，日付欄と深夜の時刻を変更します。',
  notes:'印刷p46〜50／物理p47〜51。勤務履歴31日、24:00、9999、欠日、順と索引の入出力を保持。日抽出FILLERの幅と深夜境界を条件に応じて変える。'});
export const legacy2015SpringPm11Definition = definition({number:11,title:'旧制度・午後：Javaによる文字列のサニタイズ',
  fieldName:'サニタイズする文字列の条件番号',make:q11,
  publicNotes:'HTMLとJavaScriptでの変換・コードの形式を保ち，追跡する入力を変更します。',
  notes:'印刷p51〜55／物理p52〜56。原の4プログラム、二コンテキスト、文字集合、null、2バイトを保持。付属API物理p67〜68を転載せず，Java SE 8の事実を独自に説明。Java8の検算はLocale.ROOT。'});
export const legacy2015SpringPm12Definition = definition({number:12,title:'旧制度・午後：CASL IIによる階乗とスタック',
  fieldName:'階乗の入力とPUSH観測の条件番号',make:q12,references:caslPages,
  publicNotes:'階乗・シフト乗算・再帰の構造を保ち，入力と観測するPUSHを変更します。',
  notes:'印刷p56〜59／物理p57〜60。0/1基底、16ビットとレジスタ保存、観測位置・戻り番地を保持。物理p71はJIS原表と本文を除いたCASL命令表のみ。'});
export const legacy2015SpringPm13Definition = definition({number:13,title:'旧制度・午後：表計算による学習進捗管理',
  fieldName:'学習日数の数え方と進捗例の条件番号',make:q13,references:sheetReferencePages,
  publicNotes:'ワークシート・マクロの配置を保ち，日数の数え方と進捗例を変更します。公式の表引きの訂正を反映します。',
  notes:'印刷p60〜65／物理p61〜66、物理p2の正誤表。学習可否、空値、項目・単元参照とマクロの流れを保持。生成では日数の端点条件、表示日付・判定・進捗・O2登録を相関更新する。'});
