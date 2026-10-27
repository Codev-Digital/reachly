This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Session payments

Paid session bookings support embedded Stripe Checkout and manual EasyPaisa/JazzCash transfer proof. Configure:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Create a **private** Supabase Storage bucket named `payment-proofs` (or set `SUPABASE_PAYMENT_PROOFS_BUCKET`). Manual payment screenshots are stored privately; administrators see short-lived signed links on the Payments Management page. EasyPaisa/JazzCash bookings remain pending until an administrator reviews the proof.

The EasyPaisa/JazzCash account details currently shown in checkout are demo placeholders and must be replaced with verified merchant details before accepting real transfers.

Event ticket purchases continue to use Stripe-hosted Checkout.

For local development, use Stripe test keys and forward Checkout events to the app:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Add the deployed `/api/stripe/webhook` endpoint in the Stripe Dashboard and subscribe it to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.expired`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
