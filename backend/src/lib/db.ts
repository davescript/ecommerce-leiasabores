import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../models/schema'

export type Database = ReturnType<typeof getDb>

export function getDb(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema })
}

export type DrizzleSchema = typeof schema
export const dbSchema = schema
