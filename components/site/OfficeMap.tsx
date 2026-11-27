'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { site } from '@/lib/site';
import { mapAttribution, mapMaxZoom, mapTiles } from '@/lib/map';
import 'leaflet/dist/leaflet.css';

export default function OfficeMap() {
  const holder = useRef<HTMLDivElement | null>(null);
  const map = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !holder.current || map.current) return;

      const centre: [number, number] = [site.address.lat, site.address.lng];
      const instance = L.map(holder.current, { zoomControl: true, scrollWheelZoom: false }).setView(centre, 16);

      L.tileLayer(mapTiles, { maxZoom: mapMaxZoom, attribution: mapAttribution }).addTo(instance);

      L.marker(centre, {
        keyboard: false,
        icon: L.divIcon({
          className: '',
          iconSize: undefined,
          iconAnchor: [6, 6],
          html: '<div class="hth-pin"><span class="hth-dot"></span><span class="hth-tag">HTH Limousine</span></div>',
        }),
      }).addTo(instance);

      instance.on('click', () => instance.scrollWheelZoom.enable());
      map.current = instance;
      setTimeout(() => instance.invalidateSize(), 150);
    })();

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return <div ref={holder} style={{ position: 'absolute', inset: 0 }} />;
}
