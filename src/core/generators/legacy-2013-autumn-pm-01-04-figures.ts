import type { BookletFigureDefinition } from '../booklet-figure-extension-contract';
import { figure } from './definition';
import { baseballRows, baseballTableKeys, baseballTables, gateCases, gateChoices, vpnCases } from './legacy-2013-autumn-pm-01-04-models';

const prefix = 'legacy-2013-autumn-pm-';
export const autumn2013Pm0104Profiles = {
  option: prefix + '1-logic-choice', half: prefix + '1-half-adder',
  truth: prefix + '1-full-adder-truth', full: prefix + '1-full-adder',
  ripple: prefix + '1-ripple-adder', overflow: prefix + '1-overflow', zero: prefix + '1-zero',
  baseball: prefix + '2-baseball-table',
  network: prefix + '4-vpn-topology', exchange: prefix + '4-key-exchange', signature: prefix + '4-signature',
} as const;
const f = autumn2013Pm0104Profiles;
export type Autumn2013Pm0104Profile = typeof f[keyof typeof f];

export const fullAdderRows = [
  [0, 0, 0, 0, 0], [0, 0, 1, 0, 1], [0, 1, 0, 0, 1], [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1], [1, 0, 1, 1, 0], [1, 1, 0, 1, 0], [1, 1, 1, 1, 1],
] as const;

export const exchangeNotes = (left: string, right: string) => [
  '注記1　X，Yは正の整数とする。',
  '注記2　2^Xは，2のX乗を示す。',
  '注記3　P mod Qは，PのQによる剰余を示す。',
  '注記4　Zは，' + left + '事業所VPNルータ，' + right + '事業所VPNルータに事前に設定された素数である。',
];

export function autumn2013Pm0104Alt(profile: Autumn2013Pm0104Profile, [i, j]: number[]): string {
  switch (profile) {
    case f.option: {
      const { first, combine, last } = gateChoices[i];
      return '1ビットのXとYをそれぞれ' + (first[0] ? 'NOTに通し、' : 'そのまま') +
        combine + 'の二つの入力に接続。' + (last ? 'その出力をNOTに通してZに接続。' : 'その出力をZに接続。');
    }
    case f.half: {
      const blank = gateCases[i].halfBlank;
      return 'X，Yは二つの回路のそれぞれに入力。' +
        (blank === 'Z' ? '上は空欄の回路からZへ、下はANDからCへ。' : '上はXORからZへ、下は空欄の回路からCへ。');
    }
    case f.truth: return 'Cin｜X｜Y｜C｜Z\n' + fullAdderRows.map((row, k) => row.join('｜') + (k === 3 || k === 4 ? '（β）' : '')).join('\n');
    case f.full: return 'X，Yは左の半加算器のX，Yへ。左のZを右の半加算器のXへ，Cinを右のYへ。右のZを全加算器の出力Zへ。左右のCを空欄の回路に入力し，全加算器の出力Cを得る。';
    case f.ripple: return '左から1桁目の半加算器，2〜4桁目の全加算器。各i桁目はAi，Biを入力し，ZからSi，CからCiを出力する。Ciを次の桁のCinへ接続し，最上位の出力はS4とC4。';
    case f.overflow: return 'C3とC4が空欄cの回路へ入り，VFを出力。注1　桁あふれが生じたときVFの値は1，それ以外のときVFの値は0。';
    case f.zero: return 'S1，S2を上側の空欄dに，S3，S4を下側の空欄dに入力し，それぞれの出力をANDに接続してZFを得る。注1　S1〜S4が全て0のときZFの値は1，それ以外のときZFの値は0。';
    case f.baseball: {
      const table = baseballTableKeys[j];
      const { columns, keys } = baseballTables[table];
      return columns.map((name, k) => name + ((keys as readonly number[]).includes(k) ? '（主キー）' : '')).join('｜') +
        '\n' + baseballRows(table, i).map(row => row.join('｜')).join('\n');
    }
    case f.network: return 'M事業所のPC2台はファイアウォールを経由してVPNルータへ接続する。N事業所では営業支援システムサーバとVPNルータをファイアウォールで接続する。両VPNルータは各WANルータからインターネットを介して接続する。';
    case f.exchange: return '左はM事業所，右はN事業所のVPNルータ。左は乱数X，右は乱数Yを作り，左の鍵A＝2^X mod Z，右の鍵B＝2^Y mod Zを得る。鍵Aは左から右へ，鍵Bは右から左へ送る。左は鍵B^X mod Z，右は鍵A^Y mod ZをDH鍵とする。\n' + exchangeNotes('M','N').join('\n');
    case f.signature: {
      const { sender, receiver } = vpnCases[i];
      return sender + '事業所（送信側）でデータを共通鍵で暗号化し，データの認証用ハッシュ値から［a］で署名を作成する。暗号文と署名をインターネット経由で' +
        receiver + '事業所（受信側）に送る。受信側では暗号文を［b］で復号し，データの署名検証用ハッシュ値を計算する。署名を［c］で復号して得た認証用ハッシュ値と署名検証用ハッシュ値の一致を確認する。暗号文の表示例は***，署名はxxxxxxx，ハッシュ値は567…。';
    }
    default: throw Error('FIGURE_PROFILE');
  }
}

const domains = {
  [f.option]: [[0, 3]], [f.half]: [[0, 3]], [f.truth]: [[0, 0]], [f.full]: [[0, 0]],
  [f.ripple]: [[0, 0]], [f.overflow]: [[0, 0]], [f.zero]: [[0, 0]], [f.baseball]: [[0, 3], [0, 7]],
  [f.network]: [[0, 0]], [f.exchange]: [[0, 0]], [f.signature]: [[0, 3]],
} as const;
export const legacy2013AutumnPm0104Figures: BookletFigureDefinition[] = Object.values(f).map(profile => {
  const domain = domains[profile];
  return {
    profile, domain,
    validate(values) {
      if (values.length !== domain.length || domain.some(([min, max], k) =>
        !Number.isSafeInteger(values[k]) || values[k] < min || values[k] > max))
        throw Error('FIGURE_DOMAIN');
    },
    alt: values => autumn2013Pm0104Alt(profile, values),
  };
});

export function autumn2013Pm0104Diagram(profile: Autumn2013Pm0104Profile, input: number | number[], caption: string) {
  const def = legacy2013AutumnPm0104Figures.find(item => item.profile === profile)!;
  const values = typeof input === 'number' ? [input] : input;
  def.validate(values);
  return figure(profile, values, caption, def.alt(values));
}
