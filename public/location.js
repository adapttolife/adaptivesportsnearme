/* IP first, then browser permission. GPS is sent directly to BigDataCloud for
 * a city label; it is never saved or placed in the site's navigation URLs. */
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
      geolocation.getCurrentPosition(async position => {
        const { latitude: lat, longitude: lng } = position.coords;
        if (valid(lat, lng)) {
          let label = current.source === 'ip' ? current.label : 'Your location';
          try {
            // This client-only service accepts the visitor's consented GPS fix.
            // Keep requests out of D1 and omit cookies and the referring page.
            const response = await request(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
              { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(5000) }
            );
            const place = response.ok ? await response.json() : null;
            const city = typeof place?.city === 'string' && place.city.trim() ||
              (typeof place?.locality === 'string' ? place.locality.trim() : '');
            const code = typeof place?.principalSubdivisionCode === 'string' ? place.principalSubdivisionCode : '';
            const region = /^US-[A-Z]{2}$/.test(code) ? code.slice(3) :
              (typeof place?.principalSubdivision === 'string' ? place.principalSubdivision.trim() : '');
            if (city) label = [city, region].filter(Boolean).join(', ');
          } catch { /* Keep the IP label if the city lookup is unavailable. */ }
          current = { label, lat, lng, source: 'browser' };
          onChange(current);
        }
        done();
      }, done, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
    } catch { done(); }
  });
};
