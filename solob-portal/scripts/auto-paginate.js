import fs from 'fs';
import path from 'path';

const VOLUME_DIR = path.join(process.cwd(), 'public', 'volume0');
const TARGET_CHARS_PER_PAGE = 800; // Optimal length for the Reader layout
const MIN_CHARS_PER_PAGE = 500;    // Prevent tiny orphaned pages

function hasPageBreaks(content) {
    return content.includes('<!-- pagebreak -->');
}

function paginateContent(content) {
    // Split by block-level elements (paragraphs, headings, blockquotes, horizontal rules)
    // We use double newline as the safest paragraph delimiter in Standard Markdown
    const blocks = content.split(/\n{2,}/);

    let currentChunkLength = 0;
    let newContent = '';
    let pendingBlocks = [];

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i].trim();
        if (!block) continue;

        // If this is a horizontal rule (*** or ---), treat it as a hard section break
        if (block.match(/^(?:\*\*\*|---)$/)) {
            newContent += pendingBlocks.join('\n\n') + '\n\n' + block + '\n\n<!-- pagebreak -->\n\n';
            pendingBlocks = [];
            currentChunkLength = 0;
            continue;
        }

        // Add block to pending
        pendingBlocks.push(block);
        currentChunkLength += block.length;

        // Check if we reached the target length
        let shouldBreak = currentChunkLength >= TARGET_CHARS_PER_PAGE;

        // Safety Checks for breaking:
        if (shouldBreak) {
            // NEVER break immediately after a heading
            if (block.startsWith('#')) {
                shouldBreak = false;
            }

            // NEVER break if the NEXT block is a short continuation or another heading
            // (We want headings to stay attached to their first paragraph)
            if (i < blocks.length - 1 && blocks[i + 1].startsWith('#')) {
                // It's okay to break BEFORE a heading, that's actually ideal
                shouldBreak = true;
            }
        }

        if (shouldBreak) {
            newContent += pendingBlocks.join('\n\n') + '\n\n<!-- pagebreak -->\n\n';
            pendingBlocks = [];
            currentChunkLength = 0;
        }
    }

    // Append any remaining blocks without an ending pagebreak
    if (pendingBlocks.length > 0) {
        newContent += pendingBlocks.join('\n\n');
    }

    // Cleanup excessive newlines around pagebreaks
    newContent = newContent.replace(/\n*<!-- pagebreak -->\n*/g, '\n\n<!-- pagebreak -->\n\n');

    // Ensure we don't have a trailing pagebreak at the very end of the document
    if (newContent.trim().endsWith('<!-- pagebreak -->')) {
        newContent = newContent.replace(/<!-- pagebreak -->\s*$/, '');
    }

    return newContent.trim() + '\n';
}

async function autoPaginate() {
    console.log('Starting Auto-Paginator...\n');

    const files = fs.readdirSync(VOLUME_DIR)
        .filter(f => f.endsWith('.md'))
        .sort();

    let processedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
        const filePath = path.join(VOLUME_DIR, file);
        let mdContent = fs.readFileSync(filePath, 'utf-8');

        // Strip existing page breaks so we can start fresh
        mdContent = mdContent.replace(/\n*<!-- pagebreak -->\n*/g, '\n\n');

        const paginatedContent = paginateContent(mdContent);
        fs.writeFileSync(filePath, paginatedContent, 'utf-8');

        const newPages = paginatedContent.split('<!-- pagebreak -->').length;

        console.log(`[DONE] ${file} -> Generated ${newPages} pages.`);
        processedCount++;
    }

    console.log(`\nPagination Complete! Processed: ${processedCount}. Skipped: ${skippedCount}.`);
}

autoPaginate().catch(console.error);
