// Tipos mínimos para Cloudflare Workers (quando @cloudflare/workers-types não está instalado)
// Estes tipos são simplificados e servem apenas para satisfazer o TypeScript durante o desenvolvimento.

interface R2HTTPMetadata {
  contentType?: string
  contentDisposition?: string
  cacheControl?: string
}

interface R2ObjectBody {
  body: ReadableStream<Uint8Array> | null
  httpMetadata?: R2HTTPMetadata
  writeHttpMetadata(headers: Headers): void
}

interface R2Object extends R2ObjectBody {
  key: string
  size: number
  uploaded: string
}

interface R2GetOptions {
  range?: {
    offset?: number
    length?: number
  }
  onlyIf?: {
    etagMatches?: string | string[]
    etagDoesNotMatch?: string | string[]
    uploadedAfter?: Date
    uploadedBefore?: Date
  }
}

interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata
}

interface R2ListOptions {
  prefix?: string
  limit?: number
  cursor?: string
}

interface R2ListResult {
  objects: R2Object[]
  truncated: boolean
  cursor?: string
}

interface R2Bucket {
  get(key: string, options?: R2GetOptions): Promise<R2Object | null>
  put(key: string, value: ArrayBuffer | ReadableStream | string, options?: R2PutOptions): Promise<void>
  delete(key: string | string[]): Promise<void>
  list(options?: R2ListOptions): Promise<R2ListResult>
}

interface D1Database {
  // Interface simplificada; drizzle/orm lida com prepare/exec internamente
}
