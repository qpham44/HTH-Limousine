/**
 * Hand-built 3D miniatures drawn into the map with three.js, Apple-Maps style:
 *
 *   • HTH's limousine van (black, gold pinstripe, HTH on the roof), which
 *     drives the chosen road and keeps a readable size at every zoom;
 *   • landmark miniatures, built to the real footprint and bearing taken from
 *     OpenStreetMap and to each monument's published height;
 *   • the cable-stayed bridges on HTH's routes, along their OSM deck lines;
 *   • rounded trees scattered through the parks and woods on screen.
 *
 * Everything is procedural geometry: no third-party model files.
 * Loaded on demand, so three.js never weighs on the first view of the page.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { CustomLayerInterface, Map as MLMap } from 'maplibre-gl';
import type { LngLat } from './geo';

type ML = typeof import('maplibre-gl');

export interface Monument {
  id: string;
  kind: string;
  height: number;
  lon: number;
  lat: number;
  bearing: number;
  length: number;
  width: number;
}
export interface Bridge {
  name: string;
  span: number;
  pylon: number;
  clearance: number;
  line: [number, number][];
  length: number;
}
export interface ModelsHandle {
  layer: CustomLayerInterface;
  setCar(pos: LngLat | null, heading: number): void;
  refreshTrees(): void;
}

const RAD = Math.PI / 180;
const VAN_LENGTH = 6.2;

/* ------------------------------------------------------------------ helpers */

function mat(color: string | number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, flatShading: true, ...opts });
}

function box(w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

/** A pyramid (4-sided cone) roof, w × d at its base. */
function hipRoof(w: number, d: number, h: number, m: THREE.Material, y: number, x = 0, z = 0) {
  const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  g.rotateY(Math.PI / 4);
  const mesh = new THREE.Mesh(g, m);
  mesh.scale.set(w, h, d);
  mesh.position.set(x, y + h / 2, z);
  return mesh;
}

/** A gable roof: a triangular prism along x. */
function gableRoof(l: number, w: number, h: number, m: THREE.Material, y: number, x = 0, z = 0, alongZ = false) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(0, h);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: l, bevelEnabled: false });
  g.translate(0, 0, -l / 2);
  if (!alongZ) g.rotateY(Math.PI / 2);
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(x, y, z);
  return mesh;
}

function blobShadow(rx: number, rz: number, opacity = 0.22) {
  const g = new THREE.CircleGeometry(1, 32);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity, depthWrite: false });
  const mesh = new THREE.Mesh(g, m);
  mesh.scale.set(rx, 1, rz);
  mesh.position.y = 0.05;
  mesh.renderOrder = -1;
  return mesh;
}

/* ---------------------------------------------------------------- the van */

function roofLogo(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0d0d0f';
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = '#d69e4a';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 140);
  ctx.fillStyle = '#e8b25c';
  ctx.font = '700 86px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HTH', 256, 70);
  ctx.font = '600 26px system-ui, sans-serif';
  ctx.fillText('L I M O U S I N E', 256, 126);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** HTH's limousine van, nose towards -z (north at heading 0), wheels on y = 0. */
function buildVan(): THREE.Group {
  const g = new THREE.Group();
  const L = VAN_LENGTH;
  const W = 2.04;
  const body = new THREE.MeshPhongMaterial({ color: 0x0c0c0e, shininess: 90, specular: 0x8a8a8a, flatShading: false });
  const glass = new THREE.MeshPhongMaterial({ color: 0x1b2533, shininess: 120, specular: 0xb0c4de, side: THREE.DoubleSide });
  const gold = new THREE.MeshPhongMaterial({ color: 0xd69e4a, shininess: 60, specular: 0xffe2a8 });
  const tyre = mat(0x161616);
  const rim = new THREE.MeshPhongMaterial({ color: 0xc8c8c8, shininess: 100 });
  const lamp = new THREE.MeshBasicMaterial({ color: 0xfff4cf });
  const tail = new THREE.MeshBasicMaterial({ color: 0xff2a1f });

  // Side profile (z along the length, y up), extruded across the width.
  const p = new THREE.Shape();
  const z0 = L / 2; // rear
  p.moveTo(z0, 0.42);
  p.lineTo(z0, 2.55);
  p.quadraticCurveTo(z0, 2.68, z0 - 0.18, 2.68);
  p.lineTo(-L / 2 + 1.55, 2.68);
  p.quadraticCurveTo(-L / 2 + 1.25, 2.66, -L / 2 + 1.0, 2.2); // roof to windscreen
  p.lineTo(-L / 2 + 0.55, 1.35); // windscreen
  p.quadraticCurveTo(-L / 2 + 0.05, 1.2, -L / 2, 0.95); // bonnet
  p.lineTo(-L / 2, 0.42);
  p.closePath();
  const shell = new THREE.ExtrudeGeometry(p, { depth: W, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 8 });
  shell.translate(0, 0, -W / 2);
  shell.rotateY(-Math.PI / 2); // profile x → world z (nose at -z), extrusion → world x
  const shellMesh = new THREE.Mesh(shell, body);
  g.add(shellMesh);

  // Windows: a dark band along each side, the windscreen and the rear glass.
  for (const side of [-1, 1]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.62, L - 2.0), glass);
    band.position.set(side * (W / 2 + 0.07), 1.9, 0.55);
    g.add(band);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, L - 0.6), gold);
    stripe.position.set(side * (W / 2 + 0.075), 1.32, 0.1);
    g.add(stripe);
  }
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, 1.05), glass);
  screen.position.set(0, 1.81, -L / 2 + 0.71);
  screen.rotation.x = Math.atan2(0.45, 0.85); // leans back like the glass

  g.add(screen);
  const rear = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.5, 0.6), glass);
  rear.position.set(0, 2.0, L / 2 + 0.075);
  g.add(rear);

  // Roof sign.
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.06), new THREE.MeshBasicMaterial({ map: roofLogo() }));
  logo.rotation.x = -Math.PI / 2;
  logo.rotation.z = Math.PI / 2;
  logo.position.set(0, 2.75, 0.6);
  g.add(logo);

  // Wheels.
  const tyreG = new THREE.CylinderGeometry(0.37, 0.37, 0.26, 18);
  tyreG.rotateZ(Math.PI / 2);
  const rimG = new THREE.CylinderGeometry(0.22, 0.22, 0.27, 12);
  rimG.rotateZ(Math.PI / 2);
  for (const [x, z] of [[-1, -L / 2 + 1.05], [1, -L / 2 + 1.05], [-1, L / 2 - 1.15], [1, L / 2 - 1.15]]) {
    const t = new THREE.Mesh(tyreG, tyre);
    t.position.set(x * (W / 2 - 0.05), 0.37, z);
    g.add(t);
    const r = new THREE.Mesh(rimG, rim);
    r.position.copy(t.position);
    g.add(r);
  }

  // Lights and a gold grille bar.
  for (const side of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.05), lamp);
    h.position.set(side * 0.68, 0.98, -L / 2 - 0.05);
    g.add(h);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.05), tail);
    tl.position.set(side * (W / 2 - 0.12), 1.2, L / 2 + 0.08);
    g.add(tl);
  }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.05), gold);
  grille.position.set(0, 0.8, -L / 2 - 0.05);
  g.add(grille);

  g.add(blobShadow(1.45, 3.4, 0.3));
  return g;
}

/* ----------------------------------------------------------- landmarks */

const C = {
  white: '#f6f4ef',
  stone: '#ebe6dc',
  cream: '#f1e3c2',
  brick: '#c4684b',
  brickDark: '#9b4b35',
  slate: '#7c8798',
  roofRed: '#b14a32',
  roofGreen: '#4f8f62',
  gold: '#d9a441',
  glass: '#9fc1dc',
  lawn: '#a6dc8b',
  water: '#7fc8f1',
};

function towerCham(scale: number, m: THREE.Material, dark: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const b = 9 * scale;
  let y = 0;
  const tiers = [[b, 0.42], [b * 0.78, 0.2], [b * 0.6, 0.15], [b * 0.44, 0.1]];
  const H = 23 * scale;
  for (const [w, k] of tiers) {
    const h = H * k;
    g.add(box(w, h, w, m, 0, y, 0));
    // corner pinnacles
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const pin = new THREE.Mesh(new THREE.ConeGeometry(w * 0.08, h * 0.5, 4), dark);
      pin.position.set(sx * w * 0.42, y + h + h * 0.25, sz * w * 0.42);
      g.add(pin);
    }
    y += h;
  }
  const top = new THREE.Mesh(new THREE.ConeGeometry(b * 0.22, H * 0.13, 4), dark);
  top.position.y = y + H * 0.065;
  g.add(top);
  // front porch
  g.add(box(b * 0.36, H * 0.3, b * 0.3, m, 0, 0, -b * 0.62));
  return g;
}

function temple(m: Monument, roofColor: string, wall = C.cream): THREE.Group {
  const g = new THREE.Group();
  const L = Math.max(16, Math.min(m.length || 24, 70));
  const W = Math.max(10, Math.min(m.width || 14, 40));
  const H = m.height;
  const wallM = mat(wall);
  const roofM = mat(roofColor);
  const baseM = mat(C.stone);
  g.add(box(L + 3, 0.9, W + 3, baseM));
  g.add(box(L, H * 0.42, W, wallM, 0, 0.9, 0));
  g.add(hipRoof(L * 1.12, W * 1.18, H * 0.28, roofM, 0.9 + H * 0.42));
  g.add(box(L * 0.55, H * 0.14, W * 0.55, wallM, 0, 0.9 + H * 0.56, 0));
  g.add(hipRoof(L * 0.68, W * 0.72, H * 0.22, roofM, 0.9 + H * 0.68));
  // ridge ornament
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), mat(C.gold));
  pearl.position.y = 0.9 + H * 0.9 + 0.5;
  g.add(pearl);
  return g;
}

function buildMonument(m: Monument): THREE.Group {
  const g = new THREE.Group();
  const H = m.height;
  switch (m.kind) {
    case 'cathedral': {
      const L = Math.min(Math.max(m.length || 90, 60), 110);
      const W = Math.min(Math.max(m.width || 35, 24), 45);
      const brick = mat(C.brick);
      const roof = mat(C.brickDark);
      const spire = mat(C.slate);
      g.add(box(L * 0.82, 20, W * 0.5, brick, L * 0.05, 0, 0));
      g.add(gableRoof(L * 0.82, W * 0.5, 9, roof, 20, L * 0.05, 0));
      g.add(box(W * 0.36, 18, W * 0.95, brick, L * 0.18, 0, 0)); // transept
      g.add(gableRoof(W * 0.95, W * 0.36, 8, roof, 18, L * 0.18, 0, true));
      const apse = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.25, W * 0.25, 17, 12, 1, false, 0, Math.PI), brick);
      apse.rotation.y = Math.PI / 2;
      apse.position.set(L * 0.46, 8.5, 0);
      g.add(apse);
      for (const sz of [-1, 1]) {
        const tx = -L * 0.4;
        const tz = sz * W * 0.3;
        g.add(box(9, 38, 9, brick, tx, 0, tz));
        g.add(box(7, 4, 7, mat(C.stone), tx, 38, tz));
        const cone = new THREE.Mesh(new THREE.ConeGeometry(4.6, H - 42, 4), spire);
        cone.rotation.y = Math.PI / 4;
        cone.position.set(tx, 42 + (H - 42) / 2, tz);
        g.add(cone);
        const cross = box(0.5, 3, 0.5, mat(C.gold), tx, H, tz);
        g.add(cross);
      }
      g.add(box(4, 26, W * 0.42, brick, -L * 0.42, 0, 0)); // facade between towers
      const rose = new THREE.Mesh(new THREE.CircleGeometry(3.2, 20), mat(C.glass));
      rose.rotation.y = -Math.PI / 2;
      rose.position.set(-L * 0.42 - 2.05, 18, 0);
      g.add(rose);
      break;
    }
    case 'palace': {
      const L = Math.min(Math.max(m.length || 100, 60), 140);
      const W = Math.min(Math.max(m.width || 35, 20), 60);
      const white = mat(C.white);
      g.add(box(L, 4, W, mat(C.stone)));
      g.add(box(L * 0.92, H * 0.68, W * 0.8, white, 0, 4, 0));
      // brise-soleil fins along both long faces
      const finM = mat('#ffffff');
      const n = Math.round(L / 3);
      for (let i = 0; i < n; i++) {
        const x = -L * 0.45 + (i / (n - 1)) * L * 0.9;
        for (const sz of [-1, 1]) g.add(box(0.5, H * 0.6, 1.6, finM, x, 5, sz * (W * 0.4 + 0.8)));
      }
      g.add(box(L * 0.7, H * 0.18, W * 0.62, white, 0, 4 + H * 0.68, 0));
      g.add(box(L * 0.98, 0.9, W * 0.9, white, 0, 4 + H * 0.68, 0)); // canopy roof
      g.add(box(0.4, 14, 0.4, mat('#b0b0b0'), 0, 4 + H * 0.86, 0));
      g.add(box(0.1, 3, 5, mat('#da251d'), 0, 4 + H * 0.86 + 10, 2.6));
      // lawn and fountain in front
      const lawn = new THREE.Mesh(new THREE.CircleGeometry(W * 0.9, 40), mat(C.lawn));
      lawn.rotation.x = -Math.PI / 2;
      lawn.position.set(0, 0.06, -W * 1.4);
      g.add(lawn);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(W * 0.3, 32), mat(C.water));
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(0, 0.1, -W * 1.4);
      g.add(pool);
      break;
    }
    case 'market': {
      const L = Math.min(Math.max(m.length || 120, 60), 140);
      const W = Math.min(Math.max(m.width || 80, 30), 90);
      const wall = mat(C.cream);
      const roof = mat('#c9b07c');
      g.add(box(L, 10, W, wall));
      g.add(gableRoof(L, W, 8, roof, 10));
      g.add(box(L * 0.95, 2, 3, mat(C.gold), 0, 10, 0));
      const tx = -L / 2 - 2;
      g.add(box(9, H - 4, 9, wall, tx, 0, 0));
      g.add(hipRoof(10, 10, 4, roof, H - 4, tx, 0));
      for (const [rx, rz, ry] of [[tx - 4.6, 0, -Math.PI / 2], [tx, 4.6, 0], [tx, -4.6, Math.PI]]) {
        const clock = new THREE.Mesh(new THREE.CircleGeometry(2, 20), mat('#ffffff'));
        clock.position.set(rx, H - 8, rz);
        clock.rotation.y = ry;
        g.add(clock);
      }
      break;
    }
    case 'lighthouse':
    case 'lighthouse-stone': {
      const stone = m.kind === 'lighthouse-stone';
      const shaft = mat(stone ? '#b9b2a5' : C.white);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(stone ? 2.6 : 2.2, stone ? 4.2 : 3.2, H * 0.84, stone ? 16 : 8), shaft);
      t.position.y = H * 0.42;
      g.add(t);
      const gallery = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.6, 16), mat('#2d2d2d'));
      gallery.position.y = H * 0.84;
      g.add(gallery);
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, H * 0.09, 12), new THREE.MeshBasicMaterial({ color: 0xffe39a }));
      lantern.position.y = H * 0.84 + H * 0.045 + 0.3;
      g.add(lantern);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(2.3, H * 0.07, 12), mat('#b73a2c'));
      cap.position.y = H * 0.975;
      g.add(cap);
      g.add(box(10, 4.5, 7, mat(C.white), 7, 0, 0));
      g.add(hipRoof(11, 8, 2.4, mat(C.roofRed), 4.5, 7, 0));
      break;
    }
    case 'statue': {
      const stone = mat('#f3f1ec');
      g.add(box(14, 3, 14, stone));
      g.add(box(9, 5, 9, stone, 0, 3, 0));
      const robe = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 3.1, H * 0.66, 10), stone);
      robe.position.y = 8 + H * 0.33;
      g.add(robe);
      const chest = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.5, H * 0.12, 10), stone);
      chest.position.y = 8 + H * 0.72;
      g.add(chest);
      g.add(box(H * 0.58, 1.6, 1.6, stone, 0, 8 + H * 0.72, 0)); // outstretched arms
      const head = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), stone);
      head.position.y = 8 + H * 0.83;
      g.add(head);
      break;
    }
    case 'cham': {
      const brick = mat(C.brick);
      const dark = mat(C.brickDark);
      const main = towerCham(H / 23, brick, dark);
      g.add(main);
      const side = [[-13, 4], [13, 3], [0, 14]];
      side.forEach(([x, z], i) => {
        const tw = towerCham((H / 23) * (0.55 - i * 0.05), brick, dark);
        tw.position.set(x, 0, z);
        g.add(tw);
      });
      g.add(box(40, 1.2, 34, mat('#d8c9a8'), 0, -1.1, 4));
      break;
    }
    case 'caodai': {
      const L = Math.min(Math.max(m.length || 95, 60), 120);
      const W = Math.min(Math.max(m.width || 26, 18), 40);
      const wall = mat('#f4d986');
      const trim = mat('#e9a3b5');
      const roof = mat('#5b7fc2');
      g.add(box(L, 13, W, wall));
      g.add(hipRoof(L * 1.04, W * 1.1, 7, roof, 13));
      for (const sz of [-1, 1]) {
        const tx = -L / 2 + 5;
        const tz = sz * (W / 2 - 3);
        g.add(box(8, H * 0.62, 8, wall, tx, 0, tz));
        g.add(box(9, 2, 9, trim, tx, H * 0.62, tz));
        g.add(box(6, H * 0.2, 6, wall, tx, H * 0.62 + 2, tz));
        g.add(hipRoof(7.5, 7.5, H * 0.16, roof, H * 0.82 + 2, tx, tz));
      }
      g.add(box(10, H * 0.55, 10, wall, L / 2 - 6, 0, 0));
      g.add(hipRoof(12, 12, 6, roof, H * 0.55, L / 2 - 6, 0));
      const globe = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12), mat('#4a74c9'));
      globe.position.set(L / 2 - 6, H * 0.55 + 8, 0);
      g.add(globe);
      break;
    }
    case 'pagoda':
      g.add(temple(m, C.roofRed, '#f3dca6'));
      break;
    case 'temple-green':
      g.add(temple(m, C.roofGreen, '#f4e7c8'));
      break;
    case 'temple':
      g.add(temple(m, '#a23d2a'));
      break;
    case 'house':
      g.add(temple({ ...m, height: m.height * 0.8 }, '#9a4a33', '#efe6d2'));
      break;
    case 'station': {
      const L = Math.min(Math.max(m.length || 70, 40), 90);
      const W = Math.min(Math.max(m.width || 16, 12), 26);
      const wall = mat('#f2d48c');
      const roof = mat('#a8553b');
      g.add(box(L, 7, W, wall));
      g.add(gableRoof(L, W, 4, roof, 7));
      for (const x of [-L * 0.3, 0, L * 0.3]) {
        g.add(box(13, 9, W * 0.92, wall, x, 0, 0));
        g.add(gableRoof(W * 0.92, 13, H - 9, roof, 9, x, 0, true));
      }
      const clock = new THREE.Mesh(new THREE.CircleGeometry(1.6, 20), mat('#ffffff'));
      clock.position.set(0, 13, -W * 0.46 - 0.05);
      clock.rotation.y = Math.PI;
      g.add(clock);
      break;
    }
    default:
      g.add(temple(m, C.roofRed));
  }
  return g;
}

/* -------------------------------------------------------------- bridges */

interface BridgeModel { group: THREE.Group; anchor: LngLat }

function buildBridge(b: Bridge): BridgeModel {
  const mid = Math.floor(b.line.length / 2);
  const lon0 = (b.line[0][0] + b.line[b.line.length - 1][0]) / 2;
  const lat0 = (b.line[0][1] + b.line[b.line.length - 1][1]) / 2;
  void mid;
  const kx = 111_320 * Math.cos(lat0 * RAD);
  const ky = 110_540;
  // Local metres: x east, z south.
  const pts = b.line.map(([lon, lat]) => new THREE.Vector2((lon - lon0) * kx, -(lat - lat0) * ky));
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const total = cum[cum.length - 1];
  const at = (d: number) => {
    let i = 0;
    while (i < cum.length - 2 && cum[i + 1] < d) i++;
    const t = (d - cum[i]) / Math.max(cum[i + 1] - cum[i], 1e-6);
    return new THREE.Vector2().lerpVectors(pts[i], pts[i + 1], Math.min(Math.max(t, 0), 1));
  };
  const c = total / 2;
  const half = b.span / 2;
  const ramp = Math.max(total / 2 - half - 60, 100);
  const heightAt = (d: number) => {
    const off = Math.abs(d - c);
    if (off <= half + 60) return b.clearance;
    const k = Math.min((off - half - 60) / ramp, 1);
    return 4 + (b.clearance - 4) * (1 - k * k);
  };

  const g = new THREE.Group();
  const deckM = mat('#e2e0da');
  const edgeM = mat('#c9c5bc');
  const pylonM = mat('#cfcbc2');
  const W = 24;
  const steps = Math.max(40, Math.round(total / 30));
  const deck: THREE.BufferGeometry[] = [];
  for (let i = 0; i < steps; i++) {
    const d0 = (i / steps) * total;
    const d1 = ((i + 1) / steps) * total;
    const p0 = at(d0);
    const p1 = at(d1);
    const len = p0.distanceTo(p1);
    const seg = new THREE.BoxGeometry(len + 0.5, 2.6, W);
    const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const h0 = heightAt(d0);
    const h1 = heightAt(d1);
    const pitch = Math.atan2(h1 - h0, len);
    seg.rotateZ(pitch);
    seg.rotateY(-ang);
    seg.translate((p0.x + p1.x) / 2, (h0 + h1) / 2, (p0.y + p1.y) / 2);
    deck.push(seg);
  }
  g.add(new THREE.Mesh(mergeGeometries(deck), deckM));

  // Piers under the approaches.
  for (let d = 40; d < total; d += 80) {
    if (Math.abs(d - c) < half + 20) continue;
    const p = at(d);
    const h = heightAt(d);
    g.add(box(4, h - 1.3, 8, edgeM, p.x, 0, p.y));
  }

  // Pylons (inverted Y) and their cable fans.
  const cables: number[] = [];
  for (const sgn of [-1, 1]) {
    const dP = c + sgn * half;
    const p = at(dP);
    const ahead = at(Math.min(dP + 5, total));
    const dir = new THREE.Vector2().subVectors(ahead, p).normalize();
    const nrm = new THREE.Vector2(-dir.y, dir.x);
    const H = b.pylon;
    const legs = new THREE.Group();
    for (const s of [-1, 1]) {
      const legLen = Math.hypot(H * 0.62, W * 0.75);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(5, legLen, 5), pylonM);
      leg.position.set(0, H * 0.31, s * W * 0.38);
      leg.rotation.x = -s * Math.atan2(W * 0.75, H * 0.62);
      legs.add(leg);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.4, H * 0.4, 5.4), pylonM);
    top.position.y = H * 0.62 + H * 0.2;
    legs.add(top);
    legs.add(box(4, 3, W * 1.05, pylonM, 0, b.clearance - 3, 0));
    legs.position.set(p.x, 0, p.y);
    legs.rotation.y = -Math.atan2(dir.y, dir.x);
    g.add(legs);
    // fans to both deck edges, on both sides of the pylon
    for (let k = 1; k <= 11; k++) {
      const yTop = H * (0.66 + k * 0.026);
      for (const away of [-1, 1]) {
        const d = dP + away * (half * 0.9) * (k / 11);
        const q = at(Math.min(Math.max(d, 0), total));
        const hq = heightAt(d) + 1.3;
        for (const s of [-1, 1]) {
          cables.push(p.x, yTop, p.y, q.x + nrm.x * s * W * 0.45, hq, q.y + nrm.y * s * W * 0.45);
        }
      }
    }
  }
  const cg = new THREE.BufferGeometry();
  cg.setAttribute('position', new THREE.Float32BufferAttribute(cables, 3));
  g.add(new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: 0xe9e4d8 })));
  return { group: g, anchor: [lon0, lat0] };
}

/* ----------------------------------------------------------------- trees */

function treeGeometries() {
  const paint = (geo: THREE.BufferGeometry, color: THREE.Color) => {
    const n = geo.getAttribute('position').count;
    const cols = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) color.toArray(cols, i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return geo;
  };
  const strip = (geo: THREE.BufferGeometry) => {
    const g2 = geo.index ? geo.toNonIndexed() : geo;
    g2.deleteAttribute('uv');
    return g2;
  };
  const trunk = strip(new THREE.CylinderGeometry(0.28, 0.38, 2.4, 6)).translate(0, 1.2, 0);
  paint(trunk, new THREE.Color('#8b6b4a'));
  const a = strip(new THREE.IcosahedronGeometry(2.3, 1)).translate(0, 4.0, 0);
  paint(a, new THREE.Color('#86cc62'));
  const b = strip(new THREE.IcosahedronGeometry(1.6, 1)).translate(0.9, 5.4, 0.4);
  paint(b, new THREE.Color('#9ad877'));
  const round = mergeGeometries([trunk, a, b])!;
  const trunk2 = trunk.clone();
  const cone = strip(new THREE.ConeGeometry(1.9, 5.6, 7)).translate(0, 4.6, 0);
  paint(cone, new THREE.Color('#5fb050'));
  const pine = mergeGeometries([trunk2, cone])!;
  return { round, pine };
}

function pointInRing(x: number, y: number, ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/* ----------------------------------------------------------------- layer */

export function createModels(
  map: MLMap,
  ml: ML,
  data: { monuments: Monument[]; bridges: Bridge[] },
  opts: { onReady?: () => void } = {},
): ModelsHandle {
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9c0ad, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-0.6, 1.4, -0.9);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.45);
  fill.position.set(0.8, 0.6, 1);
  scene.add(fill);

  type Item = { obj: THREE.Object3D; at: LngLat; minZoom: number; radiusKm: number; rot: number; scale: (z: number) => number };
  const items: Item[] = [];

  for (const m of data.monuments) {
    const obj = buildMonument(m);
    items.push({ obj, at: [m.lon, m.lat], minZoom: 12.6, radiusKm: 8, rot: -(m.bearing - 90) * RAD, scale: () => 1.12 });
  }
  for (const b of data.bridges) {
    const { group, anchor } = buildBridge(b);
    items.push({ obj: group, at: anchor, minZoom: 10.6, radiusKm: 30, rot: 0, scale: () => 1 });
  }

  const van = buildVan();
  const car: Item & { on: boolean; heading: number } = {
    obj: van, at: [0, 0], minZoom: 0, radiusKm: Infinity, rot: 0, on: false, heading: 0,
    // Readable at every zoom: ~58 px long far out, ~30 px close in, never smaller than life.
    scale: (z) => {
      const lat = car.at[1] * RAD;
      const mpp = (40075016.686 * Math.cos(lat)) / (512 * 2 ** z);
      const px = z <= 10 ? 58 : z >= 15 ? 30 : 58 - ((z - 10) / 5) * 28;
      return Math.max(1, (px * mpp) / VAN_LENGTH);
    },
  };

  // Trees: one instanced batch per shape, anchored where they were scattered.
  const { round, pine } = treeGeometries();
  const treeMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const MAX_TREES = 3200;
  const rounds = new THREE.InstancedMesh(round, treeMat, MAX_TREES);
  const pines = new THREE.InstancedMesh(pine, treeMat, Math.round(MAX_TREES / 3));
  rounds.count = 0;
  pines.count = 0;
  rounds.frustumCulled = false;
  pines.frustumCulled = false;
  const forest = new THREE.Group();
  forest.add(rounds, pines);
  const trees: Item = { obj: forest, at: [0, 0], minZoom: 14.4, radiusKm: 3, rot: 0, scale: () => 1 };

  for (const it of [...items, car, trees]) {
    it.obj.visible = false;
    scene.add(it.obj);
  }

  let renderer: THREE.WebGLRenderer | null = null;
  const rotX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const tmpM = new THREE.Matrix4();
  const tmpL = new THREE.Matrix4();
  const tmpR = new THREE.Matrix4();
  const tmpV = new THREE.Vector3();

  const nearCenter = (at: LngLat, km: number) => {
    if (!Number.isFinite(km)) return true;
    const c = map.getCenter();
    const dx = (at[0] - c.lng) * 111.32 * Math.cos(c.lat * RAD);
    const dy = (at[1] - c.lat) * 110.54;
    return dx * dx + dy * dy < km * km;
  };

  const layer: CustomLayerInterface = {
    id: 'jm-models',
    type: 'custom',
    renderingMode: '3d',
    onAdd(_map, gl) {
      renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
      renderer.autoClear = false;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      opts.onReady?.();
    },
    render(_gl, args) {
      if (!renderer) return;
      const z = map.getZoom();
      // MapLibre passes { defaultProjectionData: { mainMatrix } }; Mapbox passes the matrix itself.
      const a = args as unknown as ArrayLike<number> | { defaultProjectionData: { mainMatrix: ArrayLike<number> } };
      const main = 'defaultProjectionData' in a ? a.defaultProjectionData.mainMatrix : a;
      tmpM.fromArray(main as number[]);
      const list: Item[] = [];
      for (const it of items) if (z >= it.minZoom && nearCenter(it.at, it.radiusKm)) list.push(it);
      if (car.on) list.push(car);
      if (z >= trees.minZoom && (rounds.count || pines.count) && nearCenter(trees.at, trees.radiusKm)) list.push(trees);
      if (!list.length) return;
      renderer.resetState();
      for (const it of list) {
        const elev = map.queryTerrainElevation(it.at) ?? 0;
        const mc = ml.MercatorCoordinate.fromLngLat(it.at, elev);
        const s = mc.meterInMercatorCoordinateUnits() * it.scale(z);
        tmpL.makeTranslation(mc.x, mc.y, mc.z ?? 0)
          .multiply(tmpR.makeScale(s, -s, s))
          .multiply(rotX)
          .multiply(tmpR.makeRotationY(it === car ? -car.heading * RAD : it.rot));
        camera.projectionMatrix.copy(tmpM).multiply(tmpL);
        for (const other of [...items, car, trees]) other.obj.visible = other === it;
        renderer.render(scene, camera);
      }
    },
  };

  let lastKey = '';
  const handle: ModelsHandle = {
    layer,
    setCar(pos, heading) {
      if (!pos) { car.on = false; map.triggerRepaint(); return; }
      car.on = true;
      car.at = pos;
      car.heading = heading;
      map.triggerRepaint();
    },
    refreshTrees() {
      const z = map.getZoom();
      if (z < trees.minZoom - 0.4) { rounds.count = 0; pines.count = 0; lastKey = ''; return; }
      const c = map.getCenter();
      const key = `${c.lng.toFixed(3)},${c.lat.toFixed(3)},${z.toFixed(1)}`;
      if (key === lastKey) return;
      lastKey = key;
      const lon0 = c.lng;
      const lat0 = c.lat;
      const kx = 111_320 * Math.cos(lat0 * RAD);
      const ky = 110_540;
      const b = map.getBounds();
      const radius = 1400; // metres around the centre
      const feats = [
        ...map.querySourceFeatures('openmaptiles', { sourceLayer: 'park' }),
        ...map.querySourceFeatures('openmaptiles', { sourceLayer: 'landcover', filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass']]] }),
      ];
      let nr = 0;
      let np = 0;
      const elev0 = map.queryTerrainElevation([lon0, lat0]) ?? 0;
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const seen = new Set<string>();
      for (const f of feats) {
        const geom = f.geometry;
        const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
        for (const poly of polys) {
          const outer = poly[0] as number[][];
          if (!outer || outer.length < 4) continue;
          let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
          for (const [x, y] of outer) { if (x < w) w = x; if (x > e) e = x; if (y < s) s = y; if (y > n) n = y; }
          if (e < b.getWest() || w > b.getEast() || n < b.getSouth() || s > b.getNorth()) continue;
          const key = `${w.toFixed(5)},${s.toFixed(5)},${e.toFixed(5)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const areaM2 = (e - w) * kx * (n - s) * ky;
          const want = Math.min(Math.round(areaM2 / 160), 900);
          const rnd = seeded(Math.round(w * 1e5) ^ Math.round(s * 1e5));
          for (let k = 0; k < want * 2 && nr + np < MAX_TREES; k++) {
            const x = w + rnd() * (e - w);
            const y = s + rnd() * (n - s);
            if (!pointInRing(x, y, outer)) continue;
            if (poly.slice(1).some((hole) => pointInRing(x, y, hole as number[][]))) continue;
            const dx = (x - lon0) * kx;
            const dz = -(y - lat0) * ky;
            if (dx * dx + dz * dz > radius * radius) continue;
            const elev = (map.queryTerrainElevation([x, y]) ?? elev0) - elev0;
            const sc = 0.75 + rnd() * 0.6;
            q.setFromAxisAngle(tmpV.set(0, 1, 0), rnd() * Math.PI * 2);
            m4.compose(tmpV.set(dx, elev, dz), q, new THREE.Vector3(sc, sc * (0.85 + rnd() * 0.3), sc));
            if (rnd() < 0.22 && np < pines.instanceMatrix.count) pines.setMatrixAt(np++, m4);
            else if (nr < MAX_TREES) rounds.setMatrixAt(nr++, m4);
          }
        }
      }
      rounds.count = nr;
      pines.count = np;
      rounds.instanceMatrix.needsUpdate = true;
      pines.instanceMatrix.needsUpdate = true;
      trees.at = [lon0, lat0];
      map.triggerRepaint();
    },
  };
  return handle;
}
