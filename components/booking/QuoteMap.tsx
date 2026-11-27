'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet';
import type { Place } from '@/lib/quote';
import { mapAttribution, mapMaxZoom, mapTiles } from '@/lib/map';
import 'leaflet/dist/leaflet.css';

interface Props {
  from: Place | null;
  to: Place | null;
  /** Road geometry from OSRM when we have it; straight line is the fallback. */
  path: [number, number][] | null;
  locale?: 'vi' | 'en';
}

/**
 * A real Leaflet map on a light basemap. Loaded only on the client and only
 * once the booking module is on screen — Leaflet never reaches the server bundle.
 */
export default function QuoteMap({ from, to, path, locale = 'vi' }: Props) {
  const holder = useRef<HTMLDivElement | null>(null);
  const map = useRef<LeafletMap | null>(null);
  const layers = useRef<(Marker | Polyline)[]>([]);

  // Create once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !holder.current || map.current) return;

      const instance = L.map(holder.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView([10.78, 106.7], 10);

      L.tileLayer(mapTiles, { maxZoom: mapMaxZoom, attribution: mapAttribution }).addTo(instance);
      instance.on('click', () => instance.scrollWheelZoom.enable());

      map.current = instance;
      setTimeout(() => instance.invalidateSize(), 120);
    })();

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Redraw pins and route whenever the leg changes.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      const instance = map.current;
      if (cancelled || !instance) return;

      layers.current.forEach((layer) => instance.removeLayer(layer));
      layers.current = [];

      const pin = (place: Place, origin: boolean) => {
        // Geocoded labels come from OpenStreetMap, so they are escaped before
        // going into Leaflet's HTML icon.
        const label = (locale === 'en' ? place.en : place.vi).replace(
          /[&<>"']/g,
          (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
        );
        const icon = L.divIcon({
          className: '',
          iconSize: undefined,
          iconAnchor: [6, origin ? -6 : 22],
          html: `<div class="hth-pin"><span class="hth-dot${origin ? '' : ' is-end'}"></span><span class="hth-tag">${label}</span></div>`,
        });
        const marker = L.marker([place.lat, place.lng], { icon, keyboard: false }).addTo(instance);
        layers.current.push(marker);
      };

      if (from) pin(from, true);
      if (to) pin(to, false);

      if (from && to) {
        const coords: [number, number][] = path ?? [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ];
        const line = L.polyline(coords, {
          color: '#D69E4A',
          weight: 3,
          opacity: 0.95,
          dashArray: path ? undefined : '8 7',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(instance);
        layers.current.push(line);
        instance.fitBounds(line.getBounds(), { padding: [34, 30], animate: false });
      } else if (from || to) {
        const only = (from ?? to)!;
        instance.setView([only.lat, only.lng], 12, { animate: false });
      }
    })();

    return () => { cancelled = true; };
  }, [from, to, path, locale]);

  return <div ref={holder} style={{ position: 'absolute', inset: 0 }} />;
}
