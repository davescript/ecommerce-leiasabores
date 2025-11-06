import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './backend/src/models/schema.ts',
  out: './backend/migrations',
  driver: 'd1',
  dbCredentials: {
    databaseId: process.env.D1_DATABASE_ID ?? '',
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
  },
  verbose: true,
  strict: true,
})
