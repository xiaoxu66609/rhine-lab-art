// Paper-edge plates for the fourteen studies. Motion code is not involved.
// Screenshots are copied from the promo site; type plates do not invent a product UI.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { plates, studies } from '../src/content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const promo = path.join(root, 'src/assets/promo');
const outDir = path.join(root, 'src/assets/rhine');
const ink = '#1A1917';
const paper = '#F1EFE9';
const blue = '#2E44FF';
const quiet = '#4A4842';
const mute = '#6F6D66';

const frames = [
  [{ file: 'skin-paper-edge-preview.png', fit: 'cover' }],
  [{ file: 'app-home.png', fit: 'cover' }],
  null,
  null,
  null,
  null,
  null,
  [{ file: 'skin-flat-preview.png', fit: 'cover', label: 'FLAT 2.0' }, { file: 'skin-paper-edge-preview.png', fit: 'cover', label: 'PAPER EDGE' }],
  [{ file: 'exam-calendar.png', fit: 'contain' }],
  [{ file: 'weekly-audit.png', fit: 'cover' }],
  null,
  null,
  null,
  [{ file: 'logo.png', fit: 'contain' }]
];

const esc = value => String(value).replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));

function text(x, y, value, { size = 28, weight = 400, fill = ink, anchor = 'start', spacing = 0 } = {}) {
  return `<text x="${x}" y="${y}" font-family="MiSans" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${esc(value)}</text>`;
}

function frame(x, y, w, h, label) {
  const shadow = `<rect x="${x + 12}" y="${y + 12}" width="${w}" height="${h}" fill="${ink}"/>`;
  const labelText = label ? text(x, y + h + 36, label, { size: 16, weight: 700, fill: blue, spacing: 1.5 }) : '';
  return shadow + labelText;
}

function layout(index) {
  const shots = frames[index];
  if (!shots) return { shots: [], boxes: [] };
  if (shots.length === 1) return { shots, boxes: [{ x: 690, y: 230, w: 820, h: 500 }] };
  return {
    shots,
    boxes: [
      { x: 690, y: 210, w: 400, h: 430 },
      { x: 1120, y: 210, w: 400, h: 430 }
    ]
  };
}

async function plate(spec, study) {
  const number = String(spec.index + 1).padStart(2, '0');
  const { shots, boxes } = layout(spec.index);
  const parts = [
    `<rect width="1600" height="900" fill="${paper}"/>`,
    `<rect width="1600" height="14" fill="${ink}"/>`,
    `<rect x="72" y="78" width="28" height="28" fill="${blue}"/>`,
    text(116, 100, number, { size: 22, weight: 700 }),
    text(176, 100, spec.kicker, { size: 18, weight: 700, fill: mute, spacing: 2.4 }),
    text(72, shots.length ? 250 : 340, spec.name, { size: shots.length ? 76 : 96, weight: 700 }),
    text(72, shots.length ? 310 : 410, spec.line, { size: 28, fill: quiet })
  ];
  if (!shots.length) {
    parts.push(
      `<rect x="760" y="250" width="748" height="390" fill="${ink}"/>`,
      `<rect x="748" y="238" width="748" height="390" fill="${paper}" stroke="${ink}" stroke-width="2"/>`,
      text(788, 360, number, { size: 120, weight: 700, fill: blue }),
      text(788, 470, spec.line, { size: 28, fill: ink }),
      text(788, 540, 'PAPER EDGE', { size: 16, weight: 700, fill: mute, spacing: 2 })
    );
  }
  for (let i = 0; i < boxes.length; i++) parts.push(frame(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h, shots[i].label));
  parts.push(
    `<rect x="72" y="820" width="1456" height="2" fill="${ink}"/>`,
    text(72, 864, 'PAPER EDGE', { size: 16, weight: 700, spacing: 1.6 }),
    text(1528, 864, `STUDY ${number}  /  PROJECT X`, { size: 16, weight: 700, fill: blue, anchor: 'end', spacing: 1.2 })
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">${parts.join('')}</svg>`;
  let image = sharp(Buffer.from(svg));
  const overlays = [];
  for (let i = 0; i < shots.length; i++) {
    const box = boxes[i];
    const input = await sharp(path.join(promo, shots[i].file))
      .resize(box.w - 4, box.h - 4, { fit: shots[i].fit, position: 'centre', background: paper })
      .png()
      .toBuffer();
    overlays.push({ input, left: box.x + 2, top: box.y + 2 });
  }
  if (overlays.length) image = sharp(await image.png().toBuffer()).composite(overlays);
  const stroke = shots.length
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">${boxes.map(box => `<rect x="${box.x + 1}" y="${box.y + 1}" width="${box.w - 2}" height="${box.h - 2}" fill="none" stroke="${ink}" stroke-width="2"/>`).join('')}</svg>`
    : null;
  if (stroke) image = sharp(await image.png().toBuffer()).composite([{ input: Buffer.from(stroke), left: 0, top: 0 }]);
  const file = path.join(outDir, `${number}.png`);
  await image.png().toFile(file);
  const meta = await sharp(file).metadata();
  if (meta.width !== 1600 || meta.height !== 900) throw new Error(`${number} is ${meta.width}x${meta.height}`);
  const sha256 = crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
  return {
    id: spec.index + 1,
    en: spec.name.toUpperCase(),
    name: spec.name,
    slug: study.slug,
    kicker: spec.kicker,
    line: spec.line,
    plate: 'paper-edge',
    screenshots: shots.map(shot => `src/assets/promo/${shot.file}`),
    source: study.projectURL,
    note: shots.length
      ? 'Paper-edge plate. Promo-site screenshot framed with a hard offset; the picture is not redrawn.'
      : 'Paper-edge type plate. No product interface was invented for this study.',
    width: 1600,
    height: 900,
    sha256,
    status: 'composed'
  };
}

async function withMiSans(run) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'misans-'));
  const cache = path.join(dir, 'cache');
  await fs.mkdir(cache);
  for (const weight of ['regular', 'bold']) {
    const from = path.join(root, 'src/boot/fonts', `${weight}.woff2`);
    const to = path.join(dir, `MiSans-${weight}.ttf`);
    const converted = spawnSync('python3', ['-m', 'fontTools.ttLib.woff2', 'decompress', from, '-o', to], { encoding: 'utf8' });
    if (converted.status !== 0) throw new Error(converted.stderr || 'MiSans decompress failed');
  }
  const config = path.join(dir, 'fonts.conf');
  await fs.writeFile(config, `<?xml version="1.0"?>\n<fontconfig><dir>${dir}</dir><cachedir>${cache}</cachedir></fontconfig>\n`);
  const cached = spawnSync('fc-cache', ['-f', dir], { encoding: 'utf8', env: { ...process.env, FONTCONFIG_FILE: config } });
  if (cached.status !== 0) throw new Error(cached.stderr || 'fc-cache failed');
  const previous = process.env.FONTCONFIG_FILE;
  process.env.FONTCONFIG_FILE = config;
  try { return await run(); }
  finally {
    if (previous === undefined) delete process.env.FONTCONFIG_FILE;
    else process.env.FONTCONFIG_FILE = previous;
    await fs.rm(dir, { recursive: true, force: true });
  }
}

if (plates.length !== 14 || frames.length !== 14 || studies.length !== 14) throw new Error('plate count');
const sources = await withMiSans(() => Promise.all(plates.map((spec, index) => {
  if (spec.name !== studies[index].name) throw new Error(`plate ${index} does not match ${studies[index].name}`);
  return plate(spec, studies[index]);
})));
await fs.writeFile(path.join(outDir, 'sources.json'), JSON.stringify(sources, null, 2) + '\n');
console.log(`paper plates ${sources.length}; shaders and scene timing were not touched.`);
