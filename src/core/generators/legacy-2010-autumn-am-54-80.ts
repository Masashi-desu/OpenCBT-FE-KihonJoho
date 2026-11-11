import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { DataError } from '../errors';
import { field, figure, p, strings, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { abcChoiceFigures, abcCurves, dispatchEdges, dispatchFigure, dispatchNames, dispatchTargets, scatterChoiceFigures, scatterPlots } from './legacy-2010-autumn-am-54-80-figures';
import { autumn2010Am5480Knowledge as knowledge } from './legacy-2010-autumn-am-54-80-knowledge';
import { autumn2010Am5480Source as source } from './legacy-2010-autumn-am-54-80-source';

function draw(definition: BookletFigureDefinition, index: number, caption: string) {
  return figure(definition.profile, [index], caption, definition.alt([index]));
}

function uniqueMatch(matches: readonly boolean[]) {
  const answer = matches.indexOf(true);
  if (answer < 0 || answer !== matches.lastIndexOf(true))
    throw new DataError('ANSWER_REF', '2010年度秋期旧午前の正答を一意に確定できません');
  return answer;
}

function abcAnalysis(index: number): GeneratedBody {
  const contexts = ['',
    '工具を商品別に集計したところ，売上が少数の上位アイテムに集中していた。',
    '書籍の売上を商品別に集計したところ，上位から中位にかけても売上が積み上がり，下位ほど1品当たりの売上が小さかった。',
    '部品を商品別に集計したところ，上位の複数のアイテムが互いに近い額を売り上げ，下位になるにつれて売上が減少していた。',
  ];
  const correctIndex = uniqueMatch(abcCurves[index].map(curve => {
    const increments = curve.slice(1).map((height, i) => height - curve[i]);
    return curve[0] === 0 && increments.every((increment, i) => increment > 0 && (!i || increment <= increments[i - 1]));
  }));
  const prompt = index === 0 ? source[75].prompt
    : contexts[index] + '売上高を商品アイテム別にABC分析したグラフはどれか。ここで，縦軸は累積売上高，横軸は商品アイテムを示す。';
  return {
    prompt: [p(prompt)],
    choices: abcChoiceFigures.map((entry, choice) => [draw(entry, index, source[75].choices[choice])]),
    correctIndex,
    explanation: 'ABC分析の累積売上高の曲線は，売上高の大きい商品から順に加えるので，原点から上昇し，商品を追加するときの増分は順に小さくなる。'
      + '途中で売上高が下がる曲線，途中から再び急になる曲線，山形になる曲線は累積の仕方と一致しない。'
      + (index === 0 ? '原冊子の縦軸の売上高は，この累積額として読む。' : contexts[index]),
  };
}

function correlation(index: number): GeneratedBody {
  const positive = index === 1 || index === 3;
  const correctIndex = uniqueMatch(scatterPlots[index].map(points => {
    const n = points.length;
    const sumX = points.reduce((sum, [x]) => sum + x, 0);
    const sumY = points.reduce((sum, [, y]) => sum + y, 0);
    const xx = n * points.reduce((sum, [x]) => sum + x * x, 0) - sumX * sumX;
    const yy = n * points.reduce((sum, [, y]) => sum + y * y, 0) - sumY * sumY;
    const xy = n * points.reduce((sum, [x, y]) => sum + x * y, 0) - sumX * sumY;
    const coefficient = xy / Math.sqrt(xx * yy);
    return positive ? coefficient > 0.65 : coefficient < -0.65;
  }));
  const prompt = [source[77].prompt, '散布図のうち，“正の相関”を示すものはどれか。',
    '二つの観測値のうち一方が増えるほど，もう一方は減る傾向が見られた。この“負の相関”を示す散布図はどれか。',
    '観測値が平均との差で表されるとき，散布図のうち，“正の相関”を示すものはどれか。'][index];
  return {
    prompt: [p(prompt)],
    choices: scatterChoiceFigures.map((entry, choice) => [draw(entry, index, source[77].choices[choice])]),
    correctIndex,
    explanation: `点群が右${positive ? '上' : '下'}がりなら，横軸の値が大きいほど縦軸の値が${positive ? '大きく' : '小さく'}なる傾向があり，${positive ? '正' : '負'}の相関を示す。逆の傾きの点群とは相関の向きが異なる。山形や方向の定まらない点群は一方向の傾向が弱い。点群が座標のどの象限にあるかで相関の向きは決まらない。`,
  };
}

function dispatch(index: number): GeneratedBody {
  const endpoints = dispatchEdges[dispatchTargets[index]].map(endpoint => dispatchNames[endpoint]).join('と');
  const prompts = [
    source[80].prompt,
    `労働者派遣法に基づく，${endpoints}の関係（図の太線部分）はどれか。`,
    `労働者派遣法に基づく，${endpoints}の関係（図の太線部分）はどれか。`,
    `派遣元企業が雇用する労働者を，派遣先企業に派遣した。労働者派遣法に基づく，図の太線部分の関係はどれか。`,
  ];
  const choices = index === 3
    ? ['雇用関係', '労働者派遣契約関係', '請負契約関係', '指揮命令関係']
    : [...source[80].choices];
  return {
    prompt: [p(prompts[index]), draw(dispatchFigure, index, '派遣元企業・派遣先企業・労働者の関係図')],
    choices: strings(choices),
    correctIndex: choices.indexOf(['労働者派遣契約関係', '雇用関係', '指揮命令関係'][dispatchTargets[index]]),
    explanation: '派遣元企業と派遣先企業は労働者派遣契約を結ぶ。労働者は派遣元企業に雇用され，派遣先企業の指揮命令の下で業務に従事する。請負契約は仕事の完成を引き受ける契約であり，この図が表す労働者派遣の三者関係とは異なる。',
  };
}

const figures: Record<number, { notes: string; build(index: number): GeneratedBody }> = {
  75: { notes: '四つの曲線，横軸の商品アイテム，縦軸の売上高を維持する。売上分布，累積曲線の形，誤答の曲がり方を変える。', build: abcAnalysis },
  77: { notes: '四つの座標付き散布図で，正負の相関，曲線状の分布，方向の定まらない分布を比較する。点群の位置と正負の判定条件を変更する。', build: correlation },
  80: { notes: '三者を結ぶ双方向矢印のうち，着目する一辺を太くする。名称は選択肢に残し，図や代替説明は端点だけを示す。', build: dispatch },
};

export const legacy2010AutumnAm54To80Definitions: GenerationDefinition[] = Object.entries(source).map(([number, original]) => {
  const depicted = figures[Number(number)];
  const reviewed = knowledge[Number(number)];
  return {
    source: '2010h22a-fe-am-' + number,
    title: original.title,
    sourceAnswer: original.key,
    version: '3.7.0',
    fields: [field('問いの対象・判断条件', 0, 3)],
    reference: [0],
    ...(number === '78' ? { answerVariation: 'fixed' as const } : {}),
    notes: variableNotes + ' 原冊子p.' + original.page + '。' + (depicted?.notes ?? reviewed.notes),
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index > 3)
        throw new DataError('PARAMETER_CONSTRAINT', '2010年度秋期旧午前の入力が範囲外です');
      if (depicted) return depicted.build(index);
      const selected = index === 0
        ? { ...original, correctIndex: 'アイウエ'.indexOf(original.key), explanation: reviewed.explanation }
        : reviewed.variants[index - 1];
      return { prompt: [p(selected.prompt)], choices: strings([...selected.choices]),
        correctIndex: selected.correctIndex, explanation: selected.explanation };
    },
  };
});
