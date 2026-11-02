import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
if (args.length !== 1 || !/^--base=[a-f0-9]{40}$/.test(args[0]))
    throw Error('Usage: npm run check:changed -- --base=<40-character verified ancestor commit>');
for (const [command, argv] of [['npm', ['run', 'pretest']], [process.execPath, ['scripts/ci/test.mjs', ...args]], ['npm', ['run', 'build']], ['npm', ['run', 'doc:build']]]) {
    const child = spawnSync(command, argv, { stdio: 'inherit' });
    if (child.status !== 0)
        process.exit(child.status ?? 1);
}
