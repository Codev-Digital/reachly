import Link from "next/link";
import CreatorNavbar from "@/components/CreatorNavbar";
import Footer from "@/components/Footer";

const steps = [
  { title: "Create your account", text: "Sign up with your email, verify it with the OTP we send, then set your password. Choose “I’m a creator” on the welcome screen." },
  { title: "Build your profile", text: "Add a cover photo, display name, unique username, short tagline, detailed bio, city, country, languages and your niches. This is what fans see in Explore." },
  { title: "Set up your sessions", text: "Create the session types you offer (e.g. quick chat, deep-dive), each with its own duration and price in PKR." },
  { title: "Set your availability", text: "Pick the weekdays and hours you are free and your booking settings. Fans can only book inside these slots." },
  { title: "Preview your profile", text: "Check how your sessions, weekly availability and profile look before submitting." },
  { title: "Verify & add payout details", text: "Submit your ID (front and back) and your bank account details, and choose a payout frequency. Our team reviews every creator." },
  { title: "Go live", text: "Once approved, activate your profile. You get a personal booking link to share on all your socials." },
];

const platform = [
  { title: "Dashboard & Calendar", text: "See upcoming bookings, earnings and views. Reschedule or cancel from the calendar." },
  { title: "Bookings & Video calls", text: "Fans pay on Stripe Checkout; the booking is confirmed once payment clears. Join the session from your bookings on the Reachly video call." },
  { title: "Chats", text: "Message fans who booked with you." },
  { title: "Events & Packages", text: "Host events and sell session packages alongside your one-on-one sessions." },
  { title: "Wallet & Payouts", text: "Track your earnings and request payouts to your bank account." },
  { title: "Reviews & Analytics", text: "Collect reviews after sessions and watch how your profile performs." },
];

const tips = [
  "Use a clear, well-lit cover photo and a bio that says exactly what fans will get.",
  "Keep your availability up to date. Missed sessions hurt your rating.",
  "Join on time and follow our Guidelines and Cancellation Policy.",
  "Share your booking link on your socials to bring your audience over.",
];

export default function ForCreatorsPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#070b19] bg-cover bg-center" style={{ backgroundImage: "url('/assets/new-bg-image.png')" }}>
      <div className="pointer-events-none absolute inset-0 bg-[#050d2e]/40" />
      <div className="relative z-10">
        <CreatorNavbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
          <section className="text-center text-white">
            <p className="mb-3 text-xs uppercase tracking-widest text-white/80">Reachly</p>
            <h1 className="font-anton text-5xl leading-tight sm:text-7xl">For Creators</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-white/90">
              Turn your audience into paid one-on-one sessions. Here is how to join and get the most out of Reachly.
            </p>
            <Link href="/signup" className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#001F7D] hover:bg-white/90">
              Become a Creator
            </Link>
          </section>
          
          <section className="mt-14 rounded-[28px] bg-[#f8f8f7] p-6 shadow-2xl sm:p-10">
            <h2 className="font-anton text-3xl text-[#011F7A] sm:text-4xl">Get started in 7 steps</h2>
            <ol className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#012180] text-sm font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="font-anton text-3xl text-white sm:text-4xl">Around the platform</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platform.map((p) => (
                <div key={p.title} className="rounded-2xl bg-white/95 p-6 shadow-lg">
                  <h3 className="font-anton text-xl text-[#011F7A]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-[28px] bg-[#f8f8f7] p-6 shadow-2xl sm:p-10">
            <h2 className="font-anton text-3xl text-[#011F7A]">Tips for success</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">
              {tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className="mt-6 text-sm text-gray-600">
              Stuck? Read the <Link href="/guidelines" className="text-[#012180] underline">Guidelines</Link> or{" "}
              <Link href="/about#contact" className="text-[#012180] underline">contact us</Link>.
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
