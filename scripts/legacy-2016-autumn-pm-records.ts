import { afternoonBookletSourceRef, makeAfternoonBookletRecords, type AfternoonBookletRecordSource } from './legacy-afternoon-booklet-records';
import { autumn2016PmPageAssetId } from '../src/core/generators/legacy-2016-autumn-pm-materials';
export type { Stage3AfternoonRecords } from './legacy-afternoon-booklet-records';

export const AUTUMN2016_PM = '2016h28a-fe-pm';

const booklet: AfternoonBookletRecordSource = {
  collectionId: AUTUMN2016_PM,
  year: 2016,
  period: '秋期',
  officialTitle: '平成28年度 秋期 基本情報技術者試験 午後',
  questionPages: [6, 68],
  pageAssetId: autumn2016PmPageAssetId,
  area: n => n === 1 ? 'security' : n === 6 ? 'management' : n === 7 ? 'strategy' : n >= 8 ? 'algorithm' : 'technology',
  learningTag: 'legacy-2016-autumn',
};

export const autumn2016PmSourceRef = (number: number, page: number, answer = false) =>
  afternoonBookletSourceRef(booklet, number, page, answer);
export const makeAutumn2016PmRecords = (input: Parameters<typeof makeAfternoonBookletRecords>[1]) =>
  makeAfternoonBookletRecords(booklet, input);
