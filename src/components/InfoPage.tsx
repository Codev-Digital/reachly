import Link from "next/link";
import CreatorNavbar from "@/components/CreatorNavbar";
import Footer from "@/components/Footer";

export type InfoSection = { title: string; items?: string[]; text?: string };

export default function InfoPage({ title, intro, sections }: { title: string; intro: string; sections: InfoSection[] }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#070b19] bg-cover bg-center" style={{ backgroundImage: "url('/assets/new-bg-image.png')" }}>
      <div className="pointer-events-none absolute inset-0 bg-[#050d2e]/40" />
      <div className="relative z-10">
        <CreatorNavbar />
        <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
          <header className="text-center text-white">
            <p className="mb-3 text-xs uppercase tracking-widest text-white/80">Reachly</p>
            <h1 className="font-anton text-5xl leading-tight sm:text-7xl">{title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-white/90">{intro}</p>
          </header>
          <div className="mt-12 space-y-4 rounded-[28px] bg-[#f8f8f7] p-6 shadow-2xl sm:p-10">
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="font-anton text-2xl text-[#011F7A]">{s.title}</h2>
                {s.text && <p className="mt-2 text-sm leading-6 text-gray-600">{s.text}</p>}
                {s.items && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-600">
                    {s.items.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                )}
              </section>
            ))}
            <p className="border-t pt-4 text-sm text-gray-600">
              Questions? <Link href="/contact-support" className="text-[#012180] underline">Contact support</Link>.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
