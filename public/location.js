/* IP first, then browser permission. Coordinates stay in memory, never in URLs. */
globalThis.detectVisitorLocation = async function (onChange, { fetch: request = fetch, geolocation = navigator.geolocation } = {}) {
  let current = { label: 'Denver, CO', lat: 39.7392, lng: -104.9903, source: 'fallback' };
  const valid = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  try {
    const response = await request('/api/location', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    const data = response.ok ? await response.json() : null;
    if (data?.city) {
      current = {
        label: [data.city, data.region].filter(Boolean).join(', '), source: 'ip',
        ...(valid(data.lat, data.lng) ? { lat: data.lat, lng: data.lng } : {})
      };
    }
  } catch { /* IP metadata can be unavailable, including during local dev. */ }
  onChange(current);
  if (!geolocation) return current;
  return new Promise(resolve => {
    const done = () => resolve(current);
    try {
      geolocation.getCurrentPosition(position => {
        const { latitude: lat, longitude: lng } = position.coords;
        if (valid(lat, lng)) {
          current = { label: 'Current location', lat, lng, source: 'browser' };
          onChange(current);
        }
        done();
      }, done, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
    } catch { done(); }
  });
};
