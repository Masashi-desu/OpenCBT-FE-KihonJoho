import {Fragment} from 'react';
import {legacy2017AutumnPm9Figure as inspect} from '../core/generators/legacy-2017-autumn-pm9-model';
import {legacy2017AutumnPm9Program as program, legacy2017AutumnPm9Changes as changes} from '../core/generators/legacy-2017-autumn-pm9';
function Inline({text}: {text: string}) {
  return <>{text.split(/(\[[abcde]\])/).map((s, i) => /^\[[abcde]\]$/.test(s) ? <span key={i} className="legacy-autumn-pm9-blank" data-pm9-blank={s[1]}>{s[1]}</span> : <Fragment key={i}>{s}</Fragment>)}</>;
}
export function Legacy2017AutumnPm9Figure({profile, values}: {profile: string; values: number[]}) {
  const f = inspect(profile, values);
  return <div className="legacy-autumn-pm9-figure" role="group" aria-label={f.caption} data-legacy-autumn-pm9-profile={profile}>
    {profile.endsWith('-examples') && <><p className="legacy-autumn-pm9-caption">{f.caption}</p><table><thead><tr><th>No.</th><th>文字列</th><th>表示する回文</th></tr></thead><tbody>{[['abc0cbe', 'bc0cb'], ['ABc0CbE', 'Bc0Cb'], ['AB!c0 CbE', 'B!c0 Cb'], ['abc0cb1bc0cbe', 'bc0cb']].map((r, i) => <tr key={i}><td>{i + 1}</td>{r.map((s, j) => <td key={j}><code>{s}</code></td>)}</tr>)}</tbody></table></>}
    {profile.endsWith('-program') && <><p>〔プログラム〕</p><p>（行番号）</p><div className="legacy-autumn-pm9-program">{program.split('\n').map((line, i) => <div className="legacy-autumn-pm9-line" data-pm9-line={i + 1} key={i}><span className="legacy-autumn-pm9-number">{i + 1}</span><code><Inline text={line}/></code></div>)}</div></>}
    {profile.endsWith('-changes') && <><p className="legacy-autumn-pm9-caption">{f.caption}</p><table><thead><tr><th>処理</th><th>変更内容</th></tr></thead><tbody>{changes.map(([location, text]) => <tr key={location}><td>{location}</td><td><pre><Inline text={text}/></pre></td></tr>)}</tbody></table></>}
    {f.bank && <><p>{f.caption}</p><div className="legacy-autumn-pm9-bank">{f.bank.map((s, i) => <div key={i} data-pm9-option={i}><span>{'アイウエオカ'[i]}</span><code>{s}</code></div>)}</div></>}
    {profile.endsWith('-input') && <div className="legacy-autumn-pm9-input"><code>{f.model.text.replaceAll(' ', '␣')}</code></div>}
  </div>;
}
