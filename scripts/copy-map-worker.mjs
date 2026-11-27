// Copies MapLibre's web worker next to the site's static files. MapLibre 6
// loads its worker from a separate module file, which the Next.js bundler
// does not emit, so the map points at /vendor/maplibre-gl-worker.mjs instead.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'node_modules', 'maplibre-gl', 'dist', 'maplibre-gl-worker.mjs');
const to = join(root, 'public', 'vendor', 'maplibre-gl-worker.mjs');
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log('maplibre worker -> public/vendor/maplibre-gl-worker.mjs');
