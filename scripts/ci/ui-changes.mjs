import postcss from 'postcss';
import ts from 'typescript';
import { inertModuleSource } from './scopes.mjs';

export const ERROR_DETAIL = 'src/ui/ErrorDetails.tsx';
export const MENU_CARD = 'src/ui/MenuOptionCard.tsx';
export const MENU_SELECTION = 'src/core/menu-selection.ts';
export const MENU_SELECTION_TESTS = [
    'tests/practice/menu-selection.test.ts', 'tests/practice/mix-profile.test.ts', 'tests/content/2017-spring-pm/legacy-afternoon-selection.test.ts',
];
export const SEARCH_MATERIALS = 'src/ui/SearchQuestionMaterials.tsx';
const searchPage = 'src/ui/SearchPage.tsx';
const styles = 'src/ui/style.css';
const modules = {
    [ERROR_DETAIL]: { feature: 'error-ui', host: 'src/ui/App.tsx', specifiers: ['react', 'lucide-react'], imports: [] },
    [MENU_CARD]: { feature: 'menu-ui', host: 'src/ui/App.tsx', specifiers: ['react', 'lucide-react'], imports: [] },
    [MENU_SELECTION]: { feature: 'menu-ui', host: 'src/ui/App.tsx',
        imports: ['src/core/errors.ts', 'src/core/source-collections.ts', 'src/core/types.ts'] },
    [SEARCH_MATERIALS]: { feature: 'search-ui', host: searchPage, specifiers: ['../core/types', './Content', './MaterialViewer'],
        imports: ['src/core/types.ts', 'src/ui/Content.tsx', 'src/ui/MaterialViewer.tsx'] },
};
const selectorOwners = {
    'error-ui': /^\.error-(?:banner(?:-content|-heading)?|details(?:-panel|-tools)?)(?=$|[\s.:\[>#])/,
    'menu-ui': /^\.selection-option(?:-[a-z][a-z0-9-]*)?(?=$|[\s.:\[>#])/,
    'search-ui': /^\.search-[a-z][a-z0-9-]*(?=$|[\s.:\[>#])/,
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function outsideMenuTransition(bytes) {
    if (!bytes) return null;
    const source = ts.createSourceFile(MENU_SELECTION, bytes.toString(), ts.ScriptTarget.Latest, true);
    const transitions = source.statements.filter(s => ts.isFunctionDeclaration(s) && s.name?.text === 'patchMenuSelection');
    const body = transitions.length === 1 ? transitions[0].body : undefined;
    if (!body || source.parseDiagnostics.length) return null;
    return source.text.slice(0, body.getStart(source)) + source.text.slice(body.end);
}

function styleRegions(bytes) {
    const tree = postcss.parse(bytes.toString());
    const byFeature = Object.fromEntries(Object.keys(selectorOwners).map(id => [id, []]));
    tree.walkRules(rule => {
        const selectors = rule.selectors.map(s => s.replace(/:not\(\.[a-z][a-z0-9-]*\)/g, ''));
        if (selectors.some(s => /[+~()\\]/.test(s)) ||
            !rule.nodes.every(node => node.type === 'decl' || node.type === 'comment')) return;
        const owner = Object.keys(selectorOwners).find(id => selectors.every(s => selectorOwners[id].test(s)));
        if (!owner) return;
        const position = [rule.parent.index(rule)];
        for (let node = rule.parent; node.type !== 'root'; node = node.parent) {
            if (node.type !== 'atrule' || !['media', 'container', 'supports'].includes(node.name)) return;
            position.unshift(node.parent.index(node));
        }
        byFeature[owner].push([position, rule.toString()]);
        rule.remove();
    });
    return { shared: tree.toString(), byFeature };
}

// Introducing the read-only materials component may replace this existing JSX
// slot and add its import. All search state, handlers and other markup stay exact.
function searchMaterialsMount(before, after) {
    const anchor = 'import { QuestionFooter } from "./QuestionFooter";\n';
    const slot = [
        '<div className="search-question-material">',
        '          {question.contextRefs.map(id => {',
        '            const material = question.contexts.find(value => value.id === id)!;',
        '            return <section key={id} aria-label={material.title}><Content content={material.content} bundle={bundle} assetUrls={assets.urls} credit /></section>;',
        '          })}',
        '          <Content content={question.prompt} bundle={bundle} assetUrls={assets.urls} credit />',
        '        </div>',
    ].join('\n');
    if (before.split(anchor).length !== 2 || before.split(slot).length !== 2) return false;
    const mount = [
        '<div className="search-question-material">',
        '          <SearchQuestionMaterials question={question} bundle={bundle} assetUrls={assets.urls} />',
        '        </div>',
    ].join('\n');
    return after === before.replace(anchor, anchor + 'import { SearchQuestionMaterials } from "./SearchQuestionMaterials";\n')
        .replace(slot, mount);
}

export function uiFeaturesFor(file, readBefore, readAfter, samePublicApi) {
    if (file === 'tests/helpers/ui-browser.ts') return readAfter(file) ? ['menu-ui', 'search-ui'] : [];
    if (file !== styles && file !== searchPage && !Object.hasOwn(modules, file)) return [];
    const before = readBefore(file), after = readAfter(file);
    if (!after) return [];
    if (file === MENU_SELECTION) {
        // The collection helpers, imports and transition signature are shared contracts.
        const prior = outsideMenuTransition(before);
        return prior !== null && prior === outsideMenuTransition(after) ? ['menu-ui'] : [];
    }
    if (file === styles && before) {
        const a = styleRegions(before), b = styleRegions(after);
        return a.shared === b.shared ? Object.keys(selectorOwners).filter(id => !same(a.byFeature[id], b.byFeature[id])) : [];
    }
    if (file === searchPage)
        return before && !readBefore(SEARCH_MATERIALS) && searchMaterialsMount(before.toString(), after.toString()) &&
            inertModuleSource(SEARCH_MATERIALS, readAfter(SEARCH_MATERIALS), modules[SEARCH_MATERIALS].specifiers) ? ['search-ui'] : [];
    const owner = modules[file];
    if (!owner || !inertModuleSource(file, after, owner.specifiers)) return [];
    if (!before) {
        const oldHost = readBefore(searchPage), newHost = readAfter(searchPage);
        return file === SEARCH_MATERIALS && oldHost && newHost &&
            searchMaterialsMount(oldHost.toString(), newHost.toString()) ? [owner.feature] : [];
    }
    return inertModuleSource(file, before, owner.specifiers) && samePublicApi(before, after, file) ? [owner.feature] : [];
}

export function uiConsumerBoundary(file, before, after) {
    const host = file === styles ? 'src/main.tsx' : file === searchPage ? 'src/ui/App.tsx' : modules[file]?.host;
    if (!host) return undefined;
    const imports = modules[file]?.imports;
    const consumers = graph => Object.keys(graph).filter(consumer => graph[consumer].includes(file));
    if (!same(consumers(after), [host]) || imports && !same(after[file], imports)) return false;
    if (file === SEARCH_MATERIALS && !Object.hasOwn(before, file)) return consumers(before).length ? false : host;
    return same(consumers(before), [host]) && (!imports || same(before[file], imports)) ? host : false;
}
