# Solobility Portal — Express + Vite inline + Puppeteer
# Uses Debian slim (not Alpine) — Puppeteer requires Chromium system deps
FROM node:22-slim

# Install Chromium for Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# solobility.db is volume-mounted at /app/data/solobility.db
# server.ts opens it as "solobility.db" (relative) — symlink to volume mount
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
