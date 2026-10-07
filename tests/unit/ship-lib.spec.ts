import { test, expect } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  prePushDecision,
  afterMainMovedDecision,
  isReportsOnly,
  testServer,
} from "../../scripts/ship-lib.mjs";

// rake ship is the only way main moves from this machine: it tests the exact
// commit in a throwaway worktree on its own port, pushes that commit, then
// waits for the deploy run with that SHA. These are the decisions it makes.

const A = "a".repeat(40);
const B = "b".repeat(40);
const toMain = { localRef: "refs/heads/main", localSha: A, remoteRef: "refs/heads/main", remoteSha: B };
const toOther = { localRef: "refs/heads/x", localSha: A, remoteRef: "refs/heads/x", remoteSha: B };

test.describe("prePushDecision: only rake ship (or CI) moves main", () => {
  test("blocks a plain push to main, pointing at rake ship", () => {
    const d = prePushDecision({ updates: [toMain], env: {} });
    expect(d.allow).toBe(false);
    expect(d.reason).toMatch(/rake ship/);
  });
  test("allows rake ship (SHIP_PUSH=1) and CI (GITHUB_ACTIONS=true)", () => {
    expect(prePushDecision({ updates: [toMain], env: { SHIP_PUSH: "1" } }).allow).toBe(true);
    expect(prePushDecision({ updates: [toMain], env: { GITHUB_ACTIONS: "true" } }).allow).toBe(true);
  });
  test("refuses look-alike escape values", () => {
    expect(prePushDecision({ updates: [toMain], env: { SHIP_PUSH: "true", GITHUB_ACTIONS: "1" } }).allow).toBe(false);
  });
  test("allows pushes that do not touch main, but not when any update does", () => {
    expect(prePushDecision({ updates: [toOther], env: {} }).allow).toBe(true);
    expect(prePushDecision({ updates: [toOther, toMain], env: {} }).allow).toBe(false);
  });
});

test.describe("isReportsOnly: the traffic bot's commits cannot change test results", () => {
  test("true only for files under reports/", () => {
    expect(isReportsOnly(["reports/analytics.json", "reports/traffic-sources.csv"])).toBe(true);
    expect(isReportsOnly(["reports/a.json", "src/pages/index.astro"])).toBe(false);
    expect(isReportsOnly(["reportsx/a.json"])).toBe(false);
    expect(isReportsOnly(["src/reports/a.json"])).toBe(false);
  });
  test("an empty list is not reports-only (safe default: stop)", () => {
    expect(isReportsOnly([])).toBe(false);
  });
});

test.describe("afterMainMovedDecision: only the tested commit ships", () => {
  test("stops when commits were made during the test run", () => {
    const d = afterMainMovedDecision({ testedSha: A, headSha: B, upstreamFiles: ["reports/a.json"] });
    expect(d.action).toBe("stop");
  });
  test("stops when main gained anything besides reports", () => {
    const d = afterMainMovedDecision({ testedSha: A, headSha: A, upstreamFiles: ["reports/a.json", "src/x.ts"] });
    expect(d.action).toBe("stop");
  });
  test("rebases over a reports-only gap", () => {
    const d = afterMainMovedDecision({ testedSha: A, headSha: A, upstreamFiles: ["reports/a.json"] });
    expect(d.action).toBe("rebase");
  });
});

test.describe("testServer: ship's run never reuses or disturbs the dev server on 4321", () => {
  test("defaults to 4321, reusing a running dev server locally", () => {
    expect(testServer({})).toEqual({ port: "4321", reuse: true });
  });
  test("CI never reuses", () => {
    expect(testServer({ CI: "true" })).toEqual({ port: "4321", reuse: false });
  });
  test("TEST_PORT moves the run off 4321 and never reuses what is there", () => {
    expect(testServer({ TEST_PORT: "4331" })).toEqual({ port: "4331", reuse: false });
  });
});

// The hook itself, run by real git against a throwaway remote.
test.describe("the pre-push hook", () => {
  const hooks = path.resolve(".githooks");
  let dir: string;

  test.beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "ship-hook-"));
    const git = (...args: string[]) => execFileSync("git", args, { cwd: dir, stdio: "pipe" });
    git("init", "-q", "--bare", "remote.git");
    git("init", "-q", "-b", "main", "work");
    const work = (...args: string[]) => execFileSync("git", args, { cwd: path.join(dir, "work"), stdio: "pipe" });
    work("config", "user.email", "t@example.com");
    work("config", "user.name", "t");
    work("config", "core.hooksPath", hooks);
    work("remote", "add", "origin", path.join(dir, "remote.git"));
    work("commit", "-q", "--allow-empty", "-m", "c");
  });
  test.afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const push = (ref: string, env: Record<string, string> = {}) => {
    const { GITHUB_ACTIONS, SHIP_PUSH, ...base } = process.env;
    return spawnSync("git", ["push", "-q", "origin", ref], {
      cwd: path.join(dir, "work"),
      env: { ...base, ...env },
      encoding: "utf8",
    });
  };

  test("refuses a plain push to main and names rake ship", () => {
    const r = push("main");
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/rake ship/);
  });
  test("lets rake ship's push through", () => {
    expect(push("main", { SHIP_PUSH: "1" }).status).toBe(0);
  });
  test("lets a push to another ref through", () => {
    expect(push("main:refs/heads/other").status).toBe(0);
  });
});

// Accept 8: any rake task installs the hooks, so a fresh clone is guarded
// the first time it runs anything.
test("running rake installs the hooks", () => {
  spawnSync("git", ["config", "--unset", "core.hooksPath"]);
  execFileSync("rake", ["-T"], { stdio: "pipe" });
  const hooksPath = execFileSync("git", ["config", "core.hooksPath"], { encoding: "utf8" }).trim();
  expect(hooksPath).toBe(".githooks");
});
