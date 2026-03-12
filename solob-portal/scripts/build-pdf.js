import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const VOLUME_DIR = path.join(process.cwd(), 'public', 'volume0');
const OUTPUT_PDF = path.join(process.cwd(), 'public', 'Book_of_Solobility_Volume_0.pdf');

async function buildPDF() {
  console.log('Generating Solobility PDF...');

  // 1. Get all markdown files
  const files = fs.readdirSync(VOLUME_DIR)
    .filter(f => f.endsWith('.md'))
    .sort(); // Sorting depends on the 000_, 001_ prefix which works perfectly.

  let fullHtml = '';

  // 2. Build HTML body
  for (const file of files) {
    const filePath = path.join(VOLUME_DIR, file);
    const mdContent = fs.readFileSync(filePath, 'utf-8');

    // Parse markdown
    let htmlChunk = await marked.parse(mdContent, { async: true });

    // Convert pagebreaks
    htmlChunk = htmlChunk.replaceAll(
      '<!-- pagebreak -->',
      '<div class="page-break"></div>'
    );

    // Combine chunks
    fullHtml += `<div class="chapter-container">${htmlChunk}</div>`;
  }

  // 3. Wrap in styling shell
  const completeHtmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Book of Solobility - Volume 0</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        :root {
          --page-bg: #fff;
          --text-color: #111;
          --font-sans: 'Inter', sans-serif;
          --font-serif: 'Playfair Display', serif;
        }
        
        body {
          margin: 0;
          padding: 0;
          background-color: var(--page-bg);
          color: var(--text-color);
          font-family: var(--font-serif);
          font-size: 14pt;
          line-height: 1.8;
        }
        
        .chapter-container {
          box-sizing: border-box;
          width: 5.5in;
          margin: 0 auto;
          padding-top: 0.5in;
        }

        h1, h2, h3, h4 {
          font-family: var(--font-serif);
          font-weight: 600;
          color: #000;
          page-break-after: avoid;
        }
        
        h1 { font-size: 28pt; margin-top: 0; margin-bottom: 24pt; border-bottom: 1px solid #ddd; padding-bottom: 8pt; }
        h2 { font-size: 20pt; margin-top: 24pt; margin-bottom: 16pt; }
        h3 { font-size: 16pt; margin-top: 20pt; margin-bottom: 12pt; }
        
        p {
          margin-bottom: 14pt;
          text-align: justify;
        }
        
        blockquote {
          margin: 18pt 0;
          padding: 12pt 24pt;
          font-style: italic;
          background: #fdfdfc;
          border-left: 2px solid #ccc;
          color: #444;
        }

        hr {
          border: 0;
          border-top: 1px solid #eee;
          margin: 24pt 0;
        }
        
        .page-break {
          page-break-after: always;
          height: 0;
          display: block;
        }
        
        /* Checkpoint stylistic boxes */
        strong {
          font-weight: 600;
        }
        
        em {
          font-family: var(--font-serif);
          font-style: italic;
        }
      </style>
    </head>
    <body>
      ${fullHtml}
    </body>
    </html>
  `;

  // 4. Generate PDF via Puppeteer
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(completeHtmlTemplate, { waitUntil: 'load' });

  // Await fonts loading
  await page.evaluateHandle('document.fonts.ready');

  console.log('Printing to PDF...');
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 9px; width: 100%; text-align: center; color: #666; font-family: 'Inter', sans-serif;">
        <span class="pageNumber"></span>
      </div>
    `,
    margin: {
      top: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
      right: '0.75in'
    }
  });

  await browser.close();
  console.log(`✅ PDF successfully mapped and generated at: ${OUTPUT_PDF}`);
}

buildPDF().catch(console.error);
