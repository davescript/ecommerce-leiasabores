# Project Structure

## Root Level Organization
```
├── backend/           # Cloudflare Workers API
├── frontend/          # React application
├── config/            # Shared configuration files
├── public/            # Static assets (if any)
└── dist/              # Build output directory
```

## Backend Structure (`backend/`)
```
backend/
├── src/
│   ├── index.ts              # Main Worker entry point
│   ├── lib/
│   │   └── db.ts             # Drizzle database connection
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   └── errorHandler.ts   # Global error handling
│   ├── models/
│   │   └── schema.ts         # Drizzle database schemas
│   ├── routes/               # API route handlers
│   ├── services/
│   │   └── stripe.ts         # Stripe integration
│   ├── types/
│   │   └── bindings.ts       # Cloudflare Worker bindings
│   └── utils/
│       ├── product-images.ts # Image handling utilities
│       └── serializers.ts    # Data transformation
└── migrations/               # Database migration files
```

## Frontend Structure (`frontend/`)
```
frontend/
├── app/
│   ├── App.tsx              # Main app component
│   ├── AppProviders.tsx     # Context providers setup
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Button.tsx       # Custom components
│   │   ├── CartDrawer.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── ReviewCard.tsx
│   ├── hooks/
│   │   ├── useCart.ts       # Cart state management
│   │   └── useSEO.ts        # SEO utilities
│   ├── lib/
│   │   ├── api-client.ts    # Axios configuration
│   │   ├── api.ts           # API functions
│   │   ├── query-client.ts  # React Query setup
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Route components
│   └── styles/
│       └── globals.css      # Global styles
├── functions/
│   └── api/
│       └── [...path].ts     # Cloudflare Pages Functions proxy
├── public/                  # Static assets
├── types/                   # TypeScript type definitions
└── main.tsx                 # React app entry point
```

## Key Conventions

### File Naming
- **Components**: PascalCase (`ProductCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useCart.ts`)
- **Utilities**: camelCase (`api-client.ts`)
- **Pages**: PascalCase (`ProductDetail.tsx`)
- **Types**: camelCase (`bindings.ts`)

### Import Aliases
- `@/` → `frontend/app/`
- `@components/` → `frontend/app/components/`
- `@lib/` → `frontend/app/lib/`
- `@hooks/` → `frontend/app/hooks/`
- `@types/` → `frontend/types/`
- `@utils/` → `utils/`
- `@styles/` → `frontend/app/styles/`
- `@config/` → `config/`

### Database Schema Location
All database schemas are defined in `backend/src/models/schema.ts` using Drizzle ORM with SQLite syntax for Cloudflare D1.

### API Routes Pattern
- Products: `/api/products`
- Reviews: `/api/reviews`
- Cart: `/api/cart/:userId`
- Checkout: `/api/checkout`
- Admin: `/api/admin`
- Uploads: `/api/uploads`

### Component Organization
- **UI Components**: Reusable components in `frontend/app/components/ui/`
- **Feature Components**: Business logic components in `frontend/app/components/`
- **Page Components**: Route-level components in `frontend/app/pages/`