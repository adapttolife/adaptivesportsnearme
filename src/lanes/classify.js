// classify: gazetteer sport classification (Spec 72 T02 implements).
// Contract: pure function classifyOrg(org, gazetteer) -> {sports: [sport_key...],
// hits: [{sport_key, term, field}]} | null, plus classifyLane({db, cursor}) that
// batches orgs whose sport is generic ('Multi-Sport') or NULL and proposes
//   { sport: {from,to}, sport_key: {from,to}, sports_json: {from,to} }
// confidence 0.85 (name hit) / 0.7 (description-only). sport_key in the proposal is
// the taxonomy row's icon_key (may be null) — never an unknown icon key.

export async function classifyLane({ db, cursor }) {
  return { cursor: "", processed: 0, flagged: 0, detail: "stub — Spec 72 T02" };
}
