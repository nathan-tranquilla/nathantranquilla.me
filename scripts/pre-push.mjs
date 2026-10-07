// git pre-push hook body (.githooks/pre-push): only `rake ship` (or CI) may move main. See ship-lib.mjs.
import { prePushDecision } from "./ship-lib.mjs";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  const updates = input
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l) => {
      const [localRef, localSha, remoteRef, remoteSha] = l.trim().split(/\s+/);
      return { localRef, localSha, remoteRef, remoteSha };
    });
  const d = prePushDecision({ updates, env: process.env });
  if (!d.allow) {
    console.error(`\n✖ push blocked: ${d.reason}\n`);
    process.exit(1);
  }
});
