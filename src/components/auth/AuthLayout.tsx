import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeroImage from '@/app/components/HeroImage';

interface AuthLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-2">
      <section className="flex min-h-screen flex-col justify-between bg-white px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        <div className="mb-6 sm:mb-8">
          <Link href="/" aria-label="Reachly home" className="inline-flex">
            <Image
              src="/assets/logo1.png"
              alt="Reachly"
              width={120}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>
        </div>

        <div className="my-auto w-full max-w-[400px] self-center">{children}</div>

        {footer ? (
          <div className="mt-8 border-t border-gray-100 pt-4 text-center">{footer}</div>
        ) : (
          <div className="mt-8 pt-4" />
        )}
      </section>

      <aside className="relative hidden min-h-screen lg:block">
        <HeroImage className="absolute inset-0 h-full w-full" />
      </aside>
    </main>
  );
}
