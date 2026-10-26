'use client';

import { useState } from 'react';
import Link from 'next/link';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

export default function HowItWorksPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up in under 30 seconds with your phone number or email. No lengthy forms, no unnecessary questions. Just tell us what you are looking for.',
      icon: 'user'
    },
    {
      number: 2,
      title: 'Find Your Creator',
      description: 'Browse creators by category, price, or rating. Read verified reviews, watch their content, and find someone who truly understands your goals.',
      icon: 'search'
    },
    {
      number: 3,
      title: 'Pick a Session Type',
      description: 'Each creator offers multiple session types. Choose from quick consultations to deep coaching sessions, priced transparently in PKR.',
      icon: 'calendar'
    },
    {
      number: 4,
      title: 'Pay and Confirm',
      description: 'Complete your payment on Stripe-hosted Checkout using a supported card. Your booking is confirmed once Stripe verifies the payment.',
      icon: 'credit-card'
    },
    {
      number: 5,
      title: 'Join Your Video Call',
      description: 'Show up at the time on our video call platform. Take notes, ask questions, and get personalized guidance from your chosen creator!',
      icon: 'video'
    }
  ];

  const features = [
    {
      icon: 'shield',
      title: 'Verified Creators Only',
      description: 'Every creator on our platform is identity-verified and vetted for quality. No fake profiles, no empty promises, only real expertise you can trust.'
    },
    {
      icon: 'lock',
      title: 'Secure Stripe Checkout',
      description: 'Pay on Stripe-hosted Checkout with supported card methods. Reachly does not store your card details.'
    },
    {
      icon: 'clock',
      title: 'Flexible Scheduling',
      description: 'Book sessions that fit your life. Most creators offer evening and weekend slots. Reschedule up to 24 hours before your call with no penalty.'
    },
    {
      icon: 'bank',
      title: 'Money-Back Guarantee',
      description: 'Not satisfied with your session? Report it within 24 hours and we will issue a full refund, no questions asked. Your trust is our priority.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#F9F6F2]">
      <CreatorNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero Section */}
       <section className="mb-16">
  <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6 sm:p-8 overflow-hidden">
    
    <div className="grid md:grid-cols-2 gap-8 items-center">

      {/* TEXT SIDE */}
      <div className="flex-1">
        <div className="text-[#C8A97E] text-xs font-sans uppercase tracking-widest mb-2">
          Simple & Straightforward
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-[#F9F6F2]">
          How <span className="text-[#C8A97E]">Reachly</span> Works
        </h1>

        <p className="text-white/70 text-sm sm:text-base">
          Booking a session with your favorite creator is as easy as ordering food online. Here is the complete walkthrough in five simple steps.
        </p>
      </div>

      {/* IMAGE SIDE */}
      <div className="relative h-48 sm:h-64 flex items-end justify-end">

        {/* Back image */}
        <img
          src="/merium-footer.png"
          alt="Creator 1"
          className="h-40 sm:h-56 object-contain absolute bottom-0 right-16 sm:right-44 z-0"
        />

        {/* Front image */}
        <img
          src="/sara khan.png"
          alt="Creator 2"
          className="h-40 sm:h-56 object-contain relative z-10"
        />

      </div>

    </div>
  </div>
</section>

        {/* Steps Section */}
        <section className="mb-16">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden"
              >
                <button 
                  onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[rgba(200,169,126,0.05)] transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                      <span className="font-serif text-xl font-bold text-[#C8A97E]">{step.number}</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-white">{step.title}</h3>
                      {expandedStep === index && (
                        <p className="text-white/70 text-sm mt-2">{step.description}</p>
                      )}
                    </div>
                  </div>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#C8A97E" 
                    strokeWidth="2"
                    className={`transition-transform ${expandedStep === index ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              What <span className="text-[#C8A97E]">You Get</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
                <div className="w-14 h-14 rounded-full bg-[rgba(200,169,126,0.1)] flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                    {feature.icon === 'shield' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                    {feature.icon === 'lock' && (
                      <>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </>
                    )}
                    {feature.icon === 'clock' && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </>
                    )}
                    {feature.icon === 'bank' && (
                      <>
                        <path d="M3 21h18" />
                        <path d="M3 10h18" />
                        <path d="M5 6l7-3 7 3" />
                        <path d="M4 10v11" />
                        <path d="M20 10v11" />
                      </>
                    )}
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
       <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
    <div className="relative bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 sm:p-10 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 items-center">

        {/* TEXT SIDE */}
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F6F2] mb-3">
            <span className="text-[#C8A97E]">Ready</span> to connect?
          </h2>

          <p className="font-sans text-sm text-[#F9F6F2]/70 mb-6">
            Join thousands of Pakistanis learning from their favourite creators
          </p>

          <Link
            href="/welcome"
            className="inline-block bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* IMAGE SIDE */}
        <div className="relative h-48 sm:h-64 flex items-end justify-end">

          {/* Back image */}
          <img
            src="/merium-footer.png"
            alt="Merium"
            className="h-40 sm:h-56 object-contain absolute bottom-0 right-16 sm:right-40 z-0"
          />

          {/* Front image */}
          <img
            src="/sara khan.png"
            alt="Sara Khan"
            className="h-40 sm:h-56 object-contain relative z-10"
          />

        </div>
      </div>
    </div>
  </div>
</section>
      </main>

      <Footer />
    </div>
  );
}
