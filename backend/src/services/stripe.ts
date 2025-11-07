import Stripe from 'stripe'
import type { WorkerBindings } from '../types/bindings'

export function getStripe(env: WorkerBindings) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY binding')
  }

  // Validar formato da chave (aceita secret keys 'sk_' e restricted keys 'rk_')
  if (!env.STRIPE_SECRET_KEY.startsWith('sk_') && !env.STRIPE_SECRET_KEY.startsWith('rk_')) {
    throw new Error('Invalid STRIPE_SECRET_KEY format. Must start with sk_test_, sk_live_, rk_test_, or rk_live_')
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 2,
    timeout: 30000,
  })
}
