import path from "node:path";
import { compactDistribution } from "./distribution-files";
const changed = compactDistribution(path.resolve("public/data"), process.argv.includes("--compact") ? 0 : 500);
console.log(changed ? "Catalog records packed; IDs, revisions and content retained." : "Catalog already fits the file limits; unchanged.");
