import path from 'node:path';
import ts from 'typescript';
/** Parse only; never import/evaluate project modules while planning tests. */
export function runtimeDependencyGraph(sources, inputs, packages = []) {
    /** @type {Record<string,string[]>} */
    const graph = {};
    const unresolved = [];
    const generatedValidator = 'src/generated/validators.js';
    const validatorInputs = ['scripts/compile-schemas.mjs', 'src/core/unicode.js', 'package.json', 'package-lock.json', ...Object.keys(inputs).filter(file => /^docs\/public\/schemas\/[^/]+\.schema\.json$/.test(file))].sort();
    const knownValidator = validatorInputs.length > 4 && validatorInputs.every(file => Object.hasOwn(inputs, file));
    const virtualDependencies = [];
    const packageFor = specifier => specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
    for (const [file, source] of Object.entries(sources)) {
        const syntax = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : file.endsWith('.mjs') ? ts.ScriptKind.JS : ts.ScriptKind.TS), dependencies = [];
        for (const diagnostic of syntax.parseDiagnostics)
            unresolved.push(`${file}: parse error ${diagnostic.code}`);
        const addSpecifier = (node, reason) => {
            if (!node || !ts.isStringLiteralLike(node)) {
                unresolved.push(`${file}: unresolved ${reason}`);
                return;
            }
            const specifier = node.text;
            if (!specifier.startsWith('.')) {
                if (!packages.includes(packageFor(specifier)))
                    unresolved.push(`${file}: undeclared dependency/alias ${specifier}`);
                return;
            }
            const resource = /\.css\?raw$/.test(specifier) ? specifier.slice(0, -4) : specifier;
            const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), resource));
            const resolved = [target, target + '.ts', target + '.tsx', target + '.mjs', target + '.js', target + '.json', target + '/index.ts', target + '/index.tsx'].find(p => Object.hasOwn(inputs, p));
            if (resolved)
                dependencies.push(resolved);
            else if (target === generatedValidator && knownValidator) {
                dependencies.push(generatedValidator);
                graph[generatedValidator] = validatorInputs;
                if (!virtualDependencies.length)
                    virtualDependencies.push({output: generatedValidator, inputs: validatorInputs, regeneratedBy: 'npm run schema:compile (mandatory pretest)'});
            }
            else
                unresolved.push(`${file}: unresolved ${reason} ${specifier}`);
        };
        const visit = node => {
            if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
                if (node.moduleSpecifier)
                    addSpecifier(node.moduleSpecifier, 'import/export');
            }
            else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference))
                addSpecifier(node.moduleReference.expression, 'import equals');
            else if (ts.isImportTypeNode(node))
                addSpecifier(ts.isLiteralTypeNode(node.argument) ? node.argument.literal : null, 'type import');
            else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
                if (node.arguments.length !== 1)
                    unresolved.push(`${file}: unresolved import/require arguments`);
                else
                    addSpecifier(node.arguments[0], 'dynamic import/require');
            }
            ts.forEachChild(node, visit);
        };
        visit(syntax);
        graph[file] = [...new Set(dependencies)].sort();
    }
    return { graph, virtualDependencies, unresolved: [...new Set(unresolved)].sort() };
}
