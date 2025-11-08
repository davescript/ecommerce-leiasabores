import type { WorkerBindings } from '../types/bindings'

// Types for R2 (inline to avoid dependency issues)
interface R2Bucket {
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null, options?: R2PutOptions): Promise<R2Object | null>
  get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>
  delete(keys: string | string[]): Promise<void>
  list(options?: R2ListOptions): Promise<R2Objects>
}

interface R2PutOptions {
  httpMetadata?: {
    contentType?: string
    cacheControl?: string
  }
  customMetadata?: Record<string, string>
}

interface R2GetOptions {
  onlyIf?: R2Conditional
}

interface R2ListOptions {
  prefix?: string
  limit?: number
}

interface R2Conditional {
  etagMatches?: string
  etagDoesNotMatch?: string
  uploadedBefore?: Date
  uploadedAfter?: Date
}

interface R2Object {
  key: string
  version: string
  size: number
  etag: string
  httpEtag: string
  uploaded: Date
  httpMetadata?: {
    contentType?: string
    cacheControl?: string
  }
  customMetadata?: Record<string, string>
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream
  bodyUsed: boolean
  arrayBuffer(): Promise<ArrayBuffer>
  text(): Promise<string>
  json<T = unknown>(): Promise<T>
  blob(): Promise<Blob>
}

interface R2Objects {
  objects: R2Object[]
  truncated: boolean
  cursor?: string
  delimitedPrefixes: string[]
}

export interface R2UploadOptions {
  bucket: R2Bucket
  file: File | ArrayBuffer
  key: string
  contentType?: string
  metadata?: Record<string, string>
}

export interface R2SignedUrlOptions {
  bucket: R2Bucket
  key: string
  method: 'GET' | 'PUT' | 'DELETE'
  expiresIn?: number // seconds
}

/**
 * Upload file to R2
 */
export async function uploadToR2(options: R2UploadOptions): Promise<{
  key: string
  url: string
  size: number
}> {
  const { bucket, file, key, contentType, metadata } = options

  const fileData = file instanceof File ? await file.arrayBuffer() : file
  const contentLength = fileData.byteLength

  // Validate file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  if (contentLength > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validate content type for images
  if (contentType && contentType.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(contentType)) {
      throw new Error(`Invalid image type: ${contentType}. Allowed types: ${allowedTypes.join(', ')}`)
    }
  }

  await bucket.put(key, fileData, {
    httpMetadata: {
      contentType: contentType || 'application/octet-stream',
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: metadata || {},
  })

  // Generate public URL (adjust domain as needed)
  const url = `https://api.leiasabores.pt/api/r2/${key}`

  return {
    key,
    url,
    size: contentLength,
  }
}

/**
 * Generate pre-signed URL for direct browser upload
 */
export async function generatePresignedUrl(
  _env: WorkerBindings,
  key: string,
  _method: 'PUT' = 'PUT',
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  // For Cloudflare R2, we need to use the S3-compatible API
  // This is a simplified version - in production, you'd use AWS SDK or similar
  // For now, we'll return a URL that the Worker can proxy
  
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn
  const url = `https://api.leiasabores.pt/api/r2/upload/${key}?expires=${expiresAt}`

  return url
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key)
}

/**
 * Get file from R2
 */
export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<{
  body: ReadableStream
  key: string
  size: number
  etag: string
  httpEtag: string
  uploaded: Date
  httpMetadata?: {
    contentType?: string
    cacheControl?: string
  }
  customMetadata?: Record<string, string>
} | null> {
  return await bucket.get(key) as any
}

/**
 * List files in R2 with prefix
 */
export async function listR2Files(
  bucket: R2Bucket,
  prefix: string,
  limit: number = 1000
): Promise<{ objects: R2Object[]; truncated: boolean; cursor?: string; delimitedPrefixes: string[] }> {
  return await bucket.list({
    prefix,
    limit,
  })
}

/**
 * Generate unique key for product image
 */
export function generateProductImageKey(productId: string, filename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = filename.split('.').pop() || 'jpg'
  return `products/${productId}/${timestamp}-${random}.${ext}`
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
    }
  }

  return { valid: true }
}

