"use client";

import { FormEvent, useState } from "react";
import FormInput from "@/components/FormInput";

const empty = { fullName: "", email: "", subject: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send your message.");
      setForm(empty);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send your message.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput label="Full Name" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Enter your full name" />
        <FormInput label="Email" required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Enter your email" />
      </div>
      <FormInput label="Subject" required value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Enter your subject" />
      <label className="block text-xs font-medium text-gray-700">
        Message <span className="text-red-500">*</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Enter your message"
          className="mt-2 w-full resize-y border-b border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#087b70]"
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-[#012180] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#063f3b] disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
        {status === "success" && <p className="text-sm text-emerald-700" role="status">Thanks, your message has been sent.</p>}
        {status === "error" && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </div>
    </form>
  );
}
