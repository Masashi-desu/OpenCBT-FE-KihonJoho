type BookExample=readonly [name:string,firstNumber:string,lastNumber:string,otherName:string,otherNumber:string,thirdName:string,thirdNumber:string];
const bookExamples:readonly BookExample[]=[
  ['Scott','0809876543','031234567#001','Bill','0909988776','James','0909090909'],
  ['Aki','0701234567','042231000#08','Ren','0803112345','Rei','0902223344'],
  ['Maya','0607771010','031230900#05','Mako','0908877112','Ken','0501234020'],
  ['Nora','0807700110','063245700#12','Noel','0755422110','Hana','0901112200'],
];
export function bookResult(index:number) {
  const [name,,lastNumber]=bookExamples[index];
  return name+'\n  '+lastNumber;
}
export function bookTester(index:number) {
  const [name,firstNumber,lastNumber,otherName,otherNumber,thirdName,thirdNumber]=bookExamples[index];
  return `public class PhoneBookTester {
   public static void main(String[] args) {
      PhoneBook pb = new PhoneBook();
      pb.add("${name}", "${firstNumber}");
      pb.add("${otherName}", "${otherNumber}");
      pb.add("${thirdName}", "${thirdNumber}");
      pb.add("${name}", "${lastNumber}");
      pb.remove("${name}", "${firstNumber}");
      System.out.println("${name}");
      for (String num : pb.get("${name}")) {
         System.out.println("  " + num);
      }
   }
}`;
}
export const bookOptions=[
  '電話帳に登録されている電話番号のうち，引数 var で与えられた文字列で始まるすべての電話番号の集合を返す。',
  '電話帳に登録されている名前のうち，引数 var で与えられた文字列で始まるすべての名前の集合を返す。',
  '引数 var で与えられた文字列で始まる電話番号に対応付けられたすべての名前の集合を返す。',
  '引数 var で与えられた文字列で始まる名前に対応付けられたすべての電話番号の集合を返す。',
];
const methodBodies=[
  ['      if (key.startsWith(var)) {','         ret.add(key);','      }'],
  ['      for (String num : book.get(key)) {','         if (num.startsWith(var)) {','            ret.add(num);','         }','      }'],
  ['      for (String num : book.get(key)) {','         if (num.startsWith(var)) {','            ret.add(key);','         }','      }'],
  ['      if (key.startsWith(var)) {','         ret.addAll(book.get(key));','      }'],
] as const;
export function bookMethod(index:number) {
  return [
    'public Set<String> methodX(String var) {',
    '   Set<String> ret = new HashSet<String>();',
    '   for (String key : book.keySet()) {',
    ...methodBodies[index],
    '   }','   return ret;','}',
  ].join('\n');
}
