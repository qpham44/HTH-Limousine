/**
 * Map icons drawn on a canvas at run time: Apple-Maps-style photo bubbles,
 * the starting-point pin, summit and sight glyphs. Everything is drawn at 2×
 * and registered with pixelRatio 2 so it stays sharp on retina screens.
 */

export interface Drawn {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

const DPR = 2;

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w * DPR;
  c.height = h * DPR;
  const ctx = c.getContext('2d')!;
  ctx.scale(DPR, DPR);
  return { c, ctx };
}

function done(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Drawn {
  const d = ctx.getImageData(0, 0, c.width, c.height);
  return { width: c.width, height: c.height, data: d.data };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * A round photograph with a white rim, a soft shadow and a short tail that
 * points at the place. `badge` draws a numbered disc on the rim.
 */
export function photoBubble(
  img: HTMLImageElement | null,
  opts: { size: number; ring: string; accent?: string; badge?: string; fallback?: string },
): Drawn {
  const { size, ring } = opts;
  const pad = 8;
  const tail = Math.round(size * 0.16);
  const w = size + pad * 2;
  const h = size + pad * 2 + tail;
  const { c, ctx } = canvas(w, h);
  const cx = w / 2;
  const cy = pad + size / 2;
  const r = size / 2;

  // Shadow + rim + tail in one shape.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 2.5;
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.moveTo(cx - tail * 0.62, cy + r - 2);
  ctx.lineTo(cx, cy + r + tail);
  ctx.lineTo(cx + tail * 0.62, cy + r - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Photo.
  const rim = Math.max(2.5, size * 0.065);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - rim, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    ctx.drawImage(img, cx - r + rim, cy - r + rim, (r - rim) * 2, (r - rim) * 2);
  } else {
    ctx.fillStyle = opts.fallback ?? '#c8bfae';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();

  if (opts.accent) {
    ctx.strokeStyle = opts.accent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r - rim + 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (opts.badge) {
    const br = Math.max(8, size * 0.2);
    const bx = cx + r * 0.74;
    const by = cy - r * 0.74;
    ctx.fillStyle = opts.accent ?? '#D69E4A';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.round(br * 1.15)}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.badge, bx, by + 0.5);
  }
  return done(c, ctx);
}

/** A coloured disc with a white glyph (12-unit SVG path centred on 0,0). */
export function glyphDisc(path: string, opts: { size: number; fill: string; stroke?: string; badge?: string }): Drawn {
  const { size } = opts;
  const pad = 4;
  const w = size + pad * 2;
  const { c, ctx } = canvas(w, w);
  const cx = w / 2;
  const r = size / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1.2;
  ctx.fillStyle = opts.fill;
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cx, r - 0.8, 0, Math.PI * 2);
  ctx.stroke();
  if (opts.badge) {
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.round(size * 0.52)}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.badge, cx, cx + 0.5);
  } else {
    const k = (size * 0.62) / 12;
    ctx.save();
    ctx.translate(cx, cx);
    ctx.scale(k, k);
    ctx.strokeStyle = opts.stroke ?? '#ffffff';
    ctx.lineWidth = 1.5 / k * (size / 22);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(new Path2D(path));
    ctx.restore();
  }
  return done(c, ctx);
}

/** The starting point: a red teardrop pin with a white core, as on the earlier map. */
export function originPin(size = 34): Drawn {
  const w = size;
  const h = Math.round(size * 1.32);
  const { c, ctx } = canvas(w, h);
  const cx = w / 2;
  const r = w / 2 - 3;
  const cy = r + 3;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#ef5350');
  g.addColorStop(1, '#b3261e');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx, h - 2);
  ctx.bezierCurveTo(cx - r * 0.35, h - r * 0.9, cx - r, cy + r * 0.55, cx - r, cy);
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.bezierCurveTo(cx + r, cy + r * 0.55, cx + r * 0.35, h - r * 0.9, cx, h - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
  return done(c, ctx);
}

/** A small summit triangle. */
export function peakMark(size = 16): Drawn {
  const { c, ctx } = canvas(size, size);
  ctx.fillStyle = '#7a5a3a';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(size / 2, 2);
  ctx.lineTo(size - 2, size - 3);
  ctx.lineTo(2, size - 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  return done(c, ctx);
}

/** The car that drives the chosen road: a white disc with a gold core. */
export function carMark(size = 22): Drawn {
  const { c, ctx } = canvas(size, size);
  const cx = size / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cx, size / 2 - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#e09a2e';
  ctx.beginPath();
  ctx.arc(cx, cx, size / 2 - 7, 0, Math.PI * 2);
  ctx.fill();
  return done(c, ctx);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * HTH's limousine seen from above, nose pointing north, so the map can turn it
 * with the road (icon-rotate = heading). Black body, gold trim, lit headlights.
 */
export function limoMark(): Drawn {
  const w = 30;
  const h = 56;
  const { c, ctx } = canvas(w, h);
  const bx = 8;
  const by = 6;
  const bw = 14;
  const bh = 44;

  // Headlight beams ahead of the car.
  const beam = ctx.createLinearGradient(0, 0, 0, by + 4);
  beam.addColorStop(0, 'rgba(255, 236, 180, 0)');
  beam.addColorStop(1, 'rgba(255, 236, 180, 0.55)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(bx + 1, by + 2);
  ctx.lineTo(bx - 3, 0);
  ctx.lineTo(bx + bw + 3, 0);
  ctx.lineTo(bx + bw - 1, by + 2);
  ctx.closePath();
  ctx.fill();

  // Body with a gold glow so it reads on dark imagery.
  ctx.save();
  ctx.shadowColor = 'rgba(232, 170, 70, 0.85)';
  ctx.shadowBlur = 6;
  const body = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  body.addColorStop(0, '#26262b');
  body.addColorStop(0.5, '#0b0b0d');
  body.addColorStop(1, '#26262b');
  ctx.fillStyle = body;
  roundRect(ctx, bx, by, bw, bh, 5);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#D69E4A';
  ctx.lineWidth = 1.1;
  roundRect(ctx, bx, by, bw, bh, 5);
  ctx.stroke();

  // Windscreen, roof, rear window.
  ctx.fillStyle = 'rgba(140, 170, 205, 0.9)';
  ctx.beginPath();
  ctx.moveTo(bx + 2, by + 13);
  ctx.lineTo(bx + 3.5, by + 8.5);
  ctx.lineTo(bx + bw - 3.5, by + 8.5);
  ctx.lineTo(bx + bw - 2, by + 13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#17171b';
  roundRect(ctx, bx + 2, by + 13.5, bw - 4, 21, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(140, 170, 205, 0.75)';
  roundRect(ctx, bx + 3, by + 35.5, bw - 6, 3.5, 1);
  ctx.fill();
  // Gold pinstripe down the roof.
  ctx.strokeStyle = 'rgba(214, 158, 74, 0.9)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(bx + bw / 2, by + 15);
  ctx.lineTo(bx + bw / 2, by + 33);
  ctx.stroke();

  // Headlights and tail lights.
  ctx.fillStyle = '#fff3c8';
  ctx.fillRect(bx + 1.5, by + 0.6, 3, 1.6);
  ctx.fillRect(bx + bw - 4.5, by + 0.6, 3, 1.6);
  ctx.fillStyle = '#ff3b30';
  ctx.fillRect(bx + 1.5, by + bh - 2, 3, 1.4);
  ctx.fillRect(bx + bw - 4.5, by + bh - 2, 3, 1.4);
  return done(c, ctx);
}
