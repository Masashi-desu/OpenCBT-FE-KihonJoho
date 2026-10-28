import path from "node:path";
import { compactDistribution } from "./distribution-files";
const changed = compactDistribution(path.resolve("public/data"));
console.log(changed ? "Catalog records packed; IDs, revisions and content retained." : "Catalog already uses the current pack layout; unchanged.");
