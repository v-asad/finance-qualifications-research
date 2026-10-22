// Renders the app icon SVG into the PNG sizes iOS/Android/manifest need.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const mark = (scale = 1) => {
  // Three ascending ledger bars and a gold "target" dot, centred in a 512 box.
  const s = (v) => 256 + (v - 256) * scale;
  const bar = (x, y, h) => `<rect x="${s(x)}" y="${s(y)}" width="${64 * scale}" height="${h * scale}" rx="${22 * scale}" fill="#fff"/>`;
  return `
    ${bar(140, 300, 92)}
    ${bar(224, 238, 154)}
    ${bar(308, 170, 222)}
    <circle cx="${s(340)}" cy="${s(118)}" r="${26 * scale}" fill="#FBBF24"/>
    <rect x="${s(118)}" y="${s(412)}" width="${276 * scale}" height="${14 * scale}" rx="${7 * scale}" fill="#BFD4FF"/>`;
};

const svg = ({ rounded, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3A6CF4"/><stop offset="1" stop-color="#1B3FA8"/></linearGradient></defs>
  <rect width="512" height="512" ${rounded ? 'rx="112"' : ''} fill="url(#g)"/>
  ${mark(scale)}
</svg>`;

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/favicon.svg', svg({ rounded: true, scale: 1 }));
const jobs = [
  ['public/icons/icon-192.png', 192, { rounded: true, scale: 1 }],
  ['public/icons/icon-512.png', 512, { rounded: true, scale: 1 }],
  ['public/icons/maskable-512.png', 512, { rounded: false, scale: 0.78 }],
  ['public/icons/apple-touch-icon.png', 180, { rounded: false, scale: 0.9 }],
  ['public/icons/badge-96.png', 96, { rounded: false, scale: 1 }],
];
for (const [file, size, opts] of jobs) {
  await sharp(Buffer.from(svg(opts))).resize(size, size).png().toFile(file);
}
console.log('icons written');
