// Generates src/app/favicon.ico (PNG-in-ICO, 32x32 + 16x16) and public/icon-192.png / icon-512.png
// without any native dependency. Run: node scripts/make-favicon.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------- tiny PNG encoder ----------
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- rasterizer (coordinates in the 48x48 logo space) ----------
const GREEN = [0x2e, 0x9e, 0x44];
const WHITE = [0xff, 0xff, 0xff];
const ORANGE = [0xf5, 0x9e, 0x0b];

function insideRoundedRect(x, y, w, h, r) {
  if (x < 0 || y < 0 || x > w || y > h) return false;
  const cx = Math.min(Math.max(x, r), w - r);
  const cy = Math.min(Math.max(y, r), h - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}
// basket trapezoid: top edge (11,20)-(37,20), bottom (13.5,36)-(34.5,36)
function insideBasket(x, y) {
  if (y < 20 || y > 36) return false;
  const t = (y - 20) / 16;
  const left = 11 + 2.5 * t;
  const right = 37 - 2.5 * t;
  return x >= left && x <= right;
}
function nearSegment(px, py, x1, y1, x2, y2, halfW) {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const ex = x1 + t * dx, ey = y1 + t * dy;
  return (px - ex) ** 2 + (py - ey) ** 2 <= halfW * halfW;
}
function sample(x, y) {
  // returns [r,g,b,a]
  if (!insideRoundedRect(x, y, 48, 48, 12)) return [0, 0, 0, 0];
  if ((x - 35.5) ** 2 + (y - 11.5) ** 2 <= 25) return [...ORANGE, 255];
  if (insideBasket(x, y)) {
    if (nearSegment(x, y, 17, 26, 31, 26, 0.9) || nearSegment(x, y, 18, 30, 30, 30, 0.9)) return [0x8f, 0xcf, 0x9d, 255];
    return [...WHITE, 255];
  }
  if (nearSegment(x, y, 19, 20, 23.5, 12, 1.3) || nearSegment(x, y, 29, 20, 24.5, 12, 1.3)) return [...WHITE, 255];
  return [...GREEN, 255];
}
function render(size) {
  const ss = 4; // supersampling
  const out = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const x = ((px + (sx + 0.5) / ss) / size) * 48;
          const y = ((py + (sy + 0.5) / ss) / size) * 48;
          const [cr, cg, cb, ca] = sample(x, y);
          r += cr * ca; g += cg * ca; b += cb * ca; a += ca;
        }
      }
      const n = ss * ss;
      const i = (py * size + px) * 4;
      if (a > 0) {
        out[i] = Math.round(r / a);
        out[i + 1] = Math.round(g / a);
        out[i + 2] = Math.round(b / a);
      }
      out[i + 3] = Math.round(a / n);
    }
  }
  return out;
}

// ---------- ICO container ----------
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = [];
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;
    e[1] = size >= 256 ? 0 : size;
    e[2] = 0; e[3] = 0;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const sizes = [16, 32, 48];
const pngs = sizes.map((s) => ({ size: s, data: encodePNG(s, s, render(s)) }));
mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "src/app/favicon.ico"), ico(pngs));
writeFileSync(join(root, "public/icon-192.png"), encodePNG(192, 192, render(192)));
writeFileSync(join(root, "public/icon-512.png"), encodePNG(512, 512, render(512)));
console.log("favicon.ico (16/32/48) + icon-192.png + icon-512.png generated");
