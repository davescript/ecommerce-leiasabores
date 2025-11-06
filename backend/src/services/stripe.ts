import Stripe from 'stripe'
import type { WorkerBindings } from '../types/bindings'

export function getStripe(env: WorkerBindings) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY binding')
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })
}
