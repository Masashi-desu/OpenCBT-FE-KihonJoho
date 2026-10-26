import {autumnParameter} from './legacy-2017-autumn-pm1-4-preparation';
/** Count and money thresholds change together with SQL, period and age cohort. */
export function legacy2017AutumnPm3Model(values:number[]){
 const variant=autumnParameter(values,2),[year,minCount,minAmount]=[[2016,5,10000],[2018,4,8000],[2020,6,12000]][variant],ageYear=year+1;
 const date=`AND 販売表.販売日 >= '${year}-01-01' AND 販売表.販売日 <= '${year}-12-31'`,kind="AND 商品表.分類 = 'コーヒー'";
 const aChoices=[`${date}\n${kind}\nAND 商品表.単価 * 販売明細表.個数 >= ${minAmount}\nGROUP BY 販売表.会員番号\nHAVING COUNT(*) >= ${minCount}`,`${date}\n${kind}\nGROUP BY 販売表.会員番号\nHAVING SUM(商品表.単価 * 販売明細表.個数) >= ${minAmount}\n  AND COUNT(*) >= ${minCount}`,`${date}\nGROUP BY 販売表.会員番号\nHAVING 商品表.分類 = 'コーヒー'\n  AND SUM(商品表.単価 * 販売明細表.個数) >= ${minAmount}\n  AND COUNT(*) >= ${minCount}`,`GROUP BY 販売表.会員番号\nHAVING 販売表.販売日 >= '${year}-01-01' AND 販売表.販売日 <= '${year}-12-31'\n  AND 商品表.分類 = 'コーヒー'\n  AND SUM(販売表.販売額) >= ${minAmount}\n  AND COUNT(*) >= ${minCount}`];
 const firstSql=`SELECT 会員表.氏名，会員表.郵便番号，会員表.住所\n  FROM 会員表 WHERE 会員表.会員番号 IN\n    (SELECT 販売表.会員番号\n       FROM 販売表，販売明細表，商品表\n       WHERE 販売表.伝票番号 = 販売明細表.伝票番号 AND\n             商品表.商品番号 = 販売明細表.商品番号 ［a］)`;
 const aggregateSql=`SELECT 年齢，分類，［b1］ AS 合計販売額\n  FROM\n    (SELECT ${ageYear} - 会員表.生年 AS 年齢，商品表.分類，［b2］\n       FROM 会員表，販売表，販売明細表，商品表\n       WHERE 会員表.会員番号 = 販売表.会員番号 AND\n             販売表.伝票番号 = 販売明細表.伝票番号 AND\n             販売明細表.商品番号 = 商品表.商品番号 AND\n             販売表.販売日 >= '${ageYear}-01-01' AND\n             販売表.販売日 <= '${ageYear}-06-30'\n    ) FACTTB\n  GROUP BY ［b3］\n  ORDER BY 年齢 ASC，合計販売額 DESC`;
 return{variant,year,ageYear,minCount,minAmount,aChoices,firstSql:firstSql.replaceAll('，',','),aggregateSql:aggregateSql.replaceAll('，',',')};
}
