// rake ship: test the exact commit in a clean worktree, push it, wait for its deploy.
//
//   rake ship          ship HEAD of main
//   DRY=1 rake ship    run the whole test pass, push nothing
//
// 1. Must be on main. Uncommitted changes are never shipped: only the commit is tested and pushed.
// 2. Fetch; rebase onto origin/main if it moved. Nothing ahead of origin means nothing to ship.
// 3. Check HEAD out into a throwaway detached worktree, install, build, and run the full suite there on
//    TEST_PORT 4331. The working tree and the dev server on 4321 are never read or touched.
// 4. Green: push that commit to main (the pre-push hook lets only SHIP_PUSH=1 through). If main moved
//    meanwhile, rebase only over traffic-report commits (reports/); anything else stops.
// 5. Wait for the "Deploy to GitHub Pages" run for the shipped SHA (never "the latest run") and exit with
//    its result.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WORKTREE_TEST, afterMainMovedDecision, testsFailedMessage } from "./ship-lib.mjs";

const DRY = process.env.DRY === "1";
const TEST_PORT = "4331";
const WORKFLOW = "Deploy to GitHub Pages";
const repoRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();

const out = (cmd, opts = {}) => execSync(cmd, { encoding: "utf8", cwd: repoRoot, ...opts }).trim();
const run = (cmd, opts = {}) => {
  console.log(`\n▶ ${cmd}${opts.cwd && opts.cwd !== repoRoot ? `   (in ${opts.cwd})` : ""}`);
  execSync(cmd, { stdio: "inherit", cwd: repoRoot, ...opts });
};
const stop = (msg) => {
  console.error(`\n✖ ship stopped: ${msg}`);
  process.exit(1);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. Preconditions ─────────────────────────────────────────────────────────────────────────────
if (out("git rev-parse --abbrev-ref HEAD") !== "main") stop("not on main (this repo is trunk-based).");
if (out("git status --porcelain --untracked-files=no") !== "") {
  console.log("ℹ Uncommitted changes are not shipped. Only the commit is tested and pushed; they stay as they are.");
}

// ── 2. Sync with origin ──────────────────────────────────────────────────────────────────────────
run("git fetch -q origin");
if (Number(out("git rev-list --count HEAD..origin/main")) > 0) run("git rebase --autostash origin/main");
if (Number(out("git rev-list --count origin/main..HEAD")) === 0) {
  console.log("\nNothing to ship: main is already at origin/main.");
  process.exit(0);
}

const sha = out("git rev-parse HEAD");
console.log(`\nShipping ${sha.slice(0, 12)}:`);
console.log(out("git log --oneline origin/main..HEAD"));

// ── 3. Test the exact commit in a throwaway worktree ─────────────────────────────────────────────
const wt = join(tmpdir(), `nathantranquilla-ship-${sha.slice(0, 12)}`);
if (existsSync(wt)) run(`git worktree remove --force ${wt}`);
run(`git worktree add --detach ${wt} ${sha}`);
const started = Date.now();
try {
  const { CI, ...rest } = process.env;
  const env = { ...rest, TEST_PORT };
  run("pnpm install --frozen-lockfile", { cwd: wt, env });
  run("pnpm res:build", { cwd: wt, env });
  // The sitemap spec asserts on dist/, as in CI.
  run("pnpm astro build", { cwd: wt, env });
  run(WORKTREE_TEST, { cwd: wt, env });
} catch {
  stop(testsFailedMessage(sha.slice(0, 12), wt));
}
const mins = ((Date.now() - started) / 60000).toFixed(1);
console.log(`\n✔ full suite passed for ${sha.slice(0, 12)} in ${mins} min`);
run(`git worktree remove --force ${wt}`);

if (DRY) {
  console.log("\nDRY=1: not pushing.");
  process.exit(0);
}

// ── 4. Push the tested commit ────────────────────────────────────────────────────────────────────
const pushToMain = (commit) => {
  try {
    run(`git push origin ${commit}:refs/heads/main`, { env: { ...process.env, SHIP_PUSH: "1" } });
    return true;
  } catch {
    return false;
  }
};

let shipped = sha;
if (!pushToMain(sha)) {
  run("git fetch -q origin");
  const upstreamFiles = out(`git diff --name-only $(git merge-base ${sha} origin/main) origin/main`)
    .split("\n")
    .filter(Boolean);
  const d = afterMainMovedDecision({ testedSha: sha, headSha: out("git rev-parse HEAD"), upstreamFiles });
  if (d.action === "stop") stop(d.reason);
  run("git rebase --autostash origin/main");
  shipped = out("git rev-parse HEAD");
  console.log(`main moved (reports only: ${upstreamFiles.join(", ")}). Shipping the rebased ${shipped.slice(0, 12)}.`);
  if (!pushToMain(shipped)) stop("main moved again. Re-run rake ship.");
}
console.log(`\n✔ Pushed ${shipped.slice(0, 12)} to main.`);

// ── 5. Wait for the deploy run for this SHA ──────────────────────────────────────────────────────
let runId = "";
for (let i = 0; i < 40 && !runId; i++) {
  runId = out(`gh run list --workflow "${WORKFLOW}" --commit ${shipped} --json databaseId -q ".[0].databaseId"`);
  if (!runId) await sleep(3000);
}
if (!runId) stop(`no "${WORKFLOW}" run appeared for ${shipped.slice(0, 12)} within two minutes. Check gh workflow list --all.`);

const url = out(`gh run view ${runId} --json url -q .url`);
console.log(`\nWaiting for deploy ${url}`);
try {
  execSync(`gh run watch ${runId} --exit-status --interval 10`, { cwd: repoRoot, stdio: "ignore" });
} catch {
  stop(`deploy for ${shipped.slice(0, 12)} failed: ${url}`);
}
console.log(`\n✔ Shipped ${shipped.slice(0, 12)} and deployed. Now check the live site for the change itself.`);
