export type Stocks = Readonly<Record<string,{items:number; allocated:number; reserve:number}>>;
export type Parts = Readonly<Record<string,Readonly<Record<string,number>>>>;
export type Shipment = { number:number; product:string; quantity:number };
export type Order = { number:number; component:string; quantity:number };
export function expectedOrders(stocks:Stocks, parts:Parts, shipments:readonly Shipment[], reserve:boolean) {
  const inventory=Object.fromEntries(Object.entries(stocks).map(([name,state])=>[name,{...state}]));
  const orders:Order[]=[];
  const use=(key:string,needed:number)=>{
    const available=inventory[key];
    let allocated=0;
    while(allocated<needed && available.allocated<available.items-(reserve?available.reserve:0)){
      allocated++;available.allocated++;
    }
    return needed-allocated;
  };
  for(const {number,product,quantity} of shipments) {
    const toMake=use(product,quantity);
    if(toMake===0) continue;
    for(const [component,count] of Object.entries(parts[product]).sort(([a],[b])=>a.localeCompare(b))) {
      const unfilled=use(component,toMake*count);
      if(unfilled>0) orders.push({number,component,quantity:unfilled});
    }
  }
  return {orders,inventory};
}
export function executeOrders(stocks:Stocks, parts:Parts, shipments:readonly Shipment[], choices:Readonly<Record<string,number>>, reserve:boolean) {
  const inventory=Object.fromEntries(Object.entries(stocks).map(([name,state])=>[name,{...state}]));
  const orders:Order[]=[];
  const tree=Object.entries(parts).flatMap(([s,children])=>Object.entries(children).map(([b,count])=>({s,b,count,key:s+':'+b})))
    .sort((a,b)=>a.key.localeCompare(b.key));
  const needs=(id:string,demand:number)=>{
    const state=inventory[id];
    const index=choices.d;
    const room=state.items+(reserve&&index<2?state.allocated:-state.allocated)+(reserve?(index%2===0?1:-1)*state.reserve:0);
    const usable=Math.max(0,Math.min(room,demand));
    state.allocated+=usable;
    return demand-usable;
  };
  if(choices.c===3||choices.a===2||choices.b===2||choices.b===0) return null;
  let last=-1;
  for(const {number,product,quantity} of shipments){
    let demand=choices.a===0?needs(product,quantity):quantity;
    if(demand<=0) continue;
    const low=product+':';
    if(choices.b===4) {
      if(choices.c===0) last=tree.findIndex(row=>row.key>low);
      else if(choices.c===1) last=tree.reduce((match,row,index)=>row.key<low?index:match,-1);
      else last=tree.findIndex(row=>row.key===low);
    } else if(choices.b===3) last++;
    while(last>=0&&last<tree.length&&tree[last].s===product){
      const {b,count}=tree[last++];
      const shortage=needs(b,demand*count);
      if(shortage>0) orders.push({number,component:b,quantity:shortage});
    }
  }
  return {orders,inventory};
}
export function stockFixtures(parts:Parts, stock:number, partsStock:readonly number[], quantity:number) {
  const rate=(items:number,allocated=0,reserve=0)=>({items,allocated,reserve});
  const example={S1:rate(20),S2:rate(stock),B1:rate(partsStock[0]),B2:rate(10),B3:rate(partsStock[1])};
  const repeated={S1:rate(4,1,2),S2:rate(6,2,1),B1:rate(13,5,2),B2:rate(2,2,1),B3:rate(12,1,3)};
  return [
    {stocks:example,parts,shipments:[]},
    {stocks:example,parts,shipments:[{number:1,product:'S2',quantity:stock}]},
    {stocks:example,parts,shipments:[{number:2,product:'S2',quantity}]},
    {stocks:repeated,parts,shipments:[{number:3,product:'S1',quantity:8},{number:4,product:'S2',quantity:12},
      {number:5,product:'S2',quantity:3},{number:6,product:'S1',quantity:7}]},
  ];
}

export type Book = { id:string; title:string; issue?: number };
const bookName=(book:Book)=>book.issue===undefined?'Book: '+book.title+' ('+book.id+')':
  'Magazine: '+book.title+', No.'+book.issue+' ('+book.id+')';
export type LibrarySource = {
  stock: Book[]; limit:number; users:[string,string]; loan1:string[]; loan2:string[]; returned:string;
};
export function libraryReference(source:LibrarySource, latestRestricted=false) {
  const lines:string[]=[];
  const registered=new Map(source.stock.map(book=>[book.id,book]));
  const latest=new Set(source.stock.filter(book=>book.issue!==undefined&&source.stock.every(other=>other.title!==book.title||
    other.issue===undefined||other.issue<=book.issue!)).map(book=>book.id));
  const loans: {who:string;id:string}[]=[];
  function tryCheckout(name:string,id:string){
    const book=registered.get(id)!;
    lines.push(name+' is checking out '+bookName(book));
    const error=loans.some(loan=>loan.id===id)?'unavailable':latestRestricted&&latest.has(id)?'latest issue':
      loans.filter(loan=>loan.who===name).length>=source.limit?'exceeding checkout limit':'';
    if(error) lines.push('    => failed: '+error);
    else loans.push({who:name,id});
  }
  for(const id of source.loan1) tryCheckout(source.users[0],id);
  const at=loans.findIndex(loan=>loan.id===source.returned);
  if(at>=0) loans.splice(at,1);
  lines.push(source.users[0]+' returned '+bookName(registered.get(source.returned)!));
  for(const id of source.loan2) tryCheckout(source.users[1],id);
  return lines.join('\n');
}
export function libraryMutant(source:LibrarySource, indices:Readonly<Record<string,number>>, latestRestricted=false) {
  if(indices.a!==3||[0,1,4].includes(indices.b)||indices.c!==1) return null;
  const stock=new Map(source.stock.map(book=>[book.id,book])), available=new Set(stock.keys()), out=new Map<string,string>();
  if(latestRestricted&&indices.e===1) return null;
  const latest=new Map<string,Book>();
  for(const book of stock.values()) {
    if(book.issue===undefined) continue;
    const previous=latest.get(book.title);
    if(previous&&[book.issue<previous.issue!,book.issue>previous.issue!,book.issue!==previous.issue!,book.issue===previous.issue!][indices.d]) continue;
    latest.delete(book.title);
    if(indices.e===0) latest.set(book.title,book);
  }
  const messages:string[]=[];
  const borrow=(name:string,id:string)=>{
    const book=stock.get(id)!;
    messages.push(name+' is checking out '+bookName(book));
    const error=!available.has(id)?'unavailable':latestRestricted&&latest.get(book.title)?.id===id?'latest issue':
      [...out.values()].filter(other=>other===name).length>=source.limit?'exceeding checkout limit':'';
    if(error&&indices.b===5) { messages.push('    => failed: '+error);return; }
    available.delete(id);out.set(id,name);
  };
  source.loan1.forEach(id=>borrow(source.users[0],id));
  if(out.delete(source.returned)) available.add(source.returned);
  messages.push(source.users[0]+' returned '+bookName(stock.get(source.returned)!));
  source.loan2.forEach(id=>borrow(source.users[1],id));
  return messages.join('\n');
}
