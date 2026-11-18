import { code, p } from './definition';
import { bank, draftQuestion, type Page } from './legacy-2006-spring-pm-06-09-support';

type Device = { id: string; type: 'desktop' | 'notebook'; encrypted?: boolean; patchIndices: number[] };
type PatchCase = { required: string[]; devices: Device[] };

function makeCase(ids: string[], required: string[], desktop: number[], first: number[], second: number[],
  firstEncrypted: boolean, secondEncrypted: boolean): PatchCase {
  return { required, devices: [
    { id: ids[0], type: 'desktop', patchIndices: desktop },
    { id: ids[1], type: 'notebook', encrypted: firstEncrypted, patchIndices: first },
    { id: ids[2], type: 'notebook', encrypted: secondEncrypted, patchIndices: second },
  ] };
}

const conditions = [
  makeCase(['pc001', 'pc002', 'pc003'], ['sp1-A01', 'sp1-A02', 'sp1-A03'], [1], [0, 1, 2], [0, 1, 2], false, true),
  makeCase(['pc104', 'pc105', 'pc106'], ['sp2-B03', 'sp2-B01', 'sp2-B02'], [0, 1, 2], [2], [0, 1, 2], true, false),
  makeCase(['pc207', 'pc208', 'pc209'], ['sp3-C09', 'sp3-C07', 'sp3-C08'], [0, 1], [1, 2], [0, 1, 2], true, false),
  makeCase(['pc310', 'pc311', 'pc312'], ['sp4-D02', 'sp4-D03', 'sp4-D01'], [0, 2], [2, 0], [2, 1, 0], true, true),
];

const testOptions = [
  ['installedPatches.isEmpty()', '!installedPatches.isEmpty()', 'installedPatches.contains(patch)',
    '!installedPatches.contains(patch)', 'patch == null', 'patch != null'],
  ['extends Object', 'extends PC', 'extends PCChecker', 'implements Object', 'implements PC', 'implements PCChecker'],
  ['PC()', 'PC(id)', 'super()', 'super(id)', 'this.id = id'],
  ['curPatches[j] != null', 'notApplied.isEmpty()', 'pc[i] != null', 'pc[i].installed(curPatches[j])',
    '!pc[i].installed(curPatches[j])'],
];

const includes = ['import java.util.List;', 'import java.util.ArrayList;', ''];
const pc = [...includes,
  'public abstract class PC {',
  '    private String id;',
  '    private List installedPatches = new ArrayList();',
  '    public PC(String id) { this.id = id; }',
  '    public String getID() { return id; }',
  '    public void installPatch(String patch) {',
  '        installedPatches.add(patch);',
  '    }',
  '    public boolean installed(String patch) {',
  '        return ［a］;',
  '    }',
  '    public abstract boolean requiresEncryptionTool();',
  '}',
].join('\n');
const desktop = [
  'public class DesktopPC ［b］ {',
  '    public DesktopPC(String id) { ［c］; }',
  '    public boolean requiresEncryptionTool() {',
  '        return false;',
  '    }',
  '}',
].join('\n');
const notebook = [
  'public class NotebookPC ［b］ {',
  '    private boolean hasEncryptionTool;',
  '    public NotebookPC(String id, boolean hasEncryptionTool) {',
  '        ［c］;',
  '        this.hasEncryptionTool = hasEncryptionTool;',
  '    }',
  '    public boolean requiresEncryptionTool() {',
  '        return !hasEncryptionTool;',
  '    }',
  '}',
].join('\n');

function checker({ required, devices }: PatchCase): string {
  return [...includes,
    'public class PCChecker {',
    '    public static void main(String[] args) {',
    '        // PCのパッチ情報を登録する。',
    '        PC[] pc = new PC[3];',
    ...devices.map(({id, type, encrypted}, index) =>
      '        pc[' + index + '] = new ' +
      (type === 'desktop' ? 'DesktopPC("' + id + '");' : 'NotebookPC("' + id + '", ' + encrypted + ');')),
    ...devices.flatMap(({patchIndices}, index) => patchIndices.map(patch =>
      '        pc[' + index + '].installPatch("' + required[patch] + '");')),
    '        // PCの状態を出力する。curPatches は，適用が要求されるパッチを示す。',
    '        String[] curPatches = { ' + required.map(id => '"' + id + '"').join(', ') + ' };',
    '        for (int i = 0; i < pc.length; i++) {',
    '            System.out.print(pc[i].getID() + ":");',
    '            List notApplied = new ArrayList();',
    '            for (int j = 0; j < curPatches.length; j++)',
    '                if (［d］)',
    '                    notApplied.add(curPatches[j]);',
    '            if (!notApplied.isEmpty() ||',
    '                pc[i].requiresEncryptionTool()) {',
    '                if (!notApplied.isEmpty())',
    '                    System.out.println(" requires " + notApplied);',
    '                if (pc[i].requiresEncryptionTool())',
    '                    System.out.println(" requires encryption tool");',
    '            } else',
    '                System.out.println(" secure");',
    '        }',
    '    }',
    '}',
  ].join('\n');
}

function example({ required, devices }: PatchCase): string {
  return devices.flatMap(({ id, type, encrypted, patchIndices }) => {
    const missing = required.filter((_, index) => !patchIndices.includes(index));
    const messages = [];
    if (missing.length) messages.push(' requires [' + missing.join(', ') + ']');
    if (type === 'notebook' && !encrypted) messages.push(' requires encryption tool');
    return id + ':' + (messages.length ? messages.join('\n') : ' secure');
  }).join('\n');
}

export const q8 = draftQuestion(8, 'Java：PCのパッチと暗号化ツールの適用状況',
  '端末ごとの適用済みパッチ、要求パッチの順番、ノートPCの暗号化状態', 'a=ウ b=イ c=エ d=オ',
  '4プログラムとa〜dの各解答群、PC識別子・種別・適用済みパッチ・暗号化、集合の包含判定と継承・コンストラクタを保持。三つの要求パッチと一台のデスクトップ・二台のノートを用い、パッチ不足、暗号化不足、安全判定の対応を登録データから変える。両方が必要な場合の出力制御も独立に検査する。原形式の判定や構文は固定で答えの記号は維持する。ArrayListの動作は公開APIと独立実行で確認し、API文献の文章・図・コードは転用しない。',
  (index, original) => {
    const current = conditions[index];
    const pages: Page[] = [
      {page: 32, blocks: [
        p('問8　次の Java プログラムの説明及びプログラムを読んで，設問に答えよ。'),
        p('〔プログラムの説明〕'),
        p('PC のセキュリティに関する更新プログラム（以下，パッチという）の適用状況を管理するプログラムである。'),
        p('クラス PCChecker は，PC に適用が要求されるパッチと各 PC に適用済みのパッチを管理し，その適用状況の一覧を出力する。PC のパッチ情報として次のものが登録される。'),
        p('①　PC の識別子'),
        p('②　PC の種別（デスクトップPC又はノートPC）'),
        p('③　適用済みのパッチの識別子（複数の場合は複数個）'),
        p('④　ノートPCの場合，暗号化ツールがインストールされているか否か'),
        p('PC に問題がない（secure）と判断する基準は，次のとおりである。'),
        p('デスクトップPC：適用が要求されるパッチがすべて適用されている。'),
        p('ノートPC：適用が要求されるパッチがすべて適用されている。さらに，暗号化ツールがインストールされている。'),
        p('（1）クラス PCChecker は，PC のパッチ情報を管理するために，クラス DesktopPC とクラス NotebookPC のインスタンスを用いる。'),
        p('（2）クラス PC は，デスクトップPCとノートPCに共通の処理を実現する。メソッド installPatch は，指定されたパッチを適用済みにする。メソッド installed は，指定されたパッチが適用済みのとき true，未適用のとき false を返す。メソッド requiresEncryptionTool は，暗号化ツールのインストールが必要なとき true，不必要なとき false を返す。'),
        p('（3）クラス DesktopPC は，デスクトップPCを表し，デスクトップPC独自の処理を実現する。'),
        p('（4）クラス NotebookPC は，ノートPCを表し，ノートPC独自の処理を実現する。'),
        p('（5）クラス PCChecker のメソッド main は，このプログラムの使用例である。その実行結果を，次に示す。'),
      ]},
      {page: 33, blocks: [
        code(example(current), 'text'),
        p(original ? '（6）クラス java.util.ArrayList は，オブジェクトをリストで管理する手段を提供する。次のメソッドを利用している。'
          : '（6）このプログラムでは java.util.ArrayList でオブジェクトのリストを扱う。利用するメソッドの動作を次に示す。'),
        code('public boolean add(Object obj)', 'java'),
        p(original ? 'オブジェクト obj をリストに追加し，true を返す。'
          : 'obj をリストの末尾へ加える。戻り値は true。'),
        code('public boolean contains(Object obj)', 'java'),
        p(original ? 'オブジェクト obj がリストに含まれる場合に true，含まれない場合に false を返す。'
          : 'リストに obj と等しい要素があるかを真偽値で返す。'),
        code('public boolean isEmpty()', 'java'),
        p(original ? 'リストが空の場合に true，空でない場合に false を返す。'
          : '要素数が0である場合だけ true。'),
        p('〔プログラム1〕'), code(pc, 'java'), p('〔プログラム2〕'), code(desktop, 'java'),
      ]},
      {page: 34, blocks: [
        p('〔プログラム3〕'), code(notebook, 'java'), p('〔プログラム4〕'), code(checker(current), 'java'),
      ]},
      {page: 35, blocks: [p('設問　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。')],
        banks: [...'abcd'].map((letter, bankIndex) => bank(letter, testOptions[bankIndex], 'ウイエオ'[bankIndex], 'java'))},
    ];
    return { pages, explanation: 'PC（Personal Computer）は個人用コンピュータ。installed は指定パッチが適用済みリストに含まれるかを contains で調べる。DesktopPC と NotebookPC は abstract クラス PC を extends し，共通の識別子を親クラスの super(id) に渡す。現在の要求パッチを登録順に調べ，installed が false のときだけ未適用リストへ加える。ノートPCは未適用パッチと暗号化ツールの不足を個別に出力する。この条件では各端末について次の表示となる。\n' + example(current) };
  }, 'fixed');
