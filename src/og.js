/**
 * Generates the social preview image (og.png) at build time.
 *
 * Why hand-roll a PNG encoder instead of using a headless browser or an
 * image library? Because an OG image is the one asset you can't skip —
 * LinkedIn, Slack and X all show a blank card without it — and pulling in
 * Puppeteer or sharp for a single 1200x630 image would dominate both the
 * dependency tree and CI time. Node's zlib is enough to write a valid PNG.
 *
 * The result is a clean typographic card. Replace public/og.png with a real
 * design whenever you like — the build leaves an existing file alone unless
 * you delete it.
 */
import zlib from "node:zlib";

const WIDTH = 1200;
const HEIGHT = 630;

/* --------------------------------------------------------------------------
 * A 5x7 bitmap font. Each glyph is 7 rows of 5 bits (MSB = leftmost pixel).
 * Uppercase only — which suits the all-caps card layout. Covers Latin and
 * Mongolian Cyrillic, so the Mongolian card renders rather than showing a
 * blank gap (unknown glyphs silently fall back to the space glyph).
 * ------------------------------------------------------------------------ */
const FONT = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  0: [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  1: [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  2: [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  3: [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  4: [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  5: [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  6: [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  7: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  8: [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  9: [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  " ": [0, 0, 0, 0, 0, 0, 0],
  ".": [0, 0, 0, 0, 0, 0x0c, 0x0c],
  ",": [0, 0, 0, 0, 0x0c, 0x0c, 0x08],
  "-": [0, 0, 0, 0x1f, 0, 0, 0],
  "/": [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
  "'": [0x0c, 0x0c, 0x08, 0, 0, 0, 0],
  "&": [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d],
  "!": [0x04, 0x04, 0x04, 0x04, 0x04, 0, 0x04],
  "?": [0x0e, 0x11, 0x01, 0x02, 0x04, 0, 0x04],
  ":": [0, 0x0c, 0x0c, 0, 0x0c, 0x0c, 0],

  // --- Mongolian Cyrillic (uppercase). drawText() upper-cases input, so
  // lowercase Cyrillic maps here too. 35 letters: А-Я, plus Ё (U+0401, which
  // is outside the А-Я range) and the Mongolian-specific Ө and Ү.
  "А": [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  "Б": [0x1f, 0x10, 0x10, 0x1e, 0x11, 0x11, 0x1e],
  "В": [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  "Г": [0x1f, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10],
  "Д": [0x0e, 0x0a, 0x0a, 0x0a, 0x0a, 0x1f, 0x11],
  "Е": [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  "Ё": [0x0a, 0x1f, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  "Ж": [0x15, 0x15, 0x15, 0x1f, 0x15, 0x15, 0x15],
  "З": [0x0e, 0x11, 0x01, 0x06, 0x01, 0x11, 0x0e],
  "И": [0x11, 0x11, 0x13, 0x15, 0x19, 0x11, 0x11],
  "Й": [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x11],
  "К": [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  "Л": [0x07, 0x09, 0x09, 0x09, 0x09, 0x09, 0x11],
  "М": [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  "Н": [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  "О": [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  "П": [0x1f, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11],
  "Р": [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  "С": [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  "Т": [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  "У": [0x11, 0x11, 0x0a, 0x04, 0x04, 0x08, 0x10],
  "Ф": [0x04, 0x0e, 0x15, 0x15, 0x15, 0x0e, 0x04],
  "Х": [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  "Ц": [0x11, 0x11, 0x11, 0x11, 0x11, 0x1f, 0x01],
  "Ч": [0x11, 0x11, 0x11, 0x0f, 0x01, 0x01, 0x01],
  "Ш": [0x15, 0x15, 0x15, 0x15, 0x15, 0x15, 0x1f],
  "Щ": [0x15, 0x15, 0x15, 0x15, 0x15, 0x1f, 0x01],
  "Ъ": [0x18, 0x08, 0x08, 0x0e, 0x09, 0x09, 0x0e],
  "Ы": [0x11, 0x11, 0x11, 0x1d, 0x13, 0x13, 0x1d],
  "Ь": [0x10, 0x10, 0x10, 0x1e, 0x11, 0x11, 0x1e],
  "Э": [0x0e, 0x11, 0x01, 0x07, 0x01, 0x11, 0x0e],
  "Ю": [0x17, 0x15, 0x15, 0x1d, 0x15, 0x15, 0x17],
  "Я": [0x0f, 0x11, 0x11, 0x0f, 0x05, 0x09, 0x11],
  "Ө": [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x0e],
  "Ү": [0x11, 0x11, 0x11, 0x0e, 0x04, 0x04, 0x04],
  "—": [0, 0, 0, 0x1f, 0, 0, 0],
  "(": [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ")": [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
};

/* --------------------------------------------------------------------------
 * PNG encoding
 * ------------------------------------------------------------------------ */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(pixels, width, height) {
  // Raw scanlines: each row prefixed with filter type 0 (None).
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* --------------------------------------------------------------------------
 * Drawing helpers
 * ------------------------------------------------------------------------ */
function makeCanvas(width, height) {
  const pixels = Buffer.alloc(width * height * 3);

  return {
    pixels,
    set(x, y, [r, g, b], alpha = 1) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const i = (y * width + x) * 3;
      if (alpha >= 1) {
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
      } else {
        pixels[i] += (r - pixels[i]) * alpha;
        pixels[i + 1] += (g - pixels[i + 1]) * alpha;
        pixels[i + 2] += (b - pixels[i + 2]) * alpha;
      }
    },
    rect(x, y, w, h, color) {
      for (let dy = 0; dy < h; dy++)
        for (let dx = 0; dx < w; dx++) this.set(x + dx, y + dy, color);
    },
  };
}

/**
 * Draw a string using the bitmap font.
 * `scale` is the pixel size of one font "dot", so the cap height is scale*7.
 */
function drawText(canvas, text, x, y, scale, color, letterSpacing = 1) {
  let cursor = x;
  for (const rawChar of String(text).toUpperCase()) {
    const glyph = FONT[rawChar] || FONT[" "];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if ((glyph[row] >> (4 - col)) & 1) {
          canvas.rect(cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += (5 + letterSpacing) * scale;
  }
  return cursor - x; // width drawn
}

function textWidth(text, scale, letterSpacing = 1) {
  return String(text).length * (5 + letterSpacing) * scale - letterSpacing * scale;
}

/** Shrink the scale until the text fits inside maxWidth. */
function fitScale(text, maxWidth, startScale, letterSpacing = 1) {
  let scale = startScale;
  while (scale > 1 && textWidth(text, scale, letterSpacing) > maxWidth) scale--;
  return scale;
}

/* --------------------------------------------------------------------------
 * The card
 * ------------------------------------------------------------------------ */
export function generateOgImage({ name, role, url }) {
  const canvas = makeCanvas(WIDTH, HEIGHT);

  const BG = [12, 13, 17];
  const ACCENT = [122, 122, 240];
  const WHITE = [244, 245, 249];
  const MUTED = [140, 148, 166];

  // Base background
  canvas.rect(0, 0, WIDTH, HEIGHT, BG);

  // Soft accent glow in the upper-left, falling off with distance.
  const glowX = 170;
  const glowY = 120;
  const glowRadius = 620;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const dx = x - glowX;
      const dy = y - glowY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > glowRadius) continue;
      const t = 1 - dist / glowRadius;
      canvas.set(x, y, ACCENT, t * t * 0.17);
    }
  }

  // Fine grid lines, kept very low contrast — texture, not decoration.
  for (let x = 0; x < WIDTH; x += 40) {
    for (let y = 0; y < HEIGHT; y++) canvas.set(x, y, WHITE, 0.022);
  }
  for (let y = 0; y < HEIGHT; y += 40) {
    for (let x = 0; x < WIDTH; x++) canvas.set(x, y, WHITE, 0.022);
  }

  const PAD = 90;

  // Accent rule above the name
  canvas.rect(PAD, 214, 64, 6, ACCENT);

  // Name — the dominant element
  const nameScale = fitScale(name, WIDTH - PAD * 2, 13);
  drawText(canvas, name, PAD, 260, nameScale, WHITE);

  // Role
  const roleScale = fitScale(role, WIDTH - PAD * 2, 6);
  drawText(canvas, role, PAD, 260 + nameScale * 7 + 52, roleScale, ACCENT);

  // URL along the bottom
  const host = String(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
  const hostScale = fitScale(host, WIDTH - PAD * 2, 4);
  drawText(canvas, host, PAD, HEIGHT - PAD - hostScale * 7, hostScale, MUTED);

  // Accent bar down the right edge
  canvas.rect(WIDTH - 10, 0, 10, HEIGHT, ACCENT);

  return encodePng(canvas.pixels, WIDTH, HEIGHT);
}

/**
 * A 180x180 touch icon: accent background with the initial(s) centred.
 * Used for apple-touch-icon.png and the web manifest.
 */
export function generateIcon(label, size = 180) {
  const canvas = makeCanvas(size, size);

  const ACCENT = [79, 79, 208];
  const WHITE = [255, 255, 255];

  canvas.rect(0, 0, size, size, ACCENT);

  // Subtle vertical lift so the icon doesn't read as a flat block.
  for (let y = 0; y < size; y++) {
    const t = y / size;
    for (let x = 0; x < size; x++) canvas.set(x, y, [0, 0, 0], t * 0.18);
  }

  const initial = String(label || "?").trim().charAt(0).toUpperCase();
  const scale = fitScale(initial, size * 0.5, 14);
  const width = textWidth(initial, scale);

  drawText(canvas, initial, Math.round((size - width) / 2), Math.round((size - scale * 7) / 2), scale, WHITE);

  return encodePng(canvas.pixels, size, size);
}
