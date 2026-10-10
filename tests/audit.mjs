// Integrity audit of any JSE environment at any time (read-only):
//   BASE=http://127.0.0.1:8788 node tests/audit.mjs        (staging: from the CI workflow, which signs in with OIDC)
import { BASE, signIn, Stats } from "./lib/client.mjs";
import { audit } from "./lib/audit.mjs";

const stats = new Stats();
const t0 = Date.now();
const { checks, counts } = await audit(stats, await signIn("ADMIN"));
for (const c of checks) console.log((c.pass ? "PASS " : "FAIL ") + c.name + (c.pass ? "" : "  [" + c.detail + "]"));
console.log(JSON.stringify({ base: BASE, counts, passed: checks.filter((c) => c.pass).length, total: checks.length, seconds: (Date.now() - t0) / 1000 }));
process.exit(checks.every((c) => c.pass) ? 0 : 1);
