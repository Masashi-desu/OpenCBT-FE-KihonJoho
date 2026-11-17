import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure, p, strings, table } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { finite, original } from './legacy-2006-autumn-am-27-53-shared';

export const figureNames = ['29-process-states','39-dfd','45-test-quality'] as const;
export type FigureName = typeof figureNames[number];
export const profile = (name: FigureName) => 'legacy-2006-autumn-am-' + name;
const captions: Record<FigureName,string> = {
  '29-process-states':'プロセスの状態遷移',
  '39-dfd':'構造化分析法の DFD',
  '45-test-quality':'テスト工程品質管理図',
};
export const stateNames = ['実行可能状態','実行状態','待ち状態'];
const originalStates = [1,0,2];
export const stateCases = [
  originalStates, [0,1,2], [0,2,1], [1,2,0],
];
const labels = ['a','b','c'];
export const stateEvents = [
  '実行優先度の高いほかのプロセスに CPU 使用権が移された。',
  'CPU 使用権が与えられた。',
  '入出力動作の完了を待つ。',
  '入出力動作が完了した。',
];
export function stateArrows(index: number) {
  const states=stateCases[index];
  const named=(state: number)=>labels[states.indexOf(state)];
  return [[1,0],[0,1],[1,2],[2,0]].map(([from,to])=>[named(from),named(to)] as const);
}
export const dfdModel = [
  {steps:['□','○','二本の平行線','○','○','□'],target:'○'},
  {steps:['□','○','○','二本の平行線','○','□'],target:'二本の平行線'},
  {steps:['□','○','二本の平行線','○','□'],target:'→'},
  {steps:['□','○','○','二本の平行線','○','○','□'],target:'○'},
] as const;
export const qualityModel = [
  {at:30,left:93,errors:39,leftExpected:78,errorsExpected:27},
  {at:30,left:93,errors:21,leftExpected:81,errorsExpected:31},
  {at:31,left:63,errors:41,leftExpected:78,errorsExpected:28},
  {at:40,left:60,errors:40,leftExpected:63,errorsExpected:42},
] as const;

export function drawingAlt(name: FigureName, index: number): string {
  switch(name) {
    case '29-process-states':
      return '円 a，b，c を結ぶ有向矢印。'+stateArrows(index).map(([from,to],i)=>'①②③④'[i]+' '+from+'→'+to).join('，')+'。';
    case '39-dfd':
      return '左から右に向かう接続。'+dfdModel[index].steps.join(' → ')+'。';
    case '45-test-quality': {
      const {at,left,errors,leftExpected,errorsExpected}=qualityModel[index];
      const relative=(observed:number,expected:number)=>observed>expected?'上':observed<expected?'下':'同じ高さ';
      return '横軸は日数，左縦軸は未消化テスト項目数，右縦軸は累積誤り検出数。予測は点線，実績は現時点までの実線。現時点は横軸の約'+at+
        '%位置。未消化テスト項目数の実績の端は同時点の予測より'+relative(left,leftExpected)+'，累積誤り検出数の実績の端は同時点の予測より'+relative(errors,errorsExpected)+'。';
    }
  }
}
const draw = (name: FigureName, index: number) => figure(profile(name),[index],captions[name],drawingAlt(name,index));
export const legacy2006AutumnAm2753Figures: readonly BookletFigureDefinition[] = figureNames.map(name => ({
  profile:profile(name),domain:[[0,3]],
  validate(values){ selectCase(values,4); },
  alt:values=>drawingAlt(name,selectCase(values,4)),
}));

const states = finite(29,'a・b・cの状態と矢印の対応',
  '3状態・4要因・4個の組合せ表を保持。図のラベルと方向の対応から解くため，単に選択肢を並べ替えない。', index=>{
  const states=stateCases[index], arrows=stateArrows(index);
  return {prompt:[p(original(29).prompt),draw('29-process-states',index),p('〔状態遷移の要因〕'),
    ...stateEvents.map((event,i)=>p('①②③④'[i]+' '+event))],
    choices:original(29).choices.map(choice=>[table('プロセスの状態',['a','b','c'],[choice.split('，')])]),
    correctIndex:original(29).choices.findIndex(choice=>choice===states.map(value=>stateNames[value]).join('，')),
    explanation:'② '+arrows[1][0]+'→'+arrows[1][1]+' は CPU を受け取る遷移なので，前が実行可能状態，後が実行状態である。③ で入出力を待つ先 '+arrows[2][1]+' が待ち状態になる。'};
});
const dfd = finite(39,'DFDの接続順と着目する記号',
  '記号を読み取る4択を保持。データを処理する円，蓄積先の線，流れの矢印を評価し，原問と同じ判定の条件も接続順を変える。', index=>{
  const {target}=dfdModel[index], expected: Record<string,number> = {'○':3,'二本の平行線':1,'→':2};
  const explanation:Record<string,string> = {
    '○':'この表記の円は，入力されたデータを処理して出力するプロセスを示す。',
    '二本の平行線':'二本の平行線は，データを出し入れするデータストアを示す。',
    '→':'矢印は移動するデータと向きを表すデータフローを示す。',
  };
  return {prompt:[p(original(39).prompt.replace('○',target)),draw('39-dfd',index)],choices:strings(original(39).choices),
    correctIndex:expected[target],explanation:explanation[target]+' DFD（Data Flow Diagram，データフロー図）では，このほか四角形で外部実体を表す。'};
});
const newQualityCases = [
  original(45).choices,
  ['未消化項目が少ないので，前工程をやり直す。','テストの消化が遅い。原因を確認し，誤りが少ないことだけで品質が良いとは判断しない。','テストの消化が速く，誤りの検出も予測以上なので，そのまま続ける。','テスト消化が予測どおりなので，未解決の誤りの管理だけを行う。'],
  ['未消化項目が多いので，誤り多発箇所の調査より前にテストを中断する。','テスト消化が遅いので，まず必要な人員と環境を見直す。','テストの消化が速く，累積誤りの検出も予測を上回る。テストを継続し，消化件数に対する検出数も確認する。','テスト消化が予測どおりなので，未解決の誤りの管理だけを行う。'],
  ['テスト消化が予測より遅く累積誤りが多いので，前工程をやり直す。','テストの消化が予測より著しく遅いので，まず人員を増やす。','テストの消化が速いが累積誤りが予測より著しく多いので，直ちにテストを中断する。','どちらも予測に近く，図に大きな乖離はない。テストを継続し，未解決の誤りへの対処も追跡する。'],
];
const quality = finite(45,'テスト消化と誤り検出の実績・予測の関係',
  '左軸が未消化項目，右軸が累積検出，点線が予測，実線が実績。両曲線を読み取り，品質・進捗と対応を評価する4択を維持。読図だけで原因や修正件数は判断できない。',index=>{
  const guides=[
    '未消化テストは予測より多く，テストの消化が遅い。その消化状況にもかかわらず累積の誤り検出は予測より多い。作り込み品質の懸念を調べるため，誤りが集中する箇所と前工程の成果を確認する。図から個々の誤りの原因までは特定できない。',
    '未消化テストが予測を上回り，消化は遅い。累積誤りが予測より少ないとしても，まだ実行していないテストが多ければ検出の機会も少ない。遅れの原因を調べる。',
    '未消化項目が予測より少ないので，消化は計画より進んでいる。累積誤りも多いのでテストを続け，消化件数に対する検出数を併せて確認する。',
    '未消化項目数と累積誤り数はいずれも現時点の予測に近い。大きな乖離はないが，未解決の誤りが適切に対応されるよう追跡する。',
  ];
  return {prompt:[p(original(45).prompt+(index===3?' この図では現時点における実績と予測のわずかな差は通常の変動範囲とする。':'')),
    draw('45-test-quality',index)],choices:strings(newQualityCases[index]),correctIndex:index,explanation:guides[index]};
});
export const figureDefinitions=[states,dfd,quality];
