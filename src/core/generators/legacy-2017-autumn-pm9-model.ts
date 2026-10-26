/** S2-02 private preparation. No registry/schema/App admission is implied. */
export const legacy2017AutumnPm9Texts = [
  "No! Madam, I'm Adam Graham. This is my gym.",
  "X! Madam, I'm Adam Graham. This is my gym.",
  "No! Madam, I'm Adam Thomas. This is my gym.",
  "No! Madam, I'm Adam Abraham. This is my gym.",
] as const;
export function legacy2017AutumnPm9Input(values: number[]) {
  if (values.length !== 1 || !Number.isInteger(values[0]) || values[0] < 0 || values[0] >= legacy2017AutumnPm9Texts.length) throw Error('PARAMETER_CONSTRAINT');
  return values[0];
}
const alnum = (s: string) => /^[A-Za-z0-9]$/.test(s);
/** Pointer-oriented implementation, independently checked by substring enumeration. */
export function legacy2017AutumnPm9Trace(text: string, longest: boolean) {
  if (!/^[\x20-\x7e]*$/.test(text)) throw Error('ASCII_INPUT');
  const calls: {start: number; count: number; found: number | null}[] = [];
  const find = (start: number, ch: string, count: number) => {
    const indexes = Array.from({length: count}, (_, j) => start + j);
    if (longest) indexes.reverse();
    const found = indexes.find(k => text[k].toLowerCase() === ch.toLowerCase()) ?? null;
    calls.push({start, count, found});
    return found;
  };
  for (let i = 0; i < text.length; i++) {
    if (!alnum(text[i])) continue;
    let hit = find(i + 1, text[i], text.length - i - 1);
    while (hit !== null) {
      let l = i, r = hit;
      while (l < r) {
        while (!alnum(text[l])) l++;
        while (!alnum(text[r])) r--;
        if (text[l].toLowerCase() !== text[r].toLowerCase()) break;
        l++; r--;
      }
      if (l >= r) return {output: text.slice(i, hit + 1), start: i, end: hit, calls};
      hit = longest ? find(i + 1, text[i], hit - i - 1) : find(hit + 1, text[i], text.length - hit - 1);
    }
  }
  return {output: '', start: -1, end: -1, calls};
}
export const legacy2017AutumnPm9Profiles = ['legacy-2017-autumn-pm9-examples', 'legacy-2017-autumn-pm9-program', 'legacy-2017-autumn-pm9-changes', 'legacy-2017-autumn-pm9-bank', 'legacy-2017-autumn-pm9-input'] as const;
export function legacy2017AutumnPm9Model(values: number[]) {
  const v = legacy2017AutumnPm9Input(values), text = legacy2017AutumnPm9Texts[v], trace = legacy2017AutumnPm9Trace(text, true);
  const tail = trace.calls.filter(c => c.start === trace.start + 1);
  if (tail.length !== 4 || trace.output !== "Madam, I'm Adam") throw Error('SOURCE_FORMAT');
  const f = [2, 3, 4, 5, 6, 7], g = [trace.output.length - 2, tail[3].count, tail[2].count, tail[1].count, tail[0].count];
  if (new Set(g).size !== 5 || !f.includes(trace.calls.length)) throw Error('CHOICE_CONSTRAINT');
  return {v, text, trace, f, g};
}
export const legacy2017AutumnPm9Abc = [
  ['i', 'ith - &text[0]', 'ith - &text[0] + 1', 'hit - ith', 'hit - ith + 1'],
  ['l == r', 'l != r', 'chars[l] == chars[r]', 'chars[l] != chars[r]', 'tolower(chars[l]) == tolower(chars[r])', 'tolower(chars[l]) != tolower(chars[r])'],
  ['ch == str[i]', 'ch != str[i]', 'tolower(ch) == tolower(str[i])', 'tolower(ch) != tolower(str[i])', '(ch == tolower(str[i])) || (tolower(ch) == str[i])', '(ch == tolower(str[i])) && (tolower(ch) == str[i])'],
  ['textlen - psize', 'textlen - i - psize', 'textlen - i + psize', 'psize + 2', 'psize - 2'],
  ['i = count; i > 0', 'i = count; i >= 0', 'i = count - 1; i > 0', 'i = count - 1; i >= 0'],
] as const;
export function legacy2017AutumnPm9Figure(profile: string, values: number[]) {
  const m = legacy2017AutumnPm9Model([values[0]]);
  const index = legacy2017AutumnPm9Profiles.indexOf(profile as typeof legacy2017AutumnPm9Profiles[number]);
  if (index < 0) throw Error('SOURCE_FORMAT');
  const group = values[1];
  if (index === 3 && (!Number.isInteger(group) || group < 0 || group > 6 || values.length !== 2) || index !== 3 && values.length !== 1) throw Error('PARAMETER_CONSTRAINT');
  const bank = index === 3 ? group < 5 ? [...legacy2017AutumnPm9Abc[group]] : (group === 5 ? m.f : m.g).map(String) : undefined;
  const caption = ['表1 本問のプログラムが表示する回文の例', 'プログラム', '表2 プログラムの変更内容', `${'abcdefg'[group]}に関する解答群`, '設問3の引数文字列'][index];
  return {model: m, bank, caption, alt: bank ? `${caption}。${bank.map((s, i) => `${'アイウエオカ'[i]} ${s}`).join('。')}` : index === 4 ? `空白を␣で示す入力：${m.text.replaceAll(' ', '␣')}` : `${caption}。原の位置に空欄a〜e、全55行と変更表6項目を保持。`};
}
