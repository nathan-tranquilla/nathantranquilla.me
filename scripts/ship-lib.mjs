// rake ship: the decisions behind shipping. scripts/ship.mjs does the orchestration.
//
// Shipping tests the exact commit in a throwaway worktree on its own port, pushes that commit to main, then
// waits for the deploy run with that SHA. Plain Node, no dependencies: the pre-push hook runs it as-is.

// Pre-push hook: refuse to move main unless rake ship is pushing (SHIP_PUSH=1) or CI is (GITHUB_ACTIONS=true,
// the traffic-report bot). `updates` are the hook's stdin lines: { localRef, localSha, remoteRef, remoteSha }.
export const prePushDecision = ({ updates, env }) => {
  const touchesMain = updates.some((u) => u.remoteRef === "refs/heads/main");
  if (!touchesMain) return { allow: true, reason: "does not update main" };
  if (env.SHIP_PUSH === "1") return { allow: true, reason: "rake ship" };
  if (env.GITHUB_ACTIONS === "true") return { allow: true, reason: "CI" };
  return {
    allow: false,
    reason:
      "pushing to main goes through `rake ship`. It tests the exact commit in a clean worktree, " +
      "pushes it, and waits for its deploy.",
  };
};

// The traffic-report bot commits only reports/, which no test or page reads, so a gap of those commits
// cannot change what was tested. Empty is not reports-only: when in doubt, stop.
export const isReportsOnly = (files) => files.length > 0 && files.every((f) => f.startsWith("reports/"));

// main moved while ship was testing. Only the tested commit may ship: stop if HEAD moved on locally (new,
// untested commits), or if upstream gained anything but reports. Otherwise rebase over the reports gap.
export const afterMainMovedDecision = ({ testedSha, headSha, upstreamFiles }) => {
  if (headSha !== testedSha) {
    return { action: "stop", reason: "commits were made during the test run. Re-run rake ship to test them." };
  }
  if (!isReportsOnly(upstreamFiles)) {
    return { action: "stop", reason: `main moved with more than reports while testing. Re-run rake ship:\n  ${upstreamFiles.join("\n  ")}` };
  }
  return { action: "rebase" };
};

// The Playwright dev server. ship sets TEST_PORT so its run neither reuses nor disturbs the dev server on 4321.
export const testServer = (env) => ({
  port: env.TEST_PORT ?? "4321",
  reuse: !env.CI && !env.TEST_PORT,
});

// The suite in ship's worktree keeps a trace of every failure. A flake on 2026-10-07 could not be diagnosed:
// its error scrolled away, and re-running the failed test in the worktree overwrote test-results/.
export const WORKTREE_TEST = "pnpm test --trace=retain-on-failure";

export const testsFailedMessage = (sha, wt) =>
  [
    `tests failed for ${sha}. Nothing pushed.`,
    `  Traces: ${wt}/test-results (open one with: npx playwright show-trace <trace.zip>)`,
    `  Read them before re-running anything in that worktree: a re-run overwrites test-results.`,
  ].join("\n");
