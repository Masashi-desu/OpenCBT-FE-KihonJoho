export type Pupil = { grade: number; name: string };
type FileRecord<T> = { id: string; children: T[] };
export type Roster = { old: FileRecord<Pupil>[]; entrants: FileRecord<string>[] };
const pupil = (grade: number, name: string) => ({grade, name});
export function rosterCases(finalYear: number): Roster[] {
  return [
    { old: [], entrants: [] },
    { old: [{id:'C',children:[pupil(finalYear,'C-out')]}], entrants: [] },
    { old: [], entrants: [{id:'B',children:['B-in']}] },
    {
      old: [
        {id:'A',children:[pupil(finalYear-1,'A-stay')]},
        {id:'C',children:[pupil(1,'C-stay1'),pupil(finalYear-1,'C-stay2'),pupil(finalYear,'C-out')]},
        {id:'D',children:[pupil(finalYear,'D-out1'),pupil(finalYear,'D-out2')]},
        {id:'G',children:[pupil(finalYear,'G-out')]},
        {id:'H',children:Array.from({length:5},(_,i)=>pupil(i<4?finalYear-1:finalYear,'H'+i))},
      ],
      entrants: [{id:'B',children:['B-in']},{id:'C',children:['C-in1','C-in2']},{id:'G',children:['G-in']},{id:'I',children:['I0','I1','I2','I3','I4']}],
    },
  ];
}

export function referenceRoster({old,entrants}: Roster, finalYear: number) {
  const existing = new Map(old.map(row => [row.id, row.children]));
  const incoming = new Map(entrants.map(row => [row.id, row.children]));
  const ids = [...new Set([...existing.keys(), ...incoming.keys()])].sort();
  const result = ids.map(id => ({
    id,
    children: [...(incoming.get(id) ?? []).map(name => pupil(1,name)),
      ...(existing.get(id) ?? []).filter(row => row.grade < finalYear).map(row => pupil(row.grade + 1,row.name))],
  }));
  return { roster: result.filter(row=>row.children.length), removed: result.filter(row=>!row.children.length).map(row=>row.id) };
}

export function simulateRoster({old,entrants}: Roster, finalYear: number, selected: Record<string,number>) {
  const eof = '\uffff';
  let oi=0, ei=0, prevOld: Roster['old'][number] | undefined, prevEnt: Roster['entrants'][number] | undefined, advance='B';
  let oldPointer=0, newPointer=0, entPointer=0;
  const roster: Roster['old'] = [], removed: string[] = [];
  let operations=0;
  while (prevOld?.id !== eof || prevEnt?.id !== eof) {
    if (++operations>100) return null;
    if (advance !== 'E') prevOld = old[oi++] ?? {id:eof,children:prevOld?.children??[]};
    if (advance !== 'O') prevEnt = entrants[ei++] ?? {id:eof,children:prevEnt?.children??[]};
    const oldRow=prevOld!, entRow=prevEnt!, oldEOF=oldRow.id===eof, entEOF=entRow.id===eof;
    const run=[!(oldEOF&&entEOF),!(oldEOF||entEOF),oldEOF&&entEOF,oldEOF||entEOF][selected.a];
    if (!run) {
      if (selected['2']===0) removed.push(oldRow.id);
      continue;
    }
    const contents = oldRow.children.map(pupil => ({...pupil})) as (Pupil|undefined)[];
    let record: {id:string; children:(Pupil|undefined)[]} = {id:'',children:[]};
    const addEntrants=() => {
      for (entPointer=1; entPointer<=entRow.children.length; entPointer++)
        record.children[entPointer-1]={grade:1,name:entRow.children[entPointer-1]};
    };
    const command=(index:number) => {
      switch(index) {
        case 0: {const current=contents[oldPointer-1];if(current) current.grade++;break;}
        case 1: record.id=oldRow.id;break;
        case 2: record.children[newPointer-1]=contents[entPointer-1];break;
        case 3: record.children[newPointer-1]=contents[oldPointer-1];break;
        case 4: record={id:oldRow.id,children:contents.slice()};break;
        case 5: addEntrants();break;
      }
    };
    const advanceGrades=() => {
      for(oldPointer=1;oldPointer<=5 && contents[oldPointer-1];oldPointer++) {
        if(contents[oldPointer-1]!.grade<finalYear) command(selected.d);
        else {
          contents[oldPointer-1]=undefined;
          if(selected['2']===2) removed.push(oldRow.id);
        }
      }
      if(selected['2']===3) removed.push(oldRow.id);
    };
    if(oldRow.id<entRow.id) {
      advanceGrades();
      command(selected.b);
      advance='O';
    } else if (oldRow.id === entRow.id) {
      advanceGrades();
      record.id=oldRow.id;
      addEntrants();
      oldPointer=1;
      for (newPointer=entPointer;newPointer<=5;newPointer++,oldPointer++) command(selected.c);
      advance='B';
    } else {
      record.id=entRow.id;
      addEntrants();
      advance='E';
    }
    if(record.children[0]) roster.push({id:record.id,children:record.children.filter(child=>child!==undefined)});
    else if(selected['2']===1) removed.push(oldRow.id);
  }
  return {roster,removed};
}

export const winningLines = ['000102','101112','202122','001020','011121','021222','001122','021120']
  .map(line=>line.match(/../g)!);
type Mark = 'CIRCLE' | 'CROSS';
export type Point = [number,number];
export function referenceTic(steps: (Point|null)[], symbols: string[]) {
  const marks = new Map<string,Mark>(), lines: string[]=[];
  let status='IN_PROGRESS', turn:Mark='CIRCLE', last:string|undefined;
  for (const move of steps) {
    if (status!=='IN_PROGRESS') { lines.push('Game is over.');continue; }
    if (move) {
      const square=move.join('');
      if (marks.has(square)) throw Error('fixture repeated a square');
      marks.set(square,turn);last=square;
      if (winningLines.some(line=>line.every(key=>marks.get(key)===turn))) status=turn+'_WON';
      else if(marks.size===9) status='DRAWN';
      lines.push('Turn : '+turn+' : '+status);
      turn=turn==='CIRCLE'?'CROSS':'CIRCLE';
    } else {
      if (!last || !marks.has(last)) { lines.push('undo','Game is over.'); continue; }
      turn=marks.get(last)!; marks.delete(last); lines.push('undo');
    }
    for (let y=0;y<3;y++) {
      const row=[0,1,2].map(x=>{const mark=marks.get(String(x)+y);return mark==='CIRCLE'?symbols[0]:mark==='CROSS'?symbols[1]:' ';});
      lines.push(row.join(' '));
    }
  }
  return lines;
}

export function simulateTic(steps: (Point|null)[], symbols: string[], selected: Record<string,number>) {
  const initial=['BLANK','CIRCLE','CROSS',null][selected.a], cells=Array< typeof initial >(9).fill(initial);
  const stateName = (mark:string) => mark === 'BLANK' || !mark ? ' ' : mark==='CIRCLE' ? symbols[0] : symbols[1];
  const get=(x:number,y:number)=>{
    if (Math.min(x,y)<0 || Math.max(x,y)>2) throw Error('bounds');
    return cells[x+3*y];
  };
  let turn='CIRCLE', count=0, last:Point=[0,0], status='IN_PROGRESS';
  const lines:string[]=[];
  const check=(x:number,y:number,dx:number,dy:number)=>[0,1,2].every(i=>get(x+i*dx,y+i*dy)===turn);
  try {
    for(const [i,move] of steps.entries()) {
      if(!move) {
        lines.push('undo');
        if(status!=='IN_PROGRESS' || get(...last)==='BLANK') {lines.push('Game is over.');continue;}
        turn=get(...last)!;cells[last[0]+3*last[1]]='BLANK';count--;
      } else {
        const [x,y]=move, supplied=['CIRCLE','CROSS'][[i,i%2,i&2,Math.trunc(i/2)][selected.d]];
        if(supplied===undefined) return null;
        if([count<0,count>=9,status!=='IN_PROGRESS',status==='IN_PROGRESS'][selected.b]) {lines.push('Game is over.');continue;}
        if(get(x,y)!=='BLANK' || supplied!==turn) return null;
        cells[x+3*y]=turn;last=move;count++;
        const direction=([[-1,-1],[-1,1],[1,-1],[1,1]] as Point[])[selected.c];
        if(check(x,0,0,1)||check(0,y,1,0)||check(0,0,1,1)||check(0,2,...direction)) status=turn+'_WON';
        else if(count===9) status='DRAWN';
        lines.push('Turn : '+turn+' : '+status);
        turn=turn==='CIRCLE'?'CROSS':'CIRCLE';
      }
      for(let y=0;y<3;y++) lines.push([0,1,2].map(x=>stateName(get(x,y)!)).join(' '));
    }
  } catch { return null; }
  return lines;
}
