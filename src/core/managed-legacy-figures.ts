import { DataError } from "./errors";
import { legacy2017Pm3FigureAlt } from "./generators/legacy-2017-pm3-data";

// This is a reviewed literal admission, not a family or data-driven renderer registry.
export const managedLegacyFigure = Object.freeze({
  profile: "legacy-2017-pm3-waste-database",
  caption: "図1 データベースの表構成とデータ格納例",
  domain: Object.freeze([Object.freeze([0, 0] as const)]),
  renderer: "legacy2017Pm3",
});
export function validateManagedLegacyValues(values: unknown): asserts values is number[] {
  // Read descriptors before values: sparse/prototype/accessor inputs must not run code.
  const descriptor = Array.isArray(values) && Object.getOwnPropertyDescriptor(values, "0");
  if (!Array.isArray(values) || Object.getPrototypeOf(values) !== Array.prototype ||
      values.length !== 1 || Reflect.ownKeys(values).length !== 2 ||
      !descriptor || !("value" in descriptor) || descriptor.value !== 0 ||
      !Number.isInteger(descriptor.value))
    throw new DataError("FIGURE_PROFILE", "登録図の入力域と一致しません");
}
export function managedLegacyFigureAlt(values: unknown) {
  validateManagedLegacyValues(values);
  return legacy2017Pm3FigureAlt();
}
export function joinManagedLegacyDomains(core: Record<string, [number, number][]>) {
  if (Object.hasOwn(core, managedLegacyFigure.profile))
    throw new Error("Duplicate managed figure profile");
  const joined = Object.fromEntries(Object.entries(core).map(([key, bounds]) =>
    [key, Object.freeze(bounds.map(pair => Object.freeze([...pair])))]));
  joined[managedLegacyFigure.profile] = managedLegacyFigure.domain;
  return Object.freeze(joined) as Readonly<Record<string, readonly (readonly [number, number])[]>>;
}
