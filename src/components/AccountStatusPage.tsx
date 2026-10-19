"use client";

import { useEffect, useState } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";
import StatusNotice from "@/components/StatusNotice";

export default function AccountStatusPage({
  title,
  message,
  subject,
}: {
  title: string;
  message: string;
  subject: string;
}) {
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, reqRes] = await Promise.all([fetch("/api/user/me"), fetch("/api/user-approval-request")]);
        if (meRes.ok) setMe((await meRes.json()).user);
        if (reqRes.ok) setReason((await reqRes.json()).request?.rejectionReason || "");
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingAnimation />;

  const params = new URLSearchParams({ fullName: me?.name || "", email: me?.email || "", subject });
  return (
    <StatusNotice title={title} message={message} reason={reason} supportHref={`/contact-support?${params.toString()}`} />
  );
}
