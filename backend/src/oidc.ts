// GitHub Actions OIDC verification, used only by staging deployments for automated tests
// (POST /api/ci-login exists only when CI_OIDC_REPOSITORY is set on the function).
import { createPublicKey, verify as verifySignature } from "node:crypto";

const ISSUER = "https://token.actions.githubusercontent.com";
let jwks: { at: number; keys: any[] } | null = null;

async function loadKeys(force = false): Promise<any[]> {
  if (!force && jwks && Date.now() - jwks.at < 3_600_000) return jwks.keys;
  const r = await fetch(ISSUER + "/.well-known/jwks", { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error("could not load GitHub signing keys (" + r.status + ")");
  const body = (await r.json()) as { keys?: any[] };
  jwks = { at: Date.now(), keys: body.keys || [] };
  return jwks.keys;
}

const fromB64url = (s: string) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export interface OidcClaims { sub: string; repository: string; ref: string; run_id?: string; workflow?: string; [k: string]: unknown }

export async function verifyGithubOidc(token: string, opts: { repository: string; audience: string; refs?: string[] }): Promise<OidcClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("malformed token");
  const header = JSON.parse(fromB64url(parts[0]).toString("utf8"));
  const claims = JSON.parse(fromB64url(parts[1]).toString("utf8")) as OidcClaims & { iss: string; aud: string | string[]; exp: number; nbf?: number };
  if (header.alg !== "RS256") throw new Error("unexpected algorithm");
  let jwk = (await loadKeys()).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await loadKeys(true)).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("unknown signing key");
  const ok = verifySignature("RSA-SHA256", Buffer.from(parts[0] + "." + parts[1]), createPublicKey({ key: jwk, format: "jwk" }), fromB64url(parts[2]));
  if (!ok) throw new Error("bad signature");
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== ISSUER) throw new Error("wrong issuer");
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(opts.audience)) throw new Error("wrong audience");
  if (typeof claims.exp !== "number" || claims.exp < now - 30) throw new Error("token expired");
  if (typeof claims.nbf === "number" && claims.nbf > now + 60) throw new Error("token not valid yet");
  if (claims.repository !== opts.repository) throw new Error("wrong repository");
  if (opts.refs && opts.refs.length && !opts.refs.includes(claims.ref)) throw new Error("branch not allowed");
  return claims;
}
