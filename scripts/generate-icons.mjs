import sharp from 'sharp';

// Matches the app header logo: dark rounded square + white briefcase (Lucide).
const BRIEFCASE = `
  <rect width="20" height="14" x="2" y="7" rx="2"/>
  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`;

function logoSvg(size, scale = 0.6) {
  const glyph = Math.round(size * scale);
  const offset = Math.round((size - glyph) / 2);
  const radius = Math.round(size * 0.22);
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#171717"/>
      <g transform="translate(${offset} ${offset}) scale(${glyph / 24})"
         fill="none" stroke="#ffffff" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
        ${BRIEFCASE}
      </g>
    </svg>`);
}

async function icon(size, { maskable = false } = {}) {
  await sharp(logoSvg(size, maskable ? 0.42 : 0.6))
    .png()
    .toFile(`public/pwa-${maskable ? 'maskable-' : ''}${size}.png`);
}

await icon(192);
await icon(512);
await icon(512, { maskable: true });
await icon(180); // apple touch icon
console.log('icons generated');
