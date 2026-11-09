import ts from 'typescript';
import { inertModuleSource } from './scopes.mjs';

export const DEV_SCHEMA_PLUGIN = 'scripts/dev-schema-validators.ts';

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

export function isDevSchemaChange(file, readBefore, readAfter) {
    return file === DEV_SCHEMA_PLUGIN && [readBefore(file), readAfter(file)].every(devOnlyPlugin);
}
