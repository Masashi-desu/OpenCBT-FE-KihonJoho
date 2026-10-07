import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
export type LicenseNotice = {
  title: string;
  file: string;
  licenseId: string;
  scope: string;
  sourceUrl: string;
  checkedOn: string;
  sha256: string;
  delivery: "project" | "content" | "bundled" | "cdn";
  packageName?: string;
  version?: string;
  upstreamFiles?: string[];
  upstreamLicense?: string;
};
export const readLicenseNotices = (root = process.cwd()): LicenseNotice[] =>
  JSON.parse(
    fs.readFileSync(path.join(root, "public/notices/index.json"), "utf8"),
  );
const fail = (code: string, detail: string): never => {
  throw Error(`${code}: ${detail}`);
};
export function packageRootForModule(id: string): string | undefined {
  const clean = id.replace(/^\0/, "").split("?")[0];
  if (!clean.includes(`${path.sep}node_modules${path.sep}`)) return;
  let dir = path.dirname(clean);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    dir = path.dirname(dir);
  }
}
export function validateLicenseNotices(
  root = process.cwd(),
  packageRoots: string[] = [],
  notices = readLicenseNotices(root),
) {
  const directory = path.join(root, "public/notices"),
    ids = new Set<string>();
  for (const n of notices) {
    if (!/^[a-zA-Z0-9.-]+\.txt$/.test(n.file) || ids.has(n.file))
      fail("LICENSE_NOTICE", n.file);
    ids.add(n.file);
    for (const text of [
      n.title,
      n.licenseId,
      n.scope,
      n.sourceUrl,
      n.checkedOn,
    ])
      if (typeof text !== "string" || !text.trim())
        fail("LICENSE_METADATA", n.file);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(n.checkedOn))
      fail("LICENSE_METADATA", n.file);
    const url = new URL(n.sourceUrl);
    if (url.protocol !== "https:" || url.username || url.password)
      fail("LICENSE_URL", n.file);
    if (!["project", "content", "bundled", "cdn"].includes(n.delivery))
      fail("LICENSE_METADATA", n.file);
    const raw = fs.readFileSync(path.join(directory, n.file));
    if (
      !raw.toString().trim() ||
      createHash("sha256").update(raw).digest("hex") !== n.sha256
    )
      fail("LICENSE_HASH", n.file);
    if (
      ["bundled", "cdn"].includes(n.delivery) &&
      (!n.packageName || !n.version)
    )
      fail("LICENSE_METADATA", n.file);
    if (n.delivery === "bundled") {
      const packagePath = path.join(root, "node_modules", n.packageName!);
      validatePackageNotice(packagePath, n, raw.toString());
    }
  }
  // Also cover declared dependencies before bundling; actual chunks add runtime helpers.
  const project = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  const roots = new Set([
    ...Object.keys(project.dependencies ?? {}).map((name) =>
      path.join(root, "node_modules", name),
    ),
    ...packageRoots,
  ]);
  for (const packagePath of roots) {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(packagePath, "package.json"), "utf8"),
    );
    const matches = notices.filter(
      (n) =>
        n.delivery === "bundled" &&
        n.packageName === pkg.name &&
        n.version === pkg.version,
    );
    if (matches.length !== 1)
      fail("LICENSE_COVERAGE", `${pkg.name}@${pkg.version}`);
    validatePackageNotice(
      packagePath,
      matches[0],
      fs.readFileSync(path.join(directory, matches[0].file), "utf8"),
    );
  }
  for (const file of fs.readdirSync(directory))
    if (file.endsWith(".txt") && !ids.has(file)) fail("LICENSE_UNLISTED", file);
  if (
    fs.readFileSync(path.join(root, "LICENSE"), "utf8") !==
    fs.readFileSync(path.join(directory, "PROJECT-LICENSE.txt"), "utf8")
  )
    fail("PROJECT_LICENSE", "root license and notice differ");
  return { notices: notices.length, bundledPackages: roots.size };
}
function validatePackageNotice(
  packagePath: string,
  n: LicenseNotice,
  text: string,
) {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(packagePath, "package.json"), "utf8"),
  );
  if (
    n.packageName !== pkg.name ||
    n.version !== pkg.version ||
    n.upstreamLicense !== pkg.license ||
    !n.upstreamFiles?.length
  )
    fail("LICENSE_VERSION", n.file);
  const upstream = n
    .upstreamFiles!.map((file) => {
      if (!/^[a-zA-Z0-9._-]+$/.test(file)) fail("LICENSE_PATH", file);
      return fs.readFileSync(path.join(packagePath, file), "utf8");
    })
    .join("\n\n");
  if (upstream !== text) fail("LICENSE_TEXT", n.file);
}
