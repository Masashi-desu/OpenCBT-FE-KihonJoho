import { code, p } from './definition';
import { bank, changeTableFigure, page, springLanguageFigure, springLanguageQuestion } from './legacy-2006-spring-pm-10-13-support';

type Term = readonly [word: string, translation: string];
type Trie = { letter: string; children: Trie[]; translation?: string };

const dictionaries: readonly { terms: readonly Term[]; view: string; starts: readonly [string, string] }[] = [
  { terms: [['man', '男，人間'], ['main', '主な'], ['mail', '郵便物'], ['mailer', '電子メールソフト'], ['name', '名前']], view: 'mail', starts: ['m', 'n'] },
  { terms: [['car', '自動車'], ['care', '世話'], ['case', '事例'], ['cases', '事例の複数形'], ['tone', '音色']], view: 'case', starts: ['c', 't'] },
  { terms: [['tea', '茶'], ['team', 'チーム'], ['tear', '涙'], ['term', '用語'], ['toast', 'トースト']], view: 'team', starts: ['t', 'to'] },
  { terms: [['be', 'である'], ['bee', 'ハチ'], ['bend', '曲げる'], ['bent', '曲がった'], ['seed', '種']], view: 'bent', starts: ['b', 's'] },
];

function tree(terms: readonly Term[]): Trie[] {
  const roots: Trie[] = [];
  for (const [word, translation] of terms) {
    let siblings = roots;
    for (const [position, letter] of [...word].entries()) {
      let node = siblings.find(sibling => sibling.letter === letter);
      if (!node) {
        node = { letter, children: [] };
        siblings.push(node);
      }
      if (position === word.length - 1) node.translation = translation;
      siblings = node.children;
    }
  }
  return roots;
}

function continueWord(roots: readonly Trie[], start: string) {
  let siblings = roots;
  let node: Trie | undefined;
  let input = '';
  for (const letter of start) {
    node = siblings.find(item => item.letter === letter);
    if (!node) throw Error('登録語の接頭辞を指定してください');
    input += letter;
    while (node.translation === undefined && node.children.length === 1) {
      node = node.children[0];
      input += node.letter;
    }
    siblings = node.children;
  }
  return input;
}

function readTree(siblings: readonly Trie[], prefix = ''): string[] {
  return siblings.flatMap((node, i) => {
    const path = prefix + node.letter;
    return [path + '：follow ' + (node.children[0] ? prefix + node.letter + node.children[0].letter : 'NULL') +
      '、other ' + (siblings[i + 1] ? prefix + siblings[i + 1].letter : 'NULL') +
      '、trans ' + (node.translation ?? 'NULL'), ...readTree(node.children, path)];
  });
}

export const dictionaryFigure = springLanguageFigure(10, 'dictionary', '図1 英単語の登録例', index => {
  const { terms } = dictionaries[index];
  const roots = tree(terms);
  return { roots, alt: 'p_rootは「' + roots[0].letter + '」の節を指す。LETTERの左上がc、右上がother、左下がfollow、右下がtrans。NULLはポインタの行き先なし。\n' +
    readTree(roots).join('\n') };
});

export const dictionaryView = springLanguageFigure(10, 'display', '図2 ユーザインタフェースの例', index => {
  const { terms, view } = dictionaries[index];
  const translation = terms.find(([word]) => word === view)![1];
  return { view, translation, alt: '訳語表示領域は「' + translation + '」、検索語入力領域は「' + view + '」。' };
});

export const autocompleteFigure = springLanguageFigure(10, 'autocomplete', '図3 補完例', index => {
  const { terms, starts } = dictionaries[index];
  const roots = tree(terms);
  const rows = starts.map(start => [start, continueWord(roots, start)] as const);
  return { rows, alt: rows.map(([start, completed]) => start + ' → ' + completed).join('\n') };
});

export const autocompleteChanges = changeTableFigure(10, () => [
  ['αの部分に追加', `while((p->trans == NULL) && ([設問2])){
    p = p->follow;
    appendToField(p->c);
}`],
]);

const selection = '次の問10から問13までの4問については，この中から1問を選択し，答案用紙の選択欄の（選）をマークして解答してください。なお，2問以上選択した場合には，はじめの1問について採点します。';

const program = `typedef struct letter {
    char c;                 /* 英単語を構成する文字 */
    struct letter *follow;  /* この文字に続く文字へのポインタ */
    struct letter *other;   /* この文字に代わる別の文字へのポインタ */
    char *trans;             /* 訳語の文字列へのポインタ */
} LETTER;

void displayArea(char *);
void clearField();
void appendToField(char);
char inputChar();

LETTER *p_root;

void searchWord(){
    LETTER *p = p_root;
    char c;
    clearField();            /* 検索語入力領域のクリア */
    displayArea("");         /* 訳語表示領域のクリア */
    while(c = inputChar()){  /* 1文字入力 */
        displayArea("");
        appendToField(c);    /* 検索語入力領域に入力文字を追加 */
        /* 終端又は文字のいずれかと一致するまで検索 */
        while(([a]) && (p->c != c)){
            p = [b];
        }
        /* 文字と一致しなかった（入力文字列で始まる英単語がない） */
        if([c]){
            displayArea("単語が見つかりません");
            return;
        }
α       /* 入力文字列と一致する英単語がある */
        if(p->trans != NULL){
            displayArea(p->trans);
        }
        p = [d];
    }
}`;

const conditions = ['p != NULL', 'p == NULL', 'p->follow != NULL', 'p->follow == NULL',
  'p->other != NULL', 'p->other == NULL', 'p->trans != NULL', 'p->trans == NULL'];
const steps = ['p->follow', 'p->follow->other', 'p->other', 'p->other->follow'];
const completion = ['p->follow != NULL', 'p->follow == NULL', 'p->follow->other != NULL', 'p->follow->other == NULL',
  'p->other != NULL', 'p->other == NULL'];

export const q10 = springLanguageQuestion(10, '木構造の英単語検索と入力補完', '辞書の分岐と補完する接頭辞', 'abcd2', 'アウイアエ',
  '英単語と訳語、代替候補・終端の位置、補完を始める接頭辞を本文・図で同時に変える。4条件の根・分岐・訳語末端を検査する。構造体・補完の短絡評価・二つの選択肢群の役割、元の空欄は保持し、判断規則が同じため式の正答位置は固定する。', (index, original) => {
    const { terms, starts } = dictionaries[index];
    const [, first] = autocompleteFigure.panel([index]).rows[0];
    const [, second] = autocompleteFigure.panel([index]).rows[1];
    const continued = ([start, completed]: readonly [string, string]) => completed === start
      ? '最初に“' + start + '”と入力したときは，検索語入力領域が“' + start + '”のままである。'
      : '“' + start + '”を入力したときは，“' + completed.slice(start.length) + '”を補完して検索語入力領域に追加表示する。';
    return {
      pages: [
        page(39, [
          ...(original ? [p(selection)] : []),
          p('問10　次のCプログラムの説明及びプログラムを読んで，設問1，2に答えよ。'),
          p('〔プログラムの説明〕\n入力された英単語を検索し，訳語を表示するプログラムである。'),
          p('（1）データは木構造で登録されている。英単語を構成するそれぞれの文字を構造体LETTERで表現する。メンバcには英小文字の文字符号を，followにはその文字に続く文字を示すLETTERへのポインタを，otherにはその文字に代わる文字を示すLETTERへのポインタを格納する。transには，p_rootが指す根から順にたどってできる英単語の訳語へのポインタを格納する。follow，other，transには該当するものがなければ空ポインタ定数（NULL）が格納される。'),
          p('例えば，五つの英単語' + terms.map(([word]) => '“' + word + '”').join('，') + 'が登録されている場合の構造は図1のとおりである。'),
          dictionaryFigure.block(index),
        ]),
        page(40, [
          p('（2）ユーザインタフェースは，図2に示すように，入力された英単語を表示する検索語入力領域と訳語を表示する訳語表示領域からなる。検索語入力領域に表示されている文字列を入力文字列と呼ぶ。'),
          dictionaryView.block(index),
          p('（3）入力文字列で始まる単語の候補がなくなった場合は，検索語入力の途中でも訳語表示領域に“単語が見つかりません”を表示し，検索を終了する。'),
          p('（4）ユーザインタフェースに関する次の関数が用意されている。'),
          code(`void displayArea(char *s)
  訳語表示領域をクリアした後，文字列sを表示する。
void clearField()
  検索語入力領域をクリアする。
void appendToField(char c)
  検索語入力領域に文字cを追加表示する。
char inputChar()
  キーボードから1文字を読む。英小文字ならその文字符号，それ以外なら0を返す。`, 'c'),
        ]),
        page(41, [p('〔プログラム〕'), code(program, 'c')]),
        page(42, [
          p('設問1　プログラム中の［a］〜［d］に入れる正しい答えを，解答群の中から選べ。'),
          p('設問2　入力補完機能を追加することにした。図1の登録例で，図3に示すように，' +
            (original ? '初めに“m”を入力した場合は，一意に続く“a”を補完して検索語入力領域に追加表示する。初めに“n”を入力した場合は“ame”を追加表示する。'
              : continued([starts[0], first]) + continued([starts[1], second])) +
            '関数searchWordの修正を次の表に示す。表中の空欄に入れる正しい答えを，解答群の中から選べ。'),
          autocompleteFigure.block(index),
          autocompleteChanges.block(index),
        ], [
          bank(1, 'ac', conditions, 'アイ', 'c'),
          bank(1, 'bd', steps, 'ウア', 'c'),
        ], 1),
        // The final bank is printed below the change table on physical p42.
        page(42, [], [{ ...bank(2, '2', completion, 'エ', 'c'), ownLabel: '設問2 解答群' }]),
      ],
      explanation: '探索では現在の候補pがNULLでない間だけp->cを評価し，文字が異なればotherに沿って同じ深さの別候補へ進む。pがNULLなら候補が尽きたので終了する。一致した節では訳語を表示し，次の入力に備えてfollowへ進む。補完では訳語がまだなく，followの先に代替候補otherがないときだけ1文字進む。辞書内の接頭辞で訳語がない節には少なくとも一つの続きがある。図3では“' + starts[0] + '”から“' + first + '”，“' + starts[1] + '”から“' + second + '”となる。',
    };
  }, { answerVariation: 'fixed' });
