import {strings} from '../src/core/generators/definition';
import {autumnAnswers} from '../src/core/generators/legacy-2017-autumn-pm1-4-preparation';
import {legacy2017AutumnPm1Definition as definition} from '../src/core/generators/legacy-2017-autumn-pm1';
import {legacy2017AutumnPm1Source,legacy2017AutumnPm1TimelineProfile} from '../src/core/generators/legacy-2017-autumn-pm1-source';
import {autumn2017PreparedRecords,bindAutumn2017PreparedBody,type Autumn2017PreparedInput,type Autumn2017PreparedSpec} from './import-legacy-2017-autumn-pm1-4';
const s=legacy2017AutumnPm1Source();
export const legacy2017AutumnPm1Spec:Autumn2017PreparedSpec={number:1,pages:[6,7,8],definition,profiles:[legacy2017AutumnPm1TimelineProfile],topics:['SSH','サーバ認証','公開鍵認証'],keywords:['Secure Shell','セッション鍵','中間者攻撃','共通鍵暗号方式','パスワード'],choicePages:[...Array(5).fill(7),...Array(13).fill(8)],original:autumnAnswers(Object.entries(s.groups).map(([id,items])=>({id,choices:strings(items)})),[{id:'part-a',label:'設問1 a',group:'keys',correct:3},{id:'part-b',label:'設問1 b',group:'keys',correct:1},{id:'part-q2',label:'設問2',group:'attack',correct:4},{id:'part-q3',label:'設問3',group:'cipher',correct:0},{id:'part-q4',label:'設問4',group:'password',correct:0}])};
export const legacy2017AutumnPm1Records=(input:Autumn2017PreparedInput)=>autumn2017PreparedRecords(legacy2017AutumnPm1Spec,input);
export const bindLegacy2017AutumnPm1Body=(base:Parameters<typeof bindAutumn2017PreparedBody>[0],body:Parameters<typeof bindAutumn2017PreparedBody>[1])=>bindAutumn2017PreparedBody(base,body,legacy2017AutumnPm1Spec);
