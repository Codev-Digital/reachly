import Link from 'next/link';

export default function CheckoutCancelledPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F8FA] px-4">
      <section className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-950">Checkout cancelled</h1>
        <p className="mt-3 text-sm text-gray-600">Your payment was not completed. You can return and try again.</p>
        <Link href="/explore-creators" className="mt-6 inline-flex rounded-full bg-[#0012FF] px-6 py-3 text-sm font-bold text-white">
          Continue browsing
        </Link>
      </section>
    </main>
  );
}
