const MAX_ADDRESS_LENGTH = 500;

export async function geocodeAddress(value, fetcher = fetch) {
  const address = String(value || "")
    .trim()
    .slice(0, MAX_ADDRESS_LENGTH);
  if (!address) return null;
  const url = new URL(
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress",
  );
  url.searchParams.set("format", "json");
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("address", address);
  const response = await fetcher(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  const match = (await response.json())?.result?.addressMatches?.[0];
  const lat = Number(match?.coordinates?.y);
  const lng = Number(match?.coordinates?.x);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  )
    return null;
  return { lat, lng, geo_precision: "address" };
}
