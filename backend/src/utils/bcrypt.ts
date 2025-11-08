/**
 * Password hashing utilities using Web Crypto API
 * PBKDF2 with SHA-256 is a secure alternative to bcrypt in Cloudflare Workers
 */

/**
 * Hash password using Web Crypto API (PBKDF2)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))
  
  // Import password as key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  // Derive key using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  
  // Convert to hex strings
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `${saltHex}:${hashHex}`
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split(':')
  
  if (parts.length !== 2) {
    return false
  }
  
  const [saltHex, hashHex] = parts
  
  if (!saltHex || !hashHex) {
    return false
  }
  
  // Convert salt from hex to Uint8Array
  const salt = Uint8Array.from(
    saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  )
  
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  
  // Import password as key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  // Derive key using same parameters
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  
  // Compare hashes
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return computedHash === hashHex
}

