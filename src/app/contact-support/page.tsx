"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import CreatorNavbar from "@/components/CreatorNavbar";
import Footer from "@/components/Footer";
// import Footer from "@/components/Footer";
const contactEmail = "support@reachly.pk";
const contactPhone = "+92 331 0448857";
const contactAddress = "45-D Toheed Park Gulshan-e-Ravi, Lahore";

export default function ContactSupportPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  // Prefill from ?fullName=&email=&subject= (used by the /rejected screen)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setForm((f) => ({
      ...f,
      fullName: q.get("fullName") || f.fullName,
      email: q.get("email") || f.email,
      subject: q.get("subject") || f.subject,
    }));
  }, []);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send your message.");
      }

      setForm({ fullName: "", email: "", subject: "", message: "" });
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send your message.",
      );
      setStatus("error");
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#070b19] bg-cover bg-center bg-no-repeat text-[#0c2523]"
      style={{ backgroundImage: "url('/assets/new-bg-image.png')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#050d2e]/40 backdrop-blur-xs" />
      <div className="relative z-10">
        <CreatorNavbar />

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:px-8">
          <div className="grid overflow-hidden rounded-[28px] bg-[#f8f8f7] shadow-2xl lg:grid-cols-[0.82fr_1.48fr]">
            <aside className="relative overflow-hidden bg-[linear-gradient(155deg,#011F7A_0%,#011139_32%,#4E1F40_68%,#684D6E_100%)] px-7 py-10 text-white sm:px-10 sm:py-12">
              <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#684D6E]/30 blur-3xl" />
              <div className="relative">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#a6d9d0]">
                  Reachly Support
                </p>
                <h1 className="font-anton text-4xl leading-tight sm:text-5xl">
                  Get In Touch
                </h1>
                <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
                  We are here to help you connect, book, and grow.
                </p>

                <div className="mt-10 space-y-7 text-sm">
                  <div className="flex gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e4f4f1] text-[#087b70]"
                      aria-hidden="true"
                    >
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Email us</p>
                      <Link
                        href={`mailto:${contactEmail}`}
                        className="mt-1 block text-white/70 hover:text-white"
                      >
                        {contactEmail}
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e4f4f1] text-[#087b70]"
                      aria-hidden="true"
                    >
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Call us</p>
                      <Link
                        href={`tel:${contactPhone.replaceAll(" ", "")}`}
                        className="mt-1 block text-white/70 hover:text-white"
                      >
                        {contactPhone}
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e4f4f1] text-[#087b70]"
                      aria-hidden="true"
                    >
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Address</p>
                      <p className="mt-[2px] max-w-xs leading-6 text-white/70">
                        {contactAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section className="px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#087b70]">
                Contact support
              </p>
              <h2 className="mt-2 font-anton text-4xl leading-tight text-[#063f3b] sm:text-5xl">
                Send Us a Message
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Fill out the form below, and our team will get back to you soon.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-xs font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                    <input
                      required
                      value={form.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      placeholder="Enter your full name"
                      className="mt-2 w-full border-b border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#087b70]"
                    />
                  </label>
                  <label className="text-xs font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="Enter your email"
                      className="mt-2 w-full border-b border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#087b70]"
                    />
                  </label>
                </div>
                <label className="block text-xs font-medium text-gray-700">
                  Subject <span className="text-red-500">*</span>
                  <input
                    required
                    value={form.subject}
                    onChange={(event) =>
                      updateField("subject", event.target.value)
                    }
                    placeholder="Enter your subject"
                    className="mt-2 w-full border-b border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#087b70]"
                  />
                </label>
                <label className="block text-xs font-medium text-gray-700">
                  Message <span className="text-red-500">*</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    placeholder="Enter your message"
                    className="mt-2 w-full resize-y border-b border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#087b70]"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="rounded-full bg-[#012180] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#063f3b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending..." : "Send Message"}
                  </button>
                  {status === "success" && (
                    <p className="text-sm text-emerald-700" role="status">
                      Thanks, your message has been sent.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-sm text-red-600" role="alert">
                      {errorMessage}
                    </p>
                  )}
                </div>
              </form>
            </section>
          </div>
        </main>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
