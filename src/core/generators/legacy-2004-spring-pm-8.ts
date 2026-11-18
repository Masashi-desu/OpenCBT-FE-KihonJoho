import { code, p } from './definition';
import { bank, draftQuestion } from './legacy-2004-spring-pm-06-09-support';

const conversions = [
  { small:'セ氏温度', large:'カ氏温度', details:'セルシウス温度（セ氏温度，°C）及びカ氏温度（°F）', toLarge:'CtoF', toSmall:'FtoC',
    up:'9.0 / 5.0 * input + 32.0', down:'5.0 / 9.0 * (input - 32.0)', choice:'1', sample:'68', result:'20.0' },
  { small:'センチメートル', large:'メートル', details:'距離のセンチメートル（cm）及びメートル（m）', toLarge:'CmToM', toSmall:'MToCm',
    up:'input / 100.0', down:'input * 100.0', choice:'1', sample:'2.5', result:'250.0' },
  { small:'秒', large:'分', details:'時間の秒（s）及び分（min）', toLarge:'SToMin', toSmall:'MinToS',
    up:'input / 60.0', down:'input * 60.0', choice:'2', sample:'90', result:'1.5' },
  { small:'グラム', large:'キログラム', details:'質量のグラム（g）及びキログラム（kg）', toLarge:'GToKg', toSmall:'KgToG',
    up:'input / 1000.0', down:'input * 1000.0', choice:'2', sample:'1250', result:'1.25' },
];
const interfaceProgram = `public interface Converter {
    [a]
}`;
const runnerProgram = `public class ConverterRunner {
    private [b] conv;

    public void setConverter([b] conv) {
        this.conv = conv;
    }

    public void run(String input) {
        if (conv == null) return;
        try {
            double in = Double.parseDouble(input);
            double out = conv.convert(in);
            System.out.println(out);
        } catch (NumberFormatException e) {
            System.err.println("invalid input " + input);
        }
    }
}`;
const conversionProgram=(type:string, expression:string)=>`public class ${type} [c] {
    public double convert(double input) {
        return ${expression};
    }
}`;
const testerProgram=(first:string,second:string)=>`import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

public class TestConverter {
    public static void main(String[] args) {
        // 標準入力から入力を受け取るreaderを作成する
        BufferedReader reader =
            new BufferedReader(new InputStreamReader(System.in));
        ConverterRunner runner = new ConverterRunner();
        try {
            while (true) {
                System.out.print("Type 1(${first}), 2(${second}), " +
                                 "or q(Quit): ");
                // 標準入力から1行読み込む
                String choice = reader.readLine();
                if ("1".equals(choice)) {
                    runner.setConverter(new ${first}());
                } else if ("2".equals(choice)) {
                    runner.setConverter(new ${second}());
                } else if ("q".equals(choice)) {
                    break;
                } else continue;
                System.out.print("Type input value: ");
                // 標準入力から1行読み込む
                String value = reader.readLine();
                [d]
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`;

export const q8=draftQuestion(8,'Javaのインタフェースを使って単位を変換する','二つの単位、相互変換式、テスト入力','ウアウエ',
  '二方向の単位変換を選択して実行する。単位、変換クラス、数式、入力と出力例を連動させ、インタフェースの契約、共通の型、実装宣言、利用クラス経由の呼出しを問う4欄を保つ。',index=>{
  const {small,large,details,toLarge,toSmall,up,down,choice,sample,result}=conversions[index];
  return {
    pages:[
      {page:35,blocks:[
        p('問8　次のJavaプログラムの説明及びプログラムを読んで，設問に答えよ。'),
        p('〔プログラムの説明〕'),
        p('このプログラムは，数量の単位変換を行う共通機能を提供するクラス群と，それらのテストプログラムからなる。テストプログラムでは，'+details+'の変換を行うクラスを利用する。'),
        p('（1）インタフェース Converter は，単位変換を行うクラスが実装すべきインタフェースを定義する。'),
        p('（2）クラス ConverterRunner は，単位変換クラスを利用するプログラムからアクセスするためのクラスである。'),
        p('① メソッド setConverter は，単位変換クラスのインスタンスを設定する。'),
        p('② メソッド run は，単位変換クラスのメソッド convert を呼び出す。'),
        p('（3）クラス '+toLarge+' は，'+small+'の値を，'+large+'に変換する処理を実装するクラスである。'),
        p('（4）クラス '+toSmall+' は，'+large+'の値を，'+small+'に変換する処理を実装するクラスである。'),
        p('（5）クラス TestConverter は，単位変換クラスを利用するテストプログラムである。メソッド main は，実行すべき単位変換処理（1：'+large+'→'+small+'変換，2：'+small+'→'+large+'変換，q：終了）の選択を促してから，入力された値を指定された処理に従って変換する。実行例を図に示す。'),
        code('% java TestConverter\nType 1('+toSmall+'), 2('+toLarge+'), or q(Quit): '+choice+'\nType input value: '+sample+'\n'+result,'text'),
        p('図　クラス TestConverter の実行例'),
      ]},
      {page:36,blocks:[
        p('〔プログラム1〕'),code(interfaceProgram,'java'),
        p('〔プログラム2〕'),code(runnerProgram,'java'),
        p('〔プログラム3〕'),code(conversionProgram(toLarge,up),'java'),
        p('〔プログラム4〕'),code(conversionProgram(toSmall,down),'java'),
      ]},
      {page:37,blocks:[
        p('〔プログラム5〕'),code(testerProgram(toSmall,toLarge),'java'),
        p('設問　プログラム中の［　］に入れる正しい答えを，解答群の中から選べ。'),
      ],banks:[bank('a',[
        'abstract public void convert();','public double convert(double input) { }',
        'public double convert(double input);','public double convert(String input);',
      ],'ウ','java')]},
      {page:38,blocks:[],banks:[
        bank('b',['Converter','ConverterRunner',toLarge,toSmall],'ア','java'),
        bank('c',['extends Converter','extends ConverterRunner','implements Converter','implements ConverterRunner'],'ウ','java'),
        bank('d',[
          'runner.conv.convert(Double.parseDouble(value));','runner.conv.run(value);',
          'runner.convert(Double.parseDouble(value));','runner.run(value);',
        ],'エ','java'),
      ]},
    ],
    explanation:'変換メソッドはdoubleを受け取りdoubleを返す。インタフェースに宣言だけを置き，二つの変換クラスはimplementsで同じ契約を実装する。Converter型のフィールドと引数ならどちらも受け取れる。TestConverterは公開されたrunへ入力文字列を渡し，その中で数値への変換とconvertの呼出しを行う。選択'+choice+'で'+sample+'を渡す実行例では'+result+'を出力する。',
  };
},'fixed');
