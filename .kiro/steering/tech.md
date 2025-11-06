# Technology Stack

## Architecture
**Full-stack TypeScript** application with **Cloudflare Workers** backend and **React 18** frontend, deployed on Cloudflare's edge infrastructure.

## Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare R2 for images and assets
- **Authentication**: JWT tokens
- **Payments**: Stripe with webhook integration

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: Zustand + React Query (TanStack Query)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Notifications**: Sonner (toast notifications)

## Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + TypeScript strict mode
- **Formatting**: Prettier
- **Testing**: Vitest
- **Deployment**: Wrangler CLI

## Common Commands

```bash
# Development
npm run dev                 # Start backend (Cloudflare Workers)
npm run dev:frontend        # Start frontend (Vite dev server)

# Building
npm run build              # Build both frontend and backend
npm run build:frontend     # Build frontend only
npm run build:backend      # Build backend only

# Quality
npm run lint              # Run ESLint
npm run type-check        # TypeScript type checking
npm run test              # Run tests with Vitest

# Deployment
npm run deploy            # Build and deploy to Cloudflare
wrangler deploy           # Deploy backend only
wrangler pages deploy dist/public  # Deploy frontend to Pages

# Database
wrangler d1 execute cake_decor_db --file backend/migrations/0001_init.sql
```

## Environment Requirements
- **Node.js**: 18+ (recommended v20 LTS)
- **Cloudflare Account**: Workers + Pages + D1 + R2
- **Stripe Account**: For payment processing