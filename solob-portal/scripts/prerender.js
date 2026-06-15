/**
 * Prerender SEO routes to static HTML files in dist/.
 *
 * How it works:
 *   1. Spin up a minimal static HTTP server pointing at dist/
 *   2. Visit each SEO route with Puppeteer
 *   3. Wait for React to hydrate (meta title tag is a reliable signal)
 *   4. Save the full HTML to dist/<route>/index.html
 *   5. Express serves dist/ statically before its SPA catchall,
 *      so Google gets pre-rendered HTML instead of an empty shell
 *
 * Run: node scripts/prerender.js  (after vite build)
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

const SEO_ROUTES = [
  '/about',
  '/gates-overview',
  '/gates/syla',
  '/gates/zayn',
  '/gates/lomi',
  '/gates/vorak',
  '/gates/khem',
  '/gates/bara',
  '/gates/tara',
  '/gates/oron',
  '/glossary',
];

// Minimal static file server — serves dist/ with SPA fallback
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
  };

  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(DIST, urlPath);

    // Try exact file first
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback — serve index.html
    const indexPath = path.join(DIST, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`  Static server running at ${BASE}`);
      resolve(server);
    });
  });
}

async function prerender() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found — run vite build first');
    process.exit(1);
  }

  const server = await startServer();
  // --no-sandbox is required when this runs as root inside Docker (the VPS build),
  // otherwise Chromium refuses to launch. Matches the PDF puppeteer launch in server.ts.
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of SEO_ROUTES) {
      const url = `${BASE}${route}`;
      const page = await browser.newPage();

      // Suppress console noise from the page
      page.on('console', () => {});
      page.on('pageerror', () => {});

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for React to set the document title (PageSeo useEffect fires after hydration)
      await page.waitForFunction(
        () => document.title && document.title.length > 10,
        { timeout: 10000 }
      ).catch(() => {
        console.warn(`  Warning: title not set for ${route} — may be incomplete`);
      });

      const html = await page.content();
      await page.close();

      // Write to dist/<route>/index.html
      const segments = route.split('/').filter(Boolean);
      const outDir = path.join(DIST, ...segments);
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, 'index.html');
      fs.writeFileSync(outFile, html, 'utf-8');

      console.log(`  ✓ ${route} → dist/${segments.join('/')}/index.html`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\nPrerender complete. ${SEO_ROUTES.length} routes written.`);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
