import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export function successfulBaseEvidence(proof, { commit, runId, repository }) {
    return !!proof && proof.version === 1 && proof.repository === repository && proof.currentRunId === runId && proof.before === commit && proof.status === 'verified_previous_success' && proof.run?.head_sha === commit && proof.run.head_branch === 'main' && proof.run.status === 'completed' && proof.run.conclusion === 'success' && Number.isSafeInteger(proof.run.id) && proof.run.id > 0 && typeof proof.run.path === 'string' && proof.run.path.split('@')[0] === '.github/workflows/pages.yml';
}
export async function collectBaseEvidence({ env = process.env, fetcher = fetch } = {}) {
    const event = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8')), base = { version: 1, repository: env.GITHUB_REPOSITORY, currentRunId: env.GITHUB_RUN_ID, before: event.before ?? null, queriedAt: new Date().toISOString(), status: 'unverified_full_required', run: null };
    if (env.GITHUB_EVENT_NAME !== 'push' || event.ref !== 'refs/heads/main' || !/^[a-f0-9]{40}$/.test(event.before ?? '') || /^0+$/.test(event.before))
        return base;
    try {
        const endpoint = `${env.GITHUB_API_URL ?? 'https://api.github.com'}/repos/${env.GITHUB_REPOSITORY}/actions/workflows/pages.yml/runs?branch=main&head_sha=${event.before}&per_page=100`;
        const response = await fetcher(endpoint, { headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' }, signal: AbortSignal.timeout(15000) });
        if (!response.ok)
            return { ...base, httpStatus: response.status };
        const data = await response.json();
        const rows = data.workflow_runs?.filter(r => r.head_sha === event.before && r.head_branch === 'main').sort((a, b) => b.id - a.id);
        if (!rows?.length)
            return base;
        const row = rows[0];
        base.run = { id: row.id, head_sha: row.head_sha, head_branch: row.head_branch, path: row.path, status: row.status, conclusion: row.conclusion, run_attempt: row.run_attempt, html_url: row.html_url };
        if (successfulBaseEvidence({ ...base, status: 'verified_previous_success' }, { commit: event.before, runId: env.GITHUB_RUN_ID, repository: env.GITHUB_REPOSITORY }))
            base.status = 'verified_previous_success';
        return base;
    }
    catch (error) {
        return { ...base, error: String(error.message ?? error) };
    }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const output = process.argv[2];
    if (!output)
        throw Error('base evidence output path required');
    const proof = await collectBaseEvidence();
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(proof, null, 2) + '\n');
    console.log(proof.status);
}
