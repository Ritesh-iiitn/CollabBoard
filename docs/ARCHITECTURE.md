# CollabBoard++ Architecture

This document describes the **additive** production layer on top of the original CollabBoard hackathon app.

## What was kept (unchanged paths)

- `server.js` — original Socket.IO stroke/board/image handlers
- `src/app/room/[roomId]/WhiteBoard.tsx` — full canvas + LiveKit
- Firebase auth, Firestore `roomService`, Gemini AI routes
- All existing pages and APIs

## What was added

| Layer | Path | Purpose |
|-------|------|---------|
| Socket++ | `server/collabplus.js` | Yjs sync, presence, event log, optional Redis adapter |
| Nest API | `apps/api/` | Postgres, event store, snapshots, OpenAI, analytics |
| Shared types | `packages/shared/` | Event types, presence types |
| Client++ | `src/lib/collabplus/` | Yjs, IndexedDB outbox, presence, analytics |
| UI++ | `src/components/collabplus/` | Toolbar, presence cursors, AI panel |
| Next API v1 | `src/app/api/v1/` | OpenAI + analytics (works without Nest) |
| Ops | `docker-compose.yml`, `infra/`, `.github/workflows/` | Postgres, Redis, Prometheus, Grafana, K8s |

## Run locally

```bash
# Original app (unchanged)
npm install
npm run dev

# Optional: infrastructure
npm run docker:up
npm run prisma:push
npm run dev:api
```

Set `NEXT_PUBLIC_COLLAB_PLUS=true` in `.env.local`.
