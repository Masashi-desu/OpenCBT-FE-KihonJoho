const tickets = [
  { ticket:'航空券', company:'航空会社', vehicle:'航空機', terminal:'空港', service:'便', departure:'出発', arrival:'到着',
    grades:['ファースト','エコノミー'], seats:['窓側','中間','通路側'], direct:'すべての便は直行便である。' },
  { ticket:'乗車券', company:'鉄道会社', vehicle:'車両', terminal:'駅', service:'列車', departure:'発車', arrival:'到着',
    grades:['グリーン','普通'], seats:['窓側','通路側'], direct:'扱う乗車券は，乗換えを必要としない特急列車の指定席に限る。' },
  { ticket:'乗船券', company:'船会社', vehicle:'船舶', terminal:'港', service:'航便', departure:'出港', arrival:'入港',
    grades:['特等','2等'], seats:['窓側','中央','通路側'], direct:'すべての航便は，途中で船を乗り換えることなく出港地から到着地まで運航する。' },
  { ticket:'バス乗車券', company:'バス会社', vehicle:'バス車両', terminal:'停留所', service:'運行便', departure:'出発', arrival:'到着',
    grades:['プレミアム','標準'], seats:['窓側','通路側'], direct:'すべての運行便は，予約した乗客が途中でバスを乗り換える必要がない。' },
] as const;

export function ticketAt(index: number) {
  const c = tickets[index];
  const system = c.ticket+'発券システム';
  const screen = c.ticket+'発券画面';
  const management = c.ticket+'発券管理';
  const inputs = c.departure+'日時，出発地及び到着地となる'+c.terminal+'名，'+c.service+'名，グレード，人数，席種';
  return { ...c, system, screen, management, inputs, issue:c.ticket+'を発券する。' };
}

export function ticketBanks(index: number) {
  const c = ticketAt(index);
  return [
    [c.terminal,c.company,c.vehicle,c.ticket,c.system,c.service],
    ['空席を確認する',c.ticket+'を発券する','顧客情報を登録する',c.departure+'日時を問い合わせる',c.departure+'日時を登録する','発券可否を確認する'],
    ['空席を確認する','顧客情報を登録する',c.departure+'日時を登録する','発券可否を確認する','発券可否を表示する',c.service+'の座席数を確認する'],
  ];
}
