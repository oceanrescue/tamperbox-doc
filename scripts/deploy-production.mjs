import { readFile, appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readState, saveState, plan, flush } from './lib/indexnow-deploy.mjs';
const root = resolve(import.meta.dirname, '..');
const config = {"origin": "https://docs.tamperbox.dev", "sitemap": "/sitemap-index.xml", "deployArgs": ["--env", "production"]};
config.key = (await readFile(resolve(root, 'site/indexnow-key.txt'), 'utf8')).trim();
const file = resolve(root, '.indexnow/state.json');
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw Error(`${command} ${args.join(' ')} failed (${result.status ?? result.error?.message})`);
};
const command = process.argv[2];
let state = await readState(file, config.origin);
if (command === 'deploy') {
  run('npm', ['run', 'build']);
  const target = JSON.parse(await readFile(resolve(root, '.artifacts/content-manifest.json'), 'utf8'));
  state = await plan(state, target, config);
  console.log(`IndexNow: ${state.pending.length} pending or changed URL(s).`);
  if (process.argv.includes('--dry-run')) {
    run('npx', ['--no-install', 'wrangler', 'deploy', ...config.deployArgs, '--dry-run']);
    console.log(state.pending.join('\n'));
    process.exit(0);
  }
  // Persist before cutover. Failed deployments cannot flush this staged queue.
  await saveState(file, state);
  run('npx', ['--no-install', 'wrangler', 'deploy', ...config.deployArgs]);
  state.ready = true;
  await saveState(file, state);
} else if (command !== 'retry') throw Error('Use deploy [--dry-run] or retry');
await flush(state, config, value => saveState(file, value));
const message = `IndexNow: ${state.pending.length} URL(s) pending.${!state.ready ? ' No completed deployment recorded.' : ''}${state.retryAt ? ` Retry after ${new Date(state.retryAt).toISOString()}.` : ''}`;
console.log(message);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, message + '\n');
if (state.pending.length) {
  console.warn('::warning::IndexNow URLs retained. Run npm run indexnow:retry after the retry deadline; deployment is unaffected.');
  if (command === 'retry') process.exitCode = 1;
}
