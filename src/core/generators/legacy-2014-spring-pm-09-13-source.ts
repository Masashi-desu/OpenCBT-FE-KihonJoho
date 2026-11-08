import { code, p, table, type GeneratedBody } from './definition';
import { heading } from './legacy-2016-autumn-pm-09-13-support';

type Panel = { type: 'panel'; profile: string; caption: string };
type BankMarker = { type: 'bank'; id: string };
export type SourcePart = GeneratedBody['prompt'][number] | Panel | BankMarker;
export type SourcePage = { page: number; parts: SourcePart[] };
export const page = (physical: number, ...parts: SourcePart[]): SourcePage => ({ page: physical, parts });
export const panel = (profile: string, caption: string): Panel => ({ type: 'panel', profile, caption });
export const bank = (id: string): BankMarker => ({ type: 'bank', id });
export const ask = '［　］に入れる正しい答えを，解答群の中から選べ。';
export { code, heading, p, table };
