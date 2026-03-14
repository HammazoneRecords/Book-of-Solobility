import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PDF_PATH = path.join(__dirname, '..', 'public', 'book-of-solobility-v0-ca620f6a_c.pdf');

async function diagnose() {
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
  const numPages = pdfDocument.numPages;
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    const firstLine = text.substring(0, 150).replace(/\s+/g, ' ');
    console.log(`Page ${i}: ${firstLine}`);
  }
}
diagnose().catch(console.error);
