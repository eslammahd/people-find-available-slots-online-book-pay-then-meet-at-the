import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const DURATION_OPTIONS = [
  { minutes: 30, label: '30 minutes' },
  { minutes: 45, label: '45 minutes' },
  { minutes: 60, label: '1 hour' },
  { minutes: 90, label: '1.5 hours' },
  { minutes: 120, label: '2 hours' },
];

export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
