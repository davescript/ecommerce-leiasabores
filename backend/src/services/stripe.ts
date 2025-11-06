import Stripe from 'stripe'
import type { WorkerBindings } from '../types/bindings'

export function getStripe(env: WorkerBindings) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY binding')
  }

  // Validar formato da chave
  if (!env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    throw new Error('Invalid STRIPE_SECRET_KEY format. Must start with sk_test_ or sk_live_')
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 2,
    timeout: 30000,
  })
}
