import React, { useState, useImperativeHandle } from 'react';
import { GlassCard } from './ui/GlassCard';

/**
 * Lightweight IP Geolocation component
 * - Validates IPv4/IPv6
 * - Calls http://ip-api.com/json/[IP]
 * - Displays key details and a Google Maps link
 */
const IPGeolocation = React.forwardRef(function IPGeolocation({ onResult }, ref) {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const isValidIP = (value) => {
    const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
    const ipv6 = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
    return ipv4.test(value) || ipv6.test(value);
  };

  const handleLocate = async () => {
    setError(null);
    setResult(null);
    if (!ip || !isValidIP(ip.trim())) {
      setError('Please enter a valid IP address (IPv4 or IPv6).');
      return;
    }
    setLoading(true);
    try {
      // Provider: ipinfo (required)
      const fetchIpInfo = async () => {
        const token = (import.meta?.env?.VITE_IPINFO_TOKEN || '').trim();
        const url = token
          ? `https://ipinfo.io/${encodeURIComponent(ip.trim())}?token=${encodeURIComponent(token)}`
          : `https://ipinfo.io/${encodeURIComponent(ip.trim())}?callback=`; // unauthenticated fallback (rate-limited)
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error(`ipinfo responded with ${res.status}`);
        const data = await res.json();
        const [latStr, lonStr] = String(data.loc || '').split(',');
        const privacy = data.privacy || {};
        // Convert country code to full name when possible
        let countryName = data.country;
        try {
          if (countryName && countryName.length === 2 && typeof Intl?.DisplayNames === 'function') {
            const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
            const full = regionNames.of(countryName);
            if (full) countryName = full;
          }
        } catch {}
        return {
          provider: 'ipinfo',
          ip: ip.trim(),
          city: data.city,
          region: data.region,
          country: countryName,
          isp: data.org,
          lat: latStr ? parseFloat(latStr) : undefined,
          lon: lonStr ? parseFloat(lonStr) : undefined,
          mobile: privacy?.vpn ? false : undefined,
          proxy: !!(privacy?.proxy || privacy?.vpn || privacy?.tor),
          hosting: !!privacy?.hosting,
          raw: data
        };
      };
      let normalized = await fetchIpInfo();

      setResult(normalized);
      onResult?.(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error during lookup.');
    } finally {
      setLoading(false);
    }
  };

  // Expose an imperative API so parent can trigger lookup after "Analyze Text"
  useImperativeHandle(ref, () => ({
    locateIfValid: () => {
      if (ip && isValidIP(ip.trim()) && !loading) {
        handleLocate();
      }
    }
  }));

  // Great-circle distance (km)
  const haversineKm = (a, b) => {
    if (!a || !b) return undefined;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.asin(Math.sqrt(h)) * 10) / 10;
  };

  const handleUseMyLocation = () => {
    if (!result) return;
    if (!navigator.geolocation) {
      setError('Browser location unavailable.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const device = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const distanceKm = haversineKm({ lat: result.lat, lon: result.lon }, device);
        const enriched = { ...result, deviceLat: device.lat, deviceLon: device.lon, distanceKm };
        setResult(enriched);
        onResult?.(enriched);
      },
      (err) => setError(err?.message || 'Failed to read device location'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };


  return (
    <div className="space-y-2">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">IP Geolocation (Optional)</h3>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Paste IP address for geolocation (e.g., 8.8.8.8)"
          className="flex-1 px-3 sm:px-4 py-2 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm"
        />
        <button
          onClick={handleLocate}
          disabled={loading}
          className="px-4 sm:px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition disabled:opacity-60 text-sm"
        >
          {loading ? 'Locating…' : 'Locate'}
        </button>
      </div>


      {error && (
        <GlassCard variant="low" elevation={1} className="p-3 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20" glow={true}>
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </GlassCard>
      )}

      {result && (
        <GlassCard variant="medium" elevation={2} className="p-3 sm:p-4" glow={true}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 text-sm font-semibold">✓</span>
              <div className="text-gray-900 dark:text-gray-100 font-semibold text-base sm:text-lg">
                {result.city}, {result.region}, {result.country}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">ISP: {result.isp}</div>
            {result.lat !== undefined && result.lon !== undefined && (
              <div className="mt-2">
                <a
                  href={`https://www.google.com/maps?q=${result.lat},${result.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full sm:w-80"
                >
                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <iframe
                      title="Map preview"
                      src={`https://maps.google.com/maps?q=${result.lat},${result.lon}&z=14&output=embed`}
                      className="w-full h-40 pointer-events-none"
                      loading="lazy"
                    />
                  </div>
                </a>
              </div>
            )}
            {result.lat !== undefined && result.lon !== undefined && (
              <div>
                <a
                  href={`https://www.google.com/maps?q=${result.lat},${result.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
                >
                  Open in Google Maps
                </a>
              </div>
            )}
            {/* Removed mobile/proxy/hosting note */}
            <div className="text-[11px] text-gray-600 dark:text-gray-300">
              Lat: {result.lat}, Lng: {result.lon} • Source: {result.provider}
              {result.refined && result.displayName ? ` • Refined: ${result.displayName}` : ''}
              {typeof result?.distanceKm === 'number' ? ` • Δ ${result.distanceKm} km` : ''}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
});

export default IPGeolocation;


