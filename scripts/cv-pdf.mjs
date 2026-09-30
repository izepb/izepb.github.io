// Renders dist/cv/index.html to dist/cv.pdf (and dist/media/main.pdf, the old CV URL) with headless Chromium.
import { createServer } from 'node:http';
import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const DIST = new URL('../dist/', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  try {
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(await readFile(join(DIST, p)));
  } catch { res.writeHead(404).end(); }
}).listen(0);
const { port } = server.address();

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ colorScheme: 'light' });
await page.goto(`http://localhost:${port}/cv/`, { waitUntil: 'networkidle' });
const out = join(DIST, 'cv.pdf');
await page.pdf({
  path: out, format: 'A4', printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true, headerTemplate: '<span></span>',
  footerTemplate: `<div style="font:8px monospace;color:#888;width:100%;padding:0 14mm;display:flex;justify-content:space-between">
    <span>Pisanu Buphamalai · CV · ${new Date().toISOString().slice(0, 10)}</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`,
});
await browser.close();
server.close();

await mkdir(join(DIST, 'media'), { recursive: true });
await copyFile(out, join(DIST, 'media', 'main.pdf'));
console.log('✓ wrote dist/cv.pdf and dist/media/main.pdf');
