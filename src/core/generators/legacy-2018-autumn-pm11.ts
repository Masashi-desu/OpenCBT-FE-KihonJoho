/** The omitted ReplacementTableParser is not fabricated as official code. */
import type{GenerationDefinition,GeneratedBody}from'./definition';import{autumn2018Tuple}from'./legacy-2018-autumn-pm-input';import{p,code,selectedLanguageNotice,languageAnswers,languageDrawing,materialContexts,type LanguageFigure}from'./legacy-2018-autumn-language-common';
export const autumn2018Pm11Profiles=['legacy-2018-autumn-pm11-example','legacy-2018-autumn-pm11-program','legacy-2018-autumn-pm11-bank']as const;
export const autumn2018Pm11Materials=[{id:'erratum',title:'問11 APIの正誤表（原物理p2，文字を保持して時計回り90度の可読表示）',pages:[2]},{id:'api',title:'問11 Java API説明（原物理p75〜77）',pages:[75,76,77]}];
export function autumn2018Pm11Input(values:number[]){
 const v=autumn2018Tuple(values,[[0,7]]);
 const itemRows=[['メモリ；5,000円','HDD；9,000円'],['メモリ；5,000円'],['メモリ；5,000円','','HDD；9,000円'],[''],['メモリ；5,000円','HDD；9,000円'],['メモリ；5,000円','HDD；9,000円','ケーブル；1,000円'],['','HDD；9,000円'],['メモリ；5,000円']][v[0]];
 const table:{[key:string]:string[]}={'名前':['情報太郎'],'明細':itemRows,'合計':[['14,000','5,000','14,000','0','14,000','15,000','9,000','5,000'][v[0]]]};
 const templates=[`<名前>様\n\n<名前>様のお買上げ明細は次のとおりです。\n\n<明細>\n------------------------------\n合計；<合計>円`,'<名前>様\n<明細>\n合計；<合計>円','<名前><明細>\n合計；<合計>円','<名前>様\n<明細><合計>','<名前>様\n<名前>様のお買上げ明細は次のとおりです。\n<明細>\n合計；<合計>円','<名前>様\n<明細>\n合計；<合計>円','<名前><名前>\n<明細>\n合計；<合計>円','<名前>様\n<明細>\n合計；<合計>円\n<明細>'];
 return{v,template:templates[v[0]],table};
}

export type AutumnTemplateFragment={kind:'literal'|'replacement';text:string};
export function autumn2018Pm11Parse(template:string,escaped=false){const fragments:AutumnTemplateFragment[]=[],put=(kind:'literal'|'replacement',text:string)=>fragments.push({kind,text});let buffer='';for(let at=0;at<template.length;at++){const c=template[at];if(escaped&&c==='\\'){if(++at===template.length)throw Error('DANGLING_ESCAPE');buffer+=template[at];}else if(c==='<'){put('literal',buffer);buffer='';}else if(c==='>'){put('replacement',buffer);buffer='';}else buffer+=c;}put('literal',buffer);return fragments;}
export function autumn2018Pm11Apply(template:string,table:Record<string,string[]>,escaped=false){return autumn2018Pm11Parse(template,escaped).map(f=>{if(f.kind==='literal')return f.text;const values=table[f.text];if(!values||values.length===0)throw Error('MISSING_SOURCE_KEY_OR_EMPTY_LIST');return values.join('\n');}).join('');}
export const autumn2018Pm11Programs=[`import java.util.List;
import java.util.Map;
public interface Fragment {
    String replace(Map<String, List<String>> table);
}`,`import java.util.List;
import java.util.Map;
public class Replacer ［a］ Fragment {
    final String key;
    Replacer(CharSequence cs) { key = cs.toString(); }
    public String replace(Map<String, List<String>> table) {
        return String.join("\\n", table.get(key));
    }
}`,`import java.util.List;
import java.util.Map;
public class PassThrough ［a］ Fragment {
    final String str;
    PassThrough(CharSequence cs) { str = cs.toString(); }
    public String replace(Map<String, List<String>> table) {
        return str;
    }
}`,`import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
public class TemplateParser {
    static public Template parse(Reader reader) throws IOException {
        StringBuilder buf = new StringBuilder();
        List<Fragment> fragmentList = new ArrayList<>();
        int c;
        while ((c = reader.read()) >= 0) {
            switch (c) {
            case '<':
                fragmentList.add(new ［b］);
                buf = new StringBuilder();
                break;
            case '>':
                fragmentList.add(new ［c］);
                buf = new StringBuilder();
                break;
            // ← α（設問2の2行の挿入位置）
            default:
                buf.append((char) c);
            }
        }
        fragmentList.add(new PassThrough(buf));
        return ［d］;
    }
}`,`import java.util.List;
import java.util.Map;
public class Template {
    List<Fragment> fragmentList;
    Template(List<Fragment> fragmentList) {
        this.fragmentList = fragmentList;
    }
    public String apply(Map<String, List<String>> table) {
        StringBuilder sb = new StringBuilder();
        for (Fragment fragment : fragmentList) {
            sb.append(fragment.replace(［e］));
        }
        return sb.toString();
    }
}`,`import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.List;
import java.util.Map;
public class TemplateTester {
    public static void main(String... args) throws IOException {
        try (
            Reader tReader = new FileReader("template.txt");
            Reader rReader = new FileReader("replacementTable.txt")
        ) {
            Template template = TemplateParser.parse(tReader);
            Map<String, List<String>> table =
                ReplacementTableParser.parse(rReader);
            System.out.print(template.apply(table));
        }
    }
}`];
export const autumn2018Pm11Banks=[['extends','interface','implements','throws'],['Fragment(buf)','Fragment(c)','PassThrough(buf)','PassThrough(c)','Replacer(buf)','Replacer(c)'],['fragmentList','new Template(buf)','new Template(fragmentList)','new Template(reader)'],['fragment','fragmentList','sb','table'],['break','buf.append((char) c)','buf.append((char) c); break','buf.append((char) reader.read())','buf.append((char) reader.read()); break']];
export function autumn2018Pm11Figure(profile:string,values:number[]):LanguageFigure{const z=autumn2018Tuple(values,[[0,7],[0,5]]),v=z.slice(0,1),g=z[1],x=autumn2018Pm11Input(v);if(profile===autumn2018Pm11Profiles[0]&&g===0)return{kind:'example',caption:'図1 ひな形に置換表を適用して出力文書を得る例',alt:'ひな形，置換表，適用矢印，出力文書の三つの欄。',template:x.template,replacement:Object.entries(x.table).map(([k,a])=>JSON.stringify(k)+':['+a.map(s=>JSON.stringify(s)).join(', ')+']').join(',\n'),output:autumn2018Pm11Apply(x.template,x.table)};if(profile===autumn2018Pm11Profiles[1])return{kind:'program',caption:`〔プログラム${g+1}〕`,alt:`問11 プログラム${g+1}。原の全宣言，空欄，α挿入位置を保持。`,text:autumn2018Pm11Programs[g]};if(profile===autumn2018Pm11Profiles[2]&&g<5)return{kind:'bank',caption:['aに関する解答群','b，cに関する解答群','dに関する解答群','eに関する解答群','fに関する解答群'][g],alt:'原5bank/23固有択を保持。b/cは同じ6択を参照。',columns:['記号','内容'],rows:autumn2018Pm11Banks[g].map((s,i)=>['アイウエオカ'[i],s])};throw Error('PARAMETER_CONSTRAINT');}
const draw=(kind:string,v:number[],g=0)=>{const m=autumn2018Pm11Figure(`legacy-2018-autumn-pm11-${kind}`,[...v,g]);return languageDrawing(11,kind,v,g,m.caption,m.alt);};
export const legacy2018AutumnPm11Definition:GenerationDefinition={source:'2018h30a-fe-pm-11',title:'書式を表すひな形への置換表の適用による文書の作成（Java）',version:'3.2.0',answerVariation:'fixed',fields:[{name:'ひな形の境界と置換列の条件',minimum:0,maximum:7}],reference:[0],sourceAnswer:'ウ・ウ・オ・ウ・エ・オ',notes:'原本文6頁/6プログラム/α位置/6欄23択29refs（b/c同6ID）と0個以上のfragment，キー必在，置換リスト1個以上，改行/順序，escapeの奇数個目直後1文字と必ず次文字ありを保持。図1の8条件は境界，隣接/反復置換，空literal，原の名前/明細/合計の全例示キーを保持し，リスト1〜3件/空文字列という実処理条件。一般算法正答は固定。元にないcaller引数をofficial referenceとしない。省略されたReplacementTableParser実装は創作しない。API17と原p2正誤表は独立資料とし今回のroot限定素材判断へ束縛し，原API本文を黙って訂正しない。既Java8実5952/全29択probeと生成条件全件を独立検算。',build(values):GeneratedBody{const x=autumn2018Pm11Input(values),v=x.v;return{prompt:[
 p("選択した問題は，選択欄の選をマークしてください。マークがない場合は，採点されません。"),
 p("問11 次のJavaプログラムの説明及びプログラムを読んで，設問1，2に答えよ。"),
 p("（Javaプログラムで使用するAPIの説明は，この冊子の末尾を参照してください。）"),
 p("〔プログラムの説明〕"),
 p("図1のように，文書の書式を表すひな形に置換表を適用して，出力文書を得るプログラムである。"),
 draw('example',v,0),
 p("(1) ひな形は，0個以上の置換指示と，0個以上のそのまま出力される置換指示以外の部分が連なるテキストである。"),
 p("置換指示は，キー名称を<と>で囲んだものである。ひな形中で，<と>は，置換指示としてキー名称を囲う用途にだけ使用できる。"),
 p("(2) 置換表は，キー名称とこれに対応する文字列の並びとの組みを一つ以上記述したテキストであり，それぞれの組みは，次の形式で記述する。"),
 code("\"キー名称\":[文字列の並び]","text"),
 p("組みを二つ以上記述するときは，コンマで区切る。"),
 p("文字列の並びには，置換に用いる文字列（以下，置換用文字列という）を二重引用符で囲んだものを一つ以上記述する。置換用文字列を二つ以上記述するときは，コンマで区切る。例えば，置換用文字列が二つである場合は，次の形式で記述する。"),
 code("\"キー名称\":[\"置換用文字列\",\"置換用文字列\"]","text"),
 p("(3) ひな形に置換表を適用すると，ひな形中の<キー名称>は，次の規則に従って置換される。"),
 p("① 置換表のキー名称に対応する文字列の並びに含まれる置換用文字列が一つだけのときは，その置換用文字列で置換される。"),
 p("② 置換表のキー名称に対応する文字列の並びに含まれる置換用文字列が二つ以上あるときは，各置換用文字列の間に改行を挟んだ上で，並び順に連結してできる文字列で置換される。"),
 p("図1の例では，置換表中のキー名称 名前に対応する文字列の並びに含まれる置換用文字列は 情報太郎 だけなので，ひな形中の<名前>は，情報太郎 に置換される。"),
 p(`置換表中のキー名称 明細に対応する文字列の並びには，置換用文字列として ${x.table['明細'].map(s=>s===''?'空文字列':s).join(' と ')} ${x.table['明細'].length>1?'とが':'が'}含まれるので，ひな形中の<明細>は，${x.table['明細'].join('↵')||'空文字列'}（↵は改行）に置換される。`),
 p("このプログラムでは，ひな形を，0個以上の置換指示と0個以上の置換指示以外の部分が連なる文字ストリームとして扱う。個々の置換指示及び個々の置換指示以外の部分をフラグメントと呼ぶ。"),
 p("インタフェースFragmentは，フラグメントを表す。"),
 p("クラスReplacerは，置換指示を表す。"),
 p("クラスPassThroughは，置換指示以外の部分を表す。"),
 p("クラスTemplateParserのメソッドparseは，ひな形を表す文字ストリームからフラグメントのリストを構築し，クラスTemplateのインスタンスを生成して返す。ひな形に誤りはないものとする。"),
 p("クラスTemplateは，ひな形をフラグメントのリストとして保持する。メソッドapplyは，ひな形に置換表を適用して，出力文書を文字列で返す。置換表には，このひな形に含まれるキー名称とそれに対応する文字列の並びが含まれているものとする。"),
 p("クラスReplacementTableParserのメソッドparseは，置換表を表す文字ストリームから，キー名称とそれに対応する文字列の並びのマップを構築して，返す。置換表に誤りはないものとする（プログラムは省略）。"),
 p("クラスTemplateTesterはテスト用のプログラムである。テキストファイルtemplate.txtが図1のひな形と同じ内容であって，テキストファイルreplacementTable.txtが図1の置換表と同じ内容であるとき，実行結果は図1の出力文書と同じになる。"),
 draw('program',v,0),
 draw('program',v,1),
 draw('program',v,2),
 draw('program',v,3),
 draw('program',v,4),
 draw('program',v,5),
 p("設問1 プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。"),
 draw('bank',v,0),
 draw('bank',v,1),
 draw('bank',v,2),
 draw('bank',v,3),
 p("設問2 次の記述中の［　］に入れる正しい答えを，解答群の中から選べ。"),
 p("<と>は，置換指示としてキー名称を囲う用途以外では，ひな形中で使用することができない。そこで，これらの文字を他の用途でも使用できるように，次の2行をプログラム4のクラスTemplateParserのαの位置に挿入した。これによって，\\に続く1文字（\\が複数個連続するときは奇数個目に続く1文字）は，置換指示以外の部分やキー名称の一部として扱われる。ここで，続く1文字は必ず読めるものとする。"),
 code("case '\\\\':\n    ［f］;","java"),
 draw('bank',v,4)
],contexts:materialContexts(11,autumn2018Pm11Materials),...languageAnswers(autumn2018Pm11Banks,[{id:'a',bank:0,label:'設問1 a',answer:2},{id:'b',bank:1,label:'設問1 b',answer:2},{id:'c',bank:1,label:'設問1 c',answer:4},{id:'d',bank:2,label:'設問1 d',answer:2},{id:'e',bank:3,label:'設問1 e',answer:3},{id:'f',bank:4,label:'設問2 f',answer:4}]),explanation:'aはインタフェースを実装するimplements。開き括弧でそれまでのliteralをPassThrough(buf)として保存し，閉じ括弧でキーをReplacer(buf)として保存する。parseはnew Template(fragmentList)を返し，各fragment.replaceへ同じtableを渡す。escapeではreaderから次の1文字を読み，bufへ追加してbreakする。breakがないとdefaultで元のバックスラッシュまで追加される。空のliteralも許され，複数置換用文字列は順序と間の改行を保つ。図1の出力は実際のひな形と全置換列から求める。APIの原正誤表は別資料に保持する。独自解説。'};}};
