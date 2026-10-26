/** Source-local six Java listings and semantic numeric bindings (QS52–57). */
export function legacy2017Pm11Input(values:number[]){if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype||values.length!==1||Reflect.ownKeys(values).length!==2)throw Error('PARAMETER_CONSTRAINT');const d=Object.getOwnPropertyDescriptor(values,'0');if(!d||!('value'in d)||!Number.isSafeInteger(d.value)||Object.is(d.value,-0)||d.value<0||d.value>2)throw Error('PARAMETER_CONSTRAINT');return d.value as number;}
const cases=[{basic:[112330,104010],rates:[[1962,2610,3012],[1817,2417,2777]],thresholds:[120,300],amount10:5430,example10:2005},{basic:[101250,118050],rates:[[1820,2530,2990],[1980,2460,2810]],thresholds:[100,280],amount10:4635,example10:1755},{basic:[125040,109080],rates:[[2015,2685,3175],[1925,2545,2985]],thresholds:[140,320],amount10:5285,example10:2265}];
export function legacy2017Pm11Model(values:number[]){const v=legacy2017Pm11Input(values),x=structuredClone(cases[v]);const price=(plan:number,amount10=x.amount10)=>{let charge=x.basic[plan]/100;const pair=[[0,x.rates[plan][0]/100],[x.thresholds[0],x.rates[plan][1]/100],[x.thresholds[1],x.rates[plan][2]/100]];for(let i=0;i<pair.length;i++){if(i+1<pair.length&&amount10/10>pair[i+1][0])charge+=(pair[i+1][0]-pair[i][0])*pair[i][1];else{charge+=(amount10/10-pair[i][0])*pair[i][1];break;}}return Math.trunc(charge);};const a=price(0),b=price(1),diff=a-b;return{...x,v,price,output:diff===0?'両プランで同額':`プラン${diff<0?'A':'B'}が${Math.abs(diff)}円安い`};}
export const legacy2017Pm11Banks=[
 {title:'aに関する解答群',items:['abstract','final','private','protected','public','static'],page:55},
 {title:'bに関する解答群',items:['i','i - 1','i * 2','i / 2','i / 2 + 1','i + 1'],page:55},
 {title:'c、dに関する解答群',items:['[i + 1][0]','[i + 1][1]','[i + 1][i]','[i][0]','[i][1]','[i][i + 1]'],page:55},
 {title:'eに関する解答群',items:['extends','implements','imports','public','throws'],page:57},
 {title:'fに関する解答群',items:['((RatePlan) this)','RatePlan','super','this','TieredRateTable','TierTable'],page:57},
 {title:'gに関する解答群',items:['(1.0 - discountTiers.map(amount))','(1.0 - discountTiers.map(basicCharge))','(1.0 - discountTiers.map(price))','discountTiers.map(amount)','discountTiers.map(basicCharge)','discountTiers.map(price)'],page:57},
];
export function legacy2017Pm11Programs(values:number[]){const m=legacy2017Pm11Model(values),money=(n:number)=>(n/100).toFixed(2),args=(n:number)=>`0, ${money(m.rates[n][0])}, ${m.thresholds[0]}, ${money(m.rates[n][1])}, ${m.thresholds[1]}, ${money(m.rates[n][2])}`;return[
`[a] class TierTable {
    final double[][] pairs;

    TierTable(double... tiers) {
        if (tiers.length % 2 == 1) {
            throw new IllegalArgumentException("不正な長さ：" + tiers.length);
        }
        double[][] a = new double[tiers.length / 2][];
        for (int i = 0; i < tiers.length; i += 2) {
            a[[b]] = new double[] { tiers[i], tiers[i + 1] };
        }
        this.pairs = a;
    }

    abstract double map(double amount);
}`,
`class TieredRateTable extends TierTable {
    TieredRateTable(double... tiers) {
        super(tiers);
    }

    double map(double amount) {
        double charge = 0;
        for (int i = 0; i < pairs.length; i++) {
            if (i + 1 < pairs.length && amount > pairs[i + 1][0]) {
                charge += (pairs[c] - pairs[d]) * pairs[i][1];
            } else {
                charge += (amount - pairs[i][0]) * pairs[i][1];
                break;
            }
        }
        return charge;
    }
}`,
`class RatePlan {
    private final String name;
    private final double basicCharge;
    private final TierTable pricingTiers;

    RatePlan(String name, double basicCharge, TierTable pricingTiers) {
        this.name = name;
        this.basicCharge = basicCharge;
        this.pricingTiers = pricingTiers;
    }

    String getName() { return name; }

    int getPrice(double amount) {
        return (int) (basicCharge + pricingTiers.map(amount));
    }
}`,
`public class Main {
    public static void main(String[] args) {
        RatePlan planA = new RatePlan("プランA", ${money(m.basic[0])},
                new TieredRateTable(${args(0)}));
        RatePlan planB = new RatePlan("プランB", ${money(m.basic[1])},
                new TieredRateTable(${args(1)}));

        double amount = ${(m.amount10/10).toFixed(1)};
        int d = planA.getPrice(amount) - planB.getPrice(amount);
        if (d < 0) {
            System.out.printf("%sが%d円安い%n", planA.getName(), -d);
        } else if (d > 0) {
            System.out.printf("%sが%d円安い%n", planB.getName(), d);
        } else {
            System.out.println("両プランで同額");
        }
    }
}`,
`class DiscountTable extends TierTable {
    DiscountTable(double... tiers) {
        super(tiers);
    }

    double map(double amount) {
        for (int i = pairs.length - 1; i >= 0; i--) {
            if (amount >= pairs[i][0]) {
                return pairs[i][1];
            }
        }
        throw new IllegalArgumentException("amount = " + amount);
    }
}`,
`class DiscountPlan [e] RatePlan {
    private final TierTable discountTiers;

    DiscountPlan(String name, double basicCharge,
                 TierTable pricingTiers, TierTable discountTiers) {
        super(name, basicCharge, pricingTiers);
        this.discountTiers = discountTiers;
    }

    int getPrice(double amount) {
        int price = [f].getPrice(amount);
        return (int) (price * [g]);
    }
}`];}
export const legacy2017Pm11Profiles=['legacy-2017-pm11-tariffs','legacy-2017-pm11-output','legacy-2017-pm11-discounts','legacy-2017-pm11-program','legacy-2017-pm11-choice-group'] as const;
export function legacy2017Pm11Figure(profile:string,values:number[]){if(!legacy2017Pm11Profiles.includes(profile as typeof legacy2017Pm11Profiles[number]))throw Error('PARAMETER_CONSTRAINT');const indexed=profile.endsWith('-program')||profile.endsWith('-choice-group');let n:number|undefined,v:number;if(indexed){if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype||values.length!==2||Reflect.ownKeys(values).length!==3)throw Error('PARAMETER_CONSTRAINT');const a=Object.getOwnPropertyDescriptor(values,'0'),b=Object.getOwnPropertyDescriptor(values,'1');if(!a||!b||!('value'in a)||!('value'in b)||!Number.isSafeInteger(b.value)||Object.is(b.value,-0)||b.value<0||b.value>5)throw Error('PARAMETER_CONSTRAINT');v=legacy2017Pm11Input([a.value]);n=b.value;}else v=legacy2017Pm11Input(values);const m=legacy2017Pm11Model([v]);if(profile.endsWith('-program'))return{caption:`プログラム${n!+1}`,alt:legacy2017Pm11Programs([v])[n!],pages:[[53],[54],[54],[55],[56],[57]][n!],model:m,index:n};if(profile.endsWith('-choice-group')){const b=legacy2017Pm11Banks[n!];return{caption:b.title,alt:b.items.map((s,i)=>'アイウエオカ'[i]+' '+s).join('。'),pages:[b.page],model:m,index:n};}const i=legacy2017Pm11Profiles.indexOf(profile as typeof legacy2017Pm11Profiles[number]),caption=['表1 プランA及びプランBの料金表','図1 メソッドmainの実行結果','表2 割引プランの割引率の例'][i],alt=[`基本料金はプランA ${(m.basic[0]/100).toFixed(2)}円、B ${(m.basic[1]/100).toFixed(2)}円。${m.thresholds[0]}kWhまで、超過${m.thresholds[1]}kWhまで、超過分の料金単価（円/kWh）はそれぞれA ${m.rates[0].map(x=>(x/100).toFixed(2)).join('、')}、B ${m.rates[1].map(x=>(x/100).toFixed(2)).join('、')}。`,m.output,'電気料金5000円未満は1%、5000円以上8000円未満は3%、8000円以上は5%。'][i];return{caption,alt,pages:[[52],[53],[56]][i],model:m,index:undefined};}
