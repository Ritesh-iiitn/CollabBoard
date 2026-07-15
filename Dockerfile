FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY next-env.d.ts next.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json eslint.config.mjs ./

COPY src ./src
COPY components ./components
COPY public ./public
COPY server ./server
COPY server.js ./server.js
COPY packages/shared ./packages/shared

RUN npm ci
RUN npm run build -w @collabboard/shared
RUN npm run build


FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/packages/shared ./packages/shared

CMD ["node", "server.js"]