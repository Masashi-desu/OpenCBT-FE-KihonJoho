import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validScope } from './booklet-scope.mjs';
export function bookletManifestEntries(inventory) {
    const files = {};
    for (const row of inventory) {
        if (!validScope(row.scope) || files[`tests/booklets/${row.scope}/random-bindings.test.ts`])
            throw Error('CI_MANIFEST unique valid scope required');
        const prefix = `tests/booklets/${row.scope}/`, scope = row.scope;
        files[prefix + 'random-bindings.test.ts'] = { count: row.caseNames.length, scopes: [scope], names: row.caseNames, coverage: { sourceIds: row.originalIds, smallIds: row.smallTemplateIds, largeIds: row.largeTemplateIds, notApplicable: row.notApplicableKinds }, diagnostics: Object.values(row.requiredDiagnostics).flat() };
        files[prefix + 'bookmarks.test.ts'] = { count: 4, scopes: [scope], names: [scope + ': annual and generated entries bookmark the same source for every included question', scope + ': bookmark previews identify every source without choices, figure labels or answers', scope + ': all bookmarked sources generate consecutive fresh practice runs without changing saved content', `bookmark paths ${scope}: every registered series retains repeats, answers and resumed history`] };
        files[prefix + 'open-ended-sessions.test.ts'] = { count: 2, scopes: [scope], names: [scope + ': all bookmarked series append to one session and aggregate every answer without replacing saved content', `endless paths ${scope}: every series retains answers and saved instances across resume`] };
    }
    return files;
}
/** Authoring aid only. The new manifest must still be reviewed and exercised;
 * metadata enumeration does not prove that issuance or the tests succeeded. */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const [input, output = 'scripts/ci/public-test-manifest.json'] = process.argv.slice(2);
    if (!input)
        throw Error('Usage: node scripts/ci/booklet-manifest.mjs <observed-work-inventory.json> [manifest.json]');
    const manifest = JSON.parse(fs.readFileSync(output, 'utf8')), entries = bookletManifestEntries(JSON.parse(fs.readFileSync(input, 'utf8')));
    for (const key of Object.keys(manifest.files))
        if (/^tests\/booklets\/[^/]+\/(?:random-bindings|bookmarks|open-ended-sessions)\.test\.ts$/.test(key))
            delete manifest.files[key];
    Object.assign(manifest.files, entries);
    manifest.files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
    fs.writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`${Object.keys(entries).length} authored wrapper entries; execution approval remains required`);
}
