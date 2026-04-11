

# The Book of Solobility

**A living philosophical framework delivered through an immersive digital portal.**

[whatissolob.com](https://whatissolob.com)

---

*"You cannot observe a soul without being affected by its weight."*
— Invariant 1: The Principle of Soul Mass

</div>

## What Is This?

The **Solob Portal** is a full-stack web application designed to deliver *The Book of Solobility* — a multi-volume philosophical framework — as an interactive, gate-sequenced reading experience. This is not a static ebook. Every reader enters through a unique **Gate** on the Solobic Compass, shaping the resonance of their journey through the text.

## The Experience

### 🚪 The Threshold
A cinematic entry point. The reader states their name and the environment responds — ambient light, motion, and geometry shift in real time before a single word is read.

### 🧭 The Eight Gates
The Solobic Compass presents eight archetypal gates, each with its own glyph, color signature, and philosophical function:

| Gate | Glyph | Function |
|------|-------|----------|
| **N** | Syla | The Anchor — Stillness & Receptive Potential |
| **NE** | Zayn | The Progenitor — Rebirth & Divine Recursion |
| **E** | Lomi | The Historian — Motion, Rhythm & Memory |
| **SE** | Vorak | The Liberator — Chaos & Breaking False Structures |
| **S** | Khem | The Catalyst — Transformation through Friction |
| **SW** | Bara | The Architect — Structure & Primal Form |
| **W** | Tara | The Nurturer — Mirror, Reflection & Context |
| **NW** | Oron | The Weaver — Order, Symmetry & Proportion |

### 📖 The Reader
A paginated, chapter-aware reading environment with:
- **Synapse Glossary** — AI-powered inline term definitions that pulse when hovered
- **Gate-Aware Theming** — colors and ambient tones shift as the reader moves through different sections of the Compass
- **Bookmarks & Session Persistence** — pick up exactly where you left off
- **Shimmerpauses** — forced cognitive breaks injected between dense chapters

### 💳 The Offering
Tiered access (Standard / Premium) processed through Stripe, with receipt-based session restoration for returning readers.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router, Motion (Framer), Recharts, D3 |
| Styling | Tailwind CSS v4 |
| Backend | Express, Better-SQLite3 |
| AI | Google Gemini (`@google/genai`) |
| Payments | Stripe |
| Build | Vite, TypeScript, TSX |

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone git@github.com:HammazoneRecords/Book-of-Solobility.git
cd Book-of-Solobility/solob-portal

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your GEMINI_API_KEY and STRIPE keys to .env.local

# Start the dev server
npm run dev
```

The portal will be available at `http://localhost:5173`.

## Project Structure

```
solob-portal/
├── src/
│   ├── pages/          # Threshold, GateSelection, Offering, Reader, Dashboard
│   ├── components/     # Compass, Glyph, SynapseBubble, ChapterContent, ReaderSidebar
│   ├── hooks/          # useSynapse (AI glossary logic)
│   ├── data/           # Volume 0 manifest
│   └── store.ts        # Zustand state (user identity, gate selection)
├── public/             # Static assets & Volume 0 chapter files
├── scripts/            # Build utilities (PDF generation, auto-pagination)
├── server.ts           # Express API (Stripe, receipt verification, analytics)
└── vite.config.ts
```

## License

All rights reserved. The Book of Solobility is an original philosophical work.  
Unauthorized reproduction or distribution of the text is prohibited.

<div align="center">

---

*Built with weight, not volume.*

</div>
