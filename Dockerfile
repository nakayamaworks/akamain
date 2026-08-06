FROM node:24-slim

ENV NODE_ENV=production
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend ./backend
COPY scoring ./scoring

WORKDIR /app/backend
USER node

CMD ["node", "src/server.js"]
