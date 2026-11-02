import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import CreatorNavbar from "@/components/CreatorNavbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";


const values = [
  { title: "Real access", text: "Book one-on-one video sessions with creators you follow and learn from." },
  { title: "Verified creators", text: "Every creator is reviewed by our team before their profile goes live." },
  { title: "Fair for creators", text: "Creators set their own sessions, prices and availability, and get paid to their bank account." },
];


export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#070b19] bg-cover bg-center" style={{ backgroundImage: "url('/assets/new-bg-image.png')" }}>
      <div className="pointer-events-none absolute inset-0 bg-[#050d2e]/40" />
      <div className="relative z-10">
        <CreatorNavbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
          <section className="text-center text-white">
            <p className="mb-3 text-xs uppercase tracking-widest text-white/80">Reachly</p>
            <h1 className="font-anton text-5xl leading-tight sm:text-7xl">About Us</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-white/90">
              Reachly connects people with the creators they admire through paid, bookable video sessions, so
              advice, mentorship and conversation are one booking away.
            </p>
          </section>
          
          <section className="mt-12 grid gap-4 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white/95 p-6 shadow-lg">
                <h3 className="font-anton text-xl text-[#011F7A]">{v.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{v.text}</p>
              </div>
            ))}
          </section>

          <section id="contact" className="mt-12 grid overflow-hidden rounded-[28px] bg-[#f8f8f7] shadow-2xl lg:grid-cols-[0.8fr_1.4fr]">
            <aside className="bg-[linear-gradient(155deg,#011F7A_0%,#011139_32%,#4E1F40_68%,#684D6E_100%)] px-7 py-10 text-white sm:px-10">
              <h2 className="font-anton text-4xl">Get In Touch</h2>
              <p className="mt-3 text-sm text-white/70">Questions, feedback or partnership ideas? We&apos;d love to hear from you.</p>
              <ul className="mt-8 space-y-5 text-sm text-white/80">
                <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0" /><Link href="mailto:support@reachly.pk">support@reachly.pk</Link></li>
                <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0" /><Link href="tel:+923310448857">+92 331 0448857</Link></li>
                <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0" />45-D Toheed Park Gulshan-e-Ravi, Lahore</li>
              </ul>
            </aside>
            <div className="px-6 py-10 sm:px-10">
              <h2 className="font-anton text-4xl text-[#063f3b]">Send Us a Message</h2>
              <p className="mb-8 mt-2 text-sm text-gray-500">Fill out the form and our team will get back to you soon.</p>
              <ContactForm />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
