import {field,figure,p,strings,variableNotes,type GenerationDefinition,type GeneratedBody} from './definition';
import cases from './legacy-2017-autumn-security-cases.json';
/** Annual candidates; no shared registry/schema admission. */
export const legacy2017AutumnSecurityTransportProfile='legacy-2017-database-transport';
export const legacy2017AutumnSecurityTransportAlt='クライアントとサーバの二つの外枠。クライアントの中は上にアプリケーション、下にデータベース接続プログラム、サーバの中は上にデータベース、下にデータベース接続プログラム。それぞれ上下の内枠を線で接続し、下のプログラムから共有の横線へ接続する。横線の両端は塗りつぶした四角。横線中央から、下にある「攻撃者による盗聴」の枠へ下向き破線矢印が伸びる。';
export const legacy2017AutumnSecurityDefinitions:GenerationDefinition[]=cases.map(r=>({source:`2017h29a-fe-am-${r.number}`,title:r.title,sourceAnswer:r.sourceAnswer,version:'3.2.0',fields:[field('対象・実条件',0,r.scenarios.length-1)],reference:[0],...(r.fixed?{answerVariation:'fixed' as const}:{}),notes:variableNotes+r.notes,
 build(values){if(values.length!==1||!Number.isInteger(values[0])||values[0]<0||values[0]>=r.scenarios.length)throw Error('PARAMETER_CONSTRAINT');const s=r.scenarios[values[0]],prompt:GeneratedBody['prompt']=[p(s.stem)];if(r.number===44)prompt.push(figure(legacy2017AutumnSecurityTransportProfile,[0],'データベースへの接続と盗聴位置',legacy2017AutumnSecurityTransportAlt));return{prompt,choices:strings([...s.choices]),correctIndex:s.correctIndex,explanation:s.explanation};}
}));
