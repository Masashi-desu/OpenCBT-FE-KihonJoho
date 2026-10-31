import domains from "./legacy-morning-figure-domains.json";
import { DataError } from "./errors";

export const legacyMorningFigureProfiles = Object.keys(domains);
export function isLegacyMorningFigure(profile: string): profile is keyof typeof domains {
  return Object.hasOwn(domains, profile);
}
export function legacyMorningFigureAlt(profile: string, values: number[]): string {
  const entry = isLegacyMorningFigure(profile) && domains[profile].find(row =>
    row.values.length === values.length && row.values.every((n, i) => n === values[i]));
  if (!entry) throw new DataError("FIGURE_PROFILE", "旧午前の登録図の入力と一致しません");
  return entry.alt;
}
