import Stripe from 'stripe';

let stripe: Stripe | undefined;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }

  stripe ??= new Stripe(secretKey);
  return stripe;
}
