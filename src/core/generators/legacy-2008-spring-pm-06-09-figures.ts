import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { selectCase } from './legacy-2016-autumn-pm-09-13-support';
import { kettleEmpty, kettleHasWater, kettleOutput, surveyCases, surveyChanges, surveyDisplay,
  tokenCases, tokenExample } from './legacy-2008-spring-pm-06-09-model';

export const figureNames = ['7-record', '7-output', '7-changes', '8-state', '8-result', '9-execution'] as const;
export type FigureName = typeof figureNames[number];
export const profile = (name: FigureName) => 'legacy-2008-spring-pm-' + name;
const captions: Record<FigureName, string> = {
  '7-record': '図1　アンケート結果ファイルのレコード様式',
  '7-output': '図2　集計結果の例', '7-changes': '表　プログラムの変更内容',
  '8-state': '図1　電気ポットの状態遷移図', '8-result': '図2　メソッドmainの実行結果',
  '9-execution': '図　副プログラムTOKENの実行例',
};

export function drawingAlt(name: FigureName, index: number): string {
  switch (name) {
    case '7-record': {
      const { codes, events } = surveyCases[index];
      return '従業員番号：6けた｜イベント：' + events.map((event, i) => event + '（' + codes[i] + '）1けた').join('｜');
    }
    case '7-output': return surveyDisplay(index);
    case '7-changes': return '処置｜変更内容\n' + surveyChanges(index).map(row => row.join('｜')).join('\n');
    case '8-state': return '電源接続→休止。休止→休止：沸騰ボタン押下（' + kettleEmpty(index) +
      '）。休止→加熱中：沸騰ボタン押下（' + kettleHasWater(index) + '）。加熱中→休止：沸点に到達。';
    case '8-result': return kettleOutput(index);
    case '9-execution': {
      const { result, characters } = tokenExample(index);
      return '（文字列）\n(GR1)→' + characters.join(' ') + '\n（単語管理テーブル）\n(GR2)→' + result.join('｜') +
        '\n-1は終了マーク。\n注　文字列の先頭アドレスを' + tokenCases[index].address +
        '番地とし，数字は10進表記である。\n△は空白文字を示す。';
    }
  }
}

export const drawing = (name: FigureName, index: number) => figure(profile(name), [index], captions[name], drawingAlt(name, index));
export const legacy2008SpringPm0609Figures: readonly BookletFigureDefinition[] = figureNames.map(name => ({
  profile: profile(name), domain: [[0, 3]],
  validate: values => { selectCase(values, 4); },
  alt: values => drawingAlt(name, selectCase(values, 4)),
}));
