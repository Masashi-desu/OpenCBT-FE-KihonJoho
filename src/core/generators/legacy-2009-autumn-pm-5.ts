import { p } from './definition';
import { bankAt, common, indexOfCase, pairedAnswers, readPrompt, type Page } from './legacy-2009-autumn-pm-05-08-shared';
import { ticketAt, ticketBanks } from './legacy-2009-autumn-pm-5-model';
import { drawing } from './legacy-2009-autumn-pm-05-08-figures';

export function ticketPages(index: number): readonly Page[] {
  const c = ticketAt(index);
  return [[21, [
    p('問5　'+c.system+'に関する次の記述を読んで，設問1～3に答えよ。'),
    p('オブジェクト指向分析／設計を用いて，'+c.system+'の設計を行う。'+c.ticket+'発券業務の分析から，図1の分析クラス図を作成した。'),
    p('〔'+c.ticket+'発券業務の内容〕'),
    p('(1) '+c.company+'の'+c.ticket+'販売担当者（以下，販売担当者という）は，顧客が窓口で申し込んだ内容を基に，'+c.system+'で空席確認及び発券を行う。'),
    p('(2) 顧客が窓口で申し込む内容は，'+c.departure+'日時，出発地及び到着地となる'+c.terminal+'名，'+c.service+
      '名，グレード（'+c.grades.join('，')+'），人数，席種（'+c.seats.join('，')+'）である。'+c.direct),
    p('(3) 販売担当者は(2)で受け付けた申込み内容を確認し，その情報をシステムに入力する。システムはその'+c.service+'の空席状態を確認する。空席があれば(4)に進み，なければ，顧客は申込み内容を変更して再度申込みをする。'),
    p('(4) 販売担当者は顧客が希望しているグレードと席種の座席を確保し，顧客情報を登録して'+c.ticket+'を発券する。'),
  ]],[22,[drawing('5-analysis',index)]],[23, [
    p('設問1　図1中の［a］～［c］に入れる適切なクラス名を，解答群の中から選べ。'),
    bankAt(0,'解答群'),
    p('図1の分析クラス図に，実装を考慮して次の二つのクラスを追加した後，操作を洗い出すために，図2の販売担当者とシステムのオブジェクトとの関係のシーケンス図を作成した。'),
    p('〔追加したクラス〕'),
    p('① '+c.screen+'：データを入力する画面クラス'),
    p('② '+c.management+'：'+c.ticket+'を発券するための管理クラス'),
  ]],[24,[drawing('5-sequence',index)]],[25, [
    p('設問2　図2中の［d］，［e］に入れる正しい答えを，解答群の中から選べ。ただし，図2中の［c］には設問1の正しい答えが入っているものとする。'),
    bankAt(1,'d，eに関する解答群'),
    p('設問3　'+c.screen+'クラスと'+c.management+'クラスを図3に示す。図3の操作中の［f］，［g］に入れる正しい答えを，解答群の中から選べ。ただし，図3中の［d］には設問2の正しい答えが入っているものとする。'),
    drawing('5-operations',index),
    bankAt(2,'f，gに関する解答群'),
  ]]];
}

export const ticketDefinition = common(5,'発券業務のクラス図とシーケンス図','交通サービスの対象・発着拠点・券種と座席区分',
  '公式p21–25。分析クラスの属性、多重度、発着の役割、列挙型、継承、シーケンスの送り手・受け手、生成と返り値、操作一覧、f/gの別欄かつ順不同を保持する。',
  '発券業務の流れを保ち，交通サービス，発着拠点，グレードと席種を変更しました。', values => {
    const index = indexOfCase(values), c = ticketAt(index);
    return {
      prompt: readPrompt(ticketPages(index)),
      ...pairedAnswers(ticketBanks(index),[0,0,0,1,1,2,2],[0,3,5,5,0,1,4],true),
      explanation: [
        'a：名称・所在地をもつ発着拠点は'+c.terminal+'である。'+c.service+'ごとに出発'+c.terminal+'と到着'+c.terminal+'をそれぞれ一つ指定する。',
        'b：'+c.ticket+'には発券日時があり，顧客・販売担当者・'+c.service+'・座席と結び付く。c：'+c.service+'は'+c.service+'名と発着日時をもち，複数の座席に対応する。',
        'd：画面は入力した申込み条件で発券可否を管理へ問い合わせる。e：管理は'+c.service+'に空席の確認を求める。得られた空席状態から可否を判断して画面に返す。',
        'f，g（順不同）：画面の操作は画面を受け手とするメッセージから取り出す。画面自身が発券可否を表示し，販売担当者から顧客情報の登録も受け付ける。',
      ].join('\n'),
    };
  });
