import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../public/media/social/', import.meta.url);
await mkdir(output, { recursive: true });

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f3f2ee"/>
  <path d="M0 72H1200M0 558H1200" stroke="#b8b7b0"/>
  <ellipse cx="1030" cy="302" rx="310" ry="92" fill="none" stroke="#1547ff" stroke-width="2"/>
  <circle cx="978" cy="302" r="11" fill="#1547ff"/>
  <text x="72" y="120" fill="#1547ff" font-family="Arial, sans-serif" font-size="22" font-weight="700">PRANSHUL CHANDHOK / 2600TH</text>
  <text x="72" y="275" fill="#090909" font-family="Arial, sans-serif" font-size="104" font-weight="800" letter-spacing="-5">CAREER</text>
  <text x="72" y="372" fill="#090909" font-family="Arial, sans-serif" font-size="104" font-weight="800" letter-spacing="-5">ATLAS</text>
  <text x="74" y="470" fill="#5c5c57" font-family="Arial, sans-serif" font-size="28">Games → XR → Robotics → Design technology → Production AI</text>
  <text x="74" y="535" fill="#090909" font-family="Arial, sans-serif" font-size="20" font-weight="700">2012 — NOW</text>
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 88, smartSubsample: true }).toFile(fileURLToPath(new URL('career-atlas.webp', output)));
console.log('Generated public/media/social/career-atlas.webp');
