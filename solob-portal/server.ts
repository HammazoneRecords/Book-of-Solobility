import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const db = new Database("solobility.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE,
    user_name TEXT,
    gate TEXT,
    tier TEXT,
    amount INTEGER,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reader_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    user_name TEXT,
    gate TEXT,
    current_page INTEGER DEFAULT 1,
    max_page_reached INTEGER DEFAULT 1,
    total_reading_seconds INTEGER DEFAULT 0,
    pdf_downloaded INTEGER DEFAULT 0,
    last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size limit for large markdown chapters
  app.use(express.json({ limit: '10mb' }));

  // API routes FIRST

  // --- CMS ENDPOINTS ---
  const VOLUME_DIR = path.join(process.cwd(), 'public', 'volume0');

  app.get("/api/cms/chapters", (req, res) => {
    try {
      if (!fs.existsSync(VOLUME_DIR)) {
        return res.json({ chapters: [] });
      }
      const files = fs.readdirSync(VOLUME_DIR)
        .filter(f => f.endsWith('.md'))
        .sort();
      res.json({ chapters: files });
    } catch (error) {
      res.status(500).json({ error: "Failed to list chapters" });
    }
  });

  app.get("/api/cms/chapters/:filename", (req, res) => {
    try {
      const filePath = path.join(VOLUME_DIR, req.params.filename);
      // Security check to prevent directory traversal
      if (!filePath.startsWith(VOLUME_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: "Failed to read chapter" });
    }
  });

  app.post("/api/cms/chapters/:filename", (req, res) => {
    try {
      const filePath = path.join(VOLUME_DIR, req.params.filename);
      if (!filePath.startsWith(VOLUME_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { markdown } = req.body;
      if (typeof markdown !== 'string') {
        return res.status(400).json({ error: "Invalid markdown content" });
      }
      fs.writeFileSync(filePath, markdown, 'utf-8');
      res.json({ success: true, message: "Chapter saved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save chapter" });
    }
  });
  app.post("/api/cms/preview-pdf", async (req, res) => {
    try {
      const { markdown } = req.body;
      if (typeof markdown !== 'string') {
        return res.status(400).json({ error: "Invalid markdown content" });
      }

      // Pre-load glyphs as Base64 for Puppeteer fidelity
      const glyphDir = path.join(process.cwd(), 'public', 'glyphs');
      const glyphMap: Record<string, string> = {};
      if (fs.existsSync(glyphDir)) {
        const glyphFiles = fs.readdirSync(glyphDir).filter(f => f.endsWith('.png'));
        for (const file of glyphFiles) {
          const name = file.split('.')[0].toLowerCase();
          const buffer = fs.readFileSync(path.join(glyphDir, file));
          glyphMap[name] = `data:image/png;base64,${buffer.toString('base64')}`;
        }
      }

      let htmlChunk = await marked.parse(markdown, { async: true });

      // Transform "# Chapter X: Title" into styled blocks
      htmlChunk = htmlChunk.replace(/<h1>Chapter (\d+): (.*?)<\/h1>/gi, (match, num, title) => {
        return `
          <div class="chapter-header-box">
            <div class="chapter-label">Chapter ${num}</div>
            <h1 class="chapter-title-large">${title}</h1>
          </div>
        `;
      });

      // Ensure a page break before the Jhanos table section
      htmlChunk = htmlChunk.replace(/<h3>The 8 Jhanos Gates of Volume 0<\/h3>/gi,
        '<!-- pagebreak --><h3 class="jhanos-menu-header">The 8 Jhanos Gates of Volume 0</h3>');

      // Replace image tags or custom glyph markers if they existed
      for (const [name, base64] of Object.entries(glyphMap)) {
        htmlChunk = htmlChunk.replaceAll(`/glyphs/${name}.png`, base64);
        htmlChunk = htmlChunk.replaceAll(`glyphs/${name}.png`, base64);
      }

      htmlChunk = htmlChunk.replaceAll('<!-- pagebreak -->', '<div class="page-break"></div>');
      const fullHtml = `<div class="chapter-container">${htmlChunk}</div>`;

      const completeHtmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          :root { --page-bg: #fff; --text-color: #111; --font-sans: 'Inter', sans-serif; --font-serif: 'Playfair Display', serif; }
          body { margin: 0; padding: 0; background-color: var(--page-bg); color: var(--text-color); font-family: var(--font-serif); font-size: 13pt; line-height: 1.7; }
          .chapter-container { box-sizing: border-box; width: 6in; margin: 0 auto; padding-top: 0.5in; }
          
          .chapter-header-box { text-align: center; margin-bottom: 60pt; border-bottom: 1px solid #eee; padding-bottom: 40pt; }
          .chapter-label { font-family: var(--font-sans); font-size: 10pt; text-transform: uppercase; letter-spacing: 0.3em; color: #888; margin-bottom: 12pt; font-weight: 600; }
          .chapter-title-large { font-family: var(--font-serif); font-size: 36pt; margin: 0; font-weight: 400; color: #111; line-height: 1.2; }
          
          h2 { font-size: 20pt; margin-top: 32pt; margin-bottom: 16pt; font-weight: 400; border-left: 3px solid #00d0ff; padding-left: 15pt; }
          h3 { font-size: 16pt; margin-top: 24pt; margin-bottom: 12pt; color: #444; }
          p { margin-bottom: 15pt; text-align: justify; color: #222; }
          img { max-width: 80%; height: auto; display: block; margin: 40pt auto; }
          blockquote { margin: 30pt 40pt; padding: 0; font-style: italic; color: #555; border: none; text-align: center; font-size: 14pt; line-height: 1.8; }
          hr { border: 0; border-top: 1px solid #eee; margin: 40pt 0; }
          
          table { width: 100%; border-collapse: collapse; margin: 20pt 0; font-family: var(--font-sans); font-size: 10pt; }
          th { background: #f9f9f9; text-align: left; padding: 12pt; border-bottom: 2px solid #eee; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.1em; }
          td { padding: 10pt 12pt; border-bottom: 1px solid #eee; }
          
          .jhanos-menu-header { text-align: center; margin-top: 0; padding-top: 40pt; font-size: 22pt; text-transform: uppercase; letter-spacing: 0.2em; border-bottom: 1px solid #111; padding-bottom: 15pt; margin-bottom: 30pt; }

          .page-break { page-break-after: always; height: 0; display: block; }
          strong { font-weight: 600; color: #000; }
          em { font-family: var(--font-serif); font-style: italic; }
        </style>
      </head>
      <body>
        ${fullHtml}
      </body>
      </html>`;

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(completeHtmlTemplate, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="font-size: 9px; width: 100%; text-align: center; color: #666; font-family: 'Inter', sans-serif;">
            <span class="pageNumber"></span>
          </div>
        `,
        margin: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' }
      });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF Preview Error:", error);
      res.status(500).json({ error: "Failed to generate PDF preview" });
    }
  });

  // ---------------------
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- ADMIN AUTH ---
  const ADMIN_KEY = process.env.ADMIN_KEY || 'SOLOB_ADMIN_2026';

  app.post("/api/admin/verify", (req, res) => {
    const { code } = req.body;
    if (code === ADMIN_KEY) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  // --- READER ANALYTICS ---
  app.post("/api/analytics/heartbeat", (req, res) => {
    try {
      const { session_id, user_name, gate, current_page, max_page_reached } = req.body;
      if (!session_id) return res.status(400).json({ error: "session_id required" });

      const existing = db.prepare("SELECT * FROM reader_analytics WHERE session_id = ?").get(session_id) as any;

      if (existing) {
        db.prepare(`
          UPDATE reader_analytics
          SET current_page = ?,
              max_page_reached = MAX(max_page_reached, ?),
              total_reading_seconds = total_reading_seconds + 30,
              last_heartbeat = CURRENT_TIMESTAMP
          WHERE session_id = ?
        `).run(current_page || 1, max_page_reached || 1, session_id);
      } else {
        db.prepare(`
          INSERT INTO reader_analytics (session_id, user_name, gate, current_page, max_page_reached, total_reading_seconds)
          VALUES (?, ?, ?, ?, ?, 0)
        `).run(session_id, user_name || 'Unknown', gate || 'N', current_page || 1, max_page_reached || 1);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Heartbeat error:", error);
      res.status(500).json({ error: "Failed to record heartbeat" });
    }
  });

  app.post("/api/analytics/download", (req, res) => {
    try {
      const { session_id } = req.body;
      if (!session_id) return res.status(400).json({ error: "session_id required" });

      const existing = db.prepare("SELECT * FROM reader_analytics WHERE session_id = ?").get(session_id) as any;
      if (existing) {
        db.prepare("UPDATE reader_analytics SET pdf_downloaded = pdf_downloaded + 1 WHERE session_id = ?").run(session_id);
      } else {
        db.prepare(`
          INSERT INTO reader_analytics (session_id, pdf_downloaded)
          VALUES (?, 1)
        `).run(session_id);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record download" });
    }
  });

  app.get("/api/verify-receipt", (req, res) => {
    try {
      const { receipt, gate } = req.query;
      if (!receipt) {
        return res.status(400).json({ error: "Receipt is required" });
      }

      let purchase;
      if (gate) {
        purchase = db.prepare(`
          SELECT * FROM purchases 
          WHERE(session_id = ? OR 'SOLOB-' || substr(session_id, instr(session_id, '_') + 1) = ?) 
          AND gate = ?
        `).get(receipt, receipt, gate);
      } else {
        purchase = db.prepare(`
          SELECT * FROM purchases 
          WHERE(session_id = ? OR 'SOLOB-' || substr(session_id, instr(session_id, '_') + 1) = ?)
          `).get(receipt, receipt);
      }

      if (purchase) {
        res.json({ success: true, purchase });
      } else {
        res.status(404).json({ error: "Invalid receipt or gate" });
      }
    } catch (error) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      const totalConversions = db.prepare("SELECT COUNT(*) as count FROM purchases").get() as any;
      const totalRevenue = db.prepare("SELECT SUM(amount) as sum FROM purchases").get() as any;
      const recentPurchases = db.prepare("SELECT * FROM purchases ORDER BY created_at DESC LIMIT 10").all();
      const gateDistribution = db.prepare("SELECT gate as name, COUNT(*) as value FROM purchases GROUP BY gate").all();

      // Reader analytics
      const totalReaders = db.prepare("SELECT COUNT(*) as count FROM reader_analytics").get() as any;
      const avgReadTime = db.prepare("SELECT AVG(total_reading_seconds) as avg FROM reader_analytics WHERE total_reading_seconds > 0").get() as any;
      const totalDownloads = db.prepare("SELECT SUM(pdf_downloaded) as total FROM reader_analytics").get() as any;
      const avgMaxPage = db.prepare("SELECT AVG(max_page_reached) as avg FROM reader_analytics WHERE max_page_reached > 0").get() as any;
      const recentReaders = db.prepare("SELECT session_id, user_name, gate, current_page, max_page_reached, total_reading_seconds, pdf_downloaded, last_heartbeat FROM reader_analytics ORDER BY last_heartbeat DESC LIMIT 10").all();

      res.json({
        totalConversions: totalConversions.count,
        totalRevenue: (totalRevenue.sum || 0) / 100,
        recentPurchases,
        gateDistribution,
        reading: {
          totalReaders: totalReaders.count,
          avgReadTimeMinutes: Math.round((avgReadTime.avg || 0) / 60),
          totalDownloads: totalDownloads.total || 0,
          avgMaxPage: Math.round(avgMaxPage.avg || 0),
          recentReaders
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/forge-book", async (req, res) => {
    try {
      const { gate, name, tier } = req.body;

      let unitAmount = 7700; // Default Standard
      if (tier === 'premium') unitAmount = 9900;
      if (tier === 'free') unitAmount = 0;

      // Generate a formal Solobic receipt number
      const sessionId = `SOLOB-${Math.floor(1000 + Math.random() * 9000)}`;

      // Save to DB for tracking offline forgings
      db.prepare(`
        INSERT INTO purchases(session_id, user_name, gate, tier, amount, status)
        VALUES(?, ?, ?, ?, ?, ?)
          `).run(sessionId, name, gate, tier, unitAmount, 'Completed');

      // Return the confirmation URL directly
      res.json({
        url: `/confirmation?session_id=${sessionId}&gate=${gate}&name=${encodeURIComponent(name)}&tier=${tier}`
      });

    } catch (error: any) {
      console.error("Error forging book:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
