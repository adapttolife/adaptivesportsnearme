// geocode: zip -> ZCTA centroid proposals (Spec 72 T05 implements).
// Contract: for orgs with a zip whose geo_precision is 'state' or NULL, look up the
// vendored Census table (public/assets/data/zcta.json via env.ASSETS — one subrequest
// per run, no external API ever) and propose
//   { lat: {from,to}, lng: {from,to}, geo_precision: {from, to: 'zip'} }
// confidence 0.9. Unknown zips are skipped and counted in detail.

export async function geocodeLane({ db, env, cursor }) {
  return { cursor: "", processed: 0, flagged: 0, detail: "stub — Spec 72 T05" };
}
