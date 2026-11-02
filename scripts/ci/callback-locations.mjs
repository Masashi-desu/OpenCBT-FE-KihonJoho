/** Node reports the declaration site of a registered callback, while argv
 * contains its booklet entry file. Keep both identities; never rewrite events. */
export function callbackDeclarations(file, names) {
    const wrapper = /^tests\/booklets\/([^/]+)\/([a-z-]+)\.test\.ts$/.exec(file);
    if (!wrapper) return null;
    if (!Array.isArray(names) || !names.length) throw Error('CI_VERIFICATION: booklet callbacks require explicit names');
    const [, scope, kind] = wrapper;
    /** @type {Record<string, string>} */
    const result = {};
    for (const name of names) {
        let declaration;
        if (kind === 'random-bindings') declaration = 'tests/helpers/generation-paths/exhaustive.ts';
        else if (kind === 'calculation-difficulty') declaration = 'tests/helpers/booklet-calculation-difficulty.ts';
        else if (kind === 'sampler-regressions') declaration = 'tests/helpers/booklet-sampler-regressions.ts';
        else if (kind === 'content-contract') declaration = 'tests/helpers/booklet-content-contracts.ts';
        else if (kind === 'answer-semantics') declaration = 'tests/helpers/current-answer-semantics.ts';
        else if (kind === 'bookmarks' && name.startsWith(`bookmark paths ${scope}: `)) declaration = 'tests/helpers/booklet-bookmark-endless-paths.ts';
        else if (kind === 'bookmarks' && name.startsWith(scope + ': ')) declaration = 'tests/helpers/booklet-bookmark-paths.ts';
        else if (kind === 'open-ended-sessions' && name.startsWith(`endless paths ${scope}: `)) declaration = 'tests/helpers/booklet-endless-practice-paths.ts';
        else if (kind === 'open-ended-sessions' && name.startsWith(scope + ': ')) declaration = 'tests/helpers/booklet-open-ended-paths.ts';
        else throw Error('CI_VERIFICATION: unknown booklet callback declaration ' + file + ': ' + name);
        if (Object.hasOwn(result, name)) throw Error('CI_VERIFICATION: duplicate declared callback');
        result[name] = declaration;
    }
    return result;
}
