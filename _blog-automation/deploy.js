#!/usr/bin/env node
/**
 * Hartron Hisar — safe deploy for auto-generated blog posts.
 *
 * Designed for a filesystem mount that blocks unlink/rename (so normal
 * `git add`/`commit`/branch-switch is unreliable). Uses git PLUMBING with a
 * throwaway temp index, so it:
 *   - never touches .git/index (no stale index.lock),
 *   - never switches branches (no working-tree file deletion),
 *   - only creates git objects + updates/pushes a ref.
 *
 * Commits ONLY the explicitly listed files on top of the current branch tip,
 * so unrelated dirty files (README, favicon, ...) are never included.
 *
 * Usage:
 *   node deploy.js --message "msg" --files "blog/a.html blog.html sitemap.xml"
 *   node deploy.js --message "msg" --files "..." --branch deploy-test   # throwaway
 *   node deploy.js --message "msg" --files "..." --dry-run              # build tree only, no push
 */

const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const a = process.argv.slice(2);
  const out = { files: [], message: '', dryRun: false, remote: 'origin', branch: 'main', base: 'HEAD' };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--files') out.files = a[++i].split(/\s+/).filter(Boolean);
    else if (a[i] === '--message') out.message = a[++i];
    else if (a[i] === '--dry-run') out.dryRun = true;
    else if (a[i] === '--remote') out.remote = a[++i];
    else if (a[i] === '--branch') out.branch = a[++i];
    else if (a[i] === '--base') out.base = a[++i];
  }
  return out;
}

function main() {
  const { files, message, dryRun, remote, branch, base } = parseArgs();
  if (!files.length) { console.error('No --files given'); process.exit(1); }
  if (!message) { console.error('No --message given'); process.exit(1); }
  for (const f of files) {
    if (f === '.' || f === '-A' || f === '--all' || f.includes('*')) {
      console.error(`Refusing unsafe file arg: ${f}`); process.exit(1);
    }
    if (!fs.existsSync(path.join(ROOT, f))) {
      console.error(`File does not exist: ${f}`); process.exit(1);
    }
  }

  // Temp index in the sandbox-local fs (unlink/rename work there).
  const idx = path.join(os.tmpdir(), `hartron-deploy-${process.pid}.index`);
  const env = Object.assign({}, process.env, {
    GIT_INDEX_FILE: idx,
    GIT_AUTHOR_NAME: 'Hartron Blog Bot', GIT_AUTHOR_EMAIL: 'prashantsinghla@gmail.com',
    GIT_COMMITTER_NAME: 'Hartron Blog Bot', GIT_COMMITTER_EMAIL: 'prashantsinghla@gmail.com',
  });
  const git = (args, opts = {}) =>
    execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', env, ...opts }).trim();

  try {
    const baseSha = git(['rev-parse', base]);
    console.log('Base commit:', baseSha.slice(0, 8), `(${base})`);

    // Seed temp index from the base tree, then stage only our files.
    git(['read-tree', baseSha]);
    git(['add', '--', ...files]);

    const staged = git(['diff', '--cached', '--name-only', baseSha]).split('\n').filter(Boolean);
    console.log('Files in this commit:', staged.join(', ') || '(none — nothing changed)');
    if (!staged.length) { console.log('Nothing to deploy.'); return; }

    const treeSha = git(['write-tree']);
    if (dryRun) {
      console.log(`[dry-run] Built tree ${treeSha.slice(0, 8)}; would commit + push to ${remote}/${branch}. No push done.`);
      return;
    }

    const commitSha = git(['commit-tree', treeSha, '-p', baseSha, '-m', message]);
    console.log('Created commit:', commitSha.slice(0, 8));

    const pushOut = git(['push', remote, `${commitSha}:refs/heads/${branch}`], { stdio: 'pipe' });
    console.log(`Pushed ${commitSha.slice(0, 8)} -> ${remote}/${branch}. Vercel will deploy.`);
    if (pushOut) console.log(pushOut);

    // Keep local branch ref in sync (only when we deployed to it).
    if (branch === 'main') git(['update-ref', 'refs/heads/main', commitSha]);
  } finally {
    try { fs.unlinkSync(idx); } catch (_) {}
    try { fs.unlinkSync(idx + '.lock'); } catch (_) {}
  }
}

main();
