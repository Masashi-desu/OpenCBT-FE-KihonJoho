import postcss from 'postcss';
import ts from 'typescript';
import { inertModuleSource } from './scopes.mjs';

export const DEV_SCHEMA_PLUGIN = 'scripts/dev-schema-validators.ts';
export const ERROR_DETAIL = 'src/ui/ErrorDetails.tsx';
const styles = 'src/ui/style.css';
export const errorUiHosts = { [ERROR_DETAIL]: 'src/ui/App.tsx', [styles]: 'src/main.tsx' };

function devOnlyPlugin(bytes) {
    if (!inertModuleSource(DEV_SCHEMA_PLUGIN, bytes, ['node:path', 'vite', './compile-schemas.mjs'])) return false;
    const source = ts.createSourceFile(DEV_SCHEMA_PLUGIN, bytes.toString(), ts.ScriptTarget.Latest, true);
    const declarations = source.statements.filter(node => !ts.isImportDeclaration(node) && !ts.isTypeAliasDeclaration(node) && !ts.isInterfaceDeclaration(node));
    const factory = declarations[0];
    if (declarations.length !== 1 || !ts.isFunctionDeclaration(factory) || factory.name?.text !== 'devSchemaValidators' ||
        factory.parameters.length || !factory.body) return false;
    const statements = [...factory.body.statements], result = statements.pop();
    if (!statements.every(node => ts.isVariableStatement(node) && node.declarationList.declarations.every(d => ts.isIdentifier(d.name) && !d.initializer)) ||
        !result || !ts.isReturnStatement(result) || !result.expression || !ts.isObjectLiteralExpression(result.expression)) return false;
    // Vite calls the factory for build as well. Its only work must be to return
    // inert hooks that are enabled exclusively for the development server.
    const properties = result.expression.properties;
    const hooks = ['configResolved', 'configureServer', 'watchChange'];
    const keys = properties.map(p => p.name && ts.isIdentifier(p.name) ? p.name.text : '');
    return new Set(keys).size === keys.length && keys.includes('apply') && keys.includes('name') &&
        properties.every((p, i) => {
            const key = keys[i];
            if (key === 'apply' || key === 'name')
                return ts.isPropertyAssignment(p) && ts.isStringLiteral(p.initializer) &&
                    p.initializer.text === (key === 'apply' ? 'serve' : 'dev-schema-validators');
            return hooks.includes(key) && ts.isMethodDeclaration(p) && !p.modifiers?.length;
        });
}

function withoutErrorRules(bytes) {
    const tree = postcss.parse(bytes.toString());
    tree.walkRules(rule => {
        // A mixed selector, sibling selector or nested rule stays in the comparison.
        const owned = selector => /^\.error-(?:banner(?:-content|-heading)?|details(?:-panel|-tools)?)(?=$|[\s.:\[>#])/.test(selector) &&
            !/[+~()\\]/.test(selector);
        if (!rule.selectors.every(owned) || !rule.nodes.every(node => node.type === 'decl' || node.type === 'comment')) return;
        for (let ancestor = rule.parent; ancestor.type !== 'root'; ancestor = ancestor.parent)
            if (ancestor.type !== 'atrule' || !['media', 'container', 'supports'].includes(ancestor.name)) return;
        rule.remove();
    });
    return tree.toString();
}

export function startupFeatureFor(file, readBefore, readAfter) {
    if (file !== DEV_SCHEMA_PLUGIN && !Object.hasOwn(errorUiHosts, file)) return null;
    const before = readBefore(file), after = readAfter(file);
    if (!before || !after) return null;
    if (file === DEV_SCHEMA_PLUGIN && devOnlyPlugin(before) && devOnlyPlugin(after)) return 'dev-schema';
    if (file === ERROR_DETAIL && [before, after].every(bytes => inertModuleSource(file, bytes, ['react', 'lucide-react']))) return 'error-ui';
    if (file === styles && withoutErrorRules(before) === withoutErrorRules(after)) return 'error-ui';
    return null;
}

export function errorUiImports(file, graph) {
    const consumers = Object.keys(graph).filter(consumer => graph[consumer].includes(file));
    return consumers.length === 1 && consumers[0] === errorUiHosts[file] &&
        (file !== ERROR_DETAIL || graph[file]?.length === 0);
}
