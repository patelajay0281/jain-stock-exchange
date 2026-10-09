// Bundles the API for Neon Functions (Node 24, ESM) and prints its SHA-256.
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const entry = process.argv[2] || "backend/src/server.ts";
const out = process.argv[3] || "backend/dist/app.mjs";
await build({
  entryPoints: [entry], outfile: out, bundle: true, platform: "node", target: "node22", format: "esm",
  minify: true, legalComments: "none", sourcemap: false,
  banner: { js: "import{createRequire as __jseCR}from'module';const require=__jseCR(String(import.meta.url).startsWith('file:')?import.meta.url:'file:///tmp/jse.mjs');" },
  external: ["pg-native"],
});
const buf = readFileSync(out);
console.log(JSON.stringify({ out, bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") }));
