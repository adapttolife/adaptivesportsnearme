// Pure helpers for scripts/check-release-secrets.mjs and its tests.
//
// Why this exists: a new version of a Worker copies its secrets from the
// NEWEST uploaded version, not from the deployed one. Branch builds upload
// versions to adaptivesportsnearme, so the newest version is often a branch
// build. Before a production release the question is whether that newest
// upload holds every secret production needs.

const SECRET_LIKE = /(KEY|SECRET|TOKEN|PASSWORD)$/;

// Secret names on one version, as `wrangler versions view --json` returns it.
export function secretNames(version) {
  const bindings = version?.resources?.bindings ?? [];
  return bindings
    .filter((binding) => binding.type === "secret_text" || binding.type === "secret_key")
    .map((binding) => binding.name)
    .sort();
}

// The newest upload, from `wrangler versions list --json`.
export function newestVersion(versions) {
  return versions.reduce((newest, version) =>
    version.number > newest.number ? version : newest,
  );
}

// The version serving most traffic, from `wrangler deployments status --json`.
export function deployedVersionId(deployment) {
  const live = [...(deployment?.versions ?? [])].sort(
    (a, b) => b.percentage - a.percentage,
  );
  return live[0]?.version_id;
}

export function assessRelease({ required, newestSecrets, deployedSecrets }) {
  const missingFromNewest = required.filter((name) => !newestSecrets.includes(name));
  const missingFromDeployed = required.filter(
    (name) => !deployedSecrets.includes(name),
  );
  return {
    safe: missingFromNewest.length === 0,
    missingFromNewest,
    missingFromDeployed,
  };
}

// env.NAME references in source whose names look like secrets.
export function secretLikeEnvNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/\benv\.([A-Z][A-Z0-9_]+)/g)) {
    if (SECRET_LIKE.test(match[1])) names.add(match[1]);
  }
  return names;
}
