import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton, Poppins } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/SessionProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reachly",
  description: "Connect with amazing creators",
  icons: {
    icon: "/favicon1.png",
  },
};

import GlobalPresence from "@/components/GlobalPresence";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <GlobalPresence />
          <LoadingProvider>{children}</LoadingProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
