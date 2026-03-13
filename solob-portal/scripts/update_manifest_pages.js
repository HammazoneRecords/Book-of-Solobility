import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PDF_PATH = path.join(__dirname, '..', 'public', 'book-of-solobility-v0-ca620f6a_c.pdf');
const MANIFEST_PATH = path.join(__dirname, '..', 'src', 'data', 'volume0-manifest.json');

const numVals = ["ZERO","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN","ELEVEN","TWELVE","THIRTEEN","FOURTEEN","FIFTEEN","SIXTEEN","SEVENTEEN","EIGHTEEN","NINETEEN","TWENTY","TWENTY-ONE","TWENTY-TWO","TWENTY-THREE","TWENTY-FOUR","TWENTY-FIVE","TWENTY-SIX","TWENTY-SEVEN","TWENTY-EIGHT","TWENTY-NINE","THIRTY","THIRTY-ONE","THIRTY-TWO","THIRTY-THREE","THIRTY-FOUR","THIRTY-FIVE","THIRTY-SIX"];

async function extractPages() {
  console.log('Loading PDF...');
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
  const numPages = pdfDocument.numPages;
  console.log(`PDF has ${numPages} pages.`);
  
  let manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  let chapterStarts = new Array(manifest.length).fill(null);
  
  let currentTargetIndex = 0;
  
  // Start scanning from page 6 to skip TOC, though sequential scan fixes TOC anyway.
  for (let i = 6; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ').toUpperCase();
    
    // We expect the currentTargetIndex
    if (currentTargetIndex < manifest.length) {
       let c = currentTargetIndex;
       
       const titleStr = manifest[c].title.toUpperCase().replace(/[^\w\s]/g, '');
       const chStr = numVals[c];
       
       const regex1 = new RegExp(`CHAPTER\\s+${chStr}\\b`, 'i');
       const regex2 = new RegExp(`CHAPTER\\s+${c}\\b`, 'i');
       
       // Match exactly CHAPTER N or CHAPTER word, or the title text.
       if (regex1.test(text) || regex2.test(text) || text.replace(/\s+/g, '').includes(manifest[c].title.toUpperCase().replace(/\s+/g, ''))) {
          chapterStarts[c] = i;
          console.log(`Found Chapter ${c}: '${manifest[c].title}' on page ${i}`);
          currentTargetIndex++;
          
          // Small chance: If a chapter is very short, the next chapter might be on the SAME PAGE.
          // Let's check for the next chapter on the same page.
          while (currentTargetIndex < manifest.length) {
              let nextC = currentTargetIndex;
              const nextStr = numVals[nextC];
              const regexN1 = new RegExp(`CHAPTER\\s+${nextStr}\\b`, 'i');
              const regexN2 = new RegExp(`CHAPTER\\s+${nextC}\\b`, 'i');
              if (regexN1.test(text) || regexN2.test(text)) {
                 chapterStarts[nextC] = i;
                 console.log(`Found Chapter ${nextC} ALSO on page ${i}`);
                 currentTargetIndex++;
              } else {
                 break;
              }
          }
       }
    }
  }
  
  console.log("Extraction complete. Computing page spans...");
  
  for (let i = 0; i < manifest.length; i++) {
     if (!chapterStarts[i]) {
         console.warn(`WARNING: Chapter ${i} wasn't found in scan. Approximating.`);
         chapterStarts[i] = i > 0 ? chapterStarts[i-1] + 1 : 1;
     }
  }
  
  for (let i = 0; i < manifest.length; i++) {
     const start = chapterStarts[i];
     const end = i < manifest.length - 1 ? chapterStarts[i+1] : numPages + 1;
     let length = end - start;
     if (length < 1) length = 1;
     manifest[i].pages = length;
  }
  
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest updated successfully! Wrote ${manifest.length} chapters.`);
}
extractPages().catch(console.error);
