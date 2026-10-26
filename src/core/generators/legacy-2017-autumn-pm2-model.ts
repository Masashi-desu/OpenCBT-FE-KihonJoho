import {autumnParameter} from './legacy-2017-autumn-pm1-4-preparation';
const cases=[{initial:100,increase:30,decrease:50,free:1,first:1},{initial:120,increase:40,decrease:60,free:0,first:1},{initial:200,increase:50,decrease:80,free:1,first:2},{initial:160,increase:20,decrease:40,free:0,first:2}] as const;
export function legacy2017AutumnPm2Model(values:number[]){const variant=autumnParameter(values,3),c=cases[variant],other=3-c.first;
 const release=(resource:number)=>`y${resource}の解放`,acquire=(resource:number)=>`y${resource}の確保`;
 return{variant,...c,busy:1-c.free,numberChoices:[c.initial-c.decrease,c.initial+c.increase-c.decrease,c.initial,c.initial+c.increase],pIndex:c.free===1?2:0,vIndex:c.free===1?3:2,
 firstSequence:[acquire(c.first),acquire(other),release(other),release(c.first)].join('，'),
 deadlockChoices:[
  [acquire(c.first),release(c.first),acquire(other),release(other)],
  [acquire(c.first),acquire(other),release(c.first),release(other)],
  [acquire(c.first),acquire(other),release(other),release(c.first)],
  [acquire(other),acquire(c.first),release(c.first),release(other)],
  [acquire(other),release(other),acquire(c.first),release(c.first)],
 ].map(row=>row.join('，'))};
}
