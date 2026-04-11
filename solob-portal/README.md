# The Book of Solobility — Portal

A MindwaveJA project by Ovando Brown.

**Live:** [whatissolob.com](https://whatissolob.com)

The digital portal for *The Book of Solobility V0* — a reader experience built around the 8 Jhanos Gates of the Solobic framework. Users enter through their gate, receive a forged copy of the book, and read it in a cinematic PDF reader with chapter navigation.

---

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind v4
- **Backend:** Express + better-sqlite3 (SQLite)
- **Runtime:** Node.js via PM2 on VPS, served behind Nginx

---

## Run Locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

Server starts at `http://localhost:3000`

---

## Architecture

| Layer | Detail |
|---|---|
| Frontend | React SPA — Threshold → Gate Selection → Offering → Confirmation → Reader |
| Backend | Express server (`server.ts`) handling API routes + static serving |
| Database | `solobility.db` — SQLite with `purchases` and `reader_analytics` tables |
| PDF Reader | PDF.js with chapter manifest (`src/data/volume0-manifest.json`) |
| Analytics | Silent 30s heartbeat tracking page progress and reading time |

---

## The 8 Jhanos Gates

| Gate | Code | Theme |
|---|---|---|
| SYLA | N | Stillness & Receiving |
| ZAYN | NE | Origin & Identity |
| LOMI | E | Motion & Memory |
| VORAK | SE | Liberation & Deconstruction |
| KHEM | S | The Forge & Tested Truth |
| BARA | SW | Structure & Geometry |
| TARA | W | Nurturance & Mirror-Keeping |
| ORON | NW | Order & The Creeds |

---

## Production Deploy

```bash
git pull
npm run build
pm2 restart solob-portal
```

---

*MindwaveJA — mindwaveja.com*
