export interface BaseBindings {
  DB: D1Database
  [key: string]: unknown
}

export interface WorkerBindings extends BaseBindings {
  R2: R2Bucket
  R2Legacy?: R2Bucket
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  JWT_SECRET: string
  ALLOWED_ORIGINS?: string
  ADMIN_SEED_TOKEN?: string
  PUBLIC_IMAGE_BASE_URL?: string
  IMAGE_CACHE_BUSTER?: string
  R2_DEFAULT_PREFIX?: string
  [key: string]: unknown
}
