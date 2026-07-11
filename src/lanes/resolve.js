// resolve: deterministic duplicate detection (Spec 72 T04 implements).
// Contract: tiers (a) same normalized website domain, (b) same normalized name + state,
// (c) fuzzy token-set >= 0.9 within same city+state. Proposes on the NON-canonical org:
//   { status: {from: 'active', to: 'duplicate'} }
// evidence { duplicate_of, tier, score }, confidence 0.95/0.9/0.75 by tier. Canonical
// pick: verified > has website > older created_at. Idempotent: skips pairs with a
// pending or already-applied duplicate proposal.

export async function resolveLane({ db, cursor }) {
  return { cursor: "", processed: 0, flagged: 0, detail: "stub — Spec 72 T04" };
}
